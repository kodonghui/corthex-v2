# Stage 3 Step V-05 — Winston (Critic-A) Review

**Reviewer:** Winston (Critic-A, Architecture + API)
**Date:** 2026-03-22
**Target:** `_bmad-output/planning-artifacts/prd-validation-report.md` (Step V-05 section, post-fix version)

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | 123 FRs + 76 NFRs 개별 참조, 라인번호 전부 명시. Heavy/Moderate 분류 기준 명확 (file path+SQL=Heavy, table/component name=Moderate). FR-N8N4 ~250 word count까지. |
| D2 완전성 | 15% | 8/10 | Format, subjective, vague quantifiers, leakage, NFR metrics/template/context — 6개 축 체계적 검사. "직관적"/"쉽게" 올바르게 FR 밖 제외. 사소: NFR-SC5 "SDK 호환 자동 호환" 측정 방법 불분명 — flagged NFR 4건에 추가 가능. |
| D3 정확성 | 25% | 9/10 | FR count 123 산술 검증 ✅, NFR count 76 ✅, FR17 "적절한" L2314 확인 ✅, Heavy/Moderate 분류 spot-check 3건 전부 일치 ✅. Root cause (Stage 1 decisions embedded) 정확. Adjusted severity (8 genuine + 17 structural) 논리적. 이전 버전 문제(카운트 불일치, 카테고리 누락) 전부 해소. |
| D4 실행가능성 | 20% | 8/10 | 5개 구체적 권고: FR17 inline def, ADR 추출, 측정 컬럼 통일, NFR-A1/A2 도구, NFR-O4 inter-rater, NFR-CQ1 CI. 모두 실행 가능. FR-N8N4 리팩토링 예시가 있으면 더 좋았음 — 아래 제공. |
| D5 일관성 | 15% | 9/10 | V-04 수정사항(FR-PERS=9, FR-MEM=14, FR-TOOLSANITIZE=3) 완전 반영. confirmed decisions 정확 참조. 용어 통일. |
| D6 리스크 | 10% | 7/10 | Adjusted severity 잘 구분. 그러나 leakage가 만드는 간접 리스크 미언급: FR에 embedded된 confirmed decisions을 validation 수정 시 실수로 변경할 위험. |

## 가중 평균: 8.45/10 ✅ PASS

계산: (9×0.15)+(8×0.15)+(9×0.25)+(8×0.20)+(9×0.15)+(7×0.10) = 1.35+1.20+2.25+1.60+1.35+0.70 = **8.45**

---

## Analyst 질문에 대한 답변

### Q1: Implementation leakage 17건 — 누락 또는 과다 카운트?

**카운트 적절. 과다 아님.**

FR-MEM12 (4-layer 방어 상세)와 FR-MEM13 (`reflected=true` 컬럼 값)도 leakage 후보이나, 이미 flagged된 패턴과 동일한 root cause (confirmed decisions embedded). 추가해도 권고사항 변경 없음. 17건 유지.

**FR-OC2 connection limits (50/500) — 분리 판단:**

| 요소 | FR-적절 | Architecture-이월 |
|------|---------|------------------|
| 50/500 동시 연결 제한 수치 | ✅ 제품 결정 (confirmed #10) | |
| JWT 인증 방식 | | ✅ 인프라 상세 |
| oldest 연결 해제 정책 | | ✅ 구현 전략 |
| "클라이언트 재연결 안내" | ✅ UX 요구사항 | |

**결론**: FR-OC2는 Heavy 분류 유지. 50/500 수치와 재연결 안내 = FR-적절 (confirmed decision #10 반영). JWT/oldest-release = Architecture Note로 분리 권고.

### Q2: NFR template 4/5-column 불일치 — 더 강한 finding으로?

**현재 수준 유지. 강화 불필요.**

- Performance NFRs (17개)가 "측정" 컬럼 포함 = 모범 관행
- 나머지 59개 NFRs 중 실제로 측정 방법 불분명 = 4건만 (NFR-A1, A2, O4, CQ1)
- 나머지 55개는 self-evident: "AES-256" → 알고리즘 검증, "100% 마스킹" → adversarial test
- 컬럼 추가를 Structural 권고로 유지. Missing Metrics 위반으로 카운트하면 false positive 급증.

### Q3: "Self-evident measurement" NFRs 중 명시 필요한 것?

**1건 추가 고려: NFR-SC5 (L2548)**

> "SDK 호환 | 0.2.72 ~ 0.2.x 패치 자동 호환"

"자동 호환" 측정 방법 불분명:
- `package.json`에 `"@anthropic-ai/sdk": "0.2.72"` 핀(CLAUDE.md "SDK pin version (no ^)")이면 자동 호환 개념이 모순 — 핀 = 수동 업그레이드
- 실제 의미: "0.2.72에서 동작하고, 0.2.x 패치 업그레이드 시 깨지지 않음"
- 측정 방법: CI에서 `0.2.72` + `0.2.latest` 두 버전 테스트? 명시 필요.

**Severity**: Low. "Incomplete Template" 4→5건으로 할 수 있으나, 기존 4건과 비교 시 사소.

---

## 이슈 목록

### 1. [D6 리스크] Implementation leakage → confirmed decision 변경 리스크

FR에 embedded된 confirmed decisions (pg_advisory_xact_lock, N8N-SEC 8-layer, 4-layer sanitization 등)을 validation 과정에서 수정 시, confirmed decisions 자체를 실수로 변경할 위험.

**권고**: Recommendation에 추가 — "leakage 리팩토링 시 confirmed decisions은 먼저 추출 후 cross-reference 형태 (`확정 결정 #9 참조`)로 유지. 삭제 금지."

### 2. [D4 실행가능성] FR-N8N4 리팩토링 예시 — 가장 과부하된 FR

**Before** (현재 ~250 words): 8-layer 전체 상세를 FR 안에 인라인 기술

**After** (제안 ~40 words):
```
FR-N8N4: [Sprint 2] n8n Docker 컨테이너가 Oracle VPS 내부에서
N8N-SEC 8-layer 보안 계층을 준수하며 독립 실행된다.
> Architecture: §N8N-SEC (SEC-1~8 상세). 확정 결정: #2, #3.
```

8-layer 상세 (SEC-1~8) → Architecture 문서 §N8N-SEC 섹션으로 이동. FR은 WHAT + cross-reference만 유지.

### 3. [D2 완전성] NFR-SC5 측정 방법 — 사소한 추가

위 Q3 답변 참조. Low severity. 추가 여부는 analyst 판단에 일임.

---

## 검증 결과 요약

| 검증 항목 | 결과 |
|----------|------|
| FR count 123 산술 | ✅ (70+11+6+7+9+14+3+3) |
| NFR count 76 | ✅ (PRD L2648 자체 집계 일치) |
| FR17 "적절한" L2314 | ✅ (grep 대조 확인) |
| Heavy/Moderate 분류 일관성 | ✅ (FR-MEM3=Heavy 파일+SQL, FR35=Moderate 테이블명, FR-MEM1=Moderate 테이블+컬럼) |
| "직관적"/"쉽게" FR 밖 제외 | ✅ (L495, L496, L742 = Success Criteria/Feature 설명, FR 아님) |
| Adjusted severity 논리 | ✅ (8 genuine + 17 structural = Warning) |
| Root cause 분석 | ✅ (Stage 1 confirmed decisions embedded — V-04 cross-ref 정합) |
| 이전 버전 이슈 해소 | ✅ (카운트 123/76/199, 카테고리 전부 포함, V-04 정합) |

## Cross-talk 결과

### Quinn Cross-talk (V-05)

**Q1: FR-N8N4 분리 전략** → **옵션 B 합의** (Architecture inline §N8N-SEC)
- ADR(옵션 A)은 "설계"를 "결정"으로 과분류. Solo dev 파일 분산 비효율.
- 별도 spec(옵션 C)은 Sprint 2 하위 컴포넌트에 과도.
- Architecture §N8N-SEC 테이블 형태 (Layer|ID|요구사항|검증방법) → NFR-S9 검증 매트릭스로 재활용 가능.

**Q2: Adversarial 10→25종** → **합의**
- 3개 공격 표면 (PER-1 trusted, MEM-6 semi-trusted, TOOLSANITIZE untrusted) × OWASP LLM Top 10 = 최소 20-25종.
- NFR은 "최소 25종" WHAT만 명시, payload 목록은 QA Test Plan으로 이월 (leakage 방지).

---

## [Verified] R2 Score — 8.90/10 ✅ PASS

| 차원 | R1 | R2 | 변동 근거 |
|------|-----|-----|---------|
| D1 구체성 | 9 | 9 | 변동 없음 |
| D2 완전성 | 8 | 9 | +1: Adversarial Test Sufficiency, Security 100% 분석, FR-MEM2/5 중복 |
| D3 정확성 | 9 | 9 | 변동 없음 |
| D4 실행가능성 | 8 | 9 | +1: Immediate/Deferred 분리, FR-N8N4 리팩토링, traceability 경고 |
| D5 일관성 | 9 | 9 | 변동 없음 |
| D6 리스크 | 7 | 8 | +1: confirmed decision 변경 위험, Architecture checkpoint |

**Verified weighted avg:** 8.90/10 ✅ PASS

전수 검증: 10건 fix 전부 확인 (Winston 3, John 5, Quinn 2). Violation totals 27(18+9), genuine 10 산술 ✅.
