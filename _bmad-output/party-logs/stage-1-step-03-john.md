## Critic-C (John/PM — Product + Delivery) Review — Step 3: Integration Patterns

### Review Date
2026-03-21

### Content Reviewed
`_bmad-output/planning-artifacts/technical-research-2026-03-20.md`, Lines 540-1045

### Product & Delivery Verification Performed
- [x] Step 2 fix propagation checked: **FAILED** — Step 2 FIX-1 (Voyage AI 1024d, Gemini banned) NOT propagated to Step 3. Line 845 still uses `vector(768)`, line 863 still says "Gemini Embedding API", carry-forward line 1043 says "Gemini API failures".
- [x] Brief alignment checked: Docker compose line 666 `memory: 4G` contradicts Brief mandate `--memory=2g` (Step 2 FIX-3 alignment).
- [x] Go/No-Go gate coverage checked: #2 (Big Five injection) well-addressed in §3.3. #3 (n8n security) covered in §3.2. #5 (bundle) refined to 120-150KB. #8 (assets) correctly noted as manual gate.
- [x] Sprint inter-dependency analysis: Asset pipeline (Sprint 4) must start in Sprint 2 (per Step 2 FIX-14). But Sprint 2 = n8n development. Solo dev parallel workload not addressed.
- [x] User-facing error states checked: NONE defined for any integration failure mode (n8n down, WS drop, embedding failure).
- [x] Operational complexity assessed: Docker compose + n8n monitoring + ARGOS cron + embedding backfill = 4 new operational concerns for solo dev.

### Dimension Scores
| Dimension | Score | Weight | Weighted | Evidence |
|-----------|-------|--------|----------|----------|
| D1 Specificity | 9/10 | **20%** | 1.80 | Excellent: Full TSX components with `extend()` tree-shaking, Docker compose YAML with healthcheck/resource limits, Hono `proxy()` routes, WS message protocol with typed fields, 3-phase memory data flow diagram, migration sequence (0061-0063). Bundle refined to "120-150KB gzipped" (line 582) — more actionable than Step 2's estimate. Minor: WS message "< 100 bytes" is inaccurate per Quinn (~108 bytes with UUID). |
| D2 Completeness | 7/10 | **20%** | 1.40 | 6 integration patterns + cross-domain map + carry-forwards covered. Carry-forward table (§3.8) is well-structured with 9 items. **Critical gaps**: (1) **No user-facing error UX** for any failure mode — what does CEO see when n8n is down? WS drops? Embedding fails? All patterns are happy-path only. v2 failure pattern: technical completeness without user experience. (2) **n8n proxy timeout unspecified** — "When Last Node Finishes" sync mode could block indefinitely. PM acceptance criteria needed: max wait time for workflow results. (3) **Observation storage growth** — carry-forward mentions ~1.4GB/year but doesn't flag Neon Free tier (0.5GB) exceeded in 4 months. Neon Pro ($19/mo) cost not in any budget. (4) **WS reconnection for /office** — CEO's "WOW moment" depends on stable connection. No reconnect + state-sync protocol. |
| D3 Accuracy | 6/10 | 15% | 0.90 | **CRITICAL REGRESSIONS from Step 2 fixes**: (1) Line 845: `vector('embedding', { dimensions: 768 })` — should be 1024 per Step 2 FIX-1 (Voyage AI mandate). (2) Line 863: "embedding via Gemini Embedding API" — Gemini is BANNED per Brief + feedback_no_gemini.md. Step 2 FIX-1 explicitly fixed this. (3) Carry-forward line 1043: "Retry NULL embeddings from Gemini API failures" — should reference Voyage AI. (4) `host.docker.internal` (line 662) doesn't work on Linux Docker Engine (Winston Major). (5) `generateEmbedding()` signature mismatch (Quinn Critical). These are not new research errors — they're **failures to propagate Step 2 corrections** into downstream steps. |
| D4 Implementability | 7/10 | 15% | 1.05 | Docker compose, Hono proxy, personality-injector, 3-phase memory flow — all implementation-ready in concept. BUT: (1) Docker compose would fail on Linux VPS (`host.docker.internal`). (2) `generateEmbedding()` call would fail tsc. (3) Schema uses 768d but target is 1024d — implementation would build wrong vector indexes. These 3 issues would block implementation if code were written from this spec. |
| D5 Consistency | 4/10 | 10% | 0.40 | **Systemic issue**: Step 2 fixes (FIX-1 Voyage AI, FIX-3 n8n 2GB) were NOT propagated to Step 3. (1) Embedding: Step 2 says Voyage AI 1024d, Step 3 says Gemini 768d (3 locations). (2) n8n memory: Step 2 FIX-3 aligned to Brief 2GB, Step 3 docker-compose line 666 says `memory: 4G`. (3) Observations schema: Step 2 has `confidence`+`domain`+`reflected`, Step 3 has `source`+`importance`+`embedding`+`isProcessed` — two incompatible schemas for the same table. (4) n8n API endpoint: `/execute` (line 213) vs `/run` (line 665) — inconsistent naming. This pattern suggests Step 3 was written BEFORE Step 2 fixes were applied, or fixes weren't cascaded. |
| D6 Risk Awareness | 7/10 | **20%** | 1.40 | Carry-forward table identifies 9 items for Step 4, including observation lifecycle sub-risks (Neon tier, cron failure, retention). **Missing from Product/Delivery perspective**: (1) **Neon Pro cost** ($19/mo) not flagged as budget item — observations alone would exceed free tier in 4 months. (2) **Solo dev operational burden**: n8n Docker monitoring + ARGOS cron + embedding backfill + observation purge = 4 new ops tasks with no runbook. (3) **Sprint parallel workload**: asset generation must start Sprint 2 while solo dev is also building n8n integration. Feasibility not assessed. (4) **n8n proxy timeout = UX disaster** — CEO triggers workflow, gets infinite spinner. No timeout = product-level failure, not just technical. (5) **v2 failure pattern repeating**: all 6 integration patterns describe technical flows with zero user-facing error states. This IS the pattern that killed v2. |

### Weighted Average: 6.95/10 ❌ FAIL

### Issue Summary (10 issues: 2 Critical, 3 Major, 5 Minor)

1. **[D3/D5 — CRITICAL]** Step 2 fix regression: Embedding provider. Step 2 FIX-1 mandated Voyage AI 1024d, Gemini banned. Step 3 still references "Gemini Embedding API" (line 863), `vector(768)` (line 845), and "Gemini API failures" (carry-forward line 1043). This is a systemic propagation failure — the fix was applied to Step 2 but not cascaded to Steps 3+.

2. **[D5 — CRITICAL]** Observations schema conflict: Step 2 (lines 354-374, post-fix) has `confidence REAL`, `domain VARCHAR(50)`, `reflected BOOLEAN`. Step 3 (lines 838-854) has `source VARCHAR`, `importance INTEGER`, `embedding vector(768)`, `isProcessed BOOLEAN`. Two incompatible schemas for the same table. Step 4 MUST choose one definitive schema.

3. **[D2 — MAJOR]** No user-facing error UX for any integration failure. All 6 patterns describe happy-path flows only. What does the CEO see when: n8n Docker is restarting? WebSocket /office drops? Embedding service fails? Reflection cron times out? This is the exact v2 failure pattern — technically complete, no user experience.

4. **[D6 — MAJOR]** n8n proxy timeout unspecified. "When Last Node Finishes" sync mode could block indefinitely. CEO triggers workflow → infinite spinner → abandonment. PM acceptance criteria needed: max workflow wait time (suggest 30s with async fallback + polling for longer jobs).

5. **[D5 — MAJOR]** n8n Docker memory: Step 2 FIX-3 aligned to Brief `--memory=2g`, but Step 3 docker-compose line 666 says `memory: 4G`. Direct contradiction with Step 2 fix.

6. **[D3 — Minor]** `host.docker.internal` (line 662) doesn't work on standard Linux Docker Engine. Winston confirmed — deployment blocker on Oracle ARM64 VPS.

7. **[D3 — Minor]** `generateEmbedding()` signature mismatch (Quinn). Document shows `(content, companyId)`, actual code has `(apiKey, text)`. Would cause tsc error.

8. **[D2 — Minor]** WebSocket /office reconnection strategy missing. CEO's "WOW moment" depends on stable connection. No reconnect + state-sync protocol for deploy/restart scenarios.

9. **[D6 — Minor]** Neon Pro cost ($19/mo) not flagged as budget item. Observations ~1.4GB/year would exceed Neon Free tier (0.5GB) in ~4 months. Solo dev project budget impact.

10. **[D6 — Minor]** Sprint parallel workload risk. Asset generation (Go/No-Go #8) must start Sprint 2 per Step 2 FIX-14. But Sprint 2 = n8n development. Solo dev handling both simultaneously is not assessed.

### Cross-talk
**To Winston (Architect):** The Step 2 fix regression is systemic — Voyage AI 1024d was fixed in Step 2 Domain 4 but NOT propagated to Steps 3+ (at least 3 locations in Step 3 alone, plus lines 1242, 1260, 1325, 1327, 1371, 1707, 1728, 2024, 2151 in later steps). This suggests the fix was applied locally without a document-wide find-replace. Architecture step must establish ONE authoritative schema that all steps reference.

**To Quinn (QA):** Agree on observations schema conflict (your Major #2) and reflection cron locking (your Major #3). From PM perspective, the bigger concern is that ALL integration patterns are happy-path only — no error states, no degraded modes, no user-facing fallbacks. This is how v2 ended up with 485 APIs and 0 real usage. Also: n8n proxy timeout is a UX blocker, not just a resource concern.

**From Winston:** (1) 5 Step 2 fixes NOT propagated to Step 3 — systematic carry-forward failure. Voyage AI, 2G memory, observations confidence+domain all absent from integration patterns that developers would follow during Sprint. Agrees this is a delivery blocker. (2) EventBus map missing 4 channels (tool, cost, argos, debate) — delivery risk if v3 integration relies on incomplete listing. (3) n8n proxy lacks circuit breaker / retry logic for solo-dev VPS stability. Winston scored 7.25/10 PASS (barely). **PM response**: All 3 points align with my findings. Point (1) = my Critical #1 and #2. Point (2) = completeness gap, adding as note to Issue #3. Point (3) reinforces my Major #4 (n8n proxy timeout) — circuit breaker is the architectural solution for the UX problem I flagged.
**From Quinn:** (1) n8n proxy timeout — no SLA defined. Asks PM: acceptable workflow SLA? async fallback for long jobs? UX during wait? **PM answer**: 30s sync timeout, then auto-switch to async mode + polling + toast notification "Workflow running in background". Long workflows (>30s) should NEVER block the proxy. (2) n8n Docker `memory: 4G` reverts Step 2 FIX-3. Agrees Brief must be updated if 4G is required — not silently reverted. **PM recommendation**: update Brief to 4G since n8n docs recommend it and VPS has headroom (17.5GB), OR accept 2G with documented OOM risk. This is a scope decision needing CEO sign-off. (3) Confirms observations schema propagation failure — same finding as my Critical #2. Step 3 was likely written before Step 2 fixes. Quinn scored 5.00/10 FAIL.

### Verdict (Pre-Fix)
FAIL (6.95) — The integration patterns are technically sound for happy-path flows, with excellent code-level specificity (TSX, Docker compose, Hono proxy, WS protocol). However, two critical issues drive the failure: (1) Step 2 embedding fix regression (Gemini references persist where Voyage AI should be), and (2) observations schema conflict between Steps 2 and 3. From the Product/Delivery lens, the absence of user-facing error states in ALL 6 integration patterns repeats the exact v2 failure pattern that the Brief explicitly warns against.

---

### Re-Review (Post-Fix)

**Fixes log**: `_bmad-output/party-logs/stage-1-step-03-fixes.md` (16 fixes: 2 CRITICAL + 4 HIGH + 3 MEDIUM + 5 MINOR)

### Issue Verification (10/10 addressed)

| # | Issue | Status | Verification |
|---|-------|--------|-------------|
| 1 | **CRITICAL** Gemini/768 regression | ✅ FIXED | L863: "Voyage AI API (`voyage-3`, 1024d)". L845→`dimensions: 1024`. L1085: "Voyage AI API failures". L882: "Voyage AI API". Zero Gemini refs remain in Step 3. |
| 2 | **CRITICAL** Observations schema conflict | ✅ FIXED | L850-873: Unified schema. Has `confidence REAL DEFAULT 0.5`, `domain VARCHAR(50)`, `reflected BOOLEAN`, `taskExecutionId` deferred FK, `unreflectedIdx` + `domainIdx` indexes. Matches Step 2 post-fix exactly. Labeled "authoritative definition". |
| 3 | **MAJOR** No error UX | ✅ FIXED | New §3.7b (L1058-1072): 8 failure modes with Korean user-facing messages, degraded mode behavior, fallback content. Covers WS drop, WebGL, n8n down, timeout, personality, embedding, reflection, sprites. v2 failure pattern explicitly addressed. |
| 4 | **MAJOR** n8n proxy timeout | ✅ FIXED | L756-759: 30s sync timeout (`AbortSignal.timeout`), async fallback with `executionId` + 5s polling, circuit breaker (3 failures → 60s OPEN → health check auto-close). Matches PM acceptance criteria exactly. |
| 5 | **MAJOR** n8n Docker memory 4G→2G | ✅ FIXED | L676: `memory: 2G` with Brief reference. L668: `NODE_OPTIONS=--max-old-space-size=1536`. Aligned. |
| 6 | **Minor** host.docker.internal | ✅ FIXED | L671: `172.17.0.1` with comment "Docker bridge gateway IP (Linux)". |
| 7 | **Minor** generateEmbedding() signature | ✅ FIXED | L882: Describes Voyage AI API call pattern directly. No mismatched function signature. |
| 8 | **Minor** WS reconnection | ✅ FIXED | L640: Exp backoff (1s, 2s, 4s, max 30s) + full `office:state` snapshot on reconnect. |
| 9 | **Minor** Neon Pro cost | ✅ FIXED | L1084: "Neon Pro($19/mo) 필수 — budget item". |
| 10 | **Minor** Sprint parallel workload | ⚠️ DEFERRED | PM scheduling scope, not tech research. Acceptable. |

### Residual Issue (Minor, non-blocking)

- **[D5 — Minor]** L1038 `ObservationSource = 'conversation' | 'task' | 'handoff' | 'office'` doesn't match L860 `domain` column values `'conversation'|'tool_use'|'error'`. The TypeScript type and DB column have different names AND different enum values. Step 4 should reconcile — either rename the type to match the column or define separate types for source vs domain.

### Post-Fix Dimension Scores

| Dimension | Pre-Fix | Post-Fix | Weight | Weighted | Evidence |
|-----------|---------|----------|--------|----------|----------|
| D1 Specificity | 9 | **9/10** | 20% | 1.80 | Unchanged — already excellent. New additions (WS security §3.1, circuit breaker §3.2, error UX table §3.7b) maintain the same code-level specificity standard. |
| D2 Completeness | 7 | **9/10** | 20% | 1.80 | All 4 gaps resolved: error UX (§3.7b, 8 modes), n8n timeout+circuit breaker, WS reconnection, Neon Pro cost. EventBus map now complete (10 v2 + 1 new). |
| D3 Accuracy | 6 | **9/10** | 15% | 1.35 | All 5 accuracy errors fixed: Gemini→Voyage AI, 768→1024, host.docker.internal→172.17.0.1, memory 4G→2G, generateEmbedding resolved. No remaining inaccuracies found. |
| D4 Implementability | 7 | **9/10** | 15% | 1.35 | All 3 implementation blockers resolved. Docker compose would work on Linux VPS. Schema uses correct 1024d dimensions. Correct API (Voyage AI). Circuit breaker is implementation-ready. Minor: ObservationSource type mismatch would need reconciliation. |
| D5 Consistency | 4 | **8/10** | 10% | 0.80 | All 6 Step 2 fixes propagated. Schema unified. One residual: `ObservationSource` type (L1038) enum values differ from `domain` column (L860). -1 for this and for n8n memory 2G vs Brief amendment still pending CEO sign-off. |
| D6 Risk Awareness | 7 | **9/10** | 20% | 1.80 | Error UX table breaks the v2 failure pattern. Circuit breaker prevents UX disasters. Neon Pro budgeted. Reflection cron locking (pg_advisory_xact_lock) propagated. Embedding backfill with max retries + dead letter. |

### Weighted Average: 8.90/10 ✅ PASS (Grade A)

Calculation: (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (8×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.80 + 1.80 = **8.90**

### Verdict (Post-Fix)
**PASS (8.90, Grade A)** — All 10 issues addressed (9 fixed, 1 acceptably deferred). The 16 fixes transform Step 3 from a document with dangerous propagation failures into a comprehensive, implementation-ready integration spec. The new §3.7b error UX table is particularly valuable — it directly addresses the v2 failure pattern that the Brief warns against. The circuit breaker, WS reconnection, and unified observations schema bring the integration patterns from "technically correct" to "practically usable." One minor residual: `ObservationSource` type vs `domain` column enum mismatch — non-blocking, easily reconciled in Step 4.
