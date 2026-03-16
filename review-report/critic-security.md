# Critic-Security Report

## Score: 7/10

## Findings

### HIGH Risk Files

#### packages/server/src/lib/ai.ts

- issue: [SECURITY] **In-memory session map has no companyId scoping** at line 334. The `activeStreamingSessions` map is keyed solely by `sessionId`. While the cancel API endpoint verifies session ownership via DB query (companyId + userId), the `cancelStreamingSession()` function itself accepts any sessionId with no tenant isolation. If any other code path calls `cancelStreamingSession()` directly (bypassing the route), it could cancel sessions belonging to other companies. This is a defense-in-depth concern.
- suggestion: [SECURITY] Consider keying the map as `${companyId}::${sessionId}` or passing companyId to `cancelStreamingSession()` as a secondary check, so the lib function itself enforces tenant boundaries independent of the caller.

- issue: [SECURITY] **Race condition: cancel flag checked only between rounds, not during tool execution** at lines 457-462, 474. The cancellation check happens (a) before each tool round starts and (b) during text streaming events. However, if a long-running tool execution is in progress (e.g., `executeTool` or `mcpCallToolStream` at lines 524-553, 569), the cancel flag is not checked mid-tool. This means a cancel request during a slow MCP tool call will not take effect until the tool finishes and the next round begins, potentially wasting significant API cost.
- suggestion: [SECURITY] Pass the `streamState` / AbortSignal to `mcpCallToolStream` and `executeTool` so they can check for cancellation mid-execution. Alternatively, use the Anthropic SDK's `stream.abort()` method to immediately halt the active API call when cancelled.

- issue: [SECURITY] **Leaked API key lifetime in memory** at line 34. The decrypted API key is passed directly to `new Anthropic({ apiKey })` and persists in the client object for the duration of the request. While this is a necessary pattern, the `Anthropic` client instance is created per-request and not cached, which is correct. No finding here beyond noting it is correctly scoped.
- suggestion: [SECURITY] No action needed; the current per-request pattern is acceptable. (Noting for completeness.)

- issue: [SECURITY] **Error messages in stream broadcast may leak internal details** at line 304 (chat.ts streamTask) and line 332 (ai.ts StreamEvent error type). When an unexpected error occurs, `err.message` is broadcast to the client via WebSocket. Depending on the error source (DB connection strings, internal paths, etc.), this could leak sensitive infrastructure information to the frontend.
- suggestion: [SECURITY] Sanitize error messages before broadcasting to the client. Use a generic message like "AI processing failed" for unexpected errors, and only pass through known safe error strings (e.g., rate limit, token not found).

#### packages/server/src/routes/workspace/chat.ts

- issue: [SECURITY] **No UUID format validation on sessionId path parameter in cancel endpoint** at line 437. The `sessionId` is taken from `c.req.param('sessionId')` without any format validation. While the DB query with `eq(chatSessions.id, sessionId)` would fail to match non-UUID values, passing arbitrary strings to the DB query and to `isSessionStreaming()` / `cancelStreamingSession()` introduces unnecessary attack surface. Other endpoints in the same file (e.g., createSession at line 23) validate `agentId` as UUID via zod, but no path params are validated.
- suggestion: [SECURITY] Add a shared zod param validator or middleware to validate `:sessionId` as UUID format before processing. Example: `const sessionIdSchema = z.string().uuid()` applied as a pre-check.

- issue: [SECURITY] **Activity log contains raw sessionId, potential information disclosure** at line 466. The `detail` field in `logActivity()` contains the raw sessionId: `세션 ${sessionId} 작업 취소`. If activity logs are viewable by other users (e.g., admins of a different company), session IDs could be exposed. This is a minor concern as sessionIds are UUIDs with no inherent meaning, but coupling with the log viewer's access control matters.
- suggestion: [SECURITY] Verify that activity log queries are always scoped to `companyId`. If they are (which appears likely given the pattern), this is acceptable. Otherwise, avoid including session IDs in user-visible log entries.

- issue: [SECURITY] **TOCTOU race between isSessionStreaming() and cancelStreamingSession()** at lines 450-454. There is a race window between checking `isSessionStreaming(sessionId)` and calling `cancelStreamingSession(sessionId)`. If the stream finishes naturally between these two calls, `cancelStreamingSession()` returns false and the user gets a 500 error ("CANCEL_FAILED"). While not a security vulnerability per se, it is a reliability issue that could confuse users.
- suggestion: [SECURITY] Combine the check-and-cancel into a single atomic operation, or handle the case where `cancelStreamingSession` returns false after `isSessionStreaming` returned true by returning a more appropriate response (e.g., "session already completed").

### MEDIUM Risk Files

#### packages/app/src/stores/ws-store.ts

- issue: [SECURITY] **WebSocket token passed as URL query parameter** at line 41. The token is passed via `ws?token=${token}` in the URL. Query parameters can be logged in server access logs, proxy logs, browser history, and Referer headers. While this is a common pattern for WebSocket auth (since WS does not support custom headers in the browser API), it increases the surface for token leakage.
- suggestion: [SECURITY] This is an inherent limitation of the browser WebSocket API. Mitigate by: (1) ensuring the token is short-lived, (2) rotating tokens on reconnect, (3) ensuring server access logs redact query parameters. Document this as an accepted risk.

- issue: [SECURITY] **No token refresh on reconnect** at line 66. When the WebSocket reconnects after disconnect (`setTimeout(() => get().connect(token), delay)`), it reuses the original `token` from the closure. If the token has expired during the disconnect period, reconnection will fail silently or with an auth error, but the user will see "reconnecting..." indefinitely.
- suggestion: [SECURITY] Before reconnecting, refresh the token (e.g., call a token refresh endpoint) so stale tokens don't cause infinite reconnect loops.

#### packages/app/src/components/chat/chat-area.tsx

- issue: [SECURITY] **Cancel API failure silently falls back to local-only stopStream()** at lines 242-244. When the cancel API call fails (network error, 500, etc.), the catch block calls `stopStream()` which only stops the local stream listener without actually cancelling the server-side generation. This means the AI continues generating (and incurring costs) on the server, but the user sees it as "cancelled."
- suggestion: [SECURITY] Show a toast warning when server-side cancel fails, so the user knows the backend is still processing. Consider retrying the cancel request once before falling back to local-only stop.

- issue: [SECURITY] **renderTextWithLinks allows arbitrary internal navigation** at lines 34-73. The `renderTextWithLinks` function renders markdown-style links. For internal paths (`href.startsWith('/')`), it creates a button that calls `onNavigate(href)`. This is safe from XSS since React's event handling prevents injection, but a malicious AI response could craft links that navigate to unexpected internal routes (e.g., `/settings` to trick users into changing settings).
- suggestion: [SECURITY] Consider whitelisting allowed internal route prefixes for AI-generated links, or visually distinguishing AI-generated links from system UI links.

#### packages/app/src/hooks/use-queries.ts

- issue: [SECURITY] **No input sanitization on URL-interpolated IDs in query functions** at lines 269-283. Workflow IDs, execution IDs, and suggestion IDs are interpolated directly into URL paths (e.g., `` `/workspace/workflows/${id}` ``). While these values come from server responses (not direct user input) and the `api` wrapper likely handles URL encoding, a compromised or malformed server response could inject path traversal characters.
- suggestion: [SECURITY] Ensure the `api.get()`/`api.post()` wrapper encodes path segments, or add `encodeURIComponent()` around interpolated IDs as a defense-in-depth measure.

#### packages/app/src/pages/workflows.tsx

- issue: [SECURITY] **Workflow form does not sanitize step action/name before submission** at lines 671-679. The `handleSubmit` function sends user-provided `name`, `description`, and step `action` values directly to the API without client-side sanitization. While server-side validation is the primary defense, XSS-safe rendering on the display side (which React provides by default) and server-side input validation are both needed.
- suggestion: [SECURITY] Verify that the server-side workflow creation endpoint validates and sanitizes step names and actions. Client-side, React's JSX escaping handles display, but ensure no `dangerouslySetInnerHTML` is used when rendering these values.

#### packages/app/src/App.tsx

- issue: [SECURITY] No security findings. The `/workflows` route is properly wrapped in `ProtectedRoute` which checks authentication. The lazy import pattern is standard.
- suggestion: N/A

#### packages/app/src/components/sidebar.tsx

- issue: [SECURITY] No security findings. The sidebar change only adds a static navigation entry for workflows. No dynamic content or user input involved.
- suggestion: N/A

## Summary

The cancel session feature (FR66) is implemented with **proper session ownership verification** -- the cancel API correctly checks `companyId + userId` before allowing cancellation, which is the most critical security requirement. The overall authorization model is sound.

**Key concerns:**

1. **Defense-in-depth gap**: The in-memory `activeStreamingSessions` map has no tenant isolation at the library level, relying entirely on the route layer for access control.
2. **Race conditions**: The cancel-check flow has a TOCTOU race, and cancellation does not propagate into active tool executions or streaming API calls, meaning cancelled sessions can still incur cost.
3. **Error message leakage**: Internal error messages are broadcast to clients via WebSocket without sanitization.
4. **WebSocket token in URL**: Inherent browser limitation, but should be documented and mitigated with short-lived tokens.

None of these are critical/exploitable vulnerabilities in the current architecture. The score of 7/10 reflects solid auth patterns with room for hardening on defense-in-depth and race condition handling.
