# Dashboard (작전현황) UX/UI 설명서

> 페이지: #03 dashboard
> 패키지: app
> 경로: /dashboard
> 작성일: 2026-03-09

---

## 1. 페이지 목적

CEO가 AI 조직 전체의 **실시간 상태를 한눈에 파악**하는 대시보드. 작업 현황, 비용, 에이전트 상태, 연동 상태, 만족도를 요약 카드와 차트로 표시.

**핵심 사용자 시나리오:**
- 아침에 접속해서 오늘 AI가 처리한 작업 수, 비용, 에이전트 상태 확인
- 예산 사용률 확인 (초과 위험 여부)
- 퀵 액션으로 자주 쓰는 명령 원클릭 실행
- CEO 만족도 트렌드 확인

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────┐
│  Header: "작전현황"         [WsStatusIndicator]     │
│  "조직 전체 현황을 한눈에 파악합니다"                    │
├─────────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │📋 작업│  │💰 비용│  │🤖 에이전트│  │🔗 연동  │    │
│  │현황   │  │현황   │  │현황       │  │상태     │    │
│  └──────┘  └──────┘  └──────┘  └──────┘           │
│                                                     │
│  ┌───────────────────────────────────────────┐      │
│  │ AI 사용량 (7일/30일)  [토글]               │      │
│  │ [■■■■ stacked bar chart ■■■■]             │      │
│  │ ● Anthropic  ● OpenAI  ● Google           │      │
│  └───────────────────────────────────────────┘      │
│                                                     │
│  ┌───────────────────────────────────────────┐      │
│  │ 월 예산 진행률   $X.XX / $XXX              │      │
│  │ [████████░░░░] XX% 사용                   │      │
│  │ 부서별 비용 breakdown                      │      │
│  └───────────────────────────────────────────┘      │
│                                                     │
│  ┌─────────────┐  ┌──────────────────────────┐     │
│  │ 명령 만족도   │  │ 퀵 액션                   │    │
│  │ [donut 차트]  │  │ [버튼] [버튼] [버튼] [버튼]│    │
│  └─────────────┘  └──────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

---

## 3. 현재 문제점

1. **카드 레이아웃 단조로움**: 4개 요약 카드가 동일한 크기/스타일이라 중요도 구분 어려움
2. **차트 원시적**: div 기반 stacked bar chart가 시각적으로 매력적이지 않음
3. **만족도 차트 위치**: 사용량/예산 아래에 있어 잘 안 보임
4. **퀵 액션 노출도**: 페이지 하단에 위치해 스크롤 필요할 수 있음
5. **비용 카드 드릴다운**: 클릭하면 /costs로 이동하는데 시각적 힌트가 약함
6. **WebSocket 상태 인디케이터**: 우상단에 작게 있어서 연결 상태를 놓치기 쉬움
7. **모바일 스크롤**: 모든 콘텐츠가 세로로 나열되어 스크롤이 길어짐
8. **로딩 스켈레톤**: 있지만 실제 카드 크기와 불일치

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 v0.dev가 결정** — 특정 테마 강제 없음
- 데이터 대시보드 느낌 (Datadog, Grafana, Linear 같은 정보 밀도 높은 UI)
- 상태별 색상 구분 명확 (정상=초록, 경고=노랑, 위험=빨강)

### 4.2 레이아웃 개선
- **카드 시각적 위계**: 중요 카드(작업, 비용) 강조
- **차트 품질 향상**: 더 세련된 그래프 스타일링
- **퀵 액션 배치**: v0.dev가 최적 위치 결정 (반드시 상단이 아님 -- 비용/예산 정보가 우선 노출되어야 함)

### 4.3 인터랙션 개선
- 비용 카드 hover 시 드릴다운 힌트 강화
- 차트 tooltip 개선
- 만족도 기간 전환 더 직관적으로

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | DashboardPage | 전체 레이아웃 spacing 조정 | pages/dashboard.tsx |
| 2 | SummaryCards | 카드 스타일 개선, 시각적 위계 | pages/dashboard.tsx (인라인) |
| 3 | UsageChart | 차트 스타일 개선, tooltip 강화 | pages/dashboard.tsx (인라인) |
| 4 | BudgetBar | 프로그레스 바 디자인 개선 | pages/dashboard.tsx (인라인) |
| 5 | SatisfactionChart | 도넛 차트 + 기간 선택 개선 | pages/dashboard.tsx (인라인) |
| 6 | QuickActionsPanel | 위치/스타일 개선 | pages/dashboard.tsx (인라인) |
| 7 | DashboardSkeleton | 실제 크기 매칭 스켈레톤 | pages/dashboard.tsx (인라인) |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| summary | useQuery → /workspace/dashboard/summary | 요약 카드 4개 |
| usage | useQuery → /workspace/dashboard/usage?days=N | 사용량 차트 |
| budget | useQuery → /workspace/dashboard/budget | 예산 진행률 |
| satisfaction | useQuery → /workspace/dashboard/satisfaction?period=N | 만족도 차트 |
| quickActions | useQuery → /workspace/dashboard/quick-actions | 퀵 액션 버튼 |
| usageDays | useState (7 or 30) | 사용량 기간 토글 |

**API 엔드포인트 (변경 없음):**
- `GET /api/workspace/dashboard/summary` — 요약 데이터
- `GET /api/workspace/dashboard/usage?days=N` — AI 사용량
- `GET /api/workspace/dashboard/budget` — 예산 정보
- `GET /api/workspace/dashboard/satisfaction?period=N` — 만족도
- `GET /api/workspace/dashboard/quick-actions` — 퀵 액션 목록
- `POST /api/workspace/presets/:id/execute` — 프리셋 실행
- WebSocket: dashboard 채널 (실시간 업데이트)

---

## 7. 색상/톤 앤 매너

| 용도 | 설명 |
|------|------|
| 작업 완료 | 초록 (green) |
| 작업 실패 | 빨강 (red) |
| 작업 진행중 | 파랑 (blue) |
| 예산 안전 | 초록 (0~59%) |
| 예산 주의 | 노랑 (60~79%) |
| 예산 위험 | 빨강 (80%+) |
| Anthropic | 파랑 (#3B82F6) |
| OpenAI | 초록 (#22C55E) |
| Google | 오렌지 (#F97316) |
| 만족도 긍정 | 초록 |
| 만족도 부정 | 빨강 |

---

## 8. 상태별 UI 정의

### 8.1 로딩 상태
- 모든 카드/차트에 스켈레톤 UI 표시 (`dashboard-skeleton`)
- 스켈레톤은 실제 컴포넌트 크기와 일치해야 함

### 8.2 에러 상태
- API 호출 실패 시 에러 메시지 표시 (`dashboard-error`)
- "다시 시도" 버튼 포함

### 8.3 Empty 상태
- **작업 0건**: 작업 카드에 "0" 표시 + "아직 오늘 실행된 명령이 없습니다" 안내
- **에이전트 0명**: 에이전트 카드에 "0명" + "관리자에게 AI 에이전트 등록을 요청하세요" 안내
- **사용량 차트 데이터 없음**: 차트 영역에 "데이터가 아직 없습니다" placeholder
- **만족도 0건**: 도넛 차트 대신 "아직 피드백이 없습니다" 안내
- **퀵 액션 0개**: "설정된 퀵 액션이 없습니다" 안내
- **예산 미설정**: 예산 프로그레스 바 대신 "월 예산이 설정되지 않았습니다. 관리자에게 예산 설정을 요청하세요" 안내

---

## 9. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 4컬럼 요약 카드, 넓은 차트 |
| **768px~1439px** (Tablet) | 2컬럼 요약 카드, 차트 풀너비 |
| **~767px** (Mobile) | 1컬럼 모든 요소, 스크롤 |

---

## 10. 기존 기능 참고사항

v1-feature-spec.md 9번 항목에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 요약 카드 4개 (작업, 비용, 에이전트, 연동 상태)
- [x] AI 사용량 프로바이더별 차트 (7일/30일 토글)
- [x] 월 예산 진행률 + 부서별 비용 (v1의 일일 한도는 v2에서 월 예산으로 통합됨 -- 일일 비용은 요약 카드의 '오늘 비용'에 표시)
- [x] 퀵 액션 (프리셋 실행 + 네비게이션, 최근 사용 순 서버 정렬)
- [x] CEO 만족도 도넛 차트 (7일/30일/전체)
- [x] WebSocket 실시간 업데이트
- [x] 비용 카드 클릭 → /costs 드릴다운

**UI 변경 시 절대 건드리면 안 되는 것:**
- `useDashboardWs` 훅의 WebSocket 로직
- TanStack Query queryKey/queryFn 구조
- `executePreset` mutation
- `groupUsageByDate` 데이터 처리 로직
- `getBudgetColor` 예산 색상 로직
- `navigate('/costs')` 드릴다운 로직

---

## 11. v0.dev 디자인+코딩 지시사항

> v0.dev가 디자인과 코딩을 동시에 수행합니다. 아래 내용을 v0 프롬프트에 포함하세요. 레이아웃은 v0에게 자유도를 부여합니다.

### v0 프롬프트 (디자인+코딩 통합)
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. Think of it like Slack or Linear, but instead of messaging coworkers, you're giving tasks to AI employees and watching them collaborate to deliver results.

This page: The main dashboard — an overview of the entire AI organization's status. The CEO opens this page to quickly understand what's happening across all AI agents, costs, and task completion.

User workflow:
1. CEO opens the dashboard first thing in the morning
2. Scans summary cards to see today's task count, costs, agent status, and system health
3. Checks the AI usage chart to monitor spending trends
4. Reviews the monthly budget progress bar
5. Glances at satisfaction trends
6. Optionally clicks a "quick action" button to trigger a common command

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Page header — title and a small real-time connection status indicator.
2. Summary cards (4) — Tasks (total/completed/failed/in-progress), Costs (today's spend + budget %), Agents (total/active/idle/error), Integrations (provider status: up/down for Anthropic/OpenAI/Google + tool system).
3. AI usage chart — stacked bar chart showing daily spend (cost in dollars) by provider (Anthropic=blue, OpenAI=green, Google=orange). Toggleable between 7-day and 30-day views. Hoverable bars with tooltip showing date, cost, and call count. Note: the primary metric is cost, but tooltip should also show call count for reference.
4. Monthly budget progress bar — horizontal bar showing current spend vs budget. Color changes: green (0-59%), yellow (60-79%), red (80%+). Shows projected month-end spend as a dashed marker with tooltip "Projected based on current spending trend". Department-level cost breakdown below. If budget is not set, show a placeholder message instead of the bar.
5. Satisfaction donut chart — shows positive/negative/neutral feedback ratio. Period selector (7d / 30d / all). Shows satisfaction rate percentage in center. IMPORTANT: The period selector UI pattern must match the usage chart's 7/30-day toggle (use the same component style for consistency).
6. Quick action buttons — grid of action buttons with icons and labels. Some trigger preset commands, others navigate to other pages.
7. Loading skeleton — skeleton UI matching the layout of all cards and charts.
8. Error state — clear message when data cannot be loaded.
9. Empty state — when there is no data yet (zero tasks, zero agents, no usage history), show a friendly placeholder instead of blank space. Each card/chart should have its own empty state message.

Design tone — YOU DECIDE:
- This is a data-rich executive dashboard for monitoring an AI workforce.
- Choose whatever visual tone fits best — clean data visualization, professional analytics feel.
- Light theme, dark theme, or mixed — your choice.
- Information density is important — the CEO wants to see everything at a glance without scrolling.

Design priorities (in order):
1. Summary cards must be scannable in under 2 seconds.
2. Budget status must be immediately obvious (safe vs danger).
3. Charts should be visually polished but not overwhelming.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 참고사항
```
Mobile version (375x812) of the same dashboard page described above.

Same product context: CEO dashboard showing AI organization overview.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation. DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Mobile-specific adaptations:
- Summary cards: 1 or 2 columns (not 4)
- Charts: full width, vertically stacked
- Quick actions: 2-column grid
- All content scrollable vertically

Design tone: Same as desktop version. YOU DECIDE the tone.

Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 12. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `dashboard-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `dashboard-header` | 페이지 헤더 | 제목 + WS 상태 |
| `summary-card-tasks` | 작업 현황 카드 | 작업 수 확인 |
| `summary-card-costs` | 비용 현황 카드 | 비용 확인 |
| `summary-card-agents` | 에이전트 카드 | 에이전트 상태 확인 |
| `summary-card-integrations` | 연동 상태 카드 | 시스템 상태 확인 |
| `usage-chart` | 사용량 차트 | 차트 표시 확인 |
| `usage-toggle` | 7/30일 토글 | 기간 전환 |
| `budget-bar` | 예산 프로그레스 바 | 예산 사용률 |
| `budget-dept-breakdown` | 부서별 비용 | 비용 상세 |
| `satisfaction-chart` | 만족도 차트 | 도넛 차트 확인 |
| `satisfaction-period` | 기간 선택 버튼 | 7d/30d/all 전환 |
| `quick-action-btn-{id}` | 퀵 액션 버튼 (개별) | 개별 액션 실행 |
| `budget-percentage` | 예산 사용률 텍스트 | % 값 확인 |
| `budget-projected` | 예상 월말 소비 마커 | 예상치 확인 |
| `dashboard-skeleton` | 로딩 스켈레톤 | 로딩 중 표시 |
| `dashboard-error` | 에러 메시지 | API 실패 시 |
| `dashboard-empty-tasks` | 작업 빈 상태 | 작업 0건 |
| `dashboard-empty-usage` | 사용량 빈 상태 | 차트 데이터 없음 |
| `dashboard-empty-satisfaction` | 만족도 빈 상태 | 피드백 0건 |
| `dashboard-empty-quickactions` | 퀵 액션 빈 상태 | 액션 0개 |
| `dashboard-empty-budget` | 예산 빈 상태 | 예산 미설정 |
| `ws-status` | WebSocket 상태 | 연결 상태 표시 |

---

## 13. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 | 테스트 유형 |
|---|--------|------|----------|-----------|
| 1 | 페이지 로드 | /dashboard 접속 | `dashboard-page` 존재 | E2E |
| 2 | 요약 카드 표시 | 로드 완료 | 4개 카드 모두 숫자 표시 | E2E |
| 3 | 사용량 차트 | 로드 완료 | 차트 바 표시 | E2E |
| 4 | 기간 토글 | 30일 토글 클릭 | 차트 데이터 변경 | E2E |
| 5 | 예산 바 | 로드 완료 | 프로그레스 바 + % 표시 | E2E |
| 6 | 만족도 차트 | 로드 완료 | 도넛 차트 + % 표시 | E2E |
| 7 | 만족도 기간 | 30d 클릭 | 데이터 변경 | E2E |
| 8 | 비용 카드 클릭 | 비용 카드 클릭 | /costs 페이지로 이동 | E2E |
| 9 | 퀵 액션 (네비게이션) | 네비게이션형 퀵 액션 클릭 | 해당 페이지로 이동 | E2E |
| 10 | 퀵 액션 (프리셋) | 프리셋형 퀵 액션 클릭 | 명령 실행 피드백 표시 | E2E |
| 11 | 반응형 | 375px 뷰포트 | 1컬럼 레이아웃 | E2E |
| 12 | 로딩 스켈레톤 | 데이터 로딩 중 | 스켈레톤 표시 | E2E (page.route 응답 지연) |
| 13 | 에러 상태 | API 실패 시뮬레이션 | `dashboard-error` 표시 | Mock필요 (page.route 에러 응답) |
| 14 | 예산 퍼센트 | 로드 완료 | `budget-percentage` 숫자 표시 | E2E |
| 15 | WS 상태 표시 | 페이지 로드 | `ws-status` 인디케이터 존재 | E2E |
| 16 | 예산 색상 전환 | 예산 80%+ 데이터 | 프로그레스 바 빨간색 | E2E (데이터 의존) |

**동적 testid 참고:** `quick-action-btn-{id}`는 Playwright에서 `[data-testid^="quick-action-btn-"]` prefix match로 select.
