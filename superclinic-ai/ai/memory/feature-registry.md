# feature-registry.md
# Superclinic — Feature Registry

Last updated: 2026-05-24 (v60 baseline)

---

## Active Features

| Feature | Page ID | Key Functions | Status |
|---------|---------|--------------|--------|
| Dashboard | `page-dashboard` | `loadDashboard()`, `renderDashApptRow()` | ✅ Active |
| Appointments | `page-appointments` | `loadAppointments()`, `openAddAppt()`, `viewAppt()` | ✅ Active |
| Patients | `page-patients` | `loadPatients()`, `viewPatient()`, `openAddPatient()` | ✅ Active |
| Register | `page-register` | `loadRegister()`, `submitRegister()`, `searchRegPatient()` | ✅ Active |
| Treatments | `page-treatments` | `loadTreatmentPatients()`, `submitTreatment()` | ✅ Active |
| Herbs & Medicine | `page-herbs` | `loadHerbs()`, `openAddHerb()`, `viewHerb()` | ✅ Active |
| Stock | `page-stock` | `loadStock()`, `openAdjStock()`, `submitStock()` | ✅ Active |
| Finance | `page-finance` | `loadFinance()`, `submitFinanceEntry()`, `submitReceipt()` | ✅ Active (password protected) |
| Reports | `page-reports` | `loadReports()`, `renderReportsChart()` | ✅ Active |
| Settings | `page-settings` | `loadSettings()`, `saveSettings()`, `loadUsers()` | ✅ Active |

---

## SearchX Registry (v60)

| input id | dropdown id | Page | Notes |
|----------|------------|------|-------|
| `appt-pat-input` | `appt-pat-suggestions` | Appointments | ⚠️ ห้ามแตะ — logic พิเศษ |
| `reg-search` | `reg-search-result` | Register | รองรับสร้างผู้ป่วยใหม่ |
| `treat-search` | `treat-pat-dd` | Treatments | เลือกผู้ป่วย |
| `rcpt-pat-search` | `rcpt-pat-dd` | Finance | ออกใบเสร็จ |
| herb search (treat) | `herb-ac-box` | Treatments | สมุนไพร |
| herb search (medi) | `herb-ac-box-medi` | Treatments | ยาแผนปัจจุบัน |
| `herb-name-{idx}` | `herb-ac-{idx}` | Treatments | dynamic rows |

---

## Custom Date Picker Registry (v59+)

| hidden id | display id | Used in |
|----------|-----------|---------|
| `appt-date-in` | `appt-date-in-disp` | นัดหมายใหม่ |
| `reg-date` | `reg-date-disp` | ลงทะเบียน |
| `treat-date` | `treat-date-disp` | บันทึกรักษา |
| `next-appt-date` | `next-appt-date-disp` | นัดครั้งต่อไป |
| `vappt-date` | `vappt-date-disp` | แก้ไขนัดหมาย |

---

## Body Map Instances

| uid | Page | Used for |
|-----|------|---------|
| `addpat` | Register | ลงทะเบียนผู้ป่วยใหม่ |
| `treat` | Treatments | บันทึกการรักษา |
| `viewpat` | Patients | ดูประวัติผู้ป่วย |

---

## Planned Features (Roadmap)

| Feature | Priority | Notes |
|---------|---------|-------|
| Sequential integer IDs | High | แทน random string IDs |
| Google Login auth | Future | ใช้ Google OAuth |
| Per-user API key | Future | linked to Gmail login |
| Backup/restore | Future | email OTP, 15min expiry |
| Settings password | Future | recover via login email |
| Barcode scanner | Future | html5-qrcode |
| OCR medicine search | Future | Tesseract.js |
| Expiry tracking | Future | herbs + medicine |
| Supplier management | Future | purchase orders |
| AI prescription OCR | Future | OpenAI Vision |
| Multi-branch | Future | role-based per branch |
