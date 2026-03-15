# CORTHEX Landing Page Research
**Phase 1 — Landing Page Reference Research**
**Date:** 2026-03-15
**Researcher:** UXUI Redesign Writer

---

## Research Scope

Surveyed 10+ real AI/SaaS/Enterprise landing pages (2025–2026).
Sources: direct page fetch, evilmartians.com 100-page study, SaaSFrame, Awwwards, Saaspo.

---

## Part 1 — Reference Survey

### Category A: AI Research Products

#### 1. Anthropic (anthropic.com)
- **Hero Pattern:** Centered, single-column. White/light background. Large serif-weight sans headline.
- **Headline:** "AI research and products that put safety at the frontier"
- **Subtext:** Mission statement (public benefit corp)
- **CTA Primary:** "Try Claude" → claude.ai
- **CTA Secondary:** "Log in to Claude" + "Download app" (in nav)
- **Background:** Clean white, no gradients, no particles
- **Scroll Sections:** Featured content block → Latest releases → Company values → Footer
- **Login Integration:** Nav-level only (not hero-embedded)
- **Color Mood:** Warm neutral base, coral-orange accent (#CC785C), editorial feel
- **Typography:** Custom sans (geometric), generous leading, editorial whitespace
- **Animation:** Subtle scroll reveals, minimal motion
- **Assessment:** Authority through restraint. Feels research/academic, not product-first.

#### 2. OpenAI (openai.com)
- **Hero Pattern:** Expansive dark hero, concise headline, immersive gradient/video
- **Color Mood:** Deep navy + off-white + vivid blue accents
- **CTA:** Sticky nav CTAs, frequent yet unobtrusive
- **Typography:** Bold geometric sans, strong hierarchy
- **Animation:** Smooth scroll reveals, micro-interactions on hover
- **Login Integration:** Persistent in nav, hero has "Try" CTA
- **Assessment:** Premium dark tech. Product-first. Clear authority signal.

---

### Category B: Developer Tool SaaS

#### 3. Vercel (vercel.com)
- **Hero Pattern:** Centered, stacked layout. Dark/light dual mode.
- **Headline:** "Build and deploy on the AI Cloud."
- **Subtext:** "developer tools and cloud infrastructure..."
- **CTA Primary:** "Deploy" → /new
- **CTA Secondary:** "Get a Demo" → /contact/sales/demo
- **Background:** Supports both `light-theme` and `dark-theme` CSS classes
- **Typography:** **Inter** font family (same as Phase 0 decision ✓) + Inter Mono
- **Background Assets:** SVG illustrations (runway, leonardo-ai themes), separate light/dark versions
- **Scroll Sections:** Customer results with metrics → Framework integrations → Enterprise features
- **Login Integration:** Nav top-right, no hero embedding
- **Color Mood:** High-contrast, technical, confident black/white with color accents
- **Animation:** Scroll-triggered stat counters, subtle reveals
- **Assessment:** Best-in-class developer tool page. Inter font = shared DNA with CORTHEX.

#### 4. Linear (linear.app)
- **Hero Pattern:** Centered, dark background. Grid-based animations. Staggered entry.
- **Background:** Dark with dot-pattern grid, 3.2s keyframe animation loops
- **Typography:** Multi-level hierarchy (title-1 through title-9), monospace for code
- **Colors:** Dark primary, tertiary text palette (minimalist)
- **Animation:** Grid dots with opacity transitions, staggered keyframes (3.2s)
- **Hardware-aware:** JavaScript detects CPU cores → adjusts animation complexity
- **CTA:** Clean dual CTAs below headline
- **Login:** "logged-in" CSS state, seamless transition
- **Assessment:** Gold standard for precision SaaS. Mathematical grid = Swiss Style DNA.
  Figma community file with 50+ Linear-style sections available as reference.

---

### Category C: Enterprise SaaS

#### 5. Notion (notion.so)
- **Hero Pattern:** Story-driven. Visual demonstration of product value in hero.
- **CTA:** Benefit language over generic ("Get started" → specific)
- **Animation:** Workflow demonstrations, feature reveals on scroll
- **Assessment:** Narrative-driven, approachable. Less enterprise, more prosumer.

#### 6. Datadog (datadoghq.com)
- **Hero Pattern:** Enterprise-authoritative. Data-forward visual hierarchy.
- **Background:** Available in dark mode (separate dark redesign project)
- **Landing Page Redesign:** Systematic brand refresh — cleaner hierarchy, less noise
- **Assessment:** Enterprise trust. Data density over emotion.

#### 7. Weights & Biases / WandB (wandb.ai)
- **Hero Pattern:** Graphical background (hero-bg.png), content centered
- **Background:** Deep charcoal `#1A1C1F` — close to slate-950 in Phase 0 ✓
- **Accent:** Cyan/teal `#00AFC2` + golden yellow gradient `#FFCC33→#FFAD33`
- **CTA Primary:** Gradient button (cyan `#10BFCC → #0097AB`), uppercase, 600 weight
- **CTA Padding:** 21px × 35px, border-radius 8px
- **CTA Secondary:** Outline style, 1px border
- **Container:** Max-width 1392px
- **Typography:** Source Sans 3 + Source Serif 4
- **Sections:** Alternate between `#1A1C1F` and `#282A2F`
- **Animation:** Icon color transitions 0.3s on hover
- **Assessment:** Pure dark enterprise AI. Closest to CORTHEX's dark app aesthetic.

---

### Category D: Auth / Login UI References

#### 8. Clerk (clerk.com)
- **Hero Pattern:** Centered, light hero (bg-gray-50). Full viewport height.
- **Headline:** "More than authentication, Complete User Management"
- **CTA:** "Start building for free" × 2 (nav + hero body)
- **Background Effects:**
  - Circuit-bento image (70% opacity, blend-overlay)
  - **Animated meteor effect** (4 SVG paths, 1500–2300ms intervals)
  - SVG circuit line patterns absolutely positioned
- **Auth UI Showcase:** Embedded sign-in/sign-up form previews in hero right-side
- **Theme:** Light primary with dark mode toggle support
- **Color:** bg-gray-50 base, dark overlay creates depth
- **Assessment:** Best reference for login-integrated hero. Auth UI as product showcase.

#### 9. Supabase (supabase.com)
- **Auth flow:** Clean, dark-branded, minimal friction
- **Assessment:** Login page best practices — single input focus, social auth prominent.

---

### Category E: Awwwards Notable

#### 10. Nisa AI Chatbot Landing Page (Awwwards Honorable Mention)
- **Theme:** Light primary (`#F8F8F8`), dark mode inverts to `#121212`
- **Accent:** Vibrant orange `#FA5D29` for CTAs
- **Typography:** "Inter Tight" variable weight 300–800
- **Heading Scale:** Fluid clamp() — `clamp(42px, -3.07px + 9.01vw, 170px)` for H1
- **Animations:** Smooth scrolling, 0.3s standard transitions, gradient hover on links
- **Sticky header:** slides down on scroll (`.show` class at `-80px → 0`)
- **Spacing:** `margin-bottom: clamp(50px, 20vw, 200px)` — fluid section breathing
- **Assessment:** Award-level fluid typography + generous breathing room pattern.

---

## Part 2 — Industry Pattern Analysis

### Pattern: The 2025 Hero Formula (100+ devtool pages studied)

**Dominant Structure:**
```
[Sticky Nav: Logo | Links | Login | CTA Button]
[Hero: Centered Headline + Supporting Graphic + Dual CTAs]
[Trust Block: Logos or Metrics]
[Feature Blocks: Problem-oriented storytelling]
[Social Proof: Testimonials]
[Supporting: FAQ / Pricing / Comparisons]
[Final CTA: Full-width, visually distinct]
```

**Hero Visual Element Types (ranked by effectiveness):**
1. Animated product UI — shows functionality, most engaging
2. Static product UI — faster load, still converts
3. Switchable multiple UIs — multi-use-case products
4. Live product embeds — narrow-scope tools
5. Code snippets — infra/library products
6. Abstract illustrations — pre-launch only

**CTA Best Practices:**
- Two CTAs in hero: primary bold + secondary distinct (outlined / lighter)
- Avoid generic "Get started" → use specific ("Deploy now", "시작하기", "데모 요청")
- Final page CTA: full-width block, visually distinct from hero
- "No salesy BS" — direct, functional language wins

**Animation Budget (conservative, 2025 trend):**
- Scroll reveals: fade-up 150–200ms (standard)
- Micro-interactions: 0.3s on hover
- Grid/dot animations: 3.2s loops (Linear pattern)
- Avoid: parallax, particles, hero video, lottie (Phase 0 confirmed ✓)

---

## Part 3 — TOP 3 CORTHEX Landing Concepts

Scored against Phase 0 decisions:
- Light theme for landing (bg-white → bg-slate-50) with dark hero section ✓
- Inter display + Inter body ✓
- CTA: cyan-400 primary, indigo-700 hover ✓
- Conservative motion (no parallax/particles/video/lottie) ✓
- Sovereign Sage archetype: authoritative, intelligent, premium ✓
- Swiss International Style: grid-driven, type-first ✓

---

### Concept A — "The Command Bridge"
*Inspired by: Vercel + Linear | Archetype: Ruler (Authority)*

**Value Communication (<5 seconds):**
"AI 조직을 지휘하라" — Command your AI organization.
Headline above a live NEXUS canvas screenshot → immediate product understanding.

**Full Page Wireframe (ASCII):**
```
┌─────────────────────────────────────────────────────────────────┐
│  NAVBAR [h=64px]                                                │
│  [Logo: CORTHEX]  [기능] [가격] [문서]          [로그인] [시작하기▶] │
├─────────────────────────────────────────────────────────────────┤
│  HERO [h=100vh, bg=slate-950]                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────┐               │
│  │                                             │               │
│  │  [Label: "엔터프라이즈 AI 플랫폼"]              │               │
│  │                                             │               │
│  │  AI 조직을 설계하고,                           │               │
│  │  지휘하라.                                   │               │
│  │                                             │               │
│  │  [subtext: 부서·직원·AI 에이전트를 자유롭게...]   │               │
│  │                                             │               │
│  │  [무료로 시작하기 ▶]  [데모 요청]               │               │
│  │                                             │               │
│  └─────────────────────────────────────────────┘               │
│                                                                 │
│  ┌───────────── PRODUCT UI PREVIEW ─────────────┐              │
│  │  [NEXUS Canvas Screenshot / animated mockup] │  [h~=480px]  │
│  │  Shows dept hierarchy + agent nodes          │              │
│  └─────────────────────────────────────────────-┘              │
│                                                                 │
│  [↓ scroll indicator: "더 알아보기"]                              │
├─────────────────────────────────────────────────────────────────┤
│  TRUST BLOCK [h=120px, bg=slate-900]                           │
│  "신뢰하는 기업들" + [Logo Grid: 6 companies]                     │
├─────────────────────────────────────────────────────────────────┤
│  FEATURES [h=auto, bg=slate-50]  ← LIGHT BODY BEGINS          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Feature A    │  │ Feature B    │  │ Feature C    │         │
│  │ [Icon]       │  │ [Icon]       │  │ [Icon]       │         │
│  │ NEXUS 조직도  │  │ AI 에이전트   │  │ ARGOS 자동화  │         │
│  │ [desc]       │  │ [desc]       │  │ [desc]       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
├─────────────────────────────────────────────────────────────────┤
│  DEEP FEATURE [h=600px, bg=white]                              │
│  [Left: text + CTA]  [Right: animated Hub screenshot]          │
├─────────────────────────────────────────────────────────────────┤
│  DEEP FEATURE [h=600px, bg=slate-50] (alternating)            │
│  [Left: ARGOS mockup]  [Right: text]                           │
├─────────────────────────────────────────────────────────────────┤
│  SOCIAL PROOF [h=auto, bg=white]                               │
│  "고객 사례" → 3 testimonial cards                               │
├─────────────────────────────────────────────────────────────────┤
│  FINAL CTA [h=320px, bg=indigo-950]                            │
│  "지금 CORTHEX를 시작하세요"                                       │
│  [무료로 시작하기 ▶]  [영업팀 문의]                                 │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER [h=auto, bg=slate-950]                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Hero Section Specs:**
```tsx
// Hero container
<section className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden">

  {/* Subtle grid background — Linear-inspired */}
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]" />

  {/* Indigo radial glow — center accent */}
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-cyan-400/10 rounded-full blur-[120px] pointer-events-none" />

  {/* Content */}
  <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8">
      엔터프라이즈 AI 플랫폼
    </span>
    <h1 className="font-geist text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
      AI 조직을 설계하고,<br />지휘하라.
    </h1>
    <p className="text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
      부서·직원·AI 에이전트를 자유롭게 구성하고, NEXUS로 한눈에 지휘하세요.
    </p>
    <div className="flex items-center justify-center gap-4">
      <button className="px-6 py-3 bg-cyan-400 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-150 text-base">
        무료로 시작하기 →
      </button>
      <button className="px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-lg transition-colors duration-150 text-base">
        데모 요청
      </button>
    </div>
  </div>

  {/* Product UI Preview */}
  <div className="relative z-10 mt-20 max-w-5xl mx-auto px-6 w-full">
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/50 overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900">
        <div className="w-3 h-3 rounded-full bg-slate-700" />
        <div className="w-3 h-3 rounded-full bg-slate-700" />
        <div className="w-3 h-3 rounded-full bg-slate-700" />
      </div>
      {/* NEXUS screenshot placeholder */}
      <div className="aspect-[16/9] bg-slate-950 flex items-center justify-center text-slate-600">
        [NEXUS Canvas Screenshot]
      </div>
    </div>
  </div>
</section>
```

**CTA Button Specs:**
- Primary: `bg-cyan-400 hover:bg-indigo-700`, `px-6 py-3`, `rounded-lg`, `text-base font-semibold text-white`, `transition-colors duration-150`
- Secondary: `border border-slate-700 hover:border-slate-500`, `text-slate-300 hover:text-white`, same padding/radius

**Login Integration:** Nav top-right. "로그인" as ghost link, "시작하기" as primary button.
No hero-embedded login form (product-first approach).

**Scroll Sections:**
1. Trust logos (slate-950 → slate-900 transition): `opacity-0 → opacity-100` on scroll, 200ms
2. Feature cards (slate-50): fade-up on scroll entry, staggered 100ms between cards
3. Deep feature alternating (white ↔ slate-50): slide-in from respective sides, 200ms
4. Social proof (white): fade-up, no stagger needed
5. Final CTA (indigo-950): full-width, gradient from indigo-950 to indigo-900

**Color Mood:** Dark authority hero → clinical light body
- Hero: slate-950 + slate-800 surfaces + cyan-400 accent + white text
- Body: slate-50/white backgrounds + slate-900 text + cyan-400 CTAs

**Typography Pairing:**
- Hero H1: Inter, 72px/1.05, font-bold, tracking-tight, white
- Sub: Inter (fallback Inter), 20px/1.6, slate-400
- Feature titles: Inter, 28px, font-semibold, slate-900 (on light sections)
- Body: Inter, 16px/1.7, slate-600

**Section Mood Board (Frankenstein):**
- Hero grid pattern: Linear.app dot-grid
- Product UI preview frame: Vercel runway treatment (browser chrome)
- Radial glow: Linear.app indigo center glow
- Label badge: Vercel/Linear small pill label above headline
- Feature cards: Swiss grid, white bg, thin slate-200 border, icon top-left

**Pros:**
- NEXUS screenshot immediately communicates differentiation
- Dark hero signals enterprise premium instantly
- Light body increases readability / trust for long scroll
- Swiss grid alignment matches brand archetype

**Cons:**
- Hero height (100vh) creates initial scroll commitment
- Requires polished NEXUS screenshot (or illustration)
- No embedded login — may reduce direct conversion from landing

---

### Concept B — "The Embedded Authority"
*Inspired by: Clerk + Anthropic | Archetype: Sage (Trust through transparency)*

**Value Communication (<5 seconds):**
Logo + split hero: left (headline + value props), right (embedded login/signup form).
User can start immediately — no extra click required.

**Full Page Wireframe (ASCII):**
```
┌─────────────────────────────────────────────────────────────────┐
│  NAVBAR [h=64px, bg=white, border-b=slate-200]                 │
│  [Logo]  [제품] [가격] [블로그]                [로그인] [무료 체험 ▶]  │
├─────────────────────────────────────────────────────────────────┤
│  HERO [h=100vh, bg=slate-950]  ← SPLIT LAYOUT                  │
│  ┌──────────────────────┐  ┌───────────────────────────────┐   │
│  │  LEFT: TEXT [50%]    │  │  RIGHT: AUTH CARD [50%]       │   │
│  │                      │  │                               │   │
│  │  [eyebrow label]     │  │  ┌─────────────────────────┐ │   │
│  │                      │  │  │  CORTHEX 시작하기        │ │   │
│  │  AI 조직의             │  │  │                         │ │   │
│  │  새로운 기준.           │  │  │  [이메일 입력]            │ │   │
│  │                      │  │  │  [비밀번호 입력]           │ │   │
│  │  [feature list ×3]   │  │  │  [로그인 버튼 cyan-400] │ │   │
│  │  ✓ 자유로운 조직 설계    │  │  │                         │ │   │
│  │  ✓ AI 에이전트 허브     │  │  │  ───── 또는 ─────        │ │   │
│  │  ✓ ARGOS 자동화       │  │  │  [Google로 계속하기]       │ │   │
│  │                      │  │  │                         │ │   │
│  │  [데모 예약 →]         │  │  │  계정이 없으신가요?         │ │   │
│  │  (ghost/outline)     │  │  │  [회원가입 →]              │ │   │
│  │                      │  │  └─────────────────────────┘ │   │
│  └──────────────────────┘  └───────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  TRANSITION BAND [h=80px, bg=gradient slate-950→slate-50]      │
├─────────────────────────────────────────────────────────────────┤
│  TRUST BLOCK [h=120px, bg=slate-50]                           │
│  "글로벌 기업들이 신뢰합니다" + [6 company logos, slate-400]      │
├─────────────────────────────────────────────────────────────────┤
│  FEATURES [h=auto, bg=white]                                   │
│  [3-column card grid, fade-up on scroll]                       │
│  NEXUS 조직도 | AI 에이전트 관리 | ARGOS 크론                      │
├─────────────────────────────────────────────────────────────────┤
│  PRODUCT DEEP DIVE [h=700px, bg=slate-50]                     │
│  [Left 40%: text + steps]   [Right 60%: animated UI preview]  │
├─────────────────────────────────────────────────────────────────┤
│  TESTIMONIALS [h=auto, bg=white]                               │
│  3 cards — client logos + quotes + person                      │
├─────────────────────────────────────────────────────────────────┤
│  FINAL CTA [h=280px, bg=cyan-400]                            │
│  "지금 바로 시작하세요."                                           │
│  [무료 체험 ▶]   [팀 데모 예약]                                    │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER [h=auto, bg=slate-950]                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Hero Section Specs:**
```tsx
<section className="relative min-h-screen bg-slate-950 flex items-center overflow-hidden">

  {/* Subtle diagonal gradient accent */}
  <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-transparent to-transparent pointer-events-none" />

  {/* Vertical center line — Swiss grid reference */}
  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800" />

  <div className="relative z-10 max-w-7xl mx-auto px-8 grid grid-cols-2 gap-16 items-center min-h-screen">

    {/* Left: Value proposition */}
    <div>
      <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase mb-6 block">
        Enterprise AI Platform
      </span>
      <h1 className="font-geist text-5xl xl:text-6xl font-bold text-white leading-[1.08] tracking-tight mb-8">
        AI 조직의<br />새로운 기준.
      </h1>
      <ul className="space-y-4 mb-10">
        {features.map((f) => (
          <li className="flex items-center gap-3 text-slate-300 text-lg">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <Check className="w-3 h-3 text-cyan-400" />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <button className="px-5 py-2.5 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors duration-150">
        데모 예약 →
      </button>
    </div>

    {/* Right: Embedded auth card */}
    <div className="flex justify-center">
      <div className="w-full max-w-sm bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/60">
        <h2 className="font-geist text-xl font-semibold text-white mb-6">
          CORTHEX 시작하기
        </h2>
        <div className="space-y-4">
          <input className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors" placeholder="이메일" />
          <input type="password" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors" placeholder="비밀번호" />
          <button className="w-full py-3 bg-cyan-400 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-150">
            로그인
          </button>
        </div>
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-slate-600 text-xs">또는</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>
        <button className="w-full py-3 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors duration-150">
          Google로 계속하기
        </button>
        <p className="text-slate-600 text-xs text-center mt-6">
          계정이 없으신가요? <a className="text-cyan-400 hover:text-indigo-300" href="/signup">회원가입 →</a>
        </p>
      </div>
    </div>

  </div>
</section>
```

**CTA Button Specs (Auth Card):**
- Login primary: `bg-cyan-400 hover:bg-indigo-700`, `py-3 w-full`, `rounded-lg`, `font-semibold text-white`, `duration-150`
- Social auth: `border border-slate-700`, same height, `text-slate-300`

**Login Integration:** Login/signup form EMBEDDED in hero. Immediate conversion without redirect.
Secondary CTA "데모 예약" on left side for non-signup visitors.

**Scroll Sections:**
- Gradient transition band separates dark hero from light body
- Trust logos: instant opacity reveal (no animation, content-first)
- Features: 3-col grid, fade-up stagger 100ms, on scroll intersection
- Deep dive: slide-in from sides, 200ms ease-out
- Testimonials: fade-up, simultaneous

**Color Mood:** Dark authority split → gradient transition → clinical light body
- Hero left: slate-950, indigo-950 gradient hint, white headline
- Hero right auth card: slate-900 glassmorphism (backdrop-blur-xl, border slate-800)
- Transition: gradient band
- Body: white / slate-50 alternating

**Typography:**
- H1: Inter 56px/1.08, bold, white
- Eyebrow: 12px, tracking-widest, uppercase, cyan-400
- Feature list: Inter 18px, slate-300
- Auth card H2: Inter 20px, semibold, white

**Section Mood Board (Frankenstein):**
- Auth card glassmorphism: Phase 0 spec (backdrop-blur-xl bg-slate-900/80) ✓
- Split layout: Clerk.com hero reference
- Vertical divider: Swiss International Style structural line
- Transition gradient: WandB section alternation pattern adapted
- Feature checkmarks: Clerk.com feature list treatment

**Pros:**
- Zero-click friction to login — highest conversion potential
- Auth form immediately shows product quality
- Dark hero + embedded glassmorphism = premium enterprise signal
- Swiss vertical line creates strong compositional structure

**Cons:**
- Hero becomes "crowded" — text + form compete for attention
- Form in hero may feel presumptuous for cold visitors
- No product UI visible immediately (auth card blocks screenshot space)
- Requires careful mobile stacking (2-col → 1-col: form goes below text)

---

### Concept C — "The Data Intelligence"
*Inspired by: WandB + Vercel + Linear | Archetype: Sovereign Sage (pure dark)*

**Value Communication (<5 seconds):**
Full dark experience. Headline + animated agent-network visual in hero.
Communicates: "This is powerful infrastructure for serious organizations."

**Full Page Wireframe (ASCII):**
```
┌─────────────────────────────────────────────────────────────────┐
│  NAVBAR [h=64px, bg=slate-950/95 backdrop-blur]                 │
│  [Logo] [제품 ▾] [솔루션 ▾] [가격] [문서]      [로그인] [체험 시작 ▶] │
├─────────────────────────────────────────────────────────────────┤
│  HERO [h=100vh, bg=slate-950]  ← CENTERED                      │
│                                                                 │
│  [eyebrow: animated typing "AI 에이전트 · 부서 · 조직"]            │
│                                                                 │
│  ┌──────────────────────────────────────────────┐              │
│  │                                              │              │
│  │     CORTHEX                                  │              │
│  │     AI 조직 운영 플랫폼                         │              │
│  │                                              │              │
│  │  [무료로 시작하기 ▶]  [영업팀 문의]               │              │
│  │                                              │              │
│  │  [↓ animated agent-network canvas ~400px]   │              │
│  │  (simplified NEXUS org chart, slow pan)     │              │
│  │                                              │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  METRICS BAND [h=160px, bg=slate-900]                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  2,400+  │  │   98%    │  │  <200ms  │  │  29→∞    │      │
│  │ AI 세션   │  │ 가동률    │  │  API P95 │  │ 에이전트 수 │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  FEATURES [h=auto, bg=zinc-900]  ← STAYS DARK                 │
│  Tabbed feature showcase: [허브] [NEXUS] [ARGOS] [라이브러리]    │
│  [Left: tab menu]   [Right: feature screenshot w/ glow]        │
├─────────────────────────────────────────────────────────────────┤
│  ARCHITECTURE [h=600px, bg=slate-950]                           │
│  "어떻게 작동하나요?" — animated flow diagram                     │
│  [사용자] → [허브] → [에이전트] → [도구/API] → [결과]             │
├─────────────────────────────────────────────────────────────────┤
│  SOCIAL PROOF [h=auto, bg=slate-900]                           │
│  "도입 기업 사례" — 3 dark-card testimonials                     │
├─────────────────────────────────────────────────────────────────┤
│  FINAL CTA [h=320px, bg=gradient indigo-950→slate-950]         │
│  "조직의 AI를 지금 배치하세요."                                    │
│  [무료로 시작하기 ▶]  [엔터프라이즈 문의]                           │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER [h=auto, bg=slate-950, border-t=slate-800]              │
└─────────────────────────────────────────────────────────────────┘
```

**Hero Section Specs:**
```tsx
<section className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden">

  {/* Multi-layer radial glow */}
  <div className="absolute inset-0 pointer-events-none">
    {/* Primary indigo glow - center */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/8 rounded-full blur-[100px]" />
    {/* Secondary violet glow - offset */}
    <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-violet-600/6 rounded-full blur-[80px]" />
  </div>

  {/* Grid overlay */}
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:80px_80px]" />

  {/* Content */}
  <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

    {/* Animated eyebrow — typewriter effect */}
    <div className="font-mono text-sm text-cyan-400 tracking-wider mb-6 h-6">
      <span className="border-r border-cyan-400 pr-1 animate-pulse">
        AI 에이전트 · 부서 관리 · 조직 지휘
      </span>
    </div>

    <h1 className="font-geist text-6xl xl:text-8xl font-bold tracking-tight mb-4">
      <span className="text-white">CORTHEX</span>
    </h1>
    <p className="font-geist text-2xl xl:text-3xl font-medium text-slate-400 mb-10 tracking-wide">
      AI 조직 운영 플랫폼
    </p>

    <div className="flex items-center justify-center gap-4 mb-20">
      <button className="px-8 py-3.5 bg-cyan-400 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-150 text-base">
        무료로 시작하기 →
      </button>
      <button className="px-8 py-3.5 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 rounded-lg transition-colors duration-150 text-base">
        영업팀 문의
      </button>
    </div>

    {/* Agent network visual */}
    <div className="relative max-w-4xl mx-auto">
      {/* Fade gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent z-10" />
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm overflow-hidden shadow-2xl">
        <div className="aspect-[16/7] flex items-center justify-center text-slate-700 text-sm">
          [NEXUS Org Chart — animated SVG nodes with edges]
        </div>
      </div>
    </div>

  </div>
</section>
```

**CTA Button Specs:**
- Primary: `bg-cyan-400 hover:bg-indigo-700`, `px-8 py-3.5`, `rounded-lg`, `font-semibold text-white`, `duration-150`
- Secondary: `border border-slate-700 hover:border-slate-500`, `text-slate-400 hover:text-slate-200`, same size

**Login Integration:** Sticky nav "로그인" ghost link + "체험 시작" primary.
No embedded login — product screenshot takes priority. Login remains top-of-page persistent.

**Scroll Sections:**
- Metrics band: count-up animation on scroll entry (IntersectionObserver), 800ms easing
- Tabbed features: tab switch = instant, screenshot swap with 150ms fade
- Architecture flow: SVG path draw animation on scroll, 600ms, ease-in-out
- All sections stay dark (slate-950 ↔ zinc-900 ↔ slate-900 alternation)
- Final CTA: gradient indigo-950 → slate-950

**Color Mood:** Full dark — slate-950 primary, slate-900 surfaces, cyan-400 CTA throughout
- No light body sections (full dark experience)
- Accent glow: cyan-400/8 + violet-600/6 (layered, very subtle)
- Text: white headlines, slate-400 body, slate-700 borders

**Typography:**
- Brand mark H1: Inter 96px/1, font-bold, white
- Sub: Inter 28px, slate-400, tracking-wide
- Eyebrow: JetBrains Mono 14px, cyan-400, tracking-wider
- Body: Inter 16px, slate-500

**Section Mood Board (Frankenstein):**
- Grid overlay: Linear.app dot-grid adapted to larger 80px cells
- Multi-layer radial glow: WandB bg-image treatment adapted to CSS
- Metrics band: Vercel customer results section pattern
- Tabbed feature showcase: Amplitude immersive preview concept
- Architecture flow: Custom SVG draw animation
- Alternating dark sections: WandB #1A1C1F ↔ #282A2F pattern adapted

**Pros:**
- Full dark = maximum premium/enterprise signal
- Metrics band immediately establishes credibility
- Tabbed features = rich product exploration without page scroll
- Matches internal app aesthetic (seamless transition to actual product)
- JetBrains Mono eyebrow = technical credibility

**Cons:**
- No light sections = potentially fatiguing for long scroll
- Full dark is harder to read for non-technical visitors
- Diverges from Phase 0 decision (landing = light theme) — needs discussion
- Higher complexity to implement (SVG animation, tabs, metrics counter)

---

## Part 4 — CORTHEX-Specific Recommendations

### Login Integration Best Approach

**Recommended: Concept A (Nav-only) or Concept B (Hero-embedded)**

For CORTHEX, which serves enterprise/organizational buyers:
- **Cold visitors** (discovery): Need product education first → Concept A
- **Warm visitors** (referred/returning): Want immediate access → Concept B

**Hybrid option:** Concept A hero with sticky "로그인" in nav that transforms to full auth modal on click (Clerk.com pattern).

### Phase 0 Alignment Check

| Decision | Concept A | Concept B | Concept C |
|----------|-----------|-----------|-----------|
| Light theme for landing | ✓ (body) | ✓ (body) | ✗ (full dark) |
| Dark hero section | ✓ | ✓ | ✓ |
| cyan-400 CTA | ✓ | ✓ | ✓ |
| Inter display font | ✓ | ✓ | ✓ |
| Inter body | ✓ | ✓ | partial |
| Conservative motion | ✓ | ✓ | borderline |
| No parallax/particles | ✓ | ✓ | ✓ |
| Swiss grid structure | ✓ | ✓ | partial |

### Recommended Choice

**Concept A "The Command Bridge"** for Phase 1 implementation:
- Perfect Phase 0 alignment (dark hero → light body ✓)
- NEXUS screenshot = strongest differentiator visual
- Clean Swiss grid composition
- Conservative motion budget respected
- Login remains frictionless (nav-level) without cluttering hero
- Most implementation-friendly for Stitch/React generation

**Concept B** as alternative if conversion data supports hero-embedded auth.

---

## Sources

- [We studied 100 dev tool landing pages — Evil Martians](https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025)
- [10 SaaS Landing Page Trends for 2026 — SaaSFrame](https://www.saasframe.io/blog/10-saas-landing-page-trends-for-2026-with-real-examples)
- [Vercel.com](https://vercel.com) — Inter font, dual-mode hero
- [Linear.app](https://linear.app) — grid animation, typography hierarchy
- [Clerk.com](https://clerk.com) — auth-embedded hero, meteor effects
- [WandB (wandb.ai)](https://wandb.ai/site/) — enterprise dark, #1A1C1F palette
- [Anthropic.com](https://www.anthropic.com/) — editorial restraint pattern
- [Nisa AI — Awwwards HM](https://www.awwwards.com/sites/nisa-ai-chatbot-landing-page) — fluid typography
- [Best SaaS Hero Examples — Draftss](https://draftss.com/best-saas-hero-examples/)
- [219 AI SaaS Landing Pages — Saaspo](https://saaspo.com/industry/ai-saas-websites-inspiration)
- [Top 21 SaaS Landing Pages 2025 — Alpha Design Global](https://medium.com/@alphadesignglobal/top-21-saas-landing-pages-2025-ee6e93705f74)
