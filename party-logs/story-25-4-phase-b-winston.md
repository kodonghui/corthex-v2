# Story 25.4 — Phase B Review: CEO Workflow Results View & Admin n8n Editor
**Critic-A (Winston) — Architect Review**
**Date**: 2026-03-24

## Files Reviewed
1. `packages/server/src/routes/admin/n8n-proxy.ts` (lines 268-320 — new endpoints)
2. `packages/app/src/pages/n8n-workflows.tsx` — CEO read-only workflow results (281 lines)
3. `packages/admin/src/pages/n8n-editor.tsx` — Admin iframe editor (125 lines)
4. `packages/app/src/App.tsx` — Route registration (lazy load)
5. `packages/admin/src/App.tsx` — Route registration (lazy load)
6. `packages/app/src/components/sidebar.tsx` — Nav entry ("n8n 자동화", Hexagon icon)
7. `packages/admin/src/components/sidebar.tsx` — Nav entry ("n8n 에디터", Hexagon icon)
8. `packages/server/src/__tests__/unit/n8n-story-25-4.test.ts` — 41 tests

## Architecture Assessment

### Server: GET /n8n/health (lines 270-273)
- Simple pass-through to `checkN8nHealth()` — returns `{ success: true, data: health }`
- No try/catch needed — `checkN8nHealth()` never throws (by design from 25.1)
- **Verdict**: Correct, minimal

### Server: GET /n8n/executions (lines 277-320)
- Tenant isolation via `injectCompanyTag(tenant.companyId, targetUrl)` ✓
- Query filters: limit, cursor, status, workflowId — all passed through to n8n API ✓
- Standard `{ success, data }` format and 502 OOM recovery ✓
- **Issue (HIGH)**: Lines 293-294 — proxy headers only set `Accept: 'application/json'`. Missing `Authorization: undefined, Cookie: undefined`. This is the exact same bug I flagged on `/n8n/workflows` in 25.3 (which was fixed at lines 338-340). The new `/n8n/executions` endpoint repeats the unfixed pattern.

### CEO App: n8n-workflows.tsx
- **Hooks**: 3 well-structured React Query hooks
  - `useN8nHealth` — 30s refetchInterval for health monitoring
  - `useN8nWorkflows` — retry: 1 (correct for non-critical data)
  - `useN8nExecutions(workflowId?)` — optional filter, limit 20
- **Types**: `N8nWorkflow`, `N8nExecution`, `N8nHealthStatus` — clean, match n8n API schema
- **Components**:
  - `ServiceSuspendedBanner` — amber warning (FR-N8N5) ✓
  - `WorkflowCard` — active/inactive badge, selected state, last modified ✓
  - `ExecutionRow` — color-coded status icons (emerald/red/blue/amber) ✓
- **Layout**: 3-col grid (1 workflow list + 2 execution results), responsive `lg:grid-cols-3`
- **UX states**: loading skeleton (3 pulse blocks), empty state (both panels), error state, suspended banner — comprehensive (UXR121)
- **Design tokens**: olive-500/600, sand-200/100, stone-800/500 — Natural Organic brand ✓
- **i18n**: Korean throughout (성공/실패/실행중/대기, 마지막 수정, 등록된 워크플로우가 없습니다, etc.)
- **Duration formatter**: Handles ms/s/m with "진행중" for running — nice touch
- **Date formatter**: `ko-KR` locale with month/day/hour/minute ✓
- **Verdict**: Clean, well-structured component

### Admin App: n8n-editor.tsx
- **iframe**: `src="/api/admin/n8n-editor/"` — goes through full security chain (auth → SEC-2 → SEC-8 → SEC-3 → CSRF)
- **Sandbox**: `allow-same-origin allow-scripts allow-forms allow-popups`
  - `allow-same-origin` + `allow-scripts` together means iframe CAN escape sandbox and access parent DOM. This is a known trade-off — required because n8n editor runs on the same origin (proxied through CORTHEX). Since n8n is a trusted first-party Docker sidecar, this is **acceptable**.
- **Health recovery auto-refresh** (lines 44-48):
  ```typescript
  useEffect(() => {
    if (isAvailable) setIframeKey(k => k + 1)
  }, [isAvailable])
  ```
  **Issue (LOW)**: On initial load, health query completes → `isAvailable` becomes true → useEffect fires → iframe re-renders immediately. This causes an unnecessary initial double-render/flicker. Better: track previous state and only trigger on `false → true` transition.
- **Actions**: Refresh button (re-key iframe), open-in-new-tab (`target="_blank"` with `noopener noreferrer`) ✓
- **States**: Loading spinner, suspended state (amber banner with health status detail)
- **Verdict**: Good, one minor UX flicker

### Route Registration
- CEO: `lazy(() => import('./pages/n8n-workflows'))` at `path="n8n-workflows"` with Suspense ✓
- Admin: `lazy(() => import('./pages/n8n-editor'))` at `path="n8n-editor"` with Suspense ✓
- Both use `PageSkeleton` fallback ✓

### Sidebar Navigation
- CEO: `{ to: '/n8n-workflows', label: 'n8n 자동화', icon: Hexagon }` ✓
- Admin: `{ to: '/n8n-editor', label: 'n8n 에디터', icon: Hexagon }` ✓
- Hexagon icon from Lucide — consistent with project (not Material Symbols) ✓

### Code Duplication Note
Both `n8n-workflows.tsx` and `n8n-editor.tsx` define their own `useN8nHealth` hook with identical logic. Could be extracted to a shared hook. Non-blocking — typical for early feature development.

## Observations Summary

| # | Severity | Issue |
|---|----------|-------|
| 1 | **HIGH** | `/n8n/executions` endpoint missing `Authorization: undefined, Cookie: undefined` in proxy headers — same bug as 25.3 /n8n/workflows (which was fixed) |
| 2 | **LOW** | Editor `useEffect` on `isAvailable` causes initial iframe double-render — should track `false→true` transition only |
| 3 | **LOW** | `useN8nHealth` hook duplicated across CEO and admin apps — could share |

## Scoring (Critic-A Weights)

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 Completeness | 9 | 15% | 1.35 |
| D2 UX/Clarity | 9 | 10% | 0.90 |
| D3 Accuracy | 8 | 25% | 2.00 |
| D4 Implementability | 9 | 20% | 1.80 |
| D5 Spec Alignment | 9 | 15% | 1.35 |
| D6 Risk | 8 | 15% | 1.20 |
| **Total** | | | **8.60** |

D3 at 8: header sanitization gap on /n8n/executions. D6 at 8: same gap + iframe sandbox trade-off (acceptable but noted).

## Verdict: **PASS** (8.60/10)

FR-N8N2/5/6, UXR119/121 all properly addressed. CEO read-only view is clean with comprehensive UX states. Admin editor iframe correctly sandboxed with health monitoring. One HIGH observation: /n8n/executions repeats the header leak bug from 25.3 — straightforward fix.
