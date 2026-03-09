# Nexus / SketchVibe (지식 그래프 캔버스) UX/UI 설명서

> 페이지: #06 nexus
> 패키지: app
> 경로: /nexus
> 작성일: 2026-03-09

---

## 1. 페이지 목적

**시각적 다이어그램 캔버스 + AI 대화**를 결합한 협업 도구. 사용자가 노드/엣지를 그려 시스템 아키텍처나 워크플로우를 설계하고, AI가 실시간으로 캔버스를 수정하거나 코드를 제안.

**핵심 사용자 시나리오:**
- 노드 팔레트에서 노드 추가 → 드래그로 배치 → 연결
- AI에게 "DB 노드 추가하고 API에 연결해줘" 같은 자연어 명령
- Mermaid 코드 가져오기/내보내기
- 캔버스 저장/불러오기 + 지식 베이스 저장
- AI와 채팅하면서 캔버스 내용 참조

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────┐
│ 헤더: SketchVibe — [캔버스명] [저장] [목록] [Mermaid]│
│ [내보내기] [지식저장] [↩] [↪] [에이전트▼] [채팅 토글] │
├──────┬──────────────────────────────┬───────────────┤
│목록   │                              │               │
│사이드 │    ReactFlow 캔버스            │  ChatArea     │
│바     │    + 노드 팔레트               │  (w-380~420px)│
│(w-52) │    + AI 프리뷰 오버레이         │               │
│       │                              │               │
│       ├──────────────────────────────┤               │
│       │ AI 명령 입력란               │               │
│       │ [AI] [입력...]    [전송]     │               │
│       ├──────────────────────────────┤               │
│       │ 노드 3개 · 연결 2개 · 미저장  │               │
└──────┴──────────────────────────────┴───────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ 헤더 (축소)          │
│ [캔버스] [채팅] 토글  │
├─────────────────────┤
│ 캔버스 또는 채팅      │
│ (탭에 따라 전환)      │
├─────────────────────┤
│ AI 명령 입력         │
│ 상태바               │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **헤더 과밀**: 버튼 10개 이상이 한 줄에 나열, 시각적 혼잡
2. **캔버스 사이드바**: w-52로 좁아서 긴 캔버스 이름 잘림
3. **노드 팔레트**: 작은 드롭다운이라 노드 타입을 탐색하기 어려움
4. **AI 프리뷰 오버레이**: 작은 카드(w-72)로 미리보기가 부족
5. **빈 캔버스 안내**: 텍스트만 있어 시각적으로 매력 없음
6. **Mermaid 모달**: 기본적인 textarea, 코드 하이라이팅 없음
7. **채팅 패널 너비**: w-380~420px로 캔버스 공간 압축
8. **상태바 정보 밀도**: 한 줄에 모든 정보가 빽빽함
9. **다크 모드 하드코딩**: bg-zinc-900 등 다크 테마만 적용, 라이트 모드 미대응
10. **에이전트 선택**: 기본 select 요소, 시각적으로 부조화

### 상태별 UI 정의

| 상태 | UI 표현 |
|------|---------|
| **캔버스 로딩 중** | 캔버스 영역에 skeleton (도트 그리드 + 회색 노드 placeholder) |
| **캔버스 목록 로딩** | 사이드바에 skeleton 리스트 |
| **AI 명령 처리 중** | AI 입력란 비활성화 + spinner + "처리 중..." 텍스트 |
| **저장 중** | 저장 버튼 spinner + "저장 중" 상태바 텍스트 |
| **저장 실패** | 상태바에 빨간 에러 메시지 + 재시도 버튼 |
| **AI 명령 실패** | AI 입력란 아래 빨간 에러 텍스트 |
| **Mermaid 파싱 에러** | 모달 내 빨간 에러 메시지 + 잘못된 줄 하이라이트 |
| **네트워크 에러** | 상단 toast 알림 또는 에러 배너 |
| **WebSocket 연결 끊김** | 상태바에 "실시간 연결 끊김" 경고 텍스트 (빨강) |
| **WebSocket 재연결 중** | 상태바에 spinner + "재연결 중..." 텍스트 |
| **빈 캔버스** | 환영 안내 카드 (노드 추가/AI 명령 사용법) |

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2(디자인 AI)가 결정** — 특정 테마 강제 없음
- 디자인 도구 느낌 (Figma, Excalidraw, Miro 참고)
- 캔버스가 주인공, UI 요소는 최소한으로

### 4.2 레이아웃 개선
- **헤더 정리**: 그룹핑 (파일 관련 | 편집 관련 | 뷰 관련)
- **노드 팔레트**: 더 넓고 시각적인 팔레트
- **캔버스 사이드바**: 필요시만 표시, 기본 숨김

### 4.3 인터랙션 개선
- 노드 드래그 앤 드롭 추가
- 에이전트 선택 드롭다운: 기본 select 대신 시각적으로 통일된 커스텀 드롭다운

### 4.4 향후 개선 (현재 범위 외)
- AI 명령 자동완성 (백엔드 연동 필요)
- 키보드 단축키 힌트 표시

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | NexusPage (NexusPageInner) | 헤더/레이아웃 정리 | pages/nexus.tsx |
| 2 | CanvasSidebar | 사이드바 스타일 개선 | components/nexus/canvas-sidebar.tsx |
| 3 | ContextMenu | 우클릭 메뉴 스타일 | components/nexus/context-menu.tsx |
| 4 | ExportKnowledgeDialog | 다이얼로그 스타일 | components/nexus/export-knowledge-dialog.tsx |
| 5 | SketchVibe 노드 스타일 | 노드 시각 디자인 | components/nexus/sketchvibe-nodes.tsx |
| 6 | EditableEdge | 엣지 스타일 | components/nexus/editable-edge.tsx |
| 7 | MermaidModal (내장) | 모달 스타일 개선 | pages/nexus.tsx (인라인) |
| 8 | AI 명령 입력 (내장) | 입력바 스타일 | pages/nexus.tsx (인라인) |
| 9 | AI 프리뷰 오버레이 (내장) | 프리뷰 카드 스타일 | pages/nexus.tsx (인라인) |
| 10 | StatusBar (내장) | 상태바 레이아웃 개선 | pages/nexus.tsx (인라인) |
| 11 | ChatArea | 채팅 패널 스타일 | pages/nexus.tsx (인라인) |
| 12 | AgentSelect | 에이전트 선택 드롭다운 개선 | pages/nexus.tsx (인라인) |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| nodes, edges | useNodesState, useEdgesState | 캔버스 그래프 데이터 |
| currentSketchId/Name | useState | 현재 캔버스 ID/이름 |
| dirty | useState | 미저장 상태 |
| chatOpen | useState | 채팅 패널 토글 |
| mobileView | useState ('canvas' or 'chat') | 모바일 뷰 |
| aiCommand, aiPreview | useState | AI 명령 + 프리뷰 |
| undoStack, redoStack | useState | Undo/Redo 스택 |

**API 엔드포인트 (변경 없음):**
- CRUD `/api/workspace/sketches` — 스케치 저장/로드
- `POST /api/workspace/sketches/ai-command` — AI 캔버스 명령
- `/api/workspace/chat/sessions` — 채팅 세션
- WebSocket: nexus 채널 (AI 실시간 캔버스 업데이트)

---

## 7. 색상/톤 앤 매너

| 용도 | 설명 |
|------|------|
| 캔버스 배경 | 도트 그리드 |
| 8종 노드 | 각 타입별 고유 색상 (start=초록, end=빨강, agent=인디고 등) |
| 선택된 노드 | 강조 보더 |
| AI 프리뷰 | 인디고 보더 오버레이 |
| 미저장 상태 | 앰버 텍스트 |
| 자동 저장 | 에메랄드 텍스트 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 캔버스 + 채팅 2패널, 사이드바 선택적 |
| **768px~1439px** (Tablet) | 캔버스 + 채팅 2패널 (채팅 축소) |
| **~375px** (Mobile) | 캔버스 ↔ 채팅 탭 전환 |

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 7번 항목에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 8종 노드 추가 (start, end, agent, system, api, decide, db, note)
- [x] 드래그 이동, 더블클릭 이름 편집, Delete 삭제
- [x] 노드 간 연결 (엣지) 생성
- [x] Mermaid 가져오기/내보내기
- [x] 캔버스 저장/불러오기
- [x] AI 자연어 명령 → 캔버스 자동 수정
- [x] AI 프리뷰 (적용/취소)
- [x] Undo/Redo
- [x] 자동 정렬 (dagre layout)
- [x] 지식 베이스에 다이어그램 저장
- [x] 채팅에 캔버스 컨텍스트 전달
- [x] WebSocket 실시간 AI 캔버스 업데이트
- [x] Command Center에서 스케치 데이터 받기 (sessionStorage)

**UI 변경 시 절대 건드리면 안 되는 것:**
- ReactFlow 캔버스 설정 (nodeTypes, edgeTypes, proOptions)
- onNodesChange/onEdgesChange/onConnect 핸들러
- Mermaid ↔ Canvas 변환 로직 (canvasToMermaid, mermaidToCanvas)
- AI 명령 mutation (aiCommandMutation)
- WebSocket nexus 채널 리스너
- useAutoSave 훅
- sessionStorage pendingGraphData 처리

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents.

This page: A visual diagramming canvas combined with AI chat — like Figma or Miro but with an AI assistant that can modify the canvas through natural language commands. Users draw system architectures, workflows, and knowledge graphs by placing nodes and connecting them with edges.

User workflow:
1. User adds nodes from a palette (8 types: start, end, agent, system, API, decision, database, note — each with unique color/shape)
2. Drags nodes to position them, connects them with edges by dragging from node handles
3. Double-clicks nodes to rename them, right-clicks for context menu (duplicate, delete)
4. Types AI commands like "Add a database node and connect it to the API server" — AI generates a preview that user can accept or reject
5. Can import/export Mermaid code, save/load canvases, and export to knowledge base
6. An AI chat panel on the right provides context-aware conversation about the diagram

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements:
1. Toolbar/header bar — compact toolbar with grouped actions: file operations (save, canvas list, new), edit operations (undo, redo, auto-layout, clear), import/export (Mermaid import, export, knowledge base save), agent selector dropdown.
2. Canvas area (center, majority of space) — infinite canvas with dot grid background. Nodes are colored shapes (each of 8 types has a distinct color). Edges are arrows between nodes. Zoom controls and minimap in corner.
3. Node palette — accessible way to add nodes. Could be a floating toolbar, sidebar panel, or contextual menu. Shows all 8 node types with their icons and colors.
4. AI command input — a compact input bar at the bottom of the canvas for typing natural language commands to the AI. Shows processing state.
5. AI preview overlay — when AI suggests changes, a floating card shows the description with Accept/Cancel buttons.
6. Chat panel (right, ~380px) — AI chat area for discussing the diagram. Can be toggled open/closed.
7. Status bar — shows node count, edge count, unsaved indicator, auto-save status.
8. Empty canvas state — welcoming guide on how to start (add nodes, use AI commands).
9. Canvas list sidebar (optional, togglable) — list of saved canvases to load.

Design tone — YOU DECIDE:
- This is a creative design tool. Think Figma, Excalidraw, or Miro.
- The canvas should be the hero — maximum space for drawing.
- UI controls should be minimal and non-intrusive.
- Light or dark theme — your choice.

Design priorities:
1. Canvas must dominate the screen — controls should be compact.
2. The node palette must be accessible but not always visible.
3. The AI input should be always visible but not take too much space.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

### 모바일 버전
```
Mobile version (375x812) of the same canvas + AI chat page.

IMPORTANT — Mobile app shell context:
- BOTTOM TAB BAR (don't include). TOP HEADER (don't include).
- Content area only.

Mobile-specific:
- Two-view toggle: Canvas view and Chat view
- Canvas view: simplified toolbar, touch-friendly node manipulation
- AI command input at bottom of canvas view
- Chat view: full-screen chat
- Compact header with essential controls only

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `nexus-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `nexus-toolbar` | 툴바/헤더 | 액션 버튼 영역 |
| `nexus-canvas` | ReactFlow 캔버스 | 캔버스 영역 |
| `nexus-save-btn` | 저장 버튼 | 캔버스 저장 |
| `nexus-list-btn` | 목록 버튼 | 사이드바 토글 |
| `nexus-mermaid-btn` | Mermaid 버튼 | 가져오기 모달 |
| `nexus-export-btn` | 내보내기 버튼 | Mermaid 내보내기 |
| `nexus-undo-btn` | 실행 취소 | Undo |
| `nexus-redo-btn` | 다시 실행 | Redo |
| `nexus-node-palette` | 노드 팔레트 | 노드 추가 |
| `nexus-node-add-btn` | + 노드 버튼 | 팔레트 열기 |
| `nexus-ai-input` | AI 명령 입력 | 자연어 명령 |
| `nexus-ai-send-btn` | AI 전송 버튼 | 명령 전송 |
| `nexus-ai-preview` | AI 프리뷰 | 미리보기 카드 |
| `nexus-ai-apply-btn` | 적용 버튼 | 프리뷰 적용 |
| `nexus-ai-cancel-btn` | 취소 버튼 | 프리뷰 취소 |
| `nexus-chat-toggle` | 채팅 토글 | 채팅 열기/닫기 |
| `nexus-chat-panel` | 채팅 패널 | 채팅 영역 |
| `nexus-status-bar` | 상태바 | 노드/엣지 수 |
| `nexus-canvas-sidebar` | 캔버스 목록 | 저장된 캔버스 |
| `nexus-empty-state` | 빈 캔버스 안내 | 비어있을 때 |
| `nexus-save-dialog` | 저장 다이얼로그 | 이름 입력 |
| `nexus-mermaid-modal` | Mermaid 모달 | 코드 입력 |
| `nexus-autolayout-btn` | 자동 정렬 버튼 | dagre 레이아웃 |
| `nexus-new-btn` | 새 캔버스 버튼 | 새 캔버스 생성 |
| `nexus-clear-btn` | 캔버스 초기화 버튼 | 노드/엣지 전체 삭제 |
| `nexus-knowledge-btn` | 지식 저장 버튼 | 지식 베이스 내보내기 |
| `nexus-agent-select` | 에이전트 선택 | AI 에이전트 변경 |
| `nexus-loading` | 로딩 상태 | 캔버스/목록 로딩 중 |
| `nexus-error` | 에러 상태 | API 실패 시 표시 |
| `nexus-node-item` | 캔버스 내 개별 노드 | 노드 존재 확인 (data-node-type attribute로 타입 구분) |
| `nexus-ws-status` | WebSocket 상태 표시 | 연결 상태 확인 |
| `nexus-context-menu` | 우클릭 메뉴 | 노드 컨텍스트 메뉴 |
| `nexus-ctx-duplicate` | 복제 옵션 | 노드 복제 |
| `nexus-ctx-delete` | 삭제 옵션 | 노드 삭제 |
| `mobile-view-canvas` | 캔버스 탭 (모바일) | 뷰 전환 |
| `mobile-view-chat` | 채팅 탭 (모바일) | 뷰 전환 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /nexus 접속 | `nexus-page` 존재 |
| 2 | 노드 추가 | + 노드 클릭 → 타입 선택 | 캔버스에 노드 추가 |
| 3 | 저장 | 저장 버튼 클릭 | 저장 다이얼로그 or 자동 저장 |
| 4 | AI 명령 | 명령 입력 + 전송 | AI 프리뷰 카드 표시 |
| 5 | AI 적용 | 프리뷰 적용 클릭 | 캔버스 업데이트 |
| 6 | AI 취소 | 프리뷰 취소 클릭 | 캔버스 변경 없음 |
| 7 | Mermaid 가져오기 | 코드 입력 + 적용 | 캔버스에 노드/엣지 표시 |
| 8 | 채팅 토글 | 토글 버튼 클릭 | 채팅 패널 열기/닫기 |
| 9 | 모바일 뷰 | 375px에서 탭 전환 | 캔버스↔채팅 전환 |
| 10 | 빈 캔버스 | 초기 상태 | 빈 캔버스 안내 표시 |
| 11 | AI 빈 입력 | 빈 텍스트 전송 시도 | 전송 버튼 비활성화 |
| 12 | 저장 실패 | 네트워크 에러 시뮬 | 에러 메시지 표시 |
| 13 | Mermaid 에러 | 잘못된 코드 입력 | 파싱 에러 피드백 |
| 14 | 자동 정렬 | 정렬 버튼 클릭 | 노드 재배치 확인 |
| 15 | Undo/Redo | 노드 추가 → Undo 클릭 | 노드 제거됨, Redo로 복원 |
