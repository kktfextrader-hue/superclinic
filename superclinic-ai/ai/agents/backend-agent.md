# backend-agent.md
# Superclinic — Backend Agent

## Purpose

This agent handles all backend-related tasks for Superclinic:

- Google Apps Script (Code.gs) development and optimization
- Google Sheets API integration
- REST endpoint design and maintenance
- Authentication and token management
- Batch read/write operations
- Inventory API
- Patient API
- Standardized error handling

---

## Scope

```
backend/
├── apps-script/   ← Code.gs and GAS utilities
├── services/      ← Business logic services
├── sheets/        ← Sheet-specific operations
├── auth/          ← Token and auth handling
└── inventory/     ← Inventory-specific backend logic
```

---

## Rules

- **Isolate sheet operations** — each sheet has its own service function
- **Batch reads/writes** — never loop individual cell reads
- **Standardized JSON responses** — always return `{ ok: true, data: { rows: [...] } }`
- **Centralized error handling** — all errors go through `sendError_(msg, code)`
- **Soft delete only** — set `is_active = FALSE`, never delete rows
- **Token validation** — every request must pass `validateToken_(token)`

---

## API Patterns

```javascript
// GET list
GET ?sheet=patients&action=list&token=TOKEN

// GET single
GET ?sheet=patients&action=get&id=HN-000001&token=TOKEN

// POST create
POST ?sheet=patients&action=create   body: { ...fields }

// POST update
POST ?sheet=patients&action=update   body: { id, ...fields }

// POST delete (soft)
POST ?sheet=patients&action=delete   body: { id }
```

---

## Response Format

```json
{
  "ok": true,
  "data": {
    "rows": [...]
  }
}
```

Error:
```json
{
  "ok": false,
  "error": "message"
}
```

---

## Sheets Supported

| Sheet | Primary Key | Notes |
|-------|------------|-------|
| patients | hn (HN-XXXXXX) | soft delete |
| appointments | id (auto-increment) | status workflow |
| treatments | id (auto-increment) | links patient + appt |
| herbs | id (HRB-XXX) | inventory |
| stock_transactions | id (auto-increment) | IN/OUT tracking |
| finance | id (auto-increment) | income/expense |
| settings | key | key-value store |
| users | id (auto-increment) | role-based |

---

## ID Convention (v61+)

- New IDs are **sequential integers** starting from 1 (e.g., 1, 2, 3...)
- Exception: `patients.hn` keeps HN-XXXXXX format
- Exception: `herbs.id` keeps HRB-XXX format
- All other tables: auto-increment integer ID

---

## Do NOT

- ❌ Loop cell reads (use `getValues()` for whole range)
- ❌ Hard-code Spreadsheet IDs in logic (use CONFIG object)
- ❌ Return raw errors to client
- ❌ Delete rows (soft delete only)
- ❌ Skip token validation
