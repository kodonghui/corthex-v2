# Stage 3 Step V-10 — Critic-C (John) Review

**Step:** V-10 SMART Requirements Validation
**Reviewer:** John (Critic-C, Product + Delivery)
**Date:** 2026-03-22
**Artifact:** `_bmad-output/planning-artifacts/prd-validation-report.md` Lines 890-969

---

## Critic-C Review — V-10 SMART Requirements Validation

### 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 20% | 19개 카테고리 × 5 SMART 차원 스코어링 테이블 체계적. 5건 flagged FR 각각 개별 S/M/A/R/T 점수 + flag 사유 + 개선 제안(대체 FR 문구까지) 구체적. V-05/V-06/V-07 교차 참조 명시. v2 Core vs v3 Sprint 비교 분석(4.84 vs 4.12) 구체적. FR-OC7 2-tier 분리 제안, FR64→FR-MEM6 cross-reference 권고 등 actionable. |
| D2 완전성 | 8/10 | 20% | 123 FRs 전수 분석 (19 카테고리). 5건 flagged(4.1% < 10% 임계값) 식별. V-05(measurability), V-07(leakage) 교차 참조 포괄적. 감점: (1) **개별 FR 점수 미제공** — 카테고리 평균만 제시. Memory 카테고리 avg 4.34이지만 FR-MEM3(pg_advisory+파일경로)는 S=2~3일 수 있고, 이것이 평균에 묻힘. 123건 전부 나열할 필요는 없으나 최소한 각 카테고리 내 최저 FR 표기 필요. (2) **NFR SMART 분석 미포함** — scope을 FR 한정으로 명시했으나, NFR-P0 22개가 릴리스 게이트인 점 감안하면 NFR SMART도 최소 informational 수준으로 필요. |
| D3 정확성 | 9/10 | 15% | 직접 검증: FR64 "활용" 모호 ✅, FR-OC7 Neon LISTEN/NOTIFY 불확실 ✅ (PRD L2429 자체 "검증 필수" 명시), FR-PERS5 "코드 분기 없이" = V-07 Implementation Approach Constraint ✅, FR-TOOLSANITIZE3 10종 불충분 = V-05 합의 ✅. R=5.0, T=5.0 전 FR — 기존 FR은 모두 journey/objective에 연결되므로 정확 (V-06 gap은 missing FR이지 existing FR의 T 문제 아님). 감점: Phase 5+ R=4.5, T=4.0 — 다른 전 카테고리가 R=5.0, T=5.0인데 이 이상치의 근거가 미명시. |
| D4 실행가능성 | 8/10 | 15% | 5건 개선 제안 전부 actionable: FR64 FR-MEM6 교차참조, FR-OC7 2-tier 분리 또는 WHAT 환원, FR-MKT7 구체 엔진 목록, FR-PERS5 FR-PERS4 병합, FR-TOOLSANITIZE3 OWASP 확장. 감점: **개선 우선순위 미지정.** 5건 중 fixes 즉시(FR-PERS5 병합, FR64 cross-ref) vs Architecture 위임(FR-OC7 분리, FR-TOOLSANITIZE3 확장) vs PRD 수정(FR-MKT7 구체화) 구분 필요. |
| D5 일관성 | 9/10 | 10% | FR 총수 123 일관. V-05 measurability 3/5 일치 확인. V-07 leakage와 S score 연관 일관. 카테고리 분류 V-05/V-07과 정합. 임계값 10% 기준 일관 적용. |
| D6 리스크 인식 | 7/10 | 20% | v2 vs v3 gap(4.84 vs 4.12) 식별 양호. V-07 split 적용 시 S score 향상 가능성 인식. 감점 2건: (1) **Phase 5+ (FR69-72) 이상치 미분석.** R=4.5, T=4.0은 유일하게 5.0 미만인 카테고리. 미래 Phase FR이므로 spec 불완전은 예상되나, 왜 R(Relevant)이 4.5인지 — 비즈니스 목표와의 연결이 약한 FR이 있다면 그것은 scope 리스크. T=4.0도 여정 연결이 불완전하다는 의미 — V-06 traceability와의 정합성 확인 필요. (2) **카테고리 평균이 outlier를 마스킹하는 리스크.** Memory 카테고리 avg 4.34이지만, FR-MEM3(S=? pg_advisory+파일경로 leakage)가 개별적으로 flagged 임계값 근처일 수 있음. 카테고리 평균만으로는 "near-miss" FR을 식별할 수 없다. |

### 가중 평균: 8.25/10 ✅ PASS

**계산:** (9×0.20) + (8×0.20) + (9×0.15) + (8×0.15) + (9×0.10) + (7×0.20) = 1.80 + 1.60 + 1.35 + 1.20 + 0.90 + 1.40 = **8.25**

---

### 판단 사항(Judgment Calls) 응답

#### JC1: FR64 autoLearn — FR-MEM6으로 대체 가능한가?

**동의 — 기능 중복이 실질적이다.**

- FR64(v1 Compat): "학습한 내용을 자동 저장하고 이후 활용"
- FR-MEM6(Sprint 3): "에이전트가 이전 세션의 관찰과 반성을 다음 세션 시스템 프롬프트에 주입하여 맥락적으로 활용한다"
- FR-MEM6이 FR64의 상위호환. Sprint 3에서 FR-MEM6이 구현되면 FR64의 WHAT이 완전히 커버된다.
- **권고**: FR64를 "FR-MEM6 참조 — Sprint 3 Memory Injection으로 대체" cross-reference로 업데이트. FR64 자체는 v1 호환성 요구사항으로 유지하되, 측정 기준을 FR-MEM6에서 가져오기.

#### JC2: FR-OC7 2-tier 분리 vs WHAT 환원

**WHAT 환원 권고.**

- 2-tier 분리(FR-OC7a LISTEN/NOTIFY + FR-OC7b 폴링)는 구현 방식을 FR 수준에서 확정하는 것 — V-07 leakage 원칙에 위배.
- WHAT 환원: "상태 변화가 ≤ 2초 내 /office 화면에 반영된다" — 구현 방식(LISTEN/NOTIFY vs 폴링)은 Architecture에서 결정.
- **단**, Neon serverless LISTEN/NOTIFY 지원 검증은 Architecture 단계 진입 전 tech spike로 진행 필요. 이것은 FR이 아니라 Architecture 선행 과제.

#### JC3: FR-TOOLSANITIZE3 확장 방향

**V-05 합의 재확인: OWASP LLM Top 10 카테고리별 최소 2종.**

- "10종"은 기준선. Go/No-Go #11에서 확장 검증.
- Sprint 2 구현 시 10종 + Sprint 3 Go/No-Go에서 25종+ 확장 = 단계적 접근이 현실적.
- **권고**: FR-TOOLSANITIZE3를 "adversarial payload 기준선 10종 (Sprint 2), Go/No-Go #11에서 OWASP LLM Top 10 카테고리별 최소 2종 확장 검증"으로 수정.

---

### 이슈 목록

#### 1. **[D6 리스크] Moderate — Phase 5+ (FR69-72) R=4.5, T=4.0 이상치 미분석**

19개 카테고리 중 유일하게 R < 5.0, T < 5.0인 카테고리. 미래 Phase FR의 spec 불완전은 예상되나:
- **R=4.5**: 비즈니스 목표와의 연결이 약한 FR이 포함. 어떤 FR이 R < 5인지 식별 필요.
- **T=4.0**: Journey/scope 연결 불완전. V-06에서 Phase 5+ FR은 "Future" scope으로 분류했으나, 구체적 journey 매핑이 약할 수 있음.
- **권고**: FR69-72 개별 SMART 점수 추가. R/T < 5인 FR의 구체적 근거 명시. 미래 Phase이므로 "현 단계 블로커 아님" informational note로 충분.

#### 2. **[D2 완전성] Low — 카테고리 평균 내 최저 FR 미표기**

카테고리 평균만으로는 near-miss outlier 식별 불가. Memory avg 4.34이지만 FR-MEM3(pg_advisory+파일경로+reflected=false)는 S=2~3 수준일 수 있다.
- **권고**: 각 카테고리에 "최저 FR: FR-MEM3 (S=X)" 형태로 최저 점수 FR 1건 표기. 전체 123건 나열 불필요.

#### 3. **[D4 실행가능성] Low — 개선 우선순위 미지정**

5건 개선 제안 분류 권고:
- **Fixes 즉시 (2건)**: FR-PERS5 FR-PERS4 병합, FR64 FR-MEM6 cross-reference
- **PRD 수정 (1건)**: FR-MKT7 fallback 엔진 구체화
- **Architecture 위임 (2건)**: FR-OC7 WHAT 환원 + Neon 검증 tech spike, FR-TOOLSANITIZE3 OWASP 확장 기준

#### 4. **[D2 완전성] Informational — NFR SMART 미포함**

scope을 FR 123건으로 한정한 것은 합리적 (NFR은 형식이 다름). 단, NFR-P0 22개가 릴리스 게이트이므로 최소한 "NFR SMART는 V-05 measurability + V-09 compliance에서 검증 완료" 참조 추가 권고.

---

### Cross-talk 메모

- Winston에게: Phase 5+ FRs(FR69-72) R=4.5, T=4.0 — Architecture 관점에서 이 FRs가 현재 Architecture scope에 포함되는지? Phase 5+가 별도 Architecture 사이클이면 낮은 R/T는 expected. 동일 사이클이면 spec 보강 필요.
- Quinn에게: FR-TOOLSANITIZE3 단계적 확장(10종 → 25종+) — 보안 관점에서 Sprint 2 시점 10종 기준선이 "Go 가능"인지? Go/No-Go #11까지 10종으로 운영하는 기간의 보안 리스크 수용 가능 여부.

---

**결론:** V-10 SMART Requirements Validation은 높은 품질. 123 FR × 5 SMART 차원 전수 분석, 5건 flagged FR 정확 식별, V-05/V-06/V-07 교차 참조 일관, 개선 제안 actionable. Phase 5+ 이상치 미분석 + 카테고리 평균 outlier 마스킹 2건은 fixes로 해결 가능. **8.25/10 ✅ PASS.**

---

## [Verified] R2 Fixes — 8.25/10 ✅ PASS (유지)

**Date:** 2026-03-22
**Verification:** 3 Critic 피드백 전부 반영 확인.

| # | Fix | Source | Verified |
|---|-----|--------|----------|
| 1 | Overall avg 4.50 → 4.59/5.0 재계산 (L967) | Quinn M1 | ✅ |
| 2 | "R=5.0, T=5.0 전 FR" → Phase 5+ 제외 명시 + 개별 R/T 테이블 (L940-947, L974) | Quinn M2 + John D1 | ✅ |
| 3 | ~95/123 → 91/123 = 74.0% 정확 수치 (L966) | Quinn L1 | ✅ |
| 4 | FR-TOOLSANITIZE3 → V-05 합의안 (OWASP 카테고리 기반, "25종" 삭제) (L961) | Quinn L2 | ✅ |
| 5 | v2/v3 분류 → Phase 70건(4.78) / Sprint 53건(4.34) (L972-973) | Quinn Q1 | ✅ |
| 6 | 근사치 제거 — 117/123 (95.1%), 91/123 (74.0%) 정확 수치 (L965-966) | Winston D2 | ✅ |
| 7 | FR-N8N4 flagged 추가 (S=2) + Improvement Suggestion (L934, L955) | Winston D3/D6 | ✅ |
| 8 | FR-OC7 → WHAT 환원만 유지, 2-tier 분리 삭제 (L953) | Winston D4 | ✅ |
| 9 | Borderline Watch List 5건 추가 (L977-985) | Winston D5 | ✅ |
| 10 | Category Lowest FR 테이블 8개 카테고리 (L987-998) | John D2 | ✅ |
| 11 | FR64 "대체" → "측정 기준 = FR-MEM6 동작으로 구체화" + Phase 유지 보장 (L951) | John D3 | ✅ |
| 12 | Improvement Priority Tiers P1/P2/P3 (L1002-1008) | John D4 | ✅ |
| 13 | NFR SMART Cross-Reference note (L1000) | John D5 | ✅ |

**Updated totals verified:** 6 flagged (5→6, FR-N8N4 추가). 117/123 = 95.1% ≥ 3. 91/123 = 74.0% ≥ 4. Overall avg 4.59/5.0. Phase 70/Sprint 53 분류. ✅
**Score 유지:** 8.25/10 — fixes가 내 지적사항 4건을 정확히 반영.
