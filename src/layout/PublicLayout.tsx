import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import * as tosixApi from '../api/tosixApi'
import { useAuth } from '../auth/AuthContext'
import { ProductsNavDropdown } from '../components/ProductsNavDropdown'
import { ZaloIcon } from '../components/ZaloIcon'
import type { Category, SiteSetting } from '../types/api'
import { resolveZaloUrl } from '../utils/zalo'
import { brandInitial, brandName } from '../utils/brand'

export function PublicLayout() {
  const { isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [settings, setSettings] = useState<SiteSetting | null>(null)
  const [searchDraft, setSearchDraft] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    void tosixApi.fetchSettings().then(setSettings)
    void tosixApi.fetchCategories().then(setCategories)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (location.pathname === '/san-pham') {
      setSearchDraft(new URLSearchParams(location.search).get('q') ?? '')
    }
  }, [location.pathname, location.search])

  const skipHeaderSearchRef = useRef(true)

  useEffect(() => {
    if (skipHeaderSearchRef.current) {
      skipHeaderSearchRef.current = false
      return
    }

    const timer = window.setTimeout(() => {
      const q = searchDraft.trim()
      const currentQ =
        location.pathname === '/san-pham' ? new URLSearchParams(location.search).get('q') ?? '' : null
      if (location.pathname === '/san-pham' && q === currentQ) return

      if (q) {
        navigate(`/san-pham?q=${encodeURIComponent(q)}`)
      } else if (location.pathname === '/san-pham') {
        navigate('/san-pham')
      }
      setMenuOpen(false)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [searchDraft, location.pathname, location.search, navigate])

  const closeMenu = () => setMenuOpen(false)

  const phone = settings?.phonePrimary.replace(/\s/g, '') ?? ''
  const zaloHref = settings ? resolveZaloUrl(settings.zaloUrl, settings.phonePrimary) : ''

  return (
    <div className="tosix-public">
      <header className="tosix-header">
        {settings ? (
          <div className="tosix-header-top">
            <div className="tosix-container tosix-header-top-inner">
              <p className="tosix-header-top-tagline">{settings.siteTagline ?? 'Tổng phân phối đèn trang trí, đồ nội thất'}</p>
              <div className="tosix-header-top-links">
                <a href={`tel:${phone}`} className="tosix-header-top-link">
                  <span aria-hidden="true">☎</span> {settings.phonePrimary}
                </a>
                {settings.phoneSecondary ? (
                  <a href={`tel:${settings.phoneSecondary.replace(/\s/g, '')}`} className="tosix-header-top-link">
                    {settings.phoneSecondary}
                  </a>
                ) : null}
                <a href={zaloHref} target="_blank" rel="noreferrer" className="tosix-header-top-link tosix-header-top-link--zalo">
                  <ZaloIcon size={16} /> Chat Zalo
                </a>
              </div>
            </div>
          </div>
        ) : null}

        <div className="tosix-header-main">
          <div className="tosix-container tosix-header-inner">
            <Link to="/" className="tosix-logo" onClick={closeMenu}>
              <span className="tosix-logo-mark" aria-hidden="true">
                {settings ? brandInitial(settings) : 'A'}
              </span>
              <span className="tosix-logo-text">
                <strong>{settings ? brandName(settings) : 'AmberLumia'}</strong>
                <small>{settings?.logoSubtitle ?? settings?.siteTagline ?? 'Đèn & nội thất cao cấp'}</small>
              </span>
            </Link>

            <div className="tosix-header-search">
              <input
                className="tosix-input tosix-header-search-input"
                type="search"
                value={searchDraft}
                placeholder="Tìm sản phẩm theo tên, mã…"
                aria-label="Tìm kiếm sản phẩm"
                onChange={(e) => setSearchDraft(e.target.value)}
              />
              <span className="tosix-header-search-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
            </div>

            {settings ? (
              <div className="tosix-header-actions">
                <a href={zaloHref} target="_blank" rel="noreferrer" className="tosix-header-btn tosix-header-btn--zalo">
                  <ZaloIcon size={18} />
                  <span>Zalo</span>
                </a>
                <a href={`tel:${phone}`} className="tosix-header-btn tosix-header-btn--call">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  <span>Gọi ngay</span>
                </a>
              </div>
            ) : null}

            <button
              type="button"
              className="tosix-menu-toggle"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>

            <nav className={`tosix-nav${menuOpen ? ' tosix-nav--open' : ''}`}>
              <Link to="/" onClick={closeMenu}>
                Trang chủ
              </Link>
              <ProductsNavDropdown categories={categories} onNavigate={closeMenu} />
              <Link to="/lien-he" onClick={closeMenu}>
                Liên hệ
              </Link>
              {settings ? (
                <a href={zaloHref} target="_blank" rel="noreferrer" className="tosix-nav-mobile-zalo" onClick={closeMenu}>
                  <ZaloIcon size={18} /> Chat Zalo
                </a>
              ) : null}
              {isAdmin ? (
                <Link to="/admin" onClick={closeMenu}>
                  Quản trị
                </Link>
              ) : (
                <Link to="/login" onClick={closeMenu}>
                  Đăng nhập
                </Link>
              )}
            </nav>
          </div>
        </div>

        {menuOpen ? (
          <button type="button" className="tosix-nav-backdrop" aria-label="Đóng menu" onClick={closeMenu} />
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      {settings ? (
        <div className="tosix-fab-group">
          <a href={zaloHref} target="_blank" rel="noreferrer" className="tosix-fab tosix-fab--zalo" aria-label="Chat Zalo">
            <ZaloIcon size={24} />
            <span>Zalo</span>
          </a>
          <a href={`tel:${phone}`} className="tosix-fab tosix-fab--call" aria-label="Gọi điện tư vấn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            <span>Gọi ngay</span>
          </a>
        </div>
      ) : null}
    </div>
  )
}
