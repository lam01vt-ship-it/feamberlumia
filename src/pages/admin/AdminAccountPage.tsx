import { useCallback, useEffect, useState } from 'react'
import * as tosixApi from '../../api/tosixApi'
import { messageFromApiError } from '../../api/apiError'
import { useAdminToast } from '../../components/AdminToast'
import { useAuth } from '../../auth/AuthContext'
import type { UserSummary } from '../../types/api'

export function AdminAccountPage() {
  const { showSuccess } = useAdminToast()
  const { user, refreshMe } = useAuth()
  const [profile, setProfile] = useState({ fullName: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [users, setUsers] = useState<UserSummary[]>([])
  const [newUser, setNewUser] = useState({ email: '', fullName: '', password: '' })
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setUsers(await tosixApi.adminListUsers())
  }, [])

  useEffect(() => {
    if (user) {
      setProfile({ fullName: user.fullName, email: user.email })
    }
  }, [user])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  function clearMessages() {
    setError(null)
  }

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    clearMessages()
    try {
      await tosixApi.updateProfile(profile)
      await refreshMe()
      showSuccess('Đã cập nhật thông tin tài khoản.')
    } catch (err) {
      setError(messageFromApiError(err, 'Cập nhật thất bại.'))
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault()
    clearMessages()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp.')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.')
      return
    }
    try {
      await tosixApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showSuccess('Đã đổi mật khẩu.')
    } catch (err) {
      setError(messageFromApiError(err, 'Đổi mật khẩu thất bại.'))
    }
  }

  async function onCreateUser(e: React.FormEvent) {
    e.preventDefault()
    clearMessages()
    if (newUser.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.')
      return
    }
    try {
      await tosixApi.adminCreateUser(newUser)
      setNewUser({ email: '', fullName: '', password: '' })
      await loadUsers()
      showSuccess('Đã tạo tài khoản admin mới.')
    } catch (err) {
      setError(messageFromApiError(err, 'Tạo tài khoản thất bại.'))
    }
  }

  async function onResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!resetPasswordId) return
    clearMessages()
    if (resetPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.')
      return
    }
    try {
      await tosixApi.adminResetUserPassword(resetPasswordId, resetPassword)
      setResetPasswordId(null)
      setResetPassword('')
      showSuccess('Đã đặt lại mật khẩu.')
    } catch (err) {
      setError(messageFromApiError(err, 'Đặt lại mật khẩu thất bại.'))
    }
  }

  async function onDeleteUser(id: string, email: string) {
    if (!window.confirm(`Xóa tài khoản ${email}?`)) return
    clearMessages()
    try {
      await tosixApi.adminDeleteUser(id)
      await loadUsers()
      showSuccess('Đã xóa tài khoản.')
    } catch (err) {
      setError(messageFromApiError(err, 'Xóa tài khoản thất bại.'))
    }
  }

  return (
    <div className="tosix-admin-page">
      <h1>Tài khoản quản trị</h1>

      {error ? <p className="tosix-alert">{error}</p> : null}

      <form className="tosix-form" onSubmit={onSaveProfile}>
        <h2 className="tosix-admin-form-section">Thông tin của tôi</h2>
        <div className="tosix-form-grid">
          <label className="tosix-field">
            Họ tên
            <input
              className="tosix-input"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              required
            />
          </label>
          <label className="tosix-field">
            Email đăng nhập
            <input
              className="tosix-input"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
          </label>
        </div>
        <button type="submit" className="tosix-btn tosix-btn--primary">
          Lưu thông tin
        </button>
      </form>

      <form className="tosix-form" onSubmit={onChangePassword}>
        <h2 className="tosix-admin-form-section">Đổi mật khẩu</h2>
        <div className="tosix-form-grid">
          <label className="tosix-field">
            Mật khẩu hiện tại
            <input
              className="tosix-input"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              autoComplete="current-password"
              required
            />
          </label>
          <label className="tosix-field">
            Mật khẩu mới
            <input
              className="tosix-input"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
          <label className="tosix-field">
            Xác nhận mật khẩu mới
            <input
              className="tosix-input"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
        </div>
        <button type="submit" className="tosix-btn tosix-btn--primary">
          Đổi mật khẩu
        </button>
      </form>

      <section className="tosix-form">
        <h2 className="tosix-admin-form-section">Quản lý tài khoản admin</h2>
        <p className="tosix-muted tosix-admin-form-hint-block">Thêm hoặc xóa tài khoản quản trị khác.</p>

        <form className="tosix-form-grid" onSubmit={onCreateUser}>
          <label className="tosix-field">
            Email
            <input
              className="tosix-input"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
          </label>
          <label className="tosix-field">
            Họ tên
            <input
              className="tosix-input"
              value={newUser.fullName}
              onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
              required
            />
          </label>
          <label className="tosix-field">
            Mật khẩu
            <input
              className="tosix-input"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
              minLength={8}
            />
          </label>
          <div className="tosix-form-actions">
            <button type="submit" className="tosix-btn tosix-btn--secondary">
              Thêm tài khoản
            </button>
          </div>
        </form>

        <div className="tosix-table-wrap">
          <table className="tosix-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Họ tên</th>
                <th>Vai trò</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.fullName}</td>
                  <td>{u.roles.join(', ')}</td>
                  <td>
                    <div className="tosix-table-actions-cell">
                      <button
                        type="button"
                        className="tosix-btn tosix-btn--ghost tosix-btn--sm"
                        onClick={() => {
                          setResetPasswordId(u.id)
                          setResetPassword('')
                          clearMessages()
                        }}
                      >
                        Đặt lại MK
                      </button>
                      {u.id !== user?.id ? (
                        <button
                          type="button"
                          className="tosix-btn tosix-btn--ghost tosix-btn--sm"
                          onClick={() => void onDeleteUser(u.id, u.email)}
                        >
                          Xóa
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {resetPasswordId ? (
          <form className="tosix-form tosix-admin-reset-password" onSubmit={onResetPassword}>
            <p className="tosix-admin-form-hint">
              Đặt mật khẩu mới cho <strong>{users.find((u) => u.id === resetPasswordId)?.email}</strong>
            </p>
            <div className="tosix-form-grid">
              <label className="tosix-field">
                Mật khẩu mới
                <input
                  className="tosix-input"
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </label>
              <div className="tosix-form-actions">
                <button type="submit" className="tosix-btn tosix-btn--primary tosix-btn--sm">
                  Lưu mật khẩu
                </button>
                <button
                  type="button"
                  className="tosix-btn tosix-btn--ghost tosix-btn--sm"
                  onClick={() => setResetPasswordId(null)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  )
}
