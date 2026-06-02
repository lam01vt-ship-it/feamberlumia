export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫'
}

export function formatProductPrice(price: number): string | null {
  if (!price || price <= 0) return null
  return formatVnd(price)
}

/**
 * Formats a product's price. When `priceMax` is set and greater than the base
 * price, a range "min – max" is shown; otherwise the single price (or null).
 */
export function formatProductPriceRange(price: number, priceMax?: number | null): string | null {
  const base = formatProductPrice(price)
  if (priceMax && priceMax > price) {
    const max = formatVnd(priceMax)
    return base ? `${base} – ${max}` : max
  }
  return base
}

export function imageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.svg'
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? ''
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
