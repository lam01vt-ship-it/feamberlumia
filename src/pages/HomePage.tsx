import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as tosixApi from '../api/tosixApi'
import { ClickableImage } from '../components/ClickableImage'
import { HomeCarousel } from '../components/HomeCarousel'
import { ImageLightbox, type LightboxItem } from '../components/ImageLightbox'
import { ProductCard } from '../components/ProductCard'
import { ProductDetailModal } from '../components/ProductDetailModal'
import { SiteFooter } from '../components/SiteFooter'
import type { HomePage } from '../types/api'
import { brandName } from '../utils/brand'
import { imageUrl } from '../utils/format'

export function HomePage() {
  const [data, setData] = useState<HomePage | null>(null)
  const [bannerIdx, setBannerIdx] = useState(0)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [galleryLightbox, setGalleryLightbox] = useState<{ items: LightboxItem[]; index: number } | null>(null)

  const load = useCallback(async () => {
    const home = await tosixApi.fetchHome()
    setData(home)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!data?.banners.length) return
    const timer = setInterval(() => {
      setBannerIdx((i) => (i + 1) % data.banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [data?.banners.length])

  const feedbackLightboxItems = useMemo<LightboxItem[]>(
    () =>
      data?.feedbackImages.map((f) => ({
        src: imageUrl(f.imagePath),
        alt: f.caption ?? 'Feedback khách hàng',
        title: f.caption ?? 'Hình ảnh feedback',
        caption: `Ảnh thực tế từ khách hàng ${brandName(data?.settings)}`,
      })) ?? [],
    [data?.feedbackImages, data?.settings],
  )

  const reviewLightboxItems = useMemo<LightboxItem[]>(
    () =>
      data?.customerReviews.map((r, i) => ({
        src: imageUrl(r.imagePath),
        alt: `Đánh giá khách hàng ${i + 1}`,
        title: 'Đánh giá của khách hàng',
        caption: `Cảm ơn quý khách đã tin tưởng ${brandName(data?.settings)}`,
      })) ?? [],
    [data?.customerReviews, data?.settings],
  )

  if (!data) return <div className="tosix-loading">Đang tải trang chủ…</div>

  const brand = brandName(data.settings)
  const trustItems = [
    { title: data.settings.trust1Title, text: data.settings.trust1Text, icon: '✦' },
    { title: data.settings.trust2Title, text: data.settings.trust2Text, icon: '☎' },
    { title: data.settings.trust3Title, text: data.settings.trust3Text, icon: '★' },
  ]

  const banner = data.banners[bannerIdx]
  const phone = data.settings.phonePrimary.replace(/\s/g, '')

  return (
    <div>
      <section className="tosix-hero">
        {banner ? (
          <img src={imageUrl(banner.imagePath)} alt="Banner" className="tosix-hero-img" />
        ) : (
          <div className="tosix-hero-placeholder" />
        )}
        <div className="tosix-hero-overlay">
          <div className="tosix-container tosix-hero-content">
            <span className="tosix-eyebrow">{data.settings.heroEyebrow ?? `${brand} — Đèn & nội thất`}</span>
            <h1>{brand}</h1>
            <p>{data.settings.siteTagline ?? 'Tổng phân phối đèn trang trí, đồ nội thất'}</p>
            <div className="tosix-hero-actions">
              <Link to="/san-pham" className="tosix-btn tosix-btn--hero">
                Khám phá sản phẩm
              </Link>
              <Link to="/lien-he" className="tosix-btn tosix-btn--hero-outline">
                Tư vấn miễn phí
              </Link>
            </div>
          </div>
        </div>
        {data.banners.length > 1 ? (
          <div className="tosix-hero-dots">
            {data.banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                className={i === bannerIdx ? 'active' : ''}
                onClick={() => setBannerIdx(i)}
                aria-label={`Banner ${i + 1}`}
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className="tosix-trust-strip">
        <div className="tosix-container tosix-trust-grid">
          {trustItems.map((item, i) =>
            item.title ? (
              <div key={i} className="tosix-trust-item">
                <span className="tosix-trust-icon">{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  {item.text ? <p>{item.text}</p> : null}
                </div>
              </div>
            ) : null,
          )}
        </div>
      </section>

      <section className="tosix-section tosix-section--alt">
        <div className="tosix-container">
          <div className="tosix-section-intro">
            <span className="tosix-eyebrow">Danh mục</span>
            <h2 className="tosix-section-title">Khám phá theo nhóm sản phẩm</h2>
            <p className="tosix-section-desc">Chọn danh mục để xem bộ sưu tập đèn và nội thất phù hợp không gian của bạn.</p>
          </div>
          <div className="tosix-category-grid">
            {data.categories.map((c) => (
              <Link key={c.id} to={`/danh-muc/${c.slug}`} className="tosix-category-card">
                <div className="tosix-category-card-image">
                  <img src={imageUrl(c.imagePath)} alt={c.name} loading="lazy" />
                </div>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="tosix-section">
        <div className="tosix-container">
          <div className="tosix-section-head">
            <div className="tosix-section-intro">
              <span className="tosix-eyebrow">Mới cập nhật</span>
              <h2 className="tosix-section-title">Hàng mới về</h2>
            </div>
            <Link to="/san-pham" className="tosix-btn tosix-btn--secondary tosix-btn--sm">
              Xem tất cả →
            </Link>
          </div>
          <HomeCarousel
            ariaLabel="Hàng mới về"
            items={data.newProducts}
            pageClassName="tosix-home-carousel-page--products"
            renderItem={(product) => (
              <ProductCard product={product} onView={() => setSelectedProductId(product.id)} />
            )}
          />
        </div>
      </section>

      {feedbackLightboxItems.length ? (
        <section className="tosix-section tosix-section--alt">
          <div className="tosix-container">
            <div className="tosix-section-intro">
              <span className="tosix-eyebrow">Thực tế</span>
              <h2 className="tosix-section-title">Hình ảnh feedback</h2>
              <p className="tosix-section-desc">Bấm vào ảnh để phóng to và xem chi tiết.</p>
            </div>
            <HomeCarousel
              ariaLabel="Hình ảnh feedback"
              items={data.feedbackImages}
              pageClassName="tosix-home-carousel-page--gallery"
              renderItem={(image, globalIndex) => (
                <ClickableImage
                  src={imageUrl(image.imagePath)}
                  alt={image.caption ?? 'Feedback khách hàng'}
                  onClick={() => setGalleryLightbox({ items: feedbackLightboxItems, index: globalIndex })}
                />
              )}
            />
          </div>
        </section>
      ) : null}

      {reviewLightboxItems.length ? (
        <section className="tosix-section">
          <div className="tosix-container">
            <div className="tosix-section-intro">
              <span className="tosix-eyebrow">Đánh giá</span>
              <h2 className="tosix-section-title">Khách hàng nói gì về chúng tôi</h2>
              <p className="tosix-section-desc">Những phản hồi chân thực từ khách hàng đã sử dụng sản phẩm.</p>
            </div>
            <HomeCarousel
              ariaLabel="Khách hàng nói gì về chúng tôi"
              items={data.customerReviews}
              pageClassName="tosix-home-carousel-page--gallery tosix-home-carousel-page--reviews"
              renderItem={(_review, globalIndex) => (
                <ClickableImage
                  src={reviewLightboxItems[globalIndex].src}
                  alt={reviewLightboxItems[globalIndex].alt}
                  onClick={() => setGalleryLightbox({ items: reviewLightboxItems, index: globalIndex })}
                />
              )}
            />
          </div>
        </section>
      ) : null}

      <section className="tosix-cta-banner">
        <div className="tosix-container tosix-cta-banner-inner">
          <div>
            <h2>Bạn cần tư vấn chọn đèn & nội thất?</h2>
            <p>Liên hệ ngay — đội ngũ {brand} sẵn sàng hỗ trợ bạn.</p>
          </div>
          <div className="tosix-cta-banner-actions">
            <a href={`tel:${phone}`} className="tosix-btn tosix-btn--hero">
              Gọi {data.settings.phonePrimary}
            </a>
            <Link to="/lien-he" className="tosix-btn tosix-btn--hero-outline">
              Xem thông tin liên hệ
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter settings={data.settings} />

      <ProductDetailModal productId={selectedProductId} onClose={() => setSelectedProductId(null)} />

      {galleryLightbox ? (
        <ImageLightbox
          items={galleryLightbox.items}
          index={galleryLightbox.index}
          onClose={() => setGalleryLightbox(null)}
          onChangeIndex={(index) => setGalleryLightbox((prev) => (prev ? { ...prev, index } : null))}
        />
      ) : null}
    </div>
  )
}
