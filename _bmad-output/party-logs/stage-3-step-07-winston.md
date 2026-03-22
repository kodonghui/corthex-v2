# Stage 3 Step V-07 — Winston (Critic-A) Review

**Reviewer:** Winston (Critic-A, Architecture + API)
**Date:** 2026-03-22
**Target:** `_bmad-output/planning-artifacts/prd-validation-report.md` (Step V-07 section)

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | 18 FR + 7 NFR 전부 정확한 라인 번호, FR ID, 구체적 leakage 용어 인용. 6개 카테고리 분류 (file path, SQL, framework, infrastructure, hooks, component). Top 3 worst offenders 순위. 비위반 7개 capability-relevant 용어 명시적 제외. |
| D2 완전성 | 15% | 8/10 | 6개 leakage 카테고리 체계적 검사. Root cause (Stage 1 decisions embedded) 분석. V-05 reconciliation (17/18 overlap). NFR 22건 "acceptable in NFR context" 설명. **사소한 누락 1건**: FR-PERS5 (L2462) "코드 분기(if/switch) 없이 프롬프트 주입만으로 구현된다" — 구현 접근법 제약 (HOW). WHAT으로 환원하면 "성격이 코드 수정 없이 프롬프트만으로 반영된다." |
| D3 정확성 | 25% | 9/10 | 18 FR 전부 PRD 원본 대조 확인 ✅. 7 NFR 전부 확인 ✅. Capability-relevant 제외 (SSE, WebSocket, CLI, API, MCP, n8n, PixiJS accessibility) 전부 적절 ✅. Top 3 FR leakage density 순위 정확 ✅ (FR-N8N4 ~15개, FR-PERS2 SQL+Zod+file, FR-OC7 SQL+files+framework). v2/v3 분포 83%/17% 검증 ✅. |
| D4 실행가능성 | 20% | 8/10 | Split 전략 (WHAT + Architecture Constraints) 명확. FR-PERS2 before/after 예시 우수. NFR-S9 특별 언급 적절. v2 core FR40/41 hook name 제거 권고 적절. **개선**: 18 FR 우선순위 순서 — Architecture 단계에서 어느 FR부터 split 해야 가장 효율적인지 (예: FR-N8N4 먼저 → §N8N-SEC로 이동, FR-MEM 그룹 일괄 → §MEM Architecture). |
| D5 일관성 | 15% | 9/10 | V-05 structural 17건과 17/18 overlap 확인. FR-OC2 신규 발견 정합. FR count 123 일관. Root cause (Stage 1 confirmed decisions) V-04/V-05 분석과 일치. |
| D6 리스크 | 10% | 7/10 | Severity Critical (>5) vs Priority Low-Medium 모순. 또한 confirmed decision 보호 리스크 미언급: FR에서 leakage 제거 시 Architecture 문서에 confirmed decisions이 완전히 이전되지 않으면 결정 유실 위험. |

## 가중 평균: 8.45/10 ✅ PASS

계산: (9×0.15)+(8×0.15)+(9×0.25)+(8×0.20)+(9×0.15)+(7×0.10) = 1.35+1.20+2.25+1.60+1.35+0.70 = **8.45**

---

## 이슈 목록

### 1. [D6 리스크] Severity Critical vs Priority Low-Medium 모순

Analyst가 "Total: 25 violations → Severity: Critical (>5)" 판정 후, "Priority: Low-Medium" 권고. 이 둘은 모순.

**권고**: Severity를 **Warning (Adjusted)** 로 재분류:
- 기계적 기준 (>5) = Critical
- 실질적 기준 (의도적 삽입, WHAT 유지, testable) = Warning
- V-05 adjusted severity 선례 (10 genuine + 17 structural → Warning) 적용

"Severity: Warning (Adjusted) — 25 violations exceed Critical threshold, but all are intentional Stage 1 decision embeddings with WHAT preserved. Adjusted to Warning per V-05 precedent."

### 2. [D6 리스크] Confirmed Decision 유실 리스크 — Split 실행 시 보호 장치

FR에 embedded된 confirmed decisions (#1 Voyage, #2 Docker 2G, #3 8-layer, #5 TTL 30일, #8 4-layer, #9 advisory lock, #10 WS 50/500)이 split 과정에서 Architecture 문서로 이전되지 않으면 유실.

**권고**: Split 실행 전 체크리스트:

| Confirmed Decision | 현재 위치 (FR) | 이전 대상 (Architecture) |
|-------------------|--------------|----------------------|
| #1 Voyage AI 1024d | FR-MEM2, FR-MEM5 | §Embedding Layer |
| #2 Docker 2G | FR-N8N4 (SEC-5) | §N8N-SEC |
| #3 8-layer | FR-N8N4, NFR-S9 | §N8N-SEC (8 rows) |
| #5 TTL 30일 | FR-MEM13 | §Memory Architecture |
| #8 4-layer sanitize | FR-MEM12, NFR-S8/S10 | §Sanitization Chains |
| #9 advisory lock | FR-MEM3 | §Memory Architecture |
| #10 WS 50/500 | FR-OC2 | §WebSocket Layer |

FR은 cross-reference만 유지: "확정 결정 #N 참조" (V-05 cross-talk 합의 형태).

### 3. [D2 완전성] FR-PERS5 누락 — 구현 접근법 제약

FR-PERS5 (L2462): "코드 분기(if/switch) 없이 프롬프트 주입만으로 구현된다"

이것은 구현 접근법(HOW)을 제약하는 문장:
- **현재**: HOW 제약 — "if/switch 없이, prompt injection으로 구현"
- **WHAT 환원**: "성격 설정 변경이 코드 배포 없이 즉시 반영된다 (프롬프트 기반)"

Severity: Low. FR-PERS4 ("다음 세션부터 즉시 반영, 배포 불필요")와 의미 중복되므로, FR-PERS5를 Architecture Note로 이동하거나 FR-PERS4에 병합 가능.

### 4. [D4 실행가능성] Split 우선순위 — Architecture 단계 효율

18 FR split을 Architecture 단계에서 일괄 처리하면 비효율. 그룹별 우선순위 권고:

| 우선순위 | 그룹 | FR 수 | 이유 |
|---------|------|-------|------|
| P1 | n8n (FR-N8N1/4/6) | 3 | FR-N8N4 단독으로 ~15 terms. §N8N-SEC로 일괄 이동 |
| P2 | Memory (FR-MEM2/3/4/5/6/8/13) | 7 | 가장 많은 FR 수. §Memory Architecture로 일괄 |
| P3 | Personality (FR-PERS2/3) | 2 | §Personality Architecture (PER-1/2) 연결 |
| P4 | OpenClaw (FR-OC1/2/7) | 3 | Sprint 4 착수 전 split |
| P5 | v2 Core (FR35/40/41) | 3 | 간단 — hook name 제거만 |

NFR 7건은 Architecture 문서 작성 시 자연스럽게 흡수.

---

## 검증 결과 요약

| 검증 항목 | 결과 |
|----------|------|
| FR violation 18건 전부 원본 대조 | ✅ (L2347~L2482 전수 확인) |
| NFR violation 7건 전부 원본 대조 | ✅ (L2532~L2585 전수 확인) |
| Capability-relevant 제외 7건 적절성 | ✅ (SSE=streaming, WS=capability, CLI=interface, API=integration, MCP=protocol, n8n=product, PixiJS accessibility=feature) |
| Top 3 leakage density 순위 | ✅ (FR-N8N4 ~15 > FR-PERS2 3종 > FR-OC7 3종) |
| v2/v3 분포 83%/17% | ✅ (15 v3 + 3 v2 = 18) |
| V-05 reconciliation 17/18 overlap | ✅ (FR-OC2 신규) |
| Root cause: Stage 1 decisions | ✅ (confirmed-decisions-stage1.md 12건 중 7건 직접 FR에 embedded) |
| Scanning methodology 6개 카테고리 | ✅ (file paths, SQL, framework, infrastructure, method calls, architecture refs) |

## Cross-talk 결과

### Quinn Cross-talk (V-07)

**Severity 재분류** → **"Warning (Adjusted)" 합의** (3 critics 전원)
- 3단 표기: Severity: Warning (Adjusted) / Count: Critical (25→28) / Impact: Low-Medium
- V-05 adjusted severity 선례 적용

**FR-PERS5** → **Quinn 판정 수용: leakage 아님**
- "구현 방식 금지" (architecture constraint) ≠ "구현 방식 지정" (implementation leakage)
- 내 이슈 #3 철회. 그러나 analyst가 R2에서 별도 "Implementation Approach Constraints" 카테고리로 추가 — 이것도 적절한 처리.

**NFR-S9 split** → **합의: 8개 독립 테스트 항목**
- V-05 §N8N-SEC 매트릭스 합의의 자연 연장

**Quinn D2/D3 감점 근거** → **수용**
- FR-MEM1/FR-MEM7 누락 = 내 blind spot. R1 D2 8→7 조정.
- V-05 reconciliation "FR-OC2 newly caught" 오류 = cross-step accuracy 검증 부족. R1 D3 9→8 조정.

### John Cross-talk (V-07)

**"Warning (Adjusted from Critical)"** → **합의** + 4가지 완화 요인 목록 필수
**Split 비용 = 0** → **합의**. Architecture 작성의 일부로 자연 흡수.
**FR-N8N4** → Architecture n8n 섹션 작성 시 "WHAT/HOW 분리 완료" 명시적 체크포인트.

---

## [Verified] R2 Score — 8.90/10 ✅ PASS

| 차원 | R1 | R1 (Quinn 조정) | R2 | 변동 근거 |
|------|-----|----------------|-----|---------|
| D1 구체성 | 9 | 9 | 9 | 변동 없음 — 신규 항목도 동일 품질 |
| D2 완전성 | 8 | 7 | 9 | +2: FR-MEM1/MEM7 추가, FR-PERS5 추가, NFR boundary criterion, confirmed decision matrix |
| D3 정확성 | 9 | 8 | 9 | +1: V-05 reconciliation 수정 (FR-N8N1/N8N6/MEM13 신규, FR-MEM1/MEM7 복원), FR count 21/28 정확 |
| D4 실행가능성 | 8 | 8 | 9 | +1: Split priority tiers (P1-P5+Natural), confirmed decision impact matrix, hook name 괄호 표기 |
| D5 일관성 | 9 | 9 | 9 | 변동 없음 |
| D6 리스크 | 7 | 7 | 8 | +1: "Warning (Adjusted)" + 4 완화 요인, confirmed decision 유실 리스크 명시 |

**Verified weighted avg:** (9×0.15)+(9×0.15)+(9×0.25)+(9×0.20)+(9×0.15)+(8×0.10) = 1.35+1.35+2.25+1.80+1.35+0.80 = **8.90/10 ✅ PASS**

전수 검증: FR-MEM1 추가 ✅, FR-MEM7 추가 ✅, FR-PERS5 별도 카테고리 ✅, V-05 reconciliation 수정 ✅, Severity Warning (Adjusted) ✅, Confirmed decision matrix 7건 ✅, Split priority P1-P5 ✅, FR40/41 괄호 표기 ✅, NFR boundary criterion ✅, NFR-S8/S9 Architecture 이동 Rec #5 ✅. Total 9건 fix 전부 확인.
