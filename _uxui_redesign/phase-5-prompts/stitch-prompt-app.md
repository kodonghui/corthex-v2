# CORTHEX v3 — App Stitch Prompts (Mobile / Tablet)

**Phase:** 5-Prompts, Step 5-3
**Date:** 2026-03-23
**Target:** All 24 routes — mobile-first responsive variants
**Output Format:** React JSX + Tailwind CSS v4
**Design System:** DESIGN.md (Sovereign Sage tokens)
**Viewport:** 375px (mobile) primary, 768px (tablet) secondary

---

## Global Instructions (Apply to ALL Batches)

### Design System Reference
- Load `DESIGN.md` as the design system
- All colors use `corthex-*` token classes — NO hardcoded hex, NO Tailwind default palette
- Icons: Lucide React only, 2px stroke, `currentColor`
- Typography: Inter (UI), JetBrains Mono (`font-mono`) for costs/IDs/code

### Mobile-Specific Rules
1. **No sidebar** — Mobile uses bottom navigation bar (5 primary routes) + hamburger drawer for full nav
2. **Bottom navigation bar** — Cream background (`bg-corthex-bg`) with top border (`border-t border-corthex-border`)
   - 5 tabs: Hub, Dashboard, Agents, Chat, More (opens drawer)
   - Tab height: 56px, icon 24px (`w-6 h-6`), label `text-xs`
   - Active tab: `text-corthex-text-primary font-medium` + 2px top indicator bar
   - Inactive tab: `text-corthex-text-tertiary`
3. **Olive drawer** — Full navigation opens from left as overlay
   - Background: `bg-corthex-chrome` (olive dark)
   - Backdrop: `bg-corthex-chrome/40`
   - Slide animation: `translateX(-100% → 0)` 300ms
4. **Content area** — Full viewport width, padding `p-4` (16px) on mobile, `p-6` (24px) on tablet
5. **Touch targets** — ALL interactive elements minimum 44px height (`h-11`)
6. **No topbar on mobile** — Page title integrated into content header
7. **Cards** — Add `shadow-sm` on mobile for outdoor visibility (cream contrast insufficient in bright light)
8. **FAB (Floating Action Button)** — Primary create action per page
   - `w-14 h-14 rounded-full bg-corthex-accent text-corthex-text-on-accent shadow-lg`
   - Position: `fixed bottom-20 right-4` (above bottom nav)
   - Icon: 24px
9. **Bottom sheets** — Replace desktop modals on mobile
   - `rounded-t-2xl bg-corthex-surface border-t border-corthex-border`
   - Drag handle: `w-10 h-1 bg-corthex-border-strong rounded-full mx-auto mt-2`
   - Snap points: 50% and 90% viewport height
10. **prefers-reduced-motion:** All animations (pulse dots, slide transitions, streaming text) MUST respect `prefers-reduced-motion`. Reduced-motion fallback = instant state change. Include globally:
    ```css
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    ```
11. **ARIA directives** (mandatory on every page):
    - `<main role="main" id="main-content">` wrapping content
    - `<nav aria-label="Bottom navigation">` on bottom nav bar
    - `aria-current="page"` on active bottom tab
    - `aria-live="polite"` on notification badges and streaming text
    - `aria-live="assertive"` on error alerts
    - `aria-busy="true/false"` on loading containers
    - `aria-label` on all icon-only buttons and FAB
    - `aria-hidden="true"` on all decorative icons
    - `aria-describedby` linking inputs to error messages
12. **Placeholder colors:** All input placeholders MUST use `placeholder:text-corthex-text-tertiary` (#756e5a, 4.79:1) — never use non-token colors like #475569

### Archetype Context
- **Primary:** The Ruler — CEO on-the-go, checking agents from mobile
- **Secondary:** The Sage — quick data checks, approval actions
- Mobile = quick glance + decisive action. NOT deep work (that's desktop).

---

## Batch 1: Command Center (5 pages)

### Page 1: Hub (`/hub`) — Mobile
**Layout:** Single column, stacked sections
**Priority:** This is the mobile home screen — most critical page

**Sections to generate:**
1. **Page header** — CEO name greeting + date
   - `text-2xl font-bold text-corthex-text-primary`
   - No topbar — header is inline content
2. **Quick action strip** — Horizontal scrollable row of action chips
   - `flex gap-2 overflow-x-auto pb-2 -mx-4 px-4` (bleed to edges)
   - Each chip: icon + label, `bg-corthex-surface border border-corthex-border rounded-full px-4 h-10`
   - Actions: New Agent, New Task, Reports, Chat
3. **Active agents card** — Compact card showing currently working agents
   - Horizontal scroll of agent mini-cards (avatar + name + status dot)
   - `overflow-x-auto flex gap-3`
4. **Metric cards** — 2×2 grid of key metrics
   - `grid grid-cols-2 gap-3`
   - Each card: `bg-corthex-surface border border-corthex-border rounded-xl p-3 shadow-sm`
   - Value: `text-xl font-bold font-mono`, label: `text-xs text-corthex-text-secondary`
5. **Recent activity** — Compact timeline (last 5 items)
   - Each: semantic dot + one-line summary + time ago
   - "더보기" link at bottom
6. **Pending approvals** — Stack of approval cards (if any)
   - Swipe-to-approve gesture hint
   - `border-l-4 border-corthex-warning`

---

### Page 2: Dashboard (`/dashboard`) — Mobile
**Layout:** Single column, vertically stacked charts

**Sections to generate:**
1. **Date selector** — Segmented control (Today, 7d, 30d)
   - Full-width, `bg-corthex-surface rounded-lg p-1`
   - Active segment: `bg-corthex-accent text-corthex-text-on-accent rounded-md`
2. **KPI scroll strip** — Horizontal scrollable metric cards
   - `flex gap-3 overflow-x-auto -mx-4 px-4 pb-3`
   - Each card: `min-w-[140px] bg-corthex-surface border border-corthex-border rounded-xl p-3 shadow-sm`
3. **Cost chart** — Full-width area chart
   - Card wrapper, chart height 200px
   - Chart colors from `corthex-chart-*`
4. **Task status** — Horizontal bar or simple percentage bars
   - Compact version of donut chart
5. **Top agents** — Compact list (top 5)
   - Avatar + name + tasks + success rate
   - Tappable rows → opens agent detail bottom sheet

---

### Page 3: Chat (`/chat`) — Mobile
**Layout:** Full-screen chat (no side panels)

**Sections to generate:**
1. **Agent header** (top, replaces topbar)
   - `flex items-center gap-3 p-4 bg-corthex-surface border-b border-corthex-border`
   - Back arrow (`ChevronLeft`), agent avatar, name, status dot
   - Overflow menu (`MoreVertical`) for agent info
2. **Chat messages** — Full-width message list
   - CEO bubbles: right-aligned, `bg-corthex-accent text-corthex-text-on-accent rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]`
   - Agent bubbles: left-aligned, `bg-corthex-surface rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]`
   - **Timestamps OUTSIDE bubbles** — `text-xs text-corthex-text-tertiary mt-1` below each bubble. Show only on last message in a consecutive same-sender cluster. CEO timestamps right-aligned, agent timestamps left-aligned.
3. **Input bar** (bottom, above bottom nav)
   - `fixed bottom-[56px] left-0 right-0 bg-corthex-bg border-t border-corthex-border p-3`
   - Input: `flex-1 h-11 rounded-full bg-corthex-surface border border-corthex-border-input px-4 placeholder:text-corthex-text-tertiary` (placeholder color MUST use `text-corthex-text-tertiary` #756e5a at 4.79:1 — NOT #475569 which is not a CORTHEX token)
   - Send button: `w-11 h-11 rounded-full bg-corthex-accent`
4. **Agent list** — Shown when no agent selected
   - Full-screen list of agents with last message preview
   - Unread indicator dot
   - Search input at top

---

### Page 4: NEXUS (`/nexus`) — Mobile
**Layout:** Full-screen canvas with simplified controls

**Sections to generate:**
1. **Canvas** — Full viewport (`h-[calc(100vh-56px)]` minus bottom nav)
   - Pinch-to-zoom, pan gestures
   - Start zoomed out to show full org chart
   - Background: `bg-corthex-elevated` with dot grid
2. **Floating controls** (bottom-right, above bottom nav)
   - Zoom in/out buttons: `bg-corthex-surface border border-corthex-border rounded-xl shadow-md p-1`
   - Fit-to-view button
   - Stacked vertically, `gap-1`
3. **Node cards** — Simplified for mobile
   - Smaller text, compact padding
   - Tap to open detail bottom sheet (not side panel)
4. **Detail bottom sheet** — Opens on node tap
   - Agent/department full details
   - Quick actions
   - Drag handle at top

---

### Page 5: Notifications (`/notifications`) — Mobile
**Layout:** Single column list (no detail panel)

**Sections to generate:**
1. **Filter chips** — Horizontal scrollable
   - `flex gap-2 overflow-x-auto -mx-4 px-4 pb-3`
2. **Notification list** — Full-width cards
   - Each: icon (semantic), title, preview, time ago
   - Unread: `bg-corthex-accent-muted border-l-4 border-corthex-accent`
   - Swipe-right to mark as read (gesture hint)
   - Date group headers
3. **Notification detail** — Opens in new full-screen view on tap
   - Back button, full content, action buttons
4. **Empty state** — Centered icon + message
5. **Pull-to-refresh** indicator

---

## Batch 2: Organization (5 pages)

### Page 6: Agents (`/agents`) — Mobile
**Layout:** Card grid + bottom sheet detail

**Sections to generate:**
1. **Search bar** — Full-width sticky at top
   - `bg-corthex-surface border border-corthex-border-input rounded-lg h-11 px-4`
2. **Filter chips** — Horizontal scroll (Department, Status)
3. **Agent cards** — Single column stack
   - Each card: avatar, name, department tag, status dot + label, tier badge (`rounded-full`)
   - `bg-corthex-surface border border-corthex-border rounded-xl p-4 shadow-sm`
   - Tap → detail bottom sheet
4. **FAB** — "새 에이전트" (`Plus` icon)
   - Opens create form in bottom sheet
5. **Agent detail bottom sheet** — 90% snap point
   - Full agent info, stats, recent tasks
   - Action buttons: Edit, Chat, Delete
6. **Create/Edit form** — Full-screen bottom sheet
   - All form fields stacked vertically
   - `h-11` inputs, `border-corthex-border-input`

---

### Page 7: Departments (`/departments`) — Mobile
**Layout:** Card list + full-screen detail

**Sections to generate:**
1. **Department cards** — Single column
   - Icon, name, agent count, description preview
   - `bg-corthex-surface border border-corthex-border rounded-xl p-4 shadow-sm`
   - Tap → full-screen detail view
2. **FAB** — "새 부서" (`Plus` icon)
3. **Department detail view** — Full screen (push navigation)
   - Back button, department header
   - Agent roster (horizontal scroll of mini-cards)
   - Performance metrics
   - Knowledge items
   - Edit/Delete buttons at bottom
4. **Empty state** — "첫 번째 부서를 만들어보세요" + create button

---

### Page 8: Tiers (`/tiers`) — Mobile
**Layout:** Single column card list

**Sections to generate:**
1. **Tier cards** — Stacked vertically, highest first
   - Level number large: `text-xl font-bold font-mono`
   - Name, model name (`font-mono`), agent count
   - Tap → edit bottom sheet
2. **FAB** — "새 티어" (`Plus` icon)
3. **Edit bottom sheet** — Form with level, name, model, max depth

---

### Page 9: Jobs (`/jobs`) — Mobile
**Layout:** Tabbed + card list

**Sections to generate:**
1. **Tabs** — Full-width segmented control
   - Active Jobs, ARGOS, History
2. **Active Jobs** — Card list with progress bars
   - Agent avatar, task name, progress bar, elapsed time
   - Swipe-left to cancel
3. **ARGOS** — Card list with toggle switches
   - Schedule in `font-mono`, next run time
   - Toggle to enable/disable
4. **History** — Card list (not table)
   - Job name, agent, duration, cost (`font-mono`), status badge
   - Pull-to-refresh
5. **Job detail** — Bottom sheet on tap

---

### Page 10: Workflows (`/workflows`) — Mobile
**Layout:** Card list (editor is desktop-only)

**Sections to generate:**
1. **Workflow cards** — Single column
   - Name, step count badge, status badge, last run
   - Tap → workflow detail view (read-only on mobile)
2. **FAB** — "새 워크플로우" (`Plus` icon)
3. **Workflow detail** — Full-screen push view
   - Linear step list (vertical, not canvas-based)
   - Step cards: step number, type icon, agent, description
   - Run/Stop buttons at bottom
4. **Desktop-only notice** — Banner in editor:
   - `bg-corthex-info/10 border border-corthex-info/30 rounded-lg p-3`
   - "워크플로우 편집은 데스크톱에서 이용해주세요"

---

## Batch 3: Intelligence (5 pages)

### Page 11: Knowledge (`/knowledge`) — Mobile
**Layout:** Card list + bottom sheet detail

**Sections to generate:**
1. **Search bar** — Full-width, semantic search
   - Placeholder: "의미 기반 검색..."
2. **Filter tabs** — Horizontal scroll (All, Docs, URLs, Text)
3. **Knowledge cards** — Single column
   - Type icon, title, source, department tag
   - Relevance score if searching (in `font-mono`)
4. **Detail bottom sheet** — Full content preview
   - Metadata, assigned departments, related items
   - Actions: Edit, Re-embed, Delete
5. **Upload FAB** — `Upload` icon
   - Opens upload bottom sheet with file picker

---

### Page 12: Reports (`/reports`) — Mobile
**Layout:** Tabbed + card-based

**Sections to generate:**
1. **Tabs** — Quality Reviews, Performance, Costs (horizontal scroll)
2. **Quality Reviews** — Expandable accordion cards
   - Test name, agents compared, winner badge
   - Tap to expand full comparison
3. **Performance** — Agent metric cards
   - Mini metric grid (2×2) per agent
   - Horizontal scroll through agents
4. **Cost Reports** — Summary cards (not table)
   - Department/agent/model cost cards
   - Total prominently displayed
5. **Export** — Bottom sheet with format options

---

### Page 13: Trading (`/trading`) — Mobile
**Layout:** Tabbed panels (4 tabs replace 2×2 grid)

**Sections to generate:**
1. **Timeframe selector** — Horizontal scroll of time buttons
   - `flex gap-1 overflow-x-auto`
2. **Tab bar** — Chart, Book, Positions, History
3. **Chart tab** — Full-width chart, height 300px
   - Price: `text-xl font-bold font-mono`
   - Landscape mode hint for better view
4. **Order Book tab** — Compact buy/sell list
   - Color-coded: `text-corthex-success` (buy), `text-corthex-error` (sell)
   - Prices in `font-mono`
5. **Positions tab** — Card list of open positions
   - P&L with semantic colors
6. **History tab** — Transaction list
   - Compact rows with essential info only

---

### Page 14: Performance (`/performance`) — Mobile
**Layout:** Single column, stacked charts

**Sections to generate:**
1. **Date picker** — Compact date range selector
2. **KPI scroll strip** — Horizontal scrollable metric cards
   - `min-w-[130px]` each
3. **Response time chart** — Full-width, 200px height
   - Simplified (P50 only, P95/P99 in a toggle)
4. **Error summary** — Compact cards by error type
   - Count + percentage
5. **Top agents** — Ranked list (top 5)
   - Rank number, name, score bar

---

### Page 15: Costs (`/costs`) — Mobile
**Layout:** Single column, summary-first

**Sections to generate:**
1. **Budget hero card** — Full-width at top
   - Total spend vs budget, large progress bar
   - Remaining amount in `text-2xl font-bold font-mono`
   - Percentage indicator
2. **Breakdown tabs** — By Model, By Department, By Agent
   - Horizontal tab bar
3. **Breakdown cards** — Sorted by cost descending
   - Name, cost value (`font-mono`), percentage bar
   - `bg-corthex-surface border border-corthex-border rounded-xl p-3 shadow-sm`
4. **Daily chart** — Compact area chart, 160px height
5. **Cost alerts** — Warning cards at top (if any)
   - `border-l-4 border-corthex-warning` or `border-corthex-error`

---

## Batch 4: Social & Communication (5 pages)

### Page 16: Messenger (`/messenger`) — Mobile
**Layout:** Full-screen chat (identical paradigm to Chat)

**Sections to generate:**
1. **Channel list** (default view when no channel selected)
   - Channels with `#` prefix, unread badge, last message preview
   - Direct messages section
   - Search at top
   - Tap → opens channel
2. **Channel view** — Full-screen messages
   - Channel header with back arrow, name, member count
   - Messages list
   - Input bar (above bottom nav)
3. **Member list** — Accessible via header icon
   - Opens as bottom sheet
4. **New channel** — Bottom sheet form

---

### Page 17: SNS (`/sns`) — Mobile
**Layout:** Full-width feed

**Sections to generate:**
1. **Feed** — Full-width card list (no max-width constraint on mobile)
   - Post cards: `bg-corthex-surface border border-corthex-border rounded-xl p-4 shadow-sm mb-3`
   - Agent avatar, name, department, time ago
   - Content, reactions, comments
2. **Post composer** — FAB opens bottom sheet
   - Textarea, agent selector, tags, "게시" button
3. **Pull-to-refresh** for new posts
4. **Infinite scroll** with loading spinner

---

### Page 18: Agora (`/agora`) — Mobile
**Layout:** Card list + full-screen debate view

**Sections to generate:**
1. **Debate cards** — Single column
   - Topic, participant avatars (stacked), status badge, comment count
   - Tap → full-screen debate view
2. **Debate view** — Full-screen push navigation
   - Topic header
   - Arguments as alternating cards (no pro/con columns — single column)
   - Each argument: colored left border (pro=accent, con=error), agent, text, votes
   - Vote buttons at bottom of each argument
3. **FAB** — "새 토론" (`Plus` icon)

---

### Page 19: Activity Log (`/activity-log`) — Mobile
**Layout:** Full-width timeline

**Sections to generate:**
1. **Filter** — Collapsible filter bar (tap to expand)
   - Date selector, event type chips
2. **Timeline** — Simplified single-column
   - Date headers
   - Event cards: icon dot + one-line title + time ago
   - Tap to expand details
3. **Pull-to-refresh** + infinite scroll
4. **Empty state** — "이 기간에 활동이 없습니다"

---

### Page 20: Ops Log (`/ops-log`) — Mobile
**Layout:** Full-width log feed

**Sections to generate:**
1. **Severity filter** — Horizontal scroll chips
   - Color-coded: Info (blue), Warning (amber), Error (red), Critical (red bold)
2. **Log entries** — Compact cards
   - Severity icon, message (truncated), timestamp
   - Tap to expand full message + stack trace
   - Source in `font-mono text-xs`
3. **Auto-refresh toggle** — In header
4. **Stats bar** — Sticky at top: error/warning counts

---

## Batch 5: Tools & System (4 pages)

### Page 21: Settings (`/settings`) — Mobile
**Layout:** Full-screen sections (no side tab navigation)

**Sections to generate:**
1. **Settings menu** — Full-width list of setting categories
   - Each: icon + label + chevron right
   - `bg-corthex-surface rounded-xl` grouped cards
   - Groups: Account (Profile, Security), Organization (Company, API Keys, Models), Preferences (Budget, Notifications, Appearance), System (Integrations, About)
2. **Setting detail** — Each category opens as push navigation
   - Back button + title
   - Form fields stacked vertically
   - All inputs `h-11`, full-width
   - Toggle switches right-aligned
3. **Theme selector** — Grid of theme swatches (2×3)
   - Each swatch: small color preview + name
   - Active: border accent ring
4. **Save** — Sticky bottom button

---

### Page 22: Classified (`/classified`) — Mobile
**Layout:** Card list + full-screen viewer

**Sections to generate:**
1. **Security banner** — Full-width warning
   - `bg-corthex-warning/10 border border-corthex-warning/30 rounded-lg p-3 mb-4`
2. **Document list** — Cards with lock icon, title, classification badge
3. **Document viewer** — Full-screen push view on tap
   - Back button, document content
   - Access log at bottom

---

### Page 23: Files (`/files`) — Mobile
**Layout:** Single column file list (no folder tree)

**Sections to generate:**
1. **Breadcrumb** — Horizontal scroll with path segments
   - `flex items-center gap-1 overflow-x-auto text-sm`
2. **File/folder list** — Single column
   - Folders first (folder icon, name, item count)
   - Files below (type icon, name, size in `font-mono`, date)
   - Tap folder → navigate into
   - Tap file → detail bottom sheet (preview, download, delete)
3. **Upload FAB** — `Upload` icon
4. **Storage indicator** — Compact bar at top

---

### Page 24: Redirect (`/` → `/hub`)
**No page to generate.** Redirect handled by router.

---

## Mobile Component Library Reference

### Bottom Navigation Bar
```tsx
<nav className="fixed bottom-0 left-0 right-0 z-30
                bg-corthex-bg border-t border-corthex-border
                flex items-center justify-around h-14"
     aria-label="Main navigation">
  {tabs.map(tab => (
    <a className={cn(
      "flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
      isActive ? "text-corthex-text-primary" : "text-corthex-text-tertiary"
    )} aria-current={isActive ? "page" : undefined}>
      {isActive && <div className="absolute top-0 w-8 h-0.5 bg-corthex-accent rounded-full" />}
      <tab.icon className="w-6 h-6" aria-hidden="true" />
      <span className="text-xs">{tab.label}</span>
    </a>
  ))}
</nav>
```

### Floating Action Button (FAB)
```tsx
<button className="fixed bottom-20 right-4 z-30
                   w-14 h-14 rounded-full
                   bg-corthex-accent text-corthex-text-on-accent
                   shadow-lg flex items-center justify-center
                   hover:bg-corthex-accent-hover
                   focus:outline-none focus:ring-2 focus:ring-corthex-focus focus:ring-offset-2"
        aria-label="Create new">
  <Plus className="w-6 h-6" />
</button>
```

### Bottom Sheet
```tsx
<div className="fixed inset-0 z-40">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-corthex-chrome/40" />
  {/* Sheet */}
  <div className="absolute bottom-0 left-0 right-0
                  bg-corthex-surface border-t border-corthex-border
                  rounded-t-2xl max-h-[90vh] overflow-y-auto">
    {/* Drag handle */}
    <div className="flex justify-center pt-2 pb-4">
      <div className="w-10 h-1 bg-corthex-border-strong rounded-full" />
    </div>
    {/* Content */}
    <div className="px-4 pb-8">
      {children}
    </div>
  </div>
</div>
```

### Mobile Card
```tsx
<div className="bg-corthex-surface border border-corthex-border rounded-xl p-4 shadow-sm">
  {/* Card content */}
</div>
```

### Pull-to-Refresh Indicator
```tsx
<div className="flex justify-center py-4">
  <Loader2 className="w-5 h-5 text-corthex-accent animate-spin" aria-label="Loading" />
</div>
```

---

## Appendix: Mobile Stitch Generation Checklist

Before submitting each batch to Stitch 2:

- [ ] DESIGN.md loaded as design system
- [ ] Mobile viewport (375px) — single column layouts
- [ ] No sidebar rendered — bottom nav + drawer pattern
- [ ] All touch targets >= 44px height
- [ ] FAB positioned `fixed bottom-20 right-4` (above bottom nav)
- [ ] Cards have `shadow-sm` for outdoor visibility
- [ ] Content padding: `p-4` (16px) not `p-8` (32px)
- [ ] Horizontal scroll for filter chips/metric cards (with `-mx-4 px-4` bleed)
- [ ] Bottom sheets replace desktop modals
- [ ] Inputs: `h-11` height, `border-corthex-border-input`
- [ ] `font-mono` on all costs, IDs, timestamps, code
- [ ] `aria-hidden="true"` on decorative icons
- [ ] `aria-label` on icon-only buttons and FAB
- [ ] Status: color + icon + text (never color alone)
- [ ] No hardcoded hex — all `corthex-*` tokens
- [ ] `prefers-reduced-motion` CSS block included
- [ ] `<main role="main" id="main-content">` wrapping content
- [ ] `<nav aria-label="Bottom navigation">` on bottom nav
- [ ] `aria-current="page"` on active bottom tab
- [ ] `aria-live="polite"` on streaming text and notification badges
- [ ] Chat timestamps OUTSIDE bubbles (below, matching bubble alignment)
- [ ] Placeholder text: `placeholder:text-corthex-text-tertiary` (#756e5a) — NOT #475569
- [ ] Tier badges use `rounded-full`
- [ ] Success ≈ accent disambiguation (success = icon+text, active = bg tint only)
- [ ] Mobile cards: `shadow-sm` + `border` allowed (outdoor visibility exception)

---

*End of App Stitch Prompts — Phase 5-Prompts, Step 5-3*
