---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
completedAt: '2026-03-14'
project_name: 'CORTHEX Tool Integration'
inputDocuments:
  - _bmad-output/planning-artifacts/tools-integration/architecture.md
  - _bmad-output/planning-artifacts/tools-integration/prd.md
  - _bmad-output/planning-artifacts/tools-integration/product-brief.md
  - _bmad-output/context-snapshots/tools/arch-step06-07-08-snapshot.md
partyModeRounds: 3
---

# CORTHEX Tool Integration — Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for **CORTHEX Tool Integration**, decomposing requirements from PRD (45 FRs × 8 areas — note: PRD header said 41; 4 additional FRs were formalized during architecture phase in FR-DP3~4 and FR-SO3~4 scope expansion), Architecture (D22–D29, E11–E17), and Phase 1 implementation scope into implementable stories for Epics 16–21 (new Epics built on the completed Epic 1–15 foundation).

---

## Requirements Inventory

### Functional Requirements

**FR Area 1: Credential Management (FR-CM)**
- FR-CM1: Admin registers platform API keys as (key_name, value) pairs with company_id isolation
- FR-CM2: Admin views credential list with key names shown and values masked
- FR-CM3: Admin updates or deletes a registered credential
- FR-CM4: `{{credential:key_name}}` patterns in MCP server env JSONB are resolved from credentials table during RESOLVE stage (pre-spawn)
- FR-CM5: Unresolvable `{{credential:key_name}}` patterns return `CREDENTIAL_TEMPLATE_UNRESOLVED: key_name` and abort MCP spawn
- FR-CM6: Credential create/update/delete events are audit-logged (company_id scope, createdByUserId/updatedByUserId inline)

**FR Area 2: Agent Tool Assignment (FR-TA)**
- FR-TA1: Admin enables/disables individual built-in tools per agent (`agents.allowed_tools JSONB`)
- FR-TA2: Admin views and bulk-manages per-agent active tool list as checkboxes (`/admin/agents/{id}/tools`)
- FR-TA3: Agent calling a tool not in `allowed_tools` receives `TOOL_NOT_ALLOWED: tool_name` (engine-level enforcement)
- FR-TA4: Admin configures MCP access defaults by agent Tier (Workers: default OFF per D22)

**FR Area 3: MCP Server Management (FR-MCP)**
- FR-MCP1: Admin registers/updates/deletes MCP server configs (display_name, transport, command, args, env)
- FR-MCP2: Admin grants/revokes per-agent MCP server access (agent-MCP checkbox matrix)
- FR-MCP3: Admin runs connection test against registered MCP server with immediate success/fail status
- FR-MCP4: Agent-loop integrates allowed MCP servers via 8-stage pattern: RESOLVE→SPAWN→INIT→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN
- FR-MCP5: MCP child processes are terminated SIGTERM→SIGKILL on session end
- FR-MCP6: Missing MCP credential returns `AGENT_MCP_CREDENTIAL_MISSING: key_name` in Admin error log (no silent passthrough)

**FR Area 4: Document Processing (FR-DP)**
- FR-DP1: Agent converts markdown to PDF with style presets (corporate/minimal/default) — `md_to_pdf`, Phase 1
  - corporate preset: Pretendard font, `#0f172a` headers, `#3b82f6` accent, A4, page numbers
- FR-DP2: `md_to_pdf` PDF renders Korean text, tables, code blocks, images correctly (fonts-noto-cjk)
- FR-DP3: Agent OCR-processes image/scanned PDF → text/markdown/JSON — `ocr_document`, Claude Vision, Phase 2
- FR-DP4: Agent converts 20+ document formats to markdown — `pdf_to_md`, markitdown-mcp, Phase 2

**FR Area 5: Report Management (FR-RM)**
- FR-RM1: Agent saves markdown report to `reports` DB and distributes to one or more channels — `save_report`, Phase 1
  - Channels: `web_dashboard` (P1), `pdf_email` (P1), `notion` (P2), `google_drive` (P4), `notebooklm` (P2)
  - `pdf_email`: internally chains md_to_pdf(corporate) → send_email(attachment: PDF)
- FR-RM2: `save_report` partial failure contract: successful channels preserved, failed channels listed; DB save never rolled back
- FR-RM3: Agent lists company-scoped reports filtered by date/agent/type/tags — `list_reports`, Phase 1
- FR-RM4: Agent retrieves full report content by ID — `get_report`, Phase 1
- FR-RM5: Admin views company-scoped report list with markdown rendering and PDF download — `/admin/reports`, Phase 1
- FR-RM6: Human-role users view published reports read-only — `/reports`, Phase 1

**FR Area 6: Content Publishing & Media (FR-CP)**
- FR-CP1: Agent publishes markdown as HTML blog post to Tistory and returns post URL — `publish_tistory`, Phase 1
  - Parameters: title, visibility (0/3), category, tags[], scheduled_at
- FR-CP2: Agent uploads file (image/video) to Cloudflare R2 and returns public URL — `upload_media`, Phase 1
- FR-CP3: Agent publishes text tweet / image tweet / thread to X — `publish_x`, Phase 2
- FR-CP4: Agent publishes single image / carousel (≤10) / Reels to Instagram — `publish_instagram` refactor, Phase 2
- FR-CP5: Agent uploads video to YouTube with Shorts support (9:16, ≤60s, #Shorts) — `publish_youtube`, Phase 2
- FR-CP6: Agent generates card news image set (1080×1080px, 5-8 images) — `generate_card_news`, Phase 2
- FR-CP7: Agent generates AI video via Replicate Kling and receives result URL — `generate_video`, Phase 2
- FR-CP8: Agent submits async video composition job and receives job_id for polling — `compose_video`, Remotion, Phase 3
- FR-CP9: Agent CRUDs content calendar entries — `content_calendar`, Phase 2
  - Status workflow: idea → scripted → produced → scheduled → published

**FR Area 7: Web Data Acquisition (FR-WD)**
- FR-WD1: Agent reads single URL web page as clean markdown — `read_web_page`, Jina Reader, Phase 1
  - URL-only input; Jina prefix added internally; no API key required
- FR-WD2: Agent crawls web data in scrape/crawl/map modes — `web_crawl`, Firecrawl, Phase 2
- FR-WD3: Agent runs full-site CSS-selector crawl + change monitoring — `crawl_site`, CLI-Anything+Crawlee, Phase 3 (PoC-conditional)

**FR Area 8: Security & Observability (FR-SO)**
- FR-SO1: PostToolUse Hook scans all tool outputs (built-in + MCP) for registered credential values and removes them (credential-scrubber, 100% coverage)
- FR-SO2: All tool call events logged: `{ company_id, agent_id, run_id, tool_name, started_at, completed_at, success, error_code? }`
  - run_id groups pipeline events for E2E measurement and Pipeline Gate SQL
- FR-SO3: MCP lifecycle events logged: `{ company_id, mcp_server_id, event: spawn|init|discover|execute|teardown|error, latency_ms }`
- FR-SO4: Admin views per-agent/per-tool/per-date tool call history in Audit Log UI — Phase 2
- FR-SO5: External API quota 80% depletion triggers Admin notification (Firecrawl 100K pages/mo, YouTube 10K units/day, X 3K tweets/mo)
- FR-SO6: External API quota 100% depletion auto-disables tool and returns `TOOL_QUOTA_EXHAUSTED: {service_name}` to agent
- FR-SO7: All tool failures return typed error codes with `TOOL_` or `AGENT_` prefix (zero blackbox errors)

---

### Non-Functional Requirements

**NFR Area 1: Performance (NFR-P)**
- NFR-P1: Tool SLAs — `md_to_pdf` p95 <10s (1pg)/<20s (10pg); `read_web_page` p95 <8s; `publish_tistory` p95 <5s; `upload_media` p95 <8s
- NFR-P2: MCP warm start — Notion `tools/list` <3s; Playwright <5s; arbitrary MCP <10s
- NFR-P3: `call_agent` handoff chain E2E <60s (agent-to-agent handoff only; external API latency excluded)
- NFR-P4: Business pipeline E2E — simple (`read_web_page` × 1 + `save_report(pdf_email)`) ≤4min
- NFR-P5: Per-tool 7-day rolling success rate ≥95%; alert at <90% (PagerDuty)

**NFR Area 2: Security (NFR-S)**
- NFR-S1: credentials table values AES-256-GCM encrypted at rest; plaintext only in runtime server memory
- NFR-S2: Raw API key exposure rate = 0% in agent outputs; violation = P0 security incident
- NFR-S3: MCP child process spawned with minimum-privilege env (only required credentials)
- NFR-S4: All new tables company_id-gated; cross-tenant data access structurally impossible via `getDB(ctx.companyId)` pattern
- NFR-S5: `allowed_tools` check enforced at agent-loop.ts engine level; Soul-layer bypass structurally impossible

**NFR Area 3: Reliability (NFR-R)**
- NFR-R1: All tool/MCP failures return typed error codes (TOOL_/AGENT_ prefix); zero untyped exceptions to LLM
- NFR-R2: `save_report` partial failure — DB save is never rolled back; failed channels listed separately; no full retry required
- NFR-R3: MCP zombie processes: 0 active 30s past session end; SIGTERM→5s→SIGKILL on teardown; Admin alert on zombie detection

**NFR Area 4: Scalability (NFR-SC)**
- NFR-SC1: Puppeteer pool ≤5 concurrent (D24, p-queue); 6th request queued 30s then TOOL_RESOURCE_UNAVAILABLE
- NFR-SC2: ARM64 24GB VPS: Chromium ~200MB/instance × 5 = ~1GB (safe ceiling)
- NFR-SC3: tool_call_events — 3 compound indexes + run_id index (D29) for Phase 2 Audit Log and Pipeline Gate SQL

**NFR Area 5: Integration (NFR-I)**
- NFR-I1: MCP transport flexible parsing; unknown fields ignored (protocol version tolerance)
- NFR-I2: Admin connection test validates 3-way handshake: SPAWN→INIT→DISCOVER success
- NFR-I3: send_email supports `attachments: [{filename, content, encoding: 'base64'}]` MIME multipart (prerequisite for pdf_email channel)

---

### Additional Requirements (Architecture-Derived)

**Infrastructure & Setup:**
- CREDENTIAL_ENCRYPTION_KEY env var (32 bytes / 64 hex chars) required at server start; missing = startup failure
- Dockerfile: add `fonts-noto-cjk` APT install + Puppeteer Chromium cache path (`~/.cache/puppeteer`)
- New packages (exact pin, no `^`): `puppeteer@22.x`, `p-queue@8.x`, `@aws-sdk/client-s3@3.x`, `marked@12.x`
- Dependency verification story mandatory before tool handler implementation

**Engine Integration:**
- All MCP integration code lives inside `engine/mcp/` (E8 boundary)
- `agent-loop.ts` manages SessionContext termination → directly calls `mcpManager.teardownAll()` in `finally` block (not in Stop Hook)
- `ctx.runId` injected by agent-loop.ts into SessionContext; tool handlers never generate runId
- D28: credential-scrubber `init(ctx)` called at session start in agent-loop.ts; plaintext credential list released on session end

**DB Patterns:**
- All 6 new tables (credentials, mcp_server_configs, agent_mcp_access, reports, tool_call_events, mcp_lifecycle_events) accessed only via `getDB(ctx.companyId)` extended methods
- `content_calendar` schema pre-defined in Phase 1 codebase but migration deferred to Phase 2
- D29: 4 indexes on tool_call_events must be in Phase 1 Drizzle migration

**Error Code Extensions (D3 base):**
- `TOOL_NOT_ALLOWED: tool_name` — engine-level allowed_tools enforcement
- `TOOL_EXTERNAL_SERVICE_ERROR: service` — external API failure
- `TOOL_QUOTA_EXHAUSTED: service` — API quota 100% depleted
- `TOOL_RESOURCE_UNAVAILABLE: puppeteer` — pool timeout
- `TOOL_CREDENTIAL_INVALID` — built-in tool external API key expired/invalid
- `AGENT_MCP_CREDENTIAL_MISSING: key_name` — MCP spawn credential not registered
- `AGENT_MCP_SPAWN_TIMEOUT` — MCP cold start exceeds 120s
- `CREDENTIAL_TEMPLATE_UNRESOLVED: key_name` — {{credential:*}} pattern not resolved

---

### FR Coverage Map

```
FR-CM1: Epic 16 — credentials DB schema + Admin CRUD API
FR-CM2: Epic 16 — Admin credentials API (masked list) + Epic 19 UI
FR-CM3: Epic 16 — Admin credentials API (update/delete) + Epic 19 UI
FR-CM4: Epic 18 — agent-loop.ts RESOLVE stage (E12 Stage 0)
FR-CM5: Epic 18 — RESOLVE stage CREDENTIAL_TEMPLATE_UNRESOLVED error
FR-CM6: Epic 16 — credentials DB audit fields + getDB() userId params

FR-TA1: Epic 17 — allowed_tools JSONB + Admin tool toggle API
FR-TA2: Epic 19 — Admin agent tools UI (/admin/agents/{id}/tools)
FR-TA3: Epic 17 — agent-loop.ts TOOL_NOT_ALLOWED engine enforcement
FR-TA4: Epic 18 — D22 configurable default OFF in agent_mcp_access

FR-MCP1: Epic 18 — mcp_server_configs schema + Admin MCP API + Epic 19 UI
FR-MCP2: Epic 18 — agent_mcp_access table + Admin MCP access API + Epic 19 UI
FR-MCP3: Epic 18 — Admin connection test route (SPAWN→INIT→DISCOVER 3-way)
FR-MCP4: Epic 18 — mcp-manager.ts 8-stage lifecycle + agent-loop.ts integration
FR-MCP5: Epic 18 — TEARDOWN (SIGTERM→5s→SIGKILL in finally block)
FR-MCP6: Epic 18 — AGENT_MCP_CREDENTIAL_MISSING error + Admin log exposure

FR-DP1: Epic 17 — md-to-pdf.ts handler (E14 pool + CSS presets)
FR-DP2: Epic 17 — Dockerfile fonts-noto-cjk + Korean render test
FR-DP3: Phase 2 (out of Epic 16–21 scope)
FR-DP4: Phase 2 (out of Epic 16–21 scope)

FR-RM1: Epic 20 — save-report.ts (E15 partial failure + channels)
FR-RM2: Epic 20 — E15 Promise.allSettled contract + distributionResults JSONB
FR-RM3: Epic 20 — list-reports.ts handler
FR-RM4: Epic 20 — get-report.ts handler
FR-RM5: Epic 19 — Admin reports UI (/admin/reports)
FR-RM6: Epic 19 — Human reports UI (/reports)

FR-CP1: Epic 17 — publish-tistory.ts (marked + Tistory Open API)
FR-CP2: Epic 17 — upload-media.ts (@aws-sdk/client-s3 + R2)
FR-CP3: Phase 2 (out of scope)
FR-CP4: Phase 2 (out of scope)
FR-CP5: Phase 2 (out of scope)
FR-CP6: Phase 2 (out of scope)
FR-CP7: Phase 2 (out of scope)
FR-CP8: Phase 3 (out of scope)
FR-CP9: Phase 2 (out of scope)

FR-WD1: Epic 17 — read-web-page.ts (Jina Reader r.jina.ai/{url})
FR-WD2: Phase 2 (out of scope)
FR-WD3: Phase 3 (out of scope)

FR-SO1: Epic 16 (D28 scrubber extension) + Epic 21 (100% coverage audit)
FR-SO2: Epic 17 — tool_call_events DB + E17 telemetry pattern
FR-SO3: Epic 18 — mcp_lifecycle_events DB + mcp-manager.ts lifecycle logging
FR-SO4: Phase 2 (Audit Log UI — out of scope)
FR-SO5: Phase 2 (quota monitoring — out of scope)
FR-SO6: Phase 2 (auto-disable — out of scope)
FR-SO7: Epic 17 (E16 typed error pattern) + Epic 21 (audit)
```

---

## Epic List

### Epic 16: Credential Management Infrastructure
Establishes AES-256 encrypted credential storage, API, and credential-scrubber extension as the secure foundation that every external service integration in Phase 1 depends on.
**FRs covered:** FR-CM1, FR-CM2, FR-CM3, FR-CM6, FR-SO1 (D28 scrubber extension)
**Architecture:** D23, D28, E11

### Epic 17: Built-in Tool Handlers
Implements all 7 Phase 1 built-in tool handlers and the tool permission infrastructure (allowed_tools enforcement + telemetry) that deliver direct user value.
**FRs covered:** FR-DP1, FR-DP2, FR-CP1, FR-CP2, FR-WD1, FR-TA1, FR-TA3, FR-SO2, FR-SO7
**Architecture:** D24, D29, E13, E14, E16, E17

### Epic 18: MCP Server Infrastructure
Implements the complete MCP engine (8-stage lifecycle + transport layer) and Admin API that allows any MCP server to be integrated without code changes.
**FRs covered:** FR-CM4, FR-CM5, FR-MCP1~6, FR-TA4, FR-SO3
**Architecture:** D22, D25, D26, E12

### Epic 19: Admin UI — Credential, Tool, MCP, Reports
Builds all 5 Admin UI pages and 1 Human UI page that give non-developer Admins full control over the tool integration.
**FRs covered:** FR-CM1~3 (UI), FR-TA1~2 (UI), FR-MCP1~3 (UI), FR-RM5~6
**Architecture:** All Admin routes (credentials.ts, mcp-servers.ts, agent-tools.ts, reports.ts)

### Epic 20: Report & Distribution System
Implements the reports DB, save_report/list_reports/get_report tool handlers, and the multi-channel distribution logic including the pdf_email channel chain.
**FRs covered:** FR-RM1~4
**Architecture:** D27, E15

### Epic 21: Integration Testing & Security Audit
Validates Phase 1 Go/No-Go Gates: credential-scrubber 100% coverage, multi-tenant isolation, pipeline E2E telemetry, and all 6 business-level gates.
**FRs covered:** FR-SO1 (coverage audit), FR-SO7 (zero blackbox errors), NFR-S1~5, NFR-P5, NFR-R1~3

---

## Epic 16: Credential Management Infrastructure

Admins can securely register, manage, and audit API keys for external services. The credential infrastructure (AES-256 encryption + scrubber D28 extension) is in place so all Phase 1 external tool calls can safely retrieve and protect API key values.

### Story 16.1: Dependency Verification & Dockerfile Setup

As a **Technical Admin (박현우)**,
I want all Phase 1 new packages (puppeteer, p-queue, aws-sdk, marked) to be verified working on ARM64, and the Dockerfile to have Korean font and Puppeteer cache support,
So that subsequent tool stories can rely on these dependencies without compatibility surprises.

**Acceptance Criteria:**

**Given** a fresh ARM64 Bun environment
**When** `bun add puppeteer@22.x p-queue@8.x @aws-sdk/client-s3@3.x marked@12.x` runs
**Then** all packages install without ARM64-specific errors
**And** `bun --eval "import puppeteer from 'puppeteer'; const b = await puppeteer.launch({ headless: 'new' }); await b.close(); console.log('OK')"` outputs `OK`

**Given** the Dockerfile
**When** `fonts-noto-cjk` is added to the APT install layer and `~/.cache/puppeteer` is added to COPY/cache layers
**Then** `docker build` completes without errors
**And** a Korean-character PDF rendered by md_to_pdf shows no tofu/broken glyphs

**Given** `p-queue@8.x` ESM import
**When** `import PQueue from 'p-queue'` is executed in Bun
**Then** the import succeeds (fallback: if ESM fails, switch to `async-sema` and document in PR)

**Given** MCP stdio PoC: `child_process.spawn('npx', ['-y', '@notionhq/notion-mcp-server'], { env: {...process.env, OPENAPI_MCP_HEADERS: '{}' } })`
**When** the process starts and a JSON-RPC `{ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '1.0' } } }` is sent to stdin
**Then** stdout contains `{ jsonrpc: '2.0', id: 1, result: { protocolVersion: '2024-11-05', ... } }` (3-way handshake Stage 1 response)
**And** `tools/list` returns at least 1 Notion MCP tool (PoC confirms MCP Pattern feasibility for Epic 18)

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** none
- **Architecture:** D24 (Puppeteer), D25 (MCP PoC), D26 (cold start validation)
- **FRs:** FR-DP2 (Dockerfile), prerequisite for all Phase 1 tools

---

### Story 16.2: Credentials DB Schema & Migration

As a **Platform Engineer**,
I want the `credentials` table created with AES-256 ciphertext storage, compound unique index, and audit fields,
So that Admin API routes and the RESOLVE stage have a properly structured, isolated DB for API key storage.

**Acceptance Criteria:**

**Given** Drizzle schema at `packages/server/src/db/schema/credentials.ts`
**When** `drizzle-kit generate && drizzle-kit migrate` runs
**Then** the `credentials` table is created with columns: `id` (uuid PK), `company_id` (text, FK companies.id), `key_name` (text), `encrypted_value` (text), `created_by_user_id` (text nullable), `updated_by_user_id` (text nullable), `created_at` (timestamp), `updated_at` (timestamp)
**And** a UNIQUE constraint exists on `(company_id, key_name)` — duplicate key names per company are rejected at DB level
**And** `company_id` is a non-nullable FK to `companies.id`

**Given** two companies (companyA, companyB) each inserting a credential with `key_name = 'tistory_access_token'`
**When** both INSERT statements execute
**Then** both succeed (different company_id makes the unique constraint non-conflicting)

**Given** companyA tries to insert a second credential with the same `key_name` under the same `company_id`
**When** the INSERT executes
**Then** a unique constraint violation error is returned

- **Phase:** 1
- **Complexity:** S
- **blockedBy:** none
- **Architecture:** D23 (encrypted_value storage format), NFR-S4 (company_id isolation)
- **FRs:** FR-CM1, FR-CM6 (audit fields)

---

### Story 16.3: AES-256-GCM Credential Crypto Library

As a **Platform Engineer**,
I want `credential-crypto.ts` to provide encrypt/decrypt using AES-256-GCM with the `CREDENTIAL_ENCRYPTION_KEY` env var,
So that credentials are stored in ciphertext and the encryption format is consistent for all callers.

**Acceptance Criteria:**

**Given** `CREDENTIAL_ENCRYPTION_KEY` is set to a valid 64-char hex string (32 bytes)
**When** `encrypt('my-api-key-value')` is called
**Then** it returns a string in the format `base64(iv):base64(ciphertext+authTag)` (colon-separated, both parts non-empty)
**And** the returned string does NOT contain the original plaintext

**Given** the ciphertext string returned by `encrypt()`
**When** `decrypt(ciphertextString)` is called
**Then** it returns the exact original plaintext `'my-api-key-value'`

**Given** `CREDENTIAL_ENCRYPTION_KEY` is NOT set (undefined or wrong length)
**When** the `credential-crypto.ts` module is imported
**Then** it throws `Error('CREDENTIAL_ENCRYPTION_KEY must be 32 bytes (64 hex chars)')` at import time
**And** the server startup fails with a clear error message (not a silent undefined reference)

**Given** a ciphertext string that has been tampered (one byte changed)
**When** `decrypt(tamperedString)` is called
**Then** it throws a `DOMException` (AES-GCM authentication tag mismatch — Web Crypto integrity guarantee)

**Given** the same plaintext encrypted twice
**When** both ciphertexts are compared
**Then** they differ (random IV ensures ciphertext is non-deterministic — prevents frequency analysis)

- **Phase:** 1
- **Complexity:** S
- **blockedBy:** 16.1 (Bun crypto.subtle verification)
- **Architecture:** D23 (AES-256-GCM, env var key), E11 (credential encryption pattern)
- **FRs:** FR-CM1 (encrypted storage), NFR-S1 (AES-256 at rest)

---

### Story 16.4: getDB() Credential CRUD Methods

As a **Platform Engineer**,
I want `scoped-query.ts` extended with credential CRUD methods (listCredentials, listCredentialsForScrubber, getCredential, insertCredential, updateCredential, deleteCredential),
So that Admin routes and the credential-scrubber have type-safe, company_id-isolated DB access.

**Acceptance Criteria:**

**Given** `getDB(companyId).listCredentials()` is called
**When** the query executes
**Then** it returns `[{ id, keyName, updatedAt }]` — `encryptedValue` is intentionally excluded from this result set
**And** only rows matching `company_id = companyId` are returned

**Given** `getDB(companyId).listCredentialsForScrubber()` is called
**When** the query executes
**Then** it returns `[{ keyName: string, plaintext: string }]` — `encryptedValue` decrypted via `credential-crypto.decrypt()`
**And** only rows matching `company_id = companyId` are returned

**Given** `getDB(companyId).insertCredential({ keyName: 'tistory_access_token', encryptedValue: '...' }, userId)` is called
**When** the INSERT executes
**Then** `created_by_user_id` and `updated_by_user_id` are set to the provided `userId`
**And** the new row's `company_id` is set to the scoped `companyId` (not a parameter — automatically enforced)

**Given** `getDB(companyA).getCredential('tistory_token')` and companyB has a credential with the same key_name
**When** both queries execute
**Then** each query returns only its own company's credential (cross-company isolation enforced by WHERE clause)

**Given** `getDB(companyId).updateCredential('tistory_token', newEncryptedValue, userId)` is called
**When** the UPDATE executes
**Then** `updated_by_user_id` is set to `userId`, `updated_at` is refreshed
**And** only the row matching `(company_id, key_name)` is updated

- **Phase:** 1
- **Complexity:** S
- **blockedBy:** 16.2 (credentials table), 16.3 (decrypt in listCredentialsForScrubber)
- **Architecture:** E3 extension, D23, D28 (listCredentialsForScrubber for scrubber)
- **FRs:** FR-CM1, FR-CM2, FR-CM3, FR-CM6

---

### Story 16.5: Admin Credentials CRUD API Routes

As a **Technical Admin (박현우)**,
I want `POST/GET/PUT/DELETE /admin/credentials` routes that handle encrypted credential storage and masked display,
So that Admin can register API keys without the application ever storing plaintext.

**Acceptance Criteria:**

**Given** `POST /admin/credentials` with body `{ keyName: 'tistory_access_token', value: 'actual-oauth-token-xyz' }`
**When** the route handler executes
**Then** it calls `encrypt(value)` and stores `encryptedValue` in DB (plaintext `value` never written to DB)
**And** returns `{ success: true, data: { id, keyName, updatedAt } }` (no encryptedValue in response)
**And** `created_by_user_id` is set from `ctx.userId`

**Given** `GET /admin/credentials`
**When** the route executes
**Then** returns `{ success: true, data: [{ id, keyName, updatedAt }] }` (encryptedValue NOT in response)
**And** only credentials belonging to the Admin's `companyId` are returned

**Given** `PUT /admin/credentials/:keyName` with body `{ value: 'new-token' }`
**When** the route executes
**Then** the existing credential's `encryptedValue` is updated with `encrypt(newValue)`
**And** `updated_by_user_id` is updated from `ctx.userId`
**And** returns `{ success: true, data: { keyName, updatedAt } }`

**Given** `DELETE /admin/credentials/:keyName`
**When** the route executes
**Then** **before** deleting, the route logs a delete audit entry to the server's structured logger (not tool_call_events — that table doesn't exist until Story 17.1b): `{ event: 'credential_deleted', keyName, companyId, userId, timestamp }` at INFO level
**And** then the credential row is deleted from DB
**And** returns `{ success: true }`

*(Note: Architecture D3 extension mentions `error_code='CREDENTIAL_DELETED'` in tool_call_events for delete audits, but tool_call_events is created in Story 17.1b. This story uses server-logger for the audit record; the tool_call_events pattern can be retrofitted when 17.1b completes.)*

**Given** `POST /admin/credentials` with a `keyName` that already exists for this company
**When** the route executes
**Then** returns `{ success: false, error: { code: 'CREDENTIAL_DUPLICATE_KEY', message: 'Key name already exists' } }` (HTTP 409)

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 16.3 (encrypt), 16.4 (getDB() methods)
- **Architecture:** E11 (only credential-crypto for encrypt/decrypt), NFR-S4 (company isolation)
- **FRs:** FR-CM1, FR-CM2, FR-CM3, FR-CM6

---

### Story 16.6: Credential-Scrubber D28 Extension

As a **Platform Engineer**,
I want `credential-scrubber.ts` extended with a session-start `init(ctx)` method that loads all company credentials as plaintext for scanning, covering both built-in and MCP tool outputs,
So that no registered API key value ever appears in agent outputs (100% coverage, NFR-S2).

**Acceptance Criteria:**

**Given** `credential-scrubber.ts` has a new `init(ctx: SessionContext)` method
**When** `agent-loop.ts` calls `scrubber.init(ctx)` at session start
**Then** it calls `getDB(ctx.companyId).listCredentialsForScrubber()` and stores plaintext credential values in memory for this session
**And** the init completes before the first tool call is processed

**Given** a session where the credential `tistory_access_token = 'secret-oauth-abc123'` is registered
**When** a tool (built-in or MCP) returns output containing `'secret-oauth-abc123'`
**Then** the PostToolUse Hook scrubs the value to `[REDACTED]` in the tool result
**And** the scrubbing event is logged with tool name + timestamp (no credential value in log)

**Given** a session ends (agent-loop.ts finally block)
**When** session teardown occurs
**Then** the in-memory plaintext credential list for this session is set to `null` (memory released)

**Given** a company with 0 registered credentials
**When** `scrubber.init(ctx)` is called
**Then** it completes without error (empty list is valid) — no scrubbing needed, tool outputs pass through

**Given** `listCredentialsForScrubber()` call at session start
**When** a MCP tool output echoes a credential value
**Then** the PostToolUse Hook catches and scrubs it — MCP output is NOT exempt from scrubbing

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 16.4 (listCredentialsForScrubber), 16.5 (credentials stored in DB)
- **Architecture:** D28 (session-start load), D4 (Hook pipeline extension), E11 (decrypt path)
- **FRs:** FR-SO1 (PostToolUse 100% coverage), NFR-S2 (zero API key exposure)

---

## Epic 17: Built-in Tool Handlers

Agents can call 7 new Phase 1 built-in tools (read_web_page, md_to_pdf, publish_tistory, upload_media, and 3 report tools built in Epic 20), with engine-level permission enforcement and full telemetry. Tool diversity index and pipeline completion gates are supported from this epic forward.

### Story 17.1a: Tool Types, Engine Enforcement & callExternalApi Utility

As a **Platform Engineer**,
I want `BuiltinToolHandler` TypeScript interface, `TOOL_NOT_ALLOWED` engine enforcement, `ctx.runId` injected by agent-loop, and the `callExternalApi` E16 utility created,
So that all subsequent tool handler stories have a consistent interface, permission gating, and typed error wrapping foundation.

**Acceptance Criteria:**

**Given** `engine/types.ts` extended with `BuiltinToolHandler`, `ToolCallContext`, and `SessionContext` (with `runId: string` field)
**When** a new tool handler imports `BuiltinToolHandler`
**Then** TypeScript compilation passes for a handler implementing `{ name: string; schema: ZodObject; execute: (input, ctx: ToolCallContext) => Promise<string> }`

**Given** `packages/server/src/lib/call-external-api.ts` is created with:
```typescript
export async function callExternalApi<T>(serviceName: string, fn: () => Promise<T>): Promise<T>
```
**When** the wrapped `fn()` throws an error with a `.status` property
**Then** HTTP 401/403 → `ToolError('TOOL_CREDENTIAL_INVALID', '${serviceName}: auth failed (${status}). Check API credential in Admin settings.')`
**And** HTTP 429 → `ToolError('TOOL_QUOTA_EXHAUSTED', '${serviceName}: rate limit exceeded')`
**And** HTTP 5xx → `ToolError('TOOL_EXTERNAL_SERVICE_ERROR', '${serviceName}: server error (${status})')`
**And** network/unknown error → `ToolError('TOOL_EXTERNAL_SERVICE_ERROR', '${serviceName}: ${err.message}')`
**And** `npx tsc --noEmit` passes with the new file

**Given** `agent-loop.ts` engine with `ctx.agent.allowed_tools` JSONB check added before dispatching to a built-in handler
**When** an agent calls `read_web_page` but `allowed_tools` does NOT include `'read_web_page'`
**Then** the engine returns `{ type: 'tool_result', content: 'TOOL_NOT_ALLOWED: read_web_page' }` to the LLM
**And** the tool handler code is NOT invoked

**Given** an agent's `allowed_tools` JSONB is null or empty
**When** any built-in tool is called
**Then** all tool calls return `TOOL_NOT_ALLOWED` (null allowed_tools = no tools permitted)

**Given** `ctx.runId` is auto-generated by `agent-loop.ts` as a UUID v4 at session start
**When** the handler receives `ctx`
**Then** `ctx.runId` is a non-null string (handlers never generate runId — they only read it from ctx)

**Given** `grep -r 'new Error(' src/tool-handlers/` runs after all tool handlers are implemented
**When** the grep executes
**Then** zero results — only `ToolError` is used in tool handlers (E13 enforcement)

- **Phase:** 1
- **Complexity:** S
- **blockedBy:** none
- **Architecture:** E13 (BuiltinToolHandler interface), E16 (callExternalApi utility), NFR-S5 (TOOL_NOT_ALLOWED enforcement)
- **FRs:** FR-TA3 (engine enforcement), FR-SO7 (typed errors via callExternalApi)

---

### Story 17.1b: Telemetry DB — tool_call_events + D29 Indexes + getDB() Methods + allowed_tools JSONB

As a **Platform Engineer**,
I want `tool_call_events` table with D29 indexes, `agents.allowed_tools JSONB` field, and all getDB() telemetry methods added,
So that tool handlers can record telemetry (E17) and the allowed_tools Admin toggle has DB backing.

**Acceptance Criteria:**

**Given** `packages/server/src/db/schema/tool-call-events.ts` with D29 index spec (3 compound + run_id)
**When** `drizzle-kit generate && drizzle-kit migrate` runs
**Then** `tool_call_events` table is created with all columns and exactly 4 indexes:
  - `tce_company_date`: `(company_id, started_at DESC)`
  - `tce_company_agent_date`: `(company_id, agent_id, started_at DESC)`
  - `tce_company_tool_date`: `(company_id, tool_name, started_at DESC)`
  - `tce_run_id`: `(run_id)`

**Given** `agents` table currently lacks `allowed_tools` column
**When** Drizzle migration runs (separate from tool_call_events migration, can run in same migration file)
**Then** `agents.allowed_tools` column is added as `JSONB DEFAULT '[]'` (empty array = no tools permitted)
**And** existing agents are unaffected (column defaults to empty array, not null)

**Given** `getDB(companyId)` extended with `insertToolCallEvent()` and `updateToolCallEvent(eventId, update)` methods
**When** a tool handler uses the E17 pattern (INSERT before logic, UPDATE in try/finally)
**Then** both calls succeed with proper typing
**And** failed tool calls (caught in catch block) have `success: false` and `error_code` recorded

**Given** `ctx.runId` is set by agent-loop.ts (Story 17.1a)
**When** multiple tool calls occur in the same agent session
**Then** all `tool_call_events` rows from that session share the same `run_id`
**And** the Pipeline Gate SQL (`SELECT ... WHERE run_id = $1 GROUP BY run_id HAVING COUNT(*) >= 2`) correctly counts them

**Given** `EXPLAIN ANALYZE` runs the Pipeline Gate SQL with `run_id = $1`
**When** the query plan is examined
**Then** "Index Scan using tce_run_id" appears (D29 run_id index used, no full-table scan)

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 17.1a (types must exist for getDB() methods to type-check)
- **Architecture:** D29 (4 indexes in Phase 1 migration), E17 (telemetry methods), FR-TA1 (allowed_tools JSONB)
- **FRs:** FR-TA1 (allowed_tools schema), FR-SO2 (tool_call_events telemetry)

---

### Story 17.2: Puppeteer Pool + md_to_pdf Tool Handler

As a **CEO 김대표 (Solo Operator)**,
I want agents to convert markdown content to a professionally formatted A4 PDF (corporate/minimal/default style presets) with Korean text support,
So that `save_report(pdf_email)` can attach a branded PDF to email distributions.

**Acceptance Criteria:**

**Given** `puppeteer-pool.ts` initializes with `p-queue maxConcurrency: 5` at server start via `initPuppeteerPool(5)`
**When** `withPuppeteer(async (browser) => { ... })` is called
**Then** the browser instance is acquired from the pool and released in the `finally` block even if the callback throws

**Given** 6 concurrent `md_to_pdf` calls when the pool already has 5 active
**When** the 6th request arrives
**Then** it is queued; after 30s with no pool slot available, it throws `ToolError('TOOL_RESOURCE_UNAVAILABLE', 'puppeteer_pool_timeout')`
**And** a `tool_call_events` row is recorded with `success: false, error_code: 'TOOL_RESOURCE_UNAVAILABLE'`

**Given** `md_to_pdf({ content: '# 안녕하세요\n\nTest table\n|A|B|\n|---|---|\n|1|2|', style: 'corporate' })`
**When** the handler executes
**Then** it returns a base64-encoded PDF string
**And** the PDF has A4 dimensions (210mm × 297mm)
**And** the header uses `#0f172a` background color and Pretendard font
**And** Korean characters render correctly (no tofu/squares — fonts-noto-cjk)

**Given** `md_to_pdf({ content: '...(1-page markdown)...', style: 'minimal' })`
**When** the handler executes
**Then** it returns a base64-encoded PDF with minimal styling (white bg, system font)
**And** p95 latency for 1-page PDF < 10s (NFR-P1)

**Given** the `md_to_pdf` handler follows E17 telemetry pattern
**When** it executes
**Then** `tool_call_events` has an INSERT before rendering starts and an UPDATE with `durationMs` after completion

**Given** Puppeteer is directly launched via `puppeteer.launch()` bypassing the pool
**When** a code review grep runs `grep -r 'puppeteer.launch(' src/`
**Then** zero results are returned outside `puppeteer-pool.ts` (E14 enforcement)

- **Phase:** 1
- **Complexity:** L
- **blockedBy:** 17.1a (BuiltinToolHandler + engine enforcement), 17.1b (tool_call_events + E17 methods), 16.1 (Dockerfile + dependency verification)
- **Architecture:** D24 (p-queue pool), E14 (withPuppeteer wrapper), E13 (BuiltinToolHandler), E17 (telemetry)
- **FRs:** FR-DP1 (md_to_pdf + CSS presets), FR-DP2 (Korean font support), NFR-P1 (10s/20s SLA), NFR-SC1 (pool limit)

---

### Story 17.3: read_web_page Tool Handler (Jina Reader)

As a **최민준 (Intelligence Consumer)**,
I want agents to read any web page's content as clean markdown using Jina Reader without needing an API key,
So that research pipelines can fetch real-time competitor data and feed it into report generation.

**Acceptance Criteria:**

**Given** `read_web_page({ url: 'https://www.anthropic.com' })`
**When** the handler executes
**Then** it fetches `https://r.jina.ai/https://www.anthropic.com` (Jina prefix added internally — user provides bare URL)
**And** returns the page content as clean markdown text (stripped of navigation/ads by Jina)
**And** p95 latency < 8s (NFR-P1)

**Given** the input is NOT a valid URL (e.g., `url: 'not-a-url'`)
**When** Zod schema validation runs in the engine
**Then** a validation error is returned before the handler executes (Zod `.url()` validation)

**Given** Jina Reader returns HTTP 429 (rate limit)
**When** `callExternalApi('Jina Reader', ...)` catches the error
**Then** `ToolError('TOOL_QUOTA_EXHAUSTED', 'Jina Reader: rate limit exceeded')` is thrown
**And** `tool_call_events` records `success: false, error_code: 'TOOL_QUOTA_EXHAUSTED'`

**Given** Jina Reader returns HTTP 500 or times out
**When** `callExternalApi` catches the error
**Then** `ToolError('TOOL_EXTERNAL_SERVICE_ERROR', 'Jina Reader: server error (500)')` is thrown
**And** the error message does NOT contain any credential values

**Given** the E16 `callExternalApi` wrapper is required for all external API calls
**When** `grep -r 'fetch(' src/tool-handlers/builtins/read-web-page.ts` runs
**Then** all `fetch()` calls are wrapped inside `callExternalApi('Jina Reader', () => fetch(...))`

- **Phase:** 1
- **Complexity:** S
- **blockedBy:** 17.1a (BuiltinToolHandler + callExternalApi), 17.1b (tool_call_events + E17 methods)
- **Architecture:** E13 (BuiltinToolHandler), E16 (callExternalApi adapter), E17 (telemetry)
- **FRs:** FR-WD1 (Jina Reader with auto-prefix), FR-SO7 (typed errors), NFR-P1 (8s SLA)

---

### Story 17.4: publish_tistory Tool Handler

As a **김지은 (AI Org Operator)**,
I want agents to publish markdown content as a live Tistory blog post using the registered `tistory_access_token` credential, returning the published post URL,
So that the agent team can complete the publish step without manual copy-paste.

**Acceptance Criteria:**

**Given** `publish_tistory({ title: '2026 AI 트렌드', content: '## 소개\n본문 내용...', visibility: 3, tags: ['AI', '트렌드'] })`
**When** the handler executes with a valid `tistory_access_token` credential registered
**Then** it calls `marked.parse(content)` to convert markdown to HTML
**And** sends `POST https://www.tistory.com/apis/post/write` with OAuth token + HTML content
**And** returns a string containing the published post URL (e.g., `https://myblog.tistory.com/123`)
**And** p95 latency < 5s (NFR-P1)

**Given** the Tistory API returns HTTP 401 (token expired)
**When** `callExternalApi('Tistory API', ...)` catches the error
**Then** `ToolError('TOOL_CREDENTIAL_INVALID', 'Tistory API: auth failed (401). Check API credential in Admin settings.')` is thrown
**And** the error message does NOT include the actual token value

**Given** the Tistory API returns HTTP 429 (rate limit)
**When** the error is caught
**Then** `ToolError('TOOL_QUOTA_EXHAUSTED', 'Tistory API: rate limit exceeded')` is thrown

**Given** `visibility: 0` (private post) parameter
**When** the handler sends the API request
**Then** the Tistory API receives `visibility=0` in the request payload (not hardcoded to public)

**Given** E16 typed error pattern is required
**When** `grep -r 'new Error(' src/tool-handlers/builtins/publish-tistory.ts` runs
**Then** zero results (only `ToolError` is used, never generic `Error`)

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 17.1a (BuiltinToolHandler + callExternalApi), 17.1b (tool_call_events + E17 methods), 16.5 (tistory_access_token in DB)
- **Architecture:** E13, E16 (callExternalApi + TOOL_CREDENTIAL_INVALID), E17 (telemetry)
- **FRs:** FR-CP1 (Tistory publish + URL return), FR-SO7 (typed errors), NFR-P1 (5s SLA)

---

### Story 17.5: upload_media Tool Handler (Cloudflare R2)

As a **김지은 (AI Org Operator)**,
I want agents to upload image/video files to Cloudflare R2 and receive a public CDN URL,
So that Tistory posts can include images and Phase 2 Instagram/YouTube publishing has media infrastructure.

**Acceptance Criteria:**

**Given** `upload_media({ filename: 'banner.jpg', content: '<base64-encoded-jpeg>', contentType: 'image/jpeg' })` with valid R2 credentials registered (`r2_account_id`, `r2_access_key_id`, `r2_secret_access_key`)
**When** the handler executes
**Then** it uses `@aws-sdk/client-s3` `PutObjectCommand` to upload to R2
**And** the S3 endpoint is set to `https://{r2_account_id}.r2.cloudflarestorage.com` (Cloudflare R2 S3 endpoint)
**And** returns a string containing the public CDN URL of the uploaded file
**And** p95 latency < 8s (NFR-P1)

**Given** R2 credentials are not registered (missing `r2_account_id` etc.)
**When** the RESOLVE step or credential lookup fails
**Then** `ToolError('TOOL_CREDENTIAL_INVALID', 'R2: auth failed')` is returned

**Given** the R2 upload returns a 403 error (bucket permissions issue)
**When** `callExternalApi('Cloudflare R2', ...)` catches the error
**Then** `ToolError('TOOL_CREDENTIAL_INVALID', 'Cloudflare R2: auth failed (403). Check R2 credentials in Admin settings.')` is thrown

**Given** file content is too large (>100MB)
**When** schema validation runs
**Then** a validation error is returned before the upload attempt (Zod max size constraint)

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 17.1a (BuiltinToolHandler + callExternalApi), 17.1b (tool_call_events + E17 methods), 16.5 (R2 credentials in DB), 16.1 (aws-sdk dependency verified)
- **Architecture:** E13, E16 (callExternalApi), E17 (telemetry)
- **FRs:** FR-CP2 (R2 upload + public URL), NFR-P1 (8s SLA)

---

## Epic 18: MCP Server Infrastructure

Admins can register any MCP server without code changes, assign it to agents, run a connection test, and the agent-loop correctly RESOLVE→SPAWN→INIT→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWNs MCP servers during agent sessions. Zombie process prevention is enforced.

### Story 18.1: MCP DB Schema — mcp_server_configs, agent_mcp_access, mcp_lifecycle_events

As a **Platform Engineer**,
I want the 3 MCP-related DB tables created with Drizzle migrations and getDB() methods added,
So that the MCP engine and Admin routes have properly structured, company_id-isolated storage.

**Acceptance Criteria:**

**Given** Drizzle schemas for `mcp_server_configs`, `agent_mcp_access`, and `mcp_lifecycle_events`
**When** `drizzle-kit generate && drizzle-kit migrate` runs
**Then** all 3 tables are created with the columns specified in the Architecture doc
**And** `mcp_server_configs.company_id` has FK to `companies.id`
**And** `agent_mcp_access` has composite PK `(agent_id, mcp_server_id)` and cascade delete on both FKs
**And** `mcp_lifecycle_events` has indexes: `mle_company_mcp` on `(company_id, mcp_server_id, created_at)` and `mle_session` on `(session_id)`

**Given** companyA has an agent and a mcp_server_config
**When** companyB's agent (different company) tries to insert into `agent_mcp_access` referencing companyA's `mcp_server_id`
**Then** the FK constraint chain prevents this (companyB agent_id → agents.company_id check ensures cross-tenant insert fails structurally)

**Given** `getDB(companyId).listMcpServers()` is called
**When** the query executes
**Then** returns only `mcp_server_configs` rows where `company_id = companyId` AND `is_active = true`

**Given** `getDB(companyId).getMcpServersForAgent(agentId)` is called
**When** the query executes
**Then** it JOINS `agent_mcp_access` with `mcp_server_configs` WHERE `mcp_server_configs.company_id = companyId`
**And** returns empty array for an agent with no granted MCP access (D22: default OFF)

**Given** `getDB(companyId).insertMcpLifecycleEvent({ sessionId, mcpServerId, event: 'spawn', latencyMs: 2500 })`
**When** the INSERT executes
**Then** the row is saved with `company_id` automatically set to `companyId`

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 16.1 (dependency verification)
- **Architecture:** D22 (default OFF in agent_mcp_access), D25 (transport field), NFR-R3 (mcp_lifecycle indexes)
- **FRs:** FR-MCP1, FR-MCP2, FR-SO3

---

### Story 18.2: MCP Transport Interface & stdio Implementation

As a **Platform Engineer**,
I want `mcp-transport.ts` defining the `McpTransport` interface and `transports/stdio.ts` implementing stdio transport with JSON-RPC,
So that the MCP manager has a clean abstraction layer and stdio (Phase 1) works for all standard MCP servers.

**Acceptance Criteria:**

**Given** `engine/mcp/mcp-transport.ts` defines `McpTransport` interface with `send(request): Promise<response>`, `close(): Promise<void>`, and `readonly sessionId: string`
**When** `createMcpTransport(config, spawnFn)` is called with `config.transport = 'stdio'`
**Then** it returns a `StdioTransport` instance implementing `McpTransport`

**Given** `createMcpTransport(config, spawnFn)` is called with `config.transport = 'sse'`
**When** the factory function runs
**Then** it throws `ToolError('TOOL_MCP_TRANSPORT_UNSUPPORTED', "MCP transport 'sse' is not supported in Phase 1. Use 'stdio'.")`

**Given** `StdioTransport.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {...} })`
**When** the JSON-RPC message is sent via stdin pipe
**Then** the process stdout is parsed and `{ jsonrpc: '2.0', id: 1, result: { protocolVersion: '2024-11-05', ... } }` is returned
**And** the 3-way handshake completes: `initialize` req → `initialize` resp → `initialized` notification sent

**Given** `SpawnFn` type is `(cmd: string, args: string[], env: Record<string, string>) => ChildProcess`
**When** `StdioTransport` is instantiated with a mock `spawnFn` in bun:test
**Then** the test can inject a fake process without needing a real `npx` command (TEA testability)

**Given** a JSONRPC response with unknown extra fields
**When** the response is parsed
**Then** unknown fields are ignored (flexible parsing — NFR-I1 MCP version tolerance)

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 18.1 (mcp tables/sessions), 16.1 (MCP PoC verification)
- **Architecture:** D25 (stdio Phase 1 only, sse/http → UNSUPPORTED), E12 (transport abstraction)
- **FRs:** FR-MCP4 (SPAWN/INIT stages), NFR-I1 (flexible parsing)

---

### Story 18.3: mcp-manager.ts — RESOLVE→SPAWN→INIT→DISCOVER (Stages 1–4)

As a **Platform Engineer**,
I want `mcp-manager.ts` to handle credential resolution, lazy spawn, 3-way handshake, and tool discovery for MCP servers,
So that agent-loop can discover available MCP tools before merging them into the messages.create() tools array.

**Acceptance Criteria:**

**Given** `mcpManager.getOrSpawnSession(agentId, mcpServerId, companyId)` is called for the first time (lazy spawn)
**When** the env template contains `{ NOTION_TOKEN: '{{credential:notion_integration_token}}' }`
**Then** it calls `getDB(companyId).getCredential('notion_integration_token')` and resolves the actual token value (RESOLVE stage — E12 Stage 0)
**And** the resolved env is passed to `spawnFn` (SPAWN stage — E12 Stage 1)
**And** `mcp_lifecycle_events` receives an event `{ event: 'spawn', sessionId, mcpServerId, latencyMs }`

**Given** the MCP process spawns successfully
**When** the INIT stage executes
**Then** JSON-RPC `initialize` request is sent → `initialize` response received → `initialized` notification sent (3-way handshake per `protocol_version: "2024-11-05"`)
**And** DISCOVER only begins after INIT 3-way handshake completes
**And** `mcp_lifecycle_events` receives `{ event: 'init' }` and `{ event: 'discover' }` entries

**Given** the env template contains `{{credential:missing_key}}` and that key is not in DB
**When** RESOLVE stage processes the env template
**Then** it throws `ToolError('AGENT_MCP_CREDENTIAL_MISSING', "Credential 'missing_key' not found")`
**And** SPAWN is aborted (process never started)
**And** `mcp_lifecycle_events` receives `{ event: 'error', errorCode: 'AGENT_MCP_CREDENTIAL_MISSING' }`

**Given** MCP server cold start exceeds 120s (D26 timeout)
**When** the spawn/init timeout fires
**Then** `ToolError('AGENT_MCP_SPAWN_TIMEOUT', ...)` is thrown
**And** the partially spawned process receives SIGKILL

**Given** `getOrSpawnSession()` is called a second time for the same (agentId, mcpServerId) within the same session
**When** the call executes
**Then** the existing cached `McpSession` is returned (warm start — no new spawn, no new INIT/DISCOVER)
**And** warm start latency for Notion MCP < 3s (NFR-P2)

- **Phase:** 1
- **Complexity:** L
- **blockedBy:** 18.1 (DB tables), 18.2 (transport interface), 16.4 (getCredential)
- **Architecture:** D26 (lazy spawn + 120s cold start + warm start SLA), E12 (Stages 1-4)
- **FRs:** FR-CM4, FR-CM5, FR-MCP4, FR-MCP6, FR-SO3 (lifecycle logging)

---

### Story 18.4: mcp-manager.ts — MERGE→EXECUTE→RETURN→TEARDOWN (Stages 5–8)

As a **Platform Engineer**,
I want mcp-manager.ts to merge MCP tools into messages.create() format (namespaced), route MCP tool_use calls to the correct server, and tear down processes cleanly on session end,
So that agents can use MCP tools transparently and zombie processes are prevented.

**Acceptance Criteria:**

**Given** Notion MCP returns `tools: [{ name: 'create_page', description: '...', inputSchema: {...} }]` from DISCOVER
**When** `mcpManager.getMergedTools(builtinTools, mcpSessions)` is called
**Then** the MCP tool appears as `{ name: 'notion__create_page', description: '...', inputSchema: {...} }` in the merged tools array (MERGE stage — double-underscore namespace from displayName)
**And** builtin tools are included unchanged in the merged array
**And** no name collision occurs if a built-in also named `read_web_page` exists (namespacing prevents conflict)

**Given** messages.create() returns a `tool_use` block with `name: 'notion__create_page'`
**When** `mcpManager.execute(toolUseName, toolInput, agentId, companyId)` is called
**Then** it strips the `notion__` prefix, identifies the Notion MCP session, and sends JSON-RPC `tools/call` with `{ method: 'tools/call', params: { name: 'create_page', arguments: toolInput } }` (EXECUTE stage)
**And** the MCP tool call event is recorded via E17 telemetry pattern in `tool_call_events`
**And** `mcp_lifecycle_events` records `{ event: 'execute', latencyMs }` for this call

**Given** the MCP server returns a result for `tools/call`
**When** `mcpManager.execute()` returns
**Then** the result is converted to a Anthropic `tool_result` content block format (RETURN stage) ready for injection into the next `messages.create()` call

**Given** an agent session ends (agent-loop.ts finally block)
**When** `mcpManager.teardownAll(sessionId)` is called
**Then** SIGTERM is sent to all MCP child processes for this session
**And** after 5000ms (SIGTERM_TIMEOUT_MS constant), any still-running processes receive SIGKILL
**And** `mcp_lifecycle_events` records `{ event: 'teardown' }` for each terminated server

**Given** 30 seconds pass after a session ends without a `teardown` event in `mcp_lifecycle_events`
**When** the zombie detection query runs: `SELECT session_id FROM mcp_lifecycle_events WHERE event='spawn' AND created_at < NOW() - INTERVAL '30 seconds' AND session_id NOT IN (SELECT session_id WHERE event='teardown')`
**Then** any zombie session IDs are returned for Admin alerting (NFR-R3)

- **Phase:** 1
- **Complexity:** L
- **blockedBy:** 18.3 (Stages 1-4 complete)
- **Architecture:** E12 (Stages 5-8), D22 (agent_mcp_access gate in execute), NFR-R3 (zombie detection)
- **FRs:** FR-MCP4 (MERGE/EXECUTE/RETURN stages), FR-MCP5 (TEARDOWN), FR-SO3 (lifecycle events), E17 (MCP telemetry)

---

### Story 18.5: agent-loop.ts MCP Integration — RESOLVE stage + MCP Merge + Scrubber Init

As a **Platform Engineer**,
I want agent-loop.ts extended with the RESOLVE stage (credential template resolution), MCP tool merge into messages.create(), and credential-scrubber init() at session start,
So that agents seamlessly use both built-in and MCP tools in a single session with full credential security.

**Acceptance Criteria:**

**Given** an agent session starts with MCP servers assigned (agent_mcp_access rows exist)
**When** agent-loop.ts session initialization runs
**Then** `scrubber.init(ctx)` is called first (D28 — before any tool calls)
**And** `mcpManager.getOrSpawnSession()` is called lazily (D26 — only when the agent first calls an MCP tool, not at session start)

**Given** a session where both built-in tools and Notion MCP tools are available
**When** the first LLM turn includes `messages.create()` call
**Then** the `tools` parameter includes both built-in tool definitions and `notion__*` namespaced MCP tool definitions (MERGE stage)

**Given** messages.create() returns a `tool_use` for `'read_web_page'` (built-in)
**When** agent-loop.ts dispatches the tool call
**Then** it routes to the built-in `read_web_page` handler (E13 pattern)
**And** does NOT route to MCP manager

**Given** messages.create() returns a `tool_use` for `'notion__create_page'` (MCP)
**When** agent-loop.ts dispatches the tool call
**Then** it routes to `mcpManager.execute('notion__create_page', input, agentId, companyId)` (E12 EXECUTE routing)
**And** the credential-scrubber PostToolUse Hook scans the MCP tool result (D28 — MCP output not exempt)

**Given** the agent session ends (normal completion or error)
**When** the agent-loop.ts finally block executes
**Then** `mcpManager.teardownAll(sessionId)` is called BEFORE Stop Hooks run (D4 — TEARDOWN independent of Stop Hooks)
**And** the scrubber in-memory credential list is released (`scrubber.clear()`)

**Given** the TypeScript compilation check runs
**When** `npx tsc --noEmit -p packages/server/tsconfig.json`
**Then** zero type errors (CLAUDE.md deploy requirement)

- **Phase:** 1
- **Complexity:** L
- **blockedBy:** 18.3 (RESOLVE/DISCOVER), 18.4 (MERGE/EXECUTE/TEARDOWN), 16.6 (scrubber init)
- **Architecture:** E12 (engine integration), D28 (scrubber init at session start), D26 (lazy spawn call)
- **FRs:** FR-CM4 (RESOLVE stage), FR-MCP4 (full 8-stage integration), FR-MCP5 (TEARDOWN in finally)

---

### Story 18.6: Admin MCP Server CRUD API Routes

As a **박현우 (Technical Admin)**,
I want `POST/GET/PUT/DELETE /admin/mcp-servers` routes and a `POST /admin/mcp-servers/:id/test` connection test endpoint,
So that Admins can register MCP servers and verify they connect correctly from the Admin UI.

**Acceptance Criteria:**

**Given** `POST /admin/mcp-servers` with body `{ displayName: 'notion', transport: 'stdio', command: 'npx', args: ['-y', '@notionhq/notion-mcp-server'], env: { NOTION_TOKEN: '{{credential:notion_integration_token}}' } }`
**When** the route handler executes
**Then** the MCP server config is saved to DB with `company_id = ctx.companyId`
**And** returns `{ success: true, data: { id, displayName, transport, isActive, createdAt } }`

**Given** `GET /admin/mcp-servers`
**When** the route executes
**Then** returns all active MCP server configs for the company (excluding deleted/inactive)
**And** the `env` JSONB is returned with `{{credential:*}}` template strings intact (NOT resolved values — security)

**Given** `POST /admin/mcp-servers/:id/test`
**When** the route executes
**Then** it runs RESOLVE → SPAWN → INIT → DISCOVER (3-way handshake + tools/list)
**And** returns `{ success: true, data: { toolCount: 22, latencyMs: 2800 } }` on success (NFR-I2)
**And** returns `{ success: false, error: { code: 'AGENT_MCP_SPAWN_TIMEOUT', message: '...' } }` if SPAWN fails

**Given** `transport: 'sse'` in the test request
**When** `POST /admin/mcp-servers/:id/test` runs
**Then** returns `{ success: false, error: { code: 'TOOL_MCP_TRANSPORT_UNSUPPORTED', message: "MCP transport 'sse' is not supported in Phase 1. Use 'stdio'." } }` (D25)

**Given** `PUT /admin/agents/:agentId/mcp-access` with body `{ mcpServerId: '...', grant: true }`
**When** the route executes
**Then** an `agent_mcp_access` row is inserted for `(agentId, mcpServerId)`
**And** it validates that both agentId and mcpServerId belong to the same `company_id` (cross-tenant grant blocked)

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 18.1 (DB tables), 18.3 (connection test logic)
- **Architecture:** D22 (agent_mcp_access grants), D25 (sse → UNSUPPORTED in test), NFR-I2 (3-way handshake test)
- **FRs:** FR-MCP1, FR-MCP2, FR-MCP3, FR-MCP6 (error in admin log)

---

## Epic 19: Admin UI — Credential, Tool, MCP, Reports

Non-developer Admins have a complete web UI to manage API credentials, per-agent tool toggles, MCP server configurations and access grants, and can view reports. Human staff can view reports read-only.

### Story 19.1: Admin Credentials UI Page

As a **박현우 (Technical Admin)**,
I want a `/admin/credentials` React page where I can add, view (masked), and delete API keys,
So that I can complete the ≤30min first-time setup journey (Journey 1 Gate: credential 1개 등록 <30min).

**Acceptance Criteria:**

**Given** the Admin navigates to `/admin/credentials`
**When** the page loads
**Then** it shows a table with columns: Key Name, Last Updated, Actions (Edit / Delete)
**And** key values are NOT shown (masked display — only key names visible per FR-CM2)
**And** a "Add Credential" button is visible

**Given** Admin clicks "Add Credential" and fills in `Key Name: tistory_access_token`, `Value: abc-token-xyz`
**When** they submit
**Then** `POST /admin/credentials` is called with `{ keyName, value }`
**And** the new credential appears in the table immediately (optimistic update or refetch)
**And** the input value field is cleared after submission

**Given** Admin clicks "Delete" on a credential row
**When** they confirm the deletion dialog
**Then** `DELETE /admin/credentials/:keyName` is called
**And** the row is removed from the table

**Given** Admin clicks "Edit" on a credential row
**When** they enter a new value and submit
**Then** `PUT /admin/credentials/:keyName` is called with the new value
**And** "Last Updated" timestamp refreshes in the table

**Given** the page loads with 0 credentials
**When** no credentials exist for this company
**Then** an empty state message appears: "No credentials registered. Add your first API key to enable external tools."

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 16.5 (credential CRUD API)
- **Architecture:** NFR-S1 (no plaintext display in UI)
- **FRs:** FR-CM1 (register), FR-CM2 (masked list), FR-CM3 (edit/delete)

---

### Story 19.2: Agent Tool Toggle UI

As a **박현우 (Technical Admin)**,
I want a `/admin/agents/:id/tools` React page with checkboxes for every available built-in tool,
So that I can enable/disable specific tools per agent without touching code (≤7min for Journey 1 tool toggle step).

**Acceptance Criteria:**

**Given** Admin navigates to `/admin/agents/:agentId/tools`
**When** the page loads
**Then** it fetches available tools from `GET /admin/tool-registry` (or equivalent server endpoint that returns the registered `BuiltinToolHandler` list) — tool list is data-driven, NOT hardcoded in the UI
**And** each tool appears with a toggle (checkbox/switch) showing its current ON/OFF state from `agents.allowed_tools` JSONB
**And** when Phase 2 tools are registered server-side, they automatically appear in this UI without frontend code changes

**Given** Admin turns ON the `publish_tistory` toggle for agent `marketing-publisher`
**When** they save or the change is auto-saved
**Then** `PATCH /admin/agents/:agentId` (or dedicated endpoint) updates `allowed_tools` JSONB to include `'publish_tistory'`
**And** the toggle immediately reflects the new state

**Given** Admin turns OFF all toggles for an agent
**When** the agent tries any tool call
**Then** the engine returns `TOOL_NOT_ALLOWED: <tool_name>` (confirmed by Story 17.1 engine enforcement)

**Given** multiple tools are changed in one session
**When** "Save All Changes" is clicked
**Then** a single `PATCH` request updates all tool toggles atomically

**Given** tool descriptions are shown alongside each toggle
**When** the page renders
**Then** each tool shows a brief description (2-sentence max) explaining what it does and when to use it

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 17.1 (allowed_tools schema + engine enforcement)
- **Architecture:** NFR-S5 (engine-level enforcement verified by this UI)
- **FRs:** FR-TA1 (enable/disable), FR-TA2 (checkbox UI bulk management)

---

### Story 19.3: Admin MCP Servers UI Page

As a **박현우 (Technical Admin)**,
I want a `/admin/mcp-servers` React page where I can register MCP servers with command/args/env, run a connection test, and see green/red status indicators,
So that MCP integration is "configuration, not development" (Journey 3 — 4 minutes to connect Notion MCP).

**Acceptance Criteria:**

**Given** Admin navigates to `/admin/mcp-servers`
**When** the page loads
**Then** it shows a table of registered MCP servers with columns: Display Name, Transport, Status (green/red), Last Tested, Actions
**And** an "Add MCP Server" button is visible

**Given** Admin clicks "Add MCP Server" and fills: Display Name=`notion`, Transport=`stdio`, Command=`npx`, Args=`-y @notionhq/notion-mcp-server`, Env=`NOTION_TOKEN={{credential:notion_integration_token}}`
**When** they submit
**Then** `POST /admin/mcp-servers` is called
**And** the new server appears in the table with status "Not tested"

**Given** Admin clicks "Test Connection" for the `notion` MCP server
**When** the test runs (POST /admin/mcp-servers/:id/test)
**Then** a spinner shows "Testing connection..."
**And** on success: status indicator turns green, tooltip shows "Connected — 22 tools available (2.8s)"
**And** on failure: status indicator turns red, tooltip shows the error code (e.g., `AGENT_MCP_SPAWN_TIMEOUT`)

**Given** transport type is `sse` in the form
**When** Admin submits
**Then** form submits successfully (config stored) but "Test Connection" returns warning: "SSE transport not supported in Phase 1. Use stdio."

**Given** the env field contains `{{credential:notion_integration_token}}` template
**When** the form displays an existing MCP server's env
**Then** the template string is shown as-is (NOT resolved to actual token — credentials never exposed in UI)

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 18.6 (Admin MCP API + connection test)
- **Architecture:** D25 (sse warning), NFR-I2 (connection test 3-way validation)
- **FRs:** FR-MCP1 (CRUD), FR-MCP3 (connection test with status indicator)

---

### Story 19.4: Agent-MCP Access Matrix UI

As a **박현우 (Technical Admin)**,
I want a UI where I can grant or revoke MCP server access per agent via checkboxes,
So that I can control which agents get Notion, Playwright, or other MCP tools (D22 configurable default OFF).

**Acceptance Criteria:**

**Given** Admin navigates to `/admin/agents/:agentId/mcp-access` (or this section appears within the agent detail page)
**When** the page loads
**Then** it shows a list of all registered MCP servers for this company
**And** each server has a checkbox showing whether this agent currently has access (agent_mcp_access row exists)
**And** Workers-tier agents show all checkboxes unchecked by default (D22 default OFF)

**Given** Admin checks the `notion` MCP server checkbox for agent `reporter`
**When** they save
**Then** `PUT /admin/agents/:agentId/mcp-access` inserts `(agentId, notionMcpId)` into `agent_mcp_access`
**And** the checkbox shows checked state

**Given** Admin unchecks the `notion` MCP checkbox for agent `reporter`
**When** they save
**Then** the `agent_mcp_access` row is deleted
**And** subsequent agent sessions no longer include Notion tools in messages.create() tools array

**Given** Admin tries to grant a MCP server from companyB to companyA's agent
**When** the API processes the request
**Then** it returns 403 (companyId FK chain prevents cross-tenant grant — server validation)

- **Phase:** 1
- **Complexity:** S
- **blockedBy:** 18.6 (agent MCP access API), 19.3 (MCP server list)
- **Architecture:** D22 (configurable default OFF)
- **FRs:** FR-MCP2 (grant/revoke per-agent), FR-TA4 (Workers default OFF)

---

### Story 19.5: Admin Reports UI & Human Reports UI

As a **최민준 (Intelligence Consumer) / Admin**,
I want `/admin/reports` (Admin) and `/reports` (Human read-only) pages to view saved reports with markdown rendering and PDF download,
So that the PDF email distribution channel has a web fallback, and report history is visible to authorized stakeholders.

**Acceptance Criteria:**

**Given** Admin navigates to `/admin/reports`
**When** the page loads
**Then** it shows a list of reports sorted by `created_at DESC` with columns: Title, Type, Agent, Tags, Date, Actions (View, Download PDF)
**And** only reports belonging to `ctx.companyId` are shown

**Given** Admin clicks "View" on a report
**When** the report detail page renders
**Then** the markdown `content` is rendered as formatted HTML (using a markdown renderer)
**And** a "Download PDF" button triggers `GET /admin/reports/:id/pdf` (server-side endpoint that calls `md_to_pdf(content, style: 'corporate')` and returns the PDF binary with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="report.pdf"` headers)

**Given** Human-role user navigates to `/reports`
**When** the page loads
**Then** they can see the same report list in read-only mode (no Create/Delete buttons)
**And** admin-only route `/admin/reports` returns 403 for Human-role users (RBAC enforcement)

**Given** no reports have been saved yet
**When** the page renders
**Then** an empty state shows: "No reports yet. Ask an agent to run save_report to see reports here."

**Given** filtering controls (by type, date range, agent) exist on the page
**When** Admin selects `type = 'competitor_analysis'`
**Then** only reports with that type are shown (client-side or server-side filter via GET /admin/reports?type=competitor_analysis)

This story creates `routes/admin/reports.ts` (Admin RBAC-gated endpoints: list, get, download PDF) and `routes/workspace/reports.ts` (Human read-only list + get endpoints), wired into the Hono app router.

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 20.1 (reports DB), 20.3 (list_reports / get_report handlers)
- **Architecture:** NFR-S4 (company_id scoped queries)
- **FRs:** FR-RM5 (Admin reports UI), FR-RM6 (Human read-only)

---

## Epic 20: Report & Distribution System

Agents can save markdown reports to DB, distribute them to web_dashboard and pdf_email channels (with partial failure tolerance), and retrieve past reports by ID or list. The pdf_email channel chains md_to_pdf → send_email with MIME attachment support.

### Story 20.1: Reports DB Schema & getDB() Methods

As a **Platform Engineer**,
I want the `reports` table created with Drizzle migration and getDB() report CRUD methods added,
So that save_report, list_reports, and get_report handlers have properly structured, company_id-isolated storage.

**Acceptance Criteria:**

**Given** Drizzle schema at `packages/server/src/db/schema/reports.ts`
**When** `drizzle-kit generate && drizzle-kit migrate` runs
**Then** `reports` table is created with: `id` (uuid PK), `company_id` (text FK), `agent_id` (uuid FK nullable), `run_id` (text), `title` (text), `content` (text), `type` (text nullable), `tags` (JSONB default []), `distribution_results` (JSONB nullable), `created_at` (timestamp)
**And** index `reports_company_date` exists on `(company_id, created_at)`

**Given** `getDB(companyId).listReports({ type: 'competitor_analysis' })`
**When** the query executes
**Then** returns `[{ id, title, type, tags, createdAt, agentId }]` ordered by `created_at DESC`
**And** `content` field is excluded from list results (performance — full content only via getReport)
**And** only rows with `company_id = companyId` are returned

**Given** `getDB(companyId).getReport('non-existent-id')`
**When** the query executes
**Then** returns an empty array (no throw — caller handles empty result)

**Given** `getDB(companyId).insertReport({ title, content, type, runId, agentId })` is called
**When** the INSERT executes
**Then** returns `[{ id }]` (report ID for subsequent distribution tracking)
**And** `company_id` is automatically set to `companyId` (not a parameter)

**Given** `getDB(companyId).updateReportDistribution(reportId, { web_dashboard: 'success', pdf_email: 'TOOL_EXTERNAL_SERVICE_ERROR' })`
**When** the UPDATE executes
**Then** `distribution_results` JSONB is set to the provided object
**And** only the report matching `(id, company_id)` is updated (cross-tenant update blocked)

- **Phase:** 1
- **Complexity:** S
- **blockedBy:** none (independent DB story)
- **Architecture:** D27 (channel phases: web_dashboard/pdf_email P1, notion P2, google_drive P4), E15 (distributionResults for partial failure tracking)
- **FRs:** FR-RM1 (reports DB), FR-RM2 (distributionResults), FR-RM3 (listReports), FR-RM4 (getReport)

---

### Story 20.2: save_report Tool Handler with Partial Failure Contract

As a **CEO 김대표 (Solo Operator)**,
I want agents to save reports to DB first and then distribute to requested channels, where a failed channel doesn't roll back successful channels or the DB save,
So that partial failures (e.g., SMTP error) don't require full report regeneration.

**Acceptance Criteria:**

**Given** `save_report({ title: 'Q1 분석', content: '## 결론...', type: 'competitor_analysis', tags: ['AI'], distribute_to: ['web_dashboard', 'pdf_email'] })`
**When** the handler executes
**Then** it first inserts into `reports` DB (`insertReport()`) — this is Step 1 and must always succeed before any channel distribution begins
**And** both channels are attempted in parallel via `Promise.allSettled()` (NOT `Promise.all()`)
**And** returns JSON: `{ reportId: '...', summary: 'Report saved. 2/2 channels succeeded.', channels: [{ status: 'success', channel: 'web_dashboard' }, { status: 'success', channel: 'pdf_email' }] }`

**Given** DB INSERT succeeds but `pdf_email` channel fails (e.g., SMTP error)
**When** `Promise.allSettled()` resolves
**Then** `web_dashboard` channel result is `{ status: 'success', channel: 'web_dashboard' }`
**And** `pdf_email` channel result is `{ status: 'failed', channel: 'pdf_email', error: 'TOOL_EXTERNAL_SERVICE_ERROR' }`
**And** `reports.distribution_results` JSONB is updated: `{ web_dashboard: 'success', pdf_email: 'TOOL_EXTERNAL_SERVICE_ERROR' }`
**And** the report is NOT deleted/rolled back from DB
**And** the returned summary is `'Report saved. 1/2 channels succeeded.'` (partial success, not error throw)

**Given** `distribute_to` is omitted (not provided)
**When** the handler executes
**Then** defaults to `['web_dashboard']` only
**And** DB insert + web_dashboard channel distribution succeed

**Given** `distribute_to: ['google_drive']` (Phase 4 channel)
**When** the handler tries to distribute
**Then** returns `{ status: 'failed', channel: 'google_drive', error: 'CHANNEL_NOT_IMPLEMENTED_UNTIL_PHASE_4' }` (not a silent skip)

**Given** DB INSERT itself fails (DB connection error)
**When** the error is caught
**Then** `ToolError('TOOL_EXTERNAL_SERVICE_ERROR', 'save_report: DB insert failed')` is thrown
**And** no channel distribution is attempted (DB must succeed first)

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 20.1 (reports DB + getDB() methods), 17.1 (E17 telemetry + BuiltinToolHandler), 17.2 (md_to_pdf for pdf_email channel)
- **Architecture:** E15 (Promise.allSettled partial failure contract), D27 (channel phases), E13 (BuiltinToolHandler), E17 (telemetry)
- **FRs:** FR-RM1 (save + distribute), FR-RM2 (partial failure contract — no rollback)

---

### Story 20.3: list_reports & get_report Tool Handlers

As a **최민준 (Intelligence Consumer)**,
I want agents to list available reports and retrieve a past report by ID,
So that agents can build on prior work (report continuity) and users can retry failed distributions without regenerating content.

**Acceptance Criteria:**

**Given** `list_reports({ type: 'competitor_analysis' })`
**When** the handler executes
**Then** calls `getDB(ctx.companyId).listReports({ type: 'competitor_analysis' })`
**And** returns a JSON string: `[{ id, title, type, tags, createdAt, agentId }]` (content excluded from list)
**And** returns an empty array `[]` if no reports match (not an error)

**Given** `get_report({ id: 'RPT-UUID-123' })` where that report belongs to this company
**When** the handler executes
**Then** calls `getDB(ctx.companyId).getReport('RPT-UUID-123')`
**And** returns the full report including `content` as a JSON string: `{ id, title, content, type, tags, distributionResults, createdAt }`

**Given** `get_report({ id: 'RPT-UUID-FROM-ANOTHER-COMPANY' })` (cross-company attempt)
**When** the handler executes
**Then** `getDB(ctx.companyId).getReport()` returns empty array (company_id WHERE clause)
**And** the handler returns `'Report not found'` string (not a security-exposing error)

**Given** Journey 6 scenario: previous `save_report` had `pdf_email` fail, report is in DB with `distribution_results: { pdf_email: 'failed' }`
**When** agent calls `get_report({ id: reportId })` and then re-calls `send_email` with the retrieved content
**Then** the report content is fully retrieved (no regeneration needed) — the handler supports this retry flow

- **Phase:** 1
- **Complexity:** S
- **blockedBy:** 20.1 (reports DB + getDB() methods), 17.1 (BuiltinToolHandler + telemetry)
- **Architecture:** E13 (BuiltinToolHandler), E17 (telemetry), NFR-S4 (company isolation in getReport)
- **FRs:** FR-RM3 (list_reports), FR-RM4 (get_report)

---

### Story 20.4: pdf_email Channel — send_email MIME Attachment Upgrade

As a **CEO 김대표 (Solo Operator)**,
I want `save_report(distribute_to: ['pdf_email'])` to generate a PDF from the report and send it as an email attachment,
So that the automated "sleeping CEO gets report PDF in inbox" scenario (Journey 2) is fully operational.

**Acceptance Criteria:**

**Given** `save_report({ ..., distribute_to: ['pdf_email'] })` runs with CEO 김대표's email registered
**When** the `pdf_email` distributor function executes
**Then** it calls `md_to_pdf({ content, style: 'corporate' })` → receives base64 PDF
**And** calls `send_email({ to: recipientEmail, subject: title, attachment: { filename: `${title}.pdf`, content: base64PDF, encoding: 'base64' } })`
**And** the recipient receives an email with the PDF file attached (not as inline content)

**Given** the existing `send-email.ts` handler does NOT support MIME multipart attachments
**When** Story 20.4 is implemented
**Then** `send-email.ts` is modified to accept `attachments?: [{ filename: string, content: string, encoding: 'base64' }]`
**And** MIME multipart encoding is used when attachments are present
**And** existing no-attachment email calls continue to work (backward compatible)

**Given** `md_to_pdf` call in the pdf_email distributor fails (Puppeteer pool timeout)
**When** the error is caught in the pdf_email channel function
**Then** the channel returns `{ status: 'failed', channel: 'pdf_email', error: 'TOOL_RESOURCE_UNAVAILABLE' }`
**And** E15 partial failure contract applies: report is already in DB, web_dashboard channel (if also requested) is unaffected

**Given** `send_email` call succeeds after `md_to_pdf` succeeds
**When** the pdf_email distributor returns
**Then** `distribution_results.pdf_email = 'success'`
**And** `tool_call_events` records both the `md_to_pdf` and the distributor's overall telemetry

**Given** the pdf_email channel relies on `send_email` which requires SMTP credentials (`smtp_host`, `smtp_user`, `smtp_password`) registered in the credentials store
**When** SMTP credentials are not configured for this company
**Then** the channel fails gracefully: `{ status: 'failed', channel: 'pdf_email', error: 'TOOL_CREDENTIAL_INVALID: smtp_host' }` (partial failure — report is already in DB, other channels unaffected)

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 20.2 (save_report handler + E15 contract), 17.2 (md_to_pdf handler), existing send-email.ts
- **Architecture:** E15 (pdf_email is a channel in allSettled — failure doesn't block other channels), D27 (pdf_email = Phase 1 channel)
- **FRs:** FR-RM1 (pdf_email channel in save_report), NFR-I3 (send_email MIME attachment support)

---

## Epic 21: Integration Testing & Security Audit

All Phase 1 Go/No-Go Gates are validated: credential-scrubber achieves 100% coverage, multi-tenant isolation is structurally verified, pipeline E2E telemetry is accurate, and 6 business-level gates pass.

### Story 21.1: Credential Security Audit & Scrubber Coverage Verification

As a **Technical Admin (박현우)**,
I want automated tests verifying AES-256 round-trip fidelity, credential-scrubber 100% coverage (built-in + MCP outputs), and zero credential leaks in agent outputs,
So that the Phase 1 Security Go/No-Go Gate is passed before production deployment.

**Acceptance Criteria:**

**Given** the AES-256-GCM round-trip test suite in `credential-crypto.test.ts`
**When** bun:test runs
**Then** encrypt→decrypt round-trip passes for 20+ test strings including: empty string, 1KB string, special characters `"'<>&`, Korean `한글 테스트`, multi-line text
**And** the decrypt-after-tamper test confirms `DOMException` is thrown (authTag integrity)
**And** two encryptions of identical plaintext produce different ciphertexts (random IV test)

**Given** the credential-scrubber test in `credential-scrubber.test.ts`
**When** a session context has `[{ keyName: 'tistory_token', plaintext: 'SECRET_VALUE_XYZ' }]` loaded
**And** a PostToolUse Hook receives tool output containing `'SECRET_VALUE_XYZ in the response body'`
**Then** the scrubbed output contains `'[REDACTED] in the response body'`
**And** the original `'SECRET_VALUE_XYZ'` does not appear anywhere in the post-scrub output

**Given** the MCP tool output scrubbing test
**When** a mock MCP `tools/call` response contains the credential value
**Then** the PostToolUse Hook (D28 extension) scrubs the MCP output just as it would built-in tool output
**And** the test confirms MCP output IS NOT exempt from scrubbing

**Given** the Admin error log exposure test for FR-MCP6
**When** `AGENT_MCP_CREDENTIAL_MISSING: notion_integration_token` error occurs
**Then** the error appears in Admin-accessible logs
**And** the actual credential value does NOT appear in the log (only the key name)

**Given** `npx tsc --noEmit -p packages/server/tsconfig.json`
**When** the TypeScript check runs after all credential security stories
**Then** zero type errors

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 16.3 (credential-crypto), 16.6 (scrubber D28 extension), 18.4 (MCP teardown)
- **Architecture:** D23 (AES-256 test), D28 (scrubber 100% coverage), NFR-S1, NFR-S2
- **FRs:** FR-SO1 (100% scrubber coverage), FR-CM5 (CREDENTIAL_TEMPLATE_UNRESOLVED), FR-MCP6 (admin log exposure)

---

### Story 21.2: Tool Telemetry & Pipeline E2E Gate Validation

As a **CEO 김대표 (Solo Operator) / Platform Engineer**,
I want automated tests verifying that tool_call_events records correct telemetry (started_at before completion, durationMs non-null), and that the Pipeline Go/No-Go Gate SQL returns correct results,
So that the Phase 1 Pipeline Completion Gate is provably accurate.

**Acceptance Criteria:**

**Given** a `read_web_page` tool call succeeds in a test with mock Jina Reader
**When** `tool_call_events` is queried for the test run_id
**Then** 1 row exists with `success = true`, non-null `started_at`, non-null `completed_at`, `duration_ms > 0`
**And** `started_at` is earlier than `completed_at` (E17 INSERT-before-execute)

**Given** a `read_web_page` tool call fails (mock returns 500)
**When** `tool_call_events` is queried
**Then** 1 row exists with `success = false`, non-null `error_code = 'TOOL_EXTERNAL_SERVICE_ERROR'`, non-null `duration_ms`

**Given** a pipeline with `run_id = 'test-pipeline-123'` that runs `read_web_page` then `save_report`
**When** the Pipeline Gate SQL runs:
```sql
SELECT run_id, COUNT(*) as tool_count
FROM tool_call_events
WHERE run_id = 'test-pipeline-123'
GROUP BY run_id
HAVING COUNT(*) >= 2 AND SUM(CASE WHEN success = false THEN 1 ELSE 0 END) = 0
```
**Then** 1 row is returned with `tool_count = 2` (pipeline completion confirmed)

**Given** a pipeline where the 2nd tool call fails
**When** the Pipeline Gate SQL runs for that run_id
**Then** 0 rows returned (HAVING clause filters out failure)

**Given** 4 D29 indexes on tool_call_events
**When** `EXPLAIN ANALYZE` runs the Pipeline Gate SQL with `run_id = $1`
**Then** the query plan shows "Index Scan using tce_run_id" (run_id index used, no full-table scan)

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 17.1 (tool_call_events DB + D29 indexes), 17.2 (md_to_pdf E17), 20.2 (save_report E17)
- **Architecture:** D29 (indexes in migration), E17 (telemetry accuracy)
- **FRs:** FR-SO2 (tool call events), NFR-P5 (success rate tracking baseline)

---

### Story 21.3: Multi-Tenant Isolation Tests

As a **Platform Engineer**,
I want automated cross-tenant isolation tests covering credentials, reports, MCP configs, and agent_mcp_access,
So that the data isolation guarantee (company_id firewall) is structurally verified before any pilot goes live.

**Acceptance Criteria:**

**Given** companyA registers credential `tistory_token = 'secret-A'` and companyB registers `tistory_token = 'secret-B'`
**When** `getDB(companyA).listCredentials()` runs
**Then** only companyA's credential is returned (1 row with keyName='tistory_token')
**And** `getDB(companyB).listCredentials()` returns only companyB's credential

**Given** companyA's agent calls `publish_tistory`
**When** the RESOLVE stage looks up `tistory_access_token`
**Then** only `getDB(companyA).getCredential('tistory_access_token')` is called (ctx.companyId scoped)
**And** companyB's token is structurally unreachable (no global `db.select().from(credentials)` query exists)

**Given** companyA has an agent and a mcp_server_config, companyB has a separate agent
**When** `getDB(companyB).getMcpServersForAgent(companyAAgentId)` is called
**Then** it returns empty array (INNER JOIN on companyId WHERE clause filters out cross-tenant results)

**Given** companyB's Admin tries to POST to `/admin/agents/:companyAAgentId/mcp-access`
**When** the server validates the agentId belongs to companyB
**Then** it returns 403 (agent doesn't belong to this company)

**Given** a `reports` table with rows from both companyA and companyB
**When** `getDB(companyA).listReports()` executes
**Then** only companyA's reports are returned (company_id WHERE clause verified by EXPLAIN ANALYZE)

- **Phase:** 1
- **Complexity:** M
- **blockedBy:** 16.4 (credential CRUD), 18.1 (MCP tables), 20.1 (reports table), 18.3 (getMcpServersForAgent)
- **Architecture:** NFR-S4 (multi-tenant isolation), D22 (cross-company MCP access blocked), E3 (getDB() scoped pattern)
- **FRs:** FR-CM1~3 (credential isolation), FR-MCP1~2 (MCP isolation), FR-RM1 (report isolation)

---

### Story 21.4: Phase 1 Go/No-Go Gate Validation

As a **Platform Engineer / Product Owner**,
I want an E2E integration test suite that validates all 6 Phase 1 Go/No-Go Gates against the actual system,
So that deployment to production and Phase 2 advancement is gated on verified criteria.

**Acceptance Criteria:**

**Given** the **Activation Gate** test: a test company registers ≥1 credential, activates ≥1 tool
**When** `SELECT COUNT(DISTINCT company_id) FROM agents WHERE jsonb_array_length(allowed_tools) > 0` runs
**Then** the test company appears in the result (activation confirmed)

**Given** the **Pipeline Completion Gate** test: a mock agent session runs `read_web_page` + `save_report(web_dashboard)`
**When** the pipeline completes and the Gate SQL runs
**Then** 1 row returned with `tool_count ≥ 2, success_count = 2` (both tools succeeded in same run_id)

**Given** the **Reliability Gate** test: 20 consecutive `read_web_page` calls with mock Jina (all succeed)
**When** 7-day rolling success rate is computed
**Then** success rate = 100% (well above 95% threshold)

**Given** the **Time-to-Value Gate** test: measure timestamp delta from `credentials.created_at` to first `tool_call_events.started_at` with `success = true`
**When** the test simulates the Journey 1 flow
**Then** the delta is logged (production measurement needed for 3 pilot companies — unit test establishes the metric framework)

**Given** the **Persona Value Delivery Gate** test: mock pipeline `read_web_page` × 1 + `save_report(pdf_email)` (NFR-P4 simple pipeline — single read + report)
**When** E2E timer measures `tool_call_events` first `started_at` to last `completed_at` for the run_id
**Then** total `duration_ms` < 240000 (4 minutes = 240s per NFR-P4) — CORTHEX system boundary only, external API latency excluded

**Given** the **Security Gate** test: all 5 registered credential values injected into mock tool outputs
**When** PostToolUse Hook scrubber processes each output
**Then** 0 credential values remain in scrubbed outputs (100% coverage — Phase 1 Security Gate: any leak = immediate blocker)

**Given** all Phase 1 stories are complete and bun:test runs the full test suite
**When** tests execute
**Then** all 6 Go/No-Go Gate tests pass
**And** `npx tsc --noEmit -p packages/server/tsconfig.json` returns 0 errors

- **Phase:** 1
- **Complexity:** L
- **blockedBy:** ALL previous stories in Epics 16–21 (final validation)
- **Architecture:** All D22–D29, E11–E17
- **FRs:** All Phase 1 FRs (validation coverage)
- **Go/No-Go Gates:** Activation ≥60%, Pipeline completion, Reliability ≥95%, Time-to-value <30min, Persona value ≤5min, Security 0 leaks

---

## Story Summary

| Epic | Stories | Phase | Key Architecture | Key FRs |
|------|---------|-------|-----------------|---------|
| 16: Credential Management | 6 stories | P1 | D23, D28, E11 | FR-CM1~6, FR-SO1 |
| 17: Built-in Tool Handlers | 6 stories (17.1a + 17.1b + 17.2~17.5) | P1 | D24, D29, E13, E14, E16, E17 | FR-DP1~2, FR-CP1~2, FR-WD1, FR-TA1~3, FR-SO2 |
| 18: MCP Infrastructure | 6 stories | P1 | D22, D25, D26, E12 | FR-MCP1~6, FR-CM4~5, FR-SO3 |
| 19: Admin UI | 5 stories | P1 | All admin routes | FR-TA2, FR-MCP1~3 (UI), FR-RM5~6 |
| 20: Report & Distribution | 4 stories | P1 | D27, E15 | FR-RM1~4, NFR-I3 |
| 21: Integration Testing | 4 stories | P1 | All decisions | All FRs (verification) |
| **Total** | **31 stories** | **P1** | **D22–D29, E11–E17** | **All Phase 1 FRs** |

### Phase 2 Stories (Out of Scope for Epics 16–21)
- FR-DP3/4 (ocr_document, pdf_to_md), FR-CP3~9 (publish_x, instagram, youtube, etc.)
- FR-WD2 (web_crawl Firecrawl), FR-SO4~6 (Audit Log UI, quota monitoring)
- Notion/Playwright/GitHub MCP server templates
- content_calendar tool + DB migration (schema pre-defined in Phase 1 codebase)
