# Stage 3 Step V-02b — Critic-C (John) Review

**Step:** V-02b Format Detection Parity Check
**Reviewer:** John (Critic-C, Product + Delivery)
**Date:** 2026-03-22
**Artifact:** `_bmad-output/planning-artifacts/prd-validation-report.md` Lines 50-93

---

## Critic-C Review — V-02b Format Detection Parity Check

### 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 7/10 | 20% | 11개 헤더 전부 이름+라인번호 명시. 그러나 **10/11 라인번호가 현재 PRD와 불일치** (pre-sweep 후 drift — 아래 상세). |
| D2 완전성 | 9/10 | 20% | L2 헤더 11/11 전수 검출, BMAD Core 6/6 확인, Additional 5개 카테고리 분류. v-02b skip 사유 기록. 빠진 것 없음. |
| D3 정확성 | 6/10 | 15% | **핵심 이슈**: 라인번호 10/11 오류. L110만 정확, L265→실제 L273, L451→L471, ... L2343→L2499. 헤더 이름·개수·분류는 전부 정확. |
| D4 실행가능성 | 8/10 | 15% | Format detection은 downstream step의 입력 결정 단계. BMAD Standard 확정 → v-03부터 validation 진행 가능. 명확함. |
| D5 일관성 | 9/10 | 10% | PRD frontmatter의 `workflowType: 'prd'`, `projectType: saas_b2b`, 12 steps complete 메타데이터와 일치. v-02b skip은 workflow 정의 L54 "Dependencies: Step 2 classified PRD as non-standard"과 정합. |
| D6 리스크 | 6/10 | 20% | Pre-sweep fixes가 PRD에 content를 추가/변경했으나, **라인번호 drift 리스크를 인식하지 못함**. 후속 step에서 이 stale 라인번호를 참조하면 오검증 위험. |

### 가중 평균: 7.35/10 ✅ PASS

계산: (7×0.20) + (9×0.20) + (6×0.15) + (8×0.15) + (9×0.10) + (6×0.20) = 1.40 + 1.80 + 0.90 + 1.20 + 0.90 + 1.20 = **7.40**

### 이슈 목록

1. **[D3 정확성] CRITICAL — 라인번호 10/11 Stale**
   - 보고서 라인번호 vs 현재 PRD 실제 라인번호:
     | 보고서 | 실제 | 차이 | 헤더 |
     |--------|------|------|------|
     | L110 | L110 | 0 | Project Discovery ✅ |
     | L265 | L273 | +8 | Executive Summary |
     | L451 | L471 | +20 | Success Criteria |
     | L625 | L668 | +43 | Product Scope |
     | L992 | L1070 | +78 | User Journeys |
     | L1258 | L1352 | +94 | Domain-Specific Requirements |
     | L1439 | L1538 | +99 | Innovation & Novel Patterns |
     | L1677 | L1784 | +107 | Technical Architecture Context |
     | L1951 | L2085 | +134 | Project Scoping & Phased Development |
     | L2139 | L2285 | +146 | Functional Requirements |
     | L2343 | L2499 | +156 | Non-Functional Requirements |
   - **원인**: Pre-sweep fixes (Gemini→Voyage, 4G→2G, vector(768)→vector(1024), Subframe→Stitch 2 등)가 PRD 본문에 content를 추가하면서 라인이 점진적으로 밀림. drift가 L8→L156으로 누적 증가하는 패턴이 이를 뒷받침.
   - **권고**: 보고서의 라인번호를 현재 PRD 기준으로 업데이트. 후속 validation step들이 이 라인번호를 참조하면 잘못된 위치를 검증하게 됨.

2. **[D6 리스크] Pre-sweep → Line Drift 리스크 미언급**
   - Pre-sweep fixes가 적용되었다는 사실은 보고서 상단에 기록되어 있으나, 그로 인한 **라인번호 무효화 리스크**가 Findings/Recommendations에 없음.
   - **권고**: Recommendations에 "Pre-sweep 후 라인번호 재검증 필요" 한 줄 추가.

3. **[D1 구체성] Minor — Additional Sections 설명이 간략**
   - "Project Discovery (classification, detection signals, sprint dependencies)" 등 괄호 안 부연은 유용하나, 실제 L3 헤더 수나 requirement ID 개수까지 명시하면 후속 step에서 더 유용. 현재는 Domain-Specific만 "75 domain requirements"로 구체적.

### v-02b Skip 판정

**동의함.** v-02b step 정의 L54: "Dependencies: Step 2 classified PRD as non-standard and user chose parity check" — v-02b는 명시적으로 비표준 PRD용. BMAD Standard 확정 시 skip은 workflow 설계 의도에 부합. PRD가 BMAD 파이프라인 12 steps (avg 9.03)으로 생성되었으므로 BMAD Standard 분류 자체도 타당.

### Cross-talk 요약
- (Awaiting Critic-A, Critic-B feedback for cross-reference)
- 라인번호 drift는 후속 step 전체에 영향. 다른 Critics도 라인 참조 시 현재 PRD 기준 검증 필요.

---

**최종 판정: 7.4/10 — PASS (conditional)**
조건: 이슈 #1 라인번호 업데이트 적용 후 D3 → 8+, 전체 8.0+ 예상.
