# 32. Org Chart (조직도) — Admin App

> **Route**: `/org-chart`
> **App**: Admin App (`app.corthex-hq.com/admin`)

---

## 복사할 프롬프트:

Design the **Org Chart (조직도)** page for the Admin App. This page visualizes the company's AI organization as a hierarchical tree and allows admins to inspect and reorganize agents.

---

### Page Purpose

The admin needs to:
1. See the full organizational structure at a glance: company → departments → agents
2. Quickly understand each department's size and each agent's status/role
3. Click any agent to see details and move them between departments
4. Navigate to the org templates page when the organization is empty

---

### Page Structure

**Company Root Node**
At the top, a prominent card represents the company:
- Company initial (first character of name) in a colored square
- Company name
- Summary stats: "N개 부서 · M명 에이전트"

**Department Sections**
Below the company node, each department is shown as an expandable/collapsible section indented from the root:
- Department name (clickable to toggle expand/collapse)
- Department description (truncated, shown alongside name on larger screens)
- Agent count badge on the right
- When expanded: a vertical tree line connects to the agent list below, further indented
- When collapsed: agents are hidden
- If department has no agents: shows "에이전트 없음" placeholder

**Agent Nodes**
Each agent in a department shows:
- Status indicator dot: green (online), blue with pulse animation (working), red (error), gray (offline)
- Agent name (truncated if long)
- Tier badge: Manager, Specialist, or Worker (each with distinct visual style)
- System badge: "🔒 시스템" shown for system-required agents

Clicking an agent opens the detail panel.

**Unassigned Agents Section**
If there are agents not assigned to any department:
- Shown as a separate section with amber/warning styling
- Header: "미배속" with subtext "부서를 지정하세요" and count badge
- Same agent node format as department agents

**Empty State**
When no departments and no agents exist:
- Message: "아직 조직이 구성되지 않았습니다."
- CTA button: "템플릿으로 시작하세요" — navigates to `/org-templates`

---

### Agent Detail Panel

A slide-in panel from the right side (covers part of the page with a semi-transparent backdrop):
- Closeable via X button or pressing Escape key
- Backdrop click also closes the panel

**Panel Content:**
- Agent name (header)
- Tier badge + status indicator with label (e.g., "Manager · 온라인")
- 모델 (Model): shows the LLM model name in monospace
- 역할 (Role): agent's role description (if set)
- **부서 이동 (Department Move)**: dropdown selector with all departments plus "미배속" option, and an "이동" button. Button is disabled when the selection hasn't changed. After successful move, the org chart refreshes and the panel closes
- System badge warning: "🔒 시스템 필수 에이전트" (if applicable)
- Soul preview: first 200 characters of the agent's system prompt in a muted preformatted block
- 허용 도구 (Allowed Tools): list of tool name chips with count header (e.g., "허용 도구 (12)")

---

### Prerequisites

- A company must be selected in the admin sidebar before this page shows data
- If no company is selected: "사이드바에서 회사를 선택해주세요."

---

### Data & States

- Loading: skeleton placeholder showing company node + 2 department sections with 3 agent skeletons each
- Error: "조직도를 불러올 수 없습니다." with "다시 시도" retry button
- The page does not auto-refresh — data is fetched on mount and after mutations (agent move)

---

### UX Considerations

- The tree layout should clearly communicate hierarchy: company → department → agent, using indentation and connecting lines
- Department sections default to expanded so the admin sees everything on first load
- The agent detail panel should be fast to open and close — this is an inspection + quick-action tool, not a full editor
- Department move is the primary action available from this page. It should feel quick and confident (immediate feedback on success)
- Agent status dots should be immediately recognizable — the working state's pulse animation draws attention to active agents
- Tier badges create quick visual scanning — managers stand out from specialists and workers
- On mobile: the detail panel should slide in full-width; the tree should collapse to a narrower indent
- The unassigned agents section should feel like a "to-do" — something the admin should resolve
- The empty state with CTA to templates creates a natural onboarding flow
