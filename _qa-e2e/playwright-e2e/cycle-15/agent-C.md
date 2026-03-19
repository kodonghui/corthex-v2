# Agent C — Security & Edge Cases | Cycle 15

**Date**: 2026-03-19
**Method**: curl + code analysis (no browser)

---

## Pre-Check

- **known-behaviors.md**: Reviewed 8 KB entries (KB-001 ~ KB-008). No security-related known behaviors that overlap with this cycle's checks.
- **ESCALATED.md**: 1 active escalation (ESC-001: Mobile Sidebar). Not security-related, not re-tested here.

---

## Test Results

### 1. Security Headers — `curl -I https://corthex-hq.com`

| Header | Expected | Actual | Status |
|--------|----------|--------|--------|
| `strict-transport-security` | Present, long max-age | `max-age=15552000; includeSubDomains` | PASS |
| `x-content-type-options` | nosniff | `nosniff` | PASS |
| `x-frame-options` | SAMEORIGIN or DENY | `SAMEORIGIN` | PASS |
| `x-xss-protection` | 0 (modern) or 1 | `0` | PASS |
| `content-security-policy` | Present & restrictive | Present (see below) | PASS |
| `referrer-policy` | strict or no-referrer | `no-referrer` | PASS |
| `cross-origin-resource-policy` | same-origin | `same-origin` | PASS |
| `cross-origin-opener-policy` | same-origin | `same-origin` | PASS |
| `x-dns-prefetch-control` | off | `off` | PASS |
| `x-download-options` | noopen | `noopen` | PASS |
| `x-permitted-cross-domain-policies` | none | `none` | PASS |
| `cache-control` | no-cache/no-store | `no-cache, no-store, must-revalidate` | PASS |

**Result**: 12/12 PASS

### 2. CSP Domain Verification

Full CSP:
```
default-src 'self';
script-src 'self' https://static.cloudflareinsights.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https:;
connect-src 'self' https://corthex-hq.com wss://corthex-hq.com;
font-src 'self' https://fonts.gstatic.com;
object-src 'none';
frame-ancestors 'none'
```

| Domain | Directive | Status |
|--------|-----------|--------|
| `fonts.googleapis.com` | style-src | PASS |
| `static.cloudflareinsights.com` | script-src | PASS |
| `fonts.gstatic.com` | font-src | PASS |

**Result**: 3/3 PASS

### 3. Unauthenticated API Access

```
curl -s -o /dev/null -w "%{http_code}" https://corthex-hq.com/api/admin/companies
→ 401
```

**Result**: PASS — Correctly returns 401 Unauthorized

### 4. Code Verify: Noto Serif KR (Cycle 14 Fix)

```
grep 'Noto Serif KR' packages/admin/src/index.css
→ font-family: 'Inter', 'Noto Serif KR', 'Pretendard', ...
```

**Result**: PASS — Korean font correctly set to Noto Serif KR

### 5. Code Verify: oklch accent hue 145 (Cycle 13 Fix)

```
grep 'oklch.*145' packages/admin/src/index.css
→ --color-corthex-accent: oklch(0.55 0.15 145);
→ --color-corthex-accent-dark: oklch(0.7 0.13 145);
```

**Result**: PASS — Olive accent hue at 145 degrees

### 6. Code Verify: No bg-blue / text-blue in admin TSX

```
grep 'bg-blue-\|text-blue-' packages/admin/src/**/*.tsx
→ 0 matches
```

**Result**: PASS — No hardcoded blue Tailwind classes in admin pages

---

## Summary

| # | Check | Result |
|---|-------|--------|
| 1 | Security headers (12 headers) | PASS |
| 2 | CSP domains (3 domains) | PASS |
| 3 | Unauthenticated API → 401 | PASS |
| 4 | Noto Serif KR font (Cycle 14) | PASS |
| 5 | oklch hue 145 accent (Cycle 13) | PASS |
| 6 | No bg-blue/text-blue leaks | PASS |

**Overall: 6/6 PASS — 0 bugs found**

No bugs.md file created (no bugs to report).
