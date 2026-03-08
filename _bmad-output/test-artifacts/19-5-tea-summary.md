---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-04-validate-and-summarize']
lastStep: 'step-04-validate-and-summarize'
lastSaved: '2026-03-08'
---

# TEA Summary: Story 19-5 companyId 기반 채팅 격리

## Risk Analysis

| Component | Risk Level | Testable? | Coverage |
|---|---|---|---|
| verifyUsersInCompany (cross-tenant) | P0 | Yes (pure logic) | 6 tests |
| assertParticipant companyId check | P0 | Yes (pure logic) | 4 tests |
| companyId filter presence (static) | P1 | Yes (static check) | 3 tests |
| WebSocket subscription companyId | P1 | Yes (pure logic) | 1 test |

## Generated Tests

**File: `packages/server/src/__tests__/unit/chat-isolation.test.ts`**
- 14 tests, 0 failures
- Cross-tenant validation: 6 tests (same company, different company, non-existent, inactive, empty, single)
- assertParticipant: 4 tests (correct company, wrong company, non-participant, wrong both)
- Filter presence: 3 tests (with filter, without, all endpoints check)
- WebSocket: 1 test (subscription companyId validation)

## Total Messenger Coverage

- conversation-service.test.ts: 26 tests (Story 19-1)
- conversation-api.test.ts: 29 tests (Story 19-2)
- conversation-ui.test.ts: 20 tests (Story 19-3)
- share-report.test.ts: 13 tests (Story 19-4)
- chat-isolation.test.ts: 14 tests (Story 19-5)
- **Total: 102 tests**
