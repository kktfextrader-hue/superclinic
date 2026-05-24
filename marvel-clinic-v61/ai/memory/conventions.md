# conventions.md
# Superclinic — Established Conventions

Last updated: 2026-05-24

---

## Validated Conventions (Do NOT change without explicit request)

### SearchX (v54+)
- All autocomplete inputs use `acKeyNav(event, dropdownId, selectFn)`
- Keyboard: ↑↓ to navigate, Enter to select, Esc to close
- Focused item gets class `.ac-focused`
- Blur closes dropdown with 200ms setTimeout

### Custom Date Picker (v59+)
- Never use `<input type="date">`
- Always: hidden input (ISO value) + text display input (readonly)
- Init: `dpInit('disp-id', 'hidden-id', todayISO())`
- Read: `dpGetValue('hidden-id')` → YYYY-MM-DD
- Set: `dpSetValue('hidden-id', 'disp-id', isoDate)`

### Loading Spinner (v58+)
- Every async submit uses `const _done = showLoading(e.submitter)`
- Call `_done()` in both success and catch paths

### Thai Name Safety (v58+)
- NEVER put Thai text in `onclick="fn('${thai}')"` attributes
- ALWAYS use `data-*` attributes + `addEventListener`

### Date Display (v55+)
- Display: `DD/MM/YYYY (พ.ศ. 4 หลัก)` only
- Storage: `YYYY-MM-DD` always
- NO Thai month names ever

### Appointment Status Dropdown (v53+)
- Status shown as clickable badge
- Click → dropdown with options
- Update via `setApptStatus(id, status)`

### Finance Password (v52+)
- Finance page locked with `id="finance-lock"` overlay
- Password checked via `checkFinancePw()`
- Lock removed on correct password

---

## Protected Functions (Do NOT modify without specific request)

| Function | Reason |
|----------|--------|
| `apptPatSearch()` | Logic พิเศษ — สร้างผู้ป่วยใหม่ inline |
| `apptPatSelect()` | Linked tightly to apptPatSearch |
| `acKeyNav()` | Shared utility — affects all SearchX |
| `dpInit()` | Shared utility — affects all date pickers |
| `callApi()` | Core API helper — any change affects all features |
| `showLoading()` | Shared utility — used everywhere |

---

## ID Conventions

### Old IDs (pre-v61) — Random strings
```
appointments.id  →  "appt-1716123456789-abc"   (timestamp + random)
treatments.id    →  "trt-1716123456789-xyz"
finance.id       →  "fin-1716123456789-123"
```

### New IDs (v61+) — Sequential integers
```
appointments.id  →  1, 2, 3, 4...
treatments.id    →  1, 2, 3, 4...
finance.id       →  1, 2, 3, 4...
users.id         →  1, 2, 3, 4...
stock_transactions.id → 1, 2, 3, 4...
```

### Unchanged ID formats
```
patients.hn      →  HN-000001 (zero-padded 6 digits)
herbs.id         →  HRB-001 (zero-padded 3 digits)
```
