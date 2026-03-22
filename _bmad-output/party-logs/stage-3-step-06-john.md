# Stage 3 Step V-06 — Critic-C (John) Review

**Step:** V-06 Traceability Validation
**Reviewer:** John (Critic-C, Product + Delivery)
**Date:** 2026-03-22
**Artifact:** `_bmad-output/planning-artifacts/prd-validation-report.md` Lines 423-568

---

## Critic-C Review — V-06 Traceability Validation

### 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 20% | 4개 체인 전부 정확한 라인 참조(L312, L500, L1254-1260, L1314 등). Gap: Journey 9 라인, FR30-32 vs FR-OC1-11 구분, L1349 교차점 데이터 근거 명시. Traceability Matrix 19행 × 5열 카테고리 레벨. Differentiator 6/6, SC 18/18 전수 매핑 테이블 구체적. |
| D2 완전성 | 8/10 | 20% | 4개 체인(ES→SC, SC→UJ, UJ→FR, Scope→FR) + Orphan 분석(0/0/1) + 카테고리 매트릭스 포괄적. 29개 인프라/보안 FR 별도 분류, 12개 지원 FR 별도 분류 — 123개 전수 커버. 감점: **NFR traceability 미검증** — 76개 NFR이 어떤 Success Criteria/품질 속성에 매핑되는지 체인 미구축. FR만큼 중요하진 않으나 NFR-P0 22개가 릴리스 게이트이므로 SC 연결 확인 가치 있음. |
| D3 정확성 | 9/10 | 15% | NEXUS 노드 색상 gap 직접 검증 완료: (1) L1254-1260 — 4색 상세 설명 + degraded 상태 정의 ✅. (2) L1314 — Journey Summary "NEXUS 실시간 노드 색상 (4색)" 명시 ✅. (3) FR30-32 — NEXUS 편집/뷰 전용, 실시간 상태 없음 ✅. (4) FR-OC1-11 — /office PixiJS 전용 ✅. (5) L1349 교차점 — 데이터 소스 공유 인정하나 NEXUS 렌더링 FR 부재 확인 ✅. Gap 판정 정확. Chain 1 6/6, Chain 2 18/18 매핑 구조적으로 합리적. |
| D4 실행가능성 | 9/10 | 15% | Gap 권고 구체적: "FR-OC12 추가" 또는 "FR32 확장" 두 가지 옵션 + 권고 FR 문구까지 제시. PRD Strength 인정(Journey Requirements Summary + Cross-Points 테이블)도 downstream 단계에 유용한 피드백. |
| D5 일관성 | 9/10 | 10% | FR 총수 123 = V-05와 일치. Journey 번호(J1-J10) PRD 원문과 정합. Chain 형식 일관. Gap 분류 V-04와 동일 패턴. Scope→FR 체인에서 "Phase 5 Sprint 1-4"가 PRD frontmatter sprintOrder와 정합. |
| D6 리스크 인식 | 7/10 | 20% | Gap impact "Low-Medium" 평가 + "기존 인프라가 지원할 수 있으나 FR 없이는 Architecture/Epic 누락 위험" 분석 양호. 감점 2건: (1) **NEXUS 노드 색상 = Sprint 4 scope creep 리스크 미평가.** /office (PixiJS)와 NEXUS (React Flow) 양쪽에서 실시간 상태를 렌더링하려면 Architecture에서 공유 상태 관리 설계 필요. FR 없으면 Sprint 4에서 NEXUS 실시간 기능이 "bonus" 취급될 위험. (2) **NFR traceability 부재가 테스트 계획에 미치는 영향** — NFR-P0 22개가 SC에 연결되지 않으면 Go/No-Go 게이트 검증 시 어떤 SC를 근거로 판단하는지 불명확. |

### 가중 평균: 8.40/10 ✅ PASS

**계산:** (9×0.20) + (8×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (7×0.20) = 1.80 + 1.60 + 1.35 + 1.35 + 0.90 + 1.40 = **8.40**

---

### 판단 사항(Judgment Calls) 응답

#### JC1: 29 infrastructure/security FRs → business objectives (not user journeys)

**동의 — standard practice.**

Cross-cutting concerns(보안, 인프라, 운영 안정성)은 특정 사용자 여정에 매핑되지 않는다. FR40-45(보안), FR-TOOLSANITIZE1-3(도구 보안), FR48-49(모니터링) 등은 전체 플랫폼의 비기능적 품질을 보장하는 FR이다. 이들을 "비즈니스 목표에 매핑"으로 분류한 것은 정확하다.

단, 82(journey) + 29(business) + 12(supporting) = 123 — 합산 검증 완료 ✅.

#### JC2: NEXUS 노드 색상 — missing FR vs existing infrastructure?

**Missing FR이 맞다.** 이유:

1. **데이터 소스 존재 ≠ 기능 구현.** `/ws/agent-status`가 상태 데이터를 제공하더라도, NEXUS React Flow 노드에 색상을 매핑하는 렌더링 로직은 별도 구현이 필요하다. 이것이 FR이 없으면 Architecture/Epic에서 빠질 수 있다.

2. **FR32 "읽기 전용 확인"은 정적 뷰.** 조직 구조를 보는 것이지 실시간 상태를 보는 것이 아니다. 실시간 색상은 WebSocket 구독 + 상태→색상 매핑 + React Flow 노드 스타일 업데이트 = 별개 기능.

3. **Product 관점**: Journey 9에서 CEO가 "마케팅부 CMO가 주황색이네?" → 클릭 → 상세 확인하는 시나리오(L1260)는 명확한 사용자 가치. 이것이 FR 없이 구현되지 않으면 CEO의 "AI 조직 가시성" 핵심 약속이 불완전.

**권고**: FR-OC12 신규 추가가 FR32 확장보다 적절. 이유: FR32는 Phase 3 scope이고, 실시간 노드 색상은 Sprint 4 scope (/ws/office와 동시). 다른 Phase의 FR을 확장하면 scope 혼란.

#### JC3: Journey Requirements Summary 의존도

**적절한 수준.**

분석가가 PRD 내장 테이블(L1304-1335)을 출발점으로 사용하고 FR 섹션과 교차 검증한 접근은 효율적이고 합리적이다. 내장 테이블은 PRD 저자가 작성한 자기 참조이므로, 독립 검증 없이 100% 신뢰하면 circular validation 위험이 있지만 — 분석가는 Chain 3에서 각 journey별 FR 목록(L473-482)을 별도로 구성했고, 그 과정에서 NEXUS gap을 발견했다. 이것은 독립 검증이 작동했다는 증거.

---

### 이슈 목록

#### 1. **[D6 리스크] Moderate — NEXUS 노드 색상 Sprint 4 scope creep 리스크**

NEXUS 실시간 노드 색상은 /office PixiJS와 다른 렌더링 스택(React Flow)을 사용한다. Sprint 4에서 두 가지 실시간 상태 렌더링을 동시에 구현하면:
- Architecture에서 공유 상태 관리 설계 필요 (/ws/agent-status → /office + NEXUS 양쪽 구독)
- Sprint 4 예상 공수 증가 (PixiJS + React Flow 이중 구현)

**완화**: FR-OC12 추가 시 Architecture 단계에서 공유 상태 관리를 명시적으로 설계 가능. FR 없이 Sprint 4에 진입하면 "bonus" 취급 → 구현 누락 또는 급조 리스크.

#### 2. **[D2 완전성] Low — NFR traceability 미검증**

76개 NFR → SC/품질속성 매핑 체인 미구축. FR traceability만큼 critical하지는 않으나:
- NFR-P0 22개 = 릴리스 게이트. SC에 연결되지 않으면 Go/No-Go 판단 근거 불명확.
- V-05에서 NFR 76개를 전수 분석했으므로, traceability도 동일 수준으로 체크할 가치 있음.
- **권고**: Informational note로 "NFR→SC mapping은 Architecture 단계에서 검증" 추가. 현 단계 블로커 아님.

#### 3. **[D1 구체성] Informational — Gap FR 권고 Sprint 배치 명시**

분석가 권고(L565)에 "Sprint 4 scope" 언급 있으나, FR-OC12 vs FR32 확장의 scope 차이(Phase 3 vs Sprint 4)를 명시적으로 비교하면 더 명확. 사소.

---

### Cross-talk 메모

- Winston에게: NEXUS 실시간 노드 색상의 Architecture 영향 — /ws/agent-status 기존 채널을 NEXUS React Flow에서 구독하는 패턴이 기술적으로 가능한지 (현재 `/ws/agent-status`는 Hub 트래커용). 공유 가능하면 신규 WS 채널 불필요.
- Quinn에게: NEXUS 노드 색상에 "degraded" 상태(L1258 주황색)가 있는데, 이것의 보안/운영 의미 — heartbeat fallback 표시가 CEO에게 적절한 수준의 정보 노출인지? (에이전트 내부 상태 과다 노출 리스크)

---

**결론:** V-06 Traceability Validation은 높은 품질. 4개 체인 전수 검증, 1건 gap 정확 식별, 카테고리 매트릭스 포괄적. NEXUS scope creep 리스크 + NFR traceability 미검증 2건은 fixes/Architecture에서 해결 가능. **8.40/10 ✅ PASS.**

---

## [Verified] R2 Fixes — 8.40/10 ✅ PASS (유지)

**Date:** 2026-03-22
**Verification:** 3 Critic 피드백 전부 반영 확인.

| # | Fix | Source | Verified |
|---|-----|--------|----------|
| 1 | FR-TOOLSANITIZE1-3 relocated J10→J4 Sprint 2 (L477, L482) | Quinn L1 | ✅ |
| 2 | Correction note explaining relocation (L483) | Quinn L1 | ✅ |
| 3 | FR-OC12 full draft with color codes + WebSocket + scope (L566-576) | John D1/D6 + Winston D1/D6 | ✅ |
| 4 | Sprint scope clarification: FR-OC12=Sprint 4, FR32=Phase 3 static (L572) | John D1/D6 | ✅ |
| 5 | Scope creep risk warning: NEXUS React Flow + PixiJS /office shared data source (L574) | John D6 | ✅ |
| 6 | PRD Extended State notation: degraded = 6th state, 6→4 color grouping (L576) | Winston Q3 | ✅ |
| 7 | NFR→SC category-level traceability table (L578-591) | John D2 + Winston D2 | ✅ |
| 8 | FR-TOOLSANITIZE correction in PRD Strength note (L593) | Winston D3 | ✅ |

**Updated totals verified:** 1 gap (NEXUS node colors) with comprehensive FR-OC12 draft. NFR traceability informational table added. FR-TOOLSANITIZE J10→J4 correction aligned with PRD Journey Summary L1330. ✅
**Score 유지:** 8.40/10 — fixes가 내 지적사항 3건을 정확히 반영.
