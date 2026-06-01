export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫'
}

export function formatProductPrice(price: number): string | null {
  if (!price || price <= 0) return null
  return formatVnd(price)
}

export function imageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.svg'
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? ''
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
