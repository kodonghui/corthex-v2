# CORTHEX App Stitch Prompt — Phase 5-2
**Phase:** 5 · Prompt Engineering
**Date:** 2026-03-15
**Target:** Google Stitch (React generation)
**Viewport:** 390x844px (iPhone 14 Pro)
**Surface:** Mobile App (~40 components, Capacitor wrapper)

---

## HOW TO USE THIS DOCUMENT

1. Copy each **SCREEN PROMPT** below into Google Stitch one at a time
2. Generate the screen at 390x844px
3. Export as React + Tailwind code
4. Save to `_corthex_full_redesign/phase-6-stitch-output/app/`
5. Phase 7 wraps output with Capacitor, adds safe areas, and connects data

---

## GLOBAL DESIGN SYSTEM (paste this BEFORE every screen prompt)

```
DESIGN SYSTEM: CORTHEX Mobile — Swiss International Style, Dark Mode
VIEWPORT: 390x844px (iPhone 14 Pro)

COLORS:
- Page background: #020617 (slate-950)
- Card/surface: #0F172A (slate-900)
- Elevated surface: #1E293B (slate-800)
- Border: #1E293B (slate-800)
- Primary accent: #22D3EE (cyan-400)
- Text primary: #F8FAFC (slate-50)
- Text secondary: #94A3B8 (slate-400) — NEVER #64748B for body text
- Success: #34D399 (emerald-400)
- Warning: #FBBF24 (amber-400)
- Error: #F87171 (red-400)
- Working: #60A5FA (blue-400)
- Handoff: #A78BFA (violet-400)

TYPOGRAPHY:
- Font: Inter (self-hosted)
- Monospace: JetBrains Mono (for numbers/IDs only)
- Screen title: 17px, medium, #FFFFFF
- Section heading: 15px, semibold, #F8FAFC
- Body: 14px, regular, #F8FAFC
- Caption: 12px, regular, #94A3B8
- Tab label: 10px, medium (Latin only)

SPACING:
- Screen padding: 16px horizontal
- Card padding: 16px
- Card gap: 12px
- Section gap: 24px

SAFE AREAS:
- Top: env(safe-area-inset-top) — approximately 59px on iPhone 14 Pro (status bar + notch)
- Bottom: env(safe-area-inset-bottom) — approximately 34px (home indicator)
- Tab bar height: 49px + bottom safe area = ~83px total

TOUCH TARGETS:
- ALL interactive elements: minimum 44x44pt
- Tab bar items: 78pt x 49pt (5 tabs across 390pt)
- Card tap targets: full card width x minimum 72pt height
- Buttons: minimum 44pt height

BORDER RADIUS:
- Cards: 16px
- Buttons: 8px
- Avatars/dots: 9999px (circle)

ICONS: Lucide, 20px (navigation) / 24px (tab bar), 1.5 stroke, currentColor

MOTION: All animations must include @media (prefers-reduced-motion: reduce) override.
See Phase 3 design tokens for exact reduced-motion rules.
```

---

## SCREEN 1: TAB BAR + SHELL

```
SCREEN: App Shell — the persistent tab bar and status bar spacer

LAYOUT (390x844px):
- Status bar area: 59px height, transparent (content shows through)
- Content area: fills remaining space between status bar and tab bar
- Tab bar: fixed bottom, 49px height + 34px safe area = 83px total

TAB BAR (fixed bottom):
- Background: rgba(2, 6, 23, 0.92) with backdrop-blur 12px
- Top border: 1px #1E293B
- 5 tabs equally spaced (78pt each):

  Tab 1 — Hub:
  - Icon: LayoutDashboard 24px
  - Label: "Hub" 10px medium
  - ACTIVE: icon #22D3EE, label #22D3EE

  Tab 2 — Chat:
  - Icon: MessageSquare 24px
  - Label: "Chat" 10px medium
  - INACTIVE: icon #94A3B8, label #94A3B8
  - Notification dot: 6px red circle on top-right of icon

  Tab 3 — NEXUS:
  - Icon: Network 24px
  - Label: "NEXUS" 10px medium
  - INACTIVE

  Tab 4 — Jobs:
  - Icon: Clock 24px
  - Label: "Jobs" 10px medium
  - INACTIVE
  - Badge: "3" in 16px red circle, white 10px text

  Tab 5 — You:
  - Icon: User 24px
  - Label: "You" 10px medium
  - INACTIVE

STITCH NOTES:
- Tab bar must account for bottom safe area
- Active tab: #22D3EE, inactive: #94A3B8
- backdrop-blur with @supports fallback to solid #020617
- Tab labels are ENGLISH ONLY (Hub/Chat/NEXUS/Jobs/You) — no Korean needed here
- Each tab target area: 78pt x 49pt (well above 44pt minimum)
```

---

## SCREEN 2: HUB SCREEN

```
SCREEN: Hub — mobile status dashboard (NOT a terminal)

LAYOUT (390x844px, scrollable):
- Screen header: 44px height, "Hub" centered 17px medium white, right: bell icon with dot
- Below header: scrollable content, padding 16px horizontal

CONTENT (vertical scroll):

  SECRETARY CARD (top priority, rounded-2xl, bg rgba(251,191,36,0.05), border 1px rgba(251,191,36,0.20), padding 16px):
  - Left: Avatar 48px circle with blue pulse dot (8px, bottom-right)
  - Right of avatar:
    - Name: "비서 에이전트" 15px semibold #F8FAFC
    - Status: blue dot 8px (pulsing) + "작업 중" 12px #60A5FA
    - Last message preview: "2월 매출 보고서를 작성 중..." 13px #94A3B8, line-clamp-1
  - Tap target: entire card (min 72px height)

  SECTION "총무부" (section header 13px semibold #94A3B8, margin-top 24px):

  Agent Card 1 (rounded-2xl, #0F172A, border 1px #1E293B, padding 16px):
  - Left: Avatar 40px + status dot (emerald, checkmark)
  - Right: Name "데이터 수집기" 14px medium #F8FAFC, "완료" 12px #34D399
  - Tier: "T3" badge 10px

  Agent Card 2:
  - Name: "보고서 작성자", status: queued (hollow ring), "대기" 12px #94A3B8

  SECTION "마케팅부":

  Agent Card 3:
  - Name: "마케팅 매니저", status: idle, "대기 중" 12px #94A3B8

  Agent Card 4:
  - Name: "SNS 매니저", status: working (blue pulse), "SNS 콘텐츠 작성 중" 12px #60A5FA

  SECTION "최근 활동" (section header, margin-top 24px):

  Activity item 1:
  - Status dot (emerald) + "비서 에이전트가 보고서를 완료했습니다" 13px #F8FAFC + "5분 전" 12px #94A3B8

  Activity item 2:
  - Status dot (blue pulse) + "SNS 매니저가 콘텐츠 작성을 시작했습니다" + "12분 전"

  Activity item 3:
  - Status dot (red X) + "트레이딩 봇 작업이 실패했습니다" 13px + "1시간 전" — "실패" in #F87171

STITCH NOTES:
- Hub screen is a STATUS DASHBOARD, not a terminal
- Secretary card has amber tint to signal priority
- Each agent card is tappable (navigates to chat)
- Pull-to-refresh indicator at top is hand-coded
- SSE connection for live status updates is hand-coded
- Status dots use secondary indicators (checkmark/X/pulse/ring)
```

---

## SCREEN 3: CHAT SCREEN

```
SCREEN: Chat — conversation with a single agent

LAYOUT (390x844px):
- Header: 44px, left: back arrow 44x44pt tap area, center: agent name + status dot, right: overflow menu
- Message area: fills space between header and input bar, scrollable
- Input bar: bottom, above tab bar

HEADER:
- Back arrow (ChevronLeft 24px #F8FAFC, 44x44pt touch area)
- Center: "비서 에이전트" 17px medium white + blue dot 8px
- Right: MoreVertical icon 20px #94A3B8, 44x44pt touch area

MESSAGE AREA (padding 16px, gap 12px):

  Agent message (LEFT):
  - Avatar 28px + name "비서 에이전트" 11px #22D3EE above
  - Bubble: bg #1E293B, rounded-2xl rounded-tl-sm, padding 12px, max-width 80%
  - Text: "안녕하세요! 어떤 작업을 도와드릴까요?" 14px #F8FAFC
  - Time: "10:00" 11px #94A3B8

  User message (RIGHT):
  - Bubble: bg rgba(34,211,238,0.10), rounded-2xl rounded-tr-sm, padding 12px, max-width 80%
  - Text: "2월 매출 보고서를 작성해줘" 14px #F8FAFC
  - Time: "10:01" 11px #94A3B8, right-aligned

  Agent message 2 (LEFT, with tool call):
  - Bubble:
    - Text: "네, 매출 데이터를 수집하겠습니다." 14px
    - Tool call inline: rounded-lg, bg rgba(30,41,59,0.50), border 1px #334155, padding 8px
      - Wrench 14px #94A3B8 + "fetch_sales_data" JetBrains Mono 11px #F8FAFC
      - Right: emerald dot + checkmark, "1.2s" 11px #94A3B8

  Agent message 3 (LEFT, streaming):
  - Bubble with partial text: "분석 결과를 정리하면..." + blinking cursor 2px #22D3EE

INPUT BAR (above tab bar, border-top 1px #1E293B, padding 8px 16px):
- Left: Plus icon 24px #94A3B8, 44x44pt touch area
- Center: Input field, bg #0F172A, border 1px #334155, rounded-full, padding 10px 16px, "메시지 입력..." placeholder 14px #475569, min height 44px
- Right: Send button circle 36px, bg #22D3EE, ArrowUp icon #020617 — only visible when text entered

STITCH NOTES:
- Chat uses BUBBLES with rounded corners
- User messages: right-aligned, cyan tint
- Agent messages: left-aligned, slate-800
- Rounded corners: all rounded-2xl except the corner nearest the avatar (tl-sm for agent, tr-sm for user)
- Input is a rounded-full pill shape (different from web's rectangular textarea)
- Streaming, auto-scroll, keyboard handling are hand-coded
```

---

## SCREEN 4: NEXUS SCREEN (Chrome Only)

```
SCREEN: NEXUS — organization chart (CHROME ONLY)

LAYOUT (390x844px):
- Header: 44px, center "NEXUS" 17px medium white
- Right header: "편집" ghost button 14px #22D3EE
- Canvas area: fills remaining space above tab bar
- No bottom sheet shown initially

CANVAS AREA:
- Background: #040D1A (custom deep navy, darker than page bg)
- Show dot pattern: dots at 24px intervals, #1E293B color
- Center placeholder: "React Flow 캔버스" 14px #94A3B8

FLOATING ACTION BUTTON (if in edit mode):
- Position: bottom-right, 16px from edge, above tab bar
- Size: 56px diameter circle
- Background: #22D3EE
- Icon: Plus 24px #020617
- Shadow: 0 4px 12px rgba(0,0,0,0.40)

STITCH NOTES:
- DO NOT generate React Flow nodes/edges — hand-coded
- Generate only header + empty canvas + FAB
- React Flow v12 will be lazy-loaded on this tab
- Canvas supports pinch-to-zoom and pan gestures (hand-coded)
- Tapping a node opens a bottom sheet (NodeDetailSheet) — hand-coded
- Maximum 50 nodes on mobile (performance limit)
```

---

## SCREEN 5: JOBS LIST SCREEN

```
SCREEN: Jobs — list of ARGOS scheduled tasks and manual jobs

LAYOUT (390x844px, scrollable):
- Header: 44px, center "Jobs" 17px medium white, right: Filter icon
- Segment control below header: "활성" | "예정" | "완료" | "실패"
  - Active segment: bg #1E293B, text #F8FAFC, rounded-lg
  - Inactive segment: bg transparent, text #94A3B8
  - Container: bg rgba(30,41,59,0.30), rounded-lg, padding 2px
- Job cards list (padding 16px, gap 12px)

JOB CARD (rounded-2xl, #0F172A, border 1px #1E293B, padding 16px):
- Top row: Clock icon 20px #94A3B8 + job name "매일 뉴스 브리핑" 14px medium #F8FAFC
- Middle: "비서 에이전트" 12px #94A3B8 + status badge
- Bottom: "다음 실행: 18:00 KST" JetBrains Mono 12px #94A3B8 tabular-nums
- Status badge variants:
  - Active: "ACTIVE" bg rgba(34,211,238,0.10) text #22D3EE
  - Scheduled: "SCHEDULED" bg rgba(251,191,36,0.10) text #FBBF24
  - Completed: "COMPLETED" bg rgba(52,211,153,0.10) text #34D399
  - Failed: "FAILED" bg rgba(248,113,113,0.10) text #F87171
- Entire card is tappable (44pt+ height)

Show 5 job cards matching web data:
1. 매일 뉴스 브리핑 — active
2. 주간 보고서 — active
3. SNS 콘텐츠 발행 — active
4. 월간 비용 분석 — scheduled
5. 데이터 백업 — completed

STITCH NOTES:
- Job cards are stitch-safe
- Segment control is a common mobile pattern
- JetBrains Mono for all timestamps and durations
- Each card minimum 72px height
```

---

## SCREEN 6: YOU / PROFILE SCREEN

```
SCREEN: You — user profile and quick settings

LAYOUT (390x844px, scrollable):
- Header: 44px, center "You" 17px medium white
- Content padding 16px

PROFILE SECTION:
- Avatar: 64px circle, centered, initials "KD" on #334155
- Name: "Kim Donghyun" 20px semibold #F8FAFC, centered
- Role: "Admin" 14px #94A3B8, centered
- Company: "CORTHEX Labs" 14px #94A3B8

QUICK STATS (row of 3 cards, gap 12px, margin-top 24px):
- Card 1: "에이전트" 12px #94A3B8, "12" 20px semibold #F8FAFC tabular-nums
- Card 2: "작업" 12px #94A3B8, "5" 20px semibold #F8FAFC
- Card 3: "비용" 12px #94A3B8, "$127" JetBrains Mono 20px semibold tabular-nums
Each card: rounded-2xl, #0F172A, border 1px #1E293B, padding 16px, flex-1

MENU LIST (margin-top 24px, rounded-2xl, #0F172A, border 1px #1E293B):
- Each item: padding 16px, border-bottom 1px #1E293B, flex row, min height 44px
  - Left: Icon 20px #94A3B8 + label 14px #F8FAFC
  - Right: ChevronRight 16px #94A3B8

  Items:
  1. Bot icon + "에이전트 관리"
  2. Building2 + "부서 관리"
  3. DollarSign + "비용 분석"
  4. Activity + "활동 로그"
  5. Layers + "티어 설정"
  6. Settings + "설정"

BOTTOM SECTION (margin-top 24px):
- "로그아웃" button: full width, bg rgba(248,113,113,0.10), text #F87171, border 1px rgba(248,113,113,0.30), rounded-lg, 44px height, 14px medium

STITCH NOTES:
- Profile screen is stitch-safe — generate complete
- Menu list items are standard iOS-style navigation items
- All touch targets 44px+ height
- Numbers in JetBrains Mono tabular-nums
```

---

## HAND-CODED COMPONENTS (Do NOT generate in Stitch)

1. **NexusScreen** — React Flow v12 mobile with pinch-to-zoom
2. **MobileAgentNode** — React Flow custom mobile node
3. **NodeDetailSheet** — Bottom sheet with gesture dismiss
4. **PullToRefresh** — Native scroll behavior hook
5. **MobileChatInputBar** — Keyboard-aware input with auto-resize
6. **StreamingIndicator** — Typing animation for agent responses
7. **MobileContextMenu** — Haptic-enabled long-press menu

---

## CAPACITOR INTEGRATION NOTES

These are NOT for Stitch — they are Phase 7 integration notes:

1. **Status bar:** `@capacitor/status-bar` — style: dark, overlay: true
2. **Safe area:** `@capacitor-community/safe-area` for dynamic inset values
3. **Haptics:** `@capacitor/haptics` for tab switches, destructive actions, pull-to-refresh
4. **Keyboard:** `@capacitor/keyboard` for chat input keyboard handling
5. **App lifecycle:** `@capacitor/app` for SSE disconnect/reconnect on background/foreground
6. **Splash screen:** `@capacitor/splash-screen` with auto-hide after first render
7. **Build target:** iOS 15+, Android 12+ (API 31+)
8. **Bundle budget:** Initial app bundle <150KB gzipped. TTI target: <3s on mid-range Android.

---

_End of CORTHEX App Stitch Prompt v1.0_
_Phase 5-2 complete. 6 screen prompts ready for Google Stitch generation._
