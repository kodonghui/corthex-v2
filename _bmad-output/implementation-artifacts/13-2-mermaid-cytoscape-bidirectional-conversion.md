# Story 13.2: Mermaid ↔ Cytoscape 양방향 변환

Status: done

## Story

As a CEO/Human 직원,
I want Mermaid 코드를 캔버스에 붙여넣으면 자동으로 노드/엣지가 그려지고, 캔버스 그래프를 Mermaid 코드로 내보낼 수 있기를,
so that AI가 생성한 Mermaid 다이어그램을 시각화하고, 캔버스 작업물을 Mermaid 형식으로 공유/재사용할 수 있다.

## Acceptance Criteria (BDD)

### AC1: Mermaid → Canvas 파싱 (mermaidToCanvas 함수)
- **Given** 유효한 Mermaid flowchart 코드 문자열이 있을 때
- **When** `mermaidToCanvas(code)` 함수를 호출하면
- **Then** ReactFlow Node[] + Edge[] 구조를 반환하며, 노드 타입은 Mermaid 형태에서 자동 판별된다

### AC2: 노드 타입 자동 감지 (8종 매핑)
- **Given** Mermaid 형태가 `([...])`, `[...]`, `[[...]]`, `{{...}}`, `{...}`, `[(...)]`, `>...]`, `((...))` 중 하나일 때
- **When** 파싱하면
- **Then** 각각 start, agent, system, api, decide, db, note, end로 SvNodeType이 매핑된다

### AC3: 엣지 라벨 보존
- **Given** Mermaid 엣지에 라벨이 있을 때 (`-->|라벨|` 또는 `--라벨-->`)
- **When** 파싱하면
- **Then** ReactFlow edge의 data.label에 라벨 텍스트가 저장된다

### AC4: 유효성 검증 + 에러 처리
- **Given** 잘못된 Mermaid 코드가 입력될 때
- **When** `mermaidToCanvas(code)` 호출하면
- **Then** error 필드에 사용자 친화적 에러 메시지를 반환하고, 기존 캔버스 상태를 손상시키지 않는다

### AC5: 양방향 순환 안전성 (Round-trip)
- **Given** 캔버스에 노드/엣지가 그려져 있을 때
- **When** canvasToMermaid → mermaidToCanvas 순환하면
- **Then** 노드 타입, 라벨, 엣지 연결이 보존된다 (위치는 dagre 재계산)

### AC6: v1 호환성
- **Given** v1 SketchVibe에서 생성된 Mermaid 코드가 있을 때
- **When** v2 mermaidToCanvas()로 파싱하면
- **Then** 노드와 엣지가 정상적으로 생성된다 (v1 형태: `[/label\]`→api, `((label))`→end 포함)

### AC7: Canvas → Mermaid 개선 (엣지 라벨 포함)
- **Given** 캔버스에 라벨이 있는 엣지가 있을 때
- **When** `canvasToMermaid(nodes, edges)` 호출하면
- **Then** 출력에 `-->|라벨|` 형식으로 엣지 라벨이 포함된다

### AC8: UI — Import Mermaid 모달
- **Given** NexusPage 상단 툴바에 "Mermaid" 버튼이 있을 때
- **When** 클릭하면
- **Then** Mermaid 코드 입력 모달이 열리고, "적용" 버튼으로 캔버스에 렌더링되며, 에러 시 에러 메시지를 표시한다

### AC9: UI — Export Mermaid 복사
- **Given** 캔버스에 노드가 있을 때
- **When** Export Mermaid 버튼을 클릭하면
- **Then** 현재 캔버스의 Mermaid 코드가 클립보드에 복사되고, "복사 완료" 피드백이 표시된다

### AC10: 서버 API — Mermaid Import 엔드포인트
- **Given** 인증된 사용자가 Mermaid 코드를 전송할 때
- **When** POST /workspace/sketches/import-mermaid 호출하면
- **Then** Mermaid를 파싱하여 새 캔버스로 저장하고, 생성된 sketch를 반환한다

## Tasks / Subtasks

- [x] Task 1: `mermaidToCanvas()` 파서 구현 (AC: #1, #2, #3, #4, #6)
  - [x] 1.1: `packages/shared/src/mermaid-parser.ts` + `packages/app/src/lib/mermaid-to-canvas.ts` 생성
  - [x] 1.2: flowchart/graph 방향 파싱 (LR/TD/RL/BT)
  - [x] 1.3: 노드 파싱 — 8종 형태 정규식 매칭 (v1 패턴 호환 포함)
  - [x] 1.4: 엣지 파싱 — `-->|label|` 및 `--label-->` 양쪽 지원
  - [x] 1.5: 주석(`%%`), style, classDef, subgraph → 무시/warning
  - [x] 1.6: dagre 자동 레이아웃으로 노드 위치 계산
  - [x] 1.7: ConversionResult 타입 반환 (nodes, edges, direction, error?, warnings?)

- [x] Task 2: `canvasToMermaid()` 개선 (AC: #7)
  - [x] 2.1: 엣지 라벨 출력 — `-->|라벨|` 형식 추가
  - [x] 2.2: v1 호환 엣지 라벨 형식 (`-->|label|`) 채택

- [x] Task 3: NexusPage UI 통합 (AC: #8, #9)
  - [x] 3.1: Import Mermaid 버튼 + 모달 컴포넌트 추가
  - [x] 3.2: Mermaid 코드 입력 textarea + "적용" 버튼
  - [x] 3.3: 에러 메시지 표시 영역
  - [x] 3.4: Export Mermaid 버튼 + 클립보드 복사 + "복사 완료" 피드백

- [x] Task 4: 서버 API (AC: #10)
  - [x] 4.1: POST /workspace/sketches/import-mermaid 엔드포인트 추가
  - [x] 4.2: Mermaid 코드 파싱 → graphData 생성 → sketches 테이블 저장
  - [x] 4.3: 기존 sketches.ts에 추가 (별도 파일 생성 불필요)

- [x] Task 5: Round-trip 검증 (AC: #5)
  - [x] 5.1: canvasToMermaid → mermaidToCanvas 순환 테스트
  - [x] 5.2: 노드 타입/라벨/엣지 연결 보존 확인

## Dev Notes

### 기존 코드 활용 (새로 만들지 말 것!)
1. **canvas-to-mermaid.ts**: `packages/app/src/lib/canvas-to-mermaid.ts` — 이미 canvasToMermaid() 구현됨. 엣지 라벨만 추가하면 됨
2. **dagre-layout.ts**: `packages/app/src/lib/dagre-layout.ts` — 자동 레이아웃. mermaidToCanvas에서 노드 위치 계산에 재사용
3. **sketchvibe-nodes.tsx**: `packages/app/src/components/nexus/sketchvibe-nodes.tsx` — 8종 SvNodeType 정의, NODE_PALETTE 배열
4. **editable-edge.tsx**: `packages/app/src/components/nexus/editable-edge.tsx` — 커스텀 Edge (라벨 편집 가능)
5. **sketches.ts**: `packages/server/src/routes/workspace/sketches.ts` — CRUD API. import-mermaid 엔드포인트 여기에 추가
6. **nexus.tsx**: `packages/app/src/pages/nexus.tsx` — NexusPage. Import/Export 버튼 여기에 추가

### 핵심 구현: mermaidToCanvas 파서

**v1 참조 (반드시 참고)**: `/home/ubuntu/CORTHEX_HQ/web/static/js/corthex-app.js` 6269행 `mermaidToCytoscape()`
- v1 노드 패턴 우선순위 (정확한 순서 중요 — 긴 패턴부터 매칭):
  1. `id[(label)]` → db
  2. `id((label))` → end
  3. `id([label])` → start
  4. `id{label}` → decide
  5. `id>label]` → note
  6. `id[[label]]` → system
  7. `id[/label\]` → api (v1 전용, v2의 `{{...}}`와 다름)
  8. `id[label]` → agent (가장 마지막, fallback)

**v2 추가 패턴**: `id{{label}}` → api (v2 canvasToMermaid에서 사용)

**엣지 파싱 형식들**:
- `A --> B` (라벨 없음)
- `A -->|label| B` (v1 형식)
- `A --label--> B` (대체 형식)
- 인라인 노드 정의가 포함된 엣지 행도 파싱해야 함: `A[라벨] --> B{결정}`

**ConversionResult 타입**:
```typescript
export interface ConversionResult {
  nodes: Node[]
  edges: Edge[]
  direction: 'LR' | 'TD' | 'RL' | 'BT'
  error?: string
  warnings: string[]
}
```

### canvasToMermaid 개선 포인트
현재 코드 (canvas-to-mermaid.ts:47-51)에서 엣지 라벨이 누락됨:
```typescript
// 현재: lines.push(`  ${src} --> ${tgt}`)
// 개선: edge.data?.label이 있으면 -->|label| 형식 추가
```
v1 형식 `-->|label|`을 사용할 것 (Mermaid 표준 형식).

### NexusPage UI 추가 위치
- nexus.tsx 헤더 영역 (456행 근처)에 "Mermaid" 버튼 추가
- 모달은 저장 다이얼로그와 동일한 패턴 사용 (686행 참조)
- Export는 `canvasToMermaid(nodes, edges)` 호출 → `navigator.clipboard.writeText()`

### 서버 API 추가
- sketches.ts에 POST `/import-mermaid` 라우트 추가
- 서버에서 mermaid-to-canvas 파싱을 할 필요는 없음 — 클라이언트에서 파싱한 graphData를 그대로 저장하는 방식도 가능
- 하지만 MCP SSE(E13-S3)에서 서버가 Mermaid를 받아야 하므로, 서버에도 파서 필요
- **서버용 파서**: `packages/server/src/lib/mermaid-parser.ts` (app용과 동일 로직, ReactFlow import 없이 순수 파싱만)
- 또는 shared 패키지에 넣어도 됨: `packages/shared/src/mermaid-parser.ts`
- **권장**: `packages/shared/src/mermaid-parser.ts`에 순수 파싱 로직, app에서는 이를 import + dagre 레이아웃 추가

### Project Structure Notes

```
packages/
├── shared/src/
│   └── mermaid-parser.ts          ← NEW: 순수 Mermaid 파싱 (서버/클라 공용)
├── app/src/
│   ├── lib/
│   │   ├── canvas-to-mermaid.ts   ← MODIFY: 엣지 라벨 추가
│   │   └── mermaid-to-canvas.ts   ← NEW: shared 파서 + dagre 레이아웃 래퍼
│   └── pages/
│       └── nexus.tsx              ← MODIFY: Import/Export Mermaid 버튼+모달
└── server/src/
    └── routes/workspace/
        └── sketches.ts            ← MODIFY: import-mermaid 엔드포인트 추가
```

### Architecture Compliance
- **API 응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **테넌트 격리**: import-mermaid도 companyId 기반 격리 적용
- **파일명**: kebab-case (mermaid-parser.ts, mermaid-to-canvas.ts)
- **import 경로**: git ls-files 기준 실제 케이싱 일치
- **shared 패키지**: 서버/클라 공용 코드는 shared에 배치

### Library/Framework Requirements
- **@xyflow/react**: 이미 설치됨 — Node, Edge 타입 사용
- **dagre**: 이미 사용 중 (dagre-layout.ts) — 노드 자동 배치
- **신규 패키지 설치 불필요** — 정규식 기반 파싱, 외부 Mermaid 라이브러리 미사용

### Testing Requirements
- **서버 테스트** (bun:test): `packages/server/src/__tests__/unit/mermaid-import.test.ts`
  - import-mermaid API 정상 동작 (Mermaid → 캔버스 저장)
  - 잘못된 Mermaid → 에러 응답
  - 테넌트 격리 확인
- **클라이언트 테스트** (bun:test): `packages/app/src/__tests__/mermaid-parser.test.ts`
  - 8종 노드 타입 파싱
  - 엣지 라벨 파싱 (양쪽 형식)
  - v1 형태 호환성 (`[/label\]`, `((label))`)
  - 빈 입력/잘못된 입력 에러 처리
  - Round-trip: canvasToMermaid → mermaidToCanvas 데이터 보존
  - 주석/style/classDef 무시
  - 인라인 노드 정의 + 엣지 조합 파싱

### v1 핵심 참조 파일
- `v1 프론트엔드 파서`: `/home/ubuntu/CORTHEX_HQ/web/static/js/corthex-app.js` 6269행 `mermaidToCytoscape()`
- `v1 역변환`: 같은 파일 6191행 `cytoscapeToMermaid()`
- `v1 MCP`: `/home/ubuntu/CORTHEX_HQ/web/mcp_sketchvibe.py` — update_canvas(mermaid_code) 호출 구조

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 13 — E13-S2]
- [Source: _bmad-output/planning-artifacts/prd.md#FR64 — SketchVibe 캔버스]
- [Source: Story 13-1 — packages/app/src/lib/canvas-to-mermaid.ts]
- [Source: v1 /home/ubuntu/CORTHEX_HQ/web/static/js/corthex-app.js#mermaidToCytoscape]
- [Source: v1 /home/ubuntu/CORTHEX_HQ/web/static/js/corthex-app.js#cytoscapeToMermaid]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Inline node definitions in edge lines: needed non-anchored regex with priority-based matching to correctly detect node types
- NODE_PATTERNS order critical: db `[(..)]` must come before agent `[..]` (longer pattern first)
- canvasToMermaid: fixed end node shape from `([..])` to `((..))`  (was same as start)

### Completion Notes List
- All 10 ACs satisfied
- Shared mermaid-parser.ts: parseMermaid() + canvasToMermaidCode() — server/client 공용
- App mermaid-to-canvas.ts: ReactFlow 래퍼 + dagre 자동 레이아웃
- canvas-to-mermaid.ts: 엣지 라벨 `-->|label|` 형식 추가, end 노드 형태 수정
- NexusPage: Mermaid 가져오기 버튼+모달, 내보내기 클립보드 복사
- Server: POST /workspace/sketches/import-mermaid 엔드포인트
- v1 호환: `[/label\]` (api), `((label))` (end) 패턴 지원
- 45 tests passing (shared), 34 app tests + 32 server tests 기존 통과 (0 regression)

### File List
- `packages/shared/src/mermaid-parser.ts` — NEW: 순수 Mermaid 파싱 + Canvas→Mermaid 변환 (공용)
- `packages/shared/src/index.ts` — MODIFIED: mermaid-parser export 추가
- `packages/shared/src/__tests__/mermaid-parser.test.ts` — NEW: 45 tests
- `packages/app/src/lib/mermaid-to-canvas.ts` — NEW: shared 파서 + dagre 레이아웃 래퍼
- `packages/app/src/lib/canvas-to-mermaid.ts` — MODIFIED: 엣지 라벨 추가, end 노드 형태 수정, 라벨에서 타입 주석 제거
- `packages/app/src/pages/nexus.tsx` — MODIFIED: Mermaid Import/Export 버튼+모달 추가
- `packages/server/src/routes/workspace/sketches.ts` — MODIFIED: import-mermaid API 추가
