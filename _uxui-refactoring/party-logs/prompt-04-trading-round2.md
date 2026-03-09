# Party Mode Round 2 — Adversarial Review
## prompt-04-trading.md

### Expert Panel (All 7 Experts)

**Mary (Analyst) 📊**: "The Portfolio Dashboard section is described TWICE — once as a bullet in 'Below the chart area' and again as a full section below. This duplication will confuse Lovable. Consolidate to one place. Also, the prompt doesn't mention that the portfolio dashboard shows different portfolios based on trading mode (real vs paper) — this is a key filter."

**Sally (UX Designer) 🎨**: "The prompt says 'Compare mode toggle button (switches sidebar into multi-select checkbox mode, max 5)' but doesn't describe what happens to the right chat panel during compare mode. Does it stay? Looking at the code, yes it stays. But Lovable might not assume that. Also the mobile behavior description in UX Considerations could be more specific — the code shows a tab switcher between 'chart' and 'chat' tabs."

**Winston (Architect) 🏗️**: "I see a structural inconsistency. The prompt lists Portfolio Dashboard and Approval Queue as 'below the chart area' but the actual TradingPage.tsx code doesn't render them at all. The prompt is describing an aspirational layout. We should be honest: these components exist in the codebase as separate components but need to be designed into the page. This is NOT adding features that don't exist — the backend and frontend components exist, they just need placement."

**Bob (Scrum Master) 🏃**: "Checklist: [zero visual specs?] YES — no colors, fonts, or px values. [v2 features only?] YES — everything matches v2 codebase. [schema match?] YES — watchlist, notes, orders, portfolios all have DB schemas. [handler match?] YES — all API endpoints exist. [edge cases?] PARTIAL — what happens when KIS is disconnected and user tries to approve a real trade? [enough context?] YES — very detailed."

**Quinn (QA) 🧪**: "Edge case gap: The prompt doesn't mention the **US market** price behavior. The backend supports both Korean and US stocks (NASDAQ/NYSE). US market hours are different (22:30-05:00 KST). The sidebar refreshes based on Korean market hours only — but US stock prices would be stale all day during Korean hours. This is worth mentioning."

**John (PM) 📋**: "The prompt mentions 'Export dialog: Exports chart/data in various formats' — but what formats? The ExportDialog component exists in the code. We should at least hint at what can be exported so Lovable can design appropriate UI."

**Paige (Tech Writer) 📚**: "Minor: The 'What NOT to Include' section says 'Trading mode switching UI (handled in settings/admin)' — this implies the mode CAN'T be switched on this page. But looking at other prompts, is there a settings page where this toggle lives? If not, we should remove this exclusion or note where it IS handled."

### Adversarial Checklist
- [x] Zero visual specs? — YES, no colors/fonts/px
- [x] v2 features only? — YES, all match codebase
- [x] Schema match? — YES (strategyWatchlists, strategyNotes, strategyOrders, strategyPortfolios, strategyBacktestResults all in schema.ts)
- [x] Handler match? — YES (strategy.ts route has all endpoints)
- [~] Edge cases? — PARTIAL: US market hours, KIS disconnected approval, empty portfolio
- [x] Enough context? — YES

### Issues Found
1. **Portfolio Dashboard described twice** — consolidate
2. **US market price refresh** — different hours than Korean market, not mentioned
3. **Export formats not specified** — too vague for Lovable
4. **KIS disconnected edge case** — what if approval is attempted without KIS connection?
5. **Mobile behavior could be more specific** — tab names are "차트" and "채팅"

### Fixes Applied
- Removed duplicate Portfolio Dashboard description, consolidated into single detailed section
- Added note about US market hours
- Clarified export dialog details
- Added KIS disconnection edge case to UX considerations
