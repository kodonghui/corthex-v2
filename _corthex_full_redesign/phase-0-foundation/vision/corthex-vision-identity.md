# CORTHEX v2 — Vision & Identity Document

_Design philosophy, brand direction, and aesthetic principles for the UXUI redesign._
_Grounded in real product surfaces. Zero placeholders._

---

## 1. Product Vision

### What CORTHEX Is

CORTHEX is a **B2B AI organizational management platform**. Companies build internal AI agent organizations — departments, hierarchies, tiers — and interact with them through a unified command interface. It is not a chatbot. It is not an AI assistant. It is an **organizational operating system** where every AI agent has a role, a rank, and a purpose.

The platform has three surfaces:

| Surface | Audience | Primary Job |
|---------|----------|-------------|
| **User App** (`/`) | Employees using the AI org daily | Command agents, monitor activity, review reports |
| **Admin Panel** (`/admin`) | Company admins building the AI org | Create agents, set tiers, manage credentials, configure MCP tools |
| **Landing Page** | Prospective customers | Understand CORTHEX's value, sign up |

### The Core Problem Solved

Most organizations experimenting with AI have a fragmentation problem: one team uses Claude, another uses GPT, a third has a custom bot — with no organizational coherence. CORTHEX solves this by giving AI agents:

1. **Ranks (Tiers)** — Manager (tier 1) delegates to Specialists (tier 2) who delegate to Workers (tier 3)
2. **Departments** — Agents grouped by function (Marketing, Engineering, Finance)
3. **Memory (Soul)** — Each agent has a persistent system prompt + knowledge base
4. **Tools** — Real-world integrations (web search, MCP, API calls)

The user doesn't prompt an AI. They command their organization.

### Who It's For

**Primary persona:** Mid-size Korean companies (50–500 employees) building AI-assisted internal operations — marketing automation, report generation, research, monitoring, scheduled intelligence gathering. The operator is typically a **C-suite executive or department head** who configures agents to run tasks autonomously on their behalf.

**Mental model the UI must reinforce:** A command room. The user is the commander. Agents report to them. The interface should feel like a well-organized ops center, not a chat app.

---

## 2. Brand Identity

### Brand Archetype: The Sovereign Sage

CORTHEX occupies the intersection of two Jungian archetypes:

**The Ruler/Sovereign** — Commands flow downward through tiers. Order, authority, organizational power. The Ruler brand communicates: "This platform lets you control something powerful." Premium, structured, commanding.

**The Sage** — Intelligence, knowledge, discernment. The Sage brand communicates: "This platform makes you smarter." Analytical, precise, trustworthy.

The combination produces a brand that is: **authoritative but not arrogant, intelligent but not cold, premium but not inaccessible**.

### Brand Personality

| Attribute | Expression | Anti-Pattern |
|-----------|-----------|--------------|
| **Authoritative** | Clear hierarchy, decisive CTA placement, no visual hesitation | Overuse of disclaimers, hedging copy |
| **Precise** | Exact numbers ("3개 에이전트", "₩12,450"), no rounded vague data | "약" (approximately), empty states with no data |
| **Dark-Intelligent** | Deep slate/navy base, luminous accent colors — like a war room at 2am | Pastels, playful gradients, consumer-app softness |
| **Structured** | Every element has a grid home. No floating orphan components | Freeform layouts, inconsistent spacing |
| **Efficient** | One click to act. Dense but scannable information | Blank space padding, decorative-only elements |

### Brand Voice (UI Copy)

| Context | Tone | Example |
|---------|------|---------|
| Empty states | Directive, not apologetic | "에이전트를 생성하여 첫 팀을 구성하세요" (not "아직 에이전트가 없어요") |
| Error messages | Clinical, precise | "인증 실패: 토큰이 만료되었습니다 (AUTH_TOKEN_EXPIRED)" |
| Loading states | Implied status | "에이전트 응답 생성 중..." — not "잠시만 기다려 주세요" |
| Success feedback | Minimal, factual | "저장되었습니다" — not "완료! 🎉" |
| CTAs | Imperative | "허브 열기", "에이전트 배정", "보고서 생성" |

Korean-first. All UI copy defaults to 존댓말 for informational text; button labels use imperative (명령형) without formal suffixes.

---

## 3. Design Philosophy

### Master Reference: Dieter Rams' Ten Principles — Applied to CORTHEX

Rams' "Ten Principles of Good Design" (Braun, 1970s) are directly applicable to enterprise SaaS:

| Rams' Principle | CORTHEX Application |
|-----------------|---------------------|
| **Good design is innovative** | Dark-mode-first at launch (2023-era expectation, not novelty) |
| **Good design makes a product useful** | Every page earns its place in the 30-route app. No decorative pages. |
| **Good design is aesthetic** | Consistent 8px grid, typographic rhythm, intentional color use |
| **Good design makes a product understandable** | Tier badges (색상 코딩), status dots (언제나 동일), department grouping |
| **Good design is unobtrusive** | Chrome fades away during Hub conversations. UI serves the work. |
| **Good design is honest** | Agent status is real-time accurate. Never show "online" for an offline agent. |
| **Good design is long-lasting** | Swiss Grid-derived layout. Not tied to any 2025 trend cycle. |
| **Good design is thorough** | Every error state designed. Every loading state present. No "undefined" in UI. |
| **Good design is environmentally friendly** | (Server-rendered where possible, SSE over polling, 3-layer cache) |
| **Good design is as little design as possible** | No decorative borders. No shadows-for-shadows-sake. Each visual element serves hierarchy. |

### Movement Reference: Swiss International Style (Grid + Type)

The **Swiss International Style** (1950s–60s, Müller-Brockmann, Vignelli) defined modern information design: mathematical grids, flush-left typography, no decoration for decoration's sake. This is the closest historical movement to enterprise dashboard design.

**Applied to CORTHEX:**
- **12-column grid** at desktop, 4-column at mobile, 8-column at tablet
- **Flush-left alignment** for all data tables, agent lists, activity logs
- **Type as primary visual element** — well-set Korean + Latin typography carries the visual weight without iconographic clutter
- **White/dark space is earned, not assumed** — every bit of padding has a structural reason

### Movement Reference: Dark Tech UI (2020s)

The contemporary "dark tech" aesthetic — popularized by Vercel, Linear, Raycast, Resend — defines CORTHEX's atmospheric direction:

- Deep `zinc-950` / `slate-900` backgrounds (not pure black)
- Subtle `slate-800` borders and card surfaces
- Luminous accent colors against the dark field (indigo, emerald, amber)
- Monospace font pairings for data/IDs/code
- Restrained motion — micro-animations only (status pulse, skeleton shimmer)

This movement is appropriate because CORTHEX's users are power users operating in professional contexts. The dark aesthetic signals seriousness and reduces eye strain during extended sessions.

### Movement Reference: Glassmorphism (Selective Use)

**Not wholesale** — glassmorphism is used only where depth-of-layer needs visual expression:
- Modal overlays: `backdrop-blur-xl bg-slate-900/80`
- Command palette (Hub input area): frosted inset against the chat background
- Tooltip/popover surfaces: translucent bleed from background

Glassmorphism is avoided for primary content surfaces (cards, tables, sidebars) — only for secondary layers that float above the primary surface.

---

## 4. Visual System Direction

### Color Philosophy

CORTHEX uses a **dark neutral base + semantic accent system**. Colors communicate function, not decoration.

#### Base Palette (Dark Theme — Primary)

| Role | Token Name | Hex (approx.) | Usage |
|------|-----------|---------------|-------|
| Page background | `bg-zinc-950` | #09090b | Full-page base |
| Surface (cards, panels) | `bg-slate-900` | #0f172a | Content containers |
| Surface elevated | `bg-slate-800` | #1e293b | Cards within panels, table rows hover |
| Border | `border-slate-700` | #334155 | Dividers, input borders |
| Text primary | `text-slate-100` | #f1f5f9 | Headings, primary labels |
| Text secondary | `text-slate-400` | #94a3b8 | Subtitles, metadata, timestamps |
| Text muted | `text-slate-500` | #64748b | Disabled states, placeholder text (4.82:1 on zinc-950 — WCAG AA pass) |

#### Accent Palette (Semantic)

| Role | Token | Tailwind Class | Usage |
|------|-------|----------------|-------|
| Primary CTA | Indigo | `bg-indigo-600` | Primary buttons, active nav items, links |
| Primary CTA hover | Indigo | `bg-indigo-700` | Button hover state |
| Secretary highlight | Amber | `bg-amber-500/15 text-amber-400` | COS badge, secretary agent identifier |
| Status: Online | Emerald | `bg-emerald-400 animate-pulse` | Agent online dot |
| Status: Working | Blue | `bg-blue-400 animate-pulse` | Agent actively processing |
| Status: Error | Red | `bg-red-400` | Agent error state |
| Status: Offline | Slate | `bg-slate-500` | Agent offline dot |
| Tier 1 (Manager) | Violet | `text-violet-400` | Tier badge for manager-level agents |
| Tier 2 (Specialist) | Sky | `text-sky-400` | Tier badge for specialist-level agents |
| Tier 3 (Worker) | Slate | `text-slate-400` | Tier badge for worker-level agents |

#### Classification Palette (Archive/Security)

| Level | Color | Classes |
|-------|-------|---------|
| public | Emerald | `bg-emerald-500/10 text-emerald-400` |
| internal | Blue | `bg-blue-500/10 text-blue-400` |
| confidential | Amber | `bg-amber-500/10 text-amber-400` |
| secret | Red | `bg-red-500/10 text-red-400` |

#### Light Theme (Secondary, for Landing Page + Login)

The login page currently uses `bg-white dark:bg-zinc-950` — a clean white light theme. The landing page will use a light variant.

| Role | Class | Usage |
|------|-------|-------|
| Page background | `bg-white` / `bg-slate-50` | Landing, login |
| Surface | `bg-white shadow-sm` | Cards on landing |
| Text | `text-slate-900` | Primary headings |
| Text secondary | `text-slate-500` | Body copy |

### Typography System

#### Font Stack Recommendation

| Role | Font | Fallback | Rationale |
|------|------|----------|-----------|
| **Display / Brand** | Geist (Vercel) | Inter | Modern, geometric, excellent at all weights. Matches the dark-tech aesthetic. |
| **Body / UI** | Pretendard | Geist, Inter | Gold standard for Korean+Latin mixed typography. Consistent vertical metrics. |
| **Code / IDs / Monospace** | JetBrains Mono | 'Fira Code', monospace | Used for `sessionId`, `agentId`, error codes, cost values, tool call parameters |

#### Scale (8px base unit)

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Display | 32px / 2rem | 700 | 1.2 | Page titles (Dashboard, Hub) |
| Heading 1 | 24px / 1.5rem | 600 | 1.3 | Section headers |
| Heading 2 | 18px / 1.125rem | 600 | 1.4 | Card titles, panel headers |
| Heading 3 | 15px / 0.9375rem | 500 | 1.4 | Sub-section labels |
| Body | 14px / 0.875rem | 400 | 1.6 | Primary body text |
| Small | 12px / 0.75rem | 400 | 1.5 | Metadata, timestamps, badges |
| Mono | 13px / 0.8125rem | 400 | 1.5 | IDs, session tokens, costs |

### Spacing & Grid

**Base unit: 4px (Tailwind 1 = 4px)**

All layout spacing uses multiples of 4px. Primary layout spacings:

| Context | Value | Tailwind |
|---------|-------|---------|
| Page padding (desktop) | 24px | `p-6` |
| Page padding (mobile) | 16px | `p-4` |
| Card inner padding | 20px | `p-5` |
| Gap between cards | 16px | `gap-4` |
| Form field vertical gap | 16px | `space-y-4` |
| Section vertical gap | 32px | `space-y-8` |
| Nav item height | 40px | `h-10` |
| Table row height | 48px | `h-12` |

### Iconography

**Library: Lucide React** (already in use via `@corthex/ui` patterns — consistent with Tailwind ecosystem)

Icon sizing:
- Nav icons: 20px (`size-5`)
- Inline/button icons: 16px (`size-4`)
- Empty state icons: 48px (`size-12`)
- Status dots: 8px custom `div` (not icons)

Icon color: `text-slate-400` default, `text-slate-100` on active, `text-indigo-400` on primary action.

---

## 5. UX Principles

### Principle 1: Hierarchy is Sacred

CORTHEX's product metaphor is a military/corporate hierarchy. The visual design must reinforce this:

- **Tier 1 (Manager)** agents receive visual primacy: larger cards, violet accent, "COS" badge for the Secretary
- **Handoff chain** must be visually traceable in activity logs: indented delegation tree, connector lines
- **Org chart (NEXUS)** is the single canonical representation of the hierarchy — all other views derive from it

**Rule:** Never show agents as a flat list without tier context visible.

### Principle 2: The Hub is the Center of Gravity

`/hub` is where users spend 80% of their time. Its UX must be:

- **Full-screen capable** — no sidebar chrome during conversation
- **Instantly responsive** — SSE streaming begins within 500ms of send
- **Token-transparent** — running cost + token count visible in the `done` event
- **Error-recoverable** — stream error event shows human-readable message + retry option (POST-based fetch, manual reconnect)

The Hub input is not a chatbox. It is a **command terminal**. The visual metaphor should be closer to a military radio than a consumer messaging app.

### Principle 3: Data Before Decoration

Every pixel either communicates data or enables action. The visual hierarchy on any page is:

1. **Status** (is something wrong right now? Error states first.)
2. **Primary data** (what is on this page?)
3. **Actions** (what can the user do?)
4. **Metadata** (timestamps, IDs, counts)
5. **Navigation** (where can the user go?)

No page should have decorative illustrations, empty hero sections, or padding that exceeds 24px on primary content areas without structural justification.

### Principle 4: Real-Time Must Feel Real

7 WebSocket channels + SSE streaming are core to CORTHEX's value proposition. The UI must make this visible:

- **Activity Log** (`/activity-log`): WebSocket `useActivityWs` hook appends rows in real-time. New rows must animate in (slide-down, 150ms) — not just appear.
- **Agent status dots**: Poll or WS — always accurate. An `animate-pulse` green dot for a working agent communicates life.
- **Hub stream**: Token-by-token text rendering (not wait-for-complete). Cursor blink while streaming.
- **ARGOS jobs**: Live progress. `running` jobs show spinner; `done` shows checkmark with timestamp.

### Principle 5: Density Without Clutter

Enterprise users have large monitors and process large amounts of information. CORTHEX must support **high information density** without feeling cluttered:

- **Tables over cards** for list views with more than 4 data fields (Admin: Users, Departments, Agents, Costs)
- **Cards over tables** for entity previews with status and actions (App: Home agent grid, Dashboard)
- **Collapsible panels** for secondary information (Agent detail drawer, Delegation chain viewer)
- **Sticky headers** on long tables — user must always see column labels
- **Progressive disclosure** — show 5 items, "더 보기" (Show more) expands

### Principle 6: Mobile is Secondary, Not Absent

The user app targets desktop-primary users (command & control context). But:
- Login page: must be mobile-functional (logging in from a phone is realistic)
- Hub page: must be usable on tablet (iPad-class devices)
- Admin panel: tablet-accessible for monitoring; keyboard interactions remain fully functional

Responsive breakpoints:
- Mobile: < 640px (sm)
- Tablet: 640–1024px (sm–lg)
- Desktop: 1024–1440px (lg–xl)
- Wide: > 1440px (2xl)

The app sidebar collapses to a bottom nav sheet on mobile. Admin sidebar hides behind a hamburger menu.

---

## 6. Surface-Specific Direction

### 6-A. User App (`packages/app/`)

**Aesthetic:** Dark command center. Deep `zinc-950` background. The user is an executive operating in low-light.

**Primary sidebar:** Left rail, 64px collapsed / 240px expanded. Icons with labels on expanded. Collapsed state shows only icons + tooltips. Nav groups:

```
Section: 핵심 (Core)
  - 홈 (/)
  - 허브 (/hub)
  - 대시보드 (/dashboard)

Section: 작전 (Operations)
  - 야간작업 (/jobs)
  - ARGOS (/argos)
  - 통신 (/command-center)

Section: 정보 (Intelligence)
  - 아카이브 (/classified)
  - 지식 (/knowledge)
  - 보고서 (/reports)
  - 활동 (/activity-log)

Section: 조직 (Organization)
  - NEXUS (/nexus)
  - 부서 (/departments)
  - 에이전트 (/agents)
  - 성과 (/performance)

Section: 기타
  - 알림 (/notifications)
  - 설정 (/settings)
```

### Feature Priority Hierarchy

| Priority | Features | Visibility |
|----------|----------|-----------|
| **P0** (Always visible) | Hub, Chat, NEXUS, Dashboard, Home | Primary nav, top of sidebar |
| **P1** (One click away) | Agents, Departments, Jobs, Reports, Command Center, ARGOS | Grouped nav sections |
| **P2** (Secondary nav) | SNS, Trading, Messenger, Knowledge, AGORA, Tiers, Performance | Lower sidebar or "더보기" |
| **P3** (Power user/admin) | Costs, Activity Log, Settings, Classified, Cron, Files, Notifications | Settings/utility area |

**Card pattern (established):** `rounded-2xl bg-gradient-to-br from-{color}-600/15 via-slate-800/80 to-slate-800/80`

**Hub page (unique layout):** Two-panel split: left = session list + agent selector, right = conversation. Full-screen toggle hides left panel. SSE stream renders token-by-token. Status bar shows: agent name, model, running token count, cost (shown only after `done` event).

### 6-B. Admin Panel (`packages/admin/`)

**Aesthetic:** Functional, high-density, data-first. Less atmospheric than the user app. Closer to Linear or Vercel dashboard.

**Same dark base** (`zinc-950`, `slate-900`) but **less gradient, more table**. Admin users are configuring the system, not commanding it.

**Top navigation bar** (not sidebar) at mobile, **left sidebar** at desktop (same 64px/240px pattern).

**Key admin surfaces:**
- `DashboardPage` — Metrics overview (agent count, cost MTD, active sessions)
- `AgentsPage` — Full CRUD table. Columns: name, tier, department, status, tools count, model
- `TiersPage` — Tier hierarchy editor. Visual tier tree showing model assignments
- `NexusPage` — React Flow canvas. Agent nodes draggable, connections show delegation paths
- `CostsPage` — Cost breakdown by agent, model, time period. Chart + table
- `MonitoringPage` — Live session viewer. Expandable session rows showing tool calls

**Table pattern:**
```
sticky header (bg-slate-900 border-b border-slate-700)
  row: h-12, hover:bg-slate-800/50
  first column: font-medium text-slate-100
  data columns: text-slate-400 text-sm
  action column: right-aligned, gap-2 icon buttons
```

### 6-C. Landing Page

**Aesthetic:** Light mode primary (`bg-white` / `bg-slate-50`). Corporate but not stiff. Should communicate scale and intelligence.

**Dark Hero Section** — contrast inversion: hero is dark (`bg-zinc-950` with indigo gradient mesh), then page transitions to light for features/pricing.

**Key sections (in order):**
1. Hero — Tagline, primary CTA ("무료로 시작하기"), product screenshot
2. Social proof — Customer logos or testimonials
3. Feature grid — 6 features with icons: 계층 조직, 실시간 모니터링, 지식 관리, 보안 필터링, MCP 연동, 성과 추적
4. How it works — 3-step visual (1: 조직 구성 → 2: 에이전트 배정 → 3: 성과 확인)
5. Pricing tiers
6. CTA section
7. Footer

---

## 7. Motion & Interaction Principles

### Motion Budget

**Conservative.** Animation serves communication, not entertainment.

| Animation Type | Duration | Easing | Usage |
|---------------|----------|--------|-------|
| Page transition | 150ms | ease-out | Route change fade |
| Modal open | 200ms | ease-out | Scale from 0.95 + opacity |
| Modal close | 150ms | ease-in | Reverse |
| Toast appear | 300ms | spring | Slide from right |
| Skeleton shimmer | 1.5s | linear | Loading placeholder |
| Status pulse | 2s | ease-in-out | Online/working dots |
| Activity row append | 150ms | ease-out | Slide down |
| Hub stream cursor | 500ms | step-end | Blink cursor |
| Sidebar expand | 200ms | ease-in-out | Width transition |

**No** parallax, particle effects, hero video backgrounds, lottie animations, or scroll-triggered complex animations. These are appropriate for consumer apps, not B2B command centers.

### Interaction States (All Interactive Elements)

Every interactive element must have 4 states explicitly designed:
1. **Default** — rest state
2. **Hover** — `hover:` prefix, subtle background shift (`bg-slate-800/50`)
3. **Active/Pressed** — `active:` prefix, slight scale down (`scale-[0.98]`)
4. **Disabled** — `opacity-50 cursor-not-allowed pointer-events-none`
5. **Focus** — `focus-visible:ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950`

---

## 8. Constraints for Implementation

### Non-Negotiable Technical Constraints

1. **Dark mode first** — `document.documentElement.classList.toggle('dark', dark)` is the mechanism. All components must have `dark:` variants. Light mode is secondary.
2. **Tailwind CSS 4** — No arbitrary values where a Tailwind class exists. No inline styles for spacing/color.
3. **CVA-based components** — All shared components through `@corthex/ui`. No raw Tailwind outside of page-level layout code.
4. **No emoji in UI** — Onboarding template icons (🏢💻📢📈) are functional data; avoid emoji in navigation, buttons, or headings.
5. **Korean typography** — `word-break: keep-all` for all Korean text. Pretendard covers both KR + Latin.
6. **Status dot sizes** — 8px (`w-2 h-2`) for inline, 10px (`w-2.5 h-2.5`) for agent cards. Never icon-based.
7. **Table density** — Row height 48px minimum for touch accessibility. No row heights below 40px.
8. **Sidebar width** — Collapsed: 64px. Expanded: 240px (app) / 256px (admin). These match existing component measurements.

### Preserved Patterns (Do Not Break)

These patterns are established in existing code and must be honored in redesign:

| Pattern | Current Implementation | Must Preserve |
|---------|----------------------|---------------|
| Auth store | `useAuthStore` Zustand, `localStorage` token | Token handling logic unchanged |
| Route structure | React Router v6, `basename="/admin"` for admin | All 30 app + 24 admin routes unchanged |
| API format | `{ success, data }` / `{ success, error: { code, message } }` | Error display must show error.message |
| SSE event types | `accepted/processing/handoff/message/error/done` | Hub UI must handle all 6 events |
| Multitenant | `companyId` in all operations | No cross-company data display |
| Code splitting | All pages are `React.lazy()` + `<Suspense>` | `PageSkeleton` pattern preserved |

---

## 9. Competitive Differentiation

| Platform | Visual Identity | CORTHEX Difference |
|----------|----------------|-------------------|
| ChatGPT | Minimal white, consumer-friendly | CORTHEX is darker, more structured, B2B command-center |
| Linear | Dark, minimal, developer tool | CORTHEX has more visual hierarchy (tiers, org structure) |
| Notion | Light, flexible, editorial | CORTHEX is prescriptive — org structure is the core, not free-form docs |
| Vercel Dashboard | Dark, data-dense, developer | CORTHEX borrows this aesthetic but for non-developer executives |
| Intercom (Admin) | Light, SaaS-clean, support-focused | CORTHEX is darker, more intelligence/ops-focused |

**CORTHEX's visual signature:** Dark command-center base + luminous status colors + typographic hierarchy (tier system) + Korean-first copy precision.

---

_This document is a living reference. All color values should be verified against the implemented Tailwind config. Typography recommendations require font loading configuration in the Vite builds._
