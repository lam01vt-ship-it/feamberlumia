export type UserSummary = {
  id: string
  email: string
  fullName: string
  roles: string[]
}

export type UpdateProfileInput = {
  fullName: string
  email: string
}

export type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
}

export type CreateAdminUserInput = {
  email: string
  fullName: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  expiresInSeconds: number
  user: UserSummary
}

export type SiteSetting = {
  id: string
  companyName: string
  taxCode: string
  address: string
  email: string
  phonePrimary: string
  phoneSecondary: string | null
  facebookUrl: string | null
  zaloUrl: string | null
  zaloQrImagePath: string | null
  siteTitle: string | null
  siteTagline: string | null
  heroEyebrow: string | null
  logoSubtitle: string | null
  trust1Title: string | null
  trust1Text: string | null
  trust2Title: string | null
  trust2Text: string | null
  trust3Title: string | null
  trust3Text: string | null
  policyContent: string | null
}

export type Category = {
  id: string
  name: string
  slug: string
  imagePath: string | null
  sortOrder: number
  isActive: boolean
  productCount: number
}

export type Product = {
  id: string
  categoryId: string
  categoryName: string
  code: string
  name: string
  price: number
  priceMax: number
  imagePath: string | null
  isNew: boolean
  isFeatured: boolean
  isInStock: boolean
  isOrder: boolean
  isUpdating: boolean
  sortOrder: number
  isActive: boolean
  imageCount?: number
}

export type ProductInput = {
  categoryId: string
  code: string
  name: string
  price: number
  priceMax: number
  imagePaths: string[]
  isNew: boolean
  isFeatured: boolean
  isInStock: boolean
  isOrder: boolean
  isUpdating: boolean
  sortOrder: number
  isActive: boolean
}

export type AdminProductDetail = {
  product: Product
  imagePaths: string[]
}

export type ProductDetail = {
  product: Product
  imagePaths: string[]
  relatedProducts: Product[]
}

export type PagedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type ProductSort = 'default' | 'popular' | 'latest' | 'price_asc' | 'price_desc'

export type ProductListParams = {
  q?: string
  page?: number
  pageSize?: number
  categoryId?: string
  sort?: ProductSort
}

export type Banner = {
  id: string
  imagePath: string
  linkUrl: string | null
  sortOrder: number
  isActive: boolean
}

export type FeedbackImage = {
  id: string
  imagePath: string
  caption: string | null
  sortOrder: number
  isActive: boolean
}

export type CustomerReview = {
  id: string
  imagePath: string
  sortOrder: number
  isActive: boolean
}

export type HomePage = {
  settings: SiteSetting
  banners: Banner[]
  categories: Category[]
  newProducts: Product[]
  feedbackImages: FeedbackImage[]
  customerReviews: CustomerReview[]
}

export type UploadResponse = {
  path: string
  url: string
}
