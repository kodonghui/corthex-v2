# Stage 4 Step 4 — Critic-C (John) Review: v3 Core Architectural Decisions (GATE)

**Date:** 2026-03-22
**Reviewer:** John (Critic-C, Product + Delivery)
**Writer:** Winston
**Step:** Step 4 — v3 Core Architectural Decisions D22-D34 (GATE)
**Focus:** PRD alignment, Sprint feasibility, Go/No-Go gate coverage, schema accuracy

---

## R1 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 20% | SQL DDL 완전(CHECK, partial index, HNSW), Docker Compose YAML 완전, N8N-SEC 8-layer 구현 매핑 테이블, 3개 sanitization 체인 layer-by-layer 상세, Voyage client TypeScript 코드, packages/office 디렉토리 구조, soul-enricher 흐름도. |
| D2 완전성 | 7/10 | 20% | 13개 결정 + 6개 carry-forward 해소 ✅. **누락 4건**: (1) cost WS 채널 deprecated 전략 — PRD L263 "Architecture 단계에서 확정" 명시했으나 D22-D34 미포함, (2) observations `importance` 컬럼 (PRD L909 Park et al. 반성 트리거), (3) observations `task_execution_id` (PRD L906 FK deferred), (4) observations `observed_at` (PRD L914 관찰 발생 시점). |
| D3 정확성 | 5/10 | 15% | **🔴 D28 크론 주기 치명적 오류**: `*/5 * * * *`(매 5분) ≠ PRD MEM-2 "일 1회 크론 (새벽 3시)". PRD 6곳 반복 명시(L376, L1179, L1279, L1480, L2472, L556). 5분 주기 = 비용 ~288배 + Haiku $0.10/day 즉시 초과. **D22 `source` vs PRD `domain`**: 동일 개념이나 컬럼명 불일치. **D23 renderSoul**: 2파라미터 vs 실제 4파라미터(soulTemplate, agentId, companyId, extraVars?). **SEC-8**: 60req/min vs PRD L1779 100req/min. |
| D4 실행가능성 | 8/10 | 15% | SQL DDL migration-ready. Docker Compose 즉시 배포 가능. Implementation sequence Sprint 순서 논리적. Cross-component dependencies 정확. Pre-Sprint→Sprint 4 chain 명확. |
| D5 일관성 | 6/10 | 10% | D28 크론 주기 문서 내 일관(*/5 반복)이나 PRD와 정면 모순. D22 스키마 컬럼명(source vs domain) PRD와 불일치. D28 trigger 조건 단순화(`LIMIT 20`만) — PRD MEM-2의 `≥20 AND confidence ≥ 0.7` 조건 미반영. Tier-based caps D28에 전무 — PRD MEM-2 "Tier 3-4: 주 1회 cap" 누락. |
| D6 리스크 | 7/10 | 20% | Advisory lock ✅, Neon LISTEN/NOTIFY 제약 ✅, path traversal 차단 ✅, 비용 ceiling ✅. **누락**: (1) Tier별 비용 분화 리스크 (Tier 1-2 무제한 vs 3-4 주 1회), (2) importance 기반 트리거 없을 때 저품질 observation 반성 진입 리스크, (3) cost WS 채널 제거 시 기존 CEO 앱 영향. |

### R1 가중 평균: 7.15/10 ✅ PASS

**계산:** (9×0.20) + (7×0.20) + (5×0.15) + (8×0.15) + (6×0.10) + (7×0.20) = 1.80 + 1.40 + 0.75 + 1.20 + 0.60 + 1.40 = **7.15**

---

## R1 이슈 목록

### 🔴 Must Fix (3건)

1. **D28 크론 주기 `*/5` → 일 1회 새벽 3시**
   - Architecture L551: `"*/5 * * * *"` (매 5분)
   - PRD MEM-2 (L1480): "일 1회 크론 (새벽 3시)"
   - PRD FR-MEM3 (L2472): "일 1회 크론으로 실행"
   - PRD L1179: "Reflection 크론 주기 (매일 새벽 3시 기본)"
   - PRD L1279: "매일 새벽 3시 크론 실행"
   - PRD L376: "일 1회 크론 실행"
   - 5분 주기 = 비용 ~288배 증가, Haiku $0.10/day 한도 즉시 초과 위험
   - 회사별 오프셋 방식은 유지하되, 기준을 `0 3 * * *` (새벽 3시) + offset으로 변경해야 함

2. **D22 observations 스키마 PRD 컬럼 누락 (4건)**
   - PRD L908: `domain VARCHAR(50)` — Architecture는 `source VARCHAR(50)` (동일 개념, 컬럼명 불일치)
   - PRD L909: `importance INTEGER NOT NULL DEFAULT 5` — Park et al. 반성 트리거 임계값 `sum > 150`. Architecture 전무
   - PRD L914: `observed_at TIMESTAMPTZ NOT NULL DEFAULT now()` — 관찰 발생 시점. Architecture는 `created_at`만 사용
   - PRD L906: `task_execution_id UUID` — FK deferred. Architecture 전무
   - `importance` 없으면 MEM-2의 중요도 기반 우선순위 필터링 불가

3. **D28 Tier-based reflection caps 누락**
   - PRD MEM-2 (L1480): "Tier 1-2(Sonnet/Opus): 무제한. Tier 3-4(Haiku): 주 1회 cap"
   - D28에 Tier 분화 로직 전혀 없음 — 모든 에이전트 동일 주기
   - Tier별 비용 차이 큼: Haiku $1.80/mo vs Sonnet $39/mo (PRD L263)

### 🟡 Should Fix (3건)

4. **D23 renderSoul 시그니처 오류**
   - Architecture L480: `renderSoul(agent.soul, extraVars)` — 2개 파라미터
   - 실제 soul-renderer.ts:16: `renderSoul(soulTemplate: string, agentId: string, companyId: string, extraVars?: Record<string, string>)` — 4개 파라미터
   - 수정: `renderSoul(agent.soul, agentId, companyId, extraVars)`

5. **cost WS 채널 deprecated 전략 누락**
   - PRD L263: "cost WS 채널(`types.ts:497`) + 관련 API(costs.ts, budget.ts) deprecated 전략은 Architecture 단계에서 확정"
   - D22-D34 어디에도 미포함 — PRD가 Architecture에 명시적으로 위임한 항목

6. **D28 trigger 조건 불완전**
   - Architecture L555: `SELECT * FROM observations WHERE reflected = false LIMIT 20`
   - PRD MEM-2: "reflected=false ≥ 20 AND 조건 (미달 시 스킵). confidence ≥ 0.7 우선"
   - 수정: `WHERE reflected = false AND confidence >= 0.7` + `HAVING count(*) >= 20` threshold 확인 + 미달 시 스킵 로직

### 💬 Observation (2건)

7. **SEC-8 rate limit**: Architecture 60req/min vs PRD L1779 100req/min — 보수적이나 PRD와 차이 근거 필요.
8. **D22 `flagged` + `user_id` 추가 컬럼**: PRD 스키마에 없으나 MEM-6 layer 4 + system observation 용도로 정당. PRD 스키마와의 차이점을 주석으로 문서화 권장.

---

## R2 Verification — 수정 후 재채점

**수정 확인 결과 (14건 from 4 critics, 34 individual changes):**

| # | 이슈 | 수정 결과 | 검증 |
|---|------|----------|------|
| 1 | D28 크론 `*/5`→일 1회 | ✅ L369: `0 3 * * *` (PRD FR-MEM3). L586: "매일 새벽 3시". L588: 60분 분산(03:00~03:59). L666: carry-forward 수정. | PRD MEM-2/FR-MEM3 6곳과 일치 |
| 2 | D22 observations 4컬럼 누락 | ✅ L394: `domain VARCHAR(50)` (was source). L397: `importance INTEGER DEFAULT 5`. L403: `observed_at TIMESTAMPTZ`. L392: `task_execution_id UUID`. | PRD L906-914 전부 일치 |
| 3 | D28 Tier-based caps | ✅ L596-598: Tier 1-2 무제한, Tier 3-4 주 1회 cap, 이번 주 실행 여부 확인 | PRD MEM-2 일치 |
| 4 | D23 renderSoul 시그니처 | ✅ L504: `renderSoul(agent.soul, agentId, companyId, extraVars)` 4-param | soul-renderer.ts:16 일치 |
| 5 | cost WS deprecated 전략 | ❌ 미수정 — D22-D34 범위 외 주장 가능하나 PRD L263 명시적 위임 | 잔여 🟡 |
| 6 | D28 trigger 조건 | ✅ L591-595: `WHERE reflected = false AND confidence >= 0.7 ORDER BY importance DESC LIMIT 20` + `< 20건 스킵` | PRD MEM-2 조건 일치 |

**추가 수정 (다른 critic 이슈 + 발견 — Product+Delivery 관점 검증):**

| 수정 | 검증 |
|------|------|
| D22 FR-MEM1 컬럼 3개 추가 (session_id, outcome, tool_used) | ✅ L391, L395, L396: FR-MEM1 요구 반영. outcome `unknown` DEFAULT로 기존 호환 |
| D22 unreflected index → importance DESC 추가 | ✅ L410: `importance DESC` 포함 — reflection 크론이 중요 관찰 우선 처리 |
| D22 confidence 스케일 차이 문서화 | ✅ L423-426: observations REAL 0-1 vs agent_memories INTEGER 0-100 명시 |
| agent_memories ALTER → confidence REAL 제거 (기존 integer 유지) | ✅ L434: embedding VECTOR(1024)만 추가, confidence는 기존 유지 — no-op 방지 |
| ALTER TYPE memory_type → IF NOT EXISTS + 트랜잭션 외부 주석 | ✅ L431-432: 안전한 migration 패턴 |
| agents personality_traits ALTER + CHECK | ✅ L443-446: D33 migration SQL 포함 — Sprint 1 준비 완료 |
| D23 soul-enricher 흐름 전면 재작성 | ✅ L499-510: hub.ts 중심, 8개 callers 명시, agent-loop.ts renderSoul 0건 확인 |
| D24 ws/channels.ts + WsChannel union 패턴 | ✅ L360: 기존 코드베이스 패턴 정확 반영 |
| D25 proxy target 127.0.0.1 + 방향 명확화 | ✅ L361: 확정결정 #12는 컨테이너→호스트 방향임을 명시 |
| D25 Docker Compose DB_TYPE=sqlite | ✅ L618: SEC-6 구현 — n8n→PG 접근 차단 |
| D25 extra_hosts 용도 주석 | ✅ L632: "n8n→CORTHEX API webhook 호출용" |
| D27 tool-sanitizer PostToolUse→PreToolResult 재작성 | ✅ L363, L468-479: toolResults.push 직전 삽입. PostToolUse의 side-effect COPY 한계 설명. 이 수정이 가장 중요한 아키텍처 개선 — 원 설계대로면 unsanitized 콘텐츠가 LLM에 도달 |
| D31 Voyage client per-company credential 패턴 | ✅ L522-551: getCredentials(companyId, 'voyage_ai'). 기존 embedding-service.ts 패턴 계승 |
| D25↔D27 의존성 삭제 + 근거 | ✅ L657: n8n proxy ≠ engine tool pipeline 분리 설명 |
| SEC-8 60rpm 보수적 근거 | ✅ L492: "n8n API 특성상 60rpm 충분. 필요 시 상향 가능" |
| D22 Pre-Sprint 범위 명확화 | ✅ L640: "Drizzle schema 작성 + migration SQL 생성 — 테이블 CREATE는 Sprint 3" |

### R2 차원별 점수

| 차원 | R1 | R2 | 변화 근거 |
|------|-----|-----|----------|
| D1 구체성 | 9 | 9 | 유지. confidence 스케일 문서화, FR-MEM1/MEM9 컬럼별 주석, PreToolResult 코드 흐름, proxy 방향 명확화로 더 강화. |
| D2 완전성 | 7 | 9 | D22 PRD 4컬럼 + FR-MEM1 3컬럼 추가(7개 총). D28 Tier caps. D27 PreToolResult 재작성. D31 per-company credential. 잔여: cost WS deprecated(🟡, D22-D34 범위 논쟁 가능). |
| D3 정확성 | 5 | 9 | D28 크론 `0 3 * * *` PRD 일치. D22 `domain`/`importance`/`observed_at`/`task_execution_id` PRD 일치. D23 renderSoul 4-param. D28 trigger confidence ≥ 0.7 + importance DESC. D27 PreToolResult가 원래 PostToolUse보다 아키텍처적으로 올바름. |
| D4 실행가능성 | 8 | 9 | D31 per-company credential vault 현실적. D27 PreToolResult 코드 패턴 구체적. D28 Tier 체크 로직 구현 가능. agent_memories/agents ALTER 안전한 migration. |
| D5 일관성 | 6 | 9 | D28 크론 PRD 6곳 일치. D22 컬럼명 PRD 일치. D23 시그니처 코드베이스 일치. D25↔D27 의존성 정리. carry-forward 테이블 수정. |
| D6 리스크 | 7 | 9 | Tier별 비용 분화 포함. importance 기반 우선순위 위험 해소. confidence 스케일 차이 명시. D27 PreToolResult로 unsanitized LLM 도달 위험 제거. 잔여: cost WS 제거 영향(🟡). |

### R2 가중 평균: 9.00/10 ✅ PASS

**계산:** (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00**

---

## 결론

R1의 핵심 문제(D28 크론 주기 `*/5`→`0 3 * * *`, D22 스키마 4컬럼 누락, Tier caps 부재)가 **전부 수정 완료**. 특히 D27 tool-sanitizer의 PostToolUse→PreToolResult 재작성은 보너스 — 원 설계의 근본적 결함(PostToolUse side-effect COPY 한계로 unsanitized 콘텐츠가 LLM에 도달)을 아키텍처 단계에서 포착하여 수정. D22 observations 스키마가 PRD 전체 컬럼 + FR-MEM1/MEM9 추가 컬럼까지 포함하여 Sprint 3 즉시 구현 가능. D31 Voyage client의 per-company credential vault 패턴은 기존 코드베이스의 embedding-service.ts와 일관. 자동 불합격 조건 0건. 잔여 🟡 1건(cost WS deprecated)은 D22-D34 범위 외 논쟁 가능. **9.00/10 — Excellent.**
