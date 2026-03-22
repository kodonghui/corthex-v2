# Stage 3 Step V-05 — Critic-C (John) Review R2

**Step:** V-05 Measurability Validation (Rewrite — fixes from R1 FAIL applied)
**Reviewer:** John (Critic-C, Product + Delivery)
**Date:** 2026-03-22
**Artifact:** `_bmad-output/planning-artifacts/prd-validation-report.md` Lines 279-395

---

## R1 수정 검증

이전 리뷰(5.20/10 FAIL)에서 지적한 필수 수정 6건 확인:

| # | R1 이슈 | R2 상태 |
|---|---------|---------|
| 1 | FR 카운트 116→123 (PERS +1, MEM +3, TOOLSANITIZE +3) | ✅ 수정됨 — "123 active" L283 정확 |
| 2 | NFR 카운트 74→76 (Security S10 + 기타) | ✅ 수정됨 — "76 active" L344 정확. 12 categories sum: 17+10+9+3+7+8+3+11+3+3+3+1=78 minus ~~S7/D7~~=76 |
| 3 | 7개 누락 FR 분석 추가 | ✅ 수정됨 — FR-PERS9, FR-MEM12-14, FR-TOOLSANITIZE1-3 전부 분석에 포함 |
| 4 | NFR-S10 분석 추가 | ✅ 수정됨 — Security 카테고리 10개 (minus S7 = 9) |
| 5 | 라인번호 업데이트 | ✅ 수정됨 — FR17 L2314, FR-N8N4 L2440, FR-PERS2 L2459 등 현재 PRD 기준 |
| 6 | Violation count/pass rate 재산정 | ✅ 수정됨 — 25 violations (18 FR + 7 NFR), 199 total |

**R1 수정 품질: 6/6 — 전부 해결.**

---

## Critic-C Review — V-05 Measurability Validation (R2)

### 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 20% | 모든 FR/NFR을 ID + 정확한 라인번호로 참조. 구현 누출 테이블에 구체적 파일 경로, SQL, 단어 수("~250 words") 명시. "17/123 = ~14%" 정량 계산. Heavy(11건) vs Moderate(6건) 분류 기준 명확. 감점: 구현 누출 17건의 v2 레거시 vs v3 신규 분포 미명시 (v3 FRs에 12/17 집중 — Stage 1 확정 결정 삽입 패턴). |
| D2 완전성 | 8/10 | 20% | 199개 요구사항 전수 분석 (R1 누락 8건 해소). FR 4축(형식/주관어/모호정량자/구현누출) + NFR 3축(누락메트릭/불완전템플릿/누락컨텍스트) = 7축 포괄. 3가지 judgment call 명시 요청 — 투명성 양호. 감점: **FR 간 중복 체크 미수행** (FR-MEM2/MEM5 동일 Voyage AI embedding 패턴 — 다른 테이블 대상이므로 중복 아닌 parallel이나, 명시적 확인 필요). |
| D3 정확성 | 9/10 | 15% | 직접 검증: FR17 L2314 "적절한" ✅, FR-N8N4 L2440 ~250단어 ✅, NFR-O4 L2602 "평가자 2명 5점 척도" ✅, NFR-CQ1 L2637 검증 방법 미명시 ✅. FR 총수 계산: 70(FR1-72 minus ~~37/39~~)+11(OC)+6(N8N)+7(MKT)+9(PERS)+14(MEM)+3(TOOLSANITIZE)+3(UX)=123 ✅. 구현 누출 17건 전부 PRD 원문 대조 확인. |
| D4 실행가능성 | 8/10 | 15% | 6개 권고 전부 실행 가능: FR17 인라인 정의, 구현 누출 ADR 분리, NFR 측정 방법 컬럼 통일, NFR-A1/A2 도구 지정, NFR-O4 신뢰도, NFR-CQ1 검증 방법. 감점: **권고사항 우선순위 미지정** — 6개 중 fixes 즉시 처리(FR17, NFR-A1/A2, NFR-CQ1) vs Architecture 위임(구현 누출 분리, NFR 템플릿, NFR-O4 기준) 구분 필요. |
| D5 일관성 | 9/10 | 10% | V-01→V-05 순차 진행. Heavy vs Moderate 구현 누출 분류 일관. Warning 심각도 루브릭 정합. R1에서 V-04와 불일치하던 FR 카운트 해소. |
| D6 리스크 인식 | 7/10 | 20% | 근본 원인 분석 양호 — "Stage 1 확정 결정이 FR에 직접 삽입된 것이 원인". 심각도 조정(measurability vs structural 분리) 적절한 판단. 감점: (1) **구현 누출 downstream 리스크 미평가** — Architecture에서 기술 결정 변경 시 17개 FR 텍스트도 수정 필요 = 이중 관리 부담. (2) **FR-N8N4 분리가 delivery scope 변경** — 250단어 단일 FR 분리 시 재검증 필요, 노력량 미평가. |

### 가중 평균: 8.25/10 ✅ PASS

**계산:** (9×0.20) + (8×0.20) + (9×0.15) + (8×0.15) + (9×0.10) + (7×0.20) = 1.80 + 1.60 + 1.35 + 1.20 + 0.90 + 1.40 = **8.25**

---

### 판단 사항(Judgment Calls) 응답

#### JC1: "17 implementation leakage" = measurability or structural?

**동의 — structural.** 이유:

1. **Testability**: 17개 FR 전부 테스트 케이스 작성 가능. 구현 세부사항이 있어도 "무엇을 테스트할지" 명확.
2. **Product/Delivery 관점**: Solo dev + AI 프로젝트에서 Stage 1 확정 결정을 FR에 삽입 = **의도적 trade-off.** WHAT-HOW 분리 시 결정 누락 리스크 > 구현 누출 리스크.
3. **단, FR-N8N4는 과적재.** 250단어 = 보안 레이어 8개 전부. 최소 FR-N8N4a/b/c 분리 또는 "N8N-SEC 8-layer (Architecture §N8N-SEC 참조)" 교차 참조 권고. **Architecture 단계에서 분리 적절** (현 단계는 검증만).

#### JC2: Korean "~된다" system behavior convention

**동의 — valid.**

- 한국어 기술 문서에서 "[시스템]이 ~된다" = 영어 "The system shall". BMAD "[Actor] can [capability]"는 영어 중심.
- 82/123 FRs가 이 패턴 사용, 전부 명확한 주어 + 테스트 가능한 동사 보유.
- 위반으로 분류 시 82건 = 즉시 Critical → 의미 없는 결과. **한국어 convention 존중이 맞음.**

#### JC3: NFR-O4 subjective A/B evaluation

**조건부 수용.**

- LLM 응답 품질 = 본질적 주관적. A/B blind + 5점 척도 = 업계 표준 (Anthropic evals, Chatbot Arena 참조).
- "평가자 2명" = Solo dev 현실 반영. "평균 ≥ 기존" = no-regression 임계값 명확.
- **BUT**: 분석가 권고 타당 — inter-rater reliability (Cohen's κ ≥ 0.6), 5점 척도 기준표 정의 필요.
- **현 단계 해결**: PRD에 "평가 기준 Architecture/Test Plan 단계에서 정의" 메모 추가. 블로커 아님.

---

### 이슈 목록

#### 1. **[D6 리스크] Moderate — 구현 누출 downstream 이중 관리 리스크**

17개 FR에 하드코딩된 구현 세부사항(Voyage AI 1024d, pg_advisory_xact_lock, soul-enricher.ts 등) = Architecture 결정과 FR 텍스트 이중 관리. Architecture에서 결정 변경 시 FR도 수정 필요.

**완화**: Architecture 단계에 "FR 구현 세부사항 정합성 검증" 체크포인트 추가. Heavy 11건만 해당.

#### 2. **[D2 완전성] Low — FR 중복 체크 미수행**

FR-MEM2(L2471)와 FR-MEM5(L2474): 둘 다 "Voyage AI Embedding (voyage-3, 1024d)로 자동 벡터화". 기능적으로 다른 테이블 대상(observations vs agent_memories) — 중복 아닌 parallel이나 명시적 확인 필요.

#### 3. **[D4 실행가능성] Low — 권고사항 우선순위 미지정**

6개 권고 분류 권고:
- **Fixes (즉시)**: FR17 "적절한" 인라인 정의, NFR-A1/A2 도구 지정, NFR-CQ1 검증 방법
- **Architecture 위임**: 구현 누출 분리, NFR 템플릿 통일, NFR-O4 평가 기준

#### 4. **[D6 리스크] Low — FR-N8N4 분리 노력량**

FR-N8N4 250단어 분리 시 FR 구조 변경 + V-05 violation count 변동. Architecture 단계에서 분리 적절.

#### 5. **[D1 구체성] Informational — 구현 누출 v2/v3 분포**

17건 중 v3 신규 FR 12/17: FR-OC(3), FR-N8N(1), FR-PERS(2), FR-MEM(6). v2 레거시 3/17: FR35, FR40, FR41. Moderate 2건도 v2. 패턴: Stage 1 확정 결정 → v3 FRs 직접 삽입이 주원인.

---

### Cross-talk 메모

- Quinn에게: FR-PERS2(L2459) "prompt injection 방지: 문자열 타입 값 일괄 거부" — 방어 범위가 모든 injection vector를 커버하는지? PER-1 4-layer와의 관계 확인 요청.
- Winston에게: FR-OC7(L2429) PostgreSQL `LISTEN/NOTIFY` + Neon caveat + polling fallback = FR-N8N4 유사 과적재. Architecture 관점 의견 요청.

---

### R1 → R2 개선도

| 지표 | R1 | R2 | 변화 |
|------|------|------|------|
| 점수 | 5.20/10 ❌ | 8.25/10 ✅ | +3.05 |
| 누락 FR | 7건 | 0건 | 완전 해소 |
| 누락 NFR | 1건 | 0건 | 완전 해소 |
| FR 카운트 오류 | 116→123 | 123 정확 | 해소 |
| 라인번호 drift | ~+146 FR, ~+157 NFR | 0 drift | 해소 |

**결론:** R1 FAIL 지적사항 6/6 완벽 수정. R2는 높은 품질. 199개 요구사항 전수 분석, 위반 분류 정확, 3가지 judgment call 모두 적절. 미세 보완 5건(이중 관리 리스크, FR 중복 체크, 권고 우선순위, FR-N8N4 노력량, 누출 분포)은 fixes 또는 Architecture 단계에서 해결 가능. **8.25/10 ✅ PASS.**

---

## [Verified] R2 Fixes — 8.25/10 ✅ PASS (유지)

**Date:** 2026-03-22
**Verification:** 3 Critic 피드백 전부 반영 확인.

| # | Fix | Source | Verified |
|---|-----|--------|----------|
| 1 | Architecture checkpoint for 17 FR dual-management risk (L409) | John D6 | ✅ |
| 2 | FR-MEM2/MEM5 near-identical leakage note (L340) | John D2 | ✅ |
| 3 | Recommendations split: Immediate (4) vs Architecture-Deferred (3) (L402-411) | John D4 | ✅ |
| 4 | FR-N8N4 separation = Architecture-deferred (L409) | John D6 | ✅ |
| 5 | 12/17 leakage in v3 FRs = Stage 1 insertion pattern (L338) | John D1 | ✅ |
| 6 | Cross-reference traceability to Stage 1 decisions (L409) | Winston D6 | ✅ |
| 7 | FR-N8N4 ~250→~40 words refactoring example (L409) | Winston D4 | ✅ |
| 8 | Security "100%" bounded pattern set justification (L352) | Quinn L1 | ✅ |
| 9 | Adversarial Test Sufficiency: 10종→최소 25종 OWASP (L377-383, L406) | Quinn M1 | ✅ |

**Updated totals verified:** 27 violations (18 FR + 9 NFR). Genuine measurability: 10. Structural: 17. ✅
**Adversarial approach note:** L406 uses "최소 25종 (OWASP LLM Top 10 카테고리별 2-3종)" — hybrid of category-based + minimum count. Acceptable compromise between my category-based recommendation and Quinn's count-based recommendation.
**Score 유지:** 8.25/10 — fixes가 내 지적사항 5건을 정확히 반영.
