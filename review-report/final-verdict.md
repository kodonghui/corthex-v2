# Final Code Review Report

## Pipeline: KDH v3.0 (Universal) — Full Codebase Audit
## Date: 2026-03-17
## Project: CORTHEX v2 (Monorepo: server + admin + app + ui + shared)

---

## Final Verdict: BLOCK
## Final Score: 3.8/10

### Score Breakdown
| Critic | Score | Weight | Weighted |
|--------|-------|--------|----------|
| Security | 3/10 | x3 | 9 |
| Architecture | 5/10 | x2 | 10 |
| UX & Performance | 3/10 | x1 | 3 |
| **Total** | | /6 | **3.7** |

---

### Phase Summary
| Phase | Status | Key Finding |
|-------|--------|-------------|
| 0. Detection | ✅ Complete | Monorepo, Bun, React 19, Vite 6, Zustand |
| 1. Static Gate | ⚠️ CONDITIONAL PASS | 2 prod errors (lucide-react missing in admin node_modules) |
| 2A. Static E2E | ⏭️ SKIPPED | No existing Playwright specs |
| 2B. Socrates E2E | ❌ FAIL | 16 bugs (6 Critical, 6 Major, 4 Minor) |
| 3. Risk | ASK | Full audit = maximum scrutiny |
| 4-5. Verdict | BLOCK | Score 3.8 < 6.0 threshold |

---

## Critical Issues (6) — Must Fix Before Ship

### 1. [SECURITY] No Client-Side Auth Guard on Admin Routes
- **All 19 admin routes accessible without authentication**
- SPA renders full layout, sidebar, company names, user info
- APIs enforce auth (mitigating) but UI shell leaks sensitive structure
- **Fix**: Auth guard in React Router → redirect to /admin/login

### 2. [VISUAL] Material Symbols Rendered as Plain Text
- 68 usages of `material-symbols-outlined` CSS class across 8 pages
- Font never imported → "person_add", "dns", "memory" displayed as text
- **Pages**: employees, report-lines, monitoring, workflows, settings, soul-templates, nexus, users
- **Fix**: Replace ALL 68 with Lucide React components

### 3. [VISUAL] Sidebar Uses Emoji Instead of Lucide SVG
- ALL 18 sidebar menu items use emoji (📊🏛️👥...) instead of Lucide icons
- **Fix**: Update sidebar.tsx to use Lucide React imports

### 4. [FUNCTIONAL] Onboarding Page Blank
- /admin/onboarding renders empty content area, redirects away
- New company setup flow completely broken
- **Fix**: Route structure or mounting race condition

### 5. [SERVER] UUID "system" Error — Root Cause of 8+ API 500s
- Admin JWT companyId = "system" (not UUID) → DB query parse error
- Monitoring shows 100 events/24h
- **Causes**: agents, budget, costs, workflows, soul-templates, org-chart, api-keys ALL return 500
- **Fix**: Audit ALL admin server routes — use query/body companyId, not JWT

### 6. [FUNCTIONAL] Phantom SPA Route Navigation
- Pages auto-redirect to random routes within seconds
- Blocks all interactive testing and likely affects real users
- **Caused by**: Cascading 500 errors (fix #5 first)

---

## Major Issues (6)

| # | Category | Issue | Fix |
|---|----------|-------|-----|
| 1 | Visual | Inter/Pretendard font not loaded | Add font imports to index.html |
| 2 | Visual | Background zinc-50 instead of #faf8f5 | Update layout.tsx |
| 3 | Visual | Sidebar white instead of olive #283618 | Update sidebar.tsx |
| 4 | Data | Agent count mismatch (4 vs 0) | Fix API 500 (Critical #5) |
| 5 | Functional | Costs: "$$0" display + wrong 83% | Fix template + API |
| 6 | Security | Company names leaked to unauth users | Fix Critical #1 |

---

## Minor Issues (4)

| # | Issue |
|---|-------|
| 1 | Company slug typo "slect-star" |
| 2 | Duplicate API calls on every page |
| 3 | Build info (#567 · 58278fb) exposed |
| 4 | Org-chart/Nexus blank pages |

---

## Positive Findings

- ✅ **companyId client-side fix VERIFIED** — 0 UUID errors in browser (Agent D)
- ✅ **19/19 pages load** without crash or ChunkLoadError
- ✅ **Session persistence** maintained across all navigation
- ✅ **Sidebar consistent** structure across all pages
- ✅ **Credential masking** working (no API keys exposed in DOM)
- ✅ **Companies + Dashboard** pages have proper Lucide React icons
- ✅ **CRUD UI elements** present (buttons, forms, modals exist)

---

## Root Cause Analysis

### Root Cause 1: Server-side companyId handling (Critical #5)
The `58278fb` fix added client-side companyId auto-injection, but several server routes still fall back to JWT companyId ("system"). This one fix would resolve 4+ bugs.

### Root Cause 2: UXUI migration incomplete
Admin app is mid-migration from old design system (Material Symbols + emoji + zinc palette) to Natural Organic (Lucide + olive/cream). Only 2 of 26 pages fully migrated.

---

## Recommended Fix Priority

```
Phase 1 (Unblocks everything):
  └── Fix #5: Server admin routes companyId handling
      → Fixes: agents, costs, workflows, budget, soul-templates, org-chart APIs
      → Fixes: phantom navigation (cascade from 500 errors)

Phase 2 (Security):
  └── Fix #1: Add auth guard to admin routes

Phase 3 (Visual — batch migration):
  ├── Fix #2: Replace 68 Material Symbols → Lucide React
  ├── Fix #3: Replace sidebar emojis → Lucide React  
  ├── Font imports (Inter + Pretendard)
  ├── Background color #faf8f5
  └── Sidebar color #283618

Phase 4 (Functional):
  ├── Fix #4: Onboarding route/rendering
  └── Fix costs display ($$0, 83%)

Phase 5 (Minor):
  └── Slug typo, duplicate calls, build info, blank pages
```

---

## Report Files
- `review-report/phase-0-detection.md` — Project auto-detection
- `review-report/phase-1-static.md` — TypeScript check results
- `review-report/phase-2b-socrates.md` — Aggregated E2E results
- `review-report/phase-3-risk.md` — Risk classification
- `review-report/socrates-e2e/agent-A.md` — Functional testing (8 bugs)
- `review-report/socrates-e2e/agent-B.md` — Visual testing (8 bugs)
- `review-report/socrates-e2e/agent-C.md` — Security testing (7 bugs)
- `review-report/socrates-e2e/agent-D.md` — Regression testing (1 bug)
- `review-report/socrates-e2e/phase-2b-preflight.md` — Pre-flight config
