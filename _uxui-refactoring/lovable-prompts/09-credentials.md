# 09. Credentials (CLI 토큰 / API 키 관리) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Credentials Management** page in the Admin app. Administrators use this page to manage two types of secrets per employee:

1. **CLI OAuth Tokens** — Claude OAuth tokens (sk-ant-oat01-...) from employees' Claude Desktop installations. These tokens allow the platform's AI agents to call Claude via the employee's subscription. Each human employee has their own token linked to a Claude Max subscription ($220/month).

2. **External API Keys** — Third-party service credentials for integrations like KIS (Korean Investment Securities for stock trading), Notion, Email, and Telegram.

The page is organized around a **user-first navigation**: the admin first selects an employee from a list, then manages that employee's tokens and API keys.

### Data Displayed — In Detail

**Employee selector (left panel):**
- A list of all users in the company
- Each entry shows the employee's **name** and **username** (e.g. "김대표 @ceo")
- The currently selected employee is highlighted
- This list is always visible alongside the credential management area

**Instructional guide banner (top of page):**
A prominent information banner explaining how to find Claude OAuth tokens:
1. Confirm Claude Desktop app is logged in
2. Open `~/.claude/.credentials.json` in file explorer
3. Copy the `claudeAiOauth.accessToken` value (sk-ant-oat01-... format)
4. Register the token on this page
5. Note: Must be an OAuth token (sk-ant-oat01-...), NOT an API key (sk-ant-api-...)

**CLI OAuth Tokens section (for selected employee):**
- Section header showing "CLI OAuth 토큰 — {employee name}"
- A list of registered tokens, each showing:
  - **Label** (라벨): User-defined name, e.g. "대표님 노트북"
  - **Registration date** (등록일): When the token was registered, formatted in Korean locale
  - **Status**: "활성" (active) or "비활성" (inactive)
  - **Deactivate button**: Only shown for active tokens
- **Add token form** (toggled by button):
  - Label field (required, e.g. "대표님 노트북")
  - Token textarea (required, monospace font, for pasting the OAuth token)
  - Cancel and Submit buttons
- Empty state: "등록된 CLI 토큰이 없습니다"

**External API Keys section (for selected employee):**
- Section header "외부 API 키"
- A list of registered API keys, each showing:
  - **Provider badge** (제공자): Uppercase label — KIS, NOTION, EMAIL, or TELEGRAM
  - **Label** (라벨): User-defined name, or "(라벨 없음)" if not set
  - **Registration date** (등록일)
  - **Delete button**
- **Add API key form** (toggled by button):
  - Provider selector (dropdown): KIS (한국투자증권), Notion, Email, Telegram
  - Scope selector (dropdown): 개인용 (user — only this employee's agents can use it) or 회사 공용 (company — any agent in the company can use it)
  - Label field (optional)
  - API key field (password/masked input, required)
  - Cancel and Submit buttons
- Empty state: "등록된 API 키가 없습니다"

### User Actions

1. **Select an employee** from the left panel to view their credentials
2. **Register a new CLI OAuth token** with a label and the actual token value
3. **Deactivate a CLI token** (soft delete — sets inactive, does not hard delete). Requires confirmation.
4. **Register a new API key** for a supported provider (KIS, Notion, Email, Telegram) with scope (user or company)
5. **Delete an API key** (hard delete). Requires confirmation.

### UX Considerations

- **Security-sensitive page**: This page handles secrets. Token values should never be displayed after registration — only the label and status are shown. The token input should be a textarea for pasting long tokens. The API key input should be a masked (password) field.
- **User-first navigation is essential**: The admin must select an employee before seeing any credentials. Without a selection, show a placeholder "좌측에서 직원을 선택하세요". Switching to a different employee should reset any open forms (close add-token or add-API-key forms).
- **Instructional guide is important**: Many users won't know where to find Claude OAuth tokens. The guide banner at the top should be noticeable but not blocking — it's educational, not an error.
- **CLI vs API distinction**: These are two separate credential types with different management patterns. CLI tokens are deactivated (soft delete), while API keys are fully deleted (hard delete). This distinction should be clear.
- **Company selection prerequisite**: This page requires a company to be selected first.
- **Confirmation for destructive actions**: Both token deactivation and API key deletion should require confirmation before proceeding.
- **Success/error feedback**: All registration, deactivation, and deletion operations should show feedback.
- **Korean language**: All labels, buttons, and messages should be in Korean.
- **Mobile**: The two-panel layout (employee list + credential management) should stack vertically on mobile.

### What NOT to Include on This Page

- No token values displayed after registration — security requirement
- No credential rotation/update for CLI tokens (only add new / deactivate old)
- No credential testing/validation (no "test connection" button)
- No agent-level credential assignment — credentials belong to users, not agents
- No encryption details or technical implementation visible to the admin
- No audit log of credential usage — that would be on a separate monitoring page
