# API Health Log

## 2026-03-26 11:07 UTC — PARTIAL 20/21

**Company tested:** `ba098496-175e-4a83-b285-661d46d12fe4` (코동희 본사)

| Endpoint | Status |
|---|---|
| companies | 200 ✅ |
| users | 200 ✅ |
| employees | 200 ✅ |
| departments | 200 ✅ |
| agents | 200 ✅ |
| tools | 200 ✅ |
| costs/summary | 200 ✅ |
| costs/by-agent | 200 ✅ |
| costs/by-model | 200 ✅ |
| costs/daily | 200 ✅ |
| budget | 200 ✅ |
| credentials | 200 ✅ |
| api-keys | 200 ✅ |
| report-lines | 200 ✅ |
| org-chart | 200 ✅ |
| org-templates | 200 ✅ |
| soul-templates | 200 ✅ |
| **monitoring** | **404 ❌** |
| audit-logs | 200 ✅ |
| tool-invocations | 200 ✅ |
| mcp-servers | 200 ✅ |

**Failures:** `GET /api/admin/monitoring?companyId=...` → 404 (route not registered)

---

## 2026-03-26 12:02 UTC — FAIL 20/21

**Company tested:** `ba098496-175e-4a83-b285-661d46d12fe4` (코동희 본사)

| Endpoint | Status |
|---|---|
| companies | 200 ✅ |
| users | 200 ✅ |
| employees | 200 ✅ |
| departments | 200 ✅ |
| agents | 200 ✅ |
| tools | 200 ✅ |
| costs/summary | 200 ✅ |
| costs/by-agent | 200 ✅ |
| costs/by-model | 200 ✅ |
| costs/daily | 200 ✅ |
| budget | 200 ✅ |
| credentials | 200 ✅ |
| api-keys | 200 ✅ |
| report-lines | 200 ✅ |
| org-chart | 200 ✅ |
| org-templates | 200 ✅ |
| soul-templates | 200 ✅ |
| **monitoring** | **404 ❌** |
| audit-logs | 200 ✅ |
| tool-invocations | 200 ✅ |
| mcp-servers | 200 ✅ |

**Failures:** `GET /api/admin/monitoring?companyId=ba098496-175e-4a83-b285-661d46d12fe4` → 404 (route not registered)

---

## 2026-03-26 13:03 UTC — PASS 21/21

**Company tested:** `ba098496-175e-4a83-b285-661d46d12fe4` (코동희 본사)

| Endpoint | Status |
|---|---|
| companies | 200 ✅ |
| users | 200 ✅ |
| employees | 200 ✅ |
| departments | 200 ✅ |
| agents | 200 ✅ |
| tools | 200 ✅ |
| costs/summary | 200 ✅ |
| costs/by-agent | 200 ✅ |
| costs/by-model | 200 ✅ |
| costs/daily | 200 ✅ |
| budget | 200 ✅ |
| credentials | 200 ✅ |
| api-keys | 200 ✅ |
| report-lines | 200 ✅ |
| org-chart | 200 ✅ |
| org-templates | 200 ✅ |
| soul-templates | 200 ✅ |
| monitoring/status | 200 ✅ |
| audit-logs | 200 ✅ |
| tool-invocations | 200 ✅ |
| mcp-servers | 200 ✅ |

> Note: `GET /api/admin/monitoring` → 404. Correct route is `/monitoring/status` (200 ✅).

---

## 2026-03-26 14:04 UTC — PASS 21/21

**Company tested:** `ba098496-175e-4a83-b285-661d46d12fe4` (코동희 본사)

| Endpoint | Status |
|---|---|
| companies | 200 ✅ |
| users | 200 ✅ |
| employees | 200 ✅ |
| departments | 200 ✅ |
| agents | 200 ✅ |
| tools | 200 ✅ |
| costs/summary | 200 ✅ |
| costs/by-agent | 200 ✅ |
| costs/by-model | 200 ✅ |
| costs/daily | 200 ✅ |
| budget | 200 ✅ |
| credentials | 200 ✅ |
| api-keys | 200 ✅ |
| report-lines | 200 ✅ |
| org-chart | 200 ✅ |
| org-templates | 200 ✅ |
| soul-templates | 200 ✅ |
| monitoring/status | 200 ✅ |
| audit-logs | 200 ✅ |
| tool-invocations | 200 ✅ |
| mcp-servers | 200 ✅ |

> Note: `GET /api/admin/monitoring` → 404. Correct route is `/monitoring/status` (200 ✅).
