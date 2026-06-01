import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { token, ready } = useAuth()
  const location = useLocation()

  if (!ready) return <div className="tosix-loading">Đang tải…</div>
  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, ready } = useAuth()
  const location = useLocation()

  if (!ready) return <div className="tosix-loading">Đang tải…</div>
  if (!isAdmin) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}
