# Phase 1, Step 1-2 — Tech + Performance Review
**Critic:** tech-perf (Critic-C)
**Document:** `_uxui_redesign/phase-1-research/app/app-layout-research.md`
**Date:** 2026-03-23

---

## Overall Assessment: 8.0/10 — PASS with Required Fixes

Option C is the correct recommendation. The mobile research is comprehensive and well-structured. However, there are 2 required fixes and several medium-severity items.

---

## Issue #1 (SEVERITY: HIGH) — Vaul Bundle Size Claim Incorrect + Dependency Overlap Opportunity

**Location:** Lines 1202, 1253 — "~8 kB gzip"

**Problem:**
Vaul v1.1.2 actual bundle: **~4.5 kB self-code + @radix-ui/react-dialog dependency**. The total including the dialog is ~14-15 kB if dialog is not already loaded. However, **cmdk (from Step 1-1) already bundles @radix-ui/react-dialog**. So Vaul's incremental cost is only **~4.5 kB gzipped** — NOT 8 kB.

**Verified data:**
| Library | Self (min+gzip) | Dependency | Notes |
|---------|----------------|------------|-------|
| Vaul v1.1.2 | ~4.5 kB | @radix-ui/react-dialog (shared with cmdk) | React 19 compat since v1.1.1 |
| react-spring-bottom-sheet | — | — | **ABANDONED (4+ years)** |
| react-modal-sheet v5.5.0 | ~5 kB | framer-motion (~34 kB!) | framer-motion is a deal-breaker |
| pure-web-bottom-sheet | ~0 kB JS | CSS scroll-snap | Web Component, no React integration |

**Fix:** Update the document to state:
- Vaul v1.1.2: **~4.5 kB gzip self-code** (only dependency is @radix-ui/react-dialog, shared with cmdk from desktop)
- Total incremental mobile cost: ~4.5 kB (not 8 kB), since dialog is already in the bundle from cmdk

**Verdict:** Vaul is still the correct choice — lightest React-native bottom sheet with snap points, gesture support, and Radix Dialog a11y built in. The shared dialog dependency makes it essentially free alongside cmdk.

---

## Issue #2 (SEVERITY: HIGH) — `-webkit-overflow-scrolling: touch` is Deprecated and Unnecessary

**Location:** Lines 220, 448, 717, 1025 — `-webkit-overflow-scrolling: touch;`

**Problem:**
`-webkit-overflow-scrolling: touch` has been **unnecessary since iOS 13 (2019)**. Safari now uses momentum scrolling by default on all overflow elements. Including it:
1. Adds dead CSS that signals outdated knowledge to code reviewers
2. Can cause z-index stacking context issues on older WebKit (creates a new stacking context)
3. Known to cause disappearing content bugs in nested scroll containers on older iOS

Since CORTHEX v3 targets modern browsers only (per Tech Spec), this property should be removed entirely.

**Fix:** Remove all 4 instances of `-webkit-overflow-scrolling: touch;`.

---

## Issue #3 (SEVERITY: MEDIUM) — `overscroll-behavior-y: contain` Only on Content, Not on Bottom Sheet

**Location:** Line 718 — only on `.mobile-content`

**Problem:**
`overscroll-behavior-y: contain` prevents pull-to-refresh correctly on the main content area. But the **bottom sheet content** (`.bottom-sheet-content`, line 820-825) also has `overflow-y: auto` and does NOT have `overscroll-behavior-y: contain`. When a user scrolls to the top of the bottom sheet content and keeps pulling, it could trigger the browser's pull-to-refresh or bounce the entire page behind the sheet.

**Fix:** Add `overscroll-behavior-y: contain;` to `.bottom-sheet-content` (line 820-825).

**Edge case note:** `overscroll-behavior` is well-supported (Safari 16+, Chrome 63+, Firefox 59+). In PWA standalone mode, pull-to-refresh is typically disabled by the browser, but in Safari tab mode it's active. The `contain` value reliably prevents the parent scroll chain from being triggered.

---

## Issue #4 (SEVERITY: MEDIUM) — Drawer Uses Radix Dialog But Document Says ~12 kB Additional

**Location:** Writer's review request question #10: "Drawer = Radix Dialog — adds ~12 kB gzip"

**Clarification:**
The drawer (`.more-drawer`, line 871) is implemented with pure CSS (`transform: translateX`) + `data-open` attribute. It does NOT actually require Radix Dialog. The CSS is self-contained.

However, the Implementation Notes (line 1256) say "Radix Dialog for a11y (focus trap, ESC close, aria-modal)". This is correct for production but the a11y features could also be handled by Vaul's underlying Radix Dialog (shared) or by the native HTML `<dialog>` element (0 kB).

**Recommendation:** Use the native `<dialog>` element for the drawer. It provides:
- Built-in `showModal()` / `close()`
- Built-in focus trap
- Built-in ESC to close
- Built-in `aria-modal="true"`
- 0 kB JavaScript

This eliminates the need for a separate Radix Dialog import for the drawer. Vaul already handles the bottom sheet dialog, and cmdk handles the command palette dialog.

---

## Issue #5 (SEVERITY: MEDIUM) — React Flow Mobile Missing `onlyRenderVisibleElements`

**Location:** Line 1257 — NEXUS mobile flags

**Problem:**
The document lists `nodesDraggable={false}`, `nodesConnectable={false}`, `zoomOnPinch={true}`, `fitView` for mobile React Flow. But it's missing the **most important performance flag** for mobile:

**`onlyRenderVisibleElements={true}`** — this prevents rendering nodes outside the viewport. On a mobile device with 50+ nodes, this is the difference between smooth and janky.

Additional mobile optimization flags (from @xyflow/react v12.10.1):
- `minZoom={0.25}` / `maxZoom={2}` — constrain zoom range to reduce rendering
- `selectNodesOnDrag={false}` — reduces unnecessary state updates

**Fix:** Add to line 1257:
```
onlyRenderVisibleElements={true}, minZoom={0.25}, maxZoom={2}
```

---

## Verified Technical Claims

### `100dvh` — CORRECT ✅
Dynamic viewport height support: Chrome 108+, Safari 15.4+, Firefox 108+. Correctly avoids the iOS Safari address bar height issue. Already used in Step 1-1 desktop spec.

### `env(safe-area-inset-*)` + `viewport-fit=cover` — VERIFIED ✅

**Current project state:** `packages/app/index.html` line 5 already has:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```
This is correct and already present. No action needed.

**Android note (2025+):** Chrome 135+ extends viewport to gesture navigation bar area, making `env(safe-area-inset-bottom)` important on Android too — not just iOS. The document correctly uses `--safe-bottom: env(safe-area-inset-bottom, 0px)` with a fallback.

### PWA Manifest — ALREADY EXISTS ✅
`packages/app/index.html` line 7 has `<link rel="manifest" href="/manifest.json" />`. PWA infrastructure is in place.

### Standalone Mode Detection — CORRECT with caveat ✅

The document's `@media (display-mode: standalone)` CSS (line 1101) works on:
- Android Chrome: ✅ Reliable
- iOS Safari 15.4+: ✅ Supported

**Caveat for JS detection:** Use both methods:
```js
function isPWA() {
  if (window.navigator.standalone === true) return true; // iOS (non-standard WebKit)
  if (window.matchMedia('(display-mode: standalone)').matches) return true; // Standard
  return false;
}
```

**EU iOS note:** iOS 17.4+ in EU briefly removed PWA standalone support, but Apple reversed this. iOS 18+ and iOS 26 (2025) re-enable full PWA support including home screen installation.

### Chat Input 16px — CORRECT, and ONLY reliable method ✅

The document correctly uses `font-size: 16px` for chat input (line 946) to prevent iOS auto-zoom.

**Verification:**
- `maximum-scale=1` has been **ignored by iOS Safari since iOS 10** (Apple intentionally disabled it for accessibility)
- `user-scalable=no` is also ignored since iOS 10
- `font-size: 16px` is the **only** reliable method — iOS auto-zooms on any input with `font-size < 16px`
- Additionally, using `maximum-scale=1` violates WCAG 1.4.4 (Resize Text, AA level)

The document does NOT use `maximum-scale=1` in the viewport meta — good. The existing project viewport meta is correct.

### 5-Tab Bottom Navigation — SOUND CHOICE ✅

Tab selection (Hub, Dashboard, Agents, Chat, More) is correct:
- Maps to P0/P1 priority pages from §1.3
- "More" opens the same olive drawer as hamburger — two entry points, one destination
- 5 tabs × 20% width = each tab is ~75px on 375px screen — adequate for icon + label
- Hub + Dashboard + Agents + Chat covers the CEO's core daily workflow

### 7 Mobile Layout Types — WELL-DESIGNED ✅

| Type | CSS Technique | Perf Concern |
|------|--------------|-------------|
| Chat/Hub | `flex: column`, input fixed bottom | None |
| Dashboard | `flex: column, gap: 16px` stacked | None |
| Master-detail | `display: none/block` toggle | None — no layout thrashing, just display toggle |
| Canvas (NEXUS) | `position: relative`, `touch-action` | See Issue #5 (needs `onlyRenderVisibleElements`) |
| Multi-panel (Trading) | Tab switcher, single panel visible | None |
| Tab-heavy | Scrollable tabs / accordion | None |
| Data table → cards | `flex: column` card list | None |

All CSS-only except NEXUS canvas. No extra JS for layout switching. `React.lazy` code-splitting per route handles per-page bundle sizes.

### Touch Targets — COMPLIANT ✅
- Bottom nav items: `min-height: 44px` ✅ (WCAG 2.5.8)
- Header buttons: `min-width: 44px; min-height: 44px` ✅
- Drawer nav items: `min-height: 48px` ✅
- Bottom sheet spotlight items: `min-height: 48px` ✅
- Chat input: `min-height: 44px` ✅

### Service Worker / Offline — CORRECTLY DEFERRED ✅

The document does not address Service Worker. This is appropriate for Phase 1 research:
- The manifest already exists (`/manifest.json`)
- Service Worker for offline caching is a separate concern from layout research
- Should be addressed in a dedicated PWA epic (offline-first is not in v3 scope per PRD)
- Recommendation: Note "Service Worker offline support deferred to v3.1" in implementation notes

---

## Libre Framework Verification

| Libre Principle | Status | Notes |
|----------------|--------|-------|
| Touch targets ≥ 44px | ✅ | All interactive elements verified |
| Semantic HTML | ✅ | Comments specify `<header>`, `<main>`, `<nav>`, `role="dialog"` |
| ARIA attributes | ✅ | `aria-current="page"`, `aria-selected`, `aria-modal`, `aria-label` |
| Focus indicators | ✅ | `:focus-visible` on header buttons (707-709) and nav items (762-766) |
| Reduced motion | ✅ | `@media (prefers-reduced-motion: reduce)` at lines 1088-1098 |
| Color contrast | ⚠️ | Same concern as Step 1-1: verify `#a3c48a` on `#283618` in drawer |
| PWA safe areas | ✅ | `env(safe-area-inset-*)` with fallbacks |

---

## Bundle Size Impact Summary

| Addition | Gzip Size | Status |
|----------|-----------|--------|
| Vaul v1.1.2 (self-code only) | ~4.5 kB | @radix-ui/react-dialog shared with cmdk |
| Radix Dialog (for drawer) | 0 kB | Use native `<dialog>` instead — OR shared with cmdk+Vaul |
| Radix Accordion (Settings) | ~6 kB | New dependency — needed for Settings page only |
| Mobile CSS | ~0 kB extra JS | Pure CSS responsive layouts |
| **Total incremental mobile JS** | **~4.5–10.5 kB** | Minimal |

---

## Component Count Estimate (Mobile-specific)

| Component | Purpose | New? |
|-----------|---------|------|
| `MobileHeader` | Header bar with hamburger + actions | New |
| `BottomNav` | 5-tab navigation | New |
| `BottomSheet` | Vaul wrapper with snap points | New |
| `MoreDrawer` | Left-slide olive drawer | New |
| `FAB` | Floating action button | New (trivial) |
| `MobileSearchOverlay` | Header 🔍 search | New |
| Mobile layouts (7) | CSS classes, not components | CSS only |

**Total new mobile components: 6** + 7 CSS layout classes. Reasonable.

---

## Summary

| # | Issue | Severity | Action |
|---|-------|----------|--------|
| 1 | Vaul bundle size incorrect (8 kB → 4.5 kB + shared dialog) | **HIGH** | Update size claims, note shared dependency with cmdk |
| 2 | `-webkit-overflow-scrolling: touch` deprecated, remove all 4 instances | **HIGH** | Remove — unnecessary since iOS 13, can cause bugs |
| 3 | `overscroll-behavior-y: contain` missing on bottom sheet content | **MEDIUM** | Add to `.bottom-sheet-content` |
| 4 | Drawer can use native `<dialog>` instead of Radix Dialog (saves ~10 kB) | **MEDIUM** | Update implementation notes |
| 5 | React Flow mobile missing `onlyRenderVisibleElements={true}` | **MEDIUM** | Add to NEXUS mobile flags |
| 6 | Note Service Worker deferral in implementation notes | **LOW** | Add one-line note |

**Verdict: PASS — Option C is correct. Fix Issues #1 and #2, address #3-5 before Phase 2.**
