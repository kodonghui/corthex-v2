# Story 13.1: Cytoscape.js 캔버스 — 8종 노드 + 연결 관리

Status: done

## Story

As a CEO/Human 직원,
I want SketchVibe 캔버스에서 8종 노드(start, end, agent, system, api, decide, db, note)를 추가하고 연결/편집하며, 캔버스를 서버에 저장/불러올 수 있기를,
so that AI와 함께 다이어그램을 그리며 대화하고, 아이디어를 시각적으로 정리할 수 있다.

## Acceptance Criteria (BDD)

### AC1: 캔버스 CRUD API
- **Given** 인증된 사용자가 SketchVibe 페이지에 접근하면
- **When** 캔버스를 저장/불러오기/삭제할 때
- **Then** 서버 sketches 테이블에 graphData(nodes+edges JSON)가 저장/조회/삭제되고, companyId 기반 테넌트 격리가 적용된다

### AC2: 8종 노드 팔레트
- **Given** 캔버스가 표시되면
- **When** "+ 노드" 팔레트에서 노드 타입을 선택하면
- **Then** 선택한 타입의 노드가 캔버스 뷰포트 중앙 근처에 추가되며, 각 노드는 타입별 고유 모양/색상/아이콘을 가진다
- **Node types**: start(녹색 원형), end(빨간 원형), agent(파란 사각), system(회색 사각), api(주황 육각), decide(노란 다이아몬드), db(보라 실린더), note(앰버 스티키)

### AC3: 연결(Edge) 관리
- **Given** 캔버스에 2개 이상 노드가 있을 때
- **When** 노드 핸들을 드래그하여 다른 노드에 연결하면
- **Then** smoothstep 타입의 연결선이 생성되고, 연결선 더블클릭으로 라벨 편집이 가능하다

### AC4: 노드 편집
- **Given** 캔버스에 노드가 있을 때
- **When** 노드를 더블클릭하면
- **Then** 인라인 텍스트 입력으로 라벨을 편집할 수 있고, Enter로 확정, Esc로 취소된다

### AC5: 캔버스 컨트롤
- **Given** 캔버스가 표시되면
- **When** 줌/팬/미니맵/자동정렬/초기화 컨트롤을 사용하면
- **Then** 각 동작이 정상 동작하며, Delete/Backspace 키로 선택된 노드/연결을 삭제할 수 있다

### AC6: 우클릭 컨텍스트 메뉴
- **Given** 캔버스에 노드가 있을 때
- **When** 노드를 우클릭하면
- **Then** 컨텍스트 메뉴(편집/복제/삭제)가 나타나고, 캔버스 빈 영역 우클릭 시 노드 추가 메뉴가 나타난다

### AC7: 캔버스 저장/불러오기 UI
- **Given** 캔버스에 노드/연결이 그려져 있을 때
- **When** 상단 "저장" 버튼을 클릭하면
- **Then** 캔버스 이름을 입력하고 서버에 저장하며, 좌측 패널에서 저장된 캔버스 목록을 보고 불러올 수 있다

### AC8: Edge 라벨 편집
- **Given** 캔버스에 연결선이 있을 때
- **When** 연결선을 더블클릭하면
- **Then** 인라인 입력으로 라벨을 입력/수정할 수 있다

## Tasks / Subtasks

- [x] Task 1: `sketches` 테이블 추가 (Drizzle 스키마) (AC: #1)
  - [x] 1.1: sketches 테이블 정의 (id, companyId, name, graphData:jsonb, createdBy, createdAt, updatedAt)
  - [x] 1.2: Drizzle migration 생성 + 적용
  - [x] 1.3: relations 추가 (companies, users)

- [x] Task 2: SketchVibe CRUD API (AC: #1, #7)
  - [x] 2.1: `packages/server/src/routes/workspace/sketches.ts` 생성
  - [x] 2.2: GET /workspace/sketches (목록, companyId 필터)
  - [x] 2.3: GET /workspace/sketches/:id (상세)
  - [x] 2.4: POST /workspace/sketches (생성 - name, graphData)
  - [x] 2.5: PUT /workspace/sketches/:id (수정 - graphData 업데이트)
  - [x] 2.6: DELETE /workspace/sketches/:id (삭제)
  - [x] 2.7: index.ts에 sketches 라우트 등록

- [x] Task 3: Edge 라벨 편집 기능 (AC: #3, #8)
  - [x] 3.1: 커스텀 Edge 컴포넌트 생성 (더블클릭 → 인라인 라벨 편집)
  - [x] 3.2: Edge 생성 시 기본 smoothstep + 라벨 지원
  - [x] 3.3: NexusPage에 커스텀 Edge 타입 등록

- [x] Task 4: 우클릭 컨텍스트 메뉴 (AC: #6)
  - [x] 4.1: ContextMenu 컴포넌트 생성 (노드용: 편집/복제/삭제)
  - [x] 4.2: 캔버스 빈 영역 우클릭 시 노드 추가 메뉴
  - [x] 4.3: NexusPage에 컨텍스트 메뉴 이벤트 연결

- [x] Task 5: 캔버스 저장/불러오기 UI + API 연동 (AC: #7)
  - [x] 5.1: 저장 버튼 + 이름 입력 다이얼로그
  - [x] 5.2: 좌측 캔버스 목록 사이드바 (조회/선택/삭제)
  - [x] 5.3: API 호출 연동 (react-query mutations)
  - [x] 5.4: 캔버스 로드 시 nodes/edges 복원 + onLabelChange 재주입

- [x] Task 6: 기존 코드 보강 (AC: #2, #4, #5)
  - [x] 6.1: 기존 sketchvibe-nodes.tsx 8종 노드 확인 (이미 구현됨)
  - [x] 6.2: 기존 NexusPage 노드 추가/편집/삭제/연결 확인 (이미 구현됨)
  - [x] 6.3: 팔레트에서 노드 추가 기능 (컨텍스트 메뉴로 강화)

## Dev Notes

### 이미 구현된 것 (기존 코드 활용 — 새로 만들지 말 것!)
1. **8종 노드 컴포넌트**: `packages/app/src/components/nexus/sketchvibe-nodes.tsx` — StartNode, EndNode, SvAgentNode, SystemNode, ApiNode, DecideNode, DbNode, NoteNode 모두 구현됨
2. **NODE_PALETTE 정의**: 같은 파일에 8종 팔레트 아이템 정의됨
3. **NexusPage**: `packages/app/src/pages/nexus.tsx` — ReactFlow 캔버스, 노드 추가, 연결, 더블클릭 편집, 자동 정렬, 초기화, MiniMap, Controls 모두 동작 중
4. **canvas-to-mermaid**: `packages/app/src/lib/canvas-to-mermaid.ts` — 캔버스→Mermaid 변환 유틸
5. **dagre-layout**: `packages/app/src/lib/dagre-layout.ts` — 자동 정렬
6. **canvasLayouts 테이블**: `packages/server/src/db/schema.ts` 649행 — 레이아웃 저장 테이블 존재 (하지만 SketchVibe 다이어그램 저장 전용이 아님)
7. **nexusWorkflows 테이블**: schema.ts 691행 — 워크플로우 테이블 존재 (실행 체인용, SketchVibe 저장용 아님)

### 새로 구현해야 하는 것
1. **sketches 테이블**: SketchVibe 캔버스 저장 전용 테이블 (canvasLayouts는 조직도 레이아웃용이므로 별도)
2. **CRUD API**: `/api/sketches` 라우트 — v1의 `sketchvibe_handler.py` 역할
3. **Edge 라벨 편집**: 현재 연결선에 라벨 기능 없음 — 커스텀 Edge 컴포넌트 필요
4. **우클릭 컨텍스트 메뉴**: 현재 없음 — 노드/캔버스 우클릭 메뉴 추가
5. **캔버스 목록 사이드바**: 저장된 캔버스 목록 표시 + 선택/삭제
6. **저장 다이얼로그**: 캔버스 이름 입력 + 서버 저장

### v1 참조 포인트
- **v1 백엔드**: `/home/ubuntu/CORTHEX_HQ/web/handlers/sketchvibe_handler.py`
  - save-canvas, push-event, save-diagram, get-canvas-state, confirmed-list API
  - SSE 브로드캐스트 + 승인 플로우 (MCP SSE는 E13-S3에서 구현)
- **v1 프론트엔드**: `/home/ubuntu/CORTHEX_HQ/web/static/js/corthex-app.js`
  - Cytoscape.js 인스턴스 생성 (initNexusCanvas)
  - 8종 노드: agent/system/api/decide/db/start/end/note
  - edgehandles 확장으로 드래그 연결
  - cytoscapeToMermaid() 변환 함수
  - 저장/불러오기 JSON 직렬화
- **v1 MCP 서버**: `/home/ubuntu/CORTHEX_HQ/web/mcp_sketchvibe.py` (MCP SSE는 E13-S3)

### 기존 v2는 ReactFlow(@xyflow/react) 사용 — Cytoscape.js 아님
- v1은 Cytoscape.js였지만 v2에서는 이미 ReactFlow를 선택하여 전체 캔버스가 구현됨
- **ReactFlow를 유지하고 Cytoscape로 교체하지 말 것** — 이미 8종 노드 + 커넥션 + MiniMap + Controls + 자동정렬 모두 동작 중
- Epic/PRD에서 "Cytoscape.js"로 명시했지만, ReactFlow가 동일 기능을 제공하므로 기존 구현 활용

### Project Structure Notes

```
packages/
├── server/src/
│   ├── db/schema.ts              ← sketches 테이블 추가
│   ├── routes/sketches.ts        ← 신규 CRUD 라우트
│   └── app.ts                    ← 라우트 등록
├── app/src/
│   ├── pages/nexus.tsx           ← 저장/불러오기 UI 추가, 컨텍스트 메뉴 연동
│   ├── components/nexus/
│   │   ├── sketchvibe-nodes.tsx  ← 기존 8종 노드 (변경 최소화)
│   │   ├── editable-edge.tsx     ← 신규: 라벨 편집 가능 Edge
│   │   ├── context-menu.tsx      ← 신규: 우클릭 컨텍스트 메뉴
│   │   └── canvas-sidebar.tsx    ← 신규: 저장된 캔버스 목록 사이드바
│   └── lib/
│       └── canvas-to-mermaid.ts  ← 기존 (변경 불필요)
```

### Architecture Compliance
- **API 응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **테넌트 격리**: 모든 sketches 쿼리에 companyId WHERE 조건 필수
- **인증**: JWT 미들웨어 적용 (기존 auth middleware 재사용)
- **WebSocket nexus 채널**: canvas-changed 이벤트 발행 (실시간 알림용, 기본 구현만)
- **파일명**: kebab-case (editable-edge.tsx, context-menu.tsx, canvas-sidebar.tsx)
- **import 경로**: git ls-files 기준 실제 케이싱과 일치

### Library/Framework Requirements
- **@xyflow/react**: 이미 설치됨 — ReactFlow 캔버스, Controls, MiniMap, Background
- **@tanstack/react-query**: 이미 설치됨 — API 호출 캐싱
- **drizzle-orm**: 이미 설치됨 — DB 쿼리
- **hono**: 이미 설치됨 — API 라우트
- **신규 패키지 설치 불필요**

### Testing Requirements
- **서버 테스트**: bun:test
  - sketches CRUD API 테스트 (생성/조회/수정/삭제)
  - 테넌트 격리 검증 (다른 회사 데이터 접근 불가)
  - 유효성 검증 (빈 이름, 잘못된 graphData)
- **클라이언트 테스트**: bun:test
  - Edge 라벨 편집 로직
  - 컨텍스트 메뉴 동작
  - 캔버스 저장/불러오기 플로우
  - 노드 추가/삭제/연결 통합

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 13 — E13-S1]
- [Source: _bmad-output/planning-artifacts/prd.md#FR64 — SketchVibe 캔버스]
- [Source: _bmad-output/planning-artifacts/architecture.md#sketches 테이블, routes/sketches.ts, WebSocket nexus 채널]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#CEO 앱 #4 — SketchVibe]
- [Source: v1 /home/ubuntu/CORTHEX_HQ/web/handlers/sketchvibe_handler.py]
- [Source: v1 /home/ubuntu/CORTHEX_HQ/web/mcp_sketchvibe.py]
- [Source: v1 /home/ubuntu/CORTHEX_HQ/docs/sketchvibe-guide.md]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Fixed `type` destructure syntax error in test file (can't destructure TS types from dynamic imports)
- Fixed TypeScript error on NexusPage onPaneContextMenu handler (type cast needed)
- drizzle-kit generate interactive prompt issue → created migration SQL manually

### Completion Notes List
- All 8 ACs satisfied
- ReactFlow maintained (not replaced with Cytoscape.js)
- v1 SketchVibe features ported: save/load canvas, 8 node types, edge labels, context menu
- Tenant isolation via companyId on all queries
- 36 tests passing (17 server + 19 app)

### File List
- `packages/server/src/db/schema.ts` — sketches table + relations added
- `packages/server/src/db/migrations/0035_sketches-table.sql` — migration SQL
- `packages/server/src/db/migrations/meta/_journal.json` — migration journal entry
- `packages/server/src/routes/workspace/sketches.ts` — NEW: full CRUD API
- `packages/server/src/index.ts` — route registration added
- `packages/app/src/components/nexus/editable-edge.tsx` — NEW: custom edge with label editing
- `packages/app/src/components/nexus/context-menu.tsx` — NEW: right-click context menu
- `packages/app/src/components/nexus/canvas-sidebar.tsx` — NEW: saved canvases sidebar
- `packages/app/src/pages/nexus.tsx` — MODIFIED: save/load UI, context menu, edge labels, sidebar
- `packages/server/src/__tests__/unit/sketches-crud.test.ts` — NEW: 17 server tests
- `packages/app/src/__tests__/sketchvibe-canvas.test.ts` — NEW: 19 app tests
