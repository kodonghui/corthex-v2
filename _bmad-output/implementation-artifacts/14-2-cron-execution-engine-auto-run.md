# Story 14.2: Cron Execution Engine Auto-Run

Status: done

## Story

As a CEO/Admin,
I want scheduled cron jobs to automatically execute their commands at the specified times and record execution results,
so that repetitive tasks (daily briefings, periodic analyses) run reliably without manual intervention and I can track their outcomes.

## Acceptance Criteria

1. **AC1: Execution Engine Service** -- A `CronExecutionEngine` service (`services/cron-execution-engine.ts`) replaces the existing `schedule-worker.ts` polling logic. Polls every 60 seconds for due schedules (`isActive=true AND nextRunAt <= now`). Instead of creating generic `nightJobs`, it directly executes the command via `CommandRouter.classify()` + orchestration pipeline (same as CEO typing in Command Center). Records each execution in the `cronRuns` table.
2. **AC2: cronRuns Recording** -- Each execution creates a `cronRuns` row: status starts as `running`, commandText = schedule's instruction, startedAt = now. On success: status='success', result=AI response text, completedAt=now, durationMs=elapsed. On failure: status='failed', error=error message, completedAt=now, durationMs=elapsed. Updates schedule's `lastRunAt` after every execution.
3. **AC3: nextRunAt Update** -- After each execution (success or failure), `nextRunAt` is recalculated using `getNextCronDate()` for the next occurrence. Race-condition prevention: nextRunAt updated BEFORE execution starts (optimistic lock pattern from existing schedule-worker).
4. **AC4: Concurrent Execution Limit** -- Maximum 5 jobs running simultaneously (configurable via `MAX_CONCURRENT_CRON_JOBS`). When limit reached, skip remaining due schedules until next poll. Prevents server overload from many schedules firing at once.
5. **AC5: Error Handling & Retry** -- Failed jobs increment `retryCount` on the cronRun. Max 3 retries with exponential backoff (60s, 120s, 240s). Failed jobs don't block other schedules. After max retries, cronRun status = 'failed' permanently, but the schedule itself remains active for future scheduled runs.
6. **AC6: Graceful Shutdown** -- On SIGTERM, stop accepting new jobs but wait for currently running jobs to finish (up to 30s timeout). Integrate with existing shutdown flow in `index.ts`.
7. **AC7: WebSocket Notifications** -- Emit events via `eventBus` on the existing `night-job` channel: `cron-run-started` (when execution begins), `cron-run-completed` (success with durationMs, result preview), `cron-run-failed` (error code, retry info). Events include scheduleId, runId, scheduleName.
8. **AC8: Schedule Status Sync** -- After execution, schedule's `lastRunAt` updated. GET /schedules and GET /schedules/:id reflect real lastRunAt from actual executions (not just job creation).

## Tasks / Subtasks

- [x] Task 1: Create CronExecutionEngine service (AC: #1, #3, #4)
  - [x] 1.1 Create `packages/server/src/services/cron-execution-engine.ts`
  - [x] 1.2 Implement `pollDueSchedules()`: query `nightJobSchedules` WHERE `isActive=true AND nextRunAt <= now`, limit 50
  - [x] 1.3 Implement optimistic lock: update `nextRunAt` BEFORE execution (prevents duplicate runs)
  - [x] 1.4 Implement concurrent execution tracking with `Set<string>` of running schedule IDs
  - [x] 1.5 Add `MAX_CONCURRENT_CRON_JOBS = 5` configurable constant
  - [x] 1.6 Implement 60-second polling interval with `setInterval`
- [x] Task 2: Implement command execution pipeline (AC: #1, #2)
  - [x] 2.1 Create `executeCronJob(schedule)` function
  - [x] 2.2 Insert `cronRuns` row with status='running', commandText=instruction, startedAt=now
  - [x] 2.3 Execute via orchestration: if agent is secretary → `orchestrateSecretary()`, else → `generateAgentResponse()`
  - [x] 2.4 On success: update cronRun status='success', result, completedAt, durationMs
  - [x] 2.5 On failure: update cronRun status='failed', error, completedAt, durationMs
  - [x] 2.6 Always update schedule `lastRunAt = new Date()`
- [x] Task 3: Implement error handling & retry (AC: #5)
  - [x] 3.1 On failure, check retry count. If < 3, schedule retry with exponential backoff
  - [x] 3.2 Retry mechanism: create a new cronRun entry for each retry attempt
  - [x] 3.3 After max retries, mark final cronRun as 'failed', continue with other schedules
- [x] Task 4: WebSocket event notifications (AC: #7)
  - [x] 4.1 Emit `cron-run-started` event when execution begins
  - [x] 4.2 Emit `cron-run-completed` event on success (include durationMs, result preview 200 chars)
  - [x] 4.3 Emit `cron-run-failed` event on failure (include error code, retryCount, maxRetries)
- [x] Task 5: Integrate with server lifecycle (AC: #6)
  - [x] 5.1 Replace `schedule-worker.ts` import in `index.ts` with `cron-execution-engine.ts`
  - [x] 5.2 Export `startCronEngine()` and `stopCronEngine()` functions
  - [x] 5.3 `stopCronEngine()`: clear interval, wait for running jobs (Promise.allSettled), 30s timeout
  - [x] 5.4 Update SIGTERM handler in `index.ts` to use new stop function
- [x] Task 6: Integration validation (AC: #8)
  - [x] 6.1 Verify existing schedule CRUD still works (no regressions) — 54 tests pass
  - [x] 6.2 Verify cronRuns data appears in GET /schedules/:id/runs endpoint — route unchanged, works with new data
  - [x] 6.3 Verify tenant isolation on all operations — companyId enforced in all queries
  - [x] 6.4 Verify WebSocket events broadcast correctly — eventBus.emit on night-job channel

## Dev Notes

### Existing Infrastructure (CRITICAL -- reuse, don't reinvent)

**Current schedule-worker.ts (lib/schedule-worker.ts) -- REPLACE this:**
- Polls every 60s for due schedules
- Creates `nightJobs` via `queueNightJob()` (indirect execution via job-queue)
- Two-hop execution: schedule-worker → nightJobs queue → job-queue worker → AI
- Problem: cronRuns table never written to; execution is via generic nightJobs, losing cron-specific tracking
- **This story replaces the indirect nightJobs approach with direct execution + cronRuns recording**

**Job queue engine (lib/job-queue.ts) -- REFERENCE for execution pattern:**
- `processJob()`: creates chat session, calls `orchestrateSecretary()` or `generateAgentResponse()`, saves messages + memory + report
- Retry logic: exponential backoff (30s × 2^n), max 3 retries
- WebSocket events: job-progress, job-completed, job-failed
- **Reuse this pattern** for cron execution but write to `cronRuns` instead of `nightJobs`

**Schema (cronRuns table from 14-1):**
```
cronRuns: id (uuid PK), companyId, cronJobId (FK→nightJobSchedules), status (running/success/failed),
commandText (text), startedAt, completedAt, result (text), error (text), durationMs (int),
tokensUsed (int), costMicro (int), createdAt
```

**Orchestration pipeline:**
- Secretary agents: `orchestrateSecretary({ secretaryAgentId, sessionId, companyId, userMessage, userId })`
- Regular agents: `generateAgentResponse({ agentId, sessionId, companyId, userMessage, userId })`
- Both in `lib/ai.ts` and `lib/orchestrator.ts`

**Event bus (lib/event-bus.ts):**
- Simple EventEmitter, events bridged to WebSocket in index.ts
- Channel: `night-job` → `broadcastToCompany(companyId, 'night-job', payload)`
- Use same channel for cron events (backward compat with existing client listeners)

### Architecture Patterns to Follow

- **Service pattern:** Standalone module with `start/stop` exports (like schedule-worker, trigger-worker)
- **DB pattern:** Drizzle ORM, `db.select()/insert()/update()`, `eq/and/lte` from drizzle-orm
- **Error isolation:** Individual schedule failures don't crash the engine or block other schedules
- **Tenant isolation:** All queries include `companyId` from schedule record
- **Logging:** Console.log with emoji prefix (📅 for schedule, ✅ for success, ❌ for failure)

### v1 Reference

v1 scheduler (`/home/ubuntu/CORTHEX_HQ/src/src/src/core/scheduler.py`):
- 30-second check loop, calls `orchestrator.process_command(schedule.command)` directly
- Records execution time, cost, tokens in task_store
- WebSocket broadcast on completion/error via `ws_manager.broadcast("task_completed", {...})`
- Updates `last_run`, `run_count`, `next_run` after each execution
- **v2 must replicate:** Direct command execution, result recording, WebSocket notification, schedule status updates

### What's NEW vs schedule-worker.ts

1. **Direct execution** instead of queueing to nightJobs (eliminates 2-hop delay)
2. **cronRuns recording** for dedicated execution history
3. **Concurrent execution limit** (5 max simultaneous)
4. **Graceful shutdown** with running job completion
5. **Retry logic** with exponential backoff on the cronRun level
6. **Rich WebSocket events** with schedule context

### Project Structure Notes

- New: `packages/server/src/services/cron-execution-engine.ts` (main service)
- Modify: `packages/server/src/index.ts` (swap schedule-worker → cron-execution-engine)
- Keep: `packages/server/src/lib/schedule-worker.ts` (can be removed or kept for reference)
- Keep: `packages/server/src/routes/workspace/schedules.ts` (CRUD unchanged)
- Reuse: `packages/server/src/lib/cron-utils.ts` (getNextCronDate)
- Reuse: `packages/server/src/lib/job-queue.ts` (pattern reference for processJob)
- Reuse: `packages/server/src/db/schema.ts` (cronRuns, nightJobSchedules, agents, chatSessions, chatMessages)
- Tests: `packages/server/src/__tests__/unit/cron-execution-engine.test.ts`

### Testing Standards

- Framework: bun:test
- Location: `packages/server/src/__tests__/unit/`
- Pattern: describe/it blocks, mock db operations
- Naming: `cron-execution-engine.test.ts`
- Test categories: polling logic, execution flow, retry logic, concurrent limits, graceful shutdown, WebSocket events, tenant isolation, error handling

### References

- [Source: _bmad-output/planning-artifacts/epics.md - Epic 14, E14-S2]
- [Source: _bmad-output/planning-artifacts/prd.md - FR66]
- [Source: packages/server/src/lib/schedule-worker.ts - current polling worker to replace]
- [Source: packages/server/src/lib/job-queue.ts - execution pattern reference]
- [Source: packages/server/src/db/schema.ts:420 - cronRuns table]
- [Source: packages/server/src/db/schema.ts:386 - nightJobSchedules table]
- [Source: packages/server/src/lib/cron-utils.ts - getNextCronDate utility]
- [Source: packages/server/src/services/command-router.ts - command classification]
- [Source: packages/server/src/lib/event-bus.ts - EventBus for WebSocket]
- [Source: packages/server/src/index.ts - server lifecycle, SIGTERM handler]
- [Source: /home/ubuntu/CORTHEX_HQ/src/src/src/core/scheduler.py - v1 scheduler execution engine]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Story 14-1 done: schema (cronRuns table + nightJobSchedules extensions), cron-utils (validation, step syntax, Korean descriptions), CRUD route with run history, 104 tests
- This story replaces indirect nightJobs queueing with direct cron execution + cronRuns recording
- v1 execution pattern analyzed: direct orchestrator.process_command() + WebSocket broadcast + status updates
- Concurrent limit (5 max) and graceful shutdown are new v2 features not in v1
- Task 1: CronExecutionEngine service created — pollDueSchedules (60s interval, limit 50), optimistic lock (nextRunAt pre-update), concurrent execution tracking (Set<string>), MAX_CONCURRENT_CRON_JOBS=5
- Task 2: executeCronJob pipeline — cronRuns insert (status=running), agent type detection (secretary vs regular), orchestrateSecretary/generateAgentResponse execution, chat session+messages+memory+report auto-creation, cronRuns success/failed update with durationMs
- Task 3: Retry logic — exponential backoff (60s, 120s, 240s), MAX_RETRIES=3, failed jobs don't block others, schedule remains active after max retries for future runs
- Task 4: WebSocket events — cron-run-started, cron-run-completed (with resultPreview 200 chars), cron-run-failed (with willRetry flag), all on night-job channel for backward compat
- Task 5: Server lifecycle integration — replaced schedule-worker imports with cron-execution-engine, async stopCronEngine with Promise.race (allSettled + 30s timeout), SIGTERM handler updated
- Task 6: Integration validation — 54 existing cron CRUD tests + 50 TEA tests pass (0 regressions), 36 new engine tests pass, tenant isolation enforced, WebSocket events verified
- Total: 36 new tests, 104 existing tests pass, 0 regressions

### Change Log

- 2026-03-08: Story 14-2 implemented — CronExecutionEngine service (direct execution, cronRuns recording, concurrent limit, retry, graceful shutdown, WebSocket events), 36 new tests
- 2026-03-08: Code review — 3 issues found (1 MEDIUM, 1 MEDIUM, 1 LOW), all fixed: interruptibleSleep for shutdown-safe retry, cronRuns insert error guard, 88 total tests pass

## Senior Developer Review (AI)

**Date:** 2026-03-08
**Outcome:** Approve (with fixes applied)

### Findings

- [x] [MEDIUM] Retry sleep blocked shutdown — `await new Promise(setTimeout, backoffMs)` could block up to 240s during SIGTERM. **Fixed:** Added `interruptibleSleep()` that checks `shuttingDown` every 1 second.
- [x] [MEDIUM] cronRuns insert failure unhandled — If DB connection fails at `db.insert(cronRuns)`, the error propagated without logging. **Fixed:** Wrapped initial cronRuns insert in try/catch with error logging and early return.
- [x] [LOW] No defensive guard on empty DB result — `const [run] = await db.insert(...)` could destructure undefined if DB returns empty. **Fixed:** Wrapped in try/catch covers this case.

### AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC1: Execution Engine Service | PASS | `services/cron-execution-engine.ts` — 60s poll, direct execution, cronRuns recording |
| AC2: cronRuns Recording | PASS | `executeCronJob()` — insert running, update success/failed with result/error/durationMs |
| AC3: nextRunAt Update | PASS | `pollDueSchedules()` line 89-93 — optimistic lock before execution |
| AC4: Concurrent Limit | PASS | `MAX_CONCURRENT_CRON_JOBS=5`, Set tracking, break on limit |
| AC5: Error Handling & Retry | PASS | Exponential backoff 60/120/240s, MAX_RETRIES=3, isolated failures |
| AC6: Graceful Shutdown | PASS | `stopCronEngine()` — async, Promise.race with 30s timeout |
| AC7: WebSocket Events | PASS | cron-run-started/completed/failed on night-job channel |
| AC8: Schedule Status Sync | PASS | lastRunAt updated on success and failure |

### File List

- packages/server/src/services/cron-execution-engine.ts (new: main execution engine service)
- packages/server/src/index.ts (modify: replaced schedule-worker with cron-execution-engine, async SIGTERM handler)
- packages/server/src/__tests__/unit/cron-execution-engine.test.ts (new: 36 unit tests)
- packages/server/src/__tests__/unit/cron-execution-engine-tea.test.ts (new: 52 TEA risk-based tests)
