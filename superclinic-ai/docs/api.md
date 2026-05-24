# docs/api.md — API Reference
> อ่านเมื่อ: เพิ่ม endpoint, debug API, เชื่อม frontend-backend, แก้ CORS

---

## Base URL

```
BASE_URL = https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
(DEPLOYMENT_ID อยู่ใน CLAUDE.local.md)
```

---

## Authentication

```
Authorization: Bearer MARVEL-SECRET-TOKEN-2025
หรือ query string: ?token=MARVEL-SECRET-TOKEN-2025
```

---

## Endpoints ทั้งหมด

### GET — อ่านข้อมูล

```
GET {BASE_URL}?sheet={SHEET}&action=list&token={TOKEN}
GET {BASE_URL}?sheet={SHEET}&action=get&id={ID}&token={TOKEN}
```

**SHEET values:** `patients` | `appointments` | `treatments` | `herbs` | `stock_transactions` | `finance` | `settings` | `users`

### POST — เขียนข้อมูล

```
POST {BASE_URL}?sheet={SHEET}&action={ACTION}&token={TOKEN}
Content-Type: text/plain
Body: JSON string
```

**ACTION values:** `create` | `update` | `delete`

---

## ตัวอย่าง fetch

### GET list

```js
const res = await fetch(
  `${BASE_URL}?sheet=patients&action=list&token=${TOKEN}`,
  { redirect: 'follow' }
);
const json = await res.json();
// json = { ok: true, data: { rows: [...] } }
const patients = json.data.rows;
```

### GET by ID

```js
const res = await fetch(
  `${BASE_URL}?sheet=patients&action=get&id=HN-000001&token=${TOKEN}`,
  { redirect: 'follow' }
);
const json = await res.json();
// json = { ok: true, data: { row: {...} } }
```

### POST create

```js
const res = await fetch(
  `${BASE_URL}?sheet=patients&action=create&token=${TOKEN}`,
  {
    method: 'POST',
    redirect: 'follow',
    body: JSON.stringify({
      first_name: 'Tony',
      last_name: 'Stark',
      element: 'ไฟ'
    })
  }
);
const json = await res.json();
// json = { ok: true, data: { id: 'PAT-0021', hn: 'HN-000021' } }
```

### POST update

```js
const res = await fetch(
  `${BASE_URL}?sheet=patients&action=update&token=${TOKEN}`,
  {
    method: 'POST',
    redirect: 'follow',
    body: JSON.stringify({ id: 'HN-000001', phone: '099-999-9999' })
  }
);
```

### POST delete (soft delete)

```js
const res = await fetch(
  `${BASE_URL}?sheet=patients&action=delete&token=${TOKEN}`,
  {
    method: 'POST',
    redirect: 'follow',
    body: JSON.stringify({ id: 'HN-000001' })
  }
);
// sets is_active = FALSE ใน sheet — ไม่ลบจริง
```

---

## Response Format

```js
// Success
{ ok: true, data: { rows: [...] } }   // list
{ ok: true, data: { row: {...} } }    // get
{ ok: true, data: { id: '...' } }     // create
{ ok: true }                          // update / delete

// Error
{ ok: false, error: 'error message' }
```

---

## Primary Keys ต่อ Sheet

| Sheet | Primary Key | หมายเหตุ |
|---|---|---|
| patients | `hn` | format HN-XXXXXX |
| appointments | `id` | format APT-XXXX |
| treatments | `id` | format TRT-XXXX |
| herbs | `id` | format HRB-XXX |
| stock_transactions | `id` | auto |
| finance | `id` | auto |
| settings | `key` | string key |
| users | `id` | auto |

---

## callApi() — Frontend Helper (thai-clinic.html)

```js
// signature
async function callApi(sheet, action, data=null, getId=null)

// ตัวอย่าง
const res = await callApi('patients', 'list');
const res = await callApi('patients', 'get', null, 'HN-000001');
const res = await callApi('patients', 'create', { first_name: 'Tony', ... });
const res = await callApi('patients', 'update', { hn: 'HN-000001', phone: '...' });
```

---

## Errors ที่พบบ่อย

| Error | สาเหตุ | วิธีแก้ |
|---|---|---|
| `Record not found` | id ไม่ตรงกับ primary key จริง | ตรวจ primary key ใน CLAUDE.local.md |
| `res.ok = undefined` | ใช้ `res.success` แทน `res.ok` | เปลี่ยนเป็น `if(res.ok)` |
| `.filter is not a function` | `res.data` ไม่ใช่ array | ใช้ `res.data?.rows || []` |
| CORS error | fetch ไม่ได้ใส่ `redirect:'follow'` | เพิ่ม `redirect: 'follow'` |
| `treatment_notes not found` | Sheet ยังไม่ได้สร้าง | redeploy Code.gs หลังเพิ่ม sheet |

---

## Code.gs Utility Functions

```js
generateId(sheet, prefix)    // สร้าง ID ใหม่ เช่น PAT-0021
toThaiDate(dateStr)          // "2025-05-14" → "14/05/68 (พ.ศ.)"
softDelete(sheet, id)        // ตั้ง is_active = FALSE
updateRow_(sheet, id, data)  // อัปเดตเฉพาะ column ที่ส่งมา
```
