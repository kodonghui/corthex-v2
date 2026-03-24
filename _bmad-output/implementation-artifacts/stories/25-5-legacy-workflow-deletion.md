# Story 25.5: Legacy Workflow Code Deletion

## Story
**As a** developer,
**I want** the old self-implementation workflow code removed,
**So that** the codebase is clean and there's no confusion about which system handles workflows.

## References
- FR-N8N3: Legacy workflow code removed
- AR57: Clean codebase

## Acceptance Criteria
1. **AC-1**: Legacy server code deleted: `routes/workspace/workflows.ts`, `services/workflow/`, `lib/workflow/`
2. **AC-2**: Legacy frontend workflow pages and components deleted from both apps
3. **AC-3**: Workflow-related test files removed
4. **AC-4**: Migration files (DB schema) preserved — schema history intact
5. **AC-5**: No orphaned imports or dead code remains
6. **AC-6**: All remaining tests pass with workflow code removed
7. **AC-7**: Old `/workflows` routes redirect to n8n replacements

## Implementation

### Deleted Files (19 total)
**Server (10 files)**:
- `routes/workspace/workflows.ts`
- `services/workflow/engine.ts`, `execution.ts`, `suggestion.ts`, `pattern-analyzer.ts`
- `lib/workflow/engine.ts`, `dag-solver.ts`, `execution-context.ts`
- `__tests__/unit/engine.test.ts`
- `__tests__/api/workflows.test.ts`

**Server Tests (8 files)**:
- `workflow-crud.test.ts`, `workflow-crud-tea.test.ts`
- `workflow-execution.test.ts`, `workflow-execution-tea.test.ts`
- `workflow-pattern.test.ts`, `workflow-pattern-tea.test.ts`
- `workflow-builder-ui-tea.test.ts`, `workflow-canvas-tea.test.ts`

**CEO App (1 file)**:
- `pages/workflows.tsx`

**Admin App (2 files)**:
- `pages/workflows.tsx`
- `components/workflow-canvas.tsx`

### Edited Files
- `server/index.ts` — removed `workflowsRoute` import + registration
- `app/App.tsx` — removed `WorkflowsPage` import, `/workflows` → redirect to `/n8n-workflows`
- `app/sidebar.tsx` — removed legacy workflow nav, renamed n8n entry to "워크플로우"
- `admin/App.tsx` — removed `WorkflowsPage` import, `/workflows` → redirect to `/n8n-editor`
- `admin/sidebar.tsx` — removed legacy workflow nav entry
- `app/hooks/use-queries.ts` — removed 5 workflow hooks + types

### Preserved
- DB schema (`schema.ts`) — workflow tables kept for migration history
- Shared types (`@corthex/shared`) — kept for backward compatibility
- `nexusWorkflows` table — separate feature, not legacy

## Tests
- `n8n-story-25-5.test.ts`: 35 tests, 44 assertions — all pass
- Full test suite: no new failures from deletion
