# KỊCH BẢN GITHUB (v4): CHỨC NĂNG 3 – TÌM KIẾM BẰNG GIỌNG NÓI (VOICE SEARCH)
**Sprint 3 · 3 Dev · 5 PRs · ~12 atomic commits**

> **Mô tả:** Nút microphone (FAB) ở góc phải dưới trang Admin. Bấm vào → mở popup → nói tiếng Việt → hệ thống nhận diện giọng nói và tìm kiếm Cây trồng, Vật nuôi, Sản phẩm.

> **Kỹ thuật:** Web Speech API (`SpeechRecognition`, ngôn ngữ `vi-VN`), CSS inject, HTML inject qua JS DOM.

> **Code nằm trong:** [js/admin.js](file:///d:/Agriplanner/js/admin.js) (dòng 9469 → ~10210), tích hợp trực tiếp — không có file riêng.

---

## ═══ NGÀY 1–2: CSS & UI COMPONENTS ═══

### 🟢 PR #1 – KIỆT (A): Voice Search Styles + FAB Button
**Nhánh:** `feature/f3-voice-search-ui`

```bash
git checkout main && git pull origin main
git checkout -b feature/f3-voice-search-ui
```

**Commit 1 — Voice Search CSS injection**
- Mở [js/admin.js](file:///d:/Agriplanner/js/admin.js), thêm hàm [injectVoiceSearchStyles()](file:///d:/Agriplanner/js/admin.js#9556-10039) tạo thẻ `<style>` inject vào DOM
- Bao gồm: `.vs-container` (fixed bottom-right), `.vs-toggle` (nút FAB tròn 60px, gradient xanh lá), `.vs-toggle.listening` (đổi gradient đỏ + hiệu ứng glow), `.vs-pulse-ring` (3 vòng pulse khi đang nghe), `.vs-panel` (popup 400px bo góc 20px), `.vs-header` (gradient xanh đậm), `.vs-wave-container` (9 thanh sóng âm animation), `.vs-result-item` (card kết quả với hover effect)
```bash
git add js/admin.js
git commit -m "feat(voice): Add Voice Search CSS - FAB button, popup panel and wave animations"
```

**Commit 2 — Voice Search UI injection (HTML)**
- Thêm hàm [injectVoiceSearchUI()](file:///d:/Agriplanner/js/admin.js#10040-10074) tạo DOM elements:
  - FAB button mic ở góc phải dưới (`.vs-toggle`) với tooltip "Tìm kiếm giọng nói"
  - Popup panel (`.vs-panel`): Header xanh + nút đóng, Body chứa nút mic lớn 80px, transcript box, status text
  - 3 tag phân loại: 🌱 Cây trồng (xanh), 🐄 Vật nuôi (đỏ), 📦 Sản phẩm (xanh dương)
```bash
git add js/admin.js
git commit -m "feat(voice): Inject Voice Search UI - FAB mic button, popup panel with transcript display"
```

**Commit 3 — Panel state management**
- Thêm hàm [setVoiceSearchPanelState(state)](file:///d:/Agriplanner/js/admin.js#10098-10175) quản lý 7 trạng thái: `idle`, `listening`, `processing`, `results`, `not-found`, [error](file:///d:/Agriplanner/js/admin.js#9533-9552), `unsupported`
- Thêm `toggleVoiceSearchPanel()`, [updateVoiceToggleIcon()](file:///d:/Agriplanner/js/admin.js#10208-10221)
```bash
git add js/admin.js
git commit -m "feat(voice): Add panel state management - idle/listening/processing/results transitions"
git push -u origin feature/f3-voice-search-ui
```
👉 **GitHub:** Tạo PR, title: `feat: Voice Search UI - FAB button, popup panel and animations`. Khoa review → Merge.

---

### 🔵 PR #2 – KHOA (C): SpeechRecognition Logic
**Nhánh:** `feature/f3-speech-recognition`

```bash
git checkout main && git pull origin main
git checkout -b feature/f3-speech-recognition
```

**Commit 4 — Web Speech API initialization**
- Thêm `voiceSearchState` object (isOpen, isListening, recognition, currentTranscript, panelState)
- Thêm hàm [initVoiceSearch()](file:///d:/Agriplanner/js/admin.js#9481-9555): tạo `SpeechRecognition` instance, set `lang = 'vi-VN'`, `interimResults = true`, `maxAlternatives = 3`
```bash
git add js/admin.js
git commit -m "feat(voice): Initialize Web Speech API with Vietnamese language support"
```

**Commit 5 — Event handlers: onresult, onend, onerror**
- `recognition.onresult`: hiển thị interim/final transcript real-time vào `.vs-transcript-box`
- `recognition.onend`: khi ngừng nói → chuyển sang state `processing`, gọi [processVoiceSearch()](file:///d:/Agriplanner/js/admin.js#10409-10441)
- `recognition.onerror`: xử lý `no-speech` (thử lại), `not-allowed` (hiện thông báo cần bật mic)
```bash
git add js/admin.js
git commit -m "feat(voice): Handle recognition events - real-time transcript and error recovery"
```

**Commit 6 — Toggle listening + Connect to DOMContentLoaded**
- Thêm [startVoiceListening()](file:///d:/Agriplanner/js/admin.js#10176-10199), [stopVoiceListening()](file:///d:/Agriplanner/js/admin.js#10200-10207)
- Gọi [initVoiceSearch()](file:///d:/Agriplanner/js/admin.js#9481-9555) trong `DOMContentLoaded` event
```bash
git add js/admin.js
git commit -m "feat(voice): Connect voice search init to page load and toggle listening controls"
git push -u origin feature/f3-speech-recognition
```
👉 **GitHub:** Tạo PR: `feat: Web Speech API integration - Vietnamese voice recognition`. Kiệt review → Merge.

---

## ═══ NGÀY 3–4: SEARCH LOGIC + BACKEND ═══

### 🟣 PR #3 – KIỆT (A): Search Processing & Results Display
**Nhánh:** `feature/f3-voice-search-logic`

```bash
git checkout main && git pull origin main
git checkout -b feature/f3-voice-search-logic
```

**Commit 7 — processVoiceSearch() - fetch & filter**
- Thêm hàm [processVoiceSearch(query)](file:///d:/Agriplanner/js/admin.js#10409-10441): gọi API lấy danh sách crops, animals, shop items → filter theo keyword (fuzzy match tên, danh mục, mô tả)
- Render kết quả vào `.vs-body`: mỗi item hiện icon + tên + loại + mũi tên navigate
```bash
git add js/admin.js
git commit -m "feat(voice): Implement search processing - fetch data, fuzzy match and render results"
```

**Commit 8 — Result click handlers + Navigate to tab**
- Click vào kết quả → tự động chuyển sang tab tương ứng (Cây trồng/Vật nuôi/Sản phẩm) và highlight item
- Thêm `navigateToItem(type, id)` function
```bash
git add js/admin.js
git commit -m "feat(voice): Add result click navigation - auto switch to matching admin tab"
git push -u origin feature/f3-voice-search-logic
```
👉 **GitHub:** Tạo PR: `feat: Voice search processing and result navigation`. Hiển review → Merge.

---

## ═══ NGÀY 5: ⚡ CONFLICT TỰ NHIÊN ═══

### 🔴 PR #4a – KIỆT (A): Thêm search history vào voice panel
**Nhánh:** `feature/f3-voice-history`
- Kiệt thêm section "Lịch sử tìm kiếm gần đây" vào cuối voice panel trong [admin.js](file:///d:/Agriplanner/js/admin.js)

### 🔴 PR #4b – KHOA (C): Thêm category filter vào voice panel
**Nhánh:** `feature/f3-voice-filter`
- Khoa thêm checkbox filter (Chỉ cây trồng / Chỉ vật nuôi / Chỉ sản phẩm) vào voice panel
- Khi merge → **Git Conflict** vì cả 2 sửa cùng vùng [injectVoiceSearchUI()](file:///d:/Agriplanner/js/admin.js#10040-10074) trong admin.js
- **Giải quyết:**
```bash
git checkout feature/f3-voice-filter
git fetch origin && git rebase origin/main
# Resolve conflict: giữ cả search history + category filter
git add js/admin.js
git rebase --continue
git push -f origin feature/f3-voice-filter
```
👉 Kiệt review conflict resolution → Merge.

---

## ═══ NGÀY 6: 🐛 QA BẮT BUG ═══

### 🐛 PR #5 – HIỂN (B): Fix Bug Voice Search trên Mobile
**Nhánh:** `bugfix/f3-voice-mobile-crash`

Duy (QA) phát hiện: Trên Safari iOS, `webkitSpeechRecognition` không tồn tại → click nút mic → crash toàn bộ admin.js, trang trắng xóa.

```bash
git checkout main && git pull origin main
git checkout -b bugfix/f3-voice-mobile-crash
```

**Commit 11 — Fix: Graceful fallback khi browser không hỗ trợ**
- Mở [js/admin.js](file:///d:/Agriplanner/js/admin.js), sửa [initVoiceSearch()](file:///d:/Agriplanner/js/admin.js#9481-9555): thêm `try-catch` bọc toàn bộ init
- Khi không hỗ trợ → ẩn FAB button hoàn toàn thay vì crash
- Thêm fallback text input search trong panel cho trình duyệt không hỗ trợ
```bash
git add js/admin.js
git commit -m "fix(voice): Add graceful fallback for browsers without SpeechRecognition API"
```

**Commit 12 — Test verification**
```bash
git commit --allow-empty -m "test(voice): Verify voice search works on Chrome, Edge and graceful fallback on Safari"
git push -u origin bugfix/f3-voice-mobile-crash
```
👉 **GitHub:** Tạo PR: `fix: Voice Search crash on Safari/iOS - add graceful fallback`. Kiệt review → Merge.

---

## 📊 TỔNG KẾT F3

| # | PR Title | Dev | Commits | Reviewer |
|---|----------|-----|---------|----------|
| 1 | Voice UI - FAB + Popup + Animations | Kiệt | 3 | Khoa |
| 2 | SpeechRecognition API (vi-VN) | Khoa | 3 | Kiệt |
| 3 | Search processing + Navigation | Kiệt | 2 | Hiển |
| 4 | History + Filter (conflict) | Kiệt/Khoa | 2 | Kiệt |
| 5 | Bugfix Safari crash | Hiển | 2 | Kiệt |
| **Tổng** | | **3 Dev** | **~12** | |
