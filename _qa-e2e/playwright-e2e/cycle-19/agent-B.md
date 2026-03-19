# Agent B — Visual & Design Token Audit (Cycle 19)

- **Date**: 2026-03-19
- **Company**: E2E-TEMP-18
- **Build**: #610 · 2106ec2
- **Viewport**: 1280x800 (desktop), 390x844 (mobile)
- **Pages tested**: 21/21

## Pre-Check

| Known Behavior | Status |
|---|---|
| KB-001 Empty Dashboard | N/A — company has data (2 depts, 1 user, 2 agents) |
| KB-005 Monitoring No Data | Confirmed — idle state, no crash |
| KB-006 Costs $0.00 | Confirmed $0.00 (single $, correct) |
| ESC-001 Mobile Sidebar | **Re-confirmed** — sidebar never collapses on mobile |

## Design Token Verification

| Token | Expected | Actual | Status |
|---|---|---|---|
| Sidebar BG | olive #283618 | `rgb(40, 54, 24)` = #283618 | PASS |
| Sidebar Text | light olive | `rgb(163, 196, 138)` = #a3c48a | PASS |
| Font Family | Inter + Korean fallback | `Inter, "Noto Serif KR", Pretendard, ...sans-serif` | PASS |
| Root Font Size | 16px | 16px | PASS |
| Button border-radius | 8px | 8px | PASS |
| Content BG | cream #faf8f5 | Visually cream (inherited, `rgba(0,0,0,0)` on main) | PASS |
| Button olive accent | olive tint | `rgba(90, 114, 71, 0.2)` = olive 20% | PASS |
| CSS Custom Vars | -- | Not using CSS custom props (Tailwind utility classes) | INFO |

## Desktop Screenshots (21 pages)

| # | Page | Route | Visual Status | Notes |
|---|---|---|---|---|
| 01 | Dashboard | /admin | PASS | 4 stat cards + activity table with data. Cream bg, olive sidebar |
| 02 | Companies | /admin/companies | PASS | E2E-TEMP-18 card with Active badge, pagination |
| 03 | Employees | /admin/employees | PASS | Tab UI (전체/부서별/미배정), department cards visible |
| 04 | Users | /admin/users | PASS | Table with user details, role filter dropdowns |
| 05 | Departments | /admin/departments | PASS | 2 department cards (INACTIVE/ACTIVE badges) |
| 06 | Agents | /admin/agents | PASS | 2 agents listed, detail panel placeholder on right |
| 07 | Tools | /admin/tools | PASS | Empty state "등록된 도구가 없습니다" correct |
| 08 | Costs | /admin/costs | PASS | $0.00 (single $), $1500 budget, date range picker |
| 09 | Credentials | /admin/credentials | PASS | AES-256 security notice, user credential visible |
| 10 | Report Lines | /admin/report-lines | PASS | Breadcrumb nav, reporter/supervisor dropdowns |
| 11 | Soul Templates | /admin/soul-templates | PASS | Category filters, tier section, template tabs |
| 12 | Monitoring | /admin/monitoring | PASS | Server Healthy, Memory 107.7% (red bar — accurate) |
| 13 | Org Chart | /admin/org-chart | PASS | Tree view with company, department, agents/users |
| 14 | NEXUS | /admin/nexus | PASS | React Flow canvas with nodes, zoom controls, tabs |
| 15 | Org Templates | /admin/org-templates | PASS | Empty state "등록된 템플릿이 없습니다" |
| 16 | Template Market | /admin/template-market | PASS | Search + empty state |
| 17 | Agent Marketplace | /admin/agent-marketplace | PASS | Search + category/tier filters + empty state |
| 18 | API Keys | /admin/api-keys | PASS | Key icon empty state, CTA button |
| 19 | Workflows | /admin/workflows | WARN | Page renders but 2x 500 console errors (integrations endpoint 404) |
| 20 | Settings | /admin/settings | PASS | Company info populated, API key section |
| 21 | Onboarding | /admin/onboarding | PASS | 5-step wizard UI, step 1 COMPANY active |

## Mobile Responsive (390x844)

| # | Page | Status | Issue |
|---|---|---|---|
| M1 | Dashboard | FAIL | Sidebar stays fully expanded, content pushed off-screen right |
| M2 | Companies | FAIL | Same — sidebar covers ~60% of viewport, content clipped |
| M3 | Agents | FAIL | Same — sidebar fully visible, content barely visible |
| M4 | Settings | FAIL | Same pattern |
| M5 | Departments | FAIL | Same pattern |

**Root cause**: ESC-001 — sidebar has no responsive breakpoint (`hidden lg:block` + hamburger toggle missing). All mobile pages are **unusable** because the sidebar cannot be collapsed.

## Console Errors Summary

| Page | Error Count | Details |
|---|---|---|
| /admin/workflows | 2 | `GET /api/admin/integrations?companyId=...` → 404 (reported as 500 in console) |
| All other pages | 0 | Clean (excluding favicon 404) |

## Bugs Found

### BUG-B001: Workflows Page — Missing Integrations Endpoint (P3)
- **Page**: /admin/workflows
- **Symptom**: 2 console errors on page load — `Failed to load resource: 500`
- **API**: `GET /api/admin/integrations?companyId=...` → 404 NOT_FOUND
- **Impact**: Visual only — page renders correctly, but fetches nonexistent endpoint
- **Suggested fix**: Either create the integrations route or remove the fetch call from the workflows page

### ESC-001: Mobile Sidebar (Re-confirmed — ESCALATED)
- **Cycles reported**: 6, 7, 8, 9, 12, 19
- **Status**: Still not fixed. Sidebar has no `hidden lg:flex` / hamburger toggle.
- **Impact**: All 21 pages unusable on mobile

## Verdict

- **Desktop**: 20/21 PASS, 1 WARN (workflows console error)
- **Mobile**: 0/5 PASS (all blocked by ESC-001)
- **Design Tokens**: All 7 tokens verified PASS
- **Overall**: Desktop is visually solid. Mobile remains broken (known escalated).
