# QA Cycle 35 — Batch 8

**Prefix**: QA-C35-
**Session**: 9c3f76ca-c098-493c-b382-548a87b45fc0
**Pages**: /costs, /trading, /notifications
**Tester**: E2E Agent (Playwright MCP)
**Date**: 2026-03-27

---

## /costs — TC-ACOST-001 through TC-ACOST-011

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-ACOST-001 | PASS | 7d/30d/90d buttons work; data reloads (Daily Avg changes: 7d→$0.01, 30d→$0.00, 90d→$0.00) |
| TC-ACOST-002 | PASS | "이번 달 비용 This Month" card shows $0.09 in USD format |
| TC-ACOST-003 | PASS | "Top Model" card shows $0.09 / claude-sonnet-4-20250514 |
| TC-ACOST-004 | PASS | "일 평균 Daily Avg" card shows calculated value with "Current period projection" |
| TC-ACOST-005 | PASS | "예산 대비 Budget" card shows 590.8% with progress bar |
| TC-ACOST-006 | PASS | "일별 비용 추이 Daily Cost Trend" chart section present; date range visible (2026-03-26 ~ 2026-03-27) |
| TC-ACOST-007 | PASS | "7 Days" / "30 Days" inner chart toggle works; clicking 7 Days makes it [active] and updates data |
| TC-ACOST-008 | PASS | Agent cost table shows: 테스트 역할 / claude-sonnet-4-20250514 / 700 tokens / $0.09 / 7 runs |
| TC-ACOST-009 | PASS | "Export" button renders and responds to click ([active] state) |
| TC-ACOST-010 | PASS | "Export CSV" button renders and responds to click ([active] state) |
| TC-ACOST-011 | SKIP | Cannot test empty state — data exists in DB; would require clearing all cost records |

**Costs Summary**: 10 PASS, 0 FAIL, 1 SKIP

---

## /trading — TC-TRADE-001 through TC-TRADE-011

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-TRADE-001 | PASS | Timeframe buttons 1분/5분/15분/1시간/1일/1주 all render; clicking 1분 makes it [active] |
| TC-TRADE-002 | PASS | Ticker table shows exactly 8 rows: BTC/USD, ETH/USD, SOL/USD, AAPL, NVDA, TSLA, AMZN, GOOGL |
| TC-TRADE-003 | FAIL | Clicking ETH/USD ticker row does NOT update the chart — chart heading remains "BTC/USD 차트" after multiple clicks on ETH/USD row |
| TC-TRADE-004 | PASS | Chart type buttons 캔들/라인/영역 work; each becomes [active] when clicked |
| TC-TRADE-005 | PASS | OHLC badges visible: O: 65,889.20 / H: 68,120.00 / L: 65,400.10 / C: 67,432.50 |
| TC-TRADE-006 | PASS | 매수/매도 toggle works; clicking "매도 Sell" makes it [active] |
| TC-TRADE-007 | FAIL | Entering quantity 0.50 in amount field does NOT recalculate Estimated Cost (stays at $6,743.25 instead of recalculating to $33,716.25) |
| TC-TRADE-008 | PASS | "주문 실행 Execute" button fires and shows toast: "이 기능은 준비 중입니다" (demo mode) |
| TC-TRADE-009 | PASS | Active Strategies section shows 3 strategies: Alpha-7 Arbitrage (ROI: +22.4%, LOW RISK), Beta-V Momentum (ROI: +8.1%, MID RISK), Delta-2 Sentiment (ROI: -0.2%, HIGH RISK) |
| TC-TRADE-010 | PASS | Global Signal Feed shows 2 signals: "WHALE ALERT: 5,000 BTC transfer detected (02m ago)" and "FED RESERVE: Rate maintenance confirmed (14m ago)" |
| TC-TRADE-011 | PASS | Footer shows: "Latency: 14ms" / "Server: Tokyo-AWS-01" / "API Status: 200 OK" |

**Trading Summary**: 9 PASS, 2 FAIL, 0 SKIP

### BUGS found in /trading:
- **BUG-TRADE-003**: Clicking a ticker row in the table does not switch the chart to that ticker. Chart stays on BTC/USD regardless of which row is clicked. Expected: chart heading and OHLC values update to selected ticker.
- **BUG-TRADE-007**: Quantity input change does not recalculate Estimated Cost. Value stays static at initial $6,743.25 even after clearing and typing new quantity (0.50 BTC × $67,432.50 should = $33,716.25). Expected: real-time cost recalculation on input change.

---

## /notifications — TC-NOTIF-001 through TC-NOTIF-011

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-NOTIF-001 | PASS | Notifications load in "Active Stream" group (1 notification today); group header visible |
| TC-NOTIF-002 | PASS | Clicking notification opens detail panel showing "Read" badge; marking as read works |
| TC-NOTIF-003 | PASS | "Open Related Page" button navigates to /chat?session=... (linked chat session) |
| TC-NOTIF-004 | SKIP | "전체 읽음" button only renders when unreadCount > 0; notification already marked read so button not visible |
| TC-NOTIF-005 | PASS | "Unread" filter button works; shows "No unread notifications" when all are read |
| TC-NOTIF-006 | PASS | Tabs: All/Tasks/System work; Tasks shows 1 notification (Agent type), System shows 0 with empty state |
| TC-NOTIF-007 | PASS | Search "테스트" in "Filter alerts..." returns 1 matching notification; "zzz" returns 0 |
| TC-NOTIF-008 | PASS | Footer shows "0 unread" accurately after marking notification as read |
| TC-NOTIF-009 | PASS | Agent type notification shows check-circle icon (orange); "AGENT" type badge visible in list |
| TC-NOTIF-010 | PASS | Empty state shows "No notifications found" (System tab with no system notifications) |
| TC-NOTIF-011 | SKIP | WebSocket real-time notification delivery cannot be simulated in automated E2E test |

**Notifications Summary**: 9 PASS, 0 FAIL, 2 SKIP

---

## Batch 8 Overall Summary

| Page | PASS | FAIL | SKIP | Total |
|------|------|------|------|-------|
| /costs | 10 | 0 | 1 | 11 |
| /trading | 9 | 2 | 0 | 11 |
| /notifications | 9 | 0 | 2 | 11 |
| **TOTAL** | **28** | **2** | **3** | **33** |

---

## Bugs Reported

1. **BUG-TRADE-003** [MEDIUM] `/trading` — Ticker row click does not switch chart: Clicking any ticker row (e.g., ETH/USD, SOL/USD) in the ticker table does not update the chart. Chart heading and OHLC values always remain for BTC/USD.

2. **BUG-TRADE-007** [MEDIUM] `/trading` — Estimated cost not recalculated on quantity input: The "Estimated Cost" field shows a static value ($6,743.25 = 0.10 × $67,432.50). Changing the quantity input to a different value (e.g., 0.50) does not trigger a recalculation. Expected real-time: quantity × price = estimated cost.

---

## Screenshots

- `costs-01-main.png` — /costs page main view
- `trading-01-main.png` — /trading page main view
- `notif-01-main.png` — /notifications page main view
