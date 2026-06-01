import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type AdminToastContextValue = {
  showSuccess: (message?: string) => void
}

const AdminToastContext = createContext<AdminToastContextValue | null>(null)

export const ADMIN_UPDATE_SUCCESS_MESSAGE = 'Cập nhật thành công.'

const AUTO_DISMISS_MS = 3400

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  const showSuccess = useCallback((nextMessage = ADMIN_UPDATE_SUCCESS_MESSAGE) => {
    setVisible(false)
    setMessage(nextMessage)
  }, [])

  const dismiss = useCallback(() => {
    setVisible(false)
    window.setTimeout(() => setMessage(null), 220)
  }, [])

  useEffect(() => {
    if (!message) return
    const frame = window.requestAnimationFrame(() => setVisible(true))
    const id = window.setTimeout(dismiss, AUTO_DISMISS_MS)
    return () => {
      window.cancelAnimationFrame(frame)
      clearTimeout(id)
    }
  }, [message, dismiss])

  return (
    <AdminToastContext.Provider value={{ showSuccess }}>
      {children}
      {message
        ? createPortal(
            <div
              className={`tosix-admin-toast-overlay${visible ? ' tosix-admin-toast-overlay--visible' : ''}`}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="tosix-admin-toast-title"
              onClick={dismiss}
            >
              <div className="tosix-admin-toast" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="tosix-admin-toast-close" onClick={dismiss} aria-label="Đóng">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>

                <div className="tosix-admin-toast-icon-wrap">
                  <div className="tosix-admin-toast-icon-ring" aria-hidden="true" />
                  <div className="tosix-admin-toast-icon" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path
                        d="M7 14.5l4.2 4.2L21 9"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <p className="tosix-admin-toast-eyebrow">Thành công</p>
                <p id="tosix-admin-toast-title" className="tosix-admin-toast-message">
                  {message}
                </p>

                <div className="tosix-admin-toast-progress" aria-hidden="true">
                  <span className="tosix-admin-toast-progress-bar" style={{ animationDuration: `${AUTO_DISMISS_MS}ms` }} />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </AdminToastContext.Provider>
  )
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext)
  if (!ctx) {
    throw new Error('useAdminToast must be used within AdminToastProvider')
  }
  return ctx
}
