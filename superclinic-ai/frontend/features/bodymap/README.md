# bodymap/
# Feature: แผนที่จุดเจ็บปวด (Body Map)

## Scope

Component แสดงจุดเจ็บปวดบนร่างกาย:
- 4 มุมมอง (หน้า/หลัง/ซ้าย/ขวา)
- 5 ระดับความปวด
- Multi-instance (หลาย instance พร้อมกัน)
- Integration กับ registration และ treatment

## Component API

```javascript
bodyMapHTML('uid')          // สร้าง HTML
bmGetValue('uid')           // อ่านค่า JSON
bmLoadData('uid', json)     // โหลดข้อมูลเก่า
bmClear('uid')              // ล้างทั้งหมด
bmSetLevel(level)           // ตั้งระดับ (1-5)
bmClick(uid, side, x, y)    // เพิ่มจุด
bmRemoveDot(uid, dotId)     // ลบจุด
bmRenderDots(uid)           // Render ใหม่
```

## Component File

```
frontend/components/bodymap-component.html
Live: https://kktfextrader-hue.github.io/Marvel-Clinic/bodymap-component.html
```

## Usage Example

```html
<div id="bm-container"></div>
<script>
  document.getElementById('bm-container').innerHTML = bodyMapHTML('myuid');
</script>

// อ่านค่า
const data = bmGetValue('myuid');

// โหลดข้อมูลเก่า
bmLoadData('myuid', patient.body_map);
```

## Data Format

```json
{
  "dots": [
    { "id": "dot-1716123456789", "view": "front", "x": 45.2, "y": 32.1, "level": 3 }
  ]
}
```

## Active Instances

| uid | Page |
|-----|------|
| `addpat` | ลงทะเบียน |
| `treat` | บันทึกรักษา |
| `viewpat` | ดูประวัติผู้ป่วย |

## Agent Reference

ดู `ai/agents/bodymap-agent.md`
ดู `BODYMAP.md` (root)
