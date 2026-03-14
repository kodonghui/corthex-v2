# PRD Step 02+02b+02c — Context Snapshot

**Saved:** 2026-03-14
**Steps:** step-02-discovery + step-02b-vision + step-02c-executive-summary
**Score:** 9.3/10 (critic-a avg: 9.5/9.0/9.5) — PASS
**PRD File:** /home/ubuntu/corthex-v2/_bmad-output/planning-artifacts/tools-integration/prd.md

---

## Classification (step-02)

- **Project Type:** SaaS B2B Feature Expansion (saas_b2b 40% / web_app 30% / developer_tool 30%)
- **Domain:** AI Agent Orchestration (primary) → Marketing Automation (secondary) → Business Intelligence (tertiary)
- **Complexity:** High — 31/40 (Phase 1 PRD 29/40 대비 +2: external_dependency 3→5/5, auth_security 2→5/5)
- **Project Context:** Brownfield (CORTHEX v2 Epic 1–15 완료 시스템 위에 기능 확장)
- **Change Type:** Feature Expansion (56개 기존 도구 유지 + 18 신규 + ~5 리팩토링 + MCP 레이어)

## Key Decisions Locked

| Decision | Value | Source |
|----------|-------|--------|
| Phase 1 MVP tool count | 7 new built-in tools (publish_x excluded) | Brief MVP Scope |
| publish_x phase | Phase 2 (downgraded from Phase 1: $200/月 X API Basic cost gate) | Brief L615 |
| MCP integration engine | Manual Pattern (SPAWN→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN) — Epic 15/D17 consequence | Brief MCP section |
| TCO per-team (X excluded) | $13.40/팀/월 (5팀 공유 기준) | Brief TCO table |
| TCO per-team (X included) | $53.40/팀/월 | Brief TCO table |
| Complexity delta | +2 vs Phase 1 PRD: external_dep 3→5, auth_security 2→5 | Classification |
| Core differentiator | Full Pipeline Autonomy (vs n8n/Make: natural language → self-selected tools, no pre-defined flow) | Step 02b |
| Credential security model | {{credential:key}} inject + @zapier/secret-scrubber hook + AGENT_MCP_CREDENTIAL_MISSING typed error | Brief security |

## Phase Delivery Summary

| Phase | Tool Count | Key Tools | MCP |
|-------|-----------|-----------|-----|
| Phase 1 | 7 new tools | md_to_pdf, save_report, list_reports, get_report, publish_tistory, upload_media, read_web_page | Infrastructure only (DB+UI+engine) |
| Phase 2 | 7 more | ocr_document, pdf_to_md, publish_youtube, generate_video, generate_card_news, content_calendar, web_crawl + publish_instagram refactor | Notion, Playwright, GitHub, Firecrawl MCPs |
| Phase 3 | 2 tools | compose_video, crawl_site | Google Workspace MCP |
| Phase 4+ | 1+ | publish_daum_cafe | Naver MCPs, Redis |

## Next Steps

- step-03: Success Criteria
- step-04: User Journeys
- step-05: Domain (Tool inventory detail)
- step-06: Innovation (MCP architecture pattern)
- step-07: Project Type
- step-08: Scoping (Phase boundaries, out-of-scope)
- step-09: Functional requirements
- step-10: Non-functional requirements
- step-11: Polish
- step-12: Complete

## Party Log Files

- Critic reviews: /home/ubuntu/corthex-v2/_bmad-output/party-logs/tools/prd-step02-critic-a.md
- Critic reviews: /home/ubuntu/corthex-v2/_bmad-output/party-logs/tools/prd-step02-critic-b.md
- Fix summary: /home/ubuntu/corthex-v2/_bmad-output/party-logs/tools/prd-step02-fixes.md
