# Critic-C Review — Step 08 Scoping & Phased Development

**Reviewer**: Bob (Scrum Master / Product + Delivery)
**Date**: 2026-03-21
**File**: `_bmad-output/planning-artifacts/prd.md` L1949–2137 + L2270–2310 (FR Sprint 매핑)
**Rubric**: Critic-C weights (D1=20%, D2=20%, D3=15%, D4=15%, D5=10%, D6=20%)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | Sprint 테이블 4행에 핵심 기능·Go/No-Go·블로커·의존성 전부 명시. 리스크 테이블 확률/영향/Sprint/완화 4컬럼. 오픈소스 패키지 버전+npm 링크 포함. v3 여정 매핑 Sprint×Journey 매트릭스 구체적 |
| D2 완전성 | 8/10 | MVP 전략(2단계), 기능셋(v2 여정+v3 여정), 리스크(기술+시장+리소스+v3 Sprint), 오픈소스(Phase 1~4+Sprint 1~4+직접구현 10건) 전부 커버. FR 26건 Sprint 매핑 완료. 누락: FR-OC2 /ws/office 연결 상한이 Step 07(L1794: 10)과 Step 08(L2277: 50)에서 불일치 |
| D3 정확성 | 8/10 | Sprint 순서 Brief §4 (Layer 3→2→4→1) 완전 일치 ✅. Go/No-Go 8개 Sprint 매핑 정확 ✅. FR-PERS1 0-100 정수(Decision 4.3.1) ✅. **불일치 1건**: /ws/office per-company 연결 상한 10(Step 07 L1794) vs 50(FR-OC2 L2277) |
| D4 실행가능성 | 8/10 | Sprint 순서 근거 4개(변경 범위, 병렬성, DB 의존, 데이터 선행) 기술적으로 타당. Sprint별 독립 롤백 전략 명확. 오픈소스 전략에서 직접 구현 10건(v3 4건 추가) 명확 |
| D5 일관성 | 7/10 | **FR-OC2 연결 상한 불일치** (10 vs 50) — Step 07 통합 목록과 Step 08 FR 사이 모순. Step 06 리스크 7건과 Step 08 리스크 7건이 5건 중복(R1≈PixiJS, R6≈OOM, R7≈sanitization, Reflection 비용, agent_memories) — 중복 자체는 "혁신 리스크 vs 스코프 리스크" 관점 차이로 허용하나, 완화 전략 표현이 미세하게 다름 |
| D6 리스크 | 9/10 | v3 7건 리스크 전부 확률/영향/Sprint/완화 매핑. Sprint 2 과부하 별도 행. advisory lock 반영(Step 06 수정). Sprint별 독립 롤백 + Sprint 2.5 분할 가능 명시. 매우 우수 |

---

## 가중 평균: 8.30/10 ✅ PASS (Grade B)

계산: (9×0.20) + (8×0.20) + (8×0.15) + (8×0.15) + (7×0.10) + (9×0.20) = 1.80 + 1.60 + 1.20 + 1.20 + 0.70 + 1.80 = **8.30**

---

## 이슈 목록

### 1. **[D5 일관성] FR-OC2 /ws/office 연결 상한 불일치** — HIGH
- Step 07 통합 목록 L1794: "per-company 연결 상한 **10**"
- Step 08 FR-OC2 L2277: "회사별 최대 **50**개 동시 연결"
- 10명 vs 50명은 인프라 설계에 직접 영향 (메모리, 브로드캐스트 부하)
- **요청**: 하나로 통일. Delivery 관점 의견: 초기 MVP는 10으로 시작하고 Phase 5+에서 확장하는 게 안전. 또는 50이 맞다면 Step 07 L1794를 50으로 정정. 어느 쪽이든 통일 필수

### 2. **[D5 일관성] Step 06 vs Step 08 리스크 중복 표현 불일치** — MEDIUM
- Step 06 L1667: "tree-shaking 6개 클래스만. 실패 시 Canvas 2D 최소 구현 (**번들 0KB 추가**)"
- Step 08 L2061: "tree-shaking 6개 클래스. 실패 시 Canvas 2D 최소 구현" (번들 0KB 미언급)
- Step 06 L1671: "advisory lock으로 동시 실행 방지"
- Step 08 L2062: "advisory lock" 포함
- 중복 리스크 5건의 **완화 전략이 양쪽에서 미세하게 다른 수준으로 기술됨**
- **요청**: Step 08 리스크 테이블에 "상세: Step 06 혁신 리스크 참조" 주석 1줄 추가하여 단일 소스 명확화. 또는 Step 08 완화 전략을 Step 06과 동일 수준으로 맞춤

### 3. **[D2 완전성] 오픈소스 전략에 Sprint 3 Gemini Embedding 재활용 미명시** — LOW
- Sprint 3 Memory Reflection은 Gemini Embedding (text-embedding-004)을 사용하는데, 오픈소스 테이블(L2105-2113)에 Sprint 3 행이 없음
- Phase 4에 @google/genai가 이미 있고, Sprint 3은 이를 재활용하므로 기술적으로는 맞지만, Sprint 3 행에 "Phase 4 @google/genai 재활용" 주석이 있으면 Sprint Planning에서 의존성 명확
- **요청**: Sprint 3 행 1줄 추가: "| @google/genai (Phase 4 재활용) | Reflection embedding + 유사도 검색 | Sprint 3 | 기존 인프라 재활용 |"

### 4. **[D4 실행가능성] llm-cost-tracker 삭제 여부 미반영** — LOW
- L2080: Phase 1 오픈소스에 `llm-cost-tracker` 포함
- L1751 (Step 07): "기존 costs.ts/cost-aggregation.ts → v3에서 제거 대상"
- cost tracking 삭제 GATE 결정(2026-03-20)과 모순은 아니지만, v3에서 제거 예정인 기능의 오픈소스 패키지가 여전히 리스트에 있음
- **요청**: L2080에 "~~llm-cost-tracker~~" 취소선 또는 "(v3 제거 대상, GATE 2026-03-20)" 주석 추가

---

## Cross-talk 요청

- **Sally (UX)**: FR-OC2 연결 상한 10 vs 50 — UX 관점에서 CEO가 여러 기기(데스크톱+태블릿)로 동시 접속하는 시나리오가 있는지? 50이면 회사당 50 WS 연결인데 실사용에서 필요한 수치인지 의견 부탁.

---

## 총평

v2 2단계 MVP 기반 위에 v3 Sprint 전략이 체계적으로 구축됨. Sprint 순서 근거(변경 범위→병렬성→DB 의존→데이터 선행)가 Brief §4와 정합하고, 기술적으로 타당. FR 26건 Sprint 매핑 전수 교체 완료. 오픈소스 전략에 v3 직접 구현 4건 추가로 "고유 가치 vs 오픈소스" 경계 명확.

주요 수정: **FR-OC2 연결 상한 통일** (HIGH, Step 07↔Step 08 모순). 나머지 3건은 주석 수준.

---

## Re-Verification (Fixes Applied)

### 검증 결과 (4건 내 이슈 + Sally cross-talk 1건 = 5건)

| # | 이슈 | 상태 | 검증 위치 |
|---|------|------|---------|
| 1 | FR-OC2 연결 상한 불일치 (HIGH) | ✅ 해결 | L1794: "per-company 연결 상한 20, 초과 시 idle 연결 graceful eviction" + L2276: "회사별 최대 20개 동시 연결 (초과 시 idle 연결 graceful eviction)" — 양쪽 동일 수치 + 동일 eviction 전략 |
| 2 | Step 06↔08 리스크 중복 표현 (MEDIUM) | ✅ 해결 | L2057: "§Innovation 혁신 리스크 참조" 주석 추가 — 단일 소스 명확화 |
| 3 | Sprint 3 Gemini Embedding 재활용 (LOW) | ✅ 해결 | L2107: "Phase 4 @google/genai 재활용 \| Memory: observations/reflections 벡터화 (Gemini Embedding, Epic 10 인프라 재활용) \| Sprint 3" 행 추가 |
| 4 | llm-cost-tracker v3 제거 미반영 (LOW) | ✅ 해결 | L2077: "(v3 제거 대상 — CLI Max 월정액, GATE 2026-03-20)" 주석 추가 |
| 5 | Sally cross-talk: 연결 상한 수치 | ✅ 해결 | Sally 분석(CEO 2 + Admin 1 + Humans ~8 = ~11 peak) 기반 → 20 + graceful eviction 합의. L1794 + L2276 양쪽 반영 |

### 타 Critic 수정사항 교차 확인

| 수정 | 상태 | 검증 |
|------|------|------|
| Sprint 2.5 분할 트리거 조건 명시 | ✅ | L2061: "분할 트리거: Sprint 2 중간 리뷰 시점에 인프라 트랙 미완료 시 워크플로우 트랙을 Sprint 2.5로 이월" |
| Sprint 1 지연 시 n8n 병렬 착수 근거 | ✅ | L2062: "Sprint 2 n8n Docker는 soul-enricher.ts 비의존(독립 컨테이너) → Sprint 1 미완료 시에도 n8n 인프라 트랙 병렬 착수 가능" |
| pg-boss 조건부 채택 | ✅ | L2108: "조건부 — 아키텍처에서 스케줄링 전략 확정 후 채택 여부 결정" + 대안 "크론 오프셋 또는 직접 큐 구현" |
| @pixi/tilemap vs pixi-tiledmap 선택 명시 | ✅ | L2111-2112: 양쪽 옵션 + "Sprint 4 착수 시 에셋 파이프라인에 따라 확정" |

### Re-Score

| 차원 | 초기 | 수정 후 | 변화 근거 |
|------|------|--------|---------|
| D1 구체성 | 9 | 9 | 유지. Sprint 2.5 트리거 조건, 병렬 착수 근거 추가로 강화 |
| D2 완전성 | 8 | 9 | Sprint 3 Gemini 재활용 행 추가 + llm-cost-tracker v3 주석. 오픈소스 전략 Sprint 1~4 전부 커버 |
| D3 정확성 | 8 | 9 | 연결 상한 불일치 해소 (양쪽 20 통일). Sprint 순서·Go/No-Go·FR 매핑 전부 정합 |
| D4 실행가능성 | 8 | 9 | pg-boss 조건부 + 대안 명시, @pixi/tilemap 선택 기준 명시. Sprint 2.5 트리거 구체화 |
| D5 일관성 | 7 | 9 | 연결 상한 통일 (HIGH 해소) + 리스크 중복 §Innovation 참조로 단일 소스 + Step 07↔08 전부 정합 |
| D6 리스크 | 9 | 9 | 유지. Sprint 2.5 트리거·Sprint 1 병렬 착수 추가로 강화 |

### 가중 평균: 9.00/10 ✅ PASS (Grade A)

계산: (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00**

---

## 총평 (수정 후)

9건 수정 전부 정확히 반영됨. 특히 HIGH 이슈(FR-OC2 연결 상한)가 Sally UX 분석 + Bob Delivery 의견 종합하여 20 + graceful eviction으로 합리적 결론. Step 06↔07↔08 3개 Step 간 일관성이 완벽히 확보됨. Sprint 2.5 트리거·Sprint 1 병렬 착수 등 실행 세부사항도 구체화되어 Sprint Planning 진입 준비 완료.
