# Fix Log — Phase 0 Step 1: CORTHEX Technical Spec

**Applied**: 2026-03-12
**Pre-fix lines**: 817
**Post-fix lines**: 1010
**Total issues fixed**: 17 (8 from Critic-A + 9 from Critic-B)

---

## Fixes Applied

### From Critic-B (Critical — data correctness)

| # | Issue | Fix Applied |
|---|-------|------------|
| B1 | CRITICAL: Fake AGORA SSE endpoint `SSE /api/workspace/debates/:id/stream` | Removed. Section 4.9 now lists only actual endpoints: POST /, POST /:id/start, GET /, GET /:id, GET /:id/timeline. Added note: "AGORA uses polling, not SSE." |
| B2 | CRITICAL: Fake `GET /api/workspace/costs` in Section 4.14 | Removed. Replaced with correct `GET /api/workspace/dashboard/costs` |
| B3 | HIGH: RBAC role naming confusion (UX labels ≠ DB enums) | Added role mapping table to Section 1.2: UX "CEO/Employee" → DB `role:'user'`, "Company Admin" → `admin_role:'admin'`, "Super Admin" → `admin_role:'superadmin'`. Warning note added. |
| B4 | HIGH: Missing 4 tables in Section 5 | Added Section 5.6 "Supporting Tables": admin_sessions, invitations, employee_departments, notification_preferences + audit_logs with UI impact column. Old 5.6 renumbered to 5.7. |
| B5 | HIGH: ARGOS listed in SSE section (7.1) incorrectly | Removed ARGOS from 7.1. Added note: "ARGOS uses WebSocket channel #6 only." |
| B6 | MEDIUM: agents table missing userId (NOT NULL) + tier enum deprecated note | Updated agents row in Section 5.1: added userId (NOT NULL), ownerUserId (nullable), and deprecation warning on `tier` enum. |
| B7 | MEDIUM: WebSocket message envelope format missing | Added `{ channel, type, payload }` envelope format + channel-specific events table to Section 7.2. |
| B8 | MEDIUM: Section 8.5 conflicting ApiResponse patterns | Fixed: now clearly shows `{ success: true, data: T }` and `{ success: true, data: T[], meta: { page, total } }` for paginated. Removed the confusing note about ApiResponse<T>. |
| B9 | LOW: Section 2.3 Home Page vague purpose | Specified: renders own content (not redirect), fetches dashboard summary + recent activity, lists actual APIs called. |

### From Critic-A (Critical/High — designer usability)

| # | Issue | Fix Applied |
|---|-------|------------|
| A1 | CRITICAL: Navigation sidebar structure absent | Added Section 9 with complete nav tables from actual sidebar.tsx code — both app (4 groups, 27 items) and admin (18 items + footer). Includes exact icons, display labels, and route paths. |
| A2 | HIGH: Missing /admin/audit-logs page | Added Section 3.22: purpose, components, API endpoint with all query params, CRUD (read-only), data shape. Also added to Section 4.14 endpoint map. |
| A3 | HIGH: Tracker Panel not specified | Added Section 2.4.1 "Tracker Panel (핸드오프 트래커)": placement (collapsible right panel ~280px), data shape (from/to/depth chain array), visual pattern (vertical linear timeline), deep work step display, cost badge on done event. |
| A4 | HIGH: Terminology undefined (Hub vs 사령관실 vs 허브) | Added Section 8.7 UI Terminology Map: canonical page title, sidebar label, and optional Korean subtitle for all 15 key screens. Rule: Korean for nav, English for page heading. |
| A5 | HIGH: Non-responsive constraint not documented | Added Section 8.6 "Desktop-Only Design Constraint": min-width 1280px, no mobile layouts, no responsive breakpoints, scope note. |
| A6 | MEDIUM: Component names kebab-case in Section 2.4 | Fixed Section 2.4 Key Components: ChatArea, SessionPanel, ToolCallCard, MarkdownRenderer (PascalCase) |
| A7 | MEDIUM: Empty/loading/error states undocumented | Added Section 8.8 UI States Catalogue: 8 feature areas × 3 states (empty/loading/error) with specific copy and visual cue guidance. |
| A8 | MEDIUM: Onboarding not marked as out-of-scope | Added ⚠️ DEFERRED marker to Section 2.2 and Section 3.21 with explicit "Do NOT design this screen now" note. |

---

## Verification

- Confirmed AGORA endpoints against `packages/server/src/routes/workspace/debates.ts` ✅
- Confirmed sidebar nav from `packages/app/src/components/sidebar.tsx` + `packages/admin/src/components/sidebar.tsx` ✅
- Confirmed audit-logs endpoint from `packages/server/src/routes/admin/audit-logs.ts` ✅
- Confirmed agents table schema from `packages/server/src/db/schema.ts` ✅
