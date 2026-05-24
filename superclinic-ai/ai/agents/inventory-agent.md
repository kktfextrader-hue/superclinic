# inventory-agent.md
# Superclinic — Inventory Agent

## Purpose

This agent handles all inventory and stock-related features:

- Herb and medicine stock management
- Stock movement (IN/OUT) tracking
- Barcode scanning (html5-qrcode)
- OCR medicine search (Tesseract.js)
- Retail and wholesale pricing
- Expiry date tracking (future)
- Supplier management (future)
- Auto stock value calculation

---

## Scope

```
frontend/features/inventory/    ← Herb & medicine UI
frontend/features/pharmacy/     ← Medicine dispensing UI
frontend/shared/barcode/        ← Barcode scanner utility
frontend/shared/ocr/            ← OCR search utility
backend/inventory/              ← Inventory backend logic
```

---

## Rules

- **Isolate inventory domain** — no patient logic inside inventory modules
- **Reusable search utilities** — use shared `searchX` convention
- **Debounce search** — 300ms debounce on all herb search inputs
- **Stock value auto-save** — recalculate `Σ(quantity × cost_per_unit)` after every `loadHerbs()`
- **Soft delete** — herbs marked `is_active = FALSE`, not deleted

---

## Key Functions (Current)

```javascript
loadHerbs()           // Load and render herb list
openAddHerb()         // Open add herb modal
submitAddHerb()       // Submit new herb form
herbSearchAC(q)       // Autocomplete search for herbs
herbACSelect(id)      // Select herb from autocomplete
renderHerbs()         // Render herb cards
viewHerb(id)          // View herb detail
openAdjStock()        // Open stock adjustment modal
submitStock()         // Submit stock adjustment
loadStock()           // Load stock transactions
renderStockTable()    // Render stock transaction table
```

---

## Herb Categories

- สมุนไพร (Herb)
- ยาแผนปัจจุบัน (Modern Medicine)
- อุปกรณ์ (Equipment)
- ยาสมุนไพรสำเร็จรูป (Prepared Herb)

---

## Stock Value Convention

After every `loadHerbs()`:
```javascript
const val = herbs.reduce((s, h) => s + (h.quantity * h.cost_per_unit), 0);
await callApi('settings', 'update', {
  key: 'herb_stock_value',
  value: String(Math.round(val)),
  description: 'มูลค่าสต็อกสมุนไพรทั้งหมด'
});
```

---

## Future Enhancements

- [ ] Barcode scanner (html5-qrcode)
- [ ] OCR medicine search (Tesseract.js)
- [ ] Expiry date tracking
- [ ] Supplier management
- [ ] Retail/wholesale pricing tiers
- [ ] Low stock alerts
- [ ] Stock movement history chart

---

## Do NOT

- ❌ Mix patient logic inside inventory modules
- ❌ Direct DOM manipulation outside inventory feature folder
- ❌ Hard-delete herbs
- ❌ Skip stock value recalculation after herb updates
