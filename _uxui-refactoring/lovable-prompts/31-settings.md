# 31. Settings (설정) — CEO App

> **Route**: `/settings`
> **App**: CEO App (`app.corthex-hq.com`)

---

## 복사할 프롬프트:

Design the **Settings (설정)** page for the CEO App. This is the centralized configuration hub where the CEO manages their profile, display preferences, command center behavior, API integrations, Telegram bot, agent soul editing, and MCP server connections.

---

### Page Purpose

One place for all user-facing configuration. The CEO can:
1. Edit their profile (name, password)
2. Configure display preferences (theme, language)
3. Adjust command center behavior (auto-scroll, sound)
4. Manage notification preferences
5. Register/delete external API keys (KIS securities, Notion, email SMTP)
6. Connect/disconnect a Telegram bot
7. Edit any agent's "soul" (personality/system prompt) with live markdown preview
8. Manage MCP (Model Context Protocol) server connections

---

### Page Structure

A **horizontal tab bar** at the top with these tabs:
- 프로필 (Profile)
- 알림 설정 (Notifications)
- 표시 설정 (Display)
- 사령관실 (Command Center)
- API 연동 (API Keys)
- 텔레그램 (Telegram)
- 소울 편집 (Soul Editor)
- 파일 관리 (Files — disabled, shows "준비 중")
- 매매 설정 (Trading — disabled, shows "준비 중")
- MCP 연동 (MCP)

The active tab is stored in the URL query parameter (`?tab=profile`), so it persists on refresh and is shareable. Tabs show abbreviated labels on mobile (e.g., "알림 설정" → "알림", "표시 설정" → "표시").

Most tabs use a narrow content width for form-like content. The Soul Editor and MCP tabs use a wider content area.

---

### Tab: Profile (프로필)

**My Info Card**
- 사용자명 (Username): read-only input, grayed out
- 이메일 (Email): read-only input, shows "미설정" if null
- 이름 (Name): editable text input
- 역할 (Role): read-only, displays translated role (관리자/CEO/직원)
- "이름 저장" button: disabled when name hasn't changed or is empty

**Password Change Card**
- 새 비밀번호 (New Password): password input, placeholder "최소 6자"
- 비밀번호 확인 (Confirm Password): password input
- Validation: minimum 6 characters, passwords must match. Error message displayed inline
- "비밀번호 변경" button

**Admin Console Switch** (conditional)
- Only shown if the current user also has admin access
- A bordered button: "관리자 콘솔로 이동" with a bidirectional arrow icon
- Clicking switches to the admin app with a new auth token

---

### Tab: Notification Settings (알림 설정)

This embeds the same notification settings component described in page 30 (Notifications). It includes:
- SMTP warning banner (if email not configured)
- Global toggles (in-app, email)
- Per-event category settings with individual toggles
- 30-day retention notice

---

### Tab: Display (표시 설정)

**Theme Card**
- Three selectable buttons in a row: 시스템 (System), 라이트 (Light), 다크 (Dark)
- The active option is visually highlighted with a ring/border
- Changes apply immediately

**Language Card**
- Dropdown select: 한국어, English
- Subtext: "언어 변경은 향후 업데이트에서 전체 UI에 적용됩니다"

---

### Tab: Command Center (사령관실)

**Settings Card**
Two toggle rows in a card:
- 자동 스크롤 (Auto-scroll): "새 메시지가 올 때 자동으로 아래로 스크롤합니다"
- 알림 소리 (Notification Sound): "에이전트 응답 완료 시 알림 소리를 재생합니다"

Each row has a label, description subtext, and a toggle switch. Changes save to localStorage immediately.

---

### Tab: API Keys (API 연동)

**API Key List**
- Each registered key shows: provider name (KIS 증권/노션/이메일 etc.), "연동됨" badge, optional label, registration date
- Delete button (with confirmation) on each key

**Add Key Form** (toggled by "+ 새 키 등록" button)
- Service dropdown: KIS 증권, 노션, 이메일, Serper 검색, 인스타그램, 텔레그램
- Label input (optional)
- Dynamic credential fields based on selected service:
  - KIS: App Key (password), App Secret (password), 계좌번호 (text)
  - Notion: API Key (password)
  - Email: SMTP 호스트, 포트, 사용자명, 비밀번호 (password), 발신 주소 (email)
- Some services (Serper, Instagram, Telegram) may not have separate credential fields — they use a single-key registration
- Security notice: "🔒 모든 키는 서버에서 암호화되어 저장됩니다"
- Register button (disabled until all required fields are filled)

**Service Info Section**
- Brief explanation cards for each service (KIS, Notion) explaining what registering the key enables

---

### Tab: Telegram (텔레그램)

**Connected State** (when bot is active)
- Green-bordered card showing connection status
- "연동됨" badge with Chat ID display
- "테스트 메시지" button (sends a test message, shows success/error feedback)
- "연결 해제" button (red-styled)

**Disconnected State** (when no bot configured)
- Bot token input (password field, placeholder: "봇 토큰 (@BotFather에서 발급)")
- CEO Chat ID input (optional)
- "연동하기" button (validates token server-side)
- Error message display on failure

---

### Tab: Soul Editor (소울 편집)

A split-pane editor for modifying any agent's personality/system prompt.

**Agent Selection**
- Dropdown showing all agents accessible to the current user, with count (e.g., "에이전트 선택 (내 에이전트 15개)")

**Template Loader** (when agent is selected)
- Dropdown to load a soul template. Applying shows a confirmation dialog

**Unsaved Changes Banner**
- When content differs from saved version, shows a yellow banner with inline save button

**Editor Area** (desktop: side-by-side, mobile: tab switching)
- Left panel: code editor with syntax highlighting for markdown
- Right panel: live rendered markdown preview
- Character counter at bottom-right of editor (current / 2000 max, turns amber when over limit)
- Mobile: two tabs "편집" (Edit) and "미리보기" (Preview) to switch between panels

**Action Buttons**
- "초기화 ↺" button (top-right): resets to admin-defined default soul. Only visible if an admin soul exists. Shows confirmation
- "소울 저장" button (bottom-right): saves changes. Disabled when no changes, empty, or over character limit. On success, shows feedback that changes apply from the next conversation

**Navigation Guards**
- Switching agents with unsaved changes: confirmation dialog
- Navigating away with unsaved changes: confirmation dialog (route blocker)
- Switching settings tabs with unsaved changes: confirmation dialog

---

### Tab: MCP (MCP 연동)

**Server List**
Each registered MCP server shows:
- Server name, connection status indicator (green dot = connected, gray = disconnected, red = error, pulsing = loading)
- Server URL below the name
- HTTP warning if URL uses http:// instead of https://
- Expandable: clicking reveals the list of tools provided by that server
- Delete button (admin only, with confirmation)

**Add Server Form** (admin only, toggled by "+ 서버 추가" button)
- Server URL input (auto-suggests name from URL on blur)
- Server name input (auto-populated but editable)
- "연결 테스트" button (tests connection, shows success/error result)
- "등록" button
- Maximum 10 servers allowed (shows limit notice when reached)
- Warning toast if URL contains "localhost"

**Empty State**
"연결된 MCP 서버가 없습니다" with subtext: "서버를 추가하면 에이전트가 외부 도구를 사용할 수 있습니다"

---

### Tab: Files / Trading (Placeholder)

Both disabled tabs show a placeholder: "🚧 준비 중입니다 — 이 기능은 향후 업데이트에서 제공됩니다"

---

### UX Considerations

- This is a long page with many tabs — the tab bar should scroll horizontally on mobile, showing short labels to save space
- Each tab should feel like a focused, self-contained settings section
- Form changes should save on explicit button click (not auto-save), except toggles and theme which save immediately
- The soul editor is the most complex tab — the split-pane layout needs to work well on both desktop and mobile
- Password fields should never auto-fill or show current passwords
- API key credentials are never shown after registration (only provider name and label)
- MCP server status should be checked automatically when the page loads (ping each server)
- Disabled tabs should be visually muted but still visible to set expectations
- Success/error feedback via toast notifications for all save/delete operations
