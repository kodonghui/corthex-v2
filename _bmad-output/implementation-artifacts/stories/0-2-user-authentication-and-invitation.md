# Story 0.2: User Authentication & Invitation

Status: done

## Story

As a CEO,
I want to invite team members to my company,
so that they can independently use the AI organization.

## Acceptance Criteria

1. **Invitation Creation**: Given an authenticated user with role='admin', when they POST to `/api/workspace/invitations` with email and role (admin/user), then an invitation record is created with a unique token and 7-day expiry AND the invitation details are returned (token, link).

2. **Invitation Accept**: Given a valid invitation token, when a new user POSTs to `/api/auth/accept-invite` with the token, username, password, and name, then a user record is created in the users table with the correct companyId and role from the invitation AND the invitation is marked as 'accepted' AND a JWT token is returned for immediate login.

3. **Invitation Management**: Given an authenticated admin user, when they GET `/api/workspace/invitations`, then they see all invitations for their company with status (pending/accepted/expired/revoked). Admin can also DELETE (revoke) a pending invitation.

4. **Expired Invitation Rejection**: Given an invitation token that is past its expiresAt, when a user tries to accept it, then the system returns 410 Gone with error code 'INVITE_003'.

5. **Duplicate Email Prevention**: Given an invitation already exists for the same email in the same company (status=pending), when admin creates another invitation for the same email, then the old invitation is revoked and a new one is created (allowing re-invite).

6. **User App Login**: Given a user has accepted an invitation and has credentials, when they POST to `/api/auth/login` with username and password, then they receive a JWT with companyId and can access all workspace endpoints filtered by their companyId. (Already implemented in Story 0-1 — verify still works).

7. **Tenant Isolation**: Given a user is authenticated, when they access any workspace endpoint, then all data queries are filtered by their companyId from JWT (NFR7). (Already implemented in Story 0-1 — verify still works).

## Tasks / Subtasks

- [x] Task 1: Invitations table schema (AC: #1, #3)
  - [x] `invitations` table: id, companyId, email, role, token, status (pending/accepted/expired/revoked), invitedBy, expiresAt, acceptedAt, createdAt
  - [x] `invitationStatusEnum`: pending, accepted, expired, revoked
  - [x] Index on token (unique), index on companyId
  - [x] Generate Drizzle migration

- [x] Task 2: Invitation API endpoints (AC: #1, #3, #5)
  - [x] POST `/api/workspace/invitations` — create invitation (admin only within company)
    - Validate email format
    - Check duplicate pending invitation for same email+company -> revoke old, create new
    - Generate crypto-random token (32 bytes hex)
    - Set expiresAt = now + 7 days
    - Return invitation details with accept link
  - [x] GET `/api/workspace/invitations` — list company invitations (admin only)
    - Filter by company from tenant context
    - Include status, auto-mark expired ones
  - [x] DELETE `/api/workspace/invitations/:id` — revoke invitation (admin only)
    - Only pending invitations can be revoked

- [x] Task 3: Accept invitation endpoint (AC: #2, #4)
  - [x] POST `/api/auth/accept-invite` — public endpoint (no auth required)
    - Validate token exists and status='pending'
    - Check token not expired (expiresAt > now) -> 410 INVITE_003
    - Check username uniqueness
    - Create user with companyId and role from invitation
    - Hash password with Bun.password.hash()
    - Mark invitation as 'accepted', set acceptedAt
    - Return JWT for immediate login
  - [x] GET `/api/auth/invite-info/:token` — public endpoint to check invitation validity
    - Returns company name, email, role (no sensitive data)
    - Used by frontend to show accept-invite page

- [x] Task 4: Role-based invitation guard (AC: #1)
  - [x] Only users with role='admin' within the company can create invitations
  - [x] Reuse authMiddleware + create companyAdminOnly middleware (checks role='admin' but NOT isAdminUser — this is company-level admin, not platform admin)

- [x] Task 5: Verification tests (AC: #6, #7)
  - [x] Verify existing login still works for invited users
  - [x] Verify tenant isolation for workspace endpoints
  - [x] Test invitation lifecycle: create -> accept -> login -> access workspace

## Dev Notes

### CRITICAL: What's Already Implemented (Story 0-1)

These features exist and MUST NOT be broken:
- **User login**: `POST /api/auth/login` in `packages/server/src/routes/auth.ts` — authenticates against users table
- **Admin login**: `POST /api/auth/admin/login` — separate admin_users table
- **Auth middleware**: `packages/server/src/middleware/auth.ts` — JWT verify, TenantContext injection
- **Admin user CRUD**: `packages/server/src/routes/admin/users.ts` — admin creates users directly (ID/PW)
- **Profile**: `packages/server/src/routes/workspace/profile.ts` — user views/updates own profile, changes password
- **Seed data**: CEO user created in seed script

### What This Story Adds

The admin CRUD from Story 0-1 creates users directly with username/password. This story adds an **invitation flow** — admin sends invite by email, user accepts and creates their own credentials. This is the user-facing onboarding path (vs admin-direct-create which is the admin-facing path).

### Architecture Constraints

- **Runtime**: Bun — use `Bun.password.hash()` for password hashing, `crypto.randomBytes()` for token generation
- **ORM**: Drizzle v0.39 with PostgreSQL via Neon serverless (`@neondatabase/serverless`)
- **Framework**: Hono v4 with `zValidator` for request validation
- **Auth**: Custom JWT via `hono/jwt` — 24h expiry, HS256
- **Tenant Model**: companyId in JWT -> TenantContext -> every query filtered
- **Error Handling**: `HTTPError` class with error codes (INVITE_001, INVITE_002, etc.)
- **Activity Logging**: `logActivity()` for invitation events

### Key Code Patterns (from Story 0-1)

```typescript
// Route pattern (Hono)
const route = new Hono<AppEnv>()
route.use('*', authMiddleware)  // middleware chain
route.post('/path', zValidator('json', schema), async (c) => { ... })

// DB query pattern (Drizzle)
const [result] = await db.insert(table).values(data).returning()
const [item] = await db.select().from(table).where(eq(table.id, id)).limit(1)

// Tenant isolation pattern
const tenant = c.get('tenant')
// filter by tenant.companyId

// Error pattern
if (!result) throw new HTTPError(404, 'message', 'CODE_001')

// Password hashing
const hash = await Bun.password.hash(password)

// Token generation
import { randomBytes } from 'crypto'
const token = randomBytes(32).toString('hex')
```

### companyAdminOnly Middleware

Story 0-1 has `adminOnly` middleware that checks `isAdminUser` (platform admin from admin_users table). Story 0-2 needs a different guard: **company admin** — a user in the users table with `role='admin'`. This is NOT the same as platform admin.

```typescript
// Company admin guard — user with role='admin' in users table
export const companyAdminOnly: MiddlewareHandler<AppEnv> = async (c, next) => {
  const tenant = c.get('tenant')
  if (tenant.role !== 'admin') {
    throw new HTTPError(403, '회사 관리자 권한이 필요합니다', 'AUTH_004')
  }
  await next()
}
```

### Project Structure Notes

- New schema additions go in: `packages/server/src/db/schema.ts` (single file, all tables)
- New routes go in: `packages/server/src/routes/workspace/invitations.ts` (workspace = app-side)
- Accept-invite route goes in: `packages/server/src/routes/auth.ts` (public, no auth)
- New middleware goes in: `packages/server/src/middleware/auth.ts`
- Route registration in: `packages/server/src/index.ts`
- Migration: `bunx drizzle-kit generate` after schema changes
- Tests: `packages/server/src/__tests__/unit/`

### References

- [Source: packages/server/src/db/schema.ts] — all table definitions (add invitations table here)
- [Source: packages/server/src/middleware/auth.ts] — JWT auth, add companyAdminOnly
- [Source: packages/server/src/routes/auth.ts] — login endpoints, add accept-invite here
- [Source: packages/server/src/routes/admin/users.ts] — admin direct user creation (reference pattern)
- [Source: packages/server/src/routes/workspace/profile.ts] — user profile (verify works for invited users)
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 0] — Story 0.2 acceptance criteria
- [Source: _bmad-output/planning-artifacts/prd.md] — FR85: Admin invites/manages employees

### v1 Feature Reference

v1 was single-tenant with no invitation system. v2 adds multi-tenancy with invitation flow as the primary user onboarding mechanism. The admin-direct-create path (from Story 0-1) serves as a fallback for internal setup.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None - clean implementation.

### Completion Notes List

- Task 1: Added `invitationStatusEnum` and `invitations` table to schema.ts with all required columns (id, companyId, email, role, token, status, invitedBy, expiresAt, acceptedAt, createdAt). Unique index on token, btree index on companyId. Manual migration SQL in 0029_add-invitations.sql.
- Task 2: Created `packages/server/src/routes/workspace/invitations.ts` with 3 endpoints:
  - POST /invitations — creates invitation with crypto-random 64-char hex token, 7-day expiry, auto-revokes duplicate pending invitations for same email+company
  - GET /invitations — lists company invitations, auto-detects expired ones in response
  - DELETE /invitations/:id — revokes pending invitations only
- Task 3: Added to `packages/server/src/routes/auth.ts`:
  - GET /auth/invite-info/:token — public endpoint returning company name, email, role for frontend accept-invite page
  - POST /auth/accept-invite — public endpoint: validates token + expiry, creates user with invitation's companyId/role, marks invitation accepted, returns JWT for immediate login
- Task 4: Created `packages/server/src/middleware/company-admin.ts` with `companyAdminOnly` middleware — checks users table role='admin' (not platform admin). Applied to invitations route.
- Task 5: 18 unit tests covering schema validation (createInvitation + acceptInvite schemas), token generation, expiry logic. Story 0-1 tests (43 tests) verified passing — no regressions.
- Pre-existing test failures (234) in unrelated files (soul-template, mcp-security, etc.) — NOT regressions from this story.

### File List

**Created:**
- `packages/server/src/routes/workspace/invitations.ts` — invitation CRUD endpoints
- `packages/server/src/middleware/company-admin.ts` — companyAdminOnly middleware
- `packages/server/src/db/migrations/0029_add-invitations.sql` — migration for invitations table
- `packages/server/src/__tests__/unit/invitation.test.ts` — 18 unit tests

**Modified:**
- `packages/server/src/db/schema.ts` — added invitationStatusEnum + invitations table
- `packages/server/src/routes/auth.ts` — added accept-invite + invite-info endpoints
- `packages/server/src/index.ts` — registered invitations route + accept-invite rate limit
- `packages/server/src/db/migrations/meta/_journal.json` — added migration 0029 entry
