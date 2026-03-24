# Critic-A Review — Story 24.6: Soul Editor Variable Autocomplete

**Reviewer:** Winston (Architect)
**Date:** 2026-03-24

---

## Files Reviewed (8/8)

| # | File | Status |
|---|------|--------|
| 1 | `packages/app/src/lib/codemirror-soul-extensions.ts` | ✅ Clean |
| 2 | `packages/server/src/routes/admin/agents.ts` | ✅ soulPreviewSchema extended |
| 3 | `packages/server/src/services/organization.ts` | ✅ previewSoul() personality override |
| 4 | `packages/app/src/components/codemirror-editor.tsx` | ✅ soulMode prop |
| 5 | `packages/app/src/pages/agents.tsx` | ❌ **BLOCKING BUG** |
| 6 | `packages/app/src/components/settings/soul-editor.tsx` | ✅ soulMode enabled |
| 7 | `packages/app/src/__tests__/codemirror-soul-extensions.test.ts` | ✅ 17 tests |
| 8 | `packages/server/src/__tests__/unit/soul-preview-personality.test.ts` | ✅ 7 tests |

---

## BLOCKING BUG: Route Mismatch — Soul Preview 404

**Location:** `packages/app/src/pages/agents.tsx:300,307`

**What:** SoulEditor calls `/workspace/agents/${agentId}/soul-preview` (resolves to `/api/workspace/agents/${agentId}/soul-preview`).

**Problem:** No such route exists. The soul-preview endpoint was registered ONLY in admin routes:
- `routes/admin/agents.ts:167` → `/api/admin/agents/:id/soul-preview`
- `routes/workspace/agents.ts` → **NO soul-preview route**

**Evidence:**
- `packages/server/src/index.ts:161` — `app.route('/api/admin', agentsRoute)` mounts admin agents at `/api/admin/agents/...`
- `packages/server/src/index.ts:185` — `app.route('/api/workspace', workspaceAgentsRoute)` mounts workspace agents at `/api/workspace/agents/...`
- `packages/app/src/lib/api.ts:3` — `API_BASE = '/api'`, so `/workspace/agents/...` → `/api/workspace/agents/...`
- Searched workspace agents.ts for "soul-preview": **0 matches**

**Impact:** The A/B personality preview button returns 404. The entire preview feature is non-functional.

**Fix:** Add `soul-preview` POST route to `routes/workspace/agents.ts` (Option A). This follows existing pattern — `packages/app` exclusively uses workspace routes, never admin routes.

---

## CodeMirror Extensions Verification

| Feature | Verified | Details |
|---------|----------|---------|
| 13 SOUL_VARIABLES | ✅ | 7 builtin + 5 personality_* + 1 relevant_memories |
| Variables match server | ✅ | 7 builtin from soul-renderer.ts L35-40, 5 personality from soul-enricher.ts, 1 memory placeholder |
| MatchDecorator highlight | ✅ | `/\{\{([^}]+)\}\}/g` regex, olive `#5a7247` color |
| Autocomplete on `{{` | ✅ | `matchBefore(/\{\{(\w*)/)`, filters by prefix |
| Category→type mapping | ✅ | builtin→keyword, personality→variable, memory→property |
| CSS injection | ✅ | `useEffect` with dedup by element ID `cm-soul-variable-css` |
| soulMode conditional | ✅ | Extensions only pushed when `soulMode={true}` |

## SoulEditor UI (agents.tsx:272-411)

| Feature | Verified | Notes |
|---------|----------|-------|
| CodeMirror with soulMode | ✅ | Line 331, lazy-loaded |
| Variable chips (click-to-insert) | ✅ | Lines 334-341, color-coded by category |
| A/B toggle checkbox | ✅ | Line 351 |
| Preset selectors (A + B) | ✅ | Lines 356-363, from PERSONALITY_PRESETS |
| Preview panes (single + dual) | ✅ | Lines 369-404, grid responsive |
| Variable display in preview | ✅ | Lines 375-383, olive-colored `{{key}}` |
| Preview API call | ❌ | **404 — wrong route path** |

## Settings SoulEditor (soul-editor.tsx)

| Check | Status |
|-------|--------|
| soulMode passed to CodeMirror | ✅ | Line 223 |
| Client-side preview (MarkdownRenderer) | ✅ | No server-side preview needed |
| Unsaved changes guard | ✅ | useBlocker + ConfirmDialog |

## E8 Boundary Compliance

| Check | Result |
|-------|--------|
| No engine/ imports in new code | ✅ |
| soul-enricher stays in services/ | ✅ |
| codemirror-soul-extensions in app/lib/ | ✅ |
| soul-preview uses previewSoul() from services/ | ✅ |

## Test Coverage (24 total)

| File | Count | Coverage |
|------|-------|----------|
| codemirror-soul-extensions.test.ts | 17 | Variable definitions, CSS, regex, exports, categories |
| soul-preview-personality.test.ts | 7 | extraVars build, template rendering, A/B comparison |
| **Missing** | 0 | No integration test calling actual soul-preview endpoint |

## Scoring (Critic-A Weights)

| Dimension | Weight | Score | Weighted | Notes |
|-----------|--------|-------|----------|-------|
| D1 Requirements | 15% | 7 | 1.05 | Feature present but preview broken |
| D2 Simplicity | 15% | 9 | 1.35 | Clean CodeMirror integration |
| D3 Accuracy | 25% | 5 | 1.25 | Route mismatch = core feature non-functional |
| D4 Implementability | 20% | 6 | 1.20 | Deploys but preview 404 |
| D5 Innovation | 15% | 8 | 1.20 | Click-to-insert chips, A/B comparison, olive theme |
| D6 Clarity | 10% | 9 | 0.90 | Well-organized, good comments |
| **Total** | | | **6.95** | |

## Verdict: ❌ FAIL (6.95 < 7.0)

### Required Fix (1 item)

1. **Add soul-preview POST route to `routes/workspace/agents.ts`** — mirror the admin route logic (call `previewSoul()` from services/organization.ts with CEO-level auth check). The frontend at `agents.tsx:300,307` calls `/workspace/agents/:id/soul-preview` but no such workspace route exists.

---

## Re-Review: Fix Applied

**Date:** 2026-03-24

### Fix Verification (workspace/agents.ts:269-303)

| Check | Status | Detail |
|-------|--------|--------|
| Route path | ✅ | POST `/agents/:id/soul-preview` → `/api/workspace/agents/:id/soul-preview` |
| Zod `.strict()` | ✅ | PER-1 Layer 2 compliant, 5 OCEAN keys int 0-100 |
| Tenant isolation | ✅ | `eq(agents.companyId, tenant.companyId)` |
| Route collision | ✅ | POST method, no collision with GET `:id` |
| previewSoul import | ✅ | Line 17, from services/organization |
| Empty soul fallback | ✅ | Returns `{ rendered: '', variables: {} }` |
| Response format | ✅ | `{ success: true, data: result }` |

### Minor Observation (non-blocking)

Soul-preview handler doesn't check `tenant.departmentIds` for department-scoped employees (unlike GET `/agents/:id` at line 184). Read-only + non-destructive + requires UUID → not a security risk.

### Re-Scoring (Critic-A Weights)

| Dimension | Weight | Score | Weighted |
|-----------|--------|-------|----------|
| D1 Requirements | 15% | 9 | 1.35 |
| D2 Simplicity | 15% | 9 | 1.35 |
| D3 Accuracy | 25% | 8 | 2.00 |
| D4 Implementability | 20% | 9 | 1.80 |
| D5 Innovation | 15% | 8 | 1.20 |
| D6 Clarity | 10% | 9 | 0.90 |
| **Total** | | | **8.60** |

## Final Verdict: ✅ PASS (8.60 ≥ 7.0)
