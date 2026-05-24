# docs/
# Superclinic — Documentation

## Files

| ไฟล์ | เนื้อหา | อ่านเมื่อ |
|------|---------|---------|
| `api.md` | API endpoints, request/response examples | เพิ่ม endpoint, debug API |
| `herbs.md` | สมุนไพรและยา, stock management | เพิ่ม/แก้ stock, จ่ายยา |
| `elements.md` | ธาตุ 4, วินิจฉัย, แนะนำยาตามธาตุ | วินิจฉัยตามธาตุ |
| `patients.md` | seed data, ทดสอบระบบ, demo patients | ทดสอบ, seed |
| `BODYMAP.md` | Body map component API, integration guide | ใช้ body map component |

## Quick Reference

### API Call
```javascript
await callApi('patients', 'list')
await callApi('patients', 'get', null, 'HN-000001')
await callApi('finance', 'create', { type:'income', amount:800 })
```

### Response Format
```json
{ "ok": true, "data": { "rows": [...] } }
{ "ok": false, "error": "message" }
```
