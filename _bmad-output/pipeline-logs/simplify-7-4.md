## /simplify Quality Gate — Story 7.4

### Execution
- Timestamp: 2026-03-11T10:35Z
- Duration: ~5min (3 parallel review agents)
- Status: success

### Results
- Files reviewed: 4 (organization.ts, agents.ts route, agents.tsx page, departments.tsx page)
- Issues found: 4
  - Reuse opportunities: 1 (duplicate countActiveTasks query)
  - Quality issues: 2 (regex error parsing, `as any` cast)
  - Efficiency improvements: 1 (skip task count when force=true)
- Issues auto-fixed: 4
- Files modified:
  - `packages/admin/src/lib/api.ts` — Added `ApiError` class with `code` + `data` fields
  - `packages/admin/src/pages/agents.tsx` — Use `ApiError.data.activeTaskCount` instead of regex
  - `packages/server/src/services/organization.ts` — Extract `countActiveTasks()` helper, skip when force=true
  - `packages/server/src/routes/admin/agents.ts` — Remove `as any` cast

### Skipped (out of scope)
- N+1 in `analyzeCascade()` per-agent loop — pre-existing, not from this story
- `Promise.all` parallelization in `deactivateAgent()` — negligible benefit for admin-only endpoint
