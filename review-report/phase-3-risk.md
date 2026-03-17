# Phase 3: Risk Classification — Full Codebase Audit

## Mode: Full (all files)
## Risk Score: 100+ (ASK — maximum scrutiny)

### Rationale
- Full codebase audit = all files in scope
- Entry files changed (App.tsx, layout.tsx, sidebar.tsx) → force HIGH
- Design tokens incomplete → force HIGH
- Auth guard missing → force HIGH
- 6 Critical bugs found in Phase 2B → maximum depth required

### Classification
| Category | Files | Risk |
|----------|-------|------|
| Auth/Security | admin auth-store, protected routes | HIGH |
| Layout/Shell | layout.tsx, sidebar.tsx | HIGH |
| Entry/Router | App.tsx (admin + app) | HIGH |
| Server Routes | admin/* (8+ returning 500) | HIGH |
| Pages | 26 admin pages | MEDIUM-HIGH |
| Design Tokens | tailwind.config, index.css | HIGH |
| Tests | ~40 test files | LOW |

**Verdict: ASK (full deep review)**
