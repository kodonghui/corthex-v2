# Story 0.3: Credential Vault

Status: done

## Story

As an admin,
I want to securely store API keys for LLM providers and trading,
so that agents can use external services without exposing credentials.

## Acceptance Criteria

1. **Store API Key**: Given an admin is authenticated, when they POST to `/api/admin/api-keys` with provider, credentials, and scope, then each credential field is encrypted with AES-256-GCM before storage (NFR6) AND the encrypted credentials are stored in the `api_keys` table AND the response does NOT include credential values.

2. **Retrieve Credentials at Point-of-Use**: Given a credential is stored for a company, when an agent needs to call an external API, then the system decrypts the relevant credential for that company only (tenant isolation) AND credentials are never logged or returned in API responses.

3. **Provider Validation**: Given an admin submits credentials for a known provider (e.g., KIS, SMTP), when the request is processed, then the system validates required fields per provider schema AND rejects requests with missing required fields with a 400 error.

4. **User vs Company Scope**: Given both user-scoped and company-scoped credentials exist for the same provider, when `getCredentials()` is called with a userId, then user-scoped credentials take priority over company-scoped ones.

5. **CLI Token Management**: Given an admin is authenticated, when they POST to `/api/admin/cli-credentials` with token and label, then the token is AES-256-GCM encrypted AND can be listed (without token value) and deactivated.

6. **LLM Provider Support**: Given the credential vault is configured, when an admin stores LLM provider credentials (Anthropic, OpenAI), then the system accepts and encrypts the API keys AND they are available for the LLM Router (Epic 5) to use.

7. **Workspace Credential Management**: Given a CEO/admin user is authenticated in the app, when they access `/api/workspace/credentials`, then they can list, create, update, and delete API keys for their own company with proper tenant isolation.

## Tasks / Subtasks

### Already Implemented (from prior v2 iteration)

- [x] Task 1: AES-256-GCM crypto lib (AC: #1, #2)
  - [x] `packages/server/src/lib/crypto.ts` — encrypt/decrypt with Web Crypto API
  - [x] ENCRYPTION_KEY from env var (min 32 chars)
  - [x] IV (12 bytes) + ciphertext combined as base64

- [x] Task 2: Credential Vault service (AC: #2, #3, #4)
  - [x] `packages/server/src/services/credential-vault.ts` — per-field encrypt/decrypt
  - [x] PROVIDER_SCHEMAS with 9 providers (kis, smtp, email, instagram, serper, notion, google_calendar, tts, openai)
  - [x] `validateCredentials()` — required field validation per provider
  - [x] `getCredentials()` — priority lookup: user scope > company scope > TOOL_001 error

- [x] Task 3: Admin credentials route (AC: #1, #5)
  - [x] `packages/server/src/routes/admin/credentials.ts` — CLI tokens + API keys CRUD
  - [x] POST/GET/DELETE for `/api/admin/cli-credentials`
  - [x] POST/GET/DELETE for `/api/admin/api-keys`
  - [x] `adminOnly` middleware guard

- [x] Task 4: DB schema (AC: #1)
  - [x] `cliCredentials` table in schema.ts
  - [x] `apiKeys` table in schema.ts with JSONB credentials column
  - [x] `apiKeyScopeEnum` — 'company' | 'user'

- [x] Task 5: Unit tests (AC: #1, #2, #3)
  - [x] `packages/server/src/__tests__/unit/credential-vault.test.ts` — 10 tests
  - [x] `packages/server/src/__tests__/api/admin-credentials.test.ts` — 14 tests

### New Tasks Required

- [x] Task 6: Add missing LLM providers to PROVIDER_SCHEMAS and route enum (AC: #6)
  - [x] Add `anthropic: ['api_key']` to PROVIDER_SCHEMAS
  - [x] Add `google_ai: ['api_key']` to PROVIDER_SCHEMAS (Gemini)
  - [x] Add `telegram: ['bot_token', 'chat_id']` to PROVIDER_SCHEMAS
  - [x] Export `SUPPORTED_PROVIDERS` array from credential-vault.ts
  - [x] Sync admin route provider enum with `SUPPORTED_PROVIDERS` — 12 providers now accepted

- [x] Task 7: Workspace credentials route for CEO/app users (AC: #7)
  - [x] Create `packages/server/src/routes/workspace/credentials.ts`
  - [x] GET `/api/workspace/credentials` — list API keys for current user's company (tenant-filtered)
  - [x] POST `/api/workspace/credentials` — create API key (auto-set companyId from tenant)
  - [x] PUT `/api/workspace/credentials/:id` — update credential (re-encrypt changed fields)
  - [x] DELETE `/api/workspace/credentials/:id` — delete API key (tenant-scoped)
  - [x] Use `authMiddleware` (not adminOnly) — CEO-level users can manage their company's keys
  - [x] Register in `packages/server/src/index.ts`

- [x] Task 8: Update credential tests (AC: #6, #7)
  - [x] Add unit tests for new providers in credential-vault.test.ts (8 new tests)
  - [x] PROVIDER_SCHEMAS count updated (9 → 12)
  - [x] SUPPORTED_PROVIDERS export test added

## Dev Notes

### CRITICAL: What's Already Implemented

The credential vault has substantial existing implementation. **DO NOT recreate these files**:

| File | Purpose | Status |
|------|---------|--------|
| `packages/server/src/lib/crypto.ts` | AES-256-GCM encrypt/decrypt | Complete |
| `packages/server/src/services/credential-vault.ts` | Per-field encrypt, validate, getCredentials | Complete (needs provider additions) |
| `packages/server/src/routes/admin/credentials.ts` | Admin CRUD for CLI tokens + API keys | Complete (needs enum sync) |
| `packages/server/src/db/schema.ts` | cliCredentials + apiKeys tables | Complete |
| `packages/server/src/__tests__/unit/credential-vault.test.ts` | 10 unit tests | Complete |
| `packages/server/src/__tests__/api/admin-credentials.test.ts` | 14 API tests | Complete |

### What This Story Adds

1. **Provider enum sync**: The route's Zod enum only accepts 6 providers, but PROVIDER_SCHEMAS has 9. Add missing providers + new LLM providers (anthropic, google_ai).
2. **Workspace route**: Admin route exists for platform admins. CEOs need an app-side route to manage their company's credentials.
3. **Update capability**: Current admin route has no PUT endpoint for updating credentials.

### Architecture Constraints

- **Runtime**: Bun
- **ORM**: Drizzle v0.39 with PostgreSQL via Neon serverless
- **Framework**: Hono v4 with `zValidator` for request validation
- **Auth**: Custom JWT via `hono/jwt` — authMiddleware for app users, adminOnly for platform admins
- **Tenant Model**: companyId in JWT -> TenantContext -> every query filtered
- **Error Handling**: `HTTPError` class with error codes (CRED_001, CRED_002, CRED_003)
- **Encryption**: AES-256-GCM via Web Crypto API, ENCRYPTION_KEY env var

### Key Code Patterns (from existing credential code)

```typescript
// Credential vault service usage
import { validateCredentials, encryptCredentials, decryptCredentials, getCredentials } from '../../services/credential-vault'

// Route pattern — Hono with Zod validation
const route = new Hono<AppEnv>()
route.use('*', authMiddleware)
route.post('/path', zValidator('json', schema), async (c) => {
  const tenant = c.get('tenant')
  // Always filter by tenant.companyId
})

// Encrypt before store
const encryptedCredentials = await encryptCredentials(rawCredentials)
await db.insert(apiKeys).values({ ...rest, credentials: encryptedCredentials })

// Decrypt at point of use (never in list endpoints)
const creds = await getCredentials(companyId, 'anthropic', userId)

// Response NEVER includes credential values
.returning({ id, provider, label, scope, createdAt })
```

### Provider Schema Reference

Current PROVIDER_SCHEMAS (credential-vault.ts):
```
kis: ['app_key', 'app_secret', 'account_no']
smtp: ['host', 'port', 'user', 'password', 'from']
email: ['host', 'port', 'user', 'password', 'from']
instagram: ['access_token', 'page_id']
serper: ['api_key']
notion: ['api_key']
google_calendar: ['api_key']
tts: ['api_key']
openai: ['api_key']
```

Add:
```
anthropic: ['api_key']
google_ai: ['api_key']
telegram: ['bot_token', 'chat_id']
```

Current route provider enum (credentials.ts): `['kis', 'notion', 'email', 'telegram', 'serper', 'instagram']`
Must sync to include ALL providers from PROVIDER_SCHEMAS.

### Workspace Route Pattern (from invitations.ts)

Follow the same pattern as `packages/server/src/routes/workspace/invitations.ts`:
- Use `authMiddleware` (not adminOnly)
- Get tenant from `c.get('tenant')`
- Filter all queries by `tenant.companyId`
- Use `companyAdminOnly` if restricting to company admins

### Project Structure Notes

- New workspace route: `packages/server/src/routes/workspace/credentials.ts`
- Modify: `packages/server/src/services/credential-vault.ts` (add providers)
- Modify: `packages/server/src/routes/admin/credentials.ts` (sync enum)
- Register route in: `packages/server/src/index.ts`
- Tests: `packages/server/src/__tests__/unit/` for unit, `packages/server/src/__tests__/api/` for integration

### References

- [Source: packages/server/src/lib/crypto.ts] — AES-256-GCM implementation
- [Source: packages/server/src/services/credential-vault.ts] — vault service (modify for new providers)
- [Source: packages/server/src/routes/admin/credentials.ts] — admin route (sync enum)
- [Source: packages/server/src/routes/workspace/invitations.ts] — workspace route pattern reference
- [Source: packages/server/src/db/schema.ts:144-166] — cliCredentials + apiKeys tables
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 0] — Story 0.3 acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md:371-375] — Credential Vault architecture spec

### v1 Feature Reference

v1 had credential management in the admin panel for API keys (KIS trading, email SMTP, LLM providers). v2 already implements the core encryption and admin CRUD. The gaps are: provider list completeness, workspace-level access for CEOs, and update capability.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — clean implementation, build 3/3 pass, 18/18 tests pass.

### Completion Notes List

- Task 6: Added 3 new providers (anthropic, google_ai, telegram) to PROVIDER_SCHEMAS (9→12). Exported SUPPORTED_PROVIDERS array. Admin route enum synced via SUPPORTED_PROVIDERS import.
- Task 7: Created workspace credentials route with full CRUD (GET/POST/PUT/DELETE). Auto-sets companyId from tenant context. PUT supports partial update with re-encryption. Registered in index.ts.
- Task 8: Added 8 new unit tests: provider schema count, SUPPORTED_PROVIDERS sync, LLM provider validation (anthropic, google_ai), telegram validation, roundtrip encryption for anthropic + telegram.

### File List

**Created:**
- `packages/server/src/routes/workspace/credentials.ts` — workspace CRUD for API keys

**Modified:**
- `packages/server/src/services/credential-vault.ts` — added anthropic, google_ai, telegram providers + SUPPORTED_PROVIDERS export
- `packages/server/src/routes/admin/credentials.ts` — synced provider enum via SUPPORTED_PROVIDERS import
- `packages/server/src/index.ts` — registered workspaceCredentialsRoute
- `packages/server/src/__tests__/unit/credential-vault.test.ts` — 8 new tests (10→18 total)
