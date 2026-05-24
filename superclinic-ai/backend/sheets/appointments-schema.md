# appointments-schema.md
# Sheet: appointments

## Columns

| Column | Type | Format | Description |
|--------|------|--------|-------------|
| id | number | integer | Primary key (sequential: 1, 2, 3...) |
| patient_id | string | HN-XXXXXX | Foreign key → patients |
| patient_name | string | - | ชื่อผู้ป่วย (denormalized for display) |
| date | string | YYYY-MM-DD | วันนัด |
| time_start | string | HH:MM | เวลาเริ่ม |
| doctor | string | - | ชื่อแพทย์ |
| treatment_type | string | TRT-XX | รหัสหัตถการ |
| status | string | enum | pending / confirmed / completed / cancelled / missed |
| room | string | - | ห้อง |
| notes | string | - | หมายเหตุ |
| phone | string | - | เบอร์ผู้ป่วย (denormalized) |
| is_active | string | TRUE/FALSE | soft delete flag |

## Status Flow

```
pending → confirmed → completed
pending → cancelled
pending → missed (auto-mark if date passed)
confirmed → completed
confirmed → cancelled
confirmed → missed (auto-mark)
```

## ID Convention (v61+)

Sequential integer starting from 1:
```javascript
// New ID = MAX(existing ids) + 1
```

## Notes

- `patient_name` and `phone` are denormalized copies from patients sheet
- `auto-mark missed`: appointments past their date with status pending/confirmed → missed
