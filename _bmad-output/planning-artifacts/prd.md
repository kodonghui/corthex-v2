---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-corthex-v2-2026-03-06.md
  - _bmad-output/planning-artifacts/v1-feature-spec.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 2
classification:
  projectType: saas_b2b
  domain: ai-agent-platform
  complexity: high
  projectContext: brownfield
---

# Product Requirements Document - corthex-v2

**Author:** ubuntu
**Date:** 2026-03-06

## Executive Summary

CORTHEX v2 is a multi-tenant AI agent orchestration platform where a CEO (user) commands a virtual corporate organization of 29 AI agents. The CEO issues natural language commands through a Command Center, and a Chief of Staff agent automatically classifies, delegates to department managers, who then distribute work to specialists in parallel. Specialists use 125+ real tools (financial APIs, web search, SNS publishing, etc.) to produce deliverables, which are quality-checked and synthesized into a final report delivered back to the CEO.

v1 proved the concept in 8 days with a single user. v2 rebuilds this on a modern stack (Hono+Bun server, React+Vite SPA, PostgreSQL+Drizzle, WebSocket real-time) with multi-tenancy (companyId isolation, JWT auth) so multiple companies can each run independent AI organizations.

The critical distinction: this is NOT a CRUD dashboard for managing agent records. The agents ACTUALLY WORK - they receive tasks, make LLM calls, invoke tools, delegate sub-tasks, and produce real outputs. Every feature spec'd here describes real working functionality.

### What Makes This Special

| Differentiator | Description |
|---|---|
| **Working AI Organization** | 29 agents with 3-tier hierarchy (Manager/Specialist/Worker) that actually delegate, collaborate, and report - not a list of agent cards |
| **Autonomous Deep Work** | Agents execute 5-stage autonomous work cycles: plan, collect data, analyze, draft, finalize report |
| **Soul System** | Each agent's personality, expertise, and decision principles defined in editable markdown - CEO customizes agents via web UI |
| **125+ Real Tools** | Agents call real APIs (stock data, DART filings, web search, SNS posting) with per-agent permission control |
| **Quality Gate** | Chief of Staff acts as editor-in-chief: 5-item QA check on every report, auto-reject and rework loop |
| **Multi-LLM Router** | Claude/GPT/Gemini with automatic model assignment per agent role + Batch API 50% discount |
| **AGORA Debate Engine** | 6 department heads conduct round-based debates with SSE real-time streaming |
| **Cost Transparency** | Per-agent, per-model, per-department real-time cost tracking with budget limits |

## Project Classification

- **Project Type:** SaaS B2B
- **Domain:** AI Agent Platform
- **Complexity:** High
- **Project Context:** Brownfield (v1 exists with working code at /home/ubuntu/CORTHEX_HQ/)

---

## Success Criteria

### User Success

- CEO issues a command and receives a quality-checked report without manually coordinating any agents
- New user achieves their first successful command-to-report cycle within 3 minutes of signup
- CEO can customize agent personalities (Soul) and see behavior changes immediately
- Delegation chain is visible in real-time: "Chief of Staff -> CIO -> Stock Analyst" with elapsed time

### Business Success

| Period | Objective | Key Metric |
|---|---|---|
| 3 months | v1 feature 100% port + multi-tenancy | Single company running 29 AI agents end-to-end |
| 6 months | Beta users | 10 companies, 50 DAU |
| 12 months | Revenue | MRR $5K, 10% paid conversion |

### Technical Success

- Orchestration completion rate: 95%+ (command -> final report without error)
- Simple command latency: < 30 seconds
- Complex command latency: < 3 minutes
- Tool invocation success rate: 95%+
- Quality gate first-pass rate: 85%+
- 24-hour uptime with < 5% error rate

### Measurable Outcomes

- **Command Completion Rate**: 95%+ of CEO commands reach final report delivery
- **Daily Active Commands**: 5+ commands per CEO per day
- **Agent Utilization**: 70%+ of 29 agents active weekly
- **Batch API Usage**: 40%+ of non-urgent work via Batch API (50% cost savings)
- **CEO Satisfaction**: 80%+ positive feedback on report quality

## Product Scope

### MVP - Minimum Viable Product

All v1 features ported to v2 architecture with multi-tenancy. Specifically:

1. Command Center with natural language, @mention, slash commands (8), presets
2. Chief of Staff orchestration: auto-classify -> delegate -> parallel work -> synthesize
3. 3-tier agent hierarchy (Manager/Specialist/Worker) with autonomous deep work
4. Soul System: editable agent personalities via web UI
5. Tool System: 125+ real tool invocations with per-agent permissions
6. Multi-LLM Router: Claude/GPT/Gemini + model auto-assignment + Batch API
7. Quality Gate: auto-QA + rework loop
8. Real-time status: WebSocket SSE streaming of agent activity
9. Multi-tenancy: companyId isolation, JWT auth, admin console
10. Cost tracking: per-agent/model/department real-time

### Growth Features (Post-MVP)

- AGORA debate engine (2/3 round debates, SSE streaming)
- Strategy Room (portfolio dashboard, watchlist, KIS auto-trading, paper trading)
- SNS Publishing (5 platforms, approval flow, Selenium automation)
- SketchVibe (Cytoscape canvas, Mermaid bidirectional, MCP SSE, AI real-time editing)
- Agent Memory (auto-learning, knowledge injection)

### Vision (Future)

- Dashboard (summary cards, AI usage charts, budget management, quick actions)
- Communication Log (activity/comms/QA/tools 4-tab)
- Operation Journal (history, search, bookmark, A/B compare, replay)
- Classified Archive (report storage, grade filter)
- Performance Analysis (Soul Gym, quality dashboard, agent stats)
- Cron Scheduler (presets, custom cron, toggle)
- Knowledge Base (RAG document store, drag upload, auto-injection)
- ARGOS (real-time intelligence collection, trigger-based)
- Telegram Command (mobile AI commands, department reports)
- In-company Messenger

---

## User Journeys

### Journey 1: CEO First Command (Primary User - Success Path)

**Persona: Kim Daepyo (42, SME CEO)**

Kim signs up and creates his company. The system auto-deploys 29 AI agents in the standard org chart. He enters the Command Center and types: "Analyze Samsung Electronics for investment."

The Chief of Staff receives the command, classifies it as investment analysis, and delegates to the CIO (Investment Analysis Manager). The CIO breaks this into 4 parallel tasks: market analysis, financial analysis, technical analysis, and risk assessment. Four specialists work simultaneously, each invoking tools (kr_stock for real-time price, dart_api for filings, real_web_search for news). The CIO synthesizes results, the Chief of Staff quality-checks the report (5-item QA: conclusion, evidence, risk, format, logic), and delivers the final analysis to Kim.

Kim sees the entire delegation chain in real-time. Total time: ~2 minutes. He bookmarks the report, then creates a preset "Samsung Analysis" for daily use.

**Capabilities Revealed:** Command input, auto-routing, delegation chain, parallel specialist work, tool invocation, quality gate, report delivery, real-time status, bookmarking, presets

### Journey 2: CEO Advanced Commands (Primary User - Edge Cases)

Kim uses slash commands: `/debate AI investment strategy` triggers AGORA - 6 department heads debate for 2 rounds via SSE streaming. He uses `@CMO create marketing plan for Q2` to directly assign to a specific manager. He uses `/batch-run` to flush queued requests. When a report fails QA, the Chief of Staff auto-rejects and the specialist reworks it - Kim sees the rework status in real-time.

**Capabilities Revealed:** Slash commands (8 types), @mention direct assignment, AGORA debates, batch operations, QA rejection/rework flow

### Journey 3: Admin Managing the Organization

**Persona: Admin Lee (system administrator)**

Admin Lee manages companies in the admin console. She creates a new company, invites employees, and configures the agent organization. She edits the CIO agent's Soul (personality markdown) to add specific investment principles. She sets tool permissions: only CIO team can access kr_stock, only CMO team can access sns_manager. She monitors cost dashboards showing per-department spend and sets daily/monthly budget limits.

**Capabilities Revealed:** Admin console (company/employee/agent CRUD), Soul editing, tool permission management, cost monitoring, budget limits

### Journey 4: Team Member Using Shared Workspace

**Persona: Park Employee (team member invited by CEO)**

Park joins the company via invite, gets her own Command Center workspace. She issues commands independently, uses shared knowledge base documents, and chats with colleagues via in-company messenger. Her AI costs are tracked separately. She can see her own command history but not the CEO's.

**Capabilities Revealed:** Multi-user workspace, independent command center, shared knowledge base, in-company messenger, per-user cost isolation, permission-based visibility

### Journey 5: Automated Operations (System Journey)

The system runs cron-scheduled tasks: daily 9 AM market briefing, weekly Monday 10 AM portfolio review. ARGOS monitors news triggers and auto-collects intelligence when conditions are met. Telegram bot pushes department reports to CEO's phone. Batch API collector queues non-urgent requests and flushes at 50% discount.

**Capabilities Revealed:** Cron scheduler, ARGOS trigger-based collection, Telegram integration, Batch API queue management

### Journey Requirements Summary

| Journey | Key Capabilities |
|---|---|
| CEO First Command | Orchestration, delegation, tools, QA gate, real-time status |
| CEO Advanced | Slash commands, @mention, AGORA, batch, rework |
| Admin | Company/agent CRUD, Soul editing, permissions, cost management |
| Team Member | Multi-user isolation, shared knowledge, messenger |
| Automated Ops | Cron, ARGOS, Telegram, Batch API |

---

## Domain-Specific Requirements

### AI Agent Orchestration Domain

- **Multi-LLM Provider Management**: Support 3+ LLM providers (Anthropic, OpenAI, Google) with per-agent model assignment and automatic failover
- **Token Cost Accounting**: Real-time token counting and cost calculation per model pricing table (models.yaml), with daily/monthly budget enforcement
- **Agent Context Management**: System prompt assembly from Soul markdown + department knowledge + agent memory + tool definitions per invocation
- **Tool Execution Sandbox**: Tool calls must be logged, result-size-limited (4,000 chars), and permission-checked before execution
- **Delegation Protocol**: Typed TaskRequest/TaskResponse messages between agent tiers with timeout, retry, and escalation policies

### Financial Data Domain (Strategy Room)

- **KIS Securities API**: Korean/US stock trading API integration with credential vault (AES-256-GCM encrypted)
- **Real-time Market Data**: 60-second auto-refresh for watchlist prices
- **Paper Trading**: Virtual portfolio with real market data, configurable initial capital
- **Investment Style Profiles**: Conservative/Balanced/Aggressive modes affecting CIO analysis confidence-to-allocation mapping

### Content Publishing Domain (SNS)

- **Multi-platform Publishing**: Instagram, YouTube, Tistory, Daum Cafe, LinkedIn
- **Approval Workflow**: AI-generated content -> CEO review -> approve/reject -> scheduled publish
- **Selenium Automation**: Headless browser-based publishing for platforms without API

---

## Innovation Focus

### AI Orchestration Innovation

- **Manager = 5th Analyst (CEO Idea #007)**: Managers don't just delegate - they independently analyze, then synthesize their own analysis with subordinate results for richer output
- **Chief of Staff = Editor-in-Chief (CEO Idea #010)**: Quality gate with 5-item rubric (conclusion, evidence, risk, format, logic) and automatic rework loop
- **Department Standard Templates (CEO Idea #011)**: Structured output templates per department so AI produces consistently formatted reports
- **Autonomous Deep Work**: 5-stage autonomous cycle (plan -> collect -> analyze -> draft -> report) instead of single-shot LLM responses

### Visual AI Collaboration Innovation

- **SketchVibe (CEO Idea #009)**: Draw diagrams on canvas while AI watches and collaborates in real-time
- **Bidirectional Mermaid<->Cytoscape**: AI outputs Mermaid code, canvas renders it; user edits canvas, system generates Mermaid for AI to read
- **MCP SSE Real-time**: AI adds/modifies canvas nodes in real-time via Server-Sent Events

### Collective Intelligence Innovation

- **AGORA Debate Engine**: 6 department heads conduct structured multi-round debates on any topic
- **Diff View + Book Format**: Debate results presented with position differences highlighted and final synthesis in book format

---

## Project-Type Specific Requirements (SaaS B2B)

### Multi-tenancy Architecture

- **companyId Isolation**: Every database query filtered by companyId. No cross-tenant data leakage
- **Credential Vault**: AES-256-GCM encrypted storage for API keys (KIS, LLM providers) per company
- **Independent Agent Orgs**: Each company gets its own 29-agent organization with independent Soul configurations

### Authentication & Authorization

- **JWT Auth**: Separate auth for admin_users (admin console) and users (app)
- **Role-based Access**: CEO, Admin, Employee roles with permission boundaries
- **Invite Flow**: CEO invites employees via email/link

### Real-time Infrastructure

- **WebSocket**: 7-channel multiplexing via Hono built-in WebSocket
- **EventBus**: Server-side event routing for agent activity, delegation status, cost updates
- **SSE Streaming**: For AGORA debates and SketchVibe AI collaboration

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Port all v1 working features to v2 architecture. "If it worked in v1, it must work in v2." The MVP is NOT a reduced feature set - it's the full v1 capability on a multi-tenant foundation.

**Resource Requirements:** Single full-stack developer (Claude Code agents), leveraging v1 source code as reference.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:** CEO First Command, Admin Management

**Must-Have Capabilities:**
1. Multi-tenancy infrastructure (companyId, JWT, admin console)
2. Orchestrator engine (command -> classify -> delegate -> parallel work -> synthesize -> report)
3. Agent 3-tier hierarchy with autonomous deep work
4. Soul System (editable personality markdown)
5. Tool System (125+ real invocations, per-agent permissions)
6. Multi-LLM Router (Claude/GPT/Gemini, model auto-assign, Batch API)
7. Command Center (natural language, @mention, slash commands, presets)
8. Quality Gate (5-item QA, auto-rework)
9. Real-time status (WebSocket, delegation chain tracking)
10. Cost tracking (per-agent/model/department)

### Post-MVP Features

**Phase 2 (Post-MVP):**
- AGORA debate engine
- Strategy Room (portfolio, watchlist, KIS auto-trading, paper trading)
- SNS Publishing (5 platforms, approval, Selenium)
- SketchVibe (canvas, Mermaid, MCP SSE)
- Agent Memory (auto-learning, injection)

**Phase 3 (Expansion):**
- Dashboard (summary, charts, budget, quick actions)
- Communication Log, Operation Journal, Classified Archive
- Performance Analysis, Soul Gym
- Cron Scheduler, Knowledge Base (RAG)
- ARGOS intelligence, Telegram Command
- In-company Messenger
- Workflow Automation

### Risk Mitigation Strategy

**Technical Risks:** LLM API reliability - mitigated by multi-provider failover. Tool execution failures - mitigated by retry + graceful degradation.
**Market Risks:** AI platform commoditization - mitigated by unique orchestration layer and 125+ tool ecosystem.
**Resource Risks:** Single developer - mitigated by v1 reference code and BMAD-driven development process.

---

## Functional Requirements

### Command & Control

- FR1: CEO can issue natural language commands to the AI organization via Command Center
- FR2: CEO can use @mention to directly assign commands to specific department managers
- FR3: CEO can use 8 slash commands (/all, /sequential, /tool-check, /batch-run, /batch-status, /commands, /debate, /deep-debate)
- FR4: CEO can create, edit, and use command presets (shortcut -> full command mapping)
- FR5: CEO can view real-time delegation chain with agent names and elapsed time during command execution
- FR6: CEO can view SSE-streamed agent responses as they are generated

### AI Orchestration

- FR7: System can automatically classify CEO commands and route to appropriate department via Chief of Staff
- FR8: Manager agents can decompose tasks and distribute sub-tasks to specialist agents in parallel
- FR9: Specialist agents can execute 5-stage autonomous deep work cycles (plan, collect, analyze, draft, report)
- FR10: Manager agents can independently analyze tasks (5th analyst role) before synthesizing with subordinate results
- FR11: Chief of Staff can quality-check reports against 5-item rubric and auto-reject for rework
- FR12: System can track and display the full delegation chain (CEO -> Chief of Staff -> Manager -> Specialist) in real-time
- FR13: System can execute relay mode where agents process sequentially (slash /sequential)

### Agent Organization

- FR14: System can deploy a standard 29-agent organization (CEO + Chief of Staff + 3 assistants + 6 department managers + specialists/workers) per company
- FR15: Admin can view and manage the agent organization hierarchy
- FR16: CEO/Admin can edit agent Soul (personality, expertise, principles, report format, tool list) via web UI markdown editor
- FR17: System can inject department-specific knowledge into agent system prompts automatically
- FR18: Each agent has a defined tier (Manager/Specialist/Worker) with corresponding default LLM model assignment

### Tool System

- FR19: Agents can invoke tools from a catalog of 125+ tools during task execution
- FR20: Admin can configure per-agent tool permissions (allowed_tools whitelist)
- FR21: System can log all tool invocations with input, output, and execution metadata
- FR22: System can truncate tool results exceeding 4,000 characters with automatic summarization
- FR23: CEO can view tool invocation logs in the Communication Log
- FR24: CEO can trigger full tool health check via /tool-check command

### LLM Provider Management

- FR25: System can route LLM calls to Claude (Opus/Sonnet/Haiku), GPT (5/5-mini/5.2), or Gemini (3.1 Pro/2.5 Flash)
- FR26: Admin can assign specific LLM models to specific agents via configuration
- FR27: System can collect non-urgent LLM requests into batch queue for Batch API execution (50% discount)
- FR28: CEO can view batch queue status and trigger batch flush via /batch-run and /batch-status
- FR29: System can automatically fail over to alternative LLM provider on primary provider failure

### Quality & Review

- FR30: Chief of Staff can evaluate reports on 5 criteria: conclusion quality, evidence/sources, risk assessment, format compliance, logical coherence
- FR31: System can automatically trigger rework when report fails quality gate
- FR32: CEO can provide thumbs up/down feedback on delivered reports
- FR33: System can track quality gate pass rates and display in performance dashboard

### Collective Intelligence (AGORA)

- FR34: CEO can initiate round-based debates among 6 department managers (2 rounds standard, 3 rounds deep)
- FR35: System can stream debate proceedings in real-time via SSE
- FR36: System can present debate results with diff view highlighting position differences
- FR37: System can synthesize final debate consensus/dissensus summary

### Strategy Room (Trading)

- FR38: CEO can view real-time portfolio dashboard (cash, holdings, returns, total assets)
- FR39: CEO can manage watchlist with drag-sort, market filter (KR/US), and 60-second auto-refresh
- FR40: System can execute automated trades via KIS Securities API (Korean/US markets)
- FR41: CIO agent can independently calculate position sizing from confidence scores (CEO Idea #003)
- FR42: CEO can select investment style (Conservative/Balanced/Aggressive)
- FR43: CEO can run paper trading with configurable initial capital using real market data

### Content Publishing (SNS)

- FR44: CMO team can generate content for Instagram, YouTube, Tistory, Daum Cafe, LinkedIn
- FR45: CEO can review, approve, or reject AI-generated content before publishing
- FR46: System can schedule content for future publication
- FR47: System can automatically publish approved content via Selenium automation
- FR48: CMO team can create card news series (5-10 slides)

### SketchVibe (Visual Collaboration)

- FR49: CEO can draw diagrams on Cytoscape.js canvas with 8 node types (agent, system, api, decide, db, start, end, note)
- FR50: System can bidirectionally convert between Mermaid code and Cytoscape canvas elements
- FR51: AI can read current canvas state as Mermaid via read_canvas() MCP tool
- FR52: AI can add/modify canvas nodes in real-time via MCP SSE connection
- FR53: CEO can save confirmed diagrams and load them from knowledge base

### Dashboard & Monitoring

- FR54: CEO can view summary cards (today's tasks, today's cost, agent count, external integration status)
- FR55: CEO can view AI usage charts by provider (Anthropic/OpenAI/Google)
- FR56: CEO can view and set daily/monthly budget limits with progress indicators
- FR57: CEO can execute quick actions (routine commands, system commands, recent commands)
- FR58: CEO can provide satisfaction feedback displayed as approval rate pie chart

### Activity Logging

- FR59: CEO can view activity log with 4 tabs: Activity, Communications, QA, Tools
- FR60: CEO can view delegation records (from -> to, message, cost, tokens) in Communications tab
- FR61: CEO can search, filter, bookmark, tag, and archive command history
- FR62: CEO can compare two historical task results side-by-side (A/B comparison)
- FR63: CEO can replay (re-execute) any historical command

### Knowledge & Memory

- FR64: Admin can manage RAG document store with folder structure and drag-and-drop upload
- FR65: System can automatically inject department-relevant knowledge into agent system prompts
- FR66: System can automatically extract key learning points from completed tasks
- FR67: System can automatically reference relevant past learnings in similar future tasks

### Scheduling & Automation

- FR68: CEO can create cron-scheduled commands with presets (daily 9AM, daily 6PM, weekly Mon 10AM) or custom cron expressions
- FR69: CEO can enable/disable scheduled tasks with toggle
- FR70: System tracks last_run and next_run for each scheduled task

### Intelligence Collection (ARGOS)

- FR71: System can collect real-time news and data based on configured triggers
- FR72: CEO can view ARGOS status bar (data OK, AI OK, trigger count, today's cost)
- FR73: CEO can view activity log and error log for intelligence collection

### External Communication

- FR74: CEO can command AI organization via Telegram with @mention support
- FR75: CEO can receive department reports and cost updates via Telegram push
- FR76: Team members can communicate via in-company messenger

### Performance Analysis

- FR77: CEO can view Soul Gym with per-agent improvement suggestions, trust scores, and token estimates
- FR78: CEO can view quality dashboard (total reviews, pass rate, average score, failure list)
- FR79: CEO can view per-agent performance metrics (invocations, success rate, average cost, average time)

### Report Management

- FR80: CEO can store reports in classified archive with department and security grade filters
- FR81: System can find similar reports (correlation search)

### Workflow Automation

- FR82: CEO can create multi-step workflows (data collection -> analysis -> report)
- FR83: System can track workflow execution state (currentStep, done, error)

### Multi-tenancy & Admin

- FR84: Admin can create and manage companies in admin console
- FR85: Admin can invite and manage employees per company
- FR86: System isolates all data by companyId - no cross-tenant access
- FR87: Admin can manage credential vault (encrypted API keys per company)
- FR88: System provides separate authentication for admin users and app users via JWT

---

## Non-Functional Requirements

### Performance

- NFR1: Simple commands (single agent, no tools) complete within 30 seconds
- NFR2: Complex commands (multi-agent, parallel tools) complete within 3 minutes
- NFR3: WebSocket message delivery latency < 100ms
- NFR4: Dashboard page load time < 2 seconds
- NFR5: Watchlist price refresh completes within 60-second cycle

### Security

- NFR6: All API credentials stored with AES-256-GCM encryption in credential vault
- NFR7: All database queries filtered by companyId (tenant isolation)
- NFR8: JWT tokens with appropriate expiration and refresh mechanism
- NFR9: Tool invocations permission-checked before execution
- NFR10: All inter-agent communication logged for audit trail

### Scalability

- NFR11: System supports 10+ concurrent companies with independent agent organizations
- NFR12: System supports 50+ concurrent users across all tenants
- NFR13: Agent orchestration supports 10+ parallel specialist executions per command
- NFR14: Tool system handles 100+ concurrent tool invocations

### Reliability

- NFR15: 24-hour continuous operation with < 5% error rate
- NFR16: LLM provider failover within 5 seconds on primary failure
- NFR17: WebSocket auto-reconnection on connection drop
- NFR18: Graceful degradation when individual tools fail (command continues with available results)

### Integration

- NFR19: Support 3+ LLM providers simultaneously (Anthropic, OpenAI, Google)
- NFR20: KIS Securities API for Korean/US market trading
- NFR21: Telegram Bot API for mobile command interface
- NFR22: Selenium WebDriver for SNS platform automation
- NFR23: MCP SSE protocol for SketchVibe AI collaboration
