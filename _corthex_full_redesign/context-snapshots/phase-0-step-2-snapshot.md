# Context Snapshot — Phase 0, Step 2: CORTHEX Vision & Identity

**Date**: 2026-03-12
**Score**: 8.75/10 (Critic-A: 8.5/10, Critic-B: 9/10) — PASS
**Output file**: `_corthex_full_redesign/phase-0-foundation/vision/corthex-vision-identity.md` (762 lines)

---

## Key Decisions & Facts Established

### Brand Identity
- **Product vision**: "조직도를 그리면 AI 팀이 움직인다." — Draw the org chart, the AI team moves
- **Name meaning**: COR (heart/core) + CORTEX (higher-order thinking) = the cerebral cortex of your business
- **Positioning**: Military Precision × AI Intelligence — NOT a chatbot, NOT playful
- **Primary personas**: 김대표 (CEO/non-developer, workspace app) and 이팀장 (Company Admin, `admin_role:'admin'`, `/admin`)

### Design System (Verified against codebase)
- **Font**: Work Sans (NOT Inter) — `packages/app/index.html` line 14 Google Fonts. Admin has NO custom font (action: add Work Sans to admin/index.html)
- **Active nav**: `bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300` (both sidebars)
- **App sidebar**: `bg-zinc-50 dark:bg-zinc-900`
- **Admin sidebar**: `bg-white dark:bg-zinc-900 border-r` (different from app)
- **Nav hover**: `hover:bg-zinc-100 dark:hover:bg-zinc-800`
- **Primary accent**: `bg-indigo-600` / `#4F46E5` (note: theme-color meta uses `#6366f1` — needs update)
- **OKLCH tokens** in `index.css`: `--color-corthex-accent/success/warning/error` — use in CSS, use Tailwind in JSX
- **Disabled (WCAG AA)**: `text-zinc-400` (#A1A1AA) both modes — 5.9:1 on zinc-950 ✅

### Hub Architecture (CRITICAL — Current ≠ Redesign Target)
- **Current state** (`secretary-hub-layout.tsx` line 276): 2-column `[SessionSidebar w-64 bg-slate-900][Main flex-1]` with `HandoffTracker` as horizontal bar at top (`bg-slate-800/60 border-b`)
- **Redesign target**: 3-column `[SessionPanel w-64][ChatArea flex-1][TrackerPanel w-80]` with TrackerPanel as right sidebar
- **Implementation requires**: (1) adopt `session-panel.tsx` as new SessionPanel, (2) migrate HandoffTracker to right column w-80, (3) migrate slate → zinc throughout Hub
- **Hub math at 1280px**: w-60 + w-64 + w-80 = 816px fixed, ChatArea = 464px minimum

### Feature Hierarchy
- **P0** (always visible): Hub 3-column + SessionPanel header agent status + App Sidebar
- **P1** (one-click): NEXUS Canvas (Admin), SketchVibe (App `/nexus` panel), AGORA (`/agora`), Dashboard, Library, Soul editor, ARGOS
- **P2** (settings): Dept/Agent/Employee CRUD, Tiers, Budget, Audit logs, Notifications
- **P3** (power user): Trading, SNS, Files, Ops Log, Cost Analytics, Soul Gym (`/performance`)

### Correct Routes (verified App.tsx)
- AGORA: `/agora` (NOT `/debate`)
- Soul Gym: `/performance` (NOT `/soul-gym`)
- SketchVibe: App `/nexus` panel (NOT a separate route)
- NEXUS Canvas: both Admin `/admin/nexus` AND App `/nexus`

### Color Layering (dark mode)
- Page: `bg-zinc-950` → Card: `bg-zinc-900` (use `border-zinc-700` for visible card border) → Panel: `bg-zinc-800` → Sub-panel: `bg-zinc-800/50`
- **Warning**: `border-zinc-800` = `bg-zinc-800` = invisible border in dark mode

### Animation
- Tracker rows: `transition-[transform,opacity]` NOT `transition-all` (prevents jank on rapid SSE events)
- AGORA speech entrance: requires custom `@keyframes speech-enter { from { transform: translateX(-16px); opacity: 0; } }` — NOT in index.css yet
- Tracker step: uses existing `slide-up` keyframe from index.css

### Typography
- Markdown rendering: Section 10.3 — full h1-h4, code inline/block, blockquote, table spec
- Soul editor: requires CodeMirror 6 (textarea insufficient for line numbers)

### 8 Design Principles
1. Name the Machine — every AI action attributed to named agent
2. Depth is Data — surface complexity, don't hide it
3. Zero-Delay Feedback — ≤50ms acknowledgment on Hub submit
4. The Commander's View — situational awareness over simplicity
5. Show the Org, Not the AI — org chart metaphor always visible
6. Hierarchy Through Typography, Not Color — color = status signals only
7. Dark Mode First-Class — dark mode is the professional reference
8. Desktop-First, Information-Dense — min-width 1280px, no mobile

---

## Issues Fixed (total: 22 across all rounds)

Key fixes:
- Work Sans (not Inter) — 2 occurrences fixed
- Hub 2-column vs 3-column REDESIGN TARGET labeling
- WCAG AA disabled color failure
- AGORA/SoulGym/SketchVibe route corrections
- OKLCH token documentation
- Dark mode layering rules
- Interactive states (button/input/focus ring spec)
- Markdown rendering scale (13 elements)
- Chat auto-scroll behavior
- TrackerPanel collapse animation
- AGORA keyframe spec

---

## Next Step
Phase 0-3: (waiting for Orchestrator instruction)
