# Stage 3 Step V-06 — Winston (Critic-A) Review

**Reviewer:** Winston (Critic-A, Architecture + API)
**Date:** 2026-03-22
**Target:** `_bmad-output/planning-artifacts/prd-validation-report.md` (Step V-06 section)

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | 4개 체인 전부 정확한 PRD 라인 참조 (L312-327, L500, L1253-1260, L1304-1335, L1337-1351). FR30-32, FR-OC1-11 개별 ID 명시. Gap에 L1254-1260, L1314 이중 근거. Traceability matrix에 10 Journey × 8 Scope × 18 SC 수치 명시. |
| D2 완전성 | 15% | 8/10 | 4개 체인 체계적 검증 + Orphan 분석 (FR 0, SC 0, Journey→FR 1). 사소한 gap 2개: (1) NFR→SC 추적 체인 미검사 — 76 NFRs가 어떤 SC를 지원하는지 역추적 없음. (2) 29개 cross-cutting FRs의 "business objective" 추적이 명시적이지 않음 (예: FR40-45 → SEC 도메인 요구사항 → Go/No-Go #9 등 구체적 매핑 부재). |
| D3 정확성 | 25% | 9/10 | Gap 검증 완료: FR30-32는 편집/뷰만, FR-OC1-11은 /office PixiJS만 — NEXUS 실시간 색상 FR 0건 ✅. Chain 1 (ES→SC) 6/6 매핑 정확 ✅. Chain 4 (Scope→FR) 전부 정확 ✅. Journey Requirements Summary L1314의 "NEXUS 실시간 노드 색상 (4색)" 명시 확인 ✅. FR count 123 V-05와 일치 ✅. |
| D4 실행가능성 | 20% | 8/10 | FR-OC12 추가 또는 FR32 확장 권고 명확. 구체적 FR 문구 제안 포함. 개선: Cross-point table (L1349)이 이미 아키텍처 가이드 제공 — /ws/agent-status(기존) → NEXUS, /ws/office(신규) → PixiJS. 이 WebSocket 채널 분리를 FR 초안에 반영하면 Architecture 단계 혼선 방지. |
| D5 일관성 | 15% | 9/10 | FR count 123, NFR 76, Go/No-Go 14개 전 단계 일치. V-04 gap (keyboard agent selection, CLI token leak)과 중복 없이 독립적 gap 발견. Journey 번호 체계 Brief와 정합. |
| D6 리스크 | 10% | 7/10 | Gap impact Low-Medium 평가 적절. 그러나 2개 리스크 미언급: (1) Sprint 경계 교차: NEXUS는 Phase 3 산출물이나 실시간 색상 데이터는 Sprint 4 인프라(/ws/agent-status 확장) — scope creep 위험. (2) "degraded" 상태 provenance: Brief 5상태 외 PRD 추가 상태이므로 traceability observation으로 기록 필요. |

## 가중 평균: 8.45/10 ✅ PASS

계산: (9×0.15)+(8×0.15)+(9×0.25)+(8×0.20)+(9×0.15)+(7×0.10) = 1.35+1.20+2.25+1.60+1.35+0.70 = **8.45**

---

## Analyst 질문에 대한 답변

### Q1: Category-level traceability matrix — 개별 FR→Journey 매핑 필요?

**Category-level 충분. 개별 매핑 불필요.**

근거:
- Journey Requirements Summary (L1304-1335)가 이미 **역방향** 매핑 제공 (Journey→FR)
- Category-level matrix (L527-550)가 **정방향** 매핑 제공 (FR Category→Journey)
- 양방향 합치면 123 FRs 전부의 추적 경로 도출 가능
- 개별 FR→Journey 123건 나열은 validation report 목적에 비해 과잉

**단, 1개 개선 권고**: 29개 cross-cutting FRs (FR8-9, FR38, FR40-45 등)의 "business objectives" 추적이 현재 추상적. 구체적 매핑 추가 권장:

| Cross-cutting FR 그룹 | Business Objective | 근거 |
|----------------------|-------------------|------|
| FR40-45 (Security) | SEC 도메인 요구사항, Go/No-Go #9/#11 | L1356+ |
| FR8-9 (Error handling) | SC-v2-9 (에러 시 명확한 피드백) | L457 |
| FR38 (Tier budget) | SC-v2-1 (CEO 조직 설계) | L448 |
| FR48-49 (ARGOS cron) | SC-v2-5 (음성 브리핑) | L452 |
| FR-TOOLSANITIZE1-3 | Go/No-Go #11 (Tool sanitization) | L467 |

이 정도면 cross-cutting FR 추적 완결.

### Q2: Journey cross-points (L1337-1351) — 별도 체인 검증?

**별도 체인 불필요. 기존 Chain 3 (Journey→FR) 보강 자료로 활용.**

Cross-points는 **체인이 아님** — 여정 간 공유 데이터/공유 페르소나의 일관성 검증. Chain 3을 강화하는 보조 검증 역할:

- Cross-point "J9 /office ↔ NEXUS 실시간 상태" (L1349)가 **이번 Gap 발견의 핵심 근거**로 작동 — 공유 데이터 파이프라인은 명시되었으나 소비자(NEXUS) FR이 없음을 드러냄.
- Cross-point의 아키텍처적 가치: 공유 데이터 소스 (`activity_logs → /ws/agent-status`) 명시로 Architecture 단계에 바로 활용 가능.

**권고**: Cross-points 검증 결과를 Chain 3 섹션 내 보조 분석("Journey Cross-Point Verification")으로 포함. 별도 Chain 5로 만들면 과잉.

### Q3: "degraded" 상태 — traceability observation으로 기록?

**예, traceability observation으로 기록해야 함.**

PRD L1258: "PRD 추가 상태 (Brief 5상태 외 운영 모니터링용, 사장님 결정 2026-03-20)"

분석:

| 항목 | Brief (5상태) | PRD (6상태) | 판단 |
|------|-------------|------------|------|
| idle | ✅ L171, L432 | ✅ L1255 | 일치 |
| working | ✅ L171, L432 | ✅ L1256 (working+speaking+tool_calling 통합) | NEXUS 통합 표시 — 합리적 |
| speaking | ✅ L171, L432 | NEXUS: working에 통합 / /office: 별도 | 계층별 표현 차이 ✅ |
| tool_calling | ✅ L171, L432 | NEXUS: working에 통합 / /office: 별도 | 계층별 표현 차이 ✅ |
| error | ✅ L171, L432 | ✅ L1257 | 일치 |
| **degraded** | ❌ 없음 | ✅ L1258 (PRD 추가) | **Traceability observation** |

**판단**: Brief 위반 아님. PRD가 Brief을 **확장**한 것이며 모순 없음. Provenance 명확 ("사장님 결정 2026-03-20"). NRT-1 (L1512), NRT-2 (L1513)에서 heartbeat 15초 → degraded → 30초 → error 전환 로직까지 정의.

**기록 방식**: "PRD Extended State: `degraded` — Brief 5상태 외 운영 모니터링 확장. Source: 사장님 결정 2026-03-20. PRD L1258, NRT-1 L1512, NRT-2 L1513 참조. Brief 향후 업데이트 시 반영 권고."

---

## 이슈 목록

### 1. [D6 리스크] Sprint 경계 교차 — NEXUS 실시간 색상의 Scope Creep 위험

NEXUS 조직도는 **Phase 3 (Growth-A)** 산출물 (FR30-32). 그러나 실시간 노드 색상은 **Sprint 4** 데이터 인프라 (agent status WebSocket)에 의존.

| 측면 | Phase 3 NEXUS | Sprint 4 실시간 | 충돌 |
|------|-------------|---------------|------|
| 구현 시점 | Phase 3 | Sprint 4 | NEXUS Phase 3 완료 후 Sprint 4에서 색상 기능 추가? |
| WebSocket 의존 | 없음 (정적 렌더링) | /ws/agent-status | Phase 3 NEXUS에 WS 구독 기능 선행 구현? |
| 테스트 | NEXUS CRUD | 실시간 상태 반영 | 별도 테스트 세트 |

**권고**: FR-OC12 (또는 FR32 확장) 작성 시 Sprint 4로 명시하고, Phase 3 NEXUS는 정적 뷰만 포함. "Sprint 4에서 NEXUS 뷰에 실시간 상태 색상 오버레이 추가" 형태로 점진적 확장.

### 2. [D4 실행가능성] FR 초안에 WebSocket 채널 명시

Analyst의 FR-OC12 초안에 `/ws/agent-status` 활용 명시 있으나, Cross-point table (L1349) 분석 기반으로 보강:

**보강된 FR 초안:**
```
FR-OC12: [Sprint 4] NEXUS 조직도에서 에이전트 노드가 실시간 상태 색상
(idle 파란/active 초록/error 빨간/degraded 주황)으로 표시된다.
데이터 소스: 기존 /ws/agent-status WebSocket (/ws/office 아님).
NEXUS는 Brief 5상태를 4색으로 매핑한다 (working+speaking+tool_calling → active 초록).
> Architecture: NRT-1 상태 모델, NRT-2 heartbeat 로직 참조.
```

/ws/office가 아닌 /ws/agent-status를 사용하는 이유: /ws/office는 PixiJS 전용 렌더링 페이로드(위치·애니메이션) 포함으로 NEXUS에 불필요한 데이터 전송.

### 3. [D2 완전성] NFR→SC 역추적 — 사소한 보완

76 NFRs 중 Success Criteria를 직접 지원하는 NFR이 다수 존재:
- NFR-P1~P15 → SC-v3-7 ("CEO가 AI 팀 활동을 본다" — 3초 로드 요건)
- NFR-S1~S10 → Business objective (보안)
- NFR-A1~A7 → SC-v3-2 ("Big Five 슬라이더 직관적" — 접근성)

Category-level 확인이면 충분. 개별 76건 역추적 불필요. 단, NFR 카테고리별 SC 링크를 Traceability Matrix에 추가하면 완결.

---

## 검증 결과 요약

| 검증 항목 | 결과 |
|----------|------|
| Chain 1 (ES→SC) 6/6 매핑 | ✅ (L312-327 → L479-500 전부 대조 확인) |
| Chain 2 (SC→Journey) 18/18 | ✅ (10 v2 + 8 v3 전부 Journey 연결 확인) |
| Chain 3 (Journey→FR) 10/10 여정 | ✅ (9/10 완전 커버, J9 1건 gap 실재) |
| Chain 4 (Scope→FR) 8/8 Scope | ✅ (전부 FR 커버리지 확인) |
| Gap (NEXUS 실시간 색상) | ✅ Gap 실재 — FR30-32 편집/뷰만, FR-OC1-11 PixiJS만 |
| Journey Summary L1314 명시 | ✅ "NEXUS 실시간 노드 색상 (4색)" 명시 확인 |
| Cross-point L1349 아키텍처 | ✅ /ws/agent-status → NEXUS, /ws/office → PixiJS 분리 |
| FR count 123 일관성 | ✅ V-05와 동일 |
| Orphan FR 0건 | ✅ 82 직접 + 29 cross-cutting + 12 지원 = 123 |
| "degraded" 상태 provenance | ✅ L1258 사장님 결정 2026-03-20 확인 |

## Cross-talk 결과

### John Cross-talk (V-06)

**Q1: Sprint 4 scope 분리** → **합의**
- NEXUS 편집(FR30-32) = Phase 3 정적 CRUD. 실시간 색상(FR-OC12) = Sprint 4 동적 렌더링. 구현 경로 완전 별도.
- /office PixiJS + NEXUS React Flow 모두 `/ws/agent-status` 구독 → Architecture에서 공유 상태 관리 동시 설계.

**Q2: "degraded" CEO 가치** → **충분히 확인**
- 4색 신호등 스펙트럼 = CEO 가시성 차별화. 내부 heartbeat 수치 미노출.
- Architecture에서 degraded 판정 기준 + CEO/Admin 정보 수준 차이 정의.

### Quinn Cross-talk (V-06)

**Q1: /ws/agent-status for NEXUS** → **합의**
- `/ws/agent-status`: 상태 이벤트만 → NEXUS + Hub. `/ws/office`: 상태 + PixiJS 렌더링 페이로드 → /office 전용.
- 두 채널이 동일 소스(activity_logs)에서 동일 상태 수신, payload만 다름을 테스트.

**Q2: degraded 보안** → **운영 신호, 보안 상태 아님**
- 3 sanitization chains는 상태 무관 항상 실행. degraded 장시간 유지 시 세션 타임아웃 = Architecture 범위.

**Q3: 점진적 테스트** → **합의**
- Phase 3: 정적 NEXUS만. Sprint 4: WebSocket 구독 + 동적 스타일 테스트 추가.

**Traceability matrix granularity** → **Category-level 충분** (Winston/Quinn 합의)
- 양방향 추적 존재 (Category matrix + Journey Requirements Summary). Solo dev에 123행 row-level 과도.

---

## [Verified] R2 Score — 8.90/10 ✅ PASS

| 차원 | R1 | R2 | 변동 근거 |
|------|-----|-----|---------|
| D1 구체성 | 9 | 9 | 변동 없음 — FR-OC12 초안에 hex 색상값까지 명시 |
| D2 완전성 | 8 | 9 | +1: NFR→SC informational table 6개 카테고리 추가, FR-TOOLSANITIZE J10→J4 정정, cross-cutting FR traceability 보강 |
| D3 정확성 | 9 | 9 | 변동 없음 — FR-TOOLSANITIZE 정정으로 정확성 향상 확인 |
| D4 실행가능성 | 8 | 9 | +1: FR-OC12에 /ws/agent-status 명시, hex 색상값, 연결끊김 fallback(회색 #9CA3AF + 재연결 배너), Sprint scope 명시 |
| D5 일관성 | 9 | 9 | 변동 없음 |
| D6 리스크 | 7 | 8 | +1: Scope creep 경고 추가, Sprint 경계 명시, 연결끊김 fallback 정의 |

**Verified weighted avg:** (9×0.15)+(9×0.15)+(9×0.25)+(9×0.20)+(9×0.15)+(8×0.10) = 1.35+1.35+2.25+1.80+1.35+0.80 = **8.90/10 ✅ PASS**

전수 검증: FR-TOOLSANITIZE J10→J4 정정 ✅, FR-OC12 /ws/agent-status+hex+fallback ✅, NFR→SC 6개 카테고리 ✅, degraded 6th state notation ✅, Sprint scope clarification ✅, PRD Strength note 업데이트 ✅.
