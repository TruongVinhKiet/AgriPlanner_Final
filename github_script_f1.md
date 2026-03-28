# KỊCH BẢN GITHUB: CHỨC NĂNG 1 – QUẢN LÝ NHÂN CÔNG & GIAO VIỆC

**Nhánh duy nhất:** `feature/f1-labor-management`
**3 Dev · 12 commits · 1 PR · merge vào main**

> **Graph TortoiseGit:** Một đường thẳng tắp Kiệt (layout) → Hiển (backend+JS) → Khoa (worker), rồi merge lại `main` bằng **merge commit** (--no-ff).

**3 Dev trên GitHub:**
- **A – Trương Vĩnh Kiệt** (Lead)
- **B – Nguyễn Minh Hiển** (Backend Dev)
- **C – Khoa Võ Tiến** (Frontend Dev)

> **Cách làm:** Code mẫu nằm trong `example/F1/`. Copy từng phần theo hướng dẫn, commit theo đúng thứ tự.

---

## 🔧 BƯỚC CHUẨN BỊ (Chạy 1 lần duy nhất trước khi bắt đầu cả 3 chức năng)

> Xóa các file backend F1/F2 đã lỡ nằm trên `main`, để các script feature sẽ add lại đúng trên nhánh riêng.

```bash
git checkout main && git pull

# Xóa backend F2 (Controllers) – sẽ được add lại trên nhánh feature/f2-cultivation-map
git rm -f backend/src/main/java/com/agriplanner/controller/FieldLossController.java
git rm -f backend/src/main/java/com/agriplanner/controller/FieldZoneController.java
git rm -f backend/src/main/java/com/agriplanner/controller/LandParcelController.java
git rm -f backend/src/main/java/com/agriplanner/controller/KmzUploadController.java
git rm -f backend/src/main/java/com/agriplanner/controller/KmzImageController.java
git rm -f backend/src/main/java/com/agriplanner/controller/MapImageAnalysisController.java
git rm -f backend/src/main/java/com/agriplanner/controller/PlanningZoneController.java

# Xóa backend F2 (Services)
git rm -f backend/src/main/java/com/agriplanner/service/KmzParserService.java
git rm -f backend/src/main/java/com/agriplanner/service/MapAnalysisAIService.java
git rm -f backend/src/main/java/com/agriplanner/service/FieldService.java
git rm -f backend/src/main/java/com/agriplanner/service/PlanningZoneTypeMappingService.java
git rm -f backend/src/main/java/com/agriplanner/service/SoilTypeMappingService.java

# Xóa backend F1 (nếu tồn tại)
git rm -f backend/src/main/java/com/agriplanner/service/TaskService.java

git commit -m "chore: Reset codebase - remove F1/F2 backend files for clean featur## 🟢 KIỆT (A): Commits 1–8 — Giao diện trang Quản lý Nhân công (Từng bước chi tiết)

> **Chuyển account (nếu 1 người diễn cả 3 vai):**
> ```bash
> git config user.name "Trương Vĩnh Kiệt"
> git config user.email "kiet@agriplanner.com"
> ```

### Commit 1 – HTML Foundation & Meta tags
Mở `example/F1/labor.html`, copy từ dòng 1 đến 33 (phần `<!DOCTYPE html>` đến hết các thẻ `<link rel="stylesheet">` external CSS và `<script>` CDN).
Mở `pages/labor.html` (đang trống), dán nội dung vào. Thêm tạm cặp thẻ `</head><body data-page="labor"></body></html>` ở cuối (sẽ bị đẩy xuống khi thêm nội dung sau).

```bash
git add pages/labor.html
git commit -m "feat(labor): Setup HTML foundation, meta tags and external CSS/JS imports"
```

### Commit 2 – Inline CSS: Layout cơ bản & Modals
Mở `pages/labor.html`, mở thẻ `<style>` ngay trước `</head>`. Chèn đoạn CSS nội tuyến từ dòng 34 đến 456 của file mẫu (CSS cho nút xóa task, `.kb-delete-btn`, `.delete-confirm-overlay`, chuyển Tab `.tab-navigation`, modal nền `.modal-overlay`, và `.quick-add-overlay`).

```bash
git add pages/labor.html
git commit -m "feat(labor): Add inline CSS styles for basic layout, nav tabs and modals"
```

### Commit 3 – Inline CSS: Kanban Board
Tiếp tục trong block `<style>`, chèn thêm đoạn CSS từ dòng 457 đến 720 (các class `.kanban-board`, `.kanban-column`, thả kéo thả, `.kanban-swimlane`, `.assign-kanban-board`).

```bash
git add pages/labor.html
git commit -m "feat(labor): Add inline CSS styles for Kanban board and drag-drop behavior"
```

### Commit 4 – Inline CSS: Gantt Chart & Rank Avatar
Tiếp tục chèn đoạn CSS cuối của thẻ `<style>` từ dòng 721 đến 880 (CSS cho biểu đồ Gantt `.gantt-container`, `.gantt-bar`, và Rank Avatar `.rank-frame-mini`).

```bash
git add pages/labor.html
git commit -m "feat(labor): Add inline CSS for Gantt chart and Rank Avatar frames"
```

### Commit 5 – Sidebar Navigation & Top Header
Mở phần thân thẻ `<body>`. Từ example, copy khối `<aside class="sidebar">` (logo, 9 link menu, footer avatar) và khối `<header class="header">` (thanh tìm kiếm, thông báo, user info).
Dán nối tiếp vào `pages/labor.html`.

```bash
git add pages/labor.html
git commit -m "feat(labor): Add sidebar navigation menu and top header bar"
```

### Commit 6 – Page Header + Nav Tabs + Tab Tuyển dụng & Nhân công
Từ thẻ `<main class="main-content">` trong example, copy `.page-header` (Quản lý Nhân công), `.tab-navigation` (5 nút tab) và 2 tab nội dung đầu tiên: `#recruitment-tab` và `#workers-tab`. Dán vào trong `<main>`.

```bash
git add pages/labor.html
git commit -m "feat(labor): Add page header, 5-tab navigation, Recruitment and Workers tab content"
```

### Commit 7 – Tab Giao việc + Phản hồi + Thống kê
Copy tiếp 3 khối nội dung tab còn lại từ example: `#tasks-tab` (chứa list/kanban/gantt views), `#feedback-tab` (phản hồi), và `#statistics-tab` (3 summary cards, biểu đồ). Dán tiếp vào.

```bash
git add pages/labor.html
git commit -m "feat(labor): Add Tasks tab (Kanban/List/Gantt views), Feedback, and Statistics content"
```

### Commit 8 – Toàn bộ Modals overlay
Từ example, copy phần các modals nằm cuối trang (`#assign-task-modal`, `#quick-add-overlay`, `#task-history-modal`), rồi đảm bảo cấu trúc đóng thẻ `</main> </div> </body> </html>` đã hoàn chỉnh.

```bash
git add pages/labor.html
git commit -m "feat(labor): Add task creation and history modals, finalize HTML structure"
```
---iệc: tên, ưu tiên, mô tả, loại, người thực hiện, khu vực, hạn)
- `#quick-add-overlay` (Quick Add panel)
- `#task-history-modal` (Calendar + danh sách task theo ngày)
- Đóng thẻ `</main></div></body></html>`

```bash
git add pages/labor.html
git commit -m "feat(labor): Add Tasks/Feedback/Statistics tabs and all modals"
```

---

## 🔵 HIỂN (B): Commits 5–8 — Backend API + JavaScript Logic

> **Chuyển account:**
> ```bash
> git config user.name "Nguyễn Minh Hiển"
> git config user.email "hien@agriplanner.com"
> ```

### Commit 5 – TaskController.java
Copy `example/F1/TaskController.java` → `backend/src/main/java/com/agriplanner/controller/TaskController.java`
(Endpoints: `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/{id}/status`, `DELETE /api/tasks/{id}`)

```bash
cp example/F1/TaskController.java backend/src/main/java/com/agriplanner/controller/
git add backend/src/main/java/com/agriplanner/controller/TaskController.java
git commit -m "feat(api): Implement TaskController with CRUD endpoints for task management"
```

### Commit 6 – LaborController + TaskWorkLogController + TaskService
Copy từ `example/F1/`:
- `LaborController.java` → `backend/.../controller/`
- `TaskWorkLogController.java` → `backend/.../controller/`
- `TaskService.java` → `backend/.../service/`

```bash
cp example/F1/LaborController.java backend/src/main/java/com/agriplanner/controller/
cp example/F1/TaskWorkLogController.java backend/src/main/java/com/agriplanner/controller/
cp example/F1/TaskService.java backend/src/main/java/com/agriplanner/service/
git add backend/src/main/java/com/agriplanner/controller/LaborController.java \
      backend/src/main/java/com/agriplanner/controller/TaskWorkLogController.java \
      backend/src/main/java/com/agriplanner/service/TaskService.java
git commit -m "feat(api): Add LaborController, TaskWorkLogController and TaskService"
```

### Commit 7 – labor.js (Core JavaScript)
Copy `example/F1/labor.js` → `js/labor.js`
(Hàm: `loadRecruitmentData()`, `loadApprovedWorkers()`, `renderWorkerCard()`, `loadTasks()`, `renderKanbanBoard()`, `submitAssignTask()`, `updateTaskStatus()`, `deleteTask()`, `toggleTaskView()`, `renderStatisticsTab()`, `renderLeaderboard()`, Quick Add, Task History…)

```bash
cp example/F1/labor.js js/
git add js/labor.js
git commit -m "feat(js): Add labor.js - data loading, task CRUD, kanban, statistics and charts"
```

### Commit 8 – labor-upgrade.js (Gamification)
Copy `example/F1/labor-upgrade.js` → `js/labor-upgrade.js`
(EXP/Level system, Rank: Trainee → Skilled → Veteran → Master, animation rank-up)

```bash
cp example/F1/labor-upgrade.js js/
git add js/labor-upgrade.js
git commit -m "feat(upgrade): Add Gamification module - EXP/Level system and Rank progression"
```

---

## 🟠 KHOA (C): Commits 9–12 — Worker Dashboard + Tích hợp

> **Chuyển account:**
> ```bash
> git config user.name "Khoa Võ Tiến"
> git config user.email "khoa@agriplanner.com"
> ```

### Commit 9 – Worker Dashboard HTML
Copy `example/F1/worker_dashboard.html` → `pages/worker_dashboard.html`
(Tailwind layout, sidebar worker xanh lá, header greeting + rank avatar, 4 stats cards, Kanban 3 cột)

```bash
cp example/F1/worker_dashboard.html pages/
git add pages/worker_dashboard.html
git commit -m "feat(worker): Setup Worker Dashboard layout with sidebar and Kanban UI"
```

### Commit 10 – Worker JS + Jobs + Detail pages
Copy từ `example/F1/`:
- `worker_dashboard.js` → `js/`
- `worker_jobs.html` → `pages/`
- `worker_jobs.js` → `js/`
- `worker_detail.html` → `pages/`
- `worker_detail.js` → `js/`

```bash
cp example/F1/worker_dashboard.js js/
cp example/F1/worker_jobs.html pages/
cp example/F1/worker_jobs.js js/
cp example/F1/worker_detail.html pages/
cp example/F1/worker_detail.js js/
git add js/worker_dashboard.js pages/worker_jobs.html js/worker_jobs.js pages/worker_detail.html js/worker_detail.js
git commit -m "feat(worker): Add Worker Dashboard JS, drag-drop Kanban, Jobs and Detail pages"
```

### Commit 11 – worker-upgrade.js
Copy `example/F1/worker-upgrade.js` → `js/worker-upgrade.js`
(Face login recognition, daily check-in bonus EXP, streak tracking)

```bash
cp example/F1/worker-upgrade.js js/
git add js/worker-upgrade.js
git commit -m "feat(worker): Add worker upgrade module - face login and daily check-in bonus"
```

### Commit 12 – Link tất cả Scripts vào HTML
Mở `pages/labor.html`, thêm trước `</body>`:
```html
<script src="../js/labor.js"></script>
<script src="../js/labor-upgrade.js"></script>
```
Thêm Auth check redirect (Worker → worker_dashboard, Admin → admin).

Mở `pages/worker_dashboard.html`, thêm trước `</body>`:
```html
<script src="../js/worker_dashboard.js"></script>
<script src="../js/worker-upgrade.js"></script>
<script src="../js/worker_jobs.js"></script>
```

```bash
git add pages/labor.html pages/worker_dashboard.html
git commit -m "chore(labor): Link all JS modules and upgrade scripts to HTML pages"
```

---

## 🚀 BƯỚC CUỐI: PUSH + TẠO PR + MERGE

```bash
git push -u origin feature/f1-labor-management
```

👉 **Trên GitHub:**
1. Tạo **Pull Request**: Title = `feat: [F1] Quản lý Nhân công & Giao việc`
2. Assign **cả 3 thành viên** review
3. Tất cả Approve → Bấm **Merge Pull Request**

> ⚠️ **QUAN TRỌNG:** Khi merge trên GitHub, chọn **"Create a merge commit"** (KHÔNG chọn Squash hoặc Rebase). Điều này tương đương `git merge --no-ff`, giúp TortoiseGit hiển thị nhánh phân tách rõ ràng.

---

## 📊 TỔNG KẾT F1

| Dev | Commits | Nội dung |
|-----|---------|----------|
| Kiệt (A) | 4 (#1–#4) | Layout HTML, Sidebar, Tabs, Modals |
| Hiển (B) | 4 (#5–#8) | Backend API Controllers, JS Logic, Gamification |
| Khoa (C) | 4 (#9–#12) | Worker Dashboard, Worker pages, Integration |
| **Tổng** | **12 commits** | **1 nhánh · 1 PR · 1 merge commit** |
