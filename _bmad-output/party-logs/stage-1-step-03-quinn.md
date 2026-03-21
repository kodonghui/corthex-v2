## Critic-B (Quinn) Review — Step 3: Integration Patterns

### Review Date
2026-03-21

### Content Reviewed
`_bmad-output/planning-artifacts/technical-research-2026-03-20.md`, Lines 487-992

### Security/QA Verification Performed
- [x] Prompt injection paths analyzed: Section 3.3 documents the 4-layer sanitization integration in the context of personality-to-soul-renderer flow. The personality-injector.ts call chain is clear: `agent-loop.ts -> buildPersonalityVars(agent) -> extraVars -> renderSoul()`. Key finding: the existing test at `dept-knowledge-injection.test.ts:55-59` CONFIRMS that `extraVars override built-in vars` in current code (`soul-renderer.ts:41` — `...extraVars` is AFTER built-ins). This is the exact vulnerability the research identifies. The proposed fix (spread reversal) is correct but creates a **behavioral regression**: the existing test `test('extraVars override built-in vars')` would FAIL after the fix. This test must be updated.
- [x] Race conditions checked: (1) Observation recording is async (`void recordObservation(...)` fire-and-forget pattern at line 807). If the agent loop crashes between INSERT observation and UPDATE embedding, the observation exists with `embedding=NULL`. This is handled by the backfill cron — correct. (2) BUT: What if two reflection cron runs overlap? There is no locking mechanism described. Two concurrent reflection crons could SELECT the same unprocessed observations, generate duplicate reflections, and only one UPDATE would mark them as processed. The document does not address this. (3) Embedding update race: if `generateEmbedding` returns after the observation is already deleted by a retention cron, the UPDATE fails silently. This is benign but not documented.
- [x] Missing test scenarios identified: 9 scenarios listed below
- [x] Resource limit claims verified: WebSocket message size claim "< 100 bytes" (line 581) is plausible for position updates but not verified. AgentPosition type with UUID agentId (36 chars) + x,y numbers + direction string + action string in JSON easily exceeds 100 bytes. Example: `{"type":"office:agent-move","agentId":"550e8400-e29b-41d4-a716-446655440000","x":128,"y":256,"direction":"down"}` = 108 bytes. With office:state containing an array of all agents, initial state message could be several KB.
- [x] Edge cases documented: 11 edge cases

### Dimension Scores
| Dimension | Score | Weight | Weighted | Evidence |
|-----------|-------|--------|----------|----------|
| D1 Specificity | 8/10 | 10% | 0.80 | Code patterns with file paths, line numbers (hub.ts:95, call-agent.ts:63), Docker compose YAML, exact env vars. Minor: n8n proxy route patterns use Hono `proxy()` helper but don't specify error handling for proxy failures (n8n down, timeout). |
| D2 Completeness | 7/10 | 25% | 1.75 | 6 integration patterns + cross-domain + carry-forwards covered. Gaps: (1) No WebSocket reconnection strategy for /ws/office. (2) No discussion of what happens when n8n proxy target is unreachable (Docker container stopped/restarting). (3) Observation recording failure modes incomplete — what if INSERT succeeds but embedding fails AND backfill cron also fails repeatedly? (4) No max concurrent WebSocket connections per company discussed — only 3 per userId. (5) n8n webhook timeout not specified — what if n8n "When Last Node Finishes" takes 5 minutes? |
| D3 Accuracy | 7/10 | 15% | 1.05 | (1) observation-recorder.ts pattern (line 810) shows `generateEmbedding(content, companyId)` but actual embedding-service.ts signature is `generateEmbedding(apiKey: string, text: string)` — function signature mismatch. (2) Drizzle cosineDistance import path (line 840): `import { cosineDistance } from '../db/pgvector'` — need to verify this helper actually exists. The document says "custom helper, NOT drizzle-orm/pg-core" but Drizzle ORM v0.31.0+ has native cosineDistance. Which is actually used? (3) n8n REST API path: document says `POST /api/v1/workflows/:id/execute` (line 213) but then says `POST /api/v1/workflows/:id/run` (line 665) — two different endpoint names for the same operation. |
| D4 Implementability | 8/10 | 10% | 0.80 | Docker compose, proxy routes, schema extensions, WebSocket protocol — all implementation-ready. The n8n proxy pattern using Hono `proxy()` helper is clean. Minor: the `proxy()` helper import from `hono/proxy` needs version verification — this is a relatively new Hono feature. |
| D5 Consistency | 7/10 | 15% | 1.05 | (1) observations table schema differs between Step 2 (line 340-354, SQL) and Step 3 (line 783-801, Drizzle). Step 2 has `confidence`, `observed_at`, `reflected` fields. Step 3 has `source`, `importance`, `embedding`, `isProcessed`, `processedAt`. These are two different schemas for the same table. (2) Step 2 says observations have `confidence` (0.3-0.9 per Brief) but Step 3 uses `importance` (1-10 per Park et al.). Different names, different scales, for what appears to be the same concept. (3) Step 3 carry-forward table (line 989) references "Neon tier: ~1.4GB/year" but Step 2 doesn't provide this storage estimate. |
| D6 Risk Awareness | 7/10 | 25% | 1.75 | Carry-forward items well-documented (line 980-991). However: (1) Reflection cron concurrent execution not addressed — no distributed lock or single-instance guarantee. (2) n8n proxy timeout not specified — a hung n8n workflow could block the Hono proxy indefinitely. (3) WebSocket connection flooding: per-userId limit is 3, but what about per-company? 100 users x 3 connections = 300 concurrent WS connections per company — is this sustainable on a 4-core VPS? (4) No circuit breaker pattern for n8n proxy — if n8n is down, every proxy request will timeout. |

### Weighted Average: 7.20/10

### Issues Found
1. **[D3 Accuracy]** `generateEmbedding()` function signature mismatch. Document shows `generateEmbedding(content, companyId)` at line 810 but actual code at `embedding-service.ts:45-48` has signature `generateEmbedding(apiKey: string, text: string)`. This would cause a TypeScript compilation error if implemented as written. — **Critical**
2. **[D5 Consistency]** observations table schema conflict between Step 2 SQL (confidence/observed_at/reflected) and Step 3 Drizzle (source/importance/embedding/isProcessed/processedAt). Two incompatible schemas for the same table within the same document. Step 4 must choose one. — **Major**
3. **[D6 Risk Awareness]** Reflection cron concurrent execution risk. No locking mechanism (advisory lock, single-instance guarantee, or idempotency check) prevents two cron runs from processing the same observations simultaneously, producing duplicate reflections. ARGOS scheduler may already have single-instance guarantees, but this is not stated. — **Major**
4. **[D3 Accuracy]** n8n API endpoint inconsistency: `POST /api/v1/workflows/:id/execute` (line 213) vs `POST /api/v1/workflows/:id/run` (line 665). These are different endpoints. n8n 2.x uses `/run` for REST API execution trigger. `/execute` does not exist in current n8n API. — **Minor**
5. **[D2 Completeness]** No n8n proxy timeout configuration. Hono `proxy()` helper default timeout behavior is unspecified. A workflow using "When Last Node Finishes" sync mode could take minutes. Without a timeout, the proxy connection stays open indefinitely, consuming server resources. — **Major**
6. **[D2 Completeness]** No WebSocket reconnection strategy for /ws/office. When the server restarts (deploy), all WS connections drop. The existing `broadcastServerRestart()` function sends close code 1001, but the client reconnection logic for the office canvas (which needs to re-fetch full state) is not described. — **Minor**
7. **[D6 Risk Awareness]** n8n circuit breaker missing. If the Docker container is restarting/crashed, every proxy request will fail with a connection error. No circuit breaker pattern is described to fast-fail and avoid cascading failures to the main Hono server. — **Minor**
8. **[D5 Consistency]** Existing test `extraVars override built-in vars` (dept-knowledge-injection.test.ts:55) expects `extraVars` to shadow built-ins. The proposed spread reversal (Decision 4.3.2) will break this test. This behavioral regression must be explicitly called out as a test update requirement. — **Minor**
9. **[D2 Completeness]** WebSocket message size claim "< 100 bytes" is inaccurate. A single `office:agent-move` message with UUID is ~108 bytes. `office:state` with 50 agents could be 5-10KB. This matters for bandwidth calculations on the VPS. — **Minor**

### Missing Test Scenarios (per step)
1. Reflection cron concurrent execution: run two cron instances simultaneously, verify no duplicate reflections are created
2. n8n proxy timeout: trigger a long-running workflow (60s+), verify proxy returns 504 within acceptable timeout
3. n8n proxy when n8n is down: stop Docker container, call proxy endpoint, verify graceful error response (not hang)
4. WebSocket /ws/office with 100+ concurrent connections: verify server does not run out of file descriptors or memory
5. observation INSERT succeeds but embedding fails 3+ times: verify backfill cron marks observation for manual review after max retries
6. Existing `extraVars override built-in vars` test must be updated to expect built-ins winning after spread reversal
7. n8n tag isolation: create workflow without tag, verify it is not accessible via proxy (negative test for untagged workflows)
8. WebSocket office:state initial payload size with 50+ agents: verify serialization does not exceed reasonable limits
9. observation-recorder.ts: record observation with content containing `{{` template delimiters — verify it does not affect future soul rendering (defense in depth)

### Cross-talk
**To Winston (Architect):** The observations table has two incompatible schemas in Steps 2 and 3. Step 4 must definitively choose one. Also, the reflection cron needs a distributed lock or advisory lock pattern to prevent duplicate processing — this is an architecture-level concern that should be in the cron execution pattern.
**To John (PM):** The n8n proxy timeout is unspecified. If "When Last Node Finishes" sync mode is the preferred integration, there must be a defined timeout (e.g., 30s, 60s, 120s) that feeds into the PM's acceptance criteria for workflow execution UX.
**From Winston:** [Pending -- will be filled after cross-talk round]
**From John:** [Pending -- will be filled after cross-talk round]

### Verdict
PASS (marginal) — Core integration patterns are sound and well-documented. The `generateEmbedding()` signature mismatch is a critical accuracy issue but is a typo-level error that does not indicate a fundamental design problem. The observations schema conflict between Steps 2 and 3 must be resolved in Step 4. Weighted average 7.20 passes the 7.0 threshold.
