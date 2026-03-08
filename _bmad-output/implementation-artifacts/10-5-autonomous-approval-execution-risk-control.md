# Story 10.5: 자율/승인 실행 + 투자 성향 리스크 제어

Status: done

## Story

As a CEO(이사장),
I want CIO 분석 결과에 따른 매매 주문이 "자율 실행" 또는 "승인 후 실행" 중 내가 선택한 모드로 동작하고, 투자 성향(보수/균형/공격)에 따라 매매 한도/비중이 자동으로 제한되기를,
so that AI 자동매매의 안전성을 내가 통제할 수 있고, 투자 성향에 맞는 리스크 관리가 자동으로 적용된다.

## Acceptance Criteria

1. **자율/승인 실행 모드 선택 (FR59)**
   - Given: CEO가 전략실 설정에서 실행 모드를 선택할 때
   - When: "자율 실행(autonomous)" 또는 "승인 후 실행(approval)" 중 하나를 설정하면
   - Then: `companies.settings.tradingSettings.executionMode`에 저장된다
   - And: 기본값은 "approval"(안전 우선)이다

2. **승인 모드에서 CEO 확인 후 실행**
   - Given: 실행 모드가 "approval"일 때
   - When: CIO 분석이 완료되고 trade proposals가 생성되면
   - Then: 주문이 즉시 실행되지 않고 `strategy_orders` 테이블에 `status: 'pending_approval'`로 저장된다
   - And: CEO에게 "승인 대기 중인 매매 N건" 알림이 WebSocket으로 전송된다
   - And: CEO가 개별 주문 또는 일괄 승인/거부할 수 있는 API가 제공된다
   - And: 승인된 주문만 VECTOR가 KIS API로 실행한다

3. **자율 모드에서 즉시 실행**
   - Given: 실행 모드가 "autonomous"일 때
   - When: CIO 분석이 완료되고 trade proposals가 생성되면
   - Then: VECTOR가 기존과 동일하게 즉시 주문 실행한다 (현재 10-4 동작)
   - And: 자율 모드에서도 투자 성향 리스크 제어가 적용된다

4. **투자 성향 3종 프로필 (FR60)**
   - Given: CEO가 투자 성향을 설정할 때
   - When: "conservative(보수)", "balanced(균형)", "aggressive(공격)" 중 하나를 선택하면
   - Then: `companies.settings.tradingSettings.riskProfile`에 저장된다
   - And: 각 성향별 기본 파라미터가 자동 적용된다:
     - **보수적**: 종목당 최대 10%, 최소 확신도 75%, 손절 -3%, 익절 8%, 일일 5회, 일일 최대 손실 1%
     - **균형**: 종목당 최대 20%, 최소 확신도 65%, 손절 -5%, 익절 10%, 일일 10회, 일일 최대 손실 3%
     - **공격적**: 종목당 최대 30%, 최소 확신도 55%, 손절 -8%, 익절 15%, 일일 15회, 일일 최대 손실 5%
   - And: 기본값은 "balanced"이다

5. **리스크 제어 — VECTOR 주문 검증 강화**
   - Given: VECTOR가 trade proposal을 실행하기 전에
   - When: 투자 성향 리스크 제어를 적용하면
   - Then: 다음 검증이 추가된다:
     - 종목당 최대 비중 체크 (포트폴리오 대비 비중%)
     - 투자 성향별 최소 확신도 체크 (기존 0.6 고정 → 성향별 동적)
     - 일일 매매 한도 체크 (성향별 동적)
     - 일일 최대 손실률 체크 (당일 실현 손실 합산)
   - And: 검증 실패 시 주문이 스킵되고 사유가 기록된다

6. **트레이딩 설정 API**
   - Given: CEO 또는 관리자가 트레이딩 설정을 조회/변경할 때
   - When: GET/PUT `/api/workspace/strategy/settings` API를 호출하면
   - Then: 현재 설정(실행 모드, 투자 성향, 각종 한도)을 조회/변경할 수 있다
   - And: 성향별 안전 범위 내에서만 커스텀 변경이 가능하다 (v1의 `_clamp_setting()` 패턴)
   - And: 모든 설정 변경이 변경 이력(settings_change_log)에 기록된다

7. **승인 API**
   - Given: 승인 대기 중인 주문이 있을 때
   - When: CEO가 POST `/api/workspace/strategy/orders/:id/approve` 또는 `/reject`를 호출하면
   - Then: 승인된 주문은 VECTOR가 실행하고, 거부된 주문은 `status: 'rejected'`로 변경된다
   - And: 일괄 승인/거부 API도 제공된다 (POST `/api/workspace/strategy/orders/bulk-approve`)

## Tasks / Subtasks

- [x] Task 1: 트레이딩 설정 서비스 생성 (AC: #1, #4, #6)
  - [x] 1.1 `packages/server/src/services/trading-settings.ts` 생성
  - [x] 1.2 `RISK_PROFILES` 상수 정의 (v1 `trading_engine.py` RISK_PROFILES 포팅)
  - [x] 1.3 `getTradingSettings(companyId)`: companies.settings에서 tradingSettings 읽기
  - [x] 1.4 `updateTradingSettings(companyId, updates)`: 성향별 안전 범위 내 clamp + 저장
  - [x] 1.5 `clampSetting(key, value, profile)`: 안전 범위 제한 함수
  - [x] 1.6 설정 변경 이력 기록 (companies.settings.tradingSettingsHistory에 append)

- [x] Task 2: VECTOR 리스크 검증 강화 (AC: #5)
  - [x] 2.1 `vector-executor.ts`의 `validateOrder()` 확장: 투자 성향별 동적 확신도 체크
  - [x] 2.2 `validatePositionSize()`: 종목당 최대 비중 체크 (포트폴리오 대비)
  - [x] 2.3 `validateDailyLimit()` 수정: 성향별 일일 매매 한도 적용
  - [x] 2.4 `validateDailyLoss()`: 당일 실현 손실률 체크
  - [x] 2.5 `VectorExecuteOptions`에 `riskProfile` 추가, settings 자동 로드

- [x] Task 3: 승인 모드 구현 (AC: #2, #3)
  - [x] 3.1 `orderStatusEnum`에 'pending_approval' 추가 (DB migration)
  - [x] 3.2 `services/trade-approval.ts` 생성: 승인/거부/일괄 처리 로직
  - [x] 3.3 `savePendingOrders()`: trade proposals를 pending_approval로 DB 저장
  - [x] 3.4 `approveOrder(orderId, companyId)`: 승인 → VECTOR 실행
  - [x] 3.5 `rejectOrder(orderId, companyId, reason)`: 거부 → status='rejected' 변경
  - [x] 3.6 `bulkApprove/bulkReject`: 일괄 처리
  - [x] 3.7 승인 대기 WebSocket 알림 (`strategy` 채널)

- [x] Task 4: Chief-of-Staff 통합 수정 (AC: #2, #3)
  - [x] 4.1 `chief-of-staff.ts`의 CIO+VECTOR 분기에서 tradingSettings 로드
  - [x] 4.2 executionMode에 따라 분기:
    - autonomous: 기존 executeProposals() 호출 (+ riskProfile 전달)
    - approval: savePendingOrders() 호출 → 승인 대기 알림

- [x] Task 5: API 라우트 추가 (AC: #6, #7)
  - [x] 5.1 `routes/workspace/strategy.ts`에 설정 API 추가
    - GET `/api/workspace/strategy/settings`
    - PUT `/api/workspace/strategy/settings`
  - [x] 5.2 승인 API 추가
    - GET `/api/workspace/strategy/orders/pending` — 승인 대기 주문 목록
    - POST `/api/workspace/strategy/orders/:id/approve`
    - POST `/api/workspace/strategy/orders/:id/reject`
    - POST `/api/workspace/strategy/orders/bulk-approve`
    - POST `/api/workspace/strategy/orders/bulk-reject`

- [x] Task 6: 타입 정의 추가 (전체 AC)
  - [x] 6.1 `packages/shared/src/types.ts`에 추가:
    - `RiskProfile` type: 'conservative' | 'balanced' | 'aggressive'
    - `TradingSettings` type: executionMode, riskProfile, 각종 한도
    - `RiskProfileConfig` type: min/max/default 범위
    - `TradeApprovalResult` type

## Dev Notes

### v1 RISK_PROFILES 포팅 (필수)

v1의 `web/trading_engine.py`에 정의된 3종 투자 성향 프로필을 그대로 포팅한다:

```typescript
// services/trading-settings.ts
export const RISK_PROFILES = {
  aggressive: {
    label: '공격적', emoji: '🔥',
    cashReserve:      { min: 5,  max: 20, default: 10 },
    maxPositionPct:   { min: 15, max: 35, default: 30 },
    minConfidence:    { min: 50, max: 75, default: 55 },
    defaultStopLoss:  { min: -12, max: -3, default: -8 },
    defaultTakeProfit:{ min: 5, max: 40, default: 15 },
    maxDailyTrades:   { min: 5, max: 20, default: 15 },
    maxDailyLossPct:  { min: 2, max: 8, default: 5 },
    orderSize:        { min: 0, max: 10_000_000, default: 0 },
  },
  balanced: {
    label: '균형', emoji: '⚖️',
    cashReserve:      { min: 15, max: 35, default: 20 },
    maxPositionPct:   { min: 10, max: 25, default: 20 },
    minConfidence:    { min: 55, max: 80, default: 65 },
    defaultStopLoss:  { min: -8, max: -2, default: -5 },
    defaultTakeProfit:{ min: 5, max: 25, default: 10 },
    maxDailyTrades:   { min: 3, max: 15, default: 10 },
    maxDailyLossPct:  { min: 1, max: 5, default: 3 },
    orderSize:        { min: 0, max: 5_000_000, default: 0 },
  },
  conservative: {
    label: '보수적', emoji: '🐢',
    cashReserve:      { min: 30, max: 60, default: 40 },
    maxPositionPct:   { min: 5, max: 15, default: 10 },
    minConfidence:    { min: 65, max: 90, default: 75 },
    defaultStopLoss:  { min: -5, max: -1, default: -3 },
    defaultTakeProfit:{ min: 3, max: 15, default: 8 },
    maxDailyTrades:   { min: 1, max: 8, default: 5 },
    maxDailyLossPct:  { min: 0.5, max: 2, default: 1 },
    orderSize:        { min: 0, max: 2_000_000, default: 0 },
  },
} as const
```

### v1 _clamp_setting() 패턴 포팅

```typescript
// v1: trading_settings_control.py -> _clamp_setting()
// 설정값을 투자 성향별 안전 범위 내로 제한
export function clampSetting(
  key: string, value: number, profile: RiskProfile
): number {
  const profileConfig = RISK_PROFILES[profile]
  const range = profileConfig[key as keyof typeof profileConfig]
  if (!range || typeof range === 'string') return value
  return Math.max(range.min, Math.min(range.max, value))
}
```

### 기존 코드와의 관계 — 수정 지점

| 기존 코드 | 수정 내용 |
|-----------|----------|
| `vector-executor.ts` — `validateOrder()` | 성향별 동적 확신도, 종목 비중, 일일 손실 검증 추가 |
| `vector-executor.ts` — `MIN_CONFIDENCE = 0.6` | 성향별 동적 값으로 교체 (RISK_PROFILES에서 읽기) |
| `vector-executor.ts` — `DEFAULT_DAILY_TRADE_LIMIT = 20` | 성향별 동적 값으로 교체 |
| `vector-executor.ts` — `VectorExecuteOptions` | `riskProfile` 필드 추가 |
| `chief-of-staff.ts` — `tradingMode: 'paper'` 고정 (636행) | tradingSettings에서 executionMode 읽어 분기 |
| `db/schema.ts` — `orderStatusEnum` | 'pending_approval' 값 추가 |
| `routes/workspace/strategy.ts` 또는 신규 | 설정/승인 API 라우트 추가 |

### 트레이딩 설정 저장 위치

`companies` 테이블의 `settings` JSONB 필드에 저장 (별도 테이블 불필요):

```typescript
// companies.settings.tradingSettings 구조
{
  executionMode: 'approval' | 'autonomous',  // 기본: 'approval'
  riskProfile: 'conservative' | 'balanced' | 'aggressive',  // 기본: 'balanced'
  // 커스텀 오버라이드 (성향별 기본값과 다를 때만 저장)
  customSettings: {
    maxPositionPct?: number,
    minConfidence?: number,
    defaultStopLoss?: number,
    defaultTakeProfit?: number,
    maxDailyTrades?: number,
    maxDailyLossPct?: number,
    orderSize?: number,
  },
  // 변경 이력 (최근 100건)
  settingsHistory: Array<{
    changedAt: string,
    changedBy: string,
    action: string,
    detail: string,
    applied: Record<string, unknown>,
    rejected: Record<string, unknown>,
  }>
}
```

### 승인 모드 흐름

```
CIO 분석 완료 → trade proposals 생성
     ↓
executionMode 확인
     ↓
┌─── autonomous ──────────────────────────────────┐
│ 기존 흐름 유지: validateOrder() + executeOrder() │
│ (리스크 프로필 기반 동적 검증 추가)                │
└─────────────────────────────────────────────────┘
     ↓
┌─── approval ────────────────────────────────────┐
│ 1. proposals → strategy_orders (pending_approval)│
│ 2. WebSocket 알림: "승인 대기 N건"                │
│ 3. CEO가 승인 API 호출                           │
│ 4. 승인된 주문 → validateOrder() + executeOrder() │
│ 5. 거부된 주문 → status='rejected'               │
└─────────────────────────────────────────────────┘
```

### DB Migration: orderStatusEnum 확장

```sql
-- 0044_order-status-pending-approval.sql
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pending_approval' BEFORE 'pending';
```

주의: PostgreSQL에서 enum에 값 추가는 트랜잭션 내에서 불가 — `ALTER TYPE ADD VALUE`는 트랜잭션 밖에서 실행해야 함. Drizzle migration에서 `sql` raw query 사용.

### 승인 대기 WebSocket 알림

```typescript
// delegation-tracker.ts 또는 별도 알림 로직
delegationTracker.emit(companyId, 'strategy', {
  type: 'trade:pending_approval',
  data: {
    commandId,
    pendingCount: proposals.length,
    proposals: proposals.map(p => ({
      ticker: p.ticker,
      tickerName: p.tickerName,
      side: p.side,
      quantity: p.quantity,
      price: p.price,
      confidence: p.confidence,
    })),
  },
})
```

### 종목당 비중 체크 로직

```typescript
// 포트폴리오 총 평가액 대비 해당 종목 비중 계산
async function validatePositionSize(
  proposal: TradeProposal,
  companyId: string,
  userId: string,
  maxPositionPct: number,
): Promise<OrderValidation> {
  // strategy_portfolios에서 현재 포트폴리오 조회
  // totalEval = cashBalance + 보유종목 평가액 합산
  // 해당 종목 주문 금액 / totalEval * 100 > maxPositionPct 이면 거부
}
```

### 일일 손실률 체크 로직

```typescript
// 당일 실행된 주문 중 손실 합산
async function validateDailyLoss(
  companyId: string,
  tradingMode: 'real' | 'paper',
  maxDailyLossPct: number,
): Promise<OrderValidation> {
  // 당일 실현 손실 합산 / 포트폴리오 총 평가액 * 100
  // maxDailyLossPct 초과 시 거부
}
```

### Project Structure Notes

- **신규 파일:**
  - `packages/server/src/services/trading-settings.ts` — 투자 성향 + 리스크 프로필 + 설정 관리
  - `packages/server/src/services/trade-approval.ts` — 승인/거부 로직
  - `packages/server/src/db/migrations/0044_order-status-pending-approval.sql` — enum 확장
- **수정 파일:**
  - `packages/server/src/services/vector-executor.ts` — 리스크 검증 강화 (동적 확신도/한도/비중/손실)
  - `packages/server/src/services/chief-of-staff.ts` — executionMode 분기 (autonomous/approval)
  - `packages/server/src/db/schema.ts` — orderStatusEnum에 'pending_approval' 추가
  - `packages/server/src/routes/workspace/strategy.ts` (또는 sns.ts 패턴처럼 신규) — 설정/승인 API
  - `packages/shared/src/types.ts` — RiskProfile, TradingSettings, TradeApprovalResult 타입
  - `packages/server/src/index.ts` — 라우트 등록 (필요 시)
- **기존 파일 수정 주의:**
  - `vector-executor.ts` — `validateOrder()` 시그니처 변경됨 → 기존 호출부 업데이트 필요
  - `chief-of-staff.ts` — tradingMode 'paper' 고정 → settings에서 동적 로드로 변경

### 테스트 패턴

- bun:test 사용
- **trading-settings.test.ts**: RISK_PROFILES 정확성, clampSetting 경계값, getTradingSettings/updateTradingSettings
- **trade-approval.test.ts**: savePendingOrders, approveOrder, rejectOrder, bulkApprove/bulkReject
- **vector-executor 확장 테스트**: 성향별 동적 확신도 검증, 종목 비중 검증, 일일 손실 검증
- **chief-of-staff 통합**: executionMode 분기 확인 (autonomous → 즉시 실행, approval → pending 저장)

### 기존 파일 절대 수정 금지

- `services/cio-orchestrator.ts` — CIO 분석 로직은 변경 불필요
- `services/kis-adapter.ts` — 재사용만
- `services/manager-delegate.ts` — 재사용만
- `services/delegation-tracker.ts` — 이벤트 추가는 가능하나 기존 메서드 변경 금지

### 중복 방지 — 기존 코드와의 관계

| 기존 코드 | 10-5 관계 |
|-----------|----------|
| `vector-executor.ts` → `validateOrder()` | 확장: 투자 성향 기반 동적 검증 추가 |
| `vector-executor.ts` → `executeProposals()` | 승인 모드일 때는 호출하지 않음 (approval 서비스가 대신 호출) |
| `chief-of-staff.ts` → CIO/VECTOR 분기 | tradingSettings 로드 + executionMode 분기 추가 |
| `companies.settings` JSONB | tradingSettings 네임스페이스에 저장 |

### References

- [Source: _bmad-output/planning-artifacts/prd.md - FR59 자율/승인 실행, FR60 투자 성향 리스크]
- [Source: _bmad-output/planning-artifacts/epics.md - E10-S5, E10-S8]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - B5 자동매매 승인 인라인 UI]
- [Source: packages/server/src/services/vector-executor.ts - 현재 VECTOR 실행 + 검증]
- [Source: packages/server/src/services/chief-of-staff.ts - CIO/VECTOR 파이프라인 통합점]
- [Source: packages/server/src/db/schema.ts - strategyOrders, companies.settings]
- [Source: /home/ubuntu/CORTHEX_HQ/web/trading_engine.py - v1 RISK_PROFILES 3종]
- [Source: /home/ubuntu/CORTHEX_HQ/src/tools/trading_settings_control.py - v1 설정 조회/변경/clamp]
- [Source: _bmad-output/implementation-artifacts/10-4-cio-vector-separation-orchestration.md - 이전 스토리]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- v1 RISK_PROFILES 3종 (보수/균형/공격) 분석 완료 — min/max/default 범위 포팅 설계
- v1 trading_settings_control.py 분석 완료 — get_settings/update_settings/get_risk_profile/clamp 패턴
- v2 현재 vector-executor.ts 분석: MIN_CONFIDENCE=0.6 고정, DEFAULT_DAILY_TRADE_LIMIT=20 고정 → 성향별 동적으로 변경 필요
- v2 chief-of-staff.ts 636행: tradingMode='paper' 고정 + executionMode 분기 없음 → 설정 기반 동적 분기 필요
- companies.settings JSONB 활용한 tradingSettings 저장 구조 설계
- 승인 모드 흐름 설계: CIO → pending_approval → CEO 승인 → VECTOR 실행
- orderStatusEnum에 'pending_approval' 추가 migration 설계
- 설정/승인 REST API 엔드포인트 설계

### File List

- `packages/server/src/services/trading-settings.ts` — **신규** 투자 성향 + 리스크 프로필 + 설정 관리
- `packages/server/src/services/trade-approval.ts` — **신규** 승인/거부 로직
- `packages/server/src/db/migrations/0044_order-status-pending-approval.sql` — **신규** enum 확장
- `packages/server/src/services/vector-executor.ts` — **수정** 리스크 검증 강화
- `packages/server/src/services/chief-of-staff.ts` — **수정** executionMode 분기
- `packages/server/src/db/schema.ts` — **수정** orderStatusEnum 확장
- `packages/server/src/routes/workspace/strategy.ts` — **수정/신규** 설정/승인 API
- `packages/shared/src/types.ts` — **수정** RiskProfile, TradingSettings 타입 추가
- `packages/server/src/index.ts` — **수정** 라우트 등록
- `packages/server/src/__tests__/unit/trading-settings.test.ts` — **신규** 설정 테스트
- `packages/server/src/__tests__/unit/trade-approval.test.ts` — **신규** 승인 테스트
