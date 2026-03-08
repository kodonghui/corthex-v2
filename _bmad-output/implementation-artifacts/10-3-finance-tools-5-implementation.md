# Story 10.3: Finance 도구 5종 구현 (kr_stock, dart_api, sec_edgar, backtest_engine, kis_trading)

Status: ready-for-dev

## Story

As a CIO/투자 분석 에이전트,
I want 한국 주식 시세(kr_stock), DART 전자공시(dart_api), SEC EDGAR 미국 공시(sec_edgar), 전략 백테스트(backtest_engine), KIS 매매 통합(kis_trading) 5종 재무 도구를 ToolPool에서 사용할 수 있기를,
so that 투자 분석, 공시 조회, 전략 검증, 자동매매를 도구 호출로 실행하여 전략실 워크플로우를 자동화할 수 있다.

## Acceptance Criteria

1. **kr_stock 도구 — 한국 주식 데이터**
   - Given: KIS 자격증명이 등록되어 있을 때
   - When: `kr_stock` 도구를 `action="price"`, `stockCode="005930"` 으로 호출하면
   - Then: 현재가, 전일대비, 거래량, 시가, 고가, 저가가 반환된다
   - And: `action="chart"` 으로 호출하면 일봉 OHLCV 데이터 배열(최대 100일)이 반환된다
   - And: `action="indices"` 로 KOSPI/KOSDAQ 지수 조회가 가능하다

2. **dart_api 도구 — DART 전자공시**
   - Given: DART API 키가 등록되어 있을 때
   - When: `dart_api` 도구를 `action="financial"`, `corpCode="00126380"` 으로 호출하면
   - Then: 최근 사업년도 재무제표(매출, 영업이익, 순이익, 자산, 부채)가 반환된다
   - And: `action="company"` 로 기업 기본정보(대표자, 업종, 주소)가 반환된다
   - And: `action="disclosure"` 로 최근 공시 목록이 반환된다

3. **sec_edgar 도구 — SEC 미국 공시**
   - Given: 도구가 등록되어 있을 때 (API 키 불필요 — SEC EDGAR는 무료)
   - When: `sec_edgar` 도구를 `action="filings"`, `ticker="AAPL"` 으로 호출하면
   - Then: 최근 SEC 공시(10-K, 10-Q, 8-K 등) 목록이 반환된다
   - And: `action="insider"` 로 Form 4 내부자 거래 내역이 반환된다
   - And: `action="company"` 로 CIK 번호와 기업 정보가 반환된다

4. **backtest_engine 도구 — 전략 백테스트**
   - Given: 백테스트할 종목과 전략이 지정되었을 때
   - When: `backtest_engine` 도구를 `action="backtest"`, `strategy="golden_cross"`, `stockCode="005930"` 으로 호출하면
   - Then: 최종자산, 총수익률, MDD, 승률, 거래횟수가 반환된다
   - And: `action="compare"` 로 여러 전략을 동시 비교할 수 있다
   - And: 지원 전략: golden_cross, rsi, macd, buy_and_hold

5. **kis_trading 도구 — KIS 매매 래핑**
   - Given: KIS 자격증명이 등록되어 있을 때
   - When: `kis_trading` 도구를 `action="buy"`, `stockCode="005930"`, `quantity=10`, `price=70000` 으로 호출하면
   - Then: KIS 어댑터를 통해 매수 주문이 실행되고 결과가 반환된다
   - And: `action="sell"` 로 매도 주문이 가능하다
   - And: `action="balance"` 로 계좌 잔고가 조회된다
   - And: `action="overseas_price"` 로 해외 시세가 조회된다

6. **ToolPool 등록 + 기존 도구 중복 방지**
   - Given: 5종 도구가 모두 구현되었을 때
   - When: 서버가 시작되면
   - Then: `kr_stock`, `dart_api`, `sec_edgar`, `backtest_engine`, `kis_trading` 5개가 registry에 등록된다
   - And: 기존 `get_stock_price`, `place_stock_order`, `get_account_balance`, `company_analyzer` 도구와 기능이 중복되지 않는다 (기존 도구는 간단 조회, 신규 도구는 다양한 action 지원)

## Tasks / Subtasks

- [ ] Task 1: kr_stock 도구 구현 (AC: #1)
  - [ ] 1.1 `packages/server/src/lib/tool-handlers/builtins/kr-stock.ts` 생성
  - [ ] 1.2 action="price": KIS API `/uapi/domestic-stock/v1/quotations/inquire-price` 호출 (기존 get-stock-price.ts 참고)
  - [ ] 1.3 action="chart": KIS API `/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice` 호출 (일봉 OHLCV)
  - [ ] 1.4 action="indices": KOSPI(0001)/KOSDAQ(1001) 지수 조회 — FID_COND_MRKT_DIV_CODE='U'

- [ ] Task 2: dart_api 도구 구현 (AC: #2)
  - [ ] 2.1 `packages/server/src/lib/tool-handlers/builtins/dart-api.ts` 생성
  - [ ] 2.2 action="financial": DART API `/api/fnlttSinglAcnt.json` (단일회사 재무제표)
  - [ ] 2.3 action="company": DART API `/api/company.json` (기업 기본정보)
  - [ ] 2.4 action="disclosure": DART API `/api/list.json` (공시 목록)

- [ ] Task 3: sec_edgar 도구 구현 (AC: #3)
  - [ ] 3.1 `packages/server/src/lib/tool-handlers/builtins/sec-edgar.ts` 생성
  - [ ] 3.2 action="filings": SEC EDGAR API `https://efts.sec.gov/LATEST/search-index?q=...&dateRange=custom&startdt=...&enddt=...&forms=10-K,10-Q,8-K` → 실제는 `https://efts.sec.gov/LATEST/search-index?q={ticker}&forms={type}`
  - [ ] 3.3 action="insider": SEC EDGAR `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={ticker}&type=4&dateb=&owner=include&count=10`
  - [ ] 3.4 action="company": SEC EDGAR company tickers JSON `https://www.sec.gov/files/company_tickers.json`

- [ ] Task 4: backtest_engine 도구 구현 (AC: #4)
  - [ ] 4.1 `packages/server/src/lib/tool-handlers/builtins/backtest-engine.ts` 생성
  - [ ] 4.2 action="backtest": 종목의 일봉 데이터로 전략별 시뮬레이션 (순수 TypeScript 계산)
  - [ ] 4.3 전략 구현: golden_cross (5일/20일 이동평균), rsi (14일, 30/70 경계), macd (12/26/9), buy_and_hold
  - [ ] 4.4 action="compare": 동일 종목에 여러 전략 병렬 실행 후 비교 표
  - [ ] 4.5 성과 지표: 최종자산, 총수익률, MDD, 승률, 거래횟수

- [ ] Task 5: kis_trading 도구 구현 (AC: #5)
  - [ ] 5.1 `packages/server/src/lib/tool-handlers/builtins/kis-trading.ts` 생성
  - [ ] 5.2 action="buy"/"sell": kis-adapter.ts의 `executeOrder()` 래핑
  - [ ] 5.3 action="balance": kis-adapter.ts의 `getBalance()` 래핑
  - [ ] 5.4 action="overseas_price": kis-adapter.ts의 `getOverseasPrice()` 래핑
  - [ ] 5.5 action="order_status": kis-adapter.ts의 `syncOrderStatus()` 래핑

- [ ] Task 6: ToolPool 등록 (AC: #6)
  - [ ] 6.1 `packages/server/src/lib/tool-handlers/index.ts`에 5개 도구 import + registry.register()
  - [ ] 6.2 등록명: `kr_stock`, `dart_api`, `sec_edgar`, `backtest_engine`, `kis_trading`

## Dev Notes

### 기존 구현 — 중복 방지 필수

**이미 존재하는 도구 (건드리지 말 것):**

| 기존 도구 | 파일 | 역할 | 신규 도구와의 관계 |
|-----------|------|------|-------------------|
| `get_stock_price` | `builtins/get-stock-price.ts` | KIS로 국내 주식 현재가 1종목 조회 | `kr_stock`는 action 기반 다기능 (차트/지수 추가) |
| `place_stock_order` | `builtins/place-stock-order.ts` | KIS 어댑터로 단건 주문 | `kis_trading`은 action 기반 (잔고/해외시세/상태 추가) |
| `get_account_balance` | `builtins/get-account-balance.ts` | KIS 잔고 조회 | `kis_trading.action="balance"`와 기능 동일하나 별도 유지 |
| `company_analyzer` | `builtins/company-analyzer.ts` | DART로 기업정보/공시 조회 | `dart_api`가 더 상세한 재무제표 추가. company_analyzer는 간단 조회 유지 |
| `market_overview` | `builtins/market-overview.ts` | Serper로 시장 뉴스 검색 | `kr_stock.action="indices"`는 KIS API 기반 실시간 지수 |

**핵심**: 기존 도구 코드를 수정하지 말 것. 신규 도구는 더 풍부한 action을 제공하는 별도 도구.

### KIS API 엔드포인트 참조 (kr_stock용)

```
현재가: /uapi/domestic-stock/v1/quotations/inquire-price
  TR_ID: FHKST01010100
  params: FID_COND_MRKT_DIV_CODE=J, FID_INPUT_ISCD={stockCode}

일봉차트: /uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice
  TR_ID: FHKST03010100
  params: FID_COND_MRKT_DIV_CODE=J, FID_INPUT_ISCD={stockCode},
          FID_INPUT_DATE_1={startDate}, FID_INPUT_DATE_2={endDate},
          FID_PERIOD_DIV_CODE=D

지수: /uapi/domestic-stock/v1/quotations/inquire-index-price
  TR_ID: FHPUP02100000
  params: FID_COND_MRKT_DIV_CODE=U, FID_INPUT_ISCD={0001=KOSPI,1001=KOSDAQ}
```

### DART API 참조 (dart_api용)

```
Base: https://opendart.fss.or.kr/api
인증: crtfc_key={DART_API_KEY} (query param)

재무제표: /fnlttSinglAcnt.json
  params: crtfc_key, corp_code, bsns_year, reprt_code(11013=1분기,11012=반기,11014=3분기,11011=사업보고서)

기업정보: /company.json
  params: crtfc_key, corp_code

공시목록: /list.json
  params: crtfc_key, corp_code, bgn_de(시작일), end_de(종료일), page_count
```

### SEC EDGAR API 참조 (sec_edgar용)

```
SEC EDGAR는 API 키 불필요. User-Agent 헤더 필수 (SEC 정책).
User-Agent: "CORTHEX/2.0 (contact@example.com)"

EDGAR Full-Text Search: https://efts.sec.gov/LATEST/search-index?q={query}&forms={10-K,10-Q,8-K}&dateRange=custom
Company Search: https://www.sec.gov/cgi-bin/browse-edgar?company={name}&CIK={cik}&type={form_type}&dateb=&owner=include&count={n}&action=getcompany&output=atom
Company Tickers: https://www.sec.gov/files/company_tickers.json (CIK 매핑)

주의: SEC는 rate limit 10 req/sec. AbortSignal.timeout(15_000) 사용.
```

### 백테스트 엔진 설계 (backtest_engine용)

v1에서는 pykrx/pandas 의존. v2는 순수 TypeScript로 구현:

```typescript
// 데이터 소스: kr_stock의 chart action으로 일봉 OHLCV 가져옴
// 또는 KIS API 직접 호출

// 전략 인터페이스
type Strategy = {
  name: string
  signal: (prices: OHLCV[], index: number) => 'buy' | 'sell' | 'hold'
}

// 성과 지표 계산
type BacktestResult = {
  strategy: string
  initialCapital: number
  finalCapital: number
  totalReturn: number     // %
  mdd: number             // % (Maximum Drawdown)
  winRate: number          // %
  tradeCount: number
  trades: Array<{ date: string; action: string; price: number; quantity: number }>
}
```

**이동평균 계산**: 단순 합계/N. 라이브러리 없이 직접 계산.
**RSI 계산**: 14일 기본. gain/loss 분리 → average gain/loss → RS → RSI
**MACD 계산**: EMA(12) - EMA(26), Signal=EMA(9 of MACD)

### kis_trading 도구 — 래핑 패턴

kis-adapter.ts의 함수를 그대로 호출. 복잡한 로직 없음:

```typescript
import { executeOrder, getBalance, syncOrderStatus, getOverseasPrice } from '../../../services/kis-adapter'

// action="buy" → executeOrder({ ...input, side: 'buy' })
// action="sell" → executeOrder({ ...input, side: 'sell' })
// action="balance" → getBalance(ctx.companyId, ctx.userId, tradingMode)
// action="overseas_price" → getOverseasPrice(ctx.companyId, ctx.userId, symbol, exchange)
// action="order_status" → syncOrderStatus(ctx.companyId, ctx.userId, orderId)
```

### ToolHandler 패턴 (필수 준수)

```typescript
import type { ToolHandler } from '../types'

export const toolName: ToolHandler = async (input, ctx) => {
  // 1. input에서 파라미터 추출 (String(), Number() 캐스팅)
  // 2. 필수 파라미터 검증 → 없으면 JSON.stringify({ success: false, message: '...' })
  // 3. ctx.getCredentials(provider) 로 API 키 획득
  // 4. 외부 API 호출 (fetch + AbortSignal.timeout)
  // 5. 결과를 JSON.stringify({ success: true, ... }) 로 반환
  // 6. 에러 catch → JSON.stringify({ success: false, message: '...' })
}
```

### 자격증명 provider 매핑

| 도구 | provider | 필드 |
|------|----------|------|
| kr_stock | `kis` | app_key, app_secret |
| dart_api | `dart` | api_key |
| sec_edgar | 없음 (무료 API) | — |
| backtest_engine | `kis` (차트 데이터용) | app_key, app_secret |
| kis_trading | `kis` | app_key, app_secret, account_no |

### 테스트 패턴

- bun:test 사용
- 파일: `packages/server/src/__tests__/unit/finance-tools.test.ts`
- 모든 외부 API 호출은 fetch mock
- 각 도구별 describe 블록
- 각 action별 테스트 케이스
- 에러 케이스: 자격증명 없음, API 오류, 잘못된 action, 필수 파라미터 누락

### Project Structure Notes

- 신규 파일 5개: `builtins/kr-stock.ts`, `builtins/dart-api.ts`, `builtins/sec-edgar.ts`, `builtins/backtest-engine.ts`, `builtins/kis-trading.ts`
- 수정 파일 1개: `tool-handlers/index.ts` (import + register 5줄)
- 테스트 1개: `__tests__/unit/finance-tools.test.ts`
- **기존 파일 수정 금지**: get-stock-price.ts, place-stock-order.ts, company-analyzer.ts 등

### v1 참조 파일

| v1 파일 | v2 대응 도구 | 핵심 포팅 사항 |
|---------|-------------|---------------|
| `/home/ubuntu/CORTHEX_HQ/src/tools/kr_stock.py` | kr_stock | action: price, ohlcv→chart, indicators(생략), market_cap(생략) |
| `/home/ubuntu/CORTHEX_HQ/src/tools/dart_api.py` | dart_api | action: financial, company, disclosure |
| `/home/ubuntu/CORTHEX_HQ/src/tools/sec_edgar.py` | sec_edgar | action: filings, insider, company (institutional은 생략) |
| `/home/ubuntu/CORTHEX_HQ/src/tools/backtest_engine.py` | backtest_engine | action: backtest, compare |
| `/home/ubuntu/CORTHEX_HQ/src/tools/trading_executor.py` | kis_trading | action: buy, sell, balance, overseas_price, order_status |

### References

- [Source: _bmad-output/planning-artifacts/epics.md - Epic 10, E10-S3, FR26]
- [Source: _bmad-output/implementation-artifacts/10-2-kis-securities-api-adapter.md - 이전 스토리]
- [Source: packages/server/src/lib/tool-handlers/types.ts - ToolHandler, ToolExecContext 타입]
- [Source: packages/server/src/lib/tool-handlers/registry.ts - HandlerRegistry 클래스]
- [Source: packages/server/src/lib/tool-handlers/index.ts - 도구 등록 패턴]
- [Source: packages/server/src/lib/tool-handlers/builtins/get-stock-price.ts - KIS 시세 조회 패턴]
- [Source: packages/server/src/lib/tool-handlers/builtins/company-analyzer.ts - DART API 호출 패턴]
- [Source: packages/server/src/lib/tool-handlers/builtins/market-overview.ts - action 기반 도구 패턴]
- [Source: packages/server/src/services/kis-adapter.ts - KIS 어댑터 서비스]
- [Source: packages/server/src/lib/tool-handlers/builtins/kis-auth.ts - KIS 인증/토큰/헤더]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- v1 파이썬 도구 5종 분석 완료: kr_stock, dart_api, sec_edgar, backtest_engine, trading_executor
- 기존 v2 도구 분석 완료: 중복 방지를 위한 기존 5개 도구와의 관계 정리
- KIS API 엔드포인트 3종 확인 (현재가, 일봉, 지수)
- DART API 엔드포인트 3종 확인 (재무제표, 기업정보, 공시)
- SEC EDGAR 무료 API 3종 확인 (풀텍스트검색, 회사검색, CIK매핑)
- 백테스트 엔진은 순수 TypeScript (v1의 pykrx/pandas 의존 제거)
- kis_trading은 kis-adapter.ts 래핑 패턴으로 단순화

### File List

- `packages/server/src/lib/tool-handlers/builtins/kr-stock.ts` — **신규** 한국 주식 시세/차트/지수
- `packages/server/src/lib/tool-handlers/builtins/dart-api.ts` — **신규** DART 재무제표/기업정보/공시
- `packages/server/src/lib/tool-handlers/builtins/sec-edgar.ts` — **신규** SEC EDGAR 공시/내부자거래/기업
- `packages/server/src/lib/tool-handlers/builtins/backtest-engine.ts` — **신규** 전략 백테스트/비교
- `packages/server/src/lib/tool-handlers/builtins/kis-trading.ts` — **신규** KIS 매매/잔고/해외시세 래핑
- `packages/server/src/lib/tool-handlers/index.ts` — **수정** 5개 도구 import + register
- `packages/server/src/__tests__/unit/finance-tools.test.ts` — **신규** 테스트
