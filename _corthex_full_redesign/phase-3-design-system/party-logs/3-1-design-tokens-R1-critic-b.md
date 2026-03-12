# Phase 3-1: Design Tokens — Round 1 Review
**Reviewer**: CRITIC-B (Amelia / Quinn / Bob)
**Date**: 2026-03-12
**File Reviewed**: `_corthex_full_redesign/phase-3-design-system/design-tokens.md`

---

## AMELIA (Frontend / Tailwind / Compile-time correctness)

### Issue A-1 [CRITICAL]: `borderRadius` overrides in tailwind.config.ts contradict §4.1 token table

**§4.1 Border Radius Scale says:**
| Token | px | Tailwind |
|---|---|---|
| `radius-sm` | **2px** | `rounded-sm` |
| `radius-md` | **6px** | `rounded-md` |

**§8.2 tailwind.config.ts says:**
```ts
borderRadius: {
  sm: '0.375rem',  // 6px ← NOT 2px
  md: '0.5rem',    // 8px ← NOT 6px
  lg: '0.5rem',    // 8px ← same as md, makes md and lg identical
}
```

When a dev writes `rounded-sm`, Tailwind generates `border-radius: 0.375rem` (6px), not 2px.
When a dev writes `rounded-md`, they get 8px, not 6px.
`rounded-md` and `rounded-lg` are now **identical** (both 0.5rem/8px) — the distinction is gone.

Also: the override `DEFAULT: '0.5rem'` means bare `rounded` = 8px. That's fine if intentional, but it conflicts with the §4.1 table that defines no "default" token.

**Fix required**: Either update §4.1 to match the config values, or correct the config. My vote: fix the config.
- `sm` should be `'0.125rem'` (2px)
- `md` should be `'0.375rem'` (6px)
- `lg` should be `'0.5rem'` (8px)
- `DEFAULT` can stay `'0.5rem'` since bare `rounded` is rarely used.

---

### Issue A-2 [CRITICAL]: `--font-family-sans` is wrong in Tailwind v4 `@theme` (§8.1)

**§2.1 correctly uses:**
```css
--font-sans: 'Work Sans', ...
--font-mono: ui-monospace, ...
```

**§8.1 @theme block uses:**
```css
--font-family-sans: 'Work Sans', ...
--font-family-mono: ui-monospace, ...
```

In Tailwind CSS v4, the CSS variable that powers `font-sans` utility is `--font-sans`, **not** `--font-family-sans`. Tailwind v4's default theme maps `--font-sans → font-family for font-sans class`. Using `--font-family-sans` in `@theme` defines a custom var that Tailwind doesn't map to any utility class — `font-sans` will fall back to Tailwind's built-in stack (Inter/system-ui), **Work Sans will not be applied**.

§2.1 is correct. §8.1 is wrong. The `@theme` block needs:
```css
--font-sans: 'Work Sans', -apple-system, 'Apple SD Gothic Neo', ...;
--font-mono: ui-monospace, 'Cascadia Code', ...;
```

This is a **ship-blocking bug** — Work Sans would never render.

---

### Issue A-3 [MEDIUM]: `duration-400` listed as valid Tailwind utility (§5.1)

In §5.1 Duration Scale, the AGORA speech card entry reads:
> `duration-400 (or duration-[400ms])`

Tailwind CSS ships: `duration-75`, `duration-100`, `duration-150`, `duration-200`, `duration-300`, `duration-500`, `duration-700`, `duration-1000`. **There is no `duration-400`**.

The transitionDuration override in tailwind.config.ts does define `'400': '400ms'` — but in Tailwind v4, the JS config `transitionDuration` extends are NOT automatically surfaced as utilities the same way Tailwind v3 did. The document should mandate `duration-[400ms]` exclusively (consistent with the confirmed `duration-[250ms]` precedent).

---

## QUINN (Accessibility / WCAG 2.2 / Contrast ratios)

### Issue Q-1 [CRITICAL]: `text-zinc-500` for "Empty state heading" fails WCAG AA — not large text

**§2.5 Semantic Type Ramp:**
> Empty state heading: `text-base font-medium text-zinc-500` → **16px / weight 500**

**§1.3 explicitly states:**
> `text-zinc-500` on `bg-zinc-900` = **3.4:1** — "AA large text only (use for 18px+/16px bold+)"

WCAG 2.1 defines "large text" as:
- At least **18pt (24px)** at any weight, OR
- At least **14pt (18.67px)** at **bold (700)**

**16px at weight 500 is normal text.** It requires 4.5:1 for AA. 3.4:1 FAILS.

Weight 500 (medium) is not "bold" by WCAG definition — only weight 700+ counts. The document's own footnote says "16px bold+" — but the class is `font-medium` (500), not `font-bold` (700).

Empty states are not decorative — they communicate important system state (no data, no results, no agents). This failure affects usability for users with low vision.

**Fix**: Change "Empty state heading" to `text-zinc-400` (5.7:1 on zinc-900, ✅ AA), or use `text-zinc-500 text-lg` (18px at 500 ≈ large text boundary — marginal). Recommend `text-zinc-400`.

---

### Issue Q-2 [CRITICAL]: Modal footer divider uses `border-zinc-800` on `bg-zinc-900` — spec's own "invisible" rule violated

**§10.2 Modal Dialog:**
```tsx
// Footer: flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-800
```

**§1.3 Critical Border Rule (confirmed):**
> `border-zinc-800` (#27272A) on `bg-zinc-900` (#18181B) → **invisible** ❌

The modal footer's horizontal rule is `border-zinc-800` on a `bg-zinc-900` dialog body. Per the document's own rule, this renders as a **near-invisible line** (contrast ~1.3:1 between #27272A and #18181B — far below any usable threshold).

A modal footer divider that is invisible provides no visual separation between the dialog content and action buttons — this degrades scannability and increases cognitive load.

**Fix**: `border-t border-zinc-700` (the ALWAYS rule from §1.3). One character change.

---

### Issue Q-3 [MEDIUM]: Focus ring offset hardcoded to `ring-offset-zinc-950` — wrong for in-card elements

**§9.4 Focus Ring Standard:**
```tsx
focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950
```

This is **globally prescribed** as the standard for ALL interactive elements. But:

- Most buttons and inputs live inside cards (`bg-zinc-900`) or elevated panels (`bg-zinc-800`)
- `ring-offset-zinc-950` creates a zinc-950 (#09090B) colored gap between the ring and the element
- On a zinc-900 (#18181B) card background, this offset visually "floats" the ring in a slightly different shade — subtle but creates a double-border visual artifact

WCAG 2.4.11 (Focus Appearance — Level AA in 2.2) requires the focus indicator to have sufficient contrast with adjacent colors. The zinc-950 offset inside zinc-900 creates a ~1.4:1 difference between offset and background — which may not meet the 3:1 minimum required.

**Fix**: Add context-aware rule: elements at page-level → `ring-offset-zinc-950`, elements inside L1 surface → `ring-offset-zinc-900`, elements inside L2 surface → `ring-offset-zinc-800`. Document this explicitly in §9.4.

---

## BOB (Performance / Bundle / Loading)

### Issue B-1 [HIGH]: Google Fonts link missing `preconnect` — 100–300ms cold-load penalty

**§2.1 specifies:**
```html
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

This is the font link in `packages/app/index.html`. Missing:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

Without preconnect, the browser must complete a full DNS + TCP + TLS handshake to fonts.googleapis.com **before** the font CSS request can start, then another to fonts.gstatic.com for the actual font files. On a cold connection, this is 100–300ms of blocked font rendering.

`display=swap` prevents FOIT (invisible text), but without preconnect the FOUT (flash of unstyled text) window is unnecessarily wide. For a SPA dashboard app used daily, this is a visible flash on every hard-reload.

**Fix**: Add both preconnect links **before** the fonts stylesheet link in `packages/app/index.html` AND `packages/admin/index.html` (noted as needing the Work Sans link anyway per §2.1 admin note).

---

### Issue B-2 [CRITICAL / A11y crossover]: `Loader2 animate-spin` has no `motion-reduce:animate-none` (§6.5)

**§5.4 Prefers-Reduced-Motion:**
> "Every animated element must include `motion-reduce:` class. This is an **absolute requirement**."

**§6.5 Icon Assignments:**
> | Working | `Loader2` + `animate-spin` | Active agent processing |

No `motion-reduce:animate-none` anywhere in the `Loader2` spec. This directly contradicts §5.4's "absolute requirement."

For users with vestibular disorders (motion sensitivity), a continuously spinning loader that ignores `prefers-reduced-motion: reduce` can cause dizziness and nausea. This is both a spec violation and a real accessibility harm.

Every other animation in the document has the `motion-reduce:` counterpart. `Loader2` was missed.

**Fix**:
```tsx
<Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none text-zinc-400" />
```
And update §6.5 table to show this pattern explicitly.

---

### Issue B-3 [MEDIUM]: Weight 300 (font-light) included in Google Fonts request — unnecessary payload

**§2.1 font request:** `wght@300;400;500;600;700`

**§2.3 Weight Scale usage for font-light:**
> `font-light` | 300 | "De-emphasized large text (**rarely used**)"

Loading font-light (300) costs ~15–20KB (woff2 subset). "Rarely used" doesn't justify the payload hit on every page load. The §2.3 table lists only ONE use case that is described as "rarely used."

No component in §2.5 Semantic Type Ramp, §10 Component Composite Tokens, or §9 Interactive State Specs uses `font-light`. It appears nowhere in the concrete specifications.

**Fix**: Remove weight 300 from the Google Fonts request → `wght@400;500;600;700`. If needed for a landing page section, it can be added back lazily or via a separate font link on the landing route only.

---

## PRELIMINARY SCORES (Round 1)

| Dimension | Score | Notes |
|-----------|-------|-------|
| Tech/Compile correctness | 6/10 | Two ship-blocking bugs (font var name, borderRadius) |
| A11y / WCAG | 7/10 | 3 issues; 2 are clear violations |
| Performance | 8/10 | Solid; missing preconnect + one motion-reduce miss |
| Completeness | 9/10 | Highly detailed — very few gaps |
| Phase 2 consistency | 9/10 | border-zinc-700 rule, duration-[250ms], WCAG red-400 all correct |

**Overall R1 assessment: Strong foundation, 2 ship-blocking bugs, 3 accessibility fixes required before R2 sign-off.**

Critical fixes before R2:
1. Fix `--font-family-sans` → `--font-sans` in §8.1 @theme
2. Fix `borderRadius` sm/md values in §8.2
3. Fix modal footer `border-zinc-800` → `border-zinc-700`
4. Fix `text-zinc-500` empty state heading → `text-zinc-400`
5. Add `motion-reduce:animate-none` to Loader2 in §6.5
