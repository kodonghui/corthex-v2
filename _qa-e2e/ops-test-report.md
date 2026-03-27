# CORTHEX v2 Operations Test Report
## "사주포춘" AI Fortune-Telling Company

**Date**: 2026-03-27
**Tester**: API-based operational test (curl)
**Server**: https://corthex-hq.com
**DB State**: Fresh reset (no seed data)

---

## Executive Summary

| Category | Score | Notes |
|----------|-------|-------|
| **Admin Onboarding** | 8/10 | Works, but CLI credential requirement is confusing |
| **Organization Setup** | 9/10 | Department & agent CRUD flawless |
| **Agent Chat (Core)** | 8/10 | Excellent responses, but auth/credential flow has friction |
| **Feature Coverage** | 7/10 | Core features work, some endpoints return 404 |
| **Notifications** | 9/10 | Real-time delegation/completion tracking works |
| **Overall** | **7.5/10** | Solid core, rough edges in onboarding UX and multi-user setup |

---

## Phase 1: Admin Onboarding

### 1.1 Admin Login (`POST /api/auth/admin/login`)
- **Status**: PASS
- **Response Time**: 0.44s (fast)
- **Notes**: admin/admin1234 works from admin_users table (superadmin)

### 1.2 Company Registration (`POST /api/auth/register`)
- **Status**: PASS
- **Response Time**: 11.4s (SLOW - acceptable for one-time setup)
- **Notes**: Self-registration creates company + admin user + deploys full org template (29 agents, 7 departments). The "올인원" template auto-applied on registration.
- **UX Issue**: No feedback during the 11s wait. Frontend should show progress.

### 1.3 Onboarding Completion (`POST /api/onboarding/complete`)
- **Status**: PASS
- **Response Time**: fast
- **Notes**: Works but feels disconnected. The onboarding was essentially already done by the registration endpoint (template applied, agents created). The onboarding/complete endpoint just flips a flag.

### 1.4 CLI Credential Registration
- **Status**: PASS (eventually)
- **Response Time**: 1.2s
- **BUG (MEDIUM)**: The POST to `/api/admin/cli-credentials` fails with `TENANT_003` ("회사를 먼저 선택해주세요") unless `?companyId=` is added as query param. This is because the admin JWT has companyId='system'. The same issue affects `/api/admin/api-keys`. The UI presumably handles this, but the API behavior is inconsistent.
- **UX Issue**: Users MUST register a CLI credential before ANY chat works. This is the #1 friction point. New users will be confused by the error "CLI 토큰이 등록되지 않았습니다".

---

## Phase 2: Organization Setup

### 2.1 Department Creation (`POST /api/admin/departments`)
- **Status**: PASS (4/4 created)
- **Response Time**: ~0.5s each (fast)
- **Created**:
  - 운세분석팀 (사주팔자, 타로, 별자리)
  - 마케팅팀 (MZ세대 디지털 마케팅)
  - 고객서비스팀 (고객 상담)
  - 경영지원팀 (사업기획, 법무)

### 2.2 Agent Creation (`POST /api/admin/agents`)
- **Status**: PASS (6/6 created)
- **Response Time**: ~0.5s each (fast)
- **Agents created with souls**:
  - 운세분석관 (specialist, claude-haiku-4-5)
  - 마케팅매니저 (manager, claude-sonnet-4-6)
  - 콘텐츠작성자 (worker, claude-haiku-4-5)
  - 고객상담원 (specialist, claude-haiku-4-5)
  - 기획담당 (specialist, claude-sonnet-4-6)
  - 법무담당 (worker, claude-haiku-4-5)

### 2.3 Agent Activation (`PATCH /api/admin/agents/:id`)
- **Status**: PASS (7/7 set to ONLINE including 비서실장)
- **Notes**: Clean API, status transitions work correctly.

### 2.4 Agent Editing
- **Status**: PASS
- **Notes**: Updated 운세분석관's role field successfully. PATCH API clean.

---

## Phase 3: Credential Registration

### 3.1 Anthropic API Key (`POST /api/admin/api-keys`)
- **Status**: PASS
- **Response Time**: 0.37s
- **Notes**: Stored in credential vault (encrypted). Required `?companyId=` query param for superadmin.

### 3.2 Serper API Key
- **Status**: PASS
- **Response Time**: fast
- **Notes**: Same pattern, works fine.

### 3.3 CLI Credential
- **Status**: PASS
- **Response Time**: 1.2s (validates token against Anthropic API)
- **CRITICAL FINDING**: The AI engine uses CLI credentials (per-user encrypted tokens), NOT the credential vault API keys. This means:
  - Registering an Anthropic key in the credential vault does NOT enable chat
  - Each user needs their own CLI credential registered
  - This is architecturally correct (per-user cost isolation) but creates terrible onboarding UX

---

## Phase 4: CEO App - Agent Chat

### Task 1: 비서실장 - Marketing Strategy
- **Status**: PASS
- **Response Time**: ~60s (orchestration with delegation)
- **Quality**: 9/10
- **Details**: The 비서실장 autonomously delegated to CSO and CMO, collected their analyses, and synthesized a comprehensive CEO report. The response included:
  - Market analysis (3,000억원 market)
  - Target segmentation (MZ세대)
  - Content calendar (4-week plan)
  - KPIs and ROI projections
  - Risk analysis
- **Delegation confirmed**: Notifications showed CSO and CMO delegation_complete events
- **Impressive**: Multi-agent orchestration actually works end-to-end

### Task 2: 운세분석관 - Fortune Reading
- **Status**: PASS
- **Response Time**: ~20s
- **Quality**: 8/10
- **Details**: Complete saju analysis for 1995/3/15 female including:
  - Correct zodiac (물고기자리) and Chinese zodiac (돼지띠)
  - Year pillar (을해년), month pillar (기묘월), day pillar (정미일)
  - 2026 forecast by category (career, money, love, health)
  - Monthly highlights
- **Minor issue**: Some fortune details are obviously fabricated (specific percentages like "68% interest rate") but this is acceptable for AI fortune-telling

### Task 3: 마케팅매니저 - Instagram Posts
- **Status**: PASS
- **Response Time**: ~25s
- **Quality**: 8/10
- **Details**: 5 complete Instagram posts with:
  - Emoji-rich formatting
  - Korean hashtags (10+ per post)
  - Varied topics (daily fortune, tips, love, career, tarot spreads)
  - Call-to-action elements
- **Issue**: Post #4 references "2024년" instead of "2026년" - minor hallucination

### Task 4: 기획담당 - Business Plan
- **Status**: PASS
- **Response Time**: ~40s
- **Quality**: 9/10
- **Details**: Professional business plan with:
  - Market sizing (5,000억원)
  - Competitor analysis table
  - Revenue models (subscription, per-session, premium)
  - Customer segmentation
- **Note**: Uses claude-sonnet-4-6, noticeably higher quality than haiku agents

### Task 5: 법무담당 - Terms of Service
- **Status**: PASS
- **Response Time**: ~30s
- **Quality**: 8/10
- **Details**: Complete ToS draft with:
  - 20+ articles covering all standard sections
  - Service-specific clauses (fortune telling disclaimers)
  - Refund policy
  - Dispute resolution
  - Privacy considerations

---

## Phase 5: Other Features

### 5.1 Scheduled Jobs (`POST /api/workspace/jobs`)
- **Status**: PASS
- **Created**: "매일 오늘의 12궁 별자리 운세" scheduled for next day
- **Status check**: Shows "queued" correctly

### 5.2 Knowledge Base
- **Folder creation**: PASS
- **Document creation**: PASS (markdown, with tags)
- **Created**: "사주 이론" folder with "사주 기초" document
- **Note**: Knowledge docs store well. Embedding field is null (Voyage AI not triggered yet).

### 5.3 Costs Tracking
- **Status**: PASS
- **Data**: 5 API calls recorded, total 93,572 microdollars (~$0.09)
  - 2,704 input tokens, 6,350 output tokens
  - All Anthropic provider
- **Issue**: Individual cost records endpoint returned empty while summary had data

### 5.4 Notifications
- **Status**: PASS
- **Count**: 7 notifications generated
- **Types**: chat_complete (5), delegation_complete (2)
- **Quality**: Excellent - shows agent name, links to correct session
- **Note**: isRead=false for all (no read-marking tested)

### 5.5 Org Chart
- **Status**: PASS
- **Data**: Shows all 11 departments with nested agents
- **Note**: Clean hierarchical structure

### 5.6 Activity Log
- **Status**: PASS
- **Count**: 8 entries (all chat messages)
- **Issue**: actorName is null in activity log entries

### 5.7 Profile
- **Status**: PASS
- **Data**: Returns correct user info

### 5.8 Sessions List
- **Status**: PASS
- **Count**: 6 sessions with correct titles
- **Note**: Titles auto-generated from first message content (nice feature)

---

## Bugs Found

### CRITICAL
1. **CLI Credential required for ANY chat** - No fallback to company-level API keys. If env var ANTHROPIC_API_KEY is not set on server, and user has no CLI credential, all chat fails silently with a generic error message. New users hit this wall immediately.

### HIGH
2. **Multi-user agent visibility is empty for new employees** - User "sajuceo" (role=user, RBAC=employee) sees 0 agents in workspace agent list. Root cause: `departmentScopeMiddleware` queries `employee_departments` table for department assignments. New users have no assignments, so `departmentIds=[]`, which triggers early return of empty data. This is **by design** (department-scoped access control) but creates a terrible first-time UX. The admin must assign the user to departments before they can see anything. The onboarding flow doesn't guide this.

3. **Non-admin users can't chat** - Even if sajuceo could see agents, they'd fail because no CLI credential is set. There's no self-service way for regular users to register their own credentials.

### MEDIUM
4. **Tenant middleware inconsistency** - POST endpoints fail with TENANT_003 for superadmin unless `?companyId=` query param is explicitly provided. This is a common pattern across admin API keys, CLI credentials, etc. The UI probably handles it, but it's an API design smell.

5. **Monitoring endpoint 404** - `/api/admin/monitoring` returns NOT_FOUND. The correct path is `/api/admin/monitoring/status` but even that returns empty data for superadmin. No company-scoped monitoring available.

6. **Dashboard endpoint 404** - `/api/workspace/dashboard` returns NOT_FOUND (no such route). The hub is a streaming POST endpoint, not a GET dashboard.

7. **Company settings endpoint 404** - `/api/admin/company-settings` returns NOT_FOUND.

8. **Cost records empty** - `/api/admin/costs/records` returns empty while `/api/admin/costs/summary` shows 5 calls. Possible route mismatch.

9. **Activity log missing actorName** - All activity log entries have null actorName.

10. **Year hallucination** - 마케팅매니저 generated "2024년" in Instagram posts instead of "2026년".

### LOW
11. **Tools endpoint empty** - `/api/admin/tools` returns 0 tools. Expected built-in tools to exist from seed, but DB was freshly reset.

12. **Report lines empty** - No report lines exist (expected for fresh setup, but template should create some).

13. **Soul templates empty** - `/api/workspace/soul-templates` returns 0 templates. The seed should populate these.

14. **Duplicate 비서실장** - The agent list shows TWO 비서실장 agents (one from template, one from seedSystemAgent). One is online, one offline. This could confuse users.

---

## UX Friction Points

1. **Onboarding cliff**: Registration creates 29 agents but none have CLI credentials. Chat immediately fails. Users need to navigate to admin > credentials > CLI credentials > register token BEFORE they can chat with any agent.

2. **No guided setup**: After company creation, there's no wizard or guide that says "Step 1: Register your API key, Step 2: Try chatting". The user is dropped into an empty dashboard.

3. **Admin vs App context switching**: The admin panel uses admin_users table with superadmin JWT (companyId='system'), while the app uses users table with company-scoped JWT. Users need to mentally switch between two auth contexts.

4. **No cost visibility in app**: The workspace has no cost tracking endpoint. Only admin can see costs. CEO should be able to see their spending.

5. **Agent status management**: All agents default to 'offline' after creation. Admin must manually PATCH each agent to 'online'. Should default to 'online' or have a bulk activate option.

6. **Session title auto-generation**: Nice feature, but titles are truncated from the first message which can be cryptic.

---

## What Works Amazingly

1. **비서실장 orchestration**: The secretary agent actually delegates to department heads, collects responses, and synthesizes a CEO report. This is the killer feature.

2. **Agent personality through souls**: Each agent responds in character. The 운세분석관 uses mystical language, 법무담당 uses formal legal tone, etc.

3. **Notification system**: Real-time delegation tracking is professional-grade.

4. **Multi-tenant isolation**: Company data properly isolated. JWT-based auth works correctly.

5. **API design**: Clean REST API with consistent `{success, data}` envelope, Zod validation, proper error codes.

6. **Org template system**: One-click org deployment with 7 departments and 29 specialized agents is impressive.

---

## Recommendations

### Must Fix (P0)
- Auto-create CLI credential from company API key during registration
- Fix workspace agent visibility for non-admin users
- Add onboarding wizard that guides to credential setup

### Should Fix (P1)
- Default new agents to 'online' status
- Add bulk agent status management
- Fix monitoring/dashboard/settings endpoints
- Deduplicate 비서실장 creation

### Nice to Have (P2)
- Add cost tracking to workspace app
- Self-service CLI credential management for regular users
- Agent response streaming in REST endpoint (currently async only)
- Fix activity log actorName population

---

## Test Environment Details

```
Server: https://corthex-hq.com
Health: {"status":"ok","checks":{"db":true}}
Company: 사주포춘 (slug: saju-fortune)
Company ID: 3f8707a9-5185-479a-ac50-97892475912d
Admin User: sajuadmin (admin role, CEO JWT)
CEO User: sajuceo (user role, employee JWT)
Departments: 11 (7 template + 4 custom)
Agents: 36 (29 template + 6 custom + 1 system 비서실장)
Online Agents: 7 (6 custom + 1 비서실장)
Chat Sessions: 6
Messages Sent: 6 (5 received AI responses, 1 failed due to missing CLI credential)
Notifications Generated: 7
Total API Cost: ~$0.09 (93,572 microdollars)
```
