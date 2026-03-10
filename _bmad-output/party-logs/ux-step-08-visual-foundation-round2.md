# Party Mode Round 2: Adversarial Review — Visual Foundation

**Step:** step-08-visual-foundation
**Round:** 2 (Adversarial)
**Date:** 2026-03-11

## Expert Panel (Cynical Mode)

- **Sally (UX)**: "Users will hate this because..."
- **Quinn (QA)**: "What's untestable?"

## Review Discussion

**Quinn (QA):** The Recharts chart types are well-defined but there's no spec for responsive chart behavior. On a 1280px screen, a 2-column chart grid may be too cramped. Also, the stacked bar chart uses model colors (claude=#6366F1, gpt=#10B981, gemini=#F59E0B) — these are reusing tier/status colors. Claude's indigo overlaps with status-info. Consider unique model identifiers.

**Sally (UX):** The summary card shows "▲ 3명 (이번 주)" with emerald for increase — but what if an increase is BAD? Like cost increase? The color coding should be semantic (good=emerald, bad=red), not directional (up=emerald, down=red). Cost going up = red, agents going up = emerald.

## Issues Found

1. **[ISSUE-R2-1] Summary Card Color Semantics** — Up/down colors should be semantic (good/bad) not directional (up/down). Cost increase should be red.

## Fixes Applied

- **ISSUE-R2-1**: Added note to summary card: "색상은 방향이 아닌 의미 기반. 비용 증가=red-400, 에이전트 증가=emerald-400, 세션 감소(비정상)=red-400"
