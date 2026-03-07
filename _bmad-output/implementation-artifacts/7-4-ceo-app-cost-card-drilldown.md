# Story 7.4: CEO App Cost Card Drilldown

Status: review

## Story

As a **CEO (사령관)**,
I want **작전현황 대시보드의 비용 카드를 클릭하면 부서별/에이전트별 비용 드릴다운 페이지로 이동하여 상세 비용 분석을 확인**,
so that **AI 운영 비용을 세부적으로 파악하고 비용 최적화 의사결정을 빠르게 할 수 있다**.

## Acceptance Criteria

1. **Given** 작전현황(대시보드) 페이지 **When** 비용 카드(💰) 클릭 **Then** /costs 경로로 이동하여 비용 드릴다운 페이지 표시
2. **Given** /costs 페이지 로딩 완료 **When** 데이터 수신 **Then** 상단에 비용 개요 카드 (총 비용, 예산 사용률 %, 프로바이더별 비용 도넛 차트) 표시
3. **Given** 비용 드릴다운 **When** 표시 **Then** 에이전트별 비용 순위 리스트 (비용 내림차순 정렬, 에이전트명 + 비용 + 호출 수)
4. **Given** 비용 드릴다운 **When** 표시 **Then** 일일 비용 추이 막대 차트 (div 기반, 호버 시 금액 표시)
5. **Given** 기간 선택기 **When** 7d/30d/custom 클릭 **Then** 모든 비용 데이터가 선택된 기간으로 새로고침
6. **Given** 예산 사용률 80% 이상 **When** 페이지 표시 **Then** 상단에 예산 경고 배너 표시 (노란색 80%+, 빨간색 100%+)
7. **Given** /costs 페이지 **When** 뒤로가기 **Then** 대시보드로 정상 복귀
8. **Given** turbo build **When** 전체 빌드 **Then** 3/3 패키지 성공

## Tasks / Subtasks

- [x] Task 1: 라우트 등록 + 대시보드 비용 카드 클릭 연결 (AC: #1, #7)
  - [x] 1.1 `packages/app/src/App.tsx`에 CostsPage lazy import + Route path="costs" 추가
  - [x] 1.2 `packages/app/src/pages/dashboard.tsx`의 Cost Card(💰)에 `onClick={() => navigate('/costs')}` + `cursor-pointer` 스타일 추가
  - [x] 1.3 사이드바 navigation에 비용 항목 추가 (선택적 — 대시보드 카드 클릭이 메인 진입점)

- [x] Task 2: 비용 드릴다운 페이지 생성 + 비용 개요 섹션 (AC: #2)
  - [x] 2.1 `packages/app/src/pages/costs.tsx` 생성
  - [x] 2.2 `useQuery` — GET /api/workspace/dashboard/costs?days=N 호출 (기존 엔드포인트)
  - [x] 2.3 `useQuery` — GET /api/workspace/dashboard/budget 호출 (기존 엔드포인트)
  - [x] 2.4 비용 개요 카드: 총 비용(USD), 예산 사용률(%), 프로바이더별 비용
  - [x] 2.5 CSS donut chart (대시보드 SatisfactionChart 패턴) — 프로바이더별 비용 비율 시각화

- [x] Task 3: 프로바이더별 도넛 차트 (AC: #2)
  - [x] 3.1 `conic-gradient` 기반 CSS donut (dashboard.tsx의 SatisfactionChart 패턴 재사용)
  - [x] 3.2 Anthropic(파란), OpenAI(초록), Google(주황) 색상 (PROVIDER_COLORS 재사용)
  - [x] 3.3 중앙에 총 비용 표시, 범례 포함

- [x] Task 4: 에이전트별 비용 Top 리스트 (AC: #3)
  - [x] 4.1 /api/workspace/dashboard/costs 응답의 byAgent 배열 사용 + 새 by-agent 엔드포인트
  - [x] 4.2 비용 내림차순 정렬, 에이전트명 + 비용(USD) + 호출 수 표시
  - [x] 4.3 상위 10개 표시 + "더보기" 접기/펼치기 (에이전트 수가 많을 수 있음)

- [x] Task 5: 일일 비용 추이 차트 (AC: #4)
  - [x] 5.1 새 workspace API: GET /api/workspace/dashboard/costs/daily?startDate=...&endDate=...
  - [x] 5.2 cost-aggregation.ts의 getDaily() 재사용
  - [x] 5.3 div 기반 막대 차트 (admin costs.tsx DailyChart 패턴 참조)
  - [x] 5.4 호버 시 날짜 + 금액 툴팁

- [x] Task 6: 기간 선택기 (AC: #5)
  - [x] 6.1 7d / 30d 버튼 토글 (기본: 7d)
  - [x] 6.2 custom: 시작일/종료일 date input (선택적)
  - [x] 6.3 기간 변경 시 모든 useQuery의 queryKey에 반영 → 자동 새로고침

- [x] Task 7: 예산 경고 배너 (AC: #6)
  - [x] 7.1 budget API 응답의 usagePercent 사용
  - [x] 7.2 80%+ 노란색 배너: "예산 {N}% 사용 중 — 주의"
  - [x] 7.3 100%+ 빨간색 배너: "예산 초과! 자동 차단이 활성화될 수 있습니다"

- [x] Task 8: workspace 비용 API 추가 (AC: #4, #3)
  - [x] 8.1 `packages/server/src/routes/workspace/dashboard.ts`에 GET /api/workspace/dashboard/costs/daily 엔드포인트 추가
  - [x] 8.2 GET /api/workspace/dashboard/costs/by-agent 엔드포인트 추가
  - [x] 8.3 cost-aggregation.ts의 getDaily() + getByAgent() 재사용 (companyId 기반, workspace auth)
  - [x] 8.4 dateRange query 파라미터 (startDate, endDate) with Zod validation

- [x] Task 9: 빌드 검증 (AC: #8)
  - [x] 9.1 turbo build 3/3 확인 (server cached, admin 2.7s, app 9.2s)

## Dev Notes

### 핵심: 기존 Workspace API (재사용 가능)

**대시보드 비용 API (packages/server/src/routes/workspace/dashboard.ts):**
- `GET /api/workspace/dashboard/costs?days=N`
  - 응답: `{ data: { totalCostUsd, byModel: [{model, costUsd, inputTokens, outputTokens, count}], byAgent: [{agentId, agentName, costUsd, count}], bySource: [{source, costUsd, count}], days } }`
- `GET /api/workspace/dashboard/budget`
  - 응답: `{ data: { monthlyBudgetUsd, currentMonthSpendUsd, projectedMonthEndUsd, usagePercent, isDefaultBudget, byDepartment: [{departmentId, name, costUsd}] } }`
- `GET /api/workspace/dashboard/summary`
  - 응답 내 cost 필드: `{ cost: { todayUsd, budgetUsagePercent, byProvider: [{provider, costUsd}] } }`

**신규 추가: 일일 비용 + 에이전트별 비용 API**
- `GET /api/workspace/dashboard/costs/daily?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
  - cost-aggregation.ts의 `getDaily(companyId, range)` 재사용
  - 응답: `{ success: true, data: { items: [{date, costMicro, inputTokens, outputTokens, callCount}], meta: {...} } }`
- `GET /api/workspace/dashboard/costs/by-agent?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
  - cost-aggregation.ts의 `getByAgent(companyId, range)` 재사용
  - 응답: `{ success: true, data: { items: [{agentId, agentName, totalCostMicro, inputTokens, outputTokens, callCount}] } }`

### UI 패턴 (CEO 앱 기존 패턴 준수)

**Dashboard 페이지 패턴 참조 (packages/app/src/pages/dashboard.tsx):**
- `useQuery` + React Query + `api.get()` 패턴
- Card 컴포넌트 레이아웃
- Skeleton 로딩 상태
- PROVIDER_COLORS: anthropic=#3B82F6, openai=#22C55E, google=#F97316
- PROVIDER_LABELS: anthropic='Anthropic', openai='OpenAI', google='Google'
- CSS conic-gradient donut chart (SatisfactionChart 패턴)
- div 기반 bar chart (UsageChart 패턴)
- `useNavigate()` from react-router-dom

### 주의사항 (Developer Guardrails)

1. **차트 라이브러리 사용 금지** — div/CSS 기반 차트만 (dashboard.tsx 패턴)
2. **api.get() 사용** — fetch 직접 호출 금지 (packages/app/src/lib/api.ts)
3. **USD 표시** — workspace API는 USD 단위로 이미 변환됨 (admin API와 다름, admin은 microdollars)
4. **workspace endpoint만** — /api/admin/* 절대 사용 금지 (auth 실패)
5. **Korean UI** — 모든 라벨 한국어
6. **다크 모드** — 모든 색상에 dark: 클래스
7. **반응형** — grid-cols-1 sm:grid-cols-2 패턴

### Project Structure Notes

- 신규 파일: `packages/app/src/pages/costs.tsx` (CEO 비용 드릴다운 페이지)
- 수정 파일: `packages/app/src/App.tsx` (CostsPage lazy import + /costs route 추가)
- 수정 파일: `packages/app/src/pages/dashboard.tsx` (비용 카드에 onClick 추가)
- 수정 파일: `packages/app/src/components/sidebar.tsx` (비용 분석 nav 항목 추가)
- 수정 파일: `packages/server/src/routes/workspace/dashboard.ts` (2개 신규 엔드포인트 추가)
- 신규 테스트: `packages/server/src/__tests__/unit/ceo-cost-drilldown.test.ts` (34 tests)

### References

- [Source: packages/server/src/routes/workspace/dashboard.ts] — 기존 + 신규 workspace costs API
- [Source: packages/server/src/services/cost-aggregation.ts] — getDaily(), getByAgent() 재사용
- [Source: packages/app/src/pages/dashboard.tsx] — 비용 카드 클릭 이벤트, CSS donut/bar 패턴
- [Source: packages/admin/src/pages/costs.tsx] — Admin 비용 대시보드 참고
- [Source: packages/app/src/App.tsx] — 라우트 등록 패턴
- [Source: _bmad-output/planning-artifacts/epics.md:1170] — E7-S4 수용 기준

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- CostsPage: Full CEO cost drilldown with 3-card overview (total cost, budget %, provider donut), agent ranking, daily trend chart
- Dashboard cost card: Made clickable with onClick navigate to /costs, cursor-pointer, hover effect, "상세 →" indicator
- Provider donut: CSS conic-gradient with PROVIDER_COLORS, center shows total, legend with per-provider breakdown
- Agent ranking: Top 10 by default with "더보기" expand, horizontal bar proportional to max cost, callCount display
- Daily chart: div-based bar chart from workspace/dashboard/costs/daily API (microdollars), hover tooltip
- Period selector: 7d/30d/custom with date inputs, all queries react to period changes via queryKey
- Budget warning banner: yellow ≥80%, red ≥100%, clear Korean messaging
- Server: Added 2 new workspace endpoints (costs/daily, costs/by-agent) reusing cost-aggregation service with workspace auth
- Sidebar: Added 비용 분석 nav item with 💰 icon under 운영 section
- Build: 3/3 turbo build passing (costs.tsx chunk: 11.14 kB / 3.68 kB gzip)
- Tests: 34 tests passing (API shape, date parsing, budget warnings, provider grouping, donut gradient, agent list, period selector)

### File List

- packages/app/src/pages/costs.tsx (NEW — CEO 비용 드릴다운 페이지)
- packages/app/src/App.tsx (MODIFIED — CostsPage lazy import + /costs route)
- packages/app/src/pages/dashboard.tsx (MODIFIED — 비용 카드 onClick navigate + 호버 효과)
- packages/app/src/components/sidebar.tsx (MODIFIED — 비용 분석 nav 항목 추가)
- packages/server/src/routes/workspace/dashboard.ts (MODIFIED — costs/daily + costs/by-agent 엔드포인트 추가)
- packages/server/src/__tests__/unit/ceo-cost-drilldown.test.ts (NEW — 34 tests)
