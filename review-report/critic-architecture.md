# Critic-Architecture Report

## Score: 7/10

## Findings

### HIGH Risk Files

#### packages/server/src/lib/ai.ts
- **[ARCH] Cancel logic lives in lib/ai.ts, which is correct (E8 boundary respected).** The cancel mechanism (`activeStreamingSessions`, `cancelStreamingSession`, `isSessionStreaming`) operates in `lib/ai.ts` — the "legacy" streaming path — not inside `engine/`. This is correct because `engine/agent-loop.ts` has its own `activeSessions` map (line 17) for the E8-compliant engine path, and `lib/ai.ts` serves the older direct-chat streaming path. No E8 violation here.
- **[RACE] Cancel flag is checked only between tool rounds, not mid-stream.** The `streamState.cancelled` flag is checked at two points: (1) top of the tool-round loop (line 457), (2) inside the `stream.on('text')` callback (line 474). However, the `await stream.finalMessage()` on line 479 is a blocking call that waits for the full Anthropic response. If a user cancels during this await, the cancel won't take effect until the entire LLM response finishes and the next round starts. The `stream.on('text')` handler silently drops tokens but doesn't abort the HTTP request. Suggestion: call `stream.controller.abort()` or equivalent to terminate the Anthropic stream when cancelled, so the user doesn't wait for a full LLM turn to complete.
- **[INDENT] Misaligned code in try block (line 362-363).** The `return await _generateAgentResponseStreamInner(...)` line has incorrect indentation — it's at 2-space indent inside a 4-space `try` block. This is a cosmetic issue but violates consistent style.
- **[DRY] `generateAgentResponse` (non-streaming) has no cancel support.** FR66 cancel is only wired into the streaming path. If a non-streaming call is in progress (line 106), there is no way to cancel it. This may be intentional if non-streaming is only used internally, but worth documenting.

#### packages/server/src/routes/workspace/chat.ts
- **[API] Inconsistent response envelope format.** The cancel endpoint (line 447, 451, 456) returns `{ success: false, error: { code, message } }` format, which matches the project convention. But the success case (line 469) returns `{ success: true, data: { cancelled: true } }`. Meanwhile, all other endpoints in this file return `{ data: ... }` without a `success` field (lines 48, 75, 320, 342, etc.). The cancel endpoint introduces a new pattern (`success` field) that diverges from the rest of the file. Suggestion: either add `success` to all endpoints (breaking change) or remove it from the cancel endpoint for consistency within this file.
- **[AUTHZ] Cancel endpoint doesn't check if the streaming session belongs to the lib/ai.ts path vs engine path.** The `isSessionStreaming()` only checks `activeStreamingSessions` in `lib/ai.ts`. If the session was started through the engine path (`engine/agent-loop.ts`), the cancel API will return "not active" even though the session is running. This could confuse users. Suggestion: document or unify cancel support across both execution paths.
- **[RACE] TOCTOU between isSessionStreaming and cancelStreamingSession.** Lines 450-454: the check `isSessionStreaming()` and the actual `cancelStreamingSession()` are not atomic. The session could complete between the two calls, making `cancelStreamingSession` return false. The 500 error on line 456 ("CANCEL_FAILED") is misleading in this case — the session simply finished. Suggestion: remove the separate `isSessionStreaming` check and just call `cancelStreamingSession` directly; if it returns false, return a 409 "session already completed" instead of 500.

### MEDIUM Risk Files

#### packages/app/src/stores/ws-store.ts
- **[UX] Toast spam potential on flaky connections.** If the WebSocket connection is unstable (e.g., mobile network), every disconnect/reconnect cycle produces two toasts: "disconnected" + "reconnected". With exponential backoff starting at 3s, rapid reconnects could flood the user with toasts. Suggestion: debounce or rate-limit toast notifications (e.g., max 1 disconnect toast per 30s).
- **[PATTERN] Good use of `wasDisconnected` guard** to avoid toast on initial connect. Clean implementation.

#### packages/app/src/components/chat/chat-area.tsx
- **[UX] Cancel error handling falls back to local `stopStream()` but doesn't inform user.** Line 243: if the cancel API fails, the catch block calls `stopStream()` (local-only disconnect from WebSocket stream) but shows no toast/error to the user. The user sees the stream stop but doesn't know if the server-side processing continues (and consumes API credits). Suggestion: show a warning toast like "Server cancel failed; stream stopped locally but AI may still be processing."
- **[PATTERN] Good accessibility: `aria-label` and `data-testid` on cancel button.** Follows existing patterns.

#### packages/app/src/hooks/use-queries.ts
- **[DRY] `WorkflowStep` type is duplicated in 3+ locations.** `use-queries.ts` (line 224), `workflows.tsx` (line 8), and `shared/types.ts` (line 1031) all define `WorkflowStep`. The `shared/types.ts` version is the canonical source but has fewer fields (missing `name`, `agentId`, `trueBranch`, `falseBranch`, `systemPrompt`, `timeout`, `retryCount`). The app-side definitions have diverged significantly with extra fields. Suggestion: update `@corthex/shared` `WorkflowStep` to include all fields, then import from shared in both `use-queries.ts` and `workflows.tsx`.
- **[PATTERN] Hooks follow existing patterns well.** `useWorkflows`, `useWorkflowDetail`, `useWorkflowExecutions` all use the same `useQuery` + `api.get` pattern with `enabled` guards. `useWorkflowMutations` follows the compound-hook pattern from `useDelegationRuleMutations`. Clean.

#### packages/app/src/pages/workflows.tsx (NEW, 830 lines)
- **[ARCH] Monolithic file — should be split into 4+ files.** 830 lines with 4 components (`WorkflowsPage`, `ExecutionCard`, `DeleteConfirmModal`, `WorkflowFormModal`) and 6 local type definitions. The `WorkflowFormModal` alone is ~210 lines. Suggestion: extract into `pages/workflows/index.tsx` (main page), `pages/workflows/workflow-form-modal.tsx`, `pages/workflows/execution-card.tsx`, and `components/delete-confirm-modal.tsx` (the delete modal is generic and reusable).
- **[DRY] Queries and mutations are defined inline instead of using `use-queries.ts` hooks.** Lines 94-165 define 7 inline `useQuery`/`useMutation` calls that duplicate the exact same API calls already defined in `use-queries.ts` (`useWorkflows`, `useWorkflowDetail`, `useWorkflowExecutions`, `useWorkflowSuggestions`, `useWorkflowMutations`). This means any API URL change needs updating in two places. Suggestion: import and use the hooks from `use-queries.ts` instead of re-declaring them.
- **[DRY] `WorkflowStep`, `Workflow`, `Execution`, `StepSummary`, `Suggestion`, `ListMeta` types are all duplicated from `use-queries.ts`.** Six type definitions appear in both files with slight variations (e.g., `workflows.tsx` has `StepSummary` which `use-queries.ts` doesn't). These should be in a single shared location.
- **[UX] No loading/error states on mutations.** The create/update/delete mutations show `toast.error` on failure but the UI doesn't show inline error states. The execute button shows "executing..." but if the mutation hangs, there's no timeout or cancel. Minor issue for now.

#### packages/app/src/App.tsx
- **[PATTERN] Clean lazy-load integration.** The `WorkflowsPage` import follows the established pattern. No issues.

#### packages/app/src/components/sidebar.tsx
- **[PATTERN] Clean nav entry addition.** Follows existing icon import and section structure. No issues.

### LOW Risk Files (spot check)
- 18 files with layout/spacing changes only were not individually reviewed. Based on the diff summary (+/- counts), these appear to be CSS/spacing adjustments consistent with design system updates. No architectural concerns.

## Summary

**Winston (Architect):** The cancel feature (FR66) is architecturally sound — it correctly stays in `lib/ai.ts` without breaching the E8 engine boundary. The main concern is that the cancel mechanism is cooperative (flag-based), meaning in-flight LLM calls run to completion before the flag is checked. For a user-facing cancel button, this could mean waiting 10-30 seconds with no visible effect. The TOCTOU race in the cancel endpoint could produce misleading 500 errors. The API envelope inconsistency (`success` field appears only in the cancel endpoint) should be normalized.

**Amelia (Dev):** `packages/app/src/pages/workflows.tsx` is the biggest concern — 830 lines with duplicated types and queries that already exist in `packages/app/src/hooks/use-queries.ts`. Six types and 7 query/mutation hooks are copy-pasted. The `shared/types.ts` `WorkflowStep` is also stale (missing 7 fields vs the app-side definition). This will cause drift bugs. Split the page, delete the inline queries, and update the shared type.
