# Story 7.2: 예산 한도 설정 + 자동 차단

Status: done

## Story

As a 관리자(Admin),
I want 월간 예산 한도를 설정하고 한도 초과 시 LLM 호출을 자동 차단한다,
so that AI 비용이 통제 불가능하게 증가하는 것을 방지하고 비용 투명성을 확보할 수 있다.

## Acceptance Criteria

1. **Given** GET /api/admin/budget **When** 호출 **Then** 현재 예산 설정 반환 (monthlyBudget, warningThreshold, autoBlock, dailyBudget)
2. **Given** PUT /api/admin/budget **When** 유효한 설정 전송 **Then** companies.settings JSONB 업데이트 + 캐시 무효화 + 성공 응답
3. **Given** LLM 호출 시 **When** 월간 비용 >= monthlyBudget AND autoBlock=true **Then** BUDGET_EXCEEDED 에러로 호출 차단 (LLM 어댑터 호출 안 함)
4. **Given** LLM 호출 시 **When** 월간 비용 >= warningThreshold% **Then** WebSocket cost 채널로 budget-warning 이벤트 전송 + 호출은 허용
5. **Given** 예산 차단 발생 **When** 차단 **Then** WebSocket cost 채널로 budget-exceeded 이벤트 전송 + CEO 알림
6. **Given** 예산 차단 응답 **When** 반환 **Then** { code: 'BUDGET_EXCEEDED', message, currentSpend, budget, resetDate } 구조
7. **Given** 일일 예산 설정 **When** 일일 비용 >= dailyBudget **Then** 일일 한도 차단 (월간과 동일 로직)
8. **Given** BudgetGuard **When** DB 조회 **Then** 60초 TTL 캐시로 DB 부하 최소화
9. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: BudgetGuardService 생성 (AC: #3, #4, #6, #7, #8)
  - [x] `packages/server/src/services/budget-guard.ts` 생성
  - [x] `checkBudget(companyId)` — 회사 예산 설정 로드 + 이번 달/일 비용 집계 + 판정
  - [x] 60초 TTL 캐시 (dashboard.ts 패턴 재사용)
  - [x] BudgetCheckResult 타입: { allowed: boolean, reason?, currentSpendMicro, budgetMicro, warningEmitted, resetDate }
  - [x] 월간 + 일일 양축 체크

- [x] Task 2: 예산 설정 API (AC: #1, #2)
  - [x] `packages/server/src/routes/admin/budget.ts` 생성
  - [x] GET /api/admin/budget — companies.settings에서 budget 관련 필드 추출
  - [x] PUT /api/admin/budget — Zod 검증 + settings JSONB 머지 업데이트
  - [x] adminAuthMiddleware 적용
  - [x] 라우트 등록: `packages/server/src/index.ts`에 추가

- [x] Task 3: LLM Router 통합 (AC: #3, #4, #5)
  - [x] `llm-router.ts`의 `call()` 메서드 시작부에 budgetGuard.checkBudget() 호출
  - [x] `stream()` 메서드에도 동일하게 적용
  - [x] 차단 시 BUDGET_EXCEEDED 에러 throw (fallback 시도 안 함)
  - [x] 경고 시 eventBus.emit('cost', { type: 'budget-warning', ... })
  - [x] 차단 시 eventBus.emit('cost', { type: 'budget-exceeded', ... })

- [x] Task 4: 테스트 (AC: 전체)
  - [x] BudgetGuardService 단위 테스트 (18 tests)
  - [x] 예산 설정 API 테스트 (11 tests)
  - [x] LLM Router 통합 테스트 (5 tests)

- [x] Task 5: 빌드 검증 (AC: #9)

## Dev Notes

### 핵심 아키텍처 결정

**BudgetGuard → LLM Router 통합 위치:**
- `LLMRouter.call()` 메서드 시작부에서 checkBudget() 호출 (line 145 근처)
- `LLMRouter.stream()` 메서드 시작부에서도 동일 (line 220 근처)
- AgentRunner가 아닌 LLMRouter에 통합 → 모든 LLM 호출을 커버 (chat, delegation, job, sns)
- BudgetGuard가 실패해도 LLM 호출은 진행 (try-catch로 감싸서 안전하게)

**예산 설정 저장 위치:**
- `companies.settings` JSONB 컬럼 (이미 존재, Story 6-6에서 dashboardQuickActions에 사용 중)
- 새 필드: `budgetConfig: { monthlyBudget, dailyBudget, warningThreshold, autoBlock }`
- 기존 settings 객체에 머지 (spread 패턴, dashboard.ts:298 참고)

### 기존 코드 현황 (중요!)

**이미 구현된 비용 집계 (packages/server/src/lib/cost-tracker.ts):**
- ✅ `getCostSummary(companyId, range)` — 기간별 비용 합계 (line 124)
- ✅ `calculateCostMicro()` — 비용 계산
- ✅ `recordCost()` — 비용 기록 + EventBus emit
- ✅ `microToUsd()` — 표시용 변환

**이미 구현된 대시보드 예산 (packages/server/src/services/dashboard.ts):**
- ✅ `getBudget(companyId)` — 월간 예산 진행률 (line 218)
- ⚠️ **현재 DEFAULT_MONTHLY_BUDGET_MICRO = $500 하드코딩** (line 44)
- ⚠️ `isDefaultBudget: true` 플래그 존재 → 이 스토리에서 실제 설정으로 교체
- ✅ TTL 캐시 패턴 (getCached/setCache, line 9-22) — BudgetGuard에서 재사용

**LLM Router (packages/server/src/services/llm-router.ts):**
- ✅ `call()` 메서드 line 145 — 여기 시작부에 budget check 추가
- ✅ `stream()` 메서드 line 220 — 여기 시작부에도 추가
- ✅ `recordCost()` 호출 line 175 — 비용 기록은 호출 성공 후
- ✅ LLMRouterContext에 companyId 포함

**EventBus (packages/server/src/lib/event-bus.ts):**
- ✅ 간단한 EventEmitter 래퍼
- ✅ cost-tracker.ts에서 `eventBus.emit('cost', { companyId, payload })` 패턴 사용 중 (line 71-80)
- 동일 패턴으로 budget-warning, budget-exceeded 이벤트 추가

**Admin 라우트 구조:**
- `packages/server/src/routes/admin/` — 기존 admin API들
- `packages/server/src/routes/admin/companies.ts` — 회사 관리 (settings 미포함, 별도 파일로 분리)
- Admin auth: `adminAuthMiddleware` (packages/server/src/middleware/admin-auth.ts)

### BudgetGuardService 설계

```typescript
// packages/server/src/services/budget-guard.ts

type BudgetConfig = {
  monthlyBudget: number  // microdollars, 0 = unlimited
  dailyBudget: number    // microdollars, 0 = unlimited
  warningThreshold: number  // percentage, default 80
  autoBlock: boolean     // default true
}

type BudgetCheckResult = {
  allowed: boolean
  reason?: 'monthly_exceeded' | 'daily_exceeded'
  currentMonthSpendMicro: number
  currentDaySpendMicro: number
  monthlyBudgetMicro: number
  dailyBudgetMicro: number
  warningEmitted: boolean
  resetDate: string  // ISO date, first day of next month
}

// 60초 TTL 캐시: { config, monthSpend, daySpend }
// 캐시 키: `budget:${companyId}`
```

### 예산 설정 API 스키마

```typescript
// PUT /api/admin/budget body
const budgetUpdateSchema = z.object({
  monthlyBudget: z.number().min(0).optional(),       // microdollars
  dailyBudget: z.number().min(0).optional(),          // microdollars
  warningThreshold: z.number().min(0).max(100).optional(), // percent
  autoBlock: z.boolean().optional(),
})
```

### dashboard.ts 업데이트 필요

**getBudget() 함수를 실제 설정으로 교체:**
- `DEFAULT_MONTHLY_BUDGET_MICRO` 하드코딩 → companies.settings에서 읽기
- `isDefaultBudget` 플래그를 설정 유무에 따라 true/false
- BudgetGuard의 config 로딩 로직을 공유 (또는 BudgetGuard에서 export)

### LLM Router 통합 코드 패턴

```typescript
// llm-router.ts call() 메서드 시작부
async call(request: LLMRequest, context: LLMRouterContext): Promise<LLMResponse> {
  // Budget check — before any LLM call
  try {
    const budgetResult = await budgetGuard.checkBudget(context.companyId)
    if (!budgetResult.allowed) {
      throw createBudgetExceededError(budgetResult)
    }
  } catch (err) {
    // Only re-throw if it's a budget error; swallow guard failures
    if (err && typeof err === 'object' && 'code' in err && (err as any).code === 'BUDGET_EXCEEDED') {
      throw err
    }
    console.error('[LLMRouter] Budget check failed, proceeding:', err)
  }
  // ... existing code
}
```

### BUDGET_EXCEEDED 에러 형식

```typescript
{
  code: 'BUDGET_EXCEEDED',
  message: '월간 예산 한도를 초과했습니다',
  currentSpend: 450.23,      // USD
  budget: 500.00,            // USD
  resetDate: '2026-04-01',   // 다음 달 1일
  provider: 'system',
  retryable: false
}
```

### WebSocket 이벤트 형식

```typescript
// budget-warning (threshold 도달)
eventBus.emit('cost', {
  companyId,
  payload: {
    type: 'budget-warning',
    level: 'monthly',  // or 'daily'
    currentSpendUsd: 410.50,
    budgetUsd: 500.00,
    usagePercent: 82,
    resetDate: '2026-04-01',
  }
})

// budget-exceeded (차단)
eventBus.emit('cost', {
  companyId,
  payload: {
    type: 'budget-exceeded',
    level: 'monthly',  // or 'daily'
    currentSpendUsd: 502.30,
    budgetUsd: 500.00,
    resetDate: '2026-04-01',
  }
})
```

### Project Structure Notes

- BudgetGuard service: `packages/server/src/services/budget-guard.ts` (NEW)
- Budget admin route: `packages/server/src/routes/admin/budget.ts` (NEW)
- LLM Router integration: `packages/server/src/services/llm-router.ts` (MODIFY — add budget check)
- Dashboard update: `packages/server/src/services/dashboard.ts` (MODIFY — use real budget settings)
- Admin route index: `packages/server/src/routes/admin/index.ts` (MODIFY — register budget route)
- Tests: `packages/server/src/__tests__/unit/budget-guard.test.ts` (NEW)
- Tests: `packages/server/src/__tests__/unit/budget-api.test.ts` (NEW)

### 주의사항 (Developer Guardrails)

1. **dashboard.ts의 DEFAULT_MONTHLY_BUDGET_MICRO를 삭제하지 마세요** — BudgetGuard에서 fallback으로 재사용
2. **companies.settings 업데이트 시 기존 설정 머지 필수** — dashboardQuickActions 등 기존 데이터 보존 (dashboard.ts:298 패턴)
3. **BudgetGuard 실패 시 LLM 호출 차단 금지** — try-catch로 안전하게 처리
4. **캐시 TTL 60초** — 너무 짧으면 DB 부하, 너무 길면 설정 반영 지연
5. **microdollars 단위 일관성** — 내부는 microdollars, API 응답은 USD 변환
6. **eventBus.emit('cost', ...) 형식 유지** — cost-tracker.ts:71 패턴과 동일하게
7. **adminAuthMiddleware 사용** — workspace auth 아님
8. **Zod 스키마 검증 필수** — @hono/zod-validator 패턴 (기존 라우트 참고)
9. **budget check에서 monthlyBudget === 0이면 unlimited** — 차단 안 함
10. **warningThreshold 중복 경고 방지** — 한 번 경고 후 다시 경고 안 함 (캐시에 warningEmitted 플래그)

### References

- [Source: packages/server/src/lib/cost-tracker.ts] — 비용 집계 함수, recordCost, EventBus emit 패턴
- [Source: packages/server/src/services/dashboard.ts:44,218-259] — DEFAULT_MONTHLY_BUDGET_MICRO, getBudget(), 캐시 패턴
- [Source: packages/server/src/services/llm-router.ts:145,220] — call/stream 메서드 통합 위치
- [Source: packages/server/src/db/schema.ts:26-35] — companies 테이블, settings JSONB
- [Source: packages/server/src/lib/event-bus.ts] — EventBus 싱글톤
- [Source: _bmad-output/planning-artifacts/epics.md:1176-1177] — E7-S2 수용 기준
- [Source: _bmad-output/implementation-artifacts/7-1-report-write-submit.md] — 이전 스토리 패턴 참고

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- BudgetGuardService: checkBudget(companyId) with 60s TTL cache, monthly+daily dual check, warning threshold, autoBlock
- Budget API: GET/PUT /api/admin/budget, Zod validation, settings JSONB merge preserving existing data
- LLM Router: enforceBudget() private method in call()+stream(), BUDGET_EXCEEDED error with structured response
- Dashboard: getBudget()+getSummary() now use real budget settings via loadBudgetConfig()
- EventBus: budget-warning and budget-exceeded events via cost channel
- Tests: 34 new tests (18 guard + 11 API + 5 LLM integration), 52 dashboard tests still passing
- Build: 3/3 turbo build passing

### File List

- packages/server/src/services/budget-guard.ts (NEW — BudgetGuardService)
- packages/server/src/routes/admin/budget.ts (NEW — GET/PUT /api/admin/budget)
- packages/server/src/services/llm-router.ts (MODIFIED — budget check in call/stream)
- packages/server/src/services/dashboard.ts (MODIFIED — real budget settings via loadBudgetConfig)
- packages/server/src/index.ts (MODIFIED — budgetRoute registration)
- packages/server/src/__tests__/unit/budget-guard.test.ts (NEW — 18 tests)
- packages/server/src/__tests__/unit/budget-api.test.ts (NEW — 11 tests)
- packages/server/src/__tests__/unit/budget-llm-integration.test.ts (NEW — 5 tests)
- packages/server/src/__tests__/unit/dashboard.test.ts (MODIFIED — budget-guard mock added)
- packages/server/src/__tests__/unit/dashboard-tea.test.ts (MODIFIED — budget-guard mock added)
