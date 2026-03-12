# Phase 2-3: Landing Page Options — Deep Analysis + React Implementation Spec

**Date**: 2026-03-12
**Step**: Phase 2 — Analysis, Step 2-3
**Status**: FINAL APPROVED — 9.25/10 avg (Critic-A: 9.5/10, Critic-B: 9/10)
**Input**: `_corthex_full_redesign/phase-1-research/landing/landing-page-research.md`
**Output**: Landing page deep analysis + implementation spec for TOP 3 options

---

## Section 1: Shared Constraints + Technical Baseline

### 1.1 Landing Page Context

| Constraint | Value |
|------------|-------|
| Page purpose | Public marketing — unauthenticated visitors only |
| Route | `/` — authenticated users auto-redirect to `/hub` (JWT guard) |
| Target | 김대표 (CEO/decision maker) + 이팀장 (Company Admin) |
| Primary CTA | `무료 체험 시작 →` → `/signup` or modal |
| Secondary CTA | `데모 신청` → contact form |
| Viewport | Desktop-first min 1280px. Mobile: scrollable, no interactive demo |
| Dark mode | `bg-zinc-950` (`#09090b`) primary surface |
| Font | Work Sans (Google Fonts) — already established in design system |
| Accent | `bg-indigo-600` / `text-indigo-400` |
| Auth system | JWT, username + password. No OAuth. Routes: `/login`, `/signup` |
| Onboarding | ⚠️ DEFERRED — do NOT design onboarding flow |
| 5-second rule | Visitor must understand CORTHEX value before first scroll |
| Tagline | "조직도를 그리면 AI 팀이 움직인다." |

### 1.2 Key API Endpoints (Landing Page)

| Endpoint | Method | Usage |
|----------|--------|-------|
| `POST /api/auth/login` | POST | Login form submit (SPA — NEVER use `method="POST"` on `<form>`) |
| `GET /api/workspace/...` | — | NOT accessed from landing page (pre-login) |

**Critical SPA rule** (from Phase 1-3, updated R2 cross-talk):
```tsx
// CORRECT — SPA pattern (no page reload):
// Landing page is a BrowserRouter route — use navigate() + auth store, NOT window.location.href
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'

const navigate = useNavigate()
const loginToStore = useAuthStore(s => s.login)

<form onSubmit={async (e) => {
  e.preventDefault()
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (res.ok) {
    const json = await res.json()
    loginToStore(json.data.token, json.data.user)  // matches login.tsx pattern
    navigate('/hub')  // SPA navigation — no reload
  }
}}>

// NEVER use:
<form action="/api/auth/login" method="POST">  // causes full page reload in SPA
// NEVER use: window.location.href = '/hub'    // bypasses auth store + router context
// NEVER use: <a href="/login">               // use <Link to="/login"> inside BrowserRouter
```

### 1.3 Design Tokens (Shared)

| Token | Value |
|-------|-------|
| Page bg | `bg-zinc-950` |
| Panel/card bg | `bg-zinc-900` |
| Elevated | `bg-zinc-800` |
| Borders | `border-zinc-800` (landing page uses 800 since page bg is 950) |
| Accent primary | `bg-indigo-600`, `hover:bg-indigo-500`, `active:bg-indigo-700` |
| Accent text | `text-indigo-400` |
| Body text | `text-zinc-50` (headings), `text-zinc-400` (body) |
| Muted | `text-zinc-500`, `text-zinc-600` |
| Nav height | `h-16` = 64px (sticky, `bg-zinc-950/90 backdrop-blur-sm`) |
| Transition | `transition-colors duration-150 motion-reduce:transition-none` |
| Max content width | `max-w-7xl mx-auto px-8` |

### 1.4 ARIA Landmarks (All Options)

| Element | ARIA |
|---------|------|
| Nav | `<nav aria-label="Main navigation">` |
| Hero | `<section aria-labelledby="hero-heading">` + `<h1 id="hero-heading">` |
| NEXUS visual | `role="img" aria-label="CORTHEX NEXUS 조직도 캔버스..."` |
| Login modal | `<dialog>` has **implicit** `role="dialog"` — no need to add `role="dialog"` attr. Use `aria-modal="true" aria-labelledby="auth-modal-heading"` |
| Tab widget | outer: no role; `role="tablist"`, `role="tab"`, `role="tabpanel"` inside |
| All transitions | `motion-reduce:transition-none` / `motion-reduce:animate-none` |
| Decorative bg | `aria-hidden="true"` |

### 1.5 Static Dot Grid Pattern (Option A — confirmed static CSS)

```tsx
// STATIC CSS pattern — NOT JS-animated (unlike Linear's JS opacity stagger)
// motion-reduce:hidden is a precautionary safeguard only
<div
  className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(99_102_241/0.12)_1px,transparent_0)] bg-[length:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)] motion-reduce:hidden"
  aria-hidden="true"
/>
```

### 1.6 Pricing Placeholder (All Options)

```tsx
{/* ⚠️ 가격 미정 — 런칭 전 실제 가격으로 교체 필요 */}
// Starter: ₩99,000/월 (3 에이전트)
// Business: ₩299,000/월 (8 에이전트)
// Enterprise: 문의 (무제한)
// These are PLACEHOLDER values only. Replace before launch.
```

---

## Part 2: Option A — Signal (Dark Command Center)

### 2.1 Design Philosophy

**Pattern**: Linear (static dot grid + product screenshot) + Stripe (left-aligned hero, enterprise authority) + Cursor (trust logos post-hero)

**Core mental model**: Product visual IS the value proposition. The NEXUS canvas — showing named agents in a live hierarchy — communicates the entire CORTHEX differentiator in one image. A CEO who sees "비서실장 → CIO → 개발팀장 ● running" understands immediately: "this is an org chart that executes."

**Emotional response on landing**: Military precision. The dark background, left-aligned copy, and static dot grid pattern create a command-center aesthetic. No playfulness. No chatbot associations. This is infrastructure for serious organizations.

**5-second test result**: "조직도를 그리면 AI 팀이 움직인다." (7 Korean words) + NEXUS canvas visible above fold = value prop established before first scroll. ✅✅

### 2.2 Vision Principle Alignment — Option A

| Principle | Score | Evidence |
|-----------|-------|---------|
| P1: Name the Machine | ✅✅ Full | NEXUS screenshot shows named agents (비서실장, CIO, 개발팀장) as visual nodes |
| P2: Depth is Data | ✅ Full | Tracker panel in Hub screenshot shows delegation depth |
| P3: Zero-Delay Feedback | ✅ Full | "● running" status nodes in hero visual communicate live execution |
| P4: Commander's View | ✅✅ Full | Left-aligned editorial authority. "AI 조직 관리 플랫폼" eyebrow. |
| P5: Show the Org | ✅✅ Strongest | NEXUS canvas IS the hero visual — org as promise |
| P6: Typography Hierarchy | ✅ Full | text-6xl bold h1, text-xl body, text-xs eyebrow |
| P7: Dark Mode First | ✅ Full | bg-zinc-950 + indigo accent |

### 2.3 User Flow Analysis — Option A

#### Conversion Flow 1: New CEO Visits for First Time
```
OPTION A — New Visitor
Steps: 3 actions → conversion

Step 1: Land on / → Hero visible above fold
  Visual: dot grid + "조직도를 그리면 AI 팀이 움직인다." + NEXUS canvas
  Time: 0-5 seconds. Value prop understood.

Step 2: Scroll (optional) → How It Works → Hub Feature → NEXUS Feature
  OR: Don't scroll → click "무료 체험 시작 →" directly from hero

Step 3: → /signup (new tab or same tab)
  No modal state management. Clean navigation.

Friction: LOW. "이미 계정이 있으신가요? 로그인" inline link catches returning users.
```

#### Conversion Flow 2: Returning User (Already Has Account)
```
OPTION A — Returning User
Steps: 1-2 actions

Step 1: Land on / → sticky nav "로그인" always visible
Step 2: Click → /login → /hub

No confusion. Nav link is persistent through entire page scroll.
```

#### Conversion Flow 3: Enterprise Buyer (Slow Research)
```
OPTION A — Enterprise Research
Steps: 8-12 scrolls + 1 action

Scroll through: Trust Rail → How It Works → Hub → NEXUS → AGORA+ARGOS → Testimonials → Pricing
→ Final CTA section → "무료 체험" or "데모 신청"

9-section page provides full due diligence material. Enterprise buyers
often scroll to pricing before conversion. All 9 sections serve them.
```

### 2.4 Conversion UX Analysis

**Above-the-fold conversion rate factors**:
| Factor | Option A | Industry best practice |
|--------|----------|----------------------|
| CTA visibility at landing | ✅ Hero, sticky nav | ✅ Required |
| Value prop clarity ≤5s | ✅✅ (NEXUS visual + tagline) | ✅ Required |
| Trust signal placement | ✅ Trust rail section 2 | ✅ Above fold or section 2 |
| Login path clarity | ✅ Nav + hero inline | ✅ Nav at minimum |
| Mobile fallback | ✅ Scrollable, no interactive demo | ✅ Acceptable |

**Scroll depth concerns**:
- 9 sections = ~4000px page height at 1440px
- Studies show 50% of visitors never reach section 4. Pricing at section 8 is deep.
- Mitigation: Final CTA repeat at section 9. Sticky nav CTA always available.

### 2.5 Page Sections

```
1. Hero         — dot grid + h1 + NEXUS canvas screenshot
2. Trust Rail   — bg-zinc-900, metrics + brand logos
3. How It Works — 3-step (Draw → Deploy → Watch)
4. Hub Feature  — screenshot L + copy R
5. NEXUS Feature — copy L + screenshot R
6. AGORA + ARGOS — 2-col feature cards
7. Testimonials  — 3-col quote cards
8. Pricing       — 3-tier cards (⚠️ placeholder)
9. Final CTA     — bg-indigo-950, repeat hero CTAs
Footer
```

### 2.6 Implementation Spec — Option A

#### Nav Component
```tsx
// LandingNav.tsx — landing is a BrowserRouter SPA route — use Link not <a href>
import { Link } from 'react-router-dom'

export function LandingNav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-8 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-8">
        <Link to="/" className="text-zinc-50 font-bold text-xl tracking-wide" aria-label="CORTHEX 홈">
          CORTHEX
        </Link>
        <div className="hidden lg:flex items-center gap-6 text-sm text-zinc-400">
          {[
            { label: '제품', to: '/features' },
            { label: '가격', to: '/pricing' },
            { label: '문서', to: '/docs' },
            { label: '블로그', to: '/blog' },
          ].map(({ label, to }) => (
            <Link key={label} to={to}
               className="hover:text-zinc-100 transition-colors duration-150 motion-reduce:transition-none">
              {label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/login"
           className="text-sm text-zinc-400 hover:text-zinc-100 px-3 py-2 transition-colors duration-150 motion-reduce:transition-none">
          로그인
        </Link>
        <Link to="/signup"
           className="text-sm bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-150 motion-reduce:transition-none">
          무료 체험 →
        </Link>
      </div>
    </nav>
  )
}
```

#### Hero Section
```tsx
// HeroSection.tsx (Option A)
import { Link } from 'react-router-dom'

export function HeroSection() {
  return (
    <section
      className="min-h-screen bg-zinc-950 pt-16 flex items-center relative overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Static dot grid — CSS radial-gradient, NOT JS-animated */}
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
            AI 에이전트를 조직도로 관리하는 새로운 방법.
            부서를 그리고 에이전트를 배치하면 비서실장이 자동으로 업무를 위임하고 실행합니다.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              to="/signup"
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-base font-semibold px-6 py-3 rounded-lg transition-colors duration-150 motion-reduce:transition-none"
            >
              무료 체험 시작 →
            </Link>
            <Link
              to="/demo"
              className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 text-base font-medium px-6 py-3 rounded-lg transition-colors duration-150 motion-reduce:transition-none"
            >
              데모 신청
            </Link>
            <span className="text-zinc-600 text-sm">
              이미 계정이 있으신가요?{' '}
              <Link to="/login"
                 className="text-zinc-400 hover:text-zinc-200 underline transition-colors duration-150 motion-reduce:transition-none">
                로그인
              </Link>
            </span>
          </div>
        </div>

        {/* NEXUS canvas hero visual */}
        <div
          className="mt-16 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl shadow-black/60 bg-zinc-900"
        >
          <div className="bg-zinc-800/60 border-b border-zinc-700 px-4 py-2 flex items-center gap-2" aria-hidden="true">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zinc-600" />
              <div className="w-3 h-3 rounded-full bg-zinc-600" />
              <div className="w-3 h-3 rounded-full bg-zinc-600" />
            </div>
            <span className="text-xs text-zinc-500 ml-2">NEXUS — 조직도 편집기</span>
          </div>
          {/* ⚠️ Replace with actual NEXUS canvas screenshot before launch */}
          <img
            src="/assets/nexus-screenshot.png"
            alt="CORTHEX NEXUS 조직도 캔버스 — 비서실장, CIO, 개발팀장 에이전트가 실시간으로 작동하는 모습"
            className="w-full"
          />
          {/* NOT a live ReactFlow canvas — static <img> only. Too heavy for pre-login page. */}
        </div>
      </div>
    </section>
  )
}
```

#### Trust Rail
```tsx
// TrustRail.tsx
const METRICS = [
  { value: '300K+', label: '업무완료' },
  { value: '8 AI', label: '에이전트' },
  { value: '99.9%', label: '가동률' },
  { value: '₩0', label: 'HR 오버헤드' },
]
// ⚠️ Placeholder metrics — replace with real data before launch

export function TrustRail() {
  return (
    <div className="bg-zinc-900 border-y border-zinc-800 py-6">
      {/* flex-col on mobile → flex-row on lg+ to prevent logos from stretching at mid-viewport */}
      <div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {METRICS.map(m => (
            <div key={m.value} className="text-center">
              <div className="text-2xl font-bold text-zinc-50">{m.value}</div>
              <div className="text-sm text-zinc-500 mt-1">{m.label}</div>
            </div>
          ))}
        </div>
        {/* Brand logos placeholder */}
        <div className="flex items-center justify-center gap-6 opacity-40">
          {['삼성', 'LG', '현대', '카카오'].map(b => (
            <span key={b} className="text-zinc-400 text-sm font-medium">{b}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### How It Works
```tsx
// HowItWorks.tsx
const STEPS = [
  { num: '01', title: '그린다', sub: 'NEXUS 조직도', body: 'NEXUS 캔버스에서 드래그로 AI 조직도를 편집합니다.' },
  { num: '02', title: '배포한다', sub: '에이전트 자동 활성화', body: '저장하면 에이전트가 즉시 위임 경로를 따라 실행합니다.' },
  { num: '03', title: '본다', sub: 'Hub 실시간 위임 체인', body: 'Tracker에서 비서실장 → CIO → 전문가 위임 흐름을 실시간으로 확인합니다.' },
]

export function HowItWorks() {
  return (
    <section className="bg-zinc-950 py-24" aria-labelledby="how-heading">
      <div className="max-w-7xl mx-auto px-8">
        <h2 id="how-heading" className="text-3xl font-bold text-zinc-50 text-center mb-16">
          이렇게 작동합니다
        </h2>
        <div className="grid grid-cols-3 gap-8 relative">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative">
              <div className="text-indigo-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
                {step.num}
              </div>
              <div className="text-xl font-bold text-zinc-50 mb-1">{step.title}</div>
              <div className="text-sm font-medium text-indigo-400 mb-3">{step.sub}</div>
              <p className="text-sm text-zinc-400 leading-relaxed">{step.body}</p>
              {/* Connector arrow — between steps */}
              {i < 2 && (
                <div className="absolute top-6 -right-4 text-zinc-700 text-xl" aria-hidden="true">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

#### Pricing Section
```tsx
// PricingSection.tsx
const TIERS = [
  {
    name: 'Starter',
    price: '₩99,000',
    period: '/월',
    agents: '3 에이전트',
    features: ['NEXUS 조직도 편집', 'Hub 채팅', '대시보드'],
    cta: '시작하기',
    href: '/signup?plan=starter',
    highlight: false,
  },
  {
    name: 'Business',
    price: '₩299,000',
    period: '/월',
    agents: '8 에이전트',
    features: ['Starter 전체', 'AGORA 토론실', 'ARGOS 스케줄러', '라이브러리'],
    cta: '시작하기',
    href: '/signup?plan=business',
    highlight: true,  // most popular
  },
  {
    name: 'Enterprise',
    price: '문의',
    period: '',
    agents: '무제한',
    features: ['Business 전체', '전용 지원', 'SLA', '보안 감사'],
    cta: '문의하기',
    href: '/contact',
    highlight: false,
  },
]
// ⚠️ 가격 미정 — 런칭 전 실제 가격으로 교체 필요

export function PricingSection() {
  return (
    <section className="bg-zinc-900 py-20" aria-labelledby="pricing-heading">
      <div className="max-w-7xl mx-auto px-8">
        <h2 id="pricing-heading" className="text-3xl font-bold text-zinc-50 text-center mb-4">
          요금제
        </h2>
        <p className="text-zinc-400 text-center mb-12 text-sm">
          {/* ⚠️ 가격 미정 — 런칭 전 실제 가격으로 교체 필요 */}
        </p>
        <div className="grid grid-cols-3 gap-6">
          {TIERS.map(tier => (
            <div
              key={tier.name}
              className={cn(
                "rounded-xl border p-8 flex flex-col gap-6",
                tier.highlight
                  ? "bg-indigo-950/40 border-indigo-700"
                  : "bg-zinc-950 border-zinc-800"
              )}
            >
              <div>
                <div className="text-lg font-semibold text-zinc-50">{tier.name}</div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-zinc-50">{tier.price}</span>
                  <span className="text-zinc-500 text-sm">{tier.period}</span>
                </div>
                <div className="text-sm text-indigo-400 mt-1">{tier.agents}</div>
              </div>
              <ul className="space-y-2 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="text-sm text-zinc-400 flex items-center gap-2">
                    <span className="text-indigo-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href={tier.href}
                className={cn(
                  "text-center text-sm font-medium py-3 px-6 rounded-lg transition-colors duration-150 motion-reduce:transition-none",
                  tier.highlight
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : "border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100"
                )}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

#### Final CTA + Page Assembly
```tsx
// LandingPage.tsx — Option A assembly
import { Link } from 'react-router-dom'

export function LandingPageA() {
  return (
    <>
      <header>  {/* role="banner" landmark */}
        <LandingNav />
      </header>
      <main>
        <HeroSection />          {/* Section 1 */}
        <TrustRail />            {/* Section 2 */}
        <HowItWorks />           {/* Section 3 */}
        <HubFeatureSection />    {/* Section 4 — screenshot L, copy R */}
        <NexusFeatureSection />  {/* Section 5 — copy L, screenshot R */}
        <AgoraArgosSection />    {/* Section 6 — 2-col cards */}
        <TestimonialsSection />  {/* Section 7 — 3-col */}
        <PricingSection />       {/* Section 8 */}
        {/* Section 9 — Final CTA */}
        <section className="bg-indigo-950 border-t border-indigo-900 py-20 text-center">
          <h2 className="text-3xl font-bold text-zinc-50 mb-4">
            지금 바로 AI 팀을 구성하세요.
          </h2>
          <p className="text-zinc-400 mb-8">무료로 시작하세요. 카드 불필요.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup"
               className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-150 motion-reduce:transition-none">
              무료 체험 시작 →
            </Link>
            <Link to="/demo"
               className="border border-indigo-700 hover:border-indigo-500 text-indigo-300 hover:text-indigo-100 font-medium px-8 py-4 rounded-lg transition-colors duration-150 motion-reduce:transition-none">
              데모 신청
            </Link>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  )
}
```

#### Footer Component
```tsx
// LandingFooter.tsx — shared across all 3 options
export function LandingFooter() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 py-12">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-start justify-between gap-8">
        <div>
          <a href="/" className="text-zinc-50 font-bold text-lg tracking-wide" aria-label="CORTHEX 홈">
            CORTHEX
          </a>
          <p className="text-zinc-500 text-sm mt-2 max-w-xs">
            조직도로 움직이는 AI 팀 관리 플랫폼
          </p>
        </div>
        <nav aria-label="하단 링크" className="flex gap-12 text-sm text-zinc-400">
          <div className="flex flex-col gap-3">
            <span className="text-zinc-600 font-semibold uppercase tracking-wider text-xs">제품</span>
            {[['허브', '/features#hub'], ['NEXUS', '/features#nexus'], ['가격', '/pricing']].map(([l, h]) => (
              <a key={l} href={h} className="hover:text-zinc-100 transition-colors duration-150 motion-reduce:transition-none">{l}</a>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-zinc-600 font-semibold uppercase tracking-wider text-xs">회사</span>
            {[['문서', '/docs'], ['블로그', '/blog'], ['문의', '/contact']].map(([l, h]) => (
              <a key={l} href={h} className="hover:text-zinc-100 transition-colors duration-150 motion-reduce:transition-none">{l}</a>
            ))}
          </div>
        </nav>
      </div>
      <div className="max-w-7xl mx-auto px-8 mt-8 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
        <span>© 2026 CORTHEX. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="/privacy" className="hover:text-zinc-400 transition-colors duration-150 motion-reduce:transition-none">개인정보처리방침</a>
          <a href="/terms" className="hover:text-zinc-400 transition-colors duration-150 motion-reduce:transition-none">이용약관</a>
        </div>
      </div>
    </footer>
  )
}
```

### 2.7 Option A Scoring

| Criterion | Score | Justification |
|-----------|-------|--------------|
| CORTHEX Vision Alignment | 10/10 | P5 (Show the Org): NEXUS canvas IS the hero — org chart as immediate promise ✅✅. P1 (Named agents): 비서실장, CIO, 개발팀장 visible in hero ✅. P4 (Commander's View): left-aligned editorial, military precision aesthetic ✅. P7 (Dark First): bg-zinc-950 throughout ✅. Tagline exactly matches vision statement. |
| Conversion UX | 9/10 | NEXUS canvas above fold = value prop in <2s ✅. "이미 계정이 있으신가요?" inline login = returning user path ✅. Sticky nav CTA always visible ✅. Trust Rail section 2 ✅. 9-section due diligence for enterprise ✅. -1: Pricing section at depth 8 — 50% of users never reach it. |
| Implementation Complexity | 9/10 | Static CSS dot grid (zero JS) ✅. No modal state management ✅. No tab state ✅. Pure `<a>` links for all auth CTAs ✅. Simplest React structure of all 3 options. -1: 9 sections = most markup, most screenshot assets needed (NEXUS, Hub, pricing screenshots). |
| Performance / SEO | 9/10 | Static HTML sections = fully SSR/SSG-able ✅. No client-side state on first render ✅. No animations (static dot grid = no requestAnimationFrame) ✅. Auth pages separate route = clean URL structure ✅. -1: 9 hero screenshot images need WebP + lazy-loading configuration. |
| Accessibility | 9/10 | `aria-labelledby` on hero section ✅. `role="img"` on NEXUS div ✅. `aria-label` on nav ✅. "이미 계정이 있으신가요?" inline link visible without JS ✅. `motion-reduce:hidden` on dot grid ✅. Pricing table with semantic list items ✅. -1: Screenshot images need meaningful alt text + captions before launch. |
| **Total** | **46/50** | |

---

## Part 3: Option B — Dispatch (Story + Modal Auth)

### 3.1 Design Philosophy

**Pattern**: Anthropic (typography-dominant, mission statement) + CrewAI (problem/solution narrative) + Notion (aspirational metric subheadline)

**Core mental model**: The headline IS a mirror. "당신의 AI 팀은 지금 무엇을 하고 있나요?" confronts the exact pain of the target buyer — a CEO who has multiple AI tools but no visibility into what they're doing. The page structure is a sales conversation: Pain → Problem Diagnosis → Solution Reveal → Features → Conversion.

**Emotional response**: Challenged. "I actually don't know what my AI tools are doing right now." This creates the necessary tension to drive conversion — not comfort, but cognitive recognition of a real problem.

**5-second test result**: Rhetorical question in h1 + "CORTHEX: 조직도로 움직이는 AI 팀 관리 플랫폼" subheadline = positions CORTHEX as the answer to the question. ✅ — but slightly weaker than Option A for visitors who don't feel the pain.

### 3.2 Vision Principle Alignment — Option B

| Principle | Score | Evidence |
|-----------|-------|---------|
| P1: Name the Machine | ✅ Full | Section 3 NEXUS video shows named agents. Testimonials reference named agent outcomes. |
| P2: Depth is Data | ✅ Full | Before/after grid explicitly calls out "실시간 위임 추적 (Tracker)" as differentiator |
| P3: Zero-Delay Feedback | ✅ Full | Problem section: "어떤 AI가 뭘 하는지 모름" → CORTHEX answer = real-time |
| P4: Commander's View | ⚠️ Partial | No persistent product screenshot in hero. Commander aesthetic arrives at Section 3. |
| P5: Show the Org | ✅ Good | NEXUS video in Section 3 — powerful but below the fold |
| P6: Typography Hierarchy | ✅✅ Strongest | text-7xl/8xl centered h1 = most typographically dominant of all 3 options |
| P7: Dark Mode First | ✅ Full | bg-zinc-950 throughout |

### 3.3 User Flow Analysis — Option B

#### Conversion Flow 1: Pain-Aware CEO
```
OPTION B — Pain-Aware Visitor (best case)
Steps: 2 actions → conversion

Step 1: Land on / → "당신의 AI 팀은 지금 무엇을 하고 있나요?" resonates
  Emotional hit: "그러게요, 저도 모르겠는데..."
  Immediate: click "무료 체험 시작 →" from hero (before scrolling)

Step 2: Modal opens → fill username + password (or signup)
  → localStorage.setItem('corthex_token', ...) + navigate('/hub') on success

Friction: LOWEST of all options. 0 navigation away from page. Modal closes on Escape.
```

#### Conversion Flow 2: Research-Oriented Buyer
```
OPTION B — Research Buyer
Steps: 4 sections + modal

Step 1: Hero — question resonates, but "let me read more"
Step 2: Section 2 — Problem grid. Before/after comparison drives conviction.
Step 3: Section 3 — NEXUS video. Product reveal. "Oh, this is real."
Step 4: Section 4 — Sticky feature nav. Scroll through Hub, NEXUS, AGORA features.
→ Click "무료 체험" → modal → conversion

Friction: LOW. Sticky feature nav reduces scroll commitment — clicks jump to sections.
```

#### Conversion Flow 3: Returning User
```
OPTION B — Returning User
Steps: 1 action

Step 1: Land on / → "로그인" in nav → modal opens
→ Fill login → /hub

Friction: LOWER than A (no page nav). Modal login > page navigation for returning users.
```

### 3.4 Modal Implementation

```tsx
// AuthModal.tsx — MUST use <dialog> + .showModal() (not div overlay)
// .showModal() activates ::backdrop, native focus-trap, and Escape-to-close
export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const prevFocusRef = useRef<Element | null>(null)  // WCAG 2.4.3: save trigger element
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const loginToStore = useAuthStore(s => s.login)

  // Route Escape key through onClose() — otherwise native dialog cancel fires .close() directly,
  // bypassing the isClosing gate and breaking exit animation + WCAG 2.4.3 focus restore
  useEffect(() => {
    const dialog = dialogRef.current
    const handleCancel = (e: Event) => { e.preventDefault(); onClose() }
    dialog?.addEventListener('cancel', handleCancel)
    return () => dialog?.removeEventListener('cancel', handleCancel)
  }, [onClose])

  useEffect(() => {
    if (open) {
      prevFocusRef.current = document.activeElement  // save focus before modal opens
      dialogRef.current?.showModal()
      // Move focus to first input after modal opens (requestAnimationFrame ensures DOM is ready)
      requestAnimationFrame(() =>
        dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus()
      )
    } else {
      const dialog = dialogRef.current
      if (!dialog) return
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReduced) {
        dialog.close()
        ;(prevFocusRef.current as HTMLElement)?.focus?.()  // WCAG 2.4.3: restore focus
      } else {
        // Wait for CSS exit transition before .close() — { once: true } prevents double-fire
        // (multiple CSS properties transitioning = multiple transitionend events)
        dialog.addEventListener('transitionend', () => {
          dialog.close()
          ;(prevFocusRef.current as HTMLElement)?.focus?.()  // WCAG 2.4.3: restore focus
        }, { once: true })
      }
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed inset-0 z-[100] m-auto w-full max-w-md",
        "bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/80 p-8",
        // backdrop: only works with .showModal() (not .show())
        "backdrop:bg-black/60 backdrop:backdrop-blur-sm",
        // [open] attribute set by .showModal()
        "open:flex open:flex-col",
        "transition-[opacity,transform] duration-200 motion-reduce:transition-none",
        // open prop drives class directly — exit transition handled by transitionend listener in useEffect
        open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}
      aria-labelledby="auth-modal-heading"
      aria-modal="true"
      onClose={() => onClose()}
    >
      <div className="flex items-center justify-between mb-8">
        <h2 id="auth-modal-heading" className="text-xl font-bold text-zinc-50">CORTHEX</h2>
        <button
          onClick={() => onClose()}  // route through parent — triggers useEffect gate → animation → focus restore
          className="text-zinc-500 hover:text-zinc-300 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors duration-150 motion-reduce:transition-none"
          aria-label="모달 닫기"
        >
          ✕
        </button>
      </div>

      {/* NEVER use <form action="..." method="POST"> in SPA — causes full page reload */}
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const data = new FormData(e.currentTarget)
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: data.get('username'),
              password: data.get('password'),
            }),
          })
          if (res.ok) {
            const json = await res.json()
            // Store token BEFORE navigation — auth-store reads localStorage on init
            // Keys verified from packages/app/src/stores/auth-store.ts lines 22–24
            localStorage.setItem('corthex_token', json.data.token)
            localStorage.setItem('corthex_user', JSON.stringify(json.data.user))
            loginToStore(json.data.token, json.data.user)  // sync in-memory store
            navigate('/hub')  // SPA navigation — no page reload
          }
          // else: add error state display
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="modal-username" className="block text-sm font-medium text-zinc-400 mb-1.5">
            이메일 또는 아이디
          </label>
          <input
            id="modal-username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="w-full h-11 bg-zinc-800 border border-zinc-700 rounded-lg px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/20 transition-colors duration-150 motion-reduce:transition-none"
          />
        </div>
        <div>
          <label htmlFor="modal-password" className="block text-sm font-medium text-zinc-400 mb-1.5">
            비밀번호
          </label>
          <div className="relative">
            <input
              id="modal-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="w-full h-11 bg-zinc-800 border border-zinc-700 rounded-lg px-4 pr-11 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/20 transition-colors duration-150 motion-reduce:transition-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 w-6 h-6 flex items-center justify-center"
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors duration-150 motion-reduce:transition-none"
        >
          로그인 →
        </button>
        <p className="text-center text-sm text-zinc-500">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-150 motion-reduce:transition-none">
            무료 체험 시작
          </Link>
        </p>
      </form>
    </dialog>
  )
}
```

#### Sticky Feature Nav
```tsx
// FeatureNav.tsx — Option B sticky scrollable feature navigation
// sticky top-[64px] clears the fixed main nav (h-16 = 64px)
const FEATURES = ['허브', '대시보드', 'NEXUS', 'AGORA', 'ARGOS', '라이브러리']

export function FeatureNav({ activeIndex }: { activeIndex: number }) {
  const handleScrollTo = (index: number) => {
    const el = document.getElementById(`feature-${index}`)
    // Respect prefers-reduced-motion for scrollIntoView
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el?.scrollIntoView({
      behavior: prefersReducedMotion ? 'instant' : 'smooth',
      block: 'start',
    })
  }

  return (
    <nav
      className="sticky top-[64px] z-40 h-12 flex items-center bg-zinc-900 border-b border-zinc-800"
      aria-label="기능 탐색"
    >
      {FEATURES.map((label, i) => (
        <button
          key={label}
          onClick={() => handleScrollTo(i)}
          data-active={activeIndex === i}
          aria-current={activeIndex === i ? 'true' : undefined}  // screen reader active section signal
          className="px-4 h-full text-sm text-zinc-400 hover:text-zinc-100 transition-colors duration-150 motion-reduce:transition-none data-[active=true]:text-zinc-100 data-[active=true]:border-b-2 data-[active=true]:border-indigo-500"
        >
          {label}
        </button>
      ))}
    </nav>
  )
}
```

#### NEXUS Video Section
```tsx
// NexusSolutionSection.tsx — Option B Section 3 (video-first with static fallback)
export function NexusSolutionSection() {
  return (
    <section className="bg-zinc-950 py-24" aria-labelledby="solution-heading">
      <div className="max-w-7xl mx-auto px-8">
        <div className="w-full rounded-xl border border-zinc-800 overflow-hidden shadow-2xl shadow-black/60 bg-zinc-900 mb-12">
          {/* Video: autoplay muted loop for motion-OK users */}
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
          {/* Static fallback for prefers-reduced-motion */}
          <img
            src="/assets/nexus-screenshot.png"
            alt="CORTHEX NEXUS 조직도 캔버스 — 드래그로 에이전트를 배치하는 화면"
            className="w-full hidden motion-reduce:block"
          />
        </div>
        <div className="text-center">
          <h2 id="solution-heading" className="text-3xl font-bold text-zinc-50 mb-4">
            조직도를 그리면, AI 팀이 움직인다.
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            30초 안에 AI 조직도 완성 → 즉시 운영 시작
          </p>
        </div>
      </div>
    </section>
  )
}
```

#### Option B Page Assembly
```tsx
// LandingPageB.tsx
export function LandingPageB() {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const loginBtnRef = useRef<HTMLButtonElement>(null)  // for returnFocusRef

  return (
    <>
      <header>  {/* role="banner" landmark */}
        <LandingNavB onLoginClick={() => setModalOpen(true)} loginBtnRef={loginBtnRef} />
      </header>
      <main>
        {/* Section 1 — Hero */}
        <section
          className="min-h-screen bg-zinc-950 pt-16 flex flex-col items-center justify-center text-center px-8"
          aria-labelledby="hero-heading"
        >
          <h1 id="hero-heading"
              className="text-7xl xl:text-8xl font-bold text-zinc-50 leading-[1.0] tracking-tight mb-8 max-w-4xl">
            당신의 AI 팀은<br />
            지금 무엇을<br />
            <span className="text-indigo-400">하고 있나요?</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed mb-4 max-w-2xl">
            CORTHEX: 조직도로 움직이는 AI 팀 관리 플랫폼
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white text-base font-semibold px-8 py-4 rounded-lg transition-colors duration-150 motion-reduce:transition-none"
          >
            무료 체험 시작 →
          </button>
          <div className="mt-12 flex flex-col items-center gap-1 text-zinc-600 text-xs animate-bounce motion-reduce:animate-none"
               aria-hidden="true">
            <span>스크롤</span>
            <span>↓</span>
          </div>
        </section>

        {/* Section 2 — Problem */}
        <ProblemSection />
        {/* Section 3 — Solution (NEXUS video) */}
        <NexusSolutionSection />
        {/* Section 4 — Feature sticky nav */}
        <FeatureNav activeIndex={activeFeature} />
        <FeatureSections onVisible={setActiveFeature} />
        {/* Section 5 — Metrics + Testimonials */}
        <MetricsTestimonialsSection />
        {/* Section 6 — Pricing */}
        <PricingSection />
        {/* Section 7 — Final CTA */}
        <FinalCtaSection onCtaClick={() => setModalOpen(true)} />
      </main>
      <LandingFooter />
      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
```

### 3.5 Option B Scoring

| Criterion | Score | Justification |
|-----------|-------|--------------|
| CORTHEX Vision Alignment | 8/10 | P6 (Typography Hierarchy) ✅✅ — strongest typographic hero. P3 (Zero-delay) ✅ — problem section explicitly addresses. P1/P2 ✅. -1: No NEXUS canvas above fold — P5 (Show the Org) delayed to Section 3. -1: "당신의 AI 팀은..." = question frame weaker than declarative statement for Commander's View aesthetic. |
| Conversion UX | 9/10 | Modal login = 0 page navigation for returning users ✅✅. Pain-frame headline = highest resonance for target buyer ✅. Before/after comparison table = strong conviction tool ✅. Sticky feature nav = low-friction research path ✅. Scroll indicator = guides non-scrollers ✅. -1: Pain-unaware visitors may not connect with rhetorical question immediately. |
| Implementation Complexity | 7/10 | Modal `<dialog>` + `useRef` + `useEffect` + `showModal()` required ✅ (documented). Sticky feature nav + IntersectionObserver for active tracking adds ~50 lines. NEXUS video asset must be produced (additional creative work). -2: Most complex of 3 options — modal state, scroll observer, video asset. `window.matchMedia` check for reduced-motion in scrollIntoView. |
| Performance / SEO | 8/10 | No hero image to LCP (typography-only hero = fastest first paint) ✅. Video lazy-loads after hero ✅. Modal JS hydration required (client component). -1: `autoPlay` video in Section 3 = 2-5MB asset, needs preload hints. -1: Sticky nav IntersectionObserver adds JS runtime during scroll. |
| Accessibility | 8/10 | `<dialog>` + `.showModal()` = native focus-trap + Escape ✅. `aria-modal="true"` + `aria-labelledby` ✅. `motion-reduce:hidden` video (static img fallback) ✅. `motion-reduce:animate-none` scroll indicator ✅. `prefers-reduced-motion` check in `scrollIntoView` ✅. `aria-label` on password toggle ✅. -1: Modal open/close focus return to trigger button — needs `returnFocusRef` implementation for full WCAG 2.4.3. -1: scrollIntoView with smooth behavior may still feel jumpy on low-end devices even with reduced-motion check. |
| **Total** | **40/50** | |

---

## Part 4: Option C — Asset (Split Hero + Inline Auth)

### 4.1 Design Philosophy

**Pattern**: Calendly/HubSpot inline-auth heroes + Supabase (dual CTA: preview vs login) + Typeform (left copy / right interactive panel)

**Core mental model**: Returning users convert in the hero without ANY navigation. The tab panel `[미리보기 | 로그인]` in the right column of the hero simultaneously serves two audiences: (1) prospects who want to see the product, (2) returning users who want to log in. Zero-click conversion for the second group.

**Emotional response**: Efficient. "I can already log in right here without going to another page." For frequent-returning users (이팀장 who logs in daily), this is the most ergonomic option. For new visitors, the preview tab shows the product visual.

**5-second test result**: Left column: "조직도를 그리면 AI 팀이 움직인다." + body. Right column: NEXUS screenshot immediately visible on preview tab. Value prop ✅ — but 60/40 split means h1 text starts at 60% viewport width, requiring shorter copy.

### 4.2 Vision Principle Alignment — Option C

| Principle | Score | Evidence |
|-----------|-------|---------|
| P1: Name the Machine | ✅ Full | NEXUS screenshot in preview tab shows named agents |
| P2: Depth is Data | ✅ Partial | Preview tab shows NEXUS static. No Tracker visible in hero. |
| P3: Zero-Delay Feedback | ✅✅ Strongest | Login tab = 0-click auth from hero. No navigation. |
| P4: Commander's View | ✅ Good | Left-aligned copy = authority. Split 60/40 = information-dense. |
| P5: Show the Org | ✅ Full | Preview tab shows NEXUS canvas immediately |
| P6: Typography Hierarchy | ⚠️ Partial | h1 constrained to 60% viewport width — shorter, less dramatic |
| P7: Dark Mode First | ✅ Full | bg-zinc-950 throughout |

### 4.3 User Flow Analysis — Option C

#### Conversion Flow 1: Returning User (Best Case)
```
OPTION C — Returning User (최고 시나리오)
Steps: 0 navigation + 2 inputs = instant

Hero loads → Right panel defaults to 로그인 tab (or 미리보기 tab)
Option C-Login: Tab already shows login form
  → Fill username + password → submit → /hub

No page load. No modal open action. Login form IS the hero right column.
Friction: LOWEST of all options for returning users.
```

#### Conversion Flow 2: New Visitor (Preview → Signup)
```
OPTION C — New Visitor
Steps: 3 interactions

Step 1: Hero loads → default tab = 미리보기 (NEXUS screenshot visible)
  Value prop: left h1 + right product visual

Step 2: Visitor scrolls page (optional) OR
  Visitor clicks 로그인 tab → sees login form → needs account?
  → clicks "계정이 없으신가요? 무료 체험" link in form

Step 3: → /signup (page navigation to separate signup page)

Note: No inline SIGNUP form — only login. Signup = separate page.
(Inline signup would make the tab panel too complex — form gets longer)
```

#### Conversion Flow 3: Enterprise Research
```
OPTION C — Enterprise Research
Same as Options A/B — full scroll through feature sections.
Same section structure as Option A below the hero.
```

### 4.4 Tab Panel Implementation

```tsx
// HeroTabPanel.tsx — Option C right column tab widget
// ARIA rules for tab widgets:
//   outer div: NO role (not a dialog, not a landmark)
//   role="tablist" on the tab container
//   role="tab" on each tab button (with aria-selected, aria-controls)
//   role="tabpanel" on each panel (with id, aria-labelledby)
//   inactive panels: hidden attribute (not just CSS display:none)
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'

type Tab = 'preview' | 'login'

export function HeroTabPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('preview')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const loginToStore = useAuthStore(s => s.login)

  return (
    <div className="w-full">  {/* outer div: NO role="tabpanel" here */}
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="제품 미리보기 또는 로그인"
        className="flex border-b border-zinc-800 mb-6"
        onKeyDown={(e) => {
          // WCAG 2.1.1: ArrowLeft/ArrowRight navigate between tabs (roving tabindex)
          const tabs: Tab[] = ['preview', 'login']
          const idx = tabs.indexOf(activeTab)
          let next: Tab | undefined
          if (e.key === 'ArrowRight') next = tabs[(idx + 1) % tabs.length]
          if (e.key === 'ArrowLeft')  next = tabs[(idx - 1 + tabs.length) % tabs.length]
          if (next) {
            setActiveTab(next)
            document.getElementById(`tab-${next}`)?.focus()
          }
        }}
      >
        {(['preview', 'login'] as Tab[]).map(tab => (
          <button
            key={tab}
            role="tab"
            id={`tab-${tab}`}
            aria-selected={activeTab === tab}
            aria-controls={`panel-${tab}`}
            tabIndex={activeTab === tab ? 0 : -1}  // roving tabindex: only active tab in Tab order
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-150 motion-reduce:transition-none",
              activeTab === tab
                ? "border-indigo-500 text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab === 'preview' ? '미리보기' : '로그인'}
          </button>
        ))}
      </div>

      {/* Preview tab panel */}
      <div
        role="tabpanel"
        id="panel-preview"
        aria-labelledby="tab-preview"
        hidden={activeTab !== 'preview'}
      >
        {/* Static screenshot — NOT live ReactFlow canvas (too heavy, no pre-login data) */}
        <div
          className="rounded-xl border border-zinc-800 overflow-hidden shadow-xl shadow-black/50 bg-zinc-900"
          role="img"
          aria-label="CORTHEX NEXUS 조직도 캔버스 미리보기"
        >
          <div className="bg-zinc-800/60 border-b border-zinc-700 px-4 py-2 flex items-center gap-2" aria-hidden="true">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zinc-600" />
              <div className="w-3 h-3 rounded-full bg-zinc-600" />
              <div className="w-3 h-3 rounded-full bg-zinc-600" />
            </div>
            <span className="text-xs text-zinc-500 ml-2">NEXUS</span>
          </div>
          <img
            src="/assets/nexus-screenshot.png"
            alt="NEXUS 조직도 — 비서실장, CIO, 개발팀장이 연결된 AI 조직 구조"
            className="w-full"
          />
          {/* ⚠️ NOT a live ReactFlow canvas — static <img> only.
              ReactFlow is too heavy for public pre-login page.
              No session/agent data available before authentication. */}
        </div>
        <p className="text-center text-sm text-zinc-500 mt-4">
          ↑ 실제 NEXUS 조직도 편집기
        </p>
      </div>

      {/* Login tab panel */}
      <div
        role="tabpanel"
        id="panel-login"
        aria-labelledby="tab-login"
        hidden={activeTab !== 'login'}
      >
        {/* NEVER use <form action method="POST"> — causes page reload in SPA */}
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: data.get('username'),
                password: data.get('password'),
              }),
            })
            if (res.ok) {
              const json = await res.json()
              // Store token BEFORE navigation — auth-store reads localStorage on init
              // Keys verified from packages/app/src/stores/auth-store.ts lines 22–24
              localStorage.setItem('corthex_token', json.data.token)
              localStorage.setItem('corthex_user', JSON.stringify(json.data.user))
              loginToStore(json.data.token, json.data.user)  // sync in-memory store
              navigate('/hub')  // SPA navigation — no page reload
            }
            // else: show inline error
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="hero-username" className="block text-sm font-medium text-zinc-400 mb-1.5">
              이메일 또는 아이디
            </label>
            <input
              id="hero-username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full h-11 bg-zinc-800 border border-zinc-700 rounded-lg px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/20 transition-colors duration-150 motion-reduce:transition-none"
              placeholder="아이디 입력"
            />
          </div>
          <div>
            <label htmlFor="hero-password" className="block text-sm font-medium text-zinc-400 mb-1.5">
              비밀번호
            </label>
            <div className="relative">
              <input
                id="hero-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="w-full h-11 bg-zinc-800 border border-zinc-700 rounded-lg px-4 pr-11 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/20 transition-colors duration-150 motion-reduce:transition-none"
                placeholder="비밀번호 입력"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 w-6 h-6 flex items-center justify-center"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors duration-150 motion-reduce:transition-none"
          >
            로그인 →
          </button>
          <p className="text-center text-sm text-zinc-500">
            계정이 없으신가요?{' '}
            <Link to="/signup"
               className="text-indigo-400 hover:text-indigo-300 transition-colors duration-150 motion-reduce:transition-none">
              무료 체험 시작
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
```

#### Split Hero (60/40)
```tsx
// HeroSplitSection.tsx — Option C
import { Link } from 'react-router-dom'

export function HeroSplitSection() {
  return (
    <section
      className="min-h-screen bg-zinc-950 pt-16 flex items-center"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-7xl mx-auto px-8 py-20 w-full grid grid-cols-[3fr_2fr] gap-16 items-center">
        {/* Left column — 60%: copy + CTAs */}
        <div>
          <p className="text-indigo-400 text-xs font-semibold tracking-[0.25em] uppercase mb-6">
            AI 조직 관리 플랫폼
          </p>
          <h1
            id="hero-heading"
            className="text-5xl xl:text-6xl font-bold text-zinc-50 leading-[1.05] tracking-tight mb-6"
          >
            조직도를 그리면<br />
            <span className="text-indigo-400">AI 팀</span>이 움직인다.
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed mb-8 max-w-xl">
            AI 에이전트를 조직도로 관리하는 새로운 방법.
            NEXUS에서 부서와 에이전트를 배치하면 즉시 운영이 시작됩니다.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link to="/signup"
               className="bg-indigo-600 hover:bg-indigo-500 text-white text-base font-semibold px-6 py-3 rounded-lg transition-colors duration-150 motion-reduce:transition-none">
              무료 체험 시작 →
            </Link>
            <Link to="/demo"
               className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 text-base font-medium px-6 py-3 rounded-lg transition-colors duration-150 motion-reduce:transition-none">
              데모 신청
            </Link>
          </div>
        </div>

        {/* Right column — 40%: tab panel (preview | login) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <HeroTabPanel />
        </div>
      </div>
    </section>
  )
}
```

### 4.5 Option C Scoring

| Criterion | Score | Justification |
|-----------|-------|--------------|
| CORTHEX Vision Alignment | 8/10 | P3 (Zero-Delay Feedback) ✅✅ — returning user logs in from hero itself. P5 (Show the Org) ✅ — NEXUS preview tab. P4 ✅ left-aligned authority. -1: h1 constrained to 60% viewport = smaller text, less Commander impact. -1: Tab widget creates ambiguity on arrival — "which tab should I click?" slightly dilutes the product-first message. |
| Conversion UX | 8/10 | Returning users: LOWEST friction (0 page navigation, 0 modal interaction) ✅✅. Default preview tab = product visual for new visitors ✅. "계정이 없으신가요?" signup link in login tab ✅. -1: New visitor must click tab to see login form — adds 1 click vs modal (which opens on CTA click). -2: Signup flow goes to separate page — inconsistent with zero-page-load promise for returning users. |
| Implementation Complexity | 8/10 | Tab widget ARIA is well-specified ✅. No modal overlay complexity ✅. No IntersectionObserver needed ✅. -1: Tab state management (useState + hidden attribute pattern). -1: Form submit + tab switch state interaction needs care. |
| Performance / SEO | 8/10 | Static screenshot (not live ReactFlow canvas) ✅. No video assets ✅. Preview tab default = image LCP (acceptable at WebP). Login tab (hidden) = deferred rendering ✅. -1: hero right column height = determined by tab content — may cause layout shift when tab switches. -1: `hidden` attribute on inactive panels is correct a11y but requires CSS careful management to avoid flash. |
| Accessibility | 9/10 | `role="tablist"` + `role="tab"` + `aria-selected` + `aria-controls` ✅. Outer div: NO `role` ✅. `hidden` attribute on inactive panels ✅. `aria-label` on password toggle ✅. SPA form pattern ✅. ArrowLeft/ArrowRight `onKeyDown` + roving `tabIndex` ✅ (R2 fix). -1: Preview tab `<img>` alt text must be meaningful (placeholder asset until launch). |
| **Total** | **41/50** | *(+1 from R2: Accessibility 8→9 — ArrowKey handler + roving tabindex implemented)* |

### 4.6 Option C Page Assembly

```tsx
// LandingPageC.tsx — Option C assembly (Split Hero + Inline Auth)
import { Link } from 'react-router-dom'

export function LandingPageC() {
  return (
    <>
      <header>  {/* role="banner" landmark */}
        <LandingNav />
      </header>
      <main>
        <HeroSplitSection />     {/* Section 1 — 60/40 split hero + HeroTabPanel */}
        <TrustRail />            {/* Section 2 */}
        <HowItWorks />           {/* Section 3 */}
        <HubFeatureSection />    {/* Section 4 */}
        <NexusFeatureSection />  {/* Section 5 */}
        <AgoraArgosSection />    {/* Section 6 */}
        <TestimonialsSection />  {/* Section 7 */}
        <PricingSection />       {/* Section 8 */}
        {/* Section 9 — Final CTA */}
        <section className="bg-indigo-950 border-t border-indigo-900 py-20 text-center">
          <h2 className="text-3xl font-bold text-zinc-50 mb-4">지금 바로 AI 팀을 구성하세요.</h2>
          <p className="text-zinc-400 mb-8">무료로 시작하세요. 카드 불필요.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup"
               className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-150 motion-reduce:transition-none">
              무료 체험 시작 →
            </Link>
            <Link to="/demo"
               className="border border-indigo-700 hover:border-indigo-500 text-indigo-300 hover:text-indigo-100 font-medium px-8 py-4 rounded-lg transition-colors duration-150 motion-reduce:transition-none">
              데모 신청
            </Link>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  )
}
```

---

## Part 5: Cross-Option Comparison + Recommendation

### 5.1 Score Summary

| Criterion | Option A (Signal) | Option B (Dispatch) | Option C (Asset) |
|-----------|-----------------|---------------------|-----------------|
| Vision Alignment | 10/10 | 8/10 | 8/10 |
| Conversion UX | 9/10 | 9/10 | 8/10 |
| Implementation Complexity | 9/10 | 7/10 | 8/10 |
| Performance / SEO | 9/10 | 8/10 | 8/10 |
| Accessibility | 9/10 | 8/10 | 9/10 |
| **Total** | **46/50** | **40/50** | **41/50** |

*(Option A leads on Vision Alignment and Implementation Complexity due to NEXUS canvas above fold, zero modal state management, and purely declarative HTML. Option B leads on returning-user conversion (0-nav modal). Option C at 41/50 after R2 ArrowKey fix — best for returning-user ergonomics.)*

### 5.2 Conversion Path Comparison

| User Type | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| New visitor (pain-aware) | "무료 체험" → /signup | Modal (0 nav) | Tab → /signup (1 nav) |
| New visitor (research) | 9 sections, pricing accessible | 7 sections, sticky nav | 9 sections |
| Returning user | Nav "로그인" → /login (1 nav) | Modal (0 nav) | Login tab in hero (0 nav) |
| Enterprise buyer | 9 sections + "데모 신청" | 7 sections + modal | 9 sections + "데모 신청" |
| **Winner** | Enterprise research | Pain-aware + returning | Returning user |

### 5.3 Implementation Risk Comparison

| Concern | Option A | Option B | Option C |
|---------|----------|----------|----------|
| Modal state management | None | Required (complex) | None |
| Tab state management | None | None | Required |
| Video asset production | None | Required (nexus-demo.mp4) | None |
| IntersectionObserver | None | Required (sticky nav) | None |
| Screenshot assets needed | 3 (NEXUS, Hub, NEXUS2) | 1 (nexus-screenshot.png) | 1 (nexus-screenshot.png) |
| Auth bugs impact | None (separate page) | Modal bug = no login | Tab bug = no login |

### 5.4 Recommendation

**Option A (Signal — Dark Command Center) — RECOMMENDED for launch (46/50)**

**Four-point rationale**:

1. **P5 Vision fidelity**: The NEXUS canvas above fold IS the CORTHEX pitch. "Draw the org chart → AI team moves" becomes literal when the visitor sees named agent nodes in the hero before scrolling. Options B and C delay this reveal.

2. **Lowest implementation risk**: No modal state, no tab state, no video asset, no IntersectionObserver. Option A uses `<Link>` for CTAs but has zero auth state in the landing page itself — auth logic is fully isolated on the `/login` and `/signup` routes. Fewest React hooks per component of all 3 options.

3. **SEO and performance**: Static HTML sections with no client-side state = best Lighthouse score, best SSR/SSG compatibility, best crawler accessibility. Auth pages on separate routes are more maintainable and more secure.

4. **Enterprise credibility**: Left-aligned editorial copy + 9-section depth signals seriousness. Enterprise buyers scroll. The 9 sections (including testimonials, pricing, and the final CTA) give them everything needed for a decision.

**Option B upgrade path**: When analytics show high pain-recognition in target users (bounce rate < 40% on section 2), add a "로그인" modal to Option A's existing page — capturing Option B's conversion advantage without restructuring the page.

**Option C when to adopt**: Post-launch, if returning user (이팀장) login frequency is high and `/login` page-load time is the friction point. Option C's inline login form is the right ergonomic solution for a user who logs in 10+ times per week.

### 5.5 Universal Decisions (All Options)

```
AUTH INVARIANTS:
- NEVER use <form action method="POST"> in SPA — causes full page reload
- Login endpoint: POST /api/auth/login (body: { username, password })
- Authenticated users: JWT present → redirect to /hub (bypass landing)
- Signup flow: always → /signup (separate page, not inline)
- Onboarding: DEFERRED — do NOT design

CORRECT auth success pattern (5 steps — verified from auth-store.ts + login.tsx):
  1. const res = await fetch('/api/auth/login', ...)
  2. const json = await res.json()
  3. localStorage.setItem('corthex_token', json.data.token)       // MUST — auth-store reads localStorage on init
  4. localStorage.setItem('corthex_user', JSON.stringify(json.data.user))
  5. loginToStore(json.data.token, json.data.user)  // sync in-memory Zustand state
     + navigate('/hub')  // SPA navigation (no page reload)

⚠️ If step 3+4 omitted: page reload re-initializes auth-store from localStorage → no token → ProtectedRoute → redirect to /login → login silently fails

LINK STRATEGY (landing page):
- Landing IS a packages/app BrowserRouter route (route "/" renders LandingPage — confirmed App.tsx)
- ALWAYS use <Link to="/login">, <Link to="/signup">, <Link to="/demo"> — NOT bare <a href>
- <a href> inside BrowserRouter = full HTML page reload (re-downloads all JS, loses router state)
- Auth success: loginToStore(token, user) + navigate('/hub') — matches login.tsx pattern
- Do NOT use window.location.href (bypasses auth store and router context)
- External links only (if any) may remain as <a href> — but all CTAs are internal SPA routes

STATIC DOT GRID:
- STATIC CSS radial-gradient — NOT JS-animated (unlike Linear's opacity stagger)
- motion-reduce:hidden on the div (precautionary, not required since it's static)
- Tailwind class: bg-[radial-gradient(circle_at_1px_1px,rgb(99_102_241/0.12)_1px,transparent_0)] bg-[length:32px_32px]

MODAL (Option B only):
- MUST use <dialog> + .showModal() — NOT a div overlay
- .showModal() activates ::backdrop, native focus-trap, and Escape-to-close
- backdrop:bg-black/60 ONLY works with .showModal() (not .show())
- requestAnimationFrame → first input focus on open
- Return focus to trigger button on close (WCAG 2.4.3)

TAB WIDGET (Option C only):
- outer div: NO role
- role="tablist" on tab container
- role="tab" + aria-selected + aria-controls on each tab button
- role="tabpanel" + id + aria-labelledby on each panel
- inactive panels: hidden attribute (NOT CSS display:none alone)
- Keyboard: ArrowLeft/ArrowRight to navigate between tabs
- NEXUS preview tab: static <img> NOT live ReactFlow canvas (too heavy, no pre-login data)

PRICING:
- All prices are PLACEHOLDER — replace before launch
- Starter ₩99,000/월 | Business ₩299,000/월 | Enterprise 문의
- Comment: {/* ⚠️ 가격 미정 — 런칭 전 실제 가격으로 교체 필요 */}

TRANSITIONS:
- All interactive elements: transition-colors duration-150 motion-reduce:transition-none
- Page-level animations: motion-reduce:hidden / motion-reduce:animate-none
- Scroll behavior: check window.matchMedia('(prefers-reduced-motion: reduce)') before smooth scrollIntoView

ASSETS NEEDED BEFORE LAUNCH (ALL OPTIONS):
- /assets/nexus-screenshot.png — NEXUS canvas with named agent nodes
- /assets/hub-screenshot.png — Hub 3-column layout (SessionPanel + Chat + Tracker)
- Option B only: /assets/nexus-demo.mp4 — looping NEXUS canvas screencast
```

---

## Fix Log

### Round 1 Draft
*Critics: verify all technical specs, ARIA patterns, Tailwind classes, auth patterns, scoring justifications, and section analyses. Focus on: (1) auth endpoint path correctness, (2) dialog/modal ARIA, (3) tab widget keyboard navigation, (4) static vs animated dot grid distinction, (5) scoring justifications completeness.*

### Round 1 → Round 2 (11 fixes)

**Critic-A (7.8/10) + Critic-B (7/10) combined:**

1. **S1/M3** (A+B): HeroTabPanel — added `onKeyDown` ArrowLeft/ArrowRight handler + `tabIndex={active ? 0 : -1}` roving tabindex. WCAG 2.1.1 compliance. `document.getElementById().focus()` on next tab.
2. **M1** (A+B): AuthModal — added `prevFocusRef` saving `document.activeElement` on open. Focus restored in `transitionend` listener. WCAG 2.4.3.
3. **M3** (B→revised to A+B): AuthModal exit animation — replaced `isClosing` state + `onTransitionEnd` with `addEventListener('transitionend', ..., { once: true })` in `useEffect`. `prefers-reduced-motion` check skips animation and calls `dialog.close()` directly. `{ once: true }` prevents double-fire from multiple CSS properties transitioning.
4. **M2** (A): Option A hero — blank `<div className="h-[440px]" />` replaced with `<img src="/assets/nexus-screenshot.png" alt="...">`. Removed `role="img"` from wrapper div.
5. **M4** (B) → **CORRECTED by S2 cross-talk**: §5.5 LINK STRATEGY revised — landing IS a BrowserRouter route (not separate SSG). Use `<Link to>` not `<a href>`. Auth: `loginToStore(token, user)` + `navigate('/hub')` — NOT `window.location.href`.
6. **L1** (A): §1.4 table — `<dialog>` has implicit `role="dialog"` noted.
7. **L2** (A): All 3 page assemblies — `<LandingNav />` wrapped in `<header>` for `role="banner"`.
8. **L3** (A): FeatureNav — `aria-current={active ? 'true' : undefined}` added.
9. **L4** (A): `LandingFooter.tsx` implementation added (2-column nav + legal row).
10. **L5** (A): `LandingPageC.tsx` assembly added at §4.6.
11. **L1** (B): TrustRail — `flex-col lg:flex-row lg:justify-between` with separate metric/logo containers.

### Round 2 Cross-talk → Round 2 Final (2 fixes)

**Critic-A Cross-talk supplement (score revised 7.8 → 7.0):**

12. **S2** (A cross-talk): All `<a href>` → `<Link to>` in LandingNav, HeroSection, HeroSplitSection, AuthModal, HeroTabPanel, LandingPageA/C final CTA assemblies. `window.location.href = '/hub'` → `loginToStore(token, user) + navigate('/hub')` in AuthModal + HeroTabPanel forms. §1.2 SPA rule and §5.5 LINK STRATEGY block updated to reflect `<Link>` + auth store pattern. §5.4 "server-rendered HTML `<a>` CTAs" reasoning corrected.
13. **M3** (A cross-talk): AuthModal exit animation implementation aligned — `useEffect` `else` branch adds `addEventListener('transitionend', ..., { once: true })` with `prefers-reduced-motion` bypass. `isClosing` state removed. Class reverts to `open ? "opacity-100" : "opacity-0"` (simple).

### Round 2 Final → Round 3 (3 fixes)

**Critic-A (8.5/10) + Critic-B (7/10) Round 2:**

14. **S1/S1** (A+B blocking): AuthModal + HeroTabPanel form submit — added `localStorage.setItem('corthex_token', json.data.token)` + `localStorage.setItem('corthex_user', JSON.stringify(json.data.user))` before `navigate('/hub')`. Keys verified from `packages/app/src/stores/auth-store.ts` lines 22–24. §5.5 AUTH INVARIANTS updated with explicit 5-step pattern + warning about silent redirect loop if omitted.
15. **M5** (B) = **M-level** (A): AuthModal ✕ button — `onClick={() => dialogRef.current?.close()}` → `onClick={() => onClose()}`. Routes through parent `open=false` → `useEffect` → `transitionend` listener → `.close()` + focus restore. All close paths (✕ button, Escape, backdrop) now go through `onClose()`.
16. **Escape key** (A): Added `cancel` event listener in separate `useEffect([onClose])` to intercept native dialog `cancel` event, call `e.preventDefault()` + `onClose()`. Prevents Escape key from calling `.close()` directly and bypassing the animation gate.

---

*Document: Phase 2-3 Landing Page Options — Deep Analysis + React + Tailwind CSS Implementation Spec*
*Round 3 — 2026-03-12*
