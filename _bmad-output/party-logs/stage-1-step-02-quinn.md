## Critic-B (Quinn) Review — Step 2: Technical Overview

### Review Date
2026-03-21

### Content Reviewed
`_bmad-output/planning-artifacts/technical-research-2026-03-20.md`, Lines 112-484

### Security/QA Verification Performed
- [x] Prompt injection paths analyzed: 4-layer sanitization described (Layer 0 Key Boundary, Layer A API Zod, Layer B extraVars strip, Layer C Template regex). However, Layer B strip pattern `String(value).replace(/[\n\r]/g, ' ').replace(/[{}]/g, '').slice(0, 200)` is described in Step 2 but NOT applied in the actual `buildPersonalityVars()` code shown in Step 5 -- the function returns `String(number)` directly without the strip. This is safe for integer-sourced values but the documented Layer B is effectively skipped for personality vars, creating a documentation-vs-implementation gap.
- [x] Race conditions checked: No race conditions identified in Step 2 scope (technology overview, no runtime patterns yet). Deferred to Steps 3-4 appropriately.
- [x] Missing test scenarios identified: 5 scenarios listed below
- [x] Resource limit claims verified: n8n RAM claim "~860 MB idle, 2-4 GB peak" — source cited is Hostinger tutorial benchmark, not n8n official documentation. The 4GB Docker limit is a hard ceiling (`--memory=4g`), but there is no analysis of what happens at OOM: does n8n gracefully degrade or crash-loop? Co-residence total of ~8.5GB peak + 15.5GB headroom is arithmetically correct for 24GB VPS.
- [x] Edge cases documented: 7 edge cases

### Dimension Scores
| Dimension | Score | Weight | Weighted | Evidence |
|-----------|-------|--------|----------|----------|
| D1 Specificity | 8/10 | 10% | 0.80 | Pinned versions (PixiJS 8.17.1, n8n 2.12.3, pgvector 0.2.1), bundle sizes in KB, hex colors, file paths. Minor: pgvector PG extension version still says "Neon managed -- verify via SQL query" (not actually verified). |
| D2 Completeness | 7/10 | 25% | 1.75 | All 6 domains covered. Gaps: (1) No mention of n8n OOM kill behavior or restart policy in Step 2 (only Docker `unless-stopped`). (2) WebSocket channel count inconsistency -- audit doc says 14, WsChannel type in code has 16 channels, Brief line 176 says 16. Document says 14 at line 67 of scope section. (3) Domain 6 references "Subframe" as sole UXUI tool but MEMORY.md says Subframe was deprecated in favor of Stitch 2 and Gemini prompts. (4) Missing: what happens if n8n Docker container consumes all 4GB and gets OOM-killed during a workflow execution? |
| D3 Accuracy | 6/10 | 15% | 0.90 | CRITICAL: Embedding provider inconsistency. Step 2 Domain 4 says existing embedding is "768 (our Gemini Embedding)" and pgvector research references Gemini. Brief says "Gemini 금지" and mandates Voyage AI. embedding-service.ts confirms current code uses `@google/generative-ai` `text-embedding-004`. The research doc at Domain 4 (line 329) says "768 (our Gemini Embedding, already in v2 schema)" but the Brief's `임베딩 프로바이더: Voyage AI voyage-3 (1024d)` creates a dimensional mismatch: observations table schema at line 792 uses `vector('embedding', { dimensions: 768 })` but if Voyage AI is the target, it should be 1024. WsChannel count: doc scope section says 14 (line 67), actual code has 16. |
| D4 Implementability | 8/10 | 10% | 0.80 | Version matrix is copy-paste ready. Docker compose pattern clear. Bundle size analysis actionable. PixiJS tree-shaking `extend()` pattern well-documented. |
| D5 Consistency | 6/10 | 15% | 0.90 | (1) Embedding dimension conflict: observations schema says 768, Brief mandates Voyage AI 1024d. (2) WsChannel count: 14 vs 16. (3) Subframe vs Stitch inconsistency with MEMORY.md. (4) Brief says trait scale "0.0~1.0" but research overrides to 0-100 -- this override is well-documented and justified but creates a Brief deviation that must be formally annotated. |
| D6 Risk Awareness | 7/10 | 25% | 1.75 | 9 risks identified (R1-R9) with mitigations. Missing: (1) DNS rebinding attack on n8n `127.0.0.1:5678` binding -- a browser-based DNS rebinding attack could reach the internal n8n API. (2) n8n container escape risk not mentioned. (3) No discussion of n8n auto-update/CVE monitoring. (4) PixiJS WebGL fingerprinting/privacy implications not mentioned (minor). |

### Weighted Average: 6.90/10

### Issues Found
1. **[D3 Accuracy]** Embedding dimension conflict: observations schema (line 792) uses `vector(768)` but Brief mandates Voyage AI `voyage-3` which produces 1024-dimensional embeddings. If the migration targets 768d, it contradicts the Brief. If it targets 1024d, it contradicts the code pattern in this step. This is not resolved within Step 2. — **Major**
2. **[D3 Accuracy]** embedding-service.ts uses `@google/generative-ai` (Gemini) but CLAUDE.md and MEMORY.md state "Gemini API 사용 금지. 임베딩 포함 전부 Claude 생태계(Voyage AI 등)." The research references both Gemini (current) and Voyage AI (target) without clearly flagging the migration as a breaking dependency. — **Major**
3. **[D5 Consistency]** WebSocket channel count: Scope section line 67 says "WebSocket: +1 channel (/ws/office) on existing Bun WS" alongside "14개" from audit, but `packages/shared/src/types.ts:484-500` shows 16 channels (chat-stream, agent-status, notifications, messenger, conversation, activity-log, strategy-notes, night-job, nexus, command, delegation, tool, cost, debate, strategy, argos). — **Minor**
4. **[D6 Risk Awareness]** DNS rebinding attack vector on n8n. Binding to `127.0.0.1:5678` prevents direct external TCP access but does NOT prevent DNS rebinding attacks where a malicious website causes the browser to resolve a hostname to 127.0.0.1 and make requests to port 5678. n8n should validate the Host header or use authentication on ALL endpoints. — **Major**
5. **[D2 Completeness]** n8n OOM kill behavior undocumented. Docker `--memory=4g` will OOM-kill the container. What happens to in-flight workflow executions? Are they retried? Is there data loss in the n8n internal DB? The `restart: unless-stopped` policy will restart the container but workflow state recovery is not discussed. — **Major**
6. **[D5 Consistency]** Domain 6 references Subframe as sole UXUI tool ("Note: Google Stitch deprecated from pipeline. Subframe is sole UXUI tool." line 435) but MEMORY.md Phase 6 says Stitch was deprecated and Gemini prompts replaced it, with Phase 6 generated assets already in `_corthex_full_redesign/phase-6-generated/`. The UXUI tooling story is confused. — **Minor**
7. **[D2 Completeness]** No mention of ARM64-specific Docker image size or pull time for n8n. While ARM64 support is confirmed, the initial `docker pull` of 287MB compressed on VPS bandwidth is not considered for Sprint 0 timeline. — **Minor**

### Missing Test Scenarios (per step)
1. n8n Docker container OOM kill → verify workflow execution state is not corrupted → verify container restarts and health check passes
2. PixiJS bundle size regression test in CI — described conceptually but no test template provided in Step 2 (deferred to Step 5, but Step 2 makes the 200KB claim without verification methodology)
3. n8n ARM64 Docker image functional smoke test — pull image, start container, hit /healthz, stop container
4. pgvector extension version query on actual Neon instance — document says "MEDIUM confidence" but no test to verify
5. DNS rebinding attack simulation against n8n on 127.0.0.1:5678 — no test exists and no mitigation documented

### Cross-talk
**To Winston (Architect):** The embedding dimension conflict (768 vs 1024) is a foundational architecture decision that must be resolved BEFORE any schema migration is written. If Voyage AI 1024d is the target, every `vector(768)` reference in the research (observations, agent_memories 0064, knowledge_docs existing) needs to be reconciled. This is not a minor detail -- HNSW indexes are dimension-specific and cannot mix dimensions.
**To John (PM):** The Gemini-to-Voyage-AI embedding migration is a hidden sprint 0 dependency that adds significant scope: re-embed ALL existing knowledge_docs (potentially thousands of documents), change embedding-service.ts, update all vector column dimensions. This must be explicitly scoped or deferred.
**From Winston:** [Pending -- will be filled after cross-talk round]
**From John:** [Pending -- will be filled after cross-talk round]

### Verdict
FAIL — Embedding dimension conflict (768 vs 1024, Gemini vs Voyage AI) is a foundational inconsistency that propagates through every domain using vector search. DNS rebinding risk on n8n is unmitigated. Weighted average 6.90 is below 7.0 pass threshold.
