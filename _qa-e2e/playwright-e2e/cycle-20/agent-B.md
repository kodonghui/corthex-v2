# Agent B — Visual & Design Token Audit (Cycle 20)

- **Date**: 2026-03-19
- **Company**: E2E-TEMP-18
- **Build**: #610 · 2106ec2
- **Desktop Viewport**: 1280x720 (default)
- **Mobile Viewport**: 390x844 (iPhone 14)

## Pre-Check: Known Behaviors
- **ESC-001**: Sidebar does not collapse on mobile (ESCALATED)
- **Terracotta accent / Noto Serif KR font**: Intentional design choices

## Design Token Verification

| Token | Expected | Actual | Status |
|-------|----------|--------|--------|
| Background (cream) | #faf8f5 | cream/off-white ✓ | PASS |
| Sidebar bg (olive dark) | #283618 | dark olive ✓ | PASS |
| Sidebar text | light/cream | light text on dark ✓ | PASS |
| Active nav item | olive highlight | olive pill highlight ✓ | PASS |
| Accent color | olive/terracotta | olive buttons + terracotta CTA ✓ | PASS |
| Card borders | subtle sand | sand/olive borders ✓ | PASS |
| Font (body) | Noto Serif KR / Inter | Serif KR for Korean ✓ | PASS |
| Icons | Lucide React SVG | Lucide SVGs throughout ✓ | PASS |
| Status badges | olive/terracotta pills | green Active, gray Inactive ✓ | PASS |
| Build footer | #N · hash | #610 · 2106ec2 ✓ | PASS |

## Desktop Screenshots (21 pages)

| # | Page | Route | Status | Notes |
|---|------|-------|--------|-------|
| 1 | Dashboard | `/admin` | PASS | 4 stat cards, activity table, all styled correctly |
| 2 | Companies | `/admin/companies` | PASS | Card layout, search, pagination |
| 3 | Employees | `/admin/employees` | PASS | Drag-drop layout, department filters |
| 4 | Users | `/admin/users` | PASS | Table layout, filters, pagination |
| 5 | Departments | `/admin/departments` | PASS | Card grid, Active/Inactive badges |
| 6 | Agents | `/admin/agents` | PASS | List/detail split panel, OFF status badges |
| 7 | Tools | `/admin/tools` | PASS | Empty state with proper messaging |
| 8 | Costs | `/admin/costs` | WARN | Console warning: "undefined" value for input; `$0.00 / $NaN` in budget progress bar |
| 9 | Credentials | `/admin/credentials` | PASS | Security policy, employee list |
| 10 | Report Lines | `/admin/report-lines` | PASS | Form + table layout, breadcrumb |
| 11 | Soul Templates | `/admin/soul-templates` | PASS | Filter sidebar, pagination |
| 12 | Monitoring | `/admin/monitoring` | WARN | 4x DB error: `column "suggested_steps" does not exist` |
| 13 | Org Chart | `/admin/org-chart` | PASS | Tree view, department collapsible |
| 14 | NEXUS | `/admin/nexus` | PASS | React Flow canvas, nodes, edges, minimap |
| 15 | Org Templates | `/admin/org-templates` | PASS | Empty state, save button |
| 16 | Template Market | `/admin/template-market` | PASS | Search, empty state |
| 17 | Agent Marketplace | `/admin/agent-marketplace` | PASS | Search + tier/category filters |
| 18 | API Keys | `/admin/api-keys` | PASS | Empty state with key icon |
| 19 | Workflows | `/admin/workflows` | WARN | 2 console errors: suggestions endpoint 404 |
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
| Costs | `WARNING: The specified value "undefined" cannot be parsed` (input element) | LOW |
| Monitoring | `column "suggested_steps" does not exist` (4 events, DB error) | MEDIUM |
| Workflows | `Failed to load resource: 404` on suggestions endpoint (2x) | LOW |

## Bugs Found

### BUG-B20-001: Costs page — `$NaN` in budget progress bar (LOW)
- **Page**: `/admin/costs`
- **Expected**: Budget progress shows `$0.00 / $15,000.00`
- **Actual**: Shows `$0.00 / $NaN` — budget limit spinbutton value not parsing correctly
- **Console**: `WARNING: The specified value "undefined" cannot be parsed`
- **Screenshot**: `08-costs.png`

### BUG-B20-002: Monitoring — missing `suggested_steps` column (MEDIUM)
- **Page**: `/admin/monitoring`
- **Expected**: Errors section loads without DB errors
- **Actual**: 4x `column "suggested_steps" does not exist` — likely missing DB migration
- **Screenshot**: `12-monitoring.png`

### BUG-B20-003: Workflows — suggestions endpoint 404 (LOW)
- **Page**: `/admin/workflows`
- **Expected**: Suggestions tab loads data
- **Actual**: 2x 404 on `/api/admin/workflow-suggestions?companyId=...`
- **Screenshot**: `19-workflows.png`
- **Note**: Seen in previous cycles — known recurring issue

## Verdict

- **Desktop**: 18/21 PASS, 3 WARN (Costs, Monitoring, Workflows)
- **Mobile**: All BLOCKED by ESC-001 (sidebar no responsive collapse)
- **Design Tokens**: 10/10 PASS — Natural Organic theme correctly applied
- **New Bugs**: 3 (1 MEDIUM, 2 LOW)
- **Regressions**: None — no new visual regressions vs Cycle 19

**Overall: PASS with warnings**
