# 28. Cron Base — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

The Cron Base page (크론기지) is the CEO's control panel for recurring automated tasks. The CEO can schedule AI agents to execute instructions on a repeating basis — daily briefings, weekly reports, hourly monitoring, or any custom cron schedule. The system runs these tasks automatically, and the CEO can review execution history for each schedule.

Think of it as: **"Set it and forget it — your AI employees work on autopilot."** Unlike one-time commands (Command Center) or condition-triggered tasks (ARGOS), cron schedules run at fixed times repeatedly.

---

### Data Displayed — In Detail

**1. Page Header**
- Page title: "크론기지"
- Subtitle describing the page's purpose
- "크론 추가" (Add Cron) button

**2. Schedule List (main content)**
- A list of all cron schedules the CEO has created
- Each schedule card shows:
  - Active/inactive status indicator
  - Schedule name (or instruction text preview if unnamed)
  - Assigned agent name
  - Instruction text (truncated)
  - Cron schedule description in Korean (e.g., "매일 09:00", "평일 09:00", "매시 정각")
  - Next run time (relative, e.g., "3시간 22분 후") — only shown for active schedules
  - Last run time (formatted date)
  - Actions: 편집 (edit), 중지/시작 (toggle active/inactive), 삭제 (delete)
- Clicking a schedule card expands it to show execution history below
- Inactive schedules appear visually dimmed
- Loading state: skeleton cards while schedules load
- Empty state: message encouraging the CEO to create their first cron schedule

**3. Execution History (expanded panel within a schedule card)**
- Appears inline below the schedule card when expanded
- Header showing "실행 기록" with total run count
- Each run entry shows:
  - Status badge: 실행중 (running, with progress bar if available), 성공 (success), 실패 (failed)
  - Start time (formatted date)
  - Duration in seconds (for completed runs)
  - Token usage count
  - Cost in USD
  - For running jobs: animated progress bar or "실행중..." indicator (via WebSocket)
  - For failed jobs: error message preview (truncated)
  - For successful jobs: result text preview (truncated)
- Pagination controls (10 runs per page, prev/next buttons with page indicator)
- Loading state while runs fetch
- Empty state when no runs exist yet

**4. Schedule Create/Edit Modal**
- Opens when clicking "크론 추가" or "편집" on an existing schedule
- Fields:
  - Schedule name (text input, e.g., "매일 아침 시황 브리핑")
  - Assigned agent (dropdown showing agent name, secretary badge, and role)
  - Instruction (multi-line text — what the agent should do)
  - Execution frequency with 3 input modes (tab-switchable):
    - **프리셋 (Preset)**: 6 common presets shown as selectable cards:
      - 매일 오전 9시, 매일 오후 6시, 매일 밤 10시, 평일 오전 9시, 매시 정각, 주 1회 (월 09:00)
    - **직접 입력 (Custom)**: Raw cron expression input with format help (분 시 일 월 요일)
      - Shows Korean description of the entered expression (e.g., "→ 평일 09:00")
    - **간편 설정 (Simple)**: User-friendly time/frequency picker
      - Time picker (HH:MM)
      - Frequency radio buttons: 매일 (daily), 평일 (weekdays), 특정 요일 (custom)
      - Day-of-week selector: 7 circular buttons (일~토), shown only for "특정 요일"
      - Validation: at least 1 day must be selected for custom frequency
  - A summary box showing the resolved schedule description
- Validation: name, agent, instruction, and frequency all required
- Buttons: 취소 (cancel), 등록/수정 (submit)
- Closes on Escape key or backdrop click

**5. Delete Confirmation Dialog**
- Confirms before deleting a schedule
- Warns that execution history will also be deleted

---

### User Actions

**Primary:**
1. **Create a new cron schedule** — define what to do, when, and which agent does it
2. **View execution history** — expand a schedule card to see past runs
3. **Monitor running jobs** — see live progress of currently executing scheduled jobs

**Secondary:**
4. **Toggle schedule active/inactive** — pause or resume a schedule without deleting it
5. **Edit a schedule** — modify the instruction, agent, timing, or name
6. **Delete a schedule** — remove a schedule and its execution history

**Tertiary:**
7. **Switch frequency input mode** — toggle between preset, custom cron, and simple picker
8. **Browse run history pages** — navigate through paginated execution records
9. **Review run details** — see results or errors from past executions

---

### UX Considerations

- **Three frequency input modes**: The CEO has different levels of technical comfort. Presets are for quick setup ("매일 오전 9시"), simple mode is for non-technical users ("time + weekday picker"), and custom mode is for power users who know cron syntax. The CEO can switch freely between modes.
- **Real-time job progress**: When a scheduled job is currently running, its progress appears live via WebSocket — including a progress bar and status message. This gives the CEO confidence that the system is working.
- **Cron expression readability**: Raw cron expressions (e.g., "0 9 * * 1-5") are always converted to readable Korean (e.g., "평일 09:00"). The CEO should never need to parse cron syntax unless they choose custom mode.
- **Next run countdown**: Active schedules show when they'll next execute, as a relative time ("3시간 22분 후"). This is the single most important piece of information for an active schedule.
- **Expand-in-place pattern**: Execution history expands below the schedule card, keeping the card's context visible. This avoids a separate page navigation for viewing history.
- **Mobile responsiveness**: Schedule cards should be full-width on mobile. The modal should be full-screen on small devices. Day-of-week buttons should remain in a single row.
- **Loading states**: The schedule list and each schedule's run history have independent loading states.
- **Empty states**: Empty schedule list guides the CEO to create their first schedule. Empty run history says "no runs yet" without alarming the CEO.
- **Preset mode default**: When creating a new schedule, the preset mode should be the default starting point — it's the fastest path to setting up a common schedule.
- **Auto-polling**: Schedule data refreshes every 30 seconds to keep "next run" times accurate and catch newly completed runs.

---

### What NOT to Include on This Page

- No one-time job execution (that's Jobs page or Command Center)
- No condition-based triggering (that's ARGOS — cron is time-based, not event-based)
- No agent configuration (that's Admin)
- No job result detail view with full report (results are previewed inline; full details are in the reports system)
- No cost analytics or budget tracking (that's Costs page)
