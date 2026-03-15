# CORTHEX App — Mobile Layout Research
**Phase:** 1 — Research
**Date:** 2026-03-15
**Researcher:** UXUI Writer Agent
**Target:** React + Tailwind CSS app wrapped in Capacitor (NOT React Native, NOT responsive web)

---

## Research Scope

CORTHEX app is a **dedicated mobile app** (not a responsive web breakpoint). It wraps React+Tailwind in Capacitor for iOS and Android distribution. The UX must feel native — touch targets, safe areas, and gesture patterns must meet platform standards exactly.

### Features to support (from Phase 0 context):
- **P0:** Hub (command center), Chat (AI agent conversation), NEXUS (org canvas), Dashboard, Home
- **P1:** Agents, Departments, Jobs, Reports, ARGOS (cron)
- **P2:** SNS, Trading, Messenger, Knowledge, AGORA, Tiers, Performance
- **P3:** Costs, Activity Log, Settings, Classified, Files, Notifications

### Brand context (from Phase 0-2 snapshot):
- Archetype: **Sovereign Sage** (authoritative, intelligent, premium)
- Movement: **Swiss International Style** + **Dark Tech UI**
- Base: `slate-950` page, `slate-900` surface, `slate-800` elevated
- CTA: `cyan-400` primary, `indigo-700` hover
- Font: Inter (display) + Inter (body) + JetBrains Mono (code)

---

## Part 1: Reference App Analysis

### 1.1 ChatGPT Mobile (OpenAI)

**Platform:** iOS + Android
**Nav pattern:** Bottom tab bar + conversation stack

**Layout structure:**
```
┌─────────────────────┐
│  Status Bar (safe)  │
│─────────────────────│
│  Header: "ChatGPT"  │  ← Title + model picker + compose icon
│─────────────────────│
│                     │
│   Conversation      │
│   History List      │  ← Scrollable feed, conversation cards
│                     │
│   [New Chat FAB]    │  ← Bottom-right floating action button
│─────────────────────│
│ ● Chats │ Explore │ │  ← 2-3 tab bottom bar (minimal)
│─────────────────────│
│  Home Indicator     │  ← iOS safe area (34pt)
└─────────────────────┘
```

**Navigation:**
- Minimal tab bar: Chats / Explore / (profile avatar)
- Conversation opens as stack push (slide from right)
- Chat input: sticky bottom bar with attachment + voice buttons
- Swipe left to dismiss a conversation

**Touch targets:**
- Tab bar items: ~80pt wide, 49pt tall (iOS standard)
- FAB: 56dp circle (Material) or 44pt (iOS min)
- Chat input: 44pt height minimum

**Gesture patterns:**
- Swipe right from edge → go back (iOS native)
- Long-press conversation → contextual menu
- Pull-to-refresh conversation list

**Handling CORTHEX features:**
- Chat: Direct parallel — conversation list + streaming chat
- Org chart (NEXUS): No equivalent — would need dedicated tab
- Admin: Entirely absent — separate admin app
- Notifications: Badge count on tab icon

**Stitch generation suitability:** HIGH — Simple structure, clear grid, high contrast cards

**Premium SaaS Quality Score:** 7.5/10
- Pros: Extremely clean, focused, fast, industry-recognized pattern
- Cons: Too minimal for enterprise complexity (no department scoping, no multi-agent context)

---

### 1.2 Slack Mobile (Salesforce)

**Platform:** iOS + Android
**Nav pattern:** 4-tab bottom bar (2024 redesign)

**Layout structure:**
```
┌─────────────────────┐
│  Status Bar (safe)  │
│─────────────────────│
│ [≡] Home        [✏] │  ← Header with workspace name + compose
│─────────────────────│
│  ┌──────────────┐   │
│  │ Pinned DMs   │   │  ← Priority sections
│  ├──────────────┤   │
│  │ Channels     │   │  ← Grouped by priority/unread
│  ├──────────────┤   │
│  │ Apps         │   │  ← Third-party integrations
│  └──────────────┘   │
│─────────────────────│
│  Home │DM│@│ You    │  ← 4-tab bottom bar
│─────────────────────│
│  Home Indicator     │
└─────────────────────┘
```

**Navigation:**
- Tab 1 (Home): Prioritized feed of channels + DMs
- Tab 2 (DMs): Direct messages list
- Tab 3 (@): Mentions and notifications
- Tab 4 (You): Profile, status, preferences
- Workspace switcher: Left edge swipe / long-press workspace icon
- Channel opens as stack push

**Touch targets:**
- Tab items: 4 items × ~96pt wide each (375pt screen)
- Minimum 44×44pt for all interactive elements
- Channel list rows: 60pt height

**Gesture patterns:**
- Swipe right from left edge → open channel sidebar/DM
- Swipe left on message → quick reaction
- Long-press message → action menu
- Pull-to-refresh feed

**Handling CORTHEX features:**
- Chat: Maps to DM tab (1:1 agent conversation)
- Org chart: Not present — closest is "People" section
- Admin: Separate Slack Admin web console
- Notifications: Dedicated @mention tab — very relevant

**Stitch generation suitability:** MEDIUM — Complex multi-section list requires careful spec

**Premium SaaS Quality Score:** 8/10
- Pros: Enterprise-proven, department scoping concept works, familiar pattern
- Cons: Information density can feel chaotic; workspace switcher complexity

---

### 1.3 Linear Mobile (Linear)

**Platform:** iOS + Android
**Nav pattern:** 5-tab bottom bar, sidebar drawer hybrid

**Layout structure:**
```
┌─────────────────────┐
│  Status Bar (safe)  │
│─────────────────────│
│ [◈ ACME]    [🔍][+] │  ← Team/workspace selector + search + new
│─────────────────────│
│                     │
│   Issue Feed        │  ← Priority-sorted cards
│   ┌────────────┐    │
│   │ P0 Issue   │    │  ← Status pill + assignee avatar
│   │ P1 Issue   │    │
│   └────────────┘    │
│                     │
│─────────────────────│
│ Home│Issues│Teams│Me │  ← Clean 4-tab bar
│─────────────────────│
│  Home Indicator     │
└─────────────────────┘
```

**Navigation:**
- Clean 4-tab bottom bar with icon + label
- Swipe from left edge → team/project sidebar
- Issue opens as full-screen stack push
- Floating action button for new issue

**Touch targets:**
- Tab bar: 49pt height, icons ~24pt, labels 10pt
- Cards: 72-88pt height minimum (touch-friendly)
- FAB: 56pt diameter

**Gesture patterns:**
- Swipe to archive/complete issue (destructive swipe)
- Long-press for priority quick-change
- Drag-to-reorder priority queue

**Handling CORTHEX features:**
- Hub (agent jobs): Maps well to Linear's issue feed concept
- Agents: Maps to "Teams" in Linear
- Chat: Not present — would need dedicated tab
- NEXUS org chart: No equivalent

**Stitch generation suitability:** HIGH — Clean card-based layout, strong visual hierarchy

**Premium SaaS Quality Score:** 9/10
- Pros: Best-in-class dark mode, excellent density/clarity balance, strong hierarchy
- Cons: Not AI-chat native; org visualization absent

---

### 1.4 Notion Mobile (Notion Labs)

**Platform:** iOS + Android
**Nav pattern:** Sidebar drawer primary, bottom bar secondary

**Layout structure:**
```
┌─────────────────────┐
│  Status Bar (safe)  │
│─────────────────────│
│  [☰]  Workspace [+] │  ← Hamburger + workspace + new page
│─────────────────────│
│                     │
│   Recent Pages      │  ← Horizontally scrollable thumbnails
│   ─────────────────  │
│   Search Box        │  ← Always-visible search
│   ─────────────────  │
│   Favorites         │  ← Pinned pages list
│   My Pages          │  ← Personal pages
│                     │
│─────────────────────│
│  Home│Search│Inbox  │  ← 3-tab minimal bottom bar
│─────────────────────│
│  Home Indicator     │
└─────────────────────┘
```

**Navigation:**
- Hamburger → full-screen sidebar with workspace tree
- Bottom bar minimal (Home / Search / Inbox only)
- Deep page opens as full-screen push
- Swipe right → back (iOS)

**Touch targets:**
- Sidebar list rows: 48pt height
- Page cards: 120pt height (thumbnail previews)
- Bottom bar: 49pt height standard

**Gesture patterns:**
- Swipe from left edge → opens sidebar
- Long-press sidebar item → reorder/options
- Pinch on canvas pages → zoom

**Handling CORTHEX features:**
- Knowledge base: Strong parallel (Notion's core)
- Agent pages: Could map as "workspace pages"
- Chat: Absent — would need redesign
- NEXUS: Notion canvas is a weak analogue

**Stitch generation suitability:** MEDIUM — Sidebar-first navigation harder to Stitch-generate precisely

**Premium SaaS Quality Score:** 7/10
- Pros: Flexible, hierarchical, good knowledge patterns
- Cons: Sidebar-first is not mobile-native; knowledge-first not AI-first

---

## Part 2: Pattern Libraries Reference

### 2.1 Material Design 3 (MD3) — Navigation Bar

**Official:** https://m3.material.io/components/navigation-bar/overview

**Specs:**
- Container height: **80dp** (Android standard)
- Active indicator: pill shape, 64×32dp
- Icon size: 24dp
- Label: 12sp (Medium weight)
- Touch target: **minimum 48×48dp** per item
- Max items: **5** (3-5 recommended; odd numbers preferred for visual rhythm)
- Elevation: 2dp (Tonal Surface)

**State system:**
- Active: brand color fill indicator + color icon + color label
- Inactive: on-surface-variant icon (medium contrast)
- Pressed: ripple effect (state layer opacity 0.12)
- Focused: focus ring (state layer opacity 0.12)
- Disabled: opacity 0.38

**Badge spec:**
- Dot badge: 6dp diameter
- Number badge: 16dp height, 8dp min-width, rounded pill
- Position: top-right of icon, 4dp offset

**MD3 Expressive update (2025):**
- Shorter flexible navigation bar replacing original
- Horizontal nav rail recommended for tablets/landscape
- Navigation drawers deprecated in favor of nav rail

**Capacitor/CSS equivalent:**
```css
/* Bottom nav safe area */
.bottom-nav {
  height: calc(56px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

### 2.2 Apple HIG 2025 — Tab Bars

**Official:** https://developer.apple.com/design/human-interface-guidelines/tab-bars

**Specs:**
- Tab bar height: **49pt** (compact), + home indicator safe area (~34pt)
- Touch target: **minimum 44×44pt** — Apple mandates this universally
- Max visible tabs: **5 on iPhone** (6+ get "More" overflow)
- Icon size: 25×25pt (filled/unfilled state toggle)
- Label: 10pt, SF Pro Text

**Safe area requirements (Capacitor):**
```css
/* Critical for Capacitor apps */
.tab-bar {
  padding-bottom: env(safe-area-inset-bottom); /* 34pt on notch iPhones */
  height: calc(49px + env(safe-area-inset-bottom));
}
.content-area {
  padding-top: env(safe-area-inset-top); /* 44pt status bar */
  padding-bottom: calc(49px + env(safe-area-inset-bottom));
}
```

**2025 Updates (Liquid Glass design language):**
- Tab bar materials use translucency + blur (backdrop-filter)
- Dynamic Island consideration: avoid top-right corner
- Tab bar floats with subtle glass material on iOS 26

**Badge spec:**
- Dot: 8pt diameter, positioned at top-right of icon
- Number: automatic width, 20pt height
- Red (#FF3B30) by default

---

## Part 3: TOP 3 Layout Recommendations for CORTHEX

---

### OPTION A — "Command Hub" (RECOMMENDED: 9.2/10)

**Inspiration:** Linear mobile + enterprise command center patterns
**Philosophy:** Hub is center of gravity (from Phase 0-2: "80% of time in Hub")

#### Navigation Structure:
```
Bottom Tab Bar — 5 tabs:
┌─────┬──────┬──────┬──────┬─────┐
│ Hub │ Chat │NEXUS │ Jobs │ You │
│ ◈   │  💬  │  ⬡   │  ⚙   │ 👤  │
└─────┴──────┴──────┴──────┴─────┘
```

#### Screen Flow — ASCII:
```
┌─────────────────────────────┐
│  ← status bar →  [🔔 3] [⋯] │  ← Notification bell + overflow menu
│─────────────────────────────│
│  HUB                        │  ← Page title (Inter, 17px, slate-100)
│─────────────────────────────│
│  ┌───────────────────────┐  │
│  │ 🟢 ARGOS  [working]   │  │  ← Secretary agent card (amber-500/15)
│  │ "Market analysis..."  │  │
│  └───────────────────────┘  │
│  ─────────────────────────  │
│  ┌─────────┐ ┌─────────┐   │
│  │ Dept A  │ │ Dept B  │   │  ← Department scoped grid
│  │ 3 agents│ │ 2 agents│   │
│  └─────────┘ └─────────┘   │
│  ─────────────────────────  │
│  RECENT ACTIVITY            │  ← Section header (slate-400, 12px)
│  ┌───────────────────────┐  │
│  │ Alpha completed task  │  │  ← Activity feed
│  │ 2m ago · emerald-400  │  │
│  └───────────────────────┘  │
│─────────────────────────────│
│  Hub │ Chat │NEXUS│Jobs│You │  ← 5-tab bottom bar
│─────────────────────────────│
│     ← safe area inset →     │
└─────────────────────────────┘
```

#### Chat Screen:
```
┌─────────────────────────────┐
│ ← [Agent: Alpha] 🟢 working │  ← Back + agent name + status
│─────────────────────────────│
│                             │
│         [Agent msg]         │  ← Streamed bubble, slate-800 bg
│  ╔═══════════════════╗      │
│  ║ Tool call: search ║      │  ← Tool call card, cyan-400/20
│  ╚═══════════════════╝      │
│         [Agent msg]         │
│                    [User]   │  ← User bubble, cyan-400
│                             │
│─────────────────────────────│
│ [📎]  Type a message...  [⬆]│  ← Sticky input bar
│─────────────────────────────│
│     ← safe area inset →     │
└─────────────────────────────┘
```

#### NEXUS Screen (org chart):
```
┌─────────────────────────────┐
│ ← NEXUS          [+][⤢][⋯] │  ← Add node + expand + menu
│─────────────────────────────│
│                             │
│   ┌──────────┐              │
│   │ CEO Agent│              │  ← Draggable node (violet-400 T1)
│   └────┬─────┘              │
│        │                    │
│   ┌────┴────────────┐       │
│   │                 │       │
│ ┌─┴──┐          ┌──┴──┐    │
│ │Mkt │          │ Ops │    │  ← Department nodes (sky-400 T2)
│ └─┬──┘          └──┬──┘    │
│   │                │        │
│  ...              ...       │
│                             │
│   ← Pinch to zoom, drag →   │
│─────────────────────────────│
│  Hub │ Chat │NEXUS│Jobs│You │
│─────────────────────────────│
└─────────────────────────────┘
```

#### How it handles key features:
| Feature | Pattern |
|---------|---------|
| Agent chat | Full-screen chat push from Hub or Chat tab |
| Org chart | NEXUS tab — pinch/zoom canvas |
| Notifications | Bell icon in hub header + @mention badge on tab |
| Admin | "You" tab → Settings → Admin (deep link to admin app) |
| Department scoping | Hub grid filtered by user's department |

#### Touch targets:
- Tab bar items: 75pt wide × 49pt tall (5 tabs, 375pt screen)
- Agent cards: min 72pt height
- FAB (add node in NEXUS): 56pt
- All buttons: min 44×44pt
- Bottom safe area: `env(safe-area-inset-bottom)` (34pt on iPhone X+)

#### Gesture patterns:
- Swipe right from left edge → back navigation
- Long-press agent card → quick actions menu
- Pinch to zoom on NEXUS canvas
- Pull-to-refresh on Hub feed
- Swipe left on job item → cancel/archive

#### Stitch generation considerations:
- Hub screen: Card grid layout → Stitch handles well with frame components
- Chat screen: Message bubble list → Stitch can generate message bubble variants
- NEXUS: Canvas interaction must be handcoded (Stitch generates the shell/chrome only)
- Tab bar: Stitch generates but CSS safe-area must be manually added

#### Premium SaaS Quality Score: **9.2/10**
- **+** Hub-first matches 80% usage pattern (Phase 0-2 UX Principle 2)
- **+** 5 tabs maximum covers all P0/P1 features without overflow
- **+** Swiss grid discipline maintained in card layouts
- **+** Dark Tech aesthetic natural fit
- **-** NEXUS canvas complexity requires custom code beyond Stitch
- **-** 5 tabs at 375pt is tight (75pt each) — needs careful icon/label sizing

---

### OPTION B — "Conversational Core" (Score: 8.5/10)

**Inspiration:** ChatGPT mobile + Slack DM patterns
**Philosophy:** Chat is the primary interface; everything routes through conversation

#### Navigation Structure:
```
Bottom Tab Bar — 4 tabs:
┌──────┬───────┬───────┬───────┐
│ Home │ Agents│ Work  │  You  │
│  🏠  │   🤖  │  ⚡   │  👤   │
└──────┴───────┴───────┴───────┘
```

#### Screen Flow — ASCII:
```
┌─────────────────────────────┐
│  ← status bar →  [🔍] [✏️]  │  ← Search + new conversation
│─────────────────────────────│
│  AGENTS                     │
│─────────────────────────────│
│  ┌───────────────────────┐  │
│  │ 🟢 Alpha  · Marketing │  │  ← Agent row: status + dept
│  │ "Working on report..."│  │  ← Last message preview
│  │                  2m ✓ │  │  ← Time + read status
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 🔵 Beta   · Operations│  │
│  │ "Analysis complete"   │  │
│  │                 15m   │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ ⚫ Gamma  · Finance   │  │  ← Offline agent
│  └───────────────────────┘  │
│─────────────────────────────│
│  Home│Agents│Work  │ You    │
│─────────────────────────────│
└─────────────────────────────┘
```

#### How it handles key features:
| Feature | Pattern |
|---------|---------|
| Agent chat | Agents tab (primary) → chat push |
| Org chart | Home tab → NEXUS card → full screen push |
| Notifications | Badge on Home + Agents tab |
| Admin | You tab → Admin deep link |
| Department scoping | Agents tab filtered list header |

#### Touch targets: Same as Option A standards

#### Gesture patterns:
- Swipe left on agent conversation → archive/pin
- Long-press agent → set as favorite
- Swipe right from edge → back

#### Stitch generation considerations:
- Agent list: Excellent Stitch compatibility (list with avatar + meta)
- Home dashboard: Card widgets → Stitch generates well
- Simpler structure = faster Stitch iteration

#### Premium SaaS Quality Score: **8.5/10**
- **+** Chat-native — aligns with AI product expectation
- **+** 4 tabs = more breathing room per tab item (94pt each)
- **+** Simpler for Stitch generation
- **-** Hub (command center) is subordinated to chat — contradicts Phase 0-2 Principle 2
- **-** NEXUS becomes a buried secondary screen
- **-** Jobs/ARGOS visibility too low

---

### OPTION C — "Swiss Command" (Score: 8.8/10)

**Inspiration:** Linear + Microsoft 365 Copilot patterns
**Philosophy:** Information hierarchy before interaction; type-driven, grid-precise

#### Navigation Structure:
```
Bottom Tab Bar — 5 tabs:
┌──────┬──────┬──────┬──────┬──────┐
│ Hub  │ Chat │Squad │  Ops │  Me  │
│  ⬛  │  ◯   │  ⬡   │  ⚙   │  👤  │
└──────┴──────┴──────┴──────┴──────┘
```

#### Screen Flow — ASCII:
```
┌─────────────────────────────┐
│ CORTHEX        [🔔][⋯]      │  ← Brand mark + utils
│─────────────────────────────│
│ ─────────────────────────── │
│  STATUS OVERVIEW            │  ← Swiss grid: 2-col
│  ┌──────────┬──────────┐   │
│  │ 12       │ 4        │   │  ← Stat cards
│  │ Active   │ Running  │   │
│  └──────────┴──────────┘   │
│ ─────────────────────────── │
│  PRIORITY QUEUE             │  ← Left-aligned section label
│  01  Alpha — Report [🔵]   │  ← Numbered list, type-driven
│  02  Beta — Analysis [🟢]  │
│  03  Gamma — Review [⚫]   │
│ ─────────────────────────── │
│  ACTIVE JOBS          3/7   │  ← Fraction counter
│  ████████░░░░░░ 43%         │  ← Progress bar
│─────────────────────────────│
│  Hub │ Chat │Squad│Ops│ Me  │
│─────────────────────────────│
└─────────────────────────────┘
```

#### How it handles key features:
| Feature | Pattern |
|---------|---------|
| Agent chat | Chat tab — agent roster → conversation push |
| Org chart | Squad tab — NEXUS canvas |
| Notifications | Bell in Hub header |
| Admin | Me tab → admin panel link |
| Department scoping | Squad tab filtered by dept |

#### Touch targets: Same as Option A standards

#### Gesture patterns:
- Swipe up on priority queue → expand full list
- Long-press job item → quick priority change
- Pull-to-refresh dashboard stats

#### Stitch generation considerations:
- Stat cards: Very Stitch-friendly (simple number + label)
- Numbered list: Stitch generates but needs manual numbering logic
- Progress bars: Stitch generates well

#### Premium SaaS Quality Score: **8.8/10**
- **+** Swiss International Style perfectly expressed
- **+** Data-before-decoration (Phase 0-2 Principle 3)
- **+** Strong information hierarchy
- **-** Numbered list can feel bureaucratic for mobile
- **-** "Squad" tab name may confuse new users vs "Departments"

---

## Part 4: Cross-Cutting Specifications

### Touch Target Standards (CORTHEX mandatory)
```
Minimum touch target: 44×44pt (iOS) / 48×48dp (Android)
Preferred touch target: 48×48pt / 56×56dp
Tab bar item: 75pt wide × 49pt tall (5-tab, 375pt screen)
Card minimum height: 72pt
FAB: 56pt diameter
Input bar: 44pt height + safe area padding
```

### Safe Area Implementation (Capacitor)
```css
/* Required for ALL Capacitor apps targeting iOS + Android */

/* Status bar safe area */
.app-header {
  padding-top: env(safe-area-inset-top);
}

/* Bottom nav safe area (critical — home indicator on iPhone) */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(49px + env(safe-area-inset-bottom));
}

/* Content scroll area — avoid both nav bars */
.main-content {
  padding-top: calc(44px + env(safe-area-inset-top));
  padding-bottom: calc(49px + env(safe-area-inset-bottom));
}

/* Android Chromium <140 workaround: use @capacitor-community/safe-area plugin */
```

### Bottom Tab Bar Token Spec (CORTHEX Design System)
```
Background: slate-950 + backdrop-blur-md (glassmorphism per Phase 0-2)
Border-top: 1px solid slate-800
Active icon: cyan-400 fill
Inactive icon: slate-500 fill
Active label: slate-100, 10px, Inter Medium
Inactive label: slate-500, 10px, Inter Regular
Tab item height: 49px + safe-area-inset-bottom
Transition: 150ms ease (Phase 0-2 conservative motion)
Badge: red-500 dot (6px) / number (16px height, rounded-full)
```

### Gesture Map (all options)
| Gesture | Target | Action |
|---------|--------|--------|
| Swipe right from edge | Any screen | Go back |
| Pull down | List screens | Refresh |
| Long-press | Agent card | Contextual menu |
| Pinch | NEXUS canvas | Zoom |
| Swipe left on item | Job/conversation rows | Reveal actions |
| Tap + hold scroll | Lists | Fast scroll |

### Header Pattern (all options)
```
Height: 44pt (compact) / 96pt (with search)
Left: Back arrow (stack nav) or App title
Center: Page title (Inter 17px, slate-100)
Right: Action icons (max 2-3)
Background: slate-900 + border-bottom slate-800/50
```

---

## Part 5: Stitch Generation Notes

### What Stitch generates well:
- Bottom tab bar chrome (shell structure)
- Card list layouts with avatar + title + meta
- Stat overview grids (2-col, 3-col)
- Chat message bubbles (user + agent variants)
- Modal sheets (bottom sheet pattern)
- Settings list rows

### What requires manual code after Stitch:
- NEXUS interactive canvas (React Flow — no Stitch equivalent)
- Real-time streaming text in chat bubbles
- Pull-to-refresh behavior
- `env(safe-area-inset-*)` CSS variables
- `@capacitor-community/safe-area` plugin integration
- Touch gesture handlers (swipe to dismiss, etc.)

### Stitch prompt strategy:
- Design screens at 390×844px (iPhone 14 Pro)
- Use exact hex values from CORTHEX color system
- Design tab bar WITHOUT safe area (add in code)
- Mark interactive elements clearly in frame descriptions
- Separate each major screen as a distinct frame

---

## Conclusion & Recommendation

**Recommended: OPTION A — "Command Hub"**

Rationale:
1. **Phase 0-2 alignment**: Directly embodies UX Principle 2 ("Hub is Center of Gravity — 80% of time")
2. **Feature coverage**: 5-tab structure covers all P0+P1 features without burial
3. **Brand alignment**: Authoritative Sovereign Sage archetype = command center metaphor
4. **Precedent**: Linear (9/10) proves this dark, dense, tab-first approach works for power users
5. **Stitch viability**: Hub, Chat, Jobs screens are all Stitch-generatable; NEXUS chrome also generatable

**Next step:** Phase 1 Landing page research (separate file), then Phase 2 Analysis scores all three options against UX Principles + Rams' 10 principles.

---

## Sources
- [Slack Mobile Redesign — Slack Design](https://slack.design/articles/re-designing-slack-on-mobile/)
- [Simpler, More Organized Slack — Slack Blog](https://slack.com/blog/productivity/simpler-more-organized-slack-mobile-app)
- [Material Design 3 Navigation Bar](https://m3.material.io/components/navigation-bar/overview)
- [Material 3 Expressive Navigation Update — 9to5Google](https://9to5google.com/2025/05/14/material-3-expressive-navigation/)
- [Apple HIG Tab Bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- [Bottom Navigation Bar Complete Guide — AppMySite](https://blog.appmysite.com/bottom-navigation-bar-in-mobile-apps-heres-all-you-need-to-know/)
- [The New UI for Enterprise AI — Microsoft Design](https://microsoft.design/articles/the-new-ui-for-enterprise-ai/)
- [AI Design Patterns Enterprise Dashboards — AufaitUX](https://www.aufaitux.com/blog/ai-design-patterns-enterprise-dashboards/)
- [Capacitor Safe Area Plugin](https://github.com/capacitor-community/safe-area)
- [Mobile App Design Guidelines 2025 — Medium](https://medium.com/@CarlosSmith24/mobile-app-design-guidelines-for-ios-and-android-in-2025-82e83f0b942b)
- [Mobile UX Design Examples — Eleken](https://www.eleken.co/blog-posts/mobile-ux-design-examples)
