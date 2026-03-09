# 07. Agents (AI 직원 관리) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Agent Management** page in the Admin app. Administrators use this page to create, view, edit, and deactivate AI employees (agents) within their company. Each agent has a name, role description, hierarchical tier, assigned LLM model, department assignment, personality definition ("Soul"), and allowed tools. This is one of the most important admin pages because the entire virtual company runs on these agents.

### Data Displayed — In Detail

**Agent list (table view):**
- **Name** (에이전트 이름): The agent's display name, e.g. "마케팅 매니저". Below the name, the role description is shown as secondary text if present.
- **Tier** (계급): One of three values — Manager (팀 리더), Specialist (전문가), Worker (반복 작업). Displayed as a label.
- **Model** (LLM 모델): The AI model assigned to this agent. Values include: Claude Sonnet 4.6, Claude Haiku 4.5, GPT-4.1, GPT-4.1 Mini, Gemini 2.5 Pro, Gemini 2.5 Flash.
- **Department** (소속 부서): The department this agent belongs to, or "미배정" if unassigned.
- **Status** (상태): One of four values — 유휴 (online/idle), 작업중 (working), 에러 (error), 오프라인 (offline). Each status needs a visually distinct indicator.
- **Secretary flag**: Some agents are marked as `isSecretary = true` — these serve as the company's secretary/Chief of Staff for command routing. This data point is available for display.
- **System badge**: Some agents are marked `isSystem = true` — these are essential for orchestration and cannot be deleted. They should be visually distinguishable from regular agents with a "시스템" indicator.
- **Inactive badge**: Deactivated agents (`isActive = false`) show a "비활성" badge.
- **Agent count**: Header shows total count (e.g. "12개 에이전트") and filtered count if filters are active (e.g. "5개 표시").

**Filters (above the table):**
- Text search by agent name
- Department dropdown (populated from departments list)
- Tier dropdown (Manager / Specialist / Worker)
- Status dropdown (유휴 / 작업중 / 에러 / 오프라인)

**Create form (inline, toggled by button):**
- Name (required, max 100 characters)
- Role description (optional, max 200 characters)
- Tier selector with recommended defaults: Manager → Claude Sonnet 4.6, Specialist → Claude Haiku 4.5, Worker → Gemini 2.5 Flash. Changing tier auto-updates the model selection.
- LLM model selector (6 options listed above)
- Department assignment dropdown (optional, "미배정" default)
- Soul template selector: a dropdown that loads from saved Soul Templates and populates the soul textarea when selected
- Soul textarea: free-text markdown defining the agent's personality and behavior

**Detail panel (opens when clicking an agent row):**
Slides in from the right side as a panel overlay. Three tabs:
1. **기본 정보 (Info)**: Editable fields — name, role, tier (with auto-model update), model, department. Save button at bottom.
2. **Soul 편집 (Soul Editor)**: Split view — left side is a markdown text editor, right side is a live rendered preview of the markdown. Also has a Soul Template dropdown to load templates. Save button.
3. **도구 권한 (Tool Permissions)**: Currently shows a placeholder message "도구 관리 기능은 준비 중입니다" and lists currently allowed tools as tags/chips. (This tab has limited functionality for now.)

**Deactivation confirmation modal:**
- Shows agent name
- Warns: agent goes to unassigned status, memories get archived, cost records preserved
- Cancel and Confirm buttons

### User Actions

1. **Search & filter** agents by name, department, tier, status
2. **Create a new agent** with name, role, tier, model, department, and soul (with template support)
3. **Click any agent row** to open the detail panel
4. **Edit agent info** (name, role, tier, model, department) and save
5. **Edit agent Soul** using markdown editor with live preview, optionally loading from templates
6. **View allowed tools** for an agent (read-only for now)
7. **Deactivate an agent** (soft delete) — system agents cannot be deactivated
8. **Close the detail panel** by clicking the backdrop or the X button

### UX Considerations

- **System agents need protection**: System agents (isSystem=true) should be clearly marked and their deactivation button must be hidden. These are essential for the platform's orchestration.
- **Tier-Model coupling**: When the user changes an agent's tier, the model should auto-update to the recommended default for that tier. This is a convenience behavior — the user can still manually change the model afterward.
- **Soul editing is a core feature**: The soul defines how the AI agent behaves. The markdown editor with live preview is essential — users need to see how their formatting renders. The template dropdown is important for quick setup.
- **Empty state**: When no agents exist, show an encouraging empty state with the create button.
- **Filter empty state**: When filters match nothing, show "필터 조건에 맞는 에이전트가 없습니다" — different from having zero agents total.
- **Loading state**: Show a loading indicator while agent data is being fetched.
- **The detail panel is full-height** and appears on the right side of the screen, overlaying content with a backdrop.
- **Korean language**: All labels, placeholders, button text, and status labels should be in Korean.
- **Company selection prerequisite**: This page requires a company to be selected first. If no company is selected, show a message "회사를 선택하세요" prompting the user to select one from the admin header.
- **Success/error feedback**: All create, update, and deactivate operations should show feedback (success or error) to the user via toast notifications or inline messages.
- **Mobile**: On mobile, the detail panel should take full screen width. The table should be horizontally scrollable or switch to a card layout.

### What NOT to Include on This Page

- No agent chat or conversation history — that's in the CEO app
- No cost/billing information per agent — that's the Costs page
- No report-to / org chart hierarchy — that's the Org Chart / Report Lines page
- No tool configuration or tool creation — that's the Tools page
- No bulk import/export of agents
- No agent performance metrics or analytics
