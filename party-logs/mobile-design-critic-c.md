# CRITIC-C: Technical Reality Review — Mobile DESIGN.md

**Reviewer**: Critic-C (Technical Reality)
**Date**: 2026-03-25
**Score: 7 / 10**

---

## 1. Tailwind v4 Compatibility

**Result: ✅ MOSTLY COMPATIBLE — 2 missing layout tokens**

All color tokens in DESIGN.md already exist in `packages/app/src/index.css` @theme:
- `--color-corthex-bg: #0C0A09` ✅
- `--color-corthex-surface: #1C1917` ✅
- `--color-corthex-elevated: #292524` ✅
- `--color-corthex-accent: #CA8A04` ✅
- All semantic + text tokens ✅

**Missing layout tokens** — not in @theme yet:
```css
/* Current @theme has desktop values only */
--topbar-height: 56px;   /* desktop — mobile DESIGN.md wants 48px separately */
/* MISSING: */
--mobile-topbar-height: 48px;
--bottom-nav-height: 56px;
```

Safe-area does NOT need @theme tokens. `env(safe-area-inset-*)` is a CSS env() function, not a custom property — it cannot be stored in @theme. Usage inline (as in current layout.tsx) is correct.

FAB positioning will require Tailwind arbitrary value syntax:
```tsx
bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+16px)]
```
This is verbose but valid in Tailwind v4.

**Risk**: LOW. Token gap is minor — add 2 tokens, done.

---

## 2. CSS Performance on Mobile

**Result: ✅ ACCEPTABLE — existing pattern already uses backdrop-blur**

DESIGN.md specifies `backdrop-blur` for the bottom sheet backdrop (`black/50 with backdrop-blur`). This triggers `backdrop-filter: blur()` which:
- Creates a GPU compositing layer ✅
- Is hardware-accelerated on iOS Safari 15.4+ and Chrome 76+ ✅
- Already used in current codebase:
  - `layout.tsx:225` → `backdrop-blur-sm` on mobile sidebar overlay
  - `layout.tsx:181` → `backdrop-blur-md` on desktop topbar

**Concern**: Multiple simultaneous `backdrop-filter` elements (bottom sheet + overlay) can compound GPU memory usage on low-end Android devices. If both are visible at once, consider using a solid color fallback at `@media (prefers-reduced-motion: reduce)` or on low-power devices.

**No layout-triggering properties identified** in the DESIGN.md animation spec. All animations use transform/opacity (see §8 below).

---

## 3. Safe Area Insets

**Result: ⚠️ APP OK — ADMIN CRITICAL FAILURE**

### App (packages/app)
`packages/app/index.html:5`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```
✅ `viewport-fit=cover` present
✅ `apple-mobile-web-app-capable: yes`
✅ `apple-mobile-web-app-status-bar-style: black-translucent`
✅ `theme-color: #0C0A09`

`layout.tsx:147` already uses `env(safe-area-inset-top)` correctly:
```tsx
<div className="h-[env(safe-area-inset-top)]" />
```

### Admin (packages/admin) — CRITICAL GAP
`packages/admin/index.html:5`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```
❌ **`viewport-fit=cover` MISSING** — `env(safe-area-inset-*)` returns `0` without this
❌ No `apple-mobile-web-app-capable`
❌ No `theme-color`
❌ No PWA manifest reference

If admin mobile is implemented without fixing this first, all safe-area padding will silently be `0px` on notched iPhones — content will be clipped by hardware notch.

---

## 4. iOS Input Zoom Prevention

**Result: ✅ CORRECTLY SPECIFIED in DESIGN.md**

DESIGN.md §5 Form Inputs:
> `Font-size: 16px (CRITICAL: prevents iOS auto-zoom)`

This is correctly called out. iOS Safari zooms the viewport when an input receives focus if `font-size < 16px`. The 16px minimum is the right requirement.

**Watch points at implementation time:**
- Desktop topbar search input in `layout.tsx:192` uses `text-sm` (14px) — desktop only, protected by `hidden lg:flex`, so NO risk currently
- Any mobile search bar (per DESIGN.md Pattern 2) MUST use `text-base` (16px) or `text-[16px]` explicitly
- `<select>` elements also trigger iOS zoom below 16px — the "Department" selector in Form Pattern 5 needs this too
- `<textarea>` (Description field, 120px) also affected — needs `text-base`

---

## 5. Bundle Size Impact

**Estimate: ~18–28KB gzipped additional JS**

| Component | Estimated gzipped |
|-----------|------------------|
| BottomNav (5 tabs, icons) | ~3–5KB |
| FAB component | ~1–2KB |
| BottomSheet (drag handle + backdrop + animation) | ~8–12KB |
| SwipeableListItem (touch gesture, snap physics) | ~6–9KB |
| **Total** | **~18–28KB** |

**Lucide icons**: Already bundled via tree-shaking. New icons (if any) add ~0.3KB each — negligible.

**Verdict**: Acceptable. A typical React mobile component suite at this scope runs 20–40KB gzipped. No external gesture library is specified in DESIGN.md — if `react-spring` or `@use-gesture/react` is added for pull-to-refresh and swipe-to-delete, add another ~15–25KB. That choice must be made explicitly.

**Risk area**: BottomSheet + SwipeableListItem together are the largest contributors and involve complex gesture code. If implemented naively (custom touch handlers), quality will suffer. If using a gesture library, bundle grows.

---

## 6. Existing Code Compatibility — App Navigation Paradigm Shift

**Result: ⚠️ MODERATE REFACTORING REQUIRED — not a rewrite, but significant**

### Current mobile shell (layout.tsx)
- Mobile topbar: hamburger → sliding sidebar overlay (25+ nav items across 4 sections)
- The sidebar overlay uses focus-trap, popstate handling, animation — well-built

### DESIGN.md proposal
- Bottom navigation (5 tabs: Hub, Dashboard, Chat, Agents, More)
- **NO sidebar on mobile**
- Mobile topbar shows page title, NOT "CORTHEX" brand + hamburger

### Gap analysis

| Current | DESIGN.md | Action needed |
|---------|-----------|---------------|
| `lg:hidden` topbar: hamburger + "CORTHEX" | `lg:hidden` topbar: back/title/actions | Modify topbar layout |
| Mobile sidebar overlay (25+ items) | Removed on mobile | Delete overlay + slide-in logic |
| Desktop sidebar: full sidebar | Desktop sidebar: unchanged | No change |
| No bottom nav | BottomNav (5 tabs) | NEW component |
| No FAB | FAB (context-dependent) | NEW component |
| No bottom sheet | BottomSheet | NEW component |

**The 25-item sidebar collapsing into 5 bottom tabs** is the hardest design decision:
- Hub, Dashboard, Chat, Agents → direct tabs
- "More" tab → opens bottom sheet showing remaining items (Departments, Jobs, Tiers, Settings, Costs, etc.)
- DESIGN.md does NOT specify the "More" sheet contents — this is a gap that needs resolution before implementation

**Code reuse assessment:**
- The mobile overlay's backdrop + animation code → can be reused for BottomSheet backdrop
- The `closeSidebar()` animation pattern → reusable for BottomSheet dismiss
- Focus trap logic → reusable for BottomSheet accessibility
- The `PAGE_NAMES` map → stays, used for topbar title

**Refactoring scope**: 2–3 days — BottomNav, BottomSheet shell, "More" sheet, modify Layout topbar, remove mobile sidebar overlay.

---

## 7. Admin Package Gap

**Result: ❌ DESIGN.md IS NOT REALISTIC FOR ADMIN — needs separate spec**

Admin `layout.tsx` has zero mobile awareness:
```tsx
<div className="flex h-screen bg-corthex-bg">
  <Sidebar />
  <main className="flex-1 overflow-y-auto">
    <div className="p-6">...</div>
  </main>
</div>
```

No `lg:hidden`, no mobile header, no `env(safe-area-inset-*)`, no responsive breakpoints anywhere.

**What admin needs for mobile parity:**
1. `packages/admin/index.html` — add `viewport-fit=cover` + PWA meta tags
2. Admin layout — mobile header (back/title pattern) + bottom tabs
3. Admin sidebar — `hidden` on mobile
4. Admin-specific bottom tabs — different nav items than app (admin deals with: Companies, Users, Billing, System Config — not Hub/Chat/Agents)
5. All admin pages — responsive card layouts (tables → cards on mobile)

**Effort estimate: 3–5 days** for admin mobile shell alone, plus page-level responsive work for each admin page (unknown count).

**Critical note**: DESIGN.md has NO admin-specific section. It defines an app navigation structure (Hub, Dashboard, Chat, Agents, More) that does NOT map to admin's nav structure. Admin needs its own mobile design spec before implementation can begin.

---

## 8. Animation Performance

**Result: ✅ ALL GPU-ACCELERATED — correctly specified**

| Animation | Property used | GPU-accelerated? |
|-----------|--------------|-----------------|
| Page slide-left/right | `translateX` | ✅ Yes |
| Bottom sheet slide-up | `translateY` | ✅ Yes |
| Tab crossfade | `opacity` | ✅ Yes |
| Card tap | `scale(0.97)` | ✅ Yes |
| Swipe-to-delete | `translateX + snap` | ✅ Yes |

All animations avoid layout-triggering properties (`width`, `height`, `top`, `left`, `margin`, `padding`). This is correct.

**Existing keyframes in `index.css`** already provide `slide-up` and `slide-in` using `transform` — reusable directly.

**`prefers-reduced-motion`** is already correctly implemented in `index.css:86–93` — applies globally to all animations.

**Gap — complex gestures not specified:**
- Pull-to-refresh ("rubber-band physics") — no implementation approach stated
- Swipe-to-delete ("translateX with snap") — velocity thresholding, snap points not specified
- Both require more than CSS keyframes; they need touch event handling with velocity tracking. DESIGN.md leaves this to implementation — acceptable for a design doc, but implementors need to pick a gesture library.

---

## Summary Table

| Area | Status | Risk |
|------|--------|------|
| Tailwind v4 color tokens | ✅ All present | LOW |
| Layout tokens (missing 2) | ⚠️ Gap | LOW |
| Safe area — App | ✅ Correct | NONE |
| Safe area — Admin | ❌ viewport-fit missing | **HIGH** |
| iOS input zoom | ✅ Specified correctly | LOW (verify at impl) |
| backdrop-blur performance | ✅ Acceptable | LOW |
| Bundle size | ✅ ~18–28KB acceptable | LOW–MEDIUM |
| App nav paradigm shift | ⚠️ Moderate refactor | MEDIUM |
| "More" tab contents | ❌ Unspecified | MEDIUM |
| Admin mobile gap | ❌ No spec, zero code | **HIGH** |
| Animation GPU-safety | ✅ All transform/opacity | NONE |
| Complex gestures | ⚠️ Library choice unspecified | MEDIUM |

---

## Score: 7 / 10

Deductions:
- **-1**: Admin `viewport-fit=cover` missing — will silently break safe-area on all notched iPhones
- **-1**: Admin has zero mobile code and no admin-specific mobile design spec
- **-1**: "More" tab navigation architecture not defined — 25 items can't become 5 without a clear bucketing strategy

---

## Top 3 Improvements Needed

### #1 — FIX IMMEDIATELY: Admin `index.html` missing `viewport-fit=cover`
```html
<!-- packages/admin/index.html — change this: -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<!-- to this: -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="theme-color" content="#0C0A09" />
```
Without this, all safe-area work in admin silently returns `0`. This is a one-line fix that must happen before any admin mobile layout work.

### #2 — Define the "More" tab navigation architecture
The DESIGN.md specifies 5 bottom tabs (Hub, Dashboard, Chat, Agents, More) but the app sidebar has 25+ items across 4 sections. The "More" tab needs a defined structure:
- Which items go in "More"?
- Is "More" a bottom sheet with a full item list, or a dedicated "More" page?
- How does notification badge (currently on Notifications nav item) surface on mobile?

This is a design decision, not a code decision — but without it, implementation cannot begin.

### #3 — Add 2 mobile layout tokens to `@theme`
```css
/* Add to packages/app/src/index.css @theme block */
--mobile-topbar-height: 48px;   /* DESIGN.md §4: "48px height" (≠ desktop --topbar-height: 56px) */
--bottom-nav-height: 56px;      /* DESIGN.md §4: "56px + safe-area" */
```
These let FAB positioning and content padding calculations use semantic tokens instead of magic numbers, consistent with how the desktop uses `--topbar-height` and `--sidebar-width`.
