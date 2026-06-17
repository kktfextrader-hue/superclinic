# docs/contact-channel.md — ช่องทางที่ติดต่อ (Push B, v226/v103 · 2026-06-17)

## ภาพรวม
field "ช่องทางที่ติดต่อ" (channel) = ผู้ป่วยรู้จักคลินิกจากไหน · pulldown + keyboard nav + autocomplete + พิมพ์เองได้ (free text)

## เก็บที่
- column `channel` ใน sheet **patients** (เป็น attribute ของผู้ป่วย ไม่ใช่ของแต่ละครั้งรักษา)
- **self-heal:** ถ้า sheet ยังไม่มี column `channel` → `ensureColumn_`/`proxyEnsureColumn_` สร้างให้อัตโนมัติตอน save ครั้งแรกที่มีค่า channel (ทุก tenant ไม่ต้องแก้ sheet มือ)
- เพิ่มใน schema: superclinic `CONFIG.SCHEMA.patients` + LS `PROXY_CONFIG.HEADERS.patients` (สำหรับ sheet ที่สร้างใหม่)

## UI (lockstep 2 แอป)
- **เพิ่มผู้ป่วย** (openAddPatient): SearchX `addpat-channel-inp` ใต้เบอร์โทร/อีเมล
- **แก้ผู้ป่วย** (openEditPatient): SearchX `editpat-channel-inp` ถัดจากอีเมล
- **ดูผู้ป่วย** (viewPatient): แสดงใน s1 (ข้อมูลพื้นฐาน) + s4 (ประวัติการรักษา — chip บนสุด)
- preset (`CH_DEFAULT`): หน้าร้าน/Facebook/LINE/Instagram/TikTok/Google Maps/เพื่อนแนะนำ/รถผ่าน/รพ.ส่งต่อ · พิมพ์ค่าอื่นได้อิสระ

## ฟังก์ชัน
- `chAC(val, ddId)` — กรอง CH_DEFAULT → render dropdown (item มี onmousedown + cursor:pointer เข้ากับ acKeyNav)
- `chPick(el, ddId)` — เลือก item → set value ลง input (`ddId.replace('-dd','-inp')`)
- keyboard nav: ใช้ `acKeyNav` เดิม (↑↓ Enter Esc)
- submit: `FormData` ส่ง `name="channel"` อัตโนมัติ (ไม่ต้องแตะ submitAddPatient/submitEditPatient)

## Backend self-heal (header-driven CRUD)
- CRUD เป็น header-driven: field ที่ไม่มี column = ถูกทิ้งเงียบ (ไม่ error) → graceful degradation
- `ensureColumn_(sheet, colName)` — guarded (try/catch) append header column ถ้ายังไม่มี · เรียกใน createRow_/updateRow_ + proxyCreateRow_/proxyUpdateRow_ เฉพาะ `sheetName==='patients' && body.channel` (ไม่มี overhead กับ save อื่น)
- getHeaders_/proxyGetHeaders_ อ่านสด (ไม่ cache) → append แล้ว re-read เห็นทันที

## ไม่แตะ
- treatments sheet (channel เป็นของ patient · ประวัติรักษาแสดงค่าจาก patient record)
- submit functions (FormData ครอบคลุม)

## เพิ่มเติม (Push B2, v227/v104 · 2026-06-17)
- **ฟอร์มลงทะเบียนก่อนรักษา (form-register):** เพิ่ม channel SearchX (`reg-channel-inp`) ตรงช่องว่างข้างส่วนสูง · reuse chAC/chPick/acKeyNav
  - **prefill:** ตอนเลือกผู้ป่วย → เติม p.channel
  - **save:** submitRegister → ถ้ากรอก channel → fire-and-forget callApi('patients','update',{id,channel}) + update local cache (allPatients)
  - reset `reg-channel-inp` หลัง submit
- **ประวัติการรักษา (thItemHtml):** เพิ่มบรรทัด "ช่องทางที่ติดต่อ" **ล่างสุด**ของการ์ด (หลังค่าบริการ) · ดึงจาก patient ของ `t.patient_id` (ว่าง→"ไม่มีข้อมูล" graceful)

