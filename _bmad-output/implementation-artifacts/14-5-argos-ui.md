# Story 14.5: ARGOS UI (정보 수집 트리거 대시보드)

Status: done

## Story

As a CEO/관리자,
I want to manage ARGOS information triggers through a dedicated "ARGOS" screen with trigger cards, status bar (data/AI OK/NG, active count, cost), activity/error log table, and real-time WebSocket updates,
so that I can set up automated intelligence collection triggers and monitor their execution status in real-time.

## Acceptance Criteria

1. **AC1: ARGOS 전용 페이지** -- CEO 앱에 `/argos` 경로로 ARGOS 페이지 추가. 사이드바 "운영" 그룹에 `🔍 ARGOS` 메뉴 항목 추가 (크론기지 아래 배치). 페이지 제목 "ARGOS", 부제 "조건 기반 정보 자동 수집". UX 스펙 Screen #17 준수.

2. **AC2: 상태 바 (Status Bar, 4항목)** -- 페이지 상단에 4개 상태 카드를 가로로 표시:
   - **데이터 OK/NG**: `argosStatus.dataOk` 기반, 녹색(OK)/적색(NG) 배경 + 아이콘
   - **AI OK/NG**: `argosStatus.aiOk` 기반, 녹색(OK)/적색(NG) 배경 + 아이콘
   - **활성 트리거**: `argosStatus.activeTriggersCount` 숫자 표시
   - **오늘 비용**: `argosStatus.todayCost` 달러 표시 (소수점 4자리)
   - 마지막 확인 시간: `argosStatus.lastCheckAt` 타임스탬프 (상태 바 하단)
   - 30초 폴링으로 자동 갱신

3. **AC3: 트리거 카드 리스트** -- 모든 트리거를 카드 리스트로 표시. 각 카드에:
   - 트리거 이름 (name 필드, 없으면 triggerType 표시)
   - 트리거 유형 뱃지 (price=주황, news=파랑, schedule=보라, market-open/close=초록, custom=회색)
   - 담당 에이전트명
   - 조건 설명 (condition을 사람이 읽을 수 있는 한국어로 변환)
   - 실행 지시 (instruction, 2줄 truncate)
   - 활성/비활성 상태 (StatusDot 컴포넌트)
   - 마지막 트리거 시간 (lastTriggeredAt)
   - 쿨다운 시간 (cooldownMinutes 분)
   - 활성 토글 버튼 (즉시 toggle API 호출)
   - 편집/삭제 버튼

4. **AC4: 트리거 생성/편집 모달** -- 트리거 생성 시:
   - 이름 입력 (선택)
   - 트리거 유형 선택: price, price-above, price-below, news, schedule, market-open, market-close, custom
   - 유형별 조건 입력 폼:
     - **price/price-above/price-below**: ticker, market(KR/US), operator(above/below/change_pct_above/change_pct_below), value
     - **news**: keywords(태그 입력), matchMode(any/all), sources(선택), excludeKeywords(선택)
     - **schedule**: intervalMinutes, activeHours(시작/끝), activeDays(요일 체크박스)
     - **market-open/market-close**: market(KR/US) 선택만
     - **custom**: field, operator, value, dataSource
   - 담당 에이전트 선택 (Select 컴포넌트)
   - 실행 지시 내용 (Textarea)
   - 쿨다운 시간 (분, 기본값 30)
   - 편집 시 기존 값 프리필
   - 클라이언트 사이드 유효성 검사 (필수 필드 + 조건 구조)

5. **AC5: 이벤트 로그 테이블** -- 페이지 하단에 ARGOS 이벤트 활동 로그:
   - 2탭 구성: "활동 로그" (전체) / "오류 로그" (status=failed만)
   - 각 행: 트리거명, 이벤트 유형, 상태 뱃지(detected=파랑, executing=노랑, completed=녹색, failed=빨강), 시간, 소요시간
   - 상태 필터: 전체 / detected / executing / completed / failed
   - 페이지네이션 (10건/페이지)
   - 행 클릭 시 상세 패널: eventData, result/error 전문 표시
   - 트리거 카드 클릭 시 해당 트리거의 이벤트만 필터링

6. **AC6: WebSocket 실시간 갱신** -- `argos` 채널 구독:
   - `argos-trigger-fired`: 해당 트리거 카드에 "방금 트리거됨" 하이라이트 + 이벤트 로그에 새 행 추가
   - `argos-execution-completed`: 이벤트 상태 업데이트 + 성공 토스트 알림
   - `argos-execution-failed`: 이벤트 상태 업데이트 + 오류 토스트 알림
   - 상태 바 즉시 갱신 (쿼리 무효화)

7. **AC7: 빈 상태(Empty State)** -- 트리거 0개일 때:
   - 망원경/레이더 아이콘 + "설정된 감시 트리거가 없습니다"
   - "조건 기반으로 정보를 자동 수집하세요" 설명
   - "트리거 추가" 버튼 (클릭 시 생성 모달 열기)

8. **AC8: 반응형** -- 모바일(640px 이하)에서 상태 카드 2x2 그리드, 트리거 카드 풀 너비, 모달은 전체 화면 시트. 다크 모드 대응.

9. **AC9: 테넌트 격리** -- 모든 API 호출이 인증된 사용자의 companyId로 필터링 (기존 argos.ts 라우트 그대로 사용).

## Tasks / Subtasks

- [x] Task 1: ARGOS 페이지 컴포넌트 생성 (AC: #1, #2, #7)
  - [x] 1.1 `packages/app/src/pages/argos.tsx` 생성
  - [x] 1.2 상태 바 4개 카드 (dataOk, aiOk, activeTriggersCount, todayCost) 구현
  - [x] 1.3 GET /api/workspace/argos/status 호출 + 30초 refetchInterval 폴링
  - [x] 1.4 빈 상태 EmptyState 컴포넌트 (망원경 아이콘, "설정된 감시 트리거가 없습니다")

- [x] Task 2: 트리거 카드 리스트 (AC: #3)
  - [x] 2.1 TriggerCard 컴포넌트 생성 (triggerType별 색상 뱃지, 조건 한국어 변환)
  - [x] 2.2 GET /api/workspace/argos/triggers 호출 + 리스트 렌더링
  - [x] 2.3 조건(condition) → 한국어 설명 변환 함수 (formatConditionKorean)
  - [x] 2.4 활성 토글 (PATCH /api/workspace/argos/triggers/:id/toggle)
  - [x] 2.5 삭제 확인 다이얼로그 + DELETE API 호출

- [x] Task 3: 트리거 생성/편집 모달 (AC: #4)
  - [x] 3.1 TriggerModal 컴포넌트 생성
  - [x] 3.2 triggerType 선택 시 동적 조건 폼 전환 (price → ticker/operator/value, news → keywords/matchMode 등)
  - [x] 3.3 에이전트 선택 Select (GET /api/workspace/agents 활용)
  - [x] 3.4 클라이언트 유효성 검사 (triggerType별 필수 필드)
  - [x] 3.5 CREATE (POST) / UPDATE (PATCH) API 호출
  - [x] 3.6 편집 시 기존 값 프리필

- [x] Task 4: 이벤트 로그 테이블 (AC: #5)
  - [x] 4.1 EventLogTable 컴포넌트 (2탭: 전체/오류만)
  - [x] 4.2 GET /api/workspace/argos/triggers/:id/events 호출 (페이지네이션)
  - [x] 4.3 상태 필터 드롭다운
  - [x] 4.4 행 클릭 → 상세 패널 (eventData + result/error 전문)
  - [x] 4.5 트리거 카드 선택 시 해당 트리거 이벤트만 표시

- [x] Task 5: WebSocket 실시간 갱신 (AC: #6)
  - [x] 5.1 argos 채널 subscribe (useWsStore 패턴)
  - [x] 5.2 argos-trigger-fired → 트리거 카드 하이라이트 + 이벤트 추가
  - [x] 5.3 argos-execution-completed/failed → 상태 업데이트 + 토스트 알림
  - [x] 5.4 상태 바 쿼리 무효화

- [x] Task 6: 라우팅 및 사이드바 등록 (AC: #1)
  - [x] 6.1 App.tsx에 /argos 라우트 추가 (lazy import ArgosPage)
  - [x] 6.2 sidebar.tsx "운영" 그룹에 `{ to: '/argos', label: 'ARGOS', icon: '🔍' }` 추가 (크론기지 아래)

- [x] Task 7: 반응형 + 스타일링 (AC: #8)
  - [x] 7.1 모바일 레이아웃 (상태 카드 2x2 그리드, 카드 풀 너비)
  - [x] 7.2 다크 모드 대응 (dark: prefix)

## Dev Notes

### 기존 인프라 (반드시 재사용)

**이미 구현된 백엔드 API (Story 14-3에서 완료):**
- `GET /api/workspace/argos/status` -- 시스템 상태 (dataOk, aiOk, activeTriggersCount, todayCost, lastCheckAt)
- `GET /api/workspace/argos/triggers` -- 트리거 목록 (eventCount, agentName 조인 포함)
- `GET /api/workspace/argos/triggers/:id` -- 단일 조회 + 최근 20 이벤트
- `POST /api/workspace/argos/triggers` -- 생성 (name?, agentId, instruction, triggerType, condition, cooldownMinutes?)
- `PATCH /api/workspace/argos/triggers/:id` -- 수정
- `PATCH /api/workspace/argos/triggers/:id/toggle` -- isActive 토글
- `DELETE /api/workspace/argos/triggers/:id` -- 삭제
- `GET /api/workspace/argos/triggers/:id/events` -- 이벤트 기록 (페이지네이션, status 필터)

**백엔드 API 변경 불필요** -- 모든 CRUD + 이벤트 API가 이미 완성됨.

**지원 triggerType 값:**
- `'price' | 'price-above' | 'price-below' | 'market-open' | 'market-close' | 'news' | 'schedule' | 'custom'`

**조건 스키마 (triggerType별):**
```typescript
// price / price-above / price-below
{ ticker: string, market?: 'KR'|'US', operator: 'above'|'below'|'change_pct_above'|'change_pct_below', value: number, dataSource?: string }
// 레거시: { stockCode: string, targetPrice: number }

// news
{ keywords: string[], matchMode: 'any'|'all', sources?: string[], excludeKeywords?: string[] }

// schedule
{ intervalMinutes: number, activeHours?: { start: number, end: number }, activeDays?: number[] }

// market-open / market-close
{ market?: 'KR'|'US' }

// custom
{ field: string, operator: string, value: any, dataSource?: string }
```

**Zod 검증 스키마 (서버 측):**
```typescript
const createTriggerSchema = z.object({
  name: z.string().max(200).optional(),
  agentId: z.string().uuid(),
  instruction: z.string().min(1).max(2000),
  triggerType: z.enum(['price', 'price-above', 'price-below', 'market-open', 'market-close', 'news', 'schedule', 'custom']),
  condition: z.record(z.unknown()),
  cooldownMinutes: z.number().int().min(1).max(1440).optional(),
})
```

**WebSocket 이벤트 (argos 채널):**
```typescript
// 조건 매칭 시
{ type: 'argos-trigger-fired', triggerId, triggerName, eventData, eventId }
// 실행 완료
{ type: 'argos-execution-completed', triggerId, triggerName, eventId, durationMs, resultPreview }
// 실행 실패
{ type: 'argos-execution-failed', triggerId, triggerName, eventId, error }
```

**이벤트 상태 전이:**
detected → executing → completed | failed

### 14-4 크론기지 UI에서 확인된 패턴 (재사용)

**컴포넌트 구조 패턴:**
- 단일 파일 페이지 컴포넌트 (cron-base.tsx = 794 lines)
- React Query: `useQuery` + `useMutation` + `queryClient.invalidateQueries`
- WebSocket: `useWsStore` → subscribe/addListener/removeListener
- API: `api.get/post/patch/delete` (packages/app/src/lib/api.ts)
- 모달: 인라인 조건부 렌더링 (별도 파일 분리 불필요)
- 토스트: `toast.success()` / `toast.error()` (sonner)
- 빈 상태: 인라인 EmptyState div
- 반응형: Tailwind responsive classes (sm:, md:, lg:)
- 다크 모드: `dark:` prefix

**사이드바 패턴 (sidebar.tsx):**
```typescript
// 운영 그룹
{ to: '/cron', label: '크론기지', icon: '⏰' },
// ARGOS는 이 아래에 추가
```

**라우팅 패턴 (App.tsx):**
```typescript
const ArgosPage = lazy(() => import('./pages/argos'))
// <Route path="/argos" element={<ArgosPage />} />
```

### 조건 한국어 변환 함수 (클라이언트 사이드 구현)

```typescript
function formatConditionKorean(triggerType: string, condition: Record<string, any>): string {
  switch (triggerType) {
    case 'price':
    case 'price-above':
    case 'price-below': {
      const op = { above: '이상', below: '이하', change_pct_above: '% 이상 변동', change_pct_below: '% 이하 변동' }
      return `${condition.ticker} ${condition.value}${op[condition.operator] || ''}`
    }
    case 'news':
      return `키워드: ${condition.keywords?.join(', ')} (${condition.matchMode === 'all' ? '모두 포함' : '하나 이상'})`
    case 'schedule':
      return `${condition.intervalMinutes}분 간격`
    case 'market-open':
      return `장 시작 (${condition.market || 'KR'})`
    case 'market-close':
      return `장 마감 (${condition.market || 'KR'})`
    case 'custom':
      return `${condition.field} ${condition.operator} ${condition.value}`
    default:
      return JSON.stringify(condition)
  }
}
```

### triggerType별 색상 뱃지

```typescript
const TRIGGER_TYPE_COLORS: Record<string, { bg: string, text: string, label: string }> = {
  'price': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: '가격' },
  'price-above': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: '가격↑' },
  'price-below': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: '가격↓' },
  'news': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: '뉴스' },
  'schedule': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: '일정' },
  'market-open': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: '장시작' },
  'market-close': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: '장마감' },
  'custom': { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300', label: '커스텀' },
}
```

### DB 스키마 참고

**nightJobTriggers:**
- id, companyId, userId, agentId, name(varchar 200, nullable), instruction(text), triggerType(varchar 50), condition(jsonb), cooldownMinutes(int, default 30), isActive(boolean, default true), lastTriggeredAt(timestamp, nullable), createdAt

**argosEvents:**
- id, companyId, triggerId(FK→nightJobTriggers, ON DELETE CASCADE), eventType(varchar 50), eventData(jsonb, nullable), status(enum: detected/executing/completed/failed), commandId(uuid, nullable), result(text, nullable), error(text, nullable), durationMs(int, nullable), processedAt(timestamp, nullable), createdAt

### 공유 UI 컴포넌트 (`@corthex/ui`)

- `Select`, `Textarea`, `Badge`, `StatusDot`, `ConfirmDialog`, `ProgressBar`, `Skeleton`, `Input`
- 이미 cron-base.tsx 등에서 사용 중 -- 동일하게 사용

### Architecture Patterns

- **컴포넌트 패턴**: 함수형 React + React Query + zustand
- **API 호출**: `api.get/post/patch/delete` (packages/app/src/lib/api.ts)
- **WebSocket**: `useWsStore` → subscribe/addListener/removeListener
- **라우팅**: React Router v6, lazy import (App.tsx 패턴)
- **스타일**: Tailwind CSS, 다크모드(`dark:` prefix)
- **응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **토스트**: sonner의 toast.success/error

### UX 스펙 요약 (UX Screen #17 ARGOS)

- **데이터 갱신**: 실시간(WS: argos 채널) + 폴링(status 30초)
- **핵심 UI 패턴**: 트리거 카드 리스트 + 상태 바(4항목) + 활동/오류 로그 테이블
- **디자인 톤**: 군사/첩보 메타포 ("ARGOS" = 그리스 신화의 100개 눈을 가진 파수꾼)
- **빈 상태**: 망원경/레이더 아이콘 + "설정된 감시 트리거가 없습니다" + "트리거 추가" CTA
- **감정 목표**: 안심감 -- "놓치지 않겠다", "자동으로 감시 중"
- **사이드바 아이콘**: Search (🔍)
- **사이드바 위치**: 운영 그룹 내, 크론기지 아래

### v1 참고 (ARGOS 패턴)

v1 ARGOS는 Python 기반 데이터 수집기 + API 엔드포인트:
- pykrx/yfinance(주가), Naver News(뉴스), DART(공시), ECOS(거시지표) 수집
- Quant Score(RSI, MA, BB, 거래량, 추세) + Calibration Factor + Bayesian 신뢰도
- v2에서는 트리거 조건 평가 + 자동 실행 중심으로 전환
- UI는 v1에 없었음 -- v2에서 새로 구축

### Previous Story Intelligence (14-4 크론기지 UI)

**14-4에서 확인된 패턴과 주의사항:**
- 단일 파일 페이지 (~800 lines) -- 적절한 크기
- cron-utils는 서버 모듈이므로 클라이언트에서 직접 import 불가 → API 응답의 description 필드 사용
- WebSocket 구독은 useEffect + cleanup 패턴
- React Query 캐시 키 일관성 중요 (invalidateQueries에 정확한 키 사용)
- 편집 모달에서 기존 값 프리필 시 useEffect로 폼 상태 초기화
- 삭제는 항상 ConfirmDialog 경유

### Project Structure Notes

- New: `packages/app/src/pages/argos.tsx` (ARGOS 페이지)
- Modify: `packages/app/src/App.tsx` (라우트 추가)
- Modify: `packages/app/src/components/sidebar.tsx` (사이드바 메뉴 추가)
- Reuse: `packages/app/src/lib/api.ts` (API client)
- Reuse: `packages/app/src/stores/ws-store.ts` (WebSocket)
- Reuse: `packages/app/src/stores/auth-store.ts` (인증)
- Reuse: `@corthex/ui` (공유 컴포넌트)
- Reference: `packages/app/src/pages/cron-base.tsx` (크론기지 UI 패턴 참고)
- Reference: `packages/server/src/routes/workspace/argos.ts` (ARGOS API)
- Reference: `packages/server/src/services/argos-service.ts` (서비스 로직)

### Testing Standards

- Framework: bun:test
- Location: `packages/server/src/__tests__/unit/`
- UI 컴포넌트 단위 테스트: 서버 API 테스트는 14-3에서 완료 (93건)
- 클라이언트 로직 테스트: formatConditionKorean, triggerType 색상 매핑 등
- E2E 테스트는 TEA 단계에서 생성

### References

- [Source: _bmad-output/planning-artifacts/epics.md - Epic 14, E14-S5]
- [Source: _bmad-output/planning-artifacts/epics.md - FR67 ARGOS]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - Screen #17 ARGOS]
- [Source: _bmad-output/planning-artifacts/prd.md - FR67]
- [Source: packages/server/src/routes/workspace/argos.ts - ARGOS REST API]
- [Source: packages/server/src/services/argos-service.ts - ARGOS 서비스]
- [Source: packages/server/src/services/argos-evaluator.ts - 평가 엔진]
- [Source: packages/server/src/db/schema.ts - nightJobTriggers, argosEvents]
- [Source: packages/shared/src/types.ts - ArgosTriggerType, ArgosEventStatus]
- [Source: packages/app/src/pages/cron-base.tsx - 크론기지 UI 패턴]
- [Source: _bmad-output/implementation-artifacts/14-4-cron-base-ui.md - 이전 스토리]
- [Source: _bmad-output/implementation-artifacts/14-3-argos-trigger-condition-auto-collect.md - ARGOS 백엔드]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Story 14-1 done: cron scheduler CRUD API (nightJobSchedules, cronRuns, cron-utils)
- Story 14-2 done: cron execution engine (polling, execution, retry, WebSocket)
- Story 14-3 done: ARGOS trigger system (evaluator, events, auto-execution, 93 tests)
- Story 14-4 done: 크론기지 UI (스케줄 리스트, 프리셋, 실행 기록, WebSocket, 89 tests)
- 백엔드 API 변경 불필요 -- 프론트엔드 전용 스토리
- ARGOS API 8개 엔드포인트 모두 완성됨 (14-3)
- WebSocket argos 채널 3개 이벤트 타입 구현됨
- triggerType 8종 지원 + 조건별 유효성 검사 서버에서 처리
- v1에는 ARGOS UI가 없었음 -- v2에서 완전히 새로 구축

### File List

- `packages/app/src/pages/argos.tsx` (NEW) -- ARGOS 페이지 컴포넌트 (전체 UI)
- `packages/app/src/App.tsx` (MODIFIED) -- ArgosPage lazy import + /argos 라우트
- `packages/app/src/components/sidebar.tsx` (MODIFIED) -- 운영 그룹에 ARGOS 메뉴 추가
- `packages/server/src/__tests__/unit/argos-ui.test.ts` (NEW) -- 단위 테스트 54개
