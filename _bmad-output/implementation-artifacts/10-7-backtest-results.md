# Story 10.7: 백테스트 결과 — 간단 전략 시뮬레이션 + 차트 마커 표시

Status: review

## Story

As a 일반 직원(유저),
I want 전략실에서 이동평균 교차 등 간단 전략을 백테스트하고 매매 신호를 차트에 표시할 수 있다,
so that 과거 데이터 기반으로 전략 유효성을 빠르게 확인할 수 있다.

## Acceptance Criteria

1. **Given** 종목 선택 + 차트 표시 중 **When** "백테스트" 버튼 클릭 **Then** 백테스트 설정 패널 표시
2. **Given** 백테스트 설정 패널 **When** 전략(MA 교차/골든크로스) + 기간(20~200일) 설정 후 "실행" **Then** 기존 차트 데이터로 시뮬레이션 실행, 매수/매도 신호를 차트 마커로 표시
3. **Given** 백테스트 실행 완료 **When** 결과 표시 **Then** 요약 카드: 총 수익률 · 거래 횟수 · 승률 · 최대 손실 표시
4. **Given** 백테스트 결과 **When** "저장" 클릭 **Then** DB에 결과 저장, 저장된 백테스트 목록 조회 가능
5. **Given** 저장된 백테스트 목록 **When** 항목 클릭 **Then** 해당 결과를 차트 마커로 재표시
6. **Given** 저장된 백테스트 **When** "삭제" 클릭 **Then** ConfirmDialog 후 삭제
7. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: DB 스키마 + 마이그레이션 (AC: #4)
  - [x] `packages/server/src/db/schema.ts`에 `strategyBacktestResults` 테이블 추가
  - [x] `npx drizzle-kit generate` → 마이그레이션 0014 생성
  - [x] 저널 태그와 파일명 일치 확인 (10-4에서 학습)

- [x] Task 2: 백테스트 API 엔드포인트 (AC: #4, #5, #6)
  - [x] `packages/server/src/routes/workspace/strategy.ts`에 CRUD 라우트 추가
    - `GET /backtest-results?stockCode=XXX` — 저장된 결과 목록
    - `POST /backtest-results` — 결과 저장
    - `DELETE /backtest-results/:id` — 결과 삭제
  - [x] Zod 스키마 검증, 에러코드 STRATEGY_041

- [x] Task 3: 프론트엔드 백테스트 엔진 (AC: #2, #3)
  - [x] `packages/app/src/components/strategy/backtest-engine.ts` 신규
    - 이동평균(SMA) 계산 함수
    - MA 교차 전략: 단기선이 장기선 상향돌파 → 매수, 하향돌파 → 매도
    - 수익률/거래횟수/승률/최대손실 계산
    - 입력: Candle[], 출력: BacktestResult (signals + metrics)

- [x] Task 4: BacktestPanel UI (AC: #1, #2, #3, #4, #5, #6)
  - [x] `packages/app/src/components/strategy/backtest-panel.tsx` 신규
    - 전략 설정: 단기 MA(2~50) / 장기 MA(5~200) 선택
    - "실행" → backtest-engine 호출 → 결과 표시
    - 결과 요약 카드: 총 수익률 · 거래 횟수 · 승률 · 최대 손실
    - "저장" → POST /backtest-results
    - 저장된 목록 조회 + 클릭 시 결과 복원
    - "삭제" → ConfirmDialog + DELETE /backtest-results/:id

- [x] Task 5: 차트 마커 연동 (AC: #2, #5)
  - [x] `packages/app/src/components/strategy/stock-chart.tsx` 수정
    - props에 `markers?: MarkerData[]` 추가
    - `createSeriesMarkers()` (lightweight-charts v5 API) 호출로 매수(녹색 ▲)/매도(적색 ▼) 표시
    - 마커 없으면 기존과 동일 동작

- [x] Task 6: ChartPanel 통합 (AC: #1)
  - [x] `packages/app/src/components/strategy/chart-panel.tsx` 수정
    - 헤더에 "백테스트" 버튼 추가
    - BacktestPanel 토글 표시
    - 마커 데이터를 StockChart에 전달

- [x] Task 7: 빌드 확인 (AC: #7)
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### 핵심 설계: 프론트엔드 시뮬레이션 + DB 결과 저장

- 백테스트 연산은 **프론트엔드**에서 실행 (기존 차트 캔들 데이터 재사용, 서버 부하 없음)
- 서버는 결과 **저장/조회/삭제**만 담당 (CRUD)
- 차트 마커는 lightweight-charts의 `series.setMarkers()` API 사용

### DB 테이블 설계

```sql
CREATE TABLE "strategy_backtest_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "stock_code" varchar(20) NOT NULL,
  "strategy_type" varchar(50) NOT NULL,       -- 'ma_crossover'
  "strategy_params" jsonb NOT NULL DEFAULT '{}', -- { shortPeriod: 5, longPeriod: 20 }
  "signals" jsonb NOT NULL DEFAULT '[]',       -- [{ date, type, price }]
  "metrics" jsonb NOT NULL DEFAULT '{}',       -- { totalReturn, tradeCount, winRate, maxDrawdown }
  "data_range" varchar(50),                    -- '2025-01-01~2026-03-01'
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX idx_backtest_company ON strategy_backtest_results(company_id);
CREATE INDEX idx_backtest_user_stock ON strategy_backtest_results(company_id, user_id, stock_code);
```

Drizzle 스키마 패턴 (기존 strategy_notes와 동일):
```typescript
export const strategyBacktestResults = pgTable('strategy_backtest_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  stockCode: varchar('stock_code', { length: 20 }).notNull(),
  strategyType: varchar('strategy_type', { length: 50 }).notNull(),
  strategyParams: jsonb('strategy_params').notNull().default({}),
  signals: jsonb('signals').notNull().default([]),
  metrics: jsonb('metrics').notNull().default({}),
  dataRange: varchar('data_range', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

### API 엔드포인트 (strategy.ts에 추가)

```typescript
// GET /api/workspace/strategy/backtest-results?stockCode=005930
// → 해당 종목의 저장된 백테스트 목록 (최대 20개, 최신순)
// 에러: STRATEGY_040 (stockCode 누락)

// POST /api/workspace/strategy/backtest-results
// Body: { stockCode, strategyType, strategyParams, signals, metrics, dataRange }
// → 저장된 결과 반환 (201)

// DELETE /api/workspace/strategy/backtest-results/:id
// → 204 No Content
// 에러: STRATEGY_041 (not found), STRATEGY_042 (not found - 소유권 불일치)
```

### 백테스트 엔진 (프론트엔드, 순수 함수)

```typescript
// packages/app/src/components/strategy/backtest-engine.ts

type Candle = { time: string; open: number; high: number; low: number; close: number; volume: number }
type Signal = { date: string; type: 'buy' | 'sell'; price: number }
type BacktestMetrics = { totalReturn: number; tradeCount: number; winRate: number; maxDrawdown: number }
type BacktestResult = { signals: Signal[]; metrics: BacktestMetrics }

// SMA 계산
function sma(closes: number[], period: number): (number | null)[] { ... }

// MA 교차 전략
export function runMaCrossover(candles: Candle[], shortPeriod: number, longPeriod: number): BacktestResult {
  // 1. 종가 배열 추출
  // 2. 단기/장기 SMA 계산
  // 3. 교차 감지: 단기 > 장기로 전환 → 매수, 단기 < 장기로 전환 → 매도
  // 4. 수익률 계산: 매수가 대비 매도가 비율
  // 5. 승률: 이익 거래 / 전체 거래
  // 6. 최대 손실: 피크 대비 최대 하락률
}
```

### 차트 마커 연동 (lightweight-charts v5)

```typescript
// stock-chart.tsx에 마커 props 추가
type MarkerData = {
  time: string        // "YYYY-MM-DD"
  type: 'buy' | 'sell'
}

// series.setMarkers() 호출
const markers = markerData.map(m => ({
  time: m.time,
  position: m.type === 'buy' ? 'belowBar' as const : 'aboveBar' as const,
  color: m.type === 'buy' ? '#10b981' : '#ef4444',
  shape: m.type === 'buy' ? 'arrowUp' as const : 'arrowDown' as const,
  text: m.type === 'buy' ? '매수' : '매도',
}))
series.setMarkers(markers)
```

### BacktestPanel UI 레이아웃

```
┌─────────────────────────────────────┐
│ 백테스트 설정                        │
│ 전략: [MA 교차 ▼]                   │
│ 단기 MA: [  5  ] 장기 MA: [ 20  ]   │
│ [실행]                              │
├─────────────────────────────────────┤
│ 결과 요약                            │
│ 총 수익률: +12.5%   거래: 8회        │
│ 승률: 62.5%         최대손실: -5.2%  │
│ [저장]                              │
├─────────────────────────────────────┤
│ 저장된 백테스트 (3)                   │
│ ▸ MA(5/20) +12.5% 2026-03-01       │
│ ▸ MA(10/50) +8.3% 2026-02-28       │
│ ▸ MA(20/60) -2.1% 2026-02-25       │
└─────────────────────────────────────┘
```

### UI 패턴 준수

- `ConfirmDialog`: `isOpen` / `onConfirm` / `onCancel` / `variant="danger"` (NOT `open`/`onOpenChange`/`variant="destructive"`)
- `toast`: `@corthex/ui`에서 import (NOT `sonner`)
- `Input`, `Card`, `EmptyState`: `@corthex/ui`에서 import
- React Query 키: `['strategy-backtest', stockCode]`
- API 래퍼: `api.get/post/delete` from `../../lib/api`

### 이전 스토리 학습사항

- **10-1**: UUID params에 zValidator 필수, 중첩 button 금지
- **10-3**: 종목코드 정규식 (`/^[A-Za-z0-9]{1,20}$/`), URL 인코딩, Promise.allSettled 병렬
- **10-4**: toast는 `@corthex/ui`에서 import, 모바일은 `fixed inset-0 sm:static` 패턴, **마이그레이션 저널 태그와 파일명 반드시 일치**
- **10-5**: CSV injection 방지 `csvSafe()`, 기존 보고서 다운로드 패턴
- **10-6**: URL 기반 상태 — useState 대신 searchParams 직접 사용, 빈 상태 처리 주의

### 이 스토리에서 하지 않는 것

- 서버 사이드 백테스트 연산 (프론트엔드에서 기존 캔들 데이터로 계산)
- RSI, MACD 등 복잡한 전략 (MA 교차만 구현, 추후 확장 가능하게 타입만 설계)
- 실시간 백테스트 (저장된 캔들 데이터 기반만)
- 백테스트 결과 내보내기 (기존 export에 포함 안함)

### 파일 구조

```
수정 파일:
  packages/server/src/db/schema.ts (strategyBacktestResults 테이블)
  packages/server/src/routes/workspace/strategy.ts (CRUD 라우트 3개)
  packages/app/src/components/strategy/stock-chart.tsx (markers props)
  packages/app/src/components/strategy/chart-panel.tsx (백테스트 버튼 + BacktestPanel)
신규 파일:
  packages/server/src/db/migrations/0014_*.sql (마이그레이션)
  packages/app/src/components/strategy/backtest-engine.ts (순수 함수 엔진)
  packages/app/src/components/strategy/backtest-panel.tsx (설정 + 결과 + 목록 UI)
```

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- DB: strategy_backtest_results 테이블 + 마이그레이션 0014_productive_bedlam.sql (저널 태그 일치 확인)
- API: GET/POST/DELETE /backtest-results CRUD (Zod 검증 + tenant 격리 + STRATEGY_041 에러코드)
- Engine: SMA 계산 + MA 교차 전략 (골든크로스/데드크로스) + 수익률/승률/최대손실 계산 (순수 함수)
- UI: BacktestPanel — 단기/장기 MA 설정 + 실행 + 결과 요약 카드 + 저장/조회/삭제
- Chart: lightweight-charts v5 createSeriesMarkers() API로 매수(B ▲)/매도(S ▼) 마커 표시
- ChartPanel: 백테스트 토글 버튼 + BacktestPanel 통합 + 종목 변경 시 마커 초기화
- 빌드 3/3 성공

### File List
- packages/server/src/db/schema.ts (strategyBacktestResults 테이블 + relations 추가)
- packages/server/src/db/migrations/0014_productive_bedlam.sql (신규 마이그레이션)
- packages/server/src/routes/workspace/strategy.ts (backtest-results CRUD 라우트 3개)
- packages/app/src/components/strategy/backtest-engine.ts (신규 — SMA/MA 교차 엔진)
- packages/app/src/components/strategy/backtest-panel.tsx (신규 — 백테스트 설정+결과+목록 UI)
- packages/app/src/components/strategy/stock-chart.tsx (markers props + createSeriesMarkers)
- packages/app/src/components/strategy/chart-panel.tsx (백테스트 버튼 + BacktestPanel 통합)
