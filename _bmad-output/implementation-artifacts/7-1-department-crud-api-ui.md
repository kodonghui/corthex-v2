# Story 7.1: 부서 CRUD API + UI

Status: review

## Story

As a 관리자,
I want 부서를 자유롭게 생성/수정/삭제하는 것을,
so that 회사 구조에 맞는 조직을 구성할 수 있다.

## Acceptance Criteria

1. **REST API 완성**: POST/PATCH/DELETE `/api/admin/departments` — 기존 라우트(`packages/server/src/routes/admin/departments.ts`) 검증 및 AC 충족 확인
2. **부서명, 설명 필드**: 생성/수정 시 `name`(필수, 1~100자), `description`(선택)
3. **삭제 시 소속 에이전트 처리**: 삭제 시 에이전트 `departmentId = null`로 미할당 전환 (cascade, isActive=false soft delete)
4. **getDB(companyId) 격리 (E3)**: 모든 DB 접근이 tenant-scoped
5. **Admin UI**: `/departments` 페이지 — 부서 목록 + 생성 모달 + 편집 모달 + 삭제 확인 모달
6. **API 응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }` (CLAUDE.md)
7. **부서명 유니크**: 같은 회사 내 동일 이름 부서 생성 불가 (409 DEPT_002)

## Tasks / Subtasks

- [x] Task 1: 백엔드 API 검증 (AC: #1, #2, #3, #4, #6, #7)
  - [x] 1.1 기존 `routes/admin/departments.ts` — GET/POST/PATCH/DELETE 이미 구현됨
  - [x] 1.2 기존 `services/organization.ts` — getDepartments, createDepartment, updateDepartment, deleteDepartment, analyzeCascade, executeCascade 이미 구현
  - [x] 1.3 API 응답 래핑: `{ data }` → `{ success: true, data }` 형태로 7개 엔드포인트 전부 통일 완료
  - [x] 1.4 getDB scoped-query department WRITE — 기존 organization.ts가 tenant-helpers로 이미 격리 보장. 현재 패턴 유지 결정.
- [x] Task 2: Admin UI 부서 관리 페이지 (AC: #5)
  - [x] 2.1 `packages/app/src/pages/departments.tsx` 생성 — 부서 목록 (TanStack Query)
  - [x] 2.2 생성 모달: name(필수), description(선택) 입력 → POST `/api/admin/departments`
  - [x] 2.3 편집 모달: 기존 값 프리필 → PATCH `/api/admin/departments/:id`
  - [x] 2.4 삭제 확인 모달: cascade 분석 표시 → DELETE `/api/admin/departments/:id?mode=force`
  - [x] 2.5 App.tsx 라우트 추가: `/departments` → DepartmentsPage
  - [x] 2.6 사이드바 네비게이션에 "부서 관리" 메뉴 추가
- [x] Task 3: 테스트 (AC: 전체)
  - [x] 3.1 API source-level 테스트: 응답 형식, CRUD 엔드포인트, tenant 격리, 유니크 name 검증 (23 tests)
  - [x] 3.2 cascade 삭제 테스트: analyzeCascade, executeCascade, 미할당 전환 검증

## Dev Notes

### 기존 코드 현황 (매우 중요 — 중복 작성 금지)

**백엔드 API: 이미 완전 구현됨**
- `packages/server/src/routes/admin/departments.ts` — Hono 라우트 (GET list, GET tree, GET :id, GET :id/cascade-analysis, POST, PATCH, DELETE)
- `packages/server/src/services/organization.ts` — 비즈니스 로직 (getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment, analyzeCascade, executeCascade)
- 미들웨어: `authMiddleware → adminOnly → tenantMiddleware` 체인 적용됨
- Zod 밸리데이션: createDepartmentSchema, updateDepartmentSchema 적용됨
- 감사 로그: 생성/수정/삭제 모두 audit-log 연동됨

**DB 스키마 (변경 불필요)**
```
departments: id(uuid), companyId(uuid), name(varchar 100), description(text), isActive(bool), createdAt, updatedAt
```
- `packages/server/src/db/schema.ts` 라인 130~141

**scoped-query.ts**: departments READ는 있음 (`departments()`, `departmentById()`), WRITE 함수는 없음 — 현재 organization.ts가 직접 db 사용

**프론트엔드: Admin UI 없음**
- `packages/app/src/pages/org.tsx` — 읽기 전용 조직도 (workspace API 사용, admin API 아님)
- 부서 CRUD 관리 페이지 **없음** — 이것이 이 스토리의 핵심 작업

### 아키텍처 준수 사항

1. **API 응답 형식** (CLAUDE.md): `{ success: true, data }` / `{ success: false, error: { code, message } }`
   - 현재 routes/admin/departments.ts는 `{ data: ... }` 반환 → `{ success: true, data: ... }` 패턴으로 변경 필요 여부 확인
   - 다른 admin 라우트의 패턴 참고하여 일관성 유지

2. **파일명 규칙**: kebab-case (예: `departments.tsx`)

3. **컴포넌트**: PascalCase (예: `DepartmentsPage`, `CreateDepartmentModal`)

4. **프론트엔드 상태 관리**: TanStack Query로 서버 상태 관리, Zustand은 로컬 UI 상태만

5. **에러 코드**: DEPT_001(Not Found), DEPT_002(Duplicate Name), DEPT_003(Has Agents), CASCADE_001/002/003

6. **멀티테넌시**: tenant 미들웨어가 `c.get('tenant')` → `{ companyId, userId, isAdminUser }` 제공

### 프론트엔드 구현 가이드

**API 클라이언트**: `packages/app/src/lib/api.ts`의 `api.get()`, `api.post()`, `api.patch()`, `api.delete()` 사용

**TanStack Query 패턴**:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['admin-departments'],
  queryFn: () => api.get('/admin/departments'),
})
```

**뮤테이션 패턴**:
```typescript
const createMutation = useMutation({
  mutationFn: (body) => api.post('/admin/departments', body),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-departments'] }),
})
```

**모달 구현**: 기존 패턴 참고 — `useState`로 열기/닫기, 내부 form은 로컬 state

**스타일링**: Tailwind CSS. 기존 페이지(org.tsx, costs.tsx 등)의 slate-800/900 다크 테마 패턴 따름

**App.tsx 라우트 추가 위치**: 기존 패턴대로 lazy import + Suspense 래핑

**사이드바**: `packages/app/src/components/layout.tsx` 확인하여 네비게이션 메뉴 추가

### scoped-query.ts WRITE 함수 추가 여부

현재 organization.ts가 db를 직접 import하여 사용 중. 아키텍처 E3 원칙에 따르면 getDB()를 통해야 하지만, 기존 organization.ts는 이미 `withTenant()`, `scopedWhere()`, `scopedInsert()` 헬퍼를 사용하여 tenant 격리를 보장하고 있음.

**결정**: 기존 organization.ts 패턴 유지. scoped-query.ts에 department WRITE 함수를 추가하는 것은 Story 7.4 (Cascade 규칙) 또는 이후 리팩토링에서 진행. 현재는 동작하는 코드를 건드리지 않음.

### 삭제 동작 상세

기존 executeCascade() 구현:
1. cascade 분석 실행 (analyzeCascade)
2. mode 없이 활성 작업 있으면 → 409 에러 (mode 지정 필요)
3. mode=force → 활성 작업 강제 중단 + 에이전트 미할당 + 부서 soft delete
4. mode=wait_completion → 활성 작업 있으면 pending 반환
5. 활성 작업 없으면 → 즉시 에이전트 미할당 + 부서 soft delete

UI에서는:
- 삭제 버튼 클릭 → cascade-analysis API 호출 → 영향도 표시
- 에이전트 0명이면 바로 삭제 확인
- 에이전트 있으면 force/wait 선택지 제공

### Project Structure Notes

- `packages/app/src/pages/departments.tsx` — NEW: 부서 관리 페이지
- `packages/app/src/App.tsx` — MODIFY: 라우트 추가
- `packages/app/src/components/layout.tsx` — MODIFY: 사이드바 메뉴 추가
- `packages/server/src/routes/admin/departments.ts` — EXISTING: 변경 최소화 (응답 래핑만 필요 시)
- `packages/server/src/services/organization.ts` — EXISTING: 변경 없음

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 7, Story 7.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#E3 getDB(companyId)]
- [Source: packages/server/src/routes/admin/departments.ts — 기존 API 라우트]
- [Source: packages/server/src/services/organization.ts — 비즈니스 로직]
- [Source: packages/server/src/db/schema.ts#departments — DB 스키마]
- [Source: packages/server/src/db/scoped-query.ts — 멀티테넌시 래퍼]
- [Source: packages/app/src/pages/org.tsx — 읽기 전용 조직도 (참고)]
- [Source: CLAUDE.md — API 응답 형식, 파일명 규칙]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- 백엔드 API는 이미 완전 구현됨 — departments.ts 라우트에 `{ success: true }` 응답 래핑만 추가
- 핵심 작업: Admin UI 부서 관리 페이지(departments.tsx) 신규 생성 — 목록/생성/편집/삭제 모달 + cascade 분석
- App.tsx 라우트 + 사이드바 메뉴 등록 완료
- 23개 source-level 테스트 전부 통과
- `npx tsc --noEmit` 서버 + 앱 모두 타입 에러 0

### Change Log

- 2026-03-11: Story 7.1 구현 완료 — API 응답 형식 통일 + Admin UI 부서 관리 페이지 + 23 tests

### File List

- packages/server/src/routes/admin/departments.ts (MODIFIED: success: true 응답 래핑)
- packages/app/src/pages/departments.tsx (NEW: 부서 관리 페이지)
- packages/app/src/App.tsx (MODIFIED: /departments 라우트 추가)
- packages/app/src/components/sidebar.tsx (MODIFIED: 부서 관리 메뉴 추가)
- packages/server/src/__tests__/unit/story-7-1-dept-crud-api-ui.test.ts (NEW: 23 tests)
