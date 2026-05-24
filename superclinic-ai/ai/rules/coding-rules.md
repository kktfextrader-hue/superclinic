# coding-rules.md
# Superclinic — Coding Rules

## Language Rules

```
UI text         → ภาษาไทย
Variable names  → English camelCase
Function names  → English camelCase
CSS classes     → English kebab-case
Comments        → Thai or English (consistent per file)
```

---

## Forbidden Patterns

```javascript
// ❌ Never use onclick with Thai strings
<button onclick="select('สมชาย ใจดี')">เลือก</button>

// ✅ Always use data-* + addEventListener
<button data-name="สมชาย ใจดี" class="select-btn">เลือก</button>
document.querySelectorAll('.select-btn').forEach(btn => {
  btn.addEventListener('click', () => select(btn.dataset.name));
});

// ❌ Never use <input type="date">
<input type="date" id="my-date">

// ✅ Always use custom date picker
<div class="dp-wrap">
  <input type="text" id="my-date-disp" class="form-control dp-input" placeholder="วว/ดด/ปปปป" readonly>
  <input type="hidden" id="my-date" value="">
</div>

// ❌ Never use double async
async async function foo() {}

// ✅ One async only
async function foo() {}
```

---

## API Call Pattern

```javascript
// ✅ Correct pattern with showLoading
async function submitSomething(e) {
  e.preventDefault();
  
  // 1. Validate inputs first
  const name = document.getElementById('input-name').value.trim();
  if (!name) return showToast('กรุณากรอกชื่อ', 'error');
  
  // 2. Show loading spinner
  const _done = showLoading(e.submitter);
  
  try {
    // 3. API call
    const result = await callApi('patients', 'create', { name });
    
    // 4. Success
    _done();
    showToast('✅ บันทึกสำเร็จ');
    closeModal('modal-add-patient');
    loadPatients();
  } catch(err) {
    // 5. Error
    _done();
    showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
  }
}
```

---

## Date Utilities

```javascript
// Store dates as YYYY-MM-DD
const iso = dpGetValue('my-date');   // → '2026-05-24'

// Display as DD/MM/YYYY พ.ศ.
const display = toThaiDisplay(iso);  // → '24/05/2569'

// Today's ISO
const today = todayISO();            // → '2026-05-24'
```

---

## SearchX Pattern

```html
<!-- Every SearchX must have this structure -->
<input id="INPUT-ID"
  oninput="searchFn(this.value)"
  onkeydown="acKeyNav(event,'DD-ID', el=>el.click())"
  onblur="setTimeout(()=>{document.getElementById('DD-ID').style.display='none'},200)">
<div id="DD-ID" style="display:none; position:absolute; background:#fff; border:1px solid #ddd; border-radius:8px; z-index:100; min-width:100%;"></div>
```

---

## Loading Spinner Pattern

```javascript
function showLoading(btn) {
  if (!btn) return () => {};
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '⏳';
  btn.style.animation = 'spin 1s linear infinite';
  return () => {
    btn.disabled = false;
    btn.innerHTML = orig;
    btn.style.animation = '';
  };
}
```

---

## CSS Convention

```css
/* ✅ Always use CSS variables */
.card { background: var(--cr); border: 1px solid var(--gs); }
.btn-primary { background: var(--g1); color: var(--wh); }

/* ❌ Never hard-code colors in component styles */
.card { background: #F8F5EF; }
```

---

## Soft Delete Convention

```javascript
// ✅ Correct: soft delete
await callApi('patients', 'delete', { id: hn });
// Backend sets is_active = FALSE

// ❌ Never: do not call a hard-delete endpoint
await fetch(`/delete?id=${hn}`);
```

---

## Modal Convention

```javascript
// Open modal
openModal('modal-add-patient');

// Close modal
closeModal('modal-add-patient');

// Init date pickers inside modal (50ms delay for DOM)
setTimeout(() => {
  dpInit('my-date-disp', 'my-date', todayISO());
}, 50);
```
