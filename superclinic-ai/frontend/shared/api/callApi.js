/**
 * callApi.js
 * Superclinic — Shared API Helper
 *
 * Usage:
 *   await callApi('patients', 'list')
 *   await callApi('patients', 'get', null, 'HN-000001')
 *   await callApi('finance', 'create', { type:'income', amount:800 })
 *   await callApi('appointments', 'update', { id: 1, status: 'completed' })
 *   await callApi('herbs', 'delete', { id: 'HRB-001' })
 *
 * Config (from CLAUDE.local.md):
 *   const API_URL   = 'https://script.google.com/macros/s/...';
 *   const API_TOKEN = 'MARVEL-SECRET-TOKEN-2025';
 */

// ─── CONFIG (override in main app file) ──────────────────────
// These should be set in the main HTML file before loading this script:
//   const API_URL   = '...';
//   const API_TOKEN = '...';
// ─────────────────────────────────────────────────────────────

/**
 * Core API caller for Superclinic Google Apps Script backend
 * @param {string} sheet    - Sheet name (patients, appointments, etc.)
 * @param {string} action   - Action (list, get, create, update, delete)
 * @param {object|null} body - POST body data (for create/update/delete)
 * @param {string|null} id  - Record ID (for get action)
 * @returns {Promise<object>} - Response data
 */
async function callApi(sheet, action, body = null, id = null) {
  let url = `${API_URL}?sheet=${sheet}&action=${action}&token=${API_TOKEN}`;
  if (id) url += `&id=${encodeURIComponent(id)}`;

  const opts = body
    ? {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(body)
      }
    : { method: 'GET' };

  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'API error');

  return json.data;
}
