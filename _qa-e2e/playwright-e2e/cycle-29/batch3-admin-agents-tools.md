# Batch 3: Agents + Tools -- Cycle 29
Date: 2026-03-26

## Summary
- Total: 35 | PASS: 27 | FAIL: 2 | SKIP: 6

## /admin/agents

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-AGENT-001 | PASS | NEW_AGENT button opens create modal with fields: name*, role, tier, model, department, soul |
| TC-AGENT-002 | PASS | Filled all fields -> POST created agent -> toast "에이전트가 생성되었습니다" -> agent appears in table, count 9->10 |
| TC-AGENT-003 | PASS | Empty name -> click 만들기 -> form stays open, submit blocked (focus returns to name field) |
| TC-AGENT-004 | PASS | Tier=manager -> model auto-set to Claude Sonnet 4.6 |
| TC-AGENT-005 | PASS | Tier=specialist -> model auto-set to Claude Haiku 4.5 |
| TC-AGENT-006 | PASS | Tier=worker -> model auto-set to Claude Sonnet 4.6 (same as manager; may be intentional) |
| TC-AGENT-007 | FAIL | **No soul template dropdown** -- create form has raw textarea for Soul, not a dropdown loading from /admin/soul-templates |
| TC-AGENT-008 | PASS | Model dropdown shows 3 options: Claude Sonnet 4.6, Claude Opus 4.6, Claude Haiku 4.5 |
| TC-AGENT-009 | PASS | Department dropdown lists "미배정" + 15 active departments |
| TC-AGENT-010 | PASS | Search "QA-C28" -> filtered from 9 to 2 agents, footer shows "SHOWING 2 OF 9 AGENTS" |
| TC-AGENT-011 | FAIL | **Tier filter not working** -- selected MANAGER but still showed all 9 SPECIALIST agents (no filtering occurred) |
| TC-AGENT-012 | PASS | Status filter OFFLINE -> shows 9 agents (all offline), correct filtering |
| TC-AGENT-013 | PASS | Click agent row -> detail panel opens with agent name, tier badge, and 3 tabs: Soul/Config/Memory |
| TC-AGENT-014 | PASS | Soul tab shows soul markdown content and character count (25/50k), with Save Soul button |
| TC-AGENT-015 | PASS | Config tab shows: Agent Name, Primary Role, Tier Level, Foundation Model, Semantic Cache toggle, Save/Deactivate buttons |
| TC-AGENT-016 | PASS | Memory tab shows "Memory snapshots will appear here" (appropriate for new agent with no memory) |
| TC-AGENT-017 | PASS | Toggle semantic cache -> checkbox checked -> PATCH succeeds -> toast "에이전트가 수정되었습니다" |
| TC-AGENT-018 | PASS | Edit agent name in Config tab -> Save Changes -> name updated in table + detail panel -> toast "에이전트가 수정되었습니다" |
| TC-AGENT-019 | PASS | Click Deactivate Agent -> confirmation dialog "QA-C29-TestAgent-EDITED을(를) 비활성화하시겠습니까?" -> confirm -> agent name gets [OFF] suffix -> toast "에이전트가 비활성화되었습니다" |
| TC-AGENT-020 | SKIP | Cannot test -- no agents with active sessions in test environment |
| TC-AGENT-021 | PASS | Status label "오프라인" displayed correctly with gray indicator dot (only offline agents available to verify) |
| TC-AGENT-022 | PASS | SPECIALIST tier badge displayed in distinct blue/cyan color styling |

## /admin/tools

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-TOOL-001 | PASS | Page loads: Tool Registry table (3 tools), Agent Permission Matrix, stats (3 tools, 0 active, 5 categories) |
| TC-TOOL-002 | PASS | Category filter dropdown with: 전체 카테고리, Common, Finance, Legal, Marketing, Tech. Selecting "Common" shows all 3 common tools correctly |
| TC-TOOL-003 | PASS | Search "qa-27" -> filtered to 1 tool (qa-27-tool), "Displaying 1/3 Total Entities". Permission matrix also filters to matching tool column |
| TC-TOOL-004 | PASS | Agent Permission Matrix shows all agents with checkboxes per tool (matrix view instead of per-agent selection) |
| TC-TOOL-005 | PASS | Check tool checkbox -> checkbox checked, "변경사항 1건" counter appears with Cancel/Save buttons |
| TC-TOOL-006 | PASS | Uncheck tool -> checkbox unchecked, pending changes bar disappears (0 changes) |
| TC-TOOL-007 | SKIP | No per-category "select all" checkbox exists -- UI uses a flat permission matrix, not category grouping with select-all |
| TC-TOOL-008 | SKIP | Same as TC-TOOL-007 -- no category-level deselect-all checkbox |
| TC-TOOL-009 | PASS | Click Save -> PATCH succeeds -> toast "도구 권한이 저장되었습니다" -> checkbox state persists |
| TC-TOOL-010 | PASS | With 0 pending changes, Save/Cancel buttons are not shown (button effectively disabled by absence) |
| TC-TOOL-011 | PASS | Pending changes counter shows accurate count ("변경사항 1건") |
| TC-TOOL-012 | PASS | Register Tool button opens form: 도구명, 설명, 카테고리 (Common/Finance/Legal/Marketing/Tech) with Cancel/Add buttons |
| TC-TOOL-013 | SKIP | TC-TOOL-013 not defined in test cases (only 12 TCs for tools). N/A |

## Bugs Found

### BUG-C29-001: Tier filter not working on /admin/agents (TC-AGENT-011)
- **Severity**: Medium
- **Steps**: Navigate to /admin/agents -> Select "MANAGER" from Filter_Tier dropdown
- **Expected**: Only agents with tier=manager should be displayed
- **Actual**: All 9 agents (all SPECIALIST) remain visible. No filtering occurs. The dropdown value changes but the table is not re-filtered.
- **Note**: Status filter (ALL_STATES/ONLINE/WORKING/OFFLINE/ERROR) works correctly. Only the tier filter is broken.

### BUG-C29-002: No soul template dropdown in agent create form (TC-AGENT-007)
- **Severity**: Low
- **Steps**: Click NEW_AGENT on /admin/agents
- **Expected**: A dropdown that loads soul templates from /admin/soul-templates API, allowing selection of a pre-defined persona
- **Actual**: Only a raw textarea "에이전트의 성격과 행동 방식을 정의합니다..." is shown. No soul template selection/loading mechanism.
- **Note**: May be a design decision rather than a bug -- manual soul entry vs template selection.
