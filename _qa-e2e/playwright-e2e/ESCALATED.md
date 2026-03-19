# ESCALATED Bugs — Requires Manual Intervention

Auto-fix prohibited by safety rules or requires architectural changes.
When cycle count >= 3, user is notified in cycle-report.md.

## Active

### ESC-001: Mobile Sidebar Not Responsive
- **First reported**: Cycle 6 (re-confirmed Cycle 12 BUG-B001)
- **Cycles re-reported**: 6, 7, 8, 9, 12
- **Category**: CSS Architecture (needs responsive rework)
- **Severity**: P2
- **Suggested fix**: sidebar needs `lg:block hidden` + hamburger menu toggle on mobile
- **User notified**: NO → **THRESHOLD REACHED (5+ cycles)**

## Resolved

### ESC-002: Agent Create 500 FK — RESOLVED
- **Resolved**: 2026-03-19, commit 2106ec2
- **Fix**: agents.user_id DROP NOT NULL + migration 0060

### ESC-003: Onboarding Loop — RESOLVED
- **Resolved**: 2026-03-19, commit 2106ec2
- **Fix**: layout.tsx staleTime + isFetching guard

### ESC-004: Tenant Middleware Cross-Contamination — RESOLVED
- **Resolved**: 2026-03-19, commit 2106ec2
- **Fix**: tenant.ts companies POST bypass + onboarding.ts scoped path
