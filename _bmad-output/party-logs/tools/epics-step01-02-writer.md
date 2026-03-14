# Writer Log: Epics Step 01-02 (Requirements + Epic Design)

## Step 1: Prerequisites Validated

**Documents read:**
- architecture.md (1,542 lines, D22-D29, E11-E17, 6 DB tables, 30 new files)
- prd.md (1,216 lines, 41 FRs × 8 areas, 20 NFRs × 5 areas)
- product-brief.md (698 lines)
- epics-template.md (template format)
- step-01, step-02, step-03 workflow files

**FRs Extracted:** 41 (FR-CM1~6, FR-TA1~4, FR-MCP1~6, FR-DP1~4, FR-RM1~6, FR-CP1~9, FR-WD1~3, FR-SO1~7)
**NFRs Extracted:** 20 (NFR-P1~5, NFR-S1~5, NFR-R1~3, NFR-SC1~3, NFR-I1~3)
**Architecture Additional Requirements:** D22-D29, E11-E17, Dockerfile changes, 6 DB tables

## Step 2: Epic Design (6 Epics)

**Epic 16: Credential Management Infrastructure** (D23, E11, D28)
- FRs: FR-CM1~6, FR-SO1 (D28 scrubber extension)
- 6 stories: dependency verification, credentials DB schema, AES-256 crypto lib, getDB() CRUD, Admin API routes, scrubber D28 extension

**Epic 17: Built-in Tool Handlers** (D24, D29, E13, E14, E16, E17)
- FRs: FR-DP1~2, FR-CP1~2, FR-WD1, FR-TA1~3, FR-SO2, FR-SO7
- 5 stories: tool infrastructure (types+DB+enforcement), md_to_pdf+pool, read_web_page, publish_tistory, upload_media

**Epic 18: MCP Server Infrastructure** (D22, D25, D26, E12)
- FRs: FR-CM4~5, FR-MCP1~6, FR-TA4, FR-SO3
- 6 stories: MCP DB tables, transport interface, mcp-manager stages 0-4, mcp-manager stages 5-8, agent-loop integration, Admin MCP API

**Epic 19: Admin UI** (all Admin routes)
- FRs: FR-CM1~3 UI, FR-TA1~2 UI, FR-MCP1~3 UI, FR-RM5~6
- 5 stories: credentials UI, tool toggle UI, MCP servers UI, agent-MCP matrix UI, reports UIs

**Epic 20: Report & Distribution System** (D27, E15)
- FRs: FR-RM1~4
- 4 stories: reports DB, save_report (E15 partial failure), list/get_report handlers, pdf_email channel

**Epic 21: Integration Testing & Security Audit** (all D22-D29, E11-E17)
- FRs: FR-SO1 (100% coverage), FR-SO7, all NFRs verification
- 4 stories: security audit, telemetry gate validation, multi-tenant isolation tests, Phase 1 Go/No-Go gate validation

**Total: 30 stories, all Phase 1**

## FR Coverage: 100% Phase 1 FRs Mapped
- FR-DP3/4, FR-CP3~9, FR-WD2~3, FR-SO4~6 deferred to Phase 2/3 (as specified in PRD)
