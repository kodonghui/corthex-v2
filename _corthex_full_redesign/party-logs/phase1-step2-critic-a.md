# Phase 1 Step 1-2 — Critic A Review (Sally / Marcus / Luna)

**Date**: 2026-03-12
**Document reviewed**: `_corthex_full_redesign/phase-1-research/app/app-layout-research.md`
**Round**: 1

---

## Sally (UX Designer) — User Journey & Cognitive Load

The 27-item sidebar challenge is addressed honestly and concretely across all three options — this is the document's core strength. Option A's arithmetic (27 × 36px + labels + footer = ~1100px > 1080px viewport) is exactly the kind of irreversible math that stops bad design decisions before implementation. Option B's default-collapsed `운영` maps correctly to the P0/P1/P2 priority hierarchy from the Vision doc: Hub, AGORA, Dashboard, ARGOS (P0/P1 = 업무 = always visible) while org management, analytics, SNS (P2/P3 = 운영 = collapsed by default).

**Issue 1 (Moderate — Design Decision Deferred)**: `사령관실 (old name, maps to Hub)` appears as the 3rd ungrouped nav item and is counted in the "27 total items." The document acknowledges it's an old name that maps to Hub, but makes no recommendation about whether to keep or remove it. This is a critical design decision: **two nav items routing to the same destination is a UX anti-pattern** (users will click both and wonder why nothing changes). The research should explicitly state: "Recommend removing `사령관실` from redesigned sidebar — reduces count to 26, eliminates navigation ambiguity. 사령관실 = legacy alias from v1, not a distinct feature in v2." The `[업무][운영][시스템]` section grouping analysis is based on 27 items; if 사령관실 is removed, the ungrouped section becomes 2 items (홈, 허브), which changes the sidebar structure slightly.

**Issue 2 (Moderate — Underspecified)**: Option C's Hub override says "Context panel closes (or hidden behind Hub layout)" — the parenthetical "(or hidden behind Hub layout)" is unresolved ambiguity. Two incompatible behaviors are presented as equivalent. For a design research document, this must be resolved: **Option A is correct** (context panel should auto-close on Hub navigation because the Hub layout is a full-screen 3-column override that has no room for a 192px contextual panel alongside it). The "(or hidden)" path would mean the context panel z-fights with the Hub's SessionPanel, which is clearly wrong. Specify: "When navigating to Hub via `🔗` icon: close context panel (`setActiveSection(null)`) before rendering Hub 3-column layout."

---

## Marcus (Visual Designer) — Visual Hierarchy & Layout Proportions

Option A's sidebar ASCII art is excellent — all 27 items are shown with accurate labels, section dividers are visually distinct, and the Hub override shows the 4-column layout cleanly. The `NavSectionLabel` and `NavItem` component specs are precise: `text-xs font-semibold uppercase tracking-wider text-zinc-500` for labels, `bg-indigo-950 text-indigo-300 font-medium` for active items. Both correct per Vision doc Section 9.

**Issue 3 (Moderate — Arithmetic Incomplete)**: Option A's height calculation `(27 × 36px) + (3 × 28px label) + (14px user footer) = ~1100px` is missing the **logo/company header** (`h-14 = 56px`). Corrected math: `56px (header) + 972px (27 items × 36px) + 84px (3 labels × 28px) + 56px (user footer h-14) = 1168px`. At a 1080px viewport, the below-fold content is `1168 - 1080 = 88px` — meaning approximately 2.4 nav items are hidden. The document says ~1100px which is 68px short of the true height. This matters because the con says "`시스템` items may not be visible without scrolling" — it's actually worse: at 1080px, the user loses not just 시스템 but potentially the bottom of the `운영` section too. Correct the calculation to include the h-14 header, and strengthen the con.

**Issue 4 (Minor — Animation Spec Gap)**: Option B's `NavSection` uses `{isOpen && <div className="space-y-0.5">...</div>}` — items appear/disappear instantly on toggle. For a professional tool, the expand/collapse should animate. The document specifies the ChevronRight rotation animation but omits the items' enter/exit animation. Should specify: `<div className={cn("space-y-0.5 overflow-hidden transition-[height] duration-200 motion-reduce:transition-none", isOpen ? "h-auto" : "h-0")}>` or an equivalent approach. Without this, the section expand feels abrupt, breaking the "micro-interaction 150ms ease-out" standard from Vision doc Section 12.1.

---

## Luna (Brand Strategist) — CORTHEX Brand Fit & Non-Developer CEO Alignment

The document correctly identifies the primary persona tension: 김대표 (non-developer CEO) needs to find items quickly, but 27 items in a sidebar is cognitively overwhelming. The final recommendation (Option B for primary persona) is correct and well-justified. Option B's badge inheritance aligns well with Principle 2 (Depth is Data) — collapsed `운영 [3]` is more informative than just `운영 ▶`.

**Issue 5 (Minor — Reference URL Quality)**: Two sources in the Sources table are third-party blogs rather than primary product documentation:
- `https://www.ai-toolbox.co/chatgpt-management-and-productivity/chatgpt-sidebar-redesign-guide` — unknown domain `ai-toolbox.co`, could be fabricated. ChatGPT itself is cited via `chatgpt.com` (real), so this secondary blog URL adds little value and may be fabricated. Should be removed or replaced with the real ChatGPT help/release notes page.
- `https://lollypop.design/blog/2025/december/saas-navigation-menu-design/` — design agency blog with a December 2025 timestamp. Unverifiable. If the content is used to support a design decision, cite the principle directly rather than a blog post.

**One Strong Finding Worth Praising**: The insight that content-level tabs (Dashboard [Overview | Cost | Performance]) reduce `운영` section from 16→~8 items is a **genuinely valuable research contribution**. This isn't just a layout pattern — it's a route restructuring recommendation that reduces the entire scope of the sidebar problem. This should be flagged more prominently in the recommendation summary rather than appearing only in Option C's section.

---

## Summary of Issues

| # | Severity | Category | Issue |
|---|----------|----------|-------|
| 1 | **Moderate** | Design Decision | `사령관실` duplicate nav item — should be explicitly recommended for removal, not left ambiguous |
| 2 | **Moderate** | Specificity | Option C Hub override: "context panel closes (or hidden)" — ambiguous, must be resolved to "auto-close on Hub navigate" |
| 3 | **Moderate** | Arithmetic | Option A height calculation missing h-14 header (56px) — actual height ~1168px, not ~1100px; 시스템 items more cut off than stated |
| 4 | **Minor** | Animation Spec | Option B section expand/collapse has no item animation spec — instant reveal contradicts micro-interaction standard |
| 5 | **Minor** | Reference Quality | Two source URLs are third-party blogs — `ai-toolbox.co` unverifiable, `lollypop.design` unverifiable |

---

## What's Working Well

- ARIA landmarks correct in all 3 options (`nav aria-label`, `aria-expanded`, `aria-label="Page sections"`) ✅
- `motion-reduce:transition-none` present in all animation classes across all options ✅
- Hub 3-column override shown explicitly in all 3 options' ASCII art and code ✅
- Badge inheritance spec (Option B) is precise and brand-aligned ✅
- Content tabs reducing 운영 items is a genuine research insight ✅
- `useLocalStorage` for collapse persistence is a professional-grade detail ✅
- NavItem active state (`bg-indigo-950 text-indigo-300`) matches Vision doc exactly ✅

---

## Round 1 Score: **7.5 / 10**

**Strengths**: Directly addresses the 27-item challenge in all 3 options, correct ARIA/motion-reduce from the start (better than Step 1-1 draft), strong content-level tabs insight, Hub override properly handled in A and B.

**Weaknesses**: `사령관실` design decision deferred, Option C Hub override ambiguous, Option A height calc missing header, Option B expand animation unspecified.

**Priority fixes for Round 2**:
1. Make explicit design decision on `사령관실` — recommend removal from redesigned sidebar
2. Resolve Option C Hub override ambiguity: specify "auto-close context panel on Hub navigation"
3. Fix Option A height calculation to include `h-14` header → update the con text accordingly
4. Add Option B section expand animation spec (height/opacity transition)
5. Remove/replace two unverifiable source URLs

---
*Critic A review complete. Sending to Critic B for cross-talk.*
