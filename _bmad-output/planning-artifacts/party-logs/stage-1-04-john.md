# Critic-C (Product + Delivery) Review — Step 4: Architectural Patterns

**Reviewer**: John (PM)
**Date**: 2026-03-20
**File**: `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` — Step 4 (L993-1324)

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 9/10 | OfficeStateStore 코드 패턴, Map viewport(1280×720/2560×1440), rate limit(10msg/s), 6-layer security 테이블, Zod validation(`z.number().int().min(0).max(100)`), MAX_BATCH=50/MAX_UNPROCESSED_ALERT=500 코드, 90-day TTL SQL, migration 3개 파일명+순서, service 파일 9개 조직도, Go/No-Go 8개 verification method. 추상적 표현 0곳. |
| D2 완전성 | 20% | 9/10 | 6개 섹션(4.1-4.6) + cross-layer. **9개 carry-forward 전부 해결**: WS rate limiting(4.1.3), tag isolation(4.2.1), personality scale(4.3.1), spread reversal(4.3.2), key-aware fallback(4.3.3), regex decision(4.3.4), Neon tier(4.4.3A), cron backpressure(4.4.3B), retention(4.4.3C). Go/No-Go 8개 전부 architecture input + verification method 매핑. |
| D3 정확성 | 15% | 8/10 | 0-100 integer Brief §4 deviation 명시 + 근거 4가지(research papers, LLM comprehension, no float, zero conversion). Migration 0061-0063 순서 정확(0060 확인). E8 boundary 일관(services/ 배치). **그러나**: (1) Decision 4.4.1 ASCII diagram에서 `memory-planner.ts`가 reflections에 대해 pgvector similarity search 수행한다고 명시 — 그런데 agent_memories 테이블(L1250)에는 "(future: embedding HNSW)" 표기. 즉 Sprint 3 시점에 planner가 similarity search할 인덱스가 없음. (2) Go/No-Go #8 verification이 "Manual: PM approval" — 다른 7개는 자동화 가능한데 #8만 수동. Sprint 4 착수 블로커가 PM 일정에 의존하는 리스크. |
| D4 실행가능성 | 15% | 9/10 | OfficeStateStore 복붙 가능. personality-injector sanitizeExtraVars 함수 완전. key-aware fallback 코드 완전(PERSONALITY_KEYS Set, replace 함수, DEFAULT_PERSONALITY). cron backpressure 코드 완전(select count, threshold alert, batch limit). Migration SQL 실행 가능. Service 파일 조직도 = 즉시 생성 가능. |
| D5 일관성 | 10% | 9/10 | 0-100 integer Step 2/3/4 전부 통일. importance 1-10 통일(L1169). E8 boundary 전 섹션 일관(services/ 배치, engine 미접촉). Sprint 순서(Pre→1→2→3→4) Brief §4 일치. Carry-forward 9개 해결 방식이 Step 2/3 논의와 정합. |
| D6 리스크 | 20% | 8/10 | 6-layer security 상세(Go/No-Go #3). Cron failure backpressure 코드 수준. Neon Pro 필수 명시. 90-day TTL. Rate limiting 10msg/s. **그러나**: (1) agent_memories에 embedding HNSW "future" — Sprint 3에서 planner가 similarity search를 못 하면 memory system의 핵심 가치(관련 기억 주입)가 Sprint 3 내에 동작 불가. 이건 리스크가 아니라 **아키텍처 gap**. (2) n8n tag-based isolation의 race condition — 동시 workflow 생성 시 tag 부착 전 조회가 가능한지 미검토. (3) OfficeStateStore가 서버 재시작 시 전체 에이전트 위치 소실 — persistence 전략 미언급(메모리 전용? DB 저장?). |

---

## 가중 평균: 8.60/10 ✅ PASS

계산: (9×0.20) + (9×0.20) + (8×0.15) + (9×0.15) + (9×0.10) + (8×0.20) = 1.80 + 1.80 + 1.20 + 1.35 + 0.90 + 1.60 = **8.65**

---

## 이슈 목록

1. **[D3 정확성 — High] agent_memories embedding HNSW "future" vs memory-planner similarity search 모순** — Decision 4.4.1(L1172-1174): `memory-planner.ts`가 "pgvector similarity search on reflections"를 수행한다고 명시. 그런데 Decision 4.4.4(L1250): `agent_memories` 테이블의 인덱스가 "(future: embedding HNSW)". Sprint 3에서 planner가 배포되면 similarity search할 인덱스가 없음.

   **결정 필요**: (A) Sprint 3에서 agent_memories에도 HNSW 인덱스 추가 (migration 0064 추가), 또는 (B) Sprint 3 planner는 keyword/recency 기반 검색, Sprint 4+에서 semantic search 추가. 어느 쪽이든 현재 문서가 자기모순.

2. **[D6 리스크] OfficeStateStore 서버 재시작 시 상태 소실** — Decision 4.1.1에서 OfficeStateStore는 in-memory Map. VPS 재시작·배포 시 전체 에이전트 위치 소실. 선택지:
   - (A) 소실 허용 — 재접속 시 에이전트 랜덤/기본 위치 배치 (게임이 아니므로 acceptable?)
   - (B) 주기적 DB snapshot (5분 간격)
   - 아키텍처 결정 문서에 명시 필요.

3. **[D6 리스크] n8n tag isolation race condition** — workflow 생성 시 (1) POST workflow → (2) POST tag attachment 가 2-step. Step 1과 2 사이에 다른 company가 `GET /workflows` 호출하면 tag 없는 workflow가 노출될 수 있음. 해결: workflow 생성을 proxy에서 atomic operation으로 래핑(POST workflow + tag in single handler), 또는 n8n API가 creation payload에 tags를 포함하는지 확인.

4. **[D3 정확성] Go/No-Go #8 verification method 일관성** — 다른 7개 gate는 자동화 가능한 verification(unit test, integration test, build size, bun test 등)인데, #8만 "Manual: PM approval". 이것 자체가 문제는 아니지만, **PM approval이 Sprint 4 착수의 blocking dependency**라는 점을 Sprint Blockers 섹션(Step 1)에 명시했는지 확인 필요. Step 1의 Sprint Blockers에 #8이 없으면 추가 필요.

5. **[D2 완전성 — Winston 제기] Personality opt-in vs automatic 불일치** — 현재 Step 4 설계: soul template에 `{{personality_openness}}` placeholder가 있는 에이전트만 성격 적용 (opt-in). **Brief §4 의도는 automatic**:
   - L102: "**모든 에이전트가** 동일한 성격으로 응답" — 문제 정의가 전체 에이전트 대상
   - L343: "기본값 유지 = 미사용으로 간주" — 기본값이 존재함 (성격 없는 에이전트 ≠ 기본 성격 에이전트)
   - L345: "`{{personality_traits}}` 주입 성공률: **100%**" — 모든 에이전트에 주입

   **결정 필요**: personality-injector.ts가 항상 personality vars를 extraVars에 주입하고, agents 레코드에 항상 personality_traits JSONB 존재 (default: O=60, C=75, E=50, A=70, N=25). Template placeholder 유무와 무관하게 데이터 계층에서 모든 에이전트가 성격을 가져야 함.

---

## Cross-talk 요청 (발신)

- **Winston**: D3 — agent_memories HNSW "future" 표기 의도? Sprint 3에서 planner similarity search 불가 시 아키텍처 대안? + Personality opt-in vs automatic.
- **Quinn**: D6 — n8n tag isolation race condition 실제 공격 가능성? OfficeStateStore persistence 필요 여부?

## Cross-talk 수신 요약

### Quinn (QA)
1. **n8n race condition**: 보안 이슈 아님 — tag 없는 workflow는 어느 company 필터에도 매칭 안 됨. UX 이슈 수준. `createWorkflowWithTag()` sequential wrapper 권장.
2. **OfficeStateStore**: Expected behavior로 문서화 충분. "In-memory store is intentionally ephemeral" 한 줄 추가 권장. 위치 영속화 과잉.
3. **Neon Pro**: $19/mo Sprint 0 전제조건. 예산 반영 필요.
4. **Go/No-Go gate testing**: #1(10,154 test regression)과 #3(n8n security)은 시간 소요 클 수 있음 — Sprint 계획에 반영 필요.

### Winston (Architect)
1. **HNSW 메모리**: ~2GB RAM 추정이나 Neon managed이므로 VPS headroom 영향 없음 (John PM 판단). Neon compute tier 성능은 Quinn Step 2에서 확인 완료.
2. **Personality opt-in vs automatic**: Step 4 아키텍처 gap 확인 — Brief는 "모든 에이전트가 기본 성격" 의도. 이슈 #5 추가.

### 점수 재계산 (cross-talk 반영)

| 차원 | 초기 | 수정 | 이유 |
|------|------|------|------|
| D2 완전성 | 9/10 | 8/10 | Personality automatic 설계 누락 — Brief §4 "주입 성공률 100%" 미반영 |
| D6 리스크 | 8/10 | 8/10 | n8n race condition은 보안 이슈 아님(Quinn 확인), OfficeStateStore는 expected behavior(Quinn 확인). 원점수 유지. |

**수정 가중 평균**: (9×0.20) + (8×0.20) + (8×0.15) + (9×0.15) + (9×0.10) + (8×0.20) = 1.80 + 1.60 + 1.20 + 1.35 + 0.90 + 1.60 = **8.45/10 ✅ PASS**

### 최종 이슈 수: 5개 (초기 4 + cross-talk 1)

---

## [Verified] Fixes Verification

**Date**: 2026-03-20

### 이슈별 검증

| # | 이슈 | 상태 | 검증 근거 |
|---|------|------|----------|
| 1 | agent_memories HNSW "future" 모순 | ✅ 완료 | L1266: `embedding HNSW (0064 migration, Sprint 3)` — "future" 제거. L1268: Migration 0064 명시 + fallback to keyword/recency if missing. L1270: HNSW memory impact 정량화 (2.5-3GB, 12.5GB remaining). **단, 4.6.1 Migration Ordering(L1310-1315)에 0064 미추가 — Winston 지적. Carry-forward.** |
| 2 | OfficeStateStore 상태 소실 | ✅ 완료 | L1024: "In-memory state is ephemeral by design. On server restart/deploy, all agents reset to default desk positions." 클라이언트 reconnect + fresh state 명시. |
| 3 | n8n tag race condition | ✅ 완료 | L1052: "atomic create-with-tags — n8n API `POST /workflows` accepts `tags` array in creation payload". Proxy가 company tag를 request body에 주입. 2-step gap 해소. |
| 4 | Go/No-Go #8 Sprint Blocker | ✅ 완료 | L73: Sprint Blockers 섹션에 "Sprint 3 완료 전까지 PM이 스프라이트 에셋 리뷰. 미승인 시 Sprint 4 착수 불가" 추가. |
| 5 | Personality opt-in → automatic | ✅ 완료 | L1161-1165: "Personality injection is automatic" 섹션 추가. (1) 데이터 계층: migration 0063이 기존 에이전트에 default backfill, (2) 주입 계층: personality-injector.ts가 항상 주입, template placeholder 유무 무관, (3) Brief §4 "기본값 유지 = 미사용으로 간주" 인용. |

### Verified 점수

| 차원 | 초기 | Cross-talk | Verified | 변화 근거 |
|------|------|-----------|----------|----------|
| D1 구체성 | 9 | 9 | **9** | 유지 |
| D2 완전성 | 9 | 8 | **9** | Personality automatic 설계 추가 — Brief §4 "100% 주입" 충족 |
| D3 정확성 | 8 | 8 | **9** | HNSW "future" 해소 + migration 0064 명시. n8n atomic create 확인. Go/No-Go #8 Sprint Blocker 추가. |
| D4 실행가능성 | 9 | 9 | **9** | 유지 |
| D5 일관성 | 9 | 9 | **9** | Personality automatic이 Brief, Step 2 presets, Step 3 Zod 전부와 정합 |
| D6 리스크 | 8 | 8 | **9** | OfficeStateStore ephemeral 명시. n8n race condition atomic 해소. HNSW memory impact 정량화. |

**Verified 가중 평균**: (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00/10 ✅ PASS**

### 잔여 사항

- **Minor**: 4.6.1 Migration Ordering에 0064 미추가 (Winston 지적). 0061-0063만 명시, 0064는 4.4.4에만 언급. Carry-forward to Step 5/6 또는 dev 즉시 수정.

---

## 총평

Step 4로서 exceptional. 9개 carry-forward 전부 해결 + 5개 reviewer 이슈 전부 수정. 특히:
- **HNSW "future" 해소**: migration 0064 명시 + fallback 전략 + memory impact 정량화 (2.5-3GB)
- **Personality automatic**: Brief §4 "100% 주입" 완전 충족 — data backfill + unconditional injection + key-aware fallback 3중 구조
- **n8n atomic create**: race condition을 API 수준에서 해소 (tags array in creation payload)
- **OfficeStateStore ephemeral**: "자기 책상으로 리셋" 자연스러운 UX + no persistence overhead

Go/No-Go 8개 gate 전수 매핑 + verification method가 Sprint 계획의 checklist로 직접 사용 가능. Migration 0064 ordering만 minor carry-forward.
