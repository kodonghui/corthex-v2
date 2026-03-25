# Story 25.4 Phase B Review — Critic-C (John, Product + Delivery)

## AC Verification

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC-1 | CEO workflow list with active/inactive (UXR119) | PASS | `n8n-workflows.tsx:123-155` — WorkflowCard shows `활성`/`비활성` badge with emerald/stone colors. Shows last update date via `formatDate(workflow.updatedAt)`. |
| AC-2 | CEO execution results read-only (FR-N8N2) | PASS | `ExecutionRow` component (lines 157-182). 4 status types: 성공/실패/실행중/대기 with color-coded icons and `formatDuration`. Server: `GET /n8n/executions` with company tag injection + filters. |
| AC-3 | Service suspended banner (FR-N8N5) | PASS | CEO: `ServiceSuspendedBanner` (lines 109-121) shown when `isUnavailable`. Admin: suspended state (lines 58-77) with health status detail. Both use amber color scheme. |
| AC-4 | Admin iframe editor (FR-N8N6) | PASS | `n8n-editor.tsx:113-121` — `<iframe>` with `src="/api/admin/n8n-editor/"`, `sandbox="allow-same-origin allow-scripts allow-forms allow-popups"`. Full height: `calc(100vh - 180px)`. |
| AC-5 | Error states (UXR121) | PASS | CEO: `wfError` state (line 219), empty workflows (line 238), empty executions (line 266). Admin: loading spinner (line 50), suspended (line 58). |
| AC-6 | Health auto-refresh 30s | PASS | Both apps: `refetchInterval: 30_000` in `useN8nHealth` hook. CEO line 61, Admin line 31. |
| AC-7 | Sidebar + routes | PASS | CEO: `/n8n-workflows` route in App.tsx:129, sidebar "n8n 자동화" with Hexagon. Admin: `/n8n-editor` route in App.tsx:113, sidebar "n8n 에디터" with Hexagon. Both lazy-loaded. |

## Dimension Scores (Critic-C Weights)

| Dim | Dimension | Score | Weight | Notes |
|-----|-----------|-------|--------|-------|
| D1 | Specificity | 9 | 20% | Clear CEO (read-only) vs Admin (editor) separation. Named FR/UXR refs in code comments. STATUS_CONFIG with 4 states, Korean labels, color codes. Duration formatting handles ms/s/m. Korean locale date formatting (`ko-KR`). |
| D2 | Completeness | 8 | 20% | All 7 ACs verified. 41 tests. CEO page: workflow list + executions + health + error/empty/loading states. Admin page: iframe + health + suspended + refresh + new-tab. Server: 2 new endpoints with tenant isolation. Duplicate code between apps detracts. |
| D3 | Accuracy | 9 | 15% | API endpoints match architecture. Executions use `injectCompanyTag` for tenant isolation. Sandbox permissions appropriate for editor (same-origin + scripts + forms + popups). Health from `checkN8nHealth()`. Korean UX consistent. |
| D4 | Implementability | 8 | 15% | Clean React Query hooks with retry:1 for resilience. Lazy loading for bundle optimization. WorkflowCard is a `<button>` (accessible, keyboard-navigable). Loading skeletons via animate-pulse. Minor: duplicate types + hooks between apps should be shared. |
| D5 | Consistency | 9 | 10% | Lucide React icons throughout (Hexagon for n8n — distinctive). CORTHEX API format (`{ success, data }`). Sidebar nav follows existing app patterns. Both apps use `@tanstack/react-query`. Olive/sand/stone color palette matches project theme. |
| D6 | Risk Awareness | 8 | 20% | FR-N8N5 suspended banner in both apps. 502 handling on all server endpoints. Iframe sandboxed. Health auto-refresh prevents stale status. Minor gaps: query params forwarded to n8n without validation, duplicate code creates maintenance risk. |

## Weighted Score

(9×0.20) + (8×0.20) + (9×0.15) + (8×0.15) + (9×0.10) + (8×0.20) = 1.80 + 1.60 + 1.35 + 1.20 + 0.90 + 1.60 = **8.45 / 10**

## Issues

| # | Severity | Description |
|---|----------|-------------|
| 1 | MEDIUM | **Duplicate N8nHealthStatus type and useN8nHealth hook**: Defined independently in both `n8n-workflows.tsx` (lines 47-63) and `n8n-editor.tsx` (lines 22-34). The CEO version includes `url` and `error` fields; the admin version omits them. If the server response changes, both files must be updated in sync. **Fix**: extract to `packages/app/src/lib/n8n-hooks.ts` (or shared between packages if admin also needs the full type). |
| 2 | LOW | **Server executions endpoint passes unvalidated query params to n8n**: Lines 283-290 — `limit`, `cursor`, `status`, `workflowId` forwarded directly without Zod validation. An admin could inject unexpected values. Risk is mitigated by admin-only access, but validation is cheap. Consider: `z.coerce.number().positive().max(100).optional()` for limit. |
| 3 | LOW | **Iframe sandbox may need expansion**: `allow-same-origin allow-scripts allow-forms allow-popups` covers most editor needs. But n8n's workflow editor may need `allow-modals` (confirmation dialogs) or `allow-downloads` (workflow export). Starting restrictive is correct — document that permissions may need expansion if n8n editor features break. |

## Product Assessment

Solid full-stack story delivering the CEO read-only view and admin editor in one coherent package. The CEO page is well-structured with a responsive 3-column layout (workflow list left, executions right), 4 color-coded execution statuses, and proper Korean UX (loading skeletons, empty states, error messages, ko-KR date formatting).

The admin editor page is appropriately simple — an iframe with health monitoring, refresh, and new-tab. The iframe auto-refreshes only on n8n recovery transitions (not on every health poll), which is correct behavior.

Server endpoints are clean: health is a simple passthrough, executions mirror the workflow list pattern from 25.3 with tenant isolation and 502 fallback. Both endpoints follow the `{ success, data }` contract.

The main delivery concern is duplicate types and hooks between the CEO and admin apps. This is a maintenance burden that compounds as more n8n-related pages are added. Extracting shared n8n hooks/types would improve maintainability.

41 tests cover server endpoints, both pages' features, route registration, and sidebar integration. Good breadth.

## Cross-Talk Notes

- **Winston/Amelia (Critic-A, Architecture)**: The `/n8n/executions` endpoint follows the same pattern as `/n8n/workflows` — good consistency. Both use `injectCompanyTag` for tenant isolation and the same error handling pattern. The health endpoint is correctly placed in n8n-proxy.ts (not a separate route) since it shares the admin middleware chain.
- **Quinn/Dana (Critic-B, QA/Security)**: Iframe sandbox `allow-same-origin` + `allow-scripts` is the minimum for a functional editor but also the most dangerous combination — it means the iframe's JS can access the parent window's origin. This is acceptable here because the iframe content is served by our own proxy (not a third-party origin), and the n8n container is isolated. If n8n were compromised, the iframe could potentially access the admin app's cookies/tokens — but that's a Docker container escape scenario, not a web security issue.

---

**Verdict: PASS (8.45/10)**

Epic 25 Critic-C: 25.1=8.80, 25.2=8.45, 25.3=8.85, 25.4=8.45, avg **8.64**
