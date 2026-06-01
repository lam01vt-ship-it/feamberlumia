import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { AdminToastProvider } from '../components/AdminToast'
import { useAuth } from '../auth/AuthContext'
import { DEFAULT_BRAND_NAME } from '../utils/brand'

const links = [
  { to: '/admin', label: 'Tổng quan', end: true },
  { to: '/admin/account', label: 'Tài khoản' },
  { to: '/admin/settings', label: 'Liên hệ & thông tin' },
  { to: '/admin/categories', label: 'Nhóm sản phẩm' },
  { to: '/admin/products', label: 'Sản phẩm' },
  { to: '/admin/banners', label: 'Banner' },
  { to: '/admin/feedback', label: 'Feedback ảnh' },
  { to: '/admin/reviews', label: 'Đánh giá KH' },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <AdminToastProvider>
    <div className="tosix-admin">
      <div className="tosix-admin-topbar">
        <button
          type="button"
          className="tosix-admin-menu-toggle"
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <span className="tosix-admin-topbar-title">Quản trị</span>
      </div>
      {sidebarOpen ? (
        <button type="button" className="tosix-admin-backdrop" aria-label="Đóng menu" onClick={closeSidebar} />
      ) : null}
      <aside className={`tosix-admin-sidebar${sidebarOpen ? ' tosix-admin-sidebar--open' : ''}`}>
        <div className="tosix-admin-brand">
          <Link to="/">{DEFAULT_BRAND_NAME}</Link>
          <small>Quản trị</small>
        </div>
        <nav>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              onClick={closeSidebar}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="tosix-admin-user">
          <Link to="/admin/account" className="tosix-admin-user-link" onClick={closeSidebar}>
            {user?.fullName}
          </Link>
          <button type="button" className="tosix-btn tosix-btn--ghost" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </aside>
      <div className="tosix-admin-main">
        <Outlet />
      </div>
    </div>
    </AdminToastProvider>
  )
}
