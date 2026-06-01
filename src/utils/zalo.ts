export function resolveZaloUrl(zaloUrl: string | null | undefined, phoneFallback: string): string {
  const custom = zaloUrl?.trim()
  if (custom) {
    if (custom.startsWith('http://') || custom.startsWith('https://')) return custom
    const digits = custom.replace(/\D/g, '')
    if (digits) return `https://zalo.me/${digits}`
  }

  const digits = phoneFallback.replace(/\D/g, '')
  if (!digits) return 'https://zalo.me/'
  const zaloId = digits.startsWith('84') ? digits : `84${digits.replace(/^0/, '')}`
  return `https://zalo.me/${zaloId}`
}
