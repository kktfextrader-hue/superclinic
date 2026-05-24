/**
 * ui.js
 * Superclinic — UI Utility Functions
 * (Toast, Modal, Loading Spinner, Badges, Initials)
 */

// ─── TOAST ────────────────────────────────────────────────────

/**
 * Show toast notification
 * @param {string} msg     - Message text
 * @param {string} type    - 'success' | 'error' | 'info'
 * @param {number} duration - Duration in ms (default 3000)
 */
function showToast(msg, type = 'success', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const colors = {
    success: { bg: '#27AE60', icon: '✅' },
    error:   { bg: '#C0392B', icon: '❌' },
    info:    { bg: '#2F5D50', icon: 'ℹ️' }
  };
  const { bg, icon } = colors[type] || colors.info;

  toast.style.cssText = `
    background:${bg};color:#fff;padding:12px 20px;border-radius:12px;
    font-family:'Sarabun',sans-serif;font-size:14px;font-weight:500;
    box-shadow:0 4px 20px rgba(0,0,0,0.15);display:flex;align-items:center;
    gap:8px;min-width:200px;max-width:360px;animation:slideInRight .2s ease;
  `;
  toast.innerHTML = `${icon} ${msg}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── MODAL ───────────────────────────────────────────────────

/**
 * Open a modal by ID
 * @param {string} id - Modal element ID
 */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}

/**
 * Close a modal by ID
 * @param {string} id - Modal element ID
 */
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// ─── LOADING SPINNER ─────────────────────────────────────────

/**
 * Show loading state on a button
 * @param {Element|null} btn - Button element
 * @returns {Function} done() — call to restore button state
 */
function showLoading(btn) {
  if (!btn) return () => {};
  const orig = btn.innerHTML;
  const origDisabled = btn.disabled;
  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-block;animation:spin 1s linear infinite">⏳</span>';
  return () => {
    btn.disabled = origDisabled;
    btn.innerHTML = orig;
  };
}

// ─── BADGES ──────────────────────────────────────────────────

/**
 * Get patient type badge HTML
 * @param {string} type - 'new' | 'regular' | 'vip'
 * @returns {string} HTML
 */
function badgePatientType(type) {
  const map = {
    new:     { label: 'ผู้ป่วยใหม่',    color: '#5F8D4E', bg: 'rgba(95,141,78,.12)' },
    regular: { label: 'ผู้ป่วยประจำ',  color: '#2F5D50', bg: 'rgba(47,93,80,.12)' },
    vip:     { label: 'VIP',            color: '#C8A96B', bg: 'rgba(200,169,107,.15)' }
  };
  const t = map[type] || map.new;
  return `<span style="background:${t.bg};color:${t.color};border-radius:20px;font-size:11px;font-weight:600;padding:2px 10px;">${t.label}</span>`;
}

/**
 * Get appointment status badge HTML
 * @param {string} status
 * @returns {string} HTML
 */
function badgeStatus(status) {
  const map = {
    pending:   { label: 'รอยืนยัน',    color: '#F39C12', bg: 'rgba(243,156,18,.12)' },
    confirmed: { label: 'ยืนยันแล้ว',  color: '#27AE60', bg: 'rgba(39,174,96,.12)' },
    completed: { label: 'รักษาแล้ว',   color: '#2F5D50', bg: 'rgba(47,93,80,.10)' },
    cancelled: { label: 'ยกเลิก',      color: '#C0392B', bg: 'rgba(192,57,43,.12)' },
    missed:    { label: 'ไม่มา',       color: '#E67E22', bg: 'rgba(230,126,34,.12)' }
  };
  const s = map[status] || { label: status, color: '#999', bg: '#f5f5f5' };
  return `<span style="background:${s.bg};color:${s.color};border-radius:20px;font-size:11px;font-weight:600;padding:2px 10px;">${s.label}</span>`;
}

/**
 * Get herb status badge
 * @param {string} status - 'active' | 'low' | 'out'
 * @returns {string} HTML
 */
function badgeHerb(status) {
  const map = {
    active: { label: 'ปกติ',     color: '#27AE60', bg: 'rgba(39,174,96,.12)' },
    low:    { label: 'ใกล้หมด', color: '#E67E22', bg: 'rgba(230,126,34,.12)' },
    out:    { label: 'หมด',      color: '#C0392B', bg: 'rgba(192,57,43,.12)' }
  };
  const s = map[status] || map.active;
  return `<span style="background:${s.bg};color:${s.color};border-radius:20px;font-size:11px;font-weight:600;padding:2px 10px;">${s.label}</span>`;
}

// ─── DISPLAY HELPERS ─────────────────────────────────────────

/**
 * Get initials from full name
 * @param {string} name
 * @returns {string}
 */
function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Calculate patient tier based on visit count
 * @param {number} visitCount
 * @returns {string} 'new' | 'regular' | 'vip'
 */
function calcPatientTier(visitCount) {
  if (visitCount >= 20) return 'vip';
  if (visitCount >= 5)  return 'regular';
  return 'new';
}
