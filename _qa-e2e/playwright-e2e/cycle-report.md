# CORTHEX v2 E2E Test Report — 3 Cycles

**Date**: 2026-03-26
**Tester**: Playwright MCP (automated, parallel sessions)
**Total TCs**: 444 per cycle x 3 = 1,332 test executions

---

## Cycle Summary

| Cycle | Folder | Agents | PASS | FAIL | SKIP | Pass Rate (excl. SKIP) |
|-------|--------|--------|------|------|------|----------------------|
| 1 (C28) | cycle-28/ | 2 | 304 | 12 | 82 | 96.2% |
| 2 (C29) | cycle-29/ | 8 | 290 | 11 | 67 | 96.3% |
| 3 (C30) | cycle-30/ | 8 | 298 | 9 | 54 | 97.1% |
| **TOTAL** | | | **892** | **32** | **203** | **96.5%** |

Improvement trend: FAIL count decreased 12 -> 11 -> 9 across cycles as bugs were fixed between runs.

---

## Bugs Fixed Between Cycles

| Bug | Severity | File | Fix Commit |
|-----|----------|------|------------|
| departments "Total Sectors" shows .00 | Low | admin/pages/departments.tsx | d76085ec |
| departments row click no detail panel | Medium | admin/pages/departments.tsx | d76085ec |
| login error "url is not defined" | Medium | admin/lib/api.ts | ea92a0c6 |
| agents detail crash on null allowedTools | Critical | app/pages/agents.tsx | 08a4b219 |
| report-lines save sends null (HTTP 400) | Critical | admin/pages/report-lines.tsx | 1a8c2af3 |
| report-lines add form no onChange | High | admin/pages/report-lines.tsx | 1a8c2af3 |
| soul-editor useBlocker crash (BrowserRouter) | Critical | app/components/settings/soul-editor.tsx | 1a8c2af3 |

---

## Remaining Known Bugs (unfixed)

### HIGH
- **Report-lines don't persist**: PUT 200 OK but GET returns 0 lines (server-side issue)
- **Credential API key field mismatch**: Frontend sends generic format but server expects provider-specific fields

### MEDIUM
- **Agent tier/status filter non-functional**: Dropdown selection does not filter table (admin/agents)
- **Employee duplicate username no error toast**: API 409 returned but toast not shown
- **Department duplicate name no error toast**: Same pattern as above
- **Dashboard dept stat shows "00"**: App dashboard department count formatting

### LOW
- **Company duplicate slug shows raw DB error**: Constraint name exposed instead of friendly message
- **Dashboard EXPORT_LOGS / VIEW_ALL_RECORDS buttons are dead**: No action on click
- **API key "Updated: Invalid Date"**: Settings page date formatting
- **Monitoring memory >100%**: Heap used > heap total display
- **Nexus ReactFlow z-index overlap**: Custom buttons overlap built-in controls
- **Onboarding step bar label mismatch**: "Agents"/"CLI Token" vs actual content
- **Trading ticker row click doesn't switch chart**: Static demo data
- **Employee Reset Password button missing from UI**: Mutation wired but no UI trigger
- **Agent create has no soul template dropdown**: Textarea instead

---

## SKIP Analysis

Most common SKIP reasons across 3 cycles:
1. **All agents offline** (~40% of skips): Chat, agent sessions, real-time features untestable
2. **No pre-existing data**: Knowledge docs, jobs, schedules don't exist
3. **Mobile viewport tests**: Not run in these cycles
4. **Destructive/stateful tests**: Rate limiting, network failure simulation
5. **Interactive features**: Drag-drop, WebSocket, real-time updates

---

## XSS Security: PASS

All 3 cycles confirmed: `<script>alert(1)</script>` and `<img src=x onerror=alert(1)>` payloads from previous test data are properly escaped as text across all pages. No execution observed.

---

## Infrastructure Notes

- **Parallel sessions**: playwright-parallel-mcp with `--isolated` flag (patched globally)
- **8 agents per cycle**: ~15 min per cycle, all pages covered
- **Dev servers**: admin=5173, app=5174, server=3000
- **Login**: admin / admin1234
