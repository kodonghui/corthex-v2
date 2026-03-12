# Phase 5-1: CRITIC-B Review — Web Stitch Prompt
**Reviewer**: CRITIC-B (Amelia · Quinn · Bob)
**Date**: 2026-03-12
**File reviewed**: `_corthex_full_redesign/phase-5-prompts/stitch-prompt-web.md`
**Sources cross-checked**: design-tokens.md, component-strategy.md, web-analysis.md, landing-analysis.md

---

## Round 1 Review

### Overall Assessment

The document is impressively detailed and structured — the master prompt concept is excellent, hex values are largely accurate, and the section-by-section layout specs are highly specific. However, **7 issues** were found: 2 critical, 3 major, 2 minor.

**Preliminary Score: 7.5 / 10**

---

## 🔴 CRITICAL ISSUES (Blocking)

### Issue 1 — Invalid CSS class `vertical-text` (Section 1, line ~303)

**— Amelia says:** "This will fail silently in Stitch. `vertical-text` is not a Tailwind utility class — it doesn't exist. Worse, `writing-mode: vertical-text` is not a valid CSS `writing-mode` value either. The only valid values are `horizontal-tb`, `vertical-rl`, `vertical-lr`, `sideways-rl`, `sideways-lr`. Stitch will either skip it or output broken CSS."

**Location**: Section 1 TrackerPanel COLLAPSED STATE:
```
span font-mono text-[10px] text-zinc-500 vertical-text "34s"
```

**Fix required**:
```
span className="font-mono text-[10px] text-zinc-500 [writing-mode:vertical-rl] rotate-180"
```
(`rotate-180` makes it read top-to-bottom naturally in a vertical sidebar.)

---

### Issue 2 — Zero ARIA landmarks across all 9 sections (WCAG AA FAIL)

**— Quinn says:** "Every page in this document fails WCAG 2.1 AA §1.3.6 (Identify Purpose) and §4.1.2 (Name, Role, Value). The AppSidebar must be wrapped in `<nav aria-label="메인 내비게이션">`, the content area in `<main>`, and the TrackerPanel in `<aside aria-label="위임 체인">`. Without `role` and `aria-label` instructions in the Stitch prompt, the generated code will be entirely div-soup with zero semantic structure. Screen readers cannot navigate it at all."

**Affects**: ALL page sections (1 through 7).

**Fix required** — Add to Section 0 Master Prompt, under COMPONENTS block:
```
SEMANTIC STRUCTURE (required on every page):
- Sidebar nav: <nav aria-label="메인 내비게이션">
- Page content area: <main id="main-content">
- TrackerPanel: <aside aria-label="위임 체인">
- Modals/Drawers: role="dialog" aria-modal="true" aria-labelledby="{header-id}"
- Active nav item: aria-current="page"
- Status dots (decorative): aria-hidden="true"
- All icon-only buttons: aria-label="[action description]"
- All animate-pulse status indicators: aria-live="polite" aria-atomic="true"
```

---

## 🟠 MAJOR ISSUES (Must Fix Before Stitch Session)

### Issue 3 — `border-zinc-800` / `divide-zinc-800` violations (3 instances)

**— Amelia says:** "The Master Prompt explicitly says 'NEVER use border-zinc-800 on dark surfaces — it is INVISIBLE on zinc-900.' Then the document uses it three times in sections 2, 4, and 6. This is a self-contradiction that will produce invisible borders in the generated output."

**Violations found**:
| Location | Current (Wrong) | Fix |
|----------|-----------------|-----|
| Section 2, Recent Activity card | `divide-y divide-zinc-800` (on bg-zinc-900) | `divide-y divide-zinc-700/50` |
| Section 4, Document Card footer | `border-t border-zinc-800` (on bg-zinc-900 card) | `border-t border-zinc-700/50` |
| Section 6, Trust Rail | `border-y border-zinc-800` (on bg-zinc-900 trust rail) | `border-y border-zinc-700` |

---

### Issue 4 — All `animate-pulse` elements missing `motion-reduce:animate-none`

**— Quinn says:** "WCAG 2.1 §2.3.3 (Animation from Interactions) and web-analysis.md §33 both mandate `motion-reduce:transition-none` on every animated element. There are at least 8 `animate-pulse` instances across sections 1–7, and all are missing the motion-reduce override. Users with vestibular disorders will see non-stop pulsing animations throughout the entire UI. This is a WCAG AA failure."

**Affected elements** (8+ total):
- Section 1 Hub: StatusDot working `bg-indigo-500 animate-pulse` (AppSidebar, SessionPanel, TrackerPanel active step)
- Section 1 Hub: Streaming state bounce dots `animate-bounce`
- Section 1 Hub: TrackerPanel "분석 중... 12s" `animate-pulse`
- Section 2 Dashboard: Multiple StatusDot working
- All other sections with any working/active dots

**Fix required**: Every animated element needs the suffix:
```
animate-pulse motion-reduce:animate-none
animate-bounce motion-reduce:animate-none
```
Add to Section 0 Master Prompt under COMPONENTS:
```
ANIMATION RULE: Every animate-* class MUST be paired with motion-reduce:animate-none.
Every transition-* class MUST be paired with motion-reduce:transition-none.
NEVER omit these — non-negotiable for accessibility.
```

---

### Issue 5 — TrackerPanel width transition spec missing (Section 1)

**— Amelia says:** "web-analysis.md §11 specifies the exact TrackerPanel animation: `transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none`. This is the Hub's signature interaction — the Tracker expanding from w-12 to w-80 on the first handoff event. The Section 1 prompt shows the collapsed state and expanded state, but gives ZERO instruction on the width transition between them. Stitch will generate two static states with no transition, completely losing the 'reveal not intrusion' design intent from Phase 2-1."

**Fix required** — In Section 1 TrackerPanel, add transition spec:
```
TrackerPanel WIDTH TRANSITION:
className="... transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none"
- Collapsed (default): w-12
- Expanded (on first handoff): w-80
- This transition is the Hub's signature animation — must be included
```

---

## 🟡 MINOR ISSUES

### Issue 6 — "Generate as React" instruction at END of each section (Stitch UX)

**— Bob says:** "Every section puts `Generate as React with Tailwind CSS` at the very end — after 100-200 lines of spec. For Stitch, the generation format instruction should appear at the TOP of each page prompt, before the layout spec. If the format instruction is at the end, Stitch processes the entire spec in text mode, then switches — it may miss context or produce HTML by default. Move it to the first line of each page section prompt."

---

### Issue 7 — Section 6 Landing Page needs Stitch session split guidance

**— Bob says:** "Section 6 is the document's longest section at ~130+ spec lines. Section 0 Master + Section 6 Landing in one Stitch session is the highest-risk combination. No split guidance exists. The Landing page should be noted as requiring 2-3 Stitch sessions: (a) Nav+Hero+Trust Rail, (b) How It Works + Feature sections, (c) Pricing + Final CTA + Footer."

---

## ✅ What's Working Well

- **Hex color accuracy**: All hex values cross-checked against design-tokens.md — 100% match (zinc-950 #09090B, zinc-900 #18181B, zinc-700 #3F3F46, indigo-600 #4F46E5, indigo-500 #6366F1, indigo-950 #1E1B4B, indigo-300 #A5B4FC) ✓
- **border-zinc-800 rule in master prompt**: The rule is correctly stated and enforced for most sections ✓
- **Tailwind v4 arbitrary syntax**: `text-[10px]`, `bg-indigo-500/10`, `duration-[250ms]`, `shadow-indigo-500/10` — all valid v4 syntax ✓
- **Korean text preservation**: All Korean UI copy is intact and specific ✓
- **ReactFlow placeholder note**: Section 3 correctly instructs Stitch to generate a static visual placeholder for the NEXUS canvas ✓
- **Link vs a href**: Section 6 correctly instructs `<Link to="...">` for SPA navigation ✓
- **Theme swap guide**: All 5 themes are complete with font specs, all border-default colors are distinct from their bg colors ✓
- **Desktop-only spec**: All sections correctly specify min-width constraints ✓
- **Section 0 concept**: Master prompt as paste-first system establisher is the right approach for Stitch ✓

---

## Issue Count Summary

| Severity | Count | Issues |
|----------|-------|--------|
| 🔴 Critical | 2 | vertical-text invalid class, zero ARIA landmarks |
| 🟠 Major | 3 | border-zinc-800 violations (×3), missing motion-reduce, missing TrackerPanel transition |
| 🟡 Minor | 2 | generate instruction placement, landing page split guidance |
| **Total** | **7** | |

---

## Revised Score After Fixes

| Dimension | Current | After Fixes |
|-----------|---------|-------------|
| Completeness | 8/10 | 9/10 |
| Specificity (no vague values) | 9/10 | 9.5/10 |
| Copy-paste readiness | 7/10 | 9/10 |
| Design accuracy vs Phase 0-4 | 8.5/10 | 9.5/10 |
| A11y / WCAG compliance | 3/10 | 8/10 |
| **Overall** | **7.5/10** | **9/10** |

**Bottom line**: Fix Issues 1–5 (all critical+major) before Stitch sessions begin. Issues 6–7 are minor workflow improvements. After fixes, this is a production-ready Stitch prompt document.

---

---

## Round 2 — Re-Score After Fixes

### Verification Results (file spot-checked)

| Fix | Verified | Notes |
|-----|----------|-------|
| Critical #1 `vertical-text` → `[writing-mode:vertical-rl] rotate-180` | ✅ | Line 328: clean, valid CSS |
| Critical #2 ARIA landmarks added to Section 0 | ✅ | Lines 124–132: nav/main/aside/dialog/aria-current/aria-hidden/aria-expanded/inert pattern |
| Major #1 `border-zinc-800` on bg-zinc-900 eliminated | ✅ | 3 remaining instances (lines 963, 1187, 1196) are on bg-zinc-950 — acceptable per landing-analysis |
| Major #2 `motion-reduce:animate-none` added | ✅ | 13 total instances + Section 0 rule codified |
| Major #3 TrackerPanel `transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none` | ✅ | Line 282: exact spec present |
| Minor #1 "Generate as React" moved to first line | ✅ | Lines 144, 344, 500, 665, 783, 940, 1220 — all sections confirmed |
| Minor #2 Section 6 landing 3-session split | ✅ | Sessions A/B/C noted |

**One note on the fix summary doc**: The `phase5-step1-fixes.md` lists T3=Inter, T4=Outfit, T5=DM+Sans as font URLs — but the **actual stitch-prompt-web.md correctly uses** IBM Plex Sans (T3), Syne (T4), Instrument Sans (T5). The summary had an error but the implementation is correct.

### Re-Score

| Dimension | Before | After | Δ |
|-----------|--------|-------|---|
| Completeness (page coverage) | 7.5/10 | 9/10 | +1.5 — Soul Editor Section 10 added |
| Specificity (no vague values) | 9/10 | 9.5/10 | +0.5 — TrackerPanel transition + font URLs |
| Copy-paste readiness | 7/10 | 9.5/10 | +2.5 — ARIA, motion-reduce, Generate-first, no invisible borders |
| Design accuracy vs Phase 0–4 | 8.5/10 | 9.5/10 | +1.0 — 즉시 적용됨, Scale icon, border rule consistent |
| A11y / WCAG compliance | 3/10 | 8.5/10 | +5.5 — landmarks + motion-reduce throughout |
| **Overall** | **7.5/10** | **9.2/10** | **+1.7** |

**VERDICT: PASS** (target ≥ 7/10, actual 9.2/10)

---

## Cross-Talk with CRITIC-A — Round 1

**CRITIC-A Issues confirmed by CRITIC-B (no overlap — additive):**
- Issue #1 (`"저장됨"` → `"즉시 적용됨"` in Section 3 toolbar): Confirmed. I missed this — Marcus caught a real Vision §EM3 violation.
- Issue #2 (MessageSquare chatbot anti-pattern): Confirmed. Covered below.
- Issue #3 (mobile contradiction Sec 0 vs Sec 6): Confirmed. Section 6 end says "Mobile gets scrollable layout" but Section 0 says "NO mobile breakpoints" — these are directly contradictory. CRITIC-A fix is correct: add landing-page exception note to Section 0.
- Issue #5 (font URLs): See below.
- Issue #6 (StatusDot h-1.5 vs h-2): Confirmed. Section 1 active session item (line ~192) uses `h-1.5 w-1.5` while all other StatusDot specs say `h-2 w-2`. Missed by me.

**CRITIC-A Questions answered:**

### Q1 — AGORA icon replacement
Neither `Lucide Users` nor `Lucide Network`.

`Lucide Network` is **already in use** in the same document for the TrackerPanel header (`위임 체인`, Section 1 line ~262). Using the same icon for two unrelated features (delegation chain tracker vs. multi-agent debate room) creates icon vocabulary collision — the user can't learn the icon language.

`Lucide Users` suggests HR/team management, closer to a Slack workspace metaphor than a deliberation room.

**Best replacement: `Lucide Scale`** — the scales of justice/balance directly maps to "weighing competing opinions and reaching a verdict." Zero chatbot connotation, no reuse conflict, immediately legible as "deliberation" for a Korean CEO audience (법정/판단 metaphor). Color stays `text-indigo-400`.

Second choice: `Lucide Vote` if they want the voting/decision emphasis, but Scale is more distinctive.

### Q2 — Missing P1 page priority
**Soul editor first**, for the same reason as CRITIC-A, plus one technical constraint: Soul editor is the only P1 page where the Stitch placeholder note is non-trivial. NEXUS canvas already has the ReactFlow placeholder pattern (Section 3). Soul editor must carry the same pattern for CodeMirror: "The code editor area is a placeholder — will be replaced with CodeMirror 6 in code. Design as a monospace text area with syntax highlight coloring: zinc-950 bg, text-emerald-400 for strings, text-violet-400 for keywords, text-zinc-300 for default text."

Without this placeholder note documented, whoever writes the Soul editor Stitch prompt later will generate a plain `<textarea>` and then struggle to integrate CodeMirror on top of it. ARGOS scheduler is essentially a cron table UI — visually straightforward, lower uniqueness, lower risk if unspecced.

### Q3 — Font URLs placement
**Option (a) — each theme section, self-contained.** Agree with CRITIC-A.

Reason: The user pastes Section 0 once per session. The theme swap is a SECOND paste mid-session or in a new session. If font URLs are in Section 0, the user has to go back and re-paste a modified Section 0 every time they want to try a theme — friction. If font URLs are in the theme section itself, one paste gives everything. (c) New section adds lookup friction. (a) is minimal friction.

**Additional issue I found that CRITIC-A missed:**

### New Issue: Section 5 `<select>` elements missing `appearance-none` (Minor)
Section 5 filter dropdowns: `"모든 티어" select: bg-zinc-900 ... pr-8` — `pr-8` reserves space for a dropdown arrow, but without `appearance-none` the browser's native dropdown arrow overlays the styled element. On dark backgrounds, native select arrows are typically rendered in OS theme colors (often white/grey) and will create a visual artifact. Fix: add `appearance-none` + explicit `ChevronDown` icon wrapper to all select specs in Section 5, matching the existing pattern in Section 3 AgentConfigPanel (`ChevronDown h-4 w-4 text-zinc-500`).

**Combined total across both critics: 13 distinct issues** (7 CRITIC-B + 7 CRITIC-A, 1 overlap on StatusDot = 13 net unique issues).
