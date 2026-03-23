# Phase 1, Step 1-1 — Tech + Performance Review
**Critic:** tech-perf (Critic-C)
**Document:** `_uxui_redesign/phase-1-research/web-dashboard/web-layout-research.md`
**Date:** 2026-03-23

---

## Overall Assessment: 8.5/10 — PASS with Required Fixes

The research is thorough, well-sourced, and Option C is the correct recommendation. However, there are 2 technical issues that need fixing before Phase 2 implementation, plus 1 document inconsistency.

---

## Issue #1 (SEVERITY: HIGH) — CSS Grid Animation Will Jank on Sidebar Collapse

**Location:** Lines 334, 548 — `transition: grid-template-columns var(--transition-speed) ease;`

**Problem:**
`grid-template-columns` animation triggers the full rendering pipeline every frame:
- Style Recalculation → Layout → Paint → Composite (CPU-bound)
- NOT GPU-accelerated — cannot be promoted to compositor layer
- Every frame recalculates the grid, repositions all children, and repaints
- On Oracle ARM 4-core VPS (remote desktop / low-end clients), this will visibly stutter

**Evidence:**
- web.dev High-Performance Animations guide explicitly lists `grid-template-columns` as a "Layout" property — avoid animating for 60fps
- Only `transform` and `opacity` are compositor-only (GPU-accelerated)
- Chrome DevTools Layout Shift will flag this as a forced reflow per frame

**Recommended Fix:**
```css
/* INSTEAD OF: transition on grid-template-columns */
.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  /* NO transition here */
}

/* Sidebar collapse via transform + width */
.sidebar {
  width: var(--sidebar-width);
  transition: width var(--transition-speed) ease;
  overflow: hidden;
}

.app-shell[data-sidebar="collapsed"] .sidebar {
  width: var(--sidebar-width-collapsed);
}

/* Content area uses margin to compensate */
.content {
  transition: none; /* Grid auto-adjusts via 1fr */
}
```

**Alternative (higher perf):**
```css
.sidebar {
  transform: translateX(0);
  transition: transform var(--transition-speed) ease;
}
.app-shell[data-sidebar="collapsed"] .sidebar {
  transform: translateX(calc(-1 * (var(--sidebar-width) - var(--sidebar-width-collapsed))));
}
```

The `transform` approach is compositor-only (GPU) and will hit 60fps on any device. The trade-off is that content doesn't auto-reflow during the animation — it snaps after. For a 200ms transition, this snap is imperceptible.

**Impact:** Must fix before Phase 2 CSS spec. Grid animation will be the first thing users feel as "janky."

---

## Issue #2 (SEVERITY: MEDIUM) — Zone B Items Inconsistent Between Diagrams

**Location:** Lines 512-516 (ASCII overview) vs Lines 811-816 (detailed sidebar)

**Problem:**
The Option C ASCII overview shows Zone B containing:
```
💬 Msg  |  🔔 Not  |  📈 Perf  |  💰 Cost
```

But the detailed sidebar breakdown shows:
```
💬 Messenger [2]  |  📱 SNS  |  🏛 Agora  |  🔔 Notifications [5]
```

These are **completely different item sets**. Performance and Costs (INTELLIGENCE group) vs SNS and Agora (SOCIAL group). The detailed version (SOCIAL group) is correct per the rationale on line 954: "Zone B's 4 pinned items match the SOCIAL page group exactly."

**Fix:** Update the ASCII overview diagram (lines 512-516) to match: Messenger, SNS, Agora, Notifications.

---

## Issue #3 (SEVERITY: LOW) — SketchVibe Missing from Sidebar Navigation

**Location:** Lines 797-800 (TOOLS group in sidebar)

**Problem:** §1.3 lists SketchVibe under TOOLS, but the detailed Zone A sidebar navigation only lists: Workflows, Knowledge, Files. SketchVibe is absent.

**Fix:** Add SketchVibe to TOOLS group in Zone A.

---

## Verified Technical Claims

### cmdk Library Choice — CORRECT ✅

| Library | Version | Min+Gzip | React 19 | Status |
|---------|---------|----------|----------|--------|
| **cmdk** | v1.1.1 (2026-03-14) | **14.57 kB** | v1.0.4+ ✅ | Active |
| kbar | v0.1.0-beta.48 | 17.5 kB | 2025-01 ✅ | Active |
| react-cmdk | v1.3.9 | N/A | Unknown | **ABANDONED (3yr)** |

**Verdict:** cmdk is the right choice.
- 3 kB smaller than kbar (gzipped)
- shadcn/ui compatible (same Radix Dialog dependency)
- cmdk already includes @radix-ui/react-dialog — **no additional dialog package needed**
- Unstyled = full control with Tailwind
- v1.1.1 fixed IME composition bug (important for Korean input ⌘K search)

**One note:** cmdk's fuzzy search is basic (substring). For 23 pages + N agents + M actions, this is fine. If the index grows to 500+ items, consider fuse.js overlay (~6.2 kB gzip). But not needed now.

### Bundle Size Impact — ACCEPTABLE ✅

| New Dependency | Gzip Size | Shared With |
|---------------|-----------|-------------|
| cmdk v1.1.1 | 14.57 kB | Includes @radix-ui/react-dialog |
| @radix-ui/react-dropdown-menu v2.1.16 | 24.23 kB | @floating-ui (heavy) |

**Warning on Radix dropdown-menu:** 24.23 kB gzipped is heavy. It pulls in @floating-ui/core + @floating-ui/dom (~37 kB min). The document lists "Radix UI for command palette dialog, dropdown menu" — but if dropdown is only for the topbar user menu, consider a simpler Tailwind-only dropdown (0 kB). Only use Radix dropdown if you need focus management, keyboard nav, and nested submenus.

**Recommendation:** Start with cmdk only (14.57 kB). Defer Radix dropdown-menu until a specific use case requires it. Total new JS: ~15 kB gzipped.

### Triple Scroll Context — NON-ISSUE ✅

The document flags "triple scroll" as a concern. Actual analysis:
- **Zone A**: `overflow-y: auto` — scrolls only when nav items exceed viewport
- **Zone B**: `flex-shrink: 0` — **does NOT scroll** (4 items × 40px = 160px fixed)
- **Content**: `overflow-y: auto` — standard page scroll

This is **dual scroll** (Zone A + Content), not triple. Zone B is fixed. Two independent scroll contexts is standard and has zero performance concern. The `overflow: hidden` on `.app-shell` correctly isolates scroll contexts.

### WebSocket Badges — NON-ISSUE ✅

Two badge counters (Messenger unread, Notification count) over WebSocket is negligible. A single WebSocket connection multiplexed for both counters adds <1 kB/min bandwidth. The project already uses WebSocket patterns.

### 100dvh — VERIFIED ✅

`dvh` (dynamic viewport height) support:
- Chrome 108+ ✅, Firefox 108+ ✅, Safari 15.4+ ✅
- Correct choice over `100vh` (avoids iOS address bar issue)

### 8px Grid Compliance — VERIFIED ✅

| Element | Value | Grid-aligned? |
|---------|-------|--------------|
| Sidebar width | 280px (8×35) | ✅ |
| Collapsed width | 56px (8×7) | ✅ |
| Topbar height | 56px (8×7) | ✅ |
| Content padding | 24px (8×3) | ✅ |
| Nav item padding | 8px 12px | ⚠️ 12px = 8×1.5 |
| Nav item gap | 12px | ⚠️ Not on 8px grid |
| Gap (content grids) | 24px (8×3) | ✅ |
| Border radius | 8px | ✅ |

**Minor:** Nav item horizontal padding (12px) and gap (12px) are not on the 8px grid. Consider 8px or 16px instead. Not blocking — 12px is common in sidebar designs and visually correct.

### Content Layout Variants — WELL-DESIGNED ✅

7 layout types map correctly to the 23 pages:

| Layout Type | CSS Technique | Pages | Perf Concern |
|-------------|--------------|-------|-------------|
| Dashboard grid | `auto-fit minmax(320px, 1fr)` | Dashboard, Performance | None — intrinsic sizing |
| Master-detail | `grid: 280px 1fr` | Hub, Chat, Messenger | None |
| Canvas | `position: relative` + 100% | NEXUS, SketchVibe | Ensure `will-change: transform` on canvas |
| CRUD | `flex column` | Agents, Depts, Tiers, Reports | None |
| Tabbed | `flex column` | Jobs, Settings | None |
| Multi-panel | `grid: 1fr 1fr / 1fr 1fr` | Trading | None — 4 cells, trivial |
| Feed | `max-w: 720px` centered | SNS, Agora, Activity Log | None |

**No layout thrashing on route changes** — each layout type is a CSS class swap. React's virtual DOM diffs the component tree; the CSS grid declaration is static per page. No forced reflow beyond the initial page render.

### Responsive Breakpoints — CORRECT ✅

| Breakpoint | Behavior | Technique |
|-----------|----------|-----------|
| ≥1024px | Full sidebar (280px) | CSS Grid |
| 768–1023px | Collapsed sidebar (56px icons) | Grid column change |
| <768px | Overlay sidebar | `position: fixed` + `transform: translateX` |

Mobile already uses `transform: translateX(-100%)` for the overlay — correct and performant. The inconsistency is only on desktop collapse animation (Issue #1).

---

## Libre Framework Verification

| Libre Principle | Status | Notes |
|----------------|--------|-------|
| Accessibility (a11y) | ✅ | `aria-current="page"` on nav items, Radix Dialog for command palette (focus trap, ESC to close) |
| Semantic HTML | ⚠️ | Not specified — ensure `<nav>`, `<main>`, `<aside>`, `<header>` elements |
| Keyboard navigation | ✅ | ⌘K palette, `[` toggle, arrow keys mentioned |
| Color contrast | ⚠️ | Dark sidebar text `#a3c48a` on `#283618` — needs WCAG verification (estimate ~4.2:1, borderline AA for 14px) |
| Focus indicators | ⚠️ | Not specified in CSS — needs `:focus-visible` styles on nav items and command palette |
| Reduced motion | ❌ | Missing `@media (prefers-reduced-motion: reduce)` to disable sidebar animation |
| Design tokens | ✅ | All values use CSS custom properties |
| Component composability | ✅ | Modular zones (A, B), layout variants as CSS classes |

**Required for Libre compliance:**
1. Add `@media (prefers-reduced-motion: reduce)` — set `--transition-speed: 0ms`
2. Specify semantic HTML elements (`<aside>`, `<nav>`, `<main>`, `<header>`)
3. Verify `#a3c48a` on `#283618` contrast ratio — if <4.5:1 for 14px text, lighten to `#b8d4a0` or similar
4. Add `:focus-visible` ring styles

---

## Component Count Estimate (Option C)

| Component | Purpose | New? |
|-----------|---------|------|
| `AppShell` | Grid container + sidebar state | Rebuild existing |
| `Sidebar` | Dual-zone wrapper | Rebuild existing |
| `SidebarZoneA` | Scrollable nav | New |
| `SidebarZoneB` | Pinned quick-access | New |
| `NavItem` | Individual nav link | Rebuild existing |
| `NavSectionHeader` | Group label | New (trivial) |
| `Topbar` | Page title + actions | Rebuild existing |
| `CommandPalette` | ⌘K dialog (cmdk wrapper) | New |
| Content layouts (7) | CSS classes, not components | CSS only |

**Total new React components: 8** (4 rebuilds + 4 new). Content layouts are CSS classes, not components. This is lean and correct.

---

## Summary

| # | Issue | Severity | Action |
|---|-------|----------|--------|
| 1 | CSS Grid animation on sidebar collapse | **HIGH** | Replace with `transform` or `width` transition |
| 2 | Zone B items mismatch (ASCII vs detail) | **MEDIUM** | Fix ASCII to show SOCIAL group |
| 3 | SketchVibe missing from TOOLS nav | **LOW** | Add to Zone A TOOLS section |
| 4 | `prefers-reduced-motion` missing | **MEDIUM** | Add media query |
| 5 | Semantic HTML not specified | **LOW** | Add `<aside>`, `<nav>`, `<main>`, `<header>` notes |
| 6 | Sidebar text contrast unverified | **LOW** | Verify WCAG AA for `#a3c48a` on `#283618` |
| 7 | `:focus-visible` styles missing | **LOW** | Add to Phase 2 spec |
| 8 | Radix dropdown-menu may be unnecessary | **LOW** | Defer; use cmdk only initially |

**Verdict: PASS — Option C is correct. Fix Issues #1 and #2 before Phase 2.**
