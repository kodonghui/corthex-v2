# Phase 5-2: CORTHEX Mobile App — Google Stitch Prompts

**Date**: 2026-03-12
**Step**: Phase 5 — Stitch Prompts, Step 5-2
**Status**: Draft — Pending party review
**Based on**: Phase 2-2 (Option A 4-Tab Command Center, 45/50), Phase 3-1 Design Tokens, Phase 3-2 Component Strategy, Phase 4 Themes, Phase 2-2 context snapshot

---

## HOW TO USE THIS DOCUMENT

Each section is a **self-contained, copy-paste-ready prompt** for one Google Stitch session.

**Technology note**: Stitch generates **React + Tailwind CSS** — NOT React Native.
The mobile app is `packages/mobile/` — a Capacitor-wrapped React SPA, viewport 390–430px portrait.

**Workflow**:
1. Start EVERY session with **SECTION 0: MASTER MOBILE DESIGN SYSTEM PROMPT** — paste it first
2. Paste the **screen-specific prompt** you want to generate
3. First line of every section: `Generate as React with Tailwind CSS`
4. Fallback: `Generate as HTML with Tailwind CSS classes`

**Session plan** (6 Stitch sessions):
| Session | Section | Screen | Confidence |
|---------|---------|--------|-----------|
| 1 | Section 1 | Hub Home (session list) | ✅ High |
| 2 | Section 2 | Chat Screen (compact tracker) | ✅ High |
| 3 | Section 3 | Chat Screen (expanded tracker) | ✅ High |
| 4 | Section 4 | Dashboard Screen | ✅ High |
| 5 | Section 5 | NEXUS Screen (SVG tree + node sheet) | ⚠️ Medium (SVG layout needs manual work) |
| 6 | Section 6 | More Screen + Notifications | ✅ High |
| + | Section 7 | Bottom Tab Bar + TrackerStrip (shared components) | ✅ High |

**Theme selection**:
- Default: Base Zinc + Indigo (all hex values below are base theme)
- Creative themes: T1 Synaptic Cortex / T2 Terminal Command / T3 Arctic Intelligence / T4 Neon Citadel / T5 Bioluminescent Deep
- Theme swap: See Section 8 for mobile-specific overrides

---

## SECTION 0: MASTER MOBILE DESIGN SYSTEM PROMPT

> **PASTE THIS FIRST in every Stitch session before any screen prompt.**

---

```
CORTHEX Mobile App Design System — Master Prompt

I am building CORTHEX, an AI organization management mobile app for non-developer CEOs.
CORTHEX lets users command their AI team (비서실장 T1, CIO T1, 전문가 T2, 실행자 T3) from their phone.
The CEO types a command in Korean; AI agents automatically delegate and execute, reporting back live.

This is a MOBILE APP (React + Tailwind CSS, Capacitor wrapper). NOT a chatbot.
It is a command center for an AI organization. Mobile viewport: 390px primary (iPhone 15).
Visual language: Military Precision × AI Intelligence — dark, professional, information-dense.

---

DESIGN SYSTEM RULES (NEVER violate):

DARK MODE ONLY. No light mode. All surfaces:
- Page background: bg-zinc-950 (#09090B)
- Header / Bottom nav / Card surface: bg-zinc-900 (#18181B)
- Elevated / hover state: bg-zinc-800 (#27272A)
- Active session highlight: bg-zinc-800/50

BORDERS:
- ALL panels and cards: border-zinc-700 (#3F3F46)
- NEVER use border-zinc-800 on dark surfaces — invisible on bg-zinc-900
- Hover border: border-zinc-600
- Active/focus: border-indigo-500 (#6366F1)

PRIMARY ACCENT: indigo-600 (#4F46E5)
- Send button: bg-indigo-600 hover:bg-indigo-700 w-11 h-11 rounded-full text-white
- Active tab text/icon: text-indigo-400 (#818CF8)
- Active session badge: bg-indigo-950 text-indigo-300 border-indigo-800 text-xs px-2 py-0.5 rounded-full font-medium
- "명령 접수됨" inline badge: bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs px-2 py-0.5 rounded-full

STATUS COLORS:
- Online / Success: text-green-500 (#22C55E) or bg-green-500
- Working / Active SSE: bg-indigo-500 animate-pulse motion-reduce:animate-none (StatusDot)
- Warning (≥70% budget): text-amber-500 (#F59E0B) or bg-amber-500
- Error / Failed: text-red-500 (#EF4444)
- Offline / Disabled: bg-zinc-600 or text-zinc-500

TYPOGRAPHY: Work Sans (Google Fonts)
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap')
Apply: font-family: 'Work Sans', -apple-system, 'Apple SD Gothic Neo', sans-serif
Monospace (costs, IDs, chain steps): font-mono (system mono stack)

MOBILE TYPE SCALE:
- Screen header title: text-base font-semibold text-zinc-100 (16px/600)
- Section label: text-xs font-semibold uppercase tracking-wider text-zinc-400 (12px/600)
- Session row title: text-sm font-medium text-zinc-100 (14px/500)
- Session row subtitle: text-xs text-zinc-400 (12px/400)
- Agent name in chat header: text-sm font-medium text-zinc-100
- Chat assistant message: text-sm text-zinc-100 leading-relaxed
- Chat user message: text-sm text-white
- Monospace chain/cost: font-mono text-xs text-zinc-400
- Tab label (active): text-[10px] font-medium text-indigo-400
- KPI value: text-2xl font-bold text-zinc-50
- KPI label: text-xs text-zinc-400

SPACING (mobile-specific):
- Screen horizontal padding: px-4 (16px)
- Card padding: p-4 (16px)
- Between cards: gap-3 (12px)
- Header height: h-14 (56px) with border-b border-zinc-700
  Exception: Chat screen header h-12 (48px) — maximizes message area; all icon buttons still meet 44px minimum
- Tab bar height: h-14 (56px) inside nav (not counting safe area padding)
- Session row standard: h-16 (64px)
- Session row active: h-[72px] (72px)

TOUCH TARGETS (CRITICAL — never smaller):
- ALL interactive elements: minimum 44×44px (iOS HIG) / 48×48dp (Android MD3)
- Tab bar buttons: flex-1 h-14 min-h-[44px] (97px wide on 390px screen — MD3 ✅)
- Send button: w-11 h-11 (44px) — exactly meets minimum
- Header buttons: w-11 h-11 (44px) — back arrow, new session, icons
- Tracker strip compact: w-full h-12 (48px full-width — touch target ✅)
- Session rows: min-h-[64px] (h-16)
- NEXUS node: min 80×64px per node area

BOTTOM TAB BAR (shared across all screens):
nav.fixed.bottom-0.left-0.right-0.bg-zinc-900.border-t.border-zinc-700
  pb-[env(safe-area-inset-bottom)]  ← safe area on nav (NOT on content)
  div.flex.h-14 [role="tablist"]
    4 buttons [role="tab"] aria-selected flex-1 flex-col items-center justify-center gap-0.5
    Tabs: 🔗 허브 | 📈 대시보드 | 🔍 NEXUS | ⋯ 더보기
    Inactive: text-zinc-500 emoji text-xl
    Active: text-indigo-400 emoji text-xl + label text-[10px] font-medium below
    Transition: transition-colors duration-[150ms] motion-reduce:transition-none
    Badge on 더보기: absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold
      px-1 rounded-full min-w-[14px] h-[14px] flex items-center justify-center aria-hidden="true"
    Button aria-label: tab.badge ? `${tab.label} 알림 ${tab.badge}개` : tab.label
    Exception: notifications tab label = "알림" → aria-label = `알림 ${n}개` (NOT `알림 알림 N개`)

SAFE AREA:
- BottomTabBar: pb-[env(safe-area-inset-bottom)] on <nav> (includes safe inset)
- ChatScreen InputBar: pb-[env(safe-area-inset-bottom)] on wrapper div
- All other screens: Safe area handled by BottomTabBar positioning

ANIMATION RULES (WCAG 2.3.3 — ALL animated elements):
- animate-pulse → ALWAYS add motion-reduce:animate-none
- animate-bounce → ALWAYS add motion-reduce:animate-none
- All CSS transitions → add motion-reduce:transition-none
- Duration syntax: duration-[150ms] NOT duration-150 (Tailwind v4 arbitrary)
- duration-[150ms]: color/opacity micro-interactions (tab state, badge flash)
- duration-[250ms]: layout/height transitions (TrackerStrip h-12↔h-48, padding-bottom)

ARIA REQUIREMENTS (mobile WCAG 2.1 AA):
- Bottom tab nav: <nav aria-label="주 메뉴"> wrapping role="tablist"
- Tab buttons: role="tab" aria-selected={bool} aria-label="..."
- Main content area: <main className="flex-1 overflow-y-auto ...">
- Chat messages: role="log" aria-live="off" aria-label="대화 내역" (log has implicit aria-live="polite" — use off for SSE-driven updates)
- TrackerStrip visual div: role="region" aria-live="off" aria-label="Agent delegation tracker"
  CRITICAL: NEVER role="status" on visual TrackerStrip div (implicit aria-live="polite" floods at 300ms SSE rate)
  All screen-reader announcements from SEPARATE sr-only divs ONLY:
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{chain announcement}</div>
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{expand/collapse announcement}</div>
- TrackerStrip toggle button: aria-expanded={isExpanded} aria-label="핸드오프 트래커 펼치기/접기"
- Bottom sheets: role="dialog" aria-modal="true" aria-labelledby="sheet-title-id"
- Decorative status dots: aria-hidden="true"
- Active session status dot: aria-label="활성 세션" on parent or adjacent text

TRACKER STRIP — CRITICAL INVARIANT:
- Compact: h-12 (48px) — full-width tap button shows chain summary
- Expanded: h-48 (192px) — scrollable chain list with header
- Transition: transition-[height] duration-[250ms] ease-in-out motion-reduce:transition-none
- SSE handoff event: auto-expands (isTrackerExpanded = true)
- NO auto-collapse timer — WCAG 2.2.2 (Pause, Stop, Hide). User collapses manually only.
- autoCollapseTimer must NOT exist in Zustand store

SSE ENDPOINT (CRITICAL):
- POST /api/workspace/hub/stream (NOT GET, NOT on sessions URL)
- Body: { message: string, sessionId?: string, agentId?: string }
- Returns SSE stream (Content-Type: text/event-stream)
- On 'handoff' event: TrackerStrip auto-expands, chain step appended
- On 'accepted' event: show "명령 접수됨" inline badge ≤50ms
- On 'complete' event: tracker stays expanded (WCAG 2.2.2)
```

---

## SECTION 1: HUB SCREEN (SESSION LIST)

> **The default screen when the app opens. Session list + new session creation. The mobile command center home.**

---

```
Generate as React with Tailwind CSS

Mobile Hub Home Screen — CORTHEX

Show viewport 390×844px (iPhone 15). Dark bg-zinc-950.

LAYOUT (flex flex-col h-screen, no overflow):
  [HEADER h-14]
  [SEARCH h-[52px]]
  [SESSION LIST flex-1 overflow-y-auto]
  [BOTTOM TAB BAR fixed bottom-0]

---

HEADER (h-14 flex items-center justify-between px-4 bg-zinc-900 border-b border-zinc-700):
  Left: span.text-base.font-semibold.text-zinc-100.tracking-tight "CORTHEX"
  Right: button[aria-label="새 세션 시작" w-11 h-11 flex items-center justify-center]:
    Plus icon (Lucide Plus w-5 h-5 text-indigo-400)

---

SEARCH BAR (px-4 py-3 bg-zinc-950):
  div.relative:
    input[
      className="w-full h-10 bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3
                 text-sm text-zinc-100 placeholder:text-zinc-500
                 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
      placeholder="세션 검색..."
      type="search"
      aria-label="세션 검색"
    ]
    Search icon (Lucide Search w-4 h-4 text-zinc-500 absolute left-3 top-3)

---

SESSION LIST (main.flex-1.overflow-y-auto.bg-zinc-950, role="main", aria-label="세션 목록"):

  SECTION: 활성 (1 card)
    Section label: p.px-4.py-2.text-xs.font-semibold.uppercase.tracking-wider.text-zinc-400 "활성"

    ACTIVE SESSION CARD (h-[72px] flex items-center px-4 gap-3 bg-zinc-900/50 border-y border-zinc-700 active:bg-zinc-800):
      Left: StatusDot w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse motion-reduce:animate-none shrink-0
      Middle (flex-1 min-w-0):
        Row 1: flex items-center gap-2:
          span.text-sm.font-medium.text-zinc-100.truncate "월간 투자 리포트 분석"
          span.text-xs.font-medium.bg-indigo-950.text-indigo-300.border.border-indigo-800.px-1.5.py-0.5.rounded-full "ACTIVE"
        Row 2: span.text-xs.font-mono.text-zinc-400.truncate "비서실장 → CIO (D2) → 전문가 ●"
      Right: span.text-xs.text-zinc-500.shrink-0 "방금"

  SECTION: 오늘 (3 rows)
    Section label: p.px-4.py-2.text-xs.font-semibold.uppercase.tracking-wider.text-zinc-400 "오늘"

    SESSION ROW (standard, h-16, flex items-center px-4 gap-3, border-b border-zinc-700/30, active:bg-zinc-900):
      Left: div.w-8.h-8.rounded-lg.bg-zinc-800.flex.items-center.justify-center.shrink-0:
        span.text-base "📊"
      Middle (flex-1 min-w-0):
        Row 1: span.text-sm.font-medium.text-zinc-100.truncate "Q4 매출 분석 요청"
        Row 2: span.text-xs.text-zinc-400.truncate "CIO가 재무 보고서를 검토했습니다"
      Right (flex flex-col items-end gap-1 shrink-0):
        span.text-xs.text-zinc-500 "14분 전"
        span.text-xs.font-mono.text-zinc-500 "$0.023"

    (Second row): "팀 성과 요약" / "비서실장이 답변했습니다" / "2시간 전" / "$0.011"
    (Third row): "고객 미팅 준비" / "모든 에이전트가 완료했습니다" / "어제" / "$0.067"

  SECTION: 이번 주 (2 rows)
    Section label: "이번 주"
    (Same session row pattern, older sessions)

  EMPTY STATE (shown when no sessions):
    div.flex.flex-col.items-center.justify-center.py-16.px-8:
      Lucide.Bot.w-12.h-12.text-zinc-600.mb-4
      p.text-sm.text-zinc-400.text-center.mb-6 "아직 세션이 없습니다. 첫 번째 AI 팀 명령을 시작하세요."
      button.bg-indigo-600.text-white.text-sm.font-medium.px-6.py-3.rounded-lg "새 세션 시작"

---

PULL-TO-REFRESH INDICATOR (shown while refreshing):
  Fixed top of main scroll area:
  div.flex.items-center.justify-center.py-3.text-xs.text-zinc-400:
    Spinner (animate-spin w-4 h-4 text-indigo-400 mr-2 motion-reduce:animate-none) + "새로고침 중..."

---

BOTTOM TAB BAR (fixed bottom-0 left-0 right-0):
  nav[aria-label="주 메뉴"].bg-zinc-900.border-t.border-zinc-700.pb-[env(safe-area-inset-bottom)]:
    div[role="tablist"].flex.h-14:
      button[role="tab" aria-selected="true" aria-label="허브" className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] text-indigo-400 transition-colors duration-[150ms] motion-reduce:transition-none"]:
        span.text-xl.leading-none "🔗"
        span.text-[10px].font-medium "허브"
      button[role="tab" aria-selected="false" aria-label="대시보드" className="... text-zinc-500"]:
        span.text-xl.leading-none "📈"
      button[role="tab" aria-selected="false" aria-label="NEXUS" className="... text-zinc-500"]:
        span.text-xl.leading-none "🔍"
      button[role="tab" aria-selected="false" aria-label="더보기 알림 3개" className="... text-zinc-500"]:
        div.relative:
          span.text-xl.leading-none "⋯"
          span[aria-hidden="true" className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] h-[14px] flex items-center justify-center"] "3"
```

---

## SECTION 2: CHAT SCREEN (COMPACT TRACKER)

> **Full-screen chat with the AI team. TrackerStrip compact (h-12) above input bar. Most important interaction.**

---

```
Generate as React with Tailwind CSS

Mobile Chat Screen — CORTHEX (Compact Tracker State)

Show viewport 390×844px. Dark bg-zinc-950.
This is the chat view after tapping a session. TrackerStrip is in compact mode (h-12).

LAYOUT (flex flex-col h-screen):
  [HEADER h-12]
  [MESSAGES flex-1 overflow-y-auto]
  [TRACKER STRIP h-12 — compact]
  [INPUT BAR h-14 + safe area]

---

HEADER (h-12 flex items-center px-2 bg-zinc-900 border-b border-zinc-700):
  Back button (w-11 h-11 flex items-center justify-center aria-label="뒤로가기"):
    ChevronLeft w-5 h-5 text-zinc-400
  Middle (flex-1 min-w-0 px-2):
    p.text-sm.font-medium.text-zinc-100.truncate "월간 투자 리포트 분석"
  More button (w-11 h-11 flex items-center justify-center aria-label="더보기"):
    MoreVertical w-5 h-5 text-zinc-500

---

MESSAGES AREA (main[role="log" aria-label="대화 내역" aria-live="off"].flex-1.overflow-y-auto.px-4.py-3.space-y-4.bg-zinc-950):
  Note: role="log" has implicit aria-live="polite" — override with aria-live="off" for SSE-driven chat to prevent floods.
  All SR announcements come from separate sr-only divs (same pattern as TrackerStrip).

  DATE DIVIDER:
    div.flex.items-center.gap-3.py-2:
      div.flex-1.h-px.bg-zinc-800
      span.text-xs.text-zinc-500 "오늘"
      div.flex-1.h-px.bg-zinc-800

  ASSISTANT MESSAGE (AI agent):
    div.flex.flex-col.gap-1.max-w-[80%]:
      span.text-xs.text-zinc-500.ml-1.mb-0.5:
        "비서실장"  ← space  TierBadge: span.text-[10px].font-mono.bg-indigo-950.border.border-indigo-800.text-indigo-300.px-1.py-0.5.rounded "T1"
      div.bg-zinc-800.border.border-zinc-700.border-l-2.border-l-indigo-500.rounded-xl.rounded-tl-sm.px-4.py-3:
        p.text-sm.text-zinc-100.leading-relaxed "안녕하세요. 월간 투자 리포트 분석을 시작하겠습니다. CIO에게 재무 데이터 수집을 요청했습니다."
      span.text-xs.text-zinc-600.ml-1 "14:23"

  USER MESSAGE (right-aligned):
    div.flex.flex-col.items-end.gap-1.max-w-[75%].ml-auto:
      div.bg-indigo-600.rounded-xl.rounded-tr-sm.px-4.py-3:
        p.text-sm.text-white.leading-relaxed "이번 달 투자 성과를 요약하고 다음 달 전략을 제안해줘"
      span.text-xs.text-zinc-600.mr-1 "14:22"

  AGENT MESSAGE (CIO, second agent):
    Same pattern as assistant message but:
    Header: "CIO"  TierBadge T1 (same indigo style)
    Border-left: border-l-2 border-l-indigo-500 (same for all T1 agents)

  PROCESSING INDICATOR (shown while SSE streams):
    div.flex.flex-col.gap-1:
      span.text-xs.text-zinc-500.ml-1 "전문가" + TierBadge T2 (violet-950/violet-300)
      div.bg-zinc-800.border.border-zinc-700.border-l-2.border-l-violet-500.rounded-xl.rounded-tl-sm.px-4.py-3:
        div.flex.items-center.gap-2:
          span.w-1.5.h-1.5.rounded-full.bg-indigo-400.animate-pulse.motion-reduce:animate-none
          span.w-1.5.h-1.5.rounded-full.bg-indigo-400.animate-pulse.motion-reduce:animate-none.[animation-delay:0.2s]
          span.w-1.5.h-1.5.rounded-full.bg-indigo-400.animate-pulse.motion-reduce:animate-none.[animation-delay:0.4s]

  "명령 접수됨" BADGE (appears immediately after send, ≤50ms):
    div.flex.justify-center.py-1:
      span.inline-flex.items-center.gap-1.5.bg-indigo-950.text-indigo-300.border.border-indigo-800.text-xs.px-3.py-1.rounded-full:
        Check w-3 h-3
        "명령 접수됨"

---

SCREEN-READER ANNOUNCEMENTS (sr-only, separate from visual elements):
  div[role="status" aria-live="polite" aria-atomic="true" className="sr-only"]
    Content: "전문가이(가) 처리 중 (D3)" ← current SSE step

---

TRACKER STRIP — COMPACT (h-12):
  div[role="region" aria-live="off" aria-label="Agent delegation tracker"
      className="bg-zinc-900 border-t border-zinc-700
                 transition-[height] duration-[250ms] ease-in-out motion-reduce:transition-none h-12"]:
    button[
      onClick=onToggle
      className="w-full h-12 flex items-center px-4 gap-2 min-h-[44px]"
      aria-label="핸드오프 트래커 펼치기"
      aria-expanded="false"
    ]:
      span.w-2.h-2.rounded-full.bg-indigo-500.animate-pulse.motion-reduce:animate-none.shrink-0
      span.text-xs.font-mono.text-zinc-300.truncate.flex-1.text-left
        "비서실장 → CIO (D2) → 전문가 ●"
      ChevronUp w-4 h-4 text-zinc-500 shrink-0

---

INPUT BAR (bg-zinc-900 border-t border-zinc-700 pb-[env(safe-area-inset-bottom)]):
  div.flex.items-center.h-14.px-3.gap-2:
    Attach button [w-11 h-11 flex items-center justify-center aria-label="파일 첨부"]:
      Paperclip w-5 h-5 text-zinc-400
    input[
      className="flex-1 h-10 bg-zinc-800 border border-zinc-700 rounded-full px-4
                 text-sm text-zinc-100 placeholder:text-zinc-500
                 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
      placeholder="명령을 입력..."
      aria-label="명령 입력"
    ]
    Send button [w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center aria-label="명령 전송"]:
      SendHorizonal w-5 h-5 text-white
```

---

## SECTION 3: CHAT SCREEN (EXPANDED TRACKER)

> **Same chat screen with TrackerStrip expanded to h-48. Shows full delegation chain with status icons. The product's signature mobile feature.**

---

```
Generate as React with Tailwind CSS

Mobile Chat Screen — CORTHEX (Expanded Tracker State)

Same as Section 2 but TrackerStrip is EXPANDED (h-48 = 192px).
The expanded strip shows the full handoff chain with agent names, tiers, depth, elapsed time, and cost.

LAYOUT (flex flex-col h-screen):
  [HEADER h-12]
  [MESSAGES flex-1 overflow-y-auto — content scrolls behind expanded tracker]
  [TRACKER STRIP h-48 — expanded]
  [INPUT BAR h-14 + safe area]

---

(HEADER and MESSAGES AREA: same as Section 2 — do not repeat)

---

TRACKER STRIP — EXPANDED (h-48 = 192px):
  div[role="region" aria-live="off" aria-label="Agent delegation tracker"
      className="bg-zinc-900 border-t border-zinc-700
                 transition-[height] duration-[250ms] ease-in-out motion-reduce:transition-none h-48"]:

    HEADER ROW (flex items-center justify-between px-4 py-2 border-b border-zinc-700 shrink-0):
      span.text-xs.font-semibold.text-zinc-300.uppercase.tracking-wider "핸드오프 체인"
      div.flex.items-center.gap-3:
        span.text-xs.font-mono.text-zinc-500 "$0.0083 total"
        button[onClick=onToggle w-11 h-11 flex items-center justify-center aria-label="트래커 접기" aria-expanded="true"]:
          ChevronDown w-4 h-4 text-zinc-500

    CHAIN LIST (flex-1 overflow-y-auto px-4 py-2 space-y-2):

      STEP 1 — COMPLETED:
        div.flex.items-start.gap-2:
          Check (Lucide Check w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5)
          div.flex-1.min-w-0:
            div.flex.items-center.gap-1.5.flex-wrap:
              span.text-xs.font-medium.text-zinc-200 "비서실장"
              TierBadge T1: span.text-[10px].font-mono.bg-indigo-950.border.border-indigo-800.text-indigo-300.px-1.py-0.5.rounded "T1"
              span.text-[10px].font-mono.text-zinc-500 "D1"
            span.text-[10px].font-mono.text-zinc-500 "12.3s"
          ArrowRight w-3 h-3 text-zinc-600 mt-0.5 shrink-0

      STEP 2 — COMPLETED:
        div.flex.items-start.gap-2:
          Check (text-green-500)
          div.flex-1.min-w-0:
            div.flex.items-center.gap-1.5.flex-wrap:
              span "CIO"
              TierBadge T1 (same as above)
              span "D2"
            span "8.7s"
          ArrowRight (shrink-0)

      STEP 3 — ACTIVE (currently processing):
        div.flex.items-start.gap-2:
          span.w-3.5.h-3.5.rounded-full.bg-indigo-500.animate-pulse.motion-reduce:animate-none.shrink-0.mt-0.5
          div.flex-1.min-w-0:
            div.flex.items-center.gap-1.5.flex-wrap:
              span.text-xs.font-medium.text-zinc-100 "전문가"
              TierBadge T2: span.text-[10px].font-mono.bg-violet-950.border.border-violet-800.text-violet-300.px-1.py-0.5.rounded "T2"
              span.text-[10px].font-mono.text-zinc-500 "D3"
              span.text-[10px].font-mono.text-amber-400 "처리 중..."
            span.text-[10px].font-mono.text-zinc-500 "34.1s"

    COST SUMMARY ROW (px-4 py-1.5 border-t border-zinc-700 flex items-center justify-between shrink-0):
      span.text-[10px].text-zinc-500 "총 처리 시간: 55.1s"
      span.text-[10px].font-mono.text-zinc-400 "$0.0083 / $16.00"

---

SCREEN-READER ANNOUNCEMENTS:
  div[role="status" aria-live="polite" aria-atomic="true" className="sr-only"]
    "전문가이(가) 처리 중 (D3)"
  div[role="status" aria-live="polite" aria-atomic="true" className="sr-only"]
    "핸드오프 트래커가 열렸습니다"

---

INPUT BAR: same as Section 2
```

---

## SECTION 4: DASHBOARD SCREEN

> **KPI overview + cost monitoring + agent health. CEO's daily check-in screen.**

---

```
Generate as React with Tailwind CSS

Mobile Dashboard Screen — CORTHEX

Show viewport 390×844px. Dark bg-zinc-950.
Endpoint: GET /api/workspace/dashboard/summary + GET /api/workspace/dashboard/costs

LAYOUT (flex flex-col h-screen):
  [HEADER h-14]
  [CONTENT flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950]
  [BOTTOM TAB BAR fixed bottom-0]

---

HEADER (h-14 flex items-center justify-between px-4 bg-zinc-900 border-b border-zinc-700):
  span.text-base.font-semibold.text-zinc-100 "대시보드"
  button[w-11 h-11 flex items-center justify-center aria-label="날짜 필터"]:
    Calendar w-5 h-5 text-zinc-400

---

CONTENT (main[role="main"].flex-1.overflow-y-auto.p-4.space-y-4.bg-zinc-950):

  SUMMARY DATE ROW:
    div.flex.items-center.justify-between.mb-1:
      span.text-xs.text-zinc-500 "2026년 3월 12일 기준"
      span.text-xs.font-mono.text-green-500 "● 실시간"

  2×2 KPI GRID (grid grid-cols-2 gap-3):

    KPI CARD 1 — 총 비용:
      div.bg-zinc-900.border.border-zinc-700.rounded-xl.p-4:
        p.text-xs.text-zinc-400.mb-1 "총 비용"
        p.text-2xl.font-bold.text-zinc-50.font-mono "$12.40"
        p.text-xs.text-green-500.mt-1.flex.items-center.gap-1:
          TrendingUp w-3 h-3
          "↓ $2.10 어제 대비"

    KPI CARD 2 — 세션 수:
      div.bg-zinc-900.border.border-zinc-700.rounded-xl.p-4:
        p.text-xs.text-zinc-400.mb-1 "세션 수"
        p.text-2xl.font-bold.text-zinc-50 "42"
        p.text-xs.text-zinc-500.mt-1 "이번 달"

    KPI CARD 3 — 에이전트:
      div.bg-zinc-900.border.border-zinc-700.rounded-xl.p-4:
        p.text-xs.text-zinc-400.mb-1 "에이전트"
        p.text-2xl.font-bold.text-zinc-50 "8/8"
        p.text-xs.text-green-500.mt-1 "● 전원 온라인"

    KPI CARD 4 — 오류율:
      div.bg-zinc-900.border.border-zinc-700.rounded-xl.p-4:
        p.text-xs.text-zinc-400.mb-1 "오류율"
        p.text-2xl.font-bold.text-zinc-50 "0%"
        p.text-xs.text-green-500.mt-1 "정상 운영 중"

  COST BUDGET CARD:
    div.bg-zinc-900.border.border-zinc-700.rounded-xl.p-4:
      div.flex.items-center.justify-between.mb-3:
        p.text-xs.font-semibold.uppercase.tracking-wider.text-zinc-400 "월간 비용 현황"
        span.text-xs.font-mono.text-amber-400 "⚠️ 78%"
      div.w-full.h-2.bg-zinc-700.rounded-full.overflow-hidden:
        div.h-full.bg-amber-500.rounded-full.transition-[width].duration-500.motion-reduce:transition-none
          style={{ width: '78%' }}
      div.flex.items-center.justify-between.mt-2:
        span.text-xs.font-mono.text-zinc-300 "$12.40"
        span.text-xs.font-mono.text-zinc-500 "한도: $16.00"
      p.text-xs.text-amber-400.mt-1 "예산의 78%를 사용했습니다. 한도에 주의하세요."

  AGENT HEALTH CARD:
    div.bg-zinc-900.border.border-zinc-700.rounded-xl:
      HEADER (px-4 py-3 border-b border-zinc-700 flex items-center justify-between):
        p.text-xs.font-semibold.uppercase.tracking-wider.text-zinc-400 "에이전트 상태"
        span.text-xs.text-zinc-500 "8개 에이전트"

      AGENT ROWS (divide-y divide-zinc-700/40):
        ROW (h-14 flex items-center px-4 gap-3):
          StatusDot: span.w-2.h-2.rounded-full.bg-indigo-500.animate-pulse.motion-reduce:animate-none.shrink-0 (working)
          div.flex-1.min-w-0:
            p.text-sm.font-medium.text-zinc-100.truncate "비서실장"
            p.text-xs.text-zinc-400 "3개 작업 처리 중"
          TierBadge T1: span.text-[10px].font-mono.bg-indigo-950.border.border-indigo-800.text-indigo-300.px-1.5.py-0.5.rounded "T1"

        ROW (h-14): CIO | "전략 분석 중" | StatusDot indigo (working) | TierBadge T1
        ROW (h-14): CTO | "시스템 점검 중" | StatusDot green (online) | TierBadge T1
        ROW (h-14): 데이터 전문가 | "대기 중" | StatusDot green (online) | TierBadge T2
        ROW (h-14): 재무 전문가 | "대기 중" | StatusDot green (online) | TierBadge T2
        ROW (h-14 last): 코딩 실행자 | "대기 중" | StatusDot green | TierBadge T3

  RECENT ACTIVITY CARD:
    div.bg-zinc-900.border.border-zinc-700.rounded-xl:
      HEADER (px-4 py-3 border-b border-zinc-700):
        p.text-xs.font-semibold.uppercase.tracking-wider.text-zinc-400 "최근 활동"
      ROWS (divide-y divide-zinc-700/40):
        ROW (px-4 py-3):
          div.flex.items-start.gap-3:
            div.w-8.h-8.rounded-lg.bg-zinc-800.flex.items-center.justify-center.shrink-0:
              Check w-4 h-4 text-green-500
            div.flex-1.min-w-0:
              p.text-sm.text-zinc-200 "월간 투자 리포트 완료"
              p.text-xs.text-zinc-500 "3개 에이전트 · $0.023 · 22분"
        (2 more similar rows)

  BOTTOM PADDING (h-20) to avoid content hidden behind tab bar

---

BOTTOM TAB BAR (activeTab="dashboard"):
  Same structure as Section 1 — 📈 대시보드 tab is aria-selected="true" text-indigo-400 with label shown.
  Other tabs: text-zinc-500 aria-selected="false"
```

---

## SECTION 5: NEXUS SCREEN (SVG ORG TREE)

> **Read-only mobile org chart. SVG simplified tree — NOT @xyflow/react (too heavy for mobile). Pinch-zoom via CSS. Endpoint: GET /api/workspace/nexus/org-data.**

---

```
Generate as React with Tailwind CSS

Mobile NEXUS Screen — CORTHEX Org Chart (Read-Only SVG Tree)

IMPORTANT: This is NOT @xyflow/react — generate a static SVG tree layout.
No drag-and-drop. No edge drawing. Read-only visualization only.
Pinch-to-zoom: CSS transform scale wrapper (handled in code, not Stitch).
Endpoint: GET /api/workspace/nexus/org-data

Show viewport 390×844px. Dark bg-zinc-950.

LAYOUT (flex flex-col h-screen):
  [HEADER h-14]
  [MAIN flex-1 overflow-hidden relative bg-zinc-950]
    [SCREEN-READER FALLBACK sr-only]
    [SVG TREE CANVAS full-screen absolute]
    [ZOOM CONTROLS bottom-right]
    [HINT TEXT bottom-center]
    [NODE BOTTOM SHEET when node tapped]
  [BOTTOM TAB BAR fixed bottom-0]

---

HEADER (h-14 flex items-center justify-between px-4 bg-zinc-900 border-b border-zinc-700):
  span.text-base.font-semibold.text-zinc-100 "조직도"
  div.flex.items-center.gap-1:
    button[w-11 h-11 flex items-center justify-center aria-label="노드 검색"]:
      Search w-5 h-5 text-zinc-400

---

SCREEN-READER FALLBACK (sr-only — visually hidden, readable by screen readers):
  div[aria-label="조직도 목록" className="sr-only"]:
    ul:
      li "비서실장 — T1 티어, 최고비서실" (aria-label="비서실장, T1 티어, 온라인")
      li "CIO — T1 티어, 정보전략부"
      li "CTO — T1 티어, 기술전략부"
      li "데이터 전문가 — T2 티어, 정보전략부"
      li "재무 전문가 — T2 티어, 경영지원부"
      li "코딩 실행자 — T3 티어, 기술전략부"

---

SVG ORG TREE CANVAS (main[role="main"].flex-1.overflow-hidden.relative.bg-zinc-950):

  SVG TREE (static, centered — 360px wide tree within 390px viewport):

  [NODE STYLE]:
    rect: width=120 height=52 rx=8 fill="#18181B" stroke="#3F3F46" strokeWidth=1
    Active/selected: stroke="#6366F1" strokeWidth=2
    T1 Manager badge: small rect 28×16 rx=4 fill="#1E1B4B" stroke="#3730A3"
      text fill="#A5B4FC" fontSize=9 fontFamily="monospace" "T1"
    T2 Specialist badge: fill="#2E1065" stroke="#6D28D9" text fill="#C4B5FD" "T2"
    T3 Worker badge: fill="#27272A" stroke="#52525B" text fill="#A1A1AA" "T3"
    Agent name text: fill="#F4F4F5" fontSize=12 fontWeight=500 fontFamily="Work Sans, sans-serif"
    StatusDot circle: r=3.5 — fill="#22C55E" (online) / fill="#6366F1" (active)

  [CONNECTOR LINES]:
    path d="M{parentCenterX},{parentBottomY} L{parentCenterX},{midY} L{childCenterX},{midY} L{childCenterX},{childTopY}"
    stroke="#4F46E5" strokeWidth=1.5 fill="none" opacity=0.6

  TREE LAYOUT (top-down, centered at x=195):

    Level 0 (y=24):
      NODE: "비서실장" x=135 y=24 (T1, green statusDot, active — indigo border)

    CONNECTOR: from 비서실장 bottom → branches to CIO and CTO

    Level 1 (y=120):
      NODE LEFT: "CIO" x=60 y=120 (T1, green statusDot)
      NODE RIGHT: "CTO" x=210 y=120 (T1, green statusDot)

    CONNECTOR: CIO → branches to 데이터 전문가, 재무 전문가
    CONNECTOR: CTO → branches to 코딩 실행자

    Level 2 (y=216):
      NODE: "데이터 전문가" x=5 y=216 (T2, green statusDot)   ← right edge: 5+120=125
        [truncate: "데이터\n전문가" split across 2 tspan lines]
      NODE: "재무 전문가" x=135 y=216 (T2, green statusDot)  ← right edge: 135+120=255, 10px gap ✓
      NODE: "코딩 실행자" x=265 y=216 (T3, green statusDot) ← right edge: 265+120=385, 10px gap ✓, 390px viewport ✓

  ZOOM CONTROLS (absolute bottom-[72px] right-4 flex flex-col gap-2):
    button[w-11 h-11 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center aria-label="확대"]:
      Plus w-4 h-4 text-zinc-300
    button[w-11 h-11 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center aria-label="축소"]:
      Minus w-4 h-4 text-zinc-300

  HINT TEXT (absolute bottom-[72px] left-0 right-0 text-center):
    p.text-xs.text-zinc-600 "노드를 탭하면 상세 정보"

---

NODE DETAIL BOTTOM SHEET (shown when a node is tapped):
  Overlay: div.fixed.inset-0.bg-black/60.z-40 (tap to dismiss)
  Sheet: div[role="dialog" aria-modal="true" aria-labelledby="node-sheet-title"
              className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-700 rounded-t-2xl"]:
    DRAG HANDLE: div.w-10.h-1.bg-zinc-600.rounded-full.mx-auto.mt-3.mb-4
    CONTENT (px-4 pb-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]):
      TITLE ROW (flex items-center gap-3 mb-4):
        div.w-10.h-10.rounded-lg.bg-zinc-800.flex.items-center.justify-center:
          Bot w-5 h-5 text-indigo-400
        div:
          p#node-sheet-title.text-base.font-semibold.text-zinc-100 "비서실장"
          p.text-xs.text-zinc-400 "최고비서실"
      INFO ROWS (space-y-3):
        Row: span.text-xs.text-zinc-500.w-16 "티어" → TierBadge T1 (indigo)
        Row: span "상태" → div.flex.items-center.gap-2: StatusDot green + span.text-xs.text-green-500 "온라인"
        Row: span "처리 중" → span.text-xs.text-zinc-300.font-mono "3개 작업"
        Row: span "오늘 비용" → span.text-xs.font-mono.text-zinc-300 "$4.20"
      CLOSE BUTTON (mt-4 w-full):
        button.w-full.h-12.bg-zinc-800.border.border-zinc-700.rounded-xl.text-sm.text-zinc-300.font-medium
          aria-label="닫기" "닫기"

---

BOTTOM TAB BAR (activeTab="nexus"):
  🔍 NEXUS tab: aria-selected="true" text-indigo-400 with label
  Others: text-zinc-500
```

---

## SECTION 6: MORE SCREEN + NOTIFICATIONS

> **Feature grid (More tab) + Notifications sub-screen. The "more" tab surfaces all P2/P3 features behind a 2-column grid.**

---

```
Generate as React with Tailwind CSS

Mobile More Screen + Notifications — CORTHEX

Show BOTH screens side by side (or as separate artboards):
  Screen A: More feature grid
  Screen B: Notifications list

---

=== SCREEN A: MORE FEATURE GRID ===

Viewport 390×844px. Dark bg-zinc-950.

HEADER (h-14 flex items-center justify-between px-4 bg-zinc-900 border-b border-zinc-700):
  span.text-base.font-semibold.text-zinc-100 "더보기"
  button[w-11 h-11 flex items-center justify-center aria-label="프로필"]:
    UserCircle w-6 h-6 text-zinc-400

USER PROFILE CARD (mx-4 mt-4 mb-2 p-4 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center gap-3):
  div.w-10.h-10.rounded-full.bg-indigo-600.flex.items-center.justify-center.shrink-0:
    span.text-white.text-base.font-semibold "김"
  div.flex-1:
    p.text-sm.font-medium.text-zinc-100 "김대표"
    p.text-xs.text-zinc-400 "CEO · corthex.io"
  ChevronRight w-4 h-4 text-zinc-500

FEATURE GRID LABEL (px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400):
  "기능"

FEATURE GRID (main[role="main"].px-4):
  div.grid.grid-cols-2.gap-3:

    GRID CARD (span: AGORA — 토론실):
      button[
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3 active:bg-zinc-800 transition-colors duration-[150ms] motion-reduce:transition-none"
        aria-label="AGORA 토론실"
      ]:
        div.w-10.h-10.rounded-xl.bg-indigo-950.flex.items-center.justify-center:
          Scale w-5 h-5 text-indigo-400   ← Lucide Scale (deliberation/justice — NOT MessageSquare/chat bubble)
        div:
          p.text-sm.font-medium.text-zinc-100 "AGORA"
          p.text-xs.text-zinc-400 "토론실"

    GRID CARD (라이브러리):
      Icon: BookOpen w-5 h-5 text-zinc-300 in bg-zinc-800 rounded-xl
      Label: "라이브러리" / "지식 관리"

    GRID CARD (ARGOS — 알림 badge!):
      Icon: Radio w-5 h-5 text-zinc-300 in bg-zinc-800 rounded-xl
      Label: "ARGOS" / "스케줄 작업"

    GRID CARD (알림 — with red badge):
      button[aria-label="알림 3개"]:
        div.relative:
          div.w-10.h-10.rounded-xl.bg-zinc-800.flex.items-center.justify-center:
            Bell w-5 h-5 text-zinc-300
          span[aria-hidden="true" className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[16px] h-[16px] flex items-center justify-center"] "3"
        div:
          p.text-sm.font-medium.text-zinc-100 "알림"
          p.text-xs.text-zinc-400 "공지 및 알림"

    GRID CARD (거래 — P3):
      Icon: BarChart3 w-5 h-5 in bg-zinc-800
      Label: "거래" / "매매 관리"
      Badge: span.text-[9px].bg-zinc-700.text-zinc-400.px-1.5.py-0.5.rounded "준비 중"

    GRID CARD (SNS):
      Icon: Share2 w-5 h-5 in bg-zinc-800
      Label: "SNS" / "소셜 채널"
      Badge: "준비 중"

    GRID CARD (파일):
      Icon: FolderOpen w-5 h-5 in bg-zinc-800
      Label: "파일" / "문서 보관"

    GRID CARD (설정):
      Icon: Settings w-5 h-5 in bg-zinc-800
      Label: "설정" / "앱 설정"

APP VERSION (px-4 py-6 flex items-center justify-between):
  span.text-xs.text-zinc-600 "CORTHEX v2.0.0"
  button.border.border-zinc-700.text-zinc-400.text-sm.px-4.py-2.rounded-lg.min-h-[44px] "로그아웃"

---

=== SCREEN B: NOTIFICATIONS LIST ===

HEADER (h-14 flex items-center px-2 bg-zinc-900 border-b border-zinc-700):
  button[w-11 h-11 back arrow aria-label="뒤로가기"]: ChevronLeft
  span.flex-1.text-base.font-semibold.text-zinc-100 "알림"
  button[w-11 h-11 aria-label="모두 읽음"]:
    CheckCheck w-5 h-5 text-zinc-400

FILTER ROW (px-4 py-2 flex items-center gap-2 border-b border-zinc-700 bg-zinc-900):
  button.bg-indigo-950.border.border-indigo-800.text-indigo-300.text-xs.px-3.py-1.rounded-full "전체"
  button.border.border-zinc-700.text-zinc-400.text-xs.px-3.py-1.rounded-full "읽지 않음"
  button.border.border-zinc-700.text-zinc-400.text-xs.px-3.py-1.rounded-full "에이전트"

NOTIFICATION LIST (main.flex-1.overflow-y-auto.divide-y.divide-zinc-700/40):

  NOTIFICATION ROW — UNREAD (px-4 py-4 flex items-start gap-3 bg-zinc-900/30 active:bg-zinc-800):
    Left: div.w-9.h-9.rounded-xl.bg-indigo-950.flex.items-center.justify-center.shrink-0:
      Bot w-4 h-4 text-indigo-400
    Middle:
      div.flex.items-center.gap-2.mb-0.5:
        p.text-sm.font-medium.text-zinc-100 "비서실장이 완료했습니다"
        div.w-2.h-2.rounded-full.bg-indigo-500.shrink-0 (unread dot)
      p.text-xs.text-zinc-400.leading-relaxed "월간 투자 리포트 분석이 완료되었습니다. 결과물을 확인하세요."
      p.text-xs.text-zinc-500.mt-1 "3분 전"

  NOTIFICATION ROW — UNREAD (system alert):
    Icon: AlertTriangle w-4 h-4 text-amber-400 in bg-amber-950/50 rounded-xl
    Title: "예산 경고"
    Body: "월간 비용이 한도의 78%에 도달했습니다."
    Time: "1시간 전"
    Unread dot: visible

  NOTIFICATION ROW — UNREAD:
    Icon: Zap w-4 h-4 text-indigo-400 in bg-indigo-950 rounded-xl
    Title: "ARGOS 작업 완료"
    Body: "일일 리포트 생성 스케줄이 성공적으로 실행되었습니다."
    Time: "2시간 전"
    Unread dot: visible

  SECTION DIVIDER (px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-950/50):
    "이전 알림"

  NOTIFICATION ROW — READ (opacity-60 or text slightly muted):
    Same structure but no unread dot, text-zinc-300 (not zinc-100)

---

BOTTOM TAB BAR (activeTab="more"):
  ⋯ 더보기 tab: aria-selected="true" text-indigo-400 with label
  Others inactive
  Note: badge on ⋯ tab NOT shown inside More screen (already viewing it)
```

---

## SECTION 7: SHARED COMPONENTS — BOTTOM TAB BAR + TRACKERSTRIP

> **Isolated component session — generate BottomTabBar and TrackerStrip as reusable components with all states.**

---

```
Generate as React with Tailwind CSS

Shared Mobile Components — CORTHEX Bottom Tab Bar + TrackerStrip

Generate two React components with all states shown in one artboard.
Viewport: 390px width, dark bg-zinc-950 page background.
Show all variants stacked vertically with labels.

---

=== COMPONENT 1: BottomTabBar (all 4 active-tab states) ===

Show 4 variations of the tab bar stacked, each labeled:

VARIANT A — Hub active:
  nav[aria-label="주 메뉴"].bg-zinc-900.border-t.border-zinc-700.pb-[env(safe-area-inset-bottom)]:
    div[role="tablist"].flex.h-14:
      [🔗 허브] role="tab" aria-selected="true" text-indigo-400:
        span "🔗" text-xl + span "허브" text-[10px] font-medium (both indigo-400)
      [📈 대시보드] role="tab" aria-selected="false" text-zinc-500:
        span "📈" text-xl only
      [🔍 NEXUS] role="tab" aria-selected="false" text-zinc-500: span "🔍" text-xl
      [⋯ 더보기] role="tab" aria-selected="false" text-zinc-500:
        div.relative: span "⋯" text-xl
          + badge span[aria-hidden="true"] "3" (absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] h-[14px])

VARIANT B — Dashboard active:
  Same, 📈 대시보드 = aria-selected="true" text-indigo-400 with label shown

VARIANT C — NEXUS active:
  Same, 🔍 NEXUS = aria-selected="true" text-indigo-400 with label shown

VARIANT D — More active (badge gone — viewing notifications):
  Same, ⋯ 더보기 = aria-selected="true" text-indigo-400 with label, no badge

---

=== COMPONENT 2: TrackerStrip (all states) ===

Show 4 states stacked vertically:

STATE A — IDLE (not visible):
  div.text-xs.text-zinc-600.px-4.py-2.bg-zinc-950 "트래커: 비활성 (대기 중)"

STATE B — COMPACT/ACTIVE (h-12):
  div[role="region" aria-live="off" aria-label="Agent delegation tracker"
      className="bg-zinc-900 border-t border-zinc-700 h-12 transition-[height] duration-[250ms] ease-in-out motion-reduce:transition-none"]:
    SR-only divs ABOVE (before the visual div):
      div[role="status" aria-live="polite" aria-atomic="true" className="sr-only"] "전문가이(가) 처리 중 (D3)"
      div[role="status" aria-live="polite" aria-atomic="true" className="sr-only"] ""
    button.w-full.h-12.flex.items-center.px-4.gap-2.min-h-[44px] [aria-expanded="false" aria-label="핸드오프 트래커 펼치기"]:
      span.w-2.h-2.rounded-full.bg-indigo-500.animate-pulse.motion-reduce:animate-none.shrink-0
      span.text-xs.font-mono.text-zinc-300.truncate.flex-1.text-left "비서실장 → CIO (D2) → 전문가 ●"
      ChevronUp w-4 h-4 text-zinc-500 shrink-0

STATE C — EXPANDED (h-48 = 192px):
  Same wrapper with h-48:
    Header row: "핸드오프 체인" + "$0.0083 total" + collapse button [aria-expanded="true"]
    Chain list (scrollable):
      Step 1 ✅ 비서실장 T1 D1 12.3s (Check icon green)
      Step 2 ✅ CIO T1 D2 8.7s (Check icon green)
      Step 3 🔵 전문가 T2 D3 34.1s... (pulse dot indigo, amber "처리 중...")
    Cost footer: "총 55.1s" | "$0.0083 / $16.00"

STATE D — COMPLETE (h-48 stays expanded per WCAG 2.2.2):
  Same as STATE C but:
    Step 3: ✅ 전문가 T2 D3 47.2s (Check icon green — completed)
    Pulse dot → Check icon (green) on completion
    Header: "핸드오프 체인" + "완료 ✓" + collapse button [aria-expanded="true" aria-label="트래커 접기"]
    All steps show green Check icon
    Footer: "$0.0091 · 완료" text-green-500

TierBadge specs (shown separately for reference):
  T1: text-[10px] font-mono bg-indigo-950 border border-indigo-800 text-indigo-300 px-1.5 py-0.5 rounded
  T2: text-[10px] font-mono bg-violet-950 border border-violet-800 text-violet-300 px-1.5 py-0.5 rounded
  T3: text-[10px] font-mono bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded
```

---

## SECTION 8: MOBILE THEME SWAP GUIDE

> **Override color tokens for all 5 creative themes. Copy-paste CSS replacements for `packages/mobile/src/index.css`.**

---

```
MOBILE THEME SWAP GUIDE

After Stitch generates base screens, apply theme overrides below.
Replace Tailwind utility classes with [arbitrary-value] equivalents OR add @theme tokens.

=== BASE THEME (default — use as-is) ===
Page: bg-zinc-950   Panel: bg-zinc-900   Card: bg-zinc-800
Border: border-zinc-700   Active tab: text-indigo-400
Primary button: bg-indigo-600   Send button: bg-indigo-600
TierBadge T1: bg-indigo-950/border-indigo-800/text-indigo-300
TrackerStrip: bg-zinc-900/border-zinc-700
Font: Work Sans 400/500/600/700

---

=== T1: SYNAPTIC CORTEX (Neural Cyan) ===
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap')
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap')
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap')

Page bg: bg-[#060B14]          (neural black, blue undertone)
Panel bg: bg-[#0D1526]          (sidebar/header/nav)
Card bg: bg-[#111D30]           (session cards)
Elevated: bg-[#1A2D47]          (hover states)
Border: border-[#1E3050]        (ALL borders)
Active tab: text-[#00C8E8]      (neural cyan)
Primary button: bg-[#00C8E8]   text-[#060B14] font-medium
Send button: bg-[#00C8E8]       text-[#060B14]
TierBadge T1: bg-[#00C8E8]/10 border-[#00C8E8]/30 text-[#00C8E8]
TierBadge T2: bg-[#7C3AED]/10 border-[#7C3AED]/30 text-[#A78BFA]
TierBadge T3: bg-[#1A2D47] border-[#1E3050] text-[#647A91]
TrackerStrip: bg-[#0D1526] border-[#1E3050]
StatusDot active: bg-[#00C8E8] animate-pulse motion-reduce:animate-none
StatusDot online: bg-[#22C55E]
Input focus ring: focus:ring-[#00C8E8]/60 focus:border-[#00C8E8]
Active session badge: bg-[#00C8E8]/10 text-[#00C8E8] border-[#00C8E8]/30
"명령 접수됨" badge: bg-[#00C8E8]/10 text-[#00C8E8] border-[#00C8E8]/30
Heading font: 'Space Grotesk' font-semibold
Body font: 'Inter' font-normal
Mono font: 'JetBrains Mono'

A11y note: #647A91 (muted) on #111D30 = 3.80:1 — large text only, minimum text-sm (14px+)

---

=== T2: TERMINAL COMMAND (Amber on Black) ===
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap')

Page bg: bg-black              (#000000 — true terminal glass)
Panel bg: bg-[#0A0A0A]
Card bg: bg-[#111111]
Elevated: bg-[#1C1C1C]
Border: border-[#2A2A2A]
Active tab: text-[#FFB000]     (amber phosphor)
Primary button: bg-[#FFB000]  text-black font-medium
Send button: bg-[#FFB000]      text-black
TierBadge T1: bg-[#FFB000]/10 border-[#FFB000]/30 text-[#FFB000]
TierBadge T2: bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]
TierBadge T3: bg-[#1C1C1C] border-[#2A2A2A] text-[#808080]
TrackerStrip: bg-[#0A0A0A] border-[#2A2A2A]
StatusDot active: bg-[#FFB000] animate-pulse motion-reduce:animate-none
StatusDot online: bg-[#22C55E]
Input focus ring: focus:ring-[#FFB000]/60 focus:border-[#FFB000]
Active session badge: bg-[#FFB000]/10 text-[#FFB000] border-[#FFB000]/30
"명령 접수됨" badge: bg-[#FFB000]/10 text-[#FFB000] border-[#FFB000]/30
Session title / headers: uppercase tracking-wider (Terminal aesthetic)
All fonts → 'JetBrains Mono' (including headers and body — full terminal aesthetic)
Tab labels: uppercase 'JetBrains Mono' text-[10px] tracking-wider

---

=== T3: ARCTIC INTELLIGENCE (Fjord Blue / IBM Plex Sans) ===
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&display=swap')

Page bg: bg-[#08101A]
Panel bg: bg-[#0F1C2E]
Card bg: bg-[#152540]
Elevated: bg-[#1B3156]
Border: border-[#1D3A5C]
Active tab: text-[#60A5FA]     (fjord blue-400)
Primary button: bg-[#2563EB]  text-white
Send button: bg-[#2563EB]      text-white
TierBadge T1: bg-[#1E3A8A]/30 border-[#3B82F6]/40 text-[#93C5FD]
TierBadge T2: bg-[#1E1B4B]/30 border-[#6366F1]/40 text-[#A5B4FC]
TierBadge T3: bg-[#152540] border-[#1D3A5C] text-[#7EA3C4]
TrackerStrip: bg-[#0F1C2E] border-[#1D3A5C]
StatusDot active: bg-[#60A5FA] animate-pulse motion-reduce:animate-none
StatusDot online: bg-[#34D399]
Input focus ring: focus:ring-[#60A5FA]/60 focus:border-[#60A5FA]
Active session badge: bg-[#1E3A8A]/30 text-[#93C5FD] border-[#3B82F6]/40
Heading font: 'IBM Plex Sans' font-medium (300 weight for hero text)
Body font: 'IBM Plex Sans' font-light/normal
Mono font: 'IBM Plex Mono'
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap')
Character: Quiet authority. Clean Scandinavian restraint.

---

=== T4: NEON CITADEL (Magenta / Syne) ===
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap')

Page bg: bg-[#0A0012]
Panel bg: bg-[#120020]
Card bg: bg-[#1A0030]
Elevated: bg-[#230040]
Border: border-[#3D0070]
Active tab: text-[#E040FB]     (neon magenta)
Primary button: bg-[#9C27B0]  text-white
Send button: bg-[#9C27B0]      text-white
TierBadge T1: bg-[#E040FB]/10 border-[#E040FB]/30 text-[#E040FB]
TierBadge T2: bg-[#7C3AED]/10 border-[#7C3AED]/30 text-[#C084FC]
TierBadge T3: bg-[#1A0030] border-[#3D0070] text-[#8B5CF6]
TrackerStrip: bg-[#120020] border-[#3D0070]
StatusDot active: bg-[#E040FB] animate-pulse motion-reduce:animate-none shadow-[0_0_8px_rgba(224,64,251,0.6)]
StatusDot online: bg-[#22C55E]
Input focus ring: focus:ring-[#E040FB]/60 focus:border-[#E040FB]
Active session badge: bg-[#E040FB]/10 text-[#E040FB] border-[#E040FB]/30
Heading font: 'Syne' font-bold (700/800 for headers — condensed cyberpunk energy)
Body font: 'Syne' font-normal (400)
Mono font: JetBrains Mono

A11y note: On bg-[#0A0012]: text-[#8B5CF6] (violet) = 4.7:1 ✅. Use as minimum for muted labels.
NEVER use T4 muted colors at text-xs — minimum text-sm for border-area text.

---

=== T5: BIOLUMINESCENT DEEP (Teal / Instrument Sans) ===
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@300;400;500;600&display=swap')

Page bg: bg-[#020D0A]
Panel bg: bg-[#041510]
Card bg: bg-[#072019]
Elevated: bg-[#0A2E22]
Border: border-[#0F4030]
Active tab: text-[#2DD4BF]     (bioluminescent teal)
Primary button: bg-[#0D9488]  text-white
Send button: bg-[#0D9488]      text-white
TierBadge T1: bg-[#0D9488]/15 border-[#0D9488]/40 text-[#2DD4BF]
TierBadge T2: bg-[#065F46]/30 border-[#059669]/40 text-[#34D399]
TierBadge T3: bg-[#072019] border-[#0F4030] text-[#6EE7B7]
TrackerStrip: bg-[#041510] border-[#0F4030]
StatusDot active: bg-[#2DD4BF] animate-pulse motion-reduce:animate-none shadow-[0_0_6px_rgba(45,212,191,0.5)]
StatusDot online: bg-[#22C55E]
Input focus ring: focus:ring-[#2DD4BF]/60 focus:border-[#2DD4BF]
Active session badge: bg-[#0D9488]/15 text-[#2DD4BF] border-[#0D9488]/40
Heading font: 'Instrument Sans' font-semibold
Body font: 'Instrument Sans' font-normal
Mono font: JetBrains Mono
Character: Quiet organic depth. Abyssal-depth research station. NEXUS edges: stroke #0D9488 opacity 0.8.

A11y note: On bg-[#072019]: text-[#6EE7B7] = 8.2:1 ✅ AAA. text-[#2DD4BF] = 9.1:1 ✅ AAA.
```

---

## SECTION 9: QUICK REFERENCE

> **Essential mobile-specific rules at a glance. Keep open in a side window while working in Stitch.**

---

```
CORTHEX MOBILE — QUICK REFERENCE

=== VIEWPORT ===
Target: 390×844px (iPhone 15 Pro — primary)
Range: 375–430px width, portrait only
Min-width: none (unlike desktop web app)

=== LAYOUT ===
Hub + Chat screens: flex flex-col h-screen (no overflow-y on root)
Dashboard + NEXUS + More: flex flex-col h-screen
All scrollable content: flex-1 overflow-y-auto
Tab bar: fixed bottom-0 left-0 right-0 (positioned outside flex flow)

=== HEIGHTS ===
Header: h-14 (56px)   Exception: Chat screen h-12 (48px) — maximizes message area
Tab bar inner: h-14 (56px) + pb-[env(safe-area-inset-bottom)]
Session row: h-16 (64px) standard, h-[72px] active
TrackerStrip compact: h-12 (48px)
TrackerStrip expanded: h-48 (192px)
Input bar: h-14 (56px) + pb-[env(safe-area-inset-bottom)]
KPI cards: p-4 + text content auto
Agent health rows: h-14 (56px)

=== TOUCH TARGETS (NEVER SMALLER) ===
All interactive: min 44×44px (iOS) / 48×48dp (Android)
Tab bar items: flex-1 h-14 ≈ 97×56px ✅ MD3
Header icon buttons: w-11 h-11 (44px) ✅
Send button: w-11 h-11 (44px) ✅
TrackerStrip toggle: full-width h-12 (48px) ✅
Session rows: full-width h-16 (64px) ✅

=== COLORS (base theme) ===
Page:    bg-zinc-950 (#09090B)
Panel:   bg-zinc-900 (#18181B)
Elevated: bg-zinc-800 (#27272A)
Border:  border-zinc-700 (#3F3F46)   ← ALWAYS on bg-zinc-900 surfaces
Accent:  #4F46E5 (indigo-600)
Active:  text-indigo-400 (#818CF8)
Online:  bg-green-500 (#22C55E)
Warning: text-amber-500 (#F59E0B)
Error:   text-red-500 (#EF4444)
Offline: bg-zinc-600

=== TIER BADGES ===
T1: bg-indigo-950 border-indigo-800 text-indigo-300
T2: bg-violet-950 border-violet-800 text-violet-300
T3: bg-zinc-800 border-zinc-700 text-zinc-400
All: font-mono text-[10px] px-1.5 py-0.5 rounded

=== ANIMATIONS ===
ALL: include motion-reduce:animate-none (WCAG 2.3.3)
Color/opacity: duration-[150ms] (tab active, badge flash)
Layout/height: duration-[250ms] (TrackerStrip, padding changes)
Tailwind v4: duration-[250ms] NOT duration-250

=== SAFE AREA ===
BottomTabBar nav: pb-[env(safe-area-inset-bottom)]
ChatScreen InputBar wrapper: pb-[env(safe-area-inset-bottom)]
BottomSheet: pb-[calc(1.5rem+env(safe-area-inset-bottom))]
Content areas: no manual safe area (tab bar handles it)
@theme { --spacing-safe: env(safe-area-inset-bottom) } = OPTIONAL (pb-safe shorthand)

=== SSE ENDPOINT ===
URL: POST /api/workspace/hub/stream
Body: { message: string, sessionId?: string, agentId?: string }
Events:
  accepted → show "명령 접수됨" badge ≤50ms
  handoff  → add step to chain, auto-expand TrackerStrip
  complete → keep TrackerStrip expanded (WCAG 2.2.2)
  error    → show error state, keep TrackerStrip visible

=== ARIA RULES ===
Nav: <nav aria-label="주 메뉴">
Tabs: role="tablist" > role="tab" aria-selected={bool}
Main content: <main>
TrackerStrip: role="region" aria-live="off"   ← NOT role="status"
SR announcements: separate <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
Dialogs: role="dialog" aria-modal="true" aria-labelledby="..."
Chat log: role="log" aria-live="off"   ← override polite for SSE chat
Badge ARIA: aria-label on BUTTON, aria-hidden on badge SPAN

=== CRITICAL DON'TS ===
❌ Never @xyflow/react on mobile (use SVG static tree for NEXUS)
❌ Never role="status" on visual TrackerStrip div (SSE flood)
❌ Never auto-collapse TrackerStrip (WCAG 2.2.2 violation)
❌ Never border-zinc-800 on bg-zinc-900 surfaces (invisible)
❌ Never animate-pulse without motion-reduce:animate-none
❌ Never use Lucide MessageSquare for AGORA (use Scale — no chat bubbles)
❌ Never duration-250 (invalid Tailwind v4 — must be duration-[250ms])
❌ Never put "명령 접수됨" label as "저장됨" (Vision Principle 3: Zero-Delay Feedback)

=== FILE LOCATIONS ===
Mobile package: packages/mobile/src/
Screens: packages/mobile/src/screens/
Components: packages/mobile/src/components/
Stores: packages/mobile/src/stores/
Entry: packages/mobile/src/App.tsx (Capacitor root, BrowserRouter)
Routes: /hub → /hub/:id → /dashboard → /nexus → /more → /more/notifications
```

---

*End of Phase 5-2: CORTHEX Mobile App Stitch Prompts*
*Total sessions: 7 (Section 0 master + Sections 1–6 screens + Section 7 shared components)*
