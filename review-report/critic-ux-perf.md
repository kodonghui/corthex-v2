# Critic-UX-Perf Report

## Score: 7/10

## Findings

### workflows.tsx (NEW -- 830 lines)

- issue: [UX] **No keyboard trap management in modals.** `WorkflowFormModal` and `DeleteConfirmModal` lack focus trap (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`). Pressing Tab can escape behind the overlay. The Escape key does not close modals -- only clicking the overlay does.
- issue: [UX] **Back button ("← 목록") is text-only with no touch target padding.** On mobile, the hit area is just the text `text-sm text-slate-400`, which falls well below the 44px minimum touch target. Needs `min-h-[44px] px-3` or similar.
- issue: [UX] **Edit/Delete buttons in workflow list items are tiny.** `text-xs text-slate-400` inline buttons have no padding beyond text size -- roughly 16px tall on mobile. These fall below the 44px touch target minimum and are difficult to tap accurately.
- issue: [UX] **Suggestion accept/reject buttons** (`px-3 py-1.5 text-xs`) are 28-30px tall, below the 44px mobile minimum.
- issue: [PERF] **Duplicate type definitions.** `WorkflowStep`, `Workflow`, `Execution`, `StepSummary`, `Suggestion`, and `ListMeta` are all re-declared locally in `workflows.tsx` despite identical types existing in `use-queries.ts` (hooks #14). This creates maintenance drift risk and bloats the bundle. Extract shared workflow types to `@corthex/shared` or at minimum re-export from `use-queries.ts`.
- issue: [PERF] **Inline queries instead of shared hooks.** `workflows.tsx` defines its own `useQuery`/`useMutation` calls directly instead of using the pre-built `useWorkflows()`, `useWorkflowDetail()`, `useWorkflowExecutions()`, `useWorkflowSuggestions()`, and `useWorkflowMutations()` hooks from `use-queries.ts`. This duplicates API call logic and query key management. The page's query keys (`['workflows']`) differ from the hooks (`['workflows', page, limit]`), so invalidations from the hooks will NOT propagate to the page and vice versa -- a cache coherence bug.
- issue: [PERF] **830-line single file with no code splitting.** The form modal (170 lines), delete modal, and execution card are all defined inline. While they are separate functions (good), none are `React.memo`'d or lazy-loaded. Every state change in the parent (tab switch, page change) re-renders all child components. Consider `React.memo` on `ExecutionCard` and `WorkflowFormModal`, and potentially extracting them.
- issue: [UX] **Workflow list items are `div` with `onClick` but no `role="button"`, `tabIndex`, or `onKeyDown`.** Keyboard-only users cannot navigate or select workflows. Same applies to `ExecutionCard`'s expandable header.
- issue: [UX] **No loading/error state for execute mutation.** After clicking "실행", the button shows "실행 중..." but there is no indication of success beyond a toast. If the user is scrolled down looking at execution history, they might miss the toast. Consider also invalidating/refetching the execution list with a brief delay to show the new execution.
- suggestion: [UX] Step form grid `grid-cols-2` on mobile could be cramped on 390px screens (each column ~160px with padding). Consider `grid-cols-1 sm:grid-cols-2` for the step name/type row.
- praise: [UX] Good use of progressive disclosure -- list view vs detail view pattern. Tab navigation between workflows and suggestions is clean. Step visualization with numbered circles and connecting lines is visually clear. Korean labels are consistent.
- praise: [UX] Good skeleton loading states for both tabs.
- praise: [UX] 20-step limit with clear counter ("단계 3/20") is a thoughtful constraint. Auto-chaining new steps to the previous step reduces user effort.

### chat-area.tsx (cancel button)

- praise: [UX] Cancel button correctly shows only during `isStreaming`. Clear visual distinction -- red background with stop icon (square). Spinner feedback during `isCancelling` state is good.
- praise: [UX] Proper `aria-label="작업 중단"` on the cancel button. `data-testid="cancel-btn"` for testing.
- issue: [UX] **No confirmation or undo for cancel.** Cancelling an agent task is a destructive action that cannot be undone. A brief confirmation or "Are you sure?" could prevent accidental taps, especially on mobile where the button is adjacent to the text area.
- issue: [UX] **Fallback behavior inconsistency.** On API failure in `handleCancel`, the catch block calls `stopStream()` (local stream stop) but does NOT call `toast.error()` to inform the user. The user sees nothing -- the stream just stops silently. Meanwhile, on success, `toast.info('작업이 중단되었습니다')` fires. The error path should show a warning like "서버 중단 실패, 로컬 스트림만 중지됨".
- suggestion: [PERF] The `handleCancel` function is defined as a new async function on every render. Wrap in `useCallback` with `[sessionId, isCancelling, stopStream]` deps for consistency with other callbacks in this component (e.g., `handleScroll` is already `useCallback`).

### ws-store.ts (WebSocket reconnect toast)

- praise: [UX] Three distinct toast scenarios are well-covered: (1) reconnection success, (2) unexpected disconnect with reconnect attempt, (3) server restart notice. Each uses appropriate severity (`success`, `warning`, `warning`).
- praise: [UX] Smart guard: reconnection toast only fires when `wasDisconnected` (reconnectAttempt > 0), avoiding a toast on initial connect. Disconnect toast only fires when `wasConnected`, avoiding false positives during initialization.
- issue: [UX] **Toast spam on flaky connections.** If the connection flaps rapidly (disconnect -> reconnect -> disconnect -> reconnect), the user gets a burst of "연결 끊어짐" + "연결 복구" toasts. Consider debouncing or coalescing: only show disconnect toast after a short delay (e.g., 2s), and cancel it if reconnection succeeds within that window.
- issue: [UX] **No toast ID / deduplication.** Multiple `toast.warning` calls from rapid reconnect attempts could stack. Most toast libraries support an `id` parameter to replace rather than stack. Verify `@corthex/ui` toast supports this and use `toast.warning('...', { id: 'ws-disconnect' })` pattern.

### use-queries.ts (workflow hooks)

- issue: [PERF] **Dead code / unused hooks.** The workflow hooks (#14: `useWorkflows`, `useWorkflowDetail`, `useWorkflowExecutions`, `useWorkflowSuggestions`, `useWorkflowMutations`) are defined but `workflows.tsx` does NOT import them -- it re-implements everything inline. Either the page should use these hooks, or they should be removed to avoid confusion.
- praise: [PERF] Good pattern: `useWorkflowMutations()` returns a single object with all CRUD operations and centralized invalidation. This is the correct abstraction -- the page just needs to adopt it.

### sidebar.tsx (nav entry)

- praise: [UX] Clean integration -- `Workflow` icon from `lucide-react` is semantically appropriate. Placed in "TOOLS" section which makes organizational sense.
- issue: [UX] Minor: the `Workflow` import from lucide-react should be verified to actually render (some lucide versions have this icon under a different name). No runtime error visible but worth a smoke test.

### Layout Spacing Pages (spot check)

**dashboard.tsx:**
- praise: [UX] Exemplary responsive implementation. Cards use `p-4 sm:p-6`, `rounded-xl sm:rounded-2xl`, `text-2xl sm:text-4xl` -- all matching the design system rules. Numbers use `font-mono tabular-nums`. ARIA roles on cards (`role="region"` with `aria-label`). Gap pattern `gap-3 sm:gap-3 sm:gap-4` has a duplicate `sm:gap-3` before `sm:gap-4` (line 38) -- this is a typo but the last one wins so it works. Clean it up for clarity.

**costs.tsx:**
- praise: [UX] Period selector buttons use `aria-pressed` for accessibility. Custom date inputs are properly constrained. `overflow-x-auto no-scrollbar` on the period selector row follows the horizontal scroll rule.
- issue: [UX] Period selector buttons (`px-3 py-1.5 text-xs`) are ~30px tall, below 44px touch target on mobile.

**reports.tsx:**
- praise: [UX] Status badges use consistent color coding (slate/amber/emerald) matching the design system palette. `toast` integration for user feedback.

**General spacing consistency across LOW risk pages:**
- praise: All spot-checked pages use the `px-4 sm:px-6 lg:px-8` page padding pattern consistently.
- praise: Card `rounded-xl sm:rounded-2xl` and `p-4 sm:p-6` patterns are consistent across dashboard, costs, and workflows.
- praise: `text-slate-50` for primary text, `text-slate-400` for secondary -- consistent with Sovereign Sage.
- issue: [UX] **bg-slate-900 vs bg-slate-950 inconsistency.** The design system specifies `bg-slate-950` (#020617) for page background, but `workflows.tsx` uses `bg-slate-900` for its root container. The sidebar correctly uses `bg-[#020617]`. Dashboard cards use `bg-slate-800` for card backgrounds (correct). This creates a subtle but visible color mismatch between the workflows page and the sidebar/other pages.

## Summary

**Score: 7/10.** The changes deliver solid functionality -- workflow CRUD, cancel streaming, and WebSocket toast notifications all work as designed. The Sovereign Sage visual language is mostly consistent, and responsive patterns follow established conventions.

**Key concerns pulling the score down:**

1. **Accessibility gaps in workflows.tsx** -- modals lack focus traps, keyboard navigation is missing on clickable divs, and several interactive elements fall below 44px touch targets. This is the most impactful issue for mobile users.

2. **Architecture duplication** -- `workflows.tsx` re-implements all query/mutation logic that already exists in `use-queries.ts`, with divergent query keys that will cause cache invalidation bugs. This should be refactored before the code accumulates more consumers.

3. **Toast flooding potential** in ws-store.ts on flaky connections needs debouncing.

4. **Cancel button UX** is functional but the error path is silent and there's no undo/confirmation for a destructive action.

**What's done well:** Loading skeletons, Korean localization, step visualization, conditional cancel button rendering, smart reconnection toast guards, and consistent layout spacing across the codebase.
