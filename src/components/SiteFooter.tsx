import { Link } from 'react-router-dom'
import type { SiteSetting } from '../types/api'
import { mapsDirectionsUrl, mapsEmbedUrl } from '../utils/maps'
import { brandInitial, brandName } from '../utils/brand'
import { resolveZaloUrl } from '../utils/zalo'
import { ZaloIcon } from './ZaloIcon'

type SiteFooterProps = {
  settings: SiteSetting
}

export function SiteFooter({ settings }: SiteFooterProps) {
  const phone1 = settings.phonePrimary.replace(/\s/g, '')
  const phone2 = settings.phoneSecondary?.replace(/\s/g, '')
  const zaloHref = resolveZaloUrl(settings.zaloUrl, settings.phonePrimary)

  const brand = brandName(settings)

  return (
    <footer className="tosix-footer">
      <div className="tosix-footer-accent" />
      <div className="tosix-container">
        <div className="tosix-footer-main">
          <div className="tosix-footer-brand">
            <span className="tosix-footer-logo">
              <span className="tosix-footer-logo-mark" aria-hidden="true">
                {brandInitial(settings)}
              </span>
              {brand}
            </span>
            <p className="tosix-footer-tagline">{settings.siteTagline ?? 'Tổng phân phối đèn trang trí, đồ nội thất'}</p>
            <p className="tosix-footer-company">{settings.companyName}</p>
            <p className="tosix-footer-meta">MST: {settings.taxCode}</p>

            <ul className="tosix-footer-contacts">
              <li>
                <span className="tosix-footer-icon" aria-hidden="true">📍</span>
                <div>
                  <strong>Địa chỉ</strong>
                  <p>{settings.address}</p>
                  <a
                    href={mapsDirectionsUrl(settings.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="tosix-footer-map-link"
                  >
                    Chỉ đường trên Google Maps →
                  </a>
                </div>
              </li>
              <li>
                <span className="tosix-footer-icon" aria-hidden="true">☎</span>
                <div>
                  <strong>Hotline</strong>
                  <p>
                    <a href={`tel:${phone1}`}>{settings.phonePrimary}</a>
                    {settings.phoneSecondary ? (
                      <>
                        <br />
                        <a href={`tel:${phone2}`}>{settings.phoneSecondary}</a>
                      </>
                    ) : null}
                  </p>
                </div>
              </li>
              <li>
                <span className="tosix-footer-icon tosix-footer-icon--zalo" aria-hidden="true">
                  <ZaloIcon size={20} />
                </span>
                <div>
                  <strong>Zalo</strong>
                  <p>
                    <a href={zaloHref} target="_blank" rel="noreferrer">
                      Chat tư vấn qua Zalo
                    </a>
                  </p>
                </div>
              </li>
              <li>
                <span className="tosix-footer-icon" aria-hidden="true">✉</span>
                <div>
                  <strong>Email</strong>
                  <p>
                    <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="tosix-footer-aside">
            <div className="tosix-footer-links-card">
              <h3>Liên kết nhanh</h3>
              <Link to="/san-pham">Tất cả sản phẩm</Link>
              <Link to="/lien-he">Liên hệ & tư vấn</Link>
              {settings.facebookUrl ? (
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer">
                  Fanpage Facebook
                </a>
              ) : null}
              <a href={zaloHref} target="_blank" rel="noreferrer" className="tosix-footer-cta tosix-footer-cta--zalo">
                <ZaloIcon size={18} /> Chat Zalo
              </a>
              <a href={`tel:${phone1}`} className="tosix-footer-cta">
                Gọi tư vấn ngay
              </a>
            </div>

            <div className="tosix-footer-map-wrap">
              <h3>Bản đồ</h3>
              <div className="tosix-footer-map">
                <iframe
                  title={`Bản đồ ${brand}`}
                  src={mapsEmbedUrl(settings.address)}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
