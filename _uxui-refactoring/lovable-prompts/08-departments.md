# 08. Departments (부서 관리) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Department Management** page in the Admin app. Administrators use this page to create, edit, and delete departments (organizational units) within their company. Departments are containers for AI agents — every agent can be assigned to one department. This page also features a **cascade deletion wizard** that shows the full impact of removing a department before it happens.

### Data Displayed — In Detail

**Department list (table view):**
- **Name** (부서명): The department's display name, e.g. "마케팅부", "투자전략부", "기술부". Max 100 characters.
- **Description** (설명): A short text describing the department's purpose and role. Shown as secondary text, or "-" if empty.
- **Agent count** (에이전트): The number of AI agents currently assigned to this department. Displayed as a numeric badge.
- **Status** (상태): Either "활성" (active) or "비활성" (inactive), based on the `isActive` field.
- **Department count**: Header shows total count (e.g. "5개 부서").

**Inline editing**: When the admin clicks "수정" on a department, that table row transforms into an editable state with input fields for name and description, plus Save/Cancel buttons — all within the same row.

**Create form (inline, toggled by button):**
- Department name (required, max 100 characters)
- Description (optional)

**Cascade deletion wizard (modal):**
When the admin clicks "삭제" on a department, a modal opens that performs a real-time impact analysis before deletion. It shows:

1. **Impact summary** (4 metric cards):
   - 소속 에이전트: number of agents in this department
   - 진행 중 작업: number of active tasks being processed
   - 학습 기록: number of knowledge/memory records
   - 누적 비용: total cost accumulated (displayed in USD, e.g. "$12.50")

2. **Agent breakdown**: A scrollable list of affected agents showing:
   - Agent name
   - Tier (Manager/Specialist/Worker)
   - System agent indicator if applicable
   - Active task count per agent

3. **Deletion mode selector** (two options):
   - **완료 대기 (권장)**: Wait for in-progress tasks to finish, then delete. Agents are reassigned to unassigned status.
   - **강제 종료**: Immediately terminate all in-progress tasks and delete.

4. **Preservation notice**:
   - Knowledge records are archived (not destroyed)
   - Cost records are permanently preserved (accounting compliance)
   - Agents become unassigned (not deleted)

### User Actions

1. **Create a new department** with a name and optional description
2. **Inline edit** a department's name and description (click 수정 → edit in row → save)
3. **Delete a department** via the cascade wizard:
   - View impact analysis (agent count, tasks, knowledge, costs)
   - Review affected agents list
   - Choose deletion mode (wait or force)
   - Confirm deletion
4. **Cancel deletion** at any point in the wizard

### UX Considerations

- **Cascade wizard is critical**: Deleting a department is a high-impact action. The impact analysis must load first (with a loading state "영향 분석 중...") before the admin can proceed. The wizard prevents accidental data loss. If the impact analysis fails to load, the modal should close and show an error message.
- **Inline editing pattern**: Editing happens directly in the table row — no separate modal or panel. This makes quick edits efficient.
- **Empty state**: When no departments exist, show a message "등록된 부서가 없습니다" with a create button.
- **Loading state**: Show a loading indicator while department data is being fetched.
- **Company selection prerequisite**: This page requires a company to be selected first. If no company is selected, show "회사를 선택하세요".
- **Success/error feedback**: All create, update, and delete operations should show feedback to the user.
- **Korean language**: All labels, buttons, and messages should be in Korean.
- **Mobile**: The table should remain usable on small screens. The cascade modal should be responsive.

### What NOT to Include on This Page

- No agent management — that's the Agents page
- No department hierarchy or parent-child relationships (departments are flat)
- No department budgets or cost limits — that's the Costs page
- No knowledge base browsing — that's the Knowledge Base page
- No drag-and-drop reordering of departments
- No department-level permissions or access control settings
