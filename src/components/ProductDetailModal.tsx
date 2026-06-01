import { useEffect, useState } from 'react'
import * as tosixApi from '../api/tosixApi'
import type { Product, ProductDetail } from '../types/api'
import { formatProductPrice, imageUrl } from '../utils/format'
import { productStockDisplay, productStockLabel } from '../utils/productStock'

type ProductDetailModalProps = {
  productId: string | null
  onClose: () => void
}

export function ProductDetailModal({ productId, onClose }: ProductDetailModalProps) {
  const [activeProductId, setActiveProductId] = useState<string | null>(productId)
  const [detail, setDetail] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)

  useEffect(() => {
    setActiveProductId(productId)
  }, [productId])

  useEffect(() => {
    if (!activeProductId) {
      setDetail(null)
      setImageIndex(0)
      return
    }

    setLoading(true)
    setImageIndex(0)
    void tosixApi
      .fetchProductDetail(activeProductId)
      .then(setDetail)
      .finally(() => setLoading(false))
  }, [activeProductId])

  useEffect(() => {
    if (!productId) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (!detail || detail.imagePaths.length <= 1) return
      if (e.key === 'ArrowLeft') setImageIndex((i) => (i - 1 + detail.imagePaths.length) % detail.imagePaths.length)
      if (e.key === 'ArrowRight') setImageIndex((i) => (i + 1) % detail.imagePaths.length)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [productId, detail, onClose])

  if (!productId) return null

  const product = detail?.product
  const images = detail?.imagePaths ?? (product?.imagePath ? [product.imagePath] : [])
  const currentImage = images[imageIndex]
  const priceLabel = product ? formatProductPrice(product.price) : null
  const stockType = product ? productStockLabel(product) : null

  return (
    <div className="tosix-product-modal" role="dialog" aria-modal="true" aria-label={product?.name ?? 'Chi tiết sản phẩm'}>
      <button type="button" className="tosix-lightbox-backdrop" aria-label="Đóng" onClick={onClose} />

      <div className="tosix-product-modal-dialog">
        <button type="button" className="tosix-lightbox-close" aria-label="Đóng" onClick={onClose}>
          ×
        </button>

        {loading ? (
          <div className="tosix-product-modal-loading">Đang tải chi tiết sản phẩm…</div>
        ) : product ? (
          <>
            <div className="tosix-product-modal-main">
              <div className="tosix-product-modal-gallery">
                <div className="tosix-product-modal-image-wrap">
                  {currentImage ? (
                    <img src={imageUrl(currentImage)} alt={product.name} className="tosix-product-modal-image" />
                  ) : (
                    <div className="tosix-product-modal-image-empty">Chưa có ảnh</div>
                  )}

                  {images.length > 1 ? (
                    <>
                      <button
                        type="button"
                        className="tosix-lightbox-nav tosix-lightbox-nav--prev"
                        aria-label="Ảnh trước"
                        onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="tosix-lightbox-nav tosix-lightbox-nav--next"
                        aria-label="Ảnh sau"
                        onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                      >
                        ›
                      </button>
                      <div className="tosix-product-modal-counter">
                        {imageIndex + 1} / {images.length}
                      </div>
                    </>
                  ) : null}
                </div>

                {images.length > 1 ? (
                  <div className="tosix-product-modal-thumbs">
                    {images.map((path, i) => (
                      <button
                        key={path}
                        type="button"
                        className={`tosix-product-modal-thumb${i === imageIndex ? ' tosix-product-modal-thumb--active' : ''}`}
                        aria-label={`Xem ảnh ${i + 1}`}
                        onClick={() => setImageIndex(i)}
                      >
                        <img src={imageUrl(path)} alt="" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="tosix-product-modal-info">
                <span className="tosix-eyebrow">{product.categoryName}</span>
                <h2 className="tosix-product-modal-title">{product.name}</h2>
                <p className="tosix-product-modal-code">Mã: {product.code}</p>
                {priceLabel ? <p className="tosix-product-modal-price">{priceLabel}</p> : null}
                {product.isNew ? <span className="tosix-badge tosix-badge--inline">Hàng mới</span> : null}
                {stockType === 'inStock' ? <span className="tosix-badge tosix-badge--inline tosix-badge--stock">{productStockDisplay('inStock')}</span> : null}
                {stockType === 'order' ? <span className="tosix-badge tosix-badge--inline tosix-badge--order">{productStockDisplay('order')}</span> : null}
                {stockType === 'updating' ? <span className="tosix-badge tosix-badge--inline tosix-badge--updating">{productStockDisplay('updating')}</span> : null}

                <dl className="tosix-lightbox-details">
                  <div className="tosix-lightbox-detail-row">
                    <dt>Danh mục</dt>
                    <dd>{product.categoryName}</dd>
                  </div>
                  <div className="tosix-lightbox-detail-row">
                    <dt>Mã sản phẩm</dt>
                    <dd>{product.code}</dd>
                  </div>
                  {priceLabel ? (
                    <div className="tosix-lightbox-detail-row tosix-lightbox-detail-row--highlight">
                      <dt>Giá bán</dt>
                      <dd>{priceLabel}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </div>

            {detail.relatedProducts.length > 0 ? (
              <section className="tosix-product-modal-related">
                <h3>Sản phẩm liên quan</h3>
                <div className="tosix-product-modal-related-grid">
                  {detail.relatedProducts.map((related) => (
                    <RelatedProductCard
                      key={related.id}
                      product={related}
                      onOpen={setActiveProductId}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <div className="tosix-product-modal-loading">Không tìm thấy sản phẩm.</div>
        )}
      </div>
    </div>
  )
}

function RelatedProductCard({ product, onOpen }: { product: Product; onOpen: (id: string) => void }) {
  const priceLabel = formatProductPrice(product.price)

  return (
    <button type="button" className="tosix-related-card" onClick={() => onOpen(product.id)}>
      <img src={imageUrl(product.imagePath)} alt={product.name} loading="lazy" />
      <span className="tosix-related-card-name">{product.name}</span>
      {priceLabel ? <span className="tosix-related-card-price">{priceLabel}</span> : null}
    </button>
  )
}
