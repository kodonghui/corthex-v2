# 09. Credentials (CLI 토큰 / API 키 관리) — Design Spec (Claude Coding Prompt)

## Page Overview
**Route**: `/credentials` (Admin App — `packages/admin/src/pages/credentials.tsx`)
**Purpose**: Manage CLI OAuth tokens and external API keys per employee, with user-first navigation.
**Source**: 407 lines single-file component

---

## Layout Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER                                                               │
│ h1: CLI 토큰 / API 키 관리                                          │
│ p: 직원별 Claude OAuth 토큰 및 외부 API 키를 관리합니다             │
├──────────────────────────────────────────────────────────────────────┤
│ GUIDE BANNER (amber info box)                                        │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ h3: Claude OAuth 토큰 찾는 법                                    │ │
│ │ 1. Claude Desktop 앱에서 로그인 상태 확인                        │ │
│ │ 2. ~/.claude/.credentials.json 열기                              │ │
│ │ 3. claudeAiOauth.accessToken 값 복사                             │ │
│ │ 4. 아래에서 해당 직원 선택 후 토큰 등록                          │ │
│ │ * API 키(sk-ant-api...)가 아닌 OAuth 토큰(sk-ant-oat01-...)      │ │
│ └──────────────────────────────────────────────────────────────────┘ │
├────────────┬─────────────────────────────────────────────────────────┤
│ USER LIST  │ CREDENTIAL MANAGEMENT (lg:col-span-2)                   │
│ (1 col)    │                                                         │
│            │ [No selection placeholder]                               │
│ ┌────────┐ │ — OR —                                                  │
│ │ 직원   │ │                                                         │
│ │ 선택   │ │ ┌─── CLI OAuth 토큰 ── {직원명} ──── [+ 토큰 등록] ──┐│
│ │        │ │ │                                                      ││
│ │ ○ 김대표│ │ │ [ADD TOKEN FORM — conditional]                      ││
│ │   @ceo │ │ │ ┌──────────────────────────────────┐                ││
│ │        │ │ │ │ 라벨 input                        │                ││
│ │ ● 박매니│ │ │ │ OAuth 토큰 textarea (monospace)   │                ││
│ │   @mgr │ │ │ │               [취소] [등록]       │                ││
│ │        │ │ │ └──────────────────────────────────┘                ││
│ │ ○ 이직원│ │ │                                                      ││
│ │   @emp │ │ │ TOKEN LIST                                           ││
│ │        │ │ │ ┌────────────────────────────────────────┐           ││
│ └────────┘ │ │ │ 대표님 노트북  등록: 2026.3.1  [활성] │           ││
│            │ │ │                        [비활성화]       │           ││
│            │ │ └────────────────────────────────────────┘           ││
│            │ └──────────────────────────────────────────────────────┘│
│            │                                                         │
│            │ ┌─── 외부 API 키 ──────────────── [+ API 키 등록] ────┐│
│            │ │                                                      ││
│            │ │ [ADD API KEY FORM — conditional]                     ││
│            │ │ ┌────────────┬──────────┬──────────┐                ││
│            │ │ │ 제공자 sel │ 범위 sel │ 라벨     │                ││
│            │ │ ├────────────┴──────────┴──────────┤                ││
│            │ │ │ API 키 (password input)           │                ││
│            │ │ │               [취소] [등록]       │                ││
│            │ │ └──────────────────────────────────┘                ││
│            │ │                                                      ││
│            │ │ KEY LIST                                             ││
│            │ │ ┌────────────────────────────────────────┐           ││
│            │ │ │ [KIS] 한국투자증권  등록: 2026.2.15    │           ││
│            │ │ │                              [삭제]    │           ││
│            │ │ └────────────────────────────────────────┘           ││
│            │ └──────────────────────────────────────────────────────┘│
└────────────┴─────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Page Header
```
Container: space-y-6 (outer page wrapper)
```

| Element | Tailwind Classes |
|---------|-----------------|
| Title | `text-3xl font-bold tracking-tight text-slate-50` |
| Subtitle | `text-sm text-slate-400 mt-1` |

### 2. Guide Banner
```
Container: bg-amber-900/10 border border-amber-800 rounded-xl p-4
Title: text-sm font-semibold text-amber-300 mb-2
List: text-sm text-amber-400 space-y-1 list-decimal list-inside
Code snippets: bg-amber-900/30 px-1 rounded (inline <code>)
Warning: text-xs text-amber-500 mt-2
```

### 3. Main Grid Layout
```
Container: grid grid-cols-1 lg:grid-cols-3 gap-6
Left panel: 1 column
Right panel: lg:col-span-2
```

### 4. User List Panel
```
Container: bg-slate-800/50 border border-slate-700 rounded-xl p-4
Title: text-sm font-semibold text-slate-50 mb-3 — "직원 선택"
List: space-y-1
```

| Element | Classes |
|---------|---------|
| User button (unselected) | `w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors` |
| User button (selected) | `w-full text-left px-3 py-2.5 rounded-lg text-sm bg-blue-950 text-blue-300 font-medium` |
| User name | Left-aligned |
| Username | `text-xs text-slate-400` — `@{username}`, right-aligned via `flex items-center justify-between` |

### 5. No Selection Placeholder
```
Container: bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center text-slate-400
Text: "좌측에서 직원을 선택하세요"
```

### 6. CLI OAuth Token Section
```
Container: bg-slate-800/50 border border-slate-700 rounded-xl p-5
Header: flex items-center justify-between mb-4
Title: text-lg font-semibold text-slate-50 — "CLI OAuth 토큰 — {employee name}"
Add button: px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors
```

#### 6a. Add Token Form (conditional)
```
Container: mb-4 p-4 bg-slate-800/50 rounded-lg space-y-3
```

| Field | Type | Details |
|-------|------|---------|
| 라벨 | input | required, placeholder "예: 대표님 노트북" |
| OAuth 토큰 | textarea | required, 2 rows, monospace font, placeholder "sk-ant-oat01-..." |

**Input Classes:**
```
w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none
```
Textarea adds: `resize-none font-mono`

**Buttons:**
- Cancel: `px-3 py-1.5 text-sm text-slate-400`
- Submit: `px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors`
- Loading: "등록 중..."
- Error: `text-sm text-red-500`

#### 6b. Token List
```
Container: space-y-2
```

| Element | Classes |
|---------|---------|
| Token item | `flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/50` |
| Label | `text-sm font-medium text-slate-50` |
| Registration date | `text-xs text-slate-400` — "등록: 2026. 3. 1." (ko locale) |
| Active pill | `text-xs px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-300` — "활성" |
| Inactive pill | `text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-300` — "비활성" |
| Deactivate button | `text-xs text-red-500 hover:text-red-400` — "비활성화" (with confirm()) |

**Empty state:** `text-sm text-slate-400` — "등록된 CLI 토큰이 없습니다"

### 7. External API Key Section
```
Container: bg-slate-800/50 border border-slate-700 rounded-xl p-5
Header: flex items-center justify-between mb-4
Title: text-lg font-semibold text-slate-50 — "외부 API 키"
Add button: same as CLI section
```

#### 7a. Add API Key Form (conditional)
```
Container: mb-4 p-4 bg-slate-800/50 rounded-lg space-y-3
Form grid: grid grid-cols-3 gap-3
```

| Field | Type | Details |
|-------|------|---------|
| 제공자 | select | KIS (한국투자증권), Notion, Email, Telegram |
| 범위 | select | 개인용 (user), 회사 공용 (company) |
| 라벨 | input | optional, placeholder "선택사항" |
| API 키 | input[type=password] | required, monospace, full width row |

**Select/Input Classes:**
```
w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-sm text-slate-100
```
Password input adds: `font-mono`

**Buttons:** Same pattern as CLI section

#### 7b. API Key List
```
Container: space-y-2
```

| Element | Classes |
|---------|---------|
| Key item | `flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/50` |
| Provider badge | `text-xs px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-300 uppercase` |
| Label | `text-sm font-medium text-slate-50` (or "(라벨 없음)" for null) |
| Registration date | `text-xs text-slate-400 mt-0.5` |
| Delete button | `text-xs text-red-500 hover:text-red-400` — "삭제" (with confirm()) |

**Supported Providers:**
| Provider Value | Display |
|---------------|---------|
| kis | KIS |
| notion | NOTION |
| email | EMAIL |
| telegram | TELEGRAM |

**Empty state:** `text-sm text-slate-400` — "등록된 API 키가 없습니다"

---

## Interactions

| Action | Trigger | Behavior |
|--------|---------|----------|
| Select employee | Click user in left panel | Loads CLI credentials + API keys for that user, closes any open forms |
| Add CLI token | "+ 토큰 등록" button | Shows inline form |
| Submit CLI token | Form submit | POST /admin/cli-credentials, toast success, close form |
| Cancel add token | "취소" button | Hides form |
| Deactivate token | "비활성화" link | `confirm()` dialog → DELETE /admin/cli-credentials/:id |
| Add API key | "+ API 키 등록" button | Shows inline form |
| Submit API key | Form submit | POST /admin/api-keys with credentials object |
| Cancel add API key | "취소" button | Hides form |
| Delete API key | "삭제" link | `confirm()` dialog → DELETE /admin/api-keys/:id |

---

## Responsive Behavior

| Breakpoint | Changes |
|-----------|---------|
| < lg (mobile/tablet) | Grid stacks vertically (1 column), user list on top, credentials below |
| lg+ (desktop) | 3-column grid: user list (1 col) + credentials (2 cols) |
| API key form | 3-column grid on all sizes (provider, scope, label) |

---

## Animations

| Element | Animation |
|---------|-----------|
| All buttons | `transition-colors` |
| User selection | Background color change via class toggle |
| Forms | Appear/disappear conditionally (instant) |

---

## Accessibility

| Feature | Implementation |
|---------|---------------|
| Form labels | `<label>` on all form fields |
| Required | `required` attribute on label and token/key inputs |
| Token security | Token not displayed after registration, API key uses password input |
| Confirmation | `confirm()` dialogs before deactivation/deletion |
| Ordered list | `<ol>` with list-decimal for guide steps |
| Code semantics | `<code>` tags for file paths and token formats |

---

## data-testid Map

| Element | data-testid |
|---------|-------------|
| Page container | `credentials-page` |
| Page title | `credentials-title` |
| Guide banner | `credentials-guide-banner` |
| User list panel | `credentials-user-list` |
| User button | `credentials-user-{id}` |
| No selection placeholder | `credentials-no-selection` |
| CLI section | `credentials-cli-section` |
| CLI section title | `credentials-cli-title` |
| CLI add button | `credentials-cli-add-btn` |
| CLI add form | `credentials-cli-add-form` |
| CLI label input | `credentials-cli-label-input` |
| CLI token textarea | `credentials-cli-token-input` |
| CLI submit button | `credentials-cli-submit` |
| CLI cancel button | `credentials-cli-cancel` |
| CLI token item | `credentials-cli-token-{id}` |
| CLI token label | `credentials-cli-token-label-{id}` |
| CLI token status | `credentials-cli-token-status-{id}` |
| CLI deactivate button | `credentials-cli-deactivate-{id}` |
| CLI empty state | `credentials-cli-empty` |
| API section | `credentials-api-section` |
| API section title | `credentials-api-title` |
| API add button | `credentials-api-add-btn` |
| API add form | `credentials-api-add-form` |
| API provider select | `credentials-api-provider` |
| API scope select | `credentials-api-scope` |
| API label input | `credentials-api-label-input` |
| API key input | `credentials-api-key-input` |
| API submit button | `credentials-api-submit` |
| API cancel button | `credentials-api-cancel` |
| API key item | `credentials-api-key-{id}` |
| API provider badge | `credentials-api-provider-{id}` |
| API key label | `credentials-api-key-label-{id}` |
| API delete button | `credentials-api-delete-{id}` |
| API empty state | `credentials-api-empty` |
