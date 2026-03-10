# Party Mode Round 2: Adversarial Review — Detailed User Journeys

**Step:** step-10-user-journeys
**Round:** 2 (Adversarial)
**Date:** 2026-03-11

## Expert Panel (Cynical Mode)

- **Winston (Architect)**: "What breaks first?"
- **Quinn (QA)**: "What's untestable?"

## Review Discussion

**Winston (Architect):** The SessionContext clarification is accurate now. One more: the admin journey Step 2 shows "더블클릭 → 부서 생성" but doesn't specify the required fields. Per architecture, departments need: name, tier_level, optional parent_department_id. The double-click should trigger a mini-form, not just create an empty node. R1 Journey D already addressed this but the detailed journey here should match.

**Quinn (QA):** The CLI token validation (Step 4) shows "남은 한도: 85%" — but Claude CLI tokens don't expose usage quota via API. This may be a false UX promise. We can validate "token works" but may not be able to show remaining quota percentage.

## Issues Found

1. **[ISSUE-R2-1] CLI Token Quota Display May Be Infeasible** — Claude OAuth CLI tokens may not expose remaining quota via API. The "남은 한도: 85%" display needs architectural verification.

## Fixes Applied

- **ISSUE-R2-1**: Changed to "✅ Claude Max 연결 확인. 모델: claude-sonnet-4" — removed quota percentage (infeasible). Added note "(한도 정보는 Claude 대시보드에서 확인)"
