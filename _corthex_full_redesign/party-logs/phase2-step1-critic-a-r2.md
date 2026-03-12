# Phase 2-1: Web Analysis — CRITIC-A Review (Round 2)

**Date**: 2026-03-12
**Reviewer**: CRITIC-A (Sally / Marcus / Luna)
**Document reviewed**: `_corthex_full_redesign/phase-2-analysis/web-analysis.md`
**Round**: 2 — Verification Review

---

## Verification Results (5 original issues)

| ID | Issue | Status |
|----|-------|--------|
| S1 | `onErrorEvent` drops error string | ✅ FIXED |
| M1 | `border-zinc-800` invisible in dark mode | ❌ INCOMPLETE |
| S2 | Option B 3s auto-collapse unresolved | ❌ INCONSISTENT |
| L1 | NEXUS in 시스템 nav group | ✅ FIXED |
| M2 | Option A UX "464px" imprecise | ✅ FIXED |

Additional issues from addendum:
| ADD-1 | `reactflow` → `@xyflow/react` | ✅ FIXED |
| ADD-2 | Root route redirect kills HomePage | ✅ FIXED |
| ADD-3 | Missing routes | ✅ FIXED (per fixes log) |

**5 fully fixed ✅, 2 incomplete ❌**

---

## Issue Details

### S1 — ✅ VERIFIED FIXED
`lastError: string | null` correctly added to HubStore interface and initial state. Implementation: `onErrorEvent: (error) => set({ sseStatus: 'error', lastError: error })`. `resetChain` also clears `lastError: null`. Complete fix.

### M1 — ❌ INCOMPLETE: Option B and C layouts still have `border-zinc-800`

**What was fixed**: Option A `HubLayout` + `AdminLayout` — `border-zinc-700` applied with comment `{/* border-zinc-700: visible on bg-zinc-900 */}` ✅

**What was NOT fixed**: Options B and C layout code still use `border-zinc-800` on `bg-zinc-900` panels:

| Location | Current (wrong) | Should be |
|----------|----------------|-----------|
| Option B `HubLayout` — AppSidebar | `border-r border-zinc-800` (bg-zinc-900) | `border-zinc-700` |
| Option B `HubLayout` — SessionPanel `<nav>` | `border-r border-zinc-800` (bg-zinc-900) | `border-zinc-700` |
| Option B `HubLayout` — TrackerPanel `<aside>` | `border-l border-zinc-800` (bg-zinc-900) | `border-zinc-700` |
| Option C `HubLayout` — AppSidebar | `border-r border-zinc-800` (bg-zinc-900) | `border-zinc-700` |
| Option C `HubLayout` — SessionPanel `<nav>` | `border-r border-zinc-800` (bg-zinc-900) | `border-zinc-700` |
| Option C `HubLayout` — TrackerPanel `<aside>` | `border-l border-zinc-800` (bg-zinc-900) | `border-zinc-700` |
| IA diagram line (Agent Status Orbs) | `border-b border-zinc-800` | `border-zinc-700` |

Fix log #12 says "All `border-zinc-800` on `bg-zinc-900` panels → `border-zinc-700`" — this was NOT applied to B and C options.

**Required fix**: Apply the same `border-zinc-700` replacement to Options B and C layout code blocks (the fix is mechanical — same classes, same panels, 6 occurrences). Also update the IA diagram Agent Status Orbs line.

---

### S2 — ❌ INCONSISTENT: Auto-collapse "removed" in 2 places but still present in 4 places

**What was fixed**: User flow Task 3 Step 11 now says "RESOLVED: Auto-collapse timer REMOVED" ✅. The Zustand store implementation section properly shows `useRef`-based pattern with comment ✅.

**What was NOT fixed**: The following 4 sections still describe the 3s timer as if it still exists:

**1. IA Diagram — Option B HubStore state (lines 976-982)**:
```
HubStore (Option B additions):
  isTrackerExpanded: boolean
  autoCollapseTimer: ReturnType<typeof setTimeout> | null  // 3s timer ref ← STILL PRESENT

Zustand store action differences:
  onCompleteEvent: → sets setTimeout 3000ms → setIsTrackerExpanded(false) ← STILL PRESENT
```
This directly contradicts the "RESOLVED" claim in Task 3 and Fix Log #10.

**2. Cognitive Load Analysis (Option B)**:
> "In Option B, there are **3 states** the user must track: idle (w-12), active (w-80, SSE-driven), and post-complete (transitioning back to w-12 after 3s). The 3s auto-collapse adds a **temporal dimension**..."
> "the user has a 3-second window. After that, the chain is gone."
> "**Net cognitive load**: Lower than Option A in idle state, equal in active state, **higher** in post-complete state (auto-collapse anxiety)."

Since the timer was removed, Option B now has only 2 states (IDLE, EXECUTING) + POST-COMPLETE state where tracker stays expanded. The cognitive load characterization is now wrong — the anxiety described doesn't exist if the timer is gone.

**3. Fitts's Law table (Option B)**:
`Auto-collapse timer interrupt | NEW: NOT applicable (no target — timer fires automatically) | No user interaction needed to collapse`

This row made sense when the timer existed. Now that it's removed, this row should either be deleted or replaced with "TrackerPanel collapse button (ChevronLeft toggle)" as the new target.

**4. Option B Scoring**:
`User Experience | 8/10 | ... Auto-collapse 3s timer creates anxiety (-1).`

The -1 deduction for auto-collapse anxiety is invalid if the timer was removed. Option B's UX score should be re-evaluated without this deduction. (The layout-shift -1 from ChatArea shrink during SSE expansion remains valid.)

**Required fix**: Update the 4 stale sections to reflect the resolved state:
1. IA diagram: Replace `autoCollapseTimer` state with "POST-COMPLETE: TrackerPanel stays expanded until user toggle"
2. Cognitive Load: Describe Option B's actual 3-state machine (IDLE, EXECUTING, POST-COMPLETE expanded) — remove auto-collapse anxiety language
3. Fitts's Law: Replace "Auto-collapse timer" row with "ChevronLeft toggle button" row
4. Scoring: Remove the -1 for "auto-collapse anxiety" from Option B UX justification (consider re-scoring)

---

### L1 — ✅ VERIFIED FIXED
NEXUS appears in 업무 nav group at line 257: `🔍 NEXUS → /nexus (SketchVibe canvas — P1: "demo moment")`. 시스템 group now correctly contains only `⏰ CRON → /cron` and `⚙️ 설정 → /settings`.

### M2 — ✅ VERIFIED FIXED
Option A UX scoring now reads: "at min-viewport (1280px) with TrackerPanel expanded post-completion (w-80): Chat=464px" — precise and correct.

### ADD-1 — ✅ VERIFIED FIXED
Dependencies table now shows `@xyflow/react: ^12.10.1 (existing)` with explicit note "NOT `reactflow` — renamed in v12. Confirmed in `packages/app/package.json`".

### ADD-2 — ✅ VERIFIED FIXED
Router spec now shows:
```
// Route "/" renders <HomePage /> — does NOT auto-redirect to /hub (Tech Spec §2.3)
<Route index element={<HomePage />} />
```

---

## Round 2 Summary

**Fixed correctly (17 of 19)**: All 5 original issues except M1 partially; ADD-1, ADD-2, ADD-3 all correct; Critic-B's structural issues (aria-live, aria-expanded, soul-editor duplicate, duration-[250ms], HandoffStep.tier) all verified in fix log.

**Remaining blockers (2)**:
1. **M1 (minor blocker)**: `border-zinc-800` only fixed in Option A. Options B and C still have the invisible border bug (6 occurrences). Mechanical fix — replace all `border-zinc-800` with `border-zinc-700` in B and C layout code.
2. **S2 (consistency blocker)**: Auto-collapse removal is declared in 2 places but contradicted in 4 places (IA diagram, cognitive load text, Fitts's Law table, scoring). Creates a self-contradictory spec document.

**Round 2 score**: Cannot fully approve while S2 inconsistency creates contradictory spec text. However, the document is close — M1 and S2 remaining issues are well-scoped and fixable in a focused pass.

**Estimated fixes**: ~15 minutes. No new design decisions required — purely text consistency work.
