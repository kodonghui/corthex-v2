# Party Mode Round 2 - Adversarial Lens
## UX Design Step 08: Visual Foundation

**Date:** 2026-03-07
**Reviewer:** Worker (self-review)
**Section reviewed:** Visual Foundation (lines 2312-2932, post-R1 fixes)

---

### Expert Panel Discussion (Adversarial)

**John (PM):** step-03(Core User Flows, 라인 295-339)에서 정의한 CEO 앱 사이드바 구조와 step-08의 사이드바 네비게이션 구조가 크게 다릅니다.

step-03 정의:
- Phase 1: 4개 메뉴(작전현황, 사령관실, 통신로그, 설정)
- Phase 2 완전체: 13개, 그룹(소통/기록/운영)으로 접힘 가능
- 항목: 전략실, AGORA, SketchVibe, SNS 통신국, 통신로그, 작전일지, 기밀문서, 전력분석, 크론기지, ARGOS, 정보국, 자동화

step-08 정의:
- 그룹 없이 평면 구조, 구분선으로만 분리
- 누락 항목: 통신로그, 기밀문서, 전력분석, 정보국, 자동화
- 추가 항목: 조직관리(서브메뉴 포함), 비용관리, 프로필
- "작전현황"이 홈이 아니라 두 번째 메뉴

step-08의 사이드바를 step-03 정의에 맞추어야 합니다.

**Winston (Architect):** 더 심각한 문제가 있습니다. step-03(라인 326-339)에서 Admin 콘솔도 **좌측 사이드바**로 정의했습니다. 그런데 step-08에서는 Admin을 **상단 탭 바(56px)**로 정의했습니다. 이건 구조적 모순입니다. step-03이 먼저 정의된 것이므로 step-08이 step-03을 따라야 합니다. 다만, step-03은 경험 흐름 관점이고 step-08은 시각 구조 관점이므로, step-08에서 의도적으로 변경한 것이라면 step-03도 업데이트해야 합니다. 현재 단계에서는 step-03의 Admin 사이드바 구조를 유지하되, step-08에서 시각적으로 보강하는 방향이 맞습니다.

**Sally (UX Designer):** 사이드바 불일치는 심각합니다. 또한, step-03에서 Phase 1은 4개 메뉴만 표시한다고 했는데, step-08에서는 Phase별 표시 규칙이 없습니다. Phase별로 어떤 메뉴가 보이는지를 step-08에도 반영해야 합니다.

**Amelia (Dev):** 실제 구현 시 step-03과 step-08 중 어느 것을 따라야 할지 혼란이 생깁니다. 하나로 통일 필수.

**Mary (BA):** Admin 콘솔의 네비게이션이 사이드바인지 탭 바인지는 UX의 근본적 결정입니다. step-03의 사이드바를 유지하는 게 일관성 면에서 맞습니다.

**Quinn (QA):** step-08의 Summary Card에서 "3col (xl) / 6col (md)"이라고 했는데, 대시보드 상단에서 4개 카드를 "grid-cols-4 (xl)"로 배치한다고도 했습니다. 3col과 4col-per-card는 같은 의미인데 표현이 다릅니다. 사소한 이슈.

**Bob (SM):** Issue #1(사이드바 구조 불일치)은 Critical, Issue #2(Admin 네비게이션 방식 불일치)도 Critical. 즉시 수정 필요.

### Issues Found

| # | 심각도 | 이슈 | 발견자 |
|---|--------|------|--------|
| 1 | Critical | CEO 앱 사이드바 구조가 step-03과 불일치 (항목, 그룹핑, Phase 규칙 모두 다름) | John, Sally, Amelia |
| 2 | Critical | Admin 콘솔 네비게이션이 step-03은 사이드바, step-08은 탭 바로 모순 | Winston, Mary |

### Fixes Applied

1. **CEO 앱 사이드바 전면 교체**: step-03(라인 301-323)의 Phase 2 완전체 구조로 교체. Phase별 표시 규칙 추가.
2. **Admin 콘솔 레이아웃 수정**: 탭 바 -> 좌측 사이드바로 변경. step-03(라인 326-339)의 구조 반영. CEO App과의 차이 테이블 수정.

### Round 2 Score: 7/10 -- PASS (Critical 이슈 수정 후)
