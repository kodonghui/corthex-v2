# Story 10.2: 전략실 채팅 에이전트 — 종목 컨텍스트 채팅 + 스트리밍

Status: review

## Story

As a 일반 직원(유저),
I want 전략실에서 선택한 종목에 대해 AI 에이전트와 실시간 스트리밍 채팅을 할 수 있다,
so that 투자 전략을 논의하고 종목 분석을 받을 수 있다.

## Acceptance Criteria

1. **Given** 전략실 채팅 패널 **When** 표시 **Then** 재무팀장 에이전트가 기본 선택되고, 세션이 없으면 자동 생성
2. **Given** 채팅 세션 활성 **When** 메시지 입력 + 전송 **Then** 기존 ChatArea와 동일한 스트리밍 UI (토큰 단위, 커서 깜빡임)
3. **Given** 종목 선택 상태 **When** 메시지 전송 **Then** 시스템 프롬프트에 선택 종목(코드+이름) 컨텍스트 포함
4. **Given** 종목 변경 **When** 다른 종목 선택 **Then** 기존 세션 유지하되, 다음 메시지부터 새 종목 컨텍스트 반영
5. **Given** 채팅 영역 **When** 도구 사용(get_stock_price 등) **Then** ToolCallCard로 도구 호출 결과 표시
6. **Given** 모바일 **When** 채팅 탭 선택 **Then** 전체 높이 채팅 영역 표시
7. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 서버 — 전략 채팅 컨텍스트 API (AC: #3, #4)
  - [x] `packages/server/src/routes/workspace/strategy.ts`에 POST `/strategy/chat/sessions` 추가
    - body: `{ stockCode?: string }` — 선택 종목 컨텍스트
    - 재무팀장 에이전트 자동 선택 (agent.departmentId = 재무팀, 없으면 첫 번째 비서 아닌 에이전트)
    - chatSessions 생성 + 세션 metadata에 stockCode 저장
  - [x] `packages/server/src/routes/workspace/strategy.ts`에 PATCH `/strategy/chat/sessions/:id/context` 추가
    - body: `{ stockCode: string }` — 종목 컨텍스트 업데이트
  - [x] GET `/strategy/chat/session` — 전략 세션 조회 (metadata 포함)
  - [x] ai.ts `generateAgentResponseStream`에 전달하는 시스템 프롬프트에 종목 컨텍스트 주입 로직

- [x] Task 2: DB — chatSessions에 metadata 컬럼 추가 (AC: #3)
  - [x] `packages/server/src/db/schema.ts` chatSessions 테이블에 `metadata: jsonb('metadata')` 추가
  - [x] Drizzle 마이그레이션 0012 생성
  - [x] ai.ts에서 세션 metadata 읽어서 시스템 프롬프트에 종목 컨텍스트 포함

- [x] Task 3: 프론트엔드 — StrategyChatPanel 구현 (AC: #1, #2, #5, #6)
  - [x] `packages/app/src/components/strategy/chat-panel.tsx` 리팩토링
    - 세션 자동 생성/조회 로직 (react-query + mutation)
    - 기존 ChatArea 컴포넌트 재사용 (sessionId, agentId props)
    - URL searchParams에서 stockCode 읽어 세션 컨텍스트 자동 업데이트
  - [x] 모바일 탭 전환 시 채팅 영역 전체 높이 유지

- [x] Task 4: 빌드 확인 (AC: #7)
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### 핵심 설계: 기존 인프라 100% 재사용

채팅 인프라(ChatArea, useChatStream, ws-store, ai.ts)는 이미 완성되어 있음.
이 스토리의 핵심은 **ChatPanel placeholder를 실제 ChatArea로 교체**하고, **종목 컨텍스트를 시스템 프롬프트에 주입**하는 것.

### 기존 채팅 흐름 (참조)
```
1. POST /workspace/chat/sessions → { agentId } → session 생성
2. POST /workspace/chat/sessions/:id/messages → { content } → 유저 메시지 저장
3. 서버: generateAgentResponseStream → WS broadcastToChannel('chat-stream::sessionId', event)
4. 프론트: useChatStream 훅이 token/tool-start/tool-end/done 이벤트 처리
5. ChatArea 컴포넌트가 스트리밍 텍스트 + ToolCallCard 렌더링
```

### 종목 컨텍스트 주입 방법
chatSessions에 `metadata` JSONB 컬럼 추가:
```json
{ "stockCode": "005930", "stockName": "삼성전자" }
```
ai.ts에서 세션 metadata 읽어서 시스템 프롬프트 앞에 삽입:
```
현재 사용자가 보고 있는 종목: 삼성전자 (005930, KOSPI)
이 종목에 대한 질문에 우선적으로 답변해주세요.
```

### 재무팀장 에이전트 자동 선택
seed.ts에 이미 재무팀장(재무팀 소속) 에이전트가 있음.
strategy.ts에서 `agents` 테이블 쿼리: `departmentId = 재무팀.id AND isSecretary = false`

### ChatArea 재사용 패턴
chat-area.tsx의 ChatArea 컴포넌트는 `sessionId` + `agentId`를 받아서 독립적으로 동작:
- 메시지 조회/전송
- 스트리밍 구독
- 도구 호출 카드

### 파일 구조
```
수정 파일:
  packages/server/src/db/schema.ts (chatSessions metadata 추가)
  packages/server/src/routes/workspace/strategy.ts (채팅 세션 API 추가)
  packages/server/src/lib/ai.ts (종목 컨텍스트 시스템 프롬프트)
  packages/app/src/components/strategy/chat-panel.tsx (실제 채팅 구현)
  packages/app/src/pages/trading.tsx (selectedStock prop 전달)
신규 파일:
  packages/server/src/db/migrations/0012_*.sql (metadata 마이그레이션)
```

### 이 스토리에서 하지 않는 것
- 전략 채팅 전용 도구 추가 (기존 get_stock_price 등 도구로 충분)
- 채팅 히스토리 별도 관리 (기존 chat 페이지와 동일 세션 시스템)
- 멀티 에이전트 전환 (재무팀장 고정)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- Task 2: chatSessions.metadata JSONB 컬럼 추가 + migration 0012
- Task 1: strategy.ts에 GET /chat/session, POST /chat/sessions, PATCH /chat/sessions/:id/context 3개 엔드포인트 추가
- Task 1: ai.ts generateAgentResponseStream에서 세션 metadata 읽어 종목 컨텍스트 시스템 프롬프트 주입
- Task 3: ChatPanel을 ChatArea 재사용으로 교체, 세션 자동 생성/조회, 종목 컨텍스트 자동 업데이트
- Task 4: turbo build 3/3 성공

### File List

- packages/server/src/db/schema.ts (수정 — chatSessions.metadata 추가)
- packages/server/src/db/migrations/0012_chat-session-metadata.sql (신규)
- packages/server/src/lib/ai.ts (수정 — 종목 컨텍스트 시스템 프롬프트 주입)
- packages/server/src/routes/workspace/strategy.ts (수정 — 채팅 세션 API 3개 추가)
- packages/app/src/components/strategy/chat-panel.tsx (수정 — ChatArea 재사용 채팅)
