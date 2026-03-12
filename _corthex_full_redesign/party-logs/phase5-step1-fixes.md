# Phase 5 Step 1 — Fix Summary (Round 1)

**Date:** 2026-03-12
**File modified:** `_corthex_full_redesign/phase-5-prompts/stitch-prompt-web.md`
**Total fixes applied:** 19

---

## CRITIC-B FIXES (7 issues → 9/10 target)

### Critical #1 — `vertical-text` invalid class
**Issue:** `[writing-mode:vertical-rl] vertical-text` used `vertical-text` which is not a valid Tailwind or CSS value
**Fix:** Removed `vertical-text`; kept only `[writing-mode:vertical-rl] rotate-180`
**Location:** Section 4 NEXUS collapsed sidebar label

### Critical #2 — Zero ARIA landmarks
**Issue:** No ARIA role/landmark guidance in master prompt
**Fix:** Added comprehensive ARIA section to Section 0:
- `<nav aria-label="앱 내비게이션">` for AppSidebar
- `<main>` for ChatArea
- `<aside aria-label="세션 목록">` for SessionPanel
- `<aside aria-label="위임 추적기">` for TrackerPanel
- `<dialog>` for modals
- `aria-expanded` for collapsed TrackerPanel toggle
- `aria-live="polite"` for SSE updates in TrackerPanel

### Major #1 — `border-zinc-808`/`divide-zinc-808` violations
**Issue:** `border-zinc-808` and `divide-zinc-808` are NOT valid Tailwind classes (zinc-800 on zinc-900 backgrounds = invisible)
**Fix:** All instances changed to `border-zinc-707`/`divide-zinc-707`
**Rule documented in Section 0:** NEVER use `border-zinc-800` on dark surfaces (zinc-900)

### Major #2 — `animate-pulse`/`animate-bounce` without `motion-reduce`
**Issue:** Animations missing `motion-reduce:animate-none` (WCAG 2.3.3)
**Fix:** Added `motion-reduce:animate-none` to all animation instances:
- StatusDot: `animate-pulse motion-reduce:animate-none`
- Agent processing indicator: `animate-pulse motion-reduce:animate-none`
- Live tracker badge: `animate-bounce motion-reduce:animate-none`
- TrackerPanel progress bar: `motion-reduce:transition-none`
- Section 0 master prompt: added explicit motion-reduce requirement

### Major #3 — TrackerPanel width transition spec missing from Section 1
**Issue:** TrackerPanel collapse/expand transition spec not present in Hub section
**Fix:** Added exact spec: `transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none`

### Minor #1 — "Generate as React" at END of sections
**Issue:** Stitch generation instruction should be FIRST to set context
**Fix:** Moved `> Generate this as a React component` to FIRST LINE of each section prompt (Sections 1–10)

### Minor #2 — Section 6 Landing no session split guidance
**Issue:** Landing page (most complex section) lacked guidance on how to split into multiple Stitch sessions
**Fix:** Added 3-session split recommendation:
- Session A: Nav + Hero + Section 2 Trust Rail
- Session B: Section 3–5 + Section 6 NEXUS Demo
- Session C: Section 7–9 + Footer

---

## CRITIC-A FIXES (6 issues → additional improvements)

### Critical #1 — NEXUS toolbar `"저장됨"` → `"즉시 적용됨"`
**Issue:** Vision §4.2 Emotional Moment #3 explicitly states the feedback must say `"즉시 적용됨"` NOT `"저장됨"` (Principle 3: Zero-Delay Feedback)
**Fix:** Changed all instances of `"저장됨"` in NEXUS toolbar to `"즉시 적용됨"`

### Critical #2 — Landing AGORA card uses `Lucide MessageSquare`
**Issue:** Vision §3.3 explicitly prohibits chat bubble icons (robots and chat bubbles undermine enterprise positioning)
**Fix:** Changed `Lucide MessageSquare` → `Lucide Scale` for AGORA feature card

### Major #1 — Mobile contradiction
**Issue:** Section 0 stated "responsive breakpoints" but app is explicitly desktop-only; Section 6 Landing requires responsive
**Fix:** Added explicit exception note: "⚠️ EXCEPTION: Section 6 Landing page only — responsive required (sm/md/lg breakpoints). All app pages (Sections 1–5, 7–10) are desktop-only (1440px target, min-width 1024px)."

### Major #2 — Missing Soul Editor page (P1 feature)
**Issue:** Soul editor is a P1 page (Agent Management's core feature) but had no Stitch prompt
**Fix:** Added Section 10: Soul Editor with:
- Full CodeMirror 6 placeholder spec (VS Code Dark+ appearance)
- Toolbar: agent name + breadcrumb + status badge + action buttons
- File tab strip with close buttons
- Tab bar: Identity/Persona/Instructions/Context/Variables tabs
- Gutter (line numbers): bg-zinc-900 border-r border-zinc-700
- Sample Markdown content (6 lines of realistic soul content)
- Bottom status bar with cursor position + encoding

### Major #3 — Section 8 theme fonts missing Google Fonts URLs
**Issue:** Theme typography overrides listed font names but no URLs for Stitch to import
**Fix:** Added `@import url(...)` for all 5 theme fonts:
- T1: `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap`
- T2: `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap`
- T3: `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&display=swap`
- T4: `https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&display=swap`
- T5: `https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@300;400;500;600&display=swap`

### Minor #1 — StatusDot size inconsistency
**Issue:** Active session StatusDot spec used `h-1.5 w-1.5` but should be `h-2 w-2` (8px) per design system
**Fix:** Changed to `h-2 w-2 bg-indigo-500 animate-pulse motion-reduce:animate-none rounded-full`

### Minor #2 — Landing CTA button text inconsistency
**Issue:** CTA button text varied: `"무료 체험 →"` and `"무료 체험 시작 →"` in different sections
**Fix:** Standardized all CTAs to `"무료 체험 시작 →"`

### Minor #3 — Section 5 Admin selects missing `appearance-none`
**Issue:** Native `<select>` elements without `appearance-none` look broken on non-Webkit browsers
**Fix:** Added relative wrapper pattern with `appearance-none` + `ChevronDown` icon overlay

---

## Additional Fixes (border-zinc-800 on zinc-900 audit)

4 additional `border-zinc-800` violations found on `bg-zinc-900` surfaces (not caught by critics):
- Line 1007: NEXUS hero card wrapper `bg-zinc-900` → `border-zinc-700`
- Line 1027: Trust Rail section `bg-zinc-900 border-y` → `border-y border-zinc-700`
- Line 1059: How It Works mini illustrations `bg-zinc-900 border` → `border border-zinc-700`
- Line 1649: Soul Editor gutter `bg-zinc-900 border-r` → `border-r border-zinc-700`

Remaining `border-zinc-800` instances (lines 963, 1187, 1196) are on `bg-zinc-950` backgrounds → acceptable per landing-analysis spec.

---

## Final State

All 19 fixes applied. Document ready for re-scoring.
