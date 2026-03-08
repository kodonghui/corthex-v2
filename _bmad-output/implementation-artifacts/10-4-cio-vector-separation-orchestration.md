# Story 10.4: CIO+VECTOR 분리 오케스트레이션

Status: done

## Story

As a CEO(이사장),
I want CIO(금융분석팀장)가 4명의 전문가와 병렬 투자 분석을 수행하고 종합한 뒤, VECTOR(실행봇)가 KIS API로 매매 주문을 실행하는 분리 구조를 사용할 수 있기를,
so that 투자 분석과 주문 실행이 명확히 분리되어 안전하고 체계적인 자동매매가 가능하다.

## Acceptance Criteria

1. **CIO 3단계 분석 파이프라인**
   - Given: CEO가 "/전체 리밸런싱 제안" 또는 투자 분석 명령을 입력했을 때
   - When: Chief-of-Staff가 투자 관련 명령을 투자부서 CIO에게 분류/위임하면
   - Then: CIO가 v1 패턴의 3-phase 분석을 실행한다:
     - Phase 1: 시황분석 + 종목분석 + 기술적분석 전문가 **병렬** 실행
     - Phase 2: Phase 1 결과를 리스크관리 전문가에게 **순차** 전달
     - Phase 3: CIO가 모든 분석 결과를 **종합** → 매매 제안 생성
   - And: 위임 체인(delegation tracker)에 CIO 분석 과정이 실시간 추적된다

2. **CIO 분석 결과에 구조화된 매매 제안 포함**
   - Given: CIO의 3-phase 분석이 완료되었을 때
   - When: CIO가 종합 보고서를 생성하면
   - Then: 보고서에 `[TRADE_PROPOSALS]` JSON 블록이 포함된다
   - And: 각 제안에는 ticker, side(buy/sell), quantity, price, reason, confidence(0~1), market(KR/US) 필드가 있다
   - And: confidence < 0.6인 제안은 "참고용"으로 표시된다

3. **VECTOR 주문 실행 서비스**
   - Given: CIO 분석 결과에 `[TRADE_PROPOSALS]` 블록이 있을 때
   - When: VECTOR 실행 서비스가 trade proposals를 파싱하면
   - Then: 각 제안을 KIS 어댑터(`kis-adapter.ts`)를 통해 주문 실행한다
   - And: 실행 결과(체결/미체결/거부)를 매매 제안별로 기록한다
   - And: 주문 기록이 `strategy_orders` 테이블에 영구 저장된다 (FR62)

4. **VECTOR 실행 전 검증**
   - Given: VECTOR가 매매 주문을 실행하기 전에
   - When: 주문을 검증하면
   - Then: 시장 운영시간(KR: 09:00-15:30, US: 09:30-16:00 EST)을 확인한다
   - And: tradingMode(real/paper)를 확인하여 분리 실행한다
   - And: 일일 매매 횟수 한도를 체크한다 (기본 20회/일)
   - And: 검증 실패 시 해당 주문을 스킵하고 사유를 기록한다

5. **기존 오케스트레이션 파이프라인 통합**
   - Given: 기존 chief-of-staff.ts의 classify → delegate → synthesize → qualityGate 파이프라인이 있을 때
   - When: 투자 분석 명령이 CIO에게 라우팅되면
   - Then: 기존 manager-delegate.ts의 병렬 specialist 패턴을 재사용하되, CIO 전용 3-phase 로직을 적용한다
   - And: CIO 종합 후 VECTOR 실행 단계가 추가된다 (synthesize → VECTOR execute → qualityGate)
   - And: quality gate는 기존 5항목 검수를 그대로 적용한다

6. **WebSocket 실시간 추적**
   - Given: CIO 분석 + VECTOR 실행이 진행될 때
   - When: 각 단계가 완료되면
   - Then: delegation tracker가 `strategy` 채널로 이벤트를 발행한다:
     - `cio:phase1:start`, `cio:phase1:complete`
     - `cio:phase2:start`, `cio:phase2:complete`
     - `cio:synthesis:start`, `cio:synthesis:complete`
     - `vector:validation:start`, `vector:execution:start`, `vector:execution:complete`
   - And: 클라이언트에서 위임 체인 진행을 실시간 확인할 수 있다

## Tasks / Subtasks

- [x] Task 1: CIO 오케스트레이션 서비스 생성 (AC: #1, #2)
  - [x]1.1 `packages/server/src/services/cio-orchestrator.ts` 생성
  - [x]1.2 `orchestrateCIO(options)` 함수: 3-phase 파이프라인 구현
  - [x]1.3 Phase 1: `dispatchSpecialists()` 재사용하여 시황/종목/기술 전문가 병렬 실행
  - [x]1.4 Phase 2: 리스크 전문가에게 Phase 1 결과 순차 전달 (`agentRunner.execute()` 사용)
  - [x]1.5 Phase 3: CIO 종합 프롬프트에 `[TRADE_PROPOSALS]` JSON 블록 생성 지시 포함
  - [x]1.6 delegation tracker 이벤트 발행 (phase별)

- [x] Task 2: VECTOR 실행 서비스 생성 (AC: #3, #4)
  - [x]2.1 `packages/server/src/services/vector-executor.ts` 생성
  - [x]2.2 `parseTradeProposals(content)`: CIO 결과에서 `[TRADE_PROPOSALS]` JSON 파싱
  - [x]2.3 `validateOrder(proposal, companyId, userId)`: 시장시간/거래모드/일일한도 검증
  - [x]2.4 `executeProposals(proposals, options)`: 검증 통과한 제안들을 KIS 어댑터로 실행
  - [x]2.5 실행 결과를 `strategy_orders` 테이블에 기록 (`kis-adapter.ts` → `executeOrder()`)
  - [x]2.6 delegation tracker 이벤트 발행 (vector 단계)

- [x] Task 3: Chief-of-Staff 통합 (AC: #5)
  - [x]3.1 `chief-of-staff.ts`의 `process()` 함수에 투자 부서 감지 로직 추가
  - [x]3.2 투자 부서 명령일 때 `orchestrateCIO()` → `executeProposals()` 체인 호출
  - [x]3.3 VECTOR 실행 결과를 품질 검수(quality gate) 대상에 포함
  - [x]3.4 최종 결과에 CIO 분석 + VECTOR 실행 결과를 통합하여 CEO에게 보고

- [x] Task 4: WebSocket 이벤트 추가 (AC: #6)
  - [x]4.1 `delegation-tracker.ts`에 CIO/VECTOR 전용 이벤트 메서드 추가
  - [x]4.2 기존 `strategy` WebSocket 채널에 이벤트 발행

- [x] Task 5: 타입 정의 (전체 AC)
  - [x]5.1 `packages/shared/src/types/` 에 `TradeProposal` 타입 추가 (또는 기존 파일에 추가)
  - [x]5.2 CIO 오케스트레이션 결과 타입, VECTOR 실행 결과 타입 정의

## Dev Notes

### v1 CIO Manager 3-Phase 패턴 (필수 포팅)

```python
# v1: /home/ubuntu/CORTHEX_HQ/src/divisions/finance/investment/cio_manager.py
class CIOManagerAgent(ManagerAgent):
    PARALLEL_AGENT_IDS = [
        "market_condition_specialist",   # 시황분석
        "stock_analysis_specialist",     # 종목분석
        "technical_analysis_specialist", # 기술적분석
    ]
    RISK_AGENT_ID = "risk_management_specialist"

    Phase 1: asyncio.gather(*parallel_tasks)  # 병렬 실행
    Phase 2: risk_agent.handle_task(combined)  # 순차 — Phase 1 결과 기반
    Phase 3: self._synthesize_results(all_results)  # CIO 종합
```

v2에서는 이 패턴을 기존 `manager-delegate.ts`의 `dispatchSpecialists()` + `agentRunner.execute()`로 구현. 단, **Phase 2의 순차 실행(리스크 전문가)**이 기존 패턴(전부 병렬)과 다른 점이 핵심.

### 기존 오케스트레이션 구조 — 재사용할 것

| 파일 | 역할 | CIO 스토리에서의 사용 |
|------|------|---------------------|
| `services/chief-of-staff.ts` | 분류 → 위임 → 품질검수 | 진입점. 투자 부서 감지 시 CIO 오케스트레이터 호출 |
| `services/manager-delegate.ts` | Manager + Specialist 병렬 | Phase 1 병렬 실행에 `dispatchSpecialists()` 재사용 |
| `services/manager-synthesis.ts` | Manager 종합 보고서 | Phase 3에 `buildSynthesisPrompt()` 패턴 참고 (단, trade proposal JSON 추가) |
| `services/agent-runner.ts` | 에이전트 LLM 실행 | Phase 2 리스크 전문가 단독 실행, VECTOR 실행 |
| `services/delegation-tracker.ts` | WebSocket 이벤트 | CIO/VECTOR 이벤트 추가 |
| `services/kis-adapter.ts` | KIS 매매 주문 | VECTOR가 `executeOrder()` 호출 |

### CIO 종합 프롬프트 — Trade Proposal 포맷

CIO 종합(Phase 3) 시 아래 지시를 프롬프트에 포함해야 함:

```
종합 보고서 끝에 반드시 아래 형식의 매매 제안을 포함하세요:

[TRADE_PROPOSALS]
[
  {
    "ticker": "005930",
    "tickerName": "삼성전자",
    "side": "buy",
    "quantity": 10,
    "price": 70000,
    "reason": "PER 저평가 + 기술적 반등 신호",
    "confidence": 0.82,
    "market": "KR"
  }
]
[/TRADE_PROPOSALS]

confidence 기준:
- 0.8+: 강력 추천
- 0.6~0.8: 일반 추천
- 0.6 미만: 참고용 (실행 불가)
매매 제안이 없으면 빈 배열 []을 넣으세요.
```

### VECTOR 실행 — KIS 어댑터 연동

```typescript
// vector-executor.ts 핵심 흐름
import { executeOrder, type OrderParams } from './kis-adapter'

// 1. CIO 결과에서 trade proposals 파싱
const proposals = parseTradeProposals(cioResult)

// 2. 각 proposal 검증
for (const p of proposals) {
  if (p.confidence < 0.6) continue  // 참고용은 스킵
  const validation = await validateOrder(p, companyId, userId)
  if (!validation.valid) { log(validation.reason); continue }

  // 3. KIS 어댑터로 주문 실행
  const result = await executeOrder({
    companyId, userId,
    ticker: p.ticker,
    tickerName: p.tickerName,
    side: p.side,
    quantity: p.quantity,
    price: p.price,
    orderType: p.price > 0 ? 'limit' : 'market',
    tradingMode: settings.tradingMode,  // from CEO settings
    market: p.market,
    reason: `CIO 분석: ${p.reason}`,
    agentId: vectorAgentId,
  })
  results.push(result)
}
```

### 주문 검증 로직

```typescript
function validateOrder(proposal, companyId, userId): { valid: boolean; reason?: string } {
  // 1. 시장 운영시간 체크
  if (proposal.market === 'KR') {
    // 09:00-15:30 KST
  } else if (proposal.market === 'US') {
    // 09:30-16:00 EST (23:30-06:00 KST 다음날)
  }

  // 2. 일일 매매 한도 체크 (기본 20회)
  // strategy_orders 테이블에서 오늘 실행된 주문 수 카운트

  // 3. confidence 체크
  if (proposal.confidence < 0.6) return { valid: false, reason: '낮은 확신도' }

  return { valid: true }
}
```

### Chief-of-Staff 통합 방법

`chief-of-staff.ts`의 `process()` 함수에서 classify 결과가 투자 부서일 때 분기:

```typescript
// chief-of-staff.ts process() 내부
const classification = await classify(...)

// 투자 부서 감지: 부서명에 "투자" 또는 "금융" 포함, 또는 department 메타데이터
if (isInvestmentDepartment(classification.departmentId)) {
  // CIO 3-phase 오케스트레이션
  const cioResult = await orchestrateCIO({
    manager, commandText, companyId, commandId, toolExecutor,
  })
  // VECTOR 실행 (trade proposals가 있을 때만)
  const vectorResult = await executeVectorProposals(cioResult, {
    companyId, userId, commandId,
  })
  // 통합 결과 반환 (CIO 분석 + VECTOR 실행 결과)
  content = formatCIOVectorResult(cioResult, vectorResult)
} else {
  // 기존 manager-delegate → synthesize 흐름
  ...
}
```

**`isInvestmentDepartment()` 구현**: departments 테이블에서 이름/설명이 "투자", "금융", "finance", "investment" 키워드를 포함하는지 체크. 동적 조직이므로 부서명을 하드코딩하면 안 됨 — 키워드 매칭 또는 department 메타데이터 필드 사용.

### delegation-tracker 이벤트 추가

```typescript
// delegation-tracker.ts에 추가할 메서드
cioPhaseStarted(companyId, commandId, phase: 1 | 2 | 3, managerId, managerName)
cioPhaseCompleted(companyId, commandId, phase: 1 | 2 | 3, managerId, managerName, durationMs)
vectorValidationStarted(companyId, commandId)
vectorExecutionStarted(companyId, commandId, proposalCount)
vectorExecutionCompleted(companyId, commandId, results: { executed, skipped, failed })
```

### TradeProposal 타입 정의

```typescript
// packages/shared/src/types/ 또는 vector-executor.ts 내부
export type TradeProposal = {
  ticker: string
  tickerName: string
  side: 'buy' | 'sell'
  quantity: number
  price: number  // 0 = market order
  reason: string
  confidence: number  // 0~1
  market: 'KR' | 'US'
}

export type VectorExecutionResult = {
  totalProposals: number
  executed: number
  skipped: number  // confidence < 0.6 or validation failure
  failed: number
  orders: Array<{
    proposal: TradeProposal
    status: 'executed' | 'skipped' | 'failed'
    orderId?: string
    kisOrderNo?: string
    reason?: string
  }>
}
```

### Project Structure Notes

- **신규 파일:**
  - `packages/server/src/services/cio-orchestrator.ts` — CIO 3-phase 분석 오케스트레이션
  - `packages/server/src/services/vector-executor.ts` — VECTOR 매매 실행 서비스
- **수정 파일:**
  - `packages/server/src/services/chief-of-staff.ts` — 투자 부서 분기 + CIO/VECTOR 호출
  - `packages/server/src/services/delegation-tracker.ts` — CIO/VECTOR 이벤트 추가
  - `packages/shared/src/types/` — TradeProposal, VectorExecutionResult 타입 (기존 타입 파일에 추가)
- **테스트:**
  - `packages/server/src/__tests__/unit/cio-orchestrator.test.ts`
  - `packages/server/src/__tests__/unit/vector-executor.test.ts`

### 기존 파일 절대 수정 금지
- `services/manager-delegate.ts` — 재사용만 (import하여 dispatchSpecialists 호출)
- `services/manager-synthesis.ts` — 패턴 참고만 (CIO 전용 프롬프트는 cio-orchestrator에서 별도 구현)
- `services/kis-adapter.ts` — 재사용만 (import하여 executeOrder 호출)
- `services/agent-runner.ts` — 재사용만

### 중복 방지 — 기존 코드와의 관계

| 기존 코드 | CIO/VECTOR 관계 |
|-----------|----------------|
| `manager-delegate.ts` → `dispatchSpecialists()` | CIO Phase 1에서 그대로 재사용 |
| `manager-synthesis.ts` → `buildSynthesisPrompt()` | CIO Phase 3은 **별도 프롬프트** (trade proposal JSON 추가) |
| `kis-adapter.ts` → `executeOrder()` | VECTOR가 직접 호출 |
| `chief-of-staff.ts` → `process()` | 투자 부서 감지 분기 추가 (기존 흐름 변경 안 함) |

### 테스트 패턴

- bun:test 사용
- CIO 오케스트레이터: agentRunner.execute mock, dispatchSpecialists mock
- VECTOR: parseTradeProposals 파싱 정확성, validateOrder 경계값, executeOrder mock
- 통합: process() 내 투자 부서 분기 확인

### References

- [Source: _bmad-output/planning-artifacts/epics.md - E10-S4, FR57, FR58]
- [Source: _bmad-output/planning-artifacts/prd.md - FR57 CIO+전문가 병렬 분석, FR58 VECTOR KIS 매매]
- [Source: packages/server/src/services/chief-of-staff.ts - 메인 오케스트레이션 파이프라인]
- [Source: packages/server/src/services/manager-delegate.ts - dispatchSpecialists, managerSelfAnalysis]
- [Source: packages/server/src/services/manager-synthesis.ts - buildSynthesisPrompt 패턴]
- [Source: packages/server/src/services/kis-adapter.ts - executeOrder, OrderParams]
- [Source: packages/server/src/services/delegation-tracker.ts - WebSocket 이벤트 발행]
- [Source: packages/server/src/services/agent-runner.ts - execute()]
- [Source: /home/ubuntu/CORTHEX_HQ/src/divisions/finance/investment/cio_manager.py - v1 CIO 3-phase 패턴]
- [Source: /home/ubuntu/CORTHEX_HQ/src/tools/trading_executor.py - v1 VECTOR 실행 패턴]
- [Source: _bmad-output/implementation-artifacts/10-3-finance-tools-5-implementation.md - 이전 스토리]
- [Source: _bmad-output/implementation-artifacts/10-2-kis-securities-api-adapter.md - KIS 어댑터 스토리]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- v1 CIO Manager 3-phase 패턴 분석 완료 (병렬 → 순차 리스크 → 종합)
- v1 VECTOR(trading_executor) 실행 패턴 분석 완료
- 기존 v2 오케스트레이션 파이프라인 분석 완료 (chief-of-staff → manager-delegate → manager-synthesis)
- KIS 어댑터 재사용 전략 확정 (executeOrder 직접 호출)
- CIO 전용 종합 프롬프트에 [TRADE_PROPOSALS] JSON 블록 포맷 설계
- VECTOR 주문 검증 로직 설계 (시장시간/거래모드/일일한도/confidence)
- WebSocket delegation tracker 이벤트 설계 완료
- chief-of-staff.ts 통합 방법 설계 (투자 부서 감지 → CIO → VECTOR → qualityGate)

### File List

- `packages/server/src/services/cio-orchestrator.ts` — **신규** CIO 3-phase 분석 오케스트레이션
- `packages/server/src/services/vector-executor.ts` — **신규** VECTOR 매매 실행 서비스
- `packages/server/src/services/chief-of-staff.ts` — **수정** 투자 부서 분기 + CIO/VECTOR 호출 추가
- `packages/server/src/services/delegation-tracker.ts` — **수정** CIO/VECTOR 이벤트 메서드 추가
- `packages/shared/src/types/` — **수정** TradeProposal, VectorExecutionResult 타입 추가
- `packages/server/src/__tests__/unit/cio-orchestrator.test.ts` — **신규** CIO 테스트
- `packages/server/src/__tests__/unit/vector-executor.test.ts` — **신규** VECTOR 테스트
