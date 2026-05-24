/**
 * schemas.js
 * Superclinic — Data Type Schemas (JSDoc definitions)
 *
 * These are NOT runtime classes — just documentation for type checking.
 * Reference these when working with API data.
 */

/**
 * @typedef {Object} Patient
 * @property {string} hn              - HN-XXXXXX (unique identifier)
 * @property {string} prefix          - นาย | นาง | นางสาว | เด็กชาย | เด็กหญิง
 * @property {string} first_name      - ชื่อ
 * @property {string} last_name       - นามสกุล
 * @property {string} dob             - วันเกิด (YYYY-MM-DD)
 * @property {string} gender          - male | female
 * @property {string} phone           - เบอร์โทร
 * @property {string} element         - ธาตุ: ดิน | น้ำ | ลม | ไฟ
 * @property {string} allergy         - ประวัติแพ้ยา (comma-separated)
 * @property {string} chronic_disease - โรคประจำตัว
 * @property {string} patient_type    - new | regular | vip
 * @property {string} body_map        - JSON string ของ body map
 * @property {string} is_active       - TRUE | FALSE
 */

/**
 * @typedef {Object} Appointment
 * @property {number} id              - Sequential ID (1, 2, 3...)
 * @property {string} patient_id      - HN-XXXXXX
 * @property {string} patient_name    - Full name (display only)
 * @property {string} date            - YYYY-MM-DD
 * @property {string} time_start      - HH:MM
 * @property {string} doctor          - Doctor name
 * @property {string} treatment_type  - TRT-01 to TRT-07
 * @property {string} status          - pending | confirmed | completed | cancelled | missed
 * @property {string} room            - ห้อง
 * @property {string} is_active       - TRUE | FALSE
 */

/**
 * @typedef {Object} Treatment
 * @property {number} id              - Sequential ID
 * @property {string} patient_id      - HN-XXXXXX
 * @property {number} appointment_id  - Appointment ID (optional)
 * @property {string} date            - YYYY-MM-DD
 * @property {string} type            - TRT-01 to TRT-07
 * @property {string} symptoms        - อาการ
 * @property {string} diagnosis       - วินิจฉัย
 * @property {string} herbs_used      - JSON string of herbs dispensed
 * @property {number} price           - ราคา (บาท)
 * @property {string} is_active       - TRUE | FALSE
 */

/**
 * @typedef {Object} Herb
 * @property {string} id              - HRB-XXX
 * @property {string} name_th         - ชื่อภาษาไทย
 * @property {string} name_en         - ชื่อภาษาอังกฤษ
 * @property {string} category        - สมุนไพร | ยาแผนปัจจุบัน | อุปกรณ์ | ยาสมุนไพรสำเร็จรูป
 * @property {string} unit            - หน่วย (กรัม, มิลลิลิตร, ชิ้น, ฯลฯ)
 * @property {number} quantity        - จำนวนคงเหลือ
 * @property {number} min_quantity    - ปริมาณขั้นต่ำ (trigger low stock)
 * @property {number} cost_per_unit   - ราคาต่อหน่วย (บาท)
 * @property {string} status          - active | low | out
 * @property {string} is_active       - TRUE | FALSE
 */

/**
 * @typedef {Object} StockTransaction
 * @property {number} id              - Sequential ID
 * @property {string} herb_id         - HRB-XXX
 * @property {string} type            - IN | OUT
 * @property {number} quantity        - จำนวน
 * @property {string} reason          - เหตุผล
 * @property {string} date            - YYYY-MM-DD
 */

/**
 * @typedef {Object} FinanceRecord
 * @property {number} id              - Sequential ID
 * @property {string} date            - YYYY-MM-DD
 * @property {string} type            - income | expense
 * @property {string} category        - หมวดหมู่
 * @property {number} amount          - จำนวนเงิน (บาท)
 * @property {string} payment_method  - cash | transfer | card
 * @property {string} receipt_no      - RC-YYYYMMDD-XXXX
 * @property {string} is_active       - TRUE | FALSE
 */

/**
 * @typedef {Object} BodyMapDot
 * @property {string} id      - Unique dot ID
 * @property {string} view    - front | back | left | right
 * @property {number} x       - X position (percentage)
 * @property {number} y       - Y position (percentage)
 * @property {number} level   - Pain level 1-5
 */

/**
 * @typedef {Object} BodyMapData
 * @property {BodyMapDot[]} dots
 */

/**
 * @typedef {Object} HerbsUsedItem
 * @property {string} id       - HRB-XXX
 * @property {string} name     - ชื่อสมุนไพร
 * @property {number} quantity - จำนวนที่จ่าย
 * @property {string} unit     - หน่วย
 */
