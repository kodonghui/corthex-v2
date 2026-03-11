# Story 4.2: 호출자 Import 전환 (텔레그램, ARGOS, AGORA, 자동매매)

Status: done

## Story

As a 시스템,
I want 4개 호출 경로가 agent-runner 대신 agent-loop를 사용하는 것을,
so that 모든 에이전트 실행이 새 엔진을 통과한다.

## Acceptance Criteria

1. `services/argos-evaluator.ts` — import 교체 + SessionContext 생성 코드 추가
2. `services/agora-engine.ts` — import 교체 + SessionContext 생성 코드 추가
3. `services/telegram-bot.ts` — import 교체 + SessionContext 생성 코드 추가
4. `services/vector-executor.ts` — import 교체 + SessionContext 생성 코드 추가
5. 불가침 원칙: 비즈니스 로직/기능 변경 없음 (S12)
6. SessionContext 소스: 각 서비스의 설정/JWT에서 companyId 추출
7. 기존 에러 핸들링 패턴 통합 (새 에러 코드 사용)

## Codebase Reality vs Epic Expectations

**CRITICAL**: 실제 코드 분석 결과, epic의 파일 이름이 실제 파일과 다르고, 4개 파일 중 2개만 직접 agent-runner/ai 함수를 호출함:

| Epic 예상 경로 | 실제 파일 | 직접 호출 여부 | 실제 사용 함수 |
|---|---|---|---|
| `services/telegram/handler.ts` | `services/telegram-bot.ts` (1073줄) | **간접** — chief-of-staff.ts 통해 | `chiefOfStaffProcess()` |
| `services/argos/scheduler.ts` | `services/argos-evaluator.ts` (580줄) | **직접** | `orchestrateSecretary()`, `generateAgentResponse()` |
| `routes/workspace/agora.ts` | `services/agora-engine.ts` (454줄) | **직접** | `agentRunner.execute()` |
| `services/trading/executor.ts` | `services/vector-executor.ts` (371줄) | **간접** — delegationTracker만 사용 | `delegationTracker` (이벤트 전용) |

**결론**:
- **직접 전환 대상**: argos-evaluator.ts, agora-engine.ts (2개)
- **간접 의존**: telegram-bot.ts (chief-of-staff → Phase 2 삭제 대상), vector-executor.ts (delegationTracker만 사용 → engine/hooks/delegation-tracker.ts가 이미 교체)
- S12 불가침 원칙에 따라, telegram-bot.ts와 vector-executor.ts는 **비즈니스 로직을 변경하지 않고** 중간 레이어(chief-of-staff, delegation-tracker)의 교체만으로 자동 전환됨

## Tasks / Subtasks

- [x] Task 1: argos-evaluator.ts — import 교체 (AC: #1, #5, #6, #7)
  - [x] 1.1 `orchestrateSecretary()` (line 378-385) → `runAgent()` + SessionContext 교체
  - [x] 1.2 `generateAgentResponse()` (line 388-395) → `runAgent()` + SessionContext 교체
  - [x] 1.3 SessionContext 생성: `trigger.companyId`, `trigger.userId`, `session.id`
  - [x] 1.4 AsyncGenerator → 단일 응답 수집 (collect all 'message' events → join)
  - [x] 1.5 `renderSoul()` 호출: agent.soul 템플릿 변수 치환
  - [x] 1.6 에러 핸들링: error event → throw

- [x] Task 2: agora-engine.ts — import 교체 (AC: #2, #5, #6, #7)
  - [x] 2.1 `agentRunner.execute()` (line 196-200) → `runAgent()` 교체 (debate speech)
  - [x] 2.2 `agentRunner.execute()` (line 340-343) → `runAgent()` 교체 (consensus synthesis)
  - [x] 2.3 SessionContext 생성: context.companyId, debate-level session
  - [x] 2.4 AsyncGenerator → 단일 응답 수집
  - [x] 2.5 `renderSoul()` 호출
  - [x] 2.6 에러 핸들링: error event → throw

- [x] Task 3: telegram-bot.ts — 간접 의존 확인 + 문서화 (AC: #3, #5)
  - [x] 3.1 직접 agent-runner import 없음 확인
  - [x] 3.2 chief-of-staff.ts 통한 간접 호출 경로 문서화
  - [x] 3.3 Phase 2 (Epic 5 — chief-of-staff 삭제 시) 전환 계획 확인

- [x] Task 4: vector-executor.ts — 간접 의존 확인 + 문서화 (AC: #4, #5)
  - [x] 4.1 직접 agent-runner import 없음 확인
  - [x] 4.2 delegationTracker import — 간접 의존만 확인
  - [x] 4.3 delegation-tracker.ts (서비스) → engine/hooks/delegation-tracker.ts 전환 여부 확인

- [x] Task 5: 빌드 검증
  - [x] 5.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors
  - [x] 5.2 기존 테스트 깨지지 않음 확인 (hub-route 22/22 pass, pre-existing failures unrelated)

## Dev Notes

### 핵심 원칙

- **S12 불가침**: 비즈니스 로직/기능 변경 없음. import 교체 + SessionContext 추가만
- **D6 단일 진입점**: 모든 에이전트 실행 → engine/agent-loop.ts
- **D1 멀티테넌시**: getDB(companyId) 통해서만 DB 접근

### runAgent() API (engine/agent-loop.ts)

```typescript
export async function* runAgent(options: RunAgentOptions): AsyncGenerator<SSEEvent>

interface RunAgentOptions {
  ctx: SessionContext
  soul: string       // renderSoul() 결과
  message: string
  tools?: Tool[]
}
```

### AsyncGenerator → 단일 응답 변환 패턴

argos와 agora는 비스트리밍 — `runAgent()`가 AsyncGenerator를 반환하지만, 이 서비스들은 단일 문자열 응답이 필요. 패턴:

```typescript
async function collectResponse(options: RunAgentOptions): Promise<string> {
  const parts: string[] = []
  for await (const event of runAgent(options)) {
    if (event.type === 'message') {
      parts.push(event.content)
    }
    if (event.type === 'error') {
      throw new Error(event.message)
    }
  }
  return parts.join('')
}
```

### SessionContext 구성 패턴 (각 서비스별)

#### argos-evaluator.ts
```typescript
const ctx: SessionContext = {
  cliToken: process.env.ANTHROPIC_API_KEY || '',
  userId: trigger.userId,
  companyId: trigger.companyId,
  depth: 0,
  sessionId: session.id,  // DB에서 생성된 session
  startedAt: Date.now(),
  maxDepth: 3,
  visitedAgents: [agent.id],
}
```

#### agora-engine.ts
```typescript
const ctx: SessionContext = {
  cliToken: process.env.ANTHROPIC_API_KEY || '',
  userId: context.userId || 'agora-system',
  companyId: context.companyId,
  depth: 0,
  sessionId: crypto.randomUUID(),
  startedAt: Date.now(),
  maxDepth: 1,  // debate는 핸드오프 없음
  visitedAgents: [agentId],
}
```

### 기존 agentRunner.execute() 시그니처 (agora-engine.ts에서 사용)

```typescript
agentRunner.execute(
  agentConfig,                    // { agentId, name, soul, modelName, ... }
  { messages: [{ role: 'user', content: prompt }] },
  context,                        // { companyId, agentId, agentName, source }
)
// Returns: { response: string, usage?: { ... } }
```

### 기존 orchestrateSecretary() 시그니처 (argos-evaluator.ts에서 사용)

```typescript
orchestrateSecretary({
  secretaryAgentId: agent.id,
  sessionId: session.id,
  companyId: trigger.companyId,
  userMessage: trigger.instruction,
  userId: trigger.userId,
})
// Returns: string (final response)
```

### 기존 generateAgentResponse() 시그니처

```typescript
generateAgentResponse({
  agentId: agent.id,
  sessionId: session.id,
  companyId: trigger.companyId,
  userMessage: trigger.instruction,
  userId: trigger.userId,
})
// Returns: string
```

### renderSoul + engine imports

```typescript
import { runAgent } from '../engine/agent-loop'
import { renderSoul } from '../engine/soul-renderer'
import type { SessionContext } from '../engine/types'
```

### Error Codes

```typescript
import { ERROR_CODES } from '../lib/error-codes'
// AGENT_SPAWN_FAILED, AGENT_TIMEOUT, etc.
```

### Previous Story Intelligence (4.1)

- hub.ts 패턴: runAgent() → sseStream() → ReadableStream
- SessionContext: cliToken from env, depth 0, maxDepth 3
- renderSoul(soulTemplate, agentId, companyId) 필요
- 테스트: mock.module() + dynamic import 패턴

### Architecture References

- [Source: architecture.md → S11 호출자 목록 (lines 922-931)]
- [Source: architecture.md → S12 불가침 정의 (lines 912-920)]
- [Source: architecture.md → D6 단일 진입점 (line 348)]
- [Source: epics.md → Story 4.2 (lines 517-536)]
- [Source: services/argos-evaluator.ts → orchestrateSecretary (line 378), generateAgentResponse (line 388)]
- [Source: services/agora-engine.ts → agentRunner.execute (lines 196, 340)]
- [Source: services/telegram-bot.ts → chiefOfStaffProcess (indirect, lines 857, 967)]
- [Source: services/vector-executor.ts → delegationTracker (indirect, lines 256, 259)]

### Project Structure Notes

- 수정 파일: `packages/server/src/services/argos-evaluator.ts`, `packages/server/src/services/agora-engine.ts`
- 확인만 필요: `packages/server/src/services/telegram-bot.ts`, `packages/server/src/services/vector-executor.ts`
- chat.ts 미수정 (S3 역할 분리)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: argos-evaluator.ts — Replaced `orchestrateSecretary()` + `generateAgentResponse()` dynamic imports with `runAgent()`. Added `soul` to agent query. SessionContext from trigger.companyId/userId/session.id. AsyncGenerator collected to single string.
- Task 2: agora-engine.ts — Replaced `agentRunner.execute()` (speech + synthesis) with `runAgent()`. Removed `AgentConfig`/`LLMRouterContext` types. `detectConsensus()` signature changed: `context: LLMRouterContext` → `companyId: string`. Added renderSoul for agent souls.
- Task 3: telegram-bot.ts — Confirmed: no direct agent-runner/orchestrator/ai imports. Uses chiefOfStaffProcess() indirectly (Phase 2 target).
- Task 4: vector-executor.ts — Confirmed: no direct agent-runner imports. Uses delegationTracker only.
- Task 5: Build verification — `tsc --noEmit` 0 errors. Hub-route tests 22/22 pass. Pre-existing test failures (drizzle sum export, messengerMembers) unrelated.

### File List

- `packages/server/src/services/argos-evaluator.ts` — MODIFIED (imports + orchestration block replaced + empty response guard)
- `packages/server/src/services/agora-engine.ts` — MODIFIED (imports + agentRunner.execute → runAgent x2 + empty response guard)
- `packages/server/src/engine/agent-loop.ts` — MODIFIED (simplify: added collectAgentResponse utility)
- `packages/server/src/__tests__/unit/caller-import-migration.test.ts` — NEW (17 TEA tests)
