import type { AxiosError } from 'axios'

export function messageFromApiError(err: unknown, fallback: string): string {
  const ax = err as AxiosError<{ detail?: string; title?: string }>
  const data = ax.response?.data
  if (typeof data?.detail === 'string' && data.detail) return data.detail
  if (typeof data?.title === 'string' && data.title) return data.title
  if (ax.response?.status === 403) return 'Bạn không có quyền thực hiện thao tác này.'
  return fallback
}
