# Stage 3 Step V-04 — Quinn (Critic-B: QA + Security) Review

**Target:** `_bmad-output/planning-artifacts/prd-validation-report.md` (Step V-04: Product Brief Coverage Validation)
**Date:** 2026-03-22 (Fresh validation — new V-04 content)

---

## Critic-B Review — Step V-04: Product Brief Coverage Validation

### 독립 검증 수행

**Brief 원본 참조:** `product-brief-corthex-v3-2026-03-20.md`
**PRD 원본 참조:** `prd.md` (2648 lines, v3 OpenClaw)

#### 1. 분석가 갭 검증 (5/5 실존 확인)

| 갭 | 분석가 Severity | Brief 위치 | PRD 검색 결과 | Quinn 검증 |
|----|----------------|-----------|-------------|-----------|
| Gap 1: ECC 2.7 handoff response | Moderate | L425 In Scope (Layer 4) | `call_agent` FR 다수 (FR3/FR8/ORC-7 등) but `{ status, summary, next_actions, artifacts }` 포맷 FR 없음 | ✅ 실존 |
| Gap 2: ECC 2.2 model routing | Moderate | L427 In Scope (Layer 4) | PRD ECC 2.2 = Reflection 크론 비용 자동 차단만 (FR-MEM14). 태스크 복잡도 기반 동적 Haiku/Sonnet 선택 FR 없음 | ✅ 실존 |
| Gap 3: MCP health check | Informational | L497 Technical Constraints | PRD: n8n Docker healthcheck만 (L1688). MCP 서버 전용 health check NFR 없음. Brief가 "Architecture NFR 상세 설계" 명시 | ✅ 실존, 분류 정확 |
| Gap 4: Brief CEO Costs | Informational | L279 CEO 기능 | PRD L259-263 GATE 결정으로 제거 + "Brief §2 수정 필요" 명시. Brief 미업데이트 | ✅ 실존, Brief-side |
| Gap 5: Big Five 0.0~1.0 vs 0-100 | Informational | L136, L404 | PRD L146, L206: "0-100 정수 스케일 (Stage 1 Decision 4.3.1)". 의도적 정제 | ✅ 실존, 정당한 변경 |

**False Positive: 0건** — 5개 갭 전부 실존.

#### 2. 누락 갭 발견 (Quinn 독립 탐지)

**🔴 미탐지 갭 A: CLI 토큰 유출 감지 자동 비활성화 메커니즘**
- **Brief R5 (L510):** "CLI 토큰 유출 감지 시 자동 비활성화 메커니즘 (ECC 2.1 secret rotation)"
- **PRD Go/No-Go #11 (L466):** "CLI 토큰 유출 감지 시 자동 비활성화 (Brief #9)" — 게이트 기준에만 참조
- **PRD FR 검색:** CLI 토큰 관련 FR = FR38(핸드오프 전파), FR43(암호화 저장), FR44(Soul 미주입). **유출 감지+자동 비활성화 프로세스를 정의하는 FR 없음**
- **보안 임팩트:** CORTHEX에서 CLI 토큰 = root access agent. 유출 시 전 에이전트가 악의적 명령 실행 가능. Go/No-Go 게이트가 "검증" 역할을 하지만, 검증할 구현 사양(FR)이 없으면 게이트가 무엇을 테스트하는지 불명확
- **권장 severity: Moderate** (Go/No-Go 안전망 존재하나, 보안 메커니즘에 FR 부재는 구현 시 혼란 유발)

**🟡 미탐지 갭 B: n8n→CORTHEX 서비스 계정 API 키 인증 패턴** (Informational)
- **Brief L411:** "서비스 계정 API 키 인증, 사용자 JWT 아님" (n8n webhook → CORTHEX `/api/v1/tasks` POST)
- **PRD:** N8N-SEC-6 "REST API 경유만 허용", FR-N8N4 Hono proxy 인프라 — but 인증 방식(서비스 계정 API 키 vs JWT) 미명시
- Brief L410 자체가 "Architecture에서 상세 설계" 헤더 아래이므로 **Informational** 적절
- n8n이 사용자 JWT를 쓰면 멀티테넌트 격리 파괴 가능 → Architecture에서 반드시 확정 필요

#### 3. Gap 2 보안 함의 미분석

분석가가 Gap 2 (ECC 2.2)를 "Cost optimization" 임팩트로만 기술. **보안 관점 누락:**
- 동적 모델 라우팅 FR 없으면 → 비용 조작 공격 표면 불명확
- 시나리오: 악의적 observation/prompt가 태스크 복잡도를 인위적으로 높여 Sonnet 강제 사용 → 비용 폭발
- PRD가 Tier별 정적 모델 배정(tier_configs)은 보유하나, "태스크 복잡도 판단 로직" FR 없이는 복잡도 조작 방어 기준도 없음
- **권장:** Gap 2 설명에 "보안 리스크: 복잡도 판단 기준 없으면 비용 남용 방지 불가" 추가

#### 4. 커버리지 맵 품질

15+ 주요 섹션 체계적 매핑: Vision, Problem, Users, Features(4 Layers+L0), Success Metrics, Goals, Differentiators, Constraints, Sprint Order, Go/No-Go, Out of Scope, Risks, Onboarding, Marketing Preset, AI Tool Engine, Obs TTL, Voyage AI — **포괄적**. "PRD EXPANDS" 관찰 (14 Go/No-Go, R1-R15) 정확.

---

### 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 8/10 | Brief/PRD 라인 번호 정확 (L425, L427, L497 등 전부 검증 통과). 갭별 severity+impact 명확. 개선점: Gap 1/2에 "FR이 이런 형태여야 한다" 사양 미제시 |
| D2 완전성 | 25% | 7/10 | 15+ 섹션 매핑 포괄적, 5 갭 식별. **BUT:** CLI 토큰 유출 감지 메커니즘 FR 부재 미탐지 (Brief R5→PRD Go/No-Go #11 게이트만). n8n 서비스 계정 인증 패턴 Informational 미수집 |
| D3 정확성 | 15% | 9/10 | "NOT FOUND" 주장 5건 전부 실존 확인. ECC 코드 참조 정확. 95% 커버리지 평가 합리적. False positive 0 |
| D4 실행가능성 | 10% | 8/10 | "Add FR for..." 권장사항 명확. Informational vs Moderate 분류 적절. 즉시 조치 가능 형태 |
| D5 일관성 | 15% | 9/10 | V-01→V-04 일관된 진행. Severity 분류 기준 통일. PRD/Brief 용어 정합. Brief §N 표기 일관 |
| D6 리스크 | 25% | 7/10 | MCP health check 보안 각도(43% 명령어 주입) 포착. **BUT:** Gap 2 비용 조작 공격 표면 미언급. CLI 토큰 유출 = root access 보안 리스크 미탐지. PRD "EXPANDS" 분석은 우수 |

### 가중 평균: 7.80/10 ✅ PASS

계산: (8×0.10) + (7×0.25) + (9×0.15) + (8×0.10) + (9×0.15) + (7×0.25) = 0.80 + 1.75 + 1.35 + 0.80 + 1.35 + 1.75 = **7.80**

---

### 이슈 목록 (1 MEDIUM, 2 LOW)

**M1 [D2+D6]:** CLI 토큰 유출 감지 자동 비활성화 메커니즘 — Brief R5 (L510) In Scope, PRD Go/No-Go #11 게이트 참조만 있고 구현 FR 없음. CLI 토큰 = root access → 보안 핵심. **Fix:** Gap 6 Moderate 추가 — "FR 추가 필요: CLI 토큰 유출 감지 조건 정의 + 자동 비활성화 프로세스 + Admin 알림 + 복구 절차"

**~~L1 [D6]:~~ WITHDRAWN (Cross-talk 해소):** John(Critic-C)의 Brief L427 재해석 동의 — Gap 2는 runtime complexity classifier가 아닌 Admin 정적 Tier→Model 설정. 복잡도 조작 공격 표면 없음. Gap 2 severity Moderate 유지하되 보안 각도 불필요.

**L2 [D2]:** n8n→CORTHEX 서비스 계정 API 키 인증 패턴 (Brief L411) — Informational gap으로 추가 권장. Architecture 확정 사항이나 커버리지 맵 완전성을 위해 기록.

### Cross-talk 결과

- **Winston(Critic-A) 교차 검증 완료 (Gap 1 + M1):**
  - **Gap 1 E8 배치 확정:** Type contract `HandoffResponse` → `shared/types.ts`, enforcement → `call-agent.ts` 도구 핸들러 (services 계층), engine/ 수정 0건. E8 경계 준수 깔끔한 구조. FR에 "E8 경계 준수" 주석 포함 권장.
  - **M1 CLI 토큰 유출 감지 동의:** Winston이 독립 검증 — FR41/43/44 = prevention only, detection+auto-deactivation FR = 0건 확인. Moderate 동의 (3중 prevention이 defense-in-depth). FR 초안 제시: credential-scrubber가 `sk-ant-cli-*`/OAuth Bearer 패턴 감지 → 세션 즉시 종료 + DB `encrypted_token→null, status='leaked'` + Admin 보안 알림.
- **John(Critic-C) 교차 검증 완료 (Gap 2):**
  - John의 Brief L427 재해석 동의: "태스크 복잡도에 따라"는 *근거*, "Admin이 Tier별 모델 배정 설정 가능"이 *메커니즘*
  - Gap 2는 runtime complexity classifier가 아니라 **기존 FR35(tier_configs 자동 매핑) 확장 + Admin 편집 UI**
  - **L1 보안 우려 철회:** Admin 정적 설정 = 복잡도 조작 공격 표면 없음
  - Sprint 3 스코프 동의 (Reflection 비용 관리와 같은 파이프라인)
  - **수정된 Gap 2 권장 FR:** "Admin이 Tier별 LLM 모델을 설정할 수 있다 (tier_configs). 비용 인지 기본값: Tier 3-4→Haiku, Tier 1-2→Sonnet. 예산 초과 시 FR-MEM14 자동 차단과 연동."

### R1 Verdict

**7.80/10 PASS.** 분석가의 5개 갭 전부 실존 확인, false positive 0. 커버리지 맵 포괄적이며 95% 평가 합리적. 주요 미탐지: CLI 토큰 유출 감지 메커니즘 FR 부재 (보안 관점 Moderate). Gap 2 보안 함의 추가 권장. 수정 후 8.5+ 기대.

---

## R2 Fix Verification

### 수정 검증 (8건: 5 PASS, 2 PASS with note, 1 RESIDUAL)

| # | 수정 내용 | 검증 | 상태 |
|---|----------|------|------|
| 1 | Gap 6 추가: CLI 토큰 유출 감지 자동 비활성화 (Quinn M1) | L235-239: Brief R5 (L510) 참조 정확, "no FR defines the mechanism" 핵심 포착, security impact 명시. 3-critic convergence 반영. | ✅ PASS |
| 2 | Gap 2 보안 각도 추가 (Quinn L1) | L218: "복잡도 판단 기준 없으면 비용 남용 방지 불가" 추가됨. **⚠️ BUT L1은 cross-talk 후 WITHDRAWN됨** — John의 Brief L427 재해석 (Admin 정적 매핑, runtime classifier 아님). 보안 각도 삭제 필요. | ⚠️ RESIDUAL |
| 3 | Gap 7 추가: n8n 서비스 계정 API 키 (Quinn L2) | L241-244: Brief L411 참조 정확, Informational 분류 정확, "Architecture에서 상세 설계" 근거 명시. | ✅ PASS |
| 4 | 비용 기록 immutability 커버리지 맵 추가 (John D2) | L199-202: Brief L498 참조, Architecture-deferred 분류 정확. PRD GATE 제거와 인프라 제약 구분 명확. | ✅ PASS |
| 5 | Gap 1 late discovery risk (John D6) | L211: Sprint 3 발견 시 수정 비용 급증. 타당한 리스크 보강. | ✅ PASS |
| 6 | Gap 2 R3 risk linkage (John D6) | L217: Brief R3 (H/H) 비용 폭발 완화 연결. 타당. **Note**: "동적 라우팅" 표현은 John의 후속 cross-talk와 불일치 (Admin 정적 매핑이 정확). | ✅ PASS (note) |
| 7 | Gap 1 cross-cutting risk (Winston) | L210: Engine→UI→Memory 3계층 인터페이스 계약. Architecture 에스컬레이션 권고. 타당한 리스크 보강. | ✅ PASS |
| 8 | Gap 8 추가: /office 키보드 에이전트 선택 (Winston) | L246-249: PRD FR-OC1~OC11 확인 — FR-OC10은 aria-live 텍스트 대안만, 키보드 에이전트 선택 FR 없음. Brief L434/L514 2회 명시 확인. Informational 분류 적절. | ✅ PASS |

### Residual Issue (1건 LOW)

**R1 [D5 일관성]:** Gap 2 (L213-218)에 cross-talk 이전 내용 잔존:
- L215: "NOT dynamic model routing based on task complexity" — John의 해석: Admin 정적 Tier→Model 매핑 (FR35 확장)
- L218: Quinn L1 보안 각도 — **WITHDRAWN** (Admin 정적 매핑 = 복잡도 조작 공격 표면 없음)
- **Fix**: L218 삭제 또는 "~~Security angle~~: cross-talk 결과 철회 (John — Admin 정적 매핑으로 공격 표면 없음)"으로 수정. L215 "dynamic model routing" → "Admin-editable Tier→Model mapping (FR35 확장)" 반영.
- **Severity**: LOW — Gap 2 존재 자체와 Moderate severity는 유효. 설명만 cross-talk 결론과 불일치.

### R2 차원별 점수

| 차원 | R1 | R2 | 가중치 | 가중점수 | 근거 |
|------|-----|-----|--------|---------|------|
| D1 구체성 | 8 | 8 | 10% | 0.80 | Gap 6/7/8 모두 Brief 라인 번호 + PRD 검색 결과 명시. 변동 없음. |
| D2 완전성 | 7 | 9 | 25% | 2.25 | 3-critic 피드백 전부 수용: Gap 6(Quinn M1), Gap 7(Quinn L2), Gap 8(Winston), 비용 immutability(John), risk notes 2건. 8→3 Moderate + 5 Informational 완전. |
| D3 정확성 | 9 | 8 | 15% | 1.20 | Gap 6/7/8 참조 전부 정확. Gap 2 L218 보안 각도가 cross-talk 후 철회된 내용 — 정확성 소폭 하락. |
| D4 실행가능성 | 8 | 8 | 10% | 0.80 | 권장사항 명확 유지. Gap 6 FR needed 사양 구체적. |
| D5 일관성 | 9 | 8 | 15% | 1.20 | Gap 2 "dynamic routing" 표현이 John cross-talk 결론과 불일치 (residual). 나머지 일관성 유지. |
| D6 리스크 | 7 | 9 | 25% | 2.25 | Gap 6 CLI 토큰 보안 추가 (3-critic convergence), Gap 1 cross-cutting risk, Gap 8 접근성, R3 연결 — 대폭 개선. |

### R2 가중 평균: 8.50/10 ✅ PASS

계산: 0.80 + 2.25 + 1.20 + 0.80 + 1.20 + 2.25 = **8.50**

### R2 Residual Fix Verification (Post-fix)

**R1 residual (Gap 2 L218 cross-talk 불일치):** FIXED.
- L215: "dynamic model routing" -> "Admin-editable 모델 배정" -- John cross-talk 결론 반영 ✅
- L218: Withdrawn security angle REMOVED. "Existing FR35 extends naturally" 표현으로 교체 ✅
- L220: Cross-talk consensus recommended FR with Admin static mapping pattern ✅

**Residual resolution: 1/1 FIXED. D3 8->9, D5 8->9 복원.**

### R2 Final Scores (post-residual-fix)

| 차원 | R2 pre | R2 final | 가중치 | 가중점수 |
|------|--------|----------|--------|---------|
| D1 | 8 | 8 | 10% | 0.80 |
| D2 | 9 | 9 | 25% | 2.25 |
| D3 | 8 | 9 | 15% | 1.35 |
| D4 | 8 | 8 | 10% | 0.80 |
| D5 | 8 | 9 | 15% | 1.35 |
| D6 | 9 | 9 | 25% | 2.25 |

**R2 Final Weighted Average: 8.80/10 ✅ PASS**

### R2 Verdict (FINAL)

**[Verified] 8.80/10 PASS.** All 8 fixes + 1 residual verified. Gap 2 "dynamic routing" -> "Admin-editable" 교정 + withdrawn security angle 삭제로 cross-talk 결론과 완전 정합. Gap 6(CLI 토큰 유출 감지) 보안 커버리지 확보. 8개 갭 전부 실존, 0 false positive, 8개 Brief 커버리지 영역 추가.
