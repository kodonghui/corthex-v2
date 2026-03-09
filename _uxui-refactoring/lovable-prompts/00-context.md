# 00. Product Context — CORTHEX HQ v2

> **이 문서를 Lovable 대화 시작 시 한 번만 전달하세요.**
> 이후 각 페이지 프롬프트(01~42)를 보낼 때는 이 문서를 다시 보낼 필요 없습니다.

---

## 복사할 프롬프트:

You are designing the UI for **CORTHEX HQ v2** — an AI-powered virtual company headquarters where a human CEO manages an entire organization of AI agents that perform real work.

---

### What CORTHEX HQ Is

CORTHEX HQ is a **B2B SaaS platform** where each customer company gets a virtual AI organization. The CEO (human user) gives commands in natural language, and AI agents — organized into departments with managers, specialists, and workers — execute those commands autonomously.

Think of it as: **"What if your entire company staff were AI agents you could talk to, assign tasks to, and watch work in real-time?"**

This is NOT a chatbot. This is a full virtual company with:
- A dynamic org chart (departments, teams, reporting lines)
- AI employees that have personalities ("souls"), tools, and assigned roles
- An orchestration engine that routes commands to the right agents
- Real business tools: stock trading, SNS publishing, debate forums, document management
- Cost tracking per agent/model/department
- Quality gates that review agent output before delivery

---

### Two Separate Apps (Same Product)

**CEO App** (main user-facing app — `app.corthex-hq.com`)
- Used by: CEO (human user) and employees with workspace access
- Purpose: Give commands, watch agents work, review results, manage content
- Key pages: Command Center, Chat, Dashboard, Trading (Strategy Room), AGORA (Debates), Nexus (Visual Org + Canvas), SNS Publishing, Messenger, Knowledge Base, and more
- Total: 23 pages

**Admin App** (back-office — `app.corthex-hq.com/admin`)
- Used by: Company Admin or Super Admin
- Purpose: Configure the AI organization — agents, departments, tools, credentials, budgets, workflows
- Key pages: Agents, Departments, Credentials, Tools, Costs, Workflows, Users, Employees, and more
- Total: 19 pages

---

### Core Entities (Data Model)

**Company** — A customer organization (multi-tenant, fully isolated)
- Has departments, agents, employees, budgets, settings

**Department** — Organizational unit within a company
- Has a name, description, and assigned agents
- Examples: "마케팅부", "투자전략부", "기술부"

**Agent (AI Employee)** — An AI worker with personality and capabilities
- Has: name, role, tier (manager/specialist/worker), soul (system prompt), model assignment, department, status (online/working/error/offline)
- Manager agents can delegate to specialists/workers
- Each agent has allowed tools and a reporting line

**Human Employee** — A human user with limited workspace access
- Has assigned departments, restricted command center access

**Command** — A natural language instruction from the CEO
- Types: simple query, delegation (multi-agent), deep work (autonomous multi-step)
- Gets routed by Chief of Staff → Manager → Specialists → synthesized response

**Delegation Chain** — The trail of agent-to-agent task routing
- Shows which agent did what, in what order, with what tools

**Chat Session** — Direct 1:1 conversation with a specific agent

**Debate (AGORA)** — Multi-agent discussion on a topic
- Round-based: agents take turns arguing positions
- Ends with consensus, dissent, or partial agreement

**Strategy/Trading** — Stock portfolio management
- Watchlists, portfolio positions, trade orders (real or paper)
- CIO orchestration: analysis → proposals → approval → execution
- Risk controls: stop-loss, position limits, daily loss limits

**SNS Content** — Social media posts managed by AI
- Platforms: Instagram, Tistory, Daum Café, Twitter, Facebook, Naver Blog
- Workflow: draft → approval → scheduled → published
- Card news support (multi-image series)

**Knowledge Base** — Documents and agent memories
- Documents with folder hierarchy
- Agent memories (auto-extracted learnings)

**Workflow** — Multi-step automated processes
- DAG of steps (tool calls, LLM calls, conditions)
- Sequential or parallel execution

**Conversation (Messenger)** — Internal messaging between employees
- Direct (1:1) or group conversations
- Can share AI analysis results into conversations

**Cron Schedule** — Recurring automated tasks
- Agent executes instructions on schedule

**ARGOS Trigger** — Event-driven automation
- Monitors conditions (price thresholds, news keywords, schedules)
- Auto-executes agent instructions when triggered

**Nexus (SketchVibe)** — Visual organization canvas
- Interactive node graph of company → departments → agents
- Also supports workflow visualization and editing

---

### Real-Time Features (WebSocket)

The app uses WebSocket for live updates across 15 channels:
- `chat-stream`: Live AI response streaming
- `agent-status`: Agent online/working/error status changes
- `command`: Command processing progress
- `delegation`: Delegation chain progress (which agent is working now)
- `tool`: Tool invocation notifications
- `cost`: Budget alerts and cost updates
- `debate`: Live debate round/speech streaming
- `strategy`: Trading updates, order execution
- `messenger` / `conversation`: Real-time chat messages
- `activity-log`: Live activity feed
- `nexus`: Canvas collaboration events
- `notifications`: System notifications
- `night-job`: Background job completion
- `argos`: ARGOS trigger events
- `strategy-notes`: Collaborative strategy notes

---

### User Roles & Permissions

| Role | App Access | Capabilities |
|------|-----------|-------------|
| Super Admin | Admin only | Manage all companies, full system access |
| Company Admin | Admin + CEO App | Configure org, manage agents/budgets/tools + use CEO features |
| CEO | CEO App | Full command center, all features, manage settings |
| Employee | CEO App (restricted) | Limited to assigned departments, restricted commands |

---

### Design Considerations for ALL Pages

**Functional requirements only — you have complete creative freedom on all visual decisions.**

- **Multi-tenant**: Every piece of data belongs to a company. No cross-company data leakage.
- **Real-time first**: Many features update live via WebSocket. Design for data that changes without page reload.
- **AI is doing real work**: This is not a toy. Agents execute real trades, publish real content, manage real documents. Design with the gravity this deserves.
- **Information density**: CEOs need to see a lot of data at once — agent statuses, running tasks, costs, recent activity. But it must remain scannable, not overwhelming.
- **Mobile-responsive**: CEO often checks on mobile. Every page must work on small screens.
- **Dark mode**: The app supports dark mode. Design for both themes.
- **Korean-first**: Primary language is Korean. All UI text, labels, and placeholders should be in Korean.
- **Loading / Empty / Error states**: Every data-driven section needs all three states designed.
- **The CEO is not a developer**: UI should be intuitive for a business executive, not a programmer. No jargon, no raw JSON, no technical IDs visible.
