# Phase 2-2 Party Mode — CRITIC-C Review
## Technical Reality

**Date:** 2026-03-25
**Role:** CRITIC-C (Technical Reality)
**Sources reviewed:** phase-2-2-writer.md, design-tokens.md, packages/app/src/index.css, packages/app/src/styles/themes.css

---

## Preamble

My focus: Tailwind v4 compatibility, CSS variable cascade, bundle/font performance, browser support. I read the actual production files (`index.css`, `themes.css`), not just the design spec. Some issues the Writer flagged are already real in the code.

---

## THEME 1: COMMAND (Dark)

### Technical Issues Found

**[TC-1] CRITICAL — rgba() values in @theme block break Tailwind v4 opacity modifier system**

`index.css` line 11:
```css
@theme {
  --color-corthex-accent-muted: rgba(202, 138, 4, 0.10);
  --color-corthex-sidebar-hover: rgba(202, 138, 4, 0.10);
  --color-corthex-sidebar-active: rgba(202, 138, 4, 0.15);
}
```

Tailwind v4 `@theme` block parses color values to extract RGB channels for the opacity modifier system. `rgba()` literals cannot be decomposed — Tailwind stores them as opaque string variables. Consequences:
- `bg-corthex-accent-muted/50` will produce wrong or no output
- Tailwind IntelliSense shows these as non-color tokens (no swatch preview)
- `themes.css` also repeats these `rgba()` values in `[data-theme="command"]` — same problem

**Fix**: Replace `rgba(202, 138, 4, 0.10)` with Tailwind v4 channel format: `--color-corthex-accent-muted: 202 138 4 / 0.10` or use `oklch()` with `/ 0.10` alpha. This is a v4 breaking change from v3 behavior.

**[TC-2] HIGH — Command theme declared twice: @theme defaults + [data-theme="command"]**

`index.css` `@theme` block defines all Command values as `:root` defaults.
`themes.css` `[data-theme="command"]` block declares the SAME values again.

When the root element has `data-theme="command"`, both apply simultaneously. At 27 variables × 2 declarations = 54 redundant property writes. This is not a runtime bug (values are identical) but creates a maintenance trap: future developers must update Command values in two places. One WILL go stale.

Worse: if `data-theme` is ever NOT set (e.g., during a theme-switch animation where the attribute is removed), the app falls back to `@theme` `:root` defaults — which is correct behavior. But if `@theme` defaults are ever updated independently, they diverge from the `[data-theme="command"]` block silently.

**Fix**: Remove the `[data-theme="command"]` block entirely from `themes.css`. The `@theme` `:root` defaults serve as the Command fallback. Only Studio and Corporate need explicit `[data-theme]` overrides.

**[TC-3] MEDIUM — Missing token in design-tokens.md: --color-corthex-border (value mismatch)**

`design-tokens.md` table shows:
> `--color-corthex-border: #292524` for Command

But `themes.css` line 23:
```css
--color-corthex-border: #44403C;
```

`#292524` is the `elevated` surface value. The spec and implementation diverge on `--color-corthex-border`. This is a documentation bug that will cause future phases to implement against wrong values.

**[TC-4] LOW — --font-heading / --font-body variables in [data-theme] blocks don't interact with Tailwind v4 fontFamily utilities**

`themes.css` lines 50-51 (Command):
```css
--font-heading: 'DM Sans', 'Inter', sans-serif;
--font-body: 'DM Sans', 'Inter', sans-serif;
```

Tailwind v4 generates `font-heading` utility from `@theme { --font-heading: ... }` using `var(--font-heading)`. When `[data-theme="studio"]` overrides `--font-heading` to `'Outfit'`, the Tailwind utility `font-heading` will correctly switch at runtime. **This part works.**

BUT: `--font-ui` and `--font-mono` are defined only in `@theme` (index.css), not in any `[data-theme]` block. If future themes need different mono or UI fonts, the current structure has no slot for them. Medium-term technical debt.

### Command Score: **7/10**

Good foundation, clean variable naming. The double-declaration problem is the highest-priority cleanup. The rgba() issue affects all themes equally and needs a v4-compatible fix before implementation.

---

## THEME 2: STUDIO (Light)

### Technical Issues Found

**[TS-1] CRITICAL — color-scheme: light + dark sidebar creates system UI inconsistency**

`themes.css` line 103:
```css
[data-theme="studio"] {
  color-scheme: light;
}
```

But the Studio sidebar is dark: `--color-corthex-sidebar-bg: #0E7490`.

`color-scheme: light` tells the browser to render ALL system UI elements (scrollbars, `<input>`, `<select>`, `<textarea>`, native date pickers, focus rings) using the LIGHT color mode — even inside the dark sidebar.

Consequence: Inside Studio's dark teal sidebar, any `<input>` search field, `<select>` dropdown, or native scrollbar will render with white backgrounds and dark borders — completely wrong. The scrollbar in the sidebar content (if it overflows) will be a light scrollbar on a dark background.

Command and Corporate have this same architecture (dark sidebar with `color-scheme: light/dark`), but Command's `color-scheme: dark` at least makes sidebar system UI dark-mode-styled. Studio and Corporate both declare `color-scheme: light` but have dark sidebars.

**Fix**: Apply `color-scheme: dark` locally to the sidebar element via a CSS class, or accept that native inputs inside the sidebar need custom styling overrides. This needs a component-level decision, not just a token-level fix.

**[TS-2] HIGH — All theme fonts load simultaneously, no lazy loading strategy**

The Writer's plan calls for Google Fonts:
- DM Sans (Command only): `family=DM+Sans:wght@400;500;700` — ~3 weights
- Outfit (Studio heading): `family=Outfit:wght@300;400;500;600;700` — 5 weights
- Work Sans (Studio body): `family=Work+Sans:wght@300;400;500;600;700` — 5 weights
- Lexend (Corporate heading): `family=Lexend:wght@300;400;500;600;700` — 5 weights
- Source Sans 3 (Corporate body): `family=Source+Sans+3:wght@300;400;500;600;700` — 5 weights

**Estimated download size if loaded simultaneously:**
- DM Sans 3 weights: ~135KB (WOFF2)
- Outfit 5 weights: ~200KB
- Work Sans 5 weights: ~195KB
- Lexend 5 weights: ~180KB
- Source Sans 3 5 weights: ~200KB

**Total: ~910KB of font data** loaded on first page load regardless of active theme.

If the user is on Command theme, they download ~775KB of Studio and Corporate fonts they will never use. Google Fonts uses `font-display: swap` by default, so this won't block render, but it wastes bandwidth and connection slots.

**Fix**: Load theme fonts dynamically. On theme change, inject a `<link>` for the active theme's fonts only. Preload the default (Command) fonts via `<link rel="preload">` in `index.html`. Non-default theme fonts lazy-load on first switch.

**[TS-3] MEDIUM — Studio text-on-accent value in themes.css diverges from Writer's proposed fix**

Writer (phase-2-2-writer.md line 259) proposes:
```css
--color-corthex-text-on-accent: #164E63; /* dark text on #22C55E button */
```

But `themes.css` line 81 (production file):
```css
--color-corthex-text-on-accent: #FFFFFF;
```

The production file retains the wrong value that the Writer already identified as failing WCAG (white on `#22C55E` = 2.18:1). The Writer's own issue list flags this as CRITICAL but the `themes.css` implementation was NOT updated. This is the most dangerous kind of gap: the design doc acknowledges the bug but the code doesn't reflect the fix.

**[TS-4] LOW — --color-corthex-sidebar-brand defined in themes.css but absent from design-tokens.md**

`themes.css` line 90 (Studio):
```css
--color-corthex-sidebar-brand: #22D3EE;
```

This variable exists in all three theme blocks in `themes.css` but is completely absent from:
- `design-tokens.md`
- The Writer's CSS block in the presentation
- The shared tokens section

It appears to have been added directly to `themes.css` without going through the design system process. Undocumented tokens create implementation inconsistency — components may or may not use it.

### Studio Score: **6/10**

The `color-scheme`/dark-sidebar conflict is a real browser behavior issue that will cause visible bugs in production. The text-on-accent WCAG failure exists in the production file despite being documented as CRITICAL. Two correctness issues that are confirmed code bugs, not just design questions.

---

## THEME 3: CORPORATE (Light)

### Technical Issues Found

**[TO-1] CRITICAL — --color-corthex-cta variable referenced in Writer spec does NOT exist in themes.css**

Writer (phase-2-2-writer.md line 323):
```
| CTA | #F97316 | --color-corthex-cta | Button CTA orange |
```

But `themes.css` Corporate block has NO `--color-corthex-cta` variable. The orange CTA color is only stored in:
```css
--color-corthex-handoff: #F97316;
```

This means:
1. Components that need to render an orange CTA button have no dedicated token — they must use `--color-corthex-handoff` (semantically wrong: handoff is a status color, not a button color)
2. When the Writer's own Issue #4 says "handoff should be `#A78BFA`", changing handoff to purple will ALSO eliminate the orange CTA color with no replacement
3. Any fix to the handoff/CTA collision (Issue #4 in writer) requires adding the missing `--color-corthex-cta` token to `themes.css` before making Issue #4 fixes

The Writer documented the collision but did not document the missing token as a separate structural issue. This is a structural gap in the design system.

**[TO-2] HIGH — Corporate accent hover (#3B82F6) is identical to --color-corthex-info (#3B82F6)**

`themes.css` lines 115-116:
```css
--color-corthex-accent: #2563EB;
--color-corthex-accent-hover: #3B82F6;
```

`themes.css` line 145:
```css
--color-corthex-info: #3B82F6;
```

Both `accent-hover` and `info` use the exact same hex `#3B82F6`. When a button in hover state and an "Info" badge appear in close proximity, they will be visually identical — users cannot distinguish "interactive hover" from "informational status."

This is a token collision that exists in the current production `themes.css` file right now. The Writer's issue table did not catch this.

**[TO-3] MEDIUM — sidebar-active at rgba(37,99,235,0.20) fails the rgba() @theme issue AND is too subtle**

Same as TC-1 but for Corporate. `rgba(37, 99, 235, 0.20)` on the dark `#1E293B` sidebar renders as:
- Perceived background: a very faint blue tint, approximately `#1e2f55` (barely distinguishable from `#1E293B`)
- This is roughly 1.03:1 luminance contrast — essentially invisible as an active state indicator
- Additionally flagged by Writer as Issue #5 but the production `themes.css` retains this value

The recommended fix (2px left border accent) is the correct industry pattern, but requires a component change, not just a token change.

**[TO-4] LOW — Corporate #3B82F6 info token color is same as Tailwind blue-500, creating utility class ambiguity**

`--color-corthex-info: #3B82F6` matches Tailwind's default `blue-500` exactly. In Tailwind v4, if any component uses `bg-blue-500` (Tailwind default) instead of `bg-corthex-info` (our token), they will render identically in Corporate but differently in other themes where `--color-corthex-info` is the same `#3B82F6` but Tailwind's `blue-500` is overridden.

This isn't immediately broken but creates a "works by accident" situation. If the default Tailwind palette is ever reset or reconfigured, these will diverge silently.

### Corporate Score: **7/10**

Structurally the cleanest of the three themes. The missing CTA variable is a design system gap that will cause implementation problems. The accent-hover/info collision is a production file bug.

---

## CROSS-CUTTING TECHNICAL FINDINGS

### Finding 1 — Google Fonts DNS lookup count exceeds recommended limits

Loading 5-6 Google Fonts families requires:
1. `<link rel="preconnect" href="https://fonts.googleapis.com">`
2. `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
3. 1+ stylesheet requests to `fonts.googleapis.com`
4. Multiple WOFF2 file fetches from `fonts.gstatic.com`

Google Fonts batches multiple families in one URL, but each weight variant for each family is a separate file fetch. With 23 total weight variants across 5 families, this can exhaust the HTTP/2 multiplexing limit on poor connections. **Minimum viable implementation**: load only Command fonts in `index.html`, others lazy-load on demand.

### Finding 2 — No @layer declaration for themes.css

`themes.css` is imported via `@import "./styles/themes.css"` in `index.css`. This runs OUTSIDE any Tailwind `@layer`. In Tailwind v4, styles outside `@layer` have higher specificity than layered styles. This is intentional for theme overrides but means:
- Any Tailwind utility class that tries to override a themed color (e.g., `dark:bg-white`) will FAIL because the `[data-theme]` block has higher implicit specificity than Tailwind's layered utilities
- This creates a conflict: Tailwind's built-in `dark:` modifier (which uses `@media (prefers-color-scheme: dark)` or `.dark` class) will not work reliably alongside `data-theme` switching

This is an architectural decision that needs explicit documentation: **"Use only `--color-corthex-*` tokens, never Tailwind's built-in `dark:` utilities."**

### Finding 3 — No font-display or font loading strategy defined anywhere

Neither `design-tokens.md` nor the Writer's presentation specifies:
- `font-display: swap` vs `optional` vs `block`
- `<link rel="preload">` for critical fonts
- Fallback stack for the period before fonts load (DM Sans fallback to Inter is defined, but Inter itself is also a Google Font in `--font-ui`)

JetBrains Mono (existing) is presumably self-hosted or already loaded. The new fonts have no loading strategy. Without `font-display: swap`, Google Fonts causes FCP blocking. Without a fallback that matches metrics, FOUT will cause layout shift (CLS regression).

---

## SCORE SUMMARY

| Theme | Score | Primary Reason |
|-------|-------|----------------|
| Command | **7/10** | Double declaration + rgba() v4 compat issue |
| Studio | **6/10** | color-scheme/dark-sidebar bug + WCAG fix not applied to code |
| Corporate | **7/10** | Missing CTA token + accent-hover/info collision |
| **OVERALL** | **7/10** | Solid design intent, needs technical cleanup before Phase 3 implementation |

---

## REQUIRED FIXES BEFORE PHASE 3

| Priority | Issue | File to change |
|----------|-------|----------------|
| 🔴 P1 | Convert all `rgba()` in `@theme` to v4-compatible channel format | `index.css` |
| 🔴 P1 | Add `--color-corthex-cta: #F97316` to Corporate `[data-theme]` block | `themes.css` |
| 🔴 P1 | Fix `--color-corthex-text-on-accent: #FFFFFF` → `#164E63` in Studio | `themes.css` |
| 🟠 P2 | Remove duplicate `[data-theme="command"]` block (use @theme defaults) | `themes.css` |
| 🟠 P2 | Define font lazy-loading strategy before implementation | `index.html` plan |
| 🟠 P2 | Fix `--color-corthex-accent-hover` → different value than `--color-corthex-info` in Corporate | `themes.css` |
| 🟡 P3 | Fix `--color-corthex-border` doc mismatch (tokens.md says #292524, code says #44403C) | `design-tokens.md` |
| 🟡 P3 | Document `--color-corthex-sidebar-brand` in design-tokens.md | `design-tokens.md` |
| 🟡 P3 | Add @layer warning: no dark: utilities alongside data-theme | `CLAUDE.md` or code comment |

---

*CRITIC-C review complete. Scores: Command 7/10, Studio 6/10, Corporate 7/10. Overall: 7/10.*
*Minimum 3 actionable P1 fixes required before Phase 3 proceeds.*
