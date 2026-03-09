# 20. Tools (도구 관리) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Tool Management** page in the Admin app. Administrators use this page to view the complete catalog of available tools (functions that AI agents can call) and manage which agents have permission to use which tools. Tools are organized by category and permissions are managed via an interactive matrix of agents × tools.

### Data Displayed — In Detail

**Page header:**
- Title: "도구 관리"
- Subtitle: total tool count and agent count, e.g. "42개 도구 · 12개 에이전트"
- Pending changes indicator: when permissions have been modified but not yet saved, show a count of pending changes (e.g. "변경사항 8건") with Save and Cancel buttons

**Category filter tabs (segmented control):**
- "전체" tab showing total tool count
- One tab per tool category, each showing its tool count:
  - Common, Finance, Legal, Marketing, Tech
- Categories with zero tools are hidden
- Selecting a category filters both the catalog table and the permission matrix columns

**Tool Catalog table:**
- **Name** (이름): Tool's identifier in monospace font, e.g. "search_web", "create_document"
- **Category** (카테고리): Displayed as a visually distinct indicator per category
- **Description** (설명): Brief description of what the tool does, truncated if too long
- **Status** (상태): A small indicator showing whether the tool is registered (active) or not

**Agent Permission Matrix (below the catalog):**
This is the core feature of the page — a grid/matrix showing all agents on the vertical axis and all tools (filtered by active category) on the horizontal axis.

- **Row headers (agents):**
  - Agent name
  - Tier abbreviation in parentheses (M for Manager, S for Specialist, W for Worker)
  - Modified indicator: a small dot appears next to agents whose permissions have been changed but not saved

- **Category batch toggle columns** (one per visible category):
  - A toggle button per agent that selects/deselects all tools in that category at once
  - Three states: all enabled (filled), some enabled (partial/indeterminate), none enabled (empty)

- **Individual tool checkboxes:**
  - One checkbox per agent-tool combination
  - Tool names in column headers need to fit many columns in limited space (names truncated if long)

- **Modified row highlight**: Rows with pending changes get a subtle background highlight

**Sticky save bar (bottom of page):**
- Appears only when there are pending changes
- Shows change count
- Cancel and Save buttons
- Mirrors the header save controls for accessibility when scrolled down

### User Actions

1. **Browse the tool catalog** to see all available tools and their categories
2. **Filter by category** to focus on specific tool types
3. **Toggle individual tool permissions** for any agent by clicking checkboxes in the matrix
4. **Batch toggle an entire category** for an agent — one click to enable/disable all tools in a category
5. **Review pending changes** — see the count of unsaved modifications and which agents are affected
6. **Save changes** — commits all pending permission changes to the server in parallel (one API call per modified agent)
7. **Cancel changes** — discards all pending modifications and reverts to the last saved state

### UX Considerations

- **The permission matrix is the centerpiece**: This is a complex data grid. It needs horizontal scrolling support since there may be many tools. The agent name column should be sticky (fixed on the left) while scrolling horizontally.
- **Batch operations save time**: Category toggle buttons let admins quickly assign all finance tools to a finance agent, for example. The three-state indicator (all/some/none) gives clear feedback.
- **Unsaved changes awareness**: The change count and highlighted rows make it clear that changes haven't been saved yet. This prevents accidental data loss.
- **Save bar duplication**: Both top and bottom save controls exist because the matrix can be tall. Wherever the user is scrolled, they should see the save option.
- **Empty states**: Different messages for no tools registered vs. no agents. If no tools exist, prompt the admin that tool definitions need to be registered first.
- **Company selection prerequisite**: Requires a selected company. Show "회사를 선택하세요" if none selected.
- **Loading state**: Show loading indicator while both tool catalog and agent data are being fetched.
- **Korean language**: All UI text in Korean.
- **Mobile**: The matrix is inherently wide. On mobile, horizontal scroll is essential. Consider a simplified view or filter-by-agent mode for small screens.

### What NOT to Include on This Page

- No tool creation or editing — tools are defined in the system, not by admins
- No tool execution or testing
- No tool usage analytics or statistics
- No per-agent tool usage history
- No custom tool definition or plugin system
