# Context Snapshot — Phase 1, Step 1-3: Landing Page Research

**Date**: 2026-03-12
**Score**: 9.35/10 (Critic-A: 9.2/10, Critic-B: 9.5/10) — PASS
**Output file**: `_corthex_full_redesign/phase-1-research/landing/landing-page-research.md`
**Rounds**: 3 (Round 1 → 10 issues → Round 2 → 5 new issues + 6 already-fixed confirmed → Round 3 all verified)
**Note**: Critics referenced old line numbers in R2/R3 due to ~60-line addition shifting all subsequent positions. Same issue as Phase 1-2. Resolved by providing current grep-confirmed line numbers.

---

## Key Decisions & Facts Established

### Landing Page Scope
- **Public marketing page** for unauthenticated visitors at `/` (new route)
- Authenticated users: auto-redirect to `/hub` (JWT guard)
- NOT the post-login home (current spec has `/` = post-login — redesign introduces public landing)
- Desktop-first: min 1280px. Mobile: scrollable, no interactive demo
- **Onboarding: DEFERRED** — do NOT design

### Route Architecture
```
Unauthenticated: https://corthex.io/ → [LANDING PAGE]
  → CTA "무료 체험" → /signup
  → CTA "로그인" → /login or modal
  → CTA "데모 신청" → contact/external

Authenticated (JWT): https://corthex.io/ → redirect → /hub
```

### 9 Reference Products Analyzed
| Product | URL | Key pattern for CORTHEX |
|---------|-----|--------------------------|
| Linear | https://linear.app | Static dot grid hero + product screenshot + "Sign In" always in nav |
| Cursor | https://cursor.com | Product IDE visible immediately, benefit-driven headline |
| Vercel | https://vercel.com | Context-preserving nav, enterprise credibility |
| Anthropic | https://anthropic.com | Typography-dominant, mission-focused |
| CrewAI | https://crewai.com | Problem/solution narrative structure |
| Notion | https://notion.com | Aspirational metric, bento grid |
| Supabase | https://supabase.com | Inline dashboard shortcut in hero |
| Loom | https://loom.com | Video-first product demo |
| Stripe | https://stripe.com | Left-aligned hero, "Contact Sales", enterprise credibility |

### TOP 3 Layout Options

**Option A: Signal — Dark Command Center (RECOMMENDED)**
- Hero: static dot grid bg (`radial-gradient`, NOT animated) + left-aligned h1 + NEXUS screenshot
- Auth: separate `/login` page — simplest, lowest complexity
- 9 sections: Hero → Trust Rail → How It Works → Hub → NEXUS → AGORA+ARGOS → Testimonials → Pricing → Final CTA
- Nav: `/features`, `/pricing`, `/docs`, `/blog` + "로그인" → `/login` + "무료 체험" → `/signup`
- `aria-labelledby="hero-heading"` on section, `id="hero-heading"` on h1, `role="img"` on NEXUS div

**Option B: Dispatch — Story + Modal Auth**
- Hero: typography-dominant "당신의 AI 팀은 지금 무엇을 하고 있나요?" + minimal 2-item nav
- Auth: `<dialog>` modal with `.showModal()` + native focus-trap (NO external library)
- NEXUS Section 3: `<video autoPlay muted loop playsInline className="motion-reduce:hidden">` + `<img>` static fallback
- Forms: `onSubmit` + `e.preventDefault()` + `fetch('/api/auth/login', ...)` — NO `method="POST"` (would cause page reload)
- Sticky feature nav: `sticky top-[64px] z-40` + `scrollIntoView({ behavior: 'smooth' })` with `prefers-reduced-motion` check

**Option C: Asset — Split Hero + Inline Auth**
- Hero: 60/40 split — left copy + right tab panel (`미리보기` | `로그인`)
- Auth: inline tab panel in hero right column — zero page load for returning users
- ARIA: `role="tablist"` + `role="tab"` + `role="tabpanel"` + `aria-selected` + `hidden`
- ⚠️ Outer container has NO `role` — only the two inner panels carry `role="tabpanel"`
- Preview tab: static `<img>` screenshot (NOT live ReactFlow canvas — too heavy, no pre-login data)

### Critical Implementation Specs

**Static dot grid (Option A) — NOT animated:**
```tsx
<div
  className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(99_102_241/0.12)_1px,transparent_0)] bg-[length:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)] motion-reduce:hidden"
  aria-hidden="true"
/>
// NOTE: Static CSS pattern. motion-reduce:hidden as precautionary safeguard only.
// Linear's dot grid is JS-animated (opacity stagger). CORTHEX's is static radial-gradient.
```

**Option B `<dialog>` (MUST use `.showModal()`):**
```tsx
const dialogRef = useRef<HTMLDialogElement>(null)
useEffect(() => {
  if (open) {
    dialogRef.current?.showModal()  // activates ::backdrop + focus-trap + Escape
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus())
  } else {
    dialogRef.current?.close()
  }
}, [open])
// backdrop:bg-black/60 ONLY works with .showModal() (not .show())
```

**All auth forms (SPA — no page reload):**
```tsx
<form onSubmit={async (e) => {
  e.preventDefault()
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: ..., password: ... }),
  })
  if (res.ok) window.location.href = '/hub'
}} className="space-y-4">
// NEVER use <form action="..." method="POST"> in React SPA — causes full page reload
```

**Pricing placeholder (all options):**
```tsx
{/* ⚠️ 가격 미정 — 런칭 전 실제 가격으로 교체 필요 */}
// ₩99,000/월 (Starter), ₩299,000/월 (Business), 문의 (Enterprise) = PLACEHOLDER ONLY
```

### ARIA Landmarks (all options)
| Element | ARIA |
|---------|------|
| Main nav | `<nav aria-label="Main navigation">` |
| Hero section | `<section aria-labelledby="hero-heading">` + `<h1 id="hero-heading">` |
| NEXUS product visual | `role="img" aria-label="CORTHEX NEXUS 조직도 캔버스..."` |
| Option B modal | `role="dialog" aria-modal="true" aria-labelledby="auth-modal-heading"` |
| Option C tab widget | outer div: no role; `role="tablist"`, `role="tab"`, `role="tabpanel"` inside |
| All transitions | `motion-reduce:transition-none` or `motion-reduce:hidden` |

### Recommendation
**Option A (Signal)** for launch:
- 1 screenshot asset (NEXUS canvas)
- Lowest complexity — no modal focus-trap, no tab state management
- Static dot grid = military precision aesthetic with zero JS
- Auth via `/login` is safest for JWT (no SPA state issues)

**Option C upgrade path**: Once 4+ quality screenshots ready and product is visually polished.
**Option B best for**: Content/SEO campaigns targeting "how to manage AI teams" search intent.

---

## Issues Fixed (21 total across 3 rounds)

**Round 1 → Round 2 (10 issues)**:
1. ASCII "ANIMATED DOT GRID" → "dot grid pattern bg (static CSS)"
2. Removed "Dot grid animation" from pros → "Static dot grid pattern"
3. Removed cons note about motion-reduce (not needed for static)
4. Recommendation conclusion: "animated dot grid" → "static dot grid pattern"
5. Options B and C: Added full Pricing + Final CTA ASCII sections
6. Option B Section 3: Added `<video>` + `<img>` fallback spec
7. Option B sticky nav: Added `sticky top-[64px]` + `scrollIntoView` spec
8. Nav `href="#"` → real routes `/features`, `/pricing`, `/docs`, `/blog`
9. Option C NEXUS preview: `<img>` with "⚠️ NOT ReactFlow" comment
10. Pricing `{/* ⚠️ 가격 미정 */}` in all 3 options

**Round 2 → Round 3 (5 new issues)**:
11. Option B `<dialog>`: Added `useRef` + `useEffect` + `.showModal()` + `ref={dialogRef}`
12. Both B and C forms: `method="POST"` → `onSubmit` + `e.preventDefault()` + `fetch`
13. Option B: Added minimal nav + typography-dominant hero code block
14. Option C outer container: Removed `role="tabpanel"` (invalid ARIA nesting)
15. Apple HIG source removed; focus-trap cons → native `.showModal()` explanation

---

## Next Step
Phase 1 Research COMPLETE — all 3 steps passed.
Next: Phase 2 Analysis (waiting for team-lead instruction)
