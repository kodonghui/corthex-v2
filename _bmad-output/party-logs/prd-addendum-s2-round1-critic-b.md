# CRITIC-B Review: PRD Addendum Section 2 — Epic 15 NFR
**Round:** 1 | **Reviewer:** CRITIC-B (Winston/Amelia/Quinn/Bob) | **Date:** 2026-03-12

---

## 포맷 일관성 확인

prd.md NFR 테이블 실제 확인 결과:
- 성능(Performance): 6컬럼 `ID | 요구사항 | 목표 | 측정 | 우선순위 | Phase` ← 측정 컬럼 있음
- 보안/확장성/운영 등: 5컬럼 `ID | 요구사항 | 목표 | 우선순위 | Phase` ← 측정 컬럼 없음

Addendum Section 2: 동일 패턴 적용 → **포맷 일관성 통과** ✅

수치 vs Brief 확인: TTFT ≥85%, ≤100ms, ≥20%→40%, ≥15%→40%, ≤100MB 모두 Brief KPI와 일치 ✅

---

## Issue 1 — NFR-CACHE-S3: Hook 파이프라인 순서가 아키텍처와 불일치 (High)
**[Winston — Architect 관점]**

NFR-CACHE-S3는 "`saveToSemanticCache`는 Stop Hook 파이프라인(`output-redactor`, `credential-scrubber`) 완료 후에만 실행"을 요구한다. 그러나 이는 architecture.md E2 Hook 시그니처와 불일치한다:

- `output-redactor` — PostToolUse Hook: `(ctx, toolName, toolOutput) => string`. **도구 출력값만 처리**, 최종 LLM 응답 텍스트를 처리하지 않음
- `credential-scrubber` — PreToolUse Hook: 도구 입력 필터링, 최종 응답과 무관
- Stop Hook: `(ctx, usage: { inputTokens, outputTokens }) => void` — **응답 콘텐츠를 받지 않음**, usage 데이터만 처리

`saveToSemanticCache`가 저장하는 `fullResponse`는 SDK 스트림에서 수집된 LLM raw text다. 이 텍스트는 어떤 Hook도 콘텐츠 레벨에서 sanitize하지 않는다 — "Stop Hook 완료 후 실행"해도 응답 내 credential이 제거되지 않음.

**실제 보안 위협:** LLM 응답에 포함된 API 키(`sk-ant-cli-*` 등)가 semantic_cache에 그대로 저장 → 다른 사용자가 유사 질문 시 credential 노출.

**요구사항:** NFR-CACHE-S3를 "saveToSemanticCache 저장 대상 `fullResponse`에 대해 `output-redactor`와 동등한 credential 마스킹을 적용한 후 저장한다. Stop Hook 완료 순서가 아닌, 콘텐츠 레벨 sanitization이 선행 조건"으로 수정해야 한다. 구현 방식(별도 마스킹 호출 vs PostToolUse hook 확장)은 Story 15.3에서 결정.

---

## Issue 2 — NFR-CACHE-SC4: "메모리 증가 없음" 표현이 기술적으로 부정확 (Medium)
**[Amelia — Dev 관점]**

NFR-CACHE-SC4: "에이전트 50명+ 운영 시 Tool Cache 메모리 증가 없음 (캐시 키가 companyId 단위 — 에이전트 수가 아닌 도구 호출 파라미터 기반)"

파라미터 기반 키 설계는 맞지만, 에이전트 50명이 각자 다른 파라미터로 `kr_stock`을 호출하면 50개 캐시 항목이 생긴다. "메모리 증가 없음"은 거짓 — 에이전트 수에 선형 비례하지는 않지만 증가는 한다. 또한 max 10,000 LRU 상한이 이미 있으므로 이 NFR은 사실상 "LRU가 상한을 보장한다"는 중복 선언이다.

**요구사항:** "에이전트 수 증가 자체가 캐시 항목 수에 직접 비례하지 않는다 — 동일 파라미터 재호출이 히트를 생성하므로 에이전트 수보다 호출 다양성이 캐시 크기를 결정한다. 10,000 항목 LRU 상한이 최악 케이스에서도 ≤100MB를 보장한다."로 수정.

---

## Issue 3 — NFR-CACHE-O5: TypeScript 빌드 통과는 NFR이 아닌 CI 프로세스 요건 (Medium)
**[Bob — SM 관점]**

NFR-CACHE-O5 "`npx tsc --noEmit` 에러 0건 (CI 배포 차단 방지)"는 CLAUDE.md에 이미 정의된 CI 프로세스 규칙이다. prd.md 기존 Operations NFR(NFR-O1~O8)에도 빌드 통과 항목은 없다 — 이건 NFR이 아니라 개발 컨벤션이다. NFR은 시스템 품질 속성을 정의하는 것이지 개발 프로세스를 정의하는 것이 아니다.

**요구사항:** NFR-CACHE-O5 삭제. 해당 요건은 CLAUDE.md와 Story 완료 정의(DoD)에 이미 존재하므로 NFR 테이블 중복 불필요.

---

## Issue 4 — NFR-CACHE-P7: bun:test에서 10,000 레코드 삽입은 단위 테스트가 아닌 통합 테스트 (Medium)
**[Quinn — QA 관점]**

NFR-CACHE-P7 측정 방법: "bun:test 타이머 (10,000 시드 데이터 삽입 후 조회 시간 측정)". 10,000 VECTOR(768) 행 삽입 + hnsw 인덱스 빌드는 CI 환경에서 수십 초 소요 — 단위 테스트 스위트에 포함하면 전체 `bun test` 실행 시간이 급격히 증가한다. 또한 테스트 환경의 pgvector 성능이 프로덕션과 다를 수 있어 ≤50ms 목표의 대표성이 낮다.

**요구사항:** 측정 방법을 "통합 테스트(`*.integration.test.ts`) — 10,000 시드 데이터 사전 삽입 환경에서 별도 실행"으로 수정. 또는 성능 목표를 CI가 아닌 배포 후 Anthropic 대시보드 + 서버 로그 측정으로 변경.

---

## Issue 5 — 누락 NFR: semantic_cache 테이블 만료 행 정리 정책 없음 (Low)
**[Winston — Architect 관점]**

Brief와 FR-CACHE-3.1~3.5의 `semantic_cache` 테이블은 TTL 기반 조회 필터(`created_at > NOW() - ttl_hours * INTERVAL '1 hour'`)를 사용하지만 만료된 행을 실제로 삭제하지 않는다. Tool Cache(FR-CACHE-2.4: 1분 주기 cleanup)와 달리 Semantic Cache는 DB 레벨 cleanup 정책이 없다 — 시간이 지날수록 semantic_cache 테이블이 무한 성장한다.

**요구사항:** NFR-CACHE-SC에 "semantic_cache 테이블 만료 행 정리: 24시간 주기로 `DELETE FROM semantic_cache WHERE created_at < NOW() - ttl_hours * INTERVAL '1 hour'` 실행 (ARGOS 크론잡 또는 Bun setInterval) — 미구현 시 pgvector 인덱스 크기 무한 증가 → 조회 성능 저하" 추가.

---

## 종합 평가

| 이슈 | 심각도 | 유형 |
|------|--------|------|
| Issue 1: NFR-CACHE-S3 Hook 순서 오류 | **High** (보안 + 아키텍처 오류) | 기술적 오류 |
| Issue 2: NFR-CACHE-SC4 표현 부정확 | **Medium** (잘못된 스펙) | 기술적 부정확 |
| Issue 3: NFR-CACHE-O5 프로세스 요건 혼입 | **Medium** (NFR 범위 초과) | 범위 위반 |
| Issue 4: NFR-CACHE-P7 테스트 방법 부적절 | **Medium** (QA 실행 가능성) | 측정 불일치 |
| Issue 5: semantic_cache 정리 정책 누락 | **Low** (장기 운영 리스크) | 요구사항 누락 |

**전체 판정:** 수정 필요. Issue 1(NFR-CACHE-S3)은 보안 NFR이므로 반드시 수정 후 재검토.
