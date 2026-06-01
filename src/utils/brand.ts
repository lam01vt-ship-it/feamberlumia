import type { SiteSetting } from '../types/api'

export const DEFAULT_BRAND_NAME = 'AmberLumia'

export function brandName(settings?: Pick<SiteSetting, 'siteTitle'> | null): string {
  const name = settings?.siteTitle?.trim()
  return name || DEFAULT_BRAND_NAME
}

export function brandInitial(settings?: Pick<SiteSetting, 'siteTitle'> | null): string {
  return brandName(settings).charAt(0).toUpperCase() || 'A'
}
