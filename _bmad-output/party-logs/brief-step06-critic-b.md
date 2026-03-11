## [Critic-B Final Review] Step-06: 전체 문서 일관성 + 완성도

**File reviewed:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md` (전체, lines 1-400)
**References checked:** architecture.md (D1~D16, E1~E10), prd.md (NFRs), `_research/tool-reports/05-caching-strategy.md`, Epic 10 구현 코드

---

### 섹션 간 연결성 검토

**Executive Summary → Core Vision → Target Users → Success Metrics → MVP Scope 흐름:**

| 연결 | 상태 | 상세 |
|------|------|------|
| Executive Summary ↔ Core Vision | ✅ 일관 | "60~80% 절감" 목표 (line 34, 254) — 동일. Soul 토큰 $27/월 (line 34, 52, 255) — 동일. |
| Core Vision 흐름도 ↔ MVP Scope Story 순서 | ✅ 일관 | 흐름도 런타임 순서 (Semantic→Prompt→Tool)와 구현 순서 (15.1→15.2→15.3) 명확히 구분됨 (line 93). |
| Target Users 성공 기준 ↔ Success Metrics | ✅ 일관 | 김운영 "Tool Cache 히트율 ≥ 40% 확인 (Story 15.2 scope 로깅 포함)" (line 159) ↔ metrics 표 Tool Cache 히트율 ≥ 40% (30일, line 243). 이주임 FAQ ≤ 100ms ↔ KPI-4 PASS ≤ 100ms (line 367). |
| Success Metrics ↔ MVP Done 기준 | ✅ 일관 | KPI-1~3 + 비용 절감 Done 기준 전부 포함 (lines 371-373). |
| enableSemanticCache 정책 전 섹션 | ✅ 일관 | 흐름도 (line 100), 적합/부적합 표 (line 117-122), 이주임 여정 (line 174), Persona 4 (line 195), Story 15.3 scope (line 334), Out of Scope (line 354) — 모두 "주가·뉴스 = false, FAQ = true" 일관. |
| SDK PoC 전제조건 전 섹션 | ✅ 일관 | Executive Summary (line 30), 구현 난이도 표 (line 128), 개발자 여정 (line 223), Story 15.1 (line 316), KPI-1 (line 278) — "PoC 검증 전제 → 실패 시 messages.create 대안" 전 섹션 동일. |

---

### 수치 일관성 검토

| 수치 | 등장 위치 | 상태 |
|------|----------|------|
| 85% per hit 절감 | lines 30, 70, 103, 128, 240, 284, 371 | ✅ 전 섹션 통일 |
| TTFT ≥ 85% 단축 | lines 30, 70, 103, 128, 246, 319, 371 | ✅ 통일 (기존 "≥ 80%" 표기 해소됨) |
| 히트율 ≥ 70% (세션 기준) | line 241 | ✅ 수학적으로 독립 (실효 60%와 분리 명시) |
| 실효 절감율 ≥ 60% (1주) → ≥ 80% (30일) | lines 242, 285, 372 | ✅ 3단계 수치 일치 |
| Tool Cache ≥ 20% (1주) → ≥ 40% (30일) | lines 243, 291 | ✅ 단계별 표기 통일 |
| MAX 10,000 + LRU | lines 31, 136, 322 | ✅ 통일 |
| $27/월 낭비 (에이전트 1명 100회/일) | lines 34, 52, 255 | ✅ 추정값 명시와 함께 통일 |
| VECTOR(768) | line 330 (Story 15.3) | ✅ Epic 10 실제값 확인 (`schema.ts:1555`) |
| Gemini text-embedding-004 | lines 330, 331, 394 | ✅ 통일 (1536 완전 제거됨) |
| enableSemanticCache DEFAULT FALSE | lines 195, 330 | ✅ 통일 |
| cosine similarity ≥ 0.95 | lines 99, 332 (TTL 조건 포함) | ✅ 통일 |

---

### 정책 일관성 검토

| 정책 | 상태 | 비고 |
|------|------|------|
| D8 위반 없음 설명 | ✅ | lines 56, 83 — "DB 쿼리 캐싱(D8)과 Claude API 토큰 캐싱은 다른 차원" 명확히 분리 |
| D13 조기 해제 근거 | ✅ | lines 58, 139 — 에이전트 수 무관 즉각 절감 근거 명시 |
| E8 경계 준수 | ✅ | lines 137, 192, 332, 369 — semantic-cache.ts는 engine/ 내부, tool-cache.ts는 lib/ |
| 멀티테넌시 격리 | ✅ | lines 138, 325 — companyId 포함 캐시 키 + getDB(companyId) 패턴 |
| 에이전트 간 Semantic Cache 공유 (의도적) | ✅ | line 354 — "의도적 설계, agent_id 없음. FAQ 공유가 히트율에 유리" 명시 |
| try/catch graceful fallback | ✅ | lines 248, 267, 333, 352 — 캐시 레이어 예외 vs 외부 API 장애 구분 명확 |
| Soul 업데이트 시 5분 TTL 자연 만료 허용 | ✅ | line 140 |
| db/scoped-query.ts E3 확장 필요 | ✅ | line 331 — scope에 명시됨 |

---

### 잔여 이슈 (소결)

| # | 심각도 | 이슈 | 위치 |
|---|--------|------|------|
| 1 | **LOW** | **"agent-loop.ts 단 1곳" 표현 부정확** — line 315: Story 15.1이 `agent-loop.ts` 외에 `engine/types.ts` (`RunAgentOptions` 타입: `systemPrompt: string` → `ContentBlock[]`)도 수정 필요. Stop Hook E2 타입 확장도 `engine/types.ts`. "단 1곳"은 misleading. | line 315 |
| 2 | **LOW** | **`lib/tool-cache-config.ts` 파일 생성 범위 불명확** — line 324에서 "신규 도구 추가 시 `lib/tool-cache-config.ts` TTL 등록 테이블에 수동 명시 필요"라고 했으나, 이 파일을 Story 15.2에서 생성하는지 명시 없음. 개발자가 이 파일을 만들어야 하는지 모를 수 있음. | line 324 |
| 3 | **LOW** | **`lib/tool-cache.ts` try/catch scope가 Story 15.3에 기술됨** — line 333에서 "engine/semantic-cache.ts + lib/tool-cache.ts의 모든 캐시 작업은 try/catch"를 Story 15.3 scope에서 요구. 하지만 `lib/tool-cache.ts`는 Story 15.2에서 생성됨 → Story 15.2 scope에 try/catch 명시하는 것이 더 자연스러움. | line 333 |

---

### 완성도 + 다음 단계 준비성 평가

**다음 단계 준비 체크리스트:**

| 항목 | 상태 | 비고 |
|------|------|------|
| PRD 작성 가능? | ✅ | 문제, 목표, KPI, Out of Scope 전부 구조화됨 |
| Story 파일 생성 가능? | ✅ | Story 15.1~15.3 각각 구현 범위, 영향 파일, 전제조건 명시됨 |
| TEA 테스트 설계 가능? | ✅ | KPI-1~4 측정 방법 + PASS 기준 + TTL 만료 테스트 조건 명시됨 |
| 아키텍처 결정 추적 가능? | ✅ | D8/D13 조기 해제 근거 + 필요한 architecture.md 업데이트 안내 |
| 구현 착수 전 PoC 필요 사항 명시? | ✅ | SDK query() PoC → 실패 시 대안 경로 명확 |

**총평:** Brief로서 실질적으로 완성됨. 발견된 3개 LOW 이슈는 Story 파일 작성 단계에서 해소 가능한 수준. 문서 전체 수치·정책·섹션 간 일관성 우수.

---

---

### 추가 섹션 검토: Technical Constraints & Dependencies + Implementation Notes

**[코드 검증 실행: agent-loop.ts:52, 0049_pgvector-extension.sql:10-11 직접 확인]**

#### Technical Constraints & Dependencies (lines 398-447)

| 항목 | 상태 | 비고 |
|------|------|------|
| 아키텍처 제약 표 | ✅ | E1/E3/E8 정확히 매핑. TypeScript CI 조건 CLAUDE.md 일치. |
| Story 간 의존성 다이어그램 | ✅ | lib/tool-cache-config.ts를 Story 15.2 전제로 명시 (LOW-2 해소) |
| 외부 의존성 표 | ✅ | Gemini text-embedding-004 768차원, $0.30/MTok cache read — 전부 일치 |
| 기술 위험 표 | ✅ | SDK PoC, 메모리, cosine 임계값, DB migration, companyId 격리 5가지 커버 |

#### Implementation Notes — 코드 스니펫 정확성 검토

**Story 15.1 PoC 스니펫 (lines 454-466) — MEDIUM 이슈 발견:**
```typescript
const result = await query({ systemPrompt: [...] })
// result.usage.cacheReadInputTokens > 0
```
`packages/server/src/engine/agent-loop.ts:52` 직접 확인: `for await (const msg of query({...}))` — SDK `query()`는 **AsyncIterator 스트림**. `await query()` 후 `.usage` 직접 접근 불가. 개발자가 이 코드를 복사하면 `result.usage` is undefined 또는 AsyncIterator 타입 오류 발생. PoC 코드가 실제 동작하지 않는 패턴을 보여줌.

**Story 15.2 try/catch 스니펫 (lines 496-506) — LOW 이슈, 단 Story 15.2 컨텍스트에서 제시됨:**
캐시 miss 후 `fn(params, ctx)` 결과를 `cache.set()` 으로 저장하는 코드 없음. 불완전한 예시 (오해 소지는 낮으나 "구현 참고용"으로 부족).

**Story 15.3 SQL 쿼리 (lines 519-526) — `<=>` 연산자 정확:**
`1 - (query_embedding <=> $2) >= 0.95` — pgvector에서 `<=>` = cosine distance (0 to 2). `1 - cosine_distance = cosine_similarity`. 수식 정확함 ✅.
TTL: `ttl_hours * INTERVAL '1 hour'` — PostgreSQL integer × interval = interval. 유효 문법 ✅.

**ivfflat vs HNSW 불일치 — MEDIUM 이슈:**
Brief line 329: "ivfflat 인덱스"
`packages/server/src/db/migrations/0049_pgvector-extension.sql:10-11` 직접 확인:
```sql
CREATE INDEX knowledge_docs_embedding_idx
  ON knowledge_docs USING hnsw (embedding vector_cosine_ops);
```
Epic 10은 **HNSW + vector_cosine_ops** 사용. Brief의 ivfflat은 Epic 10 인프라와 불일치. 추가로: SQL 쿼리의 `<=>` 연산자가 인덱스를 효율적으로 활용하려면 `vector_cosine_ops` operator class 필수. ivfflat으로 생성하더라도 `vector_cosine_ops` 명시 없으면 기본 `vector_l2_ops` 적용 → cosine 쿼리에서 인덱스 스캔 미활용.

**Agent Loop 통합 순서 (lines 532-540):**
Core Vision 흐름도 (lines 95-113)와 완전 일치 ✅. try/catch graceful fallback 포함 ("미스/오류: 계속") ✅.

---

### 이전 LOW 이슈 해소 현황

| 이슈 | 상태 |
|------|------|
| LOW-2: lib/tool-cache-config.ts 생성 범위 불명확 | ✅ **해소됨** — Story 15.2 의존성 (line 420) + Implementation Notes 코드 스니펫 (line 483-494) |
| LOW-3: lib/tool-cache.ts try/catch가 Story 15.3 scope | ✅ **해소됨** — Implementation Notes Story 15.2 가이드에서 try/catch 패턴 제시 (lines 496-506) |
| LOW-1: "단 1곳" vs engine/types.ts 수정 | ⚠️ **부분 해소** — Implementation Notes에 types.ts 수정 명시됨 (line 470). 그러나 line 315 "단 1곳" 표현 여전히 존재 → 문서 내 불일치 |

---

### 최종 이슈 합산

| # | 심각도 | 이슈 | 위치 |
|---|--------|------|------|
| 1 | **MEDIUM** | **Story 15.1 PoC 코드 `await query()` + `.usage` 접근 불가** — SDK는 AsyncIterator 스트림. `agent-loop.ts:52` 확인: `for await (const msg of query({...}))`. `const result = await query()` 패턴 작동 안 함. | line 456-464 |
| 2 | **MEDIUM** | **`ivfflat` → `hnsw (vector_cosine_ops)` 불일치** — Epic 10 (`0049_pgvector-extension.sql:10`) HNSW + vector_cosine_ops 사용. `<=>` cosine 쿼리에서 인덱스 활용을 위해 vector_cosine_ops 필수. ivfflat + 기본 operator class 시 인덱스 비활용 위험. | line 329, 523 |
| 3 | **LOW** | `withCache` 코드 스니펫 불완전 — miss 시 cache.set() 없음 | lines 496-506 |
| 4 | **LOW** | line 315 "단 1곳" vs Implementation Notes engine/types.ts 수정 — 문서 내 불일치 | line 315, 470 |

---

### 최종 점수

**9/10**

- 이전 LOW-2, LOW-3 해소로 +0.5
- 신규 MEDIUM×2 발견으로 −0.5
- 순변화 0 → 9/10 유지

**핵심:** MEDIUM-1 (PoC 코드 스트림 패턴)은 구현자가 literal copy 시 즉시 실패하는 실질적 위험. MEDIUM-2 (ivfflat vs hnsw)는 인덱스 성능 저하로 연결. 두 이슈 수정 후 Story 구현 착수 가능.

전체 Brief 품질 평가:
- step-02 (Executive Summary): 9/10
- step-03 (Target Users): 9/10
- step-04 (Success Metrics): 9/10
- step-05 (MVP Scope): 10/10
- step-06 추가 섹션 포함 Final: **9/10 → 전체 문서 최종 평균 9.2/10**

Critical/High 이슈 전부 해소됨. 2개 MEDIUM 추가 수정 후 Epic 15 Brief 완성.
