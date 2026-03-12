# Fix Log — Phase 0 Step 2: CORTHEX Vision & Identity

**Applied**: 2026-03-12
**Pre-fix lines**: 596
**Post-fix lines**: 742
**Total issues fixed**: 12 (9 Critic-A + 10 Critic-B, no duplicates)

---

## Fixes Applied

### CRITICAL (1)

| # | Issue | Fix Applied |
|---|-------|------------|
| #10 (C-A/C-B) | **Font is Work Sans, not Inter** — `packages/app/index.html` line 14 loads Work Sans. Admin loads no font. Section 10.1 had "Inter — already implied by codebase" which was factually wrong. | Rewrote Section 10.1: "Work Sans — currently loaded via Google Fonts." Added HTML snippet showing exact link tag. Added admin font gap warning. Added action item to add Work Sans to admin index.html. |

### HIGH (5)

| # | Issue | Fix Applied |
|---|-------|------------|
| #1 (C-A) | **Component interactive states absent** — no button states (disabled/active/loading), no input states (focus ring, error border), no focus ring standard | Added Section 9.6: Interactive States — primary button (4 states), secondary button (3 states), input/textarea (4 states), focus ring standard using `focus-visible:ring-2 ring-indigo-500 ring-offset-2` |
| #2 (C-A) | **SessionPanel width `w-64` ungrounded** — Section 11.2 had w-64 but Technical Spec doesn't specify it. Actual code: `session-panel.tsx` line 132 uses `w-72`. | Fixed Hub layout to `w-72`. Added source citation. Added Hub math table: w-60+w-72+w-80 = 848px total fixed, ChatArea = 432px minimum at 1280px. |
| #3 (C-A) | **SketchVibe absent from Feature Hierarchy** — a demo-moment feature (MCP-powered live canvas editing) treated as utility | Added SketchVibe to P1 with explicit "demo moment" note: "type 'add backend team under CTO' → watch nodes appear on canvas." |
| #11 (C-B) | **OKLCH token system undocumented** — `index.css` has `--color-corthex-accent/success/warning/error` + keyframe tokens. Section 6 ignored them entirely. | Added Section 9.4: Design Token Mapping — maps all 7 OKLCH tokens to Tailwind class equivalents. Rule: use Tailwind in JSX, use CSS tokens in `.css` files. |
| #12 (C-B) | **Admin sidebar bg wrong** — spec said `bg-zinc-50` for both apps, but `admin/sidebar.tsx` line 89 uses `bg-white dark:bg-zinc-900 border-r` | Fixed Section 9.1: separated app sidebar (`bg-zinc-50`) and admin sidebar (`bg-white`) rows. Added note about intentional divergence and border-r compensation. |

### MEDIUM (4)

| # | Issue | Fix Applied |
|---|-------|------------|
| #4 (C-A) | **Markdown rendering typography missing** — MarkdownRenderer renders h1-h6, code, blockquote, table from agent responses | Added Section 10.3: Markdown Rendering Scale — all 13 element types with exact Tailwind classes for light+dark. |
| #5 (C-A) | **TrackerPanel collapse animation missing** — expand animation was specified but not collapse (w-80→w-12) | Added to Section 12.2: Collapse animation — content fades (100ms), then width transitions (250ms, 100ms delay). `transition-[width] duration-250 ease-in-out`. |
| #3 (C-B) / #12 (C-A) | **Admin sidebar light bg mismatch** | Covered by HIGH fix #12 above. |
| #4 (C-B) | **Dark mode nested component border invisible** — `border-zinc-800` = `bg-zinc-800` (invisible). Card bg = Sidebar bg. | Added Section 9.5: Dark Mode Component Layering Rules — 5-level hierarchy (page/sidebar/card/panel/sub-panel). Warning note: use `border-zinc-700` not `border-zinc-800` when card bg is `bg-zinc-900`. |
| #5 (C-B) | **Nav hover state absent** — both sidebars use `hover:bg-zinc-100 dark:hover:bg-zinc-800` but not in spec | Added "Nav item hover" row to Section 9.1 table: light=`bg-zinc-100`, dark=`bg-zinc-800`. |
| #6 (C-B) | **`transition-all` performance risk on Tracker rows** — full-property repaint on every SSE event | Fixed Section 12.2: changed all Tracker row animations to use `transition-[transform,opacity]` explicitly. Added explanation of why. |
| #7 (C-B) | **AGORA speech `translateX:-16px` not in codebase keyframes** — no matching `@keyframes` in `index.css` | Added Section 12.3: custom `@keyframes speech-enter` CSS to add to `packages/app/src/index.css`. Added Framer Motion alternative. |
| #8 (C-B) | **Loading skeleton color not specified** | Added "Skeleton loader" row to Section 9.1 table: `bg-zinc-200 dark:bg-zinc-700`. |

### LOW (2)

| # | Issue | Fix Applied |
|---|-------|------------|
| #6 (C-A) | **Persona 2 RBAC placement ambiguous** — "팀장 박과장 setting Tier budgets" uses Admin console but persona didn't say so | Fixed Section 3.2: added explicit clarification that 이팀장 uses `/admin` as `admin_role: 'admin'` user. |
| #7 (C-A) | **Emoji guideline contradiction** — Section 3.3 warns against emoji, then allows 25 emoji in nav | Added clarifying note to Section 4.3: "Nav emoji are intentional and contained — function as visual landmarks, not decoration. Do NOT extend outside sidebar." |
| #8 (C-A) | **Chat auto-scroll behavior unspecified** | Added Section 12.4: Chat Auto-Scroll Behavior — default auto-scroll, scroll lock on manual scroll, floating pill indicator, resume triggers. |
| #9 (C-A) | **Focus ring/keyboard navigation not specified** | Included in Section 9.6 Interactive States: `focus-visible:ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950`. |
| #9 (C-B) | **Soul editor line numbers require CodeMirror** | Added to Principle 5 (Section 8) and Section 10.1 font stack: "CodeMirror 6 required — textarea is insufficient." |
| #10 (C-B) | **theme-color meta `#6366f1` (indigo-500) doesn't match primary accent `#4F46E5` (indigo-600)** | Documented in Section 9.1 with note: "`packages/app/index.html` line 8 theme-color should be updated to `#4F46E5` to match primary accent." |

---

## Verification Sources

| Claim | Verified Against |
|-------|----------------|
| Font is Work Sans | `packages/app/index.html` line 14 ✅ |
| Admin loads no font | `packages/admin/index.html` (no font link) ✅ |
| OKLCH tokens | `packages/app/src/index.css` lines 5-13 ✅ |
| Admin sidebar `bg-white` | `packages/admin/src/components/sidebar.tsx` line 89 ✅ |
| SessionPanel `w-72` | `packages/app/src/components/chat/session-panel.tsx` line 132 ✅ |
| Nav hover `bg-zinc-100 dark:bg-zinc-800` | `packages/app/src/components/sidebar.tsx` line 146 ✅ |
| AGORA keyframe missing | `packages/app/src/index.css` (slide-in/up only, no -16px entrance) ✅ |
| theme-color `#6366f1` | `packages/app/index.html` line 8 ✅ |
