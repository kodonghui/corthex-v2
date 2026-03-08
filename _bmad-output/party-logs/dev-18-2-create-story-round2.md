## [Party Mode Round 2 -- Adversarial Review] create-story 18-2

### Round 1 Fix Verification

| Issue # | Status | Verification Detail |
|---------|--------|---------------------|
| 1 | Resolved | AC2에 `eval()` 금지와 안전한 표현식 평가기 사용이 명시됨 |
| 2 | Resolved | AC4에 의존성 스텝들의 `skipped` 처리 명시됨 |
| 3 | Resolved | AC4에 `EventBus`를 통한 상태 이벤트 발행 명시됨 |

### Adversarial Agent Discussion

- **John (PM)**: '깊은 템플릿 탐색'이라고 변경했는데, 만약 참조하려는 변수가 undefined이거나 형식이 안 맞으면 어떻게 되죠? 조용히 실패하나요, 아니면 스텝이 터지나요?
- **Winston (Architect)**: 매우 중요한 지적입니다. 존재하지 않는 변수 참조 시 템플릿 변환기는 명시적으로 에러를 던져야(throw) 합니다. 엔진 설계에서 "Silent Failure"(조용한 실패)는 디버깅을 지옥으로 만듭니다. 
- **Sally (UX)**: 맞습니다. 사용자는 왜 `tool` 호출이 이상하게 들어갔는지 알 길이 없게 됩니다. 에러 메시지에 "Missing context variable: step1.output.value"라고 정확히 찍어주어야 해요.
- **Amelia (Dev)**: 네. 템플릿 엔진(`lodash/get` 기반) 래퍼를 만들 때 기본값을 nullish로 던지지 않고 엄격 모드(Strict Mode)로 동작하게 해서, 유효하지 않은 보간(Interpolation)은 런타임 에러로 취급하도록 하겠습니다.
- **Quinn (QA)**: 무한루프 가능성도 확인합시다. DAG 검증 로직은 18-1에서 API 저장 시점에 검사하긴 하지만, 런타임에서도 혹시 모를 사이클을 체크해야 합니다. `Topological Sort` 단계에서 사이클 디텍션을 내장하면 됩니다.
- **Mary (BA)**: 비용 문제도 있습니다. 병렬로 실행되는 `llm` 스텝들이 예산을 초과할 경우, 중간에 남은 병렬 스텝들을 강제로 취소(Abort)할 방법이 있나요?
- **Bob (SM)**: 이번 18-2 스펙은 "실행 엔진의 기본 골격(병렬/순차)"에 집중하는 범위입니다. 비용 기반 Abort 기능은 18-2의 범위를 다소 초과하며, 별도의 정책 레이어로 차후 도입하는 것이 스코프 관리에 유리합니다.

### New Issues Found (Round 2)

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 4 | High | Winston/Sally | 템플릿 변수 변환 시 존재하지 않는 변수 참조의 "조용한 실패(Silent Failure)" 위험성 | 엄격한 템플릿 보간(Strict Templating) 적용. 에러 발생 시 명시적으로 스텝을 실패 상태로 전환 |
| 5 | Medium | Quinn | 런타임 순환 참조 검증 보강 | 저장 시점 검증 외에도 엔진 런타임의 `DAG Parser`에서 사이클 감지 및 예외 시나리오 방어 명시 |

### Cross-Step Consistency Check
- Checked against: 18-1 Workflow Definition
- Contradictions found: 18-1에서 저장 시점에 순환 참조를 막지만, DB 수동 수정 등 예외에 대비해 런타임 방어도 필수임을 확인.

### Fixes Applied
- AC3: "Template resolution must be Strict. Referencing an undefined path must fail the step explicitly (No silent failures)." 추가.
- AC1: "The runtime DAG Parser must detect cyclic dependencies and halt execution immediately." 명확화.
