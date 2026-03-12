# CRITIC-A Review: Readiness Report v2 (보강 후 재검토)

**Reviewer:** CRITIC-A (John/PM, Sally/UX, Mary/BA)
**File reviewed:** `_bmad-output/planning-artifacts/epic-15-readiness.md` (섹션 5~8 신규 추가본)
**Date:** 2026-03-12

---

## 전반 평가

섹션 1~4 수정사항 반영 확인:
- NFR 커버리지 테이블 "NFR 커버리지: 25/25" ✅ (P4, P5 추가됨)
- WARN-1 → R-1 HIGH로 상향됨 ✅
- WARN-5 CREDENTIAL_PATTERNS → R-3 MEDIUM으로 반영됨 ✅
- 섹션 5 (Architecture Consistency), 6 (Dependency Check), 7 (Risk Assessment), 8 (Final Assessment) 신규 — 구조 적절

---

## 핵심 질문 1 (CRITICAL): R-2 — Story 15.3 파일 자체 수정 必수

**Writer 질문:** Story 15.3 Dev Notes `getEmbedding()` 오기 — 스토리 파일 자체 수정 필요한지, 아니면 Readiness Report 경고만으로 충분한지?

**CRITIC-A 답변: 스토리 파일 직접 수정 REQUIRED.**

Readiness Report 경고만으로는 불충분한 이유:

Story 15.3에서 `getEmbedding()` 참조는 **2곳**:
1. **Task 3 체크리스트 (line 119)**:
   ```
   - [ ] Gemini `text-embedding-004` 재활용: Epic 10의 `getEmbedding(text)` → `number[]` (768차원)
   ```
   → 개발자가 Task 체크리스트를 따라 직접 `getEmbedding(text)` 호출 코드를 작성하게 됨

2. **Dev Notes (line 213)**:
   ```
   Epic 10.2의 `getEmbedding()` 함수 위치 확인 (`packages/server/src/lib/embedding.ts` 또는 유사 경로)
   ```
   → 잘못된 파일 경로(`lib/embedding.ts`)까지 안내 — 실제 위치는 `services/embedding-service.ts`

**함수 시그니처 차이가 핵심**: `getEmbedding(text)` vs `generateEmbedding(apiKey, text)`. `apiKey` 파라미터가 빠진 호출은 **컴파일 오류 + 런타임 에러** 양쪽 유발. Readiness Report를 구현 중에 별도로 참조하는 개발자는 드물다 — **Story 파일이 유일한 실질 레퍼런스**.

**Story 15.3 수정 내용 (Task 3 + Dev Notes)**:

Task 3 (line 119):
```
기존: Epic 10의 `getEmbedding(text)` → `number[]` (768차원)
수정: `generateEmbedding(apiKey, text)` from `services/embedding-service.ts` → `number[] | null` (768차원)
       apiKey 조회: semantic-search.ts의 Google credential 조회 패턴 참조
```

Dev Notes (line 213):
```
기존: "Epic 10.2의 `getEmbedding()` 함수 위치 확인 (`packages/server/src/lib/embedding.ts` 또는 유사 경로)"
수정: "`generateEmbedding(apiKey, text)`: `packages/server/src/services/embedding-service.ts:45-63`
       - 반환: `number[] | null` (null 시 graceful fallback 필요 — NFR-CACHE-R2)
       - apiKey 조회 패턴: `services/semantic-search.ts` 내 Google credential 조회 참조"
```

---

## 핵심 질문 2 (LOW): Epic 14 Story 파일 status "backlog" → READY 판정 영향 없음

**Writer 질문:** Epic 14 Story 파일 status가 "backlog"인 상태 — "READY" 판정에 영향을 줘야 하는지?

**CRITIC-A 답변: READY 판정에 영향 없음.**

근거:
- git `ff5880f feat(epic-14): wire engine hooks + fix E8 boundary + remove dual-engine` — 코드 완료 확인
- Readiness Report 섹션 6.1에서 직접 코드베이스 검증 완료 (`engine/agent-loop.ts` Hook 5개 import 확인)
- Story 파일 status는 문서 관리 레이어이며 구현 블로커 아님

**권고 (단, 구현 전 처리 권장)**: Epic 14 Story 파일 3개의 status를 `done`으로 업데이트하는 것이 향후 스프린트 추적에 유리. 단, Epic 15 구현 시작을 블로킹할 필요 없음 — **문서 행정 처리, LOW priority**.

---

## 핵심 질문 3: 누락된 체크 항목

### 이슈 1 (LOW): 섹션 2 헤더 "(20개)" 미업데이트

**위치:** 섹션 2 `### Non-Functional Requirements (20개)` (line 95)

섹션 2 테이블 본문과 커버리지 결론은 "25/25"로 수정되었으나, **헤더만 여전히 "(20개)"**. 단순 오타이지만 불일치.

수정: `### Non-Functional Requirements (20개)` → `### Non-Functional Requirements (25개)`

### 이슈 2 (LOW): 섹션 6 Dependency Check에 15.2→15.3 내부 소프트 의존성 미언급

**위치:** 섹션 6 (Dependency Check)

섹션 6은 Epic 14 외부 의존성만 다루고, **15.2→15.3 Task 5 소프트 의존성** (`getCacheRecommendation()`)은 언급 없음. CRITIC-A Issue 4 (epics-stories 리뷰)에서 이미 식별했고 스토리 파일에 반영됐으나, Readiness Report가 이를 명시적으로 추적하지 않음.

권고: 섹션 6 끝에 추가:
```
### 6.5 Epic 15 내부 스토리 의존성
- 15.1 → 15.3 (블로킹 전체): 15.3 Task 4 agent-loop.ts L1 통합은 15.1 완료 후 시작
- 15.2 → 15.3 Task 5 (소프트): getCacheRecommendation() 미완료 시 Task 5에서 함수 스텁 처리 후 연동
```

---

## 긍정 검증: 섹션 5~8 신규 내용

| 항목 | 결과 |
|------|------|
| D17~D21 전부 정확한 Task 레벨 추적 | ✅ |
| Epic 14 코드 git ff5880f 직접 확인 | ✅ |
| pgvector `generateEmbedding(apiKey, text)` 정확한 함수명+경로 확인 (섹션 6.2) | ✅ |
| SDK `0.2.72` exact pin 확인 | ✅ |
| R-1~R-6 위험 항목 체계적 정리 | ✅ |
| R-2 (generateEmbedding 오기) 정확히 식별 | ✅ |
| R-4 (도구명 kebab vs underscore) 식별 | ✅ |
| Final Assessment READY 판정 근거 명확 | ✅ |
| 권고 구현 순서 Phase A/B 명시 | ✅ |
| Epic 15 완료 기준 7개 명시 | ✅ |
| CREDENTIAL_PATTERNS `PATTERNS` 실제명 확인 (섹션 6.4) | ✅ |
| engine-boundary-check.sh 경로 확인 | ✅ |

---

## 최종 판정

**READY 판정: ✅ 유지 (조건부 수정 2건)**

| 조치 | 우선순위 | 처리 주체 |
|-----|---------|---------|
| Story 15.3 Task 3 + Dev Notes `getEmbedding()` → `generateEmbedding(apiKey, text)` 수정 | **필수 (구현 전)** | Writer |
| 섹션 2 헤더 "(20개)" → "(25개)" 수정 | LOW | Writer |
| 섹션 6.5 내부 소프트 의존성 추가 | LOW | Writer |
| Epic 14 Story 파일 status `done` 업데이트 | LOW (문서 행정) | Team Lead 결정 |

**핵심**: Story 15.3 파일 직접 수정 완료 후 → **Epic 15 구현 START 가능**
