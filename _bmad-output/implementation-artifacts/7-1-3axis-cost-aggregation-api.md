# Story 7.1: 3-Axis Cost Aggregation API

Status: done

## Story

As a **admin (관리자)**,
I want **에이전트별/모델별/부서별 3축 비용 집계 API를 통해 AI 비용을 다각도로 조회**,
so that **비용 투명성을 확보하고 비용 대시보드(7-3)와 CEO 비용 카드(7-4)의 데이터 소스를 제공할 수 있다**.

## Acceptance Criteria

1. **Given** GET /api/admin/costs/by-agent 호출 **When** startDate/endDate 쿼리 파라미터 전달 **Then** 해당 기간 내 에이전트별 비용 집계 반환 (agentId, agentName, totalCostMicro, inputTokens, outputTokens, callCount), companyId 격리
2. **Given** GET /api/admin/costs/by-model 호출 **When** startDate/endDate 쿼리 파라미터 전달 **Then** 모델별 비용 집계 반환 (model, provider, displayName, totalCostMicro, inputTokens, outputTokens, callCount)
3. **Given** GET /api/admin/costs/by-department 호출 **When** startDate/endDate 쿼리 파라미터 전달 **Then** 부서별 비용 집계 반환 (departmentId, departmentName, totalCostMicro, agentCount, callCount)
4. **Given** GET /api/admin/costs/summary 호출 **When** startDate/endDate 쿼리 파라미터 전달 **Then** 전체 요약 반환 (totalCostMicro, totalInputTokens, totalOutputTokens, totalCalls, byProvider 배열, trend % vs 이전 동일 기간)
5. **Given** GET /api/admin/costs/daily 호출 **When** startDate/endDate 쿼리 파라미터 전달 **Then** 일별 시계열 데이터 반환 (date, costMicro, inputTokens, outputTokens, callCount) - 차트용
6. **Given** 모든 엔드포인트 **When** startDate/endDate 미전달 **Then** 기본값 최근 30일 적용
7. **Given** 모든 엔드포인트 **When** 다른 회사의 데이터 요청 **Then** companyId 기반 테넌트 격리로 자사 데이터만 반환
8. **Given** turbo build **When** 전체 빌드 **Then** 3/3 패키지 성공, 기존 테스트 통과

## Tasks / Subtasks

- [x] Task 1: CostAggregationService 구현 (AC: #1-#5)
  - [x] 1.1 `packages/server/src/services/cost-aggregation.ts` 생성
  - [x] 1.2 `getByAgent(companyId, startDate, endDate)` — cost_records LEFT JOIN agents, GROUP BY agentId
  - [x] 1.3 `getByModel(companyId, startDate, endDate)` — cost_records GROUP BY model, provider
  - [x] 1.4 `getByDepartment(companyId, startDate, endDate)` — cost_records INNER JOIN agents INNER JOIN departments, GROUP BY departmentId
  - [x] 1.5 `getSummary(companyId, startDate, endDate)` — 전체 합산 + byProvider 집계 + trend 계산 (이전 동일 기간 대비 %)
  - [x] 1.6 `getDaily(companyId, startDate, endDate)` — DATE(created_at) GROUP BY, 차트용 시계열

- [x] Task 2: Admin Cost Routes 구현 (AC: #1-#7)
  - [x] 2.1 `packages/server/src/routes/admin/costs.ts` 생성
  - [x] 2.2 Zod 쿼리 스키마: startDate, endDate (ISO 날짜, 기본 30일)
  - [x] 2.3 GET /costs/by-agent, /costs/by-model, /costs/by-department, /costs/summary, /costs/daily 엔드포인트
  - [x] 2.4 authMiddleware + adminOnly 미들웨어 적용
  - [x] 2.5 `packages/server/src/index.ts`에 costsRoute 등록: `app.route('/api/admin', costsRoute)`

- [x] Task 3: Shared Types (AC: #1-#5)
  - [x] 3.1 `packages/shared/src/types.ts`에 AdminCostByAgent, AdminCostByModel, AdminCostByDepartment, AdminCostSummary, AdminCostDaily 타입 추가

- [x] Task 4: 빌드 검증 (AC: #8)
  - [x] 4.1 turbo build 3/3 확인
  - [x] 4.2 기존 테스트 통과 확인 (30/30 cost-aggregation tests pass)

## Dev Notes

### 핵심: 기존 코드 재사용

cost-tracker.ts (`packages/server/src/lib/cost-tracker.ts`)에 이미 구현된 헬퍼:
- `getCostSummary(companyId, range)` — 전체 합산 + 일별 byDate
- `getAgentCostBreakdown(companyId, agentId, range)` — 특정 에이전트의 모델별 비용
- `getModelCostBreakdown(companyId, range)` — 모델별 비용
- `getDepartmentCostBreakdown(companyId, range)` — 부서별 비용
- `DateRange` 타입: `{ from: Date; to: Date }`
- `CostBreakdownItem` 타입: `{ key, label, inputTokens, outputTokens, costMicro, recordCount }`

**주의:** 기존 헬퍼는 CostBreakdown 형태(items + total)를 반환. 새 서비스는 이 헬퍼를 래핑하되, API 응답 형태에 맞게 변환 필요. 특히:
- `getAgentCostBreakdown`은 특정 agentId 필요 → by-agent API는 전체 에이전트 대상이므로 **새 쿼리 필요** (cost_records GROUP BY agent_id JOIN agents)
- `getDepartmentCostBreakdown`은 그대로 재사용 가능
- `getModelCostBreakdown`은 그대로 재사용 가능 (provider 추가 필요)
- `getCostSummary`는 byProvider 집계와 trend 계산이 없으므로 확장 필요

### cost_records 스키마 (schema.ts:473-490)

```
costRecords = pgTable('cost_records', {
  id: uuid PK,
  companyId: uuid NOT NULL -> companies.id,
  agentId: uuid -> agents.id (nullable - system calls),
  sessionId: uuid -> chatSessions.id,
  provider: varchar(50) NOT NULL default 'anthropic',
  model: varchar(100) NOT NULL,
  inputTokens: integer NOT NULL default 0,
  outputTokens: integer NOT NULL default 0,
  costUsdMicro: integer NOT NULL default 0,  // 1 = $0.000001
  source: varchar(50),  // chat, delegation, job, sns
  isBatch: boolean NOT NULL default false,
  createdAt: timestamp NOT NULL defaultNow(),
})
인덱스: companyCreatedIdx(companyId, createdAt), agentIdx(agentId)
```

### Admin Route 패턴 (기존 패턴 준수)

```typescript
// packages/server/src/routes/admin/costs.ts
import { Hono } from 'hono'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import type { AppEnv } from '../../types'

export const costsRoute = new Hono<AppEnv>()
costsRoute.use('*', authMiddleware, adminOnly)

// GET /costs/by-agent  → app.route('/api/admin', costsRoute) → /api/admin/costs/by-agent
costsRoute.get('/costs/by-agent', async (c) => { ... })
```

### 응답 형식

```typescript
// 성공: { success: true, data: { items: [...], meta: { startDate, endDate, companyId } } }
// 에러: { success: false, error: { code: string, message: string } }
```

### Trend 계산 로직

summary 엔드포인트의 trend %:
1. 현재 기간(startDate~endDate)의 총 비용 계산
2. 동일 길이의 이전 기간 총 비용 계산 (예: 30일이면 그 전 30일)
3. trend = ((current - previous) / previous) * 100
4. previous가 0이면 trend = current > 0 ? 100 : 0

### Zod 쿼리 스키마 패턴

```typescript
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const dateRangeSchema = z.object({
  startDate: z.string().date().optional(),  // ISO date: "2026-03-01"
  endDate: z.string().date().optional(),
})
// 기본값: endDate = today, startDate = endDate - 30일
```

### 등록 위치 (index.ts)

```typescript
import { costsRoute } from './routes/admin/costs'
// ... 기존 admin route들 뒤에 추가
app.route('/api/admin', costsRoute)
```

### getModelConfig 활용

`packages/server/src/config/models.ts`의 `getModelConfig(model)` → `{ displayName, provider, inputPricePer1M, outputPricePer1M }` 반환. by-model 응답에서 displayName과 provider 조회에 사용.

### Project Structure Notes

- 신규 파일: `packages/server/src/services/cost-aggregation.ts`, `packages/server/src/routes/admin/costs.ts`
- 수정 파일: `packages/server/src/index.ts` (route 등록), `packages/shared/src/types.ts` (타입 추가)
- 테스트 파일: `packages/server/src/__tests__/unit/cost-aggregation.test.ts` (TEA 단계에서 생성)

### References

- [Source: packages/server/src/lib/cost-tracker.ts] -- 기존 비용 쿼리 헬퍼 (재사용/확장 대상)
- [Source: packages/server/src/db/schema.ts:473-490] -- cost_records 테이블 스키마
- [Source: packages/server/src/routes/admin/monitoring.ts] -- admin route 패턴 참조
- [Source: packages/server/src/index.ts:83-96] -- admin route 등록 패턴
- [Source: packages/server/src/config/models.ts] -- getModelConfig 함수
- [Source: packages/server/src/routes/workspace/dashboard.ts] -- 기존 비용 관련 workspace 엔드포인트 (중복 방지 참고)
- [Source: _bmad-output/planning-artifacts/epics.md:1163-1187] -- Epic 7 스토리 목록 및 수용 기준
- [Source: _bmad-output/planning-artifacts/epics.md:1454] -- FR38 3축 비용 추적 매핑

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- CostAggregationService: 5 methods (getByAgent, getByModel, getByDepartment, getSummary, getDaily)
- Admin routes: 5 GET endpoints under /api/admin/costs/*
- Shared types: 5 new types (AdminCostByAgent, AdminCostByModel, AdminCostByDepartment, AdminCostSummary, AdminCostDaily)
- getByAgent uses LEFT JOIN (includes system calls with null agentId as "System")
- getByDepartment uses INNER JOIN x2 (excludes system calls without agent/dept)
- getSummary includes trend calculation: compares current period vs previous same-length period
- All endpoints enforce companyId tenant isolation via authMiddleware + adminOnly
- 30 unit tests, 85 assertions, all passing
- turbo build 3/3 packages successful

### File List

- packages/server/src/services/cost-aggregation.ts (NEW)
- packages/server/src/routes/admin/costs.ts (NEW)
- packages/server/src/__tests__/unit/cost-aggregation.test.ts (NEW)
- packages/shared/src/types.ts (MODIFIED - added 5 Admin cost types)
- packages/server/src/index.ts (MODIFIED - registered costsRoute)
