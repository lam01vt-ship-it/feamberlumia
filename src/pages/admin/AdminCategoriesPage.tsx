import { useCallback, useEffect, useState } from 'react'
import * as tosixApi from '../../api/tosixApi'
import { messageFromApiError } from '../../api/apiError'
import { useAdminToast } from '../../components/AdminToast'
import { ImageUploadField } from '../../components/ImageUploadField'
import type { Category } from '../../types/api'
import { imageUrl } from '../../utils/format'

type Form = Omit<Category, 'id' | 'productCount'>

const empty: Form = { name: '', slug: '', imagePath: null, sortOrder: 0, isActive: true }

function scrollToAdminForm() {
  document.querySelector('.tosix-admin-edit-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function AdminCategoriesPage() {
  const { showSuccess } = useAdminToast()
  const [rows, setRows] = useState<Category[]>([])
  const [form, setForm] = useState<Form>(empty)
  const [editId, setEditId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setRows(await tosixApi.adminListCategories())
    } catch (err) {
      setRows([])
      setError(messageFromApiError(err, 'Không tải được danh sách nhóm sản phẩm.'))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startEdit(row: Category) {
    setEditId(row.id)
    setError(null)
    setForm({ name: row.name, slug: row.slug, imagePath: row.imagePath, sortOrder: row.sortOrder, isActive: row.isActive })
    scrollToAdminForm()
  }

  function resetForm() {
    setEditId(null)
    setForm(empty)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (editId) {
        await tosixApi.adminUpdateCategory(editId, form)
        await load()
        showSuccess()
      } else {
        await tosixApi.adminCreateCategory(form)
        resetForm()
        await load()
        showSuccess('Thêm nhóm thành công.')
      }
    } catch (err) {
      setError(messageFromApiError(err, 'Lưu thất bại.'))
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Xóa nhóm sản phẩm này?')) return
    try {
      await tosixApi.adminDeleteCategory(id)
      if (editId === id) resetForm()
      await load()
    } catch (err) {
      setError(messageFromApiError(err, 'Xóa thất bại.'))
    }
  }

  return (
    <div className="tosix-admin-page">
      <h1>Nhóm sản phẩm</h1>
      <form className="tosix-form tosix-form--inline tosix-admin-edit-form" onSubmit={onSubmit}>
        {editId ? (
          <p className="tosix-admin-form-hint">
            Đang sửa: <strong>{form.name || '…'}</strong> — chỉnh xong bấm <strong>Cập nhật</strong> để lưu.
          </p>
        ) : (
          <p className="tosix-admin-form-hint">Thêm nhóm mới hoặc bấm một dòng trong bảng bên dưới để sửa.</p>
        )}
        <label className="tosix-field">
          Tên
          <input className="tosix-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="tosix-field">
          Slug
          <input className="tosix-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        </label>
        <label className="tosix-field">
          Thứ tự
          <input className="tosix-input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
        </label>
        <label className="tosix-check">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Hiển thị
        </label>
        <ImageUploadField value={form.imagePath} folder="categories" onChange={(path) => setForm({ ...form, imagePath: path || null })} />
        {error ? <p className="tosix-alert">{error}</p> : null}
        <div className="tosix-form-actions">
          <button type="submit" className="tosix-btn tosix-btn--primary">
            {editId ? 'Cập nhật' : 'Thêm nhóm'}
          </button>
          {editId ? (
            <button type="button" className="tosix-btn tosix-btn--ghost" onClick={resetForm}>
              Hủy
            </button>
          ) : null}
        </div>
      </form>
      <div className="tosix-table-wrap">
        <table className="tosix-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Slug</th>
              <th>SP</th>
              <th>TT</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className={`tosix-table-row--clickable${editId === r.id ? ' tosix-table-row--active' : ''}`}
                onClick={() => startEdit(r)}
                title={`Sửa ${r.name}`}
              >
                <td>
                  {r.imagePath ? (
                    <img src={imageUrl(r.imagePath)} alt="" className="tosix-table-thumb" />
                  ) : (
                    <span className="tosix-table-thumb-empty">—</span>
                  )}
                </td>
                <td>{r.name}</td>
                <td>{r.slug}</td>
                <td>{r.productCount}</td>
                <td>{r.sortOrder}</td>
                <td className="tosix-table-actions-cell" onClick={(e) => e.stopPropagation()}>
                  <div className="tosix-table-actions">
                    <button type="button" className="tosix-btn tosix-btn--danger tosix-btn--sm" onClick={() => void onDelete(r.id)}>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
