# 21. Users (사용자 관리) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **User Management** page in the Admin app. Administrators use this page to manage system-level user accounts — the people who log into the admin panel or the CEO app. Users have login credentials (username/password), a role (admin or regular user), and an active/inactive status. This is distinct from the Employees page which manages workspace-level human employees.

### Data Displayed — In Detail

**Page header:**
- Title: "직원 관리"
- Subtitle: total user count, e.g. "8명의 직원"
- "직원 추가" button to create new users

**Department filter (horizontal button group):**
- "전체" button to show all users
- One button per department (dynamically populated from department list)
- Active filter button is visually highlighted
- Filtering works by looking up user-department associations through the agent mapping

**Create user form (inline, toggled by add button):**
- Username (아이디, required)
- Password (비밀번호, required, password field)
- Name (이름, required)
- Email (이메일, optional)
- Role selector (역할): 일반 직원 (user) or 관리자 (admin)
- Submit and Cancel buttons
- Error message display on failure

**User list table:**
- **Name** (이름): Editable inline when in edit mode
- **Username** (아이디): Displayed as @username, read-only
- **Email** (이메일): Editable inline when in edit mode, shows "-" if empty
- **Role** (역할): Displayed as a badge — "관리자" (admin) or "직원" (user), visually distinguishable from each other. Editable as dropdown in edit mode.
- **Status** (상태): Badge showing "활성" (active) or "비활성" (inactive), visually distinct states
- **Actions** (관리): Three action buttons per row:
  - 수정 (Edit): Switches the row to inline editing mode with Save/Cancel
  - 비밀번호 초기화 (Reset Password): Opens confirmation dialog
  - 비활성화 (Deactivate): Opens confirmation dialog. Only shown for active users.

**Inline edit mode (per row):**
- Name, Email, and Role fields become editable inputs/selects directly in the table row
- Save and Cancel text buttons replace the normal action buttons
- Changes are saved individually per user

**Confirmation dialogs:**
1. **Deactivate user**: Title shows user name, warns that the user will no longer be able to log in, with option to reactivate later. "비활성화" confirm button (danger variant).
2. **Reset password**: Title shows user name, warns that password will be reset to default value. "초기화" confirm button.

### User Actions

1. **View all users** in a sortable, filterable table
2. **Filter users by department** using the department button group
3. **Create a new user** with username, password, name, email, and role
4. **Edit user info inline** — click Edit to switch a row to edit mode, modify fields, and save
5. **Reset a user's password** with confirmation — the admin must then communicate the new password to the user
6. **Deactivate a user** with confirmation — soft delete, can be reactivated later

### UX Considerations

- **Inline editing is fast**: Users can edit a row without navigating away or opening a modal. Only one row should be editable at a time.
- **Role distinction matters**: Admin users have full access to the admin panel. The role badge makes this immediately clear.
- **Password reset is sensitive**: The confirmation dialog should clearly explain the consequences. After reset, the new temporary password must be displayed in a modal so the admin can copy it. This password is shown only once and cannot be retrieved later.
- **Deactivation is reversible**: The dialog should reassure the admin that this is not a permanent delete. The user can be reactivated later.
- **Department filter works indirectly**: Users are associated with departments through the agents table, not directly. Some users may not be assigned to any department and would only show under "전체".
- **Company selection prerequisite**: Requires a selected company. Show "회사를 선택하세요" if none selected.
- **Loading state**: Show a loading indicator while data loads.
- **Empty state**: Different messages for no users at all vs. no users in the filtered department.
- **Korean language**: All UI text in Korean.
- **Mobile**: Table should be horizontally scrollable or switch to a card layout on small screens.

### What NOT to Include on This Page

- No workspace/employee management — that's the Employees page
- No user activity logs or audit trail
- No bulk user import/export
- No two-factor authentication management
- No login session management
- No user profile photos or avatars
