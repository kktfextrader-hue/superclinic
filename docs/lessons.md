# docs/lessons.md — บทเรียนจากปัญหา (ตามนโยบาย §0.0 ข้อ 6)

> โครงทุกข้อ: **อาการ → สาเหตุ → วิธีแก้ → วิธีกันซ้ำ**
> เพิ่ม entry ใหม่ทุกครั้งที่แก้บั๊ก/ปัญหาเสร็จ เพื่อ project ใหม่ไม่พลาดจุดเดิม

---

## L1 — ตัวแปร CSS ที่ไม่ถูกนิยาม → สีพึ่ง fallback (เปราะ)
- **อาการ:** ตั้ง `color:var(--dk)` ให้ตัวเลขเงินในจอ QR แล้วได้สีดำ "บังเอิญ" (rgb 43,43,43) ไม่ใช่ค่าที่ตั้งใจ
- **สาเหตุ:** `--dk` ระบุใน CLAUDE.md/design system แต่ **ไม่ถูกนิยามจริงในไฟล์** → var() ตกไปใช้ inherited color
- **วิธีแก้:** ใช้ hex ตรง (`#1a1a2e`) แทน var ที่ไม่มี
- **วิธีกันซ้ำ:** ก่อนใช้ `var(--x)` เช็คว่ามีนิยามจริง (`getComputedStyle(documentElement).getPropertyValue('--x')`) อย่าเชื่อ design-system doc อย่างเดียว

## L2 — `type="email"` บล็อกบันทึกแม้ไม่ required
- **อาการ:** ช่องอีเมลฟอร์มผู้ป่วย พิมพ์ "@" ค้าง → กดบันทึกไม่ได้ เด้ง validation ทั้งที่ไม่ required
- **สาเหตุ:** HTML5 `type="email"` บังคับ format ทันทีที่มีค่า (ไม่เกี่ยวกับ required)
- **วิธีแก้:** เปลี่ยนเป็น `type="text"` เฉพาะช่องที่ไม่อยากบังคับ format
- **วิธีกันซ้ำ:** input ที่ "ไม่บังคับ" อย่าใช้ type ที่มี built-in validation (email/url/number) ถ้าผู้ใช้อาจกรอกค้าง/ไม่ครบ

## L3 — ปุ่มมี HTML แต่ไม่มี handler + breakpoint แคบ
- **อาการ:** บน tablet กดปุ่ม ☰ ขยาย sidebar ไม่ได้
- **สาเหตุ:** (1) ปุ่ม hamburger ไม่มี JS click handler เลย (2) media query `max-width:768px` แคบเกิน tablet 769–1024px ตกโหมด desktop ที่ปุ่มถูกซ่อน
- **วิธีแก้:** เพิ่ม handler (toggle .open + backdrop + Esc + resize) + ขยาย breakpoint เป็น 1024px
- **วิธีกันซ้ำ:** ปุ่ม UI ที่เพิ่ม ต้องเทสต์ว่า "กดแล้วเกิดอะไร" จริง (มี handler) · responsive ต้องทดสอบช่วง tablet ไม่ใช่แค่ desktop/mobile

## L4 — เชื่อ handoff doc โดยไม่ตรวจสถานะไฟล์จริง (อันตราย)
- **อาการ:** เอกสารส่งงานบอก "ฐาน v115 → v116" และ "VV_DICT มีอยู่แล้ว" และให้ทับ `vvNorm`
- **สาเหตุ:** เอกสาร (จาก AI อีกตัว) เขียนจากข้อมูลเก่า/บางส่วน — จริงๆ ไฟล์ = v174, ไม่มี VV_DICT, และ `vvNorm` มีอยู่แล้วทำหน้าที่อื่น (ค้นหาด้วยเสียง) ถ้าทำตามตัวอักษร = ทับงาน 59 เวอร์ชันหาย + ระบบค้นหาพัง
- **วิธีแก้:** verify สถานะจริง (เวอร์ชัน/ฟังก์ชัน/ช่อง) ก่อนเริ่ม → ต่อยอดบนของจริง + เปลี่ยนชื่อชนเป็น `vvDictNorm`
- **วิธีกันซ้ำ:** handoff/spec จากภายนอกเป็น "ข้อเสนอ" ไม่ใช่ความจริง — ตรวจ version + grep ชื่อฟังก์ชัน/ตัวแปรที่จะสร้าง (กันชน) ก่อนลงมือเสมอ

## L5 — Web Speech continuous ตัดเองตอนเงียบ
- **อาการ:** โหมดพูดต่อเนื่องเงียบไม่กี่วินาที Chrome หยุดฟังเอง ผู้ใช้นึกว่ายังฟัง
- **สาเหตุ:** SpeechRecognition `continuous=true` ยังถูก engine ตัดเมื่อเงียบ → onend ถูกเรียก
- **วิธีแก้:** flag `_vvUserStop` + restart ใน onend ถ้าไม่ใช่ผู้ใช้สั่งหยุด · ไม่ restart เมื่อ fatal error (not-allowed/audio-capture) กัน loop
- **วิธีกันซ้ำ:** ใช้ continuous ASR ต้องจัดการ auto-restart + แยก fatal vs non-fatal error เสมอ


## L6 — 2 แอป lockstep ต้องพฤติกรรมต่างกัน → detect runtime config อย่า hardcode
- **อาการ:** ฟีเจอร์เก็บข้อมูลเทรน (upload) ต้องทำเฉพาะ superclinic แต่ตอนแรก gate ด้วย `typeof API_URL` → scproject ก็มี API_URL เลยจะ upload ผิด
- **สาเหตุ:** 2 แอป (lockstep โค้ดชุดเดียว) มี config คล้ายกัน — ต่างกันที่ scproject มี `LS_URL`/`USE_LS_PROXY` (ผ่าน License Server)
- **วิธีแก้:** gate ด้วย `typeof API_URL!==undefined && typeof LS_URL===undefined` (มี LS_URL = scproject = ไม่ upload) — โค้ดชุดเดียว env-detected
- **วิธีกันซ้ำ:** เวลาต้องการให้ 2 แอป lockstep พฤติกรรมต่างกัน ให้ตรวจ runtime config ที่มีอยู่จริง (LS_URL ฯลฯ) แทนการ hardcode flag แยกไฟล์ → คงโค้ดชุดเดียว patch พร้อมกันได้

## L7 — auto-แนะนำคู่พจนานุกรมจาก diff สั้น = อันตราย
- **อาการ:** หน้าวิเคราะห์เดิมแนะนำ dict pair จากส่วนต่างของคำ (diff) — คู่ "ยาประสะไพล/ไพร" ต่างแค่ 1 ตัว ถูกตัดทิ้ง และถ้าปล่อยผ่านจะได้ ['ร','ล'] ซึ่งแทนที่ ร ทั้งระบบ
- **สาเหตุ:** dict ทำงานแบบ substring replace — pattern สั้นยิงโดนคำดีทั่วทั้งข้อความ
- **วิธีแก้:** แนะนำ "ทั้งวลี" เสมอ (exact phrase, ปลอดภัย 100%) + แสดงจุดต่างใน comment ให้เจ้าของตัดสินใจย่อเอง
- **วิธีกันซ้ำ:** กฎ dict ทุกชั้น: pattern ต้องยาวพอ (≥3 ตัวอักษรและเป็นคำ/วลีเต็ม) ห้าม auto-generate pattern สั้นจาก diff

## L8 — sync แบบ local-first eventual: debounce + last-write-wins ปลอดภัยกว่า real-time merge
- **อาการ:** ต้อง sync user dict ข้ามเครื่องในคลินิกเดียวกัน หลายคนเทรนพร้อมกัน อาจชนกัน
- **สาเหตุ:** real-time sync ต้องการ infrastructure (Firebase/WebSocket) + การ resolve conflict ซับซ้อน
- **วิธีแก้:** **local-first + eventual consistency** — local อ่านทันที (zero latency) · push debounced 5s (กัน spam ไม่ ddos GAS) · pull on init+เปิดเทรน · merge by key+ts (last-write-wins) — ใช้ของฟรีที่มีอยู่แล้ว (settings sheet + LockService.waitLock)
- **วิธีกันซ้ำ:** sync ฟีเจอร์ที่ไม่ urgent (dict, settings, preferences) → ใช้ pattern นี้เสมอ · เก็บ ts กับทุก entry ตั้งแต่แรก (ไม่ใช่เพิ่มทีหลัง — ทำให้ backward compat ยุ่ง) · เก็บ uid ผู้สร้างไว้ debug ได้ ไม่บังคับ

## L9 — Default fallback ที่ผ่อนปรนทำให้ cap ไม่ enforce จริง
- **อาการ:** `PLAN_TIER` default = `pro` (ไม่ cap) + `LICENSE.patient_limit || 20` (fallback ต่ำเกินจริง) → freemium cap ที่ตกลงไว้ 50 คน ใช้ไม่ได้ทั้งคู่ ในขณะที่ planCheckPatient เช็คเฉพาะ tier===free ที่ไม่เคยถูก set
- **สาเหตุ:** เผื่อ debug/dev mode ตั้ง default 'pro' กับ fallback ผ่อนปรน — แต่ลืมจัดการ production = default ฟรี + fallback ตามสเปกจริง
- **วิธีแก้:** (1) default tier = ดึงจาก LICENSE.plan โดยตรง · fallback = 'free' (เข้มสุด ไม่ใช่ผ่อนปรนสุด) (2) cap ส่งจาก single source of truth (server side) ไม่ hardcode client-side
- **วิธีกันซ้ำ:** quotas/limits/cap ทุกตัว → default ให้เข้มสุดเสมอ ปลอดภัยกว่า · ใช้ server-driven config (single source of truth) ไม่ hardcode 2 ที่ · เมื่อมี policy change บนเอกสาร → grep ทุก hardcoded reference ก่อน ship (เคสนี้ 50 อยู่ frontend แต่ fallback 20 ทำให้ไหลผ่าน)

## L10 — Static-looking HTML ที่จริงเป็น template string (modal)
- **อาการ:** `getElementById('appt-type')` คืน null ตอน boot ทั้งที่อ่านโค้ดเห็นเป็น `<select>` ปกติ → ttPopulateStatic เข้าไม่ถึง
- **สาเหตุ:** element อยู่ใน template literal ที่ส่งเข้า `openModal(title, \`...html...\`)` — ถูกสร้างตอนเปิด modal เท่านั้น ไม่อยู่ใน static DOM
- **วิธีแก้:** element ใน template string → ใช้ inline `${fn()}` ใน template (เหมือน vappt-type) · element static จริง → populate ผ่าน DOM helper ได้
- **วิธีกันซ้ำ:** ก่อนใช้ ttPopulateStatic/getElementById verify ด้วย browser `!!document.getElementById(id)` ตอน load จริง — อย่าเดาจากการอ่านโค้ด (อ่านเห็น HTML ไม่ได้แปลว่าอยู่ใน static DOM) · เช็ค anchor ขึ้นไป: ถ้าเจอ `\`,` / `openModal(` / `.innerHTML=` ใกล้ๆ = template

