# Party Mode Round 1 — Collaborative Lens
## Page: 04-trading

### Expert Panel
- **John (PM):** Massive refactoring: 12 files (1 page + 11 components) migrated from zinc/indigo to slate/blue. All @corthex/ui components (Card, Badge, Button, Input, Modal, Skeleton, Toggle, Tabs, ConfirmDialog, EmptyState, Select) replaced with native HTML + Tailwind. Korean labels preserved.
- **Winston (Architect):** All hooks, API calls, @dnd-kit drag-and-drop, WebSocket handlers, useQuery/useMutation patterns untouched. Only visual layer changed. 14+ API endpoints preserved.
- **Sally (UX):** 3-panel layout (240px sidebar + flex center + 360px chat) preserved. Mobile tab pattern with compact sidebar. Trading mode header colors (red=real, blue=paper) per spec.
- **Amelia (Dev):** TypeScript compiles clean. No unused imports. ConfirmDialog replaced with inline dialogs (same pattern as chat session-panel).
- **Quinn (QA):** 45+ data-testid attributes from spec verified across all files. Stock items, backtest, notes, portfolio, approval queue, comparison panel all covered.
- **Mary (Security):** No security changes. Trade approval/rejection flow unchanged.
- **Bob (Performance):** No new deps. @dnd-kit, stock-chart canvas rendering unchanged.

### Issues Found: 0

### Status: Clean pass, proceeding to Round 2
