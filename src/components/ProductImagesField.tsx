import { useRef, useState, type ChangeEvent } from 'react'
import * as tosixApi from '../api/tosixApi'
import { messageFromApiError } from '../api/apiError'
import { imageUrl } from '../utils/format'

type Props = {
  value: string[]
  folder: string
  onChange: (paths: string[]) => void
  label?: string
}

export function ProductImagesField({ value, folder, onChange, label = 'Ảnh sản phẩm' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return

    setBusy(true)
    setError(null)
    const added: string[] = []

    try {
      for (const file of Array.from(files)) {
        const res = await tosixApi.adminUpload(file, folder)
        added.push(res.path)
      }
      onChange([...value, ...added])
    } catch (err) {
      setError(messageFromApiError(err, 'Upload thất bại.'))
      if (added.length) onChange([...value, ...added])
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function moveToCover(index: number) {
    if (index <= 0) return
    const next = [...value]
    const [item] = next.splice(index, 1)
    next.unshift(item)
    onChange(next)
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= value.length) return
    const next = [...value]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="tosix-product-images">
      <div className="tosix-product-images-head">
        <span className="tosix-label">{label}</span>
        <p className="tosix-muted tosix-product-images-hint">
          Thêm 1 hoặc nhiều ảnh. Ảnh đầu tiên dùng làm ảnh đại diện trên danh sách.
        </p>
      </div>

      {value.length ? (
        <ul className="tosix-product-images-list">
          {value.map((path, index) => (
            <li key={`${path}-${index}`} className="tosix-product-images-item">
              <img src={imageUrl(path)} alt="" className="tosix-product-images-thumb" />
              <div className="tosix-product-images-meta">
                {index === 0 ? <span className="tosix-product-images-badge">Ảnh bìa</span> : null}
                <span className="tosix-muted">#{index + 1}</span>
              </div>
              <div className="tosix-product-images-actions">
                {index > 0 ? (
                  <button type="button" className="tosix-btn tosix-btn--ghost tosix-btn--sm" onClick={() => moveToCover(index)}>
                    Đặt làm bìa
                  </button>
                ) : null}
                <button type="button" className="tosix-btn tosix-btn--ghost tosix-btn--sm" disabled={index === 0} onClick={() => move(index, -1)}>
                  ←
                </button>
                <button
                  type="button"
                  className="tosix-btn tosix-btn--ghost tosix-btn--sm"
                  disabled={index === value.length - 1}
                  onClick={() => move(index, 1)}
                >
                  →
                </button>
                <button type="button" className="tosix-btn tosix-btn--danger tosix-btn--sm" onClick={() => removeAt(index)}>
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="tosix-product-images-empty">Chưa có ảnh — thêm ít nhất 1 ảnh cho sản phẩm.</div>
      )}

      <div className="tosix-product-images-upload">
        <button type="button" className="tosix-btn tosix-btn--secondary" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? 'Đang tải…' : value.length ? 'Thêm ảnh' : 'Chọn ảnh'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />
      </div>

      {error ? <p className="tosix-alert">{error}</p> : null}
    </div>
  )
}
