# Critic-B (QA + Security) Implementation Review — Story 25.4

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-24

---

## AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 GET /n8n/health (FR-N8N5) | ✅ | `n8n-proxy.ts:270-273`: calls `checkN8nHealth()`, returns `{ success: true, data: health }`. |
| AC-2 GET /n8n/executions (FR-N8N2) | ✅ | `n8n-proxy.ts:277-320`: tag injection, 4 query filters (limit/cursor/status/workflowId), 502 on failure. |
| AC-3 CEO workflow page (UXR119) | ✅ | `n8n-workflows.tsx`: 3 hooks, WorkflowCard (active/inactive), ExecutionRow (4 statuses), grid layout. |
| AC-4 Service suspended banner (FR-N8N5) | ✅ | `ServiceSuspendedBanner` component + `isUnavailable` conditional. Amber theme, Korean text. |
| AC-5 Error/empty states (UXR121) | ✅ | Error: "워크플로우 목록을 불러올 수 없습니다". Empty: "등록된 워크플로우가 없습니다" / "실행 기록이 없습니다". |
| AC-6 Admin editor iframe (FR-N8N6) | ✅ | `n8n-editor.tsx:113-120`: iframe with `sandbox="allow-same-origin allow-scripts allow-forms allow-popups"`. |
| AC-7 Health monitoring | ✅ | Both apps: `useN8nHealth` with `refetchInterval: 30_000`. Response time display. |
| AC-8 Route + sidebar registration | ✅ | CEO: `/n8n-workflows` + "n8n 자동화". Admin: `/n8n-editor` + "n8n 에디터". Both lazy-loaded. Hexagon icon. |

## Security Assessment

### Server Endpoints

| Check | Status | Evidence |
|-------|--------|----------|
| Health endpoint simplicity | ✅ SAFE | Just `checkN8nHealth()` → JSON. No user input processing. |
| Executions tag injection | ✅ SAFE | `injectCompanyTag(tenant.companyId, targetUrl)` — same pattern as workflows. |
| Query param safety | ✅ SAFE | Only 4 named params extracted via `c.req.query()`. No iteration over all params. Client can't inject extra query parameters (unlike generic `/n8n/api/*` handler). |
| Execution status param | ⚠️ NOTE | `status` from user input passed directly to n8n without validation. Should validate against `['success', 'error', 'running', 'waiting']`. Low risk — n8n ignores unknown values. |
| Executions 502 recovery | ✅ | catch → `checkN8nHealth()` → 502 with detail. Same pattern as other endpoints. |

### CEO App (n8n-workflows.tsx)

| Check | Status | Evidence |
|-------|--------|----------|
| XSS via workflow name | ✅ SAFE | React auto-escapes JSX text content. `{workflow.name}` rendered in `<span>`, not `dangerouslySetInnerHTML`. |
| XSS via execution ID | ✅ SAFE | `execution.id.slice(-6)` — string slice, rendered as text. |
| workflowId source | ✅ SAFE | From internal state (`selectedWorkflowId` set by click handler), not from URL params or user input. |
| Health response time | ✅ SAFE | `health.responseTimeMs` — number rendered as text. |
| API paths | ✅ SAFE | Hardcoded: `/admin/n8n/health`, `/admin/n8n/workflows`, `/admin/n8n/executions`. No dynamic path construction from user input. |

### Admin Editor (n8n-editor.tsx)

| Check | Status | Evidence |
|-------|--------|----------|
| Iframe sandbox | ⚠️ TRADE-OFF | `allow-same-origin + allow-scripts` = iframe CAN access parent page's cookies/localStorage (same origin). Required for n8n editor functionality — removing either breaks the editor. |
| No top navigation | ✅ | `allow-top-navigation` NOT included — iframe cannot navigate the parent page. |
| Open-in-new-tab | ✅ | `rel="noopener noreferrer"` — prevents reverse tabnabbing. |
| Iframe src | ✅ | Hardcoded `/api/admin/n8n-editor/` — no user input in URL construction. |
| Health recovery refresh | ✅ | `useEffect([isAvailable])` — only fires on state transition (unavailable→available), not on every refetch. Correct. |

**Iframe sandbox note**: `allow-same-origin + allow-scripts` is a known necessary trade-off for proxied iframe editors. The n8n editor code running in the iframe has access to CORTHEX admin cookies. Mitigated by: (1) SEC-2 admin-only access, (2) n8n localhost-only, (3) CSRF on editor routes, (4) no allow-top-navigation. Acceptable for admin tool.

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 9/10 | Status labels Korean (성공/실패/실행중/대기). Color codes specific (emerald/red/blue/amber). Query params named. Sandbox attrs listed. |
| D2 완전성 | 25% | 8/10 | 41 tests: server (9), CEO page (14), admin editor (10), routing (4), sidebar (4). Static verification but comprehensive. No runtime UI tests (acceptable — no jsdom). |
| D3 정확성 | 15% | 9/10 | Health endpoint correct. Tag injection on executions correct. React hooks well-structured. Duration formatting handles ms/s/m. Iframe sandbox appropriate. |
| D4 실행가능성 | 10% | 9/10 | 41/41 pass, 72 assertions. Type-check clean for all 3 packages. Lazy loading configured. |
| D5 일관성 | 15% | 9/10 | Natural Organic theme (olive/sand/stone). Korean labels throughout. Lucide Hexagon icon for n8n. `{ success, data }` API format. Both apps mirror health monitoring pattern. |
| D6 리스크 | 25% | 8/10 | Tag injection on executions. React auto-escapes prevents XSS. No user input in path construction. Iframe sandbox trade-off documented. Query param `status` unvalidated but low risk. |

### 가중 평균: 0.10(9) + 0.25(8) + 0.15(9) + 0.10(9) + 0.15(9) + 0.25(8) = 8.50/10 ✅ PASS

---

## Issues (2 low)

### 1. **[D6] Execution status query param not validated** (LOW)

```typescript
// n8n-proxy.ts:285
const status = c.req.query('status')
if (status) targetUrl.searchParams.set('status', status)
// → Any string passed to n8n. Should validate: ['success', 'error', 'running', 'waiting']
```

n8n ignores unknown status values (returns empty results), so not exploitable. But defense-in-depth suggests validation.

### 2. **[D6] Iframe `allow-same-origin + allow-scripts` — documented trade-off** (LOW)

```html
<iframe sandbox="allow-same-origin allow-scripts allow-forms allow-popups" />
```

n8n editor code in iframe has access to CORTHEX admin cookies (same origin). Required for editor functionality. Mitigated by SEC-2 (admin-only), localhost-only, CSRF, no allow-top-navigation. Not actionable without a different architecture (separate subdomain for editor proxy). Documented here for awareness.

---

## Observations (non-scoring)

### CEO Page UX Quality

Well-structured responsive layout: workflow list (1 col) + execution results (2 cols) on desktop, stacked on mobile. Loading skeletons provide good perceived performance. Korean date formatting with `toLocaleString('ko-KR')`. Duration display handles sub-second, seconds, and minutes gracefully.

### Health Monitoring Pattern

Both CEO and admin apps independently poll `/n8n/health` every 30s. If both apps are open simultaneously, health endpoint gets hit every 15s (2 × 30s). Not a concern for a localhost health check, but could be optimized with a shared query cache if apps ever share a React Query client.

### Executions Endpoint — Safe by Construction

Unlike the generic `/n8n/api/*` handler which iterates `originalUrl.searchParams` and needs `key !== 'tags'` filtering, the `/n8n/executions` endpoint extracts only 4 named params. This makes tag override impossible without explicit filtering — good API design.

---

## Verdict

**✅ PASS (8.50/10)**

Clean UI story with proper security integration. Server endpoints use existing tag injection for tenant isolation. CEO page has comprehensive UX states (loading, error, empty, suspended). Admin editor iframe has appropriate sandbox restrictions with documented trade-offs. All components use Natural Organic theme and Korean labels consistently. Two low-severity items: unvalidated status query param and iframe sandbox trade-off (neither actionable without architectural changes).
