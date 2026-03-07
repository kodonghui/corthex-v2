# Story 2.5: Org Tree View UI (Admin)

Status: done

## Story

As a company admin (company_admin or super_admin),
I want to see the organization structure as a tree view with department > Manager > Specialist/Worker hierarchy and real-time agent status badges,
so that I can understand the current organization at a glance and navigate to agent details.

## Acceptance Criteria

1. Tree view displays departments with nested agents grouped by tier: Manager at top, then Specialist, then Worker
2. Each agent node shows: name, tier badge (Manager/Specialist/Worker), status indicator (idle=green, working=blue pulse, error=red)
3. Unassigned agents (departmentId=null) shown in a separate "Unassigned" section at the bottom with amber styling
4. Clicking an agent opens a detail side panel showing: name, tier, modelName, status, soulMarkdown summary, allowedTools list
5. Empty state: "No organization configured yet. Start with a template!" with a link/button to org-templates page
6. Loading state: skeleton placeholders (2 department skeletons with 3 agent skeletons each)
7. Error state: "Failed to load organization" with a retry button
8. Agent count badge per department header
9. System agents (isSystem=true) show a lock icon and "System" label
10. Collapsible department sections (expanded by default)
11. Server API returns agents with tier field so UI can group/sort by tier
12. Company root node at the top showing company name and total counts

## Tasks / Subtasks

- [x] Task 1: Enhance org-chart API to include tier, modelName, isSystem, soul, allowedTools fields (AC: #11)
  - [x] 1.1 Update agent select fields in org-chart.ts route to include tier, modelName, isSystem, soul, allowedTools
  - [x] 1.2 Sort agents within each department by tier order: manager > specialist > worker
- [x] Task 2: Rewrite org-chart.tsx page with full tree view (AC: #1, #2, #3, #9, #10, #12)
  - [x] 2.1 Create AgentNode component with tier badge, status indicator, system lock icon
  - [x] 2.2 Create DepartmentSection component with collapsible header, agent count, nested agents sorted by tier
  - [x] 2.3 Create UnassignedSection for unassigned agents with amber styling
  - [x] 2.4 Create CompanyRootNode showing company name + total dept/agent counts
  - [x] 2.5 Render full tree: CompanyRoot > Departments > Agents + Unassigned section
- [x] Task 3: Agent detail side panel (AC: #4)
  - [x] 3.1 Create AgentDetailPanel component showing name, tier, model, status, soul summary (first 200 chars), allowed tools as badges
  - [x] 3.2 Slide-in from right, close on click outside or Escape key
  - [x] 3.3 Wire click handler on AgentNode to open panel
- [x] Task 4: State handling (AC: #5, #6, #7)
  - [x] 4.1 Loading skeleton: 2 department blocks with 3 agent placeholder lines each
  - [x] 4.2 Empty state with message "아직 조직이 구성되지 않았습니다. 템플릿으로 시작해 보세요!"
  - [x] 4.3 Error state with retry button calling refetch()
- [x] Task 5: Unit tests for API enhancement (AC: #11)
  - [x] 5.1 Test org-chart endpoint returns tier, modelName, isSystem, soul, allowedTools fields
  - [x] 5.2 Test agents are sorted by tier within departments (7 tier-sorting tests)
  - [x] 5.3 Test unassigned agents section + new system agent fields (6 tests)

## Dev Notes

### Existing Code (MUST build on, NOT rewrite from scratch)

**Server API** (`packages/server/src/routes/admin/org-chart.ts`):
- Already exists and works. Returns `{ data: { company, departments[], unassignedAgents[] } }`
- Currently selects: id, name, role, departmentId, status, isSecretary
- MODIFY: Add tier, modelName, isSystem, soulMarkdown, allowedTools to the select
- MODIFY: Sort agents by tier order within each department (manager first, then specialist, then worker)

**Admin Page** (`packages/admin/src/pages/org-chart.tsx`):
- Already exists with basic tree view. Has AgentNode, DepartmentNode, OrgChartPage components
- REWRITE: Enhance with tier badges, status pulse animation, system lock, detail panel, proper states
- Keep the same query key pattern: `['org-chart', selectedCompanyId]`
- Keep using `useAdminStore` for selectedCompanyId
- Keep using `@tanstack/react-query` for data fetching

**UI Components** (`packages/ui/`):
- Already available: Card, CardContent, Skeleton from @corthex/ui
- Use Tailwind CSS for styling (already configured in admin app)
- No need for dnd-kit in this story (drag-and-drop is Story 2-8)

**App Router** (`packages/admin/src/App.tsx`):
- Already has `/org-chart` route registered with lazy loading
- NO CHANGES needed

**Sidebar** (`packages/admin/src/components/sidebar.tsx`):
- Already has "조직도" nav item pointing to `/org-chart`
- NO CHANGES needed

### Architecture Compliance

**DB Schema** (`packages/server/src/db/schema.ts`):
- agents table has: tier (enum: manager/specialist/worker), modelName, isSystem, soulMarkdown (text), allowedTools (jsonb), status (enum: online/working/error/offline)
- agentStatusEnum: 'online', 'working', 'error', 'offline'
- agentTierEnum: 'manager', 'specialist', 'worker'

**UX Design Requirements** (from ux-design-specification.md):
- OrgTree component: departments[] prop, editable boolean, onAgentMove callback, highlightAgentId
- OrgTreeNode: avatar + name + tier badge + status indicator, drag (Story 2-8), click -> detail panel, right-click context menu (Phase 2)
- Status badges: idle(green) / working(blue, pulse) / error(red)
- System agents: lock icon + "System required" label, delete button disabled
- Unassigned agents: bottom section, gray/amber background, "Assign a department" guide
- Empty state: "No organization yet. Start with a template!" + CTA button
- Loading: 2 department skeletons + 3 agent skeletons each
- Error: "Failed to load org chart" + retry button

**API Response Pattern:**
- `{ success: true, data: {...} }` -- BUT existing org-chart route uses `{ data: {...} }` without success wrapper
- Keep existing pattern for backward compatibility

### Tier Badge Colors

| Tier | Badge Color | Label |
|------|-------------|-------|
| manager | indigo/purple bg | Manager |
| specialist | blue bg | Specialist |
| worker | gray bg | Worker |

### Status Indicator Colors

| Status | Color | Animation |
|--------|-------|-----------|
| online | green (#22C55E) | solid dot |
| working | blue (#3B82F6) | pulse animation |
| error | red (#EF4444) | solid dot |
| offline | gray (#9CA3AF) | solid dot |

### Anti-Patterns to Avoid

- Do NOT install dnd-kit or any drag library (that's Story 2-8)
- Do NOT install Cytoscape.js (that's Phase 2)
- Do NOT create new route files -- modify existing org-chart.ts
- Do NOT change the API URL path (/admin/org-chart)
- Do NOT remove dark mode support (existing code has it)
- Do NOT use emojis in code (existing code uses them in sidebar only)
- Do NOT add WebSocket real-time updates (that's a later story)
- Do NOT add right-click context menu (Phase 2)
- Do NOT add search/filter functionality (not in this story's scope)
- Do NOT create separate component files in packages/ui -- keep components inline in org-chart.tsx
- Do NOT change sidebar.tsx or App.tsx -- they already work

### Testing Approach

Test file: `packages/server/src/__tests__/unit/org-chart.test.ts`

Key test scenarios:
1. GET /admin/org-chart returns tier, modelName, isSystem for each agent
2. Agents within departments are sorted by tier (manager -> specialist -> worker)
3. Unassigned agents returned separately
4. Company info included in response
5. Requires authentication (401 without token)
6. Requires admin role (403 for non-admin)
7. Returns 400 without companyId parameter
8. Returns 404 for non-existent company
9. Only active departments returned (isActive=true)
10. Only active agents returned (isActive=true)

### Project Structure Notes

- Server route: `packages/server/src/routes/admin/org-chart.ts` (MODIFY -- add fields + sorting)
- Admin page: `packages/admin/src/pages/org-chart.tsx` (REWRITE -- enhanced tree view + detail panel)
- Test file: `packages/server/src/__tests__/unit/org-chart.test.ts` (NEW)
- No new files needed in packages/ui (inline components in page)
- No changes to App.tsx or sidebar.tsx

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E2-S5] -- Story definition
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#11.1.4] -- OrgTree component spec
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#step-06] -- OrgTreeNode spec
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#12.4.1] -- Drag-and-drop (NOT this story)
- [Source: packages/server/src/routes/admin/org-chart.ts] -- Existing API route
- [Source: packages/admin/src/pages/org-chart.tsx] -- Existing UI page
- [Source: packages/server/src/db/schema.ts#agents] -- Agent table with tier, modelName, isSystem, status fields

### Previous Story Intelligence (Story 2-4)

Key patterns from Story 2-4 (Org Template Apply API):
- Service functions return `{ data: ... }` or `{ error: { status, message, code } }` pattern
- Route files use authMiddleware + adminOnly
- Tests mock DB operations
- Organization service in `packages/server/src/services/organization.ts` handles all org operations
- Audit log integration for mutations (not needed for read-only tree view)
- Commit pattern: `feat: Story 2-4 Org template apply API -- bulk create + merge strategy, 107 tests`

### Git Intelligence

Recent commits show:
- Story 3-4: AgentRunner (85 tests), Story 2-4: Org template (107 tests)
- Established test count baseline: 85-111 tests per story
- All stories extend existing files rather than creating new service files
- Admin routes follow consistent pattern: authMiddleware + adminOnly + query parameter for companyId

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Enhanced org-chart API route to return tier, modelName, isSystem, soul, allowedTools for each agent
- Added tier-based sorting (manager > specialist > worker) within each department
- Rewrote org-chart.tsx with: AgentNode (tier badge + status pulse + system lock), DepartmentSection (collapsible), UnassignedSection (amber)
- Added AgentDetailPanel slide-in from right: name, tier, model, status, soul summary (200 char), allowed tools badges
- Added slide-left CSS animation in index.css for panel entrance
- Loading skeleton: 2 departments x 3 agents
- Empty state: CTA text for template
- Error state: retry button with refetch()
- 63 unit tests: data structure, tier sorting (7), system agent fields (6), badge mappings, edge cases
- No regressions in existing tests

### File List

- packages/server/src/routes/admin/org-chart.ts (MODIFIED -- added agent fields + tier sorting)
- packages/admin/src/pages/org-chart.tsx (REWRITTEN -- full tree view + detail panel + state handling)
- packages/admin/src/index.css (MODIFIED -- added slide-left keyframe animation)
- packages/server/src/__tests__/unit/org-chart.test.ts (MODIFIED -- enhanced types, added tier sorting + system fields tests, 63 tests)
