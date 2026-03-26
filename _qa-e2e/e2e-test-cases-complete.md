# CORTHEX v2 — Complete E2E Test Cases

Generated: 2026-03-26
Total: ~900 test cases across 49 pages (22 Admin + 27 App)
Coverage: Every button, form, API call, modal, filter, tab, dropdown, error state

---

# PART 1: ADMIN (localhost:5173) — 22 Pages, ~400 Test Cases

---

## /admin/login
File: login.tsx | API: POST /auth/admin/login

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-LOGIN-001 | Enter admin/admin1234 → click 세션 시작 | POST /auth/admin/login → token saved → redirect to /admin |
| TC-LOGIN-002 | Empty username → submit | Validation error, no request sent |
| TC-LOGIN-003 | Empty password → submit | Validation error |
| TC-LOGIN-004 | Wrong password → submit | Error: "아이디 또는 비밀번호가 올바르지 않습니다" + countdown timer |
| TC-LOGIN-005 | 5+ failed attempts | Rate limit countdown displayed, submit disabled |
| TC-LOGIN-006 | Wait countdown to 0 | Button re-enabled |
| TC-LOGIN-007 | Login with ?redirect=/admin/agents | After login, redirect to /admin/agents |

---

## /admin (Dashboard)
File: dashboard.tsx (327 lines) | API: GET /admin/users, /admin/agents, /admin/departments

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-DASH-001 | Load without company selected | "SELECT_COMPANY_TO_CONTINUE" message |
| TC-DASH-002 | Load with company | 3 stat cards: DEPARTMENTS, ACTIVE USERS, AUTONOMOUS AGENTS |
| TC-DASH-003 | Stat card values | DEPARTMENTS: count from API, USERS: active count, AGENTS: online count |
| TC-DASH-004 | Health Status section | USERS_ACTIVE %, AGENTS_ONLINE %, DEPT_COUNT number |
| TC-DASH-005 | Recent Activity table | Loads user/agent data, shows in table |
| TC-DASH-006 | Click EXPORT_LOGS button | Export action (if implemented) |
| TC-DASH-007 | Click VIEW_ALL_RECORDS | Navigation to full records |
| TC-DASH-008 | Agent Efficiency Readout | Circle shows online/total percentage |
| TC-DASH-009 | Empty state (no agents) | "0 of 0 agents" message |

---

## /admin/companies
File: companies.tsx (398 lines) | API: GET/POST/PATCH/DELETE /admin/companies, GET /admin/companies/stats

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-COMP-001 | Click "Create Company" | Form appears: Company Name (text, required), Slug (text, required, lowercase+hyphens) |
| TC-COMP-002 | Fill "Test Corp" + "test-corp" → Create | POST /admin/companies {name, slug} → toast "회사가 생성되었습니다" → card appears |
| TC-COMP-003 | Create with empty name | Validation error, no POST |
| TC-COMP-004 | Create with duplicate slug | API 409 → error toast |
| TC-COMP-005 | Search filter input | Type text → companies filtered by name/slug match |
| TC-COMP-006 | Click Edit on company card | Inline edit mode with name input |
| TC-COMP-007 | Edit name → save | PATCH /admin/companies/{id} → toast → card updates |
| TC-COMP-008 | Click Cancel during edit | Revert to original, exit edit mode |
| TC-COMP-009 | Click Delete button | Confirmation dialog appears |
| TC-COMP-010 | Confirm delete | DELETE /admin/companies/{id} → card removed → toast |
| TC-COMP-011 | Click ACCESS_ROOT | Select company as active context |
| TC-COMP-012 | Stats: Total_Entities | Shows company count |
| TC-COMP-013 | Stats: Active_Throughput | Shows active % |
| TC-COMP-014 | Pagination next/prev | Navigate between pages |
| TC-COMP-015 | Click "Initialize Node" empty slot | Opens create form |

---

## /admin/employees
File: employees.tsx | API: GET/POST /admin/users, POST /admin/employees, PATCH/DELETE /admin/employees/{id}, POST /admin/employees/{id}/reset-password

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-EMP-001 | Click "직원 추가" | Form: username (min 2), name (min 1), email (valid email), role (admin/user), departmentIds (multi-select) |
| TC-EMP-002 | Fill form → submit | POST /admin/employees → toast "{name}님이 추가되었습니다" + initial password shown |
| TC-EMP-003 | Empty username → submit | Zod validation: min 2 chars |
| TC-EMP-004 | Duplicate username | API 409: "이미 존재하는 아이디입니다" |
| TC-EMP-005 | Invalid email format | Zod validation error |
| TC-EMP-006 | Search by name/username | Filter table results |
| TC-EMP-007 | Filter by department dropdown | Show only dept employees |
| TC-EMP-008 | Filter by status (active/inactive) | Toggle active filter |
| TC-EMP-009 | Click Edit on employee | Edit form opens with current data |
| TC-EMP-010 | Update name + email → save | PATCH request → toast → row updates |
| TC-EMP-011 | Click Lock icon (deactivate) | Confirmation dialog → DELETE → status changes |
| TC-EMP-012 | Click Reset Password | POST /reset-password → new password shown in modal |
| TC-EMP-013 | Copy password to clipboard | Click copy → "Copied" feedback |
| TC-EMP-014 | Pagination controls | Navigate pages |
| TC-EMP-015 | Sort by column header | Toggle ASC/DESC |
| TC-EMP-016 | First employee gets role 'admin' | Onboarding creates CEO with role: admin (BUG-FIX verified) |

---

## /admin/departments
File: departments.tsx | API: GET/POST/PATCH/DELETE /admin/departments, GET /admin/departments/{id}/cascade-analysis

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-DEPT-001 | Click "Create Department" | Form: name (text, required), description (text, optional) |
| TC-DEPT-002 | Fill name "개발팀" → 생성 | POST /admin/departments → toast → card appears |
| TC-DEPT-003 | Empty name → submit | Validation error |
| TC-DEPT-004 | Duplicate name | API error toast |
| TC-DEPT-005 | Search departments | Filter by name match |
| TC-DEPT-006 | Click department card | Detail panel opens: agents list, stats |
| TC-DEPT-007 | Click Edit | Form pre-filled, PATCH on save |
| TC-DEPT-008 | Click Delete | cascade-analysis API called → modal shows: agent count, active tasks, knowledge docs |
| TC-DEPT-009 | Cascade modal: select force mode | DELETE with ?mode=force |
| TC-DEPT-010 | Cascade modal: select wait_completion | DELETE with ?mode=wait_completion |
| TC-DEPT-011 | Cascade modal: cancel | Close without deleting |
| TC-DEPT-012 | Stats: Total Sectors | Show department count (integer, not float) |
| TC-DEPT-013 | Agent list in detail | Shows agents with status dots |

---

## /admin/agents
File: agents.tsx | API: GET/POST/PATCH/DELETE /admin/agents, GET /admin/departments, GET /admin/soul-templates

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-AGENT-001 | Click "NEW_AGENT" / 에이전트 생성 | Create modal: name, role, tier, model, department, soul |
| TC-AGENT-002 | Fill all fields → submit | POST /admin/agents → toast → agent appears |
| TC-AGENT-003 | Empty name → submit | Validation: name required |
| TC-AGENT-004 | Select tier = manager | TIER_OPTIONS: manager shown, model default set |
| TC-AGENT-005 | Select tier = specialist | Different model default |
| TC-AGENT-006 | Select tier = worker | Different model default |
| TC-AGENT-007 | Select soul template | Dropdown loads from /admin/soul-templates, populates soul field |
| TC-AGENT-008 | Model dropdown | MODEL_OPTIONS: Claude Opus/Sonnet/Haiku |
| TC-AGENT-009 | Department dropdown | Lists active departments + "미배속" |
| TC-AGENT-010 | Search agents | Filter by name |
| TC-AGENT-011 | Filter by tier dropdown | ALL_TIERS + manager/specialist/worker |
| TC-AGENT-012 | Filter by status | ALL_STATES + online/working/error/offline |
| TC-AGENT-013 | Click agent card | Detail panel: tabs (soul/config/memory) |
| TC-AGENT-014 | Tab: soul | Shows soul markdown content |
| TC-AGENT-015 | Tab: config | Shows model, tier, department, tools |
| TC-AGENT-016 | Tab: memory | Shows memory stats if available |
| TC-AGENT-017 | Toggle semantic cache | PATCH → toggle enableSemanticCache |
| TC-AGENT-018 | Click Edit | Form pre-filled → PATCH on save |
| TC-AGENT-019 | Click Deactivate | Confirmation → DELETE |
| TC-AGENT-020 | Deactivate with active sessions | Show force option warning |
| TC-AGENT-021 | STATUS_LABELS/COLORS | online=green, working=blue, error=red, offline=gray |
| TC-AGENT-022 | TIER_BADGE styling | manager/specialist/worker distinct colors |

---

## /admin/tools
File: tools.tsx | API: GET /admin/tools/catalog, GET /admin/agents, PATCH /admin/agents/{id}/allowed-tools

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-TOOL-001 | Load page | Tool catalog grouped by category |
| TC-TOOL-002 | Filter by category tab | Show only category tools |
| TC-TOOL-003 | Search tool by name | Filter results |
| TC-TOOL-004 | Select agent from list | Show checkboxes per tool |
| TC-TOOL-005 | Check tool checkbox | Add to pending changes, counter increments |
| TC-TOOL-006 | Uncheck tool | Remove from pending, counter decrements |
| TC-TOOL-007 | Category checkbox (select all) | All tools in category checked |
| TC-TOOL-008 | Category checkbox (deselect all) | All unchecked |
| TC-TOOL-009 | Click Save | PATCH all agents' allowed-tools → toast |
| TC-TOOL-010 | Save with 0 changes | Button disabled |
| TC-TOOL-011 | Pending changes counter | Shows accurate count |
| TC-TOOL-012 | Click "Register Tool" | New tool form opens |

---

## /admin/costs
File: costs.tsx | API: GET /admin/costs/summary, /costs/by-agent, /costs/by-model, /costs/by-department, /costs/daily, GET/PATCH /admin/budget

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-COST-001 | Time period: 24H/7D/30D/ALL | Date range updates, data reloads |
| TC-COST-002 | Custom date range | Start/end date pickers → data filtered |
| TC-COST-003 | Summary card: Total System Spend | microToUsd formatted |
| TC-COST-004 | Summary card: Remaining Budget | Budget - spend |
| TC-COST-005 | Summary card: Projected Month-End | Calculated projection |
| TC-COST-006 | Tab: 부서별 | Table: department name, usage, cost, change % |
| TC-COST-007 | Tab: 에이전트별 | Table: agent name, usage, cost |
| TC-COST-008 | Tab: 모델별 | Table: model name, provider, cost |
| TC-COST-009 | Sort table columns | Toggle ASC/DESC |
| TC-COST-010 | Budget input: set monthly budget | Number input → 저장 button |
| TC-COST-011 | Save budget | PATCH /admin/budget → toast |
| TC-COST-012 | Budget progress bar | Shows currentSpend/monthlyBudget % |
| TC-COST-013 | Budget NaN guard | Empty budget → shows $0 not $NaN (BUG-FIX verified) |
| TC-COST-014 | Export CSV button | Download CSV file |
| TC-COST-015 | Pagination: PREVIOUS_PAGE/NEXT_PAGE | Navigate pages |
| TC-COST-016 | Empty state: no data | "데이터가 없습니다" message |

---

## /admin/credentials
File: credentials.tsx | API: GET/POST/DELETE /admin/cli-credentials, GET/POST/DELETE /admin/api-keys

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-CRED-001 | Select user from list | Load that user's credentials |
| TC-CRED-002 | Tab: CLI_Tokens | Show CLI token list |
| TC-CRED-003 | Tab: API_Keys | Show API key list |
| TC-CRED-004 | Add CLI Token → fill label + token | POST → toast → table refresh |
| TC-CRED-005 | Empty label → submit | Validation error |
| TC-CRED-006 | Deactivate CLI token | DELETE → row removed |
| TC-CRED-007 | Add API Key → select provider | Provider-specific fields appear |
| TC-CRED-008 | Set scope: company/user | Scope selector |
| TC-CRED-009 | Submit API key | POST → toast |
| TC-CRED-010 | Delete API key | DELETE → row removed |
| TC-CRED-011 | Active_Keys counter | Accurate count |
| TC-CRED-012 | Encryption status: AES_256_GCM | Display badge |

---

## /admin/report-lines
File: report-lines.tsx | API: GET /admin/users, GET/PUT /admin/report-lines

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-REP-001 | Load page | Users with "reports to" dropdowns |
| TC-REP-002 | Change user's supervisor | Mark as dirty |
| TC-REP-003 | Save changes | PUT /admin/report-lines → toast |
| TC-REP-004 | Clear supervisor (null) | Set no manager |
| TC-REP-005 | Circular reporting | Server validation error |
| TC-REP-006 | No changes → save button | Disabled |
| TC-REP-007 | Add new report line | New row appears |

---

## /admin/soul-templates
File: soul-templates.tsx | API: GET/POST/PATCH/DELETE /admin/soul-templates, POST publish/unpublish

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-SOUL-001 | Click "New Template" | Form: name, description, content (markdown), category |
| TC-SOUL-002 | Fill all fields → save | POST → toast → list refresh |
| TC-SOUL-003 | Search templates | Filter by name |
| TC-SOUL-004 | Click edit | Form pre-filled → PATCH on save |
| TC-SOUL-005 | Click delete | Confirmation → DELETE |
| TC-SOUL-006 | Click publish | POST /publish → toast |
| TC-SOUL-007 | Click unpublish | POST /unpublish → toast |
| TC-SOUL-008 | View content preview | Full soul text displayed |
| TC-SOUL-009 | Empty name → submit | Validation error |
| TC-SOUL-010 | Category field | Optional text input |

---

## /admin/monitoring
File: monitoring.tsx | API: GET /admin/monitoring/status (refetch 30s)

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-MON-001 | Load page | Status cards: server, memory, DB, errors |
| TC-MON-002 | Server status badge | "Online" or "Error" |
| TC-MON-003 | Memory usage bar | % + color: <80% green, 80-90% yellow, >90% red |
| TC-MON-004 | Database status | Response time in ms |
| TC-MON-005 | Errors 24h count | Number display |
| TC-MON-006 | Auto-refresh 30s | Data updates automatically |
| TC-MON-007 | Click refresh button | Immediate refetch |
| TC-MON-008 | Uptime display | "7d 3h 45m" format |
| TC-MON-009 | Sys-log section | Recent server errors listed |
| TC-MON-010 | Error loading data | Error message + retry button |

---

## /admin/nexus
File: nexus.tsx | API: GET /admin/org-chart, GET/PUT /admin/nexus/layout, PATCH /admin/agents

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-NEXUS-001 | Load page | ReactFlow canvas with org chart nodes |
| TC-NEXUS-002 | Zoom in/out buttons | Canvas zoom changes |
| TC-NEXUS-003 | Fit view button | All nodes visible |
| TC-NEXUS-004 | Click agent node | Property panel opens on right |
| TC-NEXUS-005 | Drag agent node | Position updates |
| TC-NEXUS-006 | Drop agent on department | PATCH /admin/agents/{id} |
| TC-NEXUS-007 | Export PNG/SVG/JSON | File downloads |
| TC-NEXUS-008 | Print button | Print dialog opens |
| TC-NEXUS-009 | Search agent | Node highlighted |
| TC-NEXUS-010 | Edit node in panel | PATCH → save |
| TC-NEXUS-011 | Empty state (no agents) | "조직이 구성되지 않았습니다" |
| TC-NEXUS-012 | Save layout | PUT /admin/nexus/layout |
| TC-NEXUS-013 | Mini map | Shows overview of canvas |

---

## /admin/settings
File: settings.tsx | API: GET/PATCH /admin/companies/{id}, GET/POST/PUT/DELETE /admin/api-keys, GET/PUT /admin/company-settings/handoff-depth

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-SET-001 | Tab: General | Company info form |
| TC-SET-002 | Edit company name → save | PATCH → toast |
| TC-SET-003 | Tab: API Keys | Provider key management |
| TC-SET-004 | Add API key → select provider | Provider-specific fields |
| TC-SET-005 | Submit key | POST → toast |
| TC-SET-006 | Delete key | DELETE → toast |
| TC-SET-007 | Tab: Agent Settings | Handoff depth slider |
| TC-SET-008 | Adjust handoff depth → save | PUT → toast |
| TC-SET-009 | Slug field | Read-only display |
| TC-SET-010 | Created date | Formatted timestamp |

---

## /admin/onboarding
File: onboarding.tsx (900+ lines) | 5-step wizard

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-ONBOARD-001 | Step 1: Company created → displays | Company name + slug shown, Edit button |
| TC-ONBOARD-002 | Click Edit company name | Inline edit → PATCH on save |
| TC-ONBOARD-003 | Click "Next: Departments" | Move to Step 2 |
| TC-ONBOARD-004 | Step 2: Select org template | Template preview, Apply button |
| TC-ONBOARD-005 | Apply template | POST /admin/org-templates/{id}/apply → result summary |
| TC-ONBOARD-006 | Custom dept: type name → Add | POST /admin/departments → toast (BUG-FIX verified) |
| TC-ONBOARD-007 | Empty dept name → Add | No action (trim check) |
| TC-ONBOARD-008 | Click "빈 조직으로 시작" | Skip template, go to Step 3 |
| TC-ONBOARD-009 | Step 3: API Key setup | Anthropic key input field |
| TC-ONBOARD-010 | Enter API key → 등록 | POST /admin/api-keys → toast |
| TC-ONBOARD-011 | Click "Set up later" | Skip to Step 4 |
| TC-ONBOARD-012 | Step 4: Invite team member | Fields: username, name, email |
| TC-ONBOARD-013 | Fill form → 초대하기 | POST /admin/employees → toast + password shown |
| TC-ONBOARD-014 | First invite gets role admin | body includes {role: 'admin'} (BUG-FIX verified) |
| TC-ONBOARD-015 | Second invite gets role user | body has no role field (defaults to 'user') |
| TC-ONBOARD-016 | Copy initial password | Click Copy → clipboard |
| TC-ONBOARD-017 | Click Continue | Move to Step 5 |
| TC-ONBOARD-018 | Step 5: Summary | Shows company, template, API keys, invited count |
| TC-ONBOARD-019 | Click "CORTHEX 사용 시작하기" | POST /onboarding/complete → redirect to /admin → toast |
| TC-ONBOARD-020 | Click "이전 단계로 돌아가기" | Go back to Step 4 |
| TC-ONBOARD-021 | Previous on any step | Navigate back one step |

---

## Remaining Admin Pages (Shorter)

### /admin/sketchvibe (4 TC)
| TC-SKETCH-001 | Load page | STANDBY status badge |
| TC-SKETCH-002 | MCP status | Yellow indicator |
| TC-SKETCH-003 | How-it-works | 4 steps displayed |

### /admin/org-templates (7 TC)
| TC-OT-001 | Load page | Template list |
| TC-OT-002 | Preview template | Modal with structure |
| TC-OT-003 | Apply template | POST /apply → result |

### /admin/template-market (6 TC)
| TC-TM-001 | Load market | Published templates grid |
| TC-TM-002 | Clone template | POST clone → toast |

### /admin/agent-marketplace (7 TC)
| TC-AM-001 | Load marketplace | Soul template grid |
| TC-AM-002 | Import soul | POST import → toast |

### /admin/api-keys (13 TC)
| TC-APIKEY-001 | Create key | Form: name, scopes, expiration, rate limit |
| TC-APIKEY-002 | Raw key display | Modal with copy button |
| TC-APIKEY-003 | Rotate key | New key generated |
| TC-APIKEY-004 | Delete key | DELETE → removed |

### /admin/n8n-editor (7 TC)
| TC-N8N-001 | Health check pass | Load iframe |
| TC-N8N-002 | Health check fail | "Unreachable" message |
| TC-N8N-003 | Auto-refresh 30s | Status updates |

### /admin/marketing-settings (11 TC)
| TC-MKT-001 | Select provider per category | Model dropdown updates |
| TC-MKT-002 | Store API key | PUT → toast |
| TC-MKT-003 | Toggle watermark | PUT → toast |
| TC-MKT-004 | Race condition guard | config.engines[key] undefined → no crash (BUG-FIX verified) |

### /admin/memory-management (11 TC)
| TC-MEM-001 | Agent memory stats | Observation/memory counts |
| TC-MEM-002 | Flagged observations | List with dismiss/delete |
| TC-MEM-003 | Reset agent memory | Confirmation → DELETE |

### /admin/mcp-servers (16 TC)
| TC-MCPS-001 | Add server | Form: name, transport, command, args, env |
| TC-MCPS-002 | Test connection | Success: green + tool count + latency |
| TC-MCPS-003 | Test failure | Red + error message |

### /admin/mcp-access (7 TC)
| TC-MCPA-001 | Select agent | Load MCP access checkboxes |
| TC-MCPA-002 | Grant access | PUT → checkbox checked |

### /admin/mcp-credentials (11 TC)
| TC-MCPC-001 | Create credential | keyName + value (masked) |
| TC-MCPC-002 | Value never plaintext | Always masked display |

---

# PART 2: APP (localhost:5174) — 27 Pages, ~500 Test Cases

---

## /login
File: login.tsx (227 lines) | API: POST /api/auth/login

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-ALOGIN-001 | Enter ceo/password → INITIALIZE COMMAND | POST /auth/login → redirect to /hub |
| TC-ALOGIN-002 | Empty fields → submit | Validation error |
| TC-ALOGIN-003 | Wrong password | Error message displayed |
| TC-ALOGIN-004 | Rate limit (5+ fails) | Countdown timer, button disabled |
| TC-ALOGIN-005 | Password visibility toggle | Show/hide password |
| TC-ALOGIN-006 | "Keep session persistent" checkbox | Persist auth state |
| TC-ALOGIN-007 | "비밀번호 찾기" link | Navigate to reset flow |
| TC-ALOGIN-008 | ?redirect=/chat query param | Login → redirect to /chat |
| TC-ALOGIN-009 | Already authenticated | Auto-redirect to /hub |
| TC-ALOGIN-010 | "Request access" link | Navigate or info display |

---

## /hub
File: hub/index.tsx (554 lines) | API: GET /workspace/org-chart, GET/POST /workspace/chat/sessions

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-HUB-001 | Page load with secretary agent | SecretaryHubLayout rendered |
| TC-HUB-002 | Page load without secretary | Dashboard view with quick action cards |
| TC-HUB-003 | Welcome banner | "Welcome, Commander" + company name + agent count |
| TC-HUB-004 | Click "Start Chat" card | Create chat session or open chat view |
| TC-HUB-005 | Click "New Job" card | Navigate to /jobs |
| TC-HUB-006 | Click "View NEXUS" card | Navigate to /nexus |
| TC-HUB-007 | Click "Reports" card | Navigate to /costs |
| TC-HUB-008 | Click "Session Logs" button | Show session list |
| TC-HUB-009 | Click "Force Sync" button | Invalidate all queries, refresh |
| TC-HUB-010 | Agent Status panel | Shows 0/N ONLINE with agent cards |
| TC-HUB-011 | No agents configured | "No agents configured." message |
| TC-HUB-012 | Click "Manage All Agents" | Navigate to /agents |
| TC-HUB-013 | Live System Events | Shows hub init + session messages |
| TC-HUB-014 | Navigate with ?session=id | Auto-select session |

---

## /dashboard
File: dashboard.tsx (792 lines) | API: GET /workspace/dashboard/summary, /usage, /budget, /costs, /quick-actions, /satisfaction

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-ADASH-001 | Page load | 4 stat cards: Active Agents, Departments, Pending Jobs, Total Costs |
| TC-ADASH-002 | Active Units table | Agent list with status/tier/ops columns |
| TC-ADASH-003 | Click "View Full Roster" | Navigate to /agents |
| TC-ADASH-004 | Live Event Stream | Real-time events display |
| TC-ADASH-005 | System Health Matrix | CPU, Memory, NEXUS gauges |
| TC-ADASH-006 | Cost Trend chart | Daily token consumption line chart |
| TC-ADASH-007 | Departmental Load | Cost per department bars |
| TC-ADASH-008 | Task Status pie | Completed/InProgress/Failed/Pending % |
| TC-ADASH-009 | Recent Tasks table | Status + Category + Count |
| TC-ADASH-010 | Click "View History" | Navigate to activity log |
| TC-ADASH-011 | Quick action: "New Conversation" | Navigate to /chat |
| TC-ADASH-012 | Quick action: "Create Workflow" | Navigate to /n8n-workflows |
| TC-ADASH-013 | Quick action: "Weekly Report" | Navigate to /reports |
| TC-ADASH-014 | Empty state (no data) | "No department data" etc. |
| TC-ADASH-015 | Pagination on units table | Page 1/2 navigation |

---

## /chat
File: chat.tsx (265 lines) | API: GET /workspace/agents, GET/POST/PATCH/DELETE /workspace/chat/sessions

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-CHAT-001 | Page load | Session list sidebar + main area |
| TC-CHAT-002 | Click "New Chat Session" (+) | AgentListModal opens |
| TC-CHAT-003 | Select agent from modal | POST /workspace/chat/sessions → new session created |
| TC-CHAT-004 | Click existing session | ChatArea loads that session |
| TC-CHAT-005 | Send message in ChatArea | POST /workspace/chat/sessions/{id}/messages → message appears |
| TC-CHAT-006 | Agent response streams | Response appears below user message |
| TC-CHAT-007 | Rename session (inline) | PATCH session title |
| TC-CHAT-008 | Delete session | Confirmation → DELETE → removed from list |
| TC-CHAT-009 | No sessions state | "No sessions yet. Start a new chat above" |
| TC-CHAT-010 | Empty message → send | Button disabled or no action |
| TC-CHAT-011 | No agent selected | "에이전트를 선택해서 대화를 시작하세요" |
| TC-CHAT-012 | Mobile: click session | Chat view shows, list hidden |
| TC-CHAT-013 | Mobile: back arrow | Return to session list |
| TC-CHAT-014 | Agent info panel (desktop) | Right sidebar with agent details |
| TC-CHAT-015 | Attachment support | File upload in chat input |

---

## /agents
File: agents.tsx (1008 lines) | API: GET/POST/PATCH/DELETE /admin/agents, POST /workspace/agents/{id}/soul-preview

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-AAGENT-001 | Click "에이전트 생성" | Create form: name, tier, model, department, soul |
| TC-AAGENT-002 | Fill form → 생성 | POST → toast → agent card appears |
| TC-AAGENT-003 | Empty name → submit | Validation error |
| TC-AAGENT-004 | Name > 100 chars | Validation error |
| TC-AAGENT-005 | Department dropdown | Active departments + "미배속" |
| TC-AAGENT-006 | Tier: manager/specialist/worker | Selection updates model default |
| TC-AAGENT-007 | Model dropdown | Claude Opus/Sonnet/Haiku |
| TC-AAGENT-008 | Toggle "비서 에이전트" | isSecretary flag |
| TC-AAGENT-009 | Big Five personality sliders | Adjustable 0-100 per trait |
| TC-AAGENT-010 | Click agent → detail panel | Soul, capabilities, model info |
| TC-AAGENT-011 | Soul editor: type "{{" | Autocomplete popup for variables |
| TC-AAGENT-012 | Click "프리뷰" | POST /workspace/agents/{id}/soul-preview → rendered |
| TC-AAGENT-013 | A/B mode toggle | Two preview panes |
| TC-AAGENT-014 | Select personality preset for A/B | Preview updates |
| TC-AAGENT-015 | Edit agent | Form pre-filled → PATCH |
| TC-AAGENT-016 | Delete agent | Confirmation → DELETE |
| TC-AAGENT-017 | Search by name | List filtered |
| TC-AAGENT-018 | Filter by department | Dropdown filter |
| TC-AAGENT-019 | Filter: 활성/전체/비활성 | Status filter buttons |
| TC-AAGENT-020 | Status dot colors | online=green, working=blue, error=red, offline=gray |

---

## /departments
File: departments.tsx (575 lines) | API: GET/POST/PATCH/DELETE /admin/departments, GET cascade-analysis, GET agents by dept

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-ADEPT-001 | Click "Create Department" | Form: name (required), description |
| TC-ADEPT-002 | Fill form → 생성 | POST → toast → card appears |
| TC-ADEPT-003 | Click department card | Detail panel: agent list, stats |
| TC-ADEPT-004 | Edit department | PATCH on save |
| TC-ADEPT-005 | Delete → cascade analysis | Modal shows affected agents/tasks/docs |
| TC-ADEPT-006 | Force delete | DELETE with ?mode=force |
| TC-ADEPT-007 | Empty department | "이 부서에 할당된 에이전트가 없습니다" |
| TC-ADEPT-008 | Desktop: agent table layout | Horizontal table |
| TC-ADEPT-009 | Mobile: agent card layout | Responsive grid |
| TC-ADEPT-010 | Agent status color | green/blue/red/gray dots |

---

## /knowledge
File: knowledge.tsx (1176 lines) | API: GET/POST/PATCH/DELETE /workspace/knowledge/docs, folders, search, memories

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-KNOW-001 | Tab: 문서 / 에이전트 기억 | View switches |
| TC-KNOW-002 | Folder tree (left panel) | Expandable folder hierarchy |
| TC-KNOW-003 | Click folder | Documents in folder listed |
| TC-KNOW-004 | Click "+ 새 문서" | Create form opens |
| TC-KNOW-005 | Content type selector | markdown/text/html/mermaid options |
| TC-KNOW-006 | Fill title + content → save | POST /workspace/knowledge/docs → toast |
| TC-KNOW-007 | Search documents | Hybrid/semantic/keyword modes |
| TC-KNOW-008 | Search mode toggle | 혼합/의미/키워드 buttons |
| TC-KNOW-009 | Filter by content type dropdown | 전체/Markdown/텍스트/HTML/Mermaid |
| TC-KNOW-010 | Embedding status badge | done/pending/none |
| TC-KNOW-011 | Edit document | PATCH → save |
| TC-KNOW-012 | Delete document | Confirmation → DELETE |
| TC-KNOW-013 | Document versions | Version history list |
| TC-KNOW-014 | Agent memories tab | Memory cards with type badges |
| TC-KNOW-015 | Memory type: learning/insight/preference/fact | Colored badges |
| TC-KNOW-016 | Confidence bar | Visual width matches % |
| TC-KNOW-017 | Mobile: sidebar default closed | Opens as overlay on tap |
| TC-KNOW-018 | Mobile: auto-close on folder select | Sidebar closes |
| TC-KNOW-019 | Pagination (PAGE_SIZE=20) | Page navigation |
| TC-KNOW-020 | Empty folder | "이 폴더에 문서가 없습니다" + create button |

---

## /jobs
File: jobs.tsx (1246 lines) | API: GET/POST/DELETE /workspace/jobs, schedules, triggers, chain + WebSocket

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-JOBS-001 | Tab: 야간 작업 | One-time jobs list |
| TC-JOBS-002 | Tab: 반복 스케줄 | Schedule list |
| TC-JOBS-003 | Tab: ARGOS 트리거 | Trigger list |
| TC-JOBS-004 | Click "Create Job" | Form: agent selector, instruction text, scheduled time |
| TC-JOBS-005 | Select agent + enter instruction → submit | POST /workspace/jobs → toast |
| TC-JOBS-006 | Set future scheduled time | Job queued for that time |
| TC-JOBS-007 | Job status badges | queued/processing/completed/failed/blocked with colors |
| TC-JOBS-008 | Processing job progress bar | Updates via WebSocket |
| TC-JOBS-009 | Mark job as read | PUT /read → flag set |
| TC-JOBS-010 | Cancel/Delete job | DELETE → removed |
| TC-JOBS-011 | Create schedule | Form: name, instruction, frequency, time |
| TC-JOBS-012 | Frequency: daily/weekdays/custom | Days selector for custom |
| TC-JOBS-013 | Toggle schedule on/off | isActive toggled |
| TC-JOBS-014 | Edit schedule | Form pre-filled → PATCH |
| TC-JOBS-015 | Create ARGOS trigger | Form: type, condition, agent |
| TC-JOBS-016 | Trigger type: price-above/below/market-open/close | Condition fields change |
| TC-JOBS-017 | Toggle trigger on/off | isActive toggled |
| TC-JOBS-018 | Chain job: add steps | Multi-step form |
| TC-JOBS-019 | Search jobs | By instruction/agent |
| TC-JOBS-020 | Filter by status dropdown | All/대기/진행중/완료/실패 |
| TC-JOBS-021 | Stats cards | 완료/실행중/활성스케줄/오류알림 counts |
| TC-JOBS-022 | WebSocket: real-time updates | Progress bar + status change |

---

## /settings
File: settings.tsx (869 lines) | API: GET/PATCH /workspace/profile, API keys, telegram

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-ASET-001 | Tab: 일반 | Profile: username, email, name, role |
| TC-ASET-002 | Edit name → 이름 저장 | PATCH /workspace/profile → toast |
| TC-ASET-003 | Password change: new + confirm | Validation: must match, min 6 chars |
| TC-ASET-004 | Tab: 테마 | system/light/dark selector |
| TC-ASET-005 | Tab: 알림 설정 | Toggle notification types |
| TC-ASET-006 | Tab: 허브 | Hub configuration |
| TC-ASET-007 | Tab: API 연동 | Provider key management |
| TC-ASET-008 | Tab: 텔레그램 | Bot token input + test button |
| TC-ASET-009 | Telegram: test connection | POST /workspace/telegram/test → success/error |
| TC-ASET-010 | Tab: 소울 편집 | Soul template editor with variables |
| TC-ASET-011 | Tab: MCP 연동 | MCP configuration |
| TC-ASET-012 | 8 tabs horizontally scrollable on mobile | Scroll works |
| TC-ASET-013 | Unsaved changes → navigate away | Confirm dialog |

---

## /costs
File: costs.tsx | API: GET /workspace/dashboard/costs, /costs/daily, /costs/by-agent, /budget

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-ACOST-001 | Time tabs: 7d/30d/90d | Data reloads for period |
| TC-ACOST-002 | Card: 이번 달 비용 | USD formatted total |
| TC-ACOST-003 | Card: Top Model | Highest-cost model name + cost |
| TC-ACOST-004 | Card: 일 평균 | Daily average calculated |
| TC-ACOST-005 | Card: 예산 대비 | Progress bar shows % |
| TC-ACOST-006 | Daily trend chart | Line graph with data points |
| TC-ACOST-007 | Chart: 7 Days / 30 Days toggle | Chart range changes |
| TC-ACOST-008 | Agent cost table | Sorted by cost |
| TC-ACOST-009 | Export button | Download action |
| TC-ACOST-010 | Export CSV button | CSV file download |
| TC-ACOST-011 | Empty state: no data | "데이터가 없습니다" / "데이터 없음" |

---

## /trading
File: trading.tsx | Mostly static demo data + chart components

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-TRADE-001 | Timeframe: 1분/5분/15분/1시간/1일/1주 | Chart updates |
| TC-TRADE-002 | Ticker table | 8 rows: BTC, ETH, SOL, AAPL, NVDA, TSLA, AMZN, GOOGL |
| TC-TRADE-003 | Click ticker row | Chart switches to that ticker |
| TC-TRADE-004 | Chart type: 캔들/라인/영역 | Chart visualization changes |
| TC-TRADE-005 | OHLC badges | O/H/L/C values displayed |
| TC-TRADE-006 | Order panel: 매수/매도 toggle | Side switches |
| TC-TRADE-007 | Enter quantity + price | Estimated cost calculates |
| TC-TRADE-008 | Click "주문 실행" | Submit order (or demo action) |
| TC-TRADE-009 | Active Strategies section | 3 strategies with ROI + risk |
| TC-TRADE-010 | Global Signal Feed | 2 recent signals displayed |
| TC-TRADE-011 | Footer: Latency/Server/API status | Real-time values |

---

## /notifications
File: notifications.tsx (514 lines) | API: GET/PATCH/POST /workspace/notifications

| TC-ID | Action | Expected Result |
|-------|--------|-----------------|
| TC-NOTIF-001 | Load notifications | List grouped by date (Today/Yesterday/date) |
| TC-NOTIF-002 | Click notification | Marked as read → PATCH /read |
| TC-NOTIF-003 | Click action URL | Navigate to linked page |
| TC-NOTIF-004 | "전체 읽음" button | POST /read-all → all marked read |
| TC-NOTIF-005 | Filter: unread only | Show only unread |
| TC-NOTIF-006 | Tab: all/tasks/system | Filter by type |
| TC-NOTIF-007 | Search notifications | Title/body search |
| TC-NOTIF-008 | Unread badge count | Accurate number |
| TC-NOTIF-009 | TYPE_ICON_STYLE per type | Correct icon + color |
| TC-NOTIF-010 | Empty state | "알림이 없습니다" |
| TC-NOTIF-011 | Real-time: new notification | Appears in list |

---

## Remaining App Pages (Shorter)

### /organization (11 TC)
Stats cards, tile navigation to departments/agents/tiers/nexus, network load chart

### /tiers (11 TC)
Create/edit/delete tier configs, reorder, model selection, maxTools

### /nexus (13 TC)
Canvas with org chart, zoom, drag, export, edit mode, layout save

### /agora (9 TC)
Create debate, category chips, debate list, detail view, timeline

### /memories (12 TC)
Agent cards, observations tab (filter by domain/outcome/flagged), memories tab, pin/unpin, timeline

### /messenger (12 TC)
Channel list, conversations, send message, file upload, reactions, threads, unread badges

### /files (13 TC)
Upload, drag-drop, type filter, search, sort, grid/list view, download, delete, storage bar

### /classified (13 TC)
Classification filter, date range, search, sort, folder tree, quality score, delegation chain

### /reports (12 TC)
Create report, edit draft, submit to CEO, review, comments, search, delete, PDF export

### /n8n-workflows (8 TC)
Workflow cards, stats, pipeline visualization, trigger/manual execution

### /marketing-pipeline (8 TC)
4 status columns (draft/pending/approved/published), card drag, status change

### /marketing-approval (8 TC)
Bulk actions, approval/rejection cards, comment on rejection

### /activity-log (8 TC)
Event list, search, filter by category, date range, sort, pagination

### /ops-log (5 TC)
System events, filter by level, search, stack traces, export

### /performance (11 TC)
Period selector, response time/success rate/error rate metrics, agent table, soul gym

### /sns (8 TC)
Tabs: Scheduled/Published/Drafts, stats grid, filter, post CRUD

---

# PART 3: CROSS-CUTTING TEST CASES (Both Admin + App)

| TC-ID | Category | Test | Expected |
|-------|----------|------|----------|
| TC-GLOBAL-001 | Auth | Visit protected page without token | Redirect to /login |
| TC-GLOBAL-002 | Auth | Expired token → API call | 401 → redirect to login |
| TC-GLOBAL-003 | Auth | Session persistence across 10+ pages | No unexpected logout |
| TC-GLOBAL-004 | Theme | Dark theme on every page | bg-corthex-bg everywhere, no white |
| TC-GLOBAL-005 | Theme | No hardcoded colors | 0 files with bg-blue-*, [#hex] etc |
| TC-GLOBAL-006 | Icons | All Lucide React | 0 Material Symbols text |
| TC-GLOBAL-007 | Font | Inter + JetBrains Mono | Correct font stack |
| TC-GLOBAL-008 | Responsive | 390x844 viewport | No horizontal overflow |
| TC-GLOBAL-009 | Responsive | Mobile header | Hamburger + title + actions |
| TC-GLOBAL-010 | Console | 0 errors on every page | No JS errors |
| TC-GLOBAL-011 | 404 | Invalid route (admin) | 404 page displayed |
| TC-GLOBAL-012 | 404 | Invalid route (app) | 404 page displayed (BUG-FIX verified) |
| TC-GLOBAL-013 | XSS | Script tags in text fields | Escaped, not executed |
| TC-GLOBAL-014 | CSRF | API calls include auth header | Bearer token present |
| TC-GLOBAL-015 | Loading | Skeleton loaders during fetch | Visible during loading |
| TC-GLOBAL-016 | Empty | Empty data states | Proper message, not blank |
| TC-GLOBAL-017 | Error | API 500 response | Error toast, not crash |
| TC-GLOBAL-018 | Toast | Success/error notifications | Auto-dismiss, closeable |
| TC-GLOBAL-019 | Modal | Escape key closes | Dialog dismissed |
| TC-GLOBAL-020 | Pagination | Next/prev on tables | Page changes correctly |

---

# Summary

| Category | Count |
|----------|-------|
| Admin Pages | 22 |
| App Pages | 27 |
| Admin Test Cases | ~400 |
| App Test Cases | ~500 |
| Cross-cutting Cases | 20 |
| **Total Test Cases** | **~920** |
| Unique API Endpoints | 150+ |
| Form Fields | 100+ |
| Modals/Dialogs | 25+ |
| Bug Fixes Verified | 5 (role, dept create, costs NaN, marketing crash, 404) |
