# Story 3.1: tool-permission-guard — PreToolUse Hook

Status: done

## Story

As a 보안 시스템,
I want 에이전트가 허용된 도구만 호출할 수 있는 것을,
so that CMO가 kr_stock을 쓰거나 CIO가 sns_manager를 쓸 수 없다.

## Acceptance Criteria

1. [ ] `packages/server/src/engine/hooks/tool-permission-guard.ts` (~20줄) 생성
2. [ ] PreToolUse 시그니처: `(ctx, toolName, toolInput) => Promise<PreToolHookResult>` (E2)
3. [ ] `call_agent` 도구는 항상 허용 (내장 도구)
4. [ ] 에이전트의 `allowedTools` DB 조회: `getDB(ctx.companyId).agentById(currentAgentId)`
5. [ ] `allowedTools` 빈 배열 → 모든 도구 허용 (제한 없음)
6. [ ] `allowedTools`에 toolName 포함 → `{ allow: true }`
7. [ ] `allowedTools`에 toolName 미포함 → `{ allow: false, reason: TOOL_PERMISSION_DENIED }`
8. [ ] deny 시 이후 Hook 실행 안 함 (D4 순서)
9. [ ] 단위 테스트: call_agent 예외, 빈 배열 허용, 허용 도구, 거부 도구 4케이스

## Tasks / Subtasks

- [x] Task 1: hooks 디렉토리 + tool-permission-guard.ts 구현 (AC: #1~#8)
  - [x] 1.1 `packages/server/src/engine/hooks/` 디렉토리 생성
  - [x] 1.2 `tool-permission-guard.ts` 파일 생성 (20줄)
  - [x] 1.3 call_agent 체크: toolName === 'call_agent' → `{ allow: true }` 즉시 반환
  - [x] 1.4 현재 에이전트 ID 얻기: `ctx.visitedAgents[ctx.visitedAgents.length - 1]`
  - [x] 1.5 DB 조회: `getDB(ctx.companyId).agentById(currentAgentId)` → allowedTools 추출
  - [x] 1.6 빈 배열 체크: `!agent.allowedTools || agent.allowedTools.length === 0` → `{ allow: true }`
  - [x] 1.7 포함 체크: `agent.allowedTools.includes(toolName)` → allow/deny

- [x] Task 2: 단위 테스트 (AC: #9)
  - [x] 2.1 `packages/server/src/__tests__/unit/tool-permission-guard.test.ts` 생성
  - [x] 2.2 테스트: call_agent 항상 허용 (DB 조회 안 함)
  - [x] 2.3 테스트: allowedTools 빈 배열 → 모든 도구 허용
  - [x] 2.4 테스트: toolName이 allowedTools에 포함 → allow: true
  - [x] 2.5 테스트: toolName이 allowedTools에 미포함 → allow: false, reason: TOOL_PERMISSION_DENIED

- [x] Task 3: 빌드 검증
  - [x] 3.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors
  - [x] 3.2 `bun test packages/server/src/__tests__/unit/tool-permission-guard.test.ts` — 7 PASS

## Dev Notes

### Architecture Decisions

- **D4 (Hook 순서):** PreToolUse는 도구 호출 전 실행. permission deny 시 이후 PostToolUse Hook 전부 스킵.
- **E2 (Hook 구현 표준):** PreToolUse 시그니처: `(ctx: SessionContext, toolName: string, toolInput: unknown) => PreToolHookResult`. DB 접근이 필요하므로 `Promise<PreToolHookResult>` 반환.
- **D1 (DB 격리):** `getDB(ctx.companyId).agentById()` 통해서만 접근. `db` 직접 import 금지.
- **E8 (engine 경계):** tool-permission-guard.ts는 `engine/hooks/`에 위치하므로 engine 내부. engine/types.ts import 가능.

### Function Signature

```typescript
export async function toolPermissionGuard(
  ctx: SessionContext,
  toolName: string,
  _toolInput: unknown,
): Promise<PreToolHookResult>
```

### Imports

```typescript
import { getDB } from '../../db/scoped-query'
import { ERROR_CODES } from '../../lib/error-codes'
import type { SessionContext, PreToolHookResult } from '../types'
```

### 현재 에이전트 ID 얻기

`ctx.visitedAgents` 배열의 마지막 요소가 현재 에이전트 ID:
```typescript
const currentAgentId = ctx.visitedAgents[ctx.visitedAgents.length - 1]
```
(call-agent.ts에서도 동일 패턴 사용)

### agentById 반환 형태

`getDB(companyId).agentById(id)` → `Agent[]` 배열 반환 (Drizzle select). 첫 번째 요소 확인:
```typescript
const [agent] = await getDB(ctx.companyId).agentById(currentAgentId)
```

Agent 객체에서 사용할 필드:
- `agent.allowedTools` — jsonb `string[]` (DB schema: `allowed_tools` 컬럼, default `[]`)

### allowedTools 로직

```typescript
// 1. call_agent은 항상 허용
if (toolName === 'call_agent') return { allow: true }

// 2. 현재 에이전트 조회
const currentAgentId = ctx.visitedAgents[ctx.visitedAgents.length - 1]
const [agent] = await getDB(ctx.companyId).agentById(currentAgentId)

// 3. 빈 배열 = 제한 없음
const tools = (agent?.allowedTools as string[]) || []
if (tools.length === 0) return { allow: true }

// 4. 포함 여부
if (tools.includes(toolName)) return { allow: true }
return { allow: false, reason: ERROR_CODES.TOOL_PERMISSION_DENIED }
```

### DB Schema Reference

`agents` 테이블 (schema.ts line 160):
```typescript
allowedTools: jsonb('allowed_tools').default([])
```
- 타입: `jsonb` → runtime에서 `unknown`으로 반환. `as string[]` 캐스팅 필요.

### Mock 전략 (테스트)

```typescript
import { mock } from 'bun:test'

const mockAgentById = mock(() => Promise.resolve([]))
const mockGetDB = mock(() => ({ agentById: mockAgentById }))

mock.module('../../db/scoped-query', () => ({ getDB: mockGetDB }))

// Import AFTER mocking
const { toolPermissionGuard } = await import('../../engine/hooks/tool-permission-guard')
```

### Previous Story Intelligence (Story 2.6)

- **패턴:** getDB mock → `mockGetDB.mockReturnValue({ agentById: mockAgentById })`. agentById는 배열 반환.
- **테스트:** 각 케이스별 `mockAgentById.mockResolvedValue([{ allowedTools: [...] }])` 설정.
- **파일 크기:** call-agent.ts 40줄. tool-permission-guard.ts는 ~20줄 목표 (더 간단).
- **빌드:** tsc 0 errors + bun test 전부 PASS 필수.

### Project Structure Notes

- `packages/server/src/engine/hooks/` 디렉토리가 아직 없음 → 생성 필요
- 테스트: `packages/server/src/__tests__/unit/tool-permission-guard.test.ts`
- engine 내부이므로 engine/types.ts import 가능
- engine 외부 모듈에서 hooks/ 직접 import 금지 (agent-loop.ts만 사용)

### References

- [Source: epics.md → Story 3.1 (lines 356-376)]
- [Source: architecture.md → D4 (Hook 순서), E2 (Hook 구현 표준)]
- [Source: engine/types.ts → SessionContext (line 4-13), PreToolHookResult (line 25-28)]
- [Source: db/scoped-query.ts → getDB().agentById() (line 29-30)]
- [Source: db/schema.ts → agents.allowedTools (line 160)]
- [Source: lib/error-codes.ts → TOOL_PERMISSION_DENIED (line 16)]
- [Source: Story 2.6 → getDB mock 패턴, agentById 반환 형태]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **tool-permission-guard.ts:** 20 lines. Async PreToolUse hook with call_agent bypass, DB lookup for agent allowedTools, empty-array-allows-all logic, and TOOL_PERMISSION_DENIED deny.
- **Tests:** 7 tests — call_agent always allowed (no DB), empty allowedTools allows all, null allowedTools allows all, tool in list allowed, tool not in list denied, correct agentId lookup (last visitedAgent), agent not found defensive allow.
- **tsc:** 0 errors. All 7 tests pass.

### File List

- `packages/server/src/engine/hooks/tool-permission-guard.ts` — NEW: PreToolUse permission guard (20 lines)
- `packages/server/src/__tests__/unit/tool-permission-guard.test.ts` — MODIFIED: Replaced old v1-style tests with 7 engine-based unit tests
