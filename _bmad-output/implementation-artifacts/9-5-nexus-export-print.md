# Story 9.5: NEXUS 내보내기 + 인쇄

Status: done

## Story

As a 관리자,
I want 조직도를 이미지/PDF로 내보내고 인쇄하는 것을,
so that 보고서나 발표에 사용할 수 있다.

## Acceptance Criteria

1. **PNG 내보내기** — React Flow `toImage()` API로 캔버스를 PNG 파일로 다운로드. 고해상도(2x).
2. **SVG 내보내기** — React Flow 내부 SVG DOM을 클론하여 SVG 파일로 다운로드.
3. **JSON 내보내기** — 현재 조직도 구조(부서/에이전트/계층)를 JSON 파일로 다운로드.
4. **인쇄 최적화** — `window.print()` 호출 시 배경 흰색, MiniMap/Controls 숨김, 고해상도 렌더링.
5. **내보내기 드롭다운** — 도구바에 "내보내기" 버튼 → 드롭다운 메뉴 (PNG / SVG / JSON / 인쇄).
6. **파일명 규칙** — `NEXUS-{회사명}-{YYYY-MM-DD}.{ext}` 형식.

## Tasks / Subtasks

- [x] Task 1: 내보내기 유틸리티 함수 (AC: #1, #2, #3, #6)
  - [x]1.1 `packages/admin/src/lib/nexus-export.ts` (NEW) — 내보내기 함수 모음
  - [x]1.2 `exportToPng(reactFlowInstance, filename)` — `getNodesBounds()` + `toObject()` → HTML Canvas API로 SVG를 PNG 변환. 2x 해상도 (`window.devicePixelRatio * 2`). `<a download>` 트릭으로 자동 다운로드.
  - [x]1.3 `exportToSvg(reactFlowWrapper, filename)` — ReactFlow 컨테이너 내부 `.react-flow__viewport` SVG 클론 → 배경 흰색 + 스타일 인라인화 → Blob 다운로드.
  - [x]1.4 `exportToJson(orgData, filename)` — OrgChartData를 정리된 JSON으로 변환 → Blob 다운로드.
  - [x]1.5 `generateFilename(companyName, ext)` — `NEXUS-{companyName}-{YYYY-MM-DD}.{ext}` 생성 유틸.

- [x] Task 2: 인쇄 기능 (AC: #4)
  - [x]2.1 `printCanvas()` 함수 — `@media print` CSS 주입 방식
  - [x]2.2 인쇄 CSS: 캔버스 배경 흰색(`bg-white`), Controls/MiniMap/Toolbar 숨김 (`display: none`), 전체 화면 차지
  - [x]2.3 `@media print` 스타일을 `nexus.tsx` 또는 별도 CSS로 추가
  - [x]2.4 인쇄 전 `fitView()` 호출 → 모든 노드 표시 → `window.print()` → 완료 후 복원

- [x] Task 3: 도구바 내보내기 드롭다운 (AC: #5)
  - [x]3.1 `nexus-toolbar.tsx` 수정 — "내보내기" 버튼 추가 (기존 버튼 오른쪽)
  - [x]3.2 드롭다운 메뉴: PNG 내보내기 / SVG 내보내기 / JSON 내보내기 / 인쇄
  - [x]3.3 드롭다운 외부 클릭 시 닫기 (useEffect + ref)
  - [x]3.4 스타일: 기존 도구바 디자인 패턴 유지 (`bg-slate-700 text-slate-300 hover:bg-slate-600`)
  - [x]3.5 드롭다운 메뉴: `bg-slate-800 border border-slate-700 rounded-lg shadow-xl` absolute 위치

- [x] Task 4: nexus.tsx 통합 (AC: 전체)
  - [x]4.1 내보내기 핸들러 함수들 추가 (useCallback)
  - [x]4.2 ReactFlow `ref` 추가 — SVG 내보내기용 컨테이너 참조
  - [x]4.3 NexusToolbar에 내보내기 콜백 props 전달
  - [x]4.4 회사 이름을 org 데이터에서 추출 → 파일명에 사용

- [x] Task 5: 테스트 (AC: 전체)
  - [x]5.1 `packages/server/src/__tests__/unit/story-9-5-nexus-export.test.ts` (NEW)
  - [x]5.2 파일명 생성 테스트 (날짜, 회사명, 확장자)
  - [x]5.3 JSON 내보내기 데이터 구조 검증
  - [x]5.4 PNG/SVG 내보내기 함수 호출 시 Blob 생성 확인 (DOM mock)
  - [x]5.5 인쇄 CSS 스타일 속성 검증
  - [x]5.6 도구바 드롭다운 상태 관리 테스트

## Dev Notes

### 기존 코드 현황 (중복 작성 금지!)

**Story 9.1에서 구현된 NEXUS 캔버스:**
1. **nexus.tsx** (328줄) — `packages/admin/src/pages/nexus.tsx`: ReactFlow + 편집 모드 + 레이아웃 저장/복원 + 노드 선택 + 30초 폴링
2. **nexus-toolbar.tsx** (76줄) — `packages/admin/src/components/nexus/nexus-toolbar.tsx`: 보기/편집 모드 토글, 자동 정렬, 저장, 전체 보기 버튼
3. **4개 커스텀 노드** — `packages/admin/src/components/nexus/`: company-node, department-node, agent-node, unassigned-group-node
4. **ELK 레이아웃** — `packages/admin/src/lib/elk-layout.ts`: `computeElkLayout()` + `OrgChartData` 타입
5. **서버 API** — `packages/server/src/routes/admin/nexus-layout.ts`: GET/PUT 레이아웃

**사용 가능한 React Flow API:**
```typescript
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react'

// React Flow v12 내보내기 관련 API:
// - useReactFlow(): { getNodes, getEdges, getViewport, fitView, toObject }
// - getNodesBounds(nodes): { x, y, width, height } — 모든 노드 바운딩 박스
// - getViewportForBounds(bounds, width, height, minZoom, maxZoom, padding): viewport
```

**PNG 내보내기 구현 패턴 (React Flow 공식):**
```typescript
// React Flow v12에서 PNG 내보내기는 toPng/toSvg 직접 API 없음
// HTML Canvas API 사용:
// 1. getNodesBounds()로 바운딩 박스 계산
// 2. getViewportForBounds()로 뷰포트 계산
// 3. document.querySelector('.react-flow__viewport') SVG 추출
// 4. foreignObject 포함 SVG → Canvas drawImage → toDataURL('image/png')
// 또는 html-to-image 라이브러리 사용 (권장)
```

**html-to-image 라이브러리 (권장):**
```bash
# 설치 필요 (admin 패키지에)
cd packages/admin && npm install html-to-image
```
```typescript
import { toPng, toSvg } from 'html-to-image'
// toPng(element, options) → Promise<string> (data URL)
// toSvg(element, options) → Promise<string> (data URL)
// options: { width, height, backgroundColor, pixelRatio, filter }
```

**주의: html-to-image vs html2canvas:**
- `html-to-image` — 가벼움 (17KB), SVG 기반, React Flow 공식 예제에서 사용
- `html2canvas` — 무거움 (200KB+), Canvas 기반, foreignObject 문제
- **html-to-image 사용** (React Flow 공식 권장)

### 아키텍처 준수 사항

1. **프론트엔드 전용 스토리** — 서버 코드 변경 없음. 모든 내보내기/인쇄는 클라이언트에서 처리.
2. **파일명**: kebab-case lowercase. 컴포넌트: PascalCase.
3. **Import 케이싱**: `git ls-files` 정확히 매칭 (Linux CI case-sensitive).
4. **테스트**: bun:test, `packages/server/src/__tests__/unit/` 경로.
5. **번들 최적화**: html-to-image는 17KB로 가벼움. React.lazy 불필요 (nexus 페이지 내부 사용).
6. **admin UI 패턴**: TanStack Query, useAdminStore, useToastStore, Skeleton 등.

### 기술 요구사항

**React Flow v12 DOM 구조 (내보내기 시 참조):**
```html
<div class="react-flow">
  <div class="react-flow__renderer">
    <div class="react-flow__viewport" style="transform: translate(x,y) scale(z)">
      <!-- SVG edges -->
      <!-- HTML nodes (foreignObject) -->
    </div>
  </div>
  <div class="react-flow__panel react-flow__controls"><!-- Controls --></div>
  <div class="react-flow__panel react-flow__minimap"><!-- MiniMap --></div>
</div>
```

**PNG 내보내기 구현 (html-to-image):**
```typescript
import { toPng } from 'html-to-image'

async function exportToPng(element: HTMLElement, filename: string) {
  const dataUrl = await toPng(element, {
    backgroundColor: '#ffffff',
    pixelRatio: 2,
    filter: (node) => {
      // Controls, MiniMap, Toolbar 제외
      const classes = node.className?.toString() || ''
      return !classes.includes('react-flow__controls')
        && !classes.includes('react-flow__minimap')
        && !classes.includes('nexus-toolbar')
    },
  })
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
```

**SVG 내보내기 구현 (html-to-image):**
```typescript
import { toSvg } from 'html-to-image'

async function exportToSvg(element: HTMLElement, filename: string) {
  const dataUrl = await toSvg(element, {
    backgroundColor: '#ffffff',
    filter: (node) => {
      const classes = node.className?.toString() || ''
      return !classes.includes('react-flow__controls')
        && !classes.includes('react-flow__minimap')
        && !classes.includes('nexus-toolbar')
    },
  })
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
```

**JSON 내보내기:**
```typescript
function exportToJson(orgData: OrgChartData, filename: string) {
  const json = JSON.stringify(orgData, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}
```

**인쇄 CSS (`@media print`):**
```css
@media print {
  /* 캔버스 외 요소 숨기기 */
  body > *:not(#root) { display: none !important; }
  .sidebar, .header, nav { display: none !important; }

  /* 캔버스 배경 흰색 */
  .react-flow { background: white !important; }
  .react-flow__background { display: none !important; }

  /* Controls, MiniMap, Toolbar 숨기기 */
  .react-flow__controls { display: none !important; }
  .react-flow__minimap { display: none !important; }
  [data-testid="nexus-toolbar"] { display: none !important; }

  /* 캔버스 전체 화면 */
  [data-testid="nexus-page"] {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
  }
}
```

### 이전 스토리에서 배운 것 (Story 9.1 Intelligence)

- **nexus-toolbar.tsx**: memo 컴포넌트, props로 콜백 전달 패턴
- **nexus.tsx**: ReactFlowProvider 래퍼 필수 (useReactFlow 훅 사용)
- **useReactFlow()**: `fitView({ padding: 0.2 })` 호출 패턴
- **useToastStore**: `addToast({ type: 'success' | 'error' | 'info', message })` 패턴
- **data-testid 패턴**: `nexus-page`, `nexus-toolbar` 등 테스트 식별자 사용
- **기존 도구바 레이아웃**: 4개 버튼 (보기/편집, 자동 정렬, 저장, 전체 보기) + 구분선
- **OrgChartData 타입**: `elk-layout.ts`에서 export. `{ company, departments[], unassignedAgents[] }`
- **회사명 접근**: `data.data.company.name` (org-chart API 응답)

### 안티패턴 방지

1. **html2canvas 사용 금지** — 무겁고 foreignObject 문제. html-to-image 사용.
2. **서버 사이드 렌더링 금지** — 클라이언트 전용. 서버 코드 변경 없음.
3. **jsPDF 사용 금지** — 불필요하게 무거움(200KB+). `window.print()`로 PDF 인쇄 대체.
4. **새 라우트/API 추가 금지** — 프론트엔드 전용 기능.
5. **기존 노드 컴포넌트 수정 금지** — 내보내기는 DOM 레벨에서 처리. 노드 코드 변경 불필요.

### Project Structure Notes

**신규 파일:**
- `packages/admin/src/lib/nexus-export.ts` — NEW: 내보내기/인쇄 유틸리티 함수 모음
- `packages/server/src/__tests__/unit/story-9-5-nexus-export.test.ts` — NEW: 테스트

**수정 파일:**
- `packages/admin/src/components/nexus/nexus-toolbar.tsx` — MODIFY: 내보내기 드롭다운 버튼 추가
- `packages/admin/src/pages/nexus.tsx` — MODIFY: 내보내기 핸들러 통합, ReactFlow ref 추가

**의존성 추가:**
- `html-to-image` — admin 패키지에 설치 (`cd packages/admin && npm install html-to-image`)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 9, Story 9.5]
- [Source: _bmad-output/implementation-artifacts/9-1-nexus-react-flow-canvas.md — 이전 스토리]
- [Source: packages/admin/src/pages/nexus.tsx — 현재 NEXUS 캔버스 328줄]
- [Source: packages/admin/src/components/nexus/nexus-toolbar.tsx — 현재 도구바 76줄]
- [Source: packages/admin/src/lib/elk-layout.ts — ELK 레이아웃 + OrgChartData 타입]
- [Source: React Flow v12 docs — export examples with html-to-image]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: nexus-export.ts — generateFilename, exportToPng (html-to-image 2x), exportToSvg, exportToJson (Blob), printCanvas (window.print)
- Task 2: Print CSS in index.css — @media print: white bg, hide controls/minimap/toolbar/background/sidebar, full viewport
- Task 3: nexus-toolbar.tsx — export dropdown button with outside-click-close, 4 menu items (PNG/SVG/JSON/print), isExporting state
- Task 4: nexus.tsx — reactFlowRef, isExporting state, 4 export handlers (useCallback), toast feedback on success/error
- Task 5: 44 unit tests — filename generation, JSON structure, export filter, print CSS rules, toolbar dropdown behavior, Blob creation, export workflow integration
- Dependency: html-to-image@1.11.13 installed in admin package (17KB, React Flow recommended)
- tsc --noEmit passes for both server and admin packages

### Change Log

- 2026-03-11: Code Review — 1 HIGH fixed (print CSS selector fragility), 2 MEDIUM fixed (JSON export error handling, dropdown Escape key), 1 LOW accepted (setTimeout 200ms).
- 2026-03-11: Story 9.5 implementation complete
  - NEW: packages/admin/src/lib/nexus-export.ts — export utility functions
  - MODIFIED: packages/admin/src/components/nexus/nexus-toolbar.tsx — export dropdown added
  - MODIFIED: packages/admin/src/pages/nexus.tsx — export handlers + ref integration
  - MODIFIED: packages/admin/src/index.css — @media print styles
  - NEW: packages/server/src/__tests__/unit/story-9-5-nexus-export.test.ts — 44 tests
  - DEP: html-to-image@1.11.13 added to admin

### File List

- `packages/admin/src/lib/nexus-export.ts` — NEW: export/print utility functions (generateFilename, exportToPng, exportToSvg, exportToJson, printCanvas)
- `packages/admin/src/components/nexus/nexus-toolbar.tsx` — MODIFIED: added export dropdown with 4 options (PNG/SVG/JSON/print)
- `packages/admin/src/pages/nexus.tsx` — MODIFIED: export handlers, reactFlowRef, isExporting state, toast feedback
- `packages/admin/src/index.css` — MODIFIED: added @media print CSS for NEXUS canvas
- `packages/admin/package.json` — MODIFIED: html-to-image dependency added
- `packages/server/src/__tests__/unit/story-9-5-nexus-export.test.ts` — NEW: 44 unit tests
