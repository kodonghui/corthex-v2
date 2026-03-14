---
project: CORTHEX Tool Integration
date: 2026-03-14
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: complete
partyModeRounds: 2
overallReadiness: READY
---

# Implementation Readiness Assessment Report

**Date:** 2026-03-14
**Project:** CORTHEX Tool Integration
**Assessor:** BMAD Implementation Readiness Agent
**Planning Documents Assessed:** Product Brief, PRD, Architecture, Epics & Stories

---

## Section 1: Document Discovery

### Document Inventory

**Product Brief**
- File: `_bmad-output/planning-artifacts/tools-integration/product-brief.md`
- Status: Complete (stepsCompleted: [1,2,3,4,5,6])
- Quality: 9.1/10 — 698 lines

**PRD (Product Requirements Document)**
- File: `_bmad-output/planning-artifacts/tools-integration/prd.md`
- Status: Complete (stepsCompleted: all 12 steps)
- Quality: 9.27/10 — 1,216 lines
- Content: 45 FRs × 8 areas + 20 NFRs × 5 areas + user journeys + domain requirements

**Architecture Document**
- File: `_bmad-output/planning-artifacts/tools-integration/architecture.md`
- Status: Complete (stepsCompleted: all steps)
- Quality: 9.0/10 — 1,542 lines
- Content: D22–D29 (8 architecture decisions) + E11–E17 (7 engineering patterns)

**Epics & Stories**
- File: `_bmad-output/planning-artifacts/tools-integration/epics-and-stories.md`
- Status: Complete (stepsCompleted: [1,2,3,4])
- Quality: 8.75/10 — 1,548 lines
- Content: 31 stories across 6 epics (Epic 16–21)

**UX Design Document**
- File: Not found (no `*ux*.md` in tools-integration folder)
- Status: ⚠️ WARNING — No dedicated UX document

**Duplicate Documents:** None found. Single version of each document.

---

## Section 2: PRD Analysis

### Functional Requirements Extracted

**FR Area 1: Credential Management (FR-CM)** — 6 FRs
- FR-CM1: Admin registers platform API keys as (key_name, value) pairs with company_id isolation
- FR-CM2: Admin views credential list with key names shown and values masked
- FR-CM3: Admin updates or deletes a registered credential
- FR-CM4: `{{credential:key_name}}` patterns in MCP server env JSONB resolved during RESOLVE stage (pre-spawn)
- FR-CM5: Unresolvable `{{credential:key_name}}` returns `CREDENTIAL_TEMPLATE_UNRESOLVED: key_name` and aborts MCP spawn
- FR-CM6: Credential create/update/delete events are audit-logged (company_id scope)

**FR Area 2: Agent Tool Assignment (FR-TA)** — 4 FRs
- FR-TA1: Admin enables/disables individual built-in tools per agent (`agents.allowed_tools JSONB`)
- FR-TA2: Admin views and bulk-manages per-agent active tool list as checkboxes
- FR-TA3: Agent calling unlisted tool receives `TOOL_NOT_ALLOWED: tool_name` (engine-level)
- FR-TA4: Admin configures MCP access defaults by agent Tier (Workers: default OFF)

**FR Area 3: MCP Server Management (FR-MCP)** — 6 FRs
- FR-MCP1: Admin registers/updates/deletes MCP server configs (display_name, transport, command, args, env)
- FR-MCP2: Admin grants/revokes per-agent MCP server access
- FR-MCP3: Admin runs connection test with immediate success/fail status
- FR-MCP4: Agent-loop integrates allowed MCP servers via 8-stage: RESOLVE→SPAWN→INIT→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN
- FR-MCP5: MCP child processes terminated SIGTERM→SIGKILL on session end
- FR-MCP6: Missing MCP credential returns `AGENT_MCP_CREDENTIAL_MISSING: key_name` (no silent passthrough)

**FR Area 4: Document Processing (FR-DP)** — 4 FRs
- FR-DP1: Agent converts markdown to PDF with style presets (corporate/minimal/default) — Phase 1
- FR-DP2: `md_to_pdf` renders Korean text, tables, code blocks, images (fonts-noto-cjk) — Phase 1
- FR-DP3: Agent OCR-processes image/scanned PDF → text/markdown/JSON (`ocr_document`, Phase 2)
- FR-DP4: Agent converts 20+ document formats to markdown (`pdf_to_md`, Phase 2)

**FR Area 5: Report Management (FR-RM)** — 6 FRs
- FR-RM1: Agent saves markdown report to `reports` DB and distributes to channels (`save_report`, Phase 1)
- FR-RM2: `save_report` partial failure contract: successful channels preserved, no DB rollback
- FR-RM3: Agent lists company-scoped reports filtered by date/agent/type/tags (`list_reports`, Phase 1)
- FR-RM4: Agent retrieves full report content by ID (`get_report`, Phase 1)
- FR-RM5: Admin views company-scoped reports with markdown rendering and PDF download (Phase 1)
- FR-RM6: Human-role users view published reports read-only (Phase 1)

**FR Area 6: Content Publishing & Media (FR-CP)** — 9 FRs
- FR-CP1: Agent publishes markdown as Tistory blog post, returns URL (`publish_tistory`, Phase 1)
- FR-CP2: Agent uploads file to Cloudflare R2, returns public URL (`upload_media`, Phase 1)
- FR-CP3: Agent publishes tweet/thread to X (`publish_x`, Phase 2)
- FR-CP4: Agent publishes image/carousel/Reels to Instagram (`publish_instagram` refactor, Phase 2)
- FR-CP5: Agent uploads video to YouTube with Shorts support (`publish_youtube`, Phase 2)
- FR-CP6: Agent generates card news image set 1080×1080px (`generate_card_news`, Phase 2)
- FR-CP7: Agent generates AI video via Replicate Kling (`generate_video`, Phase 2)
- FR-CP8: Agent submits async video composition job (`compose_video`, Phase 3)
- FR-CP9: Agent CRUDs content calendar entries (`content_calendar`, Phase 2)

**FR Area 7: Web Data Acquisition (FR-WD)** — 3 FRs
- FR-WD1: Agent reads single URL as clean markdown via Jina Reader (`read_web_page`, Phase 1)
- FR-WD2: Agent crawls web data in scrape/crawl/map modes (`web_crawl`, Firecrawl, Phase 2)
- FR-WD3: Agent runs full-site CSS-selector crawl (`crawl_site`, CLI-Anything+Crawlee, Phase 3)

**FR Area 8: Security & Observability (FR-SO)** — 7 FRs
- FR-SO1: PostToolUse Hook scans all tool outputs for credential values and removes them (100% coverage)
- FR-SO2: All tool call events logged: `{ company_id, agent_id, run_id, tool_name, started_at, completed_at, success, error_code? }`
- FR-SO3: MCP lifecycle events logged: `{ company_id, mcp_server_id, event, latency_ms }`
- FR-SO4: Admin views per-agent/per-tool/per-date tool call history in Audit Log UI (Phase 2)
- FR-SO5: External API quota 80% depletion triggers Admin notification (Phase 2)
- FR-SO6: External API quota 100% depletion auto-disables tool (Phase 2)
- FR-SO7: All tool failures return typed error codes with `TOOL_` or `AGENT_` prefix

**Total FRs: 45** (note: PRD header stated 41; 4 additional FRs formalized during architecture phase for FR-DP3~4 and FR-SO3~4 scope expansion)

### Non-Functional Requirements Extracted

**NFR Area 1: Performance (NFR-P)** — 5 NFRs
- NFR-P1: Tool SLAs — `md_to_pdf` p95 <10s (1pg)/<20s (10pg); `read_web_page` p95 <8s; `publish_tistory` p95 <5s; `upload_media` p95 <8s
- NFR-P2: MCP warm start — Notion `tools/list` <3s; Playwright <5s; arbitrary MCP <10s
- NFR-P3: `call_agent` handoff chain E2E <60s (handoff only; external API excluded)
- NFR-P4: Business pipeline E2E — simple (`read_web_page` × 1 + `save_report(pdf_email)`) ≤4min
- NFR-P5: Per-tool 7-day rolling success rate ≥95%; alert at <90%

**NFR Area 2: Security (NFR-S)** — 5 NFRs
- NFR-S1: `credentials` table values AES-256-GCM encrypted at rest
- NFR-S2: Raw API key exposure rate = 0% in agent outputs; violation = P0 security incident
- NFR-S3: MCP child process spawned with minimum-privilege env
- NFR-S4: All new tables company_id-gated; cross-tenant access structurally impossible
- NFR-S5: `allowed_tools` check enforced at `agent-loop.ts` engine level

**NFR Area 3: Reliability (NFR-R)** — 3 NFRs
- NFR-R1: All tool/MCP failures return typed error codes; zero untyped exceptions to LLM
- NFR-R2: `save_report` partial failure — DB save never rolled back; failed channels listed separately
- NFR-R3: MCP zombie processes: 0 active 30s past session end; SIGTERM→5s→SIGKILL on teardown

**NFR Area 4: Scalability (NFR-SC)** — 3 NFRs
- NFR-SC1: Puppeteer pool ≤5 concurrent (p-queue); 6th request queued 30s then TOOL_RESOURCE_UNAVAILABLE
- NFR-SC2: ARM64 24GB VPS — Chromium ~200MB/instance × 5 = ~1GB (safe ceiling)
- NFR-SC3: `tool_call_events` — 3 compound indexes + run_id index (D29) for Phase 2 Audit Log

**NFR Area 5: Integration (NFR-I)** — 3 NFRs
- NFR-I1: MCP transport flexible parsing; unknown fields ignored (protocol version tolerance)
- NFR-I2: Admin connection test validates 3-way handshake: SPAWN→INIT→DISCOVER success
- NFR-I3: `send_email` supports `attachments: [{filename, content, encoding: 'base64'}]` MIME multipart

**Total NFRs: 19** (PRD header states 20; NFR-SC3 is an architecture-derived requirement)

### Additional Requirements (Architecture-Derived)

**Infrastructure & Setup:**
- `CREDENTIAL_ENCRYPTION_KEY` env var (32 bytes / 64 hex chars) required at server start
- Dockerfile: `fonts-noto-cjk` APT install + Puppeteer Chromium cache path
- New packages (exact pin): `puppeteer@22.x`, `p-queue@8.x`, `@aws-sdk/client-s3@3.x`, `marked@12.x`

**Engine Integration:**
- All MCP integration code lives inside `engine/mcp/` (E8 boundary)
- `agent-loop.ts` manages `mcpManager.teardownAll()` in `finally` block (not in Stop Hook)
- `ctx.runId` injected by agent-loop.ts; tool handlers never generate runId
- `scrubber.init(ctx)` called at session start in agent-loop.ts

**DB Patterns:**
- All 6 new tables accessed only via `getDB(ctx.companyId)` extended methods
- `content_calendar` schema pre-defined in Phase 1 codebase but migration deferred to Phase 2
- D29: 4 indexes on `tool_call_events` must be in Phase 1 Drizzle migration

**Error Code Extensions:**
- `TOOL_NOT_ALLOWED`, `TOOL_EXTERNAL_SERVICE_ERROR`, `TOOL_QUOTA_EXHAUSTED`, `TOOL_RESOURCE_UNAVAILABLE`, `TOOL_CREDENTIAL_INVALID`, `AGENT_MCP_CREDENTIAL_MISSING`, `AGENT_MCP_SPAWN_TIMEOUT`, `CREDENTIAL_TEMPLATE_UNRESOLVED`

### PRD Completeness Assessment

The PRD is highly complete (9.27/10). Key strengths:
- 6 detailed user journeys with precise step timings and tool call sequences
- Phase-gated scope (Phase 1 hard boundary clearly defined)
- Go/No-Go Gates with measurable SQL-queryable criteria
- Compliance requirements (PIPA, platform ToS, copyright)
- Risk register with specific mitigations (R1–R7)
- BYOK model clearly defined (no external API cost to CORTHEX)

---

## Section 3: Epic Coverage Validation

### FR Coverage Matrix

| FR | PRD Requirement (Summary) | Epic Coverage | Phase | Status |
|----|--------------------------|---------------|-------|--------|
| FR-CM1 | Admin registers API keys, company_id isolated | Epic 16 (Story 16.2, 16.5) | P1 | ✓ Covered |
| FR-CM2 | Admin views masked credential list | Epic 16 (Story 16.5) + Epic 19 (Story 19.1) | P1 | ✓ Covered |
| FR-CM3 | Admin updates/deletes credentials | Epic 16 (Story 16.5) + Epic 19 (Story 19.1) | P1 | ✓ Covered |
| FR-CM4 | `{{credential:key}}` RESOLVE stage | Epic 18 (Story 18.3, 18.5) | P1 | ✓ Covered |
| FR-CM5 | Unresolvable pattern → CREDENTIAL_TEMPLATE_UNRESOLVED | Epic 18 (Story 18.3) | P1 | ✓ Covered |
| FR-CM6 | Credential CRUD audit logging | Epic 16 (Story 16.2, 16.5) | P1 | ✓ Covered |
| FR-TA1 | Admin enables/disables per-agent tools | Epic 17 (Story 17.1b) | P1 | ✓ Covered |
| FR-TA2 | Agent tools checkbox UI | Epic 19 (Story 19.2) | P1 | ✓ Covered |
| FR-TA3 | TOOL_NOT_ALLOWED engine enforcement | Epic 17 (Story 17.1a) | P1 | ✓ Covered |
| FR-TA4 | Workers default OFF MCP access | Epic 18 (Story 18.1, 18.5) | P1 | ✓ Covered |
| FR-MCP1 | Admin registers/updates/deletes MCP configs | Epic 18 (Story 18.6) + Epic 19 (Story 19.3) | P1 | ✓ Covered |
| FR-MCP2 | Per-agent MCP access grant/revoke | Epic 18 (Story 18.6) + Epic 19 (Story 19.4) | P1 | ✓ Covered |
| FR-MCP3 | Admin connection test | Epic 18 (Story 18.6) + Epic 19 (Story 19.3) | P1 | ✓ Covered |
| FR-MCP4 | 8-stage MCP integration pattern | Epic 18 (Stories 18.2~18.5) | P1 | ✓ Covered |
| FR-MCP5 | SIGTERM→SIGKILL on session end | Epic 18 (Story 18.4, 18.5) | P1 | ✓ Covered |
| FR-MCP6 | AGENT_MCP_CREDENTIAL_MISSING + Admin log | Epic 18 (Story 18.3, 18.6) | P1 | ✓ Covered |
| FR-DP1 | `md_to_pdf` with CSS presets | Epic 17 (Story 17.2) | P1 | ✓ Covered |
| FR-DP2 | Korean font support (fonts-noto-cjk) | Epic 16 (Story 16.1) + Epic 17 (Story 17.2) | P1 | ✓ Covered |
| FR-DP3 | `ocr_document` Claude Vision OCR | — | **Phase 2** | ⟳ Deferred (by design) |
| FR-DP4 | `pdf_to_md` 20+ format conversion | — | **Phase 2** | ⟳ Deferred (by design) |
| FR-RM1 | `save_report` DB + multi-channel | Epic 20 (Story 20.2) | P1 | ✓ Covered |
| FR-RM2 | Partial failure contract | Epic 20 (Story 20.2) | P1 | ✓ Covered |
| FR-RM3 | `list_reports` filtered query | Epic 20 (Story 20.3) | P1 | ✓ Covered |
| FR-RM4 | `get_report` by ID | Epic 20 (Story 20.3) | P1 | ✓ Covered |
| FR-RM5 | Admin `/admin/reports` UI | Epic 19 (Story 19.5) | P1 | ✓ Covered |
| FR-RM6 | Human `/reports` read-only UI | Epic 19 (Story 19.5) | P1 | ✓ Covered |
| FR-CP1 | `publish_tistory` → URL | Epic 17 (Story 17.4) | P1 | ✓ Covered |
| FR-CP2 | `upload_media` → R2 public URL | Epic 17 (Story 17.5) | P1 | ✓ Covered |
| FR-CP3 | `publish_x` X API | — | **Phase 2** | ⟳ Deferred (by design) |
| FR-CP4 | `publish_instagram` refactor | — | **Phase 2** | ⟳ Deferred (by design) |
| FR-CP5 | `publish_youtube` | — | **Phase 2** | ⟳ Deferred (by design) |
| FR-CP6 | `generate_card_news` | — | **Phase 2** | ⟳ Deferred (by design) |
| FR-CP7 | `generate_video` Replicate | — | **Phase 2** | ⟳ Deferred (by design) |
| FR-CP8 | `compose_video` async job | — | **Phase 3** | ⟳ Deferred (by design) |
| FR-CP9 | `content_calendar` CRUD | — | **Phase 2** | ⟳ Deferred (by design) |
| FR-WD1 | `read_web_page` Jina Reader | Epic 17 (Story 17.3) | P1 | ✓ Covered |
| FR-WD2 | `web_crawl` Firecrawl | — | **Phase 2** | ⟳ Deferred (by design) |
| FR-WD3 | `crawl_site` CLI-Anything | — | **Phase 3** | ⟳ Deferred (by design) |
| FR-SO1 | Credential-scrubber 100% coverage | Epic 16 (Story 16.6) + Epic 21 (Story 21.1) | P1 | ✓ Covered |
| FR-SO2 | Tool call event logging | Epic 17 (Story 17.1b) | P1 | ✓ Covered |
| FR-SO3 | MCP lifecycle event logging | Epic 18 (Story 18.1, 18.3, 18.4) | P1 | ✓ Covered |
| FR-SO4 | Audit Log UI | — | **Phase 2** | ⟳ Deferred (by design) |
| FR-SO5 | Quota 80% Admin notification | — | **Phase 2** | ⟳ Deferred (by design) |
| FR-SO6 | Quota 100% auto-disable | — | **Phase 2** | ⟳ Deferred (by design) |
| FR-SO7 | Typed error codes (TOOL_/AGENT_ prefix) | Epic 17 (Story 17.1a) + Epic 21 | P1 | ✓ Covered |

### Coverage Statistics

| Scope | Count | Percentage |
|-------|-------|-----------|
| **Total PRD FRs** | 45 | 100% |
| **Phase 1 FRs (Epics 16–21 scope)** | 27 | 60% |
| **Phase 1 FRs covered in epics** | 27 | **100%** |
| **Phase 2+ FRs (deferred by design)** | 18 | 40% |
| **Phase 2+ FRs in epics** | 0 | — (correct: out of scope) |

**Phase 1 FR Coverage: 27/27 = 100% — No gaps**

### Missing Coverage

**No critical missing FRs.** All Phase 1 requirements are covered in Epics 16–21.

Phase 2+ deferrals are **by design** per PRD Product Scope decision:
- FR-CP3 (publish_x): X API $200/월 cost gate — Phase 1 excluded per R4 decision
- FR-DP3~4: Phase 2 scope per document processing roadmap
- FR-SO4~6: Monitoring/audit infrastructure after Phase 1 baseline established

---

## Section 4: UX Alignment Assessment

### UX Document Status

**Not Found** — No dedicated UX design document exists at `_bmad-output/planning-artifacts/tools-integration/*.ux*.md`

### UX Implied Assessment

This is a **brownfield feature expansion** to an existing Admin UI system. The PRD contains substantial UX coverage embedded in multiple sections:

**UX Content Found in PRD:**
1. **6 User Journeys** (sections 310–419) — each with opening scene, rising action, climax, resolution, and explicit "Journey Requirements Revealed" breakdown
2. **5 Admin Route Specifications** with explicit component requirements:
   - `/admin/credentials` — table (Key Name / Last Updated / Actions), Add Credential dialog, masked display
   - `/admin/mcp-servers` — table (Display Name / Transport / Status green/red / Last Tested / Actions), "Test Connection" spinner, connection test tooltip
   - `/admin/agents/{id}/tools` — data-driven checkbox list, auto-save, description per tool
   - `/admin/reports` — table (Title / Type / Agent / Tags / Date), markdown renderer, PDF download
   - `/reports` — read-only table, 403 for non-human roles
3. **Story Acceptance Criteria** (Epic 19, Stories 19.1–19.5) contain pixel-level UI specifications
4. **Persona success metrics** define measurable UX outcomes (e.g., ≤30min first-time setup)

**UX ↔ PRD Alignment:** ✅ No misalignments found. All Admin UI requirements in user journeys are reflected in Epic 19 story ACs.

**UX ↔ Architecture Alignment:** ✅ Architecture D22–D29 and E11–E17 fully support the UI specifications. Admin routes defined in architecture align with Epic 19 stories.

### Warnings

⚠️ **MINOR WARNING: No formal UX wireframes/mockups**
- Brownfield projects can acceptably embed UX specs in PRD journeys + story ACs
- All UI components are described textually in ACs (table columns, form fields, status indicators, empty states)
- Risk: Admin UI page layout ambiguity could lead to inconsistent visual design
- **Recommendation:** Developer creates a quick sketch/wireframe for the 5 Admin pages before Epic 19 implementation begins. Not blocking.

---

## Section 5: Epic Quality Review

### Epic Structure Validation

#### Epic 16: Credential Management Infrastructure

**User Value Focus:** ✅ PASS — "Admins can securely register, manage, and audit API keys" — direct Admin value
**Epic Independence:** ✅ PASS — depends only on existing Epic 1–15 foundation
**Story Count:** 6 stories (16.1–16.6)

Story dependency chain is clean:
- 16.1 (Dependency Verification) → 16.2 (DB Schema) → 16.3 (Crypto Library) → 16.4 (getDB Methods) → 16.5 (Admin API) → 16.6 (Scrubber Extension)
- All backward-only dependencies ✅

AC Quality: ✅ All stories have Given/When/Then BDD format with testable, specific outcomes.

🟡 Minor: Story 16.1 bundles Dockerfile setup + dependency verification + MCP PoC in one story. The MCP PoC (SPAWN→INIT→DISCOVER) is conceptually different from package verification. This is a brownfield first-story bundling that is acceptable but could be split in future epics.

#### Epic 17: Built-in Tool Handlers

**User Value Focus:** ✅ PASS — "Agents can call 7 new Phase 1 built-in tools" — direct agent capability value
**Epic Independence:** ✅ PASS — depends on Epic 16 only
**Story Count:** 6 stories (17.1a, 17.1b, 17.2–17.5)

🟡 **Minor Description Mismatch:** Epic 17 header states "7 new Phase 1 built-in tools" but only 4 built-in handlers are implemented here (read_web_page, md_to_pdf, publish_tistory, upload_media). The remaining 3 (save_report, list_reports, get_report) are in Epic 20. The epic description is misleading — "tool handlers" count should clarify this. **Not blocking** — the story content is correct.

Story 17.1a and 17.1b split (types/engine vs. DB/schema) is a well-structured brownfield split that avoids large initial stories. ✅

AC Quality: ✅ Specific hexadecimal values (`#0f172a` for corporate header), concrete URL patterns (`r.jina.ai/{url}`), grep-verifiable constraints (zero `new Error()` calls), performance SLA numbers.

#### Epic 18: MCP Server Infrastructure

**User Value Focus:** ✅ PASS — "Admins can register any MCP server without code changes" + "Agent-loop integrates MCP servers" — clear Admin + agent value
**Epic Independence:** ✅ PASS — depends on Epics 16+17
**Story Count:** 6 stories (18.1–18.6)

Story sequence is clean:
- 18.1 (DB Schema) → 18.2 (Transport Interface) → 18.3 (Stages 1–4) → 18.4 (Stages 5–8) → 18.5 (agent-loop integration) → 18.6 (Admin API)

🟠 **Major Note — Complexity Underestimate Risk:** Stories 18.3 (L) and 18.4 (L) together implement the complete 8-stage RESOLVE→TEARDOWN MCP lifecycle with:
- JSON-RPC 2.0 protocol implementation
- Async process spawn with timeout handling
- Session caching (warm/cold start paths)
- Zombie process detection
These two stories are among the riskiest in the entire epic set. **Recommendation:** Dev team should allocate buffer time (1.5× estimate) for Stories 18.3–18.4, and confirm the Notion MCP PoC from Story 16.1 before starting 18.3.

#### Epic 19: Admin UI — Credential, Tool, MCP, Reports

**User Value Focus:** ✅ PASS — Admin gets complete web UI for tool management
**Epic Independence:** ⚠️ **ISSUE** — Story 19.5 (Admin Reports UI) has explicit `blockedBy: 20.1, 20.3` — **cross-epic forward dependency into Epic 20**
**Story Count:** 5 stories (19.1–19.5)

🟠 **Major Issue — Cross-Epic Forward Dependency:**
- Story 19.5 requires `reports` DB (Story 20.1) and `list_reports`/`get_report` handlers (Story 20.3)
- Epic 19 (Admin UI) is listed before Epic 20 (Report System) in the dependency chain
- **Impact:** Story 19.5 cannot be completed within Epic 19 without first completing part of Epic 20
- **Recommended Fix:** Story 19.5 should be **moved to Epic 20** as Story 20.5, or Epic 19 should be reordered to come after Epic 20. Given that it's a UI for reports, placing it in Epic 20 (the Report System epic) is semantically correct.
- **Not blocking for implementation** — developers can simply implement 19.5 after 20.3 regardless of epic numbering.

Other 4 stories (19.1–19.4) have no cross-epic dependencies. ✅

#### Epic 20: Report & Distribution System

**User Value Focus:** ✅ PASS — "Agents can save markdown reports... and retrieve past reports" + pdf_email chain delivery
**Epic Independence:** ✅ PASS — depends on Epics 16+17 (md_to_pdf + send_email)
**Story Count:** 4 stories (20.1–20.4)

Story 20.2 correctly uses `Promise.allSettled()` pattern (E15) rather than `Promise.all()` for partial failure contract. ✅

Story 20.4 identifies the pre-existing `send_email` handler's MIME limitation and specifies a backward-compatible upgrade. ✅

AC Quality: ✅ Story 20.2 has particularly strong ACs including the exact SQL distribution_results JSONB update format, the partial failure return structure, and the deferred channel error code.

#### Epic 21: Integration Testing & Security Audit

**User Value Focus:** ⚠️ **BORDERLINE** — Epic 21 is a pure testing/audit epic. This is a structural exception from the "epics deliver user value" rule, justified by:
1. Phase 1 Go/No-Go Gate validation is a business-level requirement (product launch gating)
2. Security audit (100% scrubber coverage) is a P0 requirement with P0-incident consequences
3. Multi-tenant isolation verification protects all other users

**Assessment:** Acceptable exception to the "user value" rule. The epic delivers **product safety** rather than direct user features. This pattern is acceptable for security-critical integrations.
**Epic Independence:** ✅ PASS — explicitly blocks on all prior stories (correct final validation position)
**Story Count:** 4 stories (21.1–21.4)

Story 21.4 correctly implements the 6 Go/No-Go Gates as testable, SQL-queryable criteria with specific threshold values. ✅

### Dependency Analysis

#### Cross-Epic Dependency Graph

```
Epic 16 (Credential Management)
  └─→ Epic 17 (Built-in Tool Handlers)
        ├─→ Epic 19 Stories 19.1~19.4 (Admin UI — partial)
        └─→ Epic 18 (MCP Infrastructure)
              └─→ Epic 19 Stories 19.3~19.4 (Admin UI — MCP UI)
Epic 17 ──────────→ Epic 20 (Report & Distribution)
                        └─→ Epic 19 Story 19.5 (Reports UI) [⚠️ forward dep]
All above ──────────→ Epic 21 (Integration Testing)
```

**Critical Path:** Epic 16 → Epic 17 → Epic 18 → Epic 20 → Epic 19.5 → Epic 21

**Recommended Implementation Order:**
1. Epic 16 (all 6 stories)
2. Epic 17 (all 6 stories)
3. Epic 18 (all 6 stories) ← parallel with Epic 19 partial possible
4. Epic 19 stories 19.1~19.4 (can start after 16.5 and 17.1 + 18.6)
5. Epic 20 (all 4 stories)
6. Epic 19 story 19.5 (after Epic 20.1 + 20.3 complete)
7. Epic 21 (after all above)

#### Database Creation Timing

✅ Tables are created in the story that first needs them:
- `credentials` → Story 16.2 ✅
- `tool_call_events`, `agents.allowed_tools` → Story 17.1b ✅
- `mcp_server_configs`, `agent_mcp_access`, `mcp_lifecycle_events` → Story 18.1 ✅
- `reports` → Story 20.1 ✅

⚠️ **Minor Note:** `content_calendar` schema is "pre-defined in Phase 1 codebase but migration deferred to Phase 2." This means a Drizzle schema file exists but migration is not run — acceptable pattern for Phase 2 readiness, but requires careful migration management.

### Best Practices Compliance Checklist

| Epic | User Value | Independence | Story Sizing | No Forward Deps | DB When Needed | Clear ACs | FR Traceability |
|------|-----------|--------------|--------------|-----------------|---------------|-----------|-----------------|
| 16 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 17 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 18 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 19 | ✅ | ⚠️ (19.5) | ✅ | ⚠️ (19.5→20) | ✅ | ✅ | ✅ |
| 20 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 21 | ⚠️ (testing epic) | ✅ | ✅ | ✅ | N/A | ✅ | ✅ |

### Quality Findings by Severity

#### 🔴 Critical Violations
None.

#### 🟠 Major Issues

**Issue M1: Story 19.5 cross-epic forward dependency**
- Story 19.5 (Admin Reports UI) `blockedBy: [20.1, 20.3]`
- Epic 19 cannot complete independently — Story 19.5 requires Epic 20 stories
- **Remediation:** Move Story 19.5 to Epic 20 (rename to 20.5) or explicitly note in sprint-status that 19.5 must be scheduled after 20.3
- **Impact:** Scheduling only, not a design defect

**Issue M2: Epic 18 MCP complexity risk**
- Stories 18.3 + 18.4 together implement novel JSON-RPC async process lifecycle
- The Notion MCP PoC in Story 16.1 is a prerequisite, but its pass/fail criteria are minimal (basic tools/list success)
- A more thorough PoC (round-trip tool execution) would de-risk 18.3–18.4 implementation
- **Remediation:** Before Story 18.3, run an expanded PoC: Notion MCP `tools/call create_page` → verify tool_result injection into next `messages.create()` turn
- **Impact:** Schedule buffer; not a design defect

#### 🟡 Minor Concerns

**Issue m1: Epic 17 description mismatch**
- Description says "7 new Phase 1 built-in tools" but only 4 are in Epic 17 (3 report tools in Epic 20)
- **Remediation:** Update Epic 17 header to "4 new Phase 1 built-in tools (report tools in Epic 20)"
- **Impact:** Documentation clarity only

**Issue m2: content_calendar deferred migration**
- Schema defined but migration deferred to Phase 2 creates "ghost schema" in codebase
- **Remediation:** Add a clear comment in the Drizzle schema file: `// Phase 2 migration — DO NOT include in Phase 1 migration`
- **Impact:** Developer confusion risk; not a design defect

**Issue m3: FR count discrepancy**
- PRD header states "41 FRs" but epics document correctly notes 45 FRs
- 4 FRs (FR-DP3~4, FR-SO3~4) were formalized during architecture phase
- **Remediation:** Update PRD frontmatter `frCount: 41` to `frCount: 45`
- **Impact:** Documentation accuracy only

---

## Section 6: Summary and Recommendations

### Overall Readiness Status

## ✅ READY

All Phase 1 requirements are covered. No critical violations exist. The planning artifacts are comprehensive, internally consistent, and implementation-ready with minor clarifications noted below.

### Critical Issues Requiring Immediate Action

**None.** No blocking issues prevent implementation from beginning.

### Pre-Implementation Checklist (Recommended)

1. **Before Story 18.3:** Run expanded MCP PoC — full `tools/call` round-trip with Notion MCP to validate EXECUTE→RETURN stages work before building the full lifecycle manager
2. **Story 19.5 scheduling:** Schedule Story 19.5 after Epic 20 Stories 20.1 + 20.3 complete (in sprint planning, do not schedule 19.5 in Epic 19 sprint)
3. **Epic 18 buffer:** Allocate 1.5× time estimates for Stories 18.3 + 18.4 given JSON-RPC process lifecycle complexity
4. **Architecture doc review:** Dev team should read Architecture D22–D29 + E11–E17 sections before starting Epic 18 implementation

### Recommended Next Steps

1. **Proceed to Sprint Planning** — append Epics 16–21 to sprint-status.yaml with status: pending
2. **Start with Epic 16** (no dependencies) — Story 16.1 is the unblocked first story
3. **Brief team on Epic 18 risk** — Stories 18.3–18.4 are the highest-complexity stories; expanded PoC recommended before implementation
4. **Move Story 19.5** to Epic 20 position in sprint-status (schedule after 20.3) to resolve cross-epic dependency
5. **Minor doc updates** — Update Epic 17 description + PRD FR count frontmatter (not blocking)

### Readiness Scorecard

| Dimension | Score | Notes |
|-----------|-------|-------|
| Document Completeness | 9/10 | All 4 docs complete; no UX doc (minor) |
| FR Coverage (Phase 1) | 10/10 | 27/27 Phase 1 FRs covered |
| NFR Coverage | 9/10 | All NFRs addressed; quotas monitoring deferred to P2 |
| Epic Quality | 8.5/10 | 1 cross-epic dep issue; no critical violations |
| Story Quality | 9/10 | BDD ACs throughout; strong specificity |
| Dependency Graph | 8/10 | 19.5 forward dep needs scheduling attention |
| Architecture Alignment | 10/10 | D22–D29, E11–E17 fully mapped to stories |
| **Overall** | **8.9/10** | **READY** |

### Final Note

This assessment identified **5 issues** across **2 severity categories** (0 critical, 2 major, 3 minor). None are blocking. The major issues are scheduling/estimation concerns rather than design defects. The planning artifacts for CORTHEX Tool Integration (Product Brief 9.1/10 → PRD 9.27/10 → Architecture 9.0/10 → Epics 8.75/10) represent a high-quality planning pipeline. Implementation can begin immediately with Epic 16 Story 16.1.

**Implementation Start Recommendation:** Epic 16 Story 16.1 (Dependency Verification & Dockerfile Setup) — unblocked, verifies all Phase 1 dependencies including the critical MCP PoC.
