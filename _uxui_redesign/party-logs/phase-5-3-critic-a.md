# Phase 5-3 Critic A — Accessibility: COLOR CONTRAST + VISUAL

**Role:** CRITIC-A (Accessibility — Color Contrast + Visual)
**Date:** 2026-03-25
**Files reviewed:**
- `packages/app/src/styles/themes.css`
- `packages/app/src/index.css`
- `packages/app/src/pages/login.tsx`
- `packages/app/src/pages/dashboard.tsx` (partial)
- `packages/app/src/components/layout.tsx`
- `packages/app/src/components/sidebar.tsx`
- `.stitch/DESIGN.md`

---

## Methodology

WCAG 2.1 AA thresholds applied:
- Normal text (<18pt or <14pt bold): **4.5:1 minimum**
- Large text (≥18pt / ≥14pt bold): **3:1 minimum**
- UI components / graphical objects (SC 1.4.11): **3:1 minimum**
- Color-not-sole-info (SC 1.4.1): status must not rely on color alone
- Focus indicators (SC 1.4.11 + 2.4.7): must be visible
- Reduced motion (best practice / SC 2.3.3 AAA): noted but not scored as AA

All contrast ratios calculated using WCAG relative luminance formula:
`L = 0.2126 R + 0.7152 G + 0.0722 B` (linearized sRGB)

---

## Theme 1: COMMAND (Dark)

### Text / Background Pairs

| Pair | Foreground | Background | Ratio | WCAG AA |
|------|-----------|-----------|-------|---------|
| Primary text on bg | #FAFAF9 (L=0.954) | #0C0A09 (L=0.003) | **18.9:1** | ✅ PASS |
| Primary text on surface | #FAFAF9 | #1C1917 (L=0.010) | **16.8:1** | ✅ PASS |
| Primary text on elevated | #FAFAF9 | #292524 (L=0.020) | **14.4:1** | ✅ PASS |
| Secondary text on bg | #A8A29E (L=0.366) | #0C0A09 | **7.85:1** | ✅ PASS |
| Secondary text on surface | #A8A29E | #1C1917 | **6.94:1** | ✅ PASS |
| **Disabled text on surface** | **#57534E (L=0.087)** | **#1C1917** | **2.28:1** | **❌ FAIL** |
| text-on-accent on accent | #0C0A09 (L=0.003) | #CA8A04 (L=0.308) | **6.75:1** | ✅ PASS |
| Accent icon on bg | #CA8A04 | #0C0A09 | **6.75:1** | ✅ PASS |
| Error text on error-muted bg | #EF4444 (L=0.229) | ~L=0.020 (blended) | **~3.99:1** | **❌ FAIL** (14px/400 text) |
| KpiCard trend ↓ (red-600) on surface | #DC2626 (L=0.169) | #1C1917 | **3.65:1** | **❌ FAIL** (12px/700 — below 14pt bold threshold) |
| Sidebar text on sidebar-bg | #A8A29E | #0C0A09 | **7.85:1** | ✅ PASS |
| Sidebar active text on sidebar-bg | #FAFAF9 | #0C0A09 | **18.9:1** | ✅ PASS |

### Specific Violations — COMMAND

**FAIL-1: text-disabled used for active login footer links (2.28:1)**
```tsx
// login.tsx:132-134
<span className="text-corthex-text-disabled cursor-pointer ...">아이디 찾기</span>
<span className="text-corthex-border">|</span>    ← border color on surface: ~1.8:1
<span className="text-corthex-text-disabled cursor-pointer ...">비밀번호 찾기</span>
```
`text-disabled` (#57534E) is intended for disabled/placeholder content. Using it on **interactive, clickable text** violates WCAG 1.4.3. These are active links with `cursor-pointer`.

**FAIL-2: Error text (EF4444) on muted error bg (~3.99:1)**
The error `<div>` in login.tsx uses `text-corthex-error` (#EF4444) on `bg-corthex-error/10`. The effective blended bg (10% EF4444 on surface #1C1917) yields ~L=0.020. Contrast ≈ 3.99:1. Needs 4.5:1 for 14px/400 text.

**FAIL-3: Hardcoded `text-red-600` in KpiCard (3.65:1 on dark surface)**
`dashboard.tsx:88` uses `text-red-600` (#DC2626) outside the theme system. On command surface (#1C1917), contrast ≈ 3.65:1. At `text-xs font-bold` (12px/700, well below 18pt), requires 4.5:1. FAIL.

### Focus Indicators — COMMAND

- **Login inputs**: `focus:ring-1 focus:ring-corthex-accent` — 1px ring. Visible but WCAG 2.2 SC 2.4.11 requires ≥2px outline or equivalent. (WCAG 2.1 SC 2.4.7 only requires "visible", so technically 2.1 AA compliant, but 2.2 fail.)
- **Sidebar NavLinks**: No `focus-visible:` class at all. Keyboard focus on navigation items is **invisible**. This fails WCAG 2.1 SC 2.4.7 (Focus Visible).
- **Topbar buttons** (Menu, Bell, Search): No focus-visible styling. FAIL.

### Color-Not-Sole-Info — COMMAND

- **Notification unread dot** (layout.tsx:149-151, 191-193):
  ```tsx
  <span className="... w-2 h-2 rounded-full bg-corthex-accent border-2 border-white" />
  ```
  8×8px dot — color-only. No text alternative, no `aria-label` update on unread state. The outer `aria-label="알림"` doesn't convey unread status. Fails WCAG 1.4.1 (Use of Color).
- **KpiCard trend icons**: Uses `<TrendingUp>` / `<TrendingDown>` icons PLUS color change PLUS text label. ✅ PASS.
- **Sidebar notification badge**: Shows numeric count (e.g. "5") in red pill. ✅ PASS (color + number).

### Reduced Motion — COMMAND
`index.css` defines `slide-in`, `slide-up`, `cursor-blink`, `pulse-dot`, `slideInRight` animations with NO `@media (prefers-reduced-motion: reduce)` override. Users with vestibular disorders get no motion reduction. Best practice FAIL (WCAG 2.3.3 AAA — informational note only).

### COMMAND Score: **6/10**
Core text contrast is solid. Failures in: disabled text as active links, error text ratio, hardcoded red in dark bg, no focus on nav items, color-only unread dot.

---

## Theme 2: STUDIO (Light)

### Text / Background Pairs

| Pair | Foreground | Background | Ratio | WCAG AA |
|------|-----------|-----------|-------|---------|
| Primary text on bg | #164E63 (L=0.065) | #F9FAFB (L=0.953) | **8.72:1** | ✅ PASS |
| Secondary text on bg | #0E7490 (L=0.146) | #F9FAFB | **5.12:1** | ✅ PASS |
| **Disabled text on bg** | **#9CA3AF (L=0.363)** | **#F9FAFB** | **2.43:1** | **❌ FAIL** |
| **text-on-accent on accent (button)** | **#164E63 (L=0.065)** | **#0891B2 (L=0.235)** | **2.48:1** | **❌ FAIL (P0)** |
| Sidebar text on sidebar-bg | #CFFAFE (L=0.887) | #0E7490 (L=0.146) | **4.78:1** | ✅ PASS |
| Sidebar active text on sidebar-bg | #FFFFFF | #0E7490 | **5.36:1** | ✅ PASS |
| Sidebar brand icon on sidebar-bg | #22D3EE (L=0.530) | #0E7490 (L=0.146) | **2.96:1** | **❌ FAIL** (UI component needs 3:1) |

### Specific Violations — STUDIO

**FAIL-4 (P0): Login submit button text fails contrast (2.48:1)**
```tsx
// login.tsx:113 — button with:
// bg-corthex-accent (#0891B2), text-corthex-text-on-accent (#164E63)
```
`text-on-accent` was changed in Fix 5 to address failure on success green. But the fix introduced a **new, worse failure** on the actual accent color (#0891B2). The primary login button in Studio has dark teal text on medium cyan — contrast 2.48:1, catastrophically failing the 4.5:1 requirement.

Root cause: Fix 5 comment says "was #FFFFFF (2.18:1 on #22C55E)" — they measured `text-on-accent` against the **success** color, not the **accent** color. But #164E63 on #0891B2 gives only 2.48:1, which is worse than the original #FFFFFF on #0891B2 (3.68:1).

Fix recommendation: Studio `text-on-accent` should be `#FFFFFF` or something that achieves ≥4.5:1 on #0891B2. Specifically: #FFFFFF gives 3.68:1 (fails for small text), or deep dark #0C4A6E which gives ≥7:1 (passes). Or change the accent button bg to a darker shade (#0E7490 as accent-deep → white text gives better ratio).

Actually: #FFFFFF on accent-deep (#0E7490): (1.0+0.05)/(0.146+0.05) = 1.05/0.196 = **5.36:1** ✅. Using `accent-deep` as button bg with white text would pass.

**FAIL-5: text-disabled used for active login footer links (2.43:1)**
Same pattern as COMMAND theme. #9CA3AF on #F9FAFB. Active clickable links. FAIL.

**FAIL-6: sidebar-brand (#22D3EE) on sidebar-bg (#0E7490): 2.96:1**
1.4% below the 3:1 UI component threshold. Marginal but technically a fail.

### Focus / Motion — STUDIO
Identical global failures: no focus-visible on NavLinks, 1px input rings, no reduced-motion. Plus: same notification dot color-only issue.

### STUDIO Score: **4/10**
P0 critical failure: the primary login button has 2.48:1 text contrast — the central interactive element in the entire app is inaccessible. This alone disqualifies Studio from AA compliance.

---

## Theme 3: CORPORATE (Light)

### Text / Background Pairs

| Pair | Foreground | Background | Ratio | WCAG AA |
|------|-----------|-----------|-------|---------|
| Primary text on bg | #1E293B (L=0.022) | #F8FAFC (L=0.953) | **13.93:1** | ✅ PASS |
| Secondary text on bg | #64748B (L=0.170) | #F8FAFC | **4.56:1** | ✅ PASS (barely) |
| **Disabled text on bg** | **#CBD5E1 (L=0.654)** | **#F8FAFC** | **1.43:1** | **❌ FAIL CRITICAL** |
| text-on-accent on accent | #FFFFFF (L=1.0) | #2563EB (L=0.153) | **5.17:1** | ✅ PASS |
| **text-on-accent on accent-hover** | **#FFFFFF (L=1.0)** | **#60A5FA (L=0.363)** | **2.54:1** | **❌ FAIL** |
| Sidebar text on sidebar-bg | #94A3B8 (L=0.359) | #1E293B (L=0.022) | **5.68:1** | ✅ PASS |
| Sidebar active text on sidebar-bg | #FFFFFF | #1E293B | **14.5:1** | ✅ PASS |

### Specific Violations — CORPORATE

**FAIL-7 (CRITICAL): text-disabled used for active login footer links (1.43:1)**
Corporate `text-disabled` is #CBD5E1 — a near-white color nearly invisible on the near-white page background. Yet login.tsx uses it for active "아이디 찾기" / "비밀번호 찾기" links. At 1.43:1, these links are functionally invisible.

**FAIL-8 (P1): Button hover state fails (2.54:1)**
```tsx
// login.tsx:113
// bg-corthex-accent-hover (#60A5FA) on hover, text-corthex-text-on-accent (#FFFFFF)
```
Fix 2 changed `accent-hover` from #3B82F6 to #60A5FA to avoid info-color collision. But #60A5FA is **much lighter** — white text on light blue gives only 2.54:1. The moment a user hovers the login button, it fails contrast.

**FAIL-9: text-secondary (#64748B) on bg barely passes (4.56:1)**
Technically passes 4.5:1 but has essentially zero headroom. Any theming change or opacity modification could push it below threshold. No buffer.

### Focus / Motion — CORPORATE
Same global failures. Additionally: sidebar-active bg is `#2563EB33` (20% opacity blue on dark sidebar) — the focus/active blend creates a blueish dark background. White active text still passes (>14:1), but tab-focused items without explicit `focus-visible:ring` classes remain invisible.

### CORPORATE Score: **4/10**
Critical: text-disabled at 1.43:1 used as active link text makes two login links functionally invisible. Button hover state fails. Would score 3/10 except the main content/sidebar passes well.

---

## Cross-Theme Summary

### Global Issues (all 3 themes)

| Issue | File | SC Violated | Severity |
|-------|------|-------------|----------|
| Sidebar NavLinks: no focus-visible | sidebar.tsx | 2.4.7 Focus Visible | P1 |
| Topbar buttons: no focus-visible | layout.tsx | 2.4.7 Focus Visible | P1 |
| Input focus ring: 1px only | login.tsx, layout.tsx | (WCAG 2.2 2.4.11) | Info |
| Notification bell dot: color-only unread state | layout.tsx:149-151, 191-193 | 1.4.1 Use of Color | P1 |
| No prefers-reduced-motion CSS | index.css | (2.3.3 AAA, best practice) | Info |
| `text-disabled` used on active interactive text | login.tsx:132-135 | 1.4.3 Contrast | P0 |

### Per-Theme Unique Issues

| Theme | Issue | SC | Severity |
|-------|-------|-----|----------|
| COMMAND | Error text 3.99:1 (14px normal) | 1.4.3 | P1 |
| COMMAND | Hardcoded `text-red-600` on dark surface: 3.65:1 | 1.4.3 | P1 |
| STUDIO | Login button text 2.48:1 (primary CTA) | 1.4.3 | P0 |
| STUDIO | sidebar-brand icon 2.96:1 | 1.4.11 | P2 |
| CORPORATE | text-disabled as active link: 1.43:1 | 1.4.3 | P0 |
| CORPORATE | Button hover state 2.54:1 | 1.4.3 | P1 |

---

## Scores

| Theme | Score | Key Reason |
|-------|-------|-----------|
| COMMAND | **6 / 10** | Core text passes. Failures: disabled-as-active links, error text ratio, hardcoded red-600, no nav focus |
| STUDIO | **4 / 10** | P0: login button text 2.48:1 — primary CTA inaccessible |
| CORPORATE | **4 / 10** | P0: text-disabled 1.43:1 on active links — invisible interactive text |
| **OVERALL** | **5 / 10** | Two of three themes have P0 violations on the login page's primary interactive elements |

---

## P0 Issues Requiring Immediate Fix

### P0-A: STUDIO login button text contrast (2.48:1 → needs 4.5:1)
**Token:** `--color-corthex-text-on-accent` in `[data-theme="studio"]`
**Current:** `#164E63` (dark teal — fails on #0891B2)
**Fix option:** Change Studio `text-on-accent` to `#FFFFFF` AND change accent button bg to `accent-deep` (#0E7490) to achieve 5.36:1. Or set `text-on-accent: #FFFFFF` directly — on #0891B2 it gives 3.68:1 (still fails for small text). Better: set `accent` button bg to `#065F7A` (darker) where white gives 4.5:1+.

### P0-B: CORPORATE text-disabled used as active link (1.43:1)
**Token:** `--color-corthex-text-disabled` in `[data-theme="corporate"]`
**Problem root:** CSS token is correct for disabled/placeholder use. Login.tsx misuses it for active interactive text.
**Fix:** Create a dedicated `text-link` or `text-subtle` token at ≥4.5:1 on bg, and update login.tsx footer links to use it instead of `text-disabled`.

### P0-C: COMMAND — same login footer link issue (2.28:1)
Same root cause as P0-B. `text-disabled` on interactive links.

---

## P1 Issues

1. **Sidebar focus visibility**: Add `focus-visible:ring-2 focus-visible:ring-corthex-accent focus-visible:outline-none` to NavLink className
2. **Topbar button focus**: Same ring treatment on Menu, Bell, Search buttons
3. **CORPORATE button hover**: `accent-hover` #60A5FA with white text = 2.54:1. Either darken accent-hover or add `hover:text-corthex-text-primary` (dark text on hover)
4. **COMMAND error text ratio**: Either darken error bg or use `bg-corthex-error/5` (less tint) to improve underlying bg
5. **Notification dot**: Add `aria-label="알림 {n}개 읽지 않음"` dynamically or `<span className="sr-only">{unreadCount} unread</span>`
