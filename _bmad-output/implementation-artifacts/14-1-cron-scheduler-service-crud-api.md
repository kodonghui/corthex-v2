# Story 14.1: Cron Scheduler Service CRUD API

Status: done

## Story

As an Admin/CEO,
I want to create, manage, and monitor scheduled recurring commands via a cron scheduler CRUD API,
so that repetitive tasks (daily briefings, periodic analyses) are automated reliably with full execution history.

## Acceptance Criteria

1. **AC1: Enhanced Schema** -- `nightJobSchedules` table extended with `name` (varchar 200, required), `lastRunAt` (timestamp, nullable), `createdBy` alias clarity. New `cronRuns` table: id, companyId, cronJobId (FK -> nightJobSchedules), status enum (running/success/failed), commandText (snapshot), startedAt, completedAt, result (text), error (text), durationMs (integer), tokensUsed (integer), costUsd (integer micro-cents). Both tables have companyId tenant isolation indexes.
2. **AC2: Cron Expression Validation** -- POST/PATCH endpoints validate cron expression via `validateCronExpression()` utility. Returns parsed human-readable description. Rejects invalid expressions with 400 + specific error message. Support standard 5-field (min hour dom month dow) with *, ranges, lists, and step (*/N) syntax.
3. **AC3: CRUD API Complete** -- Create (POST), Read list (GET), Read single (GET /:id), Update (PATCH /:id), Delete (DELETE /:id), Toggle active (PATCH /:id/toggle). All endpoints enforce companyId tenant isolation. Create/Update auto-calculate nextRunAt via existing `getNextCronDate()`.
4. **AC4: Job History API** -- GET /schedules/:id/runs returns paginated execution history. Supports `?status=success|failed|running`, `?page=1&limit=20` pagination. Returns total count for pagination UI. Ordered by startedAt DESC.
5. **AC5: Next Run Calculation** -- On create, update, toggle-on: nextRunAt recalculated. On toggle-off: nextRunAt set to null. Uses existing `getNextCronDate()` from `lib/cron-utils.ts`.
6. **AC6: Cron Expression Step Support** -- Extend `cron-utils.ts` `parseField()` to support step values (`*/5`, `1-30/5`). Add `validateCronExpression()` export that returns `{ valid: boolean; error?: string; description?: string; nextRun?: Date }`.
7. **AC7: API Response Format** -- All endpoints return `{ data: ... }` (success) or throw HTTPError (failure). List endpoints include `{ data: [...], pagination: { page, limit, total, totalPages } }`.

## Tasks / Subtasks

- [x] Task 1: Extend schema (AC: #1)
  - [x] 1.1 Add `name` column to `nightJobSchedules` (varchar 200, notNull)
  - [x] 1.2 Add `lastRunAt` column to `nightJobSchedules` (timestamp, nullable)
  - [x] 1.3 Create `cronRunStatusEnum` pgEnum: running, success, failed
  - [x] 1.4 Create `cronRuns` pgTable with all columns + companyId index + cronJobId index + status index
  - [x] 1.5 Add `cronRunsRelations` (company, cronJob refs)
  - [x] 1.6 Update `nightJobSchedulesRelations` to include `runs: many(cronRuns)`
- [x] Task 2: Extend cron-utils (AC: #2, #6)
  - [x] 2.1 Add step (`*/N`, `start-end/step`) support to `parseField()`
  - [x] 2.2 Add `validateCronExpression()` function returning `{ valid, error?, description?, nextRun? }`
  - [x] 2.3 Add `describeCronExpression()` function (human-readable Korean text)
  - [x] 2.4 Update existing tests + add new tests for step syntax
- [x] Task 3: Enhance schedules route CRUD (AC: #3, #5, #7)
  - [x] 3.1 Update createScheduleSchema: add `name` (required), keep `cronExpression` direct input (standard 5-field), keep `agentId`, `instruction`
  - [x] 3.2 Update updateScheduleSchema: all fields optional
  - [x] 3.3 Add GET /:id single schedule endpoint
  - [x] 3.4 Update POST to validate cron expression, compute nextRunAt, store name
  - [x] 3.5 Update PATCH to validate cron if changed, recompute nextRunAt
  - [x] 3.6 Update toggle to set nextRunAt=null on deactivate
  - [x] 3.7 Ensure all endpoints return standard response format with description
- [x] Task 4: Add job history endpoints (AC: #4)
  - [x] 4.1 GET /schedules/:id/runs with pagination (page, limit, status filter)
  - [x] 4.2 Return total count + paginated results
  - [x] 4.3 GET /schedules/:id/runs/:runId for single run detail
- [x] Task 5: Integration validation
  - [x] 5.1 Verify tenant isolation on all new endpoints
  - [x] 5.2 Verify all existing schedule functionality still works (backward compat)

## Dev Notes

### Existing Infrastructure (CRITICAL -- reuse, don't reinvent)

**Schema already exists -- EXTEND, don't create new tables:**
- `nightJobSchedules` (schema.ts:376): id, companyId, userId, agentId, instruction, cronExpression, nextRunAt, isActive, createdAt, updatedAt
- `nightJobs` (schema.ts:351): generic job queue with scheduleId FK, status, result, error, startedAt, completedAt
- `nightJobTriggers` (schema.ts:392): event-based triggers (ARGOS story, not this story)

**Cron utilities already exist:**
- `lib/cron-utils.ts`: `getNextCronDate(cronExpression, after?)` -- standard 5-field parser, UTC-based. Supports *, ranges (N-M), lists (N,M,O). Missing: step values (*/N).
- Tests: `__tests__/unit/cron-utils.test.ts`, `cron-utils-extended.test.ts`

**Route already exists:**
- `routes/workspace/schedules.ts`: Full CRUD (list, create, patch, toggle, delete). Uses `buildCronExpression()` helper for frequency/time/days -> cron. Uses `describeCron()` for human-readable text.
- **Important:** Current route accepts `frequency` + `time` + `days` and converts to cron internally. This story should ADD direct `cronExpression` support while keeping backward compat with the frequency-based input.

**Middleware already exists:**
- `authMiddleware` -- JWT auth, sets `tenant` with `companyId`, `userId`
- `departmentScopeMiddleware` -- employee department restriction
- `HTTPError` -- standard error class

### What's NEW in this story

1. **Schema additions:** `name` column on nightJobSchedules, `lastRunAt` column, new `cronRuns` table
2. **Cron validation:** `validateCronExpression()` utility, step syntax support
3. **Route enhancements:** GET single, direct cronExpression input, pagination on runs
4. **cronRuns table:** Dedicated execution history (separate from generic nightJobs queue)

### Architecture Patterns to Follow

- **API pattern:** Hono routes, zValidator for request validation, `c.get('tenant')` for auth context
- **DB pattern:** Drizzle ORM, `db.select()/.insert()/.update()/.delete()`, pgTable definitions
- **Response format:** `{ data: ... }` success, HTTPError for errors, pagination: `{ data, pagination: { page, limit, total, totalPages } }`
- **Enum pattern:** `pgEnum('name', [...])` exported from schema.ts
- **Index pattern:** `index('prefix_column_idx').on(table.column)` in table config callback
- **File naming:** kebab-case, route files in routes/workspace/

### v1 Reference

v1 scheduler (`/home/ubuntu/CORTHEX_HQ/src/src/src/core/scheduler.py`):
- YAML-based config, Korean cron presets (매일 오전 9시, 매주 월요일 등)
- ScheduleEntry: schedule_id, name, command, cron_preset, enabled, last_run, next_run, run_count
- compute_next_run() calculates KST-based next execution
- 30-second check loop with orchestrator.process_command() integration
- WebSocket broadcast on completion/error
- **v2 difference:** DB-backed instead of YAML, standard cron expressions instead of Korean presets, tenant-isolated, dedicated run history table

### Project Structure Notes

- Schema: `packages/server/src/db/schema.ts` (add new enum + table + relations)
- Cron utils: `packages/server/src/lib/cron-utils.ts` (extend parseField + add validate)
- Route: `packages/server/src/routes/workspace/schedules.ts` (enhance existing)
- Tests: `packages/server/src/__tests__/unit/` (cron-utils tests + schedule route tests)

### Testing Standards

- Framework: bun:test
- Location: `packages/server/src/__tests__/unit/`
- Pattern: describe/it blocks, mock db with vi or direct unit tests
- Naming: `{feature}.test.ts`
- Test categories: schema validation, cron parsing, API endpoint behavior, tenant isolation, pagination

### References

- [Source: _bmad-output/planning-artifacts/epics.md - Epic 14, E14-S1]
- [Source: _bmad-output/planning-artifacts/prd.md - FR66]
- [Source: _bmad-output/planning-artifacts/architecture.md - cron_jobs table, cron.ts route, cron-scheduler.ts service]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - Screen #15 크론기지]
- [Source: packages/server/src/db/schema.ts:376 - nightJobSchedules existing table]
- [Source: packages/server/src/lib/cron-utils.ts - getNextCronDate existing utility]
- [Source: packages/server/src/routes/workspace/schedules.ts - existing CRUD route]
- [Source: /home/ubuntu/CORTHEX_HQ/src/src/src/core/scheduler.py - v1 scheduler reference]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Existing infrastructure thoroughly mapped: schema, routes, cron-utils all pre-exist
- This story is an ENHANCEMENT of existing code, not greenfield creation
- v1 scheduler pattern analyzed for feature parity guidance
- Task 1: Schema extended — added `name` (varchar 200), `lastRunAt` (timestamp) to nightJobSchedules. Created `cronRunStatusEnum`, `cronRuns` table with 3 indexes (company, cronJob, status), relations for cronRuns, updated nightJobSchedulesRelations with `runs: many(cronRuns)`
- Task 2: cron-utils extended — `parseField()` now supports step syntax (`*/N`, `N-M/S`, `N/S`). Added `validateCronExpression()` returning `{valid, error?, description?, nextRun?}`. Added `describeCronExpression()` for Korean human-readable output. `parseField` now exported for direct testing.
- Task 3: schedules route enhanced — createScheduleSchema now accepts `name` (required) + `cronExpression` (direct) or `frequency`+`time` (legacy). updateScheduleSchema supports all optional fields including agentId change. Added GET /:id single schedule endpoint. POST/PATCH validate cron via `validateCronExpression()` with 400 error on invalid. Toggle sets nextRunAt=null on deactivate. All endpoints return `{ data }` with `describeCronExpression()`.
- Task 4: Job history endpoints — GET /schedules/:id/runs with pagination (page, limit, status filter). Returns `{ data, pagination: { page, limit, total, totalPages } }`. GET /schedules/:id/runs/:runId for single run detail.
- Task 5: All endpoints enforce companyId tenant isolation. Backward compat maintained — legacy frequency/time/days input still works alongside direct cronExpression.
- 97 tests passing (54 new + 29 existing cron-utils + 14 schema), 0 regressions

### Change Log

- 2026-03-08: Story 14-1 implemented — schema extensions, cron-utils step syntax + validation, enhanced CRUD route with runs history, 54 new tests

### File List

- packages/server/src/db/schema.ts (modify: added cronRunStatusEnum, name+lastRunAt columns on nightJobSchedules, cronRuns table, cronRunsRelations, updated nightJobSchedulesRelations)
- packages/server/src/lib/cron-utils.ts (modify: step syntax in parseField, exported parseField, added validateCronExpression + describeCronExpression)
- packages/server/src/routes/workspace/schedules.ts (modify: rewritten with name field, direct cronExpression support, GET /:id, runs endpoints with pagination, toggle nextRunAt=null)
- packages/server/src/__tests__/unit/cron-scheduler-crud.test.ts (new: 54 tests for step syntax, validation, description, schema, pagination, backward compat)
- packages/server/src/__tests__/unit/cron-scheduler-tea.test.ts (new: 50 TEA risk-based tests for boundary values, edge cases, real-world patterns)
- packages/server/src/db/migrations/0036_cron-scheduler-enhancements.sql (new: migration for cronRuns table + nightJobSchedules column additions)
- packages/server/src/db/migrations/meta/_journal.json (modify: added migration 0036 entry)
