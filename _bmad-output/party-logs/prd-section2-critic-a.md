# CRITIC-A Review: PRD Addendum Section 2 (NFR-CACHE)

**Reviewer:** CRITIC-A (John/PM, Sally/UX, Mary/BA)
**File reviewed:** `_bmad-output/planning-artifacts/epic-15-prd-addendum.md` Section 2
**Reference:** `epic-15-caching-brief.md`, `prd.md` NFR 섹션
**Date:** 2026-03-12

---

## Issue 1 (John/PM): NFR-CACHE-S3 — Hook 선행 보장 요건이 구현 경로 없이 선언만 됨 [HIGH]

NFR-CACHE-S3은 "`saveToSemanticCache`는 Stop Hook 파이프라인(`output-redactor`, `credential-scrubber`) 완료 후에만 실행"을 P0으로 요구한다. 이 요건이 충족되려면 `agent-loop.ts`가 Stop Hook 이벤트 콜백 완료 후 반환된 필터링된 응답(raw LLM 출력이 아닌)을 `saveToSemanticCache`에 전달해야 한다. 그러나 FR-CACHE-3.8의 통합 순서("Prompt Cache 적용 LLM 호출 → saveToSemanticCache 저장")는 Hook 완료 후 어느 값을 저장하는지 명시하지 않았고, Appendix에도 이 제약이 없다. P0 보안 NFR인데 "어떻게 보장하는가"에 대한 구현 경로가 어디에도 없으면 TEA/QA 단계에서 검증 불가 상태가 된다. **수정 방향**: Appendix B 또는 FR-CACHE-3.8에 "saveToSemanticCache는 `for await` 이벤트 루프에서 Stop Hook 완료 이벤트 수신 후 반환된 `sanitizedResponse` 변수를 저장해야 함 (raw LLM stream 아님)" 명시.

---

## Issue 2 (Mary/BA): Semantic Cache DB 행 만료 정리 NFR 누락 [HIGH]

FR-CACHE-2.4는 Tool Cache 인메모리 Map을 위한 1분 주기 cleanup 타이머를 정의한다. 반면 `semantic_cache` DB 테이블 만료 행 정리(TTL 초과 `created_at` 레코드 삭제)에 대한 NFR이 없다. Semantic Cache 히트 여부는 쿼리 시 `created_at > NOW() - ttl_hours * INTERVAL '1 hour'` 조건으로 만료 행을 자동 제외하지만, 물리 삭제가 없으면 테이블이 무제한 성장한다. 에이전트 수 × 하루 쿼리 수 × 30일 운영 시 수십만 행 누적 가능 — hnsw 인덱스 재구성 비용 증가, DB 스토리지 초과. Brief의 BO-4(인프라 안정성)가 커버하는 영역인데 NFR-CACHE-SC/O 어디에도 없다. **추가 필요**: `NFR-CACHE-O6: semantic_cache 만료 행 정기 정리 — 매일 1회 `DELETE WHERE created_at < NOW() - ttl_hours * INTERVAL '1 hour'` 실행 (cron 또는 Drizzle scheduled task)`.

---

## Issue 3 (Sally/UX): NFR-CACHE-P7 측정 방법 — bun:test 레이블이 단위 테스트로 오독 가능 [MEDIUM]

NFR-CACHE-P7: "10,000 레코드 기준 cosine similarity 조회 ≤ 50ms — bun:test 타이머 (10,000 시드 데이터 삽입 후 조회 시간 측정)". `bun:test` 레이블만 보면 단위 테스트로 읽히지만, pgvector hnsw 인덱스 성능 측정은 실제 Neon DB(pgvector extension 활성화된 PostgreSQL)에서만 가능하다 — mock DB에서는 벡터 인덱스가 없어 측정 불가. 이를 "단위 테스트"로 구현하면 항상 pass(mock이 즉시 반환)하여 NFR이 무의미해진다. **수정 방향**: "bun:test 통합 테스트 (실제 Neon DB 연결, pgvector 활성화 환경 필수)" 또는 "CI 통합 테스트 — pgvector 활성화 Docker compose 환경"으로 측정 방법 명시.

---

## Issue 4 (John/PM): Semantic Cache 응답 품질 일관성 NFR 누락 — Brief BO-3 미커버 [MEDIUM]

Brief의 BO-3("캐싱 도입 후에도 응답 품질 동등 수준 유지 — Epic 12 A/B 테스트 프레임워크로 캐시 히트 응답 vs LLM 응답 품질 비교, 사용자 민원 증가율 0%")이 Section 2 NFR에 전혀 반영되지 않았다. NFR-CACHE-R3("3개 레이어 전부 비활성 시 서비스 연속성")은 있지만, 캐시 히트 응답의 품질이 LLM 응답과 동등한지에 대한 NFR이 없다. 특히 cosine similarity 0.95는 "거의 같은 질문"이지 "완전히 같은 질문"이 아니므로, 0.95~1.0 구간에서 미묘하게 다른 질문에 잘못된 캐시 응답이 반환될 수 있다. 이 리스크는 BO-3에서 명시적으로 다뤄졌음에도 NFR로 이어지지 않았다. **추가 필요**: `NFR-CACHE-O(N): Semantic Cache 응답 품질 — 캐시 히트 응답의 사용자 민원(Hub 피드백) 증가율 0% (배포 후 2주 Epic 12 A/B 비교 기준)`.

---

## Issue 5 (Mary/BA): NFR-CACHE-SC1 수치 출처 미검증 — "10,000 항목 × 평균 10KB" 가정 [LOW]

NFR-CACHE-SC1: "10,000 항목 만재 시 heapUsed 증가분 ≤ 100MB". 이 수치는 Brief에서 "평균 10KB/항목 × 10,000 = 100MB" 가정에서 나온다. 그러나 실제 도구 결과 크기는 도구마다 크게 다르다 — `search_web` 결과가 10KB라면 `generate_image` 결과(base64 이미지)는 수백KB. `generate_image`는 TTL=0이므로 캐시 제외지만, `dart_api`나 `law_search` 결과가 평균 10KB를 초과할 수 있다. NFR-CACHE-SC1의 100MB 목표가 실제 도구 결과 크기 분포 기반이 아닌 가정값이라는 점을 명시해야 한다. **수정 방향**: "100MB (추정 — 도구 결과 평균 10KB 가정; Story 15.2 구현 후 실측 조정 가능)" 또는 "100MB 초과 시 NFR-CACHE-O4 경보 + LRU 정리로 자동 조정".

---

## 요약

| # | 역할 | 심각도 | 이슈 |
|---|------|--------|------|
| 1 | John/PM | HIGH | NFR-CACHE-S3 P0 보안 NFR에 구현 경로/검증 방법 없음 |
| 2 | Mary/BA | HIGH | Semantic Cache DB 만료 행 정리 NFR 누락 (무제한 성장) |
| 3 | Sally/UX | MEDIUM | NFR-CACHE-P7 bun:test 레이블 오독 가능 (pgvector 실제 DB 필요) |
| 4 | John/PM | MEDIUM | BO-3 Semantic Cache 응답 품질 일관성 NFR 미반영 |
| 5 | Mary/BA | LOW | NFR-CACHE-SC1 100MB 수치가 가정값임을 미표시 |

**포맷 일관성**: ✅ prd.md NFR 테이블 포맷과 완전 일치 (Performance 6열, Security/SC/R/O 5열).
**우선순위 배분**: P0 배분 적절 (격리·fallback·빌드 통과 → P0, 히트율 목표 → P1).
**수치 Brief 정합성**: ✅ 85%/100ms/100MB/≥70%/≥40% 전부 Brief KPI와 일치.
