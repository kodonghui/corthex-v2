# Agent B — Visual Report (Cycle 18)

**Date**: 2026-03-19
**Viewport**: 390×844 (mobile)
**Target Company**: E2E-TEMP-18 (id: d0131c54-1907-4a37-b3ca-1d0bf8e99fff)
**Target URL**: https://corthex-hq.com/admin

## Status: COMPLETED

## Pre-Check

| Item | Status |
|------|--------|
| known-behaviors.md | Read (KB-001~KB-008) |
| ESCALATED.md | Read (ESC-001 still active — 5+ cycles) |

## Screenshots Taken (20 pages)

| # | Page | File | Notes |
|---|------|------|-------|
| 00 | Login | 00-login.png | Cream bg, olive button — correct |
| 02 | Onboarding | 02-onboarding.png | 5-step wizard, sidebar overlaps (ESC-001) |
| 03 | Dashboard | 03-dashboard.png | Stats: 2 depts, 1 user, 1 agent, 0 online |
| 04 | Companies | 04-companies.png | 1 company card, terracotta Add button (intentional) |
| 05 | Employees | 05-employees.png | Drag-drop assignment UI, 1 unassigned user |
| 06 | Users | 06-users.png | Table with E2E test user, Active status |
| 07 | Departments | 07-departments.png | 2 dept cards (테스트부서-수정됨, 에이전트부서) |
| 08 | Agents | 08-agents.png | 1 agent (테스트에이전트-수정됨), detail panel |
| 09 | Tools | 09-tools.png | Empty state, category filter dropdown |
| 10 | Costs | 10-costs.png | $0.00 correct (KB-006), no $$0 bug |
| 11 | Credentials | 11-credentials.png | AES-256 security notice, user list |
| 12 | Report Lines | 12-report-lines.png | 1 report line (E2E user → top level) |
| 13 | Soul Templates | 13-soul-templates.png | Filter sidebar (Category/Tier/Tool) |
| 14 | Monitoring | 14-monitoring.png | Server Healthy, DB 70ms, 3 errors |
| 15 | Org Chart | 15-org-chart.png | Tree view: company → department |
| 16 | NEXUS | 16-nexus.png | React Flow canvas with nodes+edges |
| 17 | Org Templates | 17-org-templates.png | Empty state |
| 18 | Template Market | 18-template-market.png | Empty, search input |
| 19 | Agent Marketplace | 19-agent-marketplace.png | Empty, category/tier filters |
| 20 | API Keys | 20-api-keys.png | Empty state with key icon |
| 21 | Workflows | 21-workflows.png | Empty, 2 console 500 errors |
| 22 | Settings | 22-settings.png | Company info, API keys, handoff depth, defaults |

## Design Token Compliance

| Check | Expected | Actual | Pass? |
|-------|----------|--------|-------|
| Background | cream #faf8f5 | Cream/off-white | ✅ |
| Sidebar bg | dark olive #283618 | Dark olive green | ✅ |
| Accent/buttons | olive #5a7247 | Olive green buttons | ✅ |
| Active sidebar item | olive highlight | Olive with lighter bg | ✅ |
| Icons | Lucide React SVG | SVG icons throughout | ✅ |
| No blue accents | no blue | No blue found | ✅ |
| Font (English) | Inter | Renders correctly | ✅ |
| Font (Korean, sidebar) | Noto Serif KR | Renders correctly | ✅ |
| Korean (content area) | Should render | Mixed — some pages OK, some boxes | ⚠️ |
| Company dropdown | olive border | Olive-styled dropdown | ✅ |
| Status badges | olive/green | Active=green, Inactive=gray | ✅ |
| "Add" buttons | terracotta/orange-red | Terracotta (intentional) | ✅ |

## ESC-001 Confirmation

**Mobile sidebar not responsive** — confirmed again in cycle 18.
- Sidebar is always visible at 390px width
- Overlaps main content area on every page
- Content area is partially hidden behind sidebar
- No hamburger menu toggle exists

## Console Errors

| Error | Page | Severity |
|-------|------|----------|
| `/api/workspace/workflows/suggestions` → 500 | Workflows | P3 |
| `/api/workspace/workflows/suggestions` → 500 | Workflows (duplicate) | P3 |

Total: 2 errors (both from workflows page)

## Bugs Found

### BUG-B001: Korean Font Not Rendering on Some Content Pages (P3)
- **Severity**: P3 (cosmetic, may be headless-only)
- **Pages affected**: Tools, Costs, Employees, Report Lines, Credentials, Settings (content area)
- **Pages OK**: Template Market, Agent Marketplace, API Keys, Onboarding
- **Behavior**: Korean characters render as □ (tofu/boxes) in the main content area
- **Sidebar**: Korean renders correctly throughout (Noto Serif KR loaded)
- **Likely cause**: Headless Chromium missing CJK font fallback for content area. May not reproduce in real browsers. The sidebar uses a font that has CJK glyphs loaded; content area relies on Inter which doesn't have CJK and falls back to a missing system font.
- **Recommendation**: Verify in real browser before fixing. If real, add `Noto Sans KR` or `Noto Serif KR` as fallback in the body `font-family` CSS.

### BUG-B002: Workflows Suggestions API 500 Error (P3)
- **Severity**: P3
- **Page**: /admin/workflows
- **Error**: `GET /api/workspace/workflows/suggestions?companyId=...` → 500
- **Impact**: "Suggestions" tab may not load. Non-critical.

### BUG-B003: Onboarding Redirect Loop on Full Page Navigation (P2)
- **Severity**: P2
- **Behavior**: Navigating to any page via direct URL (not sidebar click) redirects to /admin/onboarding even after completing onboarding
- **Root cause**: The `onboardingCompleted` setting is saved, but the redirect check may be based on department/agent count rather than the setting — or the setting isn't persisted correctly
- **Workaround**: Use sidebar links (client-side SPA navigation) instead of full page loads
- **Impact**: Users who bookmark or share page URLs will always land on onboarding

## Known Behaviors Confirmed (NOT bugs)
- KB-001: Dashboard shows 0 for System Health (fresh company) ✓
- KB-005: Monitoring shows 0 online agents ✓
- KB-006: Costs $0.00 (no AI operations) ✓
- KB-007: Single company in dropdown ✓
- KB-008: Onboarding redirect for fresh company ✓
- ESC-001: Mobile sidebar not responsive (ESCALATED, 6+ cycles)

## Summary

- **20 pages screenshotted** with E2E-TEMP-18 company selected
- **Design tokens**: 11/12 checks pass (Korean font rendering partial ⚠️)
- **3 bugs found**: 1×P2 (onboarding redirect), 2×P3 (font rendering, workflows 500)
- **ESC-001 re-confirmed** (mobile sidebar overlap, cycle 6→18)
- **No blue accents found** — all olive/cream/terracotta as expected
- **Lucide icons confirmed** — no Material Symbols detected
