# Stage 2 Step 03 — Bob (Critic-C, Scrum Master)

**Section:** PRD lines 634–1000 (Product Scope / Vision)
**Grade:** B
**Date:** 2026-03-22

---

## Scoring (R2 — post cross-talk revision)

> R1 → R2 adjustments: D2 7→6 (Quinn: 6/12 confirmed decisions missing = systematic, Sally: CEO sidebar/Big Five frontend gaps), D6 7→6 (Quinn: external API key storage blocker, Winston: poisoning/advisory lock absent)

| Dimension | Weight | R1 | R2 | Notes |
|-----------|--------|----|----|-------|
| D1 Specificity | 15% | 8 | 8 | Phase 1–4 & Phase 5 features well-specified — file paths, SQL schemas, state tables, workflow diagrams |
| D2 Completeness | 20% | 7 | 6 | 6/12 Stage 1 confirmed decisions missing (Quinn). CEO sidebar not enumerated (Sally). Big Five frontend = 1 line, no accessibility/presets (Sally). observations TTL, reflection cost model, agent_memories.embedding migration absent |
| D3 Accuracy | 15% | 6 | 6 | VECTOR(768) factual error, reflections table contradicts Brief Option B, migration numbering wrong |
| D4 Implementability | 15% | 7 | 7 | Phase 1–4 + Features 5-1/5-2/5-3 implementable. Feature 5-4 Memory would be built on wrong architecture. External API key storage undefined but not section-blocking |
| D5 Consistency | 15% | 5 | 5 | agent-loop.ts triple contradiction, reflections vs Brief, VECTOR dimension mismatch within section, migration numbering conflict, L944 vs L935 multi-LLM timing (Quinn) |
| D6 Risk Awareness | 20% | 7 | 6 | Good isolation patterns (packages/office, n8n API-only), but missing: reflection cost ceiling, external API key storage strategy (Quinn), observation poisoning defense (Winston), advisory lock (Winston), marketing complexity risk, Voyage migration dependency |

**Weighted Score: R1 6.70 → R2 6.30/10 — FAIL**

R2 Calculation: (8×0.15)+(6×0.20)+(6×0.15)+(7×0.15)+(5×0.15)+(6×0.20) = 1.20+1.20+0.90+1.05+0.75+1.20 = 6.30

---

## Must-Fix (Critical) — 3 items

### #1: L877 VECTOR(768) — Wrong Dimension
**Lines:** L877
**Severity:** Critical (D3, D5)
**Evidence:**
- L877: `embedding VECTOR(768)` in reflections table
- L865: `embedding VECTOR(1024)` in observations table (correct)
- Confirmed-decisions #1: Voyage AI voyage-3 = 1024d
- Brief L157: "vector(768) → vector(1024)" migration required
**Impact:** observations uses 1024, reflections uses 768 = dimension mismatch. Voyage AI produces 1024d vectors; inserting into VECTOR(768) column would fail at runtime.
**Fix:** L877 `VECTOR(768)` → `VECTOR(1024)`

### #2: L850/L870-880 — Reflections Table Contradicts Brief Option B
**Lines:** L850, L870-880, L908
**Severity:** Critical (D3, D5, D4)
**Evidence:**
- PRD L850: "반성 (Reflection) — 크론으로 주기적 실행 → 관찰 요약 → `reflections` 테이블 저장"
- PRD L870-880: Creates separate `reflections` table with full schema
- Brief L153-154: "**채택 전략: Option B — 기존 확장** ... 기존 `agent_memories` 테이블: `memoryTypeEnum`에 `'reflection'`, `'observation'` 타입 추가"
- Brief L163: "반성(Reflection): ... 기존 `agent_memories` 테이블에 `memoryType: 'reflection'`으로 저장"
- Brief L165: "계획(Planning): 태스크 시작 시 `agent_memories`(reflection 타입) + pgvector 시맨틱 검색"
- Tech Research L1426: "`agent_memories` | Processed OUTPUT (permanent) | ... embedding column (0064) + HNSW index (0065)"
**Impact:** Fundamental architectural divergence. Brief explicitly chose Option B (extend existing table), PRD creates a separate table. This changes:
  - Data model (agent_memories WHERE memoryType='reflection' vs separate reflections table)
  - Query patterns (Planning step at L894 says "reflections 테이블에서 검색" — should be agent_memories)
  - Migration plan (PRD 0063=reflections table, should be 0064=agent_memories ADD COLUMN embedding)
  - Sprint 3 scope (extending existing table vs creating new one)
**Fix:** Remove entire `reflections` table schema (L870-880). Replace with: agent_memories table gets `embedding VECTOR(1024)` column + HNSW index. Reflection results stored as `memoryType: 'reflection'` in agent_memories. Update L850, L894, L908 accordingly.

### #3: agent-loop.ts Policy Triple Contradiction
**Lines:** L702, L725, L834, L918, L963
**Severity:** Critical (D5)
**Evidence:**
- L702: "기존 엔진(agent-loop.ts) **변경 없음**"
- L725: "`engine/agent-loop.ts` **수정 없음** — 실행 로그 읽기 전용"
- L963: "❌ 여전히 **건드리지 않음**: `engine/agent-loop.ts` (읽기만)"
- vs.
- L834: "`agent-loop.ts`에는 `soulEnricher.enrich()` 호출 **1행만 삽입**"
- L918: "`engine/agent-loop.ts` **최소 수정만 허용** — `soul-enricher.ts`를 호출하는 1행 훅 삽입만 허용"
**Impact:** Three locations say "no changes" / "read only", two locations say "1-line hook insertion allowed". Developer reads L702 headline → thinks untouchable → gets confused at L834/L918. L963 code boundary table is the last thing devs see before implementation.
**Fix:** Unify language. L702 → "기존 엔진 변경 최소화 — soul-enricher.ts 1행 훅만 허용". L725 → remove "수정 없음" (OpenClaw doesn't touch it anyway, no need to state). L963 → "engine/agent-loop.ts (soul-enricher 1행 훅 외 변경 금지)".

---

## Should-Fix (Major) — 4 items

### #4: Migration Numbering Conflict with Tech Research
**Lines:** L820, L884-885, L908
**Severity:** Major (D5)
**Evidence:**
- PRD: 0061=personality_traits, 0062=observations, 0063=reflections
- Tech Research L1891-1894, L2389: 0061=enum extension, 0062=observations, 0063=personality, 0064=agent_memories embedding, 0065=HNSW
**Impact:** Two authoritative documents have different migration orders. Devs following PRD will create migration files that conflict with Tech Research's plan. Enum extension (memoryTypeEnum ADD VALUE) must run BEFORE observations table because observations uses the enum.
**Fix:** Align to Tech Research order: 0061=enum, 0062=observations, 0063=personality, 0064=agent_memories embedding, 0065=HNSW. Remove reflections migration entirely per Must-Fix #2.

### #5: Missing Observations TTL/Purge Policy
**Lines:** L856-868 (observations table)
**Severity:** Major (D2, D6)
**Evidence:**
- Brief L156: "보존 정책: Reflection 처리 후 30일 이상 raw observation 자동 purge"
- Confirmed-decisions #5: "30일 (processed observations)" — Reason: Neon storage 절약
- PRD observations table: No TTL mentioned, no `reflected`/`reflected_at` columns, no purge mechanism
**Impact:** Without purge, observations grow unbounded → Neon free tier exceeded in ~4 months (confirmed-decisions rationale). Also missing `reflected` boolean (confirmed-decisions #7: renamed from `is_processed`).
**Fix:** Add `reflected BOOLEAN DEFAULT false` + `reflected_at TIMESTAMPTZ` columns to observations table. Add note: "30일 TTL — reflected=true 이후 30일 경과 시 자동 삭제 (Neon storage 절약, confirmed-decisions #5)".

### #6: Missing Reflection Cost Model
**Lines:** L887-890 (reflection cron)
**Severity:** Major (D2, D6)
**Evidence:**
- Brief L164: "비용 모델: Reflection마다 LLM API 호출 발생 ... Tier별 Reflection 한도 설정 필요 (범위: $0.10~$0.50/agent/day Haiku 기준, **PRD에서 확정**)"
- Confirmed-decisions #6: "~$17/month (reflection $1.80 + importance scoring $9 + operational $6.20)"
- PRD L889: "에이전트별 최근 20개 관찰이 쌓이면 자동 실행" — no cost ceiling, no tier limits
**Impact:** Brief explicitly delegates cost confirmation to PRD ("PRD에서 확정"). PRD doesn't address it. Unbounded reflections with Haiku calls per agent per cycle could exceed cost ceiling.
**Fix:** Add cost model: "Reflection 비용: ~$1.80/month (Haiku, 에이전트 20개 × 일 1회 기준). Tier별 한도: Free ≤ 3 agents, Pro ≤ 20 agents. 비용 상한 확인: confirmed-decisions #6."

### #7: L893-894 Planning Step References Wrong Table
**Lines:** L893-894
**Severity:** Major (D5) — cascading from Must-Fix #2
**Evidence:**
- L894: "`reflections` 테이블에서 현재 태스크 임베딩과 cosine ≥ 0.75 상위 3개 검색"
- Brief L165: "계획(Planning): 태스크 시작 시 `agent_memories`(reflection 타입) + pgvector 시맨틱 검색"
**Impact:** If Must-Fix #2 is applied (no reflections table), L894 must also change.
**Fix:** L894 → "`agent_memories` 테이블에서 `memoryType='reflection'` AND cosine ≥ 0.75 상위 3개 검색"

---

## Observations (Minor) — 3 items

### #8: Feature Numbering Reverse of Sprint Order
**Lines:** L706, L735, L813, L843 vs Sprint order
**Observation:** Features numbered 5-1(OpenClaw) → 5-4(Memory), but Sprint order is Sprint 1(Big Five=5-3) → Sprint 4(OpenClaw=5-1). Reader expects Feature N = Sprint N.
**Suggestion:** Either renumber features to match sprint order (5-1=Big Five, 5-4=OpenClaw) or add a note explaining the ordering rationale.

### #9: Marketing Automation Presets — GATE Decision, Not in Original Brief
**Lines:** L760-799
**Observation:** Marketing presets (6-step workflow, AI tool engine settings per company) are marked "GATE 2026-03-20" — authorized by GATE decision. Brief §4 Layer 2 (L140-148) describes n8n generally but doesn't detail marketing presets or per-company AI engine selection. No issue — GATE decisions augment Brief — but Architecture should confirm this scope addition.

### #10: Out of Scope Table Presents Phase 5 Items Ambiguously
**Lines:** L940-953
**Observation:** Header says "Out of Scope (Phase 1~4 전체)" but "가능 시기" column lists Phase 5 and "UXUI 재설계" for items that ARE now in Phase 5 scope (memory system L945, admin redesign L946, hub redesign L948). While technically correct (out of scope for Phase 1-4), the presentation implies these remain deferred. Consider adding a footnote: "★ = Phase 5에서 구현됨" for items now in scope.

---

## Cross-Talk Adopted Findings (R2)

### From Quinn (6.15 FAIL):
- **NEW Should-Fix #8: External API key storage (L801)** — "회사별 외부 API 키로 결제" with no storage strategy. n8n credential store? CORTHEX company_settings? Sprint 2 blocker without this decision.
- **Confirmed decisions systematic gap**: 6/12 missing from this section, not isolated omissions. Pattern: Stage 1 decisions not integrated into Product Scope.
- **L944 vs L935 multi-LLM timing**: Out of Scope says "Phase 5", Vision says "Phase 6". L944 stale after GATE additions.

### From Sally (6.60 FAIL):
- **CEO sidebar (L982-986)** not enumerated — Admin lists every page, CEO says "나머지". Devs can't estimate story points without exact page count. → D2 impact.
- **agents+departments+org merge timing (L997)** — deferred to "UX 설계 단계" but Pre-Sprint requires sidebar IA decision. No milestone. → D6 delivery risk.
- **Big Five frontend (L837)** — 1 line of spec. Discovery section has role presets, behavior tooltips, keyboard accessibility. Fragmented spec → devs must cross-reference. → D2 impact.

### From Winston (7.15 PASS):
- **soul-enricher.ts consolidation**: SRP technically violated but ordering/race prevention justifies it. Architecture should define internal structure.
- **Confirmed**: observations reflected/reflected_at missing (my Should-Fix #5). Without these, reflection cron can't identify unprocessed observations.
- **Confirmed**: Decisions #8 (poisoning) and #9 (advisory lock) absent. Initially considered NFR-scope but Quinn's systematic analysis moved these to D2/D6.

---

## Cross-Reference Verification

| Confirmed Decision | PRD Status | Notes |
|---|---|---|
| #1 Voyage AI 1024d | L865 ✅, L877 ❌ | observations correct, reflections wrong |
| #2 n8n Docker 2G | Not in this section | Discovery section |
| #3 n8n 8-layer security | Not in this section | Discovery section |
| #4 Stitch 2 | L972 ✅ | "Phase 0부터 완전 재실행" |
| #5 Observation TTL 30일 | ❌ Missing | Should-Fix #5 |
| #6 LLM Cost ~$17/month | ❌ Missing | Should-Fix #6 |
| #7 Observation Schema rename | ❌ Missing | reflected/reflected_at not in observations |
| #8 Observation Poisoning | ❌ Not mentioned | May belong in NFR section |
| #9 Advisory Lock | ❌ Not mentioned | May belong in Technical Specs |
| #10 WebSocket Limits | L726 partial ✅ | "17채널" but limits not specified here |
| #11 Go/No-Go Gates | Not in this section | Likely later section |
| #12 Docker host.docker.internal | Not in this section | Deployment detail |

---

## Strengths

1. **Phase 1–4 scope breakdown is excellent** — specific files, test types, clear deliverables per phase
2. **OpenClaw (5-1) architecture** — clean isolation via packages/office/, activity_logs read-only, independent failure domain
3. **n8n integration design** — API-only (no iframe), tag-based multitenancy, reverse proxy auth, clear policy statements
4. **Big Five (5-3)** — well-specified with OCEAN table, soul-enricher.ts single entry point, extraVars pattern
5. **Menu merge plan (14→6)** — realistic effort estimates (소/중/대), specific page groupings
6. **Code boundaries** — clear ✅/❌ tables for both Phase 1-4 and Phase 5

---

## Summary

Product Scope section has strong feature specifications and good architectural patterns (isolation, API-only, single entry point). However, **Feature 5-4 (Memory) has a fundamental architecture divergence from Brief Option B**: PRD creates a separate `reflections` table while Brief explicitly chose to extend existing `agent_memories` with memoryType enum. Combined with VECTOR(768) error, agent-loop.ts triple contradiction, and missing cost/TTL requirements, D5 (Consistency) drags the score below passing threshold.

Cross-talk revealed additional systematic issues: 6/12 Stage 1 confirmed decisions missing (Quinn), CEO sidebar not enumerated (Sally), Big Five frontend fragmented (Sally), external API key storage undefined (Quinn). R2 revised D2 7→6, D6 7→6.

**R2 Score: 6.30/10 — FAIL**
**Estimated post-fix score: 8.0+** if all 3 must-fix + 5 should-fix (original 4 + Quinn's API key) are addressed.

---

## Verified Post-Fix Score (R3 FINAL)

**16 fixes applied** — verified against PRD lines 634–1020.

### Fix Verification

| Fix | Status | Verification |
|-----|--------|-------------|
| #1 reflections table → Brief Option B | ✅ | L858 "Brief Option B", L861 agent_memories memoryType='reflection', L883-891 ALTER statements, L932 tech stack, L988 code boundaries |
| #2 VECTOR(768) eliminated | ✅ | Reflections table removed entirely. agent_memories gets VECTOR(1024) at L889 |
| #3 agent-loop.ts unified | ✅ | L989 "⚠️ 최소 수정: engine/agent-loop.ts (soul-enricher.ts 1행 훅만)". L725 retained as OpenClaw-specific (correct). L702 retained as CEO quote (acceptable) |
| #4 reflected/reflected_at | ✅ | L877-878 in observations schema |
| #5 Poisoning 4-layer defense | ✅ | L894-898 complete subsection |
| #6 TTL 30-day | ✅ | L900-902 with reflected=true condition |
| #7 Advisory lock | ✅ | L912 pg_advisory_xact_lock + confidence ≥ 0.7 |
| #8 WS limits | ✅ | L937 "50conn/company, 500/server, 10msg/s" |
| #9 Admin /office read-only | ✅ | L733-734 access model |
| #10 Big Five frontend UX | ✅ | L845-848 slider details, presets, CEO read-only |
| #11 CEO sidebar enumerated | ✅ | L1009-1014 full enumeration (6 merged groups + retained + removals + additions) |
| #12 Planning attribution | ✅ | L917 "soul-enricher.ts에서 실행" |
| #13 Tech stack table | ✅ | L932-937 observations only + agent_memories extension + enum + WS limits |
| #14 Out of Scope timing | ✅ | L970 "Phase 6 (Vision 테이블 일치)", L971 Phase 5 clarified |
| #15 Frontmatter L148 | ✅ | Verified consistent with Option B |
| #16 Observations schema aligned with Tech Research | ✅ | L870 company_id UUID FK, L872 task_execution_id, L874 domain, L875 importance, L876 confidence, L880 observed_at, L883-888 5 indexes. Resolves L913 confidence ≥ 0.7 self-reference bug |

### Remaining Issues (deferred — acceptable)

| Item | Status | Impact |
|------|--------|--------|
| Migration numbering: two 0061s (L828 personality, L905 enum) | Deferred → Architecture | D5 minor — same-document conflict, but Architecture will resolve |
| External API key storage strategy | Deferred → Architecture | D4 minor — blocker for Sprint 2 but Architecture-level decision |
| Reflection cost model full tier limits | Deferred → Step 5/12 | D2 minor — ~$1.80/mo noted, tier limits still TBD |
| agents+departments+org merge timing | Deferred → Step 10 | D6 minor — Pre-Sprint dependency |

### Post-Fix Scoring

| Dimension | Weight | R2 (pre-fix) | R3 (post-fix) | Delta | Notes |
|-----------|--------|-------------|---------------|-------|-------|
| D1 Specificity | 15% | 8 | 9 | +1 | Big Five frontend expanded (L845-848), CEO sidebar enumerated (L1009-1014), WS limits specified (L937) |
| D2 Completeness | 20% | 6 | 8 | +2 | 10/12 confirmed decisions now reflected. Poisoning, advisory lock, TTL, reflected columns all added. CEO sidebar and Big Five UX gaps closed |
| D3 Accuracy | 15% | 6 | 9 | +3 | VECTOR(768) eliminated, Brief Option B restored, Planning references corrected, Out of Scope timing fixed, observations schema aligned with Tech Research (Fix 16). -1 for two 0061s still present |
| D4 Implementability | 15% | 7 | 8 | +1 | Memory architecture now correct. Observation schema complete. Poisoning defense implementable. External API key still deferred |
| D5 Consistency | 15% | 5 | 8 | +3 | agent-loop.ts ⚠️ marker resolves contradiction. Reflections→agent_memories consistent throughout. Tech stack/boundaries/pipeline aligned. -1 for two 0061s |
| D6 Risk Awareness | 20% | 6 | 8 | +2 | Poisoning 4-layer, advisory lock, WS limits, TTL, reflection cost all added. External API key and marketing scope risk still deferred |

**R3 FINAL (16 fixes): 8.30/10 — PASS ✅**

Calculation: (9×0.15)+(8×0.20)+(9×0.15)+(8×0.15)+(8×0.15)+(8×0.20) = 1.35+1.60+1.35+1.20+1.20+1.60 = 8.30
