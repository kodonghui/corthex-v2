# Critic-B (Quinn, QA+Security) Review — Story 22.4: HTTP Security Headers & Rate Limiting

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 8/10 | Line numbers verified correct (index.ts:102-113, knowledge.ts:566/623). Magic bytes hex values accurate. CSP directives explicit. |
| D2 완전성 | 25% | 7/10 | Good NFR-S11/S12/S13 coverage. Missing: x-forwarded-for spoofing fix, CSP base-uri/form-action, SVG handling in files.ts. |
| D3 정확성 | 15% | 9/10 | All line numbers and file references verified against codebase. secureHeaders config, CORS origins, rate-limit.ts structure all accurate. |
| D4 실행가능성 | 10% | 8/10 | Clear code snippets, integration points specified, task breakdown solid. |
| D5 일관성 | 15% | 8/10 | Reuses existing rate-limit.ts pattern. Error format matches `{ error: { code, message } }` convention. |
| D6 리스크 | 25% | 6/10 | For a **security-focused story**, critical security risks missed: rate limit bypass vector, missing CSP directives, SVG in MIME whitelist. |

## Round 1 가중 평균: 7.25/10 ✅ PASS (borderline)

---

## Round 2 (Post-Fix) 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 9/10 | IP extraction chain explicit, sanitization regex provided, WebP dual-offset check, all line references accurate. Minor: Task 1.3 parenthetical says "string or object" → should be "string or boolean" (Hono API). |
| D2 완전성 | 25% | 9/10 | All gaps filled: cf-connecting-ip IP fix, base-uri+form-action CSP, SVG exclusion, upgrade-insecure-requests, Unicode NFC normalization, WebP RIFF, POST-only rate limit scope. |
| D3 정확성 | 15% | 8/10 | Task 1.3 Hono API description slightly inaccurate (actual value correct). All other references verified. |
| D4 실행가능성 | 10% | 9/10 | Code snippets for IP extraction, sanitization regex, integration points specified. |
| D5 일관성 | 15% | 9/10 | Consistent with existing patterns, error format convention followed. |
| D6 리스크 | 25% | 9/10 | All identified risks addressed: IP spoofing, SVG XSS, Unicode path traversal, CSP hardening. HSTS preload intentionally deferred (documented). |

## Round 2 가중 평균: 8.85/10 ✅ PASS

계산: (9×0.10) + (9×0.25) + (8×0.15) + (9×0.10) + (9×0.15) + (9×0.25) = 0.9 + 2.25 + 1.2 + 0.9 + 1.35 + 2.25 = 8.85

## 이슈 목록

### 🔴 CRITICAL

**1. [D6 리스크] Rate limit bypass via `x-forwarded-for` spoofing**

`rate-limit.ts:15`:
```typescript
const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
```

- `X-Forwarded-For` is a **user-controlled header**. Any attacker can set `X-Forwarded-For: 1.2.3.{N}` to get a fresh rate limit bucket per request.
- Behind Cloudflare, the reliable client IP is `CF-Connecting-IP` (set by Cloudflare, not spoofable by end user).
- The current code makes ALL rate limiting (loginRateLimit, apiRateLimit, and the new cliRateLimit) bypassable.
- **Fix**: Use `c.req.header('cf-connecting-ip') || c.req.header('x-real-ip') || 'unknown'` in production. `x-forwarded-for` is only reliable if the first IP is extracted and the proxy chain is trusted.
- **Impact on this story**: The cliRateLimit (10 req/min) for CLI token validation (which calls Anthropic API) is completely bypassed — attacker can enumerate API keys or burn Anthropic quota at will.

### 🟡 HIGH

**2. [D2 완전성] Missing CSP directives: `base-uri` and `form-action`**

Current CSP (index.ts:102-113) lacks:
- `base-uri: 'self'` — Without this, an attacker who achieves HTML injection can use `<base href="https://evil.com">` to redirect all relative URLs to their domain.
- `form-action: 'self'` — Without this, injected `<form action="https://evil.com">` can exfiltrate data on form submit.
- Both are OWASP SaaS baseline recommendations.
- **Fix**: Add to AC-1: `baseUri: ["'self'"]` and `formAction: ["'self'"]` in secureHeaders config.

**3. [D2 완전성] SVG XSS vector in files.ts MIME whitelist**

- `files.ts:17`: `ALLOWED_MIME_PREFIXES = ['image/']` — this accepts `image/svg+xml`
- SVG files can contain `<script>` tags and event handlers → XSS vector
- Currently mitigated by `Content-Disposition: attachment` on download (files.ts:135) — safe for download
- BUT: `file.name` is stored in DB as-is (files.ts:62) and displayed in UI — if the `storagePath` or `filename` is ever used to render an `<img>` tag, the SVG executes inline
- Magic bytes validation (Task 4) skips `image/svg+xml` because SVGs are XML text with no reliable magic bytes
- **Suggestion**: Either explicitly exclude `image/svg+xml` from ALLOWED_MIME, or add note that SVGs should only ever be served with `Content-Disposition: attachment`

**4. [D6 리스크] Rate limit key includes path — credential endpoint might be accessed via path variants**

- `rate-limit.ts:16`: `const key = \`${ip}:${c.req.path}\``
- If the route can be accessed with trailing slashes or different casing, each variant gets a separate rate limit bucket
- Hono normalizes paths, so this is likely safe, but should be verified

### 🟡 HIGH (from cross-talk)

**5. [D3 정확성] Task 1.2 HSTS format is WRONG — object vs string**

- Task 1.2 says: `strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true }` (object)
- Hono's `secureHeaders` accepts `boolean | string` ONLY (verified: Hono source `secure-headers.js:86-90`)
- Object would silently stringify to `[object Object]` or fail
- Dev Notes section has the **correct** format: `'max-age=31536000; includeSubDomains'` (string)
- **Fix**: Task 1.2 must use string: `strictTransportSecurity: isProd ? 'max-age=31536000; includeSubDomains' : false`
- (Credit: Winston, verified against Hono source)

**6. [D2 완전성] sanitizeFilename: Unicode path separator bypass**

- Simple `/` and `\` strip misses fullwidth variants: `／` (U+FF0F), `＼` (U+FF3C)
- Fix: NFKC normalize before stripping, or regex `[\/\\／＼]`
- (Credit: Winston + John cross-talk)

**7. [D3 정확성] WebP magic bytes: RIFF header required**

- Spec checks only `WEBP` at offset 8 — should also verify `RIFF` at offset 0
- Without RIFF check, other RIFF formats (AVI, WAV) could false-positive
- (Credit: Winston)

**8. [D4 실행가능성] Rate limit scope: POST only**

- `cliRateLimit` should apply to POST handler only, not entire route
- GET (list) and DELETE (soft-delete) don't call Anthropic API
- (Credit: Winston)

### 🟢 LOW

**9. [D1 구체성] `img-src https:` is very broad**

- `img-src 'self' data: https:` allows loading images from ANY HTTPS domain
- Can be used for tracking pixels (1x1 images that leak user activity to third parties)
- For a SaaS, consider whitelisting specific CDN domains if possible, or accept as known risk

**6. [D2 완전성] No `upgrade-insecure-requests` CSP directive**

- `upgrade-insecure-requests` tells the browser to automatically upgrade HTTP resources to HTTPS
- Complements HSTS and is recommended for production SaaS
- Non-blocking but good to add

**7. [D3 정확성] Hono `secureHeaders` X-Content-Type-Options default**

- Story claims "nosniff is set by default" — should verify this is true for current Hono version
- If not default, explicitly add: `xContentTypeOptions: 'nosniff'`

## Security Stress-Test Responses

### Magic bytes completeness
- **Sufficient for knowledge.ts**: Only .md/.txt/.pdf allowed — only PDF needs magic bytes. ✅
- **Gap for files.ts**: Accepts `image/*` (including BMP, TIFF, SVG) and Office formats. BMP (`42 4D`) and TIFF (`49 49 2A 00` / `4D 4D 00 2A`) are missing but low risk. SVG has no magic bytes — addressed in Issue #3.

### MIME confusion attacks
- **Polyglot PDF-JS**: A file with `%PDF` header but JavaScript payload — mitigated by `Content-Disposition: attachment` on download. ✅
- **SVG XSS**: See Issue #3 — partially mitigated by download-only serving.
- **text/html masquerading**: `text/*` prefix accepts `text/html` uploads (files.ts:17) — if served inline, XSS. Currently attachment-only. ✅

### Rate limit bypass
- **x-forwarded-for spoofing**: See Issue #1. **CRITICAL** for this security story.
- **Path variants**: See Issue #4. Low risk with Hono path normalization.

### CSP gaps
- **base-uri / form-action missing**: See Issue #2. HIGH for SaaS baseline.
- **upgrade-insecure-requests**: See Issue #6. LOW.

## Cross-talk 요약

- **Winston (Critic-A, 8.40/10 PASS):**
  - Unicode path separators (U+FF0F fullwidth `/`, U+FF3C fullwidth `\`) bypass simple string replace. Fix: NFKC normalize before stripping, or regex with Unicode class.
  - Rate limit should apply to POST only (not GET/DELETE) — only POST calls Anthropic API.
  - WebP validation: check `RIFF` at offset 0 AND `WEBP` at offset 8 (not just offset 8).
- **John (Critic-C, 8.65/10 PASS):**
  - Magic bytes coverage adequate for current MIME whitelist. No malware scanning (out of scope).
  - sanitizeFilename needs Unicode + double-encoding edge cases. All 3 critics confirm.
  - knowledge.ts:623 path traversal confirmed real by all 3 critics.

## Test Requirements

1. Rate limit test must verify spoofing protection (if fixed)
2. CSP test should assert `base-uri` and `form-action` present
3. Magic bytes test for SVG should verify rejection or documented exception
4. Filename sanitization should test Unicode normalization attacks (NFC/NFD forms of `../`)
5. Verify `X-Content-Type-Options: nosniff` actually appears in response headers
