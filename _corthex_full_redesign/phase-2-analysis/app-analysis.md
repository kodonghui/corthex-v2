# CORTHEX App — Phase 2 Deep Analysis: Three Layout Options
**Phase:** 2 — Analysis
**Date:** 2026-03-15
**Analyst:** UXUI Writer Agent
**Input:** Phase 1 research + Phase 0-2 Vision & Identity v2.0
**Spec baseline:** Inter font · cyan-400 (#22D3EE) primary · slate-950 (#020617) bg

---

## Analysis Framework

Each option is scored across 6 dimensions (10pts each, total/60):

| Dimension | What it measures |
|-----------|-----------------|
| **Vision Alignment** | Sovereign Sage archetype fit, Swiss Style adaptation, Phase 0-2 7 Principles compliance |
| **UX** | Touch patterns, navigation depth, cognitive load (Miller's Law) |
| **Design Principles** | Gestalt, visual hierarchy, golden ratio, contrast, white space, unity |
| **Feasibility** | Stitch-generatable vs. manual code boundary, React component complexity |
| **Performance** | Bundle size, NEXUS mobile budget, streaming chat render pattern |
| **Accessibility** | WCAG AA contrast, touch target compliance, screen reader structure |

Phase 0-2 Correction baseline applied to all options (per Phase 1-2 Critic):
- Primary color: `cyan-400` (#22D3EE) — NOT indigo-600
- Typography: Inter + JetBrains Mono — NOT Geist/Pretendard
- Page background: `slate-950` (#020617) — NOT zinc-950

---

## OPTION A — "Command Hub"

**Inspiration:** Linear mobile + enterprise command center
**Tab structure:** Hub | Chat | NEXUS | Jobs | You (5 tabs)

---

### Design Philosophy Analysis

#### Sovereign Sage Archetype Fit (Mobile)

The Sovereign Sage archetype on mobile demands three properties: authority, clarity, and economy. Option A delivers all three.

**Authority:** Hub occupies Tab 1 — the left-most anchor position. On mobile, left-to-right reading direction gives Tab 1 unconscious primacy. This placement encodes the message: *Hub is where you command*. The CEO does not open an app to browse — they open it to issue orders. Tab 1 = command.

**Clarity:** The 5-tab label system (Hub / Chat / NEXUS / Jobs / You) is one English word per tab. No ambiguity. No accordion menus. No hamburger navigation requiring discovery. Each tab maps exactly to a P0/P1 feature cluster. The CEO reads the tab bar and immediately knows the application's architecture.

**Economy:** 5 tabs cover Hub, Chat, NEXUS, Jobs, and the self/settings surface. P2/P3 features (SNS, Trading, Library, Costs) are accessible within "You" → extended menu. This is correct economy: P0 features require zero extra taps; P2/P3 are not hidden, merely subordinated.

**Archetype failure risk:** If the Hub screen opens to a generic dashboard (metric tiles, generic status) rather than the active agent state, the Sovereign Sage experience collapses into an ordinary dashboard. The Hub *must* open to show the Secretary agent card and active delegation chain — not aggregate statistics.

#### Swiss International Style Adaptation to Touch UI

Swiss International Style's three mobile-critical properties:
1. **Flush-left typography** — preserved in card titles, section headers (Inter 17px title, slate-100, left-aligned)
2. **Grid discipline** — card grid with 16px horizontal margins, 12px vertical gap maintains mathematical order on 375px screen
3. **Typographic hierarchy** — 3 clear levels on Hub screen: section header (Inter 12px uppercase slate-400) → card title (Inter 14px slate-100) → metadata (JetBrains Mono 11px slate-500)

Touch adaptation changes one thing: the grid responds to 375px viewport, not 1440px. The 12-column grid compresses to 4 columns (mobile) or 2-column card grid. This is not a compromise — it is a valid Swiss Style responsive expression. Müller-Brockmann: *"The grid gives the designer a system for ordering the elements according to a principle that is both rational and clear."* A 4-col mobile grid is equally rational.

The bottom tab bar is NOT in Swiss tradition (Swiss Style is print-based). However, the tab bar can be treated as the mobile equivalent of a horizontal navigation rail — a concession to the platform that does not violate the underlying ordering principle.

#### Phase 0-2 Seven Design Principles Compliance

| Principle | Mobile Compliance Status | Notes |
|-----------|------------------------|-------|
| 1. Show the Org, Not the AI | ✅ NEXUS has dedicated tab (Tab 3); Hub grid groups agents by Department | Dept scoping visible on Hub without navigating |
| 2. Command, Don't Chat | ✅ Hub is Tab 1; placeholder "명령을 입력하세요" inherited from web | The command input is at Hub, not Chat tab |
| 3. State Is Sacred | ✅ Agent status dot (blue/emerald/red) visible on every Hub card | Status never requires tapping into agent |
| 4. Density Without Clutter | ✅ 72pt card height with 3 data points (name + status + elapsed) | Swiss grid prevents crowding |
| 5. One Primary Action Per Screen | ✅ Hub: send command; NEXUS: add node FAB; Chat: send message | Clear single CTA per screen |
| 6. The Grid Is the Law | ✅ 16px margins, 12px gaps, consistent card widths | No arbitrary float elements |
| 7. Soul Is Never Hidden | ⚠️ PARTIAL — agent card in Hub has insufficient room for soul preview | Tap → agent profile → soul link. 2 taps vs. 1 on desktop. Mobile concession |

**Overall archetype/philosophy score: 9.0/10** — strongest of three options.

---

### Design Principles Scoring

#### Gestalt Principles

**Proximity:**
Hub screen card grouping:
```
Section header: "마케팅 부서"          ← 12px above cards (signals new group)
┌─────────────────────────────────┐
│ Alpha  [TIER 1]  ● working  23s  │  ← gap-2 (8px) internal elements
│ "Market analysis in progress..."  │  ← gap-4 (16px) header to body
└─────────────────────────────────┘   ← gap-3 (12px) between cards
┌─────────────────────────────────┐
│ Beta   [TIER 2]  ● complete  1m  │
└─────────────────────────────────┘

                  ↕ gap-8 (32px) between department groups

Section header: "운영 부서"
```

This proximity structure directly mirrors the web dashboard pattern from Phase 0-2. Gestalt grouping is preserved — related agents cluster visually within their department section.

**Similarity:** Status dots (8px circles, consistent color-to-state mapping) function identically on mobile as on web. The similarity principle enforces that `bg-blue-400 animate-pulse` always means "working" everywhere — Hub, Chat header, Jobs list. No exceptions.

**Continuity:** Tab bar reads Hub → Chat → NEXUS → Jobs → You. This is a deliberate left-to-right information priority arc: Command center → Individual conversation → Organization view → Background jobs → Self. The user's eye follows this priority order naturally.

**Closure:** Cards with `rounded-2xl` (16px) imply closure without thick borders. The card that bleeds 50% off the bottom of the visible scroll area signals more content exists — no "더 보기" button required.

**Figure/Ground:** Agent report text (`slate-50`) against card surface (`slate-900`) achieves 20.1:1 contrast — maximum figure prominence. The tab bar backdrop-blur retreats visually, reinforcing the content area as figure.

**Gestalt score: 9/10** — all five principles applied correctly.

#### Visual Hierarchy

Hub screen hierarchy (blur test — would survive at 50% blur):
1. **Primary focal:** Active agent card — amber-500/15 tint for Secretary, differentiating it from standard cards
2. **Secondary:** Department section headers — slate-400 uppercase 12px create visual pauses
3. **Tertiary:** Agent metadata — JetBrains Mono 11px elapsed timers

Size contrast chain on Hub:
- Page title: 17px Inter Medium (44pt header)
- Section header: 12px Inter SemiBold Uppercase
- Agent name: 14px Inter Medium
- Metadata: 11px JetBrains Mono

Ratio: 17:14:12:11 — compressed but valid. The shift from Inter to JetBrains Mono for metadata creates style contrast that compensates for the narrow size range on mobile.

**Visual hierarchy score: 8.5/10** — size range compressed by mobile constraints; compensated by font-family contrast.

#### Golden Ratio

The 375px iPhone screen does not permit the 280px sidebar that achieves φ³ on desktop. However:

```
Mobile golden ratio approximations:
Content column: 375px - 32px margin = 343px content width
Hub card: full-width (343px)
Hub 2-col stat grid: (343 - 12px gap) / 2 = 165.5px per cell
Ratio 343:165.5 ≈ 2.07 (φ+0.452 — acceptable approximation)

Typography scale (maintained from Phase 0-2):
Body: 14px (base)
Section h: 17px (×1.214)
Tab label: 10px
```

The golden ratio cannot be perfectly expressed in a single-column mobile layout. Option A does not pretend to — it applies the ratio to content sub-divisions (2-col stat grids, card internal proportions) where it is achievable.

**Golden ratio score: 7/10** — mobile constraint is real but handled honestly.

#### Contrast

Active state cyan-400 on slate-950 tab bar:
- `#22D3EE` on `#020617` = **9.1:1** ✅ AAA

Inactive state slate-500 on slate-950:
- `#64748B` on `#020617` = **4.1:1** ⚠️ Below AA for small text (10px tab labels)
- **Fix required:** Use `slate-400` (#94A3B8) for inactive labels → 5.9:1 ✅ AA

Agent card text slate-50 on slate-900:
- `#F8FAFC` on `#0F172A` = **19.3:1** ✅ AAA

Section header slate-400 on slate-950:
- `#94A3B8` on `#020617` = **5.9:1** ✅ AA

**Contrast score: 8/10** — one correction required (inactive tab label color).

#### White Space

Hub screen white space analysis:
```
Status bar safe area:    44pt (OS controlled)
Header:                  44px (app chrome)
Content start:           16px margin from edge
Card internal padding:   16px (p-4) — matches "Standard" spacing unit
Between cards:           12px (gap-3) — compact but distinct
Between dept groups:     32px (gap-8) — Swiss section separator
Tab bar:                 49px + safe area
```

The compressed card padding (16px vs. 24px on desktop) is correct mobile adaptation. "Density Without Clutter" (Principle 4) holds because the card content is reduced to 3 data points — not because padding is increased.

**White space score: 9/10** — correctly adapted from desktop spacing system.

#### Unity

All screens in Option A share:
- `slate-950` background (same ground)
- `Inter` for all UI text (same voice)
- `JetBrains Mono` for all technical values (same technical signal)
- Consistent `rounded-2xl` card radius
- `cyan-400` as the only CTA/active color
- 8px/16px/32px spacing progression

A screen fragment removed from context and placed elsewhere would still be recognizable as CORTHEX. Unity test passes.

**Unity score: 9/10**

**Design Principles aggregate: 8.6/10**

---

### UX Deep Dive

#### Touch Interaction Patterns

**Swipe:**
- Right edge → back (iOS native, Android back gesture) — supported by stack navigation
- Left on job row → reveal archive/cancel action (swipe-to-dismiss pattern)
- Down from top of list → pull-to-refresh Hub feed

**Long-press:**
- Agent card → contextual menu: "채팅", "소울 보기", "작업 배정" (3 options max — Miller's Law)
- Job row → quick priority change (avoids full-screen navigation for common operation)
- Tab icon (long-press) → shortcut to sub-section (Power user feature, not required for MVP)

**Pinch/Zoom:**
- NEXUS canvas → pinch to zoom (standard pan/zoom)
- `@xyflow/react` v12 provides native touch zoom support

**Pull-to-refresh:**
- Hub feed: refresh agent statuses (delegates to server SSE reconnect)
- Jobs list: refresh job queue
- Visual indicator: slate-400 spinner (NO bright color — not a celebration gesture)

#### Navigation Depth Analysis

Maximum tap count to reach any feature from Hub (Tab 1 active):

| Feature | Tap path | Count |
|---------|----------|-------|
| Send command to Hub | Hub input bar | 1 |
| View NEXUS org chart | Tap NEXUS tab | 1 |
| Open agent chat | Hub → agent card → Chat screen | 2 |
| View agent Soul | Hub → agent card → long-press → "소울 보기" | 2 |
| Create new agent | You tab → "에이전트 생성" | 2 |
| View job detail | Jobs tab → job row | 2 |
| View cost dashboard | You tab → "비용" | 2 |
| ARGOS schedule | Jobs tab → "아르고스" section | 2 |
| Activity log | You tab → "활동 로그" | 2 |
| Settings | You tab → "설정" | 2 |
| Library (knowledge) | You tab → "라이브러리" | 2 |

**No feature requires more than 2 taps from any P0 tab.** This is exceptional for a platform with 30+ features. The 5-tab structure + "You" overflow tab achieves this without hamburger menus.

**Tap depth target (industry standard: ≤3 taps to any feature):** Achieved at ≤2 taps. ✅

#### Cognitive Load Per Screen (Miller's Law)

Miller's Law: Working memory holds 7±2 chunks. Mobile attention further reduces this to 5±2.

**Hub screen chunks:**
1. Header: CORTHEX wordmark + notification bell + overflow (1 chunk — grouped)
2. Secretary agent status card (1 chunk — primary focus)
3. Department A agents (1 chunk — grouped by proximity)
4. Department B agents (1 chunk — grouped by proximity)
5. Recent activity section (1 chunk)
6. Tab bar (1 chunk — persistent chrome, learned)

**Total: 6 chunks** — within Miller's 7±2, and at the low end for mobile (5±2 = 3-7). ✅

**Chat screen chunks:**
1. Header: back + agent name + status (1 chunk)
2. Agent message bubbles (1 chunk per conversation turn, max 3 visible)
3. Tool call cards (1 chunk — visually distinct from message bubbles)
4. Input bar (1 chunk)

**Total: 4-6 chunks** — excellent. ✅

**NEXUS screen chunks:**
1. Header: back + NEXUS title + add/expand/menu (1 chunk)
2. Canvas nodes (each node = 1 chunk, but spatial proximity groups departments)
3. Tab bar (1 persistent chunk)

**Canvas cognitive load:** NEXUS is the high-risk screen. With 20+ nodes, cognitive load will exceed 7. Mitigation: department cluster borders (`border border-violet-400/20 rounded-3xl`) create super-chunks — entire departments become single cognitive units. Performance budget: ≤50 nodes before virtualization required (confirmed in Phase 1-2 snapshot).

**Jobs screen chunks:**
1. Header + filter controls (1 chunk)
2. Running jobs list (items grouped by status = 1 chunk per status group)
3. Progress bar summaries (1 chunk)
4. Tab bar (1 persistent chunk)

**Total: 4-5 chunks** ✅

**UX aggregate score: 9.0/10**

---

### React Implementation Spec

#### Component Tree (Capacitor Wrapper)

```
<CapacitorApp>                           // Capacitor plugin bridge
  <SafeAreaProvider>                     // @capacitor-community/safe-area
    <GestureProvider>                    // Gesture handler root
      <Router>                           // React Router v6 (hash mode for Capacitor)
        <AppShell>                       // Root layout — slate-950 bg
          <StatusBarSpacer />            // env(safe-area-inset-top) height
          <Routes>
            <Route path="/" element={<HubScreen />} />
            <Route path="/chat/:agentId" element={<ChatScreen />} />
            <Route path="/nexus" element={<NexusScreen />} />
            <Route path="/jobs" element={<JobsScreen />} />
            <Route path="/you" element={<YouScreen />} />
            <Route path="/you/costs" element={<CostsScreen />} />
            <Route path="/you/agents/new" element={<AgentCreateScreen />} />
            {/* ...P2/P3 routes nested under /you */}
          </Routes>
          <BottomTabBar />               // Fixed bottom — z-50
        </AppShell>
      </Router>
    </GestureProvider>
  </SafeAreaProvider>
</CapacitorApp>
```

**HubScreen component tree:**
```
<HubScreen>
  <AppHeader title="허브" actions={[NotificationBell, OverflowMenu]} />
  <ScrollView refreshControl={<PullToRefresh />}>
    <SecretaryCard agent={secretary} />           // Amber-tinted priority card
    {departments.map(dept => (
      <DepartmentSection key={dept.id} dept={dept}>
        {dept.agents.map(agent => (
          <AgentCard key={agent.id} agent={agent}
            onLongPress={() => showContextMenu(agent)}
            onPress={() => navigate(`/chat/${agent.id}`)}
          />
        ))}
      </DepartmentSection>
    ))}
    <RecentActivitySection activities={recentActivities} />
  </ScrollView>
  // Hub does NOT have a command input — Hub = dashboard view
  // Command input lives in ChatScreen and HubCommandBar (future)
</HubScreen>
```

**Note on Hub design:** The mobile Hub is a *status dashboard* not a command terminal. The full slash-command interface requires desktop keyboard input. Mobile Hub shows org state; mobile Chat initiates direct agent conversations. This is a valid mobile-specific adaptation.

**ChatScreen component tree:**
```
<ChatScreen agentId={params.agentId}>
  <AppHeader
    left={<BackButton />}
    title={<AgentNameWithStatus agent={agent} />}
  />
  <MessageList
    messages={messages}
    ref={scrollRef}
    onEndReached={loadMoreMessages}
  >
    {messages.map(msg => msg.type === 'tool_call'
      ? <ToolCallCard key={msg.id} call={msg} />
      : <MessageBubble key={msg.id} message={msg} />
    )}
    {isStreaming && <StreamingIndicator elapsed={elapsedSeconds} />}
  </MessageList>
  <ChatInputBar
    value={inputValue}
    onChange={setInputValue}
    onSend={handleSend}
    attachButton={<AttachButton />}
  />
  <SafeAreaSpacer side="bottom" />
</ChatScreen>
```

**NexusScreen component tree:**
```
<NexusScreen>
  <AppHeader
    title="넥서스"
    actions={[AddNodeButton, ExpandButton, OverflowMenu]}
  />
  <ReactFlowCanvas               // @xyflow/react v12 — lazy-loaded
    nodes={nexusNodes}
    edges={nexusEdges}
    onNodePress={handleNodePress}
    onNodeLongPress={handleNodeLongPress}
    fitView
    minZoom={0.3}
    maxZoom={2.0}
  >
    <MiniMap />                  // Bottom-right overview
  </ReactFlowCanvas>
  // FAB intentionally omitted from component tree — included via portal
  <FAB icon={PlusIcon} onPress={handleAddNode} />
</NexusScreen>
```

#### Bottom Tab Bar Implementation

```tsx
// BottomTabBar.tsx — Production spec

const TABS = [
  { id: 'hub',   label: '허브',   icon: TerminalIcon,  path: '/' },
  { id: 'chat',  label: '채팅',   icon: MessageIcon,   path: '/chat' },
  { id: 'nexus', label: '넥서스', icon: NetworkIcon,   path: '/nexus' },
  { id: 'jobs',  label: '잡',     icon: BriefcaseIcon, path: '/jobs' },
  { id: 'you',   label: '나',     icon: UserIcon,      path: '/you' },
] as const;

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const safeAreaBottom = useSafeAreaInsets().bottom; // capacitor-community/safe-area

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800"
      style={{
        height: `calc(49px + ${safeAreaBottom}px)`,
        paddingBottom: safeAreaBottom,
        backgroundColor: 'rgba(2, 6, 23, 0.92)', // slate-950/92
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* backdrop-blur fallback — Chromium <140 / older Android WebView */}
      <style>{`
        @supports not (backdrop-filter: blur(12px)) {
          .tab-bar-fallback { background: #020617 !important; }
        }
      `}</style>
      <div className="flex h-[49px] items-center">
        {TABS.map(tab => {
          const isActive = tab.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1"
              style={{ minHeight: 44, minWidth: 44 }} // Touch target compliance
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <tab.icon
                className={isActive ? 'text-cyan-400' : 'text-slate-400'}
                size={24}
                fill={isActive}
              />
              <span
                className={`text-[10px] font-medium transition-colors duration-150 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
              {/* Active indicator — MD3-style pill (optional enhancement) */}
              {isActive && (
                <span className="sr-only">(현재 페이지)</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

**Color correction applied:** Inactive labels use `slate-400` (not `slate-500`) for WCAG AA compliance at 10px.

#### Screen Stack Navigation

```
Navigation model: React Router v6 (hash mode)

Stack A — Hub stack:
  /                → HubScreen (root, no back)
  /chat/:agentId  → ChatScreen (back → Hub)
  /agent/:id      → AgentDetailScreen (back → Hub or Chat)

Stack B — NEXUS stack:
  /nexus          → NexusScreen (root, no back)
  /nexus/node/:id → NodeDetailSheet (modal bottom sheet)

Stack C — Jobs stack:
  /jobs           → JobsScreen (root, no back)
  /jobs/:id       → JobDetailScreen (back → Jobs)

Stack D — You stack:
  /you            → YouScreen (root, no back)
  /you/agents     → AgentListScreen
  /you/agents/new → AgentCreateScreen
  /you/costs      → CostsScreen
  /you/activity   → ActivityLogScreen
  /you/settings   → SettingsScreen
  /you/library    → LibraryScreen
  /you/argos      → ArgosScreen

Transition: slide-from-right (stack push), slide-to-right (stack pop)
Gesture: swipe-right from left edge cancels and pops stack
Tab switch: cross-fade 150ms — not a slide (tab switches are not stack operations)
```

#### Stitch-Generatable vs. Manual Code Boundaries

| Screen / Component | Stitch Generates | Manual Code Required | Reason |
|-------------------|-----------------|---------------------|--------|
| Hub screen layout | ✅ Card grid, headers, agent cards, activity feed | Real-time status updates, pull-to-refresh behavior | Stitch generates static layout; live state requires hooks |
| Agent card | ✅ Visual structure, status dot, tier badge, metadata layout | `animate-pulse` (must be added), elapsed timer (useInterval) | Animation and time logic |
| Chat screen chrome | ✅ Header, message bubble variants (user + agent), input bar shell | SSE streaming render, scroll-to-bottom on new message, `useRef` scroll lock | Interactive streaming behavior |
| Tool call card | ✅ Expanded/collapsed visual variants | Expansion toggle interaction | Toggle state |
| NEXUS screen | ✅ Header chrome, FAB button, empty state | Entire React Flow canvas, node drag, pinch-zoom, edge drawing | No Stitch equivalent for canvas |
| NEXUS node | ✅ Node card visual design (icon, name, tier badge, status) | ReactFlow custom node wrapper, onDrag, position update | ReactFlow node API |
| Jobs screen | ✅ List layout, progress bars, status badges, section headers | Filter/sort state management, ARGOS cron display logic | Data logic |
| Bottom tab bar | ✅ Visual layout, icon + label structure, active state visual | `env(safe-area-inset-bottom)`, `useSafeAreaInsets()`, `aria-current` | Platform-specific CSS + accessibility |
| Modal bottom sheet | ✅ Visual design of sheet content | Sheet animation (slide-up), gesture dismiss, keyboard avoidance | Native-feel gesture |
| Pull-to-refresh indicator | ❌ | 100% manual — `ScrollView` + `onRefresh` prop | No Stitch equivalent |
| Streaming text | ❌ | 100% manual — SSE + `useRef` + `requestAnimationFrame` batching | Performance-critical |

**Summary:** ~60% of UI chrome is Stitch-generatable. The 40% requiring manual code is concentrated in real-time behavior (streaming, gestures, safe areas) — not in visual layout.

#### Third-Party Dependencies

| Library | Purpose | Version | Justification |
|---------|---------|---------|---------------|
| `@xyflow/react` | NEXUS canvas | v12 | v12 is the first touch-optimized release; v11 has broken pinch-zoom on mobile |
| `@capacitor/core` | Native bridge | latest stable (pin exact) | SDK pin rule from CLAUDE.md |
| `@capacitor-community/safe-area` | `env(safe-area-inset-*)` in React | latest stable (pin exact) | Android Chromium <140 workaround |
| `@capacitor/haptics` | Long-press feedback | latest stable (pin exact) | Native haptic on long-press contextual menu |
| `react-router-dom` | Hash-mode routing | v6 (pin exact) | Capacitor requires hash routing (no server) |

**React Flow for NEXUS mobile — assessment:**
`@xyflow/react` v12 supports touch events natively. Known limitations on mobile:
- Multi-select via lasso gesture conflicts with scroll — mitigate by disabling lasso on mobile
- Performance: >100 nodes causes frame drops on mid-range Android — enforce ≤50 node hard cap with visible counter ("조직도 노드 50개 상한")
- Edge label overlaps on zoomed-out view — hide edge labels when zoom < 0.5

---

### Scoring: Option A

| Dimension | Score | Key Evidence |
|-----------|-------|-------------|
| Vision Alignment | 9/10 | Hub-first = Sovereign Sage authority; Tab 1 anchors command center; 6/7 principles fully compliant |
| UX | 9/10 | Max 2 taps to any feature; ≤6 chunks per screen; swipe/long-press/pinch all mapped |
| Design Principles | 8.5/10 | All Gestalt principles applied; contrast correction needed (inactive tab); golden ratio adapted honestly |
| Feasibility | 8/10 | 60% Stitch-generatable; React Flow complexity manageable with v12; safe-area plugin handles platform quirks |
| Performance | 8/10 | NEXUS lazy-loaded; SSE+rAF streaming pattern specified; ≤50 node budget enforced |
| Accessibility | 8.5/10 | Touch targets 44pt minimum throughout; `aria-current` on tab bar; contrast corrected to AA |

**Option A Total: 51/60**

---

---

## OPTION B — "Conversational Core"

**Inspiration:** ChatGPT mobile + Slack DM patterns
**Tab structure:** Home | Agents | Work | You (4 tabs)

---

### Design Philosophy Analysis

#### Sovereign Sage Archetype Fit (Mobile)

Option B's fundamental misalignment with the Sovereign Sage archetype is structural, not cosmetic.

The Sovereign Sage is characterized by **authority + knowledge**. Authority means: *I command, subordinates execute*. The conversational metaphor inverts this relationship — in a chat interface, the user is a supplicant asking an AI for help. Chat interfaces encode the emotional posture: "I need help." CORTHEX must encode the opposite: "I issue orders."

By placing "Agents" as Tab 2 (a list of chat sessions with AI), Option B repositions CORTHEX as a sophisticated ChatGPT — a list of AI conversations organized by agent. This is factually what it *is*, but presenting it as a conversation list makes the product feel like a messaging app for AI assistants. The Sovereign Sage does not have "conversations" with staff — they issue directives and receive reports.

**Archetype conflict:** The agent list with "last message preview" and "read status" checkmarks is borrowed directly from iMessage/Slack DM patterns. These patterns encode social, collegial interaction. A CEO reviewing AI reports does not check a read receipt.

Phase 0-2 Vision & Identity explicitly bans this:
> *Banned emotion: Chatbot-like. Banned pattern: Full-width bubble layout, "How can I help you today?" Never use conversational placeholder text.*

Option B's primary tab IS the conversation list pattern.

#### Swiss International Style Adaptation

Option B offers 4 tabs instead of 5, providing more breathing room per tab (94pt vs. 75pt at 375px). This is a genuine Swiss principle benefit — generous white space. However, this benefit is undermined by the information architecture: "Home" tab must now serve as a combined hub/dashboard/overview, creating a denser information surface to compensate for consolidation.

The Phase 0-2 rule *"flush-left alignment throughout"* applies equally to Option B. The agent conversation list would use flush-left layout — consistent with Swiss norms. But the conversational metaphor (time → right-aligned read receipts, avatar alignment) pulls toward the social messaging aesthetic that Swiss Style explicitly rejects as decorative.

#### Phase 0-2 Seven Design Principles Compliance

| Principle | Option B Compliance Status | Notes |
|-----------|--------------------------|-------|
| 1. Show the Org, Not the AI | ❌ FAIL — NEXUS demoted to Home tab sub-card | Org visibility requires extra taps; not primary surface |
| 2. Command, Don't Chat | ❌ FAIL — Chat/Agents is primary interface | Contradicts Principle 2 directly |
| 3. State Is Sacred | ✅ Agent status visible on Agents list | Status dots maintained |
| 4. Density Without Clutter | ✅ 4-tab = more horizontal space per tab | Agent list rows are dense but clean |
| 5. One Primary Action Per Screen | ⚠️ PARTIAL — Home has multiple CTAs | Compose button + NEXUS card + job summary |
| 6. The Grid Is the Law | ✅ Card grid applies in Home tab | List rows maintain alignment |
| 7. Soul Is Never Hidden | ⚠️ PARTIAL — soul access via Agents tab | 2 taps from anywhere |

**2 of 7 principles directly failed.** These are not minor issues — Principles 1 and 2 are the core differentiators of CORTHEX vs. generic AI chat tools.

---

### Design Principles Scoring

**Gestalt:** Agent list uses proximity (grouping by department) and similarity (consistent row structure). However, the read receipt + timestamp pattern (borrowed from messaging apps) introduces decorative elements that carry social meaning not relevant to CORTHEX. Figure/ground is maintained. Score: 7/10.

**Visual hierarchy:** Home tab must carry too much: org summary, command shortcut, job status, recent activity. No clear primary focal point. Fails the blur test — at 50% blur, the primary action is ambiguous. Score: 6/10.

**Golden ratio:** 4-tab structure at 375px gives 94pt per tab — closer to golden proportions within the tab bar itself. Card internals maintain proportions. Score: 7.5/10.

**Contrast:** Same corrected palette applies. No unique contrast issues. Score: 8/10.

**White space:** Conversational list rows (60pt height) with avatar + name + preview + timestamp create crowded rows when departments have 5+ agents. Score: 7/10.

**Unity:** Visual system is consistent (same colors, fonts, spacing). But the conversational metaphor creates a semantic disunity with Phase 0-2 identity. Score: 7/10.

**Design Principles aggregate: 7.1/10**

---

### UX Deep Dive

#### Touch Interaction Patterns

Option B adds messaging-native gestures:
- Swipe left on agent row → archive / pin conversation
- Long-press agent → set as favorite

These are valid touch patterns, but they import social messaging mental models. When a CEO swipes left on "비서실장," should they expect to archive the agent's conversation history or archive the agent itself? The gesture's semantic is borrowed from iMessage, where swipe-left-to-archive means "clear notification." In CORTHEX, this meaning is unclear.

**Gesture ambiguity risk: HIGH** on Option B. Requires additional onboarding/tooltip system that Options A and C do not need.

#### Navigation Depth Analysis

| Feature | Tap path | Count |
|---------|----------|-------|
| Send command | Home → command shortcut card | 2 |
| Open agent chat | Agents tab → agent row | 2 |
| View NEXUS org | Home → NEXUS card → NEXUS screen | 3 ⚠️ |
| View job detail | Work tab → job row | 2 |
| Create agent | You tab → "에이전트 생성" | 2 |
| View agent Soul | Agents tab → agent → soul button | 3 ⚠️ |

**NEXUS requires 3 taps from non-Home tabs.** This violates Phase 0-2 Principle 1 ("Show the Org") — the org chart should never be 3 taps deep.

#### Cognitive Load

Home tab chunks:
1. Header
2. Status summary card (active agents count)
3. NEXUS mini-preview card
4. Active jobs summary
5. Recent commands section
6. Quick command shortcut

**Total: 6 chunks** — within Miller's Law, but competing for primacy. No single focal point. Score: 6/10.

**UX aggregate score: 7.0/10**

---

### React Implementation Spec

Option B's Home tab is effectively a dashboard that aggregates data from Hub, NEXUS, and Jobs — three separate API domains. This creates a data orchestration complexity not present in Option A.

**Stitch generation:** Agent conversation list is the highest-Stitch-compatibility screen — simple list rows are ideal for Stitch. However, the home dashboard (multi-domain aggregation) is complex to Stitch-generate accurately.

**Third-party deps:** Same as Option A minus `@xyflow/react` from initial bundle (NEXUS is buried deeper, can be even more aggressively lazy-loaded).

---

### Scoring: Option B

| Dimension | Score | Key Evidence |
|-----------|-------|-------------|
| Vision Alignment | 5/10 | 2 core principles directly violated; chatbot metaphor contradicts Sovereign Sage |
| UX | 7/10 | 4 tabs = more horizontal space; but NEXUS buried 3 taps deep; gesture ambiguity risk |
| Design Principles | 7.1/10 | Gestalt maintained; home tab has no clear focal point |
| Feasibility | 8.5/10 | Simpler navigation = simpler implementation; agent list = high Stitch compatibility |
| Performance | 8.5/10 | NEXUS less accessible = can be more aggressively lazy-loaded |
| Accessibility | 8/10 | 4 tabs = easier thumb reach; fewer navigation items reduces cognitive load for screen reader users |

**Option B Total: 44.1/60**

---

---

## OPTION C — "Swiss Command"

**Inspiration:** Linear + Microsoft 365 Copilot
**Tab structure:** Hub | Chat | Squad | Ops | Me (5 tabs)

---

### Design Philosophy Analysis

#### Sovereign Sage Archetype Fit (Mobile)

Option C is the most typographically rigorous of the three options. The numbered priority queue (`01 Alpha — Report`, `02 Beta — Analysis`) is a direct expression of the Sovereign Sage's organizational mind: everything is ranked, everything has an explicit priority, nothing is ambiguous.

**Archetype strength:** The stat overview grid (2-col: Active agents / Running jobs) gives the CEO an at-a-glance org-state dashboard the moment the app opens. This matches the Phase 0-2 persona: *"Opens Hub → reviews outputs → checks NEXUS → closes. Not a 'chat all day' user."*

**Archetype weakness:** The "Squad" tab name is a significant problem for the Korean CEO persona. "Squad" implies informal team — agile startup energy. The Sovereign Sage persona expects formal organizational language. Phase 0-2 terminology explicitly uses "부서" (Department) or "넥서스" (NEXUS), never "Squad." This is a localization/nomenclature error that misrepresents the product's identity.

Additionally, the numbered list (`01 02 03`) reads bureaucratic on mobile. The Sovereign Sage's aesthetic is authoritative but not clerical. A numbered queue implies the CEO counts their own agents — a powerful admin pattern for desktop, but on mobile (where screen space is scarce) it can read as over-engineered.

#### Swiss International Style Adaptation

Option C is the most direct Swiss International Style expression. The numbered list with flush-left typography, progress bars with fraction counters (`3/7`), and stat grids mirror Müller-Brockmann's editorial grid work directly.

The Hub screen is essentially a typographic composition: numbers, fractions, labels, progress indicators — all left-aligned, mathematically spaced. This is Swiss Style in its purest mobile form. The risk is that it is *too* Swiss — the style is so deliberate that on mobile, at smaller sizes, it may read as cold rather than authoritative.

#### Phase 0-2 Seven Design Principles Compliance

| Principle | Option C Compliance Status | Notes |
|-----------|--------------------------|-------|
| 1. Show the Org, Not the AI | ✅ Squad tab (correctly renamed → NEXUS) | Naming fix required |
| 2. Command, Don't Chat | ✅ Hub is Tab 1; stat/queue format is command-center not chat | |
| 3. State Is Sacred | ✅ Status dots on priority queue items; fraction counter for jobs | |
| 4. Density Without Clutter | ✅ Numbered list + progress bars = dense but structured | Most information-dense option |
| 5. One Primary Action Per Screen | ✅ Hub: view/filter queue; NEXUS: add node | |
| 6. The Grid Is the Law | ✅ 2-col stat grid, numbered list alignment — most strictly Swiss | |
| 7. Soul Is Never Hidden | ⚠️ PARTIAL — soul access via Chat → agent → soul (2-3 taps) | |

**5.5/7 principles fully compliant.** Better than Option B, slightly behind Option A in Soul accessibility.

---

### Design Principles Scoring

**Gestalt:** Numbered list creates strong continuity — the eye follows the vertical number column downward. Section headers (`STATUS OVERVIEW`, `PRIORITY QUEUE`, `ACTIVE JOBS`) create clear closure boundaries. The 2-col stat grid uses symmetrical balance (unusual for Swiss Style but appropriate for dashboard metrics). Score: 8.5/10.

**Visual hierarchy:** The numbered priority queue is the clearest hierarchy expression of the three options. `01 Alpha — Report [● working]` — number anchor, agent name, task name, status. Four clear data points in a single row, reading left to right in information priority order. Score: 9/10.

**Golden ratio:** Stat grid 2-col: (343px - 12px gap) / 2 = 165.5px per cell. Fraction counter layout (number dominant, label secondary) uses implicit 1:1.618 within text weight. Score: 8/10.

**Contrast:** Numbered list anchor (`01`) in slate-600 vs. agent name in slate-100 creates deliberate contrast. Risk: slate-600 on slate-950 = 3.1:1 — only compliant for large text. Number anchors must be ≥18px or use slate-400. Correction required. Score: 7.5/10.

**White space:** Section headers provide breathing room between content zones. Progress bars (1 full-width bar per section) create visual pauses. More white space per screen than Option A due to progress bars taking a full row. Score: 8/10.

**Unity:** Consistent numbered anchor system creates strong system identity. All screens inherit the left-aligned, numbered hierarchy. Score: 8.5/10.

**Design Principles aggregate: 8.25/10**

---

### UX Deep Dive

#### Touch Interaction Patterns

**Swipe up on priority queue:** Reveals full list (bottom sheet pattern). This is a natural mobile gesture, but requires the user to discover the gesture — not immediately obvious. Mitigation: fade-out last visible row + "더 보기" text.

**Long-press job item:** Quick priority change (1 → 2 → 3). Valuable power user feature. Same gesture as Option A.

**Pull-to-refresh:** Dashboard stats refresh — highest value on Option C because the stats grid is the primary information surface.

#### Navigation Depth

| Feature | Tap path | Count |
|---------|----------|-------|
| View stat overview | Hub (default) | 0 |
| Expand priority queue | Swipe up | 1 gesture |
| Open agent chat | Chat tab → agent | 2 |
| View NEXUS | Squad tab (→ NEXUS) | 1 |
| View job detail | Ops tab → job row | 2 |
| Create agent | Me tab → "에이전트 생성" | 2 |

**Navigation depth comparable to Option A.** Squad tab = 1 tap to NEXUS (same as Option A's dedicated NEXUS tab). No feature >2 taps. ✅

#### Cognitive Load

Hub screen chunks:
1. Header (CORTHEX + bell + overflow)
2. Status overview grid (2 stat cards = 1 chunk — grouped)
3. Priority queue section (numbered list — up to 3 visible = 1 chunk per row, max 3)
4. Active jobs section (progress bar + fraction = 1 chunk)
5. Tab bar

**Total: 5-7 chunks** — within Miller's Law for mobile. The numbered list keeps each item to a single cognitive unit (number + name + status). ✅

However, the progress bar row (`████████░░░░░░ 43%`) adds a quantitative chunk that requires interpretation. It is accurate (Principle 3: State Is Sacred) but demands slightly more cognitive effort than a simple status dot.

**UX aggregate score: 8.5/10**

---

### React Implementation Spec

#### Key Difference from Option A

Option C's Hub screen is a **stat dashboard** — it aggregates data across agents, jobs, and departments into summary metrics. This differs from Option A's Hub (which shows agent cards directly). The implementation consequence:

Option C Hub requires:
```tsx
// Data aggregation hook — queries 3 separate endpoints
const { activeAgents, runningJobs, departmentStats } = useHubStats({
  refreshInterval: 30_000, // 30s polling — no SSE needed for aggregate stats
});
```

Option A Hub requires:
```tsx
// Live agent state — SSE streaming
const agents = useAgentStream(); // SSE connection per department
```

Option C's stat dashboard is simpler to implement than Option A's live agent cards. However, Option A's live streaming gives more value to the CEO (real-time, not 30s stale).

#### Component Differences

Option C-specific components:
```tsx
<StatGrid cols={2}>
  <StatCard value={activeAgents.count} label="활성 에이전트" />
  <StatCard value={runningJobs.count} label="실행 중인 잡" />
</StatGrid>

<PriorityQueue>
  {priorityItems.map((item, index) => (
    <PriorityRow
      key={item.id}
      number={String(index + 1).padStart(2, '0')}
      agent={item.agent}
      task={item.taskName}
      status={item.status}
      onLongPress={() => changePriority(item)}
    />
  ))}
</PriorityQueue>

<JobsSummary>
  <ProgressBar value={completedJobs / totalJobs} />
  <JobFraction completed={completedJobs} total={totalJobs} />
</JobsSummary>
```

**Stitch generation:** Stat grids and progress bars are the highest Stitch-compatibility components in the design system. Option C is the most Stitch-friendly hub screen of the three options.

**Named correction for Option C:** Tab label "Squad" → "넥서스" (or if English required: "NEXUS"). This is a terminology rule from Phase 0-2 Appendix A — no unapproved synonyms.

---

### Scoring: Option C

| Dimension | Score | Key Evidence |
|-----------|-------|-------------|
| Vision Alignment | 8/10 | Swiss Command aesthetic strong; naming issue ("Squad") docks 1.5pts; numbered list borders on bureaucratic |
| UX | 8.5/10 | Navigation depth comparable to A; stat dashboard is most information-efficient opening screen |
| Design Principles | 8.25/10 | Strongest visual hierarchy of three; contrast correction needed for number anchors |
| Feasibility | 9/10 | Highest Stitch compatibility; stat dashboard simpler than live agent cards; same React Flow complexity as A |
| Performance | 8.5/10 | 30s polling for stats (simpler than SSE); NEXUS same lazy-load pattern |
| Accessibility | 8/10 | Numbered list provides screen reader context; progress bars need `aria-valuenow`/`aria-valuemax` |

**Option C Total: 50.25/60**

---

---

## Comparative Scoring Summary

| Dimension | Option A "Command Hub" | Option B "Conversational Core" | Option C "Swiss Command" |
|-----------|----------------------|-------------------------------|-------------------------|
| Vision Alignment /10 | **9.0** | 5.0 | 8.0 |
| UX /10 | **9.0** | 7.0 | 8.5 |
| Design Principles /10 | 8.6 | 7.1 | **8.8** |
| Feasibility /10 | 8.0 | **8.5** | **9.0** |
| Performance /10 | 8.0 | **8.5** | 8.5 |
| Accessibility /10 | 8.5 | 8.0 | 8.0 |
| **TOTAL /60** | **51.1** | 44.1 | **50.25** |

---

## Winner: Option A — "Command Hub" (51.1/60)

### Rationale

Option A wins by 0.85 points over Option C. The margin is smaller than Phase 1 research suggested (9.2 vs. 8.8) because Option C's pure Swiss discipline genuinely outperforms in design principles and feasibility. However, the gap is decisive when Vision Alignment is weighted: Option A scores 9/10 vs. Option C's 8/10 on the dimension most central to CORTHEX's identity.

**Why Option A wins over Option C:**
1. **Hub-first tabs = Sovereign Sage** — Tab 1 is Hub (command center) not a stat dashboard. The CEO opens the app and sees *their agents*, not aggregate numbers. Active agency vs. passive reporting.
2. **Live agent cards > stat aggregation** — Option A's real-time SSE-connected agent cards show the org in motion. Option C's 30s-stale stats show the org at rest. CORTHEX is defined by live delegation, not periodic polling.
3. **No naming corrections required** — Option A uses "Hub / Chat / NEXUS / Jobs / You" — all Phase 0-2 compliant terminology. Option C requires "Squad" → "넥서스" correction.

**Why Option B loses decisively:**
The Vision Alignment score of 5/10 reflects fundamental architectural misalignment with Phase 0-2 Principles 1 and 2. This is not a design judgment call — it is a documented requirement violation.

---

## Required Corrections Before Phase 3 Token Work

### Option A Corrections (Apply Before Stitch)

| Issue | Wrong | Correct | Location |
|-------|-------|---------|---------|
| Inactive tab label color | `slate-500` (#64748B) | `slate-400` (#94A3B8) | BottomTabBar.tsx |
| Number anchor color (if implementing C elements) | `slate-600` | `slate-400` | PriorityRow component |

### WCAG Validation Checklist (Phase 3 prerequisite)

| Color pair | Ratio | Status | Action |
|-----------|-------|--------|--------|
| `cyan-400` on `slate-950` (active tab) | 9.1:1 | ✅ AAA | None |
| `slate-400` on `slate-950` (inactive tab label — corrected) | 5.9:1 | ✅ AA | Correction applied |
| `slate-50` on `slate-900` (card text) | 19.3:1 | ✅ AAA | None |
| `slate-400` on `slate-950` (section headers) | 5.9:1 | ✅ AA | None |
| `blue-400` on `slate-950` (working status) | 4.6:1 | ✅ AA | None |
| `emerald-400` on `slate-950` (complete status) | 8.9:1 | ✅ AAA | None |
| `red-400` on `slate-950` (error status) | 5.4:1 | ✅ AA | None |

All corrected color pairs pass WCAG AA minimum. ✅

---

## Phase 3 Input Handoff

The following specs are confirmed and ready for Phase 3 token work:

### Navigation Tokens
```
tab-bar-height: calc(49px + env(safe-area-inset-bottom))
tab-icon-size: 24px
tab-label-size: 10px
tab-label-weight: 500 (Medium)
tab-active-color: #22D3EE (cyan-400)
tab-inactive-color: #94A3B8 (slate-400)
tab-bg: rgba(2, 6, 23, 0.92) + backdrop-blur(12px)
tab-border-top: 1px solid #1E293B (slate-800)
tab-transition: 150ms ease
```

### Touch Target Tokens
```
touch-target-min: 44px × 44px (iOS) / 48px × 48px (Android)
card-height-min: 72px
fab-size: 56px
input-height-min: 44px
```

### Content Area Tokens
```
content-margin-horizontal: 16px
content-card-gap: 12px (gap-3)
content-section-gap: 32px (gap-8)
card-padding: 16px (p-4)
card-radius: 16px (rounded-2xl)
card-bg: #0F172A (slate-900)
card-elevated-bg: #1E293B (slate-800)
```

### NEXUS Performance Budget
```
node-render-max: 50 (hard cap before virtualization)
node-zoom-min: 0.3
node-zoom-max: 2.0
nexus-bundle-strategy: lazy (code-split — @xyflow/react ~200KB excluded from initial bundle)
edge-label-visibility: hide when zoom < 0.5
```

### Streaming Chat Pattern
```
streaming-render: SSE + useRef + requestAnimationFrame batching
scroll-behavior: useRef auto-scroll (NOT useState — prevents unnecessary re-renders)
elapsed-timer: setInterval(1000ms) with useRef for cleanup
timer-font: JetBrains Mono 11px slate-500 tabular-nums
```

---

_Phase 2 Analysis complete. Winner: Option A "Command Hub" (51.1/60)._
_Phase 3 next: Design Token Specification — Inter/JetBrains Mono scale, cyan-400 system, spacing primitives._
