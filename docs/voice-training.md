# docs/voice-training.md — ระบบสั่งงาน/กรอกด้วยเสียง + เทรนเสียง (as-built)

> โมดูล `vv*` ในไฟล์หลัก (บล็อก `VOICE-VITALS START..END`) · ทำครบ 4 เฟส 2026-06-11
> superclinic v216→v219 (push v175→v178) · scproject v94→v97 (push v56→v59)
> สเปกออกแบบ: `docs/voice-training-spec.md`

## ภาพรวม 3 ส่วน
1. **โหมด A — `vvMic(loc)`** พูดสัญญาณชีพ → parse เติมหลายช่อง (ความดัน/น้ำหนัก/ส่วนสูง/อุณหภูมิ/ชีพจร)
2. **โหมด B — `vvDictate(fieldId,btnId)`** พูดต่อข้อความลงช่องเดียว (textarea/input)
3. **เทรน — `vvTrainOpen()`** อ่านบท 3 รอบ/บรรทัด ระบบเทียบแล้วเรียนรู้คำที่ออกเสียง

## ชั้นพจนานุกรม (แก้คำเพี้ยน ASR)
- **`vvNorm`** (เดิม) = normalize ค้นหาผู้ป่วยด้วยเสียง — **คนละตัว อย่าสับสน**
- **`vvDictNorm`** = ชั้นแก้คำเพี้ยน 2 ชั้น: `VV_DICT` (กลาง, แก้มือ) + `vv_dict_user` (localStorage, เรียนรู้เอง) + `VV_CTX` (ตามบริบท เช่น ไข่→ไข้)
- จุดเชื่อม: `vvParse` + `vvDictate` ครอบ `vvDictNorm` ทุกครั้ง

## VV_FIELDS (parser โหมด A — table-driven)
ตาราง `VV_FIELDS` (id/keys/range/dec/pair) → parser กลาง:
- bp = คู่ `xx/yy` เสมอ · range validation (นอกช่วงไม่เติม) · จับ keyword↔เลขใกล้สุด ไม่สนลำดับ
- value-based slotting: เลขไม่มี keyword → ช่องช่วงแคบสุดที่รับได้ (เลขมีจุด→เลือกช่อง dec)
- เพิ่มฟิลด์ใหม่ = เพิ่ม 1 แถวใน VV_FIELDS + map id ใน `VV_LOC`
- ช่องจริง: reg-bp/reg-temp/reg-pulse/reg-weight/reg-height

## เทรน (vvTrain)
- ชุด `VV_TRAIN_SETS`: vitals(10) / symptoms(10) / thaimed(15) + โหมด custom (พิมพ์คำเอง)
- อ่าน 3 รอบ/บรรทัด · เกรด **`vvTrainGrade`**:
  - **Y** ตรง (หลัง `vvTrainCanon` = dict→เลขไทย→ตัดวรรคตอน)
  - **N** เพี้ยนมีเค้า (sim ≥ `VV_SIM_REJECT`=0.45) → วัตถุดิบ dict
  - **R** ต่างเกิน (sim < 0.45) → ให้อ่านใหม่ (ยึดไทยกลาง, ไม่เข้า dict เด็ดขาด)
- **user dict auto-add** (`vvTrainCountMiss`): เฉพาะ N · ไม่รวม vitals · เพี้ยนซ้ำ ≥2 (2/3 รอบ) · heard ≥3 ตัว · 3 รอบ 3 แบบ→ไม่ add
- เรียนแล้วมีผลทันที (vvDictNorm อ่าน user dict สดทุกครั้ง)

## เก็บข้อมูล (backend — รวมมาที่เรา 2 ปลายทาง)
- **routing (`vvTrainUpload`)**: superclinic (ไม่มี LS_URL) → POST GAS ตัวเอง `?action=voicetraining&token=` → แท็บ VoiceTraining ของ superclinic · **scproject (มี LS_URL) → POST License Server กลาง `?action=voicetraining`** (ไม่ต้อง token) → แท็บ VoiceTraining ใน LS_SHEET ของเรา (**รวมทุกคลินิกเช่ามาที่เรา**)
- `userId` = `vvUid()` มี **clinic_id นำหน้า** บน scproject (เช่น `SC001:uXXXX`) → แยกได้ว่ามาจากคลินิกไหน · superclinic = uid เปล่า
- **consent** (`vv_train_consent`) ต้องติ๊กก่อนส่ง (ทั้ง 2 แอปโชว์ consent) · ไม่ติ๊ก = เทรน + user dict local ได้ แต่ไม่ส่ง
- ส่ง **batch จบชุด** body `{rows:[...]}` · schema: `timestamp|userId|setId|lineId|attempt|expected|heard_raw|heard_norm|status|browser`
- handler: superclinic `handleVoiceTraining_` (Code.gs) · **License Server `saveVoiceTraining_`** (action `voicetraining` — additive, public append, ไม่แตะ tenant CRUD; deploy version 24)
- **ไม่เก็บไฟล์เสียง** (ข้อความเท่านั้น)

## UX (เฟส 4)
- auto-restart: `_vvUserStop` + restart ใน onend (กัน Chrome ตัดตอนเงียบ) · ไม่ restart เมื่อ fatal error
- undo: ปุ่ม ↶ ใน vv-bar (snapshot ค่าก่อนพูด) + พูด **"ยกเลิก"** โหมด B ถอนประโยคล่าสุด
- พูด **"ขึ้นบรรทัดใหม่"** โหมด B · โหมด B โชว์ข้อความสด (interim) commit เฉพาะ isFinal
- confidence < 0.6 → flash **เหลือง** (#fff4d6) เตือนให้เหลือบดู
- ปุ่ม 🎓 ใน vv-bar = เทรนคำที่เพิ่งพูด (prefill `_vvLastHeard`)
- error → ภาษาคน (`vvErrMsg`): ไม่อนุญาตไมค์ / ไม่ได้ยินเสียง / การเชื่อมต่อขัดข้อง

## ข้อจำกัด / รอบหน้า
- ใช้ Chrome/Edge + HTTPS · Web Speech ส่งเสียงขึ้น Google (privacy — เป้าหมายระยะถัดไป: เอนจินไทยของตัวเอง ตามนโยบาย §0.0 ข้อ 7)
- ยังไม่ auto-update VV_DICT กลางจากฐาน / ยังไม่ tune 0.45 (รอข้อมูลจริงในแท็บ VoiceTraining)
- ชุด thaimed เป็นชื่อยาที่ ASR เพี้ยนบ่อย — ปรับจากชีต herbs จริงได้
