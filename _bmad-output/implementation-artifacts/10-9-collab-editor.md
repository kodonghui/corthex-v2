# Story 10.9: 전략 메모 협업 편집기 — 실시간 공유 + WebSocket 동기화

Status: done

## Story

As a 일반 직원(유저),
I want 전략실 메모를 팀원과 공유하고 실시간으로 편집 내용이 동기화된다,
so that 같은 종목에 대해 팀원과 분석 메모를 효율적으로 공유할 수 있다.

## Acceptance Criteria

1. **Given** 내 메모 목록 **When** "공유" 버튼 클릭 **Then** 같은 회사 사용자 목록에서 공유 대상 선택 가능, 공유 완료 시 toast 표시
2. **Given** 공유된 메모 **When** 전략실 접속 **Then** 내 메모와 공유받은 메모 모두 목록에 표시 (작성자 구분)
3. **Given** 공유된 메모 **When** 작성자/공유 대상 모두 편집 가능 **Then** PATCH API로 수정, 성공 시 WebSocket으로 다른 참여자에게 실시간 알림
4. **Given** 메모 편집 완료 **When** 다른 참여자가 해당 메모를 열고 있음 **Then** WebSocket `strategy-notes` 채널을 통해 갱신 이벤트 수신 → React Query 무효화로 최신 내용 반영
5. **Given** 공유 메모 **When** 작성자가 공유 해제 **Then** 대상 사용자의 목록에서 제거, WebSocket 알림
6. **Given** 공유 메모 **When** 작성자가 삭제 **Then** 모든 공유 대상에서도 제거
7. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: DB 스키마 — note_shares 테이블 (AC: #1, #2)
  - [x] `packages/server/src/db/schema.ts`에 `strategyNoteShares` 테이블 추가
    - `id` (uuid PK), `noteId` (FK → strategyNotes.id, onDelete: cascade), `sharedWithUserId` (FK → users.id), `companyId` (FK → companies.id), `createdAt`
    - unique 제약: (noteId, sharedWithUserId)
    - index: (companyId, sharedWithUserId)
  - [x] `npx drizzle-kit generate` → 마이그레이션 0015_boring_nightshade.sql 생성
  - [x] 저널 태그와 파일명 일치 확인

- [x] Task 2: 공유 API 엔드포인트 (AC: #1, #5)
  - [x] `packages/server/src/routes/workspace/strategy.ts`에 추가
    - `POST /notes/:id/share` — body: `{ userIds: string[] }` → 복수 사용자 공유
    - `DELETE /notes/:id/share/:userId` — 특정 사용자 공유 해제
    - `GET /notes/:id/shares` — 공유 대상 목록 조회
  - [x] 권한: 메모 작성자(owner)만 공유/해제 가능
  - [x] Zod 검증, 에러코드 STRATEGY_050~052

- [x] Task 3: 메모 목록 API 확장 (AC: #2)
  - [x] `GET /notes` 수정: 내 메모 + 공유받은 메모 합쳐서 반환
    - 공유 메모에는 `owner: { id, name }` 필드 추가
    - 정렬: updatedAt DESC (혼합)

- [x] Task 4: WebSocket 채널 — strategy-notes (AC: #3, #4, #5)
  - [x] `packages/shared/src/types.ts` — `WsChannel`에 `'strategy-notes'` 추가
  - [x] `packages/server/src/ws/channels.ts` — `strategy-notes` case 추가
    - `params.id` = noteId
    - 권한: 메모 작성자 또는 공유 대상만 구독 가능
  - [x] 메모 PATCH/DELETE 시 `broadcastToChannel('strategy-notes::${noteId}', { type, noteId })` 호출
  - [x] 공유 추가/해제 시 대상 사용자에게 알림 브로드캐스트

- [x] Task 5: NotesPanel UI 확장 (AC: #1, #2, #3, #4, #5, #6)
  - [x] `packages/app/src/components/strategy/notes-panel.tsx` 수정
    - 메모별 "공유" 버튼 추가 (작성자에게만 표시)
    - 공유받은 메모에 작성자 이름 표시 (`shared by: 홍길동`)
    - 공유 사용자 선택 다이얼로그 (회사 사용자 목록 API 활용)
    - WebSocket 구독: 열고 있는 메모의 `strategy-notes::${noteId}` 채널 → 업데이트 수신 시 query invalidate

- [x] Task 6: 빌드 확인 (AC: #7)
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### 핵심 설계: REST + WebSocket 하이브리드

- **쓰기**: 기존 REST API (POST/PATCH/DELETE) 유지
- **읽기**: React Query + WebSocket 이벤트 기반 invalidation
- **실시간 동기화**: 메모 편집 완료 시 WebSocket으로 알림 → 다른 참여자의 React Query 자동 갱신
- **충돌 방지**: 이 스토리에서는 last-write-wins (복잡한 CRDT/OT 미구현)

### DB 테이블 설계

```sql
CREATE TABLE "strategy_note_shares" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "note_id" uuid NOT NULL REFERENCES "strategy_notes"("id") ON DELETE CASCADE,
  "shared_with_user_id" uuid NOT NULL REFERENCES "users"("id"),
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "strategy_note_shares_unique" UNIQUE("note_id", "shared_with_user_id")
);
CREATE INDEX idx_note_shares_user ON strategy_note_shares(company_id, shared_with_user_id);
```

Drizzle 스키마:
```typescript
export const strategyNoteShares = pgTable('strategy_note_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  noteId: uuid('note_id').notNull().references(() => strategyNotes.id, { onDelete: 'cascade' }),
  sharedWithUserId: uuid('shared_with_user_id').notNull().references(() => users.id),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uniqueShare: unique('strategy_note_shares_unique').on(table.noteId, table.sharedWithUserId),
  userIdx: index('strategy_note_shares_user_idx').on(table.companyId, table.sharedWithUserId),
}))
```

Relations:
```typescript
export const strategyNoteSharesRelations = relations(strategyNoteShares, ({ one }) => ({
  note: one(strategyNotes, { fields: [strategyNoteShares.noteId], references: [strategyNotes.id] }),
  sharedWithUser: one(users, { fields: [strategyNoteShares.sharedWithUserId], references: [users.id] }),
}))
```

### API 엔드포인트

```typescript
// POST /api/workspace/strategy/notes/:id/share
// Body: { userIds: string[] }
// → 메모 작성자만 가능, 자기 자신 공유 불가
// → 이미 공유된 사용자는 무시 (upsert 패턴)
// 에러: STRATEGY_050 (not owner), STRATEGY_051 (not found)

// DELETE /api/workspace/strategy/notes/:id/share/:userId
// → 메모 작성자만 가능
// → 204 No Content
// 에러: STRATEGY_052 (not found)

// GET /api/workspace/strategy/notes/:id/shares
// → 공유 대상 목록 반환 [{ userId, userName }]
```

### 메모 목록 확장 (GET /notes)

```typescript
// 기존: WHERE companyId = ? AND userId = ? AND stockCode = ?
// 확장:
//   내 메모: (userId = ?)
//   + 공유받은 메모: (noteId IN (SELECT noteId FROM strategy_note_shares WHERE sharedWithUserId = ?))
// 공유 메모에는 owner 정보 추가:
//   { ...note, owner: { id: userId, name: userName } }
```

### WebSocket 채널: strategy-notes

```typescript
// channels.ts에 case 추가
case 'strategy-notes': {
  if (!id) { /* MISSING_PARAM */ return }
  // DB에서 메모 소유자 또는 공유 대상인지 확인
  const [note] = await db.select({ userId: strategyNotes.userId })
    .from(strategyNotes)
    .where(and(eq(strategyNotes.id, id), eq(strategyNotes.companyId, client.companyId)))
    .limit(1)
  if (!note) { /* FORBIDDEN */ return }

  const isOwner = note.userId === client.userId
  const [share] = isOwner ? [true] : await db.select()
    .from(strategyNoteShares)
    .where(and(eq(strategyNoteShares.noteId, id), eq(strategyNoteShares.sharedWithUserId, client.userId)))
    .limit(1)
  if (!isOwner && !share) { /* FORBIDDEN */ return }

  client.subscriptions.add(`strategy-notes::${id}`)
  break
}
```

### 메모 수정/삭제 시 브로드캐스트

```typescript
// strategy.ts — PATCH /notes/:id 성공 후
broadcastToChannel(`strategy-notes::${noteId}`, { type: 'note-updated', noteId })

// strategy.ts — DELETE /notes/:id 성공 후
broadcastToChannel(`strategy-notes::${noteId}`, { type: 'note-deleted', noteId })

// strategy.ts — POST /notes/:id/share 성공 후
// 새로 공유받은 사용자에게 notifications 채널로 알림
for (const userId of userIds) {
  broadcastToChannel(`notifications::${userId}`, { type: 'note-shared', noteId })
}
```

### NotesPanel WebSocket 연동

```typescript
// notes-panel.tsx에서 WebSocket 구독
import { useWs } from '../../lib/ws'

// 현재 보고 있는 메모에 대해 WebSocket 구독
const { subscribe, unsubscribe } = useWs()

useEffect(() => {
  // 전체 노트 목록의 id들에 대해 구독
  const noteIds = notes.map(n => n.id)
  noteIds.forEach(id => subscribe('strategy-notes', { id }))
  return () => noteIds.forEach(id => unsubscribe('strategy-notes', { id }))
}, [notes.map(n => n.id).join(',')])

// WebSocket 메시지 수신 시 React Query invalidate
useWsMessage('strategy-notes', (data) => {
  if (data.type === 'note-updated' || data.type === 'note-deleted') {
    queryClient.invalidateQueries({ queryKey: ['strategy-notes', stockCode] })
  }
})
```

### 공유 사용자 선택 UI

```typescript
// 회사 사용자 목록: GET /workspace/users (이미 2-2에서 구현됨)
// CompactUserSelector 또는 간단한 체크박스 리스트:
// - 회사 소속 사용자 목록 표시
// - 이미 공유된 사용자는 체크된 상태
// - 체크/해제로 공유 추가/해제
// - ConfirmDialog 대신 간단한 Dialog 패턴 사용
```

### 기존 WebSocket 훅 확인

```
packages/app/src/lib/ws.ts — useWs() 훅
- subscribe(channel, params) / unsubscribe(channel, params)
- useWsMessage(channel, callback) — 메시지 수신 핸들러
```

### UI 패턴 준수

- `Button`: `size="sm" variant="ghost"` (공유/해제 버튼)
- `toast`: `@corthex/ui`에서 import
- `ConfirmDialog`: `isOpen`/`onConfirm`/`onCancel`/`variant="danger"` (공유 해제)
- 모바일: `fixed inset-0 sm:static` 패턴 (기존 편집 모달과 동일)

### 이전 스토리 학습사항

- **10-1**: UUID params에 zValidator 필수, 중첩 button 금지
- **10-3**: 종목코드 정규식 (`/^[A-Za-z0-9]{1,20}$/`)
- **10-4**: toast는 `@corthex/ui`에서 import, 마이그레이션 저널 태그 일치 필수
- **10-5**: CSV injection 방지 `csvSafe()`
- **10-6**: URL 기반 상태 — 빈 상태 처리 주의
- **10-7**: ConfirmDialog API, 미사용 import 금지, 입력 범위 검증
- **10-8**: 공유 URL bt/sp/lp 잔류 버그 → 상태 정리 중요, useRef autoRun 패턴

### 이 스토리에서 하지 않는 것

- CRDT/OT 기반 동시 편집 (last-write-wins만)
- 커서 위치 실시간 공유
- 편집 히스토리/버전 관리
- 메모 공유 권한 레벨 (읽기/쓰기 구분) — 모두 읽기/쓰기

### 파일 구조

```
수정 파일:
  packages/shared/src/types.ts (WsChannel에 'strategy-notes' 추가)
  packages/server/src/db/schema.ts (strategyNoteShares 테이블 + relations)
  packages/server/src/ws/channels.ts (strategy-notes 채널 구독 핸들러)
  packages/server/src/routes/workspace/strategy.ts (공유 CRUD + 목록 확장 + 브로드캐스트)
  packages/app/src/components/strategy/notes-panel.tsx (공유 UI + WebSocket 연동)
신규 파일:
  packages/server/src/db/migrations/0015_*.sql (마이그레이션)
```

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- DB: strategy_note_shares 테이블 + 마이그레이션 0015_boring_nightshade.sql (cascade delete, unique 제약)
- API: POST/DELETE /notes/:id/share, GET /notes/:id/shares (작성자 권한 검증, Zod, STRATEGY_050~052)
- API: GET /notes 확장 — 내 메모 + 공유받은 메모 합산, owner 정보 포함
- API: PATCH /notes/:id 확장 — 공유 대상도 편집 가능 + WebSocket 브로드캐스트
- WebSocket: 'strategy-notes' 채널 추가 (shared types + channels.ts 권한 검증)
- WebSocket: 메모 PATCH/DELETE 시 broadcastToChannel, 공유 시 notifications 채널 알림
- UI: NotesPanel — 공유 버튼 + 대상 체크박스 + 작성자 표시 + WebSocket 구독/리스너
- 빌드 3/3 성공

### File List
- packages/server/src/db/schema.ts (strategyNoteShares 테이블 + relations)
- packages/server/src/db/migrations/0015_boring_nightshade.sql (신규 마이그레이션)
- packages/server/src/routes/workspace/strategy.ts (공유 CRUD + notes 확장 + broadcast)
- packages/server/src/ws/channels.ts (strategy-notes 채널 핸들러)
- packages/shared/src/types.ts (WsChannel에 'strategy-notes' 추가)
- packages/app/src/components/strategy/notes-panel.tsx (공유 UI + WebSocket 연동)
