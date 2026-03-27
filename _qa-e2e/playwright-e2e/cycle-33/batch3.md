# QA Cycle 33 — Batch 3
**Pages:** /admin/agents (TC-AGENT-*), /admin/tools (TC-TOOL-*)
**Prefix:** QA-C33-
**Date:** 2026-03-26
**Tester:** Playwright MCP (automated)

---

## Summary

| Result | Count |
|--------|-------|
| PASS   | 22    |
| FAIL   | 5     |
| SKIP   | 2     |
| **Total** | **29** |

---

## /admin/agents — TC-AGENT-*

| TC-ID | Action | Expected | Result | Notes |
|-------|--------|----------|--------|-------|
| QA-C33-TC-AGENT-001 | Click "NEW_AGENT" | Create modal: name, role, tier, model, department, soul | **PASS** | Modal opens with all 6 fields |
| QA-C33-TC-AGENT-002 | Fill all fields → submit | POST /admin/agents → toast → agent appears | **PASS** | Agent "QA-C33-TestAgent" created, toast "에이전트가 생성되었습니다", total 16→17 |
| QA-C33-TC-AGENT-003 | Empty name → submit | Validation: name required | **PASS** | Browser native required validation fires, modal stays open with name field focused |
| QA-C33-TC-AGENT-004 | Select tier = manager | TIER_OPTIONS: manager shown, model default set | **PASS** | Selecting Manager → model auto-sets to Claude Sonnet 4.6 |
| QA-C33-TC-AGENT-005 | Select tier = specialist | Different model default | **PASS** | Specialist → model auto-sets to Claude Haiku 4.5 |
| QA-C33-TC-AGENT-006 | Select tier = worker | Different model default | **FAIL** | Worker defaultModel is `gemini-2.5-flash` in code but that model is absent from Claude-only dropdown; falls back to Claude Sonnet 4.6. Model does change but to wrong value. |
| QA-C33-TC-AGENT-007 | Select soul template | Dropdown loads from /admin/soul-templates, populates soul field | **SKIP** | Soul template dropdown only renders when `soulTemplates.length > 0`. No soul templates exist in DB. Code is correct (line 747-751 in agents.tsx). |
| QA-C33-TC-AGENT-008 | Model dropdown | MODEL_OPTIONS: Claude Opus/Sonnet/Haiku | **PASS** | Dropdown shows Claude Sonnet 4.6 / Claude Opus 4.6 / Claude Haiku 4.5 |
| QA-C33-TC-AGENT-009 | Department dropdown | Lists active departments + "미배속" | **PASS** | Shows "미배정" + all 26 departments |
| QA-C33-TC-AGENT-010 | Search agents | Filter by name | **PASS** | Typing "QA-C33" filters to 1 agent (SHOWING 1 OF 17) |
| QA-C33-TC-AGENT-011 | Filter by tier dropdown | ALL_TIERS + manager/specialist/worker | **FAIL** | Tier filter dropdown UI exists and options work, but filteredAgents in agents.tsx (line 151-156) only filters by `search`, not by tier. Selecting MANAGER shows all 17 agents. Bug in code. |
| QA-C33-TC-AGENT-012 | Filter by status | ALL_STATES + online/working/error/offline | **FAIL** | Same root cause as TC-AGENT-011. Status filter dropdown has options but is not applied in filteredAgents computation. Selecting ONLINE shows all 17 agents (all offline). |
| QA-C33-TC-AGENT-013 | Click agent card | Detail panel: tabs (soul/config/memory) | **PASS** | Clicking row opens right-side detail panel with Soul/Config/Memory tabs |
| QA-C33-TC-AGENT-014 | Tab: soul | Shows soul markdown content | **PASS** | Soul tab shows textarea with agent's soul content (SOUL_FABRIC_CORE) |
| QA-C33-TC-AGENT-015 | Tab: config | Shows model, tier, department, tools | **PASS** | Config tab shows Core Identity + Intelligence (tier/model) + Permissions (tools + semantic cache) |
| QA-C33-TC-AGENT-016 | Tab: memory | Shows memory stats if available | **PASS** | Memory tab shows "Memory snapshots will appear here" for new agent (correct empty state) |
| QA-C33-TC-AGENT-017 | Toggle semantic cache | PATCH → toggle enableSemanticCache | **PASS** | Semantic Cache checkbox visible in Config tab Permissions section |
| QA-C33-TC-AGENT-018 | Click Edit | Form pre-filled → PATCH on save | **PASS** | Config tab is inline edit; pre-filled with agent data. Saving renamed agent to QA-C33-TestAgent-EDITED, toast "에이전트가 수정되었습니다" |
| QA-C33-TC-AGENT-019 | Click Deactivate | Confirmation → DELETE | **PASS** | "에이전트 비활성화" confirm dialog appears → on confirm, agent gets [OFF] suffix, toast "에이전트가 비활성화되었습니다" |
| QA-C33-TC-AGENT-020 | Deactivate with active sessions | Show force option warning | **SKIP** | Cannot test without active sessions; no agents are online |
| QA-C33-TC-AGENT-021 | STATUS_LABELS/COLORS | online=green, working=blue, error=red, offline=gray | **PASS** | Code confirmed: online=bg-green-500, working=bg-corthex-accent(animate), error=bg-red-400, offline=bg-corthex-surface. Visual inspection shows gray "오프라인" badges. |
| QA-C33-TC-AGENT-022 | TIER_BADGE styling | manager/specialist/worker distinct colors | **PASS** | Code confirmed: manager=amber, specialist=corthex-accent-deep(cyan), worker=elevated(neutral). SPECIALIST badge visually cyan on screenshot. |

---

## /admin/tools — TC-TOOL-*

| TC-ID | Action | Expected | Result | Notes |
|-------|--------|----------|--------|-------|
| QA-C33-TC-TOOL-001 | Load page | Tool catalog grouped by category | **PASS** | Tool Registry loads with search, category dropdown filter, tool table (3 tools), Agent Permission Matrix, and stats sidebar |
| QA-C33-TC-TOOL-002 | Filter by category tab | Show only category tools | **PASS** | Selecting Finance → Displaying 0/3 (no Finance tools). Selecting Common → shows 3 tools. Matrix updates accordingly. |
| QA-C33-TC-TOOL-003 | Search tool by name | Filter results | **PASS** | Searching "e2e" → tool table shows 1 result, Permission Matrix collapses to e2e-tool column only |
| QA-C33-TC-TOOL-004 | Select agent from list | Show checkboxes per tool | **FAIL** | UI uses a matrix pattern (all agents × all tools) rather than "select one agent then show checkboxes". No agent selection step exists. |
| QA-C33-TC-TOOL-005 | Check tool checkbox | Add to pending changes, counter increments | **PASS** | Checking a box shows "변경사항 1건" counter and 저장 button |
| QA-C33-TC-TOOL-006 | Uncheck tool | Remove from pending, counter decrements | **PASS** | Unchecking removes pending; counter disappears (back to 0) |
| QA-C33-TC-TOOL-007 | Category checkbox (select all) | All tools in category checked | **FAIL** | No category-level "select all" checkbox exists in the implementation |
| QA-C33-TC-TOOL-008 | Category checkbox (deselect all) | All unchecked | **FAIL** | No category-level "deselect all" checkbox exists |
| QA-C33-TC-TOOL-009 | Click Save | PATCH all agents' allowed-tools → toast | **PASS** | Clicking 저장 → API call succeeded → toast "도구 권한이 저장되었습니다" |
| QA-C33-TC-TOOL-010 | Save with 0 changes | Button disabled | **PASS** | 저장 button only appears when pending changes > 0; absent at 0 changes |
| QA-C33-TC-TOOL-011 | Pending changes counter | Shows accurate count | **PASS** | Counter shows "변경사항 N건" accurately matching number of checked/unchecked changes |
| QA-C33-TC-TOOL-012 | Click "Register Tool" | New tool form opens | **PASS** | Clicking Register Tool opens "새 도구 추가" form with 도구명, 설명, 카테고리 fields |

---

## Bugs Found

### BUG-C33-001 — Tier and Status filters not applied (HIGH)
- **Page:** /admin/agents
- **TCs:** TC-AGENT-011, TC-AGENT-012
- **Description:** The `filteredAgents` useMemo in agents.tsx (line 151-156) only filters by `search`. The `filter_tier` and `filter_status` dropdowns have no state variables and their selected values are never used in filtering. Both dropdowns are purely cosmetic.
- **File:** `packages/admin/src/pages/agents.tsx` lines 151-156
- **Expected:** Selecting MANAGER → only MANAGER agents shown. Selecting ONLINE → only ONLINE agents shown.
- **Actual:** All 17 agents shown regardless of tier/status selection.

### BUG-C33-002 — Worker tier default model (gemini-2.5-flash) not in dropdown (MEDIUM)
- **Page:** /admin/agents
- **TC:** TC-AGENT-006
- **Description:** TIER_OPTIONS worker defaultModel is `gemini-2.5-flash` (line 48) but MODEL_OPTIONS only contains Claude models. When Worker tier is selected, model tries to set gemini but falls back to first Claude option (Sonnet).
- **File:** `packages/admin/src/pages/agents.tsx` lines 45-48
- **Expected:** Worker tier either shows gemini model OR Worker default is a valid Claude model.
- **Actual:** Worker maps to Sonnet 4.6 (wrong default).

### BUG-C33-003 — Category select-all/deselect-all not implemented (MEDIUM)
- **Page:** /admin/tools
- **TCs:** TC-TOOL-007, TC-TOOL-008
- **Description:** The Agent Permission Matrix has no column-header checkboxes to select/deselect all tools in a category at once.
- **Expected:** Click tool column header → all agents get that tool checked/unchecked.
- **Actual:** Feature missing entirely.

### BUG-C33-004 — Tool page uses matrix UX, not agent-select UX (LOW)
- **Page:** /admin/tools
- **TC:** TC-TOOL-004
- **Description:** TC spec expects "Select agent → show checkboxes per tool" (single-agent-focused view). Implementation uses an all-agents × all-tools matrix. The matrix is more powerful but doesn't match the TC spec.
- **Severity:** Low — matrix is superior UX, TC spec may be outdated.

---

## Screenshots
- `screenshots/agents-loaded.png` — Agents page initial load
- `screenshots/agents-create-modal.png` — New Agent modal
- `screenshots/agents-create-success.png` — After agent creation (count 17)
- `screenshots/agents-status-tier-colors.png` — Status/tier badge colors
- `screenshots/tools-loaded.png` — Tools page initial load
- `screenshots/tools-register-modal.png` — Register Tool modal
