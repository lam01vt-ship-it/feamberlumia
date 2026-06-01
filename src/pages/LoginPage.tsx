import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DEFAULT_BRAND_NAME } from '../utils/brand'

export function LoginPage() {
  const { login, isAdmin, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    localStorage.removeItem('tosix_remember_email')
  }, [])

  function enableInput(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.removeAttribute('readonly')
  }

  if (ready && isAdmin) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await login(email, password, rememberMe)
      navigate(from, { replace: true })
    } catch {
      setError('Sai email hoặc mật khẩu hoặc tài khoản không phải admin.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tosix-login-page">
      <div className="tosix-login-card">
        <Link to="/" className="tosix-logo">
          {DEFAULT_BRAND_NAME}
        </Link>
        <h1>Đăng nhập quản trị</h1>
        <form onSubmit={onSubmit} autoComplete="off">
          <input type="text" name="fake-user" autoComplete="username" tabIndex={-1} aria-hidden="true" className="tosix-login-decoy" />
          <input type="password" name="fake-pass" autoComplete="current-password" tabIndex={-1} aria-hidden="true" className="tosix-login-decoy" />
          <label className="tosix-field">
            Email
            <input
              className="tosix-input"
              type="email"
              name="admin-login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              readOnly
              onFocus={enableInput}
              required
            />
          </label>
          <label className="tosix-field">
            Mật khẩu
            <input
              className="tosix-input"
              type="password"
              name="admin-login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              readOnly
              onFocus={enableInput}
              required
            />
          </label>          <label className="tosix-check tosix-login-remember">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            Ghi nhớ đăng nhập
          </label>
          {error ? <p className="tosix-alert">{error}</p> : null}
          <button type="submit" className="tosix-btn tosix-btn--primary" disabled={busy}>
            {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
        <Link to="/" className="tosix-link">
          ← Về trang chủ
        </Link>
      </div>
    </div>
  )
}
