# Phase 2-1: Web Options Deep Analysis + React Implementation Spec

**Date**: 2026-03-12
**Step**: Phase 2 — Deep Analysis, Step 2-1
**Status**: Round 2 — Fixes Applied (19 issues: 10 critical, 5 major, 4 minor)
**Output**: Deep analysis of all 3 web dashboard options from Phase 1-1 + full React implementation specs

---

## Reference Documents Read
- `phase-0-foundation/spec/corthex-technical-spec.md` (762 lines)
- `phase-0-foundation/vision/corthex-vision-identity.md` (424 lines)
- `phase-1-research/web-dashboard/web-layout-research.md` (867 lines)
- All 5 context-snapshots (phase-0-step-1, phase-0-step-2, phase-1-step-1, phase-1-step-2, phase-1-step-3)

---

## Preamble: CORTHEX Design Constraints (Confirmed from Phase 0)

These constraints govern every analysis decision below. Violations are automatic disqualifiers.

| Constraint | Value | Source |
|------------|-------|---------|
| Min viewport | 1280px (desktop-only). Hub soft-min: **1440px** | Tech Spec §11.2 |
| Hub target layout | `[AppSidebar w-60][SessionPanel w-64][ChatArea flex-1][TrackerPanel w-80↔w-12]` | Tech Spec §11.2 |
| Admin layout | `[AdminSidebar w-60][Main flex-1][optional right panel]` | Tech Spec §11.2 |
| Brand | Military Precision × AI Intelligence. NOT chatbot, NOT playful | Vision §5.1 |
| Primary accent | `bg-indigo-600` (#4F46E5) | Tech Spec §9.1 |
| Dark mode | First-class reference. `bg-zinc-950` page / `bg-zinc-900` sidebar | Tech Spec §9.1 |
| Palette | Zinc. NEVER slate in new code | Tech Spec §9.2 note |
| Typography | Work Sans (app) — must add to admin `index.html` | Tech Spec §10.1 |
| Spacing standard | `p-4` / `gap-4` = 16px. Never `p-12` decorative | Tech Spec §11.1 |
| Tracker animation | `transition-[width] duration-[250ms] motion-reduce:transition-none` | Phase 1-1 Snapshot |
| All transitions | `motion-reduce:transition-none` required on every animated element | Tech Spec §12 |
| Soul editor | **CodeMirror 6** — not plain `<textarea>` | Tech Spec §8 §10.1 |

---

# OPTION A: Fixed Command Center

## Design Philosophy Analysis

### Design Movement / School

Option A follows the **Swiss International Style** (Internationaler Typografischer Stil) applied to software: unambiguous grid discipline, function before decoration, and information legibility at maximum density. Specifically, it channels the **Mission Control aesthetic** — the NASA-style command room where every screen is always on, every panel always staffed, and every status is visible without asking.

The ideological ancestor is **Dieter Rams' "Good Design is unobtrusive"** — Option A never shifts the layout to demand attention. All 4 columns (AppSidebar, SessionPanel, ChatArea, TrackerPanel) are present at all times, silent by default, informative when active. This is the opposite of progressive disclosure — it is persistent disclosure.

The nearest software design precedent is **Bloomberg Terminal** (professional financial workstation): all panels always visible, information density > whitespace, layout does NOT change with data state. The user trains their eyes to the positions. Once learned, the cognitive overhead of layout navigation drops to near zero.

### Emotional Response

Primary: **Authority and Certainty.** The user opens Hub and immediately sees three panels. There is no "loading" of layout state. The Tracker column is allocated even when idle (`w-12`). This communicates: "your team is ready, the system is watching, your seat is at the command desk." This is the correct emotional target for CORTHEX's primary persona (비개발자 조직 관리자, 김대표).

Secondary: **Professional Trust.** When the TrackerPanel expands from `w-12` to `w-80` on the first `handoff` SSE event, it is NOT a surprise — the space was already reserved. The transition is a reveal, not an intrusion. This distinction is critical: Option B has the same expansion, but ChatArea shrinks 272px simultaneously (intrusive). Option A's ChatArea is already narrowed (624px), so the expansion is seamless.

Tertiary: **Disciplined Restraint.** Nothing moves unless AI is working. The only animation is: (1) TrackerPanel width transition on `handoff`, (2) SSE step row slide-in, (3) status dot color change. All other elements are static. This matches CORTHEX Principle 4: Commander's View — "design for situational awareness, not simplicity."

### CORTHEX Vision & Design Principles Alignment

| Principle | Option A Alignment | Spec ref |
|-----------|-------------------|----------|
| P1: Name the Machine | ✅ TrackerPanel always allocated — agent names render immediately on `handoff` event without layout jump | Vision §8 P1 |
| P2: Depth is Data | ✅ Full w-80 TrackerPanel at all times (when expanded) = CORTHEX's richest information surface | Vision §8 P2 |
| P3: Zero-Delay Feedback | ✅ TrackerPanel pre-allocated → `handoff` event triggers step render only (no width calculation delay) | Vision §8 P3 |
| P4: Commander's View | ✅ **Strongest of all 3 options.** All 4 columns simultaneously. Fixed layout. No surprises | Vision §8 P4 |
| P5: Show the Org | ✅ SessionPanel always shows agent status dots. Tracker always shows chain (when active) | Vision §8 P5 |
| P6: Hierarchy Through Typography | ✅ Layout hierarchy is positional (columns), not color-based | Vision §8 P6 |
| P7: Dark Mode First-Class | ✅ `bg-zinc-950` root, `bg-zinc-900` panels, `border-zinc-700` visible borders | Vision §8 P7 |
| P8: Desktop-First, Information-Dense | ✅ 4 fixed columns at 1280px minimum. `p-4` density throughout | Vision §8 P8 |

**Score vs. Vision**: 8/8 principles satisfied without compromise. This is Option A's decisive advantage.

### User Flow Analysis

---

#### Task 1: Create a New AI Agent

**Entry point**: User is on Hub page, wants to add a new AI agent to their organization.

```
Step 1: Click App Sidebar → "🔗 관리" section → link to Admin domain
        [Screen: HubPage → Admin redirect (new tab or same window based on routing)]

Step 2: AdminSidebar loads. Click "🤖 에이전트" nav item
        [Screen: AdminAgentsPage — table of existing agents]
        Layout: [AdminSidebar w-60 bg-zinc-900] [Main flex-1 bg-zinc-950]

Step 3: Click "에이전트 추가" button (top-right of table header)
        [Component: <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">]

Step 4: AgentCreateDrawer slides in from right
        [Drawer: fixed right-0 top-0 h-full w-[520px] bg-zinc-900 border-l border-zinc-700 z-40]
        [Transition: translate-x-full → translate-x-0, duration-[250ms], motion-reduce:transition-none]

Step 5: Fill in form fields:
        - 이름 (name): text input
        - 부서 (department): <Select> dropdown
        - 티어 (tier): radio buttons T1/T2/T3 with tier badge preview
        - 부모 에이전트 (parent agent): searchable <Select> showing org hierarchy

Step 6: Click "Soul 편집" tab → CodeMirror 6 editor loads
        [CodeMirror 6: bg-zinc-950, line numbers, markdown syntax highlighting]
        [Note: plain <textarea> is PROHIBITED per Tech Spec §10.1]

Step 7: Click "저장" (Save) button
        [Optimistic update: agent row appears in table immediately]
        [Server confirms → NEXUS canvas updates on next visit]
        [Toast: "에이전트 생성됨" — fixed bottom-4 right-4 z-50]
        [Total screens: 3 (AdminAgents → AgentDrawer open → AgentDrawer Soul tab)]
```

**Screens visited**: AdminAgentsPage × 2 states (table, drawer open), AgentDrawer (form tab, Soul tab)
**Decision points**: 4 (department, tier, parent agent, soul content)
**Key concern for Option A**: None specific — this flow is Admin SPA only, unaffected by Hub layout choice

---

#### Task 2: View Org Chart (NEXUS)

**Entry point**: Admin wants to see and edit the organization structure visually.

```
Step 1: AdminSidebar → "🔍 NEXUS" nav item
        [Screen: AdminNexusPage]

Step 2: ReactFlow canvas renders — full remaining width (1440-240=1200px)
        [Canvas bg: bg-zinc-950, nodes: bg-zinc-900 border border-zinc-700]
        [Nodes: 비서실장, CIO, CTO, 전략팀장, 백엔드전문가, etc.]
        [Edges: stroke indigo-600 for active connections, zinc-600 for inactive]

Step 3: Zoom/pan canvas — controls: bottom-left corner
        [ZoomIn, ZoomOut, FitView buttons — 32×32px each, bg-zinc-800 hover:bg-zinc-700]

Step 4: Click node (e.g., "CTO") → AgentConfigPanel slides in
        [Config panel: absolute right-0 top-0 h-full w-96 bg-zinc-900 border-l border-zinc-700 z-10]
        [Transition: translate-x-full → translate-x-0, duration-[250ms], motion-reduce:transition-none]
        [Note: ABSOLUTE positioned — canvas does NOT reflow in Option A]
        [Canvas viewport: 1200px full-width, config panel overlays right 384px]

Step 5: Edit agent Soul → "Soul 편집" expands CodeMirror 6 panel within config
Step 6: Click "즉시 적용됨" (Save) → optimistic canvas node update (color flash indigo→zinc)
        [Zero loading spinner — Principle 3: Zero-Delay Feedback]
        [Total screens: 1 screen (NexusPage with dynamic panel states)]
```

**Key Option A specificity**: Config panel is `absolute` overlay — canvas width remains 1200px always. Node NOT obscured by config panel (panel occupies right 384px of canvas but canvas itself doesn't reflow). Users can still pan/zoom behind the config panel.

---

#### Task 3: Chat with an Agent (Hub)

**Entry point**: 김대표 wants to run a research task — "삼성전자 분석해줘"

```
Step 1: App opens at /hub — 3-column layout immediately visible
        Layout at 1440px:
        [AppSidebar 240px][SessionPanel 256px][ChatArea 624px][TrackerPanel 48px (idle w-12)]

Step 2: SessionPanel (left of ChatArea) shows:
        - Session list (most recent top)
        - Agent Status section at bottom: 비서실장 ● online, CIO ● online, 전문가 ○ idle
        [Note: Status dot animation requires motion-reduce:animate-none check]

Step 3: Click "새 세션" (New Session) in SessionPanel header
        [New session row appears instantly (optimistic) at top of list]

Step 4: ChatArea is empty — show empty state
        [Empty state: centered, text-base font-medium text-zinc-500, NEXUS mini-diagram]

Step 5: Type "삼성전자 분석해줘" in textarea
        [Textarea: bg-zinc-900 border-zinc-700 rounded-lg px-3 py-2 text-sm, resize:none]
        [Submit button: 48×48px bg-indigo-600 hover:bg-indigo-700 rounded-lg]

Step 6: Press Enter or Submit → SSE stream starts
        [SSE accepted event ≤50ms → "명령 접수됨" badge pulses on message]
        [Badge: inline bg-indigo-950 text-indigo-300 text-xs px-2 py-0.5 rounded]

Step 7: SSE handoff event → TrackerPanel auto-expands w-12 → w-80
        [Transition: transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none]
        [ChatArea DOES NOT CHANGE — pre-allocated at 624px]
        [TrackerPanel expansion is pure visual reveal, no layout shift]

Step 8: Tracker shows live chain with 300ms stagger:
        ● 비서실장 (D1) [animate-pulse indigo dot]
          → CIO (D2) [waiting]
          → 전문가 (D3) [waiting]

Step 9: Each step completes → ✓ checkmark + next step pulses
        [CSS: transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none]

Step 10: SSE complete event → Cost badge:
         [font-mono text-xs text-zinc-400 "비용 $0.0042 · 1,240 토큰"]
         [Final response renders in ChatArea: MarkdownRenderer component]
         [Total screens: 1 (HubPage — all state changes visible in-place)]
```

**Key Option A specificity**: Layout width remains `[240][256][624][w-80=320]` for entire Task 3. No reflow. No ChatArea size change. The only visual change is TrackerPanel content populating. The **commander sees all panels simultaneously throughout execution**.

---

#### Task 4: Manage Knowledge Base

**Entry point**: Admin wants to add a new document to the knowledge base.

```
Step 1: AppSidebar → "📄 라이브러리" nav item
        [Screen: KnowledgePage — 2-column: sidebar + main]
        [Main area: document grid 3×N with search header]

Step 2: Search bar at top: bg-zinc-900 border-zinc-700 with magnifier icon (Lucide Search)
        [Semantic search: placeholder "문서 검색 (의미 기반)..."]

Step 3: Document grid shows existing docs:
        [Grid: grid grid-cols-3 gap-4 p-4]
        [Card: bg-zinc-900 border border-zinc-700 rounded-lg p-4]
        [Card content: title, source type icon, date added, embedding status dot]

Step 4: Click "문서 추가" (top-right button) → DocumentUploadModal opens
        [Modal: fixed inset-0 z-50 bg-black/60 flex items-center justify-center]
        [Dialog element: bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-[480px] max-h-[80vh] overflow-y-auto]
        [Note: <dialog> element with .showModal() is the correct pattern (Phase 1-3 established)]

Step 5: Modal has 2 tabs: "파일 업로드" | "URL 추가"
        [File tab: drag-drop zone bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-600]
        [URL tab: <input type="url"> for web page embedding]

Step 6: Submit → embedding progress bar
        [Linear progress: h-1 bg-zinc-700 rounded-full, fill: bg-indigo-600, animate from 0→100%]
        [Status: "Gemini 임베딩 중... 0% → 100%"]

Step 7: Complete → document card appears in grid (optimistic)
        [Toast: "문서가 추가되었습니다" — fixed bottom-4 right-4]
        [Total screens: KnowledgePage (grid), KnowledgePage + modal overlay]
```

---

## UX Deep Dive

### Information Architecture Diagram

```
CORTHEX v2 — App SPA (/hub domain)
══════════════════════════════════════

Root Shell: <div className="flex h-screen bg-zinc-950 overflow-hidden">
│
├── AppSidebar (w-60 fixed, always visible, all routes)
│   ├── Logo + "CORTHEX" wordmark
│   ├── Agent Status Orbs (header, bg-zinc-900 border-b border-zinc-700 px-4 py-2)
│   ├── Nav Group: 업무  [P0/P1 features — highest access frequency]
│   │   ├── 🏠 홈 → / (HomePage)
│   │   ├── 🔗 허브 → /hub
│   │   ├── 💬 AGORA → /agora
│   │   ├── 🔍 NEXUS → /nexus (SketchVibe canvas — P1: "demo moment")
│   │   ├── 📈 대시보드 → /dashboard
│   │   └── 🗣️ ARGOS → /argos
│   ├── Nav Group: 운영  [P1/P2 features]
│   │   ├── 📄 라이브러리 → /knowledge
│   │   ├── 📁 파일 → /files
│   │   ├── 📊 비용분석 → /costs
│   │   ├── 💪 성능 → /performance
│   │   ├── 📱 SNS → /sns
│   │   ├── 💭 전략 → /trading
│   │   ├── 🔒 기밀 → /classified
│   │   ├── 💼 업무 → /jobs
│   │   ├── 📝 보고서 → /reports
│   │   ├── 📞 알림 → /notifications
│   │   ├── 📋 활동로그 → /activity-log
│   │   ├── 🏢 조직도 → /org
│   │   ├── 💬 메신저 → /messenger
│   │   ├── 🎖️ 티어 → /tiers
│   │   ├── 🏗️ 부서 → /departments
│   │   └── 🤖 에이전트 → /agents
│   └── Nav Group: 시스템  [P2/P3 — config + admin]
│       ├── ⏰ CRON → /cron
│       └── ⚙️ 설정 → /settings
│
├── HubPage (/hub, /hub/:sessionId) — 3-column layout ONLY
│   ├── <nav aria-label="Sessions"> SessionPanel (w-64)
│   │   ├── NewSession button
│   │   ├── Session list (date-grouped, active highlighted)
│   │   └── Agent Status section (online/working/offline dots)
│   ├── <main> ChatArea (flex-1 min-w-0)
│   │   ├── MessageList (overflow-y-auto, auto-scroll with lock)
│   │   │   └── MessageBubble[] (user=right, agent=left)
│   │   │       └── MarkdownRenderer (for agent responses)
│   │   └── InputBar (fixed bottom of ChatArea)
│   │       ├── <textarea> (auto-resize)
│   │       └── SubmitButton (bg-indigo-600 48×48px)
│   └── <aside role="complementary"> TrackerPanel (w-80↔w-12)
│       ├── TrackerHeader (agent chain title + toggle button)
│       ├── HandoffStepList (SSE-driven)
│       │   └── HandoffStep[] (agent name, tier badge, elapsed, status)
│       └── CostSummary (font-mono, visible after complete)
│
└── All Other Pages (/agora, /dashboard, etc.) — 2-column layout
    └── <main className="flex-1 overflow-auto p-6">
        └── [Page content]

═══════════════════════════════════════
CORTHEX v2 — Admin SPA (/admin domain)
═══════════════════════════════════════

Admin Shell: <div className="flex h-screen bg-zinc-950 overflow-hidden">
│
├── AdminSidebar (w-60 fixed, bg-zinc-900 border-r border-zinc-700)
│   ├── Company Dropdown (top, context-preserving on switch)
│   ├── Flat Nav (18 items, section dividers hr border-zinc-700)
│   │   ├── 🔍 NEXUS → /nexus (ReactFlow canvas)
│   │   ├── 🤖 에이전트 → /agents
│   │   ├── 🏗️ 부서 → /departments
│   │   ├── 🎖️ 티어설정 → /tiers
│   │   ├── 👥 직원관리 → /employees
│   │   ├── ⏰ ARGOS → /argos
│   │   ├── 📊 감사로그 → /audit-logs
│   │   └── ⚙️ 설정 → /settings
│   └── User / Sign out (bottom)
│
└── Admin Content (flex-1 overflow-auto)
    ├── NexusPage — ReactFlow full-bleed canvas
    │   └── AgentConfigPanel (absolute right-0 w-96, slide-in on node click)
    ├── AgentsPage — table + AgentCreateDrawer (fixed right-0 w-[520px])
    ├── AgentDetailPage — full Soul editor (CodeMirror 6 left + preview right)
    └── All other admin pages — [standard table + form layouts]
```

---

### Cognitive Load Analysis

**Simultaneous attention targets on Hub page (Option A active state):**

| Panel | Visual weight | Active elements competing for attention |
|-------|-------------|----------------------------------------|
| AppSidebar | Low (static when not hovering) | 1 active nav item highlighted |
| SessionPanel | Medium | Active session row + agent status dots |
| ChatArea | High (user focus) | Message stream + input textarea |
| TrackerPanel (w-80) | High (SSE updating) | Live chain steps + elapsed time + cost |

**Total active attention targets when TrackerPanel is expanded: 4 panels simultaneously.**

This is HIGH but CORRECT for CORTHEX's target persona. Analysis:
- A Bloomberg terminal user manages 6–8 panels simultaneously. CORTHEX's 4 panels is conservative.
- The three panels (SessionPanel, ChatArea, TrackerPanel) form a clear **left-to-right narrative flow**: "what I asked before → what I'm asking now → how the AI is doing it."
- Cognitive load is reduced by the fact that TrackerPanel is **passive** (updates autonomously) — the user does not need to interact with it to extract value.
- Chunking (Miller's Law): 4 panels chunk as 2 groups: input side (SessionPanel + ChatArea) + observation side (TrackerPanel).

**Verdict**: Option A's cognitive load is appropriate for 김대표 and acceptable for 이팀장. The **fixed layout removes the cognitive overhead of layout state management** — zero mental effort spent asking "is the Tracker panel open?"

---

### Fitts's Law Analysis (Key Target Acquisition Costs)

Fitts's Law: Time = a + b × log₂(1 + D/W). Larger targets and shorter distances → faster acquisition.

| Target | Size | Distance from typical cursor position | Acquisition cost |
|--------|------|--------------------------------------|-----------------|
| ChatArea textarea submit button | 48×48px | Center of screen (ChatArea center) | **Very Low** ✅ |
| AppSidebar nav items | 36px height × 240px width (full row) | Left edge (fixed) | Low ✅ |
| SessionPanel session rows | ~56px height × 256px width | Left-center | Low ✅ |
| TrackerPanel toggle (w-12→w-80) | 32×32px at TrackerPanel header | Far right edge | Medium ⚠️ |
| NEXUS node (canvas click) | Variable ~48×48px per node | Center canvas | Low-Medium ✅ |
| "새 세션" button (SessionPanel) | 36px height × ~200px width | Top-left of SessionPanel | Low ✅ |

**Key concern**: TrackerPanel toggle button is at the far right (`w-12` icon strip, `right-0` position). At 1440px, this is 1392px from the left viewport edge. Mouse travel to toggle is maximal. Mitigation: because Option A pre-allocates the space and auto-expands on SSE events, **manual toggle is rarely needed** — the system handles TrackerPanel state automatically.

---

### Hick's Law Analysis (Decision Complexity at Key Points)

Hick's Law: Time = b × log₂(n + 1). More choices → longer decision time.

| Decision point | Number of choices (n) | Complexity | Notes |
|---------------|----------------------|-----------|-------|
| AppSidebar nav: which page? | 27 items, 3 groups | Medium | Emoji icons reduce scan time |
| SessionPanel: which session? | Variable (≤20 visible, scrolled) | Low-Medium | Date groups chunk choices |
| Admin AgentsPage: create/edit/delete? | 3 primary actions | Very Low | ✅ |
| NEXUS: which node to click? | n = org size (typ. 5–20 nodes) | Low | Spatial layout reduces decision time |
| **TrackerPanel: any decisions?** | **0** | **Zero** ✅ | **Fully passive — no choices required** |

**Key advantage**: TrackerPanel in Option A is a passive observation surface. No decisions required. This is the correct pattern for CORTHEX's most emotionally important feature.

---

## React Implementation Spec

### Component Tree (Full Hierarchy)

```
packages/app/src/
├── App.tsx                           ← Router setup (existing — BrowserRouter + Routes)
├── components/
│   ├── layout.tsx                    ← Layout wrapper (EXISTING: packages/app/src/components/layout.tsx)
│   ├── sidebar.tsx                   ← AppSidebar (EXISTING: keep emoji nav as-is)
│   ├── markdown-renderer.tsx         ← EXISTING: markdown rendering
│   ├── codemirror-editor.tsx         ← EXISTING: CodeMirror 6 wrapper (do NOT duplicate)
│   ├── hub/                          ← EXISTING directory: packages/app/src/components/hub/
│   │   ├── secretary-hub-layout.tsx  ← EXISTING: current 2-col hub (redesign target = replace)
│   │   ├── session-sidebar.tsx       ← EXISTING: redesign → rename to session-panel.tsx
│   │   ├── handoff-tracker.tsx       ← EXISTING: redesign → migrate to tracker-panel.tsx (right col)
│   │   ├── agent-picker-panel.tsx    ← EXISTING: keep
│   │   ├── index.tsx                 ← EXISTING: exports
│   │   ├── [NEW] tracker-panel.tsx   ← NEW: right-column TrackerPanel w-80↔w-12
│   │   ├── [NEW] chat-area.tsx       ← NEW: refactored ChatArea with scroll-lock
│   │   ├── [NEW] message-bubble.tsx  ← NEW: user/agent bubble
│   │   ├── [NEW] handoff-step.tsx    ← NEW: single step row with animation
│   │   └── [NEW] cost-summary.tsx    ← NEW: font-mono cost/token display
│   ├── settings/
│   │   └── soul-editor.tsx           ← EXISTING: packages/app/src/components/settings/soul-editor.tsx
│   │                                    Use this for Soul editing (do NOT create duplicate)
│   └── nexus/                        ← EXISTING: packages/app/src/components/nexus/
│       ├── AgentNode.tsx             ← EXISTING: custom ReactFlow node
│       ├── CompanyNode.tsx           ← EXISTING: company-level node
│       ├── DepartmentNode.tsx        ← EXISTING: department-level node
│       ├── ExecutionHistoryPanel.tsx ← EXISTING: execution log panel
│       ├── NexusInfoPanel.tsx        ← EXISTING: info overlay panel
│       ├── NodeDetailPanel.tsx       ← EXISTING: node click → detail panel
│       ├── WorkflowEditor.tsx        ← EXISTING: workflow editing panel
│       ├── WorkflowListPanel.tsx     ← EXISTING: workflow list sidebar
│       ├── canvas-sidebar.tsx        ← EXISTING: canvas left toolbar
│       ├── context-menu.tsx          ← EXISTING: right-click context menu
│       ├── editable-edge.tsx         ← EXISTING: custom edge component
│       ├── export-knowledge-dialog.tsx ← EXISTING: knowledge export
│       └── sketchvibe-nodes.tsx      ← EXISTING: SketchVibe AI-generated nodes
│           [NOTE: All 13 components EXIST from Epic 9/11. Redesign = restyling to zinc palette,
│            NOT recreation. Import from '@xyflow/react' (not 'reactflow' — renamed in v12)]
├── pages/
│   ├── hub/
│   │   └── hub-page.tsx
│   ├── agora/
│   │   ├── agora-page.tsx
│   │   └── agora-session-page.tsx
│   ├── dashboard/
│   │   └── dashboard-page.tsx
│   ├── knowledge/
│   │   └── knowledge-page.tsx
│   ├── argos/
│   │   └── argos-page.tsx
│   └── [other pages...]
└── stores/
    ├── auth.ts                       ← Zustand auth store
    ├── hub.ts                        ← Zustand hub/SSE store
    └── agents.ts                     ← Zustand agent status store
```

### Exact Tailwind Classes — Layout Structure

```tsx
// ─── Root Layout (all pages except Hub) ───────────────────────────────────
export function RootLayout() {
  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* border-zinc-700: visible on bg-zinc-900 (Tech Spec §9.5 warning: border-zinc-800 = invisible) */}
      <AppSidebar className="w-60 shrink-0 bg-zinc-900 border-r border-zinc-700" />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

// ─── Hub Layout (3-column override) ───────────────────────────────────────
export function HubLayout() {
  const { isTrackerExpanded } = useHubStore()

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <AppSidebar className="w-60 shrink-0 bg-zinc-900 border-r border-zinc-700" />

      {/* Session Panel: ARIA nav landmark */}
      <nav
        aria-label="Sessions"
        className="w-64 shrink-0 bg-zinc-900 border-r border-zinc-700 flex flex-col"
      >
        <SessionPanel />
      </nav>

      {/* Chat Area: ARIA main landmark */}
      <main className="flex-1 min-w-0 flex flex-col bg-zinc-950">
        <ChatArea />
      </main>

      {/* Tracker Panel: ARIA complementary landmark
          aria-live is OFF the container — see separate visually-hidden live region in TrackerPanel
          for screen reader announcements (prevent announcement flood on each SSE step) */}
      <aside
        role="complementary"
        aria-label="핸드오프 트래커"
        aria-expanded={isTrackerExpanded}
        className={cn(
          "shrink-0 bg-zinc-900 border-l border-zinc-700 flex flex-col",
          "transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none",
          isTrackerExpanded ? "w-80" : "w-12"
        )}
      >
        <TrackerPanel />
      </aside>
    </div>
  )
}

// ─── Admin Layout ──────────────────────────────────────────────────────────
export function AdminLayout() {
  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Admin sidebar: bg-zinc-900 with visible border-zinc-700 */}
      <AdminSidebar className="w-60 shrink-0 bg-zinc-900 border-r border-zinc-700" />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

// ─── Admin NEXUS Page ──────────────────────────────────────────────────────
export function NexusPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  return (
    <div className="flex-1 relative overflow-hidden h-full">
      {/* ReactFlow fills full remaining area — uses existing NexusCanvas from components/nexus/ */}
      <NexusCanvas
        onNodeSelect={setSelectedNodeId}
        className="w-full h-full bg-zinc-950"
      />
      {/* Config panel: ABSOLUTE overlay (Option A — canvas does NOT reflow) */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-96 bg-zinc-900 border-l border-zinc-700 z-10",
          "transition-transform duration-[250ms] ease-in-out motion-reduce:transition-none",
          selectedNodeId ? "translate-x-0" : "translate-x-full"
        )}
      >
        <AgentConfigPanel nodeId={selectedNodeId} onClose={() => setSelectedNodeId(null)} />
      </div>
    </div>
  )
}
```

### React Router Structure

```typescript
// packages/app/src/App.tsx
// NOTE: Uses BrowserRouter + Routes pattern (existing codebase) — NOT createBrowserRouter
// All routes confirmed from packages/app/src/App.tsx (2026-03-12)
// Route "/" renders <HomePage /> — does NOT auto-redirect to /hub (Tech Spec §2.3)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Complete route manifest (all 29 routes from v1 must work in v2):
// Confirmed from packages/app/src/App.tsx actual routes:

{/* Public routes (no auth) */}
<Route path="/login"     element={<LoginPage />} />
<Route path="/onboarding" element={<OnboardingPage />} />

{/* Protected routes (inside <ProtectedRoute> + <Layout>) */}
{/* "/" — HomePage: quick-start links, stats, recent activity. NOT redirect to /hub */}
<Route index           element={<HomePage />} />          {/* path="/" */}
<Route path="hub"      element={<HubPage />} />           {/* 3-column HubLayout override */}
<Route path="command-center" element={<CommandCenterPage />} />
<Route path="chat"     element={<ChatPage />} />
<Route path="jobs"     element={<JobsPage />} />
<Route path="reports"  element={<ReportsPage />} />
<Route path="reports/:id" element={<ReportsPage />} />
<Route path="sns"      element={<SnsPage />} />
<Route path="messenger" element={<MessengerPage />} />
<Route path="dashboard" element={<DashboardPage />} />
<Route path="ops-log"  element={<OpsLogPage />} />
<Route path="nexus"    element={<NexusPage />} />         {/* App SPA SketchVibe canvas */}
<Route path="trading"  element={<TradingPage />} />
<Route path="files"    element={<FilesPage />} />
<Route path="org"      element={<OrgPage />} />
<Route path="notifications" element={<NotificationsPage />} />
<Route path="activity-log" element={<ActivityLogPage />} />
<Route path="costs"    element={<CostsPage />} />         {/* NOT "/cost-analytics" */}
<Route path="cron"     element={<CronBasePage />} />
<Route path="argos"    element={<ArgosPage />} />
<Route path="agora"    element={<AgoraPage />} />
<Route path="classified" element={<ClassifiedPage />} />
<Route path="knowledge" element={<KnowledgePage />} />
<Route path="performance" element={<PerformancePage />} />
<Route path="departments" element={<DepartmentsPage />} />
<Route path="agents"   element={<AgentsPage />} />
<Route path="tiers"    element={<TiersPage />} />
<Route path="settings" element={<SettingsPage />} />

{/* Hub redesign: HubLayout wraps HubPage for 3-column override */}
{/* Implementation: Layout component detects route "/hub" → applies HubLayout */}

// packages/admin/src/App.tsx
const adminRouter = createBrowserRouter([
  {
    element: <AdminAuthGuard />,
    children: [
      {
        path: '/',
        element: <AdminLayout />,
        children: [
          { index: true,              element: <Navigate to="/nexus" replace /> },
          { path: 'nexus',            element: <NexusPage /> },
          { path: 'agents',           element: <AgentsPage /> },
          { path: 'agents/:id',       element: <AgentDetailPage /> },
          { path: 'departments',      element: <DepartmentsPage /> },
          { path: 'tiers',            element: <TiersPage /> },
          { path: 'employees',        element: <EmployeesPage /> },
          { path: 'argos',            element: <AdminArgosPage /> },
          { path: 'audit-logs',       element: <AuditLogsPage /> },
          { path: 'settings',         element: <AdminSettingsPage /> },
        ]
      }
    ]
  },
  { path: '/login',   element: <AdminLoginPage /> },
])
```

### State Management Approach

| State category | Store / Hook | Data |
|---------------|-------------|------|
| **Auth** | Zustand `useAuthStore` | user, companyId, JWT, isAuthenticated |
| **Hub SSE** | Zustand `useHubStore` | activeSessionId, isTrackerExpanded, sseStatus, handoffChain, lastEvent |
| **Agent statuses** | Zustand `useAgentStore` | agentStatuses: Record<agentId, 'online'\|'working'\|'offline'\|'error'> |
| **Sessions list** | TanStack Query `useSessions()` | Server-fetched list, auto-refetch on focus |
| **Messages** | TanStack Query `useMessages(sessionId)` | Paginated message history |
| **Agents / Depts** | TanStack Query `useAgents()`, `useDepts()` | Admin CRUD data |
| **Knowledge docs** | TanStack Query `useKnowledgeDocs()` | Document grid data |
| **Panel expand** (Option A) | Zustand `useHubStore.isTrackerExpanded` | Auto-set by SSE `handoff` event |
| **Local form state** | React `useState` | Form field values (uncontrolled preferred for perf) |
| **URL state** | React Router `useParams` | `:sessionId` active session |

```typescript
// stores/hub.ts — Option A specific
import { create } from 'zustand'

// SSE handoff event shape (Tech Spec §2.4.1): { from: string, to: string, depth: number }
// NOTE: 'tier' field is NOT in the SSE event — must be derived from useAgentStore lookup
interface HandoffStepSSE {
  from: string     // agentId
  to: string       // agentId
  depth: number    // delegation depth: 1=D1, 2=D2, 3=D3
}

interface HandoffStep {
  stepId: string
  agentId: string
  agentName: string
  tier: 'T1' | 'T2' | 'T3' | null    // null until resolved from agentStore lookup
  depth: number
  status: 'active' | 'completed' | 'failed'
  elapsedMs: number
  costUsd?: number
  tokensUsed?: number
}
// Tier lookup: in onHandoffEvent(), join against useAgentStore.getState().agentStatuses
// Pattern: const tierInfo = useAgentStore.getState().agentTiers[step.agentId] ?? null

interface HubStore {
  activeSessionId: string | null
  isTrackerExpanded: boolean
  sseStatus: 'idle' | 'connecting' | 'streaming' | 'complete' | 'error'
  lastError: string | null           // ← stores error message for display (Vision §5.2 Principle 5)
  handoffChain: HandoffStep[]
  // Actions
  setActiveSession: (id: string) => void
  onHandoffEvent: (step: HandoffStep) => void
  onCompleteEvent: (cost: number, tokens: number) => void
  onErrorEvent: (error: string) => void   // ← error string STORED, not swallowed
  resetChain: () => void
  manualToggleTracker: () => void
}

export const useHubStore = create<HubStore>((set) => ({
  activeSessionId: null,
  isTrackerExpanded: false,
  sseStatus: 'idle',
  lastError: null,
  handoffChain: [],
  setActiveSession: (id) => set({ activeSessionId: id }),
  onHandoffEvent: (step) =>
    set((state) => ({
      isTrackerExpanded: true,      // AUTO-EXPAND on first handoff (Option A)
      handoffChain: [...state.handoffChain, step],
      sseStatus: 'streaming',
    })),
  onCompleteEvent: (cost, tokens) =>
    set((state) => ({
      sseStatus: 'complete',
      handoffChain: state.handoffChain.map((s, i) =>
        i === state.handoffChain.length - 1
          ? { ...s, status: 'completed', costUsd: cost, tokensUsed: tokens }
          : s
      ),
      // Option A: tracker STAYS EXPANDED after completion. User collapses manually.
    })),
  onErrorEvent: (error) => set({ sseStatus: 'error', lastError: error }),  // ← error stored
  resetChain: () => set({ handoffChain: [], sseStatus: 'idle', lastError: null }),
  manualToggleTracker: () =>
    set((state) => ({ isTrackerExpanded: !state.isTrackerExpanded })),
}))
```

### ARIA / Screen Reader Specification

```tsx
// ─── TrackerPanel ARIA: Correct approach (NOT aria-live on container) ────────
// Problem: aria-live on the TrackerPanel container causes announcement flood —
// 3+ step updates in <1s creates choppy overlapping announcements for screen readers.
// Fix: aria-live="off" on container. Separate visually-hidden live region announces
// only meaningful state changes (one announcement per handoff event, not per DOM update).

// TrackerPanel.tsx — correct ARIA structure:
function TrackerPanel() {
  const { isTrackerExpanded, handoffChain, sseStatus } = useHubStore()
  const lastStep = handoffChain.at(-1)

  return (
    <>
      {/* Visually hidden live region: announces only on meaningful events */}
      {/* One announcement per handoff: "비서실장이 CIO에게 핸드오프" */}
      {/* NOT aria-atomic="false" flooding — this div is static between events */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        aria-label="핸드오프 트래커 업데이트"
      >
        {lastStep && sseStatus === 'streaming'
          ? `${lastStep.agentName}이(가) 처리 중 (D${lastStep.depth})`
          : sseStatus === 'complete'
          ? '작업이 완료되었습니다'
          : ''}
      </div>

      {/* Expansion announcement: sighted users see panel grow; screen readers get this */}
      {/* Fires once when isTrackerExpanded changes false→true */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {isTrackerExpanded ? '핸드오프 트래커가 열렸습니다' : ''}
      </div>

      {/* Actual panel content — aria-live="off" (announcements handled above) */}
      <div aria-live="off" className={cn("h-full flex flex-col", isTrackerExpanded ? "block" : "hidden sm:block")}>
        {isTrackerExpanded ? <TrackerFullPanel /> : <TrackerIconStrip />}
      </div>
    </>
  )
}
```

### Key Component Interfaces

```typescript
// components/hub/session-panel.tsx
interface SessionPanelProps {
  // Data from TanStack Query (no props drilling — component fetches internally)
}

interface Session {
  id: string
  title: string
  lastMessageAt: string      // ISO date
  messageCount: number
  isActive: boolean
}

// components/hub/tracker-panel.tsx
interface TrackerPanelProps {
  // Data from useHubStore — no props (Zustand direct)
}
// Renders w-12 icon strip when !isTrackerExpanded, full panel when isTrackerExpanded
// aria-expanded on <aside> in HubLayout (not here)

// components/hub/handoff-step.tsx
interface HandoffStepProps {
  step: HandoffStep
  stepNumber: number
  isLast: boolean
}
// Tailwind: "transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none"
// Entrance: translateY(20px)→0, opacity:0→1 (CSS @keyframes or Framer Motion)

// components/nexus/agent-node.tsx (React Flow custom node)
interface AgentNodeData {
  agentId: string
  agentName: string
  tier: 'T1' | 'T2' | 'T3'
  department: string
  status: 'online' | 'working' | 'offline' | 'error'
  isSelected: boolean
}
// Node: bg-zinc-900 border-2 border-zinc-700 rounded-lg p-3 w-48
// Selected: border-indigo-500
// Working: border-indigo-500 + animate-pulse indigo dot

// components/soul-editor.tsx
interface SoulEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  className?: string
}
// MUST use CodeMirror 6 — NOT <textarea>
// import { EditorView, basicSetup } from 'codemirror'
// import { markdown } from '@codemirror/lang-markdown'
// Theme: dark (bg-zinc-950 editor bg, zinc-300 text)

// components/hub/chat-area.tsx
interface ChatAreaProps {
  // No props — all from useHubStore + TanStack Query
}
// Key: auto-scroll lock when scrollTop < scrollHeight - 200px
// Resume pill: "fixed bottom-20 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full cursor-pointer shadow-lg"
```

### Third-Party Dependencies

| Library | Version | Usage | Notes |
|---------|---------|-------|-------|
| `react-router-dom` | 6.x (existing) | Routing | Already in project |
| `zustand` | 4.x (existing) | Global state | Already in project |
| `@tanstack/react-query` | 5.x (existing) | Server cache | Already in project |
| `@xyflow/react` | ^12.10.1 (existing) | NEXUS canvas | **NOT `reactflow`** — renamed in v12. Confirmed in `packages/app/package.json` |
| `codemirror` | ^6.0.2 (existing) | Soul editor | Already installed. Use `components/settings/soul-editor.tsx` — do NOT create duplicate |
| `@codemirror/lang-markdown` | ^6.5.0 (existing) | Markdown highlighting | Already installed |
| `react-markdown` | ^10.1.0 (existing) | MarkdownRenderer | Already in project (`packages/app/package.json`) |
| `lucide-react` | (existing) | Action icons | Already in project |

**Option A requires NO new layout libraries.** Pure `flex` CSS — no `react-resizable-panels`, no special panel libraries.
**No new `bun add` commands required** — all dependencies already installed in existing codebase.

### Estimated Component Count

| Category | Components | Notes |
|----------|-----------|-------|
| Layout shells | 4 | RootLayout, HubLayout, AdminLayout, AuthGuard |
| Hub components | 8 | SessionPanel, ChatArea, TrackerPanel, HandoffStep, MessageBubble, MarkdownRenderer, CostSummary, InputBar |
| NEXUS components | 3 | NexusCanvas, AgentNode, AgentConfigPanel |
| Admin pages | 7 | NexusPage, AgentsPage, AgentDetailPage, DepartmentsPage, TiersPage, EmployeesPage, AuditLogsPage |
| App pages | 12 | HubPage, AgoraPage, DashboardPage, KnowledgePage, ArgosPage, FilesPage, TradingPage, SnsPage, OpsLogPage, CostAnalyticsPage, PerformancePage, SettingsPage |
| Shared UI | 10 | Button, Input, Select, Dialog, Drawer, Toast, TierBadge, SoulEditor, StatusDot, EmptyState |
| Misc (auth, landing) | 5 | LandingPage, LoginPage, SignupPage, AdminLoginPage, AdminAuthGuard |
| **Total** | **~49** | |

---

## Scoring

| Criterion | Score | Justification |
|-----------|-------|--------------|
| **CORTHEX Vision Alignment** | **10/10** | All 8 design principles satisfied without compromise. P4 Commander's View = maximum. Military precision aesthetic achieved through permanent layout discipline. No anti-patterns. |
| **User Experience** | **8/10** | Strongest situational awareness of all 3 options. Commander's View creates professional authority feeling (+). At min-viewport (1280px) with TrackerPanel expanded post-completion (w-80), Chat=464px — too narrow for 12-page markdown investment report tables (~600px minimum) (-1). Note: at idle (w-12) Chat=736px; the 464px constraint only applies when TrackerPanel is expanded AND viewport is at 1280px minimum. Treat 1440px as soft-minimum for Hub. TrackerPanel toggle at far right = high Fitts cost for manual collapse (-1). |
| **Implementation Feasibility** | **10/10** | Pure CSS flex layout. Zero third-party dependencies beyond existing stack. Simplest implementation path: no `react-resizable-panels`, no SSE-driven collapse timers, no localStorage layout persistence. Lowest risk. |
| **Performance** | **9/10** | No layout recalculations on state change — TrackerPanel width change is pure CSS transition on known fixed elements. SSE step rows use `transition-[transform,opacity]` (not `transition-all`) to avoid full repaints (-1 for TrackerPanel's CSS `transition-[width]` which does trigger reflow, but only on handoff events not on every message). |
| **Accessibility** | **8/10** | ARIA landmarks: `<nav aria-label="Sessions">`, `<main>`, `<aside role="complementary" aria-label="핸드오프 트래커" aria-expanded={isTrackerExpanded}>`. Separate `role="status" aria-live="polite" aria-atomic="true"` live region for step announcements (prevents flood). TrackerPanel expansion announced via visually-hidden status div. `motion-reduce:transition-none` on all transitions. Focus ring: `focus-visible:ring-2 focus-visible:ring-indigo-500`. (-2: requires separate sr-only live region implementation to prevent announcement flood; `aria-expanded` on `<aside>` is non-standard but informative — toggle button needs explicit `aria-expanded`). |
| **Total** | **45/50** | |

---
---

# OPTION B: Adaptive Commander Dashboard

## Design Philosophy Analysis

### Design Movement / School

Option B follows the **Contextual / Progressive Disclosure** school — a school that emphasizes showing only what is needed at the current moment of interaction. Its design ancestors are **Material Design 3's "Expressive" guidelines** and **Linear's 2025 visual noise reduction philosophy**. The core thesis: "The interface should adapt to the user's current task, not the user to the interface."

More specifically, Option B embodies the **"reveal as affordance"** interaction pattern popularized by Linear 2025 and Vercel's new dashboard: the TrackerPanel expanding when AI work starts is not just a layout change — it IS the product demonstration. The panel expansion says "your AI team is now working." This makes the layout change semantically meaningful rather than purely structural.

The nearest interaction design precedent is **Smart Compose in Gmail**: the interface adds capabilities only when relevant (autocomplete text appears only when typing), then recedes when not needed. Option B applies this to the command center context.

### Emotional Response

Primary: **Discovery and Revelation.** The TrackerPanel expanding from `w-12` to `w-80` on the first `handoff` SSE event is designed to be the product's "wow moment." For a first-time user who has just typed a command and submitted it, the TrackerPanel appearing and populating with agent names is the exact moment CORTHEX's value proposition becomes visceral: "my AI team is actually executing a plan."

Secondary: **Generosity of Space.** In idle state, Chat is 896px (vs Option A's 624px at 1440px). This 272px difference is substantial for markdown report reading. Users spend more time reading reports than watching delegation chains. Option B correctly optimizes the dominant use case (reading) while still delivering the TrackerPanel reveal for the emotional peak (watching delegation).

Tertiary: **Mild Disorientation Risk.** The 272px ChatArea shrink when TrackerPanel expands is a genuine UX concern. Users who are reading a long report mid-stream may experience layout jump as the TrackerPanel expands. This is NOT a critical failure but is a real trade-off.

### CORTHEX Vision & Design Principles Alignment

| Principle | Option B Alignment | Issue |
|-----------|-------------------|-------|
| P1: Name the Machine | ✅ TrackerPanel reveals agent names on expansion | — |
| P2: Depth is Data | ✅ Same TrackerPanel data as Option A when expanded | — |
| P3: Zero-Delay Feedback | ✅ Same ≤50ms SSE `accepted` badge | — |
| P4: Commander's View | ⚠️ **Conditional.** Full Commander's View only when TrackerPanel is expanded. In idle state, only 3 columns visible. | -1 vs A |
| P5: Show the Org | ✅ Agent status dots visible in SessionPanel | — |
| P6: Typography Hierarchy | ✅ Same as Option A | — |
| P7: Dark Mode First-Class | ✅ Same as Option A | — |
| P8: Desktop-First, Dense | ✅ Same standards apply | — |

**Score vs Vision**: 7.5/8. P4 is partially compromised — in idle state, TrackerPanel is `w-12` icon strip, not the full Commander's View. For CORTHEX's target persona (김대표 who values control and situational awareness), this is a real gap.

### User Flow Analysis

#### Task 1: Create a New AI Agent
*Identical to Option A — Admin SPA flow is unaffected by App Hub layout choice. See Option A Task 1.*

#### Task 2: View NEXUS Org Chart

Key difference from Option A: Config panel REFLOWS canvas (flex layout) vs Option A's absolute overlay.

```
Step 4 (Option B specific): Click node → Config panel reflows canvas
        [Canvas: flex-1 → calc(flex-1 - 384px) when config open]
        [Transition: canvas reflows as config panel pushes it left]
        [Canvas at 1440px: 1200px → 816px when config open]
        [React Flow adjusts viewport automatically]

Step 5: Edit Soul in config panel
        [CodeMirror 6 within panel: height flex-1, overflow-y-auto]

Step 6: Close panel → canvas reflows back to 1200px
        [Smooth: flex transition duration-[250ms]]
```

**Option B NEXUS difference from Option A**: Canvas `flex-1` reflows when config panel appears. This means the org chart view area shrinks by 384px and React Flow must re-render the viewport. This is visually smoother than an absolute overlay (no obscuring of canvas content) but causes **a layout reflow** in the React Flow viewport — which can be disorienting if nodes were positioned at the right edge of the canvas.

#### Task 3: Chat with an Agent (Hub)

```
Step 1: App opens at /hub — 3-column: [AppSidebar][SessionPanel][ChatArea][TrackerPanel w-12]
        Layout at 1440px idle: [240px][256px][896px][48px]

Step 7 (CRITICAL): SSE handoff → TrackerPanel expands w-12 → w-80
        [LAYOUT SHIFT: ChatArea shrinks 896px → 624px (-272px)]
        [Duration: 250ms ease-in-out]
        [Text currently rendering mid-stream will reflow/reflow]

⚠️ RISK: If user is reading SSE text streaming in at 896px and TrackerPanel
        expands, text reflows into narrower column mid-read.

Step 11 (Option B — RESOLVED): SSE complete → TrackerPanel STAYS EXPANDED
        [RESOLVED: Auto-collapse timer REMOVED]
        [Reason 1: WCAG 2.2.2 (Pause, Stop, Hide) violation — user cannot pause a 3s countdown]
        [Reason 2: User may want to review chain after completion ("how long did D3 take?")]
        [Resolution: Tracker stays expanded until: (a) user clicks ChevronLeft toggle, OR]
        [           (b) user clicks "새 세션" → resetChain() clears chain → auto-collapse OK]
        [Practical effect: Option B idle ChatArea = 896px; post-completion = 624px until collapse]
```

#### Task 4: Manage Knowledge Base
*Identical to Option A — 2-column layout, no Hub column dynamics involved.*

---

## UX Deep Dive

### Information Architecture Diagram

```
OPTION B IA differs from Option A only at Hub layout state management:

HubLayout (Option B state machine):
┌─────────────────────────────────────────────────────────────┐
│                     State: IDLE                              │
│  [AppSidebar 240px][SessionPanel 256px][ChatArea 896px][T-12]│
│                          ↓ SSE 'handoff' event               │
│                     State: EXECUTING                         │
│  [AppSidebar 240px][SessionPanel 256px][ChatArea 624px][T-80]│
│     ↓ SSE 'complete' event — tracker STAYS (WCAG 2.2.2 fix)  │
│                     State: POST-COMPLETE                     │
│  [AppSidebar 240px][SessionPanel 256px][ChatArea 624px][T-80]│
│           ↓ User clicks ChevronLeft toggle OR new session     │
│                     State: IDLE (user-triggered collapse)    │
│  [AppSidebar 240px][SessionPanel 256px][ChatArea 896px][T-12]│
└─────────────────────────────────────────────────────────────┘

HubStore (Option B):
  isTrackerExpanded: boolean         // SSE-driven expand + manual collapse
  // [RESOLVED] autoCollapseTimer REMOVED — WCAG 2.2.2 compliance

Zustand store action differences:
  onCompleteEvent: → tracker STAYS EXPANDED (same as Option A)
  [User collapses manually via ChevronLeft, or new session start clears chain]
  [Option B Zustand store is now IDENTICAL to Option A]
```

*(Full IA identical to Option A except Hub layout state management)*

---

### Cognitive Load Analysis

**Option B unique cognitive load factor**: Layout state uncertainty.

In Option A, the user always knows: TrackerPanel is either `w-12` (idle) or `w-80` (active). This binary state is easy to internalize after one session.

In Option B (WCAG 2.2.2 resolution applied), there are **2 states** the user must track: idle (TrackerPanel w-12, ChatArea 896px) and active/post-complete (TrackerPanel w-80, ChatArea 624px). The auto-collapse timer was removed — Option B post-complete behavior is now identical to Option A.

**Cognitive tax (revised)**: Option B's unique cognitive overhead is the **272px ChatArea shift** when TrackerPanel expands from w-12 to w-80 on the first `handoff` SSE event. If the user is reading SSE text streaming at 896px and the TrackerPanel expands, text reflows mid-read. This is a real disruption that Option A (fixed at 624px throughout) avoids entirely.

However, Option B **reduces** cognitive load in idle state vs Option A: a full-width 896px ChatArea with no allocated Tracker space is less visually complex. The user is not managing the TrackerPanel until the AI team starts working.

**Net cognitive load**: Lower than Option A in idle state (one fewer static panel competing for attention). Equal in active state. Equal in post-complete state (tracker stays, user collapses manually — same as Option A).

---

### Fitts's Law Analysis

| Target | Option B vs A | Notes |
|--------|-------------|-------|
| ChatArea textarea | Same (wider at 896px idle — actually easier) | Lower acquisition cost idle state |
| TrackerPanel content | Same when expanded (w-80) | Identical to Option A when active |
| TrackerPanel ChevronLeft toggle | 32×32px at left edge of expanded TrackerPanel | Same as Option A — user manually collapses |

**Key difference**: Option B's Fitts's Law profile is identical to Option A for TrackerPanel management — both require user to click the toggle button to collapse. The `handoff` SSE event handles automatic expansion in both options. Auto-collapse timer was removed (WCAG 2.2.2). Tradeoff from Option A: TrackerPanel expansion causes 272px ChatArea shift (layout reflow), increasing visual disruption during active SSE streaming.

---

### Hick's Law Analysis

| Decision point | Option B specific complexity | Notes |
|---------------|---------------------------|-------|
| "Should I collapse the Tracker?" | Same as Option A — user clicks ChevronLeft manually | SSE auto-expands; user collapses |
| ~~"Is the Tracker going to disappear?"~~ | **ROW DELETED** — auto-collapse timer removed (WCAG 2.2.2). This concern no longer applies. | Option B Hick's Law profile now identical to Option A |

---

## React Implementation Spec

### Component Tree Differences from Option A

Option B uses **the same component tree as Option A** with one key difference in `HubLayout.tsx`:

```tsx
// HubLayout.tsx — Option B version
export function HubLayout() {
  const { isTrackerExpanded, onCompleteEvent } = useHubStore()

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* border-zinc-707: visible on bg-zinc-900 (Tech Spec §9.5) */}
      <AppSidebar className="w-60 shrink-0 bg-zinc-900 border-r border-zinc-700" />

      <nav aria-label="Sessions"
        className="w-64 shrink-0 bg-zinc-900 border-r border-zinc-700 flex flex-col">
        <SessionPanel />
      </nav>

      <main className="flex-1 min-w-0 flex flex-col bg-zinc-950">
        <ChatArea />
      </main>

      {/* Option B: TrackerPanel expands on SSE 'handoff', stays expanded post-complete
          aria-live removed from container (see sr-only live region in TrackerPanel) */}
      <aside
        role="complementary"
        aria-label="핸드오프 트래커"
        aria-expanded={isTrackerExpanded}
        className={cn(
          "shrink-0 bg-zinc-900 border-l border-zinc-700 flex flex-col overflow-hidden",
          "transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none",
          isTrackerExpanded ? "w-80" : "w-12"
        )}
      >
        <TrackerPanel />
      </aside>
    </div>
  )
}
```

### State Management — Option B Additions

```typescript
// stores/hub.ts — Option B (RESOLVED: auto-collapse timer REMOVED)
// Option B Zustand store is now IDENTICAL to Option A.
// Auto-collapse timer NOT stored in Zustand — timers are non-serializable values
// and belong in React component refs (React StrictMode double-invoke creates 2 timers).
// DECISION: auto-collapse timer removed entirely (WCAG 2.2.2 compliance).
// TrackerPanel stays expanded post-completion; collapses on user toggle or new session.

// onCompleteEvent — Option B (same as Option A, no timer):
onCompleteEvent: (cost, tokens) =>
  set((state) => ({
    sseStatus: 'complete',
    handoffChain: state.handoffChain.map((s, i) =>
      i === state.handoffChain.length - 1
        ? { ...s, status: 'completed', costUsd: cost, tokensUsed: tokens }
        : s
    ),
    // isTrackerExpanded remains true — user collapses manually
  })),

// If timer-based collapse is ever re-evaluated (after user testing):
// Use React useRef at COMPONENT level (NOT Zustand state):
// const autoCollapseRef = useRef<ReturnType<typeof setTimeout>>(null)
// autoCollapseRef.current = setTimeout(() => setIsTrackerExpanded(false), 3000)
// Cleanup: clearTimeout(autoCollapseRef.current) in useEffect cleanup
```

### NEXUS Canvas — Option B Flex Reflow

```tsx
// admin/pages/nexus-page.tsx — Option B version
export function NexusPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  return (
    // Option B: flex layout — config panel REFLOWS canvas
    <div className="flex h-full">
      <div className="flex-1 min-w-0 relative overflow-hidden">
        <NexusCanvas
          onNodeSelect={setSelectedNodeId}
          className="w-full h-full bg-zinc-950"
        />
      </div>

      {/* Config panel as flex sibling — canvas reflows when panel appears */}
      <div
        className={cn(
          "shrink-0 bg-zinc-900 border-l border-zinc-700 overflow-y-auto",
          "transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none",
          selectedNodeId ? "w-96" : "w-0"
        )}
      >
        {selectedNodeId && (
          <AgentConfigPanel nodeId={selectedNodeId} onClose={() => setSelectedNodeId(null)} />
        )}
      </div>
    </div>
  )
}
```

### Third-Party Dependencies

**Same as Option A** — no additional libraries required.

### Estimated Component Count

**Same count as Option A (~49 components)** — same tree, different state management logic only.

---

## Scoring

| Criterion | Score | Justification |
|-----------|-------|--------------|
| **CORTHEX Vision Alignment** | **8/10** | P1-3, P5-8 all satisfied. P4 (Commander's View) only partially met: full Commander's View requires TrackerPanel to be expanded, which happens only during SSE execution. Idle state loses 1 column of situational awareness. -2 for P4 compromise. |
| **User Experience** | **9/10** | Best idle state experience (896px ChatArea → generous markdown reading for reports). TrackerPanel expanding IS the best product reveal moment — the layout change IS the feature announcement (+). Post-completion tracker stays expanded (WCAG 2.2.2 compliant — user controls collapse) (+). 272px ChatArea shrink during TrackerPanel expansion causes mid-stream text reflow for active SSE readings (-1). |
| **Implementation Feasibility** | **9/10** | Same pure flex layout as Option A (simple). SSE state management for expand is straightforward (single `onHandoffEvent` → `setIsTrackerExpanded(true)`). No auto-collapse timer to manage — Zustand store is now identical to Option A. (-1: the 272px layout shift requires ChatArea width transitions to be handled gracefully for streaming content). |
| **Performance** | **9/10** | Same as Option A. CSS transition-[width] only. SSE step rows use transition-[transform,opacity]. No additional overhead from panel management. |
| **Accessibility** | **7/10** | Same ARIA landmarks as Option A (+). TrackerPanel expansion announced via sr-only status div (+). Auto-collapse timer REMOVED (WCAG 2.2.2 fix applied) — resolved the "content disappears without user control" violation (+). However: 272px ChatArea shift on TrackerPanel expand may disorient screen readers mid-stream (-1). `aria-expanded` attribute on TrackerPanel toggle button required (-1). |
| **Total** | **42/50** | *(+2 from timer removal: UX 8→9, Feasibility 8→9)* |

---
---

# OPTION C: Resizable Commander Panels

## Design Philosophy Analysis

### Design Movement / School

Option C follows the **Power Tool / Professional IDE** school — the design philosophy that made VS Code, JetBrains IDEs, Figma, and Grafana successful. The core thesis: **"Expert users deserve control over their workspace layout."** The panels are not fixed (authoritarian) or adaptive (paternalistic) — they are user-governed.

The interaction pattern ancestor is **Adobe Photoshop's panel system** and **VS Code's panel manager**: every panel can be resized, and the layout persists between sessions. The user invests time in configuring their workspace once, and thereafter works in a layout optimized for their specific cognitive style. Some users expand the TrackerPanel to `w-96` for detailed chain monitoring. Others collapse SessionPanel to `w-52` to maximize reading space.

The design philosophy aligns with **Don Norman's "User-in-control" affordance theory** from "The Design of Everyday Things": the resize handles are visible affordances that communicate "this can be adjusted." The `cursor-col-resize` cursor confirms the affordance on hover.

### Emotional Response

Primary: **Mastery and Ownership.** After configuring the panel layout once, the user feels "this is MY workspace." The `localStorage` persistence means the layout remembers them. For 이팀장 (technical admin, power user), this is a strong positive signal.

Secondary: **Discovery Risk.** For 김대표 (non-developer CEO), resize handles are unexpected affordances. A user who has never used VS Code or Grafana may accidentally drag the TrackerPanel to 4% (icon strip) during an active SSE stream and lose visibility of the delegation chain. This is a significant risk for CORTHEX's primary persona.

Tertiary: **Precision Control.** The `w-1` drag handles with `hover:bg-indigo-600` are subtle but discoverable. When the user discovers them (often by accident), the product gains a layer of perceived professionalism: "this tool respects my preferences."

### CORTHEX Vision & Design Principles Alignment

| Principle | Option C Alignment | Issue |
|-----------|-------------------|-------|
| P1: Name the Machine | ✅ Same TrackerPanel content as A/B | — |
| P2: Depth is Data | ✅ User can expand TrackerPanel to w-96 (wider than A/B) | (+1 vs A) |
| P3: Zero-Delay Feedback | ✅ Same ≤50ms badge | — |
| P4: Commander's View | ⚠️ **User-defined.** Can be maximized (user expands tracker) or minimized (user collapses tracker). Non-deterministic. | Risk for 김대표 |
| P5: Show the Org | ✅ Agent status in SessionPanel | — |
| P6: Typography Hierarchy | ✅ Same | — |
| P7: Dark Mode First-Class | ✅ Same | — |
| P8: Desktop-First, Dense | ✅ Power user + localStorage = maximum customization for dense users | |

**Score vs Vision**: 7/8. P4 is user-defined (not guaranteed). The Commander's View requires the user to have configured it correctly.

### User Flow Analysis

#### Task 1: Create a New AI Agent
*Identical to Option A — Admin SPA is unaffected. See Option A Task 1.*

#### Task 2: View NEXUS Org Chart

```
Step 4 (Option C specific): Config panel is ABSOLUTE (same as Option A, not flex-reflow)
        [Canvas width: unchanged at 1200px]
        [Config panel overlays right 384px of canvas]

Note: NEXUS canvas does NOT participate in react-resizable-panels
      The canvas needs stable dimensions for React Flow. Panel resizing
      in NEXUS would cause React Flow viewport resets on every drag.
      Option C: NEXUS page uses fixed absolute layout (same as Option A).
```

#### Task 3: Chat with an Agent (Hub)

```
Step 1: HubPage opens with user's saved layout from localStorage
        [Default (first visit): [AppSidebar 240px][Session 256px][Chat 624px][Tracker 320px]]
        [Power user (configured): [AppSidebar 240px][Session 208px][Chat 768px][Tracker 384px]]

Step 5: User types command → submit

Step 7: No automatic TrackerPanel expansion in Option C
        ⚠️ TrackerPanel DOES NOT auto-expand on SSE 'handoff' in pure Option C.
        [The panel is user-controlled. If user has collapsed it to icon-strip, they miss the chain]

HYBRID OPTION C+: Auto-expand TrackerPanel on 'handoff' SSE even in resizable mode
        [Override user's collapse state during active execution]
        [Restore to user's saved size after 'complete']
        [More complex: requires saving pre-handoff width and restoring it]

Step 9: User can drag TrackerPanel resize handle to widen during execution
        [Danger: dragging during active SSE stream could cause visual disruption]
        [Resize handles should be DISABLED during active SSE streaming]
        [Enable resize handles only when sseStatus === 'idle' or 'complete']
```

---

## UX Deep Dive

### Information Architecture Diagram

```
Option C IA differences:

HubLayout (Option C): Adds PanelGroup / Panel / PanelResizeHandle layer

<div className="flex h-screen bg-zinc-950 overflow-hidden">
  <AppSidebar w-60 shrink-0 />        ← NOT in PanelGroup (fixed, not resizable)

  <PanelGroup direction="horizontal" className="flex-1">
    ├── <Panel [20% default, 17% min, 27% max]>
    │   └── <nav aria-label="Sessions"> SessionPanel
    ├── <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-indigo-600 cursor-col-resize" />
    ├── <Panel [flex-1 remaining, 30% min]>
    │   └── <main> ChatArea
    ├── <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-indigo-600 cursor-col-resize" />
    └── <Panel [25% default, 4% min collapsible, 32% max]>
        └── <aside role="complementary" aria-label="핸드오프 트래커"> TrackerPanel
  </PanelGroup>

localStorage key: 'corthex-hub-panel-layout'
Stored value: [20, 51, 25]  ← [session%, chat%, tracker%]
```

---

### Cognitive Load Analysis

**Option C introduces a new cognitive layer**: panel size management.

For 이팀장 (power user): This layer is **welcome** — it's the same model as VS Code, Figma, etc. Already internalized.

For 김대표 (non-developer CEO): This layer adds confusion. The first time they accidentally drag a resize handle, they may not know how to restore the default layout. There is no "Reset to default" affordance unless explicitly built.

**Mitigation**: Add a "레이아웃 초기화" (Reset layout) button in the SessionPanel header. When clicked, `localStorage.removeItem('corthex-hub-panel-layout')` and reset to `[20, 51, 25]`. Small interaction cost for large confidence recovery.

**Verdict**: Option C's cognitive load is lower than it appears IF the target persona is 이팀장. For 김대표, it is the highest of the three options.

---

### Fitts's Law Analysis

| Target | Option C vs A/B | Notes |
|--------|----------------|-------|
| PanelResizeHandle | NEW: w-1 (4px) target width | **Very small target** — mitigated by cursor-col-resize and hover:bg-indigo-600 visual feedback |
| Session/Chat/Tracker content | Same as Option A (percentage-based but equivalent pixels) | At default 20/51/25: session=240px, chat≈612px, tracker=288px at 1200px remaining |
| "레이아웃 초기화" button | NEW addition recommended | Should be ≥36×36px |

**Key Fitts concern**: The `w-1` resize handle is a 4px target. Even with `cursor-col-resize` affordance, the acquisition area is very small. Recommendation: on hover, expand handle to `w-2` or add `-mx-1` invisible hit area:
```tsx
<PanelResizeHandle>
  <div className="w-1 h-full bg-zinc-800 hover:bg-indigo-600 transition-colors duration-150 cursor-col-resize
                  mx-0 hover:mx-[-2px] hover:w-[5px]" />
</PanelResizeHandle>
```

---

### Hick's Law Analysis

Option C does NOT add decision complexity at key task points. Panel sizing is a **configuration action** (done once) not a **per-task decision**. During a given session, the user does not need to think about panel sizes.

**Additional one-time decisions** (first visit):
1. How wide should the SessionPanel be? (n=∞ continuous, effectively Low) — user drags until it looks right
2. How wide should TrackerPanel be? (same) — one drag

After first session, localStorage removes both decisions entirely.

---

## React Implementation Spec

### Component Tree Additions

```
packages/app/src/
├── layouts/
│   └── HubLayout.tsx         ← Uses react-resizable-panels PanelGroup
├── hooks/
│   └── use-hub-panel-layout.ts  ← localStorage persistence hook
```

### Exact Tailwind Classes + react-resizable-panels

```tsx
// packages/app/src/layouts/HubLayout.tsx — Option C
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

const DEFAULT_LAYOUT = [20, 51, 25]  // [session%, chat%, tracker%]

export function HubLayout() {
  const { layout, setLayout } = useHubPanelLayout()

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* border-zinc-700: visible on bg-zinc-900 (Tech Spec §9.5) */}
      <AppSidebar className="w-60 shrink-0 bg-zinc-900 border-r border-zinc-700" />

      <PanelGroup
        direction="horizontal"
        className="flex-1"
        onLayout={setLayout}
      >
        {/* Session Panel */}
        <Panel
          defaultSize={layout[0]}
          minSize={17}          // ~204px of ~1200px remaining
          maxSize={27}          // ~324px
        >
          <nav
            aria-label="Sessions"
            className="h-full bg-zinc-900 border-r border-zinc-700 flex flex-col"
          >
            <SessionPanel />
          </nav>
        </Panel>

        {/* Resize handle 1: Session ↔ Chat */}
        <PanelResizeHandle
          className="w-1 bg-zinc-700 hover:bg-indigo-600 transition-colors duration-150 cursor-col-resize"
          aria-label="세션 패널 크기 조절"
        />

        {/* Chat Area */}
        <Panel minSize={30}>
          <main className="h-full flex flex-col bg-zinc-950">
            <ChatArea />
          </main>
        </Panel>

        {/* Resize handle 2: Chat ↔ Tracker */}
        <PanelResizeHandle
          className="w-1 bg-zinc-700 hover:bg-indigo-600 transition-colors duration-150 cursor-col-resize"
          aria-label="트래커 패널 크기 조절"
        />

        {/* Tracker Panel: aria-live on container removed (sr-only live region in TrackerPanel) */}
        <Panel
          defaultSize={layout[2]}
          minSize={4}             // ~48px icon-strip (collapsible)
          maxSize={32}            // ~384px
          collapsible={true}
          onCollapse={() => useHubStore.setState({ isTrackerExpanded: false })}
          onExpand={() => useHubStore.setState({ isTrackerExpanded: true })}
        >
          <aside
            role="complementary"
            aria-label="핸드오프 트래커"
            aria-expanded={isTrackerExpanded}
            className="h-full bg-zinc-900 border-l border-zinc-700 flex flex-col"
          >
            <TrackerPanel />
          </aside>
        </Panel>
      </PanelGroup>
    </div>
  )
}

// hooks/use-hub-panel-layout.ts
export function useHubPanelLayout() {
  const [layout, setLayout] = useLocalStorage<number[]>(
    'corthex-hub-panel-layout',
    [20, 51, 25]  // session%, chat%, tracker%
  )
  const resetLayout = () => setLayout([20, 51, 25])
  return { layout, setLayout, resetLayout }
}
```

### Third-Party Dependencies — ADDITIONAL vs Option A

| Library | Usage | Notes |
|---------|-------|-------|
| `react-resizable-panels` | Panel resizing | `bun add react-resizable-panels` |
| `usehooks-ts` or custom | `useLocalStorage` | Panel layout persistence |

### Estimated Component Count

**~52 components** (same as Option A + `use-hub-panel-layout.ts` hook + resize handle components = +3)

---

## Scoring

| Criterion | Score | Justification |
|-----------|-------|--------------|
| **CORTHEX Vision Alignment** | **7/10** | P1-3, P5-8 all satisfied. P4 (Commander's View) is user-defined and not guaranteed — non-developer CEO may accidentally break their layout and not know how to recover. Brand alignment ("Military Precision") is slightly undermined by user-configurable panels: military command centers don't have adjustable screens. -3 for P4 risk + brand dilution. |
| **User Experience** | **9/10** | Best raw UX for power users (이팀장): layout matches their workflow. localStorage persistence creates "personalized tool" feeling. Solves the 464px Chat problem elegantly. (+) Risk for김대표: accidental panel collapse during execution is a real failure mode. "Reset layout" button is required mitigation (-0.5). Best-in-class for professional users. |
| **Implementation Feasibility** | **6/10** | Requires `react-resizable-panels` (new dependency). Percentage-based sizing requires converting CORTHEX's fixed-pixel design specs to percentages. localStorage persistence adds state management complexity. Disable-resize-handles-during-SSE logic adds another edge case. Panel collapse/expand must sync with Zustand `isTrackerExpanded`. Highest implementation complexity of all 3 options. |
| **Performance** | **7/10** | `react-resizable-panels` uses ResizeObserver — minimal overhead. BUT: dragging a panel handle triggers continuous layout recalculations + React Flow NEXUS re-renders (mitigated by not using resizable panels on NEXUS page). Each layout percentage change during drag triggers `onLayout` callback + localStorage write (debounce needed). |
| **Accessibility** | **7/10** | `PanelResizeHandle` requires explicit `aria-label` for screen readers. The `w-1` handle is keyboard-accessible via `react-resizable-panels` (arrow key resizing). Screen readers need to know panels are resizable. (-2: resize handles are not intuitively discoverable for keyboard users without explicit ARIA announcement; localStorage persistence means saved layout must be validated on load to prevent inaccessibly narrow panels). |
| **Total** | **36/50** | |

---
---

# Cross-Option Comparison & Recommendation

## Score Summary (Round 2 — Revised)

| Criterion | Option A | Option B | Option C |
|-----------|---------|---------|---------|
| CORTHEX Vision Alignment | **10/10** | 8/10 | 7/10 |
| User Experience | 8/10 | **9/10** ↑ | **9/10** |
| Implementation Feasibility | **10/10** | 9/10 ↑ | 6/10 |
| Performance | 9/10 | 9/10 | 7/10 |
| Accessibility | 8/10 | 7/10 | 7/10 |
| **Total** | **45/50** | **42/50** ↑ | 36/50 |

*(↑ Option B revised up: timer removal eliminates "auto-collapse anxiety -1" UX and "timer edge cases -1" Feasibility deductions. Option A still leads on Vision Alignment + Feasibility.)*

## Decision Matrix

| Dimension | Option A wins when... | Option B wins when... | Option C wins when... |
|-----------|----------------------|----------------------|----------------------|
| Primary persona | 김대표 (non-developer CEO, values certainty) | Product demo / first impression | 이팀장 (power user admin) |
| Key value | Commander's View is always present | TrackerPanel reveal = wow moment | Layout fits user's workflow |
| Risk tolerance | Zero layout surprises acceptable | Layout shift during streaming OK | Accidental panel collapse acceptable |
| Timeline | Launch (minimum viable) | Launch + iteration | V2.1 (after V1 feedback) |

## Recommended Architecture: Option A as Base + Option B Enhancement

**Primary recommendation: Option A (Fixed Command Center)** for the initial redesign.

Rationale:
1. **Perfect vision alignment (10/10)**: CORTHEX's brand is Military Precision. Fixed layout IS the brand.
2. **Zero new dependencies**: Fastest implementation. Lowest risk for deployment.
3. **김대표 persona fit**: The non-developer CEO needs a predictable, authoritative interface. Option A provides this unconditionally.

**Option B enhancement (selective)**: Keep Option A's fixed layout, but **retain the TrackerPanel auto-expand behavior on SSE `handoff`** (Option B's best feature). This gives Option A's stable ChatArea width + Option B's reveal moment.

**Specifically**: In Option A, TrackerPanel width oscillates between `w-12` (idle) and `w-80` (active handoff). The `w-12` → `w-80` transition is the reveal moment. Since ChatArea is **pre-allocated at 624px** (not 896px like Option B idle), the transition does NOT cause layout shift. This is the correct hybrid.

**Option C for Phase 4+**: After gathering user feedback from initial launch, consider adding `react-resizable-panels` as an opt-in "Pro Layout" feature for 이팀장 persona.

---

## Final React Architecture Summary (Option A + B-hybrid)

### Router (both SPAs)

```typescript
// App SPA: createBrowserRouter with HubLayout for 3-column, RootLayout for 2-column
// Admin SPA: createBrowserRouter with AdminLayout + NexusPage absolute config panel
```

### State Management Architecture

```
Zustand stores (3):
  useAuthStore     → JWT, user, companyId
  useHubStore      → activeSession, isTrackerExpanded, sseStatus, handoffChain
  useAgentStore    → agentStatuses Record<agentId, AgentStatus>

TanStack Query caches (6 key queries):
  useSessions(companyId)
  useMessages(sessionId, page)
  useAgents(companyId)
  useDepartments(companyId)
  useKnowledgeDocs(companyId)
  useTiers(companyId)
```

### Component Count Breakdown

```
Total estimated components: ~49
  Layouts (4): RootLayout, HubLayout, AdminLayout, AuthGuard
  Hub components (8): SessionPanel, ChatArea, TrackerPanel, HandoffStep,
                      MessageBubble, MarkdownRenderer, CostSummary, InputBar
  Admin components (5): NexusCanvas, AgentNode, AgentConfigPanel,
                        AgentCreateDrawer, SoulEditor
  Admin pages (7): NexusPage, AgentsPage, AgentDetailPage, DepartmentsPage,
                   TiersPage, EmployeesPage, AuditLogsPage
  App pages (12): HubPage, AgoraPage×2, DashboardPage, KnowledgePage,
                  ArgosPage, FilesPage + others
  Shared UI (10): Button, Input, Select, Dialog, Drawer, Toast,
                  TierBadge, StatusDot, EmptyState, ProgressBar
  Auth/Landing (3): LandingPage, LoginPage, SignupPage
```

---

---

## Round 2 Fix Summary (19 Issues from Critic-A + Critic-B)

### Critical Issues Fixed (10)
1. **Root route** — Changed `<Navigate to="/hub">` → `<HomePage />`. `/` renders HomePage per Tech Spec §2.3.
2. **ReactFlow package** — `reactflow` → `@xyflow/react` (package renamed in v12). Confirmed in `packages/app/package.json: "@xyflow/react": "^12.10.1"`.
3. **Component directory** — Clarified `components/hub/` is correct (EXISTS in codebase). Added EXISTING vs NEW labels, existing component names (session-sidebar.tsx, handoff-tracker.tsx).
4. **Missing routes** — Added all 29 App SPA routes from actual `App.tsx`. Removed invented route names (`/cost-analytics` → `/costs`, added `/command-center`, `/chat`, `/jobs`, `/reports`, `/messenger`, `/org`, `/activity-log`, `/cron`, `/classified`, `/tiers`, `/departments`, `/agents`).
5. **Soul editor duplicate** — Removed `bun add codemirror`. Reference existing `components/settings/soul-editor.tsx` and `components/codemirror-editor.tsx`. Both already exist.
6. **onErrorEvent drops error** — Added `lastError: string | null` to HubStore. `onErrorEvent: (error) => set({ sseStatus: 'error', lastError: error })`.
7. **aria-live announcement flood** — Removed `aria-live` from TrackerPanel `<aside>`. Added separate `role="status" aria-live="polite" aria-atomic="true" className="sr-only"` for meaningful announcements only.
8. **TrackerPanel expansion screen reader** — Added sr-only status div announcing "핸드오프 트래커가 열렸습니다" on expand. Added `aria-expanded` on `<aside>`.
9. **Option B WCAG 2.2.2** — Auto-collapse timer REMOVED. TrackerPanel stays expanded post-completion until user manually collapses. State machine diagram updated to show POST-COMPLETE state.
10. **autoCollapseTimerId in Zustand** — Removed from Zustand state. If timer re-evaluated, pattern is `useRef` at component level (NOT Zustand — non-serializable, StrictMode unsafe).

### Major Issues Fixed (5)
11. **`duration-[250ms]`** — All `duration-250` → `duration-[250ms]` (arbitrary value syntax — Tailwind v4 doesn't have `duration-250` as built-in).
12. **Border visibility** — All `border-zinc-800` on `bg-zinc-900` panels → `border-zinc-700` (Tech Spec §9.5 warning explicitly calls this out).
13. **AdminSidebar border** — `border-zinc-200/border-zinc-800` (invalid) → `border-zinc-700`.
14. **NEXUS component tree** — Expanded to all 13 existing components in `packages/app/src/components/nexus/`. All marked EXISTING.
15. **HandoffStep.tier** — Added `HandoffStepSSE` interface showing actual SSE shape. Added note: tier must be derived from `useAgentStore.getState().agentTiers[agentId]` lookup, not from SSE event.

### Minor Issues Fixed (4)
16. **react-markdown** — Marked as `^10.1.0 (existing)` in dependencies table.
17. **NEXUS nav group** — Moved `🔍 NEXUS → /nexus` from 시스템 to 업무 (P1 feature per Vision §6.1).
18. **Option B S2 resolved** — Auto-collapse assumption resolved: timer removed permanently, not deferred.
19. **M2 qualifier** — Added "at min-viewport (1280px) with TrackerPanel expanded post-completion (w-80)" qualifier to 464px Chat concern.

---

**Round 3 Fix Summary (2 residual issues from Critic-B R2):**
- **Residual A**: Option B IA/analysis stale text updated — `autoCollapseTimer` field removed from HubStore spec, `onCompleteEvent` description updated to "tracker STAYS EXPANDED", Cognitive Load rewritten (2 states not 3, no "3-second window" anxiety, no "auto-collapse anxiety"), Fitts's Law table row updated (timer removed, manual collapse only).
- **Residual B**: All 6 remaining `border-zinc-800` in Options B/C code blocks → `border-zinc-700`. Applied to: Option B AppSidebar, SessionPanel nav, TrackerPanel aside; Option C AppSidebar, SessionPanel nav, TrackerPanel aside. Also fixed PanelResizeHandle `bg-zinc-800` → `bg-zinc-700`. Fixed IA diagram borders (Agent Status Orbs, AdminSidebar dividers).

---

**Round 3 additional fixes:**
- **Option B UX scoring**: Removed "-1 for Auto-collapse 3s timer creates anxiety". UX 8→9. Feasibility: removed "timer edge case" concern, 8→9. Total: 40→42/50. Cross-option comparison table updated.
- **Option B Hick's Law table**: "Timer handles it" → "SSE auto-expands; user collapses manually". Deleted "Is the Tracker going to disappear?" row (concern eliminated by timer removal).

---

*Phase 2-1: Web Options Deep Analysis*
*Round 3 — 22 total issues fixed (19 Round 2 + 2 Residual + 1 UX scoring)*
*Status: Awaiting final critic verification*
