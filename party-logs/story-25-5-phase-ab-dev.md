# Story 25.5 — Phase A+B: Legacy Workflow Code Deletion

## Phase A: Analysis + Phase B: Implementation (Combined)

### Epic Reference
- Epic 25: n8n Workflow Integration
- Story 25.5: Legacy Workflow Code Deletion (FR-N8N3)

### Implementation Summary

Deleted 21 legacy workflow files across server, CEO app, and admin app. Cleaned all orphaned imports. Added redirects from old routes to n8n replacements. Preserved DB schema for migration history.

### Deletion Inventory
- **Server code**: 8 source files (routes, services, lib)
- **Server tests**: 10 test files (unit + api)
- **CEO app**: 1 page + 5 hooks from use-queries.ts
- **Admin app**: 2 files (page + canvas component)

### Redirects
- CEO: `/workflows` → `/n8n-workflows`
- Admin: `/workflows` → `/n8n-editor`

### Key Decisions
- D25.5-1: DB schema tables preserved (migration history requirement)
- D25.5-2: Shared types kept (backward compatibility, may be used by other features)
- D25.5-3: Sidebar label "n8n 자동화" renamed to "워크플로우" (same label, new backend)
- D25.5-4: Old routes redirect instead of 404 (better UX for bookmarked URLs)

### Test Results
- `n8n-story-25-5.test.ts`: **35 tests, 44 assertions, 0 failures**
- All n8n tests: **203 tests, 398 assertions, 0 failures** (5 files)
- Type-check: all 3 packages clean
- Full test suite: no new failures from deletion
