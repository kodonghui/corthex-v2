# Phase 5-3 Critic A — Cycle 2 Re-Review (Color Contrast + Visual)

**Role:** CRITIC-A (Accessibility — Color Contrast + Visual)
**Date:** 2026-03-25
**Files re-read:** themes.css, login.tsx, index.css

---

## Fix Verification

### Fix 1: Studio text-on-accent → #FFFFFF

**themes.css line 93:**
```css
--color-corthex-text-on-accent: #FFFFFF; /* white on cyan #0891B2 = 4.54:1 PASS */
```

**VERIFICATION RESULT: ❌ COMMENT IS WRONG — STILL FAILS**

Calculated using WCAG relative luminance formula:
```
#0891B2 = RGB(8, 145, 178)
R: 8/255 = 0.03137 → linear (< 0.04045): 0.03137/12.92 = 0.002428
G: 145/255 = 0.56863 → linear: ((0.56863+0.055)/1.055)^2.4 = 0.59107^2.4 = 0.28318
B: 178/255 = 0.69804 → linear: ((0.69804+0.055)/1.055)^2.4 = 0.71377^2.4 = 0.44466

L(#0891B2) = 0.2126×0.002428 + 0.7152×0.28318 + 0.0722×0.44466
           = 0.000516 + 0.202538 + 0.032104 = 0.23516
```

Contrast ratio of #FFFFFF (L=1.0) on #0891B2 (L=0.2352):
```
(1.0 + 0.05) / (0.2352 + 0.05) = 1.05 / 0.2852 = 3.68:1
```

**3.68:1 < 4.5:1 threshold for normal text — FAIL.**

The claim "4.54:1 PASS" in the comment appears to be a calculation error. One likely cause: the writer may have used an incorrect luminance value for #0891B2, possibly mixing up the cyan hue's channel values or misapplying the linearization exponent. The actual result is 3.68:1.

The button text (`font-semibold` = 600 weight) at ~16px inherited size does NOT meet the large-text threshold (requires 700+ weight or ≥18pt). Therefore 4.5:1 remains required.

Additional: on hover state (`accent-hover: #06B6D4`):
```
L(#06B6D4) = 0.2126×0.001821 + 0.7152×0.46760 + 0.0722×0.65803 = 0.38238
(1.0+0.05)/(0.38238+0.05) = 1.05/0.43238 = 2.43:1 — FAIL
```
The hover state is worse than the default state.

**P0 status: UNRESOLVED.** Studio login button text remains inaccessible.

---

### Fix 2: Login links → text-secondary

**login.tsx lines 132, 134:**
```tsx
<span className="text-corthex-text-secondary cursor-pointer ...">아이디 찾기</span>
<span className="text-corthex-text-secondary cursor-pointer ...">비밀번호 찾기</span>
```
✅ Confirmed changed from `text-corthex-text-disabled`.

Contrast on `bg-corthex-surface` (login card bg):
| Theme | Foreground | Background | Ratio | Result |
|-------|-----------|-----------|-------|--------|
| COMMAND | #A8A29E (L=0.366) | #1C1917 (L=0.010) | **6.94:1** | ✅ PASS |
| STUDIO | #0E7490 (L=0.146) | #FFFFFF (L=1.0) | **5.36:1** | ✅ PASS |
| CORPORATE | #64748B (L=0.170) | #FFFFFF (L=1.0) | **4.77:1** | ✅ PASS |

**Fix confirmed effective. P0-B and P0-C resolved.**

---

### Fix 3: prefers-reduced-motion

**index.css lines 84-92:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
✅ Confirmed added. Universal suppression of animations + transitions. Covers `slide-in`, `slide-up`, `cursor-blink`, `pulse-dot`, `slideInRight`. Implementation is correct pattern.

**Reduced-motion: RESOLVED.**

---

### Fix 4: Global :focus-visible

**index.css lines 94-98:**
```css
:focus-visible {
  outline: 2px solid var(--color-corthex-accent);
  outline-offset: 2px;
}
```
✅ Confirmed added. 2px outline, uses theme accent token.

**Effectiveness analysis per context:**

| Context | Accent color | Background | Ratio | Effective? |
|---------|-------------|-----------|-------|------------|
| COMMAND nav items | #CA8A04 (L=0.308) | #0C0A09 (L=0.003) | **6.75:1** | ✅ Yes |
| COMMAND topbar buttons | #CA8A04 | #1C1917 (L=0.010) | **5.96:1** | ✅ Yes |
| STUDIO nav items | #0891B2 (L=0.235) | #0E7490 (L=0.146) | **1.45:1** | ❌ Near-invisible |
| STUDIO topbar buttons | #0891B2 | #F9FAFB (L=0.953) | **3.68:1** | ⚠️ Marginal (needs 3:1 for UI, barely passes) |
| CORPORATE nav items | #2563EB (L=0.153) | #1E293B (L=0.022) | **2.82:1** | ❌ Below 3:1 for UI component |
| CORPORATE topbar buttons | #2563EB | #F8FAFC (L=0.953) | **4.52:1** | ✅ Yes |

**New issue introduced (Cycle 2):** Studio sidebar focus ring is nearly invisible (1.45:1) because accent (#0891B2) and sidebar bg (#0E7490) are close in hue and lightness. Corporate sidebar focus ring (2.82:1) also falls below the 3:1 UI component threshold.

**Input focus caveat:** login.tsx inputs use `focus:outline-none` class, which generates `.focus\:outline-none:focus { outline: none }`. This has higher CSS specificity (0,2,0) than the global `:focus-visible` (0,1,0). Result: inputs override the global rule and show only the existing `focus:ring-1` (1px box-shadow ring). The 2px global rule does NOT apply to these inputs.

For WCAG 2.1 SC 2.4.7: the 1px box-shadow ring IS visible, so technically passes "Focus Visible." For WCAG 2.2 SC 2.4.11 (Focus Appearance), 2px is required — inputs still fall short.

**Focus fix: PARTIALLY EFFECTIVE.** Works for nav items and buttons in Command/Corporate topbar. Fails for Studio sidebar and Corporate sidebar due to accent color proximity to bg.

---

## Remaining Issues After Cycle 2

### Still P0

| ID | Theme | Issue | Ratio | Threshold |
|----|-------|-------|-------|-----------|
| R1 | **STUDIO** | Login button text (#FFFFFF on #0891B2) | **3.68:1** | 4.5:1 |
| R2 | **STUDIO** | Login button hover (#FFFFFF on #06B6D4) | **2.43:1** | 4.5:1 |

### Still P1

| ID | Theme | Issue | Ratio | SC |
|----|-------|-------|-------|----|
| R3 | CORPORATE | Button hover: #FFFFFF on #60A5FA | **2.54:1** | 1.4.3 |
| R4 | COMMAND | Error text (#EF4444 on muted bg ~L=0.020) | **~3.99:1** | 1.4.3 |
| R5 | COMMAND | Hardcoded `text-red-600` on dark surface (#1C1917) | **3.65:1** | 1.4.3 |
| R6 | ALL | Notification bell dot: color-only unread indicator | — | 1.4.1 |
| R7 | STUDIO | Focus ring on sidebar: accent on sidebar-bg | **1.45:1** | 2.4.7 (new) |
| R8 | CORPORATE | Focus ring on sidebar: accent on sidebar-bg | **2.82:1** | 1.4.11 UI (new) |

### Still Info/Low Priority

| ID | Issue | Notes |
|----|-------|-------|
| I1 | Footer text uses `text-disabled` (copyright, terms) | Non-interactive text but fails in all themes (e.g. 1.43:1 corporate). Low risk (no interactive function). |
| I2 | Input `focus:outline-none` overrides global ring | 1px ring is visible per WCAG 2.1; 2.2 concern only. |

---

## Score Update

### COMMAND: 6/10 → **7/10**
- ✅ Login links fixed (6.94:1)
- ✅ Reduced-motion added
- ✅ Focus visible added (effective on nav + topbar)
- ❌ Error text 3.99:1 remains
- ❌ Hardcoded `text-red-600` 3.65:1 remains
- ❌ Notification dot color-only remains

### STUDIO: 4/10 → **5/10**
- ✅ Login links fixed (5.36:1)
- ✅ Reduced-motion added
- ⚠️ Focus added but near-invisible on sidebar (1.45:1)
- ❌ **P0 NOT FIXED**: Button text 3.68:1 (comment says 4.54:1 but calculation is wrong)
- ❌ Button hover 2.43:1

### CORPORATE: 4/10 → **6/10**
- ✅ Login links fixed (4.77:1)
- ✅ Reduced-motion added
- ⚠️ Focus added but below 3:1 on sidebar (2.82:1)
- ❌ Button hover 2.54:1 remains
- ❌ text-secondary barely passes (4.56:1 — 1.3% headroom)

### OVERALL: 5/10 → **6/10**

---

## Required Cycle 3 Fixes

### CRITICAL — Must fix before passing

**C3-1: Studio button text (P0)**
The comment "4.54:1 PASS" is wrong — actual ratio is 3.68:1.
- Root cause: `accent: #0891B2` is too light to hold white text at 4.5:1
- Fix option A: Use `accent-deep: #0E7490` as button background — white text on #0E7490 = **5.36:1** ✅
- Fix option B: Set `text-on-accent: #07354A` (very dark teal) — gives ≥7:1 on #0891B2, but needs to be verified
- Fix option C (cleanest): In login.tsx button, apply `bg-corthex-accent-deep` instead of `bg-corthex-accent` for Studio only via a `data-theme` CSS rule

**C3-2: Studio sidebar focus ring (new issue from C2)**
`--color-corthex-accent: #0891B2` is too similar to sidebar bg `#0E7490`.
- Fix: Add a `--color-corthex-focus-ring` token per theme set to a high-contrast value on sidebar bg
  - STUDIO: `--color-corthex-focus-ring: #FFFFFF` (on sidebar #0E7490 → 5.36:1) ✅
  - COMMAND: can reuse accent (#CA8A04) as focus token (already 6.75:1)
  - CORPORATE: `--color-corthex-focus-ring: #FFFFFF` (on sidebar #1E293B → 14.5:1) ✅
- Then update global rule: `outline: 2px solid var(--color-corthex-focus-ring, var(--color-corthex-accent))`

### High Priority

**C3-3: Corporate button hover**
`#FFFFFF on #60A5FA = 2.54:1`. Either:
- Darken accent-hover to preserve info collision avoidance (e.g. `#1D4ED8` = accent-deep gives 8.59:1 with white)
- Or use a separate `--color-corthex-accent-hover` that is sufficiently dark

**C3-4: Command error text ratio (~3.99:1)**
Increase error-muted bg opacity from `/10` to `/5` (less tint) to reduce effective bg luminance, or raise font weight to bold (700) to qualify as large-text (3:1 threshold).

**C3-5: Notification unread dot — color-only**
Add `<span className="sr-only">{unreadCount} 읽지 않은 알림</span>` adjacent to the dot in layout.tsx.
