# docs/appointment-schedule-spec.md — ตารางนัดหมาย timeline + ปิดรับจอง + ตารางว่าง (สเปกเต็ม)

> สั่งโดย user 2026-06-18 · ทำเป็นเฟส deploy ทีละชิ้น (lockstep 2 แอป) · UI timeline ผ่าน mockup แล้ว 3 รอบ

## Decisions (user เคาะแล้ว)
- **ปิดรับจอง:** เพิ่มช่อง "วันที่" (เจาะจงวัน) — แต่ละแถว: วันที่ + จาก + ถึง + หมายเหตุ
- **สีแท่งตามประเภทการรักษา:** ตั้งสีเองต่อประเภท ในหน้า "จัดการประเภทการรักษา" (Push C manager) — extend จาก [name] → [name,color]
- **ลิงก์ตารางว่าง:** deploy `appointment.html` แยกลง pages.dev (public ไม่ต้อง login) + ฝัง snapshot เวลาว่าง+ชื่อ/เบอร์/โลโก้คลินิกใน URL hash · QR = QR ของ URL · plain text = ลิสต์เวลาว่างรายวัน
- **duration:** combo พิมพ์เองได้ (datalist) + preset 30/45/60/90/120 · default 60 · time_end = time_start + duration · นัดเก่าไม่มี end → +60

## เฟส
### เฟส 1A — duration → time_end  ✅ (กำลังทำ)
- ฟอร์มนัด (openAddAppt) + viewAppt: เพิ่ม `ระยะเวลา (นาที)` (datalist preset, default 60)
- submitAddAppt/submitEditAppt: time_end = apptAddMin(time_start, duration) · helper `apptAddMin`/`apptDurOf`
- schema appointments มี time_end อยู่แล้ว (ไม่แตะ backend) · TIME_COLS รวม time_end แล้ว

### เฟส 1B — สีตามประเภท + dashboard timeline  ✅ (เสร็จ v229/v106)
- tt manager: เพิ่ม color picker/แถว · storage `settings.treatment_types` → `[{n,c}]` (backward compat string เดิม) · `ttColor(name)` helper
- กรอบ dashboard "นัดหมายวันนี้ & พรุ่งนี้" (`#dash-appt-list`): เพิ่ม tab `วันนี้ & พรุ่งนี้` (เดิม) | `ตารางสัปดาห์`
- timeline: แกนนอน 08:00–18:00 (เว้นพักเที่ยง 12-13) · แถว = วันนี้+อีก6วัน (rolling) · แท่ง = time_start→time_end · สี=ttColor(type) · 4 บรรทัด (ชื่อคลิกได้→viewAppt / 📞เบอร์ / 🩺ประเภท / ไอคอนช่องทาง) ไอคอนแทน label · ≤60น.ชิดซ้าย >60น.center

### เฟส 2 — ปิดรับจอง (DB ใหม่)  ✅ (เสร็จ v230/v107 · GAS@19/@30 · live CRUD verified)
- sheet ใหม่ `closed_slots`: id, date, time_start, time_end, note, created_at (+ self-heal superclinic GAS + LS proxy)
- ปุ่มแดง ~300px บนตาราง "กำหนดเวลาไม่รับจอง" → ฟอร์มหลายแถว (วันที่/จาก/ถึง/หมายเหตุ) เพิ่มได้เรื่อยๆ
- แสดงในตารางเป็นแท่งดำ "ปิดรับจอง" (มีหมายเหตุ→โชว์หมายเหตุ)

### เฟส 3 — แท็บ "ตารางว่างนัด"
- แท็บขวาของ "ตารางสัปดาห์" · โชว์ช่องว่าง = เขียว "ว่าง" (เวลาเปิด − นัด − closed_slots)

### เฟส 4 — ส่งตารางว่างให้คนไข้
- ปุ่มส้ม (ตำแหน่ง/ขนาดเดียวกับปุ่มแดง) "ส่งตารางว่างให้คนไข้"
- copy 3 แบบ: plain text (ลิสต์เวลาว่างรายวัน) / URL (appointment.html#snapshot) / QR
- appointment.html (pages.dev): โลโก้ + ชื่อ/เบอร์คลินิก + ตารางว่าง · decode snapshot จาก hash

## หมายเหตุสถาปัตยกรรม
- appointments เชื่อม patients ผ่าน patient_id อยู่แล้ว · เบอร์/ช่องทาง ดึงจาก patient (allPatients) ตอน render
- timeline + ปิดรับจอง + ว่าง = อ่าน allAppts + closed_slots + open_time/close_time (settings)
