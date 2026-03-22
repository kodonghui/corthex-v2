## Critic-B (Quinn) Review — Step 3: Integration Patterns

### Review Date
2026-03-22 (Cycle 4 — [Verified] FINAL)

### Content Reviewed
`_bmad-output/planning-artifacts/technical-research-2026-03-20.md`, Lines 540-1087

### Review History
| Cycle | Date | Score | Verdict | Key Delta |
|-------|------|-------|---------|-----------|
| 1 | 2026-03-21 | 7.20 | PASS (marginal) | Initial review, 9 issues |
| 2 | 2026-03-21 | 5.00 | FAIL | Deeper: Step 2 propagation catastrophe (6+ fix reversions) |
| 3 | 2026-03-22 | 5.00/7.75 | FAIL/PASS | Pre-fix 5.00, post-fix 7.75 (16 fixes verified) |
| **4** | **2026-03-22** | **7.75** | **[Verified] PASS** | Source doc re-verified, all fixes confirmed |

---

### [Verified] Fix Status — All Issues

| # | Issue | Severity | Status | Line Evidence |
|---|-------|----------|--------|---------------|
| 1 | Embedding `768` -> `1024` Voyage AI | CRITICAL | **FIXED** | L863: `vector('embedding', { dimensions: 1024 })` with comment "Voyage AI voyage-3 1024d (Step 2 FIX-1)". L882: "Voyage AI API (voyage-3, 1024d, voyageai npm SDK)". L837: migration note. |
| 2 | "Gemini Embedding API" -> Voyage AI | CRITICAL | **FIXED** | L882: "Voyage AI API". Zero grep matches for "Gemini Embedding API" or "Gemini embed" in Step 3 scope. L1085 carry-forward: "Voyage AI failures" (not Gemini). |
| 3 | Docker `memory: 4G` -> `2G` | HIGH | **FIXED** | L676: `memory: 2G` with comment "Brief mandate L408/L490/L507 (Step 2 FIX-3)". |
| 4 | Observations schema diverged from Brief | HIGH | **FIXED** | L860: `domain VARCHAR(50)`. L862: `confidence REAL DEFAULT 0.5` (0.3-0.9). L864: `reflected BOOLEAN`. L858: `taskExecutionId` deferred FK. L850: "unified with Step 2 schema -- authoritative definition". |
| 5 | `N8N_HOST=localhost` -> `127.0.0.1` | HIGH | **FIXED** | L661: `N8N_HOST=127.0.0.1` with comment "NOT localhost -- prevents IPv6 ::1 bypass (Step 2 FIX-4)". |
| 6 | WS rate limiting + validation absent | HIGH | **FIXED** | L634-640: Comprehensive. 30 msg/sec, x/y bounds validation, direction enum, targetAgentId validation, 256B limit, 50 per-company cap, 5s pre-auth timeout, exp backoff reconnection. |
| 7 | n8n security incomplete | MEDIUM | **FIXED** | L667: `N8N_ENCRYPTION_KEY` AES-256-GCM. L668: `NODE_OPTIONS=--max-old-space-size=1536`. L671: `172.17.0.1` (Linux Docker, not host.docker.internal). |
| 8 | Reflection cron race condition | MEDIUM | **FIXED** | L887: `pg_advisory_xact_lock(hashtext('reflection-' || company_id::text))`. Step 2 FIX-5 pattern propagated. |
| 9 | Observation poisoning | MEDIUM | Deferred | Deferred to Step 4 Decision 4.4.5 -- verified resolved there (4-layer defense). Acceptable for integration patterns step. |
| 10 | `generateEmbedding()` signature | LOW | Still present | L882 shows async embedding call but doesn't show explicit function signature. Resolved in Step 5 (L1671: correct `generateEmbedding(apiKey, content)` signature). Acceptable -- Step 3 is integration patterns, not implementation code. |
| 11 | n8n proxy timeout unspecified | LOW | **FIXED** | L756-759: 30s AbortSignal, async fallback with executionId polling, circuit breaker (3 failures -> 60s OPEN -> health check auto-close). |
| 12 | WS message size "< 100 bytes" inaccurate | LOW | **FIXED** | L642: "~100-150 bytes each". L637: server->client `office:state` broadcast noted as 5-10KB (not rate-limited). |

**Additional fixes verified:**
- `host.docker.internal` -> `172.17.0.1` (Winston cross-talk catch): L671 -- FIXED
- EventBus map incomplete (7 -> 11 channels): L1010-1024 -- FIXED (tool, cost, argos, debate added)
- Error states table (John cross-talk: "happy-path only"): Section 3.7b (L1058-1072) -- FIXED, 8 failure modes with Korean error messages
- Neon Pro cost in carry-forward: L1084 -- FIXED
- Observation purge in reflection flow: L893 -- FIXED (30-day, batch 1000, VACUUM)
- Embedding backfill max retries: L883 -- FIXED (5 retries, then flag for manual review)

### Residual Issue (1 -- Minor)

**`ObservationSource` type vs `domain` column value mismatch**: L1038 defines `ObservationSource = 'conversation' | 'task' | 'handoff' | 'office'` but L860 defines `domain` column as `'conversation' | 'tool_use' | 'error'`. These are different value sets. They represent different concepts (trigger source vs content domain) but the naming overlap (`conversation` in both) could cause developer confusion. This is a typing/naming issue, not a schema issue.

### Dimension Scores ([Verified] Final)

| Dimension | Score | Weight | Weighted | Evidence |
|-----------|-------|--------|----------|----------|
| D1 Specificity | 8/10 | 10% | 0.80 | WS rate limits specific (30/sec, 256B, 50 cap). Circuit breaker (3 failures, 60s). Docker compose fully detailed with all env vars. Advisory lock SQL exact. |
| D2 Completeness | 8/10 | 25% | 2.00 | All major gaps filled: WS security comprehensive (6 defense layers), failure modes table (8 modes), embedding backfill (5 retries), EventBus complete (11 channels), observations schema unified with all Brief fields, n8n proxy timeout + circuit breaker. |
| D3 Accuracy | 8/10 | 15% | 1.20 | All factual errors corrected: Voyage AI 1024d, 127.0.0.1, 2G memory, domain/reflected, 172.17.0.1 for Linux Docker. Schemas consistent with Step 2 and Brief. |
| D4 Implementability | 8/10 | 10% | 0.80 | Docker compose copy-paste ready. Observations Drizzle schema authoritative. Circuit breaker pattern clear. WS validation rules specified with rejection message format. |
| D5 Consistency | 8/10 | 15% | 1.20 | Step 2 fixes fully propagated. Schema unified. Carry-forwards updated. EventBus complete. Minor: ObservationSource/domain value set mismatch (acknowledged). |
| D6 Risk Awareness | 7/10 | 25% | 1.75 | WS DoS addressed (rate limit + caps + pre-auth timeout). n8n security complete (encryption, OOM, iptables). Reflection locking (advisory lock). Circuit breaker for n8n proxy. Error states table for all failure modes. Observation poisoning deferred to Step 4 (acceptable). |

### Weighted Average: 7.75/10

### Cross-talk (Final -- to John)
**To John (PM):** [Verified] Step 3 score confirmed at **7.75/10 PASS**. All 2 Critical + 4 High + 3 Medium issues resolved.

Key delivery-relevant findings:
1. **n8n proxy timeout = 30s** with async fallback. CEO sees workflow progress indicator, not infinite spinner. Circuit breaker prevents cascading failures (3 failures -> 60s cooldown).
2. **Error states table (3.7b)** -- 8 failure modes with Korean user-facing messages + degraded mode behavior. Directly usable as Sprint acceptance criteria. Addresses v2's "technically complete, practically unused" pattern.
3. **WS `/office` security** -- 30 msg/sec rate limit, per-company 50 connection cap, pre-auth 5s timeout, message validation (bounds, enum, ID existence). Sprint 4 acceptance criteria ready.
4. **Observations schema unified** -- confidence (0.3-0.9), domain, reflected, importance all present. Brief-aligned. Authoritative for Sprint 3.
5. **Docker compose** -- copy-paste ready with all security fixes (127.0.0.1, encryption key, max-old-space-size, 172.17.0.1 for Linux). Sprint 2 Day 1 deliverable.

**From Winston:** [Verified] 7.75 confirmed.
**From John:** [Pending -- this message]

### Verdict

**[Verified] 7.75/10 -- PASS**

Score progression: 7.20 -> 5.00 -> 5.00/7.75 -> **7.75 (final, verified)**

All Critical and High issues resolved. One Minor residual (ObservationSource/domain naming overlap). Step 3 is approved for Architecture stage handoff.
