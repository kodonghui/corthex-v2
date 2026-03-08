---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-04-validate-and-summarize']
lastStep: 'step-04-validate-and-summarize'
lastSaved: '2026-03-08'
---

# TEA Summary: Story 19-1 메신저 스키마 (conversations, messages)

## Risk Analysis

| Component | Risk Level | Testable? | Coverage |
|---|---|---|---|
| CreateConversationSchema (Zod) | P0 | Yes (pure) | 7 tests |
| MessageSchema (Zod) | P0 | Yes (pure) | 8 tests |
| ConversationService validation logic | P1 | Yes (pure logic) | 6 tests |
| Direct conversation dedup logic | P1 | Yes (pure logic) | 2 tests |
| Unread count logic | P1 | Yes (pure logic) | 3 tests |
| ConversationService CRUD (DB) | P2 | No (needs DB) | Service code review |
| Schema changes (companyId addition) | P2 | No (structural) | Migration SQL |

## Test Strategy

Story 19-1 adds DB schema improvements (companyId on conversation_participants/messages) and ConversationService CRUD. All pure logic (Zod validation, participant validation, dedup matching, unread count) is tested via unit tests. DB-dependent CRUD methods are not unit-testable without integration test infrastructure.

## Generated Tests

**File: `packages/server/src/__tests__/unit/conversation-service.test.ts`**
- 26 tests, 0 failures
- CreateConversationSchema: 7 tests (valid direct, valid group, invalid type, min participants, non-uuid, name max, name exact)
- MessageSchema: 8 tests (valid text, default type, system, ai_report, empty content, max content, invalid type, missing companyId)
- ConversationService logic: 11 tests (direct validation, group validation, dedup matching, group name handling, addParticipant validation, tenant isolation, unread count)

## Existing Coverage

- Conversation Zod schemas: `packages/server/src/__tests__/unit/conversation-service.test.ts` (26 tests)
- No previous tests existed for messenger functionality (Gemini had none)
