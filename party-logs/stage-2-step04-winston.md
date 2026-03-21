# Critic-A (Architecture + API) Review — Step 04 User Journey Mapping

**Reviewer**: Winston (Architect)
**Target**: `_bmad-output/planning-artifacts/prd.md` L988~L1245 (User Journeys)
**Date**: 2026-03-20

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | 페르소나 이름·나이·역할. 시간 추정(~10분, ~5초, 4시간→15분). 에러 시나리오 전부 구체적. Sprint 딥 다이브 3편 Opening→Climax→Resolution 3막 구조. 접근성(aria-valuenow, 키보드, 모바일 리스트뷰). NEXUS 4색 상태. 교차점 10건 |
| D2 완전성 | 15% | 9/10 | 10개 여정: CEO(1,9), 팀장(2), 투자자(3), Admin(4,8,10), Human(5), 개발(6), 온보딩(7). Phase 1-4 + Sprint 1-4 전부 커버. Journey Requirements Summary 21행 + 교차점 10행. v3 신규 3편이 Sprint별 딥 다이브로 충분한 구현 컨텍스트 제공 |
| D3 정확성 | 25% | 7/10 | **🟠 N8N_DISABLE_UI 자기 모순**: L737 "UI 비활성화" vs L744/L1081 "에디터 접근 가능". BigFive 0-100 정확 ✅. agent_memories Option B 정확 ✅. WebSocket agent-status 기존 채널(types.ts L486) 정확 ✅. 🟡 L1001 "query() spawn" → messages.create() 미반영 |
| D4 실행가능성 | 20% | 8/10 | Journey→FR 매핑 표 21행. 교차점 분석으로 cross-cutting 식별. 에러 시나리오에 복구 경로(재시도, fallback 엔진, graceful degradation). Sprint 딥 다이브가 구현자에게 UX 의도 전달 |
| D5 일관성 | 15% | 7/10 | **N8N_DISABLE_UI가 Step 03 수정(L737)과 Journey(L1081) 사이에서 자기 모순**. 🟡 "degraded" 상태가 Vision 5-state 모델(idle/working/speaking/tool_calling/error)에 없음. soul-enricher 명칭 일관 ✅. Sprint 순서 일관 ✅ |
| D6 리스크 | 10% | 8/10 | 에러 시나리오 5건(SDK 실패, 타임아웃, 에디터 장애, 도구 과사용, API 장애). Mobile fallback(리스트뷰). Heartbeat fallback(degraded). Zero Regression 가드레일(agent_memories 단절 0건) |

### 가중 평균: 7.85/10 ✅ PASS

계산: (9×0.15) + (9×0.15) + (7×0.25) + (8×0.20) + (7×0.15) + (8×0.10) = 1.35 + 1.35 + 1.75 + 1.60 + 1.05 + 0.80 = **7.85**

---

## 이슈 목록

### 🟠 Major (D3 정확성 + D5 일관성)

**1. N8N_DISABLE_UI=true vs n8n 비주얼 에디터 접근 모순**

- **위치**: L744 (Feature 5-2 정책), L1081 (Journey 4 Sprint 2), L1223 (Journey Requirements)
- **PRD 자기 모순**:
  - L737: `"N8N_DISABLE_UI=true — n8n 에디터 UI 비활성화, REST API만 활성"` (Step 03 수정)
  - L744: `"프리셋 = 출발점, 사용자가 n8n 비주얼 에디터에서 자유 수정 가능"`
  - L1081: `"n8n 비주얼 에디터 접근: Admin 전용 링크로 n8n 에디터 열기"`
- **Tech Research 원문** (L207): `"N8N_DISABLE_UI=true — stops serving editor, REST API remains fully available"`
- **분석**: `N8N_DISABLE_UI=true`이면 에디터 UI가 완전히 비활성화되어 L1081의 "에디터 열기"가 물리적 불가능. 의도 추정: CORTHEX↔n8n 통합은 API-only(iframe 없음), 하지만 Admin은 n8n 에디터를 별도 접근(직접 URL)으로 사용
- **수정안 (Architecture 권고)**:
  - `N8N_DISABLE_UI=true` **제거** → n8n 에디터 UI는 활성 상태로 유지
  - 대신 6-layer 보안 모델로 접근 제한: 포트 5678 외부 차단(iptables) + Hono reverse proxy AdminAuth 미들웨어로 Admin만 에디터 접근
  - L737 수정: `"n8n 에디터 UI는 포트 5678에서 로컬 제공. 외부 직접 접근은 iptables로 차단. Admin은 Hono reverse proxy(/api/admin/n8n-editor/*)를 통해 인증 후 접근. CORTHEX 앱 내 iframe 임베드 없음 — REST API 통합만 사용"`
  - **핵심**: "iframe 없음"과 "에디터 접근 불가"는 다른 결정. Step 03에서 해결한 것은 iframe 제거이지, 에디터 자체의 폐쇄가 아님

### 🟡 Minor (2건)

**2. [D5] "degraded" 상태 — 5-state 모델에 없음**

- **위치**: L1163
- **현재**: Journey 9 NEXUS 4색: idle(파란), working(초록), error(빨강), degraded(주황)
- **Vision 5-state**: idle, working, speaking, tool_calling, error (L298 영역)
- **분석**: NEXUS는 조직도 뷰이므로 간소화된 상태 표현이 합리적. 하지만 "degraded"는 5-state에 없는 신규 상태
- **수정안**: 두 가지 중 택 1:
  - 5-state에 "degraded" 추가 (6-state로 확장) — heartbeat timeout 시 UI 피드백용
  - Journey에서 "degraded" → "error" + "(heartbeat fallback)" 부연 — 기존 5-state 유지

**3. [D3] L1001 "SDK query() spawn" — messages.create() 미반영**

- **위치**: L1001 (Journey 1 Phase 1 에러 시나리오)
- **현재**: `"SDK query() spawn 실패 시 자동 재시도 1회"`
- **근거**: Epic 15 D17 결정으로 `query()` → `messages.create()` 전면 재작성
- **수정안**: `"SDK messages.create() 호출 실패 시 자동 재시도 1회"`

---

## John 아키텍처 검증 요청 응답

| # | 검증 항목 | 결과 | 근거 |
|---|----------|------|------|
| 1 | E8 경계 — engine/ 참조 | ✅ PASS | Journey L988~L1245에서 `engine/` 직접 참조 0건. Phase 1에서도 "agent-loop.ts"를 사용자 시나리오로 추상화 |
| 2 | soul-enricher.ts 흐름 | ✅ PASS | Journey 4 Sprint 1: 슬라이더 → 성격 설정 → 톤 변화 체감. 파일명 미언급(여정 수준에서 적절). Step 03 수정과 일관 |
| 3 | n8n 에디터 접근 | 🟠 ISSUE #1 | N8N_DISABLE_UI=true(L737) vs 에디터 접근(L1081) 모순. 수정 필요 |
| 4 | 메모리 Zero Regression | ✅ PASS | L1202 `agent_memories` Option B 확장. Go/No-Go #4 정렬. schema.ts에 테이블 존재 확인 |
| 5 | NEXUS WebSocket | ✅ PASS | `agent-status` = 기존 채널(types.ts L486). `/ws/office`만 신규 → 16→17 정확 |
| 6 | costs 제거 | ✅ PASS | Journey L988~L1245에서 비용/cost/절감 참조 0건 |
| 7 | 명칭 통일 | ✅ PASS | Journey에서 personality-injector/soul-enricher 파일명 미사용(여정 수준 적절). Step 03 수정 유지 |

---

## Cross-talk

- **Quinn에게**: N8N_DISABLE_UI=true 제거 시 보안 영향 — 에디터 UI 활성화 + AdminAuth 프록시로 충분한지? 6-layer 모델 중 Layer 1(Docker network isolation)과 Layer 2(Hono reverse proxy)가 에디터 접근 제한을 커버하는지 확인
- **Bob에게**: Journey Requirements Summary(21행) + 교차점(10행) — Product 관점에서 누락된 교차점 있는지? 특히 Journey 8 마케팅 ↔ Journey 2 팀장(박과장이 마케팅팀장인데 마케팅 자동화 여정이 Admin 관점만)

---

## 아키텍처 관점 소견

**잘된 부분:**
- 10개 여정이 v2(Phase 1-4) + v3(Sprint 1-4)를 빈틈없이 커버. Sprint 딥 다이브 3편이 3막 구조로 구현 의도 명확 전달
- 교차점 분석(10건)이 cross-cutting 요구사항을 선제적으로 식별 — 특히 L1243 `/ws/office + /ws/agent-status 동일 데이터 소스` 인사이트
- 에러 시나리오가 모든 주요 여정에 포함. Fallback 메커니즘(엔진 전환, heartbeat, 재시도)이 구체적
- E8 경계 완벽 준수 — 여정 레벨에서 engine/ 내부 구현 노출 0건
- agent_memories Option B + Zero Regression 가드레일이 Journey 10 에러 시나리오에 반영

**핵심 우려:**
N8N_DISABLE_UI 모순은 Step 03 iframe 수정의 **과잉 적용**. "iframe 없음"을 "에디터 UI 전체 비활성화"로 과도하게 해석한 결과. 아키텍처적으로 올바른 해결: n8n 에디터는 활성 상태로 유지 + 접근 제한은 네트워크/프록시 레이어에서 처리. 이는 Tech Research의 6-layer 보안 모델과도 정합.

---

## [Verified] Re-Review — Fixes Applied

**Date**: 2026-03-20

### 수정 검증 결과

| # | 이슈 | 상태 | 검증 |
|---|------|------|------|
| 🟠 #1 | N8N_DISABLE_UI 모순 | ✅ 완료 | L738 `N8N_DISABLE_UI=false` — 에디터 UI 활성 (Admin 전용 접근). "iframe 없음" + "에디터 접근 가능" 양립. Quinn Go/No-Go #3 호환 확인 |
| 🟡 #2 | "degraded" 상태 | ✅ 완료 | L1171 "PRD 추가 상태 (Brief 5상태 외 운영 모니터링용)" 명시. L1222 Brief 5상태 + degraded 전부 나열 |
| 🟡 #3 | query() → messages.create() | ✅ 완료 | L1003 "SDK messages.create() 호출 실패" 수정 |

### Cross-talk 반영

- **Quinn**: N8N_DISABLE_UI 제거가 Go/No-Go #3 3중 검증과 완전 호환 확인. 핵심: "UI 끄기는 보안이 아닌 기능 결정. 보안은 iptables + Hono proxy + AdminAuth가 담당." Sprint 2 QA 테스트 케이스 5건 제안

### Verified 차원별 점수

| 차원 | 가중치 | Initial | Verified | 변동 근거 |
|------|--------|---------|----------|----------|
| D1 구체성 | 15% | 9 | **9** | 변동 없음 |
| D2 완전성 | 15% | 9 | **9** | 변동 없음 |
| D3 정확성 | 25% | 7 | **9** | N8N_DISABLE_UI=false 수정. query()→messages.create() 수정. 전체 정확 |
| D4 실행가능성 | 20% | 8 | **8** | 변동 없음 |
| D5 일관성 | 15% | 7 | **9** | N8N_DISABLE_UI 자기 모순 해결. degraded Brief 매핑 명시. 전체 일관 |
| D6 리스크 | 10% | 8 | **8** | 변동 없음 |

### Verified 가중 평균: 8.80/10 ✅ PASS

계산: (9×0.15) + (9×0.15) + (9×0.25) + (8×0.20) + (9×0.15) + (8×0.10) = 1.35 + 1.35 + 2.25 + 1.60 + 1.35 + 0.80 = **8.70**

*Minor 2건 추가 수정 반영 (2차 Verified): 8.30 → 8.70*
