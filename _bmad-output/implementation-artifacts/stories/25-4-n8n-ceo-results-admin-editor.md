# Story 25.4: CEO Workflow Results View & Admin n8n Editor

## Story
**As a** CEO and admin user,
**I want** to view n8n workflow execution results (CEO app, read-only) and access the full n8n editor (admin app),
**So that** I can monitor automation outcomes without direct n8n access while admins can create/edit workflows.

## References
- FR-N8N2: CEO app read-only workflow execution results
- FR-N8N5: "Workflow service temporarily suspended" on n8n failure
- FR-N8N6: Admin n8n editor access via iframe + proxy
- UXR119: Workflow list with active/inactive toggle, last execution
- UXR121: Error handling — OOM, API failure, timeout

## Acceptance Criteria
1. **AC-1**: CEO app displays workflow list with active/inactive status (UXR119)
2. **AC-2**: CEO app shows execution results per workflow — read-only (FR-N8N2)
3. **AC-3**: Both apps show "워크플로우 서비스 일시 중단" banner when n8n is down (FR-N8N5)
4. **AC-4**: Admin app loads n8n editor in sandboxed iframe (FR-N8N6)
5. **AC-5**: Error states displayed for API failures (UXR121)
6. **AC-6**: Health endpoint auto-refreshes every 30 seconds
7. **AC-7**: Both apps have sidebar navigation entries + routes

## Implementation

### Server Endpoints (n8n-proxy.ts)
- `GET /api/admin/n8n/health` — Returns n8n health status (available, responseTimeMs)
- `GET /api/admin/n8n/executions` — Execution results with filters (limit, cursor, status, workflowId)
  - Company tag injected for tenant isolation
  - Returns 502 on n8n failure with N8N_UNAVAILABLE code

### CEO App (packages/app)
- **Page**: `pages/n8n-workflows.tsx` — Full workflow results view
  - `useN8nHealth()` — Health check, 30s auto-refresh
  - `useN8nWorkflows()` — Workflow list
  - `useN8nExecutions(workflowId?)` — Execution results, filterable by workflow
  - Components: ServiceSuspendedBanner, WorkflowCard, ExecutionRow
  - Status display: 성공/실패/실행중/대기 with color-coded icons
- **Route**: `/n8n-workflows` registered in App.tsx
- **Sidebar**: "n8n 자동화" with Hexagon icon

### Admin App (packages/admin)
- **Page**: `pages/n8n-editor.tsx` — iframe-based n8n editor
  - Sandboxed: allow-same-origin, allow-scripts, allow-forms, allow-popups
  - Health monitoring, refresh button, open-in-new-tab
  - Service suspended state when n8n unavailable
- **Route**: `/n8n-editor` registered in App.tsx
- **Sidebar**: "n8n 에디터" with Hexagon icon

## Tests
- `n8n-story-25-4.test.ts`: 41 tests, 72 assertions
  - Health endpoint structure
  - Executions endpoint with filters + tenant isolation
  - CEO page: workflow list, execution results, error states, empty states
  - Admin page: iframe, sandbox, health, suspended state
  - Route registration in both apps
  - Sidebar navigation in both apps

## Dependencies
- Story 25.3: n8n Hono Reverse Proxy (provides proxy endpoints)
- Story 25.2: n8n 8-Layer Security (provides auth/isolation middleware)
