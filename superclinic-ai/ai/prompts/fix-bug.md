# fix-bug.md
# Prompt Template: Fix Bug

## Instructions for AI

Before fixing, read:
- `ai/agents/debug-agent.md` — debug workflow and common issues
- The specific feature agent (e.g., `patient-agent.md`) if relevant

---

## Task

Analyze and fix this specific bug only.

## Return Format

1. **Root cause** — one sentence explaining WHY it fails
2. **Minimal patch** — only the lines that need to change
3. **Updated code** — the corrected function/block only

## Rules

- Do **NOT** rewrite unrelated modules
- Do **NOT** refactor while debugging
- Do **NOT** change working code
- Patch only the failing lines
- Preserve all existing `try/catch` and `showToast()` calls

---

## Example Usage

```
Bug: TypeError: phone.includes is not a function
Location: searchRegPatient() in register feature
Symptom: Crashes when searching patient with no phone number

Follow: debug-agent.md
Return: root cause + minimal patch only
```
