# Story 1.2: Tenant Isolation Middleware

Status: done

## Story

As a **system architect**,
I want **all API requests automatically scoped to the authenticated user's company via middleware that extracts companyId from JWT and provides query helpers that enforce companyId WHERE clauses**,
so that **no tenant can ever access another tenant's data, fulfilling FR42 and NFR10**.

## Acceptance Criteria

1. **JWT companyId 추출**: authMiddleware가 이미 JWT에서 companyId를 추출하여 `c.get('tenant').companyId`에 설정 (이미 구현됨 -- 변경 불필요)
2. **Drizzle 쿼리 헬퍼**: `withTenant(companyId)` 함수가 모든 SELECT/UPDATE/DELETE에 companyId 필터를 자동 추가
3. **요청 body companyId 불일치 검증**: POST/PUT/PATCH 요청 body에 companyId가 포함된 경우, JWT의 companyId와 불일치하면 403 반환
4. **companyId 누락 차단**: 인증된 요청에서 companyId가 없으면 401 반환
5. **Admin(superadmin) 우회**: superadmin은 쿼리 파라미터로 특정 companyId를 지정할 수 있음
6. **기존 201건 + Story 1-1의 45건 테스트 전부 통과 유지**
7. **테넌트 격리 단위 테스트 추가**: withTenant 헬퍼, body 불일치 검증, superadmin 우회 테스트

## Tasks / Subtasks

- [x] Task 1: tenantMiddleware 확장 (AC: #2, #3, #4)
  - [x] 1.1 `packages/server/src/middleware/tenant.ts` 확장 -- body companyId 불일치 시 403
  - [x] 1.2 companyId 누락 시 401 에러 (인증된 경로에서)
  - [x] 1.3 superadmin 우회 로직 (AC: #5)
- [x] Task 2: Drizzle 쿼리 헬퍼 생성 (AC: #2)
  - [x] 2.1 `packages/server/src/db/tenant-helpers.ts` 신규 생성
  - [x] 2.2 `withTenant(companyId)` -- eq(table.companyId, companyId) 반환
  - [x] 2.3 `scopedWhere(companyId, ...conditions)` -- AND 조건 결합
  - [x] 2.4 `scopedInsert(companyId, data)` -- INSERT 데이터에 companyId 자동 주입
- [x] Task 3: 기존 라우트 중 1개 마이그레이션 예시 (AC: #2)
  - [x] 3.1 `routes/admin/departments.ts`를 withTenant 헬퍼 사용으로 전환 (참고 구현)
- [x] Task 4: 단위 테스트 (AC: #6, #7)
  - [x] 4.1 withTenant 헬퍼 테스트 (eq 조건 생성 확인)
  - [x] 4.2 tenantMiddleware body 불일치 403 테스트
  - [x] 4.3 tenantMiddleware companyId 누락 401 테스트
  - [x] 4.4 superadmin 우회 테스트
  - [x] 4.5 scopedInsert companyId 자동 주입 테스트
  - [x] 4.6 기존 테스트 regression 없음 확인

## Dev Notes

### CRITICAL: 기존 코드 분석

**현재 tenant.ts (line 1-12):**
```typescript
// 현재는 로깅만 하는 stub
export const tenantMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const tenant = c.get('tenant')
  if (tenant) {
    console.log(`[TENANT] company=${tenant.companyId} user=${tenant.userId} role=${tenant.role}`)
  }
  await next()
}
```
이 파일을 **확장**해야 함. 새로 만들지 말 것.

**현재 auth.ts (이미 JWT에서 companyId 추출):**
- `authMiddleware`가 JWT payload에서 `companyId`, `sub`(userId), `role`을 추출
- `TenantContext` 객체로 `c.set('tenant', tenant)` 설정
- auth -> tenant 순서로 미들웨어 체이닝

**현재 라우트 패턴 (수동 companyId 필터링):**
```typescript
// routes/workspace/chat.ts:44 -- 이미 수동으로 companyId 사용
.where(and(eq(chatSessions.userId, tenant.userId), eq(chatSessions.companyId, tenant.companyId)))

// routes/admin/departments.ts:30 -- query param에서 companyId 받음
const companyId = c.req.query('companyId')
```
라우트들이 이미 수동으로 companyId를 사용 중. 헬퍼 함수로 패턴을 통일하되, 기존 라우트 전부를 이 스토리에서 변환하지 말 것 (점진적 마이그레이션).

**TenantContext 타입 (`packages/shared/src/types.ts`):**
```typescript
export type TenantContext = {
  companyId: string
  userId: string
  role: 'admin' | 'user'
  isAdminUser?: boolean
}
```

**AppEnv 타입 (`packages/server/src/types.ts`):**
```typescript
export type AppEnv = {
  Variables: {
    tenant: TenantContext
  }
}
```

### Architecture Decision #9: Tenant Isolation

아키텍처 결정:
1. **API 미들웨어**: JWT에서 companyId 추출 + 요청 body 검증 (불일치 시 403)
2. **DB 쿼리 헬퍼**: `withTenant(companyId)` -- 모든 SELECT/UPDATE/DELETE에 companyId WHERE 자동 주입
3. **이중 검증**: 미들웨어 레벨 + 쿼리 레벨 양쪽에서 격리

### 구현 접근법

1. **tenant.ts 확장**: 로깅 stub -> 실제 body 검증 미들웨어로
2. **tenant-helpers.ts 신규**: Drizzle 전용 쿼리 헬퍼 (별도 파일)
3. **departments.ts 마이그레이션**: 1개 라우트만 예시로 전환 (나머지는 후속 스토리)

### 테이블 목록 (companyId가 있는 테이블 ~50개)

스키마에 companyId가 있는 테이블이 약 50개. 모든 테이블의 쿼리에 withTenant가 적용 가능해야 함. 특수 케이스:
- `orgTemplates`, `soulTemplates`, `canvasLayouts`: companyId가 nullable (null = 플랫폼 내장)
- `adminUsers`, `adminSessions`: companyId 없음 (플랫폼 관리자)
- `companies`: 자체가 테넌트 루트 (companyId 필터 대상 아님)

### Project Structure Notes

- 미들웨어: `packages/server/src/middleware/tenant.ts` (기존 파일 수정)
- 헬퍼: `packages/server/src/db/tenant-helpers.ts` (신규 생성)
- 테스트: `packages/server/src/__tests__/unit/tenant-isolation.test.ts` (신규)
- 예시 마이그레이션: `packages/server/src/routes/admin/departments.ts` (수정)

### References

- [Source: architecture.md#Decision-9] Tenant Isolation Middleware
- [Source: prd.md#FR42] companyId 기반 데이터 격리
- [Source: prd.md#NFR10] 모든 DB 쿼리에 companyId WHERE 절 필수
- [Source: epics.md#E1-S2] 테넌트 격리 미들웨어 스토리 정의
- [Source: packages/server/src/middleware/auth.ts] 현재 JWT 인증 + TenantContext 설정
- [Source: packages/server/src/middleware/tenant.ts] 현재 로깅 stub
- [Source: packages/server/src/db/schema.ts] 50+ 테이블 companyId FK

### Library/Framework Requirements

- Hono v4 미들웨어 패턴 (`MiddlewareHandler<AppEnv>`)
- Drizzle ORM v0.39 (`eq`, `and` 조건 빌더)
- bun:test (테스트 프레임워크)

### Testing Requirements

- bun:test 사용 (`packages/server/src/__tests__/unit/`)
- 기존 테스트 regression 없음 확인
- 단위 테스트: 미들웨어 동작 + 헬퍼 함수 로직
- Hono 테스트: `app.request()` 패턴으로 미들웨어 통합 테스트

### Previous Story Intelligence (Story 1-1)

- 6개 신규 테이블 추가 완료, 모든 테이블에 companyId FK + index
- Drizzle ORM v0.39 패턴 확인: `pgTable`, `uuid PK`, `references`, `index`, `relations`
- 테스트 패턴: `packages/server/src/__tests__/unit/` 디렉토리, `describe/test/expect` 구조
- 기존 201건 + 신규 45건 = 246건 테스트 기준선

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- tenantMiddleware 확장: 로깅 stub -> companyId 검증 + body 불일치 403 + superadmin 우회
- tenant-helpers.ts 신규: withTenant(), scopedWhere(), scopedInsert() 3개 헬퍼 함수
- departments.ts 마이그레이션: tenant 헬퍼 + tenantMiddleware 적용 예시 (companyId를 body 대신 JWT에서 가져옴)
- 18건 신규 테스트 전부 통과 (middleware + helper 테스트)
- 기존 45건 schema 테스트 regression 없음 확인
- Error codes: TENANT_001 (companyId 누락 401), TENANT_002 (body 불일치 403)

### File List

- packages/server/src/middleware/tenant.ts (수정 -- stub -> 실제 미들웨어)
- packages/server/src/db/tenant-helpers.ts (신규 -- withTenant, scopedWhere, scopedInsert)
- packages/server/src/routes/admin/departments.ts (수정 -- tenant 헬퍼 적용 예시)
- packages/server/src/__tests__/unit/tenant-isolation.test.ts (신규 -- 18건 테스트)
