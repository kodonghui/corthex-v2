# 42. Onboarding Wizard (온보딩) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Onboarding Wizard** page in the Admin app. It guides new company administrators through the initial setup of their AI organization in 5 sequential steps. The wizard runs once per company — upon completion, it marks the company as onboarded and redirects to the admin dashboard. Each step can be skipped, allowing admins to complete setup at their own pace.

This page requires a company to be selected in the sidebar. If none is selected, a message prompts the admin to select one, with a link to the dashboard.

### Data Displayed — In Detail

**Wizard chrome (persistent across all steps):**
- **Step indicator**: 5 numbered circles connected by lines, showing:
  - Current step: active/highlighted state
  - Completed steps: success state with checkmark icon
  - Future steps: muted/inactive state
  - Step labels below each circle: 환영, 조직 템플릿, API 키, 직원 초대, 완료
- **Progress bar**: A horizontal bar showing percentage completion (step N / 5 × 100%)

**Step 1 — 환영 (Welcome):**
- CORTHEX logo/icon (a large "C" badge)
- Welcome heading: "CORTHEX에 오신 것을 환영합니다!"
- Description text explaining this is the admin console for AI organization setup
- Company info card:
  - Company name (large text)
  - Slug shown below (small text, "slug: xxx")
  - "수정" (Edit) button to enable inline name editing
  - Inline edit: text input for name, save/cancel buttons
- Footer navigation: "다음 →" button

**Step 2 — 조직 템플릿 (Organization Template Selection):**
- Heading: "조직 템플릿 선택"
- Description: Explaining template vs. blank organization options
- **Template cards** (grid layout):
  - Each card shows: Template name, description (2-line truncated), department count, agent count
  - Cards are clickable — selecting one enters preview mode
  - A dashed-border "빈 조직으로 시작" (Start with Empty Org) card is always available as an alternative
- **Template preview mode** (when a template is selected):
  - "← 다른 템플릿 보기" back link
  - Template name and summary (N departments, N agents)
  - Description text
  - Scrollable department list showing:
    - Department name with agent count badge
    - Under each department: agent rows with name, tier badge (Manager/Specialist/Worker with distinct visual treatment), and model name
  - "이 조직 사용하기" (Use This Organization) button
  - Footer navigation with "건너뛰기" skip option
- **Template applied result** (after applying):
  - Success icon with checkmark
  - Template name confirmation
  - Two stat cards: departments created count, agents created count
  - Footer navigation to proceed

**Step 3 — API 키 (API Key Registration):**
- Heading: "API 키 설정"
- Description: Explaining these keys enable AI agent functionality, can be skipped
- **Provider cards** (only OpenAI and Google AI shown during onboarding):
  - Each card shows:
    - Provider name (e.g. "OpenAI (GPT)", "Google AI (Gemini)")
    - If already registered: "등록됨" success badge + message about changing in settings
    - If not registered: credential input fields (password-type) and "등록" button
- Footer navigation with "건너뛰기" or "나중에 설정하기" option

**Step 4 — 직원 초대 (Invite Employees):**
- Heading: "첫 직원 초대"
- Description: Can invite now or later from the employee management page
- **Invited employee list** (shown after each successful invite):
  - Employee name and email
  - Auto-generated initial password (shown as monospace code)
  - "복사" (Copy) button for the password, shows "복사됨!" confirmation briefly
- **Invite form:**
  - 아이디 (Username): Text input, placeholder "user01"
  - 이름 (Name): Text input, placeholder "홍길동"
  - 이메일 (Email): Email input, placeholder "hong@company.com"
  - 부서 (Department): Optional dropdown populated from departments created in Step 2 (if any exist)
  - "초대하기" (Invite) button
- Footer navigation with skip option when no employees are invited yet

**Step 5 — 완료 (Summary & Completion):**
- Success icon (large green checkmark circle)
- Heading: "준비 완료!"
- Description: Settings are complete
- **Summary list** showing what was configured:
  - 회사 (Company): Company name
  - 조직 템플릿 (Template): Template name with stats, or "빈 조직 (직접 구성)"
  - API 키: "N개 등록" or "미등록 (나중에 설정)"
  - 초대 직원: "N명" or "없음 (나중에 초대)"
- "CORTHEX 사용 시작하기" primary action button (the most prominent interactive element on the page)
- "← 이전 단계로 돌아가기" back link

**Footer navigation (shared pattern across Steps 1-4):**
- Left side: "← 이전" (Previous) button — hidden on Step 1
- Right side: "건너뛰기" (Skip) link when applicable + primary "다음 →" (Next) button
- The next button label changes contextually (e.g. "나중에 설정하기" when no API keys are registered)

### User Actions

1. **Review and optionally edit company name** (Step 1)
2. **Browse organization templates** — view available pre-configured organizations (Step 2)
3. **Preview a template** — see detailed department/agent structure before applying (Step 2)
4. **Apply a template** — deploy a pre-built organization structure with departments and agents (Step 2)
5. **Start with blank organization** — skip template and configure manually later (Step 2)
6. **Register API keys** — add OpenAI and/or Google AI credentials (Step 3)
7. **Skip API key setup** — proceed without registering keys (Step 3)
8. **Invite employees** — create user accounts with auto-generated passwords (Step 4)
9. **Copy initial passwords** — copy auto-generated passwords to clipboard for sharing with employees (Step 4)
10. **Complete onboarding** — finalize setup, mark company as onboarded, redirect to dashboard (Step 5)
11. **Navigate between steps** — go forward, backward, or skip steps freely
12. **Go back from any step** — revisit and modify previous choices

### UX Considerations

- **Progressive disclosure**: Each step focuses on one concern. The wizard never overwhelms with all options at once.
- **Everything is skippable**: No step is mandatory. An admin can click through to completion with zero configuration. This respects different onboarding styles — some admins want to set everything up immediately, others prefer to explore first.
- **Template preview is critical for decision-making**: Admins need to see exactly what agents they'll get before committing. The preview shows department structure, agent names, tiers, and models.
- **Template application is one-way**: Once applied, the template creates real departments and agents. There is no undo. The preview step before the "이 조직 사용하기" button serves as the confirmation.
- **Password visibility is intentional**: Auto-generated passwords are shown in plain text because the admin needs to share them with employees. The copy button makes this convenient. These are initial passwords that employees should change.
- **Only essential API keys during onboarding**: Only OpenAI and Google AI are shown (not the full list of 12+ providers). This reduces cognitive load. Other providers can be configured later in Settings.
- **Department dropdown in Step 4 depends on Step 2**: If a template was applied, departments are available for assignment. If the org is blank, the dropdown may be empty or hidden.
- **Completion marks the company as onboarded**: The "CORTHEX 사용 시작하기" button writes `onboardingCompleted: true` to company settings and redirects. This flag can be used elsewhere to determine if the company has completed initial setup.
- **Step state is local**: If the page is refreshed, the wizard restarts from Step 1. There is no server-side step persistence.
- **Loading state**: Initial company data load shows a centered loading indicator. Template list loading shows "로딩 중..." text.
- **No company selected state**: Shows a message with a "대시보드로 이동" button.
- **Korean language**: All text, labels, placeholders, and messages in Korean.
- **Mobile**: Step indicator circles shrink. Form fields stack vertically. Template cards stack to single column.
- **Dark mode**: All step content, cards, badges, and form elements readable in dark mode.

### What NOT to Include on This Page

- No full API key management (rotation, deletion) — that's Settings (41)
- No agent editing or soul configuration
- No department creation form (only template-based creation)
- No budget or cost setup
- No advanced settings (timezone, default model)
- No Anthropic (Claude) API key in onboarding — only OpenAI and Google AI
- No multi-step undo or wizard state persistence across page refreshes
- No onboarding progress saved to server (only completion flag is persisted)
