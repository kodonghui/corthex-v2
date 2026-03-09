# 41. Settings Admin (회사 설정) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Company Settings** page in the Admin app. It allows administrators to configure the selected company's basic information, manage API keys for external service integrations, and set default operational parameters. This page requires a company to be selected in the sidebar — if none is selected, a placeholder message is shown.

The page is organized into three distinct sections, each managing a different aspect of company configuration.

### Data Displayed — In Detail

**Page header:**
- Title: "회사 설정"
- Subtitle: "회사 기본 정보, API 키, 기본 설정을 관리합니다"

**Section 1 — 회사 기본 정보 (Company Basic Info):**
- **회사명** (Company Name): Editable text input showing current name
- **Slug**: Read-only/disabled input showing the company slug (cannot be changed after creation)
- **생성일** (Created Date): Display-only, formatted in Korean locale (e.g. "2026년 3월 1일")
- **상태** (Status): Badge showing "활성" (Active, success style) or "비활성" (Inactive, danger style)
- When the name is modified, a save/cancel footer appears with:
  - "취소" button to revert changes
  - "저장" button to submit the update

**Section 2 — API 키 관리 (API Key Management):**
- Section title: "API 키 관리"
- Subtitle: "외부 서비스 연동을 위한 API 키를 관리합니다 (AES-256-GCM 암호화 저장)"
- "API 키 등록" (Register API Key) button

**API key registration form (expandable):**
- 서비스 제공자 (Provider): Dropdown select populated from the server's provider list. Supported providers include: Anthropic (Claude), OpenAI (GPT), Google AI (Gemini), KIS (한국투자증권), SMTP 메일, Telegram, Instagram, Serper (검색), Notion, Google Calendar, TTS (음성합성)
- 라벨 (Label): Optional text input (e.g. "프로덕션 키")
- Dynamic credential fields: When a provider is selected, the required fields for that provider are shown (e.g. "api_key" for OpenAI). All fields are password-type inputs (masked).
- "등록" submit button and "취소" button

**API key list:**
Each registered key shows:
- Provider badge (e.g. "OPENAI", "ANTHROPIC") — colored tag
- Scope badge: "회사 공용" (company-wide) or "개인용" (personal)
- Label text (or "(라벨 없음)" if no label)
- Registration date and update date (if different)
- Action buttons:
  - "갱신" (Rotate): Opens inline rotate form with new credential inputs for that provider
  - "삭제" (Delete): Opens confirmation dialog

**Key rotation form (inline, appears above the key list):**
- Warning-styled panel indicating credential replacement
- Shows provider name and label
- New credential field inputs (password-type)
- "갱신" submit button and "취소" button

**Delete confirmation dialog:**
- Title: "API 키 삭제"
- Description: Names the provider being deleted, warns this is irreversible
- "삭제" confirm button (danger style)

**Section 3 — 기본 설정 (Default Settings):**
- **타임존** (Timezone): Dropdown select with options: Asia/Seoul (KST), America/New_York, America/Los_Angeles, Europe/London, Asia/Tokyo, UTC
- **기본 LLM 모델** (Default LLM Model): Dropdown select with available models: Claude Sonnet 4, Claude Opus 4, Claude Haiku 4.5, GPT-4o, GPT-4o Mini, Gemini 2.0 Flash
- When either setting is changed, a save/cancel footer appears

### User Actions

1. **Edit company name** — modify the name and save. Slug cannot be changed.
2. **View company info** — see creation date, status, slug at a glance
3. **Register a new API key** — select a provider, fill in required credentials, optionally add a label
4. **Rotate an existing API key** — enter new credentials to replace old ones for a provider
5. **Delete an API key** — permanently remove a registered key after confirmation
6. **Change timezone** — set the company's operating timezone
7. **Change default LLM model** — set which AI model agents use by default
8. **Cancel unsaved changes** — revert edits in any section without saving

### UX Considerations

- **Three independent sections**: Each section manages a distinct concern. They load independently and can be edited independently. Saving in one section doesn't affect others.
- **Credential security**: API keys are stored encrypted (AES-256-GCM) and are never displayed after registration. The subtitle mentions encryption to reassure admins. All credential inputs are password fields.
- **Provider-aware forms**: The registration form dynamically shows different fields based on the selected provider. Some providers need just an API key, others need multiple fields (e.g. KIS requires multiple credentials).
- **Key rotation is separate from delete+recreate**: Rotation updates credentials in place, preserving the key's ID and history. This is important for audit trails.
- **Dirty state detection**: Save/cancel buttons only appear when the user has made changes. This prevents accidental saves and makes it clear when unsaved changes exist.
- **Slug is read-only**: Visually distinct (disabled input style) to make it clear this field cannot be edited.
- **Default model selection matters**: This affects all new agents. The dropdown should clearly show the model family and capability level.
- **Loading state**: Full-page skeleton when company data is loading. Each section shows independently if data fails.
- **No company selected state**: Clean placeholder message "회사를 선택하세요" instead of broken empty page.
- **Company not found state**: If the selected company can't be loaded, show "회사 정보를 불러올 수 없습니다".
- **Korean language**: All labels, buttons, messages, and provider display names in Korean where applicable.
- **Mobile**: Sections stack vertically. Form grids collapse to single column. API key list items remain scannable.
- **Dark mode**: Form inputs, badges, and warning panels need clear contrast in dark mode.

### What NOT to Include on This Page

- No company creation or deletion — that's the Companies page (40)
- No budget or cost management — that's the Costs Admin page (39)
- No user or employee management
- No agent configuration
- No department management
- No SMTP configuration UI (though the backend supports it)
- No API key usage analytics or call history
- No credential testing/validation (e.g. "Test Connection" button)
