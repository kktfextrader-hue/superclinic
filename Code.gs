/**
 * ════════════════════════════════════════════════════════════════
 *  Superclinic — Google Apps Script REST API
 *  Version  : 2.0  (security + concurrency + timezone hardening)
 *  Author   : Dr. Stephen Strange (Superclinic)
 *  Updated  : 2026-06-01
 * ════════════════════════════════════════════════════════════════
 *
 *  วิธีใช้งาน (Quick Setup):
 *    1) เปิด script.google.com → New Project → วาง Code.gs นี้ทั้งหมด
 *    2) แก้ค่า API_TOKEN ในชีต settings ให้ตรงกับ CONFIG.API_TOKEN ด้านล่าง
 *    3) Deploy → New deployment → Web app
 *         - Execute as : Me
 *         - Who has access : Anyone
 *    4) Copy URL ที่ได้ ใส่ใน superclinic.html (constant API_URL)
 *    5) ทดสอบด้วย:
 *         GET  {URL}?sheet=patients&action=list&token=<TOKEN>
 *         POST {URL}?sheet=patients&action=create  (body: JSON, Content-Type: text/plain)
 *
 *  Endpoints:
 *    GET  ?sheet=<name>&action=list
 *    GET  ?sheet=<name>&action=get&id=<id>
 *    POST ?sheet=<name>&action=create   { ...fields }
 *    POST ?sheet=<name>&action=update   { id, ...fields }
 *    POST ?sheet=<name>&action=delete   { id }            ← Soft delete
 *
 *  v2.0 changes:
 *    - LockService ครอบทุก write (กัน HN/APT ชนกัน)
 *    - soft-delete normalize (boolean/string FALSE → ถือว่าลบ)
 *    - timezone: serialize เวลา/วันที่ด้วย timezone ของ spreadsheet (กัน B05)
 *    - filter exact match (กัน HN-1 ชน HN-10)
 *    - ไม่ส่ง stack trace กลับ client + redact api_token
 *    - cache api_token (ลด quota)
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
  SOFT_DELETE: ['patients', 'users', 'appointments', 'herbs'],

  // คอลัมน์เวลา (เก็บเป็น text HH:MM เสมอ — ห้ามให้ Sheets แปลงเป็น Date)
  TIME_COLS: ['time_start', 'time_end'],

  // settings keys ที่ห้ามอ่าน/เขียนผ่าน API (ความปลอดภัย)
  PROTECTED_SETTINGS: ['api_token']
};


// ═══════════════════════════════════════════════════════════════
//  HTTP HANDLERS
// ═══════════════════════════════════════════════════════════════
function doGet(e)     { return handleRequest(e, 'GET');  }
function doPost(e)    { return handleRequest(e, 'POST'); }
function doOptions(e) {
  // หมายเหตุ: Apps Script ContentService ตั้ง CORS header เองไม่ได้
  // client จึงต้องส่ง Content-Type: text/plain (simple request) เพื่อเลี่ยง preflight
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
    //    read = ไม่ต้อง lock | write = ครอบด้วย LockService กัน race condition
    let result;
    switch (action) {
      case 'list':   result = listRows_(sheet, params);                                    break;
      case 'get':    result = getRow_(sheet, params.id);                                    break;
      case 'create': result = withLock_(() => createRow_(sheet, body));                     break;
      case 'update': result = withLock_(() => updateRow_(sheet, body.id || params.id, body)); break;
      case 'delete': result = withLock_(() => deleteRow_(sheet, body.id || params.id));     break;
      case 'notify': result = handleLineNotify_(body);                                      break;
      default:
        return jsonResponse_({ ok: false, error: 'Unknown action: ' + action }, 400);
    }

    return jsonResponse_({ ok: true, sheet: sheet, action: action, data: result }, 200);

  } catch (err) {
    // ❗ ไม่ส่ง stack trace กลับ client (information disclosure) — log ฝั่ง server แทน
    try { console.error('[Superclinic API] ' + (err && err.stack ? err.stack : err)); } catch (_) {}
    return jsonResponse_({ ok: false, error: (err && err.message) ? err.message : 'Internal error' }, 500);
  }
}


// ═══════════════════════════════════════════════════════════════
//  CONCURRENCY — LockService กัน race condition (HN/APT ชนกัน)
// ═══════════════════════════════════════════════════════════════
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // รอ lock สูงสุด 15 วิ
  } catch (e) {
    throw new Error('ระบบกำลังถูกใช้งานพร้อมกัน กรุณาลองใหม่อีกครั้ง');
  }
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}


// ═══════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════

/** อ่าน api_token จาก Settings sheet (cache 5 นาที ลด quota) */
function getApiToken_() {
  // 1) ลองอ่านจาก cache ก่อน
  try {
    const cache  = CacheService.getScriptCache();
    const cached = cache.get('api_token');
    if (cached) return cached;
  } catch (_) {}

  // 2) อ่านจาก Settings sheet
  let token = CONFIG.API_TOKEN_FALLBACK;
  try {
    const ss    = SpreadsheetApp.openById(CONFIG.SHEETS['settings']);
    const sheet = ss.getSheetByName('settings') ||
                  ss.getSheetByName('Settings') ||
                  ss.getSheets()[0];
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]).trim() === 'api_token') {
        const val = String(values[i][1]).trim();
        if (val) { token = val; break; }
      }
    }
  } catch (err) {
    // อ่าน Settings ไม่ได้ → ใช้ fallback
  }

  // 3) เก็บ cache
  try { CacheService.getScriptCache().put('api_token', token, 300); } catch (_) {}
  return token;
}

/** เปรียบเทียบ token แบบ constant-time (กัน timing attack) */
function safeEqual_(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  return diff === 0;
}

function isAuthorized_(e) {
  // Apps Script Web App ไม่ส่ง Authorization header มาให้ฝั่ง server เสมอ
  // วิธีหลัก: ส่ง token ใน query string ?token=xxx
  const params = e.parameter || {};
  const tokenFromQuery = params.token || '';

  // Authorization header (fallback — อาจไม่ได้รับใน Apps Script)
  let tokenFromHeader = '';
  if (e.headers && e.headers.Authorization) {
    tokenFromHeader = String(e.headers.Authorization).replace(/^Bearer\s+/i, '');
  } else if (e.headers && e.headers.authorization) {
    tokenFromHeader = String(e.headers.authorization).replace(/^Bearer\s+/i, '');
  } else if (params.authorization) {
    tokenFromHeader = String(params.authorization).replace(/^Bearer\s+/i, '');
  }

  const token = tokenFromQuery || tokenFromHeader;
  return safeEqual_(token, getApiToken_());
}


// ═══════════════════════════════════════════════════════════════
//  HELPERS — normalize values
// ═══════════════════════════════════════════════════════════════

/** ตรวจว่า row ถูก soft-delete แล้วหรือยัง (รองรับทั้ง boolean false และ string 'FALSE') */
function isDeleted_(v) {
  if (v === false) return true;
  const s = String(v).trim().toUpperCase();
  return s === 'FALSE' || s === '0' || s === 'NO';
}


// ═══════════════════════════════════════════════════════════════
//  CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════

/** อ่านข้อมูลทั้งหมดในชีต (รองรับ filter ?key=value แบบ exact match) */
function listRows_(sheetName, params) {
  const data = readSheet_(sheetName);
  let rows = data.rows;

  // soft delete: ซ่อน row ที่ถูกลบ (รองรับทั้ง boolean false และ string 'FALSE')
  if (CONFIG.SOFT_DELETE.indexOf(sheetName) !== -1) {
    rows = rows.filter(r => !isDeleted_(r.is_active));
  }

  // filter ด้วย query params — EXACT match (กัน HN-1 ชน HN-10)
  const reserved = ['sheet', 'action', 'token', 'authorization', 'id', 'limit', 'offset'];
  Object.keys(params).forEach(k => {
    if (reserved.indexOf(k) === -1 && data.headers.indexOf(k) !== -1) {
      const v = String(params[k]).toLowerCase();
      rows = rows.filter(r => String(r[k] == null ? '' : r[k]).toLowerCase() === v);
    }
  });

  // ความปลอดภัย: redact api_token ออกจากผล settings
  if (sheetName === 'settings') rows = redactSettings_(rows);

  // pagination (กัน NaN / ค่าติดลบ)
  const offset = Math.max(0, parseInt(params.offset || '0', 10) || 0);
  const limit  = Math.max(0, parseInt(params.limit  || '0', 10) || 0);
  const total  = rows.length;
  if (limit > 0) rows = rows.slice(offset, offset + limit);

  return { total: total, count: rows.length, rows: rows };
}

/** อ่าน 1 record ด้วย primary key */
function getRow_(sheetName, id) {
  if (!id) throw new Error('Missing id');
  // ความปลอดภัย: ห้ามอ่าน setting ที่สงวนไว้ผ่าน API
  if (sheetName === 'settings' && CONFIG.PROTECTED_SETTINGS.indexOf(String(id)) !== -1) {
    throw new Error('Access denied');
  }
  const data = readSheet_(sheetName);
  const pk   = CONFIG.PRIMARY_KEY[sheetName];
  const row  = data.rows.find(r => String(r[pk]) === String(id));
  if (!row) throw new Error('Record not found: ' + id);
  return row;
}

/** เพิ่มแถวใหม่ (ต้องเรียกภายใน withLock_) */
function createRow_(sheetName, body) {
  // ความปลอดภัย: ห้ามสร้าง/แก้ setting ที่สงวนไว้ผ่าน API
  guardProtectedSetting_(sheetName, body[CONFIG.PRIMARY_KEY[sheetName]]);

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

  // จับ row index ทันทีหลัง append (ปลอดภัยเพราะอยู่ใน lock)
  const newRowIndex = sheet.getLastRow();

  // force time columns เป็น plain text ป้องกัน Sheets แปลงเป็น Date
  CONFIG.TIME_COLS.forEach(f => {
    const ci = headers.indexOf(f);
    if (ci !== -1 && body[f] !== undefined && body[f] !== '') {
      const cell = sheet.getRange(newRowIndex, ci + 1);
      cell.setNumberFormat('@STRING@');
      cell.setValue(String(body[f]));
    }
  });

  // คืน record ที่เพิ่งสร้าง (ถ้ามี pk) ไม่งั้นคืน body
  if (body[pk] !== undefined && body[pk] !== '') {
    return getRow_(sheetName, body[pk]);
  }
  return body;
}

/** อัปเดต record (ต้องเรียกภายใน withLock_) */
function updateRow_(sheetName, id, body) {
  if (!id) throw new Error('Missing id');
  guardProtectedSetting_(sheetName, id);

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
      const cell = sheet.getRange(rowIndex, idx + 1);
      // force time columns เป็น plain text ป้องกัน Sheets แปลงเป็น Date
      if (CONFIG.TIME_COLS.indexOf(h) !== -1) {
        cell.setNumberFormat('@STRING@');
        cell.setValue(String(body[h]));
      } else {
        cell.setValue(body[h]);
      }
    }
  });

  return getRow_(sheetName, id);
}

/** ลบ record (soft delete ถ้ามี is_active, ไม่อย่างนั้นลบจริง) (ต้องเรียกภายใน withLock_) */
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

  // Soft delete — เขียน string 'FALSE' (รูปแบบเดียวกับที่ client ใช้) เพื่อความสม่ำเสมอ
  if (CONFIG.SOFT_DELETE.indexOf(sheetName) !== -1 && headers.indexOf('is_active') !== -1) {
    const col  = headers.indexOf('is_active') + 1;
    const cell = sheet.getRange(rowIndex, col);
    cell.setNumberFormat('@STRING@');
    cell.setValue('FALSE');
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
//  SECURITY HELPERS
// ═══════════════════════════════════════════════════════════════

/** กันการเขียนทับ setting ที่สงวนไว้ (เช่น api_token) ผ่าน API */
function guardProtectedSetting_(sheetName, key) {
  if (sheetName === 'settings' && key != null &&
      CONFIG.PROTECTED_SETTINGS.indexOf(String(key)) !== -1) {
    throw new Error('Access denied: protected setting');
  }
}

/** ลบค่าของ setting ที่สงวนไว้ออกจากผลลัพธ์ (ไม่ให้หลุดออกไป client) */
function redactSettings_(rows) {
  return rows.filter(r => CONFIG.PROTECTED_SETTINGS.indexOf(String(r.key)) === -1);
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
    let sheet = ss.getSheetByName('treatment_notes') ||
                ss.getSheetByName('Treatment Notes')  ||
                ss.getSheetByName('TreatmentNotes');
    if (!sheet) {
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

  // timezone ของ spreadsheet — ใช้ format วันที่/เวลาให้ตรงกับที่แสดงในชีต (กัน B05)
  let tz = 'Asia/Bangkok';
  try { tz = sheet.getParent().getSpreadsheetTimeZone() || 'Asia/Bangkok'; } catch (_) {}

  const range = sheet.getDataRange().getValues();
  const headers = range[0].map(h => String(h).trim());
  const rows = [];

  for (let i = 1; i < range.length; i++) {
    const obj = {};
    let isEmpty = true;
    for (let j = 0; j < headers.length; j++) {
      let val = range[i][j];
      // แปลง Date object → string ตาม timezone ของ spreadsheet (ไม่ใช่ UTC/script tz)
      if (val instanceof Date) {
        const h = headers[j];
        if (CONFIG.TIME_COLS.indexOf(h) !== -1) {
          // คอลัมน์เวลา → HH:MM ตาม timezone ที่ผู้ใช้กรอก
          val = Utilities.formatDate(val, tz, 'HH:mm');
        } else {
          // คอลัมน์วันที่ทั่วไป → DD/MM/YYYY (ค.ศ.)
          val = Utilities.formatDate(val, tz, 'dd/MM/yyyy');
        }
      }
      obj[headers[j]] = val;
      if (val !== '' && val !== null) isEmpty = false;
    }
    if (!isEmpty) rows.push(obj);
  }
  return { headers: headers, rows: rows };
}

/** สร้าง ID ถัดไป โดยดูค่ามากสุดในคอลัมน์ (ต้องเรียกภายใน withLock_) */
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

/** สร้าง JSON response (Apps Script ไม่รองรับ HTTP status จริง — ใส่ใน body) */
function jsonResponse_(payload, status) {
  payload.status = status || 200;
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}


// ═══════════════════════════════════════════════════════════════
//  LINE NOTIFY
//  ⚠️ หมายเหตุ: LINE Notify ถูกยกเลิกบริการแล้ว (31 มี.ค. 2025)
//     ฟังก์ชันนี้คงไว้เพื่อ backward-compat — แนะนำย้ายไป LINE Messaging API
// ═══════════════════════════════════════════════════════════════

function getLineToken_() {
  try {
    const data = readSheet_('settings');
    const row  = data.rows.find(r => String(r.key).trim() === 'line_notify_token');
    if (row && row.value) return String(row.value).trim();
  } catch (e) {}
  return '';
}

function handleLineNotify_(body) {
  const token = body.token || getLineToken_();
  if (!token) throw new Error('ไม่พบ LINE Notify Token — กรุณาตั้งค่าใน หน้าตั้งค่าระบบ');
  const msg = body.message || '📢 แจ้งเตือนจาก Superclinic';
  return sendLineNotify_(token, msg);
}

function sendLineNotify_(token, message) {
  const url = 'https://notify-api.line.me/api/notify';
  const options = {
    method:  'post',
    headers: { 'Authorization': 'Bearer ' + token },
    payload: 'message=' + encodeURIComponent(message),
    muteHttpExceptions: true
  };
  const res  = UrlFetchApp.fetch(url, options);
  const code = res.getResponseCode();
  const txt  = res.getContentText();
  if (code !== 200) throw new Error('LINE Notify error ' + code + ': ' + txt);
  return { sent: true, status: code, message: message };
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
  const r = withLock_(() => createRow_('appointments', {
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
  }));
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

/** ทดสอบ timezone serialize เวลา/วันที่ */
function test_timezone() {
  const r = listRows_('appointments', { limit: '5' });
  r.rows.forEach(a => Logger.log(a.id + ' | date=' + a.date + ' | time=' + a.time_start));
}
