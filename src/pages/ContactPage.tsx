import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as tosixApi from '../api/tosixApi'
import type { SiteSetting } from '../types/api'
import { SiteFooter } from '../components/SiteFooter'
import { ZaloIcon } from '../components/ZaloIcon'
import { brandName } from '../utils/brand'
import { resolveZaloUrl } from '../utils/zalo'
import { imageUrl } from '../utils/format'

export function ContactPage() {
  const [settings, setSettings] = useState<SiteSetting | null>(null)

  useEffect(() => {
    void tosixApi.fetchSettings().then(setSettings)
  }, [])

  if (!settings) return <div className="tosix-loading">Đang tải…</div>

  const phone1 = settings.phonePrimary.replace(/\s/g, '')
  const phone2 = settings.phoneSecondary?.replace(/\s/g, '')
  const zaloHref = resolveZaloUrl(settings.zaloUrl, settings.phonePrimary)

  return (
    <div>
      <section className="tosix-page-hero">
        <div className="tosix-container">
          <span className="tosix-eyebrow">Liên hệ</span>
          <h1>Kết nối với {brandName(settings)}</h1>
          <p className="tosix-page-hero-desc">Chúng tôi sẵn sàng tư vấn và hỗ trợ bạn chọn sản phẩm phù hợp nhất.</p>
        </div>
      </section>
      <section className="tosix-section tosix-container">
        <div className="tosix-contact-card">
          <h2>{settings.companyName}</h2>
          <div className="tosix-contact-grid">
            <div className="tosix-contact-block">
              <span className="tosix-contact-label">Mã số thuế</span>
              <p>{settings.taxCode}</p>
            </div>
            <div className="tosix-contact-block">
              <span className="tosix-contact-label">Địa chỉ</span>
              <p>{settings.address}</p>
            </div>
            <div className="tosix-contact-block">
              <span className="tosix-contact-label">Email</span>
              <p>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </p>
            </div>
            <div className="tosix-contact-block">
              <span className="tosix-contact-label">Điện thoại</span>
              <p>
                <a href={`tel:${phone1}`} className="tosix-contact-phone">
                  {settings.phonePrimary}
                </a>
                {settings.phoneSecondary ? (
                  <>
                    <br />
                    <a href={`tel:${phone2}`} className="tosix-contact-phone">
                      {settings.phoneSecondary}
                    </a>
                  </>
                ) : null}
              </p>
            </div>
            <div className="tosix-contact-block">
              <span className="tosix-contact-label">Zalo</span>
              <p>
                <a href={zaloHref} target="_blank" rel="noreferrer" className="tosix-contact-zalo">
                  <ZaloIcon size={20} /> Chat tư vấn qua Zalo
                </a>
              </p>
            </div>
            {settings.facebookUrl ? (
              <div className="tosix-contact-block">
                <span className="tosix-contact-label">Fanpage</span>
                <p>
                  <a href={settings.facebookUrl} target="_blank" rel="noreferrer">
                    {settings.facebookUrl}
                  </a>
                </p>
              </div>
            ) : null}
          </div>
          {settings.zaloQrImagePath ? (
            <div className="tosix-contact-qr">
              <a href={zaloHref} target="_blank" rel="noreferrer" className="tosix-contact-qr-image">
                <img src={imageUrl(settings.zaloQrImagePath)} alt={`Mã QR Zalo ${brandName(settings)}`} loading="lazy" />
              </a>
              <p className="tosix-contact-qr-hint">
                <ZaloIcon size={18} /> Mở Zalo và quét mã để kết bạn &amp; nhận tư vấn
              </p>
            </div>
          ) : null}

          <div className="tosix-contact-actions">
            <a href={zaloHref} target="_blank" rel="noreferrer" className="tosix-btn tosix-btn--zalo">
              <ZaloIcon size={18} /> Chat Zalo
            </a>
            <a href={`tel:${phone1}`} className="tosix-btn tosix-btn--primary">
              Gọi ngay
            </a>
            <Link to="/san-pham" className="tosix-btn tosix-btn--secondary">
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter settings={settings} />
    </div>
  )
}
