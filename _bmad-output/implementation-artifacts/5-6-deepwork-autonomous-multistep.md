# Story 5.6: 딥워크 자율 다단계 작업

Status: done

## Story

As a **CEO/비서실장 (오케스트레이션 시스템)**,
I want **에이전트가 복잡한 분석 요청 시 자율적으로 다단계 작업(계획 → 수집 → 분석 → 초안 → 최종)을 수행하는 DeepWorkService**,
so that **딥워크 키워드나 비서실장 분류로 트리거된 명령이 에이전트의 자율적 반복(도구 호출 → 결과 분석 → 추가 도구 호출)을 통해 심층 분석 보고서로 완성된다**.

## Acceptance Criteria

1. **5단계 자율 파이프라인**: DeepWorkService.execute()가 다음 5단계를 순차적으로 실행
   - **Plan**: 에이전트가 작업을 분석하여 단계별 계획 수립 (JSON 배열 파싱)
   - **Collect**: 계획에 따라 도구 호출로 데이터 수집
   - **Analyze**: 수집된 데이터에서 패턴/인사이트 도출
   - **Draft**: 초안 보고서 작성
   - **Finalize**: 검토 및 최종 보고서 완성

2. **컨텍스트 누적**: 이전 단계의 출력이 다음 단계 입력에 자동 주입 (accumulated context)

3. **도구 호출 반복**: 각 단계에서 AgentRunner를 통해 도구 호출 → 결과 분석 → 추가 도구 호출 반복
   - 최대 도구 호출 횟수 제한: 단계별 기본 10회, 전체 기본 30회

4. **WebSocket 진행 상태**: 각 단계 전환 시 EventBus로 상태 이벤트 전송
   - 이벤트: `{ type: 'deepwork-phase', phase: 'plan'|'collect'|'analyze'|'draft'|'finalize', progress: 0-100, commandId }`

5. **타임아웃**: 단계별 60초, 전체 5분(300초) 타임아웃 (NFR2)
   - 타임아웃 시 현재까지 결과로 보고서 생성 (graceful degradation)

6. **결과 저장**: commands 테이블의 result 필드에 최종 보고서 저장, metadata.deepwork에 각 단계별 결과 기록
   - `metadata.deepwork = { phases: [{ name, status, output, durationMs, toolCalls }], totalDurationMs }`

7. **통합 포인트**: CommandRouter에서 type='deepwork'로 분류된 명령이 이 서비스로 라우팅됨
   - 향후 ChiefOfStaff(5-2)에서 "deepwork needed" 판단 시에도 여기로 라우팅

## Tasks / Subtasks

- [x] Task 1: DeepWorkService 핵심 구현 (AC: #1, #2, #3, #5)
  - [x] 1.1 `packages/server/src/services/deep-work.ts` 생성
  - [x] 1.2 DeepWorkPhase 타입 정의: 'plan' | 'collect' | 'analyze' | 'draft' | 'finalize'
  - [x] 1.3 execute(agent, commandText, options) 메서드: 5단계 순차 실행 파이프라인
  - [x] 1.4 각 단계별 시스템 프롬프트 템플릿 (phase-specific prompts)
  - [x] 1.5 컨텍스트 누적 로직: 이전 단계 output → 다음 단계 context에 주입
  - [x] 1.6 단계별 타임아웃 (60초) + 전체 타임아웃 (300초) 구현
  - [x] 1.7 타임아웃 시 graceful degradation: 현재까지 결과로 최종 보고서 생성

- [x] Task 2: WebSocket 진행 상태 전송 (AC: #4)
  - [x] 2.1 EventBus emit: 단계 전환 시 `deepwork-phase` 이벤트 발행
  - [x] 2.2 진행률 계산: plan=0%, collect=20%, analyze=40%, draft=60%, finalize=80%, done=100%

- [x] Task 3: 결과 저장 + 통합 (AC: #6, #7)
  - [x] 3.1 commands 테이블 result/metadata 업데이트 함수
  - [x] 3.2 metadata.deepwork 구조 정의 및 저장
  - [x] 3.3 executeDeepWork API 진입점: DeepWorkService.execute()로 호출 (라우팅은 5-2 ChiefOfStaff에서 통합)

- [x] Task 4: 단위 테스트 (AC: all)
  - [x] 4.1 5단계 파이프라인 정상 동작 테스트
  - [x] 4.2 컨텍스트 누적 테스트 (이전 단계 출력이 다음 단계에 전달)
  - [x] 4.3 타임아웃 테스트 (단계별 + 전체)
  - [x] 4.4 graceful degradation 테스트
  - [x] 4.5 WebSocket 이벤트 발행 테스트
  - [x] 4.6 결과 저장 테스트 (metadata.deepwork 구조)
  - [x] 4.7 에러 핸들링 (AgentRunner 실패, 도구 실패 등)

## Dev Notes

### 기존 코드 현황 (반드시 재사용)

**1. AgentRunner** (`packages/server/src/services/agent-runner.ts`):
- `agentRunner.execute(agent, task, context, toolExecutor)` -- 단일 LLM 호출 + 도구 반복 루프
- `AgentConfig` 타입: id, companyId, name, tier, modelName, soul, allowedTools, isActive
- `TaskRequest` 타입: messages, context, maxToolIterations
- `TaskResponse` 타입: content, toolCalls, usage, cost, finishReason, iterations
- **DeepWork 각 단계는 AgentRunner.execute() 1회 호출 = 1 phase**
- AgentRunner가 이미 도구 호출 반복(maxToolIterations)을 처리하므로 DeepWork은 단계 간 컨텍스트 관리만 담당

**2. CommandRouter** (`packages/server/src/services/command-router.ts`):
- `classify()` 함수: type='deepwork' 분류 이미 존재
- `createCommand()` 함수: DB 저장
- deepwork 타입의 timeoutMs = 300_000 (5분)

**3. EventBus** (`packages/server/src/lib/event-bus.ts`):
- `eventBus.emit(eventName, data)` -- 간단한 EventEmitter
- WebSocket handler가 eventBus를 구독하여 클라이언트에 전송
- 기존 채널: command, delegation, tool, agent-status, cost, debate, system

**4. LLM Router** (`packages/server/src/services/llm-router.ts`):
- `llmRouter.call(request, context)` -- AgentRunner 내부에서 사용
- `LLMRouterContext` 타입: companyId, agentId, agentName 포함

**5. ToolPool** (`packages/server/src/services/tool-pool.ts`):
- `toolPool.execute(toolName, args, toolContext)` -- 도구 실행
- AgentRunner의 toolExecutor 콜백으로 주입

**6. commands 테이블** (`packages/server/src/db/schema.ts:718`):
- metadata: jsonb -- 여기에 deepwork 단계 결과 저장
- result: text -- 최종 보고서 텍스트
- status: varchar -- pending → processing → completed/failed

### v1 참고 (매우 중요)

**v1 딥워크 구현** (`/home/ubuntu/CORTHEX_HQ/src/src/src/src/core/agent.py:549-637`):
```python
class SpecialistAgent(BaseAgent):
    """Supports multi-step 'deep work' for complex tasks."""

    async def execute(self, request):
        max_steps = request.context.get("max_steps", 1)
        if max_steps <= 1:
            return await self.think(...)  # 단일 실행
        return await self._deep_work(request, max_steps)

    async def _deep_work(self, request, max_steps):
        accumulated = []

        # Step 1: Plan -- LLM에게 단계 분해 요청 (JSON 배열)
        plan_raw = await self.think(plan_messages)
        steps = self._parse_steps(plan_raw, max_steps - 1)

        # StatusUpdate 브로드캐스트: 계획 완료
        self.context.log_message(StatusUpdate(..., progress_pct=0.0))

        # Steps 2..N: 각 단계 순차 실행
        for i, step_desc in enumerate(steps):
            context_summary = "\n---\n".join(accumulated[-3:])
            step_result = await self.think(step_messages_with_context)
            accumulated.append(f"### 단계 {i+1}: {step_desc}\n{step_result}")

            # 진행률 브로드캐스트
            self.context.log_message(StatusUpdate(..., progress_pct=(i+1)/len(steps)))

        return "\n\n".join(accumulated)
```

**v2에서 달라지는 점:**
- v1은 SpecialistAgent 내부 메서드 → v2는 독립 DeepWorkService
- v1은 단순 think() 반복 → v2는 AgentRunner.execute() (도구 호출 포함)
- v1은 context.log_message(StatusUpdate) → v2는 eventBus.emit('deepwork-phase', ...)
- v1은 결과를 메모리에만 반환 → v2는 commands 테이블 metadata.deepwork에 저장
- v1은 동적 step 수 → v2는 고정 5단계 (plan/collect/analyze/draft/finalize)

### 구현 패턴

```typescript
// packages/server/src/services/deep-work.ts

import { agentRunner, type AgentConfig } from './agent-runner'
import { eventBus } from '../lib/event-bus'
import type { LLMRouterContext } from './llm-router'
import type { ToolExecutor } from '@corthex/shared'

export type DeepWorkPhase = 'plan' | 'collect' | 'analyze' | 'draft' | 'finalize'

export type DeepWorkPhaseResult = {
  name: DeepWorkPhase
  status: 'completed' | 'timeout' | 'error'
  output: string
  durationMs: number
  toolCalls: number
}

export type DeepWorkResult = {
  phases: DeepWorkPhaseResult[]
  finalReport: string
  totalDurationMs: number
}

export type DeepWorkOptions = {
  commandId: string
  companyId: string
  phaseTimeoutMs?: number   // default 60_000
  totalTimeoutMs?: number   // default 300_000
  maxToolIterationsPerPhase?: number  // default 10
}
```

### 단계별 시스템 프롬프트 설계

- **Plan**: "주어진 업무를 분석하여 4단계(수집/분석/초안/최종) 계획을 세우세요. JSON 배열로 응답."
- **Collect**: "계획에 따라 필요한 데이터를 수집하세요. 도구를 적극 활용하세요."
- **Analyze**: "수집된 데이터에서 핵심 인사이트와 패턴을 도출하세요."
- **Draft**: "분석 결과를 바탕으로 보고서 초안을 작성하세요."
- **Finalize**: "초안을 검토하고 최종 보고서를 완성하세요. 마크다운 형식으로."

### 아키텍처 제약사항

- **tenant 격리**: commandId로 접근 시 companyId WHERE 필수
- **API 응답 표준**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **파일명**: kebab-case (`deep-work.ts`)
- **테스트**: bun:test 프레임워크 사용
- **import 경로**: 실제 파일 대소문자와 일치 필수 (Linux CI)
- **NFR2**: 복합 명령 전체 5분 타임아웃
- **NFR4**: WebSocket 이벤트 < 500ms 전달

### Project Structure Notes

- 새 파일: `packages/server/src/services/deep-work.ts`
- 수정: `packages/server/src/routes/commands.ts` (deepwork 라우팅 추가)
- 테스트: `packages/server/src/__tests__/unit/deep-work.test.ts`
- 의존: `packages/server/src/services/agent-runner.ts` (AgentRunner)
- 의존: `packages/server/src/lib/event-bus.ts` (EventBus)
- 의존: `packages/server/src/db/schema.ts` (commands 테이블)

### References

- [Source: packages/server/src/services/agent-runner.ts] AgentRunner.execute() + AgentConfig 타입
- [Source: packages/server/src/services/command-router.ts:7] CommandType 'deepwork' 정의
- [Source: packages/server/src/services/command-router.ts:66] deepwork timeout 300_000ms
- [Source: packages/server/src/lib/event-bus.ts] EventBus (EventEmitter)
- [Source: packages/server/src/db/schema.ts:718-734] commands 테이블 (metadata jsonb, result text)
- [Source: /home/ubuntu/CORTHEX_HQ/src/src/src/src/core/agent.py:549-637] v1 SpecialistAgent._deep_work()
- [Source: _bmad-output/planning-artifacts/epics.md#E5-S6] 스토리 수용 기준
- [Source: _bmad-output/planning-artifacts/architecture.md] NFR2(5분), NFR4(WebSocket <500ms)
- [Source: packages/shared/src/types.ts:207-233] TaskRequest, TaskResponse, ToolExecutor 타입

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- v1 SpecialistAgent._deep_work() 패턴 완전 분석: Plan → N steps → accumulated context
- v2 설계: 5 고정 단계, AgentRunner.execute() per phase, EventBus progress, metadata.deepwork 저장
- AgentRunner가 이미 도구 반복 루프 처리 → DeepWork은 단계 간 컨텍스트 오케스트레이션만 담당
- 기존 CommandRouter의 deepwork 타입 + 300초 타임아웃 활용
- DeepWorkService 구현 완료: 5-phase pipeline, context accumulation, phase timeouts, graceful degradation
- EventBus deepwork-phase 이벤트: plan(0%), collect(20%), analyze(40%), draft(60%), finalize(80%), done(100%)
- DB 저장: commands.result에 최종 보고서, commands.metadata.deepwork에 단계별 결과
- 24 unit tests 전부 통과 (130 expect calls)
- TEA: 27 risk-based tests 추가 (timeout race conditions, context corruption, DB failure, event ordering 등)
- 총 51 tests, 202 expect calls
- 기존 테스트 3638 pass, 136 fail (pre-existing departmentKnowledge 이슈, 이 스토리와 무관)

### Change Log

- 2026-03-07: Story 5-6 implementation complete -- DeepWorkService + 24 tests
- 2026-03-07: TEA: 27 risk-based tests added (51 total)
- 2026-03-07: Code review: saveResult made private, removed unused accumulatedContext param from buildFinalReport, removed unused spyOn import

### File List

- packages/server/src/services/deep-work.ts (NEW)
- packages/server/src/__tests__/unit/deep-work.test.ts (NEW)
- packages/server/src/__tests__/unit/deep-work-tea.test.ts (NEW)
