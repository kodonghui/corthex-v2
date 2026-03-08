## [Party Mode Rounds 1~3 Combined] create-story 18-3

### Round 1: Collaborative Review

- **John (PM)**: 18-3은 워크플로우의 '사후 분석'에 해당합니다. AC2의 병목 탐지(bottleneck) 기준을 하드코딩(50%, 10%)하는 것보다 상대적 z-score나 IQR 방식으로 이상치(Outlier)를 찾는 것이 더 지능적입니다.
- **Winston (Architect)**: 동의합니다. 또한, AC4에서 `workflow_executions` 테이블 언급이 있는데, 현재 `schema.ts`에 이 테이블이 존재하는지 확인하고, 없다면 DDL 확장이 반드시 18-3에 포함되어야 합니다. JSONB 인덱싱도 고려해야 검색 성능이 나옵니다.
- **Sally (UX)**: 분석 결과 API 응답 포맷이 명확해야 대시보드(18-4, 18-5)에서 예쁘게 그릴 수 있습니다. `GET /api/workspace/workflows/:id/analytics`는 차트 그리기 좋은 시계열 데이터(Time-series)도 제공해야 합니다.
- **Amelia (Dev)**: 네, 통계 분석 유틸리티를 만들고, 부족한 DB 스키마는 18-3 개발 시작 전 마이그레이션으로 추가하겠습니다. LLM 최적화 제안은 비동기 큐나 백그라운드 태스크로 분리하지 않으면 API 응답이 너무 길어집니다.

### Round 2: Adversarial Review

- **Quinn (QA)**: 만약 워크플로우 실행 이력이 0건이라면? 빈 배열일 때 `average`, `z-score` 연산이 모두 NaN 엣지 케이스를 뱉으며 터질 겁니다. 모든 통계 식에서 예외 처리가 필요해요.
- **Mary (BA)**: 비용 모델 관점에서도 LLM 기반 최적화 제안(AC3)은 API 호출마다 실시간으로 돌리기에는 너무 비쌉니다. 주 1회 배치 처리하거나 명시적인 "최적화 제안 생성" 버튼을 눌렀을 때만 동작하도록 분리해야 합니다.
- **Winston (Architect)**: 아주 날카롭습니다. API를 두 개로 나눕시다. `GET /analytics` (빠른 DB 통계)와 `POST /analytics/insights` (느린 LLM 제안 생성 및 캐싱).

### Round 3: Final Judgment

#### Calibrated Issues
1. (High) LLM 제안 실시간 호출로 인한 비용/성능 이슈 -> Endpoint 분리 (`POST /analytics/insights`)
2. (Medium) 통계 연산 시 빈 데이터(`execution count = 0`) 처리 누락 -> 명시적 `0` 반환 초기화 방어
3. (Medium) DB 스키마 `workflow_executions` 부재 가능성 -> 스키마 정의/마이그레이션 작업 항목에 추가

**Quality Score: 9/10**
- 스펙이 충분히 방어적으로 수정되었으며, 대시보드를 위한 시계열 구조와 비용 효율적인 API 분리가 결정됨.

**Final Verdict: PASS**
