# Story 17.4: 기밀문서 UI

Status: done

## Story

As a CEO/Human 직원,
I want 기밀문서 페이지에서 아카이브된 보고서를 폴더 트리로 탐색하고, 등급별·부서별로 필터링하며, 문서 상세 및 유사 문서를 확인할 수 있기를,
so that 중요 보고서를 시각적으로 관리하고 과거 유사 분석을 빠르게 찾아 의사결정 품질을 높일 수 있다.

## Acceptance Criteria

1. **기밀문서 페이지 등록**: `/classified` 경로에 풀 페이지 UI 구현
   - App.tsx에 lazy import + Route 추가
   - Sidebar에 기록 그룹 → "기밀문서" 항목 추가 (아이콘: 🔒, 경로: /classified)
   - 작전일지 아래에 위치

2. **2-패널 레이아웃**: 좌측 폴더 트리 + 우측 문서 목록/상세
   - 좌측(w-60~w-72): 폴더 트리 + 통계 요약 카드
   - 우측(flex-1): 문서 목록 테이블 또는 문서 상세 뷰
   - 반응형: md 미만에서는 폴더 트리 접기 토글

3. **폴더 트리 (좌측 패널)**:
   - `GET /workspace/archive/folders` 호출 → 트리 렌더링
   - 폴더 클릭 → 해당 폴더의 문서만 필터 (folderId 파라미터)
   - "전체" 클릭 → 필터 해제
   - 폴더 생성: + 버튼 → 인라인 입력 → `POST /workspace/archive/folders`
   - 폴더 이름 변경: 더블클릭 → 인라인 편집 → `PATCH /workspace/archive/folders/:id`
   - 폴더 삭제: 컨텍스트 메뉴 → 확인 후 `DELETE /workspace/archive/folders/:id`
   - 각 폴더에 문서 수(documentCount) 뱃지 표시

4. **통계 요약 (좌측 패널 상단)**:
   - `GET /workspace/archive/stats` 호출
   - 표시: 총 문서 수, 최근 7일 아카이브 수
   - 등급별 분포 미니 바 차트 (4색: public/internal/confidential/secret)

5. **문서 목록 (우측 패널)**:
   - `GET /workspace/archive` 호출 (페이지네이션 + 필터)
   - 테이블 컬럼: 제목, 등급 뱃지, 부서, 에이전트, 품질 점수, 태그, 날짜
   - 20행 페이지네이션 (이전/다음 + 페이지 번호)
   - 행 클릭 → 상세 뷰로 전환 (같은 우측 패널 내)

6. **필터 & 검색**:
   - 키워드 검색 (debounce 300ms)
   - 필터: 등급(classification), 날짜 범위, 태그 (다중 선택 or 텍스트 입력)
   - 정렬: 날짜(기본), 등급, 품질 점수
   - 필터 칩: 활성 필터를 칩으로 표시 + 개별 제거 + 전체 초기화

7. **등급 뱃지**:
   - public: 초록 (공개), internal: 파랑 (내부), confidential: 주황 (기밀), secret: 빨강 (극비)
   - 목록과 상세 모두에서 일관된 뱃지 사용

8. **문서 상세 뷰**:
   - `GET /workspace/archive/:id` 호출
   - 헤더: 제목, 등급 뱃지, 날짜, 에이전트명, 부서명
   - 본문: content(마크다운) → MarkdownRenderer로 렌더링
   - 메타 카드: 품질 점수, 위임 체인, 비용 정보
   - 태그 목록 표시
   - "뒤로가기" 버튼 → 목록으로 복귀

9. **유사 문서 사이드바 (상세 뷰 우측)**:
   - `GET /workspace/archive/:id/similar` 또는 상세 응답의 similarDocuments 사용
   - 최대 5개, 각 항목: 제목, 등급 뱃지, 유사도 점수(%), 날짜
   - 클릭 → 해당 문서 상세로 이동

10. **문서 수정 (인라인)**:
    - 상세 뷰에서 "편집" 버튼 → 제목, 등급, 요약, 태그, 폴더 변경 가능
    - `PATCH /workspace/archive/:id` 호출
    - content(원본 결과)는 수정 불가 (읽기 전용)

11. **문서 삭제**:
    - 상세 뷰에서 "삭제" 버튼 → ConfirmDialog → `DELETE /workspace/archive/:id`
    - 삭제 후 목록으로 복귀

12. **빈 상태**: EmptyState 컴포넌트 — "아카이브된 문서가 없습니다" + "사령관실로 이동" CTA

## Tasks / Subtasks

- [x] Task 1: 페이지 등록 + 라우팅 (AC: #1)
  - [x] 1.1 `packages/app/src/pages/classified.tsx` 생성 (ClassifiedPage export)
  - [x] 1.2 `App.tsx`에 lazy import + Route path="classified" 추가
  - [x] 1.3 `sidebar.tsx`에 기록 그룹 → { to: '/classified', label: '기밀문서', icon: '🔒' } 추가 (작전일지 아래)

- [x] Task 2: 2-패널 레이아웃 + 폴더 트리 (AC: #2, #3)
  - [x] 2.1 좌측 패널: FolderTree 컴포넌트 (useQuery 폴더 목록, 재귀 트리 렌더)
  - [x] 2.2 폴더 선택 상태 관리 (selectedFolderId)
  - [x] 2.3 폴더 CRUD: 생성(인라인 입력), 이름 변경(더블클릭 편집), 삭제(확인 다이얼로그)
  - [x] 2.4 각 폴더에 documentCount 뱃지

- [x] Task 3: 통계 요약 (AC: #4)
  - [x] 3.1 StatsCard 컴포넌트: 총 문서 수 + 최근 7일 + 등급 분포 바

- [x] Task 4: 문서 목록 + 필터 (AC: #5, #6, #7)
  - [x] 4.1 DocumentList 컴포넌트: 테이블 + 페이지네이션
  - [x] 4.2 필터/검색 바: 키워드, 등급, 날짜 범위, 정렬
  - [x] 4.3 필터 칩 표시 + 제거
  - [x] 4.4 ClassificationBadge 컴포넌트 (4색 등급 뱃지)

- [x] Task 5: 문서 상세 뷰 + 유사 문서 (AC: #8, #9)
  - [x] 5.1 DocumentDetail 컴포넌트: 마크다운 렌더 + 메타 카드
  - [x] 5.2 SimilarDocsSidebar 컴포넌트: 유사 문서 5개 목록
  - [x] 5.3 문서 간 네비게이션 (유사 문서 클릭 → 상세 전환)

- [x] Task 6: 문서 수정 + 삭제 (AC: #10, #11)
  - [x] 6.1 편집 모드: 제목/등급/요약/태그/폴더 인라인 편집
  - [x] 6.2 삭제: ConfirmDialog + softDeleteArchiveItem

- [x] Task 7: 빈 상태 + 반응형 (AC: #12, #2)
  - [x] 7.1 EmptyState 컴포넌트 적용
  - [x] 7.2 md 미만 반응형: 폴더 트리 접기 토글

## Dev Notes

### 핵심 패턴 참조 (기존 코드 — 반드시 재사용)

**ops-log.tsx 패턴 (가장 가까운 참조)** (`packages/app/src/pages/ops-log.tsx`):
- useQuery + useMutation 패턴 동일하게 사용
- `api.get<PaginatedResponse>('/workspace/archive?...')` — 페이지네이션 응답 구조 동일
- 필터 칩 (filterChips) 패턴 동일하게 사용
- useDebounce 훅 동일하게 사용
- QualityBar 컴포넌트 재사용 가능
- formatTime, formatCost 헬퍼 재사용 가능

**MarkdownRenderer 재사용** (`packages/app/src/components/markdown-renderer.tsx`):
- 문서 상세 content 렌더링에 사용

**UI 컴포넌트** (`@corthex/ui`):
- Badge, Input, SkeletonTable, EmptyState, Modal, ConfirmDialog, toast — 모두 기존 패턴과 동일

**API 클라이언트** (`packages/app/src/lib/api.ts`):
- api.get, api.post, api.patch, api.delete — 기존 패턴 동일

### API 엔드포인트 (Story 17-3에서 구현 완료)

```
GET    /api/workspace/archive               — 목록 (page, limit, search, classification, startDate, endDate, tags, folderId, sortBy)
GET    /api/workspace/archive/stats          — 통계
GET    /api/workspace/archive/folders        — 폴더 트리
POST   /api/workspace/archive/folders        — 폴더 생성 { name, parentId? }
PATCH  /api/workspace/archive/folders/:id    — 폴더 이름 변경 { name }
DELETE /api/workspace/archive/folders/:id    — 폴더 삭제
GET    /api/workspace/archive/:id            — 상세 (similarDocuments 포함)
GET    /api/workspace/archive/:id/similar    — 유사 문서
PATCH  /api/workspace/archive/:id            — 수정 { title, classification, summary, tags, folderId }
DELETE /api/workspace/archive/:id            — soft delete
```

### 타입 정의 (packages/shared/src/types.ts 이미 존재)

```typescript
type Classification = 'public' | 'internal' | 'confidential' | 'secret'
type ArchiveItem = { id, title, classification, summary, tags, folderId, folderName, agentName, departmentName, qualityScore, commandType, createdAt }
type ArchiveDetail = ArchiveItem & { content, commandId, commandText, delegationChain, qualityReview, costRecords, similarDocuments }
type SimilarDocument = { id, title, classification, summary, agentName, qualityScore, similarityScore, createdAt }
type ArchiveFolder = { id, name, parentId, children: ArchiveFolder[], documentCount }
type ArchiveStats = { totalDocuments, byClassification, byDepartment, recentWeekCount }
```

### 등급 뱃지 색상 매핑

```typescript
const CLASSIFICATION_BADGE: Record<Classification, { label: string; variant: string; color: string }> = {
  public: { label: '공개', variant: 'success', color: 'bg-emerald-100 text-emerald-700' },
  internal: { label: '내부', variant: 'info', color: 'bg-blue-100 text-blue-700' },
  confidential: { label: '기밀', variant: 'warning', color: 'bg-amber-100 text-amber-700' },
  secret: { label: '극비', variant: 'error', color: 'bg-red-100 text-red-700' },
}
```

### 파일 구조 (정확히 따를 것)

**신규 파일:**
- `packages/app/src/pages/classified.tsx` — 기밀문서 메인 페이지 (ClassifiedPage export)

**수정 파일:**
- `packages/app/src/App.tsx` — lazy import + Route 추가
- `packages/app/src/components/sidebar.tsx` — 네비게이션 항목 추가

### 반응형 디자인

- lg+: 좌측 폴더 트리(w-64) + 우측 문서 목록/상세(flex-1)
- md: 동일 but 폴더 트리 w-56
- sm(md 미만): 폴더 트리 숨김 + 토글 버튼으로 슬라이드인 표시

### 중요 구현 규칙

1. **단일 페이지 파일**: classified.tsx 하나에 모든 컴포넌트 포함 (ops-log.tsx 패턴과 동일)
2. **react-query 캐시 키**: `['archive']`, `['archive-detail', id]`, `['archive-folders']`, `['archive-stats']`
3. **optimistic update**: 폴더 CRUD 시 invalidateQueries 호출
4. **상세 뷰 전환**: 목록 ↔ 상세는 상태 기반 (detailId), 라우팅 아님 (ops-log와 동일 패턴이나 목록과 상세를 같은 패널 내에서 전환)
5. **ConfirmDialog**: 삭제 시 반드시 확인 다이얼로그 사용

### Project Structure Notes

- 파일명: kebab-case (`classified.tsx`)
- 컴포넌트명: PascalCase (`ClassifiedPage`, `FolderTree`, `DocumentList`)
- API 경로: `/workspace/archive` (server에 이미 등록됨)
- Sidebar 위치: 기록 그룹의 작전일지(`/ops-log`) 다음

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic17] E17-S4 기밀문서 UI, 2 SP, FR72, UX #9
- [Source: _bmad-output/planning-artifacts/prd.md#FR72] CEO/Human 직원은 기밀문서에 보고서를 아카이브하고 유사 문서를 검색할 수 있다
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Screen12] 기밀문서: 폴더 트리 + 문서 뷰어 + 등급 뱃지 + 유사 문서 추천 사이드바, 정적 로딩
- [Source: packages/app/src/pages/ops-log.tsx] 작전일지 UI — 필터/검색/페이지네이션/상세모달 패턴
- [Source: packages/shared/src/types.ts#Archive] ArchiveItem, ArchiveDetail, Classification 타입
- [Source: packages/server/src/routes/workspace/archive.ts] Archive API 11개 엔드포인트
- [Source: _bmad-output/implementation-artifacts/17-3-classified-docs-api-archive-filter-similar.md] Story 17-3 구현 완료 — API 레이어

### 이전 스토리 학습 (17-1 ~ 17-3)

- ops-log.tsx의 테이블 + 필터 + 페이지네이션 + 상세 모달 패턴 성공적으로 동작
- QualityBar, MetaCard, RowMenu 등 서브 컴포넌트는 같은 파일 내에서 정의
- useDebounce 훅은 같은 파일 내에서 정의 (별도 파일 불필요)
- MarkdownRenderer는 기존 컴포넌트 재사용
- Badge, EmptyState, SkeletonTable, Modal, ConfirmDialog, toast — @corthex/ui에서 import
- 146개 백엔드 테스트 통과 확인 (archive API 안정)
- 폴더 트리: knowledge 라우트에서 동일 패턴 사용 (16-2 스토리)

### v1 코드 참고

v1(`/home/ubuntu/CORTHEX_HQ/`)의 기밀문서 UI를 참고할 것:
- 폴더 트리 탐색 UX
- 등급별 필터 및 뱃지 시스템
- 유사 문서 추천 사이드바 레이아웃
- v1에서 동작했던 기능은 v2에서도 반드시 동작해야 함

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- ClassifiedPage 생성: 2-패널 레이아웃 (좌측 폴더 트리 + 우측 문서 목록/상세)
- FolderTree: 재귀 트리 렌더링, 인라인 생성/편집, 컨텍스트 메뉴 삭제, documentCount 뱃지
- StatsCard: 총 문서 수, 최근 7일, 등급별 분포 컬러 바
- DocumentList: 7컬럼 테이블 (제목/등급/부서/에이전트/품질/태그/날짜), 20행 페이지네이션
- ClassificationBadge: 4색 등급 뱃지 (공개=초록, 내부=파랑, 기밀=주황, 극비=빨강)
- 필터: 키워드(debounce 300ms), 등급, 날짜 범위, 정렬 3종 + 필터 칩 + 전체 초기화
- DocumentDetailView: MarkdownRenderer 재사용, 위임 체인, 품질 평가, 비용 메타, 태그, 원본 명령
- SimilarDocsSidebar: 유사 문서 5개 (유사도 %, 등급 뱃지, 클릭 네비게이션)
- 인라인 편집: 제목/등급/요약/태그/폴더 수정 (PATCH API), content 수정 불가
- 삭제: ConfirmDialog → DELETE API → 목록 복귀
- EmptyState: "아카이브된 문서가 없습니다" + 사령관실 CTA
- 반응형: md 미만에서 폴더 트리 토글 버튼
- 64개 유닛 테스트 통과 (bun:test)
- 기존 55개 archive-service 테스트 regression 없음

### File List

- packages/app/src/pages/classified.tsx (신규 — ClassifiedPage, FolderTree, DocumentDetailView, StatsCard, 12+ 컴포넌트)
- packages/app/src/App.tsx (수정 — ClassifiedPage lazy import + Route 추가)
- packages/app/src/components/sidebar.tsx (수정 — 기밀문서 네비게이션 항목 추가)
- packages/app/src/__tests__/classified-ui.test.ts (신규 — 64 tests)
