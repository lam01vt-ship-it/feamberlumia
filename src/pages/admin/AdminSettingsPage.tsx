import { useCallback, useEffect, useState } from 'react'
import * as tosixApi from '../../api/tosixApi'
import { messageFromApiError } from '../../api/apiError'
import { useAdminToast } from '../../components/AdminToast'
import type { SiteSetting } from '../../types/api'

type SettingsForm = {
  [K in keyof Omit<SiteSetting, 'id'>]: string
}

const empty: SettingsForm = {
  companyName: '',
  taxCode: '',
  address: '',
  email: '',
  phonePrimary: '',
  phoneSecondary: '',
  facebookUrl: '',
  zaloUrl: '',
  siteTitle: '',
  siteTagline: '',
  heroEyebrow: '',
  logoSubtitle: '',
  trust1Title: '',
  trust1Text: '',
  trust2Title: '',
  trust2Text: '',
  trust3Title: '',
  trust3Text: '',
}

const nullableKeys = new Set<keyof SettingsForm>([
  'phoneSecondary',
  'facebookUrl',
  'zaloUrl',
  'siteTitle',
  'siteTagline',
  'heroEyebrow',
  'logoSubtitle',
  'trust1Title',
  'trust1Text',
  'trust2Title',
  'trust2Text',
  'trust3Title',
  'trust3Text',
])

export function AdminSettingsPage() {
  const { showSuccess } = useAdminToast()
  const [form, setForm] = useState<SettingsForm>(empty)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const s = await tosixApi.adminGetSettings()
    setForm({
      companyName: s.companyName,
      taxCode: s.taxCode,
      address: s.address,
      email: s.email,
      phonePrimary: s.phonePrimary,
      phoneSecondary: s.phoneSecondary ?? '',
      facebookUrl: s.facebookUrl ?? '',
      zaloUrl: s.zaloUrl ?? '',
      siteTitle: s.siteTitle ?? '',
      siteTagline: s.siteTagline ?? '',
      heroEyebrow: s.heroEyebrow ?? '',
      logoSubtitle: s.logoSubtitle ?? '',
      trust1Title: s.trust1Title ?? '',
      trust1Text: s.trust1Text ?? '',
      trust2Title: s.trust2Title ?? '',
      trust2Text: s.trust2Text ?? '',
      trust3Title: s.trust3Title ?? '',
      trust3Text: s.trust3Text ?? '',
    })
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const body = { ...form } as Record<string, string | null>
      for (const key of nullableKeys) {
        body[key] = (form[key] as string)?.trim() || null
      }
      await tosixApi.adminUpdateSettings(body as Omit<SiteSetting, 'id'>)
      showSuccess('Đã lưu cài đặt.')
    } catch (err) {
      setError(messageFromApiError(err, 'Lưu thất bại.'))
    }
  }

  return (
    <div className="tosix-admin-page">
      <h1>Liên hệ &amp; giao diện web</h1>
      <form className="tosix-form" onSubmit={onSave}>
        <h2 className="tosix-admin-form-section">Thương hiệu &amp; trang chủ</h2>
        <p className="tosix-muted tosix-admin-form-hint-block">Các mục hiển thị ở header, banner và thanh giới thiệu trang chủ.</p>
        <div className="tosix-form-grid">
          <label className="tosix-field">
            Tên thương hiệu
            <input className="tosix-input" value={form.siteTitle} onChange={(e) => setForm({ ...form, siteTitle: e.target.value })} placeholder="AmberLumia" />
          </label>
          <label className="tosix-field">
            Dòng phụ logo (header)
            <input className="tosix-input" value={form.logoSubtitle} onChange={(e) => setForm({ ...form, logoSubtitle: e.target.value })} placeholder="ĐÈN & NỘI THẤT CAO CẤP" />
          </label>
          <label className="tosix-field tosix-field--wide">
            Slogan (thanh trên + banner)
            <input className="tosix-input" value={form.siteTagline} onChange={(e) => setForm({ ...form, siteTagline: e.target.value })} />
          </label>
          <label className="tosix-field tosix-field--wide">
            Dòng nhỏ trên banner
            <input className="tosix-input" value={form.heroEyebrow} onChange={(e) => setForm({ ...form, heroEyebrow: e.target.value })} placeholder="AmberLumia — Đèn & nội thất" />
          </label>
        </div>

        <h2 className="tosix-admin-form-section">Thanh giới thiệu (3 cột)</h2>
        <div className="tosix-form-grid">
          <label className="tosix-field">
            Cột 1 — tiêu đề
            <input className="tosix-input" value={form.trust1Title} onChange={(e) => setForm({ ...form, trust1Title: e.target.value })} />
          </label>
          <label className="tosix-field">
            Cột 1 — mô tả
            <input className="tosix-input" value={form.trust1Text} onChange={(e) => setForm({ ...form, trust1Text: e.target.value })} />
          </label>
          <label className="tosix-field">
            Cột 2 — tiêu đề
            <input className="tosix-input" value={form.trust2Title} onChange={(e) => setForm({ ...form, trust2Title: e.target.value })} />
          </label>
          <label className="tosix-field">
            Cột 2 — mô tả
            <input className="tosix-input" value={form.trust2Text} onChange={(e) => setForm({ ...form, trust2Text: e.target.value })} />
          </label>
          <label className="tosix-field">
            Cột 3 — tiêu đề
            <input className="tosix-input" value={form.trust3Title} onChange={(e) => setForm({ ...form, trust3Title: e.target.value })} />
          </label>
          <label className="tosix-field">
            Cột 3 — mô tả
            <input className="tosix-input" value={form.trust3Text} onChange={(e) => setForm({ ...form, trust3Text: e.target.value })} />
          </label>
        </div>

        <h2 className="tosix-admin-form-section">Liên hệ &amp; mạng xã hội</h2>
        <div className="tosix-form-grid">
          {(['companyName', 'taxCode', 'address', 'email', 'phonePrimary', 'phoneSecondary', 'facebookUrl', 'zaloUrl'] as const).map((key) => (
            <label key={key} className={`tosix-field${key === 'address' ? ' tosix-field--wide' : ''}`}>
              {contactLabel(key)}
              <input className="tosix-input" value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </label>
          ))}
        </div>

        {error ? <p className="tosix-alert">{error}</p> : null}
        <button type="submit" className="tosix-btn tosix-btn--primary">
          Lưu
        </button>
      </form>
    </div>
  )
}

function contactLabel(key: 'companyName' | 'taxCode' | 'address' | 'email' | 'phonePrimary' | 'phoneSecondary' | 'facebookUrl' | 'zaloUrl'): string {
  const map = {
    companyName: 'Tên công ty',
    taxCode: 'MST',
    address: 'Địa chỉ',
    email: 'Email',
    phonePrimary: 'SĐT chính',
    phoneSecondary: 'SĐT phụ',
    facebookUrl: 'Facebook URL',
    zaloUrl: 'Zalo (URL hoặc SĐT)',
  }
  return map[key]
}
