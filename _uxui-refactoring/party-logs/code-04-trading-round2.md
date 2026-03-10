# Party Mode Round 2 — Adversarial Lens
## Page: 04-trading

### Adversarial Checklist
- [x] Design spec layout matched (3-panel desktop, tab-switch mobile)
- [x] Tailwind classes from spec applied
- [x] Functionality 100% identical (all 14+ API endpoints preserved)
- [x] All 45+ data-testid added per spec's testid map
- [x] No existing data-testid removed
- [x] Responsive design per spec (mobile compact sidebar + tabs)
- [x] Loading/error/empty states per design spec
- [x] No impact on other pages
- [x] Import path casing matches git ls-files
- [x] @corthex/ui imports replaced (Card, Badge, Button, Input, Modal, Tabs, ConfirmDialog, EmptyState, Select)

### Expert Observations (all NEW)
- **John:** stock-chart.tsx, backtest-engine.ts, types.ts correctly left untouched.
- **Winston:** @dnd-kit integration in stock-sidebar preserved — DndContext, SortableContext, useSortable hooks unchanged.
- **Sally:** Approval queue order cards match spec: side badge (매수=emerald, 매도=red), confidence badge, detail grid.
- **Amelia:** Export dialog, portfolio create modal — both use native fixed overlay pattern.
- **Quinn:** E2e test needed for trading page.

### Issues Found: 0

### Status: Clean, proceeding to Round 3
