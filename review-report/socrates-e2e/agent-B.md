# Agent B: Visual & Layout Verifier
> Tested: 2026-03-17
> Pages: 19/19 tested, 8 bugs found (3 Critical, 3 Major, 2 Minor)

## Design Token Summary
| Token | Expected | Actual | Match |
|-------|----------|--------|-------|
| Background | `#faf8f5` (cream) | `bg-zinc-50` = `#fafafa` | NO |
| Sidebar bg | `#283618` (olive dark) | White (transparent over zinc-50) | NO |
| Accent | `#5a7247` (olive green) | `#556B2F` (close but not exact) | PARTIAL |
| Text primary | `#1a1a1a` | System default | PARTIAL |
| Border | `#e5e1d3` (sand) | Mixed (`zinc-200`, `stone-50`) | NO |
| Font | Inter, Pretendard | `ui-sans-serif, system-ui, sans-serif` (fallback) | NO |
| Icons (sidebar) | Lucide React SVG | Emoji text (📊, 🏛️, 👥, etc.) | NO |
| Icons (content) | Lucide React SVG | Mixed: 2 pages Lucide, 8 pages Material Symbols text | NO |

## Global Issues (Apply to ALL pages)

### BUG-B001: Sidebar uses emoji icons instead of Lucide React SVG
- **Severity: Critical**
- Page: ALL admin pages (sidebar)
- Expected: Lucide React SVG icons per design spec
- Actual: Emoji characters (📊, 🏛️, 👥, 🏢, 🤖, 🔧, 💰, 🔑, 📋, ✨, 🖥️, 🏗️, 🔮, 🛒, 🧠, 🔐, ⚡, ⚙️, ⇄) used for ALL 18 sidebar menu items
- Source: `packages/admin/src/components/sidebar.tsx`
- Screenshot: `screenshots/agent-B/01-dashboard.png`

### BUG-B002: Material Symbols font not loaded — icons render as plain text
- **Severity: Critical**
- Page: 8 content pages (employees, report-lines, monitoring, workflows, settings, soul-templates, nexus, users)
- Expected: Material Symbols icons rendered as vector glyphs
- Actual: Icon names displayed as raw text (e.g., `person_add`, `search`, `dns`, `memory`, `chevron_right`, `account_tree`, `apartment`, `key`)
- Root cause: No Google Fonts `<link>` in `index.html`, no Material Symbols CSS loaded. 68 total `material-symbols-outlined` class usages across 8 files with ZERO font file loaded.
- Source: `packages/admin/index.html` (missing font import)
- Fix option A: Add `<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">` to index.html
- Fix option B (preferred per design spec): Replace all `material-symbols-outlined` spans with Lucide React SVG components
- Screenshots: `screenshots/agent-B/03-employees.png`, `screenshots/agent-B/10-monitoring.png`, `screenshots/agent-B/09b-report-lines.png`

### BUG-B003: Inter/Pretendard font not loaded — using system fallback
- **Severity: Major**
- Page: ALL admin pages
- Expected: `Inter` (latin) + `Pretendard` (Korean) per Natural Organic design spec
- Actual: `ui-sans-serif, system-ui, sans-serif` — browser default fallback
- Root cause: No font import in `index.html` or CSS
- Source: `packages/admin/index.html`, `packages/admin/src/index.css`

### BUG-B004: Root background uses zinc-50 instead of cream #faf8f5
- **Severity: Major**
- Page: ALL admin pages (layout shell)
- Expected: `#faf8f5` (Natural Organic cream background)
- Actual: `bg-zinc-50` = `#fafafa` (Tailwind default gray)
- Source: `packages/admin/src/components/layout.tsx` line 40
- Note: Some content pages DO use `#faf8f5` for hover states, but the shell background is wrong

### BUG-B005: Sidebar background is white, not olive dark #283618
- **Severity: Major**
- Page: ALL admin pages
- Expected: `#283618` olive dark sidebar with `#a3c48a` light green text
- Actual: White/transparent sidebar background with dark text
- Source: `packages/admin/src/components/sidebar.tsx`
- Screenshot: `screenshots/agent-B/01-dashboard.png`

## Per-Page Results

### 1. /admin/ (dashboard)
- **Content**: Loads with 4 stat cards, revenue chart, active sessions, alerts table
- **Layout**: Sidebar left + main content, correct structure
- **Icons**: 3 Lucide SVG + 4 other SVG (chart icons) — OK for content area
- **Material Symbols**: None found
- **Console errors**: 6 (500s on /api/admin/costs/summary, /api/admin/budget, /api/admin/agents)
- **Verdict**: OK (content icons), affected by BUG-B001/B003/B004/B005

### 2. /admin/companies
- **Content**: Company Management, 3 companies listed, search, Add Company button
- **Layout**: Correct card-based layout
- **Icons**: 16 Lucide SVG icons — BEST page for icon compliance
- **Material Symbols**: None
- **Console errors**: 1 (500 on companies endpoint)
- **Verdict**: OK (content icons), affected by global BUGs

### 3. /admin/employees
- **Content**: Employee Assignment page, 2 employees, drag-and-drop department assignment
- **Icons**: 0 SVG, 0 Lucide, 11 Material Symbols text
- **Material Symbols found**: `person_add`, `search`, `person_search`, `filter_list`, `drag_indicator`, `add`, `close`, `add_circle`
- **Verdict**: BUG-B002 applies (Critical visual defect)
- **Screenshot**: `screenshots/agent-B/03-employees.png`

### 4. /admin/departments
- **Content**: 부서 관리, department cards with member counts, status badges
- **Layout**: Card grid layout
- **Icons**: 18 SVG, 0 Lucide, 0 Material Symbols
- **Verdict**: OK (uses inline SVG, not Lucide class names but functional)

### 5. /admin/agents
- **Content**: Agent Management, "등록된 에이전트가 없습니다" empty state
- **Icons**: 1 SVG, 0 Lucide, 0 Material Symbols
- **Empty state**: Shows message — OK
- **Verdict**: OK

### 6. /admin/credentials
- **Content**: CLI 인증 관리, AES-256 security notice, user token list
- **Icons**: 2 SVG, 0 Lucide, 0 Material Symbols
- **Verdict**: OK
- **Screenshot**: `screenshots/agent-B/06-credentials.png`

### 7. /admin/tools
- **Content**: Admin Tools, tool definition management
- **Icons**: 2 SVG, 0 Lucide, 0 Material Symbols
- **Verdict**: OK

### 8. /admin/costs
- **Content**: 비용 및 예산 관리, budget settings, department/agent/model breakdowns
- **Icons**: 7 SVG (chart icons), 0 Lucide, 0 Material Symbols
- **Console errors**: 10+ (multiple 500s on budget/costs/summary endpoints)
- **Verdict**: OK (icons), BUG on API errors (not visual)

### 9. /admin/soul-templates
- **Content**: Navigates to /admin/employees (routing issue)
- **Material Symbols**: 11 (inherits from employees page)
- **Verdict**: BUG-B006 — Routing anomaly, soul-templates redirects to employees

### 10. /admin/monitoring
- **Content**: System Monitoring — Server Status, Memory, Database, Errors (24h)
- **Material Symbols found**: `dns`, `memory`, `database`, `warning`
- **Icons**: 0 SVG, 0 Lucide
- **Console errors**: 4 (budget/costs 500s)
- **Verdict**: BUG-B002 applies
- **Screenshot**: `screenshots/agent-B/10-monitoring.png`

### 11. /admin/org-chart
- **Content**: Empty (mainHasContent: false)
- **Icons**: 0 SVG, 0 Lucide, 0 Material Symbols
- **Verdict**: BUG-B007 — Page loads blank, no content or empty state message

### 12. /admin/nexus
- **Content**: Empty (mainHasContent: false)
- **Icons**: 0 SVG, 0 Lucide, 0 Material Symbols
- **Note**: nexus.tsx has 13 material-symbols-outlined usages in source, but content did not render
- **Verdict**: BUG-B007 — Page loads blank

### 13. /admin/org-templates
- **Content**: "조직 템플릿 | 템플릿을 불러올 수 없습니다. | 다시 시도"
- **Icons**: 0 SVG, 0 Lucide, 0 Material Symbols
- **Verdict**: Error state shown (API failure), but at least visible — Minor

### 14. /admin/template-market
- **Content**: Navigates to /admin/credentials (routing issue)
- **Verdict**: BUG-B006 — Routing anomaly

### 15. /admin/agent-marketplace
- **Content**: 에이전트 마켓, category/tier filters, marketplace listing
- **Icons**: 0 SVG, 0 Lucide, 0 Material Symbols
- **Verdict**: OK

### 16. /admin/api-keys
- **Content**: Navigates to /admin/employees (routing issue)
- **Verdict**: BUG-B006 — Routing anomaly

### 17. /admin/workflows
- **Content**: Workflows manager, CORTHEX v2, All Workflows / Suggestions tabs, empty state
- **Material Symbols found**: `hub`, `account_tree`, `tips_and_updates`, `settings`
- **Icons**: 0 SVG, 0 Lucide
- **Empty state**: "No workflows yet" with `account_tree` text icon
- **Verdict**: BUG-B002 applies
- **Screenshot**: `screenshots/agent-B/17-workflows.png` (captured settings instead due to auto-nav)

### 18. /admin/settings
- **Content**: Settings — Company Info, API Key Management sections
- **Material Symbols found**: `apartment`, `key`, `swap_horiz`, `tune`
- **Icons**: 0 SVG, 0 Lucide
- **Verdict**: BUG-B002 applies
- **Screenshot**: (captured in settings screenshot — shows `apartment` and `key` text)

### 19. /admin/onboarding
- **Content**: 5-step onboarding wizard (COMPANY, DEPARTMENTS, AGENTS, CLI TOKEN, COMPLETE)
- **Icons**: 0 SVG, 0 Lucide, 0 Material Symbols
- **Verdict**: OK — Clean layout, no icon issues
- **Screenshot**: `screenshots/agent-B/19-onboarding.png`

### Extra: /admin/report-lines (not in original 19, found in sidebar)
- **Content**: 보고 라인 설정, breadcrumb, reporter/supervisor form, table
- **Material Symbols found**: `chevron_right`, `notifications`, `search`, `person_search`, `manage_accounts`, `add`, `delete`, `chevron_left`
- **Verdict**: BUG-B002 applies (worst affected page)
- **Screenshot**: `screenshots/agent-B/09b-report-lines.png`

## Bug Summary

### BUG-B001: Sidebar emoji icons instead of Lucide SVG
- **Severity**: Critical
- **Impact**: ALL 19 pages
- **Source**: `packages/admin/src/components/sidebar.tsx`

### BUG-B002: Material Symbols rendered as plain text (font not loaded)
- **Severity**: Critical
- **Impact**: 8+ pages (employees, report-lines, monitoring, workflows, settings, soul-templates, nexus, users)
- **Source**: `packages/admin/index.html` (missing font), 68 usages across 8 source files
- **Affected files**:
  - `packages/admin/src/pages/employees.tsx` (8 usages)
  - `packages/admin/src/pages/report-lines.tsx` (9 usages)
  - `packages/admin/src/pages/monitoring.tsx` (5 usages)
  - `packages/admin/src/pages/workflows.tsx` (9 usages)
  - `packages/admin/src/pages/settings.tsx` (4 usages)
  - `packages/admin/src/pages/soul-templates.tsx` (13 usages)
  - `packages/admin/src/pages/nexus.tsx` (13 usages)
  - `packages/admin/src/pages/users.tsx` (7 usages)

### BUG-B003: Inter/Pretendard font not loaded
- **Severity**: Major
- **Impact**: ALL pages
- **Source**: `packages/admin/index.html`

### BUG-B004: Wrong background color (zinc-50 vs cream #faf8f5)
- **Severity**: Major
- **Impact**: ALL pages (layout shell)
- **Source**: `packages/admin/src/components/layout.tsx:40`

### BUG-B005: Sidebar white instead of olive dark #283618
- **Severity**: Major
- **Impact**: ALL pages
- **Source**: `packages/admin/src/components/sidebar.tsx`

### BUG-B006: SPA routing anomalies — pages redirect to wrong routes
- **Severity**: Minor (may be timing/race condition in headless mode)
- **Impact**: Observed on soul-templates -> employees, template-market -> credentials, api-keys -> employees, agents -> costs
- **Note**: These may be transient SPA routing issues under Playwright automation; needs manual verification

### BUG-B007: Blank pages — org-chart and nexus load with empty content
- **Severity**: Minor (may need interaction to initialize, e.g. React Flow canvas)
- **Impact**: /admin/org-chart, /admin/nexus

### BUG-B008: Persistent 500 errors on budget/costs APIs
- **Severity**: Minor (visual — shows loading states or empty data)
- **Impact**: Dashboard, costs page, and budget-dependent widgets
- **Console errors**: `/api/admin/budget`, `/api/admin/costs/summary` return 500 on every page load
- **Note**: Reported as API issue, not purely visual

## Icon Architecture Analysis

The admin app has TWO incompatible icon systems:
1. **Lucide React** (correct per spec): Used in only 2 pages (`dashboard.tsx`, `companies.tsx`)
2. **Material Symbols Outlined** (incorrect per spec): Used in 8 pages via `<span className="material-symbols-outlined">icon_name</span>` pattern, with NO font loaded

This dual approach creates an inconsistent visual experience where some pages have proper SVG icons and others show raw text like "person_add" or "dns".

## Recommendation Priority
1. **P0 (Critical)**: Load Material Symbols font OR migrate all 68 usages to Lucide React
2. **P0 (Critical)**: Replace sidebar emojis with Lucide React SVG icons
3. **P1 (Major)**: Add Inter + Pretendard font imports
4. **P1 (Major)**: Fix layout.tsx background to `#faf8f5`
5. **P1 (Major)**: Fix sidebar background to `#283618` with `#a3c48a` text
6. **P2**: Investigate routing anomalies
7. **P2**: Fix org-chart/nexus blank rendering
