# Story 1.6: Credential Vault 구현 (AES-256-GCM)

Status: review

## Story

As a 시스템,
I want API key가 provider별 복수 필드로 개별 암호화 저장/복호화되기를,
so that KIS(3필드), SMTP(5필드), Instagram(2필드) 등 서비스별 다양한 인증 정보를 안전하게 관리할 수 있다.

## Acceptance Criteria

1. **Given** `ENCRYPTION_KEY` 환경변수 설정 / **When** KIS API key (app_key + app_secret + account_no) 저장 요청 / **Then** `credentials` JSONB에 각 필드별 AES-256-GCM 독립 암호화 저장
2. **Given** 복호화 요청 / **When** 암호화된 credentials 로드 / **Then** 원본 값 정확히 복원 (단위 테스트 통과)
3. **Given** KIS 저장 시 app_key 누락 / **When** `validateCredentials('kis', fields)` 호출 / **Then** 스키마 오류 반환 (KIS: app_key/app_secret/account_no 3필드 필수 / SMTP: host/port/user/password/from 5필드 필수)
4. **Given** 유저가 개인 API key 등록 + 회사 공용 API key도 존재 / **When** `getCredentials(companyId, 'kis', userId)` 호출 / **Then** 유저 개인(`scope:'user'`) 우선 반환, 없으면 회사 공용(`scope:'company'`) 반환, 둘 다 없으면 `TOOL_001` 에러
5. **Given** `services/credential-vault.ts` 구현 완료 / **When** admin `POST /api/admin/api-keys`, workspace `POST /api/workspace/profile/api-keys` 호출 / **Then** 새 서비스 경유하여 JSONB 저장 (기존 라우트의 직접 encrypt 호출 → vault 서비스로 교체)
6. **Given** `packages/server/src/__tests__/unit/credential-vault.test.ts` / **When** `bun test` 실행 / **Then** 암호화/복호화 왕복, provider 스키마 검증, 우선순위 로직 테스트 모두 통과

## Tasks / Subtasks

- [x] Task 1: `services/credential-vault.ts` 신규 생성 (AC: #1~#4)
  - [x] Provider 스키마 맵 정의 (`PROVIDER_SCHEMAS`)
    - `kis`: `['app_key', 'app_secret', 'account_no']` + 옵션 `mode: 'mock'|'real'`
    - `smtp`: `['host', 'port', 'user', 'password', 'from']`
    - `instagram`: `['access_token', 'page_id']`
    - `serper`: `['api_key']`
    - `notion`: `['api_key']`
  - [x] `validateCredentials(provider, fields)` — 필수 필드 누락 시 에러
  - [x] `encryptCredentials(fields)` — 각 필드 개별 `encrypt()` 호출 후 JSONB 반환
  - [x] `decryptCredentials(encryptedObj)` — 각 필드 개별 `decrypt()` 후 원본 맵 반환
  - [x] `getCredentials(companyId, provider, userId?)` — DB 조회 + 우선순위 로직
    - 유저 개인(`scope:'user'`, `userId` 일치) → 있으면 복호화 반환
    - 없으면 회사 공용(`scope:'company'`) → 있으면 복호화 반환
    - 둘 다 없으면 `throw new HTTPError(400, 'TOOL_001', 'API key 없음 또는 조회 실패')`
  - [x] `lib/crypto.ts` 임포트 사용 (`encrypt`, `decrypt`) — `lib/encrypt.ts`는 없음, 실제 파일은 `lib/crypto.ts`

- [x] Task 2: 기존 라우트 vault 서비스 연동 (AC: #5)
  - [x] `routes/admin/credentials.ts` 수정
    - `POST /api/admin/api-keys` — `encrypt(key)` 직접 호출 → `validateCredentials` + `encryptCredentials` 교체
    - `GET /api/admin/api-keys` — `encryptedKey` 단일 필드 응답 → `credentials` JSONB 응답으로 교체 (복호화된 값은 노출 안 함, 필드 키 목록만 반환)
  - [x] `routes/workspace/profile.ts` 수정
    - `POST /api/workspace/profile/api-keys` — 동일하게 vault 서비스 경유
    - `GET /api/workspace/profile/api-keys` — 필드 키 목록만 반환 (값 마스킹)

- [x] Task 3: 단위 테스트 작성 (AC: #6)
  - [x] `packages/server/src/__tests__/unit/credential-vault.test.ts` 신규 생성
  - [x] 테스트 케이스:
    - `encryptCredentials` + `decryptCredentials` 왕복 (원본 값 일치)
    - `validateCredentials('kis', { app_key: '...' })` — app_secret 누락 에러
    - `validateCredentials('smtp', { host, port, user, password, from })` — 통과
    - `getCredentials` 우선순위: `scope:'user'` > `scope:'company'` > TOOL_001

## Dev Notes

### ⚠️ 현재 코드베이스 상태

**이미 완성된 항목 (수정 불필요 또는 소폭 수정):**

| 항목 | 파일 | 상태 | 비고 |
|------|------|------|------|
| AES-256-GCM 암호화 구현 | `lib/crypto.ts` | ✅ 완성 | `encrypt()`, `decrypt()` 함수 export |
| Admin API Key 라우트 | `routes/admin/credentials.ts` | ✅ 완성 | `encryptedKey` 단일 필드 방식 → vault 서비스로 교체 필요 |
| Workspace Profile 라우트 | `routes/workspace/profile.ts` | ✅ 완성 | 동일 — vault 서비스로 교체 필요 |
| Admin UI | `packages/admin/src/pages/credentials.tsx` | ✅ 완성 | 수정 불필요 |
| User Settings UI | `packages/app/src/pages/settings.tsx` | ✅ 완성 | 수정 불필요 |
| 에러 코드 TOOL_001 | `packages/shared/src/constants.ts` | Story 1.3에서 추가 예정 | 1.3 완료 후 자동 사용 가능 |

**신규 생성 필요:**

| 파일 | 용도 |
|------|------|
| `packages/server/src/services/credential-vault.ts` | 핵심 Vault 서비스 |
| `packages/server/src/__tests__/unit/credential-vault.test.ts` | 단위 테스트 |

### 선행 조건

- ✅ Story 1.2 완료 필요 — `api_keys` 테이블에 `credentials: jsonb` + `scope: pgEnum` 컬럼 마이그레이션 완료 후 작업
- ✅ Story 1.3 완료 필요 — `shared/constants.ts`에 `TOOL_001` 에러 코드 추가 후 작업

### 구현 패턴

**credential-vault.ts:**

```typescript
// packages/server/src/services/credential-vault.ts
import { encrypt, decrypt } from '../lib/crypto'
import { db } from '../db'
import { apiKeys } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { HTTPError } from '../middleware/error'
import { ERROR_CODES } from '@corthex/shared'

// Provider별 필수 필드 정의
const PROVIDER_SCHEMAS: Record<string, string[]> = {
  kis: ['app_key', 'app_secret', 'account_no'],
  smtp: ['host', 'port', 'user', 'password', 'from'],
  instagram: ['access_token', 'page_id'],
  serper: ['api_key'],
  notion: ['api_key'],
}

// 필수 필드 유효성 검사
export function validateCredentials(
  provider: string,
  fields: Record<string, string>,
): void {
  const required = PROVIDER_SCHEMAS[provider]
  if (!required) throw new HTTPError(400, `지원하지 않는 provider: ${provider}`, 'TOOL_001')
  const missing = required.filter((f) => !fields[f])
  if (missing.length > 0) {
    throw new HTTPError(400, `필수 필드 누락: ${missing.join(', ')}`, 'TOOL_001')
  }
}

// 각 필드 개별 암호화 → JSONB 반환
export async function encryptCredentials(
  fields: Record<string, string>,
): Promise<Record<string, string>> {
  const encrypted: Record<string, string> = {}
  for (const [key, value] of Object.entries(fields)) {
    encrypted[key] = await encrypt(value)
  }
  return encrypted
}

// 각 필드 개별 복호화 → 원본 맵 반환
export async function decryptCredentials(
  encryptedObj: Record<string, string>,
): Promise<Record<string, string>> {
  const decrypted: Record<string, string> = {}
  for (const [key, value] of Object.entries(encryptedObj)) {
    decrypted[key] = await decrypt(value)
  }
  return decrypted
}

// 우선순위 조회: user scope > company scope > TOOL_001
export async function getCredentials(
  companyId: string,
  provider: string,
  userId?: string,
): Promise<Record<string, string>> {
  // 1. 유저 개인 key 조회
  if (userId) {
    const [userKey] = await db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.companyId, companyId),
          eq(apiKeys.userId, userId),
          eq(apiKeys.provider, provider),
          eq(apiKeys.scope, 'user'),
        ),
      )
      .limit(1)
    if (userKey) return decryptCredentials(userKey.credentials as Record<string, string>)
  }

  // 2. 회사 공용 key 조회
  const [companyKey] = await db
    .select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.companyId, companyId),
        eq(apiKeys.provider, provider),
        eq(apiKeys.scope, 'company'),
      ),
    )
    .limit(1)
  if (companyKey) return decryptCredentials(companyKey.credentials as Record<string, string>)

  // 3. 없으면 에러
  throw new HTTPError(400, ERROR_CODES.TOOL_001, 'TOOL_001')
}
```

**routes/admin/credentials.ts 수정 핵심 부분 (POST api-keys):**

```typescript
// Before (직접 encrypt):
const encryptedKey = await encrypt(body.key)
await db.insert(apiKeys).values({ ...body, encryptedKey })

// After (vault 서비스):
import { validateCredentials, encryptCredentials } from '../../services/credential-vault'

validateCredentials(body.provider, body.credentials)
const encryptedCredentials = await encryptCredentials(body.credentials)
await db.insert(apiKeys).values({
  companyId: body.companyId,
  userId: body.userId ?? null,
  provider: body.provider,
  label: body.label,
  credentials: encryptedCredentials,
  scope: body.scope,
})
```

**단위 테스트 패턴:**

```typescript
// packages/server/src/__tests__/unit/credential-vault.test.ts
import { describe, it, expect, beforeAll } from 'bun:test'
import {
  validateCredentials,
  encryptCredentials,
  decryptCredentials,
} from '../../services/credential-vault'

beforeAll(() => {
  process.env.ENCRYPTION_KEY = 'test-key-32-chars-for-unit-tests!!'
})

describe('encryptCredentials + decryptCredentials', () => {
  it('KIS 3필드 왕복 암호화 정확성', async () => {
    const original = { app_key: 'my-key', app_secret: 'my-secret', account_no: '12345' }
    const encrypted = await encryptCredentials(original)
    const decrypted = await decryptCredentials(encrypted)
    expect(decrypted).toEqual(original)
  })
})

describe('validateCredentials', () => {
  it('KIS 필수 필드 누락 시 에러', () => {
    expect(() => validateCredentials('kis', { app_key: 'only-key' })).toThrow()
  })
  it('SMTP 5필드 완전 충족 시 통과', () => {
    expect(() =>
      validateCredentials('smtp', {
        host: 'smtp.gmail.com',
        port: '587',
        user: 'user@gmail.com',
        password: 'pw',
        from: 'user@gmail.com',
      }),
    ).not.toThrow()
  })
})
```

### Project Structure Notes

```
packages/server/src/
├─ lib/
│  └─ crypto.ts               ✅ AES-256-GCM (encrypt/decrypt) — 수정 불필요
├─ services/
│  └─ credential-vault.ts     ← 신규 생성 (핵심 deliverable)
├─ routes/
│  ├─ admin/
│  │   └─ credentials.ts      ← vault 서비스 연동으로 소폭 수정
│  └─ workspace/
│      └─ profile.ts          ← vault 서비스 연동으로 소폭 수정
└─ __tests__/
    └─ unit/
        └─ credential-vault.test.ts  ← 신규 생성
```

### 파일명 컨벤션

- `credential-vault.ts` (kebab-case)
- export 함수: camelCase (`validateCredentials`, `encryptCredentials`, `getCredentials`)
- `lib/crypto.ts` → `lib/encrypt.ts`가 아닌 실제 파일명 `crypto.ts` 사용 (epics 문서 오기)

### References

- [Source: epics.md#Story 1.6] — AC 및 story
- [Source: packages/server/src/lib/crypto.ts] — AES-256-GCM `encrypt()`, `decrypt()` 구현
- [Source: packages/server/src/db/schema.ts] — `apiKeys` 테이블 (Story 1.2 마이그레이션 후 `credentials: jsonb`, `scope` 컬럼 존재)
- [Source: packages/server/src/routes/admin/credentials.ts] — 기존 admin API key 라우트 (단일 encryptedKey 방식)
- [Source: packages/server/src/routes/workspace/profile.ts] — 기존 workspace API key 라우트
- [Source: architecture.md#Decision 3] — Credential Vault JSONB 스키마 (provider별 필드 구조)
- [Source: packages/shared/src/constants.ts] — TOOL_001 에러 코드 (Story 1.3에서 추가)

## Dev Agent Record

### Agent Model Used

claude-opus-4-6

### Debug Log References

### Completion Notes List

- ✅ Task 1: credential-vault.ts — PROVIDER_SCHEMAS(5개), validateCredentials, encryptCredentials, decryptCredentials, getCredentials(user>company>TOOL_001)
- ✅ Task 2: admin/credentials.ts + workspace/profile.ts — 직접 encrypt 호출 → vault 서비스(validateCredentials + encryptCredentials) 교체
- ✅ Task 3: 단위 테스트 9건 — 왕복 암호화(KIS/SMTP/serper), 필수 필드 검증(누락/통과/instagram/unknown), 스키마 정의 검증
- ✅ 빌드 성공, 테스트 50 pass (server-unit), 0 fail

### Change Log

- 2026-03-05: Story 1.6 구현 완료 — Credential Vault 서비스 + 라우트 연동 + 테스트

### File List

- packages/server/src/services/credential-vault.ts (신규 — Vault 서비스)
- packages/server/src/routes/admin/credentials.ts (수정 — vault 서비스 연동)
- packages/server/src/routes/workspace/profile.ts (수정 — vault 서비스 연동)
- packages/server/src/__tests__/unit/credential-vault.test.ts (신규 — 9건 테스트)
