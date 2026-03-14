# CRITIC-A Review — arch-step02+03 (Context Analysis + Starter Template)

**Reviewer:** CRITIC-A (John/PM, Sally/UX, Mary/BA)
**Target:** architecture.md lines 1–409 (stepsCompleted: [1, 2, 3])
**Date:** 2026-03-14
**Score: 7/10**

---

## Summary

The two sections demonstrate solid coverage: 41 FRs are explicitly mapped to implementation mechanisms, NFRs are concisely summarized by domain, 7 of 12 PRD deferred decisions (D1–D9, D12) are resolved in D22–D29, DB schema is well-structured with proper company_id isolation, and the extension note clearly separates new vs. existing decisions. However, **4 specific gaps** were identified—2 critical (missing storage + missing prerequisite file), 1 significant (timeout boundary risk), and 1 moderate (no audit trail).

---

## John (PM) — Does architecture support all 41 FRs?

**FR Coverage Assessment:**
- FR-CM (6/6), FR-TA (4/4), FR-MCP (6/6), FR-DP (4/4), FR-RM (6/6), FR-CP (9/9), FR-WD (3/3): All mappings present in the requirements overview table.
- FR-SO (7/7): D28 + D29 + E12 + error code table cover SO1–SO7.

**Issue #1 — CRITICAL: FR-SO3 MCP lifecycle telemetry has no defined storage (lines 229–251)**

FR-SO3 requires: `{ company_id, mcp_server_id, event: 'spawn'|'discover'|'teardown'|'error', timestamp, latency_ms }` — MCP lifecycle log.

The architecture defines exactly 5 tables. None of them can store this data:
- `tool_call_events` (lines 233–251): fields are `tool_name`, `started_at`, `completed_at`, `success`, `error_code`, `duration_ms` — no `mcp_server_id`, no `event` type column for 'spawn'/'discover'/'teardown', no lifecycle semantics.
- No 6th table (`mcp_lifecycle_events`) is defined anywhere.

**Direct consequence:** NFR-R3 MCP zombie process monitoring (line 89: "세션 종료 후 30초 초과 생존 프로세스 감지 → Admin 알림") and the MCP zombie process rate = 0 Gate cannot be implemented without a storage mechanism for TEARDOWN events. PRD line 224 explicitly tracks this as a Go/No-Go metric.

**Fix needed:** Add `mcp_lifecycle_events` table OR extend `tool_call_events` with optional `mcp_server_id` + event enum column. Must be explicit in schema section.

**Issue #2 — SIGNIFICANT: FR-CM6 credential audit log has no implementation path (lines 162–175, 334–351)**

FR-CM6 requires: "Credential 등록/수정/삭제 이벤트가 company_id 스코프 감사 로그에 기록될 수 있다."

The `credentials` table schema (lines 164–175) has no `created_by`, `deleted_at`, or audit timestamp fields. The `getDB()` extension methods for credentials (lines 335–351: `insertCredential`, `updateCredential`, `deleteCredential`) perform raw DB operations with no audit trail call. No separate `credential_events` log or routing to `tool_call_events` is mentioned.

**Fix needed:** Either add audit logging call inside getDB() credential write methods, OR add `credential_events` table reference, OR extend the Code Disposition Matrix to list where FR-CM6 is implemented.

---

## Sally (UX) — Will architecture enable good UX?

**Issue #3 — SIGNIFICANT: D26 cold start timeout (30s) is a boundary race condition (lines 120–122, 74)**

PRD line 484 states: "Notion MCP(`npx -y @notionhq/notion-mcp-server`) 첫 실행 시 10–30초(npm 패키지 다운로드). warm start SLA만 보장 (Phase 1)."

D26 resolution (line 122): "lazy spawn, warm start SLA만 보장, cold start timeout **30s**"

If cold start legitimately takes up to 30s and the timeout is exactly 30s, Admin connection test (FR-MCP3) — which is always a cold start for newly configured MCP servers — will fail at the boundary. A 30s timeout for a process that takes 30s to initialize means the slightest network delay, npm registry latency, or ARM64 extraction overhead will cause a false connection test failure. UX implication: Admin박현우 sees a red ✗ on a correctly configured MCP server, loses trust, re-enters the same config.

**Fix needed:** Cold start timeout should be ≥60s (preferably 120s). D26 should distinguish warm start timeout (existing: 3–5s per NFR-P2) from cold start timeout (60–120s). Admin UI should also show a spinner with "첫 실행 중... (최대 60초)" messaging for cold start scenarios.

**Admin connection test flow is otherwise sound:** 3-way handshake in NFR-I2 is well-specified. The warm/cold distinction just needs to be reflected in D26.

---

## Mary (BA) — Cost implications + business scalability?

**Issue #4 — MODERATE: `send_email` missing from Code Disposition Matrix (lines 396–404)**

NFR-I4 (PRD line 1153–1154) states: "`save_report(distribute_to: ['pdf_email'])` 구현 전 `send_email` 도구가 바이너리 첨부파일을 지원하는지 검증 필수 (`attachments: [{filename, content, encoding: 'base64'}]` MIME multipart). 미지원 시 `send_email` 도구 업그레이드가 `save_report` 구현의 선행 조건"

The Code Disposition Matrix (lines 396–404) lists 4 files for modification. `send_email` is not listed. If `send_email` requires an upgrade (which the PRD explicitly flags as a conditional prerequisite), this is an invisible critical-path blocker that will surface mid-implementation and block `save_report` (a Phase 1 Go/No-Go Gate contributor: Journey 2 + Persona Value Delivery Gate).

**Business impact:** `save_report(pdf_email)` is the exact mechanism for CEO 김대표's "수면 중 자동화" scenario — the highest-value Phase 1 use case. Discovering `send_email` needs upgrading after `save_report` is built wastes implementation time and delays the Phase 1 Gate.

**Fix needed:** Add `send_email` to Code Disposition Matrix as "검증 필요 (MODIFY 조건부)" with a note that dependency verification Story must resolve this before `save_report` implementation begins. Also explicitly flag it in the Dependency Verification Checklist (lines 381–393).

---

## PRD Deferred Decisions Coverage

**D1–D9 + D12 all resolved (D22–D29):**
| PRD D# | Resolved as | Assessment |
|--------|------------|-----------|
| D1 | D22: configurable default OFF | ✅ Correct |
| D2 | D23: Phase 1 env var | ✅ Correct |
| D3+D4 | D24: pool 5 + p-queue 30s timeout→reject | ✅ Correct (queue+timeout covers both) |
| D6 | D25: Phase 1 stdio, sse/http fallback error | ✅ Correct |
| D7 | D26: lazy spawn, 30s cold start timeout | ⚠️ Issue #3 above — timeout too short |
| D8 | D29: 4-index strategy (including run_id index) | ✅ Correct — adds 4th index beyond PRD's 3 |
| D9 | D28: session-start credential load, 100% scan | ✅ Correct |
| D12 | D27: google_drive → Phase 4 confirmed | ✅ Correct |

**PRD D5, D10, D11 deferred status noted correctly (line 124).**

---

## DB Schema Assessment

| Table | Isolation | Schema Correctness | Issues |
|-------|----------|-------------------|--------|
| `credentials` | ✅ (company_id, key_name) unique | ✅ AES-GCM encoding noted (base64 iv:tag:ciphertext) | No audit trail for FR-CM6 |
| `mcp_server_configs` | ✅ company_id FK | ✅ transport enum pattern correct | Enum stored as `text` — fine for Drizzle but values not validated at schema level |
| `agent_mcp_access` | ✅ cascade deletes | ✅ composite PK | No company_id FK directly — isolation via JOIN chain only |
| `reports` | ✅ company_id FK + index | ✅ JSONB distributionResults for partial failure contract | ✅ |
| `tool_call_events` | ✅ 4-index strategy | ✅ run_id index for Pipeline Gate SQL | Missing mcp_server_id for FR-SO3 |
| `content_calendar` | ✅ Phase 2 pre-defined | ✅ status workflow matches PRD | Phase 2 only — correctly gated |

**agent_mcp_access company_id isolation note:** The table itself has no company_id column — isolation relies on the JOIN chain (agent → agents.company_id + mcp_server_configs.company_id). The getDB() method `getMcpServersForAgent()` (line 357–360) correctly performs this JOIN. However, the architecture should explicitly note this as a "JOIN-chain isolation" pattern vs. direct FK, since a cross-company agent_id could theoretically query another company's MCP server if the engine doesn't enforce company context. Line 360's comment is good: "보안 체인: agent → agent_mcp_access → mcp_server_configs → company_id 일치 검증" — but no explicit WHERE clause on company_id in the join itself. Minor — likely fine in practice with getDB(companyId) scoping the initial agents query.

---

## Issues Summary

| # | Severity | Area | Issue | Line Ref |
|---|---------|------|-------|---------|
| 1 | CRITICAL | FR-SO3 | MCP lifecycle telemetry has no storage table — zombie monitoring broken | 229–251 |
| 2 | SIGNIFICANT | FR-CM6 | Credential CRUD audit trail absent from schema + getDB() methods | 162–175, 335–351 |
| 3 | SIGNIFICANT | D26 | Cold start timeout 30s = boundary race condition (cold start itself takes up to 30s) | 122 |
| 4 | MODERATE | NFR-I4 | send_email not in Code Disposition Matrix despite being conditional prerequisite for save_report | 396–404 |

**Score: 7/10**

Strengths: FR/NFR coverage tables are exhaustive and specific, table schemas are concrete and correctly isolated, extension note clearly separates new vs. existing, D22–D29 comprehensively resolve D1–D9+D12. Gaps are addressable with targeted additions — no fundamental architecture redesign needed.
