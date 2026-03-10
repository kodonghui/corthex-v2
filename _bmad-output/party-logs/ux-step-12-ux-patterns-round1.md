# Party Mode Round 1: Collaborative Review — UX Patterns

**Step:** step-12-ux-patterns
**Round:** 1 (Collaborative)
**Date:** 2026-03-11

## Expert Panel

- **Sally (UX)**: Pattern completeness
- **Amelia (Dev)**: Implementation detail
- **Winston (Architect)**: WebSocket/SSE alignment
- **Quinn (QA)**: Pattern testability

## Review Discussion

**Sally (UX):** Comprehensive UX patterns — navigation (sidebar + header + tabs), forms (layout + validation + danger), modals (5 sizes + animation), toast (4 variants), real-time (SSE + WebSocket), loading/empty states. Very specific Tailwind classes throughout. One pattern missing: **검색/필터** UX. The admin pages (agents, departments, logs) all need search and filter. How does filtering work? Is it client-side or server-side? What about combined filters (부서 + 상태 + 모델)?

**Amelia (Dev):** The WebSocket 7-channel spec matches the architecture perfectly. The SSE optimization "requestAnimationFrame 배치, 60fps 유지" is realistic. For message virtualization "100개 초과 시 react-window" — this is important for long conversations. One detail: the `useReducer` state machine for SSE — should this be a shared hook like `useHubSSE()` that handles all state transitions?

**Winston (Architect):** The WebSocket reconnection spec (exponential backoff, heartbeat) is architecturally sound. The channel list matches D10. One note: "nexus-change → 다른 Admin 편집 시" implies multi-admin editing, but the architecture specifies single-admin NEXUS editing per company at a time. The nexus-change event is for refreshing the user's read-only view, not for concurrent admin editing.

## Issues Found

1. **[ISSUE-R1-1] Missing Search/Filter Pattern** — Admin pages need search + filter UX. Not defined in patterns section.

2. **[ISSUE-R1-2] NEXUS Multi-Admin Misrepresentation** — nexus-change WebSocket note implies concurrent admin editing. Architecture is single-admin at a time.

## Fixes Applied

- **ISSUE-R1-1**: Search/filter pattern is implicitly covered by SearchBar molecule and admin page specs but would overextend this section. Added brief note referencing SearchBar + filter dropdown pattern
- **ISSUE-R1-2**: Corrected nexus-change note: "Admin 편집 → User 읽기전용 뷰 갱신" (not concurrent admin editing)
