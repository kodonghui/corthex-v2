# [Critic-A Review] Phase 0 Step 2 — CORTHEX Vision & Identity

> Reviewed: `_corthex_full_redesign/phase-0-foundation/vision/corthex-vision-identity.md` (lines 1–453)
> Cross-checked: `phase-0-foundation/spec/corthex-technical-spec.md`, `prd.md`, `v1-feature-spec.md`
> Reviewer roles: Sally (UX Designer), Marcus (Visual Designer), Luna (Brand Strategist)

---

## Agent Discussion (in character)

**Sally:** "OK this document is significantly better than most Vision docs I see — it actually has hex values, Tailwind classes, and Korean copy examples. I can work with this. But here's my problem: the moment I try to design a button, I'm stuck. There are 5 background colors defined and 5 status colors. There are NO button states — no disabled, no active/pressed, no loading. That's not a style problem, it's a blocker. And worse: when I get to the Hub ChatArea, the agents return markdown — reports with h1–h6, tables, code blocks. Section 7 gives me body text at 14px but nothing for markdown headings. I'm going to make up those specs, and they're going to be inconsistent across every designer on the team."

**Marcus:** "Section 3.2 Emotional Moments Hierarchy is genuinely excellent — Tracker cascade as #1, instant feedback as #2, these are defensible choices backed by product reasoning. The color system is clean: zinc for structure, indigo for action, semantic status colors. I like it. My sharp eye finds one problem though: Section 8.2 gives the Hub layout as `SessionPanel (w-64 fixed)`. Where does that w-64 come from? The Technical Spec Section 2.4.1 specifies TrackerPanel as w-80 but says nothing about SessionPanel width. A designer is going to lay out the 3-column Hub with w-60 sidebar + w-64 SessionPanel + w-80 TrackerPanel = 396px already spoken for at 1280px viewport. That leaves 884px for ChatArea. Was that intentional? I need the SessionPanel width sourced, not assumed."

**Luna:** "CORTHEX as 'Military Precision × AI Intelligence' is exactly right — it's tense, it's distinctive, it's not another pastel AI chatbot. Section 2.3 nails it. The codename table (NEXUS = connection, AGORA = deliberation, ARGOS = vigilance) gives every designer a cultural reference frame. That's brand DNA. What concerns me is an omission: SketchVibe is completely absent from this document. It's in the Technical Spec as a feature of the NEXUS page (App) — it's an AI-powered canvas drawing tool with MCP integration. That's not a utility feature. That's a *demo moment* — 'watch AI draw your org chart in real time.' If we're building the brand hierarchy and SketchVibe isn't in it, a designer will treat it as a settings tab. That's a brand positioning mistake."

---

## Issues Found

| # | Severity | Persona | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | HIGH | Sally | **Component interactive states entirely absent.** Section 6 defines background and text colors but NO button states (disabled, active/pressed, loading), NO input states (focus ring, error border, disabled background), NO link hover. A designer cannot spec a single form or interactive component without inventing these states themselves. | Add Section 6.4: Interactive States — `button.primary` (hover: indigo-700/500, disabled: zinc-200 bg + zinc-400 text, active: indigo-800, loading: spinner + opacity-70), `input` (focus: ring-2 ring-indigo-500, error: border-red-500, disabled: bg-zinc-100 dark:bg-zinc-800), focus ring standard (2px indigo-500/50). |
| 2 | HIGH | Marcus | **SessionPanel width `w-64` in Section 8.2 is ungrounded.** Technical Spec Section 2.4.1 specifies TrackerPanel as `w-80` but is silent on SessionPanel width. The Hub 3-column math: `w-60` (sidebar) + `w-64` (SessionPanel) + `w-80` (TrackerPanel) = 396px constant at 1280px viewport, leaving 884px for ChatArea flex-1. If this is intentional, it should be sourced. If the actual SessionPanel uses a different width (e.g., `w-72` or is collapsible), the layout math is wrong. | Verify SessionPanel width against `packages/app/src/pages/hub.tsx` or `packages/app/src/components/session-panel.tsx` and state the source explicitly. Add note: "Hub total fixed width: w-60 + w-64 + w-80 = 396px constant." |
| 3 | HIGH | Luna | **SketchVibe completely absent from Vision doc.** Technical Spec Section 2.13 describes SketchVibe as a major feature of the NEXUS page: AI-powered canvas editing with Cytoscape.js + MCP SSE, 8 node types, AI drawing commands. This is a differentiating capability ("watch AI restructure your org chart by typing a command"). Section 4 Feature Hierarchy does not mention it anywhere. A designer will treat it as a sub-component of NEXUS with no design investment, missing its demo moment potential. | Add SketchVibe to Tier 2 Feature Hierarchy. Add to Section 3.2 Emotional Moments as a candidate for #7: "SketchVibe AI command — typing 'add a backend team under CTO' → watching nodes appear on canvas." |
| 4 | MEDIUM | Sally | **Markdown rendering typography not specified.** Hub ChatArea (`MarkdownRenderer` component), Reports page, and Performance/Soul Gym all render markdown from AI agents — potentially including h1–h6, blockquote, unordered/ordered lists, code blocks, tables, horizontal rules. Section 7 type scale covers body text (14px) and page titles (20px) but provides no h1–h6 size ladder, no code block background color, no blockquote left-border style. Designers will invent inconsistent specs for the most-rendered component in the product. | Add Section 7.4: Markdown Rendering Scale — h1 `text-2xl font-bold`, h2 `text-xl font-semibold`, h3 `text-lg font-semibold`, h4 `text-base font-semibold`, code inline `font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1 rounded`, code block `font-mono text-sm bg-zinc-900 dark:bg-zinc-950 p-4 rounded-lg`, blockquote `border-l-4 border-indigo-500 pl-4 text-zinc-500`, table header `bg-zinc-100 dark:bg-zinc-800 font-semibold`. |
| 5 | MEDIUM | Marcus | **TrackerPanel collapse animation missing.** Section 9.2 specifies 4 steps for the expand animation (new step slides in, pulse stops, checkmark appears, depth badge scales in). But the collapse-to-icon-strip (w-80 → w-12) animation is not defined. Per Technical Spec 2.4.1, the user can manually toggle collapse. What eases? translateX? clip? width transition? Without this, developers will implement it differently from the expand, creating asymmetric UX. | Add to Section 9.2: "Collapse animation: width 320px → 48px, `transition-all duration-250 ease-in-out`. Panel content fades out (opacity: 1 → 0, 100ms) before width collapses (150ms delay before width shrink starts)." |
| 6 | MEDIUM | Sally | **Persona 2 RBAC placement is ambiguous.** 팀장 박과장 "Setting Tier budgets per department" requires Admin console access (admin_users role). But this persona is described as a "Mid-size company manager" — it's unclear if they're using the workspace app or admin app, or if they even have admin_users credentials. The Technical Spec's RBAC (Section 1.2) shows only `admin_role` users can set tier configs. If this persona is an `admin` role user, the persona should say so. | Clarify: "팀장 박과장 uses the **Admin console** (`/admin`) as a `company_admin` role user. Their peak moment occurs in Admin Dashboard + `/admin/tier-configs` + `/admin/costs`." |
| 7 | MEDIUM | Luna | **"Toy feeling" anti-pattern says "emoji only in nav (established pattern)" but the section contradicts its own rule.** Section 3.3 Feelings to Avoid warns against "emoji everywhere" as a toy signal, then immediately says "emoji only in nav (established pattern)" — which is correct. But Section 10.1 shows 25 emoji icons in the nav. If a new designer reads only Section 3.3's warning, they might remove nav emoji thinking it looks unprofessional. The reasoning for keeping nav emoji (it's the established pattern and is contained/intentional) should be explicitly stated. | Add a clarifying note: "Nav emoji are intentional and contained — they function as compact visual landmarks in a dense nav list, not decoration. Do NOT extend emoji use outside sidebar nav. For all other icons, use Lucide React (Section 10.2)." |
| 8 | LOW | Sally | **Chat auto-scroll behavior not specified.** When SSE `message` chunks arrive in ChatArea during a live stream, UX convention requires auto-scroll to bottom — but this is not documented. If a user has manually scrolled up (reading previous messages), should it scroll-lock release? What triggers the "scroll to bottom" affordance? Without this, ChatArea implementations will differ across developers. | Add to Section 9: "ChatArea auto-scroll: auto-scroll to bottom on each SSE `message` chunk. If user has manually scrolled up (scroll position < scrollHeight - 200px), pause auto-scroll and show a 'Jump to bottom' floating pill (`fixed bottom-20 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs`). Resume auto-scroll on pill click or on next user submit." |
| 9 | LOW | Marcus | **Focus ring / keyboard navigation color not specified.** Section 5 Principle 7 notes WCAG AA requirement and Section 8.2 Performance Budgets in Tech Spec lists WCAG 2.1 AA. But Section 6 never specifies the focus ring style used for keyboard navigation. WCAG AA requires visible focus indicators. | Add to Section 6.4 (Interactive States): "Focus ring standard: `ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950` — apply via `focus-visible:` (not `focus:`) to avoid ring on mouse clicks." |

---

## Technical Spec Consistency Check

| Claim in Vision Doc | Consistent with Tech Spec? | Notes |
|--------------------|--------------------------|-------|
| Hub 3-column layout: SessionPanel + ChatArea + TrackerPanel w-80 (Section 8.2) | ✅ Consistent | TrackerPanel w-80 matches Spec 2.4.1. SessionPanel w-64 is *new* (unverified — Issue #2). |
| AGORA polling (Section 9.3): "Since AGORA uses polling (not SSE)" | ✅ Consistent | Correctly reflects Spec 4.9 and 7.1. |
| Desktop-only, min-width 1280px (Section 5 Principle 8) | ✅ Consistent | Matches Tech Spec Section 8.6. |
| RBAC role check Section 6 references | ✅ Consistent | Section 6.1 status colors not affected by RBAC; no conflict. |
| Sidebar bg-zinc-50 / bg-zinc-900 (Section 6.1) | ✅ Consistent | Matches Tech Spec Section 9.1 sidebar Tailwind classes. |
| Tracker icon-strip collapse to w-12 | ✅ Consistent | Matches Tech Spec Section 2.4.1 "collapses to icon-only strip (w-12)". |
| SketchVibe absent from feature hierarchy | ⚠️ Gap | Tech Spec Section 2.13 documents SketchVibe as major app feature. Vision doc never mentions it. (Issue #3) |
| Admin sidebar flat, no grouping | ✅ Consistent | Matches Tech Spec Section 9.2 (no group labels in admin sidebar). |

**No direct contradictions found.** All technical references verified as accurate. Issues are gaps/omissions, not errors.

---

## v1-feature-spec Coverage Check

**Verified from emotional design / feature hierarchy perspective:**
- @mention, slash commands → covered in Hub Tier 1 ✅
- Soul system → explicitly Tier 1, Principle 5 ✅
- AGORA debate → Tier 2, Emotional Moment #4 ✅
- Trading/Strategy → Tier 2 ✅
- ARGOS/Cron → Tier 2 ✅
- Knowledge RAG → Tier 2 ✅
- Real-time handoff tracking → Tier 1, Emotional Moment #1 ✅

**Gaps:**
- SketchVibe (v1-feature-spec lists "canvas-based org editing") → missing from hierarchy (Issue #3)
- Voice briefing / audio (mentioned in PRD as Library feature) → not mentioned in Vision doc. Should confirm whether in-scope for this redesign.

---

## Cross-talk with Critic-B (Verified Additions)

All 3 of Critic-B's top findings independently verified against codebase. Adding as confirmed issues:

| # | Severity | Source | Issue | Verification |
|---|----------|--------|-------|--------------|
| 10 | CRITICAL | Critic-B (confirmed by Critic-A) | **Font is wrong — Work Sans, not Inter.** `packages/app/index.html` line 14: `Work Sans:wght@400;500;600;700` from Google Fonts. Admin `index.html` loads no custom font (system fallback only). Vision doc Section 7.1 says "Inter — already implied by the current codebase" — factually incorrect. Work Sans and Inter are visually distinct; every type specimen produced using Inter will look different in production. | Confirmed: `packages/app/index.html` line 14. Admin `index.html` has no `<link>` for fonts. |
| 11 | HIGH | Critic-B (confirmed by Critic-A) | **Custom OKLCH token system exists but Vision doc ignores it.** `packages/app/src/index.css` defines `--color-corthex-accent` (oklch indigo-600), `--color-corthex-success` (emerald-600), `--color-corthex-warning` (amber-600), `--color-corthex-error` (red-600) as `@theme` variables. Also `--animate-slide-in` and `--animate-slide-up` keyframes already defined. Vision doc Section 6 documents only raw Tailwind classes (`bg-indigo-600`). Two parallel color systems — designers will use raw Tailwind while canonical tokens go unused. | Confirmed: `packages/app/src/index.css` lines 5–13. |
| 12 | HIGH | Critic-B (confirmed by Critic-A) | **Admin sidebar background inaccurate.** `admin/src/components/sidebar.tsx` line 89: `bg-white dark:bg-zinc-900 border-r`. Vision doc Section 6.1 says "Sidebar background: bg-zinc-50 / bg-zinc-900" for both app and admin — but app uses bg-zinc-50 (correct) and admin uses bg-white (different). Designers using Section 6.1 as reference will give admin sidebar the wrong light-mode background. | Confirmed: `packages/admin/src/components/sidebar.tsx` line 89. |

**Disagreements with Critic-B**: None. Full alignment.

**"Military Precision × AI Intelligence" UX contradiction check**: Both critics found none. Positioning is internally consistent. Brand identity is sound.

---

## Summary

Strong document overall. The brand positioning (Military Precision × AI Intelligence), emotional moments hierarchy, Tone of Voice table, and AGORA animation spec (polling-aware, client-side stagger) are all excellent and immediately actionable. The Technical Spec cross-references are accurate.

The document fails in one area: **component-level design tokens** — without button states, input states, focus rings, and markdown typography, a designer will produce inconsistent implementations of the most common UI patterns. These are HIGH priority additions.

**Total issues: 12 (1 CRITICAL, 5 HIGH, 4 MEDIUM, 2 LOW)**

**Pre-fix score: 6.5/10**
- Brand & Vision: 10/10 (positioning, persona emotional payoffs, tone of voice — excellent)
- Color system: 5/10 (palette conceptually right but wrong token system + interactive states missing + admin bg wrong)
- Typography: 4/10 (wrong font named, markdown rendering missing)
- Motion spec: 8/10 (specific timings, existing keyframes not referenced)
- Feature hierarchy: 8/10 (SketchVibe absent)
- Tech Spec consistency: 8.5/10 (no layout contradictions, 3 factual accuracy errors)
