# CORTHEX Vision & Identity Document

_Phase 0-2 — Foundation. Authoritative source for all subsequent design decisions._
_Built on: technical-spec.md (1649 lines) · v1-feature-spec.md · PRD.md · Architecture.md_
_Design frameworks applied: Design Masters (Rams, Vignelli, Brockmann, Bass) · Design Movements (Swiss International Style) · Design Principles (Gestalt, Golden Ratio, Hierarchy, White Space)_

**Date:** 2026-03-15
**Version:** 2.0 (complete rewrite — all 11 sections)

---

## 1. What Is CORTHEX?

### Elevator Pitch

CORTHEX is a dynamic AI organization management platform: a CEO builds an entire AI workforce — departments, agents, delegation chains, domain tools — from a visual canvas, then commands it through a single interface, with zero code and zero restarts. It is not a chatbot. It is not a workflow builder. It is an **organizational operating system** where every structural change to the org chart is simultaneously a change to how AI executes.

### The Problem It Solves

Every enterprise trying to adopt AI hits the same wall: either one generic chatbot that does everything superficially, or a hardcoded multi-agent pipeline that requires an engineer every time the business changes. CORTHEX eliminates both constraints. The organizational chart is the routing logic — create a Legal Department, assign two agents with specific Souls, connect them to 125+ real-world tools, and they begin executing delegated work autonomously. Restructure the org? Drag nodes in NEXUS. Change an agent's expertise? Edit its Soul in the web UI. No deployment. No code.

### Why It Exists

v1 had 29 hardcoded agents — a CTO, a CMO, a CIO, each with fixed personality files. A trading firm and a law firm ran identical org charts. That is categorically wrong. CORTHEX v2 exists because **every organization is different**, and the AI workforce should reflect that difference — created, edited, and destroyed by the person running the business.

---

## 2. Core Vision

### The Definitive Statement

> **The NEXUS org chart is not a feature inside CORTHEX. The org chart IS CORTHEX.**

Every node in NEXUS is an agent with a Soul (system prompt + knowledge). Every edge is a Handoff delegation chain. Every cluster is a Department (scoped, isolated, auditable). When a CEO adds a node, a new agent exists. When a CEO draws an edge, a delegation path is created. The canvas **is** the configuration.

### Dynamic Organization: The Core Differentiator

| Competitor | Organization structure | Routing logic |
|-----------|----------------------|---------------|
| ChatGPT Teams | Single model, no hierarchy | Static system prompt |
| CrewAI | Hardcoded in Python | Code-defined graph |
| LangGraph | Code-defined graph nodes | Code-defined edges |
| **CORTHEX** | **Admin-built, drag-and-drop** | **Soul = routing logic (no code)** |

Dynamic means: a department created today routes commands tomorrow. An agent deleted today stops receiving delegations immediately. Tier changed from Manager → Specialist changes which model runs and how much it costs — with no downtime.

### The Hub Metaphor

The Hub (허브, formerly 사령관실) is not a chat window. It is a command bridge. Every message either:
1. **Routes** automatically via Secretary (비서실장) who reads the Soul to determine the correct department
2. **Calls** a specific agent by @mention syntax
3. **Executes** a slash command (`/all`, `/sequence`, `/debate`, `/deep-debate`, `/batch`, `/preset`)

The Handoff Tracker (트래커) displays the delegation chain in real-time: `비서실장 → 마케팅팀장 → SNS 전문가`. This is not a progress bar. It is a live org chart in motion.

---

## 3. Who Uses CORTHEX?

### Primary Persona: The Commanding CEO

| Attribute | Specification |
|-----------|--------------|
| **Role** | Business owner / CEO / C-suite executive. The sole human in the CORTHEX org. |
| **Technical level** | Non-developer. Manages Excel, Notion, Slack — but cannot write code. |
| **Language** | Korean-primary. Formal register (존댓말) expected in all UI labels and system messages. |
| **Interaction mode** | Commands, not conversations. Expects reports back, not chatbot replies. |
| **Device** | Desktop primary: 1920×1080+ monitor. Rarely mobile. |
| **Work pattern** | Opens Hub → issues 3-5 commands → reviews outputs → checks NEXUS → closes. Not a "chat all day" user. |
| **Core frustration** | AI that feels like a toy. No visibility into what the AI is actually doing. Too many clicks to accomplish a task. |
| **Core delight** | A delegation chain that executes automatically. A NEXUS node turning green when a task completes. A professionally formatted report. |
| **Mental model** | This is my staff. I give orders. They execute. I review results. |

**Critical design implication:** Every screen must be scannable in under 5 seconds. Status must be visible without clicking. Reports must be skimmable at 30 seconds. The Hub must feel like a command terminal, not a messaging app.

### Secondary Persona: The Technical Admin

| Attribute | Specification |
|-----------|--------------|
| **Role** | CTO, senior developer, or IT manager configuring CORTHEX infrastructure |
| **Technical level** | Developer. Comfortable with JSON, Markdown, cron syntax, API keys, PostgreSQL |
| **Primary interface** | Admin panel (`/admin`), Soul editor (markdown-source), ARGOS scheduler, Costs dashboard |
| **Core frustration** | Vague error messages. No audit trail. Can't see what an agent actually sent to Claude. |
| **Core delight** | Full activity log with tool call parameters visible. A/B test framework for Soul optimization. Per-agent cost breakdown. |
| **Device** | Desktop, dual monitors, keyboard-first workflow |

**Critical design implication:** Admin panel can tolerate higher information density. Tables preferred over cards for list views. Soul editor must render raw Markdown. ARGOS must display actual cron expressions, not abstracted "schedules."

---

## 4. Emotional Design Direction

### Target Emotional Journey

```
Login → Hub opened → Command issued → Waiting → Report received → NEXUS reviewed
  ↓          ↓             ↓              ↓             ↓                ↓
Secure   In-control    Decisive       Trusting      Impressed         Confident
```

### Emotional Mapping Per Feature Area

| Emotion | Feature Area | Design Mechanism |
|---------|-------------|-----------------|
| **Secure** | Login page | White background (`#FFFFFF`), indigo-600 CTA (`#4F46E5`), no dark chrome at entry. Trust before immersion. |
| **In-control** | Hub, Tracker | Command bar at bottom of viewport. Agent output occupies 80% of screen. Real-time elapsed timer always visible. |
| **Decisive** | Hub input | Slash command autocomplete appears within 100ms. @mention resolves agent names instantly. |
| **Trusting** | Handoff Tracker | Full delegation chain displayed: `비서실장 (14s) → 분석팀장 (38s) → 종목분석 전문가 (current)`. No black boxes. |
| **Impressed** | Agent report output | Rich Markdown rendering: tables, code blocks, numbered lists. Reports formatted like professional deliverables. |
| **Confident** | Costs, Performance | Real numbers, real token costs, real errors. Amber-400 budget alerts appear before limits hit, not after. |

### Emotions That Must NEVER Appear in CORTHEX

| Banned Emotion | Banned Pattern | Example to Avoid |
|----------------|---------------|------------------|
| **Playful** | Rounded blobs, confetti animations, pastel colors | No celebration animations on task completion |
| **Chatbot-like** | Full-width bubble layout, "How can I help you today?" | Never use conversational placeholder text |
| **Cluttered** | Notification badges on every icon, collapsible-everything | No unread dot on NEXUS nav if nothing requires attention |
| **Toy-like** | Particle effects, lottie animations, bouncy transitions | Hub output renders text directly, no typing dot animation |
| **Anxious** | Progress bars with no percentage, indefinite spinners >10s | Always show elapsed seconds: "작업 중 · 47초 경과" |

---

## 5. Brand Personality

### Voice & Tone

**Register:** Authoritative, precise, respectful. Korean formal 존댓말 throughout.

| Context | Banned (chatbot voice) | Required (command center voice) |
|---------|----------------------|--------------------------------|
| Hub placeholder | "무엇을 도와드릴까요?" | "명령을 입력하세요 — / 를 입력하면 슬래시 명령어" |
| Agent working | "에이전트가 열심히 일하고 있어요 🎉" | "에이전트 작업 중 · 23초 경과" |
| Task complete | "완료! 수고하셨어요 ✅" | "작업 완료 — 보고서를 확인하세요" |
| Delete confirm | "삭제할까요?" | "삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다." |
| Error message | "이런! 문제가 발생했어요" | "실행 실패: 도구 응답 시간 초과 (TOOL_TIMEOUT)" |
| Empty state | "아직 에이전트가 없어요!" | "에이전트를 생성하여 조직을 구성하세요" |

**Button label rules:** Imperative verb only: "저장", "삭제", "배포", "실행", "생성" — never "저장하기", never English "Yes/No" in Korean UI.

**Error message format:** `[상황]: [원인] (ERROR_CODE)` — always include the machine-readable code for admin debugging.

### Visual Metaphors

**Macro — Command Bridge** (layout structure):
- Hub = captain's chair: one seat, full-viewport command visibility
- Sidebar = instrument panel: persistent, accurate, never collapsed mid-task
- NEXUS canvas = tactical map: entire organization visible at once
- Costs dashboard = fuel gauge: always showing resource consumption

**Micro — Neural Constellation** (NEXUS visual language):
- Agents are stars: luminosity scales with Tier level (Tier 1 = brightest)
- Handoff chains are light edges: drawn when delegation occurs, dimmed when complete
- Active agents pulse: `opacity: 0.7 → 1.0` over 1.5s ease-in-out cycle
- Department clusters: `border border-violet-400/20 rounded-3xl` — soft gravitational boundary, not a hard box

**What is explicitly NOT the visual metaphor:** Corporate org-chart boxes (static), chat bubbles (wrong interaction model), dashboard tile grids (fragments attention).

### Color Palette

Colors communicate system state, hierarchy, and urgency — **never decoration**.

**Primary backgrounds (structural authority):**

| Role | Hex | Tailwind | Emotional function |
|------|-----|----------|--------------------|
| Page background | `#020617` | `slate-950` | Depth, authority, focus |
| Card / panel | `#0F172A` | `slate-900` | Contained workspace |
| Elevated surface | `#1E293B` | `slate-800` | Interactive surface, table row hover |
| Border / divider | `#334155` | `slate-700` | Quiet structural delineation |
| Input background | `#0F172A` | `slate-900` | Form fields, editors |

**Text hierarchy (information weight):**

| Role | Hex | Tailwind | Application |
|------|-----|----------|-------------|
| Primary text | `#F8FAFC` | `slate-50` | All headings, primary labels, report body |
| Secondary text | `#94A3B8` | `slate-400` | Metadata, timestamps, secondary labels |
| Tertiary text | `#475569` | `slate-600` | Placeholder, disabled text |

**Semantic accent colors (each color owns exactly one meaning — never decorative):**

| State / meaning | Hex | Tailwind | Exclusive ownership |
|-----------------|-----|----------|---------------------|
| Active / Primary CTA | `#22D3EE` | `cyan-400` | Selected nav, primary button ring, active agent indicator |
| Handoff / Delegation | `#A78BFA` | `violet-400` | Job cards, delegation badges, Handoff Tracker edges |
| Success / Complete | `#34D399` | `emerald-400` | Task complete, agent done, upload success, ARGOS success |
| Warning / Budget | `#FBBF24` | `amber-400` | Secretary tier badge, cost approaching limit, budget alert |
| Error / Critical | `#F87171` | `red-400` | Failed tasks, overdue ARGOS, permission denied, stream error |
| Working / In-progress | `#60A5FA` | `blue-400` | Streaming response, agent actively executing |
| NEXUS canvas background | `#040D1A` | custom | Deep navy — isolates NEXUS from app chrome |

**Card gradient pattern (established in codebase, preserved):**
```css
.card { @apply rounded-2xl bg-gradient-to-br from-{color}-600/15 via-slate-800/80 to-slate-800/80; }
```

**Login page exception (per technical spec):**

| Element | Hex | Tailwind |
|---------|-----|----------|
| Login background (light) | `#FFFFFF` | `white` |
| Login background (dark) | `#09090B` | `zinc-950` |
| Primary login CTA | `#4F46E5` | `indigo-600` |

**Color discipline rules (Vignelli-derived):**
- Maximum 2 semantic accent colors visible on any single screen simultaneously
- Status colors are never decorative (cyan must always mean "active")
- No gradient backgrounds on primary content areas (gradient reserved for card depth signal only)

### Typography Personality

Following **Massimo Vignelli's** canonical constraint: maximum 2 typefaces.

**Typeface 1 — Inter (UI primary):**
```
font-family: 'Inter', 'Helvetica Neue', sans-serif;
Rationale: Digital-native successor to Helvetica. Same Swiss International Style
philosophy: neutral, structured, legible from 11px to 48px.
Vignelli used Helvetica for universality — Inter delivers that universality for screens.
```

| Usage context | Weight | Size | Tailwind |
|---------------|--------|------|----------|
| Page heading / Hub title | 700 Bold | 24px | `text-2xl font-bold` |
| Section heading | 600 SemiBold | 18px | `text-lg font-semibold` |
| Card title / Agent name | 500 Medium | 14px | `text-sm font-medium` |
| Body / report copy | 400 Regular | 14px | `text-sm` |
| Caption / timestamp | 400 Regular | 12px | `text-xs` |
| Sidebar nav label | 500 Medium | 13px | `text-[13px] font-medium` |
| Status badge text | 500 Medium | 11px | `text-[11px] font-medium uppercase tracking-wide` |
| Table header | 500 Medium | 12px | `text-xs font-medium uppercase tracking-wider text-slate-400` |

**Typeface 2 — JetBrains Mono (technical contexts only):**
```
font-family: 'JetBrains Mono', 'Fira Code', monospace;
Rationale: Soul editor, tool call parameters (JSON), Hub slash command prefix,
cost numbers. Instantly signals "technical context" — style contrast
communicates content type without labels. Ligatures ON.
```

| Usage context | Weight | Size | Tailwind |
|---------------|--------|------|----------|
| Soul editor content | 400 Regular | 13px | `font-mono text-[13px]` |
| Tool call card parameters | 400 Regular | 12px | `font-mono text-xs` |
| Hub slash command prefix | 500 Medium | 14px | `font-mono text-sm font-medium` |
| Cost / token numbers (tabular) | 400 Regular | 12px | `font-mono text-xs tabular-nums` |
| Agent / session IDs | 400 Regular | 11px | `font-mono text-[11px] text-slate-500` |

**Typography rules:**
- `leading-relaxed` (1.625) for report body; `leading-tight` (1.25) for headings
- All cost, token, count numbers: `tabular-nums` (prevents layout shift during live updates)
- Never use `font-light` (300) or `font-thin` (100) on dark backgrounds (insufficient contrast)
- Inter and JetBrains Mono never mix within the same text block — context switch = typeface switch

---

## 6. Feature Hierarchy

All 30+ features ranked by visibility and access frequency. Drives sidebar architecture, icon size, and information priority.

### P0 — Always Visible (primary sidebar, one click from anywhere)

| Feature | Korean label | Icon | Primary user |
|---------|-------------|------|-------------|
| Hub (Command Center) | 허브 | 24px solid terminal | CEO: default landing, command issuance |
| NEXUS (Org Chart) | 넥서스 | 24px solid network node | CEO: organization view and edit |
| Dashboard | 대시보드 | 24px solid chart bars | CEO: live metrics pulse |
| Chat (direct sessions) | 채팅 | 24px solid message | CEO: single-agent direct conversation |

### P1 — One Click Away (primary sidebar, second group)

| Feature | Korean label | Primary user |
|---------|-------------|-------------|
| Agents | 에이전트 | CEO + Admin: individual agent CRUD, Soul editing |
| Departments | 부서 | Admin: department CRUD, scoping config |
| Jobs / ARGOS | 잡 · 아르고스 | Admin: cron scheduler, job history |
| Reports | 보고서 | CEO: past Hub outputs, searchable archive |

### P2 — Secondary Navigation (collapsible "도구" section)

| Feature | Korean label | Primary user |
|---------|-------------|-------------|
| SNS Manager | SNS 관리 | CEO: social media AI tools |
| Trading | 트레이딩 | CEO: stock/investment module |
| Messenger | 메신저 | CEO: inter-agent communication log |
| Library (Knowledge) | 라이브러리 | CEO: pgvector semantic knowledge search |
| AGORA (Debate) | 아고라 | CEO: multi-agent structured debate |
| Files | 파일 | CEO: attachment management |

### P3 — Power User / Admin (collapsible "관리" section or admin-panel-only)

| Feature | Korean label | Access level |
|---------|-------------|-------------|
| Costs | 비용 | Admin |
| Performance | 성과 | Admin |
| Activity Log | 활동 로그 | Admin |
| Settings | 설정 | Admin |
| Classified | 기밀 | Admin |
| Tiers | 티어 | Admin |
| Ops Log | 운영 로그 | Admin |

### Navigation Architecture Rules

| Element | Value | Tailwind |
|---------|-------|----------|
| Sidebar width | 280px fixed | `w-[280px] flex-shrink-0` |
| Active state | Left border + cyan tint | `bg-cyan-400/10 border-l-2 border-cyan-400 text-cyan-400` |
| Inactive state | Slate, hover brightens | `text-slate-400 hover:text-slate-200 hover:bg-slate-800/50` |
| Section divider | — | `border-t border-slate-700/50 my-2` |
| P2/P3 group header | `text-[11px] font-medium uppercase tracking-wider text-slate-600` | — |

---

## 7. Competitive Positioning

### CORTHEX vs. All Alternatives

| Dimension | ChatGPT Teams | Slack + AI plugins | Linear + AI | Custom AI | **CORTHEX** |
|-----------|--------------|-------------------|-------------|-----------|------------|
| Org structure | Single bot | Channels ≠ org | Projects ≠ agents | Hardcoded | **Dynamic CRUD by admin** |
| Delegation | None | None | None | Code-defined | **N-tier Handoff chains, real-time Tracker** |
| Domain tools | Generic | Plugin-dependent | Dev-only | Custom only | **125+ tools: finance, legal, marketing** |
| Behavior control | One system prompt | None | None | Requires dev | **Per-agent Soul, UI-editable, instant** |
| Org visual | None | None | None | Custom build | **NEXUS — drag-and-drop = live routing** |
| Cost transparency | Opaque | Opaque | Opaque | Custom | **Real token cost per agent, per session** |
| Primary user | Knowledge worker | Teams | Dev/PM | Requires IT | **CEO — zero code required** |

### The Unique Value Statement

```
CORTHEX is the only platform where editing the org chart
changes how AI executes — without a single line of code.

Create a department → agents in it start receiving work.
Edit a Soul → that agent's expertise changes in the next command.
Draw a delegation edge → that routing path activates immediately.

No deployment. No restart. No engineer.
```

---

## 8. Design Principles

Seven governing principles for all future design decisions.

---

### Principle 1: Show the Org, Not the AI

**Rule:** NEXUS-first navigation. The organizational structure is the primary UI object — not the chat window.

| DO | DON'T |
|----|-------|
| Link every agent name in Hub output to its NEXUS node | Open Hub with no org context visible |
| Show department badge on every agent card and delegation chain entry | Show only "AI replied" with no attribution |
| Make NEXUS one click from Hub (persistent sidebar link) | Bury NEXUS under Admin → Organization |

---

### Principle 2: Command, Don't Chat

**Rule:** Hub is a command interface. Every affordance reinforces authority, not friendliness.

| DO | DON'T |
|----|-------|
| Place command input at bottom of viewport, output fills 80% above | Center chat bubbles with equal send/receive visual weight |
| Placeholder: "명령을 입력하세요 — / 슬래시 명령어" | Placeholder: "무엇을 도와드릴까요?" |
| Show delegation chain in real-time below command output | Show only a generic "thinking" spinner |

---

### Principle 3: State Is Sacred

**Rule:** Every agent, job, and delegation must show its exact live state at all times.

| State | Visual treatment | Tailwind |
|-------|-----------------|----------|
| Working | Blue pulsing dot + elapsed seconds (JetBrains Mono) | `bg-blue-400 animate-pulse` + `font-mono text-xs` |
| Complete | Static emerald dot | `bg-emerald-400` |
| Failed | Static red dot + error code | `bg-red-400` |
| Queued | Static slate dot | `bg-slate-600` |
| Delegating | Pulsing violet dot | `bg-violet-400 animate-pulse` |

| DO | DON'T |
|----|-------|
| "에이전트 작업 중 · 47초 경과" with live timer | "로딩 중..." |
| Real-time cost accumulation during execution | Final cost shown only after completion |

---

### Principle 4: Density Without Clutter

**Rule:** Information density is a feature, not a problem. Professional tool, professional users.

| DO | DON'T |
|----|-------|
| Agent card row: name + tier badge + status + elapsed — 56px height | One metric per card with Instagram-sized padding |
| `text-xs tabular-nums font-mono` for all cost/token numbers | Large font for numbers to look "dashboard-y" |
| `gap-2` within card section; `gap-8` between card groups (Gestalt proximity) | Equal spacing everywhere |

---

### Principle 5: One Primary Action Per Screen

**Rule (Dieter Rams — "As little design as possible"):** Every page has exactly one primary CTA.

| Priority | Style | Tailwind |
|----------|-------|----------|
| **Primary** | Filled, cyan | `bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-lg` |
| **Secondary** | Outlined, cyan | `border border-cyan-400/50 text-cyan-400 px-4 py-2 rounded-lg` |
| **Tertiary** | Ghost, slate | `text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded` |
| **Destructive** | Soft red | `bg-red-400/10 text-red-400 border border-red-400/30 px-4 py-2 rounded-lg` |

---

### Principle 6: The Grid Is the Law

**Rule (Müller-Brockmann — Grid Systems in Graphic Design):** All elements align to a 12-column grid.

| Layout zone | Value | Tailwind |
|-------------|-------|----------|
| Sidebar | 280px fixed | `w-[280px] flex-shrink-0` |
| Content area | `calc(100vw - 280px)` | `flex-1` |
| Max content width | 1440px | `max-w-[1440px] mx-auto` |
| Content grid | 12 columns, 24px gutter | `grid grid-cols-12 gap-6` |
| Card internal padding | 24px | `p-6` |
| Section vertical padding | 32px | `py-8` |
| Base spacing unit | 4px | All spacing in multiples of 4px |

NEXUS canvas deliberately breaks this grid (full-bleed) — the break is **obvious and intentional** (Brockmann: "When breaking grid, do so deliberately and obviously").

---

### Principle 7: Soul Is Never Hidden

**Rule:** Agent Souls are the core configuration. Every visible agent must link directly to its Soul.

| DO | DON'T |
|----|-------|
| Agent name in Hub output → direct link to Soul editor | Soul editor buried under Admin → Agents → Edit → Advanced |
| Show first 200 chars of Soul in agent hover tooltip | No indication that the agent has a Soul |
| Diff view when Soul is edited (before/after side-by-side) | Overwrite Soul without version history |

---

## 9. Design Masters Alignment

### Dieter Rams — "Less, But Better" (Weniger, aber besser)

Applied from the Design Masters SKILL.md "Ten Principles of Good Design":

| Rams' Principle | CORTHEX Application | Anti-pattern rejected |
|-----------------|--------------------|-----------------------|
| **Useful** | Hub serves one purpose: command the org. Every element earns its place. | Decorative illustrations, empty hero sections |
| **Understandable** | Tier badges (color-coded), status dots (8px consistent), dept grouping — self-explanatory | Unlabeled icons requiring hover to understand |
| **Unobtrusive** | During Hub streaming, chrome minimizes — output dominates the viewport | Sidebar expanding into content area during active streaming |
| **Honest** | Real costs shown in real-time. Agent state is accurate. Never "Online" for offline. | "Processing..." for 90s with no progress information |
| **Long-lasting** | Swiss Grid layout, 2-font constraint, semantic colors — not tied to 2025 trend cycle | Glassmorphism-first UI that will look dated by 2027 |
| **Thorough** | Every error state designed. Every loading state specified. Every empty state has a directive. | Uncaught errors showing `undefined` in the UI |
| **As Little Design As Possible** | NEXUS nodes: `[icon] [name] [tier badge]` — nothing else | Nodes with color fills, drop shadows, avatar photos, and 4 badges |

**The Rams Test for every CORTHEX component:**
1. Can this element be removed without losing function? → Remove it.
2. Does this serve the CEO or the designer's ego? → If the latter, remove it.
3. Will this look embarrassing in 5 years? → If yes, don't ship it.

### Massimo Vignelli — Constrained Typography and Visual Discipline

Applied from Design Masters SKILL.md "The Vignelli Canon":

**Typeface constraint** (Vignelli used only 5 typefaces his entire career — CORTHEX uses 2):
- Inter: Universal clarity (his Helvetica equivalent for screens)
- JetBrains Mono: Technical precision (context-switch signal)

**Vignelli's Semantics/Syntactics/Pragmatics framework:**

| Framework layer | CORTHEX application |
|----------------|---------------------|
| **Semantics** — What does it mean? | Inter = structured, neutral, universal authority. JetBrains Mono = technical, precise, machine-readable. |
| **Syntactics** — How is it structured? | 4-level weight hierarchy: 700/600/500/400 only. No intermediate weights. |
| **Pragmatics** — How does it function? | Dark bg → lighter weights preferred (400-500). Bold only for headings above 18px. |

**Vignelli's "Ambiguity: Eliminate it":** No element has an unclear purpose. Every color means exactly one thing. Every icon is labeled. Every empty state tells the user exactly what action to take.

**Vignelli's constraint exercise** (from SKILL.md) applied to CORTHEX:
- 2 fonts (Inter, JetBrains Mono) ✅
- 7 semantic colors (never decorative) ✅
- 8 spacing steps (4/8/16/24/32/48/64px multiples) ✅

### Josef Müller-Brockmann — Grid Philosophy

Applied from Design Masters SKILL.md "Grid Construction" and "Grid Systems in Graphic Design":

**CORTHEX grid system (exact CSS/Tailwind values):**

```
┌─[280px sidebar]──────────────────────────────────────────────────────┐
│ P0 nav (always visible)                                              │
│ P1 nav (always visible)                                              │
│ [divider border-t border-slate-700/50 my-2]                          │
│ ▼ 도구 [P2 collapsible]                                             │
│ ▼ 관리 [P3 collapsible]                                             │
└──────────────────────────────────────────────────────────────────────┘

Content area: 12-column, 24px gutter, 32px top/bottom padding
┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐  col-span-12 (full-width: page heading, tables)
├──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┤
│        col-span-8          │ col-4 │  Hub: command output | Tracker sidebar
├──────────────────────────────────────┤
│  col-4  │  col-4  │  col-4  │       Dashboard: 3 metric cards per row
├──────────────────────────────────────┤
│     col-6     │     col-6     │       2-column layouts (chart | summary)
└──────────────────────────────────────┘

NEXUS canvas: col-span-12, height: calc(100vh - 64px) — deliberate full-bleed grid break
```

```css
/* Exact Tailwind values */
.page-layout   { @apply flex h-screen bg-slate-950; }
.sidebar       { @apply w-[280px] flex-shrink-0 border-r border-slate-700/50; }
.content       { @apply flex-1 overflow-auto; }
.content-grid  { @apply grid grid-cols-12 gap-6 p-8 max-w-[1440px] mx-auto; }

.col-full      { @apply col-span-12; }
.col-main      { @apply col-span-8; }   /* Hub output */
.col-aside     { @apply col-span-4; }   /* Hub Tracker */
.col-third     { @apply col-span-4; }   /* Dashboard metric cards */
.col-half      { @apply col-span-6; }   /* 2-col layouts */
.col-quarter   { @apply col-span-3; }   /* 4-col compact grids */
```

### Saul Bass — Geometric Reduction for Icons and Logo

Applied from Design Masters SKILL.md "Geometric Reduction: Complex ideas → simple shapes":

**CORTHEX icon language:**

| Feature | Core concept | Geometric reduction |
|---------|-------------|---------------------|
| Hub | Command terminal | Square bracket + cursor `[_]` |
| NEXUS | Neural network center | Circle with 3 radiating spokes at 120° |
| Dashboard | Overview at a glance | Three bars ascending left-to-right |
| Agents | Individual AI entity | Circle with concentric inner ring (Tier ring) |
| Departments | Grouped agents | Three small circles under one arc |
| Handoff/Tracker | Delegation chain | Arrow through linked circles |
| Library | Knowledge search | Open book + magnifying lens overlay |
| AGORA | Debate | Two speech shapes facing each other |

**Logo direction (Saul Bass "Geometric Reduction" + Paul Rand "Logo Philosophy"):**

The CORTHEX mark is a **single geometric form** derived from the NEXUS metaphor:
- A circle (central command node) with three connection spokes radiating at 120° intervals
- Three spokes imply: Hub (command), NEXUS (organization), Library (knowledge)
- Negative space between spokes implies branches without drawing them (Bass: "Negative Space: What's left out tells the story")
- Single color: `#22D3EE` (cyan-400) on `#020617` (slate-950) — maximum contrast
- Works at 16px favicon and 200px header (Paul Rand's "Visible: Works at any size" criterion)

---

## 10. Design Movement Selection

### Evaluation: Three Candidate Movements

**Movement A: Swiss International Style (1950s–1970s)**

_From Design Movements SKILL.md: "Objective communication through mathematical order"_
_Key figures: Josef Müller-Brockmann, Max Bill, Armin Hofmann, Emil Ruder_

Visual characteristics: Helvetica, asymmetric grid, generous white space, flush-left text, limited 1-accent palette, zero decorative ornament.
Emotional register per SKILL.md: "Professional, trustworthy, clear, international."

CORTHEX fit analysis:
- Grid discipline ✅ — CORTHEX requires absolute grid precision for a command interface
- Typography authority ✅ — Inter is Helvetica's digital heir; same neutrality, same universality
- Limited palette ✅ — Vignelli's 1-accent rule derived from Swiss Style; CORTHEX's semantic color system complies
- Flush-left text ✅ — Report output, agent cards, activity logs all read left-to-right
- Zero decoration ✅ — Rams + Swiss Style converge: no ornament without communicative purpose
- Asymmetric balance ✅ — Hub 80/20 split, Dashboard 3-col asymmetric layout

Risk: Can feel clinical. Mitigated by NEXUS constellation visual and cyan/violet accent warmth.

**Movement B: Contemporary Flat / Material Design (2010s–present)**

_From Design Movements SKILL.md: "Digital should look digital" — now the baseline_

Emotional register: Accessible, friendly, consumer-grade.

CORTHEX fit analysis:
- Accessible ✅ — flat clarity is inherently accessible
- Too consumer-grade ❌ — Material speaks to everyone; CORTHEX speaks to CEOs commanding an org
- Lacks gravitas ❌ — "friendly and approachable" conflicts with "authoritative command center"
- Light-default ❌ — dark-first is non-negotiable for CORTHEX's professional context

Verdict: WCAG accessibility principles adopted. Overall aesthetic rejected.

**Movement C: Neo-Brutalism (2020s)**

_From Design Movements SKILL.md: linked to Grunge/Deconstructivism revival cycle_

Emotional register: Raw, direct, tech-forward, anti-corporate.

CORTHEX fit analysis:
- Directness ✅ — "command, don't chat" aligns with Neo-Brutalism's directness
- Raw aesthetic ❌ — conflicts with CEO persona in Korean business culture (expects polish)
- Offset shadows / thick borders ❌ — visually aggressive; distracts from agent output
- Anti-corporate ❌ — CORTHEX is building a corporate command tool for executives

Verdict: The directness principle is adopted as a tone rule (Principle 2). Visual aesthetic rejected.

---

### Selected Movement: Swiss International Style — Dark Mode Adaptation

**Justification:** Swiss International Style is the only movement that combines mathematical grid discipline, typographic authority, limited-palette constraint, and professional/trustworthy emotional register needed for a CEO-facing command platform in Korean B2B context. It is also the movement most directly aligned with Vignelli (typographic discipline) and Brockmann (grid systems) — the two Design Masters most influential on CORTHEX's visual system.

**The dark-mode adaptation rules:**

| Swiss Style original | CORTHEX dark adaptation | Rationale |
|---------------------|------------------------|-----------|
| White ground (#FFF) | `#020617` slate-950 | Same neutrality, different luminosity value |
| Black type (#000) | `#F8FAFC` slate-50 | Maximum contrast on dark ground |
| Red accent (single) | `#22D3EE` cyan-400 | Single primary accent = Swiss 1-accent rule. Cyan = "active/technology" in dark-tech context |
| Helvetica Neue | Inter (variable) | Identical Swiss philosophy, screen-optimized |
| Print grid | 12-col CSS grid, 24px gutter | Mathematical order applied to viewport |
| Flush-left alignment | Left-aligned in all list/table views | Swiss Style never centers informational text |
| Generous white space | `py-8` section, `p-6` card | "Dark space" = functionally identical to print white space |

**Why dark adaptation is valid:** Swiss International Style is about mathematical order and objective communication — not about the color of the paper. The values (order, clarity, restraint) are preserved; the light/dark polarity inverts.

---

## 11. Visual Hierarchy Rules

### Gestalt Principles Applied to CORTHEX Layouts

Applied from Design Principles SKILL.md — "The fundamental laws governing visual perception."

**Proximity — Card grouping:**

```
CORRECT: Hub output cards
┌────────────────────────────────────────────────────────────┐
│ 분석팀장   [TIER 1]   ● working   23s   ← 8px (gap-2) internal
│                                                            │
│ 삼성전자 3분기 실적 분석 보고서   ← 16px (gap-4) from header
│ 매출액: ₩79.4조 (+12.4% YoY)...                           │
└────────────────────────────────────────────────────────────┘
                   ↕ 32px (gap-8) between card groups
┌────────────────────────────────────────────────────────────┐
│ SNS 전문가   [TIER 2]   ● complete   41s                   │
└────────────────────────────────────────────────────────────┘

Tailwind: space-y-2 within, gap-4 from header-to-body, space-y-8 between groups
```

**Similarity — Status indicators are system-wide constants:**

```css
/* Universal status dot — same component used everywhere (Hub, NEXUS, ARGOS, Activity Log) */
.status-dot        { @apply rounded-full flex-shrink-0 inline-flex; }
.status-working    { @apply w-2 h-2 bg-blue-400 animate-pulse; }
.status-complete   { @apply w-2 h-2 bg-emerald-400; }
.status-failed     { @apply w-2 h-2 bg-red-400; }
.status-queued     { @apply w-2 h-2 bg-slate-600; }
.status-delegating { @apply w-2 h-2 bg-violet-400 animate-pulse; }
```

From SKILL.md: "Elements that look alike appear grouped." — If blue-400 means "working" in Hub, it means "working" everywhere.

**Continuity — Navigation flow:**

Sidebar flows top → bottom in explicit priority order: P0 → P1 → P2 → P3. Section headers (`도구`, `관리`) create visual pauses without breaking continuous downward flow. No horizontal navigation groupings — continuity requires a single axis.

**Closure — Card boundaries:**

Cards use `rounded-2xl` (16px radius) — rounded corners imply closure without a heavy border. Partial closure: the last visible card in a scrollable list bleeds off at 50% height (no bottom border), implying more content exists below without requiring a "더 보기" button.

**Figure/Ground — Content vs. Chrome:**

Agent report output = **figure**. Hub chrome = **ground**.
- Report text: `text-slate-50` (20.1:1 contrast — maximum)
- Hub input bar: `bg-slate-900/80 backdrop-blur-sm` (retreats during reading)
- This contrast creates automatic figure/ground separation — no border or shadow needed.

### Golden Ratio — Sidebar:Content Proportion

From Design Principles SKILL.md: "Proportions found in nature feel inherently pleasing. Applications: Content width to sidebar: 1:1.618."

```
Sidebar: 280px
Standard desktop: 1440px viewport
Content: 1440 - 280 = 1160px
Ratio: 1160 / 280 = 4.14 ≈ φ³ (φ = 1.618, φ³ ≈ 4.236)

Hub layout within content (golden ratio approximation):
  Main output: 8/12 cols = 66.7% ≈ φ/(1+φ) = 61.8%
  Tracker aside: 4/12 cols = 33.3% ≈ 1/(1+φ) = 38.2%
```

**Typography scale (golden ratio approximation):**
```
Body:      14px (base)
Section h: 18px (×1.286 — Fibonacci step)
Page h:    24px (×1.333 — 4/3 approximation)
Display:   32px (×1.333 — next step)
```

### Contrast Rules

**Size contrast (from SKILL.md: "Scale: Larger = more important"):**

| Element pair | Size ratio | Example |
|-------------|-----------|---------|
| Page heading vs. caption | 24px : 12px = 2:1 | Hub report section title vs. timestamp |
| Section heading vs. body | 18px : 14px = 1.29:1 | "작업 결과" vs. report body |
| Agent name vs. tier badge | 14px : 11px = 1.27:1 | "투자분석처장" vs. "TIER 1" |

**Color contrast (WCAG AA — from SKILL.md: "Body text: 4.5:1 ratio minimum"):**

| Text color | Background | Ratio | Status |
|-----------|-----------|-------|--------|
| `#F8FAFC` slate-50 | `#020617` slate-950 | 20.1:1 | ✅ AAA |
| `#94A3B8` slate-400 | `#020617` slate-950 | 5.9:1 | ✅ AA |
| `#22D3EE` cyan-400 | `#020617` slate-950 | 9.1:1 | ✅ AAA |
| `#A78BFA` violet-400 | `#020617` slate-950 | 8.2:1 | ✅ AAA |
| `#34D399` emerald-400 | `#020617` slate-950 | 8.9:1 | ✅ AAA |
| `#F87171` red-400 | `#020617` slate-950 | 5.4:1 | ✅ AA |
| `#475569` slate-600 | `#020617` slate-950 | 3.1:1 | ⚠️ Large text only (disabled/placeholder — compliant) |

**Weight contrast (from SKILL.md: "Weight: Heavier = more important"):**

| Context | Weight | Rule |
|---------|--------|------|
| Heading ≥20px on dark | `font-bold` (700) | Maximum authority |
| Section heading 16–20px | `font-semibold` (600) | Clear hierarchy step |
| UI labels, nav items | `font-medium` (500) | Interactive affordance |
| Body / report copy | `font-normal` (400) | Reading comfort |
| `font-light` (300) | **BANNED on dark bg** | Insufficient contrast |

### White Space Strategy

From Design Principles SKILL.md: "What you leave empty is as important as what you fill."

**Padding scale (4px base unit):**

```
Micro    (inline related):    4px  → p-1  / gap-1
Compact  (within component):  8px  → p-2  / gap-2
Standard (list items):       16px  → p-4  / gap-4
Card     (card padding):     24px  → p-6
Section  (between sections): 32px  → py-8 / gap-8
Major    (structural break): 48px  → py-12
Full     (modal/login):      64px  → p-16
```

**Section heading spacing (asymmetric — more above than below):**

```css
/* Universal section heading rule */
h2.section-heading { @apply mt-8 mb-4 text-lg font-semibold text-slate-50; }
/* mt-8 (32px above) = "new section starts here" */
/* mb-4 (16px below) = "this heading belongs to the content following" */
```

**Isolation as emphasis (from SKILL.md: "Isolated elements command attention"):**
- Hub primary CTA: `mt-4 px-6 py-3` — generous, centered in command bar
- Dashboard hero metric: `text-4xl font-bold p-8` — solo in its card
- Error state in Hub: `bg-red-400/10 border border-red-400/30 rounded-xl p-4` — isolated from report output

---

## Appendix A: Terminology Reference

All UI copy must use these exact terms. Deviations are defects.

| Feature name | Korean UI label | Banned synonyms |
|-------------|----------------|----------------|
| Hub | 허브 | 사령관실, 채팅방, 대화창, 메신저 |
| NEXUS | 넥서스 | 조직도, 에이전트 목록, 그래프 |
| Handoff | 핸드오프 | 위임, 전달, 분배 |
| Tracker | 트래커 | 위임 추적, 사이드바, 상태창 |
| Library | 라이브러리 | 정보국, 지식 DB, 문서함 |
| Tier | 티어 | 계급, 등급, 레벨, 랭크 |
| Soul | 소울 | 프롬프트, 설정, 성격, 시스템 프롬프트 |
| ARGOS | 아르고스 | 크론잡, 스케줄러, 자동화 |
| Secretary | 비서 / 비서실장 | 라우터, 챗봇, AI, 어시스턴트 |
| AGORA | 아고라 | 토론, 다중 에이전트 채팅 |
| Department | 부서 | 팀, 그룹, 조직, 섹션 |

---

## Appendix B: Decision Log

| Decision | Rationale |
|----------|-----------|
| Inter over Pretendard | Inter handles mixed Korean/Latin/mono context at small sizes better. Pretendard excels for Korean editorial; CORTHEX needs technical label density. |
| Swiss International Style over Neo-Brutalism | Korean CEO persona requires polish and trustworthiness. Neo-Brutalism's raw aesthetic conflicts with the "authoritative professional" target register. |
| Cyan-400 as primary active accent | Cyan signals "digital/active" in dark contexts. Blue-400 reserved for "working/in-progress" — avoids visual collision between primary CTA and agent status. |
| 280px sidebar | Golden ratio harmonic with 1440px viewport: 1160/280 ≈ φ³. 240px creates 5:1 ratio (too extreme); 280px achieves a natural 4.14:1. |
| Flush-left text throughout | Swiss International Style: centering is for display/marketing. Data, reports, navigation = always flush-left. |
| No dark-mode toggle in primary app | CORTHEX is dark-first. Light theme is exclusively for login and landing. A toggle would split QA effort and contradict the command-center visual identity. |

---

_End of CORTHEX Vision & Identity Document v2.0_
_Phase 0-2 complete. Next: Phase 1 — Research (landing page, web dashboard, app layouts)._
