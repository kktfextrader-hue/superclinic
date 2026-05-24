# BODYMAP.md — Body Map Component Reference

> **สำหรับ AI:** อ่านไฟล์นี้แล้วดึง Body Map Component ไปใช้ใน project ได้เลย
> ไม่ต้องเขียนใหม่ — component สำเร็จรูปอยู่ที่ URL ด้านล่าง

---

## ไฟล์ Component

| รายการ | URL |
|---|---|
| Standalone HTML (demo + code) | https://kktfextrader-hue.github.io/Marvel-Clinic/bodymap-component.html |
| Raw source | https://raw.githubusercontent.com/kktfextrader-hue/Marvel-Clinic/main/bodymap-component.html |
| GitHub repo | https://github.com/kktfextrader-hue/Marvel-Clinic |

---

## Component ทำอะไร

แผนที่จุดเจ็บปวดบนร่างกายมนุษย์ — ผู้ใช้คลิกบนภาพร่างกายเพื่อ mark ตำแหน่งที่ปวด เลือกระดับความปวด 1-5 แล้ว save เป็น JSON

- **4 มุมมอง:** หน้า / หลัง / ข้าง / ศีรษะ
- **5 ระดับความปวด:** สีเขียว (1) → สีแดงเข้ม (5)
- **หลาย instance:** ใช้พร้อมกันหลายอันในหน้าเดียวได้
- **ไม่ต้องการ backend:** เก็บข้อมูลเป็น JSON ใน memory / hidden input
- **ไม่ต้องการ framework:** Vanilla JS ล้วน

---

## วิธีนำไปใช้ใน Project ใหม่

### ขั้นตอนที่ 1 — ดึง source

**ให้ AI fetch ไฟล์นี้:**
```
https://raw.githubusercontent.com/kktfextrader-hue/Marvel-Clinic/main/bodymap-component.html
```

แล้วดึง 2 ส่วน:
- **CSS:** ค้นหา `/* ── BODY MAP ── */` คัดลอกถึง `/* ── PATIENT DETAIL SECTIONS ── */`
- **JS:** ค้นหา `/* BODY MAP — คลิก mark จุดเจ็บ */` คัดลอกถึง `function bmGetValue` (รวม closing brace)

### ขั้นตอนที่ 2 — Embed

```html
<div id="my-bodymap-wrap"></div>
<script>
  document.getElementById('my-bodymap-wrap').innerHTML = bodyMapHTML('patient-001');
</script>
```

### ขั้นตอนที่ 3 — อ่าน/เขียนข้อมูล

```js
// อ่านข้อมูล
const json = bmGetValue('patient-001');
// {"front":[{"x":50.2,"y":32.1,"level":3}],"back":[...],"side":[],"head":[]}

// โหลดข้อมูลเก่า
bmLoadData('patient-001', savedJsonString);

// ล้างทั้งหมด
bmClear('patient-001');
```

---

## Public API

| ฟังก์ชัน | Parameters | ทำอะไร |
|---|---|---|
| `bodyMapHTML(uid)` | uid: string | สร้าง HTML ของ component |
| `bmGetValue(uid)` | uid: string | คืน JSON string ของจุดทั้งหมด |
| `bmLoadData(uid, data)` | uid, json/object | โหลดข้อมูลเก่าเข้า map |
| `bmClear(uid)` | uid: string | ล้างจุดทั้งหมด |

**รูปแบบ JSON:**
```json
{
  "front": [{ "x": 50.2, "y": 32.1, "level": 3 }],
  "back":  [{ "x": 48.0, "y": 55.0, "level": 5 }],
  "side":  [],
  "head":  [{ "x": 50.0, "y": 28.0, "level": 1 }]
}
```
- `x`, `y` = ตำแหน่งเป็น % บนภาพ (0–100)
- `level` = ระดับความปวด 1 (น้อย) ถึง 5 (มาก)

---

## Dependencies

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**CSS Variables ที่ต้องมี:**
```css
:root {
  --g1: #2F5D50;
  --g2: #5F8D4E;
  --go: #C8A96B;
  --cr: #F8F5EF;
}
```

---

## Prompt สำเร็จรูป — copy ไปใช้ได้เลย

```
ฉันมี Body Map Component เก็บไว้ที่:
https://raw.githubusercontent.com/kktfextrader-hue/Marvel-Clinic/main/bodymap-component.html

ขอให้:
1. Fetch ไฟล์นั้น
2. ดึงส่วน CSS (หา /* ── BODY MAP ──) และ JS (หา /* BODY MAP — คลิก mark)
3. Embed ใน [project ของฉัน / ระบุไฟล์]
4. ใช้ bodyMapHTML('uid') สร้าง component
5. ใช้ bmGetValue('uid') อ่านค่าตอน submit/save

[อธิบาย project ของคุณเพิ่มเติม]
```

---

## ประวัติ

| วันที่ | Version | หมายเหตุ |
|---|---|---|
| 2026-05-22 | v1.0 | แยกออกจาก Superclinic v50 |

> **Source:** [kktfextrader-hue/Marvel-Clinic](https://github.com/kktfextrader-hue/Marvel-Clinic)
