# Story 9.2: Human Employee Management API

Status: done

## Story

As a Company Admin,
I want to invite human employees, assign them to departments, set access permissions, and manage their workspaces,
so that team members can access the AI organization within their permitted scope.

## Acceptance Criteria

1. **AC1: 직원 초대 (워크스페이스 생성)**
   - POST `/api/admin/employees` 호출 시 users 테이블에 role='user' 계정 생성
   - 초기 비밀번호 자동 생성 (generateSecurePassword 재사용, company-management.ts)
   - 부서 할당 배열 `departmentIds` 수신 -> employee_departments 매핑 생성
   - email 필수 (초대 알림용)
   - 같은 companyId 내 username 중복 시 409 반환
   - 응답에 직원 정보 + 초기 비밀번호(평문, 1회성) + 할당된 부서 목록 포함
   - 감사 로그 기록: `employee.create`

2. **AC2: 직원 목록 조회 (페이지네이션 + 필터)**
   - GET `/api/admin/employees` — 자기 회사 직원 목록
   - 쿼리 파라미터: `page` (default 1), `limit` (default 20, max 100), `search` (이름/username 부분 일치), `departmentId` (부서 필터), `isActive` (boolean)
   - 응답에 각 직원의 할당된 부서 목록 포함
   - 응답: `{ data: employees[], pagination: { page, limit, total, totalPages } }`
   - companyId 기반 테넌트 격리 필수

3. **AC3: 직원 상세 조회**
   - GET `/api/admin/employees/:id` — 직원 상세 + 할당된 부서 목록
   - 다른 회사 직원 조회 시도 시 404 반환 (테넌트 격리)
   - 존재하지 않는 ID → 404

4. **AC4: 직원 정보 수정 + 부서 할당 변경**
   - PUT `/api/admin/employees/:id` — 이름, email, 부서 할당 변경
   - `departmentIds` 제공 시 기존 매핑 삭제 후 새로 생성 (replace 전략)
   - 할당하려는 부서가 같은 회사에 속하는지 검증 (다른 회사 부서 할당 차단)
   - 감사 로그 기록: `employee.update`

5. **AC5: 직원 비활성화 (소프트 삭제)**
   - DELETE `/api/admin/employees/:id` — isActive=false 설정
   - 이미 비활성화 상태인 직원 → 409
   - 비활성화 시 해당 직원의 세션도 삭제 (강제 로그아웃)
   - employee_departments 매핑은 유지 (재활성화 시 복원 가능)
   - 감사 로그 기록: `employee.deactivate`

6. **AC6: 직원 재활성화**
   - POST `/api/admin/employees/:id/reactivate` — isActive=true 복원
   - 이미 활성 상태인 직원 → 409
   - 감사 로그 기록: `employee.reactivate`

7. **AC7: 비밀번호 초기화**
   - POST `/api/admin/employees/:id/reset-password` — 새 임시 비밀번호 생성
   - generateSecurePassword 사용
   - 기존 세션 삭제 (강제 로그아웃)
   - 감사 로그 기록: `employee.password_reset`

8. **AC8: Company Admin + Super Admin 접근 제어**
   - 모든 `/api/admin/employees` 엔드포인트: company_admin + super_admin 접근 가능
   - company_admin은 자기 회사 직원만 관리 (테넌트 격리)
   - super_admin은 쿼리 파라미터로 companyId 지정하여 모든 회사 직원 관리 가능
   - ceo, employee 역할은 403

## Tasks / Subtasks

- [x] Task 1: employee_departments 스키마 추가 (AC: #1, #4)
  - [x] 1.1 `packages/server/src/db/schema.ts`에 employee_departments 테이블 추가 (userId + departmentId + companyId, 복합 unique)
  - [x] 1.2 Drizzle migration 생성

- [x] Task 2: EmployeeService 생성 (AC: #1~#7)
  - [x] 2.1 `packages/server/src/services/employee-management.ts` 생성
  - [x] 2.2 createEmployee(): 직원 생성 + 부서 할당 + 비밀번호 생성 (트랜잭션)
  - [x] 2.3 listEmployees(): 페이지네이션 + 검색 + 부서필터 + 부서 목록 join
  - [x] 2.4 getEmployeeDetail(): 직원 상세 + 부서 목록
  - [x] 2.5 updateEmployee(): 정보 수정 + 부서 재할당 (트랜잭션)
  - [x] 2.6 deactivateEmployee(): soft delete + 세션 삭제
  - [x] 2.7 reactivateEmployee(): 재활성화
  - [x] 2.8 resetPassword(): 비밀번호 초기화 + 세션 삭제

- [x] Task 3: Employee 라우트 생성 (AC: #8)
  - [x] 3.1 `packages/server/src/routes/admin/employees.ts` 생성
  - [x] 3.2 authMiddleware + adminOnly 미들웨어 체이닝
  - [x] 3.3 Zod 스키마 검증 (create, update)
  - [x] 3.4 7개 엔드포인트 구현
  - [x] 3.5 index.ts에 라우트 마운트

- [x] Task 4: AUDIT_ACTIONS 상수 추가 (AC: #1, #4, #5, #6, #7)
  - [x] 4.1 audit-log.ts에 EMPLOYEE_* 상수 추가

## Dev Notes

### 기존 코드 분석

**현재 상태 (`packages/server/src/routes/admin/users.ts`):**
- 기본 CRUD 존재하지만 Story 9-2 요구사항 미충족:
  - 페이지네이션/검색 없음
  - 부서 할당 기능 없음
  - 감사 로그 없음
  - 비밀번호 자동 생성 없음 (수동 입력)
  - 재활성화 API 없음
- **이 파일은 건드리지 말 것** — 새로운 employees 라우트를 별도 생성
- 기존 users.ts는 레거시로 유지 (향후 deprecate 가능)

**중요: employees 라우트는 users 테이블을 사용하되, 별도 엔드포인트 `/api/admin/employees`로 제공**
- "employee"는 비즈니스 용어, "user"는 DB 테이블명
- users 테이블의 role='user' 레코드가 human employee에 해당
- role='admin'은 CEO (기존 사용, 건드리지 말 것)

### 새로 추가할 스키마: employee_departments

```typescript
// 직원-부서 매핑 테이블
export const employeeDepartments = pgTable('employee_departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  departmentId: uuid('department_id').notNull().references(() => departments.id),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('employee_departments_company_idx').on(table.companyId),
  uniqueAssignment: unique('employee_departments_unique').on(table.userId, table.departmentId),
}))
```

### 패턴 참조 (Story 9-1에서 확립)

- **비밀번호 생성**: `generateSecurePassword()` from `services/company-management.ts` — 재사용 (별도 유틸리티로 추출하거나 import)
- **페이지네이션**: `listCompanies()` 패턴 — page/limit/search/total/totalPages 동일 구조
- **소프트 삭제**: `softDeleteCompany()` — isActive=false + cascade 패턴
- **감사 로그**: `createAuditLog()` 사용, AUDIT_ACTIONS에 상수 추가
- **미들웨어**: `authMiddleware + adminOnly` (admin/users.ts 패턴)
- **Zod 검증**: `zValidator('json', schema)` 패턴
- **API 응답**: `{ data }` / `{ error: { code, message } }` 패턴
- **UUID 검증**: z.string().uuid() (9-1에서 추가된 패턴)

### 테넌트 격리 전략

- company_admin: `tenant.companyId`를 자동 적용 (모든 쿼리에 companyId WHERE 절)
- super_admin: 쿼리 파라미터 `companyId`로 특정 회사 지정 가능
- 부서 할당 시 해당 부서가 같은 companyId인지 검증 필수

### Architecture Compliance

- **미들웨어 체이닝:** auth → adminOnly (tenant 격리는 서비스 레이어에서)
- **DB 격리:** 모든 쿼리에 companyId WHERE 절 필수
- **API 응답 패턴:** `{ data }` / `{ error: { code, message } }` (Architecture Decision)
- **파일명:** kebab-case 소문자 필수
- **비밀번호 해시:** `Bun.password.hash()` 사용 (auth.ts 패턴)
- **테스트:** bun:test, `packages/server/src/__tests__/unit/` 디렉토리

### 핵심 참조 파일

| 파일 | 용도 |
|------|------|
| `packages/server/src/db/schema.ts` | users, departments, companies, sessions 테이블 |
| `packages/server/src/services/company-management.ts` | generateSecurePassword, 페이지네이션, 감사 로그 패턴 |
| `packages/server/src/routes/admin/users.ts` | 기존 user CRUD (건드리지 말 것, 패턴 참조만) |
| `packages/server/src/middleware/auth.ts` | authMiddleware, adminOnly |
| `packages/server/src/middleware/rbac.ts` | rbacMiddleware |
| `packages/server/src/services/audit-log.ts` | AUDIT_ACTIONS, createAuditLog() |
| `packages/server/src/index.ts` | 라우트 마운트 위치 |
| `packages/server/src/routes/admin/departments.ts` | 부서 CRUD 패턴 참조 |

### Project Structure Notes

- 새 라우트: `packages/server/src/routes/admin/employees.ts`
- 새 서비스: `packages/server/src/services/employee-management.ts`
- 스키마 추가: `packages/server/src/db/schema.ts` (employee_departments 테이블)
- 마이그레이션: `packages/server/src/db/migrations/0034_*.sql`
- 테스트: `packages/server/src/__tests__/unit/employee-management.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/prd.md#FR44] Admin은 Human 직원의 워크스페이스를 생성하고 접근 권한(부서별)을 부여
- [Source: _bmad-output/planning-artifacts/prd.md#FR45] Human 직원은 자기 워크스페이스 내에서만 명령/비용/이력 확인
- [Source: _bmad-output/planning-artifacts/epics.md#E9-S2] Human 직원 관리 API (3 SP)
- [Source: _bmad-output/planning-artifacts/epics.md#E9-S3] 직원 사령관실 접근 제한 (별도 스토리)
- [Source: packages/server/src/routes/admin/users.ts] 기존 user CRUD 패턴
- [Source: packages/server/src/services/company-management.ts] 9-1 패턴 참조

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Added `employee_departments` table to schema with userId+departmentId unique constraint, companyId index, and FK references. Migration 0034. Added relations to users and departments.
- Task 2: Created `employee-management.ts` service with 7 functions: createEmployee (auto password + dept assignment), listEmployees (pagination+search+dept filter), getEmployeeDetail, updateEmployee (dept replace strategy), deactivateEmployee (soft delete + session kill), reactivateEmployee, resetEmployeePassword. All functions enforce companyId tenant isolation.
- Task 3: Created `employees.ts` route with 7 endpoints under `/api/admin/employees`. Uses authMiddleware + adminOnly. Zod validation for create/update. Super admin can specify companyId via query param.
- Task 4: Added 5 AUDIT_ACTIONS constants: EMPLOYEE_CREATE, EMPLOYEE_UPDATE, EMPLOYEE_DEACTIVATE, EMPLOYEE_REACTIVATE, EMPLOYEE_PASSWORD_RESET.
- Tests: 99 structural + 52 QA risk-based = 151 tests passing.
- Code Review: Fixed CRITICAL security issue — all employee queries now filter `role='user'` to prevent admin manipulation via employee API. Removed redundant company-scoped username check. Added QA test file to File List.

### File List

- packages/server/src/db/schema.ts (modified - added employeeDepartments table + relations)
- packages/server/src/db/migrations/0034_employee-departments.sql (new)
- packages/server/src/services/employee-management.ts (new)
- packages/server/src/services/audit-log.ts (modified - added EMPLOYEE_* constants)
- packages/server/src/routes/admin/employees.ts (new)
- packages/server/src/index.ts (modified - added employeesRoute import + mount)
- packages/server/src/__tests__/unit/employee-management.test.ts (new)
- packages/server/src/__tests__/unit/employee-management-qa.test.ts (new - TEA QA tests)
