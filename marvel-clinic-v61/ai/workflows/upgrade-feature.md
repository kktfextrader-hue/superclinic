# upgrade-feature.md
# Superclinic — Upgrade Feature Workflow

## When to Use

Use this workflow when adding new functionality to an existing feature.

---

## Steps

### Step 1: Analyze Existing Module

```
1. Read the relevant feature agent: ai/agents/{feature}-agent.md
2. Read architecture rules: ai/rules/architecture.md
3. Read coding rules: ai/rules/coding-rules.md
4. List functions currently in scope
5. Identify what to ADD vs what to CHANGE
```

### Step 2: Check Reusable Services

```
1. Check frontend/shared/api/ — does callApi() cover the need?
2. Check frontend/shared/utils/ — is there a date/format helper?
3. Check frontend/shared/search/ — does acKeyNav() work for this?
4. Only create new shared utility if truly reusable across 2+ features
```

### Step 3: Design the Change

```
1. Write the new function signature
2. Identify which existing functions to call
3. Identify new HTML elements needed (IDs must be unique)
4. Identify new API calls needed
5. Confirm no SearchX IDs conflict (see CLAUDE.md §10)
```

### Step 4: Implement

```
1. Add HTML to correct page section
2. Add JS functions in correct feature group
3. Add CSS using variables only
4. Use showLoading() on submit buttons
5. Use try/catch + showToast() on all API calls
6. Use dpInit() for any date inputs
7. Use acKeyNav() for any search inputs
```

### Step 5: Test

```
1. Check grep -n "async async" thai-clinic.html → must be empty
2. Open app in browser
3. Test happy path
4. Test error path (empty fields, API failure)
5. Test keyboard navigation on search inputs
```

### Step 6: Update Docs

```
1. Update CLAUDE.md changelog (new version)
2. Update relevant agent .md if functions changed
3. Update ai/memory/ if new conventions established
```

---

## Version Numbering

Current production: **v60**
Next version: **v61**

Format: `v{N}` — increment by 1 per release session.
