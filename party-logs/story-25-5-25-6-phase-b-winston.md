# Stories 25.5 + 25.6 — Phase B Review (Combined)
**Critic-A (Winston) — Architect Review**
**Date**: 2026-03-24

## Story 25.5: Legacy Workflow Code Deletion (FR-N8N3)

### Files Verified
- `n8n-story-25-5.test.ts` — 35 tests (deletion verification)
- Spot-checked: App.tsx, admin App.tsx, server index.ts, sidebars, glob for deleted dirs

### Deletion Verification

**Server (confirmed deleted via glob):**
- `routes/workspace/workflows.ts` — gone ✓
- `services/workflow/` directory — gone ✓ (engine.ts, execution.ts, suggestion.ts, pattern-analyzer.ts)
- `lib/workflow/` directory — gone ✓ (engine.ts, dag-solver.ts, execution-context.ts)

**Frontend (confirmed deleted via glob):**
- `packages/app/src/pages/workflows.tsx` — gone ✓
- `packages/admin/src/pages/workflows.tsx` — gone ✓
- `packages/admin/src/components/workflow-canvas.tsx` — verified via test

**10 test files** — verified via test assertions (existsSync = false)

### Orphan Cleanup (confirmed via grep)
- `server/index.ts`: No `workflowsRoute` import ✓
- `app/App.tsx`: No `import('./pages/workflows')` ✓
- `admin/App.tsx`: No `import('./pages/workflows')` ✓
- `app/hooks/use-queries.ts`: No `useWorkflows`/`useWorkflowDetail`/etc. hooks ✓
- Both sidebars: No `to: '/workflows'` entry ✓

### Redirects (confirmed via grep)
- CEO app line 127: `<Route path="workflows" element={<Navigate to="/n8n-workflows" replace />} />` ✓
- Admin app line 105: `<Route path="workflows" element={<Navigate to="/n8n-editor" replace />} />` ✓

### DB Schema Preserved
- Test verifies `pgTable('workflows')`, `pgTable('workflow_executions')`, `pgTable('workflow_suggestions')` still in schema.ts — correct, migration history must be preserved.

### n8n Replacements Verified
- `packages/app/src/pages/n8n-workflows.tsx` exists ✓
- `packages/admin/src/pages/n8n-editor.tsx` exists ✓
- `packages/server/src/routes/admin/n8n-proxy.ts` exists ✓

### Story 25.5 Assessment
Clean deletion. 21 files removed, no orphaned imports, redirects in place, DB schema preserved. No issues.

---

## Story 25.6: Go/No-Go #3 — n8n Security Verification

### Files Reviewed
- `n8n-story-25-6-go-no-go.test.ts` — 44 tests
- `n8n-proxy.ts` (full re-read — significant enhancements since 25.3)
- `n8n-security-audit.ts` (re-read — updated SEC-3 check)

### Proxy Enhancements Discovered (since 25.3/25.4 reviews)

The proxy has been significantly hardened. Three major additions:

**1. Centralized Header Sanitization (lines 82-96)**
```typescript
function sanitizeProxyHeaders(reqHeaders) {
  delete headers['Authorization']
  delete headers['authorization']
  delete headers['Cookie']
  delete headers['cookie']
}
```
- Both casing variants deleted (HTTP/1.1 and HTTP/2 compatible)
- Used in API proxy (line 184) and editor proxy (line 249)
- Better than the previous `Authorization: undefined` approach
- **Verdict**: Excellent improvement

**2. TOCTOU Prevention (lines 98-128)**
```typescript
const WRITE_METHODS = new Set(['PUT', 'PATCH', 'DELETE', 'POST'])
async function preVerifyOwnership(companyId, resourcePath) {
  // Pre-fetch resource, verify company tag before forwarding mutation
}
```
- Line 155: `POST` excluded from pre-check (creating new resources — no existing ownership)
- PUT/PATCH/DELETE on individual resources → pre-fetch from n8n → verify tags → proceed or 403
- Prevents race condition: mutation succeeds before post-response ownership check rejects
- Ownership check now correctly split: pre-verify for writes (line 156), post-verify for reads (line 188)
- **Verdict**: Sound defense against TOCTOU attacks

**3. Response Header Preservation (lines 198-201)**
```typescript
return new Response(JSON.stringify(body), {
  status: response.status,
  headers: response.headers,
})
```
- Changed from `c.json(body, status)` which lost headers
- Now uses `new Response()` preserving original n8n headers (pagination, etag, etc.)
- **Verdict**: Addresses my LOW observation from 25.4 review

### Security Audit Updated
`checkTagIsolation()` in n8n-security-audit.ts now checks 3 patterns:
- `injectCompanyTag` + `company:` (tag injection)
- `verifyResourceOwnership` + `requiresOwnershipCheck` (ownership)
- `isBlockedPath` + `credentials` (path blocking)
- **Verdict**: Comprehensive SEC-3 verification

### Go/No-Go Test Analysis (44 tests)

**3-Part Verification:**
1. SEC-1 Port 5678 firewall (4 tests) — iptables DROP + localhost ACCEPT + iptables-save
2. SEC-3 Tag isolation (7 tests) — tag injection + ownership check + blocked paths + client bypass prevention
3. SEC-7 HMAC webhook (4 tests) — timingSafeEqual + sha256 + signature check

**All 8 SEC Layers (8 tests):**
- SEC-1 through SEC-8 individually verified via source patterns
- **Note**: SEC-4/6 numbering in Go/No-Go differs from SEC-1~8 numbering in 25.2 tests (SEC-4 here = Docker network, was SEC-5 before; SEC-6 here = CSRF, was SEC-8 before). Minor labeling inconsistency but all 8 layers are checked regardless.

**Additional Gates:**
- Docker health monitoring (4 tests)
- Resource limits + OOM recovery (2 tests)
- Security audit service (3 tests)
- Proxy security chain integrity (4 tests) — middleware order, path traversal, header sanitization, TOCTOU
- Legacy removal (3 tests)
- Epic 25 test coverage (5 tests) — verifies all 6 story test files exist

### Observations

| # | Severity | Issue |
|---|----------|-------|
| 1 | **LOW** | SEC layer numbering in 25.6 (SEC-4=Docker, SEC-6=CSRF) differs from 25.2 (SEC-4=HMAC, SEC-5=Docker, SEC-6=DB, SEC-8=RateLimit). Both are internally consistent but differ from each other. |
| 2 | **LOW** | `/n8n/workflows` convenience endpoint (line 337-341) still uses simple `{ Accept: 'application/json' }` headers without `sanitizeProxyHeaders()`. Not a bug — this endpoint doesn't forward `c.req.header()`, so there's nothing to leak. But inconsistent style with `/n8n/executions` which adds `Authorization: undefined, Cookie: undefined` defensively. |

No HIGH or MEDIUM issues.

## Scoring

### Story 25.5 (Critic-A Weights)

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 Completeness | 9 | 15% | 1.35 |
| D2 UX/Clarity | 9 | 10% | 0.90 |
| D3 Accuracy | 9 | 25% | 2.25 |
| D4 Implementability | 9 | 20% | 1.80 |
| D5 Spec Alignment | 10 | 15% | 1.50 |
| D6 Risk | 9 | 15% | 1.35 |
| **Total** | | | **9.15** |

Clean deletion, no orphans, redirects in place, DB schema preserved.

### Story 25.6 (Critic-A Weights)

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 Completeness | 9 | 15% | 1.35 |
| D2 UX/Clarity | 9 | 10% | 0.90 |
| D3 Accuracy | 9 | 25% | 2.25 |
| D4 Implementability | 9 | 20% | 1.80 |
| D5 Spec Alignment | 9 | 15% | 1.35 |
| D6 Risk | 9 | 15% | 1.35 |
| **Total** | | | **9.00** |

Comprehensive Go/No-Go. Proxy hardened with TOCTOU prevention, centralized header sanitization, and response header preservation. All 8 SEC layers verified.

## Verdict: Both **PASS**
- Story 25.5: **9.15/10**
- Story 25.6: **9.00/10**

**Epic 25 Complete** — 6 stories, 247 tests, 469 assertions. n8n integration is production-grade with 8-layer security, TOCTOU prevention, tenant isolation, and clean legacy migration.
