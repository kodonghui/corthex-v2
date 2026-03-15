# CORTHEX Web Stitch Prompt — Phase 5-1
**Phase:** 5 · Prompt Engineering
**Date:** 2026-03-15
**Target:** Google Stitch (React generation)
**Viewport:** 1440x900px (web dashboard)
**Surface:** Web Dashboard (~92 components)

---

## HOW TO USE THIS DOCUMENT

1. Copy each **SCREEN PROMPT** below into Google Stitch one at a time
2. Generate the screen
3. Export as TSX (TypeScript React) with Tailwind CSS classes
4. Save each screen's output to `_corthex_full_redesign/phase-6-stitch-output/web/`
5. Phase 7 will decompose screen output into individual components

**Important:** Stitch generates the VISUAL SHELL. Logic (SSE streaming, state management, data fetching) is added in Phase 7.

---

## GLOBAL DESIGN SYSTEM (paste this BEFORE every screen prompt)

```
DESIGN SYSTEM: CORTHEX — Swiss International Style, Dark Mode
VIEWPORT: 1440x900px

COLORS:
- Page background: #020617 (slate-950)
- Card/surface: #0F172A (slate-900)
- Elevated surface: #1E293B (slate-800)
- Border default: #1E293B (slate-800)
- Border strong: #334155 (slate-700)
- Primary accent: #22D3EE (cyan-400)
- Primary hover: #67E8F9 (cyan-300)
- Primary deep: #06B6D4 (cyan-500)
- Text primary: #F8FAFC (slate-50)
- Text secondary: #94A3B8 (slate-400) — NEVER use #64748B (slate-500) for body text
- Text disabled: #475569 (slate-600) — placeholder only, 18px+ minimum
- Text on primary button: #020617 (slate-950)
- Success: #34D399 (emerald-400)
- Warning: #FBBF24 (amber-400)
- Error: #F87171 (red-400)
- Working/info: #60A5FA (blue-400)
- Handoff/delegation: #A78BFA (violet-400)

TYPOGRAPHY:
- Font family: Inter (sans-serif)
- Monospace: JetBrains Mono
- Page heading: 32px, bold, #F8FAFC
- Section heading: 18px, semibold, #F8FAFC
- Body text: 14px, regular, #F8FAFC
- Secondary text: 12px, regular, #94A3B8
- Nav label: 13px, medium
- Badge text: 11px, medium, uppercase, letter-spacing 0.05em
- Nav section header: 11px, medium, uppercase, letter-spacing 0.1em, #94A3B8

SPACING:
- Base unit: 4px
- Card padding: 24px
- Page padding: 32px
- Grid gutter: 24px
- Section gap: 32px

BORDER RADIUS:
- Cards/panels: 16px (rounded-2xl)
- Buttons/inputs: 8px (rounded-lg)
- Badges: 4px (rounded)
- Status dots/avatars: 9999px (rounded-full)

SHADOWS (dark-optimized):
- Card shadow: none (border separation)
- Elevated: 0 4px 6px rgba(0,0,0,0.40)
- Modal: 0 25px 50px rgba(0,0,0,0.70)
- Primary glow: 0 0 20px rgba(34,211,238,0.15)

ICONS: Lucide icons, 20px size, 1.5 stroke width, currentColor

INTERACTIONS:
- All transitions: 150ms ease
- Hover: color transitions only
- Focus ring: 2px #22D3EE with 2px offset in #020617
- Disabled: 40% opacity
```

---

## SCREEN 1: APP SHELL (Sidebar + TopBar)

```
SCREEN: App Shell — the persistent wrapper for all dashboard pages

LAYOUT:
- Full viewport: 1440x900px
- Left sidebar: exactly 280px wide, full height, fixed position
- Top bar: 56px tall, spans from 280px to right edge (1160px wide)
- Content area: below top bar, right of sidebar, scrollable

SIDEBAR (280px, #020617 background, right border 1px #1E293B):
- Top: Logo area, 56px height, padding 16px. Show "CORTHEX" in 18px semibold #F8FAFC
- Nav sections (each with 11px uppercase header in #94A3B8, letter-spacing 0.1em):

  Section "COMMAND" (items):
  - Dashboard (LayoutDashboard icon)
  - Hub (Terminal icon) — ACTIVE STATE: background rgba(34,211,238,0.10), left border 2px solid #22D3EE, text #22D3EE, left padding 10px
  - NEXUS (Network icon)
  - Chat (MessageSquare icon)

  Section "ORGANIZATION" (items):
  - Agents (Bot icon)
  - Departments (Building2 icon)
  - Jobs (Clock icon) — show notification badge: red circle 16px, number "3" in white 10px
  - Reports (FileText icon)

  Section "TOOLS" (items):
  - SNS (Share2 icon)
  - Trading (TrendingUp icon)
  - Messenger (Send icon)
  - Library (BookOpen icon)
  - Agora (Users icon)
  - Files (FolderOpen icon)

  Section "SYSTEM" (items):
  - Costs (DollarSign icon)
  - Performance (Activity icon)
  - Activity Log (History icon)
  - Tiers (Layers icon)
  - Ops Log (Shield icon)
  - Classified (Lock icon)
  - Settings (Settings icon)

- Each nav item: 13px medium, #94A3B8 text, 12px horizontal / 8px vertical padding, 8px border-radius, icon 20px + 12px gap + label
- Hover: text #E2E8F0, background rgba(30,41,59,0.50)

- Bottom: User footer, border-top 1px #1E293B, padding 16px
  - Avatar circle 32px, initials "KD" on #334155 background
  - Name: "Kim Donghyun" 14px medium #F8FAFC
  - Role: "Admin" 12px #94A3B8

TOP BAR (56px, background rgba(2,6,23,0.95), backdrop-blur, bottom border 1px #1E293B):
- Left: Breadcrumb "Hub" in 14px #94A3B8, active segment "Hub" in #F8FAFC
- Right: 3 icons with 12px gap
  - Search icon (Cmd+K label), 40x40px clickable area
  - Bell icon with red dot badge (6px)
  - User avatar 32px (duplicate of sidebar footer)

CONTENT AREA:
- Background: #020617
- Padding: 32px all sides
- Show placeholder text "Content area" centered in #94A3B8

STITCH NOTES:
- Generate the sidebar + top bar as reusable components
- Include a skip-to-content link as the FIRST element inside the shell: <a href="#main-content" class="sr-only focus:not-sr-only ...">본문으로 건너뛰기</a>
- The content area is where route-specific pages render (wrap with <main id="main-content">)
- Mark the active nav item (Hub) with the cyan accent style
- DO NOT generate content area content — just the shell
```

---

## SCREEN 2: HUB PAGE

```
SCREEN: Hub — AI command center with output stream and tracker panel

LAYOUT (inside the App Shell content area, 1160px max-width, centered):
- 12-column grid, 24px gutter
- Left panel (col-span-8, ~765px): Hub Output Panel
- Right panel (col-span-4, ~371px): Tracker Panel
- Both panels: full height of content area (calc viewport - 56px topbar - 64px padding)

LEFT PANEL — HUB OUTPUT (rounded-2xl, #0F172A, border 1px #1E293B):
- Header (64px, border-bottom 1px #1E293B, padding 16px):
  - Left: Agent avatar 40px circle with status dot (blue, 8px, pulsing), agent name "비서 에이전트" 14px semibold #F8FAFC, department "총무부" 12px #94A3B8
  - Right: Elapsed time "2m 34s" in JetBrains Mono 12px #94A3B8, tabular-nums

- Message area (scrollable, padding 24px, gap 16px between messages):

  Message 1 (user command):
  - Background: rgba(30,41,59,0.50), rounded-lg, padding 12px
  - Content: "/보고서 작성 2월 매출 분석" in JetBrains Mono 14px #F8FAFC
  - Timestamp: "10:32" in 12px #94A3B8, right-aligned

  Message 2 (agent output):
  - No background (transparent)
  - Agent avatar 24px + name "비서 에이전트" 12px #22D3EE, left-aligned
  - Content: rendered markdown, 14px #F8FAFC, line-height 1.5
  - Show a paragraph of Korean text: "2월 매출 분석 보고서를 작성하겠습니다. 현재 데이터를 수집 중입니다..."
  - Tool call card below: "데이터 수집" tool, collapsed, bg rgba(30,41,59,0.50), rounded-lg, border 1px #334155, padding 12px
    - Left: wrench icon 16px #94A3B8, "fetch_sales_data" in JetBrains Mono 12px #F8FAFC
    - Right: status dot emerald 8px + checkmark, "1.2s" in JetBrains Mono 12px #94A3B8
    - Chevron-down icon for expand

  Message 3 (agent output, streaming):
  - Content: partial text "분석 결과, 2월 총 매출은 ₩1,234,567,890으로..." with blinking cursor at end
  - Cursor: 2px wide, #22D3EE, blinking

- Input bar (border-top 1px #1E293B, padding 16px):
  - Textarea: placeholder "명령을 입력하세요... ( / 로 시작)", bg #0F172A, border 1px #334155, rounded-lg, padding 12px, 14px text
  - Right side: Send button (arrow-up icon) in circle, 36px, bg #22D3EE, icon #020617
  - Left side: Paperclip icon 20px #94A3B8 (attach)

RIGHT PANEL — TRACKER (flex column, gap 16px):

  Card 1 — Active Agent (rounded-2xl, #0F172A, border 1px #1E293B, padding 16px):
  - Header: "ACTIVE AGENT" 11px medium uppercase tracking-wide #94A3B8
  - Agent: avatar 40px with blue pulse ring, name "비서 에이전트" 14px medium #F8FAFC
  - Department: "총무부" 12px #94A3B8
  - Tier badge: "T1" 10px bold uppercase, bg rgba(34,211,238,0.10), text #22D3EE, border 1px rgba(34,211,238,0.30), rounded, px 6px py 2px
  - Status: "작업 중" with blue dot (pulsing), 12px #60A5FA
  - Elapsed: "2m 34s" JetBrains Mono 12px #94A3B8 tabular-nums

  Card 2 — Handoff Chain (rounded-2xl, #0F172A, border 1px #1E293B, padding 16px):
  - Header: "HANDOFF CHAIN" 11px uppercase #94A3B8
  - Vertical chain with 3 nodes connected by 2px lines:
    - Node 1: circle 8px emerald + checkmark, "비서 에이전트" 13px #F8FAFC, "15s" 12px #94A3B8
    - Line: 2px solid emerald between nodes, 20px height
    - Node 2: circle 8px emerald + checkmark, "데이터 분석가" 13px #F8FAFC, "45s" 12px #94A3B8
    - Line: 2px solid blue between nodes
    - Node 3: circle 8px blue + pulse, "보고서 작성자" 13px #22D3EE (active), "진행 중" 12px #60A5FA

  Card 3 — Cost Meter (rounded-2xl, #0F172A, border 1px #1E293B, padding 16px):
  - Header: "SESSION COST" 11px uppercase #94A3B8
  - Current: "$0.47" JetBrains Mono 24px bold #F8FAFC tabular-nums
  - Budget: "/ $50.00 monthly" JetBrains Mono 12px #94A3B8
  - Progress bar: 8px height, rounded-full, track #1E293B, fill #22D3EE, width ~1%
  - Percentage: "0.9%" 12px #94A3B8

  Card 4 — Active Jobs (rounded-2xl, #0F172A, border 1px #1E293B, padding 16px):
  - Header: "ACTIVE JOBS" 11px uppercase #94A3B8 + count badge "2" in circle
  - Job item 1: clock icon 16px, "매일 뉴스 브리핑" 13px #F8FAFC, "다음: 18:00" 12px #94A3B8
  - Job item 2: clock icon 16px, "주간 보고서" 13px #F8FAFC, "다음: 월 09:00" 12px #94A3B8

STITCH NOTES:
- Hub output is COMMAND OUTPUT style, NOT chat bubbles
- All numbers use JetBrains Mono with tabular-nums
- Status dots are 8px with secondary indicators (checkmark, X, pulse)
- The streaming cursor is a blinking 2px line in #22D3EE
- hand-coded: streaming logic, SSE connection, slash-command autocomplete
```

---

## SCREEN 3: CHAT PAGE

```
SCREEN: Chat — conversational interface with an individual agent

LAYOUT (inside App Shell content area):
- Single column, max-width 800px, centered
- Full height with scrollable message area

HEADER (64px, border-bottom 1px #1E293B):
- Left: Avatar 40px + "마케팅 매니저" 16px semibold #F8FAFC + status dot green 8px + checkmark
- Right: "Soul 편집" ghost button 14px #94A3B8, "설정" icon button

MESSAGE AREA (scrollable, padding 24px, gap 16px):

  User message (RIGHT-ALIGNED):
  - Background: rgba(34,211,238,0.10), rounded-2xl, padding 16px, max-width 70%
  - Text: "SNS 마케팅 전략을 제안해줘" 14px #F8FAFC
  - Timestamp: "10:15" 12px #94A3B8, below message, right-aligned

  Agent message (LEFT-ALIGNED):
  - Avatar 24px left + "마케팅 매니저" 12px #22D3EE above
  - Background: #1E293B (slate-800), rounded-2xl, padding 16px, max-width 70%
  - Text: paragraph of Korean text, 14px #F8FAFC, line-height 1.5
  - Timestamp: "10:15" 12px #94A3B8, below message

  User message 2 (RIGHT-ALIGNED):
  - "각 채널별 예산 배분도 포함해줘"

  Agent message 2 (LEFT-ALIGNED, streaming):
  - Partial text with blinking cursor
  - Tool call inline: "웹 검색 중..." with spinner icon, 12px #60A5FA

INPUT BAR (bottom, border-top 1px #1E293B, padding 16px):
- Textarea: "메시지를 입력하세요..." placeholder, same style as Hub input
- Send button: circle 36px, bg #22D3EE, arrow-up icon #020617
- Attach button: paperclip icon 20px #94A3B8

STITCH NOTES:
- Chat uses BUBBLES (rounded-2xl), NOT command output style
- User bubbles: right-aligned, cyan tint background
- Agent bubbles: left-aligned, slate-800 background
- This is visually DISTINCT from the Hub page
- hand-coded: message streaming, auto-scroll, input auto-resize
```

---

## SCREEN 4: DASHBOARD PAGE

```
SCREEN: Dashboard — overview metrics and quick glances

LAYOUT (inside App Shell content area, max-width 1160px):
- Page heading: "대시보드" 32px bold #F8FAFC, margin-bottom 24px
- Stat cards row: 4 columns, gap 24px
- Recent activity section below
- Active agents section below

STAT CARDS (4 cards in a row, each rounded-2xl, #0F172A, border 1px #1E293B, padding 24px):

  Card 1 — Active Agents:
  - Icon: Bot 20px #22D3EE, top-right
  - Label: "활성 에이전트" 12px #94A3B8
  - Value: "12" 32px semibold #F8FAFC tabular-nums
  - Change: "+2 ▲" 12px #34D399 (emerald)

  Card 2 — Running Jobs:
  - Icon: Clock 20px #60A5FA
  - Label: "실행 중인 작업" 12px #94A3B8
  - Value: "5" 32px semibold #F8FAFC tabular-nums
  - Change: "−1 ▼" 12px #F87171 (red)

  Card 3 — Tokens Today:
  - Icon: Zap 20px #FBBF24
  - Label: "오늘 사용 토큰" 12px #94A3B8
  - Value: "847K" JetBrains Mono 32px bold #F8FAFC tabular-nums
  - Change: "+12% ▲" 12px #34D399

  Card 4 — Monthly Cost:
  - Icon: DollarSign 20px #34D399
  - Label: "이번 달 비용" 12px #94A3B8
  - Value: "$127.45" JetBrains Mono 32px bold #F8FAFC tabular-nums
  - Progress bar below: 4px, track #1E293B, fill #22D3EE, 25% width
  - "/ $500.00" 12px #94A3B8

RECENT ACTIVITY (section heading "최근 활동" 18px semibold, margin-top 32px):
- 5 activity items in a list, each with:
  - Status dot (8px, color by type)
  - Agent name: 14px medium #F8FAFC
  - Action: "보고서 작성 완료" 14px #F8FAFC
  - Timestamp: "2분 전" 12px #94A3B8
  - Divider: 1px #1E293B between items

STITCH NOTES:
- All numbers: JetBrains Mono, tabular-nums
- Change indicators: green for positive, red for negative
- This is a stitch-safe page — generate complete
```

---

## SCREEN 5: AGENTS LIST + DETAIL

```
SCREEN: Agents — list of all AI agents with detail view

--- AGENTS LIST ---

LAYOUT (max-width 1160px):
- Page heading: "에이전트" 32px bold #F8FAFC
- Right of heading: "에이전트 생성" primary button (bg #22D3EE, text #020617, 14px semibold, rounded-lg, px 16px py 8px)
- Below heading: Search input (full width, bg #0F172A, border 1px #334155, rounded-lg, padding 12px, magnifying glass icon left, "에이전트 검색..." placeholder)
- Below search: Agent cards grid (3 columns, gap 24px)

AGENT CARD (rounded-2xl, #0F172A, border 1px #1E293B, padding 24px):
- Top-left: Avatar 48px circle (initials on #334155) with status dot bottom-right
- Top-right: Overflow menu (three dots icon, 20px #94A3B8)
- Name: "비서 에이전트" 16px semibold #F8FAFC
- Department: "총무부" 14px #94A3B8
- Tier badge: "T1 EXECUTIVE" 11px uppercase, bg rgba(34,211,238,0.10), text #22D3EE, border rgba(34,211,238,0.30), rounded-full, px 8px py 2px
- Status line: status dot 8px + "대기 중" 12px, gap 8px
- Stats row (bottom): "작업 47" 12px #94A3B8 | "비용 $12.30" JetBrains Mono 12px #94A3B8

Show 6 agent cards with varied data:
1. 비서 에이전트 (T1, idle, 총무부)
2. 데이터 분석가 (T2, working-blue pulse, 분석부)
3. 마케팅 매니저 (T2, complete-green checkmark, 마케팅부)
4. 보고서 작성자 (T3, queued-hollow, 총무부)
5. SNS 매니저 (T3, working-blue pulse, 마케팅부)
6. 트레이딩 봇 (T2, idle, 투자부)

--- AGENT DETAIL (separate screen) ---

LAYOUT (max-width 1160px):
- Breadcrumb: "에이전트 / 비서 에이전트" 14px, "에이전트" in #94A3B8 (link), "/" separator, "비서 에이전트" in #F8FAFC

- Header card (rounded-2xl, #0F172A, border 1px #1E293B, padding 24px):
  - Left: Avatar 64px + status dot
  - Right of avatar: Name 24px semibold #F8FAFC, department "총무부" 14px #94A3B8, tier badge
  - Far right: "편집" secondary button (border 1px rgba(34,211,238,0.50), text #22D3EE) + "삭제" destructive button (bg rgba(248,113,113,0.10), text #F87171, border rgba(248,113,113,0.30))

- Tabs below header (gap 8px): "개요" (active, #22D3EE), "Soul" (#94A3B8), "작업 이력" (#94A3B8), "설정" (#94A3B8)
  - Active tab: text #22D3EE, border-bottom 2px #22D3EE
  - Inactive tab: text #94A3B8, no border

- Tab content "개요":
  - 2-column layout (col-span-8 + col-span-4)
  - Left: Recent activity list (last 10 tasks)
  - Right: Stats card (total tasks, success rate, avg response time, total cost — all JetBrains Mono tabular-nums)

STITCH NOTES:
- Agent cards are stitch-safe — generate complete
- Agent detail is stitch-partial — generate visual, logic added later
- Tier badge colors: T1 cyan, T2 violet, T3 slate
```

---

## SCREEN 6: DEPARTMENTS LIST + DETAIL

```
SCREEN: Departments — organizational units with agent assignments

--- DEPARTMENTS LIST ---

LAYOUT (max-width 1160px):
- Page heading: "부서" 32px bold #F8FAFC
- Right: "부서 생성" primary button
- Department cards grid (3 columns, gap 24px)

DEPARTMENT CARD (rounded-2xl, #0F172A, border 1px #1E293B, padding 24px):
- Department name: "총무부" 18px semibold #F8FAFC
- Description: "조직 전반의 행정 업무를 관리합니다" 14px #94A3B8, line-clamp-2
- Agent count: "3명의 에이전트" 12px #94A3B8 with Bot icon 16px
- Agent avatars: 3 overlapping circles (24px each, -8px overlap), showing agent initials
- Bottom: "비용 $34.50" JetBrains Mono 12px #94A3B8

Show 4 departments: 총무부 (3 agents), 분석부 (2), 마케팅부 (3), 투자부 (1)

--- DEPARTMENT DETAIL ---

- Breadcrumb: "부서 / 총무부"
- Header: department name 24px + "편집" + "삭제" buttons
- Tab content: Agent list within department (reuse agent card style, 2 columns)

STITCH NOTES:
- Department cards are stitch-safe
- Overlapping avatar group is a common pattern
```

---

## SCREEN 7: JOBS / ARGOS LIST

```
SCREEN: Jobs — scheduled and active ARGOS tasks

LAYOUT (max-width 1160px):
- Page heading: "작업" 32px bold
- Right: "작업 생성" primary button
- Filter row: Select dropdown "모든 상태" + Select dropdown "모든 유형" + Search input
- Job cards list (single column, gap 16px)

JOB CARD (rounded-2xl, #0F172A, border 1px #1E293B, padding 16px, flex row):
- Left: Type icon (clock for argos, play for manual) 20px
- Center:
  - Job name: "매일 뉴스 브리핑" 14px medium #F8FAFC
  - Assigned agent: "비서 에이전트" 12px #94A3B8
  - Schedule: "매일 06:00 KST" JetBrains Mono 12px #94A3B8
- Right:
  - Status badge: "ACTIVE" 11px uppercase, bg rgba(34,211,238,0.10), text #22D3EE, rounded-full
  - Next run: "4시간 후" 12px #94A3B8

Show 5 jobs:
1. 매일 뉴스 브리핑 (active, argos, 매일 06:00)
2. 주간 보고서 (active, argos, 매주 월 09:00)
3. SNS 콘텐츠 발행 (active, argos, 매일 10:00)
4. 월간 비용 분석 (scheduled, argos, 매월 1일)
5. 데이터 백업 (completed, manual, 완료됨) — status badge green

STITCH NOTES:
- Job cards are stitch-safe
- ARGOS scheduler component is hand-coded (cron expression builder)
- Status badge variants: active=cyan, scheduled=amber, completed=emerald, failed=red
```

---

## SCREEN 8: SETTINGS PAGE

```
SCREEN: Settings — company and system configuration

LAYOUT (max-width 800px, centered):
- Page heading: "설정" 32px bold
- Tabs: "일반" (active), "API 키", "결제", "알림", "통합"

TAB "일반" CONTENT:

  Section "회사 정보" (18px semibold, margin-top 32px):
  - Card (rounded-2xl, #0F172A, border 1px #1E293B, padding 24px):
    - Field "회사명": label 14px medium #F8FAFC, input bg #0F172A border 1px #334155 rounded-lg padding 12px, value "CORTHEX Labs"
    - Field "기본 언어": Select dropdown, value "한국어"
    - Field "시간대": Select dropdown, value "Asia/Seoul (KST)"

  Section "테마" (18px semibold, margin-top 32px):
  - Card:
    - 5 theme option circles in a row, gap 16px:
      - Cyan circle (32px, selected: ring 2px #22D3EE ring-offset-2 #020617)
      - Amber circle (32px)
      - Emerald circle (32px)
      - Violet circle (32px)
      - Slate circle (32px)
    - Label below selected: "Sovereign" 12px #94A3B8

  Section "알림 설정":
  - Card:
    - Toggle "에이전트 완료 알림": Switch component, track #334155 → #22D3EE when on
    - Toggle "비용 경고 알림": Switch on
    - Toggle "ARGOS 실패 알림": Switch on
    - Toggle "이메일 요약": Switch off (track #334155)

  Bottom: "저장" primary button + "취소" ghost button, right-aligned

STITCH NOTES:
- Settings is stitch-safe — generate complete
- Switch component: track 48px wide, thumb 20px circle, transition 150ms
- Theme selector shows the 5 CORTHEX themes from Phase 4-1
```

---

## SCREEN 9: NEXUS PAGE (Chrome Only)

```
SCREEN: NEXUS — organization chart canvas (CHROME ONLY, no React Flow)

LAYOUT:
- Sidebar COLLAPSED to 64px icon rail (only icons, no labels)
- Canvas fills remaining space: 1440 - 64 = 1376px wide, full height
- No page padding (full-bleed)

NEXUS CHROME:

  Toolbar (top, 48px height, bg #0F172A, border-bottom 1px #1E293B, padding 0 16px):
  - Left: "NEXUS" 16px semibold #F8FAFC
  - Center: View controls — "전체 보기" ghost button, zoom slider (or +/- buttons)
  - Right: "편집 모드" toggle switch + "내보내기" secondary button

  Canvas area (full remaining space):
  - Background: #040D1A (custom deep navy, NOT slate-950)
  - Show a placeholder grid pattern: dots at 24px intervals, #1E293B color
  - Center text: "React Flow 캔버스가 여기에 렌더링됩니다" 16px #94A3B8

  Collapsed sidebar (64px, #020617, right border 1px #1E293B):
  - Show only icons from the nav, vertically centered, 20px each, #94A3B8
  - Active icon (NEXUS / Network): #22D3EE
  - Tooltip on hover showing label

STITCH NOTES:
- DO NOT generate React Flow nodes/edges — this is hand-coded
- Generate ONLY the toolbar, collapsed sidebar, and empty canvas container
- The canvas background is #040D1A (darker than page bg #020617)
- This is stitch-partial — only the chrome wrapper is generated
```

---

## HAND-CODED COMPONENTS (Do NOT generate in Stitch)

The following components require full custom implementation and should NOT be generated:

1. **StreamingCursor** — rAF-based text cursor with SSE integration
2. **HubInputComposer** — Slash-command autocomplete with cmdk
3. **HubInputStream** — Scroll-locked message list with auto-scroll
4. **MarkdownRenderer** — remark/rehype markdown processing
5. **NexusCanvas** — React Flow v12 wrapper with custom nodes/edges
6. **HandoffEdge** — Animated SVG edge for delegation visualization
7. **NexusMiniMap** — React Flow MiniMap with CORTHEX styling
8. **CommandPalette** — cmdk-based global search (Cmd+K)
9. **ContextPanel** — Route-aware lazy-loaded panel (Phase 5 enhancement)
10. **ArgosScheduler** — Cron expression builder
11. **SoulEditor** — Agent personality editor with mono font

---

_End of CORTHEX Web Stitch Prompt v1.0_
_Phase 5-1 complete. 9 screen prompts ready for Google Stitch generation._
