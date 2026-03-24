# Story 25.4 — Phase A+B: CEO Workflow Results View & Admin Editor

## Phase A: Analysis + Phase B: Implementation (Combined)

### Epic Reference
- Epic 25: n8n Workflow Integration
- Story 25.4: CEO Workflow Results View & Admin n8n Editor
- Requirements: FR-N8N2, FR-N8N5, FR-N8N6, UXR119, UXR121

### Implementation Summary

**Server (n8n-proxy.ts)**:
- Added `GET /n8n/health` — Returns n8n availability + response time
- Added `GET /n8n/executions` — Execution results with tenant isolation (company tag injection), supports limit/cursor/status/workflowId query filters, 502 on n8n failure

**CEO App (packages/app)**:
- Created `pages/n8n-workflows.tsx` — Full read-only workflow results view
  - 3 React Query hooks: useN8nHealth (30s refresh), useN8nWorkflows, useN8nExecutions
  - WorkflowCard: name, active/inactive badge, last updated date
  - ExecutionRow: status icon (성공/실패/실행중/대기), duration, date
  - ServiceSuspendedBanner: shown when health.available === false
  - Error state: API failure message (UXR121)
  - Empty states: no workflows, no executions
  - Korean date formatting (ko-KR locale)
- Registered route `/n8n-workflows` in App.tsx with lazy loading
- Added sidebar entry "n8n 자동화" with Hexagon icon

**Admin App (packages/admin)**:
- Created `pages/n8n-editor.tsx` — iframe-based n8n visual editor
  - Sandboxed iframe: allow-same-origin allow-scripts allow-forms allow-popups
  - Health monitoring: auto-refresh iframe when n8n recovers
  - Refresh + Open in New Tab buttons
  - Service suspended state with alert when n8n unavailable
  - Response time display
- Registered route `/n8n-editor` in App.tsx with lazy loading
- Added sidebar entry "n8n 에디터" with Hexagon icon

### Test Results
- `n8n-story-25-4.test.ts`: **41 tests, 72 assertions, 0 failures**
- Type-check: all 3 packages pass (server, app, admin)

### Key Decisions
- D25.4-1: CEO app is read-only (no mutation endpoints exposed)
- D25.4-2: Admin editor uses iframe with sandbox for security isolation
- D25.4-3: Health endpoint shared by both apps (same API path)
- D25.4-4: Execution query supports workflowId filter for per-workflow view
- D25.4-5: Used Hexagon icon for n8n in both sidebars (consistent branding)
