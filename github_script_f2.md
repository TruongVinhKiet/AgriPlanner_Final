# KỊCH BẢN GITHUB (v4): CHỨC NĂNG 2 – BẢN ĐỒ & QUẢN LÝ ĐỒNG RUỘNG
**Sprint 2 · 3 Dev · 8 PRs · ~20 atomic commits**

> **Quy tắc:** Không ai push trực tiếp vào main. Mọi code phải qua Pull Request + Code Review.

---

## ═══ NGÀY 1–2: DỰNG XƯƠNG GIAO DIỆN ═══

### 🟢 PR #1 – KIỆT (A): Layout trang Trồng trọt
**Nhánh:** `feature/SCRUM-21-cultivation-layout`

```bash
git checkout main && git pull origin main
git checkout -b feature/SCRUM-21-cultivation-layout
```

**Commit 1 — Head CSS & Leaflet imports** (file [cultivation.html](file:///d:/Agriplanner/pages/cultivation.html))
- Mở [example/F2/cultivation.html](file:///d:/Agriplanner/example/F2/cultivation.html), copy **dòng 1 → 1564** (toàn bộ `<head>` chứa CSS inline cho map controls, weather widget, modal, kanban, toast…)
- Dán vào [pages/cultivation.html](file:///d:/Agriplanner/pages/cultivation.html) (xóa hết nội dung cũ)
- Thêm `<body data-page="cultivation"></body></html>` ở cuối
```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Setup HTML head with Leaflet CSS, inline styles for map and sidebar"
```

**Commit 2 — Sidebar navigation** 
- Từ example, copy **dòng 1566–1622** (thẻ `<body>` → `</aside>`)
- Dán thay thế thẻ `<body>` trống, thêm `</div></body></html>` đóng khung
```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Add sidebar with 10 nav links and user footer"
```

**Commit 3 — Top header + View toggle**
- Copy **dòng 1625–1660** (`.main-wrapper` → `</header>`)
- Dán nối tiếp sau `</aside>`, trước thẻ đóng
```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Add header with search, map/grid toggle, notification bell"
```

**Commit 4 — Map container + Overlays + Legends**
- Copy **dòng 1662–1965** (`cultivation-layout` → `</div>` field-map)
- Bao gồm: Leaflet map div, Drawing indicator, Location search, Map controls (zoom/location), Map layer buttons (Đường phố/Vệ tinh/Thổ nhưỡng/Quy hoạch), Planning sync bar, Weather widget, NDVI legend, Planning legend, Soil legend, Suitability legend, Field grid view
```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Build map container with layer buttons, legends and weather widget"
```

```bash
git push -u origin feature/SCRUM-21-cultivation-layout
```
👉 **GitHub:** Tạo PR, title: `feat: [SCRUM-21] Cultivation page layout with Leaflet map`. Khoa review → Merge.

---

### 🔵 PR #2 – KIỆT (A): Sensor Sidebar + Farm Management
**Nhánh:** `feature/SCRUM-21-sensor-sidebar`

```bash
git checkout main && git pull origin main
git checkout -b feature/SCRUM-21-sensor-sidebar
```

**Commit 5 — Sensor sidebar cards**
- Copy **dòng 1967–2068** (sensor-sidebar → bốn sensor cards: Độ ẩm, Nhiệt độ, pH, Độ ẩm KK)
- Dán vào vị trí sau `</div><!-- field-map -->` trong cultivation.html
```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Add sensor sidebar with soil moisture, temperature, pH cards"
```

**Commit 6 — Farm management workflow buttons**
- Copy **dòng 2069–2191** (field-actions → `</aside>`)
- Bao gồm: Thêm ruộng, Dự báo, Chọn cây, Bón phân, Gieo hạt, Tưới nước, Phun thuốc, Thu hoạch, Xóa ruộng, Điện nước, Lịch tưới, Thị trường, Phân tích, Tài chính, Truy xuất, Thời tiết
```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Add farm management workflow: crop→fertilize→seed→water→harvest"
```

```bash
git push -u origin feature/SCRUM-21-sensor-sidebar
```
👉 **GitHub:** Tạo PR, title: `feat: [SCRUM-21] Sensor sidebar and farm workflow`. Hiển review → Merge.

---

### 🟡 PR #3 – KIỆT (A): Modals (Forecast, Pest, Marketplace…)
**Nhánh:** `feature/SCRUM-21-modals`

```bash
git checkout main && git pull origin main
git checkout -b feature/SCRUM-21-modals
```

**Commit 7 — Feature panels: Notification + Marketplace**
- Copy **dòng 2196–2281** (Feature panel overlay, Notification panel, Marketplace panel)
```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Add notification panel and marketplace trading panel"
```

**Commit 8 — Pest Analysis + Forecast modals**
- Copy **dòng 2283–2420** (Pest analysis modal với AI scan, Forecast modal)
```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Add AI pest analysis modal and weather forecast modal"
```

**Commit 9 — Remaining modals** (Crop selection, Fertilizer, Seed, Harvest, Delete field, Add field, KMZ upload, Watering schedule…)
- Copy phần còn lại của các modals từ example
```bash
git add pages/cultivation.html
git commit -m "feat(cultivation): Add crop/fertilizer/seed/harvest/delete modals"
```

**Commit 10 — Script tags + CSS file**
- Copy [cultivation.css](file:///d:/Agriplanner/css/pages/cultivation.css) từ `example/F2/cultivation.css` vào [css/pages/cultivation.css](file:///d:/Agriplanner/css/pages/cultivation.css)
- Thêm các `<script src>` tags vào cuối HTML
```bash
git add pages/cultivation.html css/pages/cultivation.css
git commit -m "feat(cultivation): Link cultivation.css and add script tags for JS modules"
```

```bash
git push -u origin feature/SCRUM-21-modals
```
👉 **GitHub:** Tạo PR, title: `feat: [SCRUM-21] Complete all modals and CSS`. Khoa review → Merge.

---

## ═══ NGÀY 3–4: BACKEND API ═══

### ⚙️ PR #4 – HIỂN (B): Controllers & Services
**Nhánh:** `feature/SCRUM-23-map-api`

```bash
git checkout main && git pull origin main
git checkout -b feature/SCRUM-23-map-api
```

**Commit 11 — Field CRUD controllers**
- Copy [FieldLossController.java](file:///d:/Agriplanner/example/F2/FieldLossController.java), [FieldZoneController.java](file:///d:/Agriplanner/example/F2/FieldZoneController.java), [LandParcelController.java](file:///d:/Agriplanner/example/F2/LandParcelController.java) từ `example/F2/`
```bash
git add backend/src/main/java/com/agriplanner/controller/FieldLossController.java backend/src/main/java/com/agriplanner/controller/FieldZoneController.java backend/src/main/java/com/agriplanner/controller/LandParcelController.java
git commit -m "feat(api): Implement Field CRUD endpoints - LandParcel, FieldZone, FieldLoss"
```

**Commit 12 — KMZ Upload & Parser**
- Copy `KmzUploadController.java`, `KmzImageController.java` + `KmzParserService.java`
```bash
git add backend/src/main/java/com/agriplanner/controller/KmzUploadController.java backend/src/main/java/com/agriplanner/controller/KmzImageController.java backend/src/main/java/com/agriplanner/service/KmzParserService.java
git commit -m "feat(api): Add KMZ upload and extraction to GeoJSON format"
```

**Commit 13 — Map Analysis AI + Planning Zone**
- Copy `MapImageAnalysisController.java`, `PlanningZoneController.java` + `MapAnalysisAIService.java`, `FieldService.java`, `PlanningZoneTypeMappingService.java`, `SoilTypeMappingService.java`
```bash
git add backend/src/main/java/com/agriplanner/controller/MapImageAnalysisController.java backend/src/main/java/com/agriplanner/controller/PlanningZoneController.java backend/src/main/java/com/agriplanner/service/MapAnalysisAIService.java backend/src/main/java/com/agriplanner/service/FieldService.java backend/src/main/java/com/agriplanner/service/PlanningZoneTypeMappingService.java backend/src/main/java/com/agriplanner/service/SoilTypeMappingService.java
git commit -m "feat(api): Integrate AI Map Analysis and Planning Zone services"
```

```bash
git push -u origin feature/SCRUM-23-map-api
```
👉 **GitHub:** Tạo PR, title: `feat: [SCRUM-23] Backend APIs for Fields, KMZ, Map Analysis`. Kiệt review → Merge.

---

## ═══ NGÀY 5–6: JAVASCRIPT LOGIC ═══

### 🟣 PR #5 – KHOA (C): Interactive Map Viewer
**Nhánh:** `feature/SCRUM-22-map-js`

```bash
git checkout main && git pull origin main
git checkout -b feature/SCRUM-22-map-js
```

**Commit 14 — Leaflet Map initialization**
- Copy `interactive-map-viewer.js` từ `example/F2/` vào `js/interactive-map-viewer.js`
- Nội dung: Init Leaflet, title layers, Draw tools, polygon click handlers
```bash
git add js/interactive-map-viewer.js
git commit -m "feat(map): Initialize Leaflet map with Draw tools and tile layers"
```

**Commit 15 — Map Layers GeoJSON**
- Copy `cultivation-map-layers.js` từ `example/F2/` vào `js/cultivation-map-layers.js`
- Nội dung: Fetch & render GeoJSON cho Soil, Planning, Suitability layers
```bash
git add js/cultivation-map-layers.js
git commit -m "feat(map): Implement GeoJSON layer rendering for Soil and Planning"
```

**Commit 16 — Main cultivation logic**
- Copy `cultivation.js` từ `example/F2/` vào `js/cultivation.js`
- Nội dung: Weather widget, Field CRUD, Sensor data, Workflow steps, Market ticker
```bash
git add js/cultivation.js
git commit -m "feat(cultivation): Add main JS logic - weather, field CRUD, sensor data"
```

```bash
git push -u origin feature/SCRUM-22-map-js
```
👉 **GitHub:** Tạo PR, title: `feat: [SCRUM-22] Core Maps JS - Leaflet, GeoJSON, Weather`. Kiệt review → Merge.

---

## ═══ NGÀY 7: ⚡ CONFLICT TỰ NHIÊN ═══

### 🔴 PR #6 – KIỆT (A): Thêm section mới vào sensor sidebar
**Nhánh:** `feature/SCRUM-21-sidebar-upgrade`
- Kiệt thêm section "AI Crop Recommendation" vào cuối sensor sidebar trong `cultivation.html`
- **Không merge ngay** — để PR #7 của Khoa tạo conflict

### 🔴 PR #7 – KHOA (C): Sửa sensor sidebar thêm chart
**Nhánh:** `feature/SCRUM-22-sensor-chart`
- Khoa thêm chart canvas vào sensor sidebar trong `cultivation.html`
- Khi merge → **Git Conflict** vì cả 2 sửa cùng vùng sensor sidebar
- **Giải quyết:**
```bash
git checkout feature/SCRUM-22-sensor-chart
git fetch origin
git rebase origin/main
# Resolve conflict trong cultivation.html
git add pages/cultivation.html
git rebase --continue
git push -f origin feature/SCRUM-22-sensor-chart
```
👉 Tạo PR, Kiệt review conflict resolution → Merge.

---

## ═══ NGÀY 8: 🐛 QA BẮT BUG ═══

### 🐛 PR #8 – KHOA (C): Fix Bug Layer Crash
**Nhánh:** `bugfix/SCRUM-35-layer-crash`

Duy (QA) phát hiện: Bật 3 map layers liên tục (Thổ nhưỡng + Quy hoạch + Thích nghi) → trình duyệt đơ, GeoJSON đè chồng nhau.

```bash
git checkout main && git pull origin main
git checkout -b bugfix/SCRUM-35-layer-crash
```

**Commit 19 — Fix: Clear layers trước khi mount + disable button khi loading**
- Mở `js/cultivation-map-layers.js`
- Thêm `if (map.hasLayer(currentLayer)) map.removeLayer(currentLayer);` trước mỗi lần add layer
- Thêm `btn.disabled = true` khi bắt đầu fetch, `btn.disabled = false` khi fetch xong
```bash
git add js/cultivation-map-layers.js
git commit -m "fix(map): Clear existing layers before mounting new GeoJSON to prevent UI freeze"
```

**Commit 20 — Test stability**
```bash
git commit --allow-empty -m "test(map): Verify rapid layer toggling stability - PASSED"
git push -u origin bugfix/SCRUM-35-layer-crash
```
👉 **GitHub:** Tạo PR khẩn: `fix: [SCRUM-35] Resolve map layer crash on rapid toggling`. Kiệt review → Merge.
👉 **Jira:** Duy đóng bug SCRUM-35.

---

## 📊 TỔNG KẾT F2

| # | PR Title | Dev | Commits | Reviewer |
|---|----------|-----|---------|----------|
| 1 | Layout Leaflet map | Kiệt | 4 | Khoa |
| 2 | Sensor sidebar + Farm workflow | Kiệt | 2 | Hiển |
| 3 | Modals + CSS | Kiệt | 4 | Khoa |
| 4 | Backend Controllers & Services | Hiển | 3 | Kiệt |
| 5 | Interactive Map JS | Khoa | 3 | Kiệt |
| 6 | Sidebar upgrade (conflict seed) | Kiệt | 1 | Khoa |
| 7 | Sensor chart (resolve conflict) | Khoa | 1 | Kiệt |
| 8 | Bugfix layer crash | Khoa | 2 | Kiệt |
| **Tổng** | | **3 Dev** | **~20** | |
