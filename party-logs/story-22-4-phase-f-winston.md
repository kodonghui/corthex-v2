# Code Review — Story 22.4: HTTP Security Headers & Rate Limiting

**Reviewer**: Winston (Architect)
**Date**: 2026-03-24
**Phase**: F (Code Review)
**Scope**: 5 modified + 2 new files, 41 tests

---

## Checklist

- [x] Story spec loaded and cross-referenced against implementation
- [x] All 8 ACs verified against code
- [x] Architecture compliance (E8 boundary, lib/ layer, no DB migrations)
- [x] Security review (IP spoofing, path traversal, MIME spoofing, XSS)
- [x] Existing functionality preserved (CORS, existing rate limiters)

---

## Core Implementation Review

### 1. secureHeaders Hardening (`index.ts:102-117`) ✅

| Directive | Status | Line |
|-----------|--------|------|
| `baseUri: ["'self'"]` | ✅ Added | 113 |
| `formAction: ["'self'"]` | ✅ Added | 114 |
| `upgradeInsecureRequests: []` | ✅ Added | 115 |
| `strictTransportSecurity` (HSTS) | ✅ String format, prod-only | 103 |
| Existing CSP directives | ✅ Preserved | 104-112 |
| CORS config | ✅ Unchanged | 119-124 |

HSTS uses correct string format: `isProd ? 'max-age=31536000; includeSubDomains' : false` — verified against Hono source (`secure-headers.js:86-90`).

### 2. Rate Limiting (`rate-limit.ts`) ✅

| Check | Result |
|-------|--------|
| IP extraction: `cf-connecting-ip` first | ✅ Line 15 — non-spoofable behind Cloudflare |
| `x-forwarded-for` split first entry | ✅ Line 16 — `?.split(',')[0]?.trim()` |
| Fallback chain complete | ✅ cf-connecting-ip → x-forwarded-for[0] → x-real-ip → 'unknown' |
| `cliRateLimit`: 10/min, CRED_RATE | ✅ Lines 53-57 |
| `loginRateLimit`: 5/min unchanged | ✅ Lines 42-45 |
| `apiRateLimit`: 100/min unchanged | ✅ Lines 48-51 |
| Applied on POST only in credentials.ts | ✅ Line 59: `post('/cli-credentials', cliRateLimit, zValidator(...), ...)` |

### 3. upload-security.ts (NEW) ✅

**`validateMagicBytes(buffer, mimeType)`:**

| Format | Signature | Verified |
|--------|-----------|----------|
| PDF | `25 50 44 46` | ✅ Line 13 |
| PNG | `89 50 4E 47` | ✅ Line 14 |
| JPEG | `FF D8 FF` | ✅ Line 15 |
| GIF | `47 49 46 38` | ✅ Line 16 |
| WebP | RIFF (offset 0) + WEBP (offset 8) | ✅ Lines 17-21 — dual-check via `extra` field |
| ZIP/Office | `50 4B 03 04` | ✅ Lines 22-33 — all Office MIME variants covered |
| text/*, JSON | Skip (return true) | ✅ Lines 42-45 |
| Buffer < 4 bytes | Reject (return false) | ✅ Line 48 |

**`sanitizeFilename(name)`:**
- NFKC normalization (line 78) — **better than spec's NFC**: NFKC normalizes compatibility characters (fullwidth ／→/, ＼→\) that NFC doesn't
- Path separators (`/`, `\`) stripped ✅
- Directory traversal (`..`) stripped ✅
- Control chars (0x00-0x1F) stripped ✅
- Leading dots stripped ✅
- Trim + fallback `'upload'` ✅

### 4. Route Integration ✅

**knowledge.ts:**
- Line 608: `validateMagicBytes(arrayBuffer, 'application/pdf')` — PDF only, skips .md/.txt ✅
- Line 628: `sanitizeFilename(file.name)` → `safeName` ✅
- Line 631: `join(uploadDir, safeName)` — disk write uses sanitized name ✅
- Line 635: `fileUrl` uses `safeName` — both paths secured ✅

**files.ts:**
- Line 33: `if (mimeType === 'image/svg+xml') return false` — SVG excluded before prefix check ✅
- Line 60: `validateMagicBytes(buffer, file.type)` after arrayBuffer ✅
- Line 71: `sanitizeFilename(file.name)` for DB metadata ✅

### 5. Tests (41/41 pass) ✅

| Category | Count | Coverage |
|----------|-------|----------|
| CSP directives | 9 | base-uri, form-action, upgrade-insecure-requests, HSTS, frame-ancestors, script-src negative, object-src, default-src |
| CORS | 3 | Prod origin, no wildcard, dev origins, credentials |
| Rate limiting | 6 | cliRateLimit values, IP extraction order+split, existing limiters, credentials.ts integration |
| Magic bytes | 10 | PDF, PNG, JPEG, GIF, WebP dual-check, AVI negative, ZIP/Office, text skip, JSON skip, too-small rejection |
| Sanitization | 8 | Slashes, backslashes, null bytes, control chars, leading dots, empty fallback, Unicode fullwidth, normal preservation |
| SVG exclusion | 1 | files.ts rejects image/svg+xml |
| Integration | 3 | imports in files.ts + knowledge.ts, sanitizeFilename in knowledge.ts disk write |

Good negative assertions: WebP AVI false-positive test, no unsafe-eval/unsafe-inline in script-src, no CORS wildcard.

---

## Architecture Compliance

| Check | Status |
|-------|--------|
| E8 engine boundary | ✅ No engine/ imports in any changed file |
| lib/ layer placement | ✅ `upload-security.ts` in `lib/` (correct for shared utilities) |
| No DB migrations | ✅ Pure application-layer changes |
| createRateLimiter pattern | ✅ cliRateLimit follows existing factory pattern |
| Error response format | ✅ `{ error: { code, message, retryAfter } }` on 429 |

---

## Security Review

| Vector | Status |
|--------|--------|
| Rate limit IP spoofing | ✅ Fixed — `cf-connecting-ip` first (Cloudflare-set, non-spoofable) |
| Path traversal (knowledge.ts) | ✅ Fixed — NFKC + strip `/\..` + fallback |
| MIME type spoofing | ✅ Magic bytes validation on all binary uploads |
| SVG XSS | ✅ Excluded from files.ts MIME whitelist |
| CSP injection (base tag) | ✅ `base-uri 'self'` added |
| Form exfiltration | ✅ `form-action 'self'` added |
| HSTS downgrade | ✅ 1-year max-age + includeSubDomains (prod only) |
| No credentials in logs | ✅ No logging added, rate limiter logs nothing sensitive |

---

## Final Verdict

### ✅ APPROVE — 9.45/10

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | Well-commented code, hex values correct, clear NFR references |
| D2 완전성 | 9/10 | All 8 ACs implemented, both routes integrated, 41 tests |
| D3 정확성 | 10/10 | All values verified correct, HSTS string format, index names, magic bytes |
| D4 실행가능성 | 10/10 | This IS the implementation — clean, well-structured |
| D5 일관성 | 9/10 | Follows existing patterns, conventions match |
| D6 리스크 | 9/10 | NFKC (better than NFC), SVG exclusion, IP spoofing fix, dual-check WebP |

**Weighted**: (9×0.15)+(9×0.15)+(10×0.25)+(10×0.20)+(9×0.15)+(9×0.10) = 1.35+1.35+2.50+2.00+1.35+0.90 = **9.45**

Clean, secure, architecturally sound. Ready for commit + push.
