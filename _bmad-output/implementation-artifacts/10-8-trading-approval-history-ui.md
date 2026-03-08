# Story 10.8: 매매 승인/이력 UI

Status: ready-for-dev

## Story

As a CEO(이사장),
I want 전략실에서 매매 승인 대기 주문을 확인/승인/거부하고, 전체 주문 이력을 필터링하여 조회할 수 있다,
so that 자동매매의 실행 과정을 투명하게 통제하고 과거 주문의 감사 추적이 가능하다.

## Acceptance Criteria

1. **Given** 전략실 페이지 **When** "승인/이력" 탭(또는 패널) 클릭 **Then** 승인 대기 주문 큐 + 주문 이력 테이블이 표시된다
2. **Given** 승인 대기 주문 목록 **When** 개별 "승인" 클릭 **Then** 주문 상세(종목/수량/가격/CIO 분석 이유/확신도) 확인 후 승인 → 상태가 executed로 변경, toast 표시
3. **Given** 승인 대기 주문 목록 **When** 개별 "거부" 클릭 **Then** 거부 사유 입력 후 확인 → 상태가 rejected로 변경
4. **Given** 승인 대기 주문이 2건 이상 **When** 체크박스로 다중 선택 후 "일괄 승인" 또는 "일괄 거부" **Then** 선택된 주문 모두 처리, 결과 요약 toast
5. **Given** 주문 이력 테이블 **When** 상태/종목/매매방향/거래모드 필터 적용 **Then** 필터링된 결과 표시 (cursor 페이지네이션)
6. **Given** 주문 이력 **When** 행 클릭 **Then** 주문 상세 모달: 종목명, 수량, 가격, 총액, 주문유형, 상태, 사유, KIS주문번호, 생성시각, 체결시각
7. **Given** WebSocket strategy 채널 구독 중 **When** `trade:pending_approval` 이벤트 수신 **Then** 승인 대기 목록 자동 갱신 + 뱃지 카운트 업데이트
8. **Given** 주문 요약 영역 **When** 페이지 로드 **Then** 주문 통계 카드 표시: 총 주문수, 체결 건수, 거부 건수, 실패 건수 (tradingMode별)
9. `turbo build` 3/3 성공

## Tasks / Subtasks

- [ ] Task 1: ApprovalQueue 컴포넌트 (AC: #1, #2, #3, #4, #7)
  - [ ] `packages/app/src/components/strategy/approval-queue.tsx` 신규
    - GET /orders/pending → 승인 대기 목록 표시
    - 각 항목: 종목명, 수량, 가격, 총액, CIO 분석 이유, 확신도 추출
    - "승인" → POST /orders/:id/approve → 성공 시 목록 갱신 + toast
    - "거부" → 사유 입력 프롬프트 → POST /orders/:id/reject
    - 체크박스 다중 선택 → "일괄 승인" / "일괄 거부" 버튼
    - WebSocket strategy 채널에서 `trade:pending_approval` 이벤트 시 React Query invalidate

- [ ] Task 2: OrderHistory 컴포넌트 (AC: #5, #6)
  - [ ] `packages/app/src/components/strategy/order-history.tsx` 신규
    - GET /orders (cursor 페이지네이션, limit=20)
    - 필터 바: 상태(7종), 종목, 매매방향(buy/sell), 거래모드(real/paper)
    - 테이블 컬럼: 종목명, 방향(매수/매도 뱃지), 수량, 가격, 총액, 상태 뱃지, 일시
    - 행 클릭 → OrderDetailModal
    - "더 보기" → cursor 기반 다음 페이지 로드

- [ ] Task 3: OrderDetailModal 컴포넌트 (AC: #6)
  - [ ] `packages/app/src/components/strategy/order-detail-modal.tsx` 신규
    - GET /orders/:id → 상세 표시
    - 필드: 종목명, 종목코드, 방향, 수량, 가격, 총액, 주문유형, 거래모드, 상태(색상 뱃지), 사유, KIS주문번호, 에이전트, 생성시각, 체결시각

- [ ] Task 4: OrderSummary 통계 카드 (AC: #8)
  - [ ] `packages/app/src/components/strategy/order-summary.tsx` 신규
    - GET /orders/summary → 통계 표시
    - 카드 4개: 총 주문, 체결, 거부, 실패 (tradingMode별 분리 가능)

- [ ] Task 5: TradingPage 통합 (AC: #1)
  - [ ] `packages/app/src/pages/trading.tsx` 수정
    - 데스크탑: 3패널 레이아웃 유지, ChatPanel 자리에 탭 전환 (채팅 / 승인·이력)
    - 또는: 모바일 탭에 "승인" 탭 추가
    - 승인 대기 건수 뱃지 표시

- [ ] Task 6: 빌드 확인 (AC: #9)
  - [ ] `npx turbo build --force` 3/3 성공

## Dev Notes

### 핵심 설계: 기존 API 100% 활용, 프론트엔드만 신규

**백엔드 API 전부 구현 완료** (Story 10-5에서 완성). 이 스토리는 순수 프론트엔드 UI 스토리:

| API 엔드포인트 | 메서드 | 용도 |
|---|---|---|
| `/api/workspace/strategy/orders/pending` | GET | 승인 대기 목록 |
| `/api/workspace/strategy/orders/:id/approve` | POST | 단건 승인 |
| `/api/workspace/strategy/orders/:id/reject` | POST | 단건 거부 (body: `{ reason }`) |
| `/api/workspace/strategy/orders/bulk-approve` | POST | 일괄 승인 (body: `{ orderIds }`) |
| `/api/workspace/strategy/orders/bulk-reject` | POST | 일괄 거부 (body: `{ orderIds, reason }`) |
| `/api/workspace/strategy/orders` | GET | 주문 이력 (query: cursor, limit, ticker, side, status, tradingMode) |
| `/api/workspace/strategy/orders/:id` | GET | 주문 단건 조회 |
| `/api/workspace/strategy/orders/summary` | GET | 주문 통계 (query: tradingMode) |

### DB 스키마 (이미 존재, 변경 없음)

```typescript
// strategy_orders 테이블 (packages/server/src/db/schema.ts:720)
{
  id, companyId, userId, portfolioId, agentId,
  ticker, tickerName, side, quantity, price, totalAmount,
  orderType, tradingMode, status, reason,
  kisOrderNo, executedAt, createdAt
}
// status enum: 'pending_approval' | 'pending' | 'submitted' | 'executed' | 'cancelled' | 'rejected' | 'failed'
```

### WebSocket 실시간 갱신

```typescript
// strategy 채널 구독 (기존 패턴 참고: packages/app/src/lib/use-websocket.ts)
// 이벤트: { type: 'trade:pending_approval', commandId, pendingCount, proposals }
// 수신 시 → queryClient.invalidateQueries({ queryKey: ['strategy-pending'] })
```

기존 WebSocket 패턴 참고 (ARGOS UI 14-5에서 사용된 방식):
```typescript
const { lastMessage } = useWebSocket()
useEffect(() => {
  if (lastMessage?.type === 'trade:pending_approval') {
    queryClient.invalidateQueries({ queryKey: ['strategy-pending'] })
  }
}, [lastMessage])
```

### 공유 타입 (packages/shared/src/types.ts, 이미 정의됨)

```typescript
type ExecutionMode = 'autonomous' | 'approval'
type TradingMode = 'real' | 'paper'
type TradeApprovalAction = 'approve' | 'reject'
type TradeApprovalResult = {
  orderId: string; action: TradeApprovalAction
  success: boolean; message?: string; kisOrderNo?: string
}
```

### UI 레이아웃 설계

**데스크탑 (3패널 유지):**
```
┌──────────────┬───────────────────────┬──────────────────┐
│ StockSidebar │     ChartPanel        │ 탭: 채팅 | 승인  │
│ (종목 목록)   │     (차트+백테스트)     │                  │
│              │                       │ [승인 대기 (3)]   │
│              │                       │ ┌──────────────┐ │
│              │                       │ │ 삼성전자 매수  │ │
│              │                       │ │ 100주 ₩72,000│ │
│              │                       │ │ [승인] [거부]  │ │
│              │                       │ ├──────────────┤ │
│              │                       │ │ [☐ 일괄선택]  │ │
│              │                       │ ├──────────────┤ │
│              │                       │ │ 주문 이력      │ │
│              │                       │ │ 필터: [상태▾]  │ │
│              │                       │ │ 종목|방향|상태 │ │
│              │                       │ └──────────────┘ │
└──────────────┴───────────────────────┴──────────────────┘
```

**모바일:**
```
[차트] [채팅] [승인]  ← 탭 추가
```

### 상태 뱃지 색상 매핑

| 상태 | 색상 | 한글 |
|------|------|------|
| pending_approval | amber/yellow | 승인 대기 |
| pending | blue | 처리 중 |
| submitted | indigo | 전송됨 |
| executed | green | 체결 |
| cancelled | gray | 취소 |
| rejected | red | 거부 |
| failed | red/dark | 실패 |

### UI 패턴 준수 (이전 스토리에서 확인된 필수 사항)

- `ConfirmDialog`: `isOpen` / `onConfirm` / `onCancel` / `variant="danger"` (NOT `open`/`onOpenChange`/`variant="destructive"`)
- `toast`: `@corthex/ui`에서 import (NOT `sonner`)
- `Input`, `Card`, `Badge`, `Button`, `EmptyState`: `@corthex/ui`에서 import
- React Query 키: `['strategy-pending']`, `['strategy-orders', filters]`, `['strategy-order', orderId]`, `['strategy-orders-summary']`
- API 래퍼: `api.get/post` from `../../lib/api`
- 금액 포맷: `Intl.NumberFormat('ko-KR')` 또는 기존 포맷 유틸
- 모바일 대응: `fixed inset-0 sm:static` 모달 패턴

### 이전 스토리 학습사항 (Epic 10 전체)

- **10-1**: UUID params에 zValidator 필수, 중첩 button 금지
- **10-3**: 종목코드 정규식 (`/^[A-Za-z0-9]{1,20}$/`), Promise.allSettled 병렬
- **10-4**: toast는 `@corthex/ui`에서 import, 모바일 `fixed inset-0 sm:static`, **마이그레이션 저널 태그 파일명 일치**
- **10-5**: CSV injection 방지 `csvSafe()`, 보고서 다운로드 패턴
- **10-6**: URL 기반 상태 — useState 대신 searchParams 직접 사용, 빈 상태 처리
- **10-7**: lightweight-charts `series.setMarkers()` 마커 API, 프론트엔드 순수 함수 패턴

### 이 스토리에서 하지 않는 것

- 백엔드 API 변경/추가 (전부 구현 완료)
- DB 스키마/마이그레이션 변경 (불필요)
- 주문 삭제 기능 (FR62: 영구 보존, DELETE 금지)
- 매매 실행 로직 (10-5에서 완성)
- 거래 설정 UI (10-5/10-6에서 완성)

### Project Structure Notes

- 신규 파일은 `packages/app/src/components/strategy/` 디렉터리에 생성
- 기존 trading.tsx 페이지에 탭 또는 패널로 통합
- @corthex/ui 공유 컴포넌트 활용 (Card, Badge, Button, EmptyState, ConfirmDialog 등)
- packages/shared/src/types.ts의 기존 타입 재사용

### 파일 구조

```
수정 파일:
  packages/app/src/pages/trading.tsx (탭 추가: 채팅/승인·이력)

신규 파일:
  packages/app/src/components/strategy/approval-queue.tsx (승인 대기 큐)
  packages/app/src/components/strategy/order-history.tsx (주문 이력 테이블)
  packages/app/src/components/strategy/order-detail-modal.tsx (주문 상세 모달)
  packages/app/src/components/strategy/order-summary.tsx (주문 통계 카드)
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md] E10-S8: 매매 승인/이력 UI (SP: 2, PRD: FR59, FR62, 의존성: E10-S5)
- [Source: _bmad-output/planning-artifacts/prd.md] FR59: 자율/승인 실행 모드 선택, FR62: 주문 이력 영구 보존
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] CEO #3 전략실: 포트폴리오 카드 + 관심종목 + 승인 버튼
- [Source: packages/server/src/services/trade-approval.ts] 승인/거부/일괄 처리 서비스 (완성됨)
- [Source: packages/server/src/routes/workspace/strategy.ts:1311-1365] 승인 API 라우트 (완성됨)
- [Source: packages/shared/src/types.ts:825-882] TradeApprovalResult, ExecutionMode, TradingMode 타입
- [Source: packages/server/src/db/schema.ts:719-743] strategyOrders 테이블 스키마
- [Source: _bmad-output/implementation-artifacts/10-7-backtest-results.md] 이전 스토리 학습

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
