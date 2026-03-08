# Story 19-1: Messenger Schema (Conversations, Messages)

## 1. Story Foundation
**Epic:** Epic 19 (Internal Messenger)
**Story ID:** 19-1
**Title:** 메신저 스키마 (conversations, messages)
**Status:** ready-for-dev

### User Story
As a Developer, I want to create the foundational database schema for the Internal Messenger (FR76) so that Human employees can eventually use real-time 1:1 and group chat with strict tenant isolation.

### Acceptance Criteria
- [ ] `conversations` 테이블 정의 (`id`, `company_id`, `type`, `name`, `is_active`, `createdAt`, `updatedAt`).
- [ ] `conversation_participants` 연결 테이블 정의 (`conversation_id`, `user_id`, `joined_at`, `last_read_at`).
- [ ] `messages` 테이블 정의 (`id`, `conversation_id`, `sender_id`, `content`, `type`, `is_deleted`, `createdAt`, `updatedAt`).
- [ ] 모든 테이블 간의 Foreign Key 관계(Relations) 명확하게 정의.
- [ ] `company_id` 기반 테넌트 격리를 위한 참조키 및 인덱스 설정.
- [ ] Drizzle Kit 마이그레이션 파일(`db:generate`) 생성 확인.

### Business Context
이 스토리는 Phase 3 확장의 핵심인 "사내 메신저" 기능의 데이터 기반을 마련합니다 (FR76). 올바른 스키마 설계와 테넌트 격리(`company_id`)가 되어 있어야 이후 WebSocket 기반 실시간 채팅(19-2) 및 UI(19-3) 구현이 가능합니다. 성능과 확장성을 고려하여 인덱스와 관계를 정확히 수립해야 합니다.

## 2. Developer Context & Guardrails

### Technical Requirements
- 데이터베이스 도구: **Drizzle ORM** (`packages/server/src/db/schema.ts`)
- 백엔드 환경: TypeScript, Neon Serverless PostgreSQL
- 작성 위치: 기존 `schema.ts` 파일의 하단 혹은 적절한 영역에 추가하되, 다른 기존 테이블 코드(e.g., users, companies)를 덮어쓰거나 훼손해서는 절대 안 됩니다.
- Naming Convention (강제):
  - 테이블명: **snake_case 복수형** (`conversations`, `conversation_participants`, `messages`)
  - 인덱스/FK명: 충돌을 피하기 위해 명확한 접두사 사용.

### Database Schema (Target Options)

**1. `conversations`**
```typescript
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  type: varchar('type', { length: 20 }).notNull(), // 'direct' | 'group'
  name: varchar('name', { length: 255 }), // 그룹 채팅방 이름
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

**2. `conversation_participants`**
```typescript
export const conversationParticipants = pgTable('conversation_participants', {
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  lastReadAt: timestamp('last_read_at'),
}, (table) => ({
  pk: primaryKey({ columns: [table.conversationId, table.userId] }),
}));
```

**3. `messages`**
```typescript
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id),
  senderId: uuid('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  type: varchar('type', { length: 20 }).notNull().default('text'), // 'text' | 'system' | 'ai_report'
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### Architecture Compliance
- **Tenant Isolation:** `conversations` 테이블에 직접 `company_id`를 배치하여 쿼리 시 `withTenant` 헬퍼나 미들웨어가 적용될 수 있도록 보장해야 합니다. `messages`는 `conversation`을 통해 격리가 보장되더라도 인덱스나 추가 검증을 고려해야 할 수 있습니다(우선 `conversationId` 조인 기반 검증 권장).
- **Relations:** Drizzle ORM의 `relations` API를 사용하여 릴레이션을 선언해 주세요.
  - `conversations`는 여러 `messages`와 여러 `conversationParticipants`를 갖습니다.
  - `users` 테이블 관계 확장: 사용자는 자신이 참여한 방과 작성한 메시지를 조회할 수 있습니다. 이미 정의된 `usersRelations`가 있다면, 거기에 채팅방 관계를 추가하는 것을 잊지 마세요.

### Testing Requirements (Negative Paths)
단순 스키마 확장이지만, 이후 API 개발을 위해 다음 조건들에 대한 로직을 설계하며 스키마를 짭니다.
1. `conversation_participants`의 PK가 (conversationId, userId) 묶음으로 유일성을 보장하는가? (중복 참여 방지)
2. Soft Delete: `messages.isDeleted` 및 `conversations.isActive` 플래그를 통한 비파괴적 삭제 접근 보장.
3. 인덱싱: 자주 조회되는 쿼리(예: 특정 유저의 활성 대화방 목록 조회, 특정 대화방의 최근 메시지 타임라인 조회)를 위한 복합 인덱스 고려 (`createdAt` 역순 등).

## 3. Latest Tech & Security
- UUIDv4 기반 식별자로 채팅방 URL이나 API 노출 시 ID 추측을 불가능하게 합니다.
- 스키마 정의 후 반드시 `bun run db:generate` 명령어를 실행하여 SQL 마이그레이션 파일이 문법상 올바른지 확인해야 합니다.
