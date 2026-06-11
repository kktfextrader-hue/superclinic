# Voice Training (vvTrain) — สเปกงาน (แก้ให้ตรงของจริง)

> ต้นฉบับมาจากเอกสารส่งงาน (Fable 5) ซึ่งอ้างฐาน v115 + ให้ vvNorm ทำ dict — **ผิด 2 จุด**
> ไฟล์นี้คือฉบับ reconcile แล้ว ใช้เป็น source of truth ของงานนี้

## Reconcile (ต่างจากเอกสารต้นฉบับ)
- **ฐาน = ของจริงปัจจุบัน** (superclinic feat v215→v216+, scproject feat v93→v94+) — **ไม่ใช่ v115** (เก่ากว่า 59 เวอร์ชัน จะทับงานหาย)
- **`vvNorm` มีอยู่แล้ว = normalize ค้นหาผู้ป่วยด้วยเสียง** (strip → alphanumeric, vvSearchMatch ใช้) → ชั้นพจนานุกรมใช้ชื่อใหม่ **`vvDictNorm`** ไม่แตะ vvNorm เดิม
- **ขอบเขต:** frontend (vv module+UI) = **ทั้ง 2 แอป lockstep** · backend (แท็บ VoiceTraining + handleVoiceTraining ใน Code.gs) = **เฉพาะ superclinic** (scproject ผ่าน LS proxy)
- vv module เหมือนกันเป๊ะ 2 แอป → patch ชุดเดียวใช้ได้ทั้งคู่ (str.replace)

## หลักการ (quality-first)
1. เฟสละ commit + ผ่าน test gate ก่อนขึ้นเฟสถัดไป
2. **Behavioral-compat**: ของเดิมที่ user เห็นต้องเหมือนเดิม (โหมด A/B/ปุ่ม/UI เดิมครบ) — เพิ่มความสามารถ ไม่เปลี่ยนความหมายเดิม
3. เทียบผลเทรนหลัง canon เท่านั้น เก็บเฉพาะที่ dict ปัจจุบันแก้ไม่ได้
4. ส่ง Sheets แบบ batch ครั้งเดียวจบชุด
5. consent checkbox ก่อนเทรนครั้งแรก (flag localStorage) ไม่ติ๊ก = เทรน+user dict ได้ แต่ไม่ส่งฐาน
6. ไม่เก็บไฟล์เสียง (ข้อความเท่านั้น)

---
## เฟส 1 — ฐานราก ✅ เสร็จ (deploy v216/v94)
- VV_DICT (20 คู่กลาง) + VV_CTX (ไข่→ไข้ ตามบริบท) + **vvDictNorm** + vvUserDict/vvUserDictAdd (localStorage `vv_dict_user` = `[["ผิด","ถูก"],...]`) + vvErrMsg/vvErrFatal
- จุดเชื่อม: `vvParse` ครอบ vvDictNorm · `vvDictate` onresult ครอบ vvDictNorm
- auto-restart: `_vvUserStop` (true เมื่อ user หยุด/toggle off/fatal err) + restart ใน onend ถ้า `_vvActive` ตรง & ไม่ใช่ user stop
- onerror→ภาษาคน · vvToggleVoice ปิด=หยุดฟัง
- **ผ่าน:** regA `{sys:120,dia:80,weight:65,height:170}` เป๊ะ · vvDictNorm/userDict ทำงาน · vvNorm(ค้นหา) ไม่พัง

## เฟส 2 — VV_FIELDS refactor (ถัดไป)
แทน vvParse regex hardcode 3 ฟิลด์ → table config + parser กลาง (ชื่อ/signature เดิม คืน object เดิม + key ใหม่ temp,pulse):
```javascript
var VV_FIELDS = [
  { id:'bp',     keys:['ความดัน','ดัน','บีพี','bp'], type:'pair', range:[[70,250],[40,150]], fmt:function(v){return v[0]+'/'+v[1];} },
  { id:'weight', keys:['น้ำหนัก','หนัก','นน','weight'], range:[20,250], dec:1 },
  { id:'height', keys:['ส่วนสูง','สูง','height'], range:[100,230] },
  { id:'temp',   keys:['อุณหภูมิ','ไข้','temp'], range:[34,43], dec:1 },
  { id:'pulse',  keys:['ชีพจร','pulse'], range:[30,220] }
];
```
ข้อกำหนด parser: regex จาก keys เรียงยาว→สั้น (กัน "สูง" กิน "ส่วนสูง") · จับคู่ keyword↔เลข ใกล้สุด ไม่สนลำดับ · range validation (นอกช่วงไม่เติม) · value-based slotting (เลขไม่มี keyword ลองใส่ช่องที่ช่วงรับ ช่องเดียว; xx/yy→bp เสมอ) · คำเพี้ยน keyword เป็นหน้าที่ VV_DICT ไม่ใส่ใน keys · ขยาย VV_LOC.reg ให้มี temp:'reg-temp', pulse:'reg-pulse' (ช่องมีแล้ว) · vvFill วน VV_FIELDS
**ช่องจริงในฟอร์ม:** reg-bp, reg-weight, reg-height, **reg-temp, reg-pulse** (ยืนยันมีครบ)
**Gate:** regression เดิมต้องผ่าน + "อุณหภูมิ36.8 ชีพจร72"→2ช่องใหม่ + สลับลำดับ + slotting + ค่าหลุดช่วงไม่เติม

## เฟส 3 — UI เทรน (§3–§8 ต้นฉบับ)
- VV_TRAIN_SETS = vitals(10)/symptoms(10)/thaimed(~15 **ดึงชื่อยา/ตำรับจาก herbs จริง** เน้นชื่อยาก ASR เพี้ยน)
- modal หน้า Setting (ปุ่ม class `vv-only`) · 3 รอบ/บรรทัด · grade Y/N/R
  - Y ตรง→เขียว · N เพี้ยนมีเค้า→ส้ม เก็บวัตถุดิบ · R ต่างเกิน→แดง อ่านซ้ำ(ไม่นับรอบ) R×2 ติด→ข้ามได้
- vvTrainCanon: vvDictNorm→vvToArabic→ตัด space/วรรคตอน · vvTrainMatch (เท่ากันหรือ substring>3) · vvTrainSim (Levenshtein บน canon, **reuse vvLev เดิม**) · **VV_SIM_REJECT=0.45** (ต่ำกว่า=R)
- user dict auto-add (vvTrain เท่านั้น): เฉพาะ symptoms/thaimed/custom · เฉพาะ N · เพี้ยนซ้ำ≥2 (2/3รอบ=add ทันที) · heard≥3ตัว · 3รอบ3แบบ=ไม่ add
- custom mode (พิมพ์คำ→อ่าน3รอบ, setId='custom') + ปุ่ม 🎓 ใน vv-bar (prefill `_vvLastHeard` — เพิ่ม 1 บรรทัดใน onresult เดิม)
- consent checkbox · จบชุดสรุป X/Y + ส่ง batch (ถ้า consent)
- **GAS (เฉพาะ superclinic Code.gs):** แท็บ `VoiceTraining` cols: timestamp|userId|setId|lineId|attempt|expected|heard_raw|heard_norm|status|browser · handler `handleVoiceTraining(p)` เข้า router doPost · client POST `{action:'voiceTraining',rows:[...]}`
- userId = ชื่อผู้ใช้/รหัสคลินิก ถ้าไม่มี gen `vv_uid` สุ่ม localStorage

## เฟส 4 — polish
undo (snapshot ค่าก่อน fill + ปุ่มเลิกทำ + คำพูด "ยกเลิก" โหมด B) · "ขึ้นบรรทัดใหม่" · interimResults โหมด B (commit เฉพาะ isFinal) · confidence<0.6→flash เหลือง · docs/voice-training.md · push
**Gate:** undo คืนค่า · "ยกเลิก" ถอนประโยคล่าสุด · regression เฟส2 ผ่าน

## นอกขอบเขต (รอบนี้ไม่ทำ)
auto-update VV_DICT กลางจากฐาน + tune 0.45 · on-device engine (Pathumma) · สำเนียงถิ่น (ยึดไทยกลาง รีวิวจาก status=R ภายหลัง)
