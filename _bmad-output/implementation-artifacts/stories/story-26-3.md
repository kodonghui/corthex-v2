# Story 26.3: Human Approval & Multi-Platform Posting

## References
- FR-MKT2: Multi-platform simultaneous posting
- FR-MKT3: Human approval flow (web/Slack/Telegram)
- NFR-P17: Performance targets (posting ≤30s/platform)

## Acceptance Criteria
1. CEO can view pending approval queue in web UI
2. CEO can approve or reject content via web UI (Slack/Telegram channels supported)
3. Approved content posts to selected platforms simultaneously
4. Partial platform failure retains successful posts (Promise.allSettled)
5. Failed platforms notify admin with details
6. Each platform posting has 30s timeout (NFR-P17)
7. Approval history with pagination available
8. Performance targets defined (image ≤2min, video ≤10min, posting ≤30s)

## Implementation

### Service: `packages/server/src/services/marketing-approval.ts`
- Types: ApprovalStatus, ApprovalChannel, PostingPlatform, MarketingContent, ApprovalRequest, PlatformPostResult, PostingResult
- PERFORMANCE_TARGETS const (image 2min, video 10min, posting 30s)
- getPendingApprovals() — filters company approvals by status='pending'
- getApprovalHistory() — paginated (limit/offset), sorted by createdAt desc
- createApprovalRequest() — atomic JSONB append to company.settings.marketing.approvals
- approveContent() / rejectContent() — updates status, channel, resolvedAt
- postToMultiplePlatforms() — Promise.allSettled, tracks per-platform duration
- postToPlatform() — n8n webhook with 30s AbortController timeout

### Routes: `packages/server/src/routes/workspace/marketing-approval.ts`
- GET /marketing/approvals/pending — CEO pending queue
- GET /marketing/approvals/history — paginated history
- POST /marketing/approvals/:id/approve — approve with channel
- POST /marketing/approvals/:id/reject — reject with reason
- POST /marketing/approvals/:id/post — multi-platform posting
- All routes use authMiddleware
- Zod validation on all POST bodies

### CEO App: `packages/app/src/pages/marketing-approval.tsx`
- PendingApprovalCard with content preview, platform selection, approve/reject/post buttons
- ContentPreview for card_news and short_form types
- PostingResultDisplay showing per-platform success/failure
- HistoryItem with status badges
- 30s auto-refresh on pending queue
- Registered in App.tsx route "marketing-approval"
- Sidebar entry: '콘텐츠 승인' with UserCheck icon

### Tests: 48 tests covering FR-MKT3 types, functions, multi-platform posting, NFR-P17, routes, UI
