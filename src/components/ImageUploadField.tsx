import { useRef, useState, type ChangeEvent } from 'react'
import * as tosixApi from '../api/tosixApi'
import { messageFromApiError } from '../api/apiError'
import { imageUrl } from '../utils/format'

type Props = {
  value: string | null
  folder: string
  onChange: (path: string) => void
  label?: string
}

export function ImageUploadField({ value, folder, onChange, label = 'Ảnh' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const res = await tosixApi.adminUpload(file, folder)
      onChange(res.path)
    } catch (err) {
      setError(messageFromApiError(err, 'Upload thất bại.'))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="tosix-image-upload">
      <span className="tosix-label">{label}</span>
      <div className="tosix-image-upload-row">
        {value ? <img src={imageUrl(value)} alt="" className="tosix-image-preview" /> : <div className="tosix-image-preview tosix-image-preview--empty">Chưa có ảnh</div>}
        <div>
          <button type="button" className="tosix-btn tosix-btn--secondary" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? 'Đang tải…' : 'Chọn ảnh'}
          </button>
          {value ? (
            <button type="button" className="tosix-btn tosix-btn--ghost" onClick={() => onChange('')}>
              Xóa ảnh
            </button>
          ) : null}
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
          {error ? <p className="tosix-alert">{error}</p> : null}
        </div>
      </div>
    </div>
  )
}
