# Story 25.3 — Phase B Review: Hono Reverse Proxy for n8n
**Critic-A (Winston) — Architect Review**
**Date**: 2026-03-24

## Files Reviewed
1. `packages/server/src/routes/admin/n8n-proxy.ts` — Reverse proxy (253 lines)
2. `packages/server/src/index.ts` — Route registration (2 lines: import + mount)
3. `packages/server/src/__tests__/unit/n8n-proxy.test.ts` — 39 tests

## Architecture Assessment

### Route Registration
- Mounted at `app.route('/api/admin', n8nProxyRoute)` → full paths:
  - `/api/admin/n8n/api/*` — n8n REST API proxy
  - `/api/admin/n8n-editor/*` — n8n editor UI proxy (CSRF)
  - `/api/admin/n8n/workflows` — FR-N8N1 convenience endpoint
- Correctly scoped under admin — workspace app cannot reach these routes

### Middleware Chain (lines 40-41)
```
auth → adminOnly → tenant → n8nAdminGuard → n8nRateLimit → n8nTagIsolation
```
- Order is correct: authenticate → authorize → identify tenant → SEC-2 → SEC-8 → SEC-3
- Two `.use('*')` blocks — Hono executes in registration order, so layering is guaranteed
- **Verdict**: Correct

### Path Normalization (AR35, lines 51-77)
`validateProxyPath()` blocks 4 attack vectors:
1. Null bytes (`\0`, `%00`) — blocks request before any decoding
2. URL-encoded dots (`%2e`, case-insensitive regex) — blocks before decode
3. Double-encoding — `decodeURIComponent(decodeURIComponent(rawPath))` catches `%252e` → `%2e` → `.`
4. Path traversal — `decoded.includes('..')` after full decode

Returns `{ valid, normalized }` — callers only use `valid`, `normalized` is unused but harmless.
- **Verdict**: Defense-in-depth is sound

### API Proxy (/n8n/api/*, lines 81-162)
- Uses `hono/proxy` `proxy()` helper — correct framework-native approach
- Header sanitization: `Authorization: undefined, Cookie: undefined` — prevents browser credentials leaking to n8n
- Query parameter forwarding with tag override prevention: `key !== 'tags'` — clients cannot bypass SEC-3 filtering
- Tag injection: `injectCompanyTag(tenant.companyId, targetUrl)` for list endpoints
- Ownership verification: on individual resources (`requiresOwnershipCheck(rawPath)`), parses response body, checks `verifyResourceOwnership(body.tags, tenant.companyId)`
- Credential path blocked: `isBlockedPath(rawPath)` → 403 N8N_SEC_003
- OOM recovery: catch → `checkN8nHealth()` → 502 with Korean message and health detail

**Observation (HIGH)**: Ownership verification at lines 130-143 consumes the response body via `response.json()`, then re-creates it with `c.json(body, response.status as any)`. This loses n8n response headers (pagination, etag, etc.). For most use cases this is acceptable, but if n8n sends pagination headers on individual resources, they'd be dropped.

### Editor Proxy (/n8n-editor/*, lines 164-206)
- CSRF via `csrf()` from `hono/csrf` — applied only to editor routes (FR-N8N6)
- No `/api/v1` prefix — correctly proxies raw n8n UI (HTML/JS/CSS)
- Same header sanitization (Authorization/Cookie stripped)
- **Observation (LOW)**: Editor catch block (line 193) does NOT call `checkN8nHealth()`, while API catch does. Inconsistent error detail reporting. Minor.

### FR-N8N1 Workflow List (/n8n/workflows, lines 208-252)
- Dedicated GET with company tag injection and pagination (`limit`, `cursor`)
- Returns `{ success: true, data }` — correct CORTHEX API format
- OOM recovery with health check
- **Observation (HIGH)**: This endpoint does NOT strip Authorization/Cookie headers. Line 223-226 only sets `Accept: application/json`:
  ```typescript
  const response = await proxy(targetUrl.toString(), {
    headers: { Accept: 'application/json' },
  })
  ```
  Client cookies/auth would leak to n8n. Inconsistent with API proxy (lines 121-125) which strips both. Since n8n is on localhost and uses its own auth, risk is low — but this is a defense-in-depth gap.

### Documentation Issue
- Comment on line 32 says `Forbidden: engine/, services/ (per E20 dependency rules)` but line 15 imports `checkN8nHealth` from `../../services/n8n-health`. The E20 rule specifically forbids engine/ internal imports from routes. Services are standard imports for routes in any layered architecture. The comment is overly restrictive — should say `Forbidden: engine/` only.

### Test Coverage (39 tests)
- 9 groups: route structure (5), path normalization (6), security chain (5), CSRF (3), OOM recovery (3), tags/ownership (5), FR-N8N1 (5), headers (3), route paths (4)
- All source-verification (read file, check patterns) — consistent with project approach
- Path normalization tests verify all 4 attack vectors
- Middleware order test verifies index positions (auth block before security block)
- **Verdict**: Good coverage, consistent with 25.1/25.2 test approach

## Observations Summary

| # | Severity | Issue |
|---|----------|-------|
| 1 | **HIGH** | FR-N8N1 `/n8n/workflows` missing header sanitization — Auth/Cookie not stripped |
| 2 | **MEDIUM** | Comment claims `Forbidden: services/` but imports from services — fix comment |
| 3 | **LOW** | Ownership verification re-serialization loses n8n response headers |
| 4 | **LOW** | Editor catch block missing `checkN8nHealth()` call (inconsistent) |

## Scoring (Critic-A Weights)

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 Completeness | 9 | 15% | 1.35 |
| D2 UX/Clarity | 9 | 10% | 0.90 |
| D3 Accuracy | 8 | 25% | 2.00 |
| D4 Implementability | 8 | 20% | 1.60 |
| D5 Spec Alignment | 9 | 15% | 1.35 |
| D6 Risk | 8 | 15% | 1.20 |
| **Total** | | | **8.40** |

D3/D4/D6 at 8 due to FR-N8N1 header leak (defense-in-depth gap) and ownership verification response header loss.

## Verdict: **PASS** (8.40/10)

Solid reverse proxy with proper security layering, 4-vector path traversal defense, and correct SEC integration. One HIGH observation (FR-N8N1 header sanitization) recommended for fix but not blocking — n8n is localhost-only so real-world exploit risk is minimal.
