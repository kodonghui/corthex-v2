# Agent D — Regression Report (Cycle 17)
- Date: 2026-03-19T02:30 KST
- Mode: Code verification (NO BROWSER)
- Scope: Cycle 7/12/13/14 fix persistence + blue/Material grep + API curl + route match

## Pre-Check
- known-behaviors.md: 8 entries (KB-001~008) — reviewed, no conflicts
- ESCALATED.md: 1 active (ESC-001 mobile sidebar, 5+ cycles)
- cycle-report.md: 16 cycles, 2 consecutive clean (15-16)
- stability-state.md: ACTIVE, consecutive_clean=2, last_commit=fdc671a

## Regression Verification

### Cycle 7: secureHeaders + 404 catch-all
| Check | Result | Evidence |
|-------|--------|----------|
| secureHeaders import | PASS | `packages/server/src/index.ts:3` — `import { secureHeaders } from 'hono/secure-headers'` |
| secureHeaders middleware | PASS | `index.ts:102` — `app.use('*', secureHeaders({...}))` |
| CSP directives (prod) | PASS | defaultSrc, scriptSrc, styleSrc, imgSrc, connectSrc, fontSrc, objectSrc, frameAncestors all set |
| 404 catch-all route | PASS | `App.tsx:114` — `<Route path="*" element={...404...}/>` with Korean message + home link |

### Cycle 12: CSP Google Fonts + sidebar empty state
| Check | Result | Evidence |
|-------|--------|----------|
| CSP styleSrc Google Fonts | PASS | `index.ts:106` — `styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com']` |
| CSP fontSrc gstatic | PASS | `index.ts:109` — `fontSrc: ["'self'", 'https://fonts.gstatic.com']` |
| CSP scriptSrc Cloudflare | PASS | `index.ts:105` — `scriptSrc: ["'self'", 'https://static.cloudflareinsights.com']` |
| Sidebar empty state text | PASS | `sidebar.tsx:129` — "회사 로딩중...", `sidebar.tsx:133` — "등록된 회사 없음" |

### Cycle 13: Accent hue 145
| Check | Result | Evidence |
|-------|--------|----------|
| hsl(145) in admin CSS | PASS (0 refs) | `grep hsl(145` — no matches in `packages/admin/src/` |
| Note | Hue was corrected to olive-based values | Confirmed removed |

### Cycle 14: Noto Serif KR (font-family name fix)
| Check | Result | Evidence |
|-------|--------|----------|
| index.css base font | PASS | `index.css:4` — `font-family: 'Inter', 'Noto Serif KR', 'Pretendard', ...` |
| Component usage | PASS | 30+ inline `fontFamily: "'Noto Serif KR', serif"` across monitoring, companies, nexus, workflows, soul-templates, departments, settings, report-lines |
| Stale "Noto Sans KR" | NOTE | `credentials.tsx:105` — still uses `'Noto Sans KR'` (pre-existing, noted Cycle 16, not regression) |

## Zero-Blue Verification
| Check | Result | Evidence |
|-------|--------|----------|
| `blue-[0-9]` Tailwind classes | PASS (0 refs) | grep across `packages/admin/src/` — no matches |

## Zero-Material-Symbols Verification
| Check | Result | Evidence |
|-------|--------|----------|
| Material Symbols/Icons imports | PASS (0 refs) | grep `Material.?Symbols\|material.?symbols\|Material.?Icons` — no matches |

## API Curl Verification
| Endpoint | Expected | Actual | Result |
|----------|----------|--------|--------|
| `/api/health` | 200 | 200 | PASS |
| `/api/admin/companies` (no auth) | 401 | 401 | PASS (auth guard working) |
| `/api/admin/monitoring` (no auth) | 401 | 401 | PASS (auth guard working) |

## Route Match Verification
- Server routes: 25 admin routes + 35+ workspace routes registered in `index.ts`
- Admin App.tsx: 23 page routes + 1 catch-all (404) — all lazy-loaded with Suspense
- Key routes verified present: dashboard, users, employees, departments, agents, credentials, companies, tools, costs, report-lines, soul-templates, monitoring, org-chart, nexus, org-templates, workflows, template-market, agent-marketplace, api-keys, agent-reports, mcp-servers, mcp-access, mcp-credentials, settings, onboarding
- All admin page routes have corresponding server route registrations

## Summary
| Category | Tests | Pass | Fail | Notes |
|----------|-------|------|------|-------|
| Cycle 7 fixes | 4 | 4 | 0 | secureHeaders + 404 solid |
| Cycle 12 fixes | 4 | 4 | 0 | CSP + sidebar empty state solid |
| Cycle 13 fixes | 1 | 1 | 0 | hue 145 removed |
| Cycle 14 fixes | 3 | 3 | 0 | Noto Serif KR correct (1 pre-existing Sans exception) |
| Blue refs | 1 | 1 | 0 | 0 blue Tailwind classes |
| Material Symbols | 1 | 1 | 0 | 0 Material imports |
| API endpoints | 3 | 3 | 0 | health 200, auth guard 401 |
| Route match | 1 | 1 | 0 | All admin routes covered |
| **TOTAL** | **18** | **18** | **0** | **ALL PASS** |

## Verdict: PASS — 0 regressions, 0 new bugs
- All Cycle 7/12/13/14 fixes remain intact
- No blue Tailwind classes, no Material Symbols
- API auth guards working, health endpoint responding
- Pre-existing note: credentials.tsx `Noto Sans KR` (Cycle 16 known, not regression)
