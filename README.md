# Tosix Decor — Frontend

React 19 + Vite SPA cho website Tosix Decor, theo kiến trúc dự án Krik (`fekrik`).

## Chạy local

```powershell
cd D:\Projects1\fetosix
npm install
npm run dev
```

Web: http://localhost:5174

API backend: `https://api.amberlumia.com.vn` (cấu hình trong `.env` → `VITE_API_BASE`).

Khi dev local, Vite vẫn proxy `/api` và `/uploads` về server nếu không set `VITE_API_BASE`.

## Trang công khai

- `/` — Trang chủ (banner, danh mục, hàng mới, feedback, đánh giá, liên hệ)
- `/san-pham` — Tất cả sản phẩm
- `/danh-muc/:slug` — Sản phẩm theo nhóm
- `/lien-he` — Thông tin liên hệ

## Quản trị

- `/login` — Đăng nhập admin
- `/admin` — Dashboard
- `/admin/settings` — Sửa địa chỉ, SĐT, email, tên công ty
- `/admin/categories` — Nhóm sản phẩm + upload ảnh
- `/admin/products` — Sản phẩm, giá, ảnh
- `/admin/banners` — Banner trang chủ
- `/admin/feedback` — Ảnh feedback
- `/admin/reviews` — Ảnh đánh giá khách hàng

Tài khoản: `admin@tosix.local` / `Admin123!`
