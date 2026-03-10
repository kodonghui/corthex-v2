# Party Mode Round 1: Collaborative Review — Visual Foundation

**Step:** step-08-visual-foundation
**Round:** 1 (Collaborative)
**Date:** 2026-03-11

## Expert Panel

- **Sally (UX)**: Layout & visual hierarchy
- **Amelia (Dev)**: Implementation feasibility
- **Winston (Architect)**: Architecture alignment
- **Quinn (QA)**: Visual regression testability

## Review Discussion

**Sally (UX):** The 4 layout patterns are clear and well-diagrammed. The card system has 3 variants (basic, agent, summary) — solid foundation. One gap: the agent card shows "추천: SNS 콘텐츠 기획해줘" but per the architecture, where do these recommendations come from? Are they hardcoded in the Soul or dynamically generated? Also, the NEXUS node visualization doesn't show the **미배속 영역** visual treatment — it was defined in Journey D but not here in the visual spec.

**Amelia (Dev):** Recharts is a good choice for charts — it's React-native and works well with Tailwind. The chart common styles are detailed enough to implement. For the handoff tracker, the "병렬 분기" visualization shows two parallel nodes but doesn't specify the layout algorithm. In a linear tracker (h-12), how do we show 4 parallel agents? Do they stack vertically? Wrap? This needs a specific layout rule.

**Winston (Architect):** The NEXUS node types (에이전트, 부서, 유저) map correctly to the architecture entities. The edge definition (stroke-slate-500, active=blue-500 pulse) aligns with WebSocket real-time events. One detail: the architecture defines `visitedAgents` in SessionContext to prevent circular delegation. The tracker visualization should show this — if an agent appears twice in the chain, it should have a ⚠️ indicator.

## Issues Found

1. **[ISSUE-R1-1] Parallel Tracker Layout Undefined** — Handoff tracker shows parallel branches but doesn't specify how 3+ parallel agents are laid out in the h-12 bar.

2. **[ISSUE-R1-2] 미배속 영역 Visual Spec Missing** — NEXUS 미배속 area defined in Journey D but not in 7.5 visual spec.

## Fixes Applied

- **ISSUE-R1-1**: Added parallel layout rule: 2개까지 가로 나란히, 3개+ 시 수평 스크롤 + "외 N명" 요약 뱃지
- **ISSUE-R1-2**: Added 미배속 영역 spec to NEXUS visualization
