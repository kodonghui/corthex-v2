# Blockers -- Socrates E2E

## BLOCKER-1: SPA Router Auto-Navigation (BUG-C003)
- **Found by**: Agent C (2026-03-17)
- **Severity**: Critical
- **Description**: After navigating to any admin route, the SPA automatically redirects to different routes within seconds. Pages cycle through /admin/employees -> /admin/nexus -> /admin/onboarding -> /admin/settings -> /admin/workflows in rapid succession.
- **Impact**: Blocks ALL interactive testing (form edge cases, delete confirmation, CRUD operations). Makes admin panel unusable.
- **Blocks**: Agent C edge case tests (XSS, long input, emoji, delete confirmation), potentially Agent A CRUD tests

## BLOCKER-2: No Client-Side Auth Guard (BUG-C001)
- **Found by**: Agent C (2026-03-17)
- **Severity**: Critical / Security
- **Description**: All 19 admin routes accessible without authentication. Full admin layout renders including sidebar, company names, user info.
- **Impact**: Security vulnerability — information disclosure to unauthenticated users
- **Mitigating**: API endpoints enforce auth (AUTH_001), so no data modification possible without token

## BLOCKER-3: Eight+ API Endpoints Return 500 (BUG-C002 / BUG-A007)
- **Found by**: Agent C + Agent A (2026-03-17)
- **Severity**: Critical (root cause of BLOCKER-1)
- **Endpoints**: `/api/admin/budget`, `/api/admin/costs/summary`, `/api/admin/agents`, `/api/admin/soul-templates`, `/api/admin/api-keys`, `/api/admin/org-chart`, `/api/admin/workflows`, `/api/admin/workflow-suggestions`, `/api/admin/costs/catalog`
- **Error**: `invalid input syntax for type uuid: "system"` (100 events/24h per monitoring page)
- **Root cause**: Admin JWT uses companyId="system" (not a UUID). Server routes pass this to DB queries expecting UUID type.
- **Impact**: Multiple admin pages show incomplete/broken data. Cascading errors cause BLOCKER-1 (phantom navigation).

## BLOCKER-4: Onboarding Page Does Not Render (BUG-A001)
- **Found by**: Agent A (2026-03-17)
- **Severity**: Critical
- **Description**: /admin/onboarding renders a blank content area. The OnboardingWizardPage component never mounts its UI. data-testid="onboarding-page" NOT FOUND in DOM.
- **Impact**: Cannot test the 5-step onboarding flow at all
