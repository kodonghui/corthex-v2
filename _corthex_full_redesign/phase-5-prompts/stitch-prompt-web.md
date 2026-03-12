# Phase 5-1: CORTHEX Web Dashboard — Google Stitch Prompts

**Date**: 2026-03-12
**Step**: Phase 5 — Stitch Prompts, Step 5-1
**Status**: Round 1 — Fixes Applied (15 issues: 2 critical, 5 major, 8 minor from Critic-A + Critic-B)
**Based on**: Phase 0–4 all approved outputs (Option A web, Option A landing, design-tokens.md, component-strategy.md, themes-creative.md, themes-accessibility-audit.md)

---

## HOW TO USE THIS DOCUMENT

Each section is a **self-contained, copy-paste-ready prompt** for one Google Stitch session.

**Workflow**:
1. Start EVERY session with the **MASTER DESIGN SYSTEM PROMPT** (Section 0) — paste it first to establish the system
2. Then paste the **page-specific prompt** for the page you want to generate
3. Instruct Stitch: `Generate as React with Tailwind CSS`
4. Fallback if Stitch can't do React: `Generate as HTML with Tailwind CSS classes`

**Theme selection**:
- Default: Base Zinc + Indigo (this document's default — all hex values are base theme)
- To apply a creative theme: After generating, replace color tokens per Section 8 (Theme Swap Guide)
- Creative themes: T1 Synaptic Cortex, T2 Terminal Command, T3 Arctic Intelligence, T4 Neon Citadel, T5 Bioluminescent Deep

**Generation order** (recommended):
1. Master Prompt (always first in every session)
2. Section 1: Hub Main (most important — the product's signature layout)
3. Section 2: Dashboard / Operations
4. Section 3: NEXUS Org Chart
5. Section 4: Knowledge Library
6. Section 5: Admin Settings
7. Section 6: Landing Page (pre-login)
8. (Later) Section 7: AGORA Debate Room

---

## SECTION 0: MASTER DESIGN SYSTEM PROMPT

> **PASTE THIS FIRST in every Stitch session before any page prompt. It establishes the CORTHEX design system.**

---

```
CORTHEX Design System — Master Prompt

I am building CORTHEX, an AI organization management platform for non-developer CEOs (small company founders and solo investors). CORTHEX lets users build and manage AI agent teams using a visual org chart editor (called NEXUS), without writing code. The CEO types a command in Korean; AI agents (비서실장, CIO, 전문가) automatically execute, delegate, and report back.

This is NOT a chatbot. It is a command center for an AI organization. The visual language is: Military Precision × AI Intelligence. Dark, professional, information-dense. No playful elements, no rounded-pill aesthetics.

---

DESIGN SYSTEM RULES (NEVER violate these):

DARK MODE ONLY. No light mode. All surfaces:
- Page background: bg-zinc-950 (#09090B) — the root background
- Sidebar / Card / Panel: bg-zinc-900 (#18181B)
- Elevated panel / hover state: bg-zinc-800 (#27272A)
- Sub-panel (nested): bg-zinc-800/50 (50% opacity)

BORDERS:
- Standard border on ALL dark panels: border-zinc-700 (#3F3F46)
- NEVER use border-zinc-800 on dark surfaces — it is INVISIBLE on zinc-900
- Hover border: border-zinc-600 (#52525B)
- Active/focus border: border-indigo-500 (#6366F1)

PRIMARY ACCENT: indigo-600 (#4F46E5)
- Buttons: bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white
- Active nav item bg: bg-indigo-950 (#1E1B4B) text-indigo-300 (#A5B4FC)
- Submit buttons: bg-indigo-600 rounded-lg (48×48px for icon-only)
- "명령 접수됨" badge: bg-indigo-950 text-indigo-300 border-indigo-800

STATUS COLORS:
- Online / Success: text-green-500 (#22C55E) or bg-green-500
- Working / Active: text-indigo-500 (#6366F1) animate-pulse
- Warning (70%+ budget): text-amber-500 (#F59E0B)
- Error / Failed: text-red-400 (#F87171) for small text, text-red-500 (#EF4444) for icons/borders
- Offline / Disabled: text-zinc-400 (#A1A1AA)

TYPOGRAPHY: Work Sans (Google Fonts, weights 400/500/600/700)
Font link: https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap
Korean fallback: 'Work Sans', -apple-system, 'Apple SD Gothic Neo', sans-serif
Monospace (costs, IDs, data): system monospace stack (font-mono Tailwind class)

TYPE SCALE:
- Page title: text-xl font-semibold text-zinc-100 (20px/600)
- Section header: text-xs font-semibold uppercase tracking-wider text-zinc-400 (12px/600)
- Agent name prominent: text-base font-medium text-zinc-100 (16px/500)
- Body primary: text-sm text-zinc-300 (14px/400)
- Body secondary / muted: text-xs text-zinc-400 (12px/400)
- Nav item inactive: text-sm text-zinc-300 (14px/400)
- Nav item active: text-sm font-medium text-indigo-300 (14px/500)
- Monospace data (costs, IDs): font-mono text-xs text-zinc-400 (12px/400)
- Cost figure: font-mono text-sm font-medium text-zinc-400 (14px/500)

SPACING:
- Standard card padding: p-4 (16px)
- Between major cards: gap-4 or gap-6 (16–24px)
- Page content padding: p-6 (24px)
- Nav item: px-3 py-2 (12px horizontal, 8px vertical)
- NEVER use p-12 or gap-12 for decoration

COMPONENTS:
- Primary Button: bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150
- Ghost Button: border border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-4 py-2 rounded-lg text-sm transition-colors duration-150
- Input: bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
- Card: bg-zinc-900 border border-zinc-700 rounded-lg p-4
- TierBadge T1 (Manager): font-mono text-xs bg-indigo-950 border border-indigo-800 text-indigo-300 px-1.5 py-0.5 rounded
- TierBadge T2 (Specialist): font-mono text-xs bg-violet-950 border border-violet-800 text-violet-300 px-1.5 py-0.5 rounded
- TierBadge T3 (Worker): font-mono text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded
- StatusDot (online): h-2 w-2 rounded-full bg-green-500
- StatusDot (working): h-2 w-2 rounded-full bg-indigo-500 animate-pulse
- StatusDot (offline): h-2 w-2 rounded-full bg-zinc-600

DESKTOP-ONLY (min-width 1440px for Hub, 1280px for all other pages). NO mobile breakpoints.
Exception: Landing page (Section 6) only — add `sm:` scroll-only breakpoints for mobile. All app/admin pages: zero mobile breakpoints.

ANIMATION — ALL animated elements MUST include motion-reduce:
- animate-pulse → always add `motion-reduce:animate-none`
- animate-bounce → always add `motion-reduce:animate-none`
- animate-spin → always add `motion-reduce:animate-none`
- All CSS transitions → add `motion-reduce:transition-none`
Example: `h-2 w-2 rounded-full bg-indigo-500 animate-pulse motion-reduce:animate-none`

ARIA REQUIREMENTS (add to every page):
- App sidebar: `<nav aria-label="주 메뉴">` + active item: `aria-current="page"`
- Session panel: `<nav aria-label="대화 목록">`
- TrackerPanel: `<aside aria-label="위임 체인 트래커" aria-expanded={isExpanded}>`
- Main content: `<main>`
- Dialogs/Modals: `<dialog aria-modal="true" aria-labelledby="dialog-title-id">`
- Decorative status dots (sidebar agent status): `aria-hidden="true"` — the text label carries the meaning
- Interactive status dots (session list, tracker): must have adjacent visible text OR aria-label
- Drawer panels: `<aside role="complementary" aria-label="에이전트 설정">` + `inert={!open}` when closed
```

---

## SECTION 1: HUB MAIN — 4-COLUMN COMMAND CENTER

> **The signature screen. CORTHEX's #1 most important page. The user issues commands and watches their AI team execute in real time.**

---

```
Generate as React with Tailwind CSS.

Design CORTHEX Hub — the main command interface for an AI organization management platform.

This is a 4-column fixed layout at 1440px viewport width. It is the product's most important screen — the CEO's command center.

CORTHEX is NOT a chatbot app. The Hub is a mission control panel where the user types a command in Korean (e.g., "삼성전자 분석해줘") and watches their AI team (비서실장 → CIO → 전문가) delegate and execute the task in real time. The 4 columns are always visible simultaneously — this is "situational awareness design."

---

LAYOUT (exact widths — DO NOT approximate):
[AppSidebar 240px][SessionPanel 256px][ChatArea flex-1 ~624px][TrackerPanel 320px]

Total fixed width at 1440px: 240 + 256 + 320 = 816px fixed → ChatArea = 624px

CONTAINER: div className="flex h-screen bg-zinc-950 overflow-hidden"

---

COLUMN 1 — AppSidebar (w-60 = 240px, fixed height, bg-zinc-900, border-r border-zinc-700)

Top section (64px height, border-b border-zinc-700):
- CORTHEX logo mark (abstract node-graph icon, 24×24px, indigo-400)
- "CORTHEX" wordmark: text-base font-bold text-zinc-100 tracking-tight
- Version tag: text-xs text-zinc-600 "v2"

Agent Status Bar (below logo, px-4 py-2, bg-zinc-950/50):
- Label: text-xs text-zinc-500 uppercase tracking-wider "AI 팀 현황"
- 3 status rows (each: inline-flex items-center gap-2):
  - StatusDot working (indigo-500 animate-pulse) + "비서실장" text-xs text-zinc-300 + "처리중" text-xs text-indigo-400
  - StatusDot online (green-500) + "CIO" text-xs text-zinc-300 + "온라인" text-xs text-zinc-500
  - StatusDot offline (zinc-600) + "백엔드전문가" text-xs text-zinc-300 + "오프라인" text-xs text-zinc-600

Nav (flex-col, overflow-y-auto, flex-1, px-3 py-4, gap-1):
Group label: text-xs font-semibold uppercase tracking-wider text-zinc-500 px-3 py-2 mt-4 first:mt-0

업무 group:
  🏠 홈 — text-sm text-zinc-300 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors
  🔗 허브 — ACTIVE: bg-indigo-950 text-indigo-300 font-medium border-l-2 border-indigo-500 px-3 py-2 rounded-lg (left border indicates active)
  💬 AGORA — inactive style
  🔍 NEXUS — inactive style
  📈 대시보드 — inactive style
  🗣️ ARGOS — inactive style

운영 group (collapsed, show toggle chevron):
  Shows: 📄 라이브러리, 📁 파일, 📊 비용분석, 💪 성능, 📱 SNS, 💭 전략 ...and 10 more

시스템 group:
  ⏰ ARGOS
  ⚙️ 설정

Bottom: Avatar + "김대표" text-sm text-zinc-300 + logout icon (Lucide LogOut h-4 w-4 text-zinc-500)

---

COLUMN 2 — SessionPanel (w-64 = 256px, bg-zinc-900, border-r border-zinc-700)

Header (px-4 py-3, border-b border-zinc-700, flex justify-between items-center):
- "대화 목록" text-sm font-semibold text-zinc-100
- "새 대화" button: inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 (+ Lucide Plus icon h-3.5 w-3.5)

Session list (overflow-y-auto, flex-col, gap-1, px-2 py-2):

Date group header: text-xs text-zinc-500 uppercase tracking-wider px-2 py-1 "오늘"

Session item (ACTIVE state):
  div className="bg-zinc-800 border border-indigo-500/30 rounded-lg px-3 py-2.5 cursor-pointer"
  - SessionTitle: text-sm font-medium text-zinc-100 truncate "삼성전자 분석"
  - Time + status row: text-xs text-zinc-500 "14:32" + inline StatusDot working (h-2 w-2 rounded-full bg-indigo-500 animate-pulse motion-reduce:animate-none) + "처리중" text-xs text-indigo-400
  - Preview: text-xs text-zinc-500 truncate "비서실장 → CIO 위임 중..."
  - CostBadge: font-mono text-xs text-zinc-600 "$0.0042"

Session item (INACTIVE state × 4):
  div className="hover:bg-zinc-800/50 rounded-lg px-3 py-2.5 cursor-pointer transition-colors duration-150"
  - Title: text-sm text-zinc-300 truncate "현대차 실적 분석"
  - Time: text-xs text-zinc-500 "어제 09:14"
  - Preview: text-xs text-zinc-600 truncate "완료됨 · $0.0089 · 2,140 토큰"

Date group: "어제" with 2 more sessions below

---

COLUMN 3 — ChatArea (flex-1, min-w-0, bg-zinc-950, flex flex-col)

ChatHeader (px-4 py-3, border-b border-zinc-700, bg-zinc-900):
- Session title: "삼성전자 분석" text-sm font-semibold text-zinc-100
- Right: "2024.03.12" text-xs text-zinc-500

MessageList (flex-1, overflow-y-auto, flex flex-col, px-4 py-4, gap-4):

USER MESSAGE (right-aligned):
  div className="flex justify-end"
    div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[70%]"
      text-sm "삼성전자 분석해줘"
    div text-xs text-zinc-600 mt-1 text-right "14:32"

"명령 접수됨" BADGE (shown immediately after user message):
  div className="flex justify-center"
    span className="inline-flex items-center gap-1 bg-indigo-950 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-800"
      Lucide CheckCircle h-3 w-3 + "명령 접수됨"

AGENT MESSAGE (left-aligned):
  div className="flex items-start gap-3"
    div (agent avatar): h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center
      Lucide CircleUser h-4 w-4 text-zinc-400
    div (message container):
      div (agent header row): flex items-center gap-2 mb-1.5
        span text-xs font-medium text-zinc-300 "비서실장"
        TierBadge T1: bg-indigo-950 border-indigo-800 text-indigo-300 font-mono text-xs px-1.5 py-0.5 rounded "T1"
        StatusDot working: h-2 w-2 rounded-full bg-indigo-500 animate-pulse motion-reduce:animate-none
        span text-xs text-zinc-500 "14:33"
      div (message bubble): bg-zinc-900 border border-zinc-700 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]
        - Markdown rendered content:
          h2 text-base font-semibold text-zinc-100 "삼성전자 분석 결과"
          p text-sm text-zinc-300 leading-relaxed (analysis content)
          - Code block: bg-zinc-950 border border-zinc-700 rounded-lg p-3 font-mono text-xs text-zinc-300
          - Table: w-full text-sm, thead bg-zinc-800 font-semibold text-zinc-300, td px-3 py-2 border border-zinc-700
      div (cost badge, shown after completion): font-mono text-xs text-zinc-500 mt-1.5
        "비용 $0.0042 · 1,240 토큰"

STREAMING STATE (agent typing):
  Same structure as agent message but:
  - Message bubble shows: div className="flex gap-1 items-center py-1"
    3 dots: span h-2 w-2 rounded-full bg-zinc-600 animate-bounce motion-reduce:animate-none (with staggered animation delays via style={{ animationDelay: '0ms/150ms/300ms' }})
  - Agent header: StatusDot animate-pulse

InputBar (border-t border-zinc-700, px-4 py-3, bg-zinc-900):
  div className="flex items-end gap-3"
    textarea className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 resize-none min-h-[40px] max-h-[160px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      placeholder="명령을 입력하세요..."
    button className="h-12 w-12 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150"
      Lucide Send h-5 w-5 text-white

---

COLUMN 4 — TrackerPanel EXPANDED STATE (w-80 = 320px, bg-zinc-900, border-l border-zinc-700)

CRITICAL: TrackerPanel width transition (signature Hub animation):
  Container className: "shrink-0 bg-zinc-900 border-l border-zinc-700 flex flex-col transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none"
  Expanded: w-80 (320px) | Collapsed: w-12 (48px)
  Note: use duration-[250ms] NOT duration-250 (Tailwind v4 arbitrary value syntax)

TrackerHeader (px-4 py-3, border-b border-zinc-700, flex justify-between items-center):
- Left: Lucide Network h-4 w-4 text-indigo-400 + "위임 체인" text-sm font-semibold text-zinc-100
- Right: collapse toggle (ChevronRight h-4 w-4 text-zinc-400 hover:text-zinc-200)

Chain depth indicator (px-4 py-2, bg-zinc-950/50, text-xs text-zinc-500):
  "D1 → D2 → D3 진행 중" + elapsed: text-xs font-mono text-zinc-400 "34s"

HandoffStep list (px-3 py-3, flex flex-col, gap-2):

STEP 1 — COMPLETED:
  div className="flex items-start gap-2.5 px-2 py-2 rounded-lg bg-zinc-800/30"
    Lucide Check h-4 w-4 text-green-500 shrink-0 mt-0.5
    div:
      div flex items-center gap-1.5:
        span text-xs font-medium text-zinc-300 "비서실장"
        TierBadge T1 (indigo, compact): text-[10px] bg-indigo-950 border-indigo-800 text-indigo-300 px-1 py-0 rounded "T1"
        span font-mono text-[10px] text-zinc-600 "D1"
      div text-[10px] text-zinc-500 "0.8s · 완료"

STEP 2 — ACTIVE (currently executing):
  div className="border-l-2 border-indigo-500 pl-2 py-2 bg-indigo-950/20 rounded-r-lg"
    div flex items-center gap-1.5:
      StatusDot: h-2 w-2 bg-indigo-500 animate-pulse motion-reduce:animate-none rounded-full
      span text-xs font-medium text-zinc-100 "CIO"
      TierBadge T1 (indigo compact) "T1"
      span font-mono text-[10px] text-zinc-600 "D2"
    div text-[10px] text-zinc-400 animate-pulse motion-reduce:animate-none "분석 중... 12s"

STEP 3 — PENDING:
  div className="flex items-start gap-2.5 px-2 py-2 opacity-50"
    Lucide Clock h-4 w-4 text-zinc-600 shrink-0 mt-0.5
    div:
      div flex items-center gap-1.5:
        span text-xs text-zinc-500 "기술분석전문가"
        TierBadge T2 (violet compact) "T2"
        span font-mono text-[10px] text-zinc-600 "D3"
      div text-[10px] text-zinc-600 "대기 중"

COLLAPSED STATE (icon strip w-12):
  div className="flex flex-col items-center pt-4 gap-3"
    Lucide Network h-5 w-5 text-indigo-400 (with tooltip "위임 체인")
    div h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse (shows active)
    span font-mono text-[10px] text-zinc-500 [writing-mode:vertical-rl] rotate-180 "34s"

---

Generate as React with Tailwind CSS. All text content in Korean where shown. Use exact hex colors and Tailwind classes specified. Do NOT add any mobile responsive breakpoints — this is desktop-only at min 1440px.
```

---

## SECTION 2: DASHBOARD / OPERATIONS (대시보드)

> **Operations status page. The CEO's daily check-in: AI team health, budget consumption, recent activity.**

---

```
Generate as React with Tailwind CSS.

Design CORTHEX Dashboard — the operations status page for an AI organization management platform.

This is a 2-column layout: [AppSidebar 240px fixed][Main content flex-1].
Dashboard is the "mission control panel" — dense information, no whitespace decoration.

CONTAINER: div className="flex h-screen bg-zinc-950 overflow-hidden"

---

COLUMN 1 — AppSidebar (same as Hub, w-60 = 240px, bg-zinc-900, border-r border-zinc-700)
Active nav item: "📈 대시보드" — bg-indigo-950 text-indigo-300 font-medium border-l-2 border-indigo-500 px-3 py-2 rounded-lg
All other nav items same as Hub sidebar spec. Status bar shows 3 agents.

---

COLUMN 2 — Main Content (flex-1 overflow-auto)

PageHeader (px-6 py-5, border-b border-zinc-700, bg-zinc-900):
  h1 text-xl font-semibold text-zinc-100 "대시보드"
  p text-sm text-zinc-400 "AI 팀 운영 현황 · 2026년 3월 12일"

Content area (p-6, flex flex-col, gap-6):

ROW 1 — KPI Cards (grid grid-cols-4 gap-4):

KPI Card 1 — Active Tasks:
  div bg-zinc-900 border border-zinc-700 rounded-lg p-4:
    div text-xs text-zinc-500 uppercase tracking-wider mb-2 "진행중 작업"
    div text-3xl font-bold text-zinc-100 "8"
    div text-xs text-zinc-400 mt-1 flex items-center gap-1:
      Lucide TrendingUp h-3.5 w-3.5 text-green-500
      "전일 대비 +3"

KPI Card 2 — Today's Cost:
  div bg-zinc-900 border border-zinc-700 rounded-lg p-4:
    div text-xs text-zinc-500 uppercase tracking-wider mb-2 "오늘 비용"
    div text-3xl font-bold text-zinc-100 font-mono "$0.84"
    div text-xs text-zinc-400 mt-1 "월 예산 12.4% 사용"

KPI Card 3 — Completed Tasks:
  div bg-zinc-900 border border-zinc-700 rounded-lg p-4:
    div text-xs text-zinc-500 uppercase tracking-wider mb-2 "완료 작업 (오늘)"
    div text-3xl font-bold text-zinc-100 "23"
    div text-xs text-zinc-400 mt-1 flex items-center gap-1:
      StatusDot h-1.5 w-1.5 green-500
      "평균 응답 4.2s"

KPI Card 4 — Active Agents:
  div bg-zinc-900 border border-zinc-700 rounded-lg p-4:
    div text-xs text-zinc-500 uppercase tracking-wider mb-2 "온라인 에이전트"
    div text-3xl font-bold text-zinc-100 "7 / 12"
    div text-xs text-zinc-400 mt-1 "3 처리중 · 4 대기중"

---

ROW 2 — Budget Bars + Agent Status (grid grid-cols-3 gap-4):

Budget Panel (col-span-2, bg-zinc-900 border border-zinc-700 rounded-lg p-4):
  Header: text-sm font-semibold text-zinc-100 mb-4 "티어별 예산 사용"

  Budget Row per tier (flex flex-col gap-3):

  Tier 1 (Manager) row:
    div flex justify-between items-center mb-1.5:
      div flex items-center gap-2:
        TierBadge "T1 관리자" (bg-indigo-950 border-indigo-800 text-indigo-300 font-mono text-xs)
        span text-xs text-zinc-400 "비서실장, CIO"
      span font-mono text-xs text-zinc-400 "$6.20 / $10.00"
    ProgressBar:
      div bg-zinc-800 rounded-full h-2:
        div bg-green-500 h-2 rounded-full style="width:62%" (→ green: 0-70%)
    span text-xs text-zinc-500 "62%"

  Tier 2 (Specialist) row: (similar, 78% → amber warning)
    Label: "T2 전문가" + "$7.80 / $10.00"
    ProgressBar: div bg-amber-500 h-2 rounded-full width:78% (70-90% → amber)
    Status badge: text-xs text-amber-500 "⚠ 78% — 예산 주의"

  Tier 3 (Worker) row: (similar, 15% → green safe)
    Label: "T3 워커" + "$0.90 / $6.00"
    ProgressBar: div bg-green-500 h-2 rounded-full width:15%

Agent Status Panel (col-span-1, bg-zinc-900 border border-zinc-700 rounded-lg p-4):
  Header: text-sm font-semibold text-zinc-100 mb-4 "에이전트 현황"

  Agent rows (flex flex-col gap-2.5):
  Each row: flex justify-between items-center:
    Left: flex items-center gap-2:
      StatusDot (green/indigo-pulse/zinc)
      span text-sm text-zinc-300 "비서실장"
      TierBadge compact T1
    Right: text-xs text-zinc-500 "처리중 · 34s"

  Show 6 agents:
  - 비서실장 (T1): indigo pulse dot · "처리중 · 34s"
  - CIO (T1): indigo pulse dot · "위임 중"
  - 기술분석전문가 (T2): indigo pulse dot · "분석 중"
  - 전략팀장 (T2): green dot · "온라인"
  - 리서치에이전트 (T3): green dot · "대기중"
  - 백엔드전문가 (T3): zinc dot · "오프라인"

---

ROW 3 — Recent Activity + ARGOS Status (grid grid-cols-2 gap-4):

Recent Activity (bg-zinc-900 border border-zinc-700 rounded-lg p-4):
  Header: text-sm font-semibold text-zinc-100 mb-3 "최근 활동"

  Activity items (flex flex-col, divide-y divide-zinc-700):
  Each item: flex items-start gap-3 py-2.5:
    Icon (Lucide, h-4 w-4 in colored circle h-7 w-7 rounded-full):
      - CheckCircle: bg-green-500/10 text-green-500 (completed)
      - AlertCircle: bg-amber-500/10 text-amber-500 (warning)
      - Network: bg-indigo-500/10 text-indigo-400 (delegation)
    Content:
      p text-xs text-zinc-300 "삼성전자 분석 완료 — 비서실장"
      span font-mono text-[10px] text-zinc-500 "14:32 · 1,240 토큰 · $0.0042"

  Show 5 activity items:
  1. ✓ "삼성전자 분석 완료 — 비서실장 → CIO → 기술분석전문가" | "14:32 · $0.0042"
  2. ⚠ "T2 예산 78% 도달" | "14:20"
  3. ↔ "현대차 실적 — CIO에서 전략팀장으로 위임" | "13:55 · D2→D3"
  4. ✓ "ARGOS 스케줄 실행 — 시황분석" | "13:00 · $0.0031"
  5. ✓ "LG전자 보고서 생성 완료" | "12:44 · $0.0089"

ARGOS Status (bg-zinc-900 border border-zinc-700 rounded-lg p-4):
  Header: text-sm font-semibold text-zinc-100 mb-3 "ARGOS 스케줄"
  Subtitle: text-xs text-zinc-500 "예약 작업 · 100개의 눈, 항상 감시"

  Schedule items (flex flex-col gap-2):
  Each item: flex justify-between items-center bg-zinc-800/50 rounded-lg px-3 py-2.5:
    Left:
      p text-xs font-medium text-zinc-300 "시황분석 리포트"
      span text-[10px] text-zinc-500 "매일 06:00 · 비서실장"
    Right:
      span text-[10px] text-green-500 "활성" + StatusDot green h-1.5 w-1.5
      span text-[10px] text-zinc-600 "다음: 06:00"

  4 schedules shown. Last row: "+ 7개 더" text-xs text-zinc-500 text-center mt-1

---

Generate as React with Tailwind CSS. Korean text as shown. Desktop-only, no responsive breakpoints. Min-width 1280px.
```

---

## SECTION 3: NEXUS ORG CHART VIEW (Static Placeholder)

> **Admin-facing NEXUS page. The live canvas uses @xyflow/react — Stitch generates the chrome/UI shell; the actual canvas nodes will be added manually later.**

---

```
Generate as React with Tailwind CSS.

Design CORTHEX NEXUS — the visual AI organization chart editor page.

This page shows an admin managing the AI org structure. The center canvas area (where nodes and connections appear) will be replaced with a live ReactFlow (@xyflow/react) canvas in code — design it as a dark canvas placeholder with sample node visuals.

LAYOUT: [AdminSidebar 240px][Main flex-1 relative overflow-hidden] — NO padding on main (canvas fills edge-to-edge)

CONTAINER: div className="flex h-screen bg-zinc-950 overflow-hidden"

---

COLUMN 1 — AdminSidebar (w-60 = 240px, bg-zinc-900, border-r border-zinc-700)

Top: Company selector dropdown (bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100, full width in px-4)
  Shows: "CORTHEX HQ" with ChevronDown icon

Admin Nav (below dropdown, flex flex-col gap-1, px-3 py-4):
  text-xs font-semibold uppercase tracking-wider text-zinc-500 px-3 py-2 "조직 관리"

  Active item: 🔍 NEXUS — bg-indigo-950 text-indigo-300 border-l-2 border-indigo-500 px-3 py-2 rounded-lg
  Other items (text-sm text-zinc-300 hover:bg-zinc-800 px-3 py-2 rounded-lg):
    🏢 부서 관리
    🤖 에이전트
    👥 직원 관리
    🎖️ 티어 설정

  text-xs font-semibold uppercase tracking-wider text-zinc-500 px-3 py-2 mt-4 "운영"
    📊 비용 분석
    📋 감사 로그
    ⏰ ARGOS 관리

  text-xs font-semibold uppercase tracking-wider text-zinc-500 px-3 py-2 mt-4 "시스템"
    ⚙️ 설정
    🔒 보안

---

COLUMN 2 — NEXUS Canvas Area (flex-1, position relative)

Toolbar (absolute top-0 left-0 right-0, z-10, h-14, bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-700, flex items-center px-4 gap-3):

  Left: "NEXUS" text-sm font-semibold text-zinc-100 + Lucide Network h-4 w-4 text-indigo-400

  Action buttons (flex gap-2):
    button "에이전트 추가" bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5
      Lucide Plus h-3.5 w-3.5
    button "부서 추가" border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs px-3 py-1.5 rounded-lg
    separator: div w-px h-6 bg-zinc-700 mx-1
    button (save state indicator): flex items-center gap-1 text-xs text-green-500
      Lucide CheckCircle h-3.5 w-3.5 + "즉시 적용됨"

  Right:
    Zoom controls: bg-zinc-800 border border-zinc-700 rounded-lg flex:
      button h-8 w-8 flex items-center justify-center hover:bg-zinc-700 Lucide ZoomIn h-4 w-4 text-zinc-400
      div w-px h-8 bg-zinc-700
      button h-8 w-8 flex items-center justify-center hover:bg-zinc-700 Lucide ZoomOut h-4 w-4 text-zinc-400
      div w-px h-8 bg-zinc-700
      button h-8 w-8 flex items-center justify-center hover:bg-zinc-700 Lucide Maximize2 h-4 w-4 text-zinc-400

Canvas (absolute top-14 left-0 right-0 bottom-0, bg-zinc-950):

  Background grid pattern (subtle dots):
    background-image: radial-gradient(circle, #3F3F46 1px, transparent 1px)
    background-size: 24px 24px

  Org chart nodes — draw these as visual mock-ups:

  ROOT NODE — "비서실장" (T1 Manager, positioned center-top area):
    div 160px × 80px, bg-zinc-900 border-2 border-indigo-500 rounded-lg p-3 shadow-lg shadow-indigo-500/10:
      div flex items-center gap-2 mb-1:
        StatusDot: h-2 w-2 bg-indigo-500 animate-pulse motion-reduce:animate-none rounded-full
        TierBadge "T1" bg-indigo-950 border-indigo-800 text-indigo-300 font-mono text-[10px] px-1 py-0.5 rounded
      p text-sm font-medium text-zinc-100 "비서실장"
      p text-[10px] text-zinc-500 "임원실"

  CONNECTION LINE from 비서실장 down: vertical line + branch
    stroke: #4F46E5 (indigo-600), stroke-width: 2, with arrow marker

  LEVEL 2 NODES (2 nodes side by side):

  "CIO" node (T1, selected state):
    div 160px × 80px, bg-zinc-900 border-2 border-indigo-400 rounded-lg p-3 shadow-lg shadow-indigo-500/20:
      Top: StatusDot green + "T1" badge
      "CIO" text-sm font-medium text-zinc-100
      "정보전략팀" text-[10px] text-zinc-500

  "CTO" node (T1):
    div 160px × 80px, bg-zinc-900 border border-zinc-700 rounded-lg p-3:
      StatusDot green + "T1"
      "CTO" text-sm text-zinc-100
      "기술팀" text-[10px] text-zinc-500

  Connection lines from CIO and CTO down

  LEVEL 3 NODES (3 nodes):
  "시황분석전문가" (T2), "기술분석전문가" (T2), "백엔드전문가" (T3)
    Each: 148px × 72px, bg-zinc-900 border border-zinc-700 rounded-lg p-3
    Show appropriate tier badge (T2=violet, T3=zinc)

  Connection lines: stroke #52525B (zinc-600), stroke-width: 1.5

AgentConfigPanel (RIGHT SIDE PANEL, shown when node is selected):
  absolute right-0 top-14 h-full w-96 bg-zinc-900 border-l border-zinc-700 z-10

  Header: px-4 py-3 border-b border-zinc-700 flex justify-between items-center:
    div:
      p text-sm font-semibold text-zinc-100 "CIO"
      div flex items-center gap-2 mt-0.5:
        TierBadge T1 (indigo)
        StatusDot green + text-xs text-zinc-400 "온라인"
    Lucide X h-4 w-4 text-zinc-400 hover:text-zinc-200 cursor-pointer

  Tabs (px-4 pt-3 border-b border-zinc-700, flex gap-4):
    "기본정보" tab (active): text-sm font-medium text-indigo-300 border-b-2 border-indigo-500 pb-3
    "Soul 편집" tab: text-sm text-zinc-400 hover:text-zinc-300 pb-3

  Content (px-4 py-4, flex flex-col gap-4):
    Field: label text-xs text-zinc-500 uppercase tracking-wider "에이전트 이름"
      input bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 w-full
      value: "CIO"

    Field: "부서"
      div bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300
      "정보전략팀 (IT Department)"

    Field: "티어"
      Radio buttons (flex gap-4):
        T1 (selected): bg-indigo-950 border-indigo-500 text-indigo-300 rounded px-3 py-1.5 text-xs flex items-center gap-1.5
          filled radio circle + "T1 관리자"
        T2: border border-zinc-700 text-zinc-400 rounded px-3 py-1.5 text-xs "T2 전문가"
        T3: border border-zinc-700 text-zinc-400 rounded px-3 py-1.5 text-xs "T3 워커"

    Field: "부모 에이전트"
      div bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 flex justify-between items-center
        "비서실장" + ChevronDown h-4 w-4 text-zinc-500

    Separator: hr border-zinc-700

    "Soul 미리보기" section:
      div bg-zinc-950 border border-zinc-700 rounded-lg p-3 font-mono text-xs text-zinc-400 max-h-32 overflow-hidden
      "# CIO — 최고정보책임자\n\n당신은 CORTHEX의 CIO입니다. 비서실장으로부터..."
      div (fade overlay): from-transparent to-zinc-950 h-8 bg-gradient-to-b rounded-b-lg absolute bottom-0

    "Soul 편집 →" link: text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1

  Footer (px-4 py-3 border-t border-zinc-700, flex gap-2):
    button "즉시 적용됨" (save): w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg
    button (destructive delete): border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm py-2 px-3 rounded-lg
      Lucide Trash2 h-4 w-4

---

Generate as React with Tailwind CSS. Note: The actual canvas nodes will be replaced with @xyflow/react ReactFlow nodes in code — design as a static visual representation that shows the org chart concept. Desktop-only, no responsive breakpoints.
```

---

## SECTION 4: KNOWLEDGE LIBRARY (라이브러리)

> **The semantic knowledge base. Users and agents store documents that power AI responses.**

---

```
Generate as React with Tailwind CSS.

Design CORTHEX Knowledge Library — the semantic knowledge base management page.

LAYOUT: [AppSidebar 240px fixed][Main content flex-1 overflow-auto]
CONTAINER: div className="flex h-screen bg-zinc-950 overflow-hidden"

COLUMN 1 — AppSidebar: same structure as Hub. Active item: "📄 라이브러리"

COLUMN 2 — Main Content:

PageHeader (px-6 py-5, border-b border-zinc-700, bg-zinc-900):
  flex justify-between items-center:
    div:
      h1 text-xl font-semibold text-zinc-100 "라이브러리"
      p text-sm text-zinc-400 "지식베이스 — 의미 기반 검색"
    button "문서 추가" bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2
      Lucide Plus h-4 w-4

Content area (p-6, flex flex-col gap-6):

Search + Filter Row (flex gap-3 items-center):
  SearchBar (flex-1):
    div relative:
      Lucide Search h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2
      input bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none
      placeholder "문서 검색 (의미 기반)..."

  Filter chips (flex gap-2):
    "전체" chip: bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs px-3 py-1.5 rounded-full (active)
    "파일" chip: bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs px-3 py-1.5 rounded-full hover:bg-zinc-700
    "URL" chip: same inactive style
    "텍스트" chip: same inactive style

Stats row (flex gap-4 text-xs text-zinc-500):
  "전체 문서: 24개" · "총 벡터: 1,847개" · "마지막 업데이트: 3분 전"

Document Grid (grid grid-cols-3 gap-4):

Document Card (bg-zinc-900 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors duration-150):

  Card header (flex justify-between items-start mb-3):
    Left: flex items-center gap-2:
      Type icon (rounded bg h-8 w-8 flex items-center justify-center rounded-lg):
        PDF: bg-red-500/10 Lucide FileText h-4 w-4 text-red-400
        URL: bg-indigo-500/10 Lucide Globe h-4 w-4 text-indigo-400
        Text: bg-zinc-700 Lucide FileText h-4 w-4 text-zinc-400
      div:
        p text-sm font-medium text-zinc-100 truncate "삼성전자 2024 연간보고서"
        p text-xs text-zinc-500 "PDF · 2.4MB"

    Embedding status:
      "완료" badge: bg-green-500/10 text-green-500 text-[10px] px-2 py-0.5 rounded-full border border-green-500/20
      OR "임베딩 중" badge: bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded-full (with Loader2 animate-spin h-2.5 w-2.5)

  Card body:
    p text-xs text-zinc-400 line-clamp-2 "삼성전자의 2024 회계연도 연간 실적 보고서. 매출, 영업이익, 사업부별 실적..."
    div flex items-center gap-2 mt-3 text-[10px] text-zinc-600:
      "벡터: 234개" · "추가: 2026.03.10"

  Card footer (flex justify-between items-center mt-3 pt-3 border-t border-zinc-700):
    div flex items-center gap-1 text-[10px] text-zinc-500:
      Lucide Clock h-3 w-3 + "3일 전 추가"
    div flex gap-2:
      button (view): Lucide Eye h-4 w-4 text-zinc-500 hover:text-zinc-300
      button (delete): Lucide Trash2 h-4 w-4 text-zinc-500 hover:text-red-400

Show 9 document cards in the grid (3 rows × 3 cols):
  Row 1: PDF "삼성전자 연간보고서" (완료), URL "카카오 IR 페이지" (완료), Text "CORTHEX 사용 지침" (완료)
  Row 2: PDF "현대차 실적발표" (임베딩 중 — show loading badge), URL "Bloomberg 원자재" (완료), PDF "LG전자 보고서" (완료)
  Row 3: Text "투자 전략 지침서" (완료), URL "네이버 금융 지수" (완료), PDF "시장 분석 프레임워크" (완료)

Empty state (if no docs — show as reference):
  div flex flex-col items-center justify-center py-16 gap-3:
    Lucide Database h-10 w-10 text-zinc-700
    p text-base font-medium text-zinc-400 "아직 문서가 없습니다"
    p text-sm text-zinc-600 "첫 번째 문서를 추가하여 AI 팀의 지식을 강화하세요"
    button "첫 문서 추가" bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg

---

DOCUMENT UPLOAD MODAL (show as overlay state):
Backdrop: fixed inset-0 bg-black/60 z-50 flex items-center justify-center

Dialog: bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-[480px] max-h-[80vh] overflow-y-auto:

  Header: flex justify-between items-center mb-6:
    h2 text-lg font-semibold text-zinc-100 "문서 추가"
    button Lucide X h-5 w-5 text-zinc-400 hover:text-zinc-200

  Tabs (flex gap-6 border-b border-zinc-700 mb-6):
    "파일 업로드" active tab: text-sm font-medium text-indigo-300 border-b-2 border-indigo-500 pb-3
    "URL 추가" tab: text-sm text-zinc-400 pb-3

  File upload zone:
    div bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-xl p-8 text-center hover:border-zinc-500 hover:bg-zinc-800/80 transition-colors cursor-pointer:
      Lucide Upload h-8 w-8 text-zinc-500 mx-auto mb-3
      p text-sm font-medium text-zinc-300 "파일을 여기에 드래그하거나 클릭하여 선택"
      p text-xs text-zinc-500 mt-1 "PDF, DOCX, TXT, MD — 최대 50MB"

  Footer: flex gap-3 mt-6:
    button "취소" border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm px-4 py-2 rounded-lg flex-1
    button "업로드 시작" bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex-1

---

Generate as React with Tailwind CSS. Korean text as shown. Desktop-only, min 1280px.
```

---

## SECTION 5: ADMIN SETTINGS PAGE

> **Admin control panel. Dense, functional, enterprise feel. Company admin manages org configuration.**

---

```
Generate as React with Tailwind CSS.

Design CORTHEX Admin Agent Management page — where the company admin creates, edits, and manages AI agents.

LAYOUT: [AdminSidebar 240px][Main flex-1 overflow-auto]
CONTAINER: div className="flex h-screen bg-zinc-950 overflow-hidden"

COLUMN 1 — AdminSidebar (same spec as NEXUS, active item: "🤖 에이전트")

COLUMN 2 — Main Content:

PageHeader (px-6 py-5, border-b border-zinc-700, bg-zinc-900):
  flex justify-between items-center:
    div:
      h1 text-xl font-semibold text-zinc-100 "에이전트 관리"
      p text-sm text-zinc-400 "AI 에이전트 생성 · 편집 · 삭제"
    button "에이전트 추가" bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2
      Lucide Plus h-4 w-4

Content area (p-6, flex flex-col gap-4):

Filter + Search Row (flex gap-3 items-center):
  SearchBar (w-64):
    input bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 "에이전트 검색..."
    with Lucide Search icon

  Filter dropdowns (flex gap-2):
    Filter select wrapper (relative div for each):
      select: bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 pr-8 appearance-none w-full
      ChevronDown overlay: Lucide ChevronDown h-4 w-4 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none
    Three selects: "모든 티어", "모든 부서", "모든 상태" — each in a relative wrapper div

Agent DataTable (bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden):

  Table header (bg-zinc-800 border-b border-zinc-700):
    thead tr: text-xs font-semibold text-zinc-400 uppercase tracking-wider
    th px-4 py-3: checkbox (indeterminate state)
    th px-4 py-3: "에이전트"
    th px-4 py-3: "티어"
    th px-4 py-3: "부서"
    th px-4 py-3: "상태"
    th px-4 py-3: "이번 달 비용"
    th px-4 py-3: "작업 완료"
    th px-4 py-3: "작업" (actions column)

  Table rows (divide-y divide-zinc-700/50):

  Row 1 — Active agent:
    td px-4 py-3: checkbox
    td px-4 py-3:
      flex items-center gap-3:
        div h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center: Lucide CircleUser h-4 w-4 text-zinc-300
        div:
          p text-sm font-medium text-zinc-100 "비서실장"
          p text-xs text-zinc-500 "secretary-01"
    td px-4 py-3: TierBadge T1 (bg-indigo-950 border-indigo-800 text-indigo-300 font-mono text-xs "T1 관리자")
    td px-4 py-3: text-sm text-zinc-300 "임원실"
    td px-4 py-3:
      flex items-center gap-2:
        StatusDot working (indigo-500 animate-pulse h-2 w-2)
        span text-xs text-zinc-300 "처리중"
    td px-4 py-3: text-sm font-mono text-zinc-300 "$6.20"
    td px-4 py-3: text-sm text-zinc-300 "147"
    td px-4 py-3:
      div flex gap-2:
        button Lucide Edit2 h-4 w-4 text-zinc-400 hover:text-zinc-200 (edit)
        button Lucide Eye h-4 w-4 text-zinc-400 hover:text-zinc-200 (Soul preview)
        button Lucide MoreHorizontal h-4 w-4 text-zinc-400 hover:text-zinc-200

  Row 2 — CIO (T1, online):
    Similar structure, StatusDot green + "온라인", $4.10, 89 tasks

  Row 3 — CTO (T1, online):
    Similar, $3.80, 67 tasks

  Row 4 — 기술분석전문가 (T2, working):
    TierBadge T2 (bg-violet-950 border-violet-800 text-violet-300 "T2 전문가")
    StatusDot working + "분석 중"
    $2.20, 234 tasks

  Row 5 — 전략팀장 (T2, online): similar
  Row 6 — 리서치에이전트 (T3, idle): TierBadge T3 zinc, StatusDot green + "대기중", $0.80, 89
  Row 7 — 백엔드전문가 (T3, offline): StatusDot zinc + "오프라인", $0.00, 12 tasks

  Table footer (px-4 py-3 border-t border-zinc-700, flex justify-between items-center):
    text-xs text-zinc-500 "총 12개 에이전트"
    Pagination: flex gap-1:
      button "이전" border border-zinc-700 text-zinc-400 text-xs px-3 py-1.5 rounded disabled:opacity-40
      button "1" bg-indigo-600 text-white text-xs px-3 py-1.5 rounded
      button "2" border border-zinc-700 text-zinc-400 text-xs px-3 py-1.5 rounded
      button "다음" border border-zinc-700 text-zinc-400 text-xs px-3 py-1.5 rounded

---

AGENT CREATE/EDIT DRAWER (shown as right-side overlay):
fixed right-0 top-0 h-full w-[520px] bg-zinc-900 border-l border-zinc-700 z-50 flex flex-col

Backdrop: fixed inset-0 bg-black/40 z-40

DrawerHeader (px-6 py-4, border-b border-zinc-700, flex justify-between items-center):
  h2 text-lg font-semibold text-zinc-100 "에이전트 추가"
  Lucide X h-5 w-5 text-zinc-400 hover:text-zinc-200

Drawer Tabs (px-6 pt-4 border-b border-zinc-700, flex gap-6):
  "기본 정보" active: text-sm font-medium text-indigo-300 border-b-2 border-indigo-500 pb-4
  "Soul 편집" inactive: text-sm text-zinc-400 pb-4

DrawerContent (px-6 py-5, flex-1 overflow-y-auto, flex flex-col gap-4):

  Field "에이전트 이름":
    label text-xs text-zinc-400 uppercase tracking-wider mb-1.5
    input bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 w-full
    placeholder "예: 리서치 에이전트"

  Field "부서":
    label same style
    select bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 w-full pr-8
    options: "임원실", "IT팀", "전략팀", "기술팀"

  Field "티어 (권한 등급)":
    label same
    div flex gap-3:
      T1 option (selected): div bg-indigo-950 border-2 border-indigo-500 rounded-lg p-3 flex-1 cursor-pointer:
        TierBadge "T1" + p text-xs font-medium text-indigo-300 "관리자" + p text-[10px] text-indigo-400/60 "최고 위임 권한"
      T2 option: div bg-zinc-800 border border-zinc-700 rounded-lg p-3 flex-1 cursor-pointer hover:border-zinc-600:
        TierBadge "T2" + "전문가" + text-[10px] "중간 전문 권한"
      T3 option: similar zinc styling "워커"

  Field "부모 에이전트":
    label same
    Searchable select: bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 w-full
    Shows: "비서실장 (T1 — 임원실)" with agent icon

  Separator hr border-zinc-700

  Field "설명 (선택사항)":
    textarea bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 w-full h-20 resize-none
    placeholder "이 에이전트의 역할을 간단히 설명하세요"

DrawerFooter (px-6 py-4, border-t border-zinc-700, flex gap-3):
  button "취소" border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm px-4 py-2.5 rounded-lg flex-1
  button "에이전트 생성" bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg flex-1

---

Generate as React with Tailwind CSS. Korean text as shown. Desktop-only, min 1280px.
```

---

## SECTION 6: LANDING PAGE (Pre-Login)

> **Public marketing page. "Signal — Dark Command Center" design. Converts CEO visitors to signup.**

---

```
Generate as React with Tailwind CSS.

Design CORTHEX Landing Page — the public marketing page for an AI organization management platform.

This is the pre-login public page at route "/". Authenticated users are redirected to /hub automatically.

Target visitors: Korean-speaking CEOs and company founders who need to manage 10+ AI agents for business tasks (investment analysis, content creation, strategic research).

Tagline: "조직도를 그리면 AI 팀이 움직인다."
Translation: "Draw the org chart — and the AI team moves."

This is NOT a chatbot landing page. Position CORTHEX as enterprise AI infrastructure. Military precision aesthetic. No playfulness.

---

FULL-PAGE STRUCTURE:

Background: bg-zinc-950 (#09090B) throughout
Font: Work Sans (all text)
Accent: indigo-600 (#4F46E5), indigo-400 (#818CF8)

---

STICKY NAV (fixed top-0, z-50, h-16, bg-zinc-950/90 backdrop-blur-sm, border-b border-zinc-800):
  flex items-center justify-between px-8 max-w-7xl mx-auto w-full:

  Left:
    Logo: "CORTHEX" text-base font-bold text-zinc-50 tracking-tight
    Nav links (ml-10, flex gap-6, text-sm text-zinc-400):
      "제품" hover:text-zinc-100
      "가격" hover:text-zinc-100
      "문서" hover:text-zinc-100

  Right (flex items-center gap-3):
    "로그인" text-sm text-zinc-400 hover:text-zinc-100 px-3 py-2
    "무료 체험 시작 →" bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg

---

SECTION 1 — HERO (min-h-screen, flex items-center, relative, pt-16):

Static dot grid background (decorative, aria-hidden):
  absolute inset-0:
    background: radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.12) 1px, transparent 0)
    background-size: 32px 32px
    mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 70%, transparent 110%)

Content (max-w-7xl mx-auto px-8 py-20 w-full):

  Eyebrow: text-indigo-400 text-xs font-semibold tracking-[0.25em] uppercase mb-6
    "AI 조직 관리 플랫폼"

  H1 (max-w-3xl):
    text-6xl font-bold text-zinc-50 leading-[1.05] tracking-tight mb-6:
    "조직도를 그리면" br
    span text-indigo-400 "AI 팀" "이 움직인다."

  Subtitle (max-w-2xl):
    text-xl text-zinc-400 leading-relaxed mb-10:
    "AI 에이전트를 조직도로 관리하는 새로운 방법. 부서를 그리고 에이전트를 배치하면 비서실장이 자동으로 업무를 위임하고 실행합니다."

  CTA buttons (flex items-center gap-4 flex-wrap):
    Primary: "무료 체험 시작 →" bg-indigo-600 hover:bg-indigo-500 text-white text-base font-semibold px-6 py-3 rounded-lg
    Secondary: "데모 신청" border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 text-base font-medium px-6 py-3 rounded-lg
    Login link: text-zinc-600 text-sm "이미 계정이 있으신가요? " + underline link "로그인" text-zinc-400

  NEXUS Canvas Hero Visual (mt-16):
    div rounded-xl border border-zinc-700 overflow-hidden shadow-2xl shadow-black/60 bg-zinc-900:

      Browser chrome header (bg-zinc-800/60 border-b border-zinc-700 px-4 py-2 flex items-center gap-2):
        3 dots (w-3 h-3 rounded-full): bg-zinc-600, bg-zinc-600, bg-zinc-600
        span text-xs text-zinc-500 ml-2 "NEXUS — 조직도 편집기"

      Canvas content (bg-zinc-950 p-6, min-h-72):
        Replicate the NEXUS org chart visual:
        - Static representation of org chart with 6 nodes
        - bg-zinc-900 cards with border-zinc-700
        - 비서실장 (T1, indigo border) at top
        - CIO and CTO (T1) below with connection lines
        - 3 specialist/worker nodes at bottom
        - All connected with SVG lines (stroke: indigo-600 #4F46E5)
        - One node shows "● 처리중" with indigo pulse animation

        Grid background: radial-gradient dots (zinc-800, 20px spacing)

---

SECTION 2 — TRUST RAIL (bg-zinc-900, border-y border-zinc-700, py-8):
  max-w-7xl mx-auto px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8:

  Metrics (flex items-center justify-center gap-10 flex-wrap):
    4 metrics, each: text-center:
      div text-2xl font-bold text-zinc-50 "300K+"
      div text-sm text-zinc-500 mt-1 "업무 완료"

    Metrics: "300K+ 업무완료", "8 AI 에이전트", "99.9% 가동률", "₩0 HR 오버헤드"
    Note: placeholder values — will be updated before launch

  Brand logos (opacity-40, flex gap-8 items-center justify-center):
    Text placeholders: text-zinc-400 text-sm font-medium: "삼성", "LG", "현대", "카카오"
    (Actual logos will replace before launch)

---

SECTION 3 — HOW IT WORKS (bg-zinc-950, py-24):
  max-w-7xl mx-auto px-8:

  H2 text-3xl font-bold text-zinc-50 text-center mb-4 "이렇게 작동합니다"
  p text-zinc-400 text-center mb-16 "코드 한 줄 없이 AI 조직을 설계하고 실행합니다"

  3-column grid (grid grid-cols-3 gap-8):

  Step 1: "그린다"
    div:
      div text-indigo-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3 "01"
      h3 text-2xl font-bold text-zinc-50 mb-2 "그린다"
      p text-sm text-zinc-500 mb-1 font-medium "NEXUS 조직도 편집"
      p text-sm text-zinc-400 leading-relaxed "NEXUS 캔버스에서 드래그로 AI 조직도를 편집합니다. 부서를 만들고 에이전트를 배치하면 끝."

    Mini illustration (mt-4, bg-zinc-900 border border-zinc-700 rounded-lg p-4 h-32):
      Simplified 3-node hierarchy SVG visual

  Step 2: "배포한다"
    Step number "02", "배포한다", "에이전트 자동 활성화"
    "저장하면 에이전트가 즉시 위임 경로를 따라 실행합니다. 재시작 없음, 설정 파일 없음."
    Mini: Save icon animation → green checkmark

  Step 3: "본다"
    Step number "03", "본다", "Hub 실시간 위임 체인"
    "Tracker에서 비서실장 → CIO → 전문가 위임 흐름을 실시간으로 확인합니다."
    Mini: Simplified TrackerPanel with 3 steps

---

SECTION 4 — HUB FEATURE HIGHLIGHT (bg-zinc-900, py-24):
  max-w-7xl mx-auto px-8:
  flex items-center gap-16 (screenshot left, copy right):

  LEFT (screenshot, flex-1):
    div rounded-xl border border-zinc-700 overflow-hidden shadow-xl bg-zinc-900:
      Browser chrome + simplified Hub 3-column layout screenshot
      Shows: ChatArea with a completed message + TrackerPanel with 3-step chain
      All using exact Hub colors specified above

  RIGHT (copy, max-w-sm):
    p text-indigo-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4 "Hub — 명령 센터"
    h2 text-3xl font-bold text-zinc-50 mb-4 "명령하면 팀이 실행합니다"
    p text-lg text-zinc-400 leading-relaxed mb-8 "韓국어로 명령하면 비서실장이 자동으로 업무를 분석하고 해당 전문가에게 위임합니다. Tracker로 실시간 위임 체인을 확인하세요."

    Features (flex flex-col gap-3):
      3 bullet points (flex items-start gap-3):
        Lucide Check h-4 w-4 text-green-500 shrink-0 mt-0.5
        text-sm text-zinc-300 "비서실장 → CIO → 전문가 자동 위임"

      "명령 접수됨 배지 — 50ms 이내 즉각 응답"
      "완료 시 비용 + 토큰 수 자동 표시"

---

SECTION 5 — NEXUS FEATURE (bg-zinc-950, py-24):
  Flipped: copy left, screenshot right

  LEFT copy:
    "NEXUS — 조직도 편집기"
    h2 "조직도가 곧 프로그램입니다"
    p "NEXUS 캔버스에서 드래그로 에이전트를 연결하면 그것이 바로 실행 로직입니다. 저장하는 순간 즉시 적용됩니다."

    Bullet: "드래그&드롭 에이전트 연결", "Soul 편집 — 브라우저에서 바로", "저장 즉시 적용 (재시작 불필요)"

  RIGHT: NEXUS canvas screenshot (simplified)

---

SECTION 6 — AGORA + ARGOS (bg-zinc-900, py-24):
  2-column feature cards:

  Card 1 — AGORA (bg-zinc-800 border border-zinc-700 rounded-xl p-8):
    div mb-4: Lucide Scale h-8 w-8 text-indigo-400 (deliberation/justice metaphor — NOT a chat bubble)
    h3 text-xl font-bold text-zinc-100 mb-3 "AGORA — AI 원탁회의"
    p text-sm text-zinc-400 leading-relaxed "여러 에이전트가 동시에 토론하고 합의를 도출합니다. 전략적 의사결정을 AI 팀에게 맡기세요."
    tag: bg-indigo-950 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-800 "합의 / 반대 / 부분합의 배지"

  Card 2 — ARGOS (bg-zinc-800 border border-zinc-700 rounded-xl p-8):
    div mb-4: Lucide Clock h-8 w-8 text-amber-500
    h3 "ARGOS — 항상 깨어있는 감시자"
    p "당신이 잠든 사이에도 AI 팀은 일합니다. 크론 스케줄로 정기 보고서, 시황분석, 뉴스 요약을 자동 실행."
    tag: bg-amber-500/10 text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-500/20 "100개의 눈, 절대 잠들지 않는"

---

SECTION 7 — TESTIMONIALS (bg-zinc-950, py-24):
  H2 "이미 사용하고 있는 팀들의 이야기" text-center mb-16

  3-column quote cards (grid grid-cols-3 gap-6):
  Each card: bg-zinc-900 border border-zinc-700 rounded-xl p-6:
    Lucide Quote h-8 w-8 text-indigo-400/40 mb-4
    p text-sm text-zinc-300 leading-relaxed mb-6 italic
      "CORTHEX 도입 후 리서치 시간이 80% 줄었습니다. 비서실장이 알아서 전문가를 골라 분석합니다."
    div flex items-center gap-3:
      div h-10 w-10 rounded-full bg-zinc-700
      div:
        p text-sm font-medium text-zinc-100 "김OO 대표"
        p text-xs text-zinc-500 "스타트업 CEO"

---

SECTION 8 — PRICING (bg-zinc-900, py-24):
  H2 "투명한 가격" text-center mb-4
  p text-zinc-400 text-center mb-16 "⚠️ 아래 가격은 출시 전 임시 가격입니다"

  3-tier cards (grid grid-cols-3 gap-6 max-w-4xl mx-auto):

  Starter (bg-zinc-800 border border-zinc-700 rounded-xl p-8):
    "Starter" text-lg font-bold zinc-100
    "₩99,000/월" text-3xl font-bold zinc-50
    "에이전트 3개" zinc-400
    Divider hr zinc-700
    Feature list (check icons green-500)
    CTA: "시작하기" border zinc-700 text-zinc-300 w-full py-2.5 rounded-lg

  Business (bg-zinc-900 border-2 border-indigo-500 rounded-xl p-8):
    "Business" text-lg font-bold text-indigo-300
    Badge "가장 인기" bg-indigo-950 text-indigo-300 text-xs px-2 py-0.5 rounded-full
    "₩299,000/월" text-3xl font-bold zinc-50
    "에이전트 8개" zinc-400
    CTA: "체험 시작" bg-indigo-600 text-white w-full py-2.5 rounded-lg font-semibold

  Enterprise (bg-zinc-800 border border-zinc-700 rounded-xl p-8):
    "Enterprise" text-lg font-bold zinc-100
    "문의" text-3xl font-bold zinc-50
    "무제한 에이전트" zinc-400
    CTA: "문의하기" border zinc-700 text-zinc-300 w-full py-2.5 rounded-lg

---

SECTION 9 — FINAL CTA (bg-indigo-950, border-y border-indigo-800, py-24):
  max-w-3xl mx-auto px-8 text-center:

  h2 text-4xl font-bold text-zinc-50 mb-6 "지금 AI 팀을 만들어보세요"
  p text-lg text-indigo-300 mb-10 "조직도를 그리는 것으로 시작합니다. 5분이면 첫 에이전트가 일을 시작합니다."

  CTA buttons (flex items-center justify-center gap-4):
    Primary: "무료 체험 시작 →" bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-semibold px-8 py-4 rounded-lg
    Secondary: "데모 신청" border border-indigo-600 text-indigo-300 hover:bg-indigo-900 text-lg font-medium px-8 py-4 rounded-lg

---

FOOTER (bg-zinc-950, border-t border-zinc-800, py-12):
  max-w-7xl mx-auto px-8:

  Top row (grid grid-cols-4 gap-8 mb-12):
    Brand col: "CORTHEX" logo + p text-sm text-zinc-500 "AI 조직 관리 플랫폼. 코드 없이 AI 팀을 운영하세요."
    Products col: "제품" header + links (라이브러리, 가격, 문서)
    Company col: "회사" + links (소개, 블로그, 채용)
    Legal col: "법적 고지" + links (개인정보처리방침, 이용약관)

  Bottom row (flex justify-between items-center border-t border-zinc-800 pt-8):
    text-sm text-zinc-600 "© 2026 CORTHEX. All rights reserved."
    text-sm text-zinc-600 "Built with AI, for AI teams."

---

Generate as React with Tailwind CSS. Korean text as shown. The NEXUS visual elements are static images/SVGs — not live ReactFlow. Use <Link to="..."> for all internal navigation (this is a BrowserRouter SPA). Do NOT use <a href> for internal links. Desktop-first with min-width 1280px. Mobile gets scrollable layout with no interactive demos.

STITCH SESSION SPLIT RECOMMENDATION (Landing is 9 sections — split into 3 sessions):
  Session 6A: Nav + Hero + Trust Rail (Sections 1–2)
  Session 6B: How It Works + Hub Feature + NEXUS Feature + AGORA+ARGOS (Sections 3–6)
  Session 6C: Testimonials + Pricing + Final CTA + Footer (Sections 7–9)
  Paste Master Prompt (Section 0) at the start of EACH session before pasting the landing content.
```

---

## SECTION 7: AGORA DEBATE ROOM (보너스)

> **Optional premium page. Multi-agent debate interface with speech cards and consensus badge.**

---

```
Generate as React with Tailwind CSS.

Design CORTHEX AGORA — the multi-agent debate room page.

AGORA is the "AI boardroom" where multiple agents deliberate, argue, and reach consensus. After the debate completes, a final consensus/dissent badge appears. This is a premium differentiator.

LAYOUT: [AppSidebar 240px][Main flex-1 overflow-auto]
Active nav item: "💬 AGORA"

---

PageHeader (px-6 py-5, border-b border-zinc-700, bg-zinc-900):
  flex justify-between items-center:
    div:
      h1 text-xl font-semibold text-zinc-100 "AGORA — 그룹 토론"
      p text-sm text-zinc-400 "AI 에이전트 다수결 의사결정 엔진"
    button "새 토론 시작" bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2
      Lucide Plus h-4 w-4

Content (p-6, grid grid-cols-[1fr_320px] gap-6):

LEFT COLUMN — Active Debate:

Debate Header Card (bg-zinc-900 border border-zinc-700 rounded-lg p-4 mb-4):
  div flex justify-between items-center:
    div:
      p text-xs text-zinc-500 uppercase tracking-wider "토론 주제"
      h2 text-lg font-semibold text-zinc-100 mt-1 "삼성전자 2024 Q4 투자 전략"
    div text-right:
      span (status badge): bg-green-500/10 text-green-500 border border-green-500/20 text-xs px-3 py-1 rounded-full "완료"
      p text-xs text-zinc-500 mt-1 "총 소요: 47.3s"

Participants row (flex gap-3 mb-4):
  Each participant: flex items-center gap-2 bg-zinc-800/50 rounded-lg px-3 py-1.5:
    StatusDot green h-2 w-2 (or indigo pulse if active)
    span text-xs text-zinc-300 "비서실장"
    TierBadge T1

Speech Timeline (flex flex-col gap-3):

SPEECH CARD — COMPLETED (render multiple):
  div bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden:

    Card header (px-4 py-2.5 bg-zinc-800/50 border-b border-zinc-700, flex justify-between items-center):
      Left: flex items-center gap-2:
        StatusDot green h-1.5 w-1.5
        span text-xs font-medium text-zinc-300 "비서실장"
        TierBadge T1 (indigo, compact)
        span text-[10px] text-zinc-500 font-mono "D1"
      Right:
        span text-[10px] font-mono text-zinc-500 "12.3s"
        span text-[10px] font-mono text-zinc-600 "$0.0018"

    Card content (px-4 py-3):
      p text-sm text-zinc-300 leading-relaxed
      "삼성전자의 현재 주가는 PBR 1.0배 수준으로 역사적 저점에 근접합니다. HBM 수출 규제 리스크가 남아있지만, DS부문의 턴어라운드 시그널이 명확합니다."

      div mt-2 flex items-center gap-2:
        span text-[10px] text-zinc-600 "의견:"
        span bg-green-500/10 text-green-500 text-[10px] px-2 py-0.5 rounded-full "매수 의견"

Show 3 speech cards with slightly different content/opinions:
  Speech 1 — 비서실장 (T1): 매수 의견, positive framing
  Speech 2 — CIO (T1): 중립 의견, balanced analysis, text-amber-500 badge
  Speech 3 — 기술분석전문가 (T2): 매수 의견, technical analysis

CONSENSUS BADGE (appears after all speeches — highlight this as the emotional climax):
  div (full-width, py-4, flex items-center justify-center):
    div bg-green-500/10 border border-green-500/30 rounded-xl px-8 py-5 text-center:
      Lucide CheckCircle h-10 w-10 text-green-500 mx-auto mb-3
      p text-lg font-bold text-green-400 "합의 도달"
      p text-sm text-zinc-300 mt-1 "3/3 에이전트 — 삼성전자 매수 의견"
      p font-mono text-xs text-zinc-500 mt-2 "총 비용: $0.0089 · 3,240 토큰 · 47.3초"

RIGHT COLUMN — Debate Controls (320px):

New Debate Panel (bg-zinc-900 border border-zinc-700 rounded-lg p-4 mb-4):
  h3 text-sm font-semibold text-zinc-100 mb-4 "새 토론 설정"

  Field "토론 주제":
    textarea bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 h-20 w-full resize-none
    placeholder "토론 주제를 입력하세요..."

  Field "참여 에이전트" (mt-3):
    label text-xs text-zinc-400 uppercase tracking-wider mb-2
    Agent chips (flex flex-wrap gap-1.5 mt-1):
      Chip (selected): bg-indigo-950 border-indigo-800 text-indigo-300 text-xs px-2 py-1 rounded-full + Lucide X h-3 w-3
      "비서실장" (selected), "CIO" (selected), "기술분석전문가" (selected)
      "+" button text-xs text-zinc-400 border border-zinc-700 px-2 py-1 rounded-full

  button "토론 시작" w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg mt-4

Past Debates Panel (bg-zinc-900 border border-zinc-700 rounded-lg p-4):
  h3 text-sm font-semibold text-zinc-100 mb-3 "최근 토론"

  Past debate items (flex flex-col gap-2):
  Each: div bg-zinc-800/50 rounded-lg px-3 py-2.5 hover:bg-zinc-800 cursor-pointer:
    div flex justify-between:
      p text-xs font-medium text-zinc-300 truncate "LG전자 투자 판단"
      span bg-green-500/10 text-green-500 text-[10px] px-1.5 py-0.5 rounded "합의"
    p text-[10px] text-zinc-500 mt-0.5 "3 에이전트 · 2026.03.11"

  Show 4 past debates (합의: 2, 반대: 1 using red badge, 부분합의: 1 using amber badge)

---

Generate as React with Tailwind CSS. Korean text as shown. Desktop-only, no responsive breakpoints.
```

---

## SECTION 8: THEME SWAP GUIDE

> **After generating with base zinc+indigo theme, use this guide to apply one of the 5 creative themes.**

---

### How to Apply a Theme in Stitch

After generating a page with the master prompt:
1. Tell Stitch: `Replace all color tokens with Theme N from below`
2. Paste the relevant theme section

---

### Theme 1: Synaptic Cortex (Neural × Electric Cyan)

```
Replace CORTHEX color tokens with Synaptic Cortex theme:

Page background: #060B14 (replace bg-zinc-950)
Sidebar/Panel background: #0D1526 (replace bg-zinc-900)
Card surface: #111D30 (replace bg-zinc-800)
Elevated hover: #1A2D47
Border default: #1E3050 (replace border-zinc-700)
Border active/focus: #00C8E8

Primary accent: #00C8E8 (replace indigo-600 #4F46E5)
Primary hover: #22D8F5
Button text on primary: #060B14 (dark text on cyan bg)

Text primary: #E8F1F8 (replace text-zinc-100)
Text secondary: #97ADC4 (replace text-zinc-300/zinc-400)
Text muted: #647A91 (replace text-zinc-500) — use only for ≥14px bold text

Active nav: bg-[#00C8E8]/8 text-[#00C8E8] border-l-2 border-[#00C8E8]
Active session: border-[#00C8E8]/50

TrackerPanel active step: border-l-2 border-[#00C8E8] bg-[#00C8E8]/5

TierBadge T1: bg-[#00C8E8]/10 border-[#00C8E8]/30 text-[#00C8E8]
TierBadge T2: bg-[#7C3AED]/10 border-[#7C3AED]/30 text-[#A78BFA]
StatusDot working: bg-[#00C8E8] animate-pulse

Font: Space Grotesk (headings, 500/600/700) + Inter (body, 400/500) + JetBrains Mono (mono)
Font URLs:
  Space Grotesk: https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap
  Inter: https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap
  JetBrains Mono: https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap

Status: green-500 / amber-500 / red-400 — UNCHANGED

NEXUS edge color (default, non-selected): #4A6F8F (not border-zinc-700 — too dark on canvas)
NEXUS edge color (selected/active): #00C8E8
```

---

### Theme 2: Terminal Command (Pure Black × Amber Monospace)

```
Replace CORTHEX color tokens with Terminal Command theme:

Page background: #000000 (pure black)
Sidebar: #0A0A0A
Card: #111111
Border default: #2A2A2A
Border active: #FFB000

Primary accent: #FFB000 (amber-gold)
Primary hover: #FFB000 (slightly brighter) — use brightness:110%
Button text on primary: #000000

Text primary: #F5F5F5
Text secondary: #B0B0B0
Text muted: #808080 — passes AA at all sizes on black background

Active nav: text-[#FFB000] bg-[#FFB000]/5 border-l-2 border-[#FFB000]

StatusDot working: amber dot "●" text symbol (no circle div — pure monospace dot)
StatusDot online: green-500 "●"

Font: JetBrains Mono (ALL text — 400/500/700) — fully monospace UI
Font URL: https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap
Nav items: font-mono text-sm

TierBadge T1: font-mono text-xs bg-[#FFB000]/10 border-[#FFB000]/30 text-[#FFB000]
TierBadge T2: font-mono text-xs bg-[#888800]/10 border-[#888800]/30 text-[#CCCC00]
TierBadge T3: font-mono text-xs text-[#808080] border-[#2A2A2A]

Status: green-500 / #FFB000 warning / #FF3131 error
NEXUS default edge: #404040 (not #2A2A2A — needs 3:1 contrast on black canvas)
```

---

### Theme 3: Arctic Intelligence (Steel Blue × Cold White)

```
Replace CORTHEX color tokens with Arctic Intelligence theme:

Page background: #080C14
Sidebar: #141E2E
Card: #141E2E
Elevated: #1E2D42
Border default: #253347
Border active: #1B81D4

Primary accent: #1B81D4 (Fjord Blue)
Primary hover: #2390E5
Button text on primary: #080C14

Text primary: #E2EEFF
Text secondary: #94A3B8
Text muted: #8C9EBE (lightened — original #687A8F fails small text)

Active nav: bg-[#1B81D4]/10 text-[#60A5FA] border-l-2 border-[#1B81D4]

Font: IBM Plex Sans (400/500/600/700) + IBM Plex Mono
Font URLs:
  IBM Plex Sans: https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap
  IBM Plex Mono: https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap

TierBadge T1: bg-[#1B81D4]/10 border-[#1B81D4]/30 text-[#60A5FA]
TierBadge T2: bg-[#0E4D8A]/20 border-[#1B81D4]/20 text-[#93C5FD]
StatusDot working: bg-[#1B81D4] animate-pulse

NEXUS default edge: #425E78 (required for 3:1 contrast on #080C14 canvas)
NEXUS active edge: #1B81D4
```

---

### Theme 4: Neon Citadel (Deep Purple × Electric Magenta)

```
Replace CORTHEX color tokens with Neon Citadel theme:

Page background: #080010
Sidebar: #0F0020
Card: #150A2A
Elevated: #1F1040
Border default: #2D1558
Border active: #E91E8C

Primary accent: #E91E8C (magenta)
Primary hover: #FF2DA0
Button text on primary: #1A0030

Text primary: #F0E6FF
Text secondary: #B08ACC
Text muted: #9B80B8 (lightened — original #7D5E99 fails small text on card)

Active nav: bg-[#E91E8C]/10 text-[#E91E8C] border-l-2 border-[#E91E8C]

Font: Syne (headings, 600/700/800) + Inter (body)
Font URLs:
  Syne: https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap
  Inter: https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap

TierBadge T1: bg-[#E91E8C]/10 border-[#E91E8C]/30 text-[#FF80C0]
TierBadge T2: bg-[#00F5FF]/10 border-[#00F5FF]/30 text-[#00F5FF]
StatusDot working: bg-[#E91E8C] animate-pulse

Success (replaces green): #39FF14 neon lime — use BOTH color AND ✓ icon
NEXUS default edge: #4A2E70
NEXUS active edge: #E91E8C
```

---

### Theme 5: Bioluminescent Deep (Oceanic Black × Teal Glow)

```
Replace CORTHEX color tokens with Bioluminescent Deep theme:

Page background: #020A10 (oceanic black)
Sidebar: #0D1E2E
Card: #0D1E2E
Elevated: #142234
Border default: #1A3550
Border active: #00E5A0

Primary accent: #00E5A0 (bioluminescent teal)
Primary hover: #00F5B0
Button text on primary: #020A10

Text primary: #D4F4EE
Text secondary: #7BBFAC
Text muted: #5DA880 (lightened — original #4B8568 fails small text)

Active nav: bg-[#00E5A0]/8 text-[#00E5A0] border-l-2 border-[#00E5A0]

Font: Instrument Sans (400/500/600/700) + Inconsolata (mono)
Font URLs:
  Instrument Sans: https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap
  Inconsolata: https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;500&display=swap

TierBadge T1: bg-[#00E5A0]/10 border-[#00E5A0]/30 text-[#00E5A0]
TierBadge T2: bg-[#5BB8FF]/10 border-[#5BB8FF]/30 text-[#5BB8FF]
TierBadge T3: bg-[#1A3550] border-[#1A3550] text-[#5DA880]
StatusDot working: bg-[#00E5A0] animate-[pulse_2s_ease-in-out_infinite]
StatusDot idle: HOLLOW RING — border-2 border-[#5DA880] (not filled) to survive prefers-reduced-motion

Success (replaces green-500): #A3E635 lime (distinct from teal primary) — use BOTH color AND ✓ icon
NEXUS default edge: #2A6B8A
NEXUS active edge: #00E5A0
```

---

## SECTION 9: QUICK REFERENCE — COPY-PASTE SNIPPETS

> **Frequently needed component specs for any Stitch conversation.**

---

### Core Color Reference

| Component | Tailwind Classes |
|-----------|-----------------|
| Page background | `bg-zinc-950` (#09090B) |
| Sidebar/Panel/Card | `bg-zinc-900` (#18181B) |
| Elevated panel | `bg-zinc-800` (#27272A) |
| Border on dark panel | `border-zinc-700` (#3F3F46) — NEVER zinc-800 |
| Primary button | `bg-indigo-600 hover:bg-indigo-700 text-white` |
| Active nav bg | `bg-indigo-950` (#1E1B4B) |
| Active nav text | `text-indigo-300` (#A5B4FC) |
| Body text | `text-zinc-300` (#D4D4D8) |
| Muted text | `text-zinc-400` (#A1A1AA) |
| Success | `text-green-500` (#22C55E) |
| Warning | `text-amber-500` (#F59E0B) |
| Error text | `text-red-400` (#F87171) |

---

### StatusDot Snippets

```
Online (green): h-2 w-2 rounded-full bg-green-500
Working (indigo pulse): h-2 w-2 rounded-full bg-indigo-500 animate-pulse
Offline (zinc): h-2 w-2 rounded-full bg-zinc-600
```

### TierBadge Snippets

```
T1 Manager: font-mono text-xs bg-indigo-950 border border-indigo-800 text-indigo-300 px-1.5 py-0.5 rounded
T2 Specialist: font-mono text-xs bg-violet-950 border border-violet-800 text-violet-300 px-1.5 py-0.5 rounded
T3 Worker: font-mono text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded
```

### CostBadge Snippet

```
"비용 $0.0042 · 1,240 토큰"
Classes: font-mono text-xs text-zinc-500
Show ONLY after task completes (SSE complete event)
```

### "명령 접수됨" Badge Snippet

```
inline-flex items-center gap-1.5 bg-indigo-950 text-indigo-300 text-xs px-2 py-0.5 rounded-full border border-indigo-800
+ Lucide CheckCircle h-3 w-3
```

---

## SECTION 10: SOUL EDITOR (P1 — Code-Free Programming Interface)

> **The agent personality/behavior editor. A CEO edits plain-text Markdown in a dark code editor to change how an AI agent thinks. This is CORTHEX's "programming without code" demo moment.**

---

```
Generate as React with Tailwind CSS. Desktop-only, no responsive breakpoints.

Design CORTHEX Soul Editor — the full-screen agent personality editor.

CORTHEX Soul is the system prompt for an AI agent, written in plain Markdown. The user edits it in a browser-native code editor (NOT a plain textarea — it must look like VS Code with syntax highlighting and line numbers). This is the "code-free programming" interface.

IMPORTANT: The actual CodeMirror 6 editor will be inserted via the existing `packages/app/src/components/codemirror-editor.tsx` wrapper in code. Design this page with a PLACEHOLDER that looks exactly like a real CodeMirror dark editor.

LAYOUT: Full-page settings page (2-column: [AppSidebar 240px][Main flex-1 overflow-auto])
Active nav: "⚙️ 설정" → Agent Soul tab

---

PageHeader (px-6 py-4, border-b border-zinc-700, bg-zinc-900):
  flex items-center gap-4:
    Lucide ArrowLeft h-5 w-5 text-zinc-400 hover:text-zinc-200 cursor-pointer (back to agent list)
    div:
      h1 text-xl font-semibold text-zinc-100 "비서실장 — Soul 편집"
      div flex items-center gap-2 mt-0.5:
        TierBadge T1: bg-indigo-950 border-indigo-800 text-indigo-300 font-mono text-xs "T1 관리자"
        StatusDot working: h-2 w-2 bg-indigo-500 animate-pulse motion-reduce:animate-none rounded-full
        span text-xs text-zinc-500 "처리중 · 비서실장"
    div (right side, ml-auto flex items-center gap-3):
      span text-xs text-zinc-500 "마지막 저장: 2분 전"
      button "미리보기" border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm px-4 py-2 rounded-lg flex items-center gap-2
        Lucide Eye h-4 w-4
      button "즉시 적용됨" bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2
        Lucide Save h-4 w-4

Content area (flex-1, flex, overflow-hidden):

LEFT — Editor Panel (flex-1, flex flex-col, border-r border-zinc-700):

  Editor Toolbar (px-4 py-2, bg-zinc-900, border-b border-zinc-700, flex items-center gap-4):
    span text-xs text-zinc-500 font-mono "비서실장.soul.md"
    separator div w-px h-4 bg-zinc-700
    span text-xs text-zinc-500 "Markdown"
    separator
    span text-xs text-zinc-500 "UTF-8"

  CodeMirror Placeholder (flex-1, bg-zinc-950, font-mono text-sm, overflow-y-auto):
    Replicate VS Code Dark+ theme appearance exactly:
    Background: bg-zinc-950 (#09090B)
    Gutter (line numbers): bg-zinc-900 border-r border-zinc-700 text-zinc-600 font-mono text-xs w-12 text-right pr-2

    Line number + code content pairs:
      Line 1: gutter "1" | text-violet-400 "# 비서실장 — 최고비서"
      Line 2: gutter "2" | (empty)
      Line 3: gutter "3" | text-zinc-500 "> 당신은 CORTHEX 조직의 최고 비서관입니다."
      Line 4: gutter "4" | (empty)
      Line 5: gutter "5" | text-violet-400 "## 역할 정의"
      Line 6: gutter "6" | (empty)
      Line 7: gutter "7" | text-zinc-300 "당신의 임무는 CEO(사용자)의 명령을 받아 적절한"
      Line 8: gutter "8" | text-zinc-300 "전문 에이전트에게 위임하는 것입니다."
      Line 9: gutter "9" | (empty)
      Line 10: gutter "10" | text-violet-400 "## 위임 원칙"
      Line 11: gutter "11" | (empty)
      Line 12: gutter "12" | text-zinc-300 "- " + text-emerald-400 "**CIO**" + text-zinc-300 ": 정보, 데이터, 기술 전략 관련 업무"
      Line 13: gutter "13" | text-zinc-300 "- " + text-emerald-400 "**CTO**" + text-zinc-300 ": 개발, 인프라, 기술 구현 관련 업무"
      Line 14: gutter "14" | text-zinc-300 "- " + text-emerald-400 "**전략팀장**" + text-zinc-300 ": 비즈니스 전략, M&A, 신사업"
      Line 15: gutter "15" | (empty)
      Line 16: gutter "16" | text-violet-400 "## 응답 스타일"
      Line 17: gutter "17" | (empty)
      Line 18: gutter "18" | text-zinc-300 "항상 " + text-amber-400 "`명확하고 간결하게`" + text-zinc-300 " 보고합니다."
      Line 19: gutter "19" | text-zinc-500 "# 위임 완료 후 반드시 결과를 요약 보고할 것"
      Line 20–24: gutter + more Markdown content

    Active line (line 12): bg-zinc-900/70 highlight across full width
    Cursor: blinking `|` indigo-400 at end of line 18
    Selection (lines 16–18): bg-indigo-500/20

RIGHT — Preview Panel (w-96, bg-zinc-900 border-l border-zinc-700, flex flex-col):

  Preview Header (px-4 py-3, border-b border-zinc-700):
    "Soul 미리보기" text-sm font-semibold text-zinc-100 + Lucide Layers h-4 w-4 text-indigo-400 ml-2

  Preview content (px-4 py-4, overflow-y-auto, flex-1):
    Renders the Markdown with MarkdownRenderer styles:
    h1 text-xl font-bold text-zinc-100 mb-4 "비서실장 — 최고비서"
    blockquote border-l-4 border-indigo-500 pl-4 text-zinc-400 italic text-sm "당신은 CORTHEX 조직의 최고 비서관입니다."
    h2 text-lg font-semibold text-zinc-100 mt-5 mb-2 "역할 정의"
    p text-sm text-zinc-300 leading-relaxed "당신의 임무는 CEO(사용자)의 명령을 받아 적절한 전문 에이전트에게 위임하는 것입니다."
    h2 "위임 원칙"
    ul pl-4 text-sm text-zinc-300 space-y-1:
      li: "CIO:" strong font-semibold text-zinc-100 + " 정보, 데이터, 기술 전략 관련 업무"
      li: "CTO: 개발, 인프라, 기술 구현 관련 업무"
      li: "전략팀장: 비즈니스 전략, M&A, 신사업"

  Preview Footer (px-4 py-3, border-t border-zinc-700, bg-zinc-800/40):
    div flex items-center justify-between text-xs:
      span text-zinc-500 "Soul 문자 수: 842자"
      span text-zinc-500 "예상 토큰: ~210 토큰/요청"

Bottom status bar (h-8, bg-zinc-800, border-t border-zinc-700, px-4, flex items-center gap-4, text-[10px] text-zinc-500):
  "줄 18, 열 46" | "LF" | "UTF-8" | "Markdown"
  Right: "변경사항 있음" text-amber-500 (unsaved indicator)

NOTE for implementation: The gutter + code lines in production use CodeMirror 6 with:
  bg-zinc-950 editor background
  text-emerald-400 for bold/strong syntax
  text-violet-400 for headings
  text-amber-400 for inline code
  text-zinc-500 for comments
  Do NOT use a plain <textarea> — CodeMirror 6 only (existing wrapper: packages/app/src/components/codemirror-editor.tsx)
```

---

*Document generated: 2026-03-12*
*Based on: Phase 0–4 all approved outputs*
*Round 1 fixes: 15 issues applied (Critic-A: 13 + Critic-B: 7, 5 overlap)*
*Options: Web Option A (45/50) + Landing Option A (46/50) + Design Tokens Phase 3-1 + Component Strategy Phase 3-2 + Creative Themes Phase 4-1 + Accessibility Audit Phase 4-2*
