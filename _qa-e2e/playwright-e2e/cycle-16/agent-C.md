# Agent C — Security & Code Audit (Cycle 16)

**Date**: 2026-03-19
**Method**: curl + code analysis (no browser)
**Pre-check**: known-behaviors.md (8 entries), ESCALATED.md (1 active: ESC-001 mobile sidebar)

---

## 1. Security Headers — `curl -I https://corthex-hq.com`

| Header | Value | Status |
|--------|-------|--------|
| strict-transport-security | max-age=15552000; includeSubDomains | PASS |
| x-content-type-options | nosniff | PASS |
| x-frame-options | SAMEORIGIN | PASS |
| x-xss-protection | 0 | PASS (CSP-based protection preferred) |
| referrer-policy | no-referrer | PASS |
| cross-origin-resource-policy | same-origin | PASS |
| cross-origin-opener-policy | same-origin | PASS |
| content-security-policy | present (see below) | PASS |
| cache-control | no-cache, no-store, must-revalidate | PASS |
| x-dns-prefetch-control | off | PASS |
| x-download-options | noopen | PASS |
| x-permitted-cross-domain-policies | none | PASS |

**Result**: 12/12 security headers present and correctly configured.

---

## 2. CSP Directive Verification

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

| Required Domain | Directive | Status |
|-----------------|-----------|--------|
| fonts.googleapis.com | style-src | PASS |
| static.cloudflareinsights.com | script-src | PASS |
| fonts.gstatic.com | font-src | PASS |

**Result**: All 3 required external domains correctly whitelisted in appropriate CSP directives.

---

## 3. Unauthenticated Admin API Access

```
curl -s -o /dev/null -w "%{http_code}" https://corthex-hq.com/api/admin/companies
→ 401
```

**Result**: PASS — Unauthenticated request correctly rejected with 401.

---

## 4. Code Audit

### 4a. Noto Serif KR in index.css

**File**: `packages/admin/src/index.css:4`
```css
font-family: 'Inter', 'Noto Serif KR', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

**Result**: PASS — Noto Serif KR present in font-family stack.

### 4b. Accent Hue 145

**File**: `packages/admin/src/index.css:12-13`
```css
--color-corthex-accent: oklch(0.55 0.15 145);
--color-corthex-accent-dark: oklch(0.7 0.13 145);
```

**Result**: PASS — Hue 145 (olive green) correctly set for both accent variants.

### 4c. bg-blue / text-blue Usage

| Package | Occurrences | Files |
|---------|-------------|-------|
| admin | 0 | 0 |
| app | 148 | 47 |
| ui | 1 (badge.tsx info variant) | 1 |

**Admin package**: PASS — 0 occurrences. Blue references fully removed per redesign spec.

**App package**: 148 occurrences across 47 files. These are semantic UI colors for status indicators (working, info, running states) — intentional and not part of the admin Natural Organic theme audit.

---

## Summary

| Check | Result |
|-------|--------|
| Security headers (12) | PASS |
| CSP whitelisting (3 domains) | PASS |
| Unauth admin API → 401 | PASS |
| Noto Serif KR in index.css | PASS |
| Accent hue 145 | PASS |
| 0 bg-blue/text-blue in admin | PASS |

**Bugs found**: 0
**Overall**: ALL PASS — No bugs.md generated.
