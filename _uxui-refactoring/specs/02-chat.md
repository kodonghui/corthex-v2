# Chat (1:1 에이전트 채팅) UX/UI 설명서

> 페이지: #02 chat
> 패키지: app
> 경로: /chat
> 작성일: 2026-03-09

---

## 1. 페이지 목적

특정 AI 에이전트와 **1:1로 대화**하는 메신저 스타일 페이지. Command Center가 "전체 조직에 명령"이라면, 이 페이지는 "특정 에이전트와 직접 대화"하는 곳.

**핵심 사용자 시나리오:**
- 에이전트 목록에서 대화할 AI 직원 선택
- 세션 기반으로 대화 (세션 = 하나의 대화 스레드)
- 이전 대화 이어가기, 새 대화 시작, 대화 이름 변경/삭제
- 파일 첨부하여 메시지 전송 (최대 5개, 이미지 미리보기 지원)
- 비서 에이전트에게 업무 지시 시 부서별 위임 현황 확인
- 토론 명령어(/토론, /심층토론)로 AGORA 토론 시작
- 에이전트의 도구 호출 과정 실시간 확인

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌────────────┬──────────────────────────────────────┐
│ SessionPanel│           ChatArea                   │
│ (w-72)     │                                      │
│            │  [에이전트 이름/역할 헤더]              │
│ [+ 새 대화] │                                      │
│            │  메시지 목록                           │
│ 세션 목록   │  - 유저 메시지 (오른쪽)               │
│ - 에이전트명│  - AI 응답 (왼쪽)                     │
│ - 마지막글 │                                      │
│ - ··· 메뉴: │                                      │
│   이름변경  │  ┌──────────────────────────────────┐│
│   삭제     │  │ [📎] [입력]              [전송]   ││
│            │  └──────────────────────────────────┘│
└────────────┴──────────────────────────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ SessionPanel         │  ← showChat=false일 때
│ 세션 목록 (전체 너비)  │
│ + 새 대화             │
└─────────────────────┘

┌─────────────────────┐
│ [← 뒤로] 에이전트명  │  ← showChat=true일 때
│                     │
│ ChatArea (전체 너비) │
│                     │
│ [📎] [입력]    [전송] │
└─────────────────────┘
```

### 세션 패널 날짜 그룹핑 (현재 구현)
```
┌────────────────┐
│ [+ 새 대화]     │
│                │
│ ▾ 오늘         │
│  [A] 세션 제목  │
│  [B] 세션 제목  │
│ ▾ 어제         │
│  [C] 세션 제목  │
│ ▸ 이번 주 (접힘)│
│ ▾ 이전         │
│  [D] 세션 제목  │
└────────────────┘
```
- 세션은 날짜 그룹별로 분류 (오늘/어제/이번 주/이전)
- 그룹 헤더 클릭으로 접기/펼치기 가능

### 위임 패널 (비서 에이전트 전용)
```
┌──────────────────────────────────────┐
│ [채팅 보기 | 위임 내역 (N)]           │
│──────────────────────────────────────│
│ 부서 위임 내역                        │
│ ┌──────────────────────────────────┐ │
│ │ 타겟 에이전트명          [완료]    │ │
│ │ 지시: 위임 프롬프트 내용           │ │
│ │ 응답 내용...                     │ │
│ │ 14:30 → 14:32 (2초)             │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## 3. 현재 문제점

1. **세션 패널 시각적 단조로움**: 세션 목록이 텍스트만 나열되어 어떤 에이전트와의 대화인지 한눈에 파악 어려움
2. **에이전트 선택 모달**: AgentListModal이 단순 목록이라 부서별 그룹핑이나 검색 기능 부족
3. **빈 상태 디자인**: 처음 접속 시 우측 ChatArea가 비어 보이는 문제
4. **세션 관리 접근성**: 이름 변경/삭제가 우클릭 컨텍스트 메뉴에 숨어있어 모바일에서 접근 어려움
5. **에이전트 아바타/상태 부재**: 대화 상대 AI의 아바타나 온라인 상태 표시 없음
6. **로딩/에러 상태 미정의**: 메시지 로딩 중 스켈레톤, API 실패 시 에러 표시 없음
7. **모바일 전환 애니메이션**: 세션 목록 ↔ 채팅 전환이 즉시 교체라 UX가 딱딱함

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 v0.dev가 결정** — 특정 테마 강제 없음
- 메신저 앱 느낌 (Slack, Discord, iMessage 같은 친숙한 채팅 UX)
- 에이전트 아바타/뱃지로 대화 상대를 시각적으로 구분

### 4.1.1 스코프 정의 (UI-only 리팩토링)
아래 항목은 **이미 구현된 기능의 스타일/레이아웃만 개선**하는 범위:
- 세션 패널 아바타 추가, 날짜 그룹 시각 개선, 도구 호출 카드 스타일 — **스타일 개선**
- 빈 상태 CTA, 로딩 스켈레톤, 에러 표시 — **이미 구현됨, 스타일 개선**
- 에이전트 모달 부서 그룹핑/검색/아바타 — **이미 구현됨, 스타일 개선**
- 파일 첨부 미리보기, 무한 스크롤 — **이미 구현됨, 스타일 개선**
- 타이핑 인디케이터, 연결 상태 배너 — **이미 구현됨, 스타일 개선**

**기능 로직 변경 없음** — mutation, WebSocket, 파싱, 업로드 로직 등 불변.

### 4.2 레이아웃 개선
- **세션 패널**: 에이전트 아바타 + 마지막 메시지 프리뷰 + 시간 + 날짜 그룹핑 개선
- **빈 상태**: 에이전트 선택 유도 CTA ("새 대화 시작하기" 버튼) (ChatArea 빈 상태 + SessionPanel 빈 상태 모두, 새 기능 로직 없이 기존 agent-modal 트리거)
- **에이전트 모달**: 부서별 그룹핑 + 검색 + 아바타
- **도구 호출 카드**: 에이전트 메시지 내 도구 사용 과정의 시각적 표현
- **파일 첨부 영역**: 첨부 미리보기, 이미지 인라인 표시

### 4.3 인터랙션 개선
- 세션 관리: ··· 버튼 → 드롭다운 메뉴 (이름 변경/삭제) + 삭제 확인 다이얼로그
- 메시지 타이핑 인디케이터 (점 3개 bounce 애니메이션)
- ~~새 메시지 알림 뱃지~~ (스코프 제외 — 에이전트가 먼저 메시지를 보내는 트리거 시나리오 부재, dead feature 위험)
- 파일 첨부: 📎 버튼 → 파일 선택 → 미리보기 표시 → 전송 시 같이 전송
- 스트리밍 중지: 전송 버튼이 "중지" 버튼으로 전환
- 에러 시 재시도: 에러 메시지 아래 "다시 시도" 링크
- 무한 스크롤: 위로 스크롤 시 이전 메시지 자동 로드

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | ChatPage | 레이아웃 spacing 조정 | pages/chat.tsx |
| 2 | SessionPanel | 아바타 추가, 날짜 그룹 시각적 개선, 삭제 확인 다이얼로그 스타일 | components/chat/session-panel.tsx |
| 3 | ChatArea | 메시지 스타일 개선, 헤더 강화, 파일 첨부 UI, 위임 패널 스타일 | components/chat/chat-area.tsx |
| 4 | AgentListModal | 부서 그룹핑, 검색, 아바타 | components/chat/agent-list-modal.tsx |
| 5 | ToolCallCard | 도구 호출 카드 시각적 개선 | components/chat/tool-call-card.tsx |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| agents | useQuery → /workspace/agents | 에이전트 목록 |
| sessions | useQuery → /workspace/chat/sessions | 세션 목록 (lastMessageAt DESC) |
| selectedSessionId | useState + URL searchParams | 현재 선택된 세션 |
| showChat | useState | 모바일 뷰 토글 |
| showAgentModal | useState | 에이전트 선택 모달 |

**API 엔드포인트 (변경 없음):**
- `GET /api/workspace/agents` — 에이전트 목록
- `GET /api/workspace/chat/sessions` — 세션 목록
- `POST /api/workspace/chat/sessions` — 세션 생성 (agentId)
- `PATCH /api/workspace/chat/sessions/:id` — 세션 이름 변경
- `DELETE /api/workspace/chat/sessions/:id` — 세션 삭제

---

## 7. 색상/톤 앤 매너

| 용도 | 설명 |
|------|------|
| 유저 메시지 | 오른쪽 정렬, 강조 배경색 |
| AI 메시지 | 왼쪽 정렬, 중립 배경색 |
| 선택된 세션 | 하이라이트 배경 |
| 새 메시지 | 알림 뱃지 색상 |
| 타이핑 인디케이터 | 점 3개 bounce 애니메이션 |
| 연결 끊김 배너 | 경고 배경색 (상단 스트립) |
| 재연결 성공 배너 | 성공 배경색 (2초 후 자동 사라짐) |
| 에러 메시지 | 빨간 계열 배경, 재시도 링크 포함 |
| 도구 호출 카드 | 메시지 내부 소형 카드, 도구명/상태/소요시간 |
| 위임 상태 뱃지 | 처리중(노랑)/완료(초록)/실패(빨강) |
| 파일 첨부 미리보기 | 입력 영역 위, 이미지는 썸네일 표시 |
| 스트리밍 중지 버튼 | 빨간 배경, 전송 버튼 위치 대체 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 2컬럼 (세션 패널 w-72 + 채팅 영역) |
| **768px~1439px** (Tablet) | 2컬럼 유지, 세션 패널 w-60으로 축소 (Tailwind md 브레이크포인트) |
| **~767px** (Mobile) | 1컬럼: 세션 목록 ↔ 채팅 전환 (showChat 토글) |

**모바일 특별 처리:**
- 뒤로가기 버튼으로 세션 목록 복귀
- 에이전트 모달: 풀스크린
- 세션 관리: ... 메뉴 (스와이프 제스처는 새 인터랙션 구현이므로 UI-only 스코프 제외)

---

## 9. 기존 기능 참고사항

에이전트와의 1:1 채팅은 v2에서 새로 추가된 핵심 기능이나, v1 사령관실(#1)의 일부 명령이 chat에서도 사용 가능.

**v1 사령관실과의 기능 매핑:**
| v1 사령관실 기능 | v2 위치 | 비고 |
|-----------------|---------|------|
| 자동 라우팅 (일반 텍스트) | Command Center | chat에서는 특정 에이전트에 직접 대화 |
| @멘션 | Command Center | chat은 이미 특정 에이전트 선택됨 |
| 슬래시 명령어 8종 | Command Center | /토론, /심층토론만 chat에서도 사용 가능 |
| 프리셋 | Command Center + Dashboard 퀵액션 | chat에서는 미지원 |
| 비서실장 위임 체인 | 양쪽 | chat 위임 패널 = 비서 에이전트 전용 |

- [x] 에이전트 선택 → 세션 자동 생성/기존 세션 재사용
- [x] 세션별 대화 이력 유지
- [x] 세션 이름 변경 / 삭제
- [x] URL 동기화 (?session=id)
- [x] 자동 세션 선택 (최근 세션)
- [x] 파일 첨부 (최대 5개, 이미지 미리보기, 다운로드 링크, 6번째 파일 시도 시 첨부 버튼 비활성화)
- [x] 스트리밍 응답 (실시간 텍스트 표시 + 커서 깜박임)
- [x] 스트리밍 중지 기능
- [x] 도구 호출 카드 (에이전트 메시지 내)
- [x] 위임 패널 (비서 에이전트 → 부서별 위임 현황)
- [x] 위임 체인/병렬 위임 상태 표시 (헤더 서브텍스트)
- [x] 토론 명령어 (/토론, /심층토론 → AGORA 이동)
- [x] 무한 스크롤 (위로 스크롤 시 이전 메시지 로드)
- [x] 세션 날짜 그룹핑 (오늘/어제/이번 주/이전)
- [x] 세션 그룹 접기/펼치기
- [x] 삭제 확인 다이얼로그
- [x] WebSocket 연결 상태 배너 (끊김/재연결)
- [x] 에러 시 재시도 버튼
- [x] 토론 결과 카드 (DebateResultCard — agora 페이지 컴포넌트 재사용, 해당 스펙 참조)

**참고: 모바일 파일 미리보기**
- 375px에서 첨부 파일 미리보기 칩은 flex-wrap으로 줄 바꿈 처리 (현재 코드 동작과 동일)

**UI 변경 시 절대 건드리면 안 되는 것:**
- `createSession`, `renameSession`, `deleteSession` mutation 로직
- `selectSession` URL 동기화 로직
- `handleAgentSelect` 세션 재사용 로직
- ChatArea 내부의 메시지 전송/수신/스트리밍 로직
- `useChatStream` 훅 (WebSocket 연결, 스트리밍 처리)
- `parseDebateCommand` 토론 명령어 파싱 로직
- 파일 업로드 `api.upload` 호출 로직
- 위임(delegation) 데이터 fetching 로직

---

## 10. v0.dev 디자인+코딩 지시사항

> v0.dev가 디자인과 코딩을 동시에 수행합니다. 아래 내용을 v0 프롬프트에 포함하세요. 레이아웃은 v0에게 자유도를 부여합니다.

### v0 프롬프트 (디자인+코딩 통합)
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. Think of it like Slack or Linear, but instead of messaging coworkers, you're giving tasks to AI employees and watching them collaborate to deliver results.

This page: A 1:1 chat interface where the user has direct conversations with individual AI agents. Similar to Slack DMs or iMessage — the user picks an AI agent and chats with them privately.

User workflow:
1. User sees a list of past conversations (sessions) in a left panel
2. User clicks a session to continue an existing conversation, or clicks "New Chat" to start fresh
3. When starting a new chat, a modal shows all available AI agents grouped by department — user picks one
4. The chat area shows the message thread with that specific agent
5. User types a message, agent responds

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Session list panel — left side, shows past conversations grouped by date (Today, Yesterday, This Week, Older). Each session shows: agent name, agent avatar/icon, last message preview, timestamp. Has a "New Chat" button at top. Groups are collapsible.
2. Chat area — the main message thread. User messages on the right (highlighted), agent messages on the left (neutral). Agent messages show agent name and role tag. Some agent messages contain "tool call cards" — small inline cards showing which tools the agent used (tool name, status, duration).
3. Chat header — shows the selected agent's name, role, department, and online status indicator. For "secretary" agents, shows delegation status as subtitle (e.g., "Delegating to Marketing dept...").
4. Input area — text input at the bottom with a file attach button (paperclip icon) on the left and send button on the right. When files are attached, small preview chips appear above the input. During AI streaming, the send button changes to a red "Stop" button.
5. Agent selection modal — when starting a new chat, shows agents grouped by department with search. Each agent shows avatar, name, role, and department color.
6. Empty state — when no session is selected, show a welcoming prompt encouraging the user to start a conversation or pick an agent. When session list is empty, show "No conversations yet" message.
7. Session management — each session has a "..." action button (visible on hover on desktop, always visible on mobile) with rename and delete options. Delete shows a confirmation dialog.
8. Loading state — skeleton UI while messages load. Spinner when loading older messages at top.
9. Error state — error message with a "Retry" link below it.
10. Connection status — a thin banner at the top of chat area showing "Disconnected, reconnecting..." (yellow) or "Connected" (green, auto-hides after 2 seconds).
11. Delegation panel — for secretary agents only, a toggle in the header switches between chat view and delegation history view. Delegation history shows each delegated task with target agent name, status badge (pending/completed/failed), prompt, response, and timing.
12. File attachments in messages — messages can contain file attachments. Image attachments show inline thumbnails, other files show filename + size with download link.

Design tone — YOU DECIDE:
- This is a modern professional messaging tool for talking to AI coworkers.
- Choose whatever visual tone fits best — it should feel as natural as using Slack or Teams.
- Light theme, dark theme, or mixed — your choice.
- Clean, fast, and functional. This is a tool people use frequently throughout the day.

Design priorities (in order):
1. The chat input must be immediately accessible — this is a messaging app.
2. Switching between conversations must be fast and obvious.
3. It should be clear who you're talking to (agent identity visible at all times).

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 참고사항
```
Mobile version (375x812) of the same page described above.

Same product context: a 1:1 chat interface where users have direct conversations with individual AI agents.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation. DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Mobile-specific behavior:
- Two views that toggle: Session List view and Chat view (not side-by-side)
- Session List: full-width list of past conversations with "New Chat" button
- Chat: full-width chat with a back arrow to return to session list
- Agent selection: full-screen modal with search

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `chat-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `session-panel` | 세션 패널 컨테이너 | 세션 목록 영역 |
| `session-item` | 세션 항목 | 개별 세션 클릭 |
| `session-new-btn` | 새 대화 버튼 | 에이전트 모달 열기 |
| `session-rename-btn` | 이름 변경 버튼 | 세션 이름 변경 |
| `session-delete-btn` | 삭제 버튼 | 세션 삭제 |
| `chat-area` | 채팅 영역 컨테이너 | 메시지 표시 |
| `chat-header` | 채팅 헤더 | 에이전트 정보 표시 |
| `chat-message-user` | 유저 메시지 | 유저 메시지 확인 |
| `chat-message-agent` | AI 메시지 | AI 응답 확인 |
| `chat-input` | 입력 필드 (Input 컴포넌트) | 메시지 입력 |
| `chat-send-btn` | 전송 버튼 | 메시지 전송 |
| `chat-empty-state` | 빈 상태 | 세션 미선택 시 |
| `chat-back-btn` | 뒤로가기 (모바일) | 세션 목록 복귀 |
| `agent-modal` | 에이전트 선택 모달 | 모달 표시 확인 |
| `agent-modal-search` | 모달 검색 | 에이전트 검색 |
| `agent-modal-item` | 에이전트 항목 | 에이전트 선택 |
| `chat-loading-skeleton` | 로딩 스켈레톤 | 메시지 로딩 중 |
| `chat-error` | 에러 메시지 | API 실패 시 |
| `chat-retry-btn` | 재시도 버튼 | 에러 시 재시도 |
| `chat-stop-btn` | 스트리밍 중지 버튼 | 스트리밍 중 중지 |
| `chat-file-attach-btn` | 파일 첨부 버튼 | 파일 선택 트리거 |
| `chat-file-preview` | 입력 영역 첨부 미리보기 | 전송 전 파일 확인 |
| `chat-message-file` | 메시지 내 첨부 파일 | 보낸/받은 파일 표시 |
| `chat-tool-call-card` | 도구 호출 카드 | 에이전트 도구 사용 표시 |
| `chat-connection-banner` | 연결 상태 배너 | 끊김/재연결 알림 |
| `chat-delegation-toggle` | 위임 내역 토글 | 채팅/위임 뷰 전환 |
| `chat-delegation-panel` | 위임 내역 패널 | 위임 목록 표시 |
| `chat-delegation-item` | 위임 항목 | 개별 위임 내역 |
| `session-menu-btn` | 세션 ··· 메뉴 버튼 | 세션 관리 메뉴 열기 |
| `session-group-header` | 날짜 그룹 헤더 | 그룹 접기/펼치기 |
| `session-confirm-delete` | 삭제 확인 다이얼로그 | 삭제 재확인 |
| `session-empty-state` | 세션 없음 상태 | 대화 없을 때 안내 |
| `chat-typing-indicator` | 타이핑 인디케이터 | AI 응답 대기 중 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 | 테스트 유형 |
|---|--------|------|----------|-----------|
| 1 | 페이지 로드 | /chat 접속 | `chat-page` 존재, 로그인 안 튕김 | E2E |
| 2 | 세션 목록 표시 | 로드 완료 | `session-panel` + 세션 항목들 표시 | E2E |
| 3 | 세션 선택 | 세션 클릭 | `chat-area`에 메시지 표시, URL 업데이트 | E2E |
| 4 | 새 대화 | + 버튼 클릭 | `agent-modal` 표시 | E2E |
| 5 | 에이전트 선택 | 모달에서 에이전트 클릭 | 새 세션 생성, 채팅 시작 | E2E |
| 6 | 메시지 입력 | textarea에 텍스트 입력 | 전송 버튼 활성화 | E2E |
| 7 | 메시지 전송 | 텍스트 입력 후 전송 | 유저 메시지 말풍선 추가 | E2E |
| 8 | 빈 전송 방지 | 빈 텍스트로 전송 시도 | 전송 버튼 비활성화 | E2E |
| 9 | 모바일 뷰 전환 | 375px에서 세션 클릭 | 채팅 뷰로 전환, 뒤로가기 버튼 표시 | E2E |
| 10 | 모바일 뒤로가기 | 뒤로 버튼 클릭 | 세션 목록으로 복귀 | E2E |
| 11 | 반응형 | 375px 뷰포트 | 1컬럼 레이아웃 | E2E |
| 12 | 세션 메뉴 | ··· 버튼 클릭 | 이름 변경/삭제 메뉴 표시 | E2E |
| 13 | 세션 삭제 확인 | 삭제 클릭 | 확인 다이얼로그 표시 | E2E |
| 14 | 세션 이름 변경 | 이름 변경 클릭 후 입력 | 인라인 입력 표시, Enter로 확정 | E2E |
| 15 | 날짜 그룹 접기 | 그룹 헤더 클릭 | 해당 그룹 접힘/펼침 | E2E |
| 16 | 파일 첨부 | 📎 버튼 클릭 후 파일 선택 | 미리보기 칩 표시 | E2E |
| 17 | 에러 재시도 | 에러 발생 후 재시도 클릭 | 마지막 메시지 재전송 | Mock필요 (API 에러 시뮬레이션) |
| 18 | 빈 상태 (세션 없음) | 세션 0개일 때 | `session-empty-state` 표시 | E2E (신규 계정) |
| 19 | 스트리밍 중지 | 전송 후 중지 버튼 클릭 | 스트리밍 중단, 전송 버튼 복귀 | E2E (타이밍 주의) |
| 20 | 도구 호출 카드 | 도구 사용 에이전트 메시지 확인 | `chat-tool-call-card` 표시 | E2E (데이터 의존) |
| 21 | 위임 패널 전환 | 위임 탭 클릭 (비서 에이전트) | `chat-delegation-panel` 표시 | E2E (비서 에이전트 필요) |
| 22 | 타이핑 인디케이터 | 메시지 전송 후 대기 | `chat-typing-indicator` 표시 | E2E (타이밍 민감, waitFor 사용) |
| 23 | 연결 상태 배너 | WebSocket 끊김 시 | `chat-connection-banner` 표시 | Mock필요 (WS 끊김 시뮬레이션) |
