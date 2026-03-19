# Blockers — Cycle 13

## BLOCKER-D001: PostgreSQL Not Running (ECONNREFUSED 127.0.0.1:5432)
- **Reported by**: Agent D
- **Severity**: P0 (blocks all authenticated testing)
- **Impact**: Cannot login → cannot test sidebar navigation, theme, session persistence, or Cycle 12 sidebar fix
- **Evidence**: `/api/health` returns `{"checks":{"db":false}}`, login returns "connect ECONNREFUSED 127.0.0.1:5432"
- **Root cause**: PostgreSQL is not installed on this server. No `postgresql` dpkg packages found.
- **Screenshot**: `screenshots/D-01-login-db-error.png`
- **Resolution**: Install PostgreSQL or configure DATABASE_URL to point to Neon remote DB
