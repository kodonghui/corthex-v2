---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests']
lastStep: 'step-03-generate-tests'
lastSaved: '2026-03-08'
story: '11-2-debate-deep-debate-command-integration'
---

# TEA Summary: Story 11-2 — /토론 + /심층토론 명령 통합

## Risk Matrix

| Risk | Severity | Area | Tests |
|------|----------|------|-------|
| R1 | HIGH | processDebateCommand full flow | 6 |
| R2 | HIGH | selectDebateParticipants boundary | 8 |
| R3 | MEDIUM | formatDebateReport edge cases | 8 |
| R4 | MEDIUM | Polling behavior | 2 |
| R5 | MEDIUM | DelegationTracker event sequence | 2 |
| R6 | LOW | SlashType → DebateType mapping | 6 |
| R7 | LOW | Metadata merging | 3 |
| - | LOW | DelegationTracker type validation | 3 |

## Coverage

- **Total TEA tests**: 38
- **All passing**: ✅
- **Test file**: `packages/server/src/__tests__/unit/debate-command-handler-tea.test.ts`

## Key Risk Mitigations

1. **R1**: Validates command status transitions (processing → completed/failed), error propagation from AGORA engine, non-Error thrown objects
2. **R2**: Boundary conditions at exactly 2/5 agents, tier priority ordering, worker exclusion, null roles
3. **R3**: Special characters (XSS), long topics (500+), empty arrays, multi-round deep-debate, newlines in content
4. **R4**: Failed debate status propagation, null debate (not found), timeout path
5. **R5**: Event ordering guarantee (startCommand before other events), no leak of debate events on error
6. **R6**: Sorted longest-first matching prevents /심층토론 ↔ /토론 prefix confusion
7. **R7**: Metadata merging preserves existing slashType/slashArgs/timeoutMs
