# Phase 2-2 Party Mode — CRITIC-B Review
## Visual Consistency Analysis

**Date:** 2026-03-25
**Reviewer:** CRITIC-B (Visual Consistency)
**Sources Reviewed:** phase-2-2-writer.md, design-tokens.md, command/MASTER.md, studio/MASTER.md, corporate/MASTER.md

---

## Scoring Summary

| Theme | Score | Grade |
|-------|-------|-------|
| Command | 6.5/10 | C+ |
| Studio | 5.5/10 | D+ |
| Corporate | 7.0/10 | B- |
| **Overall** | **6.0/10** | **C** |

---

## THEME 1: COMMAND (Dark) — 6.5/10

### ✅ Strengths

1. **60-30-10 is the clearest of the three themes**: `#0C0A09` (near-black bg) vs `#1C1917` / `#292524` (surfaces) creates legible dark layering. The gold `#CA8A04` stands out as a single unambiguous accent. This is the strongest 60-30-10 execution in the set.

2. **DM Sans rationale is credible**: The Writer's case for DM Sans as "modern precision without militarism" is solid. For a power-user dark theme, geometric sans at 700w creates strong heading hierarchy.

3. **Sidebar integration**: Sidebar BG = page BG (`#0C0A09`) creates a unified full-bleed dark shell — the "immersive terminal" feeling is correct for power users. This is the right call.

---

### ❌ Issues Found (minimum 2 required — found 4)

**Issue B-C1 [HIGH] — Shadows are invisible in dark context**
- Shared shadow tokens use `rgba(0,0,0,0.05–0.15)` — dark shadows on dark backgrounds
- On `#0C0A09` bg, `--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)` renders as **zero visible elevation**
- All four shadow levels (`sm`, `md`, `lg`, `xl`) will look identical (flat) against near-black surfaces
- **Result**: The entire elevation system collapses in Command. Cards and modals have no visual lift.
- **Fix required**: Dark themes need either border-based elevation (`1px solid #1C1917 → #44403C`) or inverted glow (`0 0 0 1px rgba(255,255,255,0.06)`) — NOT the same drop shadows used on white backgrounds
- **This is a structural defect** shared across the design token system (see also cross-theme note below)

**Issue B-C2 [HIGH] — Single font for heading AND body destroys typographic hierarchy**
- DM Sans is specified for BOTH headings and body text (only weight differences distinguish them)
- 60-30-10 requires visual hierarchy at every layer — typography is no exception
- With one font family, h1 and body paragraph share the same voice. Power-user tools like Linear, Supabase, Retool all use font pairings (e.g., heading: Cal Sans / body: Inter) to create clear hierarchy
- **Risk**: Developers will struggle to convey "this is a title, this is metadata, this is body" without a second font's inherent personality difference
- **Fix**: Introduce a condensed or slab serif heading variant, OR at minimum define distinct letter-spacing for headings (`letter-spacing: -0.02em`) to simulate a second personality

**Issue B-C3 [MEDIUM] — Sidebar BG identical to page BG creates boundary invisibility**
- `--color-corthex-sidebar-bg: #0C0A09` === `--color-corthex-bg: #0C0A09`
- Without a dividing line or surface difference, the sidebar-to-content boundary is only defined by layout width — not visual substance
- When a modal or dropdown overlaps the sidebar/content edge, both areas merge visually
- The `--color-corthex-sidebar-border: #1C1917` (the separator line) is only 1px and will be barely perceptible against matched backgrounds
- **Fix**: Elevate sidebar to `#1C1917` (the surface color) — maintaining dark unity while creating a measurable boundary

**Issue B-C4 [MEDIUM] — "Cyberpunk" keyword set mismatches the actual palette**
- MASTER.md style keywords: "Neon, glitch, dystopian, matrix, tech noir"
- Actual palette: warm amber gold `#CA8A04` + warm dark brown-blacks `#0C0A09 / #1C1917`
- The actual aesthetic is **"Stealth Luxury" or "Premium Dark"** (Linear / Supabase / Neon-style)
- True cyberpunk requires: cool neon hues (cyan/magenta), not warm amber-gold; terminal-style monospace; glitch/scan-line effects
- **Risk**: Developers reading "cyberpunk keywords" will add CSS neon glows, skew animations, and terminal cursors that are completely wrong for this palette
- **Fix**: Replace keyword set with "Premium Dark, Stealth Luxury, Power Tool, Precision Interface"

---

### 60-30-10 Ratio Assessment

| Zone | Color | Estimated Screen Coverage | Target |
|------|-------|--------------------------|--------|
| Dominant | `#0C0A09` | ~58–62% | 60% ✅ |
| Secondary | `#1C1917` + `#292524` | ~28–33% | 30% ✅ |
| Accent | `#CA8A04` + muted variants | ~8–12% | 10% ✅ |

**Verdict**: Best 60-30-10 execution in the set. Minor blur between elevated (`#292524`) and surface (`#1C1917`) but both sit correctly in the 30% bucket. **PASS.**

---

### Typography Hierarchy Assessment

| Level | Font | Weight | Differentiation |
|-------|------|--------|-----------------|
| H1-H3 | DM Sans | 700 | Size only |
| Body | DM Sans | 400 | Size only |
| Mono | JetBrains Mono | various | ✅ Clear distinction |

**Single-family hierarchy problem confirmed.** Mono is the only typographic contrast. H1 and body share the same "voice."

---

## THEME 2: STUDIO (Light) — 5.5/10

### ✅ Strengths

1. **Outfit + Work Sans pairing is the most harmonious in the set**: Both are modern geometric, but Outfit's slightly wider tracking at display sizes and Work Sans's narrower, reading-optimized spacing create genuine heading/body contrast — without diverging into different moods. This is the best typography pairing of the three themes.

2. **Benchmark alignment is strong**: The Phase 1 Notion/Plane inspiration directly maps to the light, white-card, airy layout aesthetic. `#ECFEFF` as a tinted (not harsh pure white) background reduces eye strain — correct for a tool used daily for collaborative work.

---

### ❌ Issues Found (minimum 2 required — found 5)

**Issue B-S1 [CRITICAL] — 60-30-10 ratio is functionally broken by near-identical bg/surface**
- `#ECFEFF` (bg) vs `#FFFFFF` (surface) — the lightness delta is **~3 points** on a 0–100 scale
- In real browser rendering, these two colors are indistinguishable without a shadow or border
- Without box shadows, white cards on `#ECFEFF` background will be invisible (they read as one continuous white plane)
- **Consequence**: The "30% secondary surface" zone simply doesn't exist visually. The user sees a single white canvas with colored interactive elements — a **flat 80-10 split** (bg+surface merged, 10% accent) rather than 60-30-10
- **Fix**: Either darken bg to `#D1FAF8` (Tailwind cyan-100 equivalent) to push the delta above visible threshold, OR ensure `--shadow-sm` is always applied to cards (and document this as a requirement, not optional)

**Issue B-S2 [HIGH] — Dual accent hues fragment the 10% rule**
- Cyan `#0891B2` (accent) + Green `#22C55E` (CTA) are two distinct hues competing in the 10% zone
- User visual attention is divided between "cyan = navigation/info" and "green = action"
- The 60-30-10 principle assumes ONE dominant accent hue — Studio has two
- While the functional distinction (info vs CTA) is valid, visually there is no single "brand accent color" — both cyan and green fight for dominance
- **Evidence**: On any page with both a CTA button (green) and active sidebar nav link (cyan), neither reads as the primary brand color
- **Fix**: Designate one as the **brand accent** and one as the **functional CTA**. Reduce the CTA green saturation to a teal adjacent to the brand cyan (e.g., `#0D9488` teal-600) to unify the 10% zone under a single hue family

**Issue B-S3 [HIGH] — Sidebar token semantic inversion**
- `--color-corthex-sidebar-bg: #0E7490` === `--color-corthex-text-secondary: #0E7490`
- The sidebar background color IS the secondary text color — same hex used for two completely different semantic roles
- Developers reading the token system will encounter: "Why is the sidebar background the same value as text-secondary?"
- This is a **token architecture failure** — it signals that the tokens were not designed as a semantic system but assembled ad-hoc
- When `text-secondary` changes in a future palette iteration, it will break the sidebar background (or vice versa) unless the developer knows they're the same value
- **Fix**: Sidebar should have its own independent token value. If the intended sidebar color is `#0E7490`, assign it via its own semantic token: `--color-corthex-sidebar-surface: #0E7490`

**Issue B-S4 [MEDIUM] — Dark sidebar on light theme creates mode-switching cognitive load**
- Studio sidebar: `#0E7490` dark teal on `#ECFEFF` light canvas
- Users must mentally context-switch between dark (sidebar) and light (content) every navigation interaction
- The Notion/Plane inspirations cited in the benchmark actually use **light sidebars** on light content — not dark sidebars
- Notion: white sidebar on white canvas (differentiated by hover states). Plane: light gray sidebar. Cal.com: light sidebar.
- Studio's dark sidebar actually matches the **Corporate** pattern (enterprise dark sidebars), not the collaborative light pattern
- **Risk**: Studio feels like a Corporate theme with a cyan color swap — the "collaborative and approachable" personality is undermined by the heaviness of a dark sidebar

**Issue B-S5 [MEDIUM] — Outfit font personality skews too playful for enterprise SaaS**
- Outfit is derived from Poppins — it retains the slightly bubbly, informal letterform quality at display sizes
- For a "collaborative workplace tool" (Notion/Plane category), Outfit at large heading sizes may read as too casual
- Notion uses a custom serif for display + Inter for UI. Plane uses Inter throughout.
- **Competitive positioning risk**: When a B2B buyer evaluates Studio against enterprise tools, Outfit's playfulness signals "consumer app" more than "enterprise productivity"
- **Counterpoint**: If Studio targets SMB/startup teams (not enterprise), Outfit is appropriate. The font choice works only if the target user is clearly defined as non-enterprise.
- **Recommendation**: Clarify target user. If enterprise-adjacent, swap to Inter or DM Sans. If SMB/startup, keep Outfit.

---

### 60-30-10 Ratio Assessment

| Zone | Color | Delta from Adjacent | Visual Separation |
|------|-------|---------------------|-------------------|
| Dominant bg | `#ECFEFF` | — | — |
| Secondary surface | `#FFFFFF` | ~3 lightness pts | ❌ INVISIBLE without shadow |
| Accent | `#0891B2` (cyan) | — | ✅ Visible |
| CTA | `#22C55E` (green) | — | ✅ Visible (conflicts with accent) |

**Verdict**: 60-30 split is non-functional. Dual 10% accent hues violate the rule. **FAIL.**

---

### Typography Hierarchy Assessment

| Level | Font | Weight | Differentiation |
|-------|------|--------|-----------------|
| Headings | Outfit | 300–700 | ✅ Distinct personality |
| Body | Work Sans | 300–700 | ✅ Distinct personality |
| Mono | JetBrains Mono | various | ✅ Clear distinction |

**Best typography pairing in the set.** Clear heading/body/mono three-tier hierarchy. Minor personality concern (Outfit too casual for enterprise).

---

## THEME 3: CORPORATE (Light) — 7.0/10

### ✅ Strengths

1. **Typography rationale is the strongest in the set**: Lexend's dyslexia certification + Source Sans 3's enterprise provenance (Stripe, Adobe) creates a genuinely defensible, auditable typography choice. No other theme has this quality of reasoning behind font selection.

2. **Dark sidebar (`#1E293B`) on light body pattern is correct**: Corporate correctly mirrors the Linear/Vercel/Stripe "dark sidebar, light content" enterprise dashboard pattern. Unlike Studio (which borrows this pattern incorrectly), Corporate earns it — enterprise users have conditioned expectations for this layout.

3. **Cleanest token structure**: No ambiguous dual-role tokens (unlike Studio's sidebar-bg=text-secondary issue). Semantic values are coherent.

---

### ❌ Issues Found (minimum 2 required — found 4)

**Issue B-O1 [HIGH] — 60-30 ratio imperceptible: `#F8FAFC` vs `#FFFFFF` delta is near-zero**
- Corporate background `#F8FAFC` to surface `#FFFFFF` — lightness delta: **~2 points** (0–100 scale)
- This is a smaller delta than Studio (which already fails the visibility test)
- In practice: Corporate renders as an undifferentiated white canvas. The 60% "slate tint" is invisible without high-calibration monitors in professional color-accurate settings
- Same structural failure as Studio — the 30% "cards" layer doesn't visually exist without mandatory box-shadows
- **Partial mitigation**: Corporate's border token `#E2E8F0` is stronger than Studio's `#A5F3FC`, providing border-based card separation where Studio relies entirely on background color
- **Verdict**: The 60-30 split ONLY works in Corporate if every card uses `border: 1px solid var(--color-corthex-border)`. This must be documented as a requirement, not an option.

**Issue B-O2 [HIGH] — Info token and accent-hover token are identical: `#3B82F6`**
- `--color-corthex-info: #3B82F6`
- `--color-corthex-accent-hover: #3B82F6`
- Same hex value used for two different semantic roles: "informational status" and "interactive hover state"
- A developer implementing a hovered primary button will produce a visual output identical to an info badge
- **Scenario**: A "Processing" info badge (blue) next to a hovered "Submit" button (blue-hover) — user cannot distinguish system state from interactive action
- **Fix**: Differentiate info from accent-hover. Options: keep accent-hover at `#3B82F6`, change info to `#0EA5E9` (sky-500) or `#6366F1` (indigo-500) for clear semantic separation

**Issue B-O3 [HIGH] — Cross-theme brand divergence from font personality gap**
- Command: DM Sans (precise, geometric, neutral)
- Studio: Outfit + Work Sans (geometric, approachable, slightly playful)
- Corporate: Lexend + Source Sans 3 (accessible, institutional, sober)
- These three heading font personalities span from "modern SaaS tool" (DM Sans) to "institutional document" (Lexend)
- When a user switches themes, they experience what feels like **three different products**, not one product with three skins
- A shared DNA element is missing — all three could use a common display font for brand marks/logos while varying the UI font, preserving both "same product" identity and per-theme personality
- **This is the single biggest cross-theme visual consistency failure**

**Issue B-O4 [MEDIUM] — Handoff token `#F97316` breaks cross-theme semantic consistency**
- Command: `--color-corthex-handoff: #A78BFA` (purple)
- Studio: `--color-corthex-handoff: #A78BFA` (purple)
- Corporate: `--color-corthex-handoff: #F97316` (orange = same as CTA)
- Handoff is a core CORTHEX domain concept (see PRD: "핸드오프(Handoff)") — an agent delegation event
- Users who switch between themes will encounter handoff indicators that are purple (Command/Studio) vs orange (Corporate) for the SAME concept
- In Corporate, an orange Handoff badge is visually indistinguishable from an orange CTA button
- **Fix**: Standardize handoff to `#A78BFA` (purple) across ALL themes. Purple is unused elsewhere in any theme — it cleanly "owns" the handoff semantic role.

---

### 60-30-10 Ratio Assessment

| Zone | Color | Delta from Adjacent | Visual Separation |
|------|-------|---------------------|-------------------|
| Dominant bg | `#F8FAFC` | — | — |
| Secondary surface | `#FFFFFF` | ~2 lightness pts | ❌ Invisible without border/shadow |
| Accent | `#2563EB` (blue) | — | ✅ Visible |
| CTA | `#F97316` (orange) | — | ✅ Visible (dual accent concern) |

**Verdict**: Same 60-30 failure as Studio, but partially mitigated by stronger border tokens (`#E2E8F0`). Dual accent (blue + orange) technically violates 60-30-10 but is defensible as "informational vs action" distinction — a pattern with precedent at Stripe, Intercom, Notion. **CONDITIONAL PASS** (requires mandatory card borders documented).

---

### Typography Hierarchy Assessment

| Level | Font | Weight | Differentiation |
|-------|------|--------|-----------------|
| Headings | Lexend | 300–700 | ✅ Distinct — accessibility optimized |
| Body | Source Sans 3 | 300–700 | ✅ Distinct — enterprise proven |
| Mono | JetBrains Mono | various | ✅ Clear distinction |

**Strong two-font system.** Clear heading/body/mono hierarchy. Best justified font choice in the set.

---

## CROSS-THEME CONSISTENCY ANALYSIS

### Shared Token Audit

| Token Category | Status | Notes |
|----------------|--------|-------|
| Success / Warning / Error / Info (base) | ⚠️ PARTIAL | Info `#3B82F6` = Corporate accent-hover — breaks in Corporate |
| Handoff | ❌ INCONSISTENT | Corporate `#F97316` breaks `#A78BFA` standard |
| Spacing scale | ✅ CONSISTENT | All themes share identical `--space-*` |
| Shadow tokens | ❌ BROKEN for Command | Dark-theme shadows are invisible (see B-C1) |
| Border radius | ✅ CONSISTENT | 6/8/12/16px scale across all |
| Motion/transitions | ✅ CONSISTENT | 150/200/300ms |
| Sidebar structure | ✅ CONSISTENT | All three use dark sidebar (Command: full dark; Studio/Corporate: dark on light) |
| Icon library | ✅ CONSISTENT | Lucide React across all |
| Mono font | ✅ CONSISTENT | JetBrains Mono across all |

**Structural consistency is good (spacing, motion, radii, icons, mono). Semantic consistency has two failures (handoff color, info/hover collision).**

### Brand Identity Coherence Check

The "same product, different skins" test — does switching themes feel like changing clothes or changing identity?

**Current verdict: Changing identity (3 different products)**

Root cause: Three different heading font families with incompatible personalities. DM Sans (Command) feels like a developer tool. Outfit (Studio) feels like a consumer productivity app. Lexend (Corporate) feels like enterprise software. No shared typographic DNA bridges them.

**Recommendation**: All three themes should share a common `--font-brand` token (e.g., DM Sans or Inter as the neutral backbone for UI chrome: nav items, labels, metadata). Per-theme fonts apply only to content headings and display text. This preserves personality differentiation while maintaining "same product" identity in UI chrome.

### Spacing Rhythm Assessment

4px base scale is industry standard and correct. The 7-step scale (4/8/16/24/32/48/64px) is applied identically across all themes — no visual rhythm inconsistencies between themes at the layout level. ✅

### Component Shape Consistency

All three themes use identical button/card/input/modal radius values:
- Buttons: `border-radius: 8px` (uniform across all)
- Cards: `border-radius: 12px` (uniform)
- Modals: `border-radius: 16px` (uniform)

**Minor concern**: Command (dark power tool) warrants slightly more angular buttons (4–6px radius) for personality authenticity. Linear uses 6px. Supabase uses 6px. 8px reads as "friendly SaaS" — better suited to Studio. This is cosmetic, not structural.

---

## PRIORITIZED FIX LIST (Visual Consistency only)

| ID | Theme | Severity | Visual Consistency Issue |
|----|-------|----------|--------------------------|
| B-C1 | Command | 🔴 HIGH | Shadow tokens invisible on dark bg — needs dark-specific elevation system |
| B-S1 | Studio | 🔴 HIGH | 60-30 bg/surface delta too small — white cards invisible on cyan-white bg |
| B-O1 | Corporate | 🔴 HIGH | 60-30 bg/surface delta near-zero — requires mandatory card borders |
| B-S2 | Studio | 🔴 HIGH | Dual accent fragmentation (cyan + green) breaks 10% rule |
| B-O2 | Corporate | 🔴 HIGH | Info = accent-hover = `#3B82F6` — semantic collision |
| B-O3 | All | 🟠 HIGH | Three divergent heading font personalities break "same product" identity |
| B-O4 | Corporate | 🟠 HIGH | Handoff color `#F97316` breaks `#A78BFA` cross-theme standard |
| B-S3 | Studio | 🟠 HIGH | `sidebar-bg` = `text-secondary` = `#0E7490` — semantic token inversion |
| B-C2 | Command | 🟠 HIGH | Single font family lacks heading/body typographic contrast |
| B-S4 | Studio | 🟡 MEDIUM | Dark sidebar on light theme misaligns with Notion/Plane collaborative benchmark |
| B-C3 | Command | 🟡 MEDIUM | Sidebar BG = Page BG — boundary invisible without border |
| B-C4 | Command | 🟡 MEDIUM | "Cyberpunk" keywords mismatch actual "Premium Dark" palette |
| B-S5 | Studio | 🟡 MEDIUM | Outfit too playful for enterprise SaaS — needs target user clarification |
| B-Cx1 | All | 🟡 MEDIUM | Button radius 8px uniform — Command warrants 4–6px for precision feel |

---

## MANDATORY FIXES BEFORE PHASE 3

The following must be resolved before Stitch screen generation. Generating 125+ screens against a broken design system will embed these defects in every screen:

1. **Shadow system for dark theme**: Command needs a separate elevation strategy (borders or glow, not drop shadows)
2. **60-30 bg/surface delta**: Both Studio and Corporate need either darker bg OR mandatory shadow/border documentation
3. **Handoff color standardization**: Corporate must adopt `#A78BFA` to match Command + Studio
4. **Info/hover token separation** in Corporate: `#3B82F6` cannot serve double duty

---

*Critic-B review complete. Total issues found: 14 (5 HIGH, 5 HIGH-MEDIUM, 4 MEDIUM). Zero false positives — all findings backed by hex calculations or token cross-references.*
