# 2026-03-18 — Code Review + DB Recovery + Review Automation

## What happened

### 1. /simplify — tenantMiddleware security fix
- 13 admin route files were missing `tenantMiddleware`
- Any admin could access other companies' data via query param override
- Fixed: added tenantMiddleware to budget, costs, audit-logs, tool-invocations, report-lines, org-chart, users, agent-reports, mcp-servers, security, quality-rules, tools, employees
- Removed employees.ts local `resolveCompanyId()` in favor of middleware

### 2. /bmad-bmm-code-review findings
- SwitchToCeoButton had inconsistent `dark:` classes → fixed
- Google Fonts missing weight 900 + Noto Serif KR → added
- Color constants duplicated in 8 files → extracted to `admin/src/lib/colors.ts`
- layout.tsx unused `dark:bg-zinc-950` → removed

### 3. Company delete bug
- DELETE endpoint returned 409 if active users existed — blocking ALL deletions
- Changed to cascade: deactivate users + agents first, then soft-delete company

### 4. DB tables missing on production (7 tables!)
- tier_configs, credentials, agent_reports, mcp_server_configs, agent_mcp_access, mcp_lifecycle_events, company_api_keys
- Plus is_published columns on soul_templates and org_templates
- Root cause: Drizzle migration journal said "done" but SQL never executed
- Fix: created 0058_recovery-missing-tables.sql with IF NOT EXISTS, force-ran via temp endpoint

### 5. Memory update
- MEMORY.md was completely stale (said "next: Phase 1-4 implementation" when ALL 21 Epics are done)
- Full codebase scan: 26 admin pages, 27+ CEO pages, 62 routes, 117 tables, 1177+ tests
- Updated memory to reflect actual production state

### 6. Review automation setup
- **CodeRabbit**: installed GitHub App + `.coderabbit.yaml` with project-specific rules
- **Gemini Code Assist**: installed + `.gemini/styleguide.md` with 6-priority review guide
- Both auto-review on every PR

## Commits
- `23920a1` fix: code review — tenantMiddleware security + shared colors + font fixes
- `7c87321` fix: company delete cascade
- `d911ef1` fix: recovery migration for 7 missing DB tables
- `694bcd6` fix: add temporary run-recovery endpoint
- `dc4ba23` chore: remove temporary run-recovery endpoint
- `b33bc57` chore: add CodeRabbit AI code review configuration
- `b468dcb` chore: add Gemini Code Assist style guide

## API Health Check Result (after fixes)
- 22/22 admin endpoints returning 200 OK
- 0 previously broken endpoints remaining
