type PaginationProps = {
  page: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, totalCount, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageNumbers(page, totalPages)

  return (
    <nav className="tosix-pagination" aria-label="Phân trang">
      <p className="tosix-pagination-summary">
        Trang {page}/{totalPages} · {totalCount.toLocaleString('vi-VN')} sản phẩm
      </p>
      <div className="tosix-pagination-controls">
        <button
          type="button"
          className="tosix-btn tosix-btn--ghost"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ‹ Trước
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="tosix-pagination-gap">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`tosix-pagination-page${p === page ? ' tosix-pagination-page--active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          className="tosix-btn tosix-btn--ghost"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Sau ›
        </button>
      </div>
    </nav>
  )
}

function buildPageNumbers(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: Array<number | '…'> = [1]
  if (current > 3) pages.push('…')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}
