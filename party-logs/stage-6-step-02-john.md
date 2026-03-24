# Critic-C Review — Step 2: Design Epics

**Reviewer:** John (PM, Critic-C: Product + Delivery)
**Date:** 2026-03-24
**File:** `_bmad-output/planning-artifacts/epics-and-stories.md` (L825-L1291)

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 9/10 | 모든 에픽에 Sprint, Go/No-Go 게이트 번호, 예상 스토리 수 범위, 정확한 AR/NFR/DSR 참조, 마이그레이션 파일명(`0062`, `0063`, `0064`), 번들 크기(200KB), 정량 임계값(cosine≥0.75, $0.10/day) 포함. Implementation notes에 파일 경로, 함수 시그니처, Hook 포인트(PreToolResult L265/L277) 등 복붙 수준 구체성. |
| D2 완전성 | 20% | 8/10 | **FR 123개 전부 매핑** (53 new + 3 UX → Epic 22-29, 66 carry-forward → touchpoint table, 4 deferred, 2 deleted). **DSR 80개 전부 매핑**. **UXR 140개 전부 매핑**. **14 Go/No-Go 전부 할당**. AR 76개 매핑. 그러나: (1) UXR57-58(WebSocket auto-reconnect), UXR60(Chat SSE streaming), UXR61(disconnect banner)는 **범용 WebSocket/Chat 패턴**인데 Epic 29(OpenClaw)에만 할당 — Epic 23 또는 cross-cutting이 맞음. (2) Overview L16의 NFR count "76"이 실제 body의 81개(+S11~S14, +P18)와 불일치. |
| D3 정확성 | 15% | 8/10 | Epic→Sprint 배정이 PRD Sprint 구조와 정확히 일치 (Pre→S1→S2→S3→S4, Layer 0 parallel). Go/No-Go 게이트 14개 전부 AR62와 정합. Epic 의존성 체인 정확 (22→23∥24→25→26, 27∥, 28→29). 그러나: bob의 NFR count "76+4"는 실제 76+5 (S11-14 + P18). Overview L16도 미갱신. |
| D4 실행가능성 | 15% | 9/10 | 에픽별 구조 일관: Sprint, Go/No-Go, 예상 스토리, User Outcome, FRs, ARs, NFRs, DSRs, UXRs, Implementation Notes, Dependencies. 의존성 체인이 명확하여 Step 3 스토리 설계에 바로 사용 가능. Implementation Sequence 다이어그램(L1258-1266)과 Go/No-Go Gate Sequence 테이블(L1270-1276)이 실행 로드맵으로 충분. |
| D5 일관성 | 10% | 8/10 | Epic 번호 체계 v2 연속(22-29). Sprint 순서 AR71 일치. 용어 PRD 정합. 그러나 Step 1 inventory overview(L16)의 NFR count와 body 실제 count 불일치 — Step 1-2 간 consistency gap. |
| D6 리스크 | 20% | 8/10 | Go/No-Go 게이트가 sprint exit마다 구체적 검증 기준 포함 (e.g., #10: `SELECT count(*) WHERE embedding IS NULL = 0`). 에픽 의존성 명시. AR2 비가역 마이그레이션 경고. 그러나: (1) **Epic 23(UXUI) 12-15 스토리로 ~67페이지 + 컴포넌트 라이브러리 + 접근성 기반** 커버가 빡빡 — Layer 0 ≥60% by Sprint 2 deadline 리스크 미언급. (2) Epic 26에 Go/No-Go 게이트 없음 — 외부 AI API 의존성(이미지/영상) 높은데 검증 지점 부재. |

## 가중 평균: 8.35/10 ✅ PASS

**계산:** (9×0.20) + (8×0.20) + (8×0.15) + (9×0.15) + (8×0.10) + (8×0.20) = 1.80 + 1.60 + 1.20 + 1.35 + 0.80 + 1.60 = **8.35/10**

## 이슈 목록 (Priority Order)

### 1. **[D2 완전성] UXR57-58, UXR60-61의 Epic 29 단독 할당 부적절** — MODERATE
- UXR57 (WebSocket auto-reconnect 3s/5회), UXR58 (5회 실패 "Please refresh"), UXR61 (disconnect banner "Reconnecting... 2/5")은 **모든 16+1 WebSocket 채널에 적용되는 범용 패턴**
- UXR60 (Chat SSE streaming token-by-token + blinking cursor)은 **Hub/Chat 기능** — OpenClaw와 무관
- 현재: 전부 Epic 29(OpenClaw)에만 할당
- **Fix**: UXR57-58, UXR60-61을 Epic 23(Design System)으로 이동 또는 "Cross-cutting" 표기. Epic 29에는 UXR56(office-specific), UXR59(heartbeat), UXR62(office FCP) 유지

### 2. **[D6 리스크] Epic 23(UXUI) 스토리 추정치 vs 스코프 불균형** — MINOR
- 12-15 스토리로 커버 대상: UXR1-55(responsive+shell+tokens+a11y+animation=55개), UXR72-78(navigation=7개), UXR79-95(user flow+onboarding=17개), UXR97/99/100(3 custom components), UXR103-140(empty states+modals+forms+toasts+buttons+search+perf+testing+state=38개) = **~120 UXRs + FR-UX1~3 + ~67 page migration**
- v2 Phase 7(UXUI redesign)은 14 steps, 2998 lines의 산출물이 필요했음
- Layer 0 ≥60% by Sprint 2 end (AR71 red line)이 이 추정치로 달성 가능한지 불명확
- **Fix**: Epic 23에 "Layer 0 ≥60% milestone" sub-target 추가 + Sprint 2 말 시점 완료 기준 정의

### 3. **[D3/D5 정확성+일관성] NFR count 불일치** — MINOR
- Overview L16: "76 active NFRs" — Step 1 원본 count
- Body: NFR-S11~S14 + NFR-P18 추가 = 실제 **81개**
- bob의 review request: "76+4" = 80 (P18 누락?)
- **Fix**: Overview L16의 NFR count를 81로 갱신. "76+5 (S11-14 from Architecture security audit, P18 from Architecture performance)"

### 4. **[D6 리스크] Epic 26(Marketing) Go/No-Go 게이트 부재** — MINOR
- 8개 에픽 중 유일하게 Go/No-Go 게이트 없음
- 외부 AI API 의존성 높음 (이미지 3종+, 영상 4종+, 나레이션 2종, 자막 3종)
- MKT-2 fallback 테스트, FR-MKT7 장애 전환 검증 등 품질 체크포인트 필요
- **Fix**: Epic 26의 Go/No-Go에 marketing-specific 검증 추가 또는 Sprint 2 exit의 #3/#11과 번들로 "n8n E2E: marketing preset 실행 성공" 조건 추가

## Cross-talk 요약

- **Winston (Critic-A)**: UXR56-62 assignment 확인 요청 — WebSocket 범용 패턴(57/58/60/61) vs OpenClaw-specific(56/59/62) 구분이 Architecture 관점에서도 맞는지 → **합의 완료**: 3 Critic 모두 UXR57-58/60-61 → Epic 23 이동 동의
- **Quinn (Critic-B)**: Epic 26 Go/No-Go 부재 — marketing preset E2E 테스트 관점에서 Sprint 2 exit gate에 포함 필요성 확인 → **합의 완료**: marketing E2E gate 필수
- **Winston (Critic-A)**: NFR-S11~S14/P18 출처 검증 → Writer-added, 합리적. AR 충돌 없음 확인. v2 carry-forward FR table 66개 검증 완료.
- **Quinn (Critic-B)**: ≥60% metric → PRD L441 공식 확인, Epic 23 + Sprint 2 exit gate #6에 명시 필요

---

## Re-Review After Fixes (2026-03-24)

### 수정 검증 결과

| # | 이슈 | 수정 상태 | 검증 |
|---|------|----------|------|
| 1 | UXR57-58/60-61 Epic 29 단독 할당 | ✅ FIXED | Coverage Map L1012-1013: UXR56/59/62 → Epic 29, UXR57-58/60-61 → Epic 23. Epic 23 Key UXRs(L1082)에 "cross-cutting WebSocket/SSE patterns" 포함. Epic 29 Key UXRs(L1260)에서 제거 확인. |
| 2 | Epic 23 스토리 추정치 불균형 | ✅ FIXED | L1073: 12-15 → **18-22 stories**. L1094: "≥60% milestone measurement: ~40 of 67 pages with Natural Organic tokens fully applied by Sprint 2 end". L1095: Parallel risk fallback plan 추가 (<60% → Sprint 3 catch-up, Sprint 4는 <80% 불가). |
| 3 | NFR count 불일치 | ✅ FIXED | L16: "81 active NFRs (76 original + 5 added in Step 1 review: P18, S11-S14)". grep "76 NFR" 결과 stale 참조 없음. Summary table(L1308) 총 스토리 수 63-79로 갱신. |
| 4 | Epic 26 Go/No-Go 부재 | ✅ FIXED | L1158: "Sprint 2 exit includes marketing E2E verification". L1177: "Marketing preset E2E test — topic → generation → approval → posting succeeds on ≥1 platform under NFR-P17 targets (image ≤2min, posting ≤30s)". L1292: Sprint 2 exit gate table에 marketing 포함. |

### 수정 후 차원별 점수

| 차원 | 가중치 | 수정 전 | 수정 후 | 변동 근거 |
|------|--------|--------|--------|----------|
| D1 구체성 | 20% | 9/10 | 9/10 | 변동 없음. 이미 복붙 수준 구체성. |
| D2 완전성 | 20% | 8/10 | **9/10** | UXR57-58/60-61이 Epic 23(cross-cutting)으로 정확히 이동. 5대 카테고리 × 8 에픽 매핑 완전. NFR 81개 전부 반영. |
| D3 정확성 | 15% | 8/10 | **9/10** | NFR count L16에서 81로 정확 갱신. Summary table 스토리 총합(63-79) 정합. 모든 수치 일관. |
| D4 실행가능성 | 15% | 9/10 | 9/10 | 변동 없음. ≥60% metric 명시로 Step 3 입력이 더 구체화됨. |
| D5 일관성 | 10% | 8/10 | **9/10** | Step 1-2 간 NFR count gap 해소. Overview-Body 일치. Epic 번호·Sprint 순서·용어 전부 정합. |
| D6 리스크 | 20% | 8/10 | **9/10** | Epic 26 marketing E2E gate 추가. Epic 23에 ≥60% fallback plan(Sprint 3 catch-up, Sprint 4 block) 추가. 8개 에픽 전부 검증 지점 확보. |

### 수정 후 가중 평균: 9.00/10 ✅ PASS

**계산:** (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00/10**
