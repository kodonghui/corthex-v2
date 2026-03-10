# 31. Settings (설정) — CEO App — Claude Design Spec

> **Route**: `/settings?tab={tabName}`
> **File**: `packages/app/src/pages/settings.tsx` (731 lines)
> **Sub-components**: `packages/app/src/components/settings/soul-editor.tsx`, `packages/app/src/components/settings/settings-mcp.tsx`, `packages/app/src/components/notification-settings.tsx`
> **App**: CEO App

---

## Code Analysis Summary

### Current Implementation
- **State**: URL-synced `activeTab` via `useSearchParams`, soulDirtyRef for unsaved changes guard
- **Tabs**: 10 tabs (2 disabled: files, trading), URL-persisted `?tab=`
- **Sub-pages**: ProfileTab, NotificationSettings, DisplayTab, CommandCenterTab, ApiKeyTab, TelegramSection, SoulEditor, SettingsMcp, PlaceholderTab
- **Wide tabs**: soul, mcp get `max-w-3xl`; others get `max-w-lg`
- **Navigation guard**: confirms when leaving soul editor with unsaved changes

### Current Design Issues
- Inconsistent color scheme (zinc-based, not slate design system)
- No consistent Card pattern across tabs (some use Card, some use raw divs)
- Tab overflow on mobile needs attention (10 tabs is a lot)
- Password auto-fill not explicitly prevented
- Theme toggle uses `indigo-*` instead of `blue-*`

---

## Design Spec

### Page Container
```
div.p-4.md:p-8
```

### Page Title
```
h2.text-2xl.font-bold.text-slate-50.mb-4
```
Text: "설정"

### Tab Bar
```
<Tabs items={TABS} value={activeTab} onChange={setTab} className="mb-6" />
```
- 10 tabs, horizontal scroll on mobile
- Short labels on mobile via `shortLabel` prop:
  - 프로필, 알림, 표시, 사령관, API, 텔레, 소울, 파일, 매매, MCP
- Disabled tabs (files, trading): `text-slate-600 cursor-not-allowed opacity-50`
- Active: `text-blue-500 border-b-2 border-blue-500`
- Inactive: `text-slate-400 hover:text-slate-200`
- Tab bar: `border-b border-slate-700 overflow-x-auto scrollbar-hide`

### Content Width
```
div (conditional class)
  - soul, mcp tabs → max-w-3xl
  - all others → max-w-lg
```

---

### Tab: Profile (프로필)

#### My Info Card
```
Card (bg-slate-800/50 border border-slate-700 rounded-xl)
  Header: px-4 py-3 border-b border-slate-700
    p.text-xs.font-semibold.text-slate-400.uppercase.tracking-wider → "내 정보"
  Body: p-4 space-y-4
```

**Fields**:

| Field | Type | Editable | Classes |
|-------|------|----------|---------|
| 사용자명 | text | read-only | `bg-slate-900 border-slate-700 text-slate-500 cursor-not-allowed` |
| 이메일 | text | read-only | same, shows "미설정" if null |
| 이름 | text | editable | `bg-slate-800 border-slate-600 focus:border-blue-500 text-slate-50` |
| 역할 | text | read-only | same as 사용자명, displays: 관리자/CEO/직원 |

**Labels**: `block text-xs font-medium text-slate-500 mb-1`

**All inputs**: `w-full px-3 py-2 rounded-lg text-sm`

**Save Button**:
```
button.w-full.py-2.bg-blue-600.text-white.rounded-lg.text-sm.font-medium.hover:bg-blue-500.disabled:opacity-50.transition-colors
```
- Text: "이름 저장" | "저장 중..."
- Disabled when: name unchanged OR empty OR isPending

#### Password Change Card
```
Card (bg-slate-800/50 border border-slate-700 rounded-xl)
  Header: px-4 py-3 border-b border-slate-700
    p.text-xs.font-semibold.text-slate-400.uppercase.tracking-wider → "비밀번호 변경"
  Body: p-4 space-y-3
```

**Fields**:
- 새 비밀번호: `type="password"` placeholder="최소 6자"
- 비밀번호 확인: `type="password"` placeholder="비밀번호 재입력"
- Input classes: `bg-slate-800 border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-50`

**Error**: `p.text-xs.text-red-500`

**Button**: same as save name button, text "비밀번호 변경" | "변경 중..."

#### Admin Console Switch (conditional: canSwitch = true)
```
Card (bg-slate-800/50 border border-slate-700 rounded-xl)
  div.p-4
    button.w-full.flex.items-center.justify-center.gap-2.py-2.5
      .border.border-slate-600.rounded-lg.text-sm.text-slate-300
      .hover:bg-slate-800.transition-colors
```
- Icon: bidirectional arrow SVG (w-4 h-4)
- Text: "관리자 콘솔로 이동"

---

### Tab: Notifications (알림 설정)

Renders `<NotificationSettings />` — same component as page 30. See `30-notifications.md` Tab 2 section.

---

### Tab: Display (표시 설정)

#### Theme Card
```
Card (bg-slate-800/50 border border-slate-700 rounded-xl)
  Header: px-4 py-3 border-b border-slate-700 → "테마"
  Body: p-4
    div.grid.grid-cols-3.gap-2
```

**Theme Buttons**:
- Active: `py-2.5 rounded-lg text-sm font-medium bg-blue-900/40 text-blue-300 ring-1 ring-blue-700`
- Inactive: `py-2.5 rounded-lg text-sm font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors`
- Options: 시스템 | 라이트 | 다크

#### Language Card
```
Card (bg-slate-800/50 border border-slate-700 rounded-xl)
  Header: px-4 py-3 border-b border-slate-700 → "언어"
  Body: p-4
    Select (options: 한국어, English)
    p.text-[10px].text-slate-500.mt-2 → "언어 변경은 향후 업데이트에서 전체 UI에 적용됩니다"
```

---

### Tab: Command Center (사령관실)

```
Card (bg-slate-800/50 border border-slate-700 rounded-xl)
  Header: px-4 py-3 border-b border-slate-700 → "사령관실 설정"
  Body: divide-y divide-slate-700
```

**Toggle Rows** (2):
```
div.flex.items-center.justify-between.px-4.py-3
  div
    span.text-sm.text-slate-300 → label
    p.text-[11px].text-slate-500 → description
  Toggle (size=sm)
```

| Label | Description | Default | Storage Key |
|-------|-------------|---------|-------------|
| 자동 스크롤 | 새 메시지가 올 때 자동으로 아래로 스크롤합니다 | true | corthex_autoscroll |
| 알림 소리 | 에이전트 응답 완료 시 알림 소리를 재생합니다 | true | corthex_sound |

---

### Tab: API Keys (API 연동)

#### Section Header
```
div.flex.items-center.justify-between.mb-3
  h3.text-sm.font-medium.text-slate-400 → "개인 API Key"
  button.text-xs.text-blue-400.hover:text-blue-300.hover:underline → "+ 새 키 등록" | "취소"
```

#### Add Key Form (toggled)
```
div.mb-4.p-4.rounded-lg.border.border-blue-800.bg-blue-950/30.space-y-3
```

**Fields**:
- 서비스 (Select): KIS 증권, 노션, 이메일, Serper 검색, 인스타그램, 텔레그램
- 라벨 (input, optional): placeholder "예: 내 KIS 계정"
- Dynamic credential fields based on provider (see table below)
- Security notice: `p.text-[10px].text-slate-500.flex.items-center.gap-1` → "🔒 모든 키는 서버에서 암호화되어 저장됩니다"
- Register button: `bg-blue-600 hover:bg-blue-500 text-white rounded-lg`

**Provider Fields**:
| Provider | Fields |
|----------|--------|
| KIS 증권 | App Key (password), App Secret (password), 계좌번호 (text) |
| 노션 | API Key (password) |
| 이메일 | SMTP 호스트 (text), 포트 (text), 사용자명 (text), 비밀번호 (password), 발신 주소 (email) |

**Input classes**: `bg-slate-800 border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-50`

#### Key List
```
div.space-y-2
```

Each key item:
```
div.flex.items-center.justify-between.p-3.rounded-lg.border.border-slate-700
  Left:
    div.flex.items-center.gap-2
      span.text-sm.font-medium.text-slate-50 → provider label
      Badge(variant=success) → "연동됨"
    p.text-xs.text-slate-500.mt-0.5 → label (if exists)
    p.text-[10px].text-slate-500 → "YYYY년 M월 D일 등록"
  Right:
    button.text-xs.text-red-500.hover:text-red-400 → "삭제" (with confirm())
```

#### Service Info Section
```
h3.text-sm.font-medium.text-slate-400.mb-3 → "서비스 연동 안내"
div.space-y-2
  div.p-3.rounded-lg.bg-slate-800 → per-service explanation
```

---

### Tab: Telegram (텔레그램)

#### Connected State (config.isActive = true)
```
div.p-4.rounded-lg.border.border-emerald-800.bg-emerald-950/30.space-y-3
  div.flex.items-center.gap-2
    span.text-[10px].bg-emerald-900.text-emerald-300.px-1.5.py-0.5.rounded-full → "연동됨"
    span.text-xs.text-slate-500 → "Chat ID: {ceoChatId || '미설정'}"
  div.flex.gap-2
    button.px-3.py-1.text-xs.bg-blue-600.text-white.rounded.hover:bg-blue-500 → "테스트 메시지"
    button.px-3.py-1.text-xs.border.border-red-800.text-red-400.rounded.hover:bg-red-900/30 → "연결 해제"
  Feedback: text-xs text-emerald-400 (success) or text-red-400 (error)
```

#### Disconnected State
```
div.p-4.rounded-lg.border.border-slate-700.space-y-3
  input (password) → placeholder "봇 토큰 (@BotFather에서 발급)"
  input (text) → placeholder "CEO 채팅 ID (선택)"
  button → "연동하기" (bg-blue-600)
  Error: p.text-xs.text-red-400
```

---

### Tab: Soul Editor (소울 편집)
Renders `<SoulEditor onDirtyChange={handleSoulDirtyChange} />`
- Split-pane: code editor + markdown preview
- Wide layout (max-w-3xl)
- Navigation guard on tab switch with unsaved changes

---

### Tab: MCP (MCP 연동)
Renders `<SettingsMcp />`
- Server list with connection status indicators
- Add server form (admin only)
- Wide layout (max-w-3xl)

---

### Tab: Files / Trading (Placeholder)
```
div.text-center.py-16
  p.text-3xl.mb-3 → "🚧"
  p.text-sm.text-slate-500 → "준비 중입니다"
  p.text-xs.text-slate-500.mt-1 → "이 기능은 향후 업데이트에서 제공됩니다"
```

---

## Responsive Behavior
- Mobile: `p-4`, tab bar scrolls horizontally with short labels
- Desktop: `p-8`, centered content with max-w-lg or max-w-3xl
- Soul editor: side-by-side on desktop, tabbed on mobile
- All form inputs: full width

## Navigation Guards
- Soul editor dirty check on:
  - Tab switch (confirm dialog)
  - Agent switch within soul editor
  - Route change (route blocker)

## Accessibility
- All form fields have visible labels
- Toggle switches indicate state
- Focus states on all interactive elements
- Tab navigation through form fields
- Escape to close modals where applicable
