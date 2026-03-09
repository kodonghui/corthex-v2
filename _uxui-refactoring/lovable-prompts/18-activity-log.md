# 18. Activity Log (활동 로그) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Activity Log** page in the CEO app. It provides a chronological feed of everything happening in the virtual AI company — chat interactions, delegation chains, tool calls, scheduled jobs, SNS publishing events, errors, system events, and login events. It is the central audit trail that lets the CEO monitor all agent and user activity in real-time. Employees see only activity related to agents in their assigned departments.

### Data Displayed — In Detail

**Activity feed (main content):**
- A chronological, reverse-sorted list of activity events (newest first)
- Each activity entry shows:
  - **Type** (유형): One of 8 types — chat (채팅), delegation (위임), tool_call (도구 호출), job (예약 작업), sns (SNS), error (에러), system (시스템), login (로그인). Each type should have a distinct visual identifier.
  - **Phase** (단계): start (시작), end (완료), error (에러) — indicates where in the process this event occurred
  - **Actor type** (주체 유형): Who performed the action — user (사용자), agent (에이전트), system (시스템)
  - **Actor name** (주체): Name of the user or agent who performed the action
  - **Action** (행동): Short description of what happened (max 200 chars), e.g. "마케팅 매니저에게 작업 위임", "KIS API 호출 완료"
  - **Detail** (상세): Longer description with additional context (can be multi-line text)
  - **Metadata** (메타데이터): JSON object with extra structured data (accessible on demand if present)
  - **Timestamp** (시각): When the event occurred, shown as relative time (e.g. "5분 전") with exact time on hover

**Summary statistics section:**
- **Today's activity** (오늘): Count of events by type for today
- **This week's activity** (이번 주): Count of events by type for the past 7 days
- Displayed as a compact overview showing which types of activity are most common

**Filters (above the feed):**
- **Type filter**: Dropdown to filter by activity type (chat, delegation, tool_call, job, sns, error, system, login)
- **Text search**: Free text search across action and detail fields
- **Date filter**: "From" date picker to show activities from a specific date forward

**Pagination:**
- Cursor-based infinite scroll or "더 보기" (Load More) button
- Each page loads up to 50 events
- Next page cursor is based on the timestamp of the last item

**Real-time updates:**
- The activity log subscribes to the `activity-log` WebSocket channel
- New events appear at the top of the feed in real-time without manual refresh

### User Actions

1. **Browse activity feed** — scroll through the chronological event list
2. **Filter by type** — select a specific activity type to narrow results
3. **Search activities** — enter text to search across action and detail text
4. **Filter by date** — set a start date to see only recent activity
5. **Expand event details** — click an event to see its full detail text and metadata
6. **Load more events** — scroll to load additional events (cursor-based pagination)
7. **View summary stats** — glance at today's and this week's activity counts by type

### User Actions NOT Available

- Cannot delete or edit activity log entries (read-only audit trail)
- Cannot export activity data
- Cannot create custom activity entries

### UX Considerations

- **Real-time is key**: New activity events should appear live at the top of the feed. This is a monitoring page — the CEO keeps it open to watch what's happening. A subtle indicator for new events arriving is important.
- **Type identification at a glance**: With 8 activity types, each needs to be immediately distinguishable. Use distinct indicators per type so the CEO can scan the feed quickly.
- **Phase awareness**: The phase (start/end/error) provides important context. "시작" means an action began, "완료" means it succeeded, "에러" means it failed. Error-phase events should stand out as they need attention.
- **Detail expansion**: Most events are scannable from action text alone. The detail field should be expandable — collapsed by default, expandable on click to avoid visual clutter.
- **Metadata is for power users**: The JSON metadata should be hidden by default and only shown when explicitly expanded. Most users won't need it.
- **Department scoping transparency**: When an employee views this page, they see a filtered subset. There should be no indication of missing data — the view should feel complete for their scope.
- **Summary stats give quick pulse**: The today/week summary helps the CEO quickly assess activity volume without reading every entry. The summary should be compact and always visible.
- **Infinite scroll or load-more**: The activity feed is potentially very long. Avoid traditional page numbers — use either infinite scroll triggered by scrolling near the bottom, or a "더 보기" button.
- **Timestamps matter**: For an audit trail, precise timestamps are critical. Show relative time ("5분 전") for readability but provide exact time (date + time) on interaction.
- **Empty state**: If no activity exists yet (new company), show an informative state explaining that activity will appear as agents start working.
- **Error highlighting**: Activity events with phase="error" or type="error" should be immediately noticeable. These are operational issues that may need the CEO's attention.
- **Mobile layout**: The activity feed should work well on mobile as a simple scrollable list. Filters should be accessible but not take up too much screen space.
- **Korean language**: All labels, type names, phase names, filter labels, and placeholder text must be in Korean.
- **Loading state**: Show a loading indicator for initial load and for loading more events.

### What NOT to Include on This Page

- No activity creation or editing — this is a read-only audit log
- No detailed agent analytics — that's the Performance page
- No cost information per activity — that's the Costs page
- No notification configuration — that's handled elsewhere
- No activity aggregation or reporting dashboards
- No activity archiving or cleanup tools
