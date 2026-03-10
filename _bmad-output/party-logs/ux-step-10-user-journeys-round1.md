# Party Mode Round 1: Collaborative Review — Detailed User Journeys

**Step:** step-10-user-journeys
**Round:** 1 (Collaborative)
**Date:** 2026-03-11

## Expert Panel

- **John (PM)**: User story coverage
- **Sally (UX)**: Screen-level detail quality
- **Winston (Architect)**: Architecture accuracy
- **Quinn (QA)**: Test scenario derivation

## Review Discussion

**John (PM):** 3 detailed journeys cover the 3 core personas well: CEO daily (9.1), Admin setup (9.2), Employee hub (9.3). The ASCII wireframes are very specific — sidebar items, layout proportions, button labels. Great for dev reference. One gap: the CEO journey doesn't show the **통신로그** usage. After commands, power users check the communication log to see agent internals. This is Journey 5 in the PRD.

**Sally (UX):** The admin journey (9.2) Step 3 shows a Master-Detail layout for agent management — matches Pattern A from Section 7. Good consistency. However, Step 4 (CLI 토큰) shows the token as "●●●●●●●●●●●●●●●●●●" masked — but doesn't specify the paste/input UX. Is it a text input? A file upload? Per architecture, CLI tokens are OAuth-based, so it's likely a text input where the user pastes a token string. Also, the "@멘션" autocomplete in 9.3 shows agent names but should also show department context to disambiguate agents with similar names.

**Winston (Architect):** The CEO journey shows budget progress bar "████████░░ 45% [$2.25/$5.00]" which is per-command or per-day? The architecture defines budget limits at company/department/agent level. The progress bar should indicate which budget scope it's showing. Also, Journey 9.3 says "@SEO분석가" switches to a different agent with "이전 대화 컨텍스트 유지" — but architecturally, switching agents creates a new session with a new SessionContext. The previous conversation context isn't automatically passed to the new agent unless explicitly included. This needs clarification.

## Issues Found

1. **[ISSUE-R1-1] @멘션 Context Transfer Misrepresentation** — 9.3 says context is maintained when switching agents via @멘션, but architecture creates new SessionContext per agent. Must clarify.

2. **[ISSUE-R1-2] Budget Progress Bar Scope Ambiguous** — CEO journey shows budget % but doesn't specify scope (company/department/agent/daily).

## Fixes Applied

- **ISSUE-R1-1**: Clarified: @멘션 전환 시 이전 대화 텍스트는 화면에 유지되지만, 새 에이전트는 별도 SessionContext로 실행. 이전 응답을 참조하려면 명시적으로 인용 필요
- **ISSUE-R1-2**: Added scope label: "일일 예산" (company daily budget) 명시
