# CRITIC-SECURITY: Full Codebase Security Audit

**Auditor**: CRITIC-SECURITY
**Date**: 2026-03-18
**Scope**: CORTHEX v2 full monorepo (packages/server, app, admin, shared, ui)
**Target**: Production system at corthex-hq.com

---

## 1. Authentication & Authorization

### issue: [SECURITY] Hardcoded JWT fallback secret in auth.ts and ws/server.ts at `packages/server/src/middleware/auth.ts:11` and `packages/server/src/ws/server.ts:7`

```ts
const JWT_SECRET = process.env.JWT_SECRET || 'corthex-v2-dev-secret-change-in-production'
```

**Why it's dangerous**: If `JWT_SECRET` env var is ever unset (deploy misconfiguration, container restart, .env missing), the server silently falls back to a hardcoded, publicly-visible secret. Any attacker who reads this source code can forge arbitrary JWT tokens with any role (including `super_admin`) and gain full access to every tenant.

**Severity**: CRITICAL
**Recommendation**: Remove the fallback entirely. Fail-fast on startup if `JWT_SECRET` is not set, exactly as `credential-crypto.ts` does with `_validateKeyHex()`.

---

### issue: [SECURITY] No JWT blocklist / token revocation mechanism at `packages/server/src/middleware/auth.ts:49`

JWT tokens are valid for 24 hours with no revocation mechanism. The 30-second active status cache provides a limited mitigation but:
1. A deactivated user retains valid tokens for up to 30 seconds
2. A compromised token cannot be revoked before its 24-hour expiry
3. Password changes do not invalidate existing tokens

**Severity**: HIGH
**Recommendation**: Implement a JWT blocklist (Redis or in-memory with eviction) that is checked on each request. On user deactivation or password change, add the user's tokens to the blocklist.

---

### issue: [SECURITY] Auth error catch block swallows all errors at `packages/server/src/middleware/auth.ts:98-100`

```ts
} catch {
  throw new HTTPError(401, '...', 'AUTH_002')
}
```

The catch block wraps the **entire** token verification AND active-status DB check. If the DB query inside the try block (lines 73-87) throws a connection error, it returns a misleading 401 "invalid token" error instead of a 500. More critically, it means a DB outage silently denies access to all users rather than returning a proper server error.

**Severity**: MEDIUM
**Recommendation**: Narrow the try/catch to only wrap `verify()`. Let DB errors propagate to the global error handler as 500s.

---

### praise: [SECURITY] Strong active-status caching with invalidation at `packages/server/src/middleware/auth.ts:14-36`

The 30-second TTL cache with `invalidateActiveStatusCache()` is a good pattern. It avoids DB hits per request while keeping the deactivation window short. The bounded Map with 500-entry eviction prevents memory leaks.

---

### praise: [SECURITY] Bun.password.hash used for password hashing at `packages/server/src/routes/auth.ts:62,152,218`

Uses Bun's built-in password hashing (argon2id by default), which is cryptographically strong and resistant to brute-force attacks.

---

## 2. Tenant Isolation (Multi-Tenancy)

### issue: [SECURITY] Admin companies route has NO tenantMiddleware at `packages/server/src/routes/admin/companies.ts:14`

```ts
companiesRoute.use('*', authMiddleware, adminOnly)
// NO tenantMiddleware
```

The `/api/admin/companies` route only requires `adminOnly` but not `tenantMiddleware`. A `company_admin` (not super_admin) can:
- GET `/api/admin/companies` - list ALL companies across the entire platform (line 37: `db.select().from(companies)` with no company filter)
- GET `/api/admin/companies/:id` - view details of ANY company (line 70: no companyId filter)
- PATCH `/api/admin/companies/:id` - modify ANY company (line 86: no companyId filter)
- DELETE `/api/admin/companies/:id` - deactivate ANY company (line 96: no companyId filter)

**Severity**: CRITICAL
**Recommendation**: Add `tenantMiddleware` and scope all queries to `tenant.companyId` for company_admin users, or restrict the entire route to `super_admin` only via `rbacMiddleware('super_admin')`.

---

### issue: [SECURITY] Admin monitoring route has NO tenantMiddleware at `packages/server/src/routes/admin/monitoring.ts:10`

```ts
monitoringRoute.use('*', authMiddleware, adminOnly)
// NO tenantMiddleware
```

Any `company_admin` can access platform-wide monitoring data including server memory, DB status, and error history. This leaks internal infrastructure details to non-platform admins.

**Severity**: MEDIUM
**Recommendation**: Restrict monitoring to `super_admin` only, or add tenantMiddleware.

---

### issue: [SECURITY] Admin soul-templates: CRUD operations not scoped to company at `packages/server/src/routes/admin/soul-templates.ts:51-108`

The POST, PATCH, and DELETE routes for soul-templates operate without tenantMiddleware on the global level (only `authMiddleware, adminOnly`). A `company_admin` can:
- POST with any `companyId` in the body (line 56: `body.companyId` directly from user input)
- PATCH/DELETE any template by ID without company ownership check (lines 73, 97: only checks `id`, not `companyId`)

**Severity**: HIGH
**Recommendation**: Add `tenantMiddleware` globally and validate that `body.companyId` matches `tenant.companyId`.

---

### issue: [SECURITY] Workspace routes lack tenantMiddleware at all workspace routes in `packages/server/src/routes/workspace/`

None of the workspace routes apply `tenantMiddleware`. They only use `authMiddleware`. While they do manually filter by `tenant.companyId` in their queries (which provides data isolation), the `tenantMiddleware` body-companyId-mismatch protection (lines 28-49 of tenant.ts) is not applied. This means a malicious user could submit POST/PUT/PATCH requests with a different `companyId` in the body, and if any service layer uses `body.companyId` instead of `tenant.companyId`, cross-tenant writes become possible.

**Severity**: MEDIUM
**Recommendation**: Apply `tenantMiddleware` to all workspace routes as a defense-in-depth measure. The body-mismatch check is an important second layer.

---

### praise: [SECURITY] ScopedQuery pattern (getDB) enforces tenant isolation at `packages/server/src/db/scoped-query.ts:26`

The `getDB(companyId)` pattern automatically injects `WHERE companyId = ?` into all queries via `withTenant()` and `scopedWhere()`. This is a strong architectural pattern for preventing cross-tenant data leaks in the engine layer.

---

### praise: [SECURITY] WebSocket channels enforce company-level authorization at `packages/server/src/ws/channels.ts`

Every WS channel subscription includes proper DB-backed authorization checks with `companyId` validation. The chat-stream, messenger, conversation, strategy-notes, and debate channels all verify resource ownership.

---

## 3. Input Validation & Injection

### issue: [SECURITY] ReDoS vulnerability in regex-matcher tool at `packages/server/src/lib/tool-handlers/builtins/regex-matcher.ts:3-5`

```ts
function createRegex(pattern: string, flags: string): RegExp {
  return new RegExp(pattern, flags)
}
```

AI agents can invoke this tool with arbitrary user-controlled regex patterns. Malicious patterns like `(a+)+$` against a long input string cause catastrophic backtracking (ReDoS), which can hang the server process for minutes or indefinitely.

**Severity**: HIGH
**Recommendation**: Use a safe regex library (e.g., `re2`) or implement a timeout wrapper around regex execution. At minimum, validate pattern complexity and impose a maximum input length.

---

### issue: [SECURITY] Raw SQL usage in multiple services at `packages/server/src/services/archive-service.ts:187` and `packages/server/src/routes/commands.ts:376-378`

```ts
sql`${costRecords.agentId} = ANY(${agentIds})`
sql`${costRecords.createdAt} >= ${startTime}`
```

While Drizzle's `sql` template tag DOES parameterize values (these are safe), the pattern is fragile. Any developer who accidentally uses string interpolation instead of tagged template literals would introduce SQL injection. The `seed-e7.ts` file (line 15-119) uses raw `sql` tagged queries extensively.

**Severity**: LOW (currently safe via parameterization)
**Recommendation**: Prefer Drizzle's type-safe query builder methods (`eq()`, `inArray()`, `gte()`) over raw `sql` templates. Add a lint rule to flag `sql\`` usage in route/service files.

---

### praise: [SECURITY] Zod validation on all route inputs

Every route that accepts user input uses `zValidator()` with strict Zod schemas. The register endpoint validates slug format (`/^[a-z0-9-]+$/`), the command input is capped at 10,000 characters, and UUID parameters are validated.

---

### praise: [SECURITY] Prompt injection guard middleware at `packages/server/src/middleware/prompt-guard.ts`

Active prompt injection scanning on command submission with configurable sensitivity levels, audit logging of injection attempts, and per-company enable/disable settings.

---

## 4. Credential & Secret Handling

### issue: [SECURITY] ENCRYPTION_KEY has weaker validation than CREDENTIAL_ENCRYPTION_KEY at `packages/server/src/lib/crypto.ts:9-13`

```ts
function getKey(): string {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters')
  }
  return key
}
```

Compared to `credential-crypto.ts` which requires exactly 64 hex chars (32 bytes), `crypto.ts` accepts any string >= 32 characters and uses only the first 32 bytes via `.slice(0, 32)`. This means the key derivation is not well-defined (any UTF-8 string, not hex-encoded bytes), and the effective key entropy depends on the character set used.

**Severity**: MEDIUM
**Recommendation**: Migrate to the same hex-based key format as `credential-crypto.ts` or use a proper KDF (HKDF/PBKDF2).

---

### praise: [SECURITY] Credential encryption with AES-256-GCM at `packages/server/src/lib/credential-crypto.ts`

Proper implementation: 12-byte random IV per encryption, Web Crypto API, 256-bit key, GCM authenticated encryption with tamper detection. The key is never exported or logged. Fail-fast validation on startup.

---

### praise: [SECURITY] Multi-layer credential scrubbing in engine at `packages/server/src/engine/hooks/credential-scrubber.ts`

Three-layer scrubbing: static regex patterns, JSON-based secret detection via `@zapier/secret-scrubber`, and session-specific registered credential scrubbing. Credentials are loaded at session start and released in the finally block.

---

### praise: [SECURITY] API key authentication uses SHA-256 hashing at `packages/server/src/middleware/api-key-auth.ts:32`

API keys are stored as SHA-256 hashes in the database (not plaintext). The raw key is never persisted, only compared at request time.

---

## 5. API Security

### issue: [SECURITY] Error handler exposes raw error messages to clients at `packages/server/src/middleware/error.ts:23-28`

```ts
const response: ApiError = {
  error: {
    code: err instanceof HTTPError ? (err.code ?? 'ERROR') : 'INTERNAL_ERROR',
    message: err instanceof Error ? err.message : 'Unknown error',
  },
}
```

For non-HTTPError exceptions (500s), the raw `err.message` is returned to the client. This can leak internal implementation details, database error messages, file paths, or stack traces.

**Severity**: MEDIUM
**Recommendation**: For 500 errors, return a generic message ("Internal server error") to the client and log the actual error message server-side only.

---

### issue: [SECURITY] Rate limiter uses X-Forwarded-For without validation at `packages/server/src/middleware/rate-limit.ts:15`

```ts
const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
```

The `X-Forwarded-For` header is client-controlled. An attacker can bypass rate limiting by rotating this header value on each request. The header may also contain a comma-separated list of IPs.

**Severity**: HIGH
**Recommendation**: Parse only the first IP from `X-Forwarded-For` and ensure the reverse proxy (Cloudflare) overwrites the header. Alternatively, use Cloudflare's `CF-Connecting-IP` header which is set by the edge and not spoofable.

---

### praise: [SECURITY] CORS properly restricted in production at `packages/server/src/index.ts:102-107`

Production CORS origin is locked to `https://corthex-hq.com` only. Development allows localhost origins. `credentials: true` is appropriately set.

---

### praise: [SECURITY] Rate limiting on login and registration endpoints at `packages/server/src/index.ts:129-132`

Login (5/min), admin login (5/min), register (5/min), and invite accept (5/min) all have dedicated rate limits. General API has 100/min rate limit.

---

### praise: [SECURITY] Graceful shutdown with active session tracking at `packages/server/src/index.ts:312-343`

The server tracks active agent sessions and waits for them to complete during shutdown, with a 120-second hard timeout.

---

## 6. File Upload Security

### issue: [SECURITY] File extension extracted from user-supplied filename at `packages/server/src/lib/file-storage.ts:18`

```ts
const ext = filename.includes('.') ? filename.split('.').pop() || 'bin' : 'bin'
```

The extension is derived from the original filename without sanitization. A filename like `exploit.php` would be stored with a `.php` extension. While the file is served with its original MIME type from the DB (not the extension), and filenames are UUIDs, this could be an issue if the upload directory is ever served by a web server that interprets extensions.

**Severity**: LOW
**Recommendation**: Whitelist allowed extensions or derive the extension from the validated MIME type instead of the filename.

---

### praise: [SECURITY] Path traversal protection in file-storage.ts at `packages/server/src/lib/file-storage.ts:33-34`

```ts
if (!fullPath.startsWith(UPLOADS_ROOT)) throw new Error('Invalid storage path')
```

Both `getFilePath()` and `deleteFile()` validate that the resolved path stays within the uploads root directory, preventing directory traversal attacks.

---

### praise: [SECURITY] MIME type whitelist for file uploads at `packages/server/src/routes/workspace/files.ts:17-28`

Strict MIME type allowlist with prefix matching for images/text and explicit types for documents. 50MB size limit enforced.

---

## 7. Engine Security (AI Agent Loop)

### issue: [SECURITY] No maximum depth enforcement in agent-loop.ts at `packages/server/src/engine/agent-loop.ts:158`

The agent loop runs for a maximum of 10 turns, but there is no enforcement of `ctx.maxDepth` for delegation chains. While `call_agent` tool calls are tracked via `delegationTracker`, the actual depth limit is not enforced within the loop itself -- it relies on the caller checking `ctx.depth < ctx.maxDepth` before spawning a new `runAgent`.

**Severity**: LOW
**Recommendation**: Add an explicit depth check at the start of `runAgent()` that throws if `ctx.depth >= ctx.maxDepth`.

---

### praise: [SECURITY] Tool permission guard with explicit allow-list at `packages/server/src/engine/hooks/tool-permission-guard.ts`

Every tool invocation is checked against the agent's `allowedTools` JSONB array. Null or empty = no tools allowed. Only `call_agent` is universally permitted.

---

### praise: [SECURITY] CLI token extracted once and not logged at `packages/server/src/engine/agent-loop.ts:70`

The API key is extracted from the session context and used to instantiate the Anthropic client. The comment "null for security (NFR-S2)" indicates awareness of token exposure risk.

---

## 8. WebSocket Security

### praise: [SECURITY] WebSocket JWT authentication at `packages/server/src/ws/server.ts:25-43`

WS connections require a valid JWT token passed as a query parameter. Failed verification results in immediate close with code 4001. Connection limit of 3 per user prevents resource exhaustion.

---

### issue: [SECURITY] WebSocket token passed as query parameter at `packages/server/src/ws/server.ts:26`

```ts
const token = c.req.query('token')
```

JWT tokens in query strings are logged in HTTP access logs, browser history, and proxy logs. This is a well-known security anti-pattern.

**Severity**: MEDIUM
**Recommendation**: Pass the token in the first WebSocket message after connection (authenticate-on-connect pattern) or use a short-lived token exchange endpoint.

---

## 9. Frontend Security

### issue: [SECURITY] JWT token stored in localStorage at `packages/app/src/stores/auth-store.ts:22,28`

```ts
token: localStorage.getItem('corthex_token'),
localStorage.setItem('corthex_token', token)
```

localStorage is accessible to any JavaScript running on the same origin. If an XSS vulnerability is found (e.g., through a future `dangerouslySetInnerHTML` usage or third-party library), the attacker can steal the JWT token.

**Severity**: MEDIUM
**Recommendation**: Use httpOnly cookies for token storage, which are not accessible to JavaScript. Alternatively, accept the risk with strong CSP headers.

---

### praise: [SECURITY] No dangerouslySetInnerHTML usage in production code

Grep confirms no production use of `dangerouslySetInnerHTML`. The only references are in a test file and a comment noting it is NOT used.

---

## 10. Telegram Webhook Security

### issue: [SECURITY] Telegram webhook processes requests even with empty webhookSecret at `packages/server/src/routes/telegram-webhook.ts:37`

```ts
if (config.webhookSecret && secretHeader !== config.webhookSecret) {
```

If `config.webhookSecret` is null/empty (not configured), the secret check is bypassed entirely. Any attacker can send fake Telegram updates to `/api/telegram/webhook/:companyId` and trigger bot actions.

**Severity**: HIGH
**Recommendation**: Require `webhookSecret` to be set. If not set, reject all webhook requests for that company.

---

## Summary

| Category | Findings | Severity |
|---|---|---|
| JWT Secret Fallback | 1 | CRITICAL |
| Admin Companies No Tenant Isolation | 1 | CRITICAL |
| Admin Soul-Templates Cross-Tenant CRUD | 1 | HIGH |
| No JWT Revocation | 1 | HIGH |
| ReDoS in Regex Tool | 1 | HIGH |
| Rate Limiter Bypass (X-Forwarded-For) | 1 | HIGH |
| Telegram Webhook Secret Bypass | 1 | HIGH |
| Error Message Leakage | 1 | MEDIUM |
| WS Token in Query String | 1 | MEDIUM |
| localStorage JWT Storage | 1 | MEDIUM |
| Weak ENCRYPTION_KEY Validation | 1 | MEDIUM |
| Auth Catch-All Error Handling | 1 | MEDIUM |
| Workspace Missing tenantMiddleware | 1 | MEDIUM |
| File Extension from User Input | 1 | LOW |
| Raw SQL Pattern Fragility | 1 | LOW |
| Agent Loop Depth Not Enforced | 1 | LOW |

**Total Issues**: 16
**Praises**: 13

---

## Security Score: 5/10

**Rationale**: The codebase demonstrates strong security awareness in many areas (encryption, credential scrubbing, scoped queries, input validation, WS authorization, CORS, rate limiting). However, two CRITICAL vulnerabilities (hardcoded JWT fallback secret and admin companies route without tenant isolation) and five HIGH-severity issues significantly reduce the score. The hardcoded JWT secret alone is a showstopper for a production multi-tenant system -- if the env var is ever unset, the entire platform is compromised.

### Immediate Actions Required (P0):
1. Remove JWT secret fallback -- fail on startup if not set
2. Add tenant isolation to admin companies route
3. Scope admin soul-templates CRUD to tenant companyId

### Short-Term (P1):
4. Implement JWT blocklist
5. Fix rate limiter to use CF-Connecting-IP
6. Require Telegram webhook secret
7. Add ReDoS protection to regex-matcher tool
8. Fix error handler to not leak 500 error details

### Medium-Term (P2):
9. Apply tenantMiddleware to workspace routes
10. Move JWT to httpOnly cookies
11. Migrate crypto.ts to hex key format
12. Authenticate WS via first-message instead of query param
