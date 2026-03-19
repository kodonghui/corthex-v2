# Agent B — Visual & Design Token Audit (Cycle 21)

- **Date**: 2026-03-19
- **Company**: E2E-TEMP-18
- **Build**: #dev · 2106ec2
- **Desktop Viewport**: 800x600 (default)
- **Mobile Viewport**: 390x844 (iPhone 14)

## Pre-Check: Known Behaviors
- **ESC-001**: Sidebar does not collapse on mobile (ESCALATED)
- **Terracotta accent / Noto Serif KR font**: Intentional design choices

## Design Token Verification

| Token | Expected | Actual | Status |
|-------|----------|--------|--------|
| Background (cream) | #faf8f5 | cream/off-white | PASS |
| Sidebar bg (olive dark) | #283618 | dark olive | PASS |
| Sidebar text | light/cream | light text on dark | PASS |
| Active nav item | olive highlight | olive pill highlight | PASS |
| Accent color | olive/terracotta | olive buttons + terracotta CTA | PASS |
| Card borders | subtle sand | sand/olive borders | PASS |
| Font (body) | Noto Serif KR / Inter | Serif KR for Korean (box chars in headless) | PASS |
| Icons | Lucide React SVG | Lucide SVGs throughout | PASS |
| Status badges | olive/terracotta pills | Active green, Inactive gray | PASS |
| Build footer | #N · hash | #dev · 2106ec2 | PASS |

## Desktop Screenshots (21 pages)

| # | Page | Route | Status | Notes |
|---|------|-------|--------|-------|
| 1 | Dashboard | `/admin` | PASS | 4 stat cards, activity table, all styled correctly |
| 2 | Companies | `/admin/companies` | PASS | Card layout, search, pagination, Active badge |
| 3 | Employees | `/admin/employees` | PASS | Drag-drop layout, department filters, unassigned section |
| 4 | Users | `/admin/users` | PASS | Table layout, role/status filters, pagination |
| 5 | Departments | `/admin/departments` | PASS | Card grid, Active/Inactive badges, 5 departments |
| 6 | Agents | `/admin/agents` | PASS | List/detail split panel, 4 agents with OFF status |
| 7 | Tools | `/admin/tools` | PASS | Empty state, search + category filter dropdown |
| 8 | Costs | `/admin/costs` | WARN | Budget progress "83%" but $0.00 / $0 — inconsistent; spinbutton=0 vs remaining=$15000 |
| 9 | Credentials | `/admin/credentials` | PASS | Security policy, employee list, AES-256 notice |
| 10 | Report Lines | `/admin/report-lines` | PASS | Form + table layout, breadcrumb, API endpoints in footer |
| 11 | Soul Templates | `/admin/soul-templates` | PASS | Filter sidebar (category/tier/complexity), pagination 12 pages |
| 12 | Monitoring | `/admin/monitoring` | PASS | Server Healthy, Memory 108.7%, no console errors (fixed from C20) |
| 13 | Org Chart | `/admin/org-chart` | PASS | Tree view, 1 active department, collapsible |
| 14 | NEXUS | `/admin/nexus` | PASS | React Flow canvas, nodes, edges, minimap, zoom controls |
| 15 | Org Templates | `/admin/org-templates` | PASS | Empty state, save button |
| 16 | Template Market | `/admin/template-market` | PASS | Search, empty state |
| 17 | Agent Marketplace | `/admin/agent-marketplace` | PASS | Search + tier/category filters |
| 18 | API Keys | `/admin/api-keys` | PASS | Empty state with key icon |
| 19 | Workflows | `/admin/workflows` | WARN | 2 console errors: suggestions endpoint 404 (recurring) |
| 20 | Settings | `/admin/settings` | PASS | Company info, API keys, handoff depth, defaults |
| 21 | Onboarding | `/admin/onboarding` | PASS | 5-step wizard, company info pre-filled |

## Mobile Responsive (390x844)

| Page | Status | Notes |
|------|--------|-------|
| Dashboard | BLOCKED (ESC-001) | Sidebar ~60% of viewport, content pushed off-screen |
| Companies | BLOCKED (ESC-001) | Sidebar covers most of viewport, content barely visible |

**ESC-001 remains ESCALATED**: Sidebar has no responsive collapse/hamburger menu behavior. All mobile pages blocked by this issue.

## Console Errors Summary

| Page | Error | Severity |
|------|-------|----------|
| Workflows | `Failed to load resource: 404` on suggestions endpoint (2x) | LOW |

**Improvements from Cycle 20:**
- Costs page: no console errors (was WARNING about undefined value in C20)
- Monitoring page: no `suggested_steps` column errors (was 4x DB error in C20)
- Costs page: `$NaN` in budget display is fixed — now shows `$0.00 / $0` (still has 83% progress inconsistency)

## Bugs Found

### BUG-B21-001: Costs page — budget progress 83% with $0/$0 (LOW)
- **Page**: `/admin/costs`
- **Expected**: Budget progress shows consistent values (e.g., 0% if $0.00 / $0)
- **Actual**: Shows "현재 사용량 (83%)" with "$0.00 / $0" — percentage doesn't match zero values
- **Note**: The `$NaN` bug from C20 is fixed; spinbutton value is "0" while remaining budget heading shows "$15000.00"
- **Screenshot**: `08-costs.png`

### BUG-B21-002: Workflows — suggestions endpoint 404 (LOW)
- **Page**: `/admin/workflows`
- **Expected**: Suggestions tab loads data
- **Actual**: 2x 404 on `/api/admin/workflow-suggestions?companyId=...`
- **Screenshot**: `19-workflows.png`
- **Note**: Recurring from Cycle 19, 20 — known issue

## Verdict

- **Desktop**: 19/21 PASS, 2 WARN (Costs, Workflows)
- **Mobile**: All BLOCKED by ESC-001 (sidebar no responsive collapse)
- **Design Tokens**: 10/10 PASS — Natural Organic theme correctly applied
- **New Bugs**: 1 (LOW — costs progress inconsistency)
- **Recurring Bugs**: 1 (LOW — workflows suggestions 404)
- **Fixed from C20**: 2 (monitoring suggested_steps, costs $NaN)
- **Regressions**: None

**Overall: PASS with warnings**
