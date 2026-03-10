# 42. Onboarding Wizard (온보딩 마법사) — Wireframe Prompt

## What This Page Is For

This is the **Onboarding Wizard** page in the Admin app. When a new company is created and has not completed initial setup (`settings.onboardingCompleted !== true`), the admin is automatically redirected here. The wizard guides the administrator through 5 steps to configure their company, set up an AI organization, register API keys, and invite the first employees.

Once completed, the wizard sets `onboardingCompleted: true` in the company settings and redirects to the main dashboard. The wizard is skippable at most steps — optional sections can be configured later.

### Data Displayed — In Detail

**Page container:**
- `max-w-2xl mx-auto py-8` — Narrow, centered layout for focused wizard experience

**Step indicator (top of page, centered):**
- `flex items-center gap-1` wrapped in `flex justify-center mb-8`
- 5 numbered circles connected by horizontal lines:
  - Each circle: `w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold`
    - Completed step: `bg-green-500 text-white` + checkmark icon (SVG)
    - Current step: `bg-indigo-600 text-white` + step number
    - Future step: `bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400` + step number
  - Step label below each circle: `text-[10px] mt-1 whitespace-nowrap`
    - Current: `text-indigo-600 dark:text-indigo-400 font-medium`
    - Others: `text-zinc-400`
  - Connecting lines between circles: `w-8 h-0.5 mx-1 mb-4`
    - Completed: `bg-green-400`
    - Incomplete: `bg-zinc-200 dark:bg-zinc-700`
- Steps: 1-환영, 2-조직 템플릿, 3-API 키, 4-직원 초대, 5-완료

**Progress bar (below step indicator):**
- Full width: `w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full mb-8`
- Fill: `bg-indigo-600 rounded-full transition-all duration-300`
- Width: `(currentStep / 5) * 100%`

---

**Step 1 — Welcome (환영):**
- Centered content:
  - App icon: `w-16 h-16 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold` displaying "C"
  - Heading: "CORTHEX에 오신 것을 환영합니다!" (`text-2xl font-bold text-zinc-900 dark:text-zinc-100`)
  - Description: "AI 조직을 구성하고 운영하기 위한 관리자 콘솔입니다. 몇 가지 기본 설정을 완료하면 바로 시작할 수 있습니다." (`text-sm text-zinc-500 max-w-md mx-auto`)
- Company info card: `bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5 max-w-md mx-auto`
  - Header: "회사 정보" title (`text-sm font-semibold text-zinc-900 dark:text-zinc-100`) + "수정" link button (`text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300`)
  - Normal mode: Company name (`text-lg font-semibold text-zinc-900 dark:text-zinc-100`) + slug (`text-xs text-zinc-400`)
  - Edit mode: Name input (`border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800`) + Save button (`bg-indigo-600 hover:bg-indigo-700`) + Cancel button
- Footer navigation: "다음 →" button only (no "이전" on step 1)

---

**Step 2 — Organization Template (조직 템플릿):**

*Template selection view:*
- Centered heading: "조직 템플릿 선택" (`text-xl font-bold text-zinc-900 dark:text-zinc-100`)
- Description: "미리 구성된 템플릿으로 빠르게 시작하거나, 빈 조직으로 직접 설계하세요." (`text-sm text-zinc-500`)
- Template card grid: `grid grid-cols-1 md:grid-cols-2 gap-4`
  - Each template card: `bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md cursor-pointer group`
    - Template name: `text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400`
    - Description: `text-sm text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2`
    - Stats: "{N}개 부서" + "{N}명 에이전트" (`text-xs text-zinc-400`)
  - **Blank organization card** (special): `border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-indigo-400 dark:hover:border-indigo-500`
    - "빈 조직으로 시작" title
    - "템플릿 없이 부서와 에이전트를 직접 구성합니다." description
    - "비서실장만 포함" stat
- **Blank org card** clicks directly to next step (no preview), while template cards open the preview view
- Footer: "← 이전" + "건너뛰기" skip button + next button (also labeled "건너뛰기"); both skip and next perform the same action (proceed without template)

*Template preview view (after selecting a template):*
- Back link: "← 다른 템플릿 보기" (`text-xs text-indigo-600 dark:text-indigo-400`)
- Template name (`text-lg font-semibold`) + stats heading (`text-sm text-zinc-500`)
- Optional description: `text-sm text-zinc-600 dark:text-zinc-400`
- Department list: `space-y-3 max-h-64 overflow-y-auto`
  - Each department: `border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden`
    - Department header: `bg-zinc-50 dark:bg-zinc-800 px-4 py-2` with name + agent count badge (`text-xs px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700`)
    - Agent rows: `divide-y divide-zinc-100 dark:divide-zinc-800`
      - Agent name (`text-sm text-zinc-900 dark:text-zinc-100`) + tier badge + model name (`text-xs text-zinc-400 ml-auto`)
      - Tier badges:
        - Manager: `bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] px-1.5 py-0.5 rounded`
        - Specialist: `bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] px-1.5 py-0.5 rounded`
        - Worker: `bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] px-1.5 py-0.5 rounded`
- Apply button: `bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg w-full px-4 py-2.5`
  - Text: "이 조직 사용하기" or "적용 중..."
- Footer: "← 이전" + "건너뛰기" skip button + "다른 템플릿" next button

*Apply result view (after template is applied):*
- Centered success: Green checkmark circle (`bg-green-100 dark:bg-green-900/30`) + `"{template name}" 적용 완료` heading
- Result stats: `grid grid-cols-2 gap-3 max-w-sm mx-auto`
  - Departments created: `bg-green-50 dark:bg-green-900/20 rounded-lg px-4 py-3 text-center`
    - Count: `text-2xl font-bold text-green-700 dark:text-green-300`
    - Label: `text-xs text-green-600 dark:text-green-400`
  - Agents created: `bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-3 text-center`
    - Count: `text-2xl font-bold text-blue-700 dark:text-blue-300`
    - Label: `text-xs text-blue-600 dark:text-blue-400`
- Footer: "← 이전" + "다음 →"

---

**Step 3 — API Keys (API 키):**
- Centered heading: "API 키 설정" (`text-xl font-bold text-zinc-900 dark:text-zinc-100`)
- Description: "AI 에이전트가 사용할 외부 API 키를 등록합니다. 나중에 설정해도 됩니다." (`text-sm text-zinc-500`)
- Provider cards: `space-y-4 max-w-lg mx-auto`
  - Two providers shown: **OpenAI (GPT)** and **Google AI (Gemini)**
  - Each card: `bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4`
    - Header: Provider name (`text-sm font-semibold text-zinc-900 dark:text-zinc-100`) + optional "등록됨" badge (`bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs px-2 py-0.5 rounded-full`)
    - If already registered: "이미 등록된 키가 있습니다. 설정 페이지에서 변경할 수 있습니다." (`text-xs text-zinc-500`)
    - If not registered:
      - Credential field labels: `text-xs text-zinc-500` (field names from provider schema, e.g. "api_key")
      - Credential fields: `type="password"` input(s) with `font-mono` styling, `border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800`
      - "등록" button: `bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg px-3 py-1.5`
- **Note**: Credential field names are dynamically fetched from the `/admin/api-keys/providers` API endpoint (defaults to `['api_key']` if unavailable)
- Footer: "← 이전" + "건너뛰기" + conditional next label: "다음 →" (if keys registered) or "나중에 설정하기" (if none registered)

---

**Step 4 — Invite Employees (직원 초대):**
- Centered heading: "첫 직원 초대" (`text-xl font-bold text-zinc-900 dark:text-zinc-100`)
- Description: "팀원을 초대해보세요. 나중에 직원 관리 페이지에서도 추가할 수 있습니다." (`text-sm text-zinc-500`)

- **Invited list** (shown when employees have been invited): `space-y-2 max-w-lg mx-auto`
  - Each row: `flex items-center justify-between px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800`
    - Left: Name (`text-sm font-medium text-zinc-900 dark:text-zinc-100`) + email (`text-xs text-zinc-500`)
    - Right: Initial password in `code` element (`text-xs bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 font-mono`) + "복사" button (`text-xs text-indigo-600 dark:text-indigo-400`, changes to "복사됨!" on click)

- **Invite form**: `max-w-lg mx-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 space-y-3`
  - Row 1: `grid grid-cols-2 gap-3`
    - **아이디** input: placeholder "user01"
    - **이름** input: placeholder "홍길동"
  - Row 2: **이메일** input: placeholder "hong@company.com" (`type="email"`)
  - Row 3 (optional, only if departments exist): **부서 (선택)** select dropdown with "부서 선택 (선택사항)" default option
  - Action: "초대하기" button right-aligned (`bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2`); shows "초대 중..." when pending
- Footer: "← 이전" + "건너뛰기" (if no one invited, shown as both skip and next label) or "다음 →" (if someone invited)

---

**Step 5 — Summary (완료):**
- Centered success:
  - Green icon: `w-16 h-16 mx-auto rounded-2xl bg-green-500 text-white` with checkmark-in-circle SVG
  - Heading: "준비 완료!" (`text-2xl font-bold text-zinc-900 dark:text-zinc-100`)
  - Description: "아래 설정이 완료되었습니다. 관리자 콘솔에서 조직을 관리하세요." (`text-sm text-zinc-500`)
- Summary items: `max-w-md mx-auto space-y-3`
  - Each item: `flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg`
    - Label: `text-sm text-zinc-600 dark:text-zinc-400`
    - Value: `text-sm font-medium text-zinc-900 dark:text-zinc-100`
  - Items:
    - 회사: {company name}
    - 조직 템플릿: "{template name} (부서 {N}개, 에이전트 {N}명)" or "빈 조직 (직접 구성)"
    - API 키: "{N}개 등록" or "미등록 (나중에 설정)"
    - 초대 직원: "{N}명" or "없음 (나중에 초대)"
- **CTA button**: "CORTHEX 사용 시작하기" (`bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl px-8 py-3 shadow-lg shadow-indigo-500/20`); shows "저장 중..." when pending
- Back link: "← 이전 단계로 돌아가기" (`text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300`)

---

**Footer navigation component (shared across steps):**
- Layout: `flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-700`
- Left: "← 이전" button (hidden on step 1): `text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-4 py-2`
- Right: `flex items-center gap-3`
  - "건너뛰기" button (optional): `text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 px-4 py-2`
  - Next/Complete button: `bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg px-5 py-2`

**No company selected state:**
- Centered vertically (`min-h-[60vh]`):
  - "사이드바에서 회사를 선택해주세요." (`text-sm text-zinc-500`)
  - "대시보드로 이동" button: `bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg px-4 py-2`

**Loading state:**
- Centered vertically (`min-h-[60vh]`): "로딩 중..." (`text-zinc-500`)

### User Actions

1. **Step 1**: Review company name, optionally edit it, click "다음 →"
2. **Step 2**: Browse template cards, preview department/agent structure, apply a template OR click blank org card to start empty
3. **Step 3**: Optionally register OpenAI and/or Google AI API keys, or skip
4. **Step 4**: Optionally invite employees with username/name/email/department, copy initial passwords
5. **Step 5**: Review summary, click "CORTHEX 사용 시작하기" to complete onboarding
6. **Navigate between steps**: Use "← 이전" and "다음 →" buttons
7. **Skip optional steps**: Use "건너뛰기" on Steps 2, 3, 4

### UX Considerations

- **Auto-redirect**: The app Layout component checks `onboardingCompleted` flag and redirects to `/onboarding` if false. This ensures new companies always go through the wizard.
- **Most steps are optional**: Only Step 1 (welcome) and Step 5 (completion) are mandatory. Templates, API keys, and employee invitations can all be done later.
- **Light/dark mode support**: All components include both light (`bg-zinc-50`, `text-zinc-900`) and dark mode (`dark:bg-zinc-800/50`, `dark:text-zinc-100`) class variants.
- **Password visibility**: Initial passwords for invited employees are shown in plaintext with a copy button. This is the only time they're visible — the admin must share them with the employees.
- **Template preview before apply**: Users can preview the full department/agent structure before committing. The scrollable list (`max-h-64 overflow-y-auto`) prevents very large templates from overwhelming the page.
- **Apply result is persistent**: Once a template is applied, the wizard shows the result (departments/agents created) and the user cannot re-apply on the same step. Going back and re-selecting would attempt to apply again (backend handles duplicates via skip).
- **Step completion tracking**: The wizard tracks which steps are completed via a `Set<number>`. Completed steps show green checkmarks in the step indicator.
- **No URL-based routing**: Steps are managed via local state, not URL params. Refreshing the page resets to Step 1.
- **Korean language**: All labels, buttons, descriptions, and messages are in Korean.
- **Company selection prerequisite**: The wizard requires `selectedCompanyId` from the admin store.
- **Onboarding completion**: Step 5 fetches current company settings before patching to preserve existing settings while adding `onboardingCompleted: true`.
- **Toast notifications**: All mutations (save company name, apply template, register API key, invite employee, complete onboarding) show success/error toast notifications via the shared toast system.

### What NOT to Include on This Page

- No Claude/Anthropic API key registration (Claude uses OAuth CLI tokens, not API keys)
- No agent-level configuration (agents come from templates; individual config is elsewhere)
- No department creation form (departments come from templates or are created in the Departments page)
- No settings for timezone/model (that's the Settings page)
- No billing or subscription setup
- No URL-based step navigation (steps are not bookmarkable)
- No step validation enforcement (users can skip forward without completing optional steps)
- No progress persistence across sessions (refreshing resets the wizard)
