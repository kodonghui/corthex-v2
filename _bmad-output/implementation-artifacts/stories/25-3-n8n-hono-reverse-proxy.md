# Story 25.3: Hono Reverse Proxy for n8n

Status: implemented

## Story

As an admin,
I want to access n8n through the CORTHEX admin panel,
So that workflow management is integrated into my existing admin experience.

## Acceptance Criteria

1. **AC-1: Hono proxy()** — `routes/admin/n8n-proxy.ts` forwards requests to localhost:5678
2. **AC-2: Path normalization** — Double-dot (`..`), `%2e`, null bytes blocked with 400
3. **AC-3: Admin JWT** — Auth + adminOnly + tenant middleware on all proxy routes
4. **AC-4: CSRF** — Origin verification on `/n8n-editor/*` (FR-N8N6)
5. **AC-5: OOM recovery** — Proxy detects n8n unreachable → returns 502 + health status
6. **AC-6: Tag isolation** — Company tag injected on list endpoints, ownership verified on individual
7. **AC-7: Workflow list** — `GET /n8n/workflows` with pagination (FR-N8N1)
8. **AC-8: Credentials blocked** — `/credentials` path returns 403 (no tenant isolation possible)
9. **AC-9: Header sanitization** — Authorization + Cookie stripped from proxied requests

## Dev Notes

### Route Structure

| Path | Method | Purpose |
|------|--------|---------|
| `/api/admin/n8n/api/*` | ALL | n8n REST API proxy (via `/api/v1`) |
| `/api/admin/n8n-editor/*` | ALL | n8n editor UI proxy (CSRF protected) |
| `/api/admin/n8n/workflows` | GET | FR-N8N1 workflow list (convenience) |

### Security Chain (per request)

```
authMiddleware → adminOnly → tenantMiddleware
→ n8nAdminGuard (SEC-2) → n8nRateLimit (SEC-8) → n8nTagIsolation (SEC-3)
→ validateProxyPath (AR35) → proxy() → ownershipCheck (SEC-3)
```

### Path Normalization (AR35)

- `..` in decoded path → 400
- `%2e` / `%2E` in raw path → 400
- `%00` null bytes → 400
- Double-decode: `decodeURIComponent(decodeURIComponent(path))` catches double-encoding attacks
- Error code: `N8N_PATH_TRAVERSAL`

### OOM Recovery

- Proxy catch → calls `checkN8nHealth()` → returns 502 with health detail
- Docker `restart: unless-stopped` handles actual restart
- Error code: `N8N_UNAVAILABLE`

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Hono `proxy()` helper from `hono/proxy` (not fetch-based — proper header forwarding)
- CSRF via Hono built-in `csrf()` middleware (same-origin by default)
- Path normalization: 4 attack vectors blocked (double-dot, %2e, null bytes, double-encoding)
- Tag injection: list endpoints filtered, individual resources ownership-verified, credentials blocked
- Registered in index.ts as `app.route('/api/admin', n8nProxyRoute)`
- 39 tests, all passing

### File List
- `packages/server/src/routes/admin/n8n-proxy.ts` — Reverse proxy route (NEW)
- `packages/server/src/index.ts` — Route registration (MODIFIED)
- `packages/server/src/__tests__/unit/n8n-proxy.test.ts` — 39 tests (NEW)
