# Story 5.4: Manager 종합 + ChiefOfStaff 품질 검수

Status: done

## Story

As a **CEO/Human 직원 (사령관실 사용자)**,
I want **Manager가 자체 분석 + Specialist 결과를 LLM으로 종합하여 구조화된 최종 보고서를 생성하고, 이를 ChiefOfStaff 품질 검수에 전달하는 서비스**,
so that **단순 텍스트 합치기가 아닌, AI가 분석 결과를 논리적으로 종합한 고품질 보고서를 받아 품질 검수까지 자동으로 완료된다**.

## Acceptance Criteria

1. **ManagerSynthesisService.synthesize()**: Manager 종합 보고서 생성
   - 입력: Manager 자체 분석 + Specialist 결과 배열 + 원본 명령 텍스트
   - AgentRunner로 Manager 에이전트에게 synthesis 프롬프트 전달 (v1 패턴 그대로)
   - v1 synthesis 프롬프트: "아래 분석 결과(당신의 독자 분석 + 전문가)를 종합하여 최종 보고서를 작성하세요. 도구를 다시 사용할 필요 없습니다 — 결과를 취합만 하세요."
   - 도구 호출 없이 결과 취합만 (maxToolIterations: 0)
   - 출력: 구조화된 보고서 텍스트 (결론, 분석, 리스크, 추천 섹션 포함)

2. **보고서 구조**: 4섹션 보고서 포맷
   - synthesis 프롬프트에 포맷 지시 포함: 결론(핵심 결론), 분석(상세 분석), 리스크(위험 요소/한계), 추천(다음 단계 행동)
   - Specialist가 0명이면 Manager 단독 분석을 보고서 형식으로 재구성
   - 실패한 Specialist는 "(분석 실패)" 표시 (v1 패턴)

3. **ChiefOfStaff 파이프라인 통합**: process() Phase 2를 synthesis 포함으로 확장
   - 현재: managerDelegate() -> formatDelegationResult() -> quality gate
   - 변경: managerDelegate() -> synthesize() -> quality gate
   - formatDelegationResult() 대체: LLM이 종합한 보고서가 quality gate에 전달
   - orchestration_tasks에 synthesis 단계 기록 (type='synthesize')

4. **orchestration_tasks 기록**: synthesis 단계 레코드
   - type='synthesize', agentId=manager.id, parentTaskId 체인 연결
   - input: "synthesis of delegation result", output: 종합 보고서 텍스트
   - 위임 체인: command -> classify -> delegate -> synthesize -> quality_gate

5. **WebSocket 이벤트**: delegation 채널로 synthesis 상태 전송
   - `{ type: 'delegation:synthesis-start', commandId, managerId }`
   - `{ type: 'delegation:synthesis-complete', commandId, managerId, durationMs }`
   - `{ type: 'delegation:synthesis-fail', commandId, managerId, error }`

6. **Rework 통합**: quality gate FAIL 시 rework도 synthesize 경로 사용
   - 현재 rework: delegate() 단순 재실행 -> formatDelegationResult 없이 텍스트 전달
   - 이 부분은 기존 delegate() 함수(단순 LLM 호출) 유지 — 피드백 기반 개선이므로 재종합 불필요
   - 5-2에서 만든 rework 로직 그대로 유지

## Tasks / Subtasks

- [x] Task 1: ManagerSynthesisService 구현 (AC: #1, #2)
  - [x] 1.1 `packages/server/src/services/manager-synthesis.ts` 생성
  - [x] 1.2 `synthesize(options)`: Manager 에이전트에게 synthesis 프롬프트 전달, AgentRunner.execute() 호출
  - [x] 1.3 `buildSynthesisPrompt(managerName, commandText, managerAnalysis, specialistResults)`: v1 패턴 프롬프트 생성 + 4섹션 포맷 지시
  - [x] 1.4 Specialist 0명일 때: Manager 단독 분석을 보고서 형식으로 재구성
  - [x] 1.5 synthesis 실패 시 fallback: formatDelegationResult() 텍스트 그대로 반환

- [x] Task 2: orchestration_tasks 기록 (AC: #4)
  - [x] 2.1 synthesize() 내부에서 createOrchTask() / completeOrchTask() 호출
  - [x] 2.2 type='synthesize', parentTaskId 체인 연결

- [x] Task 3: WebSocket 이벤트 (AC: #5)
  - [x] 3.1 DelegationTracker에 synthesisCompleted/synthesisFailed 메서드 추가
  - [x] 3.2 synthesize() 내부에서 이벤트 전송

- [x] Task 4: ChiefOfStaff 통합 (AC: #3, #6)
  - [x] 4.1 chief-of-staff.ts의 Phase 2에서 formatDelegationResult() -> synthesize() 교체
  - [x] 4.2 synthesize 결과가 quality gate에 전달
  - [x] 4.3 rework 로직은 기존 delegate() 단순 재실행 유지 (변경 없음)

- [x] Task 5: 단위 테스트 (AC: all)
  - [x] 5.1 synthesize() 테스트: AgentRunner 호출, 프롬프트 구조, 4섹션 포맷
  - [x] 5.2 buildSynthesisPrompt() 테스트: v1 패턴 프롬프트 구조 검증
  - [x] 5.3 Specialist 0명 테스트: Manager 단독 분석 보고서
  - [x] 5.4 synthesis 실패 fallback 테스트
  - [x] 5.5 DelegationTracker synthesis 이벤트 테스트
  - [x] 5.6 ChiefOfStaff 통합 테스트: synthesis -> quality gate 파이프라인
  - [x] 5.7 기존 100개 chief-of-staff 테스트 + 46개 manager-delegate 테스트 회귀 없음 (280 tests 0 fail)

## Dev Notes

### 기존 코드 현황

**이미 존재하는 인프라 (Story 5-1 ~ 5-3에서 구축):**

1. **ManagerDelegateService** (`packages/server/src/services/manager-delegate.ts`):
   - `delegate()`: Manager 자체 분석 + Specialist 병렬 실행 -> `ManagerDelegationResult` 반환
   - `formatDelegationResult()`: 결과를 텍스트로 합치기 (이것을 synthesis로 교체)
   - `ManagerDelegationResult`: { managerAnalysis, specialistResults[], summary }
   - `SpecialistResult`: { agentId, agentName, content, status, error?, durationMs }

2. **ChiefOfStaff** (`packages/server/src/services/chief-of-staff.ts`):
   - `process()` Phase 2: managerDelegate() -> formatDelegationResult() -> quality gate
   - `qualityGate()`: 5항목 품질 검수 (이미 구현됨, 변경 없음)
   - `delegate()`: 단순 LLM 호출 (rework용, 변경 없음)
   - `makeContext()`, `toAgentConfig()`, `createOrchTask()`, `completeOrchTask()`: 헬퍼 (export됨)

3. **AgentRunner** (`packages/server/src/services/agent-runner.ts`):
   - `execute()`: agent + task + context + toolExecutor -> TaskResponse

4. **DelegationTracker** (`packages/server/src/services/delegation-tracker.ts`):
   - 위임 체인 이벤트 전송 (새 synthesis 이벤트 추가 필요)

### v1 참고 (매우 중요)

**v1 Manager 종합 보고서** (`/home/ubuntu/CORTHEX_HQ/web/agent_router.py:1630-1710`):

```python
# v1 핵심 패턴: Manager가 LLM으로 종합 보고서 작성
synthesis_prompt = (
    f"당신은 {mgr_name}입니다.\n"
    f"아래 분석 결과(당신의 독자 분석 + 전문가)를 종합하여 최종 보고서를 작성하세요.\n"
    f"도구를 다시 사용할 필요 없습니다 -- 결과를 취합만 하세요.\n\n"
    f"## CEO 원본 명령\n{text}\n\n"
    f"## 팀장 독자 분석\n{manager_self_content or '(분석 실패)'}\n\n"
    f"## 전문가 분석 결과\n" + "\n\n".join(spec_parts)
)
soul = _load_agent_prompt(manager_id)
synthesis = await ask_ai(synthesis_prompt, system_prompt=soul, model=model,
                         tools=None, tool_executor=None)
```

**v2에서 달라지는 점:**
- v1은 `ask_ai(tools=None)` -> v2는 `agentRunner.execute(maxToolIterations: 0)`
- v1은 프롬프트에 포맷 지시 없음 -> v2는 4섹션 보고서 포맷 지시 추가 (결론/분석/리스크/추천)
- v1은 노션+아카이브 저장 -> v2는 orchestration_tasks 기록 + WebSocket 이벤트
- v1 synthesis 프롬프트 패턴을 그대로 가져올 것

### 아키텍처 결정 참고

**Decision #1: Orchestration Engine** (architecture.md):
```
CommandRouter -> ChiefOfStaff.classify(command)
  -> Manager.delegate(task)              // Story 5-3 (done)
    -> Manager 자체 분석 (#007 5번째 분석가)
    -> Promise.allSettled(specialists)
    -> 결과 수집
  -> Manager.synthesize(results)          // <- 이 스토리
  -> ChiefOfStaff.review(report)         // 이미 구현됨 (5-2)
```

**Decision #6: Quality Gate Pipeline**:
- 5항목 품질 검수 (결론 명확성, 근거 충분성, 리스크 언급, 형식 적절성, 논리 일관성)
- 15점 이상 PASS, 미만 FAIL -> 자동 재작업 (최대 2회)
- quality_reviews 테이블에 검수 결과 기록

### 구현 핵심 포인트

1. **ManagerSynthesisService는 별도 파일**: `manager-synthesis.ts`로 분리
2. **synthesize()가 반환하는 것**: LLM이 생성한 종합 보고서 문자열 (quality gate에 직접 전달)
3. **프롬프트 구조**: v1 패턴 + 4섹션 포맷 지시 추가
4. **maxToolIterations: 0**: synthesis는 도구 사용 불필요 (결과 취합만)
5. **fallback**: synthesis LLM 호출 실패 시 formatDelegationResult() 결과 사용
6. **chief-of-staff.ts 수정**: Phase 2에서 formatDelegationResult -> synthesize 교체 (약 5줄 변경)
7. **rework 경로**: 기존 delegate() 단순 호출 유지 (피드백 기반이므로 전체 재종합 불필요)

### 구현 시 주의사항

1. **manager-delegate.ts의 formatDelegationResult()는 유지**: 삭제하지 말 것 -- fallback으로 사용 + 다른 곳에서 참조 가능
2. **DelegationTracker 수정 시 기존 메서드 보존**: synthesisStarted/Completed/Failed만 추가
3. **import 경로**: kebab-case, 실제 대소문자 일치 필수
4. **테스트**: bun:test, mock agentRunner.execute()
5. **기존 테스트 회귀 없음**: chief-of-staff 100개, manager-delegate 46개, command-router 136개

### 아키텍처 제약사항

- **tenant 격리**: 모든 쿼리에 companyId WHERE 필수
- **API 응답 표준**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **파일명**: kebab-case (`manager-synthesis.ts`)
- **테스트**: bun:test 프레임워크
- **LLM 단일 호출 타임아웃**: 30초 (NFR3)
- **전체 체인 타임아웃**: 5분 (NFR2)

### Project Structure Notes

- 새 파일: `packages/server/src/services/manager-synthesis.ts`
- 수정: `packages/server/src/services/chief-of-staff.ts` (Phase 2에서 synthesize 호출 추가)
- 수정: `packages/server/src/services/delegation-tracker.ts` (synthesis 이벤트 추가)
- 테스트: `packages/server/src/__tests__/unit/manager-synthesis.test.ts`
- 참고: `packages/server/src/services/manager-delegate.ts` (ManagerDelegationResult 타입, formatDelegationResult)
- 참고: `packages/server/src/services/agent-runner.ts` (AgentRunner.execute() 패턴)

### References

- [Source: packages/server/src/services/manager-delegate.ts] ManagerDelegateService -- delegate(), formatDelegationResult(), ManagerDelegationResult type
- [Source: packages/server/src/services/chief-of-staff.ts:528-556] Phase 2 delegate + formatDelegationResult -> quality gate
- [Source: packages/server/src/services/chief-of-staff.ts:342-399] qualityGate() -- 5항목 품질 검수
- [Source: packages/server/src/services/chief-of-staff.ts:596-629] rework 로직 -- delegate() 단순 재실행
- [Source: packages/server/src/services/agent-runner.ts] AgentRunner.execute() -- 에이전트 실행 패턴
- [Source: packages/server/src/services/delegation-tracker.ts] DelegationTracker -- 위임 체인 이벤트
- [Source: /home/ubuntu/CORTHEX_HQ/web/agent_router.py:1630-1710] v1 synthesis -- Manager LLM 종합 보고서 생성
- [Source: _bmad-output/planning-artifacts/epics.md#E5-S4] 스토리 수용 기준
- [Source: _bmad-output/implementation-artifacts/5-3-manager-delegate-parallel-specialist.md] Story 5-3 -- ManagerDelegate 구현 세부사항
- [Source: _bmad-output/implementation-artifacts/5-2-chief-of-staff-auto-classify-delegate.md] Story 5-2 -- ChiefOfStaff 구현 세부사항

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- v1 synthesis pattern analyzed: Manager LLM call with synthesis_prompt (line 1630-1646)
- v1 report structure: synthesis_prompt includes manager analysis + specialist parts concatenated
- v2 enhancement: 4-section format (conclusion/analysis/risk/recommendation) added to synthesis prompt
- ManagerSynthesisService implemented: synthesize() + buildSynthesisPrompt() in manager-synthesis.ts
- v1 pattern preserved: "당신은 {name}입니다. 결과를 취합만 하세요. 도구를 다시 사용할 필요 없습니다."
- 4-section report format added: 결론/분석/리스크/추천
- maxToolIterations: 0 for synthesis (no tool usage, result synthesis only)
- Fallback on LLM failure: formatDelegationResult() text concatenation
- DelegationTracker: added synthesisCompleted/synthesisFailed methods + SYNTHESIS_COMPLETED/SYNTHESIS_FAILED event types
- ChiefOfStaff Phase 2: replaced formatDelegationResult() with managerSynthesize() call
- Added Phase 2b (synthesize) between delegate and quality gate
- Rework path preserved: existing delegate() simple re-execution unchanged
- orchestration_tasks: type='synthesize' records created for synthesis step
- 16 new tests: buildSynthesisPrompt (8), DelegationTracker synthesis events (5), integration (3)
- 280 orchestration tests pass (0 failures): chief-of-staff 100, manager-delegate 46, delegation-tracker 118, manager-synthesis 16

### Change Log

- 2026-03-07: Story 5-4 implementation complete -- ManagerSynthesisService + ChiefOfStaff integration + DelegationTracker events + 16 tests

### File List

- packages/server/src/services/manager-synthesis.ts (NEW)
- packages/server/src/services/chief-of-staff.ts (MODIFIED -- import managerSynthesize, Phase 2b synthesize call)
- packages/server/src/services/delegation-tracker.ts (MODIFIED -- SYNTHESIS_COMPLETED/SYNTHESIS_FAILED events + methods)
- packages/server/src/__tests__/unit/manager-synthesis.test.ts (NEW)
