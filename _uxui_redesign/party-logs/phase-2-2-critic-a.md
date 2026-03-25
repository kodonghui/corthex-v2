# Phase 2-2 Party Mode — CRITIC-A Review
## UX Practicality Analysis

**Date:** 2026-03-25
**Critic:** CRITIC-A (UX Practicality)
**Focus:** 8-hour daily comfort, Fitts's Law, cognitive load, readability, theme switching UX

---

## Theme: Command

### Score: 6/10

### Issues:

- issue: [UX-CRITICAL] **Warning token (#EAB308) = Accent Hover (#EAB308) — identical values create semantic collision.** When a user's cursor hovers over a gold button, the hover state renders the same color as a "Warning" status badge. A dashboard showing a warning alert next to a hovered primary button produces identical visual signals. This forces users to rely on context alone — removing color as a redundant cue. In an 8-hour high-stress environment (AI agents failing, handoffs pending), semantic color breakdown increases error rates. Fix: darken warning to `#D97706` or brighten hover to `#F59E0B` — break the tie.

- issue: [UX-HIGH] **Extreme 19.8:1 text contrast creates halo/ghosting fatigue during extended reading.** `#FAFAF9` on `#0C0A09` exceeds AAA by a wide margin. Research on dark mode readability (Piepenbrock et al., 2013; Apple HIG dark mode guidelines) consistently shows that pure-white text on near-black backgrounds causes coronas and negative afterimages during prolonged reading — particularly on OLED/AMOLED screens. The human eye adjusts poorly when pupils must accommodate 19.8:1 at paragraph level for hours. Fix: soften primary text to `#E7E5E4` (~16:1) or `#D6D3D1` (~13:1) — still AAA-compliant but physiologically gentler.

- issue: [UX-HIGH] **No line-height or font-size scale defined anywhere in shared tokens.** The design system has spacing, shadows, border-radius — but no `--line-height-body`, `--line-height-heading`, `--font-size-sm`, `--font-size-base`, or `--font-size-lg` tokens. Without these, every developer independently picks font sizes and line-heights, guaranteeing inconsistency. For 8-hour reading, line-height of 1.5–1.6× is the established minimum for body text. A token system without this is incomplete.

- issue: [UX-MEDIUM] **DM Sans is loaded in only 3 weights (400/500/700) — the jump from 500→700 is too abrupt for smooth hierarchy.** Subheadings, table headers, and label text typically need 600 weight. Without it, designers either under-use bold (hierarchy collapses) or over-use it (everything screams). Add weight 600 to the import. Small fix, high hierarchy payoff.

- issue: [UX-LOW] **Sidebar inactive text (#A8A29E) and text-disabled (#57534E) are visually adjacent in perceived lightness.** On a dark theme, secondary text at ~8.3:1 and disabled text at ~2.2:1 create a functional gradient — but in practice, users at hour 7 who see a dim sidebar item may not distinguish "secondary label" from "disabled control." Consider adding a slight italic style to disabled states as a non-color distinguisher.

### Praise:

- praise: [UX] **60-30-10 rule is cleanly enforced.** Background #0C0A09 as dominant surface, #1C1917/#292524 as secondary surfaces, and gold #CA8A04 at 10% for accent is the canonical approach. This means user attention naturally flows to gold CTAs and active states without being trained. Linear and Supabase use this exact pattern successfully for 8-hour developer tooling.

- praise: [UX] **Sidebar background matches main background (#0C0A09 = #0C0A09).** This creates a "seamless dark shell" — the sidebar doesn't pull visual attention away from content. Users in deep-focus command-line-style workflows report reduced eye movement fatigue when the shell is uniform dark. Retool and Linear use this successfully.

- praise: [UX] **Single font family (DM Sans for both heading and body) reduces inter-family cognitive switching.** While heading-only fonts add personality, swapping typefaces at every heading/paragraph boundary creates micro-cognitive load. Command's single-family approach is the right call for a power-user tool with high information density.

---

## Theme: Studio

### Score: 4/10

### Issues:

- issue: [UX-CRITICAL] **"Teal universe" chromatic saturation creates significant fatigue risk at 6+ hours.** Every layer of the Studio theme is a cyan/teal variant: background #ECFEFF (cyan wash), surface #FFFFFF, elevated #F0FDFA (cyan tint), accent #0891B2 (medium cyan), sidebar #0E7490 (dark teal), sidebar text #A5F3FC (light cyan), borders #A5F3FC (cyan), secondary text #0E7490 (same as sidebar bg). The human visual system adapts to dominant hues over time — after 2–3 hours in a cyan-saturated environment, color discrimination accuracy drops and users experience "cyan blindness" where the accent color stops registering as attention-worthy. This is the opposite of the 10% accent rule's intent. Fix: shift the background to neutral off-white (#F8FAFC or #FAFAF9) so only deliberate accent elements carry cyan, not every surface.

- issue: [UX-CRITICAL] **Dark teal sidebar on light cyan background creates a high-contrast jump zone that fatigues lateral eye movement.** Every time a user's gaze crosses the sidebar/content boundary, eyes must accommodate a ~7:1 luminance shift (dark teal → light cyan). In an 8-hour workday, a knowledge worker navigating between sidebar items and content makes this transition hundreds to thousands of times. Notion avoids this by using a light sidebar with the main content area — Studio should do the same, or adopt a muted sidebar tone (e.g., #E0F7FA vs the current #0E7490 dark).

- issue: [UX-HIGH] **Two distinct accent hues (cyan #0891B2 for navigation + green #22C55E for CTA) create ambiguous visual hierarchy.** Fitts's Law addresses click accuracy, but when two hues of equal saturation compete for attention (teal navigation vs green save button), the user's brain must perform extra disambiguation work on every interaction decision: "Is the green thing a navigation element or an action button?" After 50+ interactions per day, this disambiguation effort accumulates. Studio has two "loud" colors with no clear dominance rule.

- issue: [UX-HIGH] **`--color-corthex-text-primary: #164E63` is tinted teal, not perceptually neutral.** Unlike Command (#FAFAF9 ≈ white) or Corporate (#1E293B ≈ near-black neutral), Studio's body text carries a cyan-teal hue. In a dense reading environment (documents, logs, agent outputs), non-neutral text color adds background chromatic load even when reading black-and-white information. Users have reported increased reading fatigue when text has a dominant hue vs. neutral dark. Fix: shift to `#1E293B` or `#0F172A` for primary text — neutral dark reads faster than tinted dark.

- issue: [UX-MEDIUM] **Outfit (headings) + Work Sans (body) — two distinct geometric sans-serif families with similar proportions and weights.** The personality difference is subtle. Non-designers won't notice the switch, but the rendering engine must load two font families (adding ~200–300KB of font requests). More critically, a developer implementing the design may accidentally use Work Sans for headings and Outfit for body — the visual output will be nearly identical, and the error will go undetected. Consider: if differentiation requires expert-level typographic perception to notice, the complexity cost is not justified.

- issue: [UX-LOW] **No touch target minimum size specified.** Shared tokens have `--space-xs: 4px` as minimum spacing, which is below the 44×44px minimum touch target recommendation (Apple HIG, Material Design). Studio's "collaborative" personality implies multi-device use (including tablet). Without explicit minimum button/item heights, touch usability is unspecified.

### Praise:

- praise: [UX] **Background #ECFEFF (light cyan tint instead of pure white) is the right call for eye comfort.** Pure white (#FFFFFF) reflects at maximum intensity under bright office lighting, causing glare. A slight color tint reduces this by 5–10% luminance while maintaining the light-mode feel. Notion's cream-tinted versions and some of Figma's workspace colors use this technique.

- praise: [UX] **Outfit 300–700 range (5 weights) gives Studio the most typographic flexibility of the three themes.** Light (300) for captions, Regular (400) for body, Medium (500) for UI labels, SemiBold (600) for subheadings, Bold (700) for headings — a complete scale without unnecessary jumps. This enables fine-grained information hierarchy in collaborative document-heavy interfaces.

---

## Theme: Corporate

### Score: 7/10

### Issues:

- issue: [UX-HIGH] **Accent Hover (#3B82F6) = Info semantic token (#3B82F6) — identical hex values.** When a user hovers over a blue primary button, the hover state renders at `#3B82F6`. This is the exact same color as `--color-corthex-info` status indicator (informational badges, banners, toasts). In a dashboard with active info alerts near interactive buttons, hover events and info states become visually indistinguishable. This is a less obvious but equally problematic semantic collision as Command's warning/hover conflict. Fix: differentiate accent-hover to `#60A5FA` (lighter step) or keep accent-deep `#1D4ED8` as the hover state (darker, more decisively "selected").

- issue: [UX-HIGH] **Sidebar active state `rgba(37,99,235,0.20)` on `#1E293B` dark background is insufficient affordance.** Translucent blue overlay on dark slate renders as a barely-perceptible blue tint. A user navigating at speed may not register which item is currently active — particularly after context switches between the main content and sidebar. Without a 2px left-border accent (the industry standard seen in Linear, Notion, Stripe, Vercel dashboards), the active state depends entirely on the user noticing a subtle background color change. At hour 5 of an 8-hour session when focus is on content (not chrome), this invisible active state increases "where am I in navigation" confusion.

- issue: [UX-MEDIUM] **Disabled text `#CBD5E1` on `#F8FAFC` ≈ 1.8:1** is below even the user's ability to determine if content exists. The Writer flagged this but it deserves UX elaboration: a disabled form field that shares near-identical luminance with the background will be parsed by users as "missing" rather than "disabled." This breaks the cognitive model of the form. Users who interact with a form perceive it as "only 3 fields" when actually 5 exist (2 are disabled but invisible). Enterprise forms with conditional logic (common in admin tools) require clearly visible disabled states to communicate what's conditional. Fix: `#94A3B8` minimum.

- issue: [UX-MEDIUM] **Orange CTA (#F97316) is a high-arousal stimulant color that conflicts with the "Trust & Authority" corporate theme goal.** Orange is associated with urgency, sale prices, and discounting (Amazon, fast food CTAs) — the opposite of "corporate authority." Vercel (Corporate's primary inspiration) uses black CTA buttons. Stripe uses gradient. Clerk uses purple. None use orange. Orange may produce the right click-rate in A/B tests but erodes the professional brand impression that makes enterprise buyers sign contracts. UX and brand tonality misalignment.

- issue: [UX-LOW] **Source Sans 3 is loaded in 5 weights (300–700) but the typical enterprise use case needs 3 at most** (Regular 400 for body, Medium 500 for UI labels, Bold 700 for emphasis). Loading 5 weights adds ~100–150KB unnecessary font payload per theme switch. For a corporate tool that prioritizes perceived performance and reliability, unnecessary weight loading is a credibility risk.

### Praise:

- praise: [UX] **This is the safest theme for sustained 8-hour reading.** Neutral #1E293B near-black on #F8FAFC near-white achieves 12.3:1 — strong enough to be sharp without the extreme halos of Command's 19.8:1. The hue is neutral (no tint bias), which means reading long documents, logs, and reports produces the least chromatic fatigue.

- praise: [UX] **Lexend as heading font is the most empirically defensible typography choice in the system.** Certified by the British Dyslexia Association and designed specifically to reduce visual stress during extended reading, it signals accessibility commitment without sacrificing modern aesthetics. For enterprise sales contexts where diverse teams (including those with reading difficulties) use the product 8 hours/day, this is a measurable user outcome differentiator, not just aesthetic preference.

- praise: [UX] **Sidebar text `#94A3B8` on `#1E293B` at 5.7:1 is the best sidebar contrast of all three themes.** Command's sidebar secondary text (same #A8A29E) and Studio's sidebar (failed 3.0:1) both fall short. Corporate's sidebar is the most immediately readable, reducing the visual search cost when scanning navigation items.

---

## Overall Score: 6/10

### Cross-cutting System Issues (applies to all themes):

1. **Missing line-height scale** — The single most critical readability gap. No `--line-height-body` (should be 1.5–1.6×), no `--line-height-heading` (1.2–1.3×), no `--line-height-code` (1.4×). Every implementer will free-choice this. In an 8-hour reading tool, line-height variation between components is immediately noticeable and creates a "DIY" perception.

2. **Missing font-size scale** — No `--font-size-xs` through `--font-size-3xl`. Without this, sidebar item font sizes, topbar labels, card headings, and table cells are all independently specified per component. A dense data tool (CORTHEX has agent logs, handoff trackers, cost dashboards) with no system font scale will produce inconsistent information density.

3. **No minimum touch target token** — `--space-xs: 4px` is not a touch target. A `--touch-target-min: 44px` token should be documented even for a desktop-primary app. Agent action buttons in compressed dashboard layouts may fall below 44px height without this guardrail.

4. **Theme names do not communicate dark/light** — "Command," "Studio," and "Corporate" are personality/role archetypes, not mode descriptors. A new user offered three names in a theme picker has no immediate signal that "Command" is dark mode. Add a subtitle or icon (dark circle / light circle) to each option in the theme switching UI. The naming is great for marketing; it needs a mode indicator for UX.

5. **No active state left-border token defined** — All three themes use rgba background as the sole active indicator. Industry standard (Linear, Notion, Vercel) uses a 2px left-border accent as the primary active cue. This should be `--sidebar-active-indicator-width: 2px` + `--sidebar-active-indicator-color: var(--color-corthex-accent)` in shared tokens.

---

## Cross-talk Summary (for Critics B and C):

1. **Studio Theme is the highest-risk theme** — teal saturation overload creates 8-hour fatigue risk, sidebar contrast fails WCAG, and two competing accent hues undermine hierarchy. This theme needs a fundamental bg color reassessment (neutral instead of cyan wash) before implementation. Critics B and C should evaluate whether the cyan identity is worth the readability cost.

2. **Semantic color collisions across themes need system-level resolution** — Command (#EAB308 warning = hover), Corporate (#3B82F6 info = accent-hover), and Corporate (handoff = CTA orange). These aren't isolated issues; they indicate the semantic token system wasn't validated against interactive state colors. The fix requires a cross-theme token audit, not per-theme patches.

3. **The shared token system is structurally incomplete** — Missing: line-height scale, font-size scale, touch target minimums, active state indicator pattern. These are not aesthetic gaps — they are the infrastructure for consistent implementation. If Phase 3 (component building) starts without these tokens, every component will diverge. Resolve before implementation begins.

---

*CRITIC-A review complete. Submitted to team lead.*
