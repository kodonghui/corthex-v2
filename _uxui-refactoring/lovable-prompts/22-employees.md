# 22. Employees (직원 관리) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Employee Management** page in the Admin app. Administrators use this page to invite, manage, and organize human employees who have workspace access to the CEO app. Unlike the Users page (which manages admin-level accounts), this page handles workspace employees — people who can use limited features within their assigned departments. Employees are invited with auto-generated passwords, can be assigned to multiple departments, and can be deactivated/reactivated.

### Data Displayed — In Detail

**Page header:**
- Title: "직원 관리"
- Subtitle: total employee count from pagination, e.g. "45명의 직원"
- "직원 초대" button to invite new employees

**Search and filter controls:**
- **Text search**: Input field with debounced search (300ms delay), placeholder "이름 또는 이메일로 검색..."
- **Active status filter** (horizontal button group):
  - 전체 (all)
  - 활성 (active only)
  - 비활성 (inactive only)
- **Department filter** (horizontal button group, wraps on multiple lines):
  - 전체 부서 (all departments)
  - One button per department (dynamically populated)
  - Active filter is visually highlighted

**Employee table:**
- **Name** (이름): Employee's display name
- **Username** (아이디): Displayed as @username
- **Email** (이메일): Employee's email, or "-" if empty
- **Departments** (부서): List of assigned department names shown as distinct labels. Shows "미배정" if no departments assigned.
- **Status** (상태): Badge showing "활성" (active) or "비활성" (inactive), visually distinct states
- **Actions** (관리): Three action buttons per row:
  - 수정 (Edit): Opens edit modal
  - 비밀번호 초기화 (Reset Password): Opens confirmation, then shows temporary password
  - 비활성화/재활성화: Toggle between deactivate (for active) and reactivate (for inactive)

**Pagination controls (below table):**
- Shows range: "45명 중 1-20명"
- Page number buttons with ellipsis for large page counts
- Previous/Next buttons
- Current page highlighted
- Only appears when total pages > 1

**Invite Employee modal:**
- Username (아이디, required)
- Name (이름, required)
- Email (이메일, required)
- Department assignment (부서 배정): Scrollable checkbox list of all departments, multi-select. Shows "등록된 부서가 없습니다" if no departments exist.
- Submit and Cancel buttons
- On success: closes modal, shows temporary password modal

**Edit Employee modal:**
- Username shown as read-only disabled field
- Name (editable)
- Email (editable)
- Department assignment: Same checkbox list as invite, reflecting current assignments
- Save and Cancel buttons

**Temporary Password modal:**
- Title: "임시 비밀번호"
- Shows the employee name and explains this password cannot be viewed again
- Password displayed in a clearly readable, character-distinguishable format with select-all behavior
- Copy button to copy password to clipboard
- Confirm button to dismiss
- Appears after both invite (new employee) and password reset operations

**Confirmation dialogs:**
1. **Deactivate**: Warns that the employee can no longer log in, can be reactivated later. "비활성화" button, styled to convey this is a destructive action.
2. **Reactivate**: Confirms reactivation, employee will be able to log in again. "재활성화" button.
3. **Reset Password**: Warns that a new temporary password will be generated and must be communicated to the employee. "초기화" button.

### User Actions

1. **Browse employees** in a paginated, searchable, filterable table
2. **Search by name or email** with real-time debounced filtering
3. **Filter by active status** (all / active / inactive)
4. **Filter by department** to see employees in a specific department
5. **Invite a new employee** with username, name, email, and department assignments
6. **Receive and copy temporary password** after inviting or resetting password
7. **Edit employee info** — name, email, and department assignments via modal
8. **Reset password** with confirmation — generates new temporary password and displays it
9. **Deactivate an employee** with confirmation
10. **Reactivate an inactive employee** with confirmation
11. **Navigate between pages** of the employee list

### UX Considerations

- **Password handling is critical**: Temporary passwords are shown only once and cannot be retrieved later. The modal must make this very clear, and the copy button must work reliably. This is one of the most important UX moments on this page.
- **Multi-department assignment**: Employees can belong to multiple departments. The checkbox list in invite/edit modals must clearly show which departments are currently selected.
- **Search is debounced**: The search input doesn't fire API calls on every keystroke — it waits 300ms after the user stops typing. This prevents excessive API calls.
- **Pagination resets on filter change**: When the user changes any filter (search, status, department), the page resets to 1.
- **Deactivate vs Reactivate**: The same action button position shows different actions depending on the employee's current status. Active employees show deactivate; inactive show reactivate.
- **Company selection prerequisite**: Requires a selected company. Show "회사를 선택하세요" if none selected.
- **Loading state**: Show skeleton table while data loads.
- **Empty states**:
  - No employees at all: "아직 등록된 직원이 없습니다" with invite button
  - No employees matching filters: "선택한 부서에 배정된 직원이 없습니다"
- **Korean language**: All UI text in Korean.
- **Mobile**: Table should be responsive. Modals should be full-width on small screens.

### What NOT to Include on This Page

- No employee performance metrics or activity logs
- No chat or messaging with employees
- No file/document permissions management
- No employee roles or permission levels (all employees have the same workspace access)
- No org chart or reporting hierarchy for employees
- No bulk import/export of employees
