# Story 1.3: RBAC Middleware

Status: done

## Story

As a **system architect**,
I want **JWT payload에서 역할(super_admin/company_admin/ceo/employee)을 추출하고 API 엔드포인트별 접근을 제어하는 RBAC 미들웨어**,
so that **역할별로 적절한 API 접근 권한이 강제되어 보안이 보장된다**.

## Acceptance Criteria

1. **역할별 허용 엔드포인트 매트릭스 정의** -- 라우트 그룹별로 허용 역할을 선언적으로 관리
2. **권한 없는 접근 시 403 반환** + 감사 로그(audit_logs) 기록
3. **Super Admin은 전체 접근**, Employee는 자기 부서 관련 엔드포인트만 접근
4. **미들웨어 체이닝 순서: auth -> tenant -> rbac** (기존 auth/tenant 미들웨어 이후에 rbac 적용)
5. 기존 테스트 전부 통과 유지 (regression 없음)
6. `bun run typecheck` 통과

## Tasks / Subtasks

- [x] Task 1: 역할 타입 확장 (AC: #1, #3)
  - [x] 1.1 `TenantContext.role`을 4가지 역할로 확장: `super_admin | company_admin | ceo | employee`
  - [x] 1.2 `JwtPayload.role`도 동일하게 확장
  - [x] 1.3 기존 코드에서 `admin | user` 사용하는 부분 호환 처리

- [x] Task 2: RBAC 권한 매트릭스 정의 (AC: #1)
  - [x] 2.1 `packages/server/src/middleware/rbac.ts` 파일 생성
  - [x] 2.2 라우트 패턴별 허용 역할 매트릭스 정의 (선언적 config)
  - [x] 2.3 PRD RBAC Matrix 기반 매핑:
    - `/api/admin/*` -> `super_admin`, `company_admin`
    - `/api/workspace/*` -> `company_admin`, `ceo`, `employee`
    - `/api/admin/companies/*` -> `super_admin` only
    - `/api/admin/monitoring/*` -> `super_admin` only
    - `/api/workspace/strategy/*` -> `ceo` only (직원은 접근 불가)

- [x] Task 3: RBAC 미들웨어 구현 (AC: #1, #2, #3, #4)
  - [x] 3.1 `rbacMiddleware(allowedRoles: Role[])` 팩토리 함수 구현
  - [x] 3.2 JWT payload의 role 필드로 접근 제어
  - [x] 3.3 403 반환 시 표준 에러 응답: `{ success: false, error: { code: 'RBAC_001', message } }`
  - [x] 3.4 Super Admin 바이패스 로직 (모든 엔드포인트 접근 가능)

- [x] Task 4: 감사 로그 연동 (AC: #2)
  - [x] 4.1 권한 거부 시 audit_logs에 기록: action='auth.rbac.denied', targetType='api_endpoint'
  - [x] 4.2 audit_logs INSERT 헬퍼 함수 작성 (기존 audit_logs 테이블 활용)
  - [x] 4.3 로그에 요청자 정보(actorType, actorId, role, endpoint, method) 포함

- [x] Task 5: 기존 미들웨어 통합 (AC: #4)
  - [x] 5.1 `adminOnly` 미들웨어를 새 역할 체계로 업데이트 (`isAdminLevel` 헬퍼 사용)
  - [x] 5.2 `companyAdminOnly` 미들웨어를 새 역할 체계로 업데이트 (`isCeoOrAbove` 헬퍼 사용)
  - [x] 5.3 라우트 파일에서 미들웨어 체이닝 순서 확인: auth -> tenant -> rbac

- [x] Task 6: Employee 부서 제한 (AC: #3)
  - [x] 6.1 Employee 역할은 자기 부서 관련 데이터만 접근 가능하도록 제한 로직
  - [x] 6.2 부서 제한은 미들웨어 레벨이 아닌 서비스 레벨에서 처리 (데이터 필터링)
  - [x] 6.3 미들웨어에서는 역할 기반 라우트 접근만 제어

## Dev Notes

### CRITICAL: 기존 인증 체계 분석

현재 `packages/server/src/middleware/auth.ts`에 이미 JWT 인증이 구현되어 있다:

```typescript
// 현재 JwtPayload (auth.ts line 9-15)
export type JwtPayload = {
  sub: string       // userId
  companyId: string
  role: 'admin' | 'user'    // ← 이것을 4가지 역할로 확장해야 함
  type?: 'admin'             // admin_users 로그인 시에만 추가
  exp: number
}
```

**현재 역할 구조:**
- `role: 'admin'` + `type: 'admin'` = Super Admin (admin_users 테이블)
- `role: 'admin'` + `type: undefined` = Company Admin (users 테이블, role='admin')
- `role: 'user'` = CEO 또는 Employee (구분 없음)

**목표 역할 구조 (PRD 기준):**
- `super_admin` -- admin_users 테이블의 superadmin 역할 (전체 시스템 관리)
- `company_admin` -- admin_users 테이블의 admin 역할 또는 users 테이블의 admin 역할 (자기 회사 관리)
- `ceo` -- users 테이블, role='admin' (사령관실 전체 접근 + 비용 열람)
- `employee` -- users 테이블, role='user' (권한 부여된 부서만)

### 역할 매핑 전략

**중요:** 기존 DB enum(`user_role: admin|user`, `admin_role: superadmin|admin`)은 변경하지 않는다. JWT 생성 시 4가지 RBAC 역할로 매핑:

```typescript
// auth.ts 로그인 로직에서:
// admin_users 테이블 로그인:
//   adminRoleEnum 'superadmin' → rbac role 'super_admin'
//   adminRoleEnum 'admin'      → rbac role 'company_admin'
// users 테이블 로그인:
//   userRoleEnum 'admin'  → rbac role 'ceo'
//   userRoleEnum 'user'   → rbac role 'employee'
```

### TenantContext 확장

`packages/shared/src/types.ts`의 TenantContext를 확장해야 한다:

```typescript
// 현재
export type TenantContext = {
  companyId: string
  userId: string
  role: 'admin' | 'user'
  isAdminUser?: boolean
}

// 변경 후
export type UserRole = 'super_admin' | 'company_admin' | 'ceo' | 'employee'

export type TenantContext = {
  companyId: string
  userId: string
  role: UserRole
  isAdminUser?: boolean  // admin_users 테이블에서 로그인 (super_admin 또는 company_admin)
}
```

### PRD RBAC Matrix (정확한 참조)

| 역할 | Admin 콘솔 | 사령관실 | 조직 관리 | 비용 관리 | 직원 관리 | 시스템 설정 |
|------|-----------|---------|----------|----------|----------|-----------|
| Super Admin | O | X | 전체 회사 | 전체 회사 집계 | 전체 회사 | 시스템 전체 |
| Company Admin | O + 메인 앱 | O (자기 회사) | 자기 회사 전체 | 자기 회사 전체 | 자기 회사 | 자기 회사 |
| CEO | 메인 앱 | O (전 부서) | 열람만 | 자기 회사 전체 | X | X |
| Employee | 메인 앱 | O (권한 부서) | X | 자기 비용만 | X | X |

### API 라우트별 허용 역할

```typescript
// 라우트 그룹 -> 허용 역할 매핑
const RBAC_RULES = {
  // Admin 콘솔 라우트
  '/api/admin/companies': ['super_admin'],
  '/api/admin/monitoring': ['super_admin'],
  '/api/admin/users': ['super_admin', 'company_admin'],
  '/api/admin/departments': ['super_admin', 'company_admin'],
  '/api/admin/agents': ['super_admin', 'company_admin'],
  '/api/admin/credentials': ['super_admin', 'company_admin'],
  '/api/admin/tools': ['super_admin', 'company_admin'],
  '/api/admin/report-lines': ['super_admin', 'company_admin'],
  '/api/admin/soul-templates': ['super_admin', 'company_admin'],
  '/api/admin/org-chart': ['super_admin', 'company_admin'],

  // Workspace 라우트 (CEO 앱)
  '/api/workspace': ['company_admin', 'ceo', 'employee'],
} as const
```

### 기존 미들웨어와의 관계

현재 3개 미들웨어가 존재한다:
1. `authMiddleware` (auth.ts:26) -- JWT 검증 + TenantContext 주입
2. `adminOnly` (auth.ts:50) -- `role === 'admin' && isAdminUser` 확인
3. `companyAdminOnly` (company-admin.ts:7) -- `role === 'admin'` 확인

**접근법:** 새 RBAC 미들웨어를 추가하고, 기존 `adminOnly`/`companyAdminOnly`는 RBAC 미들웨어의 래퍼로 리팩토링하여 하위 호환성 유지.

### audit_logs 테이블 구조 (Story 1-1에서 생성됨)

```typescript
// schema.ts에 이미 존재
auditLogs = pgTable('audit_logs', {
  id: uuid PK,
  companyId: uuid FK NOT NULL,
  actorType: varchar(20) -- 'admin_user' | 'user' | 'agent' | 'system'
  actorId: uuid NOT NULL,
  action: varchar(100) -- 'auth.rbac.denied'
  targetType: varchar(50) -- 'api_endpoint'
  targetId: uuid,
  before: jsonb,
  after: jsonb,
  metadata: jsonb -- { method, path, role, ip }
  createdAt: timestamp
})
```

### Project Structure Notes

- 미들웨어 파일: `packages/server/src/middleware/rbac.ts` (신규)
- 수정 파일: `packages/server/src/middleware/auth.ts` (JwtPayload 역할 확장)
- 수정 파일: `packages/shared/src/types.ts` (TenantContext 역할 확장)
- 수정 파일: `packages/server/src/routes/auth.ts` (JWT 생성 시 4역할 매핑)
- 기존 패턴을 따를 것: MiddlewareHandler<AppEnv>, HTTPError, c.get('tenant')

### Architecture Compliance

- [Source: architecture.md#Decision-9] Tenant Isolation: 미들웨어 체이닝 auth -> tenant -> rbac
- [Source: prd.md#RBAC-Matrix] 4가지 역할별 접근 제어 매트릭스
- [Source: prd.md#FR48] JWT 기반 역할별 API 접근 제한
- [Source: architecture.md#Enforcement-Guidelines] API 응답은 `{ success, data | error }` 래퍼

### Library/Framework Requirements

- Hono MiddlewareHandler (기존 패턴 그대로)
- Drizzle ORM (audit_logs INSERT)
- No new dependencies needed

### File Structure

**신규 파일:**
- `packages/server/src/middleware/rbac.ts` -- RBAC 미들웨어 + 권한 매트릭스

**수정 파일:**
- `packages/shared/src/types.ts` -- TenantContext.role 타입 확장
- `packages/server/src/middleware/auth.ts` -- JwtPayload.role 타입 확장
- `packages/server/src/routes/auth.ts` -- JWT 생성 시 4역할 매핑
- `packages/server/src/middleware/company-admin.ts` -- RBAC 래퍼로 리팩토링

### Testing Requirements

- bun:test 단위 테스트: RBAC 미들웨어 역할 검증 (4역할 x 주요 엔드포인트)
- 403 반환 + 에러 코드 검증
- Super Admin 바이패스 검증
- 감사 로그 INSERT 검증
- 기존 테스트 regression 없음 확인

### Previous Story Intelligence (Story 1-1)

- Schema에 audit_logs 테이블 이미 정의됨 -- INSERT helper만 작성하면 됨
- 3개 enum(commandTypeEnum, orchestrationTaskStatusEnum, qualityResultEnum) 추가 패턴 참고
- 파일명 kebab-case, 변수명 camelCase 규칙 준수
- 기존 201건 + Story 1-1의 20건 = 기존 테스트 풀 확인 필요

### Git Intelligence

- 최근 커밋: `e0dd18e feat: Story 1-1 Phase-1 Drizzle schema extension`
- 기존 코드에 auth.ts, tenant.ts, company-admin.ts 미들웨어 존재
- 라우트 파일 내부에서 `authMiddleware` + `adminOnly`를 직접 사용하는 패턴

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E1-S3] 스토리 정의 + AC
- [Source: _bmad-output/planning-artifacts/prd.md#RBAC-Matrix] 역할별 접근 제어 매트릭스
- [Source: _bmad-output/planning-artifacts/prd.md#FR48] JWT RBAC 요구사항
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision-9] Tenant Isolation 미들웨어 체이닝
- [Source: packages/server/src/middleware/auth.ts] 기존 JWT 인증 미들웨어
- [Source: packages/server/src/middleware/company-admin.ts] 기존 회사 관리자 미들웨어
- [Source: packages/shared/src/types.ts] TenantContext 타입 정의
- [Source: packages/server/src/db/schema.ts] audit_logs 테이블 정의

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- UserRole 타입 추가: `super_admin | company_admin | ceo | employee` (4 역할)
- `isAdminLevel()`, `isCeoOrAbove()` 헬퍼 함수 추가 (shared 패키지)
- `rbacMiddleware()` 팩토리 함수: 허용 역할 목록 기반 접근 제어, Super Admin 바이패스
- RBAC 거부 시 audit_logs에 자동 INSERT (비동기, 응답 차단 없음)
- JWT 생성 시 4역할 매핑: admin_users superadmin→super_admin, admin→company_admin / users admin→ceo, user→employee
- 기존 `adminOnly`/`companyAdminOnly` 미들웨어를 새 역할 체계로 업데이트
- tenant.ts의 super admin override도 새 역할 체계 적용
- ws/server.ts WebSocket 클라이언트 역할 타입 업데이트
- workspace 라우트(sns, agents, nexus)의 역할 체크를 `isCeoOrAbove()` 헬퍼로 변경
- 테스트 유틸 makeToken/createTestTokens를 새 역할로 업데이트
- 36건 신규 RBAC 테스트 작성 (전부 통과), 기존 테스트 regression 없음

### Change Log

- 2026-03-07: Story 1-3 구현 완료 — RBAC 미들웨어 + 4역할 체계

### File List

- packages/shared/src/types.ts (수정 — UserRole 타입 + isAdminLevel/isCeoOrAbove 헬퍼)
- packages/server/src/middleware/rbac.ts (신규 — rbacMiddleware 팩토리 + audit log)
- packages/server/src/middleware/auth.ts (수정 — JwtPayload.role → UserRole, adminOnly 업데이트)
- packages/server/src/middleware/company-admin.ts (수정 — isCeoOrAbove 사용)
- packages/server/src/routes/auth.ts (수정 — JWT 생성 시 4역할 매핑)
- packages/server/src/ws/server.ts (수정 — WsClient.role → UserRole)
- packages/server/src/routes/workspace/sns.ts (수정 — isCeoOrAbove 사용)
- packages/server/src/routes/workspace/agents.ts (수정 — isCeoOrAbove 사용)
- packages/server/src/routes/workspace/nexus.ts (수정 — isCeoOrAbove 사용)
- packages/server/src/__tests__/helpers/test-utils.ts (수정 — makeToken 새 역할)
- packages/server/src/__tests__/tenant-isolation.test.ts (수정 — 새 역할 적용)
- packages/server/src/__tests__/unit/rbac-middleware.test.ts (신규 — 36 테스트)
