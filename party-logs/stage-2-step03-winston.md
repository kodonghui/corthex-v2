# Critic-A (Architecture + API) Review — Step 03 Success Criteria

**Reviewer**: Winston (Architect)
**Target**: `_bmad-output/planning-artifacts/prd.md` L449~L620, L719~L810, L952~L985
**Date**: 2026-03-20

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 8/10 | Success Criteria 전부 측정 가능(≤10분, 80%+, ≤3클릭). Sprint별 딜라이트 모먼트 구체적. AI 모델 아키텍처 가격·엔진별 비교 상세. 페이지 합치기 작업량(소/중/대) 명시. Nano Banana 2 모델 검증됨(Google, 2026-02 출시) |
| D2 완전성 | 15% | 8/10 | v2 베이스라인(10항) + v3 신규(8항) 모두 포함. Business Success v2 마일스톤 + v3 Sprint 마일스톤 완비. 실패 트리거 v2(5건) + v3(4건) + 대응 전략. GATE 결정(costs 제거) HTML 주석 보존. 메뉴 구조 Admin+CEO 양쪽 완비 |
| D3 정확성 | 25% | 5/10 | **🔴 n8n iframe 모순**: L737 "iframe 임베드" 우선순위 1위 — Tech Research R2 해결: "API-only mode confirmed. No iframe." (N8N_DISABLE_UI=true). PRD 내 5곳(L245, L737, L960, L1332, L1682)에서 iframe 언급. BigFive 0-100 정확 ✅, Nano Banana 2 검증 ✅ |
| D4 실행가능성 | 20% | 8/10 | Sprint별 마일스톤 + Go/No-Go 연결. 실패 트리거별 에스컬레이션 경로(OOM 4G→6G, 번들 tree-shaking→Canvas 2D). 페이지 합치기 Before/After 명확. AI 도구 엔진 Admin 설정 → n8n Switch 노드 구현 경로 |
| D5 일관성 | 15% | 6/10 | **iframe이 Tech Research와 정면 충돌**. `soul-enricher.ts`(PRD) vs `personality-injector.ts`(Tech Research 12회+) 명칭 불일치. Sprint 순서·BigFive 스케일·E8 경계 원칙은 일관 |
| D6 리스크 | 10% | 8/10 | v3 실패 트리거 4건(Sprint 지연, A/B 불가, OOM, 번들 초과) + 구체적 대응. Sprint 독립 실패 격리 원칙 명시. Docker 메모리 에스컬레이션 4G→6G→VPS 스케일 |

### 가중 평균: 6.95/10 ❌ FAIL

계산: (8×0.15) + (8×0.15) + (5×0.25) + (8×0.20) + (6×0.15) + (8×0.10) = 1.20 + 1.20 + 1.25 + 1.60 + 0.90 + 0.80 = **6.95**

---

## 이슈 목록

### 🔴 Critical (D3 정확성 + D5 일관성)

**1. n8n iframe vs API-only 모순 — Tech Research R2 해결사항 위배**

- **위치**: L737 (Feature 5-2 통합 방식), L960 (메뉴 구조)
- **PRD 현재**:
  - L736-738: `"통합 방식 (우선순위 순): 1. iframe 임베드 — Admin packages/admin/src/pages/workflows/ → n8n UI iframe"`
  - L960: `"워크플로우 → n8n 관리 페이지 (iframe 또는 링크)"`
- **Tech Research 확정**:
  - L207: `N8N_DISABLE_UI=true` — API-only 모드
  - L1993: `"R2 | n8n iframe vs API-only | Resolved: API-only mode confirmed. No iframe."`
  - R2는 Stage 1에서 명시적으로 해결(Resolved)된 리스크. iframe은 불가능한 옵션
- **영향**: 구현자가 PRD를 따르면 n8n UI iframe을 빌드 시도 → `N8N_DISABLE_UI=true` 환경에서 빈 페이지 → Sprint 2 시간 낭비
- **추가 파급**: L245, L1332, L1682에도 iframe 언급 (이번 Step 범위 밖이나 동일 패턴)
- **수정안**:
  - L736-738 → `"통합 방식: 1. REST API — GET /api/v1/workflows (n8n REST API) → 목록 + 실행 이력 + CRUD. 2. Webhook — n8n webhook 트리거로 CORTHEX→n8n 자동화 호출"`
  - L960 → `"워크플로우 → n8n 관리 페이지 (REST API 기반 자체 UI)"`
  - iframe 관련 모든 언급에 `<!-- Tech Research R2 Resolved: API-only. iframe 불가 (N8N_DISABLE_UI=true) -->` 주석 추가

### 🟠 Major (D5 일관성)

**2. soul-enricher.ts vs personality-injector.ts 명칭 불일치**

- **위치**: L816, L874, L899, L1692, L1703
- **PRD 현재**: `soul-enricher.ts` — 성격 주입 + 메모리 검색 통합 서비스
- **Tech Research** (12회+ 참조): `personality-injector.ts` — 성격 주입 전용 서비스
  - L711: `packages/server/src/services/personality-injector.ts (NEW)`
  - L758: `personality-injector.ts lives in services/`
  - L1327: 서비스 파일 목록에 `personality-injector.ts (Layer 3)`
  - L1361-L1416: 전체 구현 패턴 `personality-injector.ts` 기준
- **분석**: PRD의 `soul-enricher.ts`가 성격+메모리를 통합한 것은 아키텍처적으로 합리적일 수 있음. 그러나 Tech Research에서 12회+ 참조된 `personality-injector.ts`를 PRD에서 무주석으로 `soul-enricher.ts`로 변경하면 구현자 혼란
- **수정안**: 두 가지 중 택 1:
  - **Option A**: 명칭 통일 — PRD도 `personality-injector.ts` 사용. 메모리 검색은 별도 서비스(`memory-retriever.ts`)
  - **Option B**: 통합 유지 — `soul-enricher.ts` 유지하되, `<!-- Tech Research의 personality-injector.ts를 soul-enricher.ts로 통합. 성격 주입 + 메모리 검색을 단일 서비스로 결합 (Architecture에서 확정) -->` 주석 추가
  - Architecture 권고: **Option B** — soul-enricher가 renderSoul 직전 단일 진입점으로 동작하는 것이 호출 구조상 깔끔

### 🟡 Minor (2건)

**3. [D1] L960 "iframe 또는 링크" 헤징**

- **위치**: L960
- **현재**: `"워크플로우 → n8n 관리 페이지 (iframe 또는 링크)"`
- **문제**: "또는"은 미결정 표현. API-only 확정 후에는 구체적이어야 함
- **수정안**: 이슈 #1 수정 시 자동 해결

**4. [D5] L1521 "query() 래퍼" — messages.create() 재작성 미반영**

- **위치**: L1521 (이번 Step 범위 밖)
- **현재**: `"engine/agent-loop.ts — SDK query() 래퍼"`
- **근거**: Epic 15 D17 결정으로 `query()` → `messages.create()` 전면 재작성됨
- **판정**: 범위 밖. 해당 Step 리뷰에서 다룰 사안이나, cross-cutting으로 사전 공유

---

## Cross-talk

- **Quinn에게**: n8n iframe vs API-only — QA 관점에서 iframe 테스트 케이스가 Sprint 2 테스트 계획에 포함되었을 가능성. API-only 확정이면 테스트 계획도 REST API 기반으로 조정 필요
- **Bob에게**: soul-enricher vs personality-injector 명칭 — Product 관점에서 Tech Research 용어를 PRD에서 변경할 때 주석 필요성 동의 여부?
- **Sally에게**: n8n Admin 페이지 — iframe이 아닌 자체 UI(REST API 기반)로 전환 시 UX 설계 영향. n8n 워크플로우 목록/실행/결과 조회를 자체 UI로 빌드해야 함

---

## 아키텍처 관점 소견

**잘된 부분:**
- Success Criteria가 Sprint별로 정렬되어 각 Sprint 완료 시 검증 가능
- AI 모델 아키텍처(L772-L786)가 깔끔: 대화 모델(Claude 고정) vs 도구 모델(회사별 설정). n8n Switch 노드로 엔진 전환하는 구현 경로 명확
- 실패 트리거가 v2(검증됨) + v3(신규)로 분리되어 기존 안전장치 보존
- CEO앱 페이지 합치기(14→6~8)가 합리적. 작업량 추정(소/중/대) 현실적
- E8 경계: `soul-enricher.ts` → `agent-loop.ts` 1행 훅 삽입만 허용(L899) — 최소 침습 원칙 명확

**핵심 우려:**
n8n iframe은 **해결된(Resolved) 리스크를 PRD가 되살린 것**. Tech Research Stage 1에서 R2로 분류하고, `N8N_DISABLE_UI=true`와 6-layer 보안 모델을 설계하여 API-only로 확정. PRD가 iframe을 우선순위 1로 명시하면, 구현자는 두 문서 사이에서 어느 것을 따를지 혼란. **iframe 제거 + REST API 중심 재구성이 필수**.

---

## [Verified] Re-Review — Fixes Applied

**Date**: 2026-03-20

### 수정 검증 결과

| # | 이슈 | 상태 | 검증 |
|---|------|------|------|
| 🔴 #1 | n8n iframe → API-only | ✅ 완료 | L736 "Stage 1 확정 — API-only, iframe 없음" 명시. L737 `N8N_DISABLE_UI=true` 추가. L738-740 Hono proxy + React 자체 UI + tag 격리 재구성. L965 "Hono reverse proxy API, 자체 React UI". L1687도 "Hono reverse proxy API"로 통일. iframe 잔존 0건 |
| 🟠 #2 | soul-enricher vs personality-injector | ✅ 완료 | L818 personality-injector.ts를 명시적 언급 (두 이름 공존). L822 "Tech Research의 personality-injector.ts 역할을 soul-enricher.ts가 통합 담당 (성격 + 메모리 = 단일 진입점)" 매핑 주석. L898, L904, L911 soul-enricher.ts 일관 사용 |
| 🟡 #3 | "iframe 또는 링크" 헤징 | ✅ 완료 | L965 "Hono reverse proxy API, 자체 React UI"로 구체화. #1 수정 시 자동 해결 |
| 🟡 #4 | query() → messages.create() | ⏭️ 범위 밖 | L1521 영역 라인 이동으로 원본 텍스트 확인 불가. 해당 Step 리뷰에서 확인 |

### Cross-talk 반영

- **Quinn**: iframe 제거 = QA 긍정적 (테스트 범위 축소 + 보안 표면 감소). Go/No-Go #3은 이미 API-only 전제 → 게이트 영향 없음
- **Bob**: 명칭 변경 주석 필수 동의. Go/No-Go 테이블 soul-enricher 통일 포인트 추가 → L822 매핑 주석으로 반영됨

### Verified 차원별 점수

| 차원 | 가중치 | Initial | Verified | 변동 근거 |
|------|--------|---------|----------|----------|
| D1 구체성 | 15% | 8 | **9** | n8n 통합 방식이 구체적으로 재구성 (N8N_DISABLE_UI, Hono proxy, tag isolation, 자체 React UI). 헤징 표현 제거 |
| D2 완전성 | 15% | 8 | **8** | 변동 없음 |
| D3 정확성 | 25% | 5 | **9** | iframe 모순 완전 해결 (5곳 전부). Tech Research R2 + N8N_DISABLE_UI=true 정합. personality-injector↔soul-enricher 매핑 명시 |
| D4 실행가능성 | 20% | 8 | **8** | 변동 없음 |
| D5 일관성 | 15% | 6 | **9** | iframe 통일. soul-enricher 매핑 주석(L822). Tech Research와 정합 확보 |
| D6 리스크 | 10% | 8 | **8** | 변동 없음 |

### Verified 가중 평균: 8.55/10 ✅ PASS

계산: (9×0.15) + (8×0.15) + (9×0.25) + (8×0.20) + (9×0.15) + (8×0.10) = 1.35 + 1.20 + 2.25 + 1.60 + 1.35 + 0.80 = **8.55**
