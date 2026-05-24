# dashboard/
# Feature: ภาพรวม (Dashboard)

## Scope

หน้าหลักแสดงสรุปข้อมูลคลินิก:
- สถิติวันนี้ (นัดหมาย, ผู้ป่วย, รายรับ, stock)
- รายการนัดหมายวันนี้ + พรุ่งนี้
- นัดที่เกิน (overdue)
- Changelog sidebar

## Key Functions

```javascript
loadDashboard()             // โหลดข้อมูล dashboard
renderDashApptRow(appt)     // Render แถวนัดหมาย
autoMarkMissed()            // Mark missed appointments
renderSidebarChangelog()    // Render changelog
```

## Page ID

```
id="page-dashboard"
```

## Stats Cards

- นัดหมายวันนี้
- ผู้ป่วยทั้งหมด
- รายรับเดือนนี้
- มูลค่า stock สมุนไพร

## Status Badges

```
กำลังรักษา  →  badge-treating (blinking gold)
เกิน        →  badge-overdue
```

## Agent Reference

ดู `ai/agents/backend-agent.md`
