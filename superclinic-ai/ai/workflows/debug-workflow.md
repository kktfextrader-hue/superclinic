# debug-workflow.md
# Superclinic — Debug Workflow

## When to Use

Use this workflow when something is broken and needs fixing.

---

## Steps

### Step 1: Identify the Bug

```
1. What exactly fails? (error message, wrong output, UI issue)
2. Which page/feature is affected?
3. What function is called?
4. Is there a console error?
```

### Step 2: Isolate the Cause

```
1. Read only the failing function
2. Check inputs — are they the expected type?
3. Check API response — is data the expected shape?
4. Check DOM — are element IDs correct?
5. Do NOT read unrelated code
```

### Step 3: Apply Minimal Patch

```
1. Change only the failing lines
2. Preserve all existing try/catch blocks
3. Preserve all existing showToast() calls
4. Do NOT rename variables or refactor
5. Do NOT change logic in other functions
```

### Step 4: Verify

```
1. grep -n "async async" thai-clinic.html  → must be 0 matches
2. Test the exact failing scenario
3. Test that adjacent features still work
```

---

## Common Bug Checklist

| Symptom | Check |
|---------|-------|
| `TypeError: x.includes is not a function` | Field is null/number, wrap with `String(x \|\| '')` |
| Dropdown not closing | Add `setTimeout(200)` to onblur |
| Date showing wrong year (2-digit) | Using native date input, replace with dpInit |
| Thai name breaks onclick | Use `data-*` + addEventListener |
| API returns 401 | Token expired or wrong, check CLAUDE.local.md |
| `async async` syntax error | Remove duplicate async keyword |
| Modal date picker not working | Add `setTimeout(50ms)` before dpInit call |
| Appointment badge ⚠️ not showing | Compare dates as ISO, not display format |

---

## Pre-Push Checklist

```bash
# Run these before every push:
grep -n "async async" thai-clinic.html      # → no output expected
grep -n "undefined" thai-clinic.html | grep "API_URL\|API_TOKEN"  # → no output
```
