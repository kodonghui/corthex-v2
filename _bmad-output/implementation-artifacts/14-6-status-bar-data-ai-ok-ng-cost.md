# Story 14.6: 상태 바: 데이터/AI OK/NG + 비용

Status: done

## Story

As a CEO/관리자,
I want the ARGOS status bar to show real data source health (OK/NG), AI system health (OK/NG), and accurate cost tracking,
so that I can immediately see if data collection and AI systems are functioning properly and how much it costs.

## Acceptance Criteria

1. **AC1: 데이터 OK/NG 실제 헬스체크** -- `getArgosStatus()`의 `dataOk` 필드가 하드코딩 `true`가 아닌 실제 데이터 소스 건강 상태를 반영해야 한다:
   - 최근 1시간 내 데이터 수집 도구(finance, news 등) 호출이 있으면 OK
   - 활성 트리거가 있으나 최근 1시간 내 이벤트가 0건이면 NG (데이터 수집이 멈춘 상태)
   - 활성 트리거가 0개이면 OK (수집할 필요가 없으므로)
   - 최근 1시간 내 데이터 관련 이벤트 중 50% 이상이 failed이면 NG

2. **AC2: AI OK/NG 강화** -- 기존 "1시간 내 failed 3개 이상이면 NG" 로직을 강화:
   - 기존 로직 유지 (argosEvents failed count >= 3 → NG)
   - 추가: 최근 1시간 내 LLM 비용 기록(costRecords)에서 source='job' 또는 source='delegation'인 레코드가 있는지 확인
   - LLM 호출이 있으나 성공 이벤트가 없으면 AI 시스템 이상 의심 → NG
   - 최근 1시간 내 전체 이벤트 대비 failed 비율이 50% 이상이면 NG

3. **AC3: 비용 추적 정확도 개선** -- `todayCost`를 cronRuns만이 아닌 ARGOS 관련 전체 비용으로 확장:
   - cronRuns의 cost_micro (기존 유지)
   - costRecords에서 source='job'이고 당일 생성된 레코드의 costUsdMicro 합산
   - 두 소스의 합계를 반환 (중복 제거: cronRuns에 이미 포함된 건 제외)
   - 달러 단위로 변환 (소수점 4자리)

4. **AC4: lastCheckAt 정확도** -- 마지막 체크 시간을 ARGOS 평가 엔진의 실제 마지막 폴링 시간으로 갱신:
   - argos-evaluator의 마지막 평가 실행 시간 추적
   - argosEvents 최신 레코드 + evaluator 마지막 실행 중 더 최근 값 사용

5. **AC5: 상태 API 응답 확장** -- `/api/workspace/argos/status` 응답에 진단 정보 추가:
   - `dataOkReason: string` -- OK/NG 판정 이유 (예: "최근 1시간 이벤트 12건, 실패 0건")
   - `aiOkReason: string` -- OK/NG 판정 이유 (예: "최근 1시간 실패 0/15건")
   - `costBreakdown: { cronCost: number, llmCost: number }` -- 비용 내역
   - 기존 필드(dataOk, aiOk, activeTriggersCount, todayCost, lastCheckAt) 유지 (하위 호환)

6. **AC6: 유닛 테스트** -- 모든 상태 계산 로직에 대한 테스트:
   - dataOk: 활성 트리거 있는데 이벤트 없음 → NG
   - dataOk: 활성 트리거 없음 → OK
   - dataOk: 이벤트 있고 실패율 < 50% → OK
   - dataOk: 이벤트 있고 실패율 >= 50% → NG
   - aiOk: 실패 3개 이상 → NG
   - aiOk: 실패 비율 50% 이상 → NG
   - todayCost: cronRuns + costRecords 합산
   - todayCost: 빈 데이터 → 0
   - lastCheckAt: 평가 엔진 시간 vs 이벤트 시간 비교

## Tasks / Subtasks

- [x] Task 1: getArgosStatus() 함수 리팩토링 (AC: #1, #2, #3, #4, #5)
  - [x] 1.1 dataOk 로직 구현: 활성 트리거 vs 최근 이벤트 존재 여부 + 실패율 체크
  - [x] 1.2 aiOk 로직 강화: 기존 count 체크 + 실패 비율 체크
  - [x] 1.3 todayCost 확장: cronRuns cost_micro + costRecords costUsdMicro 합산
  - [x] 1.4 lastCheckAt 개선: evaluator 마지막 실행 시간 활용 (lazy import)
  - [x] 1.5 응답에 dataOkReason, aiOkReason, costBreakdown 추가

- [x] Task 2: ArgosStatus 타입 확장 (AC: #5)
  - [x] 2.1 packages/shared/src/types.ts에 dataOkReason, aiOkReason, costBreakdown 필드 추가
  - [x] 2.2 하위 호환 유지 (기존 필드 변경 없음, 새 필드 optional)

- [x] Task 3: argos-evaluator 마지막 실행 시간 추적 (AC: #4)
  - [x] 3.1 evaluator에 lastCheckAt 변수 이미 존재 (line 17)
  - [x] 3.2 getLastCheckAt() 함수 이미 export (line 555-557)

- [x] Task 4: 유닛 테스트 (AC: #6)
  - [x] 4.1 argos-status.test.ts 생성 (31 tests)
  - [x] 4.2 dataOk 시나리오별 테스트 (8 tests: 활성/비활성 트리거, 이벤트 유무, 실패율 경계)
  - [x] 4.3 aiOk 시나리오별 테스트 (6 tests: 실패 횟수, 실패 비율, 임계값 우선순위)
  - [x] 4.4 todayCost 합산 테스트 (5 tests: cronRuns + costRecords, 마이크로 정밀도)
  - [x] 4.5 lastCheckAt 비교 로직 테스트 (5 tests: evaluator vs event 시간 비교)
  - [x] 4.6 costBreakdown 테스트 (포함: 비용 분리 확인)
  - [x] 4.7 진단 reason 문자열 테스트 (4 tests: 백분율, 건수 포함 확인)

## Dev Notes

### 기존 코드 (반드시 수정할 위치)

**`packages/server/src/services/argos-service.ts` (line 347-397):**
```typescript
export async function getArgosStatus(companyId: string): Promise<{...}> {
  // ...
  return {
    dataOk: true, // ← 하드코딩! 이것을 실제 로직으로 교체
    aiOk: (failureCount?.count || 0) < 3,
    activeTriggersCount: triggerCount?.count || 0,
    todayCost: (costResult?.total || 0) / 1_000_000,
    lastCheckAt: lastEvent?.createdAt?.toISOString() || null,
  }
}
```

**핵심 변경: `dataOk` 로직:**
```typescript
// 활성 트리거가 없으면 OK (수집할 필요 없음)
if (activeTriggerCount === 0) {
  dataOk = true
  dataOkReason = '활성 트리거 없음'
}
// 활성 트리거가 있는데 최근 1시간 이벤트가 0건이면 NG
else if (recentEventCount === 0) {
  dataOk = false
  dataOkReason = '활성 트리거 있으나 최근 1시간 이벤트 없음'
}
// 실패율 50% 이상이면 NG
else if (failedCount / totalCount >= 0.5) {
  dataOk = false
  dataOkReason = `최근 1시간 실패율 ${Math.round(failedCount/totalCount*100)}% (${failedCount}/${totalCount}건)`
}
else {
  dataOk = true
  dataOkReason = `최근 1시간 이벤트 ${totalCount}건, 실패 ${failedCount}건`
}
```

**핵심 변경: `todayCost` 확장:**
```typescript
// 기존: cronRuns만
const [cronCost] = await db.select({ total: sql`COALESCE(SUM(cost_micro), 0)::int` })
  .from(cronRuns).where(...)

// 추가: costRecords에서 job 소스
const [llmCost] = await db.select({ total: sql`COALESCE(SUM(cost_usd_micro), 0)::int` })
  .from(costRecords).where(and(
    eq(costRecords.companyId, companyId),
    eq(costRecords.source, 'job'),
    sql`${costRecords.createdAt} >= ${todayStart}`,
  ))

// 합산 (둘 다 마이크로 단위)
const todayCost = ((cronCost?.total || 0) + (llmCost?.total || 0)) / 1_000_000
```

### DB 스키마 참고

**cronRuns (packages/server/src/db/schema.ts line 438-439):**
- `costMicro: integer('cost_micro')` -- 마이크로 달러 (1,000,000 = $1)

**costRecords (packages/server/src/db/schema.ts line 551-568):**
- `costUsdMicro: integer('cost_usd_micro')` -- 마이크로 달러 (1 = $0.000001)
- `source: varchar('source', { length: 50 })` -- 'chat', 'delegation', 'job', 'sns'

**argosEvents (packages/server/src/db/schema.ts):**
- `status: enum('detected', 'executing', 'completed', 'failed')`
- `createdAt: timestamp`

### argos-evaluator 패턴 (packages/server/src/services/argos-evaluator.ts)

```typescript
// 평가 엔진은 setInterval로 주기적 폴링
// lastEvaluationAt 추적을 위해 모듈 레벨 변수 추가:
let lastEvaluationAt: Date | null = null

// evaluate() 함수 내에서 갱신:
lastEvaluationAt = new Date()

// export:
export function getLastEvaluationAt(): Date | null { return lastEvaluationAt }
```

### ArgosStatus 타입 확장 (packages/shared/src/types.ts line 760-766)

```typescript
export type ArgosStatus = {
  dataOk: boolean
  aiOk: boolean
  activeTriggersCount: number
  todayCost: number
  lastCheckAt: string | null
  // 새로 추가
  dataOkReason?: string
  aiOkReason?: string
  costBreakdown?: { cronCost: number, llmCost: number }
}
```

### 테스트 패턴 (bun:test)

기존 argos 테스트 참고: `packages/server/src/__tests__/unit/argos-*.test.ts`
- vi.mock으로 drizzle DB 모킹
- describe/it 구조
- expect().toBe() / toEqual() / toBeCloseTo()

### 주의사항

1. **하위 호환**: 기존 ArgosStatus 필드는 변경하지 않음 (새 필드는 optional)
2. **성능**: getArgosStatus()에 쿼리가 추가되므로 쿼리 효율 고려 (가능하면 하나의 쿼리로 합침)
3. **마이크로 단위 차이**: cronRuns는 `cost_micro`, costRecords는 `cost_usd_micro` -- 둘 다 마이크로 달러지만 컬럼명이 다름
4. **트리거 없는 상태**: 활성 트리거 0개일 때 dataOk=true, aiOk=true (정상 상태)
5. **시간대**: todayStart는 서버 로컬 시간 기준 (UTC가 아닌 new Date().setHours(0,0,0,0))

### Project Structure Notes

- Modify: `packages/server/src/services/argos-service.ts` (getArgosStatus 리팩토링)
- Modify: `packages/shared/src/types.ts` (ArgosStatus 타입 확장)
- Modify: `packages/server/src/services/argos-evaluator.ts` (lastEvaluationAt 추적)
- Create: `packages/server/src/__tests__/unit/argos-status.test.ts` (테스트)
- Reference: `packages/server/src/db/schema.ts` (cronRuns, costRecords, argosEvents)
- Reference: `packages/server/src/routes/workspace/argos.ts` (API 엔드포인트)

### References

- [Source: _bmad-output/planning-artifacts/epics.md - Epic 14, E14-S6: 상태 바: 데이터/AI OK/NG + 비용]
- [Source: _bmad-output/planning-artifacts/epics.md - FR67 ARGOS]
- [Source: packages/server/src/services/argos-service.ts - getArgosStatus() line 347-397]
- [Source: packages/server/src/services/argos-evaluator.ts - 평가 엔진]
- [Source: packages/server/src/db/schema.ts - cronRuns (line 438), costRecords (line 551)]
- [Source: packages/shared/src/types.ts - ArgosStatus (line 760-766)]
- [Source: _bmad-output/implementation-artifacts/14-5-argos-ui.md - 이전 스토리 (상태 바 UI)]
- [Source: _bmad-output/implementation-artifacts/14-3-argos-trigger-condition-auto-collect.md - ARGOS 백엔드]

### Previous Story Intelligence (14-5 ARGOS UI)

**14-5에서 확인된 사항:**
- 상태 바 UI는 14-5에서 구현 (AC2: 4개 상태 카드 표시)
- 14-5 UI는 getArgosStatus() 응답을 그대로 사용
- dataOkReason, aiOkReason이 추가되면 UI에서 tooltip으로 표시 가능 (14-5 후속 개선)
- costBreakdown 추가되면 비용 카드에 드릴다운 가능 (후속 개선)
- **14-6은 순수 백엔드 로직 스토리** -- UI 변경 최소화

### Git Intelligence

최근 커밋 패턴:
- `feat: Story X-Y <description> -- <features>, <test count> tests`
- 서버 단위 테스트 중심
- bun:test 사용, vi.mock으로 의존성 모킹

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Implementation complete: getArgosStatus() refactored with real health checks
- dataOk: real logic based on active triggers, recent event count, and 50% failure rate threshold
- aiOk: enhanced with both count threshold (>=3) and ratio threshold (>=50%)
- todayCost: expanded to include costRecords (source='job') in addition to cronRuns
- lastCheckAt: compares evaluator poll time vs last event time, uses newer
- Added dataOkReason, aiOkReason, costBreakdown to response (backward compatible, optional fields)
- Fixed argos-service.test.ts and argos-tea.test.ts mocks (added costRecords to schema mock)
- Used lazy import for argos-evaluator to avoid circular dependency/mock issues
- 31 new tests in argos-status.test.ts, all passing
- Story 14-1 ~ 14-5 완료 (크론 CRUD, 실행 엔진, ARGOS 트리거, 크론기지 UI, ARGOS UI)
- 핵심 변경: dataOk 하드코딩 true → 실제 헬스체크 로직
- 핵심 변경: todayCost에 costRecords(LLM 비용) 합산 추가
- 핵심 변경: 진단 reason 문자열 추가 (UI tooltip용)
- 순수 백엔드 로직 스토리 (UI 변경 없음)
- 1 SP (소규모) -- argos-service.ts 핵심 변경 + 타입 확장 + 테스트

### File List

- Modified: `packages/server/src/services/argos-service.ts` (getArgosStatus refactored: real dataOk, enhanced aiOk, expanded todayCost, lastCheckAt improvement, reason/breakdown fields)
- Modified: `packages/shared/src/types.ts` (ArgosStatus type: added optional dataOkReason, aiOkReason, costBreakdown)
- Modified: `packages/server/src/__tests__/unit/argos-service.test.ts` (added costRecords to schema mock)
- Modified: `packages/server/src/__tests__/unit/argos-tea.test.ts` (added costRecords to schema mock)
- Created: `packages/server/src/__tests__/unit/argos-status.test.ts` (31 tests for status computation logic)
