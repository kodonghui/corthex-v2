# Shared Bug Registry — Cycle 20

API: 16/16 OK. E2E_CID: d0131c54-1907-4a37-b3ca-1d0bf8e99fff
ESC-001 mobile=ESCALATED. Known: terracotta=intentional, Noto Serif KR=intentional.

| Bug ID | Agent | Page | Severity | Description | Screenshot |
|--------|-------|------|----------|-------------|------------|
| BUG-A001 | A | /admin/costs | P3 | Budget usage bar shows `$0.00 / $NaN` — budget limit value renders as NaN in progress indicator. Warning: "The specified value 'undefined' cannot be parsed" on input element. Budget spinbutton is empty (no default value loaded). | `screenshots/agent-A-costs-nan-bug.png` |
| BUG-A002 | A | /admin/monitoring | P3 | Server error log shows `column "suggested_steps" does not exist` ×4 in last 24h. DB query references a column that doesn't exist in the schema. Not a console error but a persistent server-side SQL error. | — |
