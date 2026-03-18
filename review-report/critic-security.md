# CRITIC-SECURITY: Full Codebase Security Audit

**Auditor**: CRITIC-SECURITY (Opus 4.6)
**Date**: 2026-03-18
**Scope**: OWASP Top 10 + CORTHEX-specific attack surface
**Score**: 6.5 / 10

---

## 1. Authentication & Authorization

### issue: [SECURITY] Hardcoded JWT_SECRET fallback allows token forgery in misconfigured deployments — `packages/server/src/middleware/auth.ts:11` + `packages/server/src/ws/server.ts:7`
The JWT secret has a hardcoded fallback `'corthex-v2-dev-secret-change-in-production'` used in **two separate files** (auth.ts and ws/server.ts). If `JWT_SECRET` env var is unset in production, any attacker can forge valid JWTs with arbitrary `sub`, `companyId`, and `role` values. This is a **CRITICAL** vulnerability if the env var is ever missing. The duplication across files also increases drift risk.

### suggestion: [SECURITY] Remove the fallback entirely. Fail-fast on startup if `JWT_SECRET` is not set (like `credential-crypto.ts` does for `CREDENTIAL_ENCRYPTION_KEY`). Extract the secret into a single shared constant.

### issue: [SECURITY] Auth catch block swallows ALL errors, masking non-JWT failures — `packages/server/src/middleware/auth.ts:98-100`
```typescript
} catch {
    throw new HTTPError(401, '...', 'AUTH_002')
}
```
The bare `catch` catches everything: DB connection errors, active-status check failures, and unexpected runtime exceptions are all returned as 401 "invalid token." This masks real server errors (should be 500) and makes debugging impossible. A user whose company was just deactivated might get "invalid token" instead of the correct "company deactivated" message if the inner HTTPError re-throw fails due to error chaining.

### suggestion: [SECURITY] Catch only JWT verification errors specifically. Re-throw HTTPError instances that were already thrown inside the try block. Only convert unknown errors to 401.

### issue: [SECURITY] No JWT blocklist — revoked tokens remain valid for up to 24 hours — `packages/server/src/middleware/auth.ts:49`
JWT expiry is 24 hours. When a user is deactivated, the active-status cache has a 30-second TTL window where the token still works. But more critically, if someone's token is compromised, there is no way to revoke it. The `invalidateActiveStatusCache` only clears the local 30s cache, not the JWT itself.

### suggestion: [SECURITY] Implement a JWT blocklist (Redis or in-memory Set) for token revocation. On user deactivation or password change, add the `jti` to the blocklist. This is listed as known tech debt but is HIGH risk.

### praise: [SECURITY] Active status caching (30s TTL) with `invalidateActiveStatusCache` is a solid pattern — balances performance with near-real-time revocation.

### issue: [SECURITY] Admin CLI credentials route has no tenant scoping — any admin can read any user's CLI tokens — `packages/server/src/routes/admin/credentials.ts:38-55`
```typescript
credentialsRoute.get('/cli-credentials', async (c) => {
  const userId = c.req.query('userId')
  // ...queries by userId with NO companyId filter
})
```
The route uses `authMiddleware, adminOnly` but no `tenantMiddleware`. A `company_admin` for Company A can query CLI credentials for users in Company B by passing any `userId`. This is an **IDOR vulnerability**.

### suggestion: [SECURITY] Add `tenantMiddleware` and filter by `tenant.companyId`. For `super_admin`, allow cross-company access. For `company_admin`, restrict to their own company's users.

### issue: [SECURITY] Admin companies route (GET /api/admin/companies) exposes ALL companies to any admin — `packages/server/src/routes/admin/companies.ts:36-39`
```typescript
companiesRoute.use('*', authMiddleware, adminOnly) // No tenantMiddleware
// ...
const result = await db.select().from(companies).orderBy(companies.createdAt) // No companyId filter
```
A `company_admin` (who should only see their own company) can see all companies in the system. The route has `adminOnly` but no tenant scoping or RBAC differentiation between `super_admin` and `company_admin`.

### suggestion: [SECURITY] Apply `tenantMiddleware` or add RBAC: `company_admin` should only see their own company; `super_admin` can see all.

### praise: [SECURITY] All workspace routes consistently apply `authMiddleware`. All admin routes apply `authMiddleware + adminOnly`. Super-admin routes use `rbacMiddleware('super_admin')`. Good layered defense.

---

## 2. Tenant Isolation

### issue: [SECURITY] Workspace routes missing `tenantMiddleware` — rely solely on JWT companyId without body-mismatch protection — all files in `packages/server/src/routes/workspace/`
None of the ~35 workspace routes apply `tenantMiddleware`. While they use `tenant.companyId` from JWT for DB queries (which provides basic isolation), they miss the tenant middleware's body-companyId-mismatch check. If a workspace route accepts `companyId` in a POST body, there is no cross-tenant write protection.

### suggestion: [SECURITY] Audit all workspace POST/PUT/PATCH routes for body `companyId` fields. Either add `tenantMiddleware` globally or verify that no workspace route accepts `companyId` in the request body (the latter appears to be the case based on sampling, so this is LOW risk).

### praise: [SECURITY] Tenant middleware's body-companyId mismatch check (`tenant.ts:36-43`) is a well-designed defense-in-depth layer. The super_admin override via query param is properly scoped.

### praise: [SECURITY] WebSocket channels.ts performs thorough tenant isolation — every channel subscription verifies `companyId` against the client's JWT-derived companyId, with per-resource DB lookups for chat, messenger, conversations, strategy notes, and debates.

---

## 3. Input Validation

### praise: [SECURITY] Consistent Zod validation across all routes. Every POST/PUT/PATCH endpoint uses `zValidator` with typed schemas. Registration enforces slug regex, email format, password minimum length.

### issue: [SECURITY] Password policy is weak — minimum 6 characters with no complexity requirements — `packages/server/src/routes/auth.ts:27` + `packages/server/src/routes/workspace/profile.ts:19`
Both registration and profile-update accept `z.string().min(6)` for passwords. No uppercase, number, or special character requirements. No check against common passwords.

### suggestion: [SECURITY] Strengthen to min 8 chars with complexity requirements, or integrate a password strength library (e.g., zxcvbn).

### praise: [SECURITY] Prompt injection defense (`prompt-guard.ts`) is well-implemented — company-configurable sensitivity levels, audit logging of attempts, clean separation of concerns.

---

## 4. Credential Handling

### praise: [SECURITY] Excellent credential encryption architecture. Two separate encryption modules:
- `credential-crypto.ts`: AES-256-GCM with fail-fast key validation (64 hex chars), random IV per encryption, non-exported key buffer
- `crypto.ts`: AES-256-GCM with 32-char minimum key requirement
Both use Web Crypto API properly.

### praise: [SECURITY] Credential scrubber (`credential-scrubber.ts`) implements 3-layer scrubbing: regex patterns, JSON-based secret detection (@zapier/secret-scrubber), and session-specific registered credential matching. Good minimum-length guard (4 chars) to prevent aggressive false positives.

### issue: [SECURITY] Two separate encryption modules with different key derivation — `packages/server/src/lib/crypto.ts` vs `packages/server/src/lib/credential-crypto.ts`
`crypto.ts` uses `ENCRYPTION_KEY` (text, sliced to 32 bytes) with raw AES-GCM import. `credential-crypto.ts` uses `CREDENTIAL_ENCRYPTION_KEY` (64 hex chars = 32 bytes) with proper hex decoding. Having two encryption paths increases the chance of misuse, and `crypto.ts`'s key derivation (text truncation to 32 bytes) is weaker than proper hex-encoded keys.

### suggestion: [SECURITY] Consolidate to a single encryption module (credential-crypto.ts, which has better key handling). Migrate crypto.ts callers.

### issue: [SECURITY] SMTP credentials stored in plaintext in DB — `packages/server/src/routes/admin/companies.ts:127-137`
```typescript
.set({ smtpConfig: body, updatedAt: new Date() })
```
SMTP config (including `user` and `pass`) is stored directly in the `companies` table `smtpConfig` JSON column without encryption. Anyone with DB access can read SMTP passwords.

### suggestion: [SECURITY] Encrypt `smtpConfig.pass` using `credential-crypto.ts` before storing. Decrypt on use.

---

## 5. Rate Limiting

### praise: [SECURITY] Rate limiting is properly applied:
- Login/register/invite: 5/min per IP+path
- General API: 100/min per IP+path
- API key auth: per-key rate limiting from DB config
- Session limiter: max 20 concurrent sessions
- Periodic cleanup of expired rate limit entries

### issue: [SECURITY] Rate limiting uses `x-forwarded-for` header which is spoofable behind certain proxy configs — `packages/server/src/middleware/rate-limit.ts:15`
```typescript
const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
```
If the reverse proxy doesn't strip/overwrite `x-forwarded-for`, attackers can bypass rate limits by sending arbitrary header values.

### suggestion: [SECURITY] Ensure the production reverse proxy (Cloudflare/Nginx) is configured to set a trusted `x-real-ip`. Use a single trusted header source rather than fallback chain.

---

## 6. Error Handling & Information Leakage

### praise: [SECURITY] Error handler (`error.ts`) properly differentiates HTTPError (application errors) from unexpected errors (500). It returns structured error responses with codes, not stack traces. Error messages are in Korean, which incidentally reduces information leakage to automated scanners.

### issue: [SECURITY] Error handler exposes raw error messages for 500 errors — `packages/server/src/middleware/error.ts:27`
```typescript
message: err instanceof Error ? err.message : 'Unknown error',
```
For non-HTTPError exceptions (500s), the raw error message is returned to the client. This can leak internal details like DB connection strings, file paths, or SQL syntax errors.

### suggestion: [SECURITY] For 500 errors, return a generic message to the client while logging the full error server-side. Only return `err.message` for HTTPError instances.

---

## 7. WebSocket Security

### praise: [SECURITY] WebSocket authentication is properly implemented — JWT verification on upgrade, connection limit (max 3 per user), per-channel authorization with DB lookups, proper cleanup on disconnect.

### issue: [SECURITY] WebSocket JWT token passed as query parameter — `packages/server/src/ws/server.ts:26`
```typescript
const token = c.req.query('token')
```
The JWT is passed as `?token=xxx` in the WebSocket URL. Query parameters are logged in web server access logs, proxy logs, browser history, and referrer headers. This exposes the authentication token in multiple logging layers.

### suggestion: [SECURITY] This is a known limitation of WebSocket (no custom headers during upgrade). Document the risk and ensure proxy logs redact the `token` query parameter. Consider using a short-lived WebSocket-specific token exchanged via authenticated HTTP first.

---

## 8. Frontend Security

### issue: [SECURITY] JWT stored in localStorage — vulnerable to XSS token theft — `packages/app/src/stores/auth-store.ts:22-24` + `packages/admin/src/stores/auth-store.ts:18-19`
Both CEO and admin apps store JWT tokens in `localStorage`. If any XSS vulnerability exists (even via a third-party library), the attacker can steal the token with `localStorage.getItem('corthex_token')` and gain full account access.

### suggestion: [SECURITY] Consider httpOnly cookies for token storage (immune to XSS theft). If localStorage must be used, implement Content-Security-Policy headers and ensure no `dangerouslySetInnerHTML` is used with user content.

### praise: [SECURITY] No `dangerouslySetInnerHTML` with user-supplied content in the React apps. The one reference in `deliverable-viewer.tsx` explicitly uses MarkdownRenderer instead. The `innerHTML` in `naver-blog-publisher.ts` is server-side Selenium automation, not client-facing.

### praise: [SECURITY] CORS is properly restricted — production only allows `https://corthex-hq.com`, dev allows localhost ports. Credentials mode enabled.

---

## 9. Data Layer Security

### issue: [SECURITY] `select()` without column projection returns all columns including sensitive data — `packages/server/src/routes/admin/companies.ts:37,70`
```typescript
db.select().from(companies) // returns smtpConfig (plaintext passwords), settings, etc.
```
The admin companies list and detail endpoints return the full `companies` row including `smtpConfig` (SMTP passwords) and `settings`. These should be projected to exclude sensitive fields.

### suggestion: [SECURITY] Use explicit column selection (`.select({ id, name, slug, ... })`) to avoid leaking sensitive configuration data.

### praise: [SECURITY] Most routes properly use column projection. Credential routes never return encrypted values. API key listing only returns metadata (id, provider, label, scope).

---

## 10. Additional Findings

### issue: [SECURITY] Registration endpoint has no CAPTCHA or proof-of-work — `packages/server/src/routes/auth.ts:32`
The `/auth/register` endpoint creates a company + user + deploys 29 agents + creates system agent. While rate-limited to 5/min, an attacker can still create ~300 companies/hour from a single IP, or unlimited from rotating IPs. Each registration triggers expensive agent deployment.

### suggestion: [SECURITY] Add CAPTCHA (e.g., Cloudflare Turnstile) to the registration endpoint to prevent automated abuse.

### praise: [SECURITY] Invitation system properly validates token, checks expiry, verifies company active status, and checks for duplicate emails before creating accounts.

### praise: [SECURITY] Audit logging (RBAC denials, credential operations, prompt injection attempts) provides good forensic capability.

---

## Summary Table

| Category | Findings | Risk Level |
|----------|----------|------------|
| JWT Secret Fallback | Hardcoded fallback in 2 files | **CRITICAL** |
| No JWT Blocklist | 24h window after compromise | **HIGH** |
| Admin IDOR (CLI creds) | Cross-tenant CLI credential read | **HIGH** |
| Admin Companies Exposure | company_admin sees all companies | **MEDIUM** |
| SMTP Plaintext Storage | SMTP passwords unencrypted in DB | **MEDIUM** |
| Error Message Leakage | Raw error messages in 500 responses | **MEDIUM** |
| WS Token in Query Param | JWT in URL logs | **MEDIUM** |
| localStorage JWT | XSS-vulnerable token storage | **MEDIUM** |
| Weak Password Policy | min 6 chars, no complexity | **LOW** |
| Rate Limit IP Spoofing | x-forwarded-for spoofable | **LOW** |
| No Registration CAPTCHA | Automated company creation | **LOW** |
| Dual Encryption Modules | Maintenance/confusion risk | **LOW** |

## Score Breakdown

| Area | Score | Notes |
|------|-------|-------|
| Auth & AuthZ | 5/10 | JWT fallback is critical; IDOR in admin credentials |
| Tenant Isolation | 8/10 | Good in workspace; admin routes need RBAC tightening |
| Input Validation | 9/10 | Consistent Zod; prompt guard well-done |
| Credential Handling | 7/10 | Strong encryption but SMTP plaintext and dual modules |
| Rate Limiting | 8/10 | Comprehensive but IP spoofable |
| Error Handling | 6/10 | 500 error message leakage |
| WebSocket Security | 8/10 | Thorough channel auth; token-in-URL is inherent limitation |
| Frontend Security | 6/10 | localStorage JWT is industry-standard but risky |

## Overall: 6.5 / 10

The codebase demonstrates strong security fundamentals (Zod validation everywhere, AES-256-GCM encryption, layered auth middleware, WebSocket channel authorization, prompt injection defense). However, the hardcoded JWT secret fallback is a critical vulnerability that could compromise the entire system if the env var is ever unset. The admin credential IDOR and missing tenant scoping on admin routes are high-risk issues that should be addressed immediately.
