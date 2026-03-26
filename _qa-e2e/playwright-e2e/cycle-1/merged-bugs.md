# Cycle 1 — Merged Bug Report

## Summary: 5 bugs found (0 Critical, 2 Major, 2 Minor, 1 Transient)

### Confirmed Bugs

| Bug ID | Severity | Page | Description | Action |
|--------|----------|------|-------------|--------|
| BUG-B001 | Transient | admin/dashboard | 404 on Agent B's test — Agent D confirmed page loads fine | SKIP (transient) |
| BUG-B002 | Transient | admin/monitoring | Empty skeleton cards — Agent D confirmed data loads fine | SKIP (transient) |
| BUG-B003 | Minor | admin/dashboard (mobile) | White Vite message at 390px — possible dev server artifact | INVESTIGATE |
| BUG-C001 | Minor | app (any invalid route) | No 404 page — blank page on invalid routes | FIX |
| BUG-C002 | Minor | admin/login | No error message shown on wrong password | FIX |

### Decision
- BUG-B001, B002: Transient (Agent D contradicts). Skip.
- BUG-B003: Likely Vite dev server message, not production issue. Skip for now.
- BUG-C001: App missing 404 route. Fix.
- BUG-C002: Admin login error UX. Fix.

### Fixable this cycle: 2 (C001, C002)
