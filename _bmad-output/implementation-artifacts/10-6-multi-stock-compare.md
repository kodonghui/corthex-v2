# Story 10.6: 다중 종목 비교 — 관심종목 멀티셀렉트 + 시세 비교표

Status: review

## Story

As a 일반 직원(유저),
I want 전략실에서 관심종목 여러 개를 선택하여 시세를 나란히 비교할 수 있다,
so that 관련 종목 간 가격 추이와 등락률을 한눈에 파악할 수 있다.

## Acceptance Criteria

1. **Given** 관심종목 사이드바 **When** "비교" 토글 활성화 **Then** 체크박스 표시, 최대 5개 종목 선택 가능
2. **Given** 2개 이상 종목 선택 **When** 비교 모드 **Then** ChartPanel 대신 ComparisonPanel 표시 (시세 비교표)
3. **Given** ComparisonPanel **When** 시세 로딩 완료 **Then** 종목명 · 현재가 · 등락률 · 시가 · 고가 · 저가 · 거래량 테이블 표시
4. **Given** 비교 모드 **When** 체크 해제하여 1개 이하 **Then** 자동으로 단일 종목 모드 복귀
5. **Given** 비교 모드 **When** 종목 이름 클릭 **Then** 해당 종목의 단일 차트 뷰로 전환
6. **Given** 모바일 **When** 비교 모드 **Then** 테이블 가로 스크롤, 동일 기능
7. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 사이드바 비교 모드 (AC: #1, #4)
  - [x] `packages/app/src/components/strategy/stock-sidebar.tsx` 수정
    - 상단에 "비교" 토글 버튼 추가
    - 비교 모드: 종목 옆에 체크박스 표시
    - 선택된 종목 코드를 URL `?compare=CODE1,CODE2,...` 으로 관리
    - 최대 5개 제한 (초과 시 toast 경고)
    - 비교 모드 해제 시 compare 파라미터 제거

- [x] Task 2: ComparisonPanel 컴포넌트 (AC: #2, #3, #5, #6)
  - [x] `packages/app/src/components/strategy/comparison-panel.tsx` 신규
    - `useSearchParams`에서 `compare` 파라미터 읽기
    - 기존 `/prices?codes=CODE1,CODE2,...` API로 시세 일괄 조회 (API 변경 불필요)
    - 비교 테이블: 종목명 · 현재가 · 등락률(색상) · 시가 · 고가 · 저가 · 거래량
    - 종목명 클릭 → `?stock=CODE` + compare 제거 (단일 모드 복귀)
    - 모바일: `overflow-x-auto` 가로 스크롤
    - 장 마감/오픈 표시, 30초 폴링 (기존 패턴)

- [x] Task 3: 트레이딩 페이지 통합 (AC: #2, #4)
  - [x] `packages/app/src/pages/trading.tsx` 수정
    - `compare` 파라미터 존재 + 2개 이상 → ComparisonPanel 렌더
    - 그 외 → 기존 ChartPanel 렌더
    - import lazy 로딩 권장

- [x] Task 4: 빌드 확인 (AC: #7)
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### 핵심 설계: URL 기반 비교 모드 + 기존 API 재사용

- 비교 모드 진입: `?compare=005930,035720,000660` (콤마 구분)
- 단일 종목 모드: `?stock=005930` (기존 그대로)
- 서버 API 변경 없음: `GET /prices?codes=X,Y,Z`가 이미 다중 종목 지원
- 비교 모드와 단일 모드는 URL 파라미터로 완전히 분리

### 기존 prices API (변경 불필요)

```typescript
// packages/server/src/routes/workspace/strategy.ts:181-230
GET /api/workspace/strategy/prices?codes=005930,035720,000660
// 응답: { data: { "005930": { name, price, change, changeRate, open, high, low, volume }, ... } }
// Promise.allSettled로 병렬 호출, 개별 실패 시 { error: true }
// 최대 20개 코드 지원
```

### 사이드바 비교 모드 UI

```
[관심종목 (5)]  [비교 ○]     ← 토글 버튼
┌──────────────────────────┐
│ ☐ 삼성전자   005930      │ ← 비교 모드: 체크박스
│ ☑ SK하이닉스  000660      │
│ ☑ NAVER     035420      │
│ ☐ 카카오     035720      │
└──────────────────────────┘
```

### ComparisonPanel 테이블

```
┌─────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│ 종목명   │ 현재가  │ 등락률  │ 시가    │ 고가    │ 저가    │ 거래량  │
├─────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ SK하이닉스│ 185,000│ +2.1%  │ 181,500│ 186,000│ 180,000│ 12.3M  │
│ NAVER   │ 215,000│ -0.5%  │ 216,000│ 218,000│ 214,500│ 1.8M   │
└─────────┴────────┴────────┴────────┴────────┴────────┴────────┘
```

### 트레이딩 페이지 분기 로직

```tsx
// packages/app/src/pages/trading.tsx
const compareCodes = searchParams.get('compare')?.split(',').filter(Boolean) || []
const isCompareMode = compareCodes.length >= 2

// 중앙 패널:
{isCompareMode ? <ComparisonPanel /> : <ChartPanel />}
```

### formatPrice / formatVolume 재사용

`chart-panel.tsx`에 이미 `formatPrice()`와 `formatVolume()` 함수가 있다. ComparisonPanel에서 재사용하기 위해 직접 동일 함수를 정의하거나 import한다. 현재 export되지 않으므로 ComparisonPanel 내에 동일 헬퍼를 정의하는 것이 간단하다.

### isMarketOpen 재사용

`chart-panel.tsx`의 `isMarketOpen()` 함수도 동일하게 ComparisonPanel에서 필요. 마찬가지로 내부에 정의.

### 이전 스토리 학습사항

- **10-1**: UUID params에 zValidator 필수, 중첩 button 금지
- **10-3**: 종목코드 정규식 (`/^[A-Za-z0-9]{1,20}$/`), URL 인코딩, Promise.allSettled 병렬
- **10-4**: toast는 `@corthex/ui`에서 import, 모바일은 `fixed inset-0 sm:static` 패턴
- **10-5**: CSV injection 방지 `csvSafe()`, 기존 보고서 다운로드 패턴
- **코드 리뷰**: 변수 섀도잉 주의 (map 콜백에서 외부 변수와 이름 충돌 금지)

### 이 스토리에서 하지 않는 것

- 오버레이 차트 (복수 시계열 한 차트에 겹치기) — 다음 스토리에서 검토
- 차트 데이터 비교 (캔들스틱 나란히) — 시세 테이블만
- 비교 결과 내보내기 (export는 10-5에서 완료)
- 서버 API 추가/수정 (기존 API로 충분)

### 파일 구조

```
수정 파일:
  packages/app/src/components/strategy/stock-sidebar.tsx (비교 모드 토글 + 체크박스)
  packages/app/src/pages/trading.tsx (ComparisonPanel 분기)
신규 파일:
  packages/app/src/components/strategy/comparison-panel.tsx (비교 테이블)
```

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- StockSidebar: 비교 토글 + 체크박스 멀티셀렉트 + 최대 5개 제한
- ComparisonPanel: 다중 시세 비교 테이블 + 30초 폴링 + 종목 클릭 단일 모드 전환
- TradingPage: compare 파라미터 기반 ComparisonPanel/ChartPanel 분기
- 서버 API 변경 없음 (기존 /prices?codes= 재사용)
- URL 기반 상태 관리: ?compare=CODE1,CODE2 vs ?stock=CODE

### File List
- packages/app/src/components/strategy/stock-sidebar.tsx (비교 모드 토글 + 체크박스)
- packages/app/src/components/strategy/comparison-panel.tsx (신규)
- packages/app/src/pages/trading.tsx (ComparisonPanel 분기)
