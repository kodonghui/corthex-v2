# Story 13.5: SketchVibe UI 통합 (사령관실 연동)

Status: done

## Story

As a CEO/Human 직원,
I want 사령관실에서 `/스케치` 명령으로 다이어그램을 생성하고, 결과를 미리보고, SketchVibe 에디터로 열 수 있기를,
so that 사령관실에서 벗어나지 않고도 AI와 함께 다이어그램을 빠르게 만들고 관리할 수 있다.

## Acceptance Criteria (BDD)

### AC1: `/스케치` 슬래시 명령 등록
- **Given** 사령관실 입력 바에서 `/`를 입력하면
- **When** 슬래시 명령 자동완성 팝업이 표시되고
- **Then** `/스케치 [설명]` 항목이 아이콘(🎨)과 함께 표시된다
- **And** 선택 시 `/스케치 ` 텍스트가 입력 바에 자동 완성된다

### AC2: `/스케치` 명령 서버 라우팅
- **Given** 사용자가 `/스케치 데이터베이스 아키텍처 그려줘`를 전송하면
- **When** command-router가 slashType='sketch'로 분류하고
- **Then** 새 command 레코드가 DB에 생성되고
- **And** canvas-ai 서비스의 `interpretCanvasCommand`가 호출되어 자연어 → Mermaid 코드를 생성한다

### AC3: 다이어그램 미리보기 카드
- **Given** `/스케치` 명령의 AI 처리가 완료되면
- **When** 사령관실 메시지 목록에 결과가 표시될 때
- **Then** Mermaid 코드가 Cytoscape 다이어그램 미리보기 카드로 렌더링된다
- **And** 카드에는 "SketchVibe에서 열기", "저장", "Mermaid 복사" 버튼이 표시된다

### AC4: SketchVibe 에디터로 열기
- **Given** 다이어그램 미리보기 카드에서
- **When** "SketchVibe에서 열기" 버튼을 클릭하면
- **Then** 사이드 네비게이션에서 SketchVibe 페이지로 이동하고
- **And** 캔버스에 해당 다이어그램이 자동으로 로드된다 (URL 파라미터 또는 세션 스토리지)

### AC5: 직접 저장
- **Given** 다이어그램 미리보기 카드에서
- **When** "저장" 버튼을 클릭하면
- **Then** 이름 입력 다이얼로그가 표시되고 (기본값: AI 생성 설명 요약)
- **And** 확인 시 POST /workspace/sketches로 새 스케치가 생성된다
- **And** 성공 토스트 "스케치가 저장되었습니다" 표시

### AC6: Mermaid 코드 클립보드 복사
- **Given** 다이어그램 미리보기 카드에서
- **When** "Mermaid 복사" 버튼을 클릭하면
- **Then** 생성된 Mermaid 코드가 클립보드에 복사되고
- **And** 성공 토스트 "Mermaid 코드가 복사되었습니다" 표시

### AC7: WebSocket 실시간 상태 표시
- **Given** `/스케치` 명령이 처리 중일 때
- **When** nexus 채널에서 `canvas_ai_start` 이벤트가 도착하면
- **Then** 사령관실 메시지 목록에 "다이어그램 생성 중..." 로딩 카드가 표시된다
- **And** `canvas_update` 이벤트가 도착하면 로딩 카드가 미리보기 카드로 교체된다

### AC8: 에러 처리
- **Given** `/스케치` 명령 처리 중 AI가 실패하면
- **When** nexus 채널에서 `canvas_ai_error` 이벤트가 도착하면
- **Then** 사령관실에 에러 메시지 카드가 표시된다 ("다이어그램 생성에 실패했습니다. 다시 시도해주세요.")

### AC9: 테넌트 격리
- **Given** 멀티테넌트 환경에서
- **When** `/스케치` 명령으로 스케치를 저장할 때
- **Then** companyId 기반으로 격리되어 타 회사 스케치와 분리된다

## Tasks / Subtasks

- [x] Task 1: 서버 - `/스케치` 슬래시 명령 등록 (AC: #1, #2)
  - [x]1.1: command-router.ts의 SlashType에 'sketch' 추가
  - [x]1.2: SLASH_COMMANDS 딕셔너리에 '/스케치' 항목 추가 ({ slashType: 'sketch', commandType: 'slash' })
  - [x]1.3: commands.ts 라우트에서 slashType='sketch' 처리 분기 추가 — canvas-ai 서비스 호출

- [x] Task 2: 서버 - 스케치 명령 처리기 (AC: #2, #7, #8)
  - [x]2.1: commands.ts에서 slashType='sketch' 감지 시 sketch-command-handler 로직 호출
  - [x]2.2: canvas-ai.ts의 interpretCanvasCommand를 호출하여 Mermaid 생성
  - [x]2.3: 생성된 Mermaid 코드를 command 결과에 저장 (resultData에 mermaid + description 포함)
  - [x]2.4: WebSocket nexus 채널로 canvas_ai_start / canvas_update / canvas_ai_error 이벤트 전송 (기존 canvas-ai.ts에서 이미 구현됨 — commandId 기반 매칭 확인)

- [x] Task 3: 프론트엔드 - 슬래시 명령 등록 (AC: #1)
  - [x]3.1: slash-popup.tsx의 SLASH_COMMANDS에 { cmd: '/스케치', args: '[설명]', desc: 'AI로 다이어그램 생성', icon: '🎨' } 추가

- [x] Task 4: 프론트엔드 - 다이어그램 미리보기 카드 (AC: #3, #4, #5, #6)
  - [x]4.1: sketch-preview-card.tsx 컴포넌트 생성 — Mermaid 코드를 ReactFlow 미니 캔버스로 렌더링
  - [x]4.2: "SketchVibe에서 열기" 버튼 — sessionStorage에 graphData 저장 후 /nexus로 navigate
  - [x]4.3: "저장" 버튼 — 이름 입력 프롬프트 → POST /workspace/sketches
  - [x]4.4: "Mermaid 복사" 버튼 — navigator.clipboard.writeText(mermaidCode)
  - [x]4.5: 사령관실 메시지 리스트에서 sketch 결과 감지 시 sketch-preview-card 렌더링

- [x] Task 5: 프론트엔드 - WebSocket 실시간 연동 (AC: #7, #8)
  - [x]5.1: 사령관실에서 nexus 채널 구독 추가 (canvas_ai_start, canvas_update, canvas_ai_error)
  - [x]5.2: canvas_ai_start 수신 시 "다이어그램 생성 중..." 로딩 카드 표시
  - [x]5.3: canvas_update 수신 시 로딩 카드 → sketch-preview-card 교체 (commandId 매칭)
  - [x]5.4: canvas_ai_error 수신 시 에러 카드 표시

- [x] Task 6: 프론트엔드 - SketchVibe 페이지 연동 (AC: #4)
  - [x]6.1: nexus.tsx에서 sessionStorage의 pendingGraphData 감지 → 캔버스에 자동 로드
  - [x]6.2: 로드 후 sessionStorage 데이터 삭제

- [x] Task 7: 테스트 (AC: 전체)
  - [x]7.1: command-router에서 /스케치 파싱 테스트 (slashType='sketch' 확인)
  - [x]7.2: sketch 명령 처리 플로우 테스트 (command 생성 → canvas-ai 호출 → 결과 저장)
  - [x]7.3: sketch-preview-card 렌더링 테스트 (mermaid → canvas 변환, 버튼 동작)
  - [x]7.4: WebSocket 이벤트 핸들링 테스트 (start → update → 카드 교체)
  - [x]7.5: 저장 플로우 테스트 (POST /sketches 호출 확인)
  - [x]7.6: SketchVibe 페이지 pendingGraphData 로드 테스트
  - [x]7.7: 테넌트 격리 테스트
  - [x]7.8: 에러 케이스 테스트 (AI 실패, 빈 Mermaid 등)

## Dev Notes

### v1 → v2 전환 핵심

v1에서 SketchVibe는 별도의 SSE 스트림(/api/sketchvibe/stream)으로 AI 캔버스 업데이트를 브라우저에 전달했다. 사령관실과의 통합은 없었다. v2에서는 `/스케치` 슬래시 명령으로 사령관실에서 직접 다이어그램을 생성하고 미리볼 수 있게 한다.

**v1 핵심 기능 (참고):**
- `/api/sketchvibe/push-event` — MCP 서버가 Mermaid 업데이트 전송
- `/api/sketchvibe/stream` — 브라우저 SSE 구독
- `/api/sketchvibe/save-canvas` — 캔버스 저장
- `/api/sketchvibe/request-approval` — CEO 승인 요청

v2에서는 WebSocket nexus 채널이 SSE를 대체하고, command-router가 `/스케치` 명령을 직접 처리한다.

### 기존 코드 활용 (새로 만들지 말 것!)

1. **command-router.ts**: `packages/server/src/services/command-router.ts` — SlashType에 'sketch' 추가, SLASH_COMMANDS에 '/스케치' 등록
2. **canvas-ai.ts**: `packages/server/src/services/canvas-ai.ts` — `interpretCanvasCommand()` 이미 구현됨 (LLM 호출 + Mermaid 생성 + WS 이벤트 전송)
3. **commands.ts**: `packages/server/src/routes/commands.ts` — 명령 생성 + 라우팅 로직. slashType='sketch' 분기만 추가
4. **slash-popup.tsx**: `packages/app/src/pages/command-center/components/slash-popup.tsx` — SLASH_COMMANDS 배열에 항목 추가
5. **mermaidToCanvas**: `packages/app/src/lib/mermaid-to-canvas.ts` — Mermaid → ReactFlow 변환 (미리보기 카드에서 사용)
6. **canvasToMermaid**: `packages/app/src/lib/canvas-to-mermaid.ts` — ReactFlow → Mermaid 변환
7. **parseMermaid**: `@corthex/shared` — Mermaid 파싱
8. **sketches API**: `packages/server/src/routes/workspace/sketches.ts` — POST /workspace/sketches (이미 있음)
9. **api 클라이언트**: `packages/app/src/lib/api.ts` — HTTP 호출
10. **useWebSocket**: 기존 WebSocket 훅 — nexus 채널 구독

### 서버 구현 상세

#### SlashType 확장 (command-router.ts)
```typescript
export type SlashType =
  | 'all' | 'sequential' | 'tool_check' | 'batch_run'
  | 'batch_status' | 'commands_list' | 'debate' | 'deep_debate'
  | 'sketch'  // NEW

const SLASH_COMMANDS: Record<string, { slashType: SlashType; commandType: CommandType }> = {
  // ... 기존 8개 ...
  '/스케치':   { slashType: 'sketch',        commandType: 'slash' },
}
```

#### 명령 처리 (commands.ts 확장)
```typescript
// slashType='sketch' 분기
case 'sketch': {
  const prompt = parsedMeta.slashArgs || ''
  if (!prompt) {
    // 빈 프롬프트 → 에러 응답
    return c.json({ success: false, error: { code: 'EMPTY_SKETCH_PROMPT', message: '다이어그램 설명을 입력해주세요' } })
  }
  // 비동기 처리 시작 (바로 응답 반환)
  interpretCanvasCommand({
    commandId: command.id,
    companyId: tenant.companyId,
    userId: user.id,
    prompt,
    currentMermaid: '', // 새 다이어그램 생성
  }).catch(err => console.error('sketch command error:', err))
  break
}
```

#### canvas-ai.ts 확인 사항
기존 canvas-ai.ts는 이미 다음을 수행:
- `canvas_ai_start` WS 이벤트 전송
- LLM 호출 (Claude Haiku 4.5)
- `canvas_update` WS 이벤트 전송 (mermaid + description)
- `canvas_ai_error` WS 이벤트 전송 (실패 시)

추가 필요: commandId를 resultData에 저장하여 사령관실에서 결과를 command와 매칭할 수 있도록 한다.

### 프론트엔드 구현 상세

#### sketch-preview-card.tsx 컴포넌트
```typescript
// packages/app/src/pages/command-center/components/sketch-preview-card.tsx (NEW)
type Props = {
  mermaid: string
  description: string
  commandId: string
  onOpenInEditor: () => void
  onSave: () => void
  onCopyMermaid: () => void
}
// ReactFlow 미니 캔버스 (읽기 전용, 높이 200px)
// - mermaidToCanvas()로 변환 → ReactFlow 미니맵으로 렌더링
// - 3개 액션 버튼 하단 배치
```

#### nexus 채널 구독 (사령관실)
```typescript
// command-center/index.tsx에 추가
// nexus 채널의 canvas_ai_start, canvas_update, canvas_ai_error 이벤트 구독
// commandId 기반으로 해당 명령의 결과를 매칭
```

#### SketchVibe로 이동 (sessionStorage 활용)
```typescript
// "SketchVibe에서 열기" 클릭 시
const graphData = mermaidToCanvas(mermaidCode)
sessionStorage.setItem('pendingGraphData', JSON.stringify(graphData))
navigate('/nexus')

// nexus.tsx 마운트 시
useEffect(() => {
  const pending = sessionStorage.getItem('pendingGraphData')
  if (pending) {
    const data = JSON.parse(pending)
    setNodes(data.nodes)
    setEdges(data.edges)
    sessionStorage.removeItem('pendingGraphData')
  }
}, [])
```

### Project Structure Notes

```
packages/
├── server/src/
│   ├── services/
│   │   ├── command-router.ts             ← MODIFY: SlashType에 'sketch' 추가, SLASH_COMMANDS에 '/스케치' 추가
│   │   └── canvas-ai.ts                  ← MODIFY: command 결과 저장 로직 추가 (resultData)
│   ├── routes/
│   │   └── commands.ts                    ← MODIFY: slashType='sketch' 처리 분기 추가
│   └── __tests__/unit/
│       └── sketch-command.test.ts         ← NEW: 스케치 명령 관련 테스트
├── app/src/
│   ├── pages/
│   │   ├── command-center/
│   │   │   ├── index.tsx                  ← MODIFY: nexus WS 구독 + sketch 결과 렌더링
│   │   │   └── components/
│   │   │       ├── slash-popup.tsx         ← MODIFY: '/스케치' 명령 추가
│   │   │       └── sketch-preview-card.tsx ← NEW: 다이어그램 미리보기 카드
│   │   └── nexus.tsx                      ← MODIFY: sessionStorage pendingGraphData 로드
│   └── lib/
│       └── mermaid-to-canvas.ts           ← EXISTING: Mermaid → ReactFlow 변환 (재사용)
└── shared/src/
    └── (변경 없음 — 기존 mermaid-parser 사용)
```

### Architecture Compliance

- **API 응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }` — 기존 패턴 따름
- **테넌트 격리**: companyId 기반 — authMiddleware 자동 주입. 스케치 저장 시 companyId 포함
- **파일명**: kebab-case (sketch-preview-card.tsx, sketch-command.test.ts)
- **import 경로**: git ls-files 기준 실제 케이싱 일치
- **WebSocket**: nexus 채널 재사용 (canvas_ai_start, canvas_update, canvas_ai_error 이벤트)
- **슬래시 명령 패턴**: command-router.ts의 기존 SLASH_COMMANDS 딕셔너리 패턴 따름
- **활동 로그**: 스케치 저장 시 logActivity 호출

### Library/Framework Requirements

- **신규 패키지 설치 불필요** — 모든 기능이 기존 의존성으로 구현 가능
- ReactFlow (@xyflow/react): 이미 설치됨 — 미니 캔버스 렌더링
- @tanstack/react-query: useMutation, useQuery 이미 사용 중
- @corthex/shared: parseMermaid 이미 있음
- Clipboard API: navigator.clipboard.writeText() — 브라우저 내장

### Testing Requirements

- **테스트 프레임워크**: bun:test
- **테스트 파일**: `packages/server/src/__tests__/unit/sketch-command.test.ts`
- **테스트 항목**:
  - command-router: /스케치 파싱 → slashType='sketch', commandType='slash'
  - command-router: /스케치 빈 인수 → args=''
  - command-router: /스케치 다이어그램 그려줘 → args='다이어그램 그려줘'
  - 명령 처리: slashType='sketch' → interpretCanvasCommand 호출 확인
  - 명령 처리: 빈 프롬프트 → EMPTY_SKETCH_PROMPT 에러
  - canvas-ai 결과 → command resultData에 mermaid + description 저장 확인
  - WebSocket: canvas_ai_start/canvas_update/canvas_ai_error 이벤트 전송 확인
  - 테넌트 격리: companyId 불일치 시 접근 불가
  - 스케치 저장: POST /sketches 정상 동작 (기존 테스트와 충돌 없음)
- **기존 테스트 regression 금지**: `bun test` 실행 시 기존 테스트 전부 통과해야 함

### Previous Story Intelligence (13-4)

- **sketch_versions**: 스케치 저장 시 버전 자동 기록 (최대 20개). `/스케치` 저장도 동일하게 작동
- **autoSave 플래그**: PUT /sketches/:id?autoSave=true 시 버전 미생성. `/스케치` 저장은 새 스케치 POST이므로 해당 없음
- **export-knowledge**: 지식 베이스 내보내기 → 이 스토리에서는 직접 사용하지 않음 (미리보기 카드에서 별도 내보내기 필요 시 향후 추가)
- **canvas-sidebar.tsx**: 2탭 (스케치/지식베이스) — 이 스토리에서 변경 없음
- **canvas-ai.ts**: LLM 호출 + WS 이벤트 전송 이미 구현. commandId 매칭만 확인 필요
- **기존 37 tests (13-4)**: sketch-save-knowledge.test.ts — 기존 테스트 깨뜨리지 말 것
- **기존 23 tests (13-3)**: canvas-ai.test.ts — 기존 테스트 깨뜨리지 말 것

### Git Intelligence

최근 커밋 패턴:
- `feat: Story X-Y [제목] -- [세부사항], N tests` 형식
- 테스트 파일: `packages/server/src/__tests__/unit/` 하위에 위치
- 프론트엔드 컴포넌트: 해당 page/component 디렉토리에 위치
- 서비스 로직: `packages/server/src/services/` 하위에 위치

### v1 핵심 참조 파일

- `v1 SketchVibe handler`: `/home/ubuntu/CORTHEX_HQ/web/handlers/sketchvibe_handler.py` — SSE 스트림, push-event, save-canvas, request-approval
- `v1 사령관실`: `/home/ubuntu/CORTHEX_HQ/web/handlers/command_handler.py` — 명령 파싱 + 라우팅 (v2의 command-router.ts와 대응)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 13 — E13-S5]
- [Source: _bmad-output/planning-artifacts/prd.md — FR64 (SketchVibe)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — CEO #4 SketchVibe, 12.5.2 CommandInput Shortcuts]
- [Source: _bmad-output/planning-artifacts/architecture.md — WebSocket nexus 채널, routes/sketches.ts]
- [Source: packages/server/src/services/command-router.ts — SlashType, SLASH_COMMANDS]
- [Source: packages/server/src/services/canvas-ai.ts — interpretCanvasCommand, WS 이벤트]
- [Source: packages/server/src/routes/commands.ts — 명령 라우팅]
- [Source: packages/app/src/pages/command-center/components/slash-popup.tsx — 슬래시 팝업]
- [Source: packages/app/src/pages/nexus.tsx — SketchVibe 메인 페이지]
- [Source: packages/app/src/lib/mermaid-to-canvas.ts — Mermaid → ReactFlow 변환]
- [Source: Story 13-4 — 저장/불러오기 + 지식 베이스 연동 구현 노트]
- [Source: Story 13-3 — MCP SSE AI 실시간 캔버스 조작 구현 노트]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References
- SlashType 'sketch' added to command-router.ts, SLASH_COMMANDS dict, and SLASH_TIMEOUT_OVERRIDES (60s)
- sketch-command-handler.ts: processSketchCommand calls canvas-ai interpretCanvasCommand with empty graphData for new diagram generation
- canvas-ai.ts already broadcasts nexus channel events (canvas_ai_start, canvas_update, canvas_ai_error) — no modification needed
- command store extended with sketchResult and sketchLoading fields
- use-command-center.ts subscribes to nexus WS channel for realtime sketch events
- message-list.tsx conditionally renders SketchPreviewCard/SketchLoadingCard based on message type
- sketch-preview-card.tsx uses ReactFlow mini canvas (read-only, fitView) for inline diagram preview
- nexus.tsx loads pendingGraphData from sessionStorage on mount for "Open in SketchVibe" flow

### Completion Notes List
- Task 1: SlashType 'sketch' added to command-router.ts, '/스케치' in SLASH_COMMANDS dict with commandType='slash', 60s timeout override
- Task 2: sketch-command-handler.ts created — processSketchCommand handles empty prompt error, calls interpretCanvasCommand, saves result in command metadata (sketchResult: { mermaid, description }), broadcasts via command channel
- Task 3: '/스케치' added to slash-popup.tsx SLASH_COMMANDS array with icon '🎨' and args '[설명]'
- Task 4: sketch-preview-card.tsx created with SketchPreviewCard (ReactFlow mini canvas + 3 buttons), SketchLoadingCard, SketchErrorCard. Save dialog with name input. "Open in SketchVibe" via sessionStorage + navigate. Mermaid clipboard copy
- Task 5: use-command-center.ts subscribes to nexus WS channel. Handles canvas_ai_start (loading card), canvas_update (preview card), canvas_ai_error (error card). Command COMPLETED event handles sketchResult for history loading
- Task 6: nexus.tsx loads pendingGraphData from sessionStorage on mount, applies handleLabelChange/handleEdgeLabelChange to nodes/edges, clears sessionStorage after load
- Task 7: 25 tests in sketch-command.test.ts — parseSlash /스케치 (6 tests), extractMermaidFromResponse (4 tests), processSketchCommand module (2 tests), classify flow (3 tests), mermaid generation (3 tests), tenant isolation (1 test), error handling (4 tests), sessionStorage contract (1 test), all 9 commands supported (1 test)

### File List
- `packages/server/src/services/command-router.ts` — MODIFIED: SlashType 'sketch' added, '/스케치' in SLASH_COMMANDS, 60s timeout override
- `packages/server/src/services/sketch-command-handler.ts` — NEW: processSketchCommand function
- `packages/server/src/routes/commands.ts` — MODIFIED: import sketch-command-handler, slashType='sketch' routing
- `packages/server/src/__tests__/unit/sketch-command.test.ts` — NEW: 25 tests
- `packages/app/src/stores/command-store.ts` — MODIFIED: SketchResult type, sketchResult/sketchLoading fields on CommandMessage
- `packages/app/src/hooks/use-command-center.ts` — MODIFIED: nexus WS subscription, nexus event handlers, sketch result in history loading
- `packages/app/src/pages/command-center/components/slash-popup.tsx` — MODIFIED: '/스케치' command added
- `packages/app/src/pages/command-center/components/sketch-preview-card.tsx` — NEW: SketchPreviewCard, SketchLoadingCard, SketchErrorCard
- `packages/app/src/pages/command-center/components/message-list.tsx` — MODIFIED: conditional render of sketch cards
- `packages/app/src/pages/nexus.tsx` — MODIFIED: pendingGraphData sessionStorage load on mount
