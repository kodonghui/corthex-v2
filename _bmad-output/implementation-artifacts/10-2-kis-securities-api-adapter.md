# Story 10.2: KIS Securities API Adapter (시세 + 주문 + 잔고)

Status: done

## Story

As a CEO/투자자,
I want KIS 증권 API를 통해 한국/미국 시장의 실시간 시세 조회, 매수/매도 주문 실행, 체결 확인, 계좌 잔고 조회를 할 수 있기를,
so that CIO 분석 결과를 바탕으로 VECTOR가 자동/수동 매매를 실행하고, 포트폴리오 상태를 실시간으로 파악할 수 있다.

## Acceptance Criteria

1. **KIS API 클라이언트 확장 — 실거래/모의거래 분리**
   - Given: 포트폴리오의 tradingMode가 'paper'일 때
   - When: 주문을 실행하면
   - Then: 모의투자 서버(openapivts:29443)로 요청이 전송되고, 모의투자 전용 TR_ID(V 접두사)가 사용된다
   - And: 실거래(openapi:9443) 서버에는 어떤 요청도 전송되지 않는다

2. **국내 주식 주문 실행 — 신규 TR_ID 적용**
   - Given: KIS 자격증명이 등록되어 있을 때
   - When: 국내 주식 매수/매도 주문을 요청하면
   - Then: 신규 TR_ID(매수: TTTC0012U/VTTC0012U, 매도: TTTC0011U/VTTC0011U)로 주문이 실행된다
   - And: 주문 결과(주문번호, 체결시각, 상태)가 strategy_orders 테이블에 자동 기록된다

3. **해외(미국) 주식 주문 실행**
   - Given: KIS 자격증명이 등록되어 있을 때
   - When: 미국 주식 매수/매도 주문을 요청하면
   - Then: 해외 주문 엔드포인트(/uapi/overseas-stock/v1/trading/order)로 요청이 전송된다
   - And: 거래소 코드(NASD/NYSE/AMEX)가 자동 매핑된다

4. **계좌 잔고 조회 API**
   - Given: KIS 자격증명이 등록되어 있을 때
   - When: 잔고 조회 API를 호출하면
   - Then: 현금잔고(nxdy_excc_amt), 보유종목 목록(종목코드/이름/수량/평단가/현재가/평가손익), 총 평가액이 반환된다
   - And: 토큰 만료 시 자동 갱신 후 재시도한다

5. **주문 상태 조회 API**
   - Given: 주문이 접수된 상태에서
   - When: 주문 상태 조회 API를 호출하면
   - Then: KIS API에서 최신 체결 상태(미체결/전량체결/일부체결)를 가져와 strategy_orders 상태를 업데이트한다

6. **Paper Trading 모드 — 가상 실행**
   - Given: Paper trading 모드에서 KIS API 자격증명이 없을 때
   - When: 주문을 실행하면
   - Then: 현재 시세를 기반으로 가상 체결하고, 포트폴리오 holdings를 업데이트한다
   - And: 주문 상태는 즉시 'executed'로 설정된다

7. **오류 처리 및 장시간 외 검증**
   - Given: 한국 시장 운영 시간(09:00-15:30 KST) 외에
   - When: 실거래 주문을 시도하면
   - Then: 경고 메시지와 함께 주문이 거부된다 (모의거래는 허용)

## Tasks / Subtasks

- [x] Task 1: KIS API 클라이언트 리팩터링 (AC: #1, #2, #3)
  - [x] 1.1 kis-auth.ts 확장 — 실거래/모의거래 base URL 분리 (KIS_BASE_REAL, KIS_BASE_PAPER)
  - [x] 1.2 신규 TR_ID 매핑 객체 생성 (국내: TTTC0012U/0011U, 해외: TTTT1002U/1006U + 모의 V 접두사)
  - [x] 1.3 해외 주식 거래소 코드 매핑 (주문용: NASD/NYSE/AMEX, 시세용: NAS/NYS/AMS)
  - [x] 1.4 토큰 캐시 개선 — 실거래/모의거래 별도 캐시 (v1 패턴)

- [x] Task 2: KIS 어댑터 서비스 생성 (AC: #1-#5)
  - [x] 2.1 `packages/server/src/services/kis-adapter.ts` 생성
  - [x] 2.2 `executeOrder(params)` — 국내/해외 자동 분기, tradingMode로 base URL/TR_ID 분기
  - [x] 2.3 `getBalance(companyId, userId, tradingMode)` — 계좌 잔고 조회
  - [x] 2.4 `getOrderStatus(companyId, userId, orderNo)` — 미체결 확인
  - [x] 2.5 `getOverseasPrice(symbol, exchange)` — 해외 주식 현재가 조회
  - [x] 2.6 주문 실행 시 strategy_orders 자동 기록 + 포트폴리오 holdings 업데이트

- [x] Task 3: Paper Trading 엔진 (AC: #6)
  - [x] 3.1 자격증명 없이도 동작하는 가상 체결 로직
  - [x] 3.2 현재 시세 기반 즉시 체결 (시장가) 또는 지정가 대기
  - [x] 3.3 가상 체결 시 포트폴리오 cashBalance/holdings 자동 업데이트
  - [x] 3.4 잔고 부족 시 주문 거부

- [x] Task 4: API 라우트 추가 (AC: #4, #5)
  - [x] 4.1 `POST /api/workspace/strategy/execute-order` — 주문 실행 (국내/해외/실거래/모의)
  - [x] 4.2 `GET /api/workspace/strategy/balance` — 계좌 잔고 조회
  - [x] 4.3 `GET /api/workspace/strategy/order-status/:id` — 주문 상태 조회 + 동기화
  - [x] 4.4 `GET /api/workspace/strategy/overseas-price` — 해외 주식 시세 조회
  - [x] 4.5 Zod 입력값 검증 + 에러 코드 체계

- [x] Task 5: 시장 시간 검증 + 에러 처리 (AC: #7)
  - [x] 5.1 한국 시장: 평일 09:00-15:30 KST (공휴일은 체크 불가, 에러 시 KIS가 거부)
  - [x] 5.2 미국 시장: 평일 09:30-16:00 EST (+ 프리/애프터마켓 옵션)
  - [x] 5.3 네트워크 타임아웃(30초), API 에러, 토큰 만료 자동 갱신
  - [x] 5.4 rate limit 대응 — 토큰 발급 1분당 1회 제한 (65초 쿨다운)

- [x] Task 6: place-stock-order 도구 업데이트 (AC: #2)
  - [x] 6.1 기존 place-stock-order.ts 도구에 KIS 어댑터 서비스 연동
  - [x] 6.2 tradingMode 파라미터 추가 (기본값: paper)
  - [x] 6.3 해외 주식 주문 지원 (market 파라미터)
  - [x] 6.4 주문 결과를 strategy_orders에 자동 기록

## Dev Notes

### 기존 구현 현황 (이미 구현된 것 — 건드리지 말 것)

1. **kis-auth.ts** (`packages/server/src/lib/tool-handlers/builtins/kis-auth.ts`)
   - `getKisToken()`: OAuth2 토큰 발급 + 메모리 캐시
   - `kisHeaders()`: KIS API 헤더 생성
   - `KIS_BASE_URL`: 실거래 서버만 하드코딩됨 → **확장 필요**

2. **place-stock-order.ts** (`packages/server/src/lib/tool-handlers/builtins/place-stock-order.ts`)
   - 국내 주식 매수/매도 기본 동작
   - **문제점**: 구 TR_ID(TTTC0802U/0801U) 사용 중 → v1에서 이미 신 TR_ID로 전환했음
   - **문제점**: strategy_orders에 기록하지 않음
   - **문제점**: 모의거래 미지원

3. **strategy.ts 라우트** (`packages/server/src/routes/workspace/strategy.ts`)
   - `/prices`: 국내 주식 시세 조회 (동작 중)
   - `/chart-data`: 일봉 차트 데이터 (동작 중)
   - Portfolio CRUD + Order CRUD (Story 10-1에서 구현, 동작 중)

4. **credential-vault.ts** (`packages/server/src/services/credential-vault.ts`)
   - KIS provider: `['app_key', 'app_secret', 'account_no']` 필드 지원
   - `getCredentials(companyId, 'kis', userId)` 호출로 복호화

### v1에서 반드시 가져올 패턴 (핵심!)

**v1 파일**: `/home/ubuntu/CORTHEX_HQ/web/kis_client.py` (700+ lines)

1. **신규 TR_ID (2025년 필수 — 구 TR_ID는 차단됨!)**
   ```
   국내 매수: TTTC0012U (실) / VTTC0012U (모의)  ← 구: TTTC0802U
   국내 매도: TTTC0011U (실) / VTTC0011U (모의)  ← 구: TTTC0801U
   국내 잔고: TTTC8434R (실) / VTTC8434R (모의)
   해외 매수: TTTT1002U (실) / VTTT1002U (모의)
   해외 매도: TTTT1006U (실) / VTTT1006U (모의)
   해외 시세: HHDFS00000300 (공통)
   해외 잔고: TTTS3012R (실) / VTTS3012R (모의)
   ```

2. **거래소 코드 매핑 (주문용 vs 시세용 다름!)**
   ```
   주문용 (OVRS_EXCG_CD): NASD, NYSE, AMEX
   시세용 (EXCD): NAS, NYS, AMS ← 주문용과 다름! 혼동 금지
   ```

3. **잔고 조회 핵심 필드**
   ```
   현금: output2[0].nxdy_excc_amt (익일정산금 = 실제 주문 가능한 현금)
   ⚠️ dnca_tot_amt는 미결제 금액 포함 — 사용 금지
   보유종목: output1[].pdno(종목코드), prdt_name(이름), hldg_qty(수량),
             pchs_avg_pric(평단가), prpr(현재가), evlu_pfls_amt(평가손익)
   총 평가: output2[0].tot_evlu_amt
   ```

4. **주문 요청 body 필수 필드 (v1에서 검증됨)**
   ```
   국내: CANO, ACNT_PRDT_CD, PDNO, ORD_DVSN, ORD_QTY, ORD_UNPR,
         SLL_TYPE("01"=매도, ""=매수), EXCG_ID_DVSN_CD("KRX")
   해외: CANO, ACNT_PRDT_CD, OVRS_EXCG_CD, PDNO, ORD_DVSN("00"=지정가),
         ORD_QTY, OVRS_ORD_UNPR(소수점 2자리), SLL_TYPE("00"=매도, ""=매수),
         ORD_SVR_DVSN_CD("0")
   ```

5. **토큰 발급 제한**: 1분당 1회 (EGW00133) → 65초 쿨다운 필수
6. **토큰 만료 시 자동 재발급**: msg_cd == "EGW00123" 감지 → 캐시 삭제 → 재발급 → 1회 재시도

### 아키텍처 제약사항

- **테넌트 격리**: 모든 쿼리에 companyId WHERE 절 필수
- **자격증명**: `getCredentials(companyId, 'kis', userId)` — 사용자별 > 회사별 우선순위
- **API 응답**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **인증 미들웨어**: `authMiddleware` → `c.get('tenant')` 로 companyId/userId 접근
- **Zod 검증**: `@hono/zod-validator`
- **주문 영구 보존**: DELETE 엔드포인트 없음 (FR62)
- **파일명**: kebab-case 소문자

### 새로 생성할 파일

| 파일 | 설명 |
|------|------|
| `packages/server/src/services/kis-adapter.ts` | KIS API 어댑터 서비스 (주문/잔고/시세/상태 조회) |

### 수정할 파일

| 파일 | 변경 내용 |
|------|----------|
| `packages/server/src/lib/tool-handlers/builtins/kis-auth.ts` | 실/모의 base URL 분리, 별도 토큰 캐시 |
| `packages/server/src/lib/tool-handlers/builtins/place-stock-order.ts` | KIS 어댑터 연동, tradingMode/market 파라미터, 자동 기록 |
| `packages/server/src/routes/workspace/strategy.ts` | execute-order, balance, order-status, overseas-price 라우트 추가 |

### 테스트 패턴

- bun:test 사용
- 파일 위치: `packages/server/src/__tests__/unit/`
- 파일명: `10-2-kis-adapter.test.ts`
- KIS API 호출은 모킹 (fetch mock) — 실제 API 호출 금지
- 테스트 항목:
  - 국내 주문 (매수/매도, 시장가/지정가)
  - 해외 주문 (NASD/NYSE/AMEX)
  - 실거래/모의거래 TR_ID 분기
  - 잔고 조회 파싱 (output1/output2)
  - 토큰 캐시 + 만료 갱신
  - Paper trading 가상 체결
  - 시장 시간 검증
  - 에러 처리 (네트워크, API 오류, 자격증명 없음)

### Project Structure Notes

- strategy.ts에 라우트 추가: 기존 portfolio/order 라우트 뒤에 배치
- kis-adapter.ts는 services/ 폴더에 생성 (라우트와 도구 핸들러 양쪽에서 사용)
- kis-auth.ts는 builtins/ 폴더 유지 (도구 핸들러에서도 직접 사용하므로)

### References

- [Source: _bmad-output/planning-artifacts/epics.md - Epic 10, E10-S2, FR58, NFR27]
- [Source: _bmad-output/planning-artifacts/prd.md - FR56-FR62]
- [Source: packages/server/src/lib/tool-handlers/builtins/kis-auth.ts - 기존 KIS 인증]
- [Source: packages/server/src/lib/tool-handlers/builtins/place-stock-order.ts - 기존 주문 도구]
- [Source: packages/server/src/routes/workspace/strategy.ts - 기존 전략실 라우트]
- [Source: packages/server/src/services/credential-vault.ts - KIS 자격증명 관리]
- [Source: /home/ubuntu/CORTHEX_HQ/web/kis_client.py - v1 KIS 전체 구현 (700+ lines)]
- [Source: _bmad-output/implementation-artifacts/10-1-strategy-schema-watchlist-portfolio-orders.md - 이전 스토리]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- v1 kis_client.py 분석 완료: 신규 TR_ID, 토큰 관리, 잔고 조회, 해외 주문 패턴 모두 추출
- 기존 v2 코드 분석: kis-auth.ts, place-stock-order.ts에 구 TR_ID 문제 발견
- Paper trading은 KIS 모의투자 서버 또는 자격증명 없는 경우 로컬 가상 체결 이중 지원
- 구현 완료: KIS 어댑터 서비스 (주문/잔고/시세/상태), 실거래/모의거래 분리, Paper Trading, 시장 시간 검증
- 신규 TR_ID 적용 완료 (구 TTTC0802U/0801U -> TTTC0012U/0011U)
- 61개 신규 테스트 + 50개 기존 테스트 = 111개 전체 통과
- 기존 strategy-schema.test.ts에 새 모듈 mock 추가하여 regression 해결

### File List

- `packages/server/src/services/kis-adapter.ts` — **신규** KIS API 어댑터 서비스 (주문 실행, 잔고 조회, 주문 상태 동기화, 해외 시세, Paper Trading)
- `packages/server/src/lib/tool-handlers/builtins/kis-auth.ts` — **수정** 실/모의 base URL 분리, 신규 TR_ID, 거래소 코드 매핑, 토큰 캐시 개선
- `packages/server/src/lib/tool-handlers/builtins/place-stock-order.ts` — **수정** KIS 어댑터 연동, tradingMode/market 파라미터 추가
- `packages/server/src/routes/workspace/strategy.ts` — **수정** execute-order, balance, order-status, overseas-price 4개 라우트 추가
- `packages/server/src/__tests__/unit/kis-adapter.test.ts` — **신규** 61개 테스트
- `packages/server/src/__tests__/unit/strategy-schema.test.ts` — **수정** kis-auth/kis-adapter mock 업데이트
