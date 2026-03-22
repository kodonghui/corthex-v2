# Stage 3 Step V-10 — Winston (Critic-A) Review

**Reviewer:** Winston (Critic-A, Architecture + API)
**Date:** 2026-03-22
**Target:** `_bmad-output/planning-artifacts/prd-validation-report.md` (Step V-10 section)

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | 19 카테고리 × 5 SMART 차원 점수표 제공. 5건 flagged FRs 전부 정확한 FR ID, 라인 참조, 개별 SMART 점수 명시. 개선 제안에 구체적 FR 문구 초안 포함. |
| D2 완전성 | 15% | 8/10 | 123 FRs 전수 커버. V-05/V-06/V-07 cross-reference. 5건 flagged 분석 충실. **사소한 gap**: (1) Category-level 평균만 제공 — 개별 FR 점수 미공개로 outlier 확인 불가. (2) "~95/123 = 77.2%" 근사치 — 정확한 수치여야 함. |
| D3 정확성 | 25% | 8/10 | 5건 flagged 전부 정당 (FR64 M=2 ✅, FR-OC7 A=2 ✅, FR-MKT7 M=2 ✅, FR-PERS5 M=2 ✅, FR-TOOLSANITIZE3 A=2 ✅). R=5.0, T=5.0 V-06과 정합. v2/v3 분포 정확. **우려 1건**: n8n S=3.3 카테고리 평균은 FR-N8N4 (S=? ~15 terms) vs FR-N8N2/3/5 (S=5) 극단적 편차를 은폐할 수 있음 — 개별 점수 확인 필요. |
| D4 실행가능성 | 20% | 9/10 | 5건 모두 구체적 개선 제안 제공. FR64→FR-MEM6 cross-reference 실용적. FR-OC7 2-tier split 합리적. FR-PERS5→FR-PERS4 병합 V-07과 일관. FR-TOOLSANITIZE3 25종 V-05 cross-talk 합의 반영. |
| D5 일관성 | 15% | 9/10 | V-05 measurability 3/5 일치 (FR64, FR-PERS5, FR-MKT7). V-07 leakage→S scores 영향 반영. V-06 R=5.0/T=5.0 근거 정합. FR-TOOLSANITIZE3 25종 권고 V-05 cross-talk 합의 일관. |
| D6 리스크 | 10% | 7/10 | Pass severity 적절 (4.1% < 10%). **미언급 리스크 2건**: (1) Category 평균이 개별 FR outlier를 은폐하는 위험 (FR-N8N4가 S<3이면 flagged 6건). (2) 77.2% ≥4 = 22.8% (약 28건)이 3.x 대 — 이 borderline FRs가 Architecture 해석 시 모호성 유발 가능. |

## 가중 평균: 8.40/10 ✅ PASS

계산: (9×0.15)+(8×0.15)+(8×0.25)+(9×0.20)+(9×0.15)+(7×0.10) = 1.35+1.20+2.00+1.80+1.35+0.70 = **8.40**

---

## 이슈 목록

### 1. [D3/D6] Category 평균의 Outlier 은폐 — FR-N8N4 개별 점수 필요

n8n 카테고리 S=3.3 (6 FRs). FR-N8N4에 ~15 implementation terms가 있고 나머지 FR-N8N2/3/5는 clean FRs.

**산술 추정:**
- FR-N8N2/3/5: S=5 (clean WHAT)
- FR-N8N1/6: S=3 (Hono proxy 언급)
- FR-N8N4: S=? → (5+5+5+3+3+x)/6 = 3.3 → x = (3.3×6)-21 = -1.2 → **불가능**

실제로 카테고리 평균 3.3이 되려면 FR-N8N4 S≤2가 필요. S=2이면 flagging threshold(<3) 미만이므로 **FR-N8N4가 flagged 목록에서 누락되었을 가능성**.

**권고**: 5건 flagged FRs 외에 FR-N8N4의 개별 SMART 점수를 명시적으로 공개. S<3이면 flagged 목록에 추가.

### 2. [D2] "~95/123" 근사치 → 정확한 수치

"All scores ≥ 4: ~95/123 = 77.2%" — validation report에 근사치는 부적절. 19 카테고리별 점수 데이터가 있으므로 정확한 수치 산출 가능.

### 3. [D6] Borderline FRs (3.x대) Architecture 해석 리스크

22.8% (약 28건)의 FRs가 SMART 평균 3.x대. 이 FRs는:
- Flagging threshold(< 3)은 넘었으나
- Architecture 단계에서 해석 모호성 유발 가능
- 특히 S=3.x + M=3.x 조합은 "무엇을 만들어야 하는지" + "어떻게 검증하는지" 양쪽 모호

**권고**: Flagged 5건 외에 "Watch list" (SMART avg 3.0-3.9) 목록 제공. Architecture/Epic 단계에서 우선 명확화 필요한 FRs 식별에 활용.

### 4. [D4] FR-OC7 WHAT 환원 — Architecture 관점 권고

Analyst의 2가지 권고 중 **WHAT 환원이 더 적절**:
- "상태 변화를 ≤ 2초 내 감지한다 (구현 방식 Architecture 위임)" — V-07 split 전략과 일관
- 2-tier split (FR-OC7a LISTEN/NOTIFY + FR-OC7b 폴링)은 구현 분기를 FR 수준에서 결정하는 것으로, Architecture 위임 원칙에 위배

Neon LISTEN/NOTIFY 지원 여부는 **Architecture 결정** — FR은 "≤ 2초 감지"라는 WHAT만 명시해야 함.

---

## 검증 결과 요약

| 검증 항목 | 결과 |
|----------|------|
| FR64 M=2 ("활용" 모호) | ✅ PRD L2406 대조 확인 |
| FR-OC7 A=2 (Neon LISTEN/NOTIFY) | ✅ PRD L2429 "검증 필수" 자체 명시 확인 |
| FR-MKT7 M=2 ("fallback 엔진" 미지정) | ✅ PRD L2454 대조 확인 |
| FR-PERS5 M=2 ("코드 분기 없이") | ✅ V-07 Implementation Approach Constraint와 일치 |
| FR-TOOLSANITIZE3 A=2 (10종 불충분) | ✅ V-05 cross-talk 25종 합의와 일치 |
| R=5.0 전 FR | ✅ V-06 Orphan FR 0건과 정합 |
| T=5.0 전 FR | ✅ V-06 gap은 missing FR (기존 FR traceability 무관) |
| v2 4.84 vs v3 4.12 분포 | ✅ v2 core 성숙도 vs v3 신기술 불확실성 합리적 |
| V-05 cross-ref 3/5 measurability | ✅ FR64/FR-PERS5/FR-MKT7 = M 문제 |

## Cross-talk 결과

### Quinn Cross-talk (V-10)

**avg 산술 오류** → **수용** (4.50→4.59)
- FR-count weighted 계산: Σ(FRs×avg)/123 = 564.96/123 = 4.59. 내가 독립 검증 없이 analyst 수치 수용 — blind spot 확인.

**R=5.0, T=5.0 "전 FR" 검증 실패** → **수용**
- Phase 5+ (FR69-72) R=4.0-5.0, T=4.0. 내가 "R=5.0 전 FR ✅" 작성 시 category 테이블 대조 누락.
- R1 D3 8→7 조정.

**~95/123 근사치** → **합의** (91/123=74.0%)
- 내 이슈 #2와 동일. 정확한 수치로 수정됨.

**TOOLSANITIZE 25종 → OWASP 카테고리 기반** → **수용**
- V-05 cross-talk 합의는 "OWASP LLM Top 10 카테고리 기반 커버리지"였으나, 내가 "25종 V-05 cross-talk 합의 반영"으로 부정확하게 요약.
- R1 D5 9→8 조정.

**v2/v3 분류 오류** → **수용** (82/41→73/50)
- FR-PERS를 v2로 분류한 것은 부정확. Phase FRs (73건) vs Sprint FRs (50건)으로 재분류 합의.

**FR-N8N4 S=2 추론** → **합의** (내 이슈 #1과 동일)
- Category avg만으로는 확정 불가하나, 산술적으로 S≤2 필수. Analyst가 S=2로 명시적 flagging.

**TOOLSANITIZE 2-stage QA** → **합의**
- Stage 1 (Sprint 2) 기준선 + Stage 2 (Sprint 3 Go/No-Go) 확장. OWASP 카테고리 기반 커버리지.

### John Cross-talk (V-10)

**FR-OC7 Option B (WHAT 환원)** → **합의** (3 critics 전원)
- "≤ 2초 내 감지 (구현 방식 Architecture 위임)" — V-07 split 철학 일관.
- 2-tier split 불필요.

**FR64 유지 + FR-MEM6 cross-reference** → **합의**
- FR64 삭제가 아니라 측정 기준을 FR-MEM6로 구체화. Phase 유지 보장.

**Phase 5+ 개별 점수** → **합의**
- R/T < 5.0 유일한 카테고리. 개별 FR 점수로 예외 명시 필요.

**Category Lowest FR 테이블** → **합의**
- 비-flagged FR 중 가장 취약한 FR 식별. Architecture 단계 우선순위 참고.

**Improvement Priority Tiers** → **합의**
- P1 Immediate / P2 PRD Fix / P3 Architecture 위임. Owner 명시.

---

## [Verified] R2 Score — 8.90/10 ✅ PASS

| 차원 | R1 | R1 (Quinn 조정) | R2 | 변동 근거 |
|------|-----|----------------|-----|---------|
| D1 구체성 | 9 | 9 | 9 | 변동 없음 — Phase 5+ 개별 R/T, category lowest, priority tiers 추가로 구체성 유지 |
| D2 완전성 | 8 | 8 | 9 | +1: 91/123 정확 수치, borderline watch list 5건, category lowest 8건, Phase 5+ 개별 R/T, NFR cross-ref note |
| D3 정확성 | 8 | 7 | 9 | +2: avg 4.59 정정, R/T Phase 5+ 예외 명시, v2/v3→Phase/Sprint 재분류 (73/50), FR-N8N4 S=2 flagged |
| D4 실행가능성 | 9 | 9 | 9 | 변동 없음 — FR-OC7 WHAT 환원, priority tiers (P1-P3), TOOLSANITIZE OWASP 2-stage |
| D5 일관성 | 9 | 8 | 9 | +1: TOOLSANITIZE OWASP 카테고리 기반 수정, V-07 split 철학 일관 적용 |
| D6 리스크 | 7 | 7 | 8 | +1: borderline watch list, FR-N8N4 methodology fix, category lowest FR 리스크 식별 |

**Verified weighted avg:** (9×0.15)+(9×0.15)+(9×0.25)+(9×0.20)+(9×0.15)+(8×0.10) = 1.35+1.35+2.25+1.80+1.35+0.80 = **8.90/10 ✅ PASS**

전수 검증: 15건 fix 전부 확인.
- Quinn 5건: avg 4.59 ✅, R/T Phase 5+ 예외 ✅, 91/123 정확 ✅, OWASP 카테고리 기반 ✅, Phase/Sprint 73/50 재분류 ✅
- Winston 4건: 근사치 제거 ✅, FR-N8N4 S=2 flagged ✅, FR-OC7 WHAT 환원 ✅, borderline watch list 5건 ✅
- John 6건: Phase 5+ 개별 R/T ✅, category lowest 8건 ✅, FR64 cross-ref FR-MEM6 ✅, priority tiers P1-P3 ✅, NFR cross-ref note ✅, improvement suggestion 구체화 ✅

**잔여 이슈 1건 (Severity: Low):**
- Watch list 제목 "SMART Avg 3.0-3.9"이나 수록된 5건 FR 전부 avg ≥ 4.0 (FR-MEM1=4.4, FR-MEM7=4.2 등). 기준을 "any SMART dimension = 3, not flagged"로 수정 권고. 실질적 내용은 정확하므로 점수 영향 미미.
