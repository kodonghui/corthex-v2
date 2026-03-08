# Story 17.7: 품질 대시보드 (통과율/평균점수/실패목록)

Status: ready-for-dev

## Story

As a CEO,
I want 품질 게이트의 통과율, 평균 점수, 실패 작업 목록을 한눈에 볼 수 있는 품질 대시보드,
so that AI 에이전트의 작업 품질을 체계적으로 모니터링하고 개선 방향을 파악할 수 있다.

## Acceptance Criteria

1. **Given** CEO가 전력분석 페이지에 접근 **When** 품질 대시보드 탭 클릭 **Then** 전체 통과율(pass/fail 비율), 평균 점수(5점 만점), 총 리뷰 수가 요약 카드로 표시
2. **Given** 품질 대시보드 로드 **When** qualityReviews 데이터 존재 **Then** 기간별(7일/30일/전체) 필터로 통과율 추이 차트 표시 (일별 pass/fail 카운트)
3. **Given** 품질 대시보드 **When** 부서별 필터 선택 **Then** 해당 부서 에이전트의 품질 지표만 필터링 + 부서별 통과율 비교 막대 차트
4. **Given** 품질 대시보드 **When** 실패 작업 목록 영역 확인 **Then** conclusion='fail'인 리뷰 목록이 최신순으로 표시 (명령 요약, 에이전트명, 점수, 실패 사유, 시도 횟수)
5. **Given** 실패 작업 목록 **When** 항목 클릭 **Then** 해당 명령의 상세 페이지(통신로그)로 이동
6. **Given** 에이전트별 품질 테이블 **When** 표시 **Then** 에이전트별 리뷰 수, 통과율, 평균 점수, 최근 실패 수 정렬 가능 테이블
7. **Given** 품질 대시보드 API **When** GET /api/workspace/quality-dashboard 호출 **Then** summary(totalReviews, passRate, avgScore), trend(daily pass/fail counts), departmentStats, agentStats, failedList 반환
8. **Given** 전력분석 페이지 사이드바 **When** CEO 앱 네비게이션 확인 **Then** '전력분석' 메뉴 항목이 사이드바에 표시 (BarChart3 아이콘 또는 💪 이모지)
9. **Given** `turbo build type-check` **When** 전체 빌드 **Then** 8/8 success, 타입 에러 0건

## Tasks / Subtasks

- [ ] Task 1: 품질 대시보드 API 서비스 (AC: #7)
  - [ ] `packages/server/src/services/quality-dashboard.ts` 생성
  - [ ] `getQualityDashboard(companyId, { period, departmentId })` 함수 구현
  - [ ] summary: qualityReviews 테이블에서 pass/fail 집계 + 평균 점수 계산
  - [ ] trend: 일별 pass/fail 카운트 (period에 따라 7일/30일/전체)
  - [ ] departmentStats: 부서별 통과율/평균점수 (agents → departments JOIN)
  - [ ] agentStats: 에이전트별 리뷰수/통과율/평균점수/최근실패수
  - [ ] failedList: conclusion='fail' 최신 20건 (명령 요약, 에이전트명, 점수, feedback, attemptNumber)

- [ ] Task 2: 품질 대시보드 API 라우트 (AC: #7)
  - [ ] `packages/server/src/routes/workspace/quality-dashboard.ts` 생성
  - [ ] `GET /api/workspace/quality-dashboard` 엔드포인트
  - [ ] Query params: period (7d|30d|all), departmentId (optional)
  - [ ] workspace 라우터에 등록

- [ ] Task 3: 전력분석 페이지 + 사이드바 등록 (AC: #8)
  - [ ] `packages/app/src/pages/performance.tsx` 생성
  - [ ] 사이드바에 '전력분석' 메뉴 추가 (`/performance`, 💪 아이콘)
  - [ ] App.tsx에 라우트 등록 (lazy import)
  - [ ] 탭 구조: 품질 대시보드 | (17-5, 17-6에서 Soul Gym/성능 추가 예정)

- [ ] Task 4: 품질 요약 카드 UI (AC: #1)
  - [ ] 3개 요약 카드: 총 리뷰 수, 통과율 (%), 평균 점수 (/5.0)
  - [ ] 통과율 색상: ≥80% 초록, ≥60% 노랑, <60% 빨강
  - [ ] 평균 점수 색상: ≥4.0 초록, ≥3.0 노랑, <3.0 빨강

- [ ] Task 5: 통과율 추이 차트 + 기간 필터 (AC: #2, #3)
  - [ ] 기간 선택 버튼: 7일 | 30일 | 전체
  - [ ] 일별 pass/fail 스택 막대 차트 (Recharts BarChart)
  - [ ] 부서별 필터 드롭다운
  - [ ] 부서별 통과율 비교 수평 막대 차트

- [ ] Task 6: 실패 작업 목록 (AC: #4, #5)
  - [ ] 테이블: 명령 요약, 에이전트명, 점수, 실패 사유(feedback), 시도 횟수, 일시
  - [ ] 행 클릭 시 `/activity-log?commandId=xxx`로 이동 (통신로그 상세)
  - [ ] 빈 상태: "실패한 작업이 없습니다 🎉"

- [ ] Task 7: 에이전트별 품질 테이블 (AC: #6)
  - [ ] 컬럼: 에이전트명, 부서, 리뷰 수, 통과율, 평균 점수, 최근 실패 수
  - [ ] 컬럼 헤더 클릭으로 정렬 (asc/desc 토글)
  - [ ] 통과율/평균점수에 색상 뱃지 적용

- [ ] Task 8: 빌드 검증 (AC: #9)
  - [ ] `bunx turbo build type-check` → 8/8 success

## Dev Notes

### 기존 코드 분석

1. **qualityReviews 테이블** (`packages/server/src/db/schema.ts:910-925`)
   - `id`, `companyId`, `commandId`, `taskId`, `reviewerAgentId`, `conclusion` (pass|fail), `scores` (JSONB), `feedback`, `attemptNumber`, `createdAt`
   - 인덱스: `quality_reviews_company_idx`, `quality_reviews_company_command_idx`
   - relations: company, command, task, reviewerAgent

2. **scores JSONB 구조** (merged scores from chief-of-staff.ts):
   ```json
   {
     "legacyScores": { "conclusionQuality": 4, "evidenceSources": 3, ... },
     "legacyTotalScore": 18,
     "legacyPassed": true,
     "ruleResults": [...],
     "inspectionConclusion": "pass",
     "inspectionScore": 85,
     "inspectionMaxScore": 100,
     "rubricScores": [...],
     "hallucinationReport": { "verdict": "clean", "score": 1.0 }
   }
   ```

3. **기존 품질 집계 패턴** (`packages/server/src/services/operation-log-service.ts:54-73`)
   - 5개 legacy 점수를 평균 내는 서브쿼리 존재
   - `conclusionQuality`, `evidenceSources`, `riskAssessment`, `formatCompliance`, `logicalCoherence`
   - AVG 계산 패턴 재사용 가능

4. **기존 라우트 패턴** (`packages/server/src/routes/workspace/`)
   - workspace 라우트는 authMiddleware만 적용 (adminOnly 아님)
   - CEO도 접근 가능

5. **사이드바 패턴** (`packages/app/src/components/sidebar.tsx:39-44`)
   - `{ to: '/path', label: '한글명', icon: '이모지' }` 형식
   - 운영 그룹에 전력분석 추가 필요

6. **App.tsx 라우트 패턴** (`packages/app/src/App.tsx`)
   - lazy import: `const Page = lazy(() => import('./pages/name').then(...))`
   - `<Route path="name" element={<Suspense fallback={<PageSkeleton />}><Page /></Suspense>} />`

7. **차트 라이브러리**: Recharts 이미 설치됨 (UX 스펙 확인)
   - 작전현황 비용 차트, 전략실 포트폴리오 차트 등에서 사용 중

### 구현 설계

```
Server:
packages/server/src/
  services/quality-dashboard.ts          <- NEW: 품질 대시보드 서비스
  routes/workspace/quality-dashboard.ts  <- NEW: API 엔드포인트

App:
packages/app/src/
  pages/performance.tsx                  <- NEW: 전력분석 페이지
  components/sidebar.tsx                 <- MODIFY: 메뉴 추가
  App.tsx                                <- MODIFY: 라우트 추가
```

### API 응답 설계

```typescript
GET /api/workspace/quality-dashboard?period=7d&departmentId=xxx

{
  data: {
    summary: {
      totalReviews: number,
      passCount: number,
      failCount: number,
      passRate: number,       // 0~100 (%)
      avgScore: number,       // 0~5.0
    },
    trend: Array<{
      date: string,           // YYYY-MM-DD
      passCount: number,
      failCount: number,
    }>,
    departmentStats: Array<{
      departmentId: string,
      departmentName: string,
      totalReviews: number,
      passRate: number,
      avgScore: number,
    }>,
    agentStats: Array<{
      agentId: string,
      agentName: string,
      departmentName: string,
      totalReviews: number,
      passRate: number,
      avgScore: number,
      recentFailCount: number,  // 최근 7일 실패 수
    }>,
    failedList: Array<{
      reviewId: string,
      commandId: string,
      commandText: string,      // 명령 요약 (100자 이내)
      agentName: string,
      avgScore: number,
      feedback: string | null,
      attemptNumber: number,
      createdAt: string,
    }>,
  }
}
```

### SQL 쿼리 전략

1. **summary**: `SELECT COUNT(*), SUM(CASE WHEN conclusion='pass' THEN 1 END), AVG(legacy 5점수)` from qualityReviews WHERE companyId AND createdAt >= period
2. **trend**: `GROUP BY DATE(createdAt)` with pass/fail COUNT
3. **departmentStats**: JOIN agents → departments, GROUP BY departmentId
4. **agentStats**: GROUP BY reviewerAgentId JOIN agents, departments
5. **failedList**: WHERE conclusion='fail' ORDER BY createdAt DESC LIMIT 20 JOIN commands (for commandText)

### 기존 패턴 재사용

1. **점수 계산 패턴** → operation-log-service.ts의 AVG 서브쿼리 (5개 legacy 점수 평균)
2. **페이지 구조 패턴** → ops-log.tsx 또는 classified.tsx의 레이아웃
3. **차트 패턴** → 작전현황(dashboard) 페이지의 Recharts 사용법
4. **필터 패턴** → activity-log 페이지의 기간/부서 필터 UI
5. **테이블 패턴** → 기존 정렬 가능 테이블 컴포넌트
6. **사이드바/라우트 등록** → 기존 페이지 추가 패턴 그대로

### 주의사항

- qualityReviews.scores는 JSONB이며, 구조가 mergedScores (legacy + inspection)임
- legacy 5점수 평균이 "avgScore"의 기본 계산 방식 (operation-log-service.ts 패턴)
- 부서별 통계는 agents.departmentId JOIN 필요
- commands 테이블과 JOIN하여 commandText 가져오기
- 기간 필터는 createdAt 기준 WHERE 절
- v1-feature-spec: 총 리뷰 수, 통과율, 평균 점수, 실패 작업 목록 + 사유

### Project Structure Notes

- 전력분석 페이지는 CEO 앱(`packages/app`)에 위치
- 라우트 경로: `/performance`
- API 경로: `/api/workspace/quality-dashboard`
- 사이드바 운영 그룹에 배치 (크론기지, ARGOS 근처)
- 17-5 (Soul Gym API)와 17-6 (Soul Gym UI)은 별도 스토리 — 이번 스토리는 품질 대시보드만

### References

- [Source: _bmad-output/planning-artifacts/epics.md:1331] — E17-S7 품질 대시보드 (통과율/평균점수/실패목록), 2 SP, FR73
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md:273-275] — v1 품질 대시보드: 총 리뷰 수, 통과율, 평균 점수, 실패 작업 목록 + 사유
- [Source: packages/server/src/db/schema.ts:910-925] — qualityReviews 테이블 스키마
- [Source: packages/server/src/services/operation-log-service.ts:54-73] — 기존 품질 점수 집계 SQL 패턴
- [Source: packages/server/src/services/chief-of-staff.ts:440-478] — mergedScores JSONB 구조
- [Source: packages/server/src/services/inspection-engine.ts] — InspectionEngine 결과 구조
- [Source: packages/app/src/components/sidebar.tsx:39-44] — 사이드바 메뉴 등록 패턴
- [Source: packages/app/src/App.tsx:27-30,112-115] — 라우트 등록 패턴 (lazy import)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:195,278] — 전력분석 UX: Soul Gym 카드 + 성능 차트 + 에이전트 테이블, 폴링
- [Source: _bmad-output/planning-artifacts/architecture.md:800,979] — quality 라우트/서비스 위치

### Previous Story Intelligence (17-5, 17-6)

- 17-5 (NEXUS 모바일 접근) — 순수 프론트엔드, DB/API 변경 없음. 모바일 반응형 패턴 참고.
- 17-6 (전력분석 UI + Soul Gym 제안) — **아직 backlog** → 이번 스토리가 먼저. 품질 대시보드가 전력분석 페이지의 첫 번째 탭.
- turbo build 8/8 success, 2161+ unit tests 유지 중

### Git Intelligence

Recent commits:
- `11809fb` feat: Story 10-6 Real/paper trading separation -- 68 tests
- `dc099a6` feat: Story 14-5 ARGOS UI -- 158 tests
- `87e1366` feat: Story 17-4 Classified docs UI -- 175 tests
- `2ed5a3e` feat: Story 15-3 Telegram result auto-send -- 36 tests

패턴: 서버 서비스 + 라우트 + 프론트엔드 페이지 + 테스트를 한 스토리에서 구현

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

### File List
