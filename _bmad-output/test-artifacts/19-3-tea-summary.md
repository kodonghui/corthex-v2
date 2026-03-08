---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-04-validate-and-summarize']
lastStep: 'step-04-validate-and-summarize'
lastSaved: '2026-03-08'
---

# TEA Summary: Story 19-3 1:1 + 그룹 메시지 UI

## Risk Analysis

| Component | Risk Level | Testable? | Coverage |
|---|---|---|---|
| getConversationDisplayName | P0 | Yes (pure) | 4 tests |
| getConversationAvatar | P1 | Yes (pure) | 2 tests |
| classifyMessage (mine/other/system) | P0 | Yes (pure) | 4 tests |
| shouldSendTypingEvent (debounce) | P1 | Yes (pure) | 3 tests |
| formatUnreadCount | P1 | Yes (pure) | 4 tests |
| formatTime | P1 | Yes (pure) | 2 tests |
| Conversation list sorting | P1 | Yes (pure) | 1 test |
| React Query / WebSocket integration | P2 | No (needs DOM) | Code review |
| New conversation modal flow | P2 | No (needs DOM) | Code review |
| Infinite scroll pagination | P2 | No (needs DOM) | Code review |

## Test Strategy

Story 19-3 adds conversation-based messenger UI components (4 new files, 1 modified). All pure presentation logic (display names, avatars, message classification, typing debounce, unread formatting, time formatting, sorting) is tested via unit tests. React component rendering, WebSocket integration, and DOM interactions are not unit-testable without a DOM testing environment.

## Generated Tests

**File: `packages/app/src/__tests__/conversation-ui.test.ts`**
- 20 tests, 0 failures
- Display name: 4 tests (group with name, group without, direct with name, direct without)
- Avatar: 2 tests (group emoji, direct emoji)
- Message classification: 4 tests (system, mine, other, ai_report)
- Typing debounce: 3 tests (enough time, too soon, exact boundary)
- Unread count: 4 tests (zero, normal, 99, over 99)
- formatTime: 2 tests (방금, N분 전)
- Sorting: 1 test (updatedAt desc)

## Existing Coverage

- Conversation service: conversation-service.test.ts (26 tests from Story 19-1)
- Conversation API: conversation-api.test.ts (29 tests from Story 19-2)
- Conversation UI: conversation-ui.test.ts (20 tests from Story 19-3)
- Total messenger coverage: 75 tests
