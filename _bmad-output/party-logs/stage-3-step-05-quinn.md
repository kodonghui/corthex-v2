## Critic-B (Quinn) Review — Stage 3 Step V-05: Measurability Validation

### Review Date
2026-03-22 (R2 — rewritten V-05 after analyst fixes from R1 6.45 FAIL)

### Content Reviewed
`_bmad-output/planning-artifacts/prd-validation-report.md`, Step V-05 section (L279-395)

---

### R1 Summary (6.45/10 FAIL)
Previous R1 found: FR count 116≠123, NFR count 74≠76, FR-TOOLSANITIZE1-3 entirely absent, FR-MEM12-14 uncounted, all line numbers stale. **Analyst has now rewritten V-05 with corrected counts and full analysis.**

---

### R2 Independent Verification

#### 1. FR 분석 검증

- **FR 카운트 123건**: `^- FR[0-9]|^- FR-` grep 결과 123건 매칭 (~~FR37~~, ~~FR39~~ 제외 — strikethrough prefix가 패턴 불일치). ✅ R1 H1/H2/M1 수정됨
- **FR17 "적절한"**: L2314 확인. "에이전트가 범위 밖 요청을 거절하되 적절한 에이전트를 안내한다" — 실제 주관적. NFR-O5 (10 scenarios, 80%+ accuracy)가 간접 정량화하나 FR 자체에 인라인 정의 없음. ✅ 정확한 탐지
- **Implementation Leakage 17건**: Heavy 11건 + Moderate 6건 spot-check:
  - FR-N8N4 (L2440): 확인 — ~250 words, Docker port/memory/JWT/tag/HMAC/encryption/rate-limit 전부 포함. **가장 과부하된 FR** 맞음 ✅
  - FR-PERS2 (L2459): 확인 — migration filename, Zod schema, CHECK constraint SQL 포함 ✅
  - FR-MEM3 (L2472): 확인 — `memory-reflection.ts`, `pg_advisory_xact_lock`, cron frequency, threshold 포함 ✅
- **Root cause 분석**: Stage 1 확정 결정이 FR에 직접 삽입됨 — 동의. Architecture 단계에서 분리 적절.

#### 2. NFR 분석 검증

- **NFR 카운트 76건**: 12 categories 확인. ✅ R1 M1 수정됨
- **NFR-A1/A2**: 확인 — 측정 도구 미명시. Lighthouse + axe-core 권장 동의. ✅
- **NFR-O4**: 확인 — 평가자 간 신뢰도(inter-rater reliability) 미정의. Cohen's kappa ≥ 0.6 추가 권장. ✅
- **NFR-CQ1**: 확인 — 검증 방법 없음. tsc CI gate + ESLint config 권장 동의. ✅

#### 3. 보안 "100%" 질문 응답 (Analyst 요청)

**핵심 판단: "100%"는 측정 가능하나, 테스트 세트 적정성은 별개 문제.**

| NFR/FR | "100%" 대상 | 측정 가능? | 테스트 세트 적정? | Quinn 판정 |
|--------|-----------|----------|----------------|-----------|
| NFR-S4 (output-redactor) | `sk-ant-cli-*`, `sk-ant-api-*`, OAuth Bearer — 3개 패턴 | ✅ regex = 증명 가능 | ✅ CORTHEX 토큰 패턴이 이 3종 한정 | **No flag.** bounded |
| NFR-S5 (credential-scrubber) | 10개 API 키 패턴 | ✅ 10/10 테스트 | ✅ API 키 형식은 유한 | **No flag.** |
| NFR-S6 (tool-permission-guard) | 10건 테스트 | ✅ 10/10 테스트 | ✅ 도구 목록 유한 (68개) | **No flag.** |
| NFR-S8 (personality) | 4-layer 전체 통과 | ✅ 4/4 binary | ✅ 각 레이어 단위 테스트 | **No flag.** "100%"="4/4" |
| NFR-S9 (n8n) | N8N-SEC-1~8 전체 | ✅ 8/8 binary | ✅ 독립 검증 가능 | **No flag.** "100%"="8/8" |
| **NFR-S10** (observation) | 4-layer + **10종 adversarial** | ✅ bounded | ⚠️ **INSUFFICIENT** | **Flag — see below** |
| **FR-TOOLSANITIZE3** | **10종 adversarial** 100% | ✅ bounded | ⚠️ **INSUFFICIENT** | **Flag — see below** |

**🔴 보안 테스트 세트 적정성 이슈 (NFR-S10 + FR-TOOLSANITIZE3):**

**"10종 adversarial payload"는 측정 가능하지만 production security에 부적절.**

근거:
- **공격 표면**: Observation = 에이전트 실행 raw 로그 (사용자 입력 영향). Tool response = 외부 시스템 응답 (n8n webhook, API, 웹 스크래핑). 둘 다 **untrusted input**.
- **OWASP LLM01 (Prompt Injection)** 만으로 10+ 하위 카테고리: direct/indirect injection, role override, system prompt extraction, base64/Unicode bypass, markdown/JSON injection, tool result injection, chained injection.
- **ECC 2.1**: "에이전트 84% 취약" — CORTHEX = CLI 토큰 기반 root access agent. 10종으로는 84% 공격 벡터 커버 불가.
- **비교**: NFR-S5의 10패턴은 API 키 형식(유한)이므로 적정. adversarial payload는 본질적으로 무한(attacker-generated) → 10은 baseline, not target.

**권장:**
- NFR-S10 + FR-TOOLSANITIZE3: "10종" → **"최소 25종 (OWASP LLM Top 10 카테고리별 2-3종)"** 상향
- Architecture 단계에서 adversarial payload 카탈로그 정의 (OWASP LLM01 기반)
- 운영 단계에서 payload 지속 추가

#### 4. 분석가 평가 검증

- **"Adjusted Severity: Warning (8 genuine measurability) + Structural Note (17 leakage)"**: ✅ 합리적 분리
- **권장사항 5개**: 전부 구체적이고 실행 가능. "FR-N8N4 분리" 우선순위 동의.
- **Implementation leakage root cause**: Stage 1 확정 결정의 FR 직접 삽입 — 정확한 진단.

---

### R2 Scores

| Dim | R1 | R2 | Wt | Wtd | Evidence |
|-----|-----|-----|-----|-----|----------|
| D1 | 7 | 8 | 10% | 0.80 | FR/NFR별 라인 번호, 위반 텍스트, Heavy/Moderate 분류 구체적. 권장사항 구체적. |
| D2 | 6 | 8 | 25% | 2.00 | 199 requirements 전수 분석 (R1 190→199 수정됨). 6가지 축 검증. 보안 "100%" critic 위임 적절. |
| D3 | 6 | 9 | 15% | 1.35 | FR 123, NFR 76 카운트 정확 (R1 undercounting 해소). FR17 실존. NFR 이슈 전부 실존. |
| D4 | 8 | 8 | 10% | 0.80 | 5개 권장사항 즉시 조치 가능. ADR 분리 제안 실용적. |
| D5 | 7 | 9 | 15% | 1.35 | V-01→V-05 일관. FR/NFR 카테고리 구분 명확. Severity 체계 통일. |
| D6 | 6 | 8 | 25% | 2.00 | Implementation leakage "structural" vs "measurability" 분리 우수. 보안 에스컬레이션 적절. 10종 payload 자체 예비 판단 부재만 -1. |

**R2 Weighted Average: 8.30/10 ✅ PASS**

계산: 0.80 + 2.00 + 1.35 + 0.80 + 1.35 + 2.00 = **8.30**

### Issues (1 MEDIUM, 1 LOW)

**M1 [D6 리스크]:** NFR-S10 + FR-TOOLSANITIZE3 "10종 adversarial payload" — 측정 가능하나 production security에 **부적절**. Untrusted input 대상 test set은 최소 25종 필요 (OWASP LLM01 기반). **Fix**: V-05 Recommendation에 "10종→최소 25종" 상향 권장 추가.

**L1 [D2 완전성]:** NFR-S4/S5/S6 "100%" 판정 근거가 보고서에 미기록 ("self-evident" 처리). Critic 위임은 적절하나 최종 보고서에 인라인 근거 필요. **Fix**: "100% measurable because: bounded pattern set (S4: 3 patterns, S5: 10 patterns, S6: 10 tests)" 추가.

### Cross-talk 결과

- **Winston(Critic-A) 응답 완료:**
  - **Q1 FR-N8N4 분리 전략: 옵션 B 추천** (Architecture 문서 inline §N8N-SEC 섹션). ADR(A)은 "결정"이 아닌 "설계"이므로 부적합, 별도 Infra Spec(C)은 Solo dev에서 과도. FR-N8N4는 `"N8N-SEC 8-layer 보안 계층 준수 (Architecture §N8N-SEC, 확정 결정 #2/#3)"` WHAT+cross-ref 패턴으로 축소. §N8N-SEC 섹션에 Layer×ID×요구사항×검증방법 매트릭스 제안 → NFR-S9 QA 검증에도 직접 활용 가능.
  - **Q2 Adversarial 25종: 동의.** 3개 공격 표면 분석 추가 (PER-1=trusted, MEM-6=semi-trusted, TOOLSANITIZE=untrusted). OWASP LLM01/02/06/07/09 + encoding bypass = 20-25종 합리적. **핵심 제안:** NFR에는 "최소 25종 (OWASP LLM Top 10 기반)" WHAT만 명시, 구체적 payload 목록은 QA Test Plan으로 이월 → leakage 방지 원칙 일관.
  - **NFR 수정문 합의:** `"OWASP LLM Top 10 기반 최소 25종 adversarial payload에 대해 100% 차단율 (payload 목록: QA Test Plan 참조)"`
- **John(Critic-C) 응답 완료:**
  - **Q1 8/17 severity split: Sprint-safe.** 17 leakage FRs는 Sprint 진입 전 PRD 수정 불필요 — developer가 LESS가 아닌 MORE 정보를 가짐. Architecture가 Sprint 전이므로 변경 시 FR 업데이트 가능. 유일한 리스크: FR-as-contract 경직성 (QA가 Architecture 간소화 거부). FR-MEM6 cosine ≥0.75/top-3 = Architecture 벤치마크 변경 가능성 주시.
  - **Q2 Adversarial: count-based → category-based 전환 제안.** 10→25는 수용 가능(1-2시간)하나 숫자가 자의적. 대안: 공격 카테고리 정의 (role override, system prompt leak, base64 encoding, unicode bypass, nested injection, multi-turn manipulation, tool response injection, memory poisoning, personality injection, token exfiltration) → "각 카테고리에서 최소 2종" → 자연스럽게 ~20-30종. **PRD 수준 메트릭 변경** (how we measure).
  - **Quinn 판단:** John의 category-based 제안이 더 우수. "25종"은 arbitrary number이나, "10 카테고리 × 최소 2종"은 coverage-complete. Winston의 "WHAT만 NFR에" 원칙과도 합치. **최종 권장:** NFR-S10/FR-TOOLSANITIZE3 = "OWASP LLM Top 10 기반 공격 카테고리별 최소 2종 adversarial payload에 대해 100% 차단율 (카테고리 목록 및 payload: QA Test Plan 참조)"

---

## R2 Fix Verification (Analyst V-05 Fixes)

### 수정 검증 (8건: 7 PASS, 1 PASS with enhancement)

| # | 수정 내용 (출처) | 검증 | 상태 |
|---|----------------|------|------|
| 1 | Winston D6: Rec #5 traceability caveat — "cross-reference format must maintain traceability to Stage 1 decisions" | L409: 확인. confirmed-decisions-stage1.md 링크 유실 경고 명시. ✅ | PASS |
| 2 | Winston D4: FR-N8N4 refactoring example (~250→~40 words) | L409: 확인. "n8n Docker 컨테이너가 Oracle VPS 내부 포트에서 독립 실행된다. 보안: Architecture §N8N-SEC 8-layer 참조" 패턴 제시. ✅ | PASS |
| 3 | Winston D2: NFR-SC5 borderline noted, not added to count | NFR violations = 9 (4+3+2). SC5 미포함 확인. Convention conflict vs measurability 구분 적절. ✅ | PASS |
| 4 | John D6: Architecture checkpoint for 17 FR leakage dual-management risk | L409: "Architecture checkpoint: Verify all 17 FR implementation details match Architecture decisions — dual-management risk" 확인. ✅ | PASS |
| 5 | John D2: FR-MEM2/MEM5 duplicate observation note | L340: "near-identical leakage... single embedding strategy ADR would cover both" 확인. ✅ | PASS |
| 6 | John D4: Recommendations split — Immediate Fixes (4) vs Architecture-Deferred (3) | L402-411: 명확한 2단 분리 확인. 우선순위 체계 적절. ✅ | PASS |
| 7 | John D1: "12 of 17 leakage in v3 FRs" root cause note | L338: "12 of 17 leakage instances concentrated in v3 FRs" 확인. Stage 1 insertion pattern 증거 보강. ✅ | PASS |
| 8 | Quinn M1: NFR-S10 + FR-TOOLSANITIZE3 "10→25종" | L354, L377-382, L406: "Adversarial Test Sufficiency" 서브섹션 신설 + Immediate Fix #4 추가. "최소 25종 (OWASP LLM Top 10 카테고리별 2-3종)" 명시. ✅ **Enhancement:** John의 cross-talk에서 "count-based → category-based" 전환 제안이 더 우수 — "25종" 대신 "공격 카테고리별 최소 2종" 메트릭이 coverage-complete. | PASS (enhancement available) |
| 9 | Quinn L1: "100%" bounded pattern set justification inline | L352: "Security 100% Measurability Note" — S4: 3 patterns, S5: 10 patterns, S6: finite tool allowlist 명시. ✅ | PASS |

### R2 Enhancement 권장 (1건, non-blocking)

**E1 [D6 리스크]:** Immediate Fix #4 (L406)에서 "최소 25종"은 arbitrary count. John(Critic-C)의 category-based 메트릭이 더 robust:
- 현재: "최소 25종 (OWASP LLM Top 10 카테고리별 2-3종)"
- 권장: "OWASP LLM Top 10 기반 공격 카테고리별 최소 2종 adversarial payload (자연스럽게 ~20-30종)"
- 이유: count threshold는 "왜 25이고 24가 아닌가" 질문에 답 못함. Category coverage는 completeness 보장.
- **Non-blocking**: 현재 "25종 (카테고리별 2-3종)" 표현도 실질적으로 category-based를 암시하므로, 수정 시 8.8+, 미수정도 8.5+ 유지.

### R2 Scores

| Dim | R1 | R2 | Wt | Wtd | Evidence |
|-----|-----|-----|-----|-----|----------|
| D1 | 8 | 9 | 10% | 0.90 | John D1 "12/17 v3 FRs" root cause 보강. FR/NFR 라인 번호 전부 정확. Critic attribution 명시 (Quinn M1, Winston D6, John D6 등). |
| D2 | 8 | 9 | 25% | 2.25 | 3-critic 피드백 9건 전부 수용. Adversarial Test Sufficiency 서브섹션 신설. MEM2/MEM5 중복 관찰 추가. 199 requirements + 27 violations 전수 분석. |
| D3 | 9 | 9 | 15% | 1.35 | FR 123, NFR 76 카운트 유지. 신규 Adversarial 2건 (NFR-S10, FR-TOOLSANITIZE3) 실존 확인. 100% bounded set 근거 정확. |
| D4 | 8 | 9 | 10% | 0.90 | Immediate Fixes (4) vs Architecture-Deferred (3) 분리 우수. 각 항목 즉시 실행 가능. FR-N8N4 refactoring 예시 구체적 (~250→~40 words). |
| D5 | 9 | 9 | 15% | 1.35 | V-01→V-05 일관. Critic attribution 통일. Severity 체계 유지. Immediate/Deferred 분류 일관. |
| D6 | 8 | 9 | 25% | 2.25 | Adversarial test sufficiency 리스크 포착. Stage 1 traceability 유실 경고 추가. Dual-management risk 명시. "100%" bounded vs unbounded 구분 우수. Category-based enhancement가 있으면 완벽. |

**R2 Weighted Average: 9.00/10 ✅ PASS**

계산: 0.90 + 2.25 + 1.35 + 0.90 + 1.35 + 2.25 = **9.00**

### R2 Verdict (FINAL)

**9.00/10 PASS.** R1 8.30 → R2 9.00 (+0.70). 3-critic 피드백 9건 전부 정확히 반영. Adversarial Test Sufficiency 서브섹션 신설, 100% bounded-set 근거 인라인, Immediate/Architecture-Deferred 분리, Stage 1 traceability 경고 — 모두 우수. 1건 non-blocking enhancement: "25종" count → category-based 메트릭 전환 시 더 robust (John 제안). 현재 표현도 실질적으로 카테고리 기반이므로 non-blocking.
