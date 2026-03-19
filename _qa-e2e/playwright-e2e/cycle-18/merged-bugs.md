# Merged Bugs — Cycle 18 (v2.1 first CRUD cycle)

## Summary
- Raw: 8 bugs (A:5, B:3, C:0, D:0)
- After dedup: **6 unique** (B003=A002 dup, B001=headless-only)
- CRUD tested: Dept ✅ full, Agent ❌ create 500, Settings ✅ full
- **THIS IS WHAT 6 PREVIOUS CYCLES MISSED BY NOT DOING CRUD**

## P1 (High) — 2 bugs

### BUG-A001: Agent create 500 FK violation
- agents.tsx:239 sends admin_users.id as userId, but agents.user_id FK → users table
- Fix: either skip userId for admin-created agents, or create a matching users record
- Auto-fixable: YES (Logic, 1-2 files)

### BUG-A002: Onboarding loop (confirmed by B003)
- Completing onboarding doesn't persist. Every reload → /admin/onboarding
- Was "fixed" in Cycle 12 (refetchQueries), but still broken with real company
- Fix: check onboarding completion logic — company.settings.onboardingCompleted
- Auto-fixable: YES (Logic, 1-2 files)

## P2 (Medium) — 3 bugs

### BUG-A003: No delete button for agents
- Agent detail panel has Save + Reset only, no delete/deactivate
- API DELETE works, just missing UI button
- Auto-fixable: YES (Logic, 1 file — agents.tsx)

### BUG-A004: Company list empty for superadmin
- tenantMiddleware returns [] when companyId='system' (non-UUID)
- companiesRoute GET /companies doesn't use tenantMiddleware but something else blocks
- Fix: companies list should bypass tenant check (it's a global admin view)
- Auto-fixable: MAYBE (needs investigation)

### BUG-B002: Workflows suggestions 500
- /api/workspace/workflows/suggestions → 500
- Auto-fixable: MAYBE (server-side)

## P3 (Low) — 1 bug

### BUG-A005: Super-admin POST blocked by tenant cross-contamination
- POST /api/super-admin/companies returns TENANT_003
- Hono route middleware cross-contamination suspected
- Auto-fixable: YES but touches middleware (Rule 11 borderline)
