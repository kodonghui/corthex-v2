# Story 9.4: KIS 증권 도구 — 주식 시세 조회 + 잔고 조회 + 주문

Status: review

## Story

As a AI 에이전트 사용자,
I want 에이전트가 한국투자증권 API로 주식 시세 조회, 계좌 잔고 확인, 매매 주문을 할 수 있다,
so that 투자 의사결정과 주문 실행을 에이전트가 보조할 수 있다.

## Acceptance Criteria

1. `get_stock_price` 핸들러가 KIS API로 종목 현재가/등락률/거래량을 반환한다
2. `get_account_balance` 핸들러가 KIS API로 계좌 잔고(보유종목, 평가금액)를 반환한다
3. `place_stock_order` 핸들러가 KIS API로 매수/매도 주문을 실행하고 결과를 반환한다
4. 3개 핸들러 모두 registry.register()로 등록되고 credential 미등록 시 graceful degradation
5. credential-vault PROVIDER_SCHEMAS에 kis 이미 존재 (app_key, app_secret, account_no)
6. 시드 데이터에 3개 도구(category, tags, inputSchema 포함)가 등록된다
7. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: KIS API 토큰 발급 유틸 (AC: #1~3)
  - [x] KIS는 OAuth 토큰이 필요 — app_key+app_secret으로 접근토큰 발급
  - [x] 토큰 캐싱 로직 (유효 시간 내 재사용)
- [x] Task 2: get_stock_price 핸들러 (AC: #1, #4)
  - [x] `packages/server/src/lib/tool-handlers/builtins/get-stock-price.ts` 생성
  - [x] KIS 국내주식 현재가 API 호출, 종목코드 입력
  - [x] 결과: 종목명, 현재가, 등락률, 거래량
  - [x] `index.ts`에 import + register
- [x] Task 3: get_account_balance 핸들러 (AC: #2, #4)
  - [x] `packages/server/src/lib/tool-handlers/builtins/get-account-balance.ts` 생성
  - [x] KIS 계좌잔고 API 호출
  - [x] 결과: 보유종목 목록, 평가금액, 수익률
  - [x] `index.ts`에 import + register
- [x] Task 4: place_stock_order 핸들러 (AC: #3, #4)
  - [x] `packages/server/src/lib/tool-handlers/builtins/place-stock-order.ts` 생성
  - [x] KIS 주식주문 API 호출 (매수/매도, 종목코드, 수량, 가격)
  - [x] 결과: 주문번호, 상태
  - [x] `index.ts`에 import + register
- [x] Task 5: 시드 데이터 업데이트 (AC: #6)
  - [x] seed.ts에 3개 도구 추가 + 기존 'KIS 증권' placeholder 대체
- [x] Task 6: 빌드 확인 (AC: #7)
  - [x] `npx turbo build --force` 3/3 성공 확인

## Dev Notes

### KIS API 인증 패턴

KIS Open API는 OAuth 기반. 토큰 발급 후 API 호출에 사용.
```
POST https://openapi.koreainvestment.com:9443/oauth2/tokenP
Body: { grant_type: "client_credentials", appkey, appsecret }
Response: { access_token, token_type: "Bearer", expires_in: 86400 }
```

토큰 유효 시간: 24시간. 도구별로 매번 발급하면 비효율 → 간단한 인메모리 캐시.

### KIS API 엔드포인트

| 기능 | URL | TR_ID |
|------|-----|-------|
| 현재가 | `/uapi/domestic-stock/v1/quotations/inquire-price` | FHKST01010100 |
| 잔고 | `/uapi/domestic-stock/v1/trading/inquire-balance` | TTTC8434R |
| 주문 | `/uapi/domestic-stock/v1/trading/order-cash` | TTTC0802U(매수), TTTC0801U(매도) |

### KIS API 공통 헤더
```typescript
{
  'authorization': `Bearer ${accessToken}`,
  'appkey': creds.app_key,
  'appsecret': creds.app_secret,
  'tr_id': trId,
  'Content-Type': 'application/json; charset=utf-8',
}
```

### 시드 데이터 매핑

| 도구명 | category | tags |
|--------|----------|------|
| get_stock_price | finance | ["kis", "stock", "api", "market"] |
| get_account_balance | finance | ["kis", "stock", "api", "account"] |
| place_stock_order | finance | ["kis", "stock", "api", "trading"] |

### References

- [Source: packages/server/src/services/credential-vault.ts] — kis provider (app_key, app_secret, account_no)
- [Source: packages/server/src/db/seed.ts] — 기존 'KIS 증권' placeholder
- KIS Open API 공식문서 참조

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: kis-auth.ts — OAuth 토큰 발급 + 인메모리 캐시 (24시간 -60초)
- Task 2: get_stock_price — KIS 현재가 API (FHKST01010100), 종목명/현재가/등락률/거래량
- Task 3: get_account_balance — KIS 잔고 API (TTTC8434R), 보유종목/평가금액/수익률
- Task 4: place_stock_order — KIS 주문 API (매수 TTTC0802U/매도 TTTC0801U), 지정가/시장가
- Task 5: seed.ts에 3개 도구 추가 + 'KIS 증권' placeholder 대체
- Task 6: turbo build 3/3 성공

### File List

- packages/server/src/lib/tool-handlers/builtins/kis-auth.ts (신규)
- packages/server/src/lib/tool-handlers/builtins/get-stock-price.ts (신규)
- packages/server/src/lib/tool-handlers/builtins/get-account-balance.ts (신규)
- packages/server/src/lib/tool-handlers/builtins/place-stock-order.ts (신규)
- packages/server/src/lib/tool-handlers/index.ts (수정)
- packages/server/src/db/seed.ts (수정)
