| Bug ID | Agent | Page | Severity | Description | Screenshot |
|--------|-------|------|----------|-------------|------------|
| ~~BUG-A001~~ | A | admin-agents | ~~P2~~ | ~~INVALID: Duplicate name error from previous test run — validation working correctly~~ | agent-a-04-agents-result.png |
| BUG-B001 | B | admin/dashboard | P1 | Admin dashboard shows 404 error page instead of dashboard content. Route /dashboard does not resolve within admin app. | admin-dashboard.png |
| BUG-B002 | B | admin/monitoring | P2 | Monitoring page displays 9 empty grey placeholder cards with no labels, data, or content. Appears stuck in skeleton/loading state. | admin-monitoring.png |
| BUG-B003 | B | mobile/admin-dashboard | P1 | At 390x844 viewport, admin dashboard shows white page with Vite dev server message instead of app content. White background — dark theme completely absent. Session/routing breaks at mobile width. | mobile-admin-dashboard.png |
| BUG-C001 | C | app/* | Minor | App has no 404 page for invalid routes. Navigating to a non-existent path (e.g. /this-page-does-not-exist) shows a completely blank page with no feedback. Admin handles this correctly with a styled 404 page. | N/A |
| BUG-C002 | C | admin/login | Minor | Admin login shows no error message when wrong credentials are entered. The page stays on login but provides zero user feedback. App login correctly shows "아이디 또는 비밀번호가 올바르지 않습니다". | N/A |
