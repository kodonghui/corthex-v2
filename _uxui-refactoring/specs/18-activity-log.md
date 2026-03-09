# Activity Log (활동 로그) UX/UI 설명서

> 페이지: #18 activity-log
> 패키지: app
> 경로: /activity-log
> 작성일: 2026-03-09

---

## 1. 페이지 목적

AI 에이전트 조직의 모든 활동을 실시간으로 모니터링하는 로그 페이지. WebSocket을 통해 새 이벤트가 발생하면 자동으로 갱신된다. 4개 탭(활동/통신/QA/도구)으로 구분된 데이터를 테이블 형식으로 조회하며, 검색, 날짜 필터, 페이지네이션을 지원한다.

**핵심 사용자 시나리오:**
- CEO가 에이전트들의 실시간 활동 현황을 모니터링
- 위임 통신 기록(발신 → 수신, 비용, 토큰)을 추적
- QA 검수 결과를 확인하고 상세 점수(규칙별/루브릭/환각 보고서)를 열람
- 도구 호출 기록(도구명, 소요시간, 상태)을 확인
- 보안 알림(입력 차단, 인젝션 시도)을 즉시 인지

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────┐
│  Header: "통신로그"                    [WS 상태 ●]   │
├─────────────────────────────────────────────────────┤
│  [활동] [통신] [QA] [도구]   ← Tabs                  │
├─────────────────────────────────────────────────────┤
│  [보안 알림: 최근 24시간 N건 차단]  ← QA탭, 클릭 확장  │
│  ┌─ 보안 상세 (접이식) ──────────────────────────┐   │
│  │ 시간 | 유형 | severity | 상세               │   │
│  └───────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  Filters: [검색...] [시작일] ~ [종료일] [탭별 추가]   │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐│
│  │ 시간   │에이전트│ 명령      │ 상태  │시간│토큰   ││
│  │ 03/01  │Agent A│ 분석 수행  │ 완료  │2.1s│1,234 ││
│  │ 03/01  │Agent B│ 보고서 작성│ 진행중│ -  │ -    ││
│  │ ...    │ ...   │ ...       │ ...   │... │ ...  ││
│  └─────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│  1,234건          [이전] 1 / 62 [다음]              │
└─────────────────────────────────────────────────────┘
```

### QA 탭 확장 상태 (상세 패널)
```
│  │ 시간  │ 명령       │ 검수 점수 │ 판정 │ 재작업│
│  │ 03/01 │ 분석 수행   │ ████ 85% │ PASS │  0   │
│  ├───────┴────────────┴─────────┴──────┴──────┤
│  │ ▼ 상세 패널 (접이식)                          │
│  │ [규칙별 결과] [루브릭] [환각 보고서] [기존 점수] │
│  │                                              │
│  │ 완전성:                                       │
│  │  [critical] [PASS] 필수 항목 포함              │
│  │  [minor]    [WARN] 추가 근거 부족              │
│  │ 정확성:                                       │
│  │  [major]    [PASS] 수치 검증 완료              │
│  │                                              │
│  │ 피드백: "전반적으로 양호하나..."                 │
│  └──────────────────────────────────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ "통신로그"    [WS ●] │
├─────────────────────┤
│ [활동][통신][QA][도구]│
├─────────────────────┤
│ [보안 알림 배너]      │
├─────────────────────┤
│ [검색...][날짜][날짜] │
├─────────────────────┤
│ (테이블 가로 스크롤)   │
│ 시간│에이전트│명령│상태│
│ ... │ ...   │...│... │
├─────────────────────┤
│ 1,234건  [이전][다음] │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **탭 4개의 정보 과밀**: 활동/통신/QA/도구 탭 간 전환 시 필터 상태(검색어, 날짜)가 초기화됨
2. **QA 상세 패널 복잡도**: 규칙별 결과 + 루브릭 + 환각 보고서 + 기존 점수의 4개 서브탭이 작은 영역에 들어가 있어 가독성 부족
3. **모바일 테이블 가독성**: 6열 테이블이 375px에서 가로 스크롤 필수이나, 스크롤 가능 여부가 시각적으로 드러나지 않음
4. **WS 상태 표시기**: 연결 상태 아이콘만 있고, 마지막 수신 시각이나 이벤트 카운터가 없음
5. **보안 알림 배너**: QA 탭에서만 보이지만, 보안 이벤트는 모든 탭에서 인지할 필요가 있음
6. **날짜 필터 UX**: 브라우저 기본 date input이 작고, 모바일에서 조작이 불편
7. **페이지네이션 정보 부족**: "1/62"만 표시되고, 총 건수가 하단에만 표시되어 위에서 확인 불가
8. **환각 보고서 밀도**: claims 목록이 많으면 세로 공간을 과도하게 차지
9. **도구 탭 입력 요약**: input 필드가 truncate되어 어떤 입력인지 파악이 어려움
10. **탭별 뱃지 없음**: 각 탭에 미확인 건수나 실패 건수 뱃지가 없어 어느 탭을 봐야 하는지 알기 어려움

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2(디자인 AI)가 결정** — 특정 테마 강제 없음
- 실시간 데이터 모니터링 느낌: 연결 상태가 눈에 잘 띄어야 함
- 상태 뱃지 색상 구분 유지: 완료(초록), 진행중(파란), 실패(빨강), 경고(노란)
- 테이블 행 밀도를 적절히 유지 — 너무 넓지도, 너무 좁지도 않게

### 4.2 레이아웃 개선
- **탭 전환 시 공통 필터 유지**: 검색어와 날짜 범위는 탭 전환 시에도 유지 (현재 초기화됨)
- **QA 상세 패널 개선**: 서브탭 영역 크기 확대, 스크롤 가능한 고정 높이 패널
- **보안 알림 위치 변경**: 탭 위로 이동하여 모든 탭에서 보이게
- **탭 뱃지 추가**: 각 탭에 최근 이벤트 수 또는 상태 요약 뱃지

### 4.3 인터랙션 개선
- 테이블 행 클릭 시 상세 사이드 패널 (QA 탭은 이미 구현)
- 실시간 이벤트 발생 시 최상단 행 하이라이트 애니메이션
- 모바일에서 테이블 → 카드 뷰 전환 옵션
- 검색 결과 하이라이트

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | ActivityLogPage | 전체 레이아웃, 필터 공유 로직 개선 | pages/activity-log.tsx |
| 2 | Tabs (활동/통신/QA/도구) | 탭 뱃지 추가 (미확인/실패 건수) | @corthex/ui (공용) |
| 3 | SecurityAlertBanner | 보안 알림 배너 + 접이식 상세 테이블 | pages/activity-log.tsx (인라인) |
| 4 | FilterBar | 검색 + 날짜 + 탭별 추가 필터 (도구명, 판정) | pages/activity-log.tsx (인라인) |
| 5 | AgentsTable | 에이전트 활동 테이블 (시간/에이전트/명령/상태/소요시간/토큰) | pages/activity-log.tsx (인라인) |
| 6 | DelegationsTable | 위임 통신 테이블 (시간/발신→수신/명령요약/비용/토큰) | pages/activity-log.tsx (인라인) |
| 7 | QualityTable | QA 검수 테이블 + 확장 상세 패널 | pages/activity-log.tsx (인라인) |
| 8 | QualityDetailPanel | QA 상세: 규칙별/루브릭/환각/기존점수 서브탭 | pages/activity-log.tsx (인라인) |
| 9 | ToolsTable | 도구 호출 테이블 (시간/도구명/에이전트/소요시간/상태/입력) | pages/activity-log.tsx (인라인) |
| 10 | Pagination | 이전/다음 + 현재 페이지 / 총 페이지 + 총 건수 | pages/activity-log.tsx (인라인) |
| 11 | WsStatusIndicator | WebSocket 연결 상태 표시 | components/ws-status-indicator.tsx |
| 12 | StatusBadge | 상태 뱃지 (완료/실패/진행중 등) | pages/activity-log.tsx (인라인) |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| tab | useSearchParams → ?tab= | 현재 활성 탭 (agents/delegations/quality/tools) |
| agentsData | useQuery(['activity-agents']) → GET /workspace/activity/agents | 에이전트 활동 목록 |
| delegationsData | useQuery(['activity-delegations']) → GET /workspace/activity/delegations | 위임 통신 목록 |
| qualityData | useQuery(['activity-quality']) → GET /workspace/activity/quality | QA 검수 목록 |
| toolsData | useQuery(['activity-tools']) → GET /workspace/activity/tools | 도구 호출 목록 |
| securityAlerts | useQuery(['security-alerts']) → GET /workspace/activity/security-alerts | 보안 알림 목록 |
| page | useState<number> | 현재 페이지 번호 |
| searchInput | useState<string> + 300ms debounce | 검색어 |
| startDate/endDate | useState<string> | 날짜 범위 필터 |
| toolNameFilter | useState<string> | 도구명 필터 (도구 탭) |
| conclusionFilter | useState<string> | 판정 필터 (QA 탭: pass/fail) |
| expandedQaId | useState<string \| null> | QA 확장 상세 행 ID |
| wsStatus | useActivityWs(tab) | WebSocket 실시간 갱신 |

**API 엔드포인트 (변경 없음):**
- `GET /api/workspace/activity/agents?page=&limit=&search=&startDate=&endDate=`
  - 응답: `{ data: { items: AgentActivity[], page, limit, total } }`
- `GET /api/workspace/activity/delegations?page=&limit=&search=&startDate=&endDate=`
  - 응답: `{ data: { items: Delegation[], page, limit, total } }`
- `GET /api/workspace/activity/quality?page=&limit=&search=&startDate=&endDate=&conclusion=`
  - 응답: `{ data: { items: QualityReview[], page, limit, total } }`
- `GET /api/workspace/activity/tools?page=&limit=&search=&startDate=&endDate=&toolName=`
  - 응답: `{ data: { items: ToolInvocation[], page, limit, total } }`
- `GET /api/workspace/activity/security-alerts?page=&limit=&startDate=&endDate=`
  - 응답: `{ data: { items: SecurityAlert[], page, limit, total, count24h } }`
- WebSocket 채널: `activity-log`, `delegation`, `tool`, `command`

**주요 타입 구조:**
```ts
// AgentActivity
{ id, agentId, agentName, type, action, detail, phase, metadata, createdAt }

// Delegation
{ id, commandId, agentId, agentName, parentTaskId, type, input, output, status, durationMs, metadata, createdAt }

// QualityReview
{ id, commandId, taskId, reviewerAgentId, reviewerAgentName, conclusion, scores: MergedScores, feedback, attemptNumber, commandText, createdAt }

// MergedScores (QA 상세)
{ conclusionQuality, evidenceSources, riskAssessment, formatCompliance, logicalCoherence, ruleResults[], inspectionConclusion, inspectionScore, inspectionMaxScore, rubricScores[], hallucinationReport }

// ToolInvocation
{ id, agentId, agentName, toolName, input, output, status, durationMs, createdAt }
```

---

## 7. 색상/톤 앤 매너

| 용도 | 색상 | Tailwind |
|------|------|---------|
| 완료/성공 상태 | 에메랄드 | bg-emerald-100 text-emerald-700 |
| 실패/오류 상태 | 레드 | bg-red-100 text-red-700 |
| 진행중 상태 | 블루 | bg-blue-100 text-blue-700 |
| 경고 상태 | 앰버 | bg-amber-100 text-amber-700 |
| PASS 뱃지 | 에메랄드 | bg-emerald-100 text-emerald-700 |
| FAIL 뱃지 | 레드 | bg-red-100 text-red-700 |
| 테이블 행 호버 | 연한 그레이 | hover:bg-zinc-50 dark:hover:bg-zinc-800/50 |
| 테이블 보더 | 그레이 | border-zinc-100 dark:border-zinc-800 |
| 보안 알림 배경 | 레드 투명 | bg-red-50 dark:bg-red-900/20 |
| WS 연결 (연결됨) | 에메랄드 점 | bg-emerald-500 |
| WS 연결 (끊김) | 레드 점 | bg-red-500 |
| QA 점수 80%+ | 에메랄드 바 | bg-emerald-500 |
| QA 점수 60~79% | 앰버 바 | bg-amber-500 |
| QA 점수 ~59% | 레드 바 | bg-red-500 |
| severity critical | 레드 칩 | bg-red-100 text-red-700 |
| severity major | 앰버 칩 | bg-amber-100 text-amber-700 |
| severity minor | 그레이 칩 | bg-zinc-100 text-zinc-600 |
| 상세 패널 배경 | 연한 그레이 | bg-zinc-50 dark:bg-zinc-800/40 |
| 서브탭 활성 | 블루 | border-blue-500 text-blue-600 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 풀 너비 테이블, 넓은 패딩(px-6), 모든 열 표시 |
| **768px~1439px** (Tablet) | 풀 너비 테이블, 패딩 축소(px-4~6), 일부 열 width 축소 |
| **~375px** (Mobile) | 테이블 가로 스크롤 (min-w-[640px]), 최소 패딩(px-4), 필터 flex-wrap |

**모바일 특별 처리:**
- 테이블: overflow-x-auto로 가로 스크롤, 좌측에 시간 열 고정 고려
- 필터 영역: flex-wrap으로 검색/날짜가 여러 줄로 배치
- QA 상세 패널: 서브탭 버튼 크기 확대 (터치 대응)
- 페이지네이션: 이전/다음 버튼 터치 영역 확보
- 보안 알림 상세: 테이블 대신 카드 형태로 변환 고려
- 환각 보고서: claims 목록 기본 3개만 표시

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 10번(통신로그) 항목에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 에이전트 활동 기록 (활동 탭)
- [x] 내부 위임 기록: 발신→수신, 메시지, 비용, 토큰 (통신 탭)
- [x] 품질 검수 결과 (QA 탭)
- [x] 도구 호출 기록 (도구 탭)
- [x] 실시간 WebSocket 갱신
- [x] 검색 (에이전트/명령 텍스트)
- [x] 날짜 범위 필터
- [x] 페이지네이션 (20건 단위)
- [x] 상태 뱃지 (완료/실패/진행중)
- [x] QA 상세 확장 (규칙별 결과, 루브릭, 환각 보고서)
- [x] 보안 알림 (입력 차단, 인젝션 시도)

**UI 변경 시 절대 건드리면 안 되는 것:**
- `useActivityWs(tab)` 훅의 WebSocket 구독/갱신 로직
- 각 탭의 API 호출 로직 (queryKey, queryFn, enabled 조건)
- `buildParams()` 쿼리 파라미터 구성 로직
- `STATUS_BADGE` / `SCORE_LABELS` / `SEVERITY_STYLES` 상수
- `formatTime()` / `formatDuration()` / `formatTokens()` 헬퍼
- `scorePercent()` / `scoreColor()` / `scoreTextColor()` 점수 계산 함수
- QualityDetailPanel 내부의 서브탭 데이터 바인딩
- HallucinationPanel의 claims 검증 로직
- useSearchParams로 탭 상태를 URL에 저장하는 로직

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. Think of it like Slack or Linear, but instead of messaging coworkers, you're giving tasks to AI employees and watching them collaborate to deliver results.

This page: A real-time activity log that monitors all AI agent operations across the organization. It shows four categories of events in a tabbed interface, with live WebSocket updates, search, date filtering, and pagination.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Page header — title (e.g., "Activity Log" or "Communications Log"), with a WebSocket connection status indicator (green dot = connected, red dot = disconnected) on the right.
2. Tab bar — four tabs: "Activity" (agent actions), "Communications" (delegation messages between agents), "QA" (quality review results), "Tools" (tool invocations). Active tab is visually distinct.
3. Security alert banner — conditionally shown when there are recent security events (blocked inputs, injection attempts). Red-toned banner with event count, clickable to expand a detail table showing: time, type, severity badge, and details. Collapsible.
4. Filter bar — below tabs: a search input, two date inputs (start ~ end), and tab-specific filters (tool name filter for Tools tab, pass/fail dropdown for QA tab).
5. Data table — the main content area. Each tab shows a different table:
   a. Activity tab: columns = Time, Agent name, Action/command, Status badge (done/working/failed), Duration, Token count.
   b. Communications tab: columns = Time, Sender → Receiver (agent names), Message summary, Cost ($), Token count.
   c. QA tab: columns = Time, Command text, Inspection score (progress bar with percentage), Verdict (PASS/FAIL badge), Rework count. Rows are clickable to expand a detail panel.
   d. Tools tab: columns = Time, Tool name (monospace), Agent name, Duration, Status badge, Input summary.
6. QA detail panel (expanded view) — when a QA row is clicked, it expands below the row showing sub-tabs: "Rule Results" (categorized rules with severity/result badges), "Rubric" (scored criteria with weights), "Hallucination Report" (verified/unverified claims with confidence), "Legacy Scores" (5 quality dimensions scored 1-5). Include a feedback text section.
7. Pagination bar — bottom: total count on the left, Previous/Next buttons with page indicator (e.g., "3 / 62") on the right.
8. Loading state — skeleton table rows while data loads.
9. Empty state — friendly message when no records match the current filters.

Design tone — YOU DECIDE:
- This is a monitoring/observability page — think of it like a simplified Datadog or Grafana logs view.
- Tables should be compact but readable. Status badges should pop with color.
- The QA detail panel should feel organized despite containing complex nested data.
- Real-time feel — the WebSocket indicator should convey "this is live data."
- Light theme, dark theme, or mixed — your choice.
- Clean, dense, professional. Operators will use this for debugging and oversight.

Design priorities (in order):
1. Scannability — operators should quickly find relevant events in the table.
2. Status visibility — badges (pass/fail/working/error) must be instantly distinguishable.
3. QA detail readability — the expanded panel must present complex quality data clearly.
4. Real-time awareness — the user should feel that data is live, not static.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 버전
```
Mobile version (375x812) of the same page described above.

Same product context: a platform where users manage AI agents. This page is a real-time activity log with four tabs (Activity, Communications, QA, Tools), search, date filters, data tables, and pagination.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation (switching between pages). DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile):
1. Page header with WebSocket status indicator
2. Tab bar (4 tabs — horizontally scrollable if needed)
3. Security alert banner (full width, collapsible)
4. Filter bar (search + dates wrapping to multiple lines)
5. Data table (horizontally scrollable, with min-width to maintain readability)
6. QA detail panel (expanded below row, sub-tabs with adequate touch targets)
7. Pagination (Previous/Next with page info)
8. Loading skeleton and empty state

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. Tab switching must be easy with touch.
2. Table must be horizontally scrollable with visual indication of scroll availability.
3. Filters should be accessible without taking too much vertical space.
4. QA detail panel sub-tabs need adequate touch targets.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `activity-log-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `activity-log-title` | 페이지 제목 ("통신로그") | 제목 표시 확인 |
| `activity-ws-status` | WebSocket 상태 표시기 | 연결 상태 확인 |
| `activity-tab-agents` | "활동" 탭 | 탭 전환 |
| `activity-tab-delegations` | "통신" 탭 | 탭 전환 |
| `activity-tab-quality` | "QA" 탭 | 탭 전환 |
| `activity-tab-tools` | "도구" 탭 | 탭 전환 |
| `activity-security-banner` | 보안 알림 배너 | 알림 표시 확인 |
| `activity-security-detail` | 보안 알림 상세 테이블 | 확장 상세 |
| `activity-search-input` | 검색 input | 검색어 입력 |
| `activity-date-start` | 시작일 input | 날짜 필터 시작 |
| `activity-date-end` | 종료일 input | 날짜 필터 종료 |
| `activity-filter-toolname` | 도구명 필터 input | 도구 탭 필터 |
| `activity-filter-conclusion` | 판정 필터 select | QA 탭 필터 |
| `activity-table` | 데이터 테이블 | 테이블 영역 |
| `activity-table-row` | 테이블 행 | 개별 행 확인 |
| `activity-status-badge` | 상태 뱃지 | 상태 표시 확인 |
| `activity-agent-name` | 에이전트 이름 셀 | 에이전트 표시 |
| `activity-delegation-arrow` | 발신→수신 표시 | 위임 방향 표시 |
| `activity-qa-score-bar` | QA 점수 프로그레스 바 | 점수 시각화 |
| `activity-qa-verdict` | QA 판정 뱃지 (PASS/FAIL) | 판정 확인 |
| `activity-qa-expand` | QA 행 클릭 확장 영역 | 상세 패널 토글 |
| `activity-qa-detail-panel` | QA 상세 패널 | 확장된 상세 영역 |
| `activity-qa-subtab-rules` | 규칙별 결과 서브탭 | 서브탭 전환 |
| `activity-qa-subtab-rubric` | 루브릭 서브탭 | 서브탭 전환 |
| `activity-qa-subtab-hallucination` | 환각 보고서 서브탭 | 서브탭 전환 |
| `activity-qa-subtab-legacy` | 기존 점수 서브탭 | 서브탭 전환 |
| `activity-qa-rule-item` | 규칙별 결과 항목 | 개별 규칙 확인 |
| `activity-qa-rubric-item` | 루브릭 항목 | 개별 루브릭 확인 |
| `activity-qa-hallucination-claim` | 환각 주장 항목 | 개별 claim 확인 |
| `activity-tool-name` | 도구명 셀 | 도구 이름 확인 |
| `activity-pagination` | 페이지네이션 컨테이너 | 페이징 영역 |
| `activity-pagination-prev` | 이전 버튼 | 이전 페이지 |
| `activity-pagination-next` | 다음 버튼 | 다음 페이지 |
| `activity-pagination-info` | 페이지 정보 (N / M) | 현재 위치 확인 |
| `activity-total-count` | 총 건수 표시 | 데이터 수 확인 |
| `activity-loading-skeleton` | 로딩 스켈레톤 | 로딩 중 표시 |
| `activity-empty-state` | 빈 상태 | 데이터 없을 때 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /activity-log 접속 | `activity-log-page` 존재, 로그인 안 튕김 |
| 2 | 기본 탭 | 페이지 로드 | "활동" 탭 활성, 활동 테이블 표시 |
| 3 | WS 상태 표시 | 페이지 로드 | `activity-ws-status` 존재 |
| 4 | 탭 전환 — 통신 | "통신" 탭 클릭 | URL에 ?tab=delegations, 통신 테이블 표시 |
| 5 | 탭 전환 — QA | "QA" 탭 클릭 | URL에 ?tab=quality, QA 테이블 표시 |
| 6 | 탭 전환 — 도구 | "도구" 탭 클릭 | URL에 ?tab=tools, 도구 테이블 표시 |
| 7 | 검색 동작 | 검색 input에 텍스트 입력 | 테이블 필터링, debounce 300ms |
| 8 | 날짜 필터 | 시작일/종료일 설정 | 해당 기간 데이터만 표시 |
| 9 | 테이블 행 표시 | 데이터 있을 때 | `activity-table-row` 1개 이상 존재 |
| 10 | 상태 뱃지 | 테이블 행 확인 | `activity-status-badge` 존재, 색상 구분 |
| 11 | 페이지네이션 — 다음 | "다음" 클릭 | 페이지 2로 이동, 데이터 갱신 |
| 12 | 페이지네이션 — 이전 | "이전" 클릭 | 이전 페이지로 이동 |
| 13 | 페이지네이션 — 비활성 | 첫 페이지에서 | "이전" 버튼 disabled |
| 14 | 총 건수 표시 | 데이터 있을 때 | `activity-total-count`에 숫자 표시 |
| 15 | QA 행 확장 | QA 테이블 행 클릭 | `activity-qa-detail-panel` 표시 |
| 16 | QA 상세 서브탭 전환 | 규칙별→루브릭 클릭 | 루브릭 내용 표시 |
| 17 | QA 행 접기 | 확장된 행 재클릭 | 상세 패널 숨김 |
| 18 | QA 판정 필터 | "PASS" 선택 | PASS 판정만 표시 |
| 19 | 도구 탭 필터 | 도구명 입력 | 해당 도구만 표시 |
| 20 | 보안 알림 배너 | 보안 이벤트 있을 때 | `activity-security-banner` 표시 |
| 21 | 보안 상세 토글 | 배너 클릭 | `activity-security-detail` 표시/숨김 |
| 22 | 로딩 스켈레톤 | 데이터 로딩 중 | `activity-loading-skeleton` 표시 |
| 23 | 빈 상태 | 필터 결과 없을 때 | `activity-empty-state` 표시 |
| 24 | 반응형 확인 | 375px 뷰포트 | 테이블 가로 스크롤 가능, 필터 줄바꿈 |
| 25 | 위임 방향 표시 | 통신 탭 행 확인 | "발신 → 수신" 형식 표시 |
| 26 | QA 점수 바 | QA 탭 행 확인 | 프로그레스 바 + 퍼센트 표시 |
| 27 | 탭 전환 시 필터 유지 | 활동 탭에서 검색어 입력 후 통신 탭 전환 | 검색어 유지, 날짜 필터 유지 |
