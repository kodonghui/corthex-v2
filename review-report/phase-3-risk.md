# Phase 3: Risk Classification

## File Classification

| Risk | File | Score | Reason |
|------|------|-------|--------|
| HIGH | packages/server/src/lib/ai.ts | 10 | Core AI engine, cancel session logic |
| HIGH | packages/server/src/routes/workspace/chat.ts | 10 | API endpoint, auth/session handling |
| MEDIUM | packages/app/src/stores/ws-store.ts | 5 | State management, WebSocket reconnect |
| MEDIUM | packages/app/src/components/chat/chat-area.tsx | 5 | Stateful component, cancel UX |
| MEDIUM | packages/app/src/hooks/use-queries.ts | 5 | State management, 5 new query hooks |
| MEDIUM | packages/app/src/pages/workflows.tsx | 5 | New page, 830 lines, CRUD logic |
| MEDIUM | packages/app/src/App.tsx | 5 | Routing changes |
| MEDIUM | packages/app/src/components/sidebar.tsx | 5 | Navigation entry point |
| LOW | packages/app/src/pages/dashboard.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/command-center/index.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/costs.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/reports.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/activity-log.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/sns.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/settings.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/notifications.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/classified.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/agents.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/departments.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/files.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/knowledge.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/org.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/performance.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/tiers.tsx | 1 | Layout/spacing only |
| LOW | packages/app/src/pages/login.tsx | 1 | Whitespace only |
| LOW | packages/app/src/pages/ops-log.tsx | 1 | Layout/spacing only |

## Summary
- HIGH: 2 files (20 points)
- MEDIUM: 6 files (30 points)
- LOW: 18 files (18 points)
- **Total: 68 points → "Ask" (full review)**

## Verdict: FULL REVIEW REQUIRED
