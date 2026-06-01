import type { Product } from '../types/api'
import { formatProductPrice, imageUrl } from '../utils/format'
import { productStockLabel, productStockShortDisplay } from '../utils/productStock'

type ProductCardProps = {
  product: Product
  onView?: (product: Product) => void
}

export function ProductCard({ product, onView }: ProductCardProps) {
  const priceLabel = formatProductPrice(product.price)
  const stockType = productStockLabel(product)

  return (
    <article className="tosix-product-card">
      <button
        type="button"
        className="tosix-product-image-wrap"
        onClick={() => onView?.(product)}
        aria-label={`Xem chi tiết ${product.name}`}
      >
        <div className="tosix-product-badges">
          {product.isNew ? <span className="tosix-badge">Mới</span> : null}
          {stockType === 'inStock' ? <span className="tosix-badge tosix-badge--stock">{productStockShortDisplay('inStock')}</span> : null}
          {stockType === 'order' ? <span className="tosix-badge tosix-badge--order">{productStockShortDisplay('order')}</span> : null}
          {stockType === 'updating' ? <span className="tosix-badge tosix-badge--updating">{productStockShortDisplay('updating')}</span> : null}
        </div>
        <img src={imageUrl(product.imagePath)} alt={product.name} loading="lazy" />
        <span className="tosix-product-zoom" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
          </svg>
          Xem ảnh
        </span>
      </button>
      <div className="tosix-product-body">
        <h3>{product.name}</h3>
        <p className="tosix-product-code">Mã: {product.code}</p>
        {priceLabel ? <p className="tosix-product-price">{priceLabel}</p> : null}
        <button type="button" className="tosix-product-view-btn" onClick={() => onView?.(product)}>
          Chi tiết sản phẩm
        </button>
      </div>
    </article>
  )
}
