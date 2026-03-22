# Critic-A Review — Stage 2 Step 12: Non-Functional Requirements (PRD L2499-2647)

**Reviewer**: Winston (Architecture + API)
**Date**: 2026-03-22
**Artifact**: `_bmad-output/planning-artifacts/prd.md` lines 2499–2647
**Grade Request**: A (2사이클 필수, avg ≥ 8.0) — **마지막 Grade A**
**Revision**: **R2 9.50 PASS FINAL**

---

## Review Score: 9.10/10 ✅ PASS

### 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 15% | 74 NFRs 전부 측정 가능한 목표 + 측정 방법 명시. NFR-P5 "P95 ±10%, 100회 측정". NFR-O4 "10개 프롬프트 A/B 블라인드, 2명 5점". NFR-S9 8-layer 각 레이어 명시. But: MEM-6 observation sanitization 품질 목표 NFR 부재 (M1) |
| D2 완전성 | 8.5/10 | 15% | 12개 카테고리 74 활성 NFR. v2 58 + v3 16 = 전 Sprint 커버. But: observation sanitization 품질 NFR 부재 (M1). NFR-SC7 pgvector Phase 4인데 Sprint 3부터 VECTOR(1024) 사용 (M2) |
| D3 정확성 | 9.5/10 | **25%** | P0 21개 수동 카운트 일치 ✅. P1 42개 ✅. P2 10개 ✅. 삭제 2개 (S7, D7) GATE 결정 정확 ✅. NFR-SC8 50/co+500/server = 확정 #10 ✅. NFR-S9 8/8 = 확정 #3 ✅. NFR-D8 Option B + 확정 #5 ✅. NFR-SC9 2G = 확정 #2 ✅ |
| D4 실행가능성 | 9.5/10 | **20%** | 측정 도구 명시: Lighthouse, Chrome DevTools, WebPageTest, Vite 빌드, E2E 테스트 타이머. 테스트 수량: 10개 패턴(S5/S6), 10개 프롬프트(O4), 10개 시나리오(O5), 3개 규칙×10회(O6). 구현팀이 추가 해석 없이 검증 가능 |
| D5 일관성 | 9/10 | 15% | NFR-SC8↔FR-OC2 (50/co, NRT-5, #10) ✅. NFR-S9↔FR-N8N4 (8-layer) ✅. NFR-D8↔FR-MEM13 (30일 TTL, #5) ✅. NFR-S8↔FR-PERS2 (4-layer PER-1) ✅. NFR-COST3↔FR-MEM14 (Go/No-Go #7) ✅. Minor: NFR-A5 "aria-label" vs FR-PERS9 "aria-valuetext" — 보완적이나 교차 참조 없음 (L1) |
| D6 리스크 | 8.5/10 | 10% | NFR-EXT1/2 외부 장애 격리 ✅. NFR-SC6 graceful degradation ✅. NFR-AV1/2/3 가용성+복구+백업 ✅. NFR-O9 n8n health 자동 재시작 ✅. But: R10 High observation poisoning에 대한 NFR 품질 게이트 부재 — NFR-S8(PER-1)과 비대칭 (M1) |

**가중 평균**: (9×0.15)+(8.5×0.15)+(9.5×0.25)+(9.5×0.20)+(9×0.15)+(8.5×0.10) = 1.35+1.275+2.375+1.90+1.35+0.85 = **9.10**

---

## 이슈 목록

### MINOR (2건)

| # | 이슈 | 위치 | 근거 | 영향 |
|---|------|------|------|------|
| M1 | MEM-6 observation sanitization 품질 NFR 부재 | NFR-S 섹션 | NFR-S8 = PER-1 personality sanitization "4-layer 100% 통과". FR-TOOLSANITIZE3 = 도구 응답 "10종 adversarial 100% 차단율". But **MEM-6 observation sanitization**에는 품질 NFR 없음. FR-MEM12는 4-layer 동작만 정의 — "N종 adversarial observation payload 100% 차단율" 같은 측정 가능한 품질 목표가 없다. R10 High + Go/No-Go #9 = **가장 위험한 공격 표면인데 품질 게이트가 없음**. NFR-S8(PER-1)과 비대칭. | D1, D2, D6 |
| M2 | NFR-SC7 pgvector 메모리 Phase 4인데 Sprint 3부터 사용 | NFR-SC7 | "pgvector HNSW 인덱스 포함 ≤ 3GB" Phase 4. But Sprint 3에서 observations VECTOR(1024) + agent_memories VECTOR(1024) 추가 (FR-MEM2, FR-MEM5). HNSW 인덱스 빌드 + 쿼리 메모리가 Sprint 3부터 발생. Phase 4까지 측정하지 않으면 Sprint 3 배포 시 메모리 초과 감지 불가. | D2, D3 |

### LOW (3건)

| # | 이슈 | 위치 | 근거 | 영향 |
|---|------|------|------|------|
| L1 | NFR-A5 "aria-label" vs FR-PERS9 "aria-valuetext" | NFR-A5, FR-PERS9 | 보완적 속성 (aria-label = 요소 이름, aria-valuetext = 값 설명). 둘 다 필요하지만 NFR과 FR이 서로 다른 속성만 명시. 교차 참조 없음. 기능적으로 무결 — 구현 시 둘 다 적용하면 됨 | D5 |
| L2 | NFR-P4 vs NFR-P13 동일 200KB 두 번들 | NFR-P4, P13 | NFR-P4 "허브 ≤ 200KB gzip" (Phase 1) = CEO앱 메인 번들. NFR-P13 "PixiJS 번들 ≤ 200KB gzip" (Sprint 4) = /office lazy-loaded 번들. 별도 번들이지만 동일 수치라 혼동 가능. "메인 번들과 별도" 명시 있으면 명확 | D1 |
| L3 | NFR-COST2 Voyage AI Phase 4 전용 — Sprint 3 embedding 비용 미포함 | NFR-COST2 | "월 $5 이하 (문서 1,000건 기준)" = knowledge_docs Phase 4. Sprint 3 observation+reflection 임베딩 비용 별도 모델 없음. 실제 비용은 무시 가능 (~$0.03/1000 obs) 수준이나 명시적 비용 모델 부재 | D2 |

---

## john 8대 체크포인트 검증

| # | 체크포인트 | 판정 | 근거 |
|---|-----------|------|------|
| 1 | 확정 결정 정합 | ✅ | #2 2G NFR-SC9 ✅. #3 8-layer NFR-S9 ✅. #5 30일 TTL NFR-D8 ✅. #8 Obs Poisoning ⚠️ 동작 FR-MEM12 있으나 NFR 품질 목표 없음 (M1). #9 advisory lock NFR-O10 ✅. #10 WS limits NFR-SC8 ✅ |
| 2 | FR ↔ NFR 연동 | ✅ | FR-MEM14↔NFR-COST3 ✅. FR-OC2↔NFR-SC8 ✅. FR-N8N4↔NFR-S9 ✅. FR-PERS2↔NFR-S8 ✅. FR-MEM13↔NFR-D8 ✅. FR-MEM12↔NFR-S? ❌ (M1) |
| 3 | 측정 가능성 | ✅ | 74 NFR 전부 수치 목표 또는 테스트 방법 명시. 최약: NFR-EXT2 "장애가 전체 시스템을 중단시키지 않음" — 측정보다 검증이지만 E2E 테스트로 충분 |
| 4 | 우선순위 정합 | ✅ | P0: Phase 1 블로커(S1-S6, P5/P6/P8, SC1/2/6, O4, EXT1/2, B1) + v3 핵심 게이트(P13, S8, S9, SC9, COST3). Phase/Sprint 매핑 전부 정합 |
| 5 | Go/No-Go 연동 | ⚠️ | NFR-P13 #5 ✅, NFR-S9 #3 ✅, NFR-COST3 #7 ✅. But Go/No-Go #9 (Obs Poisoning) → NFR 없음 (M1). #14 (Capability Evaluation) → Sprint 성공 기준에 있으나 NFR 없음 (Sprint criteria와 NFR 별도 — 수용 가능) |
| 6 | GATE 결정 반영 | ✅ | NFR-S7 삭제 (cost-tracker) ✅. NFR-D7 삭제 (비용 보관) ✅. 취소선 + 사유 명시 |
| 7 | 수치 일관성 | ✅ | NFR-SC8 50/co = FR-OC2 50/co ✅. NFR-SC9 2G = FR-N8N4 2G ✅. NFR-D8 30일 = FR-MEM13 30일 ✅. NFR-P4 200KB = FR-OC1 200KB ✅. NFR-P13 200KB = 별도 PixiJS 번들 ✅. NFR-COST3 $0.10 = FR-MEM14 $0.10 ✅ |
| 8 | v3 NFR 완전성 | ⚠️ | Sprint 1: S8, A5 ✅. Sprint 2: S9, SC9, O9, P17 ✅. Sprint 3: COST3, D8, O10, P16 ✅. Sprint 4: P13-P15, SC8, A6-A7, SC7(Phase 4→Sprint 3 갭, M2) ✅. Observation sanitization NFR 누락 (M1) |

---

## Proactive Fix 검증 (3/3)

| NFR | 수정 내용 | 판정 |
|-----|----------|------|
| NFR-SC8 | 20 conn → 50/co + 500/server + oldest (NRT-5, #10) | ✅ L2550 |
| NFR-S9 | SEC-1~6 → SEC-1~8 (SEC-7 encryption + SEC-8 rate limit) | ✅ L2537 |
| NFR-D8 | observations/reflections → observations + agent_memories(reflection) + 30일 TTL (Option B, #5) | ✅ L2584 |

---

## P0/P1/P2 카운트 검증

| 우선순위 | 선언 | 수동 카운트 | 판정 |
|---------|------|-----------|------|
| 🔴 P0 | 21개 | P(4)+S(8)+SC(4)+EXT(2)+O(1)+COST(1)+B(1) = **21** | ✅ |
| P1 | 42개 | P(11)+SC(4)+AV(3)+A(6)+D(5)+EXT(1)+O(8)+COST(1)+LOG(2)+B(1) = **42** | ✅ |
| P2 | 10개 | P(2)+SC(1)+A(1)+D(2)+O(1)+COST(1)+LOG(1)+B(1) = **10** | ✅ |
| CQ | 1개 | CQ1 = **1** | ✅ |
| 삭제 | 2개 | S7, D7 = **2** | ✅ |
| **총 활성** | **74** | **74** | ✅ |

---

## 긍정 평가

1. **NFR-S9 8-layer 단일 행 완전체**: SEC-1~8 각 레이어 이름 + 기술 상세 + "100% 통과". 구현팀이 보안 체크리스트로 직접 사용 가능. 확정 결정 #3 완전 반영
2. **NFR-O4 A/B 블라인드 프로토콜**: "10개 프롬프트, 2명 평가자, 5점 척도, 평균 ≥ 기존" — v2→v3 마이그레이션 품질 저하 방지를 위한 구체적이고 실행 가능한 프로토콜
3. **NFR-P5 베이스라인 측정 방법론**: "Phase 1 전 주요 API 5개, 100회 P95" — regression 탐지를 위한 과학적 베이스라인 수립. API 이름까지 명시
4. **NFR-SC8 FR↔NFR 분리 설계**: "FR-OC2 기능 기준, NFR은 성능 검증" — FR(기능)과 NFR(품질)의 관계를 명시적으로 선언. 모범적 설계
5. **NFR-D8 3-tier 보존 전략**: observations 30일 TTL + agent_memories 무기한 + Admin 설정 가능 — 스토리지 비용, 데이터 가치, 운영 유연성 균형
6. **NFR-COST3 추정 근거**: "Stage 1 추정: ~$0.06/day" — 목표($0.10)와 추정($0.06)을 함께 제시하여 마진(40%) 가시화
7. **우선순위 요약 테이블**: P0 21개 "미달성 시 배포 불가" 선언 — 릴리스 게이트와 NFR 우선순위가 명확히 연동
8. **NFR-P15 적응형 heartbeat**: "idle 30초 / active 5초" — 배터리 + 대역폭 효율과 실시간성 균형. NRT-2와의 관계도 명시

---

## 자동 불합격 검토

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ❌ 없음 — P0 카운트 21개 수동 검증 일치. 모든 수치 FR/Brief/확정 결정과 정합 |
| 보안 구멍 | ❌ 없음 — NFR-S1~S9(S7 제외) 전 보안 레이어 커버. MEM-6 NFR 부재는 품질 목표 갭 (보안 구멍 아님 — FR-MEM12에 동작 정의) |
| 빌드 깨짐 | ❌ N/A |
| 데이터 손실 위험 | ❌ 없음 — NFR-D1 마이그레이션 100% 보존 + 롤백, NFR-D8 TTL + 무기한 보관, NFR-AV3 일일 백업 |
| 아키텍처 위반 | ❌ 없음 — E8 경계 언급 없음 (NFR 범위 밖, 적절) |

---

## Confirmed Decisions Coverage

| # | Decision | Step 12 반영 |
|---|----------|-------------|
| 2 | n8n Docker 2G | ✅ NFR-SC9 "≤ 2G RAM (Brief mandate)" |
| 3 | n8n 8-layer | ✅ NFR-S9 "N8N-SEC-1~8 100% 통과" |
| 5 | 30일 TTL | ✅ NFR-D8 "reflected=true 30일 TTL (MEM-7, 확정 #5)" |
| 8 | Obs Poisoning | ⚠️ FR-MEM12 동작 있으나 NFR 품질 목표 없음 (M1) |
| 9 | Advisory lock | ✅ NFR-O10 "advisory lock(동시 실행 방지)" |
| 10 | WS limits | ✅ NFR-SC8 "50 + 500 + oldest (NRT-5, #10)" |

---

## Carry-Forward to Writer

1. **NFR-S10 추가 (MEM-6 observation sanitization 품질)**: "observation 4-layer 방어가 10종 adversarial observation payload (과장 LLM 조작, base64 인코딩 우회, 제어문자 삽입, 10KB 초과, nested injection 등)에 대해 100% 차단율을 달성한다 (Go/No-Go #9, R10 High, 확정 결정 #8). NFR-S8(PER-1)과 대칭"
2. **NFR-SC7 Phase 수정**: "Phase 4" → "Sprint 3+" — observations + agent_memories VECTOR(1024) HNSW 인덱스가 Sprint 3부터 메모리 영향
3. **NFR-COST2 Phase + scope 수정** (Bob #2 채택): "Phase 4" → "Pre-Sprint→Sprint 3+" + "문서 1,000건 기준" → "문서 1,000건 + observation/reflection 임베딩 볼륨 포함" — Step 9 Fix 9에서 통합 테이블은 수정했으나 NFR-COST2 미전파
4. **NFR-A5 aria 속성 보완** (Sally 채택): "aria-valuenow + Arrow keys + aria-label" → "aria-valuenow + aria-valuetext (값 의미 설명) + aria-label (슬라이더 특성명) + Arrow keys" — FR-PERS9 aria-valuetext와 정합 + 스크린리더 경험 완전성
5. **NFR-P4 Go/No-Go #5 참조 제거** (Quinn m2 채택): "Brief §4, Go/No-Go #5" → "Brief §4" — Go/No-Go #5는 PixiJS 번들 전용 (L598), 허브 메인 번들과 무관. NFR-P13이 #5의 올바른 위치

---

## R2 Review — 6 Fixes Verification

**R2 Score: 9.50/10 ✅ PASS FINAL**

### 차원별 점수 (R2)

| 차원 | R1 | R2 | 변화 | 근거 |
|------|-----|-----|------|------|
| D1 구체성 | 9.0 | 9.5 | +0.5 | NFR-S10 "4-layer 100% + 10종 100% 차단" = PER-1(NFR-S8)과 동일 수준 상세. NFR-A5 aria 3속성 전부 명시. NFR-O11 "≤ 5분" 구체적 일상 UX 목표 |
| D2 완전성 | 8.5 | 9.5 | +1.0 | M1 해소 (NFR-S10). M2 해소 (NFR-SC7 Sprint 3~4). NFR-COST2 scope 확장. NFR-O11 CEO 일상 태스크 추가. 74→76 활성 NFR. 3대 공격 표면 전부 NFR 품질 게이트 확보 |
| D3 정확성 | 9.5 | 9.5 | 0 | P0 22개 수동 카운트 일치 ✅. P1 43개 ✅. 총 활성 76 ✅. NFR-P4 Go/No-Go #5 참조 정확히 제거, NFR-P13으로 분리 ✅ |
| D4 실행가능성 | 9.5 | 9.5 | 0 | 기존 수준 유지. NFR-O11 "/office→식별→Chat→지시→확인 ≤ 5분" = 측정 가능한 E2E 시나리오 |
| D5 일관성 | 9.0 | 9.5 | +0.5 | NFR-A5↔FR-PERS9 aria 정합 ✅. NFR-S10↔FR-MEM12 교차 참조 ✅. NFR-COST2 Phase↔Step 9 통합 테이블 "Pre-Sprint→유지" 정합 ✅. NFR-P4↔NFR-P13 Go/No-Go #5 분리 ✅ |
| D6 리스크 | 8.5 | 9.5 | +1.0 | NFR-S10 = R10 High 공격 표면의 품질 게이트 확보. 3대 sanitization chain: PER-1(NFR-S8) + MEM-6(NFR-S10) + TOOLSANITIZE(FR-level) 전부 측정 가능. NFR-SC7 Sprint 3부터 메모리 모니터링 |

**가중 평균**: (9.5×0.15)+(9.5×0.15)+(9.5×0.25)+(9.5×0.20)+(9.5×0.15)+(9.5×0.10) = 1.425+1.425+2.375+1.90+1.425+0.95 = **9.50**

### Fix Verification (6/6)

| # | Fix | 검증 | 판정 |
|---|-----|------|------|
| 1 | NFR-S10 (MEM-6 품질) | L2538: "4-layer 100% + 10종 adversarial 100% 차단 (Go/No-Go #9, 확정 #8). PER-1과 별개 — FR-MEM12 품질 기준". 🔴 P0, Sprint 3 ✅ | ✅ |
| 2 | NFR-A5 aria 정합 | L2570: "aria-valuenow + aria-valuetext (값 의미 설명) + aria-label (슬라이더 특성명) + Arrow keys. FR-PERS9 정합" ✅ | ✅ |
| 3 | NFR-COST2 Phase+scope | L2616: "Pre-Sprint~Sprint 4" + "knowledge docs + observations/reflections 임베딩 볼륨 포함". Go/No-Go #10 마이그레이션 후 계속 ✅ | ✅ |
| 4 | NFR-SC7 Phase | L2550: "Sprint 3~4" + "Sprint 3 observations + agent_memories VECTOR(1024) HNSW 추가 시 측정 시작" ✅ | ✅ |
| 5 | NFR-P4 #5 제거 | L2510: "(Brief §4). Go/No-Go #5는 PixiJS 번들 전용 (NFR-P13)" ✅ | ✅ |
| 6 | NFR-O11 CEO 일상 태스크 | L2609: "/office→식별→Chat→지시→확인 ≤ 5분 (Go/No-Go #13). NFR-O7/O8과 별개" P1, 전체 ✅ | ✅ |

### P0/P1/P2 카운트 검증 (R2)

| 우선순위 | R1 | R2 | 변화 | 판정 |
|---------|-----|-----|------|------|
| 🔴 P0 | 21 | 22 | +1 (NFR-S10) | ✅ L2643 |
| P1 | 42 | 43 | +1 (NFR-O11) | ✅ L2644 |
| P2 | 10 | 10 | 0 | ✅ L2645 |
| CQ | 1 | 1 | 0 | ✅ |
| 삭제 | 2 | 2 | 0 | ✅ |
| **총 활성** | **74** | **76** | **+2** | ✅ L2648 |

### Confirmed Decisions Coverage (R2)

| # | Decision | R1 | R2 |
|---|----------|-----|-----|
| 2 | n8n Docker 2G | ✅ | ✅ |
| 3 | n8n 8-layer | ✅ | ✅ |
| 5 | 30일 TTL | ✅ | ✅ |
| 8 | Obs Poisoning | ⚠️ | ✅ NFR-S10 (Fix 1) |
| 9 | Advisory lock | ✅ | ✅ |
| 10 | WS limits | ✅ | ✅ |

**6/6 confirmed decisions 전부 NFR 반영 완료.**

### R2 긍정 평가 (추가)

9. **3대 sanitization chain NFR 완성**: PER-1(NFR-S8, Sprint 1) → MEM-6(NFR-S10, Sprint 3) → TOOLSANITIZE(FR-level, Sprint 2-3). Sprint 진행에 따라 보안 품질 게이트가 순차 활성화
10. **NFR-S10↔NFR-S8 대칭 설계**: 동일 패턴 ("4-layer 100% 통과" + adversarial test count + Go/No-Go 참조 + FR 교차 참조). QA가 동일 방법론으로 두 chain을 검증 가능
11. **NFR-COST2 lifecycle 완전성**: "Pre-Sprint (Go/No-Go #10 마이그레이션) → Sprint 3 (observations) → Sprint 4 (knowledge)" — 비용 모니터링이 Voyage AI 사용 시점과 일치
12. **NFR-P4↔P13 명확한 분리**: "Brief §4 = 허브 메인 번들", "Go/No-Go #5 = PixiJS 번들" — 구현팀이 두 개의 200KB 한도를 혼동할 여지 제거

### Residuals (R2, non-blocking)

| Item | Severity | Notes |
|------|----------|-------|
| NFR 테이블 열 수 불일치 | Observation | Performance 6열, Security 5열. 의도적 차이 — 성능은 측정 도구 중요, 보안은 pass/fail. 기능 무결 |
| NFR-O10 Voyage AI RPM | Observation | "rate limit 준수"에 구체 수치(RPM 300) 없음. 외부 서비스 정책이라 "준수" 표현 적절 |
