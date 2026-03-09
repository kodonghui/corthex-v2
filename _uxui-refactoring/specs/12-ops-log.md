# 작전 로그 UX/UI 설명서

> 페이지: #12 작전 로그
> 패키지: app
> 경로: /ops-log
> 작성일: 2026-03-09

---

## 1. 페이지 목적

CEO가 내린 모든 명령과 그 결과를 **검색, 필터, 분석**할 수 있는 히스토리 뷰어. 각 작전(명령)의 상태, 유형, 담당 에이전트, 품질 점수, 소요 시간을 테이블로 조회하고, 북마크로 중요 항목을 관리하며, A/B 비교와 리플레이(동일 명령 재실행)를 지원한다.

**핵심 사용자 시나리오:**
- 과거 명령 이력을 검색/필터하여 원하는 작전을 찾기
- 품질 점수와 소요 시간으로 작전 성과 비교
- 중요한 작전을 북마크하여 빠르게 접근
- 두 작전을 선택하여 A/B 비교 (품질/시간/비용 대조)
- 과거 명령을 그대로 다시 실행 (리플레이)
- 검색 결과를 CSV로 내보내기

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────┐
│  Header: "작전일지"         [비교 (2개 선택 시)] [내보내기] │
├─────────────────────────────────────────────────────┤
│  Filters:                                           │
│  [🔍 검색] [시작일] ~ [종료일] [유형▼] [상태▼]       │
│  [정렬▼] [★ 북마크]                                 │
├─────────────────────────────────────────────────────┤
│  Filter Chips: [검색: xxx ×] [유형: 직접 ×] [전체초기화]│
├─────────────────────────────────────────────────────┤
│  Selection Info: "2개 선택됨" [선택 해제]             │
├─────────────────────────────────────────────────────┤
│  Table:                                             │
│  □ | 시간 | 명령 | 유형 | 상태 | 에이전트 | 품질 | 소요 | ★ | ⋮ │
│  ─────────────────────────────────────────────────  │
│  □ | 03/09 | "매출 분석..." | 직접 | 완료 | CMO | ██ 4.2 | 3.1s | ★ | ⋮│
│  □ | 03/08 | "SNS 작성..." | 멘션 | 진행중 | - | - | - | ☆ | ⋮│
│  (반복...)                                          │
├─────────────────────────────────────────────────────┤
│  Pagination: 42건    [이전] 1/3 [다음]               │
└─────────────────────────────────────────────────────┘

── Detail Modal (행 클릭 시) ──
┌─────────────────────────────────┐
│  작전 상세           [복사][리플레이]│
│  03/09 14:30                     │
│  ┌──────────────────────────┐    │
│  │ 명령: "매출 분석해줘"     │    │
│  └──────────────────────────┘    │
│  [유형: 직접] [상태: 완료]        │
│  [에이전트: CMO] [소요: 3.1s]     │
│  품질: ██████ 4.2 PASS           │
│  결과: (Markdown 렌더링)          │
│  ★ 북마크 메모: "참고할 분석"      │
└─────────────────────────────────┘

── Compare Modal (2개 선택 후 비교 클릭) ──
┌──────────────────────────────────────┐
│  A/B 비교                            │
│  [품질: 4.2 vs 3.8]                  │
│  [소요: 3.1s vs 5.2s]               │
│  [비용: $0.0042 vs $0.0078]         │
│  ┌──────────┐  ┌──────────┐         │
│  │ A 결과    │  │ B 결과    │         │
│  │ (Markdown)│  │ (Markdown)│         │
│  └──────────┘  └──────────┘         │
└──────────────────────────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ "작전일지"  [내보내기] │
├─────────────────────┤
│ [🔍 검색]            │
│ [필터들 줄바꿈]       │
├─────────────────────┤
│ Filter Chips         │
├─────────────────────┤
│ 테이블 (가로 스크롤)  │
│ min-w-[800px]        │
│ ────────────────     │
│ □|시간|명령|유형|상태 │
│  |에이전트|품질|소요  │
│ ────────────────     │
├─────────────────────┤
│ [이전] 1/3 [다음]    │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **테이블 모바일 UX**: min-w-[800px]로 가로 스크롤 강제 -- 모바일에서 사용성 매우 떨어짐
2. **필터 영역 과밀**: 검색, 날짜 2개, 유형, 상태, 정렬, 북마크가 한 줄에 flex-wrap으로 나열되어 좁은 화면에서 레이아웃 깨짐
3. **품질 바 가독성**: 1.5px 높이의 가로 바 + 10px 폰트의 숫자가 너무 작아 한눈에 파악 어려움
4. **비교 기능 발견성**: 체크박스를 2개 선택해야 비교 버튼이 나타나는데, 이 기능의 존재를 모를 수 있음
5. **리플레이/복사 메뉴**: ⋮ 드롭다운 안에 숨겨져 있어 발견하기 어려움
6. **상세 모달 스크롤**: 긴 결과(Markdown)가 있으면 모달 내부 스크롤이 불편 (max-h-[85vh])
7. **빈 상태 동선**: "사령관실로 이동" 버튼이 있지만, 현재 필터 때문에 결과가 없는 것인지 진짜 데이터가 없는 것인지 구분이 안 됨
8. **날짜 필터**: HTML 기본 date input을 사용해 브라우저마다 다르게 보임
9. **선택 상태 UI**: 2개까지만 선택 가능한데, 3번째 체크박스가 disabled 처리만 되어 왜 안 되는지 설명이 없음
10. **CSV 내보내기 피드백**: 다운로드 성공/실패 외에 진행 상태(로딩)가 없음

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 v0.dev가 결정** -- 특정 테마 강제하지 않음
- 상태별 색상 코드 유지 (완료=그린, 진행중=블루, 대기=앰버, 실패=레드, 취소=그레이)
- 품질 점수는 시각적으로 명확한 게이지/색상 매핑

### 4.2 레이아웃 개선
- **모바일 카드 뷰**: 모바일에서는 테이블 대신 카드 형태로 표시 검토
- **필터 접이식**: 모바일에서 필터를 접이식(collapsible)로 처리
- **품질 바 크기 확대**: 높이와 숫자 크기를 키워 가독성 확보
- **비교 기능 안내**: "2개를 선택하면 비교할 수 있습니다" 힌트 텍스트

### 4.3 인터랙션 개선
- 상세 보기: 모달 대신 슬라이드 패널 검토 (컨텍스트 유지)
- 리플레이/복사: 테이블 행 호버 시 빠른 액션 버튼 노출
- 필터 칩 클리어 애니메이션

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | OpsLogPage | 전체 레이아웃, 필터 영역 반응형 개선 | pages/ops-log.tsx |
| 2 | StatusBadge | 상태 뱃지 색상/스타일 (내부 컴포넌트) | pages/ops-log.tsx |
| 3 | QualityBar | 품질 게이지 크기/가독성 개선 (내부 컴포넌트) | pages/ops-log.tsx |
| 4 | RowMenu | 행 컨텍스트 메뉴 스타일 (내부 컴포넌트) | pages/ops-log.tsx |
| 5 | DetailModal | 상세 보기 모달 레이아웃 (내부 컴포넌트) | pages/ops-log.tsx |
| 6 | CompareModal | A/B 비교 모달 디자인 (내부 컴포넌트) | pages/ops-log.tsx |
| 7 | MetaCard | 메타데이터 카드 스타일 (내부 컴포넌트) | pages/ops-log.tsx |
| 8 | CompareBar | 비교 수치 바 (내부 컴포넌트) | pages/ops-log.tsx |
| 9 | ComparePanel | 비교 결과 패널 (내부 컴포넌트) | pages/ops-log.tsx |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| operationLogItems | useQuery → GET /workspace/operation-log?... | 작전 목록 (페이지네이션) |
| operationLogDetail | useQuery → GET /workspace/operation-log/:id | 작전 상세 |
| exportData | api.get → GET /workspace/operation-log/export?... | CSV 내보내기 데이터 |
| bookmarks | useMutation → POST/DELETE /workspace/operation-log/bookmarks | 북마크 추가/제거 |

**API 엔드포인트 (변경 없음):**
- 목록: `GET /workspace/operation-log?page=&limit=&search=&startDate=&endDate=&type=&status=&sortBy=&bookmarkedOnly=`
- 상세: `GET /workspace/operation-log/:id`
- 내보내기: `GET /workspace/operation-log/export?...`
- 북마크 추가: `POST /workspace/operation-log/bookmarks` (body: { commandId })
- 북마크 제거: `DELETE /workspace/operation-log/bookmarks/:bookmarkId`

**필터 상태 (URL 비연동, 컴포넌트 내부 state — 향후 URL 동기화 검토):**
- page, searchInput, startDate, endDate, typeFilter, statusFilter, sortBy, bookmarkedOnly

**정렬 옵션:** 날짜순, 품질순, 비용순, 소요시간순

---

## 7. 색상/톤 앤 매너

| 용도 | 색상 | Tailwind |
|------|------|---------|
| 완료 상태 | 그린 | Badge variant="success" |
| 진행중 상태 | 블루 | Badge variant="info" |
| 대기 상태 | 앰버 | Badge variant="warning" |
| 실패 상태 | 레드 | Badge variant="error" |
| 취소 상태 | 그레이 | Badge variant="default" |
| 품질 4+ 점 | 에메랄드 | bg-emerald-500 |
| 품질 3~4 점 | 앰버 | bg-amber-500 |
| 품질 3 미만 | 레드 | bg-red-500 |
| 북마크 활성 | 앰버 | ★ (star filled) |
| 북마크 비활성 | 그레이 | ☆ (star outline) |
| 필터 칩 | 인디고 | bg-indigo-50 text-indigo-700 |
| 비교 A 라벨 | 인디고 | text-indigo-600 |
| 비교 B 라벨 | 에메랄드 | text-emerald-600 |
| 선택 영역 배경 | 인디고 | bg-indigo-50 dark:bg-indigo-900/20 |
| CTA 버튼 | 인디고 | bg-indigo-600 text-white |
| 내보내기 버튼 | 보더 | border-zinc-200 text-zinc-700 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 테이블 풀 컬럼, 필터 1줄, 넓은 패딩 |
| **768px~1439px** (Tablet) | 테이블 가로 스크롤, 필터 줄바꿈 |
| **~375px** (Mobile) | 필터 접이식, 테이블 가로 스크롤 (min-w-800px), 최소 패딩 |

**모바일 특별 처리:**
- 상세 모달: 풀스크린
- 비교 모달: 풀스크린, 2컬럼 → 세로 스택
- 필터: 접이식 (토글 버튼으로 펼침/접기)
- 페이지네이션: 하단 고정
- 내보내기 버튼: 작은 아이콘 버튼으로 축소

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 11번 항목에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 모든 CEO 명령 + 결과 히스토리
- [x] 검색 (텍스트 검색, 디바운스 300ms)
- [x] 필터 (상태, 날짜 범위, 유형, 정렬, 북마크만)
- [x] 북마크 추가/제거 + 메모
- [x] A/B 비교 (두 작업 선택 → 품질/시간/비용 + 결과 비교)
- [x] 리플레이 (동일 명령 재실행 → 사령관실로 이동)
- [x] CSV 내보내기 (현재 필터 기준)
- [x] 페이지네이션 (20건 단위)
- [x] 상세 보기 (명령 텍스트, 메타데이터, 품질 평가, Markdown 결과)
- [x] 명령 복사 (클립보드)

**UI 변경 시 절대 건드리면 안 되는 것:**
- `api.get/post/delete` 호출 경로 및 쿼리 파라미터 구조
- `useMutation` / `useQuery` 훅의 queryKey 구조
- `buildParams()` 함수의 파라미터 매핑 로직
- `downloadCsv()` 함수의 CSV 생성 로직
- `MarkdownRenderer` 컴포넌트 사용
- 리플레이 → 사령관실 네비게이션 로직 (`navigate('/command-center?replay=...')`)

---

## 10. v0.dev 디자인+코딩 지시사항

> v0.dev가 디자인과 코딩을 동시에 수행합니다. 아래 내용을 v0 프롬프트에 포함하세요. 레이아웃은 v0에게 자유도를 부여합니다.

### v0 프롬프트 (디자인+코딩 통합)
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. The user gives natural language instructions to AI agents, and this page shows the complete history of all past instructions and their results.

This page: An operations log / command history viewer — like a detailed activity log where every instruction the user gave and every result the AI produced is recorded, searchable, and analyzable.

User workflow:
1. User sees a table of all past commands — each row shows: timestamp, command text (truncated), command type (direct, mention, slash, preset, batch), status badge (completed, processing, pending, failed, cancelled), assigned agent name, quality score (0-5 with visual bar), duration, and bookmark star.
2. User can filter by: text search, date range (start/end), command type dropdown, status dropdown, sort order (date, quality, cost, duration), and "bookmarked only" toggle.
3. Active filters appear as removable chips below the filter bar.
4. User can click any row to open a detail modal showing: full command text, metadata cards (type, status, agent, duration), quality evaluation (score bar + PASS/FAIL badge), full result rendered as Markdown, and bookmark note.
5. User can select 2 rows via checkboxes to enable A/B comparison — a side-by-side modal showing quality score, duration, cost comparisons plus the full results.
6. Each row has a context menu (⋮) with "Replay" (re-execute the same command) and "Copy" options.
7. CSV export button exports filtered data.
8. Pagination at the bottom (20 items per page).

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Page header — title "Operations Log" with Export button and Compare button (appears when 2 items selected).
2. Filter bar — search input, date range pickers, type dropdown, status dropdown, sort dropdown, bookmark toggle button. Should feel compact but accessible.
3. Filter chips — active filters shown as removable pills below the filter bar.
4. Data table — columns: checkbox, time, command, type (badge), status (color badge), agent, quality (mini progress bar with score), duration, bookmark star, actions menu.
5. Quality score visualization — a small horizontal bar (green for 4+, amber for 3-4, red for <3) with the numeric score next to it.
6. Empty state — when no results match filters, show a helpful message with option to clear filters. When truly no data, show a prompt to go to the command center.
7. Detail view — modal or slide-over showing the full command details, metadata, quality evaluation, and Markdown-rendered result.
8. A/B comparison view — side-by-side comparison of two selected operations.
9. Pagination — page indicator and prev/next buttons.

Design tone — YOU DECIDE:
- This is a data-heavy analysis tool. Think of it like a log viewer or analytics dashboard.
- The table must be scannable — users should spot important items (failures, low quality scores) instantly.
- Status badges and quality bars should use color coding that's immediately interpretable.
- Filters should feel powerful but not overwhelming.
- Clean, dense but not cramped. This is a tool for reviewing work quality and finding past results.

Design priorities (in order):
1. Scannability — status, quality, and bookmarks should be visible at a glance across many rows.
2. Filtering power — users should be able to narrow down to exactly what they need quickly.
3. Detail access — getting from the table to full details should feel smooth and contextual.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 참고사항
```
Mobile version (375x812) of the same page described above.

Same product context: an operations log showing history of all AI agent commands and results, with search, filtering, bookmarks, A/B comparison, and CSV export.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation (switching between pages). DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile):
1. Page header with title and export button.
2. Filters — collapsible filter panel (tap to expand/collapse). When collapsed, show number of active filters.
3. Filter chips — horizontally scrollable.
4. Data display — since a wide table doesn't work on mobile, consider card-based layout where each operation is a card showing: time, command text, status badge, quality score, bookmark star. Tap to see details.
5. Detail view — full-screen modal with command text, metadata, quality score, and Markdown result.
6. A/B comparison — vertically stacked (A on top, B below) instead of side-by-side.
7. Pagination — compact at the bottom.
8. Empty / loading / error states.

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. Quick scanning — status badges and quality indicators must be visible in the card layout.
2. Filter access — filters should be one tap away but not clutter the screen.
3. Details must be readable despite smaller screen.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `ops-log-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `ops-log-search` | 검색 입력 | 텍스트 검색 |
| `ops-log-date-start` | 시작일 입력 | 날짜 필터 시작 |
| `ops-log-date-end` | 종료일 입력 | 날짜 필터 종료 |
| `ops-log-type-filter` | 유형 드롭다운 | 유형 필터 |
| `ops-log-status-filter` | 상태 드롭다운 | 상태 필터 |
| `ops-log-sort` | 정렬 드롭다운 | 정렬 변경 |
| `ops-log-bookmark-filter` | 북마크 필터 버튼 | 북마크만 보기 |
| `ops-log-filter-chips` | 필터 칩 영역 | 활성 필터 표시 |
| `ops-log-filter-chip` | 개별 필터 칩 | 필터 제거 |
| `ops-log-filter-clear` | 전체 초기화 버튼 | 필터 초기화 |
| `ops-log-table` | 테이블 컨테이너 | 테이블 표시 |
| `ops-log-row` | 테이블 행 | 개별 작전 항목 |
| `ops-log-row-checkbox` | 행 체크박스 | 비교용 선택 |
| `ops-log-status-badge` | 상태 뱃지 | 상태 표시 |
| `ops-log-quality-bar` | 품질 점수 바 | 품질 점수 표시 |
| `ops-log-bookmark-btn` | 북마크 토글 버튼 | 북마크 추가/제거 |
| `ops-log-row-menu` | 행 컨텍스트 메뉴 (⋮) | 리플레이/복사 |
| `ops-log-replay-btn` | 리플레이 버튼 | 명령 재실행 |
| `ops-log-copy-btn` | 복사 버튼 | 명령 복사 |
| `ops-log-compare-btn` | 비교 버튼 | A/B 비교 열기 |
| `ops-log-export-btn` | 내보내기 버튼 | CSV 내보내기 |
| `ops-log-selection-info` | 선택 정보 영역 | 선택 수 표시 |
| `ops-log-selection-clear` | 선택 해제 버튼 | 선택 초기화 |
| `ops-log-empty-state` | 빈 상태 | 데이터 없을 때 |
| `ops-log-empty-action` | 빈 상태 CTA | 사령관실 이동 |
| `ops-log-loading` | 로딩 스켈레톤 | 로딩 중 |
| `ops-log-pagination` | 페이지네이션 영역 | 페이지 이동 |
| `ops-log-page-prev` | 이전 버튼 | 이전 페이지 |
| `ops-log-page-next` | 다음 버튼 | 다음 페이지 |
| `ops-log-page-info` | 페이지 정보 | "1/3" 표시 |
| `ops-log-total-count` | 총 건수 | "42건" 표시 |
| `ops-log-detail-modal` | 상세 모달 | 상세 보기 |
| `ops-log-detail-command` | 상세 명령 텍스트 | 명령 내용 |
| `ops-log-detail-metadata` | 상세 메타데이터 | 유형/상태/에이전트/소요 |
| `ops-log-detail-quality` | 상세 품질 평가 | 점수 + PASS/FAIL |
| `ops-log-detail-result` | 상세 결과 (Markdown) | 결과 내용 |
| `ops-log-detail-copy` | 상세 복사 버튼 | 명령 복사 |
| `ops-log-detail-replay` | 상세 리플레이 버튼 | 명령 재실행 |
| `ops-log-detail-bookmark-note` | 북마크 메모 | 메모 표시 |
| `ops-log-compare-modal` | 비교 모달 | A/B 비교 |
| `ops-log-compare-bar` | 비교 수치 바 | 품질/시간/비용 비교 |
| `ops-log-compare-panel-a` | 비교 A 패널 | A 결과 |
| `ops-log-compare-panel-b` | 비교 B 패널 | B 결과 |
| `ops-log-replay-confirm` | 리플레이 확인 다이얼로그 | 재실행 확인 |
| `ops-log-error-state` | 에러 상태 | API 에러 시 표시 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /ops-log 접속 | `ops-log-page` 존재, 테이블 또는 빈 상태 표시 |
| 2 | 빈 상태 표시 | 데이터 없을 때 | `ops-log-empty-state` + 사령관실 이동 버튼 표시 |
| 3 | 로딩 스켈레톤 | 데이터 로딩 중 | `ops-log-loading` (SkeletonTable) 표시 |
| 4 | 텍스트 검색 | 검색창에 키워드 입력 | 디바운스 후 테이블 필터링, 필터 칩 추가 |
| 5 | 날짜 필터 | 시작일/종료일 설정 | 해당 기간 데이터만 표시, 필터 칩 추가 |
| 6 | 유형 필터 | 유형 드롭다운에서 선택 | 해당 유형만 표시, 필터 칩 추가 |
| 7 | 상태 필터 | 상태 드롭다운에서 선택 | 해당 상태만 표시, 필터 칩 추가 |
| 8 | 정렬 변경 | 정렬 드롭다운에서 "품질순" 선택 | 품질 점수 내림차순 정렬 |
| 9 | 북마크 필터 | ★ 북마크 버튼 클릭 | 북마크된 항목만 표시, 필터 칩 추가 |
| 10 | 필터 칩 제거 | 필터 칩의 × 클릭 | 해당 필터 해제, 테이블 갱신 |
| 11 | 전체 초기화 | "전체 초기화" 클릭 | 모든 필터 해제 |
| 12 | 행 클릭 상세 | 테이블 행 클릭 | `ops-log-detail-modal` 표시, 명령+결과 표시 |
| 13 | 북마크 토글 | ★/☆ 클릭 | 북마크 상태 전환, 토스트 알림 |
| 14 | 리플레이 | ⋮ → 리플레이 → 확인 | 사령관실로 이동 (URL에 replay 파라미터) |
| 15 | 명령 복사 | ⋮ → 복사 | 클립보드 복사 완료 토스트 |
| 16 | 항목 선택 | 체크박스 2개 선택 | `ops-log-compare-btn` 표시, 선택 정보 표시 |
| 17 | 3개 선택 방지 | 2개 선택 후 3번째 시도 | 3번째 체크박스 disabled |
| 18 | A/B 비교 | 2개 선택 → 비교 클릭 | `ops-log-compare-modal` 표시, 수치 비교 |
| 19 | CSV 내보내기 | 내보내기 버튼 클릭 | CSV 파일 다운로드, 토스트 알림 |
| 20 | 페이지네이션 | 다음 버튼 클릭 | 다음 페이지 데이터 로드 |
| 21 | 반응형 레이아웃 | 375px 뷰포트 | 테이블 가로 스크롤, 필터 줄바꿈 |
| 22 | 상세 모달 닫기 | 모달 외부 클릭 또는 X | 모달 닫힘 |
| 23 | 에러 상태 | API 에러 발생 | `ops-log-error-state` 에러 메시지 + 재시도 |
