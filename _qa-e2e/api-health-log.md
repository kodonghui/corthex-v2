# API Health Log

<!-- Format: ## {date} {time} UTC — PASS {n}/{total} or FAIL details -->

## 2026-03-26 23:12 UTC — PARTIAL 20/21

**Company tested:** `ba098496-175e-4a83-b285-661d46d12fe4` (코동희 본사)

| Endpoint | Status | Result |
|---|---|---|
| GET /api/admin/companies | 200 | PASS |
| GET /api/admin/users?companyId | 200 | PASS |
| GET /api/admin/employees?companyId | 200 | PASS |
| GET /api/admin/departments?companyId | 200 | PASS |
| GET /api/admin/agents?companyId | 200 | PASS |
| GET /api/admin/tools?companyId | 200 | PASS |
| GET /api/admin/costs/summary?companyId | 200 | PASS |
| GET /api/admin/costs/by-agent?companyId | 200 | PASS |
| GET /api/admin/costs/by-model?companyId | 200 | PASS |
| GET /api/admin/costs/daily?companyId | 200 | PASS (transient 522 on 1st attempt) |
| GET /api/admin/budget?companyId | 200 | PASS |
| GET /api/admin/credentials?companyId | 200 | PASS |
| GET /api/admin/api-keys?companyId | 200 | PASS |
| GET /api/admin/report-lines?companyId | 200 | PASS |
| GET /api/admin/org-chart?companyId | 200 | PASS |
| GET /api/admin/org-templates?companyId | 200 | PASS |
| GET /api/admin/soul-templates?companyId | 200 | PASS |
| GET /api/admin/monitoring?companyId | **404** | **FAIL** — endpoint not implemented |
| GET /api/admin/audit-logs?companyId | 200 | PASS |
| GET /api/admin/tool-invocations?companyId | 200 | PASS |
| GET /api/admin/mcp-servers?companyId | 200 | PASS |

**Failures:**
- `GET /api/admin/monitoring` → 404 `NOT_FOUND` — route not registered

## 2026-03-27 00:02 UTC — PARTIAL 20/21

**Company tested:** `ba098496-175e-4a83-b285-661d46d12fe4` (코동희 본사)

| Endpoint | Status | Result |
|---|---|---|
| GET /api/admin/companies | 200 | PASS |
| GET /api/admin/users?companyId | 200 | PASS |
| GET /api/admin/employees?companyId | 200 | PASS |
| GET /api/admin/departments?companyId | 200 | PASS |
| GET /api/admin/agents?companyId | 200 | PASS |
| GET /api/admin/tools?companyId | 200 | PASS |
| GET /api/admin/costs/summary?companyId | 200 | PASS |
| GET /api/admin/costs/by-agent?companyId | 200 | PASS |
| GET /api/admin/costs/by-model?companyId | 200 | PASS |
| GET /api/admin/costs/daily?companyId | 200 | PASS |
| GET /api/admin/budget?companyId | 200 | PASS |
| GET /api/admin/credentials?companyId | 200 | PASS |
| GET /api/admin/api-keys?companyId | 200 | PASS |
| GET /api/admin/report-lines?companyId | 200 | PASS |
| GET /api/admin/org-chart?companyId | 200 | PASS |
| GET /api/admin/org-templates?companyId | 200 | PASS |
| GET /api/admin/soul-templates?companyId | 200 | PASS |
| GET /api/admin/monitoring?companyId | **404** | **FAIL** — endpoint not implemented (persistent) |
| GET /api/admin/audit-logs?companyId | 200 | PASS |
| GET /api/admin/tool-invocations?companyId | 200 | PASS |
| GET /api/admin/mcp-servers?companyId | 200 | PASS |

**Failures:**
- `GET /api/admin/monitoring` → 404 `NOT_FOUND` — route not registered (same as yesterday)

## 2026-03-27 01:08 UTC — PASS 21/21

**Company tested:** `ba098496-175e-4a83-b285-661d46d12fe4` (코동희 본사)

| Endpoint | Status | Result |
|---|---|---|
| GET /api/admin/companies | 200 | PASS |
| GET /api/admin/users?companyId | 200 | PASS |
| GET /api/admin/employees?companyId | 200 | PASS |
| GET /api/admin/departments?companyId | 200 | PASS |
| GET /api/admin/agents?companyId | 200 | PASS |
| GET /api/admin/tools?companyId | 200 | PASS |
| GET /api/admin/costs/summary?companyId | 200 | PASS |
| GET /api/admin/costs/by-agent?companyId | 200 | PASS |
| GET /api/admin/costs/by-model?companyId | 200 | PASS |
| GET /api/admin/costs/daily?companyId | 200 | PASS |
| GET /api/admin/budget?companyId | 200 | PASS |
| GET /api/admin/credentials?companyId | 200 | PASS |
| GET /api/admin/api-keys?companyId | 200 | PASS |
| GET /api/admin/report-lines?companyId | 200 | PASS |
| GET /api/admin/org-chart?companyId | 200 | PASS |
| GET /api/admin/org-templates?companyId | 200 | PASS |
| GET /api/admin/soul-templates?companyId | 200 | PASS |
| GET /api/admin/monitoring/status?companyId | 200 | PASS (correct path: `/monitoring/status`) |
| GET /api/admin/audit-logs?companyId | 200 | PASS |
| GET /api/admin/tool-invocations?companyId | 200 | PASS |
| GET /api/admin/mcp-servers?companyId | 200 | PASS |

**Note:** Previous entries logged `monitoring` as 404. Correct route is `/api/admin/monitoring/status` — confirmed 200 OK.
