# CRITIC-B 검증: PRD Addendum Section 1 v2
**라운드:** 수정 후 검증 | **날짜:** 2026-03-12

---

## 이슈별 수정 확인

| 이슈 | 확인 결과 | 비고 |
|------|----------|------|
| C-1 포맷 재작성 | ✅ PASS | 모든 FR이 단일 불릿 형식. 코드블록/테이블 → Appendix A~F 이동 |
| H-1 sortedParams | ✅ PASS | `Object.entries(params).sort()` — 키 순서 정렬, 결정론적 키 생성 |
| H-2 tool_cache_miss 로그 | ✅ PASS | FR-CACHE-2.6에 hit + miss 양쪽 로그 명시 |
| H-3 Library 무효화 정책 | ✅ PASS | FR-CACHE-3.12 신규 — 24시간 TTL 수용 + enableSemanticCache=false 탈출구 |
| H-4 에이전트 캐시 공유 리스크 | ✅ PASS | FR-CACHE-3.11에 "Admin이 개별 제외 가능" 수용 기준 추가 |
| M-1 FR-CACHE-3.3 복합 | ✅ PASS | AgentEditForm 특정 + 토글 OFF 시 레코드 자연만료 처리 명시 |
| M-2 E8 check false positive | ✅ PASS | Appendix C에 grep -v 제외 조건 포함 |
| M-3 FR-CACHE-2.8 범위 이탈 | ✅ PASS | FR에서 제거 → Appendix E로 이동 (구현 참조 전용) |
| L-1 메모리 초과 행동 | ✅ PASS | `log.warn({ event:'tool_cache_memory_exceeded' })` + LRU 즉시 정리 명시 |
| L-2 cost-tracker 업데이트 범위 | ✅ PASS | FR-CACHE-1.4에서 cost-tracker Hook이 필드를 읽어 기록함 명시 |

---

## 잔여 관찰 (blocking 아님)

**O-1 (Minor):** FR-CACHE-2.4의 "LRU 추가 정리를 즉시 실행한다"에서 "추가 정리" 규모가 불명확. FR-CACHE-2.3은 "1개 제거 후 신규 항목 삽입"으로 정의했는데, 메모리 초과 시 몇 개를 정리하는지 미정의. Story 파일에서 구체화 가능한 수준이므로 PRD 블로커 아님.

**O-2 (Minor):** Appendix C가 raw `grep` 명령을 보여주지만 `engine-boundary-check.sh`는 `check_pattern` 함수를 사용할 가능성이 있음. Story 15.3 구현 시 기존 스크립트 패턴을 확인하여 일관성 유지 필요. PRD 수준에서는 허용 범위.

**O-3 (Positive):** Appendix F에 "Library 업데이트 즉각 반영 필요 에이전트 → false" 행이 추가되어 FR-CACHE-3.12와 일관성 확보됨. 좋은 추가.

---

## 최종 점수

**9 / 10**

- 10개 이슈 전부 반영됨 (+10)
- 포맷이 prd.md 병합 가능 수준으로 개선됨
- Appendix 구조로 PRD/구현 가이드 분리 명확
- 잔여 minor 2건(O-1, O-2)은 Story 파일에서 처리 가능
- -1: O-1 메모리 초과 시 "추가 정리" 규모 불명확 (Story 파일에서 보완 필요)
