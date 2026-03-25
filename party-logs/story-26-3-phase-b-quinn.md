# Critic-B (QA + Security) Implementation Review — Story 26.3

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-24

---

## AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 FR-MKT3: Approval lifecycle (pending/approved/rejected) | ✅ | `marketing-approval.ts`: `createApprovalRequest` (pending), `approveContent`/`rejectContent` with channel + actor. Stored in `company.settings.marketing.approvals` JSONB. |
| AC-2 FR-MKT3: Multi-channel approval (web/slack/telegram) | ✅ | `ApprovalChannel = 'web' | 'slack' | 'telegram'`. Zod validates `z.enum(['web', 'slack', 'telegram'])`. Channel recorded in `approvalChannel` field. |
| AC-3 FR-MKT2: Multi-platform posting (5 platforms) | ✅ | `postToMultiplePlatforms()` with `Promise.allSettled`. 5 platforms: instagram, tiktok, youtube_shorts, linkedin, x. Zod enum on POST route. |
| AC-4 FR-MKT2: Partial failure handling | ✅ | `Promise.allSettled` retains successful posts. EventBus notifies admin: `marketing_posting_partial_failure` with `failedPlatforms` list. |
| AC-5 NFR-P17: 30s per-platform timeout | ✅ | `postToPlatform()`: `AbortController` with `PERFORMANCE_TARGETS.postingMaxMs` (30s). `clearTimeout` in finally block. |
| AC-6 EventBus notifications | ✅ | `createApprovalRequest` emits `marketing_approval`. `postToMultiplePlatforms` emits `marketing_posting_partial_failure` on failures. |
| AC-7 Workspace routes | ✅ | 5 endpoints: pending, history, approve, reject, post. All behind `authMiddleware`. Zod validation on POST bodies. |
| AC-8 CEO app UI | ✅ | `marketing-approval.tsx`: PendingApprovalCard, ContentPreview, PostingResultDisplay, HistoryItem. Platform selection toggle. Approve/reject buttons with reason input. |
| AC-9 Route + sidebar | ✅ | CEO: `/marketing-approval` + "콘텐츠 승인" + UserCheck icon. |

## Security Assessment

### Service Layer (marketing-approval.ts)

| Check | Status | Evidence |
|-------|--------|----------|
| createApprovalRequest — atomic append | ✅ SAFE | `COALESCE(settings->'marketing'->'approvals', '[]'::jsonb) || ${JSON.stringify(request)}::jsonb` — atomic append, no read-modify-write. |
| updateApprovalStatus — read-modify-write | ⚠️ RACE | Reads full array, modifies in JS, writes back full array. Concurrent approve/reject could overwrite. See Issue #1. |
| postToMultiplePlatforms — no approval status check | ⚠️ BUG | Posts to platforms without verifying approval is in 'approved' status. See Issue #2. |
| postToPlatform — n8n webhook URL | ✅ SAFE | `${N8N_BASE_URL}/webhook/marketing/post/${platform}` — platform from Zod enum, N8N_BASE_URL from env (default localhost). |
| AbortController timeout cleanup | ✅ SAFE | `clearTimeout(timeout)` in finally block. No leaked timers. |
| Promise.allSettled rejected fallback | ⚠️ NOTE | Hardcoded `platform: 'instagram'` in rejected case. See Issue #3. |
| Approval UUID generation | ✅ SAFE | `crypto.randomUUID()` — unpredictable. |
| companyId isolation | ✅ SAFE | All functions take `companyId` param, query by `eq(companies.id, companyId)`. |

### Routes (marketing-approval.ts)

| Check | Status | Evidence |
|-------|--------|----------|
| Auth middleware | ✅ SAFE | `authMiddleware` — consistent with all workspace routes. Tenant context set via auth. |
| Zod validation on approve | ✅ SAFE | `channel: z.enum(['web', 'slack', 'telegram']).default('web')` |
| Zod validation on reject | ✅ SAFE | `channel` enum + `reason: z.string().max(500).optional()` |
| Zod validation on post | ✅ SAFE | `platforms: z.array(z.enum([...5 platforms...])).min(1)` |
| Pagination validation on history | ✅ SAFE | `z.coerce.number().min(1).max(100).default(20)` for limit, `min(0)` for offset. |
| 404 on missing approval | ✅ SAFE | Returns `APPROVAL_NOT_FOUND` with Korean message. Consistent format. |
| `{ success, data }` format | ✅ SAFE | All 5 endpoints consistent. |

### CEO App (marketing-approval.tsx)

| Check | Status | Evidence |
|-------|--------|----------|
| XSS via content title/description | ✅ SAFE | Rendered in JSX text content. React auto-escapes. |
| XSS via thumbnailUrl | ✅ SAFE | `<img src={content.thumbnailUrl}>` — React sanitizes src. No onerror handler. |
| XSS via rejectedReason | ✅ SAFE | Rendered in `<p>` text content with `truncate` class. React auto-escapes. |
| API path construction | ✅ SAFE | `approval.id` used in URL path — from server-generated UUID, not user text input. |
| Platform toggle safety | ✅ SAFE | `selectedPlatforms` state from hardcoded `PLATFORMS` array. |
| Pending queue auto-refresh | ✅ | `refetchInterval: 30_000` for near-real-time updates. |

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 9/10 | Types well-defined: 3 statuses, 3 channels, 5 platforms, 2 content types. NFR-P17 targets in constants. Duration tracking per-platform. |
| D2 완전성 | 25% | 8/10 | 55 tests, 127 assertions across 8 groups. Comprehensive coverage of types, functions, routes, UI, data flow. Missing: no test for post-without-approval-check gap. |
| D3 정확성 | 15% | 8/10 | Promise.allSettled correct. AbortController correct. Atomic append for creates correct. But: update is read-modify-write (known JSONB limitation). Hardcoded fallback platform. |
| D4 실행가능성 | 10% | 9/10 | 55/55 pass. Type-check clean. |
| D5 일관성 | 15% | 9/10 | Natural Organic theme. Korean labels (대기중/승인됨/거절됨). Status colors (amber/emerald/red). Workspace route pattern matches codebase. |
| D6 리스크 | 25% | 7/10 | Post endpoint doesn't verify approval status (can post rejected content). Read-modify-write race on updates. Unbounded JSONB array growth. All mitigated by single-CEO-user pattern but architecturally unsound. |

### 가중 평균: 0.10(9) + 0.25(8) + 0.15(8) + 0.10(9) + 0.15(9) + 0.25(7) = 8.10/10 ✅ PASS

---

## Issues (3)

### 1. **[D6] Post endpoint doesn't verify approval status** (MEDIUM)

```typescript
// marketing-approval.ts:248-317
export async function postToMultiplePlatforms(
  companyId: string, approvalId: string, platforms: PostingPlatform[]
): Promise<PostingResult> {
  // → Posts to platforms immediately
  // → No check that approvalId status is 'approved'
  // → Can post REJECTED or PENDING content
}

// Route: POST /marketing/approvals/:id/post
// → Passes approvalId directly to postToMultiplePlatforms
```

**Risk:** A user (or automated caller) can trigger multi-platform posting for content that was rejected or is still pending. The `approvalId` is used only to construct the n8n webhook payload — no status verification happens.

**Fix:**
```typescript
export async function postToMultiplePlatforms(...) {
  // Verify approval is in 'approved' status first
  const [company] = await db.select(...).from(companies).where(eq(companies.id, companyId))
  const approvals = /* extract from settings */
  const approval = approvals.find(a => a.id === approvalId)
  if (!approval || approval.status !== 'approved') {
    return { approvalId, results: [], totalSuccess: 0, totalFailed: 0, totalDurationMs: 0 }
  }
  // ... proceed with posting
}
```

### 2. **[D3/D6] updateApprovalStatus uses read-modify-write (race condition)** (MEDIUM)

```typescript
// marketing-approval.ts:192-239
async function updateApprovalStatus(...) {
  // Step 1: Read entire settings
  const [company] = await db.select(...)
  const approvals = marketing?.approvals as ApprovalRequest[]

  // Step 2: Modify in JS memory
  approvals[idx] = updated

  // Step 3: Write back ENTIRE array
  await db.execute(sql`
    UPDATE companies SET settings = jsonb_set(
      ..., '${JSON.stringify(approvals)}'::jsonb
    )
  `)
}
```

**Race scenario:** CEO approves item A via web while Slack bot approves item B simultaneously. Both read the same array, each modifies a different element, the second write overwrites the first — one approval is lost.

**Note:** This is a known codebase pattern limitation listed in deferred items ("JSONB read-modify-write race in company.settings"). `createApprovalRequest` correctly uses atomic append. But array element updates require finding by index, which is hard to do atomically in JSONB. Low practical risk (single CEO user), but architecturally noted.

### 3. **[D3] Promise.allSettled rejected case uses hardcoded platform** (LOW)

```typescript
// marketing-approval.ts:282-289
} else {
  results.push({
    platform: 'instagram', // fallback — ALWAYS 'instagram' regardless of actual platform
    success: false,
    error: result.reason?.message ?? 'Unknown error',
    durationMs: 0,
  })
}
```

If a promise is rejected (not just fulfilled with error), the platform identity is lost. The code uses 'instagram' as a fallback. This path is unlikely since the inner function catches errors and returns a PlatformPostResult, but edge cases (e.g., OOM, stack overflow) could trigger it.

**Fix:** Track platform identity outside the promise:
```typescript
const postPromises = platforms.map(async (platform, i) => { ... })
// In rejected fallback: platform: platforms[i]
// Or use: settled.map((result, i) => { ... platforms[i] ... })
```

---

## Observations (non-scoring)

### CEO Approval UX Flow
Well-designed 3-action flow: Preview content → Select platforms → Approve + Post. The reject path has a reveal pattern (click "거절" → reason input appears → click "거절 확인"). This prevents accidental rejections. Platform toggle pills are all selected by default — good for the common case (post everywhere).

### Approval Data Growth
All approvals accumulate in `company.settings.marketing.approvals` JSONB array indefinitely. For a company producing 10 approvals/week, this reaches ~500/year — still manageable as JSONB. But eventually needs archival or move to a dedicated table. Flagged as deferred concern, not blocking.

### EventBus Integration
Two notification types: `marketing_approval` (new content to review) and `marketing_posting_partial_failure` (some platforms failed). The notification payload includes `approvalId` for deep-linking from the notification to the specific approval. Clean integration pattern.

---

## Verdict

**✅ PASS (8.10/10)**

Solid approval workflow with Promise.allSettled for partial failure resilience, AbortController timeout per NFR-P17, and comprehensive CEO UI. Main issue: post endpoint doesn't verify content was actually approved before triggering multi-platform posting — this is a logic gap that should be fixed. Read-modify-write race on approvals is a known JSONB limitation.
