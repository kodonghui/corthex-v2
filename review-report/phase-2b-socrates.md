# Phase 2B: Socrates Dynamic E2E — Aggregated Report

## Date: 2026-03-17
## Agents: 4 (A=Functional, B=Visual, C=Edge/Security, D=Regression)
## Pages Tested: 19/19 admin routes + /admin/onboarding

---

## Score: 4.5/10 (FAIL)

### Gate Results
| Gate | Criteria | Result |
|------|----------|--------|
| Critical bugs = 0 | Required | **FAIL** (6 Critical) |
| Security bugs = 0 | Required | **FAIL** (3 Security) |
| Page load rate >= 80% | Required | PASS (19/19 = 100%) |
| ChunkLoadError = 0 | Required | PASS (0 found) |

---

## Critical Bugs (6)

### CRIT-1: No Client-Side Auth Guard (BUG-C001)
- **Type**: Security
- **Impact**: ALL admin pages accessible without login
- **Detail**: SPA renders full admin layout (sidebar, company dropdown, user info) without JWT check. APIs enforce auth but UI shell leaks route structure, company names, user info.
- **Fix**: Add auth guard in React Router to redirect to /admin/login if no token.

### CRIT-2: Material Symbols Rendered as Plain Text (BUG-B002)
- **Type**: Visual
- **Impact**: 8 pages show icon names as text ("person_add", "dns", "memory", etc.)
- **Pages**: employees, report-lines, monitoring, workflows, settings, soul-templates, nexus, users
- **Root cause**: `material-symbols-outlined` CSS class used in 68 places, but font never loaded
- **Fix**: Replace all 68 Material Symbols usages with Lucide React components

### CRIT-3: Sidebar Uses Emoji Instead of Lucide SVG Icons (BUG-B001)
- **Type**: Visual
- **Impact**: ALL 19 pages — sidebar uses 📊🏛️👥🏢🤖🔧💰🔑📋✨🖥️🏗️🔮🛒🧠🔐⚡⚙️⇄
- **Fix**: Replace emoji characters with Lucide React SVG icons in sidebar.tsx

### CRIT-4: Onboarding Page Renders Blank (BUG-A001)
- **Type**: Functional
- **Impact**: New company onboarding flow completely broken
- **Detail**: /admin/onboarding renders empty <main>, then redirects away
- **Fix**: Move onboarding route outside Layout, or fix mounting race condition

### CRIT-5: UUID "system" Error — Root Cause of Multiple 500s (BUG-A007)
- **Type**: Server
- **Impact**: 8+ API endpoints return 500, monitoring shows 100 events/24h
- **Detail**: Admin JWT companyId = "system" (not UUID) → passed to DB queries → parse error
- **Root cause of**: BUG-A002 (agents 500), BUG-A005 (costs 500), BUG-A006 (workflows 500), BUG-C002 (6 API 500s)
- **Fix**: Audit ALL admin routes to use query/body companyId instead of JWT companyId

### CRIT-6: Phantom SPA Route Navigation (BUG-A008/C003)
- **Type**: Functional
- **Impact**: Pages auto-redirect to random routes within seconds, blocking all interaction
- **Note**: Agent D did NOT experience this (possibly timing-dependent). Agents A and C experienced it consistently.
- **Root cause theory**: Cascading 500 errors from React Query trigger error boundaries/retries that destabilize router
- **Fix**: Fix CRIT-5 first (API 500s), add retry:false for failing queries

---

## Major Bugs (6)

### MAJ-1: Inter/Pretendard Font Not Loaded (BUG-B003)
- ALL pages use system fallback font instead of design spec fonts

### MAJ-2: Wrong Background Color — zinc-50 vs #faf8f5 (BUG-B004)
- Layout shell uses Tailwind zinc-50 (#fafafa) instead of Natural Organic cream (#faf8f5)

### MAJ-3: Sidebar White Instead of Olive Dark #283618 (BUG-B005)
- Sidebar background is white/transparent, should be dark olive per design spec

### MAJ-4: Agent Count Inconsistency (BUG-A003)
- Companies shows "4 agents" but Agents page shows 0 (due to API 500)

### MAJ-5: Costs Page Double Dollar Sign (BUG-A005)
- Budget displays "$$0" and shows "83%" usage when values are $0/$0

### MAJ-6: Company Names Leaked to Unauthenticated Users (BUG-C006)
- Company dropdown shows real names without authentication

---

## Minor Bugs (4)

### MIN-1: Company Slug Typo "slect-star" (BUG-A004)
### MIN-2: Duplicate API Calls on Every Page (BUG-C005)
### MIN-3: Build Info Exposed in Sidebar (BUG-C007)
### MIN-4: Org-chart/Nexus Blank Pages (BUG-B007)

---

## De-duplicated Bug Matrix

| ID | Source | Title | Severity |
|----|--------|-------|----------|
| CRIT-1 | C001 | No auth guard on admin routes | Critical/Security |
| CRIT-2 | B002 | Material Symbols text (font not loaded) | Critical/Visual |
| CRIT-3 | B001 | Sidebar emoji icons | Critical/Visual |
| CRIT-4 | A001 | Onboarding page blank | Critical/Functional |
| CRIT-5 | A007 | UUID "system" → 500 errors (ROOT CAUSE) | Critical/Server |
| CRIT-6 | A008+C003 | Phantom route navigation | Critical/Functional |
| MAJ-1 | B003 | Font not loaded | Major/Visual |
| MAJ-2 | B004 | Wrong background color | Major/Visual |
| MAJ-3 | B005 | Wrong sidebar background | Major/Visual |
| MAJ-4 | A003 | Agent count mismatch | Major/Data |
| MAJ-5 | A005 | Costs double dollar + wrong % | Major/Functional |
| MAJ-6 | C006 | Company names leaked | Major/Security |
| MIN-1 | A004 | Slug typo "slect-star" | Minor/Data |
| MIN-2 | C005 | Duplicate API calls | Minor/Performance |
| MIN-3 | C007 | Build info exposed | Minor/Security |
| MIN-4 | B007 | Org-chart/Nexus blank | Minor/Functional |

**Total: 16 unique bugs (6 Critical, 6 Major, 4 Minor)**

---

## Positive Findings

1. ✅ companyId UUID error on CLIENT side is FIXED (Agent D: 0 UUID errors in browser)
2. ✅ 19/19 pages load (no crashes, no ChunkLoadError)
3. ✅ Session persistence maintained across all navigation (Agent D)
4. ✅ Sidebar structure consistent across all pages
5. ✅ Credentials page properly masks API keys (no exposure)
6. ✅ CRUD UI elements present on relevant pages (buttons, forms exist)
7. ✅ Companies page: Lucide React icons fully implemented (16 SVGs)
8. ✅ Dashboard: Mixed Lucide + SVG icons working

---

## Root Cause Analysis

The majority of bugs trace to **two root causes**:

### Root Cause 1: Admin JWT companyId = "system" (CRIT-5)
Server admin routes use JWT companyId ("system") for DB queries instead of query/body companyId.
The recent fix (58278fb) added client-side auto-injection, but server routes still have fallback paths.
**Cascade**: CRIT-5 → CRIT-6 → MAJ-4 → MAJ-5 (and BUG-A002, A006, C002)

### Root Cause 2: UXUI Redesign Incomplete (CRIT-2, CRIT-3, MAJ-1/2/3)
Admin app is mid-migration between old design (Material Symbols + emoji) and new Natural Organic theme (Lucide + olive/cream).
- 2/26 pages fully migrated (companies, dashboard)
- 8/26 pages still use Material Symbols without font loaded
- Sidebar still uses emoji instead of Lucide SVG
- Layout colors not updated to Natural Organic tokens

---

## Agent Performance

| Agent | Pages | Bugs Found | Unique Insights |
|-------|-------|------------|-----------------|
| A (Functional) | 9/9 | 8 | Root cause: UUID "system" in monitoring logs |
| B (Visual) | 19/19 | 8 | Icon architecture analysis (2 systems), font gap |
| C (Edge/Security) | 19/19 | 7 | Auth bypass on ALL routes, phantom nav correlation |
| D (Regression) | 19/19 | 1 | companyId fix VERIFIED, session stable |

---

## Recommendations (Priority Order)

1. **P0**: Fix server admin routes UUID handling (CRIT-5) — this fixes 4+ downstream bugs
2. **P0**: Add client-side auth guard (CRIT-1)
3. **P0**: Replace Material Symbols with Lucide React (CRIT-2) — 68 usages across 8 files
4. **P0**: Replace sidebar emojis with Lucide icons (CRIT-3)
5. **P1**: Fix onboarding page rendering (CRIT-4)
6. **P1**: Apply Natural Organic design tokens (MAJ-1/2/3)
7. **P2**: Fix minor data/display issues (MIN-1 through MIN-4)
