# Phase 3-1: Design Tokens — CRITIC-A Review (Round 1)

**Date**: 2026-03-12
**Reviewer**: CRITIC-A (Sally / Marcus / Luna)
**Document reviewed**: `_corthex_full_redesign/phase-3-design-system/design-tokens.md`
**Round**: 1 — Initial Review

---

## Overall Assessment

The document is impressively comprehensive: 10 sections, all token categories covered, OKLCH format confirmed, Work Sans confirmed, border-zinc-700 rule consistently applied throughout. The implementation code in §8 is detailed and ready for dev handoff. However, I found **6 concrete issues** before approval can be given: 2 code correctness errors (one creates a live WCAG failure, one will cause dev confusion at build time), 1 code inconsistency between sections, 1 brand violation from Phase 0, and 2 specification conflicts with Phase 0 animation budget and interaction model.

---

## SALLY (UX Designer) — Issues Found

### Issue S1: `text-zinc-500` for timestamps is a WCAG AA failure — CRITICAL

**Location**: §1.6 Text Colors — `text-faint` token

**The token definition**:
```
text-faint | text-zinc-500 | #71717A | Empty states, timestamps, placeholders
```

**The problem**: §1.3 WCAG table explicitly documents:
```
text-zinc-500 (#71717A) | bg-zinc-900 (#18181B) | 3.4:1 | ⚠️ AA large text only (use for 18px+/16px bold+)
```

`text-zinc-500` passes **only for large text (18px+ or 14px bold+)**. But the named use case "timestamps" will always render as `text-xs` (12px) — confirmed by §2.5 semantic ramp where "Body secondary" is `text-xs text-zinc-400`. Timestamps in Hub SessionPanel, cost display, ARGOS run history — all `text-xs` at 12px. At 12px normal weight, `text-zinc-500` on `bg-zinc-900` = **3.4:1 = WCAG FAIL**.

The document itself is aware of the risk (the ⚠️ note is there), but then names "timestamps" as a use case for this failing token. This is a direct contradiction within the document that creates a live WCAG AA failure in implementation.

**Required fix**: Remove "timestamps" from `text-faint` use cases. Timestamps at `text-xs` must use `text-zinc-400` (5.7:1 ✅ AA). Update §1.6:
- `text-faint` → restrict to: "Empty state headings (text-base+), de-emphasized placeholder text (text-sm+)"
- Add to §2.5 semantic ramp: `Timestamp / metadata` → `font-mono text-xs text-zinc-400` (use the verified-AA token)

---

### Issue S2: `focus-visible:ring-offset-zinc-950` hardcoded universally — context mismatch inside cards — MAJOR

**Location**: §9.4 Focus Ring Standard, §9.1 Primary Button, §9.2 Secondary Button

**The specification**:
```
focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950
```

**The problem**: `ring-offset` renders as a solid gap between the element and the focus ring, filled with the specified color. When this is `ring-offset-zinc-950`, it works correctly only for elements sitting directly on the page background (`bg-zinc-950`).

CORTHEX UI is almost entirely composed of components nested inside cards (`bg-zinc-900`) and panels (`bg-zinc-800`). A primary button inside a card (`bg-zinc-900`) with `ring-offset-zinc-950` will show a **black (#09090B) gap** between the button and the indigo ring — visually incorrect against the zinc-900 card background. The ring offset "halo" should match the element's **local background**, not the page root.

This is an interaction design correctness issue: at the most important accessibility moment (keyboard focus), the ring renders with a visible color mismatch against every card in the app.

**Required fix**: Define two focus ring variants:

| Context | Classes |
|---------|---------|
| On page background (bg-zinc-950) | `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950` |
| Inside card/panel (bg-zinc-900) | `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900` |
| Inside elevated panel (bg-zinc-800) | `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-800` |

Add a note: "Match `ring-offset-*` to the element's **nearest ancestor background color**." Primary buttons in Hub ChatArea (bg-zinc-900 container) must use `ring-offset-zinc-900`, not zinc-950.

---

## MARCUS (Visual Designer) — Issues Found

### Issue M1: Border radius token table contradicts tailwind.config.ts implementation — CRITICAL

**Location**: §4.1 Border Radius Scale (token table) vs. §8.2 `tailwind.config.ts` borderRadius override

**The conflict**:

| Token table (§4.1) says | Config override (§8.2) actually produces |
|------------------------|------------------------------------------|
| `rounded-sm` = 2px | `sm: '0.375rem'` → **6px** |
| `rounded-md` = 6px | `md: '0.5rem'` → **8px** |
| `rounded-lg` = 8px | `lg: '0.5rem'` → **8px** ✅ (this one is fine) |
| `rounded` = 4px (Tailwind default) | `DEFAULT: '0.5rem'` → **8px** |

A developer reading §4.1 will use `rounded-sm` for "Tags, tiny badges" expecting **2px** rounding. After the config override, they get **6px** — a visible visual discrepancy on tight UI elements like tier badges (`font-mono text-xs ... rounded`).

The bare `rounded` class is particularly dangerous: Tailwind's default is 4px, but the config changes `DEFAULT` to `0.5rem` (8px), making `rounded` = `rounded-lg` = 8px. This is an undocumented breaking change that will affect any existing component using bare `rounded`.

**Required fix**: Choose one of two paths:
- **Path A (keep config as-is)**: Update §4.1 token table to reflect actual config-produced values: `rounded-sm` = 6px, `rounded-md` = 8px, `rounded` (DEFAULT) = 8px. Remove `radius-sm = 2px` mapping. For 2px radius (tier badge), use `rounded-[2px]` arbitrary value.
- **Path B (fix config)**: Remove the `borderRadius` override block entirely from §8.2. Use Tailwind's built-in scale (rounded-sm=2px, rounded-md=6px, rounded-lg=8px). These already match the token table's intent. Add a comment: "Tailwind built-in radius scale matches CORTHEX token table — no override needed."

Path B is recommended: it removes the breaking change and the divergence in one step.

---

### Issue M2: `--animate-speech-enter` absent from §8.1 canonical @theme block — MAJOR

**Location**: §7.3 Semantic Tokens (@theme) vs. §8.1 CSS @theme Extension (canonical implementation)

**The conflict**:

§7.3 defines in `@theme`:
```css
--animate-speech-enter: speech-enter 0.4s ease-out forwards;
```

§8.1 (the canonical `packages/app/src/index.css` implementation block) defines in `@theme`:
```css
--animate-slide-in: slide-in 0.3s ease-out;
--animate-slide-up: slide-up 0.3s ease-out;
/* speech-enter is NOT HERE */
```

`@keyframes speech-enter` is defined in §8.1 (outside @theme, correct). But because `--animate-speech-enter` is missing from the §8.1 @theme block, the Tailwind utility class `animate-speech-enter` **will not be generated** from CSS alone. In Tailwind v4, `--animate-*` in @theme creates the utility class — if the @theme entry is absent, the class doesn't exist.

§8.2 tailwind.config.ts `animation` key DOES include `'speech-enter'` (for IDE tooling). But the CSS-only path (§8.1) cannot generate the utility.

**Required fix**: Add to §8.1 @theme block (alongside `--animate-slide-in`):
```css
--animate-speech-enter: speech-enter 0.4s ease-out forwards;
```
Note: speech-enter requires per-element `animation-delay` set via inline `style` attribute for stagger — document this explicitly: "Tailwind's `animate-speech-enter` class sets the animation, but stagger delay must be set via `style={{ animationDelay: '${index * 200}ms' }}`."

---

### Issue M3: TrackerPanel collapse total animation time = 350ms, exceeds Vision §12.1 250ms budget — MAJOR

**Location**: §5.3 TrackerPanel Collapse Sequence

**The specification**:
```
1. Content fade: opacity 1→0, 100ms ease-in
2. Width collapse: w-80→w-12, duration-[250ms] ease-in-out, begins after 100ms delay
3. Icon strip appear: opacity 0→1, 150ms ease-out
```

**The problem**: Steps 1 + 2 are sequential (collapse begins after fade). Total perceived animation: **100ms + 250ms = 350ms**. Vision §12.1 Animation Budget explicitly budgets:
```
Panel expand/collapse | 250ms | ease-in-out
```

The expand sequence (single-phase: width 250ms) stays within budget. The collapse sequence (two-phase: 100ms + 250ms) exceeds it by 40%. On frequent use (user toggling TrackerPanel during work), 350ms per collapse is noticeably sluggish against the 150ms hover micro-interactions on the same sidebar.

**Required fix**: Redesign collapse to fit 250ms total. Two options:

**Option A — Parallel fade+collapse**: Run content fade and width collapse simultaneously.
```
Collapse (parallel, 250ms total):
- Content: opacity 1→0, 200ms ease-in (finishes slightly before collapse)
- Width: w-80→w-12, duration-[250ms] ease-in-out (starts immediately)
- Icon strip: opacity 0→1, 150ms ease-out, delay 100ms (appears as content finishes)
```
Use `transition-[width,opacity]` on the container. This removes the sequential delay.

**Option B — Keep phases, shorten total**:
```
- Content fade: 80ms ease-in
- Width collapse: 170ms ease-in-out, begins after 80ms
- Total: 250ms exactly
```

---

## LUNA (Brand Strategist) — Issues Found

### Issue L1: `Bot` icon for AI agents violates Phase 0 explicit brand anti-pattern — CRITICAL

**Location**: §6.5 CORTHEX Icon Assignments

**The assignment**:
```
Bot/AI Agent | Bot | AI agent context
```

**The problem**: Vision Identity §4.3 explicitly lists brand anti-patterns to avoid under "What CORTHEX is NOT":
> "Do NOT use: robots, gears, chat bubbles, magic wands. CORTHEX is not a chatbot or a toy."

Lucide React's `Bot` icon renders a **robot face** — precisely what the brand document prohibits. This is not an interpretation issue; the prohibition is literal. CORTHEX frames agents as organizational employees ("비서실장," "CTO," "백엔드전문가") — named professionals in a hierarchy, not chatbots or automata.

Using `Bot` for AI agents undermines the core product positioning: **"Show the Org, Not the AI"** (Vision Principle 5). The Tracker step showing a `Bot` robot face next to "비서실장이 분석 중..." sends the wrong message — it signals "AI chatbot" rather than "organizational specialist."

**Required fix**: Replace `Bot` with an icon consistent with the "named professional" metaphor. Recommended alternatives:

| Option | Lucide Icon | Rationale |
|--------|------------|-----------|
| **Primary recommendation** | `User` | AI agents are org members, not robots. Same icon as human employees signals "team member regardless of type" — aligns with Vision §5 "Show the Org" |
| Secondary | `CircleUser` | Slightly more formal, distinct from human `User` if differentiation is needed |
| Tertiary | `Cpu` | Signals "processing intelligence" without robot connotation |

Update §6.5 table: `Bot/AI Agent | User | AI agent context (NOT Bot — robot icon contradicts Vision §5.3)`.

---

## Summary of Issues

| # | Severity | Reviewer | Issue | Required action |
|---|----------|----------|-------|----------------|
| S1 | CRITICAL | Sally | `text-zinc-500` for timestamps = WCAG AA fail (3.4:1, 12px normal text) | Remove timestamps from text-faint use cases; use text-zinc-400 for text-xs metadata |
| M1 | CRITICAL | Marcus | §4.1 radius table vs §8.2 config conflict: `rounded-sm` documented as 2px but config produces 6px | Fix config (remove override) or update table — Path B recommended |
| L1 | CRITICAL | Luna | `Bot` icon = robot face, violates Vision §5.3 explicit prohibition ("Do NOT use: robots") | Replace with `User` icon for AI agent context |
| S2 | MAJOR | Sally | `ring-offset-zinc-950` universally applied fails inside cards (bg-zinc-900) | Define 3 context-specific focus ring variants |
| M2 | MAJOR | Marcus | `--animate-speech-enter` missing from §8.1 canonical @theme — `animate-speech-enter` utility class won't be generated | Add `--animate-speech-enter` to §8.1 @theme block |
| M3 | MAJOR | Marcus | TrackerPanel collapse = 350ms total (100ms + 250ms sequential), exceeds Vision §12.1 250ms budget | Redesign as parallel fade+collapse (Option A) for 250ms total |

**Blockers before approval**: S1 (WCAG failure in production), M1 (breaks token→code trust contract), L1 (brand violation from Phase 0)
**Should fix before Round 2**: S2 (interaction correctness), M2 (implementation gap), M3 (animation budget violation)

---

## What the Document Does Well

- `border-zinc-700` is correctly and consistently applied as the standard dark surface border throughout every section — Phase 2's most critical fix is fully absorbed.
- `duration-[250ms]` arbitrary syntax (NOT `duration-250`) is correctly used in every animation spec — Tailwind v4 compliance confirmed.
- No auto-collapse timer anywhere in the document — WCAG 2.2.2 compliance maintained.
- `text-red-400` (not red-500) for small body error text is correctly specified with WCAG math shown — this was a Phase 2 confirmed fix, properly implemented.
- OKLCH format throughout all color definitions — full Tailwind v4 alignment.
- The 4-layer surface nesting system (zinc-950 → 900 → 800 → 800/50) is clear, with explicit border rules per layer transition.
- `motion-reduce:` on every animation — accessibility compliance is thorough.
- `@theme` CSS-first philosophy (Tailwind class in JSX, CSS token in .css only) is consistently stated and correctly exemplified.
- The Collapse Sequence multi-step breakdown in §5.3 is exactly the implementation-ready detail that prevents dev guessing.

**Round 1 rating**: Cannot approve. Fix 3 CRITICAL issues (S1/M1/L1) minimum before Round 2. MAJOR issues (S2/M2/M3) should also be addressed in the same pass.
