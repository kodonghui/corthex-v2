# Party Mode Round 1 — Collaborative Review
## prompt-04-trading.md

### Expert Panel

**Mary (Analyst) 📊**: "Fascinating prompt — I can see the trading flow is well-mapped! Two things jump out: (1) The Portfolio Dashboard and Approval Queue sections describe components that exist in the codebase but aren't directly embedded in the main TradingPage layout (which is just StockSidebar + ChartPanel/ComparisonPanel + ChatPanel). Should we clarify these are **sub-components within the center panel** or separate accessible sections? (2) The prompt mentions 'adding happens through other flows like command center' for watchlist — this is correct based on code but might confuse Lovable if they wonder where the add stock UI lives."

**Sally (UX Designer) 🎨**: "I love how the prompt captures the dual-mode (normal vs compare) paradigm! Building on Mary's point — looking at the actual page code, TradingPage.tsx is quite lean: it's literally a 3-panel grid with StockSidebar, ChartPanel (or ComparisonPanel), and ChatPanel. The PortfolioDashboard, ApprovalQueue, PendingOrders, and TradingModeHeader components exist but aren't rendered in the page. Are they supposed to be? If Lovable designs them in, we'd be adding features that don't currently exist in the page layout."

**Winston (Architect) 🏗️**: "Sally raises a valid concern. Checking the route handler — the strategy backend fully supports portfolios, orders, approval queues, and trading status. The frontend components also exist. But the TradingPage component itself doesn't render them. This looks like components that were built but haven't been wired into the page yet. The prompt should either (a) include them as intended parts of the page, or (b) omit them if they belong elsewhere."

**Paige (Tech Writer) 📚**: "From a documentation clarity standpoint, the prompt is comprehensive. One thing — the 'What NOT to Include' section says 'Order history or executed trades log (separate page or section)' but the codebase doesn't have a separate orders page. If we're asking Lovable to skip it, they won't know it exists elsewhere. Also, the prompt doesn't mention **how adding a stock to the watchlist works** — there's an add endpoint but no UI for it in the strategy components."

> **Crosstalk — Mary & Sally**:
> Mary: "The portfolio and approval components feel like they should be part of this page — they're in the strategy components folder."
> Sally: "Agreed. A Strategy Room without portfolio view or trade approval would feel incomplete. Let's include them as scrollable sections below the chart in the center panel."

### Issues Found
1. **Portfolio Dashboard / Approval Queue / Trading Mode Header not in page layout** — These components exist but TradingPage.tsx doesn't render them. The prompt describes them as if they're part of the page. Decision: Include them as intended parts (they belong here functionally) but note they appear as scrollable sections in the center panel, below the chart.
2. **Watchlist add flow unclear** — The prompt says "adding happens through other flows" but doesn't explain that the backend has an add endpoint. Since the strategy sidebar has no add UI, this is correct but should note that adding stocks comes from the Command Center or chat commands.

### Fixes Applied
- Clarified that Portfolio Dashboard, Approval Queue, and Trading Mode Header are displayed as sections within the center panel (below the chart area)
- Added clarification that adding stocks to the watchlist is done via Command Center slash commands or AI chat, not from this page directly
