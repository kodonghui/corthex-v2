## Critic-A (Winston) Review — Step 2: Technical Overview (Reverify — Updated with ECC + Cross-talk)

### Review Date
2026-03-21 (Reverify Round — Updated with ECC cross-reference + John cross-talk)

### Content Reviewed
`_bmad-output/planning-artifacts/technical-research-2026-03-20.md`, Lines 112-484
### Supplementary Reference
`.claude/logs/2026-03-21/ecc-analysis-plan.md` (ECC v3 adoption plan, 307 lines)

### Accuracy Verification Performed (Code-Level + WebSearch)

**File Path Verification:**
- [x] `packages/app/package.json:32` — CONFIRMED `"react": "^19"` (grep verified)
- [x] `packages/admin/package.json:20` — CONFIRMED `"react": "^19"` (grep verified)
- [x] `packages/ui/package.json:12` — CONFIRMED `"react": "^19"` (grep verified)
- [x] `packages/landing/package.json:12` — CONFIRMED `"react": "^19"` (grep verified)
- [x] `packages/server/src/engine/soul-renderer.ts` — EXISTS, 46 lines
- [x] `packages/server/src/ws/server.ts` — EXISTS, WS infrastructure confirmed (createBunWebSocket, JWT auth, 3-connection limit)
- [x] `packages/server/src/services/memory-extractor.ts` — EXISTS
- [x] `packages/server/src/db/pgvector.ts` — EXISTS, cosineDistance at line 33
- [x] `.github/workflows/deploy.yml` — EXISTS
- [x] `.github/workflows/ci.yml` — EXISTS
- [x] Last migration `0060_agents-user-id-nullable.sql` — EXISTS, confirms 0061 is correct next number

**Line Number Verification:**
- [x] `soul-renderer.ts:34` — `const vars: Record<string, string> = {` — EXACT MATCH
- [x] `soul-renderer.ts:41` — `...extraVars,` — EXACT MATCH
- [x] `soul-renderer.ts:45` — `return soulTemplate.replace(/\{\{([^}]+)\}\}/g, (_, key) => vars[key.trim()] || '')` — EXACT MATCH
- [x] `deploy.yml:17` — `runs-on: self-hosted` — EXACT MATCH
- [x] `ci.yml:9` — `runs-on: self-hosted` — EXACT MATCH
- [x] `call-agent.ts:63` — `soulExtraVars = { knowledge_context: knowledgeCtx }` — EXACT MATCH
- [x] `hub.ts:99` — `extraVars.knowledge_context = knowledgeCtx` — EXACT MATCH

**Version Number Verification (WebSearch 2026-03-21):**
- [x] **PixiJS 8.17.1**: GitHub releases confirm v8.17.1 released 2026-03-16T09:19:59Z. npm showed 8.16.0 as "latest" in one search result — possible npm publish delay or search cache. PixiJS blog confirms v8.17.0 post exists. Confidence: MEDIUM (GitHub confirmed, npm inconsistent).
- [x] **@pixi/react 8.0.5**: npm confirms published ~4 months prior (Dec 2025). WebSearch confirms React 19 exclusive, complete ground-up rewrite. Peer dep `pixi.js >=8.2.6` per version matrix — plausible. Confidence: HIGH.
- [x] **@pixi/tilemap 5.0.2**: npm confirms exists, peer dep `pixi.js >=8.5.0`, published ~7 months ago. Confidence: HIGH.
- [x] **n8n 2.12.3**: WebSearch confirms n8n@2.12.2 in release notes. 2.12.3 not individually confirmed but plausible given 2026-03-18 release date. ARM64 native multi-arch on Docker Hub confirmed (native image, no emulation). Confidence: MEDIUM.
- [x] **N8N_DISABLE_UI=true**: WebSearch confirms documented env var at `docs.n8n.io/hosting/configuration/environment-variables/deployment/`. Confidence: HIGH.
- [x] **pixi-tiledmap v2**: WebSearch confirms ground-up rewrite for PixiJS v8. TMJ/TMX support, all layer types, zero external deps. Confidence: HIGH.
- [x] **Hono proxy() helper**: WebSearch confirms exists at `hono/proxy`, announced Feb 2025. Confidence: HIGH.
- [x] **pgvector npm 0.2.1**: Document claims this version. Not individually web-searched but consistent with existing v2 usage. Confidence: MEDIUM.

**Schema Claims Verified (direct code read):**
- [x] `memoryTypeEnum` at schema.ts:28 — `['learning', 'insight', 'preference', 'fact']` — EXACT MATCH
- [x] `knowledge_docs.embedding vector(768)` at schema.ts:1556 — CONFIRMED
- [x] `agentMemories` at schema.ts:1589-1608 — 14 columns (id, companyId, agentId, memoryType, key, content, context, source, confidence, usageCount, lastUsedAt, isActive, createdAt, updatedAt), NO embedding column — MATCHES document claim
- [x] `agents` table at schema.ts:145-171 — has `tierLevel` (line 153), `ownerUserId` (line 160), `enableSemanticCache` (line 165). NO `personality_traits` — correctly identified as needing migration 0063
- [x] `WsChannel` at shared/types.ts:484 — 16 channels, NO 'office' — correctly identified as v3 addition
- [x] `cosineDistance` at db/pgvector.ts:33 — CONFIRMED, uses `<=>` operator
- [x] `scoped-query.ts:7` — `import { cosineDistance } from './pgvector'` — CONFIRMED
- [ ] **FAILED**: `task_executions` table referenced in observations schema (Line 345 FK) — does NOT exist in schema.ts. `grep -n 'task_executions\|taskExecutions' packages/server/src/db/schema.ts` returns zero results.

**CRITICAL NEW — Embedding Provider Mismatch (Reverify Round):**
- [ ] **FAILED**: Domain 4 line 329 says "Embedding dimensions: 768 (our Gemini Embedding, already in v2 schema)" — but **Brief line 493** mandates `Voyage AI voyage-3 (1024d)` with "Gemini 금지 (key constraint)". User feedback (`feedback_no_gemini.md`) confirms: "v3 PRD/아키텍처에서 Gemini 참조 전부 금지. 사장님이 Gemini API 키를 준 적이 없음."
- [ ] **FAILED**: Brief line 158 requires `agent_memories` table to add `vector(1024)` column. Tech research says "768" throughout.

**ECC Cross-Reference (Reverify Round):**
| ECC Section | Tech Research Alignment | Gap |
|-------------|------------------------|-----|
| §2.1 Agent Security | Domain 3 has 4-layer sanitization for personality | **Missing**: tool response prompt injection defense ("84% of agents vulnerable") |
| §2.2 Cost-Aware Pipeline | Domain 4 Haiku $0.06/day estimate | Compatible: ECC $0.10/day LIMIT > estimate. No conflict. |
| §2.3 Continuous Learning | Domain 4 observations has `importance INTEGER` | **Missing**: `confidence` (0.3~0.9) and `domain` (conversation/tool/error) fields |
| §2.7 Agent Harness | Not in Domain scope | N/A — architecture-level for later steps |

### Dimension Scores
| Dimension | Score | Weight | Weighted | Evidence |
|-----------|-------|--------|----------|----------|
| D1 Specificity | 9/10 | 15% | 1.35 | Pinned versions (8.17.1, 2.12.3, 0.2.1, 5.0.2, 8.0.5), exact line numbers all verified (11/11 correct), bundle sizes in KB, RAM idle/peak figures, Docker resource flags. One vague: Chrome ARM64 "Q2 2026" with unverifiable source. |
| D2 Completeness | 8/10 | 15% | 1.20 | All 6 research domains covered with dedicated subsections. Version matrix covers 8 technologies with peer deps and ARM64 columns. Alternatives tables for PixiJS (4 options) and Subframe (4 options). VPS co-residence calculation with 5 services itemized. Missing: (1) Subframe MCP tool list (Lines 437-445) shows platform tools (`list_projects`, `design_page`, `get_page_info`), but our ACTUAL installed MCP is `mcp__plugin_subframe_subframe-docs__search_subframe_docs` (docs search only). Document overstates our Subframe MCP capabilities without clarifying installed vs. available. (2) No measured tree-shaken PixiJS bundle size — only "< 200KB gzipped" estimate. (3) Observation schema (Line 345) references `task_executions(id)` FK without noting this table doesn't exist yet. |
| D3 Accuracy | 7/10 | 25% | 1.75 | 13 verification checks: 11 passed, 2 failed. **CRITICAL**: Domain 4 line 329 says "768 (our Gemini Embedding)" — Brief line 493 mandates Voyage AI 1024d, Gemini explicitly forbidden (user feedback `feedback_no_gemini.md` confirms). This is wrong provider + wrong dimensions. **MEDIUM**: observations FK to non-existent `task_executions`. **MINOR**: soul-renderer `:34` vs `:41`. **MINOR**: Chrome ARM64 blog URL unverifiable. Otherwise strong: all soul-renderer lines exact, React 19 confirmed across 4 packages, memoryTypeEnum matches, cosineDistance confirmed. |
| D4 Implementability | 8/10 | 20% | 1.60 | Version matrix is directly usable for package.json. Docker resource limits with exact `deploy.resources.limits` YAML keys. Big Five prompt pattern with template variables and extraVars integration is copy-paste ready. Observation SQL schema provided. Reflection cron cost model with Haiku/Sonnet breakdown is actionable. Missing: (1) `task_executions` FK will confuse implementer — table must be created first or FK removed. Step 3 corrects this but Step 2 as standalone would mislead. (2) No `bun add pixi.js @pixi/react @pixi/tilemap` install commands. (3) PixiJS `extend()` code example deferred to Step 3 — mentioned conceptually here but pattern not shown. |
| D5 Consistency | 6/10 | 15% | 0.90 | **MAJOR**: Gemini 768d vs Voyage AI 1024d (Brief + feedback). **MAJOR** (Quinn): n8n memory internal inconsistency — L200 says `--memory=2g` (Brief mandate), but L249 mitigation says `{memory: 4G}`. Both within Step 2. ECC §2.3 observations fields not reflected. Otherwise: architecture baseline, sprint order, E8 boundary consistent. |
| D6 Risk Awareness | 7/10 | 10% | 0.70 | 9 Brief risks mapped. VPS headroom documented. Big Five sanitization thorough. **MISSED** (Quinn): n8n `NODE_OPTIONS=--max-old-space-size=4096` inside ANY container (2GB or 4GB) will OOM-kill — V8 heap alone fills container, zero room for native memory. For 2GB container: should be `--max-old-space-size=1536`. Missing: PixiJS SPA memory leak risk. Missing: tool response prompt injection (ECC §2.1). |

### Weighted Average: 7.50/10 (revised: 8.30 → 7.75 → 7.50 after all cross-talk)

### Issues Found (Priority Order — Updated with ECC + Cross-talk)
1. **[D3+D5 CRITICAL]** Domain 4 embedding: "768 (our Gemini Embedding)" (line 329) contradicts Brief mandate "Voyage AI voyage-3 (1024d)" (Brief line 493) AND user feedback "Gemini 금지" (`feedback_no_gemini.md`). This is wrong provider + wrong dimensions. Fix: replace "768 (our Gemini Embedding, already in v2 schema)" → "1024 (Voyage AI voyage-3 — Brief mandate. Existing vector(768) Gemini → vector(1024) migration + full re-embed required per Brief §4)". Also: Brief line 158 requires `agent_memories` to add `vector(1024)` column — not mentioned in tech research. — **CRITICAL**
2. **[D3 Accuracy]** Observations table FK to `task_executions(id)` (Line 345) — table does NOT exist in current schema.ts. Step 3 revises this schema and drops the FK, but Step 2 retains the incorrect reference. — **Medium**
3. **[D5 Consistency]** Observations schema missing ECC-recommended fields: `confidence REAL DEFAULT 0.5` (ECC §2.3: 0.3~0.9 scoring) and `domain VARCHAR(50)` (conversation/tool_use/error tagging). — **Minor**
4. **[D3 Accuracy]** soul-renderer.ts line reference inconsistency: Layer 0 security (Line 297) says `:34`, attack path (Line 301) says `:41`. Actual `...extraVars` is at `:41`. — **Minor**
5. **[D2 Completeness]** Subframe MCP tools table (Lines 437-445) lists platform capabilities, not our installed `search_subframe_docs`. — **Minor**
6. **[D3 Accuracy]** Chrome ARM64 blog URL (Line 153) — unverifiable, potentially fabricated. — **Minor**
7. **[D1 Specificity]** PixiJS tree-shaken bundle "< 200KB gzipped" (Line 142) — no measured value. Sprint 0 benchmark needed. — **Minor**
8. **[D6 Risk — Quinn]** n8n `NODE_OPTIONS=--max-old-space-size=4096` (L249) inside a 2GB container = guaranteed OOM-kill. V8 heap 4GB >> container 2GB. Fix: `--max-old-space-size=1536` for 2GB container (75% headroom for native memory). — **Medium**
9. **[D5 Consistency — Quinn]** n8n memory internal inconsistency: L200 resource table says `--memory=2g` (Brief mandate L408/490/507), but L249 mitigation says `{memory: 4G}`. Same section, two different values. Fix: align L249 to `{memory: 2G}`. — **Medium**
10. **[D6 Risk]** Tool response prompt injection defense missing (ECC §2.1). — **Minor** (architecture steps)

### Cross-talk (Updated — Reverify Round)
**To Quinn (QA):** (1) Embedding provider mismatch is also a security concern — if Gemini embedding code persists into v3, it references an API key that doesn't exist (CEO never provided Gemini key per `feedback_no_gemini.md`). Observations could be poisoned via tool outputs that aren't sanitized (ECC §2.1). (2) Observations schema FK to `task_executions` will fail deployment. (3) `reflected BOOLEAN` in Step 2 vs `isProcessed BOOLEAN` in Step 3 — naming inconsistency.

**To John (PM):** (1) Agree 100% on embedding migration scope. Tech research says "768 (our Gemini Embedding)" — this is v2 baseline, not v3 plan. Brief mandates: Voyage AI 1024d + full re-embed of knowledge_docs + new vector(1024) on agent_memories. Sprint 0 must include embedding migration feasibility (row count × Voyage AI API cost + time). (2) PixiJS bundle borderline remains — Sprint 0 benchmark is the gate. (3) Scenario.gg pricing is Step 5 scope, not Step 2.

**From Quinn:** (1) Embedding dimension affects ALL vector schemas: knowledge_docs, semantic_cache (both vector(768)), plus new observations + agent_memories. HNSW indexes are dimension-specific — cannot mix 768 and 1024. (2) n8n `max-old-space-size=4096` will OOM-kill; recommend `--max-old-space-size=1536` for Brief's 2GB limit. (3) Dual observations schema (Step 2 SQL vs Step 3 Drizzle). (4) **ACK Round 2**: Agreed on Gemini API key non-existence (`feedback_no_gemini.md` = broken code path). Flagged **transitive prompt injection** attack: malicious tool output → observation → reflection cron → poisoned insight in agent_memories → corrupted future tasks. Added as Quinn Issue #13 (D6 HIGH). Quinn scored **5.90/10 FAIL**.
**From John:** Embedding migration is unscoped Sprint 0 dependency — days of re-embedding work. `feedback_no_gemini.md` is the "smoking gun" — no Gemini API key exists. **ACK Round 2**: 3-critic average below 7.0 threshold. All 3 critics converge on same root cause: Voyage AI embedding migration is unresearched. John scored **7.25/10 PASS**.

### Pre-Fix Verdict
FAIL (avg 6.88/10) — Winston 7.50, John 7.25, Quinn 5.90. Root cause: Gemini 768d in tech research vs Voyage AI 1024d Brief mandate.

---

### Post-Fix Verification (19 fixes applied)

**Fixes Verified (code-level re-read):**

| Fix | Issue | Verified | Evidence |
|-----|-------|----------|----------|
| FIX-1 | Voyage AI 1024d research | ✅ | Lines 336-344: `voyage-3` SDK, pricing ($0.06/1M), migration SQL (`ALTER COLUMN vector(1024)`), re-embed batch, HNSW rebuild, Sprint 0 blocker 2-3 days. No Gemini reference remaining in Domain 4. |
| FIX-2 | Observations schema + confidence/domain | ✅ | Lines 354-380: FK deferred with comment (L360-362), `confidence REAL DEFAULT 0.5` (L365), `domain VARCHAR(50)` (L366), `obs_domain_idx` (L373), Scale Reconciliation note (L376-380). |
| FIX-3 | n8n `--memory=2g` Brief alignment | ✅ | L200: `2 GB limit (Brief L408/L490/L507)`. L249: `{memory: 2G}`. Both consistent. |
| FIX-4 | n8n DNS rebinding | ✅ | L220: `127.0.0.1:5678:5678` localhost-only binding. |
| FIX-5 | Reflection cron race condition | ✅ | L402: `pg_advisory_xact_lock` guard. L403: 30-day purge with batch DELETE + VACUUM ANALYZE. |
| FIX-6 | n8n OOM prevention | ✅ | L249: `max-old-space-size=1536`. L251: OOM kill risk note with GitHub #16980. |
| FIX-7 | n8n credential isolation | ✅ | L225: `N8N_ENCRYPTION_KEY` AES-256-GCM. |
| FIX-10 | Subframe MCP installed vs available | ✅ | L474-482: table with Status column (✅ Installed / Requires full MCP). |
| FIX-11 | soul-renderer line ref | ✅ | L304: `:34-42` (vars block), `:41` (extraVars). Consistent. |
| FIX-14 | Asset pipeline timeline | ✅ | L451-458: 3 options with days/character estimates, who/when, risk mitigation. |

**Deferred (justified):**
- Chrome ARM64 blog URL — no replacement source available (minor)
- PixiJS bundle measurement — requires Sprint 0 benchmark (minor)
- Tool response injection — architecture Step 4 scope (minor)
- Pipeline version header v9.0 — cosmetic (not flagged in fixes)

### Re-Scored Dimensions (Post-Fix)
| Dimension | Pre-Fix | Post-Fix | Weight | Weighted | Change Reason |
|-----------|---------|----------|--------|----------|---------------|
| D1 Specificity | 9 | 9 | 15% | 1.35 | Already strong. Voyage AI pricing ($0.06/1M) adds specificity. |
| D2 Completeness | 8 | 9 | 15% | 1.35 | Voyage AI fills Domain 4 gap. Observations schema complete. Subframe MCP clarified. Asset timeline added. |
| D3 Accuracy | 7 | 9 | 25% | 2.25 | CRITICAL Gemini→Voyage AI fixed. FK clarified. soul-renderer ref corrected. Only Chrome URL remains (minor, deferred). |
| D4 Implementability | 8 | 9 | 20% | 1.80 | Voyage AI migration SQL copy-paste ready. n8n OOM mitigation actionable. Observations schema with all fields. |
| D5 Consistency | 6 | 9 | 15% | 1.35 | Gemini→Voyage AI now matches Brief. n8n 2GB matches Brief. UXUI tooling corrected. Scale Reconciliation resolves confidence coexistence. |
| D6 Risk Awareness | 7 | 9 | 10% | 0.90 | n8n OOM (#16980), DNS rebinding, cron race (`pg_advisory_lock`), credential isolation, observation purge, Sprint 0 blocker estimate. |

### Post-Fix Weighted Average: 9.00/10 ✅ PASS (Grade A)

### Final Verdict
**PASS — 9.00/10 (Grade A)**. All critical and medium issues resolved. 19 fixes applied comprehensively — the Voyage AI migration research (FIX-1) is particularly thorough, covering SDK, pricing, migration SQL, and Sprint 0 scope. The n8n security hardening (FIX-3/4/6/7) transforms Domain 2 from "functional research" to "deployment-ready specification." Three minor items justifiably deferred to later steps. Score trajectory: 8.30 → 7.75 → 7.50 → **9.00**.
