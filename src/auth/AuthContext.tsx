import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { UserSummary } from '../types/api'
import * as tosixApi from '../api/tosixApi'

type AuthState = {
  user: UserSummary | null
  token: string | null
  ready: boolean
  isAdmin: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)
const TOKEN_KEY = 'tosix_token'

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<UserSummary | null>(null)
  const [ready, setReady] = useState(false)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const refreshMe = useCallback(async () => {
    if (!getStoredToken()) {
      setUser(null)
      return
    }
    const me = await tosixApi.fetchMe()
    setUser(me)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!token) {
        setReady(true)
        return
      }
      try {
        const me = await tosixApi.fetchMe()
        if (!cancelled) setUser(me)
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          sessionStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    const res = await tosixApi.login(email, password)
    if (!res.user.roles.includes('Admin')) {
      throw new Error('not admin')
    }

    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)

    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, res.accessToken)
    } else {
      sessionStorage.setItem(TOKEN_KEY, res.accessToken)
    }

    setToken(res.accessToken)
    setUser(res.user)
  }, [])

  const isAdmin = user?.roles.includes('Admin') ?? false

  const value = useMemo(
    () => ({ user, token, ready, isAdmin, login, logout, refreshMe }),
    [user, token, ready, isAdmin, login, logout, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
