# 21. Users (사용자 관리) — Design Specification

## 1. Page Overview

- **Purpose**: Admin page for managing system-level user accounts (admin panel + CEO app logins). CRUD operations: create users with username/password, edit name/email/role inline, reset passwords, soft-deactivate. Distinct from Employees page (workspace-level).
- **Key User Goals**: (1) View all users filtered by department, (2) Create new user accounts, (3) Edit user details inline, (4) Reset passwords, (5) Deactivate users.
- **Data Dependencies**:
  - `GET /admin/users?companyId={id}` → `{ data: User[] }` where `User = { id, companyId, name, username, email, role, isActive, createdAt }`
  - `GET /admin/departments?companyId={id}` → `{ data: Department[] }`
  - `GET /admin/agents?companyId={id}` → `{ data: Agent[] }` (for user→department mapping via agents)
  - `POST /admin/users` → create user
  - `PATCH /admin/users/{id}` → update user
  - `DELETE /admin/users/{id}` → soft deactivate
  - `POST /admin/users/{id}/reset-password` → reset password
- **Current State**: `packages/admin/src/pages/users.tsx` (394 lines). Uses indigo/zinc colors, basic inline editing, ConfirmDialog from @corthex/ui. Needs slate dark-mode redesign.

## 2. Page Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Page Header                                              │
│ "직원 관리"  ·  "8명의 직원"            [+ 직원 추가]     │
├─────────────────────────────────────────────────────────┤
│ Department Filter Tabs                                   │
│ [전체] [경영지원] [마케팅] [개발] [재무] ...              │
├─────────────────────────────────────────────────────────┤
│ Create User Form (conditional, inline collapse)          │
│ ┌───────────────────────────────────────────────────┐   │
│ │ [아이디] [비밀번호] [이름] [이메일] [역할▼]        │   │
│ │                                   [취소] [생성]    │   │
│ └───────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│ User List Table                                          │
│ ┌──────┬─────────┬──────────┬──────┬──────┬──────────┐  │
│ │ 이름 │ 아이디  │ 이메일   │ 역할 │ 상태 │ 관리     │  │
│ ├──────┼─────────┼──────────┼──────┼──────┼──────────┤  │
│ │ 김대표│@kim-ceo │kim@co.kr │관리자│ 활성 │수정 초기…│  │
│ │ [편집]│@lee     │[편집]    │[▼]  │ 활성 │저장 취소 │  │
│ └──────┴─────────┴──────────┴──────┴──────┴──────────┘  │
└─────────────────────────────────────────────────────────┘
```

- **Container**: `max-w-5xl mx-auto px-6 py-6 space-y-6`
- **Responsive**:
  - Desktop (>1024px): Full table layout
  - Tablet (768-1024px): Table with horizontal scroll
  - Mobile (<768px): Card-based layout per user

## 3. Component Breakdown

### 3.1 PageHeader

- **Container**: `flex items-center justify-between`
- **Left**:
  - `<h1 className="text-2xl font-bold tracking-tight text-white">직원 관리</h1>`
  - `<p className="text-sm text-slate-400 mt-1">{users.length}명의 직원</p>`
- **Right**:
  - `<button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2" onClick={() => setShowCreate(!showCreate)}>`
  - Icon: `<svg>+</svg>` or `<span>+</span>`
  - Text: `직원 추가`

### 3.2 DepartmentFilterTabs

- **Container**: `flex items-center gap-2 overflow-x-auto pb-1`
- **Tab (inactive)**: `px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap`
- **Tab (active)**: `px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-600 cursor-pointer whitespace-nowrap`
- **Tabs**: "전체" (default, value='all') + one per department from API

### 3.3 CreateUserForm (conditional)

- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4`
- **Title**: `<h3 className="text-lg font-semibold text-white">새 직원 추가</h3>`
- **Form grid**: `grid grid-cols-1 md:grid-cols-2 gap-4`
- **Each field**:
  ```
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
    <input
      className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors"
      type="{text|password|email}"
      placeholder="{placeholder}"
      required={required}
    />
  </div>
  ```
- **Role select**:
  ```
  <select className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white">
    <option value="user">일반 직원</option>
    <option value="admin">관리자</option>
  </select>
  ```
- **Error message**: `<p className="text-sm text-red-400">{error}</p>`
- **Actions**: `<div className="flex items-center justify-end gap-3 pt-2">`
  - Cancel: `bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg px-4 py-2 text-sm font-medium`
  - Submit: `bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50`

### 3.4 UserListTable

- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden`
- **Table header**:
  ```
  <tr className="border-b border-slate-700">
    <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">이름</th>
    <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">아이디</th>
    <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">이메일</th>
    <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">역할</th>
    <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">상태</th>
    <th className="text-right text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">관리</th>
  </tr>
  ```
- **Table row (display mode)**:
  ```
  <tr className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
    <td className="px-4 py-3 text-sm font-medium text-white">{user.name}</td>
    <td className="px-4 py-3 text-sm text-slate-400 font-mono">@{user.username}</td>
    <td className="px-4 py-3 text-sm text-slate-400">{user.email || '—'}</td>
    <td className="px-4 py-3">
      <!-- Role badge -->
      {user.role === 'admin'
        ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">관리자</span>
        : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-600/50 text-slate-300">직원</span>
      }
    </td>
    <td className="px-4 py-3">
      {user.isActive
        ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">활성</span>
        : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">비활성</span>
      }
    </td>
    <td className="px-4 py-3 text-right">
      <div className="flex items-center justify-end gap-2">
        <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors">수정</button>
        <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors">비밀번호 초기화</button>
        {user.isActive && <button className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors">비활성화</button>}
      </div>
    </td>
  </tr>
  ```
- **Table row (edit mode)**:
  - Name cell: `<input className="bg-slate-700 border border-slate-600 focus:border-blue-500 rounded px-2 py-1 text-sm text-white w-full" value={editForm.name} />`
  - Username cell: Same display (read-only)
  - Email cell: Same input style as name
  - Role cell: `<select className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white">`
  - Actions: `<button className="text-xs text-blue-400 hover:text-blue-300">저장</button>` + `<button className="text-xs text-slate-400 hover:text-white">취소</button>`

### 3.5 ConfirmDialog (Deactivate)

- Uses `@corthex/ui` ConfirmDialog component
- Props:
  - `title`: `{user.name} 비활성화`
  - `description`: `이 직원은 더 이상 로그인할 수 없습니다. 나중에 다시 활성화할 수 있습니다.`
  - `confirmText`: `비활성화`
  - `variant`: `danger`
- **Styling** (within ConfirmDialog): Modal overlay `bg-black/60 backdrop-blur-sm`, content `bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl`
- Danger button: `bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 text-sm font-medium`

### 3.6 ConfirmDialog (Reset Password)

- Props:
  - `title`: `{user.name} 비밀번호 초기화`
  - `description`: `비밀번호가 초기값으로 재설정됩니다. 새 비밀번호를 직원에게 전달해주세요.`
  - `confirmText`: `초기화`
  - `variant`: `default`
- Default button: `bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium`

## 4. States

### 4.1 Loading State
- Header visible, subtitle shows skeleton: `<div className="bg-slate-700 animate-pulse rounded h-4 w-24" />`
- SkeletonTable: 5 rows via `@corthex/ui` `<SkeletonTable rows={5} />`

### 4.2 Empty State (no users)
- Uses `@corthex/ui` `<EmptyState />`
- `title`: `직원이 없습니다`
- `description`: `직원 추가 버튼을 눌러 새 직원을 등록하세요.`
- `action`: Optional add button

### 4.3 Empty State (filtered, no results)
- `title`: `해당 부서에 직원이 없습니다`
- `description`: `다른 부서를 선택하거나 전체를 확인하세요.`

### 4.4 No Company Selected
- `<div className="flex items-center justify-center h-64"><p className="text-sm text-slate-400">회사를 선택하세요</p></div>`

## 5. Interactions & Animations

- **Create form expand**: `transition-all duration-200` with height animation (or conditional render)
- **Inline edit switch**: Instant swap, no animation
- **Row hover**: `hover:bg-slate-800/50 transition-colors`
- **Toast on success**: `addToast({ type: 'success', message: '직원이 생성되었습니다' })` / `'직원 정보가 수정되었습니다'` / `'직원이 비활성화되었습니다'` / `'비밀번호가 초기화되었습니다'`

## 6. Responsive Behavior

- **Desktop (>1024px)**: Full table, inline editing
- **Tablet (768-1024px)**: Table scrolls horizontally within card container
- **Mobile (<768px)**:
  - Create form: stacks fields vertically (`grid-cols-1`)
  - User list: Each user as a card instead of table row
    ```
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-white">{user.name}</span>
        <span className="role-badge">...</span>
      </div>
      <div className="text-xs text-slate-400 font-mono">@{user.username}</div>
      <div className="text-xs text-slate-400">{user.email}</div>
      <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
        action buttons...
      </div>
    </div>
    ```

## 7. Data Flow Summary

```
selectedCompanyId (Zustand)
  ↓
  ├─ useQuery(['users', companyId]) → users[]
  ├─ useQuery(['departments', companyId]) → departments[]
  └─ useQuery(['agents', companyId]) → agents[]
       ↓
       userDeptMap = Map<userId, departmentId> (via agents)
       ↓
       filteredUsers = deptFilter === 'all' ? users : users.filter(...)
       ↓
       ├─ createMutation → POST /admin/users → invalidate ['users']
       ├─ updateMutation → PATCH /admin/users/{id} → invalidate ['users']
       ├─ deactivateMutation → DELETE /admin/users/{id} → invalidate ['users']
       └─ resetPasswordMutation → POST /admin/users/{id}/reset-password
```
