import { useEffect, useState } from 'react'
import * as tosixApi from '../../api/tosixApi'
import { DEFAULT_BRAND_NAME } from '../../utils/brand'
export function AdminDashboardPage() {
  const [msg, setMsg] = useState('')

  useEffect(() => {
    void tosixApi.adminPing().then((r) => setMsg(r.message))
  }, [])

  return (
    <div className="tosix-admin-page">
      <h1>Tổng quan</h1>
      <p className="tosix-muted">Chào mừng đến trang quản trị {DEFAULT_BRAND_NAME}.</p>
      <div className="tosix-admin-cards">
        <div className="tosix-admin-card">
          <h3>API</h3>
          <p>{msg || 'Đang kiểm tra…'}</p>
        </div>
        <div className="tosix-admin-card">
          <h3>Hướng dẫn</h3>
          <p>Dùng menu bên trái để cập nhật liên hệ, nhóm sản phẩm, sản phẩm, banner, feedback và đánh giá khách hàng.</p>
        </div>
      </div>
    </div>
  )
}
