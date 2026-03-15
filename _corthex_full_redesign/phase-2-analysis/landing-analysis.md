# CORTHEX Landing Page — Phase 2 Deep Analysis

**Phase 2 — Analysis & Scoring**
**Date:** 2026-03-15
**Analyst:** UXUI Redesign Writer
**Input:** Phase 0 Vision & Identity v2.0 + Phase 1 Research + Phase 1-3 Critic Corrections

---

## Preamble: What These 3 Concepts Must Prove

The CORTHEX landing page is not a marketing brochure. It is the first handshake between a Korean CEO — who expects professional precision, not friendliness — and a command-center platform that will replace an entire layer of organizational management. Every concept is evaluated against a single question: **Does this page communicate "authoritative, intelligent, structurally powerful" to a non-developer Korean executive within 5 seconds of arrival?**

All specs below reflect **Phase 0 v2.0 corrections applied** (Inter font, cyan-400 CTAs, slate-950 bg).

---

## CONCEPT A — "The Command Bridge"

*Inspired by: Vercel + Linear | Archetype: Ruler (Authority)*

---

### Design Philosophy Analysis

#### Sovereign Sage Brand Communication Effectiveness

Concept A communicates the Sovereign Sage archetype through structural confidence rather than visual decoration. The dark hero (`bg-slate-950`) with a centered, vertically-stacked headline signals authority — the same compositional grammar used by Linear and Vercel, both of which speak to serious, professional users who do not need to be entertained.

The label badge (`엔터프라이즈 AI 플랫폼`) above the H1 functions as a tier signal: it pre-qualifies the visitor before the headline lands. This is a Sovereign move — it communicates "this is not for everyone" without arrogance.

The NEXUS canvas screenshot as the primary hero visual is the strongest Sage signal: it shows the system's organizational intelligence rather than a stock photo or abstract graphic. A CEO sees an org chart — something they recognize — and instantly understands "this is structured, this is complex, this is mine to command."

**Weakness:** The Sage dimension (analytical depth, intelligence made visible) is underserved in the hero. The headline "AI 조직을 설계하고, 지휘하라" skews Ruler (command verb), but lacks the secondary Sage signal of "and here is why it is smarter than anything else you've seen." This is addressed in the body feature sections, but a visitor who doesn't scroll will miss it.

#### Dark Hero → Light Body Transition Justification

The `slate-950` hero → `slate-50/white` body transition is the correct visual grammar for CORTHEX's persona split:

- **Hero (dark):** The CEO's world — command, authority, the product's gravity
- **Body (light):** The explanation for everyone else — CFO, CTO, evaluating stakeholders

This mirrors the Anthropic editorial pattern: authority established in the opening, then the supporting case made in readable, scannable light sections. The transition also signals that CORTHEX is a product that can be explained, not just felt — a trust signal for B2B enterprise buyers who require rational justification.

**Transition execution:** The Phase 1 research specified a `slate-900` trust block between the dark hero and light body. This functions as a graceful staircase (`slate-950 → slate-900 → slate-50`) rather than a jarring binary flip. The pattern is borrowed from WandB's alternating dark sections and adapted as a single transition buffer.

#### <5 Second Value Communication Test

```
T=0s  Logo loads → "CORTHEX" — new name, unknown, curiosity activated
T=1s  Label badge: "엔터프라이즈 AI 플랫폼" → category understood (B2B AI)
T=2s  H1: "AI 조직을 설계하고, 지휘하라." → verb understood (design + command)
T=3s  Subtext: "부서·직원·AI 에이전트를 자유롭게 구성하고, NEXUS로 한눈에 지휘하세요."
      → scope understood (departments, staff, agents, org chart)
T=4s  NEXUS screenshot below → "that org chart IS the product" → differentiation landed
T=5s  CTA: "무료로 시작하기" → conversion affordance available
```

**Result: PASS.** All 5 communication tasks complete within 5 seconds on standard reading pace. The NEXUS screenshot carries the most weight at T=4s — this is why the product screenshot must be high-fidelity (real screenshot or polished SVG composition, not a placeholder).

---

### Design Principles Scoring

#### Gestalt

| Principle | Application | Score |
|-----------|-------------|-------|
| **Proximity** | Label → H1 → subtext → CTAs grouped with `mb-6/mb-10` spacing; product preview separated by `mt-20` (80px). Groups clearly defined. | ✓ |
| **Similarity** | Primary CTA `bg-cyan-400 rounded-lg`, secondary `border-cyan-400/50 rounded-lg` — same radius, same padding, same font weight. Visual kinship with role distinction. | ✓ |
| **Continuity** | Eye flows label → H1 → subtext → CTAs → product preview in a vertical column. No horizontal interruptions in center stack. | ✓ |
| **Closure** | Browser chrome frame around NEXUS preview implies complete product UI without needing a full screenshot. Rounded-2xl radius completes the closure illusion. | ✓ |
| **Figure/Ground** | White text on slate-950 background = 20.1:1 contrast. NEXUS screenshot in `slate-900/80` frame recedes slightly from primary text column. Clear separation. | ✓ |

**Gestalt Score: 10/10** — All five principles applied with intention, not accident.

#### Visual Hierarchy

Hero establishes a 4-level hierarchy visible at blur-50% test:
1. H1: `text-6xl font-bold text-white` — primary focal point (unmissable)
2. NEXUS preview: large visual mass anchors lower hero — secondary focal point
3. CTA pair: `px-6 py-3 rounded-lg` — tertiary, action affordance
4. Label badge + subtext: `text-slate-400` — supporting information

**Score: 9/10** — The one gap: subtext (`text-slate-400 text-xl`) competes visually with the CTA pair at blur-50%. Consider increasing CTA size or adding more vertical separation (current `mb-10` between subtext and CTAs is adequate but not generous).

#### Golden Ratio

Hero content column: `max-w-4xl` (896px on 1440px viewport). Content-to-viewport ratio: 896/1440 = 0.622 ≈ 1/φ. The golden ratio governs how much horizontal space the hero text consumes relative to total viewport. **Compliant.**

Typography scale in body sections: `text-2xl` (28px) feature titles, `text-base` (16px) body text = 1.75:1 ratio. Close to Fibonacci step (1.618). **Acceptable deviation.**

**Score: 8/10** — Hero proportions excellent; body typography scale is near-golden but not exact.

#### Contrast

| Pair | Ratio | Status |
|------|-------|--------|
| H1 `slate-50` on `slate-950` | 20.1:1 | ✅ AAA |
| Subtext `slate-400` on `slate-950` | 5.9:1 | ✅ AA |
| CTA `slate-950` on `cyan-400` | 9.1:1 | ✅ AAA |
| Body text `slate-900` on `slate-50` (light sections) | 16.8:1 | ✅ AAA |
| Feature body `slate-600` on `white` | 5.7:1 | ✅ AA |

**Score: 10/10** — Every text pair meets or exceeds WCAG AA. Multiple AAA pairs. No exceptions.

#### White Space

Hero section uses `py-[implicit 100vh]` with content vertically centered. Internal spacing:
- Label → H1: `mb-8` (32px)
- H1 → subtext: `mb-6` (24px) — slightly tight for H1 at 72px; consider `mb-8`
- Subtext → CTAs: `mb-10` (40px) — generous, correct
- CTAs → product preview: `mt-20` (80px) — excellent breathing room

Body sections use `py-24` between sections — matches the "Major (structural break)" spacing rule from the Design Principles SKILL (64px minimum, ideally 96px).

**Score: 8/10** — One micro-issue: H1 to subtext gap (`mb-6`) is slightly compressed given the headline's visual weight at `text-6xl`. Recommend `mb-8`.

#### Unity

Concept A achieves unity through:
- Consistent `rounded-lg` across both CTAs, product preview frame, feature cards
- `slate-950 / slate-900 / slate-800` dark surface progression maintained across all dark surfaces
- `cyan-400` as the single primary accent appearing in both hero CTA and body CTAs
- Inter font throughout all visible text (confirmed post-correction)

**Score: 9/10** — One caveat: the final CTA section uses `bg-indigo-950` which introduces a new background color not present elsewhere. This breaks unity slightly unless indigo-950 reads as a "deeper slate-950" at a distance. Phase 2 should evaluate a `bg-slate-900` final CTA as an alternative.

**Design Principles Total: 54/60**

---

### UX Deep Dive

#### Scroll Flow (Section-by-Section Engagement)

```
Section 1: HERO [slate-950, 100vh]
  Purpose: Impact. Category. Differentiator. CTA.
  Engagement driver: NEXUS screenshot — "wait, that's the actual product"
  Exit condition: scroll down OR click primary CTA

Section 2: TRUST [slate-900, 120px]
  Purpose: Social proof before investment of reading time
  Engagement driver: recognizable company logos
  Exit condition: logos recognized → credibility established → scroll continues

Section 3: FEATURES [slate-50, auto]
  Purpose: Structured explanation of 3 core capabilities
  Engagement driver: 3-column Swiss grid — scannable, not linear
  Exit condition: 2-3 features resonate → scroll continues

Section 4: DEEP FEATURE A [white, 600px]
  Purpose: Hub command interface detail — primary CEO workflow
  Engagement driver: animated Hub screenshot (command + delegation chain visible)
  Exit condition: "I see how this works" → scroll OR evaluate

Section 5: DEEP FEATURE B [slate-50, 600px]
  Purpose: ARGOS automation — addresses "does it work without me?" question
  Engagement driver: ARGOS scheduler mockup (cron + job history visible)
  Exit condition: secondary capability confirmed

Section 6: SOCIAL PROOF [white, auto]
  Purpose: Eliminate risk. Real organizations. Real results.
  Engagement driver: Korean-language testimonial quotes
  Exit condition: "Others like me trust this" → proceed to CTA

Section 7: FINAL CTA [indigo-950, 320px]
  Purpose: Convert. Remove hesitation. One clear action.
  Engagement driver: Two-path CTA (self-serve vs. enterprise sales)
  Exit condition: signup OR contact form

Section 8: FOOTER [slate-950, auto]
  Purpose: Navigation fallback for non-converters
```

**Scroll flow assessment:** Section count (8) is appropriate for enterprise SaaS. No section overstays its welcome — the alternating `slate-50/white` in sections 3–6 prevents monotony. The transition `slate-950 → slate-900 → slate-50` is gradual enough to feel intentional rather than jarring.

**One gap:** Section 4 (Deep Feature A — Hub) is the CEO's most important workflow, but it appears in the 4th scroll position. Visitors who stop at Section 3 (feature overview) may not see the Hub interface at all. Consider whether the Section 3 feature cards should include a small Hub preview or link to deep dive.

#### CTA Placement and Conversion Optimization

| CTA | Location | Type | Goal |
|-----|----------|------|------|
| "무료로 시작하기" | Hero (primary) | `bg-cyan-400 text-slate-950` | Self-serve conversion |
| "데모 요청" | Hero (secondary) | `border-cyan-400/50 text-cyan-400` | Sales-assisted lead |
| "시작하기" | Nav (persistent) | Primary button | Return visitors |
| "로그인" | Nav (persistent) | Ghost link | Existing users |
| "무료로 시작하기" + "영업팀 문의" | Final CTA | Dual primary | Final conversion |

**Dual-CTA pattern is correct:** Enterprise SaaS visitors split into two buyer types — self-serve (startup CEO, small org) and enterprise-assisted (larger org, multiple stakeholders). One CTA serves neither; dual CTA serves both without splitting attention at any single point.

**Concern — Primary CTA color:** `bg-cyan-400 text-slate-950` is the Phase 0 primary button spec for the app. However, on a landing page with a light body, `cyan-400` against `white` body backgrounds has only 1.27:1 contrast ratio — **FAIL for button background.** The CTA must use the hero's dark context exclusively, or in light body sections use a higher-contrast button (`bg-slate-900 text-white` or similar). Phase 2 wireframing must address this.

#### Login/Signup Integration Pattern

Concept A places login exclusively in the navbar: `"로그인"` as ghost link, `"시작하기"` as primary button. This is the **product-first** approach — the landing page teaches the product before asking for credentials.

**Evaluation:**
- Cold visitors (first encounter): ✅ Correct — need education before registration
- Warm visitors (returning, referred): ✓ Nav login is accessible but requires scrolling up or recalling it's there
- Existing users landing on `/`: Nav login handles this adequately

**Recommendation:** Add a sticky nav on scroll (transforms from transparent to `bg-slate-950/95 backdrop-blur-sm` at scroll position > 80px). This keeps `"로그인"` permanently accessible without competing with the hero's focal hierarchy.

#### Mobile Responsiveness

Concept A's centered single-column hero adapts gracefully to mobile:
- `max-w-4xl` container: collapses naturally to full-width on mobile with `px-6` padding
- `text-6xl xl:text-7xl` → needs explicit mobile breakpoint: recommend `text-4xl sm:text-5xl xl:text-7xl`
- Product preview (`max-w-5xl`): must add `overflow-x-hidden` to prevent horizontal scroll on small viewports
- Feature cards (3-col): `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — standard collapse
- Deep feature (2-col): `flex-col lg:flex-row` — text-first on mobile, visual second

**Mobile-specific CTA stacking:**
```tsx
<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
  {/* Primary CTA full-width on mobile */}
  <button className="w-full sm:w-auto px-6 py-3 bg-cyan-400 ...">무료로 시작하기</button>
  <button className="w-full sm:w-auto px-6 py-3 border ...">데모 요청</button>
</div>
```

**Mobile score:** Requires explicit breakpoint work but the underlying structure is mobile-friendly. No fundamental layout changes needed.

---

### React Implementation Spec

#### HTML + React Hybrid Considerations

The CORTHEX landing page is a React SPA (Vite). SEO requires SSR or pre-rendering — pure client-side SPA will not rank. Options:

1. **React + Vite + `vite-plugin-ssr` (vite-plugin-ssg)** — Static pre-rendering at build time. Simplest for a landing page that doesn't change data. Recommended.
2. **Separate static HTML** for `/` route — bypasses React SPA entirely. Faster LCP, fully crawlable. Recommended if app and landing share a domain but different routes.
3. **Next.js migration** — Overkill for a single landing page; not recommended given existing Vite infrastructure.

**Recommended:** Option 1 — Static pre-render at build time via `vite-ssg`. Landing page React components pre-render to static HTML, then hydrate for animations. Zero SEO penalty.

```bash
# Add to package.json deps
"vite-ssg": "^0.23.x"
```

#### Animation Implementation (Within Phase 0 Motion Budget)

Phase 0 approved motion spec: fade-up 150–200ms, hover 0.3s, no parallax/particles/lottie.

```tsx
// Scroll-triggered fade-up — IntersectionObserver, no library needed
const useFadeUp = () => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return ref
}

// CSS (in global.css)
.fade-up {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}
.fade-up.animate-in {
  opacity: 1;
  transform: translateY(0);
}

// Stagger variant (feature cards)
.fade-up:nth-child(2) { transition-delay: 100ms; }
.fade-up:nth-child(3) { transition-delay: 200ms; }
```

**Grid overlay (static CSS — no JS):**
```css
.hero-grid {
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 64px 64px;
}
```

**Radial glow (static CSS — no JS, no lottie):**
```css
.hero-glow {
  background: radial-gradient(ellipse at center, rgba(34,211,238,0.08) 0%, transparent 70%);
  /* cyan-400/8 — within Phase 0 motion budget (CSS only, no animation) */
}
```

#### SEO Considerations

```html
<!-- index.html — static shell, hydrated by React -->
<head>
  <title>CORTHEX — AI 조직 운영 플랫폼</title>
  <meta name="description" content="부서·AI 에이전트를 자유롭게 구성하고 NEXUS로 지휘하세요. 코드 없이 조직도가 AI 실행 로직이 됩니다." />

  <!-- OG Tags -->
  <meta property="og:title" content="CORTHEX — AI 조직 운영 플랫폼" />
  <meta property="og:description" content="AI 조직을 설계하고 지휘하라. 부서·에이전트·핸드오프를 드래그&드롭으로." />
  <meta property="og:image" content="https://corthex.io/og-image-v2.png" />
  <!-- OG image spec: 1200×630px, slate-950 bg, H1 text, NEXUS preview, cyan-400 accent -->
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="ko_KR" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="CORTHEX — AI 조직 운영 플랫폼" />
  <meta name="twitter:image" content="https://corthex.io/og-image-v2.png" />

  <!-- Canonical -->
  <link rel="canonical" href="https://corthex.io/" />

  <!-- Preload: LCP image (NEXUS screenshot) -->
  <link rel="preload" as="image" href="/assets/nexus-hero-preview.webp" fetchpriority="high" />

  <!-- Inter font preload -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
</head>
```

**Structured data (JSON-LD — SoftwareApplication):**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CORTHEX",
  "description": "AI 조직 운영 플랫폼. 부서·에이전트를 동적으로 구성하고 NEXUS 캔버스로 지휘.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "inLanguage": "ko"
}
```

#### Performance Budget (LCP < 2.5s, CLS < 0.1)

| Metric | Target | Implementation |
|--------|--------|----------------|
| **LCP** | < 2.5s | Hero NEXUS image: `.webp`, `fetchpriority="high"`, `loading="eager"`, `width`+`height` set, preloaded in `<head>`. No hero video. No lottie. |
| **CLS** | < 0.1 | All images have explicit `width`+`height`. Font: `font-display: swap` on Inter. Grid overlay: CSS-only, no layout-affecting JS. Radial glow: `position: absolute pointer-events-none` (out of flow). |
| **FCP** | < 1.8s | Static HTML pre-rendering (vite-ssg). Critical CSS inlined. JS deferred for animations. |
| **INP** | < 200ms | No heavy JS in hero. Scroll handler: passive + throttled. IntersectionObserver: cheap. |
| **Bundle** | < 200KB gzip | Landing page code-split from app bundle. No heavy dependencies in landing route. |

```tsx
// Hero LCP image — correct implementation
<img
  src="/assets/nexus-hero-preview.webp"
  alt="CORTHEX NEXUS 조직도 — AI 에이전트 노드와 핸드오프 체인"
  width={1200}
  height={675}
  fetchpriority="high"
  loading="eager"
  decoding="async"
  className="rounded-2xl border border-slate-800 shadow-2xl shadow-black/50 w-full h-auto"
/>
```

**CLS prevention for grid overlay (avoid layout shift):**
```tsx
// Overlay must be position:absolute, not in document flow
<div
  aria-hidden="true"
  className="absolute inset-0 hero-grid pointer-events-none"
/>
```

---

### Concept A — Final Scoring

| Dimension | Max | Score | Notes |
|-----------|-----|-------|-------|
| **Vision Alignment** | 10 | 9 | Dark hero + NEXUS screenshot = Sovereign Sage. Minor gap: Sage's "intelligence" dimension underrepresented in hero. |
| **UX** | 10 | 8 | Scroll flow correct, CTA placement optimal. Gap: cyan-400 on light body sections fails button contrast. Sticky nav not specified. |
| **Design Principles** | 10 | 9 | Gestalt all 5 present. Hierarchy clean. White space near-perfect. One unity concern (indigo-950 final CTA). |
| **Feasibility** | 10 | 10 | Simplest of 3 to implement. No animated SVG network. Static CSS overlays. Single-column hero. vite-ssg cleanly applicable. |
| **Performance** | 10 | 9 | LCP strategy correct. CLS risks identified and mitigated. One risk: large NEXUS screenshot file size (must be ≤150KB webp). |
| **Accessibility** | 10 | 8 | WCAG AAA on dark. Gap: cyan-400 CTA on light backgrounds requires rethink. Focus-visible rings needed on all interactive elements. |
| **Total** | 60 | **53/60** | |

---

## CONCEPT B — "The Embedded Authority"

*Inspired by: Clerk + Anthropic | Archetype: Sage (Trust through transparency)*

---

### Design Philosophy Analysis

#### Sovereign Sage Brand Communication Effectiveness

Concept B attempts to communicate trust through immediacy: the login form embedded in the hero says "we're confident enough to put the door right at the entrance." This is a Sage signal — transparency over theater. But it creates a tension: the Ruler archetype (command authority) is subordinated to the Sage archetype (accessibility, transparency). For CORTHEX's primary persona — a Korean CEO who is deciding whether to invest organizational trust in this platform — leading with a login form before demonstrating capability is premature.

The left-column value proposition ("AI 조직의 새로운 기준") establishes authority adequately, but the feature checklist (`✓ 자유로운 조직 설계`, `✓ AI 에이전트 허브`, `✓ ARGOS 자동화`) is a weaker product demonstration than Concept A's NEXUS screenshot. Bullet points tell; screenshots show.

**The Swiss vertical divider line** between left and right columns is a strong compositional choice — it references Müller-Brockmann's grid structure as a visible element (not just a constraint). This is sophisticated Swiss Style application.

#### Dark Hero → Light Body Transition Justification

Concept B uses an explicit gradient transition band (`bg-gradient-to-b slate-950 → slate-50`, 80px) instead of the `slate-900` buffer band in Concept A. This is more dramatic and immediately signals the tonal shift.

However, the gradient creates a CLS risk: gradient sections with non-fixed heights can cause layout reflow on different viewport heights. The 80px fixed-height band mitigates this adequately.

**One concern:** The auth card (right column) uses `backdrop-blur-xl bg-slate-900/90` glassmorphism. On some GPU configurations, `backdrop-blur` triggers repaint on scroll. This is a performance risk (CLS and jank). Alternative: `bg-slate-900` solid without blur — maintains the visual quality without the performance penalty.

#### <5 Second Value Communication Test

```
T=0s  Logo → "CORTHEX"
T=1s  LEFT: Eyebrow "Enterprise AI Platform" + H1: "AI 조직의 새로운 기준."
T=2s  RIGHT: Auth card appears → cognitive split (what is this? login? already?)
T=3s  Feature checklist scanned: 3 bullet points registered
T=4s  "아, login form이구나" — auth card purpose understood
T=5s  PRIMARY MESSAGE STILL NOT FULLY RECEIVED: user still parsing left vs. right
```

**Result: MARGINAL FAIL.** The split-attention effect of the 2-column layout causes cognitive load at T=2s. The auth card is correctly identified but its presence before product understanding creates a trust barrier. Cold visitors need ~6 seconds for full value communication — 1 second over budget.

**Exception:** For returning users (warm traffic) who already understand CORTHEX, the auth card is immediately useful. T=5s test passes for warm visitors. Concept B excels in day-2 conversion, not day-1 discovery.

---

### Design Principles Scoring

#### Gestalt

| Principle | Application | Score |
|-----------|-------------|-------|
| **Proximity** | Left column items tightly grouped (`space-y-4` checklist, `mb-10` between sections). Auth card internal spacing (`space-y-4` inputs). Groups are distinct. | ✓ |
| **Similarity** | Left/right columns share `items-center min-h-screen` vertical alignment, but visual language diverges (text vs. card). The vertical divider helps but doesn't fully resolve the split. | △ |
| **Continuity** | Grid divider line creates a clear vertical axis. Eye follows down left column, then across to right column. Works for LTR users, but interrupts the standard F-pattern scan. | △ |
| **Closure** | Auth card `rounded-2xl border border-slate-800` creates clear enclosure. Browser chrome pattern not needed here — the card is its own closed form. | ✓ |
| **Figure/Ground** | Auth card (`bg-slate-900/90 backdrop-blur-xl`) floats over the hero background. However, the glassmorphism effect depends on the hero background having sufficient texture — on a plain `slate-950` bg, the `bg-slate-900/90` card barely distinguishes itself (only 1-step apart in Tailwind dark scale). | △ |

**Gestalt Score: 7/10** — Proximity and closure strong. Similarity, continuity, and figure/ground weakened by 2-column split attention.

#### Visual Hierarchy

2-column split creates **parallel hierarchies** — left column's H1 and right column's auth card "CORTHEX 시작하기" are both visually prominent. There is no single primary focal point. This violates Design Principle 5 (One Primary Action Per Screen) and the SKILL.md rule: "Not all elements are equally important. Design must guide the eye."

At blur-50% test:
- Left column: Large text block visible, no single dominant element
- Right column: Rectangular card with form fields — competes equally with text block

**Score: 6/10** — Hierarchy ambiguity is the concept's primary structural weakness.

#### Golden Ratio

`grid-cols-2 gap-16` with `max-w-7xl` (1280px) on 1440px viewport:
- Each column: ~592px (half of content area)
- 50/50 split violates golden ratio (should be 61.8/38.2)
- A `grid-cols-3 gap-8` with left content spanning 2 columns (`col-span-2`) and right card spanning 1 (`col-span-1`) would achieve golden proportions

**Score: 5/10** — 50/50 split is a missed opportunity. The current spec explicitly uses `grid-cols-2 gap-16` which creates equal-weight columns. This conflicts with both Golden Ratio and Visual Hierarchy principles simultaneously.

#### Contrast

All text-on-background pairs: ✅ same as Concept A (dark hero, same color tokens).

**Auth card inputs:** `bg-slate-800 border-slate-700 text-white placeholder-slate-500`
- `slate-500` placeholder on `slate-800`: 2.7:1 ratio — **FAIL WCAG AA (3:1 minimum for UI)**
- Must change to `placeholder-slate-400` (3.7:1 on slate-800) per A11y correction from Phase 1-3 snapshot

**Score: 8/10** — Dark background text excellent. Input placeholder fails — requires correction (documented in Phase 1-3 critic, must be applied).

#### White Space

Left column: adequate internal spacing (`mb-6 h1`, `mb-8 checklist`, `mb-10 to CTA`).
Right column: `p-8` auth card padding = 32px. Standard card padding.

**Overall hero white space:** The `gap-16` (64px) between columns is generous, but the hero as a whole feels denser than Concept A — two active content areas competing for the same viewport height.

**Score: 7/10** — The parallel columns necessarily reduce breathing room. Not solvable within the 2-column hero constraint.

#### Unity

Consistent use of `rounded-lg` on inputs and button. `border border-slate-700` and `border border-slate-800` create slight inconsistency — two border tones visible simultaneously in the auth card. Should standardize to `border-slate-700` throughout the auth card.

**Score: 7/10** — Minor inconsistencies. Good use of `backdrop-blur-xl` glassmorphism as a unifying auth card treatment.

**Design Principles Total: 40/60**

---

### UX Deep Dive

#### Scroll Flow

The scroll flow below the hero is identical to Concept A (same body section structure). The key difference is the hero → body transition:

```
Section 1: HERO (split 2-col, 100vh)
  Engagement strength: ★★★☆ (3/5) — cold visitors: confused by auth card
                                    warm visitors: immediately converts

Section 2: GRADIENT TRANSITION BAND (80px)
  Engagement: passthrough — eye follows page flow

Section 3: TRUST [slate-50] + FEATURES [white]
  Same as Concept A
```

**Scroll commitment for cold visitors who don't sign up immediately:**
A visitor who arrives cold and does NOT engage with the auth card (cold traffic majority) must scroll past the auth card to reach product education. This creates a psychological barrier: "I was asked to sign up before I understood the product."

#### CTA Placement

| CTA | Analysis |
|-----|----------|
| Auth card "로그인" (primary) | Correct position for warm visitors. Color (`bg-cyan-400`) correct per Phase 0. |
| Left column "데모 예약 →" | Correctly styled as ghost/outline — secondary action. |
| Nav "무료 체험 ▶" | Redundant with auth card if user is already on page. |

**Conversion risk:** The auth card's primary button and the nav primary button ("무료 체험 ▶") have the same visual weight. Two primary CTAs visible simultaneously violates Design Principle 5.

#### Login/Signup Integration

Concept B's core value proposition: **zero-click path to login.** For enterprise SaaS returning visitors, this is a significant UX improvement. Clerk's pattern (referenced in Phase 1 research) demonstrates this effectively.

**Implementation complexity:** The embedded auth card requires:
- Session detection (redirect logged-in users from `/` to `/hub` immediately)
- Form validation and error handling visible in the hero
- OAuth flow (Google) must not break the hero layout on redirect return
- Mobile: auth card must stack below text column (`flex-col` on `< lg` breakpoint)

**Recommended session detection:**
```tsx
// In landing page root
const { session } = useAuth()
useEffect(() => {
  if (session) router.replace('/hub')
}, [session])
```

#### Mobile Responsiveness

The 2-column hero presents a significant mobile challenge:
- `grid-cols-2 gap-16` → on mobile must become `flex-col`
- Auth card stacks **below** the value proposition text on mobile (correct order)
- But this means the auth card is below the fold on mobile — defeating Concept B's zero-friction purpose

**Mobile order:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
  {/* Left: Value prop — always first */}
  <div>...</div>
  {/* Right: Auth card — below fold on mobile (acceptable) */}
  <div className="flex justify-center">
    <AuthCard />
  </div>
</div>
```

**Mobile LCP:** The H1 becomes the LCP element on mobile (auth card is below fold). This is correct behavior — ensures text renders before the auth card JavaScript hydration.

---

### React Implementation Spec

#### Specific Concept B Complexity

Concept B requires client-side auth state awareness in the landing page — adding authentication context dependency to a traditionally static marketing page. This creates:

1. **Bundle size increase:** Auth SDK loaded on landing page
2. **FOUC risk:** Pre-rendered HTML shows auth form, then React hydrates → may flash before redirecting logged-in users
3. **Session checking latency:** Even 100ms delay before redirect is perceptible

**Mitigation — prerender + early redirect:**
```tsx
// In _app wrapper, before any render
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('corthex_token')
  if (token) { window.location.replace('/hub'); throw new Error('redirecting') }
}
```

#### Animation Implementation

Same Phase 0 budget as Concept A. Additionally:

```tsx
// Focus animation for auth card inputs
<input
  className="... focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
             focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
             transition-colors duration-150"
/>
```

#### SEO Considerations

**Additional risk:** Auth form in the hero is not crawlable content — it contributes nothing to SEO. The page's organic ranking depends entirely on the left column text. Ensure the H1 (`AI 조직의 새로운 기준`) is the strongest keyword-bearing element.

**Schema:** Same as Concept A — SoftwareApplication JSON-LD.

**One addition:** `noindex` the `/signup` redirect target to prevent duplicate indexing of auth flows.

#### Performance Budget

| Additional risk vs. Concept A | Mitigation |
|-------------------------------|------------|
| `backdrop-blur-xl` on auth card → GPU repaint on scroll | Replace with `bg-slate-900` solid in perf-sensitive contexts |
| Auth SDK loaded on landing | Code-split: auth module loaded only when input focused (dynamic import) |
| Google OAuth button | Load Google SDK lazily (not in `<head>`) |

**LCP:** No large hero image in Concept B (no NEXUS screenshot in hero). LCP element is H1 text → typically < 0.5s. **LCP advantage over Concept A.** But this comes at the cost of product differentiation.

---

### Concept B — Final Scoring

| Dimension | Max | Score | Notes |
|-----------|-----|-------|-------|
| **Vision Alignment** | 10 | 6 | Auth-first before product demonstration is Sage, not Sovereign Sage. Cold visitors don't see product capability. |
| **UX** | 10 | 7 | Warm visitor UX excellent. Cold visitor UX weak — auth form before product value creates barrier. Mobile: auth below fold defeats concept's primary advantage. |
| **Design Principles** | 10 | 7 | Hierarchy ambiguity (two competing focal points). 50/50 split violates golden ratio. Gestalt figure/ground weak. |
| **Feasibility** | 10 | 7 | Auth state in landing page = additional complexity. FOUC risk. Session redirect must be handled carefully. Moderate implementation effort. |
| **Performance** | 10 | 8 | No hero LCP image (text-first → faster). `backdrop-blur` risk mitigated with solid alternative. Auth SDK lazy loading required. |
| **Accessibility** | 10 | 7 | Input placeholder color fails WCAG (documented, fixable). Focus rings required. Semantic form markup critical. |
| **Total** | 60 | **42/60** | |

---

## CONCEPT C — "The Data Intelligence"

*Inspired by: WandB + Vercel + Linear | Archetype: Sovereign Sage (pure dark)*

---

### Design Philosophy Analysis

#### Sovereign Sage Brand Communication Effectiveness

Concept C is the purest expression of the Sovereign Sage archetype. The full-dark experience with JetBrains Mono eyebrow, large brand mark H1, and animated NEXUS org chart network communicates technical supremacy without apology. The metrics band (`2,400+ AI 세션`, `98% 가동률`, `<200ms API P95`, `29→∞ 에이전트 수`) provides Sage-level rational justification alongside the Ruler's visual authority.

The tabbed feature showcase (허브 | NEXUS | ARGOS | 라이브러리) is the most sophisticated product education structure of the three concepts — it provides depth without requiring scroll commitment, which aligns with the CEO persona's "5-second scannable" requirement.

**The strongest Sovereign Sage signal:** "29→∞" in the metrics band. This directly references CORTHEX's core competitive differentiator (v1 had 29 hardcoded agents; v2 removes the ceiling) in a single data point, without a word of explanation. A Sage communicates through precision; a Ruler communicates through implication of unbounded power. "29→∞" does both.

#### Phase 0 Alignment Concern

Concept C diverges from the Phase 0 decision: **"light theme for landing (body sections)"**. Concept C maintains full dark throughout (`slate-950 ↔ zinc-900 ↔ slate-900`). This is the most significant Phase 0 deviation and requires formal design review.

**Justification for deviation:**
1. CORTHEX's app is entirely dark — a light landing page creates a jarring aesthetic break when users click "시작하기" and enter the dark app
2. WandB (closest industry reference) maintains full dark throughout and converts enterprise AI users effectively
3. Full dark reinforces the "infrastructure for serious organizations" positioning

**Counter-argument (Phase 0 rationale):**
1. Light landing = lower barrier to trust for cold visitors from organic search
2. The "Secure" emotion (Phase 0 login design) is specifically associated with white/light backgrounds
3. Korean B2B market has lower familiarity with full-dark enterprise software vs. US/EU markets

**Verdict:** This is a legitimate design direction question that Phase 2 should put to a decision. The Phase 0 spec was written before seeing all three concepts executed side-by-side.

#### <5 Second Value Communication Test

```
T=0s  Slate-950 full-dark → premium category signal immediate
T=1s  JetBrains Mono eyebrow: "AI 에이전트 · 부서 관리 · 조직 지휘" → scope understood
T=2s  H1: "CORTHEX" at text-6xl → brand mark dominant
T=3s  Sub: "AI 조직 운영 플랫폼" at text-2xl → category confirmed
T=4s  Dual CTAs appear → conversion affordance visible
T=5s  NEXUS org chart visual begins to register → product differentiation
```

**Result: PASS (with caveat).** The animated NEXUS org chart network delivers differentiation at T=4–5s, which is at the edge of the 5-second budget. If the animation requires JavaScript load before rendering (as opposed to CSS-only), cold users on slow connections may see a blank area at T=5s. This is a performance-critical risk for the concept's core differentiator.

**Mitigation:** Render a static SVG composition as the `src` image with the animated version overlaid on hydration. Ensures visible content at T=4s regardless of JS load speed.

---

### Design Principles Scoring

#### Gestalt

| Principle | Application | Score |
|-----------|-------------|-------|
| **Proximity** | Eyebrow → H1 → Sub → CTAs: tight vertical stack with appropriate spacing. Metrics band separated by section boundary (correct grouping). | ✓ |
| **Similarity** | All dark sections use consistent `border border-slate-800/60` and `rounded-2xl` surface cards. Metrics band uses 4 identical metric cards. Tabbed features use consistent tab styling. | ✓ |
| **Continuity** | Full dark throughout creates seamless visual flow — no tonal interruption. Eye follows down without environmental distraction. | ✓ |
| **Closure** | Tabbed feature showcase: selected tab content enclosed in `rounded-2xl border border-slate-800` card. NEXUS preview enclosed in same treatment. Consistent closure signal. | ✓ |
| **Figure/Ground** | White text on slate-950: 20.1:1 — maximum contrast. Metric numbers in large type on dark card surfaces clearly read as figure. Tab content clearly separated from tab navigation. | ✓ |

**Gestalt Score: 10/10** — Full-dark environment creates the cleanest gestalt of all three concepts. No light/dark transition complexity. All five principles applied with maximum clarity.

#### Visual Hierarchy

Single-column centered layout with clear 4-level hierarchy:
1. H1 `CORTHEX` at `text-6xl/text-8xl font-bold` — unambiguous primary (Rams test: identifiable at blur-50%)
2. NEXUS animated org chart — secondary visual mass
3. Dual CTAs — tertiary action affordance
4. JetBrains Mono eyebrow — supporting category signal

**Score: 10/10** — The brand-mark-first hierarchy (`CORTHEX` as H1) is the boldest and clearest of the three concepts. Deliberately prioritizes brand recognition over descriptive copy — correct for a product with a distinctive name and visual identity.

#### Golden Ratio

Hero content `max-w-5xl` (1024px) on 1440px viewport: 1024/1440 = 0.711. Slightly wider than Concept A's golden-ratio-compliant 0.622. The wider column accommodates the large H1 and org chart visual without compression.

Metrics band: 4 equal-width metric cards. 4-column grid approximates a 1:1:1:1 division — not golden ratio but intentionally symmetric for data presentation. Exception justified: metrics must be equidistant to avoid implying relative importance.

Typography: `text-6xl/text-8xl` H1, `text-2xl/text-3xl` sub = 2.67–2.95:1 ratio. Aggressive but intentional — brand mark vs. descriptor.

**Score: 7/10** — Hero proportions reasonable but not golden-ratio-optimized. Metrics band equal-division exception is justified.

#### Contrast

Same dark palette as Concepts A/B. Full dark throughout means consistent high contrast in all sections.

**One concern:** `zinc-900` sections (concept uses zinc-900 for alternating dark sections): `text-white` on `zinc-900` (#18181B) = 18.1:1 ✅ AAA. `text-slate-500` on `zinc-900` = 2.9:1 — **FAIL on body text** if any body text uses `slate-500` on `zinc-900` sections. Must use minimum `slate-400` on zinc-900.

**Score: 9/10** — Minor risk on zinc-900 body text. Easily corrected by avoiding slate-500 on zinc backgrounds.

#### White Space

Full-dark sections create a challenge: dark-on-dark surfaces require extra white space to maintain separation. The metrics band (`h=160px`) with 4 metric cards in `gap-6` spacing achieves this. Tab section needs explicit `py-16` minimum per section.

Architecture flow section (`h=600px`) with animated SVG path: sufficient breathing room if center-focused with `max-w-3xl mx-auto`.

**Score: 8/10** — Full-dark requires more aggressive padding than light sections. Current spec `py-24` section padding is correct but needs consistent application across all dark alternating sections.

#### Unity

Full-dark throughout is the ultimate unity choice — no tonal variation breaks the systematic design. All sections share:
- `border border-slate-800/60` surface cards
- `rounded-2xl` radius
- `text-slate-400` body text
- `cyan-400` CTAs throughout
- `slate-950 / zinc-900 / slate-900` three-surface alternation

JetBrains Mono eyebrow is the only typographic contrast — and it's correctly applied only in the technical context (product category description).

**Score: 10/10** — Best unity score of all three concepts. Full-dark is architecturally simpler to keep consistent.

**Design Principles Total: 54/60**

---

### UX Deep Dive

#### Scroll Flow

```
Section 1: HERO [slate-950, 100vh]
  Engagement: ★★★★★ — full-dark premium signal + animated org chart
  Risk: animation load latency

Section 2: METRICS BAND [slate-900, 160px]
  Engagement: ★★★★★ — count-up animation on scroll entry
  Driver: "29→∞" differentiator immediately quantified
  Risk: metrics must be real (placeholder data destroys credibility)

Section 3: TABBED FEATURES [zinc-900, auto]
  Engagement: ★★★★☆ — interactive tab switching reduces scroll commitment
  Driver: 4 features explored without leaving viewport
  Risk: tab interaction requires CSS/JS — ensure keyboard-navigable

Section 4: ARCHITECTURE [slate-950, 600px]
  Engagement: ★★★☆☆ — technical users love this; CEOs may skip
  Driver: SVG path animation clarifies the execution flow visually
  Risk: "how it works" section is highest drop-off point in enterprise SaaS research

Section 5: SOCIAL PROOF [slate-900, auto]
  Engagement: ★★★★☆ — dark-card testimonials feel premium and credible
  Driver: Korean-language quotes from recognizable organization types

Section 6: FINAL CTA [gradient indigo-950→slate-950, 320px]
  Engagement: ★★★★☆ — gradient creates visual energy without color inconsistency
  Driver: Two-path CTA again (self-serve + enterprise)
```

**Scroll flow advantage:** Tabbed feature section (Section 3) prevents the "death by feature scroll" problem in Concepts A and B (3 separate deep-dive sections). Users can explore all 4 product areas without scrolling — reducing bounce rate for engaged visitors who don't scroll far.

**Scroll flow risk:** Architecture section (Section 4) is a risk. Technical users value it; executive buyers often don't. Consider making this section collapsible or replacing it with a customer-facing "how it works in 3 steps" visual.

#### CTA Placement

**Advantage:** All CTAs use consistent `bg-cyan-400 text-slate-950` on dark backgrounds throughout — no light-body contrast problem that affects Concept A. Every CTA passes WCAG AAA on every dark surface.

| CTA | Location | Score |
|-----|----------|-------|
| "무료로 시작하기" + "영업팀 문의" | Hero (primary pair) | ✅ Optimal |
| "체험 시작 ▶" | Sticky nav | ✅ Persistent |
| "로그인" | Sticky nav | ✅ Persistent |
| "무료로 시작하기" + "엔터프라이즈 문의" | Final CTA | ✅ Correct |

#### Login/Signup Integration

Nav-only, same as Concept A. Sticky nav with `bg-slate-950/95 backdrop-blur-sm` is explicitly specified in the wireframe — this solves the sticky nav gap identified in Concept A.

#### Mobile Responsiveness

Single-column centered layout is the most mobile-friendly of the three concepts:
- H1 `text-6xl xl:text-8xl` → needs `text-4xl sm:text-5xl xl:text-8xl`
- Metrics band: `grid-cols-2 gap-4` on mobile (2×2 grid) from `grid-cols-4` on desktop
- Tabbed features: tabs become horizontal scroll on mobile (`overflow-x-auto`)
- Architecture flow: simplified static version on mobile (animation disabled via `@media (prefers-reduced-motion)`)

---

### React Implementation Spec

#### SVG Animated Org Chart — Critical Path

The animated NEXUS org chart in the hero is Concept C's highest-risk implementation element. Full SVG path animation requires:

```tsx
// Static fallback first (SSR-safe)
<div className="relative max-w-4xl mx-auto">
  {/* Static SVG — renders immediately, always visible */}
  <img
    src="/assets/nexus-static-preview.svg"
    alt="CORTHEX NEXUS 조직도 — AI 에이전트 노드와 핸드오프 체인"
    width={1200}
    height={525}
    fetchpriority="high"
    loading="eager"
    className="w-full h-auto"
  />

  {/* Animated overlay — loads after hydration */}
  <NexusAnimatedOverlay
    aria-hidden="true"
    className="absolute inset-0"
  />
</div>
```

**Animation implementation (CSS-only nodes, no JS for basic pulse):**
```css
@keyframes node-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.nexus-node-active {
  animation: node-pulse 3s ease-in-out infinite;
}

.nexus-edge {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: edge-draw 1.5s ease-out forwards;
  animation-delay: var(--edge-delay, 0ms);
}

@keyframes edge-draw {
  to { stroke-dashoffset: 0; }
}

/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  .nexus-node-active { animation: none; opacity: 1; }
  .nexus-edge { stroke-dashoffset: 0; animation: none; }
}
```

#### Metrics Count-Up Animation

```tsx
// IntersectionObserver-triggered count-up
const useCountUp = (target: number, duration = 800) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      const start = performance.now()
      const step = (now: number) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        setCount(Math.floor(progress * target))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
      observer.disconnect()
    }, { threshold: 0.5 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}
```

#### SEO Considerations

Full-dark landing page has the same SEO requirements as Concept A. **One additional consideration:** The JetBrains Mono eyebrow text ("AI 에이전트 · 부서 관리 · 조직 지휘") is keyword-rich — ensure it renders as actual text in the DOM (`<span>` or `<p>`), not as an image or canvas element.

**Robots.txt:** Ensure the `/` landing page is crawlable (it is by default; confirm `robots.txt` doesn't block it).

#### Performance Budget

| Element | Risk | Mitigation |
|---------|------|------------|
| SVG org chart animation | JS-dependent → blank on slow connections | Static SVG fallback first |
| Metrics count-up | Requires IntersectionObserver | Lightweight, no library needed |
| Tab switching | CSS class toggle → zero layout shift | Pure CSS with `:checked` pseudo-class if possible |
| Architecture SVG path | `stroke-dashoffset` animation → GPU-composited | ✅ No layout shift, GPU layer |
| Full-dark sections | No image LCP → text LCP → fast | ✅ Advantage vs. Concept A |

**LCP:** No large hero image (similar to Concept B). LCP element = H1 text. Expected LCP < 1.5s on standard connection. **Best LCP of all three concepts** if no large images in hero.

**CLS risk:** Count-up animation should use `tabular-nums` and fixed-width number containers to prevent layout shift as numbers increment:
```tsx
<span className="font-mono tabular-nums text-4xl font-bold text-white min-w-[120px] inline-block text-center">
  {count.toLocaleString()}+
</span>
```

---

### Concept C — Final Scoring

| Dimension | Max | Score | Notes |
|-----------|-----|-------|-------|
| **Vision Alignment** | 10 | 10 | Purest Sovereign Sage expression. "29→∞" differentiator quantified. Full-dark matches app aesthetic. Strongest archetype alignment. |
| **UX** | 10 | 8 | Tabbed features prevent scroll fatigue. Sticky nav specified. Architecture section is drop-off risk. Full-dark may reduce cold trust for some visitor segments. |
| **Design Principles** | 10 | 9 | Gestalt perfect. Hierarchy best of three. Full unity. One minor: zinc-900 body text contrast edge case. |
| **Feasibility** | 10 | 7 | Animated SVG org chart adds complexity. Tab component needs keyboard navigation. Architecture animation adds scope. Moderate-high implementation effort. |
| **Performance** | 10 | 9 | Text LCP (fastest). SVG animation: CSS-only for base, JS for enhanced. Count-up: lightweight. One risk: if org chart SVG is > 200KB inline. |
| **Accessibility** | 10 | 8 | Full-dark eliminates light-section contrast ambiguity. Tab component must be ARIA-compliant (`role="tablist"`, `aria-selected`, keyboard navigation). Animated SVG needs `aria-hidden="true"`. `prefers-reduced-motion` required. |
| **Total** | 60 | **51/60** | |

---

## Comparative Analysis

### Score Summary

| Concept | Vision | UX | Principles | Feasibility | Performance | A11y | **Total** |
|---------|--------|----|-----------:|-------------|-------------|------|-----------|
| **A — Command Bridge** | 9 | 8 | 9 | 10 | 9 | 8 | **53/60** |
| **B — Embedded Authority** | 6 | 7 | 7 | 7 | 8 | 7 | **42/60** |
| **C — Data Intelligence** | 10 | 8 | 9 | 7 | 9 | 8 | **51/60** |

### Decision Rationale

**Concept A wins overall (53/60)** — but with a significant caveat.

**Why A beats C (53 vs. 51):**
- A's perfect **feasibility score (10/10)** vs. C's moderate-high complexity (7/10) is the deciding factor
- CORTHEX's primary implementation path (Google Stitch → React generation) favors structurally simple, well-described layouts
- A SVG-animated org chart with tab interactions and count-up animations adds 3 implementation variables that could delay Phase 7 integration
- A's NEXUS screenshot achieves the same product differentiation signal with zero animation complexity

**Why C should be seriously reconsidered:**
- Vision alignment score of 10/10 vs. A's 9/10 is meaningful
- C's full-dark avoids the CTA contrast problem on light body sections (Concept A's critical gap)
- C's sticky nav solves the return-visitor login problem that A leaves underspecified
- The Phase 0 "light landing" decision was a default, not a researched mandate — C provides the strongest case for reconsideration

**Why B is not recommended:**
- The weakest score across all dimensions (42/60)
- The embedded auth card is a sophisticated technique that requires precise visitor-type matching (cold vs. warm traffic)
- Without A/B test data on CORTHEX's actual traffic split, implementing B carries conversion risk
- **Exception:** B's auth card pattern should be the design basis for the dedicated `/login` page regardless of which landing concept is chosen

### Open Questions for Phase 2 Decision

1. **Phase 0 override on dark landing?** Concept C's full-dark case is strong. Requires explicit decision from design lead.
2. **Real NEXUS screenshot available?** If yes, Concept A's hero visual is ready. If not, fallback to SVG illustration — complexity increases.
3. **Traffic profile:** What % of landing visitors are expected to be warm (returning) vs. cold (first visit)? Higher warm % → favors B's embedded auth.
4. **Stitch generation compatibility:** Does Google Stitch handle `backdrop-blur-xl` glassmorphism and CSS grid animations correctly? Verify before committing to Concept C's animated elements.

---

## Phase 2 Wireframing Directives

Regardless of which concept is selected, the following must be applied in Phase 2:

### Must-Fix Before Wireframe (Blocking)

1. **CTA on light body sections:** `bg-cyan-400` CTA text on `slate-50/white` background fails. Use `bg-slate-900 text-white` for body CTAs OR `bg-cyan-400 text-slate-950` only on dark backgrounds.
2. **Sticky nav:** Specify `scrollY > 80px → bg-slate-950/95 backdrop-blur-sm` transition for all three concepts.
3. **NEXUS hero asset:** Decision required — real screenshot (preferred), polished SVG composition, or static illustration? Defines LCP strategy.
4. **Focus-visible rings:** All interactive elements: `focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2` (Phase 1-3 critic correction).

### Recommended for Phase 2 Wireframe

1. Apply golden-ratio column proportions to Concept B if it proceeds (2:1 instead of 1:1)
2. Resolve final CTA band color: Concept A's `bg-indigo-950` vs. Concept C's `gradient indigo-950→slate-950`
3. Define NEXUS preview loading strategy (webp + LCP preload for Concepts A/C)
4. Specify mobile breakpoints for H1 font scaling (`text-4xl sm:text-5xl xl:text-7xl`)
5. Concept C: Define reduced-motion fallback for all animations

---

## Accessibility Summary (All Concepts)

| Issue | Concept | Fix |
|-------|---------|-----|
| Input `placeholder-slate-500` fails on `slate-800` (2.7:1) | B | Change to `placeholder-slate-400` |
| Primary CTA on light body: `bg-cyan-400` on `slate-50` fails (1.27:1) | A | Use dark CTA in body sections |
| Tab component: no ARIA roles | C | Add `role="tablist"`, `aria-selected`, keyboard nav |
| Animated SVG: no `aria-hidden` | C | `aria-hidden="true"` on decorative animation |
| SVG org chart: no alt text | A, C | Provide descriptive alt on static version |
| `prefers-reduced-motion` not specified | C | CSS `@media` + JS check required |
| Focus-visible rings missing | All | `focus-visible:ring-2 focus-visible:ring-cyan-400` on all interactive |

---

_Phase 2 Analysis complete. Recommended: Concept A (implementation priority) with Concept C as design-direction alternative pending Phase 0 override decision on full-dark landing._

_Next step: Phase 2 Wireframing — full-page pixel-accurate wireframe of selected concept._
