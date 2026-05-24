# pharmacy/
# Feature: บันทึกหลังการรักษา (Treatments + Pharmacy)

## Scope

บันทึกการรักษาและจ่ายยา:
- ค้นหาและเลือกผู้ป่วย
- บันทึกอาการ / วินิจฉัย
- เลือกหัตถการ
- จ่ายสมุนไพร / ยา (dynamic rows)
- Body map integration
- นัดครั้งต่อไป

## Key Functions

```javascript
loadTreatmentPatients()       // โหลดรายชื่อผู้ป่วยวันนี้
resetTreatForm()              // Reset ฟอร์มรักษา
initHerbRows()                // Init rows ยาสมุนไพร
addHerbRow()                  // เพิ่มแถวยา
removeHerbRow(idx)            // ลบแถวยา
herbAutocomplete(idx, q)      // Autocomplete ยา per row
selectHerb(idx, id)           // เลือกยา
getHerbsUsed()                // รวบรวมยาที่จ่าย
submitTreatment()             // บันทึกการรักษา
renderTreatTodayAppts()       // แสดงนัดวันนี้
searchTreatPat(q)             // ค้นหาผู้ป่วย
selectTreatPatFromSearch(hn)  // เลือกผู้ป่วยจาก search
selectTreatPat(hn)            // เลือกผู้ป่วย
```

## Page ID

```
id="page-treatments"
```

## SearchX

| input id | dropdown id |
|----------|------------|
| `treat-search` | `treat-pat-dd` |
| herb search (สมุนไพร) | `herb-ac-box` |
| herb search (ยาแผนปัจจุบัน) | `herb-ac-box-medi` |
| `herb-name-{idx}` | `herb-ac-{idx}` |

## Treatment Schema

```
id              sequential integer
patient_id      HN-XXXXXX
appointment_id  integer (optional)
date            YYYY-MM-DD
type            TRT-01 to TRT-07
symptoms        string
diagnosis       string
herbs_used      JSON string
price           number
```

## หัตถการ

| รหัส | ชื่อ | ราคา |
|------|------|------|
| TRT-01 | นวดแผนไทย | 300–600 |
| TRT-02 | ประคบสมุนไพร | 200–400 |
| TRT-03 | อบสมุนไพร | 150–250 |
| TRT-04 | ฝังเข็ม | 400–800 |
| TRT-05 | ครอบแก้ว | 200–350 |
| TRT-07 | ปรึกษาแพทย์ | 200 |

## Agent Reference

ดู `ai/agents/inventory-agent.md`
ดู `ai/agents/bodymap-agent.md`
