# add-api-endpoint.md
# Prompt Template: Add API Endpoint

## Instructions for AI

Before adding an endpoint, read:
- `ai/agents/backend-agent.md` — API patterns and response format
- `docs/api.md` — existing endpoints
- `backend/apps-script/Code.gs` — current implementation

---

## Task

Add a new API endpoint to Code.gs.

## Requirements

- Follow existing `doGet_` / `doPost_` handler pattern
- Validate token with `validateToken_(token)`
- Use `getSheetData_(sheetId)` for reads
- Use batch `getValues()` / `setValues()` — no single-cell loops
- Return standardized `{ ok: true, data: { rows: [...] } }`
- Wrap in `try/catch` → return `sendError_(msg, 500)` on failure
- Use sequential integer ID for new records (auto-increment from max existing ID)

## ID Convention

```javascript
// Get next sequential ID
function getNextId_(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return 1;  // only header
  const ids = data.slice(1).map(r => parseInt(r[0]) || 0);
  return Math.max(...ids) + 1;
}
```

## Response Format

```javascript
// Success
return ContentService
  .createTextOutput(JSON.stringify({ ok: true, data: { rows: result } }))
  .setMimeType(ContentService.MimeType.JSON);

// Error
return ContentService
  .createTextOutput(JSON.stringify({ ok: false, error: message }))
  .setMimeType(ContentService.MimeType.JSON);
```

---

## Example Usage

```
Add endpoint: GET ?sheet=reports&action=summary&month=2026-05
Returns: { income_total, expense_total, patient_count, treatment_count }
Follow: backend-agent.md
Only modify: Code.gs — do not touch frontend
```
