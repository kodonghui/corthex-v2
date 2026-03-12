# Phase 1-2 App Mobile Layout Research — CRITIC-B Review
**Date**: 2026-03-12
**Reviewer**: CRITIC-B (Amelia / Quinn / Bob)
**File reviewed**: `_corthex_full_redesign/phase-1-research/app/app-layout-research.md` (lines 1–985)
**Round**: 1

---

## ⚠️ STRUCTURAL ISSUE (Blocking — Pre-Review)

**Previous Phase 1-2 App SPA Desktop research (980 lines) was replaced entirely without addressing our 10 Round 1 issues.**

The previous content was "Phase 1-2: App SPA Layout Research" covering CORTHEX's `packages/app` desktop SPA (1280px+). We raised 10 issues including missing Hub JSX code block, `사령관실` removal, Option A height math error, `aria-current="page"`, etc. None of these were fixed before the file was replaced.

The desktop SPA layout research is critical for the web redesign (`packages/app`). The mobile layout research is for Google Stitch (Phase 6, manual step). These are two different products that each need separate research artifacts.

**Recommendation**: The desktop SPA research should be preserved at a separate path (e.g., `phase-1-research/web-app/web-app-spa-layout-research.md`) with our 10 issues addressed. This mobile research can remain at `phase-1-research/app/app-layout-research.md`.

I will proceed with reviewing the mobile content below, but flag this as a pipeline integrity issue.

---

## Amelia (Frontend Dev) — Implementation Feasibility

**Overall**: The mobile research is well-structured with detailed ASCII diagrams, touch target verification table, and Stitch capability matrix. Tailwind code blocks are present for all three options. Good improvement over Phase 1-1 first draft.

**Issue 1 — `pb-safe` is not a built-in Tailwind CSS 4 class**:
Lines 536, 684, 861 all use `pb-safe` as a Tailwind utility: `className="... pb-safe"`. This is NOT a standard Tailwind CSS 4 utility. Safe area insets require either: (a) the `tailwindcss-safe-area` plugin, or (b) a custom Tailwind 4 theme extension using `env(safe-area-inset-bottom)`. CORTHEX's `packages/app/src/index.css` would need:
```css
@theme {
  --spacing-safe-bottom: env(safe-area-inset-bottom, 0px);
}
```
And a custom `pb-safe` utility class. This is a real implementation gap — all three options assume `pb-safe` works out-of-the-box which it doesn't in Tailwind 4. Must specify the required plugin or custom setup.

**Issue 2 — Option A Tab bar: missing `role="tablist"` and `role="tab"`**:
Option A's tab bar code (lines 534–557) uses `aria-selected={active === tab.id}` on `<button>` elements inside a plain `<div>`. `aria-selected` is only valid on elements with `role="tab"`, `role="option"`, `role="gridcell"`, etc. Without `role="tab"` on the button and `role="tablist"` on the container, `aria-selected` has no semantic meaning. Compare: Option C (lines 859–900) correctly uses `<nav>` + `role="tab"` on each button — creating an inconsistency between options. Option A should match Option C's ARIA structure.

**Issue 3 — Option B Tracker strip uses `h-10` (40px) instead of spec `h-12` (48px)**:
Line 688: `className="h-10 flex items-center px-4 gap-2 border-b border-zinc-800"`. The review criteria specify "h-12 compact → h-48 expanded" and Option A uses `h-12` (line 562). Option B's compact tracker strip is `h-10` (40px) — below the 44pt iOS touch target minimum. This is a touch target violation AND an inconsistency with Option A's spec. Fix: `h-12` throughout.

---

## Quinn (QA + A11y) — WCAG AA Compliance

**Issue 4 — Fabricated URL: `https://developers.openai.com/apps-sdk/concepts/ui-guidelines/`**:
Line 964 in Sources + line 66 in reference #1. OpenAI's developer documentation is at `platform.openai.com/docs`, not `developers.openai.com`. The subdomain `developers.openai.com` is not a known OpenAI documentation domain — their developer resources are at `platform.openai.com`. The path `/apps-sdk/concepts/ui-guidelines/` does not appear in OpenAI's real documentation structure. This is a likely fabricated URL. The ChatGPT mobile UI can be observed directly from `chatgpt.com` — no secondary reference needed.

**Issue 5 — Typo URL: `https://bricxlabs.com/blogs/message-screen-ui-deisgn`**:
Line 976: "deisgn" is a clear typo for "design" in the URL path. This is either a broken link or a fabricated URL. Remove or correct to the right URL.

**Issue 6 — `https://slack.com/blog/news/redesigning-slack-ios26` may not exist**:
Line 967: This specific Slack article URL includes "ios26" — referencing Apple's iOS 26 (announced WWDC June 2025). This is a very specific article that may not exist or may have a different URL. The `slack.design/articles/re-designing-slack-on-mobile/` (line 966) appears to be the real Slack mobile redesign article. The `blog/news/redesigning-slack-ios26` URL should be verified or removed.

**Issue 7 — `role="status"` with `aria-live="polite"` is redundant (minor)**:
Option A Tracker strip (line 564-566): `role="status" aria-live="polite"`. Per ARIA spec, `role="status"` already implies `aria-live="polite"` and `aria-atomic="true"`. Adding `aria-live="polite"` is redundant (though not harmful). More importantly, `aria-atomic="true"` (default for `role="status"`) means screen readers announce the ENTIRE tracker content when any part updates — during a 5-step handoff chain, this could produce verbose announcements. Consider `role="region" aria-live="polite" aria-atomic="false"` for the tracker (as Phase 1-1 specified for the desktop TrackerPanel).

---

## Bob (Performance) — Load Time, Animation, Assets

**Issue 8 — `animate-pulse` on active session dot: missing `motion-reduce:animate-none` in Option A ASCII/home screen**:
Line 571 in the Tracker strip code correctly uses `motion-reduce:animate-none` for the pulsing dot. However, the Home screen active session row (line 476-478) references `● 삼성전자 분석` with "active session (pulsing dot)" in the comment, but the corresponding home screen Tailwind code block doesn't show the `animate-pulse motion-reduce:animate-none` implementation for the session list pulsing dot. Stitch generation will need this implemented — the research should include the session list row code snippet.

**Issue 9 — Option B always-visible input bar: `fixed bottom-0` with `pb-safe` conflicts with Tracker strip stacking**:
Option B (lines 683-713): The Tracker strip is inside the fixed input bar container (`fixed bottom-0`). The tracker div (line 687-696) sits above the input div (line 697-712). Height: tracker `h-10` + input `h-14` + safe area. But the Tracker is conditionally shown (`{hasActiveHandoff && ...}`). When it appears, the fixed container's total height increases, pushing content up. There is no `padding-bottom` adjustment on the main scroll area to compensate. The chat message area needs `pb-[calc(3.5rem+env(safe-area-inset-bottom))]` normally and `pb-[calc(3.5rem+2.5rem+env(safe-area-inset-bottom))]` when tracker is active. This dynamic padding adjustment is missing from the spec.

---

## Summary of Issues (Priority Order)

| # | Issue | Severity |
|---|-------|----------|
| 0 | Desktop SPA research replaced without fixing 10 prior issues | Critical (pipeline) |
| 1 | `pb-safe` not built-in Tailwind CSS 4 — requires plugin/custom setup | High |
| 2 | Option A tab bar missing `role="tablist"` + `role="tab"` | High — ARIA |
| 3 | Option B Tracker strip `h-10` instead of `h-12` — below 44pt touch target | High — A11y + spec |
| 4 | Fabricated URL: `developers.openai.com/apps-sdk/...` | High — credibility |
| 5 | Typo URL: `bricxlabs.com/...message-screen-ui-deisgn` | Medium |
| 6 | `slack.com/blog/news/redesigning-slack-ios26` — unverifiable | Medium |
| 7 | `role="status"` + `aria-live="polite"` redundant; `aria-atomic` concern | Low — ARIA |
| 8 | Home screen active session pulsing dot: no code snippet for `motion-reduce:animate-none` | Low |
| 9 | Option B dynamic padding-bottom not specified when Tracker strip appears | Low — implementation gap |

---

## Score (Round 1)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Real URLs (8 products) | 6/10 | OpenAI URL fabricated, Slack iOS26 suspicious, bricxlabs typo |
| ASCII diagrams + Tailwind completeness | 8/10 | Good detail; Option A tab bar ARIA incomplete |
| 27-item sidebar → mobile feature mapping | 9/10 | Stitch capability table + mobile feature priority table are strong |
| Tracker strip behavior (h-12→h-48) | 7/10 | Option A/C consistent; Option B uses h-10 (violation) |
| motion-reduce coverage | 8/10 | Mostly present; home screen session dot missing |
| ARIA roles | 7/10 | Option C correct; Option A missing role="tablist/tab"; redundant status/live |
| pb-safe / safe area implementation | 5/10 | `pb-safe` not standard Tailwind — all 3 options affected |
| Option A recommendation justified | 9/10 | Tab=learnable, Hub=P0, Tracker strip unique, well-argued |

**Overall Score: 7.0 / 10**

**Minimum required fixes for Round 2 approval:**
1. Resolve pipeline issue: restore desktop SPA research to separate file OR confirm it's intentionally replaced
2. Fix `pb-safe`: specify `tailwindcss-safe-area` plugin requirement or custom CSS
3. Add `role="tablist"` on Option A tab container + `role="tab"` on buttons
4. Fix Option B Tracker strip from `h-10` → `h-12`
5. Fix/replace fabricated `developers.openai.com/apps-sdk` URL
6. Fix/remove typo `bricxlabs.com/...deisgn` URL
7. Verify or remove `slack.com/blog/news/redesigning-slack-ios26`

---

*CRITIC-B sign-off: Amelia / Quinn / Bob — Round 1*
