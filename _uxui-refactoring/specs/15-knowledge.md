# Knowledge (지식베이스) UX/UI 설명서

> 페이지: #15 knowledge
> 패키지: app
> 경로: /knowledge
> 작성일: 2026-03-09

---

## 1. 페이지 목적

AI 에이전트가 참조하는 지식 문서와 에이전트 기억(메모리)을 관리하는 페이지. 폴더 계층 구조로 문서를 정리하고, 에이전트가 작업 중 자동으로 학습한 기억을 열람/관리할 수 있음.

**핵심 사용자 시나리오:**
- 사용자가 폴더를 만들어 문서를 체계적으로 관리 (부서별, 주제별)
- 마크다운/텍스트/HTML/Mermaid 문서 작성 및 편집
- 파일 업로드 (드래그 앤 드롭 지원)
- 문서 버전 이력 확인 및 복원
- 태그 기반 검색/필터
- 에이전트 기억(메모리) 열람 -- 학습/인사이트/선호/사실 4가지 유형
- 에이전트별 기억 필터, 비활성화/삭제

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────┐
│  Header: [폴더 보기] "📚 정보국"                      │
├─────────────────────────────────────────────────────┤
│  Tabs: [문서] [에이전트 기억]                          │
├──────────────┬──────────────────────────────────────┤
│              │  Toolbar                              │
│  FolderTree  │  [검색...] [최신순 ▼] [📎 업로드][+ 새]│
│  (w-56~64)   │                                      │
│              │  Tags Bar                             │
│  폴더        │  [태그1] [태그2] [태그3] ...           │
│  ├ 전체 문서  │                                      │
│  ├ 📁 폴더1  │  Filter Chips (활성 필터 표시)         │
│  │ ├ 📁 하위 │  [검색: xxx ×] [폴더: yyy ×] [초기화] │
│  ├ 📁 폴더2  │                                      │
│  └ + 새 폴더 │  Document List                       │
│              │  ┌──────────────────────────────┐    │
│  (우클릭:    │  │ 📄 문서제목    [MD] [태그] 2분전│    │
│   하위폴더,  │  │ 📎 파일문서    [TXT] [태그]    │    │
│   이름변경,  │  │ 📊 Mermaid    [Mermaid]       │    │
│   삭제)      │  └──────────────────────────────┘    │
│              │                                      │
│              │  Pagination                           │
│              │  [이전] 1/5 [다음]          N건       │
├──────────────┴──────────────────────────────────────┤
│  (드래그 앤 드롭 오버레이)                             │
│  "📁 파일을 놓으세요"                                 │
└─────────────────────────────────────────────────────┘
```

### 문서 상세 뷰
```
┌──────────────┬──────────────────────────────────────┐
│  FolderTree  │  [← 목록]                            │
│  (유지)      │  문서 제목                            │
│              │  [MD] [태그1] [태그2] 수정: 2분 전     │
│              │  [버전 이력] [편집] [다운로드] [삭제]   │
│              │                                      │
│              │  ┌── Content ──────────────────────┐ │
│              │  │ MarkdownRenderer                │ │
│              │  │ (또는 텍스트/HTML/Mermaid)        │ │
│              │  │                                  │ │
│              │  │ (max-h-600 스크롤)               │ │
│              │  └────────────────────────────────┘ │
│              │                                      │
│              │  (파일 전용: 다운로드 CTA)             │
└──────────────┴──────────────────────────────────────┘
```

### 에이전트 기억 탭
```
┌─────────────────────────────────────────────────────┐
│  Toolbar                                            │
│  [에이전트 선택 ▼] [유형 선택 ▼] [검색...]            │
│                                                     │
│  Memory List                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │ [학습] 에이전트명                              │   │
│  │ key: "삼성전자 분석 패턴"                       │   │
│  │ content: "2024년 실적 기반 분석 시..."          │   │
│  │ 신뢰도: ████████░░ 80%                        │   │
│  │ 사용 5회 · 마지막: 2일 전 · 출처: 작업 #123    │   │
│  │                          [비활성화] [삭제]      │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  Pagination                                         │
│  총 N건                        [이전] 1/3 [다음]     │
└─────────────────────────────────────────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ [폴더] "📚 정보국"   │
├─────────────────────┤
│ [문서] [에이전트 기억] │
├─────────────────────┤
│ (폴더 트리 토글)      │
│ FolderTree (오버레이) │
├─────────────────────┤
│ [검색] [업로드][+ 새] │
│ [태그 바]            │
│ 문서 목록 (1컬럼)     │
│ ...                  │
│ [이전] 1/5 [다음]     │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **폴더 트리 공간**: 좌측 폴더 트리가 w-56~64로 고정되어 트리가 깊어지면 텍스트 잘림
2. **폴더 컨텍스트 메뉴**: ⋮ 버튼이 hover 시에만 보여서 터치 디바이스에서 접근 어려움
3. **문서 목록 정보 부족**: 목록에서 문서 크기, 작성자 등 부가 정보 미표시
4. **태그 바 한도**: 최대 15개 태그만 표시, 나머지 태그 접근 불가
5. **검색 UX**: 검색 + 폴더 + 태그 3가지 필터가 분산되어 조합 필터 상태 파악 어려움
6. **버전 이력 모달**: 모달 내부에서 버전 복원만 가능, 버전 간 diff 비교 불가
7. **에이전트 기억 탭**: 메모리 카드의 정보 밀도가 높아 스캔이 어려움
8. **드래그 앤 드롭**: 오버레이가 나타나지만 진행률이 개별 파일별로 표시되지 않음
9. **빈 상태**: 문서 빈 상태는 있으나 에이전트 기억 빈 상태 미정의
10. **모바일 폴더**: 토글 버튼으로 폴더를 보여주지만 오버레이가 아닌 인라인이라 공간 차지

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 v0.dev가 결정**
- 파일/폴더 관리 도구 느낌 (Notion, Confluence 등 참고)
- 문서 콘텐츠 유형별 아이콘/색상 구분 유지 (MD=파랑, TXT=그린, HTML=앰버, Mermaid=레드)
- 에이전트 기억 탭은 별도 톤 (AI 학습 데이터 느낌)

### 4.2 레이아웃 개선
- **폴더 트리 리사이즈**: 드래그로 폭 조절 가능하게, 또는 최소/최대 폭 토글
- **문서 목록 카드화**: 현재 리스트 아이템을 카드로 전환, 메타데이터 강화
- **태그 관리**: 태그 검색/필터 드롭다운으로 모든 태그 접근 가능
- **에이전트 기억**: 신뢰도 시각화 강화, 테이블 뷰 옵션 추가

### 4.3 인터랙션 개선
- 문서 즐겨찾기/핀 기능
- 폴더 간 문서 드래그 이동
- 버전 diff 비교 뷰
- 에이전트 기억 일괄 정리

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | KnowledgePage | 탭 + 레이아웃 spacing 조정 | pages/knowledge.tsx |
| 2 | DocsTab | 검색/필터/목록 + 상세 뷰 | pages/knowledge.tsx (인라인) |
| 3 | FolderTree | 폴더 트리 디자인 + 컨텍스트 메뉴 개선 | pages/knowledge.tsx (인라인) |
| 4 | FolderNode | 폴더 노드 (재귀), 이름변경/삭제/하위폴더 | pages/knowledge.tsx (인라인) |
| 5 | DocDetailView | 상세 뷰 타이포그래피 + 액션 버튼 정리 | pages/knowledge.tsx (인라인) |
| 6 | DocModal | 문서 생성/편집 모달 (제목, 유형, 폴더, 태그, 본문) | pages/knowledge.tsx (인라인) |
| 7 | VersionHistoryModal | 버전 이력 모달 + 복원 | pages/knowledge.tsx (인라인) |
| 8 | MemoriesTab | 에이전트 기억 목록 + 필터 + 상세 | pages/knowledge.tsx (인라인) |
| 9 | MemoryCard | 기억 카드 (신뢰도, 사용횟수, 비활성화/삭제) | pages/knowledge.tsx (인라인) |
| 10 | MarkdownRenderer | 기존 유지 (문서 렌더링) | components/markdown-renderer.tsx |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| docs | useQuery ['knowledge-docs', ...] | 문서 목록 (페이징, 검색, 폴더, 태그, 정렬) |
| folders | useQuery ['knowledge-folders'] | 폴더 트리 |
| tags | useQuery ['knowledge-tags'] | 태그 목록 + 카운트 |
| docDetail | useQuery ['knowledge-doc-detail', id] | 문서 상세 (전문) |
| versions | useQuery ['doc-versions', id] | 문서 버전 이력 |
| memories | useQuery ['agent-memories', ...] | 에이전트 기억 목록 (페이징, 필터) |
| agents | useQuery ['agents'] | 에이전트 기억 필터용 |

**API 엔드포인트 (변경 없음):**
- `GET /api/workspace/knowledge/docs?page=&limit=&search=&folderId=&tag=&sortBy=` -- 문서 목록
- `GET /api/workspace/knowledge/docs/:id` -- 문서 상세
- `POST /api/workspace/knowledge/docs` -- 문서 생성
- `PATCH /api/workspace/knowledge/docs/:id` -- 문서 수정
- `DELETE /api/workspace/knowledge/docs/:id` -- 문서 삭제
- `POST /api/workspace/knowledge/docs/upload` -- 파일 업로드 (FormData)
- `GET /api/workspace/knowledge/docs/:id/download` -- 파일 다운로드
- `GET /api/workspace/knowledge/folders` -- 폴더 트리
- `POST /api/workspace/knowledge/folders` -- 폴더 생성
- `PATCH /api/workspace/knowledge/folders/:id` -- 폴더 이름 변경
- `DELETE /api/workspace/knowledge/folders/:id` -- 폴더 삭제
- `GET /api/workspace/knowledge/tags` -- 태그 목록
- `GET /api/workspace/knowledge/docs/:id/versions` -- 버전 이력
- `POST /api/workspace/knowledge/docs/:id/versions/:versionId/restore` -- 버전 복원
- `GET /api/workspace/agents/memories?page=&limit=&agentId=&memoryType=&search=` -- 에이전트 기억 목록
- `PATCH /api/workspace/agents/memories/:id` -- 기억 수정 (비활성화)
- `DELETE /api/workspace/agents/memories/:id` -- 기억 삭제

---

## 7. 색상/톤 앤 매너

| 용도 | 색상 | Tailwind |
|------|------|---------|
| 마크다운(MD) 뱃지 | 파랑 | bg-blue-100 text-blue-700 (info) |
| 텍스트(TXT) 뱃지 | 그린 | bg-emerald-100 text-emerald-700 (success) |
| HTML 뱃지 | 앰버 | bg-amber-100 text-amber-700 (warning) |
| Mermaid 뱃지 | 레드 | bg-red-100 text-red-700 (error) |
| 학습(learning) 기억 | 파랑 | bg-blue-100 text-blue-700 |
| 인사이트(insight) 기억 | 그린 | bg-emerald-100 text-emerald-700 |
| 선호(preference) 기억 | 앰버 | bg-amber-100 text-amber-700 |
| 사실(fact) 기억 | 레드 | bg-red-100 text-red-700 |
| 선택된 폴더 배경 | 인디고 톤 | bg-indigo-50 text-indigo-700 |
| 태그 (기본) | 그레이 | bg-zinc-100 text-zinc-600 |
| 태그 (선택됨) | 인디고 | bg-indigo-600 text-white |
| 필터 칩 | 인디고 톤 | bg-indigo-50 text-indigo-700 |
| CTA 버튼 | 인디고 | bg-indigo-600 text-white |
| 삭제 버튼 | 레드 보더 | border-red-200 text-red-600 |
| 드래그 오버레이 | 인디고 톤 점선 | border-dashed border-indigo-400 |
| 신뢰도 바 배경 | 그레이 | bg-zinc-200 dark:bg-zinc-700 |
| 신뢰도 바 값 | 인디고 | bg-indigo-500 |
| 폴더 트리 배경 | 연한 그레이 | bg-zinc-50/50 dark:bg-zinc-900/50 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 2컬럼 (폴더 트리 w-64 + 문서 목록), 넓은 패딩 |
| **768px~1439px** (Tablet) | 2컬럼 (폴더 트리 w-56 + 문서 목록), 축소 패딩 |
| **~375px** (Mobile) | 1컬럼, 폴더 트리 토글 (숨김/표시), 풀폭 목록 |

**모바일 특별 처리:**
- 폴더 트리: 토글 버튼으로 표시/숨김, 인라인 또는 오버레이
- 문서 목록: 카드 풀폭, 터치 영역 확보
- 도구 바: 검색 + 업로드 + 새 문서가 한 줄에 수평 스크롤
- 태그 바: 가로 스크롤
- 문서 상세: 풀폭, 액션 버튼 가로 스크롤
- 에이전트 기억: 카드 풀폭, 필터 드롭다운 축소
- 파일 업로드: 드래그 앤 드롭 대신 파일 선택 버튼 우선
- DocModal: 풀스크린에 가까운 크기

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 16번(정보국/Knowledge) + 20번(에이전트 메모리) 항목에 따라, 아래 기능이 **반드시** 동작해야 함:

**문서 관리:**
- [x] 폴더 계층 구조 (CRUD + 하위 폴더)
- [x] 문서 CRUD (마크다운/텍스트/HTML/Mermaid)
- [x] 파일 업로드 (드래그 앤 드롭 + 파일 선택)
- [x] 문서 검색 (제목/내용)
- [x] 태그 기반 필터
- [x] 폴더 기반 필터
- [x] 정렬 (최신순/이름순)
- [x] 페이징 (20건 단위)
- [x] 문서 버전 이력 + 복원
- [x] 파일 다운로드
- [x] 마크다운 렌더링 (MarkdownRenderer)
- [x] 컨텐츠 유형별 뱃지 (MD/TXT/HTML/Mermaid)

**에이전트 기억:**
- [x] 기억 목록 (에이전트별, 유형별 필터)
- [x] 기억 유형 4가지 (학습/인사이트/선호/사실)
- [x] 신뢰도 표시 (프로그레스 바)
- [x] 사용 횟수 + 마지막 사용일 표시
- [x] 기억 비활성화/활성화 토글
- [x] 기억 삭제
- [x] 기억 검색
- [x] 기억 상세 보기 (확장)
- [x] 기억 출처(source) 표시

**참고 (백엔드 기능 -- UI에서 인지만):**
- v1 16번: "부서별 지식 자동 주입 (에이전트 시스템 프롬프트에)" -- 백엔드 로직이므로 UI 변경 범위 밖이지만, 문서가 에이전트에게 주입된다는 사실을 사용자가 인지할 수 있도록 안내 텍스트 고려
- v1 20번: "에이전트 메모리 시스템 프롬프트 자동 주입" -- 동일하게 UI 범위 밖

**UI 변경 시 절대 건드리면 안 되는 것:**
- KnowledgeDoc/KnowledgeFolder/AgentMemory 타입 정의
- 폴더 트리 재귀 구조 (FolderNode)
- buildParams() 쿼리 파라미터 빌드 로직
- 파일 업로드 로직 (FormData + api.upload)
- 드래그 앤 드롭 이벤트 핸들러
- 버전 복원 mutation
- 에이전트 기억 필터/검색/페이징 로직

---

## 10. v0.dev 디자인+코딩 지시사항

> v0.dev가 디자인과 코딩을 동시에 수행합니다. 아래 내용을 v0 프롬프트에 포함하세요. 레이아웃은 v0에게 자유도를 부여합니다.

### v0 프롬프트 (디자인+코딩 통합)
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. Think of it like Slack or Linear, but instead of messaging coworkers, you're giving tasks to AI employees and watching them collaborate to deliver results.

This page: A knowledge base management page with two tabs — Documents and Agent Memories. It's where users organize reference materials that AI agents use during their work, and where they can browse what the AI agents have automatically learned over time.

User workflow:
1. DOCUMENTS TAB: User navigates a folder tree on the left side to organize documents by department or topic. The main area shows a searchable, filterable, paginated list of documents. Users can create new markdown/text documents, upload files via drag-and-drop, and manage tags. Clicking a document opens a detail view with rendered content (markdown, Mermaid diagrams, etc.), version history, and edit/delete actions.
2. AGENT MEMORIES TAB: User browses AI agent memories — things the agents automatically learned during work. Each memory has a type (learning/insight/preference/fact), a confidence score (shown as a progress bar), usage count, source reference, and can be deactivated or deleted. Filterable by agent and memory type.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Tab navigation — two tabs: Documents and Agent Memories.
2. Folder tree panel — left sidebar within the content area showing a hierarchical folder structure. Folders can be created, renamed, deleted, and nested. Each folder shows its document count. "All Documents" option at the top.
3. Document list — right of the folder tree. Shows document title, content type badge (MD/TXT/HTML/Mermaid with distinct colors), tags, and relative timestamp. Includes: search input, sort dropdown (newest/alphabetical), upload button, create button.
4. Tags bar — horizontal scrollable row of tag pills below the toolbar. Clicking a tag filters the list. Selected tag is highlighted.
5. Filter chips — active filters shown as removable chips (search term, selected folder, selected tag) with a "clear all" option.
6. Drag-and-drop zone — when files are dragged over the document list, show a dashed-border overlay with a drop target message.
7. Document detail view — replaces the list when a document is clicked. Shows: back button, title, content type badge, tags, last modified time, action buttons (version history, edit, download, delete). Content rendered via markdown renderer or plain text.
8. Document create/edit modal — form with: title input, content type selector, folder selector (hierarchical dropdown), tags input (comma-separated), content textarea.
9. Version history modal — list of versions with version number, timestamp, change note, editor name. Each version has a "restore" button.
10. Agent memories list — cards showing: memory type badge, agent name, key, content preview (expandable), confidence bar, usage count, last used time, source. Actions: deactivate toggle, delete.
11. Memory filters — agent dropdown, memory type dropdown, search input.
12. Pagination — for both documents and memories.
13. Empty states — for empty document list and empty memories list.

Design tone — YOU DECIDE:
- This is a knowledge management / wiki-style interface. Think Notion, Confluence, or Obsidian — but simpler.
- The folder tree should feel native and familiar, like a file explorer.
- Documents need clean, readable rendering — they're reference materials.
- Agent memories are a unique concept — show them as interesting data cards, not boring table rows.
- Confidence scores should be visually intuitive (progress bars or similar).
- Light theme, dark theme, or mixed — your choice.

Design priorities (in order):
1. Navigation efficiency — users should quickly find the document they need via folder tree + search + tags.
2. Document readability — rendered content must be clean and scannable.
3. Agent memories should feel like an interesting "AI brain" view — not just a data dump.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 참고사항
```
Mobile version (375x812) of the same page described above.

Same product context: a platform where users manage AI agents. This page is a knowledge base with two tabs — Documents (folder tree + searchable list + detail view) and Agent Memories (filterable memory cards with confidence scores).

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation (switching between pages). DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile touch):
1. Tab navigation (Documents / Agent Memories)
2. Folder tree — toggleable panel (hidden by default, shown via button)
3. Document list with search, upload, create buttons
4. Tags bar (horizontally scrollable)
5. Document detail view (full-screen within content area)
6. Document create/edit modal (full-screen)
7. Agent memories list with filters (agent, type, search)
8. Memory cards with confidence bars and actions
9. File upload button (drag-and-drop not practical on mobile)
10. Pagination controls
11. Empty / loading states

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. Navigation must work well without the folder tree always visible.
2. Document content must be readable without horizontal scrolling.
3. Memory cards should stack cleanly in a single column.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `knowledge-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `knowledge-tab-docs` | 문서 탭 | 탭 전환 |
| `knowledge-tab-memories` | 에이전트 기억 탭 | 탭 전환 |
| `knowledge-folder-toggle` | 폴더 보기/숨기기 버튼 | 모바일 폴더 토글 |
| `knowledge-folder-tree` | 폴더 트리 컨테이너 | 폴더 트리 영역 |
| `knowledge-folder-all` | 전체 문서 버튼 | 폴더 필터 해제 |
| `knowledge-folder-item` | 폴더 노드 | 개별 폴더 |
| `knowledge-folder-create-btn` | 새 폴더 버튼 | 폴더 생성 |
| `knowledge-folder-create-input` | 폴더 이름 입력 | 폴더 생성 |
| `knowledge-folder-menu` | 폴더 컨텍스트 메뉴 | 이름변경/삭제/하위폴더 |
| `knowledge-folder-rename` | 이름 변경 메뉴 | 폴더 이름 변경 |
| `knowledge-folder-delete` | 삭제 메뉴 | 폴더 삭제 |
| `knowledge-folder-add-child` | 하위 폴더 메뉴 | 하위 폴더 생성 |
| `knowledge-search-input` | 검색 입력 | 문서 검색 |
| `knowledge-sort-select` | 정렬 드롭다운 | 최신순/이름순 |
| `knowledge-upload-btn` | 파일 업로드 버튼 | 파일 업로드 |
| `knowledge-create-btn` | + 새 문서 버튼 | 문서 생성 |
| `knowledge-tag-item` | 태그 필 | 태그 필터 |
| `knowledge-filter-chip` | 필터 칩 | 활성 필터 표시 |
| `knowledge-filter-clear` | 전체 초기화 | 필터 초기화 |
| `knowledge-doc-list` | 문서 목록 컨테이너 | 문서 목록 영역 |
| `knowledge-doc-item` | 문서 항목 | 개별 문서 |
| `knowledge-doc-type-badge` | 콘텐츠 유형 뱃지 | MD/TXT/HTML/Mermaid |
| `knowledge-doc-empty` | 빈 상태 | 문서 없을 때 |
| `knowledge-doc-loading` | 로딩 스켈레톤 | 문서 로딩 중 |
| `knowledge-pagination` | 페이지네이션 | 페이지 이동 |
| `knowledge-pagination-prev` | 이전 페이지 | 이전 |
| `knowledge-pagination-next` | 다음 페이지 | 다음 |
| `knowledge-dropzone` | 드래그 앤 드롭 영역 | 파일 드롭 |
| `knowledge-detail-back` | ← 목록 버튼 | 목록으로 돌아가기 |
| `knowledge-detail-title` | 문서 제목 | 상세 뷰 제목 |
| `knowledge-detail-content` | 문서 본문 | 렌더링된 콘텐츠 |
| `knowledge-detail-version-btn` | 버전 이력 버튼 | 버전 모달 열기 |
| `knowledge-detail-edit-btn` | 편집 버튼 | 편집 모달 열기 |
| `knowledge-detail-download-btn` | 다운로드 버튼 | 파일 다운로드 |
| `knowledge-detail-delete-btn` | 삭제 버튼 | 문서 삭제 |
| `knowledge-doc-modal` | 문서 생성/편집 모달 | 모달 표시 확인 |
| `knowledge-doc-modal-title` | 제목 입력 | 문서 제목 |
| `knowledge-doc-modal-type` | 유형 선택 | 콘텐츠 유형 |
| `knowledge-doc-modal-folder` | 폴더 선택 | 대상 폴더 |
| `knowledge-doc-modal-tags` | 태그 입력 | 태그 설정 |
| `knowledge-doc-modal-content` | 본문 입력 | 문서 내용 |
| `knowledge-doc-modal-submit` | 저장/수정 버튼 | 폼 제출 |
| `knowledge-version-modal` | 버전 이력 모달 | 모달 표시 확인 |
| `knowledge-version-item` | 버전 항목 | 개별 버전 |
| `knowledge-version-restore-btn` | 복원 버튼 | 버전 복원 |
| `knowledge-delete-confirm` | 삭제 확인 다이얼로그 | 삭제 확인 |
| `knowledge-memory-list` | 기억 목록 컨테이너 | 기억 목록 영역 |
| `knowledge-memory-card` | 기억 카드 | 개별 기억 |
| `knowledge-memory-type-badge` | 기억 유형 뱃지 | 학습/인사이트/선호/사실 |
| `knowledge-memory-confidence` | 신뢰도 바 | 신뢰도 표시 |
| `knowledge-memory-toggle-btn` | 비활성화/활성화 버튼 | 기억 토글 |
| `knowledge-memory-delete-btn` | 기억 삭제 버튼 | 기억 삭제 |
| `knowledge-memory-expand-btn` | 기억 확장 버튼 | 상세 보기 |
| `knowledge-memory-agent-filter` | 에이전트 필터 | 에이전트별 필터 |
| `knowledge-memory-type-filter` | 유형 필터 | 유형별 필터 |
| `knowledge-memory-search` | 기억 검색 | 기억 검색 |
| `knowledge-memory-empty` | 빈 상태 | 기억 없을 때 |
| `knowledge-memory-pagination` | 기억 페이지네이션 | 페이지 이동 |
| `knowledge-error-state` | 에러 상태 | API 에러 시 표시 |
| `knowledge-loading` | 로딩 스켈레톤 | 데이터 로딩 중 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /knowledge 접속 | `knowledge-page` 존재, 문서 탭 기본 선택 |
| 2 | 폴더 트리 표시 | 데스크톱에서 | 폴더 트리 좌측 표시 |
| 3 | 폴더 선택 | 폴더 클릭 | 해당 폴더 문서만 필터링, 필터 칩 표시 |
| 4 | 폴더 전체 선택 | 전체 문서 클릭 | 폴더 필터 해제 |
| 5 | 폴더 생성 | + 버튼 → 이름 입력 → Enter | 폴더 트리에 추가 |
| 6 | 폴더 이름 변경 | ⋮ → 이름 변경 → 수정 → Enter | 이름 변경 반영 |
| 7 | 폴더 삭제 | ⋮ → 삭제 | 폴더 트리에서 제거 |
| 8 | 하위 폴더 생성 | ⋮ → 하위 폴더 → 이름 → Enter | 부모 아래 추가 |
| 9 | 문서 검색 | 검색 입력 | 제목/내용 검색 결과 표시, 필터 칩 |
| 10 | 태그 필터 | 태그 클릭 | 해당 태그 문서만 표시, 태그 하이라이트 |
| 11 | 정렬 변경 | 이름순 선택 | 문서 목록 정렬 변경 |
| 12 | 새 문서 생성 | + 새 문서 → 제목/내용 입력 → 저장 | 문서 목록에 추가 |
| 13 | 파일 업로드 | 업로드 버튼 → 파일 선택 | 업로드 완료 토스트 |
| 14 | 문서 클릭 | 목록에서 문서 클릭 | 상세 뷰 표시, 마크다운 렌더링 |
| 15 | 문서 편집 | 편집 버튼 → 내용 수정 → 저장 | 수정 반영 |
| 16 | 문서 삭제 | 삭제 → 확인 | 목록에서 제거 |
| 17 | 버전 이력 | 버전 이력 클릭 | 버전 모달 표시, 버전 목록 |
| 18 | 버전 복원 | 복원 버튼 클릭 | 해당 버전으로 복원 |
| 19 | 목록 돌아가기 | ← 목록 클릭 | 문서 목록 표시 |
| 20 | 필터 초기화 | 전체 초기화 클릭 | 모든 필터 해제 |
| 21 | 페이지 이동 | 다음 페이지 클릭 | 다음 페이지 문서 표시 |
| 22 | 에이전트 기억 탭 | 기억 탭 클릭 | 기억 목록 표시 |
| 23 | 기억 에이전트 필터 | 에이전트 선택 | 해당 에이전트 기억만 표시 |
| 24 | 기억 유형 필터 | 유형 선택 | 해당 유형 기억만 표시 |
| 25 | 기억 검색 | 검색 입력 | 기억 검색 결과 표시 |
| 26 | 기억 확장 | 카드 클릭 | 전체 내용 표시 |
| 27 | 기억 비활성화 | 비활성화 버튼 클릭 | 비활성 상태 변경 |
| 28 | 기억 삭제 | 삭제 → 확인 | 목록에서 제거 |
| 29 | 모바일 폴더 토글 | 폴더 보기 버튼 | 폴더 트리 표시/숨김 토글 |
| 30 | 반응형 레이아웃 | 375px 뷰포트 | 1컬럼, 폴더 숨김 기본 |
| 31 | 빈 상태 (문서) | 문서 없을 때 | `knowledge-doc-empty` 표시 |
| 32 | 빈 상태 (기억) | 기억 없을 때 | `knowledge-memory-empty` 표시 |
| 33 | 드래그 앤 드롭 | 파일을 문서 영역에 드래그 | 드롭 오버레이 표시 |
| 34 | 다운로드 | 파일 문서 다운로드 클릭 | 다운로드 시작 |
| 35 | 에러 상태 | API 에러 발생 | `knowledge-error-state` 에러 메시지 + 재시도 버튼 |
| 36 | 로딩 상태 | 데이터 로딩 중 | `knowledge-loading` 스켈레톤 표시 |
