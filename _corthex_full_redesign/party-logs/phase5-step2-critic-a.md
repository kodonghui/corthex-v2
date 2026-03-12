# Phase 5-2 Review — CRITIC-A (Sally / Marcus / Luna)

**Date**: 2026-03-12
**File reviewed**: `_corthex_full_redesign/phase-5-prompts/stitch-prompt-app.md`
**Round**: 1 — Initial Review

---

## Checklist Pre-Verification (Writer's 10-point list)

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | "명령 접수됨" (NOT "수락됨") | ✅ | Line 78, 365, 1031, 1059, 1245 — all correct |
| 2 | AGORA uses Lucide Scale | ✅ | Line 799: `Scale w-5 h-5 text-indigo-400 ← Lucide Scale (deliberation/justice — NOT MessageSquare/chat bubble)` |
| 3 | Touch targets ≥44px | ✅ | Master prompt + Quick Reference fully documented. All interactive elements meet iOS 44pt / Android 48dp |
| 4 | motion-reduce on ALL animated elements | ✅ | StatusDots, processing dots, spinner, cost bar, tab transitions — all have `motion-reduce:animate-none` or `motion-reduce:transition-none` |
| 5 | SSE endpoint: POST /api/workspace/hub/stream | ✅ | Lines 174, 1219 — both correct |
| 6 | No auto-collapse timer (WCAG 2.2.2) | ✅ | Lines 170–171: "NO auto-collapse timer" + "autoCollapseTimer must NOT exist in Zustand store" + STATE D keeps tracker expanded |
| 7 | Theme font names (T3=IBM Plex Sans, T4=Syne, T5=Instrument Sans) | ✅ | Lines 1067, 1093, 1121 — all correct |
| 8 | Safe area `pb-[env(safe-area-inset-bottom)]` | ✅ | Lines 125, 139, 276, 394 — correct placement (nav + InputBar only) |
| 9 | Page completeness | ✅ | Hub / Chat compact / Chat expanded / Dashboard / NEXUS / More + Notifications / Shared components — all 7 sessions present |
| 10 | "Generate as React" as first line of each section | ✅ | Lines 191, 300, 418, 510, 631, 760, 908 — all sections start with this |

**Preliminary assessment**: Master prompt absorbed Phase 5-1 lessons completely. No critical brand violations found. Proceeding to deep-scan for issues.

---

## Sally (UX Designer) — "실제 유저가 이걸 3초 안에 이해할 수 있나?"

**Major UX issue — Section 1 Hub: English section labels in a Korean CEO app.** The session list uses section headers "ACTIVE", "TODAY", "THIS WEEK" (lines 229, 241, 256) in English ALL-CAPS. Every other text on the screen is Korean ("월간 투자 리포트 분석", "허브", "새 세션 시작", "세션 검색..."). The web Phase 5-1 SessionPanel correctly uses "오늘" for its date group. A Korean CEO scanning their session list will encounter English labels that feel foreign. These should be "활성", "오늘", "이번 주" — or if kept in English (e.g., as status language), this decision needs explicit documentation explaining why. Right now it's unexplained and inconsistent.

**Minor UX observation — Section 2/3 Chat: Header height inconsistency.** Section 2 and 3 (Chat screens) use `h-12` (48px) for the header while every other screen (Hub, Dashboard, NEXUS, More) uses `h-14` (56px) per the master prompt rule (`Header height: h-14 (56px) with border-b border-zinc-700`). The h-12 choice might be intentional to maximize chat area, but it's undocumented as an exception, and it contradicts the master prompt. Stitch will generate visually inconsistent header heights across screens without a note explaining this. The Quick Reference also says `Header: h-14 (56px)` with no exception.

The overall UX flow is excellent — all 6 screens are specified, all critical paths (new session → chat → tracker expand → complete) are traceable through the prompts. The NEXUS read-only SVG with bottom sheet tap-to-detail is well-designed for mobile constraints.

**Sally's verdict**: One genuine UX inconsistency (English labels) and one undocumented deviation (h-12 header). Both are fixable without changing anything structural. The user flow coverage is complete.

---

## Marcus (Visual Designer) — "시각적 위계가 무너졌다."

**Major visual violation — Section 3 TrackerStrip Cost Summary Row: `border-zinc-808` on zinc-900.** Line 484: `COST SUMMARY ROW (px-4 py-1.5 border-t border-zinc-800 flex items-center justify-between shrink-0)`. The TrackerStrip uses `bg-zinc-900` as its background. The cost summary row uses `border-t border-zinc-800` as a divider. Per the established rule (master prompt line 70–71, Quick Reference line 1241): **"NEVER use border-zinc-800 on dark surfaces — invisible on bg-zinc-900."** This is a direct violation. The TrackerStrip's cost row divider will be invisible against the zinc-900 background. Fix: `border-t border-zinc-700`.

**Minor visual violation — Section 4 Dashboard Agent Health Card: `divide-zinc-808` on zinc-900.** Line 585: `AGENT ROWS (divide-y divide-zinc-800)` inside a card with `bg-zinc-900`. Same as above — `divide-zinc-800` applies `border-color: #27272A` on a `bg-zinc-900` (#18181B) surface. While the contrast ratio is technically non-zero (~2:1), the established rule explicitly prohibits `border-zinc-800` on zinc-900. The agent health row dividers will be nearly invisible on dark phones in low-light conditions. Fix: `divide-zinc-700`.

**T3 Arctic Intelligence — IBM Plex Mono font URL missing.** Line 1087 specifies `Mono font: 'IBM Plex Mono' (substitute with JetBrains Mono if unavailable)` but the Section 8 T3 theme only imports `IBM Plex Sans` (line 1067). IBM Plex Mono is a separate Google Fonts family requiring its own `@import url(...)`. Without the import, cost figures (`font-mono text-xs`) and chain depth markers will fall back to system monospace, losing the Arctic Intelligence theme's "cold Scandinavian technical" character. The parenthetical substitute note reduces severity but the import should be there. Web stitch-prompt-web.md correctly includes both IBM Plex Sans AND IBM Plex Mono URLs for T3.

Everything else visually is precise: consistent border-zinc-700 on panels, correct indigo/violet/zinc TierBadge color system, correct safe area placement (nav only), correct TrackerStrip color inheritance, correct StatusDot sizing (h-2 w-2 throughout).

**Marcus's verdict**: Two border violations following an established rule, one missing font URL. No critical brand aesthetic violations. The visual system is otherwise highly consistent and specification-complete.

---

## Luna (Brand Strategist) — "CORTHEX의 정체성과 맞지 않는다."

The document strongly maintains CORTHEX brand identity throughout:
- "명령 접수됨" badge ✅ (not "수락됨" or "received")
- `Lucide Scale` for AGORA ✅ with inline comment "(deliberation/justice — NOT MessageSquare/chat bubble)" — the lesson from Phase 5-1 is explicitly documented
- Military Precision aesthetic ✅ (dark zinc surfaces, indigo accent, "처리 중" chain tracking language)
- P1-P7 adherence explicitly referenced in master prompt Section 1.3 mapping ✅
- CRITICAL DON'TS section (lines 1237–1245) properly encodes Phase 5-1 lessons: MessageSquare prohibition, "저장됨" prohibition, border-zinc-800 prohibition — excellent defensive documentation

**Concern — English section labels undermine Korean commander identity.** "ACTIVE", "TODAY", "THIS WEEK" read as generic English SaaS labels. CORTHEX's voice spec says "Economy: Minimum words, maximum information" and the hub voice should feel like "mission briefings, not loading spinners." Korean labels like "활성", "오늘", "이번 주" reinforce the localized, professional command feel. English labels feel borrowed from another product.

**Minor brand observation — More screen logout placement.** Line 842: `button.text-xs.text-zinc-500.underline "로그아웃"` appears as a plain `text-xs underline` button in the app version footer. This is visually underpowered for a destructive action. It will render as a small underlined link at the bottom of a page, easy to accidentally tap. A ghost button with border and slightly larger touch target would be more appropriate for a CEO CEO app where misfire consequence = session loss.

**Luna's verdict**: Brand identity is strong and consistent. Phase 5-1 lessons visibly internalized. Two minor issues do not compromise CORTHEX identity meaningfully.

---

## Consolidated Issue List

| # | Severity | Location | Issue | Fix |
|---|----------|----------|-------|-----|
| 1 | 🟠 MAJOR | Sec 1 Hub session list | Section labels "ACTIVE", "TODAY", "THIS WEEK" in English — should be Korean in a Korean CEO app | Replace with "활성", "오늘", "이번 주" |
| 2 | 🟠 MAJOR | Sec 3 TrackerStrip cost row | `border-t border-zinc-800` on TrackerStrip `bg-zinc-900` — invisible per established rule | Change to `border-t border-zinc-700` |
| 3 | 🟡 MINOR | Sec 4 Agent Health Card | `divide-y divide-zinc-800` on `bg-zinc-900` card — near-invisible dividers | Change to `divide-y divide-zinc-700` |
| 4 | 🟡 MINOR | Sec 8 T3 Arctic Intelligence | IBM Plex Mono `@import` URL missing — mono font falls back to system stack | Add `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap')` |
| 5 | 🟡 MINOR | Sec 2/3 Chat header | `h-12` (48px) vs master prompt `h-14` (56px) — undocumented exception across 2 screens | Add note: "Chat screens use h-12 intentionally (maximizes chat area)" OR standardize to h-14 |
| 6 | 🟡 MINOR | Sec 7 TrackerStrip STATE D | Collapse button missing `aria-expanded="true"` spec in completed state | Add `aria-expanded="true"` to STATE D collapse button |

---

## Scores

| Dimension | Score | Reason |
|-----------|-------|--------|
| Completeness | 9.5/10 | All 7 sessions specified. NEXUS SVG, shared components, theme swaps all covered |
| Specificity | 9/10 | Extremely detailed. Minor: border-zinc-808 in tracker, missing IBM Plex Mono URL |
| Copy-paste readiness | 9/10 | English labels will generate English UI for Korean CEO app. Minor friction |
| Design accuracy vs Phase 0–4 | 9/10 | Phase 5-1 lessons fully internalized. 2 border rule violations |
| **Overall** | **9.1 / 10** | Strong. Minor fixes bring to ~9.7 |

**This document already PASSES the 7/10 threshold.** The 6 issues are all minor/major with no critical violations. The Master Prompt is the best-specified of the Phase 5 documents.

**Estimated score after fixes: 9.7/10**

---

## Cross-talk sent to CRITIC-B

Questions for CRITIC-B:
1. English section labels (Issue #1): Is there a precedent from Phase 2-2 app-analysis.md that justifies "ACTIVE/TODAY/THIS WEEK" in English? Or confirm as fix-required?
2. Chat header h-12 (Issue #5): Is this intentional design decision per Phase 2-2 Option A analysis? Should it be documented or standardized?
3. Any issues I missed in NEXUS section (Section 5) or More screen? SVG coordinate math specifically.

---

---

## Cross-talk Round 1 — CRITIC-B Response (Summary)

**Q1 — English section labels**: Fix-required confirmed → "활성", "오늘", "이번 주" for group headers. **However**: the "ACTIVE" badge on the session card itself (line 236: `bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.5 rounded-full "ACTIVE"`) may be kept as a status code — that's a design decision. Group headers must be Korean.

**Q2 — Chat header h-12**: Document the exception — do NOT force h-14. Phase 2-2 app-analysis.md layout spec explicitly shows `[HEADER h-12]` for chat screens. h-12 is correct (maximizes message area; 44px buttons still fit in 48px container). Fix: add one-line note to Section 0 SPACING + Section 9 Quick Reference explaining the exception.

**Issues #2, #6 confirmed** by CRITIC-B — both missed in CRITIC-B's own scan, now cross-validated.

**NEW CRITICAL FINDING from CRITIC-B — Section 5 NEXUS SVG: Level 2 node coordinates OVERLAP**

Both nodes at Level 2 physically overlap each other. CRITIC-B's full analysis:

| Node | x specified | right edge (x + 120) |
|------|-------------|----------------------|
| 데이터 전문가 | 20 | 140 |
| 재무 전문가 | 120 | 240 |
← **20px OVERLAP** ❌

| 재무 전문가 | 120 | 240 |
| 코딩 실행자 | 230 | 350 |
← **10px OVERLAP** ❌

Stitch will faithfully generate overlapping SVG rects. Both critics missed this in the first pass.

**Fix (CRITIC-B provided):**
```
데이터 전문가: x=5   → right edge: 125
재무 전문가:   x=135 → right edge: 255  (10px gap from 전문가)
코딩 실행자:   x=265 → right edge: 385  (10px gap from 재무)
Total tree width: 385px within 390px viewport ✓
```

**More screen logout button (Issue #7)**: CRITIC-B agrees with Luna's concern. `text-xs text-zinc-500 underline` button is likely below 44px touch target. Fix: `border border-zinc-700 text-zinc-400 text-sm px-4 py-2 rounded-lg min-h-[44px]` ghost button pattern.

---

## Final Consolidated Issue List (10 total)

| # | Severity | Location | Issue | Fix |
|---|----------|----------|-------|-----|
| 1 | 🟠 MAJOR | Sec 1 Hub session group headers | "ACTIVE", "TODAY", "THIS WEEK" → Korean in Korean CEO app | "활성", "오늘", "이번 주" (keep "ACTIVE" badge on session card — status code) |
| 2 | 🟠 MAJOR | Sec 3 TrackerStrip cost row | `border-t border-zinc-800` on `bg-zinc-900` — invisible divider | `border-t border-zinc-700` |
| 3 | 🟠 MAJOR | Sec 5 NEXUS SVG Level 2 | Node coordinates overlap: x=20→140 overlaps x=120→240 (20px); x=120→240 overlaps x=230→350 (10px) | `x=5` / `x=135` / `x=265` (CRITIC-B fix) |
| 4 | 🟡 MINOR | Sec 4 Agent Health Card | `divide-y divide-zinc-800` on `bg-zinc-900` — near-invisible dividers | `divide-y divide-zinc-700` |
| 5 | 🟡 MINOR | Sec 8 T3 Arctic Intelligence | IBM Plex Mono `@import` URL missing | Add `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap')` |
| 6 | 🟡 MINOR | Sec 2/3 Chat header | `h-12` vs master prompt `h-14` — undocumented exception | Add note in Section 0 SPACING + Quick Reference: "Chat screen header: h-12 (exception — maximizes message area)" |
| 7 | 🟡 MINOR | Sec 6 More screen logout | `text-xs text-zinc-500 underline` — likely below 44px touch target, too small for destructive action | Ghost button: `border border-zinc-700 text-zinc-400 text-sm px-4 py-2 rounded-lg min-h-[44px]` |
| 8 | 🟡 MINOR | Sec 7 TrackerStrip STATE D | Collapse button missing `aria-expanded="true"` | Add explicit `aria-expanded="true"` spec |
| 9-10 | (from CRITIC-B log) | Various | See `phase5-step2-critic-b.md` for CRITIC-B's 2 additional findings | — |

---

## Updated Score

| Dimension | Before Cross-talk | After Cross-talk |
|-----------|------------------|-----------------|
| Completeness | 9.5/10 | 9.5/10 |
| Specificity | 9/10 | 8.5/10 (SVG overlap is a Stitch-breaking coordinate error) |
| Copy-paste readiness | 9/10 | 8.5/10 (SVG overlap produces broken output) |
| Design accuracy vs Phase 0–4 | 9/10 | 9/10 |
| **Overall** | **9.1/10** | **8.9/10** |

**Still PASSES threshold.** SVG overlap is the most impactful fix — Stitch will generate non-functional NEXUS screen without it. All fixes are mechanical and straightforward.
**Estimated score after fixes: 9.7/10**

*CRITIC-A sign-off: Cross-talk complete. Sending [Feedback] to writer.*

---

## Round 2 — Fix Verification

**Re-read from file**: `_corthex_full_redesign/phase-5-prompts/stitch-prompt-app.md` (post-fixes)

| # | Issue | Verified? | Evidence |
|---|-------|-----------|----------|
| 1 | Section labels "ACTIVE/TODAY/THIS WEEK" → Korean | ✅ | Lines 230, 242, 258: `"활성"`, `"오늘"`, `"이번 주"`. "ACTIVE" badge preserved on card (line 237) |
| 2 | TrackerStrip cost row `border-zinc-800` → `border-zinc-700` | ✅ | Line 485: `border-t border-zinc-700` |
| 3 | NEXUS SVG Level 2 overlap fixed | ✅ | Lines 708–711: `x=5` / `x=135` / `x=265` with inline comments confirming 10px gaps and 390px fit |
| 4 | Agent Health `divide-zinc-800` → `divide-zinc-700/40` | ✅ | Line 586: `divide-y divide-zinc-700/40` |
| 5 | IBM Plex Mono @import URL added | ✅ | Line 1089: `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap')` |
| 6 | Chat h-12 exception documented | ✅ | Line 110: "Exception: Chat screen header h-12 (48px) — maximizes message area; all icon buttons still meet 44px minimum" |
| 7 | Logout ghost button min-h-[44px] | ✅ | Line 843: `button.border.border-zinc-700.text-zinc-400.text-sm.px-4.py-2.rounded-lg.min-h-[44px] "로그아웃"` |
| 8 | STATE D collapse `aria-expanded="true"` | ✅ | Line 977: `collapse button [aria-expanded="true" aria-label="트래커 접기"]` |
| B | `divide-zinc-700/40` on Recent Activity rows | ✅ | Line 604: `divide-y divide-zinc-700/40` |

All 8 CRITIC-A issues confirmed fixed. CRITIC-B fixes (zoom controls w-10→w-11 h-11, session row border) also confirmed from fix log.

## Round 2 Score

| Dimension | Round 1 | Round 2 |
|-----------|---------|---------|
| Completeness | 9.5/10 | 9.5/10 |
| Specificity | 8.5/10 | 9.5/10 (SVG overlap resolved, all border rules enforced) |
| Copy-paste readiness | 8.5/10 | 9.5/10 (Korean labels, h-12 documented, font URLs complete) |
| Design accuracy vs Phase 0–4 | 9/10 | 9.5/10 |
| **Overall** | **8.9/10** | **9.5/10 ✅ PASS** |

*CRITIC-A sign-off: Round 2 verification complete. PASS.*
