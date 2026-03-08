# Story 9.4: Employee Management UI (Admin A4)

Status: done

## Story

As a Company Admin,
I want to view, invite, edit, and deactivate human employees through the admin console,
so that I can manage my team's access and department assignments visually.

## Acceptance Criteria

1. **AC1: 직원 목록 테이블 (서버 사이드 페이지네이션)**
   - `/admin/employees` 경로에 EmployeesPage 표시
   - 서버 사이드 페이지네이션 사용 (GET `/api/admin/employees` — page, limit=20)
   - 응답의 `pagination.total`, `pagination.totalPages` 활용한 페이지 네비게이션 UI
   - 각 행: 이름, 아이디(@username), 이메일, 부서(chips), 상태(활성/비활성 뱃지), 관리 버튼
   - 부서 배정은 다중 칩(chip)으로 표시 (employee_departments에서 가져온 데이터)
   - 빈 상태: EmptyState 컴포넌트 ("아직 등록된 직원이 없습니다" + "직원 초대" CTA)

2. **AC2: 검색 + 부서 필터**
   - 상단에 텍스트 검색 (이름/이메일, `search` 쿼리 파라미터 사용)
   - 부서 필터 버튼 그룹 (전체 + 각 부서, `departmentId` 쿼리 파라미터 사용)
   - 활성/비활성 상태 토글 필터 (`isActive` 파라미터)
   - 필터 변경 시 page=1로 리셋

3. **AC3: 직원 초대 모달**
   - "직원 초대" 버튼 클릭 → 모달 오픈
   - 필드: 아이디(username, 필수), 이름(name, 필수), 이메일(email, 필수)
   - 부서 할당: 체크박스 멀티셀렉트 → departmentIds 배열
   - POST `/api/admin/employees` 호출 → 성공 시 초기 비밀번호 표시 + 복사 버튼
   - 성공 후 목록 갱신 + 성공 토스트
   - 중복 username 시 에러 토스트 (409)

4. **AC4: 직원 편집 모달**
   - 테이블 행의 "수정" 버튼 → 편집 모달 오픈
   - 편집 가능: 이름, 이메일, 부서 할당 (멀티셀렉트)
   - PUT `/api/admin/employees/:id` 호출
   - 성공 후 목록 갱신 + 성공 토스트

5. **AC5: 비활성화/재활성화 토글**
   - 활성 직원 행: "비활성화" 버튼 → ConfirmDialog → DELETE `/api/admin/employees/:id`
   - 비활성 직원 행: "재활성화" 버튼 → POST `/api/admin/employees/:id/reactivate`
   - 상태 변경 후 목록 갱신 + 토스트

6. **AC6: 비밀번호 초기화**
   - "비밀번호 초기화" 버튼 → ConfirmDialog → POST `/api/admin/employees/:id/reset-password`
   - 성공 시 새 임시 비밀번호 모달 표시 (복사 버튼 포함)
   - 토스트 알림

7. **AC7: 라우팅 + Sidebar 연결**
   - App.tsx에 EmployeesPage lazy import + Route 추가 (`/admin/employees` 경로)
   - Sidebar에 "직원 관리" 메뉴 추가 (👤 아이콘, users 메뉴 옆)
   - 기존 `users` 경로 → `employees` 경로로 교체 (또는 병행)

## Tasks / Subtasks

- [x] Task 1: EmployeesPage 컴포넌트 생성 (AC: #1, #2)
  - [x]1.1 `packages/admin/src/pages/employees.tsx` 생성
  - [x]1.2 타입 정의: Employee (id, name, username, email, isActive, departments[], createdAt)
  - [x]1.3 서버 사이드 페이지네이션 쿼리 (useQuery + page/limit state)
  - [x]1.4 부서 목록 쿼리 (GET /admin/departments)
  - [x]1.5 검색 input + 부서 필터 버튼 + 활성 상태 필터
  - [x]1.6 테이블 렌더링 (부서 칩, 상태 뱃지, 액션 버튼)
  - [x]1.7 페이지네이션 UI (이전/다음 + 페이지 번호)
  - [x]1.8 EmptyState, SkeletonTable 처리

- [x] Task 2: 직원 초대 모달 (AC: #3)
  - [x]2.1 모달 UI: username, name, email 입력 + 부서 체크박스 멀티셀렉트
  - [x]2.2 POST 뮤테이션 + 에러 핸들링 (409 중복)
  - [x]2.3 성공 시 초기 비밀번호 표시 모달 + 클립보드 복사

- [x] Task 3: 직원 편집 모달 (AC: #4)
  - [x]3.1 편집 모달 UI: 이름, 이메일, 부서 멀티셀렉트 (현재값 프리필)
  - [x]3.2 PUT 뮤테이션 + 목록 갱신

- [x] Task 4: 비활성화/재활성화 + 비밀번호 초기화 (AC: #5, #6)
  - [x]4.1 ConfirmDialog 연동 (비활성화, 재활성화, 비밀번호 초기화)
  - [x]4.2 비밀번호 초기화 성공 시 임시 비밀번호 표시 모달

- [x] Task 5: 라우팅 + Sidebar 연결 (AC: #7)
  - [x]5.1 App.tsx에 lazy import + Route 추가
  - [x]5.2 Sidebar에 "직원 관리" 메뉴 항목 추가

## Dev Notes

### 핵심 아키텍처 결정: 기존 users.tsx vs 새 employees.tsx

**기존 `users.tsx` 문제점:**
- 클라이언트 사이드 필터링 (서버 페이지네이션 없음)
- 부서 매핑이 agents 테이블을 통한 우회 방식 (employee_departments 미사용)
- 부서 멀티셀렉트 없음
- 비밀번호를 수동 입력 (자동 생성 아님)

**새 `employees.tsx` 전략:**
- Story 9-2의 `/api/admin/employees` API 사용 (서버 사이드 페이지네이션 + 검색 + 부서 필터)
- employee_departments 매핑 테이블에서 직접 부서 정보 로딩
- 부서 멀티셀렉트 UI (체크박스 드롭다운)
- 비밀번호 자동 생성 + 1회성 표시

### API 엔드포인트 참조 (Story 9-2에서 구현됨)

| Method | Path | 설명 | 응답 |
|--------|------|------|------|
| GET | `/api/admin/employees?page=1&limit=20&search=&departmentId=&isActive=` | 목록 (페이지네이션) | `{ data: Employee[], pagination: { page, limit, total, totalPages } }` |
| GET | `/api/admin/employees/:id` | 상세 | `{ data: Employee }` |
| POST | `/api/admin/employees` | 생성 (초대) | `{ data: { employee, initialPassword, departments } }` |
| PUT | `/api/admin/employees/:id` | 수정 | `{ data: Employee }` |
| DELETE | `/api/admin/employees/:id` | 비활성화 | `{ data: Employee }` |
| POST | `/api/admin/employees/:id/reactivate` | 재활성화 | `{ data: Employee }` |
| POST | `/api/admin/employees/:id/reset-password` | 비밀번호 초기화 | `{ data: { newPassword } }` |

**Employee 응답 형태 (9-2 서비스에서):**
```typescript
{
  id: string
  username: string
  name: string
  email: string
  isActive: boolean
  createdAt: string
  departments: { id: string; name: string }[]
}
```

### 기존 코드 패턴 (반드시 따를 것)

**패턴 소스: `packages/admin/src/pages/users.tsx` (395줄)**

1. **Import 패턴:**
```typescript
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { ConfirmDialog, EmptyState, SkeletonTable } from '@corthex/ui'
```

2. **Query 패턴:**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['employees', selectedCompanyId, page, search, departmentId],
  queryFn: () => api.get<ResponseType>(`/admin/employees?companyId=${selectedCompanyId}&page=${page}&limit=20&search=${search}&departmentId=${departmentId}`),
  enabled: !!selectedCompanyId,
})
```

3. **Mutation 패턴:**
```typescript
const createMutation = useMutation({
  mutationFn: (body) => api.post('/admin/employees', body),
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['employees'] })
    addToast({ type: 'success', message: '...' })
  },
  onError: (err: Error) => addToast({ type: 'error', message: err.message }),
})
```

4. **테이블 스타일:**
- thead: `border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50`
- th: `text-left text-xs font-medium text-zinc-500 uppercase px-5 py-3`
- tr: `border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50`
- td: `px-5 py-3`

5. **뱃지 스타일:**
- 활성: `bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300`
- 비활성: `bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300`

6. **버튼 스타일:**
- Primary: `px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors`
- Ghost: `text-xs text-indigo-600 hover:text-indigo-700`
- Danger: `text-xs text-red-600 hover:text-red-700`
- Warning: `text-xs text-amber-600 hover:text-amber-700`

7. **모달 패턴 (cascade modal from departments.tsx 참조):**
```typescript
{showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
      {/* 모달 내용 */}
    </div>
  </div>
)}
```

8. **ConfirmDialog 패턴:**
```typescript
<ConfirmDialog
  isOpen={!!target}
  onConfirm={() => mutation.mutate(target.id)}
  onCancel={() => setTarget(null)}
  title="제목"
  description="설명"
  confirmText="확인"
  variant="danger" // or "default"
/>
```

9. **필터 버튼 스타일:**
- Active: `bg-indigo-600 text-white`
- Inactive: `bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800`

10. **Input 스타일:**
```
w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none
```

### users.tsx와의 관계

- 새 `employees.tsx`는 9-2 API(`/api/admin/employees`)를 사용하는 **완전히 새로운 페이지**
- 기존 `users.tsx`는 레거시 `/api/admin/users`를 사용 → **수정하지 말 것**
- Sidebar에서 기존 "직원 관리" 링크를 `/admin/employees`로 변경
- App.tsx에서 기존 UsersPage Route는 유지하되, 새 EmployeesPage Route 추가

### 서버 사이드 페이지네이션 구현

기존 users.tsx는 클라이언트 사이드 필터링. **새 employees.tsx는 서버 사이드 필수.**

```typescript
// State
const [page, setPage] = useState(1)
const [search, setSearch] = useState('')
const [departmentFilter, setDepartmentFilter] = useState('')
const [activeFilter, setActiveFilter] = useState<string>('')

// Query with server-side params
const { data } = useQuery({
  queryKey: ['employees', selectedCompanyId, page, search, departmentFilter, activeFilter],
  queryFn: () => {
    const params = new URLSearchParams()
    params.set('companyId', selectedCompanyId!)
    params.set('page', String(page))
    params.set('limit', '20')
    if (search) params.set('search', search)
    if (departmentFilter) params.set('departmentId', departmentFilter)
    if (activeFilter) params.set('isActive', activeFilter)
    return api.get<EmployeeListResponse>(`/admin/employees?${params}`)
  },
  enabled: !!selectedCompanyId,
})

// Pagination UI
const pagination = data?.pagination
// 이전/다음 버튼 + "Page X of Y" 표시
```

### 부서 멀티셀렉트 UI (체크박스 방식)

```typescript
// 부서 목록 로드
const { data: deptData } = useQuery({
  queryKey: ['departments', selectedCompanyId],
  queryFn: () => api.get<{ data: Department[] }>(`/admin/departments?companyId=${selectedCompanyId}`),
  enabled: !!selectedCompanyId,
})

// 체크박스 멀티셀렉트
const [selectedDepts, setSelectedDepts] = useState<string[]>([])
const toggleDept = (deptId: string) => {
  setSelectedDepts(prev =>
    prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]
  )
}
```

### 비밀번호 표시 모달

초대 성공 후 + 비밀번호 초기화 성공 후 1회성 비밀번호 표시.

```typescript
const [passwordModal, setPasswordModal] = useState<{ name: string; password: string } | null>(null)

// 클립보드 복사
const copyPassword = () => {
  navigator.clipboard.writeText(passwordModal!.password)
  addToast({ type: 'success', message: '비밀번호가 복사되었습니다' })
}
```

### App.tsx 수정 사항

```typescript
// 추가할 lazy import
const EmployeesPage = lazy(() => import('./pages/employees').then((m) => ({ default: m.EmployeesPage })))

// 추가할 Route (users Route 아래)
<Route path="employees" element={<Suspense fallback={<PageSkeleton />}><EmployeesPage /></Suspense>} />
```

### Sidebar 수정 사항

Sidebar.tsx에서 "직원 관리" 메뉴 항목의 경로를 `/admin/employees`로 변경하거나 새 항목 추가.

### Project Structure Notes

- 새 페이지: `packages/admin/src/pages/employees.tsx`
- 수정: `packages/admin/src/App.tsx` (lazy import + Route)
- 수정: `packages/admin/src/components/Sidebar.tsx` (메뉴 항목 추가/변경)
- **수정하지 않을 파일:** `packages/admin/src/pages/users.tsx`, 서버 측 파일 (9-2에서 완료)

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Core-User-Flow-5] 직원 초대 및 권한 관리 UX 플로우
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#11.6.1] DataTable 사용 패턴 (직원 관리: 20행 페이지네이션)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#12.2] 필터 패턴 (직원 관리: 역할 필터 + 이름/이메일 검색)
- [Source: _bmad-output/planning-artifacts/epics.md#E9-S4] 직원 관리 UI (Admin A4), 2 SP, FR44, UX A4
- [Source: _bmad-output/implementation-artifacts/9-2-human-employee-management-api.md] Employee API 7 엔드포인트
- [Source: packages/server/src/routes/admin/employees.ts] 서버 라우트 구현
- [Source: packages/admin/src/pages/users.tsx] 기존 직원 페이지 패턴 참조
- [Source: packages/admin/src/pages/departments.tsx] 모달 패턴 참조 (cascade modal)
- [Source: packages/admin/src/lib/api.ts] API wrapper 패턴
- [Source: packages/admin/src/stores/] Zustand 상태관리 패턴

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- All 5 tasks completed: EmployeesPage component with server-side pagination, search, department filter, active status filter
- Invite modal with auto-generated password display + clipboard copy
- Edit modal with department multi-select (checkbox)
- Deactivate/reactivate toggle with ConfirmDialog
- Password reset with one-time password display modal
- App.tsx: lazy import + Route for /employees
- Sidebar: "직원 관리" link changed from /users to /employees
- 39 unit tests covering query params, department toggle, pagination, form validation, edit pre-fill
- Build verified: admin bundle compiles successfully (employees-607SpJCR.js, 19.89 kB)

### File List

- packages/admin/src/pages/employees.tsx (NEW) -- Employee management page
- packages/admin/src/App.tsx (MODIFIED) -- Added EmployeesPage lazy import + route
- packages/admin/src/components/sidebar.tsx (MODIFIED) -- Changed /users to /employees
- packages/admin/src/__tests__/employees.test.ts (NEW) -- 39 unit tests
- packages/admin/src/__tests__/employees-tea.test.ts (NEW) -- 52 TEA tests
- packages/admin/src/__tests__/employees-qa.test.ts (NEW) -- 35 QA tests
