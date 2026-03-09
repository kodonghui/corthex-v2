# 19. Workflows (워크플로우 관리) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Workflow Management** page in the Admin app. Administrators use this page to create, edit, execute, and manage automated multi-step workflows. A workflow is a DAG (Directed Acyclic Graph) of steps — each step is either a Tool call, an LLM call, or a Condition (branching logic). Workflows can be executed on-demand and their execution history is tracked. The system can also analyze usage patterns and suggest new workflows automatically.

### Data Displayed — In Detail

**Workflow list (main view, tab "워크플로우"):**
- **Name** (워크플로우 이름): The workflow's display name, e.g. "일일 리포트 생성 파이프라인"
- **Description** (설명): Optional description text shown below the name
- **Active status** (상태): Active (활성) or Inactive (비활성), visually distinct
- **Step count**: Number of steps in the workflow, e.g. "5개 스텝"
- **Created date** (생성일): Displayed in Korean locale format
- **Mini DAG preview**: Inline horizontal chain showing each step's action name with its type indicated (Tool / LLM / Condition), connected by arrows. Each type has a distinct visual treatment.
- **Workflow count**: Header shows total count

**Suggestions tab (탭 "제안"):**
- **Reason** (제안 이유): Why this workflow was suggested based on pattern analysis
- **Suggested steps**: Mini DAG preview same as workflow list
- **Status**: Pending suggestions can be accepted or rejected
- **Suggestion count**: Tab shows count of pending suggestions

**Workflow Editor (full-page, replaces list view):**
Two editing modes toggled by a segmented control:
1. **Canvas mode (캔버스)**: Interactive visual DAG editor
   - Nodes representing steps, each step type (Tool, LLM, Condition) should be visually distinguishable
   - Drag nodes to reposition them
   - Drag from output handles to input handles to create edges (dependency connections)
   - Condition nodes have two output handles: True and False branches, visually distinct from each other and from regular dependency edges
   - Click an edge to delete it
   - Cycle detection: if connecting two nodes would create a cycle, show a warning and prevent the connection
   - Side panel appears when a node is selected, showing editable fields: name, type, action, system prompt (LLM only), timeout, retry count
   - Toolbar: Add node, Auto-layout, JSON editor toggle, Save button
   - Double-click empty canvas area to add a new node at that position
   - Pan by dragging empty canvas, zoom with mouse wheel
   - JSON editor: toggle a raw JSON textarea to directly edit the steps array

2. **Form mode (폼)**: Traditional form-based step builder
   - DAG Preview: visual representation of step ordering with parallel detection
   - Ordered list of step forms, each containing:
     - Step number, type badge (Tool/LLM/Condition)
     - Name field (required)
     - Type selector (Tool / LLM / Condition)
     - Action field (required)
     - Type-specific fields: System prompt for LLM, True/False branch selectors for Condition
     - DependsOn selector: toggle buttons for each other step
     - Timeout (ms) and Retry count fields
     - Move up/down buttons, remove button
   - Add step button
   - Cycle detection warning in DAG preview

- **Workflow name** (required) and **description** (optional) are always visible above the editor

**Execution History (full-page, replaces list view):**
- **Workflow name** shown as subtitle
- **Execute now button**: Trigger immediate execution
- **Execution list**: Each entry shows:
  - Status badge: 성공 (success) or 실패 (failed), visually distinct
  - Step count: "N개 스텝"
  - Duration: total time in seconds
  - Timestamp: Korean locale datetime
  - Step status mini-bar: horizontal bar of segments, one per step — visually distinguishing completed, failed, and other states

**Execution Detail (full-page, drills down from execution list):**
- Summary card: overall status badge, total duration, timestamp
- Step results list: each step shows:
  - Step number, status badge (완료/실패/other)
  - Step name
  - Duration (seconds or milliseconds)
  - Error message (if failed): shown in a monospace error box
  - Output (if available): shown in a scrollable monospace box, JSON-formatted if object

### User Actions

1. **View workflow list** with active/inactive status and mini DAG previews
2. **Create a new workflow** with name, description, and multi-step DAG
3. **Edit an existing workflow** — opens the full editor with canvas or form mode
4. **Delete a workflow** with confirmation dialog
5. **Execute a workflow** directly from the list or from execution history view
6. **View execution history** for any workflow
7. **Drill into execution details** to see per-step results, outputs, and errors
8. **Run pattern analysis** to auto-detect repeating patterns and generate suggestions
9. **Accept or reject** workflow suggestions
10. **Switch between canvas and form** editing modes
11. **Canvas interactions**: drag nodes, connect edges, auto-layout, pan, zoom, JSON edit
12. **Navigate back** from editor/history/detail views to the workflow list

### UX Considerations

- **Canvas editor is the primary editing mode**: Most users will prefer the visual DAG builder. The form mode is an alternative for accessibility or when precise control over step ordering is needed.
- **Cycle detection must be clear**: When a user tries to create a circular dependency (A→B→C→A), the system should prevent it and show a clear warning message. This is critical for workflow integrity.
- **Mini DAG in the list is at-a-glance info**: The inline step chain in the workflow list gives users immediate understanding of what each workflow does without opening the editor.
- **Execution status needs visual weight**: Success/failure of workflow executions is critical information. Use strong visual indicators. The step mini-bar gives instant per-step success/failure overview.
- **Pattern analysis is AI-powered**: The "패턴 분석" button triggers server-side analysis. It should show a loading state and report results (patterns found, suggestions created).
- **Three-level navigation**: List → Editor or History → Execution Detail. Each level replaces the previous view with a back button. This is a full-page navigation pattern, not a modal.
- **Company selection prerequisite**: Requires a selected company. Show "회사를 선택해주세요" if none selected.
- **Empty states**: Different messages for no workflows vs. no suggestions vs. no execution history.
- **Korean language**: All labels, buttons, placeholders, status text in Korean.
- **Mobile**: Canvas editor should still be functional on tablet but may not be ideal on phone. Form mode should be the mobile fallback. Execution history and detail views should be fully responsive.

### What NOT to Include on This Page

- No cron/schedule management — that's handled separately
- No ARGOS trigger configuration
- No real-time workflow execution monitoring (live streaming of step progress)
- No workflow versioning or rollback
- No workflow import/export
- No workflow templates marketplace
