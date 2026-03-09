# 40. Companies (회사 관리) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Company Management** page in the Admin app. It is used by super admins to manage all tenant companies on the CORTHEX platform. Admins can create new companies, edit company names, search the company list, and deactivate companies. This is a platform-level page — it does NOT require a company to be selected in the sidebar since it manages all companies.

### Data Displayed — In Detail

**Page header:**
- Title: "회사 관리"
- Subtitle: Company count summary, e.g. "5개 회사". When search is active and filters results: "3 / 5개 회사"
- "회사 추가" (Add Company) button

**Search bar:**
- Text input with placeholder "회사명 또는 슬러그로 검색..."
- Filters the company list in real-time by company name or slug (case-insensitive)

**Create company form (expandable, hidden by default):**
- Shown when "회사 추가" is clicked
- Two fields in a row:
  - 회사명 (Company Name): Required text input
  - 슬러그 (Slug): Required text input, auto-converts to lowercase, allows only [a-z0-9-]
- "생성" button (shows "생성 중..." while submitting)
- "취소" button to collapse the form
- Error display below the form if creation fails

**Company list (vertical cards):**
Each company card shows:
- **Company name** (회사명): Displayed prominently
- **Slug**: Shown as "slug: xxx"
- **Statistics**:
  - 직원 N명 (N employees) — count of active users
  - 에이전트 N개 (N agents) — count of active agents
  - 생성: YYYY. M. D. (Created date in Korean locale)
- **Status badge**: "활성" (Active, success style) or "비활성" (Inactive, danger style)
- **Action buttons**:
  - "수정" (Edit): Switches the card to inline edit mode with a text input for name, save/cancel buttons
  - "비활성화" (Deactivate): Only shown for active companies. Opens a confirmation dialog

**Inline edit mode:**
- Replaces the card content with a text input pre-filled with the current name
- "저장" (Save) and "취소" (Cancel) buttons

**Deactivation confirmation dialog:**
- Title: "{CompanyName} 비활성화"
- Description: Warning that deactivating prevents employees from logging in, and active employees must be deactivated first
- "비활성화" confirm button (danger style)
- Cancel button

### User Actions

1. **Search companies** — type in the search bar to filter by name or slug
2. **Create a company** — click "회사 추가", fill in name and slug, submit
3. **Edit company name** — click "수정" on a company card, modify name inline, save
4. **Deactivate a company** — click "비활성화", confirm in the dialog. The server rejects this if the company has active employees (returns a 409 error with the count)
5. **Cancel edits** — click "취소" to exit inline edit mode or collapse the create form

### UX Considerations

- **Super admin context**: This page is only meaningful for platform-level administrators who manage multiple companies. For a single-company admin, they would see only their own company.
- **Slug is immutable after creation**: The slug field is editable during creation but cannot be changed via the edit flow — it's a unique identifier used in URLs and data isolation.
- **Deactivation is soft-delete**: Companies are not truly deleted — they are marked inactive. This is a reversible operation (though there is no re-activate button in the current UI).
- **Employee count guard**: The backend prevents deactivation if active employees exist. The UI should display the error message from the server clearly.
- **Statistics load separately**: Company list and stats come from two separate API calls. The list loads first; stats appear once the second call completes. Stats should gracefully show "0" while loading.
- **Search is client-side**: Filtering happens instantly in the browser without additional API calls, since all companies are loaded upfront.
- **Empty company creation**: The slug input auto-sanitizes input (lowercase, only alphanumeric and hyphens). This should feel responsive — characters that don't match the pattern are silently removed as the user types.
- **Loading state**: While companies are loading, show skeleton cards (4 placeholder cards).
- **Korean language**: All labels, buttons, status badges, and messages in Korean.
- **Mobile**: Company cards stack full-width. Create form fields stack vertically. Action buttons remain accessible.
- **Dark mode**: Card borders, status badges, and input fields must be clearly visible in dark mode.

### What NOT to Include on This Page

- No company-level settings or configuration — that's the Settings page (41)
- No API key management — that's handled in Settings
- No per-company cost or usage analytics
- No re-activation button for deactivated companies
- No company deletion (hard delete)
- No bulk operations (multi-select, batch deactivate)
- No company logo or branding settings
- No SMTP configuration — that's in Settings
