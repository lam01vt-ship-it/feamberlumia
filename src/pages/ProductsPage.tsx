import { useCallback, useEffect, useState } from 'react'

import { Link, useParams, useSearchParams } from 'react-router-dom'

import * as tosixApi from '../api/tosixApi'

import { Pagination } from '../components/Pagination'

import { ProductCard } from '../components/ProductCard'

import { ProductDetailModal } from '../components/ProductDetailModal'

import { ProductSearchBar } from '../components/ProductSearchBar'

import { ProductSortBar, parseSort } from '../components/ProductSortBar'

import type { Category, Product, ProductSort } from '../types/api'

import { SiteFooter } from '../components/SiteFooter'
import { brandName } from '../utils/brand'



const PAGE_SIZE = 24

function changeSort(
  next: ProductSort,
  searchParams: URLSearchParams,
  setSearchParams: (params: URLSearchParams) => void,
) {
  const params = new URLSearchParams(searchParams)
  if (next === 'default') params.delete('sort')
  else params.set('sort', next)
  params.set('page', '1')
  setSearchParams(params)
}



export function AllProductsPage() {

  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') ?? ''

  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)

  const sort = parseSort(searchParams.get('sort'))



  const [draftQ, setDraftQ] = useState(q)

  const [products, setProducts] = useState<Product[]>([])

  const [categories, setCategories] = useState<Category[]>([])

  const [totalPages, setTotalPages] = useState(0)

  const [totalCount, setTotalCount] = useState(0)

  const [loading, setLoading] = useState(true)

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)



  useEffect(() => {

    setDraftQ(q)

  }, [q])



  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [result, c] = await Promise.all([
        tosixApi.fetchAllProducts({ q: q || undefined, page, pageSize: PAGE_SIZE, sort }),
        tosixApi.fetchCategories(),
      ])
      setProducts(result.items)
      setTotalPages(result.totalPages)
      setTotalCount(result.totalCount)
      setCategories(c)
    } finally {
      setLoading(false)
    }
  }, [q, page, sort])



  useEffect(() => {

    void load()

  }, [load])



  function commitSearch(nextQ: string) {
    const trimmed = nextQ.trim()
    if (trimmed === q) return
    const next = new URLSearchParams()
    if (trimmed) next.set('q', trimmed)
    next.set('page', '1')
    setSearchParams(next)
  }



  function goToPage(nextPage: number) {

    const next = new URLSearchParams(searchParams)

    next.set('page', String(nextPage))

    setSearchParams(next)

    window.scrollTo({ top: 0, behavior: 'smooth' })

  }



  return (

    <PageShell

      title={q ? `Kết quả: “${q}”` : 'Tất cả sản phẩm'}

      subtitle="Tìm nhanh theo tên hoặc mã — mỗi trang hiển thị 24 sản phẩm"

    >

      <ProductSearchBar value={draftQ} onChange={setDraftQ} onSearch={commitSearch} />



      <div className="tosix-category-tabs tosix-category-tabs--scroll">

        {categories.map((c) => (

          <Link key={c.id} to={`/danh-muc/${c.slug}`} className="tosix-chip">

            {c.name}

          </Link>

        ))}

      </div>



      <ProductSortBar totalCount={totalCount} sort={sort} onSortChange={(next) => changeSort(next, searchParams, setSearchParams)} />



      {loading ? <p className="tosix-muted">Đang tải sản phẩm…</p> : null}

      {!loading && products.length === 0 ? (

        <p className="tosix-muted">Không tìm thấy sản phẩm phù hợp.</p>

      ) : null}



      <div className="tosix-product-grid">

        {products.map((p) => (

          <ProductCard key={p.id} product={p} onView={() => setSelectedProductId(p.id)} />

        ))}

      </div>



      <Pagination page={page} totalPages={totalPages} totalCount={totalCount} onPageChange={goToPage} />



      <ProductDetailModal productId={selectedProductId} onClose={() => setSelectedProductId(null)} />

    </PageShell>

  )

}



export function CategoryProductsPage() {

  const { slug = '' } = useParams()

  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') ?? ''

  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)

  const sort = parseSort(searchParams.get('sort'))



  const [draftQ, setDraftQ] = useState(q)

  const [products, setProducts] = useState<Product[]>([])

  const [title, setTitle] = useState('')

  const [totalPages, setTotalPages] = useState(0)

  const [totalCount, setTotalCount] = useState(0)

  const [loading, setLoading] = useState(true)

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)



  useEffect(() => {

    setDraftQ(q)

  }, [q])



  useEffect(() => {

    void (async () => {

      setLoading(true)

      try {

        const result = await tosixApi.fetchProductsByCategory(slug, { q: q || undefined, page, pageSize: PAGE_SIZE, sort })

        setProducts(result.items)

        setTotalPages(result.totalPages)

        setTotalCount(result.totalCount)

        setTitle(result.items[0]?.categoryName ?? slug)

      } finally {

        setLoading(false)

      }

    })()

  }, [slug, q, page, sort])



  function commitSearch(nextQ: string) {
    const trimmed = nextQ.trim()
    if (trimmed === q) return
    const next = new URLSearchParams()
    if (trimmed) next.set('q', trimmed)
    next.set('page', '1')
    setSearchParams(next)
  }



  function goToPage(nextPage: number) {

    const next = new URLSearchParams(searchParams)

    next.set('page', String(nextPage))

    setSearchParams(next)

    window.scrollTo({ top: 0, behavior: 'smooth' })

  }



  return (

    <PageShell title={title} subtitle="Tìm trong danh mục này hoặc xem chi tiết từng sản phẩm">

      <ProductSearchBar value={draftQ} onChange={setDraftQ} onSearch={commitSearch} />



      <ProductSortBar totalCount={totalCount} sort={sort} onSortChange={(next) => changeSort(next, searchParams, setSearchParams)} />



      {loading ? <p className="tosix-muted">Đang tải sản phẩm…</p> : null}

      {!loading && products.length === 0 ? (

        <p className="tosix-muted">Không có sản phẩm trong danh mục này.</p>

      ) : null}



      <div className="tosix-product-grid">

        {products.map((p) => (

          <ProductCard key={p.id} product={p} onView={() => setSelectedProductId(p.id)} />

        ))}

      </div>



      <Pagination page={page} totalPages={totalPages} totalCount={totalCount} onPageChange={goToPage} />



      <ProductDetailModal productId={selectedProductId} onClose={() => setSelectedProductId(null)} />

    </PageShell>

  )

}



function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {

  const [settings, setSettings] = useState<Awaited<ReturnType<typeof tosixApi.fetchSettings>> | null>(null)



  useEffect(() => {

    void tosixApi.fetchSettings().then(setSettings)

  }, [])



  return (

    <div>

      <section className="tosix-page-hero">

        <div className="tosix-container">

          <span className="tosix-eyebrow">{settings ? brandName(settings) : 'AmberLumia'}</span>

          <h1>{title}</h1>

          {subtitle ? <p className="tosix-page-hero-desc">{subtitle}</p> : null}

        </div>

      </section>

      <section className="tosix-section tosix-container">{children}</section>

      {settings ? <SiteFooter settings={settings} /> : null}

    </div>

  )

}

