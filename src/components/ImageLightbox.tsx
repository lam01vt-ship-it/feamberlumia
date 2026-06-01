import { useEffect } from 'react'

export type LightboxDetail = {
  label: string
  value: string
  highlight?: boolean
}

export type LightboxItem = {
  src: string
  alt: string
  title?: string
  caption?: string
  details?: LightboxDetail[]
}

type ImageLightboxProps = {
  items: LightboxItem[]
  index: number
  onClose: () => void
  onChangeIndex?: (index: number) => void
}

export function ImageLightbox({ items, index, onClose, onChangeIndex }: ImageLightboxProps) {
  const item = items[index]
  const hasNav = items.length > 1 && onChangeIndex

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (!hasNav || !onChangeIndex) return
      if (e.key === 'ArrowLeft') onChangeIndex((index - 1 + items.length) % items.length)
      if (e.key === 'ArrowRight') onChangeIndex((index + 1) % items.length)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [hasNav, index, items.length, onChangeIndex, onClose])

  if (!item) return null

  return (
    <div className="tosix-lightbox" role="dialog" aria-modal="true" aria-label={item.title ?? item.alt}>
      <button type="button" className="tosix-lightbox-backdrop" aria-label="Đóng" onClick={onClose} />
      <div className="tosix-lightbox-dialog">
        <button type="button" className="tosix-lightbox-close" aria-label="Đóng" onClick={onClose}>
          ×
        </button>

        {hasNav ? (
          <button
            type="button"
            className="tosix-lightbox-nav tosix-lightbox-nav--prev"
            aria-label="Ảnh trước"
            onClick={() => onChangeIndex((index - 1 + items.length) % items.length)}
          >
            ‹
          </button>
        ) : null}

        <div className={`tosix-lightbox-body${item.details?.length ? ' tosix-lightbox-body--detail' : ''}`}>
          <div className="tosix-lightbox-image-wrap">
            <img src={item.src} alt={item.alt} className="tosix-lightbox-image" />
          </div>

          {(item.title || item.caption || item.details?.length) ? (
            <div className="tosix-lightbox-info">
              {item.title ? <h2 className="tosix-lightbox-title">{item.title}</h2> : null}
              {item.caption ? <p className="tosix-lightbox-caption">{item.caption}</p> : null}
              {item.details?.length ? (
                <dl className="tosix-lightbox-details">
                  {item.details.map((d) => (
                    <div key={d.label} className={`tosix-lightbox-detail-row${d.highlight ? ' tosix-lightbox-detail-row--highlight' : ''}`}>
                      <dt>{d.label}</dt>
                      <dd>{d.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          ) : null}
        </div>

        {hasNav ? (
          <>
            <button
              type="button"
              className="tosix-lightbox-nav tosix-lightbox-nav--next"
              aria-label="Ảnh sau"
              onClick={() => onChangeIndex((index + 1) % items.length)}
            >
              ›
            </button>
            <div className="tosix-lightbox-counter">
              {index + 1} / {items.length}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
