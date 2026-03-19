# Agent A — Cycle 21 Report

**Date**: 2026-03-19
**CID**: d0131c54-1907-4a37-b3ca-1d0bf8e99fff (E2E-TEMP-18)
**Target**: http://localhost (port 80, Docker production)
**Login**: admin / admin1234

---

## 1. Department CRUD

| Step | Action | Result | Evidence |
|------|--------|--------|----------|
| CREATE | "새 부서 생성" → name "테스트부서-C21", desc "E2E Cycle 21 테스트" → 생성 | PASS | Toast: "부서가 생성되었습니다", card appeared in list |
| EDIT | Edit icon → changed name to "테스트부서-C21-수정됨" → 저장 | PASS | Toast: "부서가 수정되었습니다", name updated on card |
| DELETE | Delete icon → confirmation → confirmed | PASS | Toast: "부서가 삭제되었습니다", card removed |

**Notes**: Inline edit form (not modal). Test-id pattern: `departments-edit-{id}`, `departments-delete-{id}`, `departments-create-submit`.

---

## 2. Agent CRUD

| Step | Action | Result | Evidence |
|------|--------|--------|----------|
| CREATE | "New Agent Template" → name "테스트에이전트-C21", role "E2E Cycle 21 테스트", dept "에이전트부서", soul text → 만들기 | PASS | Toast: "에이전트가 생성되었습니다", agent in list |
| DETAIL | Clicked agent in list → detail panel | PASS | 3 tabs visible: Soul Markdown, Configuration, Memory Snapshots |
| DEACTIVATE | Configuration tab → "Deactivate Agent" → modal confirm "비활성화" | PASS | Toast: "에이전트가 비활성화되었습니다", shows [OFF] |

**Notes**: Detail panel has test-ids: `agents-tab-soul`, `agents-tab-info`, `agents-deactivate-btn`. Create form has well-structured test-ids: `agents-create-name`, `agents-create-role`, `agents-create-tier`, `agents-create-model`, `agents-create-dept`, `agents-create-soul`, `agents-create-submit`.

---

## 3. Settings CRUD

| Step | Action | Result | Evidence |
|------|--------|--------|----------|
| CHANGE | Handoff Depth slider 5 → 7 | PASS | Value displayed as 7, Cancel/Save buttons appeared |
| SAVE | Clicked "Save" | PASS | Toast confirmed |
| VERIFY | Page reload → checked slider value | PASS | Value persisted as 7 after reload |
| RESTORE | Changed back to 5 → Save | PASS | Value restored to 5 |

**Notes**: Settings page sections: Company Info (name, slug, created, status), API Key Management, Handoff Depth (range 1-10), Default Settings (timezone, default LLM model).

---

## 4. Page Sweep — Console Errors

| # | Page | Loaded | Console Errors |
|---|------|--------|---------------|
| 1 | /admin/dashboard | OK | 0 |
| 2 | /admin/companies | OK | 0 |
| 3 | /admin/employees | OK | 0 |
| 4 | /admin/users | OK | 0 |
| 5 | /admin/departments | OK | 0 |
| 6 | /admin/agents | OK | 0 |
| 7 | /admin/tools | OK | 0 |
| 8 | /admin/costs | OK | 0 |
| 9 | /admin/credentials | OK | 0 |
| 10 | /admin/report-lines | OK | 0 |
| 11 | /admin/soul-templates | OK | 0 |
| 12 | /admin/monitoring | OK | 0 |
| 13 | /admin/org-chart | OK | 0 |
| 14 | /admin/nexus | OK | 0 |
| 15 | /admin/org-templates | OK | 0 |
| 16 | /admin/template-market | OK | 0 |
| 17 | /admin/agent-marketplace | OK | 0 |
| 18 | /admin/api-keys | OK | 0 |
| 19 | /admin/workflows | OK | 2 (500 Internal Server Error — known P3, not re-reported) |
| 20 | /admin/settings | OK | 0 |

**Summary**: 20/20 pages loaded. 0 new console errors. Workflows 500 is known recurring P3.

---

## Bugs Found

**None.** All CRUD operations passed. All pages loaded without new errors.

---

## Environment Notes
- Production Docker container on port 80 (healthy)
- Dev server on port 3000 had DB connection issue (ECONNREFUSED 127.0.0.1:5432) — PostgreSQL not installed locally. Not a bug; dev environment config issue only.
- Playwright MCP browser conflict between concurrent agents — used `browser_run_code` for session stability.
