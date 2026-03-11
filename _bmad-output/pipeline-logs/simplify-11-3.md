## /simplify Quality Gate — Story 11.3

### Execution
- Timestamp: 2026-03-11
- Status: success

### Results
- Files reviewed: 4 (nexus.tsx, sketchvibe-nodes.tsx, context-menu.tsx, sketchvibe-mcp.ts)
- Issues found: 7
  - Reuse opportunities: 2 (Mermaid parse+callback injection 3x, undo push 4x — noted but not extracted to keep diff minimal)
  - Quality issues: 3 (WS listener hot-path, Space bar contentEditable guard, misleading comment)
  - Efficiency improvements: 2 (selectedCount useMemo, group bounding box measured dims)
- Issues auto-fixed: 5
- Files modified:
  - `packages/app/src/pages/nexus.tsx` — 5 fixes (WS ref pattern, selectedCount memo, group bounds, Space contentEditable guard)
  - `packages/server/src/lib/tool-handlers/builtins/sketchvibe-mcp.ts` — 1 fix (misleading comment)

### Fixes Applied
1. **HIGH — WS listener re-registration**: Added `nodesRef`/`edgesRef` refs, used in `canvas_mcp_update` undo closure. Removed `nodes`/`edges` from effect deps → listener no longer re-registers on every drag.
2. **MEDIUM — selectedCount**: Extracted `useMemo` for `nodes.filter(selected).length`, replaced 3 inline calls.
3. **MEDIUM — Group bounding box**: Replaced hardcoded `+200/+100` with `node.measured.width/height` (fallback 160x80).
4. **MEDIUM — Space bar**: Added `isContentEditable` check to prevent Space from triggering connection mode during label editing.
5. **LOW — Comment fix**: Corrected misleading catch comment in sketchvibe-mcp.ts.

### Not Fixed (noted for awareness)
- Mermaid parse + callback injection pattern repeated 3x in nexus.tsx — extracting a helper would be clean but touches pre-existing code outside this story's scope.
- Undo push pattern repeated 4x — same reasoning, a `pushUndo()` helper would be nice but low priority.
