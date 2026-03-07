# Story 6.6: Quick Actions + Satisfaction Chart

Status: done

## Story

As a **CEO (김대표)**,
I want **대시보드에서 자주 사용하는 명령을 퀵 액션 버튼으로 바로 실행하고, 명령 만족도를 도넛 차트로 확인**,
so that **반복 작업을 한 클릭으로 처리하고, AI 조직의 응답 품질 추이를 시각적으로 파악할 수 있다**.

## Acceptance Criteria

1. **Given** 대시보드 페이지 **When** 퀵 액션 패널 표시 **Then** 설정된 퀵 액션 버튼이 API에서 로드되어 렌더링 (기본 4개: 일일 브리핑, 시스템 점검, 비용 리포트, 루틴 실행)
2. **Given** 퀵 액션 버튼 클릭 **When** 연결된 프리셋이 있으면 **Then** 프리셋 실행 API (`POST /api/workspace/presets/:id/execute`) 호출하여 명령 자동 실행, 없으면 사령관실로 이동하여 명령 텍스트 자동 입력
3. **Given** GET /api/workspace/dashboard/quick-actions **When** API 호출 **Then** 해당 company의 퀵 액션 목록 반환 (id, label, icon, command, presetId?, sortOrder)
4. **Given** PUT /api/workspace/dashboard/quick-actions **When** 관리자가 퀵 액션 목록 수정 **Then** companies 테이블의 settings.dashboardQuickActions 값 업데이트
5. **Given** GET /api/workspace/dashboard/satisfaction **When** period 쿼리 파라미터 (7/30/all) **Then** { total, positive, negative, neutral, rate } 반환 — commands 테이블 metadata->feedback->rating 기반 집계
6. **Given** 만족도 차트 **When** 데이터 로드 완료 **Then** CSS conic-gradient 도넛 차트 렌더링: 긍정(green), 부정(red), 무응답(gray) + 중앙에 만족률 % 표시
7. **Given** 만족도 차트 **When** 기간 필터 변경 (7일/30일/전체) **Then** 해당 기간의 만족도 데이터 재조회 및 차트 업데이트
8. **Given** turbo build **When** 전체 빌드 **Then** 3/3 패키지 성공, 기존 테스트 통과

## Tasks / Subtasks

- [x] Task 1: 서버 — 퀵 액션 API (AC: #3, #4)
  - [x] 1.1 `packages/server/src/services/dashboard.ts`에 `getQuickActions(companyId)` 함수 추가
  - [x] 1.2 `packages/server/src/services/dashboard.ts`에 `updateQuickActions(companyId, actions)` 함수 추가
  - [x] 1.3 `packages/server/src/routes/workspace/dashboard.ts`에 GET/PUT `/dashboard/quick-actions` 엔드포인트 추가

- [x] Task 2: 서버 — 만족도 API (AC: #5)
  - [x] 2.1 `packages/server/src/services/dashboard.ts`에 `getSatisfaction(companyId, period)` 함수 추가
  - [x] 2.2 `packages/server/src/routes/workspace/dashboard.ts`에 GET `/dashboard/satisfaction` 엔드포인트 추가

- [x] Task 3: 공유 타입 (AC: #3, #5)
  - [x] 3.1 `packages/shared/src/types.ts`에 QuickAction, DashboardSatisfaction 타입 추가

- [x] Task 4: 클라이언트 — QuickActionsPanel 컴포넌트 강화 (AC: #1, #2)
  - [x] 4.1 기존 `QuickActions` 컴포넌트를 API 기반 `QuickActionsPanel`로 교체
  - [x] 4.2 기존 하드코딩된 QuickActions 함수 제거

- [x] Task 5: 클라이언트 — SatisfactionChart 컴포넌트 (AC: #6, #7)
  - [x] 5.1 SatisfactionChart 컴포넌트: CSS conic-gradient 도넛 차트
  - [x] 5.2 기간 필터: 7일 / 30일 / 전체 버튼 그룹
  - [x] 5.3 DashboardPage에 SatisfactionChart 배치 (BudgetBar 아래, QuickActions 위)

- [x] Task 6: 빌드 검증 + 기존 테스트 통과 (AC: #8)
  - [x] 6.1 turbo build 3/3 확인
  - [x] 6.2 기존 dashboard 테스트 통과 확인 (80 tests, 0 failures)

## Dev Notes

### 구현 결정사항

- companies 테이블에 `settings` JSONB 컬럼 추가 (migration 0032)
- 퀵 액션 설정은 `settings.dashboardQuickActions`에 저장
- 만족도는 commands.metadata->'feedback'->>'rating' 기반 JSONB 집계
- CSS conic-gradient 도넛 차트 (차트 라이브러리 불필요)
- 기본 4개 퀵 액션: 일일 브리핑, 시스템 점검, 비용 리포트, 루틴 실행

### Project Structure Notes

- 모든 변경은 기존 파일에 추가 (신규 파일: 마이그레이션 + 테스트만)

### References

- [Source: packages/server/src/services/dashboard.ts] -- getQuickActions, updateQuickActions, getSatisfaction 추가
- [Source: packages/server/src/routes/workspace/dashboard.ts] -- 3개 엔드포인트 추가
- [Source: packages/shared/src/types.ts] -- QuickAction, DashboardSatisfaction 타입
- [Source: packages/app/src/pages/dashboard.tsx] -- QuickActionsPanel, SatisfactionChart 컴포넌트

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Schema: companies 테이블에 settings JSONB 컬럼 추가 (migration 0032_company-settings.sql)
- Server: getQuickActions (defaults + company settings), updateQuickActions (upsert), getSatisfaction (JSONB metadata 집계) -- 모두 TTL 캐시
- Routes: GET/PUT /dashboard/quick-actions, GET /dashboard/satisfaction (zod validation)
- Client: QuickActionsPanel (API-based, preset 실행 + command center 이동), SatisfactionChart (conic-gradient donut, 3 period filters)
- Types: QuickAction, DashboardSatisfaction in @corthex/shared
- Tests: 80 dashboard tests pass (21 existing + 31 TEA + 28 new)
- Build: 3/3 packages pass
- Fixed existing test mocks for new `companies` schema export

### Change Log

- 2026-03-07: Story 6-6 implemented -- quick actions API + satisfaction chart API + client components + 28 new tests

### File List

- packages/server/src/db/schema.ts (modified -- added settings column to companies)
- packages/server/src/db/migrations/0032_company-settings.sql (new)
- packages/server/src/db/migrations/meta/_journal.json (modified)
- packages/server/src/services/dashboard.ts (modified -- added getQuickActions, updateQuickActions, getSatisfaction)
- packages/server/src/routes/workspace/dashboard.ts (modified -- 3 new endpoints)
- packages/shared/src/types.ts (modified -- QuickAction, DashboardSatisfaction types)
- packages/app/src/pages/dashboard.tsx (modified -- QuickActionsPanel, SatisfactionChart components)
- packages/server/src/__tests__/unit/dashboard-quick-actions-satisfaction.test.ts (new -- 28 tests)
- packages/server/src/__tests__/unit/dashboard.test.ts (modified -- fixed mock for companies export)
- packages/server/src/__tests__/unit/dashboard-tea.test.ts (modified -- fixed mock for companies export)
