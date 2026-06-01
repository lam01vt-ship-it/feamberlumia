export type ProductStockType = 'inStock' | 'order' | 'updating'

export type ProductStockFlags = {
  isInStock: boolean
  isOrder: boolean
  isUpdating: boolean
}

export function stockTypeFromFlags(isInStock: boolean, isOrder: boolean, isUpdating: boolean): ProductStockType {
  if (isUpdating) return 'updating'
  if (isOrder && !isInStock) return 'order'
  return 'inStock'
}

export function flagsFromStockType(type: ProductStockType): ProductStockFlags {
  if (type === 'order') return { isInStock: false, isOrder: true, isUpdating: false }
  if (type === 'updating') return { isInStock: false, isOrder: false, isUpdating: true }
  return { isInStock: true, isOrder: false, isUpdating: false }
}

export function productStockLabel(product: ProductStockFlags): ProductStockType | null {
  return stockTypeFromFlags(product.isInStock, product.isOrder, product.isUpdating)
}

export function productStockDisplay(type: ProductStockType): string {
  if (type === 'order') return 'Hàng order'
  if (type === 'updating') return 'Đang cập nhật'
  return 'Hàng có sẵn'
}

export function productStockShortDisplay(type: ProductStockType): string {
  if (type === 'order') return 'Order'
  if (type === 'updating') return 'Cập nhật'
  return 'Có sẵn'
}
