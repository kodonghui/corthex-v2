# Phase 1 Step 1-2 (Mobile) — Critic A Review (Sally / Marcus / Luna)

**Date**: 2026-03-12
**Document reviewed**: `_corthex_full_redesign/phase-1-research/app/app-layout-research.md` (985 lines — mobile version)
**Round**: 1

---

## Sally (UX Designer) — User Journey & Cognitive Load

The mobile scope shift is correct — CORTHEX needs a native-like Stitch-generated mobile experience separate from the desktop SPA. The feature priority mapping (P0=Hub/Tracker, P1=Dashboard/NEXUS/Notifications, P2=AGORA/Library/ARGOS) is well-calibrated to the 김대표 persona. Option A's recommendation is appropriately justified: 4 tabs = most learnable for non-developer CEO, Hub session list home = literal "command center" mental model. The active session priority bubbling (ACTIVE section at top of Hub home) directly reflects Principle 2 (Depth is Data) in mobile form.

**Issue 1 (Moderate — Touch Target Violation)**: Option B's compact tracker strip uses `className="h-10 flex items-center..."` — `h-10 = 40px`, which is BELOW the 44pt iOS minimum and 48dp Android minimum documented in the Constraints Recap. The Cross-Reference Analysis table claims all tracker rows meet spec, but this conditional strip (`h-10`) is not a tracker step row — it's a tap target. Option A and C correctly use `h-12 = 48px` for the compact tracker button. Fix: change `h-10` to `h-11` (44px) minimum. The safety margin is negligible for this element; it should not fail the spec it explicitly documents.

**Issue 2 (Moderate)**: Option C Tracker section says "Same as Option A: expandable strip above input bar" with zero independent specification. At minimum, specify the same heights and animation classes explicitly rather than delegating to Option A. Option C is a distinct layout and its Tracker behavior may differ in the context of the 5-tab navigation stack. Lazy references between options create implementation ambiguity.

---

## Marcus (Visual Designer) — Specificity & Technical Accuracy

All three options have multiple ASCII screen diagrams, Tailwind code blocks, and feature handling tables. The `pb-safe` pattern is correctly applied across all three options' fixed bottom bars. The Tracker strip `h-12 → h-48` transition is well-defined in Option A with the correct `transition-[height] duration-300 motion-reduce:transition-none`.

**Issue 3 (Moderate)**: Option C's 5-tab layout at 390px width: `390 / 5 = 78px per tab`. The document correctly calculates this and notes it as "small but usable." However, it does **not flag that 78px is below MD3's 80dp minimum tab width spec** (documented in Section 6: "Min tab width: 80dp"). This is a genuine spec violation that the document itself should acknowledge. Fix: add a note — "⚠️ 78px is below MD3's 80dp minimum. For Option C, enforce `min-device-width: 430px` or accept this 2dp deviation with documented rationale."

**Issue 4 (Moderate — motion-reduce gap)**: Option A's active session card shows a "pulsing indigo dot" on the active session row (ASCII shows "● 삼성전자 분석" with status "비서실장 실행 중 32s"). The cons section explicitly warns: "Agent status dot (pulsing indigo on active session) requires CSS animation — `motion-reduce:transition-none` essential." But the Option A code block provides NO animated dot spec — no `animate-pulse motion-reduce:animate-none` class is shown. Option B correctly handles this at line 693: `animate-pulse motion-reduce:animate-none`. The same animated dot in Option A's session list is unspecified. Fix: add a code comment or snippet to Option A's home screen spec showing the active session dot: `<span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse motion-reduce:animate-none" />`.

**Issue 5 (Minor — ARIA)**: Both Option A and Option C tab bar containers use a `<div className="flex h-14">` to hold the tab buttons, but neither has `role="tablist"` on this container. `aria-selected` + `role="tab"` on buttons (Option C has `role="tab"`) requires a `role="tablist"` parent to be semantically valid per ARIA spec. Option A's buttons don't even have `role="tab"`. Fix for both:
```tsx
// Option A: add role="tab" to buttons + role="tablist" to container
<div className="flex h-14" role="tablist" aria-label="Main navigation">
  <button role="tab" aria-selected={...} ...>

// Option C: add role="tablist" to inner div (nav already has aria-label)
<div className="flex h-14" role="tablist">
```

---

## Luna (Brand Strategist) — CORTHEX Brand Fit & Mobile Identity

The Tracker strip above input bar is uniquely CORTHEX — no reference product has this. It correctly surfaces the product's core differentiator in the mobile context. The "ACTIVE" session section with pulsing dot + live chain summary is a strong mobile expression of Principle 1 (Name the Machine). Option B's always-visible input bar is the boldest brand statement ("this is a command tool") but the recommendation correctly identifies that 김대표 needs tabs for mental model clarity.

**Issue 6 (Moderate — Fabricated/Broken URL)**: Two source URLs are suspect:
- `https://developers.openai.com/apps-sdk/concepts/ui-guidelines/` — OpenAI's developer documentation lives at `platform.openai.com/docs/`, not `developers.openai.com`. The `developers.openai.com` subdomain does not exist in OpenAI's URL scheme. This URL is likely fabricated.
- `https://bricxlabs.com/blogs/message-screen-ui-deisgn` — "deisgn" is a misspelling of "design" in the URL slug. A URL with a typo in the slug is either a fabricated URL or a broken link. Either way it should be removed.

**Issue 7 (Minor — URL quality)**: Two additional source URLs are from unknown third-party domains:
- `https://almcorp.com/blog/google-stitch-complete-guide-ai-ui-design-tool-2026/` — `almcorp.com` is an unknown domain. Google Stitch is already cited via `stitch.withgoogle.com` (real). This secondary blog source adds no value.
- `https://slack.com/blog/news/redesigning-slack-ios26` — References "iOS 26" which, as of 2026-03, is a not-yet-released iOS version. This blog post may be a fabricated or premature URL.

**Issue 8 (Minor — Option B animation gap)**: Option B's navigation drawer (`absolute left-0 top-0 bottom-0 w-72 bg-zinc-900`) appears/disappears via React conditional `{drawerOpen && ...}` with no animation spec. No `transition-transform` or `translate-x` classes are defined for the slide-in effect. For a professional tool, the drawer slide should be specified: `translate-x-[-100%] → translate-x-0 transition-transform duration-250 motion-reduce:transition-none`. This is consistent with the drawer slide pattern from the web dashboard research.

---

## Summary of Issues

| # | Severity | Category | Issue |
|---|----------|----------|-------|
| 1 | **Moderate** | Touch Target | Option B compact tracker `h-10 = 40px` < 44pt minimum |
| 2 | **Moderate** | Specificity | Option C tracker spec delegates to Option A — no independent spec |
| 3 | **Moderate** | Accuracy | Option C tab 78px < MD3 80dp minimum — not flagged as spec violation |
| 4 | **Moderate** | motion-reduce | Option A active session pulsing dot has no `animate-pulse motion-reduce:animate-none` spec |
| 5 | **Minor** | ARIA | Options A + C missing `role="tablist"` on tab container; Option A missing `role="tab"` on buttons |
| 6 | **Moderate** | URL | `developers.openai.com` doesn't exist — likely fabricated; `bricxlabs.com/...deisgn` has typo |
| 7 | **Minor** | URL quality | `almcorp.com` unknown domain; `redesigning-slack-ios26` references unreleased iOS |
| 8 | **Minor** | Animation | Option B drawer has no slide-in animation spec |

---

## What's Working Well

- Google Stitch capability/limitation table (Strong vs ❌) is clear and actionable ✅
- `pb-safe` applied consistently in all 3 options' fixed bottom bars ✅
- Tracker strip h-12 compact → h-48 expanded clearly defined in Options A and B ✅
- MD3 and Apple HIG specs cited with real documentation URLs ✅
- All 8 products have ASCII diagrams ✅
- All 3 options have Stitch generation plans (6 screens each) ✅
- Cross-reference touch target table documents all elements ✅
- Option B drawer has correct ARIA (`role="dialog"`, `aria-modal="true"`) ✅
- Recommendation justification for Option A is thorough ✅

---

## Round 1 Score: **7.8 / 10**

**Strengths**: Strong Stitch documentation, pb-safe consistent, Tracker behavior defined, cross-platform specs cited from real MD3/HIG sources.
**Weaknesses**: Two URL fabrication concerns, Option B touch target violation, Option C tab width spec violation unacknowledged, pulsing dot motion-reduce missing in Option A.

**Priority fixes for Round 2:**
1. Fix Option B tracker strip: `h-10` → `h-11` (44px minimum)
2. Fix fabricated URL `developers.openai.com` — replace with real ChatGPT mobile reference or remove
3. Fix `bricxlabs.com/...deisgn` typo URL — remove
4. Add Option A active session dot spec: `animate-pulse motion-reduce:animate-none`
5. Flag Option C 78px tab as MD3 spec note/disclaimer
6. Add Option C Tracker independent spec (not just "same as A")
7. Add `role="tablist"` + `role="tab"` to Options A and C tab bars
8. Add Option B drawer slide animation spec

---
*Critic A review complete. Sending to Critic B for cross-talk.*
