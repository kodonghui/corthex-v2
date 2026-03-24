# Critic-B (QA + Security) Review — Step 2: Design Epics

**Reviewer:** Quinn (QA Engineer)
**File:** `_bmad-output/planning-artifacts/epics-and-stories.md` (lines 825-1290)
**Date:** 2026-03-24
**Focus:** FR coverage verification, Go/No-Go gate correctness, security placement, sanitization chain isolation, testability baseline references

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 에픽별 FR/NFR/DSR/AR/UXR ID 명시, 마이그레이션 파일명, Go/No-Go 검증 기준 구체적. Story count는 범위(5-7 등)로 제공 — 적절. 커버리지 맵 일부 범위 표기("AR8-25 All"). |
| D2 완전성 | 8/10 | 123 FR 100% 커버리지 확인 (56 new + 66 carry-forward + 4 deferred + 2 deleted). NFR/DSR/AR/UXR 5개 커버리지 맵 제공. **UXR60 매핑 오류** (Chat SSE → E29, should be E23). **NFR-O4/O5 베이스라인 측정 태스크 Epic 22에 미포함.** |
| D3 정확성 | 8/10 | Go/No-Go 14개 게이트 전부 올바른 Sprint exit에 배치. Security 항목 올바른 에픽 배치. AR71 순서 준수. **UXR60 매핑 부정확** — Chat SSE streaming은 /office 아닌 Hub Chat 기능. |
| D4 실행가능성 | 8/10 | 에픽별 의존성 체인 명확 (E22→E24→E28, E25→E26 등). Implementation notes 충실. 순환 의존성 없음. 각 에픽 standalone 조건 충족. |
| D5 일관성 | 9/10 | Step 1 해결된 AR56 "Light mode only" 반영. Epic 번호 v2 계속(22-29). Sprint 구조 Architecture 일치. 용어/네이밍 통일. |
| D6 리스크 | 8/10 | 3-chain sanitization isolation 유지 (PER-1→E24, TOOLSANITIZE→E27, MEM-6→E28). Go/No-Go gates as sprint exit criteria. **Sprint 2 밀도(3 epic, 14-19 stories)** 리스크 미언급. **Epic 23 범위(12-15 stories, 100+ UXR)** 리스크 미언급. |

### 가중 평균: 8.15/10 ✅ PASS

> D1(8×0.10) + D2(8×0.25) + D3(8×0.15) + D4(8×0.10) + D5(9×0.15) + D6(8×0.25) = **8.15**

---

## Verification Checklist

### 1. FR Coverage — 100% ✅

| Category | Count | Epic Assignment | Status |
|----------|-------|----------------|--------|
| FR-PERS1-9 | 9 | Epic 24 | ✅ |
| FR-N8N1-6 | 6 | Epic 25 | ✅ |
| FR-MKT1-7 | 7 | Epic 26 | ✅ |
| FR-TOOLSANITIZE1-3 | 3 | Epic 27 | ✅ |
| FR-MEM1-14 | 14 | Epic 28 | ✅ |
| FR-OC1-11 | 11 | Epic 29 | ✅ |
| FR-UX1-3 | 3 | Epic 23 | ✅ |
| FR1-68 (minus 37/39) | 66 | v2 carry-forward with touchpoints | ✅ |
| FR69-72 | 4 | Phase 5+ deferred | ✅ |
| FR37, FR39 | 2 | Deleted (CLI Max) | ✅ |
| **Total** | **125** | | **0 orphans, 0 double-maps** |

### 2. Go/No-Go Gates — 14/14 ✅

| Gate | Sprint Exit | Epic | Verification Criteria | Status |
|------|-----------|------|----------------------|--------|
| #1 Zero Regression | Sprint 4 | E29 | 485 API + 10,154 tests | ✅ |
| #2 Big Five injection | Sprint 1 | E24 | renderSoul extraVars not empty | ✅ |
| #3 n8n security | Sprint 2 | E25 | Port block + tag filter + HMAC | ✅ |
| #4 Memory Zero Regression | Sprint 3 | E28 | agent_memories data intact | ✅ |
| #5 PixiJS bundle | Sprint 4 | E29 | ≤200KB gzip (204,800 bytes) | ✅ |
| #6 Hardcoded colors | Sprint 1→2 | E23 | ESLint no-hardcoded-colors = 0 | ✅ |
| #7 Reflection cost | Sprint 3 | E28 | Haiku ≤$0.10/day | ✅ |
| #8 AI sprite approval | Sprint 4 | E29 | PM approval | ✅ |
| #9 Observation poisoning | Sprint 3 | E28 | MEM-6 4-layer 100% block | ✅ |
| #10 Voyage migration | Pre-Sprint | E22 | embedding IS NULL = 0 | ✅ |
| #11 Tool sanitization | Sprint 2 | E27 | 100% adversarial block | ✅ |
| #12 v1 feature parity | Sprint 4 | E29 | Full v1 feature check | ✅ |
| #13 CEO daily task | Sprint 4 | E29 | 5-step flow ≤5min | ✅ |
| #14 Capability evaluation | Sprint 3 | E28 | 10×5 rework ≤50% | ✅ |

### 3. Security Placement — ✅

| Security Item | Epic | Rationale | Status |
|--------------|------|-----------|--------|
| NFR-S11~14 (HTTP, file, auth, deps) | E22 | Pre-Sprint baseline before features | ✅ Correct |
| PER-1 (personality 4-layer) | E24 | With personality feature | ✅ Correct |
| N8N-SEC-1~8 (8-layer) | E25 | With n8n deployment | ✅ Correct |
| FR-TOOLSANITIZE + AR37/38 | E27 | Independent security epic | ✅ Correct |
| MEM-6 (observation 4-layer) | E28 | With memory feature | ✅ Correct |
| FR40-45 (v2 security audit) | E27 touchpoint | Tool sanitizer hooks into existing | ✅ Correct |

### 4. 3-Chain Sanitization Isolation — ✅

| Chain | Attack Surface | Epic | AR60 Isolation |
|-------|---------------|------|----------------|
| PER-1 | personality_traits injection | E24 (Sprint 1) | ✅ Independent |
| TOOLSANITIZE | tool response injection | E27 (Sprint 2) | ✅ Independent |
| MEM-6 | observation content poisoning | E28 (Sprint 3) | ✅ Independent |

Three different epics, three different sprints, three different attack surfaces. AR60 "Never import each other" explicitly referenced in E27. ✅

### 5. Deleted Items Exclusion — ✅

- FR37, FR39: L918 "Deleted: CLI Max flat rate" — not in any epic ✅
- NFR-S7, NFR-D7: L956 "Deleted: CLI Max flat rate" — not in any epic ✅

### 6. Epic 27 Scope Assessment — KEEP SEPARATE ✅

Bob asked: "Is Epic 27 (3 FRs, 3-4 stories) sufficient scope or should it merge?"

**Recommendation: Keep separate.**

Rationale:
1. **AR60 isolation principle**: 3 sanitization chains must never import each other. Separate epic enforces architectural boundary
2. **Own Go/No-Go gate (#11)**: Dedicated sprint exit verification ensures security testing isn't diluted
3. **Different attack surface**: Tool response injection ≠ n8n infrastructure security. Merging with E25 would mix concerns
4. **FR-TOOLSANITIZE3 spans Sprint 2→3**: Implementation in Sprint 2, OWASP expansion verification in Sprint 3. This cross-sprint scope justifies independence
5. **QA benefit**: Small focused security epic gets dedicated test attention. A 3-4 story epic with clear boundaries is testable in isolation

---

## 이슈 목록 (8건) — cross-talk 반영

### MEDIUM (5건)

**I1. [D2+D3] UXR60 (Chat SSE streaming) Epic 29에 잘못 매핑**
- UXR60: "Chat SSE streaming: token-by-token + blinking cursor. Sentence-level aria-live"
- 현재: UXR56-62 전체가 Epic 29 (OpenClaw) 배치
- 문제: UXR60은 Hub Chat 기능이지 /office WebSocket 아님. UXR82 (streaming markdown, Epic 23)와 관련/중복
- 또한 UXR57 (WebSocket auto-reconnect), UXR58 (5 failures refresh), UXR61 (disconnect banner)은 /office 한정 아닌 **범용 WebSocket 패턴**
- **수정:** UXR56-62 범위를 분리:
  - Epic 23: UXR57, UXR58, UXR60, UXR61 (범용 WebSocket/SSE 패턴)
  - Epic 29: UXR56, UXR59, UXR62 (/office 전용)

**I2. [D2+D6] NFR-O4/O5 베이스라인 측정 태스크 누락**
- NFR-O4: "v2 baseline measured pre-Phase 1, stored in `quality-baseline.md`" — 이 파일은 아직 존재하지 않음
- NFR-O5: "10 predefined scenarios stored in `routing-scenarios.md`" — 이 파일도 미존재
- NFR coverage map은 O1-8을 "v2 Already implemented"로 묶지만, O4/O5는 **v3 테스트 베이스라인 생성이 필요**
- **수정:** Epic 22 또는 Epic 24에 "v3 quality baseline establishment" Pre-Sprint prerequisite 태스크 추가. NFR-O5 시나리오 정의를 Epic 24 또는 Sprint 2 초반에 캡처

**I3. [D6] Epic 28 Go/No-Go 4게이트 집중 — 테스트 병목 리스크 (cross-talk: dev)**
- Epic 28: #4 (Memory Zero Regression), #7 (Reflection cost), #9 (Observation poisoning), #14 (Capability evaluation)
- 14개 게이트 중 4개(29%)가 단일 에픽에 집중 — Sprint 3 exit 검증 부하 최대
- AR75 Capability evaluation (10 tasks × 5 categories)은 그 자체가 테스트 프레임워크 → 테스트의 테스트 필요
- **리스크:** Sprint 3 exit에서 4개 게이트 순차 검증 시 병목. 하나라도 실패하면 Sprint 4 진입 차단
- **권고:** Sprint 3 중간에 #7(cost)과 #9(poisoning)를 조기 검증하여 exit 시점 부하 분산. #14는 Sprint 3 후반 전용 테스트 스프린트 필요

**I4. [D2+D6] Epic 26 Go/No-Go 게이트 없음 (cross-talk: john)**
- Epic 26 (AI Marketing Automation)은 8개 에픽 중 유일하게 Go/No-Go 없음
- 7 FRs, 외부 AI API 4+ 타입, 멀티플랫폼 포스팅 — 복잡도 높음
- Sprint 2 exit: #3 (n8n security) + #11 (tool sanitization) 통과해도 마케팅 워크플로우는 미검증
- **권고:** Sprint 2 exit에 마케팅 검증 게이트 추가: "marketing preset E2E: topic → generation → approval → posting succeeds on ≥1 platform under NFR-P17 targets (image ≤2min, posting ≤30s)"

**I5. [D2] Epic 27 테스트 스팬 Sprint 2→3 미명시 (cross-talk: dev)**
- FR-TOOLSANITIZE3: "Sprint 2 implementation with 10 payloads, Sprint 3 expansion with OWASP patterns"
- Epic 27 Go/No-Go #11은 Sprint 2 exit — 이 시점에서는 10 payload만 검증
- Sprint 3에서 OWASP 50+ 확장은 어느 에픽 테스트 범위? Epic 27? Epic 28?
- **수정:** Epic 27에 "Sprint 3 verification scope" 명시 또는 cross-sprint 테스트 전략 추가

### LOW (3건)

**I6. [D6] Sprint 2 밀도 리스크 미언급**
- Sprint 2: Epic 25(6-8 stories) + Epic 26(5-7) + Epic 27(3-4) = **14-19 stories**
- 가장 바쁜 Sprint. Epic 26은 Epic 25 완료 후 시작 → 순차적이므로 병렬화 제한
- **권고:** Epic 설명 또는 Implementation Sequence에 Sprint 2 밀도 리스크 + 완화 전략 추가 (e.g., E27은 E25/E26과 독립 → 병렬 가능)

**I7. [D6] Epic 23 범위 리스크 + ≥60% 측정 기준 미표기 (cross-talk: john)**
- 12-15 stories, 100+ UXR 커버리지, 전 Sprint 병행
- AR71: ≥60% by Sprint 2 end — PRD L441에 기준 정의됨: **"토큰 적용 페이지 수 / 전체 페이지 수"** (~67 페이지 중 ~40 페이지)
- 현재 Epic 23 설명과 Sprint 2 exit gate(#6)에 이 공식 미표기
- **수정:** Epic 23에 "≥60% = ~40/67 pages with Natural Organic tokens applied" 명시. Gate #6 검증 기준에 포함

**I8. [D1] Epic 22 NFR-S11~14 테스트 방법 미명시**
- NFR-S11 (HTTP headers): 어떻게 검증? (curl response header check? Lighthouse audit?)
- NFR-S13 (auth rate limiting): 검증 방법? (10 req/min 초과 시 429 확인?)
- **권고:** Story 단계에서 acceptance criteria에 포함 (Step 2에서는 참고 수준)

---

## 자동 불합격 조건

| 조건 | 결과 |
|------|------|
| 할루시네이션 | ✅ 없음 — 모든 FR/NFR/AR/UXR ID가 Step 1과 일치 |
| 보안 구멍 | ✅ 없음 — 3-chain 격리 유지, security 항목 올바른 에픽 배치 |
| 빌드 깨짐 | N/A |
| 데이터 손실 위험 | ✅ 없음 |
| 아키텍처 위반 | ✅ 없음 |

---

## Cross-talk 요약

### 수신 (dev → quinn)
- **Epic 28 게이트 4개 집중**: Sprint 3 exit 테스트 병목 리스크. AR75 capability evaluation 자체가 테스트 프레임워크 (I3으로 반영)
- **FR-TOOLSANITIZE3 Sprint 2→3 스팬**: Epic 27 테스트가 2개 Sprint 걸침 (I5로 반영)

### 수신 (john → quinn)
- **Epic 26 Go/No-Go 없음**: 마케팅 자동화가 Sprint 2 exit에서 미검증 리스크 (I4로 반영)

### 발신 (quinn → john)
- Epic 23 ≥60% 측정 기준 문의
- Epic 26 Go/No-Go 게이트 추가 제안 동의

### 발신 (quinn → dana)
- 3-chain isolation 확인 완료
- UXR60 매핑 오류 공유

### 발신 (quinn → dev)
- Epic 28 게이트 집중 → 조기 검증 전략 제안
- Epic 27 cross-sprint 테스트 전략 필요 동의

---

## 총평

**견고한 에픽 설계.** 8개 에픽이 Architecture AR71 순서를 정확히 따르며, 14개 Go/No-Go 게이트가 올바른 Sprint exit에 배치됨. 특히 우수한 점:

- **100% FR 커버리지** — 56 new + 66 carry-forward, 0 orphans, 0 double-maps
- **3-chain sanitization isolation** — 3개 체인이 3개 다른 에픽/Sprint에 완전 분리
- **Security-first Pre-Sprint** — NFR-S11~14를 Epic 22에 배치하여 모든 기능 개발 전 보안 기반 확립
- **Epic 27 독립성** — 작지만 명확한 보안 에픽. AR60 격리 원칙 준수
- **5개 커버리지 맵** — FR/NFR/DSR/AR/UXR 전부 매핑

I1(UXR60 매핑 오류)과 I2(O4/O5 베이스라인 태스크) 수정 시 8.5+ 가능. 나머지는 LOW — Story 단계에서 해결 가능.

---

## Re-Verification (Post-Fixes)

**Date:** 2026-03-24

### 수정 확인 (8건 중 7건 해결, 1건 적절히 보류)

| # | 이슈 | 상태 | 확인 |
|---|------|------|------|
| I1 | UXR60 매핑 오류 | ✅ 해결 | UXR57-58/60-61 → E23 (L1013, L1082). UXR56/59/62 → E29 유지 |
| I2 | NFR-O4/O5 베이스라인 | ✅ 해결 | E22 Key NFRs + Implementation Notes에 baseline 생성 태스크 추가 (L1053, L1061-1062) |
| I3 | E28 게이트 집중 | ✅ 해결 | Early verification 전략: #7/#9 mid-sprint, #4/#14 at exit (L1241) |
| I4 | E26 Go/No-Go 없음 | ✅ 해결 | Marketing E2E verification at Sprint 2 exit (L1158, L1177) — NFR-P17 targets |
| I5 | E27 cross-sprint 테스트 | ✅ 해결 | Sprint 2 = 10 payloads, Sprint 3 = OWASP 50+ within E28 scope (L1212) |
| I6 | Sprint 2 밀도 | ✅ 해결 | Sprint 2 Overload Risk & Mitigation 섹션 추가 (L1183) |
| I7 | E23 ≥60% 기준 | ✅ 해결 | `pages with corthex-* tokens / total pages` = ~40/67 (L1094) |
| I8 | E22 NFR 테스트 방법 | ⏸️ 보류 | Step 3 story acceptance criteria로 적절히 보류 |

### Re-Score

| 차원 | Before | After | 근거 |
|------|--------|-------|------|
| D1 구체성 | 8 | **9** | ≥60% 공식 명시, E26 gate 검증 기준 구체적, E28 early verification 전략 |
| D2 완전성 | 8 | **9** | UXR 매핑 수정, O4/O5 baseline 추가, E26 gate 추가, cross-sprint scope 정의, Sprint 2 risk 문서화 |
| D3 정확성 | 8 | **9** | UXR60 올바르게 E23 배치, 모든 커버리지 맵 정확 |
| D4 실행가능성 | 8 | **8** | 변동 없음 — 이미 양호 |
| D5 일관성 | 9 | **9** | 변동 없음 |
| D6 리스크 | 8 | **9** | Sprint 2 overload 문서화, E28 gate 집중 완화, E23 scope 측정 기준 정의 |

### 가중 평균: 8.90/10 ✅ PASS

> D1(9×0.10) + D2(9×0.25) + D3(9×0.15) + D4(8×0.10) + D5(9×0.15) + D6(9×0.25) = **8.90**

---

## 최종 총평

**우수한 에픽 설계 + 효과적 개선.** Initial 8.15 → Final **8.90**. 특히 우수한 수정:
- UXR56-62 분리 (범용 WebSocket/SSE → E23, /office 전용 → E29) — 깔끔한 관심사 분리
- Epic 26 marketing E2E gate 추가 — 더 이상 미검증 에픽 없음
- Epic 28 early verification 전략 — Sprint 3 exit 병목 완화
- ≥60% 공식 명시 (`corthex-* tokens / total pages = ~40/67`) — Gate #6 검증 가능

**Step 3 진행 가능.**
