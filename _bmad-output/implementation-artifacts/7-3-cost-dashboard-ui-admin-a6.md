# Story 7.3: Cost Dashboard UI (Admin A6)

Status: done

## Story

As a **admin (관리자)**,
I want **비용 관리 대시보드(Admin A6)에서 3축 비용 데이터, 일일 차트, 예산 설정을 한 화면에서 확인하고 관리**,
so that **AI 비용을 실시간으로 모니터링하고 예산을 통제하여 비용 투명성을 확보할 수 있다**.

## Acceptance Criteria

1. **Given** 비용 관리 페이지 접속 **When** 로딩 완료 **Then** 상단에 비용 요약 카드 4장 표시 (총 비용, 프로바이더별 비용, 총 호출 수, 전월 대비 변화율 %)
2. **Given** 비용 요약 카드 **When** API 응답 수신 **Then** 총 비용은 USD 표시, 프로바이더별 비용은 Anthropic/OpenAI/Google 구분, 변화율은 +/-% 색상 구분 (상승=red, 하락=green)
3. **Given** 3축 비용 테이블 **When** 탭 클릭 **Then** 에이전트별/모델별/부서별 탭 전환, 각 탭에 정렬 가능한 테이블 표시 (클릭 시 오름차순/내림차순 토글)
4. **Given** 에이전트별 탭 **When** 표시 **Then** 에이전트명, 총 비용, 입력 토큰, 출력 토큰, 호출 수 컬럼 + 비용 내림차순 기본 정렬
5. **Given** 모델별 탭 **When** 표시 **Then** 모델명, 프로바이더, 총 비용, 입력 토큰, 출력 토큰, 호출 수 컬럼
6. **Given** 부서별 탭 **When** 표시 **Then** 부서명, 총 비용, 에이전트 수, 호출 수 컬럼
7. **Given** 일일 비용 차트 **When** 표시 **Then** 기간 내 일별 비용을 div 기반 막대 차트로 시각화 (CEO 대시보드 패턴), 7일/30일 기간 토글
8. **Given** 예산 설정 패널 **When** 표시 **Then** 월 예산($), 일일 예산($), 경고 임계값(%), 자동 차단 토글이 현재 설정값으로 표시
9. **Given** 예산 설정 폼 **When** 값 변경 후 저장 클릭 **Then** PUT /api/admin/budget 호출 → 성공 시 토스트 알림 + 데이터 새로고침
10. **Given** 날짜 범위 필터 **When** 시작일/종료일 변경 **Then** 모든 비용 데이터(요약 카드, 3축 테이블, 일일 차트) 동시 새로고침
11. **Given** 사이드바 **When** 비용 관리 메뉴 클릭 **Then** /costs 경로로 이동하여 비용 대시보드 표시
12. **Given** turbo build **When** 전체 빌드 **Then** 3/3 패키지 성공

## Tasks / Subtasks

- [x] Task 1: 사이드바 + 라우트 등록 (AC: #11)
  - [x] 1.1 `packages/admin/src/components/sidebar.tsx` nav 배열에 비용 관리 항목 추가 ({ to: '/costs', label: '비용 관리', icon: '💰' })
  - [x] 1.2 `packages/admin/src/App.tsx`에 CostsPage lazy import + Route 추가 (path="costs")

- [x] Task 2: 비용 요약 카드 섹션 (AC: #1, #2)
  - [x] 2.1 `packages/admin/src/pages/costs.tsx` 생성
  - [x] 2.2 `useQuery` — GET /api/admin/costs/summary?startDate=...&endDate=... 호출
  - [x] 2.3 상단 4-카드 그리드 (grid-cols-4): 총 비용, Anthropic 비용, OpenAI 비용, 전월 대비 변화율
  - [x] 2.4 microToUsd 변환 헬퍼 (`micro / 1_000_000`, 소수점 2자리)
  - [x] 2.5 변화율 색상 구분: trendPercent > 0 → red, < 0 → green, 0 → gray

- [x] Task 3: 3축 비용 테이블 (AC: #3, #4, #5, #6)
  - [x] 3.1 `@corthex/ui`의 Tabs 컴포넌트로 에이전트/모델/부서 3탭 구현
  - [x] 3.2 각 탭별 useQuery — GET /api/admin/costs/by-agent, /by-model, /by-department
  - [x] 3.3 정렬 가능 테이블: `sortField` + `sortDir` state, 헤더 클릭 시 토글
  - [x] 3.4 에이전트 탭: agentName, totalCostMicro(USD 변환), inputTokens, outputTokens, callCount
  - [x] 3.5 모델 탭: model, provider, totalCostMicro, inputTokens, outputTokens, callCount
  - [x] 3.6 부서 탭: departmentName, totalCostMicro, agentCount, callCount

- [x] Task 4: 일일 비용 차트 (AC: #7)
  - [x] 4.1 `useQuery` — GET /api/admin/costs/daily?startDate=...&endDate=...
  - [x] 4.2 div 기반 막대 차트 (CEO 대시보드 donut/bar 패턴 참고, 차트 라이브러리 사용 안 함)
  - [x] 4.3 7일/30일 기간 토글 (FilterChip 또는 버튼 그룹)
  - [x] 4.4 막대 높이 = (당일 비용 / 최대 비용) * 100%, 호버 시 금액 표시

- [x] Task 5: 예산 설정 패널 (AC: #8, #9)
  - [x] 5.1 `useQuery` — GET /api/admin/budget
  - [x] 5.2 폼 필드: monthlyBudget (USD), dailyBudget (USD), warningThreshold (%), autoBlock (Toggle)
  - [x] 5.3 `useMutation` — PUT /api/admin/budget, Zod 클라이언트 검증
  - [x] 5.4 저장 버튼 + 로딩 상태 + 토스트 알림 (useToastStore)
  - [x] 5.5 ProgressBar로 현재 사용량/예산 비율 표시

- [x] Task 6: 날짜 범위 필터 (AC: #10)
  - [x] 6.1 startDate/endDate state (기본: 30일 전 ~ 오늘)
  - [x] 6.2 Input type="date" 2개 + 적용 버튼
  - [x] 6.3 날짜 변경 시 모든 useQuery의 queryKey에 반영 → 자동 새로고침

- [x] Task 7: 빌드 검증 (AC: #12)
  - [x] 7.1 turbo build 3/3 확인

## Dev Notes

### 핵심: API 엔드포인트 (Story 7-1에서 구현 완료)

**비용 집계 API (packages/server/src/routes/admin/costs.ts):**
- `GET /api/admin/costs/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
  - 응답: `{ totalCostMicro, totalInputTokens, totalOutputTokens, totalCalls, byProvider: [{provider, totalCostMicro, ...}], trendPercent }`
- `GET /api/admin/costs/by-agent?startDate=...&endDate=...`
  - 응답: `{ items: [{agentId, agentName, totalCostMicro, inputTokens, outputTokens, callCount}] }`
- `GET /api/admin/costs/by-model?startDate=...&endDate=...`
  - 응답: `{ items: [{model, provider, displayName, totalCostMicro, inputTokens, outputTokens, callCount}] }`
- `GET /api/admin/costs/by-department?startDate=...&endDate=...`
  - 응답: `{ items: [{departmentId, departmentName, totalCostMicro, agentCount, callCount}] }`
- `GET /api/admin/costs/daily?startDate=...&endDate=...`
  - 응답: `{ items: [{date, costMicro, inputTokens, outputTokens, callCount}] }`
- 모든 API는 `{ success: true, data: { items/..., meta: { startDate, endDate } } }` 형식

**예산 API (Story 7-2에서 구현 완료, packages/server/src/routes/admin/budget.ts):**
- `GET /api/admin/budget`
  - 응답: `{ monthlyBudget, dailyBudget, warningThreshold, autoBlock }`  (microdollars 단위)
- `PUT /api/admin/budget`
  - 바디: `{ monthlyBudget?, dailyBudget?, warningThreshold?, autoBlock? }` (부분 업데이트)

### UI 패턴 (기존 Admin 페이지 일관성 유지)

**MonitoringPage 패턴 참조 (packages/admin/src/pages/monitoring.tsx):**
- `useQuery` + React Query + api.get() 패턴
- Card + CardContent 레이아웃
- 로딩: Skeleton, 에러: Card 내 에러 메시지
- MemoryBar 패턴 → ProgressBar 재사용 가능

**ToolsPage 패턴 참조 (packages/admin/src/pages/tools.tsx):**
- `useAdminStore` 에서 selectedCompanyId 사용
- useQuery에 `enabled: !!selectedCompanyId` 적용
- useMemo + useCallback 최적화

**CEO Dashboard 패턴 참조 (packages/app/src/pages/dashboard.tsx):**
- CSS 기반 donut chart (차트 라이브러리 없음)
- div 높이로 bar 차트 구현

### 사용 가능한 UI 컴포넌트 (@corthex/ui)

- Card, CardContent, CardHeader — 카드 레이아웃
- Badge — 상태 뱃지
- Skeleton, SkeletonTable — 로딩 상태
- Tabs (TabItem) — 탭 전환
- Toggle — 토글 스위치 (autoBlock용)
- Input — 입력 필드
- Button — 버튼
- ProgressBar — 진행률 바 (예산 사용량 비율)
- FilterChip — 필터 칩 (기간 선택)
- Spinner — 로딩 스피너

### microToUsd 변환

```typescript
function microToUsd(micro: number): string {
  return (micro / 1_000_000).toFixed(2)
}
```

- 내부 데이터는 모두 microdollars (1 = $0.000001)
- UI 표시는 USD로 변환
- 예산 설정 입력/표시도 USD (API 전송 시 microdollars로 변환)

### 정렬 가능 테이블 패턴

```typescript
type SortConfig = { field: string; dir: 'asc' | 'desc' }

// 헤더 클릭 핸들러
function toggleSort(field: string) {
  setSort(prev => ({
    field,
    dir: prev.field === field && prev.dir === 'desc' ? 'asc' : 'desc'
  }))
}

// 정렬된 데이터
const sorted = useMemo(() => {
  return [...items].sort((a, b) => {
    const v = sort.dir === 'asc' ? 1 : -1
    return ((a[sort.field] ?? 0) - (b[sort.field] ?? 0)) * v
  })
}, [items, sort])
```

### 날짜 범위 기본값

```typescript
const today = new Date()
const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0])
const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
```

### 일일 비용 차트 (div 기반 bar chart)

```typescript
// maxCost를 구해서 각 bar의 높이를 비율로 계산
const maxCost = Math.max(...dailyItems.map(d => d.costMicro), 1)

{dailyItems.map(d => (
  <div key={d.date} className="flex flex-col items-center gap-1">
    <div
      className="w-full bg-indigo-500 rounded-t"
      style={{ height: `${(d.costMicro / maxCost) * 100}%` }}
      title={`$${microToUsd(d.costMicro)}`}
    />
    <span className="text-[9px] text-zinc-400">{d.date.slice(5)}</span>
  </div>
))}
```

### 주의사항 (Developer Guardrails)

1. **차트 라이브러리 사용 금지** — div 기반 CSS 차트만 (CEO dashboard 패턴)
2. **selectedCompanyId 필수** — 모든 useQuery에 enabled: !!selectedCompanyId 적용 (ToolsPage 패턴)
3. **api.get() 사용** — fetch 직접 호출 금지 (packages/admin/src/lib/api.ts)
4. **microdollars ↔ USD 변환 주의** — 내부 microdollars, 표시 USD, 예산 설정 입력도 USD
5. **예산 API 바디는 microdollars 아님** — budget.ts:27-32 보면 monthlyBudget은 number.min(0), USD 단위가 아닌 원본 값 그대로 저장. budget-guard.ts에서 loadBudgetConfig()로 읽을 때 USD 기준. **API 문서 확인 필수**
6. **토스트 알림** — useToastStore의 addToast 사용 (packages/admin/src/stores/toast-store.ts)
7. **다크 모드 지원** — 모든 색상에 dark: 클래스 추가 (기존 페이지 패턴)
8. **Korean UI** — 모든 라벨은 한국어
9. **Tabs 컴포넌트** — @corthex/ui의 Tabs 사용, TabItem 타입: `{ key: string; label: string; content?: ReactNode }`
10. **반응형 그리드** — 요약 카드는 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

### Project Structure Notes

- 신규 파일: `packages/admin/src/pages/costs.tsx` (메인 페이지 컴포넌트)
- 수정 파일: `packages/admin/src/App.tsx` (라우트 추가)
- 수정 파일: `packages/admin/src/components/sidebar.tsx` (nav 항목 추가)
- 기존 API는 모두 구현 완료 (서버 코드 수정 불필요)

### References

- [Source: packages/server/src/routes/admin/costs.ts] — 5개 비용 집계 엔드포인트
- [Source: packages/server/src/routes/admin/budget.ts] — GET/PUT 예산 설정 API
- [Source: packages/server/src/services/cost-aggregation.ts] — CostAggregationService
- [Source: packages/server/src/services/budget-guard.ts] — BudgetGuardService + loadBudgetConfig
- [Source: packages/admin/src/pages/monitoring.tsx] — Admin 페이지 패턴 (Card, useQuery, Skeleton)
- [Source: packages/admin/src/pages/tools.tsx] — selectedCompanyId 패턴
- [Source: packages/admin/src/lib/api.ts] — api.get/post/put 헬퍼
- [Source: packages/admin/src/stores/toast-store.ts] — addToast 패턴
- [Source: packages/app/src/pages/dashboard.tsx:412-477] — CSS donut chart 패턴
- [Source: packages/ui/src/index.ts] — 사용 가능 UI 컴포넌트 목록
- [Source: _bmad-output/planning-artifacts/epics.md:1179] — E7-S3 수용 기준
- [Source: _bmad-output/implementation-artifacts/7-1-3axis-cost-aggregation-api.md] — 이전 스토리 구현 참고
- [Source: _bmad-output/implementation-artifacts/7-2-budget-limit-auto-block.md] — 예산 API 구현 참고

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- CostsPage: Full admin cost dashboard with 4 summary cards, 3-axis sortable tables, daily bar chart, budget settings panel
- Summary Cards: Total cost, Anthropic cost, OpenAI cost, trend % with color coding (red/green)
- 3-Axis Tabs: Agent/Model/Department tabs using @corthex/ui Tabs, click-to-sort headers with direction toggle
- Daily Chart: div-based bar chart (no chart library), 7/30 day toggle, hover tooltip showing USD amount
- Budget Panel: GET/PUT /api/admin/budget integration, form with monthlyBudget/dailyBudget/warningThreshold/autoBlock, ProgressBar usage indicator
- Date Range: startDate/endDate inputs, all queries use queryKey with dates for auto-refresh
- Build: 3/3 turbo build passing (server cached, app cached, admin built in 2.7s)

### File List

- packages/admin/src/pages/costs.tsx (NEW — 비용 관리 대시보드 메인 페이지)
- packages/admin/src/App.tsx (MODIFIED — CostsPage lazy import + /costs route 추가)
- packages/admin/src/components/sidebar.tsx (MODIFIED — nav에 비용 관리 항목 추가)
- packages/admin/tsconfig.json (MODIFIED — exclude __tests__ from build)
- packages/admin/src/__tests__/costs-tea.test.ts (NEW — TEA 테스트 66개)
