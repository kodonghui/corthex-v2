# Phase 5 Step 2 — Fix Summary (Round 1)

**Date:** 2026-03-12
**File modified:** `_corthex_full_redesign/phase-5-prompts/stitch-prompt-app.md`
**Total fixes applied:** 11

---

## Pre-fix scores
- Critic-A: 8.9/10 (0 Critical, 3 Major, 5 Minor)
- Critic-B: 9.1/10 (2 Major, 3 Minor)
- Average: 9.0/10 ✅ already PASS (threshold: 7.0/10)

---

## CRITIC-A FIXES (8 issues)

### Major #1 — Section headers in English
**Issue:** "ACTIVE", "TODAY", "THIS WEEK" section group labels in Hub screen were English — should be Korean app
**Fix:** Changed to "활성", "오늘", "이번 주"
**Note:** Status badge "ACTIVE" on individual session card preserved (status code, not UI label)

### Major #2 — TrackerStrip cost row border-zinc-800 on zinc-900
**Issue:** Section 3 expanded tracker cost summary row had `border-t border-zinc-800` inside `bg-zinc-900` TrackerStrip — invisible per established rule
**Fix:** Changed to `border-t border-zinc-700`

### Major #3 — NEXUS SVG Level 2 node coordinates overlap
**Issue:** Original coords x=20/x=120/x=230 produced 20px overlap between first two nodes and 10px overlap between last two
**Fix:** Corrected to x=5/x=135/x=265 — right edges 125/255/385, all 10px gaps, fits within 390px viewport ✓

### Minor #1 — divide-zinc-800 in Agent Health + Recent Activity Cards
**Issue:** `divide-y divide-zinc-800` on `bg-zinc-900` card body → invisible row dividers
**Fix:** Changed to `divide-y divide-zinc-700/40` (semi-transparent for subtle visual rhythm)

### Minor #2 — IBM Plex Mono URL missing in T3 theme
**Issue:** T3 Arctic Intelligence specified 'IBM Plex Mono' for monospace but no @import URL
**Fix:** Added `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap')`

### Minor #3 — Chat header h-12 exception undocumented
**Issue:** Section 0 SPACING listed h-14 as standard header height, but Chat screen uses h-12 — inconsistency needed explanation
**Fix:** Added exception note to Section 0 SPACING + Section 9 Quick Reference:
  "Exception: Chat screen header h-12 (48px) — maximizes message area; all icon buttons still meet 44px minimum"

### Minor #4 — Logout button below 44px touch target
**Issue:** `button.text-xs.text-zinc-500.underline` — inline text link style fails touch target requirement for a destructive action
**Fix:** Changed to `button.border.border-zinc-700.text-zinc-400.text-sm.px-4.py-2.rounded-lg.min-h-[44px]` (ghost button pattern, 44px height)

### Minor #5 — STATE D TrackerStrip collapse button missing aria-expanded
**Issue:** STATE D prose said "same as STATE C" — Stitch won't infer ARIA attributes from prose references
**Fix:** Added explicit `[aria-expanded="true" aria-label="트래커 접기"]` to STATE D header collapse button

---

## CRITIC-B FIXES (5 issues — 3 overlap with CRITIC-A)

### Major #1 — NEXUS zoom controls w-10 h-10 = 40px (below 44px minimum)
**Issue:** `w-10 h-10` = 40px × 40px — fails iOS 44pt / Android 48dp touch target requirement
**Fix:** Changed to `w-11 h-11` = 44px × 44px ✅

### Major #2 — divide-zinc-800 violations (same as CRITIC-A Minor #1 — combined fix)

### Minor #1 — IBM Plex Mono URL (same as CRITIC-A Minor #2 — combined fix)

### Minor #2 — Chat header h-12 exception (same as CRITIC-A Minor #3 — combined fix)

### Minor #3 — Session row border-b border-zinc-800/60 on bg-zinc-950
**Issue:** Section 1 session rows used `border-b border-zinc-800/60` on bg-zinc-950 — ~1.2:1 contrast, nearly invisible
**Fix:** Changed to `border-b border-zinc-700/30` (subtle but visible on zinc-950)

---

## Self-audit: Notification list dividers
**Additional fix:** `divide-y divide-zinc-800` in Notification list (inside bg-zinc-950 section) → `divide-y divide-zinc-700/40`

---

## Final state
All 11 fixes applied. No remaining border-zinc-800/divide-zinc-800 violations in document.
