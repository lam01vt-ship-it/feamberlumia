import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Category } from '../types/api'
import { imageUrl } from '../utils/format'

type ProductsNavDropdownProps = {
  categories: Category[]
  onNavigate: () => void
}

export function ProductsNavDropdown({ categories, onNavigate }: ProductsNavDropdownProps) {
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const showMenu = useCallback(() => {
    cancelClose()
    setOpen(true)
  }, [cancelClose])

  const scheduleClose = useCallback(() => {
    cancelClose()
    closeTimer.current = window.setTimeout(() => setOpen(false), 280)
  }, [cancelClose])

  function handleNavigate() {
    setOpen(false)
    setMobileOpen(false)
    onNavigate()
  }

  return (
    <div
      className={`tosix-nav-dropdown${open ? ' tosix-nav-dropdown--open' : ''}${mobileOpen ? ' tosix-nav-dropdown--mobile-open' : ''}`}
      onMouseEnter={showMenu}
      onMouseLeave={scheduleClose}
    >
      <div className="tosix-nav-dropdown-head">
        <Link to="/san-pham" className="tosix-nav-dropdown-trigger" onClick={handleNavigate}>
          Sản phẩm
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </Link>
        <button
          type="button"
          className="tosix-nav-dropdown-mobile-btn"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Thu gọn danh mục' : 'Mở danh mục sản phẩm'}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d={mobileOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
          </svg>
        </button>
      </div>

      <div className="tosix-nav-dropdown-panel" role="menu" aria-label="Nhóm sản phẩm" onMouseEnter={showMenu}>
        <div className="tosix-nav-dropdown-inner">
          <div className="tosix-nav-dropdown-header">
            <div>
              <p className="tosix-nav-dropdown-eyebrow">Danh mục</p>
              <h3 className="tosix-nav-dropdown-title">Chọn nhóm sản phẩm</h3>
            </div>
            <Link to="/san-pham" className="tosix-nav-dropdown-all" onClick={handleNavigate} role="menuitem">
              Tất cả sản phẩm
            </Link>
          </div>

          <div className="tosix-nav-dropdown-grid">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/danh-muc/${c.slug}`}
                className="tosix-nav-dropdown-item"
                onClick={handleNavigate}
                role="menuitem"
              >
                <span className="tosix-nav-dropdown-item-thumb">
                  {c.imagePath ? (
                    <img src={imageUrl(c.imagePath)} alt="" loading="lazy" />
                  ) : (
                    <span className="tosix-nav-dropdown-item-fallback" aria-hidden="true">
                      {c.name.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="tosix-nav-dropdown-item-body">
                  <span className="tosix-nav-dropdown-item-name">{c.name}</span>
                  {c.productCount > 0 ? (
                    <span className="tosix-nav-dropdown-item-count">{c.productCount} sản phẩm</span>
                  ) : null}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
