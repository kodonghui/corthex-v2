## [Party Mode Round 1 -- Collaborative Review] UX Step-03 Core Experience

### Agent Discussion

**Sally (UX Designer):** Core Experience 섹션이 매우 구체적이다. 사령관실 플로우 다이어그램, Cascade 위저드 4단계, 온보딩 플로우, 비용 확인 플로우가 모두 실질적인 상호작용 시퀀스로 정의되었다. 하지만 **Human 직원의 사령관실 경험**이 빠져있다. CEO와 Human 직원의 사령관실 UX가 동일한가? PRD FR45에서 "Human 직원은 자기 워크스페이스 내에서만 명령/비용/이력을 확인"이라고 되어있는데, 부서별 접근 제한이 @멘션 자동완성에 어떤 영향을 주는지 명시되지 않았다.

**John (PM):** 동의한다. 또한 **에러 복구 플로우**가 Key Screen States 테이블에서 "에러 (Error)" 상태로 한 줄만 정의되어 있다. PRD Journey 6(품질 게이트 환각 대응)에서는 "반려 -> 재작업 -> 재제출 -> 통과"라는 구체적인 복구 루프가 있는데, Core Experience에서 이 루프의 UX를 상세히 다루지 않았다. 사용자가 QA Fail 상태를 보았을 때 어떤 정보가 표시되고 무엇을 할 수 있는지 정의가 필요하다.

**Winston (Architect):** WebSocket 이벤트 -> UI 매핑 테이블이 훌륭하다. 7채널 전부 커버한다. 하지만 **quality_review 이벤트**가 빠져있다. Architecture의 오케스트레이션 엔진에서 ChiefOfStaff.review() 단계가 있는데, 이 단계의 WS 이벤트가 매핑에 없다. "비서실장이 품질 검수 중..." 상태를 어떤 채널/이벤트로 전달하는가?

**Amelia (Dev):** 사령관실 레이아웃에서 Artifacts 패턴(보고서 별도 패널)을 차용했는데, 이건 좋은 디자인이다. 하지만 **보고서 패널의 가로 분할 비율**이 명시되지 않았다. 대화 이력 50% + 보고서 50%인가? 아니면 보고서가 더 넓어야 하는가? 또한 모바일 반응형에서 이 분할이 어떻게 변하는지도 고려가 필요하다 (Phase 3 이후라 하더라도 구조적 결정은 지금 해야 한다).

**Quinn (QA):** v1 이식 체크리스트 14개 항목이 매우 유용하다. 하지만 v1-feature-spec 1.2에 있는 **"결과 최대 4,000자 (초과 시 요약)"** 도구 결과 제한이 Core Experience에서 언급되지 않았다. 도구 호출 결과가 UI에 어떻게 표시되는지 (위임 체인 패널에서 요약만 보여주는지, 통신로그에서 전체를 보여주는지)가 정의되어야 한다.

**Mary (BA):** PRD의 6개 Journey 중 Journey 2(이사장 투자 루틴)와 Journey 3(박과장 팀 구축)의 Core Experience가 다뤄지지 않았다. Flow 1(사령관실)과 Flow 2(동적 조직)가 Journey 1과 4를 커버하고, Flow 3(온보딩)은 Journey 1 도입부를 커버하지만, **전략실 UX 플로우**와 **직원 관리 UX 플로우**가 없다. 전략실은 Phase 2이니 Core Experience에서 다루지 않아도 되지만, 직원 관리는 P1이므로 Core Flow에 포함해야 한다.

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | Major | Sally | Human 직원의 사령관실 경험과 부서별 접근 제한이 UX적으로 미정의 | @멘션 자동완성에서 접근 가능한 부서의 Manager만 표시. 접근 불가 화면에는 권한 부족 안내 추가 |
| 2 | Minor | John | 품질 게이트 반려 -> 재작업 복구 루프의 상세 UX 미정의 | QA Fail 상태에서 표시되는 정보(반려 사유, 원본 vs 재작업 비교)와 사용자 액션(대기/상세 보기) 추가 |
| 3 | Minor | Winston | quality_review 단계의 WS 이벤트 매핑 누락 | delegation 채널에 review_started, review_passed, review_failed 이벤트 추가 |
| 4 | Minor | Quinn | 도구 호출 결과의 UI 표시 규격 미정의 (4000자 제한, 요약/전체) | 위임 체인: 도구명+결과 1줄 요약, 통신로그 도구 탭: 전체 결과 확인 가능으로 정의 |
| 5 | Minor | Mary | 직원 관리(P1) Core Flow 누락 | Human 직원 초대/권한 설정 플로우 추가 (최소한 간략 정의) |

### Consensus Status
- Major objections: 1 (Human 직원 UX) / Minor opinions: 4 / Cross-talk exchanges: 3
- Primary consensus: Human 직원 부서별 접근 제한 UX가 가장 큰 갭

### Fixes Applied
1. Human 직원 사령관실 UX 패턴 추가 (@멘션 제한, 접근 권한 안내)
2. QA Fail 복구 루프 상세 추가 (반려 사유, 재작업 상태 표시)
3. WS 이벤트 매핑에 quality_review 이벤트 3개 추가
4. 도구 호출 결과 표시 규격 추가
5. Human 직원 초대/권한 플로우 간략 추가
