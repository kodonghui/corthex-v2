# 30. Notifications (알림) — CEO App — Claude Design Spec

> **Route**: `/notifications`
> **File**: `packages/app/src/pages/notifications.tsx` (244 lines)
> **Shared**: `packages/app/src/components/notification-settings.tsx` (170 lines)
> **App**: CEO App

---

## Code Analysis Summary

### Current Implementation
- **State**: `activeTab` (list/settings), `filter` (all/unread)
- **Data**: React Query for notifications list + unread count, WS real-time subscription
- **Mutations**: markRead (single), markAllRead (bulk)
- **Grouping**: Date-based (오늘/어제/localized date)
- **TimeAgo**: Custom relative time (방금/N분 전/N시간 전/N일 전)
- **Shared Component**: `NotificationSettings` reused in Settings page

### Current Design Issues
- Uses `zinc` colors (light-mode default), inconsistent with dark-first design system
- Filter pills use `indigo-600` instead of design system `blue-600`
- No hover/focus states on notification items (accessibility)
- Emoji-based icons (🔔⚠️✅❌⚙️🤖) — keep as-is, they're intentional
- Tab component from `@corthex/ui` — styling handled externally
- Max width `max-w-2xl` — appropriate for notification list

---

## Design Spec

### Page Container
```
div.p-4.sm:p-6.max-w-2xl.mx-auto.space-y-4
```
- Background: inherits from layout (bg-slate-900)

### Page Title
```
h1.text-xl.font-semibold.tracking-tight.text-slate-50
```
Text: "알림"

### Tabs
```
<Tabs items={tabsWithCount} value={activeTab} onChange={setTab} />
```
- Tab items: "알림 목록 (N)" | "알림 설정"
- Unread count appended to first tab when > 0
- Tab bar: `border-b border-slate-700`, active tab: `text-blue-500 border-b-2 border-blue-500`
- Inactive tab: `text-slate-400 hover:text-slate-200`

---

### Tab 1: Notification List (알림 목록)

#### Filter Bar
```
div.flex.items-center.justify-between
```

**Filter Pills** (left):
```
div.flex.gap-2
```
Each pill button:
- Active: `px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white`
- Inactive: `px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors`
- Labels: "전체" | "미확인만"

**Mark All Read** (right, conditional when unreadCount > 0):
```
button.text-xs.text-blue-400.hover:text-blue-300.font-medium.transition-colors
```
Text: "모두 읽음 ✓"

#### Loading State
```
div.space-y-3
  Skeleton.h-16.rounded-lg  (×3)
```
Skeleton: `bg-slate-800 animate-pulse rounded-lg`

#### Empty State
```
Card (bg-slate-800/50 border border-slate-700 rounded-xl)
  div.p-8.text-center.text-sm.text-slate-500
```
- All filter: "알림이 없습니다"
- Unread filter: "미확인 알림이 없습니다"

#### Notification Groups
Each date group:
```
div (per group)
  p.text-xs.font-semibold.text-slate-500.mb-2  ← group label: "오늘" | "어제" | "3월 5일"
  div.space-y-1  ← items
```

#### Notification Item
```
button.w-full.text-left.flex.items-start.gap-3.px-4.py-3.rounded-lg.transition-colors
```

**States**:
- Unread: `bg-blue-950/20 hover:bg-blue-950/30`
- Read: `hover:bg-slate-800/50`
- Focus: `focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-0`

**Layout** (left to right):
1. **Unread dot** (pt-1.5):
   - Unread: `div.w-2.h-2.rounded-full.bg-blue-500`
   - Read: `div.w-2.h-2` (invisible spacer)

2. **Type icon** (`span.text-base.leading-none.pt-0.5`):
   - chat_complete → 🔔
   - delegation_complete → 🤖
   - tool_error → ⚠️
   - job_complete → ✅
   - job_error → ❌
   - system → ⚙️
   - fallback → 🔔

3. **Content** (`div.flex-1.min-w-0`):
   - Title: `p.text-sm`
     - Unread: `text-slate-50 font-medium`
     - Read: `text-slate-400`
   - Body (optional): `p.text-xs.text-slate-500.mt-0.5.truncate`

4. **Timestamp** (`span.text-[11px].text-slate-500.whitespace-nowrap.pt-0.5`):
   - Values: "방금" | "N분 전" | "N시간 전" | "N일 전"

**Click Behavior**:
- If unread → mark as read (optimistic)
- If has actionUrl → navigate to that URL

#### Real-time Updates
- WebSocket subscription on `notifications` channel
- On event: invalidate `notifications`, `notifications-count`, `recent-notifications` queries
- Keyed by `notifications::${userId}`

---

### Tab 2: Notification Settings (알림 설정)

Renders `<NotificationSettings />` shared component.

#### SMTP Warning Banner (conditional)
```
div.px-4.py-3.rounded-lg.bg-amber-950/30.border.border-amber-800/50.text-sm.text-amber-300
```
Text: "이메일 알림을 사용하려면 관리자에게 SMTP 설정을 요청하세요"

#### Global Settings Card
```
Card (bg-slate-800/50 border border-slate-700 rounded-xl)
  Header: px-4 py-3 border-b border-slate-700
    p.text-xs.font-semibold.text-slate-400.uppercase.tracking-wider → "전체 설정"
  Body: divide-y divide-slate-700
    Row: flex items-center justify-between px-4 py-3
      span.text-sm.text-slate-300 → "앱 알림"
      Toggle (checked, size=sm)
    Row: flex items-center justify-between px-4 py-3
      span.text-sm.text-slate-300 → "이메일 알림"
      Toggle (checked=false, disabled when SMTP not configured, size=sm)
```

#### Per-Event Category Cards
For each category (채팅, 작업, 시스템):
```
Card (bg-slate-800/50 border border-slate-700 rounded-xl)
  Header: px-4 py-3 border-b border-slate-700
    p.text-xs.font-semibold.text-slate-400.uppercase.tracking-wider → category label
  Body: divide-y divide-slate-700
    Column Headers Row: flex items-center px-4 py-2 text-[11px] text-slate-500
      span.flex-1 (spacer)
      span.w-14.text-center → "앱"
      span.w-14.text-center → "이메일"
    Event Row: flex items-center px-4 py-2.5
      Left: flex items-center gap-2 flex-1 min-w-0
        span.text-sm → event icon
        span.text-sm.text-slate-300 → event label
      Right:
        div.w-14.flex.justify-center → Toggle (inApp, size=sm, disabled when global inApp off)
        div.w-14.flex.justify-center → Toggle (email, size=sm, disabled when global email off or SMTP unconfigured)
```

**Events**:
| Category | Key | Icon | Label | Default inApp | Default email |
|----------|-----|------|-------|---------------|---------------|
| 채팅 | chat_complete | 🔔 | 에이전트 응답 완료 | true | false |
| 채팅 | tool_error | ⚠️ | 도구 호출 실패 | true | false |
| 채팅 | delegation_complete | 🤖 | 위임 완료 | true | false |
| 작업 | job_complete | ✅ | 야간작업 완료 | true | true |
| 작업 | job_error | ❌ | 야간작업 실패 | true | true |
| 시스템 | system | ⚙️ | 시스템 알림 | true | false |

#### Retention Notice
```
p.text-xs.text-slate-500.text-center.py-2
```
Text: "알림은 30일간 보관됩니다"

---

## Responsive Behavior
- Mobile: `p-4`, full-width notification items, comfortable touch targets (min 44px height)
- Desktop: `p-6`, max-w-2xl centered
- Filter pills: always horizontal
- Tab bar: scrollable on mobile if needed

## Accessibility
- All notification items are `<button>` elements (keyboard accessible)
- Focus ring on interactive elements: `focus:ring-2 focus:ring-blue-500/40`
- Toggle switches have proper checked state indication
- Date groups use semantic structure

## Animation
- Skeleton pulse animation for loading state
- Smooth color transitions on hover (transition-colors)
- No layout shift on real-time updates (query invalidation handles it)
