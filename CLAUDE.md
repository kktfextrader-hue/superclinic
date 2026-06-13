# CLAUDE.md — Superclinic

> Single Source of Truth — อ่านไฟล์นี้ก่อนทุกครั้ง
> ข้อมูลลับทั้งหมด (IDs, tokens, paths) อยู่ใน **CLAUDE.local.md** (ไม่ commit)

---

## 0. ⭐ นโยบายเจ้าของโปรเจกต์ (สูงสุด) + Clinic Convention

### §0.0 นโยบายการทำงานของเจ้าของโปรเจกต์ — ลำดับความสำคัญสูงสุด (เหนือทุก convention/section ด้านล่าง)

1. **เสถียรไว้ก่อน** — ความเสถียรใช้งานจริงต้องไว้ใจได้ ฟีเจอร์ใหม่ห้ามแลกด้วยความไม่นิ่งของเดิม → **ทุกงานต้องมี regression test ของพฤติกรรมเดิมก่อนนับของใหม่**
2. **ประหยัดสูงสุด** — ยังไม่มีรายได้จาก code → พึ่งของฟรี (free tier / open source / ของในเครื่อง) ก่อน · จะเสนอของเสียเงินต้องแจ้งราคา + ของฟรีที่ใกล้เคียงเทียบเสมอ
3. **Research ให้สุด** — ค้นเชิงลึกหาความต่างจากธรรมดา เป้าหมาย "wow" ไม่ใช่แค่ "ใช้ได้"
4. **ลำบากที่เรา สบายที่ผู้ใช้** — ยอม code นานขึ้นได้เสมอ ถ้าผู้ใช้ สะดวก/เร็ว/เข้าใจง่าย/ไว้ใจได้
5. **ระเบียบและแยกส่วน** — โค้ดต้องแก้บั๊กง่าย เพิ่มของใหม่ไม่กระเทือนของเก่า · แยกย่อยเป็นหัวข้อ/โมดูล/เฟส focus ทีละเรื่อง (รวม: ทำทีละเฟส เฟสละ commit, behavioral compatibility)
6. **เรียนรู้จากปัญหาและบันทึก** — ทุกบั๊ก/ปัญหาที่แก้เสร็จ บันทึก lesson ลง `docs/lessons.md` (อาการ → สาเหตุ → วิธีแก้ → วิธีกันซ้ำ) เพื่อ project ใหม่ไม่พลาดจุดเดิม
7. **พึ่งพาตัวเองให้มากที่สุด** — ทุกครั้งที่พึ่งบริการ/แอปภายนอก ให้คิดเสมอว่า "เอา logic เขามาเข้า library เราได้ไหม" กันบริการภายนอกล่มแล้วงานหยุด
8. **โตช้าไม่ว่า แต่ต้องโต** — สะสมความสามารถเข้า library ตัวเองต่อเนื่อง · เทรนทั้งคนและระบบให้เก่งขึ้นเรื่อยๆ

---

### §0.1 CLINIC CODE CONVENTION (ตั้ง 2026-06-04)

> **งานแก้โค้ดเรื่อง clinic (UI/ฟีเจอร์) ต่อไปนี้ ต้องแก้ทั้ง 2 แอป (scproject + superclinic) พร้อมกันเสมอ**
> **ยกเว้น** ส่วนที่ superclinic เป็น **standalone** — data/auth layer ต่างกัน:
> - superclinic = SCL- token + ยิง Apps Script ตรง (ชีตเดียว) · **ไม่มี** LS proxy / OAuth(Google) / sheet_id ต่อ tenant / Google-login lockdown
> - scproject = LS proxy + token ต่อ tenant + Google-login
> → ฟีเจอร์/UI ร่วม = แก้คู่กัน · ส่วน standalone (เช่น backup กลไก, login flow) = ปรับเฉพาะ superclinic ตามสถาปัตยกรรมของมัน
> เหตุผล: superclinic เป็น standalone version ของ scproject (merge เท่าที่ทำได้)

---

### §0.2 UPGRADE LOGGING PROTOCOL — บันทึก upgrade ลง log ครบทุกที่ (ตั้ง 2026-06-13)

> **ทุกครั้งที่ upgrade/เพิ่มฟีเจอร์ ต้องบันทึกลง log ให้ครบ** เพื่อตามรอยพัฒนาการของแต่ละระบบ — ห้ามปล่อย log เลื่อนลอย (เคสเสีย: ตาราง §15 ค้างที่ v66 ทั้งที่ของจริง v220+)

**อัตโนมัติ — `push-now.bat` → `update_version.py` ทำให้ (ไม่ต้องแตะมือ):**
- `changelog.json` (in-app fetch ตัวนี้) + `const CHANGELOG=[` ใน html (fallback) + version + backup `superclinic-v<N>.html`
- → **commit message = ตัว log** เขียนให้ดี: `feat(v<internal> <module>): <ทำอะไร — จุดเด่น>` (ส่งเป็น arg: `push-now.bat "ข้อความ"`)

**ทำมือ — Claude อัปเดตเองทุก upgrade ก่อน/พร้อม push:**
- `docs/<feature>.md` (as-built) — โมดูลไหนเปลี่ยน อัปให้ตรงจริง
- `docs/lessons.md` — เฉพาะถ้าแก้บั๊ก/กับดัก (อาการ→เหตุ→แก้→กันซ้ำ, §0.0-6)
- `kkcallmd/done-log.md` — archive ข้ามแอป (วันที่ + เวอร์ชันทั้ง 2 แอป + รายละเอียด)
- memory `project_*` — ถ้า state โปรเจกต์ขยับ

**§15 ด้านล่าง = ประวัติเก่า v1-v66 (historical) · log สดจริง = `changelog.json` (อย่าเปิด 2 รางให้ drift อีก)**

---

## 1. Project Identity

| รายการ | ข้อมูล |
|---|---|
| ชื่อคลินิค | Superclinic |
| แพทย์ | Dr. Stephen Strange |
| GitHub | kktfextrader-hue/superclinic (branch: main) |
| Live URL | https://kktfextrader-hue.github.io/superclinic/ |
| ไฟล์หลัก | superclinic.html (เดิม: thai-clinic.html) |

---

## 2. Tech Stack & กฎการเขียนโค้ด

```
Frontend  : Vanilla HTML / CSS / JavaScript (ไม่ใช้ Framework)
Database  : Google Sheets (8 ตาราง)
Backend   : Google Apps Script (REST API)
Auth      : Bearer Token (ดู CLAUDE.local.md)
Hosting   : GitHub Pages
```

**กฎ:**
- ภาษา UI: **ภาษาไทย** | ตัวแปร/ฟังก์ชัน: **English camelCase**
- วันที่เก็บ: `YYYY-MM-DD` | แสดงผล: `DD/MM/YYYY (พ.ศ. 4 หลัก)` — ห้ามใช้ 2 หลัก, ห้ามแสดงชื่อเดือนไทย
- ทุก API call ต้องมี `try/catch` + `showToast()`
- ไม่ใช้ npm, jQuery, หรือ Framework ใดๆ
- CSS ใช้ CSS Variables เท่านั้น
- Soft delete: `is_active = FALSE` (ไม่ลบจริง)
- **ไฟล์ใหญ่ (>100 บรรทัด): ใช้ Python str.replace() เท่านั้น — ห้ามใช้ Edit tool**

---

## 3. Database Schema (8 ตาราง)

**IDs อยู่ใน CLAUDE.local.md**

| Sheet | Primary Key | columns หลัก |
|---|---|---|
| patients | `hn` (HN-XXXXXX) | hn, prefix, first_name, last_name, dob, gender, phone, element, allergy, chronic_disease, patient_type, body_map, is_active |
| appointments | `id` | patient_id, patient_name, date, time_start, doctor, treatment_type, status, room |
| treatments | `id` | patient_id, appointment_id, date, type, symptoms, diagnosis, herbs_used, price |
| herbs | `id` (HRB-XXX) | name_th, name_en, category, unit, quantity, min_quantity, cost_per_unit, status |
| stock_transactions | `id` | herb_id, type (IN/OUT), quantity, reason |
| finance | `id` | date, type (income/expense), category, amount, payment_method, receipt_no |
| settings | `key` | value, description |
| users | `id` | name, role, email, is_active |

---

## 4. หัตถการหลัก

| รหัส | ชื่อ | ราคา |
|---|---|---|
| TRT-01 | นวดแผนไทย | 300–600 บาท |
| TRT-02 | ประคบสมุนไพร | 200–400 บาท |
| TRT-03 | อบสมุนไพร | 150–250 บาท |
| TRT-04 | ฝังเข็ม | 400–800 บาท |
| TRT-05 | ครอบแก้ว | 200–350 บาท |
| TRT-07 | ปรึกษาแพทย์ | 200 บาท |

---

## 5. API (สรุป)

```
GET  ?sheet=SHEET&action=list&token=TOKEN
GET  ?sheet=SHEET&action=get&id=ID&token=TOKEN
POST ?sheet=SHEET&action=create|update|delete&token=TOKEN  (body: JSON text/plain)

Response: { ok: true, data: { rows: [...] } }
```

> รายละเอียดเพิ่มเติม: **docs/api.md**

**callApi() helper:**
```js
await callApi('patients', 'list')
await callApi('patients', 'get', null, 'HN-000001')
await callApi('finance', 'create', { type:'income', amount:800 })
```

---

## 6. Design System

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

## 7. Body Map Component

แผนที่จุดเจ็บปวด — 4 มุมมอง, 5 ระดับความปวด, หลาย instance พร้อมกัน

```
Component file : https://kktfextrader-hue.github.io/superclinic/bodymap-component.html
API reference  : BODYMAP.md
```

```js
bodyMapHTML('uid')          // สร้าง HTML
bmGetValue('uid')           // อ่าน JSON
bmLoadData('uid', json)     // โหลดข้อมูลเก่า
bmClear('uid')              // ล้าง
```

---

## 8. Deploy Workflow

**Canonical deploy = `push-now.bat`** (Windows: `C:\Users\acer\Desktop\Claude\superclinic\push-now.bat`)
**Claude รันเองได้ตรงจาก Windows** (พิสูจน์ 2026-06-13: push v183 = a37b0c7) — เลิกใช้สมมติฐานเดิม "sandbox ออกเน็ตไม่ได้"

**วิธีรัน (Claude):** ส่ง commit msg เป็น arg เพื่อข้าม prompt `set /p`:

```
& cmd.exe /c '"C:\Users\acer\Desktop\Claude\superclinic\push-now.bat" "feat(vXXX module): สิ่งที่ทำ"'
```

- PowerShell tool ตั้ง **`dangerouslyDisableSandbox: true`** (git ต้องออกเน็ต) · probe ก่อนได้ `git ls-remote <url> main`
- **commit msg = ASCII เท่านั้น** (ผ่าน cmd `%1` ภาษาไทยเพี้ยน mojibake) · changelog ภาษาไทยอื่นไม่กระทบ (`update_version.py` เขียน UTF-8 เอง)

**bat ทำอัตโนมัติ 6 ขั้น:** [0] `check_integrity.py` (>500k chars / ไม่มี `async async` / tag ครบ) → [1] หา version ล่าสุดจาก `superclinic-v*.html` +1 → `update_version.py` แทรก `changelog.json` + `CHANGELOG[]` (fallback) → [2] backup `superclinic-v<N>.html` → [3] clone → [4] copy (`index.html` `superclinic.html` `bodymap-component.html` `Code.gs` `BODYMAP.md` `CLAUDE.md` `changelog.json` `docs/` `weights/`) → [5] commit + push → [6] cleanup
- ⚠️ integrity/update fail → bat `pause` (**ค้างใน non-interactive**) → แก้ก่อนรันใหม่
- PAT อยู่ใน `push-now.bat` (local, **ไม่ถูก copy ขึ้น repo**) · ห้ามใส่ PAT ในไฟล์ที่ commit

> วิธีเดิม push จาก Linux sandbox (`/sessions/.../mnt`, manual git) = เลิกใช้ · อยู่ใน git history ถ้าต้องการ

---

## 9. Related Docs

| ไฟล์ | อ่านเมื่อ |
|---|---|
| CLAUDE.local.md | ต้องการ Spreadsheet ID, token, path จริง |
| docs/api.md | เพิ่ม endpoint, debug API, fetch ตัวอย่าง |
| docs/herbs.md | เพิ่ม/แก้ stock, จ่ายยา, แนะนำยา |
| docs/elements.md | วินิจฉัยตามธาตุ, แนะนำยาตามธาตุ |
| docs/patients.md | ทดสอบระบบ, seed data, demo |
| BODYMAP.md | เอา body map ไปใช้ใน project อื่น |

---

## 10. SearchX Convention (v54+, ชื่อย่อมาตรฐาน)

**SearchX** = ช่อง search ที่มี autocomplete dropdown + keyboard navigation (↑↓ Enter Esc)

**ทุก SearchX ต้องมีโครงสร้างนี้:**
```html
<input id="INPUT-ID" oninput="searchFn(this.value)"
  onkeydown="acKeyNav(event,'DD-ID', el=>el.click())"
  onblur="setTimeout(()=>{dd.style.display='none'},200)">
<div id="DD-ID" style="display:none; position:absolute; ...dropdown styles..."></div>
```

**Shared utility:** `acKeyNav(event, dropdownId, selectFn)`
- ↓ / ↑ เลื่อน highlight (class `.ac-focused`)
- Enter เลือก item ที่ highlight
- Esc ปิด dropdown

**SearchX ที่ใช้แล้ว (v60):**

| input id | dropdown id | หน้า | หมายเหตุ |
|---|---|---|---|
| `appt-pat-input` | `appt-pat-suggestions` | นัดหมายใหม่ | ⚠️ **ห้ามแตะ** — มี logic พิเศษสร้างผู้ป่วยใหม่ด้วย |
| `reg-search` | `reg-search-result` | ลงทะเบียน | รองรับ + สร้างผู้ป่วยใหม่ inline |
| `treat-search` | `treat-pat-dd` | บันทึกรักษา | เลือกผู้ป่วยก่อนบันทึก |
| `rcpt-pat-search` | `rcpt-pat-dd` | ออกใบเสร็จ | |
| herb search (treat) | `herb-ac-box` | บันทึกรักษา | ยาสมุนไพร |
| herb search (medi) | `herb-ac-box-medi` | บันทึกรักษา | ยาแผนปัจจุบัน |
| `herb-name-{idx}` | `herb-ac-{idx}` | ยาที่จ่าย | dynamic rows |

> **ช่องที่ไม่ใช้ SearchX (plain input):** ชื่อยา/สมุนไพรในฟอร์มเพิ่มใหม่ — กรอกเองได้เลย

---

## 11. สิ่งที่ห้ามทำ

- ❌ ใส่ Spreadsheet ID / Token ใน CLAUDE.md หรือไฟล์ที่ commit
- ❌ ใช้ Edit tool กับไฟล์ HTML ที่ใหญ่กว่า 100 บรรทัด
- ❌ ลบข้อมูลจริงออกจาก Google Sheets (soft delete เท่านั้น)
- ❌ Push โดยไม่ตรวจ `async async` ก่อน
- ❌ ใช้ npm, jQuery, หรือ Framework ใดๆ
- ❌ แก้ `appt-pat-input` / `apptPatSearch` / `apptPatSelect` โดยไม่จำเป็น
- ❌ ใช้ inline `onclick="fn('${name}')"` กับข้อความภาษาไทย — ใช้ `data-*` + `addEventListener` แทน

## 11c. ปุ่ม "ค้นหาด้วยใบหน้า" — ไอคอนหน้ายิ้ม (FACE-SCAN-ICON, v61/v181)

**กฎ:** ปุ่ม scan / ค้นหาด้วยใบหน้า **ทุกที่** ต้องมีไอคอน **หน้ายิ้ม (faceVec SVG)** นำหน้า — แบบเดียวกับ avatar คนไข้หน้าแรก · **ห้ามใช้ `ti-face-id`** (หน้ากาก/กรอบสแกน)
- SVG: `stroke="currentColor"` (สีตามปุ่ม) · ~15px · `<circle r=9.2> + 2 ตา(fill) + path เส้นยิ้ม`
- ใช้แล้วที่: dashboard (นัดหมายวันนี้) + หน้าทะเบียนผู้ป่วย · **เพิ่มปุ่ม face ที่ใหม่ ต้องใช้รูปแบบนี้เสมอ**

## 11b. Loading Spinner Convention (v58+)

**กฎ:** ทุก async submit function ต้องแสดง spinner ระหว่าง API call

```js
// pattern มาตรฐาน — ใส่ต้น function ทันทีหลัง validation
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

`showLoading(btn)` — คืน `done()` function: disable ปุ่ม + แสดง ⏳ ปั่น ระหว่างรอ

---

## 12. Custom Date Picker Convention (v59+)

**กฎ:** ทุก input วันที่ในระบบต้องใช้ Custom Date Picker — **ห้ามใช้ `<input type="date">`**

**โครงสร้าง HTML:**
```html
<div class="dp-wrap">
  <input type="text" id="FIELD-disp" class="form-control dp-input" placeholder="วว/ดด/ปปปป" readonly>
  <input type="hidden" id="FIELD" value="">
</div>
```

**Init (ใน setTimeout 50ms หลัง openModal):**
```js
dpInit('FIELD-disp', 'FIELD', todayISO())
```

**อ่านค่า:** `dpGetValue('FIELD')` → คืน `YYYY-MM-DD`

**ตั้งค่าจากภายนอก:** `dpSetValue('FIELD', 'FIELD-disp', isoDate)`

**ช่องที่ใช้แล้ว (v59):**

| hidden id | display id | ใช้ที่ |
|---|---|---|
| `appt-date-in` | `appt-date-in-disp` | นัดหมายใหม่ |
| `reg-date` | `reg-date-disp` | ลงทะเบียนก่อนรักษา |
| `treat-date` | `treat-date-disp` | บันทึกหลังรักษา |
| `next-appt-date` | `next-appt-date-disp` | นัดครั้งต่อไป (ในบันทึกรักษา) |
| `vappt-date` | `vappt-date-disp` | แก้ไขนัดหมาย (viewAppt modal) |

**UX:** กดลูกศร ▲▼ ทีละ วัน/เดือน/ปี — ปุ่ม "วันนี้" reset — ปุ่ม "✓ เลือก" ปิด dropdown และ trigger `change` event

---

## 13. Appointment View/Edit Convention (v59+)

**กดที่ชื่อผู้ป่วยใน appt-card** → เรียก `viewAppt(id)` → เปิด modal แสดงข้อมูลนัดพร้อมแก้ไขได้

**Fields ที่แก้ได้:** วันที่, เวลา, ประเภทรักษา, สถานะ, แพทย์, เบอร์โทร, หมายเหตุ

**บันทึก:** `submitEditAppt(id)` — ใช้ `showLoading(btn)` + `callApi('appointments','update',data)`

---

## 14. Herb Stock Value Convention (v59+)

เมื่อ `loadHerbs()` ทำงาน → คำนวณ `Σ(quantity × cost_per_unit)` แล้วบันทึกลง:

```js
callApi('settings','update',{ key:'herb_stock_value', value: String(Math.round(val)), description:'...' })
```

อ่านค่าล่าสุด: `callApi('settings','get', null, 'herb_stock_value')`

---

## 15. Changelog

> ⚠️ ตารางนี้ = ประวัติเก่า v1-v66 (historical) · **log สดจริง = `changelog.json`** (update_version.py อัปอัตโนมัติตอน push) — ดู §0.2

| วันที่ | Version | การเปลี่ยนแปลง |
|---|---|---|
| 2025-05-10 | v1.0 | สร้างระบบเริ่มต้น |
| 2026-05-22 | v50 | เพิ่มปุ่มรายรับ/รายจ่าย, Body Map standalone, ปรับโครงสร้าง docs |
| 2026-05-22 | v51 | badge ⚠️ การนัดหมายซ้ำ |
| 2026-05-22 | v52 | แก้ TypeError phone.includes |
| 2026-05-22 | v53 | ออกใบเสร็จ: เปลี่ยน select → autocomplete |
| 2026-05-22 | v54 | keyboard navigation ↑↓ Enter Esc ทุก autocomplete |
| 2026-05-22 | v55 | format วันที่ DD/MM/YYYY (พ.ศ. 4 หลัก) ทุกที่ |
| 2026-05-22 | v56 | แสดงวันที่ DD/MM/YYYY เท่านั้น — ไม่มีชื่อเดือนไทย |
| 2026-05-22 | v57 | ลงทะเบียน: สร้างผู้ป่วยใหม่ inline + pre-fill + auto-select |
| 2026-05-22 | v58 | Thai name fix (data-* events), loading spinner, acKeyNav utility |
| 2026-05-23 | v59 | Custom Date Picker (↑▼ วัน/เดือน/ปี), Appt View/Edit modal, Herb Stock Value auto-save |
| 2026-05-23 | v60 | SearchX convention, ปุ่มแก้ไขใน appt-card, แก้ delete bug, treat-search → SearchX |
| 2026-05-25 | v61 | Face Recognition (face-api.js), Feature Toggles ON/OFF, ปุ่มออกใบรับรองแพทย์ |
| 2026-05-25 | v62 | ระบบพิมพ์ฉลากยา (Label Printer) — modal, preview, ขนาด, จำนวน, พิมพ์จริง |
| 2026-05-25 | v63 | Label Printer v2 — font size inputs/preset, live preview, autocomplete search |
| 2026-05-25 | v64 | ใบรับรองแพทย์แผนไทยประยุกต์ — modal A4, live preview, พิมพ์จริง |
| 2026-05-25 | v65 | เปลี่ยนชื่อไฟล์หลัก thai-clinic.html → superclinic.html, อัพเดท push-now.bat และ CLAUDE.md |
| 2026-06-01 | v66 | แก้ B01/B02/B07 — loadDashboard assign allAppts, searchTreatPat ส่ง p.hn แทน p.id |

---

## 16. PowerShell & Command Convention

**Working directory:**
```
C:\Users\acer\Desktop\Claude\superclinic
```

**กฎการเขียนคำสั่ง:**
- รวม `cd` และคำสั่งไว้ใน **code block เดียวกันเสมอ** เพื่อ copy ได้ทีเดียว
- ห้ามแยก code block — PowerShell จะรันทีละบรรทัดอัตโนมัติ

```
cd C:\Users\acer\Desktop\Claude\superclinic
python patch_example.py
```

**Terminal ที่ใช้:** Windows Terminal (`wt`) — รองรับภาษาไทยได้ปกติ ไม่ต้องแก้ font
- เปิดด้วย: กด Windows key พิมพ์ `wt` หรือรัน `wt` ใน PowerShell เดิม
- **ห้ามใช้ PowerShell เดิม** — แสดงภาษาไทยเป็นสี่เหลี่ยม

**แก้ภาษาไทยใน PowerShell เดิม (ถ้าจำเป็น):**
```
chcp 65001
```

---

## 17. Features ที่เพิ่มใน Session นี้ (v22–v25)

| Feature | วิธีทำงาน | ไฟล์ที่เกี่ยวข้อง |
|---|---|---|
| Responsive sidebar + Hamburger menu | CSS media query ≤768px, sidebar fixed + overlay | superclinic.html |
| Changelog แสดง version จริง | `update_version.py` รันก่อน push, แทรก CHANGELOG | update_version.py, push-now.bat |
| push-now.bat prompt commit message | `set /p COMMIT_MSG=` ก่อน push | push-now.bat |
| LINE Notify UI + Token | toggle + panel กรอก token, ส่งผ่าน Apps Script | superclinic.html, Code.gs |
| Hash navigation (#page) | `location.hash = name` ใน showPage, restore ตอน load | superclinic.html |

**Hash navigation** — refresh แล้วกลับมาหน้าเดิม:
- URL เปลี่ยนเป็น `...superclinic/#settings` เมื่อเปลี่ยนหน้า
- ตอน load อ่าน hash กลับมา restore หน้าอัตโนมัติ
- validPages: `dashboard, appointments, patients, register, treatments, herbs, stock, reports, finance, settings`

---

## 18. สถานะพร้อม Push

✅ **แก้ไขเสร็จแล้ว — รัน `push-now.bat` ได้เลย**

```
C:\Users\acer\Desktop\Claude\superclinic\push-now.bat
```

ไฟล์ที่อัพเดทแล้ว:
- `superclinic.html` — ไฟล์หลัก (เปลี่ยนชื่อจาก thai-clinic.html ตั้งแต่ v65+)
- `CLAUDE.md` — อัพเดท Section 1, 8, 16 ให้สอดคล้องกับ superclinic.html
- `push-now.bat` — อัพเดทให้ copy superclinic.html แทน thai-clinic.html

> ⚠️ **ห้ามใช้ Edit tool กับ superclinic.html** — ใช้ Python str.replace() เท่านั้น (ไฟล์ใหญ่กว่า 100 บรรทัด)

---

## 19. UX/UI กฎทั่วไป (ใช้กับทุกหน้า)

1. **Auto-update หน้าจอ** — หลังกรอกข้อมูลและบันทึกแล้ว ให้ re-render ข้อมูลบนหน้าจอทันที ไม่ต้อง refresh
2. **Hover highlight** — ข้อมูลที่กดเข้าไปดูรายละเอียดได้ ต้องมี hover effect (cursor pointer + background highlight)

---

## 20. Backlog — รอแก้ไข (v29+)

### 🔴 Bug

| # | หน้า | ปัญหา |
|---|---|---|
| ~~B01~~ | ~~บันทึกหลังการรักษา~~ | ~~เลือกผู้ป่วยสายบ้านทรายทอง → ขึ้นชื่อเซย่า เพกาซัสแทน~~ | ✅ แก้แล้ว v66 |
| ~~B02~~ | ~~ภาพรวม~~ | ~~แก้ไขข้อมูลนัดไม่ได้ — ขึ้น "ไม่พบข้อมูลนัดหมาย"~~ | ✅ แก้แล้ว v66 |
| B03 | การเงิน | รายรับจากผู้ป่วยขึ้นแล้ว แต่รายการล่าสุดไม่แสดง ต้อง refresh |
| B04 | ทั่วไป | changelog sidebar ยังขึ้น 2 version และไม่ update จริง |
| B05 | นัดหมาย | วันที่เลื่อนไป 7 ชั่วโมง (timezone offset) |
| B06 | Face Recognition | face-api.js โหลด model จาก jsDelivr ไม่ได้ (404) — CDN เปลี่ยน path ต้องแก้ URL ใหม่ |
| ~~B07~~ | ~~บันทึกหลังรักษา + ทุกหน้า~~ | ~~เลือกผู้ป่วยจาก dropdown แล้วด้านขวาแสดงข้อมูลผิดคน~~ | ✅ แก้แล้ว v66 |

### 🟡 แก้ไข UI

| # | หน้า | รายการ |
|---|---|---|
| U01 | ลงทะเบียนก่อนรักษา | เอา "ยาที่ใช้ประจำ" และ "แพ้ยา" ออก |
| U02 | ลงทะเบียนก่อนรักษา | เชื่อม field "อาการ-ความต้องการ" ให้เป็น field เดียวกับ "อาการ/การวินิจฉัย" ในบันทึกหลังรักษา เปลี่ยนชื่อทั้งสองเป็น "อาการที่เป็น" |
| U03 | สต็อกยา | ราคาทุน → แสดงราคาที่บันทึกล่าสุด, ถ้าไม่มีให้แสดง "—/หน่วย" แทน "฿0/" |
| U04 | สต็อกยา | สถานะ "ใกล้หมด" ตัวเลขไม่แสดง |
| U05 | สต็อกยา | ปรับราคาต่อหน่วยไม่ได้ |
| U06 | ข้อมูลผู้ป่วยรายบุคคล | เพิ่มประวัติการนัดหมาย — ซ่อนไว้ก่อน กดปุ่ม "โหลดประวัติ" ถึงจะดึงข้อมูลมาแสดง |
| U07 | ข้อมูลผู้ป่วย | ประวัติการรักษา — เพิ่มช่องอาการ + บรรทัดล่างแสดง "ผลการรักษาและคำแนะนำ" จากหน้าบันทึก |
| U08 | การเงิน | รหัสผ่านมีผล 12 ชั่วโมง + เพิ่มปุ่ม Lock ภายในกด lock ทันที |
| U09 | ใบรับรองแพทย์ | แก้คำใน form ได้ (ใช้ layout เดิม) + เพิ่มช่องกรอกผลการตรวจ |
| U10 | ออกใบเสร็จ | เปลี่ยนเป็นปุ่ม Print ตรงๆ ไม่ต้องบันทึก |
| U11 | ตั้งค่าระบบ | เพิ่มปุ่ม "เพิ่มผู้ใช้" และ "ลบผู้ใช้" ให้ใช้งานได้จริง |
| U12 | ภาพรวม | เพิ่มปุ่ม Log กิจกรรมวันนี้ — วางขวามือ เหนือ box ความพึงพอใจ |
| U13 | แผนที่จุดเจ็บปวด | เปลี่ยนเป็นแบบ expandable/collapsible ทุกที่ที่ใช้ |
| U14 | ทุกหน้า | ข้อมูลบนจอ update ทันทีหลังบันทึก ไม่ต้อง refresh |
| U15 | การเงิน | รายรับล่าสุด update ทันทีหลังออกใบเสร็จ ไม่ต้อง refresh |
| U16 | ประวัติการรักษา | บรรทัดล่างแสดง "ผลการรักษาและคำแนะนำ" จากหน้าบันทึกหลังการรักษา |

### 🔵 Convention (AI ต้องทำตามเสมอ)

| # | รายการ |
|---|---|
| F01 | Python script ทุกไฟล์ต้องมี `# -*- coding: utf-8 -*-` + `sys.stdout = io.TextIOWrapper(...)` ต้นไฟล์เสมอ |
| F02 | ทุก code block คำสั่งต้องรวม `cd` และคำสั่งไว้ใน block เดียว copy ได้ทีเดียว |
| F03 | ใน wt ต้องใช้ `.\push-now.bat` (มี `.\` นำหน้า) |
| F04 | **UI Mockup First** — ก่อน patch โค้ด UI ทุกครั้ง ต้องแสดง mockup interactive ใน chat ให้ user approve ก่อนเสมอ ห้าม patch โดยไม่ผ่านขั้นตอนนี้ |
