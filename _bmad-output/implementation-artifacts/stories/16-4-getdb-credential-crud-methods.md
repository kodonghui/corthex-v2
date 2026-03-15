# Story 16.4: getDB() Credential CRUD Methods

Status: done

## Story

As a **Platform Engineer**,
I want `scoped-query.ts` extended with credential CRUD methods (listCredentials, listCredentialsForScrubber, getCredential, insertCredential, updateCredential, deleteCredential),
So that Admin routes and the credential-scrubber have type-safe, company_id-isolated DB access.

## Acceptance Criteria

**AC1 — listCredentials() excludes encryptedValue**
- Given: `getDB(companyId).listCredentials()` is called
- When: the query executes
- Then: it returns `[{ id, keyName, updatedAt }]` — `encryptedValue` intentionally excluded
- And: only rows matching `company_id = companyId` are returned

**AC2 — listCredentialsForScrubber() decrypts values**
- Given: `getDB(companyId).listCredentialsForScrubber()` is called
- When: the query executes
- Then: it returns `[{ keyName: string, plaintext: string }]` — `encryptedValue` decrypted via `credential-crypto.decrypt()`
- And: only rows matching `company_id = companyId` are returned

**AC3 — insertCredential() sets userId fields and scopes companyId**
- Given: `getDB(companyId).insertCredential({ keyName: 'tistory_access_token', encryptedValue: '...' }, userId)` is called
- When: the INSERT executes
- Then: `created_by_user_id` and `updated_by_user_id` are set to the provided `userId`
- And: `company_id` is automatically set to scoped `companyId`

**AC4 — getCredential() enforces cross-company isolation**
- Given: `getDB(companyA).getCredential('tistory_token')` and companyB has a credential with the same key_name
- When: both queries execute
- Then: each query returns only its own company's credential

**AC5 — updateCredential() sets updatedByUserId and refreshes updatedAt**
- Given: `getDB(companyId).updateCredential('tistory_token', newEncryptedValue, userId)` is called
- When: the UPDATE executes
- Then: `updated_by_user_id` is set to `userId`, `updated_at` is refreshed
- And: only the row matching `(company_id, key_name)` is updated

**AC6 — deleteCredential() scoped by companyId**
- Given: `getDB(companyId).deleteCredential('tistory_token')` is called
- When: the DELETE executes
- Then: only the row matching `(company_id, key_name)` is deleted

## Tasks / Subtasks

- [x] Task 1: Extend `packages/server/src/db/scoped-query.ts` with credential methods (AC: #1–#6)
  - [x] 1.1: Import `credentials` from `./schema` and `decrypt` from `../lib/credential-crypto`
  - [x] 1.2: Add `listCredentials()` — SELECT `{id, keyName, updatedAt}` WHERE `companyId`
  - [x] 1.3: Add `listCredentialsForScrubber()` — async, SELECT all, decrypt each row, return `{keyName, plaintext}[]`
  - [x] 1.4: Add `getCredential(keyName)` — SELECT single row WHERE `(companyId, keyName)`, LIMIT 1
  - [x] 1.5: Add `insertCredential(data, userId)` — INSERT with companyId scoped, set `createdByUserId` + `updatedByUserId`
  - [x] 1.6: Add `updateCredential(keyName, encryptedValue, userId)` — UPDATE WHERE `(companyId, keyName)`, set `updatedAt`, `updatedByUserId`
  - [x] 1.7: Add `deleteCredential(keyName)` — DELETE WHERE `(companyId, keyName)`

- [x] Task 2: Write unit tests in `packages/server/src/__tests__/unit/scoped-query-credentials.test.ts` (AC: #1–#6)
  - [x] 2.1: AC1 — listCredentials returns `{id, keyName, updatedAt}` only (no encryptedValue)
  - [x] 2.2: AC2 — listCredentialsForScrubber returns decrypted plaintext
  - [x] 2.3: AC3 — insertCredential sets userId fields
  - [x] 2.4: AC4 — getCredential cross-company isolation
  - [x] 2.5: AC5 — updateCredential sets updatedByUserId and updatedAt
  - [x] 2.6: AC6 — deleteCredential scoped delete

- [x] Task 3: Verify `npx tsc --noEmit` passes (no type errors)

## Dev Notes

### Architecture Decision — Implementation Blueprint

**File to modify:** `packages/server/src/db/scoped-query.ts`

**Imports to add:**
```typescript
import { credentials } from './schema'
import { decrypt } from '../lib/credential-crypto'
```

**Type aliases to add (near top with other types):**
```typescript
type Credential = InferSelectModel<typeof credentials>
type NewCredential = InferInsertModel<typeof credentials>
```

**Methods to add (after existing MCP lifecycle events section):**

```typescript
// === Story 16.4: Credential CRUD (D23, E11, FR-CM1~3, FR-CM6) ===

// READ — list credentials for Admin UI (encryptedValue intentionally excluded — AC1)
listCredentials: () =>
  db.select({ id: credentials.id, keyName: credentials.keyName, updatedAt: credentials.updatedAt })
    .from(credentials)
    .where(eq(credentials.companyId, companyId))
    .orderBy(asc(credentials.keyName)),

// READ — list all credentials with decrypted plaintext (D28 scrubber only — AC2)
// Returns Promise<{keyName, plaintext}[]> — async due to decrypt()
listCredentialsForScrubber: async () => {
  const rows = await db.select({
    keyName: credentials.keyName,
    encryptedValue: credentials.encryptedValue,
  }).from(credentials).where(eq(credentials.companyId, companyId))
  return Promise.all(rows.map(async (row) => ({
    keyName: row.keyName,
    plaintext: await decrypt(row.encryptedValue),
  })))
},

// READ — single credential by keyName, scoped by companyId (AC4 isolation)
getCredential: (keyName: string) =>
  db.select().from(credentials)
    .where(and(eq(credentials.companyId, companyId), eq(credentials.keyName, keyName)))
    .limit(1),

// WRITE — insert credential with userId audit fields (AC3)
insertCredential: (data: { keyName: string; encryptedValue: string }, userId: string) =>
  db.insert(credentials).values({
    companyId,
    keyName: data.keyName,
    encryptedValue: data.encryptedValue,
    createdByUserId: userId,
    updatedByUserId: userId,
  }).returning(),

// WRITE — update encryptedValue + audit trail (AC5)
updateCredential: (keyName: string, encryptedValue: string, userId: string) =>
  db.update(credentials)
    .set({ encryptedValue, updatedByUserId: userId, updatedAt: new Date() })
    .where(and(eq(credentials.companyId, companyId), eq(credentials.keyName, keyName)))
    .returning(),

// WRITE — delete credential scoped by companyId (AC6)
deleteCredential: (keyName: string) =>
  db.delete(credentials)
    .where(and(eq(credentials.companyId, companyId), eq(credentials.keyName, keyName)))
    .returning(),
```

### Key Design Points

- **`listCredentials`**: Uses `db.select({ id, keyName, updatedAt })` partial select — `encryptedValue` field is NOT included even though the `credentials` table has it. This prevents accidental exposure via Admin UI routes (Story 16.5).
- **`listCredentialsForScrubber`**: Returns `Promise<{keyName, plaintext}[]>` — the only method that decrypts. Called exclusively from `credential-scrubber.ts` (Story 16.6, D28).
- **`getCredential`**: Returns full row including `encryptedValue` — needed by RESOLVE stage to call `decrypt()` before passing plaintext to tool executor (E11 pattern).
- **`insertCredential`**: Both `createdByUserId` and `updatedByUserId` set on creation (for consistent audit trail).
- **`companyId` injection**: Direct `companyId` variable (closure from `getDB(companyId)`) — NOT via `scopedInsert()` because credentials doesn't need the full `scopedInsert` pattern (no spread of data object with mixed fields).

### Testing Pattern (bun:test + real DB)

Tests use the real test DB (no mocks). Set `CREDENTIAL_ENCRYPTION_KEY` env before import.

**Cross-company isolation test pattern:**
```typescript
const dbA = getDB(companyIdA)
const dbB = getDB(companyIdB)
await dbA.insertCredential({ keyName: 'shared_key', encryptedValue: encA }, userIdA)
await dbB.insertCredential({ keyName: 'shared_key', encryptedValue: encB }, userIdB)
const rowsA = await dbA.listCredentials()
const rowsB = await dbB.listCredentials()
expect(rowsA).toHaveLength(1)
expect(rowsB).toHaveLength(1)
```

### Project Structure Notes

```
packages/server/src/
├── db/
│   └── scoped-query.ts     [MODIFY — add 6 credential methods]
└── __tests__/unit/
    └── scoped-query-credentials.test.ts  [NEW — unit tests]
```

### References

- [Source: _bmad-output/planning-artifacts/tools-integration/epics-and-stories.md#Story-16.4]
- [Source: packages/server/src/db/schema.ts#credentials] — table schema
- [Source: packages/server/src/lib/credential-crypto.ts] — decrypt() (Story 16.3)
- [Source: _bmad-output/planning-artifacts/tools-integration/architecture.md#E11] — E11 caller pattern
- [Source: _bmad-output/planning-artifacts/tools-integration/architecture.md#D28] — scrubber reads via listCredentialsForScrubber

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Completion Notes List

- ✅ Task 1: 6 credential CRUD methods added to scoped-query.ts. `listCredentials` partial select excludes encryptedValue. `listCredentialsForScrubber` async with decrypt(). `getCredential` returns full row for E11 RESOLVE stage. `insertCredential`/`updateCredential`/`deleteCredential` follow existing scoped-query patterns.
- ✅ Task 2: Unit tests written for all 6 methods.
- ✅ Task 3: `tsc --noEmit` exit 0.

### File List

- `packages/server/src/db/scoped-query.ts` — 6 credential CRUD methods added (MODIFIED)
- `packages/server/src/__tests__/unit/scoped-query-credentials.test.ts` — unit tests (NEW)
- `_bmad-output/implementation-artifacts/stories/16-4-getdb-credential-crud-methods.md` — story file (NEW)
- `_bmad-output/test-artifacts/16-4-tea-summary.md` — TEA summary (MODIFIED)
