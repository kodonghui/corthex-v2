# Stage 1, Step 06 — Fixes Applied
**Date**: 2026-03-22
**Writer**: dev
**Document**: `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` Lines 2285-2470+

---

## Pre-Fix Scores
| Critic | Role | Score | Verdict |
|--------|------|-------|---------|
| Winston (Arch) | Critic-A | 3.80/10 | **FAIL** |
| Quinn (QA/Sec) | Critic-B | 4.30/10 | **FAIL** |
| John (Product) | Critic-C | 5.10/10 | **FAIL** |
| **Average** | | **4.40/10** | **FAIL** |

**Root cause**: Step 6 written before Steps 4-5 fixes applied — complete propagation failure across ALL sections. Worst score across all 6 steps.

---

## Fixes Applied (25 total) — ALL applied to source document

### CRITICAL (7)

**FIX-S6-1: L2300 "4GB RAM" → "2G" in Executive Summary** (All 3 critics)
- `(4GB RAM, 2 CPUs)` → `(memory: 2G, 2 CPUs, NODE_OPTIONS=--max-old-space-size=1536)`

**FIX-S6-2: Score Trend table — inflated averages corrected** (All 3 critics)
- Step 3: 8.98 → 8.73 (actual post-fix verified)
- Step 4: 9.07 → 8.57 (Winston 8.85 + Quinn 8.65 + John 8.35 / 3 = ~8.62, rounded)
- Step 5: 9.03 → 8.25 (Winston 8.50 + Quinn 7.90 + John 8.35 / 3 = ~8.25)
- Header: "(verified averages)" → "(post-fix verified averages)"

**FIX-S6-3: Subframe→Stitch 2 — 6+ locations fixed** (All 3 critics)
- Gate #6 L2327: "Subframe reference" → "Stitch 2 reference", "Subframe = primary" → "Stitch 2 = primary (MCP SDK)"
- R4 L2345: "Subframe MCP generates" → "Stitch 2 MCP generates"
- Sprint 0 L2363: "Design token extraction (Subframe)" → "(Stitch 2)"
- Domain 6 heading: "Subframe primary + Stitch secondary" → "Stitch 2 primary — Subframe deprecated"
- Domain 6 body L2429-2432: Complete rewrite — Stitch 2 primary, Subframe deprecated (폐기)

**FIX-S6-4: L2452 "Gemini pipeline" → Voyage AI** (All 3 critics)
- "Embedding generation reuses existing Gemini pipeline (Epic 10)" → "Embedding generation migrates to Voyage AI (voyage-3, 1024d) — Sprint 0 migration from banned Gemini"

**FIX-S6-5: Go/No-Go matrix 8→11 gates** (All 3 critics)
- Section title: "(8 Gates)" → "(11 Gates)"
- Added Gate #9 (Observation Sanitization): malicious content inject → verify sanitized, 4-layer defense §4.4.5
- Added Gate #10 (v1 Feature Parity): v1-feature-spec.md checklist, all sprints
- Added Gate #11 (Usability Flow): Admin onboarding < 5 min, Playwright E2E
- Summary: "6/8 gates" → "7/11 gates"

**FIX-S6-6: Cost model completely rewritten** (All 3 critics)
- LLM cost: "< $5/month" → "~$17/month (reflections $1.80 + importance $15)"
- Operational: "~$21/month" → "~$36/month (LLM $17 + Neon Pro $19)"
- Scenario.gg: "$30 one-time" → "$15-99/mo × 2 months, pricing TBD"
- Added note: WebSearch suggests $45-99 actual vs $15 listed

**FIX-S6-7: "Carry-Forward: NONE" → 5 documented carry-forwards** (All 3 critics)
- Scenario.gg pricing verification
- Advisory lock vs Neon serverless compatibility
- sanitizeObservation() ordering (raw content to LLM before sanitization)
- Embedding concurrency control (no semaphore/queue)
- Go/No-Go #10 v1 parity checklist mapping

### HIGH (8)

**FIX-S6-8: L2405 "4GB RAM limit" → "2G" in Domain 2 recommendation** (Winston CRIT-1, John Major-5)
- "R6 — 4GB RAM limit" → "R6 — memory: 2G, NODE_OPTIONS=--max-old-space-size=1536"

**FIX-S6-9: L2404 "6-layer" → "8-layer" in Domain 2** (All 3 critics)
- Added full 8-layer enumeration in parentheses

**FIX-S6-10: L2418 "90-day TTL" → "30-day TTL" in Domain 4** (All 3 critics)
- Added "per Brief §4 CEO signoff"
- Added importance scoring cost ($15/mo)
- Added batch parameters (confidence ≥ 0.7, MAX_BATCH=50)

**FIX-S6-11: Sprint 0 expanded — Voyage AI + CEO approval** (All 3 critics)
- Estimate: "1-2 days" → "2-3 days after CEO approval"
- Added 3 rows: Voyage AI SDK migration (Dev, 2-3 days), Voyage AI API key (Admin), Advisory lock test
- Neon Pro: added "CEO budget approval required"

**FIX-S6-12: Risk registry expanded — R10 + R11 added** (Quinn, Winston)
- R10: Observation poisoning — 4-layer defense (§4.4.5)
- R11: Advisory lock/Neon serverless — fallback: FOR UPDATE SKIP LOCKED
- Risk summary: "2 residual medium" → "4 residual medium"

**FIX-S6-13: Architecture readiness checklist updated** (John Minor-13)
- "All 8 Go/No-Go gates" → "All 11 Go/No-Go gates (Brief §4 MVP Success Criteria)"
- Cost model checkbox: ✅ → ❌ (needs CEO review: ~$36/mo + ~$17/mo LLM)

**FIX-S6-14: Sprint execution Go/No-Go gate mapping updated** (consistency)
- Sprint 1: added #10 (partial)
- Sprint 2: added #10 (partial)
- Sprint 3: added #9, #10 (partial)
- Sprint 4: added #10 (final), #11

**FIX-S6-15: Gate #7 reflection cost updated** (Quinn LOW)
- "$1.80/month" → "$1.80/month + importance scoring ~$15/month. Combined < $20/month"

### MEDIUM (5)

**FIX-S6-16: Migration 0061 description corrected** (Quinn LOW)
- "enum IF NOT EXISTS" → "enum ADD VALUE IF NOT EXISTS"
- Gate #1: "IF NOT EXISTS" → "ADD VALUE IF NOT EXISTS"

**FIX-S6-17: Migration safety §6.6 #3 — ALTER TYPE acknowledged** (Quinn LOW)
- "No ALTER TYPE" → "0061 uses ALTER TYPE (enum ADD VALUE), but safe — only adds, never removes"

**FIX-S6-18: Closing line updated** (consistency)
- "All 6 steps delivered. Ready for Stage 2" → "All 6 steps delivered. 11 Go/No-Go gates mapped, 11 risks registered, 5 carry-forwards documented. Ready for Stage 2"

**FIX-S6-19: Domain 4 embedding migration dependency noted** (Winston MED-11)
- Added confidence field to Domain 4 key pattern description

**FIX-S6-20: R6 internal contradiction resolved** (Winston MED-13)
- Executive summary now says 2G (matches risk table)
- Domain 2 now says 2G (matches risk table)

### LOW (5)

**FIX-S6-21: Gate #1 — no ALTER/DROP clarified** (accuracy)
- "No ALTER/DROP on existing columns" preserved (true — 0061 ADD VALUE is on enum type, not column)

**FIX-S6-22: Scenario.gg pricing flagged as carry-forward** (Winston HIGH-10)
- $15 vs $45-99 discrepancy documented in carry-forwards

**FIX-S6-23: sanitizeObservation ordering documented** (Quinn non-blocking)
- Architecture must decide: sanitize before importance scoring (safer) or accept LLM exposure

**FIX-S6-24: Embedding concurrency documented** (Winston HIGH-10)
- No semaphore/queue for Voyage AI calls — architecture should define pattern

**FIX-S6-25: Gate #9 sanitization test details added** (Quinn)
- Specific test: inject `<script>`, `{{}}`, >10KB → verify sanitized in DB

---

## Step 5→Step 6 Propagation Check

| Step 5 Fix | Propagated to Step 6? | Status |
|------------|----------------------|--------|
| FIX-S5-1: generateEmbedding signature | N/A (no code in Step 6) | N/A |
| FIX-S5-2: sanitizeObservation | ❌ → FIX-S6-12 (R10 risk) + FIX-S6-5 (Gate #9) | FIXED |
| FIX-S5-3: memory-reflection code | N/A (no code in Step 6) | N/A |
| FIX-S5-4: Stitch 2 primary | ❌ → FIX-S6-3 (6+ locations) | FIXED |
| FIX-S5-5: 11 Go/No-Go tests | ❌ → FIX-S6-5 (matrix 8→11) | FIXED |
| FIX-S5-6: Propagation (reflected, 2G, 1024d) | ❌ → FIX-S6-1, FIX-S6-8, FIX-S6-20 | FIXED |
| FIX-S5-7: 8-layer model | ❌ → FIX-S6-9 | FIXED |
| FIX-S5-8: Sprint 0 Voyage AI | ❌ → FIX-S6-11 | FIXED |
| FIX-S5-9: Importance scoring cost | ❌ → FIX-S6-6, FIX-S6-15 | FIXED |
| FIX-S5-10: Observation poisoning test | ❌ → FIX-S6-5 (Gate #9) | FIXED |
| FIX-S5-11: Cross-company webhook | ✅ Gate #3 already has test case (4) | OK |
| FIX-S5-12: Empty catch block | N/A (no code in Step 6) | N/A |

---

## Summary
- 25 fixes applied (7 CRITICAL + 8 HIGH + 5 MEDIUM + 5 LOW)
- ALL fixes applied directly to source document
- 5 carry-forwards documented for Architecture stage
- Propagation check: 8 of 9 applicable Step 5 fixes were NOT propagated → all FIXED
- Projected post-fix score: ~8.0+
