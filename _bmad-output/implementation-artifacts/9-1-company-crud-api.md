# Story 9.1: Company CRUD API (Super Admin)

Status: done

## Story

As a Super Admin,
I want to create, read, update, and delete companies with automatic admin account provisioning,
so that I can manage the multi-tenant platform and onboard new companies with their initial administrator.

## Acceptance Criteria

1. **AC1: 회사 생성 + 관리자 계정 자동 생성**
   - POST `/api/super-admin/companies` 호출 시 회사 생성 + companyId 자동 발급(UUID)
   - 동시에 해당 회사의 첫 번째 admin_users(company_admin 역할) 계정 자동 생성
   - 초기 비밀번호는 암호학적으로 안전한 랜덤 문자열 자동 생성 (최소 12자, 대소문자+숫자+특수문자)
   - slug 중복 시 409 반환
   - admin username 중복 시 409 반환
   - 응답에 회사 정보 + admin 계정 정보 + 초기 비밀번호(평문, 1회성 반환) 포함

2. **AC2: 회사 목록 조회 (페이지네이션 + 검색)**
   - GET `/api/super-admin/companies` — 전체 회사 목록 조회
   - 쿼리 파라미터: `page` (default 1), `limit` (default 20, max 100), `search` (회사명 부분 일치), `isActive` (boolean 필터)
   - 응답: `{ data: companies[], pagination: { page, limit, total, totalPages } }`

3. **AC3: 회사 상세 조회**
   - GET `/api/super-admin/companies/:id` — 회사 상세 정보 + 유저 수 + 에이전트 수 + 부서 수 통계 포함
   - 존재하지 않는 ID → 404

4. **AC4: 회사 정보 수정**
   - PUT `/api/super-admin/companies/:id` — 회사명, slug, settings, smtpConfig 수정 가능
   - slug 변경 시 중복 체크
   - 존재하지 않는 ID → 404

5. **AC5: 회사 소프트 삭제**
   - DELETE `/api/super-admin/companies/:id` — isActive=false로 설정 (데이터 보존)
   - 이미 비활성 상태인 회사 → 409
   - 삭제 시 해당 회사의 모든 users/admin_users도 isActive=false 처리 (cascade soft delete)
   - 감사 로그 기록 필수

6. **AC6: Super Admin 전용 접근 제어**
   - 모든 `/api/super-admin/companies` 엔드포인트는 `super_admin` 역할만 접근 가능
   - `company_admin`, `ceo`, `employee` 역할은 403 반환
   - rbacMiddleware('super_admin') 적용

7. **AC7: 감사 로그**
   - 회사 생성/수정/삭제 시 audit_logs 테이블에 기록
   - action: `company.create`, `company.update`, `company.delete`
   - metadata에 변경 내용 포함

## Tasks / Subtasks

- [x] Task 1: Super Admin 전용 라우트 파일 생성 (AC: #6)
  - [x]1.1 `packages/server/src/routes/super-admin/companies.ts` 생성
  - [x]1.2 authMiddleware + rbacMiddleware('super_admin') 미들웨어 체이닝
  - [x]1.3 index.ts에 `/api/super-admin` 라우트 마운트

- [x] Task 2: CompanyManagementService 생성 (AC: #1, #5, #7)
  - [x]2.1 `packages/server/src/services/company-management.ts` 생성
  - [x]2.2 createCompanyWithAdmin(): 회사 + admin 계정 트랜잭션 처리
  - [x]2.3 generateSecurePassword(): crypto.randomBytes 기반 안전한 비밀번호 생성
  - [x]2.4 softDeleteCompany(): cascade soft delete (회사 + 소속 유저 일괄 비활성화)
  - [x]2.5 감사 로그 기록 (AUDIT_ACTIONS 상수 추가)

- [x] Task 3: 회사 생성 API (AC: #1)
  - [x]3.1 POST `/api/super-admin/companies` 엔드포인트 구현
  - [x]3.2 Zod 스키마: name, slug, adminUsername, adminName, adminEmail 검증
  - [x]3.3 slug 중복 / admin username 중복 검사
  - [x]3.4 자동 비밀번호 생성 + Bun.password.hash
  - [x]3.5 응답: 회사 + admin 계정 + 초기 비밀번호(평문)

- [x] Task 4: 회사 목록 조회 API (AC: #2)
  - [x]4.1 GET `/api/super-admin/companies` 엔드포인트 구현
  - [x]4.2 페이지네이션: page, limit 쿼리 파라미터 파싱
  - [x]4.3 검색: search 파라미터로 회사명 ilike 필터
  - [x]4.4 isActive 필터 지원
  - [x]4.5 total count 쿼리 + totalPages 계산

- [x] Task 5: 회사 상세/수정/삭제 API (AC: #3, #4, #5)
  - [x]5.1 GET `/api/super-admin/companies/:id` — 통계 포함 상세
  - [x]5.2 PUT `/api/super-admin/companies/:id` — 수정 + slug 중복 체크
  - [x]5.3 DELETE `/api/super-admin/companies/:id` — cascade soft delete
  - [x]5.4 모든 변경에 감사 로그 기록

## Dev Notes

### 기존 코드 분석

**현재 상태 (`packages/server/src/routes/admin/companies.ts`):**
- 이미 기본적인 CRUD가 있으나, `adminOnly` 미들웨어 사용 (super_admin + company_admin 모두 접근)
- 회사 생성 시 admin 계정을 자동 생성하지 않음
- 페이지네이션/검색 없음
- 감사 로그 없음
- 이 파일은 company_admin용으로 유지하고, **새로운 super-admin 전용 라우트를 별도 생성**할 것

**중요: 기존 `/api/admin/companies` 라우트는 건드리지 말 것!**
- 기존 라우트는 company_admin이 자기 회사 정보를 조회/수정하는 용도
- Story 9-1은 super_admin이 모든 회사를 관리하는 별도 엔드포인트

### Architecture Compliance

- **미들웨어 체이닝 순서:** auth → tenant → rbac (Architecture Decision #9)
- **DB 격리:** Super Admin 라우트는 tenant 격리 없이 전체 회사 접근 (companyId = 'system')
- **API 응답 패턴:** `{ data }` / `{ error: { code, message } }` (Architecture 필수)
- **파일명:** kebab-case 소문자 필수
- **비밀번호 해시:** `Bun.password.hash()` 사용 (bcrypt 아님, auth.ts 패턴 참조)

### 핵심 참조 파일

| 파일 | 용도 |
|------|------|
| `packages/server/src/db/schema.ts` | companies, adminUsers, users, auditLogs 테이블 스키마 |
| `packages/server/src/middleware/auth.ts` | authMiddleware, adminOnly, createToken |
| `packages/server/src/middleware/rbac.ts` | rbacMiddleware (역할별 접근 제어) |
| `packages/server/src/routes/auth.ts` | 회사 등록 + admin 계정 생성 패턴 (register 참조) |
| `packages/server/src/services/audit-log.ts` | AUDIT_ACTIONS 상수, auditLog() 함수 |
| `packages/server/src/services/organization.ts` | OrganizationService 패턴 참조 |
| `packages/server/src/routes/admin/companies.ts` | 기존 company CRUD (건드리지 말 것) |
| `packages/server/src/index.ts` | 라우트 마운트 위치 |

### admin_users 테이블 구조

```typescript
adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  role: adminRoleEnum('role').notNull().default('admin'), // 'superadmin' | 'admin'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

**주의:** admin_users 테이블에 companyId 필드가 **없음**. Story 9-1에서 company_admin을 회사에 연결하려면:
- 옵션 A: admin_users에 companyId 칼럼 추가 (스키마 변경 필요)
- 옵션 B: 별도 매핑 테이블 또는 users 테이블에 admin 계정 생성
- **권장: 옵션 A** — admin_users에 nullable companyId 추가 (superadmin은 null, company_admin은 필수)

### companies 테이블 구조

```typescript
companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  smtpConfig: jsonb('smtp_config'),
  settings: jsonb('settings'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

### 비밀번호 생성 패턴

```typescript
import { randomBytes } from 'crypto'

function generateSecurePassword(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  const bytes = randomBytes(length)
  return Array.from(bytes).map(b => chars[b % chars.length]).join('')
}
```

### Project Structure Notes

- Super Admin 라우트는 `packages/server/src/routes/super-admin/` 디렉토리에 배치
- 기존 `packages/server/src/routes/admin/` 디렉토리는 company_admin용으로 유지
- 서비스 파일: `packages/server/src/services/company-management.ts`
- 테스트: `packages/server/src/__tests__/unit/company-crud-api.test.ts`

### RBAC 미들웨어 사용 패턴

```typescript
// rbacMiddleware는 tenant.role을 체크
// super_admin은 자동으로 모든 엔드포인트 통과 (rbac.ts 라인 19)
// 하지만 명시적으로 super_admin만 허용하려면:
companiesRoute.use('*', authMiddleware, rbacMiddleware('super_admin'))
```

### 기존 admin 라우트 vs 새 super-admin 라우트

| 구분 | `/api/admin/companies` (기존) | `/api/super-admin/companies` (신규) |
|------|------------------------------|-------------------------------------|
| 접근 권한 | admin_users (super+company) | super_admin만 |
| 범위 | 자기 회사만 | 전체 회사 |
| 회사 생성 | 단순 생성 | 생성 + admin 계정 + 비밀번호 |
| 페이지네이션 | 없음 | 있음 (page, limit, search) |
| 감사 로그 | 없음 | 있음 |
| cascade 삭제 | 활성 직원 있으면 거부 | cascade soft delete |

### References

- [Source: _bmad-output/planning-artifacts/prd.md#FR43] 회사 생성 + 관리자 계정 발급
- [Source: _bmad-output/planning-artifacts/prd.md#FR48] JWT RBAC
- [Source: _bmad-output/planning-artifacts/prd.md#FR49] 감사 로그
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision9] Tenant Isolation
- [Source: _bmad-output/planning-artifacts/epics.md#E9-S1] 회사 CRUD API (2 SP)
- [Source: packages/server/src/routes/auth.ts] 회사 등록 + admin 생성 패턴
- [Source: packages/server/src/middleware/rbac.ts] RBAC 미들웨어

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Task 1: Created `routes/super-admin/companies.ts` with authMiddleware + rbacMiddleware('super_admin'). Mounted at `/api/super-admin` in index.ts.
- Task 2: Created `services/company-management.ts` with all CRUD functions. generateSecurePassword uses crypto.randomBytes with guaranteed character diversity.
- Task 3: POST creates company + admin account. Auto-generates secure password (returned once in plaintext).
- Task 4: GET list with page/limit/search/isActive. Returns pagination metadata.
- Task 5: GET detail (with user/agent/dept stats), PUT update (slug uniqueness), DELETE cascade soft delete.
- Schema: Added nullable companyId FK and email to admin_users. Migration 0033.
- Audit: Added COMPANY_CREATE/UPDATE/DELETE constants. All mutations create audit log entries.
- Tests: 73 tests passing.

### File List

- packages/server/src/routes/super-admin/companies.ts (new)
- packages/server/src/services/company-management.ts (new)
- packages/server/src/db/schema.ts (modified)
- packages/server/src/db/migrations/0033_admin-users-company-id.sql (new)
- packages/server/src/services/audit-log.ts (modified)
- packages/server/src/index.ts (modified)
- packages/server/src/__tests__/unit/company-crud-api.test.ts (new)
