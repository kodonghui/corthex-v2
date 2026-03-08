# Story 10.7: 전략실 UI: 포트폴리오 + 관심종목

Status: ready-for-dev

## Story

As a CEO(이사장),
I want 전략실에서 포트폴리오 대시보드(현금/보유종목/수익률/총자산), 관심종목 드래그 정렬, 거래 모드 표시, 매매 승인 인라인 UI를 한 화면에서 확인할 수 있기를,
so that 증권사 HTS처럼 한눈에 투자 현황을 파악하고, AI 분석 결과를 바탕으로 즉시 매매 결정을 내릴 수 있다.

## Acceptance Criteria

1. **포트폴리오 대시보드 카드 (FR56)**
   - Given: CEO가 전략실에 진입할 때
   - When: 포트폴리오 API(`GET /api/workspace/strategy/portfolios`)를 호출하면
   - Then: 현재 tradingMode에 해당하는 포트폴리오의 요약 카드가 상단에 표시된다
   - And: 카드에 현금 잔고, 보유종목 수, 총 평가금액, 일간 수익률이 표시된다
   - And: 보유종목 목록이 테이블로 표시된다 (종목명/수량/매입가/현재가/수익률)
   - And: 포트폴리오가 없으면 "포트폴리오를 생성하세요" 빈 상태 안내

2. **거래 모드 헤더 표시 (FR61, UX 보안 패턴)**
   - Given: 전략실 화면 상단에
   - When: 현재 tradingMode를 조회하면 (`GET /api/workspace/strategy/trading-status`)
   - Then: 실거래 모드 = 빨간 배경 헤더 + "실거래 모드" 텍스트 상시 표시
   - And: 모의거래 모드 = 파란/녹색 배경 헤더 + "모의거래 모드" 텍스트 상시 표시
   - And: KIS 연결 상태(연결됨/미연결), 계좌번호(마스킹) 표시

3. **관심종목 드래그 정렬 + 실시간 시세**
   - Given: 기존 `StockSidebar` 컴포넌트에 관심종목 리스트가 있을 때
   - When: dnd-kit을 사용하여 드래그 정렬을 추가하면
   - Then: 관심종목을 드래그 앤 드롭으로 순서 변경 가능
   - And: 각 종목에 현재가/등락률이 인라인 표시된다 (기존 prices API 활용)
   - And: KR/US 마켓 필터 버튼 표시
   - And: 종목 추가 검색 UI가 사이드바 상단에 있다

4. **매매 승인 인라인 UI (FR59)**
   - Given: approval 모드에서 pending 주문이 있을 때
   - When: 전략실 화면에 pending 주문 알림이 표시되면
   - Then: 종목명/수량/가격/CIO 분석 근거 요약이 인라인 카드로 표시
   - And: "승인" / "거부" 버튼이 각 주문 카드에 표시
   - And: 일괄 승인/거부 체크박스 + 버튼 제공
   - And: 승인/거부 후 WebSocket `strategy` 채널로 실시간 업데이트

5. **차트 모달 (기존 ChartPanel 재사용)**
   - Given: 관심종목 리스트에서 종목을 클릭하면
   - When: 해당 종목의 차트가 표시될 때
   - Then: 기존 `ChartPanel` + `StockChart` 컴포넌트를 재사용
   - And: 백테스트/내보내기/공유 기능 기존 그대로 동작

6. **포트폴리오 생성 UI**
   - Given: CEO가 포트폴리오를 처음 생성할 때
   - When: "포트폴리오 생성" 버튼을 클릭하면
   - Then: 이름, 초기자금, tradingMode(paper/real) 입력 폼 표시
   - And: `POST /api/workspace/strategy/portfolios` API 호출
   - And: 생성 후 포트폴리오 카드에 즉시 반영

7. **반응형 레이아웃**
   - Given: 데스크탑과 모바일 환경에서
   - When: 전략실을 사용할 때
   - Then: 데스크탑: 좌측 사이드바(관심종목) + 중앙(포트폴리오+차트) + 우측(채팅) 3패널
   - And: 모바일: 탭 전환(포트폴리오/차트/채팅)

## Tasks / Subtasks

- [ ] Task 1: 포트폴리오 대시보드 컴포넌트 구현 (AC: #1, #6)
  - [ ] 1.1 `packages/app/src/components/strategy/portfolio-dashboard.tsx` 생성
  - [ ] 1.2 포트폴리오 요약 카드: 현금/총자산/보유종목수/수익률 표시
  - [ ] 1.3 보유종목 테이블: 종목명/수량/매입가/현재가/수익률/비중
  - [ ] 1.4 빈 상태 EmptyState 컴포넌트 활용 ("포트폴리오를 생성하세요")
  - [ ] 1.5 포트폴리오 생성 모달/폼 (이름, 초기자금, tradingMode 선택)

- [ ] Task 2: 거래 모드 헤더 컴포넌트 (AC: #2)
  - [ ] 2.1 `packages/app/src/components/strategy/trading-mode-header.tsx` 생성
  - [ ] 2.2 `GET /trading-status` API 호출 → tradingMode/kisAvailable/account 표시
  - [ ] 2.3 실거래: 빨간 배경(`bg-red-500 text-white`), 모의거래: 파란 배경(`bg-blue-500 text-white`)
  - [ ] 2.4 KIS 연결 상태 뱃지 + 마스킹 계좌번호

- [ ] Task 3: 관심종목 드래그 정렬 + 시세 인라인 표시 (AC: #3)
  - [ ] 3.1 기존 `stock-sidebar.tsx`에 dnd-kit 드래그 정렬 추가
  - [ ] 3.2 `PATCH /api/workspace/strategy/watchlist/reorder` API 추가 (서버)
  - [ ] 3.3 각 종목 행에 현재가/등락률 인라인 표시 (prices API 폴링 데이터 활용)
  - [ ] 3.4 KR/US 마켓 필터 토글 버튼
  - [ ] 3.5 종목 추가 검색 UI 개선 (종목코드/이름 검색 → 결과 표시 → 추가 버튼)

- [ ] Task 4: 매매 승인 인라인 UI (AC: #4)
  - [ ] 4.1 `packages/app/src/components/strategy/pending-orders.tsx` 생성
  - [ ] 4.2 `GET /api/workspace/strategy/orders/pending` API 호출 (기존 trade-approval 서비스)
  - [ ] 4.3 주문 카드: 종목명/수량/가격/분석 근거/신뢰도
  - [ ] 4.4 개별 승인/거부 버튼 (기존 approve/reject API 호출)
  - [ ] 4.5 일괄 승인/거부 체크박스 + 버튼 (기존 bulk-approve/reject API)
  - [ ] 4.6 WebSocket `strategy` 채널 구독 → 실시간 업데이트

- [ ] Task 5: TradingPage 레이아웃 리팩토링 (AC: #5, #7)
  - [ ] 5.1 기존 `trading.tsx` 페이지에 포트폴리오 대시보드 + 거래 모드 헤더 통합
  - [ ] 5.2 중앙 패널: 포트폴리오 대시보드(상단) + 차트(하단, 종목 선택 시)
  - [ ] 5.3 pending 주문 패널: 포트폴리오와 차트 사이에 표시 (있을 때만)
  - [ ] 5.4 모바일 탭에 "포트폴리오" 탭 추가

- [ ] Task 6: 관심종목 순서 저장 API (서버) (AC: #3)
  - [ ] 6.1 `strategyWatchlists` 테이블에 `sortOrder` 컬럼 추가 (이미 있으면 확인)
  - [ ] 6.2 `PATCH /api/workspace/strategy/watchlist/reorder` 라우트 추가
  - [ ] 6.3 body: `{ items: [{ id: string, sortOrder: number }] }` 형태

## Dev Notes

### 기존 코드 구조 -- 절대 참조

현재 전략실은 `packages/app/src/pages/trading.tsx`에 3패널 레이아웃이 이미 구현됨:
- 좌측: `StockSidebar` (관심종목 리스트 + 검색 + 비교 모드)
- 중앙: `ChartPanel` (종목 차트 + 시세 카드 + 백테스트 + 노트)
- 우측: `ChatPanel` (전략 채팅 세션)

**이 구조를 유지하면서 포트폴리오 대시보드를 중앙 패널 상단에 추가한다.**

### 기존 API 엔드포인트 -- 이미 존재 (재사용 필수)

| API | 용도 | 파일 |
|-----|------|------|
| `GET /workspace/strategy/watchlist` | 관심종목 조회 | strategy.ts L28 |
| `POST /workspace/strategy/watchlist` | 종목 추가 | strategy.ts L40 |
| `DELETE /workspace/strategy/watchlist/:id` | 종목 삭제 | strategy.ts L62 |
| `GET /workspace/strategy/prices?codes=` | 실시간 시세 | strategy.ts L186 |
| `GET /workspace/strategy/portfolios` | 포트폴리오 목록 | strategy.ts L809 |
| `POST /workspace/strategy/portfolios` | 포트폴리오 생성 | strategy.ts L834 |
| `GET /workspace/strategy/portfolios/:id` | 포트폴리오 상세 | strategy.ts L855 |
| `PATCH /workspace/strategy/portfolios/:id` | 포트폴리오 수정 | strategy.ts L894 |
| `GET /workspace/strategy/settings` | 트레이딩 설정 | strategy.ts L1243 |
| `GET /workspace/strategy/trading-status` | 거래 모드/KIS 상태 | strategy.ts L1442 |
| `GET /workspace/strategy/orders/pending` | 대기 주문 | trade-approval.ts |
| `POST /workspace/strategy/orders/:id/approve` | 주문 승인 | trade-approval.ts |
| `POST /workspace/strategy/orders/:id/reject` | 주문 거부 | trade-approval.ts |
| `POST /workspace/strategy/orders/bulk-approve` | 일괄 승인 | trade-approval.ts |
| `POST /workspace/strategy/orders/bulk-reject` | 일괄 거부 | trade-approval.ts |

### 기존 컴포넌트 -- 재사용 필수 (새로 만들지 말 것)

| 컴포넌트 | 경로 | 용도 |
|----------|------|------|
| `StockSidebar` | `components/strategy/stock-sidebar.tsx` | 관심종목 리스트 (확장) |
| `ChartPanel` | `components/strategy/chart-panel.tsx` | 종목 차트 + 시세 카드 |
| `StockChart` | `components/strategy/stock-chart.tsx` | Recharts 캔들차트 |
| `ChatPanel` | `components/strategy/chat-panel.tsx` | 전략 채팅 |
| `BacktestPanel` | `components/strategy/backtest-panel.tsx` | 백테스트 |
| `NotesPanel` | `components/strategy/notes-panel.tsx` | 메모 |
| `ComparisonPanel` | `components/strategy/comparison-panel.tsx` | 종목 비교 |
| `ExportDialog` | `components/strategy/export-dialog.tsx` | 내보내기 |

### 신규 컴포넌트 목록

| 컴포넌트 | 경로 | 용도 |
|----------|------|------|
| `PortfolioDashboard` | `components/strategy/portfolio-dashboard.tsx` | 포트폴리오 카드+테이블 |
| `TradingModeHeader` | `components/strategy/trading-mode-header.tsx` | 거래 모드 헤더 바 |
| `PendingOrders` | `components/strategy/pending-orders.tsx` | 매매 승인 인라인 UI |

### UX 디자인 지침 (ux-design-specification.md 참조)

- **전략실 = Bloomberg 영감의 정보 밀도**. 포트폴리오 카드 + 시세 테이블 + 차트 동시 표시
- **실거래 안전장치**: 빨간 헤더("실거래 모드") / 파란 헤더("모의거래 모드") 상시 표시
- **이사장 멘탈 모델**: "AI는 애널리스트 팀, 전략실은 HTS" — 익숙한 HTS 레이아웃
- **빈 상태 가이드**: "관심종목을 추가하세요", "포트폴리오를 생성하세요"
- 데이터 갱신: 폴링(60초 시세) + 실시간(WS: strategy 채널)
- **dnd-kit** 사용하여 관심종목 드래그 정렬 (ux-design-specification.md에 명시)

### 10-6 스토리 학습 (이전 스토리)

- `TradingMode = 'real' | 'paper'` 타입은 `packages/shared/src/types.ts`에 이미 정의
- `TradingSettings`에 `tradingMode`, `initialCapital` 필드 이미 존재
- `GET /trading-status` API 응답: `{ tradingMode, kisAvailable, account, activeMode }`
- WebSocket `strategy` 채널로 `mode:changed` 이벤트 브로드캐스트
- 포트폴리오는 tradingMode 기준 필터 (`strategyPortfolios.tradingMode`)
- 34개 테스트 통과, 기존 테스트 수정 불필요

### dnd-kit 설치 여부 확인

```bash
# package.json에서 @dnd-kit 확인 필요
# 없으면: cd packages/app && bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### DB 변경 가능성

`strategyWatchlists` 테이블에 `sortOrder` 컬럼이 없을 수 있음:
- `packages/server/src/db/schema.ts`에서 확인
- 없으면 integer 컬럼 추가 (기본값 0)
- 마이그레이션: `bun run drizzle-kit generate` → `bun run drizzle-kit push`

### 가격 폴링 패턴 (기존 코드 참조)

`chart-panel.tsx`에서 이미 구현된 패턴:
```typescript
const { data: priceRes } = useQuery({
  queryKey: ['strategy-prices', stockCode],
  queryFn: () => api.get(`/workspace/strategy/prices?codes=${codes}`),
  refetchInterval: marketOpen ? 30_000 : false,
})
```
관심종목 전체 시세는 watchlist의 모든 stockCode를 `,`로 조인하여 한 번에 요청.

### WebSocket 연동 패턴

기존 프로젝트 WebSocket 패턴 참조:
- `packages/app/src/lib/ws.ts` — WebSocket 클라이언트
- `strategy` 채널 구독 → `mode:changed`, `order:approved`, `order:rejected` 이벤트 수신
- React Query `invalidateQueries` 호출로 자동 갱신

### 포트폴리오 데이터 구조 (DB schema 참조)

```typescript
// strategyPortfolios 테이블 필드
{
  id: uuid,
  companyId: uuid,
  name: string,
  tradingMode: 'real' | 'paper',
  cashBalance: numeric (기본 100,000,000),
  holdings: jsonb, // [{ stockCode, stockName, quantity, avgPrice, market }]
  totalValue: numeric,
  initialCapital: numeric,
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

### 수익률 계산

- 일간 수익률: `(totalValue - previousDayValue) / previousDayValue * 100`
- 총 수익률: `(totalValue - initialCapital) / initialCapital * 100`
- 프론트엔드에서 계산 (holdings + 현재가로 실시간 계산)

### 절대 금지 사항

- 기존 `ChartPanel`, `StockChart`, `ChatPanel` 등 컴포넌트 로직 변경 금지
- `strategy.ts` 라우트의 기존 API 시그니처 변경 금지
- 새 페이지 생성 금지 (기존 `trading.tsx` 확장)
- `App.tsx` 라우팅 변경 불필요 (이미 `/trading` 라우트 존재)
- `sidebar.tsx` 변경 불필요 (이미 "전략실" 메뉴 존재)

### 테스트 패턴

- bun:test 사용
- `__tests__/unit/strategy-room-ui.test.ts` — 신규 테스트 파일
  - 포트폴리오 대시보드 데이터 가공 로직
  - 거래 모드 헤더 상태 결정
  - 관심종목 드래그 정렬 순서 유지
  - 매매 승인/거부 API 호출 흐름
  - 수익률 계산 로직
  - 빈 상태 처리

### Project Structure Notes

- **수정 파일:**
  - `packages/app/src/pages/trading.tsx` — 포트폴리오 대시보드 + 거래 모드 헤더 통합
  - `packages/app/src/components/strategy/stock-sidebar.tsx` — 드래그 정렬 + 시세 인라인 + 마켓 필터 추가
  - `packages/app/src/components/strategy/types.ts` — 포트폴리오/주문 관련 타입 추가
  - `packages/server/src/routes/workspace/strategy.ts` — watchlist reorder API 추가
  - `packages/server/src/db/schema.ts` — sortOrder 컬럼 추가 (필요 시)
- **신규 파일:**
  - `packages/app/src/components/strategy/portfolio-dashboard.tsx`
  - `packages/app/src/components/strategy/trading-mode-header.tsx`
  - `packages/app/src/components/strategy/pending-orders.tsx`

### References

- [Source: _bmad-output/planning-artifacts/epics.md - E10-S7: 전략실 UI: 포트폴리오 + 관심종목, 3 SP, FR56/UX#3]
- [Source: _bmad-output/planning-artifacts/prd.md - FR56 포트폴리오 대시보드, FR59 자율/승인 실행 모드]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - CEO #3 전략실: Bloomberg 영감, 포트폴리오 카드+관심종목 리스트+차트 모달]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - 실거래 안전장치: 빨간/파란 헤더]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - dnd-kit: 관심종목 드래그 정렬]
- [Source: _bmad-output/planning-artifacts/architecture.md - strategy.ts 전략실 API (Phase 2)]
- [Source: _bmad-output/implementation-artifacts/10-6-real-paper-trading-separation.md - TradingMode, trading-status API, WebSocket 이벤트]
- [Source: packages/app/src/pages/trading.tsx - 기존 3패널 레이아웃]
- [Source: packages/app/src/components/strategy/stock-sidebar.tsx - 기존 관심종목 사이드바]
- [Source: packages/app/src/components/strategy/chart-panel.tsx - 기존 차트+시세 패널]
- [Source: packages/server/src/routes/workspace/strategy.ts - 기존 전략실 API 전체]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
