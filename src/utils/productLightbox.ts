import type { LightboxDetail, LightboxItem } from '../components/ImageLightbox'
import type { Product } from '../types/api'
import { formatProductPrice, imageUrl } from './format'
import { productStockDisplay, productStockLabel } from './productStock'

export function productToLightboxItem(product: Product): LightboxItem {
  const stockType = productStockLabel(product)

  const details: LightboxDetail[] = [
    { label: 'Mã sản phẩm', value: product.code },
    { label: 'Danh mục', value: product.categoryName },
    ...(product.isNew ? [{ label: 'Trạng thái', value: 'Hàng mới về' }] : []),
    ...(stockType ? [{ label: 'Tồn kho', value: productStockDisplay(stockType) }] : []),
  ]

  const priceLabel = formatProductPrice(product.price)
  if (priceLabel) {
    details.push({ label: 'Giá bán', value: priceLabel, highlight: true })
  }

  return {
    src: imageUrl(product.imagePath),
    alt: product.name,
    title: product.name,
    details,
  }
}

export function productsToLightboxItems(products: Product[]): LightboxItem[] {
  return products.map(productToLightboxItem)
}
