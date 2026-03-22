# Stage 3 Step V-04 — Winston (Critic-A) Review

**Reviewer:** Winston (Critic-A, Architecture + API)
**Date:** 2026-03-22
**Target:** `_bmad-output/planning-artifacts/prd-validation-report.md` (Step V-04 section, post-fix version)

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | Brief L425/L427/L497 등 정확한 라인 번호, FR/NFR ID, ECC 번호 전부 명시. Coverage map에서 일부 "Fully Covered" 항목의 PRD 라인 범위 불균일 (일부만 L번호 포함). |
| D2 완전성 | 15% | 7/10 | Brief 전 섹션 체계적 커버 + 5개 gap 분류. **1개 gap 누락**: /office 키보드 에이전트 선택 — Brief L434, L514에 2회 명시되었으나 PRD에 대응 FR 없음. |
| D3 정확성 | 25% | 9/10 | 5개 gap 전부 원본 대조 확인 완료. Coverage 95% 적절. 심각도 분류 전부 정확. 할루시네이션 0건. 이전 버전 문제(WS 14→15, 게이트 할루시네이션) 전부 해소됨. |
| D4 실행가능성 | 20% | 8/10 | gap별 "Add FR for X" 권고 명확. Impact 평가로 우선순위화 가능. 개선: Moderate gap 2건에 대해 구체적 FR 문구 초안이 있으면 후속 Writer에게 즉시 활용 가능. |
| D5 일관성 | 15% | 9/10 | confirmed-decisions-stage1.md 12건 정합. Decision 4.3.1(Big Five 0-100) 정확 적용. GATE 결정 정확 반영. Go/No-Go 14개(Brief 11 → PRD 14 확장) 정확 인식. |
| D6 리스크 | 10% | 7/10 | gap별 영향 기술. 그러나 Gap 1(handoff format)이 Tracker UI + Layer 4 observation 품질에 걸치는 cross-cutting 아키텍처 리스크 미강조. |

## 가중 평균: 8.30/10 ✅ PASS

계산: (9×0.15) + (7×0.15) + (9×0.25) + (8×0.20) + (9×0.15) + (7×0.10) = 1.35 + 1.05 + 2.25 + 1.60 + 1.35 + 0.70 = **8.30**

---

## 이슈 목록

### 1. [D2 완전성] 누락된 Gap: /office 키보드 에이전트 선택 — Severity: Informational

- **Brief L434**: "키보드 에이전트 선택" (Layer 1 접근성 항목으로 명시)
- **Brief L514** (R9 완화 전략): "키보드 에이전트 선택" (2회째 언급)
- **PRD 현황**:
  - FR-OC10: ARIA live 텍스트 대안 패널 ✅
  - NFR-A6: aria-live="polite" ✅
  - NFR-A4: 일반 키보드 Tab+Enter ✅
- **PRD 부재**: /office Canvas 내 에이전트를 키보드로 선택/포커스하는 FR/NFR 없음
- **판단**: Brief가 "전체 WCAG = v4 범위"로 명시하고, v3 최소선(ARIA live)은 충족되므로 Informational. 그러나 Brief에 2회 명시된 요구사항이므로 coverage map에 최소 언급 필요.
- **권고**: Informational Gap 4번째로 추가, 또는 FR-OC10 확장하여 "키보드 Arrow keys로 에이전트 선택 + Enter로 상세 정보 표시" 추가.

### 2. [D4 실행가능성] Moderate Gap에 대한 구체적 FR 초안 제안

**Gap 1 (ECC 2.7) FR 초안:**
```
FR-XX: [Sprint 3] call_agent 핸드오프 완료 시 응답이 표준 포맷
{ status: 'success'|'error'|'partial', summary: string,
  next_actions: string[], artifacts: Record<string, unknown> }
으로 반환된다. Tracker UI(FR46)와 observations(FR-MEM1) 모두
이 포맷을 소비한다.
```

**Gap 2 (ECC 2.2) FR 초안:**
```
FR-XX: [Sprint 3] Admin이 Tier별 기본 LLM 모델을 설정할 수 있다
(기존 에이전트별 개별 설정에 추가). 태스크 복잡도(토큰 수 기반
heuristic)에 따라 Tier 범위 내 경량 모델(Haiku)↔중량 모델(Sonnet)
자동 선택이 적용된다. 예산 초과 시 에이전트 실행 자동 차단
(FR-MEM14 비용 차단과 별개 — 실행 시점 차단).
```

### 3. [D6 리스크] Gap 1의 cross-cutting 아키텍처 리스크 미강조

Gap 1 (ECC 2.7 handoff response format)은 단순 FR 누락이 아니라 **3개 계층에 걸치는 아키텍처 계약**:

| 계층 | 의존 | 영향 |
|------|------|------|
| Engine | call_agent 도구 핸들러 → `{ status, summary, next_actions, artifacts }` 반환 | 미정의 시 각 에이전트가 자유 포맷 반환 → 파싱 불가 |
| UI | Tracker (FR46) → 표준 포맷 소비하여 체인 실시간 표시 | 비구조화 데이터 → Tracker 표시 불안정 |
| Memory | observations (FR-MEM1) → 구조화된 관찰 추출 | 비구조화 핸드오프 결과 → observation 품질 저하 → Reflection 품질 저하 |

**권고**: Moderate severity 유지하되, Architecture 단계에서 **인터페이스 계약(Interface Contract)**으로 명문화 필요. validation report에 cross-cutting 영향 주석 추가.

### 4. [D1 구체성] Coverage map PRD 라인 참조 균일화 — 사소

일부 "Fully Covered" 항목은 PRD 라인 범위 포함 (예: "Executive Summary (L273-306)"), 일부는 미포함 (예: "Technical Architecture Context (L1784+)"). 모든 항목에 라인 범위 포함하면 후속 검증자의 spot-check 효율 향상. 사소한 개선점, 점수 영향 미미.

---

## Analyst Gap 분석 검증 결과 (5건 전수 확인)

| # | Gap | PRD 검색 결과 | 존재 확인 | 심각도 동의 | 검증 상세 |
|---|-----|-------------|----------|------------|----------|
| 1 | ECC 2.7 handoff response `{ status, summary, next_actions, artifacts }` | `grep "status.*summary.*next_actions\|ECC.*2\.7"` = 0건 | ✅ Gap 실재 | ✅ Moderate | PRD 전문 검색 — FR/NFR/Domain 규칙 전부에서 0건. Cross-cutting 리스크 추가 주석 필요 (이슈 #3) |
| 2 | ECC 2.2 dynamic model routing | PRD L832: 에이전트별 모델 = 기존 v2 수동 설정만. L462/L1480: Reflection 크론 cost-pause만 | ✅ Gap 실재 | ✅ Moderate | Brief는 "태스크 복잡도 기반 자동 선택"이나 PRD는 수동 + Reflection 전용. 일반 실행 시점 동적 라우팅 FR 없음 |
| 3 | MCP server health check | PRD: n8n Docker healthcheck(NFR-O9) 있으나, Stitch 2/Playwright MCP 무응답 모니터링 크론 없음 | ✅ Gap 실재 | ✅ Informational | Brief L497이 "Architecture NFR 상세 설계"로 명시적 이월. Dev 도구이므로 Informational 적절 |
| 4 | CEO Costs vs GATE | PRD L259-263: GATE 결정으로 명시적 제거 + Brief 수정 필요 주석 | ✅ PRD 정확 | ✅ Informational (Brief outdated) | PRD가 정확. Brief 쪽 업데이트 필요 |
| 5 | Big Five 0.0~1.0 vs 0-100 | PRD L146/L206/L861/FR-PERS1: 0-100 정수, "Decision 4.3.1" 명시 | ✅ 의도적 개선 | ✅ Informational (Brief outdated) | confirmed-decisions-stage1.md에는 미포함이나, Stage 1 party-log에서 확인 가능 |

---

## Confirmed Decisions 정합성 검증 (12건)

| # | 결정 | PRD 반영 위치 | 상태 |
|---|------|-------------|------|
| 1 | Voyage AI voyage-3 1024d | L157, L720, FR-MEM2, FR-MEM5, NFR-COST2 | ✅ |
| 2 | n8n Docker --memory=2g | FR-N8N4(SEC-5), NFR-SC9 | ✅ |
| 3 | n8n 8-layer security | FR-N8N4(SEC-1~8), NFR-S9 | ✅ |
| 4 | Stitch 2 primary | Product Scope L668+ | ✅ |
| 5 | Observation TTL 30일 | FR-MEM13, NFR-D8, MEM-7 | ✅ |
| 6 | LLM Cost ~$17/month | NFR-COST3(Haiku ≤$0.10/day). 전체 $17 직접 미명시 | ⚠️ 간접 |
| 7 | reflected/reflected_at | Schema L912-913, 20+ 참조 (`is_processed` 0건) | ✅ |
| 8 | 4-layer sanitization | FR-MEM12, NFR-S10, MEM-6 | ✅ |
| 9 | pg_advisory_xact_lock | FR-MEM3, MEM-2 | ✅ |
| 10 | WS 50/500 limits | FR-OC2, NFR-SC8 | ✅ |
| 11 | 14 Go/No-Go gates | L453-469 | ✅ |
| 12 | Docker host-gateway | Architecture 범위 (PRD 직접 명시 불필요) | ⚠️ 이월 |

---

## Cross-talk 요약

- Gap 1 (ECC 2.7 handoff format)은 **Critic-B (QA+Security)** 관점에서도 검토 필요: 비구조화 핸드오프 응답 → observation sanitization(MEM-6) 적용 시 파싱 불안정 위험.
- Gap 2 (ECC 2.2 dynamic model routing)는 **Critic-C (Product+Delivery)** 관점에서 비용 절약 효과 vs 구현 복잡성 트레이드오프 평가 필요.
- 이전 리뷰(v1)에서 지적했던 WS 채널 수 오류, Go/No-Go 게이트명 할루시네이션, FR-MEM/MEM 카운트 불일치 — **전부 수정됨 확인**.

### Quinn (Critic-B) Cross-talk — 반영

**Q1: ECC 2.7 handoff format E8 boundary placement**
- Quinn 질의: `{ status, summary, next_actions, artifacts }` 표준화가 E8 경계 어디에 속하는가?
- Winston 답변: Brief L425 "E8 경계 준수 (engine 외부 레이어에서 구현)" 명시.
  - **Type contract** → `shared/types.ts` (HandoffResponse 인터페이스)
  - **Enforcement** → call_agent 도구 핸들러 (services 계층, engine 외부)
  - **소비자** → Tracker UI (WebSocket), observations (soul-enricher.ts) — 모두 engine 외부
  - E8 위반 0건. engine/agent-loop.ts 수정 없이 구현 가능.
- FR 초안에 "E8 경계 준수" 주석 추가 권고.

**Q2: CLI 토큰 유출 감지 자동 비활성화 — 추가 Gap 동의**
- Brief R5 (L510): "CLI 토큰 유출 감지 시 자동 비활성화 메커니즘" 명시적 요구
- PRD Go/No-Go #11 (L466): 게이트 기준으로 언급하나 대응 FR 없음
- PRD FRs: FR41(마스킹), FR43(암호화), FR44(Soul 주입 금지) = PREVENTION만 존재
- **DETECTION + AUTO-DEACTIVATION FR = 0건** ← 추가 Moderate Gap (M1)
- Severity: Moderate (3중 prevention defense-in-depth 존재하나, root access agent 패턴이므로 detection 필수)
- FR 초안: credential-scrubber가 토큰 패턴 감지 시 → 세션 즉시 종료 + encrypted_token null 처리 + status='leaked' + Admin 보안 알림

**Gap 총계 업데이트** (analyst 5건 + critic 발견 3건):
- Moderate: 3건 (ECC 2.7 handoff format, ECC 2.2 model routing, **M1 CLI token leak detection**)
- Informational: 5건 (MCP health, Brief CEO costs, Brief Big Five scale, **n8n service account API key**, **/office keyboard agent selection**)

---

## [Verified] R2 Score — 8.55/10 ✅ PASS

Analyst가 3개 Critic 피드백 전부 반영 후 재검증 완료.

| 차원 | R1 | R2 | 변동 근거 |
|------|-----|-----|---------|
| D1 구체성 | 9 | 9 | 변동 없음 — 신규 gaps도 정확한 Brief/PRD line refs 포함 |
| D2 완전성 | 7 | 8 | +1: Gap 6(CLI token), Gap 7(n8n API key), Gap 8(/office keyboard) 추가 |
| D3 정확성 | 9 | 9 | 변동 없음 — 신규 gaps 전부 원본 대조 정확 |
| D4 실행가능성 | 8 | 8 | 변동 없음 |
| D5 일관성 | 9 | 9 | 변동 없음 |
| D6 리스크 | 7 | 8 | +1: cross-cutting risk, late discovery risk, R3 linkage 추가 |

**Verified weighted avg:** (9×0.15)+(8×0.15)+(9×0.25)+(8×0.20)+(9×0.15)+(8×0.10) = **8.55/10 ✅ PASS**

전수 검증 항목: Gap 8 refs ✅, Gap 1 cross-cutting ✅, Gap 6 Brief↔PRD 대조 ✅, Gap 7 Brief L411↔PRD SEC-4 HMAC 구분 ✅, 비용 immutability Architecture-deferred ✅, 커버리지 93% 산술 ✅, 평균 8.05 산술 ✅
