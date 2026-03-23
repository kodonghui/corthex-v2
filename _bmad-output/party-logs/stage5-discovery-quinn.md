# Critic-B (QA + Security) Review — Stage 5 Step 2: Discovery

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-23
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` (Lines 16~237)
**Step Spec:** `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-02-discovery.md`

---

## R1 Score: 6.75/10 FAIL → R2 Re-verification Below

---

## R2 Verification (19 fixes applied)

### Issue-by-Issue Resolution Check

| # | R1 Issue | Severity | Fix Ref | Status | Evidence |
|---|----------|----------|---------|--------|----------|
| 1 | Missing error/empty/loading states | CRITICAL | #9,10,11,12 | **RESOLVED** | DC-1: WS fallback (L137), loading (L138), empty (L139). DC-3: error path (L160), loading (L161). DC-4: empty (L172), error (L173). |
| 2 | WebSocket connection limit UX | HIGH | #17 (DC-7) | **RESOLVED** | DC-7 (L204): 50conn/company, 500/server, HTTP 429 + user message. Graceful degradation 3-step (L206). |
| 3 | Memory data visibility permissions | HIGH | #6 | **PARTIAL** | Tier-based Reflection cost limits added (L174-175). But **who can see which reflections** (CEO all? Employee own agent?) still implicit. Acceptable for Discovery scope — detailed permissions belong in Step 3 Core Experience or Step 5 Functional Spec. |
| 4 | Admin mobile/responsive strategy | MEDIUM | — | **NOT FIXED** | No Admin mobile mention. Deferred. design-tokens.md defines mobile bottom nav, implying responsive is planned — just not stated here. **Acceptable deferral** for Discovery scope. |
| 5 | CEO page count inconsistency | MEDIUM | #1 | **RESOLVED** | L82: "~35개 페이지" with FR-UX consolidation breakdown. DC-6 L189/191: "~67페이지" with correct math (71-4+3). |
| 6 | No overall keyboard nav strategy | MEDIUM | — | **NOT FIXED** | Still scattered across DC-1/3/4. PRD classifies as Phase 5+ reserved. **Acceptable deferral** — but should be flagged when Step 3 defines nav patterns. |
| 7 | i18n / localization | LOW | — | **NOT FIXED** | Still no language strategy. **Acceptable deferral** — can be addressed in Step 3 or design tokens. |
| 8 | n8n mid-workflow interruption | LOW | #15 | **PARTIAL** | DC-5 L187: FR-MKT API fallback + failure step highlight. L186: "Degraded mode" + ARGOS independence. Mid-execution resume not specified, but error visibility is clear. Good enough for Discovery. |

### Dev Cross-Talk Answer Verification

Dev asked: *"Is `aria-live="polite"` sufficient for real-time canvas state updates? Or does WCAG 2.1 AA require `aria-live="assertive"` for error states?"*

**Fix #13 applied correctly**: L133 now reads: `aria-live="polite"` for general state updates, **`aria-live="assertive"` for error states**. This is the correct approach per WCAG 2.1 SC 4.1.3 (Status Messages):
- `polite`: waits for current speech to finish — appropriate for routine state changes ("Agent X: working on report")
- `assertive`: interrupts current speech — appropriate for error conditions ("Agent X: 실행 실패") that require immediate user awareness
- **VERIFIED CORRECT** ✅

### New Content Quality Check

| New Content | Line(s) | Quality |
|-------------|---------|---------|
| DC-1 WebSocket fallback | 137 | Excellent — stale indicator + retry banner + 3s auto-reconnect (max 5) + refresh button. Clear degradation path. |
| DC-1 loading state | 138 | Good — progressive loading sequence (tilemap→characters→WS). Cream bg + spinner + skeleton silhouettes. |
| DC-1 empty state | 139 | Good — differentiated by role (Admin: create link, CEO: contact Admin). |
| DC-2 thresholds | 146-149 | Excellent — ≤10/11-30/30+ clear breakpoints. Resolves dev's "guesswork" concern. |
| DC-3 error path | 160 | Good — inline error + optimistic update rollback + physical min/max prevention. |
| DC-3 loading state | 161 | Good — 5 slider skeletons + text. |
| DC-4 empty state | 172 | Good — Day 1 scenario addressed for Dashboard + Performance. 24h expectation set. |
| DC-4 error path | 173 | Good — Admin notification + dashboard warning icon. |
| DC-4 Reflection cost controls | 174-175 | Excellent — Tier-based daily limits + 80%/100% warning thresholds. Addresses John's cost concern. |
| DC-5 degraded mode | 186 | Good — ARGOS independence + offline banner. Zero Regression preserved. |
| DC-5 FR-MKT flow | 187 | Good — 6-step pipeline with per-step failure visualization + Admin engine config. |
| DC-6 page count | 189-191 | Fixed — "~67페이지" with derivation. |
| DC-7 (new) | 199-207 | Good — resource bottleneck UX. WS limits + deployment degradation + 3-step graceful degradation. |
| DO-1 FCP/TTI split | 216 | Fixed — FCP (shell) ≤1.5s + TTI (characters+WS) ≤3s. Bundle fallback added. |
| Solo founder note | 122 | Good — app switch nav + conditional "CEO invite" skip. |
| Sovereign Sage clarification | 40 | Good — "v2의 slate-950/cyan-400와는 다른 새 팔레트" disambiguation. |

---

## R2 Dimension Scores (Critic-B Weights)

| Dimension | R1 | R2 | Weight | Weighted | Evidence |
|-----------|----|----|--------|----------|----------|
| D1 Specificity | 8 | **9**/10 | 10% | 0.90 | DC-2 thresholds (≤10/11-30/30+), FCP/TTI split (1.5s/3s), WS reconnect (3s×5), Reflection cost ($0.10-$0.50/agent/day), 80%/100% thresholds. Near-complete specificity. |
| D2 Completeness | 6 | **8**/10 | **25%** | 2.00 | Error states: DC-1/3/4/5/7 all covered. Empty states: DC-1/4/5. Loading: DC-1/3. Remaining gaps (Admin mobile, i18n, keyboard nav) are acceptable deferrals for Discovery scope. |
| D3 Accuracy | 7 | **8**/10 | 15% | 1.20 | CEO pages "~35" with FR-UX breakdown ✅. DC-6 "~67" correct math ✅. All color hexes verified. OCEAN 0-100 matches PRD/Arch. |
| D4 Implementability | 7 | **8**/10 | 10% | 0.80 | WS fallback has clear implementation spec. DC-2 breakpoints are actionable. Marketing pipeline 6 steps defined. DC-7 degradation sequence implementable. |
| D5 Consistency | 8 | **9**/10 | 15% | 1.35 | Sovereign Sage clarified (v2≠v3). "Controlled Nature" sourced to Vision §2.3. Page counts aligned across sections. Sprint order matches brief/PRD. Terminology 100% aligned. |
| D6 Risk Awareness | 6 | **8**/10 | **25%** | 2.00 | DC-7 addresses server resource bottleneck + WS limits. PixiJS bundle fallback (Go/No-Go #5). n8n degraded mode + ARGOS independence. Marketing API fallback. Reflection cost controls. Only residual: data visibility permissions (deferred). |

### **R2 Weighted Average: 8.25/10 ✅ PASS**

**Improvement: 6.75 → 8.25 (+1.50)**

---

## Residual Items (informational — not blocking)

1. **Agent memory data visibility**: Who sees which reflections? (Step 3 Core Experience scope)
2. **Admin mobile strategy**: Desktop-only or responsive? (Step 3 scope)
3. **i18n / language strategy**: Korean-first? Bilingual? Font fallbacks? (Step 3 or design tokens scope)
4. **Overall keyboard nav strategy**: Currently feature-specific. PRD Phase 5+ deferral. (Flag at Step 3)
5. **n8n mid-execution resume**: Error visibility defined but resume/retry for partially-executed workflows not specified. (Sprint 2 implementation detail)

These are **not blocking** for Step 2 Discovery — they are appropriate for downstream steps where detailed interaction patterns and functional specs are defined.

---

## Cross-Talk Summary (R2)

**To john (PM):** Sally addressed your Reflection cost concern excellently — Tier-based daily limits with 80%/100% warning banners (L174-175) and PixiJS bundle fallback via Go/No-Go #5 (L135, L216). Page counts now reconciled. FR-MKT 6-step pipeline UX added. Score improvement justified.

**To dev:** FCP/TTI split resolved (1.5s/3s, L96). DC-2 thresholds are now actionable (≤10/11-30/30+). `aria-live` approach is correct (polite for routine, assertive for errors — WCAG 4.1.3). Sovereign Sage v2/v3 disambiguation added. DC-7 graceful degradation gives you a clear implementation order (poll interval→fps→list view).

**To sally:** Strong revision. 19 fixes applied cleanly with no regressions. The error/empty/loading state additions (DC-1/3/4/5) were exactly what was needed. DC-7 (resource bottleneck) is a valuable addition. R2: **8.25/10 PASS**.
