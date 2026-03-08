## [Party Mode Round 1 -- Collaborative Review] create-story 18-2

### Agent Discussion

- **John (PM)**: 워크플로우 엔진의 핵심은 '흐름의 강건성(Robustness)'입니다. 스텝 타입(tool, llm, condition)에 따른 일관된 상태 전달 규격이 명시되어 있어서 좋네요. 다만 컨텍스트 변수치환(templating) 문법인 `{{step1.output}}`이 객체 내부까지 접근 가능한 모델인지 명확히 해야 할 것 같습니다.
- **Winston (Architect)**: 맞습니다. Jinja 스타일의 깊은 템플릿 탐색(Deep Resolution)이 필요합니다. DAG Parser의 경우 위상 정렬(Topological Sort)을 사용하면 병렬 티어(Tier)를 쉽게 묶을 수 있습니다. 실패한 스텝의 경우 하위 스텝들을 'Skipped' 처리하는 로직 상태 머신이 필요합니다.
- **Sally (UX)**: 워크플로우 진행 상태가 UI에 실시간으로 반영되려면, 각 스텝의 상태 변화(pending -> running -> success/failed/skipped)가 웹소켓 이벤트로 Publish 되어야 합니다. 18-5와 이어지겠지만 엔진 레벨에서 이벤트 발행(Emit) 준비가 되어 있어야 해요.
- **Amelia (Dev)**: 네, `EventBus`를 주입받아 각 스텝 실행 전후로 이벤트를 쏘도록 설계하겠습니다. 템플릿 변환기는 간단한 정규식과 `lodash/get`을 조합하면 충분히 안전하게 구현 가능합니다.
- **Quinn (QA)**: `condition` 스텝의 평가 기준이 모호합니다. 'simple branching logic'이라고 했는데, 엔진 내부에서 JavaScript `eval()`을 쓰면 심각한 보안 이슈가 있습니다.
- **Mary (BA)**: 동의합니다. 사용자 입력이나 AI 출력이 분기 조건에 개입될 텐데 보안 샌드박스나 안전한 표현식 평가기(Expression Evaluator)가 필수입니다.

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | High | Quinn/Mary | `condition` 스텝에서 안전하지 않은 조건식 평가 위험 (`eval` 사용 금지) | `expr-eval` 라이브러리 등 안전한 Expression Evaluator 도입 또는 사전 정의된 연산자(eq, gt, lt 등) 구조화 사용 |
| 2 | Medium | Winston | 스텝 실패 시 하위 의존성 스텝의 명시적인 상태 정의 누락 | 하위 스텝들을 `skipped` 상태로 전이시키는 상태 머신 규격화 |
| 3 | Medium | Sally | 실시간 진행률 추적을 위한 이벤트 발행 누락 | 엔진 실행 중 각 상태 전이마다 EventBus를 통한 `WORKFLOW_STEP_UPDATE` 이벤트 발행 요구사항 추가 |

### Consensus Status
- Major objections: 1
- Minor opinions: 2
- Cross-talk exchanges: 4

### Fixes Applied
- AC2: `condition` 스텝에 "Must use a secure expression evaluator (no `eval()`) or predefined structural operators." 명시.
- AC4: "Failed steps must mark dependent steps as `skipped`." 및 "Engine must emit real-time state transitions via EventBus." 요구사항 추가 반영.
