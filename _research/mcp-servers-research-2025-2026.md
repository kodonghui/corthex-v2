# MCP (Model Context Protocol) Servers - Comprehensive Research
> Researched: 2026-03-11 | Sources: GitHub, npm, smithery.ai, glama.ai, MCP Registry

---

## Table of Contents
1. [Productivity & Office](#1-productivity--office)
2. [Development & Code](#2-development--code)
3. [Search & Research](#3-search--research)
4. [AI & Media](#4-ai--media)
5. [Social Media & Marketing](#5-social-media--marketing)
6. [File & Document](#6-file--document)
7. [Communication](#7-communication)
8. [Finance & Business](#8-finance--business)
9. [Browser Automation](#9-browser-automation)
10. [Database](#10-database)
11. [Aggregators & Meta-Platforms](#11-aggregators--meta-platforms)
12. [Other Notable MCPs](#12-other-notable-mcps)
13. [Korean Platform MCPs](#13-korean-platform-mcps)

---

## 1. Productivity & Office

### 1.1 Google Workspace MCP (All-in-One)
| Field | Detail |
|-------|--------|
| **Package** | `workspace-mcp` (PyPI) |
| **GitHub** | [taylorwilsdon/google_workspace_mcp](https://github.com/taylorwilsdon/google_workspace_mcp) |
| **Stars** | 1,800 |
| **Tools** | 50+ (Gmail, Calendar, Drive, Docs, Sheets, Slides, Forms, Tasks, Contacts, Chat, Apps Script, Custom Search) |
| **Description** | The most feature-complete Google Workspace MCP server. Full natural language control over all Google services. Native OAuth 2.1 support for multi-user deployments. |
| **Install** | `uvx workspace-mcp --tool-tier core` or `.dxt` one-click for Claude Desktop |
| **Official?** | Community (but the most popular) |
| **Language** | Python |
| **Notes** | Supports organization-wide hosting. Requires Google Cloud OAuth credentials. |

### 1.2 Google Sheets MCP
| Field | Detail |
|-------|--------|
| **Package** | N/A (clone & run) |
| **GitHub** | [xing5/mcp-google-sheets](https://github.com/xing5/mcp-google-sheets) |
| **Stars** | 731 |
| **Tools** | Spreadsheet creation, modification, Google Drive integration |
| **Install** | Python + Google API credentials |
| **Official?** | Community |
| **Language** | Python |

### 1.3 Google Docs MCP
| Field | Detail |
|-------|--------|
| **Package** | N/A |
| **GitHub** | [a-bonus/google-docs-mcp](https://github.com/a-bonus/google-docs-mcp) |
| **Stars** | 362 |
| **Tools** | Google Docs, Sheets, Drive operations |
| **Install** | TypeScript + Google API |
| **Official?** | Community |
| **Language** | TypeScript |

### 1.4 Notion MCP Server (Official)
| Field | Detail |
|-------|--------|
| **Package** | `@notionhq/notion-mcp-server` (npm) |
| **GitHub** | [makenotion/notion-mcp-server](https://github.com/makenotion/notion-mcp-server) |
| **Stars** | 4,000 |
| **Tools** | 22 (page CRUD, database queries, comments, users, blocks, search, move) |
| **Description** | Official Notion MCP server. Optimized token consumption. Full Notion API coverage. |
| **Install** | `npx -y @notionhq/notion-mcp-server` or Docker `mcp/notion` |
| **Official?** | YES (by Notion/Makenotion) |
| **Language** | TypeScript |
| **Last Update** | v2.0.0 (Notion API 2025-09-03) |

### 1.5 Slack MCP Server
| Field | Detail |
|-------|--------|
| **Package** | `slack-mcp-server` (npm) |
| **GitHub** | [korotovsky/slack-mcp-server](https://github.com/korotovsky/slack-mcp-server) |
| **Stars** | 1,400 |
| **Tools** | 15 (conversations_history, replies, search, channels_list, reactions, users, usergroups, unreads, mark) |
| **Description** | Most powerful Slack MCP. No extra permissions needed. Supports Apps, GovSlack, DMs, Group DMs. Stealth mode. |
| **Install** | Docker, Go, or npm. Supports Stdio/SSE/HTTP transports |
| **Official?** | Community (but most popular) |
| **Language** | Go |
| **Notes** | Caching for users/channels. Enterprise workspace support. |

### 1.6 Gmail / Email MCP
| Field | Detail |
|-------|--------|
| **Note** | Best covered by Google Workspace MCP (#1.1 above) which includes full Gmail support |
| **Alternative** | [epaproditus/google-workspace-mcp-server](https://github.com/epaproditus/google-workspace-mcp-server) - 30 stars, Gmail + Calendar focused |

### 1.7 Google Calendar MCP
| Field | Detail |
|-------|--------|
| **Note** | Covered by Google Workspace MCP (#1.1). Dedicated alternative below: |
| **GitHub** | [takumi0706/google-calendar-mcp](https://github.com/takumi0706/google-calendar-mcp) |
| **Stars** | 55 |
| **Language** | TypeScript |
| **Install** | Claude Desktop integration |

### 1.8 Microsoft Office 365 MCP
| Field | Detail |
|-------|--------|
| **Note** | No dominant single server. Best options: |
| **Option 1** | Activepieces (21.2k stars) includes Office 365 pieces as MCP |
| **Option 2** | PipedreamHQ/pipedream includes Microsoft Graph API connectors |
| **Status** | No official Microsoft MCP server found; community solutions fragmented |

---

## 2. Development & Code

### 2.1 GitHub MCP Server (Official)
| Field | Detail |
|-------|--------|
| **Package** | `ghcr.io/github/github-mcp-server` (Docker) |
| **GitHub** | [github/github-mcp-server](https://github.com/github/github-mcp-server) |
| **Stars** | 27,800 |
| **Tools** | 30+ (repos, issues, PRs, code search, workflows, file operations) |
| **Description** | Official GitHub MCP. Read repos/code, manage issues/PRs, analyze code, automate workflows. |
| **Install** | Remote (OAuth/PAT via HTTP), Docker, or build from Go source |
| **Official?** | YES (by GitHub) |
| **Language** | Go |
| **Notes** | Integrates with VS Code, Claude Desktop, Cursor, Windsurf, JetBrains, Visual Studio |

### 2.2 GitLab MCP Server
| Field | Detail |
|-------|--------|
| **GitHub** | [yoda-digital/mcp-gitlab-server](https://github.com/yoda-digital/mcp-gitlab-server) |
| **Stars** | 40 |
| **Tools** | Group projects listing, activity tracking, MR management |
| **Official?** | Community |
| **Language** | TypeScript |
| **Alternative** | [nguyenvanduocit/all-in-one-model-context-protocol](https://github.com/nguyenvanduocit/all-in-one-model-context-protocol) - 98 stars, includes GitLab + Jira + Confluence |

### 2.3 Docker MCP Gateway
| Field | Detail |
|-------|--------|
| **Package** | `docker-mcp` (Docker CLI plugin) |
| **GitHub** | [docker/docker-mcp](https://github.com/docker/docker-mcp) |
| **Stars** | 1,300 |
| **Description** | Run MCP servers as Docker containers with proper isolation. Unified interface for AI models. |
| **Install** | Pre-installed on Docker Desktop 4.59+. Or `make docker-mcp` |
| **Official?** | YES (by Docker) |
| **Language** | Go |

### 2.4 Playwright MCP (Official by Microsoft)
| Field | Detail |
|-------|--------|
| **Package** | `@playwright/mcp` (npm) |
| **GitHub** | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) |
| **Stars** | 28,600 |
| **Tools** | 20+ (navigation, interaction, snapshots, form filling, screenshots) |
| **Description** | Official Playwright MCP. Browser automation via structured accessibility snapshots. No screenshots needed. |
| **Install** | `npx @playwright/mcp@latest` |
| **Official?** | YES (by Microsoft) |
| **Language** | TypeScript |

### 2.5 Chrome DevTools MCP (Official by Google)
| Field | Detail |
|-------|--------|
| **Package** | `chrome-devtools-mcp` (npm) |
| **GitHub** | [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) |
| **Stars** | 28,500 |
| **Tools** | 29 (input 9, navigation 6, emulation 2, performance 4, network 2, debugging 6) |
| **Description** | Let coding agents control and inspect a live Chrome browser. |
| **Install** | `npx -y chrome-devtools-mcp@latest` |
| **Official?** | YES (by Google/Chrome team) |
| **Language** | TypeScript |

### 2.6 Sentry MCP (Official)
| Field | Detail |
|-------|--------|
| **Package** | N/A (remote server) |
| **GitHub** | [getsentry/sentry-mcp](https://github.com/getsentry/sentry-mcp) |
| **Stars** | 590 |
| **Tools** | Issue retrieval, analysis, error tracking |
| **Description** | Official Sentry MCP for interacting with Sentry via LLMs. |
| **Official?** | YES (by Sentry) |
| **Language** | TypeScript |

### 2.7 Linear MCP Server
| Field | Detail |
|-------|--------|
| **GitHub** | linear-mcp-server |
| **Stars** | 344 |
| **Description** | Project management integration for Linear |
| **Language** | JavaScript |

---

## 3. Search & Research

### 3.1 Brave Search MCP (Official)
| Field | Detail |
|-------|--------|
| **Package** | `@anthropic/mcp-server-brave-search` (archived) / `brave-search-mcp-server` |
| **GitHub** | [brave/brave-search-mcp-server](https://github.com/brave/brave-search-mcp-server) |
| **Stars** | 766 |
| **Tools** | Web search, local POI search |
| **Description** | Official Brave implementation of MCP server for search. |
| **Install** | npm + Brave Search API key |
| **Official?** | YES (by Brave) |
| **Language** | TypeScript |

### 3.2 Tavily MCP
| Field | Detail |
|-------|--------|
| **Package** | `tavily-mcp` (npm) |
| **GitHub** | [tavily-ai/tavily-mcp](https://github.com/tavily-ai/tavily-mcp) |
| **Stars** | 1,400 |
| **Tools** | 4 (tavily-search, tavily-extract, tavily-map, tavily-crawl) |
| **Description** | Production-ready MCP with real-time search, extract, map & crawl. |
| **Install** | `npx -y tavily-mcp@latest` or remote `https://mcp.tavily.com/mcp/` |
| **Official?** | YES (by Tavily) |
| **Language** | TypeScript |

### 3.3 Exa MCP Server
| Field | Detail |
|-------|--------|
| **Package** | `exa-mcp-server` (npm) |
| **GitHub** | [exa-labs/exa-mcp-server](https://github.com/exa-labs/exa-mcp-server) |
| **Stars** | 4,000 |
| **Tools** | 9 (3 default: web_search, code_context, company_research + 6 optional: advanced search, crawling, people search, deep researcher) |
| **Description** | Web search, code search, company research, deep research capabilities. |
| **Install** | `npx exa-mcp-server` or remote `https://mcp.exa.ai/mcp` |
| **Official?** | YES (by Exa) |
| **Language** | TypeScript |

### 3.4 Context7 (Documentation Search)
| Field | Detail |
|-------|--------|
| **Package** | `@upstash/context7-mcp` (npm) |
| **GitHub** | [upstash/context7](https://github.com/upstash/context7) |
| **Stars** | 48,500 |
| **Tools** | 2 (resolve-library-id, query-docs) |
| **Description** | Up-to-date, version-specific documentation for LLMs. Add "use context7" to get current code examples for thousands of libraries. |
| **Install** | Remote HTTP or local stdio. Supports 30+ IDEs. |
| **Official?** | YES (by Upstash) |
| **Language** | TypeScript |
| **Notes** | Extremely popular. Solves the "stale training data" problem. |

### 3.5 Firecrawl MCP Server
| Field | Detail |
|-------|--------|
| **Package** | `firecrawl-mcp` (npm) |
| **GitHub** | [firecrawl/firecrawl-mcp-server](https://github.com/firecrawl/firecrawl-mcp-server) |
| **Stars** | 5,700 |
| **Tools** | 7 (scrape, batch_scrape, map, crawl, search, agent, browser) |
| **Description** | Powerful web scraping, crawling, and search for AI agents. Batch processing and content extraction. |
| **Install** | `npx -y firecrawl-mcp` or `npm install -g firecrawl-mcp` |
| **Official?** | YES (by Firecrawl) |
| **Language** | JavaScript |

### 3.6 MCP Omnisearch
| Field | Detail |
|-------|--------|
| **GitHub** | [spences10/mcp-omnisearch](https://github.com/spences10/mcp-omnisearch) |
| **Stars** | 282 |
| **Description** | Unified access to multiple search engines (Tavily, Brave, Kagi) + AI tools (Perplexity) |
| **Language** | TypeScript |

---

## 4. AI & Media

### 4.1 ElevenLabs MCP (Official)
| Field | Detail |
|-------|--------|
| **Package** | `elevenlabs-mcp` (PyPI) |
| **GitHub** | [elevenlabs/elevenlabs-mcp](https://github.com/elevenlabs/elevenlabs-mcp) |
| **Stars** | 1,300 |
| **Tools** | Text-to-speech, voice cloning, audio generation |
| **Description** | Official ElevenLabs MCP server for voice and audio generation. |
| **Official?** | YES (by ElevenLabs) |
| **Language** | Python |
| **Last Update** | January 2026 |

### 4.2 Replicate MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [deepfates/mcp-replicate](https://github.com/deepfates/mcp-replicate) |
| **Stars** | 93 |
| **Tools** | Run any Replicate model (image gen, video, audio, etc.) |
| **Description** | MCP server for Replicate's API. Access thousands of AI models. |
| **Official?** | Community (official repo [replicate/replicate-mcp-code-mode](https://github.com/replicate/replicate-mcp-code-mode) has 4 stars) |
| **Language** | TypeScript |

### 4.3 FAL AI Media Generation
| Field | Detail |
|-------|--------|
| **GitHub** | [raveenb/fal-mcp-server](https://github.com/raveenb/fal-mcp-server) |
| **Stars** | ~50 |
| **Description** | AI media generation via fal.ai platform |
| **Language** | Python |

### 4.4 OpenAI GPT Image MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [SureScaleAI/openai-gpt-image-mcp](https://github.com/SureScaleAI/openai-gpt-image-mcp) |
| **Description** | OpenAI image generation (DALL-E, GPT-4V) |
| **Language** | TypeScript |

### 4.5 Google Imagen 3.0 MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [hamflx/imagen3-mcp](https://github.com/hamflx/imagen3-mcp) |
| **Description** | Google Imagen 3.0 image generation |
| **Language** | TypeScript |

### 4.6 Blender MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [ahujasid/blender-mcp](https://github.com/ahujasid/blender-mcp) |
| **Description** | Blender 3D integration for AI agents |
| **Language** | Python |

---

## 5. Social Media & Marketing

### 5.1 Twitter/X MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [EnesCinr/twitter-mcp](https://github.com/EnesCinr/twitter-mcp) |
| **Stars** | 373 |
| **Tools** | Post tweets, search, read timelines |
| **Language** | TypeScript |
| **Alternative** | [adhikasp/mcp-twikit](https://github.com/adhikasp/mcp-twikit) - 227 stars, Python |

### 5.2 Instagram / Meta Ads MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [pipeboard-co/meta-ads-mcp](https://github.com/pipeboard-co/meta-ads-mcp) |
| **Stars** | 607 |
| **Description** | Manage Facebook and Instagram Ads (Meta Ads) |
| **Language** | Python |
| **Alternative** | [jlbadano/ig-mcp](https://github.com/jlbadano/ig-mcp) - 88 stars, Instagram Business accounts |

### 5.3 YouTube MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [anaisbetts/mcp-youtube](https://github.com/anaisbetts/mcp-youtube) |
| **Stars** | 501 |
| **Language** | JavaScript |
| **Alt: Transcript** | [kimtaeyoon83/mcp-server-youtube-transcript](https://github.com/kimtaeyoon83/mcp-server-youtube-transcript) - 492 stars, TypeScript |
| **Alt: Full API** | [ZubeidHendricks/youtube-mcp-server](https://github.com/ZubeidHendricks/youtube-mcp-server) - 458 stars, video management + Shorts + analytics |

### 5.4 Xiaohongshu (Little Red Book) MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [xpzouying/xiaohongshu-mcp](https://github.com/xpzouying/xiaohongshu-mcp) |
| **Stars** | 11,300 |
| **Language** | Go |
| **Notes** | Massive stars for Chinese social media platform |

---

## 6. File & Document

### 6.1 Filesystem MCP (Official Reference)
| Field | Detail |
|-------|--------|
| **Package** | `@anthropic/mcp-server-filesystem` |
| **GitHub** | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) (in /src/filesystem) |
| **Description** | Secure file operations with configurable access controls. Official reference server. |
| **Official?** | YES (by Anthropic/MCP Steering Group) |
| **Language** | TypeScript |

### 6.2 PDF Reader MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [SylphxAI/pdf-reader-mcp](https://github.com/SylphxAI/pdf-reader-mcp) |
| **Stars** | 546 |
| **Description** | Production-ready PDF processing. 5-10x faster with parallel processing. 94%+ test coverage. |
| **Language** | TypeScript |

### 6.3 Kreuzberg (Document Intelligence)
| Field | Detail |
|-------|--------|
| **GitHub** | [kreuzberg-dev/kreuzberg](https://github.com/kreuzberg-dev/kreuzberg) |
| **Stars** | 6,700 |
| **Description** | Extract text, metadata, and structured info from PDFs, Office docs. Rust core. |
| **Language** | Rust |

### 6.4 eBook MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [onebirdrocks/ebook-mcp](https://github.com/onebirdrocks/ebook-mcp) |
| **Stars** | 351 |
| **Description** | Supports EPUB, PDF and more mainstream eBook formats. |
| **Language** | Python |

### 6.5 AWS S3 MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [aws-samples/sample-mcp-server-s3](https://github.com/aws-samples/sample-mcp-server-s3) |
| **Stars** | 77 |
| **Description** | Official AWS sample S3 MCP server |
| **Official?** | Semi-official (AWS Samples) |
| **Language** | Python |

### 6.6 PDF Tools MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [hanweg/mcp-pdf-tools](https://github.com/hanweg/mcp-pdf-tools) |
| **Stars** | 75 |
| **Description** | Working with PDF files (manipulation, extraction) |
| **Language** | Python |

---

## 7. Communication

### 7.1 Telegram MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [chigwell/telegram-mcp](https://github.com/chigwell/telegram-mcp) |
| **Stars** | 779 |
| **Tools** | 70+ (chat management 20, messaging 18, contacts 12, user/profile 6, media 7, search 3, privacy 7, drafts 3) |
| **Description** | Full-featured Telegram integration powered by Telethon. Automate messaging, group management, contacts. |
| **Install** | `uv sync` + configure, or Docker Compose |
| **Official?** | Community |
| **Language** | Python |

### 7.2 Discord MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [KOBA789/human-in-the-loop](https://github.com/KOBA789/human-in-the-loop) |
| **Stars** | 222 |
| **Description** | AI assistants ask questions to humans via Discord |
| **Language** | Rust |
| **Alt** | [SaseQ/discord-mcp](https://github.com/SaseQ/discord-mcp) - 205 stars, Java, full Discord integration |
| **Alt** | [v-3/discordmcp](https://github.com/v-3/discordmcp) - 186 stars, TypeScript |

### 7.3 LINE MCP Server (Official)
| Field | Detail |
|-------|--------|
| **GitHub** | [line/line-bot-mcp-server](https://github.com/line/line-bot-mcp-server) |
| **Stars** | 526 |
| **Description** | Integrates LINE Messaging API to connect AI Agent to LINE Official Account. |
| **Install** | TypeScript + LINE Bot credentials |
| **Official?** | YES (by LINE) |
| **Language** | TypeScript |

---

## 8. Finance & Business

### 8.1 Stripe Agent Toolkit (Official)
| Field | Detail |
|-------|--------|
| **Package** | `@stripe/agent-toolkit` (npm) / `stripe-agent-toolkit` (PyPI) |
| **GitHub** | [stripe/agent-toolkit](https://github.com/stripe/agent-toolkit) |
| **Stars** | 1,400 |
| **Tools** | Payment processing, customer management, subscription handling |
| **Description** | Official Stripe MCP. Remote server at `https://mcp.stripe.com` with OAuth. |
| **Install** | `npm install @stripe/agent-toolkit` or `pip install stripe-agent-toolkit` or `npx -y @stripe/mcp` |
| **Official?** | YES (by Stripe) |
| **Language** | TypeScript + Python |

### 8.2 Naver Finance Crawl MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [greatSumini/naver-finance-crawl-mcp](https://github.com/greatSumini/naver-finance-crawl-mcp) |
| **Stars** | 3 |
| **Language** | TypeScript |
| **Notes** | Korean stock market data via Naver Finance |

---

## 9. Browser Automation

### 9.1 Playwright MCP (Official - Microsoft)
> See #2.4 above - 28,600 stars

### 9.2 Chrome DevTools MCP (Official - Google)
> See #2.5 above - 28,500 stars

### 9.3 Puppeteer MCP (Official Reference - Archived)
| Field | Detail |
|-------|--------|
| **Package** | `@anthropic/mcp-server-puppeteer` (archived) |
| **GitHub** | modelcontextprotocol/servers (archived to servers-archived) |
| **Description** | Browser automation via Puppeteer. Now archived in favor of Playwright MCP. |
| **Official?** | YES (by Anthropic, now archived) |

### 9.4 Browserbase MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [browserbase/mcp-server-browserbase](https://github.com/browserbase/mcp-server-browserbase) |
| **Description** | Cloud browser automation |
| **Official?** | YES (by Browserbase) |
| **Language** | TypeScript |

### 9.5 Browser MCP (Local Chrome)
| Field | Detail |
|-------|--------|
| **GitHub** | [browsermcp/mcp](https://github.com/browsermcp/mcp) |
| **Description** | Local Chrome automation |
| **Language** | TypeScript |

---

## 10. Database

### 10.1 Google GenAI Toolbox for Databases
| Field | Detail |
|-------|--------|
| **GitHub** | [googleapis/genai-toolbox](https://github.com/googleapis/genai-toolbox) |
| **Stars** | 13,400 |
| **Description** | Open source MCP server for databases. Supports PostgreSQL and multiple databases. |
| **Official?** | YES (by Google) |
| **Language** | Go |

### 10.2 DBHub (Multi-Database)
| Field | Detail |
|-------|--------|
| **GitHub** | [bytebase/dbhub](https://github.com/bytebase/dbhub) |
| **Stars** | 2,300 |
| **Description** | Zero-dependency, token-efficient MCP server for Postgres, MySQL, SQL Server, MariaDB, SQLite |
| **Language** | TypeScript |

### 10.3 PostgreSQL MCP (pg-aiguide)
| Field | Detail |
|-------|--------|
| **GitHub** | [timescale/pg-aiguide](https://github.com/timescale/pg-aiguide) |
| **Stars** | 1,600 |
| **Description** | PostgreSQL skills and documentation for AI agents |
| **Official?** | Community (by Timescale) |
| **Language** | Python |

### 10.4 PostgreSQL MCP (pgmcp)
| Field | Detail |
|-------|--------|
| **GitHub** | [subnetmarco/pgmcp](https://github.com/subnetmarco/pgmcp) |
| **Stars** | 524 |
| **Description** | Natural language queries to PostgreSQL databases |
| **Language** | Go |

### 10.5 PostgreSQL Ops MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [call518/MCP-PostgreSQL-Ops](https://github.com/call518/MCP-PostgreSQL-Ops) |
| **Stars** | 139 |
| **Tools** | 30+ monitoring and analysis tools |
| **Language** | Python |

### 10.6 Universal Database Gateway
| Field | Detail |
|-------|--------|
| **GitHub** | [centralmind/gateway](https://github.com/centralmind/gateway) |
| **Stars** | 517 |
| **Description** | Universal MCP-Server for databases optimized for LLMs and AI-Agents |
| **Language** | Go |

### 10.7 SQLite MCP (Official Reference - Archived)
| Field | Detail |
|-------|--------|
| **Package** | `@anthropic/mcp-server-sqlite` (archived) |
| **Description** | Now archived. Use DBHub or genai-toolbox instead. |
| **Official?** | YES (by Anthropic, now archived) |

### 10.8 AnyQuery (40+ Apps via SQL)
| Field | Detail |
|-------|--------|
| **GitHub** | [julien040/anyquery](https://github.com/julien040/anyquery) |
| **Description** | Query 40+ apps with SQL (GitHub, Notion, Airtable, Google Sheets, etc.) |
| **Language** | Go |

---

## 11. Aggregators & Meta-Platforms

### 11.1 Activepieces (280+ MCP Servers)
| Field | Detail |
|-------|--------|
| **GitHub** | [activepieces/activepieces](https://github.com/activepieces/activepieces) |
| **Stars** | 21,200 |
| **Description** | Open-source Zapier alternative. All 280+ pieces available as MCP servers for Claude Desktop, Cursor, Windsurf. |
| **Official?** | YES (by Activepieces) |
| **Language** | TypeScript |
| **Notes** | Largest open-source MCP toolkit. No-code builder. |

### 11.2 Pipedream (2,500 APIs, 8,000+ Tools)
| Field | Detail |
|-------|--------|
| **GitHub** | [PipedreamHQ/pipedream](https://github.com/PipedreamHQ/pipedream) |
| **Description** | Connect with 2,500 APIs and 8,000+ prebuilt tools via MCP |
| **Notes** | Most comprehensive API coverage |

### 11.3 FastAPI MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [tadata-org/fastapi_mcp](https://github.com/tadata-org/fastapi_mcp) |
| **Stars** | 11,600 |
| **Description** | Expose any FastAPI endpoints as MCP tools, with Auth. Turn any API into an MCP server. |
| **Language** | Python |

### 11.4 n8n (Workflow Automation with MCP)
| Field | Detail |
|-------|--------|
| **GitHub** | [n8n-io/n8n](https://github.com/n8n-io/n8n) |
| **Stars** | 179,000 |
| **Description** | Fair-code workflow automation with native AI/MCP capabilities |
| **Language** | TypeScript |
| **Notes** | Can be used as MCP server bridge via [czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp) (14,900 stars) |

---

## 12. Other Notable MCPs

### 12.1 Official MCP Reference Servers (by Anthropic/MCP Steering Group)
| Server | Description |
|--------|-------------|
| **Everything** | Reference/test server with prompts, resources, tools |
| **Fetch** | Web content fetching and conversion for LLMs |
| **Filesystem** | Secure file operations with configurable access |
| **Git** | Read, search, manipulate Git repositories |
| **Memory** | Knowledge graph-based persistent memory |
| **Sequential Thinking** | Dynamic problem-solving through thought sequences |
| **Time** | Time and timezone conversion |

### 12.2 MCP Server for Beginners (Microsoft)
| Field | Detail |
|-------|--------|
| **GitHub** | [microsoft/mcp-for-beginners](https://github.com/microsoft/mcp-for-beginners) |
| **Stars** | 15,300 |
| **Description** | Curriculum introducing MCP fundamentals through real-world examples |

### 12.3 Gemini CLI (with MCP support)
| Field | Detail |
|-------|--------|
| **GitHub** | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) |
| **Stars** | 97,200 |
| **Description** | Google's CLI for Gemini with MCP server support |

### 12.4 mcptools (General CLI)
| Field | Detail |
|-------|--------|
| **GitHub** | mcptools |
| **Stars** | 1,500 |
| **Description** | General-purpose MCP server CLI tool |
| **Language** | Go |

### 12.5 Spotify MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [khglynn/spotify-bulk-actions-mcp](https://github.com/khglynn/spotify-bulk-actions-mcp) |
| **Description** | Spotify bulk operations |
| **Language** | Python |

### 12.6 Apple Reminders MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [FradSer/mcp-server-apple-reminders](https://github.com/FradSer/mcp-server-apple-reminders) |
| **Description** | Apple Reminders access (macOS only) |
| **Language** | TypeScript |

### 12.7 Apple Health MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [the-momentum/apple-health-mcp-server](https://github.com/the-momentum/apple-health-mcp-server) |
| **Description** | Apple Health data access (macOS/iOS) |
| **Language** | Python |

### 12.8 3D Printer MCP (OctoPrint)
| Field | Detail |
|-------|--------|
| **GitHub** | [OctoEverywhere/mcp](https://github.com/OctoEverywhere/mcp) |
| **Description** | 3D printer control via OctoPrint |
| **Language** | C# |

### 12.9 Zotero MCP (Academic)
| Field | Detail |
|-------|--------|
| **GitHub** | [TonybotNi/ZotLink](https://github.com/TonybotNi/ZotLink) |
| **Stars** | 131 |
| **Description** | Production-ready MCP for Zotero with PDF attachments and metadata |
| **Language** | Python |

---

## 13. Korean Platform MCPs

### 13.1 Naver Search MCP (Python)
| Field | Detail |
|-------|--------|
| **GitHub** | [pfldy2850/py-mcp-naver](https://github.com/pfldy2850/py-mcp-naver) |
| **Stars** | 114 |
| **Description** | Python MCP for Naver APIs |
| **Language** | Python |

### 13.2 Naver Search MCP (JavaScript)
| Field | Detail |
|-------|--------|
| **GitHub** | [isnow890/naver-search-mcp](https://github.com/isnow890/naver-search-mcp) |
| **Stars** | 60 |
| **Description** | Naver Search API integration - web, news, blog, shopping search |
| **Language** | JavaScript |

### 13.3 KiMCP (Korean APIs - Naver + Kakao)
| Field | Detail |
|-------|--------|
| **GitHub** | [zeikar/kimcp](https://github.com/zeikar/kimcp) |
| **Stars** | 6 |
| **Description** | MCP server enabling LLMs to use Korean APIs (Naver, Kakao, TMap) |
| **Language** | Python |

### 13.4 Naver Map MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [yeonupark/mcp-naver-map](https://github.com/yeonupark/mcp-naver-map) |
| **Stars** | 6 |
| **Language** | Python |

### 13.5 Naver Blog MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [space-cap/naver-blog-mcp](https://github.com/space-cap/naver-blog-mcp) |
| **Stars** | 1 |
| **Language** | Python |

### 13.6 Naver Finance Crawl MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [greatSumini/naver-finance-crawl-mcp](https://github.com/greatSumini/naver-finance-crawl-mcp) |
| **Stars** | 3 |
| **Language** | TypeScript |

### 13.7 Naver SearchAd MCP
| Field | Detail |
|-------|--------|
| **GitHub** | [packative/naver-searchad-mcp](https://github.com/packative/naver-searchad-mcp) |
| **Stars** | 3 |
| **Language** | TypeScript |

### 13.8 Korean Web Search (No API Key)
| Field | Detail |
|-------|--------|
| **GitHub** | [insung8150/AgentWebSearch-MCP](https://github.com/insung8150/AgentWebSearch-MCP) |
| **Stars** | 6 |
| **Description** | Parallel search across Naver/Google/Brave without API keys |
| **Language** | Python |

---

## Summary: Top 50 MCP Servers by Stars

| Rank | Server | Stars | Official? |
|------|--------|-------|-----------|
| 1 | n8n (workflow+MCP) | 179,000 | Yes |
| 2 | Gemini CLI (MCP support) | 97,200 | Yes (Google) |
| 3 | Context7 (docs) | 48,500 | Yes (Upstash) |
| 4 | Playwright MCP | 28,600 | Yes (Microsoft) |
| 5 | Chrome DevTools MCP | 28,500 | Yes (Google) |
| 6 | GitHub MCP Server | 27,800 | Yes (GitHub) |
| 7 | Activepieces (280+ MCPs) | 21,200 | Yes |
| 8 | Microsoft MCP for Beginners | 15,300 | Yes (Microsoft) |
| 9 | n8n-mcp bridge | 14,900 | Community |
| 10 | GenAI Toolbox (DB) | 13,400 | Yes (Google) |
| 11 | FastAPI MCP | 11,600 | Community |
| 12 | Xiaohongshu MCP | 11,300 | Community |
| 13 | Kreuzberg (docs) | 6,700 | Community |
| 14 | Firecrawl MCP | 5,700 | Yes (Firecrawl) |
| 15 | Exa MCP | 4,000 | Yes (Exa) |
| 16 | Notion MCP | 4,000 | Yes (Notion) |
| 17 | DBHub (multi-DB) | 2,300 | Community |
| 18 | Google Workspace MCP | 1,800 | Community |
| 19 | pg-aiguide (PostgreSQL) | 1,600 | Community |
| 20 | mcptools CLI | 1,500 | Community |
| 21 | Tavily MCP | 1,400 | Yes (Tavily) |
| 22 | Slack MCP | 1,400 | Community |
| 23 | Stripe Agent Toolkit | 1,400 | Yes (Stripe) |
| 24 | ElevenLabs MCP | 1,300 | Yes (ElevenLabs) |
| 25 | Docker MCP Gateway | 1,300 | Yes (Docker) |
| 26 | Notion (community) | 866 | Community |
| 27 | Brave Search MCP | 766 | Yes (Brave) |
| 28 | Telegram MCP | 779 | Community |
| 29 | Google Sheets MCP | 731 | Community |
| 30 | Meta Ads MCP | 607 | Community |
| 31 | Sentry MCP | 590 | Yes (Sentry) |
| 32 | PDF Reader MCP | 546 | Community |
| 33 | LINE MCP | 526 | Yes (LINE) |
| 34 | pgmcp (PostgreSQL) | 524 | Community |
| 35 | Gateway (universal DB) | 517 | Community |
| 36 | YouTube MCP | 501 | Community |
| 37 | YouTube Transcript MCP | 492 | Community |
| 38 | YouTube (full API) | 458 | Community |
| 39 | Twitter/X MCP | 373 | Community |
| 40 | Google Docs MCP | 362 | Community |
| 41 | eBook MCP | 351 | Community |
| 42 | Linear MCP | 344 | Community |
| 43 | YouTube Transcript (Py) | 337 | Community |
| 44 | MCP Omnisearch | 282 | Community |
| 45 | Google Drive MCP | 270 | Community |
| 46 | Twitter (Twikit) | 227 | Community |
| 47 | Discord (human-in-loop) | 222 | Community |
| 48 | Discord MCP | 205 | Community |
| 49 | Discord MCP (TS) | 186 | Community |
| 50 | Naver MCP | 114 | Community |

---

## Key Recommendations for CORTHEX

### Already Known/Using
- **NotebookLM MCP** (29 tools) - already in architecture

### High Priority (Official + High Stars)
1. **Context7** - Up-to-date documentation for dev agents (48.5k stars)
2. **GitHub MCP** - Essential for any dev workflow (27.8k stars, official)
3. **Playwright MCP** - Browser automation (28.6k stars, official Microsoft)
4. **Notion MCP** - Knowledge management (4k stars, official)
5. **Google Workspace MCP** - All Google services in one (1.8k stars)
6. **Stripe MCP** - Payment processing (1.4k stars, official)
7. **Firecrawl MCP** - Web scraping (5.7k stars, official)
8. **Exa MCP** - AI-powered search (4k stars, official)

### Worth Watching
- **Activepieces** as meta-MCP (280+ integrations in one)
- **FastAPI MCP** to expose any API as MCP tools
- **Naver MCPs** for Korean market needs
- **LINE MCP** for Korean/Japanese messaging
- **Telegram MCP** for bot integration (already in CORTHEX architecture)

---

*Research completed 2026-03-11. Star counts are approximate and change daily.*
