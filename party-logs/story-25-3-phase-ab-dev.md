# Story 25.3: Hono Reverse Proxy for n8n — Phase A+B (dev)

## Summary

Implemented Hono reverse proxy for n8n with full security chain, path normalization, CSRF, OOM recovery, and tag-based tenant isolation. 39 tests covering all acceptance criteria.

## What Changed

### Route: `routes/admin/n8n-proxy.ts` (NEW)
- `n8nProxyRoute` Hono router with 3 route handlers
- `/n8n/api/*` → n8n REST API (via `/api/v1`)
- `/n8n-editor/*` → n8n editor UI (CSRF protected)
- `/n8n/workflows` → FR-N8N1 convenience endpoint with pagination

### Path Normalization (AR35)
- `validateProxyPath()`: blocks `..`, `%2e`, `%00`, double-encoding
- Double-decode: `decodeURIComponent(decodeURIComponent(path))`
- Returns 400 with `N8N_PATH_TRAVERSAL` error code

### Security Chain
- Middleware: auth → adminOnly → tenant → SEC-2 → SEC-8 → SEC-3
- API proxy: tag injection + ownership verification + credentials blocking
- Editor proxy: CSRF via Hono `csrf()` (same-origin)
- Header sanitization: Authorization + Cookie stripped from proxied requests

### OOM Recovery
- Proxy catch → `checkN8nHealth()` → 502 with health detail
- `N8N_UNAVAILABLE` error code
- Docker `restart: unless-stopped` handles actual restart

### Server Registration
- `index.ts`: Added `n8nProxyRoute` import and `app.route('/api/admin', n8nProxyRoute)`

## Files

- `packages/server/src/routes/admin/n8n-proxy.ts` — Reverse proxy (NEW)
- `packages/server/src/index.ts` — Route registration (MODIFIED)
- `packages/server/src/__tests__/unit/n8n-proxy.test.ts` — 39 tests (NEW)
- `_bmad-output/implementation-artifacts/stories/25-3-n8n-hono-reverse-proxy.md` (NEW)

## Test Results

```
Route structure: 5 pass
Path normalization: 6 pass
Security chain: 5 pass
CSRF editor: 3 pass
OOM recovery: 3 pass
Tag injection: 5 pass
FR-N8N1 workflow list: 5 pass
Header sanitization: 3 pass
Route paths: 4 pass
Total: 39 pass, 0 fail, 59 expect() assertions
Type-check: clean
```
