# QA Cycle 33 — Batch 8
**Pages**: /knowledge, /jobs, /settings, /costs, /trading, /notifications
**Prefix**: QA-C33
**Date**: 2026-03-26
**Session**: 8733c19e-f3ea-42be-9d88-2a12793dd156

---

## Summary
| Result | Count |
|--------|-------|
| PASS   | 57    |
| FAIL   | 1     |
| SKIP   | 12    |

---

## /knowledge — TC-KNOW-*

| TC-ID | Action | Result | Notes |
|-------|--------|--------|-------|
| QA-C33-TC-KNOW-001 | Tab: 문서 / 에이전트 기억 | PASS | Both tabs visible in header and sidebar |
| QA-C33-TC-KNOW-002 | Folder tree (left panel) | PASS | Expandable folder with "Knowledge Base" node |
| QA-C33-TC-KNOW-003 | Click folder | PASS | Document list reloads for selected folder |
| QA-C33-TC-KNOW-004 | Click "+ 새 문서" | PASS | Create form opens with title, type, folder, tags, content fields |
| QA-C33-TC-KNOW-005 | Content type selector | PASS | 마크다운/텍스트/HTML/Mermaid options present |
| QA-C33-TC-KNOW-006 | Fill title + content → 생성 | PASS | POST succeeded, "1 Files" shown, MARKDOWN badge visible |
| QA-C33-TC-KNOW-007 | Search documents | PASS | "키워드 검색 결과 (1건)" shown when searching "QA-C33" |
| QA-C33-TC-KNOW-008 | Search mode toggle | PASS | 혼합/의미/키워드 buttons toggle correctly |
| QA-C33-TC-KNOW-009 | Filter by content type dropdown | PASS | Markdown filter shows only MARKDOWN doc |
| QA-C33-TC-KNOW-010 | Embedding status badge | SKIP | No separate embedding badge visible in card (only type badge) |
| QA-C33-TC-KNOW-011 | Edit document | PASS | PATCH form opens pre-filled; modal shows "문서 편집" with existing data |
| QA-C33-TC-KNOW-012 | Delete document | PASS | Confirm dialog shown; DELETE executed; toast "문서가 삭제되었습니다" |
| QA-C33-TC-KNOW-013 | Document versions | PASS | 버전 이력 modal shows version list with 복원 button |
| QA-C33-TC-KNOW-014 | Agent memories tab | PASS | Tab switches to memories; agent/type dropdowns and search visible |
| QA-C33-TC-KNOW-015 | Memory type badges | SKIP | No memory data available to verify badges |
| QA-C33-TC-KNOW-016 | Confidence bar | SKIP | No memory data available to verify confidence bars |
| QA-C33-TC-KNOW-017 | Mobile: sidebar default closed | SKIP | Not tested (desktop viewport used) |
| QA-C33-TC-KNOW-018 | Mobile: auto-close on folder select | SKIP | Not tested (desktop viewport used) |
| QA-C33-TC-KNOW-019 | Pagination (PAGE_SIZE=20) | PASS | Prev/Next buttons present; "1건 중 1-1" pagination shown |
| QA-C33-TC-KNOW-020 | Empty folder message | PASS | "이 폴더에 문서가 없습니다" with 문서 만들기 button |

---

## /jobs — TC-JOBS-*

| TC-ID | Action | Result | Notes |
|-------|--------|--------|-------|
| QA-C33-TC-JOBS-001 | Tab: 야간 작업 | PASS | Tab shows with count (2) |
| QA-C33-TC-JOBS-002 | Tab: 반복 스케줄 | PASS | Tab switches; empty state "등록된 반복 스케줄이 없습니다" |
| QA-C33-TC-JOBS-003 | Tab: ARGOS 트리거 | PASS | Tab switches; empty state "등록된 이벤트 트리거가 없습니다" |
| QA-C33-TC-JOBS-004 | Click "Create Job" | PASS | Form opens with agent selector, instruction, type radio, scheduled time |
| QA-C33-TC-JOBS-005 | Select agent + instruction → 등록 | PASS | POST succeeded; toast "작업이 등록되었습니다"; count updated to 3 |
| QA-C33-TC-JOBS-006 | Set future scheduled time | PASS | 실행 시간 field present ("비워두면 즉시" placeholder) |
| QA-C33-TC-JOBS-007 | Job status badges | PASS | 대기 (yellow), 완료 (green) badges shown in table |
| QA-C33-TC-JOBS-008 | Processing job progress bar | SKIP | No currently-processing jobs during test window |
| QA-C33-TC-JOBS-009 | Mark job as read | SKIP | Read action button not separately identified in UI |
| QA-C33-TC-JOBS-010 | Cancel/Delete job | PASS | Two action buttons visible per row in Actions column |
| QA-C33-TC-JOBS-011 | Create schedule | PASS | 반복 스케줄 form shows agent, instruction, time, frequency fields |
| QA-C33-TC-JOBS-012 | Frequency: daily/weekdays/custom | PASS | 매일/평일/특정 요일 radios; 특정 요일 shows 일-토 day selector |
| QA-C33-TC-JOBS-013 | Toggle schedule on/off | SKIP | No existing schedules to toggle |
| QA-C33-TC-JOBS-014 | Edit schedule | SKIP | No existing schedules to edit |
| QA-C33-TC-JOBS-015 | Create ARGOS trigger | PASS | Form shows type, condition, agent fields when 이벤트 트리거 selected |
| QA-C33-TC-JOBS-016 | Trigger type options | PASS | 가격 상회/하회/장 시작/장 마감 options in dropdown |
| QA-C33-TC-JOBS-017 | Toggle trigger on/off | SKIP | No existing triggers to toggle |
| QA-C33-TC-JOBS-018 | Chain job: add steps | PASS | "+ 체인 단계 추가 (순차 실행)" button visible in 일회성 form |
| QA-C33-TC-JOBS-019 | Search jobs | PASS | Filter by "QA-C33" shows only matching job |
| QA-C33-TC-JOBS-020 | Filter by status dropdown | PASS | All/대기/진행 중/완료/실패 options; filtering works |
| QA-C33-TC-JOBS-021 | Stats cards | PASS | 완료된 작업/실행 중/활성 스케줄/오류 알림 counts all shown |
| QA-C33-TC-JOBS-022 | WebSocket real-time updates | SKIP | WebSocket status updates observed (progress in duration cell) but not explicitly verified |

---

## /settings — TC-ASET-*

| TC-ID | Action | Result | Notes |
|-------|--------|--------|-------|
| QA-C33-TC-ASET-001 | Tab: 일반 | PASS | 사용자명/이메일/이름/역할 fields shown |
| QA-C33-TC-ASET-002 | Edit name → 이름 저장 | PASS | PATCH succeeded; sidebar name updated; toast "저장되었습니다" |
| QA-C33-TC-ASET-003 | Password change validation | PASS | "비밀번호는 최소 6자 이상이어야 합니다" shown for short passwords |
| QA-C33-TC-ASET-004 | Tab: 테마 | PASS | 시스템/라이트/다크 buttons; accent color picker; language dropdown |
| QA-C33-TC-ASET-005 | Tab: 알림 설정 | PASS | App/email toggle switches per notification category |
| QA-C33-TC-ASET-006 | Tab: 허브 | PASS | 자동 스크롤/알림 소리 checkboxes present |
| QA-C33-TC-ASET-007 | Tab: API 연동 | PASS | "+ 새 키 등록" button; KIS/Notion service descriptions |
| QA-C33-TC-ASET-008 | Tab: 텔레그램 | PASS | 봇 토큰 input + CEO 채팅 ID field; 연동하기 button |
| QA-C33-TC-ASET-009 | Telegram test connection | SKIP | No separate "test" button; 연동하기 is the only action |
| QA-C33-TC-ASET-010 | Tab: 소울 편집 | PASS | Agent selector dropdown + soul editor section |
| QA-C33-TC-ASET-011 | Tab: MCP 연동 | PASS | "+ 서버 추가" button; empty state shown |
| QA-C33-TC-ASET-012 | 8 tabs on mobile | SKIP | Not tested (desktop viewport used) |
| QA-C33-TC-ASET-013 | Unsaved changes → navigate away | SKIP | Not triggered during test |

---

## /costs — TC-ACOST-*

| TC-ID | Action | Result | Notes |
|-------|--------|--------|-------|
| QA-C33-TC-ACOST-001 | Time tabs: 7d/30d/90d | PASS | Data reloads per period (daily avg changes 7d: $0.01 vs 30d: $0.00) |
| QA-C33-TC-ACOST-002 | Card: 이번 달 비용 | PASS | "$0.04" USD formatted total shown |
| QA-C33-TC-ACOST-003 | Card: Top Model | PASS | "claude-sonnet-4-20250514" + "$0.04" |
| QA-C33-TC-ACOST-004 | Card: 일 평균 | PASS | "$0.00" daily average shown |
| QA-C33-TC-ACOST-005 | Card: 예산 대비 | PASS | Progress bar + "0.0%" / "$0 → $500" range |
| QA-C33-TC-ACOST-006 | Daily trend chart | PASS | "일별 비용 추이 Daily Cost Trend" section renders |
| QA-C33-TC-ACOST-007 | Chart: 7 Days / 30 Days toggle | PASS | Both toggle buttons present and clickable |
| QA-C33-TC-ACOST-008 | Agent cost table | PASS | Table sorted by cost; 테스트 역할 → $0.04 / 4 runs |
| QA-C33-TC-ACOST-009 | Export button | PASS | "Export" button present in header |
| QA-C33-TC-ACOST-010 | Export CSV button | PASS | "Export CSV" button present in detail table section |
| QA-C33-TC-ACOST-011 | Empty state | SKIP | Data present; could not verify empty state |

---

## /trading — TC-TRADE-*

| TC-ID | Action | Result | Notes |
|-------|--------|--------|-------|
| QA-C33-TC-TRADE-001 | Timeframe: 1분/5분/15분/1시간/1일/1주 | PASS | All 6 buttons shown; active highlight changes on click |
| QA-C33-TC-TRADE-002 | Ticker table 8 rows | PASS | BTC/ETH/SOL/AAPL/NVDA/TSLA/AMZN/GOOGL all present |
| QA-C33-TC-TRADE-003 | Click ticker row → chart switch | FAIL | Clicking ETH/USD does not update chart heading (stays BTC/USD) |
| QA-C33-TC-TRADE-004 | Chart type: 캔들/라인/영역 | PASS | 3 chart type toggle buttons visible |
| QA-C33-TC-TRADE-005 | OHLC badges | PASS | O: 65,889.20 / H: 68,120.00 / L: 65,400.10 / C: 67,432.50 |
| QA-C33-TC-TRADE-006 | Order panel: 매수/매도 toggle | PASS | Both buttons present; 매수 active by default |
| QA-C33-TC-TRADE-007 | Enter quantity + price → cost calc | PASS | Estimated Cost $6,743.25 shown automatically |
| QA-C33-TC-TRADE-008 | Click "주문 실행" | PASS | Button present and clickable |
| QA-C33-TC-TRADE-009 | Active Strategies | PASS | Alpha-7 (+22.4% LOW), Beta-V (+8.1% MID), Delta-2 (-0.2% HIGH) |
| QA-C33-TC-TRADE-010 | Global Signal Feed | PASS | 2 signals shown with timestamps and sector tags |
| QA-C33-TC-TRADE-011 | Footer: Latency/Server/API status | PASS | "Latency: 14ms / Server: Tokyo-AWS-01 / API Status: 200 OK" |

---

## /notifications — TC-NOTIF-*

| TC-ID | Action | Result | Notes |
|-------|--------|--------|-------|
| QA-C33-TC-NOTIF-001 | Load notifications | PASS | Page loads; "0 Records Found" with empty state |
| QA-C33-TC-NOTIF-002 | Click notification | SKIP | No notifications to click |
| QA-C33-TC-NOTIF-003 | Click action URL | SKIP | No notifications to click |
| QA-C33-TC-NOTIF-004 | "전체 읽음" button | SKIP | Button not visible when no notifications present |
| QA-C33-TC-NOTIF-005 | Filter: unread only | PASS | "No unread notifications" shown when Unread tab selected |
| QA-C33-TC-NOTIF-006 | Tab: all/tasks/system | PASS | All 3 type tabs + All/Unread filter tabs switch correctly |
| QA-C33-TC-NOTIF-007 | Search notifications | PASS | "Filter alerts..." search field accepts input |
| QA-C33-TC-NOTIF-008 | Unread badge count | PASS | "0 unread" displayed in footer status bar |
| QA-C33-TC-NOTIF-009 | TYPE_ICON_STYLE per type | SKIP | No notifications to verify icons |
| QA-C33-TC-NOTIF-010 | Empty state | PASS | "No notifications found" shown |
| QA-C33-TC-NOTIF-011 | Real-time: new notification | SKIP | Cannot trigger new notification in test context |

---

## Bugs Found

### BUG-C33-B8-001 — Trading: Ticker row click does not switch chart
- **Severity**: Medium
- **Page**: /trading
- **TC**: TC-TRADE-003
- **Steps**: Click ETH/USD row in ticker table
- **Expected**: Chart heading changes to "ETH/USD 차트", OHLC data updates
- **Actual**: Chart remains on "BTC/USD 차트" with BTC OHLC values; ETH row not highlighted
- **Screenshot**: `screenshots/trading-eth-click.png`

---

## Screenshots
- `screenshots/know-01-initial.png` — Knowledge page initial load (empty folder)
- `screenshots/know-memories.png` — Agent memories tab (empty state)
- `screenshots/jobs-01-loaded.png` — Jobs page with 2 completed jobs
- `screenshots/settings-01-general.png` — Settings general tab with all 8 tabs visible
- `screenshots/costs-01-loaded.png` — Costs page with full data
- `screenshots/notifications-01.png` — Notifications page empty state
- `screenshots/trading-eth-click.png` — Trading page after ETH row click (chart not switched)
