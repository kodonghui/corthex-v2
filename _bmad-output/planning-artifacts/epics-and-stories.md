---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# CORTHEX v3 "OpenClaw" - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for CORTHEX v3 "OpenClaw", decomposing the requirements from the PRD, Architecture, and UX Design Specification into implementable stories.

**Source Documents Validated:**
- PRD: `_bmad-output/planning-artifacts/prd.md` (~96k tokens) -- 123 active FRs, 81 active NFRs (76 original + 5 added in Step 1 review: P18, S11-S14), 80 domain-specific requirements
- Architecture: `_bmad-output/planning-artifacts/architecture.md` (~71k tokens) -- 76 technical requirements (AR1-AR76)
- UX Design: `_bmad-output/planning-artifacts/ux-design-specification.md` (~87k tokens) -- 140 UX requirements, 67 pages, 7 layout types, 7 custom components

**Key v3 Features:**
- OpenClaw Virtual Office (PixiJS 8 + @pixi/react)
- n8n Workflow Integration (Docker + Hono reverse proxy)
- Agent Personality System (Big Five / OCEAN model)
- Agent Memory Architecture (Observations + Reflections + Voyage AI)
- Marketing Automation (n8n preset workflows)
- Tool Response Security (prompt injection defense)
- CEO App Page Consolidation (14 pages -> 6 groups)
- UXUI Full Redesign (Natural Organic theme, Sovereign Sage tokens)

**v2 Baseline:** 21 epics, 98 stories, 10,154 tests, 485 API endpoints, 86 DB tables

## Requirements Inventory

### Functional Requirements

#### Agent Execution (FR1-FR10)

- **FR1**: [Phase 1] Users can send natural language commands to agents via the Hub
- **FR2**: [Phase 1] Agents can perform tasks using permitted tools (including full v1 tool compatibility)
- **FR3**: [Phase 1] Agents can hand off tasks to other agents using the call_agent tool
- **FR4**: [Phase 1] Handoffs can go N levels deep (company-configurable max, default 5 levels)
- **FR5**: [Phase 1] Agents can hand off to multiple sub-agents in parallel (company-configurable max, default 10)
- **FR6**: [Phase 1] Agent responses are delivered to users in real-time via SSE streaming
- **FR7**: [Phase 1] On SDK messages.create() failure, the system auto-retries once then displays an error message to the user
- **FR8**: [Phase 1] All agents have the call_agent tool by default (Admin cannot remove it)
- **FR9**: [Phase 1] Agents detect circular references in handoff chains and refuse the handoff
- **FR10**: [Phase 1] Multiple users commanding the same agent simultaneously are processed as independent sessions

#### Secretary & Orchestration (FR11-FR20)

- **FR11**: [Phase 2] Admin can assign or unassign a secretary agent to/from a Human employee
- **FR12**: [Phase 2] When a user with a secretary sends a natural language command, the secretary routes it to the appropriate agent
- **FR13**: [Phase 2] Users without a secretary can directly select an agent from the agent list and issue commands
- **FR14**: [Phase 2] The Hub for users with a secretary displays a chat-input-centric layout (agent list hidden)
- **FR15**: [Phase 2] The Hub for users without a secretary displays agent list selection followed by chat
- **FR16**: [Phase 2] Manager agents cross-verify results from sub-agents and present conflicting opinions side-by-side
- **FR17**: [Phase 2] Agents reject out-of-scope requests and suggest the appropriate agent
- **FR18**: [Phase 2] Users with a secretary can only access agents within the scope defined in the secretary's Soul
- **FR19**: [Phase 2] Users without a secretary can select any agent in their company
- **FR20**: [Phase 2] When Admin adds an agent, it is immediately usable without code changes

#### Soul Management (FR21-FR25)

- **FR21**: [Phase 2] Admin can edit an agent's Soul
- **FR22**: [Phase 2] Soul edits are reflected from the next request onward, changing agent behavior (no deployment required)
- **FR23**: [Phase 1] Soul template variables ({agent_list}, {subordinate_list}, {tool_list}, etc.) are auto-substituted with DB data
- **FR24**: [Phase 2] Default Soul templates (3 types: secretary/manager/specialist) are auto-applied when creating new agents
- **FR25**: [Phase 2] All Souls automatically include a prohibition section (preventing token exposure, out-of-scope actions)

#### Organization Management (FR26-FR33)

- **FR26**: [Phase 2] Admin can create/update/delete departments
- **FR27**: [Phase 2] Admin can create/update/delete AI agents and assign them to departments
- **FR28**: [Phase 2] Admin can register/update/delete Human employees and manage CLI tokens
- **FR29**: [Phase 2] Admin can assign/unassign available tools to agents
- **FR30**: [Phase 3] Admin can visually edit the organization chart in NEXUS (drag-and-drop department/agent placement)
- **FR31**: [Phase 3] Organization structure saved in NEXUS takes effect immediately (no deployment required)
- **FR32**: [Phase 2] CEO/Human can view the NEXUS organization chart in read-only mode
- **FR33**: [Phase 2] System refuses when Admin tries to delete the Chief of Staff (root agent)

#### Tier Management (FR34-FR38)

- **FR34**: [Phase 3] Admin can create/update/delete N-level tiers (max 10 levels)
- **FR35**: [Phase 3] Each tier auto-maps to an LLM model (via tier_configs table lookup)
- **FR36**: [Phase 3] Admin can change an agent's tier
- **~~FR37~~**: Deleted -- CLI Max flat rate, cost tracking unnecessary
- **FR38**: [Phase 1] The original commander's CLI token propagates throughout the entire handoff chain
- **~~FR39~~**: Deleted -- CLI Max flat rate, cost status page unnecessary

#### Security & Audit (FR40-FR45)

- **FR40**: [Phase 1] Agents calling unauthorized tools are blocked (tool-permission-guard)
- **FR41**: [Phase 1] API key/token patterns in agent output are auto-masked (credential-scrubber + output-redactor)
- **FR42**: [Phase 1] All tool calls are recorded in audit logs (after token filtering)
- **FR43**: [Phase 1] CLI tokens are stored encrypted
- **FR44**: [Phase 2] CLI tokens are never injected into Soul/system prompts
- **FR45**: [Phase 1] Data is isolated between companies (multi-tenant row-level isolation)

#### Real-time Monitoring (FR46-FR49)

- **FR46**: [Phase 2] The Hub tracker displays handoff chains in real-time (which agent is working)
- **FR47**: [Phase 2] On agent failure, displayed to user as "XX failed to respond -> summarized from remaining" format (zero black-box errors)
- **FR48**: [Phase 1] On server memory overload, users are warned and new sessions are restricted
- **FR49**: [Phase 2] If ongoing work is interrupted by server restart, user is notified

#### Library -- Knowledge & Briefing (FR50-FR56)

- **FR50**: [Phase 4] Agents can find related documents via semantic vector search
- **FR51**: [Phase 4] When a user requests a voice briefing, NotebookLM generates audio asynchronously
- **FR52**: [Phase 4] On voice briefing request, user immediately receives a "generating" notification
- **FR53**: [Phase 4] Generated voice briefings are auto-sent via Telegram
- **FR54**: [Phase 4] On voice generation failure, a text briefing is sent as fallback
- **FR55**: [Phase maintained] ARGOS cron jobs auto-run analysis + briefing at scheduled times
- **FR56**: [Phase maintained] Users can command agents via Telegram

#### Development Collaboration (FR57-FR58)

- **FR57**: [Phase 4] Claude Code CLI can read/write/approve canvas via SketchVibe MCP tools
- **FR58**: [Phase 4] Users in browser can select [Apply]/[Reject] on approval requests

#### Onboarding (FR59-FR61)

- **FR59**: [Phase 2] New users' CLI token validity is auto-verified upon input
- **FR60**: [Phase 2] First-time users can one-click "Create Default AI Organization" (Chief of Staff + default departments auto-created)
- **FR61**: [Phase 2] Admin can complete company initial setup (company info + Humans + departments + agents + tools)

#### v1 Compat & UX (FR62-FR68)

- **FR62**: [Phase maintained] Users can view previous conversation history
- **FR63**: [Phase maintained] Agents maintain previous conversation context within the same session
- **FR64**: [Phase maintained] Agents auto-save learned content during tasks and use it later (autoLearn)
- **FR65**: [Phase maintained] Users can attach files (images/documents) and send them to agents
- **FR66**: [Phase 2] Users can cancel an in-progress agent task
- **FR67**: [Phase 2] Users can copy agent responses
- **FR68**: [Phase 2] Agent responses are rendered as markdown (tables/code/lists)

#### Phase 5+ Reserved (FR69-FR72)

- **FR69**: [Phase 5+] Users can search past conversations by keyword
- **FR70**: [Phase 5+] Users can toggle theme (dark/light)
- **FR71**: [Phase 5+] Admin can view audit logs
- **FR72**: [Phase 5+] Users can use core Hub features with keyboard only

#### v3 OpenClaw Virtual Office (FR-OC1 to FR-OC11)

- **FR-OC1**: [Sprint 4] CEO app `/office` page renders a pixel art office canvas (`packages/office/` independent package). PixiJS 8 + @pixi/react loaded via `React.lazy` + `dynamic import` only on `/office` route entry (CEO app main bundle <= 200KB -- Brief section 4. Go/No-Go #5 is PixiJS bundle only, NFR-P13. Verified via Vite bundle analysis)
- **FR-OC2**: [Sprint 4] Agent execution state changes (idle/working/speaking/tool_calling/error) are broadcast in real-time via WebSocket `/ws/office` channel. Auth: same JWT token method as existing 16 WS channels. Connection limits: max 50 concurrent connections per company, 500 server-wide (excess -> oldest connection dropped + client reconnect notice -- NRT-5, confirmed decision #10)
- **FR-OC3**: [Sprint 4] Idle agents display pixel art characters in random walk animation
- **FR-OC4**: [Sprint 4] Working agents display typing animation with task content speech bubble (max 50 chars)
- **FR-OC5**: [Sprint 4] tool_calling agents display tool icon and spark effect
- **FR-OC6**: [Sprint 4] Error agents display red exclamation mark and stop animation
- **FR-OC7**: [Sprint 4] Server detects `activity_logs` table changes and generates state events (`engine/agent-loop.ts` unmodified). Implementation: 500ms polling (LISTEN/NOTIFY impossible on Neon serverless). `office-channel.ts` uses Hono WebSocket Helper `upgrade()` pattern
- **FR-OC8**: [Sprint 4] OpenClaw package failure does not affect existing Hub/agent execution (independent package isolation)
- **FR-OC9**: [Sprint 4] On mobile/tablet, `/office` displays a simplified list view (PixiJS canvas disabled, agent status text only)
- **FR-OC10**: [Sprint 4] Screen reader accessible aria-live text alternative panel is provided ("Marketing agent: currently writing report" format)
- **FR-OC11**: [Sprint 4] Admin app can view `/office` in read-only mode (no task commands, observation only)

#### v3 n8n Workflow Integration (FR-N8N1 to FR-N8N6)

- **FR-N8N1**: [Sprint 2] Admin can view n8n workflow list in Admin app via Hono reverse proxy API (Stage 1 confirmed: API-only, no iframe)
- **FR-N8N2**: [Sprint 2] CEO app can view n8n workflow execution results in read-only mode
- **FR-N8N3**: [Sprint 2] Existing workflow self-implementation code (server routes + frontend pages) is deleted
- **FR-N8N4**: [Sprint 2] n8n Docker container runs independently on Oracle VPS internal port 5678. Security mandatory (N8N-SEC 8-layer): (1) VPS firewall blocks port 5678 externally (2) n8n editor UI active (Admin-only via Hono proxy) (3) Hono proxy() reverse proxy with tenantMiddleware JWT + Admin auth + tag-based multi-tenant isolation (4) Per-company HMAC webhook signature verification (5) n8n Docker resource limits: memory 2G, cpus 2 (6) n8n cannot directly access CORTHEX PostgreSQL DB (7) n8n credential encryption: AES-256-GCM (8) n8n API rate limiting: 60/min
- **FR-N8N5**: [Sprint 2] On n8n failure, CEO app displays "Workflow service temporarily suspended" message (no full app crash)
- **FR-N8N6**: [Sprint 2] Admin can access n8n visual editor via Hono proxy to edit workflows (JWT + Admin auth + CSRF Origin verification)

#### v3 Marketing Automation (FR-MKT1 to FR-MKT7)

- **FR-MKT1**: [Sprint 2] Admin can select AI tool engines by category in company settings (image 3+ types, video 4+ types, narration 2 types, subtitles 3 types)
- **FR-MKT2**: [Sprint 2] n8n marketing preset workflow auto-executes: topic input -> AI research -> card news + short-form simultaneous generation -> human approval -> multi-platform posting. Partial platform failure retains successful platforms
- **FR-MKT3**: [Sprint 2] After content generation, humans can approve/reject via CEO app web UI or Slack/Telegram preview
- **FR-MKT4**: [Sprint 2] AI tool engine setting changes take effect immediately from the next workflow execution
- **FR-MKT5**: [Sprint 2] During onboarding, "Install marketing automation template?" suggestion is displayed
- **FR-MKT6**: [Sprint 2] Admin can toggle ON/OFF copyright watermark insertion for AI-generated content
- **FR-MKT7**: [Sprint 2] On external AI API failure, fallback engine auto-switches and Admin receives notification

#### v3 Agent Personality System (FR-PERS1 to FR-PERS9)

- **FR-PERS1**: [Sprint 1] Admin can adjust Big Five personality 5 sliders (0-100 integer) on agent create/edit page
- **FR-PERS2**: [Sprint 1] Personality settings are stored in `agents.personality_traits JSONB` column (migration #61). Server validates via Zod schema. DB CHECK constraint on all 5 axes. String-type values rejected to prevent prompt injection
- **FR-PERS3**: [Sprint 1] `soul-enricher.ts` substitutes 5 individual extraVars from DB integer values to behavioral text before agent-loop.ts call (only 1 line inserted in engine/agent-loop.ts per PER-2)
- **FR-PERS4**: [Sprint 1] Personality changes take effect immediately from the next session (no deployment required)
- **FR-PERS5**: [Sprint 1] Implemented solely via prompt injection, with zero code branching (if/switch)
- **FR-PERS6**: [Sprint 1] Admin can select role presets (e.g., "Strategic Analyst", "Customer Service", "Creative Planner") to auto-fill sliders
- **FR-PERS7**: [Sprint 1] At least 3 default presets are provided
- **FR-PERS8**: [Sprint 1] Each slider position shows behavioral example tooltips
- **FR-PERS9**: [Sprint 1] Personality sliders are keyboard-operable via left/right arrows with `aria-valuenow` + `aria-valuetext`

#### v3 Agent Memory Architecture (FR-MEM1 to FR-MEM14)

- **FR-MEM1**: [Sprint 3] On agent execution completion, results are auto-saved to `observations` table after MEM-6 4-layer defense
- **FR-MEM2**: [Sprint 3] Observations content auto-vectorized via Voyage AI Embedding (voyage-3, 1024d) stored in `embedding VECTOR(1024)` column
- **FR-MEM3**: [Sprint 3] Background worker (memory-reflection.ts) runs as daily cron, processing when per-agent unreflected observations >= 20 AND confidence >= 0.7. Tier-based daily limits. Advisory lock for concurrent prevention. Cost overrun auto-pauses
- **FR-MEM4**: [Sprint 3] Reflection worker summarizes 20 recent observations via Haiku API and stores in `agent_memories` table with `memoryType='reflection'`
- **FR-MEM5**: [Sprint 3] agent_memories(reflection) content auto-vectorized via Voyage AI Embedding (voyage-3, 1024d)
- **FR-MEM6**: [Sprint 3] At task start, `soul-enricher.ts` searches agent_memories(reflection) with cosine >= 0.75, retrieves top 3, injects into Soul via `{relevant_memories}` variable
- **FR-MEM7**: [Sprint 3] On memory search failure (pgvector outage), `{relevant_memories}` falls back to empty string and agent execution proceeds
- **FR-MEM8**: [Sprint 3] company_id isolation on all observations and agent_memories queries
- **FR-MEM9**: [Sprint 3] CEO can view per-agent Reflection history and growth metrics
- **FR-MEM10**: [Sprint 3] New Reflection generation sends notification to CEO via Notifications WebSocket
- **FR-MEM11**: [Sprint 3] Admin can view and manage per-agent observations + agent_memories(reflection) data
- **FR-MEM12**: [Sprint 3] 4-layer content defense: (1) 10KB size limit (2) control character strip (3) prompt hardening (4) content classification. Blocked content -> Admin flag + audit log
- **FR-MEM13**: [Sprint 3] reflected=true observations auto-deleted after 30 days. Admin can adjust retention period
- **FR-MEM14**: [Sprint 3] Reflection cron cost exceeds daily limit -> auto-pause + Admin notification. Admin confirmation required to resume

#### v3 Tool Response Security (FR-TOOLSANITIZE1 to FR-TOOLSANITIZE3)

- **FR-TOOLSANITIZE1**: [Sprint 2] Agents detect prompt injection patterns in external tool responses
- **FR-TOOLSANITIZE2**: [Sprint 2] Detected prompt injection replaced with "[BLOCKED: suspected injection]" + audit log
- **FR-TOOLSANITIZE3**: [Sprint 2 impl, Sprint 3 verification] 100% block rate against 10 adversarial payloads

#### v3 CEO App Page Consolidation (FR-UX1 to FR-UX3)

- **FR-UX1**: [Parallel] CEO app 14 pages consolidated into 6 groups (hub+command-center, classified+reports+files->Documents, argos+cron-base, home+dashboard, activity-log+ops-log, agents+departments+org)
- **FR-UX2**: [Parallel] Merged pages' original routes redirect to new routes (bookmark compatibility)
- **FR-UX3**: [Parallel] Merged pages retain 100% of existing functionality

### Non-Functional Requirements

#### Performance (NFR-P1 to NFR-P18)

- **NFR-P1**: [P1, Phase 1] Hub initial load: FCP <= 1.5s, LCP <= 2.5s (Lighthouse)
- **NFR-P2**: [P1, Phase 2] Admin console initial load: FCP <= 2s (Lighthouse)
- **NFR-P3**: [P1, Phase 3] NEXUS 50+ node render: maintain 60fps
- **NFR-P4**: [P1, Phase 1] Bundle size: Hub <= 200KB gzip, Admin <= 500KB gzip
- **NFR-P5**: [P0, Phase 1] API response time: existing P95 +/- 10%
- **NFR-P6**: [P0, Phase 1] call_agent 3-level handoff: E2E <= 60s (each level <= 15s)
- **NFR-P7**: [P2, Phase 1] call_agent 5-level handoff: E2E <= 90s, memory <= 50MB
- **NFR-P8**: [P0, Phase 1] Session timeout: messages.create() max 120s
- **NFR-P9**: [P1, Phase 1] WebSocket reconnection: <= 3s auto-reconnect
- **NFR-P10**: [P1, Phase 2] Tracker event latency: <= 100ms
- **NFR-P11**: [P2, Phase 4] Voice briefing E2E: <= 4min, success rate 90%+
- **NFR-P12**: [P1, Phase 1] Korea TTFB: <= 500ms (via Cloudflare CDN)
- **NFR-P13**: [P0, Sprint 4] `/office` page load: FCP <= 3s, PixiJS bundle <= 200KB gzipped
- **NFR-P14**: [P1, Sprint 4] /ws/office state sync: agent-loop execution -> pixel state reflection <= 2s
- **NFR-P15**: [P1, Sprint 4] /ws/office heartbeat: adaptive interval (idle 30s / active 5s)
- **NFR-P16**: [P1, Sprint 3] Reflection cron execution: per-agent 20 observations summarization <= 30s
- **NFR-P17**: [P1, Sprint 2] Marketing workflow E2E: image <= 2min, video <= 10min, posting <= 30s
- **NFR-P18**: [P1, Sprint 3] Semantic vector search latency: P95 <= 200ms for cosine similarity query (50 agents, 10K observations, HNSW index). soul-enricher memory retrieval must not add > 300ms to session startup _[Added: Step 1 review — quinn]_

#### Security (NFR-S1 to NFR-S14)

- **NFR-S1**: [P0] CLI token encryption: AES-256, decryption key separated as environment variable
- **NFR-S2**: [P0, Phase 1] Token memory exposure: variable immediately null-ed after messages.create()
- **NFR-S3**: [P0] Process isolation: Docker namespace separation + SDK temp files `/tmp/{sessionId}/`
- **NFR-S4**: [P0, Phase 1] output-redactor: 100% masking of `sk-ant-cli-*`, `sk-ant-api-*`, OAuth Bearer
- **NFR-S5**: [P0, Phase 1] credential-scrubber: 100% API key pattern filtering
- **NFR-S6**: [P0, Phase 1] tool-permission-guard: 100% blocking of unauthorized tools
- **~~NFR-S7~~**: Deleted -- CLI Max flat rate adopted; cost-tracker removed from v3 scope (GATE 2026-03-20)
- **NFR-S8**: [P0, Sprint 1] personality_traits sanitization: 100% pass of 4-layer defense
- **NFR-S9**: [P0, Sprint 2] n8n security layers: 100% pass of N8N-SEC-1~8
- **NFR-S10**: [P0, Sprint 3] Observation content sanitization: 100% pass of MEM-6 4-layer + minimum 10 adversarial payloads (extensible test framework required — OWASP prompt injection library 50+ patterns as expansion target)
- **NFR-S11**: [P0, Phase 1] HTTP security headers: CSP (Content-Security-Policy), HSTS (Strict-Transport-Security), X-Frame-Options: DENY, X-Content-Type-Options: nosniff, CORS policy (allow only app/admin origins). Multi-tenant SaaS mandatory baseline _[Added: Step 1 review — quinn]_
- **NFR-S12**: [P0, Phase 1] File attachment security (FR65): max file size 10MB, type whitelist (image/png, image/jpeg, image/gif, image/webp, application/pdf, text/plain, text/csv), filename sanitization (path traversal prevention), content-type validation (magic bytes, not just extension). Malware scanning deferred to Phase 5+ _[Added: Step 1 review — quinn]_
- **NFR-S13**: [P1, Phase 1] Authentication rate limiting: CLI token registration/verification endpoints rate limited (10 req/min per IP). Login brute-force prevention _[Added: Step 1 review — quinn]_
- **NFR-S14**: [P1, Pre-Sprint] Dependency vulnerability scanning: `bun audit` or equivalent in CI pipeline. Critical/High CVE = build failure. Dependabot or equivalent for automated PR alerts _[Added: Step 1 review — quinn]_

#### Scalability (NFR-SC1 to NFR-SC9)

- **NFR-SC1**: [P0, Phase 1] Concurrent sessions: minimum 10 concurrent messages.create(). Exceeded -> 429
- **NFR-SC2**: [P0, Phase 1] Session memory: <= 50MB per messages.create() session
- **NFR-SC3**: [P1, Phase 1] Memory monitoring: 80%+ warning, 90%+ new session rejection
- **NFR-SC4**: [P1, Phase 3] Agent count: no performance degradation with 50+ agents
- **NFR-SC5**: [P1, Phase 1] SDK compatibility: auto-compatible with 0.2.72 ~ 0.2.x patches
- **NFR-SC6**: [P0, Phase 1] Graceful degradation: SDK abnormal termination -> error + auto-retry once
- **NFR-SC7**: [P2, Sprint 3-4] Total memory: pgvector HNSW index included <= 3GB
- **NFR-SC8**: [P1, Sprint 4] /ws/office concurrent connection load test: 50/company + 500/server
- **NFR-SC9**: [P0, Sprint 2] n8n Docker resources: <= 2G RAM, <= 2 CPU

#### Availability (NFR-AV1 to NFR-AV3)

- **NFR-AV1**: [P1] Service uptime: 99%
- **NFR-AV2**: [P1] Recovery time: unplanned downtime recovery within 30 minutes
- **NFR-AV3**: [P1] DB backup: PostgreSQL daily auto-backup, 7-day retention

#### Accessibility (NFR-A1 to NFR-A7)

- **NFR-A1**: [P1] WCAG 2.1 AA (minimum)
- **NFR-A2**: [P1, Phase 1] Color contrast: 4.5:1+ (text), 3:1+ (UI)
- **NFR-A3**: [P1, Phase 2] Tracker accessibility: aria-live="polite" text updates
- **NFR-A4**: [P2, Phase 2] Keyboard basics: Tab navigation + Enter to send
- **NFR-A5**: [P1, Sprint 1] Big Five slider accessibility: aria-valuenow + aria-valuetext + keyboard operation
- **NFR-A6**: [P1, Sprint 4] /office screen reader: aria-live="polite" text alternative panel
- **NFR-A7**: [P1, Sprint 4] /office responsive: mobile/tablet list view switch

#### Data Integrity & Retention (NFR-D1 to NFR-D8)

- **NFR-D1**: [P1, Phase 3] DB migration: 100% data preservation + lossless rollback
- **NFR-D2**: [P1, Phase 3] Migration zero downtime: online, zero service interruption
- **NFR-D3**: [P2, Phase 4] Vector generation failure: embedding = NULL allowed
- **NFR-D4**: [P2, Phase 4] Semantic search quality: 1+ additional relevant doc vs keyword search
- **NFR-D5**: [P1] Conversation history retention: unlimited
- **NFR-D6**: [P1, Phase 2] Company deletion: complete deletion of all company data
- **~~NFR-D7~~**: Deleted -- CLI Max flat rate adopted; per-company cost tracking unnecessary (GATE 2026-03-20)
- **NFR-D8**: [P1, Sprint 3] Observations 30-day TTL, agent_memories(reflection) indefinite

#### External Dependencies (NFR-EXT1 to NFR-EXT3)

- **NFR-EXT1**: [P0] Claude CLI outage: "Service temporarily unavailable" message
- **NFR-EXT2**: [P0] Partial failure isolation: individual external API failure does not crash system
- **NFR-EXT3**: [P1] API timeout: default 30s (MKT video up to 5min)

#### Operations (NFR-O1 to NFR-O11)

- **NFR-O1**: [P1] Zero-downtime deployment: Docker graceful shutdown -> new container
- **NFR-O2**: [P1, Phase 1] Zombie prevention: cleanup after SDK termination
- **NFR-O3**: [P2, Phase 4] pgvector ARM64: Docker build verified
- **NFR-O4**: [P0, Phase 1] Response quality maintenance: 10 prompts A/B blind >= existing v2 baseline (baseline: measured pre-Phase 1 on 5 key APIs with current v2 production responses, stored in `_bmad-output/test-artifacts/quality-baseline.md`)
- **NFR-O5**: [P1, Phase 2] Secretary routing accuracy: 10 predefined scenarios (stored in `_bmad-output/test-artifacts/routing-scenarios.md` — covering: direct dept request, ambiguous request, cross-dept, out-of-scope, follow-up, multi-step, Korean/English, abbreviation, typo, concurrent). 8/10+ = pass
- **NFR-O6**: [P1, Phase 2] Soul reflection rate: 3 rule scenarios × 10 requests = 30 tests (rules: prohibition compliance, tool restriction, scope boundary). 24/30+ = 80%+
- **NFR-O7**: [P1, Phase 2] Admin initial setup: <= 15 minutes
- **NFR-O8**: [P1, Phase 3] CEO NEXUS first design: <= 10 minutes
- **NFR-O9**: [P1, Sprint 2] n8n Docker health: /healthz every 30s, 3 failures -> auto-restart
- **NFR-O10**: [P1, Sprint 3] Reflection cron stability: advisory lock + Voyage API rate compliance
- **NFR-O11**: [P1, all] CEO daily task completion: <= 5 minutes (reference task: /office → identify working agent → Chat → issue "summarize today's progress" command → /office verify result. Measured end-to-end from browser open to task confirmation)

#### Cost (NFR-COST1 to NFR-COST3)

- **NFR-COST1**: [P1] Infrastructure operating cost: <= $10/month excluding CLI Max
- **NFR-COST2**: [P2] Voyage AI Embedding: <= $5/month
- **NFR-COST3**: [P0, Sprint 3] Reflection cron cost: Haiku API <= $0.10/day per company

#### Logging (NFR-LOG1 to NFR-LOG3)

- **NFR-LOG1**: [P1, Phase 1] Structured logs: JSON format
- **NFR-LOG2**: [P1, Phase 1] Log retention: minimum 30 days
- **NFR-LOG3**: [P2, Phase 2] Error alerts: Telegram or admin console notification

#### Browser Compatibility (NFR-B1 to NFR-B3)

- **NFR-B1**: [P0] Chrome latest 2 versions -- release gate
- **NFR-B2**: [P1] Safari latest 2 versions -- WebSocket/SSE compatibility check
- **NFR-B3**: [P2] Firefox/Edge latest 2 versions -- fix when reported

#### Code Quality (NFR-CQ1)

- **NFR-CQ1**: Adheres to CLAUDE.md coding conventions (strict TypeScript, kebab-case, API response format) and deployment protocol (tsc --noEmit mandatory)

### Additional Requirements

#### From Architecture (AR1-AR72)

##### Pre-Sprint / Infrastructure Setup (AR1-AR7)

- **AR1**: Delete `@google/generative-ai` package and install `voyageai` 0.2.1. Create `services/voyage-embedding.ts` with `getEmbedding(companyId, text)` and `getEmbeddingBatch(companyId, texts[], batchSize=32)`. Direct voyageai SDK import forbidden elsewhere
- **AR2**: Voyage AI re-embed migration: `vector(768)` to `vector(1024)` on `knowledge_docs` table + HNSW index rebuild (migration `0061_voyage_vector_1024.sql`). Irreversible. Go/No-Go #10, blocks Sprint 1
- **AR3**: Pin correction: convert all `^` versions to exact pin for core packages. Docker tag pin: `n8nio/n8n:2.12.3` (`:latest` forbidden)
- **AR4**: `bun.lockb` must be committed. CI must enforce `bun install --frozen-lockfile`
- **AR5**: Evaluate minor version updates for Hono, @anthropic-ai/sdk, Drizzle ORM (non-breaking only)
- **AR6**: Neon Pro upgrade is a blocker for all sprints
- **AR7**: VPS resource budget: Oracle ARM64 4-core, 24GB RAM. Peak ~12GB RAM, ~12GB headroom

##### Engine Architecture (AR8-AR25)

- **AR8**: All agent execution through `engine/agent-loop.ts` single entry point. Six callers. Hook bypass impossible
- **AR9**: engine/ public API = exactly 2 files: `agent-loop.ts` + `engine/types.ts`. No barrel export. CI `engine-boundary-check.sh` enforces
- **AR10**: `SessionContext` immutable interface with `readonly` fields. Spread-copy for handoff. Only agent-loop.ts creates SessionContext
- **AR11**: `engine/types.ts` server-internal only. Re-export to `@corthex/shared` forbidden
- **AR12**: Hook pipeline execution order fixed: PreToolUse (tool-permission-guard), PostToolUse (credential-scrubber -> output-redactor -> delegation-tracker). Hook errors -> session abort
- **AR13**: `db/scoped-query.ts` implements `getDB(companyId)`. All business logic uses `getDB(ctx.companyId)`
- **AR14**: SSE event types exactly 6: accepted, processing, handoff, message, error, done
- **AR15**: Soul template uses `{{variable}}` double-brace. 7 built-in variables (`agent_list`, `subordinate_list`, `tool_list`, `department_name`, `owner_name`, `specialty`, `knowledge_context`) + `extraVars` extensibility (personality_*, relevant_memories). Only `soul-renderer.ts` performs substitution
- **AR16**: Phase 1 handoff is sequential only. Parallel deferred to Phase 2+
- **AR17**: Model selector maps tierConfig.modelPreference. Phase 1-4 Claude only. `llm-router.ts` frozen
- **AR18**: SDK mocking: mock only Agent.query(). All CORTHEX code runs real
- **AR19**: Error code system with domain prefixes: AUTH_, AGENT_, SESSION_, HANDOFF_, TOOL_, ORG_
- **AR20**: Structured logging with pino (preferred) / consola (fallback). Child logger pattern
- **AR21**: Test infrastructure: unit CI ($0), weekly SDK test (~$1), A/B quality (manual ~$5)
- **AR22**: Docker graceful shutdown. CI/CD on same server
- **AR23**: `console.log(error)` anti-pattern. Must use structured `log.error()`
- **AR24**: API response format: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **AR25**: Rate limiter: 20 concurrent sessions (4-core basis). Session memory <= 200MB. Total <= 16GB

##### Sprint 1: Big Five Personality (AR26-AR32)

- **AR26**: `agents.personality_traits` JSONB column with DB CHECK ensuring exactly 5 keys: `{ openness: number, conscientiousness: number, extraversion: number, agreeableness: number, neuroticism: number }` (full lowercase, no abbreviations). NULL allowed (backward compat). Zod: `z.object({ openness: z.number().int().min(0).max(100), conscientiousness: z.number().int().min(0).max(100), extraversion: z.number().int().min(0).max(100), agreeableness: z.number().int().min(0).max(100), neuroticism: z.number().int().min(0).max(100) })`. Migration `0062_add_personality_traits.sql`
- **AR27**: `services/soul-enricher.ts` as single entry point for personality + memory extraVars. Located in `services/` (not engine/ — E8 boundary). Interface: `enrich(agentId, companyId): Promise<EnrichResult>` where `EnrichResult = { personalityVars: Record<string,string>, memoryVars: Record<string,string> }`. Relationship: callers call `enrich()` → merge result with `knowledgeVars` → pass all as `extraVars` to `soul-renderer.ts renderSoul()` → renderer substitutes `{{variable}}` templates. soul-enricher GENERATES vars, soul-renderer SUBSTITUTES them. Sprint 1: personality only. Sprint 3: +memory (additive extension, interface frozen after Sprint 1)
- **AR28**: All 9 renderSoul callers (12 call sites) must be updated: call `soulEnricher.enrich()`, merge with knowledgeVars, pass as extraVars
- **AR29**: PER-1 4-layer sanitization: Key Boundary -> API Zod -> extraVars strip -> Template regex
- **AR30**: 3+ presets hard-coded: balanced, creative, analytical. DB seed migration
- **AR31**: NULL personality_traits -> empty objects. DB error -> empty result + log.warn
- **AR32**: `agent-loop.ts` must NOT import soul-enricher directly. Callers pass pre-rendered soul

##### Sprint 2: n8n + Marketing + Tool Sanitizer (AR33-AR41)

- **AR33**: n8n Docker Compose: image `n8nio/n8n:2.12.3`, localhost only, SQLite DB, 2G/2CPU hard caps, AES-256-GCM encryption, healthcheck every 30s
- **AR34**: N8N-SEC 8-layer security: all required, partial deployment forbidden
- **AR35**: `routes/admin/n8n-proxy.ts` Hono proxy(). Path normalization (double-dot blocked). Admin JWT. OOM recovery
- **AR36**: n8n->CORTHEX callback: `host.docker.internal:host-gateway`
- **AR37**: Tool sanitizer at PreToolResult point (not PostToolUse). Two paths need sanitization (L265, L277), three internal paths don't
- **AR38**: Minimum 10 regex patterns for prompt injection detection (extensible framework — OWASP prompt injection patterns as expansion target, 25+ diverse payloads recommended). Match -> replace with `[BLOCKED: suspected prompt injection in tool response]` + audit log to activity_logs
- **AR39**: Marketing settings in `company.settings` JSONB. AES-256 encrypted API keys. Atomic `jsonb_set()` update
- **AR40**: n8n preset workflows as JSON in `_n8n/presets/`. Install via n8n API. Auto-tag company
- **AR41**: JSONB race condition: `jsonb_set()` + WHERE conditional. Last-write-wins acceptable

##### Sprint 3: Agent Memory (AR42-AR49)

- **AR42**: `observations` table schema: UUID PK, company_id, agent_id, session_id, content TEXT CHECK <= 10KB, `outcome VARCHAR(20) DEFAULT 'unknown'` (valid values: 'success', 'failure', 'unknown' — used by FR-MEM9 growth metrics), `domain VARCHAR(50) DEFAULT 'conversation'`, `importance INTEGER 1-10 DEFAULT 5`, `confidence REAL 0-1 DEFAULT 0.5`, embedding VECTOR(1024), reflected BOOLEAN DEFAULT false, flagged BOOLEAN DEFAULT false. Migration `0063_add_observations.sql`
- **AR43**: Three indexes on observations: partial (unreflected+importance), HNSW (embedding), TTL (reflected_at)
- **AR44**: Confidence scale: observations = REAL 0-1, agent_memories = INTEGER 0-100. Cross-table conversion: `observations.confidence * 100`. Decay: unreflected observations lose 0.1 confidence per week (floor 0.1). Reinforcement: repeated similar observations (cosine >= 0.85) increase confidence by 0.15 (ceiling 1.0). Implemented in `memory-reflection.ts` Sprint 3
- **AR45**: `agent_memories` extension: add `memoryType='reflection'` enum, add `embedding VECTOR(1024)`, add HNSW index. Migration `0064_extend_agent_memories.sql`
- **AR46**: MEM-6 4-layer sanitization: size limit -> control char strip -> prompt hardening -> content classification
- **AR47**: Reflection cron: daily 3AM + company hash stagger. pg_try_advisory_xact_lock. >= 20 observations. Tier caps. Haiku model. Cost > $0.10/day -> pause
- **AR48**: Observations 30-day TTL (reflected=true). agent_memories(reflection) permanent
- **AR49**: Memory search in soul-enricher: cosine >= 0.75, top 3, `{relevant_memories}` injection

##### Sprint 4: OpenClaw Virtual Office (AR50-AR54)

- **AR50**: `packages/office/` independent Turborepo workspace. PixiJS 8.17.1 + @pixi/react 8.0.5 (exact pin). Only in office package. Vite library mode build
- **AR51**: App imports via `React.lazy(() => import('@corthex/office'))`. PixiJS tree-shaking (6 classes). Go/No-Go #5: <= 200KB gzipped. Load failure -> fallback UI
- **AR52**: `/ws/office` WebSocket as 17th channel. `WsChannel` union extended. JWT auth. 50/company, 500/server limits
- **AR53**: Real-time state via 500ms polling (not LISTEN/NOTIFY). Adaptive: poll only when clients connected. Diff with previous, skip if unchanged. Rate limit 10msg/s
- **AR54**: `turbo.json` must add `"office#build"` pipeline entry

##### Cross-Sprint / Parallel (AR55-AR58)

- **AR55**: FR-UX page consolidation: 14 -> 6 groups. Existing routes get `<Navigate to="/new-route" replace />` redirects. Feature deletion forbidden
- **AR56**: UXUI Reset (Layer 0) parallel. Natural Organic theme (cream #faf8f5, olive #283618, sand #e5e1d3). **Light mode only for v3 launch** (Architecture's "Dark mode only" was v2 Phase 7 carry-forward — superseded by UX Design's v3 direction. See Reconciliation Notes). Lucide React. Inter + JetBrains Mono. No color hardcoding. ESLint `no-hardcoded-colors` rule enforced. Applied per-Sprint to relevant pages
- **AR57**: Code disposition matrix: agent-runner.ts replaced, delegation-tracker replaced, chief-of-staff/manager-delegate/cio-orchestrator deleted, llm-router.ts frozen, trading/telegram/selenium untouchable
- **AR58**: "Untouchable" definition: business logic unchanged. Allowed: import path changes, SessionContext creation. Forbidden: feature add/remove

##### Security (AR59-AR61)

- **AR59**: CLI token lifecycle: registration (SDK validation), execution (env injection), expiration. Token null-ed after query(). Never in Soul
- **AR60**: Three independent sanitization chains (PER-1, MEM-6, TOOLSANITIZE). Never import each other. Each defends different attack surface
- **AR61**: engine/types.ts re-export to shared forbidden

##### Testing & Go/No-Go Gates (AR62-AR64)

- **AR62**: 14 Go/No-Go gates: #1 Zero Regression, #2 Big Five injection, #3 n8n security, #4 Memory Zero Regression, #5 PixiJS bundle, #6 Hardcoded colors, #7 Reflection cost, #8 AI sprite approval, #9 Observation poisoning, #10 Voyage migration, #11 Tool sanitization, #12 v1 feature parity, #13 CEO daily task, #14 Capability evaluation
- **AR63**: Phase 1 regression: 8 automated CI tests + 3 manual + 1 semi-auto
- **AR64**: First story: dependency verification (install, turbo build, bun test, Zod v4/v3 conflict, Dockerfile, ARM64)

##### Conventions & Error Codes (AR65-AR66)

- **AR65**: Naming: DB tables snake_case plural, columns snake_case with _id FK, API endpoints /api/{scope}/{resource}, files kebab-case, components PascalCase, hooks use-{feature}.ts, stores {feature}-store.ts, tests {feature}.test.ts
- **AR66**: 18 v3 error codes to add to `lib/error-codes.ts`

##### Data Flow & Integration (AR67-AR69)

- **AR67**: Sprint 3 memory pipeline: agent-loop Stop -> hub.ts -> sanitize -> INSERT observations -> cron -> Haiku -> Voyage -> INSERT agent_memories -> enrich -> renderSoul -> agent-loop
- **AR68**: External integrations: Voyage AI, n8n external AI, Claude Haiku for reflection
- **AR69**: Internal integration points per Sprint documented

##### Risk Mitigations (AR70)

- **AR70**: R1 PixiJS fallback to Canvas 2D. R6 n8n Docker limits. R7 personality 4-layer. R8 AI sprite deterministic tools. R9 soul-renderer empty string validation

##### Implementation Sequence (AR71-AR72)

- **AR71**: Strict order: Pre-Sprint -> Sprint 1 -> Sprint 2 -> Sprint 3 -> Sprint 4. Layer 0 UXUI interleaved. Layer 0 >= 60% by end of Sprint 2
- **AR72**: Total changes: ~29 NEW files + ~85 MODIFY + 1 DELETE + ~12 test files

##### Missing ECC Items (AR73-AR75)

- **AR73**: [ECC-1, Sprint 1, HIGH] call_agent response standardization. `tool-handlers/builtins/call-agent.ts` must parse child agent responses into `{ status: 'success'|'failure'|'partial', summary: string, next_actions?: string[], artifacts?: object[] }` structured format. Currently forwards raw events. Coordinates with AR28 (same file, soul-enricher migration)
- **AR74**: [ECC-2, Sprint 1, MEDIUM] Cost-aware model routing. `engine/model-selector.ts` extended with Admin-configurable cost preference per tier. Reflection cron hardcoded to Haiku (cheapest). AR17 `llm-router.ts` freeze unaffected — model-selector.ts is separate file in engine/
- **AR75**: [ECC-5, Sprint 3, HIGH] Capability evaluation test framework. Standard task corpus (minimum 10 tasks across 5 categories) + automated evaluation pipeline. 3+ repeated iterations, 3rd iteration rework must be <= 50% of 1st. Go/No-Go #14 gate

##### Voyage AI Operational Limits (AR76)

- **AR76**: Voyage AI embedding rate limits: voyage-3 model — 300 RPM (requests per minute), 1M tokens/min. Monthly budget: NFR-COST2 <= $5/month. Rate limit exceeded → exponential backoff (1s, 2s, 4s, max 30s). Embedding generation failure → embedding = NULL (VEC-2 fallback). `services/voyage-embedding.ts` must implement retry + rate tracking

#### From UX Design (UXR1-UXR140)

##### Responsive Design (UXR1-UXR14)

- **UXR1**: 4-breakpoint system: sm(<640px), md(640-1023px), lg(1024-1439px), xl(>=1440px). Custom Tailwind v4 breakpoints
- **UXR2**: Mobile (sm): single column, bottom tab bar (5 items), card stack. PixiJS disabled
- **UXR3**: Tablet (md): single column, collapsible sidebar (56px/280px), hamburger nav. PixiJS disabled
- **UXR4**: Desktop (lg): fixed sidebar 280px, 2-column grid, PixiJS 30fps
- **UXR5**: Wide (xl): fixed sidebar 280px, 3-column grid, max-width 1440px, PixiJS 60fps, 3-pane layout
- **UXR6**: FPS transition lg(30fps)/xl(60fps): 500ms debounce, matchMedia listener
- **UXR7**: Desktop-first SPA, mobile-first CSS (min-width). max-width prohibited
- **UXR8**: Mobile bottom nav: cream bg + top border, 56px, 5 tabs
- **UXR9**: Mobile sidebar = overlay drawer with backdrop blur. Desktop sidebar = permanent 280px
- **UXR10**: Tables: desktop=full, tablet=scroll/card toggle, mobile=card list
- **UXR11**: Big Five sliders mobile: vertical-stacked full-width
- **UXR12**: NEXUS mobile: read-only only
- **UXR13**: Dialogs tablet: full-width with 16px padding
- **UXR14**: Multi-panel: 2+ panels -> 1 panel + tab switching on smaller screens

##### App Shell & Layout (UXR15-UXR18)

- **UXR15**: App shell: Sidebar(280px, olive #283618) + Topbar(56px, cream) + Content(fluid, cream, max-width 1440px, padding 32px)
- **UXR16**: 7 layout types: Dashboard (auto-fit grid), Master-Detail (280px list + flex-1), Canvas (full-bleed), CRUD (single-col max-width), Tabbed (tabs+content), Panels (2x2 grid), Feed (720px centered)
- **UXR17**: React Router v7, React.lazy code splitting. No page transition animations
- **UXR18**: Content max-width Pre-Sprint decision: 1440px vs 1280px

##### Design System & Tokens (UXR19-UXR35)

- **UXR19**: Single theme: **Natural Organic** (cream/olive/sand palette). "Sovereign Sage" was v2 dark theme name — deprecated along with all 5 v2 themes. No theme switching UI. **Light mode only for v3 launch.** Dark mode deferred to post-launch with token mapping layer. v3 reverses v2's dark-mode-only direction to light-mode-only
- **UXR20**: Color tokens: `corthex-*` namespace in Tailwind v4 `@theme`. No hardcoded values
- **UXR21**: 60-30-10 distribution: 60% Cream/Surface/Sand, 30% Olive, 10% Sage accent
- **UXR22**: Semantic colors: Success #4d7c0f, Warning #b45309, Error #dc2626, Info #2563eb, Handoff #7c3aed. Always icon+text+color
- **UXR23**: Success vs Accent confusion prevention: success requires CheckCircle icon + text
- **UXR24**: Input border #908a78 (WCAG compliant). Decorative border #e5e1d3 never on interactive controls
- **UXR25**: Typography: Inter (UI), JetBrains Mono (code), Noto Serif KR (Korean long-form). 2-font max per view. Self-hosted @fontsource. <= 300KB initial
- **UXR26**: Noto Serif KR lazy-loaded (4-8MB CJK). font-display: optional (Noto), swap (Inter, JetBrains)
- **UXR27**: Type scale Major Third (1.250x): 12/14/16/18/20/24/32/40/48px
- **UXR28**: 8px base grid (4px half-step). Spacing tokens: 4/8/12/16/24/32/48/64/96px
- **UXR29**: Border radius: sm:4, md:8, lg:12, xl:16, full:9999px
- **UXR30**: Shadow system: none, sm, md, lg. No shadow+border on same element
- **UXR31**: Z-index scale: base(0), sticky(10), sidebar(20), overlay/bottom-nav/FAB(30), drawer(40), dropdown(50), modal(60), toast(70), tooltip(80), command-palette(100)
- **UXR32**: Radix UI primitives foundation. shadcn/ui copy-paste into `packages/ui/src/components/`
- **UXR33**: Subframe-to-Radix migration: Pre-Sprint aligns tokens, new pages Radix only, post-v3 Subframe removal
- **UXR34**: Lucide React icons exclusively. Tree-shaken per-icon imports. Min 16px. Decorative: aria-hidden, interactive: aria-label
- **UXR35**: Charts: Recharts or Subframe Chart restyled. CVD-safe 4-hue palette. 3+ series = pattern fills

##### Accessibility (UXR36-UXR49)

- **UXR36**: WCAG 2.1 AA full compliance. Text >= 4.5:1, UI >= 3:1
- **UXR37**: Focus ring: 2px solid + 2px offset. Focus-visible only. Double ring pattern
- **UXR38**: Focus trap in modals/drawers/command-palette. ESC to escape. Focus restoration
- **UXR39**: Skip-to-content link on every page
- **UXR40**: Color independence: status = icon + text + color always
- **UXR41**: `prefers-reduced-motion: reduce` respected. PixiJS -> static icons
- **UXR42**: Windows High Contrast Mode: `forced-colors: active` fallback
- **UXR43**: Touch targets: 44px mobile, 36px desktop minimum
- **UXR44**: Semantic HTML: nav, main, aside, section, article. No div abuse
- **UXR45**: Language: `<html lang="ko">`, English blocks `lang="en"`
- **UXR46**: Screen reader: sidebar role="navigation", toasts role="status", errors role="alert", tables role="table", charts role="img"
- **UXR47**: Keyboard: Tab/Shift+Tab, Enter/Space, Arrow keys, ESC, Cmd+K, Shift+Arrow for sliders
- **UXR48**: Form error recovery: auto-focus first error field + aria-describedby
- **UXR49**: Sidebar badge: white on red (#dc2626) 4.83:1 + white outline ring + circle + number

##### Animation & Motion (UXR50-UXR55)

- **UXR50**: Only `transform` and `opacity` animatable. Layout-triggering prohibited
- **UXR51**: No page transition animations
- **UXR52**: Duration tokens: fast(100ms), normal(200ms), slow(300ms), pulse(2000ms infinite)
- **UXR53**: Agent working pulse: opacity 1->0.5->1, 2s cycle
- **UXR54**: Default transitions: 150ms ease-out (hover), 200ms ease-in-out (state change)
- **UXR55**: Skeleton shimmer: surface->border, 0.8s cycle. Reduced motion: solid bg

##### Real-Time & WebSocket (UXR56-UXR62)

- **UXR56**: /ws/office real-time agent status, <= 500ms reflection
- **UXR57**: WebSocket auto-reconnect: 3s interval, max 5 attempts. Fallback: 5s polling + banner
- **UXR58**: After 5 failures: "Please refresh" message
- **UXR59**: Heartbeat: idle 30s / active 5s. 15s no heartbeat = degraded, 30s = error
- **UXR60**: Chat SSE streaming: token-by-token + blinking cursor. Sentence-level aria-live
- **UXR61**: WebSocket disconnect banner: "Reconnecting... (2/5)"
- **UXR62**: /office: shell paint + WS handshake parallel. FCP <=1.5s, TTI <=3s

##### Error Handling UX (UXR63-UXR71)

- **UXR63**: Error format: `[E-XXX-NNN] Korean description + next action`
- **UXR64**: Security errors: "Input has a problem" only. No detailed cause
- **UXR65**: Vague errors prohibited. Must be specific with resolution
- **UXR66**: Destructive confirmation: name-typing for delete/reset. Simple for toggle/tier change
- **UXR67**: Ctrl+Z undo: last 5 actions on CRUD pages (agent/department/tier create/update, Soul edit, settings change — excludes deletions which require confirmation). NEXUS: 10-action undo stack (node move, connection add/remove, department resize)
- **UXR68**: Partial failure: 1 agent failure doesn't block chain
- **UXR69**: Guided rejection: out-of-scope -> suggest correct agent
- **UXR70**: Rate limit UX: message + disabled send button + cooldown
- **UXR71**: Loading thresholds: <200ms none, 200ms-2s skeleton, 2s+ text, 10s+ retry guidance

##### Navigation (UXR72-UXR78)

- **UXR72**: CEO sidebar: 6 groups (Core, Workspace, Organization, Tools, System, Footer) with Lucide icons
- **UXR73**: Admin sidebar: 5 groups (Overview, Organization, AI Config, Automation, System)
- **UXR74**: Global search (Cmd+K): cmdk library. Search agents/departments/workflows/pages/settings
- **UXR75**: Breadcrumb at 2+ depth levels
- **UXR76**: Tab-based sub-nav: Agent Detail (Info/Soul/Big Five/Memory/History), Settings (10 tabs)
- **UXR77**: All pages must have unique deeplink URLs. Filter state in URL query params
- **UXR78**: Browser back button must work on all pages

##### User Flow & Interaction (UXR79-UXR88)

- **UXR79**: All action feedback <= 500ms. 1-second feedback rule
- **UXR80**: Optimistic updates: save -> UI reflects before server response
- **UXR81**: Chat routing display: `[Secretary -> AgentName - DeptName]` tag. Re-route button
- **UXR82**: Streaming: react-markdown + remark-gfm, JetBrains Mono code blocks, cursor during stream
- **UXR83**: /office interaction: click -> popover detail, double-click dept -> zoom, drag -> pan, ESC -> reset
- **UXR84**: /office mobile: list view with status text + badge. Same WebSocket source
- **UXR85**: /office canvas accessibility: role="img", aria-live region, "Switch to text view" toggle
- **UXR86**: Viewport culling: only visible agents active. Pan/Zoom: Ctrl+Wheel, pinch
- **UXR87**: /office performance: 50 agents at 30fps, memory <= 200MB
- **UXR88**: Secretary: 0-click routing (with secretary), 2-click (~5s, without). First-use tooltip

##### Onboarding (UXR89-UXR95)

- **UXR89**: Admin wizard: 6 steps with progress bar. <= 15 minutes total
- **UXR90**: Skip allowed only Step 1. Step 2 required. Back preserves input. Auto-focus
- **UXR91**: 15-minute timeout: "Continue later" save + resume on next login
- **UXR92**: Completion: celebration + CEO invite link + 2 CTAs
- **UXR93**: CEO first visit WOW: pre-scheduled task or auto demo task
- **UXR94**: CEO first visit: "Welcome" + active agent count. /office "NEW" badge
- **UXR95**: Each step: checkmark + "Next: [step name]". <= 2.5 min/step target

##### Custom Components (UXR96-UXR102)

- **UXR96**: CC-1 OfficeCanvas: PixiJS 8 + @pixi/react. 32x32px sprites, 5-state animations, department zones, name labels, speech bubbles, handoff lines
- **UXR97**: CC-2 NexusCanvas: React Flow v12. Department/Agent nodes. Admin full-edit, CEO read-only, Onboarding preset variants
- **UXR98**: CC-3 BigFiveSliderGroup: Radix Slider. 5 OCEAN sliders, preset dropdown, live behavior preview (300ms debounce)
- **UXR99**: CC-4 HandoffTracker: Agent avatar chain, per-node status, progress bar, parallel branch support
- **UXR100**: CC-5 StreamingMessage: Token-by-token rendering, react-markdown, states (streaming/complete/tool_calling/error)
- **UXR101**: CC-6 WorkflowPipelineView: DAG node graph, execution status, history table, brief/detail variants
- **UXR102**: CC-7 MemoryTimeline: Date separators, Observation/Reflection cards, security badges, J/K keyboard nav

##### Empty State & Loading (UXR103-UXR105)

- **UXR103**: All empty states: illustration + title + description + CTA. Never blank pages
- **UXR104**: Empty variants: first-use, no search results, no filter results, data collecting
- **UXR105**: Loading: page skeleton, component skeleton, button spinner, inline spinner, streaming cursor

##### Modal & Dialog (UXR106-UXR107)

- **UXR106**: Dialog sizes: sm(400)/md(560)/lg(720). Sheet 400px right-slide. Command palette full overlay
- **UXR107**: No nested modals. Scroll lock. Focus trap. Close: ESC, outside click (except AlertDialog), X

##### Forms (UXR108-UXR111)

- **UXR108**: Input states: default(sand border), focus(accent 2px), error(red 2px + tint), disabled(50% opacity), read-only(no border)
- **UXR109**: Validation: real-time format (300ms debounce), on-blur required, on-submit server
- **UXR110**: Layout: 1-3 fields=single column, 4-8=2-column grid on lg+, 10+=section separation
- **UXR111**: Floating label pattern for form inputs

##### Toast & Feedback (UXR112-UXR114)

- **UXR112**: Toast types: Success(2s), Error(5s+close), Warning(4s+close), Info(3s). Bottom-right
- **UXR113**: Max 3 stacked. 4th removes oldest. Error may include "Retry" button
- **UXR114**: Accessibility: info/success=polite, error/warning=assertive

##### Buttons (UXR115-UXR117)

- **UXR115**: Hierarchy: Primary(sage bg, 1/page), Secondary(cream bg+border), Tertiary(text link), Destructive(red), Ghost(hover only)
- **UXR116**: Sizes: sm(32), md(40 default), lg(48 CTA), icon(40x40). All 44px touch target
- **UXR117**: States: default, hover(10% darker), active(15%+scale 0.98), focus-visible(double ring), disabled(0.50), loading(spinner)

##### Soul Editor (UXR118)

- **UXR118**: CodeMirror 6 (~100KB). Variable autocompletion on `{{`. Diff preview. Template validation

##### n8n Workflow UI (UXR119-UXR121)

- **UXR119**: Workflow list: active/inactive toggle, last execution, next scheduled. 3 preset cards for empty state
- **UXR120**: Preset install: card -> explanation popup -> [Install] -> progress bar -> API key form -> [Activate]
- **UXR121**: Error handling: OOM -> split workflow CTA, API failure -> warning badge per node, 30s timeout + 2 retries + fallback

##### Search & Filter (UXR122-UXR123)

- **UXR122**: Filter types: text search (300ms debounce), dropdown multi-select, date range, column sort
- **UXR123**: Filter persistence in URL query parameters

##### Performance (UXR124-UXR129)

- **UXR124**: FCP <= 1.5s. /office TTI <= 3s
- **UXR125**: Chat first token <= 3s (including Secretary routing)
- **UXR126**: All completions must have feedback. No-response forbidden
- **UXR127**: CSS units: rem (fonts/spacing), %/fr (layout), px (border/shadow only)
- **UXR128**: Images: `<picture>` + srcSet for 2x, WebP preferred, AVIF fallback
- **UXR129**: `@media (hover: hover)` -- hover effects mouse-only

##### Testing (UXR130-UXR132)

- **UXR130**: Automated: axe-core on every commit, Playwright a11y on PR, Lighthouse on deploy
- **UXR131**: CI thresholds: axe-core critical=0, Lighthouse Accessibility >= 90
- **UXR132**: Manual per sprint: keyboard-only, VoiceOver, color blindness, real mobile, low-end device

##### State Management (UXR133)

- **UXR133**: Zustand 5 (client) + React Query 5 (server). /office WebSocket in Zustand, API in React Query

##### Miscellaneous (UXR134-UXR140)

- **UXR134**: Sidebar width: 280px (standardized, matches --sidebar-width design token). Master-detail list width: 280px (Korean text accommodation)
- **UXR135**: Re-education: `?` icon guide per page, Settings > "Replay tutorial", Hub "Help" widget
- **UXR136**: Agent personality comparison: before/after sample response A/B preview
- **UXR137**: Chat misroute reporting: 1-click "Report wrong routing". 3+ triggers Admin notification
- **UXR138**: Handoff tracker sidebar: sequential nodes, parallel branches, status dots, progress lines
- **UXR139**: Container queries: use Tailwind v4 `@container` for component-level responsive behavior (sidebar collapse card variants, master-detail panel width adaptation). Pre-Sprint research task → Sprint 1 implementation if supported
- **UXR140**: CSS co-existence: Subframe `brand-*`/`neutral-*`, Radix `corthex-*`. Never mix. No `!important`

### Domain-Specific Requirements (DSR1-DSR80)

*Domain requirements define "what must be upheld" (regulatory/domain constraints). Quantitative targets reference corresponding NFR sections.*

#### Security (SEC-1 to SEC-7)

- **SEC-1**: CLI token DB encryption: AES-256, decryption key separated as environment variable [Phase: maintained]
- **SEC-2**: Token memory exposure minimization: variable null-ed immediately after messages.create() [Phase 1]
- **SEC-3**: Process environment isolation: Docker process namespace separation [Phase: maintained]
- **SEC-4**: output-redactor patterns: `sk-ant-cli-*`, `sk-ant-api-*`, OAuth Bearer — all masked [Phase 1]
- **SEC-5**: Audit log token filter: credential-scrubber applied before audit_logs recording [Phase 1]
- **SEC-6**: Soul token access forbidden: CLI token never injected into Soul/system prompts [Phase 2]
- **SEC-7**: Token rotation: on token expiration/renewal, in-progress sessions graceful termination [Phase 5+]

#### SDK Dependencies (SDK-1 to SDK-4)

- **SDK-1**: Fixed 8 API surface: messages.create(), tool(), createSdkMcpServer(), hooks, env, maxTurns, permissionMode, allowedTools
- **SDK-2**: Unstable API ban: `unstable_*` prefix APIs forbidden in Phase 1-4
- **SDK-3**: SDK update protocol: 0.2.x patch auto. 0.3.x: manual agent-loop.ts adaptation + testing
- **SDK-4**: SDK removal preparedness: agent-loop.ts interface designed SDK-independently

#### DB Constraints (DB-1 to DB-5)

- **DB-1**: tier_level upper bound 10 (CHECK constraint) [Phase 3]
- **DB-2**: Secretary must have owner (CHECK: is_secretary=true → owner_user_id NOT NULL) [Phase 2]
- **DB-3**: Existing document vectorization batch migration (embedding NULL → fill). Post Pre-Sprint Voyage migration, scope reduces to remaining NULLs [Phase 4]
- **DB-4**: Zero-downtime migration (online, zero service interruption) [Phase 3]
- **DB-5**: Migration rollback script prepared (integer → enum restoration) [Phase 3]

#### Orchestration (ORC-1 to ORC-7)

- **ORC-1**: Handoff depth max 5 levels (company-configurable) [Phase 1]
- **ORC-2**: Parallel handoff max 10 (configurable) [Phase 1]
- **ORC-3**: Agent metadata auto-injection into Soul (DB → Soul template variable substitution) [Phase 1]
- **ORC-4**: tier → model auto-mapping (tier_configs lookup) [Phase 1+3]
- **ORC-5**: 3 default Soul templates (secretary/manager/specialist) [Phase 2]
- **ORC-6**: Manager Soul must include cross-verification + conflict handling + error handling instructions [Phase 2]
- **ORC-7**: call_agent included in all agents by default (cannot be removed) [Phase 1]

#### Soul Template (SOUL-1 to SOUL-6)

- **SOUL-1**: Secretary Soul auto-inject variables: `{agent_list}`, `{owner_name}`
- **SOUL-2**: Manager Soul auto-inject variables: `{subordinate_list}`, `{department_name}`
- **SOUL-3**: Specialist Soul auto-inject variables: `{tool_list}`, `{specialty}`
- **SOUL-4**: All Souls include prohibition section (token exposure prevention, out-of-scope action ban)
- **SOUL-5**: Manager Soul includes cross-verification (numeric comparison) + conflict side-by-side + error fallback-to-remaining instructions
- **SOUL-6**: soul-renderer.ts substitutes Soul template variables with DB data before passing to messages.create()

#### Operations (OPS-1 to OPS-6)

- **OPS-1**: Concurrent messages.create() session limit: default 10, exceed → 429
- **OPS-2**: Session timeout: messages.create() max 120s, exceed → forced termination + error
- **OPS-3**: Memory monitoring: server memory 80%+ warning, 90%+ new session rejection
- **OPS-4**: Subprocess zombie prevention: cleanup after SDK termination. Zombie cron cleanup
- **OPS-5**: pgvector ARM64 compatibility: Docker build verified before Phase 4
- **OPS-6**: Zero-downtime deployment: Docker graceful shutdown → new container start

#### NotebookLM (NLM-1 to NLM-4)

- **NLM-1**: Fallback: MCP failure → text briefing via Telegram (no audio)
- **NLM-2**: Google OAuth credentials: 1 Google account per company. Admin console OAuth flow
- **NLM-3**: Async generation: voice generation async. "Request submitted" immediate notification → Telegram on completion
- **NLM-4**: Phase 4 tool scope: `audio_briefing` + `notebook` only. mindmap/slides/flashcards/infographic deferred to Phase 5+

#### Vector Search (VEC-1 to VEC-4)

- **VEC-1**: Document chunk splitting: auto-split at 2,048 tokens (retrieval accuracy optimal chunk size; Voyage AI actual limit 32K)
- **VEC-2**: Vector generation failure → document storage proceeds (embedding = NULL allowed)
- **VEC-3**: Existing document batch vectorization: migration script for entire knowledge_docs
- **VEC-4**: Similarity threshold + return limit: default cosine >= 0.7, top 5. Company-configurable

#### v3 n8n Security (N8N-SEC-1 to N8N-SEC-8) — Sprint 2

- **N8N-SEC-1**: Port 5678 external block: Oracle Security List localhost only. External curl → connection refused
- **N8N-SEC-2**: n8n editor Admin-only: `N8N_DISABLE_UI=false` + Hono proxy `/admin/n8n-editor/*` → Admin JWT verification. CEO JWT → 403
- **N8N-SEC-3**: Tag-based multi-tenant isolation: `?tags=company:{companyId}` mandatory. Cross-company access blocked
- **N8N-SEC-4**: Webhook HMAC verification: HMAC signature verification mandatory on n8n webhook endpoints
- **N8N-SEC-5**: Docker resource caps: memory 2G, cpus 2, NODE_OPTIONS=--max-old-space-size=1536. OOM → auto-restart (restart: unless-stopped)
- **N8N-SEC-6**: CORTHEX DB direct access forbidden: n8n → PostgreSQL direct connection blocked. CORTHEX REST API only
- **N8N-SEC-7**: n8n credential encryption: N8N_ENCRYPTION_KEY env var AES-256-GCM
- **N8N-SEC-8**: n8n API rate limiting: 60 req/min (configurable). DDoS/abuse prevention

#### v3 Big Five Personality (PER-1 to PER-6) — Sprint 1

- **PER-1**: 4-layer sanitization: Layer 0 Key Boundary (spread order reversal, 6 built-in key conflict rejection) → Layer A API Zod → Layer B extraVars newline/delimiter strip + 200-char cap → Layer C Template regex
- **PER-2**: 5 individual personality extraVars: `personality_openness`, `personality_conscientiousness`, `personality_extraversion`, `personality_agreeableness`, `personality_neuroticism` — generated by soul-enricher.ts
- **PER-3**: Default neutral 50: new agents get all 5 traits at 50. Role presets provided as separate templates
- **PER-4**: Soul injection failure fallback: renderSoul() missing extraVars → fallback string injected + worker log warning. Agent execution not interrupted
- **PER-5**: Accessibility: slider `aria-valuenow/min/max`, `aria-valuetext` (value meaning), `aria-label` (trait name). Keyboard: arrows ±1, Shift+arrows ±10. Aligned with FR-PERS9, NFR-A5
- **PER-6**: Slider behavior example tooltips: hover/focus shows agent behavior example for current value (e.g., Openness 80 → "Actively suggests new approaches")

#### v3 Agent Memory (MEM-1 to MEM-7) — Sprint 3

- **MEM-1**: Zero Regression: existing `agent_memories` table data 0 disruption. observations = new table + agent_memories extended with memoryType='reflection' (Option B, no separate reflections table)
- **MEM-2**: Reflection cron trigger + Tier limits: daily 3AM cron, reflected=false >= 20 AND confidence >= 0.7. Tier 1-2 unlimited, Tier 3-4 weekly 1x cap. Haiku <= $0.10/day. Cost overrun → auto-pause. pg_advisory_xact_lock concurrent prevention
- **MEM-3**: Reflection cron isolation: cron failure does not affect agent execution. Independent worker process
- **MEM-4**: Memory deletion authority: Admin only can delete Reflection/Observation. CEO read-only
- **MEM-5**: Memory utilization audit log: when Reflection injected into Soul via soul-enricher.ts → activity_logs record (memory_id, agent_id, relevance score)
- **MEM-6**: Observation 4-layer content defense: (1) max 10KB size limit (2) control char/unicode attack removal (3) prompt injection hardening (4) content classification → malicious → block + Admin flag. Separate chain from PER-1
- **MEM-7**: Observation 30-day TTL: reflected=true auto-delete after 30 days. Admin retention policy configurable. Neon storage optimization

#### v3 PixiJS Virtual Office (PIX-1 to PIX-6) — Sprint 4

- **PIX-1**: Bundle size: PixiJS 8 + @pixi/react <= 200KB gzipped (Go/No-Go #5, 204,800 bytes)
- **PIX-2**: WebGL → Canvas fallback: auto-switch to Canvas 2D on unsupported browsers
- **PIX-3**: Desktop-only: /office PixiJS canvas desktop-only. Mobile shows list view (name + status text + color badge)
- **PIX-4**: Accessibility: NEXUS nodes `aria-live="polite"` for status changes. Mobile list view (PIX-3) gets `aria-live="polite"` for screen reader status updates
- **PIX-5**: Failure isolation: `packages/office/` independent package. /office render failure does not affect Hub/Chat/NEXUS
- **PIX-6**: Data source: activity_logs table tail (read-only). No new tables. /ws/office channel for state event broadcast

#### v3 Marketing Automation (MKT-1 to MKT-5) — Sprint 2

- **MKT-1**: External API key management: image/video engine API keys stored in company.settings JSONB with AES-256 encryption. `jsonb_set` atomic update mandatory. Separate company_api_keys table deferred to Phase 5+
- **MKT-2**: API failure fallback: n8n Error Workflow → timeout 30s → retry 2x → fallback engine auto-switch + Slack/Telegram notification
- **MKT-3**: Cost attribution: external API costs billed to company's own API keys. CORTHEX does not track (check n8n execution logs)
- **MKT-4**: Content copyright: AI-generated content copyright notice is company-configurable (default: OFF). "AI Generated" watermark option for card news/short-form
- **MKT-5**: Platform API change response: Instagram/TikTok/YouTube API changes handled via n8n node updates. No CORTHEX code modification needed

#### v3 NEXUS Real-Time Status (NRT-1 to NRT-5) — Sprint 4

- **NRT-1**: State model: Brief 5-state (idle/working/speaking/tool_calling/error) + PRD addition (degraded). NEXUS nodes 4-color mapping (idle→blue, active→green, error→red, degraded→orange)
- **NRT-2**: Heartbeat: agent status heartbeat 5s interval. 15s no response → degraded. 30s → error. (Application-layer agent state transition — separate from NFR-P15 WS transport keep-alive)
- **NRT-3**: WebSocket broadcast: /ws/agent-status (existing) for status events. /ws/office (new) for status + PixiJS rendering payload
- **NRT-4**: State latency: actual state → UI display delay <= 2s (via WebSocket, not polling)
- **NRT-5**: WebSocket connection limits: /ws/office + /ws/agent-status: 50 conn/company, 500 conn/server, 10 msg/s per userId (token bucket). Excess → oldest connection dropped + client reconnect notice

### PRD-Architecture Reconciliation Notes

Where PRD and Architecture made conflicting or refined decisions, Architecture takes precedence (as the later, more detailed technical document):

| Topic | PRD Statement | Architecture Resolution |
|-------|--------------|------------------------|
| FR-OC7 Real-time state | PostgreSQL LISTEN/NOTIFY with 500ms polling fallback | **500ms polling only** — LISTEN/NOTIFY impossible on Neon serverless (session loss on compute suspension). AR53 |
| NFR-SC1 Concurrent sessions | Minimum 10 concurrent | **20 concurrent** (4-core basis). AR25 |
| NFR-SC2 Session memory | <= 50MB per session | **<= 200MB** (24GB basis). AR25 |
| Total memory budget | <= 3GB | **<= 16GB** (24GB VPS basis). AR25 |
| Soul template variables | 6 variables listed | **7 built-in variables** (soul-renderer.ts confirmed: +knowledge_context) + extraVars extensibility. AR15, AR27 |
| Parallel handoff | FR5 Phase 1 mentions parallel | Architecture defers parallel (Promise.all) to Phase 2+ (Phase 1 sequential only). AR16 |
| **Dark/Light mode** | UX Design: "Light mode only for v3 launch" (Natural Organic cream theme) | Architecture L2306: "Dark mode only" — **this was v2 Phase 7 carry-forward, superseded by UX Design v3 direction.** Resolution: **Light mode only (Natural Organic)** for v3. AR56 updated. CLAUDE.md "Dark mode 전용" refers to legacy Stitch HTML era, not v3 |
| Adversarial payloads | PRD Go/No-Go: "10 adversarial payloads" per chain | **Minimum 10 + extensible test framework** — OWASP has 50+ patterns. 10 is baseline, not ceiling. AR38, NFR-S10 updated |

### v2→v3 Delta Summary

| Category | v2 Carry-Forward | v3 New | v3 Modified |
|----------|-----------------|--------|-------------|
| FRs | 66 (FR1-FR68, minus deleted FR37/FR39) — Phase 1-4 + maintained | 53 (FR-OC, FR-N8N, FR-MKT, FR-PERS, FR-MEM, FR-TOOLSANITIZE, FR-UX) | 4 (FR69-FR72 moved to Phase 5+) |
| NFRs | 63 original (minus 2 deleted) | 20 new (P13-P18, S8-S14, SC7-SC9, A5-A7, D8, COST2-3, O9-O11) | 0 |
| DSRs | 37 (SEC, SDK, DB, ORC, SOUL, OPS, NLM, VEC) | 43 (N8N-SEC, PER, MEM, PIX, MKT, NRT) | 0 |
| ARs | ~25 retained engine architecture (AR8-AR25) | ~51 new (AR1-7, AR26-AR76) | 0 |

### FR Coverage Map

#### v3 New Feature FRs → Epic Assignment

**Epic 22 — Production Foundation & Voyage AI Migration (Pre-Sprint)**
No direct FRs. Infrastructure prerequisite for all v3 features.

**Epic 23 — Natural Organic Design System (Layer 0, Pre-Sprint → Sprint 2)**
- FR-UX1: CEO app 14→6 page consolidation
- FR-UX2: Original routes redirect to new routes (bookmark compat)
- FR-UX3: Merged pages retain 100% existing functionality

**Epic 24 — Agent Personality System (Sprint 1)**
- FR-PERS1: Big Five 5 sliders (0-100) on agent create/edit
- FR-PERS2: personality_traits JSONB + Zod + DB CHECK
- FR-PERS3: soul-enricher extraVars substitution
- FR-PERS4: Personality changes take effect next session
- FR-PERS5: Prompt injection only, zero code branching
- FR-PERS6: Role presets auto-fill sliders
- FR-PERS7: 3+ default presets
- FR-PERS8: Slider behavioral example tooltips
- FR-PERS9: Keyboard-operable sliders + aria

**Epic 25 — n8n Workflow Integration (Sprint 2)**
- FR-N8N1: Admin views n8n workflow list via Hono proxy
- FR-N8N2: CEO views workflow execution results (read-only)
- FR-N8N3: Delete existing workflow self-implementation code
- FR-N8N4: n8n Docker + N8N-SEC 8-layer security
- FR-N8N5: n8n failure isolation (no full app crash)
- FR-N8N6: Admin accesses n8n visual editor via Hono proxy

**Epic 26 — AI Marketing Automation (Sprint 2, requires Epic 25)**
- FR-MKT1: Admin selects AI tool engines by category
- FR-MKT2: n8n marketing preset auto-execution pipeline
- FR-MKT3: Human approval via CEO app or Slack/Telegram
- FR-MKT4: Engine setting changes take effect immediately
- FR-MKT5: Onboarding marketing template suggestion
- FR-MKT6: Copyright watermark toggle
- FR-MKT7: External AI API fallback + Admin notification

**Epic 27 — Tool Response Security (Sprint 2)**
- FR-TOOLSANITIZE1: Detect prompt injection in tool responses
- FR-TOOLSANITIZE2: Replace injection with [BLOCKED] + audit log
- FR-TOOLSANITIZE3: 100% block rate against adversarial payloads

**Epic 28 — Agent Memory & Learning (Sprint 3)**
- FR-MEM1: Auto-save observations after MEM-6 defense
- FR-MEM2: Observations auto-vectorized via Voyage AI
- FR-MEM3: Background reflection worker (daily cron)
- FR-MEM4: Haiku summarizes 20 observations → reflection
- FR-MEM5: Reflections auto-vectorized via Voyage AI
- FR-MEM6: soul-enricher injects relevant memories into Soul
- FR-MEM7: Memory search failure → graceful fallback
- FR-MEM8: company_id isolation on all queries
- FR-MEM9: CEO views per-agent reflection history + growth
- FR-MEM10: New reflection → CEO notification
- FR-MEM11: Admin manages observations + reflections
- FR-MEM12: 4-layer content defense
- FR-MEM13: 30-day TTL for reflected observations
- FR-MEM14: Cost overrun auto-pause + Admin notification

**Epic 29 — OpenClaw Virtual Office (Sprint 4)**
- FR-OC1: /office page with PixiJS 8 pixel art canvas
- FR-OC2: Agent state changes broadcast via /ws/office
- FR-OC3: Idle agents random walk animation
- FR-OC4: Working agents typing animation + speech bubble
- FR-OC5: tool_calling agents tool icon + spark effect
- FR-OC6: Error agents red exclamation mark
- FR-OC7: Server detects state changes via 500ms polling
- FR-OC8: Office package failure isolation
- FR-OC9: Mobile/tablet simplified list view
- FR-OC10: Screen reader aria-live text alternative
- FR-OC11: Admin app read-only /office view

#### v2 Carry-Forward FRs (66 active, Phase 1-4 + maintained)

All implemented in v2 Epics 1-21 (98 stories, 10,154 tests). Maintained for v3. Regression verified via Go/No-Go #1 (Zero Regression) and #12 (v1 Feature Parity).

| FR Range | Category | v3 Epic Touchpoints |
|----------|----------|-------------------|
| FR1-10 | Agent Execution | Epic 24 (AR28 soul-enricher callers, AR73 call_agent response) |
| FR11-20 | Secretary & Orchestration | Epic 23 (UXUI redesign) |
| FR21-25 | Soul Management | Epic 24 (AR15/AR27 extraVars extension) |
| FR26-33 | Organization Management | Epic 23 (UXUI redesign) |
| FR34-36, FR38 | Tier Management | Epic 23 (UXUI redesign) |
| FR40-45 | Security & Audit | Epic 27 (AR37 tool sanitizer hook integration) |
| FR46-49 | Real-time Monitoring | Epic 23 (UXUI redesign) |
| FR50-56 | Library & Knowledge | Epic 22 (AR1-2 Voyage migration affects semantic search) |
| FR57-58 | Dev Collaboration | No v3 changes |
| FR59-61 | Onboarding | Epic 23 (UXUI redesign), Epic 26 (FR-MKT5 marketing template) |
| FR62-68 | v1 Compat & UX | Epic 23 (UXUI redesign) |

**Deferred:** FR69-72 (Phase 5+ reserved)
**Deleted:** FR37, FR39 (CLI Max flat rate)

#### NFR Coverage Map

| NFR Category | IDs | Epic | Notes |
|-------------|-----|------|-------|
| Performance | P1-4, P12 | Epic 23 | Frontend performance baselines |
| Performance | P5-11 | v2 | Already implemented |
| Performance | P13-15 | Epic 29 | /office PixiJS + WebSocket |
| Performance | P16, P18 | Epic 28 | Reflection cron + vector search |
| Performance | P17 | Epic 26 | Marketing workflow E2E |
| Security | S1-6 | v2 | Already implemented |
| Security | S8 | Epic 24 | Personality sanitization |
| Security | S9 | Epic 25 | n8n security layers |
| Security | S10 | Epic 27 | Tool response sanitization |
| Security | S11-14 | Epic 22 | HTTP headers, file security, rate limiting, dep scanning |
| Scalability | SC1-6 | v2 | Already implemented |
| Scalability | SC7 | Epic 28 | pgvector memory budget |
| Scalability | SC8 | Epic 29 | /ws/office load test |
| Scalability | SC9 | Epic 25 | n8n Docker resources |
| Availability | AV1-3 | v2 | Already implemented |
| Accessibility | A1-4 | Epic 23 | Design system accessibility |
| Accessibility | A5 | Epic 24 | Big Five slider a11y |
| Accessibility | A6-7 | Epic 29 | /office screen reader + responsive |
| Data Integrity | D1-7 | v2 | Already implemented (D7 deleted) |
| Data Integrity | D8 | Epic 28 | Observations 30-day TTL |
| External Deps | EXT1-3 | v2 | Already implemented |
| Operations | O1-8 | v2 | Already implemented |
| Operations | O9 | Epic 25 | n8n Docker health |
| Operations | O10 | Epic 28 | Reflection cron stability |
| Operations | O11 | Epic 29 | CEO daily task completion |
| Cost | COST1 | v2 | Already implemented |
| Cost | COST2 | Epic 22 | Voyage AI budget |
| Cost | COST3 | Epic 28 | Reflection cron cost |
| Logging | LOG1-3 | v2 | Already implemented |
| Browser | B1-3 | Epic 23 | Browser compatibility |
| Code Quality | CQ1 | All | Cross-cutting constraint |

**Deleted:** NFR-S7, NFR-D7 (CLI Max flat rate)

#### DSR Coverage Map

| DSR Category | IDs | Epic | Notes |
|-------------|-----|------|-------|
| Security | SEC-1~7 | v2 | Already implemented |
| SDK | SDK-1~4 | Epic 22 | SDK constraints |
| DB | DB-1~2 | v2 | Already implemented |
| DB | DB-3 | Epic 22 | Voyage batch re-embed |
| DB | DB-4~5 | All | Cross-cutting migration constraint |
| Orchestration | ORC-1~7 | v2 | Already implemented |
| Soul Template | SOUL-1~6 | v2 | Already implemented (touched by Epic 24 AR27/AR28) |
| Operations | OPS-1~6 | v2 | Already implemented |
| NotebookLM | NLM-1~4 | v2 | Phase 4 implemented |
| Vector Search | VEC-1~4 | Epic 22 | Voyage migration scope |
| n8n Security | N8N-SEC-1~8 | Epic 25 | Sprint 2 |
| Personality | PER-1~6 | Epic 24 | Sprint 1 |
| Memory | MEM-1~7 | Epic 28 | Sprint 3 |
| PixiJS | PIX-1~6 | Epic 29 | Sprint 4 |
| Marketing | MKT-1~5 | Epic 26 | Sprint 2 |
| NEXUS RT | NRT-1~5 | Epic 29 | Sprint 4 |

#### AR Coverage Map

| AR Range | Epic | Notes |
|----------|------|-------|
| AR1-7 | Epic 22 | Pre-Sprint infrastructure |
| AR8-25 | All | Cross-cutting engine architecture constraints |
| AR26-32 | Epic 24 | Sprint 1 Personality |
| AR33-36 | Epic 25 | Sprint 2 n8n |
| AR37-38 | Epic 27 | Sprint 2 Tool Sanitizer |
| AR39-41 | Epic 26 | Sprint 2 Marketing |
| AR42-49 | Epic 28 | Sprint 3 Memory |
| AR50-54 | Epic 29 | Sprint 4 OpenClaw |
| AR55-56 | Epic 23 | Page consolidation + UXUI reset |
| AR57-58 | All | Code disposition constraints |
| AR59-61 | All | Security architecture constraints |
| AR62-64 | All | Testing gates (assigned per-epic) |
| AR65-66 | All | Naming conventions + error codes |
| AR67-69 | Per-sprint | Data flow per sprint |
| AR70 | Per-epic | Risk mitigations |
| AR71-72 | All | Implementation sequence + scope constraint |
| AR73-74 | Epic 24 | ECC-1/2 Sprint 1 items |
| AR75 | Epic 28 | ECC-5 Capability evaluation |
| AR76 | Epic 22 | Voyage AI rate limits |

#### UXR Coverage Map

| UXR Range | Epic | Notes |
|-----------|------|-------|
| UXR1-14 | Epic 23 | Responsive design system |
| UXR15-18 | Epic 23 | App shell & layout |
| UXR19-35 | Epic 23 | Design tokens & component library |
| UXR36-49 | Epic 23 | Accessibility foundations |
| UXR50-55 | Epic 23 | Animation & motion |
| UXR56, UXR59, UXR62 | Epic 29 | /office-specific real-time (status sync, heartbeat, FCP) |
| UXR57-58, UXR60-61 | Epic 23 | Cross-cutting WebSocket/SSE patterns (auto-reconnect, disconnect banner, Chat SSE streaming) |
| UXR63-71 | Epic 23 | Error handling UX patterns |
| UXR72-78 | Epic 23 | Navigation |
| UXR79-88 | Epic 23 | User flow & interaction patterns |
| UXR89-95 | Epic 23 | Onboarding |
| UXR96 | Epic 29 | CC-1 OfficeCanvas (PixiJS) |
| UXR97 | Epic 23 | CC-2 NexusCanvas (React Flow redesign) |
| UXR98 | Epic 24 | CC-3 BigFiveSliderGroup |
| UXR99 | Epic 23 | CC-4 HandoffTracker (redesign) |
| UXR100 | Epic 23 | CC-5 StreamingMessage (redesign) |
| UXR101 | Epic 26 | CC-6 WorkflowPipelineView |
| UXR102 | Epic 28 | CC-7 MemoryTimeline |
| UXR103-117 | Epic 23 | Empty states, modals, forms, toasts, buttons |
| UXR118 | Epic 24 | Soul editor (CodeMirror + {{variable}} autocomplete) |
| UXR119-121 | Epic 25 | n8n workflow UI |
| UXR122-123 | Epic 23 | Search & filter patterns |
| UXR124-129 | Epic 23 | Performance patterns |
| UXR130-132 | Epic 23 | Testing automation |
| UXR133 | Epic 23 | State management (Zustand 5 + React Query 5) |
| UXR134-140 | Epic 23 | Miscellaneous (sidebar width, re-education, container queries, CSS co-existence)

## Epic List

**8 epics (Epic 22-29)** continuing from v2's Epic 1-21. Organized by user value, following Architecture AR71 strict order: Pre-Sprint → Sprint 1 → Sprint 2 → Sprint 3 → Sprint 4, with Layer 0 UXUI interleaved.

**Total v3 scope:** 53 new FRs + 3 UX FRs + 15 new NFRs + 43 new DSRs + 51 new ARs + 140 UXRs

---

### Epic 22: Production Foundation & Voyage AI Migration

**Sprint:** Pre-Sprint | **Go/No-Go Gates:** #10
**Estimated Stories:** 5-7

Migrate vector search infrastructure from Gemini to Voyage AI (voyage-3, 1024d), harden all dependencies with exact version pinning, and establish production security baselines (HTTP headers, rate limiting, dependency scanning) that all subsequent sprints depend on.

**User Outcome:** Vector search quality improved with Voyage AI 1024-dimension embeddings. System hardened with security headers, rate limiting, and automated vulnerability scanning. All Pre-Sprint prerequisites satisfied for v3 development.

**FRs covered:** None (infrastructure prerequisite)
**Key ARs:** AR1 (Voyage SDK), AR2 (vector migration 768→1024), AR3 (version pinning), AR4 (lockfile), AR5 (dependency evaluation), AR6 (Neon Pro), AR7 (VPS budget), AR64 (dependency verification), AR76 (Voyage rate limits)
**Key NFRs:** NFR-S11 (HTTP security headers), NFR-S12 (file attachment security), NFR-S13 (auth rate limiting), NFR-S14 (dependency scanning), NFR-COST2 (Voyage ≤$5/mo), NFR-O4 (quality baseline), NFR-O5 (routing scenarios)
**Key DSRs:** SDK-1~4, VEC-1~4, DB-3 (batch re-embed), OPS-5 (pgvector ARM64)

**Implementation Notes:**
- AR2 vector(768)→vector(1024) is irreversible — Go/No-Go #10 gates this. Migration `0061_voyage_vector_1024.sql`
- AR76: Voyage rate limits (300 RPM, 1M tokens/min) require exponential backoff in `services/voyage-embedding.ts`
- NFR-S11~13 are new SaaS security baselines (HTTP headers, file security, auth rate limiting)
- NFR-S14: `bun audit` in CI pipeline, Critical/High CVE = build failure
- NFR-O4: Establish v3 quality baseline — measure 10 prompts on current v2 production, store in `_bmad-output/test-artifacts/quality-baseline.md`
- NFR-O5: Define 10 routing scenarios, store in `_bmad-output/test-artifacts/routing-scenarios.md`
- Must complete before Sprint 1 can start (AR71)
- Neon Pro upgrade (AR6) is a blocker for all sprints

**Dependencies:** None (first epic). Blocks all subsequent epics.

---

### Epic 23: Natural Organic Design System

**Sprint:** Layer 0 (starts Pre-Sprint, ≥60% by Sprint 2 end, per AR71) | **Go/No-Go Gates:** #6
**Estimated Stories:** 18-22

Transform the entire application to the Natural Organic theme (cream #faf8f5, olive #283618, sand #e5e1d3), implement the Radix UI component library, redesign the app shell and navigation, consolidate CEO app pages from 14 to 6 groups, and establish WCAG 2.1 AA accessibility foundations. Runs in parallel with all sprints, applying the design system to each sprint's new pages.

**User Outcome:** Completely new, polished, light-themed interface. Streamlined navigation (14→6 page groups). WCAG 2.1 AA compliant. Responsive across 4 breakpoints (sm/md/lg/xl). Fast performance (FCP ≤1.5s, bundle ≤200KB gzip).

**FRs covered:** FR-UX1, FR-UX2, FR-UX3
**Key ARs:** AR55 (page consolidation + route redirects), AR56 (Natural Organic theme, light mode only)
**Key NFRs:** NFR-P1~4 (frontend performance), NFR-P12 (Korea TTFB), NFR-A1~4 (accessibility baselines), NFR-B1~3 (browser compat), NFR-CQ1 (code quality)
**Key UXRs:** UXR1-55 (responsive, app shell, tokens, accessibility, animation), UXR57-58/60-61 (cross-cutting WebSocket/SSE patterns), UXR63-78 (error handling, navigation), UXR79-95 (user flow, onboarding), UXR97 (NexusCanvas), UXR99 (HandoffTracker), UXR100 (StreamingMessage), UXR103-117 (empty states, modals, forms, toasts, buttons), UXR122-140 (search, performance, testing, state mgmt)
**Key DSRs:** OPS-6 (zero-downtime deployment)

**Implementation Notes:**
- AR56: Light mode only for v3 launch. Dark mode deferred to post-launch
- UXR19: Natural Organic is the sole theme. Sovereign Sage (v2 dark) deprecated
- UXR32-33: Radix UI primitives + shadcn/ui copy-paste into packages/ui/. Subframe→Radix migration
- UXR133: Zustand 5 (client) + React Query 5 (server) state management
- Page consolidation (FR-UX1~3): backward-compatible with route redirects
- Go/No-Go #6: ESLint `no-hardcoded-colors` rule — 0 violations
- Custom components built here: NexusCanvas (UXR97), HandoffTracker (UXR99), StreamingMessage (UXR100)
- Sprint-specific pages designed within each sprint but using this epic's tokens/components
- **≥60% milestone measurement:** ~40 of 67 pages with Natural Organic tokens fully applied by Sprint 2 end. Measured as `pages with corthex-* tokens / total pages`
- **Parallel risk fallback:** If Layer 0 <60% at Sprint 2 exit, Sprint 3 stories include Layer 0 catch-up. Sprint 4 cannot start with <80% Layer 0 applied

**Dependencies:** Requires Epic 22 (Pre-Sprint foundation). Runs parallel with Epics 24-29.

---

### Epic 24: Agent Personality System

**Sprint:** Sprint 1 | **Go/No-Go Gates:** #2
**Estimated Stories:** 8-10

Enable administrators to customize each AI agent's personality using Big Five (OCEAN) sliders, with role presets and behavioral previews. Establish the soul-enricher pipeline that all future enhancements (memory in Sprint 3) build upon. Standardize call_agent response format and add cost-aware model routing.

**User Outcome:** Admins can make each agent unique — creative, analytical, diplomatic, or any combination via 5 intuitive sliders (0-100). Preset templates (balanced, creative, analytical) for quick setup. Agents feel more natural and human-like in their communication. Keyboard-accessible sliders with behavioral tooltips.

**FRs covered:** FR-PERS1, FR-PERS2, FR-PERS3, FR-PERS4, FR-PERS5, FR-PERS6, FR-PERS7, FR-PERS8, FR-PERS9
**Key ARs:** AR26 (JSONB schema + Zod), AR27 (soul-enricher.ts EnrichResult interface), AR28 (9 renderSoul callers updated), AR29 (PER-1 4-layer sanitization), AR30 (3+ presets), AR31 (NULL handling), AR32 (agent-loop.ts no direct import), AR73 (call_agent response standardization), AR74 (cost-aware model routing)
**Key NFRs:** NFR-S8 (personality sanitization 100%), NFR-A5 (slider accessibility)
**Key DSRs:** PER-1 (4-layer sanitization), PER-2 (5 extraVars), PER-3 (default neutral 50), PER-4 (fallback), PER-5 (accessibility), PER-6 (tooltip behavior examples)
**Key UXRs:** UXR98 (CC-3 BigFiveSliderGroup), UXR118 (Soul editor CodeMirror + {{variable}} autocomplete), UXR136 (personality comparison A/B preview)

**Implementation Notes:**
- AR26: Migration `0062_add_personality_traits.sql`. Full Zod schema: `{ openness, conscientiousness, extraversion, agreeableness, neuroticism }` (lowercase, 0-100 integer)
- AR27: `services/soul-enricher.ts` in services/ (not engine/ — E8 boundary). EnrichResult interface frozen after this sprint
- AR28: All 9 renderSoul callers (12 call sites — hub.ts ×2, call-agent.ts ×2, agora-engine.ts ×2 ternary/cache-fallback) updated with `enrich() → merge → renderSoul(extraVars)` pattern
- AR73+AR28 coordination: `call-agent.ts` gets BOTH soul-enricher migration (AR28, lines 67-68) AND response standardization (AR73, lines 79-82). **Single story handles both changes** to avoid merge conflicts on this 83-line file
- AR74: `engine/model-selector.ts` Admin cost preference per tier. Reflection cron hardcoded to Haiku
- PER-1: 4 layers in strict order: Key Boundary → API Zod → extraVars strip → Template regex
- Go/No-Go #2: renderSoul() extraVars injection verification — empty string = FAIL

**Dependencies:** Requires Epic 22 (Voyage migration complete, Pre-Sprint done).

---

### Epic 25: n8n Workflow Integration

**Sprint:** Sprint 2 | **Go/No-Go Gates:** #3
**Estimated Stories:** 6-8

Deploy n8n as a Docker container with 8-layer security, expose workflow management through a secure Hono reverse proxy, and provide Admin workflow editing and CEO result viewing interfaces. Delete existing workflow self-implementation code.

**User Outcome:** Admin can create, edit, and monitor automated workflows through n8n's visual editor — no code required. CEO can view workflow execution results in read-only mode. Enterprise-grade 8-layer security protects all n8n operations. n8n failure is fully isolated from the rest of the app.

**FRs covered:** FR-N8N1, FR-N8N2, FR-N8N3, FR-N8N4, FR-N8N5, FR-N8N6
**Key ARs:** AR33 (Docker Compose: n8n:2.12.3, localhost, SQLite, 2G/2CPU, AES-256-GCM), AR34 (N8N-SEC 8-layer mandatory), AR35 (Hono proxy + path normalization + Admin JWT), AR36 (n8n→CORTHEX callback: host.docker.internal)
**Key NFRs:** NFR-SC9 (n8n Docker ≤2G RAM, ≤2 CPU), NFR-O9 (Docker health /healthz 30s), NFR-S9 (n8n security 100%)
**Key DSRs:** N8N-SEC-1 (port 5678 external block), N8N-SEC-2 (editor Admin-only), N8N-SEC-3 (tag-based multi-tenant), N8N-SEC-4 (webhook HMAC), N8N-SEC-5 (Docker resource caps), N8N-SEC-6 (DB access forbidden), N8N-SEC-7 (credential encryption), N8N-SEC-8 (API rate limit 60/min)
**Key UXRs:** UXR119 (workflow list), UXR120 (preset install flow), UXR121 (error handling: OOM, API failure, timeout)

**Implementation Notes:**
- AR33: Docker pinned to `n8nio/n8n:2.12.3` (`:latest` forbidden). SQLite DB. localhost only
- AR34: All 8 security layers mandatory — partial deployment = security failure
- AR35: `routes/admin/n8n-proxy.ts` with Hono proxy(). Double-dot path blocked. OOM recovery
- FR-N8N3: Clean deletion of existing workflow self-implementation code (server routes + frontend pages)
- Go/No-Go #3: 3-part verification — (1) port 5678 external blocked, (2) tag filter cross-company blocked, (3) webhook HMAC tamper rejected
- This epic enables Epic 26 (Marketing Automation runs on n8n)

**Dependencies:** Requires Epics 22-23 (Pre-Sprint + design system foundation). Enables Epic 26.

---

### Epic 26: AI Marketing Automation

**Sprint:** Sprint 2 (requires Epic 25) | **Go/No-Go Gates:** Sprint 2 exit includes marketing E2E verification
**Estimated Stories:** 5-7

Enable AI-powered content creation (card news, short-form video) with multi-platform posting, human approval workflows, and configurable AI tool engines — all running on the n8n workflow platform.

**User Outcome:** Marketing teams automate content creation and posting across Instagram, TikTok, YouTube simultaneously. Human-in-the-loop approval (CEO app, Slack, or Telegram) ensures quality. Admin selects and swaps AI engines (image/video/narration/subtitles) without code changes. Fallback engines prevent downtime on API failures.

**FRs covered:** FR-MKT1, FR-MKT2, FR-MKT3, FR-MKT4, FR-MKT5, FR-MKT6, FR-MKT7
**Key ARs:** AR39 (company.settings JSONB + AES-256 API keys + atomic jsonb_set()), AR40 (preset workflows as JSON in _n8n/presets/), AR41 (JSONB race condition: jsonb_set() + WHERE)
**Key NFRs:** NFR-P17 (marketing E2E: image ≤2min, video ≤10min, posting ≤30s)
**Key DSRs:** MKT-1 (API key management AES-256), MKT-2 (API failure fallback), MKT-3 (cost attribution via company API keys), MKT-4 (copyright watermark configurable), MKT-5 (platform API changes via n8n node updates)
**Key UXRs:** UXR101 (CC-6 WorkflowPipelineView: DAG graph, execution status, history)

**Implementation Notes:**
- AR39: Marketing settings in `company.settings` JSONB. API keys AES-256 encrypted. Separate company_api_keys table deferred to Phase 5+
- AR40: Preset workflows installed via n8n API. Auto-tag with company ID
- FR-MKT5: Onboarding "Install marketing automation template?" — touches onboarding flow
- FR-MKT7: n8n Error Workflow pattern: timeout 30s → retry 2x → fallback engine → notification
- Requires Epic 25 (n8n platform) to be complete
- **Sprint 2 exit marketing verification:** Marketing preset E2E test — topic → generation → approval → posting succeeds on ≥1 platform under NFR-P17 targets (image ≤2min, posting ≤30s)

**Dependencies:** Requires Epic 25 (n8n Workflow Integration).

---

### Sprint 2 Overload Risk & Mitigation

**Risk:** Sprint 2 carries 3 epics (E25 + E26 + E27) totaling 14-19 stories — 2x the size of Sprint 1 (8-10 stories). Architecture (line 1940) flagged Sprint 2/2.5 split consideration.

**Mitigation strategy:**
- Epic 27 (Tool Security, 3-4 stories) is **fully independent** of E25/E26 → runs in **parallel** with E25 from Sprint 2 start
- Epic 26 (Marketing, 5-7 stories) is **sequential after E25** — starts when n8n platform is deployed
- Effective parallelism: E25+E27 concurrent (9-12 stories) → E26 sequential (5-7 stories)
- If Sprint 2 exceeds capacity: marketing preset workflows (E26) can split to Sprint 2.5 mini-sprint before Sprint 3 (per PRD failure trigger L553)

**Sprint 2 internal sequencing:** Sprint 2a (E25 Stories 25.1-25.6 + E27 Stories 27.1-27.3, parallel) → Story 25.6 Go/No-Go #3 gates E26 start → Sprint 2b (E26 Stories 26.1-26.5, sequential)

---

### Epic 27: Tool Response Security

**Sprint:** Sprint 2 | **Go/No-Go Gates:** #11
**Estimated Stories:** 3-4

Protect AI agents from prompt injection attacks in external tool responses by implementing a dedicated sanitization layer at the PreToolResult hook point.

**User Outcome:** AI agents safely interact with third-party tools and APIs without risk of prompt injection manipulation. Malicious content is transparently replaced with "[BLOCKED: suspected prompt injection in tool response]" and logged for Admin review. Security is invisible to normal users — they experience uninterrupted, safe agent interactions.

**FRs covered:** FR-TOOLSANITIZE1, FR-TOOLSANITIZE2, FR-TOOLSANITIZE3
**Key ARs:** AR37 (sanitizer at PreToolResult — two paths L265/L277, three internal paths exempt), AR38 (minimum 10 regex patterns, extensible to OWASP 50+), AR60 (independent chain — never imports PER-1 or MEM-6)
**Key NFRs:** NFR-S10 (100% block rate against minimum 10 adversarial payloads + extensible framework)

**Implementation Notes:**
- AR37: Hook point is PreToolResult (not PostToolUse). Two external MCP tool_result paths need sanitization (error path + success path); three internal paths do not
- AR38: 10 regex patterns as baseline. OWASP prompt injection library 50+ as expansion target. 25+ diverse payloads recommended for testing
- AR60: Third independent sanitization chain. Never imports from PER-1 or MEM-6 chains
- **Cross-sprint test span:** Sprint 2 = implementation + 10-payload baseline verification (Go/No-Go #11). Sprint 3 = OWASP 50+ pattern expansion verification within Epic 28 test scope (shared Sprint 3 security testing)
- Go/No-Go #11: Tool response prompt injection defense verification (Sprint 2 exit — 10 baseline payloads)

**Dependencies:** Requires Epics 22-23 (Pre-Sprint complete). Independent of Epics 25-26.

---

### Epic 28: Agent Memory & Learning

**Sprint:** Sprint 3 | **Go/No-Go Gates:** #4, #7, #9, #14
**Estimated Stories:** 10-12

Give agents the ability to learn from experience through automatic observation recording, AI-powered reflection summaries, and contextual memory retrieval via vector search. Agents improve over time by remembering past interactions and applying learned patterns to new tasks.

**User Outcome:** Agents grow smarter with use — same mistakes decrease by 30%+ over time. CEO can view per-agent learning progress, reflection history, and growth metrics. Admin can manage agent memory data (observations + reflections). Agents automatically recall relevant past experiences when handling new tasks. Costs are controlled with automatic pause on budget overrun.

**FRs covered:** FR-MEM1, FR-MEM2, FR-MEM3, FR-MEM4, FR-MEM5, FR-MEM6, FR-MEM7, FR-MEM8, FR-MEM9, FR-MEM10, FR-MEM11, FR-MEM12, FR-MEM13, FR-MEM14
**Key ARs:** AR42 (observations table schema), AR43 (3 indexes), AR44 (confidence decay 0.1/week + reinforcement cosine≥0.85), AR45 (agent_memories extension + VECTOR(1024)), AR46 (MEM-6 4-layer), AR47 (reflection cron: daily 3AM, advisory lock, tier caps), AR48 (30-day TTL), AR49 (memory search cosine≥0.75 top 3), AR75 (capability evaluation 10×5 framework)
**Key NFRs:** NFR-P16 (reflection ≤30s), NFR-P18 (vector search P95 ≤200ms, enricher ≤300ms overhead), NFR-SC7 (pgvector HNSW ≤3GB), NFR-D3 (embedding NULL allowed), NFR-D8 (observations 30-day TTL), NFR-COST3 (Haiku ≤$0.10/day), NFR-O10 (cron stability)
**Key DSRs:** MEM-1 (Zero Regression on agent_memories), MEM-2 (cron trigger + tier limits), MEM-3 (cron isolation), MEM-4 (Admin-only deletion), MEM-5 (memory utilization audit), MEM-6 (4-layer defense), MEM-7 (30-day TTL)
**Key UXRs:** UXR102 (CC-7 MemoryTimeline: date separators, observation/reflection cards, security badges, J/K nav)

**Implementation Notes:**
- AR42: Migration `0063_add_observations.sql`. UUID PK, company_id, outcome VARCHAR(20), domain, importance, confidence REAL 0-1, embedding VECTOR(1024)
- AR44: Confidence decay 0.1/week (floor 0.1). Reinforcement: cosine≥0.85 → +0.15 (ceiling 1.0). In `memory-reflection.ts`
- AR45: Migration `0064_extend_agent_memories.sql`. memoryType='reflection' enum + embedding VECTOR(1024) + HNSW index
- AR47: Cron daily 3AM + company hash stagger. pg_try_advisory_xact_lock. ≥20 observations + confidence≥0.7. Tier 1-2 unlimited, Tier 3-4 weekly 1x cap
- AR49: Extends soul-enricher from Epic 24 (additive only — EnrichResult interface frozen)
- AR75: Capability evaluation: 10 tasks × 5 categories, 3rd iteration rework ≤50% of 1st. Go/No-Go #14. **Distinct testing workstream** within this epic — separate stories from feature implementation with different acceptance criteria patterns
- **4 Go/No-Go gates (29% of total)** — Sprint 3 exit has highest verification load. **Early verification strategy:** #7 (cost) and #9 (poisoning) verified mid-sprint as soon as reflection cron + sanitization are implemented. #4 (zero regression) and #14 (capability eval) verified at Sprint 3 exit

**Dependencies:** Requires Epic 22 (Voyage AI for embeddings), Epic 24 (soul-enricher interface to extend).

---

### Epic 29: OpenClaw Virtual Office

**Sprint:** Sprint 4 | **Go/No-Go Gates:** #1, #5, #8, #12, #13
**Estimated Stories:** 8-10

Bring the AI organization to life with a pixel art virtual office where users can watch agents work in real-time. Each agent is represented as an animated 32×32px character whose state (idle, working, speaking, tool_calling, error) reflects actual execution status via WebSocket.

**User Outcome:** CEO experiences a visual, engaging representation of their AI organization at `/office`. Agents appear as pixel art characters that walk, type, and react in real-time. Click an agent for details, double-click a department to zoom. Mobile users get a simplified status list. Screen reader users get full aria-live text alternatives. Admin can observe in read-only mode. Office failure never affects Hub/Chat/NEXUS.

**FRs covered:** FR-OC1, FR-OC2, FR-OC3, FR-OC4, FR-OC5, FR-OC6, FR-OC7, FR-OC8, FR-OC9, FR-OC10, FR-OC11
**Key ARs:** AR50 (packages/office/ independent workspace, PixiJS 8.17.1 + @pixi/react 8.0.5), AR51 (React.lazy import, tree-shaking 6 classes), AR52 (/ws/office as 17th channel, 50/company 500/server), AR53 (500ms polling, adaptive, diff-based), AR54 (turbo.json pipeline entry)
**Key NFRs:** NFR-P13 (FCP ≤3s, PixiJS ≤200KB gzip), NFR-P14 (state sync ≤2s), NFR-P15 (adaptive heartbeat idle 30s / active 5s), NFR-SC8 (/ws/office load test), NFR-A6 (screen reader aria-live), NFR-A7 (responsive mobile list view)
**Key DSRs:** PIX-1 (bundle ≤200KB), PIX-2 (WebGL→Canvas fallback), PIX-3 (desktop-only PixiJS), PIX-4 (accessibility), PIX-5 (failure isolation), PIX-6 (activity_logs data source), NRT-1 (5-state + degraded), NRT-2 (heartbeat 5s/15s/30s), NRT-3 (WebSocket broadcast), NRT-4 (state latency ≤2s), NRT-5 (connection limits + token bucket)
**Key UXRs:** UXR56, UXR59, UXR62 (OpenClaw-specific WebSocket UX), UXR83-87 (/office interaction, mobile, accessibility, viewport culling, performance), UXR96 (CC-1 OfficeCanvas)

**Implementation Notes:**
- AR50: `packages/office/` independent Turborepo workspace. Vite library mode build. PixiJS exact pin
- AR51: CEO app imports via `React.lazy(() => import('@corthex/office'))`. Load failure → fallback UI
- AR52: WsChannel union extended to include 'office'. JWT auth. Token bucket rate limit 10msg/s per userId
- AR53: 500ms polling of activity_logs (not LISTEN/NOTIFY — Neon serverless). Adaptive: poll only when clients connected. Diff with previous, skip if unchanged
- Final sprint: carries system-wide Go/No-Go gates
- Go/No-Go #1 (Zero Regression: 485 API + 10,154 tests), #5 (PixiJS ≤200KB gzip), #8 (AI sprite PM approval), #12 (v1 feature parity), #13 (CEO daily task ≤5min)

**Dependencies:** Requires all previous epics complete. Final sprint of v3.

---

### Implementation Sequence (AR71)

```
Pre-Sprint ──→ Sprint 1 ──→ Sprint 2 ──→ Sprint 3 ──→ Sprint 4
  Epic 22         Epic 24      Epic 25       Epic 28      Epic 29
                               Epic 26
                               Epic 27

Layer 0 (Epic 23) ────────────────────────────────────────────→
                   ≥60% by Sprint 2 end (AR71 red line)
```

**Go/No-Go Gate Sequence:**

| Sprint Exit | Gates | Verification |
|-------------|-------|-------------|
| Pre-Sprint | #10 | Voyage migration: `SELECT count(*) FROM knowledge_docs WHERE embedding IS NULL` = 0 |
| Sprint 1 | #2, #6 (partial) | renderSoul extraVars not empty string; ESLint hardcoded colors = 0 |
| Sprint 2 | #3, #6 (≥60%), #11 | n8n 3-part security; Layer 0 progress; tool sanitization |
| Sprint 3 | #4, #7, #9, #14 | Memory zero regression; reflection cost ≤$0.10/day; observation poisoning 100% block; capability evaluation pass |
| Sprint 4 (Final) | #1, #5, #8, #12, #13 | Zero regression (full); PixiJS ≤200KB; sprite approval; v1 parity; CEO task ≤5min |

### Epic Summary

| Epic | Sprint | FRs | Go/No-Go | Estimated Stories |
|------|--------|-----|----------|-------------------|
| 22: Production Foundation & Voyage AI Migration | Pre-Sprint | 0 (infra) | #10 | 5-7 |
| 23: Natural Organic Design System | Layer 0 (parallel) | 3 | #6 | 21 |
| 24: Agent Personality System | Sprint 1 | 9 | #2 | 8-10 |
| 25: n8n Workflow Integration | Sprint 2 | 6 | #3 | 6-8 |
| 26: AI Marketing Automation | Sprint 2 | 7 | — | 5-7 |
| 27: Tool Response Security | Sprint 2 | 3 | #11 | 3-4 |
| 28: Agent Memory & Learning | Sprint 3 | 14 | #4, #7, #9, #14 | 10-12 |
| 29: OpenClaw Virtual Office | Sprint 4 | 11 | #1, #5, #8, #12, #13 | 8-10 |
| **Total** | | **53 new + 3 UX** | **14 gates** | **69** |

---

## Stories

**69 stories** across 8 epics. Step 2 estimated 63-79; actual 69 reflects: Epic 23 expanded from 12-15 to 20 stories (per Step 2 critic feedback — 120+ UXRs + page consolidation + 3 custom components warranted increase), other epics stayed within ranges.

### Epic 22: Production Foundation & Voyage AI Migration

**Epic Goal:** Migrate vector search infrastructure from Gemini to Voyage AI, harden dependencies, and establish production security baselines required by all subsequent sprints.

#### Story 22.1: Dependency Verification & Version Pinning

As a developer,
I want all dependencies verified and version-pinned,
So that builds are deterministic and no version drift occurs during v3 development.

**Acceptance Criteria:**

**Given** the monorepo has `^` versions in package.json files
**When** all `^` prefixes are converted to exact pins for core packages (Hono, @anthropic-ai/sdk, Drizzle ORM, Bun)
**Then** `bun install --frozen-lockfile` succeeds with zero warnings
**And** `bun.lockb` is committed to git
**And** `turbo build` succeeds across all workspaces (server, app, admin, ui, shared)
**And** `bun test` passes all 10,154 existing tests with zero regressions
**And** Zod v4/v3 compatibility verified (no dual-version conflict)
**And** Dockerfile builds and runs on ARM64 (Oracle VPS)

_References: AR3, AR4, AR5, AR64_

---

#### Story 22.2: Voyage AI SDK Integration

As a developer,
I want the Voyage AI embedding SDK integrated as a single-source service,
So that all vector operations use Voyage AI instead of Gemini.

**Acceptance Criteria:**

**Given** `@google/generative-ai` is currently installed
**When** it is deleted and `voyageai@0.2.1` (exact pin) is installed
**Then** `services/voyage-embedding.ts` exports `getEmbedding(companyId, text): Promise<number[]>` returning 1024-dimension vectors
**And** `getEmbeddingBatch(companyId, texts[], batchSize=32): Promise<number[][]>` is exported for batch operations
**And** direct `voyageai` SDK imports are forbidden outside `voyage-embedding.ts` (enforced by ESLint rule or code review)
**And** exponential backoff is implemented for Voyage rate limits (300 RPM, 1M tokens/min): 1s→2s→4s→max 30s
**And** embedding generation failure returns `null` (VEC-2 fallback), not a thrown error
**And** all calls include `companyId` for multi-tenant isolation

_References: AR1, AR76, SDK-1~4, VEC-1~4_

---

#### Story 22.3: Vector Migration 768→1024

As a developer,
I want the knowledge_docs vector column migrated from 768 to 1024 dimensions,
So that Voyage AI's full-precision embeddings can be stored and searched.

**Acceptance Criteria:**

**Given** the knowledge_docs table has `embedding VECTOR(768)` with existing data
**When** migration `0061_voyage_vector_1024.sql` is executed
**Then** the column is altered to `VECTOR(1024)`
**And** the HNSW index is rebuilt for 1024-dimension vectors
**And** a batch re-embedding job runs via `getEmbeddingBatch()` for all existing knowledge_docs
**And** `SELECT count(*) FROM knowledge_docs WHERE embedding IS NULL` = 0 (Go/No-Go #10)
**And** semantic search queries return results with cosine similarity using 1024d vectors
**And** migration is tested on a staging copy before production execution (irreversible operation)

_References: AR2, DB-3, OPS-5, Go/No-Go #10_

---

#### Story 22.4: HTTP Security Headers & Rate Limiting

As a platform operator,
I want SaaS security baselines applied to all HTTP responses,
So that the application meets minimum security standards for a multi-tenant SaaS.

**Acceptance Criteria:**

**Given** the Hono server has existing security headers (secureHeaders, loginRateLimit, CORS) that need hardening for v3 SaaS requirements
**When** security middleware is extended and v3 baselines applied
**Then** existing secureHeaders hardened: verify `Content-Security-Policy` (script-src 'self'), `Strict-Transport-Security` (max-age=31536000; includeSubDomains), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` all present
**And** existing CORS policy verified: allows only app and admin origins (no wildcard)
**And** existing loginRateLimit extended: CLI token registration/verification endpoints rate limited at 10 req/min per IP (NFR-S13)
**And** file attachment uploads enforce: max 10MB size, type whitelist (image/png, image/jpeg, image/gif, image/webp, application/pdf, text/plain, text/csv), filename sanitization (path traversal prevention), content-type magic bytes validation (NFR-S12)
**And** existing tests pass with new headers (no CORS breakage)

_References: NFR-S11, NFR-S12, NFR-S13_

---

#### Story 22.5: CI Dependency Scanning & Quality Baselines

As a platform operator,
I want automated vulnerability scanning and quality measurement baselines,
So that security vulnerabilities are caught in CI and v3 quality can be measured against v2.

**Acceptance Criteria:**

**Given** CI pipeline currently has no dependency scanning
**When** `bun audit` (or equivalent) is added to the CI pipeline
**Then** Critical and High CVE findings cause build failure
**And** Dependabot (or equivalent) is configured for automated PR alerts on vulnerable dependencies
**And** `_bmad-output/test-artifacts/quality-baseline.md` contains 10 prompts measured against current v2 production (NFR-O4)
**And** `_bmad-output/test-artifacts/routing-scenarios.md` contains 10 predefined routing scenarios (NFR-O5)
**And** baseline files are committed and available for Sprint 1+ comparison

_References: NFR-S14, NFR-O4, NFR-O5_

---

#### Story 22.6: Neon Pro Upgrade & VPS Resource Verification

As a platform operator,
I want Neon Pro confirmed and VPS resources verified,
So that all sprint prerequisites are unblocked.

**Acceptance Criteria:**

**Given** Neon is currently on a free/hobby tier
**When** Neon Pro upgrade is completed (AR6)
**Then** database connection limits support v3 concurrency requirements (≥10 concurrent sessions)
**And** VPS resource budget verified: Oracle ARM64 4-core, 24GB RAM, ~12GB headroom confirmed
**And** Docker daemon running with sufficient resources for n8n container (Sprint 2)
**And** pgvector extension available and verified on Neon Pro
**And** Go/No-Go #10 (Voyage migration) verified as passing
**And** infrastructure cost estimate documented: VPS + Neon Pro + Voyage AI projected ≤$10/month (NFR-COST1), Voyage embedding budget ≤$5/month (NFR-COST2)

_References: AR6, AR7, NFR-COST1, NFR-COST2_

---

### Epic 23: Natural Organic Design System

**Epic Goal:** Transform the entire application to the Natural Organic theme, implement Radix UI components, redesign app shell, consolidate pages 14→6, and establish WCAG 2.1 AA foundations.

**Internal Story Dependencies:** Foundation (23.1→23.2→23.3) must complete first. Then parallel tracks: Pages (23.4→23.18→23.19→23.20), Components (23.5→23.13→23.14→23.15), Patterns (23.6-23.11 independent/parallel), Infrastructure (23.8, 23.16 independent). Final: 23.21 (cleanup, last).

#### Story 23.1: Design Token System & Tailwind v4 Configuration

As a CEO,
I want the application to have a cohesive visual language,
So that every page feels unified and professional.

**Acceptance Criteria:**

**Given** the app currently uses mixed v2 theme tokens
**When** Tailwind v4 `@theme` configuration is set up with `corthex-*` namespace tokens
**Then** color tokens follow 60-30-10 distribution: 60% Cream/Surface/Sand (#faf8f5, #f5f0e8, #e5e1d3), 30% Olive (#283618, #5a7247), 10% Sage accent
**And** semantic color tokens defined: success (#4d7c0f), warning (#b45309), error (#dc2626), info (#2563eb), handoff (#7c3aed)
**And** spacing tokens follow 8px base grid: 4/8/12/16/24/32/48/64/96px (UXR28)
**And** border radius tokens: sm:4, md:8, lg:12, xl:16, full:9999px (UXR29)
**And** shadow system: none, sm, md, lg — no shadow+border on same element (UXR30)
**And** z-index scale defined per UXR31
**And** typography: Inter (UI), JetBrains Mono (code), self-hosted @fontsource ≤300KB initial (UXR25)
**And** ESLint `no-hardcoded-colors` rule configured (Go/No-Go #6 preparation)
**And** 4-breakpoint system: sm(<640px), md(640-1023px), lg(1024-1439px), xl(≥1440px) (UXR1)

_References: AR56, UXR19-31, UXR1, Go/No-Go #6_

---

#### Story 23.2: Radix UI Component Library Foundation

As a CEO,
I want consistent, accessible UI components across the app,
So that every interaction feels polished and works for all users.

**Acceptance Criteria:**

**Given** the app uses a mix of Subframe and custom components
**When** Radix UI primitives + shadcn/ui patterns are set up in `packages/ui/src/components/`
**Then** base components are available: Button, Dialog, Dropdown, Select, Input, Textarea, Checkbox, Radio, Switch, Tabs, Tooltip, Toast, Popover, Sheet (drawer), Command (palette)
**And** all components use `corthex-*` design tokens (no hardcoded colors)
**And** all interactive components have focus ring: 2px solid + 2px offset, focus-visible only (UXR37)
**And** touch targets: 44px mobile, 36px desktop minimum (UXR43)
**And** Lucide React icons used exclusively with tree-shaken per-icon imports, min 16px (UXR34)
**And** components export from `@corthex/ui` package

_References: UXR32-34, UXR37, UXR43_

---

#### Story 23.3: App Shell Redesign — Sidebar & Topbar

As a CEO,
I want a clean, natural app shell that adapts to my device,
So that navigation is effortless on desktop, tablet, and mobile.

**Acceptance Criteria:**

**Given** the current app shell uses v2 dark theme layout
**When** the app shell is rebuilt with Natural Organic theme
**Then** desktop: fixed sidebar 280px (olive #283618) + topbar 56px (cream) + content (fluid, cream, max-width 1440px, padding 32px) (UXR15)
**And** tablet (md): collapsible sidebar 56px/280px with hamburger toggle (UXR3)
**And** mobile (sm): sidebar hidden, bottom tab bar (cream bg + top border, 56px, 5 tabs) (UXR2, UXR8)
**And** mobile sidebar = overlay drawer with backdrop blur (UXR9)
**And** sidebar has `role="navigation"` (UXR46)
**And** skip-to-content link on every page (UXR39)
**And** `<html lang="ko">` set, English blocks with `lang="en"` (UXR45)
**And** Noto Serif KR lazy-loaded with `font-display: optional` (UXR26)

_References: UXR2-9, UXR15, UXR39, UXR44-46_

---

#### Story 23.4: Page Consolidation 14→6 Groups with Route Redirects

As a CEO,
I want fewer, more intuitive page groups in the navigation,
So that I can find what I need without navigating through too many pages.

**Acceptance Criteria:**

**Given** the CEO app currently has 14 separate pages
**When** pages are consolidated into 6 groups
**Then** Hub + Command Center → unified Hub page
**And** Classified + Reports + Files → Documents page
**And** ARGOS + Cron Base → ARGOS page
**And** Home + Dashboard → Dashboard page
**And** Activity Log + Ops Log → Activity page
**And** Agents + Departments + Org → Organization page
**And** original routes redirect via `<Navigate to="/new-route" replace />` (bookmark compatibility, FR-UX2)
**And** 100% of existing functionality is retained in merged pages (FR-UX3)
**And** sidebar navigation updated to reflect 6 groups
**And** no features are deleted (AR55, AR58)

_References: FR-UX1, FR-UX2, FR-UX3, AR55_

---

#### Story 23.5: Responsive Layout Types Implementation

As a CEO,
I want content to be laid out optimally for each page type,
So that data and tools are presented in the most useful arrangement.

**Acceptance Criteria:**

**Given** 7 layout types are defined (UXR16)
**When** layout components are implemented
**Then** Dashboard layout: CSS auto-fit grid (cards reflow per breakpoint)
**And** Master-Detail layout: 280px list panel + flex-1 detail (collapses to single panel on mobile, UXR14)
**And** Canvas layout: full-bleed (for NEXUS, Office)
**And** CRUD layout: single-column, max-width centered
**And** Tabbed layout: tabs + content area
**And** Panels layout: 2×2 grid (stacks on mobile)
**And** Feed layout: 720px centered (for chat, activity)
**And** React Router v7 with React.lazy code splitting per page (UXR17)
**And** no page transition animations (UXR17)

_References: UXR14, UXR16, UXR17_

---

#### Story 23.6: Accessibility Foundations (WCAG 2.1 AA)

As a user with disabilities,
I want the app to be fully accessible,
So that I can use all features with assistive technology.

**Acceptance Criteria:**

**Given** the app has incomplete accessibility support
**When** WCAG 2.1 AA foundations are implemented
**Then** text contrast ≥4.5:1, UI contrast ≥3:1 (UXR36)
**And** focus trap in modals/drawers/command-palette with ESC to escape and focus restoration (UXR38)
**And** color independence: all statuses use icon + text + color (UXR40, UXR23)
**And** `prefers-reduced-motion: reduce` respected — animations disabled (UXR41)
**And** Windows High Contrast Mode: `forced-colors: active` fallback (UXR42)
**And** semantic HTML: nav, main, aside, section, article (UXR44)
**And** keyboard navigation: Tab/Shift+Tab, Enter/Space, Arrow keys, ESC, Cmd+K (UXR47)
**And** form error recovery: auto-focus first error field + aria-describedby (UXR48)
**And** toasts use `role="status"`, errors use `role="alert"` (UXR46)
**And** input border #908a78 (WCAG compliant), decorative border #e5e1d3 never on interactive controls (UXR24)

_References: NFR-A1-A4, UXR36-49_

---

#### Story 23.7: Animation System & Motion Design

As a CEO,
I want subtle, purposeful animations that make the app feel alive,
So that interactions are smooth and natural without being distracting.

**Acceptance Criteria:**

**Given** the app currently has minimal or inconsistent animations
**When** the animation system is implemented
**Then** animations follow UXR50-55 specifications
**And** all animations respect `prefers-reduced-motion: reduce` (disable to static)
**And** transition durations use consistent tokens (150ms micro, 300ms standard, 500ms emphasis)
**And** no animations on page navigation (UXR17)
**And** sidebar collapse/expand animates smoothly
**And** toast enter/exit animations work
**And** modal/dialog open/close with backdrop fade

_References: UXR50-55, UXR41_

---

#### Story 23.8: Cross-cutting WebSocket & SSE UX Patterns

As a CEO,
I want real-time features to handle connection issues gracefully,
So that I'm never confused about the system's connection status.

**Acceptance Criteria:**

**Given** 16+ WebSocket channels and SSE exist in the app
**When** cross-cutting resilience patterns are implemented
**Then** WebSocket auto-reconnect: 3s delay, max 5 attempts (UXR57)
**And** after 5 failures: "Please refresh" message displayed (UXR58)
**And** Chat SSE streaming: token-by-token rendering + blinking cursor (UXR60)
**And** disconnect banner: "Reconnecting... 2/5" with attempt count (UXR61)
**And** auto-reconnect ≤3s (NFR-P9)
**And** patterns applied to all WebSocket channels (not just OpenClaw-specific)

_References: UXR57, UXR58, UXR60, UXR61, NFR-P9_

---

#### Story 23.9: Error Handling & Empty States

As a CEO,
I want clear feedback when things go wrong or when there's no data,
So that I always know what to do next.

**Acceptance Criteria:**

**Given** pages may have empty data or encounter errors
**When** empty state and error patterns are implemented
**Then** each major page has a contextual empty state (not generic "no data") with illustration and action button
**And** API errors show user-friendly messages (not raw error codes)
**And** 404 pages redirect appropriately
**And** loading states use consistent skeleton patterns
**And** error boundaries catch React render failures with fallback UI
**And** patterns follow UXR63-78 specifications

_References: UXR63-78, UXR103-117_

---

#### Story 23.10: Navigation Redesign & Command Palette

As a CEO,
I want fast navigation with keyboard shortcuts,
So that I can quickly switch between sections.

**Acceptance Criteria:**

**Given** the app has 6 page groups (from Story 23.4)
**When** navigation is redesigned
**Then** sidebar shows 6 groups with Lucide icons and labels
**And** sidebar badges: white on red (#dc2626) 4.83:1 + white outline ring + circle + number (UXR49)
**And** Cmd+K opens command palette for quick navigation (UXR47)
**And** breadcrumbs on nested pages
**And** active page highlighted in sidebar
**And** sidebar collapse state persisted across sessions
**And** UXR72-78 navigation patterns followed

_References: UXR46, UXR47, UXR49, UXR72-78_

---

#### Story 23.11: Forms, Modals, Toasts & Interactive Patterns

As a CEO,
I want consistent, intuitive forms and notifications,
So that every interaction follows the same predictable patterns.

**Acceptance Criteria:**

**Given** the app has various form and notification patterns
**When** they are unified with Radix UI components
**Then** form inputs use Radix primitives with consistent validation display
**And** modals use Radix Dialog with focus trap + ESC close
**And** toasts use Radix Toast with role="status" + auto-dismiss
**And** dropdown menus use Radix DropdownMenu
**And** confirmation dialogs for destructive actions
**And** UXR103-117 patterns implemented (empty states, modals, forms, toasts, buttons)

_References: UXR103-117_

---

#### Story 23.12: Onboarding Flow Redesign

As a first-time CEO,
I want a clear, guided setup experience,
So that I can get my AI organization running quickly.

**Acceptance Criteria:**

**Given** a new user completes registration
**When** they enter the CEO app for the first time
**Then** onboarding wizard renders with 4 steps: (1) Company Info → (2) CLI Token → (3) Default Org → (4) Complete
**And** step indicator shows current/total progress (e.g., "2/4")
**And** Step 1: company name + industry input, validation on blur, "다음" button disabled until valid
**And** Step 2: CLI token paste field with auto-verification via `/api/auth/verify-token` (FR59), success/failure toast within 3s
**And** Step 3: "Create Default AI Organization" one-click creates Chief of Staff + 3 default departments (HR, Finance, Dev) (FR60)
**And** Step 4: completion summary with "대시보드로 이동" CTA
**And** wizard supports back navigation (steps 2-4 can go back)
**And** admin setup completable in ≤15 minutes (NFR-O7)
**And** entire flow is keyboard accessible (Tab/Enter/Escape navigation)
**And** wizard state persisted in sessionStorage — browser refresh doesn't lose progress
**And** timeout: if no interaction for 30 minutes, show "세션이 만료됩니다" warning

_References: FR59, FR60, FR61, NFR-O7, UXR79-95_

---

#### Story 23.13: Custom Component — NexusCanvas

As a CEO,
I want a visual organization chart editor,
So that I can see and manage my AI organization's structure.

**Acceptance Criteria:**

**Given** the NEXUS page needs a custom canvas component
**When** NexusCanvas (UXR97) is implemented
**Then** renders organization hierarchy as a node graph
**And** supports drag-and-drop in admin mode (FR30)
**And** read-only mode for CEO/Human users (FR32)
**And** mobile: read-only only (UXR12)
**And** 50+ nodes maintain 60fps (NFR-P3)
**And** accessible: keyboard navigation between nodes
**And** uses Canvas layout type (full-bleed)

_References: UXR97, FR30, FR32, NFR-P3, UXR12_

---

#### Story 23.14: Custom Component — HandoffTracker

As a CEO,
I want to see handoff chains in real-time,
So that I can track which agent is working on my request.

**Acceptance Criteria:**

**Given** an agent execution involves handoffs
**When** HandoffTracker (UXR99) is displayed
**Then** shows handoff chain as a visual timeline with agent names and statuses
**And** real-time updates via tracker events (≤100ms latency, NFR-P10)
**And** accessible: aria-live="polite" text updates (NFR-A3)
**And** on agent failure: "XX failed → summarized from remaining" format (FR47)
**And** keyboard accessible

_References: UXR99, FR46, FR47, NFR-P10, NFR-A3_

---

#### Story 23.15: Custom Component — StreamingMessage

As a CEO,
I want agent responses to appear naturally as they're generated,
So that the chat experience feels responsive and fluid.

**Acceptance Criteria:**

**Given** an agent is generating a response
**When** StreamingMessage (UXR100) renders the output
**Then** SSE tokens appear token-by-token with blinking cursor
**And** markdown rendered progressively (tables, code blocks, lists) (FR68)
**And** copy button available on completed messages (FR67)
**And** file attachments inline-rendered where possible (FR65)
**And** agent cancel button visible during generation (FR66)
**And** uses Feed layout (720px centered)

_References: UXR100, FR65-68, UXR60_

---

#### Story 23.16: State Management Migration (Zustand 5 + React Query 5)

As a developer,
I want a clear state management architecture,
So that client and server state are properly separated and predictable.

**Acceptance Criteria:**

**Given** the app has mixed state management approaches
**When** Zustand 5 (client state) + React Query 5 (server state) are integrated
**Then** client-only state (UI state, sidebar state, theme preferences) uses Zustand stores in `{feature}-store.ts` pattern
**And** server state (API data) uses React Query with proper cache invalidation
**And** no prop drilling for shared state
**And** stores use `use-{feature}.ts` hook pattern (AR65)
**And** UXR133 patterns followed

_References: UXR133, AR65_

---

#### Story 23.17: Global Search Integration

As a CEO,
I want to search across all content from one place,
So that finding information is instant regardless of where it lives.

**Acceptance Criteria:**

**Given** the command palette exists (from Story 23.10)
**When** the global search feature is implemented
**Then** Cmd+K search queries agents, departments, conversations, knowledge docs, and pages
**And** search results grouped by category with icons (agent → `<Bot>`, department → `<Building2>`, page → `<FileText>`)
**And** fuzzy matching enabled (typo tolerance via Fuse.js or similar)
**And** recent searches persisted in localStorage (max 10 items)
**And** search debounced at 150ms to prevent excessive re-renders
**And** empty state shows "검색 결과가 없습니다" with suggestions

_References: UXR122-125, FR69_

---

#### Story 23.22: Performance Optimization & Lighthouse Verification

As a CEO,
I want the app to load fast and feel responsive,
So that I never wait for pages to render.

**Acceptance Criteria:**

**Given** the app has been rebuilt with Natural Organic theme
**When** performance is optimized and verified
**Then** FCP ≤1.5s, LCP ≤2.5s (NFR-P1) verified via Lighthouse CI
**And** Hub bundle ≤200KB gzip, Admin ≤500KB gzip (NFR-P4) — verified via `bun build --analyze`
**And** Korea TTFB ≤500ms via Cloudflare CDN (NFR-P12)
**And** all route-level code splitting verified (lazy imports for each page group)
**And** image assets optimized (WebP, lazy loading for below-fold)
**And** Lighthouse CI added to GitHub Actions with score thresholds (Performance ≥90, Accessibility ≥90)

_References: NFR-P1, NFR-P4, NFR-P12_

---

#### Story 23.23: CSS Migration Strategy & Testing Automation

As a developer,
I want a clean CSS migration path and automated testing,
So that v2→v3 style transition is safe and verifiable.

**Acceptance Criteria:**

**Given** v2 styles co-exist with v3 Natural Organic tokens
**When** the migration strategy is implemented
**Then** CSS co-existence strategy: new `corthex-*` tokens alongside v2 styles, v2 classes removed incrementally per page redesign
**And** container queries used where appropriate for component-level responsiveness (UXR134-140)
**And** axe-core accessibility CI integrated — WCAG 2.1 AA violations = build failure (UXR130)
**And** Playwright visual regression tests for all 6 page groups (screenshot comparison, 0.1% diff threshold) (UXR131)
**And** Lighthouse a11y score ≥90 enforced in CI (UXR132)
**And** CSS specificity audit: no `!important` in new code, max 3-level nesting

_References: UXR130-140_

---

#### Story 23.18: Dashboard & Hub Page Redesign

As a CEO,
I want my main dashboard and hub to be beautifully redesigned,
So that I see the most important information at a glance.

**Acceptance Criteria:**

**Given** Dashboard and Hub are the primary CEO pages
**When** they are redesigned with Natural Organic theme
**Then** Dashboard uses Dashboard layout (auto-fit grid) with stat cards, recent activity, agent status overview
**And** Hub uses Feed layout (720px centered) with chat-centric or agent-list mode (FR14, FR15)
**And** all v2 functionality preserved (conversation history FR62, context FR63, autoLearn FR64)
**And** responsive across all 4 breakpoints
**And** dark v2 colors fully replaced with Natural Organic tokens
**And** charts use CVD-safe 4-hue palette (UXR35)

_References: FR14, FR15, FR62-64, UXR35_

---

#### Story 23.19: Page Redesigns — Documents, ARGOS, Activity

As a CEO,
I want my document, monitoring, and activity pages to match the new design,
So that the experience is consistent throughout the app.

**Acceptance Criteria:**

**Given** 3 page groups need redesign (no NexusCanvas dependency)
**When** they are rebuilt with Natural Organic theme
**Then** Documents page (Master-Detail layout): file browser with knowledge search
**And** ARGOS page (Tabbed layout): cron jobs + analysis results
**And** Activity page (Feed layout): activity + ops logs combined
**And** tables: desktop=full, tablet=scroll/card toggle, mobile=card list (UXR10)
**And** all existing functionality preserved
**And** responsive across all 4 breakpoints

_References: UXR10, UXR14, UXR16_

---

#### Story 23.20: Page Redesign — Organization (Tabbed + Canvas)

As a CEO,
I want the Organization page to showcase my AI team structure beautifully,
So that managing agents, departments, and the org chart is intuitive.

**Acceptance Criteria:**

**Given** NexusCanvas component exists (Story 23.13) and Canvas layout is available (Story 23.5)
**When** Organization page is rebuilt with Natural Organic theme
**Then** Organization page uses Tabbed + Canvas layout: agents tab, departments tab, NEXUS org chart tab
**And** NEXUS tab embeds NexusCanvas component (UXR97)
**And** tables: desktop=full, tablet=scroll/card toggle, mobile=card list (UXR10)
**And** all existing functionality preserved (agent CRUD, department CRUD, org chart view)
**And** responsive across all 4 breakpoints

_References: UXR10, UXR16, UXR97_

---

#### Story 23.21: Subframe-to-Radix Migration & Hardcoded Color Cleanup

As a developer,
I want all remaining Subframe components and hardcoded colors migrated,
So that the codebase is unified and Go/No-Go #6 passes.

**Acceptance Criteria:**

**Given** the app may still have Subframe components and hardcoded colors
**When** migration is complete
**Then** all Subframe components replaced with Radix UI equivalents
**And** ESLint `no-hardcoded-colors` rule passes with 0 violations (Go/No-Go #6)
**And** no hex/rgb color values outside Tailwind v4 `@theme` configuration
**And** sidebar width token (UXR134) used consistently
**And** ≥60% of pages fully use Natural Organic tokens by Sprint 2 end (AR71 milestone). "67 pages" = UX Design specification's route count (pre-consolidation); post-consolidation ~59 routes. Measurement: routes with zero hardcoded color violations / total routes
**And** remaining pages documented with completion estimates for Sprint 3-4

_References: UXR33, Go/No-Go #6, AR71_

---

### Epic 24: Agent Personality System

**Epic Goal:** Enable Big Five personality customization with soul-enricher pipeline, response format standardization, and cost-aware model routing.

#### Story 24.1: Personality Traits Database Schema & Migration

As an admin,
I want personality data stored reliably in the database,
So that agent personality settings persist and validate correctly.

**Acceptance Criteria:**

**Given** the agents table has no personality column
**When** migration `0062_add_personality_traits.sql` is applied
**Then** `agents.personality_traits` JSONB column is added with NULL allowed (backward compat)
**And** DB CHECK constraint ensures exactly 5 keys: `{ openness, conscientiousness, extraversion, agreeableness, neuroticism }` (lowercase, no abbreviations)
**And** each value is integer 0-100
**And** Zod schema validates: `z.object({ openness: z.number().int().min(0).max(100), ... })`
**And** string-type values are rejected (prompt injection prevention, FR-PERS2)
**And** NULL personality_traits returns empty objects (AR31)
**And** API CRUD endpoints updated to accept/return personality_traits
**And** existing agents unaffected (NULL = no personality)

_References: AR26, AR31, FR-PERS2_

---

#### Story 24.2: Soul Enricher Service & renderSoul Integration

As an admin,
I want personality to automatically influence how agents communicate,
So that setting slider values actually changes agent behavior.

**Acceptance Criteria:**

**Given** personality_traits exist in the database (Story 24.1)
**When** `services/soul-enricher.ts` is created
**Then** exports `enrich(agentId, companyId): Promise<EnrichResult>` where `EnrichResult = { personalityVars: Record<string,string>, memoryVars: Record<string,string> }`
**And** located in `services/` (not engine/ — E8 boundary, AR27)
**And** Sprint 1: `personalityVars` populated from DB integers → behavioral text; `memoryVars` = empty `{}`
**And** all 9 renderSoul callers (12 call sites) updated to call `enrich() → merge with knowledgeVars → pass as extraVars to renderSoul()` (AR28)
**And** `agent-loop.ts` does NOT import soul-enricher directly — callers pass pre-rendered soul (AR32)
**And** DB error → empty result + `log.warn` (AR31)
**And** EnrichResult interface frozen after this sprint (AR27)

_References: AR27, AR28, AR31, AR32, FR-PERS3_

---

#### Story 24.3: PER-1 4-Layer Sanitization Chain

As a security engineer,
I want personality values sanitized at every layer,
So that prompt injection via personality fields is impossible.

**Acceptance Criteria:**

**Given** personality values flow from API input to Soul template
**When** PER-1 4-layer sanitization is applied
**Then** Layer 1 (Key Boundary): only 5 allowed keys pass through
**And** Layer 2 (API Zod): type + range validation (integer 0-100)
**And** Layer 3 (extraVars strip): only `personality_*` prefixed vars allowed in personality context
**And** Layer 4 (Template regex): `{{variable}}` templates sanitized before Anthropic API call
**And** sanitization chain is independent — never imports MEM-6 or TOOLSANITIZE (AR60)
**And** NFR-S8: 100% pass rate on personality sanitization test suite
**And** Go/No-Go #2 preparation: renderSoul() extraVars injection verified (empty string = FAIL)

_References: AR29, AR60, PER-1, NFR-S8, Go/No-Go #2_

---

#### Story 24.4: Personality Presets & Default Values

As an admin,
I want preset personality templates to choose from,
So that I can quickly configure agents without manually tuning 5 sliders.

**Acceptance Criteria:**

**Given** the soul-enricher and personality_traits are functional (Stories 24.1-24.2)
**When** presets are implemented
**Then** at least 3 default presets: balanced (50/50/50/50/50), creative (80/30/70/60/40), analytical (40/90/20/40/30) — DB seed migration (AR30)
**And** selecting a preset auto-fills all 5 sliders (FR-PERS6)
**And** preset selection does not prevent manual slider adjustment afterward
**And** new agent creation defaults to NULL personality (backward compat)
**And** default Soul templates (secretary/manager/specialist, FR24) include personality variable placeholders

_References: AR30, FR-PERS6, FR-PERS7, FR24_

---

#### Story 24.5: Big Five Slider UI & Accessibility

As an admin,
I want intuitive personality sliders with helpful tooltips,
So that I can understand what each setting does and adjust precisely.

**Acceptance Criteria:**

**Given** the agent edit page exists
**When** BigFiveSliderGroup (UXR98) is implemented
**Then** 5 sliders displayed (0-100 integer) with labels: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism (FR-PERS1)
**And** each slider has `aria-valuenow` + `aria-valuetext` (FR-PERS9, NFR-A5)
**And** keyboard operable via left/right arrows (FR-PERS9)
**And** Shift+Arrow for larger increments (UXR47)
**And** each slider position shows behavioral example tooltips (FR-PERS8, PER-6)
**And** mobile: vertical-stacked full-width (UXR11)
**And** preset selector above sliders with instant fill
**And** personality changes take effect from next session (FR-PERS4, no deployment required)
**And** purely via prompt injection — zero code branching (FR-PERS5)

_References: UXR98, FR-PERS1, FR-PERS4-9, NFR-A5, PER-5, PER-6_

---

#### Story 24.6: Soul Editor with Variable Autocomplete

As an admin,
I want to edit agent Souls with syntax highlighting and variable suggestions,
So that I can customize agent behavior with confidence.

**Acceptance Criteria:**

**Given** the admin can edit agent Souls (FR21)
**When** the Soul editor is upgraded
**Then** CodeMirror editor with `{{variable}}` syntax highlighting (UXR118)
**And** autocomplete dropdown for all available variables: 7 built-in (agent_list, subordinate_list, tool_list, department_name, owner_name, specialty, knowledge_context) + personality_* + relevant_memories (AR15)
**And** Soul edits reflected from next request onward (FR22)
**And** all Souls include prohibition section automatically (FR25)
**And** personality comparison A/B preview (UXR136): side-by-side rendering with different personality values

_References: UXR118, UXR136, FR21, FR22, FR25, AR15_

---

#### Story 24.7: call_agent Response Standardization & Model Routing

As a developer,
I want call_agent responses in a structured format and cost-aware model selection,
So that downstream consumers get predictable data and costs are optimized.

**Acceptance Criteria:**

**Given** `call-agent.ts` currently forwards raw events
**When** AR73 response standardization is applied (same file as AR28 soul-enricher changes — coordinates with Story 24.2 which handles call-agent.ts soul-enricher migration)
**Then** child agent responses are parsed into `{ status: 'success'|'failure'|'partial', summary: string, next_actions?: string[], artifacts?: object[] }` (AR73)
**And** existing handoff functionality unchanged (FR3, FR4)

_AR74 (cost-aware model routing) handled separately:_
**And** `engine/model-selector.ts` extended with Admin-configurable cost preference per tier (AR74)
**And** `llm-router.ts` remains frozen — model-selector.ts is a separate file (AR74)
**And** reflection cron hardcoded to Haiku (`claude-haiku-4-5-20251001`, cheapest model, AR74)

_References: AR73, AR74, FR3, FR4_

---

#### Story 24.8: Go/No-Go #2 Verification & Sprint 1 Exit

As a QA engineer,
I want Sprint 1 exit criteria verified,
So that personality system is production-ready before Sprint 2 begins.

**Acceptance Criteria:**

**Given** all Epic 24 stories are complete
**When** Go/No-Go #2 verification runs
**Then** renderSoul() with personality extraVars produces non-empty output (empty string = FAIL)
**And** all 12 call sites pass personality variable injection test
**And** PER-1 4-layer sanitization passes 100% of test vectors
**And** NULL personality_traits → agent works normally (backward compat)
**And** preset selection → sliders fill → personality change → next session reflects change (E2E)
**And** Go/No-Go #6 partial: ESLint hardcoded colors check (Epic 23 Layer 0 progress)
**And** Soul reflection rate: 3 rule scenarios (prohibition compliance, tool restriction, scope boundary) × 10 requests = 30 tests, 24/30+ pass (NFR-O6)

_References: Go/No-Go #2, Go/No-Go #6 (partial), NFR-O6_

---

### Epic 25: n8n Workflow Integration

**Epic Goal:** Deploy n8n as a Docker container with 8-layer security, expose via Hono reverse proxy, provide admin editing and CEO viewing.

#### Story 25.1: n8n Docker Container Deployment

As a platform operator,
I want n8n running as an isolated Docker container,
So that workflow automation is available without affecting the main application.

**Acceptance Criteria:**

**Given** the VPS has Docker available (verified in Epic 22)
**When** n8n Docker Compose is configured
**Then** image pinned to `n8nio/n8n:2.12.3` (`:latest` forbidden, AR33)
**And** bound to localhost only (not exposed externally)
**And** SQLite database (not CORTHEX PostgreSQL, N8N-SEC-6)
**And** resource limits: memory 2G, cpus 2 (N8N-SEC-5, NFR-SC9)
**And** credential encryption: AES-256-GCM (N8N-SEC-7)
**And** healthcheck: `/healthz` every 30s, 3 failures → auto-restart (NFR-O9)
**And** `host.docker.internal:host-gateway` for n8n→CORTHEX callbacks (AR36)
**And** n8n failure does not crash CORTHEX (FR-N8N5)

_References: AR33, AR36, N8N-SEC-5~7, NFR-SC9, NFR-O9, FR-N8N5_

---

#### Story 25.2: N8N-SEC 8-Layer Security Implementation

As a security engineer,
I want all 8 security layers enforced on the n8n integration,
So that no partial deployment creates a security gap.

**Acceptance Criteria:**

**Given** n8n Docker is running (Story 25.1)
**When** all 8 security layers are implemented
**Then** (1) VPS firewall blocks port 5678 externally (N8N-SEC-1)
**And** (2) n8n editor UI active but Admin-only via Hono proxy (N8N-SEC-2)
**And** (3) Hono proxy with tenantMiddleware JWT + Admin auth + tag-based multi-tenant isolation (N8N-SEC-3)
**And** (4) Per-company HMAC webhook signature verification (N8N-SEC-4)
**And** (5) Docker resource limits applied (from Story 25.1) (N8N-SEC-5)
**And** (6) n8n cannot access CORTHEX PostgreSQL DB (N8N-SEC-6)
**And** (7) Credential encryption AES-256-GCM (from Story 25.1) (N8N-SEC-7)
**And** (8) n8n API rate limiting: 60/min (N8N-SEC-8)
**And** partial deployment is forbidden — all 8 or none (AR34)

_References: AR34, N8N-SEC-1~8, NFR-S9_

---

#### Story 25.3: Hono Reverse Proxy for n8n

As an admin,
I want to access n8n through the CORTHEX admin panel,
So that workflow management is integrated into my existing admin experience.

**Acceptance Criteria:**

**Given** n8n is running with 8-layer security (Stories 25.1-25.2)
**When** `routes/admin/n8n-proxy.ts` is implemented
**Then** Hono `proxy()` forwards requests to localhost:5678
**And** path normalization: double-dot (`..`) paths blocked
**And** Admin JWT authentication required on all proxy routes
**And** CSRF Origin verification on editor access (FR-N8N6)
**And** OOM recovery: proxy detects n8n OOM → returns "service temporarily suspended" → auto-restart
**And** admin workflow list API available (FR-N8N1)
**And** tag-based multi-tenant isolation on all queries

_References: AR35, FR-N8N1, FR-N8N6_

---

#### Story 25.4: CEO Workflow Results View & Admin Editor

As a CEO,
I want to see workflow execution results,
So that I can monitor what automated tasks are accomplishing.

**Acceptance Criteria:**

**Given** n8n proxy is accessible (Story 25.3)
**When** CEO and Admin views are implemented
**Then** CEO app: read-only workflow execution results view (FR-N8N2)
**And** Admin app: full n8n visual editor access via proxy (FR-N8N6)
**And** workflow list view (UXR119) with status indicators
**And** error handling: OOM, API failure, timeout displayed clearly (UXR121)
**And** n8n failure → "Workflow service temporarily suspended" message (FR-N8N5)

_References: FR-N8N2, FR-N8N5, FR-N8N6, UXR119, UXR121_

---

#### Story 25.5: Legacy Workflow Code Deletion

As a developer,
I want the old self-implementation workflow code removed,
So that the codebase is clean and there's no confusion about which system handles workflows.

**Acceptance Criteria:**

**Given** n8n is fully operational (Stories 25.1-25.4)
**When** legacy workflow code is deleted
**Then** legacy server code deleted: `routes/workspace/workflows.ts`, `services/workflow/` (suggestion.ts, pattern-analyzer.ts, execution.ts, engine.ts), `lib/workflow/` (engine.ts, dag-solver.ts) (FR-N8N3)
**And** legacy frontend workflow pages and components deleted from `packages/app/`
**And** workflow-related test files (`workflow-*` pattern) removed
**And** migration files (0037, 0056, 0059) are NOT deleted — schema history must be preserved
**And** no orphaned imports or dead code remains
**And** all remaining tests pass with workflow code removed
**And** no v2 functionality lost — n8n replaces all legacy workflow features

_References: FR-N8N3, AR57_

---

#### Story 25.6: Go/No-Go #3 — n8n Security Verification

As a QA engineer,
I want Sprint 2 n8n exit criteria verified,
So that n8n deployment is security-certified.

**Acceptance Criteria:**

**Given** all Epic 25 stories are complete
**When** Go/No-Go #3 3-part verification runs
**Then** (1) Port 5678 external connection attempt → rejected
**And** (2) Tag filter cross-company data access → blocked
**And** (3) Webhook with tampered HMAC signature → rejected
**And** all 8 N8N-SEC layers independently tested
**And** n8n Docker health monitoring active (healthcheck pass)
**And** resource limits verified under load (2G RAM cap holds)

_References: Go/No-Go #3, NFR-S9_

---

### Epic 26: AI Marketing Automation

**Epic Goal:** Enable AI-powered content creation, multi-platform posting, and human approval workflows on the n8n platform.

#### Story 26.1: Marketing Settings & AI Engine Configuration

As an admin,
I want to select which AI tools power content creation,
So that I can choose the best tools for my needs and swap them without code changes.

**Acceptance Criteria:**

**Given** company settings exist in `company.settings` JSONB
**When** marketing engine configuration is implemented
**Then** admin can select AI tool engines by category: image (3+ types), video (4+ types), narration (2 types), subtitles (3 types) (FR-MKT1)
**And** API keys stored with AES-256 encryption in company settings (AR39, MKT-1)
**And** atomic `jsonb_set()` + WHERE conditional for concurrent updates (AR41)
**And** engine changes take effect from next workflow execution (FR-MKT4)
**And** copyright watermark ON/OFF toggle (FR-MKT6)
**And** cost attribution via company API keys (MKT-3)

_References: AR39, AR41, FR-MKT1, FR-MKT4, FR-MKT6, MKT-1, MKT-3_

---

#### Story 26.2: Marketing Preset Workflows

As an admin,
I want pre-built marketing automation templates,
So that I can start automated content creation immediately.

**Acceptance Criteria:**

**Given** n8n is running with admin access (Epic 25)
**When** preset workflows are installed
**Then** marketing preset JSON stored in `_n8n/presets/` (AR40)
**And** install via n8n API with auto-tag per company
**And** preset workflow: topic input → AI research → card news + short-form video simultaneous generation → human approval → multi-platform posting (FR-MKT2)
**And** during onboarding: "Install marketing automation template?" suggestion (FR-MKT5)
**And** workflow pipeline view (UXR101) shows DAG graph with execution status and history

_References: AR40, FR-MKT2, FR-MKT5, UXR101_

---

#### Story 26.3: Human Approval & Multi-Platform Posting

As a CEO,
I want to review AI-generated content before it's published,
So that quality is maintained across all channels.

**Acceptance Criteria:**

**Given** marketing workflow generates content (Story 26.2)
**When** approval flow triggers
**Then** humans can approve/reject via CEO app web UI, Slack, or Telegram (FR-MKT3)
**And** approved content posted to Instagram, TikTok, YouTube simultaneously
**And** partial platform failure retains successful platforms (FR-MKT2)
**And** performance targets: image ≤2min, video ≤10min, posting ≤30s (NFR-P17)

_References: FR-MKT2, FR-MKT3, NFR-P17_

---

#### Story 26.4: API Failure Fallback & Error Handling

As an admin,
I want the system to handle AI API failures gracefully,
So that content creation doesn't stop when one API is down.

**Acceptance Criteria:**

**Given** marketing workflows depend on external AI APIs
**When** an API fails
**Then** n8n Error Workflow: timeout 30s → retry 2x → fallback engine auto-switches (FR-MKT7)
**And** admin receives notification on fallback activation
**And** MKT-2 fallback test: primary engine failure → secondary engine continues
**And** platform API changes handled via n8n node updates (MKT-5)

_References: FR-MKT7, MKT-2, MKT-5_

---

#### Story 26.5: Marketing E2E Verification

As a QA engineer,
I want marketing automation verified end-to-end,
So that Sprint 2 exit criteria are met.

**Acceptance Criteria:**

**Given** all Epic 26 stories are complete
**When** marketing E2E test runs
**Then** full pipeline success: topic input → AI content generation → human approval → at least 1 platform posting completed without error
**And** image generation ≤2min, posting ≤30s (NFR-P17)
**And** fallback engine test: primary engine deliberately disabled → secondary engine completes generation (MKT-2)
**And** Sprint 2 exit marketing verification: pipeline E2E pass + fallback test pass

_References: NFR-P17, Sprint 2 exit verification_

---

### Epic 27: Tool Response Security

**Epic Goal:** Protect AI agents from prompt injection in external tool responses via PreToolResult sanitization.

#### Story 27.1: Tool Sanitizer at PreToolResult Hook

As a security engineer,
I want tool responses sanitized before reaching the AI agent,
So that malicious content in tool outputs cannot manipulate agent behavior.

**Acceptance Criteria:**

**Given** `agent-loop.ts` has PreToolResult hook points (MCP error/success tool_result paths)
**When** tool sanitizer is implemented
**Then** sanitizer runs at PreToolResult (not PostToolUse) on two external MCP tool_result paths (AR37)
**And** three internal paths are exempt from sanitization (AR37)
**And** minimum 10 regex patterns for prompt injection detection (AR38)
**And** matched content replaced with `[BLOCKED: suspected prompt injection in tool response]` (AR38)
**And** blocked events logged to activity_logs (audit trail)
**And** sanitization chain is independent — never imports PER-1 or MEM-6 (AR60)
**And** extensible framework: patterns stored in `config/tool-sanitizer-patterns.json`, loaded at startup, Admin can add/edit patterns via Admin API without server restart

_References: AR37, AR38, AR60, FR-TOOLSANITIZE1, FR-TOOLSANITIZE2_

---

#### Story 27.2: Adversarial Payload Testing & Admin Visibility

As an admin,
I want to know when tool responses are being blocked,
So that I can monitor for potential attacks and review false positives.

**Acceptance Criteria:**

**Given** tool sanitizer is operational (Story 27.1)
**When** adversarial payloads are tested
**Then** 100% block rate against minimum 10 diverse adversarial payloads (FR-TOOLSANITIZE3, NFR-S10)
**And** 25+ diverse payload test suite recommended (AR38)
**And** admin can view blocked events in activity log
**And** normal tool responses pass through unmodified (zero false positives on benign responses)
**And** security invisible to CEO — uninterrupted agent interactions

_References: FR-TOOLSANITIZE3, NFR-S10, AR38_

---

#### Story 27.3: Go/No-Go #11 & OWASP Expansion Preparation

As a QA engineer,
I want Sprint 2 tool security exit verified and OWASP expansion planned,
So that the foundation is solid for Sprint 3 expansion.

**Acceptance Criteria:**

**Given** Stories 27.1-27.2 are complete
**When** Go/No-Go #11 verification runs
**Then** 10 baseline adversarial payloads: 100% block rate (Sprint 2 exit)
**And** 0 false positives on 20+ benign tool responses
**And** OWASP prompt injection library 50+ patterns documented for Sprint 3 expansion (AR38)
**And** cross-sprint test scope documented: Sprint 3 OWASP verification within Epic 28 test scope

_References: Go/No-Go #11, AR38_

---

### Epic 28: Agent Memory & Learning

**Epic Goal:** Give agents observation recording, AI-powered reflection, contextual memory retrieval via vector search, and capability evaluation.

#### Story 28.1: Observations Table Schema & Recording

As an agent,
I want my task results recorded automatically,
So that I can learn from past experiences over time.

**Acceptance Criteria:**

**Given** agents complete task executions
**When** observation recording is implemented
**Then** migration `0063_add_observations.sql` creates `observations` table: UUID PK, company_id, agent_id, session_id, content TEXT CHECK ≤10KB, outcome VARCHAR(20) DEFAULT 'unknown' (success/failure/unknown), domain VARCHAR(50) DEFAULT 'conversation', importance INTEGER 1-10 DEFAULT 5, confidence REAL 0-1 DEFAULT 0.5, embedding VECTOR(1024), reflected BOOLEAN DEFAULT false, flagged BOOLEAN DEFAULT false (AR42)
**And** three indexes: partial (unreflected+importance), HNSW (embedding), TTL (reflected_at) (AR43)
**And** auto-recording after agent execution completion: hub.ts → sanitize → INSERT (AR67)
**And** company_id isolation on all queries (FR-MEM8)
**And** zero regression on existing agent_memories table (MEM-1)

_References: AR42, AR43, AR67, FR-MEM1, FR-MEM8, MEM-1_

---

#### Story 28.2: MEM-6 4-Layer Observation Sanitization

As a security engineer,
I want observation content sanitized before storage,
So that poisoned or malicious content cannot corrupt agent memory.

**Acceptance Criteria:**

**Given** observations are being recorded (Story 28.1)
**When** MEM-6 4-layer sanitization is applied
**Then** Layer 1: 10KB size limit enforced (AR46)
**And** Layer 2: control character strip (AR46)
**And** Layer 3: prompt hardening via keyword blocklist + regex pattern matching (minimum 10 patterns: system prompt override, role confusion, instruction injection, delimiter abuse, context manipulation, encoding attacks, nested injection, markdown abuse, XML/JSON injection, Unicode tricks) (AR46)
**And** Layer 4: content classification via keyword blocklist + regex pattern matching (same approach as TOOLSANITIZE — not ML, to keep complexity low) — blocked content → Admin flag + audit log (FR-MEM12)
**And** sanitization chain independent — never imports PER-1 or TOOLSANITIZE (AR60)
**And** blocked content = Admin flag + audit log entry

_References: AR46, AR60, FR-MEM12, MEM-6_

---

#### Story 28.3: Observation Vectorization & Confidence Mechanics

As an agent,
I want my observations searchable by meaning,
So that relevant past experiences can be found when needed.

**Acceptance Criteria:**

**Given** observations are stored (Stories 28.1-28.2)
**When** vectorization and confidence are implemented
**Then** observation content auto-vectorized via Voyage AI (voyage-3, 1024d) into `embedding VECTOR(1024)` (FR-MEM2)
**And** embedding failure → NULL (allowed, NFR-D3)
**And** confidence decay calculated at read time (not cron): `effective_confidence = stored_confidence - (weeks_since_last_update * 0.1), floor 0.1` (AR44)
**And** confidence reinforcement: similar observations (cosine ≥0.85) → +0.15 (ceiling 1.0) (AR44)
**And** confidence scale: observations REAL 0-1, agent_memories INTEGER 0-100, conversion: `confidence * 100` (AR44)
**And** HNSW index on observations.embedding for fast search

_References: AR44, FR-MEM2, NFR-D3, VEC-2_

---

#### Story 28.4: Reflection Cron Worker

As a platform operator,
I want agents to automatically synthesize learnings from observations,
So that agents develop wisdom over time without manual intervention.

**Acceptance Criteria:**

**Given** observations accumulate over time
**When** daily reflection cron runs
**Then** runs daily at 3AM + company hash stagger (AR47)
**And** pg_try_advisory_xact_lock for concurrent prevention — lock acquisition failure → skip this cycle, log warning, retry next scheduled run (AR47)
**And** triggers when per-agent unreflected observations ≥20 AND per-observation average confidence ≥0.7 (filter: individual observations with confidence ≥0.7 count toward the 20 threshold) (FR-MEM3)
**And** tier limits: Tier 1-2 unlimited, Tier 3-4 weekly 1x cap (AR47)
**And** Haiku API (`claude-haiku-4-5-20251001`) summarizes 20 observations → stores in `agent_memories` with `memoryType='reflection'` (FR-MEM4)
**And** reflection content auto-vectorized via Voyage AI 1024d (FR-MEM5)
**And** per-agent processing ≤30s (NFR-P16)
**And** cost > $0.10/day per company → auto-pause + Admin notification (FR-MEM14, NFR-COST3)
**And** Admin confirmation required to resume after cost pause

_References: AR47, FR-MEM3, FR-MEM4, FR-MEM5, FR-MEM14, NFR-P16, NFR-COST3, NFR-O10_

---

#### Story 28.5: Agent Memories Extension & HNSW Index

As a developer,
I want agent_memories extended to support reflection embeddings,
So that memory search can find relevant reflections via vector similarity.

**Acceptance Criteria:**

**Given** reflection cron generates reflections (Story 28.4)
**When** migration `0064_extend_agent_memories.sql` is applied
**Then** `memoryType='reflection'` enum added to agent_memories (AR45)
**And** `embedding VECTOR(1024)` column added (AR45)
**And** HNSW index created on embedding column (AR45)
**And** zero regression on existing agent_memories data and queries (Go/No-Go #4)
**And** pgvector HNSW index + observations total ≤3GB (NFR-SC7)

_References: AR45, NFR-SC7, Go/No-Go #4_

---

#### Story 28.6: Memory Search in Soul Enricher

As an agent,
I want relevant past learnings injected into my context,
So that I can apply past experience to new tasks.

**Acceptance Criteria:**

**Given** reflections exist with embeddings (Stories 28.4-28.5)
**When** soul-enricher memory retrieval is implemented
**Then** `soul-enricher.ts` extended (additive — EnrichResult interface frozen, AR49)
**And** at task start: searches agent_memories(reflection) with cosine ≥0.75, retrieves top 3 (AR49, FR-MEM6)
**And** results injected into Soul via `{relevant_memories}` variable
**And** memory search failure → `{relevant_memories}` falls back to empty string, agent proceeds (FR-MEM7)
**And** search latency P95 ≤200ms (NFR-P18)
**And** enricher overhead ≤300ms total on session startup (NFR-P18)
**And** company_id isolation on all memory queries (FR-MEM8)

_References: AR49, FR-MEM6, FR-MEM7, FR-MEM8, NFR-P18_

---

#### Story 28.7: Observation TTL & Memory Cleanup

As a platform operator,
I want observation data automatically cleaned up,
So that storage doesn't grow unbounded and data retention policies are met.

**Acceptance Criteria:**

**Given** observations and reflections accumulate
**When** TTL cleanup is configured
**Then** reflected=true observations auto-deleted after 30 days (AR48, FR-MEM13)
**And** agent_memories(reflection) permanent — no TTL (AR48)
**And** Admin can adjust retention period (FR-MEM13)
**And** NFR-D8: 30-day TTL enforced
**And** cleanup runs as part of existing cron infrastructure

_References: AR48, FR-MEM13, NFR-D8, MEM-7_

---

#### Story 28.8: CEO Memory Dashboard & Notifications

As a CEO,
I want to see how my agents are learning and growing,
So that I can track the value of the memory system.

**Acceptance Criteria:**

**Given** agents have observations and reflections
**When** CEO memory views are implemented
**Then** CEO can view per-agent reflection history (FR-MEM9)
**And** growth metrics: observation count, reflection count, outcome distribution (success/failure/unknown via AR42 outcome field)
**And** new reflection generation → notification via Notifications WebSocket (FR-MEM10)
**And** MemoryTimeline component (UXR102): date separators, observation/reflection cards, security badges, J/K keyboard navigation
**And** mobile responsive

_References: FR-MEM9, FR-MEM10, UXR102_

---

#### Story 28.9: Admin Memory Management

As an admin,
I want to view and manage agent memory data,
So that I can monitor the system and intervene when needed.

**Acceptance Criteria:**

**Given** agents have observations and reflections
**When** admin memory management is implemented
**Then** admin can view per-agent observations and reflections (FR-MEM11)
**And** admin can delete observations and reflections (MEM-4: Admin-only deletion)
**And** memory utilization audit view (MEM-5): storage per agent, embedding count, flagged count
**And** flagged observations highlighted for review
**And** cost monitoring: daily Haiku API spend, Voyage embedding costs

_References: FR-MEM11, MEM-4, MEM-5_

---

#### Story 28.10: Capability Evaluation Framework

As a QA engineer,
I want a standardized evaluation framework for agent capabilities,
So that we can measure agent improvement over time.

**Acceptance Criteria:**

**Given** agents have memory and personality (Epics 24 + 28)
**When** capability evaluation framework is implemented (AR75)
**Then** standard task corpus: minimum 10 tasks across 5 categories (information retrieval, creative writing, code analysis, multi-step reasoning, tool usage)
**And** automated evaluation pipeline that runs tasks and measures results
**And** 3+ repeated iterations per task (each iteration = full corpus run of all 10 tasks)
**And** 3rd iteration rework must be ≤50% of 1st iteration (Go/No-Go #14)
**And** results stored for trend analysis
**And** **distinct testing workstream** — separate stories with different AC patterns from feature stories

_References: AR75, Go/No-Go #14_

---

#### Story 28.11: Go/No-Go Sprint 3 Exit Verification

As a QA engineer,
I want all Sprint 3 gates verified,
So that memory system is production-ready.

**Acceptance Criteria:**

**Given** all Epic 28 stories are complete
**When** Sprint 3 exit verification runs
**Then** **Early verification (mid-sprint):**
**And** #7: Reflection cost ≤$0.10/day per company verified
**And** #9: Observation poisoning 100% block rate verified (MEM-6 + 10 adversarial payloads)
**Then** **Exit verification:**
**And** #4: Memory zero regression — all existing agent_memories queries pass, 10,154+ tests pass
**And** #14: Capability evaluation — 3rd iteration rework ≤50% of 1st
**And** OWASP 50+ pattern expansion verified (cross-sprint from Epic 27)

_References: Go/No-Go #4, #7, #9, #14_

---

### Epic 29: OpenClaw Virtual Office

**Epic Goal:** Bring the AI organization to life with a pixel art virtual office showing real-time agent activity.

#### Story 29.1: packages/office/ Turborepo Workspace Setup

As a developer,
I want the office package set up as an independent workspace,
So that PixiJS code is isolated and doesn't affect main bundle size.

**Acceptance Criteria:**

**Given** the monorepo uses Turborepo
**When** `packages/office/` workspace is created
**Then** independent Turborepo workspace with `package.json` (AR50)
**And** PixiJS 8.17.1 + @pixi/react 8.0.5 (exact pin) installed only in office package (AR50)
**And** Vite library mode build configuration (AR50)
**And** `turbo.json` includes `"office#build"` pipeline entry (AR54)
**And** CEO app imports via `React.lazy(() => import('@corthex/office'))` (AR51)
**And** PixiJS tree-shaking: only 6 required classes imported (AR51)
**And** Go/No-Go #5: PixiJS bundle ≤200KB gzipped (PIX-1)
**And** load failure → fallback UI displayed (AR51)
**And** office package failure does not affect Hub/Chat/NEXUS (FR-OC8, PIX-5)

_References: AR50, AR51, AR54, FR-OC1, FR-OC8, PIX-1, PIX-5_

---

#### Story 29.2: /ws/office WebSocket Channel

As a developer,
I want a dedicated WebSocket channel for office state,
So that agent status updates flow in real-time to the virtual office.

**Acceptance Criteria:**

**Given** 16 WebSocket channels exist
**When** `/ws/office` is added as the 17th channel
**Then** `WsChannel` union type extended to include 'office' (AR52)
**And** JWT authentication (same method as existing 16 channels) (FR-OC2)
**And** connection limits: max 50 per company, 500 server-wide (FR-OC2, NRT-5)
**And** excess connections closed with code 4001 (capacity exceeded), client implements exponential backoff: 1s→2s→4s→max 30s (FR-OC2)
**And** token bucket rate limit: 10msg/s per userId (AR52)
**And** Hono WebSocket Helper `upgrade()` pattern (FR-OC7)
**And** adaptive heartbeat: idle 30s, active 5s (NFR-P15, NRT-2)

_References: AR52, FR-OC2, FR-OC7, NFR-P15, NRT-2, NRT-5_

---

#### Story 29.3: Server-Side State Polling & Broadcasting

As a developer,
I want the server to detect agent state changes and broadcast them,
So that the virtual office reflects real-time execution status.

**Acceptance Criteria:**

**Given** `/ws/office` channel exists (Story 29.2)
**When** state polling is implemented
**Then** `office-channel.ts` polls `activity_logs` table every 500ms (AR53, PIX-6)
**And** LISTEN/NOTIFY not used (Neon serverless limitation) (FR-OC7)
**And** adaptive polling: only when WebSocket clients connected (AR53)
**And** diff with previous state, skip broadcast if unchanged (AR53)
**And** state sync: agent-loop execution → pixel state ≤2s (NFR-P14, NRT-4)
**And** 6 states broadcast: idle, working, speaking, tool_calling, error, degraded (NRT-1 base + NRT-2 heartbeat timeout: 15s no response → degraded, 30s → error). 4-color mapping: idle→blue, active(working/speaking/tool_calling)→green, error→red, degraded→orange
**And** `engine/agent-loop.ts` unmodified — reads existing activity_logs data (FR-OC7)

_References: AR53, FR-OC7, NFR-P14, NRT-1, NRT-3, NRT-4, PIX-6_

---

#### Story 29.4: PixiJS Office Canvas — Agent Sprites & Animations

As a CEO,
I want to see my agents as pixel art characters moving and working,
So that the AI organization feels alive and engaging.

**Acceptance Criteria:**

**Given** state events arrive via WebSocket (Story 29.3)
**When** PixiJS canvas renders agents
**Then** each agent rendered as 32×32px pixel art character (FR-OC1)
**And** idle agents: random walk animation (FR-OC3)
**And** working agents: typing animation with speech bubble (max 50 chars) (FR-OC4)
**And** tool_calling agents: tool icon and spark effect (FR-OC5)
**And** error agents: red exclamation mark, stopped animation (FR-OC6)
**And** click agent → details panel (UXR83)
**And** double-click department → zoom viewport (UXR84)
**And** viewport culling: off-screen sprites not rendered (UXR86)
**And** WebGL primary, Canvas 2D fallback (PIX-2)
**And** `prefers-reduced-motion: reduce` → static icons (UXR41)
**And** placeholder sprites (colored rectangles per department color) used for development. Final AI-generated sprites integrated in Story 29.8

_References: FR-OC1, FR-OC3-OC6, UXR83-84, UXR86, PIX-2, UXR41_

---

#### Story 29.5: Mobile List View & Responsive Behavior

As a CEO on mobile,
I want to see agent status in a simple list,
So that I can check on my team from any device.

**Acceptance Criteria:**

**Given** `/office` is accessed on mobile/tablet
**When** responsive behavior activates
**Then** PixiJS canvas disabled on sm/md breakpoints (FR-OC9, PIX-3)
**And** simplified agent status list view instead (FR-OC9, NFR-A7)
**And** each agent shows: name, department, current state (idle/working/error), task summary
**And** list updates in real-time via same WebSocket channel
**And** desktop (lg): PixiJS at 30fps (UXR4)
**And** wide (xl): PixiJS at 60fps (UXR5)
**And** FPS transition 500ms debounce via matchMedia (UXR6)

_References: FR-OC9, NFR-A7, PIX-3, UXR2-6_

---

#### Story 29.6: Accessibility — Screen Reader & Keyboard

As a user with disabilities,
I want the virtual office accessible via screen reader,
So that I can understand agent activity without visual rendering.

**Acceptance Criteria:**

**Given** the office shows visual agent states
**When** accessibility features are implemented
**Then** aria-live="polite" text alternative panel (NFR-A6, PIX-4)
**And** format: "Marketing agent: currently writing report" (FR-OC10)
**And** keyboard navigation between agents
**And** admin app: read-only view, no task commands (FR-OC11)
**And** PixiJS performance UXR (UXR87) verified
**And** OfficeCanvas component (UXR96) accessible

_References: NFR-A6, FR-OC10, FR-OC11, PIX-4, UXR87, UXR96_

---

#### Story 29.7: Load Testing & Connection Management

As a platform operator,
I want the office WebSocket to handle production load,
So that many users can watch the office simultaneously.

**Acceptance Criteria:**

**Given** `/ws/office` is operational (Stories 29.2-29.3)
**When** load testing is performed
**Then** 50 concurrent connections per company verified (NFR-SC8)
**And** 500 server-wide connections verified (NFR-SC8)
**And** token bucket rate limiting holds under load
**And** adaptive heartbeat correctly switches idle→active→idle
**And** memory usage within bounds (pgvector HNSW ≤3GB total, NFR-SC7)

_References: NFR-SC8, NFR-SC7_

---

#### Story 29.8: AI Sprite Approval & v1 Feature Parity

As a product owner,
I want sprites approved and v1 feature parity confirmed,
So that the product meets quality standards.

**Acceptance Criteria:**

**Given** the office is fully functional (Stories 29.1-29.7)
**When** final approvals and parity checks run
**Then** Go/No-Go #8: AI sprite design approved by PM
**And** Go/No-Go #12: v1 feature parity — all v1 features working in v3
**And** deterministic sprite tools used (AR70 R8)
**And** all existing API endpoints still functional

_References: Go/No-Go #8, Go/No-Go #12, AR70_

---

#### Story 29.9: System-Wide Final Verification (Go/No-Go Sprint 4)

As a QA engineer,
I want all system-wide exit criteria verified,
So that v3 is production-ready.

**Acceptance Criteria:**

**Given** all 8 epics are complete
**When** Sprint 4 final verification runs
**Then** Go/No-Go #1: Zero Regression — all existing API endpoints + 10,154+ tests all pass
**And** Go/No-Go #5: PixiJS bundle ≤200KB gzipped
**And** Go/No-Go #8: AI sprite PM approval
**And** Go/No-Go #12: v1 feature parity (every v1 feature working)
**And** Go/No-Go #13: CEO daily task ≤5min (browser open → /office → identify working agent → Chat → "summarize today's progress" → /office verify)
**And** all 14 Go/No-Go gates passed across all sprints

_References: Go/No-Go #1, #5, #8, #12, #13, NFR-O11_
