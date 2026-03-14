# Context Snapshot: Product Brief Complete
> Project: CORTHEX Tool Integration
> Snapshot date: 2026-03-14
> Stage: Product Brief — ALL 6 STEPS COMPLETE
> Document: `_bmad-output/planning-artifacts/tools-integration/product-brief.md` (698 lines, status: complete)

---

## Document Structure (6 Sections)

| Section | Lines | Content | Critic Score |
|---------|-------|---------|-------------|
| Executive Summary | ~15 | 18 new tools + ~5 refactored, 4 pillars, honest TCO, SaaS substitution | N/A (init) |
| Core Vision | ~180 | Problem statement, 18-tool inventory, Phase delivery table, MCP 6-step pattern, Key Differentiators, TCO table | 9/10 |
| Target Users | ~230 | 6 personas + tertiary user + PRD alignment map + 2 journeys | 9/10 |
| Success Metrics | ~70 | 4 layers: Adoption, Performance SLAs, Business Outcome, Guardrails + telemetry requirements | 9/10 |
| MVP Scope | ~130 | Phase 1 (7 tools + MCP infra), Out of Scope, 6 go/no-go gates, Future Vision | 9.5/10 / 9/10 |
| Footer | 1 | All steps completed marker | — |

---

## Critical Decisions Captured in Brief

| Decision | Section | Impact |
|----------|---------|--------|
| MCP integration uses Manual Pattern (SPAWN→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN) not createSdkMcpServer() | Core Vision | Architecture must implement 6-step subprocess pattern; no native mcpServers param in messages.create() |
| `publish_x` deferred to Phase 2 | MVP Scope | Phase 1 has 7 built-in tools (not 8); X API Basic $200/month cost barrier; publish_tistory covers Phase 1 Aha! Moments |
| `send_email` binary attachment must be verified/upgraded | MVP Scope | Required for save_report → pdf_email chain; existing tool only accepts {to, subject, body} |
| 60s NFR scope: call_agent handoff chains ONLY | Success Metrics | Single-agent multi-tool pipelines (e.g., 4-min research pipeline) are NOT NFR violations |
| Security gate failure = P0 halt + rollback | MVP Scope | Blocks Phase 2 regardless of other gate results |
| Credential `{{template}}` literal = HIGH config bug, NOT P0 security | Success Metrics | P0 reserved for raw API key value in output |
| agent_mcp_access schema deferred | MVP Scope | Architecture phase defines FK constraints, indexes, cascade deletes |
| CEO 김대표 is the PRD's #1 primary persona | Target Users | Solo operator = admin + Hub user + report consumer; drives pdf_email + ARGOS pipeline |
| 팀장 박과장 governance persona added | Target Users | Per-department tool access control, X API cost gating → Phase 2+ stories |

---

## Phase Delivery Summary

| Phase | Tools | Gate |
|-------|-------|------|
| **Phase 1 MVP** | `md_to_pdf`, `save_report`, `list_reports`, `get_report`, `publish_tistory`, `upload_media`, `read_web_page` (7 new) + MCP infra | 6 go/no-go gates at 30-day mark |
| **Phase 2** | `publish_x`, `publish_instagram`, `ocr_document`, `pdf_to_md`, `publish_youtube`, `generate_video`, `generate_card_news`, `content_calendar`, `web_crawl` + Notion/Playwright/GitHub MCP | Phase 1 gates met |
| **Phase 3** | `compose_video`, `crawl_site`, Google Workspace MCP | Phase 2 complete |
| **Phase 4+** | `publish_daum_cafe`, Naver/Kakao MCP, Redis cache | Phase 3 complete |
| **Phase 2 Roadmap** | Activepieces (280+ services), Pipedream (2,500 APIs) | Post-Architecture review |

---

## PRD Persona → Story Coverage Map

| Persona | Brief Section | Drives Stories For |
|---------|--------------|-------------------|
| CEO 김대표 (1인 사업가) | Persona 5 | ARGOS-scheduled reports, pdf_email pipeline, autonomous publishing |
| 팀장 박과장 (team manager) | Persona 6 | Per-dept tool access control, X API cost governance, audit log |
| 김지은 (Non-dev Admin) | Persona 1 | Admin credentials UI, tool toggle, MCP setup UX |
| 박현우 (Technical Admin) | Persona 2 | MCP config lifecycle, Dockerfile docs, error monitoring |
| 이수진 (Marketing TL) | Persona 3 | /reports Human-accessible route, completion notifications |
| 최민준 (Intelligence Consumer) | Persona 4 | read_web_page + save_report + md_to_pdf pipeline |
| External PDF recipient | Tertiary | md_to_pdf CSS spec, Pretendard font, corporate preset |

---

## Open Items for Architecture Phase

1. **MCP connection test**: synchronous subprocess spawn vs. async job queue + poll
2. **save_report partial failure**: retry behavior when Notion MCP succeeds but send_email fails
3. **Puppeteer concurrency limit**: max concurrent Chromium instances on 24GB ARM64 VPS
4. **agent_mcp_access schema**: FK constraints, indexes, cascade deletes
5. **MCP cold start**: `npx -y` first-run 10–30s; pre-warming strategy
6. **Per-department tool access control**: Phase 2 epic scope (Persona 6)
7. **Manager approval workflow for expensive tools**: Phase 2 notification system
8. **send_email attachment upgrade**: verify/implement as part of save_report story
9. **compose_video async job**: worker retry count, failure mode, 15-min timeout handling

---

## Next Stage: PRD

**Output file:** `_bmad-output/planning-artifacts/tools-integration/prd.md`

**PRD must:**
- Derive acceptance criteria from Step-04 success metrics
- Create user stories anchored to all 7 personas (6 named + 1 tertiary)
- Map Phase 1 tools (7 + MCP infra) to specific epics
- Include NFR table: call_agent handoff chain <60s, md_to_pdf p95 <10s, ocr_document p95 <8s/<20s, etc.
- Specify RBAC: Human role → /reports (non-admin); Admin → /admin/*
- Reference Manual MCP Integration Pattern from product brief Core Vision
- Flag `send_email` binary attachment verification as Story 0 prerequisite

---

*Snapshot created: 2026-03-14 | Brief finalized: 698 lines | All 6 steps ✅ | Ready for PRD phase*
