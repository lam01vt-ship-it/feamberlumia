import { useEffect, useMemo, useState, type ReactNode } from 'react'

const DEFAULT_PAGE_SIZE = 4
const DEFAULT_AUTO_MS = 5000

type HomeCarouselProps<T> = {
  items: T[]
  itemsPerPage?: number
  autoPlayMs?: number
  pageClassName?: string
  ariaLabel: string
  renderItem: (item: T, globalIndex: number) => ReactNode
}

export function HomeCarousel<T>({
  items,
  itemsPerPage = DEFAULT_PAGE_SIZE,
  autoPlayMs = DEFAULT_AUTO_MS,
  pageClassName = '',
  ariaLabel,
  renderItem,
}: HomeCarouselProps<T>) {
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))
  const [page, setPage] = useState(0)
  const [autoSeed, setAutoSeed] = useState(0)

  const safePage = page >= totalPages ? 0 : page

  useEffect(() => {
    if (page >= totalPages) setPage(0)
  }, [page, totalPages])

  useEffect(() => {
    if (totalPages <= 1) return

    const timer = window.setInterval(() => {
      setPage((current) => (current + 1) % totalPages)
    }, autoPlayMs)

    return () => window.clearInterval(timer)
  }, [totalPages, autoPlayMs, autoSeed])

  const visibleItems = useMemo(() => {
    const start = safePage * itemsPerPage
    return items.slice(start, start + itemsPerPage).map((item, i) => ({
      item,
      globalIndex: start + i,
      isFirst: i === 0,
      isLast: i === items.slice(start, start + itemsPerPage).length - 1,
    }))
  }, [items, itemsPerPage, safePage])

  function goTo(nextPage: number) {
    setPage((nextPage + totalPages) % totalPages)
    setAutoSeed((s) => s + 1)
  }

  if (items.length === 0) return null

  const canNavigate = totalPages > 1

  return (
    <div className="tosix-home-carousel" aria-label={ariaLabel}>
      <div className="tosix-home-carousel-viewport">
        {canNavigate ? (
          <>
            <button
              type="button"
              className="tosix-home-carousel-nav tosix-home-carousel-nav--prev"
              aria-label="Xem nhóm trước"
              onClick={() => goTo(safePage - 1)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              className="tosix-home-carousel-nav tosix-home-carousel-nav--next"
              aria-label="Xem nhóm tiếp theo"
              onClick={() => goTo(safePage + 1)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        ) : null}

        <div className={`tosix-home-carousel-page${pageClassName ? ` ${pageClassName}` : ''}`}>
          {visibleItems.map(({ item, globalIndex, isFirst, isLast }) => (
            <div
              key={globalIndex}
              className={`tosix-home-carousel-item${isFirst ? ' tosix-home-carousel-item--first' : ''}${isLast ? ' tosix-home-carousel-item--last' : ''}`}
            >
              {renderItem(item, globalIndex)}
            </div>
          ))}
        </div>
      </div>

      {canNavigate ? (
        <div className="tosix-home-carousel-meta">
          <span>
            {safePage + 1} / {totalPages}
          </span>
          <div className="tosix-home-carousel-dots">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                className={i === safePage ? 'active' : ''}
                aria-label={`Nhóm ${i + 1}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
