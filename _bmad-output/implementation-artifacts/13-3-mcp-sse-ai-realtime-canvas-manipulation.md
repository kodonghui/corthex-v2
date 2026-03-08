# Story 13.3: MCP SSE 연동 — AI 실시간 캔버스 조작

Status: review

## Story

As a CEO/Human 직원,
I want AI에게 "이 플로우의 병목을 찾아줘" 같은 자연어 명령을 내리면 캔버스에 노드가 실시간으로 추가/수정되기를,
so that AI와 함께 다이어그램을 그리며 대화할 수 있고, 변경사항을 즉시 확인하고 승인/거부할 수 있다.

## Acceptance Criteria (BDD)

### AC1: AI 캔버스 명령 API
- **Given** 인증된 사용자가 캔버스가 열린 상태에서
- **When** POST /workspace/sketches/ai-command 에 `{ sketchId, command: "DB 노드 추가해줘" }` 전송하면
- **Then** LLM Router로 명령을 해석하고, Mermaid 코드를 생성하고, WebSocket nexus 채널로 결과를 브로드캐스트한다

### AC2: WebSocket nexus 채널 실시간 캔버스 업데이트
- **Given** 사용자가 nexus 채널에 구독된 상태에서
- **When** AI가 canvas_update 이벤트를 발행하면
- **Then** 프론트엔드에서 AI 제안 Mermaid를 프리뷰로 표시하고 "적용" / "취소" 버튼을 보여준다

### AC3: AI 제안 적용/거부
- **Given** AI 프리뷰가 캔버스에 표시된 상태에서
- **When** "적용" 클릭하면 프리뷰 노드/엣지가 실제 캔버스에 반영되고
- **When** "취소" 클릭하면 원래 상태로 복원된다

### AC4: 캔버스 컨텍스트 전달
- **Given** 캔버스에 기존 노드/엣지가 있을 때
- **When** AI 명령을 전송하면
- **Then** 현재 캔버스의 Mermaid 표현이 LLM 프롬프트에 포함되어 AI가 기존 구조를 이해한다

### AC5: Undo/Redo 지원
- **Given** AI가 캔버스를 수정한 후
- **When** Undo 버튼을 클릭하면
- **Then** AI 수정 이전 상태로 복원되고, Redo로 다시 적용할 수 있다

### AC6: AI 명령 입력 UI
- **Given** SketchVibe 캔버스 페이지에서
- **When** AI 명령 입력란에 텍스트를 입력하고 전송하면
- **Then** 로딩 인디케이터가 표시되고, 결과가 프리뷰로 나타난다

### AC7: 테넌트 격리
- **Given** 멀티테넌트 환경에서
- **When** A 회사의 AI 명령이 실행되면
- **Then** A 회사의 nexus 채널에만 브로드캐스트되고, B 회사에는 영향 없다

## Tasks / Subtasks

- [x] Task 1: Canvas AI Service 구현 (AC: #1, #4)
  - [x] 1.1: `packages/server/src/services/canvas-ai.ts` — canvasAiService 생성
  - [x] 1.2: interpretCommand() — 자연어 → Mermaid 생성 (LLM Router 사용)
  - [x] 1.3: 시스템 프롬프트: 현재 캔버스 Mermaid + 명령 → 수정된 Mermaid 출력
  - [x] 1.4: canvasToMermaid (shared 패키지)로 현재 상태 직렬화

- [x] Task 2: AI Command API 엔드포인트 (AC: #1, #7)
  - [x] 2.1: POST /workspace/sketches/ai-command 라우트 추가 (sketches.ts에)
  - [x] 2.2: 요청 스키마: `{ sketchId: string, command: string }`
  - [x] 2.3: canvasAiService.interpretCommand() 호출
  - [x] 2.4: broadcastToCompany('nexus', ...) 로 결과 전송
  - [x] 2.5: 테넌트 격리 (companyId 기반)

- [x] Task 3: WebSocket nexus 채널 이벤트 정의 (AC: #2)
  - [x] 3.1: canvas_update 이벤트 타입 정의 `{ type: 'canvas_update', mermaid, description, commandId }`
  - [x] 3.2: canvas_ai_start 이벤트 (로딩 시작)
  - [x] 3.3: canvas_ai_error 이벤트 (오류 발생)

- [x] Task 4: 프론트엔드 AI 프리뷰 (AC: #2, #3, #5)
  - [x] 4.1: nexus.tsx에 AI 프리뷰 상태 관리 (previewNodes, previewEdges)
  - [x] 4.2: nexus 채널 WebSocket 메시지 수신 → Mermaid 파싱 → 프리뷰 렌더링
  - [x] 4.3: "적용" 클릭 → 프리뷰를 실제 노드/엣지에 반영
  - [x] 4.4: "취소" 클릭 → 프리뷰 제거, 원래 상태 유지
  - [x] 4.5: Undo 스택 — 적용 전 상태 저장, Undo/Redo 버튼

- [x] Task 5: AI 명령 입력 UI (AC: #6)
  - [x] 5.1: 캔버스 하단 또는 툴바에 AI 명령 입력란 추가
  - [x] 5.2: 로딩 인디케이터 (AI 처리 중)
  - [x] 5.3: Enter 키 전송 + 전송 버튼

- [x] Task 6: 테스트 (AC: 전체)
  - [x] 6.1: canvas-ai 서비스 단위 테스트
  - [x] 6.2: ai-command API 엔드포인트 테스트
  - [x] 6.3: WebSocket 이벤트 브로드캐스트 테스트
  - [x] 6.4: 테넌트 격리 테스트

## Dev Notes

### 핵심: v1 → v2 아키텍처 전환

v1은 별도 Python MCP 서버 + FastAPI SSE로 구현됐지만, v2는 이미 있는 WebSocket nexus 채널을 사용한다.

**v1 구조 (참고용):**
- `web/mcp_sketchvibe.py`: FastMCP 서버 — read_canvas, update_canvas, request_approval 도구
- `web/handlers/sketchvibe_handler.py`: FastAPI REST + SSE 브로드캐스트
- MCP → REST API(push-event) → SSE → 브라우저 실시간 렌더링

**v2 구조 (구현할 것):**
- `packages/server/src/services/canvas-ai.ts`: LLM Router로 자연어 → Mermaid 변환
- `packages/server/src/routes/workspace/sketches.ts`: ai-command 엔드포인트 추가
- WebSocket nexus 채널로 브로드캐스트 (SSE 대신 기존 WS 인프라 사용)
- 프론트엔드에서 WS 메시지 수신 → mermaidToCanvas → 프리뷰 렌더링

### 기존 코드 활용 (새로 만들지 말 것!)

1. **LLM Router**: `packages/server/src/services/llm-router.ts` — `llmRouter.call()` 사용. 이미 싱글턴 인스턴스 있음
2. **Mermaid 파서 (shared)**: `packages/shared/src/mermaid-parser.ts` — `parseMermaid()`, `canvasToMermaidCode()` 공용 함수
3. **Mermaid → Canvas (app)**: `packages/app/src/lib/mermaid-to-canvas.ts` — `mermaidToCanvas()` 프론트엔드용 래퍼
4. **Canvas → Mermaid (app)**: `packages/app/src/lib/canvas-to-mermaid.ts` — `canvasToMermaid()`, `canvasToText()` 함수
5. **WebSocket channels**: `packages/server/src/ws/channels.ts` — `broadcastToCompany(companyId, 'nexus', data)` 이미 구현됨
6. **nexus 채널 구독**: channels.ts:141-149 — companyId 기반 구독, 이미 구현됨
7. **sketches API**: `packages/server/src/routes/workspace/sketches.ts` — 기존 CRUD + import-mermaid. ai-command 여기에 추가
8. **NexusPage**: `packages/app/src/pages/nexus.tsx` — 캔버스 페이지. AI 입력/프리뷰 여기에 추가
9. **ChatArea**: `packages/app/src/components/chat/chat-area.ts` — 이미 canvasContext prop 받고 있음
10. **sketchVibeNodeTypes**: `packages/app/src/components/nexus/sketchvibe-nodes.tsx` — 8종 노드 타입 정의

### Canvas AI Service 설계

```typescript
// packages/server/src/services/canvas-ai.ts
import { llmRouter, type LLMRouterContext } from './llm-router'
import { canvasToMermaidCode } from '@corthex/shared'

export async function interpretCanvasCommand(params: {
  command: string
  currentGraphData: { nodes: any[]; edges: any[] }
  companyId: string
  userId: string
}): Promise<{ mermaid: string; description: string }> {
  // 1. 현재 캔버스 → Mermaid 직렬화
  // 2. LLM 프롬프트 구성 (시스템 프롬프트 + 사용자 명령)
  // 3. llmRouter.call() 호출
  // 4. LLM 응답에서 Mermaid 코드 추출
}
```

**시스템 프롬프트 핵심:**
```
당신은 SketchVibe 캔버스 AI 어시스턴트입니다.
사용자의 현재 캔버스 상태(Mermaid 형식)와 명령을 받으면, 수정된 전체 Mermaid 코드를 반환하세요.

지원 노드 타입: start([...]), end((....)), agent[...], system[[...]], api{{...}}, decide{...}, db[(...)]}, note>...]
엣지 형식: A -->|라벨| B

규칙:
- 기존 노드를 최대한 유지하고, 명령에 따라 추가/수정/삭제만 수행
- 응답은 ```mermaid ... ``` 블록 하나만 반환
- 한국어 라벨 사용
```

### WebSocket 이벤트 형식

```typescript
// canvas_ai_start — AI 처리 시작
{ type: 'canvas_ai_start', commandId: string, command: string }

// canvas_update — Mermaid 결과 도착
{ type: 'canvas_update', commandId: string, mermaid: string, description: string }

// canvas_ai_error — 오류 발생
{ type: 'canvas_ai_error', commandId: string, error: string }
```

### 프론트엔드 프리뷰 구현

1. nexus 채널 WS 메시지 수신 시:
   - `canvas_ai_start` → 로딩 상태 표시
   - `canvas_update` → `mermaidToCanvas(mermaid)` → 프리뷰 노드/엣지 계산
   - 프리뷰 노드에 시각적 구분 (파란 테두리 + 투명도)
2. "적용" → 현재 undo 스택에 기존 상태 push → 프리뷰를 실제 반영 → dirty 플래그
3. "취소" → 프리뷰 제거
4. Undo → undo 스택에서 pop → 복원

**Undo 스택 구조:**
```typescript
const [undoStack, setUndoStack] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([])
const [redoStack, setRedoStack] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([])
```

### API 엔드포인트 추가 위치

sketches.ts 파일 끝(223행 이후)에 추가:

```typescript
// POST /api/workspace/sketches/ai-command — AI 캔버스 명령
const aiCommandSchema = z.object({
  sketchId: z.string().optional(),
  command: z.string().min(1).max(2000),
  graphData: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }),
})
```

### WS 연결 — 프론트엔드 패턴

기존 useWebSocket 훅이 있다면 사용. 없으면 nexus.tsx에서 직접:
```typescript
// 기존 WS 인프라 활용 패턴 확인 필요
// packages/app/src/lib/ 또는 hooks/ 에서 WS 관련 코드 검색
```

### Project Structure Notes

```
packages/
├── server/src/
│   ├── services/
│   │   └── canvas-ai.ts              ← NEW: AI 캔버스 명령 해석 서비스
│   ├── routes/workspace/
│   │   └── sketches.ts               ← MODIFY: ai-command 엔드포인트 추가
│   └── __tests__/unit/
│       └── canvas-ai.test.ts         ← NEW: 서비스 + API 테스트
├── app/src/
│   └── pages/
│       └── nexus.tsx                 ← MODIFY: AI 입력 UI + 프리뷰 + Undo/Redo
└── shared/src/
    └── types.ts                      ← MODIFY: 캔버스 AI 이벤트 타입 추가 (필요 시)
```

### Architecture Compliance

- **API 응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
  - 주의: 기존 sketches.ts는 `{ data }` 형식 사용 중 → 동일 패턴 따를 것
- **테넌트 격리**: companyId 기반 — authMiddleware가 자동 주입
- **WebSocket**: broadcastToCompany(companyId, 'nexus', data) 사용
- **파일명**: kebab-case (canvas-ai.ts)
- **import 경로**: git ls-files 기준 실제 케이싱 일치
- **LLM 호출**: llmRouter.call() 사용, 직접 provider 호출 금지
- **비용 추적**: llmRouter 내부에서 자동 처리됨

### Library/Framework Requirements

- **신규 패키지 설치 불필요** — 모든 기능이 기존 의존성으로 구현 가능
- **@xyflow/react**: 이미 설치됨 — Node, Edge 타입
- **@tanstack/react-query**: 이미 설치됨 — useMutation 사용
- **@corthex/shared**: mermaid-parser 함수들 이미 있음
- **LLM Router**: 이미 구현됨 — 멀티 프로바이더 + 폴백

### Testing Requirements

- **테스트 프레임워크**: bun:test
- **테스트 파일**: `packages/server/src/__tests__/unit/canvas-ai.test.ts`
- **테스트 항목**:
  - canvas-ai 서비스: interpretCanvasCommand 함수 (LLM 응답 모킹)
  - ai-command API: 정상 요청/에러/빈 입력
  - WebSocket 브로드캐스트: canvas_update 이벤트가 nexus 채널로 전달
  - 테넌트 격리: companyId 다른 요청은 차단
  - Mermaid 파싱 오류 처리: LLM이 잘못된 Mermaid 반환 시 에러 처리
- **기존 테스트 regression 금지**: `bun test` 실행 시 기존 테스트 전부 통과해야 함

### v1 핵심 참조 파일

- `v1 MCP 서버`: `/home/ubuntu/CORTHEX_HQ/web/mcp_sketchvibe.py` — update_canvas(mermaid_code) 호출 구조
- `v1 SSE 핸들러`: `/home/ubuntu/CORTHEX_HQ/web/handlers/sketchvibe_handler.py` — push-event, SSE stream, 승인 플로우
- `v1 프론트엔드`: `/home/ubuntu/CORTHEX_HQ/web/static/js/corthex-app.js` — SSE 수신 + 프리뷰 렌더링

### Previous Story Intelligence (13-2)

- **mermaid-parser.ts**는 shared 패키지에 있음 — 서버/클라이언트 공용
- `parseMermaid()`: Mermaid 문자열 → ParsedNode[] + ParsedEdge[] (순수 데이터)
- `canvasToMermaidCode()`: 노드/엣지 배열 → Mermaid 문자열 (서버에서 사용 가능)
- 8종 노드 패턴 우선순위 중요: db `[(..)]` → end `((..))`→ start `([..])` → decide `{..}` → note `>..]` → system `[[..]]` → api `{{..}}` → agent `[..]`
- NODE_PATTERNS 순서 (긴 패턴부터 매칭)가 정확해야 함
- canvasToMermaid: end 노드는 `((..))`로 출력 (start `([..])` 과 구분)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 13 — E13-S3]
- [Source: v1 /home/ubuntu/CORTHEX_HQ/web/mcp_sketchvibe.py — MCP update_canvas 도구]
- [Source: v1 /home/ubuntu/CORTHEX_HQ/web/handlers/sketchvibe_handler.py — SSE 브로드캐스트]
- [Source: packages/server/src/ws/channels.ts — nexus 채널 구독/브로드캐스트]
- [Source: packages/server/src/services/llm-router.ts — LLM Router 싱글턴]
- [Source: packages/shared/src/mermaid-parser.ts — Mermaid 파서 공용]
- [Source: Story 13-2 — Mermaid 양방향 변환 구현 노트]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References
- extractMermaidFromResponse: regex for ```mermaid blocks and <!-- 설명: --> comment pattern
- AI preview in nexus.tsx: ReactFlow renders preview nodes when aiPreview state is set, disables interaction during preview
- Undo/Redo: 20-entry stack limit, stores clean snapshots before AI apply

### Completion Notes List
- Canvas AI Service: interpretCanvasCommand() uses LLM Router with specialized system prompt for Mermaid generation
- AI Command API: POST /workspace/sketches/ai-command with Zod validation, tenant isolation via authMiddleware
- WebSocket events: 3 event types (canvas_ai_start, canvas_update, canvas_ai_error) broadcast via nexus channel
- Frontend AI preview: ReactFlow shows AI-proposed nodes/edges with apply/cancel overlay
- Undo/Redo: 20-entry undo stack for AI modifications
- AI command input: Bottom toolbar with text input, Enter key send, loading indicator
- 23 tests passing, 0 regressions (62 existing mermaid tests still pass)
- All 7 ACs satisfied

### File List
- `packages/server/src/services/canvas-ai.ts` — NEW: Canvas AI service (interpretCanvasCommand, extractMermaidFromResponse)
- `packages/server/src/routes/workspace/sketches.ts` — MODIFIED: ai-command endpoint added
- `packages/app/src/pages/nexus.tsx` — MODIFIED: AI command input, preview overlay, undo/redo, WebSocket nexus listener
- `packages/server/src/__tests__/unit/canvas-ai.test.ts` — NEW: 23 tests
