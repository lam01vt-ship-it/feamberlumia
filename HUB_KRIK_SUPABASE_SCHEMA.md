# 🗄️ Cấu trúc cơ sở dữ liệu — Supabase `hub.krik.vn`

> Tài liệu sinh tự động từ chính database Supabase của công ty (project
> `pjotciwxckygxbkxgtlw`, PostgreSQL 17, region ap-southeast-1).
> Dùng để tìm hiểu hệ thống. Mục 3 mô tả **đầy đủ** schema `public`;
> các schema nghiệp vụ khác (hrm, store, integration…) liệt kê ở mục 4 — báo tôi
> nếu cần đào sâu cột chi tiết của bất kỳ schema nào.

---

## 1. Tổng quan hệ thống

Đây là **nền tảng ERP/vận hành nội bộ** (internal hub) cho chuỗi bán lẻ thời trang, gồm:
phân quyền (IAM/RBAC), nhân sự (HRM), vận hành & tài chính cửa hàng, tích hợp POS
**Nhanh.vn** + **Lark** + **Zalo** + **SePay** + **BigQuery**, phân tích KPI/khách hàng,
kế toán hợp đồng thuê, và quản lý dự án nội bộ kiểu Kanban.

| Hạng mục | Giá trị |
|---|---|
| Nền tảng | **Supabase** (PostgreSQL 17.6) |
| Project ref | `pjotciwxckygxbkxgtlw` (host `db.pjotciwxckygxbkxgtlw.supabase.co`) |
| Xác thực | **Supabase Auth** (`auth.users`) — mọi `user_id` đều FK về đây |
| Bảo mật dữ liệu | **RLS bật** ở hầu hết bảng (xem cảnh báo mục 6) |
| Migrations | có schema `supabase_migrations` (quản lý qua Supabase CLI) |

### Bản đồ các schema

| Schema | Bảng | View | MatView | Functions | Vai trò |
|---|---:|---:|---:|---:|---|
| `public` | 99 | 22 | 4 | 322 | Lõi: IAM, org, sys, sales, scoring, analytics, projects, transfer |
| `hrm` | 107 | 11 | 0 | 173 | Nhân sự: tuyển dụng (ATS), chấm công, lương, hợp đồng |
| `store` | 36 | 8 | 0 | 14 | Vận hành cửa hàng: CRM, tài chính, sản xuất, ops |
| `integration` | 22 | 0 | 0 | 2 | Tích hợp ngoài: Nhanh.vn, Zalo, SePay, BigQuery, GSheet |
| `analytics` | 12 | 0 | 0 | 7 | KPI targets/actuals, phân tích sản phẩm |
| `accounting` | 5 | 0 | 0 | 4 | Hợp đồng thuê mặt bằng & thanh toán |
| `data_center` | 2 | 1 | 0 | — | Log đồng bộ BigQuery / snapshot |
| `bidv_tool` | 2 | 0 | 0 | — | Công cụ đối soát BIDV (virtual account) |
| *(hệ thống Supabase)* | | | | | `auth`, `storage`, `realtime`, `vault`, `cron`, `net`, `extensions`, `graphql_public` |

> **Ghi chú về functions:** `public` có **322 functions** (rất nhiều RPC/trigger),
> `hrm` 173, `store` 14, `analytics` 7, `accounting` 4. Logic nghiệp vụ chủ yếu nằm
> trong các stored function này (đặc trưng của kiến trúc Supabase).

---

## 2. Quy ước đọc

- Kiểu: `uuid`, `bigint`, `integer`, `text`, `boolean`, `jsonb`, `date`,
  `timestamptz` (timestamp with time zone), `numeric(p,s)`, `text[]` (mảng), `inet`.
- **PK** = khóa chính. **FK** = khóa ngoại. `auth.users` = bảng người dùng của Supabase Auth.
- Nhóm bảng nhận biết qua tiền tố: `iam_` (phân quyền mới), `sys_` (hệ thống/legacy),
  `org_` (cơ cấu tổ chức), `ref_`/`vn_` (dữ liệu tham chiếu), `project_`/`projects`/`iterations`
  (quản lý dự án), `scoring_` (chấm điểm cửa hàng), `sales_` (vận hành bán hàng),
  `transfer_` (điều chuyển hàng), `analytics_` (phân tích), `mv_`/`view_`/`v_` (view/matview).

---

## 3. Schema `public` — chi tiết đầy đủ

### 3.1 IAM / Phân quyền (RBAC mới — tiền tố `iam_`)

> Mô hình RBAC chuẩn: **User → Role → Permission**, có scope theo vùng/cửa hàng (anchor),
> nhóm người dùng (group), và bảng "flat" để tra cứu nhanh.

**iam_module** — PK `id` — nhóm chức năng cấp cao
`id bigint NN | code text NN | name text NN | sort_order integer NN | active boolean NN`

**iam_resource** — PK `id` — tài nguyên trong module
`id bigint NN | module_id bigint NN | code text NN | name text NN | sort_order integer | active boolean`
FK: module_id → iam_module(id)

**iam_action** — PK `id` — hành động (view/edit/…)
`id bigint NN | code text NN | name text NN | sort_order integer | is_standard boolean NN`

**iam_permission** — PK `id` — quyền = module+resource+action
`id bigint NN | key text NN | domain text NN | resource text NN | action text NN | is_scoped boolean NN | scope_merge text NN | cls_column boolean NN | module_id bigint | resource_id bigint | action_id bigint`
FK: module_id → iam_module, resource_id → iam_resource, action_id → iam_action

**iam_role** — PK `id`
`id bigint NN | code text NN | name text NN | dept_id text | is_composable boolean NN | department_id bigint`
FK: department_id → org_department(id)

**iam_role_include** — PK (role_id, includes_role_id) — role kế thừa role
`role_id bigint NN | includes_role_id bigint NN`
FK: cả hai → iam_role(id)

**iam_role_permission** — PK (role_id, permission_id) — gán quyền cho role
`role_id bigint NN | permission_id bigint NN | scope text NN`
FK: role_id → iam_role, permission_id → iam_permission

**iam_user_profile** — PK `user_id`
`user_id uuid NN | employee_id text | display_name text | dept_id text`
FK: user_id → auth.users(id)

**iam_user_role** — PK (user_id, role_id)
`user_id uuid NN | role_id bigint NN`
FK: user_id → iam_user_profile, role_id → iam_role

**iam_user_role_anchor** — PK (user_id, role_id) — phạm vi (vùng/cửa hàng) của role
`user_id uuid NN | role_id bigint NN | scope_type text NN | scope_ref text | anchor_region_id bigint | anchor_store_id bigint`
FK: (user_id,role_id) → iam_user_role, anchor_region_id → org_region, anchor_store_id → org_store

**iam_user_permission** — PK `id` — quyền cấp trực tiếp cho user (allow/deny)
`id bigint NN | user_id uuid NN | permission_id bigint | effect text NN | scope text | scope_ref text | reason text NN | granted_by uuid | expires_at timestamptz | perm_pattern text`
FK: user_id → iam_user_profile, permission_id → iam_permission

**iam_user_permission_flat** — PK (user_id, permission_key, scope_ref) — bảng tra cứu nhanh (đã giải phẳng)
`user_id uuid NN | permission_key text NN | scope_level text NN | scope_ref text NN`

**iam_user_group** — PK `id`
`id bigint NN | code text NN | name text NN | description text | active boolean NN | created_at timestamptz NN | updated_at timestamptz NN`

**iam_user_group_member** — PK (group_id, user_id)
`group_id bigint NN | user_id uuid NN | created_at timestamptz NN`
FK: group_id → iam_user_group, user_id → app_user(user_id)

**iam_user_group_role** — PK `id` — role gán cho cả nhóm (kèm anchor)
`id bigint NN | group_id bigint NN | role_id bigint NN | scope_type text NN | anchor_region_id bigint | anchor_store_id bigint | scope_ref text | created_at timestamptz NN`
FK: group_id → iam_user_group, role_id → iam_role, anchor_region_id → org_region, anchor_store_id → org_store

**iam_runtime_flag** — PK `flag` — cờ bật/tắt tính năng runtime
`flag text NN | enabled boolean NN`

**iam_audit_log** — PK `id` — nhật ký thay đổi phân quyền
`id bigint NN | actor_id uuid | action text | target_user uuid | target_permission text | before jsonb | after jsonb | at timestamptz NN`

### 3.2 Phân quyền/legacy (tiền tố `sys_`, `app_`, `user_`)

> Hệ phân quyền cũ tồn tại song song với `iam_` (đang trong quá trình refactor — xem bảng backup `_rbac_refactor_backup_20260531`).

**sys_profiles** — PK `id` — hồ sơ người dùng (1-1 với auth.users)
`id uuid NN | email text NN | full_name text NN | created_at timestamptz | updated_at timestamptz | avatar_url text | phone text | lark_user_id text`
FK: id → auth.users(id)

**sys_roles** — PK `id`
`id uuid NN | name text NN | display_name text NN | description text | store_access_type text NN | is_system boolean NN | is_active boolean NN | created_at timestamptz | updated_at timestamptz | department text`

**sys_role_permissions** — PK `id`
`id uuid NN | role_name text NN | permission text NN | created_at timestamptz`
FK: role_name → sys_roles(name)

**sys_user_roles** — PK `id` — role + cửa hàng/vùng được phép (legacy)
`id uuid NN | user_id uuid NN | role text NN | allowed_stores text[] | created_at timestamptz | active boolean NN | allowed_areas text[]`
FK: role → sys_roles(name), user_id → auth.users(id)

**app_user** — PK `user_id` — danh bạ nhân viên (liên kết org)
`user_id uuid NN | employee_code text | full_name text | email text | department_id bigint | primary_store_id bigint | position_id bigint | manager_id uuid | active boolean NN | created_at timestamptz NN | updated_at timestamptz NN`
FK: user_id → auth.users, department_id → org_department, primary_store_id → org_store, position_id → org_position, manager_id → app_user(user_id)

**user_modules** — PK `id` — user được vào module nào
`id uuid NN | user_id uuid NN | module text NN | created_at timestamptz NN`
FK: user_id → auth.users(id)

**user_filter_configs** — PK `id` — cấu hình bộ lọc theo user/module
`id uuid NN | user_id uuid NN | module text NN | config jsonb NN | is_default boolean NN | created_at timestamptz NN | updated_at timestamptz NN`
FK: user_id → auth.users(id)

### 3.3 Cơ cấu tổ chức (tiền tố `org_`)

**org_region** — PK `id` — vùng/khu vực
`id bigint NN | code text NN | name text NN | note text | active boolean NN | created_at timestamptz NN | updated_at timestamptz NN`

**org_department** — PK `id` — phòng ban (có cây cha-con)
`id bigint NN | code text | name text NN | parent_id bigint | manager_user_id uuid | sort_order integer NN | active boolean NN | created_at timestamptz NN | updated_at timestamptz NN`
FK: parent_id → org_department(id), manager_user_id → app_user(user_id)

**org_store** — PK `id` — cửa hàng
`id bigint NN | code text NN | name text NN | address text | region_id bigint | logo_url text | source text | external_id text | synced_at timestamptz | active boolean NN | created_at timestamptz NN | updated_at timestamptz NN`
FK: region_id → org_region(id)

**org_position** — PK `id` — chức danh
`id bigint NN | code text | name text NN | default_role_id bigint | active boolean NN | created_at timestamptz NN | updated_at timestamptz NN`
FK: default_role_id → iam_role(id)

### 3.4 Tiện ích hệ thống (tiền tố `sys_`)

**sys_activity_logs** — PK `id` — nhật ký hoạt động (3.616 dòng)
`id uuid NN | user_id uuid NN | user_name text NN | action text NN | store_name text | transaction_id uuid | data jsonb | created_at timestamptz`
FK: user_id → auth.users, transaction_id → store.fin_transactions(id)

**sys_notifications** — PK `id` — thông báo trong hệ thống
`id uuid NN | notification_type text NN | title text NN | message text | severity text | module text NN | related_table text | related_record_id uuid | action_url text NN | action_params jsonb | target_user_id uuid | target_store_code text | target_role text | is_read boolean | read_at timestamptz | read_by uuid | expires_at timestamptz | created_at timestamptz NN | updated_at timestamptz NN`
FK: target_user_id → auth.users, read_by → auth.users

**sys_comments** — PK `id` — bình luận đa thực thể (có cây cha-con, reactions)
`id uuid NN | entity_type text NN | entity_id text NN | user_id uuid NN | parent_id uuid | content text | attachments text[] | mentions text[] | reactions jsonb | is_edited boolean | created_at timestamptz | updated_at timestamptz`
FK: user_id → sys_profiles, parent_id → sys_comments(id)

**sys_follows** — PK `id` — theo dõi thực thể
`id uuid NN | entity_type text NN | entity_id text NN | user_id uuid NN | created_at timestamptz NN`
FK: user_id → auth.users

**sys_credentials** — PK `id` — kho khóa/bí mật dịch vụ (gắn Vault)
`id uuid NN | name text NN | description text | vault_secret_id uuid | key_type text NN | environment text NN | service_tag text NN | service_group text | status text NN | expires_at timestamptz | rotation_policy_days integer | last_rotated_at timestamptz | created_by uuid | updated_by uuid | created_at timestamptz NN | updated_at timestamptz NN`
FK: created_by/updated_by → auth.users

**sys_credential_audit_log** — PK `id`
`id uuid NN | credential_id uuid NN | user_id uuid | user_email text | action text NN | details jsonb | ip_address text | created_at timestamptz NN`
FK: credential_id → sys_credentials, user_id → auth.users

**sys_file_metadata** — PK `id` — metadata mọi file upload (17.777 dòng)
`id uuid NN | file_path text NN | file_name text NN | file_size bigint NN | mime_type text NN | bucket_id text NN | module text NN | entity_type text NN | entity_id text | store_id uuid | uploaded_by uuid | uploaded_at timestamptz NN | metadata jsonb | deleted_at timestamptz | deleted_by uuid | created_at timestamptz NN | updated_at timestamptz NN`
FK: store_id → sys_store_locations, uploaded_by/deleted_by → auth.users

**sys_error_logs** — PK `id` — lỗi phía client
`id uuid NN | level text NN | message text NN | error_message text | metadata jsonb | url text | user_agent text | created_at timestamptz NN`

**sys_impersonation_sessions** — PK `id` — phiên Admin "xem với tư cách user khác"
`id uuid NN | admin_user_id uuid NN | admin_email text NN | target_user_id uuid NN | target_email text NN | target_role text NN | scope_override_stores text[] | scope_override_areas text[] | is_virtual boolean NN | user_agent text | ip_address inet | started_at timestamptz NN | ended_at timestamptz | ended_reason text`
FK: admin_user_id/target_user_id → auth.users

**sys_store_locations** — PK `id` — địa điểm cửa hàng (toạ độ, QR chấm công)
`id uuid NN | name text NN | location text | area text | created_at timestamptz | updated_at timestamptz | store_code text | latitude numeric(10,8) | longitude numeric(11,8) | area_id uuid | logo_url text | sub_account_number text | attendance_uuid uuid | qr_generated_at timestamptz`
FK: area_id → sys_store_areas(id)

**sys_store_areas** — PK `id`
`id uuid NN | area_code varchar(20) NN | area_name varchar(100) NN | description text | active boolean | created_at timestamptz | updated_at timestamptz`

**sys_tokens** — PK `service` — token OAuth dịch vụ ngoài
`service text NN | access_token text NN | refresh_token text NN | expires_at timestamptz NN | updated_at timestamptz`

**sys_user_favorites** — PK `id`
`id uuid NN | user_id uuid NN | module_id text NN | created_at timestamptz NN`
FK: user_id → auth.users

**sys_user_feedbacks** — PK `id`
`id uuid NN | user_id uuid | user_email text | content text NN | image_url text | status text | admin_notes text | created_at timestamptz | updated_at timestamptz`
FK: user_id → auth.users

### 3.5 Dữ liệu tham chiếu (tiền tố `ref_`, `vn_`)

**ref_categories** — PK `id` — danh mục (dùng enum `category_type`)
`id uuid NN | category text NN | category_type category_type NN | description text | created_at timestamptz | category_parent text | level integer`

**ref_product_form_codes** — PK `code` — mã dáng sản phẩm
`code text NN | label text NN | sort_order integer NN | product_group text NN`

**ref_time_weeks** — PK `id` — định nghĩa tuần KPI
`id uuid NN | week_name varchar(50) NN | start_date date NN | end_date date NN | active boolean | created_by varchar(255) | created_at timestamptz | updated_at timestamptz`

**ref_week_days** — PK (week_id, day_date) — chi tiết ngày trong tuần KPI
`week_id uuid NN | day_date date NN | day_name varchar(20) NN | day_of_week integer NN | is_weekend boolean`
FK: week_id → ref_time_weeks(id)

**ref_tet_holidays** — PK `year` — ngày Tết theo năm
`year integer NN | tet_date date NN`

**vn_provinces** — PK `code` — Tỉnh/Thành (sau sáp nhập 07/2025)
`code integer NN | name text NN | division_type text NN | codename text NN | phone_code integer | synced_at timestamptz NN`

**vn_wards** — PK `code` — Phường/Xã (FK trực tiếp tỉnh, không còn quận/huyện)
`code integer NN | name text NN | division_type text NN | codename text NN | province_code integer NN | synced_at timestamptz NN`
FK: province_code → vn_provinces(code)

### 3.6 Quản lý dự án nội bộ (Kanban/Scrumban)

**projects** — PK `id`
`id uuid NN | code text NN | name text NN | description text | status text NN | priority text NN | start_date date | target_deadline date | actual_completed_at timestamptz | lead_id uuid | requester_dept text | request_id uuid | created_by uuid | created_at timestamptz NN | updated_at timestamptz NN | default_view text NN`
FK: lead_id/created_by → auth.users, request_id → project_requests(id)

**project_requests** — PK `id` — yêu cầu từ phòng ban khác (hàng đợi triage)
`id uuid NN | code text NN | title text NN | description text | requester_id uuid NN | requester_dept text NN | proposed_deadline date | proposed_priority text NN | status text NN | review_note text | reviewed_by uuid | reviewed_at timestamptz | converted_to_project_id uuid | converted_to_task_id uuid | created_at timestamptz NN | updated_at timestamptz NN`
FK: requester_id/reviewed_by → auth.users, converted_to_project_id → projects, converted_to_task_id → project_tasks

**project_tasks** — PK `id` — đầu việc trên bảng Kanban (có task cha-con)
`id uuid NN | code text NN | title text NN | description text | project_id uuid | assignee_id uuid | status text NN | priority text NN | size text NN | iteration_id uuid | target_deadline date | started_at timestamptz | completed_at timestamptz | is_blocked boolean NN | blocked_reason text | blocked_at timestamptz | last_alerted_at timestamptz | request_id uuid | created_by uuid | created_at timestamptz NN | updated_at timestamptz NN | parent_task_id uuid`
FK: project_id → projects, assignee_id/created_by → auth.users, iteration_id → iterations, request_id → project_requests, parent_task_id → project_tasks(id)

**project_task_history** — PK `id` — lịch sử chuyển trạng thái task
`id uuid NN | task_id uuid NN | from_status text | to_status text NN | changed_by uuid | changed_at timestamptz NN | note text`
FK: task_id → project_tasks, changed_by → auth.users

**project_comments** — PK `id` — bình luận đa thực thể (request/project/task)
`id uuid NN | target_type text NN | target_id uuid NN | author_id uuid NN | body text NN | mentions uuid[] NN | created_at timestamptz NN`
FK: author_id → auth.users

**iterations** — PK `id` — chu kỳ sprint (~2 tuần)
`id uuid NN | name text NN | goal text | start_date date NN | end_date date NN | status text NN | created_by uuid | created_at timestamptz NN | updated_at timestamptz NN`
FK: created_by → auth.users

### 3.7 Chấm điểm cửa hàng (tiền tố `scoring_`)

**scoring_criteria_groups** — PK `id` — nhóm tiêu chí
`id uuid NN | code text NN | name text NN | sort_order integer NN | active boolean NN | created_at timestamptz NN | description text | deleted_at timestamptz | deleted_by uuid`

**scoring_criteria** — PK `id` — tiêu chí
`id uuid NN | group_id uuid NN | code text NN | name text NN | check_method text NN | active boolean NN | sort_order integer NN | activated_at timestamptz | deactivated_at timestamptz | created_at timestamptz NN | updated_at timestamptz NN | description text | deleted_at timestamptz | deleted_by uuid`
FK: group_id → scoring_criteria_groups(id)

**scoring_sessions** — PK `id` — phiên chấm điểm (điểm, grade, khiếu nại)
`id uuid NN | store_code text NN | area_code text | score_date date NN | week_label text | scored_by uuid NN | active_criteria_count integer NN | passed_count integer NN | score_5 numeric(3,2) NN | pct numeric(5,2) NN | grade text NN | status text NN | note text | submitted_at timestamptz NN | complaint_deadline timestamptz NN | complaint_reason text | complaint_by uuid | complaint_at timestamptz | finalized_at timestamptz | last_edited_by uuid | last_edited_at timestamptz | created_at timestamptz NN`

**scoring_session_items** — PK `id` — kết quả từng tiêu chí (có snapshot tên)
`id uuid NN | session_id uuid NN | criteria_id uuid | criteria_code text | group_name_snapshot text | criteria_name_snapshot text NN | passed boolean NN | note text`
FK: criteria_id → scoring_criteria, session_id → scoring_sessions

**scoring_session_history** — PK `id`
`id uuid NN | session_id uuid NN | action text NN | actor_id uuid | actor_role text | before jsonb | after jsonb | reason text | created_at timestamptz NN`
FK: session_id → scoring_sessions

**scoring_criteria_history** — PK `id`
`id uuid NN | target_type text NN | target_id uuid NN | target_name text | group_id uuid | action text NN | actor_id uuid | actor_role text | before jsonb | after jsonb | detail text | created_at timestamptz NN`

### 3.8 Vận hành bán hàng (tiền tố `sales_`)

**sales_vm_sessions** — PK `id` — phiên trưng bày VM theo tuần
`id uuid NN | store_id uuid NN | store_code text NN | session_week date NN | status text NN | started_at timestamptz NN | started_by uuid | completed_at timestamptz | completed_by uuid | note text | created_at timestamptz NN | updated_at timestamptz NN | actor_name text`
FK: store_id → sys_store_locations, started_by/completed_by → sys_profiles

**sales_vm_session_items** — PK `id` — sản phẩm trong phiên VM (snapshot số liệu)
`id uuid NN | session_id uuid NN | group_code text NN | full_code text | short_code text | product_name text | category_name text | avatar_url text | rank integer NN | checked boolean NN | checked_at timestamptz | checked_by uuid | note text | snap_sold_7d numeric | snap_avg_per_day numeric | snap_stock numeric | snap_captured_at timestamptz | eval_sold_7d numeric | eval_stock numeric | eval_captured_at timestamptz | created_at timestamptz NN | updated_at timestamptz NN`
FK: session_id → sales_vm_sessions, checked_by → sys_profiles

**sales_check_trung_treo_sessions** — PK `id` — phiên "check trưng treo" (1 phiên/cửa hàng/ngày)
`id uuid NN | store_id uuid NN | store_code text NN | session_date date NN | size_rule_default integer NN | category_size_rules jsonb NN | category_filters text[] NN | category_type text NN | internal_category_filters text[] NN | exclude_category_ids integer[] NN | status text NN | notes text | total_recommended integer NN | total_displayed integer NN | total_need_to_add integer NN | display_ratio_pct numeric(5,2) | inventory_snapshot_at timestamptz | created_by uuid | done_by uuid | created_at timestamptz NN | updated_at timestamptz NN | done_at timestamptz`
FK: store_id → sys_store_locations, created_by/done_by → sys_profiles

**sales_check_trung_treo_session_items** — PK `id`
`id uuid NN | session_id uuid NN | barcode text NN | product_code text NN | product_name text NN | category_name text | short_code text | parent_code_color text | size text | size_rank numeric | available_qty integer NN | is_recommended boolean NN | is_currently_displayed boolean NN | is_marked_to_add boolean NN | derived_status text | note text | created_at timestamptz NN`
FK: session_id → sales_check_trung_treo_sessions

**sales_check_trung_treo_session_events** — PK `id` — nhật ký sự kiện phiên
`id uuid NN | session_id uuid NN | event_type text NN | payload jsonb NN | created_at timestamptz NN | created_by uuid`
FK: session_id → sales_check_trung_treo_sessions, created_by → sys_profiles

**sales_check_trung_treo_orphan_barcode** — PK `id` — barcode không khớp
`id uuid NN | session_id uuid NN | barcode text NN | source text NN | reason text | created_at timestamptz NN`
FK: session_id → sales_check_trung_treo_sessions

**sales_check_trung_treo_user_prefs** — PK `user_id` — tuỳ chọn lọc theo user
`user_id uuid NN | prefs jsonb NN | created_at timestamptz NN | updated_at timestamptz NN`
FK: user_id → auth.users

**sales_sync_log** — PK `id` — log đồng bộ bán hàng (199.919 dòng)
`id bigint NN | store_code text NN | sync_date date NN | status text NN | message text | row_count integer | sync_completed_at timestamptz | created_at timestamptz | store_name text | sync_started_at timestamptz | error_message text | sync_type text | triggered_by uuid`
FK: triggered_by → auth.users

**sample_collection_log** — PK `id` — log thu mẫu (32.807 dòng)
`store_code text NN | store_name text | bill_date date NN | hour_range text | collected_by text | note text | collected_at timestamptz | created_at timestamptz | filtered_at timestamptz | id uuid NN`

### 3.9 Điều chuyển hàng (tiền tố `transfer_`)

**transfer_request_cycles** — PK `cycle_code` — chu kỳ điều chuyển
`cycle_code text NN | period_start date NN | period_end date NN | status text NN | allocation_method text NN | created_at timestamptz NN | closed_at timestamptz | exported_at timestamptz`

**transfer_requests** — PK `id` — yêu cầu điều chuyển của cửa hàng
`id bigint NN | cycle_code text NN | store_code text NN | product_code text NN | nhanh_product_id bigint | requested_qty integer NN | sold_7d_at_submit integer NN | stock_at_submit integer NN | note text | status text NN | created_at timestamptz NN | created_by uuid | updated_at timestamptz NN`
FK: cycle_code → transfer_request_cycles(cycle_code)

**transfer_allocations** — PK `id` — phân bổ nguồn cho yêu cầu
`id bigint NN | request_id bigint NN | source_type text NN | source_code text NN | allocated_qty integer NN | created_at timestamptz NN | created_by uuid`
FK: request_id → transfer_requests(id)

### 3.10 Phân tích khách hàng & cửa hàng (tiền tố `analytics_`)

> Các bảng số liệu tổng hợp theo "mùa" (season) — phục vụ dashboard. Hầu hết là bảng kết quả (được pipeline ghi vào).

| Bảng | PK | Mục đích |
|---|---|---|
| analytics_customer_day_offline | mobile, bill_date, store_code | Doanh số khách theo ngày (798.922 dòng) |
| analytics_customer_offline_dim | mobile | Hồ sơ khách offline (357.301 dòng) |
| analytics_store_dim | store_code | Chiều cửa hàng (tuổi shop, format…) |
| analytics_customer_base_pulse_by_season | season_code, scope_type, scope_value | Nhịp tệp khách theo mùa |
| analytics_customer_age_mix_by_season | season_code, store_code, breakdown_type, breakdown_value | Cơ cấu tuổi |
| analytics_store_customer_scorecard_by_season | season_code, store_code | Scorecard khách theo shop |
| analytics_store_traffic_conversion_by_season | season_code, store_code | Lượt ghé & tỉ lệ chuyển đổi |
| analytics_store_traffic_demographics_by_season | season_code, store_code, breakdown_type, breakdown_value | Nhân khẩu lượt ghé |
| analytics_store_traffic_hourly_pattern_by_season | season_code, store_code, hour | Lượt ghé theo giờ |
| analytics_customer_cohort_retention_by_season | cohort_season, active_season, acq_channel | Giữ chân theo cohort |
| analytics_customer_value_summary_by_season | season_code, is_new | Giá trị khách (mới/cũ) |
| analytics_customer_freq_dist_by_season | season_code, freq_bucket | Phân bố tần suất mua |
| analytics_customer_spend_decile_by_season | season_code, decile | Phân vị chi tiêu |
| analytics_customer_discount_cohort | cohort_season, price_type | Cohort theo loại giá/giảm giá |
| analytics_category_customer_mix_by_season | season_code, category_name, age_bucket | Mix ngành hàng × tuổi |
| analytics_customer_province_channel_by_season | season_code, province_norm, channel | Theo tỉnh × kênh |
| analytics_customer_season_flow | season_code, scope_type, scope_value | Dòng chảy khách giữa các mùa |

### 3.11 Hạ tầng / tiện ích khác

**app_config_links** — PK `id` — link cấu hình (docs/help)
`id uuid NN | key varchar(100) NN | title varchar(200) NN | url text NN | icon varchar(50) | description text | is_active boolean | created_at timestamp | updated_at timestamp`

**custom_checks** — PK `id` — kiểm tra dữ liệu tùy biến (chạy SQL)
`id uuid NN | name text NN | description text | category text NN | severity text NN | sql_query text NN | columns_config jsonb NN | created_by uuid | created_at timestamptz | is_active boolean`
FK: created_by → auth.users

**debug_logs** — PK `id` (26.144 dòng) · **file_logs** — PK `id` (17.505 dòng, FK user_id → auth.users)
**lark_message_log** — PK `id` — log tin nhắn Lark; `status='recall'` sẽ kích Edge Function gỡ tin
`id bigint NN | message_id text NN | user_id text NN | message_type text | sent_at timestamptz | status text | recalled_at timestamptz | error_message text | metadata jsonb | created_at timestamptz | updated_at timestamptz`

**bq_obs_pipeline_freshness** — PK `table_fqn` — giám sát độ tươi pipeline BigQuery
**store_mapping** — PK `id` — ánh xạ mã cửa hàng giữa các hệ (Nhanh/Palexy/BQ)
**_inventory_mv_meta** — PK `id` — metadata refresh matview tồn kho
**_rbac_refactor_backup_20260531** — PK `snapshot_id` — ⚠️ **bảng backup tạm, RLS TẮT** (xem mục 6)

### 3.12 Views (`public`) — 22 view + 4 materialized view

**Materialized views (`mv_`)** — số liệu doanh thu/tồn kho dựng sẵn:
`mv_daily_online_revenue_valid`, `mv_monthly_retail_revenue`, `mv_online_revenue_finalized`,
`mv_product_inventory_grouped`.

**Views tồn kho realtime:** `view_inventory_realtime_by_depot`, `view_inventory_realtime_by_parent`,
`view_inventory_realtime_total`, `view_inventory_with_depot`.

**Views doanh thu / hóa đơn:** `view_nhanh_bills_retail`, `view_revenue_by_status_group_realtime`,
`view_revenue_online_success_reconcile`, `view_online_revenue_pending`, `nhanh_orders_pending`.

**Views sản phẩm:** `view_nhanh_products_full`, `view_parent_children_color_analysis`,
`bq_nhanh_product_category`, `bq_nhanh_internal_category`, `v_production_color_breakdown`,
`v_production_plan_sync_errors`, `gsheet_production_plan`.

**Views nhân sự/quyền:** `v_user_directory`, `v_user_group_directory`, `v_permission_matrix`.

**Views tài chính/khác:** `fin_store_bank_transfer_daily`, `store_bank_accounts`,
`v_orphaned_transfer_drafts`.

### 3.13 Enum tùy biến (`public`)

- **`category_type`** = `Thu Bán Hàng`, `Quỹ CH` — dùng ở `ref_categories.category_type`.

---

## 4. Các schema nghiệp vụ khác (danh mục bảng)

> Mỗi schema dưới đây là một module lớn. Liệt kê tên bảng để bạn nắm phạm vi;
> **báo tôi nếu muốn xuất chi tiết cột/PK/FK** của bất kỳ schema nào.

### 4.1 `hrm` — Nhân sự (107 bảng)
- **Tuyển dụng (ATS), tiền tố `ats_`:** applications, candidates, jobs, interviews, offers,
  requisitions, scorecard_templates/ratings, pipeline_templates, signoff_workflows/steps,
  channels, departments, locations, tags, templates, custom_fields, hiring_team_members,
  job_adverts/assignees/followers/views, role_members, role_permission_grants,
  module_permissions/role_caps, company_settings, approval_templates, phase_types,
  migration_map… (~37 bảng)
- **Chấm công:** attendance, attendance_adjustments/attempts/history/periods,
  tk_daily, tk_daily_overrides, tk_monthly, tk_raw, tk_shifts, tk_assignments,
  shift_actuals_csv_staging/errors.
- **Lương:** daily_salary, default_rates, rate_adjustments, salary_adjustments,
  payroll_configs, payroll_periods, staff_salary_history, batches,
  payment_requests, payment_request_lines, payment_request_line_days, payment_documents.
- **Nhân sự cố định (hr_fixed_*):** settings, positions, shift_templates,
  shift_actuals(+overrides), kpi_config, kpi_brackets, day_locks, month_locks(+audit).
- **Hồ sơ & tổ chức:** employees, staff_persons(+mismatch_review/overwrite_log),
  staff_work_history, hr_personnel, hr_contracts, hr_contract_types, hr_dependents,
  hr_job_history, hr_positions, hr_position_titles, hr_org_units, hr_workplaces,
  hr_leave_balances, hr_catalogs, departments, positions, banks.
- **Đơn từ (req_*):** req_requests, req_leave, req_absence, req_inout, req_mission,
  req_overtime, req_shift_changes.
- **Thời vụ & khác:** seasonal_workers, seasonal_registrations, fraud_config, fraud_reviews,
  audit_log, idempotency_keys, recompute_locks, item_detail_raw, store_o1_dept_bridge,
  user_employee_link.

### 4.2 `store` — Vận hành & tài chính cửa hàng (36 bảng)
- **CRM (`crm_`):** alteration_tickets/pricing/status_logs (sửa đồ), feedback_customers,
  feedback_assignees, feedback_audit_logs, complaint_status_logs,
  birthday_coupon_verifications/audit_logs/fraud_signals, zns_messages.
- **Tài chính (`fin_`):** transactions, bank_accounts, bank_transfer_daily,
  daily_deposits, daily_payments, deposit_notes, deposit_audit_logs,
  cash_deposit_config, payroll_configs.
- **Vận hành (`ops_`):** issues, issue_events, raw_events, services.
- **Sản xuất/SP (`prod_`):** catalog, merchandisers, sc_delivery_plans/actuals,
  sc_nhanh_receipts, sys_categories, sys_fabric_types, sys_form_types, sys_seasons.
- **Doanh thu Nhanh:** nhanh_daily_sales_summary, nhanh_store_daily_revenue,
  infoplus_webhook_debug.

### 4.3 `integration` — Tích hợp ngoài (22 bảng)
- **Nhanh.vn (`nhanh__`):** products, orders, order_products, order_status_mapping,
  bill_list, bill_list_items, inventory_total, inventory_deprecated, transfer_list,
  exchange_pairs, exchange_audit_logs, color_short_codes, internal_category_cache,
  product_category_cache, sync_rate_limit.
- **BigQuery (`bq__`):** nhanh_categories, nhanh_root_categories, product_sales_daily.
- **Khác:** `sepay__transactions` (cổng thanh toán), `zalo__oa_tokens`,
  `google__vision_usage`, `gsheet__production_plan`.

### 4.4 `analytics` — KPI & phân tích sản phẩm (12 bảng)
kpi_daily_targets(+_gs), kpi_daily_distribution, kpi_monthly_targets,
kpi_weekly_store_targets, kpi_store_daily_actuals,
product_ai_analysis, product_notes, product_note_history,
product_dim_cache, product_dim_categories, product_sales_snapshot.

### 4.5 `accounting` — Hợp đồng thuê (5 bảng)
lease_contracts, lease_payments, lease_due_formulas, lease_reminder_config, lease_attachments.

### 4.6 `data_center` (2) & `bidv_tool` (2)
- `data_center`: bq_product_sales_sync_log, snapshot_refresh_log.
- `bidv_tool`: va_map (virtual account), kytu_map.

---

## 5. Schema hệ thống của Supabase (tham khảo)

| Schema | Vai trò |
|---|---|
| `auth` | Người dùng & xác thực (`auth.users` là gốc của mọi `user_id`) |
| `storage` | File buckets (gắn với `public.sys_file_metadata`, `file_logs`) |
| `realtime` | Realtime subscriptions |
| `vault` | Lưu secret mã hóa (gắn `sys_credentials.vault_secret_id`) |
| `cron` (pg_cron) | Lập lịch job định kỳ (đồng bộ Nhanh, refresh matview…) |
| `net` (pg_net) | Gọi HTTP từ trong DB (webhook, Edge Function) |
| `extensions` | Các extension Postgres |
| `graphql_public` | GraphQL endpoint |
| `supabase_migrations` | Lịch sử migration (quản lý qua Supabase CLI) |

---

## 6. ⚠️ Cảnh báo bảo mật (Supabase advisory)

**Bảng `public._rbac_refactor_backup_20260531` đang TẮT Row Level Security (RLS).**
Nó chứa 855 dòng snapshot (jsonb) của dữ liệu phân quyền. Khi RLS tắt, **bất kỳ ai có
anon key** đều đọc/ghi được toàn bộ bảng này qua Supabase client.

Đây là bảng backup tạm (đặt tên theo ngày `20260531`). Khuyến nghị:
- **Nếu không cần nữa:** xóa bảng — `DROP TABLE public._rbac_refactor_backup_20260531;`
- **Nếu còn cần giữ:** bật RLS (sẽ chặn mọi truy cập qua anon/authenticated, chỉ còn
  service_role / kết nối trực tiếp đọc được):
  ```sql
  ALTER TABLE public._rbac_refactor_backup_20260531 ENABLE ROW LEVEL SECURITY;
  ```
  > Không tự ý chạy nếu chưa chắc — bật RLS mà không có policy sẽ khóa hết truy cập.

---

## 7. Cách tự truy vấn cấu trúc (để cập nhật tài liệu sau này)

Chạy trong **Supabase → SQL Editor**:

```sql
-- Danh sách bảng + cột của 1 schema
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'      -- đổi schema tại đây
order by table_name, ordinal_position;

-- Khóa ngoại của 1 schema
select conrelid::regclass as tbl, pg_get_constraintdef(oid) as fk
from pg_constraint
where contype='f' and connamespace='public'::regnamespace;

-- Danh sách function
select proname, pg_get_function_arguments(oid)
from pg_proc where pronamespace='public'::regnamespace order by proname;
```

> Tài liệu này phản ánh trạng thái DB tại thời điểm sinh. Khi schema đổi, chạy lại
> các truy vấn trên (hoặc nhờ tôi cập nhật).

---

## 8. Tích hợp phần mềm bên thứ 3 — cách kết nối & xử lý

Hệ thống tích hợp ngoài **không qua backend riêng**, mà chạy hoàn toàn trên hạ tầng
Supabase bằng 3 thành phần:

- **Edge Functions** (Deno/TypeScript) — ~95 hàm, là nơi gọi API bên thứ 3 / nhận webhook.
- **pg_cron** (schema `cron`) — 43 job hẹn giờ, kích hoạt sync định kỳ.
- **pg_net** (`net.http_post/get`) — cho phép gọi HTTP **ngay từ trong database** (cron và trigger dùng nó để gọi Edge Function hoặc API ngoài).
- **Vault** (`vault.decrypted_secrets`) + bảng `sys_tokens`, `zalo__oa_tokens`, `sys_credentials` — lưu khóa API / token.

### 8.1 Bốn mô hình kết nối (data flow)

**① Pull định kỳ (chủ động kéo về)** — phổ biến nhất:
```
cron.job (hẹn giờ) ──net.http_post──▶ Edge Function ──HTTPS──▶ API bên thứ 3
                                              │
                                              └──▶ ghi vào bảng integration.* / store.*
```
Ví dụ: `nhanh-sync-orders-daily`, `sync-bigquery-product-sales`, `sync-sepay-revenue`,
`sync-1office-checktime-recent`.

**② Webhook đẩy về (bên thứ 3 gọi vào)** — Edge Function để `verify_jwt=false` (public):
```
API bên thứ 3 ──HTTPS POST──▶ Edge Function (public) ──▶ xử lý ──▶ ghi DB ──▶ (tuỳ chọn) thông báo Lark/Zalo
```
Ví dụ: `nhanh-handle-order-webhook`, `nhanh-handle-inventory-product-webhook`,
`sepay-handle-revenue-cash-webhook`, `infoplus-handle-cash-deposit-webhook`,
`crm-submit-qr-feedback` (khách quét QR gửi feedback).

**③ Trigger trong DB tự gọi ra ngoài** — DB function dùng `net.http_post` để bắn thông báo realtime:
- `notify_lark_high_value_bill_v2` — có hóa đơn giá trị cao → gửi Lark.
- `trigger_lark_recall` — đổi trạng thái tin Lark sang `recall` → gọi `lark-recall-messages` gỡ tin.
- `_scoring_notify`, `notify_expiring_credentials`, `trigger_auto_sync_revenue`,
  `check_infoplus_sync_coverage`, `sync_ndss_palexy_morning_with_alert`.

**④ Xác thực OAuth / token tự gia hạn**:
- `zalo-token-refresher` (cron 12h/lần) — làm mới access token Zalo OA, lưu vào `zalo__oa_tokens`.
- `zalo-auth-callback`, `link-google` / `admin-link-google-identity` / `auto-link-google-after-oauth`
  — luồng OAuth liên kết tài khoản Google.
- Token/secret đọc từ **Vault** (`vault.decrypted_secrets`) ngay trong câu cron (Authorization Bearer).

### 8.2 Danh mục theo từng phần mềm bên thứ 3

| Phần mềm | Vai trò | Edge Functions / cơ chế chính | Lưu vào |
|---|---|---|---|
| **Nhanh.vn** (POS/kho) | Đơn hàng, sản phẩm, tồn kho, hóa đơn, danh mục, kho | `nhanh-sync-orders-daily`, `nhanh-sync-inventory`, `nhanh-import-products`, `nhanh-sync-categories`, `nhanh-sync-stores`, `nhanh-sync-warehouse-receipts`, `nhanh-fetch-bill-list-daily` + webhook `nhanh-handle-order-webhook`, `nhanh-handle-inventory-product-webhook` | `integration.nhanh__*` |
| **SePay** (ngân hàng/thu hộ) | Đối soát doanh thu chuyển khoản & tiền mặt | `sync-sepay-revenue`, `sepay-handle-revenue-cash-webhook`, `sepay-sync-va`, `sepay-lookup-va`, `sepay-reconcile-cash-deposits`, `sepay-resync-revenue-range` | `integration.sepay__transactions`, `store.fin_*` |
| **InfoPlus** (ngân hàng/VA) | Virtual account, QR nộp tiền mặt | `infoplus-sync-va`, `infoplus-create-cash-qr`, `infoplus-handle-cash-deposit-webhook`, `infoplus-reconcile-cash-deposits`, `infoplus-sync-revenue-transfer` | `store.fin_*`, `bidv_tool.va_map` |
| **Zalo OA / ZNS** | Gửi tin ZNS, đồng bộ đánh giá khách | `zalo-send-zns`, `zalo-token-refresher`, `zalo-auth-callback`, `crm-sync-zalo-reviews` | `store.crm_zns_messages`, `zalo__oa_tokens` |
| **Lark (Feishu)** | Báo cáo, thông báo, nút bấm tương tác | `lark-daily-report`, `notify-lark-mention`, `lark-handle-action`, `lark-recall-messages`, `send-lark-feedback`, `sync-lark-user-ids`, `scoring-lark-notify` | `public.lark_message_log` |
| **Google BigQuery** | Kho dữ liệu phân tích (bán hàng, mapping cửa hàng) | `sync-bigquery-product-sales`, `sync-bigquery-store-mapping`, `bq-pipeline-alert` | `integration.bq__*`, `public.store_mapping`, `analytics.*` |
| **Google Vision** | OCR ảnh / CV ứng viên | `ocr-google-vision`, `ocr-cv` | `integration.google__vision_usage` |
| **Google OAuth** | Đăng nhập / liên kết tài khoản Google | `link-google`, `admin-link-google-identity`, `auto-link-google-after-oauth` | `auth.identities` |
| **Google Sheets** | Kế hoạch sản xuất | `trigger-production-plan-sync` | `integration.gsheet__production_plan` |
| **1Office** (HRM ngoài) | Chấm công, nhân sự | `sync-1office-attendance-monthly`, `sync-1office-checktime-recent` + `hrm.sync_staff_persons_from_1office()` | `hrm.*` |
| **AI (LLM)** | Phân tích sản phẩm, sức khỏe cửa hàng, phân loại feedback | `product-report-ai`, `store-health-ai`, `crm-classify-feedback` | `analytics.product_ai_analysis` |
| **provinces.open-api.vn** | Đồng bộ tỉnh/phường | `sync-vn-provinces` | `public.vn_provinces`, `vn_wards` |

### 8.3 Lịch chạy (cron) tiêu biểu

| Cron job | Lịch | Việc |
|---|---|---|
| `refresh-inventory-grouped-1min` | `* * * * *` (mỗi phút) | Refresh matview tồn kho |
| `iam_resync_all` | mỗi phút | Đồng bộ lại bảng phẳng phân quyền |
| `scoring-finalize-overdue` | mỗi 15 giây | Chốt phiên chấm điểm quá hạn |
| `nhanh-sync-categories-30min` | `*/30 * * * *` | Sync danh mục Nhanh |
| `crm-sync-zalo-feedback-30min` | `0,30 * * * *` | Kéo đánh giá Zalo |
| `zalo-token-refresh-12h` | `0 */12 * * *` | Gia hạn token Zalo |
| `nhanh-sync-online-orders-daily` | `5 2,16 * * *` | Sync đơn online (2 lần/ngày) |
| `sepay-sync-daily` / `infoplus-sync-daily` | `0 18 * * *` | Đối soát doanh thu cuối ngày |
| `staff-kpi-1office-sync-*` | 3–4h sáng | Kéo chấm công 1Office |
| `accounting-lease-reminder-weekly` | `0 2 * * 1` (Thứ 2) | Nhắc hạn thanh toán thuê |

> Tổng cộng **43 cron job** đang bật. Cơ chế: cron gọi `net.http_post` tới Edge Function
> (kèm `Authorization: Bearer` lấy từ Vault), hoặc gọi trực tiếp DB function (`SELECT public.xxx()`).

### 8.4 Bảo mật & khóa API
- Secret (API key Nhanh/SePay/Lark/Google…) lưu trong **Supabase Vault**, đọc qua
  `vault.decrypted_secrets` — **không hardcode** trong code.
- Token OA Zalo lưu ở `zalo__oa_tokens`, token dịch vụ khác ở `sys_tokens` (có `expires_at`).
- `sys_credentials` quản lý vòng đời khóa (rotation policy, ngày hết hạn) + cron
  `check-expiring-credentials-daily` cảnh báo khóa sắp hết hạn.
- Webhook public (`verify_jwt=false`) nên xác thực bằng chữ ký/secret trong payload — cần
  rà soát từng hàm để chắc chắn (xem mục mở rộng nếu cần).

> 💡 Muốn xem **mã nguồn chi tiết** của một Edge Function cụ thể (cách gọi API, headers,
> xử lý response, ghi bảng nào) — báo tên hàm, tôi sẽ trích xuất đầy đủ code.
