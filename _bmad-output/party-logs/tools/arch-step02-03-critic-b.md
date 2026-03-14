# CRITIC-B Review — arch-step02+03 (Project Context Analysis + Starter Template Evaluation)

**Reviewer:** CRITIC-B (Winston / Amelia / Quinn / Bob)
**Date:** 2026-03-14
**Scope:** architecture.md lines 1–409 (Steps 02+03 complete)
**Score:** 7/10

---

## Winston (Architect) — Consistency with D1-D21, E1-E10

**Positive:**
- Extension note (lines 22–29) correctly flags D22+ start and E11+ start. No claims of overriding base decisions.
- D17 (messages.create()) incompatibility with native `mcpServers` is correctly identified (line 71) and drives the Manual Pattern requirement.
- E3 (getDB) extension point is called out explicitly (line 75, lines 324–379). All 5 new tables route through getDB(companyId). D1 compliance maintained.
- D3 typed error protocol correctly extended (line 108): TOOL_/AGENT_ prefix maintained, 7 new error codes are specific.
- D4 Hook pipeline order preserved (line 73): credential-scrubber runs PostToolUse before delegation-tracker — correct.

**Issue 1 (CRITICAL — Security / D1 violation):** `getMcpServersForAgent` query (lines 357–361) has a cross-tenant data leak vector.

```typescript
getMcpServersForAgent: (agentId: string) =>
  db.select({ mcp: mcpServerConfigs }).from(agentMcpAccess)
    .innerJoin(mcpServerConfigs, eq(agentMcpAccess.mcpServerId, mcpServerConfigs.id))
    .where(and(eq(agentMcpAccess.agentId, agentId), eq(mcpServerConfigs.isActive, true))),
    // 보안 체인: agent → agent_mcp_access → mcp_server_configs → company_id 일치 검증
```

The comment claims "company_id 일치 검증" but the WHERE clause contains **no** `eq(mcpServerConfigs.companyId, companyId)` filter. If `agentId` is supplied by a caller with a cross-company agent UUID (e.g., through a compromised token or business logic bug), this query will return MCP server configs belonging to a different company. D1 states all DB access must be company_id isolated. The fix is one line: add `eq(mcpServerConfigs.companyId, companyId)` to the AND clause.

**Issue 2 (Significant — DB Schema):** `tool_call_events.companyId` (line 235) is declared as `text('company_id').notNull()` **without** `.references(() => companies.id)`. Every other table in this schema (credentials line 169, mcp_server_configs line 184, reports line 215) uses `.references(() => companies.id)`. Inconsistent FK enforcement. If a `companies` row is deleted, orphaned `tool_call_events` rows will not cascade. Add FK constraint or document explicitly why it is omitted (e.g., for high-write-volume performance — but if so, document as a named decision D30).

**Issue 3 (Significant — PRD-D8 resolution gap):** PRD deferred decisions table (lines 114–124) resolves D1, D2, D3+D4, D6, D7, D9, D12 = 7 items. **PRD-D8** ("tool_call_events 인덱스 설계") is resolved as D29 — this resolution is visible only in a code comment at line 245 (`// PRD D8 → D29: 3종 인덱스 확정`), but PRD-D8 does NOT appear in the formal resolution table. Leaves PRD-D8 status ambiguous. Add `PRD-D8 | tool_call_events 인덱스 3종 설계 | → D29: tce_company_date, tce_company_agent_date, tce_company_tool_date + tce_run_id` as a row in the table.

---

## Amelia (Dev) — ARM64 / Bun Implementation Feasibility

**Positive:**
- Puppeteer ARM64 risk correctly called (line 156): `puppeteer-core` + system Chromium path as fallback is viable on Debian/Ubuntu ARM64 (package: `chromium-browser`).
- p-queue ESM risk correctly called (line 158): `async-sema` CommonJS fallback is appropriate.
- Bun `crypto.subtle` AES-GCM: Web Crypto API is available in Bun since 1.0. No external dependency needed. Correct.
- D26 lazy spawn + 30s cold start timeout: Bun `child_process.spawn()` works but `npx -y @notionhq/notion-mcp-server` on cold start downloads npm packages — 30s is realistic for first run, subsequent warm starts are <3s. Correct sizing.

**Issue 4 (Moderate — Dockerfile not in Code Disposition Matrix):** The architecture requires (a) `fonts-noto-cjk` installation (lines 43, 393) and (b) Puppeteer Chromium cache path addition to `DOCKERFILE COPY` (line 156) for Phase 1 Korean PDF rendering. Neither appears in the Code Disposition Matrix (lines 396–405). `Dockerfile` must be listed as `[MODIFY] Phase 1` with specific changes: `RUN apt-get install -y fonts-noto-cjk` + Puppeteer cache layer. Without this, `md_to_pdf` Korean text will render as tofu (□□□) in production.

**Issue 5 (Minor — Bun ESM verification command):** Line 387, Puppeteer verification command:
```
bun -e "const p = require('puppeteer'); await p.launch(); p.close()"
```
`require()` fails in Bun's ESM context for a pure ESM package like `puppeteer@22.x`. Correct form:
```
bun --eval "import puppeteer from 'puppeteer'; const b = await puppeteer.launch(); await b.close(); console.log('OK')"
```
If the Story team runs the documented command, it will fail with `ReferenceError: require is not defined` before even testing Puppeteer itself.

---

## Quinn (QA) — Testability

**Positive:**
- E15 (save_report partial failure contract) referenced at line 43 and 296: partial failure means DB commit + per-channel result reporting, no rollback. This is testable: mock each distribution channel individually and verify DB row exists regardless of channel failure.
- 3-way handshake verification for MCP connection test (line 57): JSON-RPC `initialize` → `initialized` → `tools/list` is a concrete, testable acceptance criterion.
- Pipeline Gate SQL (line 93): `SELECT ... WHERE run_id = $1 GROUP BY run_id HAVING COUNT(*) >= 2` — runnable in bun:test with a seeded tool_call_events table.

**Issue 6 (Moderate — MCP lifecycle testability gap):** The 8-stage Manual MCP Pattern (RESOLVE→SPAWN→INIT→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN) is referenced at lines 71, 87 and will live in `engine/mcp/mcp-manager.ts`. However, the architecture does not specify how `child_process.spawn()` will be mockable in CI tests. ARM64 VPS CI runners may not have `npx @notionhq/notion-mcp-server` available. The architecture should specify: (a) `mcp-manager.ts` accepts an injectable `SpawnFn` interface (not hard-coded to `child_process.spawn`) enabling mock STDIO streams in bun:test, (b) a fixture MCP server script (`test/fixtures/mock-mcp-server.ts`) that responds to `initialize` + `tools/list` deterministically. Without this, MCP unit tests will require live network access or will be skipped — Quinn flags this as a TEA blocker.

**Issue 7 (Minor — `getMcpServersForAgent` has no test for cross-company isolation):** Directly related to Issue 1: because the query lacks the companyId filter, a test that seeds company A's agent + company B's MCP server + a cross-link in `agent_mcp_access` would pass (returning B's server) when it should return 0 results. This isolation test is not listed in any verification checklist. Add it to the dependency verification story.

---

## Bob (SM) — Scope / Phase 1 Delivery (3–4 weeks)

**Positive:**
- 28 new files with 3 modifications is specific and countable (line 64, line 322). Scope is clear.
- Dependency verification story with 7 checkpoints (lines 385–393) is a good risk reduction at sprint start.
- Phase 1 = 7 built-in tools confirmed (line 253–261): md_to_pdf, save_report, list_reports, get_report, publish_tistory, upload_media, read_web_page. Aligns with PRD MVP scope.

**Issue 8 (Moderate — DB Table Count Discrepancy vs PRD):** PRD complexity score (PRD line ~117) states `db_schema_change: 4` and lists "4개 신규 DB 테이블 (reports, mcp_server_configs, agent_mcp_access, content_calendar)". Architecture (Phase 1) defines **5** new Phase 1 tables: credentials + mcp_server_configs + agent_mcp_access + reports + tool_call_events, plus 1 Phase 2 table (content_calendar). The `credentials` table and `tool_call_events` table are not counted in PRD's complexity score. This is not a blocker but creates a story-pointing discrepancy — the PRD's 4-table estimate understates DB migration effort by 2 tables (each requiring Drizzle schema + migration + getDB methods + tests). Sprint planning should adjust accordingly.

---

## Summary of Issues

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 1 | **CRITICAL** | Line 357–361 | `getMcpServersForAgent` missing `companyId` filter → cross-tenant MCP config exposure |
| 2 | **Significant** | Line 235 | `tool_call_events.companyId` missing FK `.references(() => companies.id)` |
| 3 | **Significant** | Lines 114–124 | PRD-D8 → D29 resolution not listed in formal deferred decisions table |
| 4 | **Moderate** | Lines 396–405 | Dockerfile missing from Code Disposition Matrix (fonts-noto-cjk + Puppeteer cache) |
| 5 | **Minor** | Line 387 | Puppeteer verification command uses `require()` — fails in Bun ESM context |
| 6 | **Moderate** | Lines 281–285 | MCP lifecycle testability: no SpawnFn injection interface or mock fixture specified |
| 7 | **Minor** | Lines 357–361 | No cross-company isolation test specified for getMcpServersForAgent |
| 8 | **Moderate** | Lines 64, 322 | PRD db_schema_change: 4 vs architecture's 5 Phase 1 tables — sprint estimate gap |

**Minimum required fixes before proceeding to Steps 4+:** Issues 1, 2, 3 (critical + significant). Issues 4, 6, 8 should be addressed in same pass. Issues 5, 7 can be deferred to story-level.

---

**Score: 7/10**

Step 02 (Project Context Analysis): 8/10 — thorough coverage of 41 FRs / 20 NFRs / cross-cutting concerns. PRD-D8 gap (Issue 3) is the main deduction.
Step 03 (Starter Template Evaluation): 6.5/10 — schema design is structurally sound but Issue 1 (cross-tenant security) is a critical correctness bug, and Issues 2, 4, 6, 8 reduce confidence in production readiness.
