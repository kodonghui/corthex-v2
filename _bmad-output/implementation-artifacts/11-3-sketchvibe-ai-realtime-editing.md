# Story 11.3: SketchVibe AI 실시간 편집

Status: done

## Story

As a CEO,
I want AI가 실시간으로 캔버스에 노드를 추가/수정하는 것을,
So that "그림 그려서 AI랑 같이 보면서 대화"할 수 있다.

## Acceptance Criteria

1. **MCP → WebSocket 실시간 동기화**: AI가 MCP 도구(add_node/update_node/delete_node/add_edge) 호출 → tool-handler 브릿지에서 WebSocket `nexus` 채널로 `canvas_mcp_update` 브로드캐스트 → 프론트 캔버스 자동 반영
2. **8종 노드 타입**: agent, system, api, decide, db, start, end, note (v1 호환) — **이미 구현됨** (`sketchvibe-nodes.tsx`)
3. **드래그 이동 + 더블클릭 이름 편집 + Delete 삭제**: 드래그 이동과 더블클릭 편집은 **이미 구현됨**. Delete 키 삭제도 **이미 구현됨** (`deleteKeyCode={['Backspace', 'Delete']}`)
4. **연결 모드: Space바 토글 + Ctrl+클릭 멀티선택**: Space바로 "연결 모드" 토글 (클릭으로 노드 간 엣지 생성). Ctrl+클릭 멀티선택 지원
5. **edgehandles: 드래그로 화살표 생성**: 노드 핸들에서 드래그하여 엣지 생성 — **이미 구현됨** (ReactFlow `onConnect` + Handle 컴포넌트)
6. **compound parent: subgraph 그룹핑**: 선택된 노드들을 그룹으로 묶는 기능. `group` 노드 타입 + ReactFlow `parentId` 지원

## Tasks / Subtasks

### Task 1: MCP → WebSocket 실시간 브로드캐스트 (AC: #1) — CRITICAL

- [x] 1.1: `packages/server/src/lib/tool-handlers/builtins/sketchvibe-mcp.ts` 수정 — MCP 도구 호출 후 WebSocket 브로드캐스트 추가
- [x] 1.2: MCP 도구 응답에서 mermaid 파싱 — `JSON.parse(result)` → `.mermaid` 추출
- [x] 1.3: `canvas_mcp_update` 이벤트 타입 사용 (기존 `canvas_update`와 구분)

### Task 2: 프론트엔드 MCP 실시간 반영 (AC: #1)

- [x] 2.1: `nexus.tsx` — WebSocket 리스너에 `canvas_mcp_update` 핸들러 추가 (즉시 적용 + Undo 스택)
- [x] 2.2: 연결 모드 + 상태바에 AI 편집 상태 표시

### Task 3: Space바 연결 모드 (AC: #4)

- [x] 3.1: `connectionMode` + `pendingSource` 상태 추가
- [x] 3.2: Space바 키다운/키업 이벤트 핸들러 (연결 모드에서 두 노드 클릭 시 엣지 생성)
- [x] 3.3: 상태바에 연결 모드 + pendingSource 표시
- [x] 3.4: 연결 모드 중 커서 crosshair + 드래그 비활성화

### Task 4: Ctrl+클릭 멀티선택 (AC: #4)

- [x] 4.1: ReactFlow `multiSelectionKeyCode="Control"` prop 추가
- [x] 4.2: 선택된 노드 수 상태바에 표시

### Task 5: Subgraph 그룹핑 (AC: #6)

- [x] 5.1: `GroupNode` 컴포넌트 — 점선 테두리 + cyan 테마 + 라벨 편집
- [x] 5.2: `handleGroupSelected()` — bounding box 계산 → group 노드 + parentId 설정
- [x] 5.3: `handleUngroupNode()` — 자식 노드 position 복원 + group 삭제
- [x] 5.4: context-menu에 "그룹 만들기" / "그룹 해제" 메뉴 추가
- [x] 5.5: Mermaid `subgraph` 지원 — shared parser가 현재 skip 처리, 프론트엔드에서 group 타입으로 직접 생성/관리

### Task 6: 핸들 시각 개선 (AC: #5)

- [x] 6.1: ReactFlow 기본 핸들 동작 확인 — 기존 Handle 컴포넌트에 색상별 클래스 적용 완료 (기존 구현)

## Dev Notes

### 핵심 아키텍처: MCP → WebSocket 실시간 파이프라인

```
에이전트가 MCP tool 호출 (add_node 등)
  → tool-handler bridge (builtins/sketchvibe-mcp.ts)
    → callSketchVibeTool() → MCP Stdio 서버 실행 → DB 업데이트 + mermaid 반환
    → 응답에서 mermaid 추출
    → broadcastToCompany(companyId, 'nexus', { type: 'canvas_mcp_update', mermaid })
      → WebSocket → 프론트엔드
        → mermaidToCanvas() → setNodes() + setEdges() → 캔버스 즉시 업데이트
```

**기존 canvas-ai.ts 파이프라인과의 차이점:**
- `canvas-ai.ts`: 사용자 AI 명령 → LLM → Mermaid → **프리뷰** → 사용자 "적용" 클릭
- **MCP 파이프라인**: 에이전트 MCP tool → DB 변경 → Mermaid → **즉시 반영** (프리뷰 없음)

### 기존 구현 현황 (이미 동작하는 것 — 건드리지 않음)

| 기능 | 파일 | 상태 |
|------|------|------|
| 8종 노드 타입 | `sketchvibe-nodes.tsx` | ✅ 완성 |
| 드래그 이동 | `nexus.tsx` ReactFlow | ✅ 완성 |
| 더블클릭 라벨 편집 | `sketchvibe-nodes.tsx` | ✅ 완성 |
| Delete/Backspace 삭제 | `nexus.tsx` deleteKeyCode prop | ✅ 완성 |
| 핸들 드래그 연결 | `nexus.tsx` onConnect | ✅ 완성 |
| AI 명령 (LLM → Mermaid) | `canvas-ai.ts` + nexus.tsx | ✅ 완성 |
| WebSocket nexus 채널 | `channels.ts` + nexus.tsx | ✅ 완성 |
| Undo/Redo | `nexus.tsx` | ✅ 완성 |
| 저장/불러오기 | `nexus.tsx` + sketches API | ✅ 완성 |
| Mermaid 가져오기/내보내기 | `nexus.tsx` | ✅ 완성 |
| Context menu (편집/복사/삭제) | `context-menu.tsx` | ✅ 완성 |
| Auto-save | `use-auto-save.ts` | ✅ 완성 |
| MCP Stdio 서버 (6도구) | `sketchvibe-mcp.ts` | ✅ 완성 |
| Tool handler 브릿지 | `builtins/sketchvibe-mcp.ts` | ✅ 완성 |

### 새로 구현해야 하는 것 (GAP)

| 기능 | 작업량 | 위치 |
|------|--------|------|
| MCP → WS 브로드캐스트 | 소 (~20줄) | `builtins/sketchvibe-mcp.ts` |
| 프론트 MCP 이벤트 핸들러 | 소 (~15줄) | `nexus.tsx` |
| Space바 연결 모드 | 중 (~50줄) | `nexus.tsx` |
| Ctrl+클릭 멀티선택 | 소 (~3줄) | `nexus.tsx` (prop 추가) |
| Group 노드 타입 | 중 (~80줄) | `sketchvibe-nodes.tsx` |
| 그룹 만들기/해제 로직 | 중 (~60줄) | `nexus.tsx` + `context-menu.tsx` |
| 핸들 시각 개선 | 소 (~10줄 CSS) | `sketchvibe-nodes.tsx` |

### 중요한 구현 세부사항

#### 1. MCP 브릿지에서 WebSocket 브로드캐스트

```typescript
// packages/server/src/lib/tool-handlers/builtins/sketchvibe-mcp.ts
import { broadcastToCompany } from '../../../ws/channels'

const MUTATION_TOOLS = new Set(['add_node', 'update_node', 'delete_node', 'add_edge'])

function makeSketchVibeHandler(toolName: string): ToolHandler {
  return async (input, ctx) => {
    const args = { ...input, companyId: ctx.companyId }
    const result = await callSketchVibeTool(toolName, args)

    // mutation 도구는 결과의 mermaid를 WebSocket으로 브로드캐스트
    if (MUTATION_TOOLS.has(toolName) && result) {
      try {
        const parsed = JSON.parse(result)
        if (parsed.mermaid) {
          broadcastToCompany(ctx.companyId, 'nexus', {
            type: 'canvas_mcp_update',
            mermaid: parsed.mermaid,
            toolName,
            description: `MCP ${toolName}: ${parsed.nodeId || parsed.edgeId || parsed.deletedNode || ''}`,
          })
        }
      } catch { /* MCP 응답이 비정상 JSON일 때 브로드캐스트 건너뜀 */ }
    }

    return result
  }
}
```

#### 2. ReactFlow 그룹 노드 패턴

```typescript
// group 노드 추가 시
const groupNode: Node = {
  id: 'group-1',
  type: 'group',
  position: { x: boundingBox.x - 20, y: boundingBox.y - 40 },
  data: { label: '서브그래프' },
  style: { width: boundingBox.width + 40, height: boundingBox.height + 60 },
}

// 자식 노드에 parentId 설정
childNodes = childNodes.map(n => ({
  ...n,
  parentId: 'group-1',
  position: {
    x: n.position.x - groupNode.position.x,
    y: n.position.y - groupNode.position.y,
  },
}))
```

#### 3. Space바 연결 모드 핵심 로직

```typescript
// 전역 상태
const [connectionMode, setConnectionMode] = useState(false)
const [pendingSource, setPendingSource] = useState<string | null>(null)

// 키보드 이벤트
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault()
      setConnectionMode(true)
    }
  }
  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') setConnectionMode(false)
  }
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
  return () => {
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('keyup', handleKeyUp)
  }
}, [])

// 연결 모드에서 노드 클릭
const onNodeClick = useCallback((event, node) => {
  if (!connectionMode) return
  if (!pendingSource) {
    setPendingSource(node.id)
  } else {
    // 엣지 생성
    const newEdge = {
      id: `e-${Date.now()}`,
      source: pendingSource,
      target: node.id,
      type: 'editable',
      data: { label: '', onEdgeLabelChange: handleEdgeLabelChange },
    }
    setEdges(eds => [...eds, newEdge])
    setPendingSource(null)
    setDirty(true)
  }
}, [connectionMode, pendingSource, handleEdgeLabelChange, setEdges])
```

### Project Structure Notes

**수정 파일:**
- `packages/server/src/lib/tool-handlers/builtins/sketchvibe-mcp.ts` — MCP → WS 브로드캐스트 추가
- `packages/app/src/pages/nexus.tsx` — MCP 이벤트 핸들러, Space 연결 모드, Ctrl 멀티선택, 그룹 기능
- `packages/app/src/components/nexus/sketchvibe-nodes.tsx` — GroupNode 컴포넌트 추가
- `packages/app/src/components/nexus/context-menu.tsx` — 그룹 만들기/해제 메뉴
- `packages/app/src/lib/mermaid-to-canvas.ts` — subgraph → group 변환 (있으면)

**수정하지 않는 파일 (불가침):**
- `packages/server/src/mcp/sketchvibe-mcp.ts` — MCP 서버 자체 (변경 불필요)
- `packages/server/src/services/canvas-ai.ts` — 기존 AI 파이프라인 유지
- `packages/shared/src/mermaid-parser.ts` — 공유 파서 유지
- `packages/server/src/ws/channels.ts` — WebSocket 인프라 유지

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 11.3] — AC, 기능 목록
- [Source: _bmad-output/planning-artifacts/architecture.md#결정 2] — 단일 진입점 원칙
- [Source: _bmad-output/implementation-artifacts/11-2-sketchvibe-mcp-server-separation.md] — MCP 서버 구현, 6개 도구, 브릿지 핸들러
- [Source: packages/server/src/lib/tool-handlers/builtins/sketchvibe-mcp.ts] — 현재 브릿지 핸들러
- [Source: packages/server/src/services/canvas-ai.ts] — broadcastToCompany 패턴 참조
- [Source: packages/app/src/pages/nexus.tsx] — 프론트엔드 캔버스, WebSocket 리스너
- [Source: packages/server/src/ws/channels.ts] — broadcastToCompany API
- [Source: packages/app/src/components/nexus/sketchvibe-nodes.tsx] — 8종 노드 타입
- [Source: packages/app/src/components/nexus/context-menu.tsx] — 컨텍스트 메뉴

### v1 호환 참조 (epics에서 "v1 spec 7.2~7.4")

- v1 SketchVibe: Cytoscape.js 기반 (v2는 ReactFlow로 전환 완료)
- v1 기능: MCP SSE 실시간 편집, compound parent (subgraph), edgehandles
- v2에서 ReactFlow 패턴으로 동일 UX 재현

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- `tsc --noEmit` — PASS (0 errors, server + app)
- `bun test sketchvibe-realtime.test.ts` — 11 tests PASS, 20 expect() calls
- `bun test sketchvibe-*.test.ts` — 76 tests PASS (11 new + 65 existing)
- Core unit tests regression — 54 tests PASS (0 regressions)

### Completion Notes List

- MCP → WebSocket 실시간 브로드캐스트 구현 완료
  - `MUTATION_TOOLS` Set으로 add_node/update_node/delete_node/add_edge 구분
  - 응답 JSON에서 mermaid 필드 추출 → `broadcastToCompany()` 호출
  - `canvas_mcp_update` 이벤트 타입으로 기존 `canvas_update`와 구분
- 프론트엔드 `canvas_mcp_update` 핸들러 — 프리뷰 없이 즉시 적용 + Undo 스택 저장
- Space바 연결 모드 — 키 누르면 활성, 놓으면 해제. 노드 두 개 순차 클릭으로 엣지 생성
- Ctrl+클릭 멀티선택 — `multiSelectionKeyCode="Control"` prop
- GroupNode 컴포넌트 — 점선 테두리 + cyan 테마 + 라벨 편집 가능
- 그룹 만들기/해제 — bounding box 기반 grouping, parentId 활용
- Context menu에 그룹 만들기/해제 메뉴 추가
- 상태바 개선 — 선택 수, 연결 모드 상태, pendingSource 표시
- 11개 서버 테스트 작성 (mutation 4개 + non-mutation 2개 + 에러 처리 3개 + companyId 전파 2개)

### File List

- `packages/server/src/lib/tool-handlers/builtins/sketchvibe-mcp.ts` — MODIFIED (WebSocket 브로드캐스트 추가)
- `packages/app/src/pages/nexus.tsx` — MODIFIED (MCP 이벤트, Space 연결 모드, Ctrl 멀티선택, 그룹)
- `packages/app/src/components/nexus/sketchvibe-nodes.tsx` — MODIFIED (GroupNode 추가)
- `packages/app/src/components/nexus/context-menu.tsx` — MODIFIED (그룹 만들기/해제 메뉴)
- `packages/server/src/__tests__/unit/sketchvibe-realtime.test.ts` — NEW (11 tests)
- `packages/server/src/__tests__/unit/sketchvibe-realtime-tea.test.ts` — NEW (16 TEA risk-based tests)
- `packages/server/src/__tests__/unit/sketchvibe-realtime-qa.test.ts` — NEW (17 QA AC verification tests)

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.6 | **Date:** 2026-03-11

### Verdict: APPROVED

### Issues Found: 3 MEDIUM, 2 LOW

| # | Severity | Issue | Resolution |
|---|----------|-------|-----------|
| 1 | MEDIUM | Story AC #1 text said `canvas_update` but impl uses `canvas_mcp_update` | FIXED — AC text corrected |
| 2 | MEDIUM | Dev Notes code snippet showed `result?.content?.[0]?.text` (MCP SDK object) but actual code uses `JSON.parse(result)` directly | FIXED — code snippet corrected |
| 3 | MEDIUM | File List missing TEA/QA test files | FIXED — 2 test files added |
| 4 | LOW | No shared TypeScript type for `canvas_mcp_update` event between server/frontend | NOTED — architectural concern, not story scope |
| 5 | LOW | `handleContextAction` uses loose `{ type: string }` instead of `ContextMenuAction` union | NOTED — works correctly, minor type safety gap |

### AC Verification Summary

| AC | Status | Evidence |
|----|--------|----------|
| #1 MCP→WS 동기화 | IMPLEMENTED | `sketchvibe-mcp.ts:20-34`, `nexus.tsx:798-817` |
| #2 8종 노드 타입 | IMPLEMENTED | `sketchvibe-nodes.tsx:249-259` (9 types: 8+group) |
| #3 드래그/편집/삭제 | IMPLEMENTED | Pre-existing, verified |
| #4 Space바 + Ctrl | IMPLEMENTED | `nexus.tsx:395-437`, `nexus.tsx:1164` |
| #5 edgehandles | IMPLEMENTED | Pre-existing, verified |
| #6 subgraph 그룹핑 | IMPLEMENTED | `nexus.tsx:440-514`, `context-menu.tsx:63-77` |

### Test Coverage

- 11 unit tests (dev) + 16 TEA tests + 17 QA tests = **44 tests total, ALL PASS**
- 110 expect() assertions across all test suites

### Change Log

- 2026-03-11: Code review — 3 MEDIUM issues fixed (story doc corrections), 2 LOW noted. Status → done
