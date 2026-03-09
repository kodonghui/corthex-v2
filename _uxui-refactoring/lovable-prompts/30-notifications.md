# 30. Notifications (알림) — CEO App

> **Route**: `/notifications`
> **App**: CEO App (`app.corthex-hq.com`)

---

## 복사할 프롬프트:

Design the **Notifications (알림)** page for the CEO App. This is where the CEO views all system notifications and configures notification preferences.

---

### Page Purpose

Provide a unified notification center where the CEO can:
1. View all notifications with date grouping and read/unread status
2. Filter to see only unread notifications
3. Mark individual notifications as read, or mark all as read at once
4. Configure per-event notification preferences (in-app and email toggles)

---

### Page Structure

The page has **two tabs**: "알림 목록" (Notification List) and "알림 설정" (Notification Settings). The first tab label dynamically shows the unread count when > 0 (e.g., "알림 목록 (3)").

---

### Tab 1: Notification List (알림 목록)

**Filter Bar**
- Two filter buttons (pill/chip style, toggling between them): "전체" (All) and "미확인만" (Unread Only)
- The active filter is visually highlighted
- A "모두 읽음 ✓" text button on the right side, only visible when unread count > 0. Clicking marks all notifications as read

**Notification Items**
Notifications are grouped by date with group headers:
- "오늘" (Today)
- "어제" (Yesterday)
- Older dates show as localized date format (e.g., "3월 5일")

Each notification item is a clickable row showing:
- **Unread indicator**: a small colored dot on the left for unread items; invisible placeholder for read items (maintains alignment)
- **Type icon**: contextual emoji based on notification type:
  - chat_complete → 🔔
  - delegation_complete → 🤖
  - tool_error → ⚠️
  - job_complete → ✅
  - job_error → ❌
  - system → ⚙️
- **Title text**: bolder/darker for unread items, muted for read items
- **Body text** (optional): secondary text below the title, truncated to one line
- **Relative timestamp**: "방금" (just now), "N분 전", "N시간 전", "N일 전" — positioned on the right

**Item Behavior**
- Clicking an unread notification marks it as read
- If the notification has an action URL, clicking navigates to that URL within the app
- Unread items have a subtle highlighted background to distinguish them from read items

**Real-time Updates**
- New notifications arrive via WebSocket (`notifications` channel) and auto-update the list without page reload
- Both the list and unread count refresh when a real-time event arrives

**States**
- Loading: skeleton placeholder cards
- Empty (all filter): "알림이 없습니다"
- Empty (unread filter): "미확인 알림이 없습니다"

---

### Tab 2: Notification Settings (알림 설정)

**Global Toggles**
A card with two rows:
- 앱 알림 (In-app notifications): toggle switch, default on
- 이메일 알림 (Email notifications): toggle switch, default off. Disabled if SMTP is not configured by the admin

**SMTP Warning Banner**
If email is not configured, show a banner above the settings: "이메일 알림을 사용하려면 관리자에게 SMTP 설정을 요청하세요"

**Per-Event Settings**
Organized into category cards, each with a table-like layout:
- Column headers (right-aligned): 앱, 이메일
- Categories and their events:

  **채팅 (Chat)**
  - 에이전트 응답 완료 (🔔) — default: in-app on, email off
  - 도구 호출 실패 (⚠️) — default: in-app on, email off
  - 위임 완료 (🤖) — default: in-app on, email off

  **작업 (Jobs)**
  - 야간작업 완료 (✅) — default: in-app on, email on
  - 야간작업 실패 (❌) — default: in-app on, email on

  **시스템 (System)**
  - 시스템 알림 (⚙️) — default: in-app on, email off

Each event row has the event icon + label on the left, and two toggle switches (in-app, email) on the right.
- Individual in-app toggles are disabled when the global in-app toggle is off
- Individual email toggles are disabled when the global email toggle is off OR when SMTP is not configured

**Retention Notice**
Below all settings: "알림은 30일간 보관됩니다" (centered, subtle text)

---

### UX Considerations

- Notifications should feel like a modern messaging app's notification center — clean, scannable, not cluttered
- The unread dot + highlighted background creates a clear visual distinction without being aggressive
- Date grouping with relative timestamps makes it easy to scan chronologically
- The settings tab should be a simple, familiar pattern (like iOS/Android notification settings)
- Mobile: the page should feel native — full-width items, comfortable tap targets
- Real-time updates should be seamless — no flash or jarring reload
- Toggle changes save immediately (no "save" button needed) — optimistic UI is fine
