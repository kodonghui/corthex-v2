# 23. Monitoring (시스템 모니터링) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **System Monitoring** page in the Admin app. It provides a real-time health dashboard showing the server's operational status, memory usage, database connectivity, and recent errors. The page auto-refreshes every 30 seconds to keep data current. This is a read-only dashboard — administrators use it to verify system health and diagnose issues.

### Data Displayed — In Detail

**Page header:**
- Title: "시스템 모니터링"
- Manual refresh button: "새로고침" — shows "새로고침 중..." while fetching

**Four dashboard cards (responsive layout, stacking to single column on mobile):**

1. **Server Status (서버 상태):**
   - Status badge: "ok" (healthy) or error state — visually distinct severity
   - Uptime: Formatted in Korean — days (일), hours (시간), minutes (분). e.g. "3일 14시간 22분"
   - Runtime: The server runtime environment, e.g. "Bun 1.x"
   - Build info: Build number with hash, e.g. "#142 · a3f7c2d"


2. **Memory (메모리):**
   - Usage percentage displayed as a number
   - Visual progress bar showing memory usage with severity levels:
     - Normal state when under 80%
     - Warning state when 80-89%
     - Critical state when 90% or above
   - RSS (Resident Set Size) in MB
   - Heap usage: used / total in MB, e.g. "128 / 256 MB"

3. **Database (데이터베이스):**
   - Status badge: "ok" (healthy) or error state — visually distinct
   - Response time in milliseconds, e.g. "12 ms"

4. **Errors — 24 Hours (에러 — 24시간):**
   - Error count badge: shows count (e.g. "3건") — visually distinct between zero errors (healthy) and any errors (alert)
   - Recent error list: Each entry shows:
     - Timestamp in Korean locale format
     - Error message text (truncated if too long)
   - If no errors: centered message "에러 없음"

### User Actions

1. **View system health** at a glance across four key metrics
2. **Manually refresh** the monitoring data by clicking the refresh button
3. **Monitor memory trends** by watching the usage bar color changes
4. **Review recent errors** to identify and diagnose issues

### UX Considerations

- **Auto-refresh is essential**: Data refreshes every 30 seconds automatically. The refresh button is for immediate manual refresh when the admin wants to check after making changes.
- **Severity indicators**: Memory bar severity thresholds (normal/warning/critical) give instant visual feedback about resource pressure.
- **Error count is the most critical metric**: If errors are occurring, the count badge should draw immediate attention. Zero errors should feel reassuring.
- **Error state handling**: If the monitoring endpoint itself fails, show a clear connection error message rather than a broken/empty page.
- **Loading state**: Show skeleton placeholders for all four cards while data is being fetched initially.
- **Build info helps with debugging**: The build number and hash help administrators verify which version is deployed and correlate issues with specific releases.
- **No company selection required**: Unlike most admin pages, monitoring shows system-wide server health, not company-specific data.
- **Korean language**: All labels and text in Korean.
- **Mobile**: Cards should stack to a single column on mobile. All cards should be full-width.
- **Dark mode**: Memory bar, status badges, and error text need to be clearly readable in dark mode.

### What NOT to Include on This Page

- No historical performance graphs or time-series charts
- No CPU usage monitoring
- No network/request throughput metrics
- No log viewer or log search
- No alerting or notification configuration
- No WebSocket connection monitoring
- No per-tenant or per-company health breakdown
- No agent status or agent-level monitoring — that's the CEO app's domain
