# Merged Bugs — Cycle 19

## Summary
- **ESC-002/003/004 + BUG-A003: ALL 4 FIXES VERIFIED PASS**
- New bugs: 4 minor (P2:1, P3:2, P4:1) — no P0/P1
- CRUD: Agent C/R/D ✅, Dept C/R/U/D ✅
- This is the first REAL clean CRUD cycle

## Fix Verification: ALL PASS
| Fix | Agent A (browser) | Agent C (code) | Agent D (code) |
|-----|-------------------|----------------|----------------|
| ESC-002 Agent FK | ✅ created OK | - | ✅ schema nullable |
| ESC-003 Onboarding | ✅ no loop | - | ✅ staleTime+isFetching |
| ESC-004 Tenant | ✅ pages load | ✅ bypass code | ✅ scoped path |
| BUG-A003 Delete | ✅ button works | - | ✅ testid exists |

## Minor Bugs (not blocking)
- OBS-A001 (P3): $0.00 / $NaN budget display
- OBS-A002 (P2): suggested_steps column missing (monitoring log)
- OBS-A003 (P4): costs date input "undefined" warning
- BUG-B001 (P3): workflows fetches /api/admin/integrations (404)
