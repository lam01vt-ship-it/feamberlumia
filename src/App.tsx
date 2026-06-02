import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { AdminLayout } from './layout/AdminLayout'
import { PublicLayout } from './layout/PublicLayout'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { PolicyPage } from './pages/PolicyPage'
import { AllProductsPage, CategoryProductsPage } from './pages/ProductsPage'
import { AdminAccountPage } from './pages/admin/AdminAccountPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminBannersPage, AdminFeedbackPage, AdminReviewsPage } from './pages/admin/AdminMediaPages'
import { RequireAdmin, RequireAuth } from './routes/Guards'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="san-pham" element={<AllProductsPage />} />
            <Route path="danh-muc/:slug" element={<CategoryProductsPage />} />
            <Route path="lien-he" element={<ContactPage />} />
            <Route path="chinh-sach" element={<PolicyPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              </RequireAuth>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="account" element={<AdminAccountPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="banners" element={<AdminBannersPage />} />
            <Route path="feedback" element={<AdminFeedbackPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
