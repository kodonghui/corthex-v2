# Story 10.8: 전략 공유 URL — 종목 뷰 + 백테스트 설정 공유 링크

Status: ready-for-dev

## Story

As a 일반 직원(유저),
I want 전략실의 현재 뷰 상태(종목, 비교 모드, 백테스트 설정)를 URL로 공유할 수 있다,
so that 동료에게 동일한 분석 화면을 빠르게 공유할 수 있다.

## Acceptance Criteria

1. **Given** 종목 선택 상태 **When** "공유" 버튼 클릭 **Then** 현재 뷰 상태가 포함된 URL이 클립보드에 복사되고 toast 알림 표시
2. **Given** 백테스트 실행 상태 **When** "공유" 클릭 **Then** 백테스트 설정(전략, 단기/장기 MA)도 URL에 포함
3. **Given** 공유 URL 접속 **When** 페이지 로드 **Then** URL 파라미터로부터 종목 선택 + 백테스트 자동 실행
4. **Given** 비교 모드 **When** "공유" 클릭 **Then** 비교 종목 리스트 포함 URL 복사
5. **Given** URL에 잘못된 파라미터 **When** 접속 **Then** 무시하고 기본 화면 표시 (에러 없음)
6. `turbo build` 3/3 성공

## Tasks / Subtasks

- [ ] Task 1: URL 파라미터 스키마 확장 (AC: #2, #3)
  - [ ] `packages/app/src/components/strategy/chart-panel.tsx` 수정
    - URL에서 `bt` (backtest type), `sp` (short period), `lp` (long period) 파라미터 읽기
    - 페이지 로드 시 해당 파라미터가 있으면 백테스트 자동 실행
  - [ ] `packages/app/src/components/strategy/backtest-panel.tsx` 수정
    - props로 `initialShort`, `initialLong`, `autoRun` 전달받기
    - `autoRun` 시 마운트 후 자동 백테스트 실행

- [ ] Task 2: 공유 버튼 + 클립보드 복사 (AC: #1, #2, #4)
  - [ ] `packages/app/src/components/strategy/chart-panel.tsx` 수정
    - 헤더 버튼 영역에 "공유" 버튼 추가
    - 클릭 시 현재 URL(`window.location.href`)에 백테스트 파라미터 포함하여 복사
    - `navigator.clipboard.writeText()` + `toast.success('공유 링크가 복사되었습니다')`
  - [ ] `packages/app/src/components/strategy/comparison-panel.tsx` 수정
    - 비교 모드에서도 "공유" 버튼 추가 (비교 종목 URL 그대로 복사)

- [ ] Task 3: 잘못된 파라미터 방어 (AC: #5)
  - [ ] 숫자 아닌 `sp`/`lp` 값 → 무시 (NaN 체크)
  - [ ] `bt` 값이 지원 전략이 아니면 → 무시
  - [ ] `compare` 에 유효하지 않은 코드 → 기존 필터링 로직으로 처리 (이미 구현됨)

- [ ] Task 4: 빌드 확인 (AC: #6)
  - [ ] `npx turbo build --force` 3/3 성공

## Dev Notes

### 핵심 설계: URL 파라미터 기반 상태 공유

기존 URL 파라미터 패턴을 확장하여 백테스트 설정도 URL에 포함:

```
# 단일 종목
/trading?stock=005930

# 단일 종목 + 백테스트
/trading?stock=005930&bt=ma&sp=5&lp=20

# 비교 모드
/trading?compare=005930,035720,000660
```

- `bt`: backtest type (`ma` = MA 교차)
- `sp`: short period (숫자)
- `lp`: long period (숫자)
- 기존 `stock`, `compare` 파라미터와 공존

### 공유 버튼 구현

```typescript
// chart-panel.tsx 헤더 영역
const shareUrl = () => {
  const url = new URL(window.location.href)
  // 백테스트 실행 상태가 있으면 파라미터 추가
  if (backtestOpen && backtestParams) {
    url.searchParams.set('bt', 'ma')
    url.searchParams.set('sp', String(backtestParams.shortPeriod))
    url.searchParams.set('lp', String(backtestParams.longPeriod))
  }
  navigator.clipboard.writeText(url.toString())
  toast.success('공유 링크가 복사되었습니다')
}
```

### 백테스트 자동 실행 (URL 파라미터에서)

```typescript
// chart-panel.tsx에서 URL 파라미터 파싱
const btType = searchParams.get('bt')
const sp = Number(searchParams.get('sp'))
const lp = Number(searchParams.get('lp'))
const autoBacktest = btType === 'ma' && sp > 0 && lp > 0 && sp < lp

// BacktestPanel에 전달
<BacktestPanel
  stockCode={stockCode}
  candles={candles}
  onMarkers={setMarkers}
  initialShort={autoBacktest ? sp : undefined}
  initialLong={autoBacktest ? lp : undefined}
  autoRun={autoBacktest}
/>
```

### BacktestPanel 자동 실행

```typescript
// backtest-panel.tsx
interface BacktestPanelProps {
  stockCode: string
  candles: Candle[]
  onMarkers: (markers: MarkerData[]) => void
  initialShort?: number
  initialLong?: number
  autoRun?: boolean
}

// useEffect로 autoRun 처리
useEffect(() => {
  if (autoRun && initialShort && initialLong && candles.length > 0) {
    setShortPeriod(initialShort)
    setLongPeriod(initialLong)
    // 다음 렌더 사이클에서 실행
    const res = runMaCrossover(candles, initialShort, initialLong)
    setResult(res)
    onMarkers(res.signals.map((s) => ({ time: s.date, type: s.type })))
  }
}, [autoRun]) // candles 로딩 완료 시 한 번만
```

### comparison-panel.tsx 공유 버튼

비교 모드 URL(`?compare=CODE1,CODE2,...`)은 이미 완전한 상태이므로 `window.location.href`를 그대로 복사:

```typescript
const shareUrl = () => {
  navigator.clipboard.writeText(window.location.href)
  toast.success('공유 링크가 복사되었습니다')
}
```

### UI 패턴 준수

- `Button`: `size="sm" variant="ghost"` (기존 "내보내기" 버튼과 동일)
- `toast`: `@corthex/ui`에서 import
- `navigator.clipboard`: 비동기지만 에러 처리는 간단히 (HTTPS 환경 전제)

### 이전 스토리 학습사항

- **10-4**: toast는 `@corthex/ui`에서 import, 마이그레이션 저널 태그 일치
- **10-6**: URL 기반 상태 — useState 대신 searchParams 직접 사용, 빈 상태 처리
- **10-7**: ConfirmDialog API (`isOpen`/`onConfirm`/`onCancel`), 미사용 import 금지, 입력 범위 검증

### 이 스토리에서 하지 않는 것

- 서버 사이드 공유 링크 (DB 저장, 단축 URL 등) — 클라이언트 URL 파라미터만 사용
- 백테스트 결과 데이터(signals, metrics) URL 포함 — 설정만 공유, 실행은 수신자 측에서
- OG 메타태그 동적 생성 — SPA이므로 불가
- 소셜 미디어 공유 API

### 파일 구조

```
수정 파일:
  packages/app/src/components/strategy/chart-panel.tsx (공유 버튼 + URL 파싱 + 백테스트 자동 실행)
  packages/app/src/components/strategy/backtest-panel.tsx (initialShort/Long + autoRun props)
  packages/app/src/components/strategy/comparison-panel.tsx (공유 버튼)
```

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
