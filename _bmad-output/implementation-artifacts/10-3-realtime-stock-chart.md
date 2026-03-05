# Story 10.3: 실시간 종목 차트 — KIS 시세 폴링 + 캔들스틱 차트

Status: done

## Story

As a 일반 직원(유저),
I want 전략실에서 선택한 종목의 실시간 시세와 캔들스틱 차트를 볼 수 있다,
so that 시각적으로 종목 흐름을 파악하고 투자 판단에 활용할 수 있다.

## Acceptance Criteria

1. **Given** 종목 선택 상태 **When** ChartPanel 표시 **Then** 현재가 + 등락률 + 시가/고가/저가/거래량 표시
2. **Given** 장 중(평일 09:00~15:30 KST) **When** 종목 선택 **Then** 30초 간격 폴링으로 시세 자동 갱신 + 갱신 시각 표시
3. **Given** 장 외 시간 **When** 종목 선택 **Then** 폴링 중지 + "장 마감 (마지막 갱신: HH:mm)" 상태 표시
4. **Given** 시세 조회 **When** 3회 연속 실패 **Then** "가격 정보를 불러올 수 없습니다" 경고 표시, 포커스 복귀 시 즉시 재시도
5. **Given** 종목 선택 **When** 일봉 데이터 로드 **Then** 캔들스틱 차트(lightweight-charts) 렌더링
6. **Given** 모바일 **When** 차트 탭 선택 **Then** 전체 너비 차트 + 시세 정보 표시
7. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 서버 — 시세 조회 API (AC: #1, #2, #4)
  - [x] `packages/server/src/routes/workspace/strategy.ts`에 GET `/prices` 추가
    - query: `codes=005930,035420` (쉼표 구분)
    - 기존 `kis-auth.ts` + KIS 현재가 API 호출 (tool-handler의 getStockPrice 로직 재사용)
    - 응답: `{ data: { [code]: { price, change, changeRate, open, high, low, volume, name } } }`
  - [x] `packages/server/src/routes/workspace/strategy.ts`에 GET `/chart-data` 추가
    - query: `code=005930&period=D&count=60` (일봉 60개)
    - KIS 일봉 API (`FHKST03010100`) 호출
    - 응답: `{ data: { candles: { time, open, high, low, close, volume }[] } }`

- [x] Task 2: 프론트엔드 — lightweight-charts 설치 + 차트 컴포넌트 (AC: #5, #6)
  - [x] `packages/app`에 `lightweight-charts` 패키지 추가
  - [x] `packages/app/src/components/strategy/stock-chart.tsx` 신규
    - TradingView lightweight-charts 래퍼 컴포넌트
    - CandlestickSeries로 일봉 데이터 렌더링
    - 컨테이너 리사이즈 대응 (ResizeObserver)
    - 다크모드 테마 자동 적용

- [x] Task 3: 프론트엔드 — ChartPanel 실시간 시세 통합 (AC: #1, #2, #3, #4, #6)
  - [x] `packages/app/src/components/strategy/chart-panel.tsx` 리팩토링
    - 시세 헤더: 종목명 + 현재가(font-mono font-bold) + 등락률(색상) + OHLV
    - 마켓시간 감지 유틸: `isMarketOpen()` (평일 09:00~15:30 KST)
    - useQuery 30초 폴링 (refetchInterval, 장 중만)
    - 갱신 시각 표시 + 장 마감 상태 표시
    - 3회 연속 실패 카운터 + 경고 UI + 포커스 복귀 재시도 (refetchOnWindowFocus)
  - [x] 차트 영역: StockChart 컴포넌트에 일봉 데이터 전달

- [x] Task 4: 빌드 확인 (AC: #7)
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### 핵심 설계: KIS API 직접 호출 + lightweight-charts

기존 `get-stock-price.ts` tool handler가 KIS 현재가 API를 이미 호출하고 있음. 동일한 `kis-auth.ts` 인프라를 재사용하되, tool handler가 아닌 workspace API 엔드포인트로 노출.

**시세 API 흐름:**
```
프론트: GET /workspace/strategy/prices?codes=005930
서버: kis-auth.ts getKisToken() → KIS API 호출
서버: 응답 가공 → 프론트에 JSON 반환
```

**일봉 API 흐름:**
```
프론트: GET /workspace/strategy/chart-data?code=005930&period=D&count=60
서버: KIS 일봉 API (tr_id=FHKST03010100) 호출
서버: OHLCV 배열 → lightweight-charts 형식으로 가공
```

### KIS API 참고 (기존 코드 기반)

`packages/server/src/lib/tool-handlers/builtins/kis-auth.ts`:
- `KIS_BASE_URL = 'https://openapi.koreainvestment.com:9443'`
- `getKisToken(appKey, appSecret)` — 토큰 캐시 포함
- `kisHeaders(token, appKey, appSecret, trId)` — 헤더 생성

`packages/server/src/lib/tool-handlers/builtins/get-stock-price.ts`:
- 현재가 API: `GET /uapi/domestic-stock/v1/quotations/inquire-price`
- tr_id: `FHKST01010100`
- params: `FID_COND_MRKT_DIV_CODE=J`, `FID_INPUT_ISCD={종목코드}`

**일봉 API (새로 사용):**
- 일봉 API: `GET /uapi/domestic-stock/v1/quotations/inquire-daily-price`
- tr_id: `FHKST03010100`
- params: `FID_COND_MRKT_DIV_CODE=J`, `FID_INPUT_ISCD={종목코드}`, `FID_INPUT_DATE_1={시작일}`, `FID_INPUT_DATE_2={종료일}`, `FID_PERIOD_DIV_CODE=D`

### KIS 크레덴셜 접근

tool handler는 `ctx.getCredentials('kis')`를 사용하지만, workspace API에서는 credential-vault 서비스를 직접 사용해야 함.
- `packages/server/src/services/credential-vault.ts` — `getCredentialForUser(userId, companyId, provider)` 패턴 확인 필요
- KIS 크레덴셜 키: `app_key`, `app_secret`

### lightweight-charts 선택 이유

- TradingView 공식 오픈소스 차트 라이브러리
- 캔들스틱 차트에 특화 (금융 차트 전문)
- 번들 크기 작음 (~45KB gzip)
- React wrapper 불필요 (직접 DOM ref 사용)
- 다크모드 지원

### 마켓시간 감지 유틸

```typescript
function isMarketOpen(): boolean {
  const now = new Date()
  const kst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const day = kst.getDay()
  if (day === 0 || day === 6) return false // 주말
  const h = kst.getHours(), m = kst.getMinutes()
  const minutes = h * 60 + m
  return minutes >= 540 && minutes <= 930 // 09:00 ~ 15:30
}
```

### 폴링 + 실패 카운터 패턴

```typescript
const [failCount, setFailCount] = useState(0)
const marketOpen = isMarketOpen()

const { data, error } = useQuery({
  queryKey: ['strategy-prices', stockCode],
  queryFn: () => api.get(`/workspace/strategy/prices?codes=${stockCode}`),
  refetchInterval: marketOpen ? 30_000 : false,
  refetchOnWindowFocus: true,
  retry: false,
})

useEffect(() => {
  if (error) setFailCount(c => c + 1)
  else if (data) setFailCount(0)
}, [data, error])
```

### 등락률 색상 패턴 (UX 스펙)

- 양수: `text-emerald-500`
- 음수: `text-red-500`
- 보합: `text-zinc-400`

### 이전 스토리 학습사항

**10-1**: 3패널 레이아웃 완성, URL params로 종목 선택 (`?stock=CODE`), WatchlistItem 타입 공유
**10-2**: ChatArea 재사용 패턴, metadata JSONB, strategy 마커 패턴, useEffect deps 주의

**코드 리뷰에서 발견된 패턴:**
- UUID params에 zValidator 필수
- 중첩 button 금지 (HTML 스펙)
- onError 토스트 필수
- useEffect deps 빠뜨리지 않기

### 파일 구조

```
수정 파일:
  packages/app/src/components/strategy/chart-panel.tsx (차트 + 시세 통합)
  packages/app/package.json (lightweight-charts 추가)
신규 파일:
  packages/app/src/components/strategy/stock-chart.tsx (캔들스틱 차트 래퍼)
  packages/server/src/routes/workspace/strategy.ts (prices + chart-data API 추가)
```

### 이 스토리에서 하지 않는 것

- sparkline (관심목록 내 20일봉 미니차트) — UX 스펙에는 있지만 별도 구현 가능
- 목표가 설정/편집 — 관심목록 탭 기능
- 포트폴리오/매매이력/자동매매 탭 — 후속 스토리
- 실투자/모의투자 모드 전환 — 설정 탭 기능

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- Task 1: strategy.ts에 GET /prices (복수 종목 시세), GET /chart-data (일봉 캔들스틱) 2개 엔드포인트 추가
- Task 1: credential-vault 서비스 + kis-auth.ts 인프라 재사용, 10초/15초 타임아웃
- Task 2: lightweight-charts v5.1.0 설치, stock-chart.tsx 래퍼 (createChart + CandlestickSeries + ResizeObserver + 다크모드)
- Task 3: chart-panel.tsx 전면 재작성 — 시세 헤더(가격/등락률/OHLV) + 30초 폴링 + 마켓시간 감지 + 3회 실패 경고 + 포커스 재시도
- Task 4: turbo build 3/3 성공

### File List

- packages/server/src/routes/workspace/strategy.ts (수정 — prices + chart-data API 추가)
- packages/app/package.json (수정 — lightweight-charts 5.1.0 추가)
- packages/app/src/components/strategy/stock-chart.tsx (신규 — 캔들스틱 차트 래퍼)
- packages/app/src/components/strategy/chart-panel.tsx (수정 — 실시간 시세 + 차트 통합)
