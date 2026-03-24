# Critic-A Review — Story 22.4: HTTP Security Headers & Rate Limiting

**Reviewer**: Winston (Architect)
**Date**: 2026-03-24
**Phase**: A (Story Spec Review)
**Rubric**: Critic-A weights — D1=15%, D2=15%, D3=25%, D4=20%, D5=15%, D6=10%

---

## Re-Review (Post-Fix Verification)

All 4 original issues + 3 cross-talk additions **verified fixed**:

### Issue 1 ✅ — Rate limit location clarified
- Task 3.3 (line 90): "Apply `cliRateLimit` as middleware on POST handler in `credentials.ts:58` (NOT in `index.ts`)"
- Rationale documented: avoids rate-limiting GET/DELETE endpoints

### Issue 2 ✅ — CSP `base-uri` + `form-action` added
- AC-1 lines 21-23: `base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests` all present
- Task 1.1 (line 76): `baseUri: ["'self'"]` and `formAction: ["'self'"]`
- Task 1.2 (line 77): `upgradeInsecureRequests: []` — bonus addition

### Issue 3 ✅ — WebP RIFF prefix check
- Task 4.2 (line 95): "WebP (offset 0: `52 49 46 46` RIFF + offset 8: `57 45 42 50` WEBP — must check both)"
- Magic bytes table (line 176): Both offsets listed correctly

### Issue 4 ✅ — `sanitizeFilename` regex provided
- Task 5.2 (line 102): `name.normalize('NFC').replace(/[\/\\]/g, '').replace(/\.\./g, '').replace(/[\x00-\x1f]/g, '').replace(/^\.+/, '').trim() || 'upload'`
- NFC normalization addresses Unicode path traversal attacks

### Cross-talk fix 1 ✅ — Rate limit IP spoofing (Quinn critical)
- Task 3.1 (line 88): Full IP extraction chain with `cf-connecting-ip` first
- AC-5 (line 50): Explicitly specifies cf-connecting-ip and spoofing fix
- Dev Notes "Rate Limit IP Extraction — CRITICAL FIX" (lines 141-154): Complete explanation with fallback chain
- Fixes ALL three rate limiters (login, API, CLI) in one change

### Cross-talk fix 2 ✅ — HSTS string format (my Hono verification)
- Task 1.3 (line 78): `'max-age=31536000; includeSubDomains'` — string format, correct
- Dev Notes (line 131): "string format" explicitly noted
- Old object format `{ maxAge, includeSubDomains }` removed

### Cross-talk fix 3 ✅ — CSP `form-action` (Quinn)
- Covered by Issue 2 fix above

### Bonus improvements noticed:
- AC-6 line 58: SVG exclusion from MIME whitelist (`image/svg+xml` contains `<script>` — XSS vector)
- Task 1.6 line 81: SVG exclusion implementation
- Task 6.6 line 112: Rate limiter IP extraction test
- Task 6.8 line 114: Unicode normalization test for sanitizeFilename
- Task 6.9 line 115: SVG exclusion test
- Dev Notes line 139: HSTS preload deferred with clear rationale

---

## Revised 차원별 점수

| 차원 | 초기 | 수정 | 근거 |
|------|------|------|------|
| D1 구체성 | 8/10 | 9/10 | Regex provided, IP extraction code, magic bytes hex+offsets, HSTS format explicit |
| D2 완전성 | 8/10 | 9/10 | All 3 NFRs fully covered, CSP hardened (+base-uri, form-action, upgrade-insecure-requests), IP fix, SVG exclusion, Unicode normalization |
| D3 정확성 | 9/10 | 9/10 | HSTS corrected to string format, rate limit in credentials.ts, WebP dual-check, all line numbers accurate |
| D4 실행가능성 | 8/10 | 9/10 | Concrete regex, IP extraction code snippet, clear task breakdown, magic bytes table complete |
| D5 일관성 | 9/10 | 9/10 | Follows createRateLimiter pattern, secureHeaders extension compatible, error format matches |
| D6 리스크 | 8/10 | 9/10 | IP spoofing addressed, SVG XSS noted, Unicode normalization, path traversal, HSTS preload deferred |

## 가중 평균: 9.0/10 ✅ PASS

Calculation: (9×0.15)+(9×0.15)+(9×0.25)+(9×0.20)+(9×0.15)+(9×0.10) = 1.35+1.35+2.25+1.80+1.35+0.90 = **9.00**

---

## Final Verdict

### ✅ [Verified] 9.0/10 — PASS

Excellent revision. All original issues and cross-talk findings resolved. The bonus additions (SVG exclusion, upgrade-insecure-requests, Unicode normalization, HSTS preload deferral rationale) show proactive security thinking. Well-scoped, architecturally sound, ready for implementation.
