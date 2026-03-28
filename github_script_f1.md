# KỊCH BẢN GITHUB ENTERPRISE AGILE (v3): CHỨC NĂNG 1

**Quy trình:** GitHub Flow – Nhánh `main` là Protected Branch (không ai push trực tiếp).
Mọi code PHẢI đi qua Pull Request + ít nhất 1 người Approve mới được Merge.

**3 Dev trên GitHub:**
- **A – Trương Vĩnh Kiệt** (Lead / Reviewer)
- **B – Nguyễn Minh Hiển** (Backend Dev)
- **C – Khoa Võ Tiến** (Frontend Dev)

> **CÁCH LÀM THỰC TẾ:** Mặc dù code gốc nằm sẵn trong `example/F1/`, bạn vẫn phải "diễn" như đang tự viết. Mỗi commit chỉ chứa **1 component hoặc 1 tính năng nhỏ** — KHÔNG BAO GIỜ đổ cả ngàn dòng vào 1 commit. Dưới đây mô tả theo **TÊN COMPONENT**, bạn tự tìm đoạn code tương ứng trong file example rồi dán vào.

---

## SPRINT TIMELINE (10 ngày: 27/03 → 06/04)

---

### 📅 NGÀY 1-2: FOUNDATION (Nền tảng)

---

#### 🟢 PR #1 — KIỆT (A): Layout cơ bản trang Labor
**Nhánh:** `feature/f1-labor-layout`
```bash
git checkout main && git pull
git checkout -b feature/f1-labor-layout
```

**Commit 1 – CSS và Meta tags:**
Mở `pages/labor.html` (đang trống), viết phần `<head>`: khai báo charset, viewport, title, link Google Fonts (Manrope), link Material Symbols, link 5 file CSS (variables, base, layout, components, dashboard), link Chart.js và GSAP. Thêm block `<style>` chứa CSS cho nút xóa task (`.task-delete-dot`, `.kb-delete-btn`), CSS cho modal giao việc (`.modal-overlay`, `.modal-content`, `.modal-input`), CSS cho Kanban drag-drop, Quick Add panel, Gantt chart, và Tab navigation.
```bash
git add pages/labor.html
git commit -m "feat(labor): Add HTML head with CSS imports, inline styles for task cards and modals"
```

**Commit 2 – Sidebar Navigation:**
Tiếp tục viết phần `<body>`: tạo `<aside class="sidebar">` chứa logo AgriPlanner, 9 link điều hướng (Trang chủ, Trồng trọt, Chăn nuôi, **Nhân công [active]**, Kho, Cửa hàng, Hợp tác xã, Cộng đồng, Tài sản, Cài đặt, Trợ giúp), footer sidebar hiển thị avatar + tên user.
```bash
git commit -am "feat(labor): Add sidebar navigation with 9 menu items and user footer"
```

**Commit 3 – Top Header bar:**
Viết phần `<header>` bên trong `.main-wrapper`: thanh tìm kiếm, nút thông báo (chuông), dropdown user info với avatar.
```bash
git commit -am "feat(labor): Add top header with search bar and notification bell"
```

**Commit 4 – Page Header + Tab Navigation:**
Bên trong `<main class="main-content">`, tạo `.page-header` (tiêu đề "Quản lý Nhân công", subtitle). Tạo `.tab-navigation` gồm 5 nút Tab: Tuyển dụng, Nhân công, Giao việc, Phản hồi, Thống kê. Mỗi nút có icon Material Symbols tương ứng. Thêm hàm JS `switchTab()` xử lý chuyển tab.
```bash
git commit -am "feat(labor): Add page header and 5-tab navigation with switchTab() logic"
git push -u origin feature/f1-labor-layout
```

👉 **Kiệt lên GitHub tạo Pull Request #1.** Title: *"feat: Setup layout base cho trang Quản lý Nhân công"*. Assign reviewer: **Khoa**. Khoa vào xem code, comment "LGTM" (Looks Good To Me), bấm **Approve** → **Merge PR #1** vào `main`.

---

#### 🔵 PR #2 — HIỂN (B): Backend API Controllers (Song song với Kiệt)
**Nhánh:** `feature/f1-task-api`
```bash
git checkout main && git pull
git checkout -b feature/f1-task-api
```

**Commit 1 – TaskController (CRUD cơ bản):**
Tạo file `backend/.../controller/TaskController.java`. Viết class `TaskController` với annotation `@RestController`, `@RequestMapping("/api/tasks")`. Implement các endpoint: `GET /` (lấy danh sách task theo farmId), `POST /` (tạo task mới), `PUT /{id}/status` (cập nhật trạng thái), `DELETE /{id}` (xóa task). Inject `TaskService` qua constructor.
```bash
git add backend/src/main/java/com/agriplanner/controller/TaskController.java
git commit -m "feat(api): Implement TaskController with CRUD endpoints for task management"
```

**Commit 2 – LaborController (Quản lý nhân công):**
Tạo file `LaborController.java`. Viết các endpoint: `GET /api/labor/workers` (danh sách nhân công), `POST /api/labor/approve/{id}` (duyệt đơn), `POST /api/labor/reject/{id}` (từ chối đơn), `GET /api/labor/applications` (đơn xin việc chờ duyệt).
```bash
git add backend/src/main/java/com/agriplanner/controller/LaborController.java
git commit -m "feat(api): Add LaborController - worker listing, approve/reject applications"
```

**Commit 3 – TaskWorkLogController:**
Tạo file `TaskWorkLogController.java`. Endpoint `POST /api/task-worklog` (ghi nhận tiến độ), `GET /api/task-worklog/{taskId}` (xem log công việc).
```bash
git add backend/src/main/java/com/agriplanner/controller/TaskWorkLogController.java
git commit -m "feat(api): Add TaskWorkLogController for tracking work progress"
git push -u origin feature/f1-task-api
```

👉 **Hiển tạo PR #2.** Title: *"feat: Backend API cho module Giao việc và Nhân công"*. Assign reviewer: **Kiệt**. Kiệt review thấy code chuẩn Spring Boot conventions → **Approve & Merge PR #2**.

---

### 📅 NGÀY 3-4: TAB CONTENT (Nội dung từng Tab)

---

#### 🟠 PR #3 — KHOA (C): Worker Dashboard (Giao diện nhân công)
**Nhánh:** `feature/f1-worker-dashboard`
```bash
git checkout main && git pull
git checkout -b feature/f1-worker-dashboard
```

**Commit 1 – Layout + Sidebar Worker:**
Mở `pages/worker_dashboard.html` (đang trống), viết `<head>` (Tailwind CDN, Inter font, Chart.js, GSAP, Leaflet). Viết `<body>`: Sidebar xanh lá (`bg-primary`) dọc bên trái chứa avatar worker, menu (Công việc, Tài sản, Cài đặt, Trợ giúp).
```bash
git add pages/worker_dashboard.html
git commit -m "feat(worker): Setup Worker Dashboard layout with sidebar and Tailwind config"
```

**Commit 2 – Header + Stats Cards:**
Thêm phần Header (greeting "Chào buổi sáng, [Tên]!", nút đăng xuất, avatar worker với Rank Border). Thêm 4 Stats Cards: Công việc hôm nay, Đã hoàn thành, Đang chờ, Tỷ lệ hoàn thành.
```bash
git commit -am "feat(worker): Add header greeting, rank avatar border, and 4 stats cards"
```

**Commit 3 – Kanban Board UI:**
Tạo section Kanban với 3 cột: "Chờ xử lý" (Pending), "Đang làm" (In Progress), "Hoàn thành" (Completed). Mỗi cột là một `div` droppable. Viết CSS cho animation kéo thả (`.task-kanban-card.is-dragging`, `.kanban-dropzone-active`, `@keyframes kanbanCardDrop`). **Chưa viết logic JS** — chỉ dựng giao diện HTML/CSS.
```bash
git commit -am "feat(worker): Add Kanban board UI with 3 columns and drag-drop CSS animations"
git push -u origin feature/f1-worker-dashboard
```

👉 **Khoa tạo PR #3.** Assign reviewer: **Kiệt**. Kiệt review → **Approve & Merge**.

---

#### 🟢 PR #4 — KIỆT (A): Nội dung 2 Tab đầu (Tuyển dụng + Nhân công)
**Nhánh:** `feature/f1-tab-recruitment-workers`
```bash
git checkout main && git pull
git checkout -b feature/f1-tab-recruitment-workers
```

**Commit 1 – Tab Tuyển dụng:**
Mở `pages/labor.html`, trong `#recruitment-tab` thêm: Card "Tin tuyển dụng & Hạn mức" chứa `#recruitment-quota-section` (loading spinner mặc định), section "Hồ sơ chờ duyệt" (`#pending-applications-section`) với badge đếm số đơn.
```bash
git commit -am "feat(labor): Add Recruitment tab - job posting quota and pending applications section"
```

**Commit 2 – Tab Nhân công:**
Trong `#workers-tab` thêm: Card "Danh sách nhân công" chứa header hiển thị badge đếm số nhân công (`#workers-count`), body `#workers-list` (loading spinner mặc định chờ JS render).
```bash
git commit -am "feat(labor): Add Workers tab - approved workers listing with count badge"
git push -u origin feature/f1-tab-recruitment-workers
```

👉 **Kiệt tạo PR #4.** Assign reviewer: **Hiển**. Hiển Approve → **Merge**.

---

### 📅 NGÀY 5-6: TÍNH NĂNG CHÍNH + ⚔️ CONFLICT TỰ NHIÊN

> **KỊCH BẢN CONFLICT:** Kiệt và Khoa cùng kéo code mới nhất từ `main` (sau PR #4), rồi MỖI NGƯỜI TẠO NHÁNH RIÊNG để code thêm tính năng vào CÒN 1 FILE `labor.html`. Khi cả hai nộp PR, người merge sau sẽ bị Conflict.

---

#### 🟢 PR #5 — KIỆT (A): Tab Giao việc (Task Management)
**Nhánh:** `feature/f1-task-tab`
```bash
git checkout main && git pull
git checkout -b feature/f1-task-tab
```

**Commit 1 – Giao diện Tab Giao việc:**
Trong `labor.html`, viết nội dung `#tasks-tab`: Card header 3 cột (Tiêu đề, View Toggle buttons [Danh sách/Kanban/Biểu đồ], Nút hành động [Lịch sử/Thêm nhanh/Giao việc mới]). Body chứa 4 div view: `#tasks-list-view`, `#tasks-kanban-view`, `#tasks-assign-view`, `#tasks-gantt-view`. Thêm block Kanban Controls (toggle Tiến độ/Phân công, dropdown Gom nhóm).
```bash
git commit -am "feat(labor): Add Tasks tab UI - list/kanban/gantt toggle, action buttons"
```

**Commit 2 – Modal Giao việc mới:**
Thêm `#assign-task-modal` (modal overlay) chứa form: Tên công việc (input text), Độ ưu tiên (select: Bình thường/Cao/Thấp), Mô tả (textarea), Loại công việc (select: Mua vật tư/Cho ăn/Thu hoạch/...), Người thực hiện (select load động), Khu vực (select optgroup Ruộng/Chuồng), Hạn hoàn thành (datetime-local). Section vật tư liên quan (`#shop-options`): chọn vật tư, số lượng, thù lao, ngày bắt đầu. Nút Hủy + Giao việc.
```bash
git commit -am "feat(labor): Add Create Task modal with form fields and shop options"
```

**Commit 3 – Modal Quick Add + Task History:**
Thêm Quick Add overlay (`#quick-add-overlay`): panel chứa body load động, footer đếm số việc đã chọn + nút "Giao tất cả". Thêm Task History modal (`#task-history-modal`): layout 2 cột — cột trái là Calendar (nút prev/next, grid 7 cột), cột phải là danh sách task theo ngày đã chọn.
```bash
git commit -am "feat(labor): Add Quick Add panel and Task History modal with calendar view"
git push -u origin feature/f1-task-tab
```

👉 **Kiệt tạo PR #5, tự review (vì là Lead) → Merge ngay vào `main`.**

---

#### 🟠 PR #6 — KHOA (C): Tab Phản hồi + Tab Thống kê (SONG SONG VỚI KIỆT)
**Nhánh:** `feature/f1-feedback-statistics`
```bash
# ⚠️ Khoa checkout từ main TRƯỚC khi PR #5 được merge
# → Khoa KHÔNG CÓ code Tab Giao việc của Kiệt
git checkout main && git pull
git checkout -b feature/f1-feedback-statistics
```

**Commit 1 – Tab Phản hồi:**
Trong `labor.html`, viết nội dung `#feedback-tab`: Card chứa header "Phản hồi từ nhân công" + nút Tải lại, body `#owner-help-requests` (loading spinner).
```bash
git commit -am "feat(labor): Add Feedback tab - help requests from workers with refresh button"
```

**Commit 2 – Tab Thống kê (Summary Cards):**
Trong `#statistics-tab`, tạo Row 1: Grid 3 cột chứa 3 Summary Cards (Tổng nhân công, Công việc đang chạy, Nhân công quá tải) — mỗi card có icon + số lượng lớn.
```bash
git commit -am "feat(labor): Add Statistics tab - 3 summary cards (workers, active tasks, overloaded)"
```

**Commit 3 – Tab Thống kê (Charts + Leaderboard):**
Row 2: Grid 2 cột chứa Epic Progress Chart (canvas `#epic-progress-chart`, 2 nút toggle Bar/Burn-down) và Workload Chart (canvas `#workload-chart`). Row 3: Card Leaderboard (bảng xếp hạng Nông dân theo EXP, toggle Top 5/Tất cả).
```bash
git commit -am "feat(labor): Add statistics charts (Epic Progress, Workload) and Leaderboard"
git push -u origin feature/f1-feedback-statistics
```

👉 **Khoa tạo PR #6 trên GitHub.**
🚨 **CONFLICT XUẤT HIỆN!** GitHub hiển thị: *"This branch has conflicts that must be resolved"* vì cả Kiệt (PR #5) và Khoa (PR #6) đều sửa file `labor.html` — Kiệt thêm Tab Giao việc + Modal ở cuối file, Khoa thêm Tab Phản hồi + Thống kê ở vị trí tương tự.

**Khoa xử lý Conflict (đúng quy trình):**
```bash
git fetch origin
git rebase origin/main
# Git báo: CONFLICT trong pages/labor.html
# Khoa mở VSCode → thấy marker <<<<<<< HEAD / =======  / >>>>>>>
# Khoa GIỮ LẠI CẢ HAI phần: code Tab Giao việc + Modal của Kiệt VÀ code Tab Phản hồi + Thống kê của mình
# Sắp xếp thứ tự: Tasks tab → Feedback tab → Statistics tab → Modals
git add pages/labor.html
git rebase --continue
git push -f origin feature/f1-feedback-statistics
```
👉 PR #6 giờ đã xanh (no conflicts). Kiệt review thấy Khoa resolve conflict chuẩn → **Approve & Merge PR #6**.

---

### 📅 NGÀY 7-8: JAVASCRIPT LOGIC

---

#### 🔵 PR #7 — HIỂN (B): JavaScript xử lý nghiệp vụ Labor
**Nhánh:** `feature/f1-labor-js`
```bash
git checkout main && git pull
git checkout -b feature/f1-labor-js
```

**Commit 1 – Core logic labor.js (Load dữ liệu + Render):**
Tạo file `js/labor.js`. Viết các hàm: `loadRecruitmentData()` gọi API `GET /api/labor/applications`, `loadApprovedWorkers()` gọi API `GET /api/labor/workers`, `renderWorkerCard(worker)` hiển thị card nhân công. Thêm `DOMContentLoaded` listener gọi `loadRecruitmentData()`.
```bash
git add js/labor.js
git commit -m "feat(js): Add labor.js core - recruitment data loading and worker card rendering"
```

**Commit 2 – Xử lý Giao việc (Task CRUD):**
Trong `labor.js`, thêm: `loadTasks()` gọi API `GET /api/tasks`, `renderTaskList(tasks)` hiển thị danh sách, `renderKanbanBoard(tasks)` chia 3 cột theo status, `submitAssignTask(event)` gọi API `POST /api/tasks`, `updateTaskStatus(taskId, status)` gọi API `PUT /api/tasks/{id}/status`, `deleteTask(taskId)` gọi API `DELETE`.
```bash
git commit -am "feat(js): Add task CRUD operations - load, render list/kanban, create, update, delete"
```

**Commit 3 – Tab Switching + View Toggle + Stats:**
Thêm: `toggleTaskView(view)` chuyển giữa List/Kanban/Gantt, `switchKanbanSubView(type)` toggle Tiến độ/Phân công, `renderStatisticsTab()` gọi API lấy data rồi vẽ Chart.js (Epic Progress + Workload), `renderLeaderboard()` hiển thị bảng xếp hạng.
```bash
git commit -am "feat(js): Add view toggle, kanban sub-views, statistics charts and leaderboard"
```

**Commit 4 – Quick Add + Task History:**
Thêm: `openQuickAddModal()` / `closeQuickAddModal()` / `submitQuickAddTasks()`, `openTaskHistoryModal()` / `closeTaskHistoryModal()` / `renderHistoryCalendar()` / `historyCalendarPrev()` / `historyCalendarNext()`.
```bash
git commit -am "feat(js): Add Quick Add panel logic and Task History modal with calendar"
git push -u origin feature/f1-labor-js
```

👉 **Hiển tạo PR #7.** Kiệt review → **Approve & Merge**.

---

#### 🟠 PR #8 — KHOA (C): JavaScript Worker Dashboard + Sub-pages
**Nhánh:** `feature/f1-worker-js`
```bash
git checkout main && git pull
git checkout -b feature/f1-worker-js
```

**Commit 1 – worker_dashboard.js (Core):**
Tạo `js/worker_dashboard.js`. Viết: `loadWorkerProfile()` hiển thị avatar + rank border, `loadWorkerTasks()` gọi API lấy task được giao, `renderKanbanCards(tasks)` render thẻ task vào 3 cột Kanban.
```bash
git add js/worker_dashboard.js
git commit -m "feat(worker-js): Add worker dashboard core - profile loading and task kanban rendering"
```

**Commit 2 – Drag & Drop Kanban logic:**
Thêm hàm `initDragAndDrop()`: `dragstart`, `dragover`, `drop` event listeners. Khi thả thẻ, gọi API `PUT /api/tasks/{id}/status` cập nhật trạng thái rồi re-render. Thêm CSS animation `.kanban-card-dropped`.
```bash
git commit -am "feat(worker-js): Implement drag-and-drop Kanban with API status sync"
```

**Commit 3 – Worker Jobs + Worker Detail pages:**
Tạo `pages/worker_jobs.html` (danh sách toàn bộ jobs) + `pages/worker_detail.html` (chi tiết job). Tạo `js/worker_jobs.js` + `js/worker_detail.js` với logic tương ứng.
```bash
git add pages/worker_jobs.html pages/worker_detail.html js/worker_jobs.js js/worker_detail.js
git commit -m "feat(worker): Add Worker Jobs listing page and Worker Detail page with JS logic"
git push -u origin feature/f1-worker-js
```

👉 **Khoa tạo PR #8.** Kiệt review → **Approve & Merge**.

---

### 📅 NGÀY 9: QA TEST → BUG → FIX

---

#### 🐛 QA DUY: Test trên Staging → Phát hiện Bug
Duy (QA) deploy code mới nhất lên môi trường Staging. Duy test luồng Worker kéo thả Kanban:
1. Đăng nhập Worker → vào Dashboard → thấy Kanban 3 cột.
2. Kéo thẻ "Tưới rau buổi sáng" từ Pending → In Progress.
3. **BUG:** Thẻ task bị giật ngược về cột Pending khoảng 0.5 giây trước khi API trả về → UI flickering.
4. Duy lên Jira tạo **Bug #AP-BUG-19**: *"Kanban card flickers back to original column before API response"*.

---

#### 🟠 PR #9 — KHOA (C): Fix Bug Kanban State
**Nhánh:** `bugfix/AP-BUG-19-kanban-flicker`
```bash
git checkout main && git pull
git checkout -b bugfix/AP-BUG-19-kanban-flicker
```

**Commit 1 – Optimistic UI update:**
Mở `js/worker_dashboard.js`, sửa hàm `drop` handler: di chuyển DOM element ngay lập tức (optimistic update) TRƯỚC khi gọi API. Nếu API fail thì mới rollback về cột cũ.
```bash
git commit -am "fix(worker): Apply optimistic UI update on Kanban drop to prevent flicker (AP-BUG-19)"
git push -u origin bugfix/AP-BUG-19-kanban-flicker
```

👉 **Khoa tạo PR #9.** Mô tả: *"Fixes #AP-BUG-19 — Áp dụng Optimistic UI pattern: cập nhật DOM trước, rollback nếu API lỗi."* Kiệt review → **Approve & Merge**.
Duy re-test trên Staging → **Passed** → Đóng Bug.

---

### 📅 NGÀY 10: NÂNG CẤP + HOÀN THIỆN

---

#### 🔵 PR #10 — HIỂN (B): Module nâng cấp (Gamification)
**Nhánh:** `feature/f1-upgrade-modules`
```bash
git checkout main && git pull
git checkout -b feature/f1-upgrade-modules
```

**Commit 1 – labor-upgrade.js:**
Tạo `js/labor-upgrade.js`. Viết module Gamification: hệ thống EXP/Level cho nhân công, Rank system (Trainee → Skilled → Veteran → Master), animation rank-up celebration.
```bash
git add js/labor-upgrade.js
git commit -m "feat(upgrade): Add Gamification module - EXP/Level system and Rank progression"
```

**Commit 2 – worker-upgrade.js:**
Tạo `js/worker-upgrade.js`. Viết module: Face Login recognition, daily check-in bonus EXP, streak tracking.
```bash
git add js/worker-upgrade.js
git commit -m "feat(upgrade): Add Worker upgrade module - face login and daily check-in bonus"
git push -u origin feature/f1-upgrade-modules
```

👉 **Hiển tạo PR #10.** Kiệt review → **Approve & Merge**.

---

#### 🟢 PR #11 — KIỆT (A): Kết nối Script vào HTML + Cleanup
**Nhánh:** `feature/f1-integration`
```bash
git checkout main && git pull
git checkout -b feature/f1-integration
```

**Commit 1 – Thêm script tags vào labor.html:**
Mở `pages/labor.html`, thêm các thẻ `<script>` ở cuối file trước `</body>`: `labor.js`, `labor-upgrade.js`. Thêm Auth check redirect (Worker → worker_dashboard, Admin → admin).
```bash
git commit -am "chore(labor): Link labor.js and labor-upgrade.js scripts, add auth redirect"
```

**Commit 2 – Thêm script tags vào worker_dashboard.html:**
Tương tự, mở `pages/worker_dashboard.html`, thêm: `worker_dashboard.js`, `worker-upgrade.js`, `worker_jobs.js`.
```bash
git commit -am "chore(worker): Link worker JS modules and upgrade scripts"
git push -u origin feature/f1-integration
```

👉 **Kiệt tạo PR #11.** Assign reviewer: **Hiển** + **Khoa**. Cả hai Approve → **Merge PR #11** → 🎉 **CHỨC NĂNG 1 HOÀN TẤT!**

---

## 📊 TỔNG KẾT

| Dev | Số PR | Số Commits | Vai trò |
|-----|-------|------------|---------|
| Kiệt (A) | 4 PR (#1, #4, #5, #11) | 11 commits | Layout, Tabs, Modals, Integration, Reviewer chính |
| Hiển (B) | 3 PR (#2, #7, #10) | 9 commits | Backend API, JS logic, Gamification |
| Khoa (C) | 3 PR (#3, #6, #8) + 1 Bugfix (#9) | 10 commits | Worker UI, Stats/Charts, Resolve Conflict, Fix Bug |

**Đặc điểm chuyên nghiệp:**
- ✅ 11 Pull Requests (không push trực tiếp main)
- ✅ ~30 atomic commits (mỗi commit = 1 tính năng nhỏ)
- ✅ 1 Conflict tự nhiên (Kiệt & Khoa cùng sửa `labor.html` từ 2 nhánh)
- ✅ 1 Bug từ QA báo cáo + nhánh `bugfix/` chuẩn quy trình
- ✅ Code Review trên mọi PR trước khi merge
