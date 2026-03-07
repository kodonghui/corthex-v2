# Story 5.3: Manager 위임 + 병렬 Specialist 실행

Status: review

## Story

As a **CEO/Human 직원 (사령관실 사용자)**,
I want **Manager가 ChiefOfStaff로부터 위임받은 작업을 자체 분석(#007 5번째 분석가 패턴) + 하위 Specialist 병렬 실행하여 결과를 수집하는 서비스**,
so that **하나의 명령으로 Manager의 독자적 관점 + 소속 Specialist 전원의 전문 분석을 병렬로 받아 종합적인 결과를 얻을 수 있다**.

## Acceptance Criteria

1. **ManagerDelegateService.delegate(task)**: Manager가 위임받은 작업을 처리
   - Manager 자체 LLM 분석 수행 (#007 5번째 분석가 패턴 — v1의 `_manager_self_analysis()` 참고)
   - 하위 Specialist 목록 조회 (agents 테이블: departmentId 동일 + tier='specialist' + isActive=true)
   - Specialist가 없으면 Manager 자체 분석 결과만 반환
   - Specialist가 있으면 Manager 분석 + Specialist 병렬 실행 동시 수행

2. **dispatchSpecialists(specialists, task)**: 병렬 Specialist 실행
   - Promise.allSettled()로 모든 Specialist 동시 실행 (v1의 `asyncio.gather(*tasks, return_exceptions=True)` 패턴)
   - 각 Specialist에게 전달: 원본 명령 텍스트 + Manager의 분석 요약 + Specialist의 soul/role 컨텍스트
   - 개별 Specialist 타임아웃: 60초
   - 전체 수집 타임아웃: 5분 (NFR2)
   - 부서당 최대 Specialist 10명 (NFR7)

3. **collectResults()**: 결과 수집 + 구조화
   - 반환 타입: `ManagerDelegationResult { managerAnalysis, specialistResults[], summary }`
   - 각 specialistResult: `{ agentId, agentName, content, status: 'fulfilled'|'rejected', error?, durationMs }`
   - fulfilled/rejected 카운트 집계
   - 전체 에러 시에도 Manager 자체 분석은 보존

4. **orchestration_tasks 기록**: 각 단계마다 레코드 생성
   - Manager 자체 분석: type='execute', parentTaskId=delegateTask.id
   - 각 Specialist 실행: type='execute', parentTaskId=delegateTask.id
   - 위임 체인 추적: command -> chief_of_staff(classify) -> chief_of_staff(delegate) -> manager(execute) -> specialist[](execute)

5. **WebSocket 이벤트**: delegation 채널로 각 Specialist 진행 상태 전송
   - `{ type: 'delegation:specialist-start', commandId, managerId, specialistId, specialistName }`
   - `{ type: 'delegation:specialist-complete', commandId, managerId, specialistId, status, durationMs }`
   - `{ type: 'delegation:specialist-fail', commandId, managerId, specialistId, error }`
   - `{ type: 'delegation:manager-analysis-complete', commandId, managerId }`

6. **ChiefOfStaff 통합**: chief-of-staff.ts의 delegate() 함수를 ManagerDelegateService.delegate()로 교체
   - 기존 delegate()는 Manager에게 단순 agentRunner.execute() 호출 → 이제 Manager 자체분석 + Specialist 병렬 실행으로 확장
   - process() 파이프라인의 Phase 2 (delegate)가 ManagerDelegateService 호출로 변경
   - 반환값: Manager 자체분석 + Specialist 결과를 종합한 텍스트 (quality gate에 전달됨)

## Tasks / Subtasks

- [x] Task 1: ManagerDelegateService 구현 (AC: #1, #2, #3)
  - [x] 1.1 `packages/server/src/services/manager-delegate.ts` 생성
  - [x] 1.2 `getSpecialists(companyId, managerId)`: Manager와 같은 departmentId의 active specialist 목록
  - [x] 1.3 `managerSelfAnalysis(manager, commandText, companyId)`: AgentRunner로 Manager 독자 분석
  - [x] 1.4 `dispatchSpecialists(specialists, commandText, managerAnalysis, companyId, commandId, parentTaskId)`: Promise.allSettled 병렬 실행
  - [x] 1.5 `delegate(options)`: 전체 파이프라인 (자체분석 + 병렬 실행 + 결과 수집)
  - [x] 1.6 타임아웃: 개별 60s, 전체 5분 NFR2

- [x] Task 2: orchestration_tasks 기록 (AC: #4)
  - [x] 2.1 Manager 자체 분석용 orchestration_tasks 레코드
  - [x] 2.2 각 Specialist 실행용 orchestration_tasks 레코드
  - [x] 2.3 parentTaskId 체인 연결

- [x] Task 3: WebSocket 이벤트 (AC: #5)
  - [x] 3.1 delegation 채널 이벤트 전송 (DelegationTracker 활용)
  - [x] 3.2 각 Specialist start/complete/fail 이벤트
  - [x] 3.3 Manager 자체 분석 완료 이벤트

- [x] Task 4: ChiefOfStaff 통합 (AC: #6)
  - [x] 4.1 chief-of-staff.ts의 delegate() → ManagerDelegateService.delegate() 호출로 교체
  - [x] 4.2 반환값 포맷팅: Manager 분석 + Specialist 결과 → 종합 텍스트로 변환
  - [x] 4.3 process() 파이프라인에서 delegate 단계 교체

- [x] Task 5: 단위 테스트 (AC: all)
  - [x] 5.1 getSpecialists() 테스트: Specialist 조회, 빈 목록, 비활성 제외
  - [x] 5.2 managerSelfAnalysis() 테스트: AgentRunner 호출, 프롬프트 구조
  - [x] 5.3 dispatchSpecialists() 테스트: 병렬 실행, 부분 실패, 전체 실패
  - [x] 5.4 delegate() 통합 테스트: Specialist 있을 때/없을 때, 타임아웃
  - [x] 5.5 orchestration_tasks 기록 테스트: 레코드 생성, parentTaskId 체인
  - [x] 5.6 WebSocket 이벤트 테스트: delegation 채널 이벤트 전송
  - [x] 5.7 ChiefOfStaff 통합 테스트: 기존 100개 테스트 회귀 없음

## Dev Notes

### 기존 코드 현황

**이미 존재하는 인프라 (Story 5-1, 5-2에서 구축):**

1. **ChiefOfStaff** (`packages/server/src/services/chief-of-staff.ts`):
   - `classify()`: LLM 분류 → {departmentId, managerId, confidence}
   - `delegate()`: Manager에게 agentRunner.execute() 단순 호출 (이것을 확장해야 함)
   - `qualityGate()`: 5항목 품질 검수
   - `process()`: 전체 파이프라인 (classify → delegate → qualityGate → rework)
   - `toAgentConfig()`: DB row → AgentConfig 변환 헬퍼 (재사용)
   - `createOrchTask()`, `completeOrchTask()`: orchestration_tasks 레코드 관리 (재사용)
   - `emitCommandStatus()`: WebSocket command 채널 이벤트 전송 (재사용)
   - `findSecretaryAgent()`: 비서실장 에이전트 조회
   - `getActiveManagers()`: 활성 Manager 목록 조회
   - `parseLLMJson()`: LLM JSON 응답 파싱

2. **AgentRunner** (`packages/server/src/services/agent-runner.ts`):
   - `execute(agent, task, context, toolExecutor)`: LLM 호출 + 도구 실행
   - AgentConfig: { id, companyId, name, nameEn, tier, modelName, soul, allowedTools, isActive }
   - TaskRequest: { messages, context?, maxToolIterations? }
   - TaskResponse: { content, toolCalls, usage, cost, finishReason, iterations }

3. **DB 스키마** (`packages/server/src/db/schema.ts`):
   - `orchestrationTasks`: id, companyId, commandId, agentId, parentTaskId, type, input, output, status, startedAt, completedAt, durationMs, metadata
   - `agents`: departmentId(FK), tier('manager'|'specialist'|'worker'), isActive, companyId

4. **EventBus** (`packages/server/src/lib/event-bus.ts`):
   - 7채널: command, delegation, tool, cost, agent, system, notification
   - `eventBus.emit('delegation', { companyId, type, ... })` 패턴

### v1 참고 (매우 중요)

**v1 Manager 위임 패턴** (`/home/ubuntu/CORTHEX_HQ/web/agent_router.py:1428-1550`):

```python
# v1 핵심 패턴: Manager = 5번째 분석가
async def _manager_with_delegation(manager_id, text):
    specialists = _MANAGER_SPECIALISTS.get(manager_id, [])

    # Specialist 없으면 Manager가 직접 처리
    if not specialists:
        return await _call_agent(manager_id, text)

    # Manager 독자분석 + Specialist 병렬 동시 실행
    _mgr_self_task = _manager_self_analysis()
    _spec_task = _delegate_to_specialists(manager_id, text)
    _parallel = await asyncio.gather(_mgr_self_task, _spec_task, return_exceptions=True)
```

**v1 병렬 Specialist 위임** (`/home/ubuntu/CORTHEX_HQ/web/agent_router.py:1352-1425`):

```python
async def _delegate_to_specialists(manager_id, text):
    specialists = _MANAGER_SPECIALISTS.get(manager_id, [])
    tasks = [_call_agent(spec_id, text) for spec_id in specialists]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    # Exception이면 error dict, 아니면 결과 dict
```

**v2에서 달라지는 점:**
- v1은 `_MANAGER_SPECIALISTS` dict로 고정 → v2는 DB에서 동적 조회 (같은 departmentId + tier='specialist')
- v1은 `asyncio.gather` → v2는 `Promise.allSettled()` (부분 성공 보존)
- v1은 로그만 저장 → v2는 orchestration_tasks 레코드 + WebSocket 이벤트
- v1 Manager 자체 분석 프롬프트 패턴을 그대로 가져올 것

### 아키텍처 결정 참고

**Decision #1: Orchestration Engine** (architecture.md):
```
CommandRouter → ChiefOfStaff.classify(command)
  → Manager.delegate(task)              // ← 이 스토리
    → Manager 자체 분석 (#007 5번째 분석가)
    → Promise.allSettled(specialists)    // 병렬 실행
    → 결과 수집
  → Manager.synthesize(results)          // Story 5-4
  → ChiefOfStaff.review(report)
```

### 구현 핵심 포인트

1. **ManagerDelegateService는 별도 파일**: `manager-delegate.ts`로 분리 (chief-of-staff.ts가 이미 695줄)
2. **chief-of-staff.ts에서 임포트**: `delegate()` 함수 내부에서 ManagerDelegateService.delegate() 호출
3. **toAgentConfig, createOrchTask, completeOrchTask는 export**: chief-of-staff.ts에서 이미 존재, manager-delegate.ts에서 임포트하여 재사용
4. **Manager 자체 분석 프롬프트**: v1 패턴 — "전문가들과 별개로 독자적 분석을 수행하세요. 도구를 사용하여 실시간 데이터를 직접 조회하고 분석하세요."
5. **Specialist에게 전달할 컨텍스트**: 원본 명령 + Manager 분석 요약 (Specialist는 Manager의 분석을 참고하되 독립적 분석 수행)
6. **타임아웃 구현**: `Promise.race([agentRunner.execute(), timeout(60000)])` 패턴
7. **결과 포맷팅**: Manager 분석 + Specialist 결과를 하나의 종합 텍스트로 변환 (quality gate에 전달)

### 구현 시 주의사항

1. **chief-of-staff.ts의 toAgentConfig, createOrchTask, completeOrchTask를 export로 변경**: 현재 모듈 내부 함수 → export 필요
2. **makeContext도 export**: manager-delegate.ts에서 LLMRouterContext 생성에 필요
3. **emitCommandStatus는 command 채널**: delegation 이벤트는 별도로 eventBus.emit('delegation', ...) 사용
4. **Specialist DB 조회**: `agents WHERE companyId AND departmentId = manager.departmentId AND tier = 'specialist' AND isActive = true AND id != managerId`
5. **부분 실패 처리**: Promise.allSettled() 결과에서 fulfilled/rejected 분류, rejected도 결과에 포함
6. **빈 Specialist**: Specialist가 0명이면 Manager 단독 처리 (v1과 동일)
7. **import 경로**: kebab-case 파일명, 실제 대소문자 일치 필수

### 아키텍처 제약사항

- **tenant 격리**: 모든 쿼리에 companyId WHERE 필수
- **API 응답 표준**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **파일명**: kebab-case (`manager-delegate.ts`)
- **테스트**: bun:test 프레임워크
- **LLM 단일 호출 타임아웃**: 30초 (NFR3)
- **전체 체인 타임아웃**: 5분 (NFR2)
- **비용 기록**: AgentRunner가 cost 정보 반환 → metadata에 포함

### Project Structure Notes

- 새 파일: `packages/server/src/services/manager-delegate.ts`
- 수정: `packages/server/src/services/chief-of-staff.ts` (delegate() 교체 + 함수 export 변경)
- 테스트: `packages/server/src/__tests__/unit/manager-delegate.test.ts`
- 참고: `packages/server/src/services/agent-runner.ts` (AgentRunner.execute() 패턴)
- 참고: `packages/server/src/db/schema.ts` (orchestrationTasks, agents 테이블)
- 참고: `packages/server/src/lib/event-bus.ts` (delegation 채널)

### References

- [Source: packages/server/src/services/chief-of-staff.ts] ChiefOfStaff — delegate(), toAgentConfig(), createOrchTask(), completeOrchTask(), emitCommandStatus()
- [Source: packages/server/src/services/agent-runner.ts] AgentRunner.execute() — 에이전트 실행 패턴
- [Source: packages/server/src/db/schema.ts#orchestrationTasks] 오케스트레이션 작업 추적 (parentTaskId 체인)
- [Source: packages/server/src/db/schema.ts#agents] 에이전트 테이블 (departmentId, tier, isActive)
- [Source: packages/server/src/lib/event-bus.ts] EventBus — delegation 채널
- [Source: _bmad-output/planning-artifacts/epics.md#E5-S3] 스토리 수용 기준
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision1] Orchestration Engine
- [Source: /home/ubuntu/CORTHEX_HQ/web/agent_router.py:1428-1550] v1 _manager_with_delegation() — Manager 독자분석 + Specialist 병렬
- [Source: /home/ubuntu/CORTHEX_HQ/web/agent_router.py:1352-1425] v1 _delegate_to_specialists() — Specialist 병렬 위임
- [Source: _bmad-output/implementation-artifacts/5-2-chief-of-staff-auto-classify-delegate.md] Story 5-2 — ChiefOfStaff 구현 세부사항

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- v1 _manager_with_delegation() 패턴 분석 완료: Manager 자체분석 + Specialist 병렬 → asyncio.gather
- v1 _delegate_to_specialists() 패턴 분석 완료: 병렬 호출 + return_exceptions=True
- chief-of-staff.ts 695줄 분석: delegate(), toAgentConfig(), createOrchTask() 재사용 가능
- DB schema 확인: orchestrationTasks.parentTaskId로 위임 체인 추적
- EventBus delegation 채널로 Specialist 진행 상태 전송
- ManagerDelegateService 구현 완료: delegate(), getSpecialists(), managerSelfAnalysis(), dispatchSpecialists(), formatDelegationResult()
- v1 #007 "5번째 분석가" 패턴 구현: Manager 독자분석 + Specialist 병렬 실행 동시 수행 (Promise.allSettled)
- DelegationTracker 통합: specialistDispatched/Completed/Failed, managerStarted 이벤트
- chief-of-staff.ts에서 makeContext, toAgentConfig, createOrchTask, completeOrchTask를 export로 변경
- chief-of-staff.ts Phase 2를 managerDelegate() 호출로 교체 (formatDelegationResult로 종합 텍스트 생성)
- 기존 delegate() 함수는 rework 시 계속 사용 (단순 Manager 재실행)
- 24 unit tests: formatDelegationResult, SpecialistResult types, timeout logic, prompt patterns, edge cases
- 100 chief-of-staff 테스트 회귀 없음, 59 command-router 테스트 회귀 없음

### Change Log

- 2026-03-07: Story 5-3 implementation complete — ManagerDelegateService + ChiefOfStaff integration + 24 tests

### File List

- packages/server/src/services/manager-delegate.ts (NEW)
- packages/server/src/services/chief-of-staff.ts (MODIFIED — Phase 2 delegate 교체, helper 함수 export)
- packages/server/src/__tests__/unit/manager-delegate.test.ts (NEW)
