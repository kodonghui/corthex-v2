---
project: CORTHEX Tool Integration
stepsCompleted: [1, 2, 3, 4, 5, 6]
date: 2026-03-14
status: complete
---

# Product Brief: CORTHEX Tool Integration
> Feature expansion to add real-world action capabilities to CORTHEX v2 AI agents

---

## Executive Summary

CORTHEX v2 AI agents currently excel at analysis and conversation but cannot perform real-world business actions — they cannot publish a blog post to Tistory, crawl a competitor's website, generate a formatted PDF report, or upload a video to YouTube. This gap forces organizations to maintain fragmented SaaS subscriptions (Predis.ai $59, Opus Clip $15, Perplexity Pro $20, Gamma $8, Buffer $30) while AI agents sit idle on the "last mile" of execution. The CORTHEX Tool Integration feature closes this gap by adding **18 new built-in tools** + **~5 refactored existing tools** and a dynamic MCP server infrastructure, transforming CORTHEX AI agents from sophisticated analysts into autonomous business operators that complete entire workflows — web research → content generation → multi-platform publishing → structured reporting — within a single agent conversation.

---

## Core Vision

### Problem Statement

CORTHEX v2 AI agents have a **capability ceiling at the point of action**. An agent assigned to the marketing department can draft a compelling blog post in perfect Korean, but it cannot publish that post to Tistory. It can analyze a competitor's pricing strategy based on information provided to it, but it cannot crawl the competitor's website to gather that information itself. It can summarize meeting notes into a structured report, but it cannot save that report to Notion or email it as a PDF attachment.

Concretely, the 56 existing tools cover utility functions (search_web, get_current_time, calculate, send_email) and domain-specific lookups (kr_stock, law_search, dart_api), but the platform has **zero tools** in three critical action categories:

1. **Document generation**: No `md_to_pdf` → agents cannot deliver polished reports
2. **Content publishing**: No `publish_tistory`, `publish_x`, `publish_instagram`, `publish_youtube` → agents cannot execute marketing campaigns
3. **Web data acquisition**: No `read_web_page`, `web_crawl` → agents cannot self-serve research from live web sources

This forces human staff to manually complete the "last mile" of every agent workflow, negating the value of AI automation.

### Problem Impact

The absence of action-layer tools creates three measurable business harms:

**1. Wasted agent capability (daily)**
A marketing manager agent can plan a 5-article content calendar, write all 5 articles, and generate 5 AI images — but cannot publish any of it. A human must copy-paste each article into Tistory and manually upload images. This "last mile" gap consumes 30–60 minutes of human time per content cycle that should take 0 minutes.

**2. Fragmented tool spending per team**
Organizations compensate by subscribing to scattered SaaS tools per team:
- Predis.ai ($59/month): AI content + Instagram auto-posting
- Perplexity Pro ($20/month): Web research
- Gamma ($8/month): Presentation generation
- Buffer ($15–30/month): Multi-platform scheduling
- Opus Clip ($15/month): Video clipping
- **Total: $117–132/month per team** (from `_research/_tools-idea/10-team-recommendations.md` all-in-one estimate: ~$127–150/month)

CORTHEX agents could replace all of these capabilities if they had the right tools — but without them, organizations pay for both CORTHEX and the SaaS stack.

**3. Lost compounding value of agent-to-agent handoffs**
CORTHEX's core differentiator is dynamic org management: a marketing director agent can delegate to a copywriter agent via `call_agent`. But handoffs that terminate at "I've written the content" rather than "I've published and reported on the content" mean the org chart is only half-utilized. The economic case for 5-agent marketing teams over 1-agent teams collapses when all 5 agents still require human completion.

### Why Existing Solutions Fall Short

**Scattered SaaS tools** (Predis.ai, Opus Clip, Buffer, etc.) each solve one publishing channel but do not integrate with each other, do not understand agent conversation context, and cannot be directed by natural language commands. An admin must configure each tool separately, monitor each dashboard independently, and manually stitch workflows together.

**Current CORTHEX tools** (56 builtins) cover search and analysis but were designed for information retrieval, not for executing external actions. They have no web crawling capability (Jina Reader, Firecrawl), no document generation pipeline (md-to-pdf, MarkItDown), no platform publishing integrations (Tistory API, X API v2, Instagram Graph API, YouTube Data API v3), and no MCP server infrastructure for extensibility.

**MCP-only approaches** (connecting Notion MCP, Playwright MCP, etc. without built-in tools) require per-agent manual configuration, cannot be managed dynamically through the admin UI, and do not provide the credential security model (`{{credential:key}}` runtime injection) required for multi-tenant operation.

### Proposed Solution

Add **18 new built-in tools** (enumerated below), **~5 refactored existing tools**, and a **dynamic MCP server infrastructure** to CORTHEX v2, organized across four capability pillars.

#### Full Tool Inventory (18 new tools)

| # | Tool | Pillar | Priority | Complexity |
|---|------|--------|----------|------------|
| 1 | `ocr_document` | Document Processing | P1 | Low |
| 2 | `md_to_pdf` | Document Processing | P0 | Low |
| 3 | `pdf_to_md` | Document Processing | P1 | Low (MCP) |
| 4 | `save_report` | Report Management | P0 | Medium |
| 5 | `list_reports` | Report Management | P0 | Low |
| 6 | `get_report` | Report Management | P0 | Low |
| 7 | `publish_tistory` | Marketing Pipeline | P0 | Low |
| 8 | `publish_x` | Marketing Pipeline | P0 | Low |
| 9 | `publish_youtube` | Marketing Pipeline | P1 | Medium |
| 10 | `generate_video` | Marketing Pipeline | P1 | Medium |
| 11 | `generate_card_news` | Marketing Pipeline | P1 | Medium |
| 12 | `compose_video` | Marketing Pipeline | P2 | High |
| 13 | `upload_media` | Marketing Pipeline | P0 | Low |
| 14 | `content_calendar` | Marketing Pipeline | P1 | Low |
| 15 | `publish_daum_cafe` | Marketing Pipeline | P3 | High |
| 16 | `read_web_page` | Web Data Acquisition | P0 | Very Low |
| 17 | `web_crawl` | Web Data Acquisition | P1 | Low (API) |
| 18 | `crawl_site` | Web Data Acquisition | P2 | Medium |

#### Refactored Existing Tools (~5)

| Tool | Change |
|------|--------|
| `publish_instagram` | Add carousel (up to 10 images) + Reels support via Instagram Graph API; add `upload_media` dependency for public URLs |
| `text_to_speech` | Add narration output format (WAV/MP3) for video pipeline |
| `generate_image` | Upgrade to Replicate Flux 1.1 Pro (~$0.04/image) |
| `hashtag_generator` | Add per-platform optimization (Instagram vs X vs TikTok) |

#### Phase Delivery Boundaries

| Phase | Tools | Milestone |
|-------|-------|-----------|
| **Phase 1 (MVP)** | `md_to_pdf`, `save_report`, `list_reports`, `get_report`, `publish_tistory`, `publish_x`, `upload_media`, `read_web_page` + MCP infra | Agents can publish content + save reports |
| **Phase 2** | `ocr_document`, `pdf_to_md`, `publish_youtube`, `generate_video`, `generate_card_news`, `content_calendar`, `web_crawl` + `publish_instagram` refactor + Notion/Playwright/GitHub MCP | Full marketing pipeline |
| **Phase 3** | `compose_video`, `crawl_site` + Google Workspace MCP + Remotion video rendering | Video production pipeline |
| **Phase 4+** | `publish_daum_cafe` (Playwright automation), Korean platform MCPs (Naver), Redis cache | Korean platform expansion |

#### Pillar 1: Document Processing (Report #1)

- `ocr_document` — Claude Vision-powered OCR for images/scanned PDFs (Korean/English/Japanese, output: text/markdown/JSON via Zod schema)
- `md_to_pdf` — Markdown → styled PDF via `md-to-pdf` npm (1,200+ ★) + Puppeteer/Chromium; CSS presets: `corporate` (Pretendard font, `#0f172a` headers, `#3b82f6` border) / `minimal` / `default`; Dockerfile: add `chromium + fonts-noto-cjk` for ARM64
- `pdf_to_md` — Any document → Markdown via `markitdown-mcp` (Microsoft official, 20+ formats: PDF/Word/PPT/Excel/images/audio)

**Resource note:** `md_to_pdf` and `generate_card_news` both use Puppeteer (~200MB Chromium RAM per instance). Concurrent marketing pipelines may spawn multiple headless browser instances. Architecture phase must define a concurrency limit for headless browser processes against the 24GB ARM64 VPS constraint (20 concurrent session max per E-constraint).

#### Pillar 2: Report & Knowledge Management (Report #2)

- `save_report` — Save structured markdown reports to `reports` DB table + distribute to: `web_dashboard` (published=true), `pdf_email` (md_to_pdf → send_email chain), `notion` (Notion MCP `create_page`), `google_drive` (Google Workspace MCP), `notebooklm` (NotebookLM MCP `add_source`)
- `list_reports` — Report list by company_id with filter by date/agent/type/tags
- `get_report` — Single report fetch by ID

DB schema: `reports` table (id, company_id, agent_id, title, content TEXT, type VARCHAR(20), tags JSONB, published BOOLEAN, created_at TIMESTAMPTZ). Index: `idx_reports_company ON reports(company_id, created_at DESC)`.

Admin UI: `/admin/reports` page with `react-markdown` + `remark-gfm` + `rehype-highlight` rendering + PDF download button.

#### Pillar 3: Marketing Content Pipeline (Report #3)

- `publish_tistory` — Tistory Open API v1 `POST /apis/post/write`; markdown → HTML via `marked` npm; params: title, visibility (0=private/3=public), category, tags, scheduled_at; credential: `tistory_access_token`
- `publish_x` — X API v2 via `twitter-api-v2` npm (254+ project users, TypeScript); tweet/thread/image attach; credential: `x_api_key`, `x_api_secret`, `x_access_token`, `x_access_secret`; **requires X API Basic plan ($200/month, 3,000 tweets/month)**
- `publish_youtube` — YouTube Data API v3 `videos.insert`; Shorts support (9:16 + ≤60s + #Shorts); thumbnail (`thumbnails.set`); credential: `google_oauth_refresh_token`
- `generate_video` — Replicate Kling v2.6 (`kwaivgi/kling-v2.6`); image→video, text→video; 9:16 aspect; ~$0.029/second; credential: `replicate_api_token`
- `generate_card_news` — HTML template → Puppeteer screenshot → `sharp` npm optimized PNG (1080×1080px per card, 5–8 cards per carousel)
- `compose_video` — Remotion (`remotion @remotion/cli @remotion/renderer`, 21,000+ ★) via CLI-Anything bridge; React-based programmatic video; renders in 2–5 minutes for 30-second output. **Async job pattern required** — `compose_video` must return a job_id and poll/webhook rather than blocking the agent session (60s E2E NFR incompatible with synchronous render)
- `upload_media` — Cloudflare R2 upload (S3-compatible, `@aws-sdk/client-s3`); returns public URL; required by `publish_instagram` and `publish_youtube`; credential: `r2_account_id`, `r2_access_key_id`, `r2_secret_access_key`
- `content_calendar` — CRUD for `content_calendar` table (platform, content_type, topic, status workflow: idea→scripted→produced→scheduled→published, assigned_agent_id, scheduled_at)
- `publish_daum_cafe` — Daum Cafe has no official API; implemented via Playwright MCP browser automation (login → write page → form fill → submit); P3 priority, unstable
- **`publish_instagram` (refactor)** — Upgrade existing tool: add carousel (up to 10 images, `upload_media` public URLs required) + Reels support via Instagram Graph API; business account + Facebook App mandatory; Rate limit: 25 API calls/hour

#### Pillar 4: Web Data Acquisition (Report #7)

- `read_web_page` — Jina Reader: `fetch('https://r.jina.ai/{url}')` → clean markdown; zero npm packages; free unlimited (API key optional for higher rate limits); 29 languages; 7-second average
- `web_crawl` — Firecrawl API via `@mendable/firecrawl-js` npm (85,000+ ★); modes: `scrape` (single URL), `crawl` (site-wide, up to 100,000 pages/month on Growth $99/month), `map` (sitemap extraction); also available as `firecrawl-mcp` MCP server (12 tools including `deep_research`, `extract`, `batch_scrape`)
- `crawl_site` — Crawlee (`npm: crawlee`, 16,000+ ★, Apache 2.0) via CLI-Anything MCP bridge (`HKUDS/CLI-Anything`, 13,242 ★); supports CSS selector extraction, site-wide crawl (100+ pages), change monitoring. **Risk: CLI-Anything is validated mainly for C/C++/Python software, not TypeScript/Node.js. Crawlee CLI generation quality must be validated before marking as confirmed deliverable. Fallback: manual thin TypeScript wrapper around Crawlee API (code pattern in Research #7 section 5.1).** P2 priority.

#### MCP Server Infrastructure (Report #4)

**⚠️ Architecture Note — Epic 15/D17 Engine Path Change:**
Research doc #04 was written when `agent-loop.ts` used `query({ mcpServers })` from the Claude Agent SDK. Epic 15 (D17) fully rewrote `agent-loop.ts` to `messages.create()` because `query()` Path A is incompatible with `cache_control`. `messages.create()` is a raw Anthropic API call and does **not** have a native `mcpServers` parameter.

**Proposed MCP integration pattern for `messages.create()` engine (replaces `createSdkMcpServer()`):**

```
agent-loop.ts MCP loading sequence (for each agent session):
1. SPAWN: start each enabled MCP server as child_process.spawn(command, args, { env })
   — env values: {{credential:key}} placeholders replaced with DB-resolved values before spawn
2. DISCOVER: send JSON-RPC `tools/list` request over stdio/SSE → receive MCP tools schema list
3. MERGE: convert MCP tools to Anthropic tool format → merge into `tools[]` param of messages.create()
   — MCP tool names namespaced: "notion__create_page", "playwright__click", etc. (prevents collisions)
4. EXECUTE: when messages.create() returns tool_use block for MCP-namespaced tool:
   → route call to the corresponding MCP server via MCP client JSON-RPC `tools/call`
   → receive MCP server response
5. RETURN: inject MCP tool result as tool_result block in next messages.create() call
6. TEARDOWN: terminate MCP child processes at session end (or keep alive for session reuse)
```

This is the "manual MCP integration" pattern — more implementation work than the SDK-abstracted `query()` path, but architecturally compatible with `messages.create()` + `cache_control`. The DB schema and credential model remain identical; only the runtime loading mechanism changes.

**Architecture phase must validate:** (a) stdio vs SSE transport per MCP server config, (b) whether MCP process lifecycle is per-session or per-agent, (c) how credential-scrubber PostToolUse hook intercepts MCP tool_result blocks returned through this path (not the builtin tool handler pipeline).

DB schema:
- `mcp_server_configs` table (company_id, name, display_name, transport VARCHAR(10): 'stdio'|'sse'|'http', command, args JSONB, env JSONB, enabled)
- `agent_mcp_access` table (agent_id + mcp_config_id permission matrix)

Credential injection: `{{credential:key_name}}` in env JSONB → resolved to actual value from `credentials` table at runtime by `agent-loop.ts` **before** `child_process.spawn`. If key not found in credentials table → abort MCP spawn with typed `AGENT_MCP_CREDENTIAL_MISSING` error (no silent literal-string passthrough; required by NFR: 블랙박스 에러 0건).

Priority MCP servers (Phase 2):
| MCP Server | Stars | Tools | Install |
|-----------|-------|-------|---------|
| Notion (official) | 4,000 | 22 | `npx -y @notionhq/notion-mcp-server` |
| Playwright (MS) | 28,600 | browser | `npx -y @anthropic-ai/mcp-playwright` |
| GitHub (official) | 27,800 | repo/issues | `npx -y @modelcontextprotocol/server-github` |
| Firecrawl | 5,700 | 12 | `npx -y firecrawl-mcp` |
| Google Workspace | 1,800 | 50+ | `uvx workspace-mcp` |
| Bright Data | free 5k/mo | 4 | `npx -y @brightdata/mcp` |

Agent-tier access control: Workers — no MCP access by default; Specialists — department-relevant MCPs; Managers — all department MCPs.

### Key Differentiators

**1. Capability consolidation over a fragmented SaaS stack**

| Capability | SaaS Replacement | CORTHEX Tool |
|-----------|-----------------|--------------|
| Instagram auto-posting | Predis.ai $59/mo | `publish_instagram` (refactor) |
| Video clipping | Opus Clip $15/mo | `generate_video` + `compose_video` |
| Web research | Perplexity Pro $20/mo | `read_web_page` + `web_crawl` |
| Presentation gen | Gamma $8/mo | `save_report` + `md_to_pdf` |
| Multi-platform scheduling | Buffer $30/mo | `content_calendar` + publish tools |

**Total SaaS replaced: $127–150/month per team.** Note: the value is capability consolidation on one platform — agents can chain these capabilities autonomously, which SaaS tools cannot do.

**Honest TCO (per organization, not per team):**

| Cost Item | Without X Publishing | With X Publishing (Basic) |
|-----------|---------------------|--------------------------|
| Claude API (10 agents, 500 calls/day, with caching) | $30/mo | $30/mo |
| Replicate images (~500 images/mo) | $20/mo | $20/mo |
| Replicate video (~500 seconds/mo) | $15/mo | $15/mo |
| Cloudflare R2 | $2/mo | $2/mo |
| X API Basic | $0 | **$200/mo** |
| **Total infrastructure** | **$67/mo** | **$267/mo** |
| **Per team (if 5 teams share)** | **$13.40/team** | **$53.40/team** |

X API cost dominates the publishing infrastructure. Teams that do not require Twitter/X publishing should disable `publish_x` and use infrastructure at $67/month (54–65% cheaper than the SaaS stack). Teams requiring X publishing should evaluate whether 3,000 tweets/month ($200) justifies vs. the SaaS approach.

**2. Full pipeline autonomy with agent handoffs**

```
marketing director → "이번 주 콘텐츠 만들어"
  → copywriter: search_web + read_web_page → 2,000-word Tistory article
  → designer: generate_card_news (8 cards, 1080×1080px each)
  → publisher: publish_tistory + publish_instagram (carousel) + publish_x (thread)
  → reporter: save_report(distribute_to: ['web_dashboard', 'notion'])
```

One natural language command, zero human completion steps. This pipeline is enabled by the combination of publishing tools + `call_agent` handoffs + `content_calendar` status tracking.

**3. Multi-tenant credential security (enterprise-ready)**

All API keys stored in company-isolated `credentials` table. MCP server configs reference keys via `{{credential:key_name}}` — never hardcoded. Values are injected at runtime and scrubbed from MCP output by `@zapier/secret-scrubber` PostToolUse hook. Missing credentials abort with a typed AGENT_ error (no silent failures). Agent-tier isolation: Workers → no MCP; Specialists → department MCPs; Managers → all department MCPs.

**4. Korean platform native support**

Dedicated tools for Korea-specific platforms: `publish_tistory` (Tistory Open API), `publish_daum_cafe` (Playwright automation for no-API platform). Korean font support in PDF generation (`fonts-noto-cjk` in Dockerfile). Korean OCR via Claude multimodal vision. Korean web crawling via Bright Data MCP (proxy rotation, ranked #1 in 2026 web extraction benchmark, Naver-compatible).

**5. Extensible MCP architecture with admin-managed servers (Phase 1 foundation)**

The `mcp_server_configs` table + `/admin/mcp-servers` UI allows any MCP server to be added without code changes — admin configures name, transport, command, args, env, and assigns to agents via checkbox matrix.

> **Phase 2 Roadmap (not current scope):** Activepieces (280+ services as MCP, 21,200+ ★) and Pipedream (2,500 APIs, 8,000+ tools) integration would expand the MCP marketplace to near-universal service coverage. Scope post-Phase 2 Architecture review.

---

## Target Users

### Primary Users

#### Persona 1: 김지은 (Ji-eun Kim) — "AI Org Operator" / Non-developer Admin

**Background:** Operations manager / founder-adjacent role at a 20–50 person SME. Law or business degree, non-developer. Has been using CORTHEX for 3–6 months — successfully built an AI org chart with a marketing department (Marketing Director + Copywriter + Designer + Publisher agents) and a research department (CIO + Research Analyst + Market Monitor agents). Comfortable with the Hub UI and NEXUS org editor.

**Role in CORTHEX:** `Admin` permission level. Designs the AI org, edits Souls, assigns tools. The person who decides which agents get which capabilities.

**Current Pain (Tool Integration specific):**
Her agents are productive writers and analysts, but they hit a wall at execution. Every week, the same frustrating handoff: marketing director agent produces 5 polished Tistory articles and 5 Instagram carousel scripts — then she has to copy-paste each article into Tistory manually, design the carousel images in Canva manually, post to Instagram manually, and update the content calendar in Notion manually. This takes 2–3 hours every Friday that her agents theoretically completed in 30 minutes. She's paying for Predis.ai ($59/month), Buffer ($30/month), and Perplexity Pro ($20/month) in addition to CORTHEX.

**What she wants from Tool Integration:**
- Add `tistory_access_token` once → marketing agent publishes forever, no human touch
- Add `instagram_access_token` once → carousel agent uploads 8-image carousels automatically
- Configure Notion MCP once → reports auto-appear in her Notion workspace
- Never touch individual posts again — just review the weekly Notion summary report

**Interaction with Tool Integration features:**
1. **Admin Panel → Credentials:** Pastes Tistory OAuth token, X API keys, Instagram Graph API token, Replicate API key. One-time per platform.
2. **Admin Panel → Agents → [Marketing Director] → Tools:** Toggles on `publish_tistory`, `publish_x`, `generate_card_news`, `upload_media`, `content_calendar`. 5 checkboxes.
3. **Admin Panel → MCP Servers:** Adds Notion MCP config (name: notion, command: npx, args: [-y, @notionhq/notion-mcp-server], env: NOTION_TOKEN → credential:notion_integration_token). Tests connection.
4. **Hub:** Types "이번 주 마케팅 콘텐츠 만들어줘" and goes to lunch.
5. **Admin Reports page:** Returns to see 5 published Tistory URLs, 5 Instagram post URLs, 5 X threads live, and a Notion-synced weekly content report.

**Aha! Moment:** The first Friday when she comes back from lunch and the weekly Notion report is already there — 5 articles published, 5 Instagram carousels posted, 5 X threads live. She didn't touch any of it. *"지난주에 3시간 걸렸던 게 오늘은 0분이었다."*

**Emotional payoff:** "내 AI 팀이 드디어 끝까지 해낸다." (My AI team finally completes the whole job.)

---

#### Persona 2: 박현우 (Hyun-woo Park) — "Platform Integrator" / Technical Admin

**Background:** Full-stack developer or DevOps engineer at the same company as 김지은, or freelance tech admin managing CORTHEX for a client. Comfortable with terminal, OAuth flows, Dockerfile, API docs. Has already set up the CORTHEX server deployment.

**Role in CORTHEX:** `Admin` (technical) — handles infrastructure, credentials security, MCP server lifecycle, Dockerfile updates. Translates platform API documentation into CORTHEX credential registrations.

**Current Pain (Tool Integration specific):**
When 김지은 asks him to "add Instagram posting to the agents," he has no structured way to do it. He could add env vars to the Dockerfile, but then they're not per-company, not audited, and visible in logs. He'd have to write custom tool handlers from scratch or maintain a separate n8n instance. MCP servers he's found are interesting but there's no way to assign them per-agent with proper credential injection.

**What he wants from Tool Integration:**
- A `/admin/mcp-servers` UI where he can add MCP server configs without code changes
- Credential storage that is isolated per company, auditable, and never appears in logs (credential-scrubber hook)
- Dockerfile documentation for Chromium/Puppeteer (md_to_pdf + generate_card_news require headless Chrome)
- Clear error messages when an API credential is wrong or expired — `AGENT_MCP_CREDENTIAL_MISSING` error type, not a silent failure

**Interaction with Tool Integration features:**
1. **Dockerfile:** Adds `chromium + fonts-noto-cjk` lines per documentation (required for md_to_pdf and generate_card_news on ARM64 VPS)
2. **Admin Panel → Credentials → Add:** Registers `firecrawl_api_key`, `replicate_api_token`, `r2_account_id`, `r2_access_key_id`, `r2_secret_access_key` — one per row with masked display
3. **Admin Panel → MCP Servers:** Configures Firecrawl MCP (npx firecrawl-mcp), Playwright MCP (npx @anthropic-ai/mcp-playwright), Notion MCP — verifies connection status indicator shows green
4. **Admin Panel → Agent MCP Access matrix:** Grants Research Analyst agent access to Firecrawl MCP, Marketing Publisher access to Playwright MCP. Grid of checkboxes, no code.
5. **Monitoring:** Checks agent error logs when 김지은 reports "보고서가 안 나와" — finds `AGENT_MCP_CREDENTIAL_MISSING: notion_integration_token` in error log, re-registers the expired Notion token in 2 minutes.

**Aha! Moment:** Adds Google Workspace MCP from the admin panel in 4 minutes — no code deployment, no Dockerfile change. 50+ tools (Gmail, Drive, Calendar, Docs) are immediately available to any agent he assigns. *"코드 한 줄 안 썼는데 에이전트한테 구글 워크스페이스가 붙었다."*

**Emotional payoff:** "MCP 붙이는 게 설정이지 개발이 아니다." (MCP integration is configuration, not development.)

---

### Secondary Users

#### Persona 3: 이수진 (Su-jin Lee) — "AI Campaign Director" / Marketing Team Lead

**Background:** Marketing manager or team lead. Not a CORTHEX admin — she uses the Hub as a `Human` role user. She gives her marketing AI agents high-level campaign directives and reviews outputs. Has a background in content marketing and social media.

**Role:** Directs the marketing AI agent team through natural language commands in the Hub. Does not configure tools or credentials. Relies on the AI publishing pipeline being set up by 김지은 (Admin).

**Current Pain:** Even though agents write excellent content, she still has to be the "publish button." Weekly content review consumed 30–40% of her Friday, all manual publishing.

**Value from Tool Integration:** She moves from content publisher to content director. Her Hub conversations now end with "게시 완료 — 5개 블로그, 5개 인스타 카루셀, 5개 X 스레드 발행됨" instead of "콘텐츠 초안 완성됨, 직접 게시해주세요."

**Key touchpoints:**
- Hub: "이번 주 LeetMaster 프로모션 콘텐츠 캠페인 만들어줘"
- Reports page (`/reports` read-only, Human-accessible non-admin route): Views published content summary
- content_calendar tool output: Tracks idea → scripted → produced → published status across platforms

**Completion notification:** After the publishing pipeline completes, she receives a Hub message from the agent: *"블로그 5개, 인스타 3개 카루셀, X 스레드 5개 발행 완료 — Notion 콘텐츠 캘린더 업데이트됨."* She reviews, and that's it.

**Success metric:** Reduces her manual publishing time from 2–3 hours/week to 10 minutes/week (reviewing Notion summary report).

---

#### Persona 4: 최민준 (Min-jun Choi) — "Intelligence Consumer" / Research + Business Planning User

**Background:** Individual investor (like "투자자 이사장" from PRD) or business planning analyst. Uses CORTHEX research agents heavily — CIO + Market Analyst + News Monitor. Non-developer, but sophisticated AI user. Wants finished, shareable deliverables — not raw agent output.

**Current Pain:** Research agents analyze well but cannot crawl live web data on their own (no `read_web_page`, no `web_crawl`), cannot produce a formatted PDF to email to stakeholders, cannot save reports to his Notion workspace. He has to manually copy agent analysis into a Word doc and format it.

**Value from Tool Integration:**
- Research agent now crawls competitor websites directly (`web_crawl` with Firecrawl)
- Analysis is auto-saved as `pdf_email` report: formatted A4 corporate-style PDF emailed to stakeholder list
- Report saved to Notion with `save_report(distribute_to: ['notion', 'pdf_email'])`
- Scanned contract PDFs analyzed via `ocr_document` → agent extracts key clauses without manual retyping

**Key touchpoints:**
- Hub: "경쟁사 3곳 가격 분석하고 PDF 보고서로 이메일 발송해줘"
- Email inbox: Receives branded PDF report (corporate CSS, Pretendard font, table of competitor prices)
- Notion: Report auto-appears in "AI Reports" database with date, author (agent name), and tag

**Success metric:** Time from "경쟁사 분석해줘" to shareable PDF in stakeholder inbox: 4 minutes (was 2 hours manual).

---

#### Persona 5: CEO 김대표 (Dae-pyo Kim) — "1인 사업가" / Solo Operator (PRD Primary Persona)

> **PRD Persona Mapping:** CEO 김대표 is the PRD's #1 primary persona. 김지은 (Persona 1) covers the Admin setup role; CEO 김대표 represents the *solo operator* who IS the admin, the Hub user, and the report consumer simultaneously. In small companies, Persona 1 and Persona 5 may be the same person.

**Background:** Solo business owner (1인 사업가). Runs investment analysis, marketing, and system administration alone. Non-developer — cannot write code, cannot configure APIs directly. Has 1–3 agents total. Uses CORTHEX to replace a full team. Does not want to think about tools or credentials — delegates everything, sees only results.

**Role in CORTHEX:** `Admin` (because he is the only person), but interacts primarily as a Hub command user and report consumer.

**Current Pain (Tool Integration specific):**
His agents analyze well and produce draft reports, but every output is a raw markdown text in the Hub. He has to copy it into a Word doc, format it, attach it to an email, and send it manually. He also cannot get his agents to post on his blog or X account without him doing it manually afterward. The "almost there" gap consumes 1–2 hours per day.

**What he wants from Tool Integration:**
- Instruct an agent once: "매주 금요일 오전 9시에 경쟁사 보고서 PDF로 이메일해줘" → it happens forever, autonomously
- See polished outputs: branded PDF arriving in his email inbox, not raw markdown in a chat window
- Zero configuration after initial setup: paste credentials once, never touch them again

**Value from Tool Integration:**
- `save_report(distribute_to: ['pdf_email'])` — agent emails him a branded A4 PDF report; he forwards to investors or clients directly
- `publish_tistory`, `publish_x` — content agent publishes to his blog and X account; he reviews from Hub notification
- Notion MCP — all reports auto-organize into his Notion workspace, indexed by date and topic

**Aha! Moment:** Wakes up Friday morning to find a formatted competitive analysis PDF already in his email — sent by his research agent at 7am per ARGOS schedule, while he was sleeping. Forwards it to a potential investor without editing a word. *"에이전트가 나 대신 보고서를 보냈다."*

**PRD note:** CEO 김대표 drives the `pdf_email` distribution feature and the ARGOS-scheduled report pipeline. His persona is the primary validation that the Tool Integration pipeline works end-to-end from no-human-touch input to polished output delivery.

---

#### Persona 6: 팀장 박과장 (Gwa-jang Park) — "Team Manager" / Multi-Agent Governance (PRD Standalone Persona)

> **PRD Persona Mapping:** 팀장 박과장 is listed explicitly in the PRD as a distinct primary persona. "팀원 10명에게 AI 제공하고 싶지만 비용 통제·표준화 안 됨." He manages 10+ Human staff users who each use AI agents — and his primary Tool Integration concern is governance, not operation.

**Background:** Department manager or team lead at a mid-size company (50–200 employees). 10+ team members have CORTHEX Human-role accounts. He is an Admin. Has delegated day-to-day AI usage to team members, but is accountable for the tool costs and security posture.

**Role in CORTHEX:** `Admin` — manages which agents exist, which tools they have, which teams can use what. Does not build agent Souls himself. Does approve or deny tool access requests from 김지은-type operators.

**Current Pain (Tool Integration specific):**
- If all 10 team members' agents can use `publish_x` (X API Basic: $200/month), who pays and who decides? There's no governance layer.
- His marketing team's agents should have `publish_tistory` + `publish_instagram`. His research team's agents should have `web_crawl` + `read_web_page`. They should NOT share credentials or cross-assign tools.
- He cannot audit which agent called which tool last week, or how many Firecrawl API credits the marketing team consumed.

**What he wants from Tool Integration:**
- Per-department tool budgets: Marketing dept gets `publish_*` tools; Research dept gets `web_crawl` + `search_web`. Neither can access the other's tool set.
- Cost visibility: "How many Firecrawl credits did Research agents use this month?" answered from admin panel.
- Approval workflow: When 김지은 wants to enable `publish_x` (which costs $200/month),박과장 gets a notification and approves or denies before it's live.

**Tool Integration stories owned by this persona:**
- Per-department tool access control matrix (which dept gets which tools)
- Tool usage audit log (agent, tool, timestamp, result) visible to Admin
- X API cost governance (gating $200/month decisions behind manager approval)
- Credential isolation: marketing dept cannot see research dept credentials

**Aha! Moment:** Checks the admin audit log and sees exactly which agents published how many posts to which platforms in the past 30 days. Approves `publish_x` for marketing team for one month, then reviews the usage report before renewing. *"내가 어떤 AI가 어디에 뭘 올렸는지 다 보인다."*

---

### Tertiary Users (Non-Login Stakeholders)

#### External Report Recipient — Board Member / Investor / Client

Not a CORTHEX user. Receives a branded A4 PDF emailed by a CORTHEX research agent via `save_report(distribute_to: ['pdf_email'])`. Never logs in, has no CORTHEX account. Interacts only with the output.

**Why this persona matters for Tool Integration:**
- Their judgment of the PDF quality (formatting, font, layout, content accuracy) is the downstream validation of `md_to_pdf` correctness
- The corporate CSS preset choice, Pretendard font embedding, and page-break rules in `md_to_pdf` all exist to serve this person's expectations for a board-ready PDF
- If the PDF looks unprofessional, CEO 김대표's credibility with investors suffers — not CORTHEX's UX, but CORTHEX's business value

**What they need from the PDF output:** Clean A4 pagination, legible Korean typography (Pretendard, 11pt body), no markdown artifacts (no raw `##` or `---`), accurate tables and charts, company logo in header.

---

### PRD Persona Alignment Map

| PRD Persona | Product Brief Equivalent | Coverage | Notes |
|-------------|--------------------------|----------|-------|
| CEO 김대표 (1인 사업가) | Persona 5 (CEO 김대표) | ✅ | Added — solo operator, report consumer |
| 팀장 박과장 (team manager) | Persona 6 (팀장 박과장) | ✅ | Added — per-dept tool governance |
| Admin (시스템 관리자) | Persona 1 (김지은) + Persona 2 (박현우) | ✅ | Split into non-dev operator + technical admin |
| 투자자 이사장 | Persona 4 (최민준) | ✅ | Intelligence consumer with PDF distribution needs |
| External PDF recipient | Tertiary (board member) | ✅ | Non-login stakeholder; drives md_to_pdf spec |

---

### User Journey: Primary Setup Path (김지은 — First Tool Configuration)

| Stage | Action | Time | Touchpoint |
|-------|--------|------|------------|
| **Discovery** | Notices agents write Tistory posts but can't publish them. Sees "publish_tistory" in tool docs. | 0 | Admin Panel tool reference |
| **Platform Token Acquisition** | *External, one-time per platform.* Creates Tistory Developer App → gets OAuth token. For Instagram: Facebook Business Manager + Instagram Business Account + Graph API token. For X: applies for X API Basic ($200/mo). **This step is entirely outside CORTHEX and takes 15–60 min per platform on first setup.** | 15–60 min (external) | Tistory / Meta / X developer consoles |
| **Credential Paste** | Admin → Credentials → Add → pastes pre-obtained tokens into CORTHEX credential store (one row per platform). Masked display, audit-logged. | 5 min | `/admin/credentials` |
| **Tool Assignment** | Admin → Agents → [마케팅 부서장] → Tools → toggles publish_tistory ON. *Note: In production, publish tools belong to specialist publisher agents, not the Director — Director delegates via call_agent (see Step-02 pipeline architecture). This journey uses a single agent for simplicity.* | 2 min | `/admin/agents/{id}/tools` |
| **First Use** | Hub: "블로그 글 하나 작성하고 발행해줘" → agent writes + publishes → returns Tistory URL | 3 min | Hub chat |
| **Scale** | Adds Instagram, X, generate_card_news, upload_media tools to publisher agent | 5 min | `/admin/agents/{id}/tools` |
| **MCP Setup** | Admin → MCP Servers → Add Notion MCP → Test (connection health check; *Architecture phase must specify: synchronous subprocess spawn vs. async job queue + poll*) → Assign to reporter agent. **4 min if Notion integration token is already created. ~20 min for first-time Notion setup** (create Notion Internal Integration → copy token → grant page access in Notion UI — external, non-developer unfamiliar). | 4–20 min | `/admin/mcp-servers` |
| **Routine** | Every Monday: "이번 주 콘텐츠 캠페인 실행해줘" — agent team handles everything | 0 min human | Hub chat |

**Total CORTHEX onboarding time: ~15–20 minutes in-app. Platform token acquisition (external, one-time): 15–60 min per platform. Weekly hands-on time after setup: ~10 minutes (reviewing reports).**

---

### User Journey: Power Use (최민준 — Research + Report Pipeline)

```
최민준 → Hub: "삼성·LG·애플 3사 AI 제품 경쟁사 분석 보고서 PDF로 이메일해줘"

[Research Agent]
  → read_web_page(url: "https://samsung.com/ai") × 3 sites
  [Tool internally prepends r.jina.ai/ — agent passes raw target URL only]
  → web_crawl(mode: 'scrape', url: competitor pricing pages)
  → search_web("삼성 LG 애플 AI 기능 2026 비교")

[Analysis]
  → agent writes structured markdown analysis (competitor matrix, pricing table, feature comparison)

[Output]
  → save_report(
      title: "AI 제품 경쟁사 분석 2026-03-14",
      type: 'analysis',
      distribute_to: ['pdf_email', 'notion'],
      tags: ['competitive-intelligence', 'AI-products']
    )
    → md_to_pdf(style: 'corporate') → 12-page A4 PDF
    → send_email(to: stakeholder list, attachment: PDF)
    → Notion MCP create_page → report in "AI Reports" Notion DB
    [Partial failure contract: report is saved to DB first, then distributed. If send_email fails (network error),
     agent receives partial-success response with failed channel listed. Notion save is not rolled back.
     Architecture phase must specify retry behavior — open item.]

Total wall time: ~4 minutes
Human time invested: 30 seconds (typing the request)
```

---

---

## Success Metrics

> Metrics are organized by measurement layer: **Adoption** (are users discovering and using the feature?), **Performance** (is it working correctly at the technical level?), **Business Outcome** (is it delivering the value promised in the Core Vision?), and **Guardrails** (signals that tell us something is broken before users complain).

---

### Layer 1: Adoption Metrics

| Metric | Definition | Phase 1 Target | Measurement Method |
|--------|------------|----------------|--------------------|
| **Tool activation rate** | % of companies that have at least 1 built-in tool toggled ON for at least 1 agent | ≥60% of active companies within 30 days of Phase 1 release | DB query: `SELECT COUNT(DISTINCT company_id) FROM agents WHERE jsonb_array_length(allowed_tools) > 0` (`agents.allowed_tools JSONB` per D7 — no separate `agent_tools` table) |
| **MCP server registration rate** | # of MCP server configs added per company (mean) | ≥1 MCP per company within 60 days | DB: `mcp_server_configs` table row count per company |
| **Credential registration count** | # of distinct credential keys registered per company (mean) | ≥3 credentials per company within 30 days | DB: `credentials` table, distinct keys per company |
| **Tool diversity index** | # of distinct tools called across all agent runs per company per week | Week 1: ≥3 distinct tools / Week 4: ≥6 distinct tools | Tool call log aggregation |
| **Pillar 3 (publishing) adoption** | % of companies with at least one `publish_*` tool call in a 7-day window | ≥30% within 60 days of Phase 1 release | Tool call log filter: tool_name LIKE 'publish_%' |

---

### Layer 2: Performance Metrics (Technical SLAs)

| Metric | Definition | Target | Alert Threshold |
|--------|------------|--------|-----------------|
| **Tool call success rate** | % of tool calls that return a non-error result | ≥95% per tool per 7-day rolling window | <90% for any single tool → PagerDuty alert |
| **`md_to_pdf` p95 latency** | 95th percentile render time for PDF generation | <10 seconds (single-page), <20 seconds (10-page) | >30 seconds → flag for Puppeteer concurrency review |
| **`read_web_page` p95 latency** | 95th percentile response time including Jina Reader fetch | <8 seconds | >15 seconds → Jina Reader degradation alert |
| **`web_crawl` p95 latency** | 95th percentile for Firecrawl scrape mode | <12 seconds | >25 seconds → Firecrawl quota check |
| **MCP tool discovery latency** | Time from SPAWN to DISCOVER (JSON-RPC tools/list response) | <3 seconds for Notion MCP, <5 seconds for Playwright MCP *(warm start, package pre-cached)*. Cold start (`npx -y` first run downloads package: 10–30 seconds) — pre-warming strategy to be defined in Architecture phase. | >10 seconds warm → subprocess spawn timeout alert |
| **`call_agent` handoff chain E2E** | Total wall time from Hub command to final agent response, including all `call_agent` handoffs between agents | <60 seconds (PRD NFR-P6) — governs agent-to-agent delegation chains only | >90 seconds → engine bottleneck review |
| **Multi-tool single-agent pipeline** | Wall time for a single agent running multiple tools sequentially (e.g., 3× `read_web_page` + `web_crawl` + `md_to_pdf` + `send_email`) | NOT governed by 60s NFR — see Layer 3 per-pipeline targets (≤4 min simple / ≤5 min competitive analysis). 60s NFR applies to `call_agent` chains only. | See Layer 3 targets |
| **`ocr_document` p95 latency** | 95th percentile for Claude Vision API document analysis | <8 seconds (single image / 1-page PDF), <20 seconds (10-page scanned PDF) | >30 seconds → flag for document chunking review |
| **Credential-scrubber coverage** | % of tool results containing no raw API key values in output (pattern-matched against registered credential values) | 100% | Any raw API key value in tool output → P0 security incident. Note: `{{credential:key}}` template literal in output = config failure (credential not injected before tool execution) → HIGH bug, not P0 security incident |
| **`AGENT_MCP_CREDENTIAL_MISSING` rate** | % of MCP tool calls that fail with credential-missing error | <2% per week (after initial setup period) | >10% → admin notification: "Credential may have expired" |

---

### Layer 3: Business Outcome Metrics

These map directly to the personas' success metrics and the Core Vision's value claims.

| Metric | Persona | Baseline (pre-feature) | Target (post-Phase 1) | Measurement |
|--------|---------|------------------------|----------------------|-------------|
| **Human publishing time/week** | 이수진 (Marketing Team Lead) | 2–3 hours/week manual publishing | ≤10 minutes/week (review only) | User survey + Hub session duration analysis |
| **Time-to-PDF from hub command** | 최민준 (Intelligence Consumer) | ~2 hours (manual research + Word formatting) | ≤4 minutes (automated pipeline) | Tool call log: timestamp from first tool call to `send_email` completion |
| **Weekly report automation rate** | CEO 김대표 (1인 사업가) | 0% automated (all manual) | ≥80% of weekly reports delivered without human touch (ARGOS-scheduled) | ARGOS scheduled run completion log **AND** `save_report(distribute_to includes 'pdf_email')` success event within same `run_id` — ARGOS completion alone does not confirm email delivery |
| **SaaS substitution proxy** | 김지은 (AI Org Operator) | 0 companies with publishing credentials + ≥10 successful `publish_*` calls in 30 days | ≥40% of companies with `instagram_access_token` OR `tistory_access_token` registered AND ≥10 successful `publish_instagram`/`publish_tistory` calls in 30 days | DB: credential key EXISTS + tool call log count. *Qualitative supplement: customer interview on SaaS cancellations at 90-day mark — not primary measurement (no CORTHEX visibility into external billing).* |
| **Competitive analysis pipeline time** | 최민준 | 2 hours manual | ≤5 minutes automated (3 sources × 2 tools = 6 tool calls; Journey 2 pattern). *Note: ≤4 min target (Layer 3 row 2) = simple pipeline with 1 source. ≤5 min = competitive analysis with 3 sources × read_web_page + web_crawl each.* | Tool call duration log per pipeline pattern |

---

### Layer 4: Guardrail Metrics (Leading Failure Indicators)

| Signal | What It Indicates | Action |
|--------|-------------------|--------|
| **Tool error rate spike (>10% in 1 hour)** | Platform API outage (Firecrawl, Tistory, X API, Replicate) or credential expiry | Auto-alert admin: "Tool X may have a configuration issue"; surface `AGENT_MCP_CREDENTIAL_MISSING` if credential-related |
| **`md_to_pdf` OOM errors** | Concurrent Puppeteer instances exhausting ARM64 RAM (24GB VPS constraint; each ~200MB) | Architecture-phase concurrency limit enforcement; queue if >N concurrent |
| **MCP server zombie processes** | TEARDOWN step (step 6 of Manual MCP Integration Pattern) failed → child processes not terminated | Process monitor: flag if MCP child process exceeds session end + 30 seconds |
| **Credential `{{template}}` literal appearing in tool output** | Template injection not resolved before tool execution — configuration failure (credential key not registered or typo in key name). Distinct from P0 security incident (actual API key value exposure, covered by Layer 2 scrubber metric). | HIGH bug: log error `CREDENTIAL_TEMPLATE_UNRESOLVED: key_name`; block tool call; surface as admin config error. Not a P0 security incident — no real credential value is exposed. |
| **`compose_video` job queue depth >10** | Remotion render jobs queuing faster than workers process (2–5 min per video) | Scale Remotion workers or alert admin: "Video generation queue is backed up" |
| **`compose_video` async job timeout** | Single Remotion render job exceeds 15 minutes without completing | Return `TOOL_TIMEOUT: compose_video` error to agent with `job_id` for status poll. Architecture phase must define max retry count and worker failure mode. |
| **`web_crawl` Firecrawl credit exhaustion** | Firecrawl Growth plan limit (100,000 pages/month) reached | Alert admin when 80% consumed; auto-disable `web_crawl` tool at 100% with error message: `TOOL_QUOTA_EXHAUSTED: firecrawl` |

---

### Metric Collection Requirements (Implementation Note)

The following telemetry infrastructure is needed for these metrics to be measurable. These are **not** Phase 1 UI features — they are backend logging requirements that must be implemented as part of each tool handler:

1. **Tool call event log:** `{ company_id, agent_id, tool_name, started_at, completed_at, success: bool, error_code?: string }` — written by engine hook at each tool_use/tool_result cycle
2. **MCP lifecycle log:** `{ company_id, mcp_server_id, event: 'spawn'|'discover'|'teardown'|'error', timestamp, latency_ms }` — written by MCP integration layer
3. **Pipeline end-to-end timer:** First tool call timestamp → final tool_result timestamp, stored per agent run ID
4. **Credential-scrubber audit:** Log each scrub event (matched pattern, tool name, timestamp) — never log the actual credential value

> All telemetry logs must be isolated per `companyId` (per D20 key format) and must not contain raw credential values.

---

---

## MVP Scope

### Core Features (Phase 1 MVP — In Scope)

Phase 1 delivers the minimum set of capabilities that closes the "capability ceiling at the point of action" — specifically: an agent can now publish content, save a formatted report, and crawl web data without human hand-off. Every Phase 1 item has P0 priority and maps to an Aha! Moment from Step-03 personas.

#### Phase 1 Built-in Tools (7 new)

| Tool | Pillar | Persona Value | Key Dependency |
|------|--------|--------------|----------------|
| `md_to_pdf` | Document Processing | 최민준 receives branded A4 PDF in email | Puppeteer/Chromium in Dockerfile |
| `save_report` | Report Management | CEO 김대표 gets ARGOS-scheduled reports in Notion + email. **Prerequisite: Verify `send_email` supports `attachments: [{filename, content, encoding: 'base64'}]` (binary MIME multipart for PDF attachment). If current `send_email` tool only supports text/HTML body, it must be upgraded as part of `save_report` implementation — without this, Gates 5 and CEO 김대표 Layer 3 metric are permanently unmeetable.** | `md_to_pdf` + `send_email` (attachment-capable) chain |
| `list_reports` | Report Management | Admin can query report history by date/agent/type | `reports` DB table |
| `get_report` | Report Management | Agent retrieves prior reports for continuity | `reports` DB table |
| `publish_tistory` | Marketing Pipeline | 김지은's agent publishes blog posts without human touch. Phase 1 Aha! Moment persona: 김지은 sees first fully-automated Friday publish. | Tistory OAuth token |
| `upload_media` | Marketing Pipeline | **Phase 1 use:** embed images in Tistory posts via public URL. Ships Phase 1 to enable Phase 2 Instagram/YouTube publishing. | Cloudflare R2 credentials |
| `read_web_page` | Web Data Acquisition | Research agent fetches live competitor data | Jina Reader (no API key) |

#### Phase 1 MCP Infrastructure

| Component | What It Delivers | Key Technical Requirement |
|-----------|-----------------|--------------------------|
| **Credential management** | `/admin/credentials` UI — `{{credential:key}}` runtime injection, masked display, audit log, credential-scrubber hook | `credentials` DB table, scrubber hook in engine |
| **MCP server config UI** | `/admin/mcp-servers` — add/edit/delete MCP configs; Manual MCP Integration Pattern (SPAWN → DISCOVER → MERGE → EXECUTE → RETURN → TEARDOWN) | `mcp_server_configs` DB table |
| **Agent MCP access matrix** | Per-agent assignment of MCP server access; no-code grid of checkboxes | Join table: `agent_mcp_access` |
| **Agent tool toggle** | Admin toggles built-in tools ON/OFF per agent via `agents.allowed_tools JSONB` | Extends existing agent edit UI |
| **Error handling** | `AGENT_MCP_CREDENTIAL_MISSING` typed error (no silent passthrough); `CREDENTIAL_TEMPLATE_UNRESOLVED` config error surfaced to admin | Engine hook + admin notification |

#### Phase 1 UI Additions

| Route | Role Access | Purpose |
|-------|-------------|---------|
| `/admin/credentials` | Admin | Credential registration + masked display |
| `/admin/mcp-servers` | Admin | MCP server config lifecycle |
| `/admin/agents/{id}/tools` | Admin | Tool toggle per agent |
| `/admin/reports` | Admin | Report list + PDF download (admin view) |
| `/reports` | Human + Admin | Report read-only view (Human-accessible non-admin route) |

---

### Out of Scope for MVP (Phase 2–4+)

The following are explicitly deferred — they are either dependent on Phase 1 infrastructure or have higher complexity/cost that warrants a separate delivery phase.

#### Deferred to Phase 2 (P1 tools)

| Tool / Feature | Reason for Deferral |
|---------------|---------------------|
| `ocr_document` | P1 — Claude Vision API; valuable but not on the critical path for Phase 1 publishing/reporting pipeline |
| `pdf_to_md` | P1 — MarkItDown MCP; valuable for document ingestion but not blocking Phase 1 value delivery |
| `publish_youtube` | P1 — YouTube OAuth flow complexity; depends on `upload_media` which ships Phase 1 |
| `generate_video` | P1 — Replicate Kling API (~$0.029/sec); requires `upload_media` (Phase 1) as prerequisite |
| `generate_card_news` | P1 — Puppeteer + Sharp pipeline; adds concurrent headless browser pressure; Phase 2 after concurrency limits validated in Phase 1 |
| `content_calendar` | P1 — CRUD table + status workflow; valuable for 이수진 persona but not blocking core publishing |
| `web_crawl` | P1 — Firecrawl API ($99/month Growth plan); Phase 1 covers `read_web_page` (free, Jina Reader) for basic web data needs |
| `publish_x` | **Downgraded from Phase 1.** X API Basic costs $200/month — same free-first deferral logic applied to `web_crawl` applies here: `publish_tistory` covers all Phase 1 publishing Aha! Moments without the $200/month cost barrier. Including X in Phase 1 forces every pilot company to commit $200/month at setup, threatening Gate 4 (≥3 pilot companies <30 min). Note: "Manager approval workflow for `publish_x`" (Persona 6) now deferred alongside this. |
| `publish_instagram` refactor | Phase 2 — Carousel + Reels support; depends on `upload_media` (Phase 1); Instagram Graph API setup more complex than Tistory |
| Notion MCP, Playwright MCP, GitHub MCP | Phase 2 — MCP infrastructure ships Phase 1; specific MCP server templates validated in Phase 2 |

#### Deferred to Phase 3 (P2 tools)

| Tool / Feature | Reason for Deferral |
|---------------|---------------------|
| `compose_video` | P2 — Remotion 2–5 min async render; requires job queue infrastructure not in Phase 1 scope |
| `crawl_site` | P2 — CLI-Anything bridge for Crawlee; TypeScript/Node.js validation risk flagged in Step-02; fallback design needed before production use |
| Google Workspace MCP | Phase 3 — Complex OAuth scopes; 50+ tools; architecture validation needed |

#### Deferred to Phase 4+ (P3 tools)

| Tool / Feature | Reason for Deferral |
|---------------|---------------------|
| `publish_daum_cafe` | P3 — Playwright automation (no official API); brittle by nature; Korean platform only |
| Activepieces / Pipedream | **Phase 2 Roadmap** (post-Architecture review) — 280+ services (Activepieces), 2,500 APIs (Pipedream). Step-02 Key Differentiator #5 canonically labels these "Phase 2 Roadmap." Architecture phase must scope the MCP bridge design before committing to delivery phase. |
| Naver Blog / Kakao MCP | Phase 4+ — Korean platform MCPs; market validation needed before commitment |
| Redis cache for MCP/tool layer | Phase 4 — D21 deferred; current in-memory + DB cache sufficient for Phase 1–3 load |

#### Deferred — Scope Assigned in Architecture Phase

> These features are in the product backlog. They are NOT permanently excluded — Architecture phase will assign them to Phase 2 or Phase 3 epics. Listed here to prevent Phase 1 scope creep.

| Feature | Status |
|---------|--------|
| **Per-department tool access control** (팀장 박과장 persona) | Product backlog. Persona 6 stories exist. Architecture phase assigns Phase 2 or Phase 3 epic. |
| **Manager approval workflow for `publish_x`/expensive tools** | Product backlog (Persona 6 Aha! Moment). `publish_x` itself deferred to Phase 2. Approval notification system — Architecture phase scopes. |
| **Tool usage audit log (admin UI)** | Telemetry backend ships Phase 1 (event log per Step-04). Admin UI to view audit log is Phase 2+. |
| **`agent_mcp_access` schema** | Phase 1 ships the logical feature (per-agent MCP assignment). Architecture phase must define: `agent_mcp_access(agent_id, mcp_server_config_id, company_id, created_at)` — FK constraints, indexes, and cascade deletes TBD. |
| **`compose_video` pre-warming / cold start optimization** | Async job pattern ships Phase 3. Pre-warming strategy deferred to Architecture phase. |
| **MCP server package pre-caching** | Cold start (10–30s) deferred. Phase 1 ships with documented warm-start SLAs only. Architecture phase defines pre-caching strategy. |

---

### MVP Success Criteria (Phase 1 Go/No-Go Gates)

The following conditions must be met before Phase 2 scope begins. All are measurable from Phase 1 telemetry infrastructure.

| Gate | Condition | Measurement |
|------|-----------|-------------|
| **Activation** | ≥60% of active companies have ≥1 tool toggled ON within 30 days of release | `agents.allowed_tools JSONB` non-empty, distinct company_ids |
| **Pipeline completion** | ≥1 successful end-to-end pipeline per active company per week (Hub command → tool execution → published/saved output) | Tool call event log: ≥2 rows with same `agent_id` within a 10-minute window, final row `success=true`. *(Note: Step-04 Metric Collection Requirement #1 schema `{ company_id, agent_id, tool_name, started_at, completed_at, success, error_code }` — add `run_id` field to enable strict pipeline grouping as a retroactive Step-04 enhancement.)* |
| **Reliability** | ≥95% tool call success rate per tool per 7-day rolling window for all Phase 1 tools | Tool call event log, error_code aggregation |
| **Time-to-value** | At least 3 pilot companies complete 김지은's setup journey (credentials + tool toggle + first Hub command) in <30 minutes in-app time | DB: `credentials.created_at` (first credential registered for company) → tool call event log: first `success=true` row for same `company_id`. Delta = time-to-first-successful-tool-call. *(No separate Admin session log — derived from existing Step-04 telemetry fields.)* |
| **Persona value delivery** | ≥1 company achieves 최민준's pipeline: Hub command → `read_web_page` × N → `save_report(distribute_to: ['pdf_email'])` → `send_email` success response, CORTHEX-side total ≤5 min | Pipeline end-to-end timer log. *Boundary: ≤5 min measured to `send_email` success response (CORTHEX system boundary). Actual inbox delivery may add 1–2 min depending on SMTP provider; gate passes if CORTHEX-side pipeline completes within 5 min.* |
| **Security** | 0 raw API key values in agent tool output (credential-scrubber coverage 100%) | Credential-scrubber audit log |

**Go/No-Go Decision:**
- If Activation or Reliability gates fail at 30-day mark: diagnose root cause; fix before Phase 2 investment.
- **If Security gate fails (raw API key value detected in tool output): immediate halt of all agent tool execution; treat as P0 security incident; rollback Phase 1 tool deployment and do not proceed until credential-scrubber is verified at 100% coverage.** Security gate failure blocks Phase 2 regardless of other gate results.

---

### Future Vision (Phase 3–∞)

#### 12-Month Vision: Full Marketing + Research Automation Platform

> *"12-month" = target calendar horizon from Phase 1 release, assuming Phase 2 ships within 3–4 months and Phase 3 within 8–10 months of Phase 1 release. Not a Phase completion count.*

By Phase 2–3 completion, CORTHEX Tool Integration delivers a complete autonomous business operations platform:
- **Full Korean content stack:** Tistory + X + Instagram + YouTube + Daum Cafe — agents manage all publishing channels without human touch
- **Video pipeline:** Replicate Kling (AI video) → Remotion (programmatic video) → YouTube Shorts / Instagram Reels — fully agent-directed
- **Live intelligence:** `web_crawl` (Firecrawl, 100K pages/month) + `crawl_site` (Crawlee deep crawl) → agents self-serve real-time market intelligence
- **Document ecosystem:** `ocr_document` → `pdf_to_md` → analysis → `save_report` → `md_to_pdf` → distribution — full document lifecycle in one agent session

#### 2–3 Year Vision: AI Business OS

If Tool Integration succeeds at Phase 1–3 scale, CORTHEX becomes an AI Business Operating System where:

- **팀장 박과장 vision fulfilled:** Per-department tool governance, cost budgets per team, manager approval workflows — AI tool administration as sophisticated as enterprise SaaS procurement
- **Ecosystem expansion:** Activepieces (280+ services) and Pipedream (2,500 APIs) MCP bridges open CORTHEX agents to any business service — ERP, CRM, accounting, HR, logistics
- **Korean enterprise MCPs:** Naver Blog, Kakao Business, Korea-specific government data APIs — CORTHEX becomes the only AI platform natively fluent in Korean business infrastructure
- **Voice-directed pipelines:** CEO 김대표 speaks one instruction → CORTHEX agents execute a full business workflow across 10+ tools without a single keyboard interaction
- **Tool marketplace:** Community MCP server templates — any technical admin (박현우 persona) publishes a validated MCP template for the CORTHEX ecosystem; non-technical admins install in one click

#### Platform Moat: Compounding Tool Value

Each tool added to a company's CORTHEX org makes every other tool more valuable. A `web_crawl` result feeds `save_report` feeds `md_to_pdf` feeds `send_email` — the compounding value of tool chains is the long-term competitive moat that point SaaS tools cannot replicate.

---

*Document initialized: 2026-03-14 | Step 1: Document Initialization ✅ | Step 2: Vision Discovery ✅ (9/10, v2) | Step 3: Target Users ✅ (9/10, v2) | Step 4: Success Metrics ✅ (9/10, v2) | Step 5: MVP Scope ✅ (9.5/10 + 9/10, v2) | Step 6: Complete ✅ — Product Brief FINALIZED 2026-03-14*
