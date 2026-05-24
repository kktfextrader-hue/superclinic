/**
 * ════════════════════════════════════════════════════════════════
 *  Superclinic — Google Apps Script REST API
 *  Version  : 1.0
 *  Author   : Dr. Stephen Strange (Superclinic)
 *  Updated  : 2025-05-18
 * ════════════════════════════════════════════════════════════════
 *
 *  วิธีใช้งาน (Quick Setup):
 *    1) เปิด script.google.com → New Project → วาง Code.gs นี้ทั้งหมด
 *    2) แก้ค่า API_TOKEN ในชีต settings ให้ตรงกับ CONFIG.API_TOKEN ด้านล่าง
 *    3) Deploy → New deployment → Web app
 *         - Execute as : Me
 *         - Who has access : Anyone
 *    4) Copy URL ที่ได้ ใส่ใน thai-clinic.html (constant API_URL)
 *    5) ทดสอบด้วย:
 *         GET  {URL}?sheet=patients&action=list
 *         POST {URL}?sheet=patients&action=create   (body: JSON, Content-Type: text/plain)
 *         Authorization Header: Bearer MARVEL-SECRET-TOKEN-2025
 *         (หรือส่ง token แนบใน query string: &token=MARVEL-SECRET-TOKEN-2025)
 *
 *  Endpoints:
 *    GET  ?sheet=<name>&action=list
 *    GET  ?sheet=<name>&action=get&id=<id>
 *    POST ?sheet=<name>&action=create   { ...fields }
 *    POST ?sheet=<name>&action=update   { id, ...fields }
 *    POST ?sheet=<name>&action=delete   { id }            ← Soft delete
 *
 *  Sheets ที่รองรับ:
 *    patients, appointments, treatments, herbs,
 *    stock_transactions, finance, settings, users
 * ════════════════════════════════════════════════════════════════
 */

// ───────────────────────────────────────────────────────────────
//  CONFIG — Spreadsheet IDs (จาก CLAUDE.md)
// ───────────────────────────────────────────────────────────────
const CONFIG = {
  // ⚠️ Fallback token ใช้เฉพาะตอน Settings sheet ยังไม่พร้อม
  //    ค่าจริงอ่านจาก Settings sheet (key: api_token) ใน getApiToken_()
  API_TOKEN_FALLBACK: 'MARVEL-SECRET-TOKEN-2025',

  SHEETS: {
    patients:           '1fycv9S3Y-1lP2Oksa6DZwCn-fywFrhzOkk9qNoGY5BA',
    appointments:       '1utR7rwh7ylKw_osJJqtivmV_VHGRx4R6K58j0mOdZyg',
    treatments:         '1jw3LRXfChip46iKsIdIUjnhT0vwebBDc4vd1LJhgNTc',
    treatment_notes:    '1jw3LRXfChip46iKsIdIUjnhT0vwebBDc4vd1LJhgNTc',
    herbs:              '1h0mMQ_Aic0kCBaTF3NJrpY_Oc3sC3fnUb9gpndGO83I',
    stock_transactions: '1ezsLZPbdFNdWlERmHuFK-8CColwhCuB3WP6vOaxQw4Q',
    finance:            '1Zn52HjTTP7ghlroUxlU_7n9TVRSZWO9WzW2PwBLyHtQ',
    settings:           '19J1hsEMzHSAPuUw8vdnhK7uGqCw4B1xivC-hwBJe0hw',
    users:              '1bpslZW_b31YeONe1iBSjalZwugiTuld8ojyI-iGxvZk'
  },

  // ใช้สร้าง ID อัตโนมัติ
  ID_PREFIX: {
    patients:           { col: 'hn',  prefix: 'HN-',  pad: 6 },
    appointments:       { col: 'id',  prefix: 'APT-', pad: 6 },
    treatments:         { col: 'id',  prefix: 'TRT-', pad: 6 },
    treatment_notes:    { col: 'id',  prefix: 'TNT-', pad: 6 },
    herbs:              { col: 'id',  prefix: 'HRB-', pad: 3 },
    stock_transactions: { col: 'id',  prefix: 'STK-', pad: 6 },
    finance:            { col: 'id',  prefix: 'FIN-', pad: 6 },
    users:              { col: 'id',  prefix: 'USR-', pad: 4 }
    // settings ใช้ key เป็น identifier — ไม่ต้อง generate
  },

  // primary key ที่ใช้ในแต่ละชีต (ใช้ค้นหา/อัปเดต/ลบ)
  PRIMARY_KEY: {
    patients:           'hn',
    appointments:       'id',
    treatments:         'id',
    treatment_notes:    'id',
    herbs:              'id',
    stock_transactions: 'id',
    finance:            'id',
    settings:           'key',
    users:              'id'
  },

  // ชีตที่รองรับ soft delete (มี column is_active)
  SOFT_DELETE: ['patients', 'users', 'appointments', 'herbs']
};


// ═══════════════════════════════════════════════════════════════
//  HTTP HANDLERS
// ═══════════════════════════════════════════════════════════════
function doGet(e)     { return handleRequest(e, 'GET');  }
function doPost(e)    { return handleRequest(e, 'POST'); }
function doOptions(e) {
  // รองรับ CORS preflight request
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

function handleRequest(e, method) {
  try {
    // ── Auth check
    if (!isAuthorized_(e)) {
      return jsonResponse_({ ok: false, error: 'Unauthorized' }, 401);
    }

    const params = e.parameter || {};
    const sheet  = (params.sheet  || '').toLowerCase();
    const action = (params.action || '').toLowerCase();

    if (!sheet || !CONFIG.SHEETS[sheet]) {
      return jsonResponse_({ ok: false, error: 'Invalid or missing sheet name' }, 400);
    }
    if (!action) {
      return jsonResponse_({ ok: false, error: 'Missing action' }, 400);
    }

    // ── Parse body (POST only)
    let body = {};
    if (method === 'POST' && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (err) {
        return jsonResponse_({ ok: false, error: 'Invalid JSON body' }, 400);
      }
    }

    // ── Route
    let result;
    switch (action) {
      case 'list':   result = listRows_(sheet, params);                       break;
      case 'get':    result = getRow_(sheet, params.id);                      break;
      case 'create': result = createRow_(sheet, body);                        break;
      case 'update': result = updateRow_(sheet, body.id || params.id, body);  break;
      case 'delete': result = deleteRow_(sheet, body.id || params.id);        break;
      default:
        return jsonResponse_({ ok: false, error: 'Unknown action: ' + action }, 400);
    }

    return jsonResponse_({ ok: true, sheet: sheet, action: action, data: result }, 200);

  } catch (err) {
    return jsonResponse_({ ok: false, error: err.message, stack: err.stack }, 500);
  }
}


// ═══════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════

/** อ่าน api_token จาก Settings sheet — ไม่ hardcode ใน source */
function getApiToken_() {
  try {
    const ssId = CONFIG.SHEETS['settings'];
    const ss   = SpreadsheetApp.openById(ssId);
    const sheet = ss.getSheetByName('settings') ||
                  ss.getSheetByName('Settings') ||
                  ss.getSheets()[0];
    const values = sheet.getDataRange().getValues();
    // หาแถวที่ key = 'api_token'
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]).trim() === 'api_token') {
        const val = String(values[i][1]).trim();
        if (val) return val;
      }
    }
  } catch (err) {
    // ถ้าอ่าน Settings ไม่ได้ → ใช้ fallback
  }
  return CONFIG.API_TOKEN_FALLBACK;
}

function isAuthorized_(e) {
  // Apps Script Web App ไม่ส่ง Authorization header มาให้ฝั่ง server
  // วิธีที่ใช้งานได้จริง: ส่ง token ใน query string ?token=xxx
  const params = e.parameter || {};

  // 1) query string  ?token=xxx  (วิธีหลัก — ใช้งานได้เสมอ)
  const tokenFromQuery = params.token || '';

  // 2) Authorization header (fallback — อาจไม่ได้รับใน Apps Script)
  let tokenFromHeader = '';
  if (e.headers && e.headers.Authorization) {
    tokenFromHeader = String(e.headers.Authorization).replace(/^Bearer\s+/i, '');
  } else if (e.headers && e.headers.authorization) {
    tokenFromHeader = String(e.headers.authorization).replace(/^Bearer\s+/i, '');
  } else if (params.authorization) {
    tokenFromHeader = String(params.authorization).replace(/^Bearer\s+/i, '');
  }

  const token    = tokenFromQuery || tokenFromHeader;
  const expected = getApiToken_();
  return token === expected;
}


// ═══════════════════════════════════════════════════════════════
//  CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════

/** อ่านข้อมูลทั้งหมดในชีต (รองรับ filter ?key=value) */
function listRows_(sheetName, params) {
  const data = readSheet_(sheetName);
  let rows = data.rows;

  // soft delete: กรองเฉพาะ is_active = TRUE
  if (CONFIG.SOFT_DELETE.indexOf(sheetName) !== -1) {
    rows = rows.filter(r => r.is_active === true || r.is_active === 'TRUE');
  }

  // filter ด้วย query params (ยกเว้น keyword สงวน)
  const reserved = ['sheet', 'action', 'token', 'authorization', 'id', 'limit', 'offset'];
  Object.keys(params).forEach(k => {
    if (reserved.indexOf(k) === -1 && data.headers.indexOf(k) !== -1) {
      const v = String(params[k]).toLowerCase();
      rows = rows.filter(r => String(r[k] || '').toLowerCase().indexOf(v) !== -1);
    }
  });

  // pagination
  const offset = parseInt(params.offset || '0', 10);
  const limit  = parseInt(params.limit  || '0', 10);
  const total  = rows.length;
  if (limit > 0) rows = rows.slice(offset, offset + limit);

  return { total: total, count: rows.length, rows: rows };
}

/** อ่าน 1 record ด้วย primary key */
function getRow_(sheetName, id) {
  if (!id) throw new Error('Missing id');
  const data = readSheet_(sheetName);
  const pk   = CONFIG.PRIMARY_KEY[sheetName];
  const row  = data.rows.find(r => String(r[pk]) === String(id));
  if (!row) throw new Error('Record not found: ' + id);
  return row;
}

/** เพิ่มแถวใหม่ */
function createRow_(sheetName, body) {
  const sheet   = openSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const pk      = CONFIG.PRIMARY_KEY[sheetName];

  // auto-generate ID ถ้ายังไม่มี
  const idCfg = CONFIG.ID_PREFIX[sheetName];
  if (idCfg && !body[idCfg.col]) {
    body[idCfg.col] = generateNextId_(sheet, headers, idCfg);
  }

  // auto-fill timestamps
  const now = new Date();
  if (headers.indexOf('created_at') !== -1 && !body.created_at) body.created_at = now;
  if (headers.indexOf('updated_at') !== -1 && !body.updated_at) body.updated_at = now;
  if (headers.indexOf('is_active')  !== -1 && body.is_active === undefined) body.is_active = true;

  // map body → row array ตาม headers
  const row = headers.map(h => body[h] !== undefined ? body[h] : '');
  sheet.appendRow(row);

  return getRow_(sheetName, body[pk]);
}

/** อัปเดต record */
function updateRow_(sheetName, id, body) {
  if (!id) throw new Error('Missing id');
  const sheet   = openSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const pk      = CONFIG.PRIMARY_KEY[sheetName];
  const pkCol   = headers.indexOf(pk);

  if (pkCol === -1) throw new Error('Primary key column not found: ' + pk);

  const allValues = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < allValues.length; i++) {
    if (String(allValues[i][pkCol]) === String(id)) { rowIndex = i + 1; break; }
  }
  if (rowIndex === -1) throw new Error('Record not found: ' + id);

  // auto-update timestamp
  if (headers.indexOf('updated_at') !== -1) body.updated_at = new Date();

  // อัปเดตทีละ column
  headers.forEach((h, idx) => {
    if (body[h] !== undefined && h !== pk) {
      sheet.getRange(rowIndex, idx + 1).setValue(body[h]);
    }
  });

  return getRow_(sheetName, id);
}

/** ลบ record (soft delete ถ้ามี is_active, ไม่อย่างนั้นลบจริง) */
function deleteRow_(sheetName, id) {
  if (!id) throw new Error('Missing id');
  const sheet   = openSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const pk      = CONFIG.PRIMARY_KEY[sheetName];
  const pkCol   = headers.indexOf(pk);

  if (pkCol === -1) throw new Error('Primary key column not found: ' + pk);

  const allValues = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < allValues.length; i++) {
    if (String(allValues[i][pkCol]) === String(id)) { rowIndex = i + 1; break; }
  }
  if (rowIndex === -1) throw new Error('Record not found: ' + id);

  // Soft delete
  if (CONFIG.SOFT_DELETE.indexOf(sheetName) !== -1 && headers.indexOf('is_active') !== -1) {
    const col = headers.indexOf('is_active') + 1;
    sheet.getRange(rowIndex, col).setValue(false);
    if (headers.indexOf('updated_at') !== -1) {
      sheet.getRange(rowIndex, headers.indexOf('updated_at') + 1).setValue(new Date());
    }
    return { id: id, deleted: 'soft' };
  }

  // Hard delete
  sheet.deleteRow(rowIndex);
  return { id: id, deleted: 'hard' };
}


// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

/** เปิดชีตหลักของ spreadsheet (sheet แรก) */
function openSheet_(sheetName) {
  const ssId = CONFIG.SHEETS[sheetName];
  if (!ssId) throw new Error('Spreadsheet ID not configured: ' + sheetName);
  const ss = SpreadsheetApp.openById(ssId);

  // treatment_notes อยู่ใน Spreadsheet เดียวกับ treatments แต่คนละ tab
  if (sheetName === 'treatment_notes') {
    // ลอง fallback หลายชื่อก่อน สร้างใหม่เฉพาะเมื่อไม่พบเลย
    let sheet = ss.getSheetByName('treatment_notes') ||
                ss.getSheetByName('Treatment Notes')  ||
                ss.getSheetByName('TreatmentNotes');
    if (!sheet) {
      // สร้าง tab ใหม่อัตโนมัติถ้ายังไม่มีเลย
      sheet = ss.insertSheet('treatment_notes');
      sheet.appendRow(['id','treatment_id','patient_id','field_name','content','created_at','updated_at','updated_by']);
    }
    return sheet;
  }

  // ใช้ชีตที่มีชื่อตรงก่อน, ถ้าไม่เจอ → ใช้ชีตแรก
  let sheet = ss.getSheetByName(sheetName) ||
              ss.getSheetByName(sheetName.charAt(0).toUpperCase() + sheetName.slice(1)) ||
              ss.getSheets()[0];
  return sheet;
}

/** ดึง headers (row แรก) */
function getHeaders_(sheet) {
  if (sheet.getLastColumn() === 0) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn())
              .getValues()[0]
              .map(h => String(h).trim());
}

/** อ่านทุก row → array of object */
function readSheet_(sheetName) {
  const sheet = openSheet_(sheetName);
  if (sheet.getLastRow() < 2) return { headers: getHeaders_(sheet), rows: [] };

  const range = sheet.getDataRange().getValues();
  const headers = range[0].map(h => String(h).trim());
  const rows = [];

  for (let i = 1; i < range.length; i++) {
    const obj = {};
    let isEmpty = true;
    for (let j = 0; j < headers.length; j++) {
      let val = range[i][j];
      // แปลง Date object → string ให้ถูก format
      if (val instanceof Date) {
        const h = headers[j];
        // คอลัมน์เวลา (time_start, time_end) → HH:MM
        if (h === 'time_start' || h === 'time_end') {
          const hh = String(val.getHours()).padStart(2,'0');
          const mm = String(val.getMinutes()).padStart(2,'0');
          val = hh + ':' + mm;
        } else {
          // คอลัมน์วันที่ทั่วไป → DD/MM/YYYY
          const y  = val.getFullYear();
          const mo = String(val.getMonth()+1).padStart(2,'0');
          const d  = String(val.getDate()).padStart(2,'0');
          val = d + '/' + mo + '/' + y;
        }
      }
      obj[headers[j]] = val;
      if (val !== '' && val !== null) isEmpty = false;
    }
    if (!isEmpty) rows.push(obj);
  }
  return { headers: headers, rows: rows };
}

/** สร้าง ID ถัดไป โดยดูค่ามากสุดในคอลัมน์ */
function generateNextId_(sheet, headers, idCfg) {
  const colIdx = headers.indexOf(idCfg.col);
  if (colIdx === -1) throw new Error('ID column not found: ' + idCfg.col);

  let maxNum = 0;
  if (sheet.getLastRow() >= 2) {
    const values = sheet.getRange(2, colIdx + 1, sheet.getLastRow() - 1, 1).getValues();
    values.forEach(r => {
      const v = String(r[0] || '');
      if (v.indexOf(idCfg.prefix) === 0) {
        const n = parseInt(v.substring(idCfg.prefix.length), 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    });
  }
  return idCfg.prefix + String(maxNum + 1).padStart(idCfg.pad, '0');
}

/** สร้าง JSON response (Apps Script ไม่รองรับ status code จริง — แต่ใส่ใน body) */
function jsonResponse_(payload, status) {
  payload.status = status || 200;
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}


// ═══════════════════════════════════════════════════════════════
//  TEST FUNCTIONS — รันใน Apps Script editor เพื่อทดสอบโดยตรง
// ═══════════════════════════════════════════════════════════════
function test_listPatients() {
  const r = listRows_('patients', {});
  Logger.log('Total patients: ' + r.total);
  Logger.log(JSON.stringify(r.rows.slice(0, 3), null, 2));
}

function test_listHerbs() {
  const r = listRows_('herbs', {});
  Logger.log('Total herbs: ' + r.total);
}

function test_getPatient() {
  const r = getRow_('patients', 'HN-000001');
  Logger.log(JSON.stringify(r, null, 2));
}

function test_createAppointment() {
  const r = createRow_('appointments', {
    patient_id:     'HN-000001',
    patient_name:   'Tony Stark',
    date:           '2025-05-20',
    time_start:     '10:00',
    time_end:       '11:00',
    doctor:         'Dr. Stephen Strange',
    treatment_type: 'นวดแผนไทย',
    note:           'ทดสอบสร้างนัด',
    status:         'pending',
    room:           1
  });
  Logger.log(JSON.stringify(r, null, 2));
}

function test_verifyAllSheets() {
  Object.keys(CONFIG.SHEETS).forEach(name => {
    try {
      const sheet = openSheet_(name);
      const headers = getHeaders_(sheet);
      const lastRow = sheet.getLastRow();
      Logger.log('✓ ' + name + '  rows=' + (lastRow - 1) + '  cols=' + headers.length);
    } catch (err) {
      Logger.log('✗ ' + name + '  ERROR: ' + err.message);
    }
  });
}
