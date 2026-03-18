# Critic-Architecture Report — Full Codebase Audit

## Score: 7.5/10

A well-structured monorepo with clear boundaries, strong tenant isolation patterns, and disciplined engine encapsulation. The main issues are API response format inconsistency (the single most pervasive violation), dual DB access patterns (getDB vs raw db), and duplicated logic between admin/app packages.

---

## 1. Module Boundaries & Public API

### praise: [ARCH] Engine encapsulation is airtight
- `engine/index.ts` is a proper barrel: exports only `runAgent`, `collectAgentResponse`, `getActiveSessions`, `renderSoul`, `selectModel`, `selectModelFromDB`, `sseStream`, and types.
- **Zero** direct imports from engine internals (hooks/, mcp/, model-selector, soul-renderer, sse-adapter) found outside engine/. Grep confirmed 0 matches for `from.*engine/(?!agent-loop|types|index)`.
- `engine/types.ts` line 1 explicitly documents: "server internal only, do NOT re-export from shared/".

### praise: [ARCH] No server types leak to frontend
- Grep for `from.*server` in `packages/app/src/` and `packages/admin/src/` returned zero matches. All shared types flow through `@corthex/shared`.

### issue: [ARCH] Engine index.ts exports more than documented public API — `packages/server/src/engine/index.ts`
- CLAUDE.md says "engine/ public API: agent-loop.ts + types.ts only", but `index.ts` also re-exports `renderSoul` from `soul-renderer.ts`, `selectModel`/`selectModelFromDB` from `model-selector.ts`, and `sseStream` from `sse-adapter.ts`. While the barrel prevents direct imports, the public surface is wider than documented.

---

## 2. Architecture Patterns — API Response Format

### issue (major): [ARCH] API response envelope is inconsistent across routes
- **CLAUDE.md specifies**: `{ success, data }` / `{ success, error: { code, message } }`
- **shared/types.ts `ApiResponse<T>`** defines: `{ data: T; meta?: ... }` — NO `success` field
- **Actual counts** across all route files:
  - `{ data: ... }` (without success): **292 occurrences** in 37 files
  - `{ success: true, data: ... }`: **138 occurrences** in 29 files
  - `{ success: false, ... }`: **51 occurrences** in 14 files
  - `{ error: { code, message } }` (without success): **1 occurrence** (`quality-dashboard.ts:18`)
- **Pattern**: Dashboard, conversations, archive, debates, departments, operation-log, admin agents/departments/mcp-servers, tier-configs, workflows use `{ success: true, data }`. The majority of other routes use `{ data }` without `success`.
- The `ApiResponse<T>` type in `shared/types.ts` (line 23) omits `success`, contradicting CLAUDE.md.

### suggestion: [ARCH] Reconcile ApiResponse type with CLAUDE.md convention
- Either update `shared/types.ts` to `{ success: boolean; data: T }` and fix all routes, or update CLAUDE.md to reflect the actual `{ data }` pattern. The current state means frontend code cannot reliably check `response.success`.

### praise: [ARCH] Error response format is consistent
- The `errorHandler` middleware (`middleware/error.ts`) enforces `{ error: { code, message } }` format via `ApiError` type from `@corthex/shared`. All `HTTPError` throws flow through this handler. The one exception is `quality-dashboard.ts` which manually returns a similar format.

---

## 3. Route-Service Separation

### praise: [ARCH] Clean separation of concerns
- Routes handle: HTTP concerns (validation via `zValidator`, auth via middleware, response formatting)
- Services handle: business logic, DB queries, cross-entity operations
- Example: `dashboard.ts` route delegates to `getSummary`, `getUsage`, `getBudget` service functions.

### thought: [ARCH] Some routes contain inline DB queries instead of delegating to services
- `workspace/agents.ts`: 20+ direct Drizzle queries inline in route handlers
- `workspace/notifications.ts`: all DB queries inline
- `admin/companies.ts`: all DB queries inline
- This is acceptable for simple CRUD (no business logic), but creates a gray area where complexity can creep in without extraction to a service.

---

## 4. DB Architecture — Dual Access Patterns

### issue: [ARCH] Routes use raw `db` import (50 files) while engine uses `getDB()` (10 files) — inconsistent tenant isolation strategy
- **50 route files** import `db` directly from `../../db` or `../../db/index`
- **10 route files** import `getDB` from `../../db/scoped-query`
- Routes with raw `db` manually add `eq(table.companyId, tenant.companyId)` in every WHERE clause
- Engine hooks/services use `getDB(companyId)` which auto-injects the WHERE clause

### thought: [ARCH] The dual pattern is architecturally intentional but risky
- `getDB()` is designed for engine internals where `SessionContext` provides `companyId`
- Routes get `companyId` from `tenant` middleware (`c.get('tenant').companyId`)
- Both achieve tenant isolation, but the manual `eq()` approach in routes is error-prone — a forgotten `companyId` filter is a cross-tenant data leak
- The `tenant-helpers.ts` provides `withTenant()` and `scopedWhere()` helpers, but they're only used inside `scoped-query.ts`, not in routes

### suggestion: [ARCH] Consider extending `getDB()` or creating a route-level helper that makes tenant isolation mandatory rather than manual

---

## 5. Import Integrity & Cross-Package Dependencies

### praise: [ARCH] Clean cross-package dependency graph
- `@corthex/shared` is the only bridge between server and frontend packages
- No circular dependencies detected between packages
- Frontend packages import shared types correctly: `WsChannel`, `DebateWsEvent`, `Agent`, `Workflow`, etc.

### praise: [ARCH] Shared package is well-utilized
- `shared/types.ts` (1166 lines) contains comprehensive type definitions
- Both server (20+ imports) and app (20+ imports) actively use shared types
- `shared/constants.ts` and `shared/mermaid-parser.ts` provide utility functions used by both sides

---

## 6. DRY / Code Duplication

### issue: [ARCH] Duplicated API client between admin and app — `packages/admin/src/lib/api.ts` vs `packages/app/src/lib/api.ts`
- Both files implement the same pattern: token from localStorage, auth header injection, 401/429 handling, error parsing
- Differences are legitimate (admin: `corthex_admin_token` + `injectCompanyId()`, app: `corthex_token` + `getErrorMessage()`)
- But the core `request<T>()` function, `RateLimitError` class, and `api` object are ~80% identical

### issue: [ARCH] Duplicated error message maps — `packages/admin/src/lib/api.ts:15` vs `packages/app/src/lib/error-messages.ts`
- Admin has 7 inline error codes (`AUTH_001`-`AUTH_004`, `USER_001`, `COMPANY_001`, `DEPT_001`, `TENANT_001`, `RATE_001`)
- App has 27 error codes in a dedicated file with handoff-specific messages
- Shared codes overlap but admin's map is a subset. Should be in `@corthex/shared`.

### suggestion: [ARCH] Extract shared API client base and error codes to `@corthex/shared` or `@corthex/ui`
- Create a base `createApiClient(config)` function in shared
- Move error code map to shared constants

### issue: [ARCH] Duplicated auth-store logic — `packages/app/src/stores/auth-store.ts` (63 lines) vs `packages/admin/src/stores/auth-store.ts` (33 lines)
- Both implement Zustand stores with `isAuthenticated`, `user`, `checkAuth()`, `logout()` patterns
- Different token keys make simple sharing impractical, but a factory function would reduce duplication

---

## 7. Router Integrity (Cross-File Integration)

### praise: [INTEGRATION] All App.tsx routes map to existing page files
- App: 30 lazy imports all resolve to existing files in `pages/`
- Admin: 26 lazy imports all resolve to existing files in `pages/`
- Verified: `hub/`, `command-center/` directories exist with `index.tsx`

### praise: [INTEGRATION] Route redirects are clean
- `command-center` -> `/hub`, `org` -> `/nexus`, `cron` -> `/jobs`, `argos` -> `/jobs` — logical consolidation

---

## 8. Engine Architecture Deep Dive

### praise: [ARCH] Single entry point pattern enforced — `engine/agent-loop.ts`
- `runAgent()` is the sole entry point (line 49), exported as `AsyncGenerator<SSEEvent>`
- Session lifecycle: register -> pre-spawn events -> tool loop -> cost tracking -> cleanup
- `SessionContext` is readonly/immutable (all fields marked `readonly`)

### praise: [ARCH] Hook system is well-designed — 5 hooks, all composable
- `tool-permission-guard.ts`: Pre-tool allowed_tools check
- `credential-scrubber.ts`: Init/release lifecycle for scrubbing secrets from output
- `output-redactor.ts`: Post-response content filtering
- `delegation-tracker.ts`: Handoff depth/cycle detection
- `cost-tracker.ts`: Post-session cost recording via `getDB()`

### praise: [ARCH] MCP 8-Stage Lifecycle is fully implemented
- `mcp-manager.ts` documents and implements all 8 stages (RESOLVE through TEARDOWN)
- Lazy spawn (D26), warm start caching, 120s cold start timeout, SIGTERM->SIGKILL cleanup
- Injectable `SpawnFn` for test mocking
- Session-scoped lifecycle events logged to DB

### thought: [ARCH] `McpSession` type is duplicated — `engine/types.ts:66` vs `engine/mcp/mcp-manager.ts:42`
- Both define `McpSession` with similar but not identical fields. The `types.ts` version has `tools` as a plain array of objects, while `mcp-manager.ts` version has a `transport: McpTransport` field. The `types.ts` version appears to be the public API type, while `mcp-manager.ts` is the internal implementation type.

---

## 9. Shared Types vs DB Schema Alignment

### praise: [ARCH] Shared types serve as a clean API contract
- `ApiResponse<T>`, `ApiError` types define the wire format
- Domain types (`Agent`, `Debate`, `Workflow`, etc.) match DB schema fields
- `UserRole` union ('super_admin' | 'company_admin' | 'ceo' | 'employee') is used consistently in auth middleware

### issue (minor): [ARCH] `shared/types.ts` User.role uses 'admin'|'user' but UserRole uses 'super_admin'|'company_admin'|'ceo'|'employee' — `packages/shared/src/types.ts:59`
- `User.role` on line 59 is typed as `'admin' | 'user'`, which doesn't match the `UserRole` type on line 2. This may cause confusion — the `User` type appears to be a simplified frontend representation, not the full RBAC model.

---

## 10. UI Package Architecture

### praise: [ARCH] Clean shared component library — 20 components
- `@corthex/ui` provides foundational components: Button, Card, Modal, Input, Select, Tabs, Toast, etc.
- Both admin and app import from `@corthex/ui` (confirmed: `Skeleton` usage in both App.tsx files)
- Components are atomic/presentational — no business logic

---

## Summary of Findings

| Category | Status | Key Finding |
|----------|--------|------------|
| Engine Boundaries | Excellent | Zero leaks, proper barrel export |
| API Response Format | Poor | 292 `{data}` vs 138 `{success,data}` — CLAUDE.md violated |
| Tenant Isolation | Good | Works but dual pattern (getDB vs raw db) is fragile |
| Cross-Package Deps | Excellent | Clean graph, no circular deps, no server type leaks |
| Code Duplication | Fair | api.ts, auth-store, error messages duplicated across admin/app |
| Router Integrity | Excellent | All routes map to existing files |
| Engine Internals | Excellent | Hooks, MCP lifecycle, single entry point all solid |
| DB Architecture | Good | Drizzle ORM consistent, getDB() pattern well-designed |

## Top 3 Recommendations

1. **Standardize API response envelope**: Choose `{data}` or `{success, data}` and apply uniformly. Update `shared/types.ts` `ApiResponse<T>` to match. This is the single largest inconsistency in the codebase (430 total response calls).

2. **Extract shared frontend utilities**: Move API client base, error code maps, and auth-store factory to `@corthex/shared` or `@corthex/ui`. Currently ~200 lines of near-identical code exist in both admin and app.

3. **Unify DB access pattern in routes**: Either adopt `getDB()` in routes (stronger isolation guarantee) or document the current manual `eq(companyId)` pattern as intentional and add a lint rule to catch missing tenant filters.
