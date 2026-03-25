# CRITIC-B: Visual Consistency Review — Mobile DESIGN.md

**Reviewer**: CRITIC-B (Visual Consistency)
**Date**: 2026-03-25
**Subject**: `_uxui_redesign/phase-2-design-system/mobile/DESIGN.md`
**Compared Against**: `packages/app/src/styles/themes.css`, `packages/app/src/index.css`, `_uxui_redesign/phase-1-mobile/benchmark-analysis.md`, `design-system/corthex-mobile-command/MASTER.md`

---

## SCORE: 7/10

**Summary**: The Command theme color mapping is a perfect 1:1 hex match with the desktop token system — zero divergence across 17 tokens. Component patterns are mobile-native and benchmark-validated. However, three meaningful gaps prevent a higher score: (1) Studio and Corporate themes are completely undefined for mobile, (2) a self-contradicting 10px minimum font-size rule, and (3) missing functional tokens (focus-ring, muted semantics, handoff) that will be needed during implementation.

---

## 1. Color Token Alignment

### Result: ✅ PASS — 100% exact match (Command theme)

Verified every hex value token-by-token against `themes.css [data-theme="command"]`:

| Token | DESIGN.md | themes.css | Match |
|-------|-----------|------------|-------|
| `bg` | `#0C0A09` | `#0C0A09` | ✓ |
| `surface` | `#1C1917` | `#1C1917` | ✓ |
| `elevated` | `#292524` | `#292524` | ✓ |
| `border` | `#44403C` | `#44403C` | ✓ |
| `border-strong` | `#57534E` | `#57534E` | ✓ |
| `accent` | `#CA8A04` | `#CA8A04` | ✓ |
| `accent-hover` | `#D97706` | `#D97706` | ✓ |
| `accent-deep` | `#A16207` | `#A16207` | ✓ |
| `accent-muted` | `#CA8A0419` | `#CA8A0419` | ✓ |
| `text-primary` | `#FAFAF9` | `#FAFAF9` | ✓ |
| `text-secondary` | `#A8A29E` | `#A8A29E` | ✓ |
| `text-disabled` | `#57534E` | `#57534E` | ✓ |
| `text-on-accent` | `#0C0A09` | `#0C0A09` | ✓ |
| `success` | `#22C55E` | `#22C55E` | ✓ |
| `warning` | `#EAB308` | `#EAB308` | ✓ |
| `error` | `#EF4444` | `#EF4444` | ✓ |
| `info` | `#3B82F6` | `#3B82F6` | ✓ |

**17/17 tokens verified. Zero divergence on Command theme.**

### Tokens present in desktop but absent from mobile DESIGN.md:

| Desktop Token | Hex | Concern Level | Rationale |
|---------------|-----|---------------|-----------|
| `focus-ring` | `#CA8A04` | 🔴 **CRITICAL** | Accessibility requirement for keyboard/assistive navigation on mobile forms |
| `btn-bg` | `#CA8A04` | 🟡 Medium | Implicitly covered by `accent` but not explicitly mapped |
| `success-muted` | `#22C55E19` | 🟡 Medium | Needed for subtle status backgrounds in list items and badges |
| `warning-muted` | `#EAB30819` | 🟡 Medium | Badge/notification backgrounds |
| `error-muted` | `#EF444419` | 🟡 Medium | Error state card backgrounds |
| `info-muted` | `#3B82F619` | 🟡 Medium | Info badge backgrounds |
| `handoff` | `#A78BFA` | 🟡 Medium | Handoff is a core product feature (agent delegation) |
| `nexus-bg` | `#0A0908` | ⚪ Low | NEXUS canvas unlikely on mobile |
| `sidebar-*` (7 tokens) | various | ⚪ N/A | Mobile uses bottom nav, no sidebar |

**Verdict**: Core colors are perfectly aligned. But 6 functionally important tokens (`focus-ring`, 4 `*-muted` variants, `handoff`) are missing and will be needed during implementation.

### 🔴 CRITICAL GAP — Studio and Corporate themes undefined for mobile:

The DESIGN.md is titled "Command Theme (Dark)" and covers only that theme. Desktop supports three:
- **Command** (dark, near-black + gold) → ✅ covered
- **Studio** (light, bg `#F9FAFB`, accent cyan `#0891B2`) → ❌ no mobile spec
- **Corporate** (light, bg `#F8FAFC`, accent blue `#2563EB`) → ❌ no mobile spec

When a user switches to Studio or Corporate on mobile, nothing in DESIGN.md tells Stitch 2 (or a developer) what that theme looks like. Light themes have fundamentally different surface hierarchies — `#F9FAFB` base + `#FFFFFF` cards vs. the dark treatment.

### Token Naming Mismatch

Mobile DESIGN.md uses simplified token names (`bg`, `surface`, `accent`) while the desktop system uses prefixed CSS variables (`--color-corthex-bg`, `--color-corthex-surface`). The DESIGN.md should explicitly map to CSS variable names to prevent implementation confusion.

### ⚠️ MASTER.md Conflict Warning

The Stitch-generated `design-system/corthex-mobile-command/MASTER.md` introduces a conflicting variable naming scheme (`--color-primary`, `--color-secondary`, `--color-cta`) AND different fonts (Satoshi/General Sans vs DM Sans). This MASTER.md must NOT be used for implementation — it conflicts with both the hand-crafted DESIGN.md and the desktop theme system. **Recommend: delete or mark deprecated.**

---

## 2. 60-30-10 Rule on Mobile

### Result: ✅ PASS — Distribution is well-designed

| Role | Target | Mobile Token | Surfaces |
|------|--------|-------------|----------|
| **60% Dominant** | Background | `bg` (#0C0A09) | Full-screen background, status bar area |
| **30% Secondary** | Content surfaces | `surface` (#1C1917) | Cards, bottom nav, top nav, bottom sheets |
| **10% Accent** | Action/focus | `accent` (#CA8A04) | FAB, active tab, CTA buttons, toggles |

**Assessment**: The 60-30-10 distribution is well-designed for mobile. `bg` as dominant canvas, `surface` for interactive chrome, `accent` confined to high-intent touchpoints.

**Minor concern**: On smaller mobile screens (320-375px), top nav (48px) + bottom nav (56px) = 104px of `surface` chrome. Combined with card surfaces, `surface` may approach 40-45% on list-heavy screens, compressing `bg` to ~45%. The 12px card gap provides crucial visual breathing room — **do not reduce below 12px**.

**FAB/tab competition**: When the FAB is visible alongside an active gold bottom tab label, there are two distinct gold focal points on a 390px screen. Consider hiding FAB on pages with a full-width primary button visible.

---

## 3. Typography Hierarchy on Mobile

### Result: ⚠️ PARTIAL — Good hierarchy, internal contradiction on minimum size

**Desktop vs. Mobile Scale Comparison**:

| Desktop Token | Desktop Size | Mobile Equivalent | Mobile Size | Ratio |
|--------------|-------------|-------------------|-------------|-------|
| `text-4xl` | 36px | (no equivalent) | — | — |
| `text-3xl` | 30px | (no equivalent) | — | — |
| `text-2xl` | 24px | `page-title` | 24px | 1:1 |
| `text-xl` | 20px | (no equivalent) | — | — |
| `text-lg` | 18px | `section` | 18px | 1:1 |
| `text-base` | 16px | `card-title` | 16px | 1:1 |
| `text-sm` | 14px | `body` | 14px | 1:1 |
| `text-xs` | 12px | `caption` | 12px | 1:1 |
| (none) | — | `overline` | 10px | — |

**Findings:**

1. ✅ **Good**: Mobile page-title at 24px (vs desktop 36px) — correct 33% reduction, proportional and appropriate for 320-375px viewports.

2. ✅ **Good**: The 5 core sizes (24/18/16/14/12) map perfectly to desktop `text-2xl` through `text-xs`. Components shared between desktop and mobile use identical base sizes.

3. 🔴 **CRITICAL: 10px overline contradicts the document's own rule.** Section 3 states: "NO text smaller than 12px on mobile." But `overline` is defined as 10px AND bottom nav labels are defined as 10px (Section 4). This is a self-contradiction at two points in the spec.

   Android at 1.5× DPI renders 10px CSS → 15px physical pixels, which can be barely legible for secondary text. Options:
   - (a) Raise overline/tab labels to 12px with tighter tracking
   - (b) Change the rule to "NO body/content text smaller than 12px" with explicit exception for decorative labels
   - (c) Compromise at 11px

4. ✅ **Good**: Font family alignment — DM Sans matches desktop Command theme (`--font-heading` and `--font-body` both use DM Sans). JetBrains Mono for numbers matches desktop `--font-mono`.

5. 🟡 **Minor**: Korean fallback chain is `Pretendard, Apple SD Gothic Neo` in mobile but desktop's `--font-ui` includes `Malgun Gothic` as third fallback. Missing `Malgun Gothic` affects Windows mobile browsers (rare but exists).

6. 🟡 **Minor**: Desktop `--font-mono` has `Fira Code` fallback. Mobile only mentions JetBrains Mono — missing fallback for devices without it installed.

7. ⚠️ **Font stack mismatch on theme switch**: DESIGN.md says "All text: DM Sans (single family)" for mobile. But Studio desktop uses `Outfit + Work Sans`, Corporate uses `Lexend + Source Sans 3`. If `data-theme` switch applies font-stack changes (as it does on desktop via CSS variables), mobile will switch fonts too — contradicting the "single DM Sans" rule. If mobile overrides font vars to always be DM Sans, this must be explicitly specified.

**Line height ratios** are well-calibrated:
- 24/32 = 1.33, 18/24 = 1.33, 16/22 = 1.375, 14/20 = 1.43, 12/16 = 1.33 — all within the 1.3-1.5 optimal range ✓

---

## 4. Spacing Rhythm

### Result: ✅ MOSTLY PASS — Aligned with benchmark, minor gaps

| Token | Mobile DESIGN.md | Benchmark Analysis | Match |
|-------|-----------------|-------------------|-------|
| Page padding (horiz) | 16px | 16px | ✅ Exact |
| Card gap | 12px | 12px | ✅ Exact |
| Section gap | 24px (implied, not explicit) | 24px | 🟡 Not explicitly stated |
| Bottom nav height | 56px + safe-area | 56px + safe-area (also 64px at line 88 — internal inconsistency in benchmark) | ✅ Correct value chosen |
| Card padding | 16px | — | ✅ Consistent with page padding |
| Top nav height | 48px | — | ✅ |

**Spacing rhythm follows a clean 4px base grid**: 4 → 8 → 12 → 16 → 24 → 32 → 48 → 56. All specified values land on this grid.

**Missing vertical spacing definitions**:
- Gap between top nav and first content item (likely 16px but unspecified)
- Gap between last content item and bottom nav (likely 16px but unspecified)
- Form field vertical gap (likely 16px but unspecified)
- Horizontal carousel peek distance (benchmark says ~20px; DESIGN.md's Pattern 1 is silent)

**MASTER.md alignment**: The Stitch MASTER.md defines `xs:4px, sm:8px, md:16px, lg:24px, xl:32px, 2xl:48px`. The 12px card gap doesn't map to a named token in this scale — should be added as `--space-card-gap`.

---

## 5. Component Visual Consistency

### Result: ✅ PASS — Components feel like the same product

**Cards**:
| Attribute | Desktop (themes.css) | Mobile DESIGN.md | Consistent |
|-----------|---------------------|-----------------|------------|
| Background | `surface` | `surface` | ✅ |
| Border | `border`, 1px | 1px solid `border` | ✅ |
| Border-radius | Not in theme tokens | 12px | 🟡 New spec |
| Padding | Not in theme tokens | 16px | 🟡 New spec |
| Shadow | `--shadow-sm: 0 0 0 1px #FFFFFF0D` | Not specified for cards | ✅ (dark theme uses border, not shadow) |

Recommend adding `--radius-card: 12px` to shared theme system for cross-platform consistency.

**Buttons**: Color tokens match perfectly (accent bg, text-on-accent). 48px height and 8px radius are appropriate mobile-specific adaptations. `scale(0.97)` active state is good mobile tap feedback.

**Inputs**: The `elevated` → `border` → `border-strong` progression for input states matches the desktop token hierarchy perfectly. 16px font (iOS zoom prevention) is critical and correctly specified.

**Bottom Sheet vs Modal**: Correct platform adaptation. 16px top border-radius, `black/50` backdrop, 90vh max-height are all standard.

**Tables → Cards**: The explicit transformation rule (Section 5) is excellent. Doesn't show how multi-action rows (3-4 buttons) collapse on mobile — only 2-button example given.

**FAB shadow concern**: Desktop Command theme explicitly avoids drop-shadows (Fix 7 in themes.css: `--shadow-sm: 0 0 0 1px #FFFFFF0D`). The FAB uses `0 4px 12px rgba(0,0,0,0.4)` — a drop shadow. This is justified because FABs are z-elevation-critical floating elements where border-highlight alone wouldn't communicate depth. Acceptable exception.

---

## 6. Theme Switching

### Result: ⚠️ PARTIAL — This is the largest gap

**Desktop mechanism**: `[data-theme="command|studio|corporate"]` CSS custom properties in `themes.css`. All components reference `--color-corthex-*` variables. Theme switching is instant.

**What mobile DESIGN.md provides**: Only Command theme hex values.

**What is NOT addressed**:

1. 🔴 **No Studio or Corporate mobile specs** — light themes have fundamentally different surface hierarchies (`#F9FAFB` base + `#FFFFFF` cards). Dark-mode patterns (dark cards on dark bg, light text) will invert entirely.

2. 🔴 **No `[data-theme]` mechanism reference** — the document uses simplified token names (`bg`, `accent`) instead of CSS variable names (`--color-corthex-bg`). Implementers must guess the mapping.

3. 🟡 **Studio sidebar → mobile bottom nav translation unclear** — Studio desktop sidebar uses dark teal `#0E7490`. What color is the Studio mobile bottom nav? Light (`#FFFFFF`) or dark teal?

4. 🟡 **`color-scheme` meta tag** — Studio and Corporate have `color-scheme: light`. This changes iOS status bar, keyboard appearance, scroll indicators. DESIGN.md doesn't address this.

5. 🟡 **Font stack conflict on theme switch** — as noted in Typography section, mobile says "DM Sans only" but theme switching on desktop changes font families. If mobile always forces DM Sans, this needs explicit CSS override rules.

**This is the single largest visual consistency gap.** Without multi-theme mobile specs, implementers will either build Command-only (breaking theme switching) or guess at adaptations (visual inconsistency risk).

---

## 7. Icon Consistency

### Result: ⚠️ PARTIAL — Library not named, list sizes missing

| Aspect | Desktop (CLAUDE.md) | Mobile DESIGN.md | Consistent |
|--------|---------------------|-----------------|------------|
| Icon library | Lucide React | **Not explicitly stated** | 🔴 GAP |
| Nav icon size | Various | 24px (bottom nav) | ✅ Standard |
| FAB icon size | N/A | 24px (white on accent) | ✅ |
| Active/inactive pattern | Color/opacity change | Filled + accent / Outline + secondary | ✅ Good |

**Missing**:
- Lucide React not named in DESIGN.md (which is "source of truth for Stitch 2"). Stitch might generate Material Icons by default.
- List item icon size not specified (benchmark recommends 20px vs 24px for nav — two distinct sizes needed).
- Emoji placeholders (🏠 📊 💬 👤 ⚙) in bottom nav diagram should be annotated with "replace with Lucide React icons."

---

## Top 3 Improvements Required

### #1 — 🔴 Add Studio + Corporate Mobile Theme Specs (Priority: BLOCKER)

The mobile DESIGN.md must cover all 3 desktop themes or explicitly declare "Command-only for mobile v1" with a migration plan. Without this, mobile breaks the theme switching feature that desktop already supports.

**Required actions**:
- Add sections for Studio and Corporate mobile adaptations
- Specify bottom nav appearance for light themes
- Address `color-scheme` meta tag behavior
- Clarify font stack behavior on theme switch (always DM Sans? or follow desktop?)
- Map simplified token names → `--color-corthex-*` CSS variable names

### #2 — 🔴 Resolve 10px Font Contradiction + Add Missing Tokens (Priority: HIGH)

The document states "NO text smaller than 12px on mobile" then defines overline (10px) and bottom tab labels (10px) below that minimum. Pick one:
- (a) Raise overline/tab labels to 12px with tighter tracking for visual equivalence
- (b) Add explicit exception clause for decorative labels at 10px

Also add missing tokens:
- `--color-corthex-focus-ring` (accessibility requirement)
- `--color-corthex-*-muted` (4 semantic muted variants)
- `--color-corthex-handoff` (core product feature color)

### #3 — 🟡 Complete Missing Spacing + Icon Specs (Priority: MEDIUM)

Add these omitted values:
- **Section gap**: 24px (confirmed by benchmark but only implicit in DESIGN.md)
- **Horizontal carousel peek**: ~20px next card preview distance
- **List item icon size**: 20px (vs 24px nav icons — two distinct sizes)
- **Lucide React**: explicit call-out in Generation Rules section (Section 9)
- **Vertical gaps**: top-nav-to-content, content-to-bottom-nav, form-field spacing

---

## Detailed Score Breakdown

| Dimension | Score | Status |
|-----------|-------|--------|
| Color Token Alignment (Command) | 10/10 | ✅ Perfect hex match |
| 60-30-10 Rule | 8.5/10 | ✅ Sound distribution |
| Typography Hierarchy | 6/10 | ⚠️ Self-contradiction |
| Spacing Rhythm | 7.5/10 | ⚠️ Minor gaps |
| Component Visual Consistency | 9/10 | ✅ Coherent |
| Theme Switching | 3/10 | 🔴 Only 1/3 themes covered |
| Icon Consistency | 6/10 | ⚠️ Library unnamed |
| **Weighted Average** | **7/10** | |

**The foundation is solid.** Command theme tokens are perfectly aligned. Component patterns are mobile-native and benchmark-validated. The gaps are real but fixable in one focused revision pass. The theme switching gap is the most architecturally significant — it's not just cosmetic, it affects whether the multi-theme feature works on mobile at all.
