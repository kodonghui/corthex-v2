# Agent A — Functional + CRUD — Cycle 18

## CRUD Results

### Department: PASS — create / read / update / delete
- **Create**: Clicked "새 부서 생성" → filled name="테스트부서", desc="E2E Cycle 18 테스트" → submitted → toast "부서가 생성되었습니다" ✅
- **Read**: Department card appeared in list with name, description, "0 Members", "Active" badge ✅
- **Update**: Clicked edit → changed name to "테스트부서-수정됨" → saved → toast "부서가 수정되었습니다" → name updated in list ✅
- **Delete**: Clicked delete → confirmation dialog with impact analysis (agents, tasks, costs) → selected "완료 대기 (권장)" → clicked "삭제 실행" → toast "부서가 삭제되었습니다" → status changed to "Inactive" (soft delete) ✅

### Agent: FAIL — create (500) / read ✅ / update ✅ / delete (no UI button)
- **Create (UI)**: FAIL — 500 error: `agents_user_id_users_id_fk` FK violation. See BUG-A001.
- **Create (API workaround)**: Created via API with correct userId → agent appeared in list ✅
- **Read**: Agent "테스트에이전트" visible in agent list with name, role, tier ✅
- **Update**: Changed name to "테스트에이전트-수정됨" via Configuration tab → toast "에이전트가 수정되었습니다" ✅
- **Delete (UI)**: FAIL — No delete button visible in agent detail panel. See BUG-A003-note.
- **Delete (API)**: Deleted via `DELETE /api/admin/agents/:id` → response "에이전트가 비활성화되었습니다" ✅

### Settings: PASS — change / save / persist
- **Change**: Moved handoff depth slider from 5 → 7, Save/Cancel buttons appeared ✅
- **Save**: Clicked Save → toast "Handoff depth set to 7" ✅
- **Persist**: Navigated away and back → slider still shows 7 ✅

## Page Load Results

| Page | URL | Status | Console Errors | Notes |
|------|-----|--------|---------------|-------|
| Dashboard | /admin | ✅ PASS | 0 | Stats show 2 depts, 1 user, 1 agent (KB-001 for empty company) |
| Companies | /admin/companies | ✅ PASS | 0 | Shows 0 companies when no company selected (BUG-A004) |
| Departments | /admin/departments | ✅ PASS | 0 | Full CRUD works |
| Agents | /admin/agents | ⚠️ PARTIAL | 1 (on create attempt) | Create fails, read/update work |
| Users | /admin/users | ✅ PASS | 0 | User created successfully |
| Employees | /admin/employees | ✅ PASS | 0 | Shows department columns, drag-drop layout |
| Tools | /admin/tools | ✅ PASS | 0 | Empty state, category filter works |
| Credentials | /admin/credentials | ✅ PASS | 0 | Security policy notice, user list |
| API Keys | /admin/api-keys | ✅ PASS | 0 | Empty state with create button |
| Costs | /admin/costs | ✅ PASS | 0 | $0.00 (KB-006), no $$0 bug |
| Monitoring | /admin/monitoring | ✅ PASS | 0 | Server Healthy, DB 70ms, error log shows test FK violations |
| Settings | /admin/settings | ✅ PASS | 0 | All sections render, handoff slider works |

## Bugs

### BUG-A001: Agent CREATE via UI fails with 500 — FK violation (P1)
- **Page**: /admin/agents → New Agent Template → 만들기
- **Error**: `insert or update on table "agents" violates foreign key constraint "agents_user_id_users_id_fk"`
- **Root Cause**: Frontend sends `authUser.id` (from `admin_users` table) as `userId`, but `agents.user_id` FK references the `users` table. Admin user UUID doesn't exist in `users` table.
- **Location**: `packages/admin/src/pages/agents.tsx:239` — `userId: authUser.id`
- **Fix suggestion**: Either make `userId` optional/nullable in the agents schema (agent templates don't need a user owner), or auto-create a corresponding `users` entry for admin users, or use a separate field.
- **Screenshot**: `screenshots/06-agent-create-500.png`

### BUG-A002: Onboarding loop — redirects to onboarding on every page reload (P1)
- **Page**: Any admin page after full page reload (F5 / navigate)
- **Behavior**: After completing onboarding ("CORTHEX 사용 시작하기"), any hard page reload redirects back to `/admin/onboarding` step 1. User must click through all 5 steps again.
- **Expected**: Onboarding completion should be persisted (e.g., in `company.settings.onboardingCompleted`). Once completed, should never redirect back.
- **Impact**: Critical UX issue — makes the admin panel nearly unusable for new companies. Every browser refresh forces re-onboarding.
- **Screenshot**: `screenshots/01-onboarding-start.png` (shown on every reload)

### BUG-A003: No delete button for agents in UI (P2)
- **Page**: /admin/agents → agent detail panel → Configuration tab
- **Behavior**: No delete/deactivate button visible. Only "Save Changes" and "Reset to Admin Soul" buttons.
- **Expected**: A delete or deactivate button should exist (like departments have edit/delete icons)
- **Workaround**: Delete via API `DELETE /api/admin/agents/:id` works correctly
- **Screenshot**: `screenshots/07-agent-updated.png`

### BUG-A004: Company list shows 0 companies when no company selected (P2)
- **Page**: /admin/companies + sidebar company dropdown
- **Behavior**: Sidebar shows "등록된 회사 없음" even when companies exist in DB. Companies page shows "0 companies".
- **Root Cause**: `GET /api/admin/companies` goes through `tenantMiddleware` which returns empty array `[]` when `companyId` is not a valid UUID (admin JWT has `companyId='system'`). Chicken-and-egg: need to select company → need company list → need company selected.
- **Workaround**: Set `localStorage` manually with company ID, or use super-admin API with `?companyId=` override.
- **Impact**: First-time admin login with fresh DB cannot see or select any company through the UI.

### BUG-A005: Super-admin POST /api/super-admin/companies requires ?companyId= workaround (P3)
- **Endpoint**: `POST /api/super-admin/companies`
- **Behavior**: Returns `TENANT_003` ("회사를 먼저 선택해주세요") even though the route does NOT use `tenantMiddleware`. GET works fine.
- **Root Cause**: Unclear — the route only uses `authMiddleware + rbacMiddleware('super_admin')`, not `tenantMiddleware`. Possible Hono route matching issue with POST method.
- **Workaround**: Add `?companyId=00000000-0000-0000-0000-000000000000` query parameter.
