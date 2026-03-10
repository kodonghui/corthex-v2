# 39. Costs Admin (비용 관리) — Wireframe Prompt

## What This Page Is For

This is the **Cost Management** page in the Admin app. Platform administrators use this page to monitor AI usage costs across the entire company — broken down by agent, model, and department. They also configure monthly/daily budgets and auto-block thresholds.

The page provides a **three-axis cost analysis** (agent / model / department), a **daily cost trend chart**, and a **budget settings panel** — all scoped to a selected date range.

The entire page is wrapped in `<div className="space-y-6">` for consistent vertical spacing between sections.

### Data Displayed — In Detail

**Header row:**
- Page title: "비용 관리" (left-aligned, `text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100`)
- Date range filter (right-aligned): Two `<Input type="date">` components (`w-36 text-xs`) from `@corthex/ui`, separated by a "~" character in `text-zinc-400 text-xs`
- Default range: last 30 days to today
- Header uses `flex items-center justify-between flex-wrap gap-3` for responsive wrapping

**Summary cards row (4 cards in a horizontal grid):**
- Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- Each card uses `<Card>` + `<CardContent>` components from `@corthex/ui`
- Card label: `text-xs text-zinc-500 mb-1`
- Card value: `text-xl font-bold text-zinc-900 dark:text-zinc-100` (default)
- Card subtitle: `text-xs text-zinc-400 mt-0.5`
- Card 1 — **총 비용**: Large dollar amount, subtitle showing call count like "12.5K calls"
- Card 2 — **Anthropic**: Dollar amount for Claude usage, subtitle "Claude"
- Card 3 — **OpenAI**: Dollar amount for GPT usage, subtitle "GPT"
- Card 4 — **전월 대비**: Percentage change with sign (+/-). Color-coded: `text-red-500` if positive (costs up), `text-emerald-500` if negative (costs down), `text-zinc-500` if zero. Subtitle: "증가" / "감소" / "변동 없음"

**Main content area (2-column layout on desktop):**
- Layout: `grid grid-cols-1 lg:grid-cols-3 gap-6`
- Left column (`lg:col-span-2`): 3-axis cost analysis card
- Right column: Budget settings panel

**3-Axis Cost Analysis Card:**
- Card: `<Card>` + `<CardContent>` from `@corthex/ui`
- Title: "3축 비용 분석" (`text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3`)
- Tab bar uses `<Tabs>` component from `@corthex/ui` with 3 items: "에이전트별" (value: "agent"), "모델별" (value: "model"), "부서별" (value: "department")
- Each tab displays a sortable data table:

  **Agent tab columns:** 에이전트 | 비용 (USD) | 입력 토큰 | 출력 토큰 | 호출 수
  **Model tab columns:** 모델 (sorts by `displayName`) | 프로바이더 (sorts by `provider`, displayed with `capitalize`) | 비용 (USD) | 입력 토큰 | 출력 토큰 | 호출 수
  **Department tab columns:** 부서 | 비용 (USD) | 에이전트 수 | 호출 수

- Table header: `px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 select-none`
- Clickable headers toggle sort direction (↑ ascending / ↓ descending, default: cost descending)
- Table rows: `border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30`
  - Name column: `text-zinc-900 dark:text-zinc-100`
  - Cost column: `font-mono text-zinc-700 dark:text-zinc-300` (formatted as $X.XX)
  - Token/count columns: `text-zinc-500` (formatted: 1M+→"X.XM", 1K+→"X.XK")
- Empty state: "데이터가 없습니다" centered in `text-zinc-400`
- Data is **lazy-loaded per tab** — only fetched when tab is active

**Budget Settings Panel:**
- Card: `<Card>` + `<CardContent>` from `@corthex/ui`
- Title: "예산 설정" (`text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4`)
- **Budget usage progress bar** (shown only when monthly budget > 0):
  - Label row: "이번 달 사용량" (left) + "$current / $budget" (right) in `text-xs text-zinc-500 mb-1`
  - Uses `<ProgressBar value={usagePercent} />` component from `@corthex/ui`
- **Form fields** (vertical stack, `space-y-3`):
  - **월간 예산** (`<Input type="number">`, label: "microdollars, 0 = 무제한")
  - **일일 예산** (`<Input type="number">`, label: "microdollars, 0 = 무제한")
  - **경고 임계값 (%)** (`<Input type="number">`, min 0, max 100)
  - **초과 시 자동 차단** (label in `text-xs text-zinc-600 dark:text-zinc-400`, `<Toggle>` component from `@corthex/ui` with `label=""`, right-aligned with `flex items-center justify-between`)
- Each label: `block text-xs text-zinc-500 mb-1`
- Input fields use `<Input>` component from `@corthex/ui`
- Save button: `<Button>` component from `@corthex/ui` with `className="w-full"`, disabled during save
- Button text: "설정 저장" (or "저장 중..." when `mutation.isPending`)
- **Validation**: NaN check on all number fields, threshold range 0-100
- **Toast notifications**: Success ("예산 설정이 저장되었습니다") and error messages via `useToastStore`

**Daily Cost Chart (below the 2-column section):**
- Card: `<Card>` + `<CardContent>` from `@corthex/ui`
- Header row: "일일 비용 추이" title (`text-sm font-semibold text-zinc-900 dark:text-zinc-100`, left) + period toggle buttons (right, `flex gap-1`)
- Period buttons: "7일" and "30일"
  - Active: `bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium rounded-md px-2.5 py-1 text-xs transition-colors`
  - Inactive: `text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md px-2.5 py-1 text-xs transition-colors`
- Bar chart: `flex items-end gap-[2px] h-40`, each bar in `flex-1 flex flex-col items-center justify-end h-full min-w-0 group relative`
  - Bar color: `bg-indigo-500 dark:bg-indigo-400 rounded-t hover:bg-indigo-600 dark:hover:bg-indigo-300 min-h-[2px]`
  - Bar height: proportional to max cost in period (minimum 1%)
  - X-axis labels: date in MM-DD format (`d.date.slice(5)`), `text-[8px] text-zinc-400 mt-1 truncate w-full text-center`
  - Hover tooltip: dark popup (`bg-zinc-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10`), positioned `absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block`, showing "$X.XX"
- Empty state: "데이터가 없습니다" centered in `h-40 flex items-center justify-center text-zinc-400 text-sm`
- **Chart date range**: Independently calculated from `endDate` minus selected days (not using `startDate`). Default period is **30 days** (not 7).
- **Chart props**: `DailyChart` receives only `companyId` and `endDate` — it manages its own start date and period state internally

**Loading states** (all use `<Skeleton>` component from `@corthex/ui`):
- Summary cards: 4 `<Card>` wrappers each containing `<Skeleton className="h-16 w-full" />`
- Tables: `<Skeleton className="h-32 w-full" />`
- Budget panel: `<Card>` containing `<Skeleton className="h-40 w-full" />`
- Chart: `<Skeleton className="h-40 w-full" />`

**No company selected state:**
- Shows "회사를 먼저 선택해주세요." centered in a `<Card>` with `text-sm text-zinc-500 text-center py-8`
- Page title still visible above the card

### User Actions

1. **Change date range** — Adjust start/end dates to filter summary cards and tab data; only `endDate` affects the daily chart
2. **Switch analysis tabs** — Toggle between agent/model/department views (lazy-loaded)
3. **Sort table columns** — Click any column header to sort ascending/descending
4. **Toggle chart period** — Switch between 7-day and 30-day views
5. **Edit budget settings** — Modify monthly/daily budget, warning threshold, and auto-block toggle
6. **Save budget** — Persists budget configuration to server

### UX Considerations

- **Date range drives summary and tabs**: Changing dates re-fetches summary and active tab data. React Query caches results per date range combination. Note: the daily chart uses only `endDate` (not `startDate`) and has its own independent period selector (7/30 days).
- **Lazy tab loading is important**: Only the active tab's data is fetched. Don't pre-fetch all three axes on page load — this saves unnecessary API calls.
- **Budget values are in microdollars**: 1 microdollar = $0.000001. Display values need conversion via `(micro / 1_000_000).toFixed(2)`. The input fields accept raw microdollar values.
- **Budget progress bar**: Uses the `<ProgressBar>` shared component which handles color transitions internally. The `usagePercent` is capped at 100 via `Math.min()`.
- **Chart hover tooltips**: Must appear above the bar, centered horizontally, and disappear when mouse leaves. Use CSS `group`/`group-hover:block` pattern.
- **Sort state is local per tab**: Switching tabs doesn't reset sort on other tabs.
- **Korean language**: All labels, headers, and messages are in Korean.
- **Company selection is prerequisite**: Page content is gated by `selectedCompanyId` from admin store.
- **Trend calculation**: Compares current period cost to the previous period of equal length. Positive = costs increased (red), negative = costs decreased (green).

### Shared Dependencies

- **UI Components** (`@corthex/ui`): `Card`, `CardContent`, `Skeleton`, `Tabs`, `Toggle`, `Input`, `Button`, `ProgressBar`
- **Stores**: `useAdminStore` (for `selectedCompanyId`), `useToastStore` (for success/error notifications)
- **API**: `api` helper from `../lib/api` (handles auth headers, base URL)
- **Data fetching**: `@tanstack/react-query` (`useQuery`, `useMutation`, `useQueryClient`)

### What NOT to Include on This Page

- No cost-per-source breakdown (chat, delegation, job, sns, batch) — data exists but not shown here
- No CSV/Excel export functionality
- No cost forecasting or projection
- No individual transaction/call log — this is aggregate-level only
- No provider-specific filtering within tabs (e.g., "show only Anthropic agents")
- No real-time WebSocket cost updates — uses polling via React Query stale time
- No budget alert webhook configuration — that's a backend concern
- No model pricing configuration — prices come from server-side `models.yaml`
