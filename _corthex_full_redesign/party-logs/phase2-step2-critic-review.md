# Phase 2 Step 2 — Critic Review: App Deep Analysis

**Date:** 2026-03-15
**Input:** `_corthex_full_redesign/phase-2-analysis/app-analysis.md` (969 lines)
**Reviewers:** Critic-A (UX+Brand), Critic-B (Visual+A11y), Critic-C (Tech+Perf)

---

## Critic-A: UX + Brand Review

### Strengths
- Phase 0-2 color corrections (cyan-400, slate-950, Inter) explicitly applied as baseline on line 23-26. No regression from Phase 1-2 critic findings.
- Option A winner rationale is compelling: Hub-first = Sovereign Sage authority, live agent cards > stat aggregation, all Phase 0-2 terminology correct without corrections needed.
- Option B rejection is rigorous and well-argued — directly cites Phase 0-2 banned pattern ("How can I help you today?") and demonstrates structural archetype contradiction, not just aesthetic mismatch.
- 7 Design Principles compliance table per option is thorough. The 2/7 failure for Option B correctly identifies Principles 1 and 2 as non-negotiable.
- Navigation depth analysis (max 2 taps for any feature) is excellent for a 30+ feature platform.

### Issue A-1: Hub "Command Input" Contradiction (MEDIUM)
Lines 67 and 334-339 contradict each other.

- Line 67: `"Command, Don't Chat" ✅ Hub is Tab 1; placeholder "명령을 입력하세요" inherited from web`
- Line 334: `"Hub does NOT have a command input — Hub = dashboard view"`

The analysis claims Principle 2 compliance by citing a command input placeholder, then the React spec explicitly removes it. The mobile Hub is a status dashboard, not a command terminal — this is a valid mobile adaptation, but the Principle 2 compliance claim on line 67 is then based on a feature that does not exist in the spec. The compliance table should say PARTIAL (not full checkmark) and note that command input is deferred to ChatScreen or a future HubCommandBar.

**Severity:** Medium — does not change the winner but overstates compliance.

### Issue A-2: "Soul Is Never Hidden" Consistently Weak Across All Options (LOW)
All three options score PARTIAL on Principle 7 (Soul accessibility). Option A: 2 taps via long-press. Option B: 2-3 taps. Option C: 2-3 taps. The analysis notes this but does not propose a concrete mobile solution.

**Proposed fix:** The Phase 3 token spec should define an inline soul indicator on agent cards (e.g., a small icon or text snippet showing the soul's core trait) that satisfies Principle 7 at 1 tap. Even a truncated soul preview on the agent card would improve this.

### Issue A-3: P0-P3 Feature Mapping to "You" Tab Is Underdeveloped (MEDIUM)
The "You" tab serves as an overflow bucket for P1-P3 features (Library, ARGOS, Activity Log, Costs, Settings, etc.). The analysis provides a route list (lines 487-494) but no information architecture for the YouScreen itself. How are 8+ menu items organized? Is there section grouping? What is the visual hierarchy within the You tab?

This is not a blocking issue for Phase 2 winner selection, but Phase 3 must address the You tab's internal layout — it risks becoming an unstructured settings dump.

---

## Critic-B: Visual + Accessibility Review

### Strengths
- WCAG contrast validation table (lines 899-908) covers all critical color pairs with computed ratios. All pass AA minimum after corrections.
- Touch target specs are explicit: 44px minimum throughout, 72px card height, 56px FAB, 49px tab bar. All exceed iOS HIG 44pt minimum.
- Safe area CSS is production-correct with `env(safe-area-inset-*)` and Capacitor plugin bridge.
- backdrop-blur fallback (line 421-426) handles older Android WebView correctly.
- `aria-current="page"` on active tab and `aria-label` on tab buttons are correctly specified.

### Issue B-1: `prefers-reduced-motion` Not Addressed (MEDIUM)
The analysis specifies `animate-pulse` on working status dots (line 101, 506) and `transition-colors duration-150` on tab labels (line 447). Phase 0-2 motion spec says "Conservative: no parallax/particles/lottie" but does not exempt pulse/transition from reduced-motion requirements.

WCAG 2.1 Success Criterion 2.3.3 requires that `prefers-reduced-motion: reduce` disables non-essential animations. The `animate-pulse` on status dots is decorative (the dot color already communicates state). Missing from the analysis:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse { animation: none; }
  * { transition-duration: 0.01ms !important; }
}
```

This must be added to Phase 3 token spec as a motion token override.

### Issue B-2: Focus Management for Keyboard/Switch Access Not Specified (MEDIUM)
The analysis thoroughly covers touch interactions (swipe, long-press, pinch) but does not address keyboard or switch access focus order. Capacitor apps on iPadOS with external keyboards, or Android accessibility switch control, require:

- Visible focus ring style (e.g., `ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950`)
- Tab order that matches visual order (Hub -> Chat -> NEXUS -> Jobs -> You)
- Focus trap in modal bottom sheets (NEXUS node detail)
- Skip-to-content link for screen readers

These are WCAG 2.1 Level AA requirements (2.4.3 Focus Order, 2.4.7 Focus Visible). Not having them specified does not invalidate the analysis, but Phase 3 must include focus tokens.

### Issue B-3: Chat Bubble Contrast for Agent vs. User Messages Not Validated (LOW)
The analysis validates card text contrast (slate-50 on slate-900 = 19.3:1) and tab bar contrast, but the ChatScreen message bubbles are not contrast-validated. Agent bubbles presumably use slate-900 background; user bubbles likely use cyan-400/10 or similar tinted background. The text color on user bubbles needs explicit WCAG validation.

---

## Critic-C: Tech + Performance Review

### Strengths
- Stitch boundary table (lines 503-516) is the most actionable artifact in the analysis. The 60/40 split (Stitch-generatable vs. manual) is realistic and gives clear boundaries for Phase 6.
- React Flow version pinned to @xyflow/react v12 with specific mobile limitations documented (lasso conflict, >100 node frame drops, edge label zoom threshold).
- NEXUS lazy-load strategy correctly excludes ~200KB React Flow from initial bundle.
- SSE + useRef + requestAnimationFrame batching for streaming chat is the correct pattern (not naive useState).
- Third-party dependency list is minimal (5 packages) and all follow SDK pin-version rule.

### Issue C-1: No Initial Bundle Size Budget Defined (MEDIUM)
The analysis specifies NEXUS lazy-loading and streaming chat patterns, but never defines an overall bundle size target. For a Capacitor mobile app:

- What is the initial JS bundle budget? (Industry standard: <200KB gzipped for mobile web)
- What is the total app size target? (Capacitor APK/IPA)
- What is the Time to Interactive (TTI) target on mid-range Android?

Without these numbers, Phase 3 cannot make informed decisions about code splitting granularity. Recommended: define initial bundle < 150KB gzipped (excluding lazy-loaded NEXUS), TTI < 3s on Snapdragon 6-series.

### Issue C-2: SSE Connection Management on Mobile Not Addressed (MEDIUM)
The analysis correctly specifies SSE for real-time agent status on Hub (line 803: `useAgentStream()`) and SSE for chat streaming. But mobile-specific SSE concerns are not discussed:

- **Background/foreground lifecycle:** When the app is backgrounded (Capacitor `appStateChange` event), SSE connections should be closed to save battery. On foreground resume, reconnect + fetch missed state delta. This is not a design concern but directly affects the "State Is Sacred" principle — stale state after resume violates Principle 3.
- **Multiple SSE connections:** Hub streams per-department agent state. If a company has 5 departments, that is 5 concurrent SSE connections. On mobile networks, this causes battery drain and potential connection limits. Recommend: single multiplexed SSE endpoint that sends all agent updates, client-side filtered by department.
- **Offline/poor connectivity:** No offline state or error UI is specified. What does the Hub show when SSE drops? A stale card with no indication of staleness violates Principle 3.

### Issue C-3: React Router Hash Mode + Tab State Preservation (LOW)
Line 296 specifies React Router v6 in hash mode for Capacitor. Hash mode is correct for Capacitor (no server-side routing). However, the analysis does not address tab state preservation:

- When user navigates Hub -> Chat/agent-1 -> NEXUS tab -> Hub tab, does the Hub scroll position reset?
- When user is in Chat/agent-1, switches to Jobs tab, switches back to Chat tab — is the conversation still at the same scroll position?

React Router v6 does not preserve scroll position across route changes by default. The analysis should specify that tab root routes use a persistent layout with `display: none` toggling (not unmount/remount) to preserve scroll state. This is a mobile UX fundamental.

---

## Combined Score

| Critic | Issues Found | Severity Breakdown |
|--------|-------------|-------------------|
| Critic-A (UX+Brand) | 3 | 2 MEDIUM, 1 LOW |
| Critic-B (Visual+A11y) | 3 | 2 MEDIUM, 1 LOW |
| Critic-C (Tech+Perf) | 3 | 2 MEDIUM, 1 LOW |
| **Total** | **9** | **6 MEDIUM, 3 LOW** |

### Scoring Rationale

| Criterion | Score | Notes |
|-----------|-------|-------|
| Phase 0-2 alignment | 8.5/10 | Color/font corrections applied; Principle 2 compliance overstated; Principle 7 needs mobile solution |
| Analysis depth | 9/10 | Gestalt, Swiss Style, Miller's Law all applied rigorously; 3 options thoroughly compared |
| Accessibility completeness | 7/10 | Touch targets excellent; missing prefers-reduced-motion, focus management, chat bubble contrast |
| Technical feasibility | 7.5/10 | Stitch boundaries excellent; missing bundle budget, SSE lifecycle, tab state preservation |
| Winner justification | 9/10 | Option A margin over C is small but well-defended; Option B rejection is airtight |

### Combined Score: 8.2 / 10

**Status: PASS** (threshold 7.0)

The analysis is thorough, well-structured, and makes the correct winner selection. The 9 issues found are all additive (missing specs that Phase 3 must include) rather than corrective (wrong decisions). No issues change the winner. The Principle 2 compliance overstatement (Issue A-1) is the most notable finding — it should be corrected in the Phase 3 handoff to avoid downstream confusion about whether the mobile Hub has a command input.

---

## Corrections Required Before Phase 3

### Must Fix (before Phase 3 token work begins)
1. **Principle 2 compliance note:** Hub mobile is a status dashboard, not a command terminal. Mark as PARTIAL in compliance table. Command input is in ChatScreen.
2. **prefers-reduced-motion:** Add motion override tokens to Phase 3 input.
3. **Focus management tokens:** Define focus ring style, tab order, modal focus trap specs for Phase 3.
4. **Bundle size budget:** Define initial bundle target (<150KB gzipped), TTI target (<3s mid-range Android).

### Should Fix (before Phase 5 implementation)
5. **SSE lifecycle:** Define background/foreground reconnect pattern, single multiplexed endpoint recommendation.
6. **Tab state preservation:** Specify persistent layout pattern (not unmount/remount) for tab navigation.
7. **You tab IA:** Define internal layout/grouping for the overflow menu items.
8. **Chat bubble contrast:** Validate WCAG contrast for user message bubble background + text.
9. **Principle 7 mobile solution:** Define inline soul indicator on agent cards.
