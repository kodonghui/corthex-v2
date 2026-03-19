# Shared Bug Registry — Cycle 18

Phase 1 API: 19/19 OK (FULL smoke with companyId!)
E2E_COMPANY_ID: d0131c54-1907-4a37-b3ca-1d0bf8e99fff (E2E-TEMP-18)
v2.1: CRUD testing enabled. Agent A must complete create/update/delete.
ESC-001: mobile sidebar (ESCALATED). Known: terracotta=intentional, Noto Serif KR=intentional.

| Bug ID | Agent | Page | Severity | Description | Screenshot |
|--------|-------|------|----------|-------------|------------|
| BUG-A001 | A | /admin/agents | P1 | Agent CREATE via UI → 500 FK violation: `agents_user_id_users_id_fk`. Frontend sends admin_users.id as userId but FK references users table. `agents.tsx:239` | screenshots/06-agent-create-500.png |
| BUG-A002 | A | /admin/* | P1 | Onboarding loop: completing onboarding doesn't persist. Every page reload → /admin/onboarding step 1. Makes admin panel unusable for new companies. | screenshots/01-onboarding-start.png |
| BUG-A003 | A | /admin/agents | P2 | No delete/deactivate button in agent detail panel UI. Only Save + Reset buttons. API DELETE works. | screenshots/07-agent-updated.png |
| BUG-A004 | A | /admin/companies | P2 | Company list shows 0 when no company selected. tenantMiddleware returns [] for companyId='system'. Chicken-and-egg: can't select company without listing them. | — |
| BUG-A005 | A | API | P3 | POST /api/super-admin/companies returns TENANT_003 despite route not using tenantMiddleware. Workaround: add ?companyId= param. | — |
