# 27. Org Chart — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

The Org Chart page (조직도) is a read-only view of the CEO's AI organization — showing the company, its departments, and all AI agents organized in a hierarchical tree structure. The CEO can see at a glance how their AI company is organized, which agents belong to which departments, and each agent's current status.

This is NOT an editable org chart — editing departments and agents is done in the Admin app. This page is purely for visualization and quick reference.

---

### Data Displayed — In Detail

**1. Page Title**
- "조직도" heading

**2. Company Root Node (top of tree)**
- Company name with a branded initial badge
- Summary counts: number of departments, total number of agents

**3. Department Sections (indented below company)**
- Each department appears as an expandable/collapsible section
- Shows:
  - Department name
  - Department description (truncated, hidden on mobile)
  - Agent count badge
  - Expand/collapse toggle
- When expanded, shows all agents in that department as a list below, connected by a vertical line

**4. Agent Nodes (within each department)**
- Each agent appears as a clickable row showing:
  - Status indicator (online/working/error/offline, with animated pulse for "working" state)
  - Agent name
  - Tier badge (Manager, Specialist, or Worker)
  - System badge (if the agent is a system-required agent)
- Clicking an agent opens the detail panel

**5. Unassigned Agents Section (at bottom)**
- Shows agents not belonging to any department, grouped under a "미배속" (Unassigned) header
- Same visual treatment as department sections but with a distinct warning-style header
- Only appears when unassigned agents exist

**6. Agent Detail Panel (slide-in from right)**
- Opens when an agent is clicked anywhere in the tree
- Displays read-only agent information:
  - Agent name
  - Tier badge (Manager/Specialist/Worker) with status indicator
  - Model name (e.g., "claude-sonnet-4-20250514")
  - Role description
  - System agent warning (if applicable)
  - Soul/personality description (truncated to 200 characters with ellipsis)
  - Allowed tools list (tool names as small tags)
- Close button, also dismisses on Escape key or clicking the backdrop overlay
- Panel slides in from the right side

**7. States**
- **Loading state**: Skeleton layout mimicking the tree structure
- **Error state**: Error message with a "다시 시도" (Retry) button
- **Empty state**: Message saying the organization hasn't been set up yet, with guidance to contact admin

---

### User Actions

**Primary:**
1. **View organization structure** — see the hierarchical tree of company → departments → agents
2. **Check agent status** — see which agents are online, working, in error, or offline
3. **View agent details** — click any agent to see their full information in the side panel

**Secondary:**
4. **Expand/collapse departments** — toggle department sections to focus on specific teams
5. **Close detail panel** — dismiss with close button, Escape key, or backdrop click

---

### UX Considerations

- **Read-only clarity**: This page does not allow editing. The CEO should never feel like they can drag agents between departments or rename things here. The detail panel is informational only.
- **Hierarchical visualization**: The tree structure uses indentation and connecting lines to show the relationship: Company → Department → Agent. This should feel like a real org chart, not a flat list.
- **Status visibility**: Agent status indicators are the most important visual element. The CEO should be able to scan the entire org chart and immediately see which agents are active, which are working, and which have errors.
- **Department expandability**: All departments start expanded. The CEO can collapse ones they don't need to see, useful when the organization has many departments.
- **Unassigned agents prominence**: Unassigned agents section uses a distinct visual treatment to indicate these agents need attention — they should be assigned to a department.
- **Soul/personality preview**: The detail panel shows only a preview of the agent's personality prompt (200 chars). Full editing is in Admin. This gives the CEO a quick sense of each agent's character.
- **Mobile responsiveness**: The tree indentation should be reduced on mobile. The detail panel should take full width on small screens rather than sliding in from the side.
- **Loading and error recovery**: Loading shows skeleton tree. Error shows a clear retry option. These states should not confuse the CEO about the page's purpose.

---

### What NOT to Include on This Page

- No agent creation, editing, or deletion (that's Admin → Agents)
- No department management (that's Admin → Departments)
- No interactive canvas or drag-and-drop (that's Nexus/SketchVibe)
- No chat or command execution (that's Chat/Command Center)
- No performance metrics or cost data (that's Performance/Costs pages)
