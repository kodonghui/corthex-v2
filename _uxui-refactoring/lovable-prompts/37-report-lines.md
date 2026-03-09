# 37. Report Lines (보고 라인) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Report Lines** page in the Admin app. Administrators define the **reporting hierarchy** between employees (users) in a company. Each employee can report to one other employee (their supervisor), or be a top-level employee with no supervisor. This hierarchy is used for report delivery chains and the Chief-of-Staff orchestration engine's routing decisions.

The page presents a simple table where the admin can set each employee's supervisor via dropdown selectors, then save all changes at once with a single "변경사항 저장" button.

### Data Displayed — In Detail

**Page header:**
- Title: "보고 라인"
- Subtitle: "직원 간 보고 구조를 설정합니다 (H → 상위자)"
- **"변경사항 저장" button**: Disabled until changes are made. Shows "저장 중..." while saving.

**Success banner:**
- After successful save, a green banner appears: "저장 완료" — visible until the next edit is made.

**Report lines table (single table with all employees):**

Table columns:
- **직원 (Employee)**: Name and username (e.g. "김대표" with "@ceo" below)
- **역할 (Role)**: Role badge (e.g. "admin" with a distinct visual treatment, or "employee" as default)
- **보고 대상 (Reports To)**: Dropdown selector showing all other employees. Options: "없음 (최상위)" for no supervisor, or each other employee as "Name (@username)". Self-assignment is excluded from the dropdown.
- **유형 (Type)**: Shows the resolved supervisor name with an arrow "→ {name}", or a "최상위" badge if the employee has no supervisor.

**Loading state:**
- Skeleton placeholders for each row while data loads

**Empty state:**
- "직원을 먼저 등록하세요" — when the company has no employees/users yet

**Info box at the bottom:**
- Two explanatory notes:
  - "보고 라인은 보고서 전달 경로와 비서 오케스트레이션에 사용됩니다."
  - "'없음 (최상위)'으로 설정된 직원은 보고 체계의 최상위에 위치합니다."

### User Actions

1. **Select a supervisor** for each employee using the dropdown — can choose any other employee or "없음 (최상위)"
2. **Save all changes** at once with the save button — only enabled when changes have been made
3. **View the current hierarchy** at a glance via the type column showing resolved supervisor names

### UX Considerations

- **Company selection prerequisite**: A company must be selected. Without it, show "회사를 선택하세요."
- **Batch save pattern**: Unlike most CRUD pages, this page uses a batch save approach — the admin makes multiple changes to the reporting structure and saves them all at once. The "변경사항 저장" button is disabled until something changes, preventing unnecessary saves.
- **Circular reference prevention**: The backend validates against circular references (A→B→C→A) and self-assignment. If the admin creates an invalid structure, the save will fail with an error message.
- **Visual confirmation**: The "유형" column immediately reflects changes in the dropdown — when the admin selects a new supervisor, the resolved name updates in real-time in the type column.
- **Simple mental model**: Each employee has exactly one line: who do they report to? The dropdown makes this a trivial selection.
- **Skeleton loading**: Shows placeholders that match the table layout while data loads, giving the admin a preview of the page structure.
- **Unsaved changes awareness**: The save button being enabled/disabled clearly communicates whether there are pending changes.
- **Error feedback**: If saving fails (e.g. circular reference detected), show an error toast with the backend's message.
- **Korean language**: All text in Korean.

### What NOT to Include on This Page

- No org chart visualization — that's on the org-chart page
- No employee creation/editing — that's on the employees or users page
- No department assignment — departments are managed separately
- No agent reporting lines — this is for human employees only
- No drag-and-drop reordering
- No multi-level hierarchy visualization (tree view)
- No history of reporting line changes
