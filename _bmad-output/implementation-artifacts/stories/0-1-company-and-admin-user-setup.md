# Story 0.1: Company & Admin User Setup

Status: done

## Story

As an admin,
I want to create a company and admin account,
so that I have an isolated workspace for my organization.

## Acceptance Criteria

1. **Company Registration**: Given no company exists, when admin registers with company name, slug, email, and password, then a new company record is created with unique companyId AND an admin_user record is created with hashed password AND a JWT token is returned for admin console access.

2. **Admin JWT Context Injection**: Given an admin is authenticated, when they access any API endpoint, then the companyId is injected into the request context from the JWT.

3. **Company CRUD (Admin)**: Admin can list, view, create, update, and soft-delete (deactivate) companies via `/api/admin/companies` endpoints.

4. **Admin User CRUD**: Superadmin can create/manage admin_users. Admin users authenticate via `/api/auth/admin/login` with separate JWT containing `type: 'admin'`.

5. **User CRUD (Admin)**: Admin can create users (employees) for a specific companyId with username/password, list/view/update/deactivate users, and reset passwords.

6. **Tenant Isolation**: All user queries filter by companyId from JWT. Admin users (type: 'admin') can access cross-company data.

7. **Seed Data**: Seed script creates initial company (CORTHEX HQ), admin user, CEO user, departments, agents, and builtin tools.

8. **Dual Auth System**: Separate login endpoints for admin_users (`/api/auth/admin/login`) and users (`/api/auth/login`), each returning JWT with appropriate claims.

## Tasks / Subtasks

- [x] Task 1: Company table schema (AC: #1, #3)
  - [x] companies table with id, name, slug, smtpConfig, isActive, timestamps
  - [x] Unique constraint on slug
- [x] Task 2: Admin Users table schema (AC: #4)
  - [x] admin_users table with id, username, passwordHash, name, email, role (superadmin/admin), isActive
  - [x] adminRoleEnum ('superadmin', 'admin')
- [x] Task 3: Users table schema (AC: #5, #6)
  - [x] users table with companyId FK, username, passwordHash, name, email, role (admin/user), isActive
  - [x] companyId foreign key to companies
- [x] Task 4: JWT Auth middleware (AC: #2, #8)
  - [x] createToken() with 24h expiry
  - [x] authMiddleware extracts JWT, injects TenantContext (companyId, userId, role, isAdminUser)
  - [x] adminOnly middleware checks role === 'admin' && isAdminUser
- [x] Task 5: Auth routes (AC: #8)
  - [x] POST /api/auth/login (users table)
  - [x] POST /api/auth/admin/login (admin_users table)
  - [x] GET /api/auth/me (current user info)
- [x] Task 6: Admin company routes (AC: #3)
  - [x] GET/POST/PATCH/DELETE /api/admin/companies
  - [x] PUT/DELETE /api/admin/companies/:id/smtp
  - [x] Soft delete with active employee check
- [x] Task 7: Admin user routes (AC: #5)
  - [x] GET/POST/PATCH/DELETE /api/admin/users
  - [x] POST /api/admin/users/:id/reset-password
  - [x] POST /api/admin/users/:id/terminate-session
  - [x] Tenant isolation (admin sees all, non-admin filtered by companyId)
- [x] Task 8: Seed script (AC: #7)
  - [x] Creates CORTHEX HQ company
  - [x] Creates admin + CEO users
  - [x] Creates departments, agents, builtin tools, watchlist
- [x] Task 9: Company self-registration endpoint (AC: #1) -- NEW
  - [x] POST /api/auth/register — creates company + first admin user atomically
  - [x] Returns JWT immediately after registration
  - [x] Validates slug uniqueness before insert
- [x] Task 10: Drizzle migration for existing schema (AC: all)
  - [x] Generate migration from current schema if not already present
  - [x] Ensure migration runs on server startup via runMigrations()

## Dev Notes

### CRITICAL: Most of Story 0-1 is ALREADY IMPLEMENTED

The existing codebase already has:
- **Schema**: `packages/server/src/db/schema.ts` — companies, adminUsers, users tables with all columns, enums, relations
- **Auth**: `packages/server/src/middleware/auth.ts` — JWT create/verify, authMiddleware, adminOnly
- **Routes**: `packages/server/src/routes/auth.ts` — login, admin login, /me
- **Admin CRUD**: `packages/server/src/routes/admin/companies.ts` — full CRUD with SMTP
- **User CRUD**: `packages/server/src/routes/admin/users.ts` — full CRUD with password reset, session terminate
- **Seed**: `packages/server/src/db/seed.ts` — company, users, departments, agents, tools

### What's MISSING (Task 9 & 10)

1. **Self-registration endpoint** (`POST /api/auth/register`): The current system requires a superadmin to create companies via admin routes. There's no public self-registration flow where a new admin can create their own company + account atomically. This is required by AC #1: "when admin registers with company name, email, and password".

2. **Migration files**: The schema exists but migrations may not be generated. Need to verify `packages/server/src/db/migrations/` has current migrations.

### Architecture Constraints

- **Runtime**: Bun (not Node.js) — use `Bun.password.hash()` for password hashing (already done)
- **ORM**: Drizzle v0.39 with PostgreSQL via Neon serverless
- **Framework**: Hono v4 with zValidator for request validation
- **Auth**: Custom JWT via `hono/jwt` — 24h expiry, HS256
- **Tenant Model**: companyId in JWT → TenantContext → every query filtered
- **Error Handling**: HTTPError class with error codes (AUTH_001, COMPANY_001, USER_001, etc.)
- **Activity Logging**: logActivity() for all auth events

### Key Patterns from Existing Code

```typescript
// Route pattern (Hono)
const route = new Hono<AppEnv>()
route.use('*', authMiddleware, adminOnly)  // middleware chain
route.post('/path', zValidator('json', schema), async (c) => { ... })

// DB query pattern (Drizzle)
const [result] = await db.insert(table).values(data).returning()
const [item] = await db.select().from(table).where(eq(table.id, id)).limit(1)

// Tenant isolation pattern
const whereClause = tenant.isAdminUser
  ? eq(table.id, id)
  : and(eq(table.id, id), eq(table.companyId, tenant.companyId))

// Error pattern
if (!result) throw new HTTPError(404, 'message', 'CODE_001')

// Password hashing
const hash = await Bun.password.hash(password)
const valid = await Bun.password.verify(password, hash)
```

### Project Structure Notes

- Schema: `packages/server/src/db/schema.ts` (single file, all tables)
- Routes: `packages/server/src/routes/` (auth.ts, health.ts, admin/*, workspace/*)
- Middleware: `packages/server/src/middleware/` (auth.ts, tenant.ts, rate-limit.ts)
- DB: `packages/server/src/db/` (index.ts, schema.ts, seed.ts, migrations/)
- Shared types: `packages/shared/src/types.ts` (TenantContext defined here)
- Tests: `packages/server/src/__tests__/` (unit/, api/)

### References

- [Source: packages/server/src/db/schema.ts] — companies, adminUsers, users table definitions
- [Source: packages/server/src/middleware/auth.ts] — JWT auth, TenantContext injection
- [Source: packages/server/src/routes/auth.ts] — login endpoints
- [Source: packages/server/src/routes/admin/companies.ts] — company CRUD
- [Source: packages/server/src/routes/admin/users.ts] — user CRUD
- [Source: packages/server/src/db/seed.ts] — seed data
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 0] — Story 0.1 acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md] — tech stack, patterns
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md] — v1 auth/org reference

### v1 Feature Reference

v1 had simple single-tenant auth. v2 adds:
- Multi-tenancy (companyId isolation)
- Dual auth (admin_users vs users)
- Self-registration for new companies
- Admin console for company/user management

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None - clean implementation.

### Completion Notes List

- Tasks 1-8: Already implemented in existing codebase (verified working)
- Task 9: Implemented `POST /api/auth/register` endpoint in `packages/server/src/routes/auth.ts`
  - Creates company + admin user atomically
  - Validates slug uniqueness (409 REG_001)
  - Validates username uniqueness (409 REG_002)
  - Hashes password with Bun.password.hash()
  - Returns JWT + company + user data (201)
  - Rate limited (5/min) via loginRateLimit
  - Activity logged
- Task 10: Verified migrations exist (20 migration files in `packages/server/src/db/migrations/`)
  - runMigrations() called on server startup in `packages/server/src/index.ts`
- Unit tests: 9 tests for register schema validation (all pass)
- Pre-existing test failures in unrelated files (mcp-security-qa, messenger-mobile-pwa) - NOT regressions

### File List

**Modified:**
- `packages/server/src/routes/auth.ts` — added registerSchema + POST /api/auth/register endpoint
- `packages/server/src/index.ts` — added rate limiting for /api/auth/register

**Created:**
- `packages/server/src/__tests__/unit/register-validation.test.ts` — 9 unit tests for register schema validation
- `packages/server/src/__tests__/unit/register-logic.test.ts` — 34 TEA risk-based tests for register logic

**Existing (verified, not modified):**
- `packages/server/src/db/schema.ts`
- `packages/server/src/middleware/auth.ts`
- `packages/server/src/routes/admin/companies.ts`
- `packages/server/src/routes/admin/users.ts`
- `packages/server/src/db/seed.ts`
