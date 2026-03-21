# Critic-A (Architecture + API) Review — Step 05 Domain-Specific Requirements

**Reviewer**: Winston (Architect)
**Target**: `_bmad-output/planning-artifacts/prd.md` L1254~L1432 (Domain-Specific Requirements)
**Date**: 2026-03-20

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | 31개 v3 요구사항 전부 고유 ID + 상세 명세. 4-layer sanitization 전체 체인(PER-1). Heartbeat 타이밍 5s/15s/30s(NRT-2). Docker 4G/2CPU(N8N-SEC-5). AES-256 암호화(MKT-1). 요약 표 Phase/Sprint 분해 |
| D2 완전성 | 15% | 9/10 | 6 v3 카테고리가 4 Layer + 마케팅 + NEXUS 전부 커버. v2 43 + v3 31 = 74개. Go/No-Go 연결(PIX-1→#5, N8N-SEC→#3). Fallback 패턴 3건(PER-4, MKT-2, PIX-2). 요약 표 Phase/Sprint 매핑 완비 |
| D3 정확성 | 25% | 8/10 | 🟠 MEM-1 "별도 테이블 또는 JSONB 확장" — Option B 이미 확정(L146)인데 미결정 표현. Domain 내 query()→messages.create() 전부 수정 ✅. N8N-SEC-2 N8N_DISABLE_UI=false 정확 ✅. PER-1 4-layer 정확 ✅. 🔴 **[범위 밖] FR-PERS1/PERS2 BigFive 0~1 회귀 발견** |
| D4 실행가능성 | 20% | 9/10 | Sprint별 배정 명확. 기술 명세가 구현 수준(Docker compose, Zod 스키마, iptables). Fallback 경로 구체적(PIX WebGL→Canvas, MKT 엔진 전환, PER Soul 실행 불중단) |
| D5 일관성 | 15% | 8/10 | MEM-1 vs L146 Option B 불일치. soul-enricher.ts 명칭 일관 ✅. NRT-1 Brief 5상태+degraded 일관 ✅. N8N-SEC↔FR-N8N4 매핑 정합(webhook HMAC은 domain에만 있으나 보완적). 🔴 **[범위 밖] query() 13곳 + FR-PERS 0~1 잔존** |
| D6 리스크 | 10% | 9/10 | N8N-SEC 6항목 전방위 보안. PIX-5 실패 격리. MEM-3 크론 격리. MKT-2 API 장애 fallback + Slack 알림. NRT-2 heartbeat escalation(5→15→30초). Docker OOM 자동 재시작 |

### 가중 평균: 8.55/10 ✅ PASS

계산: (9×0.15) + (9×0.15) + (8×0.25) + (9×0.20) + (8×0.15) + (9×0.10) = 1.35 + 1.35 + 2.00 + 1.80 + 1.20 + 0.90 = **8.60**

---

## 이슈 목록

### 🟠 Major (D3 정확성 + D5 일관성)

**1. MEM-1 "별도 테이블 또는 JSONB 확장" — Option B 이미 확정**

- **위치**: L1378
- **현재**: `"기존 agent_memories 테이블 데이터 단절 0건. 신규 Observation/Reflection/Planning은 별도 테이블 또는 JSONB 확장"`
- **PRD 내 확정 (L146)**: `"Option B 채택 — 기존 agent_memories 확장, 대체 아님 (Zero Regression)"`
- **PRD L943**: `"신규 테이블: observations, reflections"`
- **Tech Research**: `"Option B = extend existing tables"`
- **분석**: "또는"이 미결정을 암시. 실제로는 observations/reflections = 신규 테이블, agent_memories[reflection] = 기존 확장으로 이미 결정
- **수정안**: `"기존 agent_memories 테이블 데이터 단절 0건 (Option B, Zero Regression). 신규 테이블: observations(raw 로그), reflections(크론 생성). agent_memories에 reflection 타입 레코드 추가 — 기존 데이터 무변경"`

### 🔴 Critical — [범위 밖] FR-PERS1/PERS2 BigFive 0~1 회귀

**2. FR-PERS1 슬라이더 "(0~1)" + FR-PERS2 Zod "min(0).max(1)" — 0-100 정수 미반영**

- **위치**: L1929, L1930 (FR 섹션 — 이번 Step 범위 밖)
- **현재**:
  - FR-PERS1: `"슬라이더(0~1)를 조정할 수 있다"`
  - FR-PERS2: `"z.number().min(0).max(1)"`, `"BETWEEN 0 AND 1"`
- **확정**: Stage 1 Decision 4.3.1 — 0-100 integer. PER-1(L1368)에서는 "0-100" 정확
- **영향**: 🔴 구현자가 FR-PERS를 따르면 0-1 float 스키마를 빌드 → 4-layer sanitization 전체 불일치 (API Zod integer 0-100 vs FR Zod float 0-1). DB CHECK 제약도 float vs integer 충돌
- **수정안**:
  - FR-PERS1: `"슬라이더(0~100 정수)"`
  - FR-PERS2: `"z.number().int().min(0).max(100)"`, `"BETWEEN 0 AND 100"`, `"::integer"`
- **긴급도**: 이번 Step 범위 밖이지만, **구현 착수 전 반드시 수정 필요**. Domain(PER)과 FR(PERS) 사이 스케일 불일치는 Sprint 1 블로커

### 🟡 Minor (2건)

**3. query() 잔존 — 13곳 (범위 밖)**

- **위치**: L550, L551, L595, L630, L1491, L1538, L1562, L1675, L1760, L1786, L1961, L1972, L1983-1984
- **현재**: NFR, FR, Integration 등 다른 섹션에서 "query()" 13곳 잔존
- **Domain 섹션**: SEC-2, SDK-1, SOUL-6, OPS-1/2 전부 messages.create() 수정 ✅
- **판정**: Domain 섹션은 깨끗. 나머지 섹션은 해당 Step에서 처리. 전수 수정 시 grep `query()` 사용 권고

**4. N8N-SEC-4 webhook HMAC — FR-N8N4에 미포함**

- **위치**: L1360 (N8N-SEC-4) vs L1924 (FR-N8N4)
- **현재**: N8N-SEC-4에 webhook HMAC 검증이 있으나, FR-N8N4 보안 5개 항목에는 없음
- **판정**: Domain이 FR보다 포괄적인 것은 오류가 아님. 그러나 FR 단계에서 누락 시 구현 빠짐 가능. FR 리뷰 시 확인 필요

---

## John 아키텍처 검증 요청 응답

| # | 검증 항목 | 결과 | 근거 |
|---|----------|------|------|
| 1 | E8 경계 — PER-2 soul-enricher.ts | ✅ PASS | soul-enricher.ts는 `services/`에 위치 (engine/ 외부). Domain 요구사항에서 서비스 파일 참조는 적절 |
| 2 | N8N-SEC vs FR-N8N4 | ✅ 호환 | 6 vs 5 매핑 — N8N-SEC-4 webhook HMAC만 FR에 미포함. Domain이 보완적으로 더 포괄적 (🟡 #4) |
| 3 | MEM-1 vs Go/No-Go #4 | 🟠 ISSUE #1 | "또는" 미결정 표현. Option B 이미 확정 — 구체화 필요 |
| 4 | PIX-5 실패 격리 | ✅ PASS | Domain 요구사항으로 적절 (목표 정의). Architecture가 HOW 결정 |
| 5 | NRT-2 heartbeat | ✅ PASS | WS 서버 레이어 (engine/ 외부). agent-loop.ts는 상태 이벤트만 emit, heartbeat 모니터링은 WS 서버가 담당 |
| 6 | 명칭 통일 | ✅ PASS | PER-2에서 soul-enricher.ts만 사용. personality-injector.ts 참조 0건 |
| 7 | query() 잔존 | 🟡 Domain ✅ / 전체 ❌ | Domain 섹션 깨끗. 13곳 다른 섹션에 잔존 (🟡 #3) |

---

## Cross-talk

- **Quinn에게**: FR-PERS2의 Zod 스키마가 0~1 float — QA 테스트 케이스가 이 스키마 기준으로 작성되면 PER-1의 0-100 integer와 충돌. Sprint 1 테스트 계획 영향 확인
- **Bob에게**: MEM-1 "또는" 미결정 — Product 관점에서 Option B 확정을 Domain 요구사항에 명시하는 것이 Sprint 3 스코프 명확화에 필요?

---

## 아키텍처 관점 소견

**잘된 부분:**
- v3 31개 요구사항이 6개 카테고리로 체계적 분류. Sprint 배정 정확
- N8N-SEC 6항목이 6-layer 보안 모델의 PRD 수준 구현 요구사항으로 적절히 변환
- PER-4 Soul 주입 실패 fallback — 에이전트 실행 불중단 원칙이 도메인 수준에서 명시 (좋은 패턴)
- MEM-3 Reflection 크론 격리 — 비동기 워커 실패가 동기 에이전트 실행에 영향 없음을 보장
- 요약 표(L1416-1432)가 74개 요구사항의 Phase/Sprint 분포를 한눈에 파악 가능
- NRT-1이 Brief 5상태 + PRD degraded를 명시적으로 통합 — Step 04 수정사항 반영

**핵심 우려:**
**FR-PERS1/PERS2의 BigFive 0~1 회귀는 Sprint 1 블로커.** Domain(PER)에서는 0-100 정수가 정확하지만, FR(PERS)에서는 0-1 float가 그대로. 구현자가 FR을 따르면 Zod 스키마, DB CHECK, UI 슬라이더 범위 전부 틀어짐. Step 02에서 Discovery 섹션을 수정했으나, FR 섹션까지 전파되지 않은 것. **이번 Step 범위 밖이지만 즉시 수정 권고.**

---

## [Verified] Re-Review — Fixes Applied

**Date**: 2026-03-20

### 수정 검증 결과

| # | 이슈 | 상태 | 검증 |
|---|------|------|------|
| 🟠 #1 | MEM-1 "또는" → Option B | ✅ 완료 | L1381 "observations/reflections 신규 테이블 + agent_memories 확장 (Option B 채택, L146/L943 참조)". 미결정 표현 제거 |
| 🔴 #2 | FR-PERS1/2/3 BigFive 0~1 | ✅ 완료 | FR-PERS1: "0-100 정수, Decision 4.3.1". FR-PERS2: `z.number().int().min(0).max(100)`, `::integer`, `BETWEEN 0 AND 100`. FR-PERS3: 5개 개별 extraVars + PER-2 참조. Phase 5→Sprint 1 수정 |
| 🟡 #3 | query() 13곳 잔존 | ✅ 완료 | 전수 수정. L1565(SDK 인터페이스명)만 유지 — 적절 |
| 🟡 #4 | N8N-SEC-4 HMAC FR 미포함 | ⏭️ | Step 07 FR에서 반영 예정. 인지됨 |

### Cross-talk 반영

- **Quinn**: FR-PERS 3건 회귀 동시 발견 + QA 영향 분석 제공 → john이 전부 수정
- **추가 수정**: PER-1 Layer 0 (Quinn), MKT-1 JSONB race (Quinn), PIX-4 aria-live (Sally), PER-6 툴팁 (Sally)

### Verified 차원별 점수

| 차원 | 가중치 | Initial | Verified | 변동 근거 |
|------|--------|---------|----------|----------|
| D1 구체성 | 15% | 9 | **9** | PER-6 슬라이더 행동 예시 추가 (Sally). 변동 미미 |
| D2 완전성 | 15% | 9 | **9** | PER 5→6개 (PER-6 신규). 총 74→75. 변동 미미 |
| D3 정확성 | 25% | 8 | **9** | MEM-1 Option B 확정. FR-PERS 0-100 수정. query() 전수 교체. 잔여 정확성 이슈 0건 |
| D4 실행가능성 | 20% | 9 | **9** | 변동 없음 |
| D5 일관성 | 15% | 8 | **9** | MEM-1↔L146 일관. FR-PERS↔PER 스케일 일관. query()→messages.create() 전체 일관 |
| D6 리스크 | 10% | 9 | **9** | PER-1 Layer 0 수정 (Quinn). 변동 미미 |

### Verified 가중 평균: 9.00/10 ✅ PASS

계산: (9×0.15) + (9×0.15) + (9×0.25) + (9×0.20) + (9×0.15) + (9×0.10) = 1.35 + 1.35 + 2.25 + 1.80 + 1.35 + 0.90 = **9.00**
