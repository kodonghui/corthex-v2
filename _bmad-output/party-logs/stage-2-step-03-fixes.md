# Stage 2 Step 03 — Vision / Product Scope Fixes Applied

**Writer:** john
**Date:** 2026-03-22
**Section:** PRD lines 634–1000 (## Product Scope)
**Pre-fix scores:** Winston 7.15, Quinn 6.15 (FAIL), Sally 6.60 (FAIL), Bob 6.70 (FAIL) — Avg 6.65

---

## Fixes Applied (16 total)

### CRITICAL (3)

**Fix 1: reflections table removed — Brief Option B compliance**
- PRD incorrectly created separate `reflections` table
- Brief L153: "Option B — 기존 확장 (대체·병렬 아님)"
- Brief L163: "기존 agent_memories 테이블에 memoryType: 'reflection'으로 저장"
- **Changed**: Entire Feature 5-4 rewritten:
  - Removed `CREATE TABLE reflections` entirely
  - Reflections → `agent_memories` with `memoryType='reflection'`
  - Added `ALTER TABLE agent_memories ADD COLUMN embedding VECTOR(1024)`
  - Updated all references (pipeline description, planning step, tech stack table, code boundaries, frontmatter L148)
- **Impact**: Fixes VECTOR(768) bug automatically (no separate reflections table = no stale dimension)
- **Source:** Bob CRITICAL #2 (confirmed via Brief L153-154, L163, L418-422, L443)

**Fix 2: VECTOR(768) → eliminated by Fix 1**
- L877 had stale `VECTOR(768)` in reflections table
- Fix 1 removed the entire table → issue eliminated
- agent_memories gets new `embedding VECTOR(1024)` column
- **Source:** ALL 4 critics

**Fix 3: agent-loop.ts boundary contradiction resolved**
- L963 said "(읽기만)" while L918 said "최소 수정만 허용 (1행 훅)"
- L725 said "수정 없음" — these are Phase 1 descriptions (correct for Phase 1)
- **Changed**: L963 → "⚠️ 최소 수정: engine/agent-loop.ts (soul-enricher.ts 1행 훅만)"
- **Source:** ALL 4 critics

### MAJOR (9)

**Fix 4: observations schema — added reflected/reflected_at (Decision #7)**
- Added `reflected BOOLEAN DEFAULT false` and `reflected_at TIMESTAMPTZ`
- **Source:** Winston H1, Quinn #3, Bob #5

**Fix 5: Observation poisoning 4-layer defense added (Decision #8)**
- Added complete subsection: max 10KB, control char strip, prompt hardening, content classification
- **Source:** Quinn #4

**Fix 6: 30-day TTL added to Feature 5-4 (Decision #5)**
- Added: processed observations (reflected=true) → 30-day auto-delete
- **Source:** Quinn #5, Winston H3, Bob #5

**Fix 7: Advisory lock added to reflection cron (Decision #9)**
- Added: `pg_advisory_xact_lock(hashtext(companyId))`
- Also added confidence-based prioritization (≥0.7)
- **Source:** Quinn #6, Winston H3

**Fix 8: /ws/office connection limits added (Decision #10)**
- Added to Feature 5-1: 50/company, 500/server, 10 msg/s per userId
- Also added to tech stack table
- **Source:** Quinn #7

**Fix 9: Feature 5-1 Admin /office read-only access added**
- Added access model: CEO = full canvas + task commands, Admin = read-only
- Consistent with Discovery Journey D
- **Source:** Sally #3

**Fix 10: Big Five frontend UX expanded**
- Added: slider details (keyboard, aria-valuenow, tooltips), role presets dropdown, CEO read-only
- **Source:** Sally #4

**Fix 11: CEO sidebar enumerated**
- Changed from "기존 페이지 중 합치기 대상 제외한 나머지" to full enumeration
- Lists 6 merged groups + retained pages + removals + additions
- **Source:** Sally #6

**Fix 12: Planning stage attribution fixed**
- L893: "agent-loop.ts에서 실행" → "soul-enricher.ts에서 실행"
- **Source:** Winston M1, Quinn #12

### MAJOR (post-verification addition: 1)

**Fix 16: observations schema aligned with Tech Research (Quinn #10)**
- PRD observations table was missing 5 fields + 4 indexes vs Tech Research authoritative schema
- **Added fields**: `task_execution_id UUID` (FK deferred), `domain VARCHAR(50)` ('conversation'|'tool_use'|'error'), `importance INTEGER` (1-10 Park et al.), `confidence REAL` (0.3-0.9), `observed_at TIMESTAMPTZ`
- **Removed fields**: `session_id` (replaced by task_execution_id), `outcome` (not in Tech Research), `tool_used` (not in Tech Research)
- **Fixed**: `company_id VARCHAR` → `company_id UUID REFERENCES companies(id)` (matches Tech Research FK pattern)
- **Added 5 indexes**: obs_company_idx, obs_agent_idx, obs_unreflected_idx (partial), obs_domain_idx, obs_embedding_idx (HNSW)
- **Self-contradiction resolved**: L913 referenced `confidence ≥ 0.7` but observations table had no confidence column
- **Source:** Quinn #10 (cross-talk), Tech Research L357-374 + L850-873

### MINOR (3)

**Fix 13: Tech stack table updated**
- Removed "reflections" from DB table row
- Added agent_memories.embedding VECTOR(1024) to column row
- Added memoryTypeEnum extension row
- Added /ws/office limits row
- **Source:** All critics (cascading from Fix 1)

**Fix 14: Out of Scope timing fixed**
- Multi-LLM: "Phase 5" → "Phase 6" (matches Vision table)
- Memory: clarified Phase 5 adds 3-stage, full redesign is Phase 6+
- **Source:** Quinn #10

**Fix 15: Frontmatter L148 corrected**
- "observations/reflections 신규 2테이블" → "observations 신규 1테이블 + agent_memories 확장"
- **Source:** Bob #2 (cascading)

---

## NOT Fixed (deferred or out of scope for this section)

| Item | Reason | Deferred to |
|------|--------|-------------|
| External API key storage strategy | Architecture decision | Architecture Stage |
| Migration numbering (0061 conflict) | Architecture decision | Architecture Stage |
| Feature UX empty/loading/error states | UX Design stage detail | UX Design artifact |
| Reflection cost model confirmation | Brief says "PRD에서 확정" but needs business decision | Step 5 Success or Step 12 NFR |
| Go/No-Go gate count 8→11 | Not in Product Scope section | Step 5 or Step 10 |
| N8N_DISABLE_UI security discussion | Architecture/Security concern | Architecture Stage |
| agents+departments+org merge timing | Step 10 Scoping | Step 10 |

---

## Confirmed Decisions Coverage (12 total)

| # | Decision | Status |
|---|----------|--------|
| 1 | Embedding Voyage AI 1024d | ✅ Pre-sweep |
| 2 | n8n Docker 2G | ✅ Pre-sweep |
| 3 | n8n 8-layer security | ✅ Step 2 fix |
| 4 | Stitch 2 | ✅ Pre-sweep |
| 5 | Observation 30-day TTL | ✅ **Fix 6** |
| 6 | LLM Cost ~$17/mo | ✅ Fix 1 (reflection cron cost noted) |
| 7 | Observation reflected/reflected_at | ✅ **Fix 4** |
| 8 | Poisoning 4-layer defense | ✅ **Fix 5** |
| 9 | Advisory lock | ✅ **Fix 7** |
| 10 | WebSocket limits | ✅ **Fix 8** |
| 11 | Go/No-Go 8→11 | ⏳ Deferred (not in this section) |
| 12 | Docker host.docker.internal | ⏳ Architecture |
