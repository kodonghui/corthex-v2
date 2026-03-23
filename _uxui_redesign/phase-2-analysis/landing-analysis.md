# Landing Page Layout — Deep Analysis & Design Principles Scoring

**Phase:** 2-Analysis, Step 2-3
**Date:** 2026-03-23
**Author:** UXUI Writer (Phase 2 Deep Analysis)
**Input:** Phase 1 Landing Page Research (3 options), Vision & Identity, Technical Spec, Design Principles Skill
**Scoring Framework:** Design Principles Checklist + Gestalt Psychology + UX Heuristics + Conversion Best Practices
**Target:** CORTHEX v3 Marketing Landing Page — `packages/landing/` (Vite SSG)

---

## 0. Scoring Methodology

Same 6-category framework as Steps 2-1 and 2-2: **60 total points** (6 categories × 10 each), plus descriptive Framework Implementation Spec.

| # | Category | Max | Landing-Specific Evaluation Focus |
|---|----------|-----|----------------------------------|
| 1 | Gestalt Compliance | /10 | Section grouping, CTA clustering, figure/ground for hero/features |
| 2 | Visual Hierarchy | /10 | Above-the-fold clarity, F-pattern/Z-pattern reading, CTA prominence |
| 3 | Golden Ratio & Proportion | /10 | Hero text:visual ratio, section height rhythm, type scale drama |
| 4 | Contrast | /10 | Section alternation (cream↔surface↔olive), CTA visibility, text contrast |
| 5 | White Space + Unity | /10 | Section breathing room, app↔landing brand consistency, token reuse |
| 6 | UX Deep Dive | /10 | Conversion flow, scroll depth analysis, above-fold compliance, mobile CTA reach |

---

## 1. Option A: "Vercel Clean" — Center Hero + Gradient + Minimal Sections

**Inspiration:** Vercel, Clerk, Resend
**Philosophy:** Maximum clarity. Clean hero, minimal sections, fast to scan. Developer-friendly aesthetic adapted to Natural Organic palette.

### 1.1 Gestalt Compliance — Score: 6/10

#### Proximity
Option A has 6 sections: Header → Hero → Stats → Features → CTA → Footer. Sections are separated by background color alternation (cream → cream → surface → cream(olive CTA) → surface). The color changes serve as the primary proximity separator.

**Issue — Stats section proximity:** The stats section (4 metric cards in a row) sits between the hero and features. Its purpose is social proof, but its spatial position implies it's part of the hero (no background change between hero and stats — both cream). The CEO's eye reads hero and stats as one continuous section rather than two distinct elements.

**Fix:** Add `border-y` (top and bottom borders with `--border-primary`) to the stats section, or change its background to `--bg-surface` to create explicit proximity separation from the hero.

#### Similarity
Feature cards (6 cards in a 3×2 grid) share identical styling: icon + title + description within `bg-surface` cards with `border-primary` and `radius-lg`. This is correct similarity — same content type = same visual treatment.

**Issue:** The feature cards use icon + title + short description, which is identical to the sidebar nav items in the CEO app (icon + label). This creates an unintentional similarity between marketing feature cards and app navigation items. The landing page should use a more aspirational card treatment (larger icons, more descriptive text, perhaps screenshots) to differentiate from the functional app aesthetic.

#### Continuity
The center-aligned layout creates a strong vertical axis. All elements (badge, headline, subtitle, CTAs, screenshot, stats, features, CTA) align to the center, creating a smooth top-to-bottom reading flow.

**Strength:** The single-column center alignment is the simplest continuity pattern. The eye follows a straight vertical line from headline to CTA. No horizontal scanning required for the core message.

**Weakness:** The uniform center alignment creates monotony. After 3 scrolls, every section looks the same — center-aligned heading + centered content. There's no visual "turn" to refresh the reader's attention.

#### Closure
Each feature card uses `border` + `radius-lg` for explicit closure. The CTA section uses olive dark background (#283618) as a full-width color block — the strongest closure signal on the page. The footer uses `border-top` for closure from the CTA.

#### Figure/Ground
The cream background (#faf8f5) is the ground for the entire page. Feature cards on surface (#f5f0e8) and the hero screenshot with `shadow-lg` are the primary figures. The olive CTA section is a dramatic figure/ground inversion — dark on light — that creates a strong visual "stop point."

**Issue:** The cream (#faf8f5) to surface (#f5f0e8) difference is subtle (~3% luminance shift). On bright screens or in sunlight, the feature section's surface background is nearly indistinguishable from the hero's cream background. The section transition feels like a gradient fade rather than a distinct zone change.

---

### 1.2 Visual Hierarchy — Score: 6/10

#### Above-the-Fold Test
At 1440×900 viewport (standard laptop), the above-the-fold area contains:
- Header (64px)
- Hero badge ("CORTHEX v3 출시")
- Hero headline (40px/700)
- Hero subtitle (18px/400)
- Two CTA buttons
- Top edge of the product screenshot

**Verdict:** Headline + value prop + CTA are visible without scrolling — PASS. The product screenshot is partially visible (teaser effect), encouraging scroll. This follows the Vercel pattern precisely.

**Issue — Badge vs headline competition:** The pill badge ("● v3 출시") at the top of the hero section uses sage border + small text. It's small enough to not compete with the headline, but its position (directly above the headline) creates a reading sequence: badge → headline → subtitle. The badge adds a pre-headline step that slightly delays the CEO from reaching the core message.

#### Z-Pattern / F-Pattern
The center-aligned layout doesn't follow the traditional F-pattern (left-heavy scanning) or Z-pattern (diagonal scanning). Instead, it uses a "I-pattern" — straight down the center axis. This works for short, focused pages but fails for longer pages where the eye needs visual anchors at different horizontal positions.

**Issue:** The 3×2 feature grid below the fold creates a brief left-to-right scanning pattern, but returns to center alignment for the CTA and footer. The alternation between center (hero, CTA) and grid (features, stats) creates an inconsistent scanning pattern.

#### CTA Hierarchy
- Primary CTA: "무료로 시작하기" — sage (#606C38) background, cream text. Prominent.
- Secondary CTA: "자세히 알아보기" — ghost style (border only). Correctly subordinate.
- Final CTA: "무료 평가판 시작하기" — cream text on olive dark background. Inverted from hero CTA.

The CTA hierarchy is clear: primary is visually heavier (filled), secondary is lighter (ghost), final is contextually isolated (dark section). This is correct hierarchy.

---

### 1.3 Golden Ratio & Proportion — Score: 6/10

#### Hero Text:Visual Ratio
On desktop (1440px), the hero is center-aligned with text above and screenshot below. The text block (badge + headline + subtitle + CTAs) occupies approximately 40% of the hero height, and the screenshot occupies 60%. This is close to the golden ratio (38.2:61.8) — a natural, pleasing split.

On mobile (375px), the hero becomes fully stacked: text → buttons → screenshot. The text block occupies approximately 50% and the screenshot 50% — a 1:1 ratio that's less dynamic than the desktop's golden split.

#### Section Height Rhythm
| Section | Desktop Height | Proportion |
|---------|---------------|-----------|
| Header | 64px (fixed) | Constant |
| Hero | ~70vh (~630px) | 4.2× |
| Stats | ~150px | 1× |
| Features | ~600px | 4× |
| CTA | ~300px | 2× |
| Footer | ~200px | 1.3× |

The rhythm is: constant → large → small → large → medium → small. The large-small-large pattern creates a visual heartbeat, but the stats section (150px) feels squeezed between two large sections.

**Issue:** The features section (6 cards in 3×2 grid) has a fixed height regardless of content depth. This means shorter feature descriptions create excessive whitespace within cards, while longer descriptions (common with Korean text) may cause uneven card heights.

#### Type Scale Drama
- Hero headline: 40px (--text-4xl)
- Section headings: 24px (--text-2xl)
- Feature card titles: 18px (--text-lg)
- Body text: 14px (--text-sm) / 16px (--text-base)
- Stats values: 40px JetBrains Mono (dramatic)

The 40px→24px→18px→14px progression follows the Major Third scale. However, the jump from 40px hero to 24px section headings (1.667:1) is exactly the golden ratio — good. The 24px→18px step (1.333:1) is a Perfect Fourth — also harmonious.

**Landing-specific concern:** The 40px max headline is appropriate for the CEO app but may feel modest for a marketing landing page. Vercel uses 48-56px, Stripe uses 56-72px, Linear uses 48px. At 40px, CORTHEX's headline is at the low end of SaaS landing page scale. On a 1440px viewport, 40px text can feel small.

**Prescription:** Consider 48px for the hero headline (--text-4xl override for landing only) to match industry expectations. Keep 40px as the maximum for the CEO app.

---

### 1.4 Contrast — Score: 7/10

#### Section Background Alternation
| Section | Background | Contrast from Previous |
|---------|-----------|----------------------|
| Header | cream (transparent blur) | N/A |
| Hero | cream #faf8f5 | None (same as header) |
| Stats | cream #faf8f5 | None (same as hero) |
| Features | surface #f5f0e8 | Minimal (3% shift) |
| CTA | olive dark #283618 | **Dramatic** (light → dark) |
| Footer | surface #f5f0e8 | Moderate (dark → light) |

The cream→cream→cream→surface sequence is monotonous. Three consecutive cream sections blur together. The olive CTA section is the only truly contrasting element — it creates a dramatic dark block that interrupts the light monotony.

**Strength:** The olive CTA section's high contrast ensures it captures attention even if the visitor scrolls quickly. This is correct — the conversion section should be the most visually distinct.

**Weakness:** The cream→surface transition (hero→features) is too subtle. Visitors may not perceive a section change.

#### CTA Button Contrast
- Hero primary CTA: sage (#606C38) on cream (#faf8f5) = **4.14:1** — WCAG AA for UI components, but below AA for text (needs 4.5:1). The white/cream text on sage: **4.53:1** — WCAG AA pass.
- Hero ghost CTA: `--text-primary` (#1a1a1a) + sand border on cream = text contrast 16.5:1 (excellent), but border contrast 1.15:1 (nearly invisible).
- Final CTA: cream (#faf8f5) on olive (#283618) = **12.64:1** — excellent.

**Issue — Ghost CTA border visibility:** The ghost button's sand border (#e5e1d3) on cream (#faf8f5) is barely visible. The button appears to be floating text without a clear boundary. Fix: darken border to `--accent-secondary` (#5a7247) or use a subtle `shadow-sm` instead of a border.

#### Text on Background Contrast
All text contrast ratios are inherited from the Vision & Identity document and pass WCAG AA. The sage accent text (#606C38) on cream (#faf8f5) = 4.14:1 — marginally below the 4.5:1 threshold for normal text but acceptable for large text (18px+ or 14px bold).

---

### 1.5 White Space + Unity — Score: 7/10

#### White Space
The hero section uses `min-height: 70vh` with generous padding (80px top, 64px bottom) — ample breathing room. The hero headline at `max-width: 720px` prevents text from stretching too wide on large screens.

**Section spacing:** All sections use `py-24` (96px) which creates consistent breathing room between sections. This consistency is a double-edged sword — it creates rhythm but also monotony. The hero (70vh) → stats (150px) → features (96px padding + content) creates an irregular pulse that works on first read but feels predictable on return visits.

**Feature card whitespace:** 3×2 grid with 24px gaps. Cards have internal padding of 24px (consistent with app content padding). The gap:padding ratio is 1:1 — adequate but not generous. A 1:1.5 ratio (36px gaps) would create more visual breathing room between cards.

#### Unity — Landing ↔ App
The landing page uses the same design tokens (colors, typography, spacing, border-radius) as the CEO app:
- Same cream (#faf8f5) background
- Same olive sidebar color (#283618) for CTA section
- Same sage accent (#606C38) for CTAs and highlights
- Same Inter font for UI, JetBrains Mono for data
- Same 8px grid, same border-radius values

**Assessment:** Token-level unity is excellent. The landing page is unmistakably the same brand as the CEO app. A visitor who signs up from the landing page and enters the CEO app will see consistent colors, typography, and spatial rhythm.

**Landing-specific divergence (correct):** The landing page uses larger typography (40px headline), more generous spacing (96px section padding), and scroll-reveal animations — all absent from the functional CEO app. This follows Vision §14.1: landing is aspirational, app is functional.

---

### 1.6 UX Deep Dive — Score: 5/10

#### Conversion Flow
The conversion path is: headline → value prop → CTA → scroll → proof → features → CTA.

**Above-fold conversion:** Primary CTA is visible above the fold — good. However, the CTA button text "무료로 시작하기" (Start for free) is generic. It doesn't communicate what happens next (sign up? demo? guided tour?).

**Below-fold conversion:** Only one CTA section (olive dark) at the bottom. Between the hero CTA and the final CTA, there are 3 sections (stats, features, CTA) with no intermediate conversion points. A visitor who scrolls past the hero CTA and reads features has no CTA until the bottom of the page — a conversion gap.

**Prescription:** Add a CTA button below the features section (before the olive CTA) or make the feature cards themselves clickable (linking to app demo pages).

#### Scroll Depth Analysis
| Section | Scroll Position (1440×900) | Drop-off Risk |
|---------|---------------------------|---------------|
| Hero | 0-70vh | Low — above fold, always seen |
| Stats | 70vh-80vh | Low — short section, auto-scroll |
| Features | 80vh-170vh | **Medium — requires intentional scrolling** |
| CTA | 170vh-200vh | **High — most visitors don't scroll this far** |
| Footer | 200vh+ | Very high — information only |

Industry data suggests ~50% of visitors scroll past the first fold, ~25% reach the midpoint, and ~10% reach the bottom CTA. This means Option A's bottom CTA reaches only ~10% of visitors.

**Fix:** The hero CTA captures 100% of visitors. The bottom CTA captures ~10%. There should be a third CTA at ~120vh (after features) to capture the 25% who scroll to the midpoint.

#### Mobile CTA Reach
On mobile (375px viewport), the hero section stacks: badge → headline (32px, 2-3 lines) → subtitle (16px, 3-4 lines) → 2 CTAs (full-width, stacked). The primary CTA appears at approximately 400px from the top — above the fold on most phones (667px viewport).

**Issue — CTA below keyboard zone:** On mobile, if the visitor taps a form field (email signup), the keyboard occupies ~50% of the viewport. The hero CTA must be above the keyboard zone to remain visible during form interaction. At 400px from top, the CTA is at ~60% of the 667px viewport — it may be pushed off-screen by the keyboard.

#### Page Speed / Performance
6 sections, minimal JavaScript (no tabs, no animations). Static SSG rendering.

- **Estimated LCP:** Hero headline text (render-blocking fonts: Inter from CDN)
- **Estimated CLS:** Product screenshot image (if no width/height set)
- **Estimated FID:** Minimal (no complex JS interactions)

Option A has the best performance of all three options due to minimal interactivity. This matters for SEO (Core Web Vitals) and mobile conversion (3G networks).

---

### 1.7 Framework Implementation Spec

#### Component Tree
```tsx
<LandingPage>
  <LandingHeader>
    <Logo icon={Waypoints} text="CORTHEX" />
    <HeaderNav links={navLinks} />                {/* hidden on mobile */}
    <HeaderCTA href="/signup">무료로 시작하기</HeaderCTA>
  </LandingHeader>

  <HeroSection>
    <HeroBadge>● CORTHEX v3 출시</HeroBadge>
    <HeroTitle>당신의 AI 조직을 지휘하세요</HeroTitle>
    <HeroSubtitle>AI 에이전트를 부서별로 배치하고, 실시간으로 모든 활동과 비용을 추적하세요.</HeroSubtitle>
    <HeroCTAs>
      <CTAButton variant="primary" href="/signup">무료로 시작하기</CTAButton>
      <CTAButton variant="ghost" href="#features">자세히 알아보기</CTAButton>
    </HeroCTAs>
    <ProductScreenshot src="/images/dashboard.webp" alt="CORTHEX Dashboard" />
  </HeroSection>

  <StatsSection>
    <StatCard value="23" label="관리 페이지" />
    <StatCard value="N-Tier" label="동적 계층" />
    <StatCard value="99.9%" label="가동률" />
    <StatCard value="∞" label="에이전트 수" />
  </StatsSection>

  <FeaturesSection id="features">
    <SectionTitle>강력한 기능으로 완벽한 통제</SectionTitle>
    <FeatureGrid>
      <FeatureCard icon={Home} title="AI 허브" description="중앙 명령 인터페이스" />
      {/* ... 5 more feature cards */}
    </FeatureGrid>
  </FeaturesSection>

  <CTASection>
    <CTATitle>지금 바로 AI 혁신을 시작하세요</CTATitle>
    <CTASubtitle>14일 무료 평가판, 신용카드 불필요</CTASubtitle>
    <CTAButton variant="inverted" href="/signup">무료 평가판 시작하기</CTAButton>
  </CTASection>

  <LandingFooter links={footerLinks} />
</LandingPage>
```

#### TypeScript Props
```typescript
interface StatCardProps {
  value: string;
  label: string;
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface CTAButtonProps {
  variant: 'primary' | 'ghost' | 'inverted';
  href: string;
  children: React.ReactNode;
}
```

### 1.8 Option A Summary

| Category | Score | Key Finding |
|----------|-------|-------------|
| Gestalt Compliance | 6/10 | Stats/hero no separation; cream→surface shift invisible; CTA closure strong |
| Visual Hierarchy | 6/10 | Above-fold CTA good; center-alignment monotony; badge competes with headline |
| Golden Ratio & Proportion | 6/10 | Hero split near golden; 40px headline undersized for landing; uneven card heights |
| Contrast | 7/10 | Olive CTA section dramatic; ghost CTA border invisible; section transitions weak |
| White Space + Unity | 7/10 | Token unity excellent; consistent spacing rhythm; feature card gaps tight |
| UX Deep Dive | 5/10 | Bottom CTA reaches ~10% of visitors; no mid-page conversion point; fast performance |
| **TOTAL** | **37/60** | **Clean and safe, but generic — no storytelling, weak conversion** |

---

## 2. Option B: "Stripe Narrative" — Story-Driven + Tab Features + Social Proof

**Inspiration:** Stripe, Notion, Linear
**Philosophy:** Tell a story. Each section builds on the previous, guiding the visitor: problem → solution → proof → action.

### 2.1 Gestalt Compliance — Score: 7/10

#### Proximity
Option B has 9 sections with clear visual separation:
1. Header → cream
2. Hero (split layout) → cream
3. Social Proof → surface with `border-y`
4. Problem→Solution → cream
5. Feature Tabs → surface
6. Metrics → cream
7. Testimonials → surface
8. CTA → olive dark
9. Footer → surface

The alternating cream↔surface↔cream pattern with explicit borders creates stronger proximity grouping than Option A's mostly-cream approach. Each section is visually distinct.

**Social proof bar** uses `border-y` (top and bottom borders) which creates explicit closure — it reads as a distinct "banner" element between the hero and content sections. This is the Stripe/Vercel pattern — a narrow trust-building strip.

#### Similarity
**Feature tabs:** Tab items share identical styling (14px/500, sage underline for active). Tab content panels share identical structure (text panel left + screenshot panel right). This is correct similarity within the tab system.

**Problem→Solution cards:** "BEFORE" and "AFTER" cards share the same shape (rounded-lg, border, internal list) but differ in color treatment — BEFORE uses sand/muted, AFTER uses cream/accent. This is *intentional dissimilarity* within a shared shape — correct application of similarity + contrast to convey "old bad vs new good."

**Issue — Testimonial cards vs feature cards:** If both use the same card treatment (border + radius-lg + surface background), they look like feature cards. Testimonials should use distinct treatment (quote marks, italic text, attribution format) to differentiate "what the product does" from "what users say."

#### Continuity
The story-driven structure creates narrative continuity: hero (introduction) → social proof (credibility) → problem→solution (pain/relief) → features (depth) → metrics (evidence) → testimonials (social validation) → CTA (action). Each section builds on the previous, creating a persuasive narrative arc.

**Split hero continuity:** On desktop, the split hero (text left, product right) creates a Z-pattern reading flow: text → visual → next section. This is the standard marketing Z-pattern — proven effective.

On mobile, the split hero becomes stacked (text → visual), reverting to I-pattern. The Z-pattern advantage is lost on mobile.

#### Closure
The social proof bar with `border-y` has the strongest closure of any element on the page. Feature tabs use a tab bar with `border-bottom` as a clear interface boundary. The Problem→Solution cards use explicit borders and rounded corners. Closure is well-handled throughout.

#### Figure/Ground
The alternating cream↔surface background creates a clear section-level figure/ground pattern. The surface sections (#f5f0e8) are "elevated" against the cream (#faf8f5) "ground" — a subtle layering that creates visual rhythm.

**Split hero figure/ground:** The product screenshot in the hero right panel creates a strong figure element — it's a real UI screenshot with borders and shadow, clearly distinct from the text on the left. This visual anchor pulls the eye toward the product.

---

### 2.2 Visual Hierarchy — Score: 8/10

#### Above-the-Fold Test
Split hero at 1440×900:
- Header (64px)
- Left: headline (40px) + subtitle + 2 CTAs
- Right: animated product preview

**Verdict:** Headline + CTA visible above fold — PASS. The split layout shows both text and product simultaneously, providing more information above the fold than Option A's center layout. This is a hierarchy advantage — the visitor sees what CORTHEX IS (text) and what it LOOKS LIKE (screenshot) in a single glance.

#### Z-Pattern / F-Pattern
The split hero creates a clear Z-pattern:
1. Top-left: CORTHEX logo → header nav → header CTA (Z top stroke)
2. Left: headline + subtitle (Z diagonal)
3. Right: product preview (Z bottom stroke)

Below the hero, the center-aligned sections (social proof, problem→solution, metrics, CTA) revert to I-pattern. The tab-based features section uses a left-aligned tab bar with right-aligned content — a mini Z-pattern within the section.

**Assessment:** The Z-pattern in the hero creates the strongest initial focal flow of all three options. Below the fold, the pattern is mixed (Z in features, I elsewhere), which is acceptable since below-fold visitors are already engaged.

#### Problem→Solution Visual Hierarchy
The Before/After cards create an explicit narrative hierarchy:
1. Section heading (24px/600): "AI 도구가 많아질수록, 관리는 더 복잡해집니다."
2. "BEFORE" card (sand/muted): ✗ items — visually depressed (lower contrast)
3. Arrow icon (sage, 24px): → direction indicator
4. "AFTER" card (cream/accent): ✓ items — visually elevated (accent color, brighter)

This hierarchy guides the eye: problem → transition → solution. The visual weight shifts from muted (BEFORE) to vibrant (AFTER), creating an emotional arc within a single section.

**Hierarchy score rationale (8/10):** The Before/After section creates an "explicit narrative hierarchy" with visual weight differentiation (muted BEFORE with ✗ items vs sage-accented AFTER with ✓ items). This is a genuine hierarchy improvement over Option A's flat feature grid — the Before/After structure creates figure/ground depth plus narrative direction that Option A lacks. The Z-pattern hero + Problem→Solution emotional arc together elevate hierarchy above Option A's I-pattern monotony, justifying 8 over A's 6.

---

### 2.3 Golden Ratio & Proportion — Score: 7/10

#### Split Hero Proportions
Desktop: text (flex-1) : visual (flex-1) → 1:1 ratio. Both occupy equal width within the 1440px max-width container minus padding.

**Issue:** A 1:1 split gives equal visual weight to text and screenshot. However, the text (headline + subtitle + CTAs) is less visually dense than the screenshot (filled with UI elements, colors, data). The screenshot "wins" the attention battle despite equal allocation. A 1.2:1 text:visual ratio would give text slightly more space to counterbalance the screenshot's density.

**Prescription:** Use `grid-template-columns: 1.2fr 1fr` instead of `1fr 1fr` for the hero split. This gives text ~55% width and visual ~45% — enough to balance attention while maintaining the split layout.

#### Tab Content Proportions
Desktop tab content: text panel (1fr) : screenshot panel (1.2fr). This gives the screenshot slightly more space — correct for a feature showcase where the visual proof is more persuasive than text description.

#### Section Height Rhythm
| Section | Approx Height | Relative |
|---------|--------------|----------|
| Header | 64px | Constant |
| Hero | ~80vh (~720px) | 4.8× |
| Social Proof | ~150px | 1× |
| Problem→Solution | ~400px | 2.7× |
| Feature Tabs | ~500px | 3.3× |
| Metrics | ~200px | 1.3× |
| Testimonials | ~300px | 2× |
| CTA | ~300px | 2× |
| Footer | ~200px | 1.3× |

The rhythm is: large → small → medium → medium → small → medium → medium → small. This creates a more varied heartbeat than Option A's large-small-large pattern. The middle sections maintain moderate heights, preventing scroll fatigue.

---

### 2.4 Contrast — Score: 6/10

#### Section Alternation
| Section | Background | Contrast Signal |
|---------|-----------|-----------------|
| Hero | cream | Baseline |
| Social Proof | surface + border-y | Mild elevation + explicit borders |
| Problem→Solution | cream | Return to baseline |
| Feature Tabs | surface | Mild elevation |
| Metrics | cream | Return to baseline |
| Testimonials | surface | Mild elevation |
| CTA | **olive dark** | **Dramatic inversion** |
| Footer | surface | Mild elevation |

The cream↔surface alternation is more frequent than Option A (every section vs every 3 sections), creating a "striped" visual pattern. This is better than Option A's monotone but still relies on a 3% luminance shift for the cream↔surface transitions.

**Improvement:** The `border-y` on the social proof bar adds an explicit contrast signal beyond background color. If other section transitions also used top-border (`border-t`) rather than just background color change, the sectioning would be more visible.

#### Before/After Card Contrast
- "BEFORE" card: sand background (#e5e1d3), muted text, ✗ icons in red
- "AFTER" card: cream background (#faf8f5), accent sage border, ✓ icons in sage

The before→after contrast creates an emotional gradient from negative (muted, red) to positive (bright, sage). This is effective persuasion design — the visitor *feels* the improvement.

#### Tab Active State Contrast
Active tab: sage (#606C38) text + 2px sage underline. Inactive tab: secondary text (#6b705c).

Same concern as the CEO app's active tab: #606C38 and #6b705c are nearly identical in luminance. The 2px underline provides an additional differentiator (color alone is insufficient). The combination of underline + color change is adequate but not ideal.

**Contrast score rationale (6/10):** Unlike Option C's sage gradient hero glow and olive CTA inverted bookend that create multi-layered contrast signals, Option B relies entirely on the cream↔surface alternation (3% luminance shift) and the single olive CTA block. The Before/After card contrast is effective but localized to one section. No hero gradient, no radial glow, no CTA bookend symmetry — contrast signals are flat cream→surface only. Compare Option C's Contrast 8 (sage gradient + olive bookend + sage border accents) to B's functionally simpler palette treatment.

---

### 2.5 White Space + Unity — Score: 7/10

#### White Space
The 9-section page is longer than Option A's 6-section page. Each section uses `py-24` (96px) padding consistently, but the total page length (~2200px on desktop) increases scroll fatigue risk.

**Testimonial section whitespace:** If testimonials are empty at v3 launch (no real users yet), this section must be omitted entirely. An empty testimonial section with placeholder text is worse than no testimonials — it signals "we have no users." The architecture should conditionally render this section.

**Feature tab whitespace:** Tab content area (48px top padding + content) provides adequate spacing between tab bar and tab content. The text:screenshot split prevents horizontal crowding.

#### Unity
Same token-level unity as Option A (colors, type, spacing from Vision & Identity). The additional elements (social proof bar, problem→solution, testimonials) use the same token system.

**Tab component unity:** The feature tabs use the same tab styling as the CEO app's tabbed pages (Jobs, SNS, Settings). This creates cross-product unity — a visitor who sees tabs on the landing page will recognize the same pattern in the app.

**Concern — Scroll animation unity:** If scroll-reveal animations are added to Option B but not Option A, the motion design must use the same timing tokens (--duration-normal: 200ms, ease-in-out) defined in Vision §7.2. Custom animation curves or durations would break token unity.

---

### 2.6 UX Deep Dive — Score: 6/10

#### Conversion Flow
The narrative structure creates multiple natural conversion points:

1. **Hero CTA** (above fold): Captures immediately interested visitors — ~5% conversion
2. **After social proof** (implicit): Credibility builds interest — no explicit CTA here (missed opportunity)
3. **After Problem→Solution** (implicit): Pain resolved — no explicit CTA (missed opportunity)
4. **After Feature Tabs** (implicit): "I want this" moment — no explicit CTA (missed opportunity)
5. **Bottom CTA** (olive section): Final push — captures ~10% of scrollers

**Issue — No mid-page CTAs:** Option B's narrative structure naturally builds desire at 3 points (after social proof, after problem→solution, after features), but there are no CTA buttons at these points. The visitor must scroll to the bottom CTA or scroll back to the hero CTA. **No sticky header CTA** means once the visitor scrolls past the hero, the only remaining conversion point is the bottom olive CTA — reaching only ~10% of visitors. This is a significant conversion gap.

**Fix:** Add subtle "text CTAs" after high-persuasion sections: "지금 무료로 시작하기 →" as a linked text line (not a button — too aggressive for mid-page) after the Problem→Solution and Feature Tabs sections.

**UX score rationale (6/10):** The explicitly identified "no mid-page CTAs" weakness is a genuine conversion gap. Narrative retention (45% vs ~40% at midpoint) partially compensates, but the absence of a sticky header CTA and the absence of mid-page conversion points together create two compounding gaps. A category with two explicitly identified weaknesses (no sticky CTA + no mid-page CTAs) cannot score identically to categories without identified weaknesses.

#### Scroll Depth Analysis
9 sections create a longer page (~2200px desktop). Estimated engagement:
| Section | Position | Visitor Retention |
|---------|----------|-------------------|
| Hero | 0-80vh | 100% |
| Social Proof | 80vh-90vh | 60% |
| Problem→Solution | 90vh-130vh | 45% |
| Feature Tabs | 130vh-170vh | 30% |
| Metrics | 170vh-180vh | 20% |
| Testimonials | 180vh-210vh | 15% |
| CTA | 210vh-230vh | 10% |

The narrative structure maintains slightly better retention than Option A at the midpoint (45% vs ~40%) because the story creates curiosity ("what's the solution?"). However, the bottom CTA still reaches only ~10%.

#### Tab Interaction on Mobile
Feature tabs on mobile use horizontal scroll. The CEO must swipe right to see tabs 3-5 (NEXUS, OpenClaw, 워크플로우). The first 2 tabs (허브, 대시보드) are visible initially.

**Concern:** If the visitor doesn't realize tabs are horizontally scrollable (no scroll indicator), they may see only 2 of 5 features. Fix: Add a fade-out gradient on the right edge of the tab bar, implying more content to the right.

---

### 2.7 Framework Implementation Spec

#### Component Tree
```tsx
<LandingPage>
  <LandingHeader />

  <HeroSplit>
    <HeroText>
      <HeroBadge>● CORTHEX v3 출시</HeroBadge>
      <HeroTitle>당신의 AI 조직을 지휘하세요</HeroTitle>
      <HeroSubtitle>...</HeroSubtitle>
      <HeroCTAs>
        <CTAButton variant="primary" />
        <CTAButton variant="ghost" label="데모 보기" />
      </HeroCTAs>
    </HeroText>
    <HeroVisual>
      <AnimatedProductPreview />
    </HeroVisual>
  </HeroSplit>

  <SocialProofBar>
    <LogoScroll logos={logos} />              {/* or StatCards if no logos */}
  </SocialProofBar>

  <ProblemSolutionSection>
    <SectionTitle>AI 도구가 많아질수록, 관리는 더 복잡해집니다</SectionTitle>
    <CompareGrid>
      <BeforeCard items={beforeItems} />
      <Arrow />
      <AfterCard items={afterItems} />
    </CompareGrid>
  </ProblemSolutionSection>

  <FeatureTabsSection id="features">
    <SectionTitle>CORTHEX가 제공하는 모든 것</SectionTitle>
    <TabGroup>
      <TabList>
        <Tab>허브</Tab>
        <Tab>대시보드</Tab>
        <Tab>NEXUS</Tab>
        <Tab>OpenClaw</Tab>
        <Tab>워크플로우</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <FeatureText title="AI 허브" description="..." checks={checks} />
          <FeatureScreenshot src="/images/hub.webp" />
        </TabPanel>
        {/* ... 4 more tab panels */}
      </TabPanels>
    </TabGroup>
  </FeatureTabsSection>

  <MetricsSection>
    <SectionTitle>숫자로 보는 CORTHEX</SectionTitle>
    <MetricGrid>
      <MetricCard value="23" label="관리 페이지" />
      {/* ... */}
    </MetricGrid>
  </MetricsSection>

  {hasTestimonials && (
    <TestimonialsSection>
      <TestimonialCard quote="..." author="..." company="..." />
    </TestimonialsSection>
  )}

  <CTASection />
  <LandingFooter />
</LandingPage>
```

### 2.8 Option B Summary

| Category | Score | Key Finding |
|----------|-------|-------------|
| Gestalt Compliance | 7/10 | Cream↔surface alternation + border-y creates clear sectioning; testimonial card similarity concern |
| Visual Hierarchy | 8/10 | Split hero Z-pattern strongest of all options; Before/After narrative hierarchy creates genuine depth |
| Golden Ratio & Proportion | 7/10 | 1:1 hero split should be 1.2:1; section height rhythm varied; tab content proportions good |
| Contrast | 6/10 | Before/After card contrast effective but localized; no sage gradient, no olive bookend — flat palette |
| White Space + Unity | 7/10 | 9 sections increase scroll fatigue; tab component unity with app; conditional testimonials needed |
| UX Deep Dive | 6/10 | No sticky CTA = conversion gap; no mid-page CTAs compounds the issue; narrative retention partial compensation |
| **TOTAL** | **41/60** | **Strongest narrative — story-driven persuasion, but conversion gaps lower UX score** |

**Score distribution:** σ=0.75, range 6-8. Hierarchy (8) reflects genuine Before/After + Z-pattern advantage. Contrast (6) and UX (6) reflect the explicitly identified weaknesses (flat palette, no sticky CTA + no mid-page CTAs).

---

## 3. Option C: "Natural Organic Storyteller" — RECOMMENDED

**Inspiration:** Vercel (structure) + Stripe (narrative) + Notion (warmth) + CORTHEX identity
**Philosophy:** The landing page IS the brand. "Controlled Nature" expressed in every section. Story-driven with a unique differentiator section (Agent Showcase).

### 3.1 Gestalt Compliance — Score: 9/10

#### Proximity
Option C has 8 sections with the strongest proximity design of all options:

1. **Header:** Sticky, cream+blur — navigation frame
2. **Hero:** Cream + sage radial gradient — introduction zone
3. **Social Proof:** Surface + border-y — trust strip (narrow)
4. **Problem→Solution:** Cream — pain/relief narrative
5. **Feature Tabs:** Surface — depth showcase
6. **Agent Showcase:** Cream — CORTHEX differentiator
7. **CTA:** Olive dark — conversion zone
8. **Footer:** Surface — information zone

Each section has a distinct purpose, and the background alternation (cream→surface→cream→surface→cream→olive→surface) creates a clear wave pattern where section boundaries are unambiguous.

**Agent Showcase proximity:** This section (unique to Option C) groups three related concepts — Personality (Big Five), Memory (observation→reflection→planning), and Performance (tracking) — into a 3-card row beneath an animated agent card. The agent card above is visually distinct (larger, richer detail), and the three concept cards below are peer-level elements. The vertical proximity (agent card above → concept cards below) creates a "hero + supporting details" grouping that the brain parses intuitively.

#### Similarity
**Feature tabs:** Same treatment as Option B — consistent tab bar + content panel styling.

**Before/After cards:** Same asymmetric similarity as Option B (same shape, different color treatment).

**Agent Showcase cards:** Three concept cards (Personality, Memory, Performance) share identical structure: Lucide icon + title (20px/600) + description paragraph. They are visually equal — none dominates — correctly signaling that these three features are equally important differentiators.

**Agent card:** The main agent card in the Agent Showcase uses a distinct treatment: avatar + structured metadata (name, department, tier, personality radar, memory count, status dot). This is intentionally *different* from the concept cards below it, establishing a visual hierarchy within the section.

#### Continuity
The 8-section structure creates the strongest narrative continuity:

1. Hero: "What is CORTHEX?" (introduction)
2. Social Proof: "You can trust it" (credibility)
3. Problem→Solution: "Here's your pain → here's your relief" (empathy)
4. Feature Tabs: "Here's what it does" (depth)
5. Agent Showcase: "Here's what makes it unique" (differentiation)
6. CTA: "Ready? Start now." (action)

Each section answers a natural follow-up question. The visitor never thinks "why am I seeing this?" — each section logically follows the previous. The Agent Showcase (Section 5) is the key differentiator — after seeing features (what it does), the visitor sees personality/memory/performance (what makes it *different* from every other AI platform). This builds to the CTA as a natural climax.

**Scroll reveal animation continuity:** Elements fade-in + translate-up on scroll, creating a sense of content "rising to meet the reader." This motion continuity — consistent direction (up) and timing (600ms cubic-bezier) — makes the page feel alive without being distracting. The animation follows Vision §7.1's "purposeful only" principle.

#### Closure
Same strong closure elements as Option B (border-y on social proof, card borders, olive CTA block). The Agent Showcase adds a new closure element: the agent card with its structured metadata fields creates a "form-like" closure — fields in rows, avatar in a circle, status dot — that previews the app's data presentation style.

#### Figure/Ground
The hero's sage radial gradient creates a subtle "glow" effect behind the headline — a background element that adds depth without competing with the text. The gradient is 8% opacity sage, creating a barely-perceptible warmth that distinguishes the hero from a flat cream background.

**Product screenshot:** The hero screenshot uses `rounded-xl` (16px) + `shadow-lg` + `border` — it floats above the cream background as a clear figure. The olive gradient fade at the bottom edge of the screenshot smoothly transitions to the next section — a sophisticated figure/ground relationship that prevents the hard edge from feeling abrupt.

---

### 3.2 Visual Hierarchy — Score: 8/10

#### Above-the-Fold Test
At 1440×900:
- Header (64px) with logo + nav + CTA
- Badge pill ("● v3 출시 — OpenClaw 가상 사무실")
- Headline: "당신의 AI 조직, 살아있고 책임지는." (40px/700)
- Subtitle: 2-line description (18px/400)
- Two CTA buttons (48px height, generously sized)
- Top ~30% of product screenshot

**Verdict:** All critical elements (headline, value prop, primary CTA) are above the fold — PASS. The headline "살아있고 책임지는" (alive and accountable) directly echoes the brand promise from Vision §1.3. This is the only option where the hero copy matches the brand document verbatim.

**Badge enhancement:** The badge includes "OpenClaw 가상 사무실" — mentioning the v3 differentiator feature. This immediately signals "new, interesting" to returning visitors.

#### CTA Hierarchy (Full Page)
| CTA | Position | Treatment | Audience |
|-----|----------|-----------|----------|
| Header CTA | Top-right, always visible | Sage bg, 44px, sticky | Drive-by visitors |
| Hero Primary | Above fold, center | Sage bg, 48px height | First-time visitors |
| Hero Secondary | Next to primary | Ghost (border), 48px | Interested but cautious |
| Final CTA | Olive dark section | Cream bg on olive, 56px | Convinced scrollers |

Four CTA placements ensure a conversion opportunity at every stage of the visitor's journey. The sticky header CTA means there's always a visible CTA regardless of scroll position — this increases conversion opportunity vs Options A and B.

**Portability note:** Adding `position: sticky` + `z-50` to any option's header takes ~2 lines of CSS. Options A and B could have a sticky header CTA with zero architectural change. The sticky header benefit is a CSS property, not an architectural innovation unique to Option C.

#### Agent Showcase Hierarchy
Within the Agent Showcase section:
1. **Section title** (24px/600): "살아있는 AI 조직" — section identifier
2. **Agent card** (large, centered): visual centerpiece with avatar, metadata — the primary figure
3. **Three concept cards** (3×1 grid below): personality, memory, performance — supporting details

The agent card is ~2x the height of the concept cards and contains visual elements (avatar, radar chart, status dot) that the concept cards don't have. This size + complexity contrast correctly makes the agent card the focal point with the concept cards as explanatory supports. This internal hierarchy within the Agent Showcase is architecturally unique to Option C and is the genuine hierarchy differentiator.

#### Scroll Reveal Hierarchy
Scroll-reveal animations create a *temporal hierarchy* — elements that appear first (because the user scrolls to them first) are read first. The animation timing (600ms with stagger) ensures elements within a section appear sequentially (title first, then cards, then CTAs), guiding the reading order even within sections.

**Note:** Scroll reveal is portable — any option can add `IntersectionObserver`. The temporal hierarchy advantage is not architecturally unique to Option C.

#### Hierarchy Score Rationale (8/10, not 9/10)
Two factors prevent "Exceptional" (9):
1. **Sticky header CTA is portable** — the persistent CTA availability is a CSS property, not an architectural advantage. Without sticky header credit, Option C's unique hierarchy advantage is the Agent Showcase internal hierarchy.
2. **Hero headline at 40px is acknowledged as undersized** — the analysis itself prescribes 48px for landing (§1.3 type scale analysis). If the headline scale is identified as a deficiency, scoring hierarchy as "Exceptional" while acknowledging a headline problem is contradictory.

The Agent Showcase hierarchy alone (agent card 2x height of concept cards, rich metadata vs simple descriptions) is genuinely "Strong" (8), not "Exceptional" (9).

---

### 3.3 Golden Ratio & Proportion — Score: 8/10

#### Hero Proportions
Center-aligned hero with text → screenshot vertical stack (same as Option A on desktop). The text:screenshot ratio follows the golden section as analyzed in Option A.

**Hero button sizing:** Primary CTA is 48px height × 32px horizontal padding. Secondary CTA is the same dimensions. The button width is ~200px (text-dependent). At 48px height on a 720px content width: button is 6.67% of content width, creating a visually appropriate accent without dominating.

#### Feature Tab Text:Screenshot Ratio
Desktop: `grid-template-columns: 1fr 1.2fr` — text occupies ~45% and screenshot ~55%. This gives screenshots slight visual dominance, which is correct for a feature showcase where "seeing is believing." The 1:1.2 ratio is not golden (1:1.618) but is close to 5:6 — a harmonious simple fraction.

#### Section Padding Rhythm
All sections use `--landing-section-padding-y: 96px` consistently. The Agent Showcase section is the same height as other sections, but its content (agent card + concept cards) is visually denser — creating a "packed" feel within the consistent padding frame. This is intentional — the Agent Showcase is the deepest section, rewarding visitors who scroll to it with rich content.

#### Type Scale Drama
Option C specifies:
- Hero headline: 40px/700 → same as Options A and B
- Section titles: 24px/600 → standard
- Feature tab titles: 20px/600 → one step up from Option A's 18px
- Body/description: 16px/400 → base size (vs Option A's 14px for landing descriptions)
- Metric values: 40px JetBrains Mono/700 in sage — dramatic data display
- CTA button text: 14px/600 → compact, action-oriented

The 40px→24px→20px→16px progression has ratios of 1.667→1.2→1.25 — a decreasing ratio sequence that creates a natural "settling" effect from dramatic headline to calm body text.

---

### 3.4 Contrast — Score: 8/10

#### Section Alternation
| Section | Background | Contrast Signal |
|---------|-----------|-----------------|
| Header | cream (85% opacity blur) | Transparent layer |
| Hero | cream + sage radial gradient 8% | Subtle warmth |
| Social Proof | surface + border-y | Mild elevation + borders |
| Problem→Solution | cream | Return to baseline |
| Feature Tabs | surface | Mild elevation |
| Agent Showcase | cream | Return to baseline |
| CTA | **olive dark** | **Dramatic inversion** |
| Footer | surface + border-t | Mild elevation |

The cream→surface wave (3 full cycles before CTA) creates a more developed visual rhythm than Options A (1.5 cycles) or B (3 cycles). The Agent Showcase section on cream after the surface Feature Tabs creates a "breathing" moment before the dark CTA section — a contrast palette cleanser.

**Hero sage gradient:** The 8% opacity sage radial gradient is a contrast *enhancement* over Option A's flat cream hero. It adds visual interest (a subtle glow behind the headline) without affecting text readability. The gradient is positioned at `50% 0%` (top center), creating a "spotlight" effect that draws the eye to the headline.

#### Before/After Card Contrast
Same strong before→after emotional contrast as Option B:
- "WITHOUT CORTHEX": sand background, ✗ icons, muted text
- "WITH CORTHEX": cream background, ✓ icons in sage, accent border

Additional refinement in Option C: the "WITH CORTHEX" card uses a subtle sage border (`sage/30` = 30% opacity sage) instead of the standard sand border. This creates a brand-specific accent that reinforces "this is the CORTHEX solution" — a small but meaningful brand signal.

#### CTA Section Contrast
The olive dark (#283618) CTA section includes a "subtle radial gradient from sage/20 center → transparent edges." This adds dimension to what would otherwise be a flat dark block:
- Without gradient: flat olive rectangle — utilitarian
- With gradient: olive with warm sage center — organic, alive, brand-consonant

The cream (#faf8f5) CTA button on olive (#283618) background = **12.64:1** contrast — dramatically visible. The inverted color scheme (cream on dark vs sage on cream in the hero) creates a visual bookend: hero CTA and final CTA use inverse color treatments, signaling "beginning" and "end" of the conversion journey.

---

### 3.5 White Space + Unity — Score: 8/10

#### White Space
**Hero whitespace:** `min-height: 80vh` (higher than Option A's 70vh) with 80px top padding and 64px bottom. The extra 10vh gives the hero more breathing room — the headline floats in generous space, conveying premium quality (luxury = whitespace).

**Section breathing room:** 96px padding consistently. Combined with the cream↔surface alternation, each section has ample whitespace above and below its content. The content within sections uses `max-width: 1200px` (not 1440px like the app) — narrower content band = more side margins = more premium feel.

**Agent Showcase whitespace:** The agent card (centered, ~400px wide on desktop) is surrounded by generous whitespace on both sides. The three concept cards below use a 3-column grid with 24px gaps. The section feels spacious because the agent card doesn't fill the full width — it sits as a focal element in a field of cream.

**Mobile whitespace:** Mobile uses 16px padding (standard). Full-width CTA buttons maintain generous touch targets. The single-column layout prevents horizontal cramping.

#### Unity — Landing ↔ App ↔ Brand
Option C achieves the highest cross-product unity of all options:

| Element | Landing (C) | CEO App | Match? |
|---------|-------------|---------|--------|
| Cream background | #faf8f5 | #faf8f5 | Exact |
| Olive dark chrome | #283618 (CTA section) | #283618 (sidebar) | Exact |
| Sage accent | #606C38 (CTAs, accents) | #606C38 (active indicators) | Exact |
| Surface cards | #f5f0e8 | #f5f0e8 | Exact |
| Inter typography | 40px hero → 14px body | 24px headings → 14px body | Scale overlap |
| JetBrains Mono data | Metric values (40px) | Cost values, agent IDs | Same font, different scale |
| Border radius | 12px (cards), 8px (buttons) | 12px (cards), 8px (buttons) | Exact |
| Lucide icons | Feature icons | Nav + page icons | Same library |
| Tab component | Feature tabs | Jobs/SNS/Settings tabs | Same pattern |
| Card component | Feature/concept cards | Dashboard metric cards | Same pattern |

The Agent Showcase section previews the app's agent detail view — avatar, department, tier, personality, status. This is not just brand unity; it's *product preview unity*. The visitor sees a taste of the app's visual language before signing up.

**Scroll reveal animation → App transition:** The landing page uses scroll-reveal animations (600ms fade-in + translate-up). The app uses no animations (Vision §7.1: purposeful only). This is a *correct* divergence — the landing page's aspirational tone justifies attention-grabbing animation, while the app's functional tone requires minimal motion. The divergence is principled, not arbitrary.

---

### 3.6 UX Deep Dive — Score: 8/10

#### Conversion Flow
Option C has the most conversion touchpoints:

1. **Header CTA** (sticky, always visible): "무료로 시작하기 →" — the visitor can convert from any scroll position. This is the single most impactful conversion improvement over Options A and B.
2. **Hero Primary CTA** (above fold): "무료로 시작하기 →" — first-time visitors
3. **Hero Secondary CTA**: "기능 둘러보기" — scrolls to features, keeps visitor engaged
4. **Feature Tabs** (interactive): Each tab shows a different product facet — increases "I want this" moments
5. **Agent Showcase** (unique differentiator): Shows personality/memory — creates "this is different" realization
6. **Final CTA** (olive section): "무료 평가판 시작하기 →" — captures convinced scrollers

**Sticky header CTA analysis:** The header CTA is always visible as the visitor scrolls. At any point, the visitor can glance to the top-right and see "무료로 시작하기 →" in sage green. This provides a persistent conversion opportunity without being aggressive (it's in the header, not a floating modal/popup).

This pattern is used by Vercel, Stripe, and Linear — commonly reported to increase conversion over non-sticky headers.

#### Scroll Depth Analysis
8 sections, total page length ~2400px desktop:
| Section | Position | Visitor Retention | CTA Available? |
|---------|----------|-------------------|----------------|
| Hero | 0-80vh | 100% | Header + Hero CTAs |
| Social Proof | 80vh-90vh | 60% | Header CTA |
| Problem→Solution | 90vh-130vh | 45% | Header CTA |
| Feature Tabs | 130vh-170vh | 30% | Header CTA |
| Agent Showcase | 170vh-210vh | 20% | Header CTA |
| CTA | 210vh-240vh | 10% | Header + Final CTA |

**Key advantage:** At every row in this table, "Header CTA" is available. Unlike Options A and B where the CTA disappears between hero and bottom, Option C's sticky header means the conversion button is literally always one click away.

**Agent Showcase retention boost:** The Agent Showcase is unique to Option C. Visitors who reach this section see something they haven't seen on any competitor's landing page — AI agents with personality, memory, and performance tracking. This novelty may improve engagement and retention at the 170vh scroll depth.

#### Mobile-Specific UX
**Header on mobile:** Option C's mobile header simplifies to `[CORTHEX logo] [시작→]` — no hamburger menu. Nav items are moved to the footer. This is the Vercel mobile pattern — the header is purely for brand + CTA. Removing the hamburger eliminates a cognitive decision ("should I open the menu?") and keeps the header clean.

**Feature tabs on mobile:** Same horizontal scroll as Option B. The tab bar shows 2-3 tabs with a fade gradient on the right edge — correct scroll affordance.

**Agent Showcase on mobile:** The agent card becomes full-width, stacked vertically (avatar/name → metadata → radar chart). The three concept cards stack in a single column. The section adapts well because the content is structured metadata, not wide visuals.

**Mobile CTA:** The sticky header CTA remains visible on mobile. On phones, the header is 48px with the CTA button occupying ~100px in the top-right corner. This is in the "stretch zone" (top-right) but always visible — the CEO can tap it any time they're convinced.

#### SEO & Performance
- **SSG:** All content is pre-rendered (Vite SSG). The page HTML contains full text content for search engine crawlers.
- **Estimated LCP:** Hero headline text (fast — no images needed for LCP)
- **Scroll reveal:** Uses `IntersectionObserver` API — no heavy scroll libraries needed. The `prefers-reduced-motion` media query ensures animations are disabled for users who prefer reduced motion.
- **Tab interaction:** Client-side state only (no API calls). Tab content is pre-rendered in DOM, toggled via CSS `display`.
- **Images:** Screenshots loaded with `loading="lazy"` for below-fold images, `fetchpriority="high"` for hero screenshot.

---

### 3.7 Framework Implementation Spec

#### Component Tree
```tsx
<LandingPage>
  <LandingHeader sticky>
    <Logo icon={Waypoints} text="CORTHEX" />
    <HeaderNav links={navLinks} />              {/* hidden on mobile, moved to footer */}
    <HeaderCTA href="/signup">무료로 시작하기 →</HeaderCTA>
  </LandingHeader>

  <HeroSection className="reveal">
    <HeroBadge>● v3 출시 — OpenClaw 가상 사무실</HeroBadge>
    <HeroTitle>당신의 AI 조직, 살아있고 책임지는.</HeroTitle>
    <HeroSubtitle>
      AI 에이전트를 부서와 티어로 조직하고,
      성격을 부여하고, 모든 비용을 추적하세요.
    </HeroSubtitle>
    <HeroCTAs>
      <CTAButton variant="primary" href="/signup">무료로 시작하기 →</CTAButton>
      <CTAButton variant="ghost" href="#features">기능 둘러보기</CTAButton>
    </HeroCTAs>
    <ProductScreenshot
      src="/images/dashboard.webp"
      alt="CORTHEX v3 Dashboard"
      priority
    />
  </HeroSection>

  <SocialProofSection className="reveal">
    <MetricGrid>
      <MetricCard value="23" label="관리 페이지" />
      <MetricCard value="N-Tier" label="동적 계층" />
      <MetricCard value="Big Five" label="에이전트 성격" />
      <MetricCard value="24/7" label="ARGOS 자동화" />
    </MetricGrid>
  </SocialProofSection>

  <ProblemSolutionSection className="reveal">
    <SectionTitle>AI 도구가 많아질수록, 관리는 더 복잡해집니다.</SectionTitle>
    <CompareGrid>
      <CompareCard variant="before" items={beforeItems} />
      <CompareArrow />
      <CompareCard variant="after" items={afterItems} />
    </CompareGrid>
  </ProblemSolutionSection>

  <FeatureTabsSection id="features" className="reveal">
    <SectionTitle>CORTHEX가 제공하는 모든 것</SectionTitle>
    <FeatureTabs
      tabs={[
        { label: '허브', icon: Home, content: hubTabContent },
        { label: '대시보드', icon: BarChart3, content: dashTabContent },
        { label: 'NEXUS', icon: Network, content: nexusTabContent },
        { label: 'OpenClaw', icon: Gamepad2, content: openclawTabContent },
        { label: '워크플로우', icon: GitBranch, content: workflowTabContent },
      ]}
    />
  </FeatureTabsSection>

  <AgentShowcaseSection className="reveal">
    <SectionTitle>살아있는 AI 조직</SectionTitle>
    <AgentCard
      name="마케팅 매니저"
      department="마케팅부"
      tier="Manager (T2)"
      personality={bigFiveData}
      memoryCount={42}
      status="working"
    />
    <ConceptGrid>
      <ConceptCard icon={Brain} title="성격" description="Big Five 성격 모델로 에이전트에게 개성을 부여" />
      <ConceptCard icon={MessageCircle} title="메모리" description="관찰→성찰→계획 사이클로 에이전트가 학습하고 성장" />
      <ConceptCard icon={BarChart3} title="성과" description="실시간 품질/비용 대시보드로 모든 에이전트를 추적" />
    </ConceptGrid>
  </AgentShowcaseSection>

  <CTASection>
    <CTATitle>지금 바로 AI 조직을 구축하세요</CTATitle>
    <CTASubtitle>14일 무료 평가판으로 모든 기능을 제한 없이 경험하세요.</CTASubtitle>
    <CTAButton variant="inverted" href="/signup" size="lg">
      무료 평가판 시작하기 →
    </CTAButton>
  </CTASection>

  <LandingFooter links={footerLinks} navLinks={navLinks} />
</LandingPage>
```

#### Key CSS Classes (Tailwind v4)
```css
/* Landing-specific tokens */
--landing-max-width: 1200px;
--landing-header-h: 64px;
--landing-section-py: 96px;
--reveal-duration: 600ms;
--reveal-easing: cubic-bezier(0.16, 1, 0.3, 1);

/* Header */
.landing-header → sticky top-0 z-50 flex items-center justify-between
                   h-16 px-4 md:px-10 lg:px-20
                   bg-[#faf8f5]/85 backdrop-blur-[12px]
                   border-b border-[#e5e1d3]

/* Hero */
.hero           → flex flex-col items-center text-center
                   min-h-[80vh] px-4 pt-20 pb-16 md:pt-30 md:pb-20
                   bg-[#faf8f5] relative
.hero::before   → absolute inset-0 pointer-events-none
                   /* Raw CSS (not valid as Tailwind class): */
                   /* background: radial-gradient(circle at 50% 0%, rgba(96,108,56,0.08), transparent 70%); */
                   /* Implement in @layer components or via inline style attribute */
.hero-title     → text-[32px] md:text-[40px] font-bold leading-tight
                   text-[#1a1a1a] max-w-[800px]
.hero-subtitle  → text-[16px] md:text-[18px] text-[#6b705c] max-w-[600px] mt-4

/* CTA Buttons */
.cta-primary    → inline-flex items-center justify-center h-12 px-8
                   bg-[#606C38] text-[#faf8f5] text-sm font-semibold
                   rounded-lg hover:bg-[#5a7247] transition-colors
.cta-ghost      → inline-flex items-center justify-center h-12 px-8
                   border border-[#e5e1d3] text-[#1a1a1a] text-sm font-semibold
                   rounded-lg hover:bg-[#f5f0e8] transition-colors
.cta-inverted   → inline-flex items-center justify-center h-14 px-10
                   bg-[#faf8f5] text-[#283618] text-sm font-bold
                   rounded-lg hover:bg-[#f5f0e8] transition-colors

/* Section alternation */
.section-cream  → py-24 px-4 md:px-10 lg:px-20 bg-[#faf8f5]
.section-surface→ py-24 px-4 md:px-10 lg:px-20 bg-[#f5f0e8]
.section-olive  → py-32 px-4 md:px-10 lg:px-20 bg-[#283618] text-[#a3c48a] text-center

/* Agent Showcase */
.agent-card     → max-w-[480px] mx-auto p-6 bg-[#f5f0e8] rounded-xl
                   border border-[#e5e1d3] shadow-sm
.concept-grid   → grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-[1200px] mx-auto
.concept-card   → p-6 bg-[#f5f0e8] rounded-xl border border-[#e5e1d3]

/* Scroll Reveal — Progressive Enhancement */
/* Scoped behind .js-loaded so content is visible without JavaScript */
.js-loaded .reveal         → opacity-0 translate-y-6 transition-all duration-[600ms]
                              ease-[cubic-bezier(0.16,1,0.3,1)]
.js-loaded .reveal.visible → opacity-100 translate-y-0
/* Add in <head>: document.documentElement.classList.add('js-loaded') */
/* Without JS, all .reveal content is visible (no opacity-0 applied) */

@media (prefers-reduced-motion: reduce) {
  .js-loaded .reveal → opacity-100 translate-y-0 transition-none
}
```

#### TypeScript Props
```typescript
// Feature Tabs
interface FeatureTab {
  label: string;
  icon: LucideIcon;
  content: {
    title: string;
    description: string;
    checks: string[];
    screenshot: string;
  };
}

// Agent Showcase
// BigFiveData type: imported from @corthex/shared or defined as:
// interface BigFiveData { extraversion: number; agreeableness: number;
//   conscientiousness: number; openness: number; stability: number; }
interface AgentCardProps {
  name: string;
  department: string;
  tier: string;
  personality: BigFiveData;
  memoryCount: number;
  status: 'online' | 'working' | 'offline';
}

interface ConceptCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

// Compare Section
interface CompareCardProps {
  variant: 'before' | 'after';
  items: { text: string; positive: boolean }[];
}

// Metric
interface MetricCardProps {
  value: string;
  label: string;
}

// Scroll Reveal Hook
function useScrollReveal(ref: RefObject<HTMLElement>, threshold?: number): boolean;
```

#### Accessibility Spec
```typescript
// Document language
// <html lang="ko"> — Korean-primary landing page for screen reader pronunciation

// Semantic structure
// <header role="banner">...</header>
// <main role="main">
//   <section aria-labelledby="hero-title">...</section>
//   <section aria-labelledby="features-title">...</section>
//   <section aria-labelledby="agents-title">...</section>
// </main>
// <footer role="contentinfo">...</footer>

// Feature Tabs ARIA
// <div role="tablist" aria-label="기능 소개 (5개 중 2개 표시)">
//   ↑ Include total count for mobile users who can't see all tabs
//   <button role="tab" aria-selected={isActive} aria-controls={panelId}>
//   <div role="tabpanel" id={panelId} aria-labelledby={tabId}>
// Tab keyboard navigation: Arrow keys cycle tabs, Home/End jump to first/last

// Agent Showcase — Radar Chart screen reader alternative
// <AgentCard personality={bigFiveData}>
//   <span className="sr-only">
//     성격: 외향성 {bigFiveData.extraversion}/10,
//     친화성 {bigFiveData.agreeableness}/10,
//     성실성 {bigFiveData.conscientiousness}/10,
//     개방성 {bigFiveData.openness}/10,
//     안정성 {bigFiveData.stability}/10
//   </span>
// </AgentCard>

// Skip link
// <a href="#main-content" class="sr-only focus:not-sr-only">
//   본문으로 건너뛰기
// </a>

// Scroll reveal: prefers-reduced-motion disables all animation
// Progressive enhancement: .js-loaded scoping ensures content visible without JS
// Images: descriptive alt text in Korean for product screenshots
// Mobile header CTA: aria-label="무료로 시작하기" when abbreviated "시작→" displayed
```

### 3.8 Option C Summary

| Category | Score | Key Finding |
|----------|-------|-------------|
| Gestalt Compliance | 9/10 | Strongest section separation; Agent Showcase creates unique proximity grouping |
| Visual Hierarchy | 8/10 | Agent Showcase internal hierarchy unique; sticky CTA portable; headline 40px acknowledged undersized |
| Golden Ratio & Proportion | 8/10 | Hero proportions near golden; consistent section rhythm; type scale drama adequate |
| Contrast | 8/10 | Sage gradient adds hero warmth; Before/After sage border accent; olive CTA inverted bookend |
| White Space + Unity | 8/10 | Highest cross-product unity; narrower content band (1200px) creates premium whitespace |
| UX Deep Dive | 8/10 | Sticky header = persistent CTA; Agent Showcase novelty; good mobile adaptation |
| **TOTAL** | **49/60** | **Brand-perfect landing — narrative + differentiation + conversion optimized** |

---

## 4. Final Comparison Matrix

| Category (max) | Option A: Vercel Clean | Option B: Stripe Narrative | Option C: Natural Organic |
|----------------|----------------------|--------------------------|-----------------------------|
| Gestalt (/10) | 6 | 7 | **9** |
| Hierarchy (/10) | 6 | 8 | **8** |
| Golden Ratio (/10) | 6 | 7 | **8** |
| Contrast (/10) | 7 | 6 | **8** |
| White Space + Unity (/10) | 7 | 7 | **8** |
| UX Deep Dive (/10) | 5 | 6 | **8** |
| **TOTAL (/60)** | **37** | **41** | **49** |
| **Percentage** | **61.7%** | **68.3%** | **81.7%** |

### Score Distribution Analysis

| Metric | Option A | Option B | Option C |
|--------|----------|----------|----------|
| Highest category | Contrast, White Space (7) | Hierarchy (8) | Gestalt (9) |
| Lowest category | UX Deep Dive (5) | Contrast, UX (6) | Hierarchy, Golden Ratio, Contrast, White Space, UX (8) |
| Standard deviation | 0.75 | 0.75 | 0.41 |
| Ceiling gap (from 10) | 3.83 avg | 3.17 avg | 1.83 avg |

**Option A** is the simplest and fastest to build, but its generic structure and single-CTA conversion model make it the weakest performer. It looks like "every other SaaS landing page."

**Option B** adds narrative depth (Problem→Solution, testimonials) and interactive depth (feature tabs) that improve engagement and variety. Hierarchy (8) is its peak, reflecting the Before/After narrative structure, but Contrast (6) and UX (6) reflect identified weaknesses (flat palette, no sticky CTA + no mid-page CTAs). It's a solid intermediate choice but lacks a differentiating element that makes CORTHEX memorable.

**Option C** is Option B's narrative approach + the Agent Showcase section that no competitor has. The sticky header CTA ensures conversion opportunity at every scroll position (though this is a portable CSS property, not an architectural innovation). The Agent Showcase transforms the landing page from "a good SaaS page" to "the CORTHEX page" — recognizable, differentiated, and optimized for conversion. Option C still leads by 8 points.

---

## 5. Recommendation

### Primary: Option C — "Natural Organic Storyteller"

**Confidence: HIGH** (49/60 = 81.7%, 8-point lead over Option B)

Option C is the correct landing page for CORTHEX v3 because:

1. **The Agent Showcase is the differentiator.** No competitor landing page (CrewAI, Dify, Langflow, Relevance AI) shows AI agents with personality (Big Five), memory (observation→reflection→planning), or structured hierarchy (departments + tiers). This section converts "interesting" to "I need this."

2. **The sticky header CTA eliminates the conversion gap.** Options A and B lose 90% of visitors between the hero CTA and the bottom CTA. Option C's sticky header means a CTA is always visible — every scroll position is a conversion opportunity.

3. **The brand promise is the headline.** "당신의 AI 조직, 살아있고 책임지는" is the brand promise from Vision §1.3 verbatim. The landing page doesn't just *describe* CORTHEX — it *embodies* the brand at the copy level.

4. **The Natural Organic palette peaks on this page.** The sage radial gradient in the hero, the olive CTA section, the cream↔surface wave — these are the brand colors performing at their most expressive. The landing page is where the brand should be loudest.

5. **Performance is preserved.** Despite 8 sections and scroll-reveal animations, the SSG rendering, lazy-loaded images, and CSS-only transitions ensure Core Web Vitals remain excellent. No heavy JavaScript frameworks are required.

### Critical Implementation Items

1. **Hero headline size:** Consider 48px for landing (override Vision §4.2's 40px max — landing is aspirational, not functional)
2. **Ghost CTA border:** Darken from #e5e1d3 to #5a7247 (accent-secondary) for visibility
3. **Scroll reveal observer:** Use native `IntersectionObserver` with `threshold: 0.15` — no scroll library needed
4. **Feature tab scroll indicator:** Add right-edge fade gradient on mobile tab bar
5. **Agent Showcase data:** Use realistic demo data (not lorem ipsum) — the agent card is a product preview
6. **Social proof section:** Launch with metric cards (23 pages, N-Tier, Big Five, 24/7). Switch to logo scroll when real customer logos are available
7. **Testimonials:** Omit at v3 launch (no real users). Architecture supports conditional rendering
8. **Pricing section:** Defer. Insert as Section 7 (before CTA) when paid tiers are defined

---

## 5B. "Controlled Nature" Evaluation — Landing Page

Per Vision §2.3, CORTHEX's brand philosophy is "Controlled Nature" — the tension between **structure** (precision, grid, systematic) and **organicism** (natural materials, warmth, growth). Each option expresses this balance differently on the landing page.

### Structure Elements on Landing
- Grid layouts (feature grids, concept card grids)
- CTA hierarchy (primary → ghost → inverted — systematic progression)
- Consistent section rhythm (96px padding, section alternation pattern)
- Type scale progression (40→24→20→16 — mathematical ratio)
- Tab interface (structured interaction, clear state management)

### Organicism Elements on Landing
- Sage radial gradient "glow" in hero (organic warmth, 8% opacity)
- Cream↔surface wave (natural color alternation, like terrain undulation)
- Scroll reveal "rising to meet the reader" animation (organic motion, growth metaphor)
- Olive section as "earth zone" (natural material color, grounding)
- Agent personality (Big Five) — organic, human-like qualities applied to AI

### Per-Option Controlled Nature Assessment

| Dimension | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| Structure | Strong grid, consistent padding | Strong tabs + card grid | Strong grid + tabs + card structure |
| Organicism | Minimal — flat cream, no gradient, no animation | Before/After emotional arc (narrative warmth) | Sage gradient + scroll reveal + olive bookend + Agent personality |
| Balance | **All structure** — clean but cold | **Structure + narrative warmth** — story adds organic flow | **Structure + gradient warmth + scroll organicism + personality** |
| Verdict | Structure dominates; Nature absent | Nature expressed through narrative (story = organic flow) | Fullest expression — visual (gradient), motion (scroll reveal), conceptual (personality) |

**Option C** best expresses the Structure↔Organicism tension because it layers organic signals across multiple channels: visual (sage gradient glow), kinetic (scroll reveal animation), chromatic (cream↔surface↔olive wave), and conceptual (Big Five personality = nature applied to AI). Structure is equally strong — consistent grids, systematic CTA hierarchy, mathematical type scale. The tension is active and balanced.

---

## 6. Sources

### Design Principles Applied
- Same as Steps 2-1 and 2-2: Gestalt, Visual Hierarchy, Golden Ratio, Contrast, White Space, Unity
- Landing-specific: Z-pattern reading, Above-the-fold rule, Conversion funnel analysis

### Conversion Best Practices
- Sticky header CTA: commonly reported conversion improvement (Stripe, Vercel, Linear pattern)
- Above-fold CTA: 100% visibility → highest conversion opportunity
- Scroll depth retention: ~50% at fold, ~25% at midpoint, ~10% at bottom
- Two-CTA pattern: Primary (filled) + Secondary (ghost) — industry standard

### Internal References
- Vision & Identity — `_uxui_redesign/phase-0-foundation/vision/vision-identity.md` (§14 Landing)
- Technical Spec — `_uxui_redesign/phase-0-foundation/spec/technical-spec.md`
- Landing Layout Research (Phase 1) — `_uxui_redesign/phase-1-research/landing/landing-page-research.md`
- Web Analysis (Phase 2) — `_uxui_redesign/phase-2-analysis/web-analysis.md`
- App Analysis (Phase 2) — `_uxui_redesign/phase-2-analysis/app-analysis.md`

---

*End of Landing Page Layout Deep Analysis — Phase 2, Step 2-3*
