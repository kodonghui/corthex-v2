---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/v1-feature-spec.md
---

# corthex-v2 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for CORTHEX v2, decomposing 88 functional requirements, 23 non-functional requirements, and additional technical requirements into implementable stories organized by user value.

## Requirements Inventory

### Functional Requirements

FR1: CEO can issue natural language commands via Command Center
FR2: CEO can use @mention to assign commands to specific managers
FR3: CEO can use 8 slash commands
FR4: CEO can create/edit/use command presets
FR5: CEO can view real-time delegation chain with elapsed time
FR6: CEO can view SSE-streamed agent responses
FR7: System auto-classifies commands and routes via Chief of Staff
FR8: Manager agents decompose and distribute tasks in parallel
FR9: Specialists execute 5-stage autonomous deep work
FR10: Managers independently analyze (5th analyst) before synthesizing
FR11: Chief of Staff quality-checks reports (5-item rubric)
FR12: System tracks full delegation chain in real-time
FR13: System executes relay mode (/sequential)
FR14: System deploys 29-agent organization per company
FR15: Admin can manage agent hierarchy
FR16: CEO/Admin can edit agent Soul via markdown editor
FR17: System injects department knowledge into agent prompts
FR18: Each agent has tier with default LLM model
FR19: Agents invoke tools from 125+ catalog
FR20: Admin configures per-agent tool permissions
FR21: System logs all tool invocations
FR22: System truncates tool results > 4000 chars
FR23: CEO views tool logs in Communication Log
FR24: CEO triggers tool health check via /tool-check
FR25: System routes LLM calls to Claude/GPT/Gemini
FR26: Admin assigns LLM models to agents
FR27: System collects batch queue for 50% discount
FR28: CEO views batch status via /batch-run, /batch-status
FR29: System fails over to alternative LLM provider
FR30: Chief of Staff evaluates reports on 5 criteria
FR31: System auto-triggers rework on QA failure
FR32: CEO provides thumbs up/down feedback
FR33: System tracks quality gate pass rates
FR34: CEO initiates round-based debates (2/3 rounds)
FR35: System streams debates via SSE
FR36: System presents debate diff view
FR37: System synthesizes debate consensus
FR38: CEO views portfolio dashboard
FR39: CEO manages watchlist with auto-refresh
FR40: System executes KIS auto-trades
FR41: CIO calculates position sizing from confidence
FR42: CEO selects investment style
FR43: CEO runs paper trading
FR44: CMO team generates multi-platform content
FR45: CEO reviews/approves content before publish
FR46: System schedules content publication
FR47: System auto-publishes via Selenium
FR48: CMO creates card news series
FR49: CEO draws on Cytoscape canvas (8 node types)
FR50: System converts Mermaid<->Cytoscape bidirectionally
FR51: AI reads canvas as Mermaid via read_canvas()
FR52: AI modifies canvas in real-time via MCP SSE
FR53: CEO saves/loads diagrams
FR54: CEO views summary cards (tasks, cost, agents, integrations)
FR55: CEO views AI usage charts by provider
FR56: CEO views/sets budget limits
FR57: CEO executes quick actions
FR58: CEO provides satisfaction feedback
FR59: CEO views 4-tab activity log
FR60: CEO views delegation records
FR61: CEO searches/filters/bookmarks command history
FR62: CEO compares two results (A/B)
FR63: CEO replays historical commands
FR64: Admin manages RAG document store
FR65: System injects department knowledge into prompts
FR66: System extracts learning points from tasks
FR67: System references past learnings in future tasks
FR68: CEO creates cron-scheduled commands
FR69: CEO enables/disables scheduled tasks
FR70: System tracks last_run/next_run
FR71: System collects data based on triggers
FR72: CEO views ARGOS status bar
FR73: CEO views ARGOS activity/error logs
FR74: CEO commands via Telegram with @mention
FR75: CEO receives department reports via Telegram
FR76: Team members communicate via messenger
FR77: CEO views Soul Gym (improvements, trust scores)
FR78: CEO views quality dashboard
FR79: CEO views per-agent performance metrics
FR80: CEO stores reports in classified archive
FR81: System finds similar reports
FR82: CEO creates multi-step workflows
FR83: System tracks workflow execution state
FR84: Admin creates/manages companies
FR85: Admin invites/manages employees
FR86: System isolates data by companyId
FR87: Admin manages credential vault
FR88: System provides dual JWT auth

### NonFunctional Requirements

NFR1: Simple commands < 30 seconds
NFR2: Complex commands < 3 minutes
NFR3: WebSocket latency < 100ms
NFR4: Dashboard load < 2 seconds
NFR5: Watchlist refresh within 60-second cycle
NFR6: AES-256-GCM credential encryption
NFR7: companyId tenant isolation on all queries
NFR8: JWT with expiration and refresh
NFR9: Tool permission check before execution
NFR10: All agent communication logged
NFR11: 10+ concurrent companies
NFR12: 50+ concurrent users
NFR13: 10+ parallel specialist executions
NFR14: 100+ concurrent tool invocations
NFR15: 24-hour uptime < 5% error rate
NFR16: LLM failover within 5 seconds
NFR17: WebSocket auto-reconnection
NFR18: Graceful degradation on tool failure
NFR19: 3+ LLM providers simultaneously
NFR20: KIS Securities API integration
NFR21: Telegram Bot API integration
NFR22: Selenium WebDriver for SNS
NFR23: MCP SSE for SketchVibe

### Additional Requirements

- Existing Turborepo monorepo structure must be maintained
- Bun runtime (not Node.js)
- Drizzle ORM migrations for all schema changes
- WebSocket 7-channel multiplexing via EventBus
- Dark-first design with Tailwind CSS 4
- @corthex/ui shared component library (CVA-based)
- File naming: kebab-case lowercase
- Import paths must match git ls-files casing

### FR Coverage Map

FR1-FR6: Epic 1 (Command Center)
FR7-FR13: Epic 2 (Orchestration Engine)
FR14-FR18: Epic 3 (Agent Organization)
FR19-FR24: Epic 4 (Tool System)
FR25-FR29: Epic 5 (LLM Router)
FR30-FR33: Epic 6 (Quality Gate)
FR54-FR58: Epic 7 (Dashboard)
FR59-FR63: Epic 8 (Activity & History)
FR64-FR67: Epic 9 (Knowledge & Memory)
FR68-FR70: Epic 10 (Cron Scheduler)
FR34-FR37: Epic 11 (AGORA Debates)
FR38-FR43: Epic 12 (Strategy Room)
FR44-FR48: Epic 13 (SNS Publishing)
FR49-FR53: Epic 14 (SketchVibe)
FR71-FR73: Epic 15 (ARGOS Intelligence)
FR74-FR76: Epic 16 (Telegram & Messenger)
FR77-FR81: Epic 17 (Performance & Archive)
FR82-FR83: Epic 18 (Workflow Automation)
FR84-FR88: Epic 0 (Foundation - Multi-tenancy)

## Epic List

### Epic 0: Foundation — Multi-tenancy & Auth
Users can sign up, login, and operate in isolated company workspaces. Admins can manage companies, employees, and credentials.
**FRs covered:** FR84, FR85, FR86, FR87, FR88
**NFRs:** NFR6, NFR7, NFR8, NFR11, NFR12

### Epic 1: Command Center
CEO can issue commands to AI organization via natural language, @mention, slash commands, and presets. Real-time status visible.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6
**NFRs:** NFR3, NFR17

### Epic 2: Orchestration Engine
System automatically classifies commands, delegates to managers, managers distribute to specialists in parallel, results synthesized and delivered. The core AI working pipeline.
**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR13
**NFRs:** NFR1, NFR2, NFR15, NFR18

### Epic 3: Agent Organization & Soul System
29-agent hierarchy deployed per company. CEO/Admin can view, manage, and edit agent Souls (personality/expertise). Department knowledge auto-injected.
**FRs covered:** FR14, FR15, FR16, FR17, FR18

### Epic 4: Tool System
Agents invoke 125+ real tools during tasks. Per-agent permissions, logging, result truncation, health checks.
**FRs covered:** FR19, FR20, FR21, FR22, FR23, FR24
**NFRs:** NFR9, NFR14

### Epic 5: LLM Multi-Provider Router
System routes to Claude/GPT/Gemini with model auto-assignment, batch API queue, and automatic failover.
**FRs covered:** FR25, FR26, FR27, FR28, FR29
**NFRs:** NFR16, NFR19

### Epic 6: Quality Gate
Chief of Staff evaluates reports on 5-item rubric, auto-rework on failure, CEO feedback tracking.
**FRs covered:** FR30, FR31, FR32, FR33

### Epic 7: Dashboard & Monitoring
CEO views summary cards, AI usage charts, budget limits, quick actions, satisfaction metrics.
**FRs covered:** FR54, FR55, FR56, FR57, FR58
**NFRs:** NFR4

### Epic 8: Activity Logging & History
4-tab activity log, delegation records, command history with search/filter/bookmark/A-B compare/replay.
**FRs covered:** FR59, FR60, FR61, FR62, FR63
**NFRs:** NFR10

### Epic 9: Knowledge Base & Agent Memory
RAG document store, department knowledge injection, auto-learning from tasks, past learning reference.
**FRs covered:** FR64, FR65, FR66, FR67

### Epic 10: Cron Scheduler
CEO creates scheduled commands with presets or custom cron, toggle on/off, run tracking.
**FRs covered:** FR68, FR69, FR70

### Epic 11: AGORA Debate Engine
6 department heads conduct round-based debates. SSE streaming, diff view, consensus synthesis.
**FRs covered:** FR34, FR35, FR36, FR37

### Epic 12: Strategy Room (Trading)
Portfolio dashboard, watchlist with auto-refresh, KIS auto-trading, position sizing, investment styles, paper trading.
**FRs covered:** FR38, FR39, FR40, FR41, FR42, FR43
**NFRs:** NFR5, NFR20

### Epic 13: SNS Publishing
Multi-platform content generation, CEO approval flow, scheduled publishing, Selenium automation, card news.
**FRs covered:** FR44, FR45, FR46, FR47, FR48
**NFRs:** NFR22

### Epic 14: SketchVibe (Visual Collaboration)
Cytoscape canvas with 8 node types, Mermaid bidirectional conversion, AI real-time editing via MCP SSE, save/load.
**FRs covered:** FR49, FR50, FR51, FR52, FR53
**NFRs:** NFR23

### Epic 15: ARGOS Intelligence Collection
Trigger-based data collection, status monitoring, activity/error logs.
**FRs covered:** FR71, FR72, FR73

### Epic 16: Telegram & Messenger
Mobile AI commands via Telegram, department reports push, in-company messenger for team communication.
**FRs covered:** FR74, FR75, FR76
**NFRs:** NFR21

### Epic 17: Performance Analysis & Archive
Soul Gym, quality dashboard, per-agent metrics, classified archive, similar report search.
**FRs covered:** FR77, FR78, FR79, FR80, FR81

### Epic 18: Workflow Automation
Multi-step workflow creation, execution state tracking.
**FRs covered:** FR82, FR83

---

## Epic 0: Foundation — Multi-tenancy & Auth

CEO/Admin/Employee can sign up, authenticate, and operate in fully isolated company workspaces with encrypted credential storage.

### Story 0.1: Company & Admin User Setup

As an admin,
I want to create a company and admin account,
So that I have an isolated workspace for my organization.

**Acceptance Criteria:**

**Given** no company exists
**When** admin registers with company name, email, and password
**Then** a new company record is created with unique companyId
**And** an admin_user record is created with hashed password
**And** a JWT token is returned for admin console access

**Given** an admin is authenticated
**When** they access any API endpoint
**Then** the companyId is injected into the request context from the JWT

### Story 0.2: User Authentication & Invitation

As a CEO,
I want to invite team members to my company,
So that they can independently use the AI organization.

**Acceptance Criteria:**

**Given** an admin is authenticated
**When** they create a user with email and role (CEO/Employee)
**Then** a user record is created in the users table with companyId
**And** the user can login via the app with their own JWT

**Given** a user is authenticated
**When** they access the app
**Then** all data queries are filtered by their companyId (NFR7)

### Story 0.3: Credential Vault

As an admin,
I want to securely store API keys for LLM providers and trading,
So that agents can use external services without exposing credentials.

**Acceptance Criteria:**

**Given** an admin is authenticated
**When** they store an API key (e.g., Anthropic, KIS)
**Then** the key is encrypted with AES-256-GCM before storage (NFR6)
**And** the key can only be decrypted at point-of-use, never logged

**Given** a credential is stored
**When** an agent needs to call an external API
**Then** the system decrypts the relevant credential for that company only

### Story 0.4: Admin Console — Company & User Management UI

As an admin,
I want a web console to manage companies and users,
So that I can administer the platform without database access.

**Acceptance Criteria:**

**Given** admin is logged into the admin console
**When** they navigate to Companies page
**Then** they see a list of all companies with basic stats

**Given** admin selects a company
**When** they navigate to Users page
**Then** they see all users for that company with roles
**And** they can create, edit, deactivate users

---

## Epic 1: Command Center

CEO can issue commands to the AI organization through multiple input methods and see real-time processing status.

### Story 1.1: Command Input & Natural Language

As a CEO,
I want to type natural language commands in the Command Center,
So that I can direct my AI organization like talking to a team.

**Acceptance Criteria:**

**Given** CEO is on the Command Center page
**When** they type "Analyze Samsung Electronics" and submit
**Then** the command is sent to POST /api/commands
**And** a command record is created in the database
**And** the response indicates the command was received and is being processed

**Given** a command is submitted
**When** the system processes it
**Then** the CEO sees real-time status updates via WebSocket (agent-status channel)

### Story 1.2: @Mention Direct Assignment

As a CEO,
I want to use @mention to assign commands directly to specific managers,
So that I can bypass auto-routing when I know who should handle it.

**Acceptance Criteria:**

**Given** CEO types "@CIO analyze Samsung Electronics"
**When** the command is submitted
**Then** the system routes directly to the CIO agent (skipping classification)
**And** the delegation chain shows "CEO -> CIO" in real-time

**Given** CEO types "@" in the command input
**When** they start typing an agent name
**Then** an autocomplete dropdown shows matching agent names

### Story 1.3: Slash Commands (8 Types)

As a CEO,
I want to use slash commands for special operations,
So that I can trigger system-level functions efficiently.

**Acceptance Criteria:**

**Given** CEO types "/commands"
**When** the command is submitted
**Then** a list of all 8 available slash commands is displayed

**Given** CEO types "/all market analysis"
**When** the command is submitted
**Then** all 6 department managers receive the command simultaneously

**Given** CEO types "/tool-check"
**When** the command is submitted
**Then** a tool health check runs and returns status of all tools

**Given** CEO types "/batch-run"
**When** the command is submitted
**Then** all queued batch requests are flushed for execution

### Story 1.4: Command Presets

As a CEO,
I want to save frequently used commands as presets,
So that I can issue common commands with one click.

**Acceptance Criteria:**

**Given** CEO is on the Command Center
**When** they create a preset with shortcut "Samsung" and full command "Analyze Samsung Electronics investment potential"
**Then** the preset is saved to the presets table

**Given** presets exist
**When** CEO clicks a preset button
**Then** the full command text is populated and submitted

### Story 1.5: Real-time Delegation Chain Display

As a CEO,
I want to see the live delegation chain as my command is processed,
So that I know exactly which agents are working on my request.

**Acceptance Criteria:**

**Given** a command is being processed
**When** the Chief of Staff delegates to a manager
**Then** the UI shows "Chief of Staff -> [Manager Name]" with elapsed time

**Given** a manager delegates to specialists
**When** specialists start working
**Then** the UI shows each specialist's name, status (working/done), and elapsed time
**And** tool invocations are shown as they happen

---

## Epic 2: Orchestration Engine

The system automatically classifies CEO commands, delegates through the agent hierarchy, executes parallel work with tools, and delivers quality-checked reports.

### Story 2.1: Chief of Staff Command Classification

As the system,
I want to automatically classify CEO commands and determine which department handles them,
So that commands are routed to the right team without manual intervention.

**Acceptance Criteria:**

**Given** a CEO command is received
**When** the OrchestratorService processes it
**Then** ChiefOfStaff.classify() makes an LLM call to determine department and task breakdown
**And** the classification result includes department, priority, and subtask list
**And** a delegation event is emitted on the WebSocket

**Given** a command contains @mention
**When** classification runs
**Then** the mentioned agent is used directly (skip classification)

### Story 2.2: Manager Task Decomposition & Parallel Delegation

As a manager agent,
I want to break down tasks and distribute to my specialist team in parallel,
So that complex work is completed faster.

**Acceptance Criteria:**

**Given** a manager receives a classified task
**When** the manager processes it via AgentRunner
**Then** the manager's LLM call produces subtask breakdown
**And** subtasks are dispatched to specialists in parallel (Promise.all)
**And** delegation events are emitted for each subtask

**Given** 4 specialists are working in parallel
**When** all complete their subtasks
**Then** all results are collected for synthesis

### Story 2.3: Specialist Autonomous Deep Work (5-Stage)

As a specialist agent,
I want to execute multi-step autonomous work with tool access,
So that I produce thorough deliverables, not one-shot responses.

**Acceptance Criteria:**

**Given** a specialist receives a subtask
**When** AgentRunner executes the agent
**Then** the system prompt includes Soul + knowledge + tool definitions
**And** the agent can make multiple tool calls during a single execution
**And** each tool call is permission-checked, logged, and result-truncated (4000 chars)
**And** cost is tracked per LLM call

### Story 2.4: Manager as 5th Analyst (CEO Idea #007)

As a manager agent,
I want to independently analyze the task before synthesizing subordinate results,
So that my own expertise enriches the final output.

**Acceptance Criteria:**

**Given** a manager has received subordinate results
**When** synthesis runs
**Then** the manager first produces its own independent analysis
**And** then synthesizes its analysis with all subordinate results
**And** the final report includes both perspectives

### Story 2.5: Quality Gate & Rework Loop

As the Chief of Staff,
I want to quality-check every report before delivering to the CEO,
So that only high-quality outputs reach the CEO.

**Acceptance Criteria:**

**Given** a synthesized report is ready
**When** ChiefOfStaff.qualityCheck() evaluates it
**Then** the report is scored on 5 criteria (conclusion, evidence, risk, format, logic)
**And** each score is 1-5

**Given** average score >= 3.5 and no individual < 2
**When** quality check completes
**Then** the report is delivered to the CEO

**Given** quality check fails
**When** rework is triggered
**Then** feedback is injected as context for the specialist
**And** the specialist re-executes with the feedback
**And** maximum 2 rework attempts before delivering with warning

### Story 2.6: Sequential Relay Mode (/sequential)

As a CEO,
I want agents to process sequentially when I use /sequential,
So that each agent builds on the previous agent's work.

**Acceptance Criteria:**

**Given** CEO issues "/sequential analyze market trends"
**When** the orchestrator processes it
**Then** agents execute one at a time, each receiving the previous agent's output
**And** the final result is the chain of all agent contributions

---

## Epic 3: Agent Organization & Soul System

Each company gets a deployed 29-agent organization with editable personalities and auto-injected knowledge.

### Story 3.1: 29-Agent Organization Deployment

As the system,
I want to automatically deploy the standard 29-agent organization when a company is created,
So that every company starts with a fully staffed AI team.

**Acceptance Criteria:**

**Given** a new company is created
**When** the company setup completes
**Then** 29 agent records are created in the agents table
**And** each agent has: name, tier (manager/specialist/worker), department, default model, default Soul markdown
**And** the hierarchy matches v1: CEO -> CoS + 3 assistants -> 6 managers -> specialists/workers

### Story 3.2: Soul Editor (Web UI Markdown)

As a CEO,
I want to edit my agents' Soul (personality, expertise, principles) via the web UI,
So that I can customize how my AI team thinks and works.

**Acceptance Criteria:**

**Given** CEO navigates to an agent's detail page
**When** they click "Edit Soul"
**Then** a markdown editor opens with the current Soul content
**And** they can edit personality, expertise, judgment principles, report format, tool list

**Given** CEO saves the updated Soul
**When** the agent next executes a task
**Then** the new Soul content is used in the system prompt (no restart needed)

### Story 3.3: Department Knowledge Injection

As the system,
I want to automatically inject relevant knowledge documents into agent prompts,
So that agents have domain-specific context for better outputs.

**Acceptance Criteria:**

**Given** knowledge documents are tagged to a department
**When** an agent in that department executes a task
**Then** relevant knowledge snippets are appended to the agent's system prompt
**And** the injection is automatic (no CEO action needed)

---

## Epic 4: Tool System

Agents invoke real external tools with permission control, logging, and health checks.

### Story 4.1: ToolPool Registry & Execution

As a specialist agent,
I want to invoke real tools (web search, stock API, etc.) during my work,
So that I produce data-backed deliverables.

**Acceptance Criteria:**

**Given** an agent's LLM response includes a tool call
**When** ToolPool.invoke() processes it
**Then** the tool's permission is checked against agent.allowedTools
**And** the tool executes with the provided parameters
**And** the result is returned to the agent (truncated to 4000 chars if needed)
**And** the invocation is logged (agent, tool, input, output, duration)

### Story 4.2: Core Tool Implementations (Finance + Common)

As the system,
I want a set of real working tools in finance and common categories,
So that agents can access stock data, search the web, and generate charts.

**Acceptance Criteria:**

**Given** the kr_stock tool is invoked with a ticker
**When** execution completes
**Then** real-time stock data is returned (price, change, volume)

**Given** the real_web_search tool is invoked with a query
**When** execution completes
**Then** relevant web search results are returned

**Given** the chart_generator tool is invoked with data
**When** execution completes
**Then** a chart image/SVG is generated

### Story 4.3: Tool Permission Management & Health Check

As an admin,
I want to configure which tools each agent can use,
So that agents only access appropriate resources.

**Acceptance Criteria:**

**Given** admin navigates to agent tool permissions
**When** they update the allowedTools list
**Then** the agent's tool access is immediately restricted/expanded

**Given** CEO issues /tool-check
**When** the health check runs
**Then** each tool is tested and returns its status (ok/error/timeout)

---

## Epic 5: LLM Multi-Provider Router

System routes LLM calls to the optimal provider with cost tracking, batch queuing, and failover.

### Story 5.1: Multi-Provider LLM Routing

As the system,
I want to route LLM calls to Claude, GPT, or Gemini based on agent configuration,
So that we use the best model for each agent's role.

**Acceptance Criteria:**

**Given** an agent has modelName "claude-sonnet-4-6"
**When** AgentRunner calls LLMRouter.call()
**Then** the request is routed to the Anthropic adapter
**And** the correct model is used
**And** token count and cost are recorded

**Given** an agent has modelName "gpt-5"
**When** the call is routed
**Then** the OpenAI adapter handles the request

### Story 5.2: Cost Tracking & Budget Enforcement

As a CEO,
I want real-time cost tracking per agent, model, and department,
So that I can manage my AI spending.

**Acceptance Criteria:**

**Given** any LLM call completes
**When** cost is calculated
**Then** a cost_record is created (agentId, companyId, model, tokens, cost, timestamp)

**Given** a company has daily budget limit $10
**When** daily spend reaches $10
**Then** new commands are blocked with "Budget exceeded" message
**And** the CEO is notified via WebSocket

### Story 5.3: Batch API Queue

As the system,
I want to queue non-urgent LLM requests for batch processing,
So that we get 50% cost discount on bulk operations.

**Acceptance Criteria:**

**Given** a non-urgent request is queued
**When** CEO issues /batch-run
**Then** all queued requests are submitted as a batch to the LLM provider

**Given** CEO issues /batch-status
**When** the query runs
**Then** the current batch queue size and status are returned

### Story 5.4: LLM Provider Failover

As the system,
I want automatic failover to an alternative provider when the primary fails,
So that agent work continues uninterrupted.

**Acceptance Criteria:**

**Given** Anthropic API returns an error or times out
**When** failover triggers
**Then** the request is retried with a compatible OpenAI or Google model
**And** failover completes within 5 seconds (NFR16)

---

## Epic 6: Quality Gate

Chief of Staff evaluates all reports with a 5-item rubric, triggers rework on failure, and tracks CEO satisfaction.

### Story 6.1: 5-Item Quality Rubric Evaluation

As the Chief of Staff,
I want to evaluate every report on 5 quality criteria,
So that only high-quality work reaches the CEO.

**Acceptance Criteria:**

**Given** a report is submitted for quality check
**When** QualityGate evaluates it via LLM call
**Then** scores are returned for: conclusion (1-5), evidence (1-5), risk (1-5), format (1-5), logic (1-5)
**And** the result is stored in quality_reviews table

### Story 6.2: Auto-Rework & CEO Feedback

As a CEO,
I want reports to be automatically improved when they fail QA, and I can rate the final output,
So that quality improves over time.

**Acceptance Criteria:**

**Given** a report fails QA (avg < 3.5 or any individual < 2)
**When** rework triggers
**Then** the specialist re-executes with QA feedback injected
**And** max 2 rework attempts before delivering with warning flag

**Given** a report is delivered
**When** CEO clicks thumbs up/down
**Then** the feedback is recorded against the command/report

---

## Epic 7: Dashboard & Monitoring

CEO views real-time operational metrics, budget status, and quick actions on the home dashboard.

### Story 7.1: Summary Cards & Quick Actions

As a CEO,
I want to see key metrics at a glance on my dashboard,
So that I know the current state of my AI organization.

**Acceptance Criteria:**

**Given** CEO opens the dashboard
**When** the page loads
**Then** 4 summary cards show: today's tasks (total/done/in-progress), today's cost ($), agent count, integration status

**Given** CEO clicks a quick action (e.g., "Morning Briefing")
**When** the action executes
**Then** the corresponding command is submitted to the Command Center

### Story 7.2: AI Usage Charts & Budget Management

As a CEO,
I want to see AI usage breakdowns and manage budgets,
So that I can optimize spending.

**Acceptance Criteria:**

**Given** CEO navigates to budget section
**When** the data loads
**Then** provider usage chart shows calls by Anthropic/OpenAI/Google
**And** budget progress bars show daily/monthly spend vs limits (green->yellow->red)

**Given** CEO sets a daily budget limit
**When** the limit is saved
**Then** the system enforces it on subsequent commands

---

## Epic 8: Activity Logging & History

CEO views detailed logs of all AI activity and can search, compare, and replay past commands.

### Story 8.1: 4-Tab Activity Log

As a CEO,
I want to view all AI activity organized by type,
So that I can audit what my AI team is doing.

**Acceptance Criteria:**

**Given** CEO opens the Activity Log page
**When** they switch between tabs
**Then** Activity tab shows agent actions chronologically
**And** Communications tab shows delegation records (from->to, message, cost, tokens)
**And** QA tab shows quality review results
**And** Tools tab shows tool invocation records

### Story 8.2: Command History with Search & Replay

As a CEO,
I want to search my command history and replay past commands,
So that I can reuse successful workflows.

**Acceptance Criteria:**

**Given** CEO opens Operation Journal
**When** they search by text, date, or status
**Then** matching commands are displayed with results preview

**Given** CEO selects two commands
**When** they click "Compare"
**Then** results are shown side-by-side (A/B comparison)

**Given** CEO clicks "Replay" on a historical command
**When** the replay executes
**Then** the same command is re-submitted to the current AI organization

---

## Epic 9: Knowledge Base & Agent Memory

RAG document store with department auto-injection, plus auto-learning from completed tasks.

### Story 9.1: Knowledge Base CRUD & Department Injection

As an admin,
I want to manage a knowledge base with folder structure,
So that agents automatically have relevant context.

**Acceptance Criteria:**

**Given** admin uploads a document to the "Investment Analysis" folder
**When** the CIO team agents next execute a task
**Then** relevant snippets from that document are injected into their system prompts

**Given** CEO drags a file to the knowledge base
**When** the upload completes
**Then** the document is stored with metadata (title, department, upload date)

### Story 9.2: Auto-Learning from Tasks

As the system,
I want to automatically extract key learnings from completed tasks,
So that agents improve over time.

**Acceptance Criteria:**

**Given** a task completes successfully
**When** post-task analysis runs
**Then** key learning points are extracted and stored in agent_memories table

**Given** a similar task is assigned later
**When** the agent's prompt is assembled
**Then** relevant past learnings are included in context

---

## Epic 10: Cron Scheduler

CEO creates time-based and trigger-based automated commands.

### Story 10.1: Cron Job Management

As a CEO,
I want to schedule recurring commands with cron expressions,
So that routine tasks run automatically.

**Acceptance Criteria:**

**Given** CEO creates a cron job "Market briefing every weekday 9AM"
**When** the schedule triggers
**Then** the command is automatically submitted to the orchestration engine
**And** results are delivered to the CEO

**Given** CEO toggles a cron job off
**When** the next scheduled time arrives
**Then** the job does not execute

**Given** a cron job has executed
**When** CEO views the schedule page
**Then** last_run and next_run timestamps are displayed

---

## Epic 11: AGORA Debate Engine

6 department heads conduct structured multi-round debates with real-time streaming.

### Story 11.1: Round-Based Debate Orchestration

As a CEO,
I want to trigger debates among my department heads,
So that I get diverse perspectives on important decisions.

**Acceptance Criteria:**

**Given** CEO issues "/debate AI investment strategy"
**When** the AGORA engine starts
**Then** 6 department managers are assembled as debate participants
**And** 2 debate rounds execute (3 for /deep-debate)
**And** each round: all managers produce position statements via LLM calls

**Given** a debate is in progress
**When** a manager completes their statement
**Then** the statement is streamed to the CEO via SSE in real-time

### Story 11.2: Debate Results — Diff View & Synthesis

As a CEO,
I want to see debate results with position differences highlighted,
So that I can quickly understand areas of agreement and disagreement.

**Acceptance Criteria:**

**Given** a debate completes
**When** results are presented
**Then** a diff view highlights position differences between managers
**And** a final synthesis summarizes consensus and dissensus points

---

## Epic 12: Strategy Room (Trading)

CEO views portfolio, manages watchlist, and runs automated/paper trading.

### Story 12.1: Portfolio Dashboard & Watchlist

As a CEO,
I want to see my investment portfolio and watchlist in real-time,
So that I can monitor my financial positions.

**Acceptance Criteria:**

**Given** CEO opens Strategy Room
**When** the Portfolio tab loads
**Then** cash balance, holdings, returns, and total assets are displayed

**Given** CEO has watchlist items
**When** the Watchlist tab is active
**Then** stock prices auto-refresh every 60 seconds
**And** items can be reordered by drag-and-drop
**And** market filter (KR/US) is available

### Story 12.2: KIS Auto-Trading

As the system,
I want to execute trades via KIS Securities API based on CIO analysis,
So that the CEO's investment strategy executes automatically.

**Acceptance Criteria:**

**Given** CIO agent produces an analysis with confidence score
**When** the analysis triggers a trade decision
**Then** position size is calculated from confidence (CEO Idea #003)
**And** the trade is executed via KIS API (Korean or US market)

**Given** CEO selects investment style (Conservative/Balanced/Aggressive)
**When** the style changes
**Then** CIO's confidence-to-allocation mapping adjusts accordingly

### Story 12.3: Paper Trading

As a CEO,
I want to run simulated trades with real market data,
So that I can test strategies without risking real money.

**Acceptance Criteria:**

**Given** CEO enables paper trading mode with $10,000 initial capital
**When** trades execute
**Then** they use real market data but virtual portfolio
**And** P&L tracks accurately against real prices

---

## Epic 13: SNS Publishing

Multi-platform content creation, approval workflow, and automated publishing.

### Story 13.1: Content Generation & Approval Flow

As a CEO,
I want my CMO team to generate content for 5 platforms with my approval before publishing,
So that I maintain quality control over public communications.

**Acceptance Criteria:**

**Given** CEO requests content creation via Command Center
**When** CMO team generates content
**Then** content appears in SNS page with "Pending Approval" status
**And** CEO can preview, approve, or reject each piece

**Given** CEO approves content
**When** the scheduled publish time arrives
**Then** the content is published to the target platform

### Story 13.2: Selenium Auto-Publishing

As the system,
I want to automatically publish approved content via Selenium,
So that platforms without API access are still supported.

**Acceptance Criteria:**

**Given** approved content is scheduled for Instagram
**When** the publish time arrives
**Then** Selenium automation logs into the platform and posts the content
**And** success/failure status is recorded and visible in SNS page

---

## Epic 14: SketchVibe (Visual Collaboration)

Canvas-based diagram editing with AI real-time collaboration.

### Story 14.1: Cytoscape Canvas & Node Types

As a CEO,
I want to draw diagrams on a canvas with different node types,
So that I can visually design systems and workflows.

**Acceptance Criteria:**

**Given** CEO opens the NEXUS page
**When** the canvas loads
**Then** 8 node types are available: agent, system, api, decide, db, start, end, note
**And** each type has distinct visual style (color, shape)
**And** nodes can be dragged, double-click renamed, Delete removed

### Story 14.2: Mermaid Bidirectional & AI Collaboration

As a CEO,
I want AI to read my canvas and modify it in real-time,
So that we can collaborate visually on designs.

**Acceptance Criteria:**

**Given** CEO has nodes on the canvas
**When** AI calls read_canvas() via MCP
**Then** the current canvas state is returned as Mermaid code

**Given** AI generates Mermaid diagram code
**When** the code is processed
**Then** the canvas auto-renders the diagram with proper node types and connections

**Given** AI sends MCP SSE events to modify the canvas
**When** the events are received
**Then** nodes are added/modified in real-time on the CEO's canvas

---

## Epic 15: ARGOS Intelligence Collection

Automated data collection based on configurable triggers.

### Story 15.1: Trigger-Based Intelligence Collection

As a CEO,
I want automatic data collection when conditions are met,
So that I'm always informed about relevant developments.

**Acceptance Criteria:**

**Given** CEO configures a trigger (e.g., "Samsung stock drops 5%")
**When** the condition is met based on monitored data
**Then** ARGOS automatically collects relevant news and data
**And** results are delivered to the CEO

**Given** CEO views ARGOS status bar
**When** the page loads
**Then** data OK status, AI OK status, trigger count, and today's cost are displayed

---

## Epic 16: Telegram & Messenger

Mobile AI commands via Telegram, team communication via in-app messenger.

### Story 16.1: Telegram Bot Integration

As a CEO,
I want to command my AI organization from Telegram,
So that I can work from my phone.

**Acceptance Criteria:**

**Given** CEO sends a message to the Telegram bot
**When** the bot receives it
**Then** the command is processed by the orchestration engine
**And** the report is sent back via Telegram

**Given** CEO sends "@CIO analyze Samsung" via Telegram
**When** the message is parsed
**Then** the @mention routes directly to CIO

### Story 16.2: In-Company Messenger

As a team member,
I want to chat with colleagues in my company,
So that we can collaborate alongside the AI team.

**Acceptance Criteria:**

**Given** two users are in the same company
**When** one sends a message in the messenger
**Then** the other receives it in real-time via WebSocket

---

## Epic 17: Performance Analysis & Archive

Agent performance metrics, quality dashboards, and classified report storage.

### Story 17.1: Performance Dashboard & Soul Gym

As a CEO,
I want to see how my agents perform and get improvement suggestions,
So that I can optimize my AI organization.

**Acceptance Criteria:**

**Given** CEO opens Performance page
**When** Soul Gym tab loads
**Then** per-agent improvement suggestions, trust scores, and token estimates are shown

**Given** CEO views Quality Dashboard
**When** data loads
**Then** total reviews, pass rate, average score, and failure list are displayed

**Given** CEO views Agent Metrics
**When** they select an agent
**Then** invocation count, success rate, average cost, and average time are shown

### Story 17.2: Classified Archive & Similar Reports

As a CEO,
I want to store important reports and find related ones,
So that I can build institutional knowledge.

**Acceptance Criteria:**

**Given** CEO saves a report to the archive
**When** the report is stored
**Then** it can be filtered by department and security grade

**Given** CEO views an archived report
**When** they click "Find Similar"
**Then** related reports are shown based on content correlation

---

## Epic 18: Workflow Automation

CEO creates reusable multi-step automated workflows.

### Story 18.1: Multi-Step Workflow Creation & Execution

As a CEO,
I want to define multi-step workflows that chain agent tasks,
So that complex recurring processes run automatically.

**Acceptance Criteria:**

**Given** CEO creates a workflow with steps: "Collect data" -> "Analyze" -> "Generate report"
**When** the workflow is triggered
**Then** each step executes in sequence via the orchestration engine
**And** workflow state tracks currentStep, done status, and errors

**Given** a step fails
**When** error handling runs
**Then** the workflow pauses with error status visible to CEO
**And** CEO can retry or skip the failed step
