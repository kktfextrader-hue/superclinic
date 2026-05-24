# finance-agent.md
# Superclinic — Finance Agent

## Purpose

This agent handles all financial features:

- Income and expense recording
- Receipt generation
- Finance page password protection
- Financial reports and statistics
- CSV export
- Finance category management

---

## Scope

```
frontend/features/billing/    ← Finance UI, receipts
```

---

## Key Functions (Current)

```javascript
loadFinance()              // Load finance records
openIncomeModal()          // Open income entry modal
openExpenseModal()         // Open expense entry modal
submitFinanceEntry()       // Submit income/expense
openReceiptModal()         // Open receipt generation modal
rcptPatSearch(q)           // Search patient for receipt
rcptPatSelect(hn)          // Select patient for receipt
submitReceipt()            // Submit and generate receipt
showFinanceAll()           // Show all finance records
exportCSV()                // Export finance to CSV
checkFinancePw()           // Check finance page password
```

---

## Finance Schema

```
id              auto-increment integer
date            YYYY-MM-DD
type            income / expense
category        string
amount          number
payment_method  cash / transfer / card
receipt_no      string (auto-generated)
```

---

## Password Protection

Finance page is protected by a lock screen:
- Password stored in `settings` sheet (key: `finance_password`)
- Lock shown via `id="finance-lock"` overlay
- `checkFinancePw()` validates and removes overlay on success

---

## Receipt No Format

- Format: `RC-YYYYMMDD-XXXX`
- Example: `RC-20260524-0001`
- Auto-incremented per day

---

## Income Categories

| รหัส | หมวด |
|-----|------|
| treatment | ค่ารักษา |
| medicine | ค่ายา |
| consultation | ค่าปรึกษา |
| other | อื่นๆ |

## Expense Categories

| รหัส | หมวด |
|-----|------|
| supplies | วัสดุสิ้นเปลือง |
| utilities | ค่าสาธารณูปโภค |
| salary | เงินเดือน |
| equipment | ครุภัณฑ์ |
| other | อื่นๆ |

---

## Rules

- Finance page always starts locked
- Password validated server-side via `callApi('settings','get',null,'finance_password')`
- All amounts stored as numbers, displayed with `toLocaleString()`
- Soft delete finance records (`is_active = FALSE`)

---

## Future Enhancements (from ปรับปรุงเพิ่มเติม.txt)

- [ ] Google Login authorization required to access API settings
- [ ] API key stored per-user, linked to Gmail login
- [ ] Backup/restore with password-protected reset (email OTP, 15min expiry)
- [ ] Settings section password protection (set/recover via login email)

---

## Do NOT

- ❌ Show finance data before password is verified
- ❌ Store raw password in frontend code
- ❌ Hard-delete finance records
- ❌ Mix treatment billing logic with finance recording
