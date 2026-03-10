# 22. Employees (직원 관리) — Design Specification

## 1. Page Overview

- **Purpose**: Admin page for managing workspace-level employees who access the CEO app. Supports invite (auto-generated password), edit, deactivate/reactivate, password reset, multi-department assignment, paginated listing with search and filters. Distinct from Users page (admin-level accounts).
- **Key User Goals**: (1) Browse/search employees with filters, (2) Invite new employees with department assignments, (3) Edit employee info and department memberships, (4) Reset passwords and copy temporary passwords, (5) Deactivate/reactivate employees.
- **Data Dependencies**:
  - `GET /admin/employees?companyId={id}&page={p}&limit=20&search={s}&departmentId={d}&isActive={a}` → `{ data: Employee[], pagination: { page, limit, total, totalPages } }`
  - `GET /admin/departments?companyId={id}` → `{ data: Department[] }`
  - `POST /admin/employees?companyId={id}` → `{ data: { employee, initialPassword, departments } }`
  - `PUT /admin/employees/{id}?companyId={id}` → update
  - `DELETE /admin/employees/{id}?companyId={id}` → deactivate
  - `POST /admin/employees/{id}/reactivate?companyId={id}` → reactivate
  - `POST /admin/employees/{id}/reset-password?companyId={id}` → `{ data: { newPassword } }`
- **Current State**: `packages/admin/src/pages/employees.tsx` (676 lines). Complex page with modals, pagination, search debounce. Uses indigo/zinc. Needs slate dark-mode redesign.

## 2. Page Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Page Header                                                  │
│ "직원 관리"  ·  "45명의 직원"              [+ 직원 초대]      │
├─────────────────────────────────────────────────────────────┤
│ Search & Filters                                             │
│ [🔍 이름 또는 이메일로 검색...]                               │
│ [전체] [활성] [비활성]                                       │
│ [전체 부서] [경영지원] [마케팅] [개발] [재무] ...             │
├─────────────────────────────────────────────────────────────┤
│ Employee Table                                               │
│ ┌──────┬───────┬──────────┬──────────┬──────┬────────────┐  │
│ │ 이름 │아이디 │ 이메일   │ 부서     │ 상태 │ 관리       │  │
│ ├──────┼───────┼──────────┼──────────┼──────┼────────────┤  │
│ │ 김대표│@kim   │kim@co.kr │경영 마케팅│ 활성 │수정 초기 비│  │
│ │ 이직원│@lee   │lee@co.kr │개발      │ 비활성│수정 초기 재│  │
│ └──────┴───────┴──────────┴──────────┴──────┴────────────┘  │
├─────────────────────────────────────────────────────────────┤
│ Pagination                                                   │
│ "45명 중 1-20명"          [← 이전] [1] [2] [3] [다음 →]     │
└─────────────────────────────────────────────────────────────┘

[Modal: Invite Employee]    [Modal: Edit Employee]
[Modal: Temporary Password] [ConfirmDialog × 3]
```

- **Container**: `max-w-6xl mx-auto px-6 py-6 space-y-6`
- **Responsive**:
  - Desktop (>1024px): Full table, modals max-w-lg
  - Tablet: Table horizontal scroll
  - Mobile: Card layout, modals full-width

## 3. Component Breakdown

### 3.1 PageHeader

- **Container**: `flex items-center justify-between`
- **Left**:
  - `<h1 className="text-2xl font-bold tracking-tight text-white">직원 관리</h1>`
  - `<p className="text-sm text-slate-400 mt-1">{pagination.total}명의 직원</p>`
- **Right**:
  - `<button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">`
  - `<span>+</span> 직원 초대`

### 3.2 SearchAndFilters

- **Container**: `space-y-3`
- **Search input**:
  ```
  <div className="relative">
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
    <input
      className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500"
      placeholder="이름 또는 이메일로 검색..."
    />
  </div>
  ```
- **Active status filter**: `<div className="flex items-center gap-2">`
  - Inactive tab: `px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer`
  - Active tab: `px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-600 cursor-pointer`
  - Tabs: "전체" (value=''), "활성" (value='true'), "비활성" (value='false')
- **Department filter**: `<div className="flex items-center gap-2 flex-wrap">`
  - Same tab styling as active filter
  - "전체 부서" (value='') + one per department

### 3.3 EmployeeTable

- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden`
- **Table header**: Same pattern as Users page (text-xs uppercase tracking-wider text-slate-400)
- **Columns**: 이름, 아이디, 이메일, 부서, 상태, 관리
- **Table row**:
  ```
  <tr className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
    <td className="px-4 py-3 text-sm font-medium text-white">{emp.name}</td>
    <td className="px-4 py-3 text-sm text-slate-400 font-mono">@{emp.username}</td>
    <td className="px-4 py-3 text-sm text-slate-400">{emp.email || '—'}</td>
    <td className="px-4 py-3">
      <div className="flex flex-wrap gap-1">
        {emp.departments.length > 0
          ? emp.departments.map(d =>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">{d.name}</span>
            )
          : <span className="text-xs text-slate-500">미배정</span>
        }
      </div>
    </td>
    <td className="px-4 py-3">
      {emp.isActive
        ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">활성</span>
        : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">비활성</span>
      }
    </td>
    <td className="px-4 py-3 text-right">
      <div className="flex items-center justify-end gap-2">
        <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors">수정</button>
        <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors">비밀번호 초기화</button>
        {emp.isActive
          ? <button className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors">비활성화</button>
          : <button className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-500/10 transition-colors">재활성화</button>
        }
      </div>
    </td>
  </tr>
  ```

### 3.4 Pagination

- **Container**: `flex items-center justify-between px-4 py-3 border-t border-slate-700`
- **Left**: `<span className="text-sm text-slate-400">{total}명 중 {start}-{end}명</span>`
- **Right**: `<div className="flex items-center gap-1">`
  - Prev button: `px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors`
  - Page number (inactive): `w-8 h-8 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors`
  - Page number (active): `w-8 h-8 rounded-lg text-sm text-white bg-blue-600 flex items-center justify-center`
  - Ellipsis: `<span className="text-slate-500 px-1">…</span>`
  - Next button: Same as prev

### 3.5 InviteEmployeeModal

- **Overlay**: `fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4`
- **Content**: `bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg`
- **Header**: `<div className="px-6 py-4 border-b border-slate-700"><h2 className="text-lg font-semibold text-white">직원 초대</h2></div>`
- **Body**: `<div className="px-6 py-5 space-y-4">`
  - Fields: username, name, email (same input styling as Users page)
  - **Department multi-select**:
    ```
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">부서 배정</label>
      <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-900/50 border border-slate-600 rounded-lg p-2">
        {departments.map(d => (
          <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 cursor-pointer transition-colors">
            <input type="checkbox" className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500" />
            <span className="text-sm text-slate-300">{d.name}</span>
          </label>
        ))}
        {departments.length === 0 && <p className="text-xs text-slate-500 text-center py-2">등록된 부서가 없습니다</p>}
      </div>
    </div>
    ```
- **Footer**: `<div className="px-6 py-4 border-t border-slate-700 flex items-center justify-end gap-3">`
  - Cancel: `bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg px-4 py-2 text-sm font-medium`
  - Submit: `bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50`
  - Pending text: `초대 중...`

### 3.6 EditEmployeeModal

- Same structure as InviteModal
- **Header**: `직원 수정 — {employee.name}`
- **Fields**: username (disabled, `bg-slate-900 text-slate-500 cursor-not-allowed`), name, email, department multi-select

### 3.7 TemporaryPasswordModal

- **Overlay**: Same as other modals
- **Content**: `bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md`
- **Header**: `<h2 className="text-lg font-semibold text-white">임시 비밀번호</h2>`
- **Body**:
  ```
  <div className="px-6 py-5 space-y-4">
    <p className="text-sm text-slate-300">{name}님의 임시 비밀번호입니다.</p>
    <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 flex items-center justify-between">
      <code className="text-lg font-mono text-cyan-400 tracking-wider select-all">{password}</code>
      <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700" onClick={copyToClipboard}>
        복사
      </button>
    </div>
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
      <p className="text-xs text-amber-400">⚠ 이 비밀번호는 다시 확인할 수 없으니 반드시 복사해두세요.</p>
    </div>
  </div>
  ```
- **Footer**: `<div className="px-6 py-4 border-t border-slate-700 flex justify-end"><button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium">확인</button></div>`

### 3.8 ConfirmDialogs (×3)

All use `@corthex/ui` ConfirmDialog with slate-800 modal styling.

1. **Deactivate**: `variant="danger"`, title=`{name} 비활성화`, description="이 직원은 더 이상 로그인할 수 없습니다. 나중에 다시 활성화할 수 있습니다.", confirmText="비활성화"
2. **Reactivate**: `variant="default"`, title=`{name} 재활성화`, description="이 직원이 다시 로그인할 수 있습니다.", confirmText="재활성화"
3. **Reset Password**: `variant="default"`, title=`{name} 비밀번호 초기화`, description="새 임시 비밀번호가 생성됩니다.", confirmText="초기화"

## 4. States

### 4.1 Loading
- Header with title only, subtitle skeleton
- SkeletonTable: `<SkeletonTable rows={5} />` from @corthex/ui

### 4.2 Empty State (no employees)
- `<EmptyState title="아직 등록된 직원이 없습니다" description="직원 초대 버튼을 눌러 첫 번째 직원을 등록하세요." action={inviteButton} />`

### 4.3 Empty State (filtered)
- `<EmptyState title="조건에 맞는 직원이 없습니다" description="검색어나 필터를 변경해보세요." />`

### 4.4 No Company Selected
- Same as Users page

## 5. Interactions & Animations

- **Search debounce**: 300ms delay, resets page to 1
- **Filter change**: Resets page to 1, triggers refetch
- **Modal open/close**: `transition-opacity duration-200` on overlay, `transition-transform duration-200 scale-95 → scale-100` on content
- **Copy password**: Changes button text to "복사됨!" for 2s with `text-emerald-400`
- **Toast notifications**: Success on create/update/deactivate/reactivate/reset

## 6. Responsive Behavior

- **Desktop**: Full table, side-by-side filters
- **Tablet**: Table scrolls, modals stay centered max-w-lg
- **Mobile (<768px)**:
  - Search: Full width
  - Filters: Wrap on multiple lines
  - Table → Card layout (stacked per employee)
  - Pagination: Simplified (prev/next only, no page numbers)
  - Modals: `max-w-full mx-4`, full-width on very small screens

## 7. Data Flow Summary

```
selectedCompanyId (Zustand)
  ↓
  ├─ useQuery(['employees', companyId, page, search, departmentFilter, activeFilter]) → { data, pagination }
  └─ useQuery(['departments', companyId]) → departments[]
       ↓
       ├─ search (debounced 300ms) → setDebouncedSearch → reset page
       ├─ departmentFilter → reset page
       ├─ activeFilter → reset page
       ├─ inviteMutation → POST → show password modal → invalidate
       ├─ updateMutation → PUT → close modal → invalidate
       ├─ deactivateMutation → DELETE → invalidate
       ├─ reactivateMutation → POST /reactivate → invalidate
       └─ resetPasswordMutation → POST /reset-password → show password modal
```
