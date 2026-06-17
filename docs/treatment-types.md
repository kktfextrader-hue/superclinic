# docs/treatment-types.md — ประเภทการรักษา editable (Push C, v225/v102 · 2026-06-17)

## ภาพรวม
ประเภทการรักษา (treatment_type) แก้ได้เอง — เพิ่ม/แก้/ลบ ผ่านหน้าตั้งค่า → ปุ่ม "จัดการ" · เก็บใน `settings.treatment_types` (JSON array) เป็น single source of truth · ทุก dropdown โหลดจากรายการเดียวกัน

## ที่เก็บ
- `settings` sheet, key `treatment_types` · value = JSON `["นวดแผนไทย","ประคบสมุนไพร",...]`
- default seed (ถ้าไม่มี key) = `TT_DEFAULT` 8 รายการ (ตาม CLAUDE.md §4)

## ฟังก์ชัน (lockstep 2 แอป — โค้ดชุดเดียว)
- `ttList()` — คืน array ปัจจุบัน (window._ttList หรือ default)
- `ttOpts(selected, opt)` — สร้าง `<option>` HTML · opt: `{other}` เพิ่ม "อื่นๆ (กรอกเอง)" · `{plainOther}` เพิ่ม "อื่นๆ" · `{blank}` เพิ่ม option ว่างนำหน้า
  - **soft-delete:** ถ้า `selected` ไม่อยู่ใน list (ถูกลบไปแล้ว) → append เข้าไปให้ ดู/แก้ history เก่าได้
- `ttPopulateStatic()` — เติม option ให้ static selects (reg-plan-type, form-treatment type, next_treatment_type)
- `ttLoad()` — pull จาก settings → set _ttList → populate · เรียกตอน boot (delay 2.6s) + ตอนเปิด modal จัดการ
- `ttSaveList(arr)` — เขียนกลับ settings (update/create) + re-populate
- `ttManageOpen()/ttRenderManage()/ttAddNew()/ttEditAt()/ttDeleteAt()` — modal จัดการ

## Dropdown ที่ใช้ (5 จุด)
| select | วิธีเติม | option พิเศษ |
|---|---|---|
| `reg-plan-type` (ลงทะเบียน) | static → ttPopulateStatic | อื่นๆ (กรอกเอง) + custom input |
| `form-treatment [name=type]` (บันทึกรักษา) | static → ttPopulateStatic | — |
| `next_treatment_type` (นัดครั้งต่อไป) | static → ttPopulateStatic | blank "— เหมือนเดิม —" |
| `appt-type` (นัดหมายใหม่) | **inline `${ttOpts}`** (อยู่ใน template openAddAppt) | อื่นๆ |
| `vappt-type` (แก้นัดหมาย viewAppt) | **inline `${ttOpts}`** (template) | อื่นๆ |

> เหตุที่ appt-type/vappt-type ใช้ inline: element สร้างตอนเปิด modal (template string) ttPopulateStatic เข้าไม่ถึง

## Soft-delete (ตามที่ user เลือก)
ลบประเภท → หายจาก dropdown ของ entry ใหม่ · แต่ประวัติการรักษา/นัดหมายเก่าที่ใช้ประเภทนั้นยังโชว์ปกติ (history เป็น text) · ถ้าเปิดแก้นัดเก่าที่ใช้ประเภทที่ถูกลบ → ttOpts append คืนให้เลือกได้

## ไม่แตะ
- GAS/backend (settings sheet มี CRUD อยู่แล้ว)
- dashboard filter (3187) = decorative ไม่ wired ไม่กระทบ
