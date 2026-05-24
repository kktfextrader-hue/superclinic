# CLAUDE.md — Superclinic AI Workspace (v61)

> AI-Native Workspace — อ่านไฟล์นี้ก่อนทุกครั้ง
> ข้อมูลลับทั้งหมด (IDs, tokens, paths) อยู่ใน **CLAUDE.local.md** (ไม่ commit)

---

## 1. Project Identity

| รายการ | ข้อมูล |
|---|---|
| ชื่อคลินิค | Superclinic |
| แพทย์ | Dr. Stephen Strange |
| GitHub | kktfextrader-hue/Marvel-Clinic (branch: main) |
| Live URL | https://kktfextrader-hue.github.io/Marvel-Clinic/ |
| Workspace version | v61 (AI-Native Refactor) |

---

## 2. Tech Stack

```
Frontend  : Vanilla HTML / CSS / JavaScript (ไม่ใช้ Framework)
Database  : Google Sheets (8 ตาราง)
Backend   : Google Apps Script (REST API)
Auth      : Bearer Token (ดู CLAUDE.local.md)
Hosting   : GitHub Pages
OCR       : Tesseract.js (future)
Barcode   : html5-qrcode (future)
```

**กฎ:**
- ภาษา UI: **ภาษาไทย** | ตัวแปร/ฟังก์ชัน: **English camelCase**
- วันที่เก็บ: `YYYY-MM-DD` | แสดงผล: `DD/MM/YYYY (พ.ศ. 4 หลัก)` — ห้ามชื่อเดือนไทย, ห้าม 2 หลัก
- ทุก API call ต้องมี `try/catch` + `showToast()`
- ไม่ใช้ npm, jQuery, หรือ Framework ใดๆ
- CSS ใช้ CSS Variables เท่านั้น
- Soft delete: `is_active = FALSE` (ไม่ลบจริง)
- **ไฟล์ใหญ่ (>100 บรรทัด): ใช้ Python str.replace() เท่านั้น — ห้ามใช้ Edit tool**

---

## 3. Workspace Structure

```
superclinic-v61/
├── ai/
│   ├── agents/         ← agent specs per domain
│   ├── prompts/        ← prompt templates
│   ├── memory/         ← feature registry, conventions
│   ├── workflows/      ← step-by-step workflows
│   └── rules/          ← architecture + coding rules
│
├── frontend/
│   ├── features/
│   │   ├── patients/       ← ข้อมูลผู้ป่วย
│   │   ├── appointments/   ← นัดหมาย
│   │   ├── inventory/      ← สมุนไพร & ยา
│   │   ├── pharmacy/       ← บันทึกรักษา
│   │   ├── billing/        ← การเงิน
│   │   ├── bodymap/        ← แผนที่จุดเจ็บปวด
│   │   └── dashboard/      ← ภาพรวม
│   │
│   ├── shared/
│   │   ├── api/            ← callApi.js
│   │   ├── utils/          ← date.js, ui.js
│   │   ├── search/         ← acKeyNav.js, datePicker.js
│   │   ├── types/          ← schemas.js
│   │   ├── barcode/        ← (future)
│   │   └── ocr/            ← (future)
│   │
│   └── components/         ← bodymap-component.html
│
├── backend/
│   ├── apps-script/    ← Code.gs
│   ├── services/       ← service docs
│   ├── sheets/         ← schema docs per sheet
│   ├── auth/           ← auth flow docs
│   └── inventory/      ← inventory backend notes
│
├── docs/               ← api.md, herbs.md, etc.
├── scripts/            ← deploy scripts
└── CLAUDE.md           ← this file
```

---

## 4. AI Agent Files

| Agent | File | Purpose |
|---|---|---|
| Backend | `ai/agents/backend-agent.md` | Code.gs, GAS, API |
| Inventory | `ai/agents/inventory-agent.md` | Stock, herbs, medicine |
| Body Map | `ai/agents/bodymap-agent.md` | Body map component |
| Patient | `ai/agents/patient-agent.md` | Patient CRUD, search |
| Finance | `ai/agents/finance-agent.md` | Finance, receipts |
| Debug | `ai/agents/debug-agent.md` | Bug fixing |

**อ่าน agent file ที่เกี่ยวข้องก่อนทุกครั้งที่แก้ feature นั้น**

---

## 5. Prompt Templates

| Template | ใช้เมื่อ |
|---|---|
| `ai/prompts/create-feature.md` | สร้าง feature ใหม่ |
| `ai/prompts/fix-bug.md` | แก้ bug |
| `ai/prompts/add-api-endpoint.md` | เพิ่ม API endpoint |

---

## 6. Database Schema (8 ตาราง)

**IDs อยู่ใน CLAUDE.local.md**

| Sheet | Primary Key | Format |
|---|---|---|
| patients | hn | HN-XXXXXX |
| appointments | id | sequential int |
| treatments | id | sequential int |
| herbs | id | HRB-XXX |
| stock_transactions | id | sequential int |
| finance | id | sequential int |
| settings | key | string key |
| users | id | sequential int |

---

## 7. ID Convention (v61+)

```
patients.hn         →  HN-000001 (unchanged)
herbs.id            →  HRB-001 (unchanged)
appointments.id     →  1, 2, 3, 4...
treatments.id       →  1, 2, 3, 4...
finance.id          →  1, 2, 3, 4...
users.id            →  1, 2, 3, 4...
stock_transactions  →  1, 2, 3, 4...
```

---

## 8. Design System

```css
--g1: #2F5D50;  /* Deep Thai Herbal Green (หลัก) */
--g2: #5F8D4E;  /* Secondary Green */
--go: #C8A96B;  /* Luxury Gold */
--gs: #E5D3A3;  /* Soft Gold */
--cr: #F8F5EF;  /* Cream Background */
--dk: #1A1A2E;  /* Dark Text */
--er: #C0392B;  /* Error Red */
--ok: #27AE60;  /* Success Green */
```

Fonts: `Cormorant Garamond` (headings) · `Sarabun` (body Thai) · Tabler Icons CDN

---

## 9. SearchX Convention (v54+)

**SearchX** = autocomplete dropdown + keyboard navigation (↑↓ Enter Esc)

```html
<input id="INPUT-ID" oninput="searchFn(this.value)"
  onkeydown="acKeyNav(event,'DD-ID', el=>el.click())"
  onblur="setTimeout(()=>{dd.style.display='none'},200)">
<div id="DD-ID" style="display:none; position:absolute;"></div>
```

**ดู registry ใน:** `ai/memory/feature-registry.md`

⚠️ **ห้ามแตะ** `appt-pat-input` / `apptPatSearch` / `apptPatSelect`

---

## 10. Custom Date Picker (v59+)

ห้ามใช้ `<input type="date">` — ใช้ `dpInit()` เท่านั้น

```html
<div class="dp-wrap">
  <input type="text" id="FIELD-disp" class="form-control dp-input" placeholder="วว/ดด/ปปปป" readonly>
  <input type="hidden" id="FIELD" value="">
</div>
```

```javascript
setTimeout(() => dpInit('FIELD-disp', 'FIELD', todayISO()), 50);
dpGetValue('FIELD')                    // อ่านค่า YYYY-MM-DD
dpSetValue('FIELD', 'FIELD-disp', iso) // ตั้งค่า
```

---

## 11. Loading Spinner (v58+)

```javascript
const _done = showLoading(e.submitter);
try {
  await callApi(...);
  _done();
  showToast('✅ สำเร็จ');
} catch(err) {
  _done();
  showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
}
```

---

## 12. AI Rules

- **Never rewrite unrelated modules** — แก้เฉพาะส่วนที่ขอ
- **Generate only requested modules** — ไม่สร้างไฟล์เกิน
- **Reuse existing utilities** — ดู `frontend/shared/` ก่อน
- **Keep business logic isolated** — แต่ละ feature ใน folder ตัวเอง
- **Prefer incremental patches** — patch ทีละนิด ไม่ rewrite ทั้งหมด
- **Debounce search** — 300ms บน search inputs ทุกอัน
- **Batch Sheets operations** — ห้าม loop single cell reads

---

## 13. สิ่งที่ห้ามทำ

- ❌ ใส่ Spreadsheet ID / Token ใน CLAUDE.md หรือไฟล์ที่ commit
- ❌ ใช้ Edit tool กับไฟล์ที่ใหญ่กว่า 100 บรรทัด
- ❌ ลบข้อมูลจริงออกจาก Google Sheets (soft delete เท่านั้น)
- ❌ Push โดยไม่ตรวจ `async async` ก่อน
- ❌ ใช้ npm, jQuery, หรือ Framework ใดๆ
- ❌ แก้ `appt-pat-input` / `apptPatSearch` / `apptPatSelect` โดยไม่จำเป็น
- ❌ ใช้ inline `onclick="fn('${name}')"` กับข้อความภาษาไทย
- ❌ ใช้ `<input type="date">`
- ❌ แสดงชื่อเดือนภาษาไทย
- ❌ ใช้ปี 2 หลัก

---

## 14. Changelog

| วันที่ | Version | การเปลี่ยนแปลง |
|---|---|---|
| 2025-05-10 | v1.0 | สร้างระบบเริ่มต้น |
| 2026-05-22 | v50-v60 | ดู CLAUDE.md หลัก |
| 2026-05-24 | v61 | AI Workspace Refactor — แยก folder structure, agents, prompts, shared utilities |
