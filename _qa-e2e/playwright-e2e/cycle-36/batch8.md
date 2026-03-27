# Cycle 36 — Batch 8 Results

**Tester**: Claude Sonnet 4.6 (Playwright MCP)
**Session**: c57fcf48-b31f-4586-89be-804b43704e23
**Viewport**: 1440x900 (desktop default), 390x844 (mobile TCs)
**App URL**: http://localhost:5174
**Login**: admin / admin1234
**Pages tested**: /knowledge, /jobs, /settings, /costs, /trading, /notifications

---

## Summary

| Page | PASS | FAIL | SKIP/WARN |
|------|------|------|-----------|
| /knowledge (TC-KNOW) | 16 | 1 | 3 |
| /jobs (TC-JOBS) | 17 | 1 | 4 |
| /settings (TC-ASET) | 11 | 1 | 1 |
| /costs (TC-ACOST) | 11 | 0 | 0 |
| /trading (TC-TRADE) | 10 | 1 | 0 |
| /notifications (TC-NOTIF) | 10 | 0 | 1 |
| **TOTAL** | **75** | **4** | **9** |

---

## /knowledge — TC-KNOW-001 ~ 020

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-KNOW-001 | PASS | Page loads, sidebar with folders, doc list visible |
| TC-KNOW-002 | PASS | Folder navigation — clicking folder updates doc list |
| TC-KNOW-003 | PASS | Folder create: "QA-V1-Folder" created successfully |
| TC-KNOW-004 | PASS | Folder rename dialog opens, rename works |
| TC-KNOW-005 | PASS | Folder delete with confirmation dialog |
| TC-KNOW-006 | PASS | Doc list shows title, size, date columns |
| TC-KNOW-007 | PASS | Doc search input filters list by keyword |
| TC-KNOW-008 | PASS | Sort by name/date/size toggle works |
| TC-KNOW-009 | PASS | Create doc button → dialog with name, content, type fields |
| TC-KNOW-010 | FAIL | Doc upload: file input exists but upload action returns no success feedback / error handling unclear |
| TC-KNOW-011 | PASS | Click doc row → detail panel opens at 1440px viewport |
| TC-KNOW-012 | PASS | Detail panel shows title, content, metadata |
| TC-KNOW-013 | PASS | Edit doc → content editable, save updates doc |
| TC-KNOW-014 | WARN(empty) | Version history tab visible but no version data in seed |
| TC-KNOW-015 | WARN(no data) | Related docs section empty — no cross-references in seed |
| TC-KNOW-016 | WARN(no data) | Embedding search returns no results — no embeddings in fresh DB |
| TC-KNOW-017 | PASS | Mobile (390x844): sidebar hidden by default, hamburger opens overlay |
| TC-KNOW-018 | PASS | Mobile: sidebar closes after folder selection |
| TC-KNOW-019 | PASS | Pagination controls visible; PAGE_SIZE=20 |
| TC-KNOW-020 | PASS | Empty folder shows "이 폴더에 문서가 없습니다" + create button |

**PASS: 16 / FAIL: 1 / WARN: 3**

---

## /jobs — TC-JOBS-001 ~ 022

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-JOBS-001 | PASS | 야간 작업 tab shows one-time job list |
| TC-JOBS-002 | PASS | 반복 스케줄 tab shows schedule list |
| TC-JOBS-003 | PASS | ARGOS 트리거 tab shows trigger list |
| TC-JOBS-004 | PASS | Create Job dialog: agent selector, instruction text, scheduled time |
| TC-JOBS-005 | PASS | Submit creates job → POST /workspace/jobs → success toast |
| TC-JOBS-006 | PASS | Future time picker works; job queued with correct time |
| TC-JOBS-007 | PASS | Status badges: queued/processing/completed/failed with color coding |
| TC-JOBS-008 | WARN | Progress bar visible on processing jobs; WebSocket live update not observable in test |
| TC-JOBS-009 | FAIL | "Mark as read" button (⋮ menu) — button toggles active state but no dropdown/action menu appears |
| TC-JOBS-010 | WARN | Cancel/Delete — delete dialog appears for some jobs; blocked/completed jobs show different actions |
| TC-JOBS-011 | PASS | Create schedule form: name, instruction, frequency, time |
| TC-JOBS-012 | PASS | Frequency: daily/weekdays/custom; custom shows days-of-week selector |
| TC-JOBS-013 | PASS | Toggle schedule on/off — isActive toggled via switch |
| TC-JOBS-014 | PASS | Edit schedule — form pre-filled with existing values |
| TC-JOBS-015 | PASS | Create ARGOS trigger: type, condition, agent fields |
| TC-JOBS-016 | PASS | Trigger type change: price-above/below/market-open/close updates condition fields |
| TC-JOBS-017 | WARN | Toggle trigger on/off — switch present but toggle feedback inconsistent |
| TC-JOBS-018 | PASS | Chain job: multi-step form with add/remove step buttons |
| TC-JOBS-019 | PASS | Search jobs by instruction/agent name |
| TC-JOBS-020 | PASS | Filter by status dropdown: All/대기/진행중/완료/실패 |
| TC-JOBS-021 | PASS | Stats cards: 완료/실행중/활성스케줄/오류알림 counts displayed |
| TC-JOBS-022 | WARN | WebSocket real-time: connection established but no live status changes during static test |

**PASS: 17 / FAIL: 1 / WARN: 4**

---

## /settings — TC-ASET-001 ~ 013

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-ASET-001 | PASS | 일반 tab: username (admin), email (admin@corthex.io), name, role fields |
| TC-ASET-002 | PASS | Edit name → 이름 저장 → PATCH /workspace/profile → "저장되었습니다" toast |
| TC-ASET-003 | PASS | Password change: min 6 chars validation, must-match validation |
| TC-ASET-004 | PASS | 테마 tab: system/light/dark selector with radio buttons |
| TC-ASET-005 | PASS | 알림 설정 tab: notification type toggles (handoff, agent, job, system) |
| TC-ASET-006 | PASS | 허브 tab: hub configuration options visible |
| TC-ASET-007 | PASS | API 연동 tab: provider key management (Claude, OpenAI, etc.) |
| TC-ASET-008 | PASS | 텔레그램 tab: bot token input + test button visible |
| TC-ASET-009 | SKIP | Telegram test connection: no real bot token available in test environment |
| TC-ASET-010 | PASS | **CONFIRMED FIX**: 소울 편집 tab loads editor without crash; markdown content + preview panel visible, line numbers working |
| TC-ASET-011 | PASS | MCP 연동 tab: MCP server configuration UI visible |
| TC-ASET-012 | PASS | Mobile (390x844): 8 tabs (일반/테마/알림 설정/허브/API 연동/텔레그램/소울 편집/MCP 연동) horizontally scrollable |
| TC-ASET-013 | FAIL | Unsaved changes navigation: inline warning "저장하지 않은 변경사항이 있습니다" shows, BUT useBlocker does NOT prevent navigation — clicking nav link navigates away without confirm dialog |

**PASS: 11 / FAIL: 1 / SKIP: 1**

**Key finding**: TC-ASET-010 (soul editor crash) is CONFIRMED FIXED. TC-ASET-013 (useBlocker navigation guard) is a REMAINING BUG — the guard shows a warning but doesn't intercept navigation.

---

## /costs — TC-ACOST-001 ~ 011

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-ACOST-001 | PASS | Time tabs 7d/30d/90d — each reloads cards ("Updated Xd ago" changes) |
| TC-ACOST-002 | PASS | 이번 달 비용 card: shows $0.00 (fresh DB, no cost data) |
| TC-ACOST-003 | PASS | Top Model card: "Anthropic (Claude)" shown as default |
| TC-ACOST-004 | PASS | 일 평균 card: $0.00 with "Current period projection" |
| TC-ACOST-005 | PASS | 예산 대비 card: 0.0% progress bar, $0/$500 budget range |
| TC-ACOST-006 | PASS | Daily Cost Trend section renders with "데이터가 없습니다" (fresh DB, expected) |
| TC-ACOST-007 | PASS | Chart 7 Days / 30 Days toggle — button active state changes |
| TC-ACOST-008 | PASS | Agent Cost Breakdown table renders with "데이터 없음" row, correct columns (Agent Name / Model / Tokens / Cost USD / Runs) |
| TC-ACOST-009 | PASS | Export button clickable (no download in headless but action fires) |
| TC-ACOST-010 | PASS | Export CSV button clickable (no download in headless but action fires) |
| TC-ACOST-011 | PASS | Empty state: "데이터가 없습니다" in chart, "데이터 없음" in table |

**PASS: 11 / FAIL: 0**

---

## /trading — TC-TRADE-001 ~ 011

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-TRADE-001 | PASS | Timeframe tabs: 1분/5분/15분/1시간/1일/1주 — click switches active tab |
| TC-TRADE-002 | PASS | Ticker table: 8 rows — BTC/USD, ETH/USD, SOL/USD, AAPL, NVDA, TSLA, AMZN, GOOGL with prices |
| TC-TRADE-003 | FAIL | Click ticker row — chart header stays BTC/USD, does not switch to clicked ticker (demo data limitation) |
| TC-TRADE-004 | PASS | Chart type: 캔들/라인/영역 buttons toggle correctly (active state changes) |
| TC-TRADE-005 | PASS | OHLC badges displayed: O: 65,889.20 / H: 68,120.00 / L: 65,400.10 / C: 67,432.50 |
| TC-TRADE-006 | PASS | 매수 Buy / 매도 Sell toggle — Sell highlights red when selected |
| TC-TRADE-007 | PASS | Quantity (0.10 BTC) + Price (67,432.50 USD) → Estimated Cost $6,743.25 calculated |
| TC-TRADE-008 | PASS | 주문 실행 Execute button clickable (demo mode — no order API call expected) |
| TC-TRADE-009 | PASS | ACTIVE STRATEGIES: 3 entries — Alpha-7 Arbitrage (+22.4% LOW RISK), Beta-V Momentum (+8.1% MID RISK), Delta-2 Sentiment (-0.2% HIGH RISK) |
| TC-TRADE-010 | PASS | GLOBAL SIGNAL FEED: 2 signals — "WHALE ALERT: 5,000 BTC transfer detected" (02m ago / MACRO), "FED RESERVE: Rate maintenance confirmed" (14m ago / FIAT) |
| TC-TRADE-011 | PASS | Footer: LATENCY: 14MS / SERVER: TOKYO-AWS-01 / API STATUS: 200 OK |

**PASS: 10 / FAIL: 1**

Note: TC-TRADE-003 ticker switch is a demo page limitation — data is static/hardcoded.

---

## /notifications — TC-NOTIF-001 ~ 011

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-NOTIF-001 | PASS | Notifications load: 2 items listed — "개발팀장이(가) 위임 작업을 완료했습니다" + "비서실장이(가) 응답을 완료했습니다" |
| TC-NOTIF-002 | PASS | Click notification → marked as read (unread count 2→1); detail panel opens on right |
| TC-NOTIF-003 | PASS | "Open Related Page" action button visible in detail panel |
| TC-NOTIF-004 | PASS | "Mark all read" button → POST /read-all → all marked read, sidebar badge removed, unread count → 0 |
| TC-NOTIF-005 | PASS | Unread filter tab — shows only unread notifications |
| TC-NOTIF-006 | PASS | Tabs: All / Tasks / System / All / Unread — each filters correctly |
| TC-NOTIF-007 | PASS | Search "비서" → filters to 1 record (비서실장이(가) 응답을 완료했습니다) |
| TC-NOTIF-008 | PASS | Unread badge count accurate: sidebar shows "2", decrements on read, reaches 0 after read-all |
| TC-NOTIF-009 | PASS | TYPE_ICON_STYLE: Handoff type uses arrows icon (purple), Agent type uses checkmark icon (amber/gold) |
| TC-NOTIF-010 | PASS | Empty state after search with no results: "No unread notifications" message displayed |
| TC-NOTIF-011 | WARN | Real-time new notification: WebSocket connection active, but no new notification arrived during static test window |

**PASS: 10 / FAIL: 0 / WARN: 1**

---

## Bug Inventory

| Bug ID | TC | Severity | Description |
|--------|-----|----------|-------------|
| BUG-B8-001 | TC-ASET-013 | MEDIUM | useBlocker navigation guard shows inline warning but does NOT intercept navigation — clicking nav link navigates away without confirm dialog |
| BUG-B8-002 | TC-JOBS-009 | LOW | ⋮ more-actions button in jobs list toggles active state but dropdown/context menu does not appear (mark-as-read action inaccessible via UI) |
| BUG-B8-003 | TC-TRADE-003 | LOW | Clicking ticker row does not switch chart to selected ticker — chart always shows BTC/USD (demo page limitation, may be intentional) |
| BUG-B8-004 | TC-KNOW-010 | LOW | Knowledge doc file upload — upload input present but success/error feedback unclear after selecting file |

---

## Confirmed Fix

- **TC-ASET-010 (Soul Editor Crash)**: CONFIRMED FIXED. The 소울 편집 tab now loads the editor without any crash. Markdown content is displayed with line numbers and a live preview panel. Previously this was crashing due to a `useBlocker` issue. The editor renders correctly.

---

## Cleanup

- Name "관리자 QA" → restored to "관리자" (saved via PATCH /workspace/profile)
- No QA-V1- prefixed test items left in notifications (notifications are system-generated)
- QA-V1- items created in /knowledge and /jobs pages remain from earlier test batches (cleanup per batch instructions)
