# Phase 2B Preflight — Socrates Dynamic E2E

## Base URL
- Admin: https://corthex-hq.com/admin
- App: https://corthex-hq.com

## Credentials
- **Admin**: username=admin, password=admin1234, URL=/admin/login
- **App CEO**: 계정 없음 — 온보딩에서 생성 테스트 필요

## Company
- CORTHEX HQ (사이드바 드롭다운에서 선택)

## Design Tokens (Natural Organic)
- Background: #faf8f5 (cream)
- Sidebar bg: #283618 (olive dark)
- Sidebar text: #a3c48a (light green)
- Accent: #606c38 / #5a7247 (olive green)
- Text primary: #1a1a1a
- Text muted: #6b705c
- Border: #e5e1d3 (sand)
- Icon: Lucide React (SVG). "check_circle", "more_vert" = Material Symbols text = BUG

## Changed Files (recent)
- packages/admin/src/lib/api.ts (+17 lines — companyId fix)
- packages/admin/src/pages/onboarding.tsx (1 line)
- packages/server/src/routes/admin/credentials.ts (+11 lines)

## Playwright Setup
- Chromium installed at ~/.cache/ms-playwright/chromium-1208
- Scripts run via: cd /tmp && npx playwright test {script} --reporter=json
- Headless mode (no display)

## Route Assignments

### Agent A (Functional): CRUD + Forms + Navigation
Priority (changed routes first):
1. /admin/onboarding (CHANGED — full flow test: 5 steps)
2. /admin/credentials (CHANGED — API 수정됨)
3. /admin/agents (CRUD)
4. /admin/departments (CRUD)
5. /admin/companies (CRUD)
6. /admin/employees (CRUD)
7. /admin/tools (CRUD)
8. /admin/costs
9. /admin/workflows

### Agent B (Visual): Layout + Design Tokens + Icons
All admin routes — visual sweep:
1. /admin/ (dashboard)
2. /admin/companies
3. /admin/employees
4. /admin/departments
5. /admin/agents
6. /admin/credentials
7. /admin/tools
8. /admin/costs
9. /admin/soul-templates
10. /admin/monitoring
11. /admin/org-chart
12. /admin/nexus
13. /admin/org-templates
14. /admin/template-market
15. /admin/agent-marketplace
16. /admin/api-keys
17. /admin/workflows
18. /admin/settings
19. /admin/onboarding

### Agent C (Edge/Security): Auth bypass + Console errors + Input boundaries
1. Security: Try all admin routes WITHOUT login
2. Security: Try admin routes with app token (non-admin)
3. /admin/credentials — check credential masking
4. /admin/api-keys — check key masking
5. Console errors on ALL admin routes
6. Edge cases: long input, XSS, emoji on form pages

### Agent D (Regression): Sidebar sweep + Theme consistency
1. Sidebar navigation sweep — click ALL menu items
2. Theme consistency across all pages
3. companyId UUID error check on each page's API calls
4. Session persistence across page navigation

## Onboarding Flow (Agent A must test)
Step 1: Company info (name, desc)
Step 2: Departments (apply template)
Step 3: API Keys (register Anthropic key)
Step 4: Invite employees
Step 5: Complete

## Auth Pre-check Result: PASSED (2026-03-17)
- Login: admin/admin1234 → dashboard loaded
- companyId: 6ee92cb0-5065-4e48-8149-38f30ad8913e (CORTHEX HQ selected)
- Dashboard console errors (6):
  - 500: /api/admin/costs/summary (x2)
  - 500: /api/admin/budget (x2)
  - 500: /api/admin/agents (x2)
- "Loading..." stuck in system alerts table

## Playwright MCP Login Steps
1. browser_navigate("https://corthex-hq.com/admin/login")
2. browser_snapshot() → find textbox refs
3. browser_fill_form: textbox "admin" → "admin", password field → "admin1234"
4. browser_click: "로그인" button
5. Verify URL changed to /admin and sidebar is visible

## Source Code Paths (for scenario generation)
- Admin pages: /home/ubuntu/corthex-v2/packages/admin/src/pages/
- Admin components: /home/ubuntu/corthex-v2/packages/admin/src/components/
- Admin API: /home/ubuntu/corthex-v2/packages/admin/src/lib/api.ts
- Server routes: /home/ubuntu/corthex-v2/packages/server/src/routes/admin/
