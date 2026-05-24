# patients/
# Feature: ข้อมูลผู้ป่วย

## Scope

จัดการข้อมูลผู้ป่วยทั้งหมด:
- แสดงรายชื่อผู้ป่วย (พร้อม filter, pagination)
- เพิ่มผู้ป่วยใหม่
- แก้ไขข้อมูลผู้ป่วย
- ดูประวัติการรักษา
- Soft delete

## Key Functions

```javascript
loadPatients()          // โหลดและแสดงรายชื่อผู้ป่วย
renderPatients()        // Render patient cards
renderPatPag()          // Render pagination
viewPatient(hn)         // เปิด modal ดูรายละเอียดผู้ป่วย
openAddPatient()        // เปิด modal เพิ่มผู้ป่วยใหม่
submitAddPatient()      // บันทึกผู้ป่วยใหม่
openEditPatient(hn)     // เปิด modal แก้ไขข้อมูล
submitEditPatient()     // บันทึกการแก้ไข
deletePatient(hn)       // Soft delete
quickViewPatient(hn)    // Quick view popup
loadPatHistorySection(hn) // โหลดประวัติการรักษา
goRegisterWithPatient(hn) // ไปหน้า register พร้อม pre-fill
```

## Page ID

```
id="page-patients"
```

## Schema Reference

ดู `backend/sheets/patients-schema.md`

## Agent Reference

ดู `ai/agents/patient-agent.md`

## Do NOT

- ❌ ลบข้อมูลจริง (soft delete เท่านั้น)
- ❌ แสดงวันเดือนปีเป็นชื่อเดือนไทย
- ❌ แตะ `apptPatSearch` / `apptPatSelect`
