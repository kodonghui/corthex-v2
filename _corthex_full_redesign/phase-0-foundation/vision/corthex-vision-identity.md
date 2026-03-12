# CORTHEX v2 — Vision & Identity

> This document defines who CORTHEX is, what it means, who uses it, and all design principles
> that govern every visual decision in the full redesign.
> **Every screen design must trace back to a principle stated here.**

---

## 1. What is CORTHEX?

### 1.1 Elevator Pitch

CORTHEX is an **AI organization management platform** that lets non-developers build, manage, and operate a complete AI team — without writing a single line of code. You draw an org chart. You give each agent a Soul (personality document in plain text). CORTHEX runs the team.

Where other AI tools give you a chatbot or a pipeline, CORTHEX gives you an organization. The CEO types "삼성전자 분석해줘" — and a chain of specialized AI agents (비서실장 → CIO → 시황분석전문가 → 기술분석전문가) executes, coordinates, and returns a 12-page investment report. The user didn't manage the routing. The org chart did.

### 1.2 The Problem It Solves

AI agents today face an organizational problem, not a technical one. The tools exist. The missing piece is structure:

| Problem | Current state | CORTHEX's answer |
|---------|--------------|-----------------|
| **Who does what?** | User must prompt-engineer routing manually | Org chart + Soul defines routing automatically |
| **How do I control 10+ agents?** | Config files, Python code, YAML | Visual canvas (NEXUS) — drag, connect, save |
| **What is the AI actually doing?** | Black box spinner | Tracker panel: live delegation chain, agent name, elapsed time |
| **How do I change agent behavior?** | Code edit → deploy | Edit Soul markdown in browser → instant effect |
| **How do I keep costs under control?** | Manual token counting | Tier budget limits + dashboard cost bars |

AI needs organizational structure. CORTHEX provides it — without requiring engineering knowledge.

### 1.3 Why It Exists

CORTHEX was created from a specific observation: **a solo founder with a well-designed CORTHEX organization can compete with a team of 10 specialists.** The constraint isn't AI capability — it's organizational design. CORTHEX closes that gap by making AI org design as accessible as drawing a chart.

The core thesis: **AI agents need a company to work in. CORTHEX is that company.**

---

## 2. Core Vision

### 2.1 The Vision Statement

> **"조직도를 그리면 AI 팀이 움직인다."**
> Draw the org chart — and the AI team moves.

This is not a metaphor. It is a literal product description. The NEXUS canvas is a visual org chart editor where the nodes are real AI agents with real behaviors. When you connect 비서실장 to CTO to 백엔드전문가 on the canvas and save, that routing is live. The org chart IS the program.

### 2.2 Dynamic Org Management as the Fundamental Differentiator

v1 CORTHEX had 29 fixed agents in a fixed hierarchy. v2 breaks this completely:

- **Admin can create unlimited departments** (not just the 2 v1 headquarters)
- **Admin can create any number of AI agents** with any name, Soul, tier, and parent agent
- **Admin can edit Soul in the browser** and changes take effect without server restart
- **Admin can delete, restructure, and reassign** — the org chart is never static

This is not a configuration improvement. It is the core product thesis:
**A v1-style fixed agent team is a product. A v2 dynamic AI organization is a platform.**

Every company using CORTHEX will have a different org chart. That difference IS the value.

### 2.3 The NEXUS Metaphor — Visual Org Chart as Living Nervous System

**NEXUS** (Latin: "connection/link") is the visual org chart editor and the central metaphor for the entire product.

The NEXUS canvas should feel like:
- **Figma** — direct manipulation, instant visual feedback, no modals
- **A company org chart** — hierarchical layout, named nodes, reporting lines
- **A nervous system** — when you change a connection, the whole system re-routes

Design implication: The NEXUS canvas node graph is the product's most iconic visual element. It should appear in marketing, in empty states (a simplified version), and in onboarding. When users think of CORTHEX, they should think of their org chart — the living one, with agents that think.

The visual metaphor family for all of CORTHEX:
- **Neural network** (connected intelligence)
- **Command center** (ARGOS: always watching, always running)
- **Corporate HQ** (structure, hierarchy, reporting lines)
- **Constellation** (named agents as stars, connections as light paths)

Do NOT use: robots, gears, chat bubbles, magic wands. CORTHEX is not a chatbot or a toy.

---

## 3. Who Uses CORTHEX?

### 3.1 Primary Persona: 비개발자 조직 관리자 (Non-Developer Org Manager)

**Name**: 김대표 (CEO, solo founder or small company owner)
**Role**: CEO or founder who makes final decisions, does not write code
**Context**: Running a small company with no engineering budget, or an investor managing their own research

**What they need**:
- To issue commands in natural Korean — no prompt engineering
- To see exactly which agent is doing what, in real time
- To trust that the AI is not hallucinating or going off-script
- To edit agent behavior without calling a developer

**What they fear**:
- "The AI did something I didn't intend"
- "I don't know why it responded this way"
- "Costs are out of control"
- "It feels like a toy, not a business tool"

**Design implication**: The Hub is their home. The Tracker is their trust instrument. Every agent action must be named, visible, and attributable. Errors must say which agent failed and what it attempted, not "오류가 발생했습니다."

### 3.2 Secondary Persona: 기술 관리자 (Technical Admin)

**Name**: 이팀장 (Company Admin — `admin_role: 'admin'` user in `admin_users` table. Uses the Admin console at `/admin`, NOT the workspace app.)
**Role**: Sets up and maintains the organization's AI infrastructure
**Context**: Managing CORTHEX on behalf of an entire company — creating departments, assigning agents, controlling budgets, reviewing audit logs

**What they need**:
- Full CRUD control over departments, agents, human employees
- NEXUS canvas to visualize and validate the org design
- Audit logs to track who changed what
- Tier budget configuration per department
- ARGOS schedule management

**What they fear**:
- "An employee misconfigured an agent and we don't know what it changed"
- "We're spending too much on the wrong agents"
- "The org chart is out of date and I can't tell"

**Design implication**: The Admin panel is their workspace. It should feel like enterprise software — dense, functional, full audit trail visibility. Company dropdown at top. Every action should be reversible or logged.

### 3.3 What They Both Care About: Control, Visibility, Trust

| Dimension | Manifestation in UI |
|-----------|-------------------|
| **Control** | Tier budget bars, agent on/off toggles, ARGOS enable/disable, Soul override |
| **Visibility** | Tracker panel (live chain), audit logs, cost analytics, ARGOS run history |
| **Trust** | Named agents (never "AI"), error attribution, Soul preview before save, NEXUS visual confirmation |

---

## 4. Emotional Design Direction

### 4.1 What Users Should Feel

**In control** — CORTHEX manages complexity so the user doesn't have to, but they can always see inside. The 3-column Hub layout (SessionPanel + ChatArea + TrackerPanel) is specifically designed for situational awareness: the user sees history, the current exchange, AND the live chain simultaneously.

**Professional** — CORTHEX manages real business operations. Budget decisions, investment analysis, content publishing. The visual language must feel enterprise-grade: dark sidebars, precise data labels, monospace cost figures. Not a consumer app.

**Intelligent** — The tool itself should feel smart. Agent names in responses, cost badges on completion, AGORA consensus/dissent analysis. The product understands its own complexity and surfaces it as useful data.

**Trusted** — Transparent AI decisions. Every handoff is named. Every cost is shown. Every error is attributed. No black boxes.

### 4.2 Emotional Moments Hierarchy

These 6 moments are the product's emotional backbone. Design investment must protect and amplify them.

| Rank | Moment | Screen | Design requirement |
|------|--------|--------|-------------------|
| 🥇 #1 | Tracker cascade — watching delegation chain unfold | Hub / TrackerPanel | 300ms stagger animation per step. Agent name + elapsed time. Cost badge pulses on `done` event. |
| 🥈 #2 | "명령 접수됨" instant acknowledgment | Hub / ChatArea | SSE `accepted` event triggers UI in ≤50ms. Zero perceived latency between submit and first response. |
| 🥉 #3 | NEXUS save — org change reflected immediately | Admin / NEXUS | Optimistic update: canvas reflects change before server confirms. Zero loading spinner. "즉시 적용됨" not "저장됨". |
| 4 | AGORA consensus badge | AGORA | After all speeches render: consensus/dissent/partial badge animates in. The decision moment. |
| 5 | Report delivered — markdown formatted | Hub / ChatArea | Final response renders with section headers, tables, code blocks. Professional output that feels earned. |
| 6 | Budget bar crosses threshold | Dashboard | Bar color transition (green→amber at 70%, amber→red at 90%). Animated. Feels like a real instrument panel. |

### 4.3 What CORTHEX is NOT — Design Anti-Patterns to Avoid

| What CORTHEX is NOT | Anti-pattern to avoid | Correct pattern |
|--------------------|----------------------|----------------|
| **Not a chatbot interface** | Full-screen input box, no context panels | 3-column layout — session history + chat + tracker always visible |
| **Not playful or casual** | Rounded corners everywhere, pastel colors, emoji in content | Sharp edges on data components, emoji only in nav (established pattern), dark sidebars |
| **Not cluttered** | Showing all 29 nav items flat, no grouping | Grouped nav (업무 6 / 운영 16 / 시스템 2) with Hub as default |
| **Not a black box** | Generic spinner + "처리 중..." | Tracker with named agent + step number + elapsed time |
| **Not overwhelming** | Showing everything at once | Progressive disclosure: Hub → Tracker expands on first handoff |

> **Note on nav emoji**: The sidebar uses emoji icons (🏠 🔗 🎖️ etc.) — this is **intentional and contained**. Emoji function as compact visual landmarks in a dense 27-item nav list, not decoration. Do NOT extend emoji use outside the sidebar. For all component icons, use Lucide React (Section 13).

---

## 5. Brand Personality

### 5.1 Core Identity: Military Precision × AI Intelligence

CORTHEX lives at the intersection of two worlds:

| Military Precision | AI Intelligence |
|------------------|----------------|
| Command structures (tiers, departments) | Soul-based autonomy (natural language personality) |
| Clear reporting lines (NEXUS org chart) | Emergent behavior from Soul documents |
| Always-on surveillance (ARGOS: 100 eyes) | Creates — doesn't just execute |
| Cost accountability (budget limits per tier) | Multi-agent deliberation (AGORA) |
| "작전현황" (Operations Status) | "그룹 토론" (AI boardroom) |

**The tension is the identity.** CORTHEX is disciplined enough to enforce org charts and tier hierarchies, but intelligent enough that the org chart actually *thinks* and makes decisions.

### 5.2 Voice: Confident, Precise, Trustworthy

| Voice dimension | Guideline | Example |
|----------------|-----------|---------|
| **Authority** | Command center, not consumer app | "명령 접수됨" not "Your request is being processed!" |
| **Precision** | Numbers, names, facts — never vague | "비서실장 → CTO → 백엔드전문가 (D2, $0.0042)" not "AI is working" |
| **Economy** | Minimum words, maximum information | "비용 $0.0042 · 1,240 토큰" not "Great work! Your AI used some tokens today." |
| **Transparency** | Name the agent, show the chain, never hide errors | "CTO 응답 없음 → 비서실장 직접 처리 중" not "An error occurred" |
| **Respect** | User is CEO. Treat them as commander. | Status updates like mission briefings, not loading spinners |

### 5.3 Name Meaning and Brand Codenames

**CORTHEX** = **COR** (Latin: heart/core) + **CORTEX** (brain's outer layer — higher-order thinking)
The name encodes the product: a thinking core. The cerebral cortex of your business — the intelligence layer that routes commands, delegates work, and synthesizes results.

| Codename | Meaning | Feature | Design use |
|---------|---------|---------|-----------|
| **NEXUS** | Latin: "connection/link" | Visual org chart editor | The constellation metaphor: nodes as agents, edges as authority |
| **AGORA** | Ancient Greek public square | Multi-agent debate engine | Speech cards in sequence, consensus badge, deliberation UI |
| **ARGOS** | Greek giant with 100 eyes — never sleeps | Cron scheduler | Status dot always visible, "last run: X min ago" |
| **Soul** | Personality + orchestration rules | Agent system prompt editor | Full-screen markdown editor, live preview |
| **Tracker** | Live delegation chain viewer | Real-time handoff visualization | The product's emotional centerpiece in Hub |
| **Hub** (허브) | Central connection point | Main command interface | The product's home screen — 3-column |
| **Library** (라이브러리) | Searchable knowledge repository | RAG knowledge base | Document grid + semantic search |
| **Tier** (티어) | Rank/level — cost and authority | Dynamic agent hierarchy | Badge: T1 Manager / T2 Specialist / T3 Worker |

### 5.4 Color Emotion Targets

The color system must evoke **authority**, **precision**, and **trust** — not friendliness or excitement.

- **Indigo (#4F46E5)** — Intelligence, active work, selection. The "thinking" color.
- **Zinc (dark grays)** — Structure, professional restraint, the foundation.
- **Green (#22C55E)** — Certainty, success, system health. Earned, not default.
- **Amber (#F59E0B)** — Attention required. Not danger — advisory.
- **Red (#EF4444)** — Failure, exceeded limit, critical error. Rare but unmistakable.

### 5.5 Typography Personality: Authoritative but Approachable

- **Work Sans** (primary) — Currently loaded in `packages/app/index.html` via Google Fonts. Professional appearance, excellent legibility at small sizes.
- **System mono** — `font-mono` Tailwind class. For costs, IDs, Soul editor. Signals: "this is data, not marketing."
- Rule: **Typography hierarchy through weight and size, not color.** Color is reserved for status signals.

---

## 6. Feature Hierarchy

### 6.1 Priority Framework

Features are not equal. Design polish must match product value.

#### P0 — Always Visible (Zero-click access, highest design polish)

These features are visible on every session. If they feel wrong, the whole product feels wrong.

| Feature | Location | Why P0 |
|---------|---------|--------|
| Hub — ChatArea (input + messages) | `/hub` center column | Every use starts here |
| Hub — TrackerPanel (handoff chain) | `/hub` right column | CORTHEX's most unique real-time UI |
| Hub — SessionPanel (session list) | `/hub` left column | Context switching between work sessions |
| App Sidebar Navigation | All app pages | Primary wayfinding |
| Agent status indicators | Hub / SessionPanel header | Real-time health of the AI team |

#### P1 — One Click Away (High design polish, frequently used)

| Feature | Location | Why P1 |
|---------|---------|--------|
| NEXUS Canvas | Admin `/nexus` | Core value proposition for admins |
| **SketchVibe AI Canvas** | App `/nexus` (SketchVibe panel within NEXUS page) | Demo moment: "type 'add backend team under CTO' → watch nodes appear on canvas." MCP-powered live canvas editing. |
| AGORA debate room | `/agora` | "AI boardroom" — premium differentiator |
| Dashboard / Operations | `/dashboard` | Daily check-in for cost/performance |
| Knowledge Library | `/knowledge` | Powers agent intelligence |
| Agent Soul editor | Admin `/agents/:id` | Code-free programming interface |
| ARGOS scheduler | `/argos` | "AI works while you sleep" |

#### P2 — Settings / Admin (Functional, clean, no decoration)

| Feature | Location | Why P2 |
|---------|---------|--------|
| Department management | Admin `/departments` | Setup-time task, not daily |
| Agent CRUD | Admin `/agents` | Initial configuration |
| Human employee management | Admin `/employees` | HR-adjacent, not AI-core |
| Tier configuration | Admin `/tiers` | Configuration task |
| Budget limits | Admin settings | Policy setup |
| Audit logs | Admin `/audit-logs` | Compliance, occasional review |
| Notification preferences | App settings | Utility |

#### P3 — Power User / Advanced (Functional, minimal investment)

| Feature | Location | Why P3 |
|---------|---------|--------|
| Trading / Strategy Room | `/trading` | High-value but niche use case |
| SNS Management | `/sns` | Content pipeline, standard patterns |
| Files | `/files` | File manager, commodity UX |
| Activity / Operations Log | `/ops-log` | Dense data tables, filter UX only |
| Cost Analytics deep-dive | `/cost-analytics` | Power user reporting |
| Soul Gym (performance) | `/performance` | Advanced agent tuning |

### 6.2 Screen Design Priority Order

When design time is limited, sequence work in this order:

1. **Hub** — 3-column layout: TrackerPanel + ChatArea + SessionPanel
2. **NEXUS Canvas** (Admin) — React Flow org editor
3. **AGORA** — debate timeline + speech cards + consensus badge
4. **Dashboard** — operations stats + cost bars + agent status
5. **Knowledge Library** — document grid + semantic search
6. **Admin Agent CRUD** — CRUD table + Soul preview panel
7. **Trading / Strategy Room**
8. **All other pages**

---

## 7. Competitive Positioning

### 7.1 vs. Slack (Communication Platform)

| Dimension | Slack | CORTHEX |
|-----------|-------|---------|
| Core metaphor | Chat channels | Org chart with AI agents |
| Work output | Messages and notifications | Analysis reports, executed tasks, automated schedules |
| Agents | Bots (limited, command-based) | AI agents with Souls, tiers, autonomous decision-making |
| Who works | Humans | AI agents + Human employees in the same org |
| What they share | Information | Task results and structured work products |

**Key difference**: CORTHEX is not a communication tool. It's an execution tool. Agents don't chat — they work, delegate, and report.

### 7.2 vs. Linear / Jira (Project Management)

| Dimension | Linear/Jira | CORTHEX |
|-----------|------------|---------|
| Core metaphor | Issues/tasks in a backlog | Live AI agents executing work right now |
| Who assigns work | Human managers | The CEO by typing a command (agent routes it) |
| Work execution | Humans pick up tasks | AI agents execute autonomously |
| Status tracking | Issue status (todo/in-progress/done) | Real-time delegation chain (Tracker panel) |
| Automation | Simple rule-based | Full AI reasoning + tool use |

**Key difference**: CORTHEX is not a project manager. There are no tickets to create. The CEO types a request; the AI team handles routing, execution, and reporting automatically.

### 7.3 vs. Custom AI Dashboards (CrewAI / LangGraph / AutoGen)

| Dimension | Custom AI Dashboards | CORTHEX |
|-----------|---------------------|---------|
| Target user | Developers (Python required) | Non-developers (no code) |
| Org configuration | Code / YAML / config files | Visual canvas (NEXUS) + plain text Soul |
| Agent personality | Prompt strings in code | Soul markdown edited in browser |
| Deployment | Engineers push code | Admin saves in browser |
| Cost visibility | Manual logging | Built-in tier budgets + dashboard |

**Key difference**: CORTHEX is not a developer tool. A CEO can restructure the AI organization in 5 minutes without calling an engineer.

### 7.4 What Makes CORTHEX's UI Unique

Three UI elements that no competitor has in this combination:

1. **NEXUS canvas** — A live org chart where nodes ARE the routing logic. Not a visualization of code — it IS the code.
2. **Tracker panel** — Real-time named delegation chain visible while chat is active. The user watches their AI team work.
3. **Soul editor** — Plain text markdown editing of agent personality/behavior, with instant effect. The "code editor" for non-developers.

The Hub's 3-column layout is the visual signature of CORTHEX: the product that shows you your team while you command it.

---

## 8. Design Principles

These 8 principles govern every design decision in the redesign. If a visual choice cannot be justified by one of these principles, it should be removed.

### Principle 1: Name the Machine
**Every AI action must be attributed to a named agent, never to "AI" generically.**

- ❌ "AI가 처리 중입니다..."
- ✅ "비서실장이 분석 중... (34s)"
- Rationale: The value proposition IS the team. Anonymizing agents destroys the org chart metaphor and kills trust.

### Principle 2: Depth is Data
**Never hide complexity — surface it as structured information.**

- Tracker panel exists because watching 비서실장 → CIO → 전문가 cascade IS the product, not a loading state to hide.
- Cost ($0.0042) and tokens (1,240) are always shown on completion — not buried in settings.
- Tier badges (T1/T2/T3) visible in all agent-related contexts.
- Rationale: CORTHEX users are business decision-makers who demand accountability.

### Principle 3: Zero-Delay Feedback
**The user must perceive zero latency between action and system acknowledgment.**

- Hub submit → "명령 접수됨" badge in ≤50ms (SSE `accepted` event)
- NEXUS save → canvas updates optimistically before server confirms
- Soul save → agent status dot changes to "working" immediately
- Rationale: Agent execution takes 5–60 seconds. The bridge between human action and machine response must feel instant.

### Principle 4: The Commander's View
**Design for situational awareness, not simplicity.**

- Hub's 3-column layout (SessionPanel + ChatArea + TrackerPanel) is intentional. The user needs session history AND live tracking AND the current conversation in simultaneous view.
- Dashboard is a mission control panel, not a marketing landing page. Dense is correct.
- Admin sidebar is flat (no groups) — admins scan all options fast.
- Rationale: CORTHEX users are decision-makers who need all relevant information in peripheral vision.

### Principle 5: Show the Org, Not the AI
**Users should see their organization structure, not raw AI interfaces.**

- Hub shows: agent names, tier badges, department context — not model names or token usage (until completion).
- NEXUS shows: org hierarchy, connection lines, named nodes — not JSON config or system prompts.
- Errors show: which agent, what it attempted, suggested recovery — not stack traces.
- Soul editor must support line numbers and syntax highlighting — requires **CodeMirror 6** (not a plain `<textarea>`). Specify this library before implementation.
- Rationale: CORTHEX's interface is an org management tool. The AI infrastructure is the engine, not the product.

### Principle 6: Hierarchy Through Typography, Not Color
**Use font weight and size to establish visual hierarchy. Reserve color exclusively for status signals.**

Status colors (semantic use ONLY):
- `text-green-500` (#22C55E) — online, success, within budget
- `text-indigo-600` (#4F46E5) — active, working, selected
- `text-amber-500` (#F59E0B) — warning, at 70% threshold
- `text-red-500` (#EF4444) — error, failed, over budget
- `text-zinc-400` (#A1A1AA) — disabled, offline, secondary

Do NOT use color for section differentiation, feature distinction, or decorative purposes.

### Principle 7: Dark Mode is First-Class
**CORTHEX is built for extended professional use. Dark mode is the reference design.**

- Dark sidebar (`bg-zinc-900`) is already implemented — maintain this.
- Main content: `bg-zinc-950` (dark) / `bg-white` (light).
- All color combinations must pass WCAG AA contrast in both modes.
- Rationale: Command centers, trading terminals, developer tools — all use dark mode as their professional signal.

### Principle 8: Desktop-First, Information-Dense
**Min-width 1280px. No mobile layouts. Optimize for information density, not whitespace.**

- Sidebars fixed (`w-60`). Content fills remaining viewport.
- Tables show ≥6 columns without horizontal scroll.
- Padding: `p-4` and `gap-4` as standard. Never `p-12` or `gap-8` except for top-level page margins.
- Rationale: Explicitly documented constraint. CORTHEX app and admin are desktop-only (Technical Spec Section 8.6).

---

## 9. Color System

### 9.1 Base Palette (Tailwind CSS 4)

| Role | Light mode | Dark mode | Hex (Light / Dark) |
|------|-----------|-----------|-------------------|
| Page background | `bg-white` | `bg-zinc-950` | #FFFFFF / #09090B |
| App sidebar background | `bg-zinc-50` | `bg-zinc-900` | #FAFAFA / #18181B |
| **Admin sidebar background** | **`bg-white`** | **`bg-zinc-900`** | **#FFFFFF / #18181B** |
| Card / Panel background | `bg-white` | `bg-zinc-900` | #FFFFFF / #18181B |
| Elevated panel | `bg-zinc-50` | `bg-zinc-800` | #FAFAFA / #27272A |
| Border | `border-zinc-200` | `border-zinc-800` | #E4E4E7 / #27272A |
| Primary accent | `bg-indigo-600` | `bg-indigo-600` | #4F46E5 / #4F46E5 |
| Primary hover | `bg-indigo-700` | `bg-indigo-500` | #4338CA / #6366F1 |
| Active nav (background) | `bg-indigo-50` | `bg-indigo-950` | #EEF2FF / #1E1B4B |
| Active nav (text) | `text-indigo-700` | `text-indigo-300` | #3730A3 / #A5B4FC |
| **Nav item hover** | **`bg-zinc-100`** | **`bg-zinc-800`** | **#F4F4F5 / #27272A** |
| Disabled / inactive | `text-zinc-400` | `text-zinc-400` | #A1A1AA / #A1A1AA |
| Skeleton loader | `bg-zinc-200` | `bg-zinc-700` | #E4E4E7 / #3F3F46 |

**Sources**: `packages/app/src/components/sidebar.tsx` (active item, hover classes), `packages/admin/src/components/sidebar.tsx` line 89 (`bg-white`).

> **Note (theme-color)**: `packages/app/index.html` line 8 sets `<meta name="theme-color" content="#6366f1">` (indigo-500). This should be updated to `#4F46E5` (indigo-600) to match the primary accent defined above.

> ⚠️ App and Admin sidebars intentionally diverge in light mode (app: zinc-50, admin: white). Admin uses `border-r border-zinc-200` to compensate for the lower contrast.

> ⚠️ **Slate → Zinc Migration**: The current Hub implementation (`pages/hub/secretary-hub-layout.tsx`, `handoff-tracker.tsx`, `session-sidebar.tsx`) uses the **slate palette** (`bg-slate-900`, `bg-slate-800`, `text-slate-400`). The redesign target migrates Hub to the **zinc palette** documented in this section. When redesigning Hub components, replace all `slate-*` classes with the equivalent `zinc-*` classes. The main App sidebar and admin already use zinc.

### 9.2 Status Colors

| Status | Tailwind class | OKLCH token | Hex | Use case |
|--------|--------------|-------------|-----|---------|
| Online / Success | `text-green-500` | `--color-corthex-success` (emerald-600 approx) | #22C55E | Agent online, task success, budget safe |
| Working / Active | `text-indigo-600` | `--color-corthex-accent` | #4F46E5 | Agent executing, SSE active, selected |
| Warning | `text-amber-500` | `--color-corthex-warning` | #F59E0B | Budget 70%+, slow response, pending |
| Error / Failed | `text-red-500` | `--color-corthex-error` | #EF4444 | Agent error, task failed, budget exceeded |
| Offline / Disabled | `text-zinc-400` | — | #A1A1AA | Agent offline, disabled element |

> Note: `--color-corthex-success` is oklch(emerald-600) which is slightly different from Tailwind's `green-500`. Use `text-green-500` in new UI for consistency. The OKLCH token is available for CSS custom property use.

### 9.3 Feature-Specific Color Rules

| Feature | Color rule |
|---------|-----------|
| Tracker steps | Active: indigo-600, Completed: green-500, Failed: red-500 |
| AGORA speech tier badges | Manager=`bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300` (#3730A3/#A5B4FC), Specialist=`bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300` (#6D28D9/#C4B5FD), Worker=`bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400` (#52525B/#A1A1AA) |
| Budget progress bar | green-500 (0–70%) → amber-500 (70–90%) → red-500 (90–100%) |
| Debate outcome badge | Consensus=green-500, Dissent=red-500, Partial=amber-500 |
| Tier tier badge text | `text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded` |

### 9.4 Design Token Mapping (OKLCH ↔ Tailwind)

`packages/app/src/index.css` defines OKLCH-based tokens via Tailwind 4's `@theme`. Use tokens for CSS variable contexts; use Tailwind classes in JSX.

| Semantic role | CSS token | Tailwind class | When to use token |
|--------------|-----------|---------------|-------------------|
| Primary accent | `var(--color-corthex-accent)` | `bg-indigo-600 / text-indigo-600` | CSS custom properties, `border-color` in CSS |
| Accent (dark) | `var(--color-corthex-accent-dark)` | `text-indigo-400` | CSS-only dark mode overrides |
| Success | `var(--color-corthex-success)` | `text-green-500` | CSS contexts only; prefer Tailwind in JSX |
| Warning | `var(--color-corthex-warning)` | `text-amber-500` | CSS contexts only |
| Error | `var(--color-corthex-error)` | `text-red-500` | CSS contexts only |
| Slide-in animation | `var(--animate-slide-in)` | — | `animation: var(--animate-slide-in)` in CSS |
| Slide-up animation | `var(--animate-slide-up)` | — | `animation: var(--animate-slide-up)` in CSS |

**Rule**: In JSX/Tailwind, use Tailwind classes. In `*.css` files, use `corthex-*` tokens. Never create a third system.

### 9.5 Dark Mode Component Layering Rules

In dark mode, each nesting level needs distinct background to show boundaries. **Invisible borders are a design failure.**

| Layer | Dark bg | Light bg | Rule |
|-------|---------|---------|------|
| Page | `bg-zinc-950` | `bg-white` | Root page container |
| Sidebar | `bg-zinc-900` | `bg-zinc-50` (app) / `bg-white` (admin) | Always has `border-r` |
| Card | `bg-zinc-900` | `bg-white` | Must have `border border-zinc-800` in dark mode |
| Panel (elevated) | `bg-zinc-800` | `bg-zinc-50` | Nested inside card; no border needed (bg contrast sufficient) |
| Sub-panel | `bg-zinc-800/50` | `bg-zinc-100` | Use opacity variant for subtle nesting |

**Warning**: `border-zinc-800` = `bg-zinc-800` in dark mode — invisible. If card bg is `bg-zinc-900`, use `border-zinc-700` for visible card borders in dark mode.

### 9.6 Interactive States

Every interactive element needs all 4 states specified. These are the standards.

#### Primary Button

| State | Classes |
|-------|---------|
| Default | `bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium` |
| Hover | `hover:bg-indigo-700` |
| Active/Pressed | `active:bg-indigo-800` |
| Disabled | `disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500` |
| Loading | `opacity-70 cursor-not-allowed` + `Loader2` icon with `animate-spin` |

#### Secondary / Ghost Button

| State | Classes |
|-------|---------|
| Default | `border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm` |
| Hover | `hover:bg-zinc-100 dark:hover:bg-zinc-800` |
| Disabled | `disabled:opacity-50 disabled:cursor-not-allowed` |

#### Input / Textarea

| State | Classes |
|-------|---------|
| Default | `border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 text-sm` |
| Focus | `focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent` |
| Error | `border-red-500 dark:border-red-500 focus:ring-red-500` |
| Disabled | `disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-400 disabled:cursor-not-allowed` |

#### Focus Ring Standard (keyboard navigation)

```
focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950
```

Use `focus-visible:` (not `focus:`) to avoid rings on mouse clicks. Required for WCAG AA keyboard navigation.

---

## 10. Typography

### 10.1 Font Stack

**Primary: Work Sans** — Currently loaded in `packages/app/index.html` via Google Fonts (weights 400/500/600/700).
```html
<!-- packages/app/index.html line 14 -->
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
```
Korean fallback: `'Work Sans', -apple-system, 'Apple SD Gothic Neo', sans-serif`

> ⚠️ **Admin loads no custom font** (`packages/admin/index.html` has no font link). Action item: add Work Sans to admin `index.html` for visual consistency across both apps.

**Monospace: system mono** — `font-mono` Tailwind class (system monospace stack). For cost figures, agent IDs, build numbers. Soul editor requires **CodeMirror 6** (plain `<textarea>` is insufficient for line numbers).

### 10.2 Type Scale

| Use case | Tailwind classes | Size / Weight |
|---------|----------------|--------------|
| Page title | `text-xl font-semibold text-zinc-900 dark:text-zinc-100` | 20px / 600 |
| Section header | `text-sm font-semibold uppercase tracking-wide text-zinc-400` | 14px / 600 |
| Agent name (prominent) | `text-base font-medium text-zinc-900 dark:text-zinc-100` | 16px / 500 |
| Body primary | `text-sm text-zinc-700 dark:text-zinc-300` | 14px / 400 |
| Body secondary | `text-xs text-zinc-500 dark:text-zinc-400` | 12px / 400 |
| Nav item (inactive) | `text-sm text-zinc-700 dark:text-zinc-300` | 14px / 400 |
| Nav item (active) | `text-sm font-medium text-indigo-700 dark:text-indigo-300` | 14px / 500 |
| Monospace data | `font-mono text-xs text-zinc-600 dark:text-zinc-400` | 12px / 400 |
| Cost figure | `font-mono text-sm font-medium text-zinc-700 dark:text-zinc-300` | 14px / 500 |
| Empty state heading | `text-base font-medium text-zinc-500 dark:text-zinc-400` | 16px / 500 |

### 10.3 Markdown Rendering Scale (`MarkdownRenderer` component)

AI agent responses in Hub ChatArea, Reports page, and Performance/Soul Gym render markdown. These specs apply to the `MarkdownRenderer` component.

| Element | Tailwind classes | Notes |
|---------|----------------|-------|
| `h1` | `text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-6 mb-3` | Rare — report title level |
| `h2` | `text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-5 mb-2` | Section headers in reports |
| `h3` | `text-lg font-semibold text-zinc-800 dark:text-zinc-200 mt-4 mb-2` | Sub-sections |
| `h4` | `text-base font-semibold text-zinc-800 dark:text-zinc-200 mt-3 mb-1` | |
| `p` | `text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3` | Body text |
| `ul / ol` | `text-sm text-zinc-700 dark:text-zinc-300 pl-4 mb-3 space-y-1` | |
| `code` (inline) | `font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300` | |
| `pre > code` (block) | `font-mono text-xs bg-zinc-900 dark:bg-zinc-950 text-zinc-300 p-4 rounded-lg overflow-x-auto` | |
| `blockquote` | `border-l-4 border-indigo-500 pl-4 text-zinc-500 dark:text-zinc-400 italic` | |
| `table` | `w-full text-sm border-collapse` | |
| `thead` | `bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-700 dark:text-zinc-300` | |
| `td / th` | `px-3 py-2 border border-zinc-200 dark:border-zinc-700` | |
| `hr` | `border-zinc-200 dark:border-zinc-800 my-4` | |

---

## 11. Spacing & Layout System

### 11.1 Spacing Tokens

| Token | Value | Common use |
|-------|-------|-----------|
| `p-1` / `gap-1` | 4px | Icon padding, tight list items |
| `p-2` / `gap-2` | 8px | Button padding, badge padding |
| `p-3` / `gap-3` | 12px | Nav item: `px-3 py-2` (current sidebar standard) |
| `p-4` / `gap-4` | 16px | Card padding, section padding — standard unit |
| `p-6` / `gap-6` | 24px | Page content padding, between major cards |
| `p-8` / `gap-8` | 32px | Between major page sections only |

### 11.2 Layout Grids

**App (packages/app) — all pages except Hub:**
```
┌─────────────────────────────────────────────────────────┐
│ Sidebar (w-60 fixed)  │  Main Content Area (flex-1)     │
└─────────────────────────────────────────────────────────┘
```

**⚠️ CURRENT STATE vs REDESIGN TARGET**

> The 3-column layout below is the **redesign target** defined in Phase 0-1 Technical Spec Section 2.4.1.
> The current implementation (`packages/app/src/pages/hub/`) is **2-column** with a horizontal tracker bar.

**Current implementation (2-column):**
```
┌──────────────────┬──────────────────────────────────────────────┐
│ SessionSidebar   │ Main area (flex-1)                            │
│ (w-64 fixed)     │  ├─ HandoffTracker (horizontal bar, border-b) │
│ bg-slate-900     │  └─ ChatArea (flex-1)                         │
└──────────────────┴──────────────────────────────────────────────┘
```
*Sources: `pages/hub/secretary-hub-layout.tsx` line 276 (layout), `pages/hub/session-sidebar.tsx` line 94 (`w-64 bg-slate-900`), `pages/hub/handoff-tracker.tsx` line 15 (`bg-slate-800/60 border-b` = horizontal bar)*

**Redesign target (3-column per Technical Spec Section 2.4.1):**
```
┌──────────────┬─────────────────────────┬────────────────────┐
│ SessionPanel │ ChatArea (flex-1)        │ TrackerPanel (w-80)│
│ (w-64 fixed) │                         │ or icon-strip(w-12)│
└──────────────┴─────────────────────────┴────────────────────┘
```
> ⚠️ **REDESIGN TARGET** — Current Hub implementation is 2-column `[SessionPanel w-64 slate][Main flex-1]` with slate palette (`bg-slate-900`, `border-slate-700`). TrackerPanel is a horizontal bar inside Main, not a right sidebar. This 3-column zinc spec is the redesign target, not current state.

> ⚠️ **Implementation note**: Current Hub (`secretary-hub-layout.tsx`) renders 2-column (`<SessionSidebar w-64>` + `<Main flex-1>` with horizontal HandoffTracker). The 3-column layout above is the redesign target. Implementation requires: (1) adopting `session-panel.tsx` (w-72) as new SessionPanel, (2) migrating `handoff-tracker.tsx` to right-column `w-80` panel, (3) migrating palette from slate → zinc throughout.

**Redesign Hub fixed-width math at 1280px viewport:**
- App sidebar: `w-60` = 240px
- SessionPanel: `w-64` = 256px (matches current SessionSidebar width)
- TrackerPanel (expanded): `w-80` = 320px
- **Total fixed: 816px → ChatArea `flex-1` = 464px minimum**
- TrackerPanel collapsed (`w-12` = 48px) → ChatArea expands to 736px

The TrackerPanel in the redesign is a **right sidebar** replacing the current horizontal handoff bar. It collapses to `w-12` icon strip when no active handoffs, auto-expands on first `handoff` SSE event.

**Admin (packages/admin):**
```
┌──────────────────────────────────────────────────────────┐
│ Sidebar (w-60 fixed)  │  Main Content Area (flex-1)      │
│ + Company dropdown    │  + optional right detail panel   │
└──────────────────────────────────────────────────────────┘
```

---

## 12. Motion & Animation

### 12.1 Animation Budget

CORTHEX is a professional tool. Animation must serve function, not entertainment.

| Animation type | Duration | Easing | Use case |
|---------------|---------|--------|---------|
| Micro-interaction (hover/focus) | 150ms | `ease-out` | Button hover, dropdown open |
| Panel expand/collapse | 250ms | `ease-in-out` | TrackerPanel expand, sidebar collapse |
| SSE step appear | 300ms | `ease-out` | New Tracker step slides in |
| Status dot change | 200ms | `ease-in-out` | Agent status: online→working→offline |
| Cost bar fill | 500ms | `ease-out` | Dashboard budget bar on page load |
| Page transition fade | 150ms | `ease-out` | Route change |

### 12.2 Tracker Panel Animation Spec (Most Important)

Use `transition-[transform,opacity]` (NOT `transition-all`) for Tracker rows — prevents full-property repaints on rapid SSE `handoff` events (3–5 per chain).

**Expand — on each `handoff` SSE event:**
1. New step row: `translateY(20px)→translateY(0)`, `opacity:0→1`, `transition-[transform,opacity] duration-300 ease-out`
2. Previous step: pulse indicator stops → `✓` checkmark appears, 200ms
3. New step: agent name with `animate-pulse` indigo dot
4. Depth badge (`D2`, `D3`): `scale(120%)→scale(100%)`, 150ms ease-out

**Collapse — TrackerPanel w-80 → w-12 (user toggles or no active handoffs):**
1. Panel content fades out: `opacity:1→0`, 100ms ease-in
2. Width collapses: `w-80→w-12`, `transition-all duration-250 ease-in-out`, starts after 100ms delay
3. Icon strip appears at `w-12` with `animate-fade-in` 150ms

**CSS**: `transition-[width] duration-250 ease-in-out` on the TrackerPanel container.

### 12.3 AGORA Speech Animation Spec

AGORA uses polling (not SSE). Speech rendering is client-controlled after `GET /:id/timeline` returns.

The `-16px` entrance requires a custom keyframe NOT in the existing `index.css`. Add to `packages/app/src/index.css`:
```css
@keyframes speech-enter {
  from { transform: translateX(-16px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

Then:
1. Each speech card: `animation: speech-enter 400ms ease-out forwards`
2. Stagger: 200ms JS delay between each card (`setTimeout` with index * 200)
3. Consensus badge: `scale(0.8)→scale(1.0)`, `opacity:0→1`, 300ms — use Tailwind: `transition-[transform,opacity] duration-300`

> **Alternative**: If using Framer Motion in the project, use `<motion.div initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, delay: index * 0.2 }} />`.

### 12.4 Chat Auto-Scroll Behavior

ChatArea auto-scroll must handle the case where the user scrolls up while SSE messages are streaming:

- **Default**: auto-scroll to bottom on each SSE `message` chunk
- **Scroll lock**: if `scrollPosition < scrollHeight - 200px` (user has scrolled up), pause auto-scroll
- **Resume indicator**: show a floating "⬇ 최신 메시지로" pill: `fixed bottom-20 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full cursor-pointer shadow-lg`
- **Resume trigger**: clicking the pill, OR user submits a new message (next SSE stream starts)

---

## 13. Iconography

### 13.1 Current System (from sidebar.tsx — maintain as is)

Sidebar navigation uses **emoji icons**. This is established convention. Do not replace.

| Category | Examples | System |
|---------|----------|--------|
| Nav icons | 🏠 🔗 🎖️ 💬 📈 🗣️ 📄 📁 🏢 🏗️ 🤖 📊 📱 💭 💰 📞 📋 🔒 💪 📚 ⏰ 🔍 🔔 ⚙️ | Emoji |
| Status indicators | Colored `rounded-full` div | Tailwind CSS |
| Action buttons | Lucide React icons | SVG |
| Agent tier badges | Text pills: `T1`, `T2`, `T3` | Text + CSS |

### 13.2 Lucide React Icon Recommendations

Use **Lucide React** for all non-nav action icons:

| Icon | Usage |
|------|-------|
| `ChevronRight` / `ChevronDown` | Expand/collapse |
| `ArrowRight` | Handoff direction in Tracker |
| `Check` / `X` | Completed / failed step |
| `Loader2` (animated spin) | Working state |
| `Brain` | Soul / AI agent context |
| `Network` | NEXUS / org chart |
| `BarChart3` | Cost / performance charts |
| `Mic` | Voice briefing |
| `Plus` | Add action (department, agent, session) |
| `Trash2` | Delete (destructive, red context only) |

---

*Document generated: 2026-03-12*
*Reference sources: prd.md (vision, mission, personas), v1-feature-spec.md (feature set), architecture.md (design constraints), phase-0-step-1-snapshot.md (established layout constraints), sidebar.tsx (active color system)*
