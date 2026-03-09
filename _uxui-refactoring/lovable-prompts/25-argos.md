# 25. ARGOS — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

ARGOS is the CEO's automated intelligence gathering system — a set of user-defined "triggers" that monitor real-world conditions (stock prices, news keywords, market open/close times, custom schedules) and automatically execute AI agent instructions when conditions are met.

Think of it as: **"If [condition], then [tell this AI agent to do this]."** The CEO sets up monitoring rules, and ARGOS watches 24/7, firing off agent tasks when thresholds are crossed. This page lets the CEO manage those triggers and review their event history.

---

### Data Displayed — In Detail

**1. Page Header**
- Page title: "ARGOS"
- Subtitle describing the system's purpose
- "트리거 추가" (Add Trigger) button

**2. System Status Bar (4 indicator cards)**
- **데이터 (Data)**: Whether the data pipeline is operational (OK or NG)
- **AI**: Whether the AI execution engine is operational (OK or NG)
- **활성 트리거 (Active Triggers)**: Count of currently active triggers
- **오늘 비용 (Today's Cost)**: Total cost incurred by ARGOS today in USD
- Status cards for Data and AI use a clear OK/NG visual distinction
- Timestamp showing when the system was last checked

**3. Trigger List (main content)**
- A list of all triggers the CEO has created
- Each trigger card shows:
  - Active/inactive status indicator
  - Trigger name (or instruction text preview if unnamed)
  - Trigger type badge — one of: 가격 감시, 가격 상한, 가격 하한, 뉴스 감시, 정기 수집, 장 시작, 장 마감, 커스텀
  - Assigned agent name
  - Condition summary in Korean (e.g., "삼성전자 70000이상", "키워드: AI, 반도체 (하나 이상)")
  - Instruction text (what the agent should do when triggered)
  - Cooldown period in minutes
  - Last triggered time (relative, e.g., "3시간 전")
  - Total event count
  - Actions: 편집 (edit), 중지/시작 (toggle), 삭제 (delete)
- Clicking a trigger card selects it and opens its event history in the section below
- A recently-fired trigger gets a brief highlight animation (via WebSocket event)
- Inactive triggers appear visually dimmed
- Loading state: skeleton cards while triggers load
- Empty state: message encouraging the CEO to create their first trigger

**4. Event Log Section (below trigger list, shown when any triggers exist)**
- Displays the execution history for the selected trigger
- Tab controls: "전체" (All events) vs "오류" (Failed events only)
- Additional status filter dropdown
- Each event row shows:
  - Status badge: 감지됨 (detected), 실행중 (executing), 완료 (completed), 실패 (failed)
  - Trigger name
  - Event timestamp
  - Duration in seconds (for completed/failed events)
  - Expandable: clicking an event row expands to show full details including event data, result text or error message, and linked command ID
- Pagination controls for the event list (10 per page)
- Loading state while events fetch

**5. Trigger Create/Edit Modal**
- Opens when clicking "트리거 추가" or "편집" on an existing trigger
- Fields:
  - Trigger name (text input)
  - Assigned agent (dropdown of available agents, showing name, secretary badge, and role)
  - Instruction (multi-line text — what the agent should do)
  - Trigger type (dropdown: 가격 감시, 가격 상한, 가격 하한, 뉴스 감시, 정기 수집, 장 시작, 장 마감, 커스텀)
  - Dynamic condition fields that change based on trigger type:
    - **Price types**: stock ticker, market (KR/US), operator (이상/이하/% 변동), target value
    - **News**: keyword list (comma-separated), match mode (하나 이상/모두 포함)
    - **Schedule**: interval in minutes
    - **Market open/close**: market selection (KR/US)
    - **Custom**: field name, operator, value
  - Cooldown period in minutes
- Buttons: 취소 (cancel), 등록/수정 (submit)
- Closes on Escape key or backdrop click

**6. Delete Confirmation Dialog**
- Confirms before deleting a trigger
- Warns that related event history will also be deleted

---

### User Actions

**Primary:**
1. **Create a new trigger** — define monitoring conditions and the agent instruction to execute
2. **View trigger event history** — click a trigger card to see its past executions
3. **Monitor system health** — check Data/AI status indicators at the top

**Secondary:**
4. **Toggle trigger active/inactive** — pause or resume monitoring without deleting
5. **Edit a trigger** — modify conditions, instruction, agent assignment, or cooldown
6. **Delete a trigger** — remove a trigger and its event history
7. **Filter events** — switch between all events and failures only, or filter by specific status
8. **Expand event details** — click an event row to see full result or error information
9. **Browse event pages** — navigate through paginated event history

---

### UX Considerations

- **Real-time updates**: ARGOS events fire via WebSocket. When a trigger fires, the corresponding trigger card briefly highlights and a toast notification appears. Event lists refresh automatically when new events arrive.
- **System health at a glance**: The status bar immediately tells the CEO whether ARGOS is operational. Data or AI being "NG" is a serious issue — the visual treatment should convey urgency.
- **Condition readability**: Raw condition data (JSON) must never be shown to the CEO. Conditions are always displayed in natural Korean (e.g., "삼성전자 70,000 이상" instead of `{"ticker":"005930","operator":"above","value":70000}`).
- **Trigger-event relationship**: Selecting a trigger shows only that trigger's events. This master-detail pattern should be clear — the CEO should understand which trigger's events they're viewing.
- **Dynamic form fields**: The create/edit modal changes its condition input fields based on the selected trigger type. This should feel natural, not jarring.
- **Mobile responsiveness**: Status bar cards should stack to 2×2 on mobile. Trigger cards and event rows should remain readable on small screens.
- **Loading and empty states**: Both trigger list and event list have independent loading states. Empty state for triggers should guide the CEO to create their first trigger.
- **Cooldown explanation**: Cooldown prevents a trigger from firing too frequently (e.g., a price trigger won't re-fire for N minutes after executing). This should be understandable without technical explanation.

---

### What NOT to Include on This Page

- No stock charts or portfolio management (that's Strategy Room / Trading)
- No cron/scheduled recurring jobs (that's Cron page — ARGOS is event-driven, not schedule-driven, though it supports periodic checking)
- No agent configuration (that's Admin)
- No manual command execution (that's Command Center)
- No notification preferences (that's Settings)
