# Phase 1-2: App Mobile Layout Research

**Date**: 2026-03-12
**Step**: Phase 1 — Research, Step 1-2
**Status**: Round 1 Draft
**Scope**: CORTHEX mobile app — native-like experience for Google Stitch generation. NOT a responsive version of the web dashboard. Separate design for mobile-first CEO/employee use.
**Output**: Mobile app reference analysis + TOP 3 layout options for CORTHEX mobile

---

## CORTHEX Mobile App Constraints Recap

| Constraint | Value |
|------------|-------|
| Generation target | Google Stitch (AI UI design → HTML/CSS/Tailwind/React export) |
| Users | CEO / regular employees (김대표 persona) |
| Platform | iOS + Android (cross-platform React) |
| Viewport | Mobile-first: 390–430px wide (portrait primary) |
| Navigation | Bottom tab bar + stack navigation (NOT sidebar) |
| Dark mode | First-class (professional tool, dark preferred) |
| Font | Work Sans (loaded via Google Fonts) |
| Accent | Indigo-600 `#4F46E5` |
| Touch targets | Min 44×44pt (iOS) / 48×48dp (Android Material 3) |
| Safe areas | Respect iOS notch (top) + home indicator (bottom) |
| `pb-safe` | Requires custom `@theme` in `index.css`: `--spacing-safe: env(safe-area-inset-bottom)` — NOT built into Tailwind CSS 4. All bottom-anchored elements use `pb-[env(safe-area-inset-bottom)]` |

### CORTHEX Mobile Feature Priority
| Priority | Feature | Notes |
|----------|---------|-------|
| P0 | Hub — Chat with AI team | Core use case. Always 1 tap from anywhere |
| P0 | Tracker — Live delegation chain | Visible during active AI execution |
| P1 | Dashboard — Cost + agent status | Daily check-in |
| P1 | Notifications | Push + in-app alerts |
| P1 | NEXUS — Org chart view | Read-only tree on mobile (no drag-edit) |
| P2 | AGORA — Debate view | Read results + consensus badge |
| P2 | Library — Knowledge search | Search + read documents |
| P2 | ARGOS — Schedule viewer | View schedules + run history |
| P3 | Trading, SNS, Files | Power features, mobile-light treatment |

### Google Stitch Capabilities & Limitations
| Capability | Status |
|------------|--------|
| HTML/CSS generation | ✅ Clean, functional |
| Tailwind CSS output | ✅ Supported |
| React/JSX export | ✅ Supported |
| Figma export | ✅ Standard mode only |
| Bottom tab navigation | ✅ Well-handled |
| Card-based layouts | ✅ Well-handled |
| Chat bubble interface | ✅ Well-handled |
| Complex canvas (ReactFlow) | ❌ Cannot generate |
| Multi-screen coherent flows | ⚠️ Degrades past 3 screens |
| Design system/component tokens | ❌ Not generated |
| Production-ready quality | ⚠️ Requires significant refinement |
| Monthly generation limit | 200–350 per mode |

**Stitch workflow**: Generate screens individually → refine in Figma → implement in React

---

## Part 1: Reference Products — 8 Analyzed

---

### 1. ChatGPT Mobile App (OpenAI)

**URL**: https://chatgpt.com (mobile web) / iOS App Store
**Source**: Direct observation — https://chatgpt.com (mobile web) / iOS App Store

**Layout Pattern**:
```
┌─────────────────────────────┐
│  Status bar (safe area)     │
├─────────────────────────────┤
│  [ChatGPT logo]  [Edit] [⊕] │  ← h-12 header
├─────────────────────────────┤
│                             │
│  Today                      │
│  ┌───────────────────────┐  │
│  │ Session 1 title...    │  │  ← conversation cells h-16
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Session 2 title...    │  │
│  └───────────────────────┘  │
│  Yesterday                  │
│  ┌───────────────────────┐  │
│  │ Session 3 title...    │  │
│  └───────────────────────┘  │
│                             │
│  [Pinned GPTs section]      │
├─────────────────────────────┤
│  Home │ Explore │ Library   │  ← bottom tab h-16
│  Home indicator safe area   │
└─────────────────────────────┘
```

**Navigation**: Bottom tab (3 items: Home, Explore, Library)
**Session list grouping**: Today / Yesterday / Previous 7 days / Previous 30 days

**Chat screen**:
```
┌─────────────────────────────┐
│  [← Back] ChatGPT  [...]   │  ← h-12 nav header
├─────────────────────────────┤
│                             │
│  ┌──────────────────────┐   │
│  │ AI bubble (gray)     │   │  ← AI messages left-aligned
│  └──────────────────────┘   │
│              ┌───────────┐  │
│              │ User msg  │  │  ← User messages right (indigo)
│              └───────────┘  │
├─────────────────────────────┤
│  [📎][input field...][🎤][→]│  ← h-14 input bar
│  Home indicator safe area   │
└─────────────────────────────┘
```

**Key UX Pattern**:
- Chat bubbles: user right (blue), AI left (gray/white bg)
- Voice input button always visible in input bar
- Session list date-grouping reduces cognitive load
- 3-tab navigation keeps thumb zone clear for primary chat action

**What works for CORTHEX**: Date-grouped session history → CORTHEX Hub session list. Voice input → future enhancement slot.

---

### 2. Gemini App (Google, Android 2026)

**URL**: https://gemini.google.com
**Source**: Android Gadget Hacks coverage (https://android.gadgethacks.com/news/google-gemini-android-app-gets-major-ui-overhaul/)

**Layout Pattern** (post-Feb 2026 redesign):
```
┌─────────────────────────────┐
│  ≡ (hamburger)  Gemini  [⊕]│  ← h-12 header
├─────────────────────────────┤
│                             │
│  ┌──────────────────────┐   │
│  │ [Deep Research]      │   │  ← feature shortcuts (cards)
│  │ [Composer]           │   │
│  └──────────────────────┘   │
│                             │
│  Continue conversation...   │
│  ┌──────────────────────┐   │
│  │ Recent chat 1        │   │
│  └──────────────────────┘   │
├─────────────────────────────┤
│  [input field...] [📎] [→]  │  ← input bar always visible
│  Home indicator             │
└─────────────────────────────┘

Hamburger drawer (slides from left):
┌──────────────────┐
│ [Search chats]   │
│ New chat  +      │
│ ─────────────    │
│ [Gem 1]          │
│ [Gem 2]          │
│ ─────────────    │
│ Session 1        │
│ Session 2 ...    │
└──────────────────┘
```

**Navigation**: Hamburger drawer (left) + input bar always visible on home
**Key change**: Dropped bottom tab → drawer navigation (mirrors ChatGPT)

**Key UX Pattern**:
- Input bar visible on HOME screen (not just inside a chat) = zero-tap to start chat
- Drawer shows last 15 chats + Gems (AI personas) = CORTHEX analogy: last 15 sessions + agent quick-select
- Consolidated bottom sheet for attachments (file + camera + Drive) = single action replaces 3 separate buttons

**What works for CORTHEX**: Always-visible input bar on Hub home. Drawer for secondary features. Attachment sheet pattern for knowledge reference in chat.

---

### 3. Slack Mobile App (2025 Redesign — iOS 26)

**URL**: https://slack.com
**Source**: Slack Design blog (https://slack.design/articles/re-designing-slack-on-mobile/)

**Layout Pattern**:
```
┌─────────────────────────────┐
│  [🔍 Search / workspace]    │  ← top search bar (Liquid Glass)
├─────────────────────────────┤
│                             │
│  PRIORITY CONVERSATIONS     │
│  ┌──────────────────────┐   │
│  │ 🔵 Channel 1 · 3m    │   │  ← bubbled to top (unread priority)
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │ Channel 2             │   │
│  └──────────────────────┘   │
│                             │
│  CUSTOM SECTIONS            │
│  ▶ Design (3)               │
│  ▶ Engineering              │
│  ─────────────────────      │
│  CHANNELS                   │
│  # general                  │
│                             │
├─────────────────────────────┤
│  Home │ DMs │ Activity │ ⊕  │  ← 3-tab + action (Liquid Glass)
│  Home indicator             │
└─────────────────────────────┘
```

**Navigation**: 3 bottom tabs (Home, DMs, Activity) + floating action button
**Section badges**: Collapsed section shows aggregate unread count badge

**Key UX Pattern**:
- Priority bubbling: most urgent items surface to top of Home
- Section collapse: less-used channels hidden behind collapsed section headers
- "Liquid Glass" effect: smooth, translucent material for nav elements
- Thumb zone: all primary actions within bottom 40% of screen

**What works for CORTHEX**:
- Priority bubbling = active AI sessions bubble to top of session list
- Section collapse = `운영` features collapsible in More tab
- Badge inheritance = collapsed section still shows notification count

---

### 4. Notion Mobile App (2025)

**URL**: https://notion.so/mobile
**Source**: Notion mobile features page (https://www.notion.com/mobile)

**Layout Pattern**:
```
┌─────────────────────────────┐
│  ← [workspace] [🔍] [⋮]   │  ← contextual nav header
├─────────────────────────────┤
│  [AI quick actions bar]     │  ← Notion AI shortcut strip
├─────────────────────────────┤
│                             │
│  FAVORITES                  │
│  📄 Page 1                  │
│  📄 Page 2                  │
│  ─────────────              │
│  TEAMSPACES                 │
│  ▶ Engineering              │
│  ▶ Marketing                │
│  ─────────────              │
│  PRIVATE                    │
│  📄 My notes                │
│                             │
├─────────────────────────────┤
│  Home │ Search │ Create │ ⊕ │  ← bottom tab
│  Home indicator             │
└─────────────────────────────┘
```

**Navigation**: Bottom tab (Home, Search, Inbox, Profile)
**Offline**: Pages marked "Available Offline" cached for use without connectivity

**Key UX Pattern**:
- Full feature parity with desktop (databases, forms, search all work on mobile)
- Section labels with collapse (FAVORITES / TEAMSPACES / PRIVATE) = minimal cognitive load despite many items
- AI integration: one-tap transcription from any screen (even locked)

**What works for CORTHEX**: Full-feature mobile parity (not a cut-down version) = CORTHEX mobile should have Hub, Dashboard, NEXUS read-only, AGORA, Notifications — not just a subset.

---

### 5. Microsoft Teams Mobile (2025)

**URL**: https://teams.microsoft.com
**Source**: Teams May 2025 Updates (https://techcommunity.microsoft.com/blog/microsoftteamsblog/)

**Layout Pattern**:
```
┌─────────────────────────────┐
│  [≡] Teams  [🔍] [📷]      │  ← h-12 header
├─────────────────────────────┤
│  RECENT                     │
│  ┌──────────────────────┐   │
│  │ 👤 John: OK sounds.. │   │  ← conversation cells
│  └──────────────────────┘   │
│  PINNED                     │
│  ┌──────────────────────┐   │
│  │ # General             │   │
│  └──────────────────────┘   │
├─────────────────────────────┤
│  Chat│Teams│Calendar│Files  │  ← 4-tab bottom
│  Home indicator             │
└─────────────────────────────┘
```

**Navigation**: 4 bottom tabs (Chat, Teams, Calendar, Files) + optional 5th
**Agent integration**: @mention agents from within conversation; no separate screen needed

**Key UX Pattern**:
- Agent-in-context: AI agents accessible via @mention in any chat, no app switch
- 4-tab navigation keeps all major functions ≤1 tap away
- Minimum width: 320px

**What works for CORTHEX**: Agent @mention within chat = CORTHEX agent selection. 4-tab model gives enough space for Hub + Dashboard + NEXUS + More.

---

### 6. Material Design 3 — Navigation Specs

**URL**: https://m3.material.io/components/navigation-bar/specs
**Source**: Google Material Design documentation

**Navigation Bar Specs**:
```
┌─────────────────────────────────────────────────────┐
│  ┌──────────┬──────────┬──────────┬──────────┐      │
│  │  [icon]  │  [icon]  │  [icon]  │  [icon]  │  h-14│
│  │  Label   │  Label   │  Label   │  Label   │      │
│  └──────────┴──────────┴──────────┴──────────┘      │
└─────────────────────────────────────────────────────┘

Per tab width = (screen width) ÷ (number of tabs)
Min tab width: 80dp
Max tab width: 168dp
Icon size: 24×24dp
Touch target: 48×48dp minimum
Bar height: 56–80dp (flexible per Material 3 Expressive, May 2025)
```

**Label rules**:
- 3 tabs: all show icons + labels
- 4 tabs: active = icon + label; inactive = icon only (space saving)
- 5 tabs: active = icon + label; inactive = icon only

**Active state**: Filled icon + indicator pill behind icon + full label

**What works for CORTHEX**: 4-tab design with active label + inactive icon-only = maximum info for minimum space. CORTHEX 4-tab: Hub (🔗) | Dashboard (📈) | NEXUS (🔍) | More (⋯)

---

### 7. Apple HIG 2025 — Tab Bar Specs

**URL**: https://developer.apple.com/design/human-interface-guidelines/tab-bars
**Source**: Apple Developer Documentation

**Tab Bar Specs**:
```
┌────────────────────────────────────────────┐
│  [icon] │  [icon] │  [icon] │  [icon]  │  h = 83pt (with safe area)
│  Label  │         │  Label  │  Label   │  Tab height = 49pt
│         │  ●      │         │          │  badge dot = 8pt
└────────────────────────────────────────────┘
```

| Metric | Value |
|--------|-------|
| Touch target min | 44×44pt |
| Tab bar height | 49pt (+ safe area inset ~34pt) |
| Icon size | 25×25pt (2x = 50×50px) |
| Max recommended tabs | 5 |
| Badge: dot (no count) | 8pt diameter |
| Badge: with count | auto-width pill |

**Safe areas**:
- Top: Status bar height + optional dynamic island padding
- Bottom: 34pt (iPhone X+), 0pt (iPhone SE/older)

**What works for CORTHEX**: Notification badge dot on Hub tab when AI handoff completes. 4-tab bar with safe area insets.

---

### 8. Google Stitch Design Tool

**URL**: https://stitch.withgoogle.com
**Source**: Google Developers Blog + Index.dev review

**What Stitch generates well** (confirmed):
```
STRONG:
✅ Bottom tab navigation shells
✅ Card list / feed screens
✅ Chat bubble interfaces (left/right bubbles, avatars)
✅ Form screens (settings, input fields)
✅ Notification list screens
✅ Simple dashboard with KPI cards
✅ Empty states with CTAs
✅ Dark/light mode variants
✅ Modal / bottom sheets

WEAK / NOT SUPPORTED:
❌ Canvas-based interactive editors (ReactFlow NEXUS)
❌ Multi-screen coherent design system (tokens, variants)
❌ Real-time streaming UI (SSE/WebSocket patterns)
❌ Complex data tables with sorting/filtering
❌ Drag-and-drop interfaces
```

**Stitch-to-production workflow**:
1. Generate screen prompt → Stitch outputs multiple variants
2. Select best → Export to Figma (Standard mode only)
3. Refine in Figma (component tokens, spacing, typography)
4. Developer implements in React

**Screen count strategy**: Generate 1-2 screens per Stitch session for coherence. Do NOT attempt 10-screen flow in one session.

---

## Part 2: Cross-Reference Analysis

### Navigation Pattern Comparison

| App | Primary nav | Tab count | Secondary nav |
|-----|------------|-----------|---------------|
| ChatGPT | Bottom tabs | 3 | None |
| Gemini | Drawer | 0 tabs | Feature cards on home |
| Slack | Bottom tabs | 3 | Drawer (workspaces) |
| Notion | Bottom tabs | 4 | — |
| Teams | Bottom tabs | 4–5 | — |
| **CORTHEX target** | Bottom tabs | **4** | Drawer (More) |

**Conclusion**: 4-tab bottom navigation is the dominant enterprise mobile pattern in 2025. Hub (primary) + 2-3 secondary tabs + More tab for remaining features.

### Mobile Chat Pattern Comparison

| App | Bubble alignment | Input position | Tracker/status |
|-----|-----------------|---------------|----------------|
| ChatGPT | User right (blue), AI left (gray) | Fixed bottom | — |
| Gemini | User right, AI left | Always visible on home | — |
| Claude.ai | User right, AI left | Fixed bottom | — |
| **CORTHEX Hub** | User right (indigo), AI left (zinc) | Fixed bottom | **Tracker overlay above input** |

**Unique CORTHEX mobile feature**: Tracker (live delegation chain) must be visible during AI execution. Proposed: expandable strip above input bar showing current agent (`비서실장 → CIO (D2) ●`) that expands to full panel on tap.

### Touch Target Verification

| Element | Min required | CORTHEX spec |
|---------|-------------|-------------|
| Tab bar items | 44pt (iOS) / 48dp (Android) | Tab width ~97pt (390÷4) ✅ |
| Chat send button | 44×44pt | 48×48pt (round button) ✅ |
| Session list rows | 44pt height | 64pt (h-16) ✅ |
| Tracker step rows | 44pt height | 52pt (h-13) ✅ |
| Notification items | 44pt height | 64pt ✅ |
| NEXUS node tap target | 44×44pt | Node min: 80×64pt ✅ |

---

## Part 3: TOP 3 Layout Options for CORTHEX Mobile

---

### Option A: 4-Tab Command Center (Hub-Primary)

**Inspired by**: ChatGPT mobile (session list), Slack (priority bubbling), Teams (4-tab model)

**Core philosophy**: Hub is tab 1 — always 1 tap from anywhere. Tracker is a persistent strip above the input bar during active AI runs. 4 tabs cover all P0/P1 features. P2/P3 features in the More tab.

```
SCREEN FLOW DIAGRAM:

App Launch → Hub (Tab 1)
              ├── [+ New Session] → Chat Screen
              ├── Tap session → Chat Screen
              │    ├── Chat bubbles (scroll)
              │    ├── Tracker strip (above input, expands on tap)
              │    └── [Input bar + send + attach]
              ├── Dashboard (Tab 2) → KPI cards + agent status
              ├── NEXUS (Tab 3) → Org tree (read-only) → Node detail
              └── More (Tab 4) → Grid of remaining features
                   ├── AGORA → Debate list → Debate detail
                   ├── Library → Search → Document
                   ├── ARGOS → Schedule list → Run history
                   └── Notifications → Notification list

HOME SCREEN (Hub, Tab 1):
┌─────────────────────────────┐
│  [≡ 사이드] CORTHEX    [⊕] │  ← h-14 header (safe area top)
├─────────────────────────────┤
│  [🔍 세션 검색...]          │  ← search bar h-12
├─────────────────────────────┤
│  ACTIVE                     │
│  ┌──────────────────────┐   │
│  │ ● 삼성전자 분석       │   │  ← active session (pulsing dot)
│  │  비서실장 실행 중 32s │   │  h-18 (tall — shows agent status)
│  └──────────────────────┘   │
│  TODAY                      │
│  ┌──────────────────────┐   │
│  │ 테슬라 리포트         │   │  h-16 standard session row
│  └──────────────────────┘   │
│  YESTERDAY                  │
│  ...                        │
├─────────────────────────────┤
│  🔗허브 │📈대시 │🔍NEXUS│⋯ │  ← 4-tab bar h-14 (+ safe area)
│  [home indicator]           │
└─────────────────────────────┘

CHAT SCREEN (active session):
┌─────────────────────────────┐
│  [← 뒤로] 삼성전자 분석    │  ← nav header h-12
├─────────────────────────────┤
│                             │
│  ┌──────────────────────┐   │
│  │ 비서실장 (T1)        │   │  AI bubble — left-aligned
│  │ 삼성전자를 분석하겠  │   │  bg-zinc-800, border-l-2 border-indigo-500
│  │ 습니다. CIO에게 위임 │   │  text-zinc-100 text-sm
│  └──────────────────────┘   │
│              ┌───────────┐  │
│              │ 삼성전자  │  │  User bubble — right-aligned
│              │ 분석해줘  │  │  bg-indigo-600, text-white
│              └───────────┘  │
│                             │
├─────────────────────────────┤
│  ╔══════════════════════╗   │
│  ║ ● 비서실장 → CIO(D2) ║   │  ← Tracker strip h-12
│  ║   → 전문가(D3) ●     ║   │  bg-zinc-900, expandable
│  ╚══════════════════════╝   │
├─────────────────────────────┤
│  [📎][   명령을 입력...][→] │  ← input bar h-14
│  [home indicator]           │
└─────────────────────────────┘

Tracker strip EXPANDED (tap on strip):
┌─────────────────────────────┐
│  [← 뒤로] 삼성전자 분석    │
├─────────────────────────────┤
│  [chat content, blurred]    │
├─────────────────────────────┤
│  ╔══════════════════════╗   │
│  ║ LIVE CHAIN  [$0.004] ║   │  expanded to h-48
│  ║ ✓ 비서실장 (D1) 12s  ║   │  slide up from bottom
│  ║ ✓ CIO (D2) 8s        ║   │  bg-zinc-900
│  ║ ● 전문가 (D3) 34s ●  ║   │
│  ║ [비용: $0.0042 · 토큰:1240] ║
│  ╚══════════════════════╝   │
├─────────────────────────────┤
│  [📎][   명령을 입력...][→] │
│  [home indicator]           │
└─────────────────────────────┘

Tailwind CSS (Stitch-compatible):
```tsx
// Active session pulsing indicator (Hub home screen session list row)
<span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse motion-reduce:animate-none" />

// Bottom tab bar — 4 tabs
// pb-[env(safe-area-inset-bottom)] requires: @theme { --spacing-safe: env(safe-area-inset-bottom) } in index.css
<div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 pb-[env(safe-area-inset-bottom)]">
  <div role="tablist" aria-label="Main navigation" className="flex h-14">
    {tabs.map(tab => (
      <button
        key={tab.id}
        role="tab"
        className={cn(
          "flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px]",
          "transition-colors duration-150 motion-reduce:transition-none",
          active === tab.id ? "text-indigo-400" : "text-zinc-500"
        )}
        aria-label={tab.label}
        aria-selected={active === tab.id}
      >
        <span className="text-xl">{tab.emoji}</span>
        {active === tab.id && (
          <span className="text-[10px] font-medium">{tab.label}</span>
        )}
      </button>
    ))}
  </div>
</div>

// Tracker strip above input
<div
  className={cn(
    "bg-zinc-900 border-t border-zinc-800 transition-[height] duration-300 motion-reduce:transition-none",
    isTrackerExpanded ? "h-48" : "h-12"
  )}
  role="status"
  aria-atomic="false"
  aria-label="Agent delegation tracker"
>
  {/* Compact strip — role="status" implies aria-live="polite"; aria-atomic="false" announces only changed step */}
  {!isTrackerExpanded && (
    <button onClick={() => setExpanded(true)} className="w-full h-12 flex items-center px-4 gap-2">
      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse motion-reduce:animate-none" />
      <span className="text-xs text-zinc-300 font-mono">비서실장 → CIO (D2) → 전문가 (D3) ●</span>
    </button>
  )}
  {/* Expanded chain */}
  {isTrackerExpanded && <TrackerChainView />}
</div>
```

**How it handles key CORTHEX features**:

| Feature | Mobile solution |
|---------|----------------|
| **AI chat (Hub)** | Tab 1. Full-screen chat with AI bubble stream. Session list as home |
| **Tracker** | Expandable strip (h-12 compact → h-48 expanded) above input bar. `role="status" aria-atomic="false"` announces only changed step |
| **NEXUS org chart** | Tab 3. Read-only zoomable tree. Tap node → bottom sheet detail. No drag-edit |
| **Dashboard** | Tab 2. 4 KPI cards (2×2 grid) + cost bar + agent status list |
| **Notifications** | Badge on More tab. Full list in More → Notifications |
| **Admin functions** | Not on mobile (Admin SPA is desktop-only) |

**Stitch generation plan**:
```
Screen 1: Hub session list (home screen with tabs)
Screen 2: Chat screen (with tracker strip collapsed)
Screen 3: Tracker strip expanded (chat blurred)
Screen 4: Dashboard screen (KPI cards + charts)
Screen 5: NEXUS tree view (simplified org chart)
Screen 6: More tab (feature grid)
```

**Breakpoint**: 390–430px width (portrait). No landscape layout defined.

**Pros for CORTHEX**:
- Hub is always 1 tap from anywhere — matches primary use case (김대표 commands the AI team)
- Tracker strip above input = always visible during execution without hiding chat
- 4-tab model gives enough primary destinations without overcrowding
- Session list date grouping (Active / Today / Yesterday) = clean, ChatGPT-validated pattern
- Stitch can generate all 6 planned screens confidently

**Cons for CORTHEX**:
- Tracker strip at h-12 shows ~1 line of chain text (may be truncated for deep D4/D5 chains)
- NEXUS is read-only on mobile — admin needing to edit org chart must use desktop
- More tab is a "junk drawer" — 10+ features in a grid may feel overwhelming
- Agent status dot (pulsing indigo on active session) requires CSS animation — `motion-reduce:transition-none` essential

---

### Option B: Hub-First Drawer Navigation (Gemini-Inspired)

**Inspired by**: Gemini drawer pattern, Slack priority bubbling, always-visible input bar

**Core philosophy**: Hub IS the app. Input bar visible on every screen. Drawer replaces tab bar for navigation. Sessions scroll behind the input. One-gesture access to any feature.

```
SCREEN FLOW DIAGRAM:

App Launch → Hub Home (input bar always visible)
              ├── Type message → send → Chat screen (same page, sessions scroll up)
              ├── [≡ drawer] → Navigation drawer
              │    ├── Sessions list (last 15 + search)
              │    ├── ─ 업무 ──────────────
              │    ├── 📈 대시보드
              │    ├── 💬 AGORA
              │    ├── 🔍 NEXUS
              │    ├── 📄 라이브러리
              │    ├── 🗣️ ARGOS
              │    ├── ─ 운영 ──────────────
              │    └── [+12 more]
              └── Notification icon (top-right, badge)

HUB HOME SCREEN:
┌─────────────────────────────┐
│  ≡ CORTHEX    [⊕] [🔔 2]  │  ← h-14 header (hamburger + notifications)
├─────────────────────────────┤
│  ACTIVE                     │
│  ┌──────────────────────┐   │
│  │ ● 삼성전자 분석       │   │  active session card (prominent)
│  │  비서실장 → CIO ●     │   │  shows live chain status
│  └──────────────────────┘   │
│  TODAY                      │
│  ┌──────────────────────┐   │
│  │ 테슬라 리포트         │   │  standard session rows
│  └──────────────────────┘   │
│                             │
│  [+ 빠른 기능들]             │
│  [📈 대시보드] [🔍 NEXUS]  │  ← shortcut cards (2-col grid)
│  [💬 AGORA]  [📄 라이브러리]│
│                             │
├─────────────────────────────┤
│  [📎][  AI 팀에게 명령...][→]│  ← input bar ALWAYS here (h-14)
│  [home indicator safe area] │
└─────────────────────────────┘

NAVIGATION DRAWER (from ≡):
┌──────────────────────────────┐
│  CORTHEX                  ✕ │
│  [🔍 세션 검색...]           │
│  + 새 세션                   │
│  ─────────────────────────   │
│  📈 대시보드                  │
│  💬 AGORA                    │
│  🔍 NEXUS                    │
│  📄 라이브러리                │
│  🗣️ ARGOS                    │
│  ─────────────────────────   │
│  운영 ▼ (collapsed, 12 items)│
│  ─────────────────────────   │
│  ⚙️ 설정                     │
└──────────────────────────────┘

Tailwind CSS (Stitch-compatible):
```tsx
// Always-visible input bar
// pb-[env(safe-area-inset-bottom)] requires: @theme { --spacing-safe: env(safe-area-inset-bottom) } in index.css
<div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 pb-[env(safe-area-inset-bottom)]">
  {/* Tracker strip (conditionally visible above input) */}
  {/* role="status" implies aria-live="polite"; aria-atomic="false" announces only changed step */}
  {hasActiveHandoff && (
    <div
      className="h-12 flex items-center px-4 gap-2 border-b border-zinc-800"
      role="status"
      aria-atomic="false"
      aria-label="Agent chain status"
    >
      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse motion-reduce:animate-none" />
      <span className="text-xs font-mono text-zinc-300 truncate">{trackerSummary}</span>
    </div>
  )}
  <div className="flex items-center h-14 px-3 gap-2">
    <button aria-label="Attach file" className="w-11 h-11 flex items-center justify-center text-zinc-400">
      <PaperclipIcon className="w-5 h-5" />
    </button>
    <input
      type="text"
      placeholder="AI 팀에게 명령..."
      className="flex-1 h-10 bg-zinc-800 rounded-full px-4 text-sm text-zinc-100 placeholder:text-zinc-500"
    />
    <button
      aria-label="Send command"
      className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center"
    >
      <SendIcon className="w-5 h-5 text-white" />
    </button>
  </div>
</div>

// Navigation drawer overlay — slides in from left, 250ms ease-in-out
{drawerOpen && (
  <div
    className="fixed inset-0 z-50"
    role="dialog"
    aria-label="Navigation"
    aria-modal="true"
  >
    <div
      className="absolute inset-0 bg-black/50 transition-opacity duration-250 motion-reduce:transition-none"
      onClick={() => setDrawerOpen(false)}
    />
    <div className={cn(
      "absolute left-0 top-0 bottom-0 w-72 bg-zinc-900 overflow-y-auto",
      "transition-transform duration-250 ease-in-out motion-reduce:transition-none",
      drawerOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Drawer content */}
    </div>
  </div>
)}
```

**How it handles key CORTHEX features**:

| Feature | Mobile solution |
|---------|----------------|
| **AI chat (Hub)** | Input bar always visible. Send from any screen. Chat history scrolls on main canvas |
| **Tracker** | Compact strip appears ABOVE input bar when `hasActiveHandoff=true`. Always 1 line summary. Tap → full screen overlay |
| **NEXUS** | Via drawer → dedicated screen. Read-only tree. Pinch-zoom |
| **Dashboard** | Via drawer → dedicated screen |
| **Notifications** | Bell icon in header (top-right) with badge. Tap → notification sheet slides up |
| **Feature discovery** | Shortcut cards (2×2 grid) on Hub home for top 4 P1 features |

**Stitch generation plan**:
```
Screen 1: Hub home (input bar + sessions + shortcut cards)
Screen 2: Chat screen (messages + tracker strip + input bar)
Screen 3: Drawer open state
Screen 4: Dashboard screen (via drawer)
Screen 5: NEXUS tree screen (via drawer)
Screen 6: Notification sheet (bottom sheet overlay)
```

**Pros for CORTHEX**:
- Input bar always visible = reinforces "this is a command tool" — literal product metaphor
- Drawer can hold all 27+ features without tab bar clutter
- `운영` section collapsible in drawer (same pattern as Step 1-2 desktop Option B)
- Hub home with shortcut cards teaches new users about secondary features organically
- Active session card shows live tracker summary on home = ambient awareness

**Cons for CORTHEX**:
- Drawer navigation is less immediately intuitive than tabs for non-technical users (김대표)
- No persistent visual cue for which section you're in (no active tab indicator)
- Hamburger menus require 2 taps to reach any feature (open drawer → tap item)
- More implementation complexity than Option A (drawer state + overlay + animated content)

---

### Option C: Adaptive 5-Tab with Smart Reordering

**Inspired by**: Material Design 3 Expressive navigation, Slack priority bubbling, iOS dynamic islands

**Core philosophy**: 5 fixed tabs cover all P0/P1 features (Hub, Dashboard, NEXUS, Library, Notifications). No "More" junk drawer for primary features. P2/P3 accessible via Hub header menu. Badge-driven priority surfacing makes the inactive tabs informative, not dead zones.

```
SCREEN FLOW DIAGRAM:

5 Tabs: 🔗Hub │ 📈대시 │ 🔍NEXUS │ 📄라이브러리 │ 🔔알림

Hub (Tab 1):
├── Session list (home) → Chat screen
│    ├── AI chat + Tracker strip
│    └── [header: ⋯ → AGORA / ARGOS / Trading / Files / Settings]
Dashboard (Tab 2):
├── KPI cards + cost bar + agent health list
NEXUS (Tab 3):
├── Org tree read-only → node detail bottom sheet
Library (Tab 4):
├── Search bar + document grid → document view
Notifications (Tab 5, badge):
├── Notification list → detail

HUB HOME SCREEN (active tab = Hub):
┌─────────────────────────────┐
│  CORTHEX        [⋯ 더보기] │  ← h-14 header
├─────────────────────────────┤
│  [🔍 세션 검색...]          │
├─────────────────────────────┤
│  ACTIVE (1)                 │
│  ┌──────────────────────┐   │
│  │ ● 삼성전자 분석       │   │  ← active session bubble UP
│  │  비서실장 → CIO ●     │   │
│  └──────────────────────┘   │
│  TODAY                      │
│  ┌──────────────────────┐   │
│  │ 테슬라 리포트 ✓       │   │  completed (checkmark)
│  └──────────────────────┘   │
├─────────────────────────────┤
│  🔗허브 │📈대시│🔍NEX│📄라이│🔔3│  ← 5-tab h-14
│  [home indicator]           │
└─────────────────────────────┘

DASHBOARD SCREEN (Tab 2):
┌─────────────────────────────┐
│  대시보드           [📅]   │  ← h-14 header
├─────────────────────────────┤
│  ┌────────┐  ┌────────┐     │
│  │총비용  │  │세션수  │     │  2×2 KPI cards
│  │$12.40  │  │  42    │     │
│  └────────┘  └────────┘     │
│  ┌────────┐  ┌────────┐     │
│  │에이전트│  │오류율  │     │
│  │8/8 ●  │  │ 0%     │     │
│  └────────┘  └────────┘     │
│  ─────────────────────      │
│  비용 현황                  │
│  ████████░░ 78%  ⚠️ $12.40 │  ← cost bar (amber at 70%+)
│  ─────────────────────      │
│  에이전트 상태               │
│  ● 비서실장  online          │
│  ● CIO       online          │
│  ○ 전문가    idle            │
├─────────────────────────────┤
│  🔗│📈│🔍│📄│🔔3            │
└─────────────────────────────┘

NEXUS SCREEN (Tab 3 — read-only):
┌─────────────────────────────┐
│  조직도                [🔍] │  ← h-14 header
├─────────────────────────────┤
│                             │
│  [비서실장] (T1)             │  ← org tree nodes
│       │                     │
│  ┌────┴────┐                │
│  │CTO (T1) │               │
│  └──┬──────┘                │
│     │                       │
│  [개발자1]  [개발자2]         │  pinch-to-zoom
│                             │
│  [tap node → bottom sheet]  │
├─────────────────────────────┤
│  🔗│📈│🔍│📄│🔔3            │
└─────────────────────────────┘

Tailwind CSS (Stitch-compatible):
```tsx
// 5-tab bar with notification badge
// pb-[env(safe-area-inset-bottom)] requires: @theme { --spacing-safe: env(safe-area-inset-bottom) } in index.css
<nav
  aria-label="Main navigation"
  className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 pb-[env(safe-area-inset-bottom)]"
>
  <div role="tablist" className="flex h-14">
    {[
      { id: 'hub', emoji: '🔗', label: '허브' },
      { id: 'dashboard', emoji: '📈', label: '대시보드' },
      { id: 'nexus', emoji: '🔍', label: 'NEXUS' },
      { id: 'library', emoji: '📄', label: '라이브러리' },
      { id: 'notifications', emoji: '🔔', label: '알림', badge: 3 },
    ].map(tab => (
      <button
        key={tab.id}
        aria-label={tab.label}
        aria-selected={activeTab === tab.id}
        role="tab"
        className="relative flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px]"
      >
        <div className="relative">
          <span className={cn(
            "text-xl transition-transform duration-150 motion-reduce:transition-none",
            activeTab === tab.id && "scale-110"
          )}>
            {tab.emoji}
          </span>
          {tab.badge && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] h-[14px] flex items-center justify-center">
              {tab.badge}
            </span>
          )}
        </div>
        <span className={cn(
          "text-[10px] transition-colors duration-150 motion-reduce:transition-none",
          activeTab === tab.id ? "text-indigo-400 font-medium" : "text-zinc-500"
        )}>
          {activeTab === tab.id ? tab.label : ''}
        </span>
      </button>
    ))}
  </div>
</nav>
```

**How it handles key CORTHEX features**:

| Feature | Mobile solution |
|---------|----------------|
| **AI chat (Hub)** | Tab 1 always. Chat from session list or directly. Active session bubbles to top |
| **Tracker** | Expandable strip above input bar — identical spec to Option A (see code below) |
| **NEXUS** | Dedicated Tab 3 — read-only org tree. Promotes discoverability vs. hiding in More or Drawer |
| **Library** | Dedicated Tab 4 — promotes knowledge management as first-class feature |
| **Notifications** | Tab 5 with badge count — most visible notification pattern in mobile |
| **P2/P3 features** | Hub header `⋯` → AGORA, ARGOS, Trading, Files, Settings list |

**Option C Tracker strip code** (identical to Option A spec — explicit for completeness):
```tsx
// Option C Tracker — h-12 compact / h-48 expanded, same as Option A
<div
  className={cn(
    "bg-zinc-900 border-t border-zinc-800 transition-[height] duration-300 motion-reduce:transition-none",
    isTrackerExpanded ? "h-48" : "h-12"
  )}
  role="status"
  aria-atomic="false"
  aria-label="Agent delegation tracker"
>
  {!isTrackerExpanded && (
    <button onClick={() => setExpanded(true)} className="w-full h-12 flex items-center px-4 gap-2">
      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse motion-reduce:animate-none" />
      <span className="text-xs text-zinc-300 font-mono">비서실장 → CIO (D2) → 전문가 (D3) ●</span>
    </button>
  )}
  {isTrackerExpanded && <TrackerChainView />}
</div>
```

**Stitch generation plan**:
```
Screen 1: Hub home (5-tab + session list)
Screen 2: Chat screen (bubbles + tracker strip)
Screen 3: Dashboard (KPI cards + cost bar + agent list)
Screen 4: NEXUS tree (org chart read-only)
Screen 5: Library (search + document grid)
Screen 6: Notifications tab (list with badges)
```

**Pros for CORTHEX**:
- All P0/P1 features in direct tabs — maximum discoverability, no junk drawer
- Notification badge on dedicated tab = most prominent placement possible
- NEXUS as a dedicated tab promotes org chart as core feature (product differentiation)
- Library as dedicated tab positions knowledge management as primary capability
- Dashboard tab = daily check-in screen naturally prominent

**Cons for CORTHEX**:
- 5 tabs is Material Design 3's maximum — no room to add features without restructuring
- ⚠️ At 390px width, each tab = 78px — 2dp below MD3 minimum 80dp tab width. At 393px (iPhone 15) = 78.6px, still below spec. For full MD3 compliance, limit Option C to devices ≥430px (430÷5=86px) or accept this minor deviation. Test on device.
- P2/P3 features accessible only via Hub header `⋯` — AGORA/ARGOS less discoverable than in Option A's More tab
- Library as a tab may be underutilized by 김대표 who primarily uses Hub → "dead tab" perception

---

## Part 4: Recommendation Summary

| Criterion | Option A (4-Tab Command) | Option B (Hub-First Drawer) | Option C (5-Tab Adaptive) |
|-----------|--------------------------|------------------------------|---------------------------|
| Hub always 1 tap away | ✅ Tab 1 | ✅ Always-visible input | ✅ Tab 1 |
| Tracker visibility during AI run | ✅ Strip above input | ✅ Strip above input | ✅ Strip above input |
| Feature discoverability | ✅ 4 tabs + More grid | ⚠️ 2 taps via drawer | ✅✅ 5 dedicated tabs |
| Notification prominence | ⚠️ Badge on More tab | ⚠️ Badge on header bell | ✅ Dedicated tab 5 |
| Kim CEO mental model | ✅ Clear (tabs = sections) | ⚠️ Drawer less intuitive | ✅ Clear but 5 tabs = busy |
| Stitch generation ease | ✅ 6 clear screens | ✅ 6 clear screens | ✅ 6 clear screens |
| NEXUS discoverability | ✅ Tab 3 | ⚠️ Via drawer | ✅ Tab 3 |
| P2/P3 feature access | ✅ More tab grid | ✅ Drawer (collapsible 운영) | ⚠️ Only via Hub header ⋯ |
| Implementation complexity | Low | Medium | Low |
| WCAG touch targets | ✅ All ≥44pt | ✅ All ≥44pt | ✅ All ≥44pt |
| ARIA landmarks | ✅ Defined in code | ✅ Defined in code | ✅ Defined in code |
| motion-reduce | ✅ All transitions | ✅ All transitions | ✅ All transitions |

**Research conclusion**: Option A (4-Tab Command Center) is recommended for CORTHEX's primary persona (김대표, non-developer CEO). Tabs are the most learnable mobile navigation pattern, 4 tabs is the sweet spot for enterprise apps, and the Hub session list home screen maps directly to the "command center" mental model. The Tracker strip above input bar is a uniquely CORTHEX pattern that no reference product has — it surfaces the product's core differentiator (watching the AI team work) in the most prominent mobile position. Option C is the better choice if NEXUS and Library need maximum discoverability. Option B is the boldest but requires the most UX investment.

---

## Sources

| Product | URL |
|---------|-----|
| ChatGPT Mobile (direct observation) | https://chatgpt.com |
| Gemini Android UI Overhaul | https://android.gadgethacks.com/news/google-gemini-android-app-gets-major-ui-overhaul/ |
| Slack Mobile Redesign | https://slack.design/articles/re-designing-slack-on-mobile/ |
| Notion Mobile | https://www.notion.com/mobile |
| Microsoft Teams Mobile Updates | https://techcommunity.microsoft.com/blog/microsoftteamsblog/ |
| Material Design 3 Navigation Bar | https://m3.material.io/components/navigation-bar/specs |
| Apple HIG Tab Bars | https://developer.apple.com/design/human-interface-guidelines/tab-bars |
| Google Stitch (direct) | https://stitch.withgoogle.com |
| Google Stitch Review | https://www.index.dev/blog/google-stitch-ai-review-for-ui-designers/ |
| Touch Target Sizes | https://blog.logrocket.com/ux-design/all-accessible-tap-target-sizes/ |
| Mobile Dashboard Design | https://www.anoda.mobi/ux-blog/effective-mobile-dashboard-design-tips |
| Org Chart on Mobile | https://blog.balkan.app/how-to-add-an-organizational-chart-to-a-mobile-application |
| Mobile Navigation Patterns 2025 | https://www.ramotion.com/blog/mobile-app-navigation-patterns/ |

---

*Document: Phase 1-2 App Mobile Layout Research*
*Round 2 — 10 issues fixed*
*Issues fixed: role="tablist"/role="tab" (Option A+C), h-10→h-12 (Option B Tracker), pb-safe documented + replaced, fabricated URLs removed (developers.openai.com, bricxlabs, almcorp, slack-ios26), aria-atomic="false" + removed redundant aria-live, animate-pulse motion-reduce (Option A), Option C Tracker code block added, MD3 78px warning added, drawer slide animation added*
