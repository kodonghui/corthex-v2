# Story 14.3: ARGOS Trigger Condition Auto-Collect

Status: review

## Story

As a CEO/Admin,
I want to set up ARGOS trigger conditions (price thresholds, news keywords, scheduled data collection) that automatically execute analysis commands when conditions are met,
so that I never miss important market events and can respond to opportunities/threats in real-time without manual monitoring.

## Acceptance Criteria

1. **AC1: ARGOS Trigger Service** -- An `ArgosService` (`services/argos-service.ts`) manages trigger lifecycle. Uses the existing `nightJobTriggers` table (already in schema.ts) for trigger storage. Extends the table with ARGOS-specific trigger types: `price`, `news`, `schedule`, `custom`. Each trigger has `condition` (JSON: thresholds, keywords, expressions) and `instruction` (command to execute when triggered).

2. **AC2: ARGOS Event Recording** -- New `argos_events` table records every trigger evaluation result. Fields: `id` (uuid), `companyId`, `triggerId` (FK→nightJobTriggers), `eventType` (trigger_type mirror), `eventData` (JSON: matched data, current values), `status` ('detected'|'executing'|'completed'|'failed'), `commandId` (FK→commands, nullable), `processedAt`, `createdAt`. Each trigger fire creates an event, links to the command execution if action taken.

3. **AC3: Trigger Condition Evaluation Engine** -- `ArgosEvaluator` checks active triggers against incoming/cached data every 60 seconds (configurable `ARGOS_POLL_INTERVAL_MS`). Evaluation types:
   - **Price trigger**: Compare cached stock price against threshold (above/below/change_pct). Uses data from tool system or external API cache.
   - **News trigger**: Keyword match against news headlines/descriptions. Uses Naver News API or cached news data.
   - **Schedule trigger**: Time-based data collection (runs at specified intervals, not cron -- uses trigger's own schedule logic).
   - **Custom trigger**: JSON-based condition expression (field, operator, value) evaluated against arbitrary data sources.

4. **AC4: Auto-Collection & Command Execution** -- When a trigger condition is met:
   1. Create `argos_events` record (status='detected')
   2. Update trigger's `lastTriggeredAt`
   3. Execute trigger's `instruction` via the cron execution pipeline (reuse `executeCronJob` pattern from `cron-execution-engine.ts`)
   4. Update event status to 'executing' → 'completed'/'failed'
   5. Emit WebSocket event on `argos` channel: `argos-trigger-fired`, `argos-execution-completed`, `argos-execution-failed`

5. **AC5: CRUD API for Triggers** -- REST endpoints under `/api/workspace/argos/`:
   - `GET /triggers` -- List all ARGOS triggers for company (with lastTriggeredAt, event count)
   - `GET /triggers/:id` -- Single trigger with recent events
   - `POST /triggers` -- Create trigger (validate condition schema per triggerType)
   - `PATCH /triggers/:id` -- Update trigger (name, condition, instruction, agentId)
   - `PATCH /triggers/:id/toggle` -- Toggle isActive
   - `DELETE /triggers/:id` -- Soft delete (set isActive=false) or hard delete
   - `GET /triggers/:id/events` -- Paginated event history
   - `GET /status` -- ARGOS system status (active triggers count, last check time, data freshness, today's cost)

6. **AC6: Status Bar Data** -- `/api/workspace/argos/status` returns 4 key metrics for the ARGOS status bar (UX #17):
   - Data OK/NG: Whether data sources are fresh and accessible
   - AI OK/NG: Whether trigger evaluation is running without errors
   - Active triggers count
   - Today's total cost from ARGOS-triggered executions

7. **AC7: Cooldown & Deduplication** -- Prevent trigger spam: each trigger has `cooldownMinutes` (default 30). After firing, the trigger won't re-fire until cooldown expires. Duplicate event detection: same trigger + same data hash within cooldown = skip.

8. **AC8: Tenant Isolation** -- All queries filtered by companyId. Triggers, events, and executions are tenant-scoped. WebSocket events broadcast only to the trigger's company.

## Tasks / Subtasks

- [x] Task 1: ARGOS Events Schema + Migration (AC: #2)
  - [x] 1.1 Add `argosEventStatusEnum` to schema.ts: 'detected', 'executing', 'completed', 'failed'
  - [x] 1.2 Create `argos_events` table in schema.ts with all fields
  - [x] 1.3 Add relations: argosEvents ↔ nightJobTriggers, argosEvents ↔ companies
  - [x] 1.4 Create migration `0038_argos-events-table.sql`
  - [x] 1.5 Export new types in shared/src/types.ts

- [x] Task 2: ArgosService - Trigger CRUD (AC: #1, #5, #8)
  - [x] 2.1 Create `packages/server/src/services/argos-service.ts`
  - [x] 2.2 Implement `createTrigger()`: validate triggerType-specific condition schema, insert into nightJobTriggers
  - [x] 2.3 Implement `updateTrigger()`, `toggleTrigger()`, `deleteTrigger()`
  - [x] 2.4 Implement `listTriggers()`: join with event count, lastTriggeredAt
  - [x] 2.5 Implement `getTrigger()`: with recent events (last 20)
  - [x] 2.6 Implement `listEvents()`: paginated, filterable by status
  - [x] 2.7 Implement condition schema validation per triggerType (Zod schemas)

- [x] Task 3: ArgosEvaluator - Condition Evaluation Engine (AC: #3, #7)
  - [x] 3.1 Create `packages/server/src/services/argos-evaluator.ts`
  - [x] 3.2 Implement `startArgosEngine()` / `stopArgosEngine()` lifecycle
  - [x] 3.3 Implement `evaluateTriggers()`: poll active triggers, evaluate conditions
  - [x] 3.4 Implement `evaluatePrice()`: compare current price vs threshold
  - [x] 3.5 Implement `evaluateNews()`: keyword search in cached/fetched news
  - [x] 3.6 Implement `evaluateSchedule()`: time-interval based triggers
  - [x] 3.7 Implement `evaluateCustom()`: generic field/operator/value evaluation
  - [x] 3.8 Implement cooldown check: skip if lastTriggeredAt + cooldownMinutes > now
  - [x] 3.9 Implement deduplication: hash eventData, skip if same hash within cooldown

- [x] Task 4: Auto-Collection & Execution (AC: #4)
  - [x] 4.1 Implement `executeTriggeredAction()`: create argos_event, execute instruction via orchestration pipeline
  - [x] 4.2 Reuse execution pattern from cron-execution-engine.ts (session creation, agent response, result recording)
  - [x] 4.3 Update argos_event status through lifecycle (detected → executing → completed/failed)
  - [x] 4.4 Link execution to command/report for traceability

- [x] Task 5: WebSocket Events (AC: #4)
  - [x] 5.1 Register `argos` channel on EventBus
  - [x] 5.2 Emit `argos-trigger-fired` when condition met (triggerId, triggerName, eventData)
  - [x] 5.3 Emit `argos-execution-completed` on success (triggerId, durationMs, resultPreview)
  - [x] 5.4 Emit `argos-execution-failed` on failure (triggerId, error)
  - [x] 5.5 Bridge to WebSocket in index.ts

- [x] Task 6: REST API Routes (AC: #5, #6)
  - [x] 6.1 Create `packages/server/src/routes/workspace/argos.ts`
  - [x] 6.2 Implement all CRUD endpoints (GET/POST/PATCH/DELETE /triggers)
  - [x] 6.3 Implement `/status` endpoint with 4 metrics
  - [x] 6.4 Implement `/triggers/:id/events` with pagination
  - [x] 6.5 Mount route in workspace router

- [x] Task 7: Server Lifecycle Integration (AC: #1)
  - [x] 7.1 Import and call `startArgosEngine()` in server startup (index.ts)
  - [x] 7.2 Add `stopArgosEngine()` to SIGTERM handler
  - [x] 7.3 Register `argos` WebSocket channel in EventBus bridge

## Dev Notes

### Existing Infrastructure (CRITICAL -- reuse, don't reinvent)

**nightJobTriggers table (ALREADY EXISTS in schema.ts:407):**
```typescript
nightJobTriggers = pgTable('night_job_triggers', {
  id: uuid PK,
  companyId: uuid FK→companies,
  userId: uuid FK→users,
  agentId: uuid FK→agents,
  instruction: text,           // Command to execute when triggered
  triggerType: varchar(50),    // 'price' | 'news' | 'schedule' | 'custom'
  condition: jsonb,            // Trigger-specific condition JSON
  isActive: boolean default true,
  lastTriggeredAt: timestamp,
  createdAt: timestamp,
})
```
- **This table is already defined but unused.** ARGOS uses it as-is.
- Add `cooldownMinutes` (integer, default 30) and `name` (varchar 200) columns via migration.
- Relations already defined: company, user, agent, jobs(many nightJobs)

**Cron Execution Engine (services/cron-execution-engine.ts) -- REFERENCE for execution pattern:**
- `executeCronJob()` creates chatSession + messages, calls `orchestrateSecretary()` or `generateAgentResponse()`, saves agentMemory + report
- Reuse this exact pattern for ARGOS trigger execution
- WebSocket events: emit via `eventBus.emit('argos', { companyId, payload })`

**Event Bus (lib/event-bus.ts):**
- Simple EventEmitter, bridged to WebSocket in index.ts
- Add new channel: `argos` → `broadcastToCompany(companyId, 'argos', payload)`
- Pattern: `eventBus.on('argos', (data) => broadcastToCompany(...))`

**Orchestration pipeline (for command execution):**
- Secretary agents: `orchestrateSecretary({ secretaryAgentId, sessionId, companyId, userMessage, userId })`
- Regular agents: `generateAgentResponse({ agentId, sessionId, companyId, userMessage, userId })`
- Both in `lib/ai.ts` and `lib/orchestrator.ts`

### v1 Reference (CRITICAL -- v1 had full ARGOS implementation)

**v1 ARGOS Architecture** (`/home/ubuntu/CORTHEX_HQ/web/argos_collector.py`):
- 6 data types collected: price (1min), news (30min), DART filings (1hr), macro indicators (1day), financial data (1day), sector indices (1day)
- Sequential collection with `asyncio.Lock()` to prevent DB lock contention
- Auto-expiry: 90-365 day retention per data type
- `argos_collection_status` table tracks last_collected, last_error, total_count per data_type
- **v2 simplification**: v1 used pykrx/yfinance Python libraries. v2 uses TypeScript tools and cached data. Focus on TRIGGER EVALUATION, not raw data collection (tools handle collection).

**v1 Price Triggers** (`/home/ubuntu/CORTHEX_HQ/web/trading_engine.py:1496-1653`):
- 3 types: stop_loss (price <= threshold), take_profit (price >= threshold), buy_limit (price <= threshold)
- 1-minute check cycle
- Auto-expiry: buy_limit expires after 10 minutes unfilled
- Position triggers: buy → auto-register stop_loss + take_profit pair
- Opposite trigger deactivation: stop_loss fires → cancel take_profit
- **v2 adaptation**: Generalize to any condition type (price, news, schedule, custom), not just trading

**v1 ARGOS API** (`/home/ubuntu/CORTHEX_HQ/web/handlers/argos_handler.py`):
- `GET /api/argos/status` — collection status per data type
- `GET /api/argos/price/{ticker}` — price history
- `GET /api/argos/news/{keyword}` — news cache
- `POST /api/argos/collect/now` — manual trigger collection
- **v2 adaptation**: Focus on trigger management API, data access via existing tools

**v1 Status Bar** (4 items):
- Data OK/NG: data source freshness check
- AI OK/NG: system health
- Trigger count: active triggers
- Today's cost: ARGOS-triggered execution costs
- **v2 must replicate this in GET /status endpoint**

### Condition Schema Examples

**Price trigger condition:**
```json
{
  "ticker": "005930",
  "market": "KR",
  "operator": "below",  // "above" | "below" | "change_pct_above" | "change_pct_below"
  "value": 50000,
  "dataSource": "cached"  // "cached" | "realtime"
}
```

**News trigger condition:**
```json
{
  "keywords": ["삼성전자", "공시"],
  "matchMode": "any",  // "any" | "all"
  "sources": ["naver"],
  "excludeKeywords": ["광고"]
}
```

**Schedule trigger condition:**
```json
{
  "intervalMinutes": 360,  // every 6 hours
  "activeHours": { "start": 6, "end": 22 },
  "activeDays": [1, 2, 3, 4, 5]  // weekdays
}
```

**Custom trigger condition:**
```json
{
  "field": "kospi_index",
  "operator": "change_pct_below",
  "value": -3,
  "dataSource": "macro"
}
```

### Architecture Patterns to Follow

- **Service pattern**: Standalone module with `start/stop` exports (like cron-execution-engine.ts)
- **DB pattern**: Drizzle ORM, `db.select()/insert()/update()`, `eq/and/lte` from drizzle-orm
- **Route pattern**: Hono router, `authMiddleware`, `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **Error isolation**: Individual trigger evaluation failures don't crash the engine
- **Tenant isolation**: All queries include `companyId`
- **Logging**: Console.log with emoji prefix (🔍 for ARGOS, ⚡ for trigger fire, ✅ success, ❌ failure)
- **Testing**: bun:test, describe/it blocks, mock db operations

### Project Structure Notes

- New: `packages/server/src/services/argos-service.ts` (trigger CRUD logic)
- New: `packages/server/src/services/argos-evaluator.ts` (condition evaluation engine)
- New: `packages/server/src/routes/workspace/argos.ts` (REST API)
- New: `packages/server/src/db/migrations/0038_argos-events-table.sql`
- New: `packages/server/src/__tests__/unit/argos-service.test.ts`
- Modify: `packages/server/src/db/schema.ts` (add argos_events table, argosEventStatusEnum, extend nightJobTriggers)
- Modify: `packages/server/src/index.ts` (add startArgosEngine/stopArgosEngine, argos WebSocket channel)
- Modify: `packages/server/src/routes/workspace/index.ts` (mount argos routes)
- Modify: `packages/shared/src/types.ts` (add ARGOS types)
- Reuse: `packages/server/src/services/cron-execution-engine.ts` (execution pattern reference)
- Reuse: `packages/server/src/lib/event-bus.ts` (WebSocket events)

### Testing Standards

- Framework: bun:test
- Location: `packages/server/src/__tests__/unit/`
- Naming: `argos-service.test.ts`
- Test categories:
  - Trigger CRUD (create, read, update, delete, toggle, list)
  - Condition evaluation (price above/below, news keyword match, schedule interval, custom expression)
  - Cooldown/deduplication logic
  - Event recording lifecycle (detected → executing → completed/failed)
  - Execution integration (trigger fire → command execution → result recording)
  - WebSocket events (argos-trigger-fired, argos-execution-completed, argos-execution-failed)
  - Status endpoint (4 metrics)
  - Tenant isolation (companyId enforcement)
  - Error handling (invalid conditions, execution failures, DB errors)
  - Pagination (events list)

### Previous Story Intelligence (14-2)

- **CronExecutionEngine pattern**: 60s polling, optimistic lock, concurrent limit, retry with exponential backoff, graceful shutdown, WebSocket events -- ARGOS should follow same pattern
- **interruptibleSleep**: Use for ARGOS evaluation delays (don't block shutdown)
- **cronRuns recording**: ARGOS uses `argos_events` table in similar fashion
- **Server lifecycle**: startCronEngine/stopCronEngine pattern → startArgosEngine/stopArgosEngine
- **Code review findings from 14-2**: Always wrap DB inserts in try/catch, use interruptible sleep for shutdown safety

### References

- [Source: _bmad-output/planning-artifacts/epics.md - Epic 14, E14-S3]
- [Source: _bmad-output/planning-artifacts/prd.md - FR67]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - Screen #17 ARGOS]
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md - Section 17. ARGOS]
- [Source: packages/server/src/db/schema.ts:407 - nightJobTriggers table (existing)]
- [Source: packages/server/src/db/schema.ts:423 - cronRuns table (pattern reference)]
- [Source: packages/server/src/services/cron-execution-engine.ts - execution pattern]
- [Source: packages/server/src/lib/event-bus.ts - EventBus for WebSocket]
- [Source: packages/server/src/index.ts - server lifecycle]
- [Source: /home/ubuntu/CORTHEX_HQ/web/argos_collector.py - v1 ARGOS collector]
- [Source: /home/ubuntu/CORTHEX_HQ/web/trading_engine.py:1496 - v1 price triggers]
- [Source: /home/ubuntu/CORTHEX_HQ/web/handlers/argos_handler.py - v1 ARGOS API]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Story 14-1 done: cron scheduler CRUD (nightJobSchedules, cronRuns, cron-utils, 104 tests)
- Story 14-2 done: cron execution engine (direct execution, cronRuns recording, concurrent limit, retry, graceful shutdown, 88 tests)
- nightJobTriggers table ALREADY EXISTS in schema.ts -- reuse it, extend with cooldownMinutes + name columns
- v1 ARGOS was Python-based (pykrx, yfinance, Naver API, DART API) with 6 data type collectors
- v2 ARGOS focuses on TRIGGER EVALUATION + AUTO-EXECUTION, not raw data collection (tools handle that)
- v1 price triggers had 3 types (stop_loss, take_profit, buy_limit) with 1-min check cycle
- v2 generalizes to 4 trigger types: price, news, schedule, custom
- Cooldown mechanism (default 30min) prevents trigger spam
- Status bar: 4 metrics (Data OK/NG, AI OK/NG, trigger count, today's cost)

### File List
