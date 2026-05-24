# inventory/
# Feature: สมุนไพร & ยา (คลังสมุนไพร)

## Scope

จัดการคลังสมุนไพรและยา:
- แสดงรายการสมุนไพร/ยา
- เพิ่มสมุนไพร/ยาใหม่
- ดูรายละเอียด
- ปรับ stock (IN/OUT)
- คำนวณมูลค่า stock อัตโนมัติ

## Key Functions

```javascript
loadHerbs()             // โหลดและแสดงรายการสมุนไพร
renderHerbs()           // Render herb cards
openAddHerb()           // เปิด modal เพิ่มสมุนไพร
submitAddHerb()         // บันทึกสมุนไพรใหม่
herbSearchAC(q)         // Autocomplete search
herbACSelect(id)        // เลือกสมุนไพรจาก autocomplete
viewHerb(id)            // ดูรายละเอียด
openAdjStock()          // เปิด modal ปรับ stock
submitStock()           // บันทึกการปรับ stock
showAllFreshHerbs()     // แสดงสมุนไพรสด ทั้งหมด
showAllMediHerbs()      // แสดงยาแผนปัจจุบัน ทั้งหมด
```

## Page IDs

```
id="page-herbs"    ← สมุนไพร & ยา
id="page-stock"    ← ประวัติการเคลื่อนไหว stock
```

## Auto Stock Value

ทุกครั้งที่ `loadHerbs()` ทำงาน จะคำนวณและบันทึก:
```javascript
Σ(quantity × cost_per_unit) → settings['herb_stock_value']
```

## Herb ID Format

```
HRB-001, HRB-002, HRB-003...  (zero-padded 3 digits)
```

## Agent Reference

ดู `ai/agents/inventory-agent.md`

## Future Features

- Barcode scanner (html5-qrcode)
- OCR medicine search (Tesseract.js)
- Expiry date tracking
- Supplier management
