# Workflows UX/UI 설명서

> 페이지: #19 workflows
> 패키지: admin
> 경로: /admin/workflows
> 작성일: 2026-03-09

---

## 1. 페이지 목적

관리자가 AI 에이전트 조직의 **자동화 워크플로우를 생성, 편집, 실행, 추적**하는 페이지. 다단계 스텝(Tool/LLM/Condition)을 DAG 구조로 정의하고, 캔버스 기반 비주얼 에디터 또는 폼 에디터로 편집할 수 있다. AI가 반복 패턴을 분석하여 워크플로우를 자동 제안하는 기능도 포함.

**핵심 사용자 시나리오:**
- 관리자가 "데이터 수집 -> 분석 -> 보고서" 같은 다단계 워크플로우를 생성
- 캔버스에서 노드를 드래그하여 DAG 형태로 스텝 간 의존성 정의
- 워크플로우를 즉시 실행하고 각 스텝의 성공/실패/소요시간을 확인
- AI 패턴 분석으로 반복 업무를 자동 워크플로우로 제안받기

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────────┐
│  "워크플로우 관리"              [패턴 분석] [+ 새 워크플로우] │
├─────────────────────────────────────────────────────────┤
│  [워크플로우 (N)] | [제안 (N)]    ← 탭                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─ 워크플로우 카드 ─────────────────────────────────┐   │
│  │ 이름 / 설명 / 활성|비활성 / N개 스텝 / 날짜       │   │
│  │ [tool → llm → condition] ← 미니 DAG              │   │
│  │                              [실행][이력][편집][삭제]│   │
│  └────────────────────────────────────────────────────┘   │
│                                                         │
│  (반복)                                                  │
│                                                         │
├─ 편집 모드 진입 시 ──────────────────────────────────────┤
│  "새 워크플로우 / 워크플로우 편집"    [캔버스|폼] [← 목록] │
│  ┌─ 이름/설명 폼 ──────────────────────────────────┐    │
│  └──────────────────────────────────────────────────┘    │
│  ┌─ 캔버스 에디터 (SVG) ───────────────────┬─ 노드 편집 ┐│
│  │ [+ 노드 추가] [자동 정렬] [JSON 편집]   │  이름      ││
│  │                                         │  타입      ││
│  │  ┌──────┐    ┌──────┐    ┌──────┐      │  액션      ││
│  │  │ Tool │ → │ LLM  │ → │ Cond │      │  프롬프트   ││
│  │  └──────┘    └──────┘    └──────┘      │  [노드삭제] ││
│  │  (드래그 이동, 줌, 패닝)                │            ││
│  └─────────────────────────────────────────┴────────────┘│
│                                          [저장]          │
├─ 실행 이력 모드 ────────────────────────────────────────┤
│  "실행 이력" / 워크플로우명        [지금 실행] [← 목록]   │
│  ┌─ 실행 카드 ─────────────────────────────────────┐    │
│  │ [성공|실패] N개 스텝 / N.N초 / 날짜시간          │    │
│  │ [████████░░] ← 스텝 성공/실패 미니바             │    │
│  └──────────────────────────────────────────────────┘    │
│  (클릭 시 실행 상세 → 각 스텝 결과/에러/소요시간)        │
└─────────────────────────────────────────────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ "워크플로우 관리"     │
│ [패턴분석][+ 새 워크] │
├─────────────────────┤
│ [워크플로우] [제안]   │
├─────────────────────┤
│ ┌─ 카드 ──────────┐ │
│ │ 이름/설명        │ │
│ │ 미니 DAG (가로)  │ │
│ │ [실행][이력]     │ │
│ │ [편집][삭제]     │ │
│ └─────────────────┘ │
│ (반복)               │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **캔버스 에디터 모바일 미대응**: SVG 캔버스가 마우스 기반이라 터치 환경에서 노드 드래그, 엣지 연결이 불가능
2. **미니 DAG 가독성 부족**: 워크플로우 목록의 미니 DAG가 pill 태그를 화살표로 연결한 형태라 복잡한 DAG 구조(병렬/분기)를 표현 불가
3. **빈 상태 디자인 약함**: 텍스트만 있고 시각적 가이드(일러스트, CTA)가 부족
4. **편집 모드 전환이 페이지 교체 방식**: 목록 -> 편집 시 컨텍스트 유실 (뒤로가기 시 스크롤 위치 리셋)
5. **실행 결과 표시**: 스텝별 output이 JSON dump 형태라 가독성 떨어짐
6. **캔버스 ↔ 폼 전환 시 데이터 불일치 가능성**: 캔버스에서 추가한 position 메타데이터가 폼에서는 보이지 않음
7. **제안 탭의 상호작용 부족**: 수락/거절만 있고 제안 내용을 미리 편집할 수 없음
8. **JSON 편집기 UX**: textarea 기반이라 문법 하이라이팅이 없고 에러 위치 표시 불가
9. **로딩 상태**: "로딩 중..." 텍스트만 있고 skeleton UI 없음
10. **캔버스 노드 라벨 잘림**: 16자 초과 시 잘리는데 툴팁이나 확장 방법이 없음

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 v0.dev가 결정** -- 현재의 light/dark zinc 베이스 톤에 얽매이지 않음
- 상태별 색상 구분 유지: 성공(green), 실패(red), 진행중(amber), 비활성(zinc)
- 스텝 타입별 색상 코드 유지: Tool(blue), LLM(purple), Condition(amber)

### 4.2 레이아웃 개선
- **목록 뷰 카드 강화**: 미니 DAG를 실제 노드/엣지 형태의 축소 다이어그램으로 교체
- **편집 모드**: 모달/패널 방식으로 목록 컨텍스트 유지 검토
- **실행 이력**: 타임라인 형태로 스텝 진행 과정 시각화

### 4.3 인터랙션 개선
- 캔버스: 터치 이벤트 지원 + 핀치 줌 추가
- 제안 카드: "미리보기" 버튼으로 제안 내용을 캔버스에서 확인 가능하도록
- JSON 편집기: 구문 하이라이팅 + 에러 표시

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | WorkflowsPage | 목록 카드 디자인 개선, skeleton 로딩 | pages/workflows.tsx |
| 2 | WorkflowCanvas | 터치 지원, 노드 라벨 확장, 툴바 아이콘화 | components/workflow-canvas.tsx |
| 3 | WorkflowEditor | 이름/설명 폼 + 캔버스/폼 토글 레이아웃 개선 | pages/workflows.tsx (내부) |
| 4 | StepForm | 폼 에디터 내 스텝 카드 디자인 정리 | pages/workflows.tsx (내부) |
| 5 | DagPreview | 폼 모드의 DAG 미리보기 개선 | pages/workflows.tsx (내부) |
| 6 | ExecutionHistory | 실행 이력 카드 디자인, 미니바 개선 | pages/workflows.tsx (내부) |
| 7 | ExecutionDetail | 스텝 결과 표시 개선 (JSON 포맷팅) | pages/workflows.tsx (내부) |
| 8 | SuggestionCard | 제안 카드 디자인 + 미리보기 기능 | pages/workflows.tsx (내부) |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| workflows | useQuery → GET /workspace/workflows?limit=100 | 워크플로우 목록 |
| suggestions | useQuery → GET /workspace/workflows/suggestions?limit=100 | AI 제안 목록 |
| executions | useQuery → GET /workspace/workflows/{id}/executions?limit=50 | 실행 이력 |
| selectedCompanyId | useAdminStore | 회사 필터 |

**API 엔드포인트 (변경 없음):**
- `GET /workspace/workflows?limit=100` -- 목록 조회
- `POST /workspace/workflows` -- 생성
- `PUT /workspace/workflows/{id}` -- 수정
- `DELETE /workspace/workflows/{id}` -- 삭제
- `POST /workspace/workflows/{id}/execute` -- 실행
- `GET /workspace/workflows/{id}/executions?limit=50` -- 실행 이력
- `POST /workspace/workflows/analyze` -- 패턴 분석
- `GET /workspace/workflows/suggestions?limit=100` -- 제안 목록
- `POST /workspace/workflows/suggestions/{id}/accept` -- 제안 수락
- `POST /workspace/workflows/suggestions/{id}/reject` -- 제안 거절

---

## 7. 색상/톤 앤 매너

| 용도 | 색상 | Tailwind |
|------|------|---------|
| Tool 스텝 | 블루 | bg-blue-100 text-blue-700 / dark:bg-blue-900/30 dark:text-blue-300 |
| LLM 스텝 | 퍼플 | bg-purple-100 text-purple-700 / dark:bg-purple-900/30 dark:text-purple-300 |
| Condition 스텝 | 앰버 | bg-amber-100 text-amber-700 / dark:bg-amber-900/30 dark:text-amber-300 |
| 실행 성공 | 그린 | bg-green-100 text-green-700 / dark:bg-green-900/30 dark:text-green-300 |
| 실행 실패 | 레드 | bg-red-100 text-red-700 / dark:bg-red-900/30 dark:text-red-300 |
| 활성 상태 | 그린 | text-green-600 dark:text-green-400 |
| 비활성 상태 | 징크 | text-zinc-400 |
| 미저장 변경 경고 | 앰버 | text-amber-600 dark:text-amber-400 |
| 순환 참조 경고 | 앰버 | bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 캔버스 에디터 + 사이드 노드 편집 패널 (2컬럼), 넓은 카드 레이아웃 |
| **768px~1439px** (Tablet) | 캔버스 전체폭, 노드 편집은 하단 패널, 카드 목록 유지 |
| **~375px** (Mobile) | 캔버스 에디터는 터치 모드, 목록은 1컬럼 카드, 폼 에디터 권장 |

**모바일 특별 처리:**
- 캔버스: 터치 드래그 + 핀치 줌 (마우스 이벤트 -> 터치 이벤트 매핑)
- 노드 편집 패널: 풀스크린 모달로 전환
- 실행 이력: 카드 세로 스택, 미니바 유지
- JSON 편집기: 풀스크린 모달

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 14번 항목에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 워크플로우 CRUD (생성, 조회, 수정, 삭제)
- [x] 다단계 스텝 정의 (데이터 수집 -> 분석 -> 보고서)
- [x] 실행 상태 추적 (스텝별 성공/실패/소요시간)
- [x] DAG 구조 지원 (의존성, 병렬 실행, 조건 분기)

**UI 변경 시 절대 건드리면 안 되는 것:**
- `api.get/post/put/delete` 호출 로직
- `buildDagLayers` 알고리즘 (Kahn's topological sort)
- WorkflowStep 타입 정의
- 실행 결과 데이터 구조 (Execution, StepSummary)
- 캔버스의 SVG 좌표 계산 로직

---

## 10. v0.dev 디자인+코딩 지시사항

> v0.dev가 디자인과 코딩을 동시에 수행합니다. 아래 내용을 v0 프롬프트에 포함하세요. 레이아웃은 v0에게 자유도를 부여합니다.

### v0 프롬프트 (디자인+코딩 통합)
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human administrator manages an organization of AI agents. This is the ADMIN panel where the administrator manages automated workflows that AI agents execute.

This page: Workflow management — the admin creates, edits, executes, and monitors multi-step automation pipelines. Each workflow consists of sequential/parallel steps (Tool calls, LLM inferences, Conditional branches) arranged in a DAG (Directed Acyclic Graph).

User workflow:
1. Admin sees a list of existing workflows as cards — each showing name, description, active/inactive status, step count, and a mini DAG visualization.
2. Admin can create a new workflow using a visual canvas editor (drag-and-drop nodes, connect with edges) or a structured form editor.
3. Three node types exist: Tool (blue), LLM (purple), Condition (amber) — each with distinct visual styling.
4. Admin can execute a workflow and view execution history — each execution shows success/fail status per step, duration, and error details.
5. An AI pattern analyzer suggests new workflows based on detected repetitive tasks.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — approximately 1200px wide and 850px tall.

Required functional elements:
1. Workflow list — cards showing name, description, status badge (active/inactive), step count, creation date, and a mini pipeline visualization (nodes connected by arrows).
2. Tab navigation — "Workflows (N)" and "Suggestions (N)" tabs.
3. Action buttons — "Pattern Analysis" (secondary) and "+ New Workflow" (primary) in the header area.
4. Canvas editor — SVG-based visual DAG editor with draggable nodes, bezier curve edges, zoom/pan. Node types are visually distinct (Tool=blue, LLM=purple, Condition=amber). Toolbar with "Add Node", "Auto Layout", "JSON Edit", "Save" buttons.
5. Side panel — when a node is selected in the canvas, a properties panel appears on the right showing editable fields (name, type, action, timeout, retry count).
6. Execution history — list of past executions with status badges (success=green, failed=red), step count, duration, timestamp, and a mini progress bar showing per-step results.
7. Execution detail — expanded view showing each step's result, duration, output data, and error messages.
8. Suggestion cards — AI-recommended workflows with reason text, suggested steps preview, accept/reject buttons.
9. Empty state — welcoming message when no workflows exist yet.
10. Loading skeleton — placeholder UI while data loads.

Design tone — YOU DECIDE:
- This is a professional admin tool for managing complex automation pipelines.
- The canvas editor should feel like a modern visual programming tool (think: n8n, Retool, or Figma).
- Clean, functional, information-dense but not cluttered.
- Status colors must be clearly distinguishable (active vs inactive, success vs failure).

Design priorities:
1. The workflow list must be scannable — admin should quickly identify which workflows are active and their structure.
2. The canvas editor must feel intuitive for non-technical users — clear node types, easy connection creation.
3. Execution results must be immediately comprehensible — success/failure at a glance.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 참고사항
```
Mobile version (375x812) of the same page described above.

Same product context: an admin panel for managing automated AI agent workflows with multi-step pipelines (Tool/LLM/Condition nodes in DAG structure).

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation. DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile touch):
1. Workflow list as stacked cards (name, status, mini pipeline)
2. Tab navigation (Workflows / Suggestions)
3. Action buttons (compact)
4. Execution history cards
5. Suggestion cards with accept/reject
6. Loading / empty / error states

Note: The canvas editor on mobile should default to form-based editing since visual DAG editing requires more screen space. Provide a "switch to canvas" option for advanced users.

Design tone: Same as desktop — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. Workflow cards must be readable and tappable with one thumb.
2. Execution status visible at a glance.
3. Form editor should be comfortable for mobile input.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `workflows-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `workflows-tab-list` | 워크플로우 탭 | 탭 전환 |
| `workflows-tab-suggestions` | 제안 탭 | 탭 전환 |
| `workflows-create-btn` | + 새 워크플로우 버튼 | 생성 모드 진입 |
| `workflows-analyze-btn` | 패턴 분석 버튼 | AI 분석 실행 |
| `workflows-card` | 워크플로우 카드 | 개별 워크플로우 |
| `workflows-execute-btn` | 실행 버튼 | 워크플로우 즉시 실행 |
| `workflows-history-btn` | 이력 버튼 | 실행 이력 보기 |
| `workflows-edit-btn` | 편집 버튼 | 편집 모드 진입 |
| `workflows-delete-btn` | 삭제 버튼 | 워크플로우 삭제 |
| `workflows-editor-name` | 이름 입력 필드 | 편집기 이름 입력 |
| `workflows-editor-desc` | 설명 입력 필드 | 편집기 설명 입력 |
| `workflows-editor-mode-canvas` | 캔버스 모드 버튼 | 에디터 모드 전환 |
| `workflows-editor-mode-form` | 폼 모드 버튼 | 에디터 모드 전환 |
| `workflows-editor-save` | 저장 버튼 | 워크플로우 저장 |
| `workflows-editor-cancel` | 취소/목록 버튼 | 편집 취소 |
| `workflows-canvas` | SVG 캔버스 영역 | 캔버스 에디터 |
| `workflows-canvas-add-node` | 노드 추가 버튼 | 새 노드 생성 |
| `workflows-canvas-auto-layout` | 자동 정렬 버튼 | DAG 자동 배치 |
| `workflows-canvas-json-toggle` | JSON 편집 토글 | JSON 모드 전환 |
| `workflows-node-panel` | 노드 편집 사이드 패널 | 선택 노드 속성 편집 |
| `workflows-step-form` | 폼 모드 스텝 카드 | 개별 스텝 편집 |
| `workflows-step-add` | 스텝 추가 버튼 (폼) | 새 스텝 추가 |
| `workflows-dag-preview` | DAG 미리보기 | 폼 모드 DAG 시각화 |
| `workflows-execution-card` | 실행 이력 카드 | 개별 실행 기록 |
| `workflows-execution-run-btn` | 지금 실행 버튼 | 이력 화면 실행 |
| `workflows-execution-detail` | 실행 상세 뷰 | 스텝별 결과 |
| `workflows-suggestion-card` | 제안 카드 | 개별 AI 제안 |
| `workflows-suggestion-accept` | 수락 버튼 | 제안 수락 |
| `workflows-suggestion-reject` | 거절 버튼 | 제안 거절 |
| `workflows-empty-state` | 빈 상태 | 워크플로우 없을 때 |
| `workflows-loading` | 로딩 상태 | 데이터 로딩 중 |
| `workflows-error-state` | 에러 상태 | API 실패 시 에러 메시지 + 재시도 |
| `workflows-suggestions-empty` | 제안 빈 상태 | 제안 없을 때 안내 |
| `workflows-canvas-edge` | 캔버스 엣지 | 노드 간 연결선 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /admin/workflows 접속 | `workflows-page` 존재, 인증 유지 |
| 2 | 탭 전환 | 제안 탭 클릭 | 제안 목록 표시, 워크플로우 목록 숨김 |
| 3 | 새 워크플로우 생성 진입 | + 새 워크플로우 클릭 | 편집 모드 표시, 이름 입력 필드 존재 |
| 4 | 에디터 모드 전환 | 캔버스/폼 토글 클릭 | 캔버스 <-> 폼 전환 |
| 5 | 워크플로우 이름 입력 | 이름 필드에 텍스트 입력 | 입력값 반영 |
| 6 | 캔버스 노드 추가 | 노드 추가 버튼 클릭 -> 타입 선택 | 캔버스에 새 노드 표시 |
| 7 | 워크플로우 저장 | 이름 + 스텝 입력 후 저장 | 성공 토스트, 목록에 추가 |
| 8 | 워크플로우 편집 | 편집 버튼 클릭 | 기존 데이터가 채워진 편집 모드 |
| 9 | 워크플로우 삭제 | 삭제 버튼 클릭 -> 확인 | 목록에서 제거, 성공 토스트 |
| 10 | 워크플로우 실행 | 실행 버튼 클릭 | 실행 결과 토스트 (성공/실패) |
| 11 | 실행 이력 보기 | 이력 버튼 클릭 | 실행 이력 목록 표시 |
| 12 | 실행 상세 보기 | 이력 카드 클릭 | 스텝별 결과 상세 표시 |
| 13 | 패턴 분석 | 패턴 분석 버튼 클릭 | 분석 결과 토스트 |
| 14 | 제안 수락 | 수락 버튼 클릭 | 워크플로우 목록에 추가, 제안 제거 |
| 15 | 제안 거절 | 거절 버튼 클릭 | 제안 목록에서 제거 |
| 16 | 빈 상태 | 워크플로우 없을 때 | `workflows-empty-state` 표시 |
| 17 | 편집 취소 | 목록으로 버튼 클릭 | 워크플로우 목록 복귀 |
| 18 | 반응형 캔버스 | 768px 뷰포트 | 노드 편집 패널 하단 배치 |
| 19 | 에러 상태 | API 실패 시 | `workflows-error-state` 에러 메시지 + 재시도 버튼 |
| 20 | 제안 빈 상태 | 제안 없을 때 | `workflows-suggestions-empty` 안내 메시지 |
