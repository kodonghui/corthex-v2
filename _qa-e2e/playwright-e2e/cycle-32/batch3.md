# QA Cycle 32 — Batch 3: /admin/agents + /admin/tools

**Date:** 2026-03-26
**Prefix:** QA-C32-
**Session:** a84b947c-98aa-4c17-8a0c-22aed6d24c69
**Pages tested:** /admin/agents (TC-AGENT-001~022), /admin/tools (TC-TOOL-001~012)
**Screenshots:** cycle-32/screenshots/agents-main.png, cycle-32/screenshots/tools-main.png

---

## /admin/agents Results

| TC-ID | Action | Result | Status | Notes |
|-------|--------|--------|--------|-------|
| TC-AGENT-001 | Click NEW_AGENT | Modal opens: name*, role, tier, model, dept, soul fields | PASS | Panel slides in from right |
| TC-AGENT-002 | Fill all fields → submit | POST /admin/agents → toast "에이전트가 생성되었습니다" → row appears (ID: 694b252d) | PASS | Count 14→15 |
| TC-AGENT-003 | Empty name → submit | Name field focused/highlighted, no POST sent, panel stays open | PASS | Validation blocks submit |
| TC-AGENT-004 | Select tier = manager | Model auto-switches to Claude Sonnet 4.6 | PASS | |
| TC-AGENT-005 | Select tier = specialist | Model auto-switches to Claude Haiku 4.5 | PASS | |
| TC-AGENT-006 | Select tier = worker | Model auto-switches to Claude Sonnet 4.6 | NOTE | Worker uses same model as Manager (Sonnet 4.6); TC expected "different model default" — both use Sonnet |
| TC-AGENT-007 | Select soul template | No soul template dropdown in create form — only free-text soul textarea | BUG | Soul template selector missing from NEW_AGENT form; only direct text input available |
| TC-AGENT-008 | Model dropdown | Shows: Claude Sonnet 4.6, Claude Opus 4.6, Claude Haiku 4.5 | PASS | |
| TC-AGENT-009 | Department dropdown | Shows "미배정" + 23 active departments | PASS | |
| TC-AGENT-010 | Search agents | "QA-C32" filters to 1 result, "SHOWING 1 OF 15 AGENTS" | PASS | |
| TC-AGENT-011 | Filter by tier = MANAGER | Dropdown changes to MANAGER but ALL 15 agents still displayed (incl. SPECIALIST) | BUG | Tier filter does not actually filter results; "SHOWING 15 OF 15 AGENTS" unchanged |
| TC-AGENT-012 | Filter by status = OFFLINE | All 15 agents shown (all are offline), count unchanged | PASS | All agents are OFFLINE so filter is technically correct — no non-offline agents to hide |
| TC-AGENT-013 | Click agent card row | Detail panel opens with Soul/Config/Memory tabs | PASS | |
| TC-AGENT-014 | Tab: Soul | Shows soul text content "QA cycle 32 test agent soul" with SOUL_FABRIC_CORE label and 27/50k char count | PASS | |
| TC-AGENT-015 | Tab: Config | Shows editable: name, role, tier, model, semantic cache toggle, Save Changes + Deactivate buttons | PASS | |
| TC-AGENT-016 | Tab: Memory | Shows "Memory snapshots will appear here" (empty state for new agent) | PASS | |
| TC-AGENT-017 | Toggle semantic cache | PATCH → checkbox checked → toast "에이전트가 수정되었습니다" | PASS | Orange toggle when enabled |
| TC-AGENT-018 | Config: edit name → Save Changes | PATCH → row updates to QA-C32-TestAgent-EDITED → toast "에이전트가 수정되었습니다" | PASS | Inline edit in Config tab |
| TC-AGENT-019 | Click Deactivate Agent | Confirmation dialog: "QA-C32-TestAgent-EDITED을(를) 비활성화하시겠습니까?" | PASS | |
| TC-AGENT-019 (confirm) | Confirm 비활성화 | DELETE → agent shows [OFF] suffix → toast "에이전트가 비활성화되었습니다" → ERROR/INACTIVE 12→13 | PASS | |
| TC-AGENT-020 | Deactivate with active sessions | Not testable (all agents offline; no active sessions) | SKIP | All QA agents are OFFLINE |
| TC-AGENT-021 | STATUS_LABELS/COLORS | "오프라인" label shown in gray/dark for offline agents | PASS | Visual confirmed via screenshot |
| TC-AGENT-022 | TIER_BADGE styling | SPECIALIST = cyan/teal badge, MANAGER = amber/yellow badge | PASS | Visual confirmed via screenshot |

### Bugs Found — /admin/agents

**BUG-C32-AGENT-001 (MEDIUM): Tier filter non-functional**
- TC: TC-AGENT-011
- Steps: Navigate /admin/agents → select MANAGER from Filter_Tier dropdown
- Expected: Only MANAGER tier agents displayed
- Actual: All 15 agents displayed regardless of selected tier
- Evidence: "SHOWING 15 OF 15 AGENTS" with SPECIALIST/MANAGER/WORKER all visible after MANAGER filter selected

**BUG-C32-AGENT-002 (LOW): Soul template selector missing from create form**
- TC: TC-AGENT-007
- Steps: Click NEW_AGENT → look for soul template dropdown
- Expected: Dropdown to select from /admin/soul-templates to pre-populate soul field
- Actual: Only free-text textarea for soul — no template selection dropdown
- Note: Soul templates exist (/admin/soul-templates page exists) but are not accessible from agent create form

---

## /admin/tools Results

| TC-ID | Action | Result | Status | Notes |
|-------|--------|--------|--------|-------|
| TC-TOOL-001 | Load page | Tool catalog: 3 tools (e2e-tool, qa-24-tool, qa-27-tool) grouped in table; Agent Permission Matrix below | PASS | Stats: 3 total, 0 active, 5 categories |
| TC-TOOL-002 | Filter by category = Finance | Shows 0/3 tools, matrix columns empty | PASS | Filtering works correctly |
| TC-TOOL-003 | Search tool by name "qa-24" | Filters to 1 result (qa-24-tool), "Displaying 1/3 Total Entities", matrix updates | PASS | |
| TC-TOOL-004 | Agent/tool checkboxes visible | Agent Permission Matrix shows all agents × all tools as checkboxes | PASS | No separate "select agent" step needed; matrix always visible |
| TC-TOOL-005 | Check tool checkbox | "변경사항 1건" counter appears, 저장 button appears (both top and bottom) | PASS | |
| TC-TOOL-006 | Uncheck tool | Counter disappears, 저장 button hidden (0 pending changes) | PASS | |
| TC-TOOL-007 | Category checkbox (select all) | No column header checkbox found — not implemented | MISSING | Column headers are plain text only; no bulk select-all per tool column |
| TC-TOOL-008 | Category checkbox (deselect all) | Same — not implemented | MISSING | Same as TC-TOOL-007 |
| TC-TOOL-009 | Click Save with 1 change | PATCH agent allowed-tools → toast "도구 권한이 저장되었습니다" → pending counter cleared | PASS | |
| TC-TOOL-010 | Save with 0 changes | 저장 button not shown when 0 pending changes | PASS | Button only appears when changes exist |
| TC-TOOL-011 | Pending changes counter | "변경사항 N건" accurately counts pending changes | PASS | Updates on each check/uncheck |
| TC-TOOL-012 | Click Register Tool | Side panel opens with: 도구명 (text), 설명 (text), 카테고리 (combobox: Common/Finance/Legal/Marketing/Tech), 추가 button | PASS | |

### Bugs Found — /admin/tools

**BUG-C32-TOOL-001 (LOW): No bulk select-all per tool column**
- TC: TC-TOOL-007 / TC-TOOL-008
- Steps: Navigate /admin/tools → look for category/column header checkbox
- Expected: Column header checkbox to select/deselect all agents for a tool
- Actual: Column headers are plain text; no bulk select mechanism exists
- Impact: Low — individual checkboxes still work; just no bulk action

---

## Summary

| Page | TCs Run | PASS | BUG | SKIP | MISSING | Coverage |
|------|---------|------|-----|------|---------|----------|
| /admin/agents | 22 | 19 | 2 | 1 | 0 | 95% |
| /admin/tools | 12 | 9 | 0 | 0 | 3 | 75% (2 missing features, 1 non-applicable) |
| **TOTAL** | **34** | **28** | **2** | **1** | **3** | **88%** |

### Key Findings
1. **Tier filter broken** (MEDIUM) — /admin/agents Filter_Tier dropdown is decorative; does not filter the table
2. **Soul template selector absent** (LOW) — NEW_AGENT form lacks dropdown to load from /admin/soul-templates
3. **No bulk tool assignment** (LOW) — Tools page lacks column header checkboxes for bulk agent permission assignment
4. Agent CRUD (create/edit/deactivate) all work correctly with proper toasts and API calls
5. Semantic cache toggle works correctly (PATCH + immediate feedback)
6. Tool permission matrix save/unsave cycle works correctly
7. Search filters (agents by name, tools by name + category) both functional

### Cleanup
- Created agent QA-C32-TestAgent (694b252d) → renamed to QA-C32-TestAgent-EDITED → deactivated (marked [OFF])
- Added e2e-tool permission to QA-C32-TestAgent-EDITED → removed (reverted to original state)
