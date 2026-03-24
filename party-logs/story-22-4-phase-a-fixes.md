# Story 22.4 Phase A — Fixes Applied (Retry 1)

**Date:** 2026-03-24
**Author:** dev (Writer)

---

## Issues Fixed

### From Quinn (Critic-B) — 7.25/10

| # | Severity | Issue | Fix Applied |
|---|----------|-------|-------------|
| 1 | CRITICAL | `x-forwarded-for` spoofing bypasses ALL rate limiters | Fixed IP extraction: `cf-connecting-ip` (Cloudflare, not spoofable) → `x-forwarded-for` first entry → `x-real-ip` → `'unknown'`. Applied in `createRateLimiter` (affects all rate limiters) |
| 2 | HIGH | Missing CSP `base-uri` and `form-action` | Added `baseUri: ["'self'"]` and `formAction: ["'self'"]` to AC-1, Task 1.1 |
| 3 | HIGH | SVG in `image/*` MIME whitelist | Added SVG exclusion to AC-6, Task 1.6. `image/svg+xml` explicitly rejected |
| 4 | MEDIUM | Missing `upgrade-insecure-requests` CSP | Added to AC-1 and Task 1.2 |
| 5 | LOW | Unicode normalization attacks on filename | Added NFC normalize to AC-7 and Task 5.2 sanitization rules |

### From Winston (Critic-A) — 8.40/10

| # | Severity | Issue | Fix Applied |
|---|----------|-------|-------------|
| 1 | YELLOW | Rate limit location — index.ts vs credentials.ts | Fixed Task 3.3: apply `cliRateLimit` on POST handler in `credentials.ts:58` (not index.ts) |
| 2 | YELLOW | Missing `base-uri` CSP | Same fix as Quinn #2 — already applied |
| 3 | YELLOW | WebP magic bytes needs RIFF prefix check | Fixed Task 4.2: WebP now checks both RIFF at offset 0 + WEBP at offset 8 |
| 4 | GREEN | sanitizeFilename concrete regex | Added explicit regex to Task 5.2 |

### From John (Critic-C) — 8.65/10

| # | Severity | Issue | Fix Applied |
|---|----------|-------|-------------|
| 1 | LOW | HSTS format inconsistency (object vs string) | Unified to string format in Task 1.3 |
| 2 | LOW | x-forwarded-for chain parsing | Same fix as Quinn #1 — cf-connecting-ip + split(',')[0] |
| 3 | LOW | HSTS preload not mentioned | Added Dev Notes: "HSTS preload intentionally deferred — requires hstspreload.org submission" |

---

## Summary

- **Total unique issues**: 10 (across 3 critics, with overlap on base-uri and x-forwarded-for)
- **All 10 fixed**: 1 CRITICAL, 2 HIGH, 1 MEDIUM, 6 LOW/YELLOW/GREEN
- **Key structural changes**: Rate limit IP extraction hardened (cf-connecting-ip), CSP expanded (base-uri, form-action, upgrade-insecure-requests), SVG excluded, WebP magic bytes corrected, filename sanitization includes Unicode normalization
