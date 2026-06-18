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

### เฟส 3 — แท็บ "ตารางว่างนัด"  ✅ (เสร็จ v231/v108)
- แท็บขวาของ "ตารางสัปดาห์" · โชว์ช่องว่าง = เขียว "ว่าง" (เวลาเปิด − นัด − closed_slots)

### เฟส 4 — ส่งตารางว่างให้คนไข้  ✅ (เสร็จ v232/v109 · appointment.html GitHub Pages · e2e verified)
- ปุ่มส้ม (ตำแหน่ง/ขนาดเดียวกับปุ่มแดง) "ส่งตารางว่างให้คนไข้"
- copy 3 แบบ: plain text (ลิสต์เวลาว่างรายวัน) / URL (appointment.html#snapshot) / QR
- appointment.html (pages.dev): โลโก้ + ชื่อ/เบอร์คลินิก + ตารางว่าง · decode snapshot จาก hash

## หมายเหตุสถาปัตยกรรม
- appointments เชื่อม patients ผ่าน patient_id อยู่แล้ว · เบอร์/ช่องทาง ดึงจาก patient (allPatients) ตอน render
- timeline + ปิดรับจอง + ว่าง = อ่าน allAppts + closed_slots + open_time/close_time (settings)

## as-built (เสร็จครบ 4 เฟส 2026-06-18)
- หน้า public = GitHub Pages (ไม่ใช่ pages.dev) — appointment.html อยู่ใน repo เดียวกับแอป (superclinic/scproject) · URL = liveURL + /appointment.html#snapshot · snapshot = encodeURIComponent(JSON{c,p,d:[{l,f}]}) ใน hash (ไม่ต้อง login, ไม่หลุดข้อมูลคนไข้)
- closed_slots sheet self-heal (superclinic openSheet_ + LS HEADERS) · live CRUD verified
- ฟังก์ชันหลัก: apptAddMin/apptDurOf · ttColor/ttColorShade · dashWkDays · renderDashWeek/renderDashFree · freeSlotsForDay · csOpen · sndOpen/sndUrl/sndText
- QR: qrcode lib เดิม (level L รองรับ url ~2900 ตัว · url จริง ~1370)
- ค้างทดสอบ: คลิกปุ่ม/modal จริงผ่าน UI บนเครื่อง (logic + e2e appointment.html verified แล้ว)

## Cloudflare Pages (เพิ่ม 2026-06-18 · ทั้งคู่)
- **superclinic-appt.pages.dev** = หน้าตารางว่างคนไข้ (appointment) · sndUrl ในแอปชี้มาที่นี่แล้ว · source = Desktop\Claude\cf-appt
- **superclinic.pages.dev / scproject.pages.dev** = มิเรอร์แอป (deploy จาก public repo · ไม่มี secret)
- **sync:** push-now.bat auto-deploy CF ทุก push แล้ว (superclinic→mirror+appointment · scproject→mirror) · deploy-cf.bat = full re-sync ทั้ง 3 ด้วยมือ (fallback)
- wrangler login: kktfextrader@gmail.com (OAuth) · account d7e07327...
