# Phase 3, Step 3-1 — Critic-A (UX & Brand) Review

**Reviewer:** ux-brand (Critic-A)
**Document:** `_uxui_redesign/phase-3-design-system/design-tokens.md`
**Date:** 2026-03-23
**Grade Step:** A (rigorous)
**Focus:** Brand consistency, 60-30-10 rule, typography pairing, emotional tone
**References Cross-Checked:** Vision & Identity (Phase 0-2), Phase 2 Web/App/Landing analyses, Phase 2 party-logs, confirmed-decisions-stage1.md

---

## Overall Assessment

**Score: 8.25/10 — CONDITIONAL PASS (4 blocking fixes required)**

This is a strong design tokens document. It faithfully translates the Vision & Identity into implementable Tailwind v4 tokens, correctly applies Phase 2 critical fixes (tertiary text contrast, focus-ring-chrome, content padding 2:1 ratio), and introduces practical innovations (LLM Context Block, Zone B CVD fix, Korean font fallback chain with Pretendard). The 60-30-10 mapping is explicit and well-structured. The token diff appendix is exactly what developers need for migration.

However, four issues must be resolved before promotion to Phase 3-2: a font CDN contradiction, two unverified accent contrast ratios, and a self-contradictory motion rule.

---

## BLOCKING Issues (Must Fix Before Promotion)

### B1. Font Loading: Google Fonts CDN Contradicts Phase 2 Decision

**Location:** §2.1 Font Stack — "CDN: Google Fonts" (all three fonts)

**Problem:** Phase 2 critical fix #4 (all surfaces) explicitly mandates:
> *"Font loading: @fontsource/inter + @fontsource/jetbrains-mono (not Google Fonts @import)"*

The tokens doc specifies "Google Fonts" as CDN for all three fonts. This directly contradicts a confirmed Phase 2 decision. The reasons Phase 2 rejected Google Fonts CDN:

1. **Privacy:** Google Fonts CDN sends user IP to Google on every page load — problematic for a Korean CEO's private enterprise tool
2. **Performance:** External CDN = DNS lookup + TLS handshake + separate connection. @fontsource self-hosts fonts in the bundle = one fewer external dependency
3. **Reliability:** External CDN = SPOF. Self-hosted = guaranteed availability

**Fix:** Change all three CDN entries from "Google Fonts" to "@fontsource (self-hosted)":
- `@fontsource/inter` (weights 400, 500, 600, 700)
- `@fontsource/jetbrains-mono` (weights 400, 500)
- `@fontsource-variable/noto-serif-kr` (weights 400, 700)

Also add a note in the Tailwind config section: font imports via `@fontsource` in `index.css`, not `<link>` tags in `index.html`.

### B2. Accent-Primary (#606C38) — Text Contrast Failure Unaddressed

**Location:** §1.2 Primary Palette — `--accent-primary` listed as "4.14:1 (AA for UI)"

**Problem:** 4.14:1 on cream (#faf8f5) **fails WCAG AA for normal text** (4.5:1 minimum). The doc labels this "AA for UI" which technically refers to WCAG 1.4.11 (non-text contrast, 3:1 threshold) — but this distinction is not explained. Without an explicit usage restriction, a developer will inevitably use `text-corthex-accent` for body-text links at 14px/400, which FAILS.

**Impact:** Every text link, every inline accent-colored label at normal body size would be a WCAG violation.

**Fix:** Add an explicit rule to §1.2 or §2.3:
> `--accent-primary` (#606C38) must NOT be used for normal-size body text (< 18px regular or < 14px bold). For inline links, use `--text-primary` (#1a1a1a) with `text-decoration: underline`, NOT accent color. Accent-primary is approved for: buttons (with white text), large headings (≥ 18px), UI components (focus rings, borders, indicators), and icon tinting.

### B3. Accent-Hover (#7a8f5a) — White Text Contrast Unverified

**Location:** §1.2 Primary Palette — `--accent-hover` listed as "2.84:1" (against cream)

**Problem:** The document only lists contrast against cream background (2.84:1). But the primary use case for accent-hover is as a **button hover background with white text** (`--text-on-accent: #ffffff`). The contrast of white on #7a8f5a is not listed.

Estimated contrast: white (#ffffff) on #7a8f5a ≈ **3.37:1** — this FAILS WCAG AA for normal text (4.5:1) and barely passes for large text (3:1).

**Impact:** Primary CTA buttons in hover state would have illegible text for users with low vision.

**Fix:**
1. Calculate and document the actual white-on-#7a8f5a contrast ratio
2. If < 4.5:1 (likely), darken the hover color. Options:
   - `#6d8050` (split difference between accent and hover — verify ≥ 4.5:1)
   - `#566d40` (closer to accent-primary — higher contrast)
3. Alternatively, document that accent buttons use 600-weight text (≥ 14px bold = large text, 3:1 threshold applies) and verify 3.37:1 passes under that rule

### B4. Sidebar Collapse Animation Contradicts Motion Rules

**Location:** §5.3 Transition Patterns vs §5.1 Animation Principles

**Self-contradiction:**
- §5.1 Rule 3: *"Only `transform` and `opacity` properties animated — never layout-triggering properties (width, height, top, left, margin, padding)."*
- §5.3 Row 2: *"Sidebar collapse/expand | `width: 280px ↔ 64px` 200ms"*

Width is explicitly listed in §5.1's forbidden properties, yet §5.3 animates width. This is also a regression from Phase 2 critical fix #6:
> *"CSS `width` transition → `transform: translateX()` for GPU acceleration"*

**Fix:** Change §5.3 sidebar collapse entry to:
```
Sidebar collapse/expand | translateX + inner content opacity fade | 200ms | Instant width snap
```

Implementation approach: Sidebar maintains full 280px width but translates icon-rail content into view while fading text labels. Or: use `transform: scaleX()` from 1 → (64/280) with `transform-origin: left`. The key constraint is: NO width/height animation.

---

## NON-BLOCKING Issues (Should Fix)

### N1. No Archetype → Token Rationale Section

**Location:** Entire document (absent)

**Problem:** Vision & Identity §9.4 has a clear "Archetype → Design Mapping" table connecting Ruler/Sage archetypes to specific color, typography, and layout choices. The tokens doc reproduces the tokens but strips the WHY. A developer reading only the tokens doc loses the brand motivation:

| Token | What it is | What's missing: WHY |
|-------|-----------|---------------------|
| `--bg-chrome: #283618` | Dark olive sidebar | Ruler authority — commands, structure, hierarchy |
| `--bg-primary: #faf8f5` | Cream background | Sage wisdom — parchment, reflection, openness |
| `font-mono: JetBrains Mono` | Monospace for data | Sage precision — analytical, data-driven |
| `--accent-primary: #606C38` | Sage green accent | Living growth — organic vitality within controlled structure |

**Fix:** Add a brief (5-row) "Brand Rationale" subsection to §1.1, cross-referencing Vision §9.4. This ensures the tokens aren't treated as arbitrary color picks.

### N2. 60-30-10 on Mobile — No Chrome Zone Guidance

**Location:** §1.1, §3.4

**Problem:** The 60-30-10 mapping assumes desktop layout (persistent sidebar = 30% chrome). On mobile (< 1024px), the sidebar collapses to an overlay, and the bottom nav replaces it. What color is the bottom nav? If it's cream (60% zone), the chrome proportion drops to ~0% on mobile, breaking the 60-30-10 balance entirely.

The Phase 2 App analysis winner ("Command Hub") specifies a bottom nav, but the tokens doc doesn't map it to a 60-30-10 zone.

**Fix:** Add a "Mobile 60-30-10 Adaptation" note:
> On mobile, the 30% chrome shifts from persistent sidebar to: (a) bottom nav bar using `--bg-chrome` (#283618), and (b) olive drawer overlay when nav is opened. The 60-30-10 ratio is maintained through bottom nav + drawer chrome coverage.

### N3. "Controlled Nature" Not Threaded Through Sections

**Location:** §§2-6

**Problem:** The "Controlled Nature" philosophy is stated in §1.1 but not referenced in subsequent sections. Each section is technically complete but lacks the brand thread:
- §3 Spacing: The 8px grid is "structure" (Controlled) — say so
- §4 Shadows: "z-order only, never decorative" is "honest construction" (Arts & Crafts) — say so
- §5 Motion: "purposeful only" is Rams's "less but better" — say so

A single sentence per section connecting back to the philosophy would strengthen brand coherence without bloating the document.

---

## MINOR Issues (Nice to Fix)

### m1. `--semantic-handoff` Purple (#a78bfa) — Brand Departure Unjustified

**Location:** §1.4

The five semantic colors are: olive-green (success), amber (warning), red (error), blue (info), **purple (handoff)**. The first four follow the Natural Organic palette's earthy/muted direction. Purple (#a78bfa) introduces a violet that has no relationship to olive, cream, sage, or sand. It's the only color in the entire system from a "cool/mystical" family.

**Mitigation:** Purple is pragmatically needed for differentiation (all warm earth tones would blur together). But add a one-line justification: *"Purple chosen for maximum hue distance from the olive/amber/red semantic family — ensures handoff events are instantly distinguishable."*

### m2. `--text-5xl` (48px) — Deviation from Vision Spec Undocumented

**Location:** §2.2

Vision §4.2 maxes out at `--text-4xl` (40px). The tokens doc adds `--text-5xl` (48px) for the landing hero. This is justified by Phase 2 landing analysis, but the deviation from Vision spec should be noted: *"Added per Phase 2 landing recommendation (48px hero for marketing drama). CEO app max remains `--text-3xl` (32px)."*

### m3. Z-Index Collision — overlay-backdrop = bottom-nav = fab = 30

**Location:** §4.3

Three elements share z-index 30: `--z-overlay-backdrop`, `--z-bottom-nav`, `--z-fab`. If a mobile user has bottom nav + FAB + an overlay backdrop simultaneously (e.g., opening a filter drawer), the stacking order is undefined. While this may not cause visual issues in practice (backdrop covers entire screen), explicit stacking within the same z-tier should be documented.

### m4. Missing `--bg-input` Token

**Location:** §1.2

Forms are a P0 migration priority (§Vision 10.2). But there's no `--bg-input` token for form input backgrounds. Should inputs use `--bg-primary` (cream, blending into page), `--bg-surface` (sand, slightly raised), or `#ffffff` (white, maximum contrast for typing)? This will cause inconsistent form styling if left to individual developer judgment.

---

## Positive Findings (What Works Well)

### P1. Vision Identity Fidelity — Excellent
Every color hex from Vision §3.1-3.4 is faithfully reproduced. No drift, no "creative reinterpretation." The token naming (`--color-corthex-*`) creates a clear namespace. The prefix prevents collision with any third-party library tokens.

### P2. Phase 2 Critical Fixes — All Applied
- Tertiary text: `#a3a08e` (2.46:1) → `#756e5a` (4.5:1) ✓
- Focus ring chrome: `#a3c48a` (6.63:1) for dark sidebar ✓
- Content padding: 24px → 32px (2:1 ratio vs card padding) ✓
- Color-blind chart positions 2 and 4 (blue + amber) ✓
- `prefers-reduced-motion` mandatory wrapper ✓
- No provider brand colors in charts ✓

### P3. Token Diff Appendix (§Appendix A) — Developer Gold
Mapping current codebase values → new spec values with change reasons is exactly what a migration developer needs. Especially the surface `#ffffff` → `#f5f0e8` change with the clear reason: *"White breaks Natural Organic warmth."*

### P4. LLM Context Block (§8.3) — Innovative
A ~600-token compressed design system for LLM code generation context is a genuinely novel idea. This ensures AI-generated UI code is brand-consistent without loading the entire tokens doc. Smart.

### P5. Korean Font Fallback Chain — Thoughtful
Adding `'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic'` to the Inter fallback chain shows awareness of the Korean CEO user's ecosystem. Pretendard is the modern KR system font — a quality-of-life improvement over the generic `system-ui` fallback in the Vision spec.

### P6. Zone B Badge CVD Fix — Thorough
`ring-1 ring-white/80` as a luminance fallback for notification badges on olive sidebar addresses the specific case where red (#dc2626) becomes indistinguishable brown for protanopia users against olive (#283618). Shape + number + ring = triple redundancy. Excellent.

### P7. Forced-Colors Media Query — Beyond Requirements
Adding `@media (forced-colors: active)` border fallbacks for Windows High Contrast Mode exceeds the Vision spec's WCAG 2.1 AA target. This shows proactive accessibility thinking.

### P8. `--bg-nexus` Elevated Surface — Smart Addition
Adding a third background level (#f0ebe0) for NEXUS canvas and mobile cards acknowledges that the cream→surface contrast (3% luminance) is insufficient for some contexts. The three levels create a usable luminance staircase: 97% → 94% → 92%.

---

## Score Breakdown

| Focus Area | Score | Weight | Reasoning |
|-----------|-------|--------|-----------|
| **Brand Consistency** | 8/10 | 25% | Colors faithful, naming consistent. Deductions: Google Fonts contradicts Phase 2 (-1), accent contrast gaps need usage rules (-0.5), additions (nexus, handoff) not flagged as Vision deviations (-0.5) |
| **60-30-10 Rule** | 9/10 | 25% | Zones clearly mapped, Tailwind config organized by zone. Deductions: No mobile adaptation guidance (-0.5), no visual weight discussion for asymmetric sidebar area (-0.5) |
| **Typography Pairing** | 8/10 | 25% | Inter+JetBrains Mono+Noto Serif KR perfect. Korean fallbacks excellent. Deductions: Google Fonts CDN (-1), text-5xl undocumented deviation (-0.5), heading:body ratio analysis is above-and-beyond (+0.5) |
| **Emotional Tone** | 8/10 | 25% | "Controlled Nature" correctly opened, shadow/motion restraint aligned. Deductions: No archetype→token mapping (-1), sidebar animation self-contradiction (-0.5), handoff purple unjustified (-0.5). Positive: forced-colors proactivity (+1) |
| **WEIGHTED AVERAGE** | **8.25/10** | | |

---

## Verdict

**CONDITIONAL PASS — 8.25/10**

The document meets Grade A threshold (≥ 8.0) but requires 4 blocking fixes before promotion to Phase 3-2:

| Priority | ID | Issue | Effort |
|----------|------|-------|--------|
| **BLOCKING** | B1 | Font CDN: Google Fonts → @fontsource | 1 line × 3 fonts |
| **BLOCKING** | B2 | Accent-primary text usage restriction | Add 3-line rule |
| **BLOCKING** | B3 | Accent-hover white text contrast | Calculate + possible color adjust |
| **BLOCKING** | B4 | Sidebar collapse: width → transform | Rewrite 1 transition row |
| Important | N1 | Archetype→token rationale table | Add 5-row table to §1.1 |
| Important | N2 | Mobile 60-30-10 adaptation | Add 3-line note |
| Important | N3 | "Controlled Nature" threading | 1 sentence × 4 sections |
| Minor | m1 | Handoff purple justification | 1-line note |
| Minor | m2 | text-5xl deviation note | 1-line note |
| Minor | m3 | Z-index 30 collision documentation | 2-line note |
| Minor | m4 | Missing --bg-input token | Define 1 new token |

After blocking fixes, expected score: **8.75–9.0/10**.

---

*Critic-A (ux-brand) — Phase 3, Step 3-1 Review Complete*
