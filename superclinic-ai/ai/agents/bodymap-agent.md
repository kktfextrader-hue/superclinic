# bodymap-agent.md
# Superclinic — Body Map Agent

## Purpose

This agent handles all body map UI and data features:

- Body map component rendering (4 views)
- Pain point annotation (5 levels)
- Multi-instance support
- Patient visual pain tracking
- Body map data serialization / deserialization
- Integration with treatment records

---

## Scope

```
frontend/features/bodymap/       ← Body map feature UI
frontend/components/             ← bodymap-component.html (standalone)
```

---

## Component API

```javascript
bodyMapHTML('uid')         // สร้าง HTML ของ body map component
bmGetValue('uid')          // อ่าน JSON ของจุดเจ็บปวดทั้งหมด
bmLoadData('uid', json)    // โหลดข้อมูลเก่าเข้า component
bmClear('uid')             // ล้างจุดทั้งหมด
bmSetLevel(level)          // ตั้งระดับความปวด (1-5)
bmClick(uid, side, x, y)   // เพิ่มจุดเจ็บปวด
bmRemoveDot(uid, dotId)    // ลบจุดเดียว
bmRenderDots(uid)          // Re-render ทุกจุด
```

---

## Views (4 มุมมอง)

| View | ชื่อ |
|------|------|
| front | ด้านหน้า |
| back | ด้านหลัง |
| left | ด้านซ้าย |
| right | ด้านขวา |

---

## Pain Levels (5 ระดับ)

| Level | สี | ความหมาย |
|-------|-----|---------|
| 1 | เหลือง | เจ็บเล็กน้อย |
| 2 | ส้มอ่อน | เจ็บปานกลาง |
| 3 | ส้ม | เจ็บมาก |
| 4 | แดงอ่อน | เจ็บมากมาก |
| 5 | แดงเข้ม | เจ็บรุนแรง |

---

## Data Format (JSON)

```json
{
  "dots": [
    {
      "id": "dot-1716123456789",
      "view": "front",
      "x": 45.2,
      "y": 32.1,
      "level": 3
    }
  ]
}
```

---

## Multi-instance Usage

```html
<!-- instance 1: registration -->
<div id="bm-addpat"></div>
<script>
  document.getElementById('bm-addpat').innerHTML = bodyMapHTML('addpat');
</script>

<!-- instance 2: treatment record -->
<div id="bm-treat"></div>
<script>
  document.getElementById('bm-treat').innerHTML = bodyMapHTML('treat');
</script>
```

---

## Integration Points

- **Registration page** — บันทึกตอนลงทะเบียนผู้ป่วยใหม่
- **Treatment record** — บันทึกตอนรักษา
- **Patient view** — แสดงประวัติ body map

---

## Component File

```
Live: https://kktfextrader-hue.github.io/Marvel-Clinic/bodymap-component.html
Local: frontend/components/bodymap-component.html
Reference: BODYMAP.md
```

---

## Rules

- Each body map instance must have a **unique uid**
- Never share state between instances
- Body map data stored as JSON string in `patients.body_map` column
- Always call `bmClear()` before loading new patient data
- Component is self-contained — no external dependencies

---

## Do NOT

- ❌ Mix body map logic with inventory or patient CRUD
- ❌ Use same uid for multiple instances on same page
- ❌ Store pixel coordinates — store percentage (x%, y%)
- ❌ Hard-code view images (use CSS background references)
