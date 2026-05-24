# appointments/
# Feature: นัดหมาย

## Scope

จัดการนัดหมายผู้ป่วย:
- ดูนัดหมายรายวัน / ปฏิทิน
- เพิ่มนัดหมายใหม่
- แก้ไขนัดหมาย (viewAppt modal)
- เปลี่ยนสถานะนัดหมาย
- ตรวจสอบนัดซ้ำ (⚠️ badge)
- Auto-mark missed

## Key Functions

```javascript
loadAppointments()      // โหลดนัดหมาย
openAddAppt()           // เปิด modal เพิ่มนัด
submitAddAppt()         // บันทึกนัดใหม่
viewAppt(id)            // เปิด modal ดู/แก้ไขนัด
submitEditAppt(id)      // บันทึกการแก้ไขนัด
cancelAppt(id)          // ยกเลิกนัด
setApptStatus(id, st)   // เปลี่ยนสถานะ
renderCalendar()        // Render ปฏิทิน
renderApptDay(date)     // Render นัดของวัน
toggleStatusDropdown(id) // เปิด/ปิด status dropdown
autoMarkMissed()        // Auto-mark missed appointments
```

## Page ID

```
id="page-appointments"
```

## Status Values

| Status | ความหมาย |
|--------|---------|
| pending | รอยืนยัน |
| confirmed | ยืนยันแล้ว |
| completed | รักษาแล้ว |
| cancelled | ยกเลิก |
| missed | ไม่มา |

## Protected Functions

⚠️ **ห้ามแตะ** functions เหล่านี้:
- `apptPatSearch()` — logic พิเศษสร้างผู้ป่วยใหม่
- `apptPatSelect()` — linked กับ apptPatSearch

## Agent Reference

ดู `ai/agents/backend-agent.md`
