import { useCallback, useEffect, useState } from 'react'
import * as tosixApi from '../../api/tosixApi'
import { messageFromApiError } from '../../api/apiError'
import { useAdminToast } from '../../components/AdminToast'
import { ImageUploadField } from '../../components/ImageUploadField'
import type { Banner, CustomerReview, FeedbackImage } from '../../types/api'
import { imageUrl } from '../../utils/format'

type ImageCrudForm = { imagePath: string; sortOrder: number; isActive: boolean }

type ImageCrudApi = {
  rows: { id: string; imagePath: string; sortOrder: number; isActive: boolean }[]
  form: ImageCrudForm
  setForm: React.Dispatch<React.SetStateAction<ImageCrudForm>>
  editId: string | null
  startEdit: (row: { id: string; imagePath: string; sortOrder: number; isActive: boolean }) => void
  resetForm: () => void
  error: string | null
  onSubmit: (e: React.FormEvent) => void
  onDelete: (id: string) => Promise<void>
}

function scrollToAdminForm() {
  document.querySelector('.tosix-admin-edit-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function useImageCrud<T extends { id: string; imagePath: string; sortOrder: number; isActive: boolean }>(
  listFn: () => Promise<T[]>,
  createFn: (body: ImageCrudForm) => Promise<T>,
  updateFn: (id: string, body: ImageCrudForm) => Promise<T>,
  deleteFn: (id: string) => Promise<void>,
) {
  const { showSuccess } = useAdminToast()
  const emptyForm: ImageCrudForm = { imagePath: '', sortOrder: 0, isActive: true }
  const [rows, setRows] = useState<T[]>([])
  const [form, setForm] = useState<ImageCrudForm>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setRows(await listFn())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startEdit(row: { id: string; imagePath: string; sortOrder: number; isActive: boolean }) {
    setEditId(row.id)
    setError(null)
    setForm({ imagePath: row.imagePath, sortOrder: row.sortOrder, isActive: row.isActive })
    scrollToAdminForm()
  }

  function resetForm() {
    setEditId(null)
    setForm(emptyForm)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.imagePath) {
      setError('Vui lòng chọn ảnh.')
      return
    }
    setError(null)
    try {
      if (editId) {
        await updateFn(editId, form)
        await load()
        showSuccess()
      } else {
        await createFn(form)
        resetForm()
        await load()
        showSuccess('Thêm thành công.')
      }
    } catch (err) {
      setError(messageFromApiError(err, 'Lưu thất bại.'))
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Xóa mục này?')) return
    try {
      await deleteFn(id)
      if (editId === id) resetForm()
      await load()
    } catch (err) {
      setError(messageFromApiError(err, 'Xóa thất bại.'))
    }
  }

  return { rows, form, setForm, editId, startEdit, resetForm, error, onSubmit, onDelete }
}

export function AdminBannersPage() {
  const crud = useImageCrud<Banner>(
    tosixApi.adminListBanners,
    (b) => tosixApi.adminCreateBanner({ ...b, linkUrl: null }),
    (id, b) => tosixApi.adminUpdateBanner(id, { ...b, linkUrl: null }),
    tosixApi.adminDeleteBanner,
  )

  return (
    <ImageAdminPage
      title="Banner trang chủ"
      folder="banners"
      crud={crud}
      extra={null}
      addLabel="Thêm banner"
      galleryClassName="tosix-gallery--banners"
    />
  )
}

export function AdminFeedbackPage() {
  const { showSuccess } = useAdminToast()
  const emptyForm = { imagePath: '', caption: '', sortOrder: 0, isActive: true }
  const [rows, setRows] = useState<FeedbackImage[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setRows(await tosixApi.adminListFeedback())
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startEdit(row: FeedbackImage) {
    setEditId(row.id)
    setError(null)
    setForm({ imagePath: row.imagePath, caption: row.caption ?? '', sortOrder: row.sortOrder, isActive: row.isActive })
    scrollToAdminForm()
  }

  function resetForm() {
    setEditId(null)
    setForm(emptyForm)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (editId) {
        await tosixApi.adminUpdateFeedback(editId, form)
        await load()
        showSuccess()
      } else {
        await tosixApi.adminCreateFeedback(form)
        resetForm()
        await load()
        showSuccess('Thêm feedback thành công.')
      }
    } catch (err) {
      setError(messageFromApiError(err, 'Lưu thất bại.'))
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Xóa mục này?')) return
    try {
      await tosixApi.adminDeleteFeedback(id)
      if (editId === id) resetForm()
      await load()
    } catch (err) {
      setError(messageFromApiError(err, 'Xóa thất bại.'))
    }
  }

  return (
    <div className="tosix-admin-page">
      <h1>Feedback ảnh</h1>
      <form className="tosix-form tosix-admin-edit-form" onSubmit={onSubmit}>
        {editId ? (
          <p className="tosix-admin-form-hint">
            Đang sửa feedback — chỉnh xong bấm <strong>Cập nhật</strong> để lưu.
          </p>
        ) : (
          <p className="tosix-admin-form-hint">Thêm feedback mới hoặc bấm ảnh bên dưới để sửa.</p>
        )}
        <ImageUploadField value={form.imagePath || null} folder="feedback" onChange={(path) => setForm({ ...form, imagePath: path })} />
        <label className="tosix-field">
          Ghi chú
          <input className="tosix-input" value={form.caption ?? ''} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
        </label>
        <label className="tosix-field">
          Thứ tự
          <input className="tosix-input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
        </label>
        {error ? <p className="tosix-alert">{error}</p> : null}
        <div className="tosix-form-actions">
          <button type="submit" className="tosix-btn tosix-btn--primary">
            {editId ? 'Cập nhật' : 'Thêm feedback'}
          </button>
          {editId ? (
            <button type="button" className="tosix-btn tosix-btn--ghost" onClick={resetForm}>
              Hủy
            </button>
          ) : null}
        </div>
      </form>
      <div className="tosix-gallery">
        {rows.map((r) => (
          <div key={r.id} className={`tosix-gallery-item${editId === r.id ? ' tosix-gallery-item--active' : ''}`}>
            <button type="button" className="tosix-gallery-thumb-btn" title="Sửa feedback" aria-label="Sửa feedback" onClick={() => startEdit(r)}>
              <img src={imageUrl(r.imagePath)} alt={r.caption ?? ''} />
            </button>
            <div className="tosix-gallery-actions">
              <button type="button" className="tosix-btn tosix-btn--danger tosix-btn--sm" onClick={() => void onDelete(r.id)}>
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdminReviewsPage() {
  const crud = useImageCrud<CustomerReview>(
    tosixApi.adminListReviews,
    tosixApi.adminCreateReview,
    tosixApi.adminUpdateReview,
    tosixApi.adminDeleteReview,
  )

  return (
    <ImageAdminPage
      title="Đánh giá khách hàng"
      folder="reviews"
      crud={crud}
      extra={null}
      addLabel="Thêm đánh giá"
      galleryClassName="tosix-gallery--reviews"
    />
  )
}

function ImageAdminPage({
  title,
  folder,
  crud,
  extra,
  addLabel = 'Thêm',
  galleryClassName = '',
}: {
  title: string
  folder: string
  crud: ImageCrudApi
  extra: React.ReactNode
  addLabel?: string
  galleryClassName?: string
}) {
  return (
    <div className="tosix-admin-page">
      <h1>{title}</h1>
      <form className="tosix-form tosix-admin-edit-form" onSubmit={crud.onSubmit}>
        {crud.editId ? (
          <p className="tosix-admin-form-hint">
            Đang sửa — chỉnh xong bấm <strong>Cập nhật</strong> để lưu.
          </p>
        ) : (
          <p className="tosix-admin-form-hint">Thêm mới hoặc bấm ảnh bên dưới để sửa.</p>
        )}
        <ImageUploadField value={crud.form.imagePath || null} folder={folder} onChange={(path) => crud.setForm({ ...crud.form, imagePath: path })} />
        {extra}
        <label className="tosix-field">
          Thứ tự
          <input className="tosix-input" type="number" value={crud.form.sortOrder} onChange={(e) => crud.setForm({ ...crud.form, sortOrder: Number(e.target.value) })} />
        </label>
        {crud.error ? <p className="tosix-alert">{crud.error}</p> : null}
        <div className="tosix-form-actions">
          <button type="submit" className="tosix-btn tosix-btn--primary">
            {crud.editId ? 'Cập nhật' : addLabel}
          </button>
          {crud.editId ? (
            <button type="button" className="tosix-btn tosix-btn--ghost" onClick={crud.resetForm}>
              Hủy
            </button>
          ) : null}
        </div>
      </form>
      <div className={`tosix-gallery${galleryClassName ? ` ${galleryClassName}` : ''}`}>
        {crud.rows.map((r) => (
          <div key={r.id} className={`tosix-gallery-item${crud.editId === r.id ? ' tosix-gallery-item--active' : ''}`}>
            <button type="button" className="tosix-gallery-thumb-btn" title="Sửa" aria-label="Sửa" onClick={() => crud.startEdit(r)}>
              <img src={imageUrl(r.imagePath)} alt="" />
            </button>
            <div className="tosix-gallery-actions">
              <button type="button" className="tosix-btn tosix-btn--danger tosix-btn--sm" onClick={() => void crud.onDelete(r.id)}>
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
