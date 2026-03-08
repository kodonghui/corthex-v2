# Story 10.6: 실거래/모의거래 분리

Status: done

## Story

As a CEO(이사장),
I want 실거래와 모의거래 환경이 완전히 분리되어 있고, 실거래 전환 시 2단계 확인(비밀번호+확인)을 거쳐야 하며, 모의거래 포트폴리오를 독립적으로 초기화/관리할 수 있기를,
so that 실수로 실거래 주문이 전송되는 것을 구조적으로 방지하고, 새 전략을 모의거래로 먼저 테스트한 뒤 실거래로 전환할 수 있다.

## Acceptance Criteria

1. **거래 모드 설정 저장 (FR61)**
   - Given: CEO가 전략실에서 거래 모드를 변경할 때
   - When: "real(실거래)" 또는 "paper(모의거래)" 중 하나를 선택하면
   - Then: `companies.settings.tradingSettings.tradingMode`에 저장된다
   - And: 기본값은 "paper"(안전 우선)이다
   - And: 모든 매매 주문이 저장된 tradingMode로 실행된다

2. **실거래 전환 시 2단계 확인**
   - Given: 현재 모드가 "paper"이고 CEO가 "real"로 전환하려 할 때
   - When: PUT `/api/workspace/strategy/settings/trading-mode` API를 호출하면
   - Then: 1단계 — 비밀번호 재확인이 필요하다 (기존 JWT 비밀번호 검증 재사용)
   - And: 2단계 — `confirmationCode`("REAL_TRADING")를 body에 포함해야 한다
   - And: 두 단계 모두 통과해야만 tradingMode가 "real"로 변경된다
   - And: 변경 이력이 settingsHistory에 기록된다
   - And: 모의거래→실거래 전환 시 WebSocket으로 `strategy` 채널에 `mode:changed` 이벤트 전송

3. **모의거래→실거래 안전 전환: 위반 시 거부**
   - Given: 실거래 전환 요청 시
   - When: confirmationCode가 "REAL_TRADING"이 아니거나 비밀번호가 틀리면
   - Then: 요청이 거부되고 `{ success: false, error: { code: 'CONFIRMATION_REQUIRED' } }` 응답
   - And: 보안 로그에 실패 기록

4. **포트폴리오 모드 분리**
   - Given: 실거래/모의거래 각각 독립 포트폴리오가 존재할 때
   - When: 포트폴리오 조회 API를 호출하면
   - Then: 현재 tradingMode에 해당하는 포트폴리오만 반환된다
   - And: 실거래 포트폴리오는 KIS API 잔고와 동기화 가능하다
   - And: 모의거래 포트폴리오는 가상 잔고로 독립 운영된다

5. **모의거래 포트폴리오 초기화(리셋)**
   - Given: CEO가 모의거래 포트폴리오를 리셋하려 할 때
   - When: POST `/api/workspace/strategy/portfolio/reset` API를 호출하면
   - Then: 모의거래 포트폴리오의 cashBalance가 initialCapital(기본 1억)로 리셋된다
   - And: 모의거래 보유 종목이 전부 삭제된다
   - And: 모의거래 주문 이력은 보존된다 (감사 목적)
   - And: 실거래 포트폴리오는 영향 없다

6. **chief-of-staff tradingMode 동적 적용**
   - Given: CIO+VECTOR 파이프라인이 실행될 때
   - When: tradingSettings에서 tradingMode를 읽으면
   - Then: 현재 설정된 tradingMode로 주문이 실행된다 (기존 'paper' 하드코딩 제거)
   - And: autonomous 모드에서도 tradingMode가 적용된다
   - And: approval 모드에서도 pending 주문에 tradingMode가 기록된다

7. **KIS 상태 조회 API**
   - Given: 프론트엔드가 현재 거래 모드/KIS 연결 상태를 표시해야 할 때
   - When: GET `/api/workspace/strategy/trading-status` API를 호출하면
   - Then: 현재 tradingMode, KIS API 연결 여부, 계좌 표시(마스킹), 활성 모드를 반환한다

8. **모의거래 초기 자금 설정**
   - Given: CEO가 모의거래 초기 자금을 변경하려 할 때
   - When: PUT `/api/workspace/strategy/portfolio/initial-capital` API를 호출하면
   - Then: 초기 자금(KRW, 선택적 USD)이 설정된다
   - And: 다음 리셋 시 해당 금액으로 초기화된다

## Tasks / Subtasks

- [x] Task 1: TradingSettings에 tradingMode 추가 (AC: #1, #6)
  - [x]1.1 `packages/shared/src/types.ts`에 `TradingMode` 타입 추가 및 `TradingSettings`에 `tradingMode` 필드 추가
  - [x]1.2 `packages/server/src/services/trading-settings.ts` — `DEFAULT_TRADING_SETTINGS.tradingMode = 'paper'` 추가
  - [x]1.3 `getTradingSettings()`에서 `tradingMode` 반환 추가
  - [x]1.4 `updateTradingSettings()`에서 `tradingMode` 업데이트 지원

- [x] Task 2: 거래 모드 전환 API + 2단계 확인 (AC: #2, #3)
  - [x]2.1 `routes/workspace/strategy.ts`에 `PUT /settings/trading-mode` 라우트 추가
  - [x]2.2 요청 body: `{ mode: 'real' | 'paper', password: string, confirmationCode?: string }`
  - [x]2.3 paper→real 전환: 비밀번호 검증 + confirmationCode === 'REAL_TRADING' 검증
  - [x]2.4 real→paper 전환: 비밀번호만 검증 (confirmationCode 불필요)
  - [x]2.5 전환 성공 시 WebSocket `strategy` 채널에 `mode:changed` 이벤트 broadcast
  - [x]2.6 실패 시 감사 로그 기록 + 에러 응답

- [x] Task 3: chief-of-staff tradingMode 동적 적용 (AC: #6)
  - [x]3.1 `chief-of-staff.ts` 648행, 661행의 `tradingMode: 'paper'` 하드코딩을 `tradingSettings.tradingMode`로 변경
  - [x]3.2 `savePendingOrders()`와 `executeProposals()` 호출 시 tradingMode 전달 확인

- [x] Task 4: 모의거래 포트폴리오 리셋 API (AC: #5, #8)
  - [x]4.1 `routes/workspace/strategy.ts`에 `POST /portfolio/reset` 라우트 추가
  - [x]4.2 tradingMode === 'paper'인 포트폴리오만 리셋 (실거래 포트폴리오 보호)
  - [x]4.3 cashBalance를 initialCapital(기본 100,000,000)로 리셋
  - [x]4.4 holdings JSONB를 빈 배열로 리셋
  - [x]4.5 totalValue 재계산
  - [x]4.6 주문 이력(strategy_orders)은 삭제하지 않음
  - [x]4.7 `PUT /portfolio/initial-capital` 라우트 추가 — 초기 자금 설정

- [x] Task 5: KIS 상태 조회 API (AC: #7)
  - [x]5.1 `routes/workspace/strategy.ts`에 `GET /trading-status` 라우트 추가
  - [x]5.2 반환: tradingMode, kisAvailable(크리덴셜 존재 여부), account(마스킹), activeMode

- [x] Task 6: 포트폴리오 모드별 조회 강화 (AC: #4)
  - [x]6.1 기존 포트폴리오 조회 API에서 tradingMode 필터 적용 확인
  - [x]6.2 포트폴리오 생성 시 tradingMode가 올바르게 설정되는지 확인
  - [x]6.3 KIS 잔고 동기화는 tradingMode === 'real' 포트폴리오에만 적용

- [x] Task 7: 타입 정의 추가 (전체 AC)
  - [x]7.1 `packages/shared/src/types.ts`에 `TradingMode = 'real' | 'paper'` 추가
  - [x]7.2 `TradingSettings`에 `tradingMode: TradingMode` 필드 추가
  - [x]7.3 `TradingSettings`에 `initialCapital?: number` 필드 추가
  - [x]7.4 `TradingModeChangeRequest` 타입 추가

## Dev Notes

### v1의 거래 모드 분리 패턴

v1(`web/handlers/trading_handler.py`)의 핵심 패턴:
- `paper_trading: bool` — 기본값 True (안전)
- `enable_real: bool` — 실거래 활성화 여부
- `enable_mock: bool` — KIS 모의투자 활성화 여부
- 3가지 모드: 가상(DB only) / 모의투자(KIS mock) / 실거래(KIS real)
- v2에서는 **2가지 모드로 단순화**: paper(가상+모의) / real(실거래)

### 기존 코드와의 관계 — 수정 지점

| 기존 코드 | 수정 내용 |
|-----------|----------|
| `chief-of-staff.ts` — L648 `tradingMode: 'paper'` | `tradingSettings.tradingMode`로 변경 |
| `chief-of-staff.ts` — L661 `tradingMode: 'paper'` | `tradingSettings.tradingMode`로 변경 |
| `trading-settings.ts` — `DEFAULT_TRADING_SETTINGS` | `tradingMode: 'paper'` 필드 추가 |
| `trading-settings.ts` — `updateTradingSettings()` | `tradingMode` 업데이트 로직 추가 (일반 변경과 2단계 확인 분리) |
| `routes/workspace/strategy.ts` | 거래 모드 전환 + 포트폴리오 리셋 + KIS 상태 API 추가 |
| `packages/shared/src/types.ts` | `TradingMode`, `TradingSettings.tradingMode` 추가 |

### 2단계 확인 구현

```typescript
// PUT /api/workspace/strategy/settings/trading-mode
// Body: { mode: 'real' | 'paper', password: string, confirmationCode?: string }

// paper → real 전환 시:
// 1. JWT의 userId로 users 테이블에서 passwordHash 조회
// 2. bcrypt.compare(password, passwordHash) 검증
// 3. confirmationCode === 'REAL_TRADING' 검증
// 4. 둘 다 통과 → tradingMode 변경 + WebSocket 알림

// real → paper 전환 시:
// 1. 비밀번호만 검증 (안전한 방향이므로 confirmationCode 불필요)
// 2. tradingMode 변경
```

### 비밀번호 검증 — 기존 코드 재사용

비밀번호 해싱/검증은 기존 인증 시스템을 재사용:
- `packages/server/src/routes/auth.ts`에서 `Bun.password.verify()` 사용 중
- `users` 테이블의 `passwordHash` 필드 활용
- 별도 인증 서비스를 만들지 말고, 라우트 핸들러에서 직접 검증

### 포트폴리오 리셋 로직

```typescript
// POST /api/workspace/strategy/portfolio/reset
// tradingMode === 'paper'인 포트폴리오만 리셋
// 1. cashBalance = initialCapital (기본 100,000,000)
// 2. holdings = []  (JSONB)
// 3. totalValue = cashBalance
// 4. strategy_orders는 보존 (영구 감사 로그)
```

### tradingMode 동적 적용 — chief-of-staff.ts 수정

```typescript
// 기존 (L648, L661):
tradingMode: 'paper',

// 변경:
tradingMode: tradingSettings.tradingMode,
// tradingSettings는 이미 632행에서 로드됨 (const tradingSettings = await getTradingSettings(companyId))
```

### WebSocket 이벤트

```typescript
// 모드 전환 시 broadcast
broadcastToChannel(companyId, 'strategy', {
  type: 'mode:changed',
  data: {
    previousMode: 'paper',
    newMode: 'real',
    changedBy: userId,
    changedAt: new Date().toISOString(),
  },
})
```

### KIS 상태 API 응답 구조

```typescript
// GET /api/workspace/strategy/trading-status
{
  tradingMode: 'paper' | 'real',
  kisAvailable: boolean,     // KIS 크리덴셜 등록 여부
  account: '****1234',       // 계좌번호 마스킹
  activeMode: '모의거래' | '실거래',  // 표시용 한국어
}
```

### DB 변경 없음

- `tradingModeEnum`은 이미 schema.ts에 정의됨 (L30: `['real', 'paper']`)
- `strategyPortfolios.tradingMode`과 `strategyOrders.tradingMode`도 이미 존재
- 거래 모드 설정은 `companies.settings.tradingSettings.tradingMode`에 저장 (JSONB)
- **추가 마이그레이션 불필요**

### 기존 포트폴리오 API 확인

기존 `strategy.ts` 라우트에 이미 있는 포트폴리오 관련 API:
- `GET /portfolio` — 현재 포트폴리오 조회 (tradingMode 필터 확인 필요)
- `POST /orders` — 수동 주문
- 주문 조회 — 기존 API에서 tradingMode 필터 확인 필요

### 실거래 포트폴리오 KIS 잔고 동기화

기존 `getBalance()` 함수 (`kis-adapter.ts` L528)가 이미 tradingMode를 지원.
실거래 포트폴리오는 KIS API에서 실제 잔고를 가져와 strategy_portfolios에 동기화.

### 기존 파일 절대 수정 금지

- `services/cio-orchestrator.ts` — CIO 분석 로직 변경 불필요
- `services/kis-adapter.ts` — 이미 tradingMode 지원, 변경 불필요
- `services/vector-executor.ts` — 이미 tradingMode 파라미터 지원, 변경 불필요
- `services/trade-approval.ts` — 이미 tradingMode 파라미터 지원, 변경 불필요
- `db/schema.ts` — 이미 tradingModeEnum 정의됨, 변경 불필요

### 중복 방지

| 기존 코드 | 10-6 관계 |
|-----------|----------|
| `vector-executor.ts` → `VectorExecuteOptions.tradingMode` | 재사용: chief-of-staff가 동적으로 전달 |
| `kis-adapter.ts` → `executeOrder({ tradingMode })` | 재사용: 그대로 사용 |
| `trade-approval.ts` → `savePendingOrders({ tradingMode })` | 재사용: chief-of-staff가 동적으로 전달 |
| `trading-settings.ts` → `getTradingSettings()` | 확장: tradingMode 필드 추가 |
| `strategyPortfolios.tradingMode` | 재사용: 포트폴리오 분리 이미 지원 |

### Project Structure Notes

- **수정 파일:**
  - `packages/shared/src/types.ts` — TradingMode 타입, TradingSettings에 tradingMode 필드 추가
  - `packages/server/src/services/trading-settings.ts` — tradingMode 기본값, updateTradingSettings에 tradingMode 지원
  - `packages/server/src/services/chief-of-staff.ts` — L648, L661의 'paper' 하드코딩 제거
  - `packages/server/src/routes/workspace/strategy.ts` — 모드 전환/리셋/KIS 상태 API 추가
- **신규 파일 없음** — 기존 파일 확장만으로 충분

### 테스트 패턴

- bun:test 사용
- `__tests__/unit/trading-mode-separation.test.ts` — 신규 테스트 파일
  - 2단계 확인 로직 (비밀번호+confirmationCode)
  - tradingMode 변경 성공/실패
  - 포트폴리오 리셋 (paper만 리셋, real 보호)
  - chief-of-staff tradingMode 동적 적용
  - KIS 상태 조회
- 기존 테스트 수정 불필요 (기존 테스트는 tradingMode 파라미터를 이미 사용)

### References

- [Source: _bmad-output/planning-artifacts/prd.md - FR61 실거래/모의거래 분리]
- [Source: _bmad-output/planning-artifacts/epics.md - E10-S6]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - 실거래 빨간 헤더, 모의거래 파란 헤더, 2단계 확인]
- [Source: packages/server/src/services/chief-of-staff.ts - L648, L661 tradingMode 하드코딩]
- [Source: packages/server/src/services/trading-settings.ts - getTradingSettings, updateTradingSettings]
- [Source: packages/server/src/services/kis-adapter.ts - tradingMode 분기 지원]
- [Source: packages/server/src/services/vector-executor.ts - VectorExecuteOptions.tradingMode]
- [Source: packages/server/src/db/schema.ts - tradingModeEnum, strategyPortfolios, strategyOrders]
- [Source: /home/ubuntu/CORTHEX_HQ/web/handlers/trading_handler.py - v1 paper_trading/enable_real 패턴]
- [Source: _bmad-output/implementation-artifacts/10-5-autonomous-approval-execution-risk-control.md - 이전 스토리]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- All 7 tasks + subtasks implemented and verified
- TradingMode type added to shared types + TradingSettings extended
- trading-settings.ts: tradingMode='paper' default, initialCapital=100M, updateTradingSettings support
- chief-of-staff.ts: L648, L661 hardcoded 'paper' replaced with tradingSettings.tradingMode
- strategy.ts routes: PUT /settings/trading-mode (2-step confirmation), GET /trading-status, POST /portfolio/reset, PUT /portfolio/initial-capital
- 2-step confirmation: password + confirmationCode='REAL_TRADING' for paper→real transition
- Portfolio reset: only paper portfolios, preserves order history
- WebSocket broadcast on mode change via strategy channel
- 34 tests passing, 0 regressions
- v1 trading_handler.py 분석: paper_trading/enable_real/enable_mock 3모드 → v2는 2모드(paper/real)로 단순화
- v2 현재 chief-of-staff.ts L648, L661에서 tradingMode='paper' 하드코딩 → tradingSettings에서 동적 로드로 변경 필요
- schema.ts에 tradingModeEnum, strategyPortfolios/strategyOrders에 tradingMode 컬럼 이미 존재 → DB 마이그레이션 불필요
- kis-adapter.ts, vector-executor.ts, trade-approval.ts 모두 tradingMode 파라미터 이미 지원 → 수정 불필요
- TradingSettings에 tradingMode 필드 추가 + 2단계 확인 API 설계
- 포트폴리오 리셋은 paper 모드만 허용, real 포트폴리오 보호
- UX: 실거래=빨강, 모의거래=파랑/녹색 헤더로 시각 구분 (10-7 UI 스토리에서 구현)

### File List

- `packages/shared/src/types.ts` — **수정** TradingMode, TradingSettings.tradingMode 추가
- `packages/server/src/services/trading-settings.ts` — **수정** tradingMode 기본값 + 변경 지원
- `packages/server/src/services/chief-of-staff.ts` — **수정** tradingMode 하드코딩 제거
- `packages/server/src/routes/workspace/strategy.ts` — **수정** 모드 전환/리셋/KIS 상태 API
- `packages/server/src/__tests__/unit/trading-mode-separation.test.ts` — **신규** 테스트
