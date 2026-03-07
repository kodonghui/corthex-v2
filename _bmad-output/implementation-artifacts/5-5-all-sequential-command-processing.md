# Story 5.5: /전체 + /순차 명령 처리

Status: done

## Story

As a **CEO/Human 직원 (사령관실 사용자)**,
I want **/전체 명령으로 모든 Manager에게 동시 위임하여 종합 보고서를 받고, /순차 명령으로 Manager들이 순서대로 이전 결과를 참고하며 누적 분석하는 기능**,
so that **전체 조직의 관점을 한번에 수집하거나, 부서 간 순차 협업으로 깊이 있는 연계 분석을 받을 수 있다**.

## Acceptance Criteria

1. **/전체 명령 처리 (AllCommandProcessor)**
   - 모든 활성 Manager에게 동시 위임 (ManagerDelegateService.delegate 재사용)
   - Promise.allSettled로 병렬 실행 — 부분 실패해도 성공한 Manager 결과 보존
   - 모든 Manager 결과 수집 후 비서실장(ChiefOfStaff)이 최종 종합 보고서 작성
   - 전체 타임아웃: 5분 (NFR2)
   - Manager가 0명이면 에러 메시지 반환

2. **/순차 명령 처리 (SequentialCommandProcessor)**
   - 비서실장이 LLM으로 작업 순서 결정 (최소 2개, 최대 4개 Manager 선택)
   - 순서 결정 실패 시 전체 Manager를 부서 순서로 실행
   - 첫 Manager: 원본 명령만 전달
   - 이후 Manager: 원본 명령 + 이전 모든 Manager의 결과를 컨텍스트로 전달
   - 마지막에 비서실장이 순차 협업 결과를 종합 보고서로 작성
   - 타임아웃: Manager 수 * 60초 (최대 10분)

3. **WebSocket 실시간 이벤트**: delegation 채널로 진행 상태 전송
   - `/전체`: 각 Manager 시작/완료/실패 + 종합 단계 이벤트
   - `/순차`: 각 단계(순서/Manager명) 시작/완료 + 종합 단계 이벤트

4. **commands.ts 라우트 통합**: `all`, `sequential` 타입 명령 수신 시 각 프로세서 호출
   - 기존 `direct`/`mention` 처리와 동일한 fire-and-forget 패턴

5. **orchestration_tasks 기록**: 각 Manager 위임 + 종합 단계마다 레코드 생성

## Tasks / Subtasks

- [x] Task 1: AllCommandProcessor 구현 (AC: #1, #3, #5)
  - [x] 1.1 `packages/server/src/services/all-command-processor.ts` 생성
  - [x] 1.2 `processAll(options)`: 활성 Manager 전체 조회 -> 병렬 위임 -> 종합
  - [x] 1.3 각 Manager에 managerDelegate() 호출 (5-3의 delegate 재사용)
  - [x] 1.4 비서실장 종합 보고서 생성 (v1의 synthesis_system 프롬프트 패턴 참고)
  - [x] 1.5 DelegationTracker 이벤트 전송
  - [x] 1.6 전체 5분 타임아웃

- [x] Task 2: SequentialCommandProcessor 구현 (AC: #2, #3, #5)
  - [x] 2.1 `packages/server/src/services/sequential-command-processor.ts` 생성
  - [x] 2.2 `planOrder(commandText, companyId, secretaryAgent)`: LLM으로 작업 순서 결정
  - [x] 2.3 `processSequential(options)`: 순서에 따라 Manager 순차 호출
  - [x] 2.4 이전 결과 누적 컨텍스트 전달 (v1의 prev_results 패턴)
  - [x] 2.5 비서실장 순차 협업 종합 보고서 생성
  - [x] 2.6 DelegationTracker 이벤트 전송
  - [x] 2.7 Manager수 * 60초 타임아웃 (최대 10분)

- [x] Task 3: commands.ts 라우트 통합 (AC: #4)
  - [x] 3.1 `all` 타입 명령 → processAll() fire-and-forget
  - [x] 3.2 `sequential` 타입 명령 → processSequential() fire-and-forget
  - [x] 3.3 slashArgs에서 실제 명령 텍스트 추출

- [x] Task 4: chief-of-staff.ts에서 getActiveManagers export (AC: #1, #2)
  - [x] 4.1 `getActiveManagers` 함수를 export로 변경

- [x] Task 5: 단위 테스트 (AC: all)
  - [x] 5.1 AllCommandProcessor: 병렬 실행, 부분 실패, 빈 Manager, 종합 보고서, 타임아웃
  - [x] 5.2 SequentialCommandProcessor: 순서 결정, 순차 실행, 컨텍스트 누적, 종합 보고서, 타임아웃
  - [x] 5.3 commands.ts 통합: all/sequential 타입 디스패치
  - [x] 5.4 기존 테스트 회귀 없음 확인

## Dev Notes

### 기존 코드 현황

**재사용할 인프라 (Story 5-1, 5-2, 5-3에서 구축):**

1. **CommandRouter** (`packages/server/src/services/command-router.ts`):
   - `classify()`: `/전체` -> `{ type: 'all', parsedMeta: { slashType: 'all', slashArgs: '...' } }`
   - `classify()`: `/순차` -> `{ type: 'sequential', parsedMeta: { slashType: 'sequential', slashArgs: '...' } }`
   - `TIMEOUT_MAP`: all=300000, sequential=300000

2. **ChiefOfStaff** (`packages/server/src/services/chief-of-staff.ts`):
   - `findSecretaryAgent(companyId)`: export됨, 비서실장 조회
   - `getActiveManagers(companyId)`: **현재 비export** -> **export로 변경 필요**
   - `getActiveDepartments(companyId)`: 비export, 필요 시 export
   - `makeContext()`, `toAgentConfig()`, `createOrchTask()`, `completeOrchTask()`: export됨, 재사용
   - `parseLLMJson()`: export됨, 재사용
   - `delegate()`: 단순 Manager LLM 호출 (rework용), 재사용 가능

3. **ManagerDelegateService** (`packages/server/src/services/manager-delegate.ts`):
   - `delegate(options)`: Manager 자체분석 + Specialist 병렬 실행 (5-3 핵심)
   - `formatDelegationResult(result, managerName)`: 결과 포맷팅
   - **AllCommandProcessor에서 각 Manager당 이 함수 호출**

4. **DelegationTracker** (`packages/server/src/services/delegation-tracker.ts`):
   - `startCommand()`, `classify()`, `classified()`, `completed()`, `failed()`
   - `managerStarted()`, `specialistDispatched/Completed/Failed()`
   - `synthesizing()`, `qualityChecking()`, `qualityPassed/Failed()`
   - command 채널 + delegation 채널로 이벤트 전송

5. **commands.ts** (`packages/server/src/routes/commands.ts`):
   - 현재 `direct`와 `mention` 타입만 처리
   - `all`, `sequential` 타입 핸들링 추가 필요

### v1 참고 (매우 중요)

**v1 /전체 (broadcast)** (`/home/ubuntu/CORTHEX_HQ/web/agent_router.py:1837-1950`):

```python
async def _broadcast_to_managers_all(text, task_id):
    # 활성 팀장 목록
    managers = [m for m in [...] if m not in _DORMANT_MANAGERS]

    # 모든 Manager에게 병렬 위임 (_manager_with_delegation = Manager 자체분석 + Specialist 병렬)
    mgr_tasks = [_manager_with_delegation(mgr_id, text) for mgr_id in managers]
    all_results = await asyncio.gather(*mgr_tasks, return_exceptions=True)

    # 비서실장 종합 보고서
    synthesis_input = f"CEO 원본 명령: {text}\n\n## 부서 팀장 보고서\n\n" + summaries
    synthesis_system = "비서실장으로서 종합 보고서 작성..."
    # 구조: 핵심 요약 / 부서별 한줄 요약 / CEO 결재 필요 사항 / 특이사항
```

**v1 /순차 (sequential)** (`/home/ubuntu/CORTHEX_HQ/web/agent_router.py:2097-2230`):

```python
async def _sequential_collaboration(text, task_id):
    # 1단계: 비서실장이 LLM으로 작업 순서 결정 (최소 2, 최대 4개 부서)
    order_prompt = f"CEO 명령: {text}\n\n작업 순서 결정...\nJSON: {{'order': [...], 'reason': '...'}}"

    # 2단계: 순차 실행
    for i, agent_id in enumerate(agent_order):
        if i == 0:
            agent_input = text  # 첫 Manager는 원본만
        else:
            prev_results = "\n\n".join(f"[{r['name']}의 작업 결과]\n{r['content'][:500]}" for r in results)
            agent_input = f"{text}\n\n## 이전 단계 작업 결과\n{prev_results}"

        result = await _manager_with_delegation(agent_id, agent_input)

    # 3단계: 비서실장 종합 보고서
    synthesis_prompt = f"아래는 {len(results)}개 부서가 순차적으로 작업한 결과입니다..."
```

**v2에서 달라지는 점:**
- v1은 고정 Manager 목록 -> v2는 DB에서 활성 Manager 동적 조회
- v1은 `_manager_with_delegation()` -> v2는 `managerDelegate()` (5-3)
- v1은 로그만 저장 -> v2는 orchestration_tasks 레코드 + WebSocket + commands 테이블 업데이트
- v1 종합 보고서 프롬프트 패턴을 그대로 가져올 것

### 구현 핵심 포인트

1. **AllCommandProcessor**: 별도 파일 `all-command-processor.ts`
   - `getActiveManagers(companyId)` (chief-of-staff에서 export) -> Manager 배열
   - 각 Manager에 `managerDelegate()` 호출 -> `formatDelegationResult()` -> 텍스트
   - Promise.allSettled로 병렬 실행
   - 비서실장 종합: `agentRunner.execute(secretary, synthesisPrompt)`
   - 결과를 commands 테이블에 저장

2. **SequentialCommandProcessor**: 별도 파일 `sequential-command-processor.ts`
   - 비서실장 LLM으로 순서 결정 (JSON: `{ order: [managerId1, managerId2], reason: "..." }`)
   - for 루프로 순차 실행, 각 Manager에 `managerDelegate()` 호출
   - 이전 결과 누적 컨텍스트: `prev_results.map(r => [이름의 작업 결과]\n내용).join('\n\n')`
   - 비서실장 종합 보고서
   - 결과를 commands 테이블에 저장

3. **commands.ts 수정**: `all`/`sequential` 타입 분기 추가
   - slashArgs 추출: `result.parsedMeta.slashArgs || body.text.replace(/^\/전체|\/순차/, '').trim()`

4. **종합 보고서 프롬프트** (v1 패턴 기반):
   - /전체: "부서별 한줄 요약 / CEO 결재 필요 사항 / 특이사항 / 리스크"
   - /순차: "순차 협업 결과 종합 / 단계별 연계 분석 / 최종 결론"

5. **getActiveManagers export**: chief-of-staff.ts 222행의 `async function getActiveManagers` → `export async function getActiveManagers`

### 구현 시 주의사항

1. **managerDelegate()는 import**: `from './manager-delegate'` — delegate와 formatDelegationResult 둘 다 사용
2. **타임아웃**: /전체는 TOTAL_TIMEOUT=300000(5분), /순차는 managers.length * 60000 (최대 600000=10분)
3. **slashArgs 사용**: CommandRouter가 이미 `/전체 시장 분석`에서 `slashArgs: '시장 분석'`을 추출함
4. **commands 테이블 업데이트**: 처리 완료 후 status='completed', result=종합보고서 저장
5. **에러 시 commands 업데이트**: status='failed', result=에러메시지
6. **DelegationTracker 재사용**: startCommand(), completed(), failed() 등 기존 메서드 활용
7. **import 경로**: kebab-case, 대소문자 일치 필수
8. **tenant 격리**: 모든 DB 쿼리에 companyId WHERE 필수

### 아키텍처 제약사항

- **API 응답 표준**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **파일명**: kebab-case (`all-command-processor.ts`)
- **테스트**: bun:test 프레임워크
- **LLM 단일 호출 타임아웃**: 30초 (NFR3)
- **전체 체인 타임아웃**: /전체 5분 (NFR2), /순차 최대 10분

### Project Structure Notes

- 새 파일: `packages/server/src/services/all-command-processor.ts`
- 새 파일: `packages/server/src/services/sequential-command-processor.ts`
- 수정: `packages/server/src/services/chief-of-staff.ts` (getActiveManagers export)
- 수정: `packages/server/src/routes/commands.ts` (all/sequential 타입 핸들링)
- 테스트: `packages/server/src/__tests__/unit/all-command-processor.test.ts`
- 테스트: `packages/server/src/__tests__/unit/sequential-command-processor.test.ts`

### References

- [Source: packages/server/src/services/command-router.ts] CommandRouter — classify(), parseSlash(), SLASH_COMMANDS (all/sequential 타입)
- [Source: packages/server/src/services/chief-of-staff.ts] ChiefOfStaff — findSecretaryAgent(), getActiveManagers(비export), makeContext(), toAgentConfig(), createOrchTask(), completeOrchTask(), parseLLMJson()
- [Source: packages/server/src/services/manager-delegate.ts] ManagerDelegateService — delegate(), formatDelegationResult()
- [Source: packages/server/src/services/delegation-tracker.ts] DelegationTracker — startCommand(), managerStarted(), completed(), failed()
- [Source: packages/server/src/routes/commands.ts] commands route — direct/mention 처리 패턴, all/sequential 추가 필요
- [Source: packages/server/src/services/agent-runner.ts] AgentRunner.execute()
- [Source: packages/server/src/db/schema.ts#orchestrationTasks] 오케스트레이션 작업 추적
- [Source: packages/server/src/db/schema.ts#commands] 명령 테이블 (status, result 업데이트)
- [Source: _bmad-output/planning-artifacts/epics.md#E5-S5] 스토리 수용 기준
- [Source: /home/ubuntu/CORTHEX_HQ/web/agent_router.py:1837-1950] v1 _broadcast_to_managers_all() — /전체 병렬 실행 + 종합
- [Source: /home/ubuntu/CORTHEX_HQ/web/agent_router.py:2097-2230] v1 _sequential_collaboration() — /순차 순차 실행 + 종합
- [Source: _bmad-output/implementation-artifacts/5-3-manager-delegate-parallel-specialist.md] Story 5-3 — ManagerDelegateService 구현 세부사항

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- v1 _broadcast_to_managers_all() 패턴 분석 완료: 모든 Manager 병렬 호출 + 비서실장 종합
- v1 _sequential_collaboration() 패턴 분석 완료: LLM 순서 결정 + 순차 호출 + 이전 결과 누적 + 종합
- CommandRouter 분석: all/sequential 타입 이미 정의됨, slashArgs 추출 완료
- chief-of-staff.ts: getActiveManagers 비export 상태 -> export 변경 필요
- manager-delegate.ts: delegate() + formatDelegationResult() 재사용 가능
- commands.ts: all/sequential 타입 핸들링 미구현 -> 추가 필요
- DelegationTracker: 기존 이벤트 메서드 재사용 가능
- 타임아웃 전략: /전체 5분, /순차 Manager수*60초(최대10분)
- AllCommandProcessor 구현 완료: processAll() -- 병렬 위임 + Promise.all + 비서실장 종합
- SequentialCommandProcessor 구현 완료: planOrder() + processSequential() -- LLM 순서 결정 + 순차 실행 + 이전결과 누적
- commands.ts 통합 완료: all/sequential 타입 fire-and-forget 디스패치
- chief-of-staff.ts: getActiveManagers export 변경 완료
- 8 AllCommandProcessor 테스트 통과: 병렬실행, 부분실패, 빈Manager, 종합, 추적이벤트
- 12 SequentialCommandProcessor 테스트 통과: 순서결정, 순차실행, 컨텍스트누적, 종합, 추적이벤트
- 179 관련 테스트 회귀 없음 (command-router 59 + chief-of-staff 100 + all 8 + sequential 12)

### Change Log

- 2026-03-07: Story 5-5 implementation complete -- AllCommandProcessor + SequentialCommandProcessor + commands.ts integration + 20 tests

### File List

- packages/server/src/services/all-command-processor.ts (NEW)
- packages/server/src/services/sequential-command-processor.ts (NEW)
- packages/server/src/services/chief-of-staff.ts (MODIFIED -- getActiveManagers export)
- packages/server/src/routes/commands.ts (MODIFIED -- all/sequential type handling)
- packages/server/src/__tests__/unit/all-command-processor.test.ts (NEW)
- packages/server/src/__tests__/unit/sequential-command-processor.test.ts (NEW)
