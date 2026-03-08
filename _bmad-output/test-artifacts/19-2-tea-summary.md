---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-04-validate-and-summarize']
lastStep: 'step-04-validate-and-summarize'
lastSaved: '2026-03-08'
---

# TEA Summary: Story 19-2 실시간 채팅 API + WebSocket 채널

## Risk Analysis

| Component | Risk Level | Testable? | Coverage |
|---|---|---|---|
| createConversationSchema (Zod) | P0 | Yes (pure) | 4 tests |
| sendMessageSchema (Zod) | P0 | Yes (pure) | 7 tests |
| addParticipantSchema (Zod) | P0 | Yes (pure) | 3 tests |
| Cursor pagination logic | P1 | Yes (pure logic) | 4 tests |
| Soft delete permission logic | P1 | Yes (pure logic) | 2 tests |
| WebSocket subscription key format | P1 | Yes (pure logic) | 3 tests |
| System message generation | P1 | Yes (pure logic) | 6 tests |
| REST endpoints (DB-dependent) | P2 | No (needs DB) | Code review |
| WebSocket channel handler (DB) | P2 | No (needs DB) | Code review |

## Test Strategy

Story 19-2 adds REST API routes (12 endpoints), WebSocket conversation channel, and system message logic. All pure logic (Zod validation, pagination cursor, soft delete permissions, channel key format, system message templates) is tested via unit tests. DB-dependent REST handlers and WebSocket channel subscriptions are not unit-testable without integration test infrastructure.

## Generated Tests

**File: `packages/server/src/__tests__/unit/conversation-api.test.ts`**
- 29 tests, 0 failures
- createConversationSchema: 4 tests (valid direct, group with name, < 2 participants, invalid type)
- sendMessageSchema: 7 tests (valid text, default type, system, ai_report, empty content, > 10000 chars, invalid type)
- addParticipantSchema: 3 tests (valid uuid, non-uuid, missing userId)
- Cursor pagination: 4 tests (filter before cursor, no cursor, hasMore detection, no hasMore)
- Soft delete: 2 tests (sender can delete, other user blocked)
- WebSocket channel: 3 tests (key format, non-participant blocked, participant allowed)
- System messages: 6 tests (join format, leave format, unknown user fallback, system type validation, auto-include self, no duplicate self)

## Existing Coverage

- Conversation Zod schemas + service logic: `conversation-service.test.ts` (26 tests from Story 19-1)
- Conversation API logic: `conversation-api.test.ts` (29 tests from Story 19-2)
- Total messenger coverage: 55 tests
