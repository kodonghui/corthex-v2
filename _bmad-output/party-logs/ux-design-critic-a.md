# CRITIC-A Review: UX Design Addendum Section 1~4 (Epic 15 — 3-Layer Caching)

**Reviewer:** CRITIC-A (John/PM, Sally/UX, Mary/BA)
**File reviewed:** `_bmad-output/planning-artifacts/epic-15-ux-design.md`
**Date:** 2026-03-12

---

## Issue 1 (Mary/BA): ON 상태 "적용 대상: 이 회사의 모든 에이전트" — FR-CACHE-3.11과 불일치 [HIGH]

**위치:** Section 1.2 ON 상태 와이어프레임 line 76

```
TTL: 24시간 | 유사도 임계값: 95% | 적용 대상: 이 회사의 모든 에이전트
```

**문제:** FR-CACHE-3.11은 Semantic Cache가 "동일 companyId 내 에이전트 간 공유"되며, 공유 주체는 **사용자**(user)라고 정의: "같은 회사의 모든 사용자가 캐시를 공유합니다." 툴팁(line 108)도 "공유 범위: 이 회사의 모든 사용자"로 올바르게 표현되어 있다.

"적용 대상: 이 회사의 모든 에이전트"는 두 가지 오해를 유발한다:
1. Admin이 이 토글을 ON하면 "이 회사의 모든 에이전트가 영향을 받는다"는 오해 → 실제로는 이 에이전트만 ON/OFF
2. "에이전트 간 공유"(백엔드 구조)와 "사용자 간 공유"(사용자 경험)의 혼동 — Admin이 이해해야 할 것은 사용자 경험(같은 회사 직원들이 캐시 공유)

**수정 방향:** `적용 대상: 이 회사의 모든 에이전트` → `캐시 공유: 동일 회사 내 모든 사용자 대상` 또는 툴팁과 동일하게 "이 회사의 모든 사용자가 공유"로 통일.

---

## Issue 2 (Mary/BA): Section 1.4 경고 메시지 TTL 오류 — Semantic Cache 경고에 Tool Cache TTL 노출 [HIGH]

**위치:** Section 1.4 실시간 도구 경고 텍스트 (lines 139~141)

```
⚠ 이 에이전트는 실시간 도구(kr_stock, search_news)를 사용합니다.
  캐싱 활성화 시 최대 TTL(kr_stock: 1분, search_news: 15분) 내
  오래된 응답이 반환될 수 있습니다.
```

**문제:** 이 토글은 **Semantic Cache** 토글이다. Semantic Cache TTL은 **24시간(고정, FR-CACHE-3.9)**. Tool Cache TTL(kr_stock: 1분, search_news: 15분)은 **별개 레이어의 개념**으로, 도구 결과 캐싱 시간을 의미한다.

경고가 "최대 1분 이내 오래된 응답"이라고 말하지만, 실제로는 "Semantic Cache 활성화 시 최대 **24시간** 이전에 생성된 LLM 응답이 반환될 수 있음"이 정확한 내용이다. Tool Cache TTL이 1분이더라도 그 도구 결과를 포함한 LLM 응답 자체는 Semantic Cache에 24시간 동안 저장된다. Admin에게 "1분" 표시는 잘못된 안전감을 제공한다.

**수정 방향:**
```
⚠ 이 에이전트는 실시간 도구(kr_stock, search_news)를 사용합니다.
  캐싱 활성화 시 최대 24시간 이전 응답이 반환될 수 있습니다.
  실시간 정확성이 중요한 에이전트는 캐싱을 OFF로 설정하세요.
```

Tool Cache TTL(1분/15분)은 Semantic Cache 경고와 무관 — 별도 설명이 필요하다면 툴팁에서 구분 설명.

---

## Issue 3 (Sally/UX): 에이전트 유형 감지 조건 — PRD Appendix F 7개 유형 중 4개 미반영 + 조건 중복 우선순위 없음 [MEDIUM]

**위치:** Section 1.4 권장/비권장 표시 테이블 (lines 143~148)

**현재 UX 설계 (3가지 조건):**

| 조건 | 표시 |
|------|------|
| 도구 없음 + 일반 분석 에이전트 | ✓ 권장 |
| 실시간 도구(kr_stock, search_news) | ⚠ |
| generate_image 또는 get_current_time | ✗ 비권장 |

**PRD Appendix F (7개 유형):**

| PRD 유형 | UX 커버 여부 |
|----------|-------------|
| FAQ/정책 안내 에이전트 → true | ✅ ("도구 없음" 조건으로 근사 커버) |
| 보고서 양식/규정 안내 → true | ✅ (동일) |
| 주가 조회 에이전트 → false | ✅ (kr_stock 조건) |
| 뉴스 브리핑 에이전트 → false | ✅ (search_news 조건) |
| 이미지 생성 에이전트 → false | ✅ (generate_image 조건) |
| 다단계 핸드오프 오케스트레이터 → false | ❌ **미반영** — 도구 목록만으로 감지 불가 |
| Library 업데이트 즉각 반영 필요 에이전트 → false | ❌ **미반영** — 속성 없음, 도구 목록으로 판단 불가 |

추가 문제: 조건 중복 케이스 처리 없음. 예) `generate_image + kr_stock` 동시 보유 에이전트 → ✗와 ⚠ 중 어느 메시지를 표시? 우선순위 미정의.

**수정 방향:**
1. 3개 조건 테이블에 우선순위 규칙 추가: `✗ > ⚠ > ✓` (가장 강한 경고 우선)
2. "다단계 핸드오프 오케스트레이터"와 "Library 즉각 반영 필요" 유형은 자동 감지 불가임을 명시 — Admin 수동 판단 필요 안내 텍스트 추가: "자동 감지는 도구 목록 기반입니다. 복잡한 오케스트레이터는 수동으로 OFF 설정을 권장합니다."
3. `get_current_time`이 ✗ 조건에 포함되어 있으나 PRD Appendix F에는 명시되지 않음 — 일관성 체크 필요

---

## Issue 4 (John/PM): Deferred 배지 섹션 — SSE 필드 Deferred 처리 시 Story 15.3 스코프 경계 명시 필요 [LOW]

**위치:** Section 2.1 (line 179)

```
Phase 5+ 데이터 연결: SSE message 이벤트에 cacheHit: boolean, similarity: number 필드 추가 필요 (현재 미전송).
```

**문제:** Story 15.3 (Semantic Cache 구현)에서 `agent-loop.ts`가 `checkSemanticCache()` 히트 여부를 이미 알고 있다. 이때 SSE 이벤트에 `cacheHit` 필드를 추가하지 않으면, Phase 5+ 배지 구현 시 SSE 스트리밍 구조 전체를 재검토해야 한다.

Story 15.3 스코프에서 "SSE 이벤트에 cacheHit 필드를 포함하되 프론트엔드에서 배지는 미표시(Deferred)"로 분리하면 Phase 5+ 배지 구현 비용이 최소화된다.

**수정 방향 (권고):** Section 2.1 텍스트에 다음 내용 추가:
"Story 15.3 구현 시 SSE `message` 이벤트에 `cacheHit: boolean`, `similarity?: number` 필드를 서버에서 전송하되, 프론트엔드 배지 렌더링은 Phase 5+로 Deferred. 필드 전송 누락 시 Phase 5+ 배지 구현 시 SSE 구조 변경 필요."

이 수정은 UX Design 문서의 Story 15.3 스코프 명시 목적으로, PRD FR-CACHE-3 내용 변경은 아님.

---

## 긍정 검증 항목

| 항목 | 결과 |
|------|------|
| 토글 위치 — Soul 아래, 도구 권한 위 (FR-CACHE-3.3 준수) | ✅ 논리적 순서 타당 |
| 기본값 OFF (FR-CACHE-3.2 DEFAULT FALSE) | ✅ 일치 |
| ON→OFF 확인 모달 — "24시간 자연 만료" 명시 (FR-CACHE-3.3) | ✅ 정확 |
| OFF→ON 즉시 전환 (확인 모달 없음) | ✅ 적절한 UX 결정 |
| 배지/대시보드 Deferred Phase 5+ (FR-CACHE-1.5 Admin UI 미노출) | ✅ PRD와 일치 |
| Tool/Prompt Cache 히트 배지 없음 (서버 내부 최적화) | ✅ 올바른 UX 결정 |
| Section 4 UX 결정 테이블 포맷 | ✅ ux-design-spec 스타일 일치 |
| companyId 공유 범위 툴팁 명시 (FR-CACHE-3.11) | ✅ 툴팁 내용 정확 (단, ON 상태 텍스트와 불일치 → Issue 1) |

---

## 요약

| # | 역할 | 심각도 | 이슈 |
|---|------|--------|------|
| 1 | Mary/BA | HIGH | ON 상태 "적용 대상: 이 회사의 모든 에이전트" — FR-CACHE-3.11 "모든 사용자"와 불일치 |
| 2 | Mary/BA | HIGH | Section 1.4 경고 TTL 오류 — Semantic Cache 경고에 Tool Cache TTL(1분/15분) 표시, 실제는 24시간 |
| 3 | Sally/UX | MEDIUM | 에이전트 유형 감지 조건 — PRD Appendix F 7개 중 5개만 커버, 조건 중복 우선순위 미정의 |
| 4 | John/PM | LOW | Deferred 배지 SSE 필드 — Story 15.3 스코프 경계 명시 권고 (Phase 5+ 구현 비용 최소화) |
