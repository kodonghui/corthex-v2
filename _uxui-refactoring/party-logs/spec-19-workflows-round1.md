# Party Mode: spec-19-workflows Round 1

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
v1-feature-spec 14번 항목의 워크플로우 CRUD, 다단계 스텝, 실행 상태 추적, DAG 구조 지원이 모두 스펙에 반영되어 있다. 다만 v1에서 워크플로우는 "데이터 수집 -> 분석 -> 보고서" 같은 실질적 자동화 파이프라인이었는데, 스펙의 AI 패턴 분석/제안 기능은 v2 추가 기능으로 적절히 확장되었다.

### Winston (Architect)
컴포넌트 구조가 WorkflowCanvas, StepForm, DagPreview 등으로 적절히 분리되어 있다. 다만 모든 컴포넌트가 pages/workflows.tsx 내부에 있어서, 캔버스 에디터 같은 복잡한 컴포넌트는 별도 파일로 분리하는 것이 재사용성과 유지보수에 유리할 수 있다. UI 변경 범위에서 buildDagLayers, SVG 좌표 계산 등 핵심 로직 보호가 명확히 정의되어 있어 좋다.

### Sally (UX)
워크플로우 생성 흐름이 "목록 -> + 새 워크플로우 -> 편집 모드 -> 저장"으로 3클릭 이내에 가능하다. 캔버스 에디터의 터치 이벤트 지원 + 핀치 줌 추가가 모바일 대응으로 적절하다. 다만 편집 모드 전환이 페이지 교체 방식이라는 문제점을 제기하면서 모달/패널 방식을 검토한다고 했는데, 최종 방향이 결정되지 않아 Banana2 프롬프트에서는 기존 방식을 유지하고 있다.

### Amelia (Dev)
data-testid가 32개로 잘 정의되어 있으나, 캔버스 에디터에서 엣지(edge) 관련 testid가 누락되어 있다. 노드 간 연결 생성/삭제는 DAG 편집의 핵심 인터랙션인데 테스트할 방법이 없다. 또한 에러 상태(API 실패) 시의 testid가 없어서, 워크플로우 목록 로드 실패 시나리오를 테스트할 수 없다.

### Quinn (QA)
빈 상태(`workflows-empty-state`)가 정의되어 있고 로딩 상태도 있지만, 에러 상태 UI가 명시되지 않았다. 워크플로우 목록 API 실패, 실행 API 실패, 저장 API 실패 각각에 대한 에러 핸들링이 섹션 3 문제점에서는 언급되지 않았다. 또한 제안 탭의 빈 상태가 워크플로우 빈 상태와 구분되지 않는다.

### Bob (SM)
워크플로우 페이지는 UI만 변경 범위로, buildDagLayers 알고리즘, API 호출 로직, SVG 좌표 계산 등 핵심 비즈니스 로직을 건드리지 않는 것이 명확하다. 캔버스 에디터의 터치 지원은 새로운 이벤트 핸들러 추가가 필요하지만 기존 마우스 이벤트를 대체하는 것이 아니라 추가하는 것이므로 리스크가 낮다.

### Mary (BA)
워크플로우 관리는 AI 에이전트 조직의 자동화를 위한 핵심 기능으로 비즈니스 가치가 명확하다. AI 패턴 분석 제안 기능은 반복 업무를 자동으로 발견하여 관리자 업무를 줄여주는 차별화 포인트다. 다만 제안 기능의 수락 후 편집 가능 여부가 스펙에서 불명확하다 -- 수락하면 바로 워크플로우가 되는지, 편집 후 저장하는지.

## 크로스톡
- **Amelia** -> **Quinn**: edge testid 누락 건은 Playwright 테스트 항목 #6 "캔버스 노드 추가"에서 엣지 생성도 테스트해야 하는데 testid가 없으면 불가능합니다. 추가 필요에 동의하시죠?
- **Quinn** -> **Amelia**: 동의합니다. `workflows-canvas-edge` testid 추가가 필요하고, 테스트 항목도 "엣지 생성/삭제" 케이스를 별도로 추가해야 합니다.
- **Sally** -> **Quinn**: 제안 탭 빈 상태 관련해서, 제안이 0건일 때 "아직 분석된 패턴이 없습니다. 패턴 분석 버튼을 눌러 시작하세요" 같은 CTA가 있으면 좋겠습니다.

## 발견된 이슈
| # | 심각도 | 발견자 | 내용 | 조치 |
|---|--------|--------|------|------|
| 1 | 중 | Amelia/Quinn | 에러 상태 UI 및 data-testid 미정의 (API 실패 시나리오) | `workflows-error-state` testid 추가, 테스트 항목 #19 추가 |
| 2 | 중 | Quinn/Sally | 제안 탭 빈 상태가 워크플로우 빈 상태와 구분되지 않음 | `workflows-suggestions-empty` testid 추가, 테스트 항목 #20 추가 |
| 3 | 저 | Amelia | 캔버스 edge 관련 data-testid 누락 | `workflows-canvas-edge` testid 추가 |

## 판정
- 점수: 7/10
- 결과: PASS (이슈 3건 수정 완료 후)
