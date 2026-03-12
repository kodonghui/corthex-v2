# CRITIC-A Review: Epic 15 Readiness Report

**Reviewer:** CRITIC-A (John/PM, Sally/UX, Mary/BA)
**File reviewed:** `_bmad-output/planning-artifacts/epic-15-readiness.md`
**Date:** 2026-03-12

---

## Issue 1 (Mary/BA — HIGH): NFR 개수 오류 — "총 20개" vs 실제 25개

**위치:** Step 2 (FR/NFR 완전성 검증), Step 3 (NFR 매핑 테이블)

**문제:**

Step 2:
> "NFR: 총 20개 (P1~P7, S1~S4, SC1~SC4, R1~R4, O1~O6)"

실제 카운트:
| 접두사 | 범위 | 개수 |
|--------|------|------|
| P (Performance) | P1~P7 | **7개** |
| S (Security) | S1~S4 | **4개** |
| SC (Scalability) | SC1~SC4 | **4개** |
| R (Resilience) | R1~R4 | **4개** |
| O (Observability) | O1~O6 | **6개** |
| **합계** | | **25개** |

"총 20개"는 계산 오류. 7+4+4+4+6 = **25개**.

**Step 3 NFR 매핑 테이블에서 P4, P5 완전 누락:**

PRD에서 확인된 존재하지만 매핑에 없는 NFR:
- **NFR-CACHE-P4**: Prompt Cache 히트율 ≥ 70% (P1 priority) — Story 15.1 cost-tracker 로그(`cache_read_input_tokens > 0`)로 측정 가능
- **NFR-CACHE-P5**: Tool Cache 히트율 ≥ 20% (초기) → ≥ 40% (30일 후) (P1 priority) — Story 15.2 `tool_cache_hit`/`tool_cache_miss` 로그로 측정 가능

"NFR 20/20 (100%)" 주장은 사실상 "NFR 23/25 (92%)" — P4, P5 할당 누락.

**수정 방향:**
1. Step 2 "총 20개" → "총 25개"로 수정
2. Step 3 NFR 매핑 테이블에 P4, P5 행 추가:
   ```
   | NFR-CACHE-P4 | Prompt Cache 히트율 ≥ 70% | 15.1 (cost-tracker 로그 → KPI-3 측정) |
   | NFR-CACHE-P5 | Tool Cache 히트율 ≥ 20%→40% | 15.2 (tool_cache_hit/miss 로그 → KPI-2 측정) |
   ```
3. 커버리지: "NFR 20/20 (100%)" → "NFR 25/25 (100%)"

**참고:** P4/P5는 측정 NFR(히트율 로깅)이므로 구현 자체를 블로킹하지 않음. 이미 15.1, 15.2 구현으로 측정 가능. READY 판정 유지 가능하나 정확성 수정 필요.

---

## Issue 2 (John/PM — MEDIUM): WARN-1 심각도 MEDIUM → HIGH 상향 필요

**위치:** Step 5 (WARN 목록), WARN-1

**문제:**

WARN-1: "경로 B 선택 시 Hook 파이프라인 단절 위험 (Hook 재구현 필요)"이 **MEDIUM**으로 분류됨.

그러나 Stage 4 Epics & Stories 리뷰(Issue 2)에서 동일 이슈가 **HIGH**로 분류된 이유:
- `tool-permission-guard` (PreToolUse) 미발화 → **비허용 도구 무조건 실행** (보안 구멍)
- `credential-scrubber` (PostToolUse) 미발화 → **자격증명 마스킹 없음**
- `cost-tracker` (Stop Hook) 미발화 → **비용 추적 불가**

"경로 B 선택 시"라는 조건부이지만, PoC 실패 시 자동으로 경로 B가 선택됨. 보안 영향이 있는 이슈는 MEDIUM이 아닌 HIGH.

**수정 방향:** WARN-1 심각도 MEDIUM → **HIGH**로 변경. 괄호 설명에 보안 영향 명시:
> "WARN-1 (HIGH): 경로 B 선택 시 Hook 파이프라인 단절 위험 — tool-permission-guard/credential-scrubber/cost-tracker 전부 미발화 (보안+비용 영향). 경로 A PoC 성공이 최우선 목표."

---

## WARN-4 평가 (John/PM — MEDIUM, 적절): generateEmbedding() 함수명 + null 처리

**위치:** Step 5, WARN-4

**평가:**

WARN-4 내용:
> "Story 15.3 Dev Notes: `getEmbedding()` 사용 → 실제 `generateEmbedding(apiKey, text)` (services/embedding-service.ts). null 반환 시 graceful fallback 필요."

이 경고는 **타당하고 적절함**. 함수명 불일치는 컴파일 오류를 유발하며, null 처리 누락은 NFR-CACHE-R2(Semantic Cache 오류 시 세션 중단 0건) 위반.

**추가 확인 권고 (수정 불필요, 구현자 주의사항):**

권고 조치에 `ctx.getCredentials('google')` 패턴 언급 → 실제 코드베이스 패턴과 일치하는지 **구현 전** semantic-search.ts 참조로 확인 필요. `generateEmbedding(apiKey, text)` 호출 시 apiKey를 어떻게 전달하는지 기존 패턴을 따를 것.

**결론:** WARN-4 (MEDIUM) 분류 및 내용 유지. 추가 수정 불필요.

---

## WARN-5 평가 (Mary/BA — MEDIUM, 적절): PATTERNS → CREDENTIAL_PATTERNS

**위치:** Step 5, WARN-5

**평가:**

WARN-5 내용:
> "15-3 Dev Notes: `PATTERNS` → `CREDENTIAL_PATTERNS` 재명명 접근. credential-scrubber.ts 수정 필요"

이 접근은 **타당함**. Epics & Stories 리뷰 Issue 6의 최종 결정(lib/credential-patterns.ts 추출)과 일치.

**추가 명확화 (수정 권고):**

현재 WARN-5는 단순히 "재명명"으로 서술되어 있으나, 실제 접근은:
1. `engine/hooks/credential-scrubber.ts`의 CREDENTIAL_PATTERNS 상수 → `packages/server/src/lib/credential-patterns.ts`로 **추출**
2. credential-scrubber.ts, engine/semantic-cache.ts 양쪽에서 lib/credential-patterns.ts import

credential-scrubber.ts도 수정 대상임을 Story 15.3 Task 3 스코프에 명시 확인 필요.

**결론:** WARN-5 (MEDIUM) 유지. WARN 설명에 "credential-scrubber.ts → lib/credential-patterns.ts import로 변경 포함" 추가 권고.

---

## READY 판정 평가 (John/PM): 유지 가능

**현재 판정:** ✅ READY (조건부: WARN-1/2/3/4/5 해소 전제)

**CRITIC-A 평가:**

- **Issue 1 (NFR 개수 오류)**: P4/P5 미할당이지만 측정 메커니즘(로깅)은 15.1, 15.2 구현에 이미 포함. 구현 자체를 블로킹하지 않음 → READY 판정에 영향 없음
- **Issue 2 (WARN-1 심각도)**: 경로 A PoC 성공이 목표이며, Story 15.1 Task 1이 PoC를 첫 번째 Task로 지정 → 실패 시 팀 리드 재협의 프로세스 있음 → READY 판정에 영향 없음
- **WARN-4, WARN-5**: 이미 식별된 조건부 경고 — 구현자가 실제 코드베이스 확인 후 처리 가능

**결론:** "✅ READY" 판정 유지. 단, NFR 개수 수정(20→25) + P4/P5 매핑 추가 + WARN-1 심각도 HIGH 수정 선행 필요.

---

## 긍정 검증 항목

| 항목 | 결과 |
|------|------|
| FR 26개 전부 확인 (FR-CACHE-1.1~1.8, 2.1~2.8, 3.1~3.12) | ✅ |
| Step 3 NFR-CACHE-P4/P5 제외 23개 스토리 할당 완전성 | ✅ (P4/P5 추가 필요) |
| WARN 목록 (5개) 식별 및 해소 전제 READY 구조 | ✅ |
| WARN-4 generateEmbedding() 함수명 오류 사전 경고 | ✅ |
| WARN-5 CREDENTIAL_PATTERNS 공유 방식 경고 | ✅ |
| 3개 스토리 스코프 요약 정확성 | ✅ |
| 의존성 요약 (15.1→15.3 블로킹, 15.2 독립) | ✅ |
| WARN-2 (Redis TTL Keyspace Notification 미검증) | ✅ |
| WARN-3 (pgvector ivfflat 인덱스 1,000개 이상 성능) | ✅ |

---

## 요약

| # | 위치 | 심각도 | 이슈 |
|---|------|--------|------|
| 1 | Step 2/3 NFR 섹션 | HIGH | "총 20개" → 25개, P4/P5 매핑 누락, "20/20(100%)" → "25/25(100%)" |
| 2 | WARN-1 심각도 | MEDIUM | MEDIUM → HIGH 상향 (보안: credential-scrubber/tool-permission-guard 미발화) |
| WARN-4 | 내용 적절 | MEDIUM | 추가 확인 권고 (ctx.getCredentials 패턴 검증) — 수정 불필요 |
| WARN-5 | 내용 적절 | MEDIUM | 설명에 credential-scrubber.ts 수정 대상 명시 권고 |
