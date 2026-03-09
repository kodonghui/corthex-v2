# Files (파일 관리) UX/UI 설명서

> 페이지: #16 files
> 패키지: app
> 경로: /files
> 작성일: 2026-03-09

---

## 1. 페이지 목적

워크스페이스 내 공유 파일을 관리하는 페이지. 파일 업로드, 다운로드, 삭제를 수행하며, MIME 타입별 아이콘과 필터 칩으로 파일을 분류할 수 있다. 검색 기능으로 원하는 파일을 빠르게 찾는다.

**핵심 사용자 시나리오:**
- 사용자가 파일을 업로드하고 팀원과 공유
- MIME 타입별 필터(전체/이미지/문서/기타)로 원하는 파일 분류
- 파일명 검색으로 빠른 탐색
- 자신이 업로드한 파일만 삭제 가능

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────┐
│  Header: "파일 관리"                   [파일 업로드]  │
├─────────────────────────────────────────────────────┤
│  [검색 input: "파일명 검색..." ]  (max-w-xs)         │
│  [전체] [이미지] [문서] [기타]   ← FilterChip 행     │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐  │
│  │ 🖼️  photo.png          1.2MB · 2026.03.01    │  │
│  │                                    ⬇️  🗑️    │  │
│  ├───────────────────────────────────────────────┤  │
│  │ 📕  report.pdf         340KB · 2026.02.28     │  │
│  │                                    ⬇️  🗑️    │  │
│  ├───────────────────────────────────────────────┤  │
│  │ 📘  proposal.docx      56KB · 2026.02.25      │  │
│  │                                    ⬇️         │  │
│  └───────────────────────────────────────────────┘  │
│                    ... 반복 ...                      │
└─────────────────────────────────────────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ "파일 관리" [업로드]  │
├─────────────────────┤
│ [검색...]            │
│ [전체][이미지][문서]  │
│ [기타]               │
├─────────────────────┤
│ 🖼️ photo.png        │
│    1.2MB · 03.01    │
│             ⬇️ 🗑️  │
├─────────────────────┤
│ 📕 report.pdf       │
│    340KB · 02.28    │
│             ⬇️ 🗑️  │
├─────────────────────┤
│       ...           │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **파일 목록이 단순 리스트**: 파일 수가 많아지면 스크롤만으로 탐색해야 하며, 그리드 뷰 옵션이 없음
2. **파일 크기 정보 부족**: 전체 저장 용량 현황(사용량/한도)이 표시되지 않음
3. **MIME 아이콘이 이모지 의존**: 이모지 렌더링이 OS/브라우저마다 달라 일관성 부족
4. **업로드 진행률 미표시**: 업로드 중 "업로드 중..." 텍스트만 표시되고 진행률 바가 없음
5. **다중 파일 업로드 미지원**: 한 번에 하나의 파일만 업로드 가능
6. **정렬 옵션 없음**: 이름순, 날짜순, 크기순 정렬을 할 수 없음
7. **드래그&드롭 미지원**: 파일을 드래그하여 업로드할 수 없음
8. **삭제 확인 다이얼로그 디자인**: 기본 ConfirmDialog만 사용하여 파일 정보(크기, 타입)가 미표시
9. **빈 상태 디자인**: EmptyState가 텍스트 위주로 시각적 매력이 부족
10. **페이지네이션 없음**: 파일이 수백 개 이상이면 성능 저하 우려

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2(디자인 AI)가 결정** — 특정 테마 강제 없음
- 파일 타입별 시각적 구분을 MIME 아이콘 색상으로 강화
- 카드 기반 레이아웃으로 각 파일의 정보를 더 명확하게 표시

### 4.2 레이아웃 개선
- **헤더 영역 강화**: 전체 파일 수 + 총 용량 표시 추가
- **드래그&드롭 존**: 파일 목록 상단에 드롭 영역 표시 (점선 테두리)
- **업로드 진행률**: 프로그레스 바 표시
- **정렬 옵션**: 이름순/날짜순/크기순 토글 추가

### 4.3 인터랙션 개선
- 파일 행 호버 시 액션 버튼(다운로드/삭제) 강조
- 빈 상태에서 드래그&드롭 안내 일러스트
- 삭제 확인 시 파일 상세 정보(이름, 크기, 타입) 표시

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | FilesPage | 헤더에 파일 수/용량 표시, 정렬 옵션 추가 | pages/files.tsx |
| 2 | FileSearchBar | 검색 input 스타일 개선 | pages/files.tsx (인라인) |
| 3 | FileFilterChips | FilterChip 행 — 활성 칩 스타일 강화 | pages/files.tsx (인라인) |
| 4 | FileListItem | 파일 행 카드 디자인 개선, MIME 아이콘 색상 분류 | pages/files.tsx (인라인) |
| 5 | FileUploadButton | 업로드 버튼 + 진행률 바 | pages/files.tsx (인라인) |
| 6 | FileDropZone | 드래그&드롭 영역 (점선 테두리, 안내 텍스트) | pages/files.tsx (인라인) |
| 7 | ConfirmDialog | 삭제 확인 — 파일 상세 정보 포함 | @corthex/ui (공용) |
| 8 | EmptyState | 빈 상태 — 업로드 유도 일러스트 | @corthex/ui (공용) |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| files | useQuery(['files']) → GET /workspace/files | 파일 목록 |
| filter | useState<FileFilter> | 현재 필터 (all/images/documents/others) |
| search | useState<string> | 검색어 |
| deleteTarget | useState<FileRecord \| null> | 삭제 대상 파일 |
| isUploading | useState<boolean> | 업로드 진행 상태 |
| sortBy | useState<'name' \| 'date' \| 'size'> | 정렬 기준 (기본: date) |
| user | useAuthStore → user | 현재 로그인 사용자 (삭제 권한 판단) |

**API 엔드포인트 (변경 없음):**
- `GET /api/workspace/files` — 파일 목록 조회, 응답: `{ data: FileRecord[] }`
- `POST /api/workspace/files` — 파일 업로드 (FormData)
- `DELETE /api/workspace/files/:id` — 파일 삭제
- `GET /api/workspace/files/:id/download` — 파일 다운로드

**FileRecord 구조:**
```ts
{
  id: string
  userId: string
  filename: string
  mimeType: string
  sizeBytes: number
  createdAt: string
}
```

---

## 7. 색상/톤 앤 매너

| 용도 | 색상 | Tailwind |
|------|------|---------|
| 업로드 버튼 | 인디고 | bg-indigo-600 hover:bg-indigo-700 |
| 이미지 아이콘 배경 | 퍼플 계열 | bg-purple-100 dark:bg-purple-900/30 |
| 문서 아이콘 배경 | 블루 계열 | bg-blue-100 dark:bg-blue-900/30 |
| PDF 아이콘 배경 | 레드 계열 | bg-red-100 dark:bg-red-900/30 |
| 기타 파일 아이콘 배경 | 그레이 | bg-zinc-100 dark:bg-zinc-800 |
| 삭제 버튼 호버 | 레드 | hover:bg-red-50 dark:hover:bg-red-900/20 |
| 다운로드 버튼 호버 | 그레이 | hover:bg-zinc-100 dark:hover:bg-zinc-700 |
| 파일 행 호버 | 연한 그레이 | hover:bg-zinc-50 dark:hover:bg-zinc-800/50 |
| 파일 행 보더 | 그레이 | border-zinc-200 dark:border-zinc-800 |
| 드롭존 테두리 | 인디고 점선 | border-dashed border-indigo-300 |
| 활성 필터 칩 | 인디고 | bg-indigo-100 text-indigo-700 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | max-w-4xl 중앙 정렬, 넓은 패딩(p-6), 파일 행에 MIME 아이콘 + 파일명 + 메타 + 액션 버튼 한 줄 |
| **768px~1439px** (Tablet) | max-w-4xl 유지, 패딩 축소(p-4), 동일 레이아웃 |
| **~375px** (Mobile) | 풀 너비, 패딩 최소(p-4), FilterChip flex-wrap, 파일명 truncate 강화, 액션 버튼 아이콘만 표시 |

**모바일 특별 처리:**
- 검색 input: 풀 너비
- 필터 칩: flex-wrap으로 자연 줄바꿈
- 파일 행: 2줄 구조 (파일명 + 메타 / 액션)
- 업로드 버튼: 아이콘 + 짧은 텍스트

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 16번(정보국/Knowledge) 항목에 따라, 아래 기능이 **반드시** 동작해야 함.
> 참고: 이 페이지(/files)는 워크스페이스 공유 파일 관리용. v1의 "정보국"에 해당하는 RAG 문서 저장소, 폴더 구조, 부서별 지식 주입 기능은 별도 Knowledge 페이지에서 다룸.

- [x] 파일 업로드 (FormData 방식)
- [x] 파일 다운로드 (링크 방식)
- [x] 파일 삭제 (소유자만)
- [x] MIME 타입별 아이콘 표시
- [x] 타입별 필터 (전체/이미지/문서/기타)
- [x] 파일명 검색
- [x] 삭제 확인 다이얼로그

**UI 변경 시 절대 건드리면 안 되는 것:**
- `api.get('/workspace/files')` 호출 로직
- `api.upload('/workspace/files', formData)` 업로드 로직
- `api.delete('/workspace/files/${id}')` 삭제 로직
- `useAuthStore`의 user 정보로 삭제 권한 판단하는 로직
- `getMimeIcon()` MIME 타입 → 아이콘 매핑 로직 (스타일만 변경 가능)
- `filterFiles()` 필터 로직

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. Think of it like Slack or Linear, but instead of messaging coworkers, you're giving tasks to AI employees and watching them collaborate to deliver results.

This page: A file management page where users upload, browse, download, and delete shared workspace files. Files are categorized by MIME type (images, documents, spreadsheets, presentations, archives, text, etc.) and users can filter and search through them.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Page header — title "Files" or similar, with a prominent upload button on the right side. Optionally show total file count and total storage used.
2. Search bar — text input for filtering files by name. Positioned below the header.
3. Filter chips — horizontal row of toggleable chips: "All", "Images", "Documents", "Others". Active chip is visually distinct.
4. Sort selector — a dropdown or segmented control to sort files by name, date (default), or size. Positioned near the search bar or filter chips.
5. File list — vertical list of file items. Each item shows: a MIME-type icon (color-coded by category — images get one color, PDFs another, spreadsheets another, etc.), the filename (truncated if long), file size (formatted: KB/MB), upload date, and action buttons (download, delete). Delete button only visible for files owned by the current user.
6. Drag-and-drop zone — a subtle drop area (dashed border) that becomes visible when dragging files over the page.
7. Upload progress — when uploading, show a progress indicator near the upload button or inline.
8. Empty state — when no files exist or search yields no results, show a friendly empty state with an icon and helpful text encouraging upload.
9. Delete confirmation — a modal dialog confirming file deletion, showing the filename and file details.
10. Loading state — skeleton placeholders while files are loading.

Design tone — YOU DECIDE:
- This is a utility/management page — clean, functional, scannable.
- MIME type icons should be visually differentiated by color (not just shape).
- File rows should have clear hover states for interactivity.
- Light theme, dark theme, or mixed — your choice.
- Clean and professional. Easy to scan through many files quickly.

Design priorities (in order):
1. Scannability — users should quickly find the file they need among potentially hundreds.
2. Upload accessibility — the upload action should be immediately visible and easy to trigger.
3. Filter/search efficiency — switching between file types should feel instant.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 버전
```
Mobile version (375x812) of the same page described above.

Same product context: a platform where users manage AI agents. This page is for managing shared workspace files — uploading, browsing, downloading, and deleting files with MIME-type filtering.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation (switching between pages). DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile touch):
1. Page header with upload button (compact)
2. Search input (full width)
3. Filter chips (horizontally scrollable or wrapping)
4. File list (each row: MIME icon, filename, size, date, action icons)
5. Empty state
6. Loading skeleton
7. Delete confirmation dialog

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. File rows must be touch-friendly (adequate tap targets for download/delete).
2. Search and filters should be immediately accessible without scrolling.
3. Upload button must be easy to reach.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `files-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `files-title` | 페이지 제목 ("파일 관리") | 제목 표시 확인 |
| `files-upload-btn` | 파일 업로드 버튼 | 업로드 트리거 |
| `files-upload-input` | 숨겨진 file input | 파일 선택 |
| `files-search-input` | 검색 input | 파일명 검색 |
| `files-filter-all` | "전체" 필터 칩 | 전체 필터 선택 |
| `files-filter-images` | "이미지" 필터 칩 | 이미지 필터 선택 |
| `files-filter-documents` | "문서" 필터 칩 | 문서 필터 선택 |
| `files-filter-others` | "기타" 필터 칩 | 기타 필터 선택 |
| `files-list` | 파일 목록 컨테이너 | 목록 영역 |
| `files-item` | 개별 파일 행 | 파일 존재 확인 |
| `files-item-icon` | 파일 MIME 아이콘 | 타입별 아이콘 확인 |
| `files-item-name` | 파일명 텍스트 | 파일명 표시 확인 |
| `files-item-size` | 파일 크기 텍스트 | 크기 표시 확인 |
| `files-item-date` | 업로드 날짜 텍스트 | 날짜 표시 확인 |
| `files-download-btn` | 다운로드 버튼 | 파일 다운로드 |
| `files-delete-btn` | 삭제 버튼 | 삭제 다이얼로그 열기 |
| `files-delete-dialog` | 삭제 확인 다이얼로그 | 확인 모달 |
| `files-delete-confirm` | 삭제 확인 버튼 | 삭제 실행 |
| `files-delete-cancel` | 삭제 취소 버튼 | 삭제 취소 |
| `files-empty-state` | 빈 상태 컴포넌트 | 파일 없을 때 표시 |
| `files-loading-skeleton` | 로딩 스켈레톤 | 로딩 중 표시 |
| `files-drop-zone` | 드래그&드롭 영역 | 드롭 업로드 영역 |
| `files-upload-progress` | 업로드 진행률 바 | 업로드 중 진행 상태 |
| `files-sort-select` | 정렬 옵션 선택기 (이름순/날짜순/크기순) | 정렬 변경 |
| `files-file-count` | 전체 파일 수 표시 | 파일 개수 확인 |
| `files-total-size` | 총 용량 표시 | 저장 용량 확인 |
| `files-error-state` | 에러 상태 컴포넌트 | API 실패 시 표시 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /files 접속 | `files-page` 존재, 로그인 안 튕김 |
| 2 | 제목 표시 | 페이지 로드 | "파일 관리" 제목 표시 |
| 3 | 파일 목록 표시 | 파일이 있을 때 | `files-item` 1개 이상 존재 |
| 4 | 빈 상태 표시 | 파일이 없을 때 | `files-empty-state` 표시 |
| 5 | 검색 동작 | 검색 input에 텍스트 입력 | 일치하는 파일만 목록에 표시 |
| 6 | 필터 전환 — 이미지 | "이미지" 칩 클릭 | 이미지 파일만 표시 |
| 7 | 필터 전환 — 문서 | "문서" 칩 클릭 | 문서 파일만 표시 |
| 8 | 필터 전환 — 기타 | "기타" 칩 클릭 | 이미지/문서 외 파일만 표시 |
| 9 | 필터 전환 — 전체 | "전체" 칩 클릭 | 모든 파일 표시 |
| 10 | 파일 업로드 | 업로드 버튼 → 파일 선택 | 토스트 "업로드 완료" + 목록에 추가 |
| 11 | 파일 다운로드 | 다운로드 버튼 클릭 | 다운로드 링크 href 확인 |
| 12 | 파일 삭제 — 확인 다이얼로그 | 삭제 버튼 클릭 | `files-delete-dialog` 표시 + 파일명 포함 |
| 13 | 파일 삭제 — 실행 | 확인 버튼 클릭 | 파일 목록에서 제거 + 토스트 |
| 14 | 파일 삭제 — 취소 | 취소 버튼 클릭 | 다이얼로그 닫힘, 파일 유지 |
| 15 | 타인 파일 삭제 불가 | 타인 파일 행 확인 | 삭제 버튼 미표시 |
| 16 | MIME 아이콘 표시 | 파일 행 확인 | 파일 타입에 맞는 아이콘 표시 |
| 17 | 로딩 스켈레톤 | 파일 로딩 중 | `files-loading-skeleton` 표시 |
| 18 | 검색 + 필터 조합 | 검색어 + 필터 동시 적용 | 두 조건 모두 만족하는 파일만 표시 |
| 19 | 반응형 확인 | 375px 뷰포트 | 모바일 레이아웃으로 전환 |
| 20 | 업로드 진행률 | 파일 업로드 중 | `files-upload-progress` 프로그레스 바 표시 |
| 21 | 정렬 변경 | 정렬 옵션 변경 (이름순→날짜순) | 파일 목록 순서 변경 |
| 22 | 에러 상태 | API 실패 시 | `files-error-state` 표시 |
| 23 | 파일 수/용량 표시 | 파일 존재 시 | `files-file-count`와 `files-total-size` 표시 |
| 24 | 다중 파일 업로드 | 여러 파일 동시 선택 | 여러 파일 동시 업로드 + 각각 진행률 표시 |
