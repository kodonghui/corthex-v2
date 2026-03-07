# Party Mode Round 2 -- UX Step 09: Design Directions
**Lens**: Adversarial (적대적 검토 -- 각 전문가가 약점을 공격)
**Date**: 2026-03-07
**File Reviewed**: `_bmad-output/planning-artifacts/ux-design-specification.md` (step-09 section, re-read from file)

## Expert Panel Adversarial Review

### John (PM): "Direction 비교가 편향되어 있지 않은가?"

9.2 Comparison Matrix에서 Direction B가 8개 기준 중 5개에서 최고점이다. 이건 선택을 정당화하기 위한 사후 합리화가 아닌가? Direction A의 "비개발자 직관성"이 4점인데, "지휘관" 멘탈 모델이 실제로 비개발자에게 직관적이라면 5점일 수도 있다.

**결론**: 이건 관점의 차이일 뿐, 매트릭스의 평가 기준 자체는 합리적이다. Direction B 선택은 유효하다. 새 이슈 아님.

### Sally (UX): "DD-06 용어 테이블이 구현 시 혼란을 초래할 수 있다"

**Issue #1 (새 이슈)**: DD-06에서 "Agent"를 CEO 앱에서 "AI 직원"이라 부르고 Admin에서 "에이전트"라 부른다. 그런데 CEO가 Admin 권한을 겸하면 양쪽을 오가는데, 같은 에이전트를 한쪽에서는 "AI 직원", 다른 쪽에서는 "에이전트"로 보면 혼란스럽지 않은가? 특히 김대표 페르소나는 CEO+Admin을 혼자 쓴다. 용어 전환이 "아, 같은 앱의 다른 뷰구나"가 아니라 "왜 이름이 다르지?"가 될 수 있다.

**검토 결과**: 이건 인정하되 심각하지 않다. CEO 앱의 "AI 직원"은 조직 은유를 강화하는 핵심 용어이고, Admin의 "에이전트"는 기술 관리 문맥에서 자연스럽다. 앱 자체가 분리되어 있으므로 같은 화면에서 두 용어가 동시에 보이지는 않는다. Trade-offs에 이미 "CEO 앱 용어 vs Admin 용어 분기" 항목이 있어 의식적 결정으로 기록되어 있다. 사소한 이슈로 유지.

### Winston (Architect): "9.7 MVP 테이블에서 다크 테마 항목이 아직 모순"

**검토**: 9.7 MVP vs Full Vision 테이블에서 "테마" 행이 "라이트 기본 + 다크 선택"으로 되어 있다. 그런데 DD-04에서는 "다크 테마: Phase 2에서 추가"로 수정했다. MVP 테이블의 "다크 선택"은 Phase 1에서 다크 모드를 지원한다는 의미로 읽힌다.

**Issue #2 (새 이슈)**: 9.7 테이블의 테마 행을 "라이트만 (CEO 사이드바 다크 고정)"으로 수정 필요.

### Amelia (Dev): "Phase 2 CEO 앱 메뉴 수가 안 맞는다"

**검토**: Phase 2에서 "9개 메뉴 추가, 총 13개"라고 했는데, 실제 목록을 세면 11개(전략실, AGORA, SketchVibe, SNS, 작전일지, 기밀문서, 전력분석, 크론기지, ARGOS, 정보국, 자동화)다. Phase 1의 4개 + 11개 = 15개이고, step-03의 Phase 2 완전체가 13개(설정/프로필 제외)라면 일치하지 않는다.

**검토 결과**: step-03 사이드바에서 작전현황, 사령관실, 전략실 + 소통 3개 + 기록 3개 + 운영 5개 + 설정/프로필 = 총 15개 항목. "13개"라는 숫자는 그룹 헤더를 제외한 실제 메뉴 항목 수로 해석할 수 있다. Phase 2 추가 메뉴가 "9개"가 아니라 "11개"가 맞으므로 수정 필요.

**Issue #3 (사소)**: Phase 2 CEO 앱 추가 메뉴 수를 정정해야 한다.

### Quinn (QA): "Phase 전략이 이전 step들과 정합"

step-02 UX Priority Matrix, step-03 Navigation Model, step-08 Phase별 사이드바 표시 규칙과 교차 검증 완료. 핵심 정합성 문제 없음.

## Issues Found: 2 (새 이슈)

| # | 이슈 | 심각도 | 조치 |
|---|------|--------|------|
| 1 | DD-06 용어 전환 시 CEO+Admin 겸용 사용자 혼란 | 사소 | Trade-offs에 이미 기록됨. 추가 조치 불필요 |
| 2 | 9.7 MVP 테이블 "테마" 행이 DD-04 수정과 불일치 | 중요 | "라이트만 (CEO 사이드바 다크 고정)"으로 수정 |
| 3 | Phase 2 CEO 앱 추가 메뉴 "9개"가 아닌 "11개" | 사소 | 정확한 수로 수정 |

## Fixes Applied

1. 9.7 테이블 "테마" 행 수정: "라이트만 (CEO 사이드바 다크 고정)" (MVP) / "+ 다크 선택 + 밀도 선택" (Full)
2. Phase 2 CEO 앱 추가 메뉴 수 정정

---
Score: 8/10
Status: **PASS** -- R1에서 수정한 DD-04 모순의 잔여 불일치 1개 수정. 새 주요 이슈 없음. Round 3 진행.
