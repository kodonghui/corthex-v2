# CRITIC-B 검증: PRD Addendum Section 2 v2
**라운드:** 수정 후 검증 | **날짜:** 2026-03-12

---

## 이슈별 수정 확인

| 이슈 | 확인 결과 | 비고 |
|------|----------|------|
| C-1 NFR-CACHE-S3 재작성 | ✅ PASS | Stop Hook 참조 완전 제거. "CREDENTIAL_PATTERNS 정규식 적용 sanitizedResponse만 저장, raw LLM 직접 저장 금지" 명시 |
| H-1 semantic_cache cleanup (O6) | ✅ PASS | 매일 1회 ARGOS 크론, deletedRows 로깅, SQL 조건 정확 |
| M-1 BO-3 품질 NFR (O7) | ✅ PASS | Epic 12 A/B 프레임워크 참조, 민원 0% 증가 측정 |
| M-2 SC4 표현 재작성 | ✅ PASS | "에이전트 수가 아닌 고유 파라미터 수에 비례" — 기술적으로 정확 |
| M-3 P7 테스트 방법 | ✅ PASS | "실제 Neon DB 연결, mock DB 금지" 명시 |
| L-1 O5 삭제 | ✅ PASS | O5 제거됨. O6/O7로 재번호 배치 |
| L-2 SC1 출처 | ✅ PASS | "(추정 — 평균 10KB/항목 가정; 실측 후 조정 가능)" 추가 |

---

## 잔여 관찰 (blocking 아님)

**O-1 (Acceptable):** NFR-CACHE-S3가 `CREDENTIAL_PATTERNS`라는 구체적 구현 상수명을 참조 — PRD NFR로는 다소 상세하지만 테스트 가능성을 위해 허용 범위. Story 15.3 구현 시 `credential-scrubber.ts`에서 해당 상수를 export해야 함을 명시적으로 알 수 있어 오히려 유용.

**O-2 (Positive):** NFR-CACHE-O6의 SQL `created_at < NOW() - ttl_hours * INTERVAL '1 hour'` — `ttl_hours`가 행 레벨 컬럼이므로 PostgreSQL에서 `정수 * INTERVAL` 연산 유효함 ✅. 의도한 대로 동작.

**O-3 (Minor):** NFR-CACHE-SC4 ID 이름 "Tool Cache 메모리 에이전트 수 비독립성" — 어색한 표현이나 내용이 정확하므로 수용 가능.

---

## 최종 점수

**9 / 10**

- 7개 이슈 전부 반영 ✅
- NFR-CACHE-S3 보안 요건이 이제 아키텍처와 일치하며 테스트 가능한 형태로 명시됨
- O6/O7 신규 NFR이 Brief BO-3 및 운영 요건을 적절히 커버
- SC4 표현이 기술적으로 정확해짐
- SC1 추정값 출처 표시 추가
- -1: O-1 (구현 상수명 CREDENTIAL_PATTERNS 참조 — 허용 범위지만 PRD/구현 경계 미세 침범)
