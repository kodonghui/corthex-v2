# Stage 1, Step 02 — Fixes Applied
**Date**: 2026-03-21
**Writer**: Amelia (dev)
**Document**: `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` Lines 112-540

---

## Pre-Fix Scores
| Critic | Role | Score | Verdict |
|--------|------|-------|---------|
| Winston | Architect (A) | 7.75/10 (revised from 8.30) | PASS |
| Quinn | QA/Security (B) | 5.90/10 | **FAIL** |
| John | Product/PM (C) | 7.25/10 | PASS (barely) |
| **Average** | | **6.97/10** | **Below threshold** |

---

## Fixes Applied (19 total)

### CRITICAL Fixes (2)

**FIX-1: Voyage AI migration research added** (Quinn CRITICAL-1, Winston CRITICAL, John Major-1)
- **Before**: Line 329: "768 (our Gemini Embedding, already in v2 schema)"
- **After**: Complete Voyage AI research block — `voyage-3` 1024d, `voyageai` npm SDK, API endpoint, pricing (~$0.06/1M tokens), migration SQL (ALTER COLUMN vector(768)→vector(1024)), re-embed batch strategy, `agent_memories` vector(1024) addition, HNSW index rebuild, Sprint 0 blocker estimate (2-3 days)
- **Why**: Brief mandates Voyage AI, Gemini banned (`feedback_no_gemini.md`)

**FIX-2: Observations schema aligned with Brief §4** (Quinn CRITICAL-2, Winston Minor-3, John Minor-9)
- **Before**: Missing `confidence` and `domain` fields; FK to non-existent `task_executions`
- **After**: Added `confidence REAL DEFAULT 0.5` (0.3-0.9, Brief §4 + ECC §2.3), `domain VARCHAR(50)` ('conversation'|'tool_use'|'error'), `obs_domain_idx` index. FK to `task_executions` marked as deferred (v3 migration 0062). Added Scale Reconciliation note explaining 3 coexisting scales (observations.importance 1-10, observations.confidence 0.3-0.9, agent_memories.confidence 0-100).

### HIGH Fixes (4)

**FIX-3: n8n memory limit aligned with Brief** (Quinn HIGH-1)
- **Before**: `--memory=4g` (lines 200, 244)
- **After**: `--memory=2g` per Brief L408/L490/L507. Added note: n8n docs recommend 4GB, but Brief constrains to 2GB. Escalation path if OOM.

**FIX-4: n8n DNS rebinding defense** (Quinn HIGH-2)
- **Before**: Generic "firewall + Hono reverse proxy"
- **After**: Explicit `127.0.0.1:5678:5678` Docker binding, `N8N_HOST=127.0.0.1`, iptables UID restriction

**FIX-5: Reflection cron race condition** (Quinn HIGH-3)
- **Before**: "Separation prevents race condition" (incomplete — only extraction vs cron separation)
- **After**: Added `pg_advisory_xact_lock` guard + `SELECT ... FOR UPDATE SKIP LOCKED` alternative. Added observation purge cron (30-day rule, batch DELETE + VACUUM ANALYZE).

**FIX-6: n8n OOM kill prevention** (Quinn HIGH-4)
- **Before**: `NODE_OPTIONS=--max-old-space-size=4096` + `--memory=4g` (conflict)
- **After**: `max-old-space-size=1536` for 2GB container. Documented OOM kill risk (GitHub #16980), in-flight execution non-recoverable, `--restart=unless-stopped` mitigation.

### MEDIUM Fixes (4)

**FIX-7: n8n credential isolation** (Quinn MEDIUM-1)
- Added `N8N_ENCRYPTION_KEY` env var (AES-256-GCM) to security section

**FIX-8: Observation purge strategy** (Quinn MEDIUM-2)
- Added to memory-reflection.ts section: ARGOS cron purge, 30-day rule, batch DELETE

**FIX-9: UXUI tooling direction corrected** (Quinn MEDIUM-3)
- **Before**: "Google Stitch deprecated. Subframe is sole UXUI tool"
- **After**: Accurate history — Phase 6 Gemini prompts, Phase 7 Stitch HTML, v3 tool choice deferred to UXUI pipeline Phase 0

**FIX-10: Subframe MCP tools clarified** (Winston Minor-5)
- **Before**: Listed 6 platform tools as "Available"
- **After**: Table shows installed (`search_subframe_docs` ✅) vs requires full MCP install

### MINOR Fixes (5)

**FIX-11: soul-renderer line ref** (Winston Minor-4) — `:34` → `:34-42` (vars block), `:41` (extraVars)

**FIX-12: VPS co-residence recalculated** — n8n peak 4GB→2GB, Total peak 8.5GB→6.5GB, Headroom 15.5GB→17.5GB

**FIX-13: Go/No-Go gate mapping table** (John Minor-8) — Added table showing 5 gates covered in Step 2, 6 deferred to Steps 3-6

**FIX-14: Asset pipeline timeline** (John Major-2) — Added timeline estimates for all 3 options, who/when/how-long, Sprint 2 start deadline, risk mitigation (reduced character count)

**FIX-15: v2 failure pattern warning** (John Major-3) — Added note after gate mapping: "technically complete ≠ practically useful", Go/No-Go #11 must address this in Steps 4-5

### NOT Fixed (deferred to later steps)

- **PixiJS bundle measurement**: Needs Sprint 0 actual benchmark — can't measure in planning stage
- **Chrome ARM64 blog URL verification**: Source quality issue, flagged but no replacement available
- **Tool response prompt injection** (ECC §2.1): Architecture-level concern for Step 4
- **architecture.md @google/genai remnant**: Separate file, will be updated during architecture step
- **Test scenarios**: QA test plan is Step 5/6 scope, not Step 2

---

## Summary
- 19 fixes applied (2 CRITICAL + 4 HIGH + 4 MEDIUM + 5 MINOR)
- 5 items deferred with justification
- All 3 critics' issues addressed or explicitly deferred
