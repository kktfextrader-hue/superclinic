# apps-script/
# Backend: Google Apps Script REST API

## File

`Code.gs` — Single-file backend deployed to Google Apps Script

## Deploy Steps

1. เปิด [script.google.com](https://script.google.com) → New Project
2. วาง `Code.gs` ทั้งหมด
3. แก้ค่า Spreadsheet IDs ใน `CONFIG.SHEETS`
4. Deploy → New deployment → Web app
   - Execute as: Me
   - Who has access: Anyone
5. Copy URL → ใส่ใน `thai-clinic.html` เป็น `API_URL`

## Endpoints

```
GET  ?sheet=SHEET&action=list&token=TOKEN
GET  ?sheet=SHEET&action=get&id=ID&token=TOKEN
POST ?sheet=SHEET&action=create   body: JSON
POST ?sheet=SHEET&action=update   body: { id, ...fields }
POST ?sheet=SHEET&action=delete   body: { id }
```

## Sheets

| Sheet | Primary Key |
|-------|------------|
| patients | hn (HN-XXXXXX) |
| appointments | id (sequential int) |
| treatments | id (sequential int) |
| herbs | id (HRB-XXX) |
| stock_transactions | id (sequential int) |
| finance | id (sequential int) |
| settings | key |
| users | id (sequential int) |

## ID Convention (v61+)

ทุก table ยกเว้น `patients.hn` และ `herbs.id` ใช้ sequential integer ID:

```javascript
function getNextId_(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return 1;
  const ids = data.slice(1).map(r => parseInt(r[0]) || 0).filter(id => !isNaN(id));
  return ids.length ? Math.max(...ids) + 1 : 1;
}
```

## Response Format

```json
{ "ok": true,  "data": { "rows": [...] } }
{ "ok": false, "error": "message" }
```

## Agent Reference

ดู `ai/agents/backend-agent.md`
