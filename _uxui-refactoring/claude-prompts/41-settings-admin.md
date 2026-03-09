# 41. Settings Admin (회사 설정) — Wireframe Prompt

## What This Page Is For

This is the **Company Settings** page in the Admin app. Administrators use this page to manage three aspects of the currently selected company:

1. **Company basic information** — View and edit the company name, see slug/status/creation date
2. **API key management** — Register, rotate, and delete external service API keys (AES-256-GCM encrypted)
3. **Default settings** — Configure timezone and default LLM model for the company

All sections are stacked vertically as separate cards. The page requires a company to be selected in the admin store.

### Data Displayed — In Detail

**Header:**
- Title: "회사 설정" (`text-2xl font-bold text-zinc-900 dark:text-zinc-100`)
- Subtitle: "회사 기본 정보, API 키, 기본 설정을 관리합니다" (`text-sm text-zinc-500 mt-1`)

---

**Section 1: Company Info Card**
- Card: `bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5`
- Section title: "회사 기본 정보" (`text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4`)
- Layout: `grid grid-cols-1 md:grid-cols-2 gap-4`
- Each field has a label: `block text-sm text-zinc-600 dark:text-zinc-400 mb-1`
- Fields:
  - **회사명** (editable input): `w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none`
  - **Slug** (read-only disabled input): `w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-sm text-zinc-500 cursor-not-allowed`
  - **생성일** (text display): formatted in Korean locale (e.g., "2026년 3월 7일"), `text-sm text-zinc-900 dark:text-zinc-100 py-2`
  - **상태** (status badge):
    - Active ("활성"): `bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs px-2.5 py-1 rounded-full`
    - Inactive ("비활성"): `bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs px-2.5 py-1 rounded-full`
- **Save/Cancel buttons** (appear only when name has been modified):
  - Divider: `border-t border-zinc-200 dark:border-zinc-700 mt-4 pt-4`
  - Layout: `flex justify-end gap-2`
  - Cancel: `px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors`
  - Save ("저장"): `px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors`

---

**Section 2: API Key Management Card**
- Card: `bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5`
- Header row (`flex items-center justify-between mb-4`):
  - Left:
    - Title: "API 키 관리" (`text-lg font-semibold text-zinc-900 dark:text-zinc-100`)
    - Subtitle: "외부 서비스 연동을 위한 API 키를 관리합니다 (AES-256-GCM 암호화 저장)" (`text-xs text-zinc-500 mt-0.5`)
  - Right:
    - "+ API 키 등록" button: `px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors`

**Add API key form (shown when "+ API 키 등록" clicked):**
- Wraps in a `<form>` element with `onSubmit` (Enter key submits)
- Container: `mb-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg space-y-3`
- Layout: `grid grid-cols-2 gap-3` for first row
  - **서비스 제공자** (select dropdown with `required`): Provider options are loaded dynamically from `/admin/api-keys/providers` endpoint. Static labels include Anthropic (Claude), OpenAI (GPT), Google AI (Gemini), KIS (한국투자증권), SMTP 메일, Email, Telegram, Instagram, Serper (검색), Notion, Google Calendar, TTS (음성합성). Default option: "선택..."
  - **라벨 (선택)** (text input): placeholder "예: 프로덕션 키"
- **Dynamic credential fields** (appear after provider is selected):
  - Label: `text-xs text-zinc-500` showing "필수 필드:"
  - Each field: `type="password"` input with `font-mono` styling, `required` attribute
  - Fields vary by provider (e.g., anthropic has "api_key", KIS has "account_id" + "api_key")
- Action row (`flex gap-2 justify-end`): Cancel (`px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400`) + "등록" button (`px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors`). Button shows "등록 중..." while saving, disabled when pending or no provider selected.

**Rotate API key form (shown when "갱신" clicked on an existing key):**
- Container: `mb-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg space-y-3`
- Title: "키 갱신: {provider name}" (includes " — {label}" if label exists) in `text-sm font-semibold text-amber-800 dark:text-amber-300`
- Warning: "새 키 값을 입력하면 기존 키가 교체됩니다" (`text-xs text-amber-600 dark:text-amber-500`)
- Dynamic credential fields (same styling as add form, placeholder "새 값 입력...")
- Action row: Cancel + "갱신" button (`px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors`). Button shows "갱신 중..." while saving.

**Existing API key list:**
- Loading state: Two `Skeleton` blocks (`h-14 w-full`) while keys are loading
- Each key row: `flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50`
- Left side:
  - Badges row: provider badge (`text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 uppercase font-medium`) + scope badge (`text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300`, shows "회사 공용" or "개인용") + label text (`text-sm font-medium text-zinc-900 dark:text-zinc-100`, shows "(라벨 없음)" when no label)
  - Date info: "등록: {date}" and optionally "| 갱신: {date}" (`text-xs text-zinc-500 mt-0.5`)
- Right side: "갱신" button (`text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300`) + "삭제" button (`text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300`)
- Empty state: "등록된 API 키가 없습니다" (`text-sm text-zinc-500 text-center py-6`)

**Delete confirmation dialog (uses `ConfirmDialog` from `@corthex/ui`):**
- Title: "API 키 삭제"
- Description: "{provider name} 키를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
- `confirmText`: "삭제", `variant`: "danger"
- Cancel button provided by dialog component

---

**Section 3: Default Settings Card**
- Card: `bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5`
- Section title: "기본 설정" (`text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4`)
- Layout: `grid grid-cols-1 md:grid-cols-2 gap-4`
- Each field has a label: `block text-sm text-zinc-600 dark:text-zinc-400 mb-1`
- Fields:
  - **타임존** (select dropdown): `w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100`
    - Options: Asia/Seoul (KST, UTC+9), America/New_York (EST/EDT), America/Los_Angeles (PST/PDT), Europe/London (GMT/BST), Asia/Tokyo (JST, UTC+9), UTC
    - Default value: `Asia/Seoul`
  - **기본 LLM 모델** (select dropdown): Same styling
    - Options (display name -> value): Claude Sonnet 4 (`claude-sonnet-4-20250514`), Claude Opus 4 (`claude-opus-4-20250514`), Claude Haiku 4.5 (`claude-haiku-4-5-20251001`), GPT-4o (`gpt-4o`), GPT-4o Mini (`gpt-4o-mini`), Gemini 2.0 Flash (`gemini-2.0-flash`)
    - Default value: `claude-sonnet-4-20250514`
- **Save/Cancel buttons** (appear only when a setting has been modified):
  - Same pattern as Company Info section (divider, cancel, save with indigo colors)

**Loading state:**
- Uses `Skeleton` component with `space-y-6` layout: h-8 w-48 (title), h-48 w-full, h-64 w-full, h-48 w-full

**No company selected state:**
- "회사를 선택하세요" centered in `text-zinc-500 p-8 text-center`

**Company not found state:**
- "회사 정보를 불러올 수 없습니다" centered in `text-zinc-500 p-8 text-center`

### API Endpoints Used

- `GET /admin/companies/:id` — Fetch company detail (name, slug, status, settings, dates)
- `PATCH /admin/companies/:id` — Update company name or settings (merges with existing)
- `GET /admin/api-keys` — List all API keys for the selected company
- `GET /admin/api-keys/providers` — Get provider schemas (which fields each provider requires)
- `POST /admin/api-keys` — Register a new API key (scope always set to `'company'`)
- `PUT /admin/api-keys/:id` — Rotate (update credentials for) an existing API key
- `DELETE /admin/api-keys/:id` — Delete an API key

### User Actions

1. **Edit company name** — Modify the company name input, then click "저장". The "저장"/"취소" buttons only appear when the field has been changed.
2. **Register a new API key** — Click "+ API 키 등록", select a provider, fill in credentials (masked password fields), and submit
3. **Rotate an API key** — Click "갱신" on an existing key, enter new credential values, confirm
4. **Delete an API key** — Click "삭제" on an existing key, confirm in dialog (irreversible)
5. **Change timezone** — Select from dropdown, then save
6. **Change default LLM model** — Select from dropdown, then save
7. **Cancel changes** — Click "취소" to revert any unsaved modifications

### UX Considerations

- **Security-sensitive section**: API key values are never displayed after registration. Input fields use `type="password"` for masking. The AES-256-GCM encryption note reassures admins about storage security.
- **Dirty tracking per section**: Each section independently tracks whether changes have been made. Save/Cancel buttons only appear when the section is "dirty" — this prevents accidental saves.
- **Provider-dependent fields**: The add/rotate forms dynamically show different credential fields based on the selected provider. Some providers need just `api_key`, others need multiple fields (e.g., KIS needs `account_id` + `api_key`).
- **Rotate vs Delete distinction**: Rotation updates credentials in place (same key ID). Deletion removes the key entirely. These are different operations with different severity.
- **Company selection prerequisite**: The entire page requires `selectedCompanyId` from the admin store. Without it, the page shows a placeholder message.
- **Korean language**: All labels, buttons, and messages are in Korean.
- **Toast notifications**: All mutations show success/error feedback via toast (success: "API 키가 등록되었습니다", "API 키가 삭제되었습니다", "API 키가 갱신되었습니다", "설정이 저장되었습니다").
- **Form reset on cancel**: Canceling the add form resets provider, label, and all credential fields. Canceling rotate clears all entered values.
- **Hardcoded scope**: All API keys registered from this admin page use scope `'company'` (company-wide). Personal keys are managed elsewhere.

### What NOT to Include on This Page

- No SMTP configuration UI (endpoint exists but not shown on this page)
- No public API key management (that's a separate page)
- No CLI OAuth token management (that's the Credentials page)
- No MCP server configuration (that's workspace-level)
- No slug editing (slug is immutable after company creation)
- No company deactivation (that's on the Companies list page)
- No audit log of settings changes
- No advanced settings (trading, prompt guard, etc.) — stored in settings JSONB but managed elsewhere
