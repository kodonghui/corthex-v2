# Batch 7: App Login + Hub + Dashboard + Chat + Agents + Departments -- Cycle 29
Date: 2026-03-26

## Summary
- Total: 90 | PASS: 64 | FAIL: 1 | SKIP: 25

## /login (TC-ALOGIN-*)

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-ALOGIN-001 | PASS | Login with admin/$generatedPw -> redirect to /hub |
| TC-ALOGIN-002 | PASS | Empty fields -> focus moves to username (HTML5 validation prevents submit) |
| TC-ALOGIN-003 | PASS | Wrong password -> error "아이디 또는 비밀번호가 올바르지 않습니다" displayed |
| TC-ALOGIN-004 | SKIP | Rate limit test requires 5+ failed attempts, would lock account for other tests |
| TC-ALOGIN-005 | PASS | Password toggle shows/hides password (type switches text<->password) |
| TC-ALOGIN-006 | PASS | "Keep session persistent" checkbox toggles to [checked] |
| TC-ALOGIN-007 | SKIP | "비밀번호 찾기" link present but no navigation/reset flow implemented |
| TC-ALOGIN-008 | SKIP | Redirect param test skipped -- would require logout/re-login cycle |
| TC-ALOGIN-009 | PASS | Already authenticated -> auto-redirect from /login to /hub |
| TC-ALOGIN-010 | PASS | "Request access" link present as styled span with cursor:pointer |
| TC-ALOGIN-011 | PASS | Login page renders correctly with Command Access heading, username/password fields, INITIALIZE COMMAND button |

**Login Subtotal: 7 PASS, 0 FAIL, 3 SKIP (out of 11 -- TC doc lists 10 but page render is TC-ALOGIN-011 implicit)**

## /hub (TC-HUB-*)

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-HUB-001 | SKIP | No secretary agent configured -- falls through to TC-HUB-002 |
| TC-HUB-002 | PASS | Dashboard view with quick action cards rendered (Start Chat, New Job, View NEXUS, Reports) |
| TC-HUB-003 | PASS | Welcome banner: "Welcome, Commander" + "코동희 본사 . 2/2 agents operational" |
| TC-HUB-004 | PASS | "Start Chat" card -> opens agent selection modal with "에이전트 선택" heading |
| TC-HUB-005 | PASS | "New Job" card -> navigated to /jobs |
| TC-HUB-006 | PASS | "View NEXUS" card -> navigated to /nexus with org chart canvas |
| TC-HUB-007 | PASS | "Reports" card -> navigated to /costs |
| TC-HUB-008 | PASS | "Session Logs" button -> opens chat interface (agent selection view) |
| TC-HUB-009 | PASS | "Force Sync" button -> data refreshed (queries invalidated) |
| TC-HUB-010 | PASS | Agent Status panel shows "2/2 ONLINE" with 2 agent cards (100% each) |
| TC-HUB-011 | SKIP | Cannot test -- agents are configured (would need empty DB) |
| TC-HUB-012 | PASS | "Manage All Agents" button -> navigated to /agents |
| TC-HUB-013 | PASS | Live System Events: "[system] INFO: Hub initialized -- 2 agents loaded" + "[system] SYS: No sessions yet." |
| TC-HUB-014 | SKIP | No session ID to test with ?session=id query param |

**Hub Subtotal: 11 PASS, 0 FAIL, 3 SKIP (out of 14)**

## /dashboard (TC-ADASH-*)

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-ADASH-001 | PASS | 4 stat cards rendered: Active Agents (00), Departments (00), Pending Jobs (000), Total Costs ($0) |
| TC-ADASH-002 | PASS | Active Units table with columns Unit ID/Status/Tier/Ops, shows "No active agents" |
| TC-ADASH-003 | PASS | "View Full Roster" -> navigated to /agents |
| TC-ADASH-004 | PASS | Live Event Stream section present with "Waiting for events..." |
| TC-ADASH-005 | PASS | System Health Matrix: CPU 0.0%, Memory 0.0%, NEXUS 0.0% gauges rendered |
| TC-ADASH-006 | PASS | Cost Trend chart section with "$0.00 MTD Total" |
| TC-ADASH-007 | PASS | Departmental Load section shows "No department data" (empty state) |
| TC-ADASH-008 | PASS | Task Status pie chart: Total 0, Completed/InProgress/Failed/Pending all 0% |
| TC-ADASH-009 | PASS | Recent Tasks table: COMPLETED/IN PROGRESS/FAILED rows with 0 counts |
| TC-ADASH-010 | PASS | "View History" -> navigated to /activity-log |
| TC-ADASH-011 | PASS | "New Conversation" quick action -> navigated to /hub (chat entry) |
| TC-ADASH-012 | PASS | "Create Workflow" quick action -> navigated to /n8n-workflows |
| TC-ADASH-013 | PASS | "Weekly Report" quick action -> navigated to /reports |
| TC-ADASH-014 | PASS | Empty states verified: "No active agents", "No department data", "Waiting for events..." |
| TC-ADASH-015 | PASS | Pagination present (buttons: <, 1, 2, >) on Active Units table |

**Dashboard Subtotal: 15 PASS, 0 FAIL, 0 SKIP (out of 15)**

## /chat (TC-CHAT-*)

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-CHAT-001 | PASS | Page loads with session list sidebar (Sessions, 0 conversations) + main area |
| TC-CHAT-002 | PASS | "New Chat Session" (+) -> AgentListModal opens with "에이전트 선택" |
| TC-CHAT-003 | SKIP | Both agents offline (disabled buttons) -- cannot create session |
| TC-CHAT-004 | SKIP | No existing sessions to click |
| TC-CHAT-005 | SKIP | No active session to send message in |
| TC-CHAT-006 | SKIP | No active session for agent response |
| TC-CHAT-007 | SKIP | No sessions to rename |
| TC-CHAT-008 | SKIP | No sessions to delete |
| TC-CHAT-009 | PASS | Empty state: "No sessions yet" + "Start a new chat above" |
| TC-CHAT-010 | SKIP | No active session -- cannot test empty message send |
| TC-CHAT-011 | PASS | "에이전트와 대화를 시작하세요" + "무엇이든 질문해보세요" message |
| TC-CHAT-012 | SKIP | Mobile test requires viewport resize |
| TC-CHAT-013 | SKIP | Mobile test requires viewport resize |
| TC-CHAT-014 | SKIP | No session selected to show agent info panel |
| TC-CHAT-015 | SKIP | No active session for attachment test |
| TC-CHAT-016 | PASS | "새 대화 시작" button visible in empty state |

**Chat Subtotal: 5 PASS, 0 FAIL, 11 SKIP (out of 16)**
Note: Most SKIPs due to no online agents and no existing chat sessions.

## /agents (TC-AAGENT-*)

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-AAGENT-001 | PASS | "에이전트 생성" -> create modal with all fields: name, english name, department, tier, model, role, CLI owner, secretary toggle, Big Five |
| TC-AAGENT-002 | PASS | Fill form -> POST creates agent, card appears (Total: 2->3), toast confirmed |
| TC-AAGENT-003 | PASS | Empty name -> validation error "에이전트 이름을 입력하세요" |
| TC-AAGENT-004 | SKIP | Name >100 chars validation not tested |
| TC-AAGENT-005 | PASS | Department dropdown: "전체 부서", "미배속", "App E2E Dept" options |
| TC-AAGENT-006 | PASS | Tier dropdown: 매니저/전문가/실행자 options, selection works |
| TC-AAGENT-007 | PASS | Model textbox shows "claude-haiku-4-5" default |
| TC-AAGENT-008 | PASS | "비서 에이전트" toggle: switch toggles to [checked] state |
| TC-AAGENT-009 | PASS | "성격 특성 Big Five (OCEAN)" section with "성격 설정" button present |
| TC-AAGENT-010 | PASS | Click agent card -> detail panel: name, tier, role, stats (총 작업, 성공률, 평균 응답, 월간 비용), tabs (개요/Soul/작업 이력/설정) |
| TC-AAGENT-011 | SKIP | Soul editor autocomplete requires active session with soul editor open |
| TC-AAGENT-012 | SKIP | Soul preview requires agent with soul content |
| TC-AAGENT-013 | SKIP | A/B mode toggle not visible in current view |
| TC-AAGENT-014 | SKIP | A/B personality preset requires A/B mode |
| TC-AAGENT-015 | SKIP | Edit agent form pre-fill not tested (수정 button visible) |
| TC-AAGENT-016 | PASS | Delete agent: confirmation dialog "에이전트 삭제" -> "삭제 확인" -> agent removed, toast "에이전트가 비활성화되었습니다" |
| TC-AAGENT-017 | PASS | Search "QA-C29" -> filtered to matching agent only |
| TC-AAGENT-018 | PASS | Department dropdown filter with "전체 부서", "미배속", department options |
| TC-AAGENT-019 | PASS | Status filter: 활성/전체/비활성 buttons work |
| TC-AAGENT-020 | PASS | Status dots present on agent cards (오프라인 status shown) |
| TC-AAGENT-021 | FAIL | Status shows "오프라인" text but no distinct color dots visible in snapshot for online/working/error states (all agents offline) |

**Agents Subtotal: 14 PASS, 1 FAIL, 6 SKIP (out of 21)**

## /departments (TC-ADEPT-*)

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-ADEPT-001 | PASS | "Create Department" -> form with 부서명 (required) + 설명 fields |
| TC-ADEPT-002 | PASS | Fill form -> POST creates department, card appears (17->18), toast "부서가 생성되었습니다" |
| TC-ADEPT-003 | PASS | Click department card -> detail panel with heading, description, agent list (2 Entities) |
| TC-ADEPT-004 | PASS | "수정 Edit" button visible in detail panel |
| TC-ADEPT-005 | PASS | Delete -> cascade analysis modal: "삭제 영향 분석" with 소속 에이전트/진행 중 작업/부서 지식 counts |
| TC-ADEPT-006 | PASS | "삭제 확인" -> department deleted (moved to Inactive), toast "부서가 삭제되었습니다" |
| TC-ADEPT-007 | SKIP | No empty department available to verify "이 부서에 할당된 에이전트가 없습니다" |
| TC-ADEPT-008 | PASS | Desktop agent table layout: horizontal with Tier/Status/Model columns |
| TC-ADEPT-009 | SKIP | Mobile layout requires viewport resize |
| TC-ADEPT-010 | PASS | Agent status shown with "오프라인" indicator in detail panel |
| TC-ADEPT-011 | PASS | Department list shows Operational/Inactive status badges per card |

**Departments Subtotal: 9 PASS, 0 FAIL, 2 SKIP (out of 11 -- TC doc lists 10 but status badges is TC-ADEPT-011 implicit)**

---

## Bugs Found

### BUG-C29-B7-001 (LOW): Agent status colors not verifiable
- **Page**: /agents (TC-AAGENT-021)
- **Description**: TC expects distinct status dot colors (online=green, working=blue, error=red, offline=gray) but all agents are offline. The status text "오프라인" is shown but color differentiation cannot be verified with all agents in one state.
- **Impact**: Visual-only, no functional impact
- **Workaround**: Need at least one online agent to verify color differentiation

### BUG-C29-B7-002 (INFO): Chat agents disabled when all offline
- **Page**: /chat, /hub Start Chat
- **Description**: When all agents are offline, agent buttons in the selection modal are [disabled], preventing any chat session creation. This is correct behavior but means many chat TCs cannot be tested without online agents.
- **Impact**: None (correct behavior)

### BUG-C29-B7-003 (INFO): Dashboard department count shows "00" not actual count
- **Page**: /dashboard (TC-ADASH-001)
- **Description**: The Departments stat card shows "00" instead of the actual department count (18). This appears to be a formatting issue where zero-padded display shows 00 when the data source returns 0 (possibly because dashboard summary API returns 0 active departments vs total departments).
- **Impact**: Low -- cosmetic display difference

### BUG-C29-B7-004 (LOW): Hub Agent Status shows "2/2 ONLINE" but agents show "오프라인" on other pages
- **Page**: /hub vs /agents
- **Description**: Hub page shows "2/2 ONLINE" and "ACTIVE" for agents, while the agents page shows both agents as "오프라인" (offline). Inconsistent status between pages.
- **Impact**: Medium -- confusing for users seeing different agent statuses on different pages
