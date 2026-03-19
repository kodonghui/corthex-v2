# Shared Bug Registry — Cycle 19

Phase 1 API: 16/16 OK
E2E_COMPANY_ID: d0131c54-1907-4a37-b3ca-1d0bf8e99fff
Cycle 18 fixes deployed: ESC-002 (agent FK), ESC-003 (onboarding), ESC-004 (tenant), BUG-A003 (delete btn)
ESC-001: mobile sidebar (ESCALATED). Known: terracotta=intentional, Noto Serif KR=intentional.

| Bug ID | Agent | Page | Severity | Description | Screenshot |
|--------|-------|------|----------|-------------|------------|
| OBS-A001 | A | /admin/costs | P3 | Budget progress shows `$0.00 / $NaN` when no budget set | — |
| OBS-A002 | A | /admin/monitoring | P2 | DB error: `column "suggested_steps" does not exist` (2 events/24h) | — |
| OBS-A003 | A | /admin/costs | P4 | Console warning: date input value "undefined" | — |

## Fix Verification Results (Agent A)

| ESC/BUG | Status | Details |
|---------|--------|---------|
| ESC-002 Agent Create 500 FK | **PASS** | Agent created successfully, no FK error |
| ESC-003 Onboarding Loop | **PASS** | Dashboard loads on login+reload, no onboarding redirect |
| BUG-A003 Agent Delete Button | **PASS** | "Deactivate Agent" button in Configuration tab, works with confirmation |
| ESC-004 Tenant Middleware | **PASS** | All pages load with correct company scope |
