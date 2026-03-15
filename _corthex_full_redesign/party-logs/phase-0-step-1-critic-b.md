# Phase 0-1 Critic-B Review (Visual+A11y)

**Reviewer:** Marcus (Visual Hierarchy) + Quinn (WCAG Verification)
**Model:** opus | **Round:** 1

## Findings

### Issue 1 (Marcus): API mapping excellent but missing response error shapes
- All success shapes documented, but error responses only described generically
- Which endpoints return 429 (rate limit)? Which return 403 vs 401?
- **Severity:** Low — general pattern documented, specific cases can be derived

### Issue 2 (Quinn): WCAG documentation incomplete
- Section 8 mentions "WCAG 2.1 AA — aria-live on SSE regions, color contrast ratios" but no specifics
- Which SSE regions need `aria-live="polite"` vs `aria-live="assertive"`?
- Current color system: `text-slate-400` on `bg-slate-900` — is this 4.5:1? (Check: #94a3b8 on #0f172a = 7.34:1 PASS)
- `text-slate-500` on `bg-slate-800/40` — needs verification with alpha compositing
- **Severity:** Medium — a11y details needed for Phase 4 themes

### Issue 3 (Marcus): Performance constraints well-documented
- 60fps NEXUS, 120s timeout, P95 200ms — all clear and specific
- Missing: bundle size budget, initial load time target, LCP/FID/CLS targets
- **Severity:** Low — can be defined in Phase 2

## Score: 8.5/10
Excellent DB/API accuracy. Minor gaps in a11y specifics and web vitals targets.
