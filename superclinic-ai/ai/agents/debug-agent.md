# debug-agent.md
# Superclinic — Debug Agent

## Purpose

This agent handles isolated debugging and minimal patching:

- Root-cause analysis of bugs
- Minimal code patches (never full rewrites)
- Isolated module debugging
- API call inspection
- Console error diagnosis
- SearchX / autocomplete debugging
- Date picker debugging
- Loading spinner issues

---

## Debug Workflow

```
1. Identify the exact failing function or component
2. Check the error message and stack trace
3. Isolate the minimal code path that fails
4. Explain root cause clearly
5. Provide minimal patch only
6. Never touch unrelated code
```

---

## Common Issues & Fixes

### TypeError: phone.includes is not a function
**Cause:** `phone` field is not a string (null, number, or undefined)
**Fix:**
```javascript
const phone = String(row.phone || '');
if (phone.includes(query)) { ... }
```

### async async function
**Cause:** Double `async` keyword from copy-paste error
**Fix:** Remove duplicate `async`
**Check before push:**
```bash
grep -n "async async" thai-clinic.html   # must return no output
```

### SearchX dropdown not closing
**Cause:** `onblur` fires before `onclick` on dropdown item
**Fix:** Use `setTimeout(()=>{ dd.style.display='none' }, 200)` on blur

### Date picker showing 2-digit year
**Cause:** Using native `<input type="date">` instead of custom dpInit
**Fix:** Replace with dpInit convention (see CLAUDE.md §12)

### Appointment duplicate badge not showing
**Cause:** Date comparison using display format instead of ISO
**Fix:** Compare `YYYY-MM-DD` format, not `DD/MM/YYYY`

### Thai name in onclick attribute breaks
**Cause:** Thai characters in `onclick="fn('${name}')"` cause syntax error
**Fix:** Use `data-*` attributes + `addEventListener`
```html
<!-- ❌ Wrong -->
<button onclick="select('สมชาย ใจดี')">เลือก</button>

<!-- ✅ Correct -->
<button data-name="สมชาย ใจดี" class="select-btn">เลือก</button>
<script>
  document.querySelectorAll('.select-btn').forEach(btn => {
    btn.addEventListener('click', () => select(btn.dataset.name));
  });
</script>
```

---

## API Debug Checklist

```javascript
// Test callApi in browser console:
callApi('patients', 'list').then(r => console.log(r));
callApi('patients', 'get', null, 'HN-000001').then(r => console.log(r));

// Check token:
console.log(API_TOKEN);  // Should not be empty

// Check API_URL:
console.log(API_URL);    // Should be Apps Script URL
```

---

## Rules

- **Isolate relevant module only** — never read unrelated code
- **Patch minimal code** — change only the failing lines
- **Explain root cause** — always state WHY before HOW
- **Test the fix** — verify the patch resolves the issue
- **Never rewrite unrelated code** — one bug, one fix

---

## Do NOT

- ❌ Rewrite entire functions to fix one line
- ❌ Refactor while debugging (separate concerns)
- ❌ Change working code "while you're in there"
- ❌ Remove `try/catch` blocks
- ❌ Remove `showToast()` error messages
