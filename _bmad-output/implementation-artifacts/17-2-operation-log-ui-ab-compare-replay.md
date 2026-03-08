# Story 17.2: 작전일지 UI + A/B 비교 + 리플레이

Status: review

## Story

As a CEO/Human 직원,
I want 작전일지에서 과거 명령의 상세를 확인하고, 두 작업을 나란히 비교하며, 이전 명령을 재실행할 수 있기를,
so that 명령 결과를 분석·비교하고, 검증이 필요한 명령을 즉시 재실행하여 의사결정 품질을 높일 수 있다.

## Acceptance Criteria

1. **작전일지 목록 페이지**: `/ops-log` 경로에 풀 페이지 UI 구현
   - 기존 OpsLogPage(실시간 타임라인)를 대체하는 **테이블 기반 목록**
   - 각 행: 시간, 명령 텍스트(truncate), 유형 뱃지, 상태 뱃지, 대상 에이전트명, 품질 점수 바, 비용, 북마크 아이콘
   - 20행 페이지네이션 (이전/다음 버튼 + 페이지 번호)
   - 정렬 옵션: 날짜(기본), 품질 점수, 비용, 소요시간 — 드롭다운 또는 헤더 클릭

2. **검색 & 필터**:
   - 키워드 검색 (debounce 300ms)
   - 필터: 날짜 범위, 에이전트 ID, 부서 ID, 명령 유형, 상태, 품질 점수 범위
   - **필터 칩**: 활성 필터를 시각적 칩으로 표시, 칩의 × 버튼으로 개별 제거
   - 북마크만 보기 토글

3. **북마크 토글**:
   - 각 행에 북마크 아이콘 (★/☆)
   - 클릭 시 즉시 토글 (optimistic update)
   - 북마크 추가/삭제 API 호출 (`POST /operation-log/bookmarks`, `DELETE /operation-log/bookmarks/:id`)

4. **상세 모달**:
   - 행 클릭 → 모달 열림 (`GET /operation-log/:id`)
   - 내용: 전체 명령 텍스트, 결과 마크다운(MarkdownRenderer 재사용), 위임 체인, 품질 리뷰 상세, 비용 상세
   - 모달 헤더에 "리플레이" 버튼, "복사" 버튼

5. **A/B 비교**:
   - 각 행에 체크박스 (좌측)
   - 2개 선택 시 "비교" 버튼 활성화 (상단 툴바)
   - 비교 뷰: 좌우 분할 모달 (lg 사이즈)
     - 상단: 비용·소요시간·품질 점수 비교 바
     - 하단: 명령 A / 명령 B 결과 마크다운 나란히 표시
   - 3개 이상 선택 방지 (비활성화)

6. **리플레이**:
   - 상세 모달 또는 행 컨텍스트 메뉴(⋮) → "리플레이"
   - 확인 모달: "동일 명령을 다시 실행합니다. 결과가 다를 수 있습니다."
   - 확인 → `react-router navigate('/command-center')` + 쿼리 파라미터로 명령 텍스트 전달
   - 사령관실에서 해당 텍스트 자동 입력 + 즉시 실행

7. **CSV 내보내기**:
   - 상단 툴바에 "내보내기" 버튼
   - `GET /operation-log/export` → JSON 배열 → 프론트에서 CSV 변환 + 자동 다운로드
   - 현재 필터 조건 적용

8. **빈 상태**: EmptyState 컴포넌트 — "보고된 작전이 없습니다" + "사령관실로 이동" CTA

## Tasks / Subtasks

- [x] Task 1: OpsLogPage 전면 교체 — 테이블 기반 작전일지 목록 (AC: #1, #2, #8)
  - [x] 1.1 `packages/app/src/pages/ops-log.tsx` 전면 재작성
  - [x] 1.2 useQuery로 `GET /workspace/operation-log` 호출 + 페이지네이션
  - [x] 1.3 검색 (debounce) + 8가지 필터 구현
  - [x] 1.4 필터 칩 (FilterChip 컴포넌트 재사용) + × 제거
  - [x] 1.5 정렬 드롭다운 (date, qualityScore, cost, duration)
  - [x] 1.6 EmptyState 빈 상태

- [x] Task 2: 북마크 토글 (AC: #3)
  - [x] 2.1 행별 ★/☆ 아이콘 렌더링 (isBookmarked 필드 활용)
  - [x] 2.2 클릭 → optimistic update + mutation (useMutation)
  - [x] 2.3 북마크 추가: `POST /workspace/operation-log/bookmarks` { commandId }
  - [x] 2.4 북마크 삭제: `DELETE /workspace/operation-log/bookmarks/:id`

- [x] Task 3: 상세 모달 (AC: #4)
  - [x] 3.1 행 클릭 → 상세 데이터 로드 (`GET /workspace/operation-log/:id`)
  - [x] 3.2 Modal 컴포넌트 재사용 (from @corthex/ui)
  - [x] 3.3 마크다운 결과 렌더링 (MarkdownRenderer 재사용)
  - [x] 3.4 위임 체인 표시 (delegationChain 배열)
  - [x] 3.5 품질 리뷰 + 비용 상세
  - [x] 3.6 "리플레이" / "복사" 버튼

- [x] Task 4: A/B 비교 (AC: #5)
  - [x] 4.1 행별 체크박스 + 선택 상태 관리 (최대 2개)
  - [x] 4.2 2개 선택 시 "비교" 버튼 활성화 (툴바)
  - [x] 4.3 비교 모달: 좌우 분할 레이아웃
  - [x] 4.4 상단 비교 바: 비용·시간·품질 비교 시각화
  - [x] 4.5 하단: 마크다운 나란히 표시

- [x] Task 5: 리플레이 (AC: #6)
  - [x] 5.1 "리플레이" 버튼 → ConfirmDialog
  - [x] 5.2 확인 → navigate('/command-center?replay=<commandText>')
  - [x] 5.3 사령관실 CommandInput에서 replay 쿼리 파라미터 감지 → 자동 입력 + 제출

- [x] Task 6: CSV 내보내기 (AC: #7)
  - [x] 6.1 "내보내기" 버튼
  - [x] 6.2 GET /workspace/operation-log/export 호출 (현재 필터 적용)
  - [x] 6.3 JSON → CSV 변환 + Blob 다운로드

## Dev Notes

### 핵심 패턴 참조 (기존 코드)

**OpsLogPage 교체**: 현재 `packages/app/src/pages/ops-log.tsx`는 실시간 타임라인 뷰 (infinite scroll + WebSocket). 이것을 **테이블 기반 작전일지**로 전면 교체. 기존 코드의 `FilterChip`, `useDebounce` 패턴은 재사용.

**ActivityLogPage 패턴 재사용** (`packages/app/src/pages/activity-log.tsx`):
- useQuery + 페이지네이션 (page/limit)
- 검색 debounce (300ms)
- 날짜 필터 (input type="date")
- 테이블 헤더/바디 패턴 (text-sm, border-b)
- StatusBadge 패턴 재사용
- EmptyState + SkeletonTable

**API 엔드포인트** (17-1에서 구현 완료):
- `GET /workspace/operation-log` — 목록 (검색/필터/정렬/페이지네이션)
  - 쿼리 파라미터: search, startDate, endDate, targetAgentId, departmentId, type, status, minScore, maxScore, bookmarkedOnly, sortBy, sortOrder, page, limit
  - 응답: `{ success: true, data: { items: OperationLogItem[], page, limit, total } }`
- `GET /workspace/operation-log/:id` — 상세
  - 응답: 명령 전체 정보 + delegationChain + qualityReview + costDetails + bookmark 상태
- `GET /workspace/operation-log/export` — CSV 데이터 (JSON 배열)
- `POST /workspace/operation-log/bookmarks` — 북마크 추가 { commandId, note? }
- `DELETE /workspace/operation-log/bookmarks/:id` — 북마크 삭제
- `PATCH /workspace/operation-log/bookmarks/:id` — 노트 수정 { note }
- `GET /workspace/operation-log/bookmarks` — 북마크 목록

**공유 UI 컴포넌트** (`@corthex/ui`):
- Badge, Input, EmptyState, SkeletonTable, Modal, ConfirmDialog, FilterChip, toast, Spinner, Select

**MarkdownRenderer**: `packages/app/src/components/markdown-renderer.tsx` — 보고서 결과 렌더링

**사령관실 리플레이 연동**:
- `packages/app/src/pages/command-center/index.tsx` — useSearchParams()로 replay 감지
- `packages/app/src/hooks/use-command-center.ts` — submitCommand() 함수

### API 응답 타입 (참고용)

```typescript
type OperationLogItem = {
  id: string              // command ID
  text: string            // 명령 텍스트
  type: string            // direct, mention, slash, preset, batch, all, sequential, deepwork
  status: string          // pending, processing, completed, failed, cancelled
  agentName: string | null
  departmentName: string | null
  qualityScore: number | null    // 0~100 (inspect score %)
  totalCost: number | null       // USD
  durationMs: number | null
  isBookmarked: boolean
  bookmarkId: string | null
  createdAt: string
  completedAt: string | null
}

type OperationDetail = OperationLogItem & {
  result: string | null          // 마크다운 결과
  delegationChain: DelegationStep[]
  qualityReview: QualityReviewDetail | null
  costRecords: CostRecord[]
}
```

### CSV 변환 구현

```typescript
function downloadCsv(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = String(row[h] ?? '')
      return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val
    }).join(','))
  ]
  const blob = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

### 필터 칩 구현 패턴

```tsx
// 활성 필터를 칩으로 표시
const activeFilterChips = useMemo(() => {
  const chips: { key: string; label: string; onRemove: () => void }[] = []
  if (search) chips.push({ key: 'search', label: `검색: ${search}`, onRemove: () => setSearch('') })
  if (typeFilter) chips.push({ key: 'type', label: `유형: ${typeFilter}`, onRemove: () => setTypeFilter('') })
  if (statusFilter) chips.push({ key: 'status', label: `상태: ${statusFilter}`, onRemove: () => setStatusFilter('') })
  // ... 기타 필터
  return chips
}, [search, typeFilter, statusFilter, ...])
```

### 사령관실 리플레이 연동 수정

`packages/app/src/pages/command-center/index.tsx` 또는 `packages/app/src/hooks/use-command-center.ts` 에서:
```tsx
// 쿼리 파라미터에서 replay 감지
const [searchParams, setSearchParams] = useSearchParams()
const replayText = searchParams.get('replay')

useEffect(() => {
  if (replayText) {
    submitCommand(replayText)
    setSearchParams({}, { replace: true })  // 파라미터 제거
  }
}, [replayText])
```

### Project Structure Notes

**수정 파일:**
- `packages/app/src/pages/ops-log.tsx` — 전면 재작성 (테이블 기반 작전일지)

**수정 가능 파일 (리플레이 연동):**
- `packages/app/src/pages/command-center/index.tsx` — replay 쿼리 감지
- `packages/app/src/hooks/use-command-center.ts` — replay 자동 실행

**기존 파일 참조 (패턴 복사):**
- `packages/app/src/pages/activity-log.tsx` — 테이블/필터/페이지네이션 패턴
- `packages/app/src/components/markdown-renderer.tsx` — 마크다운 렌더링
- `packages/ui/src/modal.tsx` — Modal 컴포넌트
- `packages/ui/src/confirm-dialog.tsx` — ConfirmDialog
- `packages/ui/src/filter-chip.tsx` — FilterChip

**신규 파일 없음** — 기존 ops-log.tsx 재작성 + command-center 소폭 수정

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic17] E17-S2 작전일지 UI + A/B 비교 + 리플레이
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#12.10.3] 작전일지 고급 패턴 (A/B 비교, 리플레이, CSV)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#11.6.1] DataTable 패턴: 작전일지 20행 페이지네이션
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#12.2] 필터 칩 패턴
- [Source: packages/server/src/routes/workspace/operation-log.ts] 17-1에서 구현된 API 엔드포인트
- [Source: packages/server/src/services/operation-log-service.ts] 서비스 레이어
- [Source: packages/app/src/pages/activity-log.tsx] UI 패턴 참조
- [Source: packages/app/src/pages/ops-log.tsx] 교체 대상 (현재 타임라인 뷰)

### 이전 스토리 학습 (17-1)

- 서비스 레이어에서 다중 조인 쿼리 구현 완료 (commands + agents + departments + qualityReviews + orchestrationTasks + bookmarks)
- 8가지 필터 + 4가지 정렬 모두 API에서 지원됨
- bookmarkedOnly 필터와 isBookmarked/bookmarkId 응답 필드 활용 가능
- 66개 유닛 테스트 통과

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- ops-log.tsx 전면 재작성: 실시간 타임라인 → 테이블 기반 작전일지 목록
- 8가지 필터(검색/날짜범위/유형/상태/에이전트/부서/품질점수/북마크) + 4가지 정렬
- 필터 칩: 활성 필터를 시각적 칩으로 표시, × 제거, 전체 초기화
- 북마크 토글: ★/☆ 아이콘 클릭으로 즉시 토글 (useMutation + invalidateQueries)
- 상세 모달: Modal 컴포넌트로 명령 상세 표시 (마크다운 결과, 품질 리뷰, 메타 정보)
- A/B 비교: 체크박스 2개 선택 → 좌우 분할 비교 모달 (품질/시간/비용 비교 바 + 마크다운 나란히)
- 리플레이: ConfirmDialog → navigate('/command-center?replay=...') → 사령관실 자동 실행
- CSV 내보내기: JSON → CSV 변환 + BOM 포함 + Blob 자동 다운로드
- 사령관실 리플레이 연동: useSearchParams()로 replay 쿼리 감지 → submitCommand() 자동 호출
- 빌드 성공, 기존 66개 테스트 통과 (regression 없음)

### File List

- packages/app/src/pages/ops-log.tsx (수정 - 전면 재작성)
- packages/app/src/pages/command-center/index.tsx (수정 - replay 쿼리 파라미터 지원)
