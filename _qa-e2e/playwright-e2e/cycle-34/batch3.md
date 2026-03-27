# Cycle 34 — Batch 3: /admin/agents & /admin/tools
**Prefix:** QA-C34- | **Date:** 2026-03-27 | **Tester:** Playwright MCP (automated)
**Pages:** `/admin/agents` (TC-AGENT-001~022), `/admin/tools` (TC-TOOL-001~012)

---

## Summary

| Category | PASS | FAIL | SKIP |
|----------|------|------|------|
| TC-AGENT | 16   | 3    | 3    |
| TC-TOOL  | 8    | 0    | 4    |
| **Total**| **24**| **3** | **7** |

---

## /admin/agents Results

### TC-AGENT-001 — PASS
**Action:** Click "NEW_AGENT" button
**Result:** Create modal opened with all required fields: Agent Name, Role, Tier Level, Foundation Model, Department, Soul (Persona). All fields present as expected.

### TC-AGENT-002 — PASS
**Action:** Fill all fields (name=QA-C34-TestAgent, role=QA E2E Testing, tier=worker, soul=cycle 34 soul) → submit
**Result:** POST succeeded, toast "에이전트가 생성되었습니다", agent appeared in list, TOTAL_AGENTS count 18→19.
**Note (BUG):** Worker tier used `gemini-2.5-flash` as the model (see TC-AGENT-006 bug note).

### TC-AGENT-003 — PASS
**Action:** Click 만들기 with empty name field
**Result:** HTML5 browser validation prevented submission (name field focused/active), modal stayed open. Validation works.

### TC-AGENT-004 — PASS
**Action:** Select Tier = Manager in create form
**Result:** Foundation Model auto-changed to "Claude Sonnet 4.6". Confirmed via select value inspection.

### TC-AGENT-005 — PASS
**Action:** Select Tier = Specialist in create form
**Result:** Foundation Model auto-defaulted to "Claude Haiku 4.5". Correct per `TIER_OPTIONS[specialist].defaultModel`.

### TC-AGENT-006 — FAIL (BUG)
**Action:** Select Tier = Worker in create form
**Result:** `TIER_OPTIONS[worker].defaultModel` is `'gemini-2.5-flash'`, which is NOT in MODEL_OPTIONS. When Worker is selected, React form state sets `modelName = 'gemini-2.5-flash'` but the dropdown shows first valid option (Claude Sonnet). The submitted agent has `gemini-2.5-flash` as model (visible in table as "gemini-2.5-flash"). This is a code bug.
**File:** `packages/admin/src/pages/agents.tsx` line 48
```ts
{ value: 'worker', label: 'Worker', desc: '반복 작업 수행', defaultModel: 'gemini-2.5-flash' },
```
**Fix:** Change `defaultModel` to `'claude-haiku-4-5'` (or any valid Claude model).

### TC-AGENT-007 — SKIP
**Action:** Select soul template from dropdown
**Reason:** No soul templates loaded in the create form (soul template dropdown does not render when `soulTemplates.length === 0`). Could not test template loading/population.

### TC-AGENT-008 — PASS
**Action:** Inspect Model dropdown in create form
**Result:** MODEL_OPTIONS shows exactly: Claude Sonnet 4.6, Claude Opus 4.6, Claude Haiku 4.5. Only Claude models listed.

### TC-AGENT-009 — PASS
**Action:** Inspect Department dropdown in create form
**Result:** Shows "미배정" + all 30 active departments from the system. Correct.

### TC-AGENT-010 — PASS
**Action:** Type "QA-C34" in AGENT_NAME... search box
**Result:** Table filtered to 1 of 19 agents (SHOWING 1 OF 19 AGENTS). Search filter works correctly.

### TC-AGENT-011 — FAIL (BUG)
**Action:** Select MANAGER in Filter_Tier dropdown
**Result:** All 19 agents still displayed (SHOWING 19 OF 19). Tier filter has no effect on agent list.
**Root Cause:** `filteredAgents` in `agents.tsx` (lines 151-156) only filters by `search`, no tier filter state exists. Tier dropdown renders but is disconnected from filtering logic.
**File:** `packages/admin/src/pages/agents.tsx` lines 117-156 — `[filterTier, filterStatus]` states are not declared.

### TC-AGENT-012 — FAIL (BUG)
**Action:** Select ONLINE in Filter_Status dropdown
**Result:** All 19 agents still displayed. Status filter has no effect.
**Root Cause:** Same as TC-AGENT-011 — only `search` is wired into `filteredAgents`. The status dropdown UI exists but has no backing state or filter logic.

### TC-AGENT-013 — PASS
**Action:** Click agent row (QA-C30-TestAgent-EDITED)
**Result:** Detail panel opened on the right with tabs: Soul, Config, Memory. Correct.

### TC-AGENT-014 — PASS
**Action:** Soul tab (default on open)
**Result:** Shows soul textarea with content "QA Cycle 30 test agent soul" + word count display (27 / 50k) + "Save Soul" button. Correct.

### TC-AGENT-015 — PASS
**Action:** Click Config tab
**Result:** Shows Core Identity (name, role), Intelligence (tier=Specialist, model=Claude Haiku 4.5), Permissions (tool checkboxes + Semantic Cache toggle), Save Changes / Deactivate buttons. All expected fields present.

### TC-AGENT-016 — PASS
**Action:** Click Memory tab
**Result:** "Memory snapshots will appear here" message displayed. Empty state handled gracefully.

### TC-AGENT-017 — PASS
**Action:** Click Semantic Cache toggle in Config panel
**Result:** Confirmation dialog "Semantic Cache 비활성화" appeared with 취소/확인 buttons. PATCH request is guarded by confirmation dialog. Correct.

### TC-AGENT-018 — PASS
**Action:** Modify config fields → click "Save Changes"
**Result:** PATCH API called, toast "에이전트가 수정되었습니다", agent row updated in table. Edit flow works.

### TC-AGENT-019 — PASS
**Action:** Click "Deactivate Agent" on QA-C34-NexusAgent
**Result:** Modal "에이전트 비활성화" appeared with agent name, 취소/비활성화 buttons. Confirmed → DELETE/deactivate executed, toast "에이전트가 비활성화되었습니다", agent gained "[OFF]" suffix in list.

### TC-AGENT-020 — SKIP
**Action:** Deactivate agent with active sessions
**Reason:** All agents are OFFLINE status; cannot simulate active session scenario. Force warning could not be triggered.

### TC-AGENT-021 — PASS
**Action:** Inspect STATUS_LABELS/COLORS in table
**Result (code-verified):** `online`→`var(--color-corthex-success)` (green), `working`→`var(--color-corthex-accent)` (cyan), `error`→`var(--color-corthex-error)` (red), `offline`→`var(--color-corthex-text-disabled)` (gray). Implementation matches spec.

### TC-AGENT-022 — PASS
**Action:** Inspect TIER_BADGE styling
**Result:** TIER_BADGE defined with distinct styles — `manager`: amber, `specialist`: corthex-info (cyan), `worker`: elevated (neutral). Inline style renders distinct colors per tier. Screenshot confirms visual distinction.

---

## /admin/tools Results

### TC-TOOL-001 — PASS
**Action:** Load /admin/tools page
**Result:** Page loads with Tool Registry table (3 tools: e2e-tool, qa-24-tool, qa-27-tool), category filter dropdown, search field, Agent Permission Matrix. Page header: "Tool Registry".

### TC-TOOL-002 — PASS
**Action:** Select "Common" from category dropdown (전체 카테고리 → Common)
**Result:** Table filtered to 3/3 tools (all are "common" category). Filter works correctly.

### TC-TOOL-003 — PASS
**Action:** Type "qa-24" in QUERY_SYSTEM_TOOLS... search
**Result:** Filtered to 1/3 tools showing only "qa-24-tool". Name search works.

### TC-TOOL-004 — SKIP
**Action:** Select agent from list to show checkboxes per tool
**Reason:** The implementation uses an Agent Permission Matrix (all agents × all tools visible at once). There is no "select one agent" flow — checkboxes are always shown. TC spec described a different UI paradigm. Functionality exists but design differs from spec.

### TC-TOOL-005 — PASS
**Action:** Check unchecked tool checkbox (QA-TEST-agents × e2e-tool)
**Result:** Checkbox became checked, "변경사항 1건" counter appeared in both top bar and sticky bottom bar. Save button (저장) appeared.

### TC-TOOL-006 — PASS
**Action:** Uncheck the same checkbox
**Result:** Checkbox unchecked, counter disappeared (changeCount=0), Save bar hidden. Correct undo behavior.

### TC-TOOL-007 — SKIP
**Action:** Category checkbox (select all in category)
**Reason:** No per-category select-all checkbox exists in the Permission Matrix column headers. `toggleCategory()` is defined in code (line 100) but not rendered in UI. Feature not exposed.

### TC-TOOL-008 — SKIP
**Action:** Category checkbox (deselect all)
**Reason:** Same as TC-TOOL-007 — feature not exposed in UI.

### TC-TOOL-009 — PASS
**Action:** Add pending change → click "저장"
**Result:** PATCH `/admin/agents/{id}/allowed-tools` called, toast "도구 권한이 저장되었습니다", pendingChanges cleared, checkbox state persisted (QA-TEST-agents now has e2e-tool checked).

### TC-TOOL-010 — PASS
**Action:** Observe Save button with 0 changes
**Result:** Save bar / 저장 button is hidden (not shown) when `changeCount === 0`. Effectively disabled as specified. Note: hides completely rather than showing disabled state.

### TC-TOOL-011 — PASS
**Action:** Observe pending changes counter
**Result:** Counter shows "변경사항 N건" accurately — increments on check, decrements on uncheck, disappears at 0. Correct tracking.

### TC-TOOL-012 — PASS
**Action:** Click "Register Tool" button
**Result:** Modal "새 도구 추가" opened with: 도구명 (name), 설명 (description), 카테고리 dropdown (Common/Finance/Legal/Marketing/Tech), 취소/추가 buttons. Form is well-formed.

---

## Bugs Found

| Bug ID | Severity | TC | Description |
|--------|----------|----|-------------|
| BUG-C34-B3-001 | HIGH | TC-AGENT-006 | Worker tier `defaultModel` is `'gemini-2.5-flash'` which is not in MODEL_OPTIONS. Creates agents with invalid Gemini model. Fix: `packages/admin/src/pages/agents.tsx` line 48 → change to `'claude-haiku-4-5'` |
| BUG-C34-B3-002 | HIGH | TC-AGENT-011 | Tier filter dropdown has no effect — `filteredAgents` only filters by `search`. Tier and status filter states not declared or wired. Fix: Add `filterTier`/`filterStatus` states and apply to `filteredAgents` useMemo. |
| BUG-C34-B3-003 | HIGH | TC-AGENT-012 | Status filter dropdown has no effect — same root cause as BUG-C34-B3-002. |

---

## Screenshots
- `agents-loaded.png` — /admin/agents initial load
- `agents-status-tier.png` — Status/Tier badge rendering in table
- `tools-loaded.png` — /admin/tools Tool Registry
- `tools-register.png` — Register Tool modal
