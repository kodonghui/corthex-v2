# Story 14.4: 크론기지 UI (Cron Base UI)

Status: done

## Story

As a CEO/관리자,
I want to manage cron schedules through a dedicated "크론기지" screen with schedule list, cron preset/custom editor, active toggle, next_run display, and execution history,
so that I can set up automated recurring commands and monitor their execution without navigating to a separate "야간작업" page.

## Acceptance Criteria

1. **AC1: 크론기지 전용 페이지** -- CEO 앱에 `/cron` 경로로 크론기지 페이지 추가. 사이드바 "운영" 그룹에 `⏰ 크론기지` 메뉴 항목 추가 (기존 `🌙 야간작업`은 유지). 페이지 제목 "크론기지", 부제 "반복 작업을 자동화하는 기지". UX 스펙 Screen #15 준수.

2. **AC2: 스케줄 리스트 뷰** -- 모든 `nightJobSchedules`를 카드 리스트로 표시. 각 카드에:
   - 스케줄 이름 (name 필드)
   - 담당 에이전트명
   - cron 설명 (한국어, describeCronExpression 활용)
   - 다음 실행 시간 (nextRunAt) -- 폴링으로 갱신
   - 활성/비활성 상태 표시 (StatusDot 컴포넌트)
   - 마지막 실행 시간 (lastRunAt)
   - 활성 토글 버튼 (즉시 toggle API 호출)
   - 편집/삭제 버튼

3. **AC3: 스케줄 생성/편집 모달** -- 크론 스케줄 생성 시:
   - 이름 입력 필드 (필수)
   - 에이전트 선택 (Select 컴포넌트, 비서실장 표시)
   - 프리셋 선택: "매일 오전 9시", "매일 오후 6시", "매일 밤 10시", "평일 오전 9시", "매시 정각", "주 1회(월 오전 9시)" -- 선택 시 cronExpression 자동 채움
   - 커스텀 cron 표현식 직접 입력 (고급 모드 토글)
   - 커스텀 입력 시 실시간 한국어 설명 표시 + 유효성 검사
   - 요일 선택 UI (특정 요일 선택 시)
   - 실행 시간(HH:MM) 선택
   - 작업 지시 내용 (Textarea)
   - 편집 시 기존 값 프리필

4. **AC4: 실행 기록 드릴다운** -- 각 스케줄 카드 클릭(또는 "실행 기록" 버튼) 시 해당 스케줄의 `cronRuns` 기록을 표시하는 확장 패널 또는 서브 뷰:
   - 최근 실행 리스트 (최대 20개, 페이지네이션)
   - 각 실행: 상태(성공/실패/실행중), 시작 시간, 소요 시간, 토큰/비용
   - 실패 시 에러 메시지 표시
   - 성공 시 "결과 보기" 링크 (세션/보고서)

5. **AC5: WebSocket 실시간 갱신** -- `night-job` 채널 구독. 스케줄 실행 시작/완료/실패 이벤트 수신 시 해당 스케줄의 lastRunAt, cronRuns 자동 갱신. 실행 중인 스케줄에 진행 표시기(프로그레스 바 또는 스피너).

6. **AC6: 빈 상태(Empty State)** -- 스케줄 0개일 때:
   - 시계 아이콘 + "예약된 작전이 없습니다"
   - "반복 작업을 크론으로 자동화하세요" 설명
   - "크론 추가" 버튼 (클릭 시 생성 모달 열기)

7. **AC7: 반응형** -- 모바일(640px 이하)에서 카드가 풀 너비, 버튼 터치 영역 확보. 모달은 전체 화면 시트로 전환.

8. **AC8: 테넌트 격리** -- 모든 API 호출이 인증된 사용자의 companyId로 필터링 (기존 schedules.ts 라우트 그대로 사용).

## Tasks / Subtasks

- [x] Task 1: 크론기지 페이지 컴포넌트 생성 (AC: #1, #2, #6)
  - [x] 1.1 `packages/app/src/pages/cron-base.tsx` 생성
  - [x] 1.2 스케줄 리스트 카드 뷰 구현 (기존 jobs.tsx의 반복 스케줄 탭 로직 참고, 개선된 UX)
  - [x] 1.3 빈 상태 EmptyState 컴포넌트 구현 (시계 아이콘, "예약된 작전이 없습니다")
  - [x] 1.4 nextRunAt 폴링 갱신 (30초 refetchInterval)

- [x] Task 2: 스케줄 생성/편집 모달 (AC: #3)
  - [x] 2.1 CronScheduleModal 컴포넌트 생성
  - [x] 2.2 프리셋 버튼 6개 구현 (선택 시 cronExpression 자동 세팅)
  - [x] 2.3 커스텀 cron 입력 필드 + 실시간 한국어 설명 표시 (클라이언트 사이드 describeCron 구현)
  - [x] 2.4 레거시 frequency/time/days UI 유지 (하위 호환, "간편 설정" 모드)
  - [x] 2.5 클라이언트 사이드 유효성 검사 (필수 필드 + 요일 선택)
  - [x] 2.6 생성 API 호출 (POST /workspace/jobs/schedules) + 편집 API (PATCH)

- [x] Task 3: 실행 기록 드릴다운 (AC: #4)
  - [x] 3.1 스케줄 카드 클릭 시 확장 패널(accordion)
  - [x] 3.2 GET /workspace/jobs/schedules/:id/runs API 호출 (페이지네이션, 10건/페이지)
  - [x] 3.3 실행 상태별 뱃지 (성공=green, 실패=red, 실행중=yellow)
  - [x] 3.4 실패 에러 표시 + 성공 결과 미리보기

- [x] Task 4: WebSocket 실시간 갱신 (AC: #5)
  - [x] 4.1 night-job 채널 subscribe (기존 jobs.tsx 패턴 재사용)
  - [x] 4.2 job-completed/job-failed 이벤트 시 schedules + cronRuns 쿼리 무효화
  - [x] 4.3 job-progress 이벤트 시 해당 스케줄에 프로그레스 표시

- [x] Task 5: 라우팅 및 사이드바 등록 (AC: #1)
  - [x] 5.1 App.tsx에 /cron 라우트 추가 (lazy import CronBasePage)
  - [x] 5.2 sidebar.tsx "운영" 그룹에 `{ to: '/cron', label: '크론기지', icon: '⏰' }` 추가
  - [x] 5.3 기존 /jobs 라우트와 JobsPage는 그대로 유지 (하위 호환)

- [x] Task 6: 반응형 + 스타일링 (AC: #7)
  - [x] 6.1 모바일 레이아웃 최적화 (p-6 sm:p-8, 카드 풀 너비)
  - [x] 6.2 다크 모드 대응 (dark: prefix 40+ 적용)

## Dev Notes

### 기존 인프라 (반드시 재사용)

**이미 구현된 백엔드 API (Story 14-1, 14-2에서 완료):**
- `GET /workspace/jobs/schedules` -- 스케줄 목록
- `GET /workspace/jobs/schedules/:id` -- 단일 조회
- `POST /workspace/jobs/schedules` -- 생성 (cronExpression 또는 frequency+time)
- `PATCH /workspace/jobs/schedules/:id` -- 수정
- `PATCH /workspace/jobs/schedules/:id/toggle` -- isActive 토글
- `DELETE /workspace/jobs/schedules/:id` -- 삭제
- `GET /workspace/jobs/schedules/:id/runs` -- 실행 기록 (페이지네이션, status 필터)
- `GET /workspace/jobs/schedules/:id/runs/:runId` -- 단일 실행 상세

**백엔드 API 변경 불필요** -- 모든 CRUD + 실행 기록 API가 이미 완성됨.

**기존 UI -- `packages/app/src/pages/jobs.tsx` (참고용):**
- 3탭 구조: 일회성/반복 스케줄/트리거
- 반복 스케줄 탭에서 기본 CRUD + 토글 + 편집 기능 구현됨
- `night-job` WebSocket 채널 구독 패턴 재사용
- 단, 기존 페이지는 "야간작업"이라는 통합 뷰 -- 크론기지는 스케줄 전용 독립 화면

**cron-utils (lib/cron-utils.ts):**
- `describeCronExpression(expr)` -- 한국어 설명 반환 ("매일 22:00", "평일 14:30" 등)
- `validateCronExpression(expr)` -- 유효성 검사 (boolean)
- `getNextCronDate(expr)` -- 다음 실행 시간 계산

**DB 스키마:**
- `nightJobSchedules`: id, companyId, userId, agentId, name, instruction, cronExpression, nextRunAt, lastRunAt, isActive, createdAt, updatedAt
- `cronRuns`: id, companyId, cronJobId(FK→nightJobSchedules), status('running'|'success'|'failed'), commandText, startedAt, completedAt, result, error, durationMs, tokensUsed, costMicro

**공유 UI 컴포넌트 (`@corthex/ui`):**
- `Select`, `Textarea`, `Badge`, `StatusDot`, `ConfirmDialog`, `ProgressBar`, `Skeleton`
- 이미 jobs.tsx에서 사용 중 -- 동일하게 사용

### 기존 jobs.tsx와의 관계

**크론기지 vs 야간작업:**
- `/jobs` (야간작업): 일회성 + 반복 + 트리거 통합 뷰. 그대로 유지
- `/cron` (크론기지): 반복 스케줄 전용 화면. 프리셋, 실행 기록 드릴다운 등 개선된 UX
- 동일한 API 엔드포인트 사용 (GET/POST/PATCH/DELETE /workspace/jobs/schedules)
- 사이드바에 둘 다 표시 (야간작업은 "업무" 그룹, 크론기지는 "운영" 그룹)

### 프리셋 정의

```typescript
const CRON_PRESETS = [
  { label: '매일 오전 9시', value: '0 9 * * *', icon: '☀️' },
  { label: '매일 오후 6시', value: '0 18 * * *', icon: '🌆' },
  { label: '매일 밤 10시', value: '0 22 * * *', icon: '🌙' },
  { label: '평일 오전 9시', value: '0 9 * * 1-5', icon: '💼' },
  { label: '매시 정각', value: '0 * * * *', icon: '⏰' },
  { label: '주 1회 (월 09:00)', value: '0 9 * * 1', icon: '📅' },
]
```

### UX 스펙 요약 (UX Screen #15 크론기지)

- **데이터 갱신**: 정적 + 폴링(nextRunAt 30초)
- **핵심 UI 패턴**: 스케줄 리스트 + cron 프리셋/커스텀 입력 + 활성 토글 + next_run 표시
- **디자인 톤**: 군사/사령부 메타포 ("크론기지" = 자동화 스케줄을 관리하는 기지)
- **빈 상태**: 시계 아이콘 + "예약된 작전이 없습니다" + "크론 추가" CTA
- **감정 목표**: 리듬감 -- "시스템이 나 대신 깨어 있다"
- **Zapier 참고**: 트리거-액션 시각 편집, 실행 이력 타임라인
- **사이드바 아이콘**: Clock (⏰)
- **사이드바 위치**: 운영 그룹 내, ARGOS 위

### v1 참고 (크론 UI 패턴)

v1에서 크론은 야간작업 페이지의 반복 스케줄 탭이었음. v2에서는 독립된 "크론기지" 화면으로 승격:
- v1: 시간 + 주기(매일/평일/커스텀) 선택 UI
- v2: 프리셋 6개 + 커스텀 cron 표현식 + 실시간 설명 + 실행 기록 드릴다운
- v2 개선점: 이름 필드 추가, 실행 기록 인라인 확인, 프리셋으로 빠른 설정

### Architecture Patterns

- **컴포넌트 패턴**: 함수형 React + React Query + zustand (기존 패턴)
- **API 호출**: `api.get/post/patch/delete` (packages/app/src/lib/api.ts)
- **WebSocket**: `useWsStore` → subscribe/addListener/removeListener (기존 패턴)
- **라우팅**: React Router v6, lazy import (App.tsx 패턴)
- **스타일**: Tailwind CSS, 다크모드(`dark:` prefix)
- **응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }`

### Project Structure Notes

- New: `packages/app/src/pages/cron-base.tsx` (크론기지 페이지)
- Modify: `packages/app/src/App.tsx` (라우트 추가)
- Modify: `packages/app/src/components/sidebar.tsx` (사이드바 메뉴 추가)
- Reuse: `packages/app/src/lib/api.ts` (API client)
- Reuse: `packages/app/src/stores/ws-store.ts` (WebSocket)
- Reuse: `packages/app/src/stores/auth-store.ts` (인증)
- Reuse: `@corthex/ui` (공유 컴포넌트)
- Reference: `packages/app/src/pages/jobs.tsx` (기존 UI 패턴 참고)
- Reference: `packages/server/src/lib/cron-utils.ts` (cron 유틸)

### Testing Standards

- Framework: bun:test
- Location: `packages/server/src/__tests__/unit/`
- 주요 테스트 대상:
  - UI 컴포넌트는 별도 단위 테스트 불필요 (서버 API 테스트는 이미 14-1에서 완료)
  - 클라이언트 사이드 cron 설명 로직 테스트 (cron-utils가 서버에만 있으므로, 클라이언트에서 API를 통해 설명을 가져오거나 표현식에서 직접 추론)
  - E2E 레벨 테스트는 TEA 단계에서 생성

### Previous Story Intelligence (14-3)

- 14-3에서 ARGOS 서비스 구현 -- argos-service.ts, argos-evaluator.ts, argos routes
- WebSocket `argos` 채널 추가됨
- nightJobTriggers 테이블에 `cooldownMinutes`, `name` 컬럼 확장됨
- argos_events 테이블 + 마이그레이션 추가됨
- 14-1 & 14-2에서 크론 CRUD API + 실행 엔진 완성 -- 백엔드 작업 불필요, 프론트엔드만

### References

- [Source: _bmad-output/planning-artifacts/epics.md - Epic 14, E14-S4]
- [Source: _bmad-output/planning-artifacts/epics.md - FR66 크론 스케줄러]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - Screen #15 크론기지]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - DP3 점진적 복잡성]
- [Source: packages/app/src/pages/jobs.tsx - 기존 야간작업 UI]
- [Source: packages/app/src/App.tsx - 라우팅 패턴]
- [Source: packages/app/src/components/sidebar.tsx - 사이드바 구조]
- [Source: packages/server/src/routes/workspace/schedules.ts - 스케줄 CRUD API]
- [Source: packages/server/src/lib/cron-utils.ts - cron 유틸리티]
- [Source: packages/server/src/services/cron-execution-engine.ts - 실행 엔진]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Story 14-1 done: cron scheduler CRUD API (nightJobSchedules, cronRuns, cron-utils)
- Story 14-2 done: cron execution engine (polling, execution, retry, WebSocket)
- Story 14-3 done: ARGOS trigger system (evaluator, events, auto-execution)
- 백엔드 API 변경 불필요 -- 프론트엔드 전용 스토리
- 기존 jobs.tsx의 반복 스케줄 탭을 독립 화면으로 승격 + UX 개선
- 프리셋 6개 + 커스텀 cron 입력 + 실행 기록 드릴다운이 핵심 차별점
- cron-utils.ts의 describeCronExpression은 서버 모듈 -- 클라이언트에서는 스케줄 응답의 description 필드 사용 또는 경량 클라이언트 파서 구현

### File List

- `packages/app/src/pages/cron-base.tsx` (NEW) -- 크론기지 페이지 컴포넌트 (794 lines)
- `packages/app/src/App.tsx` (MODIFIED) -- CronBasePage lazy import + /cron 라우트
- `packages/app/src/components/sidebar.tsx` (MODIFIED) -- 운영 그룹에 크론기지 메뉴 추가
- `packages/server/src/__tests__/unit/cron-base-ui.test.ts` (NEW) -- 단위 테스트 25개
- `packages/server/src/__tests__/unit/cron-base-ui-tea.test.ts` (NEW) -- TEA 테스트 64개
