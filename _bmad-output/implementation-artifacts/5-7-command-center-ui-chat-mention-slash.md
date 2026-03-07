# Story 5.7: 사령관실 UI -- 채팅 입력 + @멘션 + 슬래시

Status: done

## Story

As a CEO,
I want a Command Center chat interface with @mention agent targeting and slash command shortcuts,
so that I can issue commands to my AI organization efficiently with real-time delegation feedback.

## Acceptance Criteria

1. **채팅형 메시지 목록**: 사용자 명령(오른쪽)과 AI 응답(왼쪽)을 채팅 버블로 표시. 날짜 구분선 포함. 스크롤 시 맨 아래 이동 버튼 표시
2. **명령 입력 바**: 하단 고정. 텍스트 입력 + 전송 버튼(→). Enter=전송, Shift+Enter=줄바꿈. 자동 높이 조절(최소 1줄~최대 6줄)
3. **@멘션 자동완성**: `@` 입력 시 활성 Manager 에이전트 목록 드롭다운. 부서별 그룹. 키보드 방향키 탐색 + Enter 선택 + Esc 닫기. GET /api/workspace/org-chart에서 Manager 목록 조회
4. **슬래시 명령 팝업**: `/` 입력 시 8종 명령 목록 팝업 표시. 입력 필터링. 키보드 탐색 동일. 한글 설명 포함
5. **명령 전송**: POST /api/workspace/commands 호출. 응답으로 commandId 수신. 대화 이력에 사용자 메시지 즉시 추가(낙관적 업데이트)
6. **위임 체인 실시간 표시**: WebSocket command+delegation+tool 채널 구독. 에이전트 이름 + 현재 단계 + 경과 시간 표시. 트리 구조로 하위 위임 표시
7. **보고서 도착 시**: 마크다운 렌더링 + 품질 뱃지(PASS/FAIL) 표시. lg+ 화면에서 좌측 대화/우측 보고서 분할 뷰
8. **로딩/빈/에러 상태**: 첫 방문 시 환영 메시지 + 예시 명령 3개. 처리 중 스켈레톤. 에러 시 재시도 버튼
9. **반응형**: lg+(1024px+) 대화+보고서 병렬, md(768-1023) 탭 전환, sm(<768) 탭+컴팩트 입력

## Tasks / Subtasks

- [x] Task 1: CommandCenter 페이지 + 라우팅 (AC: #1, #8, #9)
  - [x] 1.1 `packages/app/src/pages/command-center/index.tsx` 페이지 생성
  - [x] 1.2 App.tsx에 `/command-center` 라우트 추가
  - [x] 1.3 Sidebar에 "사령관실" 메뉴 추가 (기존 sidebar.tsx 수정)
  - [x] 1.4 반응형 레이아웃: lg+ 분할 뷰 / md-sm 탭 전환

- [x] Task 2: MessageList 컴포넌트 (AC: #1, #8)
  - [x] 2.1 `packages/app/src/pages/command-center/components/message-list.tsx`
  - [x] 2.2 UserMessage 버블 (오른쪽 정렬, 타임스탬프)
  - [x] 2.3 AgentMessage 버블 (왼쪽 정렬, 에이전트 이름+아바타)
  - [x] 2.4 ProcessingIndicator (위임 체인 요약, 펄스 애니메이션)
  - [x] 2.5 빈 상태 (환영 화면 + 예시 명령 3개)
  - [x] 2.6 스크롤-투-바텀 버튼 + 새 메시지 뱃지
  - [x] 2.7 날짜 구분선

- [x] Task 3: CommandInput 컴포넌트 (AC: #2, #5)
  - [x] 3.1 `packages/app/src/pages/command-center/components/command-input.tsx`
  - [x] 3.2 자동 높이 조절 textarea (1줄~6줄)
  - [x] 3.3 Enter=전송, Shift+Enter=줄바꿈 키보드 핸들링
  - [x] 3.4 전송 버튼 (비활성/활성 상태)
  - [x] 3.5 명령 전송: POST /api/workspace/commands + 낙관적 업데이트

- [x] Task 4: MentionPopup 컴포넌트 (AC: #3)
  - [x] 4.1 `packages/app/src/pages/command-center/components/mention-popup.tsx`
  - [x] 4.2 `@` 감지 로직 (커서 위치 기반)
  - [x] 4.3 org-chart API 호출로 Manager 목록 조회 + 부서별 그룹핑
  - [x] 4.4 텍스트 필터링 (한글/영문 모두)
  - [x] 4.5 키보드 탐색 (↑↓ Enter Esc)
  - [x] 4.6 선택 시 textarea에 "@에이전트이름 " 삽입

- [x] Task 5: SlashPopup 컴포넌트 (AC: #4)
  - [x] 5.1 `packages/app/src/pages/command-center/components/slash-popup.tsx`
  - [x] 5.2 `/` 감지 로직 (입력 시작 또는 공백 후)
  - [x] 5.3 8종 명령 하드코딩 (아이콘 + 이름 + 설명)
  - [x] 5.4 입력 필터링 + 키보드 탐색 (↑↓ Enter Esc)
  - [x] 5.5 선택 시 textarea에 "/명령어 " 삽입

- [x] Task 6: DelegationChain 컴포넌트 (AC: #6)
  - [x] 6.1 `packages/app/src/pages/command-center/components/delegation-chain.tsx`
  - [x] 6.2 WebSocket command/delegation/tool 3채널 구독
  - [x] 6.3 트리 구조 렌더링 (비서실장 → Manager → Specialist)
  - [x] 6.4 상태 아이콘: 유휴(○) 작업중(●) 도구호출(◈) 완료(✓) 에러(✗) 재작업(↻)
  - [x] 6.5 각 노드 경과 시간 카운터 (실시간 업데이트)
  - [x] 6.6 접힘/펼침 토글

- [x] Task 7: useCommandCenter 훅 + 스토어 (AC: #5, #6)
  - [x] 7.1 `packages/app/src/stores/command-store.ts` -- 현재 활성 명령, 대화 모드 상태
  - [x] 7.2 `packages/app/src/hooks/use-command-center.ts` -- 명령 제출 mutation, 이력 query, WS 구독 통합

## Dev Notes

### 기존 코드 활용 (중요)

**반드시 재사용할 것:**
- `packages/app/src/lib/api.ts` -- API 클라이언트 (api.get, api.post 등)
- `packages/app/src/stores/ws-store.ts` -- WebSocket 연결 + 리스너 관리 (useWsStore)
- `packages/app/src/stores/auth-store.ts` -- 인증 상태 (useAuthStore)
- `packages/app/src/components/markdown-renderer.tsx` -- 마크다운 렌더링 (보고서 표시용)
- `packages/app/src/components/layout.tsx` -- 메인 레이아웃 래퍼
- `packages/app/src/components/sidebar.tsx` -- 사이드바 (메뉴 항목 추가)
- `@corthex/ui` -- Button, Card, Input, Badge, toast 등 공유 컴포넌트
- `@corthex/shared` -- WsChannel 타입, 공유 타입들

**참고할 패턴 (chat.tsx + chat-area.tsx):**
- ChatPage의 React Query 패턴 (queryKey, mutation, invalidation)
- ChatArea의 메시지 목록 스크롤링 패턴
- WebSocket 리스너 등록/해제 패턴 (useEffect + addListener/removeListener)

### API 엔드포인트

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/workspace/commands` | 명령 전송. Body: `{text, targetAgentId?, presetId?, useBatch?}`. Response: `{id, type, status, targetAgentId, parsedMeta, createdAt}` |
| GET | `/api/workspace/commands` | 명령 이력. Query: `?limit=20&offset=0`. Response: `{data: Command[]}` |
| GET | `/api/workspace/commands/:id` | 단일 명령 조회 |
| GET | `/api/workspace/org-chart` | 조직도 (Manager 목록용). 현재 회사의 활성 에이전트 + 부서 정보 |

### WebSocket 채널 구독

```typescript
// 1. command 채널 -- 명령 생명주기
useWsStore.getState().subscribe('command')
// Events: COMMAND_RECEIVED, CLASSIFYING, CLASSIFIED, QUALITY_CHECKING, QUALITY_PASSED, QUALITY_FAILED, COMPLETED, FAILED

// 2. delegation 채널 -- 위임 체인
useWsStore.getState().subscribe('delegation')
// Events: MANAGER_STARTED, SPECIALIST_DISPATCHED, SPECIALIST_COMPLETED, SPECIALIST_FAILED, SYNTHESIZING, SYNTHESIS_COMPLETED

// 3. tool 채널 -- 도구 호출
useWsStore.getState().subscribe('tool')
// Events: tool_call_started, tool_call_completed

// 리스너 등록 패턴:
useEffect(() => {
  const { addListener, removeListener } = useWsStore.getState()
  const handler = (data: unknown) => { /* 이벤트 처리 */ }
  addListener('command', handler)
  return () => removeListener('command', handler)
}, [])
```

### 슬래시 8종 명령 (하드코딩)

```typescript
const SLASH_COMMANDS = [
  { cmd: '/전체', desc: '모든 팀장에게 동시에 명령', icon: '📡' },
  { cmd: '/순차', desc: '팀장에게 순차적으로 릴레이 명령', icon: '🔗' },
  { cmd: '/도구점검', desc: '사용 가능한 도구 상태 확인', icon: '🔧' },
  { cmd: '/배치실행', desc: '대기 중인 배치 요청 실행', icon: '📦' },
  { cmd: '/배치상태', desc: '배치 처리 진행 상태 확인', icon: '📊' },
  { cmd: '/명령어', desc: '사용 가능한 모든 명령어 보기', icon: '📋' },
  { cmd: '/토론', desc: '팀장 2라운드 토론 시작', icon: '💬' },
  { cmd: '/심층토론', desc: '팀장 3라운드 심층 토론 시작', icon: '🧠' },
]
```

### 위임 체인 이벤트 구조 (DelegationTracker)

```typescript
// packages/server/src/services/delegation-tracker.ts의 이벤트 구조
type DelegationEvent = {
  commandId: string
  event: DelegationEventType  // 22종
  agentId?: string
  agentName?: string
  phase: string
  elapsed: number     // ms from command start
  data?: Record<string, unknown>
  timestamp: string   // ISO 8601
  companyId: string
}
```

### 상태 인디케이터 색상 (UX 스펙)

| Status | Color | Icon |
|--------|-------|------|
| 유휴 | #22C55E (green) | ○ |
| 작업 중 | #3B82F6 (blue, pulse) | ● |
| 도구 호출 | #8B5CF6 (purple) | ◈ |
| 품질 검수 | #EAB308 (yellow) | ◐ |
| 완료 | #22C55E (green) | ✓ |
| 에러 | #EF4444 (red) | ✗ |
| 재작업 | #F97316 (orange) | ↻ |

### 반응형 브레이크포인트

| 화면 | 레이아웃 | 보고서 패널 |
|------|----------|------------|
| lg+ (1024px+) | 대화 40% + 보고서 60% 분할 | 옆에 표시 |
| md (768-1023) | 탭 전환 (대화/보고서) | 탭으로 전환 |
| sm (<768) | 탭 + 컴팩트 입력 | 탭으로 전환 |

### Project Structure Notes

**새 파일 생성:**
```
packages/app/src/pages/command-center/
├── index.tsx                    # CommandCenter 메인 페이지
└── components/
    ├── message-list.tsx         # 메시지 목록 (채팅 버블)
    ├── command-input.tsx        # 입력 바 + 전송
    ├── mention-popup.tsx        # @멘션 자동완성 드롭다운
    ├── slash-popup.tsx          # / 슬래시 명령 팝업
    └── delegation-chain.tsx     # 위임 체인 실시간 표시

packages/app/src/stores/command-store.ts    # (기존 없으면 생성)
packages/app/src/hooks/use-command-center.ts
```

**수정할 기존 파일:**
- `packages/app/src/App.tsx` -- 라우트 추가
- `packages/app/src/components/sidebar.tsx` -- 사령관실 메뉴 추가

### v1 참고 사항

v1 (`/home/ubuntu/CORTHEX_HQ/web/templates/index.html`)의 사령관실 구현 참고:
- Alpine.js 기반 → React로 변환
- 메시지 타입: User(오른쪽), Agent(왼쪽), Processing(펄스), Error(빨강), Queue(노랑점선)
- `@` 감지: `text.match(/(?:^| )@(\S*)$/)`로 커서 뒤 @검색
- `/` 감지: `text.match(/^\/(\S*)$/)`로 시작점 슬래시 검색
- 부서별 에이전트 그룹핑: departmentId → 부서명 매핑 → optgroup 방식
- 대기열 시스템: 처리 중 새 명령 → 큐에 추가 (이 스토리에서는 미구현, Story 5-10에서)
- WebSocket: `ws.onmessage` → `processing_start`, `agent_status`, `delegation_log_update` 등 이벤트
- 스크롤: 새 메시지 추가 후 자동 스크롤, 위로 스크롤 시 "맨 아래로" 버튼 표시

### 금지 사항

- 기존 `packages/app/src/pages/chat.tsx`는 1:1 에이전트 대화용. 사령관실은 별개 페이지로 구현
- stub/mock 금지 -- API 호출, WebSocket 구독 모두 실제 동작해야 함
- 새 라이브러리 설치 금지 -- 기존 react-markdown, @tanstack/react-query, zustand만 사용

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-5 Story 5-7]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#CEO-2-Command-Center]
- [Source: _bmad-output/planning-artifacts/architecture.md#Orchestration-Engine]
- [Source: packages/server/src/routes/commands.ts -- Commands API]
- [Source: packages/server/src/services/delegation-tracker.ts -- DelegationEvent types]
- [Source: packages/app/src/stores/ws-store.ts -- WebSocket store pattern]
- [Source: packages/app/src/pages/chat.tsx -- React Query + chat patterns]
- [Source: /home/ubuntu/CORTHEX_HQ/web/templates/index.html -- v1 Command Center]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed -- comprehensive developer guide created
- All 7 tasks implemented: CommandCenter page, MessageList, CommandInput, MentionPopup, SlashPopup, DelegationChain, useCommandCenter hook + store
- Reused existing components: ReportView, ReportDetailModal, MarkdownRenderer, Tabs, Badge from @corthex/ui
- Reused existing stores: ws-store (WebSocket), auth-store (auth)
- API integration: POST/GET /api/workspace/commands, GET /api/workspace/org-chart
- WebSocket: command + delegation + tool 3-channel subscription with live event processing
- Responsive: lg+ split view (chat 40% / report 60%), md/sm tab switching
- Build: tsc + vite build pass with 0 errors
- Tests: 13 unit + 29 TEA risk-based = 42 story tests (all pass), 62 total app tests (0 regressions)
- Code review fixes: duplicate agent message bug, clearDelegation ordering, example click wiring, scroll button positioning

### File List

**New files:**
- packages/app/src/pages/command-center/index.tsx
- packages/app/src/pages/command-center/components/message-list.tsx
- packages/app/src/pages/command-center/components/command-input.tsx
- packages/app/src/pages/command-center/components/mention-popup.tsx
- packages/app/src/pages/command-center/components/slash-popup.tsx
- packages/app/src/pages/command-center/components/delegation-chain.tsx
- packages/app/src/stores/command-store.ts
- packages/app/src/hooks/use-command-center.ts
- packages/app/src/__tests__/command-center.test.ts
- packages/app/src/__tests__/command-center-tea.test.ts

**Modified files:**
- packages/app/src/App.tsx (added CommandCenterPage lazy import + route)
- packages/app/src/components/sidebar.tsx (added 사령관실 nav item)
