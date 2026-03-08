# Story 20.3: 공개 API + API 키 발급

Status: done

## Story

As a Company Admin,
I want to create and manage API keys that allow external systems to call CORTHEX REST APIs on behalf of my company,
so that I can integrate CORTHEX capabilities into our existing tools, dashboards, and automation pipelines.

## Acceptance Criteria

1. **API 키 스키마**: companyApiKeys 테이블 생성 — id, companyId, name, keyPrefix(공개 접두사, `cxk_`), keyHash(SHA-256 해시), lastUsedAt, expiresAt, isActive, scopes(jsonb), rateLimitPerMin, createdBy, createdAt
2. **API 키 생성 API**: POST /api/admin/public-api-keys — 키 생성 시 `cxk_live_{randomHex(32)}` 형식으로 발급, 원본 키는 응답에서 **1회만** 반환 (DB에는 SHA-256 해시만 저장)
3. **API 키 목록 API**: GET /api/admin/public-api-keys — 회사별 API 키 목록 (keyPrefix만 표시, 원본 키는 절대 노출 안 함)
4. **API 키 삭제 API**: DELETE /api/admin/public-api-keys/:id — 소유권 검증 후 비활성화 (soft delete)
5. **API 키 로테이션 API**: POST /api/admin/public-api-keys/:id/rotate — 기존 키 비활성화 + 새 키 발급 (원본 1회 반환)
6. **API 키 인증 미들웨어**: `X-API-Key` 헤더로 공개 API 인증 — keyHash 매칭 → companyId 추출 → TenantContext 생성 (isApiKey=true)
7. **공개 API 라우트**: GET /api/v1/agents, GET /api/v1/agents/:id, POST /api/v1/commands — API 키 인증 + per-key rate limiting
8. **사용량 추적**: API 키 사용 시 lastUsedAt 업데이트 + 요청 카운트 기록
9. **API 키 관리 UI (admin)**: 관리자 앱에 "API 키" 탭 — 키 목록, 생성 모달 (이름+스코프+만료일+rate limit), 키 표시 모달 (1회만), 삭제/로테이션 버튼
10. **감사 로깅**: API 키 생성/삭제/로테이션/사용 시 감사 로그 기록

## Tasks / Subtasks

- [x] Task 1: 스키마 생성 (AC: #1)
  - [x] 1.1 companyApiKeys 테이블 생성 — id, companyId, name, keyPrefix, keyHash, lastUsedAt, expiresAt, isActive, scopes, rateLimitPerMin, createdBy, createdAt
  - [x] 1.2 companyIdx, keyHashIdx(unique) 인덱스 추가

- [x] Task 2: Admin API — API 키 관리 (AC: #2, #3, #4, #5, #10)
  - [x] 2.1 packages/server/src/routes/admin/public-api-keys.ts 생성
  - [x] 2.2 POST /public-api-keys — 키 생성 (randomBytes(32) → hex → `cxk_live_` 접두사 → SHA-256 해시 저장 → 원본 1회 반환)
  - [x] 2.3 GET /public-api-keys — 회사별 키 목록 (keyPrefix + name + lastUsedAt + expiresAt + isActive)
  - [x] 2.4 DELETE /public-api-keys/:id — companyId 소유권 검증 → isActive=false
  - [x] 2.5 POST /public-api-keys/:id/rotate — 기존 키 비활성화 + 새 키 생성 → 원본 1회 반환
  - [x] 2.6 감사 로그 기록 (api_key.create, api_key.delete, api_key.rotate)

- [x] Task 3: API 키 인증 미들웨어 (AC: #6, #8)
  - [x] 3.1 packages/server/src/middleware/api-key-auth.ts 생성
  - [x] 3.2 X-API-Key 헤더 → SHA-256 해시 → DB 조회 → companyId 추출 → TenantContext 세팅
  - [x] 3.3 만료일 검증, isActive 검증
  - [x] 3.4 lastUsedAt 업데이트 (비동기, 요청 블로킹 안 함)
  - [x] 3.5 per-key rate limiting (rateLimitPerMin 기반)

- [x] Task 4: 공개 API 라우트 (AC: #7)
  - [x] 4.1 packages/server/src/routes/public-api/v1.ts 생성
  - [x] 4.2 GET /agents — 회사 에이전트 목록 (companyId 자동 격리)
  - [x] 4.3 GET /agents/:id — 에이전트 상세
  - [x] 4.4 POST /commands — 명령 실행 (기존 CommandRouter 연동)

- [x] Task 5: API 키 관리 UI (admin) (AC: #9)
  - [x] 5.1 packages/admin/src/pages/api-keys.tsx 생성 — 키 목록 테이블
  - [x] 5.2 생성 모달 (이름, 스코프 선택, 만료일, rate limit)
  - [x] 5.3 키 표시 모달 (생성 직후 1회만 — 복사 버튼 포함, "이 키는 다시 표시되지 않습니다" 경고)
  - [x] 5.4 삭제 확인 모달 + 로테이션 확인 모달
  - [x] 5.5 사이드바에 "공개 API 키" 메뉴 추가 + App.tsx 라우트 등록

- [x] Task 6: 서버 index.ts 라우트 등록
  - [x] 6.1 admin/public-api-keys 라우트 등록
  - [x] 6.2 /api/v1 공개 API 라우트 등록 (apiKeyAuth 미들웨어 적용)

## Dev Notes

### 기존 코드 현황 분석

**이미 존재하는 것 (재사용):**
- `packages/server/src/db/schema.ts` — apiKeys 테이블 (내부 서비스 크리덴셜용, 공개 API와 별도)
- `packages/server/src/middleware/auth.ts` — JWT 인증 (authMiddleware), TenantContext 패턴
- `packages/server/src/middleware/rate-limit.ts` — createRateLimiter 패턴
- `packages/server/src/lib/crypto.ts` — AES-256-GCM 암호화/복호화
- `packages/server/src/services/audit-log.ts` — 감사 로깅 서비스
- `packages/server/src/routes/admin/credentials.ts` — API 키 CRUD 패턴 참고

**추가해야 할 것:**
- companyApiKeys 테이블 (새 테이블 — 기존 apiKeys는 내부용)
- API 키 인증 미들웨어 (새 파일: api-key-auth.ts)
- 공개 API 라우트 (새 파일: public-api/v1.ts)
- Admin API 키 관리 라우트 (새 파일: admin/public-api-keys.ts)
- Admin UI 페이지 (새 파일: api-keys.tsx)

### 핵심 패턴

**API 키 생성 (보안 최우선):**
```typescript
import { randomBytes, createHash } from 'crypto'

// 1. 랜덤 키 생성
const rawKey = `cxk_live_${randomBytes(32).toString('hex')}`
// 2. SHA-256 해시 (DB 저장용)
const keyHash = createHash('sha256').update(rawKey).digest('hex')
// 3. 접두사 (목록 표시용)
const keyPrefix = rawKey.slice(0, 12) + '...'
// 4. rawKey는 응답에서 1회만 반환 — DB에 저장하지 않음
```

**API 키 인증 미들웨어:**
```typescript
export const apiKeyAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const apiKey = c.req.header('X-API-Key')
  if (!apiKey) throw new HTTPError(401, 'API 키가 필요합니다', 'API_001')

  const keyHash = createHash('sha256').update(apiKey).digest('hex')
  const record = await db.select().from(companyApiKeys)
    .where(and(eq(companyApiKeys.keyHash, keyHash), eq(companyApiKeys.isActive, true)))
    .limit(1)

  if (!record[0]) throw new HTTPError(401, '유효하지 않은 API 키', 'API_002')
  if (record[0].expiresAt && record[0].expiresAt < new Date()) {
    throw new HTTPError(401, '만료된 API 키', 'API_003')
  }

  // TenantContext 생성 (isApiKey=true로 구분)
  c.set('tenant', {
    companyId: record[0].companyId,
    userId: record[0].createdBy,
    role: 'user',
    isAdminUser: false,
    isApiKey: true,
  })

  // lastUsedAt 비동기 업데이트 (요청 블로킹 안 함)
  db.update(companyApiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(companyApiKeys.id, record[0].id))
    .execute()

  await next()
}
```

**per-key rate limiting:**
```typescript
// rateLimitPerMin 값은 companyApiKeys 레코드에서 가져옴
// 기존 createRateLimiter 패턴 활용 — 키별 store
const keyRateLimiter = new Map<string, { count: number; resetAt: number }>()
```

### 스키마

```typescript
export const companyApiKeys = pgTable('company_api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 100 }).notNull(),
  keyPrefix: varchar('key_prefix', { length: 20 }).notNull(),
  keyHash: varchar('key_hash', { length: 64 }).notNull(), // SHA-256
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').notNull().default(true),
  scopes: jsonb('scopes').notNull().default(['read']), // ['read'] | ['read','write'] | ['read','write','execute']
  rateLimitPerMin: integer('rate_limit_per_min').notNull().default(60),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('company_api_keys_company_idx').on(table.companyId),
  keyHashIdx: uniqueIndex('company_api_keys_key_hash_idx').on(table.keyHash),
}))
```

### Admin UI 패턴 (기존 credentials 페이지 참고)

- 키 목록: 테이블 형태 (이름, 접두사, 스코프, 마지막 사용, 만료일, 상태)
- 생성 모달: 이름(필수), 스코프 체크박스, 만료일(선택), rate limit(기본 60/min)
- 키 표시 모달: 생성 직후 rawKey 표시 + 복사 버튼 + "이 키는 다시 표시되지 않습니다" 경고
- 삭제: 확인 모달 (React 모달, confirm() 금지)
- 로테이션: 확인 모달 → 새 키 표시 모달

### Admin 사이드바

`packages/admin/src/components/sidebar.tsx`:
- "공개 API 키" 메뉴 추가 (보안 섹션 근처)
- `{ to: '/api-keys', label: '공개 API 키', icon: '🔐' }`

### Admin App.tsx 라우트

```typescript
const ApiKeysPage = lazy(() => import('./pages/api-keys'))
<Route path="/api-keys" element={<ApiKeysPage />} />
```

### 감사 로그 액션 추가

```typescript
// audit-log.ts에 추가
API_KEY_CREATE: 'api_key.create',
API_KEY_DELETE: 'api_key.delete',
API_KEY_ROTATE: 'api_key.rotate',
```

### 보안 고려사항

1. **원본 키는 절대 DB에 저장하지 않음** — SHA-256 해시만 저장
2. **생성 시 1회만 반환** — 이후 조회 불가 (keyPrefix만 표시)
3. **만료일 검증** — 미들웨어에서 자동 차단
4. **per-key rate limiting** — 키별 독립적 rate limit
5. **감사 로그** — 모든 키 생성/삭제/로테이션/사용 기록
6. **TenantContext 격리** — API 키에서 추출한 companyId로 데이터 격리

### Project Structure Notes

- 서버 스키마: `packages/server/src/db/schema.ts` (MODIFY — companyApiKeys 추가)
- 서버 라우트: `packages/server/src/routes/admin/public-api-keys.ts` (NEW)
- 서버 라우트: `packages/server/src/routes/public-api/v1.ts` (NEW)
- 서버 미들웨어: `packages/server/src/middleware/api-key-auth.ts` (NEW)
- 서버 index: `packages/server/src/index.ts` (MODIFY — 라우트 등록)
- 관리자 UI: `packages/admin/src/pages/api-keys.tsx` (NEW)
- 관리자 사이드바: `packages/admin/src/components/sidebar.tsx` (MODIFY — 메뉴 추가)
- 관리자 App: `packages/admin/src/App.tsx` (MODIFY — 라우트 추가)

### References

- [Source: packages/server/src/db/schema.ts] — 기존 apiKeys 테이블 (내부 크리덴셜용, lines ~196-208)
- [Source: packages/server/src/middleware/auth.ts] — JWT authMiddleware, TenantContext 패턴
- [Source: packages/server/src/middleware/rate-limit.ts] — createRateLimiter 패턴
- [Source: packages/server/src/lib/crypto.ts] — AES-256-GCM 암호화
- [Source: packages/server/src/services/audit-log.ts] — 감사 로깅
- [Source: packages/server/src/routes/admin/credentials.ts] — API 키 CRUD 패턴
- [Source: packages/server/src/routes/workspace/invitations.ts] — randomBytes 토큰 생성 패턴
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 20 스토리 정의

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: companyApiKeys 스키마 생성 — id, companyId, name, keyPrefix, keyHash, lastUsedAt, expiresAt, isActive, scopes, rateLimitPerMin, createdBy, createdAt + companyIdx, keyHashIdx(unique) 인덱스
- Task 2: admin/public-api-keys.ts 생성 — GET list, POST create(rawKey 1회 반환), DELETE(soft delete), POST rotate(트랜잭션으로 기존 비활성화+새 키 생성) + 감사 로그(api_key.create/delete/rotate)
- Task 3: middleware/api-key-auth.ts 생성 — X-API-Key 헤더 → SHA-256 해시 → DB 조회 → TenantContext 생성 + 만료일/isActive 검증 + per-key rate limiting + lastUsedAt 비동기 업데이트
- Task 4: routes/public-api/v1.ts 생성 — GET /agents(목록), GET /agents/:id(상세), POST /commands(CommandRouter 연동) + 스코프 검증(read/execute)
- Task 5: admin/api-keys.tsx 생성 — 키 목록 테이블, 생성 모달(이름+스코프+만료일+rate limit), 키 표시 모달(1회만, 복사 버튼, 경고), 삭제/로테이션 확인 모달 + 사이드바+라우트 등록
- Task 6: server index.ts에 publicApiKeysRoute(admin), publicApiV1Route(/api/v1) 등록
- TypeScript 빌드 정상 (server + admin 모두 clean)

### File List
- packages/server/src/db/schema.ts -- [MODIFIED] companyApiKeys 테이블 + companyIdx, keyHashIdx 인덱스 추가
- packages/server/src/routes/admin/public-api-keys.ts -- [NEW] 공개 API 키 관리 API (list, create, delete, rotate)
- packages/server/src/middleware/api-key-auth.ts -- [NEW] API 키 인증 미들웨어 (X-API-Key → SHA-256 → DB → TenantContext)
- packages/server/src/routes/public-api/v1.ts -- [NEW] 공개 API v1 라우트 (agents, commands)
- packages/server/src/services/audit-log.ts -- [MODIFIED] API_KEY_CREATE, API_KEY_DELETE, API_KEY_ROTATE 액션 추가
- packages/server/src/index.ts -- [MODIFIED] publicApiKeysRoute + publicApiV1Route import + 라우트 등록
- packages/admin/src/pages/api-keys.tsx -- [NEW] 공개 API 키 관리 페이지
- packages/admin/src/components/sidebar.tsx -- [MODIFIED] 공개 API 키 메뉴 추가
- packages/admin/src/App.tsx -- [MODIFIED] ApiKeysPage 라우트 추가
