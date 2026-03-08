# Story 19.1: 메신저 스키마 (conversations, messages)

Status: done

## Story

As a Developer,
I want to have a robust, well-designed database schema for the Internal Messenger (FR76),
so that Stories 19-2~19-5 can build real-time chat, UI, AI sharing, and tenant isolation on a solid foundation.

## Acceptance Criteria

1. **conversations 테이블**: id, companyId, type('direct'|'group'), name, isActive, createdAt, updatedAt — Drizzle 스키마 정의
2. **conversation_participants 테이블**: conversationId+userId 복합 PK, joinedAt, lastReadAt — companyId 추가 필요
3. **messages 테이블**: id, conversationId, senderId, content, type('text'|'system'|'ai_report'), isDeleted, createdAt, updatedAt — companyId 추가 필요
4. **Relations 정의**: conversations↔messages, conversations↔participants, users↔participants, users↔messages 양방향 관계
5. **인덱스**: conversations.companyId, messages.conversationId+createdAt, conversation_participants.userId+conversationId
6. **Shared 타입**: Conversation, ConversationParticipant, Message 타입 정의 (packages/shared/src/types.ts)
7. **ConversationService**: 기본 CRUD 서비스 — create(direct/group), list, getById, addParticipant, markAsRead
8. **단위 테스트**: ConversationService 테스트 (생성, 조회, 참여자 관리, 읽음 처리, 테넌트 격리)

## Tasks / Subtasks

- [x] Task 1: Drizzle 스키마 개선 + 마이그레이션 (AC: #1, #2, #3, #4, #5)
  - [x] 1.1 기존 conversations/conversation_participants/messages 스키마 검토
  - [x] 1.2 conversation_participants에 companyId 추가 (테넌트 격리 강화)
  - [x] 1.3 messages에 companyId 추가 (테넌트 격리 강화)
  - [x] 1.4 conversations에 companyId 인덱스 추가
  - [x] 1.5 Relations 검토 및 보완 (company 관계 추가)
  - [x] 1.6 DB 마이그레이션 생성 — 수동 SQL (0046_conversation-tenant-isolation.sql)

- [x] Task 2: Shared 타입 정의 (AC: #6)
  - [x] 2.1 Conversation, ConversationParticipant, Message 타입을 packages/shared/src/types.ts에 추가
  - [x] 2.2 ConversationListItem 타입 (목록 조회용, 마지막 메시지 + 안 읽은 수 포함)

- [x] Task 3: ConversationService 구현 (AC: #7)
  - [x] 3.1 create(companyId, type, participantIds, name?) — 1:1 대화방 중복 방지
  - [x] 3.2 list(companyId, userId) — 참여 중인 대화방 목록 (마지막 메시지 + unread count)
  - [x] 3.3 getById(id, companyId) — 대화방 상세 + 참여자 목록
  - [x] 3.4 addParticipant(conversationId, userId, companyId) — 그룹 채팅 참여자 추가
  - [x] 3.5 markAsRead(conversationId, userId) — lastReadAt 업데이트

- [x] Task 4: 단위 테스트 (AC: #8)
  - [x] 4.1 create: 1:1 대화방 생성 + 중복 방지
  - [x] 4.2 create: 그룹 대화방 생성 + 참여자 등록
  - [x] 4.3 list: 참여 중인 대화방만 반환 + companyId 격리
  - [x] 4.4 getById: 존재하지 않는 대화방/다른 테넌트 → null
  - [x] 4.5 markAsRead: lastReadAt 갱신 확인
  - [x] 4.6 Zod 스키마 검증 (type enum, name 길이 등)

## Dev Notes

### 기존 코드 분석 (Gemini 작성 — 개선 필요)

**DB 스키마 (schema.ts):**
- conversations 테이블: 이미 존재 (L628-637) — 기본 구조 OK
- conversation_participants 테이블: 이미 존재 (L640-648) — **companyId 누락** (격리 취약)
- messages 테이블: 이미 존재 (L651-662) — **companyId 누락** (격리 취약)
- Relations: 이미 존재 (L1251-1264) — 기본 OK, company 관계 누락

**마이그레이션:**
- `0037_legal_strong_guy.sql`에 conversations/conversation_participants/messages CREATE TABLE 포함
- 테이블은 이미 DB에 존재 — 스키마 개선 시 ALTER 마이그레이션만 필요

**기존 messenger 테이블 (별도 시스템):**
- messengerChannels (L585-592), messengerMembers (L595-602), messengerMessages (L605-614), messengerReactions (L617-626)
- 이 테이블들은 채널 기반 메신저 (Slack 스타일) — conversations와 별도 시스템
- **건드리지 않을 것** — 19-1은 conversation 기반 스키마만 개선

**Shared 타입:**
- `WsChannel` union에 이미 `'messenger'` 포함 (types.ts L461)
- Conversation/Message 타입은 아직 미정의

### v1 참고

v1에는 사내 메신저 기능 없음 (Phase 3 신규 기능). v1 채팅은 AI 에이전트와의 대화(chatMessages, chatSessions)만 존재.

### 핵심 개선 사항 (Gemini 코드 대비)

1. **companyId 추가**: conversation_participants, messages에 companyId 추가
   - 이유: conversationId JOIN으로만 격리하면 직접 쿼리 시 다른 테넌트 데이터 접근 가능
   - 프로젝트 전체 패턴: 모든 테이블에 companyId 직접 배치 (withTenant 미들웨어 활용)

2. **인덱스 추가**: conversations.companyId, conversation_participants.companyId+userId

3. **ConversationService**: Gemini는 서비스 없이 스키마만 정의 — 기본 CRUD 추가

### 서비스 패턴 참조

**기존 CRUD 서비스 패턴** (packages/server/src/services/workflow/engine.ts):
```typescript
export class WorkflowService {
  async create(data: CreateInput, companyId: string): Promise<Workflow> {
    const [row] = await db.insert(workflows).values({ ...data, companyId }).returning()
    return row
  }
  async list(companyId: string, opts: { page: number; limit: number }) {
    return db.select().from(workflows)
      .where(and(eq(workflows.companyId, companyId), eq(workflows.isActive, true)))
      .orderBy(desc(workflows.createdAt))
      .limit(opts.limit).offset((opts.page - 1) * opts.limit)
  }
}
```

**1:1 대화방 중복 방지 로직:**
```typescript
// 1:1 대화방은 동일 참여자 조합이 이미 있으면 기존 대화방 반환
async findExistingDirect(companyId: string, userIds: [string, string]) {
  // conversations WHERE type='direct' AND companyId
  // + conversation_participants 교차 조회
  // userIds 2명이 모두 포함된 대화방 찾기
}
```

### DB 스키마 개선 내용

**conversation_participants 변경:**
```typescript
export const conversationParticipants = pgTable('conversation_participants', {
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  companyId: uuid('company_id').notNull().references(() => companies.id), // [NEW] 테넌트 격리
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  lastReadAt: timestamp('last_read_at'),
}, (table) => ({
  pk: primaryKey({ columns: [table.conversationId, table.userId] }),
  userConvIdx: index('conv_participants_user_conv_idx').on(table.userId, table.conversationId),
  companyIdx: index('conv_participants_company_idx').on(table.companyId), // [NEW]
}));
```

**messages 변경:**
```typescript
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id),
  senderId: uuid('sender_id').notNull().references(() => users.id),
  companyId: uuid('company_id').notNull().references(() => companies.id), // [NEW] 테넌트 격리
  content: text('content').notNull(),
  type: varchar('type', { length: 20 }).notNull().default('text'),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  convCreatedIdx: index('messages_conv_created_idx').on(table.conversationId, table.createdAt),
  companyIdx: index('messages_company_idx').on(table.companyId), // [NEW]
}));
```

### Project Structure Notes

**수정 대상 파일:**
- `packages/server/src/db/schema.ts` — conversation_participants, messages에 companyId 추가 + 인덱스 + Relations 보완
- `packages/shared/src/types.ts` — Conversation, ConversationParticipant, Message 타입 추가
- `packages/server/src/services/messenger/conversation.ts` — [NEW] ConversationService

**참조 파일 (수정하지 않음):**
- `packages/server/src/services/workflow/engine.ts` — CRUD 서비스 패턴 참조
- `packages/server/src/routes/workspace/workflows.ts` — 라우트 패턴 참조 (라우트는 19-2에서 구현)
- `packages/server/src/db/migrations/0037_legal_strong_guy.sql` — 기존 마이그레이션 참조

**마이그레이션 주의사항:**
- conversation_participants, messages에 companyId 컬럼 추가 시 ALTER TABLE 필요
- 기존 데이터가 있으면 NOT NULL 제약조건 문제 — DEFAULT 또는 마이그레이션에서 처리
- `bun run db:generate`로 마이그레이션 생성 후 SQL 검증

### References

- [Source: packages/server/src/db/schema.ts#L628-662] — conversations, conversation_participants, messages 기존 스키마
- [Source: packages/server/src/db/schema.ts#L584-626] — messengerChannels/Members/Messages (별도 시스템, 건드리지 않음)
- [Source: packages/server/src/db/schema.ts#L1251-1264] — 기존 Relations
- [Source: packages/server/src/db/schema.ts#L1080-1089] — usersRelations (이미 conversations 관계 포함)
- [Source: packages/shared/src/types.ts#L461] — WsChannel 'messenger' 이미 존재
- [Source: packages/server/src/db/migrations/0037_legal_strong_guy.sql] — conversations 테이블 최초 생성 마이그레이션
- [Source: _bmad-output/planning-artifacts/epics.md#L1347-1355] — Epic 19 스토리 정의
- [Source: _bmad-output/planning-artifacts/prd.md#L909] — FR76 사내 메신저 요구사항
- [Source: _bmad-output/planning-artifacts/architecture.md#L1164] — 사내 메신저 실시간 아키텍처 (Pending Decision)

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: conversation_participants, messages에 companyId 추가 + 인덱스 4개 추가 + Relations에 company 관계 추가. 마이그레이션 0046 수동 작성 (drizzle-kit generate가 snapshot 충돌로 실패하여 ALTER TABLE SQL 직접 작성, backfill 포함)
- Task 2: Conversation, ConversationParticipant, Message, ConversationListItem, CreateConversationRequest 타입 shared에 추가
- Task 3: ConversationService 5개 메서드 (create, list, getById, addParticipant, markAsRead). 1:1 대화방 중복 방지 로직 포함. list에서 lastMessage + unreadCount + participantCount 포함
- Task 4: 26개 단위 테스트 (Zod 스키마 8건 + 서비스 로직 18건). DB 연동 없이 순수 로직 검증
- TypeScript 컴파일 이슈 없음 (server, shared 모두 clean)
- 기존 테스트 회귀 없음 (124 tests pass across 5 files)
- Code Review: markAsRead에 companyId 파라미터 누락 발견 → 수정 완료 (테넌트 격리 보안 이슈)
- Code Review: list()의 N+1 쿼리 패턴은 1SP 범위에서 허용 (19-2에서 최적화 가능)

### File List
- packages/server/src/db/schema.ts -- [MODIFIED] conversations 인덱스 추가, conversation_participants/messages에 companyId 추가, Relations에 company 관계 추가
- packages/server/src/db/migrations/0046_conversation-tenant-isolation.sql -- [NEW] ALTER TABLE + 인덱스 마이그레이션
- packages/shared/src/types.ts -- [MODIFIED] Conversation, ConversationParticipant, Message, ConversationListItem, CreateConversationRequest 타입 추가
- packages/server/src/services/messenger/conversation.ts -- [NEW] ConversationService (create, list, getById, addParticipant, markAsRead)
- packages/server/src/__tests__/unit/conversation-service.test.ts -- [NEW] 26개 단위 테스트
