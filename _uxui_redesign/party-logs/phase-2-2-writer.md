# Phase 2-2 Party Mode — Writer Presentation
## 3 Theme Design Systems for Critic Review

**Date:** 2026-03-25
**Author:** Writer Agent (Phase 2-2)
**Sources:** command/MASTER.md, studio/MASTER.md, corporate/MASTER.md, design-tokens.md, phase-1-research/benchmark-analysis.md

---

## Preamble: What We're Reviewing

Phase 2 produced three complete theme design systems for CORTHEX. These themes will be implemented as CSS `[data-theme="X"]` blocks in `themes.css`. All colors are traceable to the `--design-system promax` output + Phase 1 benchmark overrides. Zero manually-guessed hex values.

The three themes are:
- **Command** — Dark power-user theme (cyberpunk premium HUD)
- **Studio** — Light collaborative theme (soft UI evolution)
- **Corporate** — Light enterprise theme (trust & authority)

---

---

# THEME 1: COMMAND (Dark)

## 1. Color Palette — Exact Hex Values

| Role | Hex | CSS Variable | 60-30-10 Role |
|------|-----|--------------|---------------|
| Background | `#0C0A09` | `--color-corthex-bg` | **60%** — dominant surface |
| Surface (cards/panels) | `#1C1917` | `--color-corthex-surface` | **30%** — secondary surface |
| Elevated (modals/dropdowns) | `#292524` | `--color-corthex-elevated` | (sub-layer of 30%) |
| Accent/CTA | `#CA8A04` | `--color-corthex-accent` | **10%** — gold highlight |
| Accent Hover | `#EAB308` | `--color-corthex-accent-hover` | |
| Accent Deep | `#A16207` | `--color-corthex-accent-deep` | |
| Accent Muted | `rgba(202,138,4,0.10)` | `--color-corthex-accent-muted` | |
| Border | `#44403C` | `--color-corthex-border` | |
| Border Strong | `#57534E` | `--color-corthex-border-strong` | |
| Text Primary | `#FAFAF9` | `--color-corthex-text-primary` | |
| Text Secondary | `#A8A29E` | `--color-corthex-text-secondary` | |
| Text Disabled | `#57534E` | `--color-corthex-text-disabled` | |
| Text on Accent | `#0C0A09` | `--color-corthex-text-on-accent` | ⚠️ SEE ISSUE #1 |
| Sidebar BG | `#0C0A09` | `--color-corthex-sidebar-bg` | |
| Sidebar Text | `#A8A29E` | `--color-corthex-sidebar-text` | |
| Sidebar Text Active | `#FAFAF9` | `--color-corthex-sidebar-text-active` | |
| Sidebar Hover | `rgba(202,138,4,0.10)` | `--color-corthex-sidebar-hover` | |
| Sidebar Active | `rgba(202,138,4,0.15)` | `--color-corthex-sidebar-active` | |
| NEXUS BG | `#0A0908` | `--color-corthex-nexus-bg` | |
| Success | `#22C55E` | `--color-corthex-success` | |
| Warning | `#EAB308` | `--color-corthex-warning` | |
| Error | `#EF4444` | `--color-corthex-error` | |
| Info | `#3B82F6` | `--color-corthex-info` | |
| Handoff | `#A78BFA` | `--color-corthex-handoff` | |

**60-30-10 Summary:**
- 60% `#0C0A09` — main app background, sidebar background, NEXUS canvas
- 30% `#1C1917` + `#292524` — cards, panels, elevated surfaces
- 10% `#CA8A04` (gold) — buttons, active states, accent borders

## 2. Typography

| Role | Font | Weights | CSS Import |
|------|------|---------|------------|
| Heading + Body | **DM Sans** | 400, 500, 700 | `family=DM+Sans:wght@400;500;700` |
| Mono | **JetBrains Mono** | existing | (already in project) |

**Rationale:** DM Sans is a geometric sans-serif with slightly rounded terminals. It carries a "modern precision" feel — not playful (like Nunito) but not sterile (like Inter). For a dark power-user UI, DM Sans at 700 weight creates strong visual hierarchy without the militaristic rigidity of fonts like Rajdhani or Barlow Condensed. It bridges the gap between the "premium SaaS" of Linear and the "developer tool" of Supabase.

_Note: MASTER.md listed Satoshi + General Sans as primary choices, but both are not available on Google Fonts without font hosting. DM Sans is the promax-approved Google Fonts fallback and is the production-ready choice._

## 3. Benchmark Evidence

**Primary Inspirations (Phase 1 Research):**

| Site | Relevance Score | What We Borrowed |
|------|-----------------|-----------------|
| **Linear** (01) | 5/5 | Near-black `#09090b` background pattern → command uses `#0C0A09` |
| **Supabase** (05) | 5/5 | Dark developer dashboard, single accent color approach, minimal borders |
| **Retool** (08) | 5/5 | Command palette prominence (Cmd+K), AI-native dark UI, dense information |
| **Neon** (14) | 4/5 | Near-black with warm amber accent (we use gold `#CA8A04` similarly) |

**Phase 1 Design Direction Confirmation:**
> "Command Theme (Dark, Power User) — Inspired by: Linear + Supabase + Retool. Near-black background (#09090b), monochrome with single bright accent, dense information display."

Phase 1 also confirmed: _"Dark Theme as Default (9/13 sites)"_ — Linear, Supabase, Retool, Neon all use near-black. Command is the direct implementation of this pattern.

**Phase 2 Override Applied:** Background changed from promax default `#FAFAF9` → `#0C0A09` to match the Linear/Supabase/Retool dark pattern.

## 4. WCAG AA Contrast Ratios

| Pair | Ratio | WCAG Status | Notes |
|------|-------|-------------|-------|
| `#FAFAF9` (text) on `#0C0A09` (bg) | **19.8:1** | ✅ AAA | Excellent |
| `#FAFAF9` (text) on `#1C1917` (surface) | **14.7:1** | ✅ AAA | Excellent |
| `#A8A29E` (secondary text) on `#0C0A09` | **~8.3:1** | ✅ AA | Passes for small text |
| `#A8A29E` (secondary text) on `#1C1917` | **~7.5:1** | ✅ AA | Passes for small text |
| `#CA8A04` (accent) on `#0C0A09` | **5.8:1** | ✅ AA | Passes normal text |
| `#0C0A09` (text-on-accent) on `#CA8A04` button | **~7.0:1** | ✅ AA | Dark text on gold ✅ |
| `#FAFAF9` on `#0C0A09` (sidebar active text) | **19.8:1** | ✅ AAA | Excellent |
| White `#FFFFFF` on `#CA8A04` button | **~2.77:1** | ❌ FAIL | See Issue #1 below |

## 5. CSS Variable Names (themes.css block)

```css
[data-theme="command"] {
  --color-corthex-bg: #0C0A09;
  --color-corthex-surface: #1C1917;
  --color-corthex-elevated: #292524;
  --color-corthex-border: #44403C;
  --color-corthex-border-strong: #57534E;
  --color-corthex-accent: #CA8A04;
  --color-corthex-accent-hover: #EAB308;
  --color-corthex-accent-deep: #A16207;
  --color-corthex-accent-muted: rgba(202, 138, 4, 0.10);
  --color-corthex-text-primary: #FAFAF9;
  --color-corthex-text-secondary: #A8A29E;
  --color-corthex-text-disabled: #57534E;
  --color-corthex-text-on-accent: #0C0A09;      /* dark text on gold button */
  --color-corthex-sidebar-bg: #0C0A09;
  --color-corthex-sidebar-border: #1C1917;
  --color-corthex-sidebar-text: #A8A29E;
  --color-corthex-sidebar-text-active: #FAFAF9;
  --color-corthex-sidebar-hover: rgba(202, 138, 4, 0.10);
  --color-corthex-sidebar-active: rgba(202, 138, 4, 0.15);
  --color-corthex-success: #22C55E;
  --color-corthex-warning: #EAB308;
  --color-corthex-error: #EF4444;
  --color-corthex-info: #3B82F6;
  --color-corthex-handoff: #A78BFA;
  --color-corthex-nexus-bg: #0A0908;
  color-scheme: dark;
}
```

## 6. Potential Issues

**Issue #1 — CRITICAL: White on Gold button fails WCAG AA**
- `design-tokens.md` defines `--color-corthex-text-on-accent: #0C0A09` (dark) ✅
- But `command/MASTER.md` button spec uses `color: white` on `background: #CA8A04`
- Contrast of white on `#CA8A04` = **~2.77:1** — FAILS AA (needs 4.5:1)
- `text-on-accent` must be `#0C0A09` (near-black), not white. design-tokens.md is correct; MASTER.md button CSS is wrong.

**Issue #2 — Terminology Mismatch: "Cyberpunk" vs actual aesthetic**
- MASTER.md style keywords: "Neon, dark mode, terminal, HUD, sci-fi, glitch, dystopian, matrix, tech noir"
- Actual design uses: near-black + warm gold, clean DM Sans font, no glitch effects
- The actual aesthetic is **"Premium Dark" / "Stealth Luxury"** (like Linear/Supabase), NOT traditional neon cyberpunk
- Risk: developers may add neon glow effects that are out-of-character. Style keywords need correction.

**Issue #3 — MASTER.md checklist copy error**
- Pre-Delivery Checklist says: _"Light mode: text contrast 4.5:1 minimum"_
- Command is a **dark** theme — checklist should say "Dark mode contrast check"
- Minor but could cause confusion during implementation.

**Issue #4 — DM Sans vs Satoshi/General Sans**
- MASTER.md mentions Satoshi + General Sans but Google Fonts import only provides DM Sans
- Design system must clarify: DM Sans is the production font, not Satoshi
- If Satoshi is desired, it requires self-hosting (fontshare.com) — an additional infra decision

---

---

# THEME 2: STUDIO (Light)

## 1. Color Palette — Exact Hex Values

| Role | Hex | CSS Variable | 60-30-10 Role |
|------|-----|--------------|---------------|
| Background | `#ECFEFF` | `--color-corthex-bg` | **60%** — light cyan wash |
| Surface (cards/panels) | `#FFFFFF` | `--color-corthex-surface` | **30%** — white cards |
| Elevated | `#F0FDFA` | `--color-corthex-elevated` | (sub-layer of 30%) |
| Accent/Primary | `#0891B2` | `--color-corthex-accent` | **10%** — cyan accent |
| Accent Hover | `#06B6D4` | `--color-corthex-accent-hover` | |
| Accent Deep | `#0E7490` | `--color-corthex-accent-deep` | |
| Accent Muted | `rgba(8,145,178,0.10)` | `--color-corthex-accent-muted` | |
| CTA | `#22C55E` | (in MASTER.md as `--color-cta`) | Button primary |
| Border | `#A5F3FC` | `--color-corthex-border` | ⚠️ SEE ISSUE #2 |
| Border Strong | `#67E8F9` | `--color-corthex-border-strong` | |
| Text Primary | `#164E63` | `--color-corthex-text-primary` | |
| Text Secondary | `#0E7490` | `--color-corthex-text-secondary` | |
| Text Disabled | `#67E8F9` | `--color-corthex-text-disabled` | ⚠️ SEE ISSUE #3 |
| Text on Accent | `#FFFFFF` | `--color-corthex-text-on-accent` | ⚠️ SEE Issue #4 |
| Sidebar BG | `#0E7490` | `--color-corthex-sidebar-bg` | Dark sidebar on light theme |
| Sidebar Border | `#0891B2` | `--color-corthex-sidebar-border` | |
| Sidebar Text | `#A5F3FC` | `--color-corthex-sidebar-text` | |
| Sidebar Text Active | `#FFFFFF` | `--color-corthex-sidebar-text-active` | |
| Sidebar Hover | `rgba(255,255,255,0.10)` | `--color-corthex-sidebar-hover` | |
| Sidebar Active | `rgba(255,255,255,0.15)` | `--color-corthex-sidebar-active` | |
| NEXUS BG | `#E0FCFF` | `--color-corthex-nexus-bg` | |
| Success | `#22C55E` | `--color-corthex-success` | |
| Warning | `#EAB308` | `--color-corthex-warning` | |
| Error | `#EF4444` | `--color-corthex-error` | |
| Info | `#3B82F6` | `--color-corthex-info` | |
| Handoff | `#A78BFA` | `--color-corthex-handoff` | |

**60-30-10 Summary:**
- 60% `#ECFEFF` — cyan-tinted app background, NEXUS canvas
- 30% `#FFFFFF` + `#F0FDFA` — white cards, panels, elevated surfaces
- 10% `#0891B2` (cyan) — links, borders, active states, focus rings

## 2. Typography

| Role | Font | Weights | CSS Import |
|------|------|---------|------------|
| Heading | **Outfit** | 300, 400, 500, 600, 700 | `family=Outfit:wght@300;400;500;600;700` |
| Body | **Work Sans** | 300, 400, 500, 600, 700 | `family=Work+Sans:wght@300;400;500;600;700` |
| Mono | **JetBrains Mono** | existing | (already in project) |

**Rationale:** Outfit is a geometric sans-serif (Poppins DNA but more refined) with variable-width letters that breathe well at display sizes. Work Sans is optimized for on-screen reading with slightly wider spacing. Together they create a **"modern productivity" voice** — collaborative but professional, not corporate stiff. This pairing directly matches the "Soft UI Evolution" target: approachable for daily collaborative work (Notion/Plane-like), not sterile (Roboto/Source Sans territory).

## 3. Benchmark Evidence

**Primary Inspirations (Phase 1 Research):**

| Site | Relevance Score | What We Borrowed |
|------|-----------------|-----------------|
| **Notion** (02) | 4/5 | Light/white background, workspace concept, airy generous spacing |
| **Plane** (09) | 5/5 | Exact product overlap (project mgmt + AI agents), white + black CTA buttons |
| **Cal.com** (10) | 3/5 | Clean light theme, settings UX patterns |
| **Dub** (15) | 3/5 | Minimal SaaS light patterns, tab-based content demos |

**Phase 1 Design Direction Confirmation:**
> "Studio Theme (Light, Collaborative) — Inspired by: Notion + Plane + Cal.com + Dub. White/light gray background, black text, minimal color, clean cards with subtle borders, airy spacing, generous whitespace."

**Key Pattern from Plane (most relevant site):** "Embedded product screenshot showing sidebar + project list + work items" — Studio theme mirrors this sidebar-first navigation structure with a light canvas for content.

**No Phase 2 bg override needed:** Light theme with tinted background (`#ECFEFF`) already matches Notion/Plane light-mode patterns without the harshness of pure white.

## 4. WCAG AA Contrast Ratios

| Pair | Ratio | WCAG Status | Notes |
|------|-------|-------------|-------|
| `#164E63` (text) on `#ECFEFF` (bg) | **8.2:1** | ✅ AA | Passes all text sizes |
| `#164E63` (text) on `#FFFFFF` (surface) | **9.4:1** | ✅ AAA | Excellent |
| `#0E7490` (secondary text) on `#ECFEFF` | **~5.2:1** | ✅ AA | Passes normal text |
| `#0E7490` (secondary text) on `#FFFFFF` | **~5.8:1** | ✅ AA | Passes normal text |
| `#0891B2` (accent) on `#ECFEFF` | **3.4:1** | ⚠️ FAIL normal text | Passes only large text (≥18px/14px bold) |
| `#0891B2` (accent) on `#FFFFFF` | **~3.8:1** | ⚠️ FAIL normal text | See Issue #1 |
| White `#FFFFFF` on `#22C55E` (CTA button) | **~2.18:1** | ❌ FAIL | See Issue #4 |
| `#164E63` on `#22C55E` (CTA button) | **~4.7:1** | ✅ AA | Dark text on green is correct |
| `#FFFFFF` (sidebar active text) on `#0E7490` (sidebar bg) | **~5.6:1** | ✅ AA | Sidebar readable |
| `#A5F3FC` (sidebar text) on `#0E7490` (sidebar bg) | **~3.0:1** | ⚠️ FAIL | See Issue #2 |

## 5. CSS Variable Names (themes.css block)

```css
[data-theme="studio"] {
  --color-corthex-bg: #ECFEFF;
  --color-corthex-surface: #FFFFFF;
  --color-corthex-elevated: #F0FDFA;
  --color-corthex-border: #A5F3FC;
  --color-corthex-border-strong: #67E8F9;
  --color-corthex-accent: #0891B2;
  --color-corthex-accent-hover: #06B6D4;
  --color-corthex-accent-deep: #0E7490;
  --color-corthex-accent-muted: rgba(8, 145, 178, 0.10);
  --color-corthex-text-primary: #164E63;
  --color-corthex-text-secondary: #0E7490;
  --color-corthex-text-disabled: #67E8F9;         /* ⚠️ needs review */
  --color-corthex-text-on-accent: #164E63;         /* dark text on #22C55E button */
  --color-corthex-sidebar-bg: #0E7490;
  --color-corthex-sidebar-border: #0891B2;
  --color-corthex-sidebar-text: #A5F3FC;           /* ⚠️ needs review */
  --color-corthex-sidebar-text-active: #FFFFFF;
  --color-corthex-sidebar-hover: rgba(255, 255, 255, 0.10);
  --color-corthex-sidebar-active: rgba(255, 255, 255, 0.15);
  --color-corthex-success: #22C55E;
  --color-corthex-warning: #EAB308;
  --color-corthex-error: #EF4444;
  --color-corthex-info: #3B82F6;
  --color-corthex-handoff: #A78BFA;
  --color-corthex-nexus-bg: #E0FCFF;
  color-scheme: light;
}
```

## 6. Potential Issues

**Issue #1 — CRITICAL: Cyan accent fails WCAG AA for normal text**
- `#0891B2` on `#ECFEFF` background = **3.4:1** — FAILS AA (4.5:1 required for normal text)
- `#0891B2` on `#FFFFFF` = **~3.8:1** — still FAILS
- This accent color can ONLY be used safely for: large text (≥18px regular / ≥14px bold), decorative elements, borders, icons where text label is separate
- Do NOT use `--color-corthex-accent` for body text, link text under 18px, or button labels

**Issue #2 — Sidebar text fails: light cyan on teal**
- `#A5F3FC` (sidebar-text) on `#0E7490` (sidebar-bg) = **~3.0:1** — FAILS AA
- Inactive sidebar items will be hard to read — especially at small font sizes
- Fix options: darken sidebar text to `#CFFAFE` (slightly brighter) or lighten to pure `#FFFFFF`
- `#FFFFFF` on `#0E7490` = ~5.6:1 ✅

**Issue #3 — Disabled text color is dangerously light**
- `--color-corthex-text-disabled: #67E8F9` is a sky-blue that will be nearly invisible on `#ECFEFF`
- WCAG doesn't mandate contrast for "disabled" states, but readability will suffer badly
- Suggest `#94BEC7` (muted teal-gray) as a safer disabled color

**Issue #4 — White text on #22C55E CTA button fails WCAG**
- `color: white` on `background: #22C55E` = **~2.18:1** — FAILS AA
- Use `#164E63` (dark teal text) on green button instead — gives ~4.7:1 ✅
- `--color-corthex-text-on-accent` in design-tokens.md is already set to `#FFFFFF` — this must be corrected to `#164E63`

**Issue #5 — CTA green vs Accent cyan creates visual noise**
- CTA (#22C55E green) + Accent (#0891B2 cyan) are two distinctly different hues
- Rendered side-by-side (e.g., "Save" button + active navigation link), they may compete
- The "10%" rule is at risk: with two accent hues, neither reads as dominant
- Recommendation: designate one as "functional accent" and one as "informational only"

---

---

# THEME 3: CORPORATE (Light)

## 1. Color Palette — Exact Hex Values

| Role | Hex | CSS Variable | 60-30-10 Role |
|------|-----|--------------|---------------|
| Background | `#F8FAFC` | `--color-corthex-bg` | **60%** — near-white slate |
| Surface (cards/panels) | `#FFFFFF` | `--color-corthex-surface` | **30%** — white cards |
| Elevated | `#F1F5F9` | `--color-corthex-elevated` | (sub-layer of 30%) |
| Accent/Primary | `#2563EB` | `--color-corthex-accent` | **10%** — trust blue |
| Accent Hover | `#3B82F6` | `--color-corthex-accent-hover` | |
| Accent Deep | `#1D4ED8` | `--color-corthex-accent-deep` | |
| Accent Muted | `rgba(37,99,235,0.10)` | `--color-corthex-accent-muted` | |
| CTA | `#F97316` | `--color-corthex-cta` | Button CTA orange |
| Border | `#E2E8F0` | `--color-corthex-border` | |
| Border Strong | `#CBD5E1` | `--color-corthex-border-strong` | |
| Text Primary | `#1E293B` | `--color-corthex-text-primary` | |
| Text Secondary | `#64748B` | `--color-corthex-text-secondary` | |
| Text Disabled | `#CBD5E1` | `--color-corthex-text-disabled` | ⚠️ SEE ISSUE #3 |
| Text on Accent | `#FFFFFF` | `--color-corthex-text-on-accent` | (for blue buttons only) |
| Sidebar BG | `#1E293B` | `--color-corthex-sidebar-bg` | Dark sidebar |
| Sidebar Border | `#334155` | `--color-corthex-sidebar-border` | |
| Sidebar Text | `#94A3B8` | `--color-corthex-sidebar-text` | |
| Sidebar Text Active | `#FFFFFF` | `--color-corthex-sidebar-text-active` | |
| Sidebar Hover | `rgba(255,255,255,0.08)` | `--color-corthex-sidebar-hover` | |
| Sidebar Active | `rgba(37,99,235,0.20)` | `--color-corthex-sidebar-active` | |
| NEXUS BG | `#F1F5F9` | `--color-corthex-nexus-bg` | |
| Success | `#22C55E` | `--color-corthex-success` | |
| Warning | `#EAB308` | `--color-corthex-warning` | |
| Error | `#EF4444` | `--color-corthex-error` | |
| Info | `#3B82F6` | `--color-corthex-info` | |
| Handoff | `#F97316` | `--color-corthex-handoff` | ⚠️ SEE ISSUE #4 |

**60-30-10 Summary:**
- 60% `#F8FAFC` — app background, NEXUS canvas, page whitespace
- 30% `#FFFFFF` + `#F1F5F9` — white cards, panels, elevated surfaces
- 10% `#2563EB` (blue) — primary actions, links, navigation active states

## 2. Typography

| Role | Font | Weights | CSS Import |
|------|------|---------|------------|
| Heading | **Lexend** | 300, 400, 500, 600, 700 | `family=Lexend:wght@300;400;500;600;700` |
| Body | **Source Sans 3** | 300, 400, 500, 600, 700 | `family=Source+Sans+3:wght@300;400;500;600;700` |
| Mono | **JetBrains Mono** | existing | (already in project) |

**Rationale:** Lexend was specifically designed to improve reading performance for users with dyslexia and reading difficulties — it has been certified by the British Dyslexia Association. For a corporate/enterprise tool used 8+ hours/day by diverse teams (including enterprise IT, HR, legal), Lexend signals **institutional accessibility commitment**. Source Sans 3 (Adobe's open-source companion) is the most proven enterprise body font — used by Stripe, Adobe, major government portals — carrying subconscious associations of "serious professional software." This pairing is the most **auditable** and **defensible** typography choice for enterprise sales contexts.

## 3. Benchmark Evidence

**Primary Inspirations (Phase 1 Research):**

| Site | Relevance Score | What We Borrowed |
|------|-----------------|-----------------|
| **Vercel** (03) | 4/5 | Clean light bg with `#F8FAFC` equivalent, geometric sans, two-CTA pattern |
| **Clerk** (07) | 3/5 | Clean white layout, trust-focused component design, auth/user management UX |
| **Stripe** (06) | 3/5 | Premium professional feel, metric display patterns, financial-grade polish |
| **Notion** (02) | 4/5 | Logo carousel, trust signals, mega-menu enterprise navigation |

**Phase 1 Design Direction Confirmation:**
> "Corporate Theme (Professional, Enterprise) — Inspired by: Vercel + Clerk + Stripe. White background with premium accents, gradient or mesh accent elements (subtle), balanced density, strong typography hierarchy, trust/credibility focused."

**Anti-Pattern Confirmed Avoided:**
> Phase 1: "Playful/Casual Tone for Enterprise Tools" — Lemon Squeezy cited as anti-example. Corporate theme explicitly forbids "Playful design" in MASTER.md. AI purple/pink gradients also explicitly banned.

**Pattern Applied:**
- Enterprise Gateway page pattern (B2B CTA: "Contact Sales" primary, "Login" secondary)
- Logo carousel + trust badges (Stripe pattern)
- Industry/role-based solution tabs (Notion enterprise pattern)

## 4. WCAG AA Contrast Ratios

| Pair | Ratio | WCAG Status | Notes |
|------|-------|-------------|-------|
| `#1E293B` (text) on `#F8FAFC` (bg) | **12.3:1** | ✅ AAA | Excellent |
| `#1E293B` (text) on `#FFFFFF` (surface) | **14.0:1** | ✅ AAA | Excellent |
| `#64748B` (secondary text) on `#F8FAFC` | **~4.8:1** | ✅ AA | Passes normal text |
| `#64748B` (secondary text) on `#FFFFFF` | **~5.2:1** | ✅ AA | Passes normal text |
| `#2563EB` (accent) on `#F8FAFC` | **4.6:1** | ✅ AA (marginal) | See Issue #1 |
| `#2563EB` (accent) on `#FFFFFF` | **~4.9:1** | ✅ AA | Barely passes |
| White `#FFFFFF` on `#F97316` (CTA button) | **~2.68:1** | ❌ FAIL | See Issue #2 |
| `#1E293B` on `#F97316` (CTA button) | **~5.2:1** | ✅ AA | Dark text on orange ✅ |
| `#94A3B8` (sidebar text) on `#1E293B` (sidebar bg) | **~5.7:1** | ✅ AA | Sidebar readable |
| `#FFFFFF` (sidebar active) on `#1E293B` (sidebar bg) | **~14.0:1** | ✅ AAA | Excellent |

## 5. CSS Variable Names (themes.css block)

```css
[data-theme="corporate"] {
  --color-corthex-bg: #F8FAFC;
  --color-corthex-surface: #FFFFFF;
  --color-corthex-elevated: #F1F5F9;
  --color-corthex-border: #E2E8F0;
  --color-corthex-border-strong: #CBD5E1;
  --color-corthex-accent: #2563EB;
  --color-corthex-accent-hover: #3B82F6;
  --color-corthex-accent-deep: #1D4ED8;
  --color-corthex-accent-muted: rgba(37, 99, 235, 0.10);
  --color-corthex-text-primary: #1E293B;
  --color-corthex-text-secondary: #64748B;
  --color-corthex-text-disabled: #CBD5E1;        /* ⚠️ needs review */
  --color-corthex-text-on-accent: #FFFFFF;        /* white on blue OK (4.9:1) */
  --color-corthex-sidebar-bg: #1E293B;
  --color-corthex-sidebar-border: #334155;
  --color-corthex-sidebar-text: #94A3B8;
  --color-corthex-sidebar-text-active: #FFFFFF;
  --color-corthex-sidebar-hover: rgba(255, 255, 255, 0.08);
  --color-corthex-sidebar-active: rgba(37, 99, 235, 0.20);
  --color-corthex-success: #22C55E;
  --color-corthex-warning: #EAB308;
  --color-corthex-error: #EF4444;
  --color-corthex-info: #3B82F6;
  --color-corthex-handoff: #F97316;              /* ⚠️ same as CTA — confusing */
  --color-corthex-nexus-bg: #F1F5F9;
  color-scheme: light;
}
```

## 6. Potential Issues

**Issue #1 — Blue accent 4.6:1 is fragile — not robust AA**
- `#2563EB` on `#F8FAFC` = **4.6:1** — passes AA by the thinnest margin (threshold is 4.5:1)
- Font rendering differences (macOS vs Windows sub-pixel), anti-aliasing, and screen calibration can make this visually fail at 4.5:1
- Recommendation: use `--color-corthex-accent-deep: #1D4ED8` as the primary text accent instead (better contrast buffer)
- `#1D4ED8` on `#F8FAFC` = **~5.8:1** ✅ — more robust

**Issue #2 — CRITICAL: White text on orange CTA button fails WCAG**
- `color: white` on `background: #F97316` = **~2.68:1** — FAILS AA
- MASTER.md button CSS specifies `color: white` — this is wrong
- Fix: `--color-corthex-text-on-cta: #1E293B` (dark slate on orange) = **~5.2:1** ✅
- Note: `--color-corthex-text-on-accent` is for blue buttons (white, 4.9:1 ✅) — need a separate `--color-corthex-text-on-cta` variable for the orange button specifically

**Issue #3 — Disabled text #CBD5E1 is invisible on bg**
- `#CBD5E1` on `#F8FAFC` = **~1.8:1** — effectively invisible
- WCAG exempts disabled states, but this is TOO light — users won't know if an element is disabled or just not rendered
- Recommendation: use `#94A3B8` for disabled text (~4.5:1 on bg) — still visually "muted" but detectable

**Issue #4 — Handoff color conflicts with CTA**
- `--color-corthex-handoff: #F97316` is the same orange as the CTA/Accent button color
- When a "Handoff" status badge (orange) appears near an orange CTA button, users cannot distinguish "action" from "status"
- All other themes use `#A78BFA` (purple) for handoff — corporate breaks the cross-theme consistency
- Recommendation: restore `#A78BFA` for handoff across all themes, keep `#F97316` for CTA only

**Issue #5 — Sidebar active state uses opacity, not solid color**
- `--color-corthex-sidebar-active: rgba(37,99,235,0.20)` — a semi-transparent blue on `#1E293B`
- On dark sidebar bg this renders as a very subtle blue tint — may not be obvious enough for active state
- Command theme uses `rgba(202,138,4,0.15)` (gold) — marginally more visible due to hue contrast
- Both themes should consider a 2px left-border accent as the primary active indicator (industry standard in Linear, Plane, Notion)

---

---

# CROSS-THEME COMPARISON

## Color Coherence Check

| Token | Command | Studio | Corporate | Consistent? |
|-------|---------|--------|-----------|-------------|
| Success | `#22C55E` | `#22C55E` | `#22C55E` | ✅ Yes |
| Warning | `#EAB308` | `#EAB308` | `#EAB308` | ✅ Yes |
| Error | `#EF4444` | `#EF4444` | `#EF4444` | ✅ Yes |
| Info | `#3B82F6` | `#3B82F6` | `#3B82F6` | ✅ Yes |
| Handoff | `#A78BFA` | `#A78BFA` | `#F97316` | ❌ Corporate breaks this |
| Shadow tokens | Shared `--shadow-*` | Shared | Shared | ✅ Yes |
| Spacing tokens | Shared `--space-*` | Shared | Shared | ✅ Yes |

## Sidebar Strategy

| Theme | Sidebar BG | Mode | Verdict |
|-------|-----------|------|---------|
| Command | `#0C0A09` | Dark on dark | ✅ Unified dark experience |
| Studio | `#0E7490` | Dark on light | Mixed — contrasts main content (Notion-style) |
| Corporate | `#1E293B` | Dark on light | Mixed — contrasts main content (Linear/Vercel-style) |

Studio and Corporate both use a dark sidebar on a light main area — this is a valid pattern (see Vercel dashboard, Stripe dashboard). However, the specific sidebar text contrast issues must be fixed before implementation.

## Typography Strategy

| Theme | Personality | Match to Style? |
|-------|------------|-----------------|
| Command | DM Sans — precise, modern | ✅ Premium dark power-user |
| Studio | Outfit + Work Sans — geometric, friendly | ✅ Collaborative SaaS tool |
| Corporate | Lexend + Source Sans 3 — accessible, professional | ✅ Enterprise/B2B trust signal |

Typography choices are internally consistent and well-matched to their respective aesthetic directions.

---

## Summary of All Issues (Prioritized)

| # | Theme | Severity | Issue |
|---|-------|----------|-------|
| C1 | Command | 🔴 CRITICAL | White on `#CA8A04` button = 2.77:1 (FAIL) — must use dark text `#0C0A09` |
| S1 | Studio | 🔴 CRITICAL | Cyan `#0891B2` accent = 3.4:1 on bg (FAIL) — unusable for normal-size text |
| S4 | Studio | 🔴 CRITICAL | White on `#22C55E` CTA = 2.18:1 (FAIL) — must use `#164E63` text |
| O2 | Corporate | 🔴 CRITICAL | White on `#F97316` CTA = 2.68:1 (FAIL) — must use `#1E293B` text |
| S2 | Studio | 🟠 HIGH | Sidebar inactive text `#A5F3FC` on `#0E7490` = 3.0:1 (FAIL) |
| O4 | Corporate | 🟠 HIGH | Handoff `#F97316` = same as CTA orange — semantic collision |
| C2 | Command | 🟡 MEDIUM | "Cyberpunk" keywords mislead — actual aesthetic is "Premium Dark" |
| O1 | Corporate | 🟡 MEDIUM | Blue accent 4.6:1 is fragile — recommend switching to `#1D4ED8` |
| S3 | Studio | 🟡 MEDIUM | Disabled text `#67E8F9` too light — effectively invisible |
| O3 | Corporate | 🟡 MEDIUM | Disabled text `#CBD5E1` nearly invisible — use `#94A3B8` instead |
| C4 | Command | 🟡 MEDIUM | DM Sans vs Satoshi/General Sans — font source decision needed |
| O5 | Corporate | 🟢 LOW | Active sidebar state (rgba opacity) may be insufficiently visible |
| S5 | Studio | 🟢 LOW | Two accent hues (cyan + green CTA) compete — designation needed |
| C3 | Command | 🟢 LOW | Pre-delivery checklist copy error ("Light mode" in dark theme) |

---

*Writer presentation complete. Submitted for 3-Critic Party Mode review.*
*All data sourced from: command/MASTER.md, studio/MASTER.md, corporate/MASTER.md, design-tokens.md, phase-1-research/benchmark-analysis.md*
