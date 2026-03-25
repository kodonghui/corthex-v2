# Story 26.3 Phase B Review — Critic-C (John, Product + Delivery)

## AC Verification

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| FR-MKT2 | 6-stage pipeline posting + partial failure | PASS | `postToMultiplePlatforms()` uses `Promise.allSettled` — partial failure retains successful platforms. Results tracked per-platform with success/error/durationMs. EventBus notification for partial failures with failed platform list. |
| FR-MKT3 | Approval via web/Slack/Telegram | PASS | `ApprovalChannel = 'web' \| 'slack' \| 'telegram'`. `approveContent()` + `rejectContent()` accept channel param. Zod validates `z.enum(['web', 'slack', 'telegram'])`. CEO web UI sends `channel: 'web'`. |
| NFR-P17 | Performance targets (30s per platform) | PASS | `PERFORMANCE_TARGETS.postingMaxMs = 30 * 1000`. `postToPlatform()` uses `AbortController` with `setTimeout(controller.abort, 30000)`. `clearTimeout` in finally block. |

## Dimension Scores (Critic-C Weights)

| Dim | Dimension | Score | Weight | Notes |
|-----|-----------|-------|--------|-------|
| D1 | Specificity | 9 | 20% | Clear type system: 3 statuses, 3 channels, 5 platforms, 2 content types. NFR-P17 targets specified (2min/10min/30s). 5 endpoints with Zod schemas. EventBus payloads typed (marketing_approval + marketing_posting_partial_failure). Duration tracking per-platform + total. Korean notifications. |
| D2 | Completeness | 8 | 20% | FR-MKT2, FR-MKT3, NFR-P17 all covered. Full stack: service (7 functions) + workspace routes (5 endpoints) + CEO UI (approval queue + content preview + platform selection + posting results + history). 55 tests, 127 assertions. Loading/empty states. Pagination on history. |
| D3 | Accuracy | 7 | 15% | `Promise.allSettled` correct for partial failure. AbortController timeout correct for NFR-P17. But: `updateApprovalStatus` uses read-modify-write pattern (violates AR41 intent). Post endpoint doesn't verify approval is in 'approved' status before posting. Hardcoded 'instagram' fallback on allSettled rejection. |
| D4 | Implementability | 8 | 15% | Clean service separation. Zod on all POSTs. React Query with invalidation + 30s refetch. Content preview distinguishes card_news/short_form. Expandable approval cards. Platform toggle pills. But: potentially missing `tenantMiddleware` (only `authMiddleware` in route). JSONB array will scale poorly. |
| D5 | Consistency | 9 | 10% | Workspace route pattern (not admin). `{ success, data }` contract. Lucide icons. Status colors match project (amber/emerald/red). Korean UX throughout. 30s refetchInterval matches 25.4. `formatDate` with ko-KR locale. UserCheck sidebar icon. |
| D6 | Risk Awareness | 7 | 20% | EventBus notifications for approvals + partial failures. AbortController prevents stuck posts. 404 on missing approvals. But: read-modify-write race in updateApprovalStatus — concurrent approvals can overwrite each other. No authorization check before multi-platform posting. JSONB array grows unbounded. |

## Weighted Score

(9×0.20) + (8×0.20) + (7×0.15) + (8×0.15) + (9×0.10) + (7×0.20) = 1.80 + 1.60 + 1.05 + 1.20 + 0.90 + 1.40 = **7.95 / 10**

## Issues

| # | Severity | Description |
|---|----------|-------------|
| 1 | MEDIUM | **Read-modify-write race in `updateApprovalStatus`**: Lines 200-237 — reads full approvals array, finds index in JS, modifies, writes back entire array. Two concurrent operations (e.g., CEO approves on web while admin approves via Slack) could lose one update. `createApprovalRequest` correctly uses atomic jsonb append, but updates use the pattern AR41 was designed to prevent. **Fix**: Use SQL `jsonb_set` with array index path, or migrate approvals to a dedicated table. |
| 2 | MEDIUM | **Post endpoint doesn't verify approval status**: `POST /marketing/approvals/:id/post` calls `postToMultiplePlatforms(companyId, approvalId, platforms)` without checking that the approval is in `'approved'` status. A user could trigger multi-platform posting of pending or rejected content. **Fix**: In the route handler, fetch approval status and return `400 APPROVAL_NOT_APPROVED` if `status !== 'approved'`. |
| 3 | LOW | **Hardcoded 'instagram' fallback in allSettled rejection**: Line 284 — `platform: 'instagram'` as fallback when a promise fully rejects (vs fulfilled-with-error). The correct platform should be `platforms[index]`. In practice, the inner catch handles all errors so this path rarely triggers, but the attribution is wrong when it does. |
| 4 | LOW | **Potentially missing `tenantMiddleware`**: Line 24 — `marketingApprovalRoute.use('*', authMiddleware)` without `tenantMiddleware`. All handlers use `c.get('tenant')`. Other route files (25.3, 26.1, 26.2) explicitly include `tenantMiddleware`. If `authMiddleware` alone doesn't set tenant context, all endpoints will 500 at runtime. Verify or add `tenantMiddleware` to the chain. |
| 5 | LOW | **JSONB approvals array grows unbounded**: All approvals (pending + resolved) stored in `company.settings.marketing.approvals`. Over months of marketing automation, this array grows indefinitely. `getApprovalHistory` sorts and paginates in JS, not SQL. Consider: TTL-based archival, or migrate to a dedicated `marketing_approvals` table for SQL-level pagination. |

## Product Assessment

The approval flow is well-designed: pending queue → content preview → approve/reject → platform selection → multi-platform posting → results display. The UI separates the approval decision from the posting action, giving the CEO control over which platforms to target. The content preview cards distinguish card_news vs short_form with appropriate icons.

The `Promise.allSettled` pattern for multi-platform posting is the right choice — it ensures that a TikTok failure doesn't prevent a successful Instagram post from being retained. The per-platform duration tracking and EventBus notification for partial failures give the admin visibility into what went wrong.

The 30s AbortController timeout on `postToPlatform` correctly implements NFR-P17. The finally block ensures cleanup. The `PERFORMANCE_TARGETS` export makes the limits discoverable and testable.

However, two issues weaken the delivery:

1. **The read-modify-write race in `updateApprovalStatus`** contradicts the AR41 atomic update pattern used everywhere else in Epic 26. The `createApprovalRequest` correctly uses jsonb append, but the update path reads the full array into JS, modifies, and writes back. In a real scenario with Slack + web concurrent approvals, one could be silently lost.

2. **The post endpoint doesn't gate on approval status**, meaning rejected content could be posted to platforms. This is a business logic gap — the approval step exists to prevent unreviewed content from going public, and the posting endpoint bypasses this check.

55 tests provide good coverage of types, functions, routes, and UI, but they're all source-reading tests that can't catch the runtime issues above.

## Cross-Talk Notes

- **Winston/Amelia (Critic-A, Architecture)**: The `updateApprovalStatus` read-modify-write is the most architecturally concerning issue. AR41 explicitly mandates atomic jsonb_set to prevent this pattern. The fix options: (a) PostgreSQL `jsonb_set` with a subquery to find the array index, (b) use `jsonb_path_query_first` + array position, or (c) migrate to a dedicated table. Option (c) would also solve the unbounded growth issue.
- **Quinn/Dana (Critic-B, QA/Security)**: The missing status check before posting is a security-adjacent issue — it's not an auth bypass (user still needs to be authenticated), but it's a business logic bypass (rejected content can be posted). The `approvalId` is a UUID, so it's not guessable, but any authenticated user who knows the ID can trigger posting without approval. Additionally, verify that `authMiddleware` alone sets tenant context — if not, this entire route group returns 500s.

---

**Verdict: PASS (7.95/10)**

Epic 26 Critic-C running: 26.1=8.45, 26.2=8.45, 26.3=7.95, avg **8.28**
