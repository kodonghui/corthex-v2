# Context Snapshot: Epic 15 PRD Addendum — Section 2 Complete

**날짜**: 2026-03-12
**작업**: Stage 1 PRD — Section 2: Epic 15 Non-Functional Requirements
**상태**: 승인 완료 (critic-a 9/10, critic-b 9/10, 평균 9.0)

## 완료된 내용

**출력 파일**: `_bmad-output/planning-artifacts/epic-15-prd-addendum.md` (Section 2 추가)

### NFR 목록 (최종)

**NFR-CACHE-P (성능, 7개):**
- P1: Prompt Cache TTFT ≥ 85% 단축 (P0)
- P2: Semantic Cache 히트 시 응답 ≤ 100ms (P0)
- P3: Tool Cache 히트 시 외부 API 호출 0회 (P0)
- P4: Prompt Cache 히트율 ≥ 70% (동일 에이전트 5분 내 재호출 세션)
- P5: Tool Cache 히트율 초기 ≥ 20% → 30일 ≥ 40%
- P6: Semantic Cache 히트율 초기 ≥ 15% → 30일 ≥ 40%
- P7: Semantic Cache DB 조회 ≤ 50ms (실제 Neon DB 통합 테스트, mock 금지)

**NFR-CACHE-S (보안, 4개):**
- S1: Tool Cache companyId 격리 — 교차 히트 0건 (P0)
- S2: Semantic Cache companyId 격리 — company_id = $1 조건 필수 (P0)
- S3: saveToSemanticCache 저장 전 CREDENTIAL_PATTERNS 정규식 sanitizedResponse 저장 — raw LLM 응답 직접 저장 금지 (P0) [Stop Hook 참조 제거 — Hook은 LLM 응답 콘텐츠 미처리]
- S4: Tool Cache 키 companyId 누락 시 원본 함수 실행 (P0)

**NFR-CACHE-SC (확장성, 4개):**
- SC1: Tool Cache ≤ 100MB 만재 시 (추정 — 평균 10KB/항목 가정, 실측 후 조정)
- SC2: LRU 교체 ≤ 1ms
- SC3: Cleanup 타이머 블로킹 ≤ 10ms
- SC4: Tool Cache 메모리 증가 = 에이전트 수 아닌 고유 파라미터 수에 비례 (에이전트 수 선형 비례 없음)

**NFR-CACHE-R (신뢰성, 4개):**
- R1: Tool Cache graceful fallback — 예외 시 원본 함수 실행, 세션 중단 0건 (P0)
- R2: Semantic Cache graceful fallback (P0)
- R3: 캐시 3레이어 전부 비활성 시 에이전트 정상 응답 (P0)
- R4: PoC 실패 시 messages.create() 대안 (P0)

**NFR-CACHE-O (운영, 6개):**
- O1: Tool Cache hit/miss 로깅 100% (P0)
- O2: Semantic Cache hit/miss 로깅 100% + similarity 값 (P0)
- O3: cost-tracker 캐시 비용 정확도 ≤ 1% 오차
- O4: 메모리 ≥ 100MB 시 warn 로그 + LRU 즉시 정리
- O5: semantic_cache 만료 행 일일 정리 (ARGOS 크론, deletedRows 로깅)
- O6: Semantic Cache 히트 응답 품질 민원 0% 증가율 (Epic 12 A/B, 배포 2주 후)

## 주요 결정 사항

- NFR-CACHE-S3: Stop Hook은 usage 토큰 데이터만 수신, LLM 응답 콘텐츠 sanitize 불가 → saveToSemanticCache 내부에서 직접 CREDENTIAL_PATTERNS 정규식 적용
- NFR-CACHE-O5 (구 TypeScript 빌드): CI 정책이지 제품 NFR 아님 → 삭제
- NFR-CACHE-O5/O6 신규 추가: semantic_cache DB 정리(일일 크론) + 응답 품질 무결성

## 다음 단계

- team-lead의 다음 섹션 지시 대기
