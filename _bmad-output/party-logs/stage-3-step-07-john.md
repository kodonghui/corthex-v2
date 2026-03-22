# Stage 3 Step V-07 — Critic-C (John) Review

**Step:** V-07 Implementation Leakage Validation
**Reviewer:** John (Critic-C, Product + Delivery)
**Date:** 2026-03-22
**Artifact:** `_bmad-output/planning-artifacts/prd-validation-report.md` Lines 595-749

---

## Critic-C Review — V-07 Implementation Leakage Validation

### 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 20% | 모든 위반 FR/NFR을 ID + 라인번호 + 구체적 누출 용어로 참조. 4개 FR 카테고리(파일경로/DB·SQL/프레임워크/인프라) 분류 체계적. Top 3 worst offenders 식별 + FR 그룹별 밀도 테이블(Very Low~Very High) 명확. 능력 관련 용어 제외 목록(SSE, WebSocket, CLI, API, MCP, n8n, PixiJS) 근거 명시. 분리 권고에 FR-PERS2 before/after 예시 포함 — 구체적이고 실행 가능. |
| D2 완전성 | 8/10 | 20% | 123 FR + 76 NFR 전수 스캔. FR 18건 + NFR 7건 = 25건 위반 식별. V-05 대비 reconciliation 명시(17/18 overlap + FR-OC2 신규). NFR을 genuine(7) vs acceptable(22)로 분류 — 이중 검증 양호. 감점: **22개 "acceptable" NFR 분류의 독립 검증 부재.** NFR이 measurement tool/infrastructure constraint를 참조하는 것이 "acceptable"이라는 기준은 합리적이나, 경계선 사례(예: NFR-S9가 7건 genuine에 포함되었으나 NFR-S8도 유사한 layer 명칭 사용) 검증 필요. |
| D3 정확성 | 9/10 | 15% | 직접 검증: FR-N8N4(L2440) ~15 구현 용어 ✅, FR-PERS2(L2459) Zod+SQL ✅, FR-OC7(L2429) LISTEN/NOTIFY+파일경로 ✅. V-05 reconciliation: 17/18 overlap 정확 — FR-OC2가 V-05에서 누락된 이유는 V-05가 measurability(주관어/모호정량자) 기준이고 V-07은 implementation term 기준이므로 검출 축이 다름. 능력 관련 용어 제외 판정 전부 정확 — 특히 "n8n = 제품명, PixiJS in 접근성 FR = 라이브러리가 곧 기능" 판단 합리적. |
| D4 실행가능성 | 8/10 | 15% | WHAT+HOW 분리 권고 + FR-PERS2 예시 구체적. v2 core FR40/41 훅 이름 제거 권고 적절. NFR-S9 special mention 양호. 감점: **18개 FR 분리 우선순위 미지정.** 18건 전부 분리하면 상당한 작업량. 즉시 처리(fixes) vs Architecture 위임 구분 필요. 최소한 Top 3(FR-N8N4, FR-PERS2, FR-OC7)는 fixes에서 WHAT 추출, 나머지 15건은 Architecture 단계에서 분리하는 단계적 접근이 효율적. |
| D5 일관성 | 9/10 | 10% | FR 총수 123 = V-05/V-06과 일치. NFR 76개 일치. V-05 structural 분류와 V-07 leakage 분류 정합. "Critical (>5)" 심각도 루브릭 정합. 카테고리 분류 형식 V-05와 일관. |
| D6 리스크 인식 | 7/10 | 20% | 근본 원인 분석(Stage 1 확정 결정 → FR 직접 삽입) 양호. 4가지 완화 요인(의도적 설계, WHAT 테스트 가능, 집중도, V-05 정합) 균형 잡힌 평가. "Critical severity + Low-Medium priority" 판단 적절. 감점 2건: (1) **Stage 1 결정 변경 시 이중 관리 리스크 미재평가.** V-05에서 지적한 동일 리스크이나, V-07에서 18개 FR 목록이 구체화되었으므로 변경 영향 범위(18 FR + Architecture Constraints 양쪽 수정)를 명시적으로 재평가했어야 함. (2) **FR-N8N4 delivery 리스크 미평가.** ~15 구현 용어가 단일 FR에 집중 = Sprint 2에서 이 FR의 acceptance criteria 작성/테스트 시 구현 세부사항과 기능 요구사항이 혼재 → 테스트 경계 불명확. V-05에서 "분리 권고"했으나 V-07에서 실제 delivery 영향을 재평가하지 않음. |

### 가중 평균: 8.25/10 ✅ PASS

**계산:** (9×0.20) + (8×0.20) + (9×0.15) + (8×0.15) + (9×0.10) + (7×0.20) = 1.80 + 1.60 + 1.35 + 1.20 + 0.90 + 1.40 = **8.25**

---

### 판단 사항(Judgment Calls) 응답

#### JC1: Capability-relevant terms exclusion list

**동의 — 전부 정확.**

- **SSE/WebSocket**: 사용자 대면 전달 방식. "실시간 스트리밍" = WHAT.
- **CLI/API**: 사용자 대면 인터페이스. "CLI로 관리" = WHAT.
- **MCP**: 프로토콜 수준 capability. "MCP 서버 연결" = WHAT.
- **n8n**: 제품명. "n8n 워크플로우 실행" = WHAT. (반면 "Hono reverse proxy" = HOW.)
- **PixiJS in FR-OC9/10 접근성**: 라이브러리가 곧 기능. "PixiJS Canvas에 aria-label 제공" = 특정 라이브러리의 접근성 처리이므로 WHAT.

단, PixiJS가 FR-OC1(L2423)에서 참조되는 것은 leakage로 정확히 분류됨 — 거기서는 "이 기능을 PixiJS로 구현한다"이므로 HOW.

#### JC2: "Critical" severity with Low-Medium priority

**동의 — 적절한 이중 판단.**

- **Severity = Critical**: BMAD 루브릭 기준 >5건 위반 = Critical. 객관적 기준 충족.
- **Priority = Low-Medium**: 모든 FR이 기능적으로 테스트 가능 + 의도적 설계 + v2 core 3건뿐. Product/Delivery 관점에서 이 누출이 downstream(Architecture/Epic/Sprint)을 **차단하지 않는다**.
- 이 구분은 합리적. "심각하지만 급하지 않다" = 정확한 평가.

#### JC3: WHAT+HOW 분리 권고 vs 현 상태 유지

**조건부 동의 — 단계적 접근 권고.**

분리가 이상적이나, 18건 전수 분리는 PRD 검증 단계에서 과도한 작업. 권고:
- **Fixes (즉시)**: Top 3(FR-N8N4, FR-PERS2, FR-OC7)만 WHAT 추출. 이 3건은 구현 용어 밀도가 높아 테스트 경계가 모호.
- **Architecture 위임 (나머지 15건)**: Architecture 문서에 "Confirmed Constraints" 섹션 생성 시 자연스럽게 분리. FR 텍스트는 현 상태 유지해도 Architecture가 HOW를 흡수하면 사실상 분리 완료.
- **v2 Core (FR40/41)**: 훅 이름 제거 = 즉시 가능, 사소한 수정.

---

### 이슈 목록

#### 1. **[D6 리스크] Moderate — Stage 1 결정 변경 시 이중 관리 범위 구체화**

V-05에서 지적한 이중 관리 리스크가 V-07에서 18개 FR로 구체화됨. Stage 1 결정 변경 시:
- 12개 확정 결정 중 어느 것이 변경되면 어떤 FR이 영향받는지 매핑 필요.
- 예: Decision 1 (Voyage AI 1024d) 변경 → FR-MEM2, FR-MEM5 수정 필요. Decision 5 (n8n Docker 2G) 변경 → FR-N8N4 수정 필요.
- **권고**: Architecture 단계에서 "Decision→FR Impact Matrix" 생성. 현 단계에서는 informational note 추가.

#### 2. **[D4 실행가능성] Low — 18건 분리 우선순위 미지정**

분리 권고에 우선순위 구분 추가 권고:
- **Fixes 즉시 (3건)**: FR-N8N4, FR-PERS2, FR-OC7 — 구현 용어 밀도 최고, 테스트 경계 모호
- **Architecture 위임 (12건)**: FR-OC1/2, FR-N8N1/6, FR-PERS3, FR-MEM2/3/4/5/6/8/13 — Architecture Constraints로 자연 분리
- **Fixes 간단 수정 (3건)**: FR35, FR40, FR41 — 단순 용어 제거/대체

#### 3. **[D6 리스크] Low — FR-N8N4 Sprint 2 delivery 리스크**

~15 구현 용어가 단일 FR에 집중. Sprint 2에서:
- Acceptance criteria 작성 시 WHAT(n8n 통합 기능)과 HOW(Docker 설정, 포트, 메모리, 암호화) 분리 필요
- 테스트 시 기능 테스트와 인프라 테스트 혼재
- V-05에서 "Architecture 단계 분리 적절" 합의 — V-07에서도 동일 입장 유지

#### 4. **[D2 완전성] Informational — "acceptable" NFR 22건 경계선 사례**

22개 acceptable NFR 중 NFR-S8(4-layer 구현 이름)이 genuine 7건에 포함된 기준과, 유사한 참조를 하는 다른 NFR이 acceptable로 분류된 기준의 차이가 명시적이면 더 투명. 사소.

---

### Cross-talk 메모

- Winston에게: FR-N8N4 ~15 구현 용어의 Architecture 분리 — 현재 FR 텍스트에서 WHAT("n8n이 8개 보안 레이어를 통과한다")만 남기고 나머지를 Architecture §N8N-SEC로 이동하는 것이 기술적으로 가능한지? 혹은 8개 레이어 전부가 FR 수준에서 명시되어야 하는지?
- Quinn에게: NFR-S9(L2537) 8-layer 전체 구현 상세 — 이것이 NFR에 포함된 것의 보안 검증 관점 타당성. "8-layer 100% pass"만으로도 보안 테스트 계획 수립이 가능한지, 아니면 layer별 명세가 NFR에 있어야 테스트 커버리지 보장이 되는지?

---

**결론:** V-07 Implementation Leakage Validation은 높은 품질. 123 FR + 76 NFR 전수 스캔, 25건 위반 정확 식별, 능력 관련 용어 제외 판단 적절, 근본 원인 분석 양호. Stage 1 결정 변경 이중 관리 리스크 + 분리 우선순위 미지정 2건은 fixes/Architecture에서 해결 가능. **8.25/10 ✅ PASS.**

---

## [Verified] R2 Fixes — 8.25/10 ✅ PASS (유지)

**Date:** 2026-03-22
**Verification:** 3 Critic 피드백 전부 반영 확인.

| # | Fix | Source | Verified |
|---|-----|--------|----------|
| 1 | FR-MEM1 (L635) + FR-MEM7 (L654) 추가, Unique FRs 18→21 | Quinn M1 | ✅ |
| 2 | V-05 Reconciliation 수정: 18/21 overlap + newly caught 3건 + reinstated 2건 (L746) | Quinn M2 | ✅ |
| 3 | FR-PERS5 "Implementation Approach Constraints" 신규 카테고리 (L670-674) | Winston W3 | ✅ |
| 4 | Severity "Critical" → "Warning (Adjusted)" + 4가지 완화 요인 (L739-746) | Winston W1 | ✅ |
| 5 | Confirmed Decision→FR Impact Matrix 7건 (L770-782) | Winston W2 + John J1 | ✅ |
| 6 | Split Priority Tiers P1~P5 + Natural (L757-766) | Winston W4 + John J2 | ✅ |
| 7 | FR40/41 hook name 괄호 보조 표기 유지 (L667-668, L768) | Quinn security | ✅ |
| 8 | NFR "acceptable" boundary criterion 명시 (L705, L748) | John J4 | ✅ |
| 9 | NFR-S8/S9 security layer → Architecture §Security-Layers 이동 권고 (L784) | Quinn L1 | ✅ |

**Updated totals verified:** 21 FR violations + 7 NFR violations = 28 total. v3 = 18/21 (86%). Memory 9/14 (64%). Personality 3/9. Severity: Warning (Adjusted from Critical). ✅
**Score 유지:** 8.25/10 — fixes가 내 지적사항 4건을 정확히 반영.
