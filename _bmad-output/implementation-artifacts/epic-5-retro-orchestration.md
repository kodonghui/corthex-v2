# Epic 5 회고: Orchestration Engine & Command Center

**날짜:** 2026-03-07
**참여:** Bob (SM), Alice (PO), Winston (Architect), Charlie (Senior Dev), Dana (QA), Elena (Junior Dev), ubuntu (Project Lead)

---

## Epic 요약

| 항목 | 수치 |
|------|------|
| 완료 스토리 | 11/11 (100%) |
| 스토리 포인트 | 27 SP |
| 총 테스트 수 | ~735개 (단위+통합+UI) |
| 빌드/타입 실패 | 0건 |
| 리그레션 발생 | 0건 |
| 기술 부채 항목 | 3건 |
| 프로덕션 인시던트 | 0건 |

**스토리별 상세:**

| # | 스토리 | SP | 테스트 | 핵심 성과 |
|---|--------|----|----|-----------|
| 5-1 | CommandRouter + 명령 타입 분류 | 2 | 136 | 8종 타입 분류, @멘션 파싱, 슬래시 파싱, commands 테이블 기록 |
| 5-2 | ChiefOfStaff 자동 분류 + 위임 | 3 | 100 | LLM 기반 분류, 5항목 품질 게이트, 자동 재작업(최대 2회) |
| 5-3 | Manager 위임 + 병렬 Specialist | 3 | 46 | #007 5번째 분석가, Promise.allSettled 병렬 실행, 결과 수집 |
| 5-4 | Manager 종합 + 품질 게이트 | 2 | 32 | LLM 종합 보고서(4섹션), synthesis -> quality gate 파이프라인 |
| 5-5 | /전체 + /순차 명령 처리 | 3 | 32 | 모든 Manager 동시 위임, LLM 순서 결정 + 누적 컨텍스트 |
| 5-6 | DeepWork 자율 다단계 | 3 | 51 | 5단계 파이프라인(plan/collect/analyze/draft/finalize), graceful degradation |
| 5-7 | 사령관실 UI | 3 | 42 | 채팅형 입력, @멘션 자동완성, 슬래시 팝업, 위임 체인 실시간 표시 |
| 5-8 | 위임 체인 실시간 WebSocket | 2 | 59 | DelegationTracker(14종 이벤트), 3채널 멀티플렉싱, <500ms 전달 |
| 5-9 | 보고서 뷰 + 피드백 | 2 | 50 | 마크다운 렌더링, 품질 뱃지(PASS/FAIL/WARNING), thumbs up/down |
| 5-10 | 프리셋 CRUD + 슬래시 팝업 | 2 | 99 | 프리셋 CRUD API, execute 파이프라인, 슬래시 팝업 통합 |
| 5-11 | 오케스트레이션 통합 테스트 | 2 | 88 | 10개 AC 전체 경로 통합 검증, 재작업 루프, 타임아웃, 에러 복구 |

---

## 잘 된 점

### 1. 레이어드 빌드 패턴 4연속 성공 (Epic 2 -> 3 -> 4 -> 5)

Epic 4 회고에서 "Epic 5에도 레이어드 빌드 패턴 적용 가능"이라고 예측했고, 정확히 실현됐다. CommandRouter(5-1) -> ChiefOfStaff(5-2) -> ManagerDelegate(5-3) -> ManagerSynthesis(5-4) -> All/Sequential(5-5) -> DeepWork(5-6) -> UI(5-7~5-10) -> 통합 테스트(5-11) 순서로, 각 스토리가 이전 코드를 안정적으로 확장했다. 11개 스토리를 순서대로 빌드하면서 리그레션 0건을 달성했다.

### 2. v1 패턴의 체계적 현대화

v1의 핵심 패턴을 정확히 분석하고 v2에 맞게 현대화했다:
- v1 `classify_task()` (키워드 + LLM) -> v2 `ChiefOfStaff.classify()` (동적 조직 구조 기반 LLM 분류)
- v1 `_manager_with_delegation()` (asyncio.gather) -> v2 `ManagerDelegateService.delegate()` (Promise.allSettled)
- v1 `_manager_self_analysis()` (#007 패턴) -> v2 `managerSelfAnalysis()` (동일 프롬프트 패턴 보존)
- v1 `synthesis_prompt` (단순 합치기) -> v2 `ManagerSynthesisService.synthesize()` (4섹션 보고서 포맷 추가)
- v1 `_broadcast_to_managers_all()` -> v2 `AllCommandProcessor.processAll()`
- v1 `_sequential_collaboration()` -> v2 `SequentialCommandProcessor.processSequential()`
- v1 `SpecialistAgent._deep_work()` -> v2 `DeepWorkService.execute()` (5단계 고정)

v1의 "실제 동작했던" 모든 기능이 v2에서도 동작하면서, 동적 조직 관리 + DB 기록 + WebSocket 실시간 추적이 추가되었다.

### 3. DelegationTracker -- 오케스트레이션 투명성 확보

14종 이벤트 타입(COMMAND_RECEIVED부터 COMPLETED까지)을 3개 WebSocket 채널(command, delegation, tool)로 분리하여 전송하는 DelegationTracker를 설계했다. 경과 시간 자동 계산, companyId 격리, commandId별 추적이 모두 포함되어 있어, CEO가 명령 처리 과정을 실시간으로 관찰할 수 있다. v1에는 없었던 완전히 새로운 기능이다.

### 4. 통합 테스트로 전체 파이프라인 검증 (5-11)

88개 통합 테스트가 10개 수용 기준을 모두 커버한다:
- 자연어 명령 전체 흐름 (classify -> delegate -> synthesize -> qualityGate)
- @멘션 직접 지정 (분류 건너뛰기)
- /전체 병렬 + /순차 누적
- DeepWork 5단계
- 품질 검수 재작업 루프 (FAIL -> rework -> FAIL -> rework -> warningFlag)
- WebSocket 이벤트 순서 검증
- 프리셋 실행 파이프라인
- 타임아웃 + 에러 복구

이 테스트 세트는 향후 Epic 8(Quality Gate Enhancement)에서 품질 규칙을 확장할 때 안전망 역할을 한다.

### 5. 서비스 분리 아키텍처 유지

가장 큰 에픽(27 SP)임에도 서비스를 적절히 분리했다:
- `command-router.ts`: 명령 타입 분류 (순수 파싱 로직)
- `chief-of-staff.ts`: 전체 파이프라인 오케스트레이션
- `manager-delegate.ts`: Manager 자체 분석 + Specialist 병렬
- `manager-synthesis.ts`: 결과 종합 보고서
- `all-command-processor.ts`: /전체 처리
- `sequential-command-processor.ts`: /순차 처리
- `deep-work.ts`: 딥워크 5단계
- `delegation-tracker.ts`: WebSocket 이벤트 발행

chief-of-staff.ts가 695줄까지 커졌지만, 새로운 서비스를 별도 파일로 분리하여 유지보수성을 확보했다.

### 6. 사령관실 UI 완성도

Command Center UI가 v1 이상의 기능을 제공한다:
- 채팅형 메시지 목록 (사용자 오른쪽, AI 왼쪽, 날짜 구분선)
- @멘션 자동완성 (부서별 그룹, 키보드 탐색)
- 슬래시 팝업 8종 + 프리셋 통합
- 위임 체인 트리 구조 (상태 아이콘 6종, 실시간 경과 시간)
- 보고서 마크다운 렌더링 + 4섹션 하이라이트
- 품질 뱃지 (PASS/FAIL/WARNING) + 5항목 팝오버
- thumbs up/down 피드백
- 프리셋 관리 (CRUD + 원클릭 실행)
- 반응형 (lg+ 분할뷰, md 탭 전환, sm 컴팩트)

---

## 어려웠던 점

### 1. chief-of-staff.ts의 규모 관리

5-2에서 695줄로 시작한 chief-of-staff.ts가 스토리가 진행되면서 계속 수정되었다. 5-3에서 helper 함수 export 변경, 5-4에서 Phase 2 synthesize 교체, 5-5에서 getActiveManagers export 등. 파일 자체는 안정적이었지만, 여러 서비스가 하나의 파일에서 함수를 import하는 구조가 결합도를 높인다. 공통 헬퍼(toAgentConfig, createOrchTask, completeOrchTask, makeContext, parseLLMJson)를 별도 유틸 파일로 분리하면 더 깨끗해질 것이다.

### 2. LLM 응답 파싱의 불확실성

ChiefOfStaff.classify(), qualityGate(), SequentialCommandProcessor.planOrder() 등 여러 곳에서 LLM의 JSON 응답을 파싱해야 했다. LLM이 마크다운 코드블록으로 감싸거나, 추가 텍스트를 붙이거나, 형식이 약간 다른 경우가 있어 `parseLLMJson()` 헬퍼를 만들었지만, 이 패턴이 여러 서비스에 흩어져 있다. 향후 JSON 모드를 지원하는 LLM 프로바이더를 활용하면 이 문제를 근본적으로 해결할 수 있다.

### 3. UI 컴포넌트 상태 관리 복잡도 (5-7)

사령관실 UI에서 @멘션 팝업, 슬래시 팝업, 위임 체인 실시간 업데이트, 보고서 분할 뷰 등 여러 상태를 동시에 관리해야 했다. useCommandCenter 훅과 command-store로 분리했지만, WebSocket 이벤트와 React 상태의 동기화가 복잡했다. 특히 위임 체인의 실시간 업데이트가 여러 컴포넌트에 걸쳐 있어 상태 흐름 추적이 어려웠다.

### 4. 테스트 mock 설계의 복잡도

전체 파이프라인이 AgentRunner -> LLM -> 도구 -> DB를 관통하기 때문에, 각 스토리의 테스트에서 mock 설계가 복잡했다. 특히 5-11 통합 테스트에서는 AgentRunner.execute()의 응답을 호출 순서에 따라 다르게 반환해야 했고(1번째=분류 JSON, 2번째=Manager 분석, 3번째=Specialist 결과...), mock 순서 관리가 까다로웠다.

---

## 핵심 교훈

### 1. P0 수렴 지점은 가장 크고 가장 보람 있다

Epic 5는 v2의 P0 수렴 지점(convergence point)으로, Epic 2(조직) + Epic 3(LLM) + Epic 4(도구)의 결과물이 모두 통합된다. 11개 스토리, 27 SP, ~735개 테스트로 가장 큰 에픽이었지만, 이전 4개 에픽의 레이어드 빌드 패턴 덕분에 각 스토리가 기존 인프라를 안정적으로 활용할 수 있었다. "기반을 탄탄히 쌓으면 상위 레이어는 빠르게 올라간다"는 원칙이 입증되었다.

### 2. 서비스 분리는 빌드 속도의 핵심

거대한 "OrchestratorService" 하나를 만드는 대신, 역할별로 서비스를 분리(CommandRouter, ChiefOfStaff, ManagerDelegate, ManagerSynthesis, AllCommand, SequentialCommand, DeepWork, DelegationTracker)한 것이 효과적이었다. 각 스토리가 하나의 서비스에 집중하면서도, import를 통해 이전 서비스를 자연스럽게 재사용했다.

### 3. v1 패턴 분석은 시간 투자 가치가 있다

모든 스토리의 Dev Notes에 v1 소스 코드 참조가 포함되었다. v1의 `agent_router.py`, `ai_handler.py`, `quality_handler.py`, `SpecialistAgent._deep_work()` 등을 정밀 분석하여 검증된 패턴을 가져온 것이 구현 속도와 품질 모두에 기여했다. "바퀴를 재발명하지 않되, 현대화는 필수"라는 원칙이 잘 작동했다.

### 4. 통합 테스트는 마지막 스토리에 집중

5-11에서 88개 통합 테스트를 한번에 작성한 구조가 효과적이었다. 개별 스토리에서는 단위 테스트에 집중하고, 마지막에 전체 파이프라인을 통합 테스트로 검증하는 패턴이 테스트 효율성과 커버리지 모두를 만족시켰다.

### 5. WebSocket 이벤트 설계는 초기에 확정해야 한다

DelegationTracker의 14종 이벤트 타입이 5-8에서 한번에 설계되었지만, 5-4에서 synthesis 이벤트를 추가하는 등 이전 스토리에서도 필요했다. 이벤트 스키마를 초기(5-1 또는 5-2)에 확정했다면 중간 수정을 줄일 수 있었을 것이다.

---

## 이전 회고(Epic 4) 액션 아이템 추적

| # | 액션 아이템 | 상태 | Epic 5에서의 결과 |
|---|------------|------|-------------------|
| 1 | ToolPool/HandlerRegistry 관계 문서화 | 미착수 | Epic 5에서 ToolPool 직접 사용은 많지 않았음 (AgentRunner 내부). 문서화 여전히 필요 |
| 2 | 프론트엔드 테스트 전략 확정 | 부분 진행 | 5-7에서 42개 UI 테스트, 5-9에서 50개 UI 테스트 작성. 체계적 전략 문서는 아직 없음 |
| 3 | JWT blocklist 최종 결정 | 미착수 | 4개 에픽째 미해결. Epic 9(Multi-tenancy)에서 해결 예정 |
| 4 | 도메인 도구 API 스냅샷 테스트 | 미착수 | Epic 5 범위 아님. 여전히 필요 |

**분석:** 4개 중 0개 완료, 1개 부분 진행, 3개 미착수. Epic 5가 워낙 크고 핵심적인 에픽이어서 이전 액션 아이템에 집중하기 어려웠다. 하지만 JWT blocklist 이슈는 4개 에픽 연속 미해결로, 다음 회고까지 반드시 결정을 내려야 한다.

---

## 기술 부채

| # | 항목 | 영향도 | 출처 | 해결 시점 |
|---|------|--------|------|-----------|
| 1 | chief-of-staff.ts 공통 헬퍼 분리 | 중 | 5-2/5-3/5-4/5-5 | toAgentConfig, createOrchTask 등 5개 함수를 orchestration-helpers.ts로 분리 권장. Epic 6 시작 전 |
| 2 | parseLLMJson 중앙화 | 낮음 | 5-2/5-5 | 여러 서비스에서 동일 패턴 사용. LLM Router에 JSON 파싱 헬퍼 통합 권장 |
| 3 | JWT blocklist 미해결 (Epic 2부터 계속) | 중 | Epic 2/3/4/5 | Epic 9에서 해결하거나 의식적 수용 결정 필요. 4개 에픽 연속 미해결 |
| 4 | ToolPool/HandlerRegistry 이중 구조 (Epic 4에서 계속) | 중 | Epic 4 | 도구 추가 시 혼란. 문서화 또는 통합 필요 |
| 5 | 프론트엔드 테스트 전략 미확정 (Epic 4에서 계속) | 낮음 | Epic 4/5 | smoke test vs 컴포넌트 테스트 범위 결정 필요 |

---

## Epic 6 준비 사항

**Epic 6: Dashboard & Activity Monitoring** (6 stories, 14 SP)

Epic 6은 작전현황(홈 대시보드)과 통신로그 4탭을 구현한다. Epic 5에서 생성된 명령/위임/도구/품질 데이터를 집계하여 CEO가 조직 현황을 한눈에 파악할 수 있게 한다.

**주요 스토리:**
1. 6-1: 대시보드 집계 API
2. 6-2: 작전현황 대시보드 UI
3. 6-3: 통신로그 4탭 API
4. 6-4: 통신로그 4탭 UI
5. 6-5: WebSocket 실시간 대시보드 갱신
6. 6-6: 퀵 액션 + 만족도 차트

**Epic 5에서 Epic 6으로의 의존성:**

1. **commands 테이블** -- 모든 명령 기록 (작업 카드, 활동 탭 데이터 소스)
2. **orchestration_tasks 테이블** -- 위임 체인 기록 (통신 탭 데이터 소스)
3. **quality_reviews 테이블** -- 품질 검수 결과 (QA 탭 데이터 소스)
4. **tool_calls 테이블** -- 도구 호출 기록 (도구 탭 데이터 소스)
5. **DelegationTracker WebSocket 이벤트** -- 실시간 갱신에 활용
6. **commands.metadata.feedback** -- thumbs up/down 집계 (만족도 차트)
7. **사령관실 UI 패턴** -- 퀵 액션에서 사령관실로 명령 자동 입력

**Epic 6 현재 상태:**
- 6-1 (대시보드 집계 API): in-progress
- 6-3 (통신로그 4탭 API): in-progress
- 나머지: backlog

**필수 준비 작업:**

- [x] 오케스트레이션 데이터 생성 파이프라인 완성 (Epic 5 완료)
- [x] WebSocket 3채널 (command/delegation/tool) 브리지 구현 (5-8 완료)
- [x] 피드백 시스템 구현 (5-9 thumbs up/down 완료)
- [ ] 집계 쿼리 성능 최적화 (인덱스 확인)
- [ ] cost_records 집계 방식 확정 (Epic 7과 겹치는 부분)

**Epic 5에서 검증된 패턴 (Epic 6에도 적용):**
- 레이어드 빌드: API(6-1, 6-3) -> UI(6-2, 6-4) -> WebSocket(6-5) -> 통합(6-6)
- 기존 코드 확장 원칙: commands.ts, WebSocket 채널, ws-store 등 재사용
- 서비스 분리: 집계 로직은 별도 서비스 파일로 분리

---

## 액션 아이템

### 프로세스 개선

1. **chief-of-staff.ts 공통 헬퍼 분리**
   - 담당: Developer (Amelia)
   - 기한: Epic 6 첫 스토리 시작 전
   - 완료 기준: toAgentConfig, createOrchTask, completeOrchTask, makeContext, parseLLMJson을 `orchestration-helpers.ts`로 분리. 기존 import 경로 업데이트. 735개 테스트 회귀 없음

2. **LLM JSON 응답 파싱 전략 결정**
   - 담당: Architect (Winston)
   - 기한: Epic 8 (Quality Gate Enhancement) 시작 전
   - 완료 기준: JSON 모드 활용 가능 여부 + parseLLMJson 중앙화 방안 문서화

3. **프론트엔드 테스트 전략 확정 (3개 에픽째)**
   - 담당: QA (Quinn) + Senior Dev (Charlie)
   - 기한: Epic 6 UI 스토리(6-2) 시작 전
   - 완료 기준: 테스트 범위(smoke/unit/integration), 도구(vitest + testing-library), 커버리지 목표 확정

### 기술 부채

1. **JWT blocklist 최종 결정 (4개 에픽째)**
   - 담당: PM (John) + Architect (Winston)
   - 우선도: 높음 (더 이상 미루면 안 됨)
   - 완료 기준: Epic 9에 스토리로 포함하거나, "현 상태 수용" 문서화. 다음 회고 전 반드시 결정

2. **ToolPool/HandlerRegistry 관계 문서화 (2개 에픽째)**
   - 담당: Architect (Winston)
   - 우선도: 중
   - 완료 기준: 새 도구 추가 가이드 작성 + README 업데이트

3. **도메인 도구 API 스냅샷 테스트 (2개 에픽째)**
   - 담당: QA (Quinn)
   - 우선도: 낮음
   - 완료 기준: DART, law.go.kr, KIPRIS API 응답 스냅샷 + 검증 테스트

### 팀 합의

- **레이어드 빌드 패턴 5번째 에픽에서도 유지**: API -> UI -> WebSocket -> 통합 순서
- **서비스 분리 원칙 유지**: 단일 파일이 700줄 이상이면 분리 검토
- **v1 패턴 참조 필수**: 모든 스토리 Dev Notes에 v1 소스 코드 참조 포함
- **통합 테스트 마지막 스토리 패턴 유지**: 단위 테스트는 각 스토리, 통합 테스트는 에픽 마지막
- **이전 회고 액션 아이템 추적 강화**: 3개 에픽 이상 미해결 시 강제 결정

---

## 종합 평가

Epic 5는 CORTHEX v2의 가장 크고 핵심적인 에픽(P0 수렴 지점)으로, 11개 스토리를 100% 완료하고 ~735개 테스트로 검증된 오케스트레이션 파이프라인을 구축했다. 제로 리그레션, 제로 프로덕션 인시던트를 달성했으며, v1의 모든 핵심 기능을 현대화하여 재구현했다.

**특히 주목할 성과:**

- **전체 오케스트레이션 파이프라인**: 명령 -> 분류 -> 위임 -> 병렬 실행 -> 종합 -> 품질 검수 -> 보고서 (stub/mock이 아닌 진짜 동작하는 파이프라인)
- **5항목 품질 게이트 + 자동 재작업**: 결론 명확성, 근거 충분성, 리스크 언급, 형식 적절성, 논리 일관성 (최대 2회 자동 재작업 + 경고 플래그)
- **DelegationTracker 14종 이벤트**: 오케스트레이션 투명성을 WebSocket으로 실시간 제공 (v1에 없던 기능)
- **사령관실 UI 완성**: 채팅 + @멘션 + 슬래시 + 프리셋 + 위임 체인 + 보고서 + 피드백 -- 전체 사용자 경험 제공
- **88개 통합 테스트**: 전체 파이프라인을 10개 시나리오로 검증

레이어드 빌드 패턴이 4개 에픽 연속 성공하면서, 서비스 분리 + 기존 코드 확장 + v1 패턴 현대화라는 개발 원칙이 완전히 확립되었다. P0 MVP Core(Epic 0~5, 40 stories, 99 SP)가 모두 완료되었으며, 다음은 P1 MVP Complete(Epic 6~9, 24 stories, 53 SP) 단계로 진입한다.

Epic 6(Dashboard & Activity Monitoring)은 Epic 5에서 생성된 풍부한 데이터(명령, 위임, 품질, 도구, 피드백)를 집계하여 시각화하는 에픽으로, Epic 5의 데이터 파이프라인이 탄탄하게 구축되어 있어 순조로운 진행이 기대된다.

---

*Retrospective facilitated by Bob (Scrum Master)*
*Date: 2026-03-07*
