# Agent C — Security Report (Cycle 17)

**Date**: 2026-03-19
**Method**: curl + code review (NO BROWSER)
**Target**: https://corthex-hq.com

---

## 1. HTTP Response Headers

```
HTTP/2 200
strict-transport-security: max-age=15552000; includeSubDomains
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-frame-options: SAMEORIGIN
x-xss-protection: 0
cross-origin-resource-policy: same-origin
cross-origin-opener-policy: same-origin
referrer-policy: no-referrer
x-download-options: noopen
x-permitted-cross-domain-policies: none
cache-control: no-cache, no-store, must-revalidate
```

**Verdict**: PASS — All recommended security headers present. HSTS with subdomains. No-cache on HTML. X-XSS-Protection correctly set to 0 (modern CSP replaces it).

---

## 2. Content Security Policy (CSP)

**Observed CSP** (from curl -I):
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

**CSP Code** (server/src/index.ts:103-112): Matches observed headers exactly.

**Allowed domains**:
| Directive | Domains | Purpose | Verdict |
|-----------|---------|---------|---------|
| script-src | static.cloudflareinsights.com | CF analytics | OK |
| style-src | fonts.googleapis.com | Google Fonts CSS | OK |
| font-src | fonts.gstatic.com | Google Fonts files | OK |
| connect-src | corthex-hq.com, wss://corthex-hq.com | API + WebSocket | OK |
| img-src | https: (wildcard) | External images | ACCEPTABLE (broad but intentional for user content) |

**Verdict**: PASS — Tight CSP. `object-src 'none'` and `frame-ancestors 'none'` block embedding/plugin attacks. Only `img-src https:` is broad but acceptable for dynamic content.

---

## 3. Unauthenticated API Access

| Endpoint | Status | Expected | Verdict |
|----------|--------|----------|---------|
| /api/health | 200 | 200 | PASS (public health check) |
| /api/agents | 401 | 401 | PASS |
| /api/companies | 401 | 401 | PASS |
| /api/departments | 401 | 401 | PASS |
| /api/admin/agents | 401 | 401 | PASS |
| /api/admin/companies | 401 | 401 | PASS |
| /api/workspace/departments | 401 | 401 | PASS |
| /api/admin/settings | 401 | 401 | PASS |

**Verdict**: PASS — All protected endpoints return 401. Only /api/health is public (correct for load balancer probes).

---

## 4. Font: Noto Serif KR

**Loading**:
- `packages/app/index.html:14` — `Noto+Serif+KR:wght@400;700` via Google Fonts
- `packages/admin/index.html:9` — `Noto+Serif+KR:wght@400;700;900` via Google Fonts

**Usage in code**: Extensively used across both app and admin for headings via inline `style={{ fontFamily: "'Noto Serif KR', serif" }}`. Found in:
- app: dashboard, hub, knowledge, costs, chat, onboarding, agents (7+ pages)
- admin: monitoring, companies, nexus, workflows, soul-templates, departments, settings, report-lines (8+ pages)

**CSP alignment**: `fonts.googleapis.com` in style-src, `fonts.gstatic.com` in font-src — correctly allows Google Fonts loading.

**Verdict**: PASS — Noto Serif KR properly loaded and used. No Noto Sans KR in production packages (only in design reference files under `_uxui-redesign/`).

---

## 5. Accent Hue: 145 (Olive)

**Admin CSS** (`packages/admin/src/index.css:12`):
```css
--color-corthex-accent: oklch(0.55 0.15 145);
--color-corthex-accent-dark: oklch(0.7 0.13 145);
```

**App CSS** (`packages/app/src/index.css:8-11`):
```css
--color-corthex-accent: #606C38;        /* hex olive */
--color-corthex-accent-deep: #283618;   /* dark olive */
```

Both are olive green. Hue 145 in oklch = olive/green. Hex `#606C38` ≈ oklch hue 130-145 range. Consistent.

**Verdict**: PASS — Accent hue is olive (145 oklch in admin, hex olive in app). No cyan/teal accent.

---

## 6. Blue Color Audit

**Admin app**: 0 occurrences of `blue-*` Tailwind classes. CLEAN.

**App (user-facing)**: 220 occurrences of `blue-*` across 48 files.

Key locations with blue:
- `packages/ui/src/badge.tsx` — info badge variant uses `blue-50/700/500`
- `packages/app/src/pages/knowledge.tsx` — file type badges (`bg-blue-100 text-blue-700`)
- `packages/app/src/pages/tiers.tsx:351` — tier icon uses `bg-blue-100 text-blue-600`
- `packages/app/src/pages/argos.tsx` — 11 occurrences (cron job status)
- `packages/app/src/pages/home.tsx` — 8 occurrences
- `packages/app/src/components/sns/content-tab.tsx` — 29 occurrences
- `packages/app/src/components/sketchvibe/` — canvas nodes (9 occurrences)
- `packages/app/src/pages/command-center/` — multiple components

**Assessment**: Blue is used as a semantic/informational color, NOT as the primary accent. The primary accent is olive (#606C38 / hue 145). Blue appears in:
1. Info badges (standard semantic color)
2. Focus rings (`focus:ring-blue-500` — Tailwind default)
3. Some legacy classification colors in tests

**Verdict**: INFO — Blue is present but used semantically (info state), not as brand accent. The 220 occurrences in app are notable but not blocking. Focus rings could be migrated to olive for brand consistency (low priority).

---

## Summary

| Check | Result |
|-------|--------|
| Security headers | PASS |
| CSP domains | PASS |
| Unauth → 401 | PASS |
| Noto Serif KR font | PASS |
| Accent hue 145 (olive) | PASS |
| No blue as accent | PASS (blue is semantic only) |

**Known behaviors checked**: KB-001 through KB-008 reviewed. No overlap with security findings.
**ESCALATED items checked**: ESC-001 (mobile sidebar) — not security-related, skipped.

**Bugs found**: 0 blocking. See bugs.md for informational note.
