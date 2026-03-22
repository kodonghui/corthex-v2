# Stage 2 Step 07 — Quinn (Critic-B) Review: Domain-Specific Requirements

**Critic:** Quinn (QA + Security)
**Date:** 2026-03-22
**Section:** PRD lines 1352–1537 (## Domain-Specific Requirements)
**Grade:** B reverify
**Cycle:** 2 (R2 post-fix)

---

## Rubric (Critic-B Weights)

| Dimension | Weight | Score | Weighted |
|-----------|--------|-------|----------|
| D1 Specificity | 10% | 7.5 | 0.75 |
| D2 Completeness | 25% | 6.0 | 1.50 |
| D3 Accuracy | 15% | 5.5 | 0.825 |
| D4 Implementability | 10% | 7.0 | 0.70 |
| D5 Consistency | 15% | 5.5 | 0.825 |
| D6 Risk | 25% | 5.5 | 1.375 |
| **Total** | **100%** | | **5.975 ≈ 6.00** |

**Verdict: ❌ FAIL (< 7.0)**

---

## Strengths

1. **Well-structured ID system** — 75 requirements across 14 categories with consistent ID prefixes (SEC, SDK, DB, ORC, SOUL, OPS, NLM, VEC, N8N-SEC, PER, MEM, PIX, MKT, NRT)
2. **v3 categories comprehensive** — 6 new v3 categories (N8N-SEC, PER, MEM, PIX, MKT, NRT) covering all 4 Sprints
3. **PER-1 4-layer sanitization** — Excellent detail for personality_traits prompt injection defense (R7, Go/No-Go #2)
4. **MKT-1 JSONB race warning** — Proactively flags known Deferred Item (JSONB read-modify-write race)
5. **Summary table** — Phase/Sprint distribution at a glance, 75 total count
6. **PIX-5 failure isolation** — packages/office independent, /office failure doesn't affect Hub/Chat/NEXUS

---

## Issues (9 total: 1C + 4M + 4m)

### CRITICAL (1)

**C1: N8N-SEC-5 L1459 "memory: 4G" — Direct Brief 2G mandate violation**
- L1459: `memory: 4G, cpus: '2'`
- Confirmed decision #2: `--memory=2g`, `NODE_OPTIONS=--max-old-space-size=1536`
- Brief mandate: 2G cap
- Exec Summary R6: "2G RAM cap"
- Success Criteria L549: "2G 한도 유지, Brief 필수, 4G=OOM 확정"
- Risk Registry R6: "Docker compose: memory: 2G"
- This was the SAME issue fixed in Step 5 (Quinn M1, L549 "4G→6G" correction). The 4G value keeps recurring in different sections.
- Also missing: `NODE_OPTIONS=--max-old-space-size=1536` (confirmed decision #2)
- **Impact**: Developer reads N8N-SEC-5 → sets 4G → OOM on VPS (24GB shared with server + DB)
- **Fix**: L1459 → `memory: 2G, cpus: '2', NODE_OPTIONS=--max-old-space-size=1536. OOM 시 자동 재시작 (restart: unless-stopped). Brief 필수 (4G=OOM 확정)`

### MAJOR (4)

**M1: Missing MEM-6 — Observation content sanitization (Go/No-Go #9, confirmed decision #8)**
- MEM-1~5 cover: Zero Regression, Tier limits, cron isolation, deletion permissions, audit log
- BUT: No requirement for observation content poisoning defense (R10 🟠 High)
- Go/No-Go #9 requires "4-layer sanitization E2E: max 10KB + control char strip + prompt hardening + content classification"
- This defense is in: Exec Summary R10 (Step 4), Success Criteria L602 (Step 5), Journey 10 error scenario 2 (Step 6)
- But NOT in Domain Requirements — the section that defines "what must be built"
- PER-1 has its own 4-layer for personality_traits (R7) — these are DIFFERENT sanitization chains
- **Fix**: Add MEM-6: `Observation 4-layer 콘텐츠 방어 | (1) max 10KB 크기 제한 (2) 제어문자/유니코드 공격 제거 (3) 프롬프트 인젝션 패턴 하드닝 거부 (4) 콘텐츠 분류 모델 악성 판정 → 차단 + Admin 알림. Go/No-Go #9, R10 | Sprint 3`

**M2: Missing WebSocket connection limits (confirmed decision #10)**
- NRT-1~4 cover: state model, heartbeat, broadcast, delay
- BUT: No requirement for connection limits: 50 conn/company, 500/server, 10msg/s rate limit
- Confirmed decision #10, R15, Journey 9 L1264 (Step 6 Fix 5)
- **Fix**: Add NRT-5: `WebSocket 연결 제한 | /ws/office + /ws/agent-status: 50 conn/company, 500 conn/server, 10 msg/s rate limit (token bucket). 초과 시 oldest 연결 해제 + 클라이언트 재연결 안내. (confirmed decision #10, R15) | Sprint 4`

**M3: Missing Reflection trigger full specification in MEM**
- MEM-2 L1478: "Tier 1-2: 무제한. Tier 3-4: 주 1회. Haiku ≤ $0.10/day 비용 게이트"
- Missing the AND condition established in Success Criteria L597: "daily cron + reflected=false ≥ 20 + confidence ≥ 0.7"
- Also missing: cost ceiling auto-pause mechanism (ECC 2.2, Go/No-Go #7)
- This trigger was the #1 cross-section consistency issue in Steps 5-6
- **Fix**: MEM-2 update → "Tier 1-2(Sonnet/Opus): 일 1회 크론 + reflected=false ≥ 20 AND 조건. Tier 3-4(Haiku): 주 1회 + 동일 AND 조건. confidence ≥ 0.7 필터. Haiku ≤ $0.10/day 비용 게이트. 비용 초과 시 크론 자동 일시 중지 (ECC 2.2, Go/No-Go #7)"

**M4: Missing Observation 30-day TTL (confirmed decision #5)**
- MEM-1~5: No TTL requirement for observations
- Confirmed decision #5: "30일 processed observations TTL"
- Journey 10 L1282 (Step 6 Fix 1): "30일 TTL 적용"
- Exec Summary doesn't have this either (deferred to Product Scope in Step 4 fixes)
- **Fix**: Add MEM-7: `Observation 30일 TTL | reflected=true 관찰 30일 경과 시 자동 아카이브/삭제. 보존 정책: Admin 설정으로 중요 관찰 보호 가능. Neon storage 최적화 (confirmed decision #5) | Sprint 3`

### MINOR (4)

**m1: VEC-1 L1444 chunk size "2,048 토큰" — possible Gemini leftover**
- VEC-1: "2,048 토큰 이상 시 자동 분할 (Voyage AI Embedding 제한)"
- Voyage AI voyage-3 supports up to ~32,000 tokens input (much larger than Gemini's 2,048)
- The 2,048 limit was correct for Gemini text-embedding-004 but may be unnecessarily conservative for Voyage AI
- This is a minor issue because 2,048 is still a valid chunk size choice (smaller chunks = better retrieval precision). But the parenthetical "(Voyage AI Embedding 제한)" is inaccurate — it's not a Voyage AI limitation
- **Fix**: "(Voyage AI Embedding 제한)" → "(검색 정밀도 최적화 — Voyage AI 최대 ~32K 토큰이지만 2,048이 retrieval 정확도 최적)"

**m2: DB-3 L1393 Phase 4 timing overlap with Pre-Sprint Voyage migration**
- DB-3: "기존 문서 벡터화 배치 마이그레이션 (embedding NULL → 채우기) Phase 4"
- Pre-Sprint Voyage AI migration re-embeds ALL documents (768→1024d), including any NULL ones
- After Pre-Sprint migration completes (Go/No-Go #10 verification: `WHERE embedding IS NULL = 0`), DB-3 is redundant
- **Fix**: Add note: "Pre-Sprint Voyage AI 마이그레이션 후 NULL 잔여분만 대상. Go/No-Go #10 통과 시 이 요구사항 범위 축소"

**m3: MEM-5 L1481 "Planning 적용 감사 로그" — vague given Planning is retrieval-only**
- MEM-5: "Planning이 에이전트 행동에 적용될 때 activity_logs에 기록"
- Product Scope L896: Planning = read-time semantic search → Soul injection (not stored artifacts)
- Journey 10 (Step 6 Fix 1): "read-time semantic search, agent_memories Option B"
- "Planning이 적용될 때" is vague — when exactly does the log fire? At messages.create() call? At Soul rendering?
- **Fix**: "Reflection 결과가 semantic search로 Soul에 주입될 때(messages.create 직전) activity_logs에 기록: 주입된 memory_id, agent_id, relevance score"

**m4: Summary table total verification — VEC Phase assignment**
- L1524: VEC = Phase 4 (4 items)
- VEC-1 references "Voyage AI Embedding 제한" — Voyage AI is available from Pre-Sprint onwards
- The VEC requirements define search behavior (Phase 4 library), but VEC-1's chunk splitting applies during any embedding operation (including Pre-Sprint migration)
- Minor: VEC-1 should note "Pre-Sprint부터 적용 (마이그레이션 시 + Phase 4 신규 문서)"

---

## Confirmed Decisions Coverage (Domain Requirements)

| # | Decision | Domain Req | Status |
|---|----------|-----------|--------|
| 1 | Voyage AI 1024d | VEC-1 references Voyage AI (chunk size) | ⚠️ PARTIAL (chunk size may be wrong) |
| 2 | n8n Docker 2G | ❌ N8N-SEC-5 says 4G | **VIOLATION** |
| 3 | n8n 8-layer security | ✅ N8N-SEC-1~6 covers 6 layers | ⚠️ PARTIAL (6 not 8) |
| 4 | Stitch 2 | N/A (tooling) | OK |
| 5 | 30-day TTL | ❌ Not in MEM | **MISSING** |
| 6 | LLM $17/mo cost | MEM-2 mentions $0.10/day Haiku gate | ⚠️ PARTIAL |
| 7 | reflected/reflected_at | N/A (schema detail) | OK |
| 8 | Observation poisoning | ❌ Not in MEM | **MISSING** |
| 9 | Advisory lock | ❌ Not in MEM | **MISSING** |
| 10 | WebSocket limits | ❌ Not in NRT | **MISSING** |
| 11 | Go/No-Go 14 gates | Various refs | ⚠️ PARTIAL |
| 12 | host.docker.internal | N/A (infra) | OK |

**Coverage: 1 violation + 4 missing + 4 partial = 3/12 fully covered — FAIL**

---

## Pattern Analysis

**Same propagation failure (Steps 4→5→6→7):** Confirmed decisions and cross-section requirements established in Exec Summary, Success Criteria, and User Journeys do not propagate to Domain Requirements. The pattern continues:
- Step 4: Confirmed decisions missing from Exec Summary → 11 fixes
- Step 5: Exec Summary gates missing from Success Criteria → 12 fixes
- Step 6: Confirmed decisions missing from User Journeys → 10 fixes
- Step 7: Observation poisoning, WebSocket limits, TTL, Reflection trigger missing from Domain Requirements

**N8N-SEC-5 "4G" recurrence:** This exact value was wrong in Step 5 (L549 "4G→6G") and now appears again as "4G" in the Domain Requirements. The Brief 2G mandate keeps getting violated in new sections despite being fixed in previous ones.

---

## Score Rationale

- **D1 (7.5)**: Good ID structure and Phase assignments. Some missing verification methods and vague descriptions (MEM-5).
- **D2 (6.0→5.5)**: 75 requirements is substantial, but 4 major gaps: observation poisoning defense, WebSocket limits, TTL, Reflection trigger full spec. Cross-talk adds: N8N-SEC 8→6 layer completeness gap (Bob #5, Sally #3).
- **D3 (5.5→5.0)**: N8N-SEC-5 "4G" is a direct factual error. VEC-1 chunk size parenthetical inaccurate. Cross-talk: MEM-4 "Planning 삭제" is accuracy error (not just vagueness) — Planning is read-time, no entity to delete (Bob #4, Sally #2).
- **D4 (7.0)**: Good implementability with IDs and Phase assignments. DB-3 timing overlap. MEM-5 vague.
- **D5 (5.5→5.0)**: N8N-SEC-5 contradicts Exec Summary, Success Criteria, Brief. Missing requirements established in other sections. Cross-talk: MEM-4/5 "Planning" entity contradicts Product Scope L896 + Step 6 Fix 1 corrections. ORC-6 ↔ SOUL-5 duplicate definition (Sally #6).
- **D6 (5.5)**: Missing observation poisoning domain requirement (highest memory security risk). Missing WebSocket limits. Missing TTL.

---

## Cross-Talk Findings (All 4 Critics Complete)

**Scores: Quinn 5.70 FAIL, Sally 6.25 FAIL, Winston 6.30 FAIL (revised from 7.15), Bob 6.45 FAIL**
**4/4 unanimous FAIL. Avg: 6.18**

### Severity Upgrades (2)

**m3 → M5: MEM-4/MEM-5 "Planning" entity confusion (Bob #4 MAJOR, Sally #2 MAJOR)**
- My original m3 flagged MEM-5 as "vague". Bob and Sally correctly escalate: this isn't vagueness — it's a logical impossibility.
- MEM-4: "Admin만 Reflection/**Planning** 삭제 가능" — Planning is a read-time cosine similarity lookup (Product Scope L957-960, soul-enricher.ts). There is no "Planning" record to delete.
- MEM-5: "**Planning**이 에이전트 행동에 적용될 때" — same entity confusion
- Step 6 Fix 1 explicitly removed all Planning-as-entity language from User Journeys. Domain Requirements perpetuate the corrected misconception.
- **Fix**: MEM-4 → "Admin만 Reflection/Observation 삭제 가능. CEO는 읽기만." / MEM-5 → "Reflection이 soul-enricher.ts에서 Soul에 주입될 때 activity_logs에 기록 (memory_id, agent_id, relevance score)"

**m4 → M6: N8N-SEC missing layers — 6 of 8 confirmed (Bob #5 MAJOR, Sally #3 MAJOR)**
- My original m4 noted "6 not 8" in summary. Bob and Sally detail the missing layers:
  - Bob: Missing N8N_ENCRYPTION_KEY AES-256-GCM + rate limiting (2 layers)
  - Sally: Missing API key header injection + rate limiting + N8N_ENCRYPTION_KEY + NODE_OPTIONS (4 layers)
- Confirmed decision #3: "OLD: 6-layer → NEW: 8-layer"
- Exec Summary L158: "8-layer 보안 (Docker network → Hono proxy → API key header injection → tag-based tenant filter → webhook HMAC → rate limiting → N8N_ENCRYPTION_KEY → NODE_OPTIONS)"
- N8N_ENCRYPTION_KEY is security-critical: n8n stores workflow credentials (API keys) that must be encrypted at rest
- **Fix**: Add N8N-SEC-7 (N8N_ENCRYPTION_KEY AES-256-GCM) + N8N-SEC-8 (rate limiting) minimum. Sally's 4-layer analysis suggests API key injection and NODE_OPTIONS may also need explicit domain reqs.

### New Findings Adopted (4 minor)

**m5: MKT-1 "Deferred Item" label misleading (Bob #7, Sally #9)**
- L1498: "⚠️ JSONB read-modify-write race 주의 **(Deferred Item)**"
- Race protection (jsonb_set/SELECT FOR UPDATE) must be implemented in Sprint 2 when settings feature ships
- "Deferred Item" implies "skip" — developer may skip race protection
- The *table split* can be deferred; the *race protection* cannot
- **Fix**: Remove "Deferred Item" tag. "jsonb_set atomic 또는 SELECT FOR UPDATE 필수 (Sprint 2). 테이블 분리는 deferred (Phase 5+)"

**m6: ORC-6 ↔ SOUL-5 duplicate definition (Sally #6)**
- ORC-6 L1406: "매니저 Soul에 교차 검증 + 충돌 처리 + 에러 처리 지침 필수"
- SOUL-5 L1417: "매니저 Soul에 교차 검증(수치 대조) + 충돌 시 병기 + 에러 시 나머지 종합 지침"
- SOUL-5 is more specific. ORC-6 should reference SOUL-5 + add orchestration-level concerns
- **Fix**: ORC-6 → "SOUL-5 참조 + 오케스트레이션 관점: 교차 검증 실패 시 에이전트 재시도/대체 에이전트 호출 정책"

**m7: PIX-1 "< 200KB" should be "≤ 200KB" (Bob #10)**
- L1487: "PixiJS 8 + @pixi/react < 200KB gzipped (Go/No-Go #5, 204,800 bytes)"
- 204,800 bytes = exactly 200 KiB (200 × 1024). "< 200KB" excludes exactly 200KB.
- **Fix**: "≤ 200KB gzipped (204,800 bytes)"

**m8: MEM-1 Option B phrasing ambiguous (Bob #11)**
- L1477: "신규 observations/reflections 신규 테이블 + agent_memories 확장 (Option B 채택)"
- Could be read as BOTH going into new tables. Option B = observations → new table, reflections → agent_memories extension (memoryType='reflection')
- **Fix**: "신규 observations 테이블 + 기존 agent_memories에 memoryType='reflection' 확장 (Option B)"

### M3 Enhancement (Sally #8)

- Sally flags MEM-2 "Tier 3-4: 주 1회" vs Product Scope "20개 threshold" model conflict
- When both apply: "20개 쌓여도 이번 주에 이미 1번 했으면 스킵?" — priority undefined
- **Enhancement to M3 fix**: Add Tier 3-4 cap interaction: "주 1회 cap이 우선 — 20개 threshold 충족해도 이번 주 실행 완료 시 다음 주로 연기"

### Winston Findings (7.15 → 6.30 FAIL revised — 1C + 1M + 3m, then adopted cross-talk)

**Winston initially 7.15 PASS, revised to 6.30 FAIL after adopting cross-talk findings:**
- Upgraded N8N-SEC 8→6 gap from LOW to MAJOR (adopted from Quinn/Bob/Sally)
- Upgraded MEM-2 trigger model from minor to MAJOR (adopted from Quinn/Sally)
- Agrees on C1 (4G) and H1 (observation poisoning). Additional minors:

**m9 (adopted): SOUL-6 "agent-loop.ts에서 치환" → soul-renderer.ts (Winston M1)**
- SOUL-6 references agent-loop.ts for Soul template variable substitution
- Product Scope L958: soul-renderer.ts handles Soul rendering, not agent-loop.ts
- agent-loop.ts is the execution engine; soul-renderer.ts is the template layer
- **Fix**: "agent-loop.ts" → "soul-renderer.ts"

**m10 (adopted): SEC-7 "Phase 5+" summary table classification (Winston M3)**
- SEC-7 token rotation marked "Phase 5+" in summary but classified as "유지" — minor labeling inconsistency

**Winston Q&A:**
- Q1 (4G severity): Confirmed CRITICAL — domain reqs are implementation reference, 3rd recurrence = systemic
- Q2 (Observation poisoning): Confirmed most critical security gap — Go/No-Go #9 gate, MEM-6 필수
- Q3 (MEM-2 Tier 3-4): Confirmed inadequate — AND condition, priority, ECC 2.2 all missing

---

## Revised Rubric (Cross-Talk Adjusted)

| Dimension | Weight | Original | Adjusted | Weighted |
|-----------|--------|----------|----------|----------|
| D1 Specificity | 10% | 7.5 | 7.5 | 0.75 |
| D2 Completeness | 25% | 6.0 | 5.5 | 1.375 |
| D3 Accuracy | 15% | 5.5 | 5.0 | 0.75 |
| D4 Implementability | 10% | 7.0 | 7.0 | 0.70 |
| D5 Consistency | 15% | 5.5 | 5.0 | 0.75 |
| D6 Risk | 25% | 5.5 | 5.5 | 1.375 |
| **Total** | **100%** | **6.00** | | **5.70** |

**Revised Verdict: ❌ FAIL (5.70 < 7.0)**

**Consolidated Issues: 15 total (1C + 6M + 8m)**
- C1: N8N-SEC-5 "4G" (unanimous all 4 critics)
- M1: Missing MEM-6 observation poisoning (Quinn + Bob + Sally + Winston)
- M2: Missing NRT-5 WebSocket limits (Quinn + Bob + Sally)
- M3: MEM-2 Reflection trigger incomplete + Tier cap interaction (Quinn + Sally + Winston)
- M4: Missing MEM-7 observation TTL (Quinn + Bob + Sally)
- M5: MEM-4/MEM-5 "Planning" entity (Bob + Sally, upgraded from Quinn m3)
- M6: N8N-SEC 8→6 layer gap (Bob + Sally, upgraded from Quinn m4)
- m1: VEC-1 chunk size attribution (Quinn + Winston)
- m2: DB-3 timing overlap (Quinn, adopted by Bob)
- m5: MKT-1 "Deferred Item" (Bob + Sally)
- m6: ORC-6 ↔ SOUL-5 duplicate (Sally)
- m7: PIX-1 "< 200KB" → "≤ 200KB" (Bob)
- m8: MEM-1 Option B phrasing (Bob)
- m9: SOUL-6 code reference agent-loop.ts → soul-renderer.ts (Winston)
- m10: SEC-7 Phase 5+ summary table label (Winston)

---

## R2 Post-Fix Verification (Cycle 2)

**Fixes file:** `stage-2-step-07-fixes.md` (15 fixes: 1C + 6M + 8m)

### Fix Verification (15/15)

| Fix | Issue | Status | Verification |
|-----|-------|--------|-------------|
| Fix 1 | C1: N8N-SEC-5 "4G" | ✅ RESOLVED | L1459: `memory: 2G`, `NODE_OPTIONS=--max-old-space-size=1536`, restart policy, Brief reference, 3단계 에스컬레이션 참조 |
| Fix 2 | M6: N8N-SEC 8-layer | ✅ RESOLVED | L1461-1462: N8N-SEC-7 (AES-256-GCM encryption) + N8N-SEC-8 (rate limiting 분당 60회). 8 N8N-SEC items now |
| Fix 3 | M1: MEM-6 observation poisoning | ✅ RESOLVED | L1484: 4-layer (10KB+제어문자+하드닝+분류). PER-1 구분 명시. Go/No-Go #9 |
| Fix 4 | M4: MEM-7 observation TTL | ✅ RESOLVED | L1485: 30일 TTL, Admin 보존 정책, confirmed #5 |
| Fix 5 | M3: MEM-2 trigger full spec | ✅ RESOLVED | L1480: 일 1회+≥20 AND+confidence 0.7+Tier cap+$0.10/day+ECC 2.2+advisory lock. 모든 요소 포함 |
| Fix 6 | M5: MEM-4/5 Planning entity | ✅ RESOLVED | L1482: "Reflection/Observation 삭제". L1483: "soul-enricher.ts에서 Soul에 주입". Planning 제거 |
| Fix 7 | M2: NRT-5 WebSocket limits | ✅ RESOLVED | L1516: 50/company, 500/server, 10msg/s token bucket. Confirmed #10, R15 |
| Fix 8 | m1: VEC-1 chunk | ✅ RESOLVED | L1444: "(검색 정밀도 최적화 — 실제 상한 32K, 2048은 retrieval 정확도 최적)" |
| Fix 9 | m2: DB-3 Pre-Sprint | ✅ RESOLVED | L1393: "Pre-Sprint Voyage AI 마이그레이션 후 NULL 잔여분만 대상" |
| Fix 10 | m5: MKT-1 Deferred | ✅ RESOLVED | L1502: "jsonb_set atomic 또는 SELECT FOR UPDATE 필수 (Sprint 2). 테이블 분리 Phase 5+" |
| Fix 11 | m7: PIX-1 ≤200KB | ✅ RESOLVED | L1491: "≤ 200KB gzipped (204,800 bytes)" |
| Fix 12 | m8: MEM-1 Option B | ✅ RESOLVED | L1479: "observations 신규 테이블 + agent_memories에 memoryType='reflection' 확장. 별도 reflections 테이블 안 함" |
| Fix 13 | m9: SOUL-6 code ref | ✅ RESOLVED | L1418: "soul-renderer.ts에서 Soul 템플릿 변수를 DB 데이터로 치환" |
| Fix 14 | m10: Summary table | ✅ RESOLVED | L1536: Total 80개. N8N-SEC 8, MEM 7, NRT 5. 수학 검증 통과 |
| Fix 15 | m6: ORC-6/SOUL-5 | ✅ RETAINED | John 판단: 의도적 중복 (오케스트레이션 vs Soul 관점). 수용 |

**15/15 fixes verified. 14 resolved, 1 retained by design.**

### Summary Table Math Verification

| 카테고리 | 개수 | Verified |
|---------|------|---------|
| SEC | 7 | ✅ |
| SDK | 4 | ✅ |
| DB | 5 | ✅ |
| ORC | 7 | ✅ |
| SOUL | 6 | ✅ |
| OPS | 6 | ✅ |
| NLM | 4 | ✅ |
| VEC | 4 | ✅ |
| N8N-SEC | 8 | ✅ (was 6) |
| PER | 6 | ✅ |
| MEM | 7 | ✅ (was 5) |
| PIX | 6 | ✅ |
| MKT | 5 | ✅ |
| NRT | 5 | ✅ (was 4) |
| **Total** | **80** | ✅ (was 75) |

Phase distribution: 14+9+4+10+6+13+7+11+6 = 80 ✅

### Confirmed Decisions Coverage (Post-Fix)

| # | Decision | Domain Req | Status |
|---|----------|-----------|--------|
| 1 | Voyage AI 1024d | VEC-1 (correct attribution) | ✅ |
| 2 | n8n Docker 2G | N8N-SEC-5 (2G + NODE_OPTIONS) | ✅ |
| 3 | n8n 8-layer security | N8N-SEC-1~8 (8 items) | ✅ |
| 4 | Stitch 2 | N/A (tooling) | OK |
| 5 | 30-day TTL | MEM-7 | ✅ |
| 6 | LLM $17/mo cost | MEM-2 ($0.10/day + ECC 2.2) | ⚠️ PARTIAL (Exec level) |
| 7 | reflected/reflected_at | N/A (schema detail) | OK |
| 8 | Observation poisoning | MEM-6 (4-layer + Go/No-Go #9) | ✅ |
| 9 | Advisory lock | MEM-2 (pg_advisory_xact_lock) | ✅ |
| 10 | WebSocket limits | NRT-5 (50/500/10) | ✅ |
| 11 | Go/No-Go 14 gates | Various refs | ⚠️ PARTIAL |
| 12 | host.docker.internal | N/A (infra) | OK |

**Coverage: 8/12 fully covered + 3 N/A + 2 partial (acceptable at domain level) = PASS**

### Residual Items (2 minor, non-blocking)

1. **N8N-SEC Layer 3 (API key header injection) implicit:** N8N-SEC-2 covers Hono proxy but focuses on editor access (Admin JWT). The API key injection for programmatic n8n API calls is implicit via the proxy mechanism. 8 N8N-SEC items exist but Layer 3 isn't a separate domain req. Minor — the proxy IS the injection mechanism.

2. **PER-5 aria-valuetext (Sally cross-talk #12):** Not in my consolidated 15 issues. PER-5 covers WCAG 2.1 AA core (aria-valuenow/min/max + keyboard). aria-valuetext is enhancement for screen reader context. Non-blocking.

### R2 Rubric (Post-Fix)

| Dimension | Weight | Cycle 1 | Post-Fix | Weighted |
|-----------|--------|---------|----------|----------|
| D1 Specificity | 10% | 7.5 | 9.0 | 0.90 |
| D2 Completeness | 25% | 5.5 | 8.5 | 2.125 |
| D3 Accuracy | 15% | 5.0 | 9.0 | 1.35 |
| D4 Implementability | 10% | 7.0 | 8.5 | 0.85 |
| D5 Consistency | 15% | 5.0 | 8.5 | 1.275 |
| D6 Risk | 25% | 5.5 | 8.5 | 2.125 |
| **Total** | **100%** | **5.70** | | **8.625 ≈ 8.65** |

**R2 Verdict: ✅ PASS (8.65 ≥ 7.0)**

### R2 Score Rationale

- **D1 (9.0)**: 80 requirements with IDs, Phase/Sprint assignments. MEM-2 now has comprehensive trigger model (6 conditions). MEM-6 has explicit 4-layer chain with PER-1 distinction. N8N-SEC-5 has full detail (2G + NODE_OPTIONS + restart + escalation ref).
- **D2 (8.5)**: 80 requirements across 14 categories. All confirmed decisions now covered. MEM 5→7 (poisoning + TTL). N8N-SEC 6→8 (encryption + rate limiting). NRT 4→5 (WebSocket limits). Minor: Layer 3 API key injection implicit.
- **D3 (9.0)**: All factual errors corrected — "4G"→"2G", "Planning 삭제"→"Reflection/Observation 삭제", VEC-1 attribution, SOUL-6 code reference, PIX-1 threshold, MEM-1 Option B.
- **D4 (8.5)**: All requirements implementable. MKT-1 mandate clear (no "Deferred" confusion). MEM-2 provides complete trigger specification for Sprint 3 developer. DB-3 Pre-Sprint note prevents redundant work.
- **D5 (8.5)**: N8N-SEC-5 matches Brief/Exec Summary/Success Criteria (2G). MEM-4/5 consistent with Product Scope L896 and Step 6 fixes. MEM-2 consistent with L951 and L597. Summary table math 80 verified.
- **D6 (8.5)**: MEM-6 observation poisoning (Go/No-Go #9). NRT-5 WebSocket limits. N8N-SEC-7 credential encryption. N8N-SEC-8 rate limiting. MEM-7 TTL. MEM-2 advisory lock + ECC 2.2. MKT-1 race protection.
