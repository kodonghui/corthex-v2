# Stage 1, Step 03 — Fixes Applied
**Date**: 2026-03-21
**Writer**: Amelia (dev)
**Document**: `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` Lines 540-1090

---

## Pre-Fix Scores
| Critic | Role | Score | Verdict |
|--------|------|-------|---------|
| Winston (Arch) | 7.25/10 | PASS (barely) |
| Quinn (QA/Sec) | 5.00/10 | **FAIL** |
| John (Product) | 6.95/10 | **FAIL** |
| **Average** | | **6.40/10** | **FAIL** |

**Root cause**: Step 3 was written before Step 2 fixes — systematic propagation failure.

---

## Fixes Applied (16 total)

### CRITICAL (2)

**FIX-S3-1: Gemini→Voyage AI propagation** (all 3 critics)
- L845: `dimensions: 768` → `dimensions: 1024` (Voyage AI voyage-3)
- L863: "Gemini Embedding API" → "Voyage AI API (`voyage-3`, 1024d, `voyageai` npm SDK)"
- L837: knowledge_docs note updated — "v3 migration to vector(1024)"
- L1085 carry-forward: "Gemini API failures" → "Voyage AI API failures"

**FIX-S3-2: Observations schema unified with Step 2** (all 3 critics)
- Replaced entire Step 3 schema (L838-854) with authoritative definition matching Step 2 post-fix
- Added: `confidence REAL DEFAULT 0.5`, `domain VARCHAR(50)`, `taskExecutionId` (deferred FK)
- Renamed: `source` → `domain`, `isProcessed` → `reflected`
- Added: `domainIdx`, `unreflectedIdx` indexes
- Added deferred FK note for task_executions

### HIGH (4)

**FIX-S3-3: n8n Docker compose aligned** (Quinn, John)
- L654: `N8N_HOST=localhost` → `N8N_HOST=127.0.0.1` (IPv6 bypass prevention)
- L662: `host.docker.internal` → `172.17.0.1` (Linux Docker bridge gateway)
- L666: `memory: 4G` → `memory: 2G` (Brief mandate)
- Added: `N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}` (AES-256-GCM)
- Added: `NODE_OPTIONS=--max-old-space-size=1536` (OOM prevention)

**FIX-S3-4: WS /office security + rate limiting section** (Quinn HIGH-6)
- New section added after WS data flow: 30/sec rate limit, message validation (x/y bounds, direction enum, targetAgentId), message size limit (256 bytes), per-company connection cap (50), pre-auth flooding mitigation, reconnection protocol (exp backoff + state snapshot)

**FIX-S3-5: n8n proxy timeout + circuit breaker** (John MAJOR-4)
- New section: 30s sync timeout → async fallback + polling, circuit breaker (3 failures → 60s OPEN → health check auto-close)

**FIX-S3-6: Reflection cron fixes propagated** (Quinn MEDIUM-8)
- Added advisory lock (`pg_advisory_xact_lock`) to Phase 2 reflection flow
- Added confidence-based prioritization (`confidence ≥ 0.7`)
- Added purge step (30-day TTL, batch 1000 rows)
- Added embedding backfill max retries (5) + dead letter

### MEDIUM (3)

**FIX-S3-7: Error States + Degraded Mode UX table** (John MAJOR-3)
- New section §3.7b: 8 failure modes across all 6 integrations with user-facing error messages (Korean), degraded mode behavior, and fallback content

**FIX-S3-8: EventBus map completed** (Winston)
- Added 4 missing channels: `tool`, `cost`, `argos`, `debate`

**FIX-S3-9: Neon Pro cost flagged** (John Minor-9)
- Carry-forward updated: "Neon Pro($19/mo) 필수" as budget item

### MINOR (5)

**FIX-S3-10**: Embedding backfill max retries + dead letter specified (Quinn LOW-10)
**FIX-S3-11**: WS message size "< 100 bytes" → "~100-150 bytes" (Quinn LOW-12)
**FIX-S3-12**: carry-forward WS rate limiting marked ✅ Resolved
**FIX-S3-13**: Observation lifecycle carry-forward: `is_processed` → `reflected`, batch size 50
**FIX-S3-14**: `generateEmbedding()` signature — noted in data flow context (Voyage AI API call, not direct function)

### NOT Fixed (deferred)

- **n8n proxy timeout code snippet**: Architectural pattern described, implementation detail for story dev
- **Observation poisoning (ECC §2.1)**: Architecture-level concern for Step 4
- **Solo dev Sprint 2 parallel workload**: PM-level scheduling, not tech research scope
- **n8n memory 2G vs 4G Brief amendment**: CEO decision, flagged in carry-forward

---

## Summary
- 16 fixes applied (2 CRITICAL + 4 HIGH + 3 MEDIUM + 5 MINOR)
- 4 items deferred with justification
- Root cause addressed: all Step 2 fixes now propagated into Step 3
