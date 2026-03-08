# Story 10.1: Strategy Schema - Watchlist, Portfolio, Orders

Status: done

## Story

As a CEO/투자자,
I want 전략실에서 포트폴리오(보유 종목, 현금 잔고)와 매매 주문 이력을 관리하고, 실거래/모의거래를 분리할 수 있기를,
so that 투자 현황을 한눈에 파악하고, 모든 매매 기록을 영구 보존하여 감사 추적이 가능하다.

## Acceptance Criteria

1. **strategy_portfolios** 테이블이 생성되고 companyId 테넌트 격리가 적용된다
   - Given: 회사 A의 사용자가 포트폴리오를 생성
   - When: 회사 B의 사용자가 포트폴리오 목록 조회
   - Then: 회사 A의 데이터는 보이지 않는다

2. **strategy_orders** 테이블이 생성되고 모든 매매 주문이 영구 보존된다
   - Given: 매매 주문이 기록됨
   - When: 삭제 시도
   - Then: 삭제 불가 (soft delete도 금지, FR62)

3. 포트폴리오 CRUD API가 동작한다 (`/api/workspace/strategy/portfolios`)
   - GET: 목록 조회 (tradingMode 필터)
   - POST: 생성 (name, initialCash, tradingMode 필수)
   - PATCH /:id: 수정 (name, cashBalance, holdings)
   - GET /:id: 단건 조회

4. 주문 이력 API가 페이지네이션/필터와 함께 동작한다 (`/api/workspace/strategy/orders`)
   - GET: 목록 조회 (cursor 기반 페이지네이션, limit 기본 50)
   - 필터: dateFrom, dateTo, ticker, side(buy/sell), status, tradingMode
   - POST: 주문 기록 생성 (agentId, ticker, tickerName, side, quantity, price, orderType, tradingMode, status)

5. 모의거래(paper) 포트폴리오와 실거래(real) 포트폴리오가 완전 분리된다
   - Given: 사용자가 paper 모드 포트폴리오를 가짐
   - When: 모의거래 주문 생성
   - Then: paper 포트폴리오에만 반영, real 포트폴리오에 영향 없음

6. 기존 strategy_watchlists 테이블과 API는 변경 없이 유지된다

## Tasks / Subtasks

- [x] Task 1: strategy_portfolios 테이블 추가 (AC: #1, #5)
  - [x]1.1 schema.ts에 tradingModeEnum ('real', 'paper') 추가
  - [x]1.2 schema.ts에 orderSideEnum ('buy', 'sell') 추가
  - [x]1.3 schema.ts에 orderStatusEnum ('pending', 'submitted', 'executed', 'cancelled', 'rejected', 'failed') 추가
  - [x]1.4 schema.ts에 orderTypeEnum ('market', 'limit') 추가
  - [x]1.5 strategy_portfolios 테이블 정의 (id, companyId, userId, name, tradingMode, initialCash, cashBalance, holdings JSONB, totalValue, memo, createdAt, updatedAt)
  - [x]1.6 companyId + userId + tradingMode 인덱스 추가
  - [x]1.7 relations 정의

- [x] Task 2: strategy_orders 테이블 추가 (AC: #2)
  - [x]2.1 strategy_orders 테이블 정의 (id, companyId, userId, portfolioId, agentId nullable, ticker, tickerName, side, quantity, price, totalAmount, orderType, tradingMode, status, reason, kisOrderNo, executedAt, createdAt)
  - [x]2.2 companyId + createdAt DESC 인덱스 (시간순 조회 최적화)
  - [x]2.3 companyId + ticker 인덱스 (종목별 필터)
  - [x]2.4 companyId + tradingMode + status 인덱스
  - [x]2.5 relations 정의 (portfolio, agent, company, user)

- [x] Task 3: DB 마이그레이션 (AC: #1, #2)
  - [x]3.1 drizzle-kit generate로 마이그레이션 파일 생성
  - [x]3.2 drizzle-kit push로 스키마 반영

- [x] Task 4: Portfolio CRUD API (AC: #3, #5)
  - [x]4.1 GET /api/workspace/strategy/portfolios — 목록 조회 (tradingMode 쿼리 필터)
  - [x]4.2 POST /api/workspace/strategy/portfolios — 생성
  - [x]4.3 GET /api/workspace/strategy/portfolios/:id — 단건 조회
  - [x]4.4 PATCH /api/workspace/strategy/portfolios/:id — 수정
  - [x]4.5 Zod 스키마로 입력값 검증

- [x] Task 5: Order History API (AC: #4, #2)
  - [x]5.1 GET /api/workspace/strategy/orders — 목록 조회 (cursor 페이지네이션 + 필터)
  - [x]5.2 POST /api/workspace/strategy/orders — 주문 기록 생성
  - [x]5.3 GET /api/workspace/strategy/orders/:id — 단건 조회
  - [x]5.4 DELETE 엔드포인트 없음 (주문 영구 보존 FR62)
  - [x]5.5 GET /api/workspace/strategy/orders/summary — 요약 통계 (총 거래 수, 수익, 손실)

- [x] Task 6: 기존 전략실 라우트 통합 (AC: #6)
  - [x]6.1 strategy.ts에 portfolio 및 order 라우트 추가 (또는 별도 파일 후 mount)

## Dev Notes

### 기존 구현 현황 (이미 구현된 것)
- `strategy_watchlists` 테이블: `packages/server/src/db/schema.ts:577-589` — companyId, userId, stockCode, stockName, market + unique 제약
- `strategy_notes`, `strategy_note_shares`, `strategy_backtest_results` 테이블: schema.ts:591-632
- 전략실 라우트: `packages/server/src/routes/workspace/strategy.ts` — watchlist CRUD, 시세 조회(KIS), 차트 데이터, 노트 CRUD+공유, 백테스트 결과, 데이터 내보내기
- KIS 인증 유틸: `packages/server/src/lib/tool-handlers/builtins/kis-auth.ts`

### 새로 추가할 것
1. **strategy_portfolios 테이블**: v1의 `trading_portfolio` 키-값 방식을 정규화된 PostgreSQL 테이블로 업그레이드
   - v1: `{ cash, initial_cash, holdings: [{ticker, name, qty, avg_price, current_price}], updated_at }` (JSON 값)
   - v2: 정규 테이블 + holdings는 JSONB 컬럼 유지 (종목별 정규화는 과도한 복잡성)

2. **strategy_orders 테이블**: v1의 `trading_history` JSON 배열을 정규 테이블로 업그레이드
   - v1: `{ id, date, ticker, name, action, qty, price, total, pnl, strategy, status, order_no, market, reason }` (JSON 배열)
   - v2: 정규 테이블 + 인덱스 + 페이지네이션 + 필터 + 영구 보존(DELETE 없음)

3. **tradingMode 분리**: v1은 settings 플래그로 전환했지만, v2는 포트폴리오 레벨에서 real/paper 완전 분리
   - 포트폴리오마다 tradingMode 속성
   - 주문마다 tradingMode 속성 (어떤 포트폴리오에서 실행됐는지 추적)

### v1 코드 참조
- 포트폴리오 모델: `/home/ubuntu/CORTHEX_HQ/web/trading_engine.py` — `_default_portfolio()`, cash/holdings/initial_cash 구조
- 매매 기록 모델: `/home/ubuntu/CORTHEX_HQ/web/trading_engine.py` — trade_record, ticker/action/qty/price/pnl/order_no
- API 패턴: `/home/ubuntu/CORTHEX_HQ/web/handlers/trading_handler.py` — REST CRUD, `{ success, data }` 응답
- KIS 클라이언트: `/home/ubuntu/CORTHEX_HQ/web/kis_client.py` — OAuth2, place_order, get_balance
- 리스크 프로필: `/home/ubuntu/CORTHEX_HQ/web/trading_engine.py` — aggressive/balanced/conservative

### 아키텍처 제약사항
- 모든 테이블에 companyId FK + 인덱스 필수 (NFR10: tenant isolation)
- 주문 테이블에 DELETE 없음 (FR62: 영구 보존)
- API 응답 형식: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- 테넌트 미들웨어 `authMiddleware` 사용 (c.get('tenant')로 companyId/userId 접근)
- Zod 유효성 검증 (`@hono/zod-validator`)
- UUID primary keys (defaultRandom)

### Holdings JSONB 구조 (strategy_portfolios.holdings)

```typescript
type Holding = {
  ticker: string       // "005930"
  name: string         // "삼성전자"
  market: string       // "KR" | "US"
  quantity: number     // 보유 수량
  avgPrice: number     // 평단가
  currentPrice?: number // 최근 시세 (캐시, 갱신 시점)
}

// holdings = Holding[]
```

### 테스트 패턴
- bun:test 사용
- 파일 위치: `packages/server/src/__tests__/unit/`
- 파일명: `10-1-strategy-schema.test.ts` 패턴

### Project Structure Notes

- schema.ts에 추가 위치: strategy_backtest_results (line 632) 이후
- relations도 strategyBacktestResultsRelations (line 1039) 이후에 추가
- 라우트 추가: `packages/server/src/routes/workspace/strategy.ts` 에 추가하거나 별도 파일로 분리 후 mount
- 기존 라우트 구조 참고: 같은 strategy.ts 파일에 watchlist/notes/backtest가 모두 있으므로, portfolio/orders도 같은 파일에 추가하는 것이 일관적

### References

- [Source: _bmad-output/planning-artifacts/epics.md - Epic 10, E10-S1]
- [Source: _bmad-output/planning-artifacts/prd.md - FR56, FR61, FR62]
- [Source: _bmad-output/planning-artifacts/architecture.md - Data Architecture, Phase 2 tables]
- [Source: packages/server/src/db/schema.ts - strategy_watchlists, strategy_notes, strategy_backtest_results]
- [Source: packages/server/src/routes/workspace/strategy.ts - existing strategy routes]
- [Source: /home/ubuntu/CORTHEX_HQ/web/trading_engine.py - v1 portfolio/trading models]
- [Source: /home/ubuntu/CORTHEX_HQ/web/handlers/trading_handler.py - v1 API patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Watchlist schema+API already exists, no changes needed
- Portfolio and orders are the primary new additions
- v1 patterns comprehensively analyzed for v2 migration

### File List

- `packages/server/src/db/schema.ts` — Added tradingModeEnum, orderSideEnum, orderStatusEnum, orderTypeEnum, strategy_portfolios table, strategy_orders table, relations
- `packages/server/src/routes/workspace/strategy.ts` — Added portfolio CRUD API (GET/POST/GET/:id/PATCH/:id), order history API (GET with cursor pagination+filters, POST, GET/:id, GET/summary), no DELETE for orders (FR62)
- `packages/server/src/__tests__/unit/strategy-schema.test.ts` — 50 tests covering schema, portfolio CRUD, order API, tenant isolation, trading mode separation, edge cases
