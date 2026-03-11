# Story 14.3: 이중 엔진 제거 + 옛 서비스 삭제
Status: backlog

## Story
As a platform operator,
I want all agent execution to go through the single new engine (agent-loop.ts),
so that all hooks (permission, scrubbing, redaction, tracking, cost) are consistently applied and there is only one code path to maintain.

## Context (from code audit 2026-03-11)
- New engine: `engine/agent-loop.ts` (runAgent/collectAgentResponse) — used by 4 callers
- Old engine: `services/agent-runner.ts` → called by chief-of-staff → called by 4 route entry points
- Old orchestration chain: agent-runner → chief-of-staff → manager-delegate → cio-orchestrator
- After 14.1 (hooks wired) and 14.2 (clean API), the new engine is ready to replace the old one

## Old Engine Call Chain
```
routes/commands.ts ─────┐
routes/presets.ts ──────┤
routes/public-api/v1.ts ┤──→ chief-of-staff.ts ──→ agent-runner.ts ──→ Anthropic SDK
services/telegram-bot.ts┘         │
                            manager-delegate.ts
                            cio-orchestrator.ts
                            all-command-processor.ts
                            sequential-command-processor.ts
                            deep-work.ts
                            manager-synthesis.ts
                            soul-gym.ts
                            memory-extractor.ts
                            tool-pool-init.ts
```

## New Engine (target state)
```
routes/commands.ts ─────┐
routes/presets.ts ──────┤
routes/public-api/v1.ts ┤──→ engine/agent-loop.ts (runAgent) ──→ SDK + hooks
services/telegram-bot.ts┘
```

## Acceptance Criteria
1. **Given** commands.ts, **When** processing a user command, **Then** it calls `runAgent` (not chiefOfStaffProcess)
2. **Given** presets.ts, **When** executing a preset command, **Then** it calls `runAgent` (not chiefOfStaffProcess)
3. **Given** public-api/v1.ts, **When** handling API request, **Then** it calls `runAgent` (not chiefOfStaffProcess)
4. **Given** telegram-bot.ts, **When** receiving a telegram message, **Then** it calls `collectAgentResponse` (not chiefOfStaffProcess)
5. **Given** all route callers migrated, **When** checking imports, **Then** no file imports from chief-of-staff, agent-runner, manager-delegate, or cio-orchestrator
6. **Given** old services are unused, **When** checking the codebase, **Then** these files are deleted:
   - services/agent-runner.ts
   - services/chief-of-staff.ts
   - services/manager-delegate.ts
   - services/cio-orchestrator.ts
   - services/all-command-processor.ts
   - services/sequential-command-processor.ts
   - services/deep-work.ts (if only uses old engine)
   - services/manager-synthesis.ts (if only uses old engine)
7. **Given** services that have dual use (soul-gym, memory-extractor, tool-pool-init), **When** they call agent-runner, **Then** those calls are migrated to new engine OR the service is deleted if unused
8. **Given** all changes, **When** `npx tsc --noEmit` runs, **Then** no type errors
9. **Given** all changes, **When** the app starts and processes a command, **Then** hooks fire correctly (permission guard, scrubber, redactor, tracker, cost)

## Tasks / Subtasks
- [ ] Task 1: Understand chief-of-staff interface (AC: #1-4)
  - [ ] Read chief-of-staff.ts to understand what `process()` does
  - [ ] Map the SessionContext creation: how does chief-of-staff build ctx from route params?
  - [ ] Identify what additional logic chief-of-staff adds (routing, delegation, etc.)
  - [ ] Design the replacement: direct runAgent call, or thin adapter
- [ ] Task 2: Migrate 4 route entry points (AC: #1-4)
  - [ ] commands.ts: replace chiefOfStaffProcess with runAgent/collectAgentResponse
  - [ ] presets.ts: same
  - [ ] public-api/v1.ts: same
  - [ ] telegram-bot.ts: same (uses collectAgentResponse for non-streaming)
  - [ ] Ensure SessionContext is properly constructed at each call site
- [ ] Task 3: Audit remaining old engine callers (AC: #5, #7)
  - [ ] For each service using agent-runner: check if it's still called from anywhere
  - [ ] soul-gym.ts: check callers → migrate or delete
  - [ ] memory-extractor.ts: check callers → migrate or delete
  - [ ] tool-pool-init.ts: check callers → migrate or delete
  - [ ] deep-work.ts: check callers → migrate or delete
  - [ ] manager-synthesis.ts: check callers → migrate or delete
  - [ ] orchestration-helpers.ts: check callers → migrate or delete
- [ ] Task 4: Delete old services (AC: #6)
  - [ ] Delete agent-runner.ts
  - [ ] Delete chief-of-staff.ts
  - [ ] Delete manager-delegate.ts
  - [ ] Delete cio-orchestrator.ts
  - [ ] Delete all-command-processor.ts
  - [ ] Delete sequential-command-processor.ts
  - [ ] Delete any other fully unused services from Task 3
  - [ ] Delete corresponding test files
- [ ] Task 5: Update lib/orchestration-helpers.ts (AC: #5)
  - [ ] Remove agent-runner type import → use engine/types
- [ ] Task 6: Verify (AC: #8, #9)
  - [ ] npx tsc --noEmit
  - [ ] Run existing tests (expect some old tests to be deleted)
  - [ ] Verify no remaining imports of old engine files

## Dev Notes
- This is the BIGGEST story — chief-of-staff likely has routing/delegation logic that needs to be preserved
- Key question: does chief-of-staff add value beyond calling agent-runner? If it does routing/delegation, that logic might need to move to the route handlers or a thin utility
- Do NOT lose functionality — if chief-of-staff does something important (like multi-agent routing), extract that logic before deleting
- The old test files (agent-runner.test.ts, chief-of-staff.test.ts, etc.) should be deleted since the code they test is being removed
- After this story, the ONLY way to run an agent is through engine/agent-loop.ts
- blocked_by: ["14.1", "14.2"] — hooks must be wired and boundary fixed first
