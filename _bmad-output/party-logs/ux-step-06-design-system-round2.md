# Party Mode Round 2: Adversarial Review — Design System

**Step:** step-06-design-system
**Round:** 2 (Adversarial)
**Date:** 2026-03-11

## Expert Panel (Cynical Mode)

- **Sally (UX)**: "Users will hate this because..."
- **Winston (Architect)**: "What breaks first?"
- **Quinn (QA)**: "What's untestable?"

## Review Discussion

**Winston (Architect):** The design system is comprehensive. One concern: the tier colors are hardcoded (Tier 1=amber, 2=blue, 3=emerald, 4=slate) but the architecture supports N-tier with `tier_configs.color` — admin-defined custom colors. The design system should handle arbitrary hex colors, not just the 4 predefined tiers. A `bg-[${tierColor}]/10` dynamic pattern is needed.

**Sally (UX):** The layout diagram shows sidebar w-64 (256px) but doesn't specify collapse behavior. On smaller desktop screens (1280px), sidebar + agent panel + chat = 256 + 256 + content = very cramped. Should the sidebar collapse to icon-only (w-16, 64px) on screens < 1440px?

## Issues Found

1. **[ISSUE-R2-1] Dynamic Tier Colors Not Addressed** — Design system hardcodes 4 tier colors but architecture supports N-tier with custom colors. Need dynamic color handling pattern.

## Fixes Applied

- **ISSUE-R2-1**: Added note to tier color table: "Tier 5+ custom colors: Admin이 hex 지정 → `bg-[${color}]/10 text-[${color}]` 동적 적용. 색상 선택 시 WCAG AA 대비 4.5:1 자동 검증"
