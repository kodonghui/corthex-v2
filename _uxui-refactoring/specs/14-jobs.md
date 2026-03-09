# Jobs (자동화/예약 작업) UX/UI 설명서

> 페이지: #14 jobs
> 패키지: app
> 경로: /jobs
> 작성일: 2026-03-09

---

## 1. 페이지 목적

AI 에이전트에게 자동화 작업을 등록하고 실시간으로 진행 상태를 추적하는 페이지. "시켜놓고 퇴근" 컨셉으로, 일회성 작업 / 반복 스케줄 / 이벤트 트리거 3가지 유형을 관리.

**핵심 사용자 시나리오:**
- 사용자가 에이전트를 지정하고 작업 지시를 등록 (일회성 / 예약)
- 반복 스케줄 설정 (매일/평일/특정 요일 + 시간)
- 이벤트 트리거 설정 (가격 상회/하회, 장 시작/마감)
- 체인 작업 등록 (A 에이전트 완료 후 B 에이전트 실행)
- WebSocket으로 작업 진행률 실시간 모니터링
- 완료/실패 결과 확인 및 관련 보고서/세션 연결

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────┐
│  Header: "야간 작업"                                 │
│  "시켜놓고 퇴근 — AI가 밤새 처리합니다"  [+ 작업 등록] │
├─────────────────────────────────────────────────────┤
│  Tabs: [일회성 (N)] [반복 스케줄 (N)] [트리거 (N)]    │
├─────────────────────────────────────────────────────┤
│  max-w-2xl                                          │
│                                                     │
│  ┌── 체인 그룹 (인디고 보더) ──────────────────┐     │
│  │ 체인 (2/3 완료)               [체인 취소]   │     │
│  │ ┌─ JobCard ─────────────────────────────┐  │     │
│  │ │ [Badge: 완료] 에이전트명  ●(미읽음)     │  │     │
│  │ │ 작업 지시 내용 (truncate)              │  │     │
│  │ │ 날짜 → 완료시간                       │  │     │
│  │ │ [ProgressBar] (처리중일 때)            │  │     │
│  │ └───────────────────────────────────────┘  │     │
│  │   │ (들여쓰기 + 좌측 보더)                  │     │
│  │   ┌─ JobCard (후속) ─────────────────────┐ │     │
│  │   │ [Badge: 대기(체인)]                   │ │     │
│  │   └──────────────────────────────────────┘ │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
│  ┌─ JobCard (단독) ────────────────────────────┐    │
│  │ [Badge: 대기] 에이전트명     [취소] [▼]      │    │
│  │ 작업 지시 내용                               │    │
│  │ 날짜                                        │    │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  (확장 시)                                          │
│  ┌── 결과 영역 ─────────────────────────────────┐   │
│  │ [결과] 텍스트 (max-h-60 스크롤)               │   │
│  │ [결과 보기] [보고서 보기]  ← 링크              │   │
│  │ [오류] 에러 메시지 (빨간 배경)                 │   │
│  │ 재시도: 1/3                                  │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 스케줄 탭
```
┌─────────────────────────────────────────────────────┐
│  ┌── ScheduleCard ──────────────────────────────┐   │
│  │ ● 매일 22:00  에이전트명                      │   │
│  │ 작업 지시 내용                                │   │
│  │ 마지막: 3/9 22:00 → 다음: 3/10 22:00 [편집][중지][삭제]│   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 트리거 탭
```
┌─────────────────────────────────────────────────────┐
│  ┌── TriggerCard ───────────────────────────────┐   │
│  │ ● 가격 상회 · 005930 ≥ 72,000원  에이전트명   │   │
│  │ 작업 지시 내용                                │   │
│  │ ● 감시 중              [편집][중지][삭제]      │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 등록 모달
```
┌─────────────────────────────────┐
│  작업 등록                       │
│                                 │
│  유형: ◉ 일회성 ○ 반복 ○ 트리거  │
│  담당 에이전트: [Select]         │
│  작업 지시: [Textarea]           │
│  실행 시간: [datetime-local]     │
│  + 체인 단계 추가 (순차 실행)     │
│                                 │
│  [취소]          [등록]          │
└─────────────────────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ "야간 작업" [+ 등록] │
├─────────────────────┤
│ [일회성][스케줄][트리거]│
├─────────────────────┤
│ JobCard (풀폭)       │
│ JobCard              │
│ ...                  │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **목록 폭 제한**: `max-w-2xl`로 넓은 화면에서 공간 낭비
2. **모달 복잡도**: 등록 모달이 3가지 유형(일회성/스케줄/트리거) + 체인을 한 모달에서 처리해 복잡함
3. **진행률 표시**: WebSocket 진행률 바가 있으나 처리 중이 아닐 때는 단순 pulse 애니메이션만 표시
4. **미읽음 표시**: 완료/실패 작업의 미읽음 표시가 작은 점(2px)이라 눈에 띄지 않음
5. **결과 영역**: 확장 시 결과 텍스트가 max-h-60으로 잘려 긴 결과 확인이 불편
6. **체인 시각화**: 들여쓰기 + 좌측 보더로만 표현되어 체인 관계 파악이 어려움
7. **빈 상태**: 이모지(🌙) + 텍스트만 있어 시각적 임팩트 부족
8. **삭제/취소 혼재**: 작업 취소, 스케줄 삭제, 트리거 삭제, 체인 취소가 같은 패턴이지만 용어가 다름
9. **스케줄 cron 표현**: 사용자에게 보여주는 설명이 `description` 필드 의존이라 일관성 부족
10. **트리거 조건 표시**: 가격 조건만 지원하는 UI인데 향후 확장 시 구조 변경 필요

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2(디자인 AI)가 결정**
- 상태별 색상 구분 강화 (대기=파랑, 처리중=앰버+애니메이션, 완료=그린, 실패=레드, 대기(체인)=그레이)
- 실시간 진행률 UI를 더 눈에 띄게 개선
- 체인 작업은 타임라인/파이프라인 시각화 강화

### 4.2 레이아웃 개선
- **목록 폭 확장**: 넓은 화면에서 더 많은 정보 표시
- **체인 시각화 강화**: 스텝 넘버링 + 화살표 연결선으로 순서 명확화
- **모달 단계 분리**: 유형 선택 → 상세 설정 스텝 분리 고려
- **결과 영역 확대**: 확장 시 넉넉한 높이, 또는 모달로 전체 보기

### 4.3 인터랙션 개선
- 진행 중인 작업을 상단에 고정 (pin to top)
- 미읽음 작업 카운트 뱃지
- 작업 재실행(retry) 버튼 추가
- 스케줄 다음 실행까지 남은 시간 카운트다운

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | JobsPage | 레이아웃 확장, 진행 중 작업 상단 고정 | pages/jobs.tsx |
| 2 | JobCard | 카드 디자인 강화, 미읽음 표시 개선 | pages/jobs.tsx (인라인) |
| 3 | ChainGroup | 체인 시각화 강화 (넘버링, 연결선) | pages/jobs.tsx (인라인) |
| 4 | ScheduleCard | 다음 실행 카운트다운, 활성 상태 개선 | pages/jobs.tsx (인라인) |
| 5 | TriggerCard | 조건 표시 개선, 감시 상태 시각화 | pages/jobs.tsx (인라인) |
| 6 | JobCreateModal | 3유형 등록 모달 정리, 체인 UI 개선 | pages/jobs.tsx (인라인) |
| 7 | EmptyState | 빈 상태 비주얼 강화 | pages/jobs.tsx (인라인) |
| 8 | ProgressBar | 기존 UI 컴포넌트 유지 | @corthex/ui |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| jobs | useQuery ['night-jobs'] (10초 폴링) | 일회성 작업 목록 |
| schedules | useQuery ['night-schedules'] | 반복 스케줄 목록 |
| triggers | useQuery ['night-triggers'] | 이벤트 트리거 목록 |
| agents | useQuery ['agents'] | 에이전트 선택 드롭다운 |
| jobProgress | WebSocket → useState | 실시간 진행률 (jobId별) |
| user | useAuthStore | 현재 사용자 (WebSocket 구독용) |

**API 엔드포인트 (변경 없음):**
- `GET /api/workspace/jobs` -- 작업 목록
- `POST /api/workspace/jobs` -- 일회성 작업 등록
- `DELETE /api/workspace/jobs/:id` -- 작업 취소
- `PUT /api/workspace/jobs/:id/read` -- 읽음 표시
- `POST /api/workspace/jobs/chain` -- 체인 작업 등록
- `DELETE /api/workspace/jobs/chain/:chainId` -- 체인 취소
- `GET /api/workspace/jobs/schedules` -- 스케줄 목록
- `POST /api/workspace/jobs/schedules` -- 스케줄 생성
- `PATCH /api/workspace/jobs/schedules/:id` -- 스케줄 수정
- `PATCH /api/workspace/jobs/schedules/:id/toggle` -- 스케줄 활성/비활성
- `DELETE /api/workspace/jobs/schedules/:id` -- 스케줄 삭제
- `GET /api/workspace/jobs/triggers` -- 트리거 목록
- `POST /api/workspace/jobs/triggers` -- 트리거 생성
- `PATCH /api/workspace/jobs/triggers/:id` -- 트리거 수정
- `PATCH /api/workspace/jobs/triggers/:id/toggle` -- 트리거 활성/비활성
- `DELETE /api/workspace/jobs/triggers/:id` -- 트리거 삭제

**WebSocket 채널:**
- `night-job` -- 작업 진행/완료/실패 이벤트
- 이벤트: `job-progress`, `job-completed`, `job-failed`, `job-retrying`, `job-queued`, `chain-failed`

---

## 7. 색상/톤 앤 매너

| 용도 | 색상 | Tailwind |
|------|------|---------|
| 대기(queued) 뱃지 | 파랑 | bg-blue-100 text-blue-700 |
| 처리중(processing) 뱃지 | 앰버 | bg-amber-100 text-amber-700 |
| 완료(completed) 뱃지 | 그린 | bg-emerald-100 text-emerald-700 |
| 실패(failed) 뱃지 | 레드 | bg-red-100 text-red-700 |
| 대기(체인)(blocked) 뱃지 | 그레이 | bg-zinc-100 text-zinc-600 |
| 취소됨(cancelled) 뱃지 | 그레이 스트라이크 | bg-zinc-100 text-zinc-400 line-through |
| 처리중 카드 보더 | 인디고 | border-indigo-500 border-l-4 |
| 미읽음 표시 | 인디고 점 | bg-indigo-500 (w-2 h-2) |
| 체인 그룹 보더 | 인디고 톤 | border-indigo-200 dark:border-indigo-800 |
| CTA 버튼 | 인디고 | bg-indigo-600 text-white |
| 취소/삭제 텍스트 | 레드 | text-red-500 |
| 스케줄 활성 표시 | 그린 StatusDot | online |
| 스케줄 비활성 표시 | 그레이 StatusDot | offline |
| 트리거 감시 중 | 그린 텍스트 | text-green-500 |
| 진행률 바 | 인디고 | bg-indigo-500 |
| 오류 메시지 배경 | 레드 톤 | bg-red-50 dark:bg-red-950 |
| 결과 텍스트 배경 | 화이트 | bg-white dark:bg-zinc-800 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 넓은 1컬럼, 카드 여유 패딩, 모달 max-w-lg 중앙 |
| **768px~1439px** (Tablet) | 1컬럼, 동일 구조 |
| **~375px** (Mobile) | 카드 풀폭, 패딩 축소, 모달 거의 풀스크린 |

**모바일 특별 처리:**
- 등록 모달: 풀스크린에 가까운 크기
- 탭: 가로 스크롤 가능 (3개 탭이 좁은 화면에서도 표시)
- JobCard: 터치 영역 확보 (min-height 48px)
- 체인 그룹: 들여쓰기 축소
- 요일 선택 버튼: 원형 버튼 크기 유지 (w-9 h-9)

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 14번(자동화/Workflow) + 15번(크론기지/Schedule) 항목에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 일회성 작업 등록 (에이전트 지정 + 지시 + 예약 시간)
- [x] 반복 스케줄 CRUD (매일/평일/특정요일 + 시간)
- [x] 이벤트 트리거 CRUD (가격 상회/하회, 장 시작/마감)
- [x] 체인 작업 (순차 실행, 최대 5단계)
- [x] WebSocket 실시간 진행률 (job-progress 이벤트)
- [x] 작업 상태 관리 (queued → processing → completed/failed)
- [x] blocked 상태 (체인 대기)
- [x] 작업 취소 / 체인 취소
- [x] 스케줄 활성/비활성 토글
- [x] 트리거 활성/비활성 토글
- [x] 결과 확인 (텍스트 + 세션/보고서 링크)
- [x] 미읽음 표시 + 읽음 처리
- [x] 재시도 카운트 표시 (retryCount/maxRetries)
- [x] 체인 실패 시 후속 작업: blocked → cancelled로 전환, "체인 실패" 뱃지 표시
- [x] 스케줄 수정 (지시, 시간, 주기)
- [x] 트리거 수정 (지시, 유형, 조건)
- [x] 10초 간격 폴링 (목록 자동 새로고침)

**UI 변경 시 절대 건드리면 안 되는 것:**
- NightJob/Schedule/Trigger 타입 정의
- WebSocket 이벤트 핸들링 (wsHandler 콜백)
- useWsStore, useAuthStore 연동
- 모든 mutation (queueJob, createSchedule, createTrigger, createChain 등)
- cron 표현식 파싱/생성 로직

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. Think of it like Slack or Linear, but instead of messaging coworkers, you're giving tasks to AI employees and watching them collaborate to deliver results.

This page: A job automation dashboard where users schedule tasks for AI agents to execute. The concept is "assign and go home — AI works overnight." It manages three types of jobs: one-time tasks, recurring schedules, and event-triggered actions.

User workflow:
1. User registers a job by selecting an AI agent, writing an instruction, and optionally setting a scheduled time.
2. For recurring work, user creates a schedule (daily/weekdays/custom days at a specific time).
3. For market-event-driven work, user sets up triggers (e.g., "when stock price goes above X, run this analysis").
4. User can create chain jobs — sequential multi-step pipelines where Agent A's output feeds into Agent B.
5. While jobs run, the user sees real-time progress bars via WebSocket. Completed/failed jobs show results with links to generated reports or chat sessions.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Tab navigation — three tabs: One-time Jobs (with count), Recurring Schedules (with count), Event Triggers (with count).
2. Job cards — expandable cards showing: status badge (queued/processing/completed/failed/blocked), agent name, instruction text, timestamps. Processing jobs show a real-time progress bar. Unread completed/failed jobs have a notification dot.
3. Chain groups — visually grouped sequential jobs with step indicators (Step 1 → Step 2 → Step 3). Show completion progress (e.g., "2/3 done").
4. Schedule cards — showing: active/inactive status dot, schedule description (e.g., "Every weekday at 22:00"), agent name, instruction, next run time. Actions: edit, pause/resume, delete.
5. Trigger cards — showing: active/inactive status, trigger type (price above/below, market open/close), condition details, agent name, instruction, last triggered time. Actions: edit, pause/resume, delete.
6. Job creation modal — form with: job type selector (one-time/schedule/trigger), agent dropdown, instruction textarea. For one-time: optional scheduled time + chain step builder. For schedule: time picker + frequency selector (daily/weekdays/custom days). For trigger: type selector + condition fields (stock code, target price).
7. Expanded result area — when a job card is expanded, show: result text (scrollable), error message (red), retry count, links to related report or chat session.
8. Empty states — per tab, showing appropriate message when no jobs/schedules/triggers exist.
9. Delete/cancel confirmation dialog.
10. Register button — prominent "+" button in the header area.

Design tone — YOU DECIDE:
- This is an automation/ops dashboard. Users check this page at the start of their day to see what their AI team accomplished overnight.
- Real-time status is critical — processing jobs need visual urgency (animation, highlight).
- Completed jobs need a "satisfying done" feel. Failed jobs need clear error visibility.
- Clean and functional. Not too dense — each job card should breathe.
- Light theme, dark theme, or mixed — your choice.

Design priorities (in order):
1. Job status must be instantly scannable — the user should know the state of all jobs at a glance.
2. Processing jobs with real-time progress need the most visual attention.
3. The creation modal must be intuitive despite supporting 3 different job types.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 버전
```
Mobile version (375x812) of the same page described above.

Same product context: a platform where users manage AI agents. This page is a job automation dashboard — users schedule one-time tasks, recurring schedules, and event triggers for AI agents, then monitor real-time progress.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation (switching between pages). DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile touch):
1. Tab navigation (One-time / Schedules / Triggers) — scrollable if needed
2. Job cards with status badges, progress bars, expand/collapse
3. Chain groups with sequential step indicators
4. Schedule and trigger cards with action buttons
5. Job creation — full-screen modal-style form
6. Real-time progress visualization
7. Expanded result view
8. Empty / loading states

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. Job status must be scannable with quick vertical scroll.
2. The "+" register button must be easily reachable (FAB or top-right).
3. Creation form must be comfortable to fill with mobile keyboard.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `jobs-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `jobs-tab-onetime` | 일회성 탭 | 탭 전환 |
| `jobs-tab-schedule` | 반복 스케줄 탭 | 탭 전환 |
| `jobs-tab-trigger` | 트리거 탭 | 탭 전환 |
| `jobs-register-btn` | + 작업 등록 버튼 | 등록 모달 열기 |
| `jobs-list` | 작업 목록 컨테이너 | 일회성 목록 영역 |
| `jobs-card` | 작업 카드 | 개별 작업 항목 |
| `jobs-card-status` | 작업 상태 뱃지 | 상태 확인 |
| `jobs-card-expand` | 카드 확장 영역 | 결과/오류 표시 |
| `jobs-card-cancel-btn` | 작업 취소 버튼 | 대기 작업 취소 |
| `jobs-card-progress` | 진행률 바 | 실시간 진행률 |
| `jobs-card-result` | 결과 텍스트 | 완료 결과 표시 |
| `jobs-card-error` | 오류 메시지 | 실패 원인 표시 |
| `jobs-card-result-link` | 결과 보기 링크 | 세션/보고서 연결 |
| `jobs-card-unread` | 미읽음 표시 | 새 결과 알림 |
| `jobs-chain-group` | 체인 그룹 | 체인 작업 묶음 |
| `jobs-chain-cancel-btn` | 체인 취소 버튼 | 체인 전체 취소 |
| `jobs-schedule-card` | 스케줄 카드 | 반복 스케줄 항목 |
| `jobs-schedule-edit-btn` | 스케줄 편집 버튼 | 수정 모달 |
| `jobs-schedule-toggle-btn` | 스케줄 토글 버튼 | 활성/비활성 |
| `jobs-schedule-delete-btn` | 스케줄 삭제 버튼 | 삭제 |
| `jobs-trigger-card` | 트리거 카드 | 이벤트 트리거 항목 |
| `jobs-trigger-edit-btn` | 트리거 편집 버튼 | 수정 모달 |
| `jobs-trigger-toggle-btn` | 트리거 토글 버튼 | 활성/비활성 |
| `jobs-trigger-delete-btn` | 트리거 삭제 버튼 | 삭제 |
| `jobs-empty-state` | 빈 상태 | 작업 없을 때 |
| `jobs-modal` | 등록/수정 모달 | 모달 표시 확인 |
| `jobs-modal-type-onetime` | 일회성 라디오 | 유형 선택 |
| `jobs-modal-type-schedule` | 반복 스케줄 라디오 | 유형 선택 |
| `jobs-modal-type-trigger` | 트리거 라디오 | 유형 선택 |
| `jobs-modal-agent-select` | 에이전트 드롭다운 | 에이전트 선택 |
| `jobs-modal-instruction` | 작업 지시 입력 | 지시 작성 |
| `jobs-modal-time-input` | 실행 시간 입력 | 시간 설정 |
| `jobs-modal-frequency` | 주기 선택 | 스케줄 주기 |
| `jobs-modal-day-btn` | 요일 선택 버튼 | 특정 요일 선택 |
| `jobs-modal-trigger-type` | 트리거 유형 선택 | 트리거 유형 |
| `jobs-modal-stock-code` | 종목 코드 입력 | 가격 트리거 |
| `jobs-modal-target-price` | 목표가 입력 | 가격 트리거 |
| `jobs-modal-chain-add` | 체인 단계 추가 | 순차 실행 추가 |
| `jobs-modal-submit-btn` | 등록/수정 버튼 | 폼 제출 |
| `jobs-modal-cancel-btn` | 취소 버튼 | 모달 닫기 |
| `jobs-delete-confirm` | 삭제 확인 다이얼로그 | 삭제/취소 확인 |
| `jobs-error-state` | 에러 상태 | API 에러 시 표시 |
| `jobs-loading` | 로딩 스켈레톤 | 데이터 로딩 중 |
| `jobs-schedule-last-run` | 마지막 실행 시간 | 스케줄 last_run 표시 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /jobs 접속 | `jobs-page` 존재, 탭 3개 표시 |
| 2 | 빈 상태 표시 | 작업 없을 때 | `jobs-empty-state` 표시 |
| 3 | 탭 전환 - 스케줄 | 반복 스케줄 탭 클릭 | 스케줄 목록 표시 |
| 4 | 탭 전환 - 트리거 | 트리거 탭 클릭 | 트리거 목록 표시 |
| 5 | 등록 모달 열기 | + 작업 등록 클릭 | `jobs-modal` 표시 |
| 6 | 일회성 작업 등록 | 에이전트 선택 → 지시 입력 → 등록 | 작업 목록에 추가, 모달 닫힘 |
| 7 | 예약 작업 등록 | 실행 시간 설정 → 등록 | 작업 등록 (scheduledFor 포함) |
| 8 | 스케줄 생성 | 유형 '반복' → 시간/주기 설정 → 등록 | 스케줄 탭에 추가 |
| 9 | 트리거 생성 | 유형 '트리거' → 조건 설정 → 등록 | 트리거 탭에 추가 |
| 10 | 체인 작업 등록 | + 체인 단계 추가 → 에이전트/지시 → 등록 | 체인 그룹 표시 |
| 11 | 작업 카드 확장 | 카드 클릭 | 결과/오류 영역 표시 |
| 12 | 작업 취소 | 대기 작업 취소 버튼 클릭 → 확인 | 목록에서 제거 |
| 13 | 스케줄 토글 | 중지 버튼 클릭 | 비활성 상태로 변경 |
| 14 | 스케줄 수정 | 편집 → 시간 변경 → 수정 | 변경 반영 |
| 15 | 스케줄 삭제 | 삭제 → 확인 | 목록에서 제거 |
| 16 | 트리거 토글 | 중지 버튼 클릭 | 비활성 상태로 변경 |
| 17 | 트리거 수정 | 편집 → 조건 변경 → 수정 | 변경 반영 |
| 18 | 트리거 삭제 | 삭제 → 확인 | 목록에서 제거 |
| 19 | 체인 취소 | 체인 취소 → 확인 | 대기 작업 모두 취소 |
| 20 | 미읽음 → 읽음 | 완료 작업 카드 클릭 | 미읽음 표시 제거 |
| 21 | 결과 링크 | 결과 보기 링크 클릭 | /chat?session=:id 이동 |
| 22 | 보고서 링크 | 보고서 보기 링크 클릭 | /reports/:id 이동 |
| 23 | 모달 유형 전환 | 라디오 버튼으로 유형 변경 | 해당 유형 필드 표시 |
| 24 | 요일 선택 | 특정 요일 버튼 선택/해제 | 선택 상태 토글 |
| 25 | 빈 폼 제출 방지 | 에이전트/지시 없이 등록 | 등록 버튼 비활성화 |
| 26 | 반응형 레이아웃 | 375px 뷰포트 | 카드 풀폭, 모달 풀스크린 |
| 27 | 모달 외부 클릭 | 모달 배경 클릭 | 모달 닫힘 |
| 28 | 진행률 바 표시 | 처리중 작업 존재 | `jobs-card-progress` 표시 |
| 29 | 에러 상태 | API 에러 발생 | `jobs-error-state` 에러 메시지 + 재시도 버튼 |
| 30 | 스케줄 last_run | 스케줄 실행 완료 후 | 카드에 "마지막 실행" 시간 표시 |
