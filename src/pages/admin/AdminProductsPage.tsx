import { useCallback, useEffect, useState } from 'react'
import * as tosixApi from '../../api/tosixApi'
import { messageFromApiError } from '../../api/apiError'
import { useAdminToast } from '../../components/AdminToast'
import { Pagination } from '../../components/Pagination'
import { ProductImagesField } from '../../components/ProductImagesField'
import { ProductSearchBar } from '../../components/ProductSearchBar'
import type { Category, Product, ProductInput } from '../../types/api'
import { formatProductPriceRange, imageUrl } from '../../utils/format'
import { flagsFromStockType, stockTypeFromFlags } from '../../utils/productStock'

const empty: ProductInput = {
  categoryId: '',
  code: '',
  name: '',
  price: 0,
  priceMax: 0,
  imagePaths: [],
  isNew: false,
  isFeatured: false,
  isInStock: true,
  isOrder: false,
  isUpdating: false,
  sortOrder: 0,
  isActive: true,
}

const PAGE_SIZE = 20

export function AdminProductsPage() {
  const { showSuccess } = useAdminToast()
  const [rows, setRows] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<ProductInput>(empty)
  const [editId, setEditId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [filterCategoryId, setFilterCategoryId] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingEdit, setLoadingEdit] = useState(false)

  const loadCategories = useCallback(async () => {
    const c = await tosixApi.adminListCategories()
    setCategories(c)
    setForm((f) => (f.categoryId ? f : { ...f, categoryId: c[0]?.id ?? '' }))
  }, [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await tosixApi.adminListProducts({
        q: search || undefined,
        categoryId: filterCategoryId || undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      setRows(result.items)
      setTotalPages(result.totalPages)
      setTotalCount(result.totalCount)
    } catch (err) {
      setRows([])
      setTotalPages(0)
      setTotalCount(0)
      setError(messageFromApiError(err, 'Không tải được danh sách sản phẩm.'))
    } finally {
      setLoading(false)
    }
  }, [search, filterCategoryId, page])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  async function startEdit(row: Product) {
    setEditId(row.id)
    setError(null)
    setLoadingEdit(true)
    try {
      const detail = await tosixApi.adminGetProduct(row.id)
      const stockFlags = flagsFromStockType(
        stockTypeFromFlags(detail.product.isInStock, detail.product.isOrder, detail.product.isUpdating),
      )
      setForm({
        categoryId: detail.product.categoryId,
        code: detail.product.code,
        name: detail.product.name,
        price: detail.product.price,
        priceMax: detail.product.priceMax,
        imagePaths: detail.imagePaths,
        isNew: detail.product.isNew,
        isFeatured: detail.product.isFeatured,
        sortOrder: detail.product.sortOrder,
        isActive: detail.product.isActive,
        ...stockFlags,
      })
      document.querySelector('.tosix-admin-edit-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (err) {
      setError(messageFromApiError(err, 'Không tải được ảnh sản phẩm.'))
    } finally {
      setLoadingEdit(false)
    }
  }

  function resetForm() {
    setEditId(null)
    setForm({ ...empty, categoryId: categories[0]?.id ?? '' })
  }

  function handleSearch(nextQ: string) {
    const trimmed = nextQ.trim()
    if (trimmed === search) return
    setSearch(trimmed)
    setPage(1)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.imagePaths.length === 0) {
      setError('Vui lòng thêm ít nhất 1 ảnh cho sản phẩm.')
      return
    }

    if (form.priceMax > 0 && form.priceMax < form.price) {
      setError('Giá đến phải lớn hơn hoặc bằng giá từ.')
      return
    }

    const payload = {
      ...form,
      ...flagsFromStockType(stockTypeFromFlags(form.isInStock, form.isOrder, form.isUpdating)),
    }

    try {
      if (editId) {
        await tosixApi.adminUpdateProduct(editId, payload)
        await loadProducts()
        showSuccess()
      } else {
        await tosixApi.adminCreateProduct(payload)
        resetForm()
        await loadProducts()
        showSuccess('Thêm sản phẩm thành công.')
      }
    } catch (err) {
      setError(messageFromApiError(err, 'Lưu thất bại.'))
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Xóa sản phẩm này?')) return
    try {
      await tosixApi.adminDeleteProduct(id)
      if (editId === id) resetForm()
      await loadProducts()
    } catch (err) {
      setError(messageFromApiError(err, 'Xóa thất bại.'))
    }
  }

  return (
    <div className="tosix-admin-page">
      <h1>Sản phẩm</h1>

      <div className="tosix-admin-toolbar">
        <ProductSearchBar
          value={searchDraft}
          onChange={setSearchDraft}
          onSearch={handleSearch}
          placeholder="Tìm theo tên hoặc mã…"
        />
        <label className="tosix-field tosix-admin-filter">
          Nhóm
          <select
            className="tosix-input"
            value={filterCategoryId}
            onChange={(e) => {
              setFilterCategoryId(e.target.value)
              setPage(1)
            }}
          >
            <option value="">Tất cả nhóm</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <form className="tosix-form tosix-admin-edit-form" onSubmit={onSubmit}>
        {editId ? (
          <p className="tosix-admin-form-hint">
            Đang sửa: <strong>{form.code || '…'}</strong> — chỉnh xong bấm <strong>Cập nhật</strong> để lưu.
          </p>
        ) : (
          <p className="tosix-admin-form-hint">Thêm sản phẩm mới hoặc bấm một dòng trong bảng bên dưới để sửa.</p>
        )}
        <div className="tosix-form-grid">
          <label className="tosix-field">
            Nhóm
            <select className="tosix-input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="tosix-field">
            Mã
            <input className="tosix-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </label>
          <label className="tosix-field">
            Tên
            <input className="tosix-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="tosix-field">
            Giá từ (VNĐ)
            <input className="tosix-input" type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
          </label>
          <label className="tosix-field">
            Giá đến (VNĐ)
            <input
              className="tosix-input"
              type="number"
              min={0}
              value={form.priceMax}
              onChange={(e) => setForm({ ...form, priceMax: Number(e.target.value) })}
              placeholder="Để 0 nếu chỉ 1 giá"
            />
          </label>
          <label className="tosix-field">
            Thứ tự (order)
            <input className="tosix-input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </label>
        </div>

        <div className="tosix-stock-type">
          <span className="tosix-stock-type-label">Loại hàng</span>
          <div className="tosix-stock-type-options" role="radiogroup" aria-label="Loại hàng">
            <label className="tosix-stock-type-option">
              <input
                type="radio"
                name="productStockType"
                checked={stockTypeFromFlags(form.isInStock, form.isOrder, form.isUpdating) === 'inStock'}
                onChange={() => setForm({ ...form, ...flagsFromStockType('inStock') })}
              />
              Hàng có sẵn
            </label>
            <label className="tosix-stock-type-option">
              <input
                type="radio"
                name="productStockType"
                checked={stockTypeFromFlags(form.isInStock, form.isOrder, form.isUpdating) === 'order'}
                onChange={() => setForm({ ...form, ...flagsFromStockType('order') })}
              />
              Hàng order
            </label>
            <label className="tosix-stock-type-option">
              <input
                type="radio"
                name="productStockType"
                checked={stockTypeFromFlags(form.isInStock, form.isOrder, form.isUpdating) === 'updating'}
                onChange={() => setForm({ ...form, ...flagsFromStockType('updating') })}
              />
              Đang cập nhật
            </label>
          </div>
        </div>

        <div className="tosix-check-row">
          <label className="tosix-check">
            <input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} /> Hàng mới
          </label>
          <label className="tosix-check">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Nổi bật
          </label>
          <label className="tosix-check">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Hiển thị
          </label>
        </div>

        {loadingEdit ? <p className="tosix-muted">Đang tải ảnh sản phẩm…</p> : null}

        <ProductImagesField
          value={form.imagePaths}
          folder="products"
          onChange={(imagePaths) => setForm({ ...form, imagePaths })}
        />

        {error ? <p className="tosix-alert">{error}</p> : null}

        <div className="tosix-form-actions">
          <button type="submit" className="tosix-btn tosix-btn--primary" disabled={loadingEdit}>
            {editId ? 'Cập nhật' : 'Thêm sản phẩm'}
          </button>
          {editId ? (
            <button type="button" className="tosix-btn tosix-btn--ghost" onClick={resetForm}>
              Hủy
            </button>
          ) : null}
        </div>
      </form>

      {loading ? <p className="tosix-muted">Đang tải…</p> : null}

      <div className="tosix-table-wrap">
        <table className="tosix-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Mã</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>Nhóm</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const priceLabel = formatProductPriceRange(r.price, r.priceMax)
              const isEditing = editId === r.id
              return (
                <tr
                  key={r.id}
                  className={`tosix-table-row--clickable${isEditing ? ' tosix-table-row--active' : ''}`}
                  onClick={() => void startEdit(r)}
                  title={`Sửa ${r.code}`}
                >
                  <td>
                    {r.imagePath ? (
                      <span className="tosix-table-thumb-wrap">
                        <img src={imageUrl(r.imagePath)} alt="" className="tosix-table-thumb" loading="lazy" />
                        {r.imageCount && r.imageCount > 1 ? <span className="tosix-table-thumb-count">+{r.imageCount - 1}</span> : null}
                      </span>
                    ) : (
                      <span className="tosix-table-thumb-empty">—</span>
                    )}
                  </td>
                  <td>{r.code}</td>
                  <td>{r.name}</td>
                  <td>{priceLabel ?? '—'}</td>
                  <td>{r.categoryName}</td>
                  <td className="tosix-table-actions-cell" onClick={(e) => e.stopPropagation()}>
                    <div className="tosix-table-actions">
                      <button type="button" className="tosix-btn tosix-btn--danger tosix-btn--sm" onClick={() => void onDelete(r.id)}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!loading && rows.length === 0 ? <p className="tosix-muted">Không có sản phẩm phù hợp.</p> : null}

      <Pagination page={page} totalPages={totalPages} totalCount={totalCount} onPageChange={setPage} />
    </div>
  )
}
