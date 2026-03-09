# 40. Companies (회사 관리) — Wireframe Prompt

## What This Page Is For

This is the **Company Management** page in the Admin app. Platform administrators use this page to manage all companies (tenants) on the CORTHEX platform — creating new companies, editing names, viewing statistics, and deactivating companies.

Each company is an isolated tenant with its own employees, AI agents, departments, and data. This page provides CRUD operations and an overview of all companies.

### Data Displayed — In Detail

**Note on theming:** This page supports both light and dark modes. All class references below use the `dark:` prefix pattern (e.g., `text-zinc-900 dark:text-zinc-100`). The zinc color palette is used throughout, with indigo as the accent color.

**Header row:**
- Left side:
  - Title: "회사 관리" (`text-2xl font-bold text-zinc-900 dark:text-zinc-100`)
  - Subtitle: Company count, e.g., "5개 회사" or "2 / 5개 회사" during search (`text-sm text-zinc-500 mt-1`)
- Right side:
  - "+ 회사 추가" button (`bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors`)

**Search bar:**
- Full-width input (max-w-md): `w-full max-w-md px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none`
- Placeholder: "회사명 또는 슬러그로 검색..."
- Filters companies in real-time by name or slug (case-insensitive)

**Create company form (shown when "+ 회사 추가" is clicked):**
- Container: `bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5`
- Title: "새 회사" (`text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4`)
- Form layout: `grid grid-cols-2 gap-4`
  - **회사명** label + input (required):
    - Label: `block text-sm text-zinc-600 dark:text-zinc-400 mb-1`
    - Input: `w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none`
  - **슬러그** label + input (required): Same styling, placeholder "영문, 숫자, 하이픈만"
    - Auto-sanitizes: `toLowerCase().replace(/[^a-z0-9-]/g, '')`
- Action row (`col-span-2 flex gap-2 justify-end`):
  - Cancel: `px-4 py-2 text-sm text-zinc-600`
  - Create: `px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors`
  - Button text: "생성" or "생성 중..." when pending
- Error display: `col-span-2 text-sm text-red-600` below action row

**Company list (vertical stack, `space-y-4`):**
- Each company card: `bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5`
- **Normal view (non-editing):**
  - Layout: `flex items-center justify-between`
  - Left side:
    - Company name: `text-lg font-semibold text-zinc-900 dark:text-zinc-100`
    - Slug: `text-sm text-zinc-500` (prefixed with "slug: ")
    - Stats row (`flex items-center gap-4 mt-2`):
      - "직원 {N}명" (`text-xs text-zinc-500`)
      - "에이전트 {N}개" (`text-xs text-zinc-500`)
      - "생성: {date}" (`text-xs text-zinc-400`) in Korean locale format (`toLocaleDateString('ko')`)
  - Right side (`flex items-center gap-3`):
    - Status badge (no border, rounded-full):
      - Active: `text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300` — text: "활성"
      - Inactive: `text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300` — text: "비활성"
    - "수정" button: `text-sm text-indigo-600 hover:text-indigo-700`
    - "비활성화" button (only for active companies): `text-sm text-red-600 hover:text-red-700`

- **Edit view (inline editing):**
  - Input field for company name: `flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100`
  - "저장" button: `text-sm text-indigo-600 hover:text-indigo-700`
  - "취소" button: `text-sm text-zinc-500`
  - Layout: `flex items-center gap-4`

**Deactivate confirmation dialog:**
- Uses shared `ConfirmDialog` component from `@corthex/ui`
- Props:
  - `isOpen`: boolean (true when a company is targeted for deactivation)
  - `title`: "{company name} 비활성화"
  - `description`: "이 회사를 비활성화하면 소속 직원은 로그인할 수 없습니다. 활성 직원이 있으면 먼저 비활성화해야 합니다."
  - `confirmText`: "비활성화"
  - `variant`: "danger"
  - `onConfirm` / `onCancel` handlers

**Loading state:**
- Grid `grid-cols-1 md:grid-cols-2 gap-4` with 4 `<SkeletonCard />` components from `@corthex/ui`

### User Actions

1. **Search companies** — Type in search bar to filter by name or slug in real-time
2. **Add a new company** — Click "+ 회사 추가", fill in name and slug, submit
3. **Edit company name** — Click "수정" on a company card, modify inline, click "저장"
4. **Deactivate a company** — Click "비활성화", confirm in dialog. This soft-deletes the company and cascades to all users
5. **Cancel editing** — Click "취소" to revert inline edit
6. **Cancel creation** — Click "취소" to close the create form

### UX Considerations

- **Light/dark mode support**: The page adapts to the system/app theme. All elements have both light and dark mode classes using the `dark:` prefix pattern.
- **Slug auto-sanitization**: As the user types in the slug field, non-allowed characters are stripped automatically. Only lowercase letters, numbers, and hyphens are permitted.
- **Inline editing is minimal**: Only the company name is editable inline. Slug cannot be changed after creation (immutable identifier).
- **Deactivation is cascading**: The backend soft-deletes the company AND all associated users/admins. The warning message should make this clear.
- **Active employees block deactivation**: If the company has active employees, the backend returns a 409 error. The UI shows this as a toast error.
- **Stats are fetched separately**: Employee count and agent count come from a separate `/stats` endpoint and are merged client-side.
- **No pagination**: The current implementation loads all companies at once. This is fine for a platform with a small number of companies (typically < 50).
- **Korean language**: All labels, buttons, and messages are in Korean.
- **Toast notifications**: All CRUD operations show success/error toasts via the toast store.
- **Form labels**: Both create-form inputs include `<label>` elements for accessibility.
- **Shared UI components**: Uses `ConfirmDialog` and `SkeletonCard` from the shared `@corthex/ui` package rather than custom implementations.
- **Empty state**: When no companies exist or when search returns no results, the list area renders empty (no explicit "no results" message is shown). The subtitle count ("0개 회사" or "0 / 5개 회사") serves as the indicator.

### What NOT to Include on This Page

- No company detail view (that's the Settings page)
- No user management per company (that's the Employees page)
- No agent or department management (separate pages)
- No SMTP configuration (that's in Settings)
- No pagination or infinite scroll (simple list is sufficient for expected scale)
- No company logo or branding settings
- No billing/subscription management
- No super-admin company creation with admin account (that's a separate super-admin route)
