# Story 19.5: companyId 기반 채팅 격리

Status: done

## Story

As a System Administrator,
I want all messenger conversations strictly isolated by companyId,
so that users from different companies can never see or participate in each other's conversations.

## Acceptance Criteria

1. **참여자 추가 시 회사 검증**: 대화방 생성/참여자 추가 시 participantIds의 모든 userId가 해당 companyId 소속인지 검증
2. **unread 쿼리 companyId 필터**: unread count 조회 시 messages.companyId 필터 추가 (방어적 격리)
3. **cross-tenant 방지 테스트**: 다른 companyId의 userId로 대화방 생성/참여자 추가 시 에러 반환 확인
4. **기존 격리 검증**: assertParticipant, WebSocket subscription, ConversationService의 기존 companyId 필터 정상 동작 확인

## Tasks / Subtasks

- [x] Task 1: 참여자 회사 소속 검증 (AC: #1)
  - [x] 1.1 ConversationService.create에서 participantIds → users 테이블 조회 → companyId 일치 검증
  - [x] 1.2 ConversationService.addParticipant에서 userId → users 테이블 조회 → companyId 일치 검증
  - [x] 1.3 conversations.ts POST /conversations/:id/participants에서도 userId 회사 소속 사전 검증

- [x] Task 2: unread 쿼리 방어적 companyId 필터 추가 (AC: #2)
  - [x] 2.1 GET /conversations/unread의 messages 쿼리에 eq(messages.companyId, tenant.companyId) 추가

- [x] Task 3: 격리 검증 단위 테스트 (AC: #3, #4)
  - [x] 3.1 cross-tenant participant 추가 차단 로직 테스트
  - [x] 3.2 companyId 필터 존재 여부 정적 검증 테스트
  - [x] 3.3 기존 assertParticipant companyId 검증 로직 테스트

## Dev Notes

### 기존 격리 상태 분석

**이미 격리된 부분:**
- assertParticipant: companyId 필터 ✅
- ConversationService.list: companyId 필터 ✅
- ConversationService.getById: companyId 필터 ✅
- ConversationService.markAsRead: companyId 필터 ✅
- messages 조회 (GET /:id/messages): companyId 필터 ✅
- messages 삭제: companyId 필터 ✅
- WebSocket subscription: companyId 검증 ✅
- 참여자 삭제: companyId 필터 ✅

**격리 필요한 부분:**
- ConversationService.create: participantIds 회사 소속 미검증 ❌
- ConversationService.addParticipant: userId 회사 소속 미검증 ❌
- GET /conversations/unread: messages 쿼리에 companyId 미포함 ❌ (방어적)

### References

- [Source: packages/server/src/services/messenger/conversation.ts] — ConversationService
- [Source: packages/server/src/routes/workspace/conversations.ts] — REST API
- [Source: packages/server/src/ws/channels.ts] — WebSocket channel

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: ConversationService에 verifyUsersInCompany() 메서드 추가 — create/addParticipant에서 참여자 회사 소속 검증
- Task 2: GET /conversations/unread의 messages 쿼리에 eq(messages.companyId, tenant.companyId) 방어적 필터 추가
- Task 3: 14개 단위 테스트 — cross-tenant 차단 6개 + assertParticipant 4개 + companyId 필터 존재 3개 + WebSocket 1개
- 보안 이슈 3건 해결: (1) create에서 타사 userId 추가 가능 (2) addParticipant에서 타사 userId 추가 가능 (3) unread 쿼리 companyId 미포함
- TypeScript 빌드 정상 (server, app 모두 clean)
- 102 tests pass across 5 messenger test files

### File List
- packages/server/src/services/messenger/conversation.ts -- [MODIFIED] verifyUsersInCompany + users import + create/addParticipant 검증
- packages/server/src/routes/workspace/conversations.ts -- [MODIFIED] unread 쿼리에 companyId 필터 추가
- packages/server/src/__tests__/unit/chat-isolation.test.ts -- [NEW] 14개 격리 테스트
