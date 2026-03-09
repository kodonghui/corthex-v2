# Costs (비용 분석) UX/UI 설명서

> 페이지: #17 costs
> 패키지: app
> 경로: /costs
> 작성일: 2026-03-09

---

## 1. 페이지 목적

AI 에이전트 운영 비용을 상세하게 분석하는 대시보드 페이지. 총 비용, 예산 사용률, 프로바이더별 비용 비율을 한눈에 파악하고, 에이전트별 비용 순위와 일별 비용 추이를 확인할 수 있다. 기간 선택(7일/30일/직접 설정)으로 원하는 범위의 데이터를 조회한다.

**핵심 사용자 시나리오:**
- CEO가 AI 운영 비용 현황을 빠르게 파악
- 프로바이더별(Anthropic/OpenAI/Google) 비용 비율 확인 (도넛 차트)
- 가장 비용이 많이 드는 에이전트 식별 (수평 막대 차트)
- 일별 비용 추이로 비용 패턴 분석 (수직 막대 차트)
- 예산 초과/경고 상황 즉시 인지

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────┐
│  Header: "← 비용 분석"              [7일][30일][직접] │
│  부제: "AI 운영 비용을 상세하게 분석합니다"             │
├─────────────────────────────────────────────────────┤
│  [예산 초과 경고 배너]  ← 80% 이상일 때만 표시        │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ 총 비용   │ │ 예산     │ │ 프로바이더별 비용     │ │
│  │ $XX.XX   │ │ 사용률   │ │ [도넛] Anthropic $X  │ │
│  │ 최근 N일  │ │  XX%    │ │        OpenAI   $X  │ │
│  │          │ │ $X/$XX  │ │        Google   $X  │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
├──────────────────────────┬──────────────────────────┤
│  에이전트별 비용 순위      │  일일 비용 추이           │
│  1. Agent A  $XX ████   │  ┌─┐                     │
│  2. Agent B  $XX ███    │  │ │ ┌─┐                  │
│  3. Agent C  $XX ██     │  │ │ │ │┌─┐ ┌─┐          │
│  ...                    │  └─┘ └─┘└─┘ └─┘ ...      │
│  [더보기]                │  03/01 03/02 03/03 ...   │
└──────────────────────────┴──────────────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ ← 비용 분석          │
│ [7일][30일][직접]     │
├─────────────────────┤
│ [예산 경고 배너]      │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ 총 비용 $XX.XX  │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ 예산 사용률 XX%  │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ 프로바이더별     │ │
│ │ [도넛] + 범례   │ │
│ └─────────────────┘ │
├─────────────────────┤
│ 에이전트별 순위      │
│ 1. Agent A ████    │
│ 2. Agent B ███     │
├─────────────────────┤
│ 일일 비용 추이       │
│ [막대 차트]          │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **도넛 차트가 CSS conic-gradient**: 접근성(스크린 리더)에 취약하고, 호버 인터랙션(개별 슬라이스 하이라이트) 불가
2. **일별 차트 해상도**: 30일 이상 선택 시 막대가 너무 얇아져 읽기 어려움
3. **모바일 차트 가독성**: 375px에서 도넛 + 범례가 좁아서 범례 텍스트 잘림
4. **뒤로가기 버튼**: 대시보드로의 뒤로가기(`←`)가 있지만, 다른 페이지에서 직접 접근 시 동선이 어색
5. **예산 미설정 상태**: "예산 미설정" 텍스트만 표시되고, 예산 설정 안내/링크가 없음
6. **에이전트 상세 진입 불가**: 에이전트 이름 클릭 시 해당 에이전트 상세 페이지로 이동하는 링크가 없음
7. **모델별 상세 비용 미노출**: byModel 데이터가 프로바이더로만 집계되어 개별 모델(claude-opus, gpt-4o 등) 비용을 볼 수 없음
8. **커스텀 기간 UX**: date input이 작고 브라우저 기본 스타일에 의존
9. **일일 차트 툴팁**: hover 시 나타나는 금액 툴팁이 작고 모바일에서 터치 불가
10. **데이터 없음 상태**: "데이터 없음" 텍스트가 시각적으로 빈약

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2(디자인 AI)가 결정** — 특정 테마 강제 없음
- 프로바이더별 색상 유지: Anthropic(파란), OpenAI(초록), Google(주황)
- 숫자/금액의 가독성을 최우선으로, 큰 폰트 + 고대비 색상
- 예산 상태에 따른 색상 구분: 정상(초록) / 경고(노란) / 초과(빨강)

### 4.2 레이아웃 개선
- **프로바이더별 카드 디자인 강화**: 도넛 차트 크기 확대, 범례 간격 개선
- **모델별 브레이크다운 추가**: 프로바이더 카드 아래에 모델별 세부 비용 접이식 영역
- **에이전트 이름 링크화**: 클릭 시 에이전트 상세로 이동
- **일별 차트 인터랙션 강화**: 클릭/탭 시 해당 일자 상세 표시

### 4.3 인터랙션 개선
- 기간 선택기: 버튼 그룹 스타일 강화 + 커스텀 기간 달력 UI 개선
- 차트 호버/탭: 터치 디바이스에서도 동작하는 툴팁
- 예산 경고 배너: 예산 설정 페이지로의 링크 포함

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | CostsPage | 전체 레이아웃 spacing 조정, 뒤로가기 제거(사이드바로 충분) | pages/costs.tsx |
| 2 | PeriodSelector | 기간 선택 버튼 그룹 스타일 강화 | pages/costs.tsx (인라인) |
| 3 | BudgetWarningBanner | 예산 경고 배너, 설정 링크 추가 | pages/costs.tsx (인라인) |
| 4 | CostOverviewSection | 3열 카드: 총 비용 / 예산 사용률 / 프로바이더 도넛 | pages/costs.tsx (인라인) |
| 5 | TopAgentsSection | 에이전트별 수평 막대 차트, 이름 링크화 | pages/costs.tsx (인라인) |
| 6 | DailyCostChart | 일별 수직 막대 차트, 툴팁 개선 | pages/costs.tsx (인라인) |
| 7 | CostsSkeleton | 로딩 스켈레톤 | pages/costs.tsx (인라인) |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| costData | useQuery(['costs-overview']) → GET /workspace/dashboard/costs?days=N | 총 비용, 모델별, 에이전트별, 소스별 비용 |
| budget | useQuery(['costs-budget']) → GET /workspace/dashboard/budget | 예산 정보 (월 한도, 사용률) |
| agentItems | useQuery(['costs-by-agent-ceo']) → GET /workspace/dashboard/costs/by-agent | 에이전트별 비용 상세 (날짜 범위) |
| dailyItems | useQuery(['costs-daily-ceo']) → GET /workspace/dashboard/costs/daily | 일별 비용 추이 |
| period | useState<PeriodType> | 기간 선택 (7d/30d/custom) |
| customStart/End | useState<string> | 커스텀 기간 날짜 |

**API 엔드포인트 (변경 없음):**
- `GET /api/workspace/dashboard/costs?days=N` — 비용 개요
  - 응답: `{ data: { totalCostUsd, byModel[], byAgent[], bySource[], days } }`
- `GET /api/workspace/dashboard/budget` — 예산 정보
  - 응답: `{ data: { monthlyBudgetUsd, currentMonthSpendUsd, usagePercent } }`
- `GET /api/workspace/dashboard/costs/by-agent?startDate=&endDate=` — 에이전트별 비용
  - 응답: `{ data: { items: CostByAgent[] } }`
- `GET /api/workspace/dashboard/costs/daily?startDate=&endDate=` — 일별 비용
  - 응답: `{ data: { items: CostDaily[] } }`

**CostOverview 구조:**
```ts
{
  totalCostUsd: number
  byModel: { model: string; costUsd: number; inputTokens: number; outputTokens: number; count: number }[]
  byAgent: { agentId: string; agentName: string; costUsd: number; count: number }[]
  bySource: { source: string; costUsd: number; count: number }[]
  days: number
}
```

**프로바이더 색상 매핑:**
```ts
{ anthropic: '#3B82F6', openai: '#22C55E', google: '#F97316' }
```

---

## 7. 색상/톤 앤 매너

| 용도 | 색상 | Tailwind |
|------|------|---------|
| Anthropic 프로바이더 | 블루 | #3B82F6 (blue-500) |
| OpenAI 프로바이더 | 그린 | #22C55E (green-500) |
| Google 프로바이더 | 오렌지 | #F97316 (orange-500) |
| 총 비용 텍스트 | 진한 다크 | text-zinc-900 dark:text-zinc-100 |
| 예산 정상 (<80%) | 에메랄드 | text-emerald-500 |
| 예산 경고 (80~99%) | 옐로 | text-yellow-500 |
| 예산 초과 (100%+) | 레드 | text-red-500 |
| 경고 배너 배경 | 옐로 투명 | bg-yellow-50 dark:bg-yellow-950/30 |
| 초과 배너 배경 | 레드 투명 | bg-red-50 dark:bg-red-950/30 |
| 막대 차트 기본 | 인디고 | bg-indigo-500 dark:bg-indigo-400 |
| 기간 선택 활성 | 인디고 투명 | bg-indigo-100 text-indigo-700 |
| 카드 배경 | 흰색/다크 | Card 컴포넌트 기본 |
| 서브 텍스트 | 그레이 | text-zinc-500 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 상단 3열 카드 (sm:grid-cols-3), 하단 2열 (lg:grid-cols-2: 에이전트 + 일별), max-w-6xl |
| **768px~1439px** (Tablet) | 상단 3열 유지, 하단 1열 (에이전트 위, 일별 아래) |
| **~375px** (Mobile) | 상단 1열 (카드 수직 나열), 하단 1열, 도넛 차트 + 범례 수직 배치, 기간 선택기 flex-wrap |

**모바일 특별 처리:**
- 기간 선택기: flex-wrap으로 버튼 줄바꿈, 커스텀 date input 아래줄로 이동
- 도넛 차트: 크기 유지하되 범례를 아래로 이동 (수직 배치)
- 에이전트 목록: "더보기" 기본 접힘, 상위 5개만 표시
- 일별 차트: 가로 스크롤 가능하게 처리 (30일 이상 시)
- 차트 툴팁: 탭으로 트리거

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 21번(비용 관리) 항목에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 에이전트별 비용 추적 (수평 막대 차트)
- [x] 모델별 비용 추적 (프로바이더별 집계)
- [x] 일일 비용 추이 (수직 막대 차트)
- [x] 도넛 차트 (프로바이더별 비용 비율)
- [x] 예산 사용률 표시 (퍼센트 + 금액)
- [x] 예산 초과/경고 배너
- [x] 기간 선택 (7일/30일/직접 설정)
- [x] 호출 수 표시 (에이전트별)

**UI 변경 시 절대 건드리면 안 되는 것:**
- `api.get('/workspace/dashboard/costs?days=N')` 호출 로직
- `api.get('/workspace/dashboard/budget')` 호출 로직
- `api.get('/workspace/dashboard/costs/by-agent')` 호출 로직
- `api.get('/workspace/dashboard/costs/daily')` 호출 로직
- `PROVIDER_COLORS` / `PROVIDER_LABELS` 상수
- `microToUsd()` / `formatNumber()` 헬퍼 함수
- 프로바이더 판별 로직 (모델명 → 프로바이더 매핑)
- 예산 사용률 계산 로직 (DashboardBudget 타입)

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. Think of it like Slack or Linear, but instead of messaging coworkers, you're giving tasks to AI employees and watching them collaborate to deliver results.

This page: A cost analysis dashboard where the user monitors AI operational expenses. It breaks down costs by AI provider (Anthropic, OpenAI, Google), by individual AI agent, by AI model, and by day. It also shows budget utilization with warnings when approaching or exceeding limits.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Page header — title "Cost Analysis" or similar, with a subtitle. On the right side: a period selector with preset buttons (7 days, 30 days) and a custom date range option with two date inputs.
2. Budget warning banner — conditionally shown when budget usage exceeds 80%. Yellow for warning (80-99%), red for exceeded (100%+). Shows usage percentage and a message.
3. Summary cards (3 cards in a row) —
   a. Total cost: large dollar amount, period label below (e.g., "Last 7 days")
   b. Budget utilization: large percentage, color-coded (green < 80%, yellow 80-99%, red 100%+), dollar amounts below (spent/budget)
   c. Provider breakdown: a donut chart showing cost distribution by AI provider. Provider colors: Anthropic = blue (#3B82F6), OpenAI = green (#22C55E), Google = orange (#F97316). Legend with provider names and dollar amounts next to the donut.
4. Two-column section below the cards —
   a. Left: Agent cost ranking — vertical list of AI agents ranked by cost. Each row: rank number, agent name, dollar amount, a horizontal bar showing relative cost. Show top 10 with a "Show more" toggle.
   b. Right: Daily cost trend — vertical bar chart showing cost per day. Bars with hover tooltips showing exact dollar amount. X-axis shows dates (MM/DD format).
5. Loading skeleton — placeholder cards and charts while data loads.
6. Empty/error states — friendly messages when no data is available.

Design tone — YOU DECIDE:
- This is an analytics/reporting page — data-dense but clean.
- Numbers should be large and instantly readable.
- Charts should be visually appealing with the specified provider colors.
- The budget warning should feel urgent without being alarming.
- Light theme, dark theme, or mixed — your choice.
- Professional and trustworthy — this page shows financial data.

Design priorities (in order):
1. At-a-glance comprehension — the total cost and budget status must be instantly visible.
2. Provider breakdown clarity — the donut chart and legend must clearly show which provider costs more.
3. Trend visibility — the daily chart should reveal spending patterns at a glance.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 버전
```
Mobile version (375x812) of the same page described above.

Same product context: a platform where users manage AI agents. This page is a cost analysis dashboard showing AI operational expenses by provider, agent, model, and day, with budget monitoring.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation (switching between pages). DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile):
1. Page header with period selector (compact — buttons wrap to second line if needed, date inputs on third line)
2. Budget warning banner (full width)
3. Summary cards (stacked vertically — one per row)
4. Provider donut chart (centered, legend below the chart instead of beside it)
5. Agent cost ranking (top 5 shown, "Show more" toggle)
6. Daily cost trend chart (horizontally scrollable if more than 14 days)
7. Loading skeleton
8. Empty/error states

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. Total cost and budget status visible without scrolling.
2. Charts should remain readable — donut legend below, bar chart scrollable.
3. Period selector must be usable with touch (adequate tap targets).

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `costs-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `costs-title` | 페이지 제목 ("비용 분석") | 제목 표시 확인 |
| `costs-period-7d` | 7일 버튼 | 기간 선택 |
| `costs-period-30d` | 30일 버튼 | 기간 선택 |
| `costs-period-custom` | 직접 설정 버튼 | 기간 선택 |
| `costs-date-start` | 시작일 date input | 커스텀 시작일 |
| `costs-date-end` | 종료일 date input | 커스텀 종료일 |
| `costs-budget-banner` | 예산 경고 배너 | 경고 표시 확인 |
| `costs-card-total` | 총 비용 카드 | 총 비용 금액 확인 |
| `costs-card-budget` | 예산 사용률 카드 | 퍼센트 확인 |
| `costs-card-provider` | 프로바이더 비용 카드 | 도넛 차트 확인 |
| `costs-donut-chart` | 도넛 차트 | 프로바이더별 비율 |
| `costs-provider-legend` | 프로바이더 범례 | 범례 항목 확인 |
| `costs-agents-section` | 에이전트별 비용 섹션 | 섹션 존재 확인 |
| `costs-agent-item` | 에이전트 비용 행 | 개별 에이전트 비용 |
| `costs-agent-bar` | 에이전트 비용 막대 | 상대 비용 시각화 |
| `costs-agents-toggle` | 더보기/접기 버튼 | 에이전트 목록 확장 |
| `costs-daily-section` | 일별 비용 섹션 | 섹션 존재 확인 |
| `costs-daily-bar` | 일별 비용 막대 | 개별 일자 비용 |
| `costs-daily-tooltip` | 막대 호버 툴팁 | 금액 표시 |
| `costs-loading-skeleton` | 로딩 스켈레톤 | 로딩 중 표시 |
| `costs-empty-state` | 빈 상태 | 데이터 없을 때 |
| `costs-error-state` | 에러 상태 | 데이터 로드 실패 시 |
| `costs-model-breakdown` | 모델별 비용 접이식 영역 | 프로바이더 내 모델별 비용 상세 |
| `costs-model-item` | 모델별 비용 행 | 개별 모델 비용 확인 |
| `costs-agent-link` | 에이전트 이름 링크 | 에이전트 상세 페이지 이동 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /costs 접속 | `costs-page` 존재, 로그인 안 튕김 |
| 2 | 기본 기간 | 페이지 로드 | 7일이 기본 선택, 데이터 표시 |
| 3 | 총 비용 카드 | 데이터 로드 후 | `costs-card-total`에 달러 금액 표시 |
| 4 | 예산 사용률 카드 | 데이터 로드 후 | `costs-card-budget`에 퍼센트 표시 |
| 5 | 프로바이더 도넛 | 데이터 로드 후 | `costs-donut-chart` 표시 + 범례 항목 존재 |
| 6 | 기간 30일 전환 | "30일" 버튼 클릭 | 데이터 재로드, 기간 라벨 변경 |
| 7 | 기간 직접 설정 | "직접 설정" 클릭 | date input 2개 표시 |
| 8 | 커스텀 날짜 입력 | 시작일/종료일 설정 | 해당 기간 데이터 로드 |
| 9 | 에이전트 비용 순위 | 데이터 있을 때 | `costs-agent-item` 1개 이상, 순위 번호 표시 |
| 10 | 에이전트 더보기 | "더보기" 클릭 | 11개 이상 에이전트 표시 |
| 11 | 에이전트 접기 | "접기" 클릭 | 10개 이하로 축소 |
| 12 | 일별 비용 차트 | 데이터 있을 때 | `costs-daily-bar` 1개 이상 표시 |
| 13 | 일별 차트 툴팁 | 막대 호버 | 달러 금액 툴팁 표시 |
| 14 | 예산 경고 배너 | 사용률 80%+ | `costs-budget-banner` 표시, 경고 텍스트 |
| 15 | 로딩 스켈레톤 | 데이터 로딩 중 | `costs-loading-skeleton` 표시 |
| 16 | 빈 데이터 상태 | 데이터 없을 때 | 적절한 빈 상태 메시지 |
| 17 | 예산 미설정 상태 | 예산 미설정 시 | `costs-card-budget`에 안내 메시지 표시 |
| 18 | 반응형 확인 | 375px 뷰포트 | 카드 1열, 차트 세로 나열 |
| 19 | 프로바이더 색상 확인 | 도넛 차트 렌더 | Anthropic 파란, OpenAI 초록, Google 주황 |
| 20 | API 에러 상태 | API 실패 시 | `costs-error-state` 에러 메시지 표시 |
