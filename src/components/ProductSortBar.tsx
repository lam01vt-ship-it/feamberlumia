import type { ProductSort } from '../types/api'

type ProductSortBarProps = {
  totalCount: number
  sort: ProductSort
  onSortChange: (sort: ProductSort) => void
}

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'default', label: 'Sắp xếp mặc định' },
  { value: 'popular', label: 'Phổ biến / Nổi bật' },
  { value: 'latest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá: thấp đến cao' },
  { value: 'price_desc', label: 'Giá: cao đến thấp' },
]

export function ProductSortBar({ totalCount, sort, onSortChange }: ProductSortBarProps) {
  return (
    <div className="tosix-product-toolbar">
      <span className="tosix-product-toolbar-count">Hiển thị {totalCount} sản phẩm</span>
      <label className="tosix-product-sort">
        <span className="tosix-product-sort-label">Sắp xếp</span>
        <select
          className="tosix-input tosix-product-sort-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as ProductSort)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export function parseSort(value: string | null): ProductSort {
  switch (value) {
    case 'popular':
    case 'latest':
    case 'price_asc':
    case 'price_desc':
      return value
    default:
      return 'default'
  }
}
