# Phase 0-1 Critic-C Review (Tech+Perf)

**Reviewer:** Amelia (Frontend Dev) + Bob (Performance)
**Model:** opus | **Round:** 1

## Findings

### Issue 1 (Amelia): Component file paths need verification
- Several component paths listed (e.g., `components/chat/session-panel.tsx`) — are these actual paths from `git ls-files`?
- If any are wrong, Phase 7 integration will fail when importing
- **Severity:** Medium — writer should have verified against actual file listing

### Issue 2 (Bob): SSE reconnection strategy not documented
- What happens when SSE connection drops mid-stream?
- Does client auto-reconnect? EventSource vs fetch-based SSE?
- Hub uses `POST` for SSE — standard EventSource only supports GET, so this must be fetch-based
- **Severity:** Medium — critical for real-time UX reliability

### Issue 3 (Amelia): 3-layer caching impact on UXUI not explained
- D17 Prompt Cache, D18 Tool Cache, D19 Semantic Cache mentioned but:
- Does semantic cache affect UI? (e.g., cached response indicator? faster response time display?)
- Does tool cache produce visible UI changes?
- **Severity:** Low — mostly backend-only, but cache-hit indicators could be a design element

### Issue 4 (Bob): Bundle splitting strategy documented (lazy routes) but missing:
- Estimated bundle sizes per route
- Which routes share code chunks (React Flow is heavy — only NEXUS needs it)
- Third-party dep sizes: React Flow (~200KB), ELK.js (~150KB), syntax highlighter
- **Severity:** Low — can be detailed in Phase 2

## Score: 8.0/10
Solid implementation spec. SSE reconnection gap is the most impactful issue for UXUI.
