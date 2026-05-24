# architecture.md
# Superclinic — Architecture Rules

## Folder Rules

Each feature domain is **isolated**:

```
frontend/features/patients/       ← patient CRUD only
frontend/features/appointments/   ← appointment logic only
frontend/features/inventory/      ← herb & stock only
frontend/features/pharmacy/       ← medicine dispensing only
frontend/features/billing/        ← finance & receipts only
frontend/features/bodymap/        ← body map component only
frontend/features/dashboard/      ← dashboard & stats only
```

**Shared utilities** go in `frontend/shared/`:

```
frontend/shared/api/       ← callApi(), API_URL, API_TOKEN
frontend/shared/utils/     ← date helpers, formatters, badges
frontend/shared/search/    ← acKeyNav(), SearchX convention
frontend/shared/types/     ← data schemas (JSDoc)
frontend/shared/barcode/   ← barcode scanner (future)
frontend/shared/ocr/       ← OCR utilities (future)
```

---

## Module Rules

- **No cross-feature imports** — patients/ cannot import from appointments/
- **Shared utilities only** — all features can use frontend/shared/
- **No jQuery, no frameworks** — Vanilla JS only
- **CSS Variables** — all colors via `var(--g1)`, `var(--go)`, etc.
- **No inline styles** where a CSS class exists

---

## Backend Rules

```
backend/apps-script/   ← Code.gs (single file, deployed to GAS)
backend/services/      ← Service documentation (not deployed)
backend/sheets/        ← Sheet schema documentation
backend/auth/          ← Auth flow documentation
backend/inventory/     ← Inventory backend notes
```

---

## File Size Rules

- **Files > 100 lines** → use Python `str.replace()` for edits, NOT Edit tool
- **New features** → create new files in correct feature folder
- **thai-clinic.html** → monolith kept for now; edits via Python only

---

## Naming Rules

| Type | Convention |
|------|-----------|
| Functions | `camelCase` |
| Variables | `camelCase` |
| Constants | `UPPER_SNAKE_CASE` |
| CSS classes | `kebab-case` |
| File names | `kebab-case.js` / `kebab-case.md` |
| IDs | `kebab-case` |

---

## ID Rules (v61+)

| Table | ID Format |
|-------|----------|
| patients | `HN-XXXXXX` (6-digit, zero-padded) |
| herbs | `HRB-XXX` (3-digit, zero-padded) |
| appointments | sequential integer: 1, 2, 3... |
| treatments | sequential integer: 1, 2, 3... |
| stock_transactions | sequential integer: 1, 2, 3... |
| finance | sequential integer: 1, 2, 3... |
| users | sequential integer: 1, 2, 3... |

---

## Date Rules

| Context | Format |
|---------|--------|
| Storage (Sheets) | `YYYY-MM-DD` |
| Display (Thai) | `DD/MM/YYYY (พ.ศ. 4 หลัก)` |
| ห้ามใช้ | ชื่อเดือนภาษาไทย |
| ห้ามใช้ | 2-digit year |
| ห้ามใช้ | `<input type="date">` |

---

## UI Rules

- Language: **ภาษาไทย** for all user-facing text
- Font: `Cormorant Garamond` (headings) + `Sarabun` (body)
- Icons: Tabler Icons CDN only
- SearchX autocomplete: must use `acKeyNav()` shared utility
- Date inputs: must use `dpInit()` custom date picker
- Submit buttons: must use `showLoading(btn)` during API calls
- Error handling: always `try/catch` + `showToast()`

---

## Performance Rules

- Debounce search inputs: 300ms
- Lazy load images where possible
- Batch all Google Sheets operations
- Minimize DOM re-renders (build strings, set innerHTML once)
- Cache frequently loaded data (herbs list, patients list)
