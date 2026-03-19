# Agent C — Security Report (Cycle 14)

**Date**: 2026-03-19
**Scope**: Security headers, CSP, auth enforcement, Cycle 13 fix verification
**Method**: curl + code analysis (no browser — contention avoidance)

---

## 1. Security Headers ✅ PASS

All critical security headers present on `https://corthex-hq.com`:

| Header | Value | Status |
|--------|-------|--------|
| X-Content-Type-Options | nosniff | ✅ |
| X-Frame-Options | SAMEORIGIN | ✅ |
| Strict-Transport-Security | max-age=15552000; includeSubDomains | ✅ |
| Referrer-Policy | no-referrer | ✅ |
| Cross-Origin-Resource-Policy | same-origin | ✅ |
| Cross-Origin-Opener-Policy | same-origin | ✅ |
| X-XSS-Protection | 0 (correct — CSP supersedes) | ✅ |
| X-DNS-Prefetch-Control | off | ✅ |
| X-Download-Options | noopen | ✅ |
| X-Permitted-Cross-Domain-Policies | none | ✅ |
| Cache-Control | no-cache, no-store, must-revalidate | ✅ |

## 2. Content Security Policy ✅ PASS

CSP header present and includes required domains:

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

**Required domains verified**:
- ✅ `fonts.googleapis.com` (style-src)
- ✅ `static.cloudflareinsights.com` (script-src)
- ✅ `fonts.gstatic.com` (font-src)

## 3. Auth Enforcement ✅ PASS

All admin API endpoints return **401 Unauthorized** without auth token:

| Endpoint | Method | Status |
|----------|--------|--------|
| /api/admin/agents | GET | 401 ✅ |
| /api/admin/departments | GET | 401 ✅ |
| /api/admin/companies | GET | 401 ✅ |
| /api/admin/tools | GET | 401 ✅ |
| /api/admin/costs | GET | 401 ✅ |
| /api/admin/credentials | GET | 401 ✅ |
| /api/admin/monitoring | GET | 401 ✅ |
| /api/admin/users | GET | 401 ✅ |
| /api/admin/api-keys | GET | 401 ✅ |
| /api/admin/settings | GET | 401 ✅ |
| /api/admin/org-chart | GET | 401 ✅ |
| /api/admin/agents | POST | 401 ✅ |
| /api/admin/agents/999 | DELETE | 401 ✅ |

**SPA shell**: `/admin/dashboard` returns 200 (HTML shell) — expected for SPA. Client-side router handles auth redirect to login. Not a security issue.

## 4. Cycle 13 Fix Verification

### Accent Hue — ✅ VERIFIED FIXED
- **Deployed CSS**: `--color-corthex-accent: #606c38`
- **Source CSS**: `oklch(0.55 0.15 145)` — oklch hue 145 (olive/green)
- **Computed HSL hue**: 74° (olive range)
- **NOT** 264 (purple). Cycle 13 fix confirmed.

### Korean Font Fallback — ⚠️ PARTIAL (see BUG-C001)
- **Source** (`index.css` line 4): `font-family: 'Inter', 'Noto Sans KR', ...` ✅
- **HTML** `<link>`: Loads `Noto Serif KR` (not Sans) from Google Fonts
- **Deployed CSS**: `body { font-family: var(--font-body) }` → resolves to `"Inter"` only
- **Issue**: Tailwind/Subframe's `--font-body: "Inter"` overrides the index.css body rule, so Korean fallback never applies. Additionally, the Google Fonts link imports `Noto Serif KR` but the CSS references `Noto Sans KR` — font name mismatch.

## 5. Bugs Found

### BUG-C001: Korean Font Fallback Not Applied (P2)
- **Source**: index.css declares `'Noto Sans KR'` in body font-family
- **Problem 1**: `--font-body: "Inter"` (from Subframe/Tailwind theme) overrides body font-family → Korean fallback chain never reached
- **Problem 2**: HTML `<link>` loads `Noto Serif KR` but CSS references `Noto Sans KR` — serif/sans mismatch
- **Impact**: Korean text renders with system fallback, not the intended `Noto Sans KR`
- **Fix**: Either configure `--font-sans` / `--font-body` to include `'Noto Sans KR'` in the theme, or fix the Google Fonts link to load `Noto Sans KR`

## 6. Summary

| Category | Result |
|----------|--------|
| Security Headers | ✅ 11/11 present |
| CSP Policy | ✅ All 3 required domains |
| Auth Enforcement | ✅ 13/13 endpoints = 401 |
| Accent Hue Fix | ✅ Verified olive (hue 74°/145 oklch) |
| Korean Font Fix | ⚠️ Partially broken (BUG-C001) |

**Overall**: Security posture is excellent. One font configuration bug found.
