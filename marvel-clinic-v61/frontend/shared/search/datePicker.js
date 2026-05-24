/**
 * datePicker.js
 * Superclinic — Custom Date Picker (v59+)
 *
 * Rules:
 *   - Never use <input type="date">
 *   - Always use dpInit() with two inputs: display (text) + hidden (ISO value)
 *
 * HTML Structure:
 *   <div class="dp-wrap">
 *     <input type="text" id="FIELD-disp" class="form-control dp-input" placeholder="วว/ดด/ปปปป" readonly>
 *     <input type="hidden" id="FIELD" value="">
 *   </div>
 *
 * Init (inside modal, 50ms delay):
 *   setTimeout(() => dpInit('FIELD-disp', 'FIELD', todayISO()), 50);
 *
 * Read value:
 *   dpGetValue('FIELD')  → 'YYYY-MM-DD'
 *
 * Set value from code:
 *   dpSetValue('FIELD', 'FIELD-disp', '2026-05-24')
 */

const _dp = {};  // State registry: { uid: { y, m, d } }

/**
 * Initialize custom date picker
 * @param {string} dispId   - ID of display input (text, readonly)
 * @param {string} hiddenId - ID of hidden input (ISO value)
 * @param {string} isoDate  - Initial date (YYYY-MM-DD)
 */
function dpInit(dispId, hiddenId, isoDate) {
  const dispEl = document.getElementById(dispId);
  const hiddenEl = document.getElementById(hiddenId);
  if (!dispEl || !hiddenEl) return;

  const uid = hiddenId;
  const [y, m, d] = (isoDate || todayISO()).split('-').map(Number);
  _dp[uid] = { y, m, d };

  _dpUpdate(uid, dispEl, hiddenEl);
  dispEl.onclick = () => _dpToggle(uid, dispEl, hiddenEl);
}

function getparts(uid) { return _dp[uid] || { y: 2026, m: 1, d: 1 }; }

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate();
}

function _dpUpdate(uid, dispEl, hiddenEl) {
  const { y, m, d } = _dp[uid];
  const buddhistYear = y + 543;
  dispEl.value = `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${buddhistYear}`;
  hiddenEl.value = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  hiddenEl.dispatchEvent(new Event('change'));
}

function _dpToggle(uid, dispEl, hiddenEl) {
  const existing = document.getElementById(`dp-dd-${uid}`);
  if (existing) { existing.remove(); return; }
  renderDD(uid, dispEl, hiddenEl);
}

function renderDD(uid, dispEl, hiddenEl) {
  document.querySelectorAll('[id^="dp-dd-"]').forEach(el => el.remove());

  const { y, m, d } = _dp[uid];
  const buddhistYear = y + 543;

  const dd = document.createElement('div');
  dd.id = `dp-dd-${uid}`;
  dd.style.cssText = `
    position:absolute; background:#fff; border:1px solid #e0d8cc; border-radius:14px;
    box-shadow:0 8px 32px rgba(0,0,0,0.13); z-index:9999; padding:16px;
    min-width:280px; font-family:'Sarabun',sans-serif;
  `;

  dd.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center;justify-content:center;">
      <div style="flex:1;">
        <label style="font-size:11px;color:#aaa;display:block;margin-bottom:2px;">วัน</label>
        <div style="display:flex;align-items:center;gap:4px;">
          <button onclick="_dpAdj('${uid}','d',-1)" style="background:none;border:1px solid #ddd;border-radius:6px;padding:4px 8px;cursor:pointer;">▼</button>
          <span id="dp-d-${uid}" style="min-width:28px;text-align:center;font-size:16px;font-weight:600;">${String(d).padStart(2,'0')}</span>
          <button onclick="_dpAdj('${uid}','d',1)" style="background:none;border:1px solid #ddd;border-radius:6px;padding:4px 8px;cursor:pointer;">▲</button>
        </div>
      </div>
      <div style="flex:1;">
        <label style="font-size:11px;color:#aaa;display:block;margin-bottom:2px;">เดือน</label>
        <div style="display:flex;align-items:center;gap:4px;">
          <button onclick="_dpAdj('${uid}','m',-1)" style="background:none;border:1px solid #ddd;border-radius:6px;padding:4px 8px;cursor:pointer;">▼</button>
          <span id="dp-m-${uid}" style="min-width:28px;text-align:center;font-size:16px;font-weight:600;">${String(m).padStart(2,'0')}</span>
          <button onclick="_dpAdj('${uid}','m',1)" style="background:none;border:1px solid #ddd;border-radius:6px;padding:4px 8px;cursor:pointer;">▲</button>
        </div>
      </div>
      <div style="flex:1;">
        <label style="font-size:11px;color:#aaa;display:block;margin-bottom:2px;">ปี (พ.ศ.)</label>
        <div style="display:flex;align-items:center;gap:4px;">
          <button onclick="_dpAdj('${uid}','y',-1)" style="background:none;border:1px solid #ddd;border-radius:6px;padding:4px 8px;cursor:pointer;">▼</button>
          <span id="dp-y-${uid}" style="min-width:44px;text-align:center;font-size:16px;font-weight:600;">${buddhistYear}</span>
          <button onclick="_dpAdj('${uid}','y',1)" style="background:none;border:1px solid #ddd;border-radius:6px;padding:4px 8px;cursor:pointer;">▲</button>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button onclick="_dpToday('${uid}')" style="background:#f5f0e8;border:none;border-radius:8px;padding:7px 14px;font-size:13px;cursor:pointer;font-family:'Sarabun',sans-serif;">วันนี้</button>
      <button onclick="_dpConfirm('${uid}')" style="background:#2F5D50;color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:13px;cursor:pointer;font-family:'Sarabun',sans-serif;font-weight:600;">✓ เลือก</button>
    </div>
  `;

  const rect = dispEl.getBoundingClientRect();
  dd.style.top = (dispEl.offsetTop + dispEl.offsetHeight + 4) + 'px';
  dd.style.left = dispEl.offsetLeft + 'px';
  dispEl.parentElement.style.position = 'relative';
  dispEl.parentElement.appendChild(dd);
}

function _dpAdj(uid, part, delta) {
  const p = _dp[uid];
  if (part === 'd') {
    p.d += delta;
    const max = daysInMonth(p.y, p.m);
    if (p.d < 1) p.d = max;
    if (p.d > max) p.d = 1;
  } else if (part === 'm') {
    p.m += delta;
    if (p.m < 1) { p.m = 12; p.y--; }
    if (p.m > 12) { p.m = 1; p.y++; }
    const max = daysInMonth(p.y, p.m);
    if (p.d > max) p.d = max;
  } else if (part === 'y') {
    p.y += delta;
  }
  // Update display in dropdown
  const dd = document.getElementById(`dp-dd-${uid}`);
  if (dd) {
    const dEl = document.getElementById(`dp-d-${uid}`);
    const mEl = document.getElementById(`dp-m-${uid}`);
    const yEl = document.getElementById(`dp-y-${uid}`);
    if (dEl) dEl.textContent = String(p.d).padStart(2,'0');
    if (mEl) mEl.textContent = String(p.m).padStart(2,'0');
    if (yEl) yEl.textContent = p.y + 543;
  }
}

function _dpToday(uid) {
  const [y, m, d] = todayISO().split('-').map(Number);
  _dp[uid] = { y, m, d };
  const dd = document.getElementById(`dp-dd-${uid}`);
  if (dd) {
    const dEl = document.getElementById(`dp-d-${uid}`);
    const mEl = document.getElementById(`dp-m-${uid}`);
    const yEl = document.getElementById(`dp-y-${uid}`);
    if (dEl) dEl.textContent = String(d).padStart(2,'0');
    if (mEl) mEl.textContent = String(m).padStart(2,'0');
    if (yEl) yEl.textContent = y + 543;
  }
}

function _dpConfirm(uid) {
  const dispEl = document.querySelector(`[id="${uid.replace(/-hidden$|$/,'')}-disp"], [id="${uid}-disp"], input[data-dp="${uid}"]`);
  const hiddenEl = document.getElementById(uid);
  if (hiddenEl) {
    const dispId = hiddenEl.dataset.disp || uid.replace(/-hidden$/, '') + '-disp';
    const d2 = document.getElementById(dispId);
    if (d2) _dpUpdate(uid, d2, hiddenEl);
  }
  const dd = document.getElementById(`dp-dd-${uid}`);
  if (dd) dd.remove();
}

function openDp(uid) {
  const hiddenEl = document.getElementById(uid);
  if (!hiddenEl) return;
  const dispId = hiddenEl.getAttribute('data-disp');
  const dispEl = dispId ? document.getElementById(dispId) : null;
  if (dispEl) _dpToggle(uid, dispEl, hiddenEl);
}

function closeDp(uid) {
  const dd = document.getElementById(`dp-dd-${uid}`);
  if (dd) dd.remove();
}

/**
 * Get ISO value from date picker
 * @param {string} hiddenId - ID of hidden input
 * @returns {string} YYYY-MM-DD
 */
function dpGetValue(hiddenId) {
  const el = document.getElementById(hiddenId);
  return el ? el.value : '';
}

/**
 * Set date picker value programmatically
 * @param {string} hiddenId - ID of hidden input
 * @param {string} dispId   - ID of display input
 * @param {string} isoDate  - YYYY-MM-DD
 */
function dpSetValue(hiddenId, dispId, isoDate) {
  const hiddenEl = document.getElementById(hiddenId);
  const dispEl = document.getElementById(dispId);
  if (!hiddenEl || !dispEl) return;
  const [y, m, d] = (isoDate || todayISO()).split('-').map(Number);
  _dp[hiddenId] = { y, m, d };
  _dpUpdate(hiddenId, dispEl, hiddenEl);
}
