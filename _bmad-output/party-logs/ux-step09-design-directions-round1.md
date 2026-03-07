# Party Mode Round 1 -- UX Step 09: Design Directions
**Lens**: Collaborative (건설적 검토)
**Date**: 2026-03-07
**File Reviewed**: `_bmad-output/planning-artifacts/ux-design-specification.md` (step-09 section)

## Expert Panel Discussion

### John (PM): "3가지 방향 탐색이 체계적이다"

**강점**: Direction A/B/C의 비교 매트릭스가 8개 기준으로 체계적이고, Direction B 선택 근거가 5가지로 명확하다. DD-01~DD-06 결정이 이후 UI 설계의 기준점 역할을 충분히 한다.

**Issue #1 (중요)**: DD-04에서 "다크 테마: 설정에서 토글 (Phase 1)"이라고 했는데, 9.6 Phase 1 전략에서는 "라이트 모드만"이라고 되어 있다. Phase 1에서 다크 모드를 지원하는 건지 아닌 건지 모순이다. 하나로 통일해야 한다.

### Sally (UX): "전략실 톤 충돌을 다루지 않았다"

**강점**: DD-06 용어 매핑 테이블이 좋다. CEO 앱과 Admin에서 동일 개념을 다른 용어로 표현하는 전략이 페르소나별 직관성을 높인다.

**Issue #2 (중요)**: Direction B의 Cons #3("CEO 앱 내에서도 전략실과 사령관실의 톤 충돌")에 대한 완화 전략이 9.5 Trade-offs에 없다. 전략실은 금융 데이터인데 군사 메타포 사이드바 안에 있다. 이 부분 어떻게 처리할 건지 Trade-offs에 명시해야 한다.

### Winston (Architect): "기술 구현 방향이 명확하다"

DD-03의 `data-app` CSS 변수 오버라이드 구현이 깔끔하다. CVA + CSS 변수 조합이면 앱별 테마 분기를 최소 코드로 처리 가능하다.

### Amelia (Dev): "Phase 전략이 step-03과 정합성 확인 필요"

**Issue #3 (중요)**: Phase 1 Admin 메뉴가 5개라고 했는데, 이전 step에서 Admin 전체 메뉴 표시를 가정한 부분이 있을 수 있다. 도구 관리, 비용 대시보드, 조직 템플릿을 Phase 2로 미루는 결정이 step-03 Navigation Model과 일치하는지 확인 필요.

### Quinn (QA): "Phase별 커버리지 확인 OK"

Phase 1의 CEO 4개 메뉴 + Admin 5개 메뉴가 PRD의 P0+P1 기능 요구사항을 커버하는지 크로스체크 완료. 비용 관리(P1)가 별도 화면 없이 작전현황 카드로 처리되는 점은 MVP로 충분하다.

## Issues Found: 3

| # | 이슈 | 심각도 | 조치 |
|---|------|--------|------|
| 1 | DD-04와 Phase 1 다크 모드 지원 여부 모순 | 중요 | DD-04 수정: Phase 2에서 다크 테마 추가로 통일 |
| 2 | 전략실 톤 충돌 완화 전략 Trade-offs 누락 | 중요 | Trade-offs 테이블에 전략실 항목 추가 |
| 3 | Phase 1 Admin 메뉴 수 이전 step과 정합성 확인 | 중요 | DP4 원칙에 따라 5개 유지, 필요시 step-03 주석 추가 |

## Fixes Applied

1. DD-04 수정: "다크 테마: Phase 2에서 추가"로 명확화
2. Trade-offs 테이블에 "CEO 앱 내 전략실 톤" 항목 추가 -- 사이드바는 군사 유지, 콘텐츠는 도메인별 중립
3. Phase 1 Admin 메뉴 5개 유지 (DP4 부합)

---
Score: 7/10
Status: **PASS** -- 주요 모순 2개 수정 완료, 사소 이슈 없음. Round 2 진행.
