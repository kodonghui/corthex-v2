## Critic-B (Quinn) Review — Step 3: Integration Patterns

### Review Date
2026-03-21 (revised — initial log missed critical Step 2→Step 3 propagation failures)

### Content Reviewed
`_bmad-output/planning-artifacts/technical-research-2026-03-20.md`, Lines 540-1045

### Security/QA Verification Performed
- [x] **Prompt injection paths analyzed**: Section 3.3 documents 4-layer sanitization for personality→soul-renderer flow. Key finding: `soul-renderer.ts:41` `...extraVars` AFTER built-ins — extraVars can override built-in vars. The proposed fix at L795 (spread reversal: `{ ...extraVars, agent_list, ... }`) is correct. BUT: existing test `dept-knowledge-injection.test.ts:55` expects extraVars to shadow built-ins — behavioral regression not flagged.
- [x] **Step 2 fix propagation verified**: **CATASTROPHIC FAILURE**. 6+ Step 2 fixes NOT propagated into Step 3 code snippets:
  - L845: `dimensions: 768` — Step 2 FIX-1 established Voyage AI `voyage-3` 1024d
  - L863: "embedding via Gemini Embedding API" — Gemini banned (`feedback_no_gemini.md`), Step 2 FIX-1 replaced with Voyage AI
  - L666: `memory: 4G` — Step 2 FIX-3 corrected to 2G per Brief L408/L490/L507
  - L654: `N8N_HOST=localhost` — Step 2 FIX-4 specified `N8N_HOST=127.0.0.1`. `localhost` can resolve to `::1` (IPv6), bypassing `127.0.0.1:5678` Docker binding
  - L843: `source VARCHAR` — Step 2 FIX-2 established `domain VARCHAR(50)` per Brief §4
  - L846: `isProcessed` — Step 2 FIX-2 established `reflected` boolean
  - L838-854: Missing `confidence REAL DEFAULT 0.5` (0.3-0.9 per Brief §4 + ECC §2.3)
  - Missing `N8N_ENCRYPTION_KEY` (Step 2 FIX-7: AES-256-GCM credential isolation)
  - Missing `NODE_OPTIONS=--max-old-space-size=1536` (Step 2 FIX-6: OOM prevention for 2G container)
  - L1043 carry-forward: "Gemini API failures" → should say "Voyage AI failures"
- [x] **Race conditions checked**: (1) Observation recording is async fire-and-forget. If INSERT succeeds but embedding fails, backfill cron handles — correct. (2) Reflection cron concurrent execution: NO locking mechanism described. Two concurrent crons could SELECT same unprocessed observations → duplicate reflections. Step 2 FIX-5 added `pg_advisory_xact_lock` pattern but Step 3 does not reference it. (3) Embedding update after observation deletion by retention cron — benign silent failure, undocumented.
- [x] **WS security verified**: **ABSENT**. Dev's review request explicitly asked about "WS /office: rate limiting, auth, DoS prevention". Step 3 has ZERO discussion of: rate limiting (messages/sec per client), message validation/sanitization (`office:move` x/y bounds, `office:interact` targetAgentId validation), pre-auth connection flooding, message size limits, per-company connection caps. Only the existing v2 `clientMap` 3-per-userId limit is mentioned.
- [x] **Resource limit claims verified**: L634 "< 100 bytes" — `{"type":"office:agent-move","agentId":"550e8400-e29b-41d4-a716-446655440000","x":128,"y":256,"direction":"down"}` = 108 bytes. `office:state` with 50 agents = 5-10KB. Claim is inaccurate.
- [x] **n8n security verified**: L739-744 security section mentions port binding, JWT auth, API key, HMAC. But MISSING: iptables UID restriction (Step 2 FIX-4), `N8N_ENCRYPTION_KEY` (Step 2 FIX-7), OOM kill prevention (Step 2 FIX-6), `max-old-space-size` (Step 2 FIX-6).

### Dimension Scores
| Dimension | Score | Weight | Weighted | Evidence |
|-----------|-------|--------|----------|----------|
| D1 Specificity | 7/10 | 10% | 0.70 | Code patterns with file paths, Docker compose YAML, exact env vars, WS message protocol. Minor: "persist to office_state (JSONB or in-memory)" undecided. Reflection cost "$1.80/month" without calculation basis. |
| D2 Completeness | 5/10 | 25% | 1.25 | 7 sections + carry-forward covered. Gaps: (1) WS rate limiting/validation/DoS prevention entirely absent — dev explicitly requested. (2) n8n security items from Step 2 (encryption key, iptables, OOM) not propagated. (3) Observations `confidence` and `domain` fields from Brief §4 missing. (4) Reflection cron locking not described. (5) Embedding backfill max retries/dead letter unspecified. |
| D3 Accuracy | 5/10 | 15% | 0.75 | 6+ factual errors in code snippets: (1) L845 `768` → should be `1024` (Voyage AI). (2) L863 "Gemini Embedding API" → banned, should be Voyage AI. (3) L666 `memory: 4G` → should be `2G`. (4) L654 `N8N_HOST=localhost` → should be `127.0.0.1`. (5) L843 `source` → should be `domain`. (6) L846 `isProcessed` → should be `reflected`. (7) `generateEmbedding(content, companyId)` signature doesn't match actual `generateEmbedding(apiKey, text)`. PixiJS/n8n proxy/Big Five patterns are accurate. |
| D4 Implementability | 7/10 | 10% | 0.70 | Code snippets are detailed and implementation-ready — IF accuracy issues are fixed. Docker compose, proxy routes, schema extensions, WS protocol all usable. Observations schema cannot be implemented as-is (contradicts Step 2 + Brief). |
| D5 Consistency | 4/10 | 15% | 0.60 | **Step 2→Step 3 consistency failure**: 6+ fields/values from Step 2's 19 fixes are contradicted. Observations schema entirely different (different columns, different nullable semantics, missing fields). Gemini reference restored after Step 2 explicitly replaced it. Memory limit reverted. N8N_HOST reverted. Carry-forward table exists (L1033-1044) — some awareness, but code doesn't reflect it. |
| D6 Risk Awareness | 4/10 | 25% | 1.00 | **Missing**: (1) WS DoS — no rate limiting, no message validation, no connection flooding prevention. (2) n8n security gaps — no encryption key, no iptables, no OOM prevention. (3) Reflection cron race — no locking mechanism. (4) Observation poisoning — ECC §2.1 transitive prompt injection (malicious tool output → observation → reflection → agent_memories) not addressed. (5) Embedding backfill failure cascade. **Present**: E8 boundary analysis, basic n8n security (port binding, JWT), company isolation by tags. |

### Weighted Average: 5.00/10 — FAIL

### Issues Found (by severity)

#### CRITICAL (2)
1. **[D3/D5] L845: Embedding dimensions `768` → must be `1024`** — Step 2 FIX-1 established Voyage AI `voyage-3` (1024d) per Brief mandate. Step 3 observations schema uses `vector('embedding', { dimensions: 768 })`. HNSW index at L853 is also wrong dimension. This would create a schema that cannot store Voyage AI embeddings.
2. **[D3/D5] L863: "embedding via Gemini Embedding API" → must be Voyage AI** — Gemini banned per `feedback_no_gemini.md`. Step 2 FIX-1 replaced ALL Gemini references with Voyage AI (`voyage-3`, `voyageai` npm SDK). Step 3 reverts to Gemini. Also L1043 carry-forward says "Gemini API failures" instead of "Voyage AI failures".

#### HIGH (4)
3. **[D3/D5] L666: `memory: 4G` → must be `2G`** — Brief L408/L490/L507 mandate `--memory=2g`. Step 2 FIX-3 corrected this. Step 3 reverts. Also missing `NODE_OPTIONS=--max-old-space-size=1536` (Step 2 FIX-6).
4. **[D2/D5] L838-854: Observations schema diverged from Step 2 FIX-2** — Missing: `confidence REAL DEFAULT 0.5` (Brief §4), `domain VARCHAR(50)` (Brief §4). Wrong field names: `source` → `domain`, `isProcessed` → `reflected`. Missing deferred FK note for `task_executions`. Two incompatible schemas for the same table in the same document.
5. **[D3/D6] L654: `N8N_HOST=localhost` → must be `127.0.0.1`** — Step 2 FIX-4 specified `N8N_HOST=127.0.0.1`. `localhost` can resolve to `::1` (IPv6) on dual-stack systems, bypassing the `127.0.0.1:5678:5678` Docker port binding. DNS rebinding vector.
6. **[D6] WS `/office` rate limiting + validation absent** — Dev explicitly requested review of "WS /office: rate limiting, auth, DoS prevention". Zero coverage. No messages/sec cap, no x/y bounds validation for `office:move`, no targetAgentId validation for `office:interact`, no connection flooding mitigation, no per-company connection cap.

#### MEDIUM (3)
7. **[D6] n8n security incomplete** — Missing `N8N_ENCRYPTION_KEY` (Step 2 FIX-7: AES-256-GCM), missing iptables UID restriction (Step 2 FIX-4), missing OOM kill documentation (Step 2 FIX-6: GitHub #16980).
8. **[D6] Reflection cron race condition** — No locking mechanism. Step 2 FIX-5 added `pg_advisory_xact_lock(hashtext('reflection-' || company_id::text))` pattern. Step 3's `memory-reflection.ts` section doesn't reference it.
9. **[D6] Observation poisoning unaddressed** — ECC §2.1: transitive prompt injection via tool response → observation → reflection cron → poisoned insight → agent_memories. 84% agents vulnerable. No sanitization or confidence-gating for observation content is described.

#### LOW (3)
10. **[D3] `generateEmbedding()` signature mismatch** — L863 shows `generateEmbedding(content, companyId)` but actual code at `embedding-service.ts` has `generateEmbedding(apiKey: string, text: string)`. TypeScript compilation error.
11. **[D2] n8n proxy timeout unspecified** — "When Last Node Finishes" sync mode could take minutes. No timeout on `hono/proxy`. Proxy connection hangs indefinitely.
12. **[D2] WS message size claim inaccurate** — L634 says "< 100 bytes" but single `office:agent-move` with UUID = 108 bytes. `office:state` with 50 agents = 5-10KB.

### Missing Test Scenarios (12)
1. **Voyage AI embedding 1024d**: generate embedding → verify dimension = 1024 (not 768)
2. **Observations schema**: INSERT with all Brief §4 fields (confidence, domain) → verify schema accepts
3. **WS rate limiting**: send 100 `office:move` messages in 1 second → verify throttling/disconnect
4. **WS message validation**: send `office:move` with x=-9999, y=NaN → verify rejection
5. **WS `office:interact` validation**: send with non-existent targetAgentId → verify rejection
6. **Reflection cron concurrent**: run two cron instances simultaneously → verify no duplicate reflections
7. **n8n proxy timeout**: trigger 120s workflow → verify 504 within acceptable timeout
8. **n8n proxy when n8n down**: stop Docker container → verify graceful error (not hang)
9. **Observation poisoning**: record observation with `{{agent_list}}` in content → verify it doesn't override soul vars
10. **Embedding backfill**: fail embedding 5+ times → verify observation flagged for manual review
11. **N8N_HOST IPv6**: resolve `localhost` to `::1` → verify connection to `127.0.0.1:5678` still works (or document failure)
12. **extraVars spread reversal**: after fix, verify built-in vars win + update existing test

### Cross-talk
**To Winston (Architect):** 3 concerns: (1) Step 3 observations schema at L838-854 completely diverges from Step 2's fixed schema — different column names, missing fields, different types. Step 4 MUST unify. (2) L845 `dimensions: 768` contradicts Step 2 FIX-1's Voyage AI 1024d. HNSW indexes are dimension-specific. (3) Reflection cron needs the advisory lock pattern from Step 2 FIX-5 — this is an architecture-level concern.
**To John (PM):** 2 concerns: (1) n8n proxy timeout unspecified — if "When Last Node Finishes" sync mode is preferred, need defined SLA (30s? 60s? 120s?) for workflow execution UX. (2) L666 `memory: 4G` reverts Step 2 FIX-3. Brief says 2G. If 4G is actually needed, Brief must be updated.
**From Winston (7.25 PASS barely):** Confirms 5 Step 2 fixes not propagated (same as my findings). NEW catch: L661 `DB_POSTGRESDB_HOST=host.docker.internal` is a Docker Desktop feature — NOT available on Linux Docker Engine (Oracle ARM64 VPS). Deployment blocker I missed. Also: EventBus map (L989-1000) lists only 7 channels but actual v2 has 10 — missing `tool`, `cost`, `argos`, `debate`. Agrees observations schema divergence is primary concern. Asks about 768→1024 double-migration risk — answer: YES, HNSW indexes are dimension-specific, implementing at 768 then migrating to 1024 means DROP INDEX + ALTER COLUMN + CREATE INDEX, wasteful.
**From John (score TBD, FAIL expected):** "All 6 integration patterns are happy-path only" — no user-facing error states for ANY failure mode. What does CEO see when n8n is down? WS drops? Embedding fails? This IS the v2 pattern (485 APIs, 0 usage). Confirms schema conflict, reflection locking, Gemini propagation failure. n8n proxy timeout is a UX blocker: CEO triggers workflow → infinite spinner → abandonment. Recommends 30s max with async fallback.

**Cross-talk impact on score**: Winston's `host.docker.internal` catch adds another HIGH issue (D3 accuracy, D6 deployment risk). John's "happy-path only" observation reinforces D2 completeness gap. Score unchanged at 5.00 — these findings validate existing assessment rather than introducing new dimension failures.

### Verdict (Pre-fix)
**FAIL** — Score 5.00/10 (threshold 7.0). Step 3 code snippets systematically reverted Step 2's 19 applied fixes.

---

### Post-Fix Re-Verification (16 fixes applied)

**Verification method**: Read updated document sections L635-642, L650-684, L830-910, L756-762, L1008-1087, L1058-1072.

#### Fix Verification Results
| Fix | Verified | Notes |
|-----|----------|-------|
| FIX-S3-1: Gemini→Voyage AI | ✅ | L863 `voyage-3 1024d`, L837 migration note, L1085 carry-forward |
| FIX-S3-2: Observations schema | ✅ | L850-873: confidence, domain, reflected, taskExecutionId FK, 1024d embedding, all indexes |
| FIX-S3-3: n8n Docker | ✅ | L661 `127.0.0.1`, L667 encryption key, L668 max-old-space-size, L671 `172.17.0.1`, L676 `2G` |
| FIX-S3-4: WS /office security | ✅ | L635-640: 30/sec rate limit, x/y bounds, direction enum, targetAgentId, 256B limit, 50 cap, reconnect |
| FIX-S3-5: n8n proxy timeout | ✅ | L757-759: 30s AbortSignal, async fallback, circuit breaker (3 fail → 60s OPEN) |
| FIX-S3-6: Reflection cron | ✅ | L887 advisory lock, L888 confidence ≥ 0.7, L893 30-day purge, L883 backfill max 5 retries |
| FIX-S3-7: Error states table | ✅ | §3.7b: 8 failure modes, Korean error messages, degraded mode behavior |
| FIX-S3-8: EventBus map | ✅ | L1020-1023: tool, cost, argos, debate added (11 total) |
| FIX-S3-9: Neon Pro cost | ✅ | L1084 "Neon Pro($19/mo) 필수" |
| FIX-S3-10-14: Minor fixes | ✅ | Backfill retries, message size, carry-forward updates |
| Deferred: Obs poisoning | ⚠️ | Step 4 — acceptable (architecture-level) |

#### Residual Issue (1 — minor)
**`ObservationSource` type vs `domain` column value mismatch**: L1038 defines `ObservationSource = 'conversation' | 'task' | 'handoff' | 'office'` but L860 defines `domain` column as `'conversation' | 'tool_use' | 'error'`. These are different value sets for related concepts. Not blocking — may represent different abstraction levels (trigger source vs context domain) — but naming could cause developer confusion. Recommend clarifying in Step 4.

#### Re-Scored Dimensions
| Dimension | Pre-Fix | Post-Fix | Weight | Weighted | Evidence |
|-----------|---------|----------|--------|----------|----------|
| D1 Specificity | 7 | 8 | 10% | 0.80 | WS rate limits specific (30/sec, 256B, 50 cap). Circuit breaker specific (3 failures, 60s). Docker compose fully detailed. |
| D2 Completeness | 5 | 8 | 25% | 2.00 | All major gaps filled. WS security comprehensive. Failure modes table covers all 6 integrations. Embedding backfill specified. EventBus complete. |
| D3 Accuracy | 5 | 8 | 15% | 1.20 | All 6+ factual errors corrected. Voyage AI 1024d. 127.0.0.1. 2G memory. domain/reflected. 172.17.0.1 for Linux Docker. |
| D4 Implementability | 7 | 8 | 10% | 0.80 | Docker compose copy-paste ready. Observations schema authoritative. Circuit breaker pattern clear. WS validation rules specified. |
| D5 Consistency | 4 | 8 | 15% | 1.20 | Step 2 fixes fully propagated. Schema unified. Carry-forwards updated. EventBus complete. Minor: ObservationSource/domain mismatch. |
| D6 Risk Awareness | 4 | 7 | 25% | 1.75 | WS DoS addressed. n8n security complete. Reflection locking. Circuit breaker. Failure modes table. Obs poisoning deferred (acceptable). |

#### Post-Fix Weighted Average: 7.75/10 — PASS ✅

**Improvement**: 5.00 → 7.75 (+2.75). All CRITICAL and HIGH issues resolved. Observation poisoning deferred to Step 4 (acceptable). One minor residual (ObservationSource/domain naming).
