# Phase 4-2 CRITIC-B: Routing Verification Report

**Reviewer:** CRITIC-B
**Phase:** 4-2 (Core Pages Rebuild)
**Focus:** Routing integrity, navigation consistency, broken links
**Date:** 2026-03-25

---

## Score: 7 / 10

**Verdict:** CONDITIONAL PASS — Core routing works correctly but there are 2 functional bugs and multiple code quality issues that should be fixed.

---

## Files Reviewed

1. `packages/app/src/App.tsx` — lazy imports + route definitions
2. `packages/app/src/pages/dashboard.tsx` — useNavigate calls
3. `packages/app/src/pages/hub/index.tsx` — useNavigate + navigation actions
4. `packages/app/src/pages/agents.tsx` — structure check
5. `packages/app/src/pages/jobs.tsx` — Link usage
6. `packages/app/src/components/layout.tsx` — Outlet, breadcrumb, navigate
7. `packages/app/src/components/sidebar.tsx` — navSections, badge logic

---

## Issues Found

### CRITICAL

**None** — No route causes a hard crash.

---

### HIGH (2 functional bugs)

#### Issue H1: Notifications unread badge NEVER shows — broken UX
**File:** `packages/app/src/components/sidebar.tsx:174`

```tsx
{!collapsed && item.to === '/notifications' && unreadCount > 0 && (
  <span className="...">
    {unreadCount > 99 ? '99+' : unreadCount}
  </span>
)}
```

The condition `item.to === '/notifications'` will **never be true** because `/notifications` is not present in any `navSections` item. The sidebar iterates only over `navSections` items, and none of them have `to: '/notifications'`. The API is correctly polled every 30 seconds (`refetchInterval: 30000`) and `unreadCount` is computed — but the badge UI is permanently dead.

**Impact:** Users never see visual feedback for unread notifications. This is a silent, complete UX failure.

---

#### Issue H2: `/organization` page is completely inaccessible via sidebar
**File:** `packages/app/src/components/sidebar.tsx` + `packages/app/src/App.tsx`

The route `/organization` exists (App.tsx:118, `OrganizationPage` lazy-imported from `./pages/organization`). The file `packages/app/src/pages/organization.tsx` exports `OrganizationPage`. However, **zero sidebar items link to `/organization`**.

The sidebar's "ORGANIZATION" section contains: Agents, Departments, Jobs, Tiers, Reports — but NOT the Organization page itself.

```
Sidebar navSections (ORGANIZATION group):
  /agents      ← present ✓
  /departments ← present ✓
  /jobs        ← present ✓
  /tiers       ← present ✓
  /reports     ← present ✓
  /organization ← MISSING ✗
```

Users can only reach this page by typing the URL directly. No redirect leads here from sidebar either.

---

### MEDIUM (3 issues)

#### Issue M1: PAGE_NAMES missing 3 active routes → ugly breadcrumbs
**File:** `packages/app/src/components/layout.tsx:15-41`

The following routes are rendered but absent from PAGE_NAMES, falling back to the raw path segment with first-letter capitalization:

| Route | Expected breadcrumb | Actual breadcrumb |
|---|---|---|
| `/n8n-workflows` | "N8n Workflows" or "Workflows" | **"N8n-workflows"** |
| `/marketing-pipeline` | "Marketing Pipeline" | **"Marketing-pipeline"** |
| `/marketing-approval` | "Marketing Approval" | **"Marketing-approval"** |

All three are linked from the sidebar and fully functional pages. The hyphen appears raw in the breadcrumb because the fallback logic only capitalizes the first character:
```tsx
segment.charAt(0).toUpperCase() + segment.slice(1)
// "n8n-workflows" → "N8n-workflows"
```

---

#### Issue M2: 5 dead lazy imports in App.tsx
**File:** `packages/app/src/App.tsx:9,24,27,28,37`

These components are imported but their routes use `<Navigate>` redirect elements — they are **never rendered**:

```tsx
// All imported but routes are <Navigate> elements:
const HomePage     = lazy(() => import('./pages/home').then(...))       // line 9
const CommandCenterPage = lazy(() => import('./pages/command-center')...) // line 24
const CronBasePage = lazy(() => import('./pages/cron-base').then(...))  // line 27
const ArgosPage    = lazy(() => import('./pages/argos').then(...))      // line 28
```

And `OrgPage` (line 23) is imported but the `/org` route is `<Navigate to="/organization">`.

These imports are dead code. They inflate the import graph and create confusion about which pages are "alive."

---

#### Issue M3: `sketchvibe.tsx` is an orphaned page
**File:** `packages/app/src/pages/sketchvibe.tsx`

The file exists and exports `SketchVibePage` (line 939). However:
- No lazy import in App.tsx
- No route in App.tsx
- No sidebar link
- PAGE_NAMES still has `sketchvibe: 'SketchVibe'` as a stale entry (layout.tsx:20)

The page is completely unreachable and unregistered. Either it should be added to the route tree, or the file + stale PAGE_NAMES entry should be cleaned up.

---

### LOW (2 issues)

#### Issue L1: ProtectedRoute reads `window.location.pathname` instead of `useLocation()`
**File:** `packages/app/src/App.tsx:68`

```tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = window.location.pathname   // ← direct DOM access
  if (!isAuthenticated) {
    const redirect = location !== '/' ? `?redirect=${encodeURIComponent(location)}` : ''
    return <Navigate to={`/login${redirect}`} replace />
  }
  return <>{children}</>
}
```

This bypasses React Router's context. The correct pattern is `const { pathname } = useLocation()`. In edge cases involving programmatic navigation during render, `window.location` may be stale relative to the React Router state.

---

#### Issue L2: Stale PAGE_NAMES entries
**File:** `packages/app/src/components/layout.tsx:30`

Two entries in PAGE_NAMES have no corresponding active route:
- `workflows: 'Workflows'` — the route is `n8n-workflows`, not `workflows`. `/workflows` is only a redirect.
- `sketchvibe: 'SketchVibe'` — no route exists for sketchvibe.

---

## What Passes ✓

| Check | Result |
|---|---|
| All lazy imports resolve to existing files | ✓ PASS (command-center/index.tsx exists in subdirectory) |
| All export names match lazy import `.then(m => m.XxxPage)` | ✓ PASS — all 34 exports verified |
| Sidebar NavLink paths match App.tsx routes | ✓ PASS — all 25 sidebar links have corresponding routes |
| `useNavigate` in hub/index.tsx → `/jobs`, `/nexus`, `/costs`, `/agents` | ✓ PASS |
| `useNavigate` in dashboard.tsx → `/activity-log` | ✓ PASS |
| `jobs.tsx` Link → `/chat?session=...` and `/reports/:id` | ✓ PASS |
| Layout renders `<Outlet />` in main content area | ✓ PASS (layout.tsx:195) |
| ProtectedRoute wraps Layout (all protected routes share auth) | ✓ PASS |
| Breadcrumb "CORTHEX" → `/dashboard` is a valid route | ✓ PASS |
| Legacy paths redirect correctly (command-center→hub, org→organization, etc.) | ✓ PASS |

---

## Summary

The routing architecture is fundamentally sound — all sidebar links resolve to real routes, all lazy imports resolve to existing files with correct export names, and `<Outlet />` renders page content correctly. However:

- **Notifications badge is completely broken** (H1) — this needs immediate fixing
- **Organization page is inaccessible** from sidebar (H2) — important feature hidden
- **3 breadcrumb names are malformed** (M1) — low effort to fix
- **5 dead lazy imports** (M2) should be cleaned up
- **Sketchvibe is orphaned** (M3) — needs a decision: route it or delete it

**Fix priority:** H1 (notifications badge) → H2 (add /organization to sidebar) → M1 (PAGE_NAMES) → M2+M3 (cleanup)
