# 04. Trading (전략실) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Strategy Room** — where the CEO monitors stock markets, manages investment portfolios, reviews AI-generated trade proposals, runs backtests, and chats with a dedicated strategy AI agent.

The page operates in two modes:
- **Normal mode**: Left sidebar (watchlist) + center (chart & analysis) + right (AI chat)
- **Compare mode**: Left sidebar (multi-select) + center (comparison table) + right (AI chat)

It also has a **trading mode** that toggles between "real trading" (connected to Korea Investment & Securities API) and "paper trading" (simulated). This mode indicator must be prominent — the CEO needs to always know which mode is active.

---

### Data Displayed — In Detail

**Left Sidebar — Watchlist:**
- List of stocks the user is watching (user-curated, not a market screener)
- Each item shows: stock name (Korean), stock code, market tag (KOSPI / KOSDAQ / NASDAQ / NYSE), current price, and daily change rate (percentage, color-coded: positive/negative/flat)
- Items are drag-reorderable
- Search input to filter by name or code
- Market filter buttons: All / KR / US
- Compare mode toggle button (switches sidebar into multi-select checkbox mode, max 5)
- When a stock is selected, it highlights in the list
- Prices auto-refresh every 30 seconds during Korean market hours (9:00-15:30 KST). US stocks (NASDAQ/NYSE) have different hours (22:30-05:00 KST) and may show stale data during Korean daytime.

**Trading Mode Banner (top of center panel):**
- Persistent banner showing current trading mode: "실거래 모드" (real) or "모의거래 모드" (paper)
- KIS API connection status badge (connected / disconnected)
- Account number display when KIS is connected

**Center Panel — Single Stock View (normal mode):**
- Stock header card: name, code, market badge, current price (large), daily change (amount + percentage, color-coded), open/high/low/volume stats, last update timestamp, market open/closed indicator
- Action buttons in header: Backtest toggle, Share (copies URL), Export
- Candlestick chart: 60-day daily candles with OHLC, optional buy/sell signal markers from backtest overlay
- Backtest panel (expandable): Two numeric inputs (short MA period, long MA period), Run button. Results show: total return %, trade count, win rate %, max drawdown %. Can save results. Shows list of previously saved backtests that can be re-loaded or deleted. Supports URL sharing of backtest parameters.
- Notes panel: Per-stock markdown notes. Each note has title (optional), content (markdown rendered), created/updated timestamps. Notes can be created, edited, deleted. Notes can be shared with other company users (checkbox list of users). Shared notes show owner name. Real-time sync via WebSocket.
- Export dialog: Modal for exporting chart data and analysis results

**Below the chart area (scrollable, still in center panel):**
- **Approval Queue**: AI-proposed trade orders waiting for CEO approval (see details below)
- **Portfolio Dashboard**: Portfolio cards with holdings (see details below)

**Center Panel — Compare Mode:**
- Header card: "종목 비교 (N개)", share button
- Comparison table with columns: stock name (+ code), current price, change rate %, open, high, low, volume
- Each row is clickable to switch to that stock's single view
- Requires minimum 2 stocks selected to display

**Right Panel — Strategy AI Chat:**
- Full chat interface with a dedicated "Strategy Agent" (financial AI)
- Auto-creates a chat session on first visit
- Session context updates when the user selects a different stock (the agent knows which stock the user is looking at)
- Standard chat area with message history, streaming AI responses, and input

**Approval Queue (in center panel, below chart/notes):**
- List of AI-proposed trade orders waiting for CEO approval
- Each order shows: buy/sell badge, stock name + code, real-trading badge if applicable, AI confidence percentage, quantity, price per share, total amount, timestamp, AI reasoning text (truncated to 2 lines)
- Individual approve/reject buttons per order
- Bulk select with checkboxes, bulk approve/reject buttons
- Reject dialog with optional reason input
- Real-time updates via WebSocket (new pending orders appear automatically)
- Empty state: checkmark icon + "승인 대기 주문이 없습니다"

**Portfolio Dashboard (in center panel, below approval queue):**
- Filtered by current trading mode — only shows portfolios matching real or paper mode
- Each portfolio card shows: name, trading mode badge (real/paper), cash balance, number of holdings, total valuation, total return %
- Expandable holdings table per portfolio: ticker, name, quantity, average buy price, current price, per-holding return %, portfolio weight %
- Create portfolio button + modal: name input, initial cash amount (with Korean currency formatting preview), trading mode dropdown
- Empty state when no portfolios exist for current mode

---

### User Actions

1. **Search and filter watchlist** — type in search box, click market filter buttons
2. **Select a stock** — click in watchlist to view its chart and details
3. **Add/remove watchlist items** — remove via X button on each item. Adding stocks is done through Command Center slash commands or AI chat, not from this page directly.
4. **Reorder watchlist** — drag and drop items to change order
5. **Toggle compare mode** — click compare button, then select 2-5 stocks via checkboxes
6. **View comparison** — see side-by-side price data table for selected stocks
7. **Click through from comparison** — click a row in comparison table to go to that stock's chart
8. **Run backtest** — set MA periods, click run, view results with chart overlay markers
9. **Save/load/delete backtest results** — persist backtest configurations and results
10. **Share backtest via URL** — copy a link that includes backtest parameters
11. **Create/edit/delete notes** — markdown notes per stock with full CRUD
12. **Share notes** — select which company users can see each note
13. **Chat with strategy agent** — ask questions about the selected stock, market analysis, trading strategies
14. **Approve/reject trade orders** — individually or in bulk, with optional reject reasons
15. **Export chart data** — export via dialog

---

### UX Considerations

- **Trading mode must be unmissable** — the user must always know at a glance whether they're in real or paper trading. Real trading mode should feel distinctly different from paper.
- **The approval queue is a critical safety feature** — the CEO is the last human in the loop before real money is spent. Approving a trade should feel deliberate, not accidental. The consequences (real money at stake) should be communicated through the design.
- **Mobile experience**: On small screens, the three-panel layout collapses to single-column. The sidebar becomes a compact stock picker at the top, and chart/chat toggle via tabs. All functionality must still be accessible.
- **Price data is time-sensitive** — show when prices were last updated and whether the market is currently open or closed. Stale data should be visually distinguishable from live data.
- **The chart is the centerpiece** — when a stock is selected, the candlestick chart should be the dominant element. Backtest markers overlay on the same chart.
- **Backtest results need to be scannable** — the four key metrics (return, trades, win rate, drawdown) should be immediately visible without scrolling.
- **Notes support collaboration** — shared notes update in real-time. Make it clear which notes are yours vs. shared by others.
- **The AI chat panel should be contextual** — it shows which stock is currently being discussed. The strategy agent should feel like a financial advisor sitting next to the CEO.
- **Loading states for price data** — prices might fail to load (API issues). Show error states gracefully without blocking the rest of the UI.
- **Empty states**: No watchlist items, no stocks selected, no backtest results, no notes, no pending orders — all need appropriate empty state messaging.

---

### What NOT to Include on This Page

- Admin settings for API keys or KIS credentials (that's in the Admin app)
- Agent management or configuration
- Trading mode switching UI (handled in settings/admin)
- Risk management settings (stop-loss, position limits — admin area)
- Order history or executed trades log (separate page or section)
- Market news or research feeds
- Technical indicator configuration beyond what the backtest panel supports
