# Web Dashboard Layout — Deep Analysis & Design Principles Scoring

**Phase:** 2-Analysis, Step 2-1
**Date:** 2026-03-23
**Author:** UXUI Writer (Phase 2 Deep Analysis)
**Input:** Phase 1 Web Layout Research (3 options), Vision & Identity, Technical Spec, Design Principles Skill
**Scoring Framework:** Design Principles Checklist + Gestalt Psychology + UX Heuristics
**Target:** CORTHEX v3 CEO App — 23-page AI Agent Orchestration Dashboard

---

## 0. Scoring Methodology

Each option is evaluated across **6 design principle categories** (10 points each = **60 total**), plus a **Framework Implementation Spec** (descriptive, not scored).

| # | Category | Max | What We Evaluate |
|---|----------|-----|-----------------|
| 1 | Gestalt Compliance | /10 | Proximity, similarity, continuity, closure, figure/ground |
| 2 | Visual Hierarchy | /10 | Blur test, focal point clarity, information layering |
| 3 | Golden Ratio & Proportion | /10 | Sidebar:content ratio, heading:body scale, spacing progressions |
| 4 | Contrast | /10 | Size, color, weight, spacing differentiation |
| 5 | White Space + Unity | /10 | Breathing room, consistency, cohesion, design token adherence |
| 6 | UX Deep Dive | /10 | IA quality, cognitive load (Miller's 7±2), Fitts's Law, Hick's Law |

**Grading Scale:**
- 9-10: Exceptional — sets a new standard
- 7-8: Strong — minor gaps only
- 5-6: Adequate — functional but improvable
- 3-4: Weak — significant design issues
- 1-2: Critical — fundamental violations

---

### IA Context Note
The current codebase sidebar (`packages/app/src/components/sidebar.tsx`) uses **4 sections** (COMMAND 4, ORGANIZATION 5, TOOLS 7, SYSTEM 6 = 22 items). All three options below propose **regrouped IA** (5-6 sections) as part of the redesign. Section counts in this analysis reflect *proposed IA*, not current code state.

---

## 1. Option A: "Linear Classic" — Fixed Sidebar + Minimal Topbar

**Inspiration:** Linear, Notion, Vercel
**Philosophy:** Maximum content area. Sidebar is primary navigation; topbar is utility only.

### 1.1 Gestalt Compliance — Score: 6/10

#### Proximity
The Linear Classic groups all 23 nav items into 6 labeled sections (COMMAND, ORGANIZATION, TOOLS, INTELLIGENCE, SOCIAL, SYSTEM) with section-header dividers. This is correct application of proximity — related items cluster together with `space-y-2` (8px) internally and visual separators between groups.

**Issue:** The spacing between section groups relies solely on a horizontal rule divider + section header text. There is no increased vertical gap (e.g., `space-y-8` between groups vs `space-y-2` within). The divider line carries the entire grouping burden. When scrolling rapidly, the eye cannot distinguish group boundaries by whitespace alone — the divider line must be consciously read, which adds cognitive overhead.

**Prescription:** Use 24px (`space-y-6`) between section groups and 4px (`space-y-1`) within groups. The 6:1 spacing ratio creates unmistakable proximity grouping without requiring explicit dividers.

#### Similarity
All nav items share identical treatment: Lucide icon (20px) + text label (14px, Inter 400). Active state uses `white/15` background + `font-weight: 500` + white text. This is correct similarity — same element type = same visual treatment.

**Issue:** No visual differentiation between page types. Hub (streaming chat), NEXUS (React Flow canvas), Dashboard (metric grid), and Settings (form tabs) all look identical in the sidebar. The user's only signal for what kind of page awaits is the text label. This violates the similarity principle's corollary: *different categories should be visually distinct*.

#### Continuity
The vertical sidebar creates a strong top-to-bottom reading flow. The eye follows the left edge alignment naturally. Section headers break the flow intentionally to signal group transitions. Content area has its own reading flow (left-to-right, top-to-bottom).

**Assessment:** Strong continuity. No broken reading paths.

#### Closure
The sidebar as a dark (#283618) rectangle creates implicit closure — no explicit border is needed on the right edge because the color contrast with cream (#faf8f5) content provides figure/ground separation. The topbar's bottom border (`1px solid #e5e1d3`) provides closure for the header zone.

**Assessment:** Good closure via color contrast rather than explicit borders.

#### Figure/Ground
Dark olive sidebar (#283618) vs cream content (#faf8f5) creates strong figure/ground separation. The contrast ratio between these surfaces is absolute — no ambiguity about where navigation ends and content begins.

**Issue:** Within the content area, cards on cream background rely on `border-primary` (#e5e1d3) for definition. The border color has only 1.15:1 contrast against the cream background — cards may appear to "float" ambiguously rather than sit as clear figures. Surface cards (`#f5f0e8`) improve this to 1.08:1 luminance difference, which is minimal.

**Subtotal Analysis:** Strong in continuity and closure, adequate in proximity and similarity, minor figure/ground concern in content area.

---

### 1.2 Visual Hierarchy — Score: 6/10

#### Blur Test (50% Gaussian)
When blurred at 50%, the Option A layout reveals:

1. **Primary focal point:** The dark sidebar block is the most prominent element — it's the largest contiguous dark area. This is *wrong* — the sidebar is navigation, not content. The content area should be the primary focal point.
2. **Secondary:** The topbar blurs into a thin light line — barely distinguishable from the content area below it. Topbar utility items (search, bell, avatar) disappear entirely.
3. **Content area:** Metric cards blur into uniform light rectangles. Without color accents or size variation, nothing in the content area pulls attention.

**Diagnosis:** The sidebar dominates visual weight because it's the darkest, largest element. The content area — where the CEO spends 90% of their time — is visually subordinate. This inverts the correct hierarchy for a dashboard application.

**Mitigation required:** Content area must contain elements with sufficient visual weight (chart colors, metric card size variation, accent-colored indicators) to counterbalance the dark sidebar. The sidebar itself should feel like a quiet frame, not the main event.

#### Information Layering
- **Layer 1 (Structure):** Sidebar + topbar frame — always visible, never changes
- **Layer 2 (Page identity):** Topbar title text — identifies current page
- **Layer 3 (Content):** Page-specific content — changes per route

The 3-layer hierarchy is clean but shallow. There's no visual distinction between Layer 1 and Layer 2 (topbar is part of the frame but also carries page identity). Deeper content hierarchies within pages (metric cards → chart → detail table) are left entirely to per-page implementation.

#### Scale Hierarchy
The type scale from Vision §4.2 applies:
- Sidebar brand: 18px/600 → adequate
- Nav items: 14px/400 → correct (subordinate to brand)
- Page title: 18px/600 (topbar) → same as sidebar brand — creates competition
- Content headings: 24px/600 → larger than page title — good
- Body text: 14px/400 → correct subordination

**Issue:** Page title (18px) and sidebar brand (18px) are the same size and weight. Neither dominates. The CEO scans the topbar for "where am I?" but the brand logo competes for the same attention level.

---

### 1.3 Golden Ratio & Proportion — Score: 7/10

#### Sidebar:Content Ratio
At 1440px viewport:
- Sidebar: 280px
- Content: 1160px (1440 - 280)
- Ratio: 1160/280 = **4.14:1**

Golden ratio target: 1:1.618 → sidebar should be ~38.2% of the smaller segment.
Actual: sidebar is 19.4% of total width.

**Analysis:** This is wider than golden ratio would suggest (a golden-ratio sidebar at 1440px would be ~545px / 895px). However, for dashboard UIs, the industry standard (Linear 224px, Notion 224px, shadcn 256px) favors a narrower sidebar (15-20% of viewport). The 280px choice is justified by Korean text requirements (+20% longer than English). The 4.14:1 ratio creates appropriate content dominance.

**Score impact:** Not golden ratio, but correctly prioritizes content space. The ratio is intentional for the use case, not arbitrary.

#### Heading:Body Type Ratio
- Page heading (24px) : body (14px) = 1.714:1 — close to golden ratio (1.618)
- Section heading (18px) : body (14px) = 1.286:1 — below golden ratio
- Hero heading (32px) : body (14px) = 2.286:1 — above golden ratio

The Major Third type scale (1.250 ratio between steps) creates harmonious proportions. The 24px→18px→16px→14px→12px progression follows a consistent ratio.

#### Spacing Progression
The 8px grid creates a clean progression: 4→8→12→16→24→32→48→64px.
- Card padding: 16px (2 units)
- Section gap: 24px (3 units)
- Page margin: 24px (3 units)

**Issue:** Card padding (16px) and page margin (24px) are only 1.5:1 ratio — too close. Page margin should be at least 2:1 vs card padding to create clear spatial hierarchy. Recommendation: page padding 32px (4 units) for 2:1 ratio.

---

### 1.4 Contrast — Score: 6/10

#### Size Contrast
The Linear Classic relies heavily on uniform sizing. Nav items are all 14px. Cards in the dashboard are typically equal-sized grid cells. There is minimal size variation to create visual interest or indicate importance.

**Issue:** Dashboard metric cards (e.g., today's cost, agent count, task count) are all the same size. A CEO should see the most critical metric (e.g., daily cost, which directly impacts budget) larger than secondary metrics. Equal sizing communicates equal importance, which is rarely accurate.

**Prescription:** Primary metric card should be 1.5-2x the width of secondary cards. Use `grid-template-columns: 2fr 1fr 1fr` to create a feature card + supporting cards pattern.

#### Color Contrast
- Sidebar text (#a3c48a) on sidebar bg (#283618): **6.63:1** — WCAG AAA pass
- Primary text (#1a1a1a) on cream (#faf8f5): **16.5:1** — excellent
- Secondary text (#6b705c) on cream (#faf8f5): **4.7:1** — WCAG AA pass (barely)
- Tertiary text (#756e5a) on cream (#faf8f5): **4.5:1** — WCAG AA pass (borderline)
- Active nav (white) on sidebar (#283618): **12.64:1** — excellent

**Issue:** The gap between secondary (4.7:1) and tertiary (4.5:1) text is only 0.2:1. These two levels are functionally indistinguishable to many users, especially those with mild vision impairment. Effective contrast hierarchy requires at least 1.5:1 ratio between adjacent levels.

#### Weight Contrast
Font weights: 400 (body) → 500 (nav active, emphasis) → 600 (headings) → 700 (brand).
The 100-unit weight steps are the minimum perceptible difference. The 400→500→600 progression is subtle — many users won't distinguish 500 from 600 at 14px.

**Prescription:** Consider using 400→500→700 (skip 600) for a more perceptible weight hierarchy, or combine weight with size contrast.

#### Spacing Contrast
Internal card spacing (16px) vs between-card spacing (24px) = 1.5:1 ratio. This is the minimum for spatial grouping. Between-section spacing should be 2-3x internal spacing for clear hierarchy.

---

### 1.5 White Space + Unity — Score: 7/10

#### White Space
The 24px content padding and 24px gap between grid items provide adequate breathing room. The cream (#faf8f5) background is inherently "airy" — the warm light tone registers as open space even when elements are moderately dense.

**Strengths:**
- Content area has max-width 1440px with auto margins — prevents content from stretching on ultra-wide monitors
- 24px padding is generous for dashboard content
- Section gaps (24px) prevent cards from feeling cramped

**Weaknesses:**
- Sidebar spacing is tight: nav items at `py-2 px-3` (8px/12px) with only 4px between items. On a 22-item sidebar, this creates a dense wall of text.
- No whitespace variation — every section gap is 24px, creating monotony. Important sections should have more breathing room (32-48px above section headers)

#### Unity
- **Color unity:** Sovereign Sage palette applied consistently — olive sidebar, cream content, sage accents. No rogue colors.
- **Border radius unity:** All cards use `radius-lg` (12px), all buttons use `radius-md` (8px), all badges use `radius-sm` (4px). Consistent.
- **Shadow unity:** Minimal shadows — only elevation-based. Cards use `shadow-sm` on cream background. Consistent with the "flat + border" philosophy from Vision §5.3.
- **Icon unity:** All Lucide React, 20px nav, 16px buttons, 24px headers. `currentColor` inheritance. Consistent.
- **Type unity:** Inter for all UI, JetBrains Mono for data values. No third font in main views.

**Assessment:** Strong unity. The Natural Organic design system tokens are applied systematically. The only unity concern is the sidebar's tight spacing breaking the otherwise generous spacing rhythm of the content area.

---

### 1.6 UX Deep Dive — Score: 5/10

#### Information Architecture (IA)
The sidebar presents 22 nav items across 6 groups. Each group has a visible section header. The CEO must scan all items to find their target page.

**Problem — Card Sorting Misalignment:**
The grouping assigns Trading to INTELLIGENCE, but Trading is more naturally a TOOLS function (it's a multi-panel operational interface, not an analytics page). Similarly, SketchVibe under TOOLS could be TOOLS or a separate CREATIVE group. The IA doesn't reflect task-based mental models.

**Problem — Flat hierarchy with no progressive disclosure:**
All 22 items are visible simultaneously. Unlike Notion (which hides pages under expandable groups) or Linear (which uses customizable sidebar sections), Option A shows everything. This means the CEO processes all 22 items on every sidebar glance.

#### Cognitive Load — Miller's Law (7±2)
- COMMAND: 4 items — within threshold
- ORGANIZATION: 5 items — within threshold
- TOOLS: 4 items — within threshold
- INTELLIGENCE: 5 items — within threshold
- SOCIAL: 4 items — within threshold
- SYSTEM: 3 items (Classified, Settings, User) — within threshold

Individual groups pass Miller's Law, but the *total visible items* (22) far exceeds the 7±2 threshold. The CEO must chunk across 6 groups + 22 items = 28 cognitive units. This is manageable for expert users (who develop spatial memory for item positions) but hostile to new users.

**Hick's Law Impact:** Decision time = b × log₂(n + 1) where n = number of choices. With 22 visible options, decision time is proportional to log₂(23) ≈ 4.52 units. Reducing visible options to 7 (via progressive disclosure) cuts to log₂(8) ≈ 3.0 units — a **33% reduction** in decision time.

#### Fitts's Law
Fitts's Law: T = a + b × log₂(1 + D/W) where D = distance to target, W = target width.

- **Nav items:** 280px wide × 36px tall (8px padding + 20px content). Target width is generous — good Fitts's compliance.
- **Topbar actions:** Search, bell, avatar are 32px × 32px icons at the far-right edge of the screen. Distance from content area center to topbar-right is ~600px on 1440px viewport. Small targets + large distance = slow acquisition time.
- **Content area interactions:** Cards, buttons, and inputs within the content area are close to the user's focus point — good Fitts's compliance for within-page tasks.

**Key concern:** The topbar is the worst Fitts's Law violator. Critical actions (search, notifications) are in the top-right corner — the farthest point from where the CEO's cursor typically rests (content area center). This is why Cmd+K command palette is essential — it brings search to the keyboard, bypassing the Fitts's Law penalty entirely.

#### Hick's Law Application
With no Cmd+K palette in the basic Linear Classic, the CEO faces:
- Sidebar: 22 visible options → log₂(23) ≈ 4.52 Hick's units
- No progressive disclosure → all options always visible
- No search → full linear scan required

**Verdict:** Option A without Cmd+K is a Hick's Law violation for 22+ items. With Cmd+K added, the penalty is partially mitigated (keyboard users bypass the sidebar entirely), but mouse users still face the full sidebar scan.

---

### 1.7 Framework Implementation Spec

#### Component Tree
```tsx
<AppShell data-sidebar={sidebarState}>          // CSS Grid container
  <Sidebar>                                      // grid-area: sidebar
    <SidebarBrand />                             // CORTHEX v3 + collapse toggle
    <SidebarSearch />                            // Cmd+K trigger
    <SidebarNav>                                 // <nav aria-label="Main navigation">
      <NavSection label="COMMAND">               // section header (12px uppercase)
        <NavItem to="/hub" icon={Home} />        // <NavLink> wrapper
        <NavItem to="/dashboard" icon={BarChart3} />
        <NavItem to="/nexus" icon={Network} />
        <NavItem to="/chat" icon={MessageSquare} />
      </NavSection>
      <NavSection label="ORGANIZATION">
        <NavItem to="/agents" icon={Bot} />
        <NavItem to="/departments" icon={Building2} />
        <NavItem to="/jobs" icon={Calendar} />
        <NavItem to="/tiers" icon={Layers} />
        <NavItem to="/reports" icon={FileText} />
      </NavSection>
      {/* ... TOOLS, INTELLIGENCE, SOCIAL sections */}
    </SidebarNav>
    <SidebarFooter>                              // bottom-pinned
      <NavItem to="/classified" icon={Lock} />
      <NavItem to="/settings" icon={Settings} />
      <SidebarUserMenu />                        // avatar + name + dropdown
    </SidebarFooter>
  </Sidebar>
  <Topbar>                                       // grid-area: topbar
    <TopbarTitle>{pageTitle}</TopbarTitle>        // dynamic per route
    <TopbarActions>
      <SearchButton />                           // opens Cmd+K
      <NotificationBell count={unreadCount} />   // badge
      <UserAvatar />                             // dropdown menu
    </TopbarActions>
  </Topbar>
  <ContentArea>                                  // grid-area: content
    <ContentInner>                               // max-w-1440, mx-auto, p-6
      <Outlet />                                 // React Router outlet
    </ContentInner>
  </ContentArea>
</AppShell>
```

#### Key CSS Classes (Tailwind v4)
```css
/* App Shell */
.app-shell       → grid grid-cols-[280px_1fr] grid-rows-[56px_1fr] h-dvh overflow-hidden
.app-shell[collapsed] → grid-cols-[56px_1fr]

/* Sidebar */
.sidebar         → flex flex-col bg-[#283618] text-[#a3c48a] overflow-y-auto overflow-x-hidden
.nav-item        → flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
.nav-item:hover  → bg-white/10
.nav-item[active]→ bg-white/15 font-medium text-white

/* Topbar */
.topbar          → flex items-center justify-between px-6 bg-[#faf8f5] border-b border-[#e5e1d3]

/* Content */
.content         → overflow-y-auto bg-[#faf8f5]
.content-inner   → max-w-[1440px] mx-auto p-6
```

#### TypeScript Props
```typescript
interface AppShellProps {
  sidebarState: 'expanded' | 'collapsed';
  onSidebarToggle: () => void;
}

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number;           // unread count
  isActive?: boolean;       // from useLocation()
}

interface NavSectionProps {
  label: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

interface TopbarProps {
  title: string;
  actions?: React.ReactNode;
}
```

### 1.8 Option A Summary

| Category | Score | Key Finding |
|----------|-------|-------------|
| Gestalt Compliance | 6/10 | Proximity grouping relies on dividers not whitespace; no category differentiation |
| Visual Hierarchy | 6/10 | Sidebar dominates blur test; page title competes with brand |
| Golden Ratio & Proportion | 7/10 | Content:sidebar ratio appropriate; type scale harmonious |
| Contrast | 6/10 | Secondary/tertiary text nearly identical; uniform card sizing |
| White Space + Unity | 7/10 | Good token unity; sidebar density breaks rhythm |
| UX Deep Dive | 5/10 | 22 flat items violate Hick's Law; no progressive disclosure |
| **TOTAL** | **37/60** | **Proven but generic — functional without distinction** |

---

## 2. Option B: "Notion Hybrid" — Collapsible Sidebar + Contextual Topbar

**Inspiration:** Notion, Kore.ai XO, Retool
**Philosophy:** Sidebar handles navigation; topbar adapts per page (breadcrumbs, filters, page actions).

### 2.1 Gestalt Compliance — Score: 7/10

#### Proximity
Option B uses the "Primary + More" pattern: 7 primary nav items always visible, remaining 10 behind an expandable "More..." section. Social items (Messenger, SNS, Agora, Notifications) are pinned at the bottom. This creates 3 spatial groups:

1. **Primary zone** (top): 7 core items with tight `space-y-1` (4px)
2. **Expandable zone** (middle): "More..." toggle with indented children
3. **Social zone** (bottom): 4 communication items

The 3-zone proximity is cleaner than Option A's 6-section flat list. The physical separation between zones (via dividers + spacing) creates unmistakable grouping.

**Issue:** The "More..." toggle creates a collapsible section that, when expanded, pushes the Social zone downward. On shorter viewports (1080p), the expanded "More" section + Social zone + Settings/Profile may exceed the sidebar height, causing scroll. This disrupts the spatial memory users develop for bottom-pinned items.

#### Similarity
Primary nav items (7) share identical styling: icon + label + same padding/weight. "More..." section items are indented (`pl-8`) to signal subordination — a correct application of similarity (indented = secondary).

**Strength:** The indentation creates a visual sub-hierarchy within the sidebar, differentiating primary from secondary pages without using different icon sizes or weights. This respects the similarity principle while adding meaningful variation.

#### Continuity
The vertical reading flow is maintained with a clear top-to-bottom sequence: brand → search → primary nav → More → social → settings → profile. The "More..." toggle introduces a controlled break — it's a deliberate pause point, not a random interruption.

**Topbar adds horizontal continuity:** The contextual topbar provides a left-to-right reading flow: hamburger/back → breadcrumbs → page actions → global actions. The breadcrumb trail (e.g., "Hub > Session #12") creates a path narrative — the user sees where they came from, reinforcing spatial continuity.

#### Closure
Hover-expand behavior creates a temporary closure overlay: when the sidebar is collapsed (56px icon strip), hovering expands it to 280px with a `shadow-lg` drop shadow. This shadow provides visual closure for the expanded state — the sidebar appears to "float" above the content, clearly separated.

**Issue:** The hover-expand can create closure ambiguity — when the sidebar is mid-transition (partially expanded), the user sees an incomplete form that doesn't clearly belong to either state. The `200ms` transition duration is fast enough to minimize this, but the principle is violated during the animation.

#### Figure/Ground
Same as Option A for base state: dark olive sidebar vs cream content. The hover-expand adds a z-index layering concern — the expanded sidebar overlaps the content area with `position: absolute` and `shadow-lg`. This creates a third figure layer (sidebar-float > content > sidebar-collapsed-strip), which is manageable but adds complexity to the figure/ground relationship.

---

### 2.2 Visual Hierarchy — Score: 8/10

#### Blur Test (50% Gaussian)
When blurred:

1. **Primary focal point:** Dark sidebar block still dominates (same as Option A). However, when collapsed, the sidebar is only 56px wide — significantly reduced visual weight. **In collapsed state, the content area correctly becomes the primary focal point.** This is a key advantage over Option A.
2. **Secondary:** The contextual topbar is more visible than Option A's minimal topbar because it contains page-specific actions (buttons, filters, dropdowns) that add visual weight.
3. **Content area:** Similar to Option A — dependent on per-page content design.

**Verdict:** Option B's collapsible sidebar **resolves the primary blur test failure** that limits Option A. In collapsed state (default for power users), the content area dominates correctly — a genuine hierarchy fix that Option A entirely lacks. In expanded state, the sidebar still dominates, but the user controls this toggle. This state-dependent correction elevates Option B one full tier above Option A's static hierarchy inversion.

#### Information Layering
- **Layer 1 (Frame):** Sidebar (collapsed icon strip or expanded labels) + topbar frame
- **Layer 2 (Context):** Breadcrumbs + page-specific topbar actions — tells the user *where* they are and *what they can do*
- **Layer 3 (Content):** Page content

The contextual topbar adds a meaningful Layer 2 that Option A lacks. Example: On the Agents page, the topbar shows `[+ New Agent] [Grid|List]` — immediate context about available actions without entering the content area. This is a **4-layer hierarchy** (frame → location → actions → content) vs Option A's 3-layer.

#### Scale Hierarchy
- Breadcrumb text (14px/400) < page title in breadcrumb (14px/500) < content headings (24px/600)
- The breadcrumb format "Hub > Session #12" uses a dimmed prefix ("Hub >") and a bold current page — effective scale+weight contrast within a single line.

---

### 2.3 Golden Ratio & Proportion — Score: 7/10

#### Sidebar:Content Ratio
**Expanded:** 280px : 1160px = 4.14:1 (same as Option A)
**Collapsed:** 56px : 1384px = 24.7:1

The collapsed state gives near-full-width content — excellent for canvas pages (NEXUS, SketchVibe) that need maximum viewport. The expanded state maintains the same ratio as Option A.

**Key advantage:** The user can dynamically choose between content-maximized (collapsed) and navigation-visible (expanded) ratios. This is not a fixed proportion — it's a user-controlled proportion, which is more flexible than a static golden ratio.

#### Heading:Body Type Ratio
Same type scale as Option A. The contextual topbar introduces breadcrumb text at 14px — same size as body text but with dimmed color, creating separation through color contrast rather than size.

#### Topbar Proportional Balance
The contextual topbar divides into left (breadcrumbs, ~60%) and right (actions, ~40%) zones. This roughly follows a 3:2 proportion — not golden ratio but a pleasing split. The left zone is text-heavy (breadcrumbs), the right is icon-heavy (buttons) — the asymmetry creates visual interest.

---

### 2.4 Contrast — Score: 7/10

#### Size Contrast
Same base sizing as Option A for nav items and content. The contextual topbar adds size contrast via button/action elements (varied sizes: icon buttons 32px, text buttons ~80px, dropdown triggers ~120px). This creates more visual texture in the topbar compared to Option A's minimal topbar.

**Improvement over Option A:** The topbar actions create a size-varied zone at the top of the content area, breaking the visual monotony of same-sized elements.

#### Color Contrast
Same palette and contrast ratios as Option A. The breadcrumb navigation adds:
- Breadcrumb prefix (#6b705c secondary text): 4.7:1 on cream
- Breadcrumb current (#1a1a1a primary text): 16.5:1 on cream
- The contrast difference (4.7:1 vs 16.5:1) clearly distinguishes "where you were" from "where you are"

#### Weight Contrast
Breadcrumbs: 400 (path segments) → 500 (current page). This is subtle but functional — combined with color contrast, it works.

**Hover-expand adds state contrast:** The collapsed sidebar (icon-only, 56px, minimal presence) vs expanded sidebar (labels, 280px, full presence) creates strong state-based contrast. The transition between states is dramatic enough to be clearly perceived.

#### Spacing Contrast
Topbar internal spacing: `gap-4` (16px) between action groups, `gap-2` (8px) between individual actions. This 2:1 ratio clearly groups related actions (e.g., [Filter] [Sort] as one group, [Search] [Bell] as another).

---

### 2.5 White Space + Unity — Score: 6/10

#### White Space
The "Primary + More" sidebar reduces the visible item count from 22 to ~11 (7 primary + 4 social), which reduces sidebar density by 50%. This creates more whitespace within the sidebar itself.

**Collapsed state whitespace:** When collapsed, the 56px sidebar is almost entirely whitespace with centered icons. The content area gains 224px of additional width — a significant whitespace benefit for dense pages like Trading or Costs.

**Issue:** The contextual topbar can become dense on action-heavy pages. Example: NEXUS topbar = `[☰] [NEXUS] [Zoom] [Layout] [Export] [Save] [Search] [Bell]` — 8 elements in a 56px-high bar. This violates the breathing room principle when too many page actions are loaded.

**Prescription:** Limit topbar actions to 4-5 primary items. Overflow into a "..." dropdown menu for secondary actions. Follow the Vercel pattern: at most [PageTitle] [2-3 actions] [Search] [Bell].

#### Unity
Same design token unity as Option A, with these additions:
- **Topbar unity concern [SIGNIFICANT]:** Each page has different topbar actions, which means **23 different topbar configurations**. This is not a minor gap — it is a significant design system fragmentation risk. One page has 2 actions, another has 6, another has dropdowns. Without a strict topbar template pattern (max 4 action slots, overflow into "..." menu), visual inconsistency compounds across 23 pages. The topbar becomes a per-page snowflake rather than a systematic component.
- **Hover-expand shadow:** The `shadow-lg` on hover-expand is the only instance of a large shadow in the sidebar context. Elsewhere, the sidebar has no shadow (dark background provides natural separation). This shadow feels like an outlier in the design system.

**Score rationale:** The 23-topbar fragmentation risk and hover-expand shadow outlier are not cosmetic concerns — they represent structural unity threats at scale. Score reduced from 7 to 6 to reflect the design system integrity gap.

---

### 2.6 UX Deep Dive — Score: 7/10

#### Information Architecture
The "Primary + More" pattern reduces visible items from 22 to 11. This is a significant IA improvement:
- 7 primary items → within Miller's 7±2
- 4 social items (bottom-pinned) → within threshold
- "More..." section: accessed on demand, hidden by default

**Hick's Law improvement:** log₂(12) ≈ 3.58 Hick's units (vs Option A's 4.52). That's a **21% reduction** in decision time for primary navigation.

**Issue — Discoverability trade-off:** The "More..." menu hides 10 pages (Departments, Tiers, Reports, Workflows, Knowledge, Files, SketchVibe, Costs, Trading, Activity Log). A new CEO user may not discover Departments or Tiers for days if they never click "More...". The hidden pages include organizationally critical items (Departments, Tiers) that are setup-phase essentials.

**Mitigation:** During onboarding, expand "More..." by default for the first 7 days. After the user demonstrates familiarity (visited all pages), collapse to default-hidden. Track via `localStorage` flag.

#### Cognitive Load
- Primary nav: 7 items (Hub, Dashboard, NEXUS, Chat, Agents, Jobs, Performance) — these represent the 7 most-used pages estimated from the Usage Frequency Tiers (Phase 1 §2D.3)
- Social zone: 4 items — always visible, with badge counts providing at-a-glance status
- "More" zone: only visible when expanded — load-on-demand

**Working memory demand:** 7 + 4 = 11 visible items + section labels. This is at the upper bound of comfortable chunking (7±2 per chunk, 2 chunks). Acceptable for expert users.

#### Fitts's Law
- **Sidebar nav items:** Same 280px × 36px targets as Option A — good
- **Topbar actions:** Contextual actions are closer to the relevant content than Option A's global-only topbar. Example: On the Agents page, the "+ New Agent" button is in the topbar directly above the agent list — short movement distance from content to action.
- **Breadcrumbs:** Text links in the topbar. Individual breadcrumb segments are small (~60px wide) — marginal Fitts's compliance but acceptable for infrequent use.
- **Hover-expand:** The collapsed sidebar requires the user to move to the left edge and hover, then wait for expansion. If the hover delay is too long (>300ms), it becomes a Fitts's Law penalty. If too short (<100ms), accidental triggers increase.

**Hover-expand timing analysis:**
- 100ms: too fast — accidental triggers when cursor passes through sidebar
- 150ms: borderline — some accidental triggers
- 200ms: sweet spot — intentional hover detected, accidental pass-through ignored
- 300ms: feels sluggish — user waits for sidebar to expand

**Recommendation:** 200ms hover delay with `pointer-events: none` on the collapsed sidebar for the first 100ms after page load to prevent expansion during cursor transit.

#### Hick's Law
Visible choices: 11 (7 primary + 4 social) → log₂(12) ≈ 3.58 Hick's units.
With "More" expanded: 21 items → log₂(22) ≈ 4.46 Hick's units (still high).

**Net:** 21% improvement over Option A in default state, near-parity when "More" is expanded.

---

### 2.7 Framework Implementation Spec

#### Component Tree
```tsx
<AppShell data-sidebar={sidebarState}>
  <Sidebar
    state={sidebarState}
    onHoverEnter={handleHoverExpand}
    onHoverLeave={handleHoverCollapse}
  >
    <SidebarBrand collapsed={isCollapsed} />
    <SidebarSearch />
    <SidebarNav>
      {/* Primary items — always visible */}
      <NavItem to="/hub" icon={Home} label="Hub" />
      <NavItem to="/dashboard" icon={BarChart3} label="Dashboard" />
      <NavItem to="/nexus" icon={Network} label="NEXUS" />
      <NavItem to="/chat" icon={MessageSquare} label="Chat" />
      <NavItem to="/agents" icon={Bot} label="Agents" />
      <NavItem to="/jobs" icon={Calendar} label="Jobs" />
      <NavItem to="/performance" icon={TrendingUp} label="Performance" />

      {/* Expandable "More" section */}
      <NavExpandable label="More" defaultOpen={isNewUser}>
        <NavItem to="/departments" icon={Building2} label="Departments" indented />
        <NavItem to="/tiers" icon={Layers} label="Tiers" indented />
        {/* ... remaining 8 items */}
      </NavExpandable>
    </SidebarNav>

    {/* Bottom-pinned Social zone */}
    <SidebarSocial>
      <NavItem to="/messenger" icon={MessageCircle} label="Messenger" badge={unreadMessages} />
      <NavItem to="/sns" icon={Share2} label="SNS" />
      <NavItem to="/agora" icon={Landmark} label="Agora" />
      <NavItem to="/notifications" icon={Bell} label="Notifications" badge={unreadNotifs} />
    </SidebarSocial>

    <SidebarFooter>
      <NavItem to="/classified" icon={Lock} label="Classified" />
      <NavItem to="/settings" icon={Settings} label="Settings" />
      <SidebarUserMenu user={currentUser} />
    </SidebarFooter>
  </Sidebar>

  <ContextualTopbar route={currentRoute}>
    <TopbarLeft>
      <SidebarToggle />
      <Breadcrumbs items={breadcrumbItems} />
    </TopbarLeft>
    <TopbarRight>
      {pageActions}                               {/* per-route actions */}
      <SearchButton />
      <NotificationBell count={unreadCount} />
    </TopbarRight>
  </ContextualTopbar>

  <ContentArea>
    <ContentInner>
      <Outlet />
    </ContentInner>
  </ContentArea>
</AppShell>
```

#### Contextual Topbar Configuration
```typescript
interface TopbarConfig {
  breadcrumbs: BreadcrumbItem[];
  actions: TopbarAction[];
}

// Per-route topbar configuration
const topbarConfigs: Record<string, TopbarConfig> = {
  '/hub': {
    breadcrumbs: [{ label: 'Hub' }, { label: sessionName, dynamic: true }],
    actions: [
      { type: 'dropdown', label: 'Filter', options: filterOptions },
    ],
  },
  '/agents': {
    breadcrumbs: [{ label: 'Agents' }],
    actions: [
      { type: 'button', label: 'New Agent', icon: Plus, variant: 'primary' },
      { type: 'toggle', options: ['Grid', 'List'], value: viewMode },
    ],
  },
  '/nexus': {
    breadcrumbs: [{ label: 'NEXUS' }],
    actions: [
      { type: 'button', label: 'Zoom', icon: ZoomIn },
      { type: 'button', label: 'Layout', icon: LayoutGrid },
      { type: 'button', label: 'Export', icon: Download },
      { type: 'button', label: 'Save', icon: Save },
    ],
  },
  // ... 20 more route configs
};
```

#### TypeScript Props (additions to Option A)
```typescript
interface NavExpandableProps {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

interface ContextualTopbarProps {
  route: string;
  children: React.ReactNode;
}

interface BreadcrumbItem {
  label: string;
  to?: string;               // if navigable
  dynamic?: boolean;          // if content changes per session/entity
}

interface TopbarAction {
  type: 'button' | 'dropdown' | 'toggle';
  label: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'ghost';
  options?: { label: string; value: string }[];
  value?: string;
  onClick?: () => void;
}
```

### 2.8 Option B Summary

| Category | Score | Key Finding |
|----------|-------|-------------|
| Gestalt Compliance | 7/10 | 3-zone proximity better than A; hover-expand closure concern |
| Visual Hierarchy | 8/10 | Collapsible sidebar **resolves** blur test in collapsed state; contextual topbar adds Layer 2 |
| Golden Ratio & Proportion | 7/10 | Dynamic ratio (collapsed/expanded); topbar left-right balance pleasing |
| Contrast | 7/10 | Breadcrumb contrast effective; topbar actions add visual texture |
| White Space + Unity | 6/10 | Reduced sidebar density; **23 topbar configurations = significant unity risk** |
| UX Deep Dive | 7/10 | 21% Hick's Law improvement; discoverability trade-off for hidden items |
| **TOTAL** | **42/60** | **Adaptable with clear strengths and weaknesses (σ=0.63)** |

---

## 3. Option C: "Command Center" — Dual-Zone Sidebar + Floating Command Bar

**Inspiration:** CrewAI Enterprise + Linear keyboard-first + Kore.ai widget system
**Philosophy:** CEO as commander. Sidebar is the organizational hierarchy; content area is the operational view. Floating command bar (Cmd+K) centralizes access.

### 3.1 Gestalt Compliance — Score: 8/10

#### Proximity
The dual-zone sidebar creates the strongest proximity grouping of all three options:

**Zone A (scrollable, top):** 18 nav items across 5 sections — COMMAND, ORGANIZATION, TOOLS, INTELLIGENCE, with scrollable overflow. Section headers use `16px 12px 4px` padding (16px top = 2 units gap above, 4px below = tight connection to children). This creates a **4:1 spacing ratio** between inter-group (16px) and intra-group (4px) gaps — well above the 2:1 minimum for perceptible grouping.

**Zone B (fixed bottom):** 4 real-time items (Messenger, SNS, Agora, Notifications) with `border-top: 1px solid rgba(255,255,255,0.4)`. The physical separation from Zone A is absolute — Zone B never scrolls with Zone A. This spatial permanence creates the strongest proximity signal possible: these items are *physically anchored* in a different zone.

**Assessment:** The dual-zone architecture converts sidebar navigation from a single scrolling list (Option A) into two functionally distinct regions. The brain immediately perceives Zone A as "navigation" and Zone B as "communication" — no label reading required.

#### Similarity
Same nav item styling as Options A and B (icon + label + padding + border-radius). Zone B items share the same styling as Zone A items, maintaining visual consistency.

**Strength:** Zone B items have badge counts (Messenger `[2]`, Notifications `[5]`) that visually differentiate them from Zone A items. The badges use `radius-full` (pill shape) with `semantic-error` (#dc2626) background — a strong visual signal that these items have pending attention. This is *correct application* of the similarity exception: same base treatment + attention badge = "same type, requires action."

#### Continuity
The vertical reading flow in Zone A follows the same top-to-bottom pattern. Zone B is below Zone A but separated by a border — the eye "jumps" to Zone B rather than smoothly transitioning. This jump is intentional: Zone B items are a different *category* (real-time communication) and should break the Zone A reading flow.

**Content area continuity:** The 7 layout types (dashboard grid, master-detail, canvas, CRUD, tabbed, multi-panel, feed) each maintain internal reading flows appropriate to their content type. The `max-w-1440px` container ensures content doesn't stretch beyond comfortable reading width.

#### Closure
- Sidebar: Dark olive rectangle with Zone A/B border divider — strong implicit closure
- Zone B: Bordered top + fixed bottom position — enclosed region
- Command palette: When opened, the overlay (`rgba(0,0,0,0.5)`) + centered panel (`shadow-lg`, `radius-lg`) creates a modal closure with clear figure/ground separation
- Content cards: `bg-surface` (#f5f0e8) + `border-primary` (#e5e1d3) + `radius-lg` (12px) — consistent card closure

**Assessment:** Excellent closure at every level — macro (sidebar vs content), meso (Zone A vs Zone B), micro (cards, palette).

#### Figure/Ground
Three clear layers:
1. **Ground:** Cream content area (#faf8f5) — largest area, lightest
2. **Figure:** Dark olive sidebar (#283618) — contrasting dark block
3. **Overlay:** Command palette — semi-transparent backdrop + elevated panel

The z-index hierarchy (`--z-sidebar: 20`, `--z-command-palette: 100`) is explicit and well-separated. No ambiguity about layer ordering.

**Sidebar Zone A/B:** Zone B has a subtle border-top `rgba(255,255,255,0.4)` which is at **3:1 contrast** against the olive background (WCAG 1.4.11 compliant for functional UI boundaries). This correctly separates the two sidebar regions without introducing a harsh color break.

**Figure/Ground limitation (shared with Options A and B):** The dark olive sidebar dominates the blur test as the largest contiguous dark element, creating a figure/ground hierarchy where navigation outweighs content — the same issue penalized in Options A (6/10) and B (7/10). Option C mitigates this via: (1) collapsible sidebar mode reduces sidebar weight to 56px, (2) 7 layout types enable content-area accent colors and charts to counterbalance, (3) Zone B badges add chromatic spots that enrich the sidebar's silhouette. However, these mitigations are **partial** — the resting-state figure/ground hierarchy (sidebar > content) remains inverted. This prevents a 9/10 Gestalt score. The dual-zone proximity and closure are genuinely exceptional (sub-scores: proximity 10, similarity 8, continuity 9, closure 10, figure/ground 6 → composite 8.6 → 8/10).

---

### 3.2 Visual Hierarchy — Score: 7/10

#### Blur Test (50% Gaussian)
When blurred:

1. **Primary focal point:** Same sidebar-dominance issue as Options A and B. The dark sidebar block absorbs attention. The dual-zone structure creates a marginally more complex silhouette (Zone B badges appear as colored dots), but this does not fundamentally resolve the hierarchy inversion. **The sidebar dominates the CEO's visual field in resting state (~95% of interaction time).**
2. **Secondary:** The content area benefits from the 7 layout types — a dashboard page with 3 colored metric cards and a chart creates visible color spots that pull attention away from the sidebar. The layout-specific content design counterbalances sidebar weight.
3. **Tertiary:** Command palette (when open) is the most prominent element — dark overlay + light panel in center. When active, it correctly captures 100% of attention. However, the palette is dormant 95%+ of the time — it solves hierarchy only during active use.

**Key insight:** The blur test failure is **fundamental, not minor**. Option C's 7 content layout types provide the *framework* for creating visually prominent content, but the actual implementation must use accent colors, size variation, and data visualization to counterbalance the sidebar. This is deferred responsibility, not a layout-level solution. Option C deserves higher than Option A's 6/10 because: (1) collapsible mode reduces sidebar weight (shared with Option B), (2) 7 layout types provide content-area visual weight mechanisms, (3) Zone B badges add hierarchy information. But it does not reach 8/10 ("minor gaps only") because the resting-state hierarchy inversion is a significant gap.

**Command palette as hierarchy tool:** When the CEO presses Cmd+K, the command palette overlays everything — sidebar, topbar, content. This is the *correct* hierarchy for a search/command interface: it's the most important element when active, and invisible when inactive.

#### Information Layering
- **Layer 0 (Hidden):** Command palette — dormant until ⌘K
- **Layer 1 (Frame):** Sidebar + topbar — persistent structure
- **Layer 2 (Zone):** Zone A (navigation) + Zone B (communication) — functional separation within the frame
- **Layer 3 (Content):** 7 layout types — page-specific content

Option C has **4 layers** (matching Option B's contextual topbar). The Zone A/B distinction adds a unique Layer 2 that neither A nor B has — the CEO's eye can differentiate "where do I go?" (Zone A) from "who's messaging me?" (Zone B) at the frame level, before even looking at content.

#### Scale Hierarchy
- Brand "CORTHEX v3": 18px/600 → prominent
- Section headers: 12px/600 uppercase + letter-spacing → clearly subordinate
- Nav items: 14px/400 → body-level
- Page title (topbar): 18px/600 → equal to brand (same concern as Option A)
- Content headings: 24px/600 → dominant in content area

**Badge scale:** Notification badges (e.g., `[5]`) use `text-xs` (12px) in `radius-full` pills. The small size prevents badges from overwhelming nav item labels while still being readable.

---

### 3.3 Golden Ratio & Proportion — Score: 8/10

#### Sidebar:Content Ratio
Same as Option A in expanded state: 280px : 1160px = 4.14:1.
Same collapsed state as Option B: 56px : 1384px = 24.7:1.

The proportions are identical, but Option C adds an internal ratio:

**Zone A:Zone B Ratio:**
- Zone B: 4 items × 40px + 16px padding = ~176px
- Zone A: sidebar height - brand(~56px) - search(~40px) - Zone B(~176px) - footer(~120px) = varies by viewport
- At 1080p: Zone A ≈ 688px, Zone B ≈ 176px → ratio 3.91:1
- At 1440p: Zone A ≈ 1048px, Zone B ≈ 176px → ratio 5.95:1

The Zone A:Zone B ratio varies with viewport height, but Zone B is always a visually subordinate strip — typically 15-20% of sidebar height. This creates an asymmetric sidebar composition with a clear "main area" and "utility strip" — reminiscent of the golden ratio's major/minor segment division.

#### Content Layout Proportions
The 7 layout types each define their own internal proportions:

| Layout | Primary:Secondary | Golden? |
|--------|------------------|---------|
| Dashboard grid | 1:1:1 (3-col equal) | No — equal columns |
| Master-detail | 280px : flex-1 ≈ 1:4.1 | Similar to sidebar:content |
| Canvas | 100% : 0 (full bleed) | N/A |
| CRUD | 100% (single column) | N/A |
| Tabbed | 100% (tab content fills) | N/A |
| Multi-panel | 1:1 / 1:1 (2×2 grid) | No — equal panels |
| Feed | 720px centered | Centered column |

**Observation:** Most layout types use equal proportions (1:1, 1:1:1) rather than golden ratio. This is appropriate for data-dense pages where equal treatment is correct. The master-detail layout (Hub, Chat, Messenger) uses the same 280px:flex-1 ratio as the sidebar, creating **spatial rhyme** — a design unity technique where similar proportions repeat at different scales.

#### Spacing Progression
Zone A internal spacing:
- Between nav items: 4px (`space-y-1`)
- Section header padding: 16px top, 4px bottom
- Between sections: effectively 20px (16px header + 4px gap)
- Zone A padding: 16px 12px

This creates a **5:1 ratio** between section spacing (20px) and item spacing (4px) — exceeding the golden ratio (1.618) for excellent perceptual grouping.

---

### 3.4 Contrast — Score: 8/10

#### Size Contrast
Option C's 7 layout types inherently create size contrast within the content area:
- Dashboard: metric cards (variable sizes possible) + charts (large area)
- Master-detail: narrow session list + wide chat area
- Multi-panel: 4 equal-sized panels (Trading) — less size contrast
- Feed: narrow centered column with wider whitespace margins

The content diversity across page types ensures the CEO encounters different visual rhythms as they navigate — preventing the monotony risk of Option A's single-pattern approach.

#### Color Contrast
Same WCAG-compliant palette as Options A and B. Option C adds:

- **Zone B badge colors:** `semantic-error` (#dc2626) on dark olive (#283618) = **7.28:1** — strong attention signal
- **Command palette:** `bg-surface` (#f5f0e8) panel on `rgba(0,0,0,0.5)` overlay — high contrast modal
- **Command palette input border:** `border-primary` (#e5e1d3) on `bg-surface` (#f5f0e8) — subtle but visible

**Focus ring concern (from Phase 1 research):** `accent-primary` (#606C38) on dark olive sidebar (#283618) = **2.27:1** — FAILS WCAG 1.4.11 (needs 3:1). The Phase 1 recommendation to use `text-chrome` (#a3c48a) at 6.63:1 as a sidebar-specific focus ring override is correct and critical for keyboard accessibility.

#### Weight Contrast
Same font weight system as Options A and B. The command palette adds:
- Group headers (12px/600 uppercase): clearly subordinate to item labels (14px/400)
- Selected item: highlighted via background color change, not weight — correct (avoids layout shift from weight change)

#### Spacing Contrast
The dual-zone architecture creates the strongest spacing contrast of all options:
- Within Zone A: 4px between items (tight)
- Zone A to Zone B separator: `border-top` + 8px padding = visual break
- Zone B internal: 4px between items (tight, matching Zone A)
- Sidebar to content: hard edge (color break, no gap)
- Content internal: 24px between elements (spacious)

The contrast between sidebar density (4px gaps) and content spaciousness (24px gaps) creates a "dense navigation → open workspace" transition that mirrors the CEO's mental model: compact controls → expansive view.

---

### 3.5 White Space + Unity — Score: 8/10

#### White Space
**Sidebar whitespace:** The dual-zone reduces scrolling within the sidebar by pinning 4 items to Zone B. Zone A scrolls independently when needed (on shorter viewports), but the fixed Zone B ensures that communication items never disappear off-screen. This reduces the "lost in scroll" feeling.

**Content whitespace:** The 7 layout types allow per-page whitespace optimization:
- Feed layout (720px centered): generous side margins — excellent whitespace
- Dashboard grid: 24px gaps between cards — adequate
- Canvas layout (NEXUS): zero padding — maximum viewport utilization, whitespace is defined by the canvas content itself
- Multi-panel (Trading): 16px gaps between panels — tight but appropriate for data-dense financial interfaces

**Command palette whitespace:**
- 20vh top offset centers the palette in the upper-third of the viewport (rule of thirds)
- 16px internal padding on input and list items — comfortable touch/click targets
- 640px max-width with 90vw fallback — appropriately sized for rapid text entry

#### Unity
All Option A's unity strengths apply (color, radius, shadow, icon, type consistency). Option C adds:

- **Zone unity:** Zone A and Zone B share the same dark olive background, same nav item styling, same icon system. The only visual differentiator is the border-top — minimal disruption to the sidebar's visual identity.
- **Command palette unity:** Uses the same `bg-surface`, `border-primary`, `text-primary` tokens as content area cards — the palette feels like a content-area element floating above the page, not a foreign widget.
- **Layout type unity:** All 7 layout types share the same `bg-primary` background, `content-padding` (24px), and `shadow-sm` for elevated elements. Despite structural differences, they feel like variations of the same system.

**Potential unity risk:** The command palette introduces a new component paradigm (modal search with keyboard navigation) that doesn't exist elsewhere in the UI. If the palette's interaction patterns (arrow keys for navigation, Enter for selection, Escape to close) are not replicated in other modal contexts (dropdowns, select menus), it may feel like an inconsistent addition.

**Mitigation:** Ensure all dropdown menus (Radix UI Select, DropdownMenu) use the same keyboard navigation patterns as the command palette. This is built into Radix UI primitives, so it's free if using the framework correctly.

---

### 3.6 UX Deep Dive — Score: 8/10

#### Information Architecture
Option C's IA is the strongest of all three options:

**Zone A (5 sections, 18 items):**
- COMMAND: Hub, Dashboard, NEXUS, Chat (4)
- ORGANIZATION: Agents, Departments, Jobs/ARGOS, Tiers, Reports (5)
- TOOLS: Workflows, Knowledge, Files, SketchVibe (4)
- INTELLIGENCE: Performance, Costs, Trading, Activity Log, Ops Log (5)
- All items visible (no "More..." menu) — full discoverability

**Zone B (4 items, always visible):**
- Messenger, SNS, Agora, Notifications — the SOCIAL group

**Footer (3 items, always visible):**
- Classified, Settings, User Profile

This IA solves the Option B discoverability trade-off: all pages are visible in Zone A (scrollable but accessible), while the most time-sensitive items (communication + notifications) are pinned in Zone B for immediate access.

#### Cognitive Load — Miller's Law
- Zone A sections: each has 4-5 items → within 7±2
- Zone B: 4 items → well within threshold
- Total visible without scrolling (on 1080p): ~14 items (COMMAND + ORGANIZATION + Zone B) → 2 chunks of 7
- Total visible with full scroll: 25 items → must chunk across sections

**Chunking analysis:** The 5 section headers in Zone A act as chunk boundaries. The CEO processes navigation as 5 groups (average 4.2 items per group), not 18 individual items. This is effective chunking — 5 groups is within Miller's range.

**Working memory demand:** At any moment, the CEO needs to hold in mind:
1. Which section they're looking for (1 of 5 — low load)
2. Which item within that section (1 of 4-5 — low load)
3. Zone B status (badge counts — passive attention, not working memory)

Total: ~3 cognitive units for navigation. This is excellent.

#### Fitts's Law
**Nav items:** 280px wide × ~36px tall → generous targets. Same as Options A and B.

**Zone B items:** Same size as Zone A items but *always* visible without scrolling. On a 1080p viewport, Zone B is approximately 200px from the bottom of the sidebar. The CEO's mouse can reach Zone B from the content area center in approximately:
- Distance: ~680px (center of 1160px content to Zone B)
- Target width: 280px (full sidebar width is the effective target due to cursor already being on the left edge)
- Fitts's T = a + b × log₂(1 + 680/280) ≈ a + 1.95b — moderate acquisition time

**Command palette (Cmd+K):** The most Fitts-efficient feature in any option:
- No mouse movement required — keyboard activation
- Search reduces options from 23 to 1-3 via fuzzy matching
- Arrow key navigation + Enter selection — no pointer needed
- **Fitts's time: effectively 0** for keyboard users

This makes Cmd+K the *only* navigation method that fully solves Fitts's Law for a 23-page app. Mouse navigation will always have a distance penalty; keyboard navigation eliminates it entirely.

**Content area interactions:** The 7 layout types keep page-specific interactions within the content area (close to the CEO's cursor), maintaining low Fitts's distance for within-page tasks.

#### Hick's Law
**Without command palette:** Zone A (18 items) + Zone B (4 items) = 22 visible → log₂(23) ≈ 4.52 Hick's units. Same as Option A — no improvement for mouse-only navigation.

**With command palette (Cmd+K):** The CEO types 2-3 characters and sees 1-3 filtered results → log₂(4) ≈ 2.0 Hick's units. This is a **56% reduction** vs full sidebar scan. The command palette transforms a 22-option Hick's problem into a 3-option Hick's problem.

**Hick's Law for Zone B specifically:** 4 items → log₂(5) ≈ 2.32 Hick's units. Zone B achieves fast selection because:
1. Fixed position — spatial memory develops quickly
2. Badge counts — visual scanning replaces reading (preattentive processing)
3. 4 items max — below Hick's threshold

**Keyboard shortcut layer:** Specific shortcuts (e.g., `⌘D` for Dashboard, `⌘⇧A` for Agents) reduce Hick's to log₂(2) = 1.0 — the CEO decides only "is this the right shortcut?" (binary choice). This is the theoretical minimum for deliberate navigation.

#### Command Palette as UX Multiplier
The Cmd+K command palette is not just a convenience — it fundamentally changes the UX model:

| Without ⌘K | With ⌘K |
|------------|---------|
| Visual scan 22 items | Type 2-3 chars, see 1-3 results |
| Mouse to sidebar → scan → click | Keyboard shortcut → type → enter |
| Hick's: log₂(23) ≈ 4.52 | Hick's: log₂(4) ≈ 2.0 |
| Fitts's: D/W varies by target | Fitts's: 0 (keyboard) |
| Linear time: O(n) scan | Sublinear: O(log n) fuzzy match |

The palette also serves as a **unified action center** — not just navigation but also quick actions (Create Agent, Start Job, Export NEXUS). This means the CEO can perform any operation from any page without navigating away first. The "command" in "Command Center" is literal.

**⚠ Cmd+K Portability Note:** The command palette is **not architecture-dependent** — any option can implement `cmdk`. If Cmd+K were added to Option A, its Hick's Law score would also improve from log₂(23)≈4.52 to log₂(4)≈2.0. The scoring for this section therefore evaluates Option C's UX *excluding* the Cmd+K multiplier: Zone A (18 items, 5 chunks of ~4) + Zone B (4 pinned) + full discoverability (vs B's "More..." hiding) = strong architectural UX at **8/10**. The Cmd+K benefit applies to whichever option is selected and should be treated as a **bonus multiplier**, not a scoring advantage for Option C specifically.

---

### 3.7 Framework Implementation Spec

#### Component Tree
```tsx
<AppShell data-sidebar={sidebarState}>
  {/* Sidebar: hover-expand borrowed from Option B (200ms delay + pointer guard) */}
  <Sidebar
    state={sidebarState}
    onToggle={handleToggle}
    onHoverEnter={handleHoverExpand}   // 200ms delay, pointer-events guard
    onHoverLeave={handleHoverCollapse}
  >
    <SidebarBrand collapsed={isCollapsed} />
    <SidebarSearch onActivate={openCommandPalette} />

    {/* Zone A: Core navigation — scrollable
        Section labels: Korean-first (Vision §12.1 — zero cognitive translation for CEO)
        Hybrid approach: Korean category labels + English brand terms (Hub, NEXUS, ARGOS) */}
    <SidebarZoneA>
      <NavSection label="명령" icon={Terminal}>         {/* COMMAND → 명령 */}
        <NavItem to="/hub" icon={Home} label="Hub" />
        <NavItem to="/dashboard" icon={BarChart3} label="대시보드" />
        <NavItem to="/nexus" icon={Network} label="NEXUS" />
        <NavItem to="/chat" icon={MessageSquare} label="채팅" />
      </NavSection>
      <NavSection label="조직" icon={Users}>            {/* ORGANIZATION → 조직 */}
        <NavItem to="/agents" icon={Bot} label="에이전트" />
        <NavItem to="/departments" icon={Building2} label="부서" />
        <NavItem to="/jobs" icon={Calendar} label="작업 / ARGOS" />
        <NavItem to="/tiers" icon={Layers} label="티어" />
        <NavItem to="/reports" icon={FileText} label="리포트" />
      </NavSection>
      <NavSection label="도구" icon={Wrench}>           {/* TOOLS → 도구 */}
        <NavItem to="/workflows" icon={GitBranch} label="워크플로우" />
        <NavItem to="/knowledge" icon={BookOpen} label="지식" />
        <NavItem to="/files" icon={FolderOpen} label="파일" />
        {/* SketchVibe: conditional — include if route returns to CEO app in v3.
            Currently moved to Admin app (App.tsx:111). Nav count 18→17 if excluded. */}
        <NavItem to="/sketchvibe" icon={Palette} label="SketchVibe" />
      </NavSection>
      <NavSection label="분석" icon={Brain}>            {/* INTELLIGENCE → 분석 */}
        <NavItem to="/performance" icon={TrendingUp} label="성과" />
        <NavItem to="/costs" icon={DollarSign} label="비용" />
        <NavItem to="/trading" icon={CandlestickChart} label="트레이딩" />
        <NavItem to="/activity-log" icon={Activity} label="활동 로그" />
        <NavItem to="/ops-log" icon={ScrollText} label="운영 로그" />
      </NavSection>
    </SidebarZoneA>

    {/* Zone B: 소통 (Communication) — fixed at bottom
        Note: Notifications is a NEW sidebar entry (not in current sidebar.tsx),
        not a reorganization. Route /notifications exists but was topbar-only. */}
    <SidebarZoneB>
      <NavItem to="/messenger" icon={MessageCircle} label="메신저" badge={unreadMessages} />
      <NavItem to="/sns" icon={Share2} label="SNS" />
      <NavItem to="/agora" icon={Landmark} label="아고라" />
      <NavItem to="/notifications" icon={Bell} label="알림" badge={unreadNotifs} />
    </SidebarZoneB>

    <SidebarFooter>
      <NavItem to="/classified" icon={Lock} label="기밀" />
      <NavItem to="/settings" icon={Settings} label="설정" />
      <SidebarUserMenu user={currentUser} />
    </SidebarFooter>
  </Sidebar>

  <Topbar>
    <TopbarTitle>{pageTitle}</TopbarTitle>
    <TopbarActions>
      <CommandPaletteTrigger shortcut="⌘K" />
      <NotificationBell count={unreadCount} />
      <UserAvatar />
    </TopbarActions>
  </Topbar>

  <ContentArea>
    <ContentInner layout={currentLayoutType}>
      <Outlet />
    </ContentInner>
  </ContentArea>

  {/* Command Palette — portal-rendered overlay */}
  <CommandPalette
    open={paletteOpen}
    onClose={() => setPaletteOpen(false)}
    items={paletteItems}
  />
</AppShell>
```

#### Key CSS Classes (Tailwind v4)
```css
/* App Shell */
.app-shell       → grid grid-cols-[280px_1fr] grid-rows-[56px_1fr] h-dvh overflow-hidden
.app-shell[collapsed] → grid-cols-[56px_1fr]

/* Sidebar Zones */
.sidebar         → flex flex-col bg-[#283618] text-[#a3c48a] overflow-hidden z-20
.sidebar-zone-a  → flex-1 overflow-y-auto px-3 py-4
                   scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent
.sidebar-zone-b  → shrink-0 px-3 py-2
                   border-t border-white/40  /* WCAG 1.4.11: 3:1 */

/* Nav Items — py-3 for 44px touch targets (WCAG 2.5.5 AAA) */
.nav-item        → flex items-center gap-3 px-3 py-3 rounded-lg text-sm
                   transition-colors duration-100 ease-out
.nav-item:hover  → bg-white/10
.nav-item[active]→ bg-white/15 font-medium text-white
.nav-item:focus-visible → outline-2 outline-[#a3c48a] outline-offset-[-2px] rounded-lg

/* Section Headers */
.nav-section-hdr → text-xs font-semibold uppercase tracking-wide
                   text-[#a3c48a]/80 px-3 pt-4 pb-1

/* Badge — with CVD-safe white ring (protanopia: red→brown on olive) */
.nav-badge       → inline-flex items-center justify-center min-w-5 h-5
                   rounded-full bg-red-600 text-white text-xs font-medium px-1.5
                   ring-1 ring-white/80  /* luminance contrast fallback for CVD */

/* Command Palette */
.cmd-overlay     → fixed inset-0 bg-black/50 z-[100]
                   flex items-start justify-center pt-[20vh]
.cmd-panel       → w-[min(640px,90vw)] max-h-[60vh]
                   bg-[#f5f0e8] rounded-xl shadow-lg overflow-hidden
.cmd-input       → h-12 px-4 text-base bg-transparent border-b border-[#e5e1d3]
                   w-full text-[#1a1a1a]
.cmd-item        → flex items-center gap-3 h-10 px-4 text-sm cursor-pointer
.cmd-item:hover  → bg-[#faf8f5]
.cmd-item[selected] → bg-[#faf8f5]
.cmd-group-hdr   → text-xs font-semibold uppercase text-[#6b705c] px-4 pt-2 pb-1

/* Content Layout Types */
.layout-dashboard → grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6
.layout-master-detail → grid grid-cols-[280px_1fr] h-[calc(100dvh-56px)]
.layout-canvas   → relative w-full h-[calc(100dvh-56px)] overflow-hidden p-0 max-w-none
.layout-crud     → flex flex-col gap-6
.layout-tabbed   → flex flex-col
.layout-panels   → grid grid-cols-2 grid-rows-2 gap-4 h-[calc(100dvh-56px)]
.layout-feed     → max-w-[720px] mx-auto

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .sidebar, .cmd-overlay, .cmd-panel, .nav-badge {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}

/* Windows High Contrast Mode */
@media (forced-colors: active) {
  .sidebar        → border-right: 1px solid ButtonText  /* figure/ground preserved */
  .sidebar-zone-b → border-top-color: ButtonText        /* white/40 may vanish */
  .card           → border: 1px solid ButtonText        /* bg-color diff lost */
}

/* Responsive Breakpoints */
/* sm  (640px)  — mobile portrait */
/* md  (768px)  — mobile landscape / small tablet */
/* lg  (1024px) — sidebar transition: overlay sidebar, Zone A+B merge */
/* xl  (1280px) — full sidebar visible, default layout */
/* 2xl (1536px) — max-w-1440 content with generous side margins */
@media (max-width: 1023px) {
  .app-shell → grid-cols-[1fr]  /* sidebar becomes overlay */
  .sidebar   → fixed inset-y-0 left-0 w-[280px] z-30 translate-x-[-100%]
  .sidebar[open] → translate-x-0
}
```

#### TypeScript Props
```typescript
// Sidebar (with hover-expand borrowed from Option B)
interface SidebarProps {
  state: 'expanded' | 'collapsed';
  onToggle: () => void;
  onHoverEnter?: () => void;    // 200ms delay, pointer-events guard
  onHoverLeave?: () => void;
  children: React.ReactNode;
}

// Sidebar Zones
interface SidebarZoneAProps {
  children: React.ReactNode;
}

interface SidebarZoneBProps {
  children: React.ReactNode;
}

// Command Palette
interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
}

interface CommandItem {
  id: string;
  type: 'navigation' | 'action' | 'agent';
  label: string;
  icon: LucideIcon;
  shortcut?: string;         // e.g., "⌘D"
  description?: string;      // secondary text
  onSelect: () => void;
  group: string;             // "Recent" | "Navigation" | "Actions" | "Agents"
}

// Layout Types
type ContentLayoutType =
  | 'dashboard'              // auto-fit grid
  | 'master-detail'          // sidebar + main
  | 'canvas'                 // full-bleed
  | 'crud'                   // single column list/cards
  | 'tabbed'                 // tab bar + content
  | 'panels'                 // 2×2 grid
  | 'feed';                  // centered narrow column

interface ContentInnerProps {
  layout: ContentLayoutType;
  children: React.ReactNode;
}

// NavItem with badge support
interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  isActive?: boolean;
}

// NavSection with collapsible support
interface NavSectionProps {
  label: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  defaultCollapsed?: boolean;  // for overflow management on short viewports
}
```

#### Accessibility Spec
```typescript
// Semantic HTML structure (revised: single <nav> + role="group" sections)
// Reduces screen reader landmarks from 7 to 3 (nav, banner, main).
// NVDA/JAWS D-key navigation cycles 3 stops instead of 7.
// <nav aria-label="Main navigation">
//   <div role="group" aria-labelledby="section-command">
//     <span id="section-command" class="sr-only">명령</span>
//     ...Zone A sections
//   </div>
//   <div role="group" aria-labelledby="section-communication">
//     <span id="section-communication" class="sr-only">소통</span>
//     ...Zone B items
//   </div>
// </nav>
// <header role="banner">...</header>            Topbar
// <main role="main" id="main-content">...</main> Content
// <a href="#main-content" class="sr-only focus:not-sr-only">Skip to content</a>

// Command Palette ARIA
// <div role="dialog" aria-modal="true" aria-label="Command palette">
//   <input role="combobox" aria-expanded="true"
//          aria-controls="cmd-list" aria-activedescendant={selectedId} />
//   <ul role="listbox" id="cmd-list">
//     <li role="option" id={itemId} aria-selected={isSelected}>
//   </ul>
// </div>

// Focus management
// - Cmd+K opens palette → focus input
// - ESC closes palette → return focus to trigger
// - Tab within palette → cycles through input and list
// - Arrow keys → navigate list items
// - Enter → select item
// - Sidebar mobile open → focus first nav item, trap focus
// - Sidebar mobile close → return focus to hamburger button

// Color Vision Deficiency (CVD) — protanopia/deuteranopia (~8% males)
// Zone B red badges (#dc2626) on olive sidebar (#283618) → red perceived
// as dark brown/gold under protanopia, blending with olive.
// FIX: Add white outline ring + shape indicator:
//   .nav-badge → ring-1 ring-white/80  (luminance contrast fallback)
//   Or use filled dot + number (shape-based, not hue-dependent)

// Touch Targets — WCAG 2.5.5 (AAA) requires 44×44px minimum
// Current nav items: py-2 (8px) + 20px content = 36px height → FAILS AAA
// FIX: py-3 (12px) + 20px content = 44px → PASSES AAA
// Critical for touch-enabled devices (Surface Pro, iPad with keyboard)

// Reduced Motion — prefers-reduced-motion
// All transitions (sidebar collapse/expand, hover-expand, command palette
// open/close, badge count animations) MUST have:
//   @media (prefers-reduced-motion: reduce) {
//     * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
//   }

// High Contrast Mode — Windows forced-colors
// @media (forced-colors: active) {
//   .sidebar { border-right: 1px solid ButtonText; }
//   .card { border: 1px solid ButtonText; }  // bg-color separation lost
//   .sidebar-zone-b { border-top-color: ButtonText; }  // white/40 may vanish
// }
```

### 3.8 Option C Summary

| Category | Score | Key Finding |
|----------|-------|-------------|
| Gestalt Compliance | 8/10 | Dual-zone proximity/closure exceptional; figure/ground sidebar-dominance shared with A/B prevents 9 |
| Visual Hierarchy | 7/10 | Blur test sidebar-dominance is fundamental (resting-state ~95%); palette solves hierarchy only when active |
| Golden Ratio & Proportion | 8/10 | Spatial rhyme (sidebar ratio repeats in master-detail); Zone A:B ratio balanced |
| Contrast | 8/10 | Sidebar density vs content spaciousness creates intentional contrast; focus ring + CVD badge fixes needed |
| White Space + Unity | 8/10 | Zone B pinning prevents scroll waste; palette uses content tokens for unity |
| UX Deep Dive | 8/10 | Full discoverability; excellent Fitts's; Cmd+K is a portable bonus (applies to any option) |
| **TOTAL** | **47/60** | **Distinctive, brand-aligned, architecturally strongest — clear winner** |

---

## 4. Final Comparison Matrix

| Category (max) | Option A: Linear | Option B: Notion | Option C: Command |
|----------------|-----------------|-----------------|-------------------|
| Gestalt (/10) | 6 | 7 | **8** |
| Hierarchy (/10) | 6 | **8** | 7 |
| Golden Ratio (/10) | 7 | 7 | **8** |
| Contrast (/10) | 6 | 7 | **8** |
| White Space + Unity (/10) | 7 | 6 | **8** |
| UX Deep Dive (/10) | 5 | 7 | **8** |
| **TOTAL (/60)** | **37** | **42** | **47** |
| **Percentage** | **61.7%** | **70.0%** | **78.3%** |

### Score Distribution Analysis

| Metric | Option A | Option B | Option C |
|--------|----------|----------|----------|
| Highest category | Golden Ratio (7), White Space (7) | Hierarchy (8) | Gestalt (8), Golden Ratio (8), Contrast (8), White Space (8), UX (8) |
| Lowest category | UX Deep Dive (5) | White Space (6) | Hierarchy (7) |
| Standard deviation | 0.75 | 0.63 | 0.41 |
| Ceiling gap (from 10) | 3.83 avg | 3.00 avg | 2.17 avg |

**Option A** is inconsistent — strong in proportion/unity but weak in UX and contrast. A "safe" choice that works but doesn't excel.

**Option B** has meaningful variance (σ=0.63) reflecting real strengths and weaknesses. The collapsible sidebar genuinely resolves the blur test failure (Hierarchy 8), but the 23 different topbar configurations create a significant design system fragmentation risk (White Space+Unity 6). No longer zero-variance — the redistribution exposes its actual trade-offs.

**Option C** leads in 5 of 6 categories with the highest floor (7/10 minimum). Option B takes Hierarchy (8 vs 7) because the collapsible sidebar's blur test fix applies in resting state, while Option C's command palette only fixes hierarchy when active. The dual-zone architecture + 7 layout types + full discoverability create a system where each design principle is specifically addressed. Cmd+K is noted as a portable bonus applicable to any option.

---

## 4B. Complete Page → Layout Type Mapping (23 pages)

| # | Page | Route | Layout Type | Rationale |
|---|------|-------|-------------|-----------|
| 1 | Hub | `/hub` | master-detail | Session list (280px) + streaming chat (flex-1) |
| 2 | Dashboard | `/dashboard` | dashboard | Auto-fit metric cards + charts |
| 3 | NEXUS | `/nexus` | canvas | React Flow organizational chart — full bleed |
| 4 | Chat | `/chat` | master-detail | Agent list + conversation pane |
| 5 | Agents | `/agents` | crud | Agent CRUD list with grid/list toggle |
| 6 | Departments | `/departments` | crud | Department CRUD list; detail sections within modal/drawer (not tabbed) |
| 7 | Jobs / ARGOS | `/jobs` | crud | Scheduled job list with status + history |
| 8 | Tiers | `/tiers` | crud | Tier CRUD with maxDepth configuration |
| 9 | Reports | `/reports` | crud | Report list with filtering; individual report = dashboard layout |
| 10 | Workflows | `/workflows` | canvas | n8n integration — embedded canvas or iframe |
| 11 | Knowledge | `/knowledge` | master-detail | Document list (search + filter) + document viewer |
| 12 | Files | `/files` | crud | File manager with upload/download/delete |
| 13 | SketchVibe | `/sketchvibe` | canvas | MCP editor (conditional — may stay in Admin app) |
| 14 | Performance | `/performance` | dashboard | Metric cards + performance charts |
| 15 | Costs | `/costs` | dashboard | Cost breakdown cards + usage charts |
| 16 | Trading | `/trading` | panels | 2×2 grid: chart, orderbook, positions, history |
| 17 | Activity Log | `/activity-log` | feed | Chronological event feed (720px centered) |
| 18 | Ops Log | `/ops-log` | feed | Operational log feed (720px centered) |
| 19 | Messenger | `/messenger` | master-detail | Contact list + message thread |
| 20 | SNS | `/sns` | feed | Social posts feed (720px centered) |
| 21 | Agora | `/agora` | feed | Discussion forum feed (720px centered) |
| 22 | Notifications | `/notifications` | feed | Notification list (720px centered) — NEW sidebar entry (was topbar-only) |
| 23 | Settings | `/settings` | tabbed | 10 tabs (General, Profile, API Keys, ...) |

**Outside sidebar (not counted):** Login (`/login`), Onboarding (`/onboarding`)
**Redirect routes (not counted):** `/command-center`→`/hub`, `/org`→`/nexus`, `/cron`→`/jobs`, `/argos`→`/jobs`

**Layout type distribution:** crud ×6, feed ×5, master-detail ×4, dashboard ×3, canvas ×3, panels ×1, tabbed ×1

---

## 4C. "Controlled Nature" Philosophy Evaluation

Vision & Identity §2.3 defines the design philosophy as **"Controlled Nature — Structure meets organicism."** This section evaluates how each option expresses this tension.

| Dimension | Option A: Linear | Option B: Notion | Option C: Command |
|-----------|-----------------|-----------------|-------------------|
| **Structure** (precision, grid, systematic) | Strong — rigid grid, predictable layout, no surprises. Pure structure with no organic variation. | Moderate — structured base with adaptive topbar. The "More..." toggle introduces controlled flexibility. | Strong — dual-zone architecture, 7 typed layouts, command palette. Highly systematic. |
| **Organicism** (natural, warmth, growth) | Weak — no living behavior, no adaptive elements. The sidebar is a static list — no growth metaphor. | Moderate — hover-expand simulates "living" behavior (sidebar breathes in/out). But this is mechanical, not organic. | Moderate — Zone A scrolls like "flowing water" while Zone B is "rooted" in place. The command palette "floats" above the landscape. Badge counts change dynamically (growth/decay). |
| **Tension between both** | Unbalanced — structure dominates entirely. The design is functional but lifeless. | Balanced but superficial — hover-expand is the only "organic" element, and it's a UX convenience, not a philosophy expression. | Best balance — the "dense earth (sidebar) → open sky (content)" metaphor from §5 creates a genuine landscape narrative. Zone B badges pulse with real-time data (organic), within a fixed spatial architecture (structure). |
| **"Controlled Nature" score** | 5/10 — structure without nature | 6/10 — nature as UX convenience | **8/10 — nature as design narrative** |

**Assessment:** Option C best expresses the Controlled Nature philosophy because its architecture creates meaningful tension: the rigid dual-zone structure contains dynamic, living elements (real-time badges, scrolling content, floating palette). The other options either suppress organicism (A) or treat it as a surface feature (B).

---

## 5. Recommendation

### Primary: Option C — "Command Center"

**Confidence: HIGH** (47/60 = 78.3%, 5-point lead over Option B)

Option C is the correct choice for CORTHEX v3 because it is the only option where the layout architecture directly expresses the product identity:

1. **The Ruler archetype demands command infrastructure.** The dual-zone sidebar + command palette + 7 layout types give the CEO a *command center*, not just a dashboard. The sidebar is an organizational hierarchy (Zone A = departments/tools, Zone B = communication channels). The Cmd+K palette is the CEO's voice — they speak, and the system responds.

2. **23 pages demand structural solutions.** Options A and B treat the sidebar as a flat list with cosmetic variations (dividers, "More" menus). Option C treats the sidebar as an *architecture* — two functional zones with different scroll behaviors, badge systems, and spatial permanence. This scales to 30+ pages without degradation.

3. **Natural Organic palette is maximized.** The dark olive sidebar as a dense "earth" zone, cream content as open "sky" zone, and the command palette as a floating "cloud" create a layered landscape metaphor that embodies "Controlled Nature."

### Critical Implementation Items

1. **Focus ring fix:** Sidebar focus ring must use `#a3c48a` (6.63:1) not `#606C38` (2.27:1 — fails WCAG 1.4.11)
2. **CVD badge fix:** Zone B badges need `ring-1 ring-white/80` for protanopia/deuteranopia safety (red→brown on olive otherwise invisible)
3. **Touch target height:** Nav items must use `py-3` (44px total) for WCAG 2.5.5 AAA compliance (was `py-2` = 36px)
4. **Screen reader landmarks:** Single `<nav>` + `role="group"` per section (reduces landmarks from 7→3 for NVDA/JAWS D-key)
5. **Zone A scroll indicator:** Add gradient fade at Zone A bottom when scrollable content extends below visible area
6. **Section collapse on 1080p:** Allow section groups in Zone A to collapse (click header to toggle children) for shorter viewports
7. **Command palette library:** `cmdk` (pacocoursey) — unstyled, Radix-compatible, fuzzy search built-in, shadcn/ui pattern. **Version must be pinned** (no ^) per CLAUDE.md rule. Verify React 19 compatibility and bundle size before implementation.
8. **Sidebar state persistence:** `localStorage` via Zustand store for collapse/expand preference
9. **Mobile transition:** Below 1024px, both zones merge into overlay sidebar; Zone B items get priority placement at top
10. **prefers-reduced-motion:** All sidebar, palette, and badge animations must have instant-state overrides
11. **forced-colors (Windows High Contrast):** Border fallbacks for sidebar and cards when background color differentiation is lost
12. **Text tertiary color:** Document uses `#756e5a` — Tech Spec §1.4 uses `#a3a08e`. Clarify which is authoritative in Phase 3.
13. **Korean section labels:** Section headers use Korean (명령, 조직, 도구, 분석, 소통) per Vision §12.1 Korean-first mandate. English brand terms (Hub, NEXUS, ARGOS, SNS) retained for recognition.

### What Option C Borrows from Option B

- **Breadcrumbs:** Option B's contextual topbar with breadcrumbs is valuable for deep navigation (Hub > 세션 #12 > 핸드오프). Added to Option C's topbar for pages with sub-routes.
- **Hover-expand:** Option B's hover-expand added to Option C's Sidebar component (`onHoverEnter`/`onHoverLeave` props) with 200ms delay and `pointer-events: none` guard for the first 100ms after page load.

---

## 6. Sources

### Design Principles Applied
- Gestalt Principles (proximity, similarity, continuity, closure, figure/ground) — `.claude/plugins/design-mastery/skills/design-principles/SKILL.md`
- Visual Hierarchy (blur test, scale, weight, color, position, space) — Design Principles §1
- Golden Ratio (1:1.618 proportion) — Design Principles §4
- Contrast (size, color, weight, style, spacing) — Design Principles §8
- White Space (breathing room, grouping, emphasis, luxury) — Design Principles §9
- Unity (consistency, cohesion, design system) — Design Principles §10

### UX Laws Applied
- Miller's Law (7±2 chunking) — cognitive psychology
- Hick's Law (T = b × log₂(n+1)) — choice reaction time
- Fitts's Law (T = a + b × log₂(1+D/W)) — movement time to target

### Internal References
- Vision & Identity — `_uxui_redesign/phase-0-foundation/vision/vision-identity.md`
- Technical Spec — `_uxui_redesign/phase-0-foundation/spec/technical-spec.md`
- Web Layout Research (Phase 1) — `_uxui_redesign/phase-1-research/web-dashboard/web-layout-research.md`
- Design Principles Checklist — `.claude/plugins/design-mastery/skills/design-principles/assets/principles-checklist.md`

---

*End of Web Dashboard Layout Deep Analysis — Phase 2, Step 2-1*
