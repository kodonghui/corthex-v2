# Story 20.4: 워크플로우 빌더 (노코드 비주얼)

Status: done

## Story

As a Company Admin,
I want a visual drag-and-drop canvas to design workflows by placing nodes and connecting them with edges,
so that I can build multi-step automation pipelines intuitively without writing any code.

## Acceptance Criteria

1. **비주얼 캔버스**: workflows.tsx 페이지에 기존 폼 기반 빌더 대신 드래그&드롭 가능한 비주얼 캔버스 추가 — 각 WorkflowStep이 노드로 표시되고, dependsOn/trueBranch/falseBranch가 엣지(화살표)로 표시
2. **노드 타입별 스타일**: Tool(파란색), LLM(보라색), Condition(주황색) 노드 — 타입별 아이콘+컬러 뱃지, 이름 표시
3. **노드 추가**: 캔버스 빈 영역 더블클릭 또는 "노드 추가" 버튼으로 새 스텝 노드 생성 — 타입 선택 후 이름/액션/파라미터 입력 모달
4. **연결(엣지) 드래그**: 노드 하단 핸들에서 다른 노드 상단 핸들로 드래그하여 dependsOn 연결 생성 — Condition 노드는 true/false 두 개의 출력 핸들
5. **노드 편집/삭제**: 노드 클릭 시 사이드 패널에서 상세 편집 (이름, 타입, 액션, systemPrompt, timeout, retryCount) — 삭제 버튼으로 노드+연결 제거
6. **자동 레이아웃**: 저장 시 또는 "정렬" 버튼 클릭 시 기존 buildDagLayers() 기반으로 노드를 계층별 자동 정렬 (병렬 노드는 같은 레이어에 가로 배치)
7. **순환 참조 감지**: 엣지 생성 시 실시간으로 순환 참조 여부 검사 — 순환 감지 시 엣지 생성 차단 + 경고 메시지
8. **기존 API 호환**: 캔버스에서 설계한 워크플로우는 기존 POST/PUT /workspace/workflows API와 동일한 steps JSON 구조로 저장 — 기존 실행 엔진 변경 없음
9. **캔버스↔JSON 동기화**: 캔버스 상태(노드 위치, 연결)가 워크플로우 steps JSON과 실시간 동기화 — JSON 에디터 토글로 직접 JSON 편집도 가능
10. **노드 위치 저장**: 각 노드의 캔버스 좌표(x, y)를 steps[].metadata.position에 저장하여 다시 열었을 때 동일한 레이아웃 유지

## Tasks / Subtasks

- [x] Task 1: 캔버스 컴포넌트 구현 (AC: #1, #2, #10)
  - [x] 1.1 WorkflowCanvas 컴포넌트 생성 — HTML5 Canvas 또는 SVG 기반 노드+엣지 렌더링
  - [x] 1.2 노드 타입별 스타일 (Tool=blue, LLM=purple, Condition=amber) + 이름+타입 뱃지 렌더링
  - [x] 1.3 노드 드래그 이동 구현 (mousedown/mousemove/mouseup) — 위치를 metadata.position에 저장
  - [x] 1.4 캔버스 패닝(드래그 이동) + 줌(마우스 휠) 구현

- [x] Task 2: 노드 추가/편집/삭제 (AC: #3, #5)
  - [x] 2.1 "노드 추가" 버튼 또는 캔버스 더블클릭 → 타입 선택 + 이름/액션 입력 모달
  - [x] 2.2 노드 클릭 시 사이드 패널 열기 — 이름, 타입, 액션, params, systemPrompt(LLM), timeout, retryCount 편집
  - [x] 2.3 노드 삭제 — 연결된 엣지도 함께 제거, dependsOn 배열에서 제거

- [x] Task 3: 엣지(연결) 시스템 (AC: #4, #7)
  - [x] 3.1 노드 하단 출력 핸들 → 다른 노드 상단 입력 핸들로 드래그하여 엣지 생성
  - [x] 3.2 Condition 노드는 true(초록)/false(빨강) 두 개의 출력 핸들
  - [x] 3.3 엣지 생성 시 순환 참조 실시간 검증 (buildDagLayers 재활용) — 차단+경고
  - [x] 3.4 엣지 클릭 삭제 (dependsOn 배열에서 제거)

- [x] Task 4: 자동 레이아웃 + JSON 동기화 (AC: #6, #8, #9)
  - [x] 4.1 "자동 정렬" 버튼 — buildDagLayers() 결과를 캔버스 좌표로 변환 (레이어=Y, 레이어 내 인덱스=X)
  - [x] 4.2 캔버스 상태 → steps JSON 실시간 변환 (노드 추가/삭제/이동 시 steps 배열 자동 갱신)
  - [x] 4.3 JSON 에디터 토글 — Monaco 대신 textarea + JSON.stringify/parse로 간단하게 구현
  - [x] 4.4 저장 시 기존 POST/PUT API 호출 (steps 구조 변경 없음, metadata.position만 추가)

- [x] Task 5: 기존 workflows.tsx 통합 (AC: #1)
  - [x] 5.1 기존 폼 기반 에디터를 비주얼 캔버스로 교체 — 리스트/실행 기록/제안 기능은 유지
  - [x] 5.2 캔버스 모드/폼 모드 토글 (사용자 선택 가능, 기본값: 캔버스)

## Dev Notes

### 기존 코드 현황 분석

**이미 존재하는 것 (재사용):**
- `packages/admin/src/pages/workflows.tsx` — 워크플로우 CRUD UI (리스트, 폼 에디터, 실행 기록, 제안)
- `packages/server/src/routes/workspace/workflows.ts` — 워크플로우 API (GET/POST/PUT/DELETE + execute + suggestions)
- `packages/server/src/db/schema.ts` — workflows, workflowExecutions, workflowSuggestions 테이블
- `packages/server/src/services/workflow/` — engine.ts, execution.ts, suggestion.ts
- 기존 buildDagLayers() — Kahn's algorithm 기반 DAG 토폴로지 정렬 (순환 참조 감지 포함)

**추가해야 할 것:**
- WorkflowCanvas 컴포넌트 (SVG 기반 노드+엣지 렌더링)
- 노드 드래그, 엣지 드래그 이벤트 핸들링
- metadata.position 저장 (기존 steps JSON에 position 필드 추가)
- JSON 에디터 토글

### 핵심 패턴

**SVG 기반 캔버스 (외부 라이브러리 없이 구현):**
- React + SVG 조합으로 직접 구현 (번들 사이즈 최소화)
- 노드 = `<g>` + `<rect>` + `<text>` (드래그 가능)
- 엣지 = `<line>` 또는 `<path>` (dependsOn 관계)
- 핸들 = `<circle>` (노드 하단에 출력, 상단에 입력)
- 패닝 = viewBox 이동, 줌 = viewBox 스케일

**WorkflowStep에 position 추가 (하위 호환):**
```typescript
type WorkflowStep = {
  id: string
  name: string
  type: 'tool' | 'llm' | 'condition'
  action: string
  params?: Record<string, unknown>
  agentId?: string
  dependsOn?: string[]
  trueBranch?: string
  falseBranch?: string
  systemPrompt?: string
  timeout?: number
  retryCount?: number
  metadata?: {
    position?: { x: number; y: number }  // 캔버스 좌표 (NEW)
  }
}
```

**buildDagLayers 재활용 (순환 참조 감지):**
```typescript
// 기존 workflows.tsx에서 추출한 함수
function buildDagLayers(steps: WorkflowStep[]): WorkflowStep[][] | null {
  // Kahn's algorithm
  // null 반환 = 순환 참조 감지됨
  // 배열 반환 = 레이어별 정렬된 스텝 (병렬 노드 같은 레이어)
}
```

**자동 레이아웃 알고리즘:**
```typescript
function autoLayout(steps: WorkflowStep[]): WorkflowStep[] {
  const layers = buildDagLayers(steps)
  if (!layers) return steps  // 순환 참조 시 레이아웃 안 함

  const LAYER_GAP = 120  // 레이어 간 Y 간격
  const NODE_GAP = 180   // 같은 레이어 내 X 간격

  return steps.map((step) => {
    const layerIdx = layers.findIndex((layer) => layer.some((s) => s.id === step.id))
    const inLayerIdx = layers[layerIdx].findIndex((s) => s.id === step.id)
    const layerWidth = layers[layerIdx].length * NODE_GAP
    const startX = (800 - layerWidth) / 2  // 캔버스 중앙 정렬

    return {
      ...step,
      metadata: {
        ...step.metadata,
        position: { x: startX + inLayerIdx * NODE_GAP, y: 60 + layerIdx * LAYER_GAP },
      },
    }
  })
}
```

### 노드 렌더링 스펙

| 노드 타입 | 배경색 | 텍스트색 | 아이콘 | 크기 |
|----------|--------|---------|-------|------|
| Tool | bg-blue-100/stroke-blue-500 | text-blue-900 | 🔧 | 140×60 |
| LLM | bg-purple-100/stroke-purple-500 | text-purple-900 | 🧠 | 140×60 |
| Condition | bg-amber-100/stroke-amber-500 | text-amber-900 | ❓ | 140×60 |

### 엣지 렌더링

- 일반 dependsOn: 회색 화살표 (stroke-zinc-400)
- Condition true: 초록 화살표 (stroke-green-500)
- Condition false: 빨강 화살표 (stroke-red-500)
- 화살표: SVG marker-end arrowhead

### 서버 변경 없음

- steps JSON 구조에 metadata.position 필드만 추가 (jsonb이므로 자유로운 확장 가능)
- API 엔드포인트 변경 없음
- 실행 엔진 변경 없음 (metadata.position은 UI 전용 정보)

### 보안 고려사항

- XSS: SVG 내부에 사용자 입력 렌더링 시 이스케이프 처리 (React JSX가 자동 처리)
- 워크플로우 크기 제한: 기존 steps 배열 크기 제한 유지

### Project Structure Notes

- 관리자 UI: `packages/admin/src/pages/workflows.tsx` (MODIFY — 캔버스 모드 추가)
- 관리자 UI: `packages/admin/src/components/workflow-canvas.tsx` (NEW — 캔버스 컴포넌트)

## Dev Agent Record

### Implementation Plan
- SVG 기반 WorkflowCanvas 컴포넌트 (외부 라이브러리 없음)
- React + SVG 조합: 노드(<g>+<rect>+<text>), 엣지(<path> bezier curve), 핸들(<circle>)
- 패닝은 viewBox 이동, 줌은 viewBox 스케일링
- buildDagLayers() null 반환으로 순환 참조 감지
- 기존 WorkflowEditor에 canvas/form 모드 토글 통합

### Debug Log
- 빌드 성공 확인 (workflows-BNotTU2R.js 43.24 kB)
- 기존 workflow-builder-ui-tea.test.ts 15개 테스트 모두 통과 (회귀 없음)

### Completion Notes
- WorkflowCanvas 컴포넌트: SVG 기반 노드+엣지 렌더링, 드래그&드롭, 패닝+줌
- 노드 타입별 스타일: Tool(파란), LLM(보라), Condition(주황) + 아이콘+컬러 뱃지
- 엣지 시스템: 핸들 드래그로 연결, Condition T/F 분기, 순환 참조 감지+차단
- 사이드 패널: 노드 클릭 시 상세 편집 (이름/타입/액션/시스템프롬프트/타임아웃/재시도)
- 자동 레이아웃: buildDagLayers() 기반 계층별 자동 정렬
- JSON 에디터 토글: textarea + JSON.stringify/parse
- 캔버스/폼 모드 토글: 기본값 캔버스, 기존 폼 모드도 유지
- 서버 변경 없음 (metadata.position은 UI 전용, jsonb에 자유 확장)

## File List

- `packages/admin/src/components/workflow-canvas.tsx` (NEW) — SVG 기반 비주얼 캔버스 컴포넌트
- `packages/admin/src/pages/workflows.tsx` (MODIFIED) — 캔버스 모드 통합, WorkflowStep 타입 import 변경
- `_bmad-output/implementation-artifacts/20-4-workflow-builder-nocode-visual.md` (MODIFIED) — 스토리 파일 업데이트
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (MODIFIED) — 상태 업데이트

## Change Log

- 2026-03-08: Story 20-4 구현 완료 — WorkflowCanvas SVG 컴포넌트 + workflows.tsx 통합

### References

- [Source: packages/admin/src/pages/workflows.tsx] — 기존 워크플로우 빌더 UI (1011 lines)
- [Source: packages/server/src/routes/workspace/workflows.ts] — 워크플로우 API
- [Source: packages/server/src/db/schema.ts] — workflows 테이블 (jsonb steps)
- [Source: packages/server/src/services/workflow/] — 실행 엔진
- [Source: _bmad-output/implementation-artifacts/18-4-workflow-builder-ui.md] — Story 18-4 구현 기록
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 20 스토리 정의
