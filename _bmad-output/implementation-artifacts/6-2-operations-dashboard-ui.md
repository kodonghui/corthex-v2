# Story 6.2: Operations Dashboard UI (작전현황 대시보드)

Status: done

## Story

As a **CEO (김대표)**,
I want **작전현황(홈 대시보드) 화면에서 4개 요약 카드, AI 사용량 막대 그래프, 예산 진행 바, 퀵 액션을 한눈에 볼 수 있도록**,
so that **조직 전체 현황(작업/비용/에이전트/연동 상태)을 시각적으로 파악하고, 빠른 조작을 할 수 있다**.

## Acceptance Criteria

1. **4개 요약 카드** (상단 행):
   - 작업 현황: 오늘 총 명령 수, 완료/실패/진행중 수, 색상 인디케이터
   - 비용 현황: 오늘 총 비용(USD), 예산 사용률(%), 프로바이더별 비용
   - 에이전트 현황: 전체/활성/유휴/에러 수
   - 연동 상태: LLM 프로바이더별 상태(green=up, red=down), 도구 시스템 상태
2. **AI 사용량 차트** (중간):
   - 최근 7일(기본)/30일 토글 막대 그래프
   - 프로바이더별 스택드 바 (Anthropic=blue, OpenAI=green, Google=orange)
   - Y축: 비용(USD)
3. **예산 진행 바** (차트 하단):
   - 수평 바: 현재 지출 vs 월 예산
   - 색상 전환: 초록(0-60%) → 노랑(60-80%) → 빨강(80-100%)
   - 월말 예상 지출 점선 마커
4. **퀵 액션** (하단):
   - "루틴 실행", "시스템 점검", "비용 리포트" 버튼
   - 클릭 시 사령관실(/command-center)로 이동 + 프리셋 명령 자동 입력
5. **반응형**: xl+ 4열 카드 | md 2열 | sm 1열 (UX 스펙 준수)
6. **자동 갱신**: 30초 refetchInterval (API 캐시 TTL과 일치)
7. **UI 초기 로딩 < 3초** (NFR5)

## Tasks / Subtasks

- [x] Task 1: 기존 dashboard.tsx 완전 재작성 (AC: #1~#7)
  - [x] 1.1 3개 API 호출 연결: /summary, /usage, /budget (6-1 API)
  - [x] 1.2 4개 요약 카드 컴포넌트 (SummaryCards)
  - [x] 1.3 AI 사용량 막대 그래프 (UsageChart) — div 기반, 라이브러리 없음
  - [x] 1.4 예산 진행 바 (BudgetBar)
  - [x] 1.5 퀵 액션 버튼 (QuickActions)
  - [x] 1.6 7일/30일 토글 상태 관리
  - [x] 1.7 반응형 그리드 (Tailwind grid-cols-4/2/1)
  - [x] 1.8 30초 자동 갱신 (refetchInterval)
- [x] Task 2: 사이드바 메뉴 업데이트 (AC: #5)
  - [x] 2.1 sidebar.tsx에서 "/dashboard" 항목을 "작전현황"으로 변경, 아이콘 유지
  - [x] 2.2 홈("/") 대신 "/dashboard"가 작전현황 역할하도록 — 사이드바에서 작전현황 라벨 사용

## Dev Notes

### API 엔드포인트 (Story 6-1에서 구현 완료)

```typescript
// 1. 요약 카드 데이터
GET /api/workspace/dashboard/summary
// 응답: { success: true, data: DashboardSummary }

// 2. 사용량 차트 데이터
GET /api/workspace/dashboard/usage?days=7
// 응답: { success: true, data: DashboardUsage }

// 3. 예산 진행률
GET /api/workspace/dashboard/budget
// 응답: { success: true, data: DashboardBudget }
```

### 공유 타입 (packages/shared/src/types.ts에 정의됨)

```typescript
type DashboardSummary = {
  tasks: { total: number; completed: number; failed: number; inProgress: number }
  cost: { todayUsd: number; byProvider: { provider: LLMProviderName; costUsd: number }[]; budgetUsagePercent: number }
  agents: { total: number; active: number; idle: number; error: number }
  integrations: { providers: { name: LLMProviderName; status: 'up' | 'down' }[]; toolSystemOk: boolean }
}

type DashboardUsageDay = {
  date: string; provider: LLMProviderName; inputTokens: number; outputTokens: number; costUsd: number
}

type DashboardUsage = { days: number; usage: DashboardUsageDay[] }

type DashboardBudget = {
  currentMonthSpendUsd: number; monthlyBudgetUsd: number; usagePercent: number
  projectedMonthEndUsd: number; isDefaultBudget: boolean
  byDepartment: { departmentId: string; name: string; costUsd: number }[]
}

type LLMProviderName = 'anthropic' | 'openai' | 'google'
```

### 기존 코드 재사용 (재발명 금지)

- **api.ts** (`packages/app/src/lib/api.ts`): `api.get<T>(path)` 사용. 응답은 `{ success: true, data: T }` → `data` 필드 접근
- **@tanstack/react-query**: 이미 설치됨. `useQuery` + `queryKey` + `refetchInterval: 30_000`
- **Tailwind CSS**: 이미 설정됨. grid-cols-4, bg-indigo-50, text-2xl 등 기존 패턴 사용
- **Skeleton**: `@corthex/ui`에서 import — 로딩 중 표시
- **기존 dashboard.tsx**: 현재 v0 대시보드가 있음 (costs/agents/stats 3개 API 사용). **완전 재작성** 필요 — 새 6-1 API 3개(summary/usage/budget)로 교체

### 차트 구현 가이드 (외부 라이브러리 없이)

```tsx
// AI 사용량 막대 그래프: div 기반 스택드 바
// 1. usage 데이터를 날짜별로 그룹핑
// 2. 각 날짜의 provider별 costUsd 합산
// 3. 전체 최대값 계산 → 각 바의 height를 % 비율로 산출
// 4. 프로바이더 색상: anthropic=#3B82F6(blue), openai=#22C55E(green), google=#F97316(orange)

const providerColors: Record<LLMProviderName, string> = {
  anthropic: '#3B82F6', // blue-500
  openai: '#22C55E',    // green-500
  google: '#F97316',    // orange-500
}
```

### 예산 진행 바 구현

```tsx
// usagePercent에 따른 색상 전환
function getBudgetColor(percent: number): string {
  if (percent >= 80) return 'bg-red-500'
  if (percent >= 60) return 'bg-yellow-500'
  return 'bg-green-500'
}
// 월말 예상(projectedMonthEndUsd)은 점선 마커로 표시
// 예: left: `${(projected / budget) * 100}%` + border-dashed
```

### 퀵 액션 → 사령관실 연동

```tsx
import { useNavigate } from 'react-router-dom'

// 퀵 액션 클릭 시 사령관실로 이동 + query param으로 프리셋 전달
const navigate = useNavigate()
const quickActions = [
  { label: '루틴 실행', command: '/루틴', icon: '▶️' },
  { label: '시스템 점검', command: '/시스템점검', icon: '🔍' },
  { label: '비용 리포트', command: '/비용리포트', icon: '📊' },
]
// navigate(`/command-center?preset=${encodeURIComponent(action.command)}`)
```

### 반응형 레이아웃 (UX 스펙)

| 브레이크포인트 | 요약 카드 | 차트 | 퀵 액션 |
|-------------|----------|------|---------|
| `xl+` | 4열 (한 줄) | 좌우 2열 가능 | 3열 그리드 |
| `lg` | 4열 | 좌우 2열 | 2열 그리드 |
| `md` | 2열 (2행) | 세로 1열 | 2열 그리드 |
| `sm` | 1열 (4행) | 세로 1열 | 1열 세로 |

```tsx
// Tailwind 클래스:
// 카드: grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4
// 퀵 액션: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3
```

### Project Structure Notes

- **수정 파일**: `packages/app/src/pages/dashboard.tsx` (완전 재작성)
- **수정 파일**: `packages/app/src/components/sidebar.tsx` (메뉴 라벨 변경: "대시보드" → "작전현황")
- 새 파일 불필요 — 단일 페이지 컴포넌트에 모든 UI 포함 (컴포넌트 분리는 파일 내부 함수로)
- 라우팅 변경 없음 — `/dashboard` 경로 이미 App.tsx에 등록됨

### References

- [Source: packages/server/src/routes/workspace/dashboard.ts] — 3개 API 엔드포인트 (summary/usage/budget)
- [Source: packages/server/src/services/dashboard.ts] — DashboardService (getSummary, getUsage, getBudget)
- [Source: packages/shared/src/types.ts#DashboardSummary] — 공유 타입 정의
- [Source: packages/app/src/lib/api.ts] — api.get() 패턴
- [Source: packages/app/src/pages/dashboard.tsx] — 기존 v0 대시보드 (재작성 대상)
- [Source: packages/app/src/components/sidebar.tsx] — 사이드바 메뉴 구조
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Template1] — Dashboard 레이아웃 템플릿
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#13.2.2] — 작전현황 반응형 브레이크포인트
- [Source: _bmad-output/planning-artifacts/epics.md#Epic6] — E6-S2 수용 기준
- [Source: _bmad-output/implementation-artifacts/6-1-dashboard-aggregation-api.md] — 이전 스토리 파일 리스트, 패턴

### Previous Story Intelligence (6-1)

- DashboardService는 순수 함수 기반 (getSummary, getUsage, getBudget)
- TTL 캐시: summary=30s, usage/budget=5min
- 모든 응답 `{ success: true, data }` 형식
- Provider status: 최근 30분 costRecords 존재 여부로 판정
- Budget: 기본값 $500/month, `isDefaultBudget` 플래그 포함
- 타입은 packages/shared/src/types.ts에 추가됨 (별도 파일 아님)

### Git Intelligence

최근 커밋 패턴:
- 프론트엔드 페이지는 `packages/app/src/pages/` 경로
- 기존 대시보드 이미 `@tanstack/react-query` + `api.get()` 패턴 사용
- Tailwind CSS 클래스로 스타일링 (CSS 모듈이나 styled-components 없음)
- 기존 dashboard.tsx가 3개 구 API(costs/agents/stats) 사용 → 새 3개 API(summary/usage/budget)로 교체

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- Complete rewrite of dashboard.tsx from v0 (costs/agents/stats) to v2 작전현황 (summary/usage/budget)
- 4 summary cards: tasks (completed/failed/inProgress), cost (todayUsd + provider breakdown + budgetUsagePercent), agents (total/active/idle/error), integrations (provider status + toolSystem)
- AI usage chart: div-based stacked bar chart, no external chart library, provider-colored segments (Anthropic=blue, OpenAI=green, Google=orange)
- Budget progress bar: color transitions green(0-60%)/yellow(60-80%)/red(80+%), dashed projected month-end marker, department breakdown
- Quick actions: 3 buttons (루틴 실행, 시스템 점검, 비용 리포트) navigate to /command-center?preset=
- 7/30 day toggle using @corthex/ui Toggle component
- 30s refetchInterval on all 3 queries (matches API cache TTL)
- Responsive grid: xl 4-col / sm:2-col / 1-col cards; lg:3-col / sm:2-col / 1-col quick actions
- Skeleton loading state using @corthex/ui Card + Skeleton
- Sidebar label changed: "대시보드" -> "작전현황"
- 23 unit tests: groupUsageByDate, getBudgetColor, API shape validation, QuickActions navigation, provider colors, responsive grid classes
- Build passes (11.7kB gzipped 3.42kB)
- All 85 existing app tests pass (0 regressions)
- Code review fixes: types imported from @corthex/shared, error state UI, page title, division-by-zero guard
- TEA: 35 additional edge case tests
- Final: 219 tests pass, 0 regressions

### File List

- packages/app/src/pages/dashboard.tsx (MODIFIED - complete rewrite)
- packages/app/src/components/sidebar.tsx (MODIFIED - label "대시보드" -> "작전현황")
- packages/app/src/__tests__/dashboard.test.ts (NEW - 23 tests)
- packages/app/src/__tests__/dashboard-tea.test.ts (NEW - 35 TEA tests)
