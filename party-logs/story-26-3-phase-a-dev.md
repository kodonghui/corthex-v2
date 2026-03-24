# Story 26.3 — Phase A: Implementation (dev)

## Story: Human Approval & Multi-Platform Posting
- References: FR-MKT2, FR-MKT3, NFR-P17
- Developer: dev (Writer)

## Implementation Summary

### Service Layer
Created `marketing-approval.ts` with complete approval lifecycle:
- **Type system**: ApprovalStatus, ApprovalChannel (web/slack/telegram), PostingPlatform (5 platforms), MarketingContent, ApprovalRequest, PlatformPostResult, PostingResult
- **PERFORMANCE_TARGETS**: image ≤2min, video ≤10min, posting ≤30s per platform
- **Approval management**: getPendingApprovals, getApprovalHistory (paginated), createApprovalRequest (atomic JSONB), approveContent, rejectContent
- **Multi-platform posting**: Promise.allSettled for partial failure, per-platform duration tracking, 30s AbortController timeout
- **Notifications**: EventBus events for approval requests and partial posting failures

### Routes
Created workspace routes with 5 endpoints:
- GET pending queue, GET history (paginated), POST approve, POST reject, POST multi-platform post
- Zod validation on all POST bodies (channel enum, platform array, reason string)
- 404 APPROVAL_NOT_FOUND for missing approvals

### CEO App UI
Created full approval page:
- PendingApprovalCard with content preview (card_news/short_form), platform selection toggles
- Approve/reject buttons with optional reject reason input
- PostingResultDisplay showing per-platform success/failure with duration
- HistoryItem with status badges (pending=amber, approved=emerald, rejected=red)
- 30s auto-refresh polling on pending queue
- Route + sidebar registration (UserCheck icon, '콘텐츠 승인')

### Tests
48 tests covering:
- FR-MKT3 approval service types and functions
- FR-MKT2 multi-platform posting with Promise.allSettled
- NFR-P17 performance targets
- Workspace routes with Zod validation
- CEO app UI components and data flow

## Files Changed
- `packages/server/src/services/marketing-approval.ts` (new)
- `packages/server/src/routes/workspace/marketing-approval.ts` (new)
- `packages/server/src/index.ts` (route registration)
- `packages/app/src/pages/marketing-approval.tsx` (new)
- `packages/app/src/App.tsx` (route + lazy import)
- `packages/app/src/components/sidebar.tsx` (nav entry)
- `packages/server/src/__tests__/unit/marketing-approval-26-3.test.ts` (new)
