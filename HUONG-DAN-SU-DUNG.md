# Hướng dẫn sử dụng website AmberLumia

Tài liệu này hướng dẫn **chi tiết từng bước** cách sử dụng website và trang quản trị (admin). Bạn không cần biết về lập trình — chỉ cần làm theo từng mục bên dưới.

> **Lưu ý về tên thương hiệu:** Tên hiển thị trên web (ví dụ "AmberLumia", "Tosix Decor"…) được lấy từ mục **Cài đặt → Tên thương hiệu**. Nếu bạn đổi tên ở đó, toàn bộ web sẽ đổi theo. Trong tài liệu này tạm gọi là *AmberLumia*.

---

## Mục lục

1. [Tổng quan website](#1-tổng-quan-website)
2. [Phần dành cho khách hàng (trang công khai)](#2-phần-dành-cho-khách-hàng-trang-công-khai)
3. [Đăng nhập trang quản trị](#3-đăng-nhập-trang-quản-trị)
4. [Giao diện trang quản trị](#4-giao-diện-trang-quản-trị)
5. [Quản lý Nhóm sản phẩm (danh mục)](#5-quản-lý-nhóm-sản-phẩm-danh-mục)
6. [Quản lý Sản phẩm](#6-quản-lý-sản-phẩm)
7. [Quản lý Banner trang chủ](#7-quản-lý-banner-trang-chủ)
8. [Quản lý Feedback ảnh](#8-quản-lý-feedback-ảnh)
9. [Quản lý Đánh giá khách hàng](#9-quản-lý-đánh-giá-khách-hàng)
10. [Cài đặt Liên hệ & giao diện web](#10-cài-đặt-liên-hệ--giao-diện-web)
11. [Quản lý Tài khoản quản trị](#11-quản-lý-tài-khoản-quản-trị)
12. [Mẹo & xử lý sự cố thường gặp](#12-mẹo--xử-lý-sự-cố-thường-gặp)

---

## 1. Tổng quan website

Website gồm **2 phần**:

| Phần | Dành cho ai | Cách vào |
|------|-------------|----------|
| **Trang công khai** | Khách hàng xem sản phẩm | Mở địa chỉ web bình thường (ví dụ `https://amberlumia.com.vn`) |
| **Trang quản trị (admin)** | Bạn — người quản lý | Thêm `/login` vào sau địa chỉ web, ví dụ `https://amberlumia.com.vn/login` |

Mọi thông tin khách nhìn thấy (sản phẩm, giá, ảnh, banner, số điện thoại, địa chỉ…) đều do bạn **tự cập nhật trong trang quản trị**, không cần nhờ kỹ thuật.

---

## 2. Phần dành cho khách hàng (trang công khai)

Đây là những trang khách hàng nhìn thấy. Bạn nên biết để hình dung những gì mình cập nhật sẽ hiển thị ở đâu.

### Các trang khách xem được

| Trang | Đường dẫn | Nội dung |
|-------|-----------|----------|
| **Trang chủ** | `/` | Banner đầu trang, các nhóm sản phẩm, hàng mới, hàng nổi bật, ảnh feedback, đánh giá khách hàng, thông tin liên hệ |
| **Tất cả sản phẩm** | `/san-pham` | Toàn bộ sản phẩm, có ô tìm kiếm và lọc theo nhóm |
| **Sản phẩm theo nhóm** | `/danh-muc/<tên-nhóm>` | Chỉ hiển thị sản phẩm trong 1 nhóm |
| **Liên hệ** | `/lien-he` | Tên công ty, mã số thuế, địa chỉ, email, điện thoại, nút **Chat Zalo**, nút **Gọi ngay**, Facebook |

### Khách hàng tương tác thế nào

- **Bấm vào sản phẩm** → mở cửa sổ xem chi tiết: ảnh lớn, các ảnh phụ, giá, tình trạng hàng.
- **Tình trạng hàng** hiển thị một trong ba nhãn (do bạn đặt khi tạo sản phẩm):
  - 🟢 **Hàng có sẵn**
  - 🟡 **Hàng order** (đặt rồi mới có)
  - ⚪ **Đang cập nhật**
- **Nút Chat Zalo / Gọi ngay** ở trang Liên hệ và chân trang → khách bấm là gọi điện hoặc mở Zalo ngay.

> Khách hàng **không đặt mua trực tiếp trên web**. Web đóng vai trò *trưng bày sản phẩm* và *dẫn khách liên hệ* qua điện thoại/Zalo.

---

## 3. Đăng nhập trang quản trị

1. Mở trình duyệt, gõ địa chỉ web kèm `/login` ở cuối. Ví dụ: `https://amberlumia.com.vn/login`
2. Nhập **Email** và **Mật khẩu** quản trị của bạn.
3. (Tuỳ chọn) Tích **Ghi nhớ đăng nhập** nếu dùng máy tính cá nhân để lần sau không phải đăng nhập lại.
4. Bấm **Đăng nhập**.

- Đăng nhập đúng → tự chuyển vào trang **Tổng quan** của quản trị.
- Nếu báo *"Sai email hoặc mật khẩu hoặc tài khoản không phải admin"* → kiểm tra lại email/mật khẩu, hoặc tài khoản đó chưa được cấp quyền quản trị.

> **Bảo mật:** Không chia sẻ mật khẩu. Nếu dùng máy tính chung (quán net, máy công ty), **đừng** tích "Ghi nhớ đăng nhập" và nhớ **Đăng xuất** khi xong.

---

## 4. Giao diện trang quản trị

Sau khi đăng nhập, bên **trái màn hình** là **menu** với các mục:

| Mục menu | Dùng để |
|----------|---------|
| **Tổng quan** | Màn hình chào, kiểm tra hệ thống đang hoạt động |
| **Tài khoản** | Sửa thông tin của bạn, đổi mật khẩu, thêm/xoá admin khác |
| **Liên hệ & thông tin** | Sửa tên công ty, địa chỉ, SĐT, email, chữ trên trang chủ |
| **Nhóm sản phẩm** | Tạo/sửa/xoá danh mục (ví dụ: Đèn trần, Đèn bàn…) |
| **Sản phẩm** | Tạo/sửa/xoá sản phẩm, giá, ảnh, tình trạng hàng |
| **Banner** | Ảnh lớn chạy đầu trang chủ |
| **Feedback ảnh** | Ảnh phản hồi/tin nhắn khách |
| **Đánh giá KH** | Ảnh đánh giá của khách hàng |

- Trên **điện thoại**, menu ẩn đi. Bấm nút **☰** (3 gạch) ở góc trên bên trái để mở menu.
- Góc dưới menu có **tên bạn** và nút **Đăng xuất**.
- Bấm tên thương hiệu ở đầu menu để mở trang web công khai (xem thử kết quả).

### Quy tắc chung khi thao tác (áp dụng cho mọi trang)

Các trang quản lý đều hoạt động giống nhau, hãy nhớ quy tắc này:

- **Thêm mới:** điền vào ô (form) ở phía trên → bấm nút **Thêm…**
- **Sửa:** **bấm vào một dòng trong bảng** (hoặc bấm vào ảnh) → thông tin nhảy lên form ở trên → sửa xong bấm **Cập nhật**.
- **Huỷ sửa:** bấm nút **Huỷ** để bỏ thay đổi và quay về chế độ thêm mới.
- **Xoá:** bấm nút **Xoá** màu đỏ → có hộp thoại hỏi xác nhận → bấm **OK**.
- Lưu thành công sẽ hiện thông báo nhỏ màu xanh; lỗi sẽ hiện dòng chữ đỏ.
- Ô **Hiển thị** (hoặc "TT"): có tích = khách thấy; bỏ tích = ẩn khỏi web nhưng **không xoá** dữ liệu.
- Ô **Thứ tự** (sort order): số nhỏ hiển thị trước, số lớn hiển thị sau. Dùng để sắp xếp.

> ⚠️ **Xoá là vĩnh viễn.** Nếu chỉ muốn tạm ẩn một mục, hãy **bỏ tích "Hiển thị"** thay vì xoá.

---

## 5. Quản lý Nhóm sản phẩm (danh mục)

Nhóm sản phẩm = các danh mục để phân loại hàng (ví dụ: *Đèn trần*, *Đèn thả*, *Đèn bàn*). **Nên tạo nhóm trước khi thêm sản phẩm**, vì mỗi sản phẩm bắt buộc phải thuộc một nhóm.

### Thêm nhóm mới

1. Vào menu **Nhóm sản phẩm**.
2. Điền form ở trên:
   - **Tên:** tên hiển thị cho khách, ví dụ `Đèn trần`.
   - **Slug:** phần đường dẫn web, viết **không dấu, không khoảng trắng**, dùng gạch ngang. Ví dụ tên `Đèn trần` → slug `den-tran`. Khách sẽ thấy trang `…/danh-muc/den-tran`.
   - **Thứ tự:** số quyết định nhóm nào hiển thị trước (số nhỏ trước).
   - **Hiển thị:** tích để khách thấy nhóm này.
   - **Ảnh:** bấm **Chọn ảnh** để tải ảnh đại diện cho nhóm (tuỳ chọn).
3. Bấm **Thêm nhóm**.

### Sửa / xoá nhóm

- **Sửa:** bấm vào dòng nhóm trong bảng → sửa form → bấm **Cập nhật**.
- **Xoá:** bấm nút **Xoá** ở cuối dòng → xác nhận.
- Cột **SP** trong bảng cho biết nhóm đang có bao nhiêu sản phẩm.

> 💡 **Mẹo về slug:** Mỗi nhóm nên có slug **khác nhau**. Đặt slug ngắn gọn, dễ đọc. Sau khi đã có khách truy cập, hạn chế đổi slug vì link cũ sẽ không còn dùng được.

---

## 6. Quản lý Sản phẩm

Đây là phần dùng nhiều nhất. Vào menu **Sản phẩm**.

### Thanh công cụ tìm kiếm (phía trên cùng)

- **Ô tìm kiếm:** gõ tên hoặc mã sản phẩm rồi Enter để lọc nhanh.
- **Lọc theo Nhóm:** chọn một nhóm để chỉ xem sản phẩm trong nhóm đó (hoặc "Tất cả nhóm").

### Thêm sản phẩm mới

1. Điền form:
   - **Nhóm:** chọn danh mục sản phẩm thuộc về (*bắt buộc* — nhớ tạo nhóm trước ở mục 5).
   - **Mã:** mã sản phẩm của bạn, ví dụ `DT-001` (*bắt buộc*).
   - **Tên:** tên sản phẩm hiển thị cho khách (*bắt buộc*).
   - **Giá (VNĐ):** nhập số tiền, chỉ nhập số (ví dụ `1500000`). Để `0` nếu chưa muốn hiện giá.
   - **Thứ tự (order):** số sắp xếp, số nhỏ hiển thị trước.
2. **Loại hàng** — chọn **một** trong ba:
   - **Hàng có sẵn** — đang có hàng giao ngay.
   - **Hàng order** — khách đặt rồi mới nhập về.
   - **Đang cập nhật** — chưa rõ tình trạng / đang chờ bổ sung thông tin.
3. **Các tuỳ chọn (tích chọn):**
   - **Hàng mới** — gắn nhãn "mới", sẽ xuất hiện ở khu *Hàng mới* trang chủ.
   - **Nổi bật** — đưa lên khu *Sản phẩm nổi bật* trang chủ.
   - **Hiển thị** — cho khách thấy. Bỏ tích để tạm ẩn.
4. **Ảnh sản phẩm** (xem chi tiết bên dưới) — **bắt buộc ít nhất 1 ảnh**.
5. Bấm **Thêm sản phẩm**.

### Thêm và sắp xếp ảnh sản phẩm

Một sản phẩm có thể có **nhiều ảnh**:

- Bấm **Chọn ảnh** (hoặc **Thêm ảnh**) → có thể chọn **nhiều ảnh cùng lúc**.
- **Ảnh đầu tiên** (gắn nhãn **"Ảnh bìa"**) là ảnh đại diện hiển thị trong danh sách. Các ảnh còn lại là ảnh phụ khách xem khi bấm vào chi tiết.
- Với mỗi ảnh bạn có thể:
  - **Đặt làm bìa** — đưa ảnh đó lên đầu làm ảnh đại diện.
  - **← / →** — di chuyển thứ tự ảnh sang trái/phải.
  - **Xoá** — gỡ ảnh khỏi sản phẩm.

> Nếu bấm **Thêm sản phẩm** mà báo *"Vui lòng thêm ít nhất 1 ảnh"*, nghĩa là bạn chưa tải ảnh nào lên.

### Sửa / xoá sản phẩm

- **Sửa:** bấm vào **dòng sản phẩm** trong bảng → thông tin (kèm ảnh) nhảy lên form ở trên → sửa → bấm **Cập nhật**.
- **Xoá:** bấm nút **Xoá** đỏ ở cột Thao tác → xác nhận.
- Trong bảng, ảnh nào có nhiều ảnh sẽ hiện dấu **+số** (ví dụ `+3`) ở góc thumbnail.
- Phía dưới bảng có **phân trang** (mỗi trang 20 sản phẩm) — bấm số trang để xem tiếp.

> 💡 **Quy trình gợi ý khi nhập hàng mới:** Tạo nhóm (nếu chưa có) → Thêm sản phẩm → chọn nhóm, nhập mã/tên/giá → chọn loại hàng → tải ảnh, đặt ảnh đẹp nhất làm bìa → tích "Hàng mới" nếu là hàng vừa về → Thêm sản phẩm.

---

## 7. Quản lý Banner trang chủ

Banner là các **ảnh lớn chạy ở đầu trang chủ**. Vào menu **Banner**.

1. Bấm **Chọn ảnh** → tải ảnh banner lên.
2. Đặt **Thứ tự** để quyết định ảnh nào chạy trước.
3. Bấm **Thêm banner**.
4. **Sửa:** bấm vào ảnh banner trong thư viện bên dưới → sửa → **Cập nhật**.
5. **Xoá:** bấm **Xoá** dưới ảnh.

> 💡 Nên dùng ảnh **ngang, chất lượng cao**, kích thước tương đương nhau để banner chạy đẹp và đồng đều. Ảnh quá nhỏ sẽ bị mờ khi phóng to.

---

## 8. Quản lý Feedback ảnh

Là khu **ảnh phản hồi / tin nhắn khách** hiển thị trên trang chủ (ảnh chụp màn hình tin nhắn khen, đánh giá…). Vào menu **Feedback ảnh**.

1. Bấm **Chọn ảnh** → tải ảnh feedback.
2. **Ghi chú:** ghi chú ngắn cho ảnh (tuỳ chọn).
3. **Thứ tự:** sắp xếp.
4. Bấm **Thêm feedback**.
5. **Sửa:** bấm vào ảnh trong thư viện → sửa → **Cập nhật**. **Xoá:** bấm **Xoá** dưới ảnh.

---

## 9. Quản lý Đánh giá khách hàng

Tương tự Feedback, là khu **ảnh đánh giá của khách** trên trang chủ. Vào menu **Đánh giá KH**.

1. Bấm **Chọn ảnh** → tải ảnh.
2. Đặt **Thứ tự**.
3. Bấm **Thêm đánh giá**.
4. **Sửa:** bấm vào ảnh → **Cập nhật**. **Xoá:** bấm **Xoá** dưới ảnh.

---

## 10. Cài đặt Liên hệ & giao diện web

Vào menu **Liên hệ & thông tin**. Đây là nơi sửa **chữ và thông tin liên hệ hiển thị trên web**. Sửa xong nhớ bấm nút **Lưu** ở cuối trang (lưu **toàn bộ** một lần).

Trang chia 3 phần:

### A. Thương hiệu & trang chủ
- **Tên thương hiệu** — tên hiển thị khắp web (header, tiêu đề). Đây chính là cái quyết định "AmberLumia" hay tên khác.
- **Dòng phụ logo (header)** — chữ nhỏ dưới logo, ví dụ `ĐÈN & NỘI THẤT CAO CẤP`.
- **Slogan** — câu khẩu hiệu hiện ở thanh trên cùng và trên banner.
- **Dòng nhỏ trên banner** — chữ nhỏ phía trên tiêu đề banner.

### B. Thanh giới thiệu (3 cột)
Ba ô giới thiệu điểm mạnh hiển thị trên trang chủ (ví dụ: *Giao hàng nhanh*, *Bảo hành chính hãng*, *Tư vấn miễn phí*). Mỗi cột gồm **tiêu đề** + **mô tả**.

### C. Liên hệ & mạng xã hội
- **Tên công ty**, **MST** (mã số thuế), **Địa chỉ**, **Email**.
- **SĐT chính**, **SĐT phụ** — hiện ở trang Liên hệ, khách bấm để gọi.
- **Facebook URL** — dán link fanpage (để trống nếu không có).
- **Zalo (URL hoặc SĐT)** — dán **link Zalo** hoặc chỉ cần **nhập số điện thoại Zalo**; nút "Chat Zalo" sẽ tự mở đúng. Nếu để trống, hệ thống tự dùng SĐT chính làm Zalo.

> 💡 Mọi thay đổi ở trang này chỉ có hiệu lực **sau khi bấm Lưu**. Sau khi lưu, mở trang công khai (`/lien-he`) để kiểm tra lại.

---

## 11. Quản lý Tài khoản quản trị

Vào menu **Tài khoản**. Trang gồm 3 phần:

### A. Thông tin của tôi
- Sửa **Họ tên** và **Email đăng nhập** của chính bạn → bấm **Lưu thông tin**.
- ⚠️ Nếu đổi email, **lần sau đăng nhập phải dùng email mới**.

### B. Đổi mật khẩu
1. Nhập **Mật khẩu hiện tại**.
2. Nhập **Mật khẩu mới** (tối thiểu **8 ký tự**).
3. Nhập lại **Xác nhận mật khẩu mới** (phải khớp).
4. Bấm **Đổi mật khẩu**.

### C. Quản lý tài khoản admin (thêm/xoá người quản trị khác)
- **Thêm tài khoản:** nhập Email, Họ tên, Mật khẩu (≥ 8 ký tự) → bấm **Thêm tài khoản**.
- **Đặt lại MK:** trong bảng, bấm **Đặt lại MK** ở dòng người cần đổi → nhập mật khẩu mới → **Lưu mật khẩu**. Dùng khi ai đó quên mật khẩu.
- **Xoá:** bấm **Xoá** ở dòng tài khoản cần gỡ. *(Bạn không thể tự xoá chính mình.)*

> 🔐 **Khuyến nghị:** Mỗi nhân viên một tài khoản riêng, không dùng chung. Đặt mật khẩu mạnh (chữ hoa, chữ thường, số). Khi nhân viên nghỉ việc, hãy **xoá** hoặc **đổi mật khẩu** tài khoản đó.

---

## 12. Mẹo & xử lý sự cố thường gặp

| Tình huống | Cách xử lý |
|-----------|-----------|
| **Không đăng nhập được** | Kiểm tra lại email/mật khẩu (chú ý chữ hoa/thường, dấu cách thừa). Nếu quên, nhờ một admin khác vào **Tài khoản → Đặt lại MK** giúp. |
| **Cập nhật xong khách không thấy** | (1) Kiểm tra đã tích **Hiển thị** chưa. (2) Ở trang Cài đặt phải bấm **Lưu**. (3) Bấm **Tải lại trang** (F5) hoặc xoá cache trình duyệt. |
| **Thêm sản phẩm báo thiếu ảnh** | Phải tải lên **ít nhất 1 ảnh** trước khi bấm Thêm sản phẩm. |
| **Upload ảnh báo lỗi** | Thử ảnh nhẹ hơn (nén bớt dung lượng), định dạng JPG/PNG, kiểm tra mạng rồi tải lại. |
| **Lỡ xoá nhầm** | Dữ liệu đã xoá **không khôi phục được** — phải nhập lại. Lần sau nên **bỏ tích Hiển thị** thay vì xoá nếu chỉ muốn ẩn tạm. |
| **Sản phẩm sai nhóm / nhóm hiển thị lộn xộn** | Sửa lại trường **Nhóm** của sản phẩm, hoặc chỉnh **Thứ tự** của nhóm/sản phẩm. |
| **Ảnh bìa không đúng** | Vào sửa sản phẩm → ở danh sách ảnh bấm **Đặt làm bìa** cho ảnh muốn dùng. |
| **Muốn tạm dừng bán 1 sản phẩm** | Vào sửa sản phẩm → đổi **Loại hàng** sang *Đang cập nhật* hoặc bỏ tích **Hiển thị**. |

### Vài nguyên tắc vàng
- ✅ **Luôn bấm Lưu / Cập nhật** sau khi sửa.
- ✅ **Đăng xuất** khi dùng máy chung.
- ✅ Muốn ẩn → **bỏ tích Hiển thị**, đừng xoá.
- ✅ Ảnh đẹp, rõ nét, dung lượng vừa phải giúp web tải nhanh và chuyên nghiệp hơn.
- ✅ Sau khi cập nhật, mở **trang công khai** để xem khách sẽ thấy thế nào.

---

*Nếu gặp lỗi không xử lý được, hãy chụp màn hình thông báo lỗi (dòng chữ đỏ) và gửi cho bộ phận kỹ thuật để được hỗ trợ nhanh.*
