/**
 * date.js
 * Superclinic — Date Utility Functions
 *
 * Rules:
 *   - Store: YYYY-MM-DD
 *   - Display: DD/MM/YYYY (พ.ศ. 4 หลัก)
 *   - Never: Thai month names
 *   - Never: 2-digit year
 *   - Never: <input type="date">
 */

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 * @returns {string}
 */
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Convert ISO date to Thai display format
 * @param {string} iso - YYYY-MM-DD
 * @returns {string} - DD/MM/YYYY (พ.ศ.)
 */
function toThaiDisplay(iso) {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-').map(Number);
  const buddhistYear = y + 543;
  return `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${buddhistYear}`;
}

/**
 * Convert ISO date to full Thai display (with day name)
 * @param {string} iso - YYYY-MM-DD
 * @returns {string}
 */
function toThaiDateFull(iso) {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-').map(Number);
  const buddhistYear = y + 543;
  const date = new Date(y, m - 1, d);
  const days = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  return `วัน${days[date.getDay()]}ที่ ${d}/${String(m).padStart(2,'0')}/${buddhistYear}`;
}

/**
 * Convert display date back to ISO format
 * @param {string} display - DD/MM/YYYY
 * @returns {string} - YYYY-MM-DD
 */
function dateToISO(display) {
  if (!display) return '';
  const parts = display.replace(/\s/g,'').split('/');
  if (parts.length !== 3) return '';
  const [d, m, y] = parts.map(Number);
  // Convert Buddhist year to CE
  const ceYear = y > 2500 ? y - 543 : y;
  return `${ceYear}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

/**
 * Calculate age from date of birth
 * @param {string} dob - YYYY-MM-DD
 * @returns {number} - Age in years
 */
function calcAge(dob) {
  if (!dob) return 0;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/**
 * Parse time string to minutes from midnight
 * @param {string} t - HH:MM
 * @returns {number}
 */
function parseTimeStr(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

/**
 * Format datetime string for display
 * @param {string} iso - YYYY-MM-DD or YYYY-MM-DDTHH:mm
 * @returns {string}
 */
function fmtDateTime(iso) {
  if (!iso) return '-';
  const datePart = iso.split('T')[0];
  const timePart = iso.includes('T') ? iso.split('T')[1].slice(0,5) : '';
  return toThaiDisplay(datePart) + (timePart ? ` ${timePart}` : '');
}
