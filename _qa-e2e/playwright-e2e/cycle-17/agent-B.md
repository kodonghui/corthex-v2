# Agent B (Visual) — Cycle 17 Report

**Date**: 2026-03-19
**Build**: #609 · fdc671a
**URL**: http://localhost (production container, port 80)
**Browser**: Chromium (Playwright MCP, headless)

## Summary

| Metric | Result |
|--------|--------|
| Pages screenshotted | 22 + 1 mobile |
| Console errors | 0 |
| New bugs found | 0 |
| Known issues confirmed | ESC-001 (mobile sidebar) |

## Design Token Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Sidebar bg olive #283618 | PASS | `rgb(40, 54, 24)` confirmed via JS eval |
| Content bg cream #faf8f5 | PASS | `rgb(250, 248, 245)` confirmed via JS eval |
| No blue colors | PASS | 0 blue elements detected across all pages |
| Lucide icons (no Material) | PASS | 0 Material Symbols, 21 SVG icons in sidebar |
| Sidebar text "등록된 회사 없음" | PASS | Displays correctly when no company selected |
| Active nav item highlight | PASS | Olive-green highlight on active sidebar link |
| Font rendering | PASS | Noto Serif KR headings, clean body text |
| Footer (companies page) | PASS | "System Status: Healthy", "API v2.4.1" |
| Build info in sidebar | PASS | "#609 · fdc671a" at bottom |
| Onboarding page | PASS | Shows "온보딩이 필요한 회사가 없습니다." with button |

## Page-by-Page Screenshots

| # | Page | URL | Status | Notes |
|---|------|-----|--------|-------|
| 1 | Login | /admin/login | PASS | Olive login button, cream background, "C" logo |
| 2 | Dashboard | /admin | PASS | "회사를 선택하세요" empty state |
| 3 | Companies | /admin/companies | PASS | "0 companies", Add Company button (terracotta), search bar |
| 4 | Employees | /admin/employees | PASS | "회사를 선택하세요" |
| 5 | Users | /admin/users | PASS | "회사를 선택하세요" |
| 6 | Departments | /admin/departments | PASS | "회사를 선택하세요" |
| 7 | Agents | /admin/agents | PASS | "회사를 선택하세요" |
| 8 | Tools | /admin/tools | PASS | "회사를 선택하세요" |
| 9 | Costs | /admin/costs | PASS | "회사를 먼저 선택해주세요." heading "비용 관리" |
| 10 | Credentials | /admin/credentials | PASS | "회사를 선택하세요" |
| 11 | Report Lines | /admin/report-lines | PASS | "회사를 선택하세요" |
| 12 | Soul Templates | /admin/soul-templates | PASS | "회사를 선택하세요" |
| 13 | Monitoring | /admin/monitoring | PASS | "System Monitoring" heading + Refresh button |
| 14 | Org Chart | /admin/org-chart | PASS | "사이드바에서 회사를 선택해주세요." |
| 15 | NEXUS | /admin/nexus | PASS | "NEXUS 조직도" heading + "사이드바에서 회사를 선택해주세요." |
| 16 | Org Templates | /admin/org-templates | PASS | "사이드바에서 회사를 선택해주세요." |
| 17 | Template Market | /admin/template-market | PASS | "사이드바에서 회사를 선택해주세요." |
| 18 | Agent Marketplace | /admin/agent-marketplace | PASS | Search bar + filters, "공개된 에이전트 템플릿이 없습니다" |
| 19 | API Keys | /admin/api-keys | PASS | "회사를 먼저 선택해 주세요" |
| 20 | Workflows | /admin/workflows | PASS | "회사를 선택하세요" |
| 21 | Settings | /admin/settings | PASS | "회사를 선택하세요" |
| 22 | Onboarding | /admin/onboarding | PASS | "온보딩이 필요한 회사가 없습니다." + button |

## Responsive Test (390×844)

| Check | Status | Notes |
|-------|--------|-------|
| Sidebar hidden on mobile | FAIL | ESC-001 — sidebar always visible, covers content |
| Hamburger menu | FAIL | ESC-001 — no hamburger toggle exists |
| Content readability | FAIL | ESC-001 — "회사를 선택하세요" word-wraps vertically in narrow column |

**ESC-001 re-confirmed**: Sidebar is not responsive. At 390px width, the sidebar takes ~240px leaving only ~150px for content, causing vertical text wrapping. No hamburger menu toggle exists.

## Screenshots Index

All screenshots saved to `screenshots/` directory:
- `01-login.png` — Login page
- `02-dashboard.png` — Dashboard
- `03-companies.png` — Company Management
- `04-employees.png` — Employees
- `05-users.png` — Users
- `06-departments.png` — Departments
- `07-agents.png` — AI Agents
- `08-tools.png` — Tools
- `09-costs.png` — Costs
- `10-credentials.png` — CLI / API Keys
- `11-report-lines.png` — Report Lines
- `12-soul-templates.png` — Soul Templates
- `13-monitoring.png` — System Monitoring
- `14-org-chart.png` — Org Chart
- `15-nexus.png` — NEXUS Org Chart
- `16-org-templates.png` — Org Templates
- `17-template-market.png` — Template Market
- `18-agent-marketplace.png` — Agent Marketplace
- `19-api-keys.png` — Public API Keys
- `20-workflows.png` — Workflows
- `21-settings.png` — Settings
- `22-onboarding.png` — Onboarding
- `23-mobile-390x844.png` — Mobile responsive test
