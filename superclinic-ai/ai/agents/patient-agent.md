# patient-agent.md
# Superclinic — Patient Agent

## Purpose

This agent handles all patient management features:

- Patient CRUD (create, read, update, soft delete)
- Medical history viewing
- Patient search (SearchX autocomplete)
- Appointment linking
- Patient type / tier calculation
- Body map integration
- Registration workflow
- Treatment record linking

---

## Scope

```
frontend/features/patients/       ← Patient list, view, edit
frontend/features/dashboard/      ← Today's appointments, stats
```

---

## Key Functions (Current)

```javascript
loadPatients()                  // Load patient list
renderPatients()                // Render patient cards
viewPatient(hn)                 // Open patient detail modal
openAddPatient()                // Open add patient form
submitAddPatient()              // Submit new patient
openEditPatient(hn)             // Open edit patient form
submitEditPatient()             // Submit patient edit
deletePatient(hn)               // Soft delete patient
quickViewPatient(hn)            // Quick view popup
loadPatHistorySection(hn)       // Load treatment history
expandPatHistFull(hn)           // Expand full history
goRegisterWithPatient(hn)       // Navigate to register with patient pre-filled
```

---

## Patient Schema

```
hn              HN-XXXXXX (unique, auto-generated)
prefix          นาย / นาง / นางสาว / เด็กชาย / เด็กหญิง
first_name      string
last_name       string
dob             YYYY-MM-DD
gender          male / female
phone           string
element         ดิน / น้ำ / ลม / ไฟ (ธาตุ)
allergy         string (comma-separated)
chronic_disease string
patient_type    new / regular / vip
body_map        JSON string
is_active       TRUE / FALSE
```

---

## Patient Type Tiers

```javascript
function calcPatientTier(visitCount) {
  if (visitCount >= 20) return 'vip';
  if (visitCount >= 5)  return 'regular';
  return 'new';
}
```

---

## HN Format

- Format: `HN-XXXXXX` (6 digits, zero-padded)
- Example: `HN-000001`, `HN-000042`
- Auto-generated on patient creation
- Never changes after creation

---

## SearchX Convention

Patient search inputs follow SearchX convention:

| input id | dropdown id | Page |
|----------|------------|------|
| `appt-pat-input` | `appt-pat-suggestions` | นัดหมายใหม่ |
| `reg-search` | `reg-search-result` | ลงทะเบียน |
| `treat-search` | `treat-pat-dd` | บันทึกรักษา |
| `rcpt-pat-search` | `rcpt-pat-dd` | ออกใบเสร็จ |

⚠️ **ห้ามแตะ** `appt-pat-input` / `apptPatSearch` / `apptPatSelect` — มี logic พิเศษ

---

## Rules

- All patient displays: `prefix + first_name + last_name`
- Age calculation from `dob` using `calcAge(dob)`
- Date display: `DD/MM/YYYY (พ.ศ. 4 หลัก)` — ห้ามชื่อเดือนไทย
- Soft delete only (`is_active = FALSE`)
- Body map data: store as JSON string, parse with `JSON.parse()`

---

## Do NOT

- ❌ Alter `apptPatSearch` or `apptPatSelect` without explicit request
- ❌ Display month names in Thai (use DD/MM/YYYY only)
- ❌ Hard-delete patients
- ❌ Mix appointment logic inside patient CRUD functions
