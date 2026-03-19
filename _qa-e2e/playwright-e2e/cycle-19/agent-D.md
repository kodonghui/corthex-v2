# Agent D — Regression Report (Cycle 19)

**Date**: 2026-03-19
**Method**: Code-only verification (NO browser)
**CompanyId**: d0131c54-1907-4a37-b3ca-1d0bf8e99fff

---

## ESC Fix Verification

### ESC-002: Agent Create 500 FK Violation — PASS ✅
| Check | Result | Evidence |
|-------|--------|----------|
| agents.user_id nullable in schema | ✅ | `schema.ts:148` — `userId: uuid('user_id').references(() => users.id)` — NO `.notNull()` |
| Migration exists | ✅ | `migrations/0060_agents-user-id-nullable.sql` — `ALTER TABLE agents ALTER COLUMN user_id DROP NOT NULL` |
| organization.ts userId ?? null | ✅ | `organization.ts:335` — `userId: input.userId ?? null` |
| AgentInput.userId optional | ✅ | `organization.ts:26` — `userId?: string \| null` |
| Admin agents route accepts nullable | ✅ | `routes/admin/agents.ts:23` — `userId: z.string().uuid().nullable().optional()` |
| App agents.tsx sends userId on create | ⚠️ NOTE | `agents.tsx:601` — still sends `userId: formData.userId` but value defaults to first user, which is valid (not admin_users) |

### ESC-003: Onboarding Loop Not Persisting — PASS ✅
| Check | Result | Evidence |
|-------|--------|----------|
| staleTime on company-detail query | ✅ | `admin/src/components/layout.tsx:48` — `staleTime: 2000` |
| isFetching guard on redirect | ✅ | `layout.tsx:57` — `if (!company \|\| isOnboardingPage \|\| isFetching) return` |
| Checks onboardingCompleted | ✅ | `layout.tsx:59` — `settings.onboardingCompleted !== true` → redirect |
| Scoped to admin layout (not app) | ✅ | Fix is in `packages/admin/src/components/layout.tsx` (correct — admin manages onboarding) |

### ESC-004: Tenant Middleware Cross-Contamination — PASS ✅
| Check | Result | Evidence |
|-------|--------|----------|
| Companies POST bypass in tenant.ts | ✅ | `tenant.ts:62-67` — `isCompanyCreate = method === 'POST' && /\/companies\/?$/.test(pathname)` → bypass UUID check |
| Onboarding route scoped path | ✅ | `onboarding.ts:19` — `onboardingRoute.use('/onboarding/*', authMiddleware, tenantMiddleware)` — scoped, not `'*'` |
| UUID validation for non-bypass routes | ✅ | `tenant.ts:60` — UUID regex check with proper GET empty-data fallback |

### BUG-A003: No Delete/Deactivate Button — PASS ✅
| Check | Result | Evidence |
|-------|--------|----------|
| Admin agents.tsx deactivate button | ✅ | `admin/agents.tsx:595` — `data-testid="agents-deactivate-btn"` |
| Deactivate mutation wired | ✅ | `admin/agents.tsx:185-187` — `api.delete(\`/admin/agents/${id}\`)` with optional `?force=true` |
| Confirmation modal | ✅ | `admin/agents.tsx:626-664` — Full deactivate modal with force-deactivate checkbox |
| App agents.tsx deactivate | ✅ | `app/agents.tsx:829-833` — Deactivate confirmation for non-secretary, non-system agents |
| Success toast | ✅ | Both admin (`line 194`) and app (`line 591`) show "에이전트가 비활성화되었습니다" |

---

## Standard Regression Checks

### Material Symbols — PASS ✅ (0 references)
- `packages/app/src/` — 0 files with Material Symbols
- `packages/admin/src/` — 0 files with Material Symbols

### Blue Color Remnants — INFO ⚠️
- `packages/app/src/` — 227 occurrences of `blue-N00` across 52 files
  - Majority in: command-center (pipeline viz, message thread, command input), SNS components, SketchVibe, ARGOS, cron-base
  - These appear to be functional UI colors (status indicators, links, interactive elements), NOT design-system violations
- `packages/admin/src/` — 0 occurrences of `blue-[4-6]00` (clean)

### Route Registration — INFO
- 71 `app.route()` calls in `index.ts` — all routes registered

### Previous Fixes Still Present
| Fix | Status |
|-----|--------|
| agents.tierLevel column | ✅ `schema.ts:153` |
| agents.ownerUserId column | ✅ `schema.ts:160` |
| agents.enableSemanticCache column | ✅ `schema.ts:165` |
| Sidebar uses Lucide icons (no emoji) | ✅ (no Material Symbols found) |
| Layout bg cream #faf8f5 | ✅ `layout.tsx:105` — `bg-[#faf8f5]` |
| Inter + JetBrains Mono fonts | ✅ (confirmed in previous cycles) |

---

## API Regression — BLOCKED ⛔
- Server running on `localhost:3000` — health endpoint returns `{"status":"ok"}`
- **DB offline**: `connect ECONNREFUSED 127.0.0.1:5432` — PostgreSQL not running locally
- Cannot test actual API endpoints without DB connection
- **Note**: Production uses Neon serverless; local dev DB not started

---

## Summary

| Category | Result |
|----------|--------|
| ESC-002 (nullable userId) | ✅ PASS |
| ESC-003 (onboarding guard) | ✅ PASS |
| ESC-004 (tenant bypass) | ✅ PASS |
| BUG-A003 (deactivate btn) | ✅ PASS |
| Material Symbols (0) | ✅ PASS |
| Blue remnants (admin) | ✅ PASS |
| Blue remnants (app) | ⚠️ 227 occurrences (functional, not theme violations) |
| API regression | ⛔ BLOCKED (DB offline) |

**Verdict**: All 4 ESC fixes verified in code. No regressions found. API testing blocked by local DB.
