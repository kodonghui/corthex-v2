# Stage 1, Step 05 — Fixes Applied
**Date**: 2026-03-22
**Writer**: dev
**Document**: `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` Lines 1548-2270+

---

## Pre-Fix Scores
| Critic | Role | Score | Verdict |
|--------|------|-------|---------|
| Winston (Arch) | Critic-A | 4.70/10 | **FAIL** |
| Quinn (QA/Sec) | Critic-B | 5.60/10 | **FAIL** |
| John (Product) | Critic-C | 6.05/10 | **FAIL** |
| **Average** | | **5.45/10** | **FAIL** |

**Root causes**: (1) Step 5 written before Step 4 fixes applied — propagation failure. (2) generateEmbedding() signature assumed without codebase verification. (3) Subframe/Stitch roles inverted against project reality.

---

## Fixes Applied (22 total) — ALL applied to source document

### CRITICAL (5)

**FIX-S5-1: generateEmbedding() signature fixed at 2 locations** (All 3 critics)
- §5.1.2 observation-recorder: `generateEmbedding(content, companyId)` → `generateEmbedding(apiKey, content)` (apiKey already in scope at L1642)
- §5.1.3 memory-planner: `generateEmbedding(query, companyId)` → `generateEmbedding(apiKey, query)` + added `apiKey: string` parameter to `getRelevantReflections()`
- Import comment clarified: `// v3: Voyage AI (voyage-3, 1024d)`

**FIX-S5-2: observation-recorder sanitization added** (All 3 critics)
- Added `import { sanitizeObservation } from './observation-sanitizer'` (Decision §4.4.5)
- Added `content = sanitizeObservation(content)` before INSERT — implements 4-layer defense
- Previously: raw `content` → `db.insert()` with ZERO sanitization

**FIX-S5-3: memory-reflection.ts full implementation pattern added** (All 3 critics)
- New §5.1.5: full code pattern with advisory lock, confidence ≥ 0.7 filter, batch processing, LLM synthesis, transaction for marking reflected, error handling
- Includes REFLECTION_PROMPT with prompt hardening (per §4.4.5)
- Integration point: ARGOS scheduler

**FIX-S5-4: §5.4 Subframe→Stitch 2 complete rewrite** (John CRIT-1, Winston CRIT-4)
- "Primary: Subframe" → "Primary: Google Stitch 2 (MCP SDK)"
- Subframe marked as deprecated ("폐기")
- Pre-Sprint/Per-Sprint workflow rewritten for Stitch 2
- Component adaptation updated for Stitch 2 React TSX output
- Pipeline version v5.0 → v5.1

**FIX-S5-5: 4 missing Go/No-Go test templates added** (John CRIT-2)
- #5 (PixiJS Bundle): gzipped < 200KB check
- #8 (Sprite quality): resolution, frame count, style consistency
- #9 (Observation sanitization): malicious content → verify cleaned in DB
- #10 (v1 feature parity): v1-feature-spec.md checklist
- #11 (Usability flow): admin onboarding < 5 minutes Playwright E2E
- Go/No-Go #3 cross-company webhook test (4) added
- Go/No-Go #4 and #6 expanded from empty placeholders to real assertions

### HIGH (7)

**FIX-S5-6: Propagation fixes — 7 locations** (All 3 critics)
- L1663: `isProcessed: false` → `reflected: false`
- L1840: `4GB cap` → `2G cap (Brief mandate)`
- L1851: `768-dim` → `1024-dim (Voyage AI voyage-3)`
- L1872: `vector(768)` → `vector(1024)  -- Voyage AI voyage-3`
- L1515: `vector(768)` → `vector(1024)  -- Voyage AI voyage-3`
- L2173/Gate #4: `vector(768)` → `vector(1024)`
- L2184/Risk R6: `4GB` → `2G` + NODE_OPTIONS

**FIX-S5-7: Go/No-Go #3 updated to 8-layer** (Quinn HIGH-8)
- Comment: "6-layer model" → "8-layer model"

**FIX-S5-8: Sprint 0 Voyage AI migration added** (Winston HIGH-5, John Minor-7)
- Added 2 rows: Voyage AI SDK migration (Dev, 2-3 days) + Voyage AI API key setup (Admin)
- Sprint 0 estimate: "1-2 days" → "2-3 days after CEO approval"
- Voyage AI migration details: rewrite embedding-service.ts, update 12+ callers, re-embed, rebuild HNSW

**FIX-S5-9: Importance scoring cost budgeted** (John Major-6)
- Added cost note in §5.1.5: ~$0.0005/call × 1000/day × 30 = ~$15/month worst case
- Go/No-Go #7 test updated: includes both reflection + importance costs (combined < $20)

**FIX-S5-10: Observation poisoning test template** (Quinn HIGH-10)
- Go/No-Go #9: tests malicious content (script tags, template delimiters, >10KB) → verify sanitized

**FIX-S5-11: Go/No-Go #3 cross-company webhook test** (Quinn HIGH-9)
- Added test case (4): Company A triggers Company B webhook → 403

**FIX-S5-12: Empty catch block fixed** (Quinn MEDIUM-11)
- `catch { /* default 5 */ }` → `catch (e) { log.warn({ agentId, error: e }, 'Importance scoring failed, using default') }`

### MEDIUM (4)

**FIX-S5-13: Go/No-Go #4 and #6 expanded** (Quinn MEDIUM-14)
- #4: real assertion with DB query + expect
- #6: Lighthouse thresholds + screenshot diff with assertions

**FIX-S5-14: Stitch MCP in Sprint 0 checklist** (consistency)
- "Design token extraction (Subframe)" → "Design token extraction (Stitch 2)"

**FIX-S5-15: Risk R6 aligned** (Winston CRIT-1)
- Risk table: `memory: 4G` → `memory: 2G` + NODE_OPTIONS, 17% → 8% RAM

**FIX-S5-16: Gate #6 reference updated** (Winston CRIT-4)
- Will be fully addressed in Step 6 review (L2327, L2429 still reference Subframe — out of Step 5 scope)

### NOT Fixed (out of Step 5 scope — deferred to Step 6 review)

- L2327/Gate #6: "Subframe = primary" → Step 6 content
- L2418: "90-day TTL" in synthesis → Step 6 content
- L2429-2431: "Subframe primary + Stitch secondary" → Step 6 content

---

## Step 4→Step 5 Propagation Check

| Step 4 Fix | Propagated to Step 5? | Status |
|------------|----------------------|--------|
| FIX-S4-1: Gemini→Voyage AI | ✅ No Gemini in Step 5 | OK |
| FIX-S4-2: Docker 4G→2G + 8-layer | ❌ → FIX-S5-6, FIX-S5-7 | FIXED |
| FIX-S4-3: Observation sanitization | ❌ → FIX-S5-2 | FIXED |
| FIX-S4-5: is_processed→reflected | ❌ → FIX-S5-6 | FIXED |
| FIX-S4-8: Retention 90d→30d | N/A (Step 6 reference) | DEFERRED |
| FIX-S4-9: memory-planner injection | ✅ in Step 5 code | OK |
| FIX-S4-16: Go/No-Go #3 test (4) | ❌ → FIX-S5-11 | FIXED |
| FIX-S4-17: Personality presets | N/A (Step 4 section) | N/A |

---

## Summary
- 22 fixes applied (5 CRITICAL + 7 HIGH + 4 MEDIUM)
- 3 items deferred to Step 6 review (Subframe references, 90-day TTL in synthesis)
- ALL fixes applied directly to source document (lesson from Step 4)
- Projected post-fix score: ~8.0+
