# patients-schema.md
# Sheet: patients

## Columns

| Column | Type | Format | Description |
|--------|------|--------|-------------|
| hn | string | HN-XXXXXX | Primary key (auto-generated) |
| prefix | string | enum | นาย / นาง / นางสาว / เด็กชาย / เด็กหญิง |
| first_name | string | - | ชื่อ |
| last_name | string | - | นามสกุล |
| dob | string | YYYY-MM-DD | วันเกิด |
| gender | string | male/female | เพศ |
| phone | string | - | เบอร์โทร |
| element | string | enum | ดิน / น้ำ / ลม / ไฟ |
| allergy | string | comma-sep | ประวัติแพ้ยา |
| chronic_disease | string | - | โรคประจำตัว |
| patient_type | string | enum | new / regular / vip |
| body_map | string | JSON | ข้อมูล body map |
| is_active | string | TRUE/FALSE | soft delete flag |

## HN Generation

```javascript
// Format: HN-XXXXXX (6 digits, zero-padded)
function generateHN_(existingHNs) {
  const nums = existingHNs
    .filter(hn => /^HN-\d+$/.test(hn))
    .map(hn => parseInt(hn.replace('HN-', '')));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return 'HN-' + String(next).padStart(6, '0');
}
```

## Notes

- Soft delete: set `is_active = FALSE`
- `body_map` stored as JSON string: `JSON.stringify({ dots: [...] })`
- `patient_type` calculated from visit count, not stored manually
