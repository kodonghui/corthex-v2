# Story 22.4: HTTP Security Headers & Rate Limiting

Status: ready-for-dev

## Story

As a platform operator,
I want SaaS security baselines applied to all HTTP responses,
So that the application meets minimum security standards for a multi-tenant SaaS.

## Acceptance Criteria

1. **AC-1: Content-Security-Policy hardened**
   **Given** the Hono server has existing `secureHeaders` in `index.ts:102-113` with CSP only in prod
   **When** CSP is verified and extended
   **Then** `script-src 'self' https://static.cloudflareinsights.com` is present (no `unsafe-eval`, no `unsafe-inline` for scripts)
   **And** `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` is present (unsafe-inline required for Tailwind/inline styles)
   **And** `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'` are present
   **And** `img-src 'self' data: https:` is present (allows external avatars/images)
   **And** `connect-src 'self' https://corthex-hq.com wss://corthex-hq.com` is present
   **And** `base-uri 'self'` is present (prevents `<base href>` hijacking — OWASP baseline)
   **And** `form-action 'self'` is present (prevents form data exfiltration via injected `<form>`)
   **And** `upgrade-insecure-requests` is present in production (auto-upgrades HTTP→HTTPS)

2. **AC-2: Strict-Transport-Security (HSTS)**
   **Given** the server does not currently set HSTS
   **When** secureHeaders is extended
   **Then** `Strict-Transport-Security: max-age=31536000; includeSubDomains` is set in production
   **And** HSTS is NOT set in development (localhost is HTTP)

3. **AC-3: X-Frame-Options and X-Content-Type-Options**
   **Given** secureHeaders is configured
   **When** responses are sent
   **Then** `X-Frame-Options: DENY` is present (enforced by `frameAncestors: ["'none'"]` which maps to both CSP + X-Frame-Options via Hono)
   **And** `X-Content-Type-Options: nosniff` is present (Hono `secureHeaders` default)

4. **AC-4: CORS policy verification**
   **Given** the server has CORS configured in `index.ts:115-120`
   **When** CORS policy is verified
   **Then** production origin is `['https://corthex-hq.com']` only (no wildcard `*`)
   **And** dev origin is `['http://localhost:5173', 'http://localhost:5174']` only
   **And** `credentials: true` is set for cookie-based auth

5. **AC-5: CLI token endpoint rate limiting (NFR-S13)**
   **Given** CLI token registration (`POST /api/admin/cli-credentials`) and verification call Anthropic API with user-supplied token
   **When** these endpoints are called repeatedly
   **Then** rate limited to 10 req/min per IP (new `cliRateLimit` middleware)
   **And** existing `loginRateLimit` (5/min) and `apiRateLimit` (100/min) remain unchanged
   **And** rate limit returns `429` with `{ error: { code, message, retryAfter } }` response format
   **And** IP extraction uses `cf-connecting-ip` (Cloudflare, not spoofable) with `x-forwarded-for` last-hop fallback (fixes spoofing vulnerability in all rate limiters)

6. **AC-6: File upload security — magic bytes validation (NFR-S12)**
   **Given** `files.ts` (50MB, MIME whitelist) and `knowledge.ts:566` (10MB, extension whitelist) handle file uploads
   **When** a file is uploaded
   **Then** magic bytes are validated against file header (first 4-12 bytes) for PDF, PNG, JPEG, GIF, WebP, ZIP, Office formats
   **And** file with mismatched extension/magic-bytes is rejected with 400 error
   **And** knowledge.ts upload uses the same validation
   **And** `image/svg+xml` is explicitly excluded from `files.ts` MIME whitelist (SVGs can contain `<script>` — XSS vector)

7. **AC-7: File upload security — filename sanitization (NFR-S12)**
   **Given** `knowledge.ts:623` writes files with `file.name` directly (path traversal risk)
   **When** a file is uploaded
   **Then** filename is sanitized: strip path separators (`/`, `\`), null bytes, leading dots, control chars, and Unicode normalization attacks (NFC/NFD `../`)
   **And** sanitized name is used for disk write and `fileUrl` in knowledge.ts
   **And** `files.ts` already uses UUID-based storage via `file-storage.ts` (no path traversal risk — only `file.name` stored in DB as metadata)

8. **AC-8: Test coverage**
   **Given** all security changes are applied
   **When** tests run
   **Then** unit tests verify: CSP directives, HSTS header, CORS policy, rate limit thresholds, magic bytes detection, filename sanitization
   **And** existing tests pass (no CORS breakage, no header regression)

## Tasks / Subtasks

- [ ] Task 1: Harden secureHeaders & add HSTS (AC: #1, #2, #3)
  - [ ] 1.1 Add `baseUri: ["'self'"]` and `formAction: ["'self'"]` to CSP config in `index.ts:103-112` (OWASP baseline — prevents `<base href>` hijacking and form data exfiltration)
  - [ ] 1.2 Add `upgradeInsecureRequests: []` to CSP config (prod only — auto-upgrades HTTP→HTTPS)
  - [ ] 1.3 Add `strictTransportSecurity` to `secureHeaders()` config: `'max-age=31536000; includeSubDomains'` (string format, prod only — Hono supports string or object)
  - [ ] 1.4 Verify `X-Frame-Options: DENY` — already handled by `frameAncestors: ["'none'"]` (confirm in tests)
  - [ ] 1.5 Verify `X-Content-Type-Options: nosniff` — Hono `secureHeaders` default (confirm in tests)
  - [ ] 1.6 Exclude `image/svg+xml` from `files.ts` MIME whitelist — SVGs can contain `<script>` tags (XSS vector). Add explicit `!mimeType.includes('svg')` check.

- [ ] Task 2: Verify CORS policy (AC: #4)
  - [ ] 2.1 Confirm `index.ts:115-120` CORS — already correct: prod `['https://corthex-hq.com']`, dev `['http://localhost:5173', 'http://localhost:5174']`, `credentials: true`
  - [ ] 2.2 Add test assertions verifying CORS origin values (no wildcard)

- [ ] Task 3: Rate limiting hardening (AC: #5)
  - [ ] 3.1 Fix IP extraction in `createRateLimiter` (`rate-limit.ts:15`): use `c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || c.req.header('x-real-ip') || 'unknown'` — `cf-connecting-ip` is set by Cloudflare (not spoofable), `x-forwarded-for` first entry is the client IP added by the first trusted proxy
  - [ ] 3.2 Add `cliRateLimit` to `packages/server/src/middleware/rate-limit.ts` — 10 req/min per IP, error code `CRED_RATE`, message `'CLI 인증 요청 한도 초과'`
  - [ ] 3.3 Apply `cliRateLimit` as middleware on POST handler in `credentials.ts:58` (NOT in `index.ts` — more precise, avoids rate-limiting GET/DELETE endpoints)
  - [ ] 3.4 Existing routes: `loginRateLimit` (5/min auth), `apiRateLimit` (100/min general) — no changes except IP extraction fix

- [ ] Task 4: File upload magic bytes validation (AC: #6)
  - [ ] 4.1 Create `packages/server/src/lib/magic-bytes.ts` — export `validateMagicBytes(buffer: ArrayBuffer, mimeType: string): boolean`
  - [ ] 4.2 Magic byte signatures: PDF (`%PDF` = `25 50 44 46`), PNG (`89 50 4E 47`), JPEG (`FF D8 FF`), GIF (`47 49 46 38`), WebP (offset 0: `52 49 46 46` RIFF + offset 8: `57 45 42 50` WEBP — must check both), ZIP/Office (`50 4B 03 04`)
  - [ ] 4.3 For `text/*` and `application/json` MIME types, skip magic bytes check (text files have no reliable magic bytes)
  - [ ] 4.4 Integrate into `files.ts:54` — after reading `arrayBuffer()`, call `validateMagicBytes(buffer, file.type)` before `saveFile()`
  - [ ] 4.5 Integrate into `knowledge.ts:604` — after reading `arrayBuffer()`, validate magic bytes for `.pdf` (skip for `.md`/`.txt`)

- [ ] Task 5: Filename sanitization for knowledge uploads (AC: #7)
  - [ ] 5.1 Create `sanitizeFilename(name: string): string` function in `packages/server/src/lib/magic-bytes.ts` (co-locate with upload security utils)
  - [ ] 5.2 Sanitization rules: NFC normalize first (`name.normalize('NFKC')`), then remove path separators (`/`, `\`, `..`), null bytes (`\0`), control chars (0x00-0x1F), leading dots (`.filename`), trim whitespace. Regex: `name.normalize('NFKC').replace(/[\/\\]/g, '').replace(/\.\./g, '').replace(/[\x00-\x1f]/g, '').replace(/^\.+/, '').trim() || 'upload'`
  - [ ] 5.3 Apply in `knowledge.ts:623` — use `sanitizeFilename(file.name)` for disk write path and `fileUrl`
  - [ ] 5.4 `files.ts` — `file.name` is only stored as DB metadata (`filename` column), actual file saved as UUID via `file-storage.ts:19` — add sanitization to DB `filename` field for display safety only

- [ ] Task 6: Unit tests (AC: #8)
  - [ ] 6.1 Create `packages/server/src/__tests__/unit/http-security-headers.test.ts`
  - [ ] 6.2 Test secureHeaders CSP directives: base-uri, form-action, upgrade-insecure-requests present in config
  - [ ] 6.3 Test HSTS config present with correct max-age and includeSubDomains
  - [ ] 6.4 Test CORS origins (no wildcard in prod, dev origins correct)
  - [ ] 6.5 Test `cliRateLimit` exists with 10 req/min threshold (import and verify)
  - [ ] 6.6 Test rate limiter IP extraction uses `cf-connecting-ip` first (verify in rate-limit.ts source)
  - [ ] 6.7 Test `validateMagicBytes()` — correct detection for PDF, PNG, JPEG, GIF, WebP (RIFF+WEBP), ZIP; rejection of mismatched; skip for text types
  - [ ] 6.8 Test `sanitizeFilename()` — path traversal, null bytes, control chars, leading dots, Unicode normalization (`\u002e\u002e/`), empty string fallback
  - [ ] 6.9 Test SVG exclusion — `image/svg+xml` rejected by files.ts MIME check

## Dev Notes

### Existing Security Setup (verified from codebase)

1. **secureHeaders** (`index.ts:102-113`): CSP with script-src/style-src/img-src/connect-src/font-src/object-src/frame-ancestors. Only in prod (`isProd ? {...} : undefined`).
2. **CORS** (`index.ts:115-120`): Prod = `['https://corthex-hq.com']`, dev = localhost:5173/5174. `credentials: true`.
3. **Rate limiting** (`middleware/rate-limit.ts`): `loginRateLimit` 5/min, `apiRateLimit` 100/min. In-memory Map store with 5-min cleanup interval.
4. **File uploads**:
   - `files.ts`: 50MB limit, MIME whitelist (image/*, text/*, PDF, Office, JSON, ZIP). Saved with UUID filename via `file-storage.ts` (safe).
   - `knowledge.ts:566`: 10MB limit, extension whitelist (.md/.txt/.pdf). **RISK**: Writes to disk with `file.name` directly (`join(uploadDir, file.name)`) — path traversal possible with crafted filename.
   - `file-storage.ts:32-34`: Has path traversal check (`!fullPath.startsWith(UPLOADS_ROOT)`) for read/delete — but knowledge.ts bypasses this by writing directly.

### HSTS via Hono secureHeaders

Hono's `secureHeaders()` supports `strictTransportSecurity` option natively (string format):
```typescript
secureHeaders({
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  contentSecurityPolicy: { ... },
})
```
The HSTS header should only be set in production (HTTP on localhost would cause issues).
Note: HSTS preload is intentionally deferred — requires submission to hstspreload.org and has permanent implications.

### Rate Limit IP Extraction — CRITICAL FIX

**Existing vulnerability** (`rate-limit.ts:15`): `c.req.header('x-forwarded-for')` is user-controlled — attacker sets arbitrary IP per request, bypassing ALL rate limits (login 5/min, API 100/min, CLI 10/min).

**Fix**: Use Cloudflare-set header first (not spoofable behind Cloudflare):
```typescript
const ip = c.req.header('cf-connecting-ip')
  || c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
  || c.req.header('x-real-ip')
  || 'unknown'
```
- `cf-connecting-ip`: Set by Cloudflare, overwrites any client-sent value
- `x-forwarded-for` first entry: Client IP added by first trusted proxy (if not behind Cloudflare)
- Fallback chain ensures rate limiting works in all environments (prod/dev/test)

### CLI Token Rate Limiting Rationale

`POST /api/admin/cli-credentials` (`credentials.ts:58-86`) calls Anthropic API to validate token — this is:
- **Expensive**: Each call creates a messages.create() request
- **Abuse-prone**: Attacker could enumerate API keys or trigger Anthropic rate limits
- 10 req/min per IP matches NFR-S13 specification
- Applied as middleware on POST handler in `credentials.ts` (not `index.ts` — avoids rate-limiting GET/DELETE)

### SVG Exclusion from files.ts MIME Whitelist

`files.ts:17` uses `image/*` prefix which matches `image/svg+xml`. SVGs can contain `<script>` tags — even with `Content-Disposition: attachment` on download, some browsers may render inline SVGs. Explicitly exclude `image/svg+xml` from the allowed check.

### Magic Bytes — Known Signatures

| Format | Magic Bytes | Offset |
|--------|-------------|--------|
| PDF | `25 50 44 46` (`%PDF`) | 0 |
| PNG | `89 50 4E 47 0D 0A 1A 0A` | 0 |
| JPEG | `FF D8 FF` | 0 |
| GIF | `47 49 46 38` (`GIF8`) | 0 |
| WebP | `52 49 46 46` (`RIFF`) at offset 0 + `57 45 42 50` (`WEBP`) at offset 8 | 0 + 8 |
| ZIP/Office | `50 4B 03 04` (`PK`) | 0 |

Office formats (.docx, .xlsx, .pptx) are ZIP-based — `PK` signature is sufficient.

### Filename Sanitization — knowledge.ts Path Traversal

**Current risk** (`knowledge.ts:623`):
```typescript
const filePath = join(uploadDir, file.name) // file.name from user input!
```
A crafted `file.name` like `../../etc/passwd` would resolve outside `uploadDir`. `join()` resolves `..` — the file could be written to arbitrary location.

**Fix**: Sanitize `file.name` before use in path construction. Strip `/`, `\`, `..`, null bytes, control characters.

### files.ts — No Path Traversal Risk

`files.ts` uses `saveFile(buffer, file.name, companyId)` which generates UUID-based filename (`file-storage.ts:19`). The original `file.name` is only stored as DB metadata — no path traversal risk on disk. Sanitization for DB display safety is nice-to-have.

### Size Limit Discrepancy

Epic says "max file size 10MB" (NFR-S12). Current state:
- `knowledge.ts`: 10MB ✓ (matches NFR-S12)
- `files.ts`: 50MB (general file attachments — workspace files, not knowledge docs)

NFR-S12 specifies "File attachment security" with 10MB for knowledge/library files. `files.ts` handles workspace file attachments (different use case). Leave `files.ts` at 50MB — NFR-S12's 10MB applies specifically to knowledge doc uploads.

_References: NFR-S11, NFR-S12, NFR-S13_
