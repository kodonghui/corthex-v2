# Phase 4-2 CRITIC-B: Routing Verification — Cycle 2 Re-review

**Reviewer:** CRITIC-B
**Phase:** 4-2 (Core Pages Rebuild)
**Cycle:** 2 (post-fix re-review)
**Date:** 2026-03-25

---

## Score: 8 / 10 (up from 7/10)

**Verdict:** PASS — Both functional bugs are fixed. Remaining issues are code quality / cosmetic only.

---

## Fix Verification

### H1 — Notifications badge: FIXED ✓
`/notifications` is now present in the SYSTEM navSection (sidebar.tsx:64) with `Bell` icon:
```tsx
{ to: '/notifications', label: '알림', icon: Bell },
```
The badge condition `item.to === '/notifications'` at line 176 now correctly matches this item. `Bell` is imported at line 10. Unread count will display when `unreadCount > 0`. **Fully resolved.**

### H2 — /organization inaccessible: FIXED ✓
`/organization` added to ORGANIZATION group (sidebar.tsx:33):
```tsx
{ to: '/organization', label: '조직', icon: Building2 },
```
Route exists in App.tsx (line 118), `OrganizationPage` lazy import resolves to `organization.tsx`. **Fully resolved.**

### M1 — PAGE_NAMES missing routes: FIXED ✓
Five new entries added to layout.tsx (lines 41-45):
```tsx
'n8n-workflows': 'Workflows',
'marketing-pipeline': 'Marketing Pipeline',
'marketing-approval': 'Content Approval',
organization: 'Organization',
onboarding: 'Onboarding',
```
All three previously malformed breadcrumbs ("N8n-workflows", "Marketing-pipeline", "Marketing-approval") now display correctly. **Fully resolved.**

---

## Remaining Issues

### MEDIUM

#### Issue M1 (new): Duplicate `Building2` icon — `/organization` and `/departments`
**File:** `packages/app/src/components/sidebar.tsx:33,35`

```tsx
{ to: '/organization', label: '조직',  icon: Building2 },  // line 33
{ to: '/departments',  label: '부서',  icon: Building2 },  // line 35
```

Both items in the same ORGANIZATION section share the `Building2` icon. In **collapsed sidebar mode** (icon-only view), users see two identical icons adjacent to each other with no label to distinguish them. The tooltip (`title={collapsed ? item.label : undefined}`) does help on hover, but passive visual scanning is broken.

Suggested fix: use `Network` or `Sitemap` for `/organization` (org chart concept) vs `Building2` for `/departments`.

---

#### Issue M2 (carried over): 5 dead lazy imports in App.tsx
**File:** `packages/app/src/App.tsx` lines 9, 23, 24, 27, 28

Not addressed in this cycle. `CommandCenterPage`, `OrgPage`, `HomePage`, `CronBasePage`, `ArgosPage` remain imported but are never rendered (their routes are all `<Navigate>` redirects). Dead code that should be removed.

---

#### Issue M3 (carried over): `sketchvibe.tsx` is orphaned + stale PAGE_NAMES entry
**File:** `packages/app/src/pages/sketchvibe.tsx` + `layout.tsx:20`

Not addressed. `sketchvibe.tsx` exports `SketchVibePage` but has no route, no lazy import, no sidebar link. `sketchvibe: 'SketchVibe'` in PAGE_NAMES is stale. Needs a decision: route it or delete it.

---

### LOW

#### Issue L1 (carried over): ProtectedRoute reads `window.location.pathname`
**File:** `packages/app/src/App.tsx:68`

Not addressed. Edge case only — `useLocation()` is the correct pattern inside BrowserRouter context.

#### Issue L2 (partial): Stale PAGE_NAMES entries remain
**File:** `packages/app/src/components/layout.tsx:20,26`

`workflows: 'Workflows'` and `sketchvibe: 'SketchVibe'` remain. `workflows` is harmless (the redirect fires before Layout renders the breadcrumb). `sketchvibe` is dead since no route or page navigates there.

---

## Summary Table

| Issue | Cycle 1 | Cycle 2 |
|---|---|---|
| H1: Notifications badge broken | FAIL | **FIXED ✓** |
| H2: /organization inaccessible | FAIL | **FIXED ✓** |
| M1: 3 broken breadcrumbs | FAIL | **FIXED ✓** |
| M_new: Duplicate Building2 icon | — | NEW ⚠️ |
| M2: 5 dead lazy imports | FAIL | still open |
| M3: sketchvibe orphaned | FAIL | still open |
| L1: window.location in ProtectedRoute | FAIL | still open |
| L2: stale PAGE_NAMES entries | FAIL | partial |

**Score progression: 7 → 8**

All functional bugs resolved. The new duplicate-icon issue is a UX problem in collapsed mode but not a routing breakage. Remaining open items are cleanup/quality.
