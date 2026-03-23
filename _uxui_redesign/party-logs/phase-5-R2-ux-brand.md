# Phase 5 — R2 Verification: Critic-A (ux-brand)

**Date:** 2026-03-23
**Reviewer:** ux-brand (Critic-A)
**Focus:** DESIGN.md brand accuracy, prompt completeness, Stitch 2 compatibility
**Round:** R2 (verification of R1 fixes)

---

## R1 Fix Verification

### DESIGN.md (819 lines)

| R1 Issue | Status | Location | Notes |
|----------|--------|----------|-------|
| **[P1] Success ≈ Accent disambiguation** | ✅ FIXED | §2.3 lines 99-102 | Full rule: success = CheckCircle + text + bg-success/15; accent/active = bg-accent-muted without dot. "Never rely on green dot alone." Matches Phase 3 §1.4 exactly. |
| **[P2] Shadow + border mobile exception** | ✅ FIXED | §4.4 line 222 | Mobile exception clearly documented with rationale (3% luminance insufficient in bright light). Also updated in §10 DON'T line 599. |
| **[P3] @keyframes missing** | ⚠️ NOT FIXED | @theme block end | Still no @keyframes for slide-in/slide-up/pulse-dot/cursor-blink. Acceptable — Stitch generates code, doesn't execute CSS. |
| **[P3] Duration tokens missing** | ⚠️ NOT FIXED | @theme block | §9.2 durations not in CSS block. Acceptable — documented as spec. |
| **[P3] Messenger layout mismatch** | ⚠️ NOT FIXED | §6.3 line 381 | Still "Master-Detail" in DESIGN.md, "Panels" in web prompt. Web prompt is more accurate. Minor. |

**New additions in R2:**
- ✅ **§4.3 Border Radius**: `--radius-full` now explicitly includes "tier badges" (line 208)
- ✅ **§5.7 ARIA Directives**: Entirely new comprehensive section (lines 317-337) — `<main role="main">`, `aria-current="page"`, `aria-live`, `aria-busy`, `aria-describedby`, skip-to-content link, `prefers-reduced-motion` reference. Significant quality uplift.
- ✅ **§10 DON'T**: Shadow + border exception noted inline (line 599)
- ✅ **Input pattern §5.5**: `placeholder:text-corthex-text-tertiary` (line 299)

### stitch-prompt-web.md (763 lines)

| R1 Issue | Status | Location | Notes |
|----------|--------|----------|-------|
| **[P3] NEXUS full-bleed** | ✅ Addressed | Page 4 is explicit, canvas template in DESIGN.md §11 line 666 | Clear precedent |

**New additions in R2:**
- ✅ **Global #11**: `prefers-reduced-motion` CSS block (lines 33-42)
- ✅ **Global #12**: Comprehensive ARIA directives (lines 43-53) — `<main role="main">`, `<nav aria-label>`, `aria-current`, `aria-live`, `aria-busy`, `aria-describedby`, skip-to-content
- ✅ **Global #13**: Success ≈ Accent disambiguation rule (line 54)
- ✅ **Chat timestamps**: Line 142 — "**Timestamps OUTSIDE bubbles**" with grouping logic (show only on last message in cluster)
- ✅ **Chat streaming**: Line 143 — respects `prefers-reduced-motion` (static dots when reduced)
- ✅ **NEXUS tier badge**: Line 174 — `rounded-full`
- ✅ **Agents tier badge**: Line 232 — `rounded-full`
- ✅ **Checklist expanded**: 13 → 22 items (lines 734-761), including: reduced-motion, main role, aria-current, aria-live, skip-to-content, success≈accent, chat timestamps, tier badges, placeholder colors

### stitch-prompt-app.md (613 lines)

| R1 Issue | Status | Location | Notes |
|----------|--------|----------|-------|
| **[P1] Shadow + border** | ✅ FIXED | DESIGN.md exception + App checklist line 609 | Documented as permitted mobile exception |
| **[P3] Swipe gestures** | ⚠️ Not addressed | Hub, Notifications, Jobs | Still mentioned without library recommendation. P3 acceptable. |
| **[P3] Trading landscape** | ⚠️ Not addressed | Trading page 13 line 326 | Still "Landscape mode hint" without spec. P3 acceptable. |

**New additions in R2:**
- ✅ **Global #10**: `prefers-reduced-motion` CSS block (lines 43-52)
- ✅ **Global #11**: Mobile ARIA directives (lines 53-62) — bottom nav `aria-label`, `aria-current`, `aria-live`, FAB `aria-label`
- ✅ **Global #12**: Placeholder color rule (line 63) — `placeholder:text-corthex-text-tertiary` (#756e5a, 4.79:1), explicit ban on #475569
- ✅ **Chat input**: Line 137 — explicit placeholder color with contrast ratio and non-token warning
- ✅ **Chat timestamps**: Line 134 — OUTSIDE bubbles, last-in-cluster only, alignment matches sender
- ✅ **Agents tier badge**: Line 196 — `rounded-full`
- ✅ **Checklist expanded**: 15 → 22 items (lines 581-613), including: reduced-motion, main role, nav aria, aria-current, aria-live, timestamps, placeholder, tier badges, shadow+border exception

---

## Cross-Document Consistency Matrix

| Rule | DESIGN.md | Web Prompt | App Prompt |
|------|-----------|------------|------------|
| Success ≈ Accent | §2.3 ✅ | Global #13 ✅ | Checklist ✅ |
| Shadow + border mobile | §4.4 exception ✅ | N/A (desktop) | Global #7 ✅ + Checklist ✅ |
| Tier badge rounded-full | §4.3 ✅ | NEXUS + Agents ✅ | Agents ✅ |
| Placeholder token color | §5.5 ✅ | Implicit via DESIGN.md ✅ | Global #12 ✅ + Chat ✅ |
| ARIA directives | §5.7 ✅ | Global #12 ✅ | Global #11 ✅ |
| Reduced motion | §9.4 ✅ | Global #11 ✅ | Global #10 ✅ |
| Chat timestamps outside | N/A | Chat page ✅ | Chat page ✅ |
| Lucide React only | §7.1 ✅ | Global ✅ | Global ✅ |
| No hardcoded hex | §12 ✅ | Global #1 ✅ | Global #1 ✅ |

All rules consistently propagated. ✅

---

## New Issues Found in R2

**[P3] Workflow `transition-all` violation**
Web prompt line 348: `hover:border-corthex-border-strong hover:shadow-sm transition-all`
DESIGN.md §5.9 rule #4 and §10 DON'T explicitly say "Never use `transition-all`."
Should be `transition-[border-color,box-shadow]` or `transition-colors`.

**Verdict:** Non-blocking. Stitch may override anyway.

---

## R2 Scores

| Document | R1 Grade | R2 Grade | Δ | Rationale |
|----------|----------|----------|---|-----------|
| DESIGN.md | A- | **A** | +1 | P1 and P2 fixed. New §5.7 ARIA section adds major value. Only P3 residuals remain. |
| Web Prompt | A | **A** | = | Already strong. Checklist expanded 13→22. 1 new P3 (`transition-all`). |
| App Prompt | A | **A** | = | Placeholder fix explicit and thorough. ARIA + motion rules propagated. |

**Overall Phase 5 Grade: A**

**Blocking issues:** 0
**Residual P3s:** 4 (all acceptable, non-blocking)
**New P3s:** 1 (`transition-all` in workflow hover)

**Verdict: PASS — Ready for Stitch 2 generation.**

---

*Reviewed by ux-brand (Critic-A) — Phase 5 R2 Verification*
