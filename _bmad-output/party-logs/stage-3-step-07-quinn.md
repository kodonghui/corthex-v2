## Critic-B (Quinn) Review — Stage 3 Step V-07: Implementation Leakage Validation

### Review Date
2026-03-22 (R1)

### Content Reviewed
`_bmad-output/planning-artifacts/prd-validation-report.md`, Step V-07 section (L595-750)

---

### R1 Independent Verification

#### 1. FR Leakage 검증 (18건 주장 → 실제 20건)

**V-07에 포함된 18 FRs — 전부 실존 확인 ✅:**
FR35, FR40, FR41, FR-OC1, FR-OC2, FR-OC7, FR-N8N1, FR-N8N4, FR-N8N6, FR-PERS2, FR-PERS3, FR-MEM2, FR-MEM3, FR-MEM4, FR-MEM5, FR-MEM6, FR-MEM8, FR-MEM13

Spot-check 5건:
- FR-N8N4 (L2440): ~15 terms 확인 ✅ — Oracle VPS, port 5678, Hono proxy(), Docker memory, AES-256-GCM 등
- FR-PERS2 (L2459): migration file + Zod schema + SQL CHECK 확인 ✅
- FR-MEM13 (L2482): `reflected=true` 컬럼 값 확인 ✅ — V-05에는 없었던 새 발견
- FR-N8N1 (L2437): "Hono reverse proxy API" 확인 ✅ — V-05에는 없었던 새 발견
- FR-OC2 (L2424): `/ws/office`, JWT, `shared/types.ts` 확인 ✅

**🔴 누락 2건 발견 — V-05에서 정확히 잡았으나 V-07에서 빠짐:**

| FR | Line | Leakage | V-05 분류 |
|----|------|---------|----------|
| **FR-MEM1** | L2470 | `observations` 테이블명, 6개 컬럼명 (company_id, agent_id, session_id, content, outcome, tool_used), `MEM-6 4-layer` architecture 참조 | V-05 Moderate #15 |
| **FR-MEM7** | L2476 | `pgvector` 라이브러리명, `{relevant_memories}` 변수명 | V-05 Moderate #17 |

**수정된 FR leakage 총 수: 20건** (V-07의 18 + 누락 2 = 20)

#### 2. V-05 Reconciliation 오류

**분석가 주장 (L736):** "17 of 18 already flagged in V-05. V-07 confirms and adds FR-OC2 (newly caught)."

**사실 확인 — 부정확:**
- FR-OC2는 V-05 Heavy #2 (L316)에 **이미 포함** — "newly caught" 아님
- V-07에서 실제로 새로 잡힌 FRs: **FR-N8N1, FR-N8N6, FR-MEM13** (3건)
- V-05에서 잡았으나 V-07에서 누락: **FR-MEM1, FR-MEM7** (2건)

**정확한 reconciliation:**
| | V-05 (17) | V-07 (18) |
|--|----------|----------|
| 공통 | 15건 | 15건 |
| V-05 only | FR-MEM1, FR-MEM7 | — |
| V-07 only | — | FR-N8N1, FR-N8N6, FR-MEM13 |
| 합산 (중복 제거) | **20건** | |

#### 3. NFR Leakage 검증 (7건)

7건 전부 실존 확인 ✅:
- NFR-S4/S5/S6: hook 이름 (`output-redactor`, `credential-scrubber`, `tool-permission-guard`) — 메커니즘 이름이면 충분, 구현 이름은 leakage ✅
- NFR-S8: 4-layer 구현 이름 (Key Boundary → API Zod → extraVars strip → Template regex) ✅
- NFR-S9: 8-layer 전체 상세 (Hono, Docker, AES-256-GCM, tags, HMAC) ✅ — **특별 언급 동의**
- NFR-SC7: pgvector HNSW 인덱스, VECTOR(1024) ✅
- NFR-D8: reflected=true, observations, agent_memories(reflection) 테이블/컬럼명 ✅

#### 4. Capability-Relevant 제외 항목 검증

7개 제외 항목 전부 정당 ✅:
- SSE, WebSocket, CLI, API, MCP: user-facing capability 또는 protocol — 구현 상세 아님
- n8n: 제품명 — 구현 상세 아님
- PixiJS in FR-OC9/10: 라이브러리가 기능 자체 (접근성 맥락에서 "PixiJS 캔버스 비활성") — FR-OC1의 "PixiJS 8 + @pixi/react + React.lazy" (버전+로딩전략)과 정확히 구분

**구분이 특히 잘 된 사례:** PixiJS가 FR-OC1에서는 leakage (버전+로딩전략)이고 FR-OC9/10에서는 capability (접근성 대상 명시) — 동일 용어의 맥락별 판단 정확.

#### 5. Root Cause 분석 검증

- 15/18 (83%) v3 FRs ✅ — 실제로는 20건 기준 17/20 (85%)
- Stage 1 confirmed decisions 직접 삽입 패턴 ✅ — V-05 root cause와 일관
- Leakage density by group ✅ — n8n High, Memory Very High, v2 Core Very Low 분류 정확
- **1건 추가:** FR-MEM1/MEM7 누락으로 Memory 그룹이 7/14 → **9/14** (64%)로 상향. "Very High" 분류는 더욱 정확해짐.

#### 6. Security-Angle 분석

**NFR-S8/S9 leakage — 보안 정보 노출 관점:**
- NFR-S8이 4-layer 이름을 명시 (Key Boundary → API Zod → extraVars strip → Template regex)
- NFR-S9가 8-layer 전체 상세를 명시
- **리스크:** 방어 아키텍처 이름이 PRD에 노출되면, 공격자가 layer 간 gap을 타겟할 수 있음
- **실질 리스크: LOW.** PRD은 내부 문서이며, layer 이름을 알아도 실제 구현을 우회하려면 코드 접근 필요. 방어 이름 은닉(security through obscurity)은 실질 보안이 아님
- **그러나:** Architecture 문서로 이동 시 "WHAT: 4-layer personality sanitization 100% pass" + "HOW(Architecture): Key Boundary→Zod→strip→regex"로 분리하면 PRD 독자에게 불필요한 구현 상세 노출 방지. 이는 보안 목적이 아니라 문서 위생.

**FR40/41 hook 이름:**
- `tool-permission-guard`, `credential-scrubber`, `output-redactor`가 PRD에 남으면 Architecture에서 반드시 이 이름으로 구현해야 함
- **Quinn 판단: 보안 컴포넌트는 예외적으로 PRD naming 허용 가능.** 보안 hook은 이름이 곧 기능 정의 — "credential-scrubber"를 "민감 정보 마스킹 모듈"로 바꾸면 오히려 모호. Architecture에서 이름 변경 시 traceability 손실.
- **권장:** v2 Core FRs (FR40/41)의 hook 이름은 **유지** (분석가 Rec #3과 반대 의견). 보안 컴포넌트 naming은 cross-cutting traceability에 가치. 단, `( )` 괄호 안에 넣어 보조 설명 처리: "비허용 도구 호출이 차단된다 (tool-permission-guard)"

#### 7. Split 권장사항 검증

FR-PERS2 split 예시 (L741-743): WHAT/HOW 분리 깔끔 ✅
- WHAT: "성격 설정이 에이전트별로 저장되고, API에서 5개 축 각각 0-100 정수로 검증된다"
- HOW: "agents.personality_traits JSONB, migration #61, Zod, DB CHECK"

NFR-S9 special mention (L749): ✅ 동의 — 8-layer 전체를 NFR 한 행에 넣은 것은 V-05에서 Winston이 제안한 Architecture §N8N-SEC 매트릭스로 분리하는 것이 정확.

---

### R1 Scores

| Dim | Wt | Score | Wtd | Evidence |
|-----|-----|-------|-----|----------|
| D1 | 10% | 9 | 0.90 | 6-category 스캐닝 체계적. FR/NFR별 라인 번호, leakage 텍스트 구체적. Split 예시 (FR-PERS2) 명확. Top 3 worst 선정 합리적. |
| D2 | 25% | 7 | 1.75 | 18 FR + 7 NFR + capability exclusions + root cause + split recommendation 포괄적. **BUT:** FR-MEM1, FR-MEM7 누락 (V-05 Moderate #15, #17). 실제 20건이어야 함. |
| D3 | 15% | 7 | 1.05 | 18건 중 18건 실존 ✅. 그러나 V-05 reconciliation 오류: FR-OC2 "newly caught" 주장은 거짓 (V-05 Heavy #2). 실제 신규: FR-N8N1, FR-N8N6, FR-MEM13. 누락 2건 + reconciliation 오류 = D3 감점. |
| D4 | 10% | 9 | 0.90 | WHAT+Architecture Constraints 분리 실행 가능. Priority Low-Medium 판단 합리적. v2 Core hook 이름 제거 권장도 구체적 (Quinn은 반대 의견이나 실행 가능성 자체는 높음). |
| D5 | 15% | 8 | 1.20 | V-01→V-07 일관. V-05 leakage 분석의 자연스러운 심화. Severity 체계 유지. V-05 reconciliation 불일치만 -1. |
| D6 | 25% | 8 | 2.00 | "Intentional design" 4-point mitigation context 우수. NFR-S9 special mention 좋음. 83% v3 집중 분석 정확. **BUT:** NFR-S8/S9 보안 정보 노출 관점 미언급. FR-MEM1/MEM7 누락이 리스크 평가에 영향 (Memory 7/14→9/14). |

**R1 Weighted Average: 7.80/10 ✅ PASS**

계산: 0.90 + 1.75 + 1.05 + 0.90 + 1.20 + 2.00 = **7.80**

### Issues (2 MEDIUM, 1 LOW)

**M1 [D2+D3]:** FR-MEM1, FR-MEM7 누락.
- FR-MEM1 (L2470): `observations` 테이블명 + 6개 컬럼명 + `MEM-6 4-layer` architecture 참조. V-05 Moderate #15.
- FR-MEM7 (L2476): `pgvector` 라이브러리명 + `{relevant_memories}` 변수명. V-05 Moderate #17.
- **Fix:** FR violations 18→20 수정. Summary 25→27. Severity는 이미 Critical이므로 등급 변동 없으나 total count 정확성 필요.

**M2 [D3]:** V-05 Reconciliation 오류.
- 주장: "17 of 18 already flagged in V-05; FR-OC2 newly caught"
- 사실: FR-OC2 = V-05 Heavy #2 (L316). 실제 신규: FR-N8N1, FR-N8N6, FR-MEM13.
- **Fix:** L736 수정 — "15 of 20 overlap with V-05 measurability step. V-07 newly catches: FR-N8N1 (Hono reverse proxy), FR-N8N6 (Hono proxy), FR-MEM13 (reflected column value). V-05 FR-MEM1/FR-MEM7 also reinstated."

**L1 [D6]:** NFR-S8/S9 leakage — 보안 정보 노출.
- 4-layer/8-layer 구현 이름이 PRD에 노출. 실질 리스크는 LOW (PRD = 내부 문서, security through obscurity ≠ 실질 보안).
- Architecture 이동 시 자연 해소. 별도 fix 불필요하나 Recommendation에 "보안 layer 이름 → Architecture 이동으로 정보 노출 최소화" 한 줄 추가 권장.

### Cross-talk 결과

- **Winston(Critic-A) 응답 완료:**
  - **Severity 모순 지적 동의:** Critical (count) + Low-Medium (priority) = 모순. V-05 "Adjusted Severity" 선례 적용 → "Warning (Adjusted) — Critical by count, Low-Medium by impact" 3단 표기 권장. Quinn 동의.
  - **FR-PERS5 누락 여부:** "코드 분기 없이 프롬프트 주입만으로" = architecture constraint (HOW 금지), implementation leakage (HOW 지정) 아님. Quinn 판정: 정당한 제외. 보안 검증은 PER-1 + NFR-S8이 담당.
  - **NFR-S9 개별 테스트 분리:** 8-layer → 8개 독립 테스트가 QA에 확실히 유리. V-05 합의 §N8N-SEC 매트릭스 (Layer×ID×요구사항×검증방법) 구조 = NFR-S9 split의 자연스러운 수용처. NFR-S9 → "Architecture §N8N-SEC 8-layer 전부 통과" (1행) + 매트릭스 (8행 상세). V-07 Rec에서 V-05 합의 명시 참조 필요.
- **John(Critic-C) 응답 완료:**
  - Count 수정 동의 (25→27, Memory 9/14 = 64%)
  - **Memory P2 유지 (P1 아님):** Sprint 순서 우선 (n8n Sprint 2 = P1, Memory Sprint 3 = P2). Memory 9건은 패턴 반복적 (테이블/컬럼명 5건 → §Database Schema 일괄, Voyage AI 2건 → 단일 ADR, 실질 3-4 섹션). n8n P1은 밀도보다 복잡도 문제 (FR-N8N4 ~15 용어의 WHAT 추상화가 더 어려움).
  - Architecture §Memory에 "Stage 1 Decision #9(advisory lock) + #1(Voyage AI) + schema → Architecture Constraints 이동" 체크포인트 명시 권장.

### 3-Critic 합의 사항 (V-07)

1. **Severity**: "Warning (Adjusted)" 3단 표기 — Count: Critical (27) / Impact: Low-Medium / V-05 선례 참조 (Winston + Quinn)
2. **FR-MEM1/MEM7 복원**: Total 25→27, Memory 7/14→9/14 (M1 fix) (Quinn 발견, John 동의)
3. **V-05 Reconciliation 수정**: FR-OC2 "newly caught" 삭제, 실제 신규 FR-N8N1/N8N6/MEM13 명시 (M2 fix) (Quinn 발견)
4. **FR-PERS5**: leakage 아님 — architecture constraint (금지) ≠ implementation leakage (지정). Capability-Relevant 제외 목록에 추가 (Winston 발견, Quinn 판정)
5. **NFR-S9 split**: "§N8N-SEC 8-layer 통과" (1행 NFR) + Architecture 매트릭스 (8행). V-05 §N8N-SEC 합의 연장 (Winston + Quinn)
6. **FR40/41 hook 이름**: PRD 유지 (보안 traceability). 괄호 보조 표기 (Quinn 반대 의견)
7. **Architecture 정리 우선순위**: P1 n8n (복잡도) → P2 Memory (밀도 반복) → Sprint 순서 유지 (John)

### R1 Verdict

**7.80/10 PASS.** 스캐닝 방법론 체계적, capability-relevant 제외 정확, root cause 분석 V-05와 일관, split 권장 실용적. **BUT:** FR-MEM1/MEM7 누락 (V-05에서 정확히 잡았던 항목) + V-05 reconciliation 오류 (FR-OC2 "newly caught" 허위) → 정확성 감점. 수정 후 8.5+ 기대.

---

## R2 Fix Verification (Analyst V-07 Fixes)

### 수정 검증 (10건: 10 PASS)

| # | 수정 내용 (출처) | 검증 | 상태 |
|---|----------------|------|------|
| 1 | Quinn M1: FR-MEM1 추가 | L635: `observations` 테이블명 + 6 컬럼명 + MEM-6 참조 — Database/SQL 카테고리에 정확 배치 ✅ | PASS |
| 2 | Quinn M1: FR-MEM7 추가 | L654: `pgvector` + `{relevant_memories}` — Framework/Library 카테고리에 정확 배치 ✅ | PASS |
| 3 | Quinn M2: V-05 reconciliation 수정 | L746: "18 of 21 overlap with V-05. Newly caught: FR-N8N1, FR-N8N6, FR-MEM13. Reinstated: FR-MEM1, FR-MEM7. FR-PERS5 added per critic review." 정확 ✅ | PASS |
| 4 | Winston W3: FR-PERS5 추가 (Implementation Approach Constraints) | L670-674: 새 카테고리 "Implementation Approach Constraints" 신설. HOW 제약 분류 정확. WHAT 환원 + FR-PERS4 병합 가능성 명시. Personality 2/9→3/9 ✅ | PASS |
| 5 | Winston W1: Severity Warning (Adjusted) | L739-746: "Mechanical threshold (>5) = Critical, but adjusted to Warning following V-05 precedent" — 4-point mitigation + V-05 선례 명시. 3단 표기 구현 ✅ | PASS |
| 6 | Winston W2 + John J1: Confirmed Decision Impact Matrix | L770-782: 7건 cross-reference 테이블. #1 Voyage→MEM2/5, #2/#3 Docker/8-layer→N8N4, #5 TTL→MEM13, #8 poisoning→MEM1/12, #9 lock→MEM3, #10 WS→OC2. 정확 ✅ | PASS |
| 7 | Winston W4 + John J2: Split Priority Tiers P1-P5 | L757-766: P1 n8n→P2 Memory→P3 Personality→P4 OpenClaw→P5 v2 Core. Sprint 순서 + 복잡도 기반 합리적. Memory 9건/64% P2 = John 근거 반영 ✅ | PASS |
| 8 | Quinn: FR40/41 hook name 괄호 보조 표기 유지 | L667-668: "보안 traceability 가치 있으므로 괄호 보조 표기 유지 권장" + L768 Rec #3 수정 ✅ | PASS |
| 9 | John J4: NFR "acceptable" boundary criterion | L705 + L748: "removing tech name would make NFR unmeasurable = acceptable; generic term preserves testability = leakage" — 명확한 판정 기준 ✅ | PASS |
| 10 | Quinn L1: NFR-S8/S9 보안 layer Architecture 이동 | L784: Rec #5 "Security layer 구현 상세 → Architecture §Security-Layers 이동. NFR은 'N-layer 100% pass' 형식으로 요약" ✅ | PASS |

### Count 검증

- Unique FRs: 21 (L676-678) ✅ — 18 original + FR-MEM1 + FR-MEM7 + FR-PERS5
- Database/SQL: 9→10 (FR-MEM1 추가) ✅
- Framework/Library: 7→8 (FR-MEM7 추가) ✅
- New category: Implementation Approach Constraints 1건 (FR-PERS5) ✅
- Total: 21 FR + 7 NFR = 28 ✅
- Distribution: 86% v3 (L680) ✅ — 18/21
- Memory group: 9/14 = 64% (L729) ✅

**⚠️ Count 불일치 1건 (non-blocking):** Analyst 커버 메시지에서 "Unique FRs: 18→21, Total: 25→28"이라 했으나, 보고서 본문 L737에서 "Total: 28 violations"으로 정확. 실제로 FR 21 + NFR 7 = 28. (V-05에서 total "25"는 18 FR + 7 NFR이었음. 현재 21+7=28 정확.)

### R2 Scores

| Dim | R1 | R2 | Wt | Wtd | Evidence |
|-----|-----|-----|-----|-----|----------|
| D1 | 9 | 9 | 10% | 0.90 | FR-MEM1/MEM7 추가 시 카테고리 배치 정확. FR-PERS5 새 카테고리 신설 합리적. Priority tiers 테이블 구체적. |
| D2 | 7 | 9 | 25% | 2.25 | M1 해소 (FR-MEM1/MEM7 복원, 21건 완전). FR-PERS5 추가. Confirmed Decision Impact Matrix (7건). NFR boundary criterion. 포괄적. |
| D3 | 7 | 9 | 15% | 1.35 | M2 해소 (reconciliation 수정 정확). 21 FR + 7 NFR = 28 count 정확. V-05 cross-reference 정정. |
| D4 | 9 | 10 | 10% | 1.00 | P1-P5 priority tiers = 즉시 실행 가능. Confirmed Decision Matrix = Architecture 이전 체크리스트. FR40/41 괄호 표기 = 실용적. |
| D5 | 8 | 9 | 15% | 1.35 | V-05 Adjusted Severity 선례 일관 적용. V-05 reconciliation 수정으로 cross-step 정합성 확보. P1-P5 Sprint 순서 일관. |
| D6 | 8 | 9 | 25% | 2.25 | NFR-S8/S9 Architecture §Security-Layers 이동 추가 (Quinn L1). Confirmed Decision Matrix로 이전 누락 방지. Boundary criterion으로 판정 투명성 확보. |

**R2 Weighted Average: 9.10/10 ✅ PASS**

계산: 0.90 + 2.25 + 1.35 + 1.00 + 1.35 + 2.25 = **9.10**

### R2 Verdict (FINAL)

**9.10/10 PASS.** R1 7.80 → R2 9.10 (+1.30). 10건 수정 전부 PASS. FR-MEM1/MEM7 복원 + V-05 reconciliation 수정으로 cross-step 정확성 확보. FR-PERS5 "Implementation Approach Constraints" 카테고리 신설로 architecture constraint vs implementation leakage 구분 명확화. Severity "Warning (Adjusted)" V-05 선례 일관 적용. P1-P5 priority tiers + Confirmed Decision Impact Matrix = Architecture 진입 준비 완료. 0건 이슈.
