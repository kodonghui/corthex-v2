## Critic-B (Quinn) Review — Stage 3 Step V-06: Traceability Validation

### Review Date
2026-03-22 (R1)

### Content Reviewed
`_bmad-output/planning-artifacts/prd-validation-report.md`, Step V-06 section (L423-568)

---

### R1 Independent Verification

#### 1. Chain 1 (ES → SC) 검증

6 differentiators → 6 SC 매핑:
- L312 투명성(OpenClaw) → L500 "CEO가 AI 팀 활동을 본다" ✅
- L315 개성(Big Five) → L494 "A/B 블라인드" ✅
- L318 성장(Memory) → L499 "같은 실수 안 한다 (≤3/10)" ✅
- L321 자동화(n8n) → L496 "≤10분, 코드 0줄" ✅
- L324 설계(NEXUS) → L479 "CEO가 설계 (≤10분)" ✅
- L327 오케스트레이션(Soul) → L481 "8/10회+" ✅

6/6 완전. **INTACT 판정 동의.**

#### 2. Chain 2 (SC → Journeys) 검증

18 SC (10 v2 + 8 v3) → Journey 매핑 spot-check 5건:
- SC-v3-1 "Big Five 성격으로 달라진다" → J1 Sprint 1, J4 Sprint 1 ✅ (L1312, L1324)
- SC-v3-3 "n8n 워크플로우 쉽게 만든다" → J8 Sprint 2, J4 Sprint 2 ✅ (L1325)
- SC-v3-7 "CEO가 AI 팀 활동을 본다" → J9 Sprint 4 ✅ (L1314)
- SC-v2-8 "핸드오프 과정이 투명" → J1 Phase 2 사이드바 ✅ (L1309)
- SC-v2-10 "초기 설정이 쉽다" → J7 온보딩, J4 Phase 2 ✅ (L1322, L1334)

**INTACT 판정 동의.** Unsupported SC: 0 확인.

#### 3. Chain 3 (Journeys → FRs) 검증 — NEXUS 노드 색상 갭

**갭 실존 확인 ✅:**
- J9 (L1253-1260): NEXUS 실시간 노드 상태 색상 4색 (파란/초록/빨간/주황) 명시
- Journey Summary (L1314): "NEXUS 실시간 노드 색상 (4색)" 명시적 기록
- FR30-32: 편집/저장/읽기 전용 — 실시간 상태 색상 없음 ✅
- FR-OC1-11: /office PixiJS 전용 — NEXUS React Flow 렌더링과 별도 ✅
- Cross-points (L1349): 공통 데이터 소스 인정하나 NEXUS 렌더링은 implicit

**Impact 평가:** Low-Medium 동의. /ws/agent-status 인프라 존재하나 FR 없이는 Architecture/Epic 누락 위험.

**권장:** FR-OC12 추가 또는 FR32 확장 — 분석가 권장 동의. FR32 확장이 더 간결 (NEXUS 읽기 뷰에 실시간 색상 추가).

#### 4. Chain 4 (Scope → FR) 검증

8 Scope phases × FR coverage spot-check:
- MVP-A: FR1-10, FR38-45 ✅
- Sprint 1: FR-PERS1-9 ✅
- Sprint 2: FR-N8N1-6, FR-MKT1-7, FR-TOOLSANITIZE1-3 ✅
- Sprint 4: FR-OC1-11 ✅

**INTACT 판정 동의.**

#### 5. Orphan 분석 검증

- Orphan FRs: 0 — 82 direct journey + 29 cross-cutting + 12 supporting = 123 ✅
- Unsupported SC: 0 ✅
- Journey→FR gaps: 1 (NEXUS 색상) ✅

#### 6. Security-Angle 질문 응답

**Q1: FR40-45 trace to "business objectives" — 올바른 분류인가?**

**✅ 올바름.** FR40-44는 자동화된 시스템 보안 동작:
- FR40 (tool-permission-guard): 에이전트 실행 시 자동 차단 — 사용자 행동 아님
- FR41 (credential-scrubber): 출력 자동 마스킹 — 사용자 행동 아님
- FR42 (감사 로그): 자동 기록 — 사용자 행동 아님
- FR43 (CLI 토큰 암호화): 인프라 — 사용자 행동 아님
- FR44 (Soul 미주입): 시스템 제약 — 사용자 행동 아님

이들은 **cross-cutting concerns**로 "데이터 보호, 컴플라이언스, 운영 안정성" 비즈니스 목표에 trace. J4 Admin Journey에는 CLI 토큰 **관리** UI (FR28)가 있으나, FR40-44는 Admin이 *수행*하는 행동이 아니라 시스템이 *자동으로 강제*하는 보안 제약. J4 secondary trace 가능하나 primary trace는 business objective가 정확.

**Q2: FR-TOOLSANITIZE1-3 → J4 Sprint 2 trace — 올바른가?**

**⚠️ 부분적으로 올바름. 보고서 내부 불일치 발견:**

- 분석가 질문에서는 "J4 Sprint 2"로 기술
- 보고서 L482에서는 "J10 Admin Memory (Sprint 3): FR-MEM1-14, FR-TOOLSANITIZE1-3 ✓"로 기술
- Journey Summary L1330에서는 Admin Sprint 2에 "Tool Sanitization (Go/No-Go #11)" 기록

**Quinn 판정:**
- FR-TOOLSANITIZE1-2는 Sprint 2 **구현** → J4 Sprint 2 맞음
- FR-TOOLSANITIZE3는 "Sprint 2 구현, Sprint 3 Go/No-Go #11 **검증**" (L2489) → J10 Sprint 3에도 해당
- 보고서 L482 J10에 TOOLSANITIZE1-3 전체를 배치한 것은 **부정확** — Sprint 2 구현 FRs는 J4 Sprint 2, 검증은 J10 Sprint 3
- **수정 권장:** L482에서 FR-TOOLSANITIZE1-2를 J4 Sprint 2로 이동, FR-TOOLSANITIZE3만 J10 유지. 또는 cross-cutting으로 분류 (security business objective).

실질적으로 TOOLSANITIZE는 **hybrid**: 자동 보안 (Q1과 같은 성격) + Admin이 결과를 모니터링 (J10 L1327 "플래그된 관찰 목록 관리"). Business objective trace가 가장 정확하나, J4/J10 secondary trace도 유효.

**Q3: Journey 11 "Admin Security Operations" 필요한가?**

**❌ 불필요. 현재 구조가 적절.**

근거:
- Admin의 보안 활동은 이미 J4 (CLI 토큰 관리, 권한 설정)와 J10 (플래그된 관찰 관리)에 분산
- 29건 cross-cutting FRs는 **사용자가 수행하는 행동이 아닌 시스템 자동 제약** → 여정(사용자 경험)과 본질적으로 불일치
- Journey = "사용자가 목표를 달성하는 경로". 보안은 목표가 아니라 제약 — business objective trace가 정확
- 단, **V-04 Gap 6 (CLI 토큰 유출 감지 FR)**이 추가되면 Admin 보안 대응 워크플로우가 생김 → **그때** J4 확장 또는 J11 추가 고려 가능
- 현 시점에서 J11 추가는 **over-engineering** — 29건 FRs를 여지로 묶어도 "Admin이 보안 대시보드를 본다" 정도이며, 이는 J4 Phase 2에 이미 포함

#### 7. 트레이서빌리티 매트릭스 품질

Category-Level 매트릭스 (L529-550): 18 카테고리 × FR Count × Journey × Scope × SC — **포괄적이고 정확**. Total 123 확인. 다만 column-level 매핑 (개별 FR → 개별 Journey 행)은 아님 — category summary 수준. V-06 범위로는 적절.

---

### R1 Scores

| Dim | Wt | Score | Wtd | Evidence |
|-----|-----|-------|-----|----------|
| D1 | 10% | 9 | 0.90 | 4-chain 구조 명확, PRD 라인 번호 정확 (L312/L500/L1254/L1314 등 전부 검증 통과). 갭 설명 구체적. |
| D2 | 25% | 8 | 2.00 | 4 chains + orphan analysis + traceability matrix 포괄적. 18 SC 전수 매핑. **BUT:** FR-TOOLSANITIZE1-3 trace 불일치 (L482 J10 vs 실제 Sprint 2). NFR traceability 미검증 (FR만 대상). |
| D3 | 15% | 9 | 1.35 | NEXUS 색상 갭 실존 확인. 4-chain intact/1-gap 판정 정확. SC/Journey 라인 참조 전부 정확. |
| D4 | 10% | 9 | 0.90 | FR-OC12 추가 또는 FR32 확장 — 구체적이고 즉시 실행 가능. FR 텍스트 초안까지 제시. |
| D5 | 15% | 9 | 1.35 | V-01→V-06 일관. Chain 구조 통일. Severity 분류 체계 유지. |
| D6 | 25% | 8 | 2.00 | Cross-cutting 29 FRs 분류 적절. NEXUS gap low-medium 판정 합리적. **BUT:** TOOLSANITIZE trace 불일치가 보안 FR traceability 정확성에 영향. Security journey 필요성 질문 자체가 좋은 리스크 인식이나, 자체 판단 부재. |

**R1 Weighted Average: 8.50/10 ✅ PASS**

계산: 0.90 + 2.00 + 1.35 + 0.90 + 1.35 + 2.00 = **8.50**

### Issues (1 LOW)

**L1 [D2+D3]:** FR-TOOLSANITIZE1-3 trace 불일치:
- 보고서 L482: J10 Admin Memory (Sprint 3)에 배치
- 실제: FR-TOOLSANITIZE1-2 = Sprint 2 구현 (J4 Sprint 2가 정확), FR-TOOLSANITIZE3 = Sprint 2 구현 + Sprint 3 검증
- Journey Summary L1330: Admin Sprint 2에 "Tool Sanitization" 기록
- **Fix:** L482에서 FR-TOOLSANITIZE1-2를 J4 Sprint 2로 이동하거나, cross-cutting (business objective)으로 재분류. 현재는 J10에 전체 묶음이 부정확.

### Cross-talk 결과

- **John(Critic-C) 응답 완료 — FR-OC12 신규 지지:**
  - Phase/Sprint 정합성: FR32 = Phase 2, 실시간 색상 = Sprint 4 → Phase 불일치 방지
  - 구현 독립성: FR32 = 정적 React Flow 뷰, FR-OC12 = WebSocket 구독 + 동적 노드 스타일 → 완전히 다른 구현 경로
  - Sprint planning: FR-OC1-11 다음에 FR-OC12 배치 → Sprint 4 backlog에 자연 포함, /office와 NEXUS 공유 상태 아키텍처 동시 설계
  - Scope creep 방지: FR 없이 진입 시 "bonus" 취급 → 급조 리스크
  - **합의 FR-OC12 문구:** "FR-OC12: [Sprint 4] NEXUS 조직도에서 에이전트 노드가 실시간 상태 색상(idle 파란/active 초록/error 빨간/degraded 주황)으로 표시된다. /ws/agent-status 채널 구독. (Journey 9, L1254-1260)"
  - degraded 정보 노출 수준은 Architecture에서 결정 (PRD에서는 4색 명시만으로 충분)
  - **Quinn 동의:** FR-OC12 신규가 FR32 확장보다 확실히 깔끔. 초기 리뷰에서 "FR32 확장이 더 간결" 판단을 John 근거로 수정.
- **Winston(Critic-A) 응답 완료:**
  - **NEXUS 색상 갭:** FR-OC12에 `/ws/agent-status` (기존 채널) 사용 명시 권고 — `/ws/office`는 PixiJS 전용 렌더링 페이로드 포함이라 NEXUS에 부적절. John의 FR-OC12 초안이 이미 `/ws/agent-status 채널 구독` 명시 → 합치.
  - **degraded 상태 보안:** Brief 5상태 외 PRD 확장 (사장님 결정 2026-03-20). NRT-2에서 heartbeat 15초→degraded, 30초→error 전환. degraded 에이전트의 in-flight 태스크 처리 방식 질문. **Quinn 판단:** degraded = 운영 모니터링 신호 (응답 지연), 보안 상태 아님. 보안 방어는 3 sanitization chains (PER-1, MEM-6, TOOLSANITIZE)가 독립 수행. 태스크 처리 정책(graceful degradation vs 중단)은 Architecture 결정.
  - **점진적 테스트 전략:** Phase 3 = 정적 NEXUS (FR30-32) → Sprint 4 = 색상 오버레이 추가 (FR-OC12). **Quinn 동의:** FR 분리가 자연스러운 점진적 테스트를 지원. Phase 3 테스트 시 색상 없이 구조/편집/읽기만 검증 → Sprint 4에서 WebSocket 구독 + 동적 스타일 테스트 추가. QA 매트릭스도 깔끔히 분리.
  - **Traceability granularity:** Category-level + Journey Requirements Summary로 충분, 123행 row-level 불필요. 근거: (1) 양방향 추적 이미 존재 (Category matrix 정방향 + Journey Summary L1304 역방향), (2) Solo dev 123행 유지보수 비현실적, (3) Epic scoping은 Sprint/Phase 단위 = Category-level이 정확히 매핑, (4) 개선 1건: 29개 cross-cutting FRs의 business objective 매핑 구체화만 필요 (5행 테이블). Quinn 동의.

### R1 Verdict

**8.50/10 PASS.** 4-chain 검증 포괄적, NEXUS 색상 갭 실존 확인, orphan 분석 완전. Cross-cutting 29 FRs "business objective" 분류 적절. 1건 LOW: FR-TOOLSANITIZE trace 불일치 (L482 J10 vs Sprint 2). 보안 질문 3건 모두 답변 완료. 수정 후 8.8+ 기대.

---

## R2 Fix Verification (Analyst V-06 Fixes)

### 수정 검증 (6건: 6 PASS)

| # | 수정 내용 (출처) | 검증 | 상태 |
|---|----------------|------|------|
| 1 | Quinn L1: FR-TOOLSANITIZE trace fix — J10→J4 Sprint 2 | L477: J4에 FR-TOOLSANITIZE1-3 추가 확인. L482: J10에서 제거 확인. L483: correction note 명시 ("relocated to J4 Sprint 2 per PRD Journey Summary L1330"). ✅ | PASS |
| 2 | John D1/D6 + Winston D1/D6: FR-OC12 enhanced recommendation | L566-576: 전체 FR-OC12 초안 포함. `/ws/agent-status` 채널 명시, 상태→색상 매핑 4색 + hex 코드, 연결 끊김 fallback (gray #9CA3AF + 재연결 배너), Sprint scope 명시 (FR-OC12=Sprint 4, FR32=Phase 3 static), scope creep risk 경고. 3-critic 합의 내용 정확히 반영. ✅ | PASS |
| 3 | Winston Q3: PRD Extended State notation | L576: "degraded" = 6th state beyond Brief's 5, 6→4 color grouping rationale 명시 (working+speaking+tool_calling → active green). ✅ | PASS |
| 4 | John D2 + Winston D2: NFR→SC category-level traceability | L578-591: 6 NFR 카테고리 → SC 매핑 테이블 추가. "informational only" 표기 적절 — BMAD 표준 chain 아님. NFR orphan 없음 확인. ✅ | PASS |
| 5 | Winston D3: FR-TOOLSANITIZE correction in PRD Strength note | L593: "FR-TOOLSANITIZE placement correction (J10→J4 Sprint 2) aligns with PRD's own Journey Summary (L1330)" 확인. ✅ | PASS |
| 6 | Traceability matrix ToolSanitize row update | L549: "J4 Sprint 2" 확인 (이전 J10에서 수정). Chain 4 Scope table L503에도 Sprint 2 배치 일관. ✅ | PASS |

### R2 Scores

| Dim | R1 | R2 | Wt | Wtd | Evidence |
|-----|-----|-----|-----|-----|----------|
| D1 | 9 | 9 | 10% | 0.90 | FR-OC12 초안에 hex 코드, WebSocket 채널, Sprint scope, fallback 전부 명시. 변동 없음. |
| D2 | 8 | 9 | 25% | 2.25 | L1 해소 (TOOLSANITIZE J4 이동). NFR→SC informational 매핑 추가. Extended state notation 추가. 완전성 대폭 향상. |
| D3 | 9 | 9 | 15% | 1.35 | TOOLSANITIZE trace 수정 정확. FR-OC12 draft = Journey 9 L1254-1260 정확 반영. NFR→SC 매핑 spot-check 정확. |
| D4 | 9 | 10 | 10% | 1.00 | FR-OC12 draft = 즉시 PRD에 삽입 가능 수준. 상태→색상 매핑, fallback, scope boundary 전부 구체적. |
| D5 | 9 | 9 | 15% | 1.35 | V-01→V-06 일관 유지. Correction note가 이전 내용과 변경 사유를 명시 — 감사 추적 가능. |
| D6 | 8 | 9 | 25% | 2.25 | Scope creep risk warning 추가. Sprint boundary 명확화. TOOLSANITIZE trace 보안 FR 정확성 개선. |

**R2 Weighted Average: 9.10/10 ✅ PASS**

계산: 0.90 + 2.25 + 1.35 + 1.00 + 1.35 + 2.25 = **9.10**

### R2 Verdict (FINAL)

**9.10/10 PASS.** R1 8.50 → R2 9.10 (+0.60). 6건 수정 전부 PASS. FR-TOOLSANITIZE trace 수정으로 보안 FR traceability 정확성 확보. FR-OC12 enhanced draft는 3-critic 합의를 정확히 반영 — `/ws/agent-status` 채널, 4색 hex, fallback, Sprint scope, scope creep risk 전부 포함. NFR→SC informational 매핑으로 완전성 보강. 이슈 0건.
