---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests', 'step-03c-aggregate', 'step-04-selective-testing']
lastStep: 'step-04-selective-testing'
lastSaved: '2026-03-08'
story: '10-2-kis-securities-api-adapter'
---

# TEA Automation Summary — Story 10-2: KIS Securities API Adapter

## Preflight & Context

- **Stack**: fullstack (server: Hono+Bun, client: React+Vite)
- **Test Framework**: bun:test
- **Mode**: BMad-Integrated (story file + acceptance criteria)
- **TEA Config**: No Playwright, No Pact, Backend-focused

## Coverage Plan

### Risk Analysis

| Area | Risk Level | Impact | Coverage Priority |
|------|-----------|--------|------------------|
| TR_ID 선택 (실/모의) | P0 Critical | 구 TR_ID 사용 시 주문 차단 | 신규 TR_ID 검증 |
| 실거래/모의거래 분리 | P0 Critical | 잘못된 서버로 주문 전송 가능 | Base URL 분기 검증 |
| 주문 Body 구성 | P0 Critical | 잘못된 필드 → 주문 거부 | 국내/해외 body 검증 |
| 잔고 조회 파싱 | P1 Important | 잘못된 필드 → 잘못된 잔고 표시 | nxdy_excc_amt 검증 |
| 토큰 캐시 격리 | P1 Important | 실/모의 토큰 혼동 가능 | 캐시 키 분리 검증 |
| Paper Trading 가상 체결 | P1 Important | 포트폴리오 업데이트 오류 | 잔고/수량 검증 |
| 시장 시간 검증 | P2 Secondary | 장외 주문 시도 방지 | KR/US 시간 검증 |
| 거래소 코드 매핑 | P2 Secondary | 주문/시세 코드 혼동 | 매핑 분리 검증 |
| 토큰 만료 재시도 | P2 Secondary | 1회 재시도 로직 | EGW00123 감지 |
| 계좌번호 파싱 | P3 Optional | 8/10자리 파싱 | 서브스트링 검증 |

### Test Coverage by Level

| Level | Count | Focus |
|-------|-------|-------|
| Unit - KIS Auth | 18 | TR_ID, Base URL, Exchange Codes, Headers |
| Unit - Order Construction | 8 | Domestic/Overseas body, SLL_TYPE, ORD_DVSN |
| Unit - Balance Parsing | 5 | nxdy_excc_amt, holdings filter, totalEval correction |
| Unit - Paper Trading | 5 | Avg price calc, balance check, holdings update |
| Unit - Market Hours | 4 | KR/US time ranges, weekends |
| Unit - Error Handling | 4 | Token expiry, cooldown, false positives |
| Unit - Tool Handler | 6 | Input validation, defaults |
| Unit - Backward Compat | 3 | Legacy exports, function signatures |
| Unit - Account Parsing | 3 | 8-digit, 10-digit, explicit suffix |
| Integration (mock) | 5 | Exchange codes, cache isolation, type validation |
| **Total** | **61** | |

## Test File

- `packages/server/src/__tests__/unit/kis-adapter.test.ts` — 61 tests, 152 expect() calls

## Risk Mitigations Applied

1. **P0 구 TR_ID 차단 방지**: 모든 TR_ID가 신규(TTTC0012U/0011U)인지 검증, 구(0802U/0801U) 아님을 명시적 체크
2. **P0 실/모의 서버 분리**: getKisBaseUrl 함수가 tradingMode에 따라 올바른 URL 반환 검증
3. **P1 잔고 필드 혼동 방지**: nxdy_excc_amt(정확) vs dnca_tot_amt(부정확) 구분 테스트
4. **P1 토큰 캐시 혼동 방지**: 캐시 키에 tradingMode 포함 여부 검증
5. **P2 거래소 코드 혼동 방지**: order(NASD) vs price(NAS) 매핑이 다른지 검증

## Conclusion

61개 테스트로 Story 10-2의 7개 Acceptance Criteria를 모두 커버합니다.
가장 높은 위험(P0)인 TR_ID 선택과 실/모의 서버 분리에 집중적인 테스트를 배치했습니다.
