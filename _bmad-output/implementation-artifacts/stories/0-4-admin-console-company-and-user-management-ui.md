# Story 0.4: Admin Console — Company & User Management UI

Status: done

## Story

As an admin,
I want a web console to manage companies and users with stats, search, pagination, and full CRUD,
so that I can administer the platform without database access.

## Acceptance Criteria

1. **Given** admin is logged into the admin console, **When** they navigate to Companies page, **Then** they see a list of all companies with basic stats (user count, agent count, active/inactive status, created date).

2. **Given** admin views Companies page, **When** there are many companies, **Then** they can search by name/slug and see company count summary.

3. **Given** admin creates a new company, **When** the form is submitted, **Then** the company appears in the list without page reload and a success toast is shown.

4. **Given** admin selects a company, **When** they navigate to Users page, **Then** they see all users for that company with roles (admin/user), status, email, and creation date.

5. **Given** admin views Users page, **When** they want to manage users, **Then** they can create, edit (name/email/role), and deactivate users with confirmation dialogs.

6. **Given** admin edits a user, **When** changes are saved, **Then** the table updates immediately via query invalidation and a toast confirms the action.

7. **Given** admin deactivates a company, **When** the company has active users, **Then** the system blocks the operation with a clear error message showing active user count.

8. **Given** admin views the dashboard, **When** a company is selected, **Then** they see stat cards (users, departments, agents, online agents) and preview lists.

## Tasks / Subtasks

- [x] Task 1: Enhance Companies page with stats (AC: #1, #2)
  - [x] 1.1: Add GET `/api/admin/companies/stats` endpoint returning user count + agent count per company
  - [x] 1.2: Update Companies page to display stats (user count, agent count) per company card
  - [x] 1.3: Add search input for filtering companies by name or slug (client-side filter)
  - [x] 1.4: Add company deactivation with confirmation dialog using ConfirmDialog from @corthex/ui

- [x] Task 2: Enhance Users page with full CRUD (AC: #4, #5, #6)
  - [x] 2.1: Add edit modal/inline for changing name, email, role (currently only name editable)
  - [x] 2.2: Add password reset action (POST `/admin/users/:id/reset-password` already exists)
  - [x] 2.3: Replace browser `confirm()` with ConfirmDialog component for deactivation
  - [x] 2.4: Add empty state using EmptyState component from @corthex/ui
  - [x] 2.5: Fix department filter (currently no-op for specific department selection)

- [x] Task 3: Polish shared UI patterns (AC: #3, #8)
  - [x] 3.1: Add loading skeletons using Skeleton/SkeletonTable from @corthex/ui (replace "loading text")
  - [x] 3.2: Ensure all mutations have proper error handling with toast messages

## Dev Notes

### Current State Analysis
The admin console **already has working** Companies and Users pages with basic CRUD:
- `packages/admin/src/pages/companies.tsx` (174 lines) — list, create, inline edit name
- `packages/admin/src/pages/users.tsx` (312 lines) — list, create, inline edit name, deactivate
- `packages/server/src/routes/admin/companies.ts` (114 lines) — full CRUD + SMTP
- `packages/server/src/routes/admin/users.ts` (227 lines) — full CRUD + password reset

### What Needs Enhancement (Gap Analysis)
1. **Companies page** — no stats (user count, agent count); no search; no ConfirmDialog for deactivation
2. **Users page** — edit only changes name (not email/role); department filter is no-op; uses browser `confirm()` instead of ConfirmDialog; no empty state
3. **Both pages** — use plain text instead of Skeleton components
4. **Server** — GET companies returns raw data without stats; need a stats endpoint or aggregate query

### Architecture Patterns (MUST follow)

**Data Fetching:**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['companies'],
  queryFn: () => api.get<{ data: T[] }>('/admin/companies'),
})
```

**Mutations:**
```typescript
const mutation = useMutation({
  mutationFn: (body) => api.post('/admin/path', body),
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['target'] })
    addToast({ type: 'success', message: '...' })
  },
  onError: (err: Error) => addToast({ type: 'error', message: err.message }),
})
```

**UI Components (from @corthex/ui):**
- Card, CardContent, CardHeader, CardFooter
- Badge (variants: default, success, error, purple)
- StatusDot, Skeleton, SkeletonTable
- ConfirmDialog, Modal, EmptyState
- Button, Input, Select

**API Response Format:**
```typescript
{ data: T | T[], success?: boolean, error?: string }
```

### Naming Conventions
- Files: kebab-case (`company-stats.ts`)
- Components: PascalCase (`CompaniesPage`)
- Functions: camelCase (`getCompanyStats`)
- DB columns: snake_case (`company_id`)
- API routes: kebab-case (`/admin/companies`)

### Project Structure Notes

Files to modify:
```
packages/admin/src/pages/companies.tsx    # Enhance with stats + search + ConfirmDialog
packages/admin/src/pages/users.tsx        # Enhance edit modal + ConfirmDialog + dept filter fix
packages/server/src/routes/admin/companies.ts  # Add stats endpoint
```

Files that already exist and should NOT be recreated:
```
packages/admin/src/components/sidebar.tsx  # Already has nav
packages/admin/src/App.tsx                 # Already has routes
packages/admin/src/lib/api.ts              # Already has fetch wrapper
packages/admin/src/stores/admin-store.ts   # Already has selectedCompanyId
packages/admin/src/stores/toast-store.ts   # Already has toast system
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 0, Story 0.4]
- [Source: _bmad-output/planning-artifacts/prd.md — FR84, FR85]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Section 8 Admin Console]
- [Source: _bmad-output/planning-artifacts/architecture.md — React patterns, API patterns]
- [Source: packages/admin/src/pages/companies.tsx — existing Companies page]
- [Source: packages/admin/src/pages/users.tsx — existing Users page]
- [Source: packages/server/src/routes/admin/companies.ts — existing companies API]
- [Source: packages/server/src/routes/admin/users.ts — existing users API]

### Previous Story Intelligence (Story 0-3)

Story 0-3 (Credential Vault) established these patterns:
- Hono route pattern: `route.use('*', authMiddleware, adminOnly)` + zValidator
- Zustand + TanStack Query for state management
- Toast notifications via `useToastStore`
- Form state pattern: `showCreate` + `form` + `editId`
- @corthex/ui components used: Card, Badge, Skeleton
- All mutations use `qc.invalidateQueries` for cache refresh

### Git Intelligence

Recent commits show:
- Story 0-3 added credential vault with 12 providers (AES-256-GCM)
- Story 0-2 added invitation system + JWT login
- Story 0-1 added company+admin registration
- All server routes follow `authMiddleware + adminOnly` pattern
- Frontend uses TanStack Query v5 with api wrapper

### v1 Reference

v1 had NO admin console (single-user system). This is a v2-only feature.
The admin console is needed to support multi-tenancy (companyId isolation).
Key functionality: company CRUD, user CRUD, and per-company stats display.

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References

### Completion Notes List
- Task 1: Added GET `/api/admin/companies/stats` endpoint aggregating user+agent counts per company. Enhanced CompaniesPage with stats display, client-side search filter, ConfirmDialog for deactivation, SkeletonCard loading states.
- Task 2: Enhanced UsersPage with full inline editing (name, email, role), password reset action with ConfirmDialog, deactivation ConfirmDialog (replaced browser confirm), EmptyState for empty lists, fixed department filter using user->agent->department mapping.
- Task 3: Both pages now use @corthex/ui skeleton components (SkeletonCard, SkeletonTable) instead of plain text loading. All mutations have onError handlers with toast notifications.
- 12 unit tests added covering: stats aggregation logic, search filter, department filter, and edit form validation.

### File List
- packages/server/src/routes/admin/companies.ts (modified) — added stats endpoint
- packages/admin/src/pages/companies.tsx (modified) — stats, search, ConfirmDialog, SkeletonCard
- packages/admin/src/pages/users.tsx (modified) — full edit, password reset, ConfirmDialog, EmptyState, dept filter fix, SkeletonTable
- packages/server/src/__tests__/unit/admin-console-ui.test.ts (new) — 12 unit tests
