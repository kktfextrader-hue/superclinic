/**
 * ════════════════════════════════════════════════════════════════
 *  Superclinic — Google Apps Script REST API
 *  Version  : 3.0  (REBRAND: single-spreadsheet DB + token ใหม่)
 *  Author   : Dr. Stephen Strange (Superclinic)
 *  Updated  : 2026-06-01
 * ════════════════════════════════════════════════════════════════
 *
 *  สถาปัตยกรรมใหม่ v3.0:
 *    - ใช้ Spreadsheet เดียว ("Superclinic Database") มี 9 แท็บ
 *      → SHEET_ID เก็บใน ScriptProperties (key: SHEET_ID)
 *    - สร้าง DB อัตโนมัติด้วย:  GET ?action=setup&token=<TOKEN>
 *    - token ใหม่ (แยกจาก Marvel เดิม) อยู่ใน API_TOKEN_FALLBACK + settings tab
 *
 *  Setup ครั้งแรก:
 *    1) clasp push && clasp deploy --deploymentId <id>
 *    2) เปิด URL:  {EXEC_URL}?action=setup&token=<TOKEN>
 *       → สร้าง Superclinic Database + seed settings + คืน sheetId
 *    3) เสร็จ — ทุก endpoint ใช้งานได้ทันที
 *
 *  Endpoints:
 *    GET  ?action=setup                          ← สร้าง DB ครั้งแรก
 *    GET  ?sheet=<name>&action=list
 *    GET  ?sheet=<name>&action=get&id=<id>
 *    POST ?sheet=<name>&action=create   { ...fields }
 *    POST ?sheet=<name>&action=update   { id, ...fields }
 *    POST ?sheet=<name>&action=delete   { id }            ← Soft delete
 *
 *  คงไว้จาก v2.x: LockService, soft-delete normalize, exact-match filter,
 *    timezone Asia/Bangkok, redact api_token, cache token, safeEqual
 * ════════════════════════════════════════════════════════════════
 */

// ───────────────────────────────────────────────────────────────
//  TIMEZONE
// ───────────────────────────────────────────────────────────────
const TZ = 'Asia/Bangkok'; // UTC+7

// ───────────────────────────────────────────────────────────────
//  CONFIG
// ───────────────────────────────────────────────────────────────
const CONFIG = {
  // 🔑 Token ใหม่ของ Superclinic (แยกจาก Marvel เดิมที่หลุดใน public repo)
  //    ค่าจริงอ่านจาก settings tab (key: api_token) — ค่านี้ใช้เป็น fallback + seed
  API_TOKEN_FALLBACK: 'SCL-Tx7Kq9F-mP2rW4nZ-2026',

  // ชื่อไฟล์ Spreadsheet ที่จะสร้าง
  DB_NAME: 'Superclinic Database',

  // logical sheet name → tab name (แท็บใน Spreadsheet เดียว)
  TABS: {
    patients:           'patients',
    appointments:       'appointments',
    treatments:         'treatments',
    treatment_notes:    'treatment_notes',
    herbs:              'herbs',
    stock_transactions: 'stock_transactions',
    finance:            'finance',
    settings:           'settings',
    users:              'users'
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
  },

  // primary key
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

  // คอลัมน์เวลา (เก็บเป็น text HH:MM เสมอ)
  TIME_COLS: ['time_start', 'time_end'],

  // settings keys ที่ห้ามอ่าน/เขียนผ่าน API
  PROTECTED_SETTINGS: ['api_token'],

  // ── Schema: header ของแต่ละ tab (ตรงกับ Marvel เดิม + เพิ่ม is_active ให้ soft-delete ครบ) ──
  SCHEMA: {
    patients: ['id','hn','prefix','first_name','last_name','dob','age','gender','phone','email',
               'address','blood_type','element','allergy','chronic_disease','patient_type',
               'emergency_contact','created_at','updated_at','is_active','body_map','face_descriptor'],
    appointments: ['id','patient_id','patient_name','date','time_start','time_end','doctor',
                   'treatment_type','note','status','room','created_at','updated_at','is_active'],
    treatments: ['id','patient_id','appointment_id','date','treatment_type','duration_min','doctor',
                 'symptoms','diagnosis','procedure','herbs_used','result','advice','price',
                 'next_appointment','created_at','updated_at'],
    treatment_notes: ['id','treatment_id','patient_id','field_name','content','created_at','updated_at','updated_by'],
    herbs: ['id','name_th','name_en','name_sci','category','unit','quantity','min_quantity',
            'cost_per_unit','supplier','status','description','สรรพคุณ','is_active','created_at','updated_at'],
    stock_transactions: ['id','herb_id','herb_name','type','quantity','reason','reference_id',
                         'price','note','created_by','created_at'],
    finance: ['id','date','type','category','amount','description','reference_id','payment_method',
              'receipt_no','created_by','created_at'],
    settings: ['key','value','description','updated_at'],
    users: ['id','name','role','email','is_active','created_at','updated_at']
  }
};


// ═══════════════════════════════════════════════════════════════
//  TIMEZONE HELPER
// ═══════════════════════════════════════════════════════════════
function nowBKK_() {
  return Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm');
}


// ═══════════════════════════════════════════════════════════════
//  DATABASE ID (ScriptProperties)
// ═══════════════════════════════════════════════════════════════
function getDbId_() {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) throw new Error('ยังไม่ได้สร้างฐานข้อมูล — เรียก ?action=setup&token=<TOKEN> ก่อน');
  return id;
}


// ═══════════════════════════════════════════════════════════════
//  HTTP HANDLERS
// ═══════════════════════════════════════════════════════════════
function doGet(e)     { return handleRequest(e, 'GET');  }
function doPost(e)    { return handleRequest(e, 'POST'); }
function doOptions(e) {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}

function handleRequest(e, method) {
  try {
    if (!isAuthorized_(e)) {
      return jsonResponse_({ ok: false, error: 'Unauthorized' }, 401);
    }

    const params = e.parameter || {};
    const action = (params.action || '').toLowerCase();

    // ── action=setup: สร้างฐานข้อมูลครั้งแรก (ไม่ต้องมี sheet param) ──
    if (action === 'setup') {
      const r = withLock_(() => setupDatabase_());
      return jsonResponse_({ ok: true, action: 'setup', data: r }, 200);
    }

    // ── action=migrate: ย้ายข้อมูลจาก Marvel DB + remap HN (one-time) ──
    if (action === 'migrate') {
      const r = withLock_(() => migrateFromMarvel_());
      return jsonResponse_({ ok: true, action: 'migrate', data: r }, 200);
    }

    const sheet = (params.sheet || '').toLowerCase();
    if (!sheet || !CONFIG.TABS[sheet]) {
      return jsonResponse_({ ok: false, error: 'Invalid or missing sheet name' }, 400);
    }
    if (!action) {
      return jsonResponse_({ ok: false, error: 'Missing action' }, 400);
    }

    let body = {};
    if (method === 'POST' && e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); }
      catch (err) { return jsonResponse_({ ok: false, error: 'Invalid JSON body' }, 400); }
    }

    let result;
    switch (action) {
      case 'list':   result = listRows_(sheet, params);                                       break;
      case 'get':    result = getRow_(sheet, params.id);                                       break;
      case 'create': result = withLock_(() => createRow_(sheet, body));                        break;
      case 'update': result = withLock_(() => updateRow_(sheet, body.id || params.id, body));  break;
      case 'delete': result = withLock_(() => deleteRow_(sheet, body.id || params.id));        break;
      case 'notify': result = handleLineNotify_(body);                                         break;
      default:
        return jsonResponse_({ ok: false, error: 'Unknown action: ' + action }, 400);
    }

    return jsonResponse_({ ok: true, sheet: sheet, action: action, data: result }, 200);

  } catch (err) {
    try { console.error('[Superclinic API] ' + (err && err.stack ? err.stack : err)); } catch (_) {}
    return jsonResponse_({ ok: false, error: (err && err.message) ? err.message : 'Internal error' }, 500);
  }
}


// ═══════════════════════════════════════════════════════════════
//  SETUP — สร้างฐานข้อมูล Superclinic ครั้งแรก
// ═══════════════════════════════════════════════════════════════
function setupDatabase_() {
  const props = PropertiesService.getScriptProperties();
  const existing = props.getProperty('SHEET_ID');
  if (existing) {
    return { already: true, sheetId: existing,
             url: 'https://docs.google.com/spreadsheets/d/' + existing };
  }

  // สร้าง Spreadsheet ใหม่
  const ss = SpreadsheetApp.create(CONFIG.DB_NAME);
  const id = ss.getId();
  ss.setSpreadsheetTimeZone(TZ);

  // สร้างแต่ละ tab + header
  const names = Object.keys(CONFIG.SCHEMA);
  names.forEach((tab, idx) => {
    let sh;
    if (idx === 0) {
      sh = ss.getSheets()[0];
      sh.setName(tab);
    } else {
      sh = ss.insertSheet(tab);
    }
    const headers = CONFIG.SCHEMA[tab];
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  });

  // ── seed: settings ──
  const stamp = nowBKK_();
  const settingsRows = [
    ['api_token',        CONFIG.API_TOKEN_FALLBACK, 'API token (ห้ามเปิดเผย)', stamp],
    ['finance_password', '123456',                  'รหัสผ่านหน้าการเงิน',      stamp],
    ['herb_stock_value', '0',                       'มูลค่าสต็อกยารวม (บาท)',   stamp],
    ['clinic_name',      'Superclinic',             'ชื่อคลินิก',               stamp],
    ['line_notify_token','',                        'LINE token (deprecated)',  stamp]
  ];
  ss.getSheetByName('settings')
    .getRange(2, 1, settingsRows.length, 4).setValues(settingsRows);

  // ── seed: admin user ──
  ss.getSheetByName('users')
    .getRange(2, 1, 1, CONFIG.SCHEMA.users.length)
    .setValues([['USR-0001','ผู้ดูแลระบบ','admin','admin@superclinic.local','TRUE', stamp, stamp]]);

  // ── seed: ยาสมุนไพรตัวอย่าง 3 รายการ (ให้หน้าสต็อกไม่ว่าง) ──
  const herbsTab = ss.getSheetByName('herbs');
  const herbSeed = [
    ['HRB-001','ฟ้าทะลายโจร','Andrographis','Andrographis paniculata','สมุนไพรเดี่ยว','แคปซูล','100','20','3','-','เพียงพอ','แก้ไข้ เจ็บคอ','ลดไข้ แก้หวัด','TRUE',stamp,stamp],
    ['HRB-002','ขมิ้นชัน','Turmeric','Curcuma longa','สมุนไพรเดี่ยว','แคปซูล','80','20','2.5','-','เพียงพอ','บำรุงกระเพาะ','แก้ท้องอืด',  'TRUE',stamp,stamp],
    ['HRB-003','ขิง','Ginger','Zingiber officinale','สมุนไพรเดี่ยว','กรัม','500','100','0.5','-','เพียงพอ','ขับลม','แก้คลื่นไส้',       'TRUE',stamp,stamp]
  ];
  herbsTab.getRange(2, 1, herbSeed.length, herbSeed[0].length).setValues(herbSeed);

  // เก็บ SHEET_ID + ล้าง cache token เก่า
  props.setProperty('SHEET_ID', id);
  try { CacheService.getScriptCache().remove('api_token'); } catch (_) {}

  return { created: true, sheetId: id, url: ss.getUrl(), tabs: names };
}


// ═══════════════════════════════════════════════════════════════
//  MIGRATION — ย้ายจาก Marvel DB เดิม + remap HN เป็น HN-000001...
//  (one-time; เรียก ?action=migrate&token=<TOKEN>)
// ═══════════════════════════════════════════════════════════════
const MARVEL_IDS = {
  patients:     '1fycv9S3Y-1lP2Oksa6DZwCn-fywFrhzOkk9qNoGY5BA',
  appointments: '1utR7rwh7ylKw_osJJqtivmV_VHGRx4R6K58j0mOdZyg',
  treatments:   '1jw3LRXfChip46iKsIdIUjnhT0vwebBDc4vd1LJhgNTc'
};

/** อ่านข้อมูลจาก Marvel spreadsheet (แปลง Date → string ตาม TZ) */
function migrateReadMarvel_(ssId, preferName) {
  const ss = SpreadsheetApp.openById(ssId);
  const sh = ss.getSheetByName(preferName) || ss.getSheets()[0];
  if (sh.getLastRow() < 2) return [];
  const v = sh.getDataRange().getValues();
  const H = v[0].map(x => String(x).trim());
  const rows = [];
  for (let i = 1; i < v.length; i++) {
    const o = {}; let empty = true;
    for (let j = 0; j < H.length; j++) {
      let val = v[i][j];
      if (val instanceof Date) {
        if (H[j] === 'time_start' || H[j] === 'time_end') val = Utilities.formatDate(val, TZ, 'HH:mm');
        else if (H[j] === 'created_at' || H[j] === 'updated_at') val = Utilities.formatDate(val, TZ, 'dd/MM/yyyy HH:mm');
        else val = Utilities.formatDate(val, TZ, 'dd/MM/yyyy');
      }
      o[H[j]] = val;
      if (val !== '' && val !== null) empty = false;
    }
    if (!empty) rows.push(o);
  }
  return rows;
}

/** ล้างข้อมูล (เก็บ header) */
function migrateClearData_(tab) {
  const last = tab.getLastRow();
  if (last >= 2) tab.getRange(2, 1, last - 1, tab.getLastColumn()).clearContent();
}

/** เขียนข้อมูลตาม schema (force time cols เป็น text) */
function migrateWrite_(tab, schema, rows) {
  if (!rows.length) return 0;
  CONFIG.TIME_COLS.forEach(c => {
    const ci = schema.indexOf(c);
    if (ci !== -1) tab.getRange(2, ci + 1, rows.length, 1).setNumberFormat('@STRING@');
  });
  const out = rows.map(r => schema.map(h => (r[h] !== undefined && r[h] !== null) ? r[h] : ''));
  tab.getRange(2, 1, out.length, schema.length).setValues(out);
  return out.length;
}

/** normalize ชื่อสำหรับจับคู่ (lowercase + ยุบ space) */
function migrateNameKey_(s) {
  return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function migrateFromMarvel_() {
  const db = SpreadsheetApp.openById(getDbId_());

  // 1) patients — remap HN ตามลำดับแถว → HN-000001, HN-000002...
  const mp = migrateReadMarvel_(MARVEL_IDS.patients, 'patients')
              .filter(r => !isDeleted_(r.is_active));
  const mapHN   = {}; // oldHN/oldId → newHN
  const mapName = {}; // nameKey → newHN  (เผื่อ appointments อ้างด้วยชื่อ)
  let n = 0;
  mp.forEach(r => {
    n++;
    const newHN = 'HN-' + String(n).padStart(6, '0');
    [r.hn, r.id].forEach(k => { const o = String(k || '').trim(); if (o) mapHN[o] = newHN; });
    // name keys: "ชื่อเต็ม นามสกุล" และ "ชื่อแรก นามสกุล"
    const fn = String(r.first_name || '').trim();
    const ln = String(r.last_name || '').trim();
    if (fn || ln) {
      mapName[migrateNameKey_(fn + ' ' + ln)] = newHN;
      mapName[migrateNameKey_(fn.split(' ')[0] + ' ' + ln)] = newHN;
    }
    r.hn = newHN;
    r.id = newHN; // compat กับ frontend ที่อ้าง p.id
  });
  const patTab = db.getSheetByName('patients');
  migrateClearData_(patTab);
  const cntP = migrateWrite_(patTab, CONFIG.SCHEMA.patients, mp);

  const resolvePid = (pid, pname) => {
    const o = String(pid || '').trim();
    if (mapHN[o]) return mapHN[o];
    const nk = migrateNameKey_(pname);
    if (nk && mapName[nk]) return mapName[nk];
    return o; // หาไม่เจอ → คงค่าเดิม
  };

  // 2) appointments — remap patient_id (ลอง HN ก่อน, ไม่เจอใช้ชื่อ)
  const ma = migrateReadMarvel_(MARVEL_IDS.appointments, 'appointments');
  const apptToPid = {}; // appointmentId → newPid (ใช้ link treatments)
  let remapA = 0;
  ma.forEach(r => {
    const np = resolvePid(r.patient_id, r.patient_name);
    if (np !== String(r.patient_id || '').trim()) remapA++;
    r.patient_id = np;
    if (r.id) apptToPid[String(r.id).trim()] = np;
  });
  const apTab = db.getSheetByName('appointments');
  migrateClearData_(apTab);
  const cntA = migrateWrite_(apTab, CONFIG.SCHEMA.appointments, ma);

  // 3) treatments — remap patient_id (HN → ผ่าน appointment_id → คงเดิม)
  const mt = migrateReadMarvel_(MARVEL_IDS.treatments, 'treatments');
  let remapT = 0;
  mt.forEach(r => {
    const o = String(r.patient_id || '').trim();
    let np = mapHN[o] || apptToPid[String(r.appointment_id || '').trim()] || o;
    if (np !== o) remapT++;
    r.patient_id = np;
  });
  const trTab = db.getSheetByName('treatments');
  migrateClearData_(trTab);
  const cntT = migrateWrite_(trTab, CONFIG.SCHEMA.treatments, mt);

  try { CacheService.getScriptCache().remove('api_token'); } catch (_) {}
  return { patients: cntP, appointments: cntA, appointmentsRemapped: remapA,
           treatments: cntT, treatmentsRemapped: remapT, hnCount: n };
}

/** รันใน editor (ทางเลือกแทน ?action=migrate) */
function adminMigrate() {
  Logger.log(JSON.stringify(migrateFromMarvel_(), null, 2));
}


// ═══════════════════════════════════════════════════════════════
//  CONCURRENCY
// ═══════════════════════════════════════════════════════════════
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(15000); }
  catch (e) { throw new Error('ระบบกำลังถูกใช้งานพร้อมกัน กรุณาลองใหม่อีกครั้ง'); }
  try { return fn(); }
  finally { lock.releaseLock(); }
}


// ═══════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════
function getApiToken_() {
  try {
    const cached = CacheService.getScriptCache().get('api_token');
    if (cached) return cached;
  } catch (_) {}

  let token = CONFIG.API_TOKEN_FALLBACK;
  try {
    // อ่านจาก settings tab (ถ้า DB สร้างแล้ว)
    const ss    = SpreadsheetApp.openById(getDbId_());
    const sheet = ss.getSheetByName('settings');
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]).trim() === 'api_token') {
        const val = String(values[i][1]).trim();
        if (val) { token = val; break; }
      }
    }
  } catch (err) {
    // DB ยังไม่ถูกสร้าง → ใช้ fallback (token ใหม่)
  }

  try { CacheService.getScriptCache().put('api_token', token, 300); } catch (_) {}
  return token;
}

function safeEqual_(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  return diff === 0;
}

function isAuthorized_(e) {
  const params = e.parameter || {};
  const tokenFromQuery = params.token || '';
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
//  HELPERS — normalize
// ═══════════════════════════════════════════════════════════════
function isDeleted_(v) {
  if (v === false) return true;
  const s = String(v).trim().toUpperCase();
  return s === 'FALSE' || s === '0' || s === 'NO';
}


// ═══════════════════════════════════════════════════════════════
//  CRUD
// ═══════════════════════════════════════════════════════════════
function listRows_(sheetName, params) {
  const data = readSheet_(sheetName);
  let rows = data.rows;

  if (CONFIG.SOFT_DELETE.indexOf(sheetName) !== -1) {
    rows = rows.filter(r => !isDeleted_(r.is_active));
  }

  const reserved = ['sheet', 'action', 'token', 'authorization', 'id', 'limit', 'offset'];
  Object.keys(params).forEach(k => {
    if (reserved.indexOf(k) === -1 && data.headers.indexOf(k) !== -1) {
      const v = String(params[k]).toLowerCase();
      rows = rows.filter(r => String(r[k] == null ? '' : r[k]).toLowerCase() === v);
    }
  });

  if (sheetName === 'settings') rows = redactSettings_(rows);

  const offset = Math.max(0, parseInt(params.offset || '0', 10) || 0);
  const limit  = Math.max(0, parseInt(params.limit  || '0', 10) || 0);
  const total  = rows.length;
  if (limit > 0) rows = rows.slice(offset, offset + limit);

  return { total: total, count: rows.length, rows: rows };
}

function getRow_(sheetName, id) {
  if (!id) throw new Error('Missing id');
  if (sheetName === 'settings' && CONFIG.PROTECTED_SETTINGS.indexOf(String(id)) !== -1) {
    throw new Error('Access denied');
  }
  const data = readSheet_(sheetName);
  const pk   = CONFIG.PRIMARY_KEY[sheetName];
  const row  = data.rows.find(r => String(r[pk]) === String(id));
  if (!row) throw new Error('Record not found: ' + id);
  return row;
}

function createRow_(sheetName, body) {
  guardProtectedSetting_(sheetName, body[CONFIG.PRIMARY_KEY[sheetName]]);

  const sheet   = openSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const pk      = CONFIG.PRIMARY_KEY[sheetName];

  const idCfg = CONFIG.ID_PREFIX[sheetName];
  if (idCfg && !body[idCfg.col]) {
    body[idCfg.col] = generateNextId_(sheet, headers, idCfg);
  }

  // patients: mirror hn → id (compat กับ frontend เดิมที่อ้าง p.id)
  if (sheetName === 'patients' && headers.indexOf('id') !== -1 && !body.id && body.hn) {
    body.id = body.hn;
  }

  if (headers.indexOf('created_at') !== -1 && !body.created_at) body.created_at = nowBKK_();
  if (headers.indexOf('updated_at') !== -1 && !body.updated_at) body.updated_at = nowBKK_();
  if (headers.indexOf('is_active')  !== -1 && body.is_active === undefined) body.is_active = 'TRUE';

  const row = headers.map(h => body[h] !== undefined ? body[h] : '');
  sheet.appendRow(row);
  const newRowIndex = sheet.getLastRow();

  // force time columns เป็น plain text
  CONFIG.TIME_COLS.forEach(f => {
    const ci = headers.indexOf(f);
    if (ci !== -1 && body[f] !== undefined && body[f] !== '') {
      const cell = sheet.getRange(newRowIndex, ci + 1);
      cell.setNumberFormat('@STRING@');
      cell.setValue(String(body[f]));
    }
  });

  if (body[pk] !== undefined && body[pk] !== '') return getRow_(sheetName, body[pk]);
  return body;
}

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

  if (headers.indexOf('updated_at') !== -1) body.updated_at = nowBKK_();

  headers.forEach((h, idx) => {
    if (body[h] !== undefined && h !== pk) {
      const cell = sheet.getRange(rowIndex, idx + 1);
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

  if (CONFIG.SOFT_DELETE.indexOf(sheetName) !== -1 && headers.indexOf('is_active') !== -1) {
    const col  = headers.indexOf('is_active') + 1;
    const cell = sheet.getRange(rowIndex, col);
    cell.setNumberFormat('@STRING@');
    cell.setValue('FALSE');
    if (headers.indexOf('updated_at') !== -1) {
      sheet.getRange(rowIndex, headers.indexOf('updated_at') + 1).setValue(nowBKK_());
    }
    return { id: id, deleted: 'soft' };
  }

  sheet.deleteRow(rowIndex);
  return { id: id, deleted: 'hard' };
}


// ═══════════════════════════════════════════════════════════════
//  SECURITY HELPERS
// ═══════════════════════════════════════════════════════════════
function guardProtectedSetting_(sheetName, key) {
  if (sheetName === 'settings' && key != null &&
      CONFIG.PROTECTED_SETTINGS.indexOf(String(key)) !== -1) {
    throw new Error('Access denied: protected setting');
  }
}
function redactSettings_(rows) {
  return rows.filter(r => CONFIG.PROTECTED_SETTINGS.indexOf(String(r.key)) === -1);
}


// ═══════════════════════════════════════════════════════════════
//  SHEET HELPERS — single spreadsheet, หลาย tab
// ═══════════════════════════════════════════════════════════════
function openSheet_(sheetName) {
  const tab = CONFIG.TABS[sheetName];
  if (!tab) throw new Error('Unknown sheet: ' + sheetName);
  const ss = SpreadsheetApp.openById(getDbId_());
  const sheet = ss.getSheetByName(tab);
  if (!sheet) throw new Error('Tab not found: ' + tab);
  return sheet;
}

function getHeaders_(sheet) {
  if (sheet.getLastColumn() === 0) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn())
              .getValues()[0].map(h => String(h).trim());
}

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
      if (val instanceof Date) {
        const h = headers[j];
        if (CONFIG.TIME_COLS.indexOf(h) !== -1) {
          val = Utilities.formatDate(val, TZ, 'HH:mm');
        } else if (h === 'created_at' || h === 'updated_at') {
          val = Utilities.formatDate(val, TZ, 'dd/MM/yyyy HH:mm');
        } else {
          val = Utilities.formatDate(val, TZ, 'dd/MM/yyyy');
        }
      }
      obj[headers[j]] = val;
      if (val !== '' && val !== null) isEmpty = false;
    }
    if (!isEmpty) rows.push(obj);
  }
  return { headers: headers, rows: rows };
}

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

function jsonResponse_(payload, status) {
  payload.status = status || 200;
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}


// ═══════════════════════════════════════════════════════════════
//  LINE NOTIFY (deprecated — คงไว้เพื่อ backward-compat)
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
  if (!token) throw new Error('ไม่พบ LINE Notify Token');
  const msg = body.message || '📢 แจ้งเตือนจาก Superclinic';
  return sendLineNotify_(token, msg);
}
function sendLineNotify_(token, message) {
  const url = 'https://notify-api.line.me/api/notify';
  const res = UrlFetchApp.fetch(url, {
    method: 'post', headers: { 'Authorization': 'Bearer ' + token },
    payload: 'message=' + encodeURIComponent(message), muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) throw new Error('LINE error ' + res.getResponseCode());
  return { sent: true };
}


// ═══════════════════════════════════════════════════════════════
//  TEST / ADMIN FUNCTIONS — รันใน editor
// ═══════════════════════════════════════════════════════════════

/** รันครั้งเดียวเพื่อสร้างฐานข้อมูล (ทางเลือกแทน ?action=setup) */
function adminSetup() {
  const r = setupDatabase_();
  Logger.log(JSON.stringify(r, null, 2));
}

/** ดู SHEET_ID ปัจจุบัน */
function adminShowDbId() {
  Logger.log('SHEET_ID = ' + PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
}

/** ⚠️ รีเซ็ต — ลบ SHEET_ID ออกจาก ScriptProperties (ไม่ลบ Spreadsheet จริง) */
function adminResetDbId() {
  PropertiesService.getScriptProperties().deleteProperty('SHEET_ID');
  try { CacheService.getScriptCache().remove('api_token'); } catch (_) {}
  Logger.log('SHEET_ID cleared');
}

function test_listPatients() {
  const r = listRows_('patients', {});
  Logger.log('Total: ' + r.total);
}
