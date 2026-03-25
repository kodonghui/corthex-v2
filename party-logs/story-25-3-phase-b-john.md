# Story 25.3 Phase B Review — Critic-C (John, Product + Delivery)

## AC Verification

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC-1 | Hono proxy() | PASS | `import { proxy } from 'hono/proxy'` (line 2). Used at lines 118, 185, 223 for API, editor, and workflow list endpoints. Targets `http://127.0.0.1:5678`. |
| AC-2 | Path normalization | PASS | `validateProxyPath` (lines 51-77): blocks `..` in decoded path, `%2e`/`%2E` in raw path (regex `/i`), `%00` null bytes, double-encoding via `decodeURIComponent(decodeURIComponent(...))`. Returns 400 with `N8N_PATH_TRAVERSAL`. |
| AC-3 | Admin JWT chain | PASS | Lines 40-41: `authMiddleware, adminOnly, tenantMiddleware` then `n8nAdminGuard, n8nRateLimit, n8nTagIsolation`. 6 middleware layers in correct order. |
| AC-4 | CSRF on editor | PASS | Line 167: `n8nProxyRoute.use('/n8n-editor/*', csrf())`. Hono built-in same-origin check. Applied only to editor routes, not API (correct — API uses JWT auth). |
| AC-5 | OOM recovery | PASS | Lines 147-161: catch → `checkN8nHealth()` → 502 with `N8N_UNAVAILABLE` code + health detail. Docker `restart: unless-stopped` handles actual recovery. |
| AC-6 | Tag isolation | PASS | List endpoints: `injectCompanyTag(tenant.companyId, targetUrl)` (line 114). Individual resources: `requiresOwnershipCheck(rawPath)` + `verifyResourceOwnership(body.tags, tenant.companyId)` (lines 129-137). Client tag override blocked: `key !== 'tags'` (line 108). |
| AC-7 | Workflow list FR-N8N1 | PASS | Lines 210-252: `GET /n8n/workflows` with `limit`/`cursor` pagination, tag injection, `{ success: true, data }` response format. |
| AC-8 | Credentials blocked | PASS | Lines 94-100: `isBlockedPath(rawPath)` → 403 `N8N_SEC_003`. |
| AC-9 | Header sanitization | PASS | Lines 122-125: `Authorization: undefined, Cookie: undefined`. Remaining headers forwarded via spread. |

## Dimension Scores (Critic-C Weights)

| Dim | Dimension | Score | Weight | Notes |
|-----|-----------|-------|--------|-------|
| D1 | Specificity | 9 | 20% | Clear route structure (API/editor/workflow-list), named error codes (N8N_PATH_TRAVERSAL, N8N_SEC_003, N8N_UNAVAILABLE, N8N_API_ERROR). 6-layer middleware chain documented in spec and code. 4 path traversal attack vectors explicitly enumerated. |
| D2 | Completeness | 9 | 20% | All 9 ACs verified. 39 tests cover route structure, path normalization, security chain, CSRF, OOM recovery, tag injection, ownership verification, workflow list, header sanitization, route paths. Middleware chain applies to ALL routes via `use('*', ...)` — no bypass possible. |
| D3 | Accuracy | 9 | 15% | Matches architecture: AR35 (path normalization — the #1 risk the architecture flagged), FR-N8N1 (workflow list), FR-N8N6 (CSRF editor). API proxy correctly targets `/api/v1${rawPath}` (n8n's REST API). Route registered at `/api/admin` matching the admin route pattern. |
| D4 | Implementability | 8 | 15% | Clean proxy implementation. Two minor concerns: (1) Ownership verification at lines 131-139 consumes `response.json()` then re-creates via `c.json(body, status)` — n8n response headers (pagination cursors, X-Total-Count) are silently dropped. (2) `validateProxyPath` is module-private — can't be unit tested independently with attack payloads (tests are source-pattern only). |
| D5 | Consistency | 9 | 10% | Follows CORTHEX API format: `{ success, data }` / `{ success, error: { code, message } }`. Korean error messages. Imports only from middleware/ and services/ (correct E20 dependency rules — no engine/ imports). |
| D6 | Risk Awareness | 9 | 20% | Path normalization is the architecture's primary security concern for the proxy — thoroughly handled with 4 vectors + double-decode. Tag override prevention (`key !== 'tags'`). Credential path blocked. CSRF scoped to editor only. OOM graceful degradation with health diagnostic. |

## Weighted Score

(9×0.20) + (9×0.20) + (9×0.15) + (8×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.20 + 0.90 + 1.80 = **8.85 / 10**

## Issues

| # | Severity | Description |
|---|----------|-------------|
| 1 | LOW | **Ownership check drops n8n response headers**: Lines 129-139 — `response.json()` consumes the response body, then `c.json(body, response.status as any)` creates a fresh response. Any n8n response headers (pagination metadata, cache headers, content-type specifics) are silently lost. For the ownership verification use case this is acceptable, but if n8n returns pagination headers for individual resources, clients won't see them. Consider preserving response headers by creating a new `Response` with both the verified body and original headers. |
| 2 | LOW | **`validateProxyPath` not independently testable**: The function is module-private (not exported). The 39 tests verify the logic via source pattern matching but don't exercise it with actual attack payloads (`../../etc/passwd`, `%2e%2e/`, `foo%00bar`, `%252e%252e/`). For a security-critical function, exporting it (or adding a `_testValidateProxyPath` export) would allow adversarial unit testing. |
| 3 | LOW | **Editor 502 doesn't call checkN8nHealth**: The API proxy catch (line 149) calls `checkN8nHealth()` for diagnostics in the 502 response. The editor proxy catch (lines 193-205) returns a plain 502 without health detail. Minor inconsistency — operator loses diagnostic info when the editor fails. |

## Product Assessment

Excellent proxy implementation — the strongest story in Epic 25 so far. The path normalization addresses the architecture's #1 security concern head-on with thorough 4-vector coverage plus double-decode defense. The security middleware chain is correctly ordered (authenticate → authorize → rate limit → tenant isolate → validate path → proxy → verify ownership) with no bypass opportunity.

Key design strengths:
- **Tag override prevention** (`key !== 'tags'`) — subtle but critical. Without this, a tenant could inject `?tags=company:other-id` to access another company's workflows.
- **Credential path blocking** — correct judgment that n8n credentials can't be tenant-isolated via tags, so block entirely.
- **CSRF scoped to editor only** — API routes use JWT (no CSRF needed), editor routes serve HTML (CSRF required). Right boundary.
- **OOM recovery pattern** — proxy error → health check → 502 with diagnostic. Docker restart handles the actual recovery.

The dependency rule compliance is clean: routes/admin/n8n-proxy.ts imports only from middleware/ and services/ (n8n-health.ts only). No engine/ imports. Correct per E20.

## Cross-Talk Notes

- **Winston/Amelia (Critic-A, Architecture)**: AR35 path normalization is well-implemented. The double-decode approach (`decodeURIComponent(decodeURIComponent(...))`) catches the %252e double-encoding attack vector that many proxy implementations miss. Route registration at `/api/admin` places the proxy under the existing admin route prefix — clean integration.
- **Quinn/Dana (Critic-B, QA/Security)**: The 39 tests are all source-pattern based (no runtime tests with actual attack payloads). For the path normalization function specifically, consider requesting adversarial runtime tests: `../../etc/passwd`, `..%2f..%2f`, `%252e%252e%252f`, `foo%00bar`. The source verification confirms the logic exists but not that it catches all real-world attack variants. Also: the `proxy()` call passes `...c.req` which might forward unexpected properties — verify Hono's `proxy()` doesn't leak internal state.

---

**Verdict: PASS (8.85/10)**

Epic 25 Critic-C: 25.1=8.80, 25.2=8.45, 25.3=8.85, avg **8.70**
