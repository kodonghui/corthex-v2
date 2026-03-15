# Story 16.5: Admin Credentials CRUD API Routes

Status: done

## Story

As a **Technical Admin (박현우)**,
I want `POST/GET/PUT/DELETE /admin/credentials` routes that handle encrypted credential storage and masked display,
So that Admin can register API keys without the application ever storing plaintext.

## Acceptance Criteria

**AC1 — POST /admin/credentials stores encrypted, returns masked**
- Given: `POST /admin/credentials` with body `{ keyName: 'tistory_access_token', value: 'actual-oauth-token-xyz' }`
- When: the route handler executes
- Then: calls `encrypt(value)` and stores `encryptedValue` in DB (plaintext `value` never written to DB)
- And: returns `{ success: true, data: { id, keyName, updatedAt } }` (no encryptedValue in response)
- And: `created_by_user_id` is set from `ctx.userId`

**AC2 — GET /admin/credentials returns masked list**
- Given: `GET /admin/credentials`
- When: the route executes
- Then: returns `{ success: true, data: [{ id, keyName, updatedAt }] }` (encryptedValue NOT in response)
- And: only credentials belonging to the Admin's `companyId` are returned

**AC3 — PUT /admin/credentials/:keyName updates encrypted value**
- Given: `PUT /admin/credentials/:keyName` with body `{ value: 'new-token' }`
- When: the route executes
- Then: the existing credential's `encryptedValue` is updated with `encrypt(newValue)`
- And: `updated_by_user_id` is updated from `ctx.userId`
- And: returns `{ success: true, data: { keyName, updatedAt } }`

**AC4 — DELETE /admin/credentials/:keyName audits then deletes**
- Given: `DELETE /admin/credentials/:keyName`
- When: the route executes
- Then: **before** deleting, logs audit to structured logger: `{ event: 'credential_deleted', keyName, companyId, userId, timestamp }` at INFO level via `console.info(JSON.stringify(...))`
- And: then deletes the credential row
- And: returns `{ success: true }`

**AC5 — Duplicate keyName returns 409**
- Given: `POST /admin/credentials` with a `keyName` that already exists for this company
- When: the route executes
- Then: returns `{ success: false, error: { code: 'CREDENTIAL_DUPLICATE_KEY', message: 'Key name already exists' } }` (HTTP 409)

## Tasks / Subtasks

- [x] Task 1: Add `CREDENTIAL_DUPLICATE_KEY` to `packages/server/src/lib/error-codes.ts` (AC: #5)
  - [x] 1.1: Add `CREDENTIAL_DUPLICATE_KEY: 'CREDENTIAL_DUPLICATE_KEY'` to ERROR_CODES

- [x] Task 2: Add new CRUD routes to `packages/server/src/routes/admin/credentials.ts` (AC: #1–#5)
  - [x] 2.1: Add `tenantMiddleware` import
  - [x] 2.2: Add `encrypt` import from `@/lib/credential-crypto`
  - [x] 2.3: Add `getDB` import from `@/db/scoped-query`
  - [x] 2.4: Add zod schema `credentialWriteSchema = z.object({ keyName, value })`
  - [x] 2.5: Implement `GET /credentials` — calls `getDB(tenant.companyId).listCredentials()`
  - [x] 2.6: Implement `POST /credentials` — encrypt + insertCredential + 409 on duplicate
  - [x] 2.7: Implement `PUT /credentials/:keyName` — encrypt + updateCredential + 404 check
  - [x] 2.8: Implement `DELETE /credentials/:keyName` — audit log + deleteCredential + 404 check

- [x] Task 3: Write unit tests in `packages/server/src/__tests__/unit/admin-credentials-crud.test.ts` (AC: #1–#5)
  - [x] 3.1: AC1 — POST encrypts + stores, response excludes encryptedValue
  - [x] 3.2: AC2 — GET returns masked list
  - [x] 3.3: AC3 — PUT updates encrypted value
  - [x] 3.4: AC4 — DELETE logs audit before deleting
  - [x] 3.5: AC5 — POST duplicate returns 409

- [x] Task 4: Verify `npx tsc --noEmit` passes

## Dev Notes

### Architecture Decision — Route File

**File to MODIFY:** `packages/server/src/routes/admin/credentials.ts`

The existing file already handles legacy `cli-credentials` and `api-keys` routes. The new routes for the `credentials` table (Story 16.2, D23) are added to the SAME file. The new route paths are `/credentials` and `/credentials/:keyName` — no collision with existing `/cli-credentials` or `/api-keys/*`.

**Route registration** — already exists in `packages/server/src/index.ts`:
```typescript
import { credentialsRoute } from './routes/admin/credentials'
app.route('/api/admin', credentialsRoute)
```
No changes to `index.ts` needed.

### Middleware Pattern

The new routes must use `tenantMiddleware` for companyId isolation. Add it as per-route middleware:

```typescript
import { tenantMiddleware } from '../../middleware/tenant'

// New credential routes use tenantMiddleware (unlike legacy routes in this file)
credentialsRoute.get('/credentials', tenantMiddleware, async (c) => { ... })
credentialsRoute.post('/credentials', tenantMiddleware, zValidator('json', credentialWriteSchema), async (c) => { ... })
credentialsRoute.put('/credentials/:keyName', tenantMiddleware, zValidator('json', credentialUpdateSchema), async (c) => { ... })
credentialsRoute.delete('/credentials/:keyName', tenantMiddleware, async (c) => { ... })
```

### E11 Compliance — Only credential-crypto for encrypt

```typescript
import { encrypt } from '../../lib/credential-crypto'  // NOT crypto.ts (legacy)
```

### Zod Schemas

```typescript
const credentialWriteSchema = z.object({
  keyName: z.string().min(1).max(255),
  value: z.string().min(1),
})

const credentialUpdateSchema = z.object({
  value: z.string().min(1),
})
```

### Full Implementation Blueprint

```typescript
// === Story 16.5: Tool Credential CRUD (D23, E11, FR-CM1~4, FR-CM6) ===

// GET /api/admin/credentials — masked list (AC2)
credentialsRoute.get('/credentials', tenantMiddleware, async (c) => {
  const tenant = c.get('tenant')
  const rows = await getDB(tenant.companyId).listCredentials()
  return c.json({ success: true, data: rows })
})

// POST /api/admin/credentials — register new credential (AC1, AC5)
credentialsRoute.post('/credentials', tenantMiddleware, zValidator('json', credentialWriteSchema), async (c) => {
  const tenant = c.get('tenant')
  const { keyName, value } = c.req.valid('json')
  const encryptedValue = await encrypt(value)

  try {
    const [row] = await getDB(tenant.companyId).insertCredential(
      { keyName, encryptedValue },
      tenant.userId,
    )
    return c.json({ success: true, data: { id: row.id, keyName: row.keyName, updatedAt: row.updatedAt } }, 201)
  } catch (err: unknown) {
    // PostgreSQL unique constraint violation code '23505'
    if (isDuplicateKeyError(err)) {
      return c.json({ success: false, error: { code: 'CREDENTIAL_DUPLICATE_KEY', message: 'Key name already exists' } }, 409)
    }
    throw err
  }
})

// PUT /api/admin/credentials/:keyName — update credential (AC3)
credentialsRoute.put('/credentials/:keyName', tenantMiddleware, zValidator('json', credentialUpdateSchema), async (c) => {
  const tenant = c.get('tenant')
  const keyName = c.req.param('keyName')
  const { value } = c.req.valid('json')
  const encryptedValue = await encrypt(value)

  const rows = await getDB(tenant.companyId).updateCredential(keyName, encryptedValue, tenant.userId)
  if (rows.length === 0) {
    return c.json({ success: false, error: { code: 'CREDENTIAL_NOT_FOUND', message: 'Credential not found' } }, 404)
  }
  return c.json({ success: true, data: { keyName: rows[0].keyName, updatedAt: rows[0].updatedAt } })
})

// DELETE /api/admin/credentials/:keyName — audit log then delete (AC4)
credentialsRoute.delete('/credentials/:keyName', tenantMiddleware, async (c) => {
  const tenant = c.get('tenant')
  const keyName = c.req.param('keyName')

  // AC4: Audit log BEFORE delete (structured logger — tool_call_events not yet available in Phase 1)
  console.info(JSON.stringify({
    event: 'credential_deleted',
    keyName,
    companyId: tenant.companyId,
    userId: tenant.userId,
    timestamp: new Date().toISOString(),
  }))

  const rows = await getDB(tenant.companyId).deleteCredential(keyName)
  if (rows.length === 0) {
    return c.json({ success: false, error: { code: 'CREDENTIAL_NOT_FOUND', message: 'Credential not found' } }, 404)
  }
  return c.json({ success: true })
})
```

### Duplicate Key Detection Helper

```typescript
function isDuplicateKeyError(err: unknown): boolean {
  // Drizzle wraps pg errors — check the constraint violation code
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>
    // PostgreSQL error code 23505 = unique_violation
    if (e.code === '23505') return true
    // Drizzle may wrap it — check cause
    if (e.cause && typeof e.cause === 'object') {
      return (e.cause as Record<string, unknown>).code === '23505'
    }
  }
  return false
}
```

### CREDENTIAL_NOT_FOUND Error Code

While the story doesn't specify CREDENTIAL_NOT_FOUND in error-codes.ts, add it alongside CREDENTIAL_DUPLICATE_KEY for consistency:

```typescript
CREDENTIAL_DUPLICATE_KEY: 'CREDENTIAL_DUPLICATE_KEY',
CREDENTIAL_NOT_FOUND: 'CREDENTIAL_NOT_FOUND',
```

### Testing Pattern (bun:test — route structure tests)

The test pattern follows `tier-crud-api.test.ts` — structural tests verifying route exists, middleware is applied, and correct DB methods are called:

```typescript
import { describe, test, expect } from 'bun:test'
import { Hono } from 'hono'
import { credentialsRoute } from '../../routes/admin/credentials'

// Set env vars before any credential-crypto import chain
process.env.CREDENTIAL_ENCRYPTION_KEY = 'ab'.repeat(32)

describe('Admin Credentials CRUD — Story 16.5', () => {
  test('credentialsRoute is a valid Hono instance', () => {
    expect(credentialsRoute).toBeInstanceOf(Hono)
  })
  // ... source code content checks
})
```

**AC5 duplicate detection test**: verify `isDuplicateKeyError` helper function directly:
```typescript
import { isDuplicateKeyError } from '../../routes/admin/credentials'
// ... export it from the route file for testability
```

### Existing credentials.ts File Context

The existing file:
1. Imports: `Hono`, `zValidator`, `z`, `eq`, `and`, `db`, `cliCredentials`, `authMiddleware`, `adminOnly`, `HTTPError`, `encrypt` (from `./lib/crypto` — the OLD crypto, not credential-crypto), `credential-vault` services
2. Route middleware: `credentialsRoute.use('*', authMiddleware, adminOnly)`
3. Handles `/cli-credentials` (GET/POST/DELETE) and `/api-keys/*` (GET/POST/PUT/DELETE)

**CRITICAL**: The existing `encrypt` import is from `../../lib/crypto` (legacy). The new routes MUST import `encrypt` from `../../lib/credential-crypto` (AES-256-GCM, D23). Use a named alias to avoid collision:
```typescript
import { encrypt as encryptCredential } from '../../lib/credential-crypto'
```

### Error Codes to Add to error-codes.ts

```typescript
// Credential route errors (Story 16.5)
CREDENTIAL_DUPLICATE_KEY: 'CREDENTIAL_DUPLICATE_KEY',
CREDENTIAL_NOT_FOUND: 'CREDENTIAL_NOT_FOUND',
```

### Previous Story Intelligence (16.4)

- `getDB(companyId).listCredentials()` → `{id, keyName, updatedAt}[]` (no encryptedValue)
- `getDB(companyId).insertCredential({keyName, encryptedValue}, userId)` → returns full row with `.returning()`
- `getDB(companyId).updateCredential(keyName, encryptedValue, userId)` → returns `[]` if not found (caller checks `.length === 0`)
- `getDB(companyId).deleteCredential(keyName)` → returns `[]` if not found (caller checks `.length === 0`)
- `getDB(companyId).getCredential(keyName)` → returns array (RESOLVE stage only, not used in admin routes)

### Project Structure Notes

```
packages/server/src/
├── lib/
│   ├── credential-crypto.ts   [EXISTING — import encrypt from here]
│   └── error-codes.ts         [MODIFY — add CREDENTIAL_DUPLICATE_KEY, CREDENTIAL_NOT_FOUND]
├── routes/admin/
│   └── credentials.ts         [MODIFY — add 4 new routes]
└── __tests__/unit/
    └── admin-credentials-crud.test.ts  [NEW]
```

### Security Rules (E11, NFR-S4)

1. Response NEVER includes `encryptedValue` (AC1, AC2 — only `id, keyName, updatedAt`)
2. `encrypt()` is called with `value` — plaintext NEVER stored in DB
3. `tenant.companyId` scope enforced by `getDB(companyId)` — cross-tenant isolation
4. Audit log for DELETE uses `console.info` (structured JSON) — no plaintext credential value in log

### References

- [Source: _bmad-output/planning-artifacts/tools-integration/epics-and-stories.md#Story-16.5]
- [Source: _bmad-output/planning-artifacts/tools-integration/architecture.md#E11] — E11 caller pattern
- [Source: _bmad-output/planning-artifacts/tools-integration/architecture.md#FR-CM1~6] — Credential Management FRs
- [Source: packages/server/src/routes/admin/credentials.ts] — existing file to modify
- [Source: packages/server/src/routes/admin/tier-configs.ts] — tenantMiddleware pattern reference
- [Source: packages/server/src/lib/credential-crypto.ts] — encrypt() (Story 16.3)
- [Source: packages/server/src/db/scoped-query.ts] — credential CRUD methods (Story 16.4)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- ✅ Task 1: Added CREDENTIAL_DUPLICATE_KEY and CREDENTIAL_NOT_FOUND to error-codes.ts.
- ✅ Task 2: Added 4 CRUD routes to credentials.ts. Import aliased `encrypt as encryptCredential` to avoid collision with legacy `encrypt` from `crypto.ts`. tenantMiddleware added per-route. `isDuplicateKeyError` helper exported for testability.
- ✅ Task 3: 21 unit tests written covering all 5 ACs + security invariants. 21 pass, 0 fail.
- ✅ Task 4: `npx tsc --noEmit` exit 0.

### File List

- `packages/server/src/lib/error-codes.ts` — CREDENTIAL_DUPLICATE_KEY + CREDENTIAL_NOT_FOUND added (MODIFIED)
- `packages/server/src/routes/admin/credentials.ts` — 4 new credential routes + isDuplicateKeyError helper (MODIFIED)
- `packages/server/src/__tests__/unit/admin-credentials-crud.test.ts` — 34 unit tests (NEW)
- `_bmad-output/implementation-artifacts/stories/16-5-admin-credentials-crud-api-routes.md` — story file (MODIFIED)
- `_bmad-output/test-artifacts/16-5-tea-summary.md` — TEA summary (MODIFIED)
