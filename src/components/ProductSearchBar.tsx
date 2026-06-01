import { useEffect, useRef } from 'react'

type ProductSearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSearch: (value: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

export function ProductSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Tìm theo tên hoặc mã sản phẩm…',
  className = '',
  debounceMs = 350,
}: ProductSearchBarProps) {
  const skipDebounceRef = useRef(true)
  const timerRef = useRef<number | null>(null)
  const onSearchRef = useRef(onSearch)

  onSearchRef.current = onSearch

  function flushSearch() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    onSearchRef.current(value)
  }

  useEffect(() => {
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false
      return
    }

    timerRef.current = window.setTimeout(() => onSearchRef.current(value), debounceMs)
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [value, debounceMs])

  return (
    <div className={`tosix-search-bar${className ? ` ${className}` : ''}`}>
      <input
        className="tosix-input tosix-search-input"
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            flushSearch()
          }
        }}
        aria-label="Tìm kiếm sản phẩm"
      />
    </div>
  )
}
