# Phase 1-3: Landing Page Research

**Date**: 2026-03-12
**Step**: Phase 1 — Research, Step 1-3
**Status**: Round 1 Draft
**Scope**: CORTHEX public marketing landing page — seen by unauthenticated visitors BEFORE login. Desktop-first (min 1280px), dark-first, converts CEO/admin visitors to trial/demo. Includes login/signup integration.
**Output**: Landing page reference analysis + TOP 3 layout options for CORTHEX

---

## CORTHEX Landing Page Constraints

| Constraint | Value |
|------------|-------|
| Target audience | 김대표 (CEO/decision maker) and 이팀장 (Company Admin) |
| Page purpose | Pre-login marketing + auth entry point (NOT the post-login home) |
| Route | New public page — unauthenticated visitors land here. Authenticated users auto-skip to `/hub` |
| Primary CTA | `무료 체험 시작 →` → goes to `/login` or opens login modal |
| Secondary CTA | `데모 신청` → contact/demo form |
| Viewport | Desktop-first: min 1280px. Mobile: scrollable (no interactive demo) |
| Dark mode | First-class. `bg-zinc-950` (`#09090b`) primary surface |
| Font | Work Sans (Google Fonts) |
| Accent | `bg-indigo-600` / `#4F46E5` |
| Tagline | "조직도를 그리면 AI 팀이 움직인다." |
| Brand position | Military Precision × AI Intelligence — NOT a chatbot, NOT playful |
| Core differentiator | Dynamic org chart (NEXUS canvas) → AI team auto-activates |
| Auth system | JWT, username + password. No OAuth. Routes: `/login`, `/signup` if added |
| Onboarding | ⚠️ DEFERRED — do NOT design onboarding flow |
| Admin app | Separate SPA (`/admin`) — NOT referenced on public landing page |
| Time to value prop | ≤5 seconds. Visitor must understand CORTHEX's core value before first scroll |

### Route Architecture (Pre vs Post Login)

```
Unauthenticated visitor:
  https://corthex.io/ → [LANDING PAGE] (this document)
  → CTA: "무료 체험" → /login
  → CTA: "데모 신청" → contact form / external
  → Already have account? → /login

Authenticated user (JWT present):
  https://corthex.io/ → redirect → /hub  (bypasses landing page)

Tech spec note: Current spec has / = post-login home (퀵스타트 링크 + recent activity).
Redesign introduces public landing page at / for unauthenticated, with auth guard redirecting
authenticated users directly to /hub.
```

### CORTHEX Feature Priority for Landing Page
| Priority | Section | Content | ≤5s rule |
|----------|---------|---------|----------|
| P0 | Hero | Tagline + product visual (NEXUS canvas) + 2 CTAs | ✅ Must communicate in hero |
| P0 | Auth integration | Login entry point visible from hero | ✅ Nav + CTA |
| P1 | How It Works | 3 steps: Draw → Deploy → Watch | After first scroll |
| P1 | Hub Feature | Chat + Tracker + 3-column layout | Feature section |
| P1 | NEXUS Feature | Drag org chart → agents activate | Feature section |
| P2 | AGORA + ARGOS | AI debate + cron scheduler | Supporting features |
| P2 | Social proof | Metrics + testimonials | Mid-page |
| P2 | Pricing | 3 tiers (Starter / Business / Enterprise) | Near CTA |
| P3 | Dashboard | Cost analytics, agent status | Lower features |
| P3 | Library | Knowledge management | Lower features |

---

## Part 1: Reference Products — 9 Analyzed

---

### 1. Linear

**URL**: https://linear.app
**Source**: Direct observation — https://linear.app

**Hero Pattern**:
```
┌─────────────────────────────────────────────────────────┐
│  Logo  Product  Enterprise  Pricing  Changelog  Sign In  [Get started free] │ ← sticky nav
├─────────────────────────────────────────────────────────┤
│                                                         │
│  "Linear — The system for product development"         │ ← h1, centered
│  [Get started free]  [Log in]                          │ ← 2 CTAs
│  [Product screenshot with animated dot grid bg]        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Login integration**: "Sign In" in top nav (always visible). "Get started free" → separate signup page. No modal, no inline form.

**Animation**: 5×5 animated dot grid (`opacity` 0.3→1.0 at 3200ms stagger). Headlines: `translateY` word-stagger 80ms/word. `prefers-reduced-motion`: all disabled.

**Color**: `#111111` near-black bg. Cream text. No single accent color — subtle.

**What works for CORTHEX**: "Sign In" always in nav = user always knows how to log in. Dot grid animation = CORTHEX radar/military aesthetic. Left-aligned enterprise copy.

---

### 2. Cursor

**URL**: https://cursor.com
**Source**: Direct observation — https://cursor.com

**Hero Pattern**:
```
┌─────────────────────────────────────────────────────────┐
│  Logo  [Product▾] Enterprise  Pricing  [Resources▾]  Sign in  Download │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  "Built to make you extraordinarily productive,        │ ← h1
│   Cursor is the best way to code with AI."             │
│  [Download for macOS]  [Try mobile agent]              │ ← primary + secondary
│                                                         │
│  [Live IDE demo — fills viewport width]                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Login integration**: "Sign in" in nav only. Primary CTA = download action (no login step for first conversion).

**Trust placement**: Logo wall (Stripe, OpenAI, Linear, Nvidia, Figma) immediately below hero.

**What works for CORTHEX**: Trust logos directly below hero. Alternating feature sections with sticky left label. 6 named testimonials.

---

### 3. Vercel

**URL**: https://vercel.com
**Source**: Direct observation — https://vercel.com

**Hero Pattern**:
```
┌─────────────────────────────────────────────────────────┐
│  Logo  [Product▾] [Solutions▾] Enterprise Pricing Docs  [Deploy] [Get Demo] │ ← sticky, 2 CTAs in nav
├─────────────────────────────────────────────────────────┤
│                                                         │
│  "Build and deploy on the AI Cloud."                   │ ← h1
│  [developer tools and cloud infrastructure copy...]    │
│  [Deploy]  [Get a Demo]                                │ ← 2 CTAs in hero
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Login integration**: "Deploy" CTA → auth check → dashboard if logged in, signup if not. No separate "Login" link visible in nav — auth is embedded in the CTA action.

**Metrics rail**: Concrete numbers BEFORE logo wall (`7m → 40s` build time, `95%` load improvement, `24x` faster).

**What works for CORTHEX**: CTA-embedded auth (clicking "무료 체험" takes you to login). Metrics first, logos second. Always-visible CTA in sticky nav.

---

### 4. Anthropic

**URL**: https://anthropic.com
**Source**: Direct observation — https://anthropic.com

**Hero Pattern**:
```
┌─────────────────────────────────────────────────────────┐
│  Logo  Research  Economic Futures  Commitments  News  [Claude▾] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  "AI research and products that put safety              │ ← h1, large, centered
│   at the frontier"                                     │
│  [body text — mission statement]                        │
│  [Try Claude]                                          │ ← single CTA
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Login integration**: No login on homepage. Single CTA "Try Claude" → claude.ai (separate app). Company site = research/credibility, product = separate URL.

**Color**: `bg-zinc-950`-equivalent `#131314`. Cream `#faf9f0` text. Rust accent `#d97757`.

**Animation**: GSAP ScrollTrigger parallax. Word-by-word headline stagger. Logo marquee (pause on hover). All `prefers-reduced-motion` disabled.

**What works for CORTHEX**: Mission statement as trust-builder. Dark `#131314` matches `bg-zinc-950`. Single focused CTA. Word-stagger headline entrance = premium.

---

### 5. CrewAI

**URL**: https://crewai.com
**Source**: Direct observation — https://crewai.com

**Hero Pattern**:
```
┌─────────────────────────────────────────────────────────┐
│  Logo  [Product▾] Pricing Blog Docs Enterprise  Login   │
├─────────────────────────────────────────────────────────┤
│  "Accelerate AI agent adoption"                        │ ← h1
│  "start delivering production value"                   │
│  "teams of AI agents autonomously, reliably..."        │ ← subheadline
│  [Build a crew]  [Meet with us]  [Request a demo]      │ ← 3 CTAs: self-serve + enterprise + demo
└─────────────────────────────────────────────────────────┘
```

**Login integration**: "Login" in nav (always visible). "Build a crew" → app/signup (implicit). 3-CTA model = 3 buyer stages.

**Growth metrics** (mid-page after trust established): `450M+` workflows, `60%` Fortune 500, `4K+` signups/week.

**Case studies**: DocuSign, IBM, PwC — named enterprise brands = strongest B2B trust signal.

**What works for CORTHEX**: AI agent team framing closest to CORTHEX positioning. 3-CTA model for self-serve vs enterprise. Login in nav.

---

### 6. Notion

**URL**: https://notion.com
**Source**: Direct observation — https://notion.com

**Hero Pattern**:
```
┌─────────────────────────────────────────────────────────┐
│  Logo  [Product▾] Download Teams Enterprise Pricing  Login  [Try Notion free] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  "One workspace. Zero busywork."                       │ ← h1 (short, punchy)
│  "Now a team of 7 feels like 70."                      │ ← subheadline (aspirational metric)
│  [Get Notion free]  [Request a demo]                   │
│  [Hero video — autoplay muted]                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Login integration**: "Login" in nav (persistent). "Get Notion free" → new user signup flow.

**Bento grid** (2×2 with accent colors per card): Custom Agents `teal` | Enterprise Search `red` | AI Meeting Notes `blue` | Flexible Workflows `yellow`.

**What works for CORTHEX**: "A team of 7 feels like 70" → CORTHEX analog: "혼자서도 50인 팀처럼". Bento grid for 4-feature showcase. Aspirational ROI in subheadline.

---

### 7. Supabase

**URL**: https://supabase.com
**Source**: Direct observation — https://supabase.com

**Hero Pattern**:
```
┌─────────────────────────────────────────────────────────┐
│  Logo  Product  Docs  Pricing  Blog  GitHub(98.9K⭐)  [Sign in]  [Start your project] │
├─────────────────────────────────────────────────────────┤
│  "Build in a weekend, Scale to millions"               │ ← h1
│  "Supabase is the Postgres development platform..."    │
│  [Start your project]  [Request a demo]                │
│  → [Start your project] goes to dashboard.supabase.com │
└─────────────────────────────────────────────────────────┘
```

**Login integration**: "Sign in" in nav. Primary CTA → external dashboard (separate subdomain). No modal, no inline form.

**98.9K GitHub stars** displayed in nav = social proof baked into navigation.

**7-feature modular cards**: Database | Auth | Edge Functions | Storage | Realtime | Vector | Data APIs — each is a standalone value.

**What works for CORTHEX**: "Sign in" vs "Start" in nav (two paths for existing vs new users). Modular feature cards. Credibility metric in nav (GitHub stars → CORTHEX: customer count badge).

---

### 8. Loom

**URL**: https://loom.com
**Source**: Direct observation — https://loom.com

**Login integration**: "Sign in" in nav. "Get Loom for free" → signup. Single CTA with free-tier emphasis.

**Pattern**: Hero video (autoplay muted) → logo wall → "How it Works" → feature modules (3 rows) → security section → use cases by role → testimonials → enterprise → final CTA.

**Final CTA section**: Full-width dark section before footer — repeats primary CTA. Captures late-scroll conversions. `bg-[#1a1a2e]` dark blue, white text.

**What works for CORTHEX**: Security/enterprise section pattern (B2B trust). Role-based use cases (CEO / Team Lead / Employee). Final CTA scroll termination.

---

### 9. Stripe

**URL**: https://stripe.com
**Source**: Direct observation — https://stripe.com

**Hero Pattern**:
```
┌─────────────────────────────────────────────────────────┐
│  Logo  Products Solutions Developers Resources Pricing  [Contact sales]  [Start now] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  "Financial infrastructure to grow your revenue"       │ ← h1, LEFT-ALIGNED (not centered)
│  "Millions of companies of all sizes use Stripe..."    │
│  [Start now]  [Contact sales]                          │
│                                                         │
│  [Product screenshot with linear gradient bg]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Login integration**: No "Login" in top nav on marketing site. "Start now" → stripe.com/register (implicit auth). Separate `dashboard.stripe.com` for logged-in users.

**What works for CORTHEX**: Left-aligned hero copy = editorial authority. "Contact Sales" always visible in nav = enterprise signal. Gradient `bg-[linear-gradient(135deg,#6772e5_0%,#00d4ff_100%)]` behind product screenshot.

---

## Part 2: Cross-Reference Analysis

### Navigation + Auth Pattern Comparison

| Product | Login link in nav | Primary CTA type | Auth pattern |
|---------|------------------|-----------------|--------------|
| Linear | "Sign In" (nav) | "Get started free" → signup page | Separate page |
| Cursor | "Sign in" (nav) | Download (no auth step) | Nav only |
| Vercel | Embedded in CTA | "Deploy" → auth check | CTA-embedded |
| Anthropic | None | "Try Claude" → separate app | Separate subdomain |
| CrewAI | "Login" (nav) | "Build a crew" → signup | Nav + CTA |
| Notion | "Login" (nav) | "Try Notion free" → signup | Nav + CTA |
| Supabase | "Sign in" (nav) | "Start your project" → dashboard | Nav + CTA |
| Loom | "Sign in" (nav) | "Get Loom for free" → signup | Nav + CTA |
| Stripe | Hidden (separate subdomain) | "Start now" → register | CTA-embedded |
| **CORTHEX target** | **"로그인" (nav) + modal option** | **"무료 체험" → /login or modal** | **Nav + CTA or modal** |

**Auth Integration Patterns (3 options)**:
1. **Separate page** (Linear, Cursor, Supabase): CTA → `/login`. Cleanest, most secure, current CORTHEX approach. ✅ Simple
2. **Modal overlay** (not used by above, but common for SaaS dashboards): CTA opens `<dialog>` with login form. No page load. ✅ Faster perceived conversion
3. **Inline form in hero** (Calendly, Typeform, some B2B SaaS): Login form embedded in hero right column. Most visible, highest friction reduction. ⚠️ Complex

### Section Sequence Pattern (Top 8 products)
```
UNIVERSAL PATTERN (8/9 products):
Hero (headline + CTA + visual)
  ↓
Social Proof (metrics + logos)
  ↓
Feature Sections (3–8 sections)
  ↓
Testimonials
  ↓
CTA Repeat + Footer
```

### 5-Second Value Prop Test
To pass the ≤5 second test, the CORTHEX hero must answer:
1. **What is it?** — AI 팀 관리 플랫폼
2. **Who is it for?** — CEO / 사장님 / 팀장
3. **What does it do differently?** — 조직도로 AI 팀을 운영 (not a chatbot)
4. **What do I do?** — "무료 체험" CTA

**Reference product 5-second score**:
| Product | 5-sec clarity | Key pattern |
|---------|--------------|-------------|
| Cursor | ✅✅ | Product IDE visible, headline is benefit-driven |
| Linear | ✅✅ | "system for product development" = immediately clear |
| Notion | ✅ | "One workspace. Zero busywork." = pithy, memorable |
| CrewAI | ⚠️ | "Accelerate AI agent adoption" = jargon-heavy |
| Anthropic | ⚠️ | Safety-first framing = unclear for product buyers |

---

## Part 3: TOP 3 Layout Options for CORTHEX

---

### Option A: Signal — Dark Command Center

**Inspired by**: Linear (dot grid hero + product screenshot) + Stripe (left-aligned hero, enterprise credibility) + Cursor (trust logos immediately post-hero)
Note: Linear uses a JS-animated dot grid (opacity stagger). CORTHEX Option A uses a static CSS radial-gradient dot grid (`motion-reduce:hidden`) — same visual aesthetic, zero JS.

**Core philosophy**: Product visual dominates. NEXUS canvas IS the CORTHEX promise — see it immediately, understand the product. Dark near-black with indigo accent creates military precision aesthetic. Left-aligned copy = enterprise authority.

**5-second test**: Headline "조직도를 그리면 AI 팀이 움직인다" (7 words) + NEXUS canvas below = value prop in 1 scan.

```
FULL PAGE WIREFRAME — Option A (1440px viewport):

┌──────────────────────────────────────────────────────────────────────────────┐
│  CORTHEX   제품  가격  문서  블로그  │  로그인  [무료 체험 →]               │ ← sticky h-16, bg-zinc-950/90 backdrop-blur-sm
│ ══════════════════════════════════════════════════════════════════════════════│ ← border-b border-zinc-800
│                                                                              │
│  ░░ dot grid pattern bg (static CSS radial-gradient, no animation) ░░░░░░░  │
│                                                                              │
│  AI 조직 관리 플랫폼               [word-stagger entrance, 80ms/word]       │ ← eyebrow: text-indigo-400 text-sm tracking-widest
│                                                                              │
│  조직도를 그리면                                                             │ ← h1: text-6xl font-bold text-zinc-50
│  AI 팀이 움직인다.                                                          │    leading-[1.05] tracking-tight
│                                                                              │
│  AI 에이전트를 조직도로 관리하는 새로운 방법. 부서를 그리고 에이전트를      │ ← text-xl text-zinc-400 leading-relaxed
│  배치하면 비서실장이 자동으로 업무를 위임하고 실행합니다.                   │    max-w-2xl
│                                                                              │
│  [무료 체험 시작 →]      [데모 신청]                                        │ ← gap-4: bg-indigo-600 | border border-zinc-700
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  ━━━ NEXUS CANVAS SCREENSHOT (1280×480) ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ │ ← rounded-xl border border-zinc-800
│  │                                                                        │ │   shadow-2xl shadow-black/50 bg-zinc-900
│  │     비서실장 ──────── CIO ──────── 개발팀장                           │ │
│  │          │                              └──── 개발자1 ●running        │ │
│  │          └──── CFO ──────── 재무팀장    └──── 개발자2 ●running        │ │
│  │                                                                        │ │
│  │   ● running ● running ○ idle    ● running ● running                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│══════════════════════════════════════════════════════════════════════════════│
│                           SECTION 2 — TRUST RAIL                           │ ← bg-zinc-900 border-y border-zinc-800 py-6
│  300K+    │  8 AI       │  99.9%    │  ₩0 HR      │  [삼성][LG][현대][SK] │
│  업무완료  │  에이전트   │  가동률   │  오버헤드   │  [카카오][네이버]      │
│══════════════════════════════════════════════════════════════════════════════│
│                                                                              │
│                        SECTION 3 — HOW IT WORKS                            │ ← bg-zinc-950 py-24
│               이렇게 작동합니다                                              │
│                                                                              │
│   ┌──────────────┐ ─────► ┌──────────────┐ ─────► ┌──────────────┐       │
│   │ 01. 그린다   │        │ 02. 배포한다 │        │ 03. 본다     │       │
│   │ NEXUS 조직도 │        │ 에이전트 자동│        │ Hub 실시간   │       │
│   │ 드래그 편집  │        │ 활성화·위임  │        │ 위임 체인    │       │
│   └──────────────┘        └──────────────┘        └──────────────┘       │
│══════════════════════════════════════════════════════════════════════════════│
│                                                                              │
│                   SECTION 4 — HUB FEATURE (screenshot L, copy R)           │ ← bg-zinc-900 py-24
│   ┌──────────────────────────────────┐   허브 — AI 팀의 사령관실           │
│   │  HUB 3-COL SCREENSHOT           │   비서실장에게 명령하면 AI 팀이      │
│   │  SessionPanel│Chat│Tracker       │   움직입니다. 실시간 위임 체인이     │
│   │  ●running   │    │비서실장→CIO→  │   Tracker에 표시됩니다.             │
│   └──────────────────────────────────┘   [허브 더 알아보기 →]              │
│══════════════════════════════════════════════════════════════════════════════│
│                   SECTION 5 — NEXUS FEATURE (copy L, screenshot R)         │ ← bg-zinc-950 py-24
│   NEXUS — 살아있는 조직도             ┌──────────────────────────────────┐ │
│   드래그로 조직도를 편집하면           │  NEXUS CANVAS SCREENSHOT        │ │
│   에이전트가 즉시 재편성됩니다.        │  drag editing visible            │ │
│   [NEXUS 알아보기 →]                  └──────────────────────────────────┘ │
│══════════════════════════════════════════════════════════════════════════════│
│                   SECTION 6 — AGORA + ARGOS (2-col cards)                  │ ← bg-zinc-900 py-16
│   ┌──────────────────────────────┐   ┌──────────────────────────────┐     │
│   │ AGORA — AI 토론실            │   │ ARGOS — 자율 스케줄러        │     │
│   │ AI들이 토론 후 최선의 결정   │   │ 크론잡처럼 AI 예약 실행.     │     │
│   │ 을 도출합니다.               │   │ 사람 없이 비즈니스 운영.     │     │
│   └──────────────────────────────┘   └──────────────────────────────┘     │
│══════════════════════════════════════════════════════════════════════════════│
│                   SECTION 7 — TESTIMONIALS (3 col)                         │ ← bg-zinc-950 py-16
│   ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  │
│   │ "의사결정 4배 빨라" │  │ "24시간 AI팀 운영" │  │ "투자 리포트 자동" │  │
│   │ 김○○, CEO · A기업  │  │ 이○○, CTO · B기업 │  │ 박○○, CFO · C기업 │  │
│   └────────────────────┘  └────────────────────┘  └────────────────────┘  │
│══════════════════════════════════════════════════════════════════════════════│
│                   SECTION 8 — PRICING (3 tiers)                            │ ← bg-zinc-900 py-16
│   {/* ⚠️ 가격 미정 — 런칭 전 실제 가격으로 교체 필요 */}                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│   │ Starter      │  │ Business     │  │ Enterprise   │                   │
│   │ ₩99,000/월   │  │ ₩299,000/월  │  │ 문의         │                   │
│   │ 3 에이전트   │  │ 8 에이전트   │  │ 무제한       │                   │
│   │ [시작하기]   │  │ [시작하기]   │  │ [문의하기]   │                   │
│   └──────────────┘  └──────────────┘  └──────────────┘                   │
│══════════════════════════════════════════════════════════════════════════════│
│                   SECTION 9 — FINAL CTA                                    │ ← bg-indigo-950 border-t border-indigo-900 py-20
│               지금 바로 AI 팀을 구성하세요.                                 │
│               [무료 체험 시작 →]     [데모 신청]                            │
│══════════════════════════════════════════════════════════════════════════════│
│  Footer: 제품│가격│문서│블로그│개인정보처리방침│이용약관   © 2026 CORTHEX  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Login/Signup Integration — Option A: Separate Page Pattern**
```tsx
// Nav: always-visible "로그인" link
<nav
  className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-8 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800"
  aria-label="Main navigation"
>
  <div className="flex items-center gap-8">
    <a href="/" className="text-zinc-50 font-bold text-xl tracking-wide" aria-label="CORTHEX 홈">CORTHEX</a>
    <div className="hidden lg:flex items-center gap-6 text-sm text-zinc-400">
      {[
        { label: '제품', href: '/features' },
        { label: '가격', href: '/pricing' },
        { label: '문서', href: '/docs' },
        { label: '블로그', href: '/blog' },
      ].map(({ label, href }) => (
        <a key={label} href={href} className="hover:text-zinc-100 transition-colors duration-150 motion-reduce:transition-none">{label}</a>
      ))}
    </div>
  </div>
  <div className="flex items-center gap-3">
    <a
      href="/login"
      className="text-sm text-zinc-400 hover:text-zinc-100 px-3 py-2 transition-colors duration-150 motion-reduce:transition-none"
    >
      로그인
    </a>
    <a
      href="/signup"
      className="text-sm bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-150 motion-reduce:transition-none"
    >
      무료 체험 →
    </a>
  </div>
</nav>

// Hero section
<section
  className="min-h-screen bg-zinc-950 pt-16 flex items-center relative overflow-hidden"
  aria-labelledby="hero-heading"
>
  {/* Animated dot grid — CSS only, no JS animation */}
  {/* prefers-reduced-motion: reduce disables the animation */}
  <div
    className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(99_102_241/0.12)_1px,transparent_0)] bg-[length:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)] motion-reduce:hidden"
    aria-hidden="true"
  />

  <div className="relative z-10 max-w-7xl mx-auto px-8 py-20 w-full">
    <div className="max-w-3xl">
      <p className="text-indigo-400 text-xs font-semibold tracking-[0.25em] uppercase mb-6">
        AI 조직 관리 플랫폼
      </p>
      <h1
        id="hero-heading"
        className="text-6xl xl:text-7xl font-bold text-zinc-50 leading-[1.05] tracking-tight mb-6"
      >
        조직도를 그리면<br />
        <span className="text-indigo-400">AI 팀</span>이 움직인다.
      </h1>
      <p className="text-xl text-zinc-400 leading-relaxed mb-10 max-w-2xl">
        AI 에이전트를 조직도로 관리하는 새로운 방법. 부서를 그리고 에이전트를
        배치하면 비서실장이 자동으로 업무를 위임하고 실행합니다.
      </p>
      <div className="flex items-center gap-4 flex-wrap">
        <a
          href="/signup"
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-base font-semibold px-6 py-3 rounded-lg transition-colors duration-150 motion-reduce:transition-none"
        >
          무료 체험 시작 →
        </a>
        <a
          href="/demo"
          className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 text-base font-medium px-6 py-3 rounded-lg transition-colors duration-150 motion-reduce:transition-none"
        >
          데모 신청
        </a>
        <span className="text-zinc-600 text-sm">
          이미 계정이 있으신가요?{' '}
          <a href="/login" className="text-zinc-400 hover:text-zinc-200 underline transition-colors duration-150 motion-reduce:transition-none">
            로그인
          </a>
        </span>
      </div>
    </div>

    {/* Hero product visual — NEXUS canvas */}
    <div
      className="mt-16 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl shadow-black/60 bg-zinc-900"
      role="img"
      aria-label="CORTHEX NEXUS 조직도 캔버스 — 에이전트가 실시간으로 작동하는 모습"
    >
      <div className="bg-zinc-800/60 border-b border-zinc-700 px-4 py-2 flex items-center gap-2" aria-hidden="true">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
        </div>
        <span className="text-xs text-zinc-500 ml-2">NEXUS — 조직도 편집기</span>
      </div>
      {/* Replace with actual NEXUS canvas screenshot */}
      <div className="h-[440px]" />
    </div>
  </div>
</section>
```

**How each section handles login/auth**:
| Location | Auth action |
|----------|------------|
| Sticky nav | "로그인" link → `/login` always visible |
| Hero CTA (primary) | "무료 체험 시작" → `/signup` |
| Hero CTA (tertiary) | "이미 계정이 있으신가요? 로그인" inline text link → `/login` |
| Feature sections | CTA repeat → `/signup` |
| Pricing tier buttons | "시작하기" → `/signup?plan=starter` (or `business`) |
| Final CTA section | Repeat of hero CTAs |

**Pros for CORTHEX**:
- NEXUS canvas visible above fold — product promise delivered in <2 seconds
- Static dot grid pattern = military radar aesthetic (CSS `radial-gradient` only — no JS, no `@keyframes`)
- Left-aligned hero = enterprise authority
- "이미 계정이 있으신가요?" inline login link = best practice for returning users
- Clear login path at ALL stages of the page
- Metrics rail before logo wall = credibility before social proof

**Cons for CORTHEX**:
- Requires high-quality NEXUS canvas screenshot (must be created)
- 9 sections = long scroll — visitors who don't scroll past hero miss pricing
- Trust metrics (300K+) are aspirational at launch — need real data

---

### Option B: Dispatch — Story + Modal Auth

**Inspired by**: Anthropic (typography-dominant, mission-focused) + CrewAI (problem/solution narrative) + Notion (aspirational metric in subheadline)

**Core philosophy**: Question-hook headline engages CEO's specific anxiety. The page IS the sales pitch — pain → transformation. Modal login reduces page navigation (login without leaving the landing page).

**5-second test**: "당신의 AI 팀은 지금 무엇을 하고 있나요?" = confronts the exact pain of uncontrolled AI tools. Answer = CORTHEX.

```
FULL PAGE WIREFRAME — Option B (1440px viewport):

┌──────────────────────────────────────────────────────────────────────────────┐
│  CORTHEX                                   [로그인]  [무료 체험]             │ ← minimal nav h-16
│ ══════════════════════════════════════════════════════════════════════════════│
│                                                                              │
│                                                                              │
│              당신의 AI 팀은                                                  │ ← h1, centered, text-7xl
│              지금 무엇을 하고 있나요?                                        │    font-bold text-zinc-50
│                                                                              │
│         CORTHEX: 조직도로 움직이는 AI 팀 관리 플랫폼                        │ ← subheadline text-xl text-zinc-400
│                                                                              │
│                    [무료 체험 시작 →]                                        │ ← single centered CTA
│                                                                              │
│              ↓ (scroll indicator, animated, motion-reduce:hidden)           │
│                                                                              │
│══════════════════════════════════════════════════════════════════════════════│
│              SECTION 2 — THE PROBLEM (bg-zinc-900 py-24)                   │
│                                                                              │
│  AI 도구는 많다. 그런데 팀처럼 일하는 AI는 없다.                           │ ← h2 text-3xl
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 현재 상황 (✕)                  │  CORTHEX (✓)                       │  │ ← 4-row before/after grid
│  │ AI 툴 10개, 각개 관리          │  1개 대시보드 통합 관리            │  │   bg-zinc-800/50 rounded-lg
│  │ 어떤 AI가 뭘 하는지 모름       │  실시간 위임 추적 (Tracker)        │  │
│  │ 결과물 품질 일관성 없음         │  AGORA 다중 AI 검증               │  │
│  │ 새 AI 추가시 설정 지옥          │  NEXUS 드래그 즉시 배치           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│══════════════════════════════════════════════════════════════════════════════│
│              SECTION 3 — SOLUTION REVEAL (bg-zinc-950 py-24)               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ [NEXUS canvas — <video> loop or <img> fallback, full width]         │   │ ← w-full rounded-xl
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│              조직도를 그리면, AI 팀이 움직인다.                              │ ← centered h2
│              30초 안에 AI 조직도 완성 → 즉시 운영 시작                     │
│                                                                              │
│══════════════════════════════════════════════════════════════════════════════│
│              SECTION 4 — FEATURE STICKY SCROLL                             │ ← bg-zinc-900 py-24
│                                                                              │
│  ┌── sticky feature nav (sticky top-[64px] z-40) ───────────────────────┐  │
│  │  허브  ·  대시보드  ·  NEXUS  ·  AGORA  ·  ARGOS  ·  라이브러리    │  │ ← h-12
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  [Active feature screenshot — full width, changes on scroll]               │
│                                                                              │
│══════════════════════════════════════════════════════════════════════════════│
│              SECTION 5 — METRICS + TESTIMONIALS (bg-zinc-950 py-16)        │
│   "혼자서도 50인 팀처럼 일합니다"  ← aspirational metric (Notion pattern)  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ "CORTHEX 이후 의사결정 4배 빨라졌습니다." — 김○○ CEO, A기업        │  │ ← testimonial card
│  │ "8개 AI가 24시간 일하는 동안 전략에만 집중합니다." — 이○○ CTO     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│══════════════════════════════════════════════════════════════════════════════│
│              SECTION 6 — PRICING (bg-zinc-900 py-16)                      │
│   {/* ⚠️ 가격 미정 — 런칭 전 실제 가격으로 교체 필요 */}                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│   │ Starter      │  │ Business     │  │ Enterprise   │                   │
│   │ ₩99,000/월   │  │ ₩299,000/월  │  │ 문의         │                   │
│   │ 3 에이전트   │  │ 8 에이전트   │  │ 무제한       │                   │
│   │ [시작하기]   │  │ [시작하기]   │  │ [문의하기]   │                   │
│   └──────────────┘  └──────────────┘  └──────────────┘                   │
│══════════════════════════════════════════════════════════════════════════════│
│              SECTION 7 — FINAL CTA (bg-zinc-950 border-t border-zinc-900) │
│               지금 바로 AI 팀을 구성하세요.                                 │
│               [무료 체험 시작 →]     [데모 신청]                            │
└──────────────────────────────────────────────────────────────────────────────┘

**Section 3 — NEXUS Visual Implementation Spec**:
```tsx
// Option B: video-first with static <img> fallback (prefers-reduced-motion)
// @media (prefers-reduced-motion: reduce) hides the <video> and shows <img> fallback
<div className="w-full rounded-xl border border-zinc-800 overflow-hidden shadow-2xl shadow-black/60 bg-zinc-900">
  {/* Animated: looping MP4 screencast of NEXUS canvas */}
  <video
    autoPlay
    muted
    loop
    playsInline
    className="w-full motion-reduce:hidden"
    aria-hidden="true"
  >
    <source src="/assets/nexus-demo.mp4" type="video/mp4" />
  </video>
  {/* Static fallback shown when motion is reduced */}
  <img
    src="/assets/nexus-screenshot.png"
    alt="CORTHEX NEXUS 조직도 캔버스 — 드래그로 에이전트를 배치하는 화면"
    className="w-full hidden motion-reduce:block"
  />
</div>
// CSS-only fallback (no JS):
// @media (prefers-reduced-motion: reduce) { video { display: none; } img { display: block; } }
```

**Section 4 — Sticky Feature Nav Implementation Spec**:
```tsx
// Sticky nav: top-[64px] = clears fixed main nav (h-16 = 64px)
<nav
  className="sticky top-[64px] z-40 h-12 flex items-center gap-0 bg-zinc-900 border-b border-zinc-800"
  aria-label="기능 탐색"
>
  {['허브', '대시보드', 'NEXUS', 'AGORA', 'ARGOS', '라이브러리'].map((label, i) => (
    <button
      key={label}
      onClick={() => {
        document.getElementById(`feature-${i}`)?.scrollIntoView({
          behavior: 'smooth',   // motion-reduce: replaced at runtime
          block: 'start',
        })
      }}
      className="px-4 h-full text-sm text-zinc-400 hover:text-zinc-100 transition-colors duration-150 motion-reduce:transition-none data-[active=true]:text-zinc-100 data-[active=true]:border-b-2 data-[active=true]:border-indigo-500"
    >
      {label}
    </button>
  ))}
</nav>
// Note: replace scrollIntoView behavior:'smooth' with 'instant' when prefers-reduced-motion:reduce
// (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
```

MODAL LOGIN OVERLAY (triggered by "로그인" or "무료 체험" CTAs):
┌─────────────────────────────────────────────────────┐
│  (backdrop: bg-black/60 backdrop-blur-sm)           │
│  ┌───────────────────────────────────────────────┐  │
│  │              CORTHEX                 [✕]      │  │ ← dialog role="dialog" aria-modal="true"
│  │                                               │  │   aria-labelledby="auth-modal-heading"
│  │  ─── 로그인 ───                              │  │
│  │                                               │  │
│  │  이메일 또는 아이디                           │  │
│  │  ┌─────────────────────────────────────────┐ │  │
│  │  │                                         │ │  │ ← bg-zinc-800 border-zinc-700 focus:border-indigo-500
│  │  └─────────────────────────────────────────┘ │  │   focus:ring-2 focus:ring-indigo-600/20
│  │                                               │  │
│  │  비밀번호                                     │  │
│  │  ┌─────────────────────────────────────────┐ │  │
│  │  │                                     [👁]│ │  │
│  │  └─────────────────────────────────────────┘ │  │
│  │                                               │  │
│  │  [로그인 →]                                   │  │ ← bg-indigo-600 w-full py-3 rounded-lg
│  │                                               │  │
│  │  계정이 없으신가요? 무료 체험 시작            │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Nav + Hero Section — Option B: Minimal Typography-Dominant Pattern**
```tsx
// Option B: minimal 2-item nav (no product links — focus on conversion)
<nav
  className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-8 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800"
  aria-label="Main navigation"
>
  <a href="/" className="text-zinc-50 font-bold text-xl tracking-wide" aria-label="CORTHEX 홈">CORTHEX</a>
  <div className="flex items-center gap-3">
    <button
      onClick={() => setOpen(true)}
      className="text-sm text-zinc-400 hover:text-zinc-100 px-3 py-2 transition-colors duration-150 motion-reduce:transition-none"
    >
      로그인
    </button>
    <button
      onClick={() => setOpen(true)}
      className="text-sm bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-150 motion-reduce:transition-none"
    >
      무료 체험 →
    </button>
  </div>
</nav>

// Option B: typography-dominant, full-viewport, centered hero
<section
  className="min-h-screen bg-zinc-950 pt-16 flex flex-col items-center justify-center text-center px-8"
  aria-labelledby="hero-heading"
>
  <h1
    id="hero-heading"
    className="text-7xl xl:text-8xl font-bold text-zinc-50 leading-[1.0] tracking-tight mb-8 max-w-4xl"
  >
    당신의 AI 팀은<br />
    지금 무엇을<br />
    <span className="text-indigo-400">하고 있나요?</span>
  </h1>
  <p className="text-xl text-zinc-400 leading-relaxed mb-4 max-w-2xl">
    CORTHEX: 조직도로 움직이는 AI 팀 관리 플랫폼
  </p>
  <button
    onClick={() => setOpen(true)}
    className="mt-6 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-base font-semibold px-8 py-4 rounded-lg transition-colors duration-150 motion-reduce:transition-none"
  >
    무료 체험 시작 →
  </button>
  {/* Scroll indicator */}
  <div
    className="mt-12 flex flex-col items-center gap-1 text-zinc-600 text-xs animate-bounce motion-reduce:animate-none"
    aria-hidden="true"
  >
    <span>스크롤</span>
    <span>↓</span>
  </div>
</section>
```

**Login/Signup Integration — Option B: Modal Pattern**
```tsx
// State + ref
const [open, setOpen] = useState(false)
const [showPassword, setShowPassword] = useState(false)
const dialogRef = useRef<HTMLDialogElement>(null)

// showModal() activates ::backdrop, native focus-trap, and Escape-to-close
useEffect(() => {
  if (open) {
    dialogRef.current?.showModal()
    // Move focus to first input after modal opens
    requestAnimationFrame(() =>
      dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus()
    )
  } else {
    dialogRef.current?.close()
  }
}, [open])

// Trigger (attach to nav "로그인" and hero CTA buttons):
// <button onClick={() => setOpen(true)}>로그인</button>

// Modal login dialog
<dialog
  ref={dialogRef}
  id="auth-modal"
  className={cn(
    "fixed inset-0 z-[100] m-auto w-full max-w-md",
    "bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/80 p-8",
    "backdrop:bg-black/60 backdrop:backdrop-blur-sm",
    // open:flex/open:flex-col activates when .showModal() sets [open] attribute
    "open:flex open:flex-col",
    // Entry animation
    "transition-[opacity,transform] duration-200 motion-reduce:transition-none",
    open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
  )}
  aria-labelledby="auth-modal-heading"
  aria-modal="true"
  onClose={() => setOpen(false)}
>
  <div className="flex items-center justify-between mb-8">
    <h2 id="auth-modal-heading" className="text-xl font-bold text-zinc-50">CORTHEX</h2>
    <button
      onClick={() => dialogRef.current?.close()}
      className="text-zinc-500 hover:text-zinc-300 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors duration-150 motion-reduce:transition-none"
      aria-label="모달 닫기"
    >
      ✕
    </button>
  </div>

  {/* onSubmit prevents full page reload — keeps user on landing page on error */}
  <form
    onSubmit={async (e) => {
      e.preventDefault()
      const data = new FormData(e.currentTarget)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.get('username'), password: data.get('password') }),
      })
      if (res.ok) window.location.href = '/hub'
      // else: show inline error (add error state as needed)
    }}
    className="space-y-4"
  >
    <div>
      <label htmlFor="username" className="block text-sm font-medium text-zinc-400 mb-1.5">
        이메일 또는 아이디
      </label>
      <input
        id="username"
        name="username"
        type="text"
        autoComplete="username"
        required
        className="w-full h-11 bg-zinc-800 border border-zinc-700 rounded-lg px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/20 transition-colors duration-150 motion-reduce:transition-none"
      />
    </div>
    <div>
      <label htmlFor="password" className="block text-sm font-medium text-zinc-400 mb-1.5">
        비밀번호
      </label>
      <div className="relative">
        <input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          required
          className="w-full h-11 bg-zinc-800 border border-zinc-700 rounded-lg px-4 pr-11 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/20 transition-colors duration-150 motion-reduce:transition-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
        >
          {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
        </button>
      </div>
    </div>
    <button
      type="submit"
      className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-150 motion-reduce:transition-none mt-2"
    >
      로그인 →
    </button>
  </form>

  <p className="text-center text-sm text-zinc-500 mt-6">
    계정이 없으신가요?{' '}
    <a href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-150 motion-reduce:transition-none">
      무료 체험 시작
    </a>
  </p>
</dialog>
```

**How each section handles login/auth**:
| Location | Auth action |
|----------|------------|
| Nav "로그인" | Opens modal dialog |
| Nav "무료 체험" | Opens modal dialog (login form) with signup tab |
| Hero CTA "무료 체험 시작" | Opens modal |
| Pricing "시작하기" | Opens modal |
| Final CTA | Opens modal |

**Pros for CORTHEX**:
- Question-hook "당신의 AI 팀은 지금 무엇을 하고 있나요?" engages CEO's specific anxiety
- Modal login = no page navigation = higher conversion for return visitors
- Problem/solution before/after grid = qualifies buyers instantly
- Single CTA in hero = no decision fatigue
- Sticky feature nav = advanced visitors can jump to their area of interest

**Cons for CORTHEX**:
- No product visual above fold = CEO scrolls without seeing NEXUS
- Modal login requires `.showModal()` API — provides native focus-trap (no library needed). Browser support: Chrome 76+, Firefox 98+, Safari 15.4+ (CORTHEX target audience)
- Single CTA loses the enterprise "Contact Sales" path
- Story format requires more reading time = loses scan-first CEOs
- `<dialog>` with `backdrop:` CSS needs browser support check (Chrome 76+, Safari 15.4+)

---

### Option C: Asset — Split Hero + Inline Auth

**Inspired by**: Cursor (product demo in hero) + Notion (bento grid) + Stripe ("Contact Sales" enterprise credibility) + Supabase (inline dashboard shortcut)

**Core philosophy**: Product visible immediately (split 60/40 hero). Right column = NEXUS canvas OR inline login form toggle. CEO sees product + can log in without scrolling. Most efficient layout for mixed traffic (new visitors + returning users).

**5-second test**: Left: "AI 팀을 조직도로 운영하세요" + value prop text. Right: NEXUS canvas (product proof). Visitor understands in one viewport.

```
FULL PAGE WIREFRAME — Option C (1440px viewport):

┌──────────────────────────────────────────────────────────────────────────────┐
│  CORTHEX  제품▾ 가격 문서  │  Contact Sales  [로그인]  [무료 체험 →]       │ ← sticky nav, Stripe pattern
│ ══════════════════════════════════════════════════════════════════════════════│
│                                                                              │
│  Left 55%                          │  Right 45%                            │
│                                    │                                       │
│  AI 팀을                           │  ┌─────────────────────────────────┐  │
│  조직도로 운영하세요.               │  │ [Tab: 미리보기 | 로그인]        │  │ ← tab strip h-10
│                                    │  │ ─────────────────────────────── │  │   border-b border-zinc-800
│  부서를 설계하고, 에이전트를 배치  │  │ NEXUS canvas preview /          │  │
│  하면 AI 조직이 즉시 움직입니다.   │  │ Login form (toggle)             │  │ ← Tailwind-card: bg-zinc-900
│  혼자서도 50인 팀처럼.             │  │                                 │  │   border border-zinc-800
│                                    │  │ → 미리보기 tab: NEXUS screenshot │  │   rounded-2xl shadow-2xl
│  [무료 체험 →]  [데모 신청]       │  │ → 로그인 tab: login form        │  │
│                                    │  └─────────────────────────────────┘  │
│══════════════════════════════════════════════════════════════════════════════│
│  300K+ 완료  │  8 에이전트  │  99.9% 가동률   │  [삼성][LG][현대][SK]     │ ← bg-zinc-900 border-y py-5
│══════════════════════════════════════════════════════════════════════════════│
│              SECTION 3 — BENTO GRID (2×2, bg-zinc-950 py-24)              │
│                                                                              │
│   ┌──────────────────────────────────┐  ┌──────────────────────────────┐   │
│   │  허브 (bg-indigo-950 border      │  │  NEXUS (bg-zinc-900 border   │   │
│   │  border-indigo-900)              │  │  border-zinc-800)            │   │
│   │  [Hub 3-col screenshot]          │  │  [NEXUS canvas screenshot]   │   │
│   │  AI 팀 사령관실. 실시간 위임 추적│  │  드래그 조직도 → 에이전트    │   │
│   └──────────────────────────────────┘  └──────────────────────────────┘   │
│   ┌──────────────────────────────────┐  ┌──────────────────────────────┐   │
│   │  AGORA (bg-zinc-900)             │  │  ARGOS (bg-zinc-900)         │   │
│   │  [AGORA debate screenshot]       │  │  [ARGOS cron screenshot]     │   │
│   │  AI 토론 → 최선의 결정           │  │  AI 예약 실행 → 자율 운영    │   │
│   └──────────────────────────────────┘  └──────────────────────────────┘   │
│══════════════════════════════════════════════════════════════════════════════│
│              SECTION 4 — TABBED PRODUCT PREVIEW (bg-zinc-900 py-16)        │
│   [허브][대시보드][NEXUS][AGORA][ARGOS][라이브러리]  ← tab strip            │
│   [Active tab full-width screenshot — IntersectionObserver lazy load]      │
│══════════════════════════════════════════════════════════════════════════════│
│              SECTION 5 — TESTIMONIALS (3-col, bg-zinc-950 py-16)          │
│   ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  │
│   │ "의사결정 4배 빨라" │  │ "24시간 AI팀 운영" │  │ "투자 리포트 자동" │  │
│   │ 김○○, CEO · A기업  │  │ 이○○, CTO · B기업 │  │ 박○○, CFO · C기업 │  │
│   └────────────────────┘  └────────────────────┘  └────────────────────┘  │
│══════════════════════════════════════════════════════════════════════════════│
│              SECTION 6 — PRICING (bg-zinc-900 py-16)                      │
│   {/* ⚠️ 가격 미정 — 런칭 전 실제 가격으로 교체 필요 */}                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│   │ Starter      │  │ Business     │  │ Enterprise   │                   │
│   │ ₩99,000/월   │  │ ₩299,000/월  │  │ 문의         │                   │
│   │ 3 에이전트   │  │ 8 에이전트   │  │ 무제한       │                   │
│   │ [시작하기]   │  │ [시작하기]   │  │ [문의하기]   │                   │
│   └──────────────┘  └──────────────┘  └──────────────┘                   │
│══════════════════════════════════════════════════════════════════════════════│
│              SECTION 7 — FINAL CTA (bg-indigo-950 border-t border-indigo-900 py-20) │
│               지금 바로 AI 팀을 구성하세요.                                 │
│               [무료 체험 시작 →]     [데모 신청]                            │
└──────────────────────────────────────────────────────────────────────────────┘

INLINE AUTH PANEL (right col, toggled via "로그인" tab):
┌─────────────────────────────────────────────────────┐
│  [미리보기] [로그인]  ← tab strip                   │
│ ─────────────────────────────────────────────────── │
│  로그인                                             │
│                                                     │
│  이메일 또는 아이디                                 │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │ ← h-11 bg-zinc-800 border-zinc-700
│  └───────────────────────────────────────────────┘  │   focus:border-indigo-500
│                                                     │
│  비밀번호                                           │
│  ┌───────────────────────────────────────────────┐  │
│  │                                          [👁]  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [로그인 →]                    w-full bg-indigo-600 │
│                                                     │
│  계정 없으신가요? 무료 체험 시작 →                  │
└─────────────────────────────────────────────────────┘
```

**Login/Signup Integration — Option C: Inline Tab Panel**
```tsx
// Split hero with inline auth tab
<section className="min-h-screen bg-zinc-950 pt-16 flex items-center" aria-labelledby="hero-heading">
  <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-[1fr_420px] gap-16 items-center py-20">
    {/* Left: copy */}
    <div>
      <p className="text-indigo-400 text-xs font-semibold tracking-[0.25em] uppercase mb-6">AI 조직 관리 플랫폼</p>
      <h1
        id="hero-heading"
        className="text-5xl xl:text-6xl font-bold text-zinc-50 leading-tight tracking-tight mb-6"
      >
        AI 팀을<br />
        조직도로<br />
        운영하세요.
      </h1>
      <p className="text-zinc-400 text-lg leading-relaxed mb-4">
        부서를 설계하고, 에이전트를 배치하면<br />AI 조직이 즉시 움직입니다.
      </p>
      <p className="text-indigo-400 text-base font-medium mb-10">혼자서도 50인 팀처럼.</p>
      <div className="flex items-center gap-3">
        <a href="/signup" className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors duration-150 motion-reduce:transition-none">
          무료 체험 →
        </a>
        <a href="/demo" className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 font-medium px-5 py-2.5 rounded-lg transition-colors duration-150 motion-reduce:transition-none">
          데모 신청
        </a>
      </div>
    </div>

    {/* Right: tab panel — preview or login */}
    {/* No role on outer container — role="tablist" + role="tabpanel" children handle ARIA */}
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
      {/* Tab strip */}
      <div role="tablist" aria-label="미리보기 또는 로그인" className="flex border-b border-zinc-800">
        {[
          { id: 'preview', label: '미리보기' },
          { id: 'login', label: '로그인' },
        ].map(tab => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeHeroTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveHeroTab(tab.id)}
            className={cn(
              "flex-1 h-10 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none",
              activeHeroTab === tab.id
                ? "text-zinc-100 border-b-2 border-indigo-500"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Preview panel — STATIC screenshot with CSS hover scale only, NOT ReactFlow */}
      <div
        id="panel-preview"
        role="tabpanel"
        aria-labelledby="tab-preview"
        hidden={activeHeroTab !== 'preview'}
        className="h-[400px] overflow-hidden"
      >
        {/* Static NEXUS canvas screenshot. CSS hover for subtle zoom (not interactive drag) */}
        <img
          src="/assets/nexus-screenshot.png"
          alt="CORTHEX NEXUS 조직도 캔버스 스크린샷"
          className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
        />
        {/* ⚠️ This is a static screenshot, NOT the live ReactFlow canvas.
             Do NOT embed <ReactFlow> here — it requires heavy JS and org data not available pre-login. */}
      </div>

      {/* Login panel */}
      <div
        id="panel-login"
        role="tabpanel"
        aria-labelledby="tab-login"
        hidden={activeHeroTab !== 'login'}
        className="p-6"
      >
        <h2 className="text-base font-semibold text-zinc-100 mb-6">로그인</h2>
        {/* onSubmit prevents page reload — user stays on landing page */}
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: data.get('username'), password: data.get('password') }),
            })
            if (res.ok) window.location.href = '/hub'
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="inline-username" className="block text-sm text-zinc-400 mb-1.5">이메일 또는 아이디</label>
            <input
              id="inline-username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full h-11 bg-zinc-800 border border-zinc-700 rounded-lg px-4 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/20 transition-colors duration-150 motion-reduce:transition-none"
            />
          </div>
          <div>
            <label htmlFor="inline-password" className="block text-sm text-zinc-400 mb-1.5">비밀번호</label>
            <input
              id="inline-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full h-11 bg-zinc-800 border border-zinc-700 rounded-lg px-4 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/20 transition-colors duration-150 motion-reduce:transition-none"
            />
          </div>
          <button
            type="submit"
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-150 motion-reduce:transition-none"
          >
            로그인 →
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500 mt-4">
          계정 없으신가요?{' '}
          <a href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-150 motion-reduce:transition-none">
            무료 체험 시작
          </a>
        </p>
      </div>
    </div>
  </div>
</section>
```

**How each section handles login/auth**:
| Location | Auth action |
|----------|------------|
| Nav "로그인" | Scrolls to hero, switches right panel to "로그인" tab |
| Nav "무료 체험" | → `/signup` |
| Hero right panel | Inline login form (tab switch from preview) |
| Bento grid cards | Each links to the feature with signup prompt |
| Final CTA | → `/signup` |

**Pros for CORTHEX**:
- Product (NEXUS) + login both visible in hero viewport = best of both worlds
- Inline auth = zero-friction login for returning users (no page load)
- ARIA tab panel correctly structured (`role="tablist/tab/tabpanel"` + `aria-selected` + `hidden`)
- "Contact Sales" in nav = enterprise B2B signal (Stripe pattern)
- Bento grid = equal visual weight to all 4 core features
- 50인 팀 aspirational metric = immediate ROI communication

**Cons for CORTHEX**:
- Right column 420px is narrow for NEXUS canvas (complex org chart detail lost)
- Inline auth requires active focus management when tab switches (keyboard accessibility)
- 4 product screenshots required for bento grid (production dependency)
- Tab interaction adds JS complexity to hero section
- At 1280px minimum: left = 780px, right = 420px — tight but functional

---

## Part 4: Recommendation Summary

| Criterion | Option A (Signal) | Option B (Dispatch) | Option C (Asset) |
|-----------|------------------|---------------------|------------------|
| Product visible above fold | ✅ Post-headline screenshot | ❌ Text-only hero | ✅✅ Split hero |
| 5-second value prop | ✅ "그리면 움직인다" | ✅ Pain-point hook | ✅ Product + headline |
| Auth integration | ✅ Separate page (simplest) | ✅✅ Modal (no page nav) | ✅✅ Inline tab (zero-friction) |
| Login always visible | ✅ Nav + hero tertiary | ✅ Nav (modal trigger) | ✅ Nav + inline tab |
| Enterprise credibility | ✅ Left-aligned, metrics | ✅ Mission narrative | ✅✅ "Contact Sales" |
| 2-CTA model | ✅ Yes | ❌ Single CTA | ✅ Yes |
| Implementation complexity | Low | Medium (modal, focus-trap) | Medium (tabs, scroll sync) |
| Screenshot dependency | 1 (NEXUS) | 1 (NEXUS animated) | 4+ (bento grid) |
| mobile-safe | ✅ Scrollable | ✅ Simple stack | ⚠️ Split → stack below 1024px |
| ARIA accessibility | ✅ nav+main+section aria-label | ✅ dialog ARIA | ✅ tablist/tab/tabpanel |
| motion-reduce | ✅ `hidden`+CSS only | ✅ dialog transition-none | ✅ tab transition-none |
| WCAG focus | ✅ Standard links | ✅ Requires focus-trap | ✅ Requires tab focus management |

**Research conclusion**: **Option A (Signal — Dark Command Center)** is recommended for CORTHEX's launch phase. It has the lowest implementation complexity, requires only 1 screenshot asset, and delivers the core product promise (NEXUS canvas) in the first viewport. The static dot grid pattern delivers the military precision aesthetic without any animation investment. Auth integration via separate `/login` page is the safest choice for JWT authentication (no modal focus-trap complexity).

**Option C** is the upgrade path: once CORTHEX has 4 quality product screenshots and the product is visually polished, the bento grid + inline auth delivers maximum conversion for both new visitors and returning users.

**Option B** is best for content-driven SEO campaigns where visitors arrive searching "how to manage AI teams" — the narrative structure converts high-intent but unfamiliar visitors better than a product-forward approach.

---

## Sources

| Product | URL |
|---------|-----|
| Linear | https://linear.app |
| Cursor | https://cursor.com |
| Vercel | https://vercel.com |
| Anthropic | https://anthropic.com |
| CrewAI | https://crewai.com |
| Notion | https://notion.com |
| Supabase | https://supabase.com |
| Loom | https://loom.com |
| Stripe | https://stripe.com |
| Clerk Auth UI patterns | https://clerk.com |
| WCAG 2.1 — Dialog ARIA | https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ |
| MDN `<dialog>` element | https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog |
| Tailwind CSS Arbitrary Values | https://tailwindcss.com/docs/adding-custom-styles |
| prefers-reduced-motion | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion |

---

*Document: Phase 1-3 Landing Page Research*
*Round 1 Draft — Pending critic review*
*Next: Critics A & B review → fixes → Round 2*
