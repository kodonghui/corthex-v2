# Story 14.2: E8 경계 위반 수정 + engine/index.ts 생성
Status: backlog

## Story
As a developer,
I want the engine module to expose a clean public API through engine/index.ts,
so that external code cannot directly import internal engine modules (soul-renderer, model-selector) and the E8 architecture boundary is enforced.

## Context (from code audit 2026-03-11)
- Architecture rule E8: engine/ public API = `agent-loop.ts` + `types.ts` only
- Currently NO `engine/index.ts` exists
- 5 production files directly import `engine/soul-renderer` (renderSoul)
- 2 production files directly import `engine/model-selector` (selectModel, selectModelFromDB)
- Test files also import directly but that's acceptable for unit tests

## Violation List (production code only)

### soul-renderer direct imports (5 files):
1. `routes/workspace/hub.ts` — `import { renderSoul } from '../../engine/soul-renderer'`
2. `tool-handlers/builtins/call-agent.ts` — `import { renderSoul } from '../../engine/soul-renderer'`
3. `services/organization.ts` — `import { renderSoul } from '../engine/soul-renderer'`
4. `services/argos-evaluator.ts` — `import { renderSoul } from '../engine/soul-renderer'`
5. `services/agora-engine.ts` — `import { renderSoul } from '../engine/soul-renderer'`

### model-selector direct imports (1 production file):
1. `services/organization.ts` — `import { selectModelFromDB } from '../engine/model-selector'`

### Also importing agent-loop and types directly (4 files):
1. `routes/workspace/hub.ts` — runAgent, sseStream, SessionContext
2. `tool-handlers/builtins/call-agent.ts` — runAgent, SessionContext, SSEEvent
3. `services/argos-evaluator.ts` — collectAgentResponse, SessionContext
4. `services/agora-engine.ts` — collectAgentResponse, SessionContext

## Acceptance Criteria
1. **Given** `engine/index.ts` is created, **When** external code needs engine functions, **Then** it imports from `engine/index.ts` (or `../../engine`) not from internal files
2. **Given** the public API, **When** checking exports, **Then** only these are exported: `runAgent`, `collectAgentResponse`, `getActiveSessions`, `renderSoul`, `selectModel`, `selectModelFromDB`, `sseStream`, and all types from `types.ts`
3. **Given** all 5 soul-renderer violation files, **When** import paths are updated, **Then** they import `renderSoul` from `engine/index.ts` (or `../../engine`)
4. **Given** organization.ts model-selector import, **When** path is updated, **Then** it imports `selectModelFromDB` from `engine/index.ts` (or `../engine`)
5. **Given** all direct agent-loop/types/sse-adapter imports, **When** updated, **Then** they go through engine/index.ts
6. **Given** all changes, **When** `npx tsc --noEmit` runs, **Then** no type errors
7. **Given** all changes, **When** existing tests run, **Then** all pass (test files may keep direct imports)

## Tasks / Subtasks
- [ ] Task 1: Create engine/index.ts barrel export (AC: #1, #2)
  - [ ] Export from agent-loop: runAgent, collectAgentResponse, getActiveSessions
  - [ ] Export from types: all types (SessionContext, SSEEvent, PreToolHookResult, Tool, RunAgentOptions)
  - [ ] Export from soul-renderer: renderSoul
  - [ ] Export from model-selector: selectModel, selectModelFromDB
  - [ ] Export from sse-adapter: sseStream
- [ ] Task 2: Fix soul-renderer violations (AC: #3)
  - [ ] hub.ts: change import path
  - [ ] call-agent.ts: change import path
  - [ ] organization.ts: change import path
  - [ ] argos-evaluator.ts: change import path
  - [ ] agora-engine.ts: change import path
- [ ] Task 3: Fix model-selector violations (AC: #4)
  - [ ] organization.ts: change import path
- [ ] Task 4: Fix agent-loop/types/sse-adapter direct imports (AC: #5)
  - [ ] hub.ts: consolidate all engine imports to single import from engine/index
  - [ ] call-agent.ts: same
  - [ ] argos-evaluator.ts: same
  - [ ] agora-engine.ts: same
- [ ] Task 5: Verify (AC: #6, #7)
  - [ ] npx tsc --noEmit
  - [ ] Run existing tests

## Dev Notes
- Keep engine/index.ts as a thin barrel file — just re-exports, no logic
- Test files can keep direct imports (unit tests testing internals is OK)
- Import path: external code uses `../../engine` (resolves to engine/index.ts)
- Do NOT rename or move any engine internal files
