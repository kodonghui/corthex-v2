# Context Snapshot — Phase 2, Step 2-3: Landing Page Options Deep Analysis + React Implementation Spec

**Date**: 2026-03-12
**Score**: 9.25/10 (Critic-A: 9.5/10, Critic-B: 9/10) — PASS
**Output file**: `_corthex_full_redesign/phase-2-analysis/landing-analysis.md`
**Rounds**: 3 full rounds + cross-talk supplement (R2)
**Issues resolved**: 16 total (R1: 11, R2+cross-talk: 3, R3: 2)

---

## Key Decisions & Facts Established

### Final Recommendation
**Option A (Signal — Dark Command Center)** — 46/50 RECOMMENDED
- Static dot grid hero + NEXUS canvas screenshot above fold
- Separate `/login` page for auth (auth logic NOT embedded in landing)
- 9 sections: Hero → Trust Rail → How It Works → Hub → NEXUS → AGORA+ARGOS → Testimonials → Pricing → Final CTA
- Pure `<Link to>` navigation — landing IS a BrowserRouter SPA route

**Option B (Dispatch — Story + Modal Auth)** — 40/50
- Rhetorical h1: "당신의 AI 팀은 지금 무엇을 하고 있나요?"
- `<dialog>.showModal()` modal with full animation gate + focus management

**Option C (Asset — Split Hero + Inline Auth)** — 41/50
- 60/40 split hero (left copy / right tab panel)
- `role="tablist"` + ArrowKey nav + roving tabindex

---

## CRITICAL Implementation Invariants

### Auth Pattern (VERIFIED from auth-store.ts + login.tsx)
```tsx
// 5-step auth success pattern — BOTH AuthModal + HeroTabPanel:
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'

const navigate = useNavigate()
const loginToStore = useAuthStore(s => s.login)

// On form submit success:
const json = await res.json()
localStorage.setItem('corthex_token', json.data.token)      // auth-store.ts L22
localStorage.setItem('corthex_user', JSON.stringify(json.data.user))  // auth-store.ts L23
loginToStore(json.data.token, json.data.user)  // sync in-memory Zustand state
navigate('/hub')  // SPA navigation — no page reload

// ⚠️ If localStorage.setItem omitted: page reload re-initializes auth-store from
//    localStorage → no token → ProtectedRoute → redirect to /login → silent login failure
```

### Auth Endpoint
```
POST /api/auth/login — body: { username, password }
Response: { data: { token: string, user: object } }
```

### NEVER patterns
```tsx
window.location.href = '/hub'  // bypasses auth store + router context
<form action="/api/auth/login" method="POST">  // full page reload in SPA
<a href="/login">  // use <Link to="/login"> inside BrowserRouter
```

### Link Strategy
- Landing IS a BrowserRouter SPA route (route "/" renders LandingPage)
- All internal CTAs use `<Link to>` from react-router-dom
- `import { Link } from 'react-router-dom'` in every landing component

### AuthModal — Full Close Path Pattern (Option B)
```tsx
// ALL close paths must route through onClose() — never call .close() directly
// 1. ✕ button:
<button onClick={() => onClose()} aria-label="모달 닫기">✕</button>

// 2. Escape key — intercept native cancel event:
useEffect(() => {
  const dialog = dialogRef.current
  const handleCancel = (e: Event) => { e.preventDefault(); onClose() }
  dialog?.addEventListener('cancel', handleCancel)
  return () => dialog?.removeEventListener('cancel', handleCancel)
}, [onClose])

// 3. Programmatic close — parent sets open=false → useEffect → transitionend → .close()
useEffect(() => {
  if (open) {
    prevFocusRef.current = document.activeElement
    dialogRef.current?.showModal()
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus())
  } else {
    const dialog = dialogRef.current
    if (!dialog) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      dialog.close()
      ;(prevFocusRef.current as HTMLElement)?.focus?.()
    } else {
      dialog.addEventListener('transitionend', () => {
        dialog.close()
        ;(prevFocusRef.current as HTMLElement)?.focus?.()
      }, { once: true })  // { once: true } prevents double-fire from opacity + transform
    }
  }
}, [open])
```

### Tab Widget (Option C) — ARIA + Keyboard
```tsx
// tablist: onKeyDown for ArrowLeft/ArrowRight
// tabs: tabIndex={active ? 0 : -1} (roving tabindex)
// panels: hidden={activeTab !== tab} (not CSS display:none)
<div
  role="tablist"
  aria-label="제품 미리보기 또는 로그인"
  onKeyDown={(e) => {
    const tabs: Tab[] = ['preview', 'login']
    const idx = tabs.indexOf(activeTab)
    let next: Tab | undefined
    if (e.key === 'ArrowRight') next = tabs[(idx + 1) % tabs.length]
    if (e.key === 'ArrowLeft')  next = tabs[(idx - 1 + tabs.length) % tabs.length]
    if (next) { setActiveTab(next); document.getElementById(`tab-${next}`)?.focus() }
  }}
>
  <button role="tab" tabIndex={active ? 0 : -1} aria-selected={active} ...>
```

### Static Dot Grid (Option A)
```tsx
// CSS-only — NOT JS-animated. motion-reduce:hidden is precautionary.
<div
  className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(99_102_241/0.12)_1px,transparent_0)] bg-[length:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)] motion-reduce:hidden"
  aria-hidden="true"
/>
```

### NEXUS Preview
- ALL options: static `<img src="/assets/nexus-screenshot.png" alt="...">` — NOT live ReactFlow
- Option B: `<video autoPlay muted loop playsInline aria-hidden="true">` + `<img>` fallback for `prefers-reduced-motion`

### ARIA Landmarks
| Element | Pattern |
|---------|---------|
| Page header | `<header><LandingNav /></header>` — `role="banner"` |
| Nav | `<nav aria-label="Main navigation">` |
| Footer | `<footer>` — `role="contentinfo"` |
| Hero | `<section aria-labelledby="hero-heading">` + `<h1 id="hero-heading">` |
| Modal | `<dialog aria-modal="true" aria-labelledby="auth-modal-heading">` (implicit role="dialog") |
| Tab widget outer | NO role — only inner tablist/tab/tabpanel carry roles |

### TrustRail Responsive
```tsx
<div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
  <div className="flex items-center justify-center gap-8 flex-wrap">{/* metrics */}</div>
  <div className="flex items-center justify-center gap-6 opacity-40">{/* logos */}</div>
</div>
```

---

## Issues Fixed (16 total)

**Round 1 → Round 2 (11 issues):**
1. HeroTabPanel ArrowLeft/ArrowRight + roving tabindex (WCAG 2.1.1)
2. AuthModal prevFocusRef focus restore (WCAG 2.4.3)
3. AuthModal exit animation: `addEventListener('transitionend', { once: true })` + prefers-reduced-motion bypass
4. Option A hero blank div → `<img src="/assets/nexus-screenshot.png">`; wrapper role="img" removed
5. §5.5 LINK STRATEGY: landing IS BrowserRouter route — `<Link to>` not `<a href>`
6. §1.4 table: `<dialog>` implicit role noted
7. All 3 page assemblies: `<LandingNav />` wrapped in `<header>` (role="banner")
8. FeatureNav: `aria-current={active ? 'true' : undefined}`
9. LandingFooter component implemented (2-col nav + legal row)
10. LandingPageC() assembly added (§4.6)
11. TrustRail: `flex-col lg:flex-row` responsive fix

**Round 2 Cross-talk (2 issues):**
12. S2: All `<a href>` → `<Link to>` throughout all components; auth forms: `loginToStore + navigate('/hub')`
13. M3: AuthModal exit animation implementation aligned to `transitionend + { once: true }` approach

**Round 2 Final → Round 3 (3 issues):**
14. JWT localStorage storage: `localStorage.setItem('corthex_token', ...)` + `localStorage.setItem('corthex_user', ...)` added to both forms
15. ✕ button: `onClick={() => onClose()}` — routes through animation + focus gate
16. Escape key: `cancel` event listener intercepts native dialog cancel → `onClose()`

---

## Final Scores
| Option | Total |
|--------|-------|
| A (Signal — Dark Command Center) | **46/50** ← RECOMMENDED |
| B (Dispatch — Story + Modal Auth) | **40/50** |
| C (Asset — Split Hero + Inline Auth) | **41/50** |

---

## Assets Required Before Launch (All Options)
- `/assets/nexus-screenshot.png` — NEXUS canvas with named agent nodes (비서실장, CIO, 개발팀장)
- `/assets/hub-screenshot.png` — Hub 3-column layout (Option A §4-5)
- `/assets/nexus-demo.mp4` — looping NEXUS canvas screencast (Option B only)

---

## Next Step
Phase 2 Analysis complete (Steps 2-1, 2-2, 2-3 all passed). → Phase 3: Design System
