# Party Mode Round 2: Adversarial Review — Emotional Response & Trust

**Step:** step-04-emotional-response
**Round:** 2 (Adversarial)
**Date:** 2026-03-11

## Expert Panel (Cynical Mode)

- **John (PM)**: "Show me the gap"
- **Sally (UX)**: "Users will hate this because..."
- **Winston (Architect)**: "What breaks first?"
- **Quinn (QA)**: "What's untestable?"

## Review Discussion

**Sally (UX):** The micro-interaction table (3.5) gives excellent animation specs, but it's missing the **NEXUS interactions**. Journey D is about drag-and-drop on a React Flow canvas — where are the micro-interactions for node creation, edge drawing, node deletion confirmation, drag feedback? These are emotionally loaded moments (creation = joy, deletion = anxiety). The current table only covers hub/chat interactions.

**Quinn (QA):** The real-time cost counter during processing ("현재: $0.012...") — how often does this update? Per tool call? Per second? Per SSE event? Without a defined update frequency, it's untestable and could cause unnecessary re-renders. Also, showing a fluctuating cost number during processing might actually INCREASE anxiety rather than reduce it, especially if the number jumps unexpectedly. Consider showing a progress bar against the budget limit instead.

**John (PM):** Quinn raises a valid UX psychology point. A rapidly incrementing counter can feel like a taxi meter — which is an anxious experience. Better to show "예산 사용: 12% (한도: $5.00)" as a progress bar. This frames cost as a bounded resource, not an open-ended expense.

## Issues Found

1. **[ISSUE-R2-1] Missing NEXUS Micro-interactions** — 3.5 only covers hub/chat. NEXUS canvas interactions (node create, drag, drop, delete, edge draw) need emotional micro-interaction specs.

2. **[ISSUE-R2-2] Real-Time Cost Display UX Refinement** — Raw counter ("$0.012...") may increase anxiety. Should reframe as progress bar against budget limit.

## Fixes Applied

- **ISSUE-R2-1**: Added NEXUS micro-interactions to 3.5 table (node create, drag, drop-into-dept, delete confirmation, edge draw)
- **ISSUE-R2-2**: Changed real-time cost from raw counter to budget progress bar "예산 사용: 12% [$0.60/$5.00]" with color zones (green <70%, yellow 70-90%, red >90%)
