# Story 13.3: 파일 관리 UI — 업로드/목록/다운로드/삭제 페이지

Status: done

## Story

As a 사용자,
I want 파일을 한곳에서 업로드, 조회, 다운로드, 삭제할 수 있는 관리 페이지가 있다,
so that 회사의 파일을 체계적으로 관리하고 필요한 파일을 쉽게 찾을 수 있다.

## Acceptance Criteria

1. **Given** 인증된 사용자 **When** /files 페이지 접속 **Then** 내 회사 파일 목록 표시 (최신순)
2. **Given** 파일 목록 **When** 파일 타입 필터 선택 **Then** 해당 타입만 클라이언트 필터링
3. **Given** 파일 목록 **When** 업로드 버튼 클릭 + 파일 선택 **Then** 업로드 후 목록 자동 갱신
4. **Given** 파일 항목 **When** 다운로드 버튼 클릭 **Then** 파일 다운로드 실행
5. **Given** 본인 업로드 파일 **When** 삭제 버튼 클릭 **Then** ConfirmDialog 후 소프트 삭제 + 목록 갱신
6. **Given** 사이드바 **When** 네비게이션 **Then** "파일" 메뉴 항목 표시 + /files 라우트 동작
7. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x]Task 1: 라우팅 + 사이드바 등록 (AC: #6)
  - [x]`packages/app/src/App.tsx`에 FilesPage lazy import + Route 추가
  - [x]`packages/app/src/components/sidebar.tsx` 업무 섹션에 `{ to: '/files', label: '파일', icon: '📁' }` 추가

- [x]Task 2: FilesPage 생성 — 파일 목록 + 필터 (AC: #1, #2)
  - [x]`packages/app/src/pages/files.tsx` 생성
  - [x]`useQuery` — GET /api/workspace/files 호출
  - [x]파일 목록 카드 렌더링: 아이콘 + 파일명 + 크기 + 날짜
  - [x]MIME 타입 아이콘 매핑 함수 (image→🖼️, pdf→📕, word→📘, excel→📗, pptx→📙, text→📝, json→{}, zip→🗂️)
  - [x]FilterChip으로 타입별 필터 (전체/이미지/문서/기타)
  - [x]파일명 검색 (클라이언트 filter)
  - [x]빈 상태 UI (EmptyState)

- [x]Task 3: 파일 업로드 기능 (AC: #3)
  - [x]업로드 버튼 + hidden file input
  - [x]`api.upload` 사용 → useMutation + invalidateQueries
  - [x]업로드 중 로딩 상태 표시

- [x]Task 4: 다운로드 + 삭제 기능 (AC: #4, #5)
  - [x]다운로드: `<a href="/api/workspace/files/:id/download" download>` 링크
  - [x]삭제: useMutation → DELETE /api/workspace/files/:id
  - [x]ConfirmDialog 사용 (삭제 확인)
  - [x]삭제 후 invalidateQueries

- [x]Task 5: 빌드 검증 (AC: #7)
  - [x]`npx turbo build --force` → 3/3 성공

## Dev Notes

### 기존 인프라 활용

1. **파일 API 4개 이미 구현** (Story 13-1)
   - POST /api/workspace/files — 업로드
   - GET /api/workspace/files — 목록 (최신순 50개)
   - GET /api/workspace/files/:id/download — 다운로드
   - DELETE /api/workspace/files/:id — 소프트 삭제

2. **api.upload 메서드** (Story 13-2에서 추가)
   - `api.upload<T>(path, formData)` — FormData multipart 업로드

3. **공유 UI 컴포넌트** (@corthex/ui)
   - Card, Input, FilterChip, EmptyState, ConfirmDialog, Skeleton

4. **라우팅 패턴 참조** (App.tsx)
   - `lazy(() => import('./pages/files').then(m => ({ default: m.FilesPage })))`
   - `<Route path="files" element={<Suspense fallback={<PageSkeleton />}><FilesPage /></Suspense>} />`

5. **사이드바 패턴** (sidebar.tsx)
   - navSections 배열의 "업무" 섹션에 항목 추가

### 파일 타입 아이콘 매핑

```typescript
function getMimeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.includes('pdf')) return '📕'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📘'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📗'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📙'
  if (mimeType.includes('json')) return '{}'
  if (mimeType.includes('zip')) return '🗂️'
  if (mimeType.startsWith('text/')) return '📝'
  return '📄'
}
```

### 필터 로직 (클라이언트)

```typescript
type FileFilter = 'all' | 'images' | 'documents' | 'others'

function filterFiles(files: FileRecord[], filter: FileFilter, search: string) {
  let filtered = files
  if (filter === 'images') filtered = filtered.filter(f => f.mimeType.startsWith('image/'))
  else if (filter === 'documents') filtered = filtered.filter(f =>
    f.mimeType.includes('pdf') || f.mimeType.includes('word') ||
    f.mimeType.includes('sheet') || f.mimeType.includes('presentation')
  )
  else if (filter === 'others') filtered = filtered.filter(f =>
    !f.mimeType.startsWith('image/') && !f.mimeType.includes('pdf') &&
    !f.mimeType.includes('word') && !f.mimeType.includes('sheet') &&
    !f.mimeType.includes('presentation')
  )
  if (search) filtered = filtered.filter(f => f.filename.toLowerCase().includes(search.toLowerCase()))
  return filtered
}
```

### 설정 탭 비활성화 정리

settings.tsx에 `files` 탭이 `disabled: true`로 선언되어 있음 → 독립 페이지로 구현하므로 해당 탭 제거 고려 (선택)

### 이전 스토리 교훈 (13-1, 13-2)

- `api.upload` — FormData Content-Type 자동 처리 (isFormData 분기)
- formatBytes 함수 이미 chat-area.tsx에 존재 → 재사용 또는 동일 패턴
- ConfirmDialog import from @corthex/ui

### Project Structure Notes

- `packages/app/src/pages/files.tsx` — 파일 관리 페이지 (신규)
- `packages/app/src/App.tsx` — 라우트 등록 (수정)
- `packages/app/src/components/sidebar.tsx` — 사이드바 메뉴 (수정)

### References

- [Source: packages/server/src/routes/workspace/files.ts] — 파일 API (4개 엔드포인트)
- [Source: packages/app/src/App.tsx:76-88] — 라우트 정의 패턴
- [Source: packages/app/src/components/sidebar.tsx:13-45] — navSections
- [Source: packages/app/src/lib/api.ts:66-67] — api.upload 메서드
- [Source: packages/ui/src/index.ts] — Card, FilterChip, EmptyState, ConfirmDialog
