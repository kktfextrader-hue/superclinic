# billing/
# Feature: การเงิน & ออกใบเสร็จ

## Scope

จัดการการเงินคลินิก:
- บันทึกรายรับ / รายจ่าย
- ออกใบเสร็จ
- แสดงสรุปการเงิน
- Export CSV
- ป้องกันด้วยรหัสผ่าน

## Key Functions

```javascript
loadFinance()           // โหลดข้อมูลการเงิน
checkFinancePw()        // ตรวจสอบรหัสผ่าน
openIncomeModal()       // เปิด modal บันทึกรายรับ
openExpenseModal()      // เปิด modal บันทึกรายจ่าย
submitFinanceEntry()    // บันทึกรายรับ/รายจ่าย
openReceiptModal()      // เปิด modal ออกใบเสร็จ
rcptPatSearch(q)        // ค้นหาผู้ป่วยสำหรับใบเสร็จ
rcptPatSelect(hn)       // เลือกผู้ป่วย
submitReceipt()         // ออกใบเสร็จ
showFinanceAll()        // แสดงรายการทั้งหมด
exportCSV()             // Export เป็น CSV
```

## Page ID

```
id="page-finance"
```

## Password Protection

หน้าการเงินล็อกด้วย overlay `id="finance-lock"`
รหัสผ่านเก็บใน settings sheet (key: `finance_password`)

## Finance Schema

```
id              sequential integer (1, 2, 3...)
date            YYYY-MM-DD
type            income / expense
category        string
amount          number
payment_method  cash / transfer / card
receipt_no      RC-YYYYMMDD-XXXX
```

## SearchX

| input id | dropdown id |
|----------|------------|
| `rcpt-pat-search` | `rcpt-pat-dd` |

## Agent Reference

ดู `ai/agents/finance-agent.md`

## Future Features (จาก ปรับปรุง.txt)

- Google Login authorization
- API key per-user (linked to Gmail)
- Backup/restore with email OTP
- Settings password protection
