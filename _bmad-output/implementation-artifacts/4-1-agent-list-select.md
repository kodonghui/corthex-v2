# Story 4.1: Agent List & Select

Status: done

## Story

As a 일반 직원(유저),
I want 에이전트 목록에서 대화할 에이전트를 선택하고 세션을 관리할 수 있다,
so that 여러 에이전트와의 대화를 체계적으로 시작하고 관리할 수 있다.

## Acceptance Criteria

1. **Given** 채팅 페이지 진입 **When** 로드 완료 **Then** 좌측에 세션 패널(w-72) 표시, `+ 새 대화` 버튼 상단에 표시
2. **Given** `+ 새 대화` 버튼 클릭 **When** AgentListModal 열림 **Then** 검색 Input 항상 표시, 에이전트 3명 이하 시 검색 disabled
3. **Given** AgentListModal **When** 에이전트 목록 표시 **Then** 아바타(fallback=이니셜)+이름+상태+소개 표시, 비서=⭐, 오프라인=opacity-50 선택 불가
4. **Given** 에이전트 선택 **When** 온라인 에이전트 클릭 **Then** 새 세션 생성 후 ChatArea로 이동, 모달 닫힘
5. **Given** 세션 패널 **When** 세션 목록 표시 **Then** 날짜 그룹(오늘/어제/이번 주/이전)으로 분류, 접기/펼치기 가능
6. **Given** 세션 아이템 **When** 표시 **Then** 제목(최대 40자) + 에이전트 아이콘 + 시간 표시
7. **Given** 세션 아이템 **When** ··· 메뉴 클릭 **Then** 이름 변경, 삭제 옵션 표시
8. **Given** 세션 삭제 **When** 확인 **Then** "이 대화를 삭제하시겠어요? 삭제된 대화는 복구할 수 없습니다. 에이전트의 기억은 유지됩니다." 확인 다이얼로그
9. **Given** 첫 방문(세션 없음) **When** 채팅 영역 **Then** EmptyState: "에이전트와 첫 대화를 시작해보세요!" + `새 대화 시작` 버튼
10. **Given** 모바일(md 이하) **When** 세션 패널 표시 **Then** 세션 목록 전체 화면, 선택 시 대화 화면으로 전환, ← 버튼으로 목록 복귀

## Tasks / Subtasks

- [x] Task 1: chat.tsx → 세션 패널(SessionPanel) + 채팅 영역(ChatArea) 분리 (AC: #1, #9)
  - [x] 기존 단일 chat.tsx를 SessionPanel + ChatArea 컴포넌트로 분리
  - [x] ChatPage 레이아웃: `flex h-full` — SessionPanel(w-72) + ChatArea(flex-1)
  - [x] EmptyState 컴포넌트: "에이전트와 첫 대화를 시작해보세요!" + 새 대화 시작 버튼
- [x] Task 2: AgentListModal 구현 (AC: #2, #3, #4)
  - [x] `+ 새 대화` 버튼 → 모달 열기
  - [x] 검색 Input: 항상 표시, 에이전트 3명 이하 시 disabled, 이름+역할 클라이언트 필터링
  - [x] 에이전트 카드: 아바타(이니셜 fallback) + 이름 + 상태 dot + 소개(role)
  - [x] 비서 에이전트: ⭐ 아이콘 표시, 목록 최상단 정렬
  - [x] 오프라인 에이전트: opacity-50 + 선택 불가(cursor-not-allowed)
  - [x] 에이전트 선택 → POST /workspace/chat/sessions → 세션 생성 → 모달 닫기
- [x] Task 3: 세션 목록 날짜 그룹 (AC: #5, #6)
  - [x] 날짜 그룹 함수: groupSessionsByDate(sessions) → { 오늘, 어제, 이번 주, 이전 }
  - [x] 그룹 헤더: ▸/▾ 접기/펼치기 토글
  - [x] 세션 아이템: 제목(truncate 40자) + 에이전트 이니셜 아이콘 + 시간(HH:mm)
  - [x] 선택된 세션: bg-indigo 하이라이트
- [x] Task 4: 세션 편집/삭제 (AC: #7, #8)
  - [x] ··· 메뉴: 호버 시 표시 (relative 드롭다운)
  - [x] 이름 변경: inline 텍스트 입력 + PATCH /workspace/chat/sessions/:id
  - [x] 삭제 확인 다이얼로그: 경고 문구 + 확인/취소 버튼 + DELETE /workspace/chat/sessions/:id
- [x] Task 5: 서버 API — 세션 수정/삭제 엔드포인트 추가 (AC: #7, #8)
  - [x] PATCH /workspace/chat/sessions/:id — title 수정
  - [x] DELETE /workspace/chat/sessions/:id — 물리 삭제 (메시지 → 세션 순서)
- [x] Task 6: 모바일 반응형 (AC: #10)
  - [x] md 이하: 세션 패널 전체 화면, 세션 선택 시 ChatArea로 전환
  - [x] ChatArea 상단 ← 버튼: 세션 목록으로 복귀
  - [x] 조건부 렌더링: `showChat` state로 모바일 전환 관리
- [x] Task 7: 빌드 + 기존 테스트 통과 확인
  - [x] `turbo build` 3/3 성공
  - [x] `bun test src/__tests__/unit/` 69/69 전체 통과

## Dev Notes

### 핵심: 기존 chat.tsx를 UX 스펙 10.4에 맞게 리팩터링

현재 chat.tsx(366줄)는 단순한 에이전트 사이드바(w-56) + 채팅 영역으로 구성. UX 스펙 10.4의 세션 패널 + AgentListModal 구조로 대폭 개선 필요.

### 현재 chat.tsx 구조 (변경 전)

```
ChatPage (366줄, 단일 파일)
├── 에이전트 사이드바 (w-56, 단순 리스트)
│   └── 에이전트 버튼들 (상태 dot + 이름 + 역할)
├── 채팅 헤더 (에이전트 이름 + 비서 배지)
├── 위임 내역 패널 (비서용)
├── 메시지 목록 (유저/에이전트 버블)
├── 타이핑 인디케이터 (bouncing dots)
└── 입력 영역 (single <input>)
```

### 변경 후 구조 (UX 스펙 10.4)

```
ChatPage
├── SessionPanel (w-72, 새로 분리)
│   ├── [+ 새 대화] 버튼 → AgentListModal
│   ├── 날짜 그룹 (오늘/어제/이번 주/이전)
│   │   └── SessionItem (제목 + 에이전트 아이콘 + 시간 + ··· 메뉴)
│   └── 모바일: 전체 화면
├── AgentListModal (새로 생성)
│   ├── 검색 Input (≤3명이면 disabled)
│   └── 에이전트 카드들 (아바타+이름+상태+소개)
└── ChatArea (기존 채팅 영역 — 이 스토리에서는 기존 유지, 4-2에서 스트리밍 개선)
    ├── 헤더 (기존 유지)
    ├── 메시지 목록 (기존 유지)
    └── 입력 영역 (기존 유지, 4-2에서 textarea 개선)
```

### 컴포넌트 파일 구조

```
packages/app/src/
├── pages/chat.tsx                ← 리팩터링 (SessionPanel + ChatArea 조합)
├── components/chat/
│   ├── session-panel.tsx         ← NEW: 세션 패널 (날짜 그룹, 세션 아이템, ··· 메뉴)
│   ├── agent-list-modal.tsx      ← NEW: 에이전트 선택 모달 (검색, 카드, 상태)
│   └── chat-area.tsx             ← NEW: 기존 채팅 영역 분리 (헤더+메시지+입력)
```

### 날짜 그룹 분류 로직

```typescript
function groupSessionsByDate(sessions: Session[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekStart = new Date(today.getTime() - today.getDay() * 86400000)

  return {
    '오늘': sessions.filter(s => new Date(s.lastMessageAt || s.createdAt) >= today),
    '어제': sessions.filter(s => {
      const d = new Date(s.lastMessageAt || s.createdAt)
      return d >= yesterday && d < today
    }),
    '이번 주': sessions.filter(s => {
      const d = new Date(s.lastMessageAt || s.createdAt)
      return d >= weekStart && d < yesterday
    }),
    '이전': sessions.filter(s => new Date(s.lastMessageAt || s.createdAt) < weekStart),
  }
}
```

### AgentListModal 디자인

```
┌─────────────────────────────────┐
│ 에이전트 선택              [✕] │
├─────────────────────────────────┤
│ [🔍 에이전트 검색...]          │
├─────────────────────────────────┤
│ ⭐ [비] 비서실장  ● online     │
│    비서 오케스트레이터          │
│ ──────────────────────────────  │
│ [금] 금융분석팀장  ● online    │
│    주식 시장 분석              │
│ ──────────────────────────────  │
│ [리] 리서치팀원  ○ offline     │  ← opacity-50
│    리서치 자료 수집            │
└─────────────────────────────────┘
```

- 아바타: 이름 첫 글자 이니셜, `w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold`
- 상태 dot: online=green, working=yellow+pulse, error=red, offline=zinc
- 비서: ⭐ 배지, 목록 최상단 정렬 (sort: isSecretary desc → status online first)

### 서버 API 추가 필요

현재 chat.ts에 없는 엔드포인트:
- `PATCH /workspace/chat/sessions/:id` — 제목 수정
- `DELETE /workspace/chat/sessions/:id` — 세션 삭제

```typescript
// PATCH — 세션 제목 수정
const updateSessionSchema = z.object({ title: z.string().min(1).max(200) })
chatRoute.patch('/sessions/:sessionId', zValidator('json', updateSessionSchema), async (c) => { ... })

// DELETE — 세션 삭제
chatRoute.delete('/sessions/:sessionId', async (c) => { ... })
```

### 기존 코드 변경 주의사항

- **메시지 전송 로직 변경 금지**: sendMessage mutation은 그대로 유지 (4-2 스트리밍에서 개선)
- **위임 내역 패널 유지**: ChatArea로 이동만
- **타이핑 인디케이터 유지**: ChatArea로 이동만
- **기존 타입 재사용**: Agent, Session, Message, Delegation 타입은 chat.tsx에서 chat-area.tsx로 이동
- **api.ts 사용**: 기존 `api.get/post/patch` 사용. `api.delete` 없으면 추가 필요 (api.ts 확인)
- **react-query 패턴 유지**: queryKey 규칙, invalidateQueries 패턴 동일하게 유지

### api.ts DELETE 메서드 확인

현재 `packages/app/src/lib/api.ts`에 `api.delete` 메서드가 없을 수 있음. 필요시 추가:
```typescript
async delete<T>(path: string): Promise<T> {
  return this.request<T>(path, { method: 'DELETE' })
}
```

### 모바일 반응형 패턴

```tsx
// 모바일 전환 상태
const [showChat, setShowChat] = useState(false)
const isMobile = useMediaQuery('(max-width: 768px)') // 또는 md breakpoint

// 레이아웃
<div className="flex h-full">
  {/* 세션 패널: 모바일이면 showChat일 때 숨김 */}
  <div className={`${isMobile && showChat ? 'hidden' : 'w-full md:w-72'} ...`}>
    <SessionPanel />
  </div>
  {/* 채팅 영역: 모바일이면 showChat일 때만 표시 */}
  <div className={`${isMobile && !showChat ? 'hidden' : 'flex-1'} ...`}>
    <ChatArea onBack={() => setShowChat(false)} />
  </div>
</div>
```

### 이전 스토리에서 배운 패턴

- **컴포넌트 분리**: settings.tsx에서 탭별 분리한 것처럼, chat.tsx도 역할별 컴포넌트 분리
- **useSearchParams 불필요**: 채팅 페이지는 URL 파라미터 불필요 (세션 선택은 로컬 상태)
- **toast 알림**: 삭제 성공/실패 시 toast 표시 (기존 패턴 따라 react-hot-toast)
- **Tailwind snap 스크롤**: 이 스토리에서는 불필요 (탭이 아닌 리스트)

### Project Structure Notes

```
packages/app/src/
├── pages/chat.tsx                ← 리팩터링 (최상위 조합 컴포넌트)
├── components/chat/
│   ├── session-panel.tsx         ← NEW
│   ├── agent-list-modal.tsx      ← NEW
│   └── chat-area.tsx             ← NEW (기존 채팅 영역 이동)
├── lib/api.ts                    ← delete 메서드 추가 필요시
packages/server/src/
├── routes/workspace/chat.ts      ← PATCH + DELETE 세션 엔드포인트 추가
```

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Section 10.4] — 채팅 페이지 전체 UX 스펙
- [Source: packages/app/src/pages/chat.tsx] — 현재 채팅 페이지 (366줄)
- [Source: packages/server/src/routes/workspace/chat.ts] — 채팅 API 5개 엔드포인트
- [Source: packages/shared/src/types.ts] — Agent, ChatSession, ChatMessage 타입
- [Source: packages/app/src/stores/ws-store.ts] — WebSocket 스토어 (4-2에서 활용)
- [Source: packages/server/src/ws/channels.ts] — 채널 핸들러 (chat-stream 채널)
- [Source: _bmad-output/implementation-artifacts/3-5-settings-ui.md] — 이전 스토리 (컴포넌트 분리 패턴 참고)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List
- chat.tsx(366줄) → SessionPanel + ChatArea + AgentListModal 3개 컴포넌트로 분리
- AgentListModal: 검색(3명 이하 disabled), 비서⭐ 최상단, 오프라인 opacity-50 선택 불가
- SessionPanel: 날짜 그룹(오늘/어제/이번 주/이전), 접기/펼치기, ··· 메뉴(이름 변경/삭제)
- 삭제 확인 다이얼로그: UX 스펙 문구 그대로 적용
- 서버 API: PATCH + DELETE /workspace/chat/sessions/:id 추가
- 모바일: showChat state로 세션패널/채팅영역 전환, ← 버튼 복귀
- 메시지 버블: UX 스펙 10.4 — 유저 rounded-br-md, 에이전트 rounded-bl-md + 이름 표시
- 빌드 3/3 성공, 유닛 테스트 69/69 통과

### File List
- packages/app/src/pages/chat.tsx — 리팩터링 (SessionPanel + ChatArea + AgentListModal 조합)
- packages/app/src/components/chat/session-panel.tsx — NEW: 세션 패널 (날짜 그룹, 세션 아이템, ··· 메뉴, 삭제 확인)
- packages/app/src/components/chat/agent-list-modal.tsx — NEW: 에이전트 선택 모달 (검색, 카드, 상태)
- packages/app/src/components/chat/chat-area.tsx — NEW: 채팅 영역 (헤더+메시지+입력+위임패널)
- packages/server/src/routes/workspace/chat.ts — PATCH + DELETE 세션 엔드포인트 추가 (delegations FK 삭제 수정)
- packages/app/src/components/chat/types.ts — NEW: 공유 타입 정의 (Agent, Session, Message, Delegation)
