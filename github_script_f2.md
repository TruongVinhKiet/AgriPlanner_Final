# KỊCH BẢN GITHUB: CHỨC NĂNG 2 – BẢN ĐỒ & QUẢN LÝ ĐỒNG RUỘNG

**Nhánh duy nhất:** `feature/f2-cultivation-map`
**3 Dev · 9 commits · 1 PR · merge vào main**

> **Thực hiện SAU KHI đã merge xong F1.** Graph TortoiseGit sẽ hiển thị nhánh thứ 2 tách ra từ `main` (sau merge F1), chạy thẳng rồi merge lại.

**3 Dev trên GitHub:**
- **A – Trương Vĩnh Kiệt** (Lead)
- **B – Nguyễn Minh Hiển** (Backend Dev)
- **C – Khoa Võ Tiến** (Frontend Dev)

> **Cách làm:** Code mẫu nằm trong `example/F2/`. Copy từng phần theo hướng dẫn.

---

## BƯỚC 1: TẠO NHÁNH (sau khi merge F1 xong)

```bash
git checkout main && git pull
git checkout -b feature/f2-cultivation-map
```

---

## 🟢 KIỆT (A): Commits 1–4 — Giao diện trang Trồng trọt + Bản đồ

> **Chuyển account:**
> ```bash
> git config user.name "Trương Vĩnh Kiệt"
> git config user.email "kiet@agriplanner.com"
> ```

## 🟢 KIỆT (A): Commits 1–8 — Giao diện trang Trồng trọt + Bản đồ

> **Chuyển account:**
> ```bash
> git config user.name "Trương Vĩnh Kiệt"
> git config user.email "kiet@agriplanner.com"
> ```

### Commit 1 – HTML Foundation & Meta tags
Mở `example/F2/cultivation.html`, copy phần đầu (từ `<!DOCTYPE html>` đến hết phần `<link rel="stylesheet">` external CSS, khoảng dòng 1–35).
Mở `pages/cultivation.html` (đang trống), dán nội dung vào. Thêm tạm cặp thẻ `</head><body data-page="cultivation"></body></html>` ở cuối (sẽ bị đẩy xuống khi thêm nội dung sau).

```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Setup HTML foundation, titles and external CSS imports"
```

### Commit 2 – Inline CSS: Map Controls & Legends
Mở `pages/cultivation.html`, tạo thẻ `<style>` ngay trước `</head>`. Chèn đoạn CSS nội tuyến tiếp theo từ file mẫu (từ dòng 36 đến khoảng dòng 500). Bao gồm CSS cho `.search-bar-map`, `.map-layer-controls`, `.planning-sync-bar`, các chú giải `.map-legend`.

```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Add inline CSS styles for map controls and layer legends"
```

### Commit 3 – Inline CSS: Modals & Weather Widget
Tiếp tục trong block `<style>`, chèn đoạn CSS tiếp theo (từ khoảng 500 đến dòng 1000). Bao gồm CSS cho Widget thời tiết, các giao diện panel thông báo, và CSS modal.

```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Add inline CSS for weather widget and notification panels"
```

### Commit 4 – Inline CSS: Rest of styling & body tag
Chèn nốt phần CSS còn lại của block `<style>` (Gantt, Animation) và dòng kết thúc `</head><body data-page="cultivation">` (từ dòng ~1000 đến 1564).

```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Add remaining CSS styles, initialize cultivation body tag"
```

### Commit 5 – Sidebar + Header
Từ example, copy khối `<aside class="sidebar">` (~dòng 1566–1622) và `<header>` (~dòng 1625–1660). Dán nối tiếp sau `<body data-page="cultivation">`.

```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Add sidebar navigation menu and top header to layout"
```

### Commit 6 – Map Container + Legends
Từ example, copy khối hiển thị bản đồ: Leaflet map div, thanh tìm kiếm map, điều khiển lớp, widget thời tiết và các legend (~dòng 1662–1965). Dán xuống dưới phần header.

```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Build Leaflet map container, map layer toggles and legends"
```

### Commit 7 – Sensor Sidebar + Farm Workflow
Từ example, copy khối Sensor Sidebar (4 thẻ cảm biến) và khối Workflow quản lý (Thêm ruộng, Bón phân, Tưới nước,...) (~dòng 1967–2191). Dán bên cạnh bản đồ.

```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Add sensor data cards and farm management workflow buttons"
```

### Commit 8 – Toàn bộ Modals + CSS + Script Tags
Từ example, copy phần các modals (Notification, Marketplace, Pest Analysis, Forecast,...) và hoàn thiện thẻ đóng `</body></html>` (~dòng 2196 đến hết).
Copy file `example/F2/cultivation.css` đè lên `css/pages/cultivation.css`. Chú ý kèm đoạn `<script src>` cuối HTML.

```bash
cp example/F2/cultivation.css css/pages/cultivation.css
git add pages/cultivation.html css/pages/cultivation.css
git commit -m "feat(cultivation): Add all functional modals, external CSS file and script tags"
```

---

## 🔵 HIỂN (B): Commits 5–6 — Backend API Controllers & Services

> **Chuyển account:**
> ```bash
> git config user.name "Nguyễn Minh Hiển"
> git config user.email "hien@agriplanner.com"
> ```

### Commit 5 – Field CRUD Controllers
Copy từ `example/F2/`:
- `FieldLossController.java` → `backend/.../controller/`
- `FieldZoneController.java` → `backend/.../controller/`
- `LandParcelController.java` → `backend/.../controller/`

```bash
cp example/F2/FieldLossController.java backend/src/main/java/com/agriplanner/controller/
cp example/F2/FieldZoneController.java backend/src/main/java/com/agriplanner/controller/
cp example/F2/LandParcelController.java backend/src/main/java/com/agriplanner/controller/
git add backend/src/main/java/com/agriplanner/controller/FieldLossController.java \
      backend/src/main/java/com/agriplanner/controller/FieldZoneController.java \
      backend/src/main/java/com/agriplanner/controller/LandParcelController.java
git commit -m "feat(api): Implement Field CRUD endpoints - LandParcel, FieldZone, FieldLoss"
```

### Commit 6 – KMZ Upload + Map Analysis AI + Planning Zone
Copy từ `example/F2/`:
- Controllers: `KmzUploadController.java`, `KmzImageController.java`, `MapImageAnalysisController.java`, `PlanningZoneController.java`
- Services: `KmzParserService.java`, `MapAnalysisAIService.java`, `FieldService.java`, `PlanningZoneTypeMappingService.java`, `SoilTypeMappingService.java`

```bash
cp example/F2/KmzUploadController.java backend/src/main/java/com/agriplanner/controller/
cp example/F2/KmzImageController.java backend/src/main/java/com/agriplanner/controller/
cp example/F2/MapImageAnalysisController.java backend/src/main/java/com/agriplanner/controller/
cp example/F2/PlanningZoneController.java backend/src/main/java/com/agriplanner/controller/
cp example/F2/KmzParserService.java backend/src/main/java/com/agriplanner/service/
cp example/F2/MapAnalysisAIService.java backend/src/main/java/com/agriplanner/service/
cp example/F2/FieldService.java backend/src/main/java/com/agriplanner/service/
cp example/F2/PlanningZoneTypeMappingService.java backend/src/main/java/com/agriplanner/service/
cp example/F2/SoilTypeMappingService.java backend/src/main/java/com/agriplanner/service/
git add backend/src/main/java/com/agriplanner/controller/KmzUploadController.java \
      backend/src/main/java/com/agriplanner/controller/KmzImageController.java \
      backend/src/main/java/com/agriplanner/controller/MapImageAnalysisController.java \
      backend/src/main/java/com/agriplanner/controller/PlanningZoneController.java \
      backend/src/main/java/com/agriplanner/service/KmzParserService.java \
      backend/src/main/java/com/agriplanner/service/MapAnalysisAIService.java \
      backend/src/main/java/com/agriplanner/service/FieldService.java \
      backend/src/main/java/com/agriplanner/service/PlanningZoneTypeMappingService.java \
      backend/src/main/java/com/agriplanner/service/SoilTypeMappingService.java
git commit -m "feat(api): Add KMZ upload, AI Map Analysis and Planning Zone services"
```

---

## 🟠 KHOA (C): Commits 7–9 — JavaScript Logic bản đồ

> **Chuyển account:**
> ```bash
> git config user.name "Khoa Võ Tiến"
> git config user.email "khoa@agriplanner.com"
> ```

### Commit 7 – Interactive Map Viewer
Copy `example/F2/interactive-map-viewer.js` → `js/interactive-map-viewer.js` (thay thế file TODO)
(Init Leaflet, tile layers, Draw tools, polygon click handlers)

```bash
cp example/F2/interactive-map-viewer.js js/
git add js/interactive-map-viewer.js
git commit -m "feat(map): Initialize Leaflet map with Draw tools and tile layers"
```

### Commit 8 – Map Layers GeoJSON
Copy `example/F2/cultivation-map-layers.js` → `js/cultivation-map-layers.js` (thay thế file TODO)
(Fetch & render GeoJSON cho Soil, Planning, Suitability layers)

```bash
cp example/F2/cultivation-map-layers.js js/
git add js/cultivation-map-layers.js
git commit -m "feat(map): Implement GeoJSON layer rendering for Soil and Planning zones"
```

### Commit 9 – Main Cultivation Logic
Copy `example/F2/cultivation.js` → `js/cultivation.js` (thay thế file TODO)
(Weather widget, Field CRUD, Sensor data, Workflow steps, Market ticker)

```bash
cp example/F2/cultivation.js js/
git add js/cultivation.js
git commit -m "feat(cultivation): Add main JS logic - weather, field CRUD, sensor data and workflow"
```

---

## 🚀 BƯỚC CUỐI: PUSH + TẠO PR + MERGE

```bash
git push -u origin feature/f2-cultivation-map
```

👉 **Trên GitHub:**
1. Tạo **Pull Request**: Title = `feat: [F2] Bản đồ canh tác & Quản lý đồng ruộng`
2. Assign **cả 3 thành viên** review
3. Tất cả Approve → Bấm **Merge Pull Request**

> ⚠️ **QUAN TRỌNG:** Chọn **"Create a merge commit"** (KHÔNG Squash/Rebase) để TortoiseGit hiện nhánh rõ ràng.

---

## 📊 TỔNG KẾT F2

| Dev | Commits | Nội dung |
|-----|---------|----------|
| Kiệt (A) | 4 (#1–#4) | Layout HTML, Map, Sensor, Modals, CSS |
| Hiển (B) | 2 (#5–#6) | Backend Controllers & Services (13 files) |
| Khoa (C) | 3 (#7–#9) | Map Viewer JS, GeoJSON Layers, Main Logic |
| **Tổng** | **9 commits** | **1 nhánh · 1 PR · 1 merge commit** |
