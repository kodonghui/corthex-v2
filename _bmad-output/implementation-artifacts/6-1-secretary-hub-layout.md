# Story 6.1: 비서 있음 레이아웃 (풀 위드 채팅)

Status: done

## Story

As a CEO,
I want 비서가 있으면 채팅 입력만으로 모든 명령을 내릴 수 있는 것을,
so that 에이전트를 일일이 선택하지 않아도 된다.

## Acceptance Criteria

1. `hasSecretary: boolean` 상태에 따라 레이아웃 분기 — 비서 있음 시 풀 위드 채팅 레이아웃
2. 비서 있음: 채팅 영역 풀 위드 (에이전트 목록 숨김) — 전체 화면 채팅
3. SSE 스트리밍: `POST /api/workspace/hub/stream` → accepted→processing→handoff→message→error→done UI 상태 반영
4. 핸드오프 트래커: 실시간 "비서실장 → CMO → 콘텐츠전문가" 위임 체인 표시
5. 마크다운 렌더링 (v1 호환)
6. 파일 첨부 (v1 호환)
7. 기존 Command Center 페이지(`/command-center`)를 비서 유무에 따라 분기하는 Hub 페이지로 전환

## Tasks / Subtasks

- [x] Task 1: Hub 페이지 컴포넌트 생성 + 비서 유무 분기 (AC: #1, #7)
  - [x] 1.1 `packages/app/src/pages/hub/index.tsx` — Hub 페이지 진입점
  - [x] 1.2 비서 유무 판단: `/api/workspace/agents` 호출 → `isSecretary: true` 에이전트 존재 여부
  - [x] 1.3 `hasSecretary: true` → `SecretaryHubLayout` 렌더링
  - [x] 1.4 `hasSecretary: false` → 기존 CommandCenterPage 또는 Story 6.2 레이아웃 (6.2에서 구현)
  - [x] 1.5 라우터 업데이트: `/command-center` 경로를 Hub 페이지로 변경 (App.tsx)

- [x] Task 2: SecretaryHubLayout 풀 위드 채팅 컴포넌트 (AC: #2)
  - [x] 2.1 `packages/app/src/pages/hub/secretary-hub-layout.tsx` 생성
  - [x] 2.2 풀 위드 레이아웃: `flex flex-col h-full` — 헤더 + 메시지 리스트 + 입력 영역
  - [x] 2.3 헤더: 비서 에이전트 이름, 연결 상태, 위임 체인 트래커
  - [x] 2.4 빈 상태: 비서 소개 + 예시 명령 카드 (슬래시 명령어, @멘션 예시)

- [x] Task 3: Hub SSE 스트리밍 연동 (AC: #3)
  - [x] 3.1 `packages/app/src/hooks/use-hub-stream.ts` — `POST /api/workspace/hub/stream` SSE 클라이언트
  - [x] 3.2 SSE 이벤트 파싱: `accepted`, `processing`, `handoff`, `message` (token), `error`, `done`
  - [x] 3.3 UI 상태 매핑: 각 이벤트 → 로딩 스피너, 에이전트 이름, 스트리밍 텍스트, 에러 배너, 완료
  - [x] 3.4 세션 관리: sessionId 유지 (첫 요청 시 서버에서 생성, 이후 재사용)

- [x] Task 4: 핸드오프 트래커 UI (AC: #4)
  - [x] 4.1 `packages/app/src/pages/hub/handoff-tracker.tsx` — 위임 체인 시각화
  - [x] 4.2 실시간 위임 체인: "비서실장 → CMO → 콘텐츠전문가" 형태
  - [x] 4.3 각 단계 상태: delegating(파랑 점 pulse), completed(초록), failed(빨강)
  - [x] 4.4 병렬 위임: 여러 에이전트 동시 위임 시 그리드 표시

- [x] Task 5: 마크다운 렌더링 + 파일 첨부 (AC: #5, #6)
  - [x] 5.1 메시지 렌더링: 기존 `ChatArea` 컴포넌트의 마크다운/링크 렌더링 로직 재사용
  - [x] 5.2 파일 첨부: `POST /api/workspace/files` 업로드 → attachmentIds 포함하여 전송
  - [x] 5.3 첨부 파일 미리보기: 이미지 인라인, 일반 파일 아이콘+이름+크기

- [x] Task 6: 메시지 기록 로딩 (기존 API 활용)
  - [x] 6.1 초기 로드: 최근 메시지 50건 표시
  - [x] 6.2 이전 메시지: 위로 스크롤 시 페이지네이션 (`before` 파라미터)
  - [x] 6.3 자동 스크롤: 새 메시지/스트리밍 시 하단으로

## Dev Notes

### 핵심 아키텍처

이 스토리는 **프론트엔드 전용**이다. 백엔드(`hub.ts` SSE 엔드포인트)는 Story 4.1에서 이미 구현 완료.

**Hub SSE 엔드포인트**: `POST /api/workspace/hub/stream`
- Request body: `{ message: string, sessionId?: string, agentId?: string }`
- Response: SSE stream with events: `accepted`, `processing`, `handoff`, `message`, `error`, `done`
- 비서 자동 해결: agentId 없고 @멘션 없으면 → isSecretary 에이전트 자동 선택

**SSE 이벤트 → UI 매핑** (architecture E5 기반):
- `accepted` → "명령 접수됨" + 로딩 스피너
- `processing` → "비서실장 분석 중..." + 에이전트 이름
- `handoff` → 트래커 업데이트 (from → to 에이전트)
- `message` → 스트리밍 텍스트 표시 (token by token)
- `error` → 에러 배너 (코드 + 한국어 메시지)
- `done` → 비용 표시 + 스피너 종료

### 기존 코드 재사용 (절대 중복 금지)

1. **`use-chat-stream.ts`** — WebSocket 기반 스트리밍 훅. Hub는 SSE 기반이므로 **별도 훅** 필요하지만 상태 구조(streamingText, isStreaming, toolCalls, delegationStatus 등) 참고.
2. **`ChatArea` 컴포넌트** (`packages/app/src/components/chat/chat-area.tsx`) — 메시지 렌더링, 파일 첨부, 위임 표시 등 900줄. **직접 임포트하지 말고** 유틸 함수(renderTextWithLinks, formatBytes 등)만 추출하여 공유 모듈로 분리.
3. **`command-store.ts`** — CommandMessage 타입, delegation 상태 관리. Hub용 별도 store 또는 확장.
4. **`use-command-center.ts`** — WebSocket 구독 기반 명령 관리. Hub는 SSE 직접 연결이므로 참고만.

### 새로 만들 파일

```
packages/app/src/
├── pages/hub/
│   ├── index.tsx                    # Hub 페이지 진입점 (비서 유무 분기)
│   └── secretary-hub-layout.tsx     # 비서 있음: 풀 위드 채팅
├── hooks/
│   └── use-hub-stream.ts            # SSE 스트리밍 훅
└── pages/hub/
    └── handoff-tracker.tsx          # 위임 체인 시각화
```

### 기존 수정 파일

```
packages/app/src/App.tsx             # 라우터: /command-center → Hub 페이지로 변경
```

### SSE 클라이언트 구현 패턴

Hub SSE 스트리밍은 `EventSource`가 아닌 `fetch` + `ReadableStream` 사용 (POST 요청 필요):
```typescript
const response = await fetch('/api/workspace/hub/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ message, sessionId }),
})
const reader = response.body!.getReader()
const decoder = new TextDecoder()
// SSE 파싱: "event: xxx\ndata: {...}\n\n" 패턴
```

### 디자인 스펙

**색상 체계** (STYLE-GUIDE.md 기반):
- 배경: `bg-slate-900` (#0f172a)
- 카드/패널: `bg-slate-800` (#1e293b), border `border-slate-700`
- 사용자 메시지: `bg-blue-600` 오른쪽 정렬
- 에이전트 메시지: `bg-slate-800 border border-slate-700` 왼쪽 정렬
- 위임 상태: `text-blue-400 animate-pulse`
- 에러: `bg-red-950/30 border border-red-900/30 text-red-300`
- 연결 상태: `bg-emerald-500/10 text-emerald-400`

**타이포그래피**:
- 페이지 제목: `text-3xl font-black tracking-tight text-white`
- 메시지: `text-sm text-slate-200`
- 시간: `text-xs text-slate-500`
- 상태 텍스트: `text-xs font-medium`

**레이아웃**:
- 전체: `flex flex-col h-full`
- 헤더: 고정, `px-6 py-4 border-b border-slate-800/80`
- 메시지 영역: `flex-1 overflow-y-auto px-4 py-3 space-y-4`
- 입력: 하단 고정, `border-t border-slate-700 bg-slate-900 px-4 py-3`

### API 엔드포인트 참조

| 엔드포인트 | 메서드 | 용도 |
|---|---|---|
| `/api/workspace/hub/stream` | POST | SSE 스트리밍 (핵심) |
| `/api/workspace/agents` | GET | 에이전트 목록 (비서 판단용) |
| `/api/workspace/files` | POST | 파일 업로드 |
| `/api/workspace/files/:id/download` | GET | 파일 다운로드 |
| `/api/workspace/chat/sessions` | GET/POST | 세션 목록/생성 |
| `/api/workspace/chat/sessions/:id/messages` | GET | 메시지 기록 |

### 금지 사항

- **ChatArea 직접 임포트 금지**: ChatArea는 agent-specific 채팅용. Hub는 별도 컴포넌트.
- **assistant-ui 라이브러리 사용 금지**: React 19 호환성 미확인. 직접 구현 (~300줄).
- **WebSocket 사용 금지**: Hub는 SSE 기반. WebSocket은 Story 6.5에서 전환.
- **stub/mock 금지**: 실제 SSE 연결, 실제 메시지 렌더링, 실제 파일 첨부.

### 이전 스토리 인텔리전스

**Epic 5 학습 포인트**:
- Soul 템플릿: secretary soul이 이미 위임+품질게이트 지원 (`soul-templates.ts`)
- call_agent: SDK 내장 도구, 별도 구현 불필요
- `use-chat-stream.ts`: delegation-start/end/chain 이벤트 처리 패턴 참고
- `renderTextWithLinks()`: ChatArea에 있는 마크다운 링크 렌더러 — 공유 유틸로 추출 가능
- `formatBytes()`: 파일 크기 포맷터 — 공유 유틸로 추출 가능

**최근 커밋 패턴**:
- 파일 위치: `packages/server/src/engine/`, `packages/app/src/`
- 테스트: `bun:test` 프레임워크, `packages/server/src/__tests__/unit/`
- 커밋 메시지: `feat: Story X.Y 제목 — 설명`

### Project Structure Notes

- Hub 페이지는 `packages/app/src/pages/hub/` 디렉토리에 생성 (기존 command-center와 분리)
- 라우트 경로 `/command-center`를 Hub로 변경 (App.tsx)
- 공유 유틸은 `packages/app/src/lib/` 또는 `packages/app/src/utils/`에 배치

### References

- [Source: packages/server/src/routes/workspace/hub.ts] — SSE 엔드포인트 전체
- [Source: packages/app/src/hooks/use-chat-stream.ts] — 스트리밍 상태 관리 패턴
- [Source: packages/app/src/components/chat/chat-area.tsx] — 채팅 UI 구조 (900줄)
- [Source: packages/app/src/pages/command-center/index.tsx] — 현재 커맨드센터 (대체 대상)
- [Source: packages/app/src/stores/command-store.ts] — 명령 상태 관리
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 6] — Epic 6 요구사항
- [Source: _bmad-output/planning-artifacts/architecture.md] — SSE 이벤트 스펙 (E5)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created
- Hub 페이지 생성: `/command-center` 경로에서 비서 유무 자동 감지 후 레이아웃 분기
- SecretaryHubLayout: 풀 위드 채팅 UI — 헤더(비서 이름/연결 상태) + 메시지 리스트 + 입력 영역
- use-hub-stream.ts: SSE 기반 스트리밍 훅 — fetch + ReadableStream으로 POST SSE 구현
- HandoffTracker: 위임 체인 시각화 (delegating/completed/failed 상태 + 병렬 위임)
- 마크다운 링크 렌더링, 파일 첨부 업로드/미리보기, 메시지 기록 페이지네이션 모두 구현
- 16개 단위 테스트 작성 (SSE 파싱, 핸드오프 체인 추적, 스트림 상태 전이)
- TypeScript 컴파일 에러 0건 (app + server 모두)

### Change Log

- 2026-03-11: Story 6.1 구현 완료 — Hub 페이지 + SecretaryHubLayout + SSE 스트리밍 + 핸드오프 트래커

### File List

**New files:**
- packages/app/src/pages/hub/index.tsx
- packages/app/src/pages/hub/secretary-hub-layout.tsx
- packages/app/src/pages/hub/handoff-tracker.tsx
- packages/app/src/hooks/use-hub-stream.ts
- packages/app/src/__tests__/hub-stream.test.ts

**Modified files:**
- packages/app/src/App.tsx (route: /command-center → HubPage)
