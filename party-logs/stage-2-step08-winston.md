# Critic-A Review — Step 08 Scoping & Phased Development

> Reviewer: Winston (Architect + API)
> Date: 2026-03-21
> Target: `_bmad-output/planning-artifacts/prd.md` L1949–2113 (Scoping) + L2270–2310 (FR Phase→Sprint 매핑)
> Step: `step-08-scoping.md` — Scoping & Phased Development

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | Sprint 테이블에 Go/No-Go 번호·블로커·의존성 전부 명시. 버전 핀(n8n 2.12.3, pixi.js 8.17.1, @pixi/react 8.0.5, @pixi/tilemap 5.0.2). 리스크에 확률(높/중/낮)·영향(색상 코딩)·Sprint·완화 전부 포함. 여정 매핑 Sprint×기능 매트릭스 구체적. |
| D2 완전성 | 15% | 8/10 | v2 MVP A/B + v3 Sprint 1~4 전부 커버. v2 Phase 1~4 OSS + v3 Sprint 1~4 OSS + Phase 5+ 전부. Must-Have/Nice-to-Have 구분. 리스크 3종(기술/시장/리소스) + v3 Sprint 7건. **단, 이슈 #3 참조 (Pre-Sprint/Layer 0 누락).** |
| D3 정확성 | 25% | 8/10 | Sprint 순서 Brief §4 일치 ✅. Go/No-Go 8개 게이트 매핑 정확 ✅. OSS 패키지 버전 Tech Research 일치 ✅. FR Phase→Sprint 태그 21건 정확 ✅. **단, 이슈 #1 참조 (/ws/office 연결 상한 10 vs 50).** |
| D4 실행가능성 | 20% | 8/10 | Sprint 의존성 체인 명확(soul-enricher.ts 중심). Sprint별 실패 시 전략(독립 롤백, Sprint 2.5 분할). OSS 테이블에 대체 대상 명시. 직접 구현 목록에 파일 경로 포함. |
| D5 일관성 | 15% | 7/10 | Brief §4 Sprint 순서 일치 ✅. Go/No-Go 매핑 일치 ✅. **단, 이슈 #1 (/ws/office 10 vs 50), 이슈 #2 (리스크 6건 중복), 이슈 #4 (tilemap 선택) — 3건 일관성 이슈.** |
| D6 리스크 | 10% | 8/10 | v3 Sprint 리스크 7건 전부 확률/영향/Sprint/완화 포함. Sprint 2 과부하 별도 인식. 독립 롤백 전략. |

## 가중 평균: 8.00/10 ✅ PASS (초기)

`(0.15×9) + (0.15×8) + (0.25×8) + (0.20×8) + (0.15×7) + (0.10×8) = 1.35 + 1.20 + 2.00 + 1.60 + 1.05 + 0.80 = 8.00`

---

## 재검증 (Verified) — 9건 수정 후

| 차원 | 가중치 | 초기 | 재검증 | 변동 근거 |
|------|--------|------|--------|----------|
| D1 구체성 | 15% | 9 | 9 | WS 20 + graceful eviction 구체화, Sprint 2.5 분할 트리거("중간 리뷰 시점 인프라 미완료 시") |
| D2 완전성 | 15% | 8 | 9 | Pre-Sprint/Layer 0 주석 추가(L1988), Gemini Embedding 재활용 명시(L2107), pg-boss 조건부(L2108) |
| D3 정확성 | 25% | 8 | 9 | WS 상한 20으로 양쪽 통일(L1794+L2276), 리스크 참조 구조 정확, llm-cost-tracker v3 제거 표기 |
| D4 실행가능성 | 20% | 8 | 9 | Sprint 1 지연→n8n 인프라 병렬 착수 명시(L2062), pg-boss 큐잉 조건부 옵션, tilemap 선택 근거 |
| D5 일관성 | 15% | 7 | 9 | 리스크 중복 6건 제거→참조 통합(L2057), WS 상한 양쪽 일관, tilemap 병기+근거 |
| D6 리스크 | 10% | 8 | 9 | Sprint 1 지연 완화(병렬 착수), Sprint 2.5 트리거 기준 구체화, llm-cost-tracker 라이프사이클 명확 |

## 재검증 가중 평균: 9.00/10 ✅ PASS

`(0.15×9) + (0.15×9) + (0.25×9) + (0.20×9) + (0.15×9) + (0.10×9) = 1.35 + 1.35 + 2.25 + 1.80 + 1.35 + 0.90 = 9.00`

### 수정 검증 상세:

| # | 이슈 | 수정 내용 | 검증 위치 | 결과 |
|---|------|---------|---------|------|
| 1 | WS 연결 상한 통일 | 10/50 → 20 + graceful eviction (Bob+Sally 합의) | L1794, L2276 | ✅ |
| 2 | 리스크 중복 제거 | 6건 제거, 고유 2건만 유지 + §Innovation 참조 주석 | L2057-2062 | ✅ |
| 3 | Sprint 2.5 분할 트리거 | "중간 리뷰 시점 인프라 트랙 미완료 시 이월" | L2061 | ✅ |
| 4 | Sprint 의존성 연쇄 대응 | Sprint 1 지연 시 n8n 인프라 병렬 착수 가능 명시 | L2062 | ✅ |
| 5 | Pre-Sprint/Layer 0 주석 | Brief §4 참조 주석 1줄 추가 | L1988 | ✅ |
| 6 | tilemap 병기 + 선택 근거 | @pixi/tilemap 또는 pixi-tiledmap, 에셋 파이프라인에 따라 확정 | L2112 | ✅ |
| 7 | Gemini Embedding 재활용 | Phase 4 @google/genai + Epic 10 인프라 재활용 명시 | L2107 | ✅ |
| 8 | llm-cost-tracker v3 제거 | "(v3 제거 대상 — CLI Max 월정액, GATE 2026-03-20)" | L2077 | ✅ |
| 9 | pg-boss 조건부 추가 | 조건부 채택, PostgreSQL 네이티브, 아키텍처 확정 후 결정 | L2108 | ✅ |

### WS 상한 20 vs 10 — 아키텍처 판단:

Winston+Quinn은 10을 제안했으나 Bob+Sally cross-talk에서 20 + graceful eviction으로 합의. 아키텍처 관점에서 수용 가능:
- 100社 × 20 = 2,000 WS → ~200MB (VPS 15.5GB 여유 대비 1.3%)
- graceful eviction(가장 오래된 idle 연결 해제)으로 DoS 방어
- 20은 Admin 다수 접속 시나리오(Admin 2~3명 × 멀티탭)까지 커버

---

## 이슈 목록

### 1. **[D3/D5 정확성+일관성] MEDIUM — FR-OC2 L2277 "/ws/office 회사별 최대 50개" vs Step 07 L1794 "per-company 10"**

- **Step 07 통합 목록 L1794**: "per-company 연결 상한 10" (Quinn Step 07 리뷰에서 수정)
- **FR-OC2 L2277**: "회사별 최대 50개 동시 연결 (초과 시 연결 거부)"
- **모순**: 같은 /ws/office 채널의 연결 상한이 두 곳에서 5배 차이
- **수정 제안**: FR-OC2를 Step 07 합의값인 "10"으로 통일. 또는 아키텍처적으로 50이 적절하다면 Step 07 L1794도 50으로 수정 (1인 CEO + 멀티탭 시나리오 고려 시 10이면 충분할 것으로 판단)

### 2. **[D5 일관성] MEDIUM — Step 06 혁신 리스크(L1663-1673) vs Step 08 v3 리스크(L2055-2065) 6건 중복**

- Step 06 "혁신 리스크 완화" 7건과 Step 08 "v3 추가 리스크" 7건 중 **6건이 동일 리스크**:

| Step 06 (혁신 관점) | Step 08 (Sprint 관점) | 동일? |
|------|------|------|
| PixiJS 8 번들 200KB 초과 (R1) | PixiJS 번들 200KB 초과 | ✅ |
| n8n Docker ARM64 리소스 경합 (R6) | n8n Docker ARM64 OOM 반복 | ✅ |
| personality_traits prompt injection (R7) | 4-layer sanitization 우회 | ✅ |
| AI 스프라이트 재현 불가 (R8) | AI 스프라이트 재현 불가 | ✅ |
| Reflection 크론 LLM 비용 폭주 | Reflection 크론 LLM 비용 폭주 | ✅ |
| 기존 agent_memories 데이터 단절 | 기존 agent_memories 단절 | ✅ |
| n8n 에디터 보안 공격 표면 | — | |
| — | Sprint 2 과부하 (15건+) | 고유 |

- **문제**: 동일 리스크가 약간 다른 표현으로 두 곳에 존재. 한쪽만 수정하면 불일치 발생
- **수정 제안**: Step 08 v3 리스크 테이블에서 중복 6건을 제거하고 "※ 상세 폴백은 §Innovation 혁신 리스크 테이블 참조" 1줄 추가. Step 08 고유 리스크(Sprint 2 과부하)만 이 테이블에 유지. 또는 Step 08에 "확률·영향·Sprint" 컬럼을 추가하여 Sprint 관점 부가 정보만 남기고 "완화" 컬럼은 Step 06 참조로 대체

### 3. **[D2 완전성] LOW — Sprint 전략 테이블에 Pre-Sprint / Layer 0 UXUI 부재**

- Brief §4 L378-379: "Pre-Sprint | Phase 0 | 디자인 토큰 확정" + "병행 | Layer 0 | UXUI 완전 리셋"
- PRD Sprint 전략 테이블 L1971-1976: Sprint 1~4만 나열. Pre-Sprint/Layer 0 미포함
- Go/No-Go #6(UXUI Layer 0)은 L1647에서 "전 Sprint 공통"으로 커버됨 ✅
- **수정 제안**: Sprint 전략 테이블에 Pre-Sprint 행 1줄 + Layer 0 병행 행 1줄 추가. 또는 테이블 하단에 "※ Pre-Sprint (디자인 토큰 확정) 및 Layer 0 UXUI 리셋은 전 Sprint 병행 — Go/No-Go #6 참조" 주석 추가

### 4. **[D5 일관성] LOW — @pixi/tilemap 5.0.2 vs Technical Research pixi-tiledmap 추천**

- PRD L2113: `@pixi/tilemap@5.0.2` — "사무실 타일맵 렌더링"
- Technical Research L163-164: `pixi-tiledmap` v2 추천 — "full Tiled JSON parser (all layer types, orientations, animated tiles)"
- `@pixi/tilemap`은 low-level renderer, `pixi-tiledmap`은 Tiled JSON parser 포함
- **영향**: 구현 시 Tiled JSON 파싱을 직접 작성해야 함 (추가 코드)
- **수정 제안**: OSS 테이블에 `pixi-tiledmap@2.x.x`도 병기하거나, `@pixi/tilemap` 선택 근거 1줄 추가 (예: "번들 최소화 우선, Tiled JSON 파싱 직접 구현")

### 5. **[D4/D5 Cross-talk] LOW — Sprint 2 의존성 정밀화 (n8n 인프라 병렬 가능)**

- Sprint 테이블 L1974: 의존성 "Sprint 1 (soul-enricher.ts 통합)"
- FR-N8N 5건 전부 soul-enricher.ts 비의존 (Winston 분석)
- L1980에 "병렬 개발 가능" 언급 있으나 Sprint 테이블 의존성과 경직된 표현
- **수정 제안**: Sprint 1 지연 시 n8n 인프라 병렬 착수 가능 명시

---

## Cross-talk 완료

Quinn (QA + Security)과의 교차 검토 완료:
- **이슈 #1**: /ws/office 연결 상한 → Winston+Quinn 합의: 10. 최종: Bob+Sally cross-talk에서 **20 + graceful eviction** 합의. 아키텍처 수용 가능.
- **이슈 #2**: 리스크 중복 → Winston+Quinn 합의: **Option A** (참조 통합). ✅ 반영됨.
- **이슈 #5 (CT-1)**: Sprint 2 n8n 병렬 → Winston+Quinn 합의. ✅ 반영됨(L2062).

---

## 검증 방법

| 확인 항목 | 방법 | 결과 |
|---------|------|------|
| Sprint 순서 Brief §4 일치 | Brief L374-384 vs PRD L1971-1976 | ✅ Sprint 1(Layer 3)→2(Layer 2)→3(Layer 4)→4(Layer 1) |
| Go/No-Go 8개 게이트 매핑 | Brief L443-450 vs PRD L1971-1976 | ✅ #1~#8 전부 정확 |
| soul-enricher.ts 의존성 체인 | Sprint 1→2,3 참조 | ✅ Sprint 1이 주입 경로 확보 |
| v3 OSS 버전 Tech Research 일치 | Tech Research L121-123 vs PRD L2110-2113 | ✅ 전부 일치 |
| FR Phase→Sprint 태그 교체 | FR-OC(8)+FR-N8N(5)+FR-MEM(8) = 21건 | ✅ 전부 정확 |
| FR-PERS Sprint 1 유지 | L2295-2299 | ✅ 기존 [Sprint 1] 유지 |
| /ws/office 연결 상한 | L1794 vs L2276 | ✅ 양쪽 20 + graceful eviction 일치 |
| v3 리스크 중복 제거 | L2057 참조 주석 + L2059-2062 고유 2건 | ✅ Option A 반영 |
| Pre-Sprint/Layer 0 | L1988 주석 | ✅ Brief §4 참조 |
| tilemap 병기 | L2112 | ✅ 양쪽 병기 + 선택 근거 |
| Sprint 2 n8n 병렬 | L2062 | ✅ soul-enricher.ts 비의존 명시 |
