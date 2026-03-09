# Party Mode: spec-20-tools Round 1

## 참여 전문가
| 이름 | 역할 | 관점 |
|------|------|------|
| John | PM | Collaborative |
| Winston | Architect | Collaborative |
| Sally | UX | Collaborative |
| Amelia | Dev | Collaborative |
| Quinn | QA | Collaborative |
| Bob | SM | Collaborative |
| Mary | BA | Collaborative |

## 리뷰 결과

### John (PM)
v1-feature-spec 3번 항목의 도구 카탈로그 조회, 에이전트별 권한 제어, 카테고리별 필터링, 일괄 토글, 변경사항 추적이 모두 스펙에 포함되어 있다. 125개+ 도구를 5개 카테고리로 관리하는 구조가 v1의 agents.yaml allowed_tools 필드를 웹 UI로 자연스럽게 옮겼다.

### Winston (Architect)
매트릭스 기반 권한 관리는 에이전트-도구 수가 증가하면 확장성 문제가 있다. 모바일에서 에이전트별 카드 뷰로 전환하는 방향이 좋지만, 데스크톱에서도 에이전트가 20명 이상이면 매트릭스 가독성이 떨어진다. 컴포넌트 5개로 깔끔하게 분리되어 있고, pendingChanges Map 기반 로직 보호가 잘 정의되어 있다.

### Sally (UX)
도구 권한 변경 흐름이 "카테고리 필터 -> 체크박스 토글 -> 저장"으로 3클릭 이내에 가능하다. 개선 방향에서 검색 기능 추가를 제안했는데, 이것은 125개+ 도구를 카테고리만으로 찾기 어려운 실질적 UX 문제를 해결한다. 다만 검색 UI의 위치와 스타일이 구체적으로 정의되지 않았다.

### Amelia (Dev)
data-testid가 20개로 매트릭스 UI의 핵심 요소를 잘 커버한다. 그러나 개선 방향에서 추가하기로 한 검색 기능의 testid (`tools-search-input`)가 누락되어 있다. 또한 에러 상태(API 실패) testid도 없어서, 카탈로그 로드 실패나 권한 저장 실패 시나리오를 테스트할 수 없다.

### Quinn (QA)
빈 상태와 로딩 상태는 정의되어 있지만, 에러 상태가 누락되어 있다. 특히 PATCH API 실패 시(권한 저장 실패) 사용자에게 어떻게 피드백하는지 명시되지 않았다. 또한 도구 검색 결과가 0건일 때의 빈 상태와, 도구 자체가 없을 때의 빈 상태가 구분되어야 한다.

### Bob (SM)
UI만 변경 범위가 명확하다. pendingChanges Map, toggleTool/toggleCategory 함수, CatalogTool/Agent 타입, CATEGORIES 상수를 건드리지 않는다. 검색 기능은 클라이언트 사이드 필터링이므로 API 변경 없이 구현 가능하여 리스크가 낮다.

### Mary (BA)
도구 권한 관리는 AI 에이전트 조직의 보안과 효율성을 위한 핵심 기능이다. 에이전트에게 불필요한 도구 접근을 차단하고, 필요한 도구만 할당하는 것이 비즈니스 가치다. 변경사항 diff 뷰는 관리자가 저장 전에 실수를 방지할 수 있어 운영 안정성에 기여한다.

## 크로스톡
- **Amelia** -> **Quinn**: 검색 testid 누락 건은 Playwright 테스트 항목에도 검색 테스트가 없는 것과 연결됩니다. 검색 테스트 항목도 추가해야 합니다.
- **Quinn** -> **Sally**: 검색 결과 0건일 때 "해당 도구를 찾을 수 없습니다" 같은 피드백이 필요합니다. 현재 빈 상태와 구분해야 합니다.

## 발견된 이슈
| # | 심각도 | 발견자 | 내용 | 조치 |
|---|--------|--------|------|------|
| 1 | 중 | Amelia | 검색 기능의 data-testid(`tools-search-input`) 누락 | testid 추가, 테스트 항목 #15 추가 |
| 2 | 중 | Quinn | 에러 상태 UI 및 testid 미정의 | `tools-error-state` testid 추가, 테스트 항목 #16 추가 |

## 판정
- 점수: 7/10
- 결과: PASS (이슈 2건 수정 완료 후)
