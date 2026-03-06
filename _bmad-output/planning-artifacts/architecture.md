---
stepsCompleted: [step-01-init, step-02-context, step-03-starter, step-04-decisions, step-05-patterns, step-06-structure, step-07-validation, step-08-complete]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-corthex-v2-2026-03-06.md
  - _bmad-output/planning-artifacts/v1-feature-spec.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'architecture'
project_name: 'corthex-v2'
user_name: 'ubuntu'
date: '2026-03-06'
---

# Architecture Decision Document

_CORTHEX v2 - AI Agent Orchestration Platform_

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
88 FRs organized into 16 capability areas: Command & Control, AI Orchestration, Agent Organization, Tool System, LLM Provider Management, Quality & Review, Collective Intelligence (AGORA), Strategy Room, Content Publishing (SNS), SketchVibe, Dashboard & Monitoring, Activity Logging, Knowledge & Memory, Scheduling & Automation, Intelligence Collection (ARGOS), External Communication, Performance Analysis, Report Management, Workflow Automation, Multi-tenancy & Admin.

The core architectural challenge is the **orchestration engine**: CEO command -> Chief of Staff auto-classify -> Manager delegation -> parallel Specialist execution (with real tool calls) -> quality gate -> report synthesis. This is NOT a request-response CRUD system - it's an asynchronous multi-step workflow engine with real LLM calls, tool invocations, and inter-agent communication.

**Non-Functional Requirements:**
- Performance: Simple commands < 30s, complex < 3min, WebSocket < 100ms
- Security: AES-256-GCM credential vault, companyId tenant isolation, JWT auth
- Scalability: 10+ companies, 50+ concurrent users, 10+ parallel agent executions
- Reliability: 24-hour uptime, LLM failover, WebSocket auto-reconnect

**Scale & Complexity:**
- Primary domain: Full-stack web (SaaS B2B)
- Complexity level: High
- Estimated architectural components: ~40 server modules + ~60 frontend components + ~20 shared types

### Technical Constraints & Dependencies

- **Existing codebase**: Turborepo monorepo already set up with 5 packages
- **Runtime**: Bun (not Node.js) - affects test runner, bundler, and dependency resolution
- **Database**: PostgreSQL via Neon serverless + Drizzle ORM (already configured)
- **LLM Dependencies**: Anthropic SDK, OpenAI SDK, Google Generative AI SDK
- **Real-time**: Hono built-in WebSocket (not Socket.io)
- **Financial API**: KIS Securities API (Korean broker, REST-based)

### Cross-Cutting Concerns

1. **Tenant Isolation**: Every DB query, WebSocket channel, and API endpoint must filter by companyId
2. **Cost Tracking**: Every LLM call must record tokens + cost, aggregated per agent/model/department
3. **Audit Logging**: All agent actions, tool calls, and delegations must be logged
4. **Real-time Updates**: Agent status, delegation chain, and cost changes must push to client via WebSocket
5. **Error Recovery**: LLM failures, tool failures, and timeout must not crash the orchestration pipeline

---

## Starter Template Evaluation

### Primary Technology Domain

Full-stack TypeScript monorepo (Turborepo) - already established.

### Selected Starter: Existing Codebase (Brownfield)

**Rationale:** The project already has a working monorepo structure with all foundational packages configured. No starter template needed.

**Existing Foundation:**

```
corthex-v2/
  packages/
    server/    - Hono + Bun backend
    app/       - React + Vite SPA (user app)
    admin/     - React + Vite SPA (admin console)
    ui/        - Shared component library (CVA-based)
    shared/    - Shared TypeScript types
```

**Architectural Decisions Already Made:**

| Decision | Choice | Version |
|---|---|---|
| **Language & Runtime** | TypeScript + Bun | Bun 1.3.10 |
| **Monorepo Tool** | Turborepo | v2 |
| **Server Framework** | Hono | v4 |
| **Frontend Framework** | React | v19 |
| **Build Tool** | Vite | v6 |
| **Styling** | Tailwind CSS | v4 |
| **State (Client)** | Zustand | v5 |
| **State (Server)** | TanStack Query | v5 |
| **Routing** | React Router DOM | v7 |
| **ORM** | Drizzle ORM | v0.39 |
| **Database** | PostgreSQL (Neon serverless) | - |
| **Testing** | bun:test (unit), Vitest (frontend) | - |
| **Cron** | croner | v10 |
| **Canvas** | @xyflow/react + @dagrejs/dagre | - |
| **Component Library** | @corthex/ui (CVA-based) | - |

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. Orchestration Engine Architecture
2. Agent Execution Model
3. LLM Provider Router Design
4. Tool System Architecture
5. Real-time Communication Protocol

**Important Decisions (Shape Architecture):**
6. Quality Gate Pipeline
7. Cost Tracking System
8. Knowledge Injection Strategy
9. Credential Vault Design

**Deferred Decisions (Post-MVP):**
10. Horizontal scaling strategy
11. Agent marketplace architecture
12. Cross-company agent collaboration

### 1. Orchestration Engine

**Decision:** Event-driven pipeline with typed TaskRequest/TaskResponse messages

**Architecture:**
```
CommandCenter (UI)
  -> POST /api/commands {text, type, target}
    -> CommandRouter (classify command type)
      -> OrchestratorService.process(command)
        -> ChiefOfStaff.classify(command)  // LLM call
          -> Returns: {department, priority, taskBreakdown}
        -> Manager.delegate(task)  // LLM call
          -> Returns: {subtasks: SubTask[]}
        -> Parallel: Specialist.execute(subtask)[]  // LLM calls + tools
          -> Each returns: {result, toolsUsed, cost}
        -> Manager.synthesize(results)  // LLM call
        -> ChiefOfStaff.qualityCheck(report)  // LLM call
          -> Pass: deliver to CEO
          -> Fail: rework loop (max 2 retries)
        -> WebSocket: push status at each step
```

**Key Design:**
- Each step is an async function that makes LLM calls
- Steps communicate via typed TaskRequest/TaskResponse objects
- WebSocket emits status events at each step transition
- Timeout per step (configurable, default 60s per LLM call)
- Failure at any step -> graceful degradation with partial results

### 2. Agent Execution Model

**Decision:** Agent = config (Soul) + runtime (AgentRunner)

**Agent Definition (DB + Soul file):**
```typescript
interface Agent {
  id: string;
  companyId: string;
  name: string;          // e.g. "CIO"
  tier: 'manager' | 'specialist' | 'worker';
  departmentId: string;
  modelName: string;     // e.g. "claude-sonnet-4-6"
  soulMarkdown: string;  // Personality, expertise, principles
  allowedTools: string[];
  isActive: boolean;
}
```

**AgentRunner (stateless execution):**
```typescript
class AgentRunner {
  async execute(agent: Agent, task: TaskRequest): Promise<TaskResponse> {
    const systemPrompt = buildSystemPrompt(agent);  // soul + knowledge + tools
    const llmResponse = await llmRouter.call({
      model: agent.modelName,
      system: systemPrompt,
      messages: task.messages,
      tools: getToolDefinitions(agent.allowedTools),
    });
    // Process tool calls, track cost, return result
  }
}
```

**3-Tier Hierarchy:**
- **Manager**: Can delegate to specialists, synthesize results, also independently analyzes (5th analyst)
- **Specialist**: Executes tasks with tools, produces deliverables
- **Worker**: Simple tasks (summarize, schedule), lowest-cost model

### 3. LLM Provider Router

**Decision:** Strategy pattern with provider-specific adapters

```typescript
interface LLMProvider {
  call(request: LLMRequest): Promise<LLMResponse>;
  supportsBatch: boolean;
  estimateCost(tokens: TokenCount): number;
}

class LLMRouter {
  providers: Map<string, LLMProvider>;  // anthropic, openai, google

  async call(request: LLMRequest): Promise<LLMResponse> {
    const provider = this.resolveProvider(request.model);
    const response = await provider.call(request);
    await this.trackCost(request, response);  // Always track
    return response;
  }
}
```

**Model Mapping:**
| Model ID | Provider | Use Case |
|---|---|---|
| claude-opus-4-6 | Anthropic | Complex analysis (rare) |
| claude-sonnet-4-6 | Anthropic | Manager agents (default) |
| claude-haiku-4-5 | Anthropic | Specialist/Worker (cost-efficient) |
| gpt-5 | OpenAI | Alternative for specific tasks |
| gpt-5-mini | OpenAI | Alternative specialist |
| gemini-3.1-pro | Google | Alternative manager |
| gemini-2.5-flash | Google | Alternative worker |

**Batch API:**
- BatchCollector accumulates non-urgent requests
- CEO triggers flush via /batch-run or auto-flush at threshold
- 50% cost discount for batch requests

### 4. Tool System

**Decision:** ToolPool registry with permission-checked execution

```typescript
interface Tool {
  name: string;
  description: string;
  category: string;  // finance, legal, marketing, tech, common
  parameters: ZodSchema;
  execute(params: unknown, context: ToolContext): Promise<ToolResult>;
}

class ToolPool {
  tools: Map<string, Tool>;

  async invoke(agentId: string, toolName: string, params: unknown): Promise<ToolResult> {
    // 1. Permission check: agent.allowedTools includes toolName?
    // 2. Execute tool
    // 3. Truncate result if > 4000 chars (with summarization)
    // 4. Log invocation (agent, tool, input, output, duration, cost)
    // 5. Return result
  }
}
```

**Tool Categories (125+):**
- **Finance**: kr_stock, dart_api, sec_edgar, backtest_engine, kis_trading
- **Legal**: law_search, contract_reviewer, trademark_similarity
- **Marketing**: sns_manager, seo_analyzer, hashtag_recommender
- **Tech**: uptime_monitor, security_scanner, code_quality
- **Common**: real_web_search, spreadsheet_tool, chart_generator, email_sender

### 5. Real-time Communication

**Decision:** WebSocket with 7-channel multiplexing via EventBus

**Channels:**
| Channel | Events | Purpose |
|---|---|---|
| `agent-status` | agent-started, agent-completed, agent-error | Agent lifecycle |
| `delegation` | task-delegated, task-accepted, task-completed | Delegation chain |
| `command` | command-received, command-processing, command-done | Command lifecycle |
| `cost` | cost-updated, budget-warning, budget-exceeded | Cost tracking |
| `tool` | tool-invoked, tool-completed, tool-failed | Tool execution |
| `debate` | round-started, agent-spoke, round-ended, debate-done | AGORA |
| `nexus` | node-added, node-updated, canvas-changed | SketchVibe |

**Server-side EventBus:**
```typescript
class EventBus {
  emit(channel: string, event: string, data: unknown, companyId: string): void;
  // Only sends to WebSocket connections matching companyId (tenant isolation)
}
```

### 6. Quality Gate Pipeline

**Decision:** 5-item rubric evaluation via Chief of Staff LLM call

```typescript
interface QualityCheckResult {
  conclusion: 'pass' | 'fail';
  scores: {
    conclusionQuality: number;   // 1-5
    evidenceSources: number;     // 1-5
    riskAssessment: number;      // 1-5
    formatCompliance: number;    // 1-5
    logicalCoherence: number;    // 1-5
  };
  feedback?: string;  // Specific rework instructions if fail
}
```

- Pass threshold: average >= 3.5 and no individual score < 2
- Fail: auto-rework with feedback injected as context (max 2 retries)
- After 2 failures: deliver with warning flag for CEO review

### 7. Cost Tracking

**Decision:** Per-call tracking with real-time aggregation

```typescript
// Every LLM call records:
interface CostRecord {
  agentId: string;
  companyId: string;
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;  // USD, calculated from models.yaml pricing
  timestamp: Date;
  taskId: string;
}
```

- models.yaml defines per-model pricing (input/output per 1M tokens)
- Budget enforcement: daily limit + monthly limit per company
- Exceeded budget -> block new commands (configurable: block vs warn)
- Dashboard: donut chart (by department), bar chart (by agent)

### Data Architecture

**Database:** PostgreSQL via Neon serverless + Drizzle ORM

**Key Tables:**
| Table | Purpose | Tenant Isolated |
|---|---|---|
| companies | Company/tenant registry | N/A (root) |
| users | App users | Yes (companyId) |
| admin_users | Admin console users | No |
| agents | Agent definitions + Soul | Yes |
| departments | Department hierarchy | Yes |
| commands | CEO command history | Yes |
| tasks | Orchestration task tracking | Yes |
| tool_invocations | Tool call audit log | Yes |
| cost_records | LLM cost tracking | Yes |
| knowledge_docs | RAG document store | Yes |
| agent_memories | Auto-learned insights | Yes |
| presets | Command presets | Yes |
| cron_jobs | Scheduled tasks | Yes |
| credentials | Encrypted API keys (AES-256-GCM) | Yes |
| quality_reviews | QA gate results | Yes |
| watchlist | Stock watchlist items | Yes |
| portfolio | Trading portfolio | Yes |
| sns_content | SNS publishing queue | Yes |
| debates | AGORA debate records | Yes |
| sketches | SketchVibe diagrams | Yes |

**Migration Strategy:** Drizzle Kit generate + migrate (already configured)

### Authentication & Security

**JWT Dual Auth:**
- `admin_users` table -> admin JWT (admin console)
- `users` table -> user JWT (app)
- Separate middleware: `adminAuth()` and `userAuth()`
- Both inject `companyId` into request context

**Credential Vault:**
- AES-256-GCM encryption for all API keys (LLM, KIS, Telegram, etc.)
- Encryption key from environment variable
- Per-company key storage in `credentials` table
- Decrypted only at point of use, never logged

### API & Communication Patterns

**REST API (Hono):**
- Pattern: `/api/{resource}` with Zod validation
- Response wrapper: `{ success: boolean, data?: T, error?: string }`
- Error codes: standard HTTP (400, 401, 403, 404, 500)
- Rate limiting: per-company, configurable

**WebSocket:**
- Single connection per user, multiplexed by channel
- Message format: `{ channel: string, event: string, data: unknown }`
- Server-to-client only for status updates (not bidirectional commands)
- Auto-reconnect on client with exponential backoff

### Frontend Architecture

**State Management:**
- Zustand stores for client-side state (UI state, websocket connection, current user)
- TanStack Query for server state (API data, caching, invalidation)
- WebSocket events trigger TanStack Query invalidation for real-time updates

**Component Architecture:**
- @corthex/ui: Shared presentational components (CVA variants)
- packages/app: Feature-specific components and pages
- packages/admin: Admin-specific components and pages

**Routing:**
- React Router DOM v7
- App routes: `/command-center`, `/dashboard`, `/strategy`, `/nexus`, `/agents`, etc.
- Admin routes: `/companies`, `/users`, `/agents`, `/settings`

### Infrastructure & Deployment

**Hosting:** Cloud-based (configured via GitHub Actions)
**CI/CD:** GitHub Actions -> build -> deploy -> Cloudflare cache purge
**Environment:** `.env` files, environment-specific configs
**Monitoring:** Structured logging, error tracking
**Scaling:** Vertical first (Bun is performant), horizontal later if needed

---

## Implementation Patterns & Consistency Rules

### Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Files | kebab-case | `agent-runner.ts`, `cost-tracker.ts` |
| DB Tables | snake_case | `agent_memories`, `cost_records` |
| DB Columns | snake_case | `company_id`, `created_at` |
| API Endpoints | kebab-case | `/api/agent-status`, `/api/tool-invocations` |
| TypeScript Types | PascalCase | `AgentRunner`, `TaskRequest` |
| Functions | camelCase | `processCommand`, `trackCost` |
| Constants | UPPER_SNAKE | `MAX_TOOL_RESULT_LENGTH`, `DEFAULT_TIMEOUT` |
| Zustand Stores | use{Name}Store | `useCommandStore`, `useAgentStore` |
| React Components | PascalCase | `CommandCenter`, `AgentCard` |

### API Response Format

```typescript
// Success
{ success: true, data: T }

// Error
{ success: true, error: string }

// Paginated
{ success: true, data: T[], pagination: { page, limit, total } }
```

### Error Handling Pattern

```typescript
// Server: Hono error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ success: false, error: err.message }, 500);
});

// Orchestration: Graceful degradation
try {
  const result = await specialist.execute(task);
} catch (err) {
  // Log error, continue with partial results
  eventBus.emit('agent-status', 'agent-error', { agentId, error: err.message });
}
```

### Test Organization

```
packages/server/src/__tests__/
  unit/           # Unit tests (bun:test)
    services/     # Service logic tests
    utils/        # Utility function tests
  api/            # API integration tests

packages/app/src/__tests__/
  components/     # Component tests (vitest + testing-library)
  hooks/          # Custom hook tests
```

### Import Conventions

- Use `@corthex/shared` for shared types
- Use `@corthex/ui` for shared components
- Server imports use relative paths within package
- Import paths must match `git ls-files` casing exactly (Linux CI)

---

## Project Structure & Boundaries

```
corthex-v2/
├── packages/
│   ├── server/
│   │   └── src/
│   │       ├── index.ts                    # Hono app entry
│   │       ├── types.ts                    # Server-specific types
│   │       ├── db/
│   │       │   ├── schema.ts               # Drizzle schema (all tables)
│   │       │   └── migrations/             # Drizzle migrations
│   │       ├── middleware/
│   │       │   ├── auth.ts                 # JWT auth (admin + user)
│   │       │   ├── tenant.ts               # companyId injection
│   │       │   └── rate-limit.ts           # Per-company rate limiting
│   │       ├── routes/
│   │       │   ├── commands.ts             # Command Center API
│   │       │   ├── agents.ts               # Agent CRUD + Soul editing
│   │       │   ├── tools.ts                # Tool management
│   │       │   ├── cost.ts                 # Cost tracking API
│   │       │   ├── knowledge.ts            # Knowledge base API
│   │       │   ├── strategy.ts             # Trading/portfolio API
│   │       │   ├── sns.ts                  # SNS publishing API
│   │       │   ├── cron.ts                 # Cron scheduler API
│   │       │   ├── debates.ts              # AGORA API
│   │       │   ├── sketches.ts             # SketchVibe API
│   │       │   ├── auth.ts                 # Auth endpoints
│   │       │   ├── admin/                  # Admin-only routes
│   │       │   │   ├── companies.ts
│   │       │   │   ├── users.ts
│   │       │   │   └── credentials.ts
│   │       │   └── telegram.ts             # Telegram webhook
│   │       ├── services/
│   │       │   ├── orchestrator.ts         # Main orchestration engine
│   │       │   ├── chief-of-staff.ts       # Command classification + QA
│   │       │   ├── agent-runner.ts         # Agent LLM execution
│   │       │   ├── llm-router.ts           # Multi-provider LLM routing
│   │       │   ├── tool-pool.ts            # Tool registry + execution
│   │       │   ├── batch-collector.ts      # Batch API queue
│   │       │   ├── cost-tracker.ts         # Cost recording + budgets
│   │       │   ├── quality-gate.ts         # QA rubric evaluation
│   │       │   ├── agora-engine.ts         # Debate orchestration
│   │       │   ├── agent-memory.ts         # Auto-learning extraction
│   │       │   ├── knowledge-injector.ts   # Department knowledge injection
│   │       │   ├── credential-vault.ts     # AES-256-GCM encrypt/decrypt
│   │       │   ├── cron-scheduler.ts       # Cron job execution
│   │       │   └── argos-collector.ts      # Intelligence collection
│   │       ├── tools/                      # Tool implementations
│   │       │   ├── finance/                # kr_stock, dart_api, kis_trading...
│   │       │   ├── legal/                  # law_search, contract_reviewer...
│   │       │   ├── marketing/              # sns_manager, seo_analyzer...
│   │       │   ├── tech/                   # uptime_monitor, security_scanner...
│   │       │   └── common/                 # web_search, chart_generator...
│   │       ├── ws/
│   │       │   ├── handler.ts              # WebSocket connection handler
│   │       │   └── event-bus.ts            # EventBus (7-channel multiplexing)
│   │       ├── lib/
│   │       │   ├── llm/                    # LLM provider adapters
│   │       │   │   ├── anthropic.ts
│   │       │   │   ├── openai.ts
│   │       │   │   └── google.ts
│   │       │   └── crypto.ts              # AES-256-GCM utilities
│   │       └── utils/
│   │           ├── token-counter.ts        # Token counting
│   │           └── prompt-builder.ts       # System prompt assembly
│   │
│   ├── app/                                # User-facing SPA
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── command-center/         # Main command interface
│   │       │   ├── dashboard/              # Home dashboard
│   │       │   ├── strategy/               # Trading room
│   │       │   ├── nexus/                  # SketchVibe canvas
│   │       │   ├── agents/                 # Agent management + Soul editor
│   │       │   ├── activity/               # Communication log (4 tabs)
│   │       │   ├── history/                # Operation journal
│   │       │   ├── archive/                # Classified documents
│   │       │   ├── performance/            # Performance analysis
│   │       │   ├── knowledge/              # Knowledge base
│   │       │   ├── schedule/               # Cron scheduler
│   │       │   ├── sns/                    # SNS publishing
│   │       │   ├── argos/                  # Intelligence collection
│   │       │   └── workflow/               # Workflow automation
│   │       ├── components/
│   │       │   ├── command/                # Command input, presets, mentions
│   │       │   ├── agent/                  # Agent cards, status indicators
│   │       │   ├── report/                 # Report viewer, feedback
│   │       │   └── layout/                 # App shell, sidebar, header
│   │       ├── stores/
│   │       │   ├── command-store.ts        # Command state
│   │       │   ├── agent-store.ts          # Agent state
│   │       │   ├── ws-store.ts             # WebSocket connection
│   │       │   └── auth-store.ts           # Auth state
│   │       ├── hooks/
│   │       │   ├── use-command.ts
│   │       │   ├── use-agents.ts
│   │       │   └── use-websocket.ts
│   │       └── lib/
│   │           └── api.ts                  # API client (TanStack Query)
│   │
│   ├── admin/                              # Admin console SPA
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── companies/
│   │       │   ├── users/
│   │       │   ├── agents/
│   │       │   ├── credentials/
│   │       │   └── settings/
│   │       └── ...
│   │
│   ├── ui/                                 # Shared component library
│   │   └── src/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── modal.tsx
│   │       ├── table.tsx
│   │       └── ...
│   │
│   └── shared/                             # Shared types
│       └── src/
│           ├── types/
│           │   ├── agent.ts
│           │   ├── command.ts
│           │   ├── task.ts
│           │   ├── tool.ts
│           │   ├── cost.ts
│           │   └── ws-events.ts
│           └── index.ts
```

### Component Boundaries

| Component | Responsibility | Depends On |
|---|---|---|
| OrchestratorService | Command lifecycle management | ChiefOfStaff, AgentRunner, EventBus |
| ChiefOfStaff | Classify commands, quality check reports | LLMRouter |
| AgentRunner | Execute agent tasks via LLM | LLMRouter, ToolPool, KnowledgeInjector |
| LLMRouter | Route to correct LLM provider | Provider adapters, CostTracker |
| ToolPool | Tool registry, permission check, execution | Individual tool implementations |
| EventBus | WebSocket event multiplexing | WebSocket handler |
| CostTracker | Record and aggregate costs | DB (cost_records) |
| QualityGate | Evaluate reports against rubric | LLMRouter (for LLM-based QA) |
| CredentialVault | Encrypt/decrypt API keys | Crypto utilities |

### Data Flow: Command Execution

```
1. Client POST /api/commands {text: "Analyze Samsung"}
2. CommandRouter -> OrchestratorService.process()
3. EventBus.emit('command', 'command-processing', {commandId})
4. ChiefOfStaff.classify() -> {department: 'investment', tasks: [...]}
5. EventBus.emit('delegation', 'task-delegated', {from: 'CoS', to: 'CIO'})
6. AgentRunner.execute(CIO, classificationResult)
   -> CIO breaks into subtasks
   -> EventBus.emit('delegation', 'task-delegated', {from: 'CIO', to: 'analyst1'})
7. Parallel: AgentRunner.execute(analyst1..4, subtasks)
   -> Each analyst calls tools via ToolPool
   -> EventBus.emit('tool', 'tool-invoked', {...})
   -> CostTracker.record() for each LLM call
8. CIO.synthesize(analystResults) + CIO's own analysis (#007)
9. ChiefOfStaff.qualityCheck(report) via QualityGate
   -> Pass: deliver report
   -> Fail: rework with feedback (max 2 retries)
10. EventBus.emit('command', 'command-done', {commandId, report})
11. WebSocket pushes report to client
```

---

## Architecture Validation

### Coherence Check

| Check | Status | Notes |
|---|---|---|
| Technology compatibility | PASS | Bun + Hono + Drizzle + React all TypeScript, compatible |
| Pattern consistency | PASS | All naming conventions consistent across packages |
| Structure alignment | PASS | Monorepo boundaries match responsibility areas |
| Real-time coverage | PASS | EventBus + WebSocket covers all real-time needs |
| Tenant isolation | PASS | companyId enforced at middleware + query level |

### Requirements Coverage

| FR Category | Architectural Support |
|---|---|
| Command & Control | CommandRouter + OrchestratorService + WebSocket |
| AI Orchestration | OrchestratorService + ChiefOfStaff + AgentRunner |
| Agent Organization | DB agents table + AgentRunner + Soul markdown |
| Tool System | ToolPool + tool implementations + permission check |
| LLM Provider | LLMRouter + provider adapters + BatchCollector |
| Quality & Review | QualityGate + ChiefOfStaff |
| AGORA | AgoraEngine + EventBus (debate channel) |
| Strategy Room | Strategy routes + KIS trading tools |
| SNS Publishing | SNS routes + Selenium tool |
| SketchVibe | Sketches routes + MCP SSE + EventBus (nexus channel) |
| Dashboard | Dashboard routes + CostTracker aggregation |
| Activity Logging | DB logging tables + Activity routes |
| Knowledge & Memory | KnowledgeInjector + AgentMemory + DB |
| Scheduling | CronScheduler + croner library |
| ARGOS | ArgosCollector + trigger evaluation |
| Telegram | Telegram route + webhook handler |
| Multi-tenancy | Tenant middleware + companyId in all queries |

### Gap Analysis

No architectural gaps identified. All 88 FRs have clear architectural support. The orchestration engine (FR7-FR13) is the most complex component and has been given detailed design attention with the pipeline architecture, event-driven status updates, and graceful degradation patterns.

### Risk Assessment

| Risk | Mitigation |
|---|---|
| LLM call latency compounds in delegation chain | Parallel execution at specialist level, timeout per step |
| Tool failures during orchestration | Graceful degradation, continue with available results |
| Cost overrun from runaway agents | Per-call tracking, budget enforcement, auto-stop |
| WebSocket connection drops | Client auto-reconnect, server-side event replay |
| Tenant data leakage | companyId middleware enforcement, DB-level RLS |
