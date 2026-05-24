# create-feature.md
# Prompt Template: Create New Feature

## Instructions for AI

Follow these documents before generating code:
- `CLAUDE.md` — project rules and conventions
- `ai/rules/architecture.md` — folder and module rules
- Relevant agent file in `ai/agents/`

---

## Task

Create an isolated feature module for Superclinic.

## Requirements

- **Reusable** — extract shared logic to `frontend/shared/`
- **Minimal dependencies** — do not import from other feature folders
- **Mobile-first** — responsive layout using CSS variables
- **Isolated logic** — feature logic stays in its own folder
- **Thai UI** — all user-facing text in Thai
- **English code** — variables, functions in English camelCase
- **Date format** — store `YYYY-MM-DD`, display `DD/MM/YYYY (พ.ศ. 4 หลัก)`
- **API calls** — always use `callApi()` with `try/catch` + `showToast()`
- **Loading states** — use `showLoading(btn)` on submit buttons
- **SearchX** — use `acKeyNav()` for all autocomplete inputs

## Only Generate

Files explicitly requested — do not generate unrelated modules.

## File Checklist

- [ ] Feature HTML section (for `page-{feature}` div)
- [ ] Feature JS functions
- [ ] CSS (use CSS variables only)
- [ ] README.md for the feature folder
- [ ] Update `ai/memory/feature-registry.md`

---

## Example Usage

```
Create the appointments feature module.
Follow: CLAUDE.md, architecture.md, debug-agent.md
Scope: frontend/features/appointments/ only
Do not modify: patients, treatments, or shared utilities
```
