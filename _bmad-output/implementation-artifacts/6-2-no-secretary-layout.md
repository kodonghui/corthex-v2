# Story 6.2: 비서 없음 레이아웃 (에이전트 선택 + 채팅)

Status: done

## Story

As a 사용자 (비서 미설정),
I want 에이전트 목록에서 선택하여 직접 대화하는 것을,
so that 비서 없이도 AI를 사용할 수 있다.

## Acceptance Criteria

1. **좌측 패널: 에이전트 목록 (부서별 그룹핑)**
   - Given 비서가 설정되지 않은 회사의 사용자가 Hub 페이지에 접속했을 때
   - When 페이지가 로드되면
   - Then 좌측에 에이전트 목록 패널(w-72)이 부서별로 그룹핑되어 표시된다
   - And 각 부서 그룹은 접힘/펼침 가능하다

2. **50+ 에이전트 시 부서별 접힘/펼침 + lastUsedAt 정렬**
   - Given 에이전트가 50개 이상일 때
   - When 에이전트 목록이 렌더링되면
   - Then 부서별로 접힘/펼침(collapsible accordion)이 적용된다
   - And 각 부서 내 에이전트는 lastUsedAt(최근 사용순) 내림차순 정렬된다
   - And 사용 기록 없는 에이전트는 이름 가나다순 정렬된다

3. **에이전트 선택 → 우측 채팅 영역에서 대화**
   - Given 사용자가 에이전트를 클릭했을 때
   - When 에이전트가 선택되면
   - Then 우측 채팅 영역에 해당 에이전트와의 대화 인터페이스가 표시된다
   - And Hub SSE 스트리밍(`/api/workspace/hub/stream`)에 `agentId` 파라미터가 전달된다

4. **에이전트 아바타, 이름, 소속 부서 표시**
   - Given 에이전트 목록 항목이 표시될 때
   - When 각 에이전트 카드가 렌더링되면
   - Then 이니셜 아바타(bg-slate-700 rounded-full), 이름(font-medium text-slate-200), 소속 부서(text-xs text-slate-400), 상태 dot이 표시된다

5. **검색/필터 기능**
   - Given 사용자가 에이전트를 찾고 싶을 때
   - When 검색 입력란에 텍스트를 입력하면
   - Then 에이전트 이름, 역할, 부서명으로 실시간 필터링된다
   - And 3명 이하일 때는 검색 필드가 비활성화된다

## Tasks / Subtasks

- [x] Task 1: Hub 페이지 `hasSecretary` 분기 로직 구현 (AC: #1, #3)
  - [x] 1.1: `/workspace/org-chart` API에서 `hasSecretary` 상태 가져오기 (기존 orgData 활용)
  - [x] 1.2: Hub 진입점 페이지 생성 (`packages/app/src/pages/hub.tsx`) — `hasSecretary` 분기
  - [x] 1.3: `hasSecretary === false`일 때 에이전트 선택 + 채팅 레이아웃 렌더링
  - [x] 1.4: `hasSecretary === true`일 때 기존 CommandCenter 레이아웃 (Story 6.1 대상, 이 스토리에서는 fallback만)

- [x] Task 2: 에이전트 선택 패널 (좌측 사이드) 구현 (AC: #1, #2, #4, #5)
  - [x] 2.1: `AgentPickerPanel` 컴포넌트 생성 (`packages/app/src/components/hub/agent-picker-panel.tsx`)
  - [x] 2.2: 에이전트 목록 부서별 그룹핑 로직 (departments → agents 매핑)
  - [x] 2.3: 부서별 접힘/펼침 accordion UI
  - [x] 2.4: lastUsedAt 정렬 로직 (세션 데이터 기반)
  - [x] 2.5: 검색/필터 기능 (이름, 역할, 부서명)
  - [x] 2.6: 에이전트 카드 UI (이니셜 아바타 + 상태 dot + 이름 + 부서)

- [x] Task 3: 채팅 영역 통합 (AC: #3)
  - [x] 3.1: 기존 `ChatArea` 컴포넌트 재사용 (packages/app/src/components/chat/chat-area.tsx)
  - [x] 3.2: 에이전트 선택 시 세션 생성/기존 세션 선택 로직 (기존 chat.tsx 패턴 차용)
  - [x] 3.3: Hub SSE 스트리밍에 agentId 파라미터 전달 연동

- [x] Task 4: 라우팅 + 통합 (AC: #1~#5)
  - [x] 4.1: App.tsx에 `/hub` 라우트 추가
  - [x] 4.2: 사이드바에 Hub 네비게이션 항목 추가
  - [x] 4.3: 모바일 반응형 (showChat 토글 패턴 — 기존 chat.tsx 참고)

## Dev Notes

### Architecture Patterns and Constraints

**비서 유무 분기 로직 (Architecture D11, FR11~20):**
- `hasSecretary: boolean` → Hub 레이아웃 분기
- 비서 없음 = 에이전트 선택(좌측 w-72 패널) + 채팅(우측 flex-1)
- 비서 있음 = 채팅만 (에이전트 목록 숨김) → Story 6.1 범위

**SSE 엔드포인트 (Story 4.1 구현 완료):**
- `POST /api/workspace/hub/stream` — `{ message, agentId?, sessionId? }`
- `agentId` 파라미터로 특정 에이전트 직접 지정 가능 (비서 우회)
- 비서 없음 레이아웃에서는 반드시 `agentId`를 전달해야 함

**기존 코드 재사용 가이드:**
- `ChatArea` 컴포넌트 (`packages/app/src/components/chat/chat-area.tsx`) — 채팅 영역 전체 재사용
- `AgentListModal` 컴포넌트 패턴 참고 — 에이전트 카드 UI, 상태 색상, 정렬 로직
- `SessionPanel` 컴포넌트 패턴 참고 — 날짜 그룹핑, 접힘/펼침 UI
- `useCommandCenter` hook 패턴 참고 — orgData 가져오기, WebSocket 구독
- `chat.tsx` 페이지 패턴 참고 — 세션 생성/선택, 모바일 토글, URL 동기화

**상태 관리:**
- TanStack Query: `/workspace/agents` (에이전트 목록), `/workspace/org-chart` (부서 + hasSecretary)
- TanStack Query: `/workspace/chat/sessions` (세션 목록)
- Zustand: 로컬 UI 상태만 (사이드바 열림/닫힘, 선택된 에이전트)

**데이터 흐름:**
1. Hub 페이지 로드 → orgData 가져오기 → `hasSecretary` 확인
2. `hasSecretary === false` → AgentPickerPanel + ChatArea 렌더링
3. 사용자가 에이전트 선택 → 기존 세션 확인 → 없으면 생성
4. ChatArea에 agent + sessionId 전달 → SSE 스트리밍 시작

### Project Structure Notes

**새로 생성할 파일:**
- `packages/app/src/pages/hub.tsx` — Hub 진입점 (비서 유무 분기)
- `packages/app/src/components/hub/agent-picker-panel.tsx` — 에이전트 선택 패널

**수정할 파일:**
- `packages/app/src/App.tsx` — `/hub` 라우트 추가
- `packages/app/src/components/sidebar.tsx` — Hub 네비게이션 항목 추가

**기존 파일 (참조만, 수정 불필요):**
- `packages/app/src/components/chat/chat-area.tsx` — 채팅 영역 (그대로 재사용)
- `packages/app/src/components/chat/types.ts` — Agent, Session 타입
- `packages/app/src/components/chat/agent-list-modal.tsx` — UI 패턴 참고
- `packages/app/src/pages/chat.tsx` — 세션 관리 패턴 참고
- `packages/server/src/routes/workspace/hub.ts` — SSE 엔드포인트 (이미 agentId 지원)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.2] — 요구사항 원문
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — 비서 유무 분기 아키텍처
- [Source: packages/server/src/routes/workspace/hub.ts] — SSE 스트리밍 엔드포인트 (agentId 지원 확인)
- [Source: packages/app/src/pages/chat.tsx] — 에이전트 선택 + 세션 관리 패턴
- [Source: packages/app/src/components/chat/agent-list-modal.tsx] — 에이전트 카드 UI 패턴
- [Source: packages/app/src/components/chat/session-panel.tsx] — 접힘/펼침 UI 패턴

### Technical Requirements

- React + Vite SPA (packages/app)
- TanStack Query for server state
- Zustand for local UI state
- Tailwind CSS styling (slate-900 기반 다크 테마)
- TypeScript strict mode
- 모바일 반응형 (md: breakpoint 기준)

### Library/Framework Requirements

- React 18+ (이미 설치됨)
- @tanstack/react-query (이미 설치됨)
- react-router-dom (이미 설치됨)
- Tailwind CSS (이미 설치됨)
- **추가 설치 불필요** — 모든 의존성이 이미 프로젝트에 존재

### File Structure Requirements

- 파일명: kebab-case lowercase
- 컴포넌트: PascalCase export
- 새 컴포넌트 디렉토리: `packages/app/src/components/hub/`
- 임포트: `git ls-files` 케이싱 정확히 맞추기 (Linux CI case-sensitive)

### Testing Requirements

- bun:test (server) — 이 스토리는 프론트엔드 전용이므로 서버 테스트 불필요
- 프론트엔드 data-testid 필수:
  - `hub-page` — 전체 페이지
  - `agent-picker-panel` — 에이전트 선택 패널
  - `agent-search-input` — 검색 입력란
  - `dept-group-{deptId}` — 부서 그룹
  - `agent-card-{agentId}` — 에이전트 카드
  - `hub-chat-area` — 채팅 영역

### Previous Story Intelligence

**Story 5.7 (자율 딥워크 + 품질 게이트) — 최근 완료:**
- deepwork 5-step 파이프라인 + quality gate 5-item QA + rework 구현
- 에이전트 루프에 deepwork 모드 추가
- 서버 코드 패턴: hook 기반 파이프라인

**Story 5.5 (기존 오케스트레이터 삭제):**
- 레거시 orchestrator 코드 제거, shared utilities 추출
- 정리 패턴: 미사용 코드 삭제 + 공유 유틸리티 분리

**기존 chat.tsx 페이지가 이 스토리의 핵심 참고 대상:**
- 이미 에이전트 선택 + 세션 기반 채팅이 구현되어 있음
- Hub의 "비서 없음" 레이아웃은 chat.tsx와 유사하되, Hub SSE 엔드포인트 사용 + 부서별 그룹핑이 차이점

### Git Intelligence

**최근 커밋 패턴:**
- `feat(engine): Story 5.5` — engine 스코프 사용
- `feat: Story 5.7 자율 딥워크` — 스코프 없는 feat도 사용
- 커밋 메시지: `feat: Story {N.M} {한국어 제목} — {영어 세부사항}`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- TypeScript compilation: `npx tsc --noEmit -p packages/app/tsconfig.json` — PASS (0 errors)
- TypeScript compilation: `npx tsc --noEmit -p packages/server/tsconfig.json` — PASS (0 errors)

### Completion Notes List

- Hub page (`hub.tsx`) created with `hasSecretary` branching logic using org-chart API data
- `AgentPickerPanel` component created with department grouping, collapsible accordion, lastUsedAt sorting, and search/filter
- Reused existing `ChatArea` component for the right-side chat interface
- Session creation/selection logic follows the same pattern as `chat.tsx`
- Mobile responsive: `showChat` toggle pattern hides picker on mobile when chat is active
- Added `/hub` route to App.tsx and sidebar navigation
- All required data-testid attributes applied: hub-page, agent-picker-panel, agent-search-input, dept-group-{id}, agent-card-{id}, hub-chat-area
- No new dependencies needed — all imports are existing packages
- Server SSE endpoint already supports `agentId` parameter (Story 4.1)

### Change Log

- 2026-03-11: Story 6.2 implementation complete — Hub no-secretary layout with agent picker + chat

### File List

- packages/app/src/pages/hub.tsx (NEW)
- packages/app/src/components/hub/agent-picker-panel.tsx (NEW)
- packages/app/src/App.tsx (MODIFIED — added HubPage lazy import + /hub route)
- packages/app/src/components/sidebar.tsx (MODIFIED — added Hub nav item)
