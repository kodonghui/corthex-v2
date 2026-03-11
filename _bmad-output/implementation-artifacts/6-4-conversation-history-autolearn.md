# Story 6.4: 대화 기록 + autoLearn

Status: done

## Story

As a CEO,
I want 이전 대화 기록이 보존되고 에이전트가 자동 학습하는 것을,
so that 같은 질문을 반복하지 않아도 된다.

## Acceptance Criteria

1. **대화 기록 무제한 보관** — `chat_messages` 테이블에 이미 저장 중 (Story 6.1에서 구현). 삭제 정책 없이 무제한 보관 확인.

2. **이전 대화 로드 + 스크롤 페이지네이션** — Hub 채팅 UI에서:
   - 초기 로드: 최근 메시지 50건 표시 (기존 API `GET /api/workspace/chat/sessions/:sessionId/messages` 활용)
   - 위로 스크롤 시 `before` cursor 기반 페이지네이션으로 이전 메시지 로드
   - 로딩 인디케이터 표시 (상단 스피너)
   - `hasMore: false`이면 "대화 시작" 표시

3. **세션 목록 사이드바** — Hub 좌측에 이전 대화 세션 목록 표시:
   - 세션 제목, 마지막 메시지 시간
   - 세션 클릭 → 해당 대화 내용 로드
   - 새 대화 시작 버튼
   - 세션 삭제 (스와이프 또는 우클릭 메뉴)

4. **autoLearn: 작업 완료 후 핵심 학습 포인트 자동 추출** (v1 spec #20):
   - Hub 채팅에서 에이전트 응답 완료(`done` 이벤트) 후 자동 학습 트리거
   - `extractAndSaveMemories()` 호출 (이미 `agent-runner.ts`, `chief-of-staff.ts`에서 사용 중)
   - Hub 채팅 라우트(`chat.ts`)의 `streamTask` 완료 시에도 autoLearn 호출 추가
   - 에이전트의 `autoLearn: false`이면 스킵

5. **학습 포인트 → Soul 자동 주입** — 이미 구현됨:
   - `knowledge-injector.ts`의 `collectAgentMemoryContext()`가 `agent_memories` 테이블에서 활성 기억을 수집
   - `soul-renderer.ts`가 `{{memories}}` 변수로 Soul에 주입
   - 이 스토리에서는 **Hub 채팅 경로에서도 autoLearn이 동작하는지 확인**만 하면 됨

6. **학습 상태 UI 피드백** — `done` 이벤트에 학습 결과 포함:
   - "2개 학습 포인트 추출됨" 같은 피드백을 `done` SSE 이벤트에 포함
   - Hub UI에서 학습 완료 시 작은 배지/텍스트 표시

## Tasks / Subtasks

- [x] Task 1: Hub 채팅 대화 기록 페이지네이션 구현 (AC: #2)
  - [x] 1.1: `secretary-hub-layout.tsx`에 `useInfiniteQuery` 기반 메시지 페이지네이션 구현 (이미 Story 6.1에서 구현됨 — 확인 완료)
  - [x] 1.2: `IntersectionObserver`로 상단 스크롤 감지 → `fetchNextPage` 호출 (이미 `handleScroll` 콜백으로 구현됨)
  - [x] 1.3: 로딩 스피너 (상단), "대화 시작" 마커 (hasMore=false 시) — "대화 시작" 마커 신규 추가
  - [x] 1.4: 새 메시지 수신 시 자동 하단 스크롤 유지 (이미 구현됨)

- [x] Task 2: 세션 목록 사이드바 (AC: #3)
  - [x] 2.1: `packages/app/src/pages/hub/session-sidebar.tsx` 생성
  - [x] 2.2: 기존 API `GET /api/workspace/chat/sessions` 활용 — 세션 목록 표시
  - [x] 2.3: 세션 선택 → 해당 세션 메시지 로드 (sessionId 상태 전환)
  - [x] 2.4: 새 대화 시작 버튼 (POST /api/workspace/chat/sessions 호출)
  - [x] 2.5: 세션 삭제 확인 모달 (DELETE /api/workspace/chat/sessions/:id)
  - [x] 2.6: `secretary-hub-layout.tsx`에 사이드바 통합 (토글 가능, 모바일 대응)

- [x] Task 3: Hub 채팅 autoLearn 트리거 추가 (AC: #4)
  - [x] 3.1: `packages/server/src/routes/workspace/chat.ts` — `streamTask` 완료 콜백에 autoLearn 호출 추가
  - [x] 3.2: 에이전트의 `autoLearn` 필드 조회 (agents 테이블에서 select 시 포함)
  - [x] 3.3: `extractAndSaveMemories()` 호출 (기존 패턴 따름, try-catch로 실패 무시)
  - [x] 3.4: 비서 경로와 일반 에이전트 경로 모두에 autoLearn 적용 (공통 코드로 통합)

- [x] Task 4: autoLearn 결과 SSE 피드백 (AC: #6)
  - [x] 4.1: `done` SSE 이벤트에 `learnedCount` 필드 추가 (학습된 포인트 수)
  - [x] 4.2: `use-sse-state-machine.ts` + `use-hub-stream.ts`에 `learnedCount` 상태 추가
  - [x] 4.3: Hub UI에 학습 결과 표시 (헤더에 "N개 학습됨" 배지)

- [x] Task 5: 기존 기능 검증 (AC: #1, #5)
  - [x] 5.1: `chat_messages` 무제한 보관 확인 — 삭제 정책 코드 없음 확인 완료
  - [x] 5.2: `knowledge-injector.ts`의 `collectAgentMemoryContext` → `soul-renderer.ts` 주입 경로 확인 완료
  - [x] 5.3: 통합 경로 확인: 메시지 전송 → 응답 → extractAndSaveMemories → agent_memories DB → collectAgentMemoryContext → soul-renderer 주입

## Dev Notes

### 핵심 아키텍처

- **DB 스키마 이미 완성**: `chat_sessions`, `chat_messages`, `agent_memories` 테이블 모두 존재
- **autoLearn 파이프라인 이미 구현**: `memory-extractor.ts`의 `extractAndSaveMemories()` 완성 (LLM 호출 → JSON 파싱 → 중복 검사 → 크리덴셜 스크러빙 → DB 저장)
- **지식 주입 파이프라인 이미 구현**: `knowledge-injector.ts` → `soul-renderer.ts` 경로로 `{{memories}}` 변수 치환

### 기존 코드 재사용 (절대 재구현하지 말 것)

| 기능 | 파일 | 상태 |
|------|------|------|
| 메시지 CRUD API | `packages/server/src/routes/workspace/chat.ts` | 완성 |
| 세션 CRUD API | 위 파일 내 | 완성 |
| 커서 페이지네이션 | 위 파일 `GET messages` | 완성 (before cursor) |
| autoLearn 추출 | `packages/server/src/services/memory-extractor.ts` | 완성 |
| 지식 주입 | `packages/server/src/services/knowledge-injector.ts` | 완성 |
| Soul 렌더링 | `packages/server/src/services/soul-renderer.ts` | 완성 |
| Hub SSE 스트리밍 | `packages/app/src/hooks/use-hub-stream.ts` | 완성 |
| Hub 레이아웃 | `packages/app/src/pages/hub/secretary-hub-layout.tsx` | 완성 |

### 구현해야 할 것 (신규 코드)

1. **Hub 채팅 페이지네이션 UI** — `secretary-hub-layout.tsx`에 `useInfiniteQuery` + `IntersectionObserver` 추가
2. **세션 사이드바** — `session-sidebar.tsx` 신규 파일
3. **chat.ts autoLearn 호출** — `streamTask` 완료 시 `extractAndSaveMemories()` 호출 1줄 추가
4. **done 이벤트 learnedCount** — SSE done 이벤트에 학습 수 포함

### autoLearn 기존 패턴 (반드시 따를 것)

`agent-runner.ts` 라인 276 패턴:
```typescript
if (agent.autoLearn !== false && finalContent && lastResponse.finishReason !== 'error') {
  const taskDesc = task.messages[0]?.content || ''
  extractAndSaveMemories({
    companyId: agent.companyId,
    agentId: agent.id,
    taskDescription: taskDesc,
    taskResult: finalContent,
    source: agent.name,
  }).catch(() => {}) // fire-and-forget
}
```

`chat.ts` streamTask에서도 동일 패턴 적용:
```typescript
// streamTask 완료 후 (aiContent 확보 후)
if (agent?.autoLearn !== false && aiContent) {
  extractAndSaveMemories({
    companyId: tenant.companyId,
    agentId: session.agentId,
    taskDescription: content,  // 유저 메시지
    taskResult: aiContent,
    source: 'hub-chat',
  }).catch(() => {})
}
```

### 에이전트 autoLearn 필드

`schema.ts` agents 테이블에 이미 존재:
```typescript
autoLearn: boolean('auto_learn').notNull().default(true)
```

현재 `chat.ts`의 에이전트 조회에서 `autoLearn` 필드를 SELECT하지 않음 → 추가 필요:
```typescript
const [agent] = await db
  .select({ isSecretary: agents.isSecretary, name: agents.name, autoLearn: agents.autoLearn })
  .from(agents)
  .where(eq(agents.id, session.agentId))
  .limit(1)
```

### 프론트엔드 페이지네이션 패턴

`useInfiniteQuery` 패턴 (TanStack Query v5):
```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['chat-messages', sessionId],
  queryFn: ({ pageParam }) =>
    api.get(`/api/workspace/chat/sessions/${sessionId}/messages`, {
      params: { before: pageParam, limit: 50 },
    }),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) =>
    lastPage.hasMore ? lastPage.data[0]?.id : undefined,
})
```

### 세션 사이드바 디자인

- 너비: `w-64` (비서 있음 레이아웃에서 좌측)
- 배경: `bg-slate-900` (기존 사이드바와 동일)
- 세션 아이템: 제목 + `lastMessageAt` 상대 시간 (예: "3분 전")
- 활성 세션: `bg-slate-700/50` 하이라이트
- 새 대화 버튼: 상단 고정, `+ 새 대화`
- 토글: 모바일에서 햄버거 메뉴로 접기

### Project Structure Notes

- 새 파일: `packages/app/src/pages/hub/session-sidebar.tsx` (1개만)
- 수정 파일:
  - `packages/server/src/routes/workspace/chat.ts` — autoLearn 호출 추가
  - `packages/app/src/pages/hub/secretary-hub-layout.tsx` — 페이지네이션 + 사이드바 통합
  - `packages/app/src/hooks/use-hub-stream.ts` — learnedCount 상태 추가
- 기존 파일 구조/네이밍 컨벤션 준수 (kebab-case 파일명, PascalCase 컴포넌트)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 6, Story 6.4]
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md — #20 에이전트 메모리]
- [Source: packages/server/src/services/memory-extractor.ts — extractAndSaveMemories()]
- [Source: packages/server/src/services/knowledge-injector.ts — collectAgentMemoryContext()]
- [Source: packages/server/src/routes/workspace/chat.ts — 기존 채팅 API]
- [Source: packages/app/src/pages/hub/secretary-hub-layout.tsx — 기존 Hub 레이아웃]
- [Source: packages/app/src/hooks/use-hub-stream.ts — SSE 스트리밍 hook]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Server tsc: PASS (0 errors)
- App tsc: PASS (0 errors)
- Unit tests: 17/17 pass (conversation-history-autolearn.test.ts)
- Regression tests: 54/54 pass (chat-session.test.ts + memory-extractor.test.ts)

### Completion Notes List

- Task 1: 페이지네이션은 Story 6.1에서 이미 구현 완료. "대화 시작" 마커만 신규 추가.
- Task 2: SessionSidebar 컴포넌트 신규 생성. w-64 좌측 패널, 모바일 토글, 삭제 확인 모달 포함.
- Task 3: chat.ts의 streamTask에 extractAndSaveMemories() 호출 추가. 비서/일반 에이전트 공통 코드로 통합. done 이벤트도 autoLearn 후에 발행하도록 변경.
- Task 4: SSECostInfo에 learnedCount 필드 추가. done 이벤트에서 파싱. Hub 헤더에 "N개 학습됨" emerald 배지 표시.
- Task 5: 기존 파이프라인 (chat_messages 무제한 보관, knowledge-injector → soul-renderer 주입) 코드 확인 완료. 삭제 정책 없음 확인.

### Change Log

- 2026-03-11: Story 6.4 구현 완료 — 대화 기록 페이지네이션 + 세션 사이드바 + autoLearn 트리거 + 학습 피드백 UI

### File List

- packages/server/src/routes/workspace/chat.ts (MODIFIED — autoLearn 호출 + learnedCount done 이벤트)
- packages/app/src/pages/hub/session-sidebar.tsx (NEW — 세션 목록 사이드바)
- packages/app/src/pages/hub/secretary-hub-layout.tsx (MODIFIED — 사이드바 통합 + 대화 시작 마커 + learnedCount 배지)
- packages/app/src/hooks/use-hub-stream.ts (MODIFIED — learnedCount 상태 추가)
- packages/app/src/hooks/use-sse-state-machine.ts (MODIFIED — SSECostInfo에 learnedCount 추가)
- packages/server/src/__tests__/unit/conversation-history-autolearn.test.ts (NEW — 17 테스트)
