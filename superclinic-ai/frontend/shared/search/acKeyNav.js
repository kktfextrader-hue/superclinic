/**
 * acKeyNav.js
 * Superclinic — Autocomplete Keyboard Navigation (SearchX Utility)
 *
 * Usage:
 *   onkeydown="acKeyNav(event, 'my-dropdown-id', el => el.click())"
 *
 * Behavior:
 *   ↓ Arrow Down  — move to next item (wraps)
 *   ↑ Arrow Up    — move to previous item (wraps)
 *   Enter         — select focused item
 *   Escape        — close dropdown
 *
 * Focused item gets class: .ac-focused
 *
 * SearchX HTML Convention:
 *   <input id="INPUT-ID"
 *     oninput="searchFn(this.value)"
 *     onkeydown="acKeyNav(event,'DD-ID', el=>el.click())"
 *     onblur="setTimeout(()=>{document.getElementById('DD-ID').style.display='none'},200)">
 *   <div id="DD-ID" style="display:none; position:absolute; ..."></div>
 */

/**
 * Handle keyboard navigation for autocomplete dropdowns
 * @param {KeyboardEvent} e       - Keyboard event
 * @param {string} dropdownId     - ID of dropdown container element
 * @param {Function} selectFn     - Called with focused element when Enter is pressed
 */
function acKeyNav(e, dropdownId, selectFn) {
  const dd = document.getElementById(dropdownId);
  if (!dd || dd.style.display === 'none') return;

  const items = Array.from(dd.querySelectorAll('[data-ac-item], .ac-item, li, .suggestion-item'));
  if (!items.length) return;

  const focused = dd.querySelector('.ac-focused');
  let idx = focused ? items.indexOf(focused) : -1;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (focused) focused.classList.remove('ac-focused');
    idx = (idx + 1) % items.length;
    items[idx].classList.add('ac-focused');
    items[idx].scrollIntoView({ block: 'nearest' });

  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (focused) focused.classList.remove('ac-focused');
    idx = (idx - 1 + items.length) % items.length;
    items[idx].classList.add('ac-focused');
    items[idx].scrollIntoView({ block: 'nearest' });

  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (focused) selectFn(focused);

  } else if (e.key === 'Escape') {
    dd.style.display = 'none';
    if (focused) focused.classList.remove('ac-focused');
  }
}

// CSS for focused item — inject once
(function injectAcStyles() {
  if (document.getElementById('ac-styles')) return;
  const style = document.createElement('style');
  style.id = 'ac-styles';
  style.textContent = `
    .ac-focused {
      background: rgba(47, 93, 80, 0.08) !important;
      outline: none;
    }
    [data-ac-item]:hover, .ac-item:hover, .suggestion-item:hover {
      background: rgba(47, 93, 80, 0.05);
    }
  `;
  document.head.appendChild(style);
})();
