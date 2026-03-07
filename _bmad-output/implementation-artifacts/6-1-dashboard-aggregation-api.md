# Story 6.1: Dashboard Aggregation API

Status: done

## Story

As a **CEO (김대표)**,
I want **작전현황(홈 대시보드)에 표시할 4개 요약 카드, AI 사용량 차트, 예산 진행률 데이터를 집계하는 API**,
so that **조직 전체 현황(작업/비용/에이전트/연동 상태)을 한눈에 파악하고, 프로바이더별 AI 사용 추이와 예산 소진율을 모니터링할 수 있다**.

## Acceptance Criteria

1. **GET /api/workspace/dashboard/summary** — 4개 요약 카드 데이터 반환:
   - 작업 카드: 오늘 총 명령 수, 완료, 실패, 진행중
   - 비용 카드: 오늘 총 비용(USD), 프로바이더별(Claude/GPT/Gemini) 비용, 예산 사용률(%)
   - 에이전트 카드: 전체 에이전트 수, 활성(online/working), 유휴(offline), 에러(error)
   - 연동 카드: LLM 프로바이더 상태(up/down), 도구 시스템 작동 여부
2. **GET /api/workspace/dashboard/usage** — AI 사용량 차트 데이터:
   - 최근 7일/30일 일별 사용량 (query param: `days=7|30`)
   - 프로바이더별(Anthropic/OpenAI/Google) 그룹핑
   - 일별 토큰 수 + 비용(USD)
3. **GET /api/workspace/dashboard/budget** — 예산 진행률:
   - 이번 달 총 지출 vs 예산 한도
   - 부서별 비용 내역
   - 월말 예상 지출 (선형 외삽)
4. **테넌트 격리**: 모든 쿼리에 companyId 필터 필수
5. **캐시**: summary 30초, usage 5분 캐시 (인메모리)
6. **응답 형식**: `{ success: true, data: { ... } }`

## Tasks / Subtasks

- [x] Task 1: DashboardService 생성 (AC: #1, #2, #3, #4)
  - [x] 1.1 `packages/server/src/services/dashboard.ts` — DashboardService (함수 기반, 프로젝트 패턴 준수)
  - [x] 1.2 `getSummary(companyId)` — commands status별 count + costRecords 프로바이더별 + agents status별 + 연동 상태
  - [x] 1.3 `getUsage(companyId, days)` — costRecords 프로바이더별 일별 GROUP BY, DATE() SQL 집계
  - [x] 1.4 `getBudget(companyId)` — 월별 비용 + getDepartmentCostBreakdown 재사용 + 선형 외삽
  - [x] 1.5 Provider status — 최근 30분 costRecords 존재 여부로 간이 판정 (getSummary 내부)
- [x] Task 2: 인메모리 캐시 레이어 (AC: #5)
  - [x] 2.1 TTL 기반 Map 캐시, summary=30s, usage=5min, budget=5min
  - [x] 2.2 캐시 키 = `${companyId}:${endpoint}` (usage는 days 포함)
- [x] Task 3: Dashboard API 라우트 (AC: #1, #2, #3, #6)
  - [x] 3.1 기존 `packages/server/src/routes/workspace/dashboard.ts`에 3개 엔드포인트 추가
  - [x] 3.2 authMiddleware 이미 적용됨 (기존 라우트에 포함)
  - [x] 3.3 Zod validation — usage의 days query param (1~90, default 7)
  - [x] 3.4 라우트 이미 index.ts에 등록됨 (기존 dashboardRoute 확장)
- [x] Task 4: Shared 타입 정의 (AC: #6)
  - [x] 4.1 `packages/shared/src/types.ts`에 DashboardSummary, DashboardUsage, DashboardBudget 타입 추가 (기존 파일 확장, 별도 파일 불필요)

## Dev Notes

### 기존 코드 재사용 (절대 재발명 금지)

- **cost-tracker.ts** (`packages/server/src/lib/cost-tracker.ts`): `getCostSummary()`, `getDepartmentCostBreakdown()`, `getModelCostBreakdown()` 이미 구현됨. 이 함수들을 직접 사용할 것
- **schema.ts**: `commands`, `costRecords`, `agents`, `departments`, `companies` 테이블 이미 정의
- **commands.ts 라우트**: authMiddleware, tenant 패턴, Zod validation 패턴 참고
- **organization.ts 서비스**: 에이전트/부서 조회 패턴 참고

### API 응답 패턴 (기존 코드와 일치시킬 것)

```typescript
// 성공
return c.json({ success: true, data: { ... } })
// 에러
return c.json({ success: false, error: { code: 'ERR_CODE', message: '...' } }, 400)
```

### 테넌트 컨텍스트 패턴

```typescript
const tenant = c.get('tenant')  // { companyId, userId, role }
// 모든 DB 쿼리에 eq(table.companyId, tenant.companyId) 필수
```

### 데이터 집계 쿼리 힌트

**Summary - 작업 카드**: commands 테이블에서 오늘 날짜 필터 + status별 count
```typescript
// commands.status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
// commands.createdAt >= 오늘 00:00 UTC
```

**Summary - 비용 카드**: cost-tracker.ts의 `getCostSummary()` 재사용
```typescript
import { getCostSummary } from '../lib/cost-tracker'
const range = { from: todayStart, to: now }
const costSummary = await getCostSummary(companyId, range)
```

**Summary - 에이전트 카드**: agents 테이블 status별 count
```typescript
// agents.status: 'online' | 'working' | 'error' | 'offline'
// isActive=true인 에이전트만 카운트
```

**Summary - 연동 카드**: LLM 프로바이더 상태는 간단히 최근 30분 내 costRecords 존재 여부로 판단 (실제 health check는 복잡 -> 간이 구현)

**Usage**: costRecords에서 프로바이더별 + 일별 GROUP BY
```typescript
// cost-tracker.ts에 비슷한 getCostSummary().byDate 이미 있음
// 프로바이더별 분리만 추가하면 됨
```

**Budget**: companies 테이블에 monthlyBudget 필드가 아직 없음
- companies 테이블에 `settings` jsonb 컬럼이 없으므로, 하드코딩 기본값($500) 사용하거나
- companies 테이블에 `monthlyBudgetMicro` integer 컬럼 추가 (마이그레이션 필요)
- **권장**: 마이그레이션 없이 기본값 사용 + Epic 7에서 예산 한도 시스템 구현 시 연동

### 캐시 구현 가이드

```typescript
// 간단한 TTL 캐시 (외부 라이브러리 불필요)
const cache = new Map<string, { data: unknown; expiresAt: number }>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache(key: string, data: unknown, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
}
```

### 선형 외삽 (월말 예상 지출)

```typescript
// 이번 달 1일~오늘까지 지출 / 경과 일수 * 해당 월 총 일수
const daysElapsed = 현재날짜 - 월초 + 1
const daysInMonth = 해당월총일수
const projected = (currentSpend / daysElapsed) * daysInMonth
```

### Project Structure Notes

- 새 파일: `packages/server/src/services/dashboard.ts`, `packages/server/src/routes/dashboard.ts`, `packages/shared/src/types/dashboard.ts`
- 라우트 등록: `packages/server/src/index.ts`에 `dashboardRoute` import + `.route('/api/workspace/dashboard', dashboardRoute)` 추가
- 기존 패턴: `commandsRoute`가 `/api/workspace/commands`에 등록된 것과 동일 패턴

### References

- [Source: packages/server/src/lib/cost-tracker.ts] — getCostSummary, getDepartmentCostBreakdown, getModelCostBreakdown, microToUsd
- [Source: packages/server/src/db/schema.ts#commands] — commands 테이블 (status, createdAt, companyId)
- [Source: packages/server/src/db/schema.ts#costRecords] — costRecords 테이블 (provider, costUsdMicro, createdAt)
- [Source: packages/server/src/db/schema.ts#agents] — agents 테이블 (status, isActive, companyId)
- [Source: packages/server/src/routes/commands.ts] — authMiddleware, tenant 패턴, Zod validation 패턴
- [Source: _bmad-output/planning-artifacts/epics.md#Epic6] — E6-S1 수용 기준
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Screen1] — 작전현황 화면 요소: 대시보드 카드 4개 + 차트 + 퀵 액션

### Git Intelligence

최근 5개 커밋 패턴:
- 서비스 파일은 `packages/server/src/services/` 경로에 생성
- 라우트 파일은 `packages/server/src/routes/` 경로에 생성
- 타입은 `packages/shared/src/types/` 경로
- 테스트는 `packages/server/src/__tests__/unit/` 경로
- 커밋 메시지: `feat: Story X-Y 설명 -- N tests`

### 이전 Epic 5 인텔리전스

- Epic 5에서 commands, orchestrationTasks, costRecords 테이블이 활발히 사용됨
- 모든 서비스는 순수 함수 또는 클래스로 구현 (DI 없음, 직접 import)
- 라우트에서 `c.get('tenant')` 패턴으로 companyId 추출
- Drizzle ORM의 `and()`, `eq()`, `gte()`, `lte()`, `sum()`, `count()`, `sql` 사용

### 예산 기본값 처리 (중요)

companies 테이블에 monthlyBudget 필드 없음. 두 가지 접근 중 선택:
1. **권장 (마이그레이션 없이)**: 기본값 500_000_000 microdollars ($500) 사용. Budget API 응답에 `isDefault: true` 플래그 포함. Epic 7에서 회사별 설정 구현 시 연동
2. **대안**: companies 테이블에 `monthlyBudgetMicro` 컬럼 추가 (ALTER TABLE). 이 경우 마이그레이션 스크립트 필요

접근 1(기본값) 권장 — 이 스토리 범위는 "집계 API"이며, 예산 설정 CRUD는 Epic 7 범위.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- DashboardService implemented as pure functions (getSummary, getUsage, getBudget) matching project patterns
- Reused existing cost-tracker.ts functions (getCostSummary, getDepartmentCostBreakdown, microToUsd) — no wheel reinvention
- Added 3 new API endpoints to existing dashboard route file (no new route registration needed)
- TTL cache: summary=30s, usage/budget=5min, keyed by companyId
- Provider status: simple heuristic (costRecords in last 30min = "up")
- Budget: default $500/month with isDefaultBudget flag (Epic 7 will add real settings)
- Linear extrapolation: currentSpend / daysElapsed * daysInMonth
- All responses use `{ success: true, data }` format
- Shared types added to existing types.ts (DashboardSummary, DashboardUsage, DashboardUsageDay, DashboardBudget)
- 21 unit tests passing covering all 3 endpoints, cache behavior, tenant isolation, response formats
- Zod validation on usage endpoint (days: 1-90, default 7)

### File List

- packages/server/src/services/dashboard.ts (NEW)
- packages/server/src/routes/workspace/dashboard.ts (MODIFIED — 3 new endpoints added)
- packages/shared/src/types.ts (MODIFIED — dashboard types added)
- packages/server/src/__tests__/unit/dashboard.test.ts (NEW — 21 tests)
