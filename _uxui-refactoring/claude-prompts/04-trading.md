# 04. Trading (전략실) — Design Specification

## 1. Page Overview

- **Purpose**: CEO's personal stock trading & strategy room. Combines watchlist management, real-time charts with candlestick visualization, AI strategy chat, portfolio management, backtest engine, trade approval queue, and collaborative notes — all in one 3-panel layout.
- **Key User Goals**: Monitor watchlist prices in real-time, analyze charts with MA backtests, chat with strategy AI agent about stocks, approve/reject pending trade orders, manage portfolios, take & share notes.
- **Route**: `/trading`
- **Data Dependencies**:
  - `GET /workspace/strategy/watchlist` → watchlist items
  - `PATCH /workspace/strategy/watchlist/reorder` → reorder watchlist
  - `DELETE /workspace/strategy/watchlist/:id` → remove from watchlist
  - `GET /workspace/strategy/prices?codes=` → real-time prices (30s polling during market hours)
  - `GET /workspace/strategy/chart-data?code=&count=60` → candlestick OHLCV data
  - `GET /workspace/strategy/trading-status` → real/paper mode, KIS connection
  - `GET /workspace/strategy/portfolios` → portfolio list with holdings
  - `POST /workspace/strategy/portfolios` → create portfolio
  - `GET /workspace/strategy/backtest-results?stockCode=` → saved backtests
  - `POST /workspace/strategy/backtest-results` → save backtest
  - `DELETE /workspace/strategy/backtest-results/:id` → delete backtest
  - `GET /workspace/strategy/orders/pending` → pending approval orders (30s poll + WebSocket)
  - `POST /workspace/strategy/orders/:id/approve` → approve single order
  - `POST /workspace/strategy/orders/:id/reject` → reject single order
  - `POST /workspace/strategy/orders/bulk-approve` → bulk approve
  - `POST /workspace/strategy/orders/bulk-reject` → bulk reject
  - `GET /workspace/strategy/notes?stockCode=` → stock notes
  - `POST /workspace/strategy/notes` → create note
  - `PATCH /workspace/strategy/notes/:id` → update note
  - `DELETE /workspace/strategy/notes/:id` → delete note
  - `POST /workspace/strategy/notes/:id/share` → share note
  - `DELETE /workspace/strategy/notes/:id/share/:userId` → unshare
  - `GET /workspace/strategy/chat/session` → strategy chat session
  - `POST /workspace/strategy/chat/sessions` → create chat session
  - `PATCH /workspace/strategy/chat/sessions/:id/context` → update chat context
  - WebSocket channels: `strategy`, `strategy-notes`
- **Current State**: Functional 3-panel layout with zinc palette. Needs slate design tokens, improved visual hierarchy, and polished component styling.

## 2. Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TradingModeHeader (conditional, only when trading status loaded)            │
│ [🔴 실거래 모드 | KIS 연결됨 | 계좌번호]  OR  [🔵 모의거래 모드]          │
├──────────────┬────────────────────────────────────┬─────────────────────────┤
│ StockSidebar │ Center Panel (ChartPanel or        │ ChatPanel               │
│ (w-[240px])  │ ComparisonPanel based on URL)      │ (w-[360px])             │
│              │                                     │                         │
│ 관심종목 (N) │ [Stock header + price info]         │ [ChatArea component]    │
│ [비교 ○]     │ [Candlestick chart]                 │ [AI strategy agent]     │
│ [검색...]    │ [Backtest panel (collapsible)]       │                         │
│ [전체|KR|US] │ [Notes panel]                        │                         │
│              │ [Portfolio Dashboard]                │                         │
│ [종목1 ▲2%]  │ [Approval Queue]                    │                         │
│ [종목2 ▼1%]  │ [Pending Orders]                    │                         │
│ [종목3  0%]  │                                      │                         │
│ ...drag sort │                                      │                         │
├──────────────┴────────────────────────────────────┴─────────────────────────┤

Mobile (< md):
┌─────────────────────────┐
│ StockSidebar (compact)  │
│ (max-h-[180px])         │
├─────────────────────────┤
│ Tab: [차트] [채팅]      │
├─────────────────────────┤
│ Active tab content      │
│ (full width scroll)     │
└─────────────────────────┘
```

- **Page container**: `h-[calc(100dvh-var(--header-h,56px))] flex flex-col bg-slate-900`
- **Desktop grid**: `hidden md:grid md:grid-cols-[240px_1fr_360px] flex-1 min-h-0`
- **Left sidebar**: `border-r border-slate-700 flex flex-col overflow-hidden`
- **Center panel**: scrollable content area
- **Right panel (chat)**: `border-l border-slate-700 flex flex-col h-full`
- **Mobile wrapper**: `md:hidden flex flex-col flex-1 min-h-0`
- **Mobile tab bar**: `flex border-b border-slate-700`
  - Active tab: `flex-1 py-2.5 text-sm font-medium text-center text-blue-400 border-b-2 border-blue-400`
  - Inactive tab: `flex-1 py-2.5 text-sm font-medium text-center text-slate-500`

## 3. Component Breakdown

### 3.1 TradingModeHeader

- **Purpose**: Show current trading mode (real vs paper) with KIS connection status
- **Container**: `flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg mx-4 mt-2`
- **Real mode**: `bg-red-600 text-white`
- **Paper mode**: `bg-blue-600 text-white`
- **Left side**: `flex items-center gap-2`
  - Mode icon: `text-base` — `🔴` (real) or `🔵` (paper)
  - Mode label: `실거래 모드` or `모의거래 모드`
- **Right side**: `flex items-center gap-3 text-xs`
  - KIS badge: Uses `Badge` component
    - Connected: `variant="success"` → `KIS 연결됨`
    - Disconnected: `variant="default"` → `KIS 미연결`
  - Account number: `opacity-80`
- **data-testid**: `trading-mode-header`, `trading-mode-label`, `kis-status-badge`

### 3.2 StockSidebar

- **Purpose**: Watchlist management with search, filter, drag-sort, compare mode
- **Header section**: `p-3 space-y-2`
  - Title row: `flex items-center justify-between`
    - Label: `text-xs font-medium text-slate-400` → `관심종목 (N)`
    - Compare toggle: `text-xs px-2 py-1 rounded-md transition-colors`
      - Active: `bg-blue-900/50 text-blue-400`
      - Inactive: `text-slate-400 hover:text-slate-300`
  - Search input: `Input` component with `placeholder="종목 검색..."`, `text-xs`
  - Market filter pills: `flex gap-1`
    - Active: `text-[10px] px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-400`
    - Inactive: `text-[10px] px-2 py-0.5 rounded-full text-slate-400 hover:text-slate-300 bg-slate-800`

- **Stock list**: `flex-1 overflow-y-auto` with `@dnd-kit` drag-and-drop
  - Each stock item: `w-full flex items-center justify-between px-3 py-2.5 text-left text-sm transition-colors min-h-[44px] cursor-pointer`
    - Selected: `bg-slate-800 text-blue-400`
    - Compare checked: `bg-blue-950 text-blue-400`
    - Default: `text-slate-300 hover:bg-slate-800/50`
  - Drag handle: `shrink-0 cursor-grab text-slate-600 hover:text-slate-400 text-xs` → `⠿`
  - Stock info: name (font-medium truncate) + code (text-xs text-slate-500)
  - Price column: `text-right`
    - Price: `text-xs font-mono text-slate-300`
    - Change: `text-[10px] font-mono` + color by direction:
      - Up: `text-emerald-500`
      - Down: `text-red-500`
      - Flat: `text-slate-400`
  - Remove button: `ml-1 shrink-0 text-slate-400 hover:text-red-500 p-1 min-w-[28px] min-h-[28px]`
  - Empty state: `px-3 py-6 text-xs text-slate-400 text-center`

- **data-testid**: `stock-sidebar`, `stock-search-input`, `market-filter-all`, `market-filter-kr`, `market-filter-us`, `compare-toggle-btn`, `stock-item-{code}`, `stock-remove-{code}`

### 3.3 ChartPanel

- **Purpose**: Stock detail view with price info, candlestick chart, backtest, notes, portfolio, approval queue
- **Container**: `p-4 h-full flex flex-col gap-3 overflow-y-auto`
- **Empty state**: centered `EmptyState` component

#### 3.3.1 Price Header Card
- `Card variant="bordered"` with `px-5 py-4`
- Title row: `flex items-center justify-between gap-2`
  - Stock name: `text-lg font-semibold text-slate-100`
  - Stock code: `text-sm text-slate-400`
  - Market badge: `text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-500`
- Action buttons: `flex gap-1`
  - Backtest toggle, Share, Export — each `Button size="sm" variant="ghost"`
- Price display: `mt-2 flex items-baseline gap-3 flex-wrap`
  - Main price: `text-2xl font-mono font-bold text-slate-100`
  - Change: `text-sm font-medium` + direction color (emerald/red/slate)
- OHLV row: `mt-2 flex gap-4 text-xs text-slate-400`
  - 시가, 고가 (emerald), 저가 (red), 거래량
- Status row: `mt-2 flex items-center gap-2 text-xs text-slate-400`
  - Error: `text-amber-500`
  - Last update time
  - Market closed indicator: `text-slate-500`
- **data-testid**: `chart-stock-name`, `chart-stock-price`, `chart-price-change`, `backtest-toggle-btn`, `share-btn`, `export-btn`

#### 3.3.2 Chart Card
- `Card variant="bordered"` with `min-h-[240px] h-[40vh]`
- Loading: centered `text-sm text-slate-400` → "차트 로딩 중..."
- No data: centered `text-sm text-slate-400` → "차트 데이터가 없습니다"
- `StockChart` component: renders candlestick chart with optional MA crossover markers
- **data-testid**: `stock-chart-container`

#### 3.3.3 BacktestPanel (collapsible)
- `Card variant="bordered" shrink-0` with `px-5 py-4 space-y-4`
- Header: `flex items-center justify-between`
  - Title: `text-sm font-semibold text-slate-100` → "백테스트"
  - Clear button: `text-xs text-slate-400 hover:text-slate-300`
- Settings row: `flex items-end gap-3 flex-wrap`
  - Short MA input: `block w-20 rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-100`
  - Long MA input: same styling
  - Run button: `Button size="sm"`
- Result card: `border border-slate-700 rounded-lg p-3 space-y-2`
  - 2x2 grid: `grid grid-cols-2 gap-2 text-sm`
  - Metrics: 총 수익률 (colored), 거래 횟수, 승률, 최대 손실 (red)
  - Save button: `Button size="sm" variant="ghost"`
- Saved list: `space-y-1`
  - Each item: `flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-800/50 cursor-pointer text-sm min-h-[36px]`
  - Delete confirm: `ConfirmDialog variant="danger"`
- **data-testid**: `backtest-panel`, `backtest-short-input`, `backtest-long-input`, `backtest-run-btn`, `backtest-save-btn`, `backtest-result-{id}`

#### 3.3.4 NotesPanel
- Title row: `flex items-center justify-between`
  - Label: `text-sm font-medium text-slate-300` → "메모 (N)"
  - New note button: `Button size="sm" variant="ghost"` → "+ 새 메모"
- Note editor: fullscreen on mobile (`fixed inset-0 z-50 bg-slate-900`), inline on desktop
  - Title input: `w-full text-sm bg-transparent border-b border-slate-700 pb-1 outline-none placeholder:text-slate-500`
  - Textarea: `w-full text-sm bg-transparent resize-none outline-none placeholder:text-slate-500`
  - Actions: Cancel (ghost) + Save (primary)
- Share management panel: `border border-slate-700 rounded-lg p-3 space-y-2`
  - User list with checkboxes: toggle share per user
- Note cards: `border border-slate-700 rounded-lg p-3 group`
  - Title: `text-sm font-medium text-slate-200 truncate`
  - Date: `text-xs text-slate-400`
  - Shared indicator: `text-xs text-blue-500`
  - Action buttons (hover-visible on desktop): 편집, 공유, 삭제
  - Content: `MarkdownRenderer` with `line-clamp-4`
  - Delete confirm: `ConfirmDialog variant="danger"`
- **data-testid**: `notes-panel`, `note-create-btn`, `note-editor`, `note-save-btn`, `note-item-{id}`, `note-share-btn-{id}`, `note-delete-btn-{id}`

#### 3.3.5 PortfolioDashboard
- Portfolio cards: `space-y-3`
  - Each card: `Card variant="bordered"` with `px-4 py-3`
  - Header: name + mode badge (실거래=red, 모의거래=blue) + expand toggle
  - Summary grid: `grid grid-cols-4 gap-4 text-center`
    - 현금, 보유종목, 총 평가, 수익률 (colored)
  - Holdings table (expanded): `w-full text-xs`
    - Columns: 종목, 수량, 매입가, 현재가, 수익률 (colored), 비중
- Create portfolio: `Button variant="ghost" size="sm"` → "+ 포트폴리오 추가"
- Create modal: `Modal` with name input, initial cash, trading mode select
- **data-testid**: `portfolio-dashboard`, `portfolio-card-{id}`, `portfolio-expand-btn-{id}`, `portfolio-create-btn`, `portfolio-create-modal`

#### 3.3.6 ApprovalQueue
- Header: `flex items-center justify-between`
  - Title: `text-sm font-semibold text-slate-100` → "승인 대기"
  - Count badge: `Badge variant="warning"` → `N건`
  - Bulk actions: 전체 선택 checkbox + 일괄 승인/거부 buttons
- Order cards: `Card variant="bordered" p-3`
  - Side badge: 매수=success, 매도=error
  - Stock name + code + mode badge + confidence badge
  - Details: 수량, 가격, 총액, 시간
  - Reason text: `text-xs text-slate-500 line-clamp-2`
  - Actions: 승인 (primary), 거부 (ghost)
- Reject dialog: `ConfirmDialog variant="danger"` with reason input
- **data-testid**: `approval-queue`, `approval-order-{id}`, `approval-approve-btn-{id}`, `approval-reject-btn-{id}`, `approval-bulk-approve-btn`, `approval-bulk-reject-btn`

### 3.4 ComparisonPanel (URL has `?compare=`)

- **Purpose**: Side-by-side price comparison table for selected stocks
- **Container**: `p-4 h-full flex flex-col gap-3 overflow-y-auto`
- Header card: title → "종목 비교 (N개)" + share button
- Table card: `overflow-x-auto`
  - Table: `w-full text-sm`
  - Headers: 종목명, 현재가, 등락률, 시가, 고가, 저가, 거래량
  - Row hover: `hover:bg-slate-800/50 cursor-pointer`
  - Click navigates to single stock view
  - Price colors: emerald (up), red (down), slate (flat)
- **data-testid**: `comparison-panel`, `comparison-table`, `comparison-row-{code}`

### 3.5 ChatPanel

- **Purpose**: AI strategy agent chat, auto-creates session, updates context when stock changes
- **Container**: `h-full border-l border-slate-700 flex flex-col`
- Reuses `ChatArea` component from chat page
- Loading state: centered "채팅 준비 중..."
- Empty state: `EmptyState` with strategy agent description
- **data-testid**: `trading-chat-panel`, `trading-chat-area`

## 4. Interactions & State

| Action | Trigger | Effect |
|--------|---------|--------|
| Select stock | Click stock in sidebar | URL `?stock=CODE`, chart + price + notes load |
| Search stocks | Type in search input | Filter watchlist in real-time |
| Filter market | Click 전체/KR/US pill | Filter by market type |
| Toggle compare | Click 비교 button | Switch to compare mode, show checkboxes |
| Drag reorder | Drag stock handle | `PATCH /reorder` + optimistic update |
| Remove stock | Click X on stock item | `DELETE /watchlist/:id` + toast |
| Toggle backtest | Click 백테스트 button | Show/hide BacktestPanel |
| Run backtest | Click 실행 | Run MA crossover, show markers on chart |
| Save backtest | Click 저장 | `POST /backtest-results` + toast |
| Load saved backtest | Click saved item | Load result + show markers |
| Create note | Click + 새 메모 → save | `POST /notes` + invalidate |
| Edit note | Click 편집 → save | `PATCH /notes/:id` |
| Share note | Click 공유 → toggle users | `POST /share` or `DELETE /share/:userId` |
| Approve order | Click 승인 | `POST /orders/:id/approve` + toast |
| Reject order | Click 거부 → reason → confirm | `POST /orders/:id/reject` + toast |
| Bulk approve | Select + 일괄 승인 | `POST /bulk-approve` |
| Create portfolio | Click 생성 → fill form → submit | `POST /portfolios` + toast |
| Share URL | Click 공유 | Copy current URL with backtest params to clipboard |
| Export | Click 내보내기 | Open ExportDialog |
| Switch mobile tab | Tap 차트/채팅 | Toggle between ChartPanel and ChatPanel |

## 5. Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| `< md` (mobile) | Compact sidebar (max-h-180px) + tab switch between chart/chat |
| `>= md` (desktop) | 3-column grid: sidebar 240px / center flex / chat 360px |

## 6. Loading / Empty / Error States

| State | Display |
|-------|---------|
| No stock selected | `EmptyState`: "종목을 선택해주세요" (center panel) |
| Chat loading | Centered "채팅 준비 중..." |
| No chat session | `EmptyState`: "전략 에이전트와 대화하세요" |
| Chart loading | Centered "차트 로딩 중..." |
| No chart data | Centered "차트 데이터가 없습니다" |
| Price error | Amber warning: "가격 정보를 불러올 수 없습니다" |
| Market closed | "장 마감" indicator |
| Compare < 2 stocks | `EmptyState`: "비교할 종목을 선택해주세요" |
| No portfolios | `EmptyState`: "포트폴리오를 생성하세요" |
| No pending orders | "✅ 승인 대기 주문이 없습니다" (hidden if 0) |
| No notes | "아직 메모가 없습니다" |
| Empty watchlist | "관심 종목이 없습니다" |
| Search no results | "검색 결과가 없습니다" |

## 7. Animations & Transitions

- Stock item hover: `transition-colors`
- Compare toggle: color transition
- Drag-and-drop: `@dnd-kit` transform + opacity during drag
- Market filter pill: `transition-colors`
- Note action buttons: `sm:opacity-0 sm:group-hover:opacity-100 transition-opacity`
- In-progress indicator: `animate-pulse` on emerald dot
- Price auto-refresh: 30s during KRX market hours (09:00-15:30 KST)

## 8. Accessibility

- All stock items: `role="button" tabIndex={0}` + Enter key handler
- Drag handle: separate from click target
- Minimum touch targets: `min-h-[44px]` for stock items, `min-w-[28px] min-h-[28px]` for buttons
- Backtest saved items: `role="button" tabIndex={0}` + Enter handler
- Confirm dialogs for destructive actions (delete note, delete backtest, reject order)
- Checkbox groups for bulk operations

## 9. data-testid Map

```
trading-mode-header, trading-mode-label, kis-status-badge
stock-sidebar, stock-search-input
market-filter-all, market-filter-kr, market-filter-us
compare-toggle-btn
stock-item-{code}, stock-remove-{code}
chart-stock-name, chart-stock-price, chart-price-change
backtest-toggle-btn, share-btn, export-btn
stock-chart-container
backtest-panel, backtest-short-input, backtest-long-input
backtest-run-btn, backtest-save-btn, backtest-result-{id}
notes-panel, note-create-btn, note-editor, note-save-btn
note-item-{id}, note-share-btn-{id}, note-delete-btn-{id}
portfolio-dashboard, portfolio-card-{id}
portfolio-expand-btn-{id}, portfolio-create-btn, portfolio-create-modal
approval-queue, approval-order-{id}
approval-approve-btn-{id}, approval-reject-btn-{id}
approval-bulk-approve-btn, approval-bulk-reject-btn
comparison-panel, comparison-table, comparison-row-{code}
trading-chat-panel, trading-chat-area
mobile-tab-chart, mobile-tab-chat
```
