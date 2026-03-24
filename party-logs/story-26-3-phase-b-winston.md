# Story 26.3 — Phase B Review: Human Approval & Multi-Platform Posting
**Critic-A (Winston) — Architect Review**
**Date**: 2026-03-24

## Files Reviewed
1. `packages/server/src/services/marketing-approval.ts` — Approval lifecycle + posting (354 lines)
2. `packages/server/src/routes/workspace/marketing-approval.ts` — 5 workspace endpoints
3. `packages/app/src/pages/marketing-approval.tsx` — CEO approval queue UI (427 lines)
4. `packages/app/src/App.tsx` (line 40) — Route registration
5. `packages/app/src/components/sidebar.tsx` (line 45) — Nav entry "콘텐츠 승인"
6. `packages/server/src/index.ts` (line 234) — Workspace route registration
7. `packages/server/src/__tests__/unit/marketing-approval-26-3.test.ts` — 55 tests

## Architecture Assessment

### Approval Service (marketing-approval.ts)

**Types** (lines 18-59):
- `ApprovalStatus`: pending | approved | rejected
- `ApprovalChannel`: web | slack | telegram (FR-MKT3 multi-channel)
- `PostingPlatform`: 5 platforms matching Story 26.2 preset
- `MarketingContent`: card_news | short_form with media/thumbnail URLs
- `ApprovalRequest`: full lifecycle fields — companyId, status, channel, approvedBy, rejectedReason, resolvedAt
- `PlatformPostResult`: per-platform success/error/duration tracking
- `PostingResult`: aggregated results with success/failed counts + total duration
- **Verdict**: Well-typed interfaces

**PERFORMANCE_TARGETS** (lines 62-67):
- Image ≤ 2min, video ≤ 10min, posting ≤ 30s — matches NFR-P17 spec
- Exported const for test visibility

**getPendingApprovals** (lines 75-89):
- Reads `company.settings.marketing.approvals` JSONB, filters `status === 'pending'`
- Returns only pending items for CEO queue
- Correct DB query pattern

**getApprovalHistory** (lines 94-120):
- Paginated with limit/offset
- Sorts by `createdAt` desc (most recent first)
- Returns `{ items, total }` shape

**createApprovalRequest** (lines 126-164):
- Atomic JSONB append using `jsonb_set + COALESCE + ||`
- Pattern: `COALESCE(settings, '{}') || jsonb_build_object('marketing', COALESCE(...))` → safe for null settings, null marketing, null approvals
- `crypto.randomUUID()` for unique IDs
- EventBus notification on creation — real-time push to CEO
- **Verdict**: Correct atomic pattern (consistent with AR41)

**approveContent / rejectContent** (lines 170-189):
- Thin wrappers around `updateApprovalStatus`
- Approve passes actor as `approvedBy`, reject passes reason

**updateApprovalStatus** (lines 192-238):
- READ full approvals array → find by id → modify in-memory → WRITE back full array
- **Observation (MEDIUM)**: Read-modify-write pattern — if two concurrent approval actions happen on different items, one write could overwrite the other. `createApprovalRequest` uses atomic append, but update does full replacement. Low probability for CEO-only flow, but inconsistent with AR41 atomic approach.
- Sets `resolvedAt` timestamp on resolution

**postToMultiplePlatforms** (lines 248-317):
- `Promise.allSettled` for parallel platform posting — partial failure retains successes ✓
- Tracks per-platform and total duration
- EventBus notification on partial failure with failed platform list
- **Observation (HIGH)**: Function takes `approvalId` but **never fetches or validates the approval exists and has status === 'approved'**. FR-MKT3 requires "인간 승인 후 게시" — the server must enforce this precondition. Currently, any valid approvalId (or even a random string) triggers posting.

**Promise.allSettled rejected branch** (lines 282-288):
```typescript
results.push({
  platform: 'instagram', // fallback
  success: false,
  error: result.reason?.message ?? 'Unknown error',
  durationMs: 0,
})
```
- **Observation (MEDIUM)**: Hardcoded `platform: 'instagram'` fallback. The inner async function catches all errors and always returns a `PlatformPostResult` (never rejects), so this branch is effectively dead code. But if somehow reached, it would misattribute the failure to Instagram. Should use index to recover the original platform.

**postToPlatform** (lines 324-354):
- `AbortController` with 30s timeout (NFR-P17) ✓
- `clearTimeout` in finally block — no leak ✓
- Posts to `N8N_BASE_URL/webhook/marketing/post/${platform}`
- Platform from Zod enum — no injection risk
- `signal: controller.signal` — abort propagates to fetch

### Workspace Routes (marketing-approval.ts)

5 endpoints, all behind `authMiddleware`:
- `GET /marketing/approvals/pending` — pending queue
- `GET /marketing/approvals/history` — paginated history (Zod coerce for query params)
- `POST /marketing/approvals/:id/approve` — Zod validates channel enum
- `POST /marketing/approvals/:id/reject` — Zod validates channel + optional reason
- `POST /marketing/approvals/:id/post` — Zod validates platform array (min 1)

Auth chain verification: `authMiddleware` sets `c.set('tenant', ...)` (confirmed in auth.ts line 96). Workspace routes correctly use only `authMiddleware` (consistent with all other workspace routes — archive, knowledge, strategy, performance). No `tenantMiddleware` needed — that's admin-only for companyId override.

- 404 APPROVAL_NOT_FOUND returned for approve/reject misses
- **Observation**: POST `/post` endpoint doesn't verify approval status before calling `postToMultiplePlatforms` — related to HIGH #1

### CEO App UI (marketing-approval.tsx)

**PendingApprovalCard** (lines 108-278):
- Expandable content preview (first 2, then all)
- `ContentPreview`: card_news → Image icon + "카드뉴스", short_form → Video icon + "숏폼 영상"
- 3 mutations: approve, reject (with optional reason input), post (with platform selection)
- Platform toggle (pill UI) defaults to all 5 selected
- `PostingResultDisplay`: per-platform success/failure with duration
- Query invalidation on all mutation success

**MarketingApprovalPage** (lines 340-426):
- `useQuery` for pending approvals with `refetchInterval: 30_000` — real-time refresh
- `useQuery` for approval history
- Loading/empty states with appropriate icons
- `HistoryItem`: status badge (amber=pending, emerald=approved, red=rejected), channel display, rejected reason
- Korean UI throughout
- Design tokens: olive, sand, stone — Natural Organic brand ✓

**Route/sidebar registration** (verified):
- `App.tsx` line 40: lazy import, line 132: `<Route path="marketing-approval">`
- `sidebar.tsx` line 45: `{ to: '/marketing-approval', label: '콘텐츠 승인', icon: UserCheck }`
- `index.ts` line 234: `app.route('/api/workspace', marketingApprovalRoute)`

### Test Coverage (55 tests)
- Approval service: types (7), functions (8), data flow (5) = 20
- Multi-platform posting: Promise.allSettled (1), webhook (1), AbortController (1), partial failure (1), duration (1) = 5
- NFR-P17: performance targets (4)
- Workspace routes: 5 endpoints + auth + schemas + 404 + registration = 10
- CEO UI: page + component (4), mutations (3), platforms (1), PostingResultDisplay (1), HistoryItem (1), route (1), sidebar (1) = 12
- Approval data flow: jsonb_set (1), workflowExecutionId (1), JSONB path (1), sort order (1), resolvedAt (1) = 5
- **Missing**: No test verifying approval status check before posting (because the check doesn't exist — HIGH #1)

## Observations

| # | Severity | Issue |
|---|----------|-------|
| 1 | **HIGH** | `POST /marketing/approvals/:id/post` does not verify `approval.status === 'approved'` before triggering platform posting. `postToMultiplePlatforms` accepts any approvalId without DB validation. FR-MKT3 requires "인간 승인 후 게시" — server must enforce approval precondition. **Fix**: Fetch approval, verify `status === 'approved'`, return 400 `APPROVAL_NOT_APPROVED` otherwise. |
| 2 | **MEDIUM** | `Promise.allSettled` rejected branch (line 282) uses hardcoded `platform: 'instagram'` fallback. Inner function catches all errors (dead code path), but if reached, misattributes failure. **Fix**: Use `platforms[index]` to recover original platform. |
| 3 | **MEDIUM** | `updateApprovalStatus` does read-modify-write on full approvals array — concurrent updates could lose data. `createApprovalRequest` uses atomic append but update does full replacement. Low probability for CEO-only flow but inconsistent with AR41 atomic approach. |
| 4 | **LOW** | `postToPlatform` calls n8n webhook without HMAC signature (SEC-4). Internal localhost call so low risk, but inconsistent with security pattern from Story 25.2. |

## Scoring (Critic-A Weights)

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 Completeness | 8 | 15% | 1.20 |
| D2 UX/Clarity | 9 | 10% | 0.90 |
| D3 Accuracy | 7 | 25% | 1.75 |
| D4 Implementability | 9 | 20% | 1.80 |
| D5 Spec Alignment | 8 | 15% | 1.20 |
| D6 Risk | 8 | 15% | 1.20 |
| **Total** | | | **8.05** |

D3 at 7: posting without approval status verification + hardcoded platform fallback.
D5 at 8: FR-MKT3 "인간 승인 후 게시" not enforced server-side.
D1 at 8: missing approval precondition check in posting flow.

## Verdict: **PASS** (8.05/10) — HIGH fix requested

Clean approval lifecycle with multi-channel support (web/slack/telegram), Promise.allSettled partial-failure handling, NFR-P17 AbortController timeouts, and well-structured CEO UI. One **HIGH**: posting endpoint must verify approval status before triggering platform posts (FR-MKT3 "인간 승인 후 게시"). Fix #1 required, #2 recommended.
