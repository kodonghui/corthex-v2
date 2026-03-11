# [Critic-A Review] step-05: MVP Scope + Future Vision

**Reviewed:** 2026-03-11
**File:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md` Lines 308-392
**Cross-referenced:** `_research/tool-reports/05-caching-strategy.md`, v1-feature-spec.md, step-02/03/04 결정사항

---

## Agent Discussion (in character)

**John (PM):** "MVP Done 기준표(lines 358-369)를 보면 KPI-1 (캐시 활성화 확인)과 KPI-3 (Tool Cache 히트율 ≥ 20%)가 있다. 근데 KPI-2 — '비용 절감율 ≥ 60% (1주)' — 가 없다. 이게 Epic 15의 핵심 비즈니스 목표인데, Done 기준에 없으면 '캐시는 켜졌지만 돈은 절약됐는지 모름' 상태로 Epic이 완료 선언될 수 있다. 제품 관리자 입장에서 이건 용납할 수 없다. '캐시가 동작한다'와 '비용이 실제로 줄었다'는 완전히 다른 검증이다."

**Sally (UX):** "Out of Scope 항목 #9 '에이전트 간 Semantic Cache 공유 (별도 설계 필요)'를 봤는데, 현재 Story 15.3 DB 스키마(line 329)를 보면 `semantic_cache` 테이블에 `agent_id` 컬럼이 없다. `company_id`만 있다. 이 말은 동일 companyId 내 모든 에이전트가 이미 Semantic Cache를 공유한다는 뜻이다. 비서실장 에이전트의 'CEO에게 드리는 주간 보고 방법'과 CIO 에이전트의 유사한 쿼리가 같은 캐시를 공유하면, 잘못된 에이전트 답변이 나올 수 있다. Out of Scope가 미래 설계 문제가 아니라 현재 설계의 미명시 기본값 문제다."

**Mary (BA):** "7개 대표 도구에 withCache()를 적용한다고 했는데, v1 feature spec에는 125개+ 도구가 있다. 7개 적용하고 나머지 118개+ 도구는 어떻게 되나? '미적용 = 기존 동작 유지'인지 '미적용 = 캐시 없음 (intentionally)'인지 명시가 없다. 개발자가 새 도구를 추가할 때 기본 TTL 정책도 없다. 나중에 법무팀이 새 도구를 추가하면 자동으로 캐시가 걸리나? 아니면 항상 수동으로 래퍼를 추가해야 하나? 이 결정이 없으면 Epic 16, 17에서 도구 추가할 때마다 누군가가 '캐시 추가해야 하나요?'를 물어보게 된다."

---

## Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | **HIGH** | Sally (UX) | **Semantic Cache 에이전트 간 공유가 Out of Scope이지만 현재 구현은 이미 공유됨** — Line 351: "에이전트 간 Semantic Cache 공유 (별도 설계 필요)"를 Out of Scope로 분류. 그러나 Story 15.3 스키마(line 329): `semantic_cache` 테이블에 `agent_id` 컬럼 없음, `company_id`만 있음. 동일 companyId 내 비서실장과 CIO가 유사한 쿼리를 하면 서로의 캐시 응답을 가져간다. Out of Scope 항목이 "미래에 추가할 격리 기능"이 아니라 "현재 설계의 암묵적 기본값(에이전트 간 공유됨)"이다. 개발자가 이를 인지하지 못하면 에이전트 A의 전문 분야 답변이 에이전트 B의 쿼리에 반환되는 버그로 연결될 수 있음. | Out of Scope 항목 #9를 수정: "에이전트별 Semantic Cache 격리 — **현재 구현: 동일 companyId 에이전트 간 캐시 공유됨** (`agent_id` 컬럼 없음, 의도적 설계). 에이전트별 격리 필요 시 Future에서 `agent_id` 컬럼 추가." 의도적 공유라면 Core Features에도 명시 필요. |
| 2 | **HIGH** | John (PM) | **MVP Done 기준에 KPI-2 (비용 절감 실측) 누락** — Lines 358-369: MVP Success Criteria에 KPI-1 (캐시 활성화), KPI-3 (Tool Cache 히트율)은 있지만 KPI-2 (Soul 토큰 비용 절감율 ≥ 60%, 1주) 없음. "캐시가 켜졌다"와 "비용이 실제로 줄었다"는 서로 다른 검증이다. KPI-1만으로는 캐시가 켜진 것만 증명되고, 실제 비용 절감이 달성됐는지 알 수 없다. Epic의 핵심 비즈니스 목표($27→$5~8/월)가 Done 기준에 없으면 사업적 가치 미검증 상태로 완료 선언됨. | MVP Success Criteria에 추가: "KPI-2 비용 절감 초기 검증 ∣ cost_tracker 로그 1주 집계 ∣ Soul 토큰 실효 절감율 ≥ 60% (ephemeral TTL 5분, 세션 내 히트율 × 85%)" |
| 3 | **HIGH** | Mary (BA) | **7개 도구 이외 100+ 도구 캐시 정책 미명시** — Line 323: "7개 대표 도구 핸들러에 withCache() 적용"이라고 했는데, v1에는 125개+ 도구가 있다. 나머지 118개+ 도구에 대해: (a) 미적용 = "캐시 없음 (기존 동작 유지)"인지 명시 없음. (b) 미래 도구 추가 시 기본 TTL 정책 없음 — 개발자가 새 도구 추가 시 캐시 적용 여부를 매번 수동 결정해야 함. | Out of Scope 또는 Core Features에 추가: "7개 미지정 도구: 기본 동작 = 캐시 없음 (withCache 미적용). 새 도구 추가 시 TTL 0으로 기본 설정, 명시적 TTL 설정 시만 캐시 활성화. TTL 정책 등록 테이블 `lib/tool-cache-config.ts`에 관리 권장." |
| 6 | **CRITICAL** | Critic-B (코드 확인) | **VECTOR(1536) 오류 — Epic 10 실제 차원은 768** — Line 329: `query_embedding VECTOR(1536)`. Brief가 "Gemini Embedding 재활용 (Epic 10 인프라)"라고 명시했으면서 OpenAI ada-002 차원값(1536)을 기재. 실제: `packages/server/src/db/schema.ts:1555` → `vector(768)`, `embedding-service.ts` → `text-embedding-004` (768차원). 이 스키마로 마이그레이션 실행 시 Epic 10의 768차원 embedding과 차원 불일치 → pgvector cosine similarity 계산 오류 또는 쿼리 실패. | Line 329 수정: `query_embedding VECTOR(768)` (text-embedding-004 차원). |
| 4 | **LOW** | Mary (BA) | **Phase 6 LLM 모델 vs 임베딩 모델 혼용** — Line 390: "LLM 모델 교체 시 자동 무효화... 모델 변경 → 임베딩 공간 변화". 이는 **임베딩 모델** 교체 시의 이야기다. Claude LLM 모델 교체(예: Sonnet → Opus)는 임베딩 공간에 영향 없으므로 Semantic Cache 무효화 불필요. 임베딩 모델(현재: Gemini Embedding) 교체 시만 캐시 무효화 필요. 두 개를 혼용하면 불필요한 캐시 무효화 로직이 생길 수 있음. | "LLM 모델 교체" → "임베딩 모델 교체 시 (현재: Gemini Embedding) 자동 무효화"로 수정. |
| 5 | **LOW** | John (PM) | **Phase 4 Redis 전환 트리거 불명확** — Line 378: "에이전트 50명+ 확장 시"와 "다중 서버 배포 시"가 병렬로 적혀있다. 두 트리거는 독립적일 수 있다 — 에이전트 50명이어도 단일 서버면 Redis 불필요; 다중 서버여도 에이전트 10명이면 Redis가 필요할 수 있음. | 트리거를 명확히 분리: "**다중 서버 배포 시** (에이전트 수 무관) Tool Cache + Semantic Cache를 Redis로 이전. 단일 서버에서는 50명+ 에이전트도 인메모리 Map으로 충분 (< 100MB 유지)." |

---

## Cross-Talk with Critic-B

**Critic-B 발견 (코드 직접 확인):**
- `packages/server/src/db/schema.ts:1555`: `embedding: vector('embedding', { dimensions: 768 })`
- `packages/server/src/db/migrations/0049_pgvector-extension.sql:6`: `embedding vector(768)`
- `packages/server/src/services/embedding-service.ts:8`: `EMBEDDING_MODEL = 'text-embedding-004'` (Gemini, 768차원)

**Brief line 329 오류: `query_embedding VECTOR(1536)` → 실제 Gemini text-embedding-004 = 768차원**
1536은 OpenAI ada-002 차원값. Brief가 "Gemini Embedding 재활용 (Epic 10 인프라)"라고 명시했으면서 OpenAI 차원값을 기재한 것은 직접적 모순. 이 스키마로 DB 마이그레이션 실행 시 기존 Epic 10 embedding 컬럼(768)과 차원 불일치 → pgvector cosine similarity 계산 불가.

**→ CRITICAL 이슈. Issue #6으로 추가.**

---

## v1-feature-spec Coverage Check

- Features verified:
  - v1 125+ 도구 시스템 → Story 15.2의 7개 대표 도구 선택이 v1 핵심 도구(kr_stock, search_news, search_web, dart_api, law_search) 포함 ✅
  - v1 Soul 시스템(웹 UI 편집 가능) → Story 15.1 대상이 "모든 에이전트" Soul임 ✅
  - v1 `/전체` 동시 6-에이전트 → Story 15.2 Tool Cache로 커버됨 (동일 파라미터 캐시 공유) ✅
  - v1 CEO 직접 명령 패턴 → Future Vision Phase 5 "비용 예측 대시보드"(line 391)가 운영 관리자 의사결정 지원으로 연결 ✅

---

## Verification Results (Post-Fix)

| Issue | Status | Notes |
|-------|--------|-------|
| [CRITICAL] VECTOR(1536) → 768 | ✅ RESOLVED | Line 330: `VECTOR(768)` + schema.ts:1555 참조 명시 |
| [HIGH] 에이전트 간 캐시 공유 암묵적 | ✅ RESOLVED | Line 354: "의도적 설계, 히트율 유리, 격리 필요 시 Phase X agent_id" |
| [HIGH] MVP Done에 KPI-2 없음 | ✅ RESOLVED | Line 372: 실효 절감율 ≥ 60% Done 기준 추가 |
| [HIGH] 100+ 도구 캐시 정책 미명시 | ✅ RESOLVED | Line 324: 기본 정책 + tool-cache-config.ts 등록 방식 명시 |
| [LOW] Phase 6 LLM vs 임베딩 모델 | ✅ RESOLVED | Line 394: "임베딩 모델 교체 시" + LLM 교체는 무효화 불필요 명시 |
| [LOW] Phase 4 Redis 트리거 불명확 | ✅ RESOLVED | Line 381-382: 다중 서버 배포 시 (에이전트 수 무관) 명시 |

**Final Score: 9.5/10**
- 6개 이슈 전부 해결. 추가 개선(TTL WHERE 절, stale-on-error 분리, 영향 패키지, db/scoped-query.ts 확장)까지 포함.
- -0.5점: `lib/tool-cache-config.ts`가 별도 신규 파일인지 `lib/tool-cache.ts` 내 포함인지 불명확. Story 파일에서 명시 권장.

---

- Gaps found:
  - **v1에는 `generate_image`와 `real_web_search` 같은 창의적/실시간 도구들이 TTL=0 (캐시 없음)으로 처리됨.** Story 15.2 Core Features에는 `get_current_time`(0)과 `generate_image`(0) 명시. 그러나 Out of Scope 표에 이 결정의 원칙("실시간/창의적 도구 = 캐시 없음")이 명시되지 않아 미래 도구 추가 시 가이드라인 부재.
