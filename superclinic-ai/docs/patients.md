# docs/patients.md — Marvel Dataset (Test Data)
> อ่านเมื่อ: ทดสอบระบบ, seed data, demo ให้ลูกค้า, dev/staging

---

## สถิติ Dataset

| รายการ | จำนวน |
|---|---|
| ผู้ป่วยทั้งหมด | 20 คน |
| ธาตุไฟ | 6 คน |
| ธาตุดิน | 5 คน |
| ธาตุลม | 5 คน |
| ธาตุน้ำ | 4 คน |
| มีโรคประจำตัว | 16 คน |
| ไม่มีโรคประจำตัว | 4 คน (T'Challa, Peter Quill, Logan, Carol Danvers) |

---

## รายชื่อผู้ป่วยทั้งหมด

| HN | ชื่อ | ธาตุ | โรคประจำตัว | ประเภท |
|---|---|---|---|---|
| HN-000001 | Tony Stark | ไฟ | โรคหัวใจ ความเครียดสูง | VIP |
| HN-000002 | Steve Rogers | ดิน | ปวดกล้ามเนื้อเรื้อรัง | ประจำ |
| HN-000003 | Thor Odinson | ลม | ไมเกรน | ประจำ |
| HN-000004 | Natasha Romanoff | ลม | ปวดหลัง | ประจำ |
| HN-000005 | Bruce Banner | ไฟ | ความดันโลหิตสูง | ประจำ |
| HN-000006 | Clint Barton | ดิน | ปวดข้อ | ประจำ |
| HN-000007 | Peter Parker | ลม | แพ้อากาศ | ใหม่ |
| HN-000008 | Wanda Maximoff | น้ำ | ปวดหัวไมเกรน | ประจำ |
| HN-000009 | T'Challa | ดิน | ไม่มี | VIP |
| HN-000010 | Stephen Strange | ไฟ | มือสั่น (เส้นประสาท) | VIP |
| HN-000011 | Sam Wilson | ลม | ปวดหลัง ปวดไหล่ | ประจำ |
| HN-000012 | James Rhodes | ดิน | บาดเจ็บกระดูกสันหลัง | ประจำ |
| HN-000013 | Scott Lang | น้ำ | วิงเวียนบ่อย | ใหม่ |
| HN-000014 | Peter Quill | ลม | ไม่มี | ใหม่ |
| HN-000015 | Gamora | น้ำ | ปวดข้อ | ประจำ |
| HN-000016 | Nebula | ไฟ | ระบบประสาท | ประจำ |
| HN-000017 | Jean Grey | ไฟ | ปวดหัวรุนแรง | ประจำ |
| HN-000018 | Logan (Wolverine) | ดิน | ไม่มี | ประจำ |
| HN-000019 | Carol Danvers | ไฟ | ไม่มี | VIP |
| HN-000020 | Vision | น้ำ | ระบบพลังงาน | ใหม่ |

---

## Seed Format ตัวอย่าง (สำหรับ import เข้า Google Sheets)

```
id,hn,prefix,first_name,last_name,dob,age,gender,phone,email,blood_type,element,allergy,chronic_disease,patient_type,is_active
PAT-0001,HN-000001,นาย,Tony,Stark,1970-05-29,55,M,081-234-5678,tony@starkindustries.com,O,ไฟ,,โรคหัวใจ ความเครียดสูง,vip,TRUE
PAT-0002,HN-000002,นาย,Steve,Rogers,1918-07-04,107,M,089-876-5432,cap@shield.gov,A,ดิน,,ปวดกล้ามเนื้อเรื้อรัง,regular,TRUE
```

---

## หมายเหตุ

- Dataset นี้ใช้สำหรับ **ทดสอบและ demo เท่านั้น**
- อย่าใช้ใน production โดยไม่แทนที่ด้วยข้อมูลจริง
- format `hn`: `HN-XXXXXX` (6 หลัก)
- format `id`: `PAT-XXXX` (4 หลัก, generate ใน Code.gs)
