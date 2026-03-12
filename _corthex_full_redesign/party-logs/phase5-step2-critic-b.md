# Phase 5-2: CRITIC-B Review — Mobile App Stitch Prompt
**Reviewer**: CRITIC-B (Amelia · Quinn · Bob)
**Date**: 2026-03-12
**File reviewed**: `_corthex_full_redesign/phase-5-prompts/stitch-prompt-app.md`
**Sources cross-checked**: app-analysis.md, design-tokens.md, component-strategy.md

---

## Checklist Verification (all 10 items from Writer)

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | Tailwind syntax: `duration-[250ms]` not `duration-250` | ✅ | `duration-[150ms]` / `duration-[250ms]` throughout. `duration-500` in §4 is valid Tailwind v4. |
| 2a | TrackerStrip: `role="region" aria-live="off"` (NEVER `role="status"`) | ✅ | §2 line 378, §3 line 438, §7 line 953 — all correct. Critical note in §0 present. |
| 2b | Chat: `role="log" aria-live="off"` | ✅ | §2 line 325 — correct. Override note present. |
| 2c | SR-only divs: separate `role="status" aria-live="polite" aria-atomic="true"` | ✅ | §2 line 372, §3 lines 491–494, §7 STATE B — all separated from visual divs. |
| 2d | Tab badges: `aria-label` on BUTTON, `aria-hidden="true"` on badge SPAN | ✅ | §1 line 285–288, §7 line 932 — correct. |
| 3 | Safe area only on BottomTabBar nav + InputBar wrapper | ✅ | §1 line 276 (nav), §2 line 394 (input), §5 sheet line 728 (calc variant). |
| 4 | `motion-reduce:animate-none` on ALL animate-* | ✅ | All instances verified: §0, §1 (×2), §2 (×3), §3, §4 (×2), §7, §8 themes (×5). |
| 5 | No `@xyflow/react` on NEXUS mobile | ✅ | §5 line 636 explicitly states "NOT @xyflow/react". |
| 6 | Touch targets ≥44px | ❌ | §5 zoom controls: `w-10 h-10` = 40px. See Issue #1. |
| 7 | TrackerStrip height transitions | ✅ | `transition-[height] duration-[250ms] ease-in-out motion-reduce:transition-none` in §2, §3, §7. |
| 8 | Section 7: all 4 TrackerStrip states | ✅ | IDLE / COMPACT-ACTIVE / EXPANDED / COMPLETE — all present. |
| 9 | Theme font URLs (T1–T5 primary fonts) | ✅ | T1 Space Grotesk, T2 JetBrains Mono, T3 IBM Plex Sans, T4 Syne, T5 Instrument Sans — all correct. |
| 9b | T3 mono font URL | ❌ | IBM Plex Mono URL missing. See Issue #3. |
| 10 | WCAG 2.2.2: no auto-collapse timer | ✅ | §0 line 170–171, §7 STATE D note. Compliant. |

---

## Issue List

### 🟠 MAJOR — Issue #1: NEXUS zoom controls `w-10 h-10` = 40px (BELOW 44px minimum)

**— Amelia says:** "Section 5 zoom buttons are the only interactive elements in the entire document that violate the touch target spec. `w-10 h-10` is 40×40px. iOS HIG minimum is 44pt, Android MD3 is 48dp. Section 0 TOUCH TARGETS rule explicitly says 'ALL interactive elements: minimum 44×44px.' Every other button in this document uses `w-11 h-11` — the zoom buttons are the single exception. Stitch will faithfully generate 40px buttons, and testers on a real device will notice immediately."

**Location**: Section 5 NEXUS, lines 713–716:
```
button[w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 ... aria-label="확대"]
button[w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 ... aria-label="축소"]
```

**Fix**:
```
button[w-11 h-11 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center aria-label="확대"]
button[w-11 h-11 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center aria-label="축소"]
```

---

### 🟠 MAJOR — Issue #2: `divide-y divide-zinc-800` on `bg-zinc-900` cards (invisible dividers)

**— Amelia says:** "Two card components in Section 4 use `divide-zinc-800` for row separators inside `bg-zinc-900` cards. `divide-zinc-800` is `#27272A`, `bg-zinc-900` is `#18181B`. The contrast between them is approximately 1.15:1 — essentially invisible. Section 0's border rule is 'NEVER use border-zinc-800 on dark surfaces — invisible on bg-zinc-900.' This applies identically to divide utilities."

**Locations**:
| Line | Element | Wrong | Fix |
|------|---------|-------|-----|
| 585 | Agent Health Card rows | `divide-y divide-zinc-800` on bg-zinc-900 | `divide-y divide-zinc-700/40` |
| 603 | Recent Activity Card rows | `divide-y divide-zinc-800` on bg-zinc-900 | `divide-y divide-zinc-700/40` |

---

### 🟡 MINOR — Issue #3: T3 Arctic Intelligence missing IBM Plex Mono `@import` URL

**— Bob says:** "Section 8 T3 spec says `Mono font: 'IBM Plex Mono' (substitute with JetBrains Mono if unavailable)` but provides no `@import` URL. The web prompt (stitch-prompt-web.md) correctly includes both the IBM Plex Sans AND IBM Plex Mono URLs for T3. The mobile version omits the Mono URL. When a user pastes the T3 theme section and uses any `font-mono` element (TierBadges, cost figures, chain step labels), it will silently fall back to system monospace. Inconsistent with T3's 'Quiet authority. Clean Scandinavian restraint' character."

**Fix** — Add after the IBM Plex Sans URL in T3:
```
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap')
```

---

### 🟡 MINOR — Issue #4: Chat Screen header `h-12` vs Section 0 spec `h-14` — undocumented exception

**— Quinn says:** "Section 0 SPACING rule: `Header height: h-14 (56px)`. But Chat Screens (Sections 2 and 3) use `[HEADER h-12]` = 48px. Sections 1, 4, 5, 6 all correctly use `h-14`. The Chat Screen intent is reasonable — saving vertical space for more message content — but there is no documented exception. Stitch generating Sections 2 and 3 will produce h-12 headers while every other screen has h-14. When integrating all generated screens, this inconsistency will require manual correction."

**Fix** — Add exception note to Section 0 under SPACING:
```
Header height: h-14 (56px) — EXCEPTION: Chat screen header is h-12 (48px) to maximize chat area.
```
And confirm `h-12` in Sections 2 and 3 is intentional.

---

### 🟡 MINOR — Issue #5: Section 1 session row dividers `border-b border-zinc-800/60` — very low contrast

**— Amelia says:** "Section 1 session rows use `border-b border-zinc-800/60` on `bg-zinc-950`. Technically within the stated rule (which prohibits zinc-800 on zinc-900, not zinc-950). But zinc-800 at 60% opacity on zinc-950 = approximately 1.2:1 contrast ratio — nearly invisible as a row separator. In practice, on a physical device in bright sunlight, these rows will have no visual separation at all. `border-b border-zinc-700/30` would be clearly visible with the same subtle aesthetic."

---

## ✅ What's Working Exceptionally Well

The Section 0 Master Mobile Prompt is the standout quality of this document:
- **ARIA invariants are fully documented and technically exact** — `role="log" aria-live="off"` on chat, `role="region" aria-live="off"` on TrackerStrip, separate sr-only divs — this is more thorough than the web prompt's ARIA section.
- **SSE endpoint spec** — `POST /api/workspace/hub/stream` (not GET) with full body spec. Stitch can't implement this but the comment guards against wrong assumptions. ✓
- **`autoCollapseTimer must NOT exist in Zustand store`** — explicit negative constraint prevents a common WCAG 2.2.2 failure. ✓
- **All 5 theme accents have `motion-reduce:animate-none`** on their StatusDot definitions — learned from web prompt fixes and applied correctly here.
- **Section 7 TrackerStrip STATE D** — explicitly shows COMPLETE state with expanded tracker staying open, confirming WCAG 2.2.2 "no auto-collapse." ✓
- **Screen-reader fallback SVG in Section 5** — the `sr-only` `<ul>` with agent list is excellent defensive accessibility design for the SVG canvas.
- **`Lucide Scale` already used for AGORA** (Section 6 line 799) — correctly aligned with web prompt fix. ✓
- **`inert={!open}` pattern documented** in Section 0 ARIA (drawers/sheets) — this is correct React/HTML behavior, not commonly remembered. ✓

---

## Issue Count Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 Major | 2 |
| 🟡 Minor | 3 |
| **Total** | **5** |

---

## Score

| Dimension | Score | Notes |
|-----------|-------|-------|
| Tailwind class validity | 9/10 | Chat header h-12 inconsistency; all other classes valid |
| ARIA invariants (critical spec) | 10/10 | Perfect on all 4 ARIA requirements |
| Safe area handling | 10/10 | Correctly scoped to nav + InputBar + sheet |
| motion-reduce coverage | 10/10 | All instances covered |
| Touch targets | 7/10 | Zoom buttons (40px) fail; all others pass |
| TrackerStrip spec | 10/10 | Height transitions, 4 states, WCAG 2.2.2 — flawless |
| Theme font URLs | 9/10 | T3 IBM Plex Mono URL missing |
| border-zinc-800 rule compliance | 8/10 | divide-zinc-800 violations in §4 |
| Copy-paste readiness | 9/10 | Minor header inconsistency; otherwise session-ready |
| **Overall** | **9.1/10** | |

**VERDICT: PASS** (target ≥ 7/10, actual 9.1/10)

Fixes required for Issues #1 and #2 before Stitch sessions begin. Issues #3–5 are low-risk but improve polish and consistency.

---

---

## Round 2 — Re-Score After Fixes

### Verification Results

| Fix | Verified | Evidence |
|-----|----------|---------|
| Major #1: zoom buttons `w-11 h-11` | ✅ | Lines 714, 716: `w-11 h-11 rounded-lg bg-zinc-800 border border-zinc-700` |
| Major #2: `divide-zinc-700/40` on cards | ✅ | Line 586 (Agent Health), 604 (Recent Activity), 860 (Notifications) |
| Minor #1: T3 IBM Plex Mono URL | ✅ | Line 1089: `@import url('.../IBM+Plex+Mono...')` |
| Minor #2: h-12 exception documented | ✅ | Line 110 (§0 SPACING) + Line 1172 (§9 Quick Reference) |
| Minor #3: `border-zinc-707/30` session rows | ✅ | Line 244: `border-b border-zinc-700/30` |
| CRITIC-A #1: Korean group labels | ✅ | Lines 230/242/258: "활성"/"오늘"/"이번 주". Badge "ACTIVE" on card (line 237) retained in English ✓ |
| CRITIC-A #2: TrackerStrip cost row border | ✅ | Line 485: `border-t border-zinc-707` |
| CRITIC-A / Cross-talk: NEXUS SVG coordinates | ✅ | Lines 708–711: x=5/x=135/x=265 with inline gap verification comments |
| CRITIC-A #5: Logout ghost button + touch target | ✅ | Line 843: `border border-zinc-707 text-zinc-400 text-sm px-4 py-2 rounded-lg min-h-[44px]` |
| CRITIC-A #6: STATE D aria-expanded="true" | ✅ | Line 977: `collapse button [aria-expanded="true" aria-label="트래커 접기"]` |

### Re-Score

| Dimension | Before | After | Δ |
|-----------|--------|-------|---|
| Tailwind syntax | 9/10 | 10/10 | +1 — h-12 exception documented |
| ARIA invariants | 10/10 | 10/10 | — already perfect |
| Safe area | 10/10 | 10/10 | — |
| motion-reduce | 10/10 | 10/10 | — |
| Touch targets | 7/10 | 10/10 | +3 — zoom buttons + logout fixed |
| TrackerStrip spec | 10/10 | 10/10 | — |
| Theme font URLs | 9/10 | 10/10 | +1 — IBM Plex Mono added |
| border rule compliance | 8/10 | 10/10 | +2 — cost row + divide-zinc fixed |
| Copy-paste readiness | 9/10 | 10/10 | +1 — Korean labels, no invisible borders |
| NEXUS SVG accuracy | 7/10 | 10/10 | +3 — overlapping nodes corrected |
| **Overall** | **9.1/10** | **9.9/10** | **+0.8** |

**VERDICT: PASS** ✅ (target ≥ 7/10, actual 9.9/10)

---

## Cross-Talk with CRITIC-A — Round 1

**CRITIC-A Issues confirmed / acknowledged:**
- Issue #1 (English labels): Confirmed fix-required — see Q1 below.
- Issue #2 (§3 TrackerStrip cost row `border-t border-zinc-800`): **I missed this.** CRITIC-A is correct. Line 484: `COST SUMMARY ROW border-t border-zinc-800` inside TrackerStrip `bg-zinc-900`. Invisible divider. Should be `border-t border-zinc-700`. Adding to combined list.
- Issue #3 (§4 divide-zinc-808): Overlap with my Issue #2. Same fix.
- Issue #4 (T3 IBM Plex Mono URL): Overlap with my Issue #3. Same fix.
- Issue #5 (h-12 header): Overlap with my Issue #4. See Q2 below.
- Issue #6 (STATE D aria-expanded): **I missed this.** CRITIC-A correct — STATE D says "Same as STATE C but..." and lists differences, but does not explicitly restate `aria-expanded="true"` on the collapse button. Should be added explicitly.

**Cross-talk answers:**

### Q1 — English section labels: fix-required
No evidence in Phase 2-2 app-analysis.md that "ACTIVE/TODAY/THIS WEEK" were intentional. The web stitch prompt Phase 5-1 already uses "오늘" (Korean). CORTHEX Voice spec: "Economy: Minimum words, maximum information. Mission briefings, not loading spinners." English ALL-CAPS labels read as borrowed from generic English SaaS (Linear, GitHub) — wrong register for a Korean CEO command center. Confirm fix: "활성", "오늘", "이번 주". Note: The badge "ACTIVE" on the session card (line 236) is a separate string from the group headers — the badge can optionally stay in English as a status code (Korean military/professional apps sometimes use English status abbreviations), but the section GROUP HEADERS must be Korean.

### Q2 — Chat header h-12: document the exception (do NOT force h-14)
h-12 (48px) is likely intentional and appropriate for chat screens — maximizes message area, and all header buttons (w-11 h-11 = 44px) still fit within 48px. The Phase 2-2 app-analysis.md layout spec does show `[HEADER h-12]` for chat. Recommended fix: Add one line to Section 0 SPACING and to Section 9 Quick Reference: `Chat screen header: h-12 (48px) — exception for chat to maximize message area.`

### Q3 — NEXUS SVG coordinates: OVERLAPPING NODES (new critical finding from both critics)
CRITIC-A's concern about x=20 touching the edge is the lesser issue. The **real problem** is that the Level 2 node coordinates produce overlapping `<rect>` elements:

| Node | x | width | Right edge |
|------|---|-------|-----------|
| 데이터 전문가 | 20 | 120 | 140 |
| 재무 전문가 | 120 | 120 | 240 |
| 코딩 실행자 | 230 | 120 | 350 |

- `데이터 전문가` [20→140] overlaps `재무 전문가` [120→240] by **20px** ❌
- `재무 전문가` [120→240] overlaps `코딩 실행자` [230→350] by **10px** ❌

Stitch will faithfully produce overlapping SVG rects. **Fix required:**
```
Level 2 — corrected coordinates (5px margin each side, 10px gap between nodes):
  "데이터 전문가" x=5   → rect [5, 125]
  "재무 전문가"   x=135  → rect [135, 255]  (10px gap after 125)
  "코딩 실행자"   x=265  → rect [265, 385]  (10px gap after 255)
```
Total tree width: 385px in 390px viewport ✓ (5px margin each side). CIO's two children (data at x=5, remu at x=135) center at x=70 and x=195. CIO is at x=60→180, center 120. Children center needs to be symmetric around x=120: x=70 is 50px left of center, x=195 is 75px right. Not perfectly symmetric, but no overlap. For perfect centering: x=10, x=130 → centers at 70, 190. Close enough for a static visual.

**This is a new MAJOR issue missed by both critics in Round 1.**

### Q4 — Section 7 STATE D and More screen

**Section 7 STATE D**: CRITIC-A's Issue #6 (`aria-expanded="true"` missing) is valid. "Same as STATE C but…" implies it, but Stitch may not carry over unstated ARIA attributes from a prose reference. Must be explicit.

**More screen logout button** (CRITIC-A/Luna): Agree with the concern. `text-xs text-zinc-500 underline` is visually underpowered for a destructive action AND at 12px text it may not meet 44px touch target. Fix: Ghost button `border border-zinc-700 text-zinc-400 text-sm px-4 py-2 rounded-lg` with explicit min-h-[44px].

**Combined unique issues after cross-talk: 10** (5 mine + 4 CRITIC-A unique + 1 new SVG overlap).
