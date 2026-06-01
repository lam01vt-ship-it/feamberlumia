import type {
  Banner,
  Category,
  CustomerReview,
  FeedbackImage,
  HomePage,
  LoginResponse,
  Product,
  ProductDetail,
  ProductInput,
  AdminProductDetail,
  ProductListParams,
  PagedResult,
  SiteSetting,
  UploadResponse,
  UserSummary,
  UpdateProfileInput,
  ChangePasswordInput,
  CreateAdminUserInput,
} from '../types/api'
import { api } from './client'

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/login', { email, password })
  return data
}

export async function fetchMe(): Promise<UserSummary> {
  const { data } = await api.get<UserSummary>('/api/auth/me')
  return data
}

export async function updateProfile(body: UpdateProfileInput): Promise<UserSummary> {
  const { data } = await api.put<UserSummary>('/api/auth/me/profile', body)
  return data
}

export async function changePassword(body: ChangePasswordInput): Promise<void> {
  await api.put('/api/auth/me/password', body)
}

export async function adminListUsers(): Promise<UserSummary[]> {
  const { data } = await api.get<UserSummary[]>('/api/admin/users')
  return data
}

export async function adminCreateUser(body: CreateAdminUserInput): Promise<UserSummary> {
  const { data } = await api.post<UserSummary>('/api/admin/users', body)
  return data
}

export async function adminUpdateUser(id: string, body: UpdateProfileInput): Promise<UserSummary> {
  const { data } = await api.put<UserSummary>(`/api/admin/users/${id}`, body)
  return data
}

export async function adminResetUserPassword(id: string, newPassword: string): Promise<void> {
  await api.put(`/api/admin/users/${id}/password`, { newPassword })
}

export async function adminDeleteUser(id: string): Promise<void> {
  await api.delete(`/api/admin/users/${id}`)
}

export async function fetchHome(): Promise<HomePage> {
  const { data } = await api.get<HomePage>('/api/public/home')
  return data
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/api/public/categories')
  return data
}

export async function fetchProductsByCategory(slug: string, params: ProductListParams = {}): Promise<PagedResult<Product>> {
  const { data } = await api.get<PagedResult<Product>>(`/api/public/categories/${slug}/products`, { params: buildProductParams(params) })
  return data
}

export async function fetchAllProducts(params: ProductListParams = {}): Promise<PagedResult<Product>> {
  const { data } = await api.get<PagedResult<Product>>('/api/public/products', { params: buildProductParams(params) })
  return data
}

export async function fetchProductDetail(id: string): Promise<ProductDetail> {
  const { data } = await api.get<ProductDetail>(`/api/public/products/${id}`)
  return data
}

export async function fetchSettings(): Promise<SiteSetting> {
  const { data } = await api.get<SiteSetting>('/api/public/settings')
  return data
}

export async function adminPing(): Promise<{ ok: boolean; message: string }> {
  const { data } = await api.get('/api/admin/ping')
  return data
}

export async function adminGetSettings(): Promise<SiteSetting> {
  const { data } = await api.get<SiteSetting>('/api/admin/settings')
  return data
}

export async function adminUpdateSettings(body: Omit<SiteSetting, 'id'>): Promise<SiteSetting> {
  const { data } = await api.put<SiteSetting>('/api/admin/settings', body)
  return data
}

export async function adminListCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/api/admin/categories')
  return data
}

export async function adminCreateCategory(body: Omit<Category, 'id' | 'productCount'>): Promise<Category> {
  const { data } = await api.post<Category>('/api/admin/categories', body)
  return data
}

export async function adminUpdateCategory(id: string, body: Omit<Category, 'id' | 'productCount'>): Promise<Category> {
  const { data } = await api.put<Category>(`/api/admin/categories/${id}`, body)
  return data
}

export async function adminDeleteCategory(id: string): Promise<void> {
  await api.delete(`/api/admin/categories/${id}`)
}

export async function adminListProducts(params: ProductListParams = {}): Promise<PagedResult<Product>> {
  const { data } = await api.get<PagedResult<Product>>('/api/admin/products', { params: buildProductParams(params) })
  return data
}

export async function adminGetProduct(id: string): Promise<AdminProductDetail> {
  const { data } = await api.get<AdminProductDetail>(`/api/admin/products/${id}`)
  return data
}

export async function adminCreateProduct(body: ProductInput): Promise<Product> {
  const { data } = await api.post<Product>('/api/admin/products', body)
  return data
}

export async function adminUpdateProduct(id: string, body: ProductInput): Promise<Product> {
  const { data } = await api.put<Product>(`/api/admin/products/${id}`, body)
  return data
}

export async function adminDeleteProduct(id: string): Promise<void> {
  await api.delete(`/api/admin/products/${id}`)
}

export async function adminListBanners(): Promise<Banner[]> {
  const { data } = await api.get<Banner[]>('/api/admin/banners')
  return data
}

export async function adminCreateBanner(body: Omit<Banner, 'id'>): Promise<Banner> {
  const { data } = await api.post<Banner>('/api/admin/banners', body)
  return data
}

export async function adminUpdateBanner(id: string, body: Omit<Banner, 'id'>): Promise<Banner> {
  const { data } = await api.put<Banner>(`/api/admin/banners/${id}`, body)
  return data
}

export async function adminDeleteBanner(id: string): Promise<void> {
  await api.delete(`/api/admin/banners/${id}`)
}

export async function adminListFeedback(): Promise<FeedbackImage[]> {
  const { data } = await api.get<FeedbackImage[]>('/api/admin/feedback')
  return data
}

export async function adminCreateFeedback(body: Omit<FeedbackImage, 'id'>): Promise<FeedbackImage> {
  const { data } = await api.post<FeedbackImage>('/api/admin/feedback', body)
  return data
}

export async function adminUpdateFeedback(id: string, body: Omit<FeedbackImage, 'id'>): Promise<FeedbackImage> {
  const { data } = await api.put<FeedbackImage>(`/api/admin/feedback/${id}`, body)
  return data
}

export async function adminDeleteFeedback(id: string): Promise<void> {
  await api.delete(`/api/admin/feedback/${id}`)
}

export async function adminListReviews(): Promise<CustomerReview[]> {
  const { data } = await api.get<CustomerReview[]>('/api/admin/reviews')
  return data
}

export async function adminCreateReview(body: Omit<CustomerReview, 'id'>): Promise<CustomerReview> {
  const { data } = await api.post<CustomerReview>('/api/admin/reviews', body)
  return data
}

export async function adminUpdateReview(id: string, body: Omit<CustomerReview, 'id'>): Promise<CustomerReview> {
  const { data } = await api.put<CustomerReview>(`/api/admin/reviews/${id}`, body)
  return data
}

export async function adminDeleteReview(id: string): Promise<void> {
  await api.delete(`/api/admin/reviews/${id}`)
}

export async function adminUpload(file: File, folder: string): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<UploadResponse>(`/api/admin/upload?folder=${encodeURIComponent(folder)}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

function buildProductParams(params: ProductListParams) {
  const query: Record<string, string | number> = {}
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.page) query.page = params.page
  if (params.pageSize) query.pageSize = params.pageSize
  if (params.categoryId) query.categoryId = params.categoryId
  return query
}
