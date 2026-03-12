# Phase 2-3: Landing Page Options — CRITIC-A Review (Round 1)

**Date**: 2026-03-12
**Reviewer**: CRITIC-A (Sally / Marcus / Luna)
**Document reviewed**: `_corthex_full_redesign/phase-2-analysis/landing-analysis.md`
**Round**: 1 — Initial Review

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| S (Blocking) | 1 | Must fix before approval |
| M (Required) | 2 | Must fix before approval |
| L (Minor) | 5 | Fix preferred, non-blocking |

**Cannot approve Round 1. 3 required fixes (1 blocking, 2 required) before Round 2.**

---

## Writer Checklist — Verification Results

| # | Item | Status |
|---|------|--------|
| 1 | Auth endpoint `/api/auth/login` | ✅ Verified against server source |
| 2 | `<dialog>.showModal()` ARIA | ✅ Correct — with one gap (see M1) |
| 3 | Tab widget ARIA roles | ✅ Correct roles — missing keyboard nav (see S1) |
| 4 | Static dot grid — CSS only, no JS | ✅ Correct |
| 5 | NEXUS preview — static `<img>` | ✅ Options B/C correct — Option A gap (see M2) |
| 6 | Form pattern — onSubmit + e.preventDefault() + fetch() | ✅ Both modal + tab forms correct |
| 7 | Scoring justifications — specific and concrete | ✅ Excellent |
| 8 | Tailwind v4 syntax — no `h-18`, no `duration-250` | ✅ All arbitrary values correct |
| 9 | ARIA landmarks | ⚠️ Minor gaps (see L2) |
| 10 | Option A 46/50 recommendation justification | ✅ Well-supported by analysis |

**Auth endpoint**: `packages/server/src/routes/auth.ts` line 131: `authRoute.post('/auth/login', ...)` + `packages/server/src/index.ts` line 127: `app.route('/api', authRoute)` → full path `/api/auth/login` ✅

---

## Issues

### S1 — BLOCKING: Tab widget (Option C) missing ArrowLeft/ArrowRight keyboard navigation + roving tabindex

**Location**: `HeroTabPanel.tsx`, lines 967–984

**Current code** — only `onClick`, no keyboard handler:
```tsx
<button
  key={tab}
  role="tab"
  id={`tab-${tab}`}
  aria-selected={activeTab === tab}
  aria-controls={`panel-${tab}`}
  onClick={() => setActiveTab(tab)}
  className={...}
>
```

**Why blocking**: ARIA 1.2 Tab Pattern (WAI-ARIA 1.2 §3.25) mandates:
1. Arrow keys (ArrowLeft/ArrowRight) move between tabs — NOT the Tab key
2. Tab key moves focus from the active tab DIRECTLY to the active tabpanel
3. Only the active tab should be in the natural Tab sequence (`tabIndex={0}`); inactive tabs must have `tabIndex={-1}` (roving tabindex)

The current implementation puts ALL tab buttons in the natural tab order. Screen reader users using the tab widget pattern will Tab through all tabs (incorrect) and find no arrow key behavior (missing). This fails WCAG 2.1 SC 2.1.1.

The spec correctly documents this in Section 5.5 (line 1249): "Keyboard: ArrowLeft/ArrowRight to navigate between tabs" — but no implementation code is provided. The scoring deducts for it (line 1161). The spec must show the implementation, not just acknowledge the gap.

**Required fix**: Add `onKeyDown` + roving tabindex to `HeroTabPanel`:
```tsx
const TABS: Tab[] = ['preview', 'login']

export function HeroTabPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('preview')

  const handleTabKeyDown = (e: React.KeyboardEvent, currentTab: Tab) => {
    const idx = TABS.indexOf(currentTab)
    let nextTab: Tab | undefined
    if (e.key === 'ArrowRight') nextTab = TABS[(idx + 1) % TABS.length]
    if (e.key === 'ArrowLeft')  nextTab = TABS[(idx - 1 + TABS.length) % TABS.length]
    if (nextTab) {
      setActiveTab(nextTab)
      document.getElementById(`tab-${nextTab}`)?.focus()
    }
  }

  return (
    <div className="w-full">
      <div role="tablist" aria-label="제품 미리보기 또는 로그인" className="flex border-b border-zinc-800 mb-6">
        {TABS.map(tab => (
          <button
            key={tab}
            role="tab"
            id={`tab-${tab}`}
            aria-selected={activeTab === tab}
            aria-controls={`panel-${tab}`}
            tabIndex={activeTab === tab ? 0 : -1}  // roving tabindex
            onKeyDown={(e) => handleTabKeyDown(e, tab)}
            onClick={() => setActiveTab(tab)}
            className={...}
          >
            {tab === 'preview' ? '미리보기' : '로그인'}
          </button>
        ))}
      </div>
      ...
```

`tabIndex={activeTab === tab ? 0 : -1}` ensures only the active tab is in the natural Tab sequence. Arrow keys move focus + switch tabs. Tab key then moves from the active tab to the active tabpanel.

---

### M1 — REQUIRED: AuthModal (Option B) — no focus restoration on close

**Location**: `AuthModal.tsx`, lines 617–627

**Current code**:
```tsx
useEffect(() => {
  if (open) {
    dialogRef.current?.showModal()
    requestAnimationFrame(() =>
      dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus()
    )
  } else {
    dialogRef.current?.close()
    // ← no focus restoration here
  }
}, [open])
```

**Why required**: WCAG 2.4.3 (Level AA) requires focus to return to the triggering element when a dialog closes. Section 5.5 line 1241 explicitly mandates: "Return focus to trigger button on close (WCAG 2.4.3)." The scoring deducts for it (line 873). The spec documents the requirement but the code omits the implementation.

**Required fix**: Save and restore focus:
```tsx
const prevFocusRef = useRef<Element | null>(null)

useEffect(() => {
  if (open) {
    prevFocusRef.current = document.activeElement  // save trigger element
    dialogRef.current?.showModal()
    requestAnimationFrame(() =>
      dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus()
    )
  } else {
    dialogRef.current?.close()
    ;(prevFocusRef.current as HTMLElement)?.focus?.()  // restore focus to trigger
  }
}, [open])
```

---

### M2 — REQUIRED: Option A hero NEXUS visual is blank `<div>` — no `<img>` placeholder shown

**Location**: `HeroSection.tsx` (Option A), lines 303–318

**Current code**:
```tsx
<div
  className="mt-16 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl shadow-black/60 bg-zinc-900"
  role="img"
  aria-label="CORTHEX NEXUS 조직도 캔버스 — 비서실장, CIO, 개발팀장 에이전트가 실시간으로 작동하는 모습"
>
  <div className="bg-zinc-800/60 border-b border-zinc-700 px-4 py-2 ..." aria-hidden="true">...</div>
  {/* Replace with actual NEXUS canvas screenshot before launch */}
  <div className="h-[440px] bg-zinc-900" />  {/* ← blank div */}
</div>
```

**Why required**: Options B and C both show `<img src="/assets/nexus-screenshot.png" alt="...">` as the target implementation. Option A shows a permanently blank div. The `role="img"` wrapper is correct, but developers following this spec will implement a blank grey rectangle. The placeholder `<img>` pattern should be consistent across all options — even if the asset doesn't exist yet, show the correct element.

**Required fix**: Replace blank `<div>` with `<img>` element matching Options B/C pattern:
```tsx
<img
  src="/assets/nexus-screenshot.png"
  alt="CORTHEX NEXUS 조직도 캔버스 — 비서실장, CIO, 개발팀장 에이전트가 실시간으로 작동하는 모습"
  className="w-full"
  // ⚠️ Placeholder path — replace with actual screenshot before launch
/>
```
And remove the `role="img"` from the wrapper div (since the inner `<img>` provides the semantics).

---

### L1 — MINOR: Section 1.4 lists `role="dialog"` for modal — redundant, contradicts code

**Location**: Section 1.4, line 78

Section 1.4 ARIA table: `| Login modal | role="dialog" aria-modal="true" aria-labelledby="auth-modal-heading" |`

But the actual `AuthModal.tsx` code (line 630) correctly uses `<dialog>` without an explicit `role="dialog"` attribute. The HTML5 `<dialog>` element has implicit `role="dialog"` — explicitly adding it is redundant. The code is correct; the table is misleading.

**Fix**: Update Section 1.4 to: `| Login modal | `<dialog>` element (implicit role="dialog") + aria-modal="true" + aria-labelledby="auth-modal-heading" |`

---

### L2 — MINOR: No `<header>` banner landmark in page assembly

**Location**: `LandingPageA`, lines 492–526; `LandingPageB`, lines 808–862

Both assemblies render `<LandingNav />` directly inside the root fragment `<>`. The `<LandingNav>` renders a `<nav>` element (a navigation landmark), but there is no wrapping `<header>` landmark. A top-level `<header>` provides the `role="banner"` landmark — required by WCAG 2.4.1 for bypass blocks and AT navigation.

**Fix**: Wrap `<LandingNav />` in `<header>` in each page assembly:
```tsx
<header>
  <LandingNav />
</header>
<main>
  ...
</main>
```

---

### L3 — MINOR: FeatureNav (Option B) has no `aria-current` for active section

**Location**: `FeatureNav.tsx`, lines 751–760

The sticky feature nav uses `data-active={activeIndex === i}` for CSS styling but provides no ARIA signal for the currently active section. Screen reader users cannot determine which section is currently in view.

**Fix**: Add `aria-current={activeIndex === i ? 'true' : undefined}`:
```tsx
<button
  key={label}
  onClick={() => handleScrollTo(i)}
  data-active={activeIndex === i}
  aria-current={activeIndex === i ? 'true' : undefined}
  className={...}
>
```

---

### L4 — MINOR: `LandingFooter` component referenced but not implemented

**Location**: Lines 523 (`LandingPageA`) and 858 (`LandingPageB`)

`<LandingFooter />` is referenced in both page assemblies but no component code is shown in the spec. A landing page footer includes links, legal copy, and a `<footer>` landmark — all of which affect SEO, accessibility, and legal compliance.

**Fix**: Add a minimal `LandingFooter.tsx` implementation:
```tsx
export function LandingFooter() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 py-12">
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-sm text-zinc-500">
        <span>© 2024 CORTHEX. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <a href="/privacy" className="hover:text-zinc-300 transition-colors duration-150 motion-reduce:transition-none">개인정보처리방침</a>
          <a href="/terms" className="hover:text-zinc-300 transition-colors duration-150 motion-reduce:transition-none">이용약관</a>
        </div>
      </div>
    </footer>
  )
}
```

---

### L5 — MINOR: Option C has no `LandingPageC()` page assembly component

**Location**: Part 4 (lines 878–1162)

Option A has `LandingPageA()` (lines 491–526) and Option B has `LandingPageB()` (lines 808–862) showing full page assemblies. Option C only shows `HeroTabPanel` and `HeroSplitSection` — no `LandingPageC()` assembly.

Line 939 says "Same section structure as Option A below the hero" which explains the intent, but a one-page assembly is still needed for developers to understand the full component tree. Even a brief assembly showing `<HeroSplitSection />` + reference to shared Option A sections would suffice.

---

## Verified OK — What Works Well

- **Auth endpoint** `/api/auth/login`: Verified against `routes/auth.ts` line 131 + `index.ts` line 127. Correct. ✅
- **SPA form pattern**: Both `AuthModal` (line 659) and `HeroTabPanel` (line 1031) correctly use `onSubmit + e.preventDefault() + fetch('/api/auth/login', ...)`. NEVER `<form action method="POST">` ✅
- **`<dialog>` + `.showModal()` implementation**: `dialogRef.current?.showModal()` on open ✅. `::backdrop` via `backdrop:bg-black/60 backdrop:backdrop-blur-sm` ✅. `onClose` event handler ✅. First-input focus via `requestAnimationFrame` ✅. Close button with `aria-label="모달 닫기"` ✅. `aria-labelledby="auth-modal-heading"` + `aria-modal="true"` ✅.
- **Tab widget ARIA roles**: `role="tablist"` ✅, `role="tab"` + `aria-selected` + `aria-controls` ✅, `role="tabpanel"` + `id` + `aria-labelledby` ✅, `hidden` attribute (not CSS-only) ✅. Outer div: correctly NO role ✅.
- **Static dot grid**: CSS `radial-gradient` only. No JS. `aria-hidden="true"` ✅. `motion-reduce:hidden` ✅. Section 1.5 documents the pattern explicitly ✅.
- **NEXUS preview (Options B/C)**: Both use static `<img>` — NOT live ReactFlow canvas. Comment confirms rationale ✅.
- **Tailwind v4 syntax**: No `h-18`, no `duration-250`. All arbitrary values use correct bracket syntax (`h-[72px]`, `duration-[250ms]`, etc.). `data-[active=true]:` pattern ✅. `open:flex` dialog state variant ✅. `motion-reduce:` variants throughout ✅.
- **Option A 46/50 recommendation**: Four-point rationale (P5 NEXUS above fold, lowest implementation risk, SEO/performance, enterprise credibility) is specific and well-argued ✅. Conversion path comparison table (§5.2) clearly supports the recommendation ✅.
- **Scoring justifications**: All 15 criterion scores (3 options × 5 criteria) have specific, concrete rationale with pixel values and principle references ✅.
- **`motion-reduce` coverage**: All animations (`animate-bounce` line 837), transitions, and `scrollIntoView` behavior respect `prefers-reduced-motion` ✅.
- **Section 5.5 Universal Decisions**: Auth invariants, dot grid, modal, tab widget, pricing, transitions all documented in a machine-readable format ✅.

---

## Round 1 Assessment

**Score**: 7.8/10 (pending fixes)

**Deductions from 10**:
- (-0.8) S1: Tab widget missing ArrowLeft/ArrowRight + roving tabindex — WCAG 2.1 SC 2.1.1 failure. Spec specifies the requirement but provides no code.
- (-0.5) M1: AuthModal focus not restored on close — WCAG 2.4.3 violation. Spec mandates it, code omits it.
- (-0.4) M2: Option A hero blank `<div>` instead of `<img>` — inconsistent with B/C, trains developers to build a blank placeholder permanently.
- (-0.5) L1–L5: `role="dialog"` inconsistency, missing `<header>` landmark, no `aria-current` in FeatureNav, LandingFooter not implemented, Option C assembly absent.

**Pass threshold**: ≥7/10. Current: 7.8/10 — above threshold. However S1 (WCAG 2.1.1) and M1 (WCAG 2.4.3) are accessibility compliance failures that treat as blockers regardless of score.

**Document quality**: The structural analysis (user flows × 3 options, vision principle alignment, conversion path comparison) is thorough and Phase 2 quality. The AuthModal `<dialog>` implementation is a clean, spec-correct pattern. Tab widget ARIA roles are exactly right. S1/M1/M2 are targeted code fixes — no design decisions required.

**Estimated fix time**: ~20 minutes. S1 (arrow key handler) is the most complex — ~15 lines of code. M1 is 4 lines. M2 is a swap of one element.

---

*CRITIC-A — Phase 2-3 Landing Page Analysis — Round 1*
*2026-03-12*
