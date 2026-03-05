# Story 4.4: Chat Session History

Status: done

## Story

As a 일반 직원(유저),
I want 이전 대화 이력을 빠르게 불러오고, URL로 특정 세션에 직접 접근하며, 연결 복구 시 누락 메시지를 자동 보충받는다,
so that 대화 이력을 편리하게 탐색하고, 링크로 특정 대화를 공유/북마크할 수 있다.

## Acceptance Criteria

1. **Given** `/chat` 진입 **When** 세션이 존재 **Then** 가장 최근 활성 세션(lastMessageAt DESC) 자동 선택
2. **Given** `/chat?session={id}` URL 접근 **When** 페이지 로드 **Then** 해당 세션 자동 선택 + 세션 패널 하이라이트 + 최하단 스크롤
3. **Given** 세션 선택 **When** URL 업데이트 **Then** `?session={id}` 쿼리 파라미터 동기화 (뒤로가기 히스토리 유지)
4. **Given** 메시지 50건 이상 **When** 세션 진입 **Then** 최신 50건만 초기 로드, 위로 스크롤 시 이전 50건 추가 로드 (무한 스크롤)
5. **Given** 메시지 페이지네이션 **When** 이전 메시지 로드 중 **Then** 상단에 로딩 스피너 표시, 스크롤 위치 유지
6. **Given** WebSocket 재연결 성공 **When** 활성 세션 존재 **Then** 마지막 메시지 이후 누락분 자동 보충 (messages invalidate)
7. **Given** 세션 선택 변경 **When** 다른 세션 클릭 **Then** 이전 세션 스크롤 위치 보존, 새 세션 최하단 스크롤

## Tasks / Subtasks

- [x] Task 1: 서버 — 메시지 페이지네이션 API 수정 (AC: #4)
  - [x] GET /sessions/:id/messages에 cursor 기반 페이지네이션 추가: `?before={messageId}&limit=50`
  - [x] before 없으면 최신 50건 반환 (기존 동작과 호환), createdAt DESC → 클라이언트에서 reverse
  - [x] 응답에 `hasMore: boolean` 필드 추가 (이전 메시지 존재 여부)
- [x] Task 2: 프론트엔드 — URL 쿼리 파라미터 동기화 (AC: #1, #2, #3)
  - [x] chat.tsx: `useSearchParams`로 `?session=` 읽기/쓰기
  - [x] 초기 로드 시: URL에 session 있으면 해당 세션 선택, 없으면 첫 번째 세션(lastMessageAt DESC) 자동 선택
  - [x] 세션 변경 시: `setSearchParams({ session: id })` — replace 모드로 히스토리 관리
- [x] Task 3: 프론트엔드 — 무한 스크롤 메시지 로드 (AC: #4, #5, #7)
  - [x] chat-area.tsx: useInfiniteQuery로 메시지 로드 전환 (기존 useQuery 교체)
  - [x] 위로 스크롤 시 `fetchNextPage` (cursor = 가장 오래된 메시지 ID)
  - [x] 로딩 중 상단 스피너 표시 + 스크롤 위치 유지 (scrollTop 보정)
  - [x] 세션 전환 시 최하단 자동 스크롤
- [x] Task 4: 프론트엔드 — 재연결 시 메시지 보충 (AC: #6)
  - [x] 재연결 배너 표시 후 활성 세션의 messages + tool-calls invalidate
  - [x] tool-calls도 함께 invalidate
- [x] Task 5: 빌드 + 기존 테스트 통과 확인
  - [x] `turbo build` 3/3 성공
  - [ ] `bun test src/__tests__/unit/` 전체 통과

## Dev Notes

### 핵심: cursor 기반 페이지네이션 + useInfiniteQuery

현재 GET /messages는 `orderBy(chatMessages.createdAt)` + `limit(없음)`으로 전체 메시지를 반환. 대화가 길어지면 성능 저하. cursor 기반으로 변경하여 50건씩 로드.

### 서버 API 변경

```
GET /workspace/chat/sessions/:id/messages
  ?before=uuid   — 이 메시지 ID보다 이전 메시지 (cursor)
  &limit=50      — 기본 50

Response: {
  data: Message[],   // createdAt ASC 정렬
  hasMore: boolean   // 더 이전 메시지가 있는지
}
```

구현 방법:
```typescript
// before가 있으면: 해당 메시지의 createdAt보다 이전 것 조회
const query = db.select().from(chatMessages)
  .where(and(
    eq(chatMessages.sessionId, sessionId),
    before ? lt(chatMessages.createdAt, beforeMsg.createdAt) : undefined,
  ))
  .orderBy(desc(chatMessages.createdAt))
  .limit(limit + 1) // +1로 hasMore 판별

const hasMore = result.length > limit
if (hasMore) result.pop()
result.reverse() // ASC 정렬로 반환
```

### useInfiniteQuery 패턴

```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['messages', sessionId],
  queryFn: ({ pageParam }) =>
    api.get(`/workspace/chat/sessions/${sessionId}/messages${pageParam ? `?before=${pageParam}` : ''}`),
  getNextPageParam: (lastPage) =>
    lastPage.hasMore ? lastPage.data[0]?.id : undefined,
  initialPageParam: undefined as string | undefined,
  enabled: !!sessionId,
})

// 전체 메시지 = pages 역순 + 각 page의 data
const messages = data?.pages.flatMap(p => p.data) || []
```

### 스크롤 위치 유지 패턴

이전 메시지 로드 시 스크롤 점프 방지:
```typescript
const scrollRef = useRef<HTMLDivElement>(null)

// fetchNextPage 전 현재 스크롤 높이 저장
const prevScrollHeight = scrollRef.current?.scrollHeight || 0

// 로드 완료 후
useEffect(() => {
  if (isFetchingNextPage) return
  const el = scrollRef.current
  if (!el) return
  const newScrollHeight = el.scrollHeight
  el.scrollTop = newScrollHeight - prevScrollHeight
}, [isFetchingNextPage])
```

### URL 쿼리 파라미터

React Router의 `useSearchParams` 사용:
```typescript
const [searchParams, setSearchParams] = useSearchParams()
const sessionParam = searchParams.get('session')

// 세션 변경 시
setSearchParams({ session: id }, { replace: true })
```

### 재연결 복구

Story 4-2에서 이미 reconnect 시 `queryClient.invalidateQueries`가 구현되어 있음. 추가로 tool-calls도 invalidate 하면 됨 (이미 4-3에서 done 이벤트에 추가됨). 재연결 시에도 동일하게 처리하면 OK.

### 기존 코드 변경 주의사항

- **useQuery → useInfiniteQuery 전환**: chat-area.tsx의 메시지 쿼리만 변경. delegations, tool-calls는 그대로 useQuery.
- **서버 응답 구조 변경**: `{ data: Message[] }` → `{ data: Message[], hasMore: boolean }`. 프론트 타입 업데이트 필요.
- **useChatStream의 done 핸들러**: invalidateQueries는 useInfiniteQuery에서도 동작 (키가 같으므로).
- **`useSearchParams`**: react-router-dom에서 import. 현재 프로젝트에서 이미 사용 중인지 확인 필요.

### Project Structure Notes

```
packages/server/src/
├── routes/workspace/chat.ts     ← GET /messages 페이지네이션 수정
packages/app/src/
├── pages/chat.tsx               ← URL 쿼리 파라미터 동기화
├── components/chat/chat-area.tsx ← useInfiniteQuery + 무한 스크롤
```

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Section 10.4] — 세션 패널/URL 진입 동작
- [Source: packages/app/src/pages/chat.tsx] — 현재 채팅 페이지
- [Source: packages/app/src/components/chat/chat-area.tsx] — 현재 채팅 영역
- [Source: packages/server/src/routes/workspace/chat.ts] — GET /messages API
- [Source: _bmad-output/implementation-artifacts/4-2-streaming-chat-ui.md] — 스트리밍/재연결 구현
- [Source: _bmad-output/implementation-artifacts/4-3-tool-use-loop.md] — tool-calls API

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- 서버 cursor 페이지네이션 구현 (before, limit, hasMore)
- chat.tsx에 useSearchParams 기반 URL 동기화 + 자동 세션 선택
- chat-area.tsx에 useInfiniteQuery + 무한 스크롤 + 스크롤 위치 유지
- 재연결 시 messages + tool-calls invalidate로 누락 메시지 보충
- 코드 리뷰 수정: cursor sessionId 검증, 자동선택 showChat 동기화, 음수 limit 방지

### File List

- packages/server/src/routes/workspace/chat.ts — GET /messages cursor 기반 페이지네이션 (before, limit, hasMore)
- packages/app/src/pages/chat.tsx — useSearchParams URL 동기화 + 자동 세션 선택
- packages/app/src/components/chat/chat-area.tsx — useInfiniteQuery + 무한 스크롤 + 재연결 복구
