# Critic-C (Product + Delivery) Review — Step 1: Technical Research Scope Confirmation

**Reviewer**: John (PM)
**Date**: 2026-03-20
**File**: `_bmad-output/planning-artifacts/technical-research-2026-03-20.md`

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 8/10 | VPS 스펙(24GB/4-core ARM64), 번들 한도(200KB gzipped), 포트(5678), 구체적 파일명(memory-reflection.ts, soul-renderer.ts), 6개 도메인 → 레이어/스프린트 매핑 테이블. "적절한" 류 표현 없음. |
| D2 완전성 | 20% | 7/10 | 6개 연구 도메인 전부 커버. Steps 2-6 아웃라인 완비. 그러나 **Go/No-Go 8개 게이트를 Step 6에서 "다룬다"고만 언급** — 어떤 게이트가 어떤 연구 도메인과 매핑되는지 명시 안 됨. 스코프 확인 단계에서 이 매핑이 빠지면 Step 2-5가 Go/No-Go 입력값을 놓칠 수 있음. |
| D3 정확성 | 15% | 9/10 | inputDocuments 6개 전부 실재 파일. Brief §4 스프린트 순서(Pre→1→2→3→4) 일치. VPS 제약 Brief HTML 코멘트와 정합. pgvector 0.7+ 언급 — Epic 10 기존 설치 사실과 부합. |
| D4 실행가능성 | 15% | 8/10 | Steps 2-6 각각 명확한 산출물 정의. 연구 방법론(confidence framework, multi-source validation) 실행 가능. init 단계로서 충분. |
| D5 일관성 | 10% | 9/10 | Stage 0 Step 05 snapshot과 완전 정합: 스프린트 순서, Layer 번호, Pre-Sprint Phase 0 선행 조건, memory-reflection.ts 분리 결정, observations INPUT 계층 역할. 네이밍 컨벤션 일관. |
| D6 리스크 | 20% | 6/10 | VPS 하드 제약은 명시됨. 그러나 **Brief HTML 코멘트에 명시된 5개 Known Risks를 스코프 확인에서 전혀 참조 안 함**: (1) PixiJS 8 learning curve, (2) n8n iframe vs API 복잡성, (3) pgvector 기존 설치 활용, (4) UXUI 428 color-mix incident, (5) prd.md 7개 known issues. 스코프 확인 단계에서 연구 대상 리스크를 나열하지 않으면 Step 2-5에서 리스크가 누락될 수 있음. |

---

## 가중 평균: 7.55/10 ✅ PASS

계산: (8×0.20) + (7×0.20) + (9×0.15) + (8×0.15) + (9×0.10) + (6×0.20) = 1.60 + 1.40 + 1.35 + 1.20 + 0.90 + 1.20 = **7.65**

---

## 이슈 목록

1. **[D6 리스크] Brief Known Risks 미참조** — Brief HTML 코멘트 5개 리스크가 스코프 확인에 없음. 각 연구 도메인별 "이 도메인에서 검증할 리스크" 섹션 추가 권장. 특히 PixiJS learning curve와 n8n iframe vs API 결정은 연구 방향 자체를 좌우함.

2. **[D2 완전성] Go/No-Go 8개 → 연구 도메인 매핑 부재** — Step 6에서 "Go/No-Go input matrix (8 gates)" 언급은 있으나, 어떤 게이트가 어떤 도메인(Step 2-5)에서 입력값을 받는지 매핑이 없음. 예:
   - Go/No-Go #2 (Big Five 주입) → Domain 3 연구에서 extraVars 검증
   - Go/No-Go #5 (PixiJS 번들) → Domain 1 연구에서 bundle 측정
   - Go/No-Go #8 (에셋 품질) → Domain 5 연구에서 AI 생성 도구 평가
   이 매핑이 Step 1에 있어야 Step 2-5 연구가 Go/No-Go 결정에 필요한 데이터를 빠짐없이 수집함.

3. **[D6 리스크] Solo dev + AI on VPS 실행 리스크 미언급** — 6개 도메인을 1인 개발자가 VPS에서 연구·구현하는 현실적 제약 인식 없음. Brief가 이를 전제하지만, 연구 스코프에서 "어떤 도메인이 가장 리소스 집약적이고 병목이 될 수 있는가"를 식별하는 것도 연구 목표에 포함해야 함.

---

## Cross-talk 요청 (발신)

- **Winston**: D3 정확성 관점 — inputDocuments에 v2 audit 포함되었는데, pgvector 버전(0.7+)과 실제 설치 버전 일치 여부 검증 필요한가?
- **Quinn**: D6 리스크 관점 — n8n Docker가 24GB RAM VPS에서 기존 서비스(Bun server, PostgreSQL)와 공존 시 메모리 할당 리스크 어떻게 보시는지?

## Cross-talk 수신 요약

### Quinn (QA) — Phase 0 블로커 동의

- Pre-Sprint Phase 0가 Sprint 1~4 체인의 blocker라는 점이 Research Goals에 반영되어야 Sprint 순서 리스크 인식 일관됨. **이슈 #4와 동일 — 추가 조치 불필요.**

### Winston (Architect) — 2개 추가 이슈 동의 + cross-talk 응답

1. **[D6 추가] Pre-Sprint Phase 0 블로커 미반영** — Brief §4 "디자인 토큰 확정 = Sprint 1 착수 선행 조건" 이 스코프에 없음. 연구가 UI 결정이 이미 완료된 것으로 전제할 위험. **동의 — 이슈 #4로 추가.**

2. **[D6 추가] Sprint 3 Tier 비용 블로커 미반영** — Stage 0 확정 "PRD Tier 비용 한도 미확정 시 Sprint 3 착수 불가." Layer 4 메모리 연구에 Reflection LLM 비용 모델이 제약으로 플래그되어야 함. **동의 — 이슈 #5로 추가.**

→ Winston 이슈 반영 시 D6 점수 6→5로 하향 조정. 블로커 2개 누락은 "명백한 리스크를 놓침" (D6 3-4점 기준)에 근접하나, VPS 하드 제약은 명시되어 있으므로 5점 유지.

### 점수 재계산 (cross-talk 전체 반영)

| 차원 | 초기 | 수정 | 이유 |
|------|------|------|------|
| D3 정확성 | 9/10 | 8/10 | pgvector 버전 혼동 (npm 0.2.x vs extension 미고정) |
| D6 리스크 | 6/10 | 5/10 | Brief Known Risks 5개 미참조 + Phase 0/Sprint 3 블로커 2개 누락 |

**최종 가중 평균**: (8×0.20) + (7×0.20) + (8×0.15) + (8×0.15) + (9×0.10) + (5×0.20) = 1.60 + 1.40 + 1.20 + 1.20 + 0.90 + 1.00 = **7.30/10 ✅ PASS**

### 추가 이슈

4. **[D6] Pre-Sprint Phase 0 블로커 스코프 누락** (Winston 제기) — Brief §4에서 "디자인 토큰 확정 = Sprint 1 착수 선행 조건"으로 명시됨. 연구 스코프의 VPS Constraints 또는 별도 "Delivery Blockers" 섹션에 Phase 0 의존성 추가 필요.

5. **[D6] Sprint 3 Tier 비용 블로커 스코프 누락** (Winston 제기) — Layer 4 연구가 비용 모델 없이 아키텍처만 연구하면, Sprint 3 착수 시 비용 한도 미정으로 블로커 발생. Research Goal에 "Reflection LLM 비용 모델 수립" 명시 필요.

6. **[D3] pgvector 버전 혼동** (Winston 코드 검증) — 문서에 "pgvector 0.7+"로 기재했으나 실제 두 버전이 존재: npm `pgvector ^0.2.1` (package.json:37) + PostgreSQL extension (버전 미고정, `0049_pgvector-extension.sql`에서 `CREATE EXTENSION IF NOT EXISTS vector`). Step 2에서 npm client 버전과 Neon extension 버전 모두 명시 필요.

7. **[D2] Go/No-Go 8개 → 연구 도메인 매핑 테이블** (Winston 동의, 구체안 제시) — Winston이 제안한 매핑:
   - #1 Zero Regression → N/A (기존 인프라)
   - #2 Big Five inject → Domain 3 (soul-renderer extraVars)
   - #3 n8n security → Domain 2 (reverse proxy auth)
   - #4 Memory zero regression → Domain 4 (Option B schema)
   - #5 PixiJS bundle → Domain 1 (bundle analysis)
   - #6 UXUI Layer 0 → Domain 6 (ESLint + Playwright)
   - #7 Reflection cost → Domain 4 (LLM cost model)
   - #8 Asset quality → Domain 5 (AI sprite eval)
   이 테이블을 Step 1에 추가하면 D2 7→9 가능.

### 최종 이슈 수: 7개 (초기 3 + cross-talk 4)

---

## [Verified] Fixes Verification

**Date**: 2026-03-20

### 이슈별 검증

| # | 이슈 | 상태 | 검증 근거 |
|---|------|------|----------|
| 1 | Brief Known Risks 참조 누락 | ✅ 완료 | L81-93: 9개 리스크 테이블, 각각 연구 도메인 + 검증 방법 매핑. Brief HTML 5개 + 추가 4개(R6-R9). |
| 2 | Go/No-Go 8개 → 연구 도메인 매핑 | ✅ 완료 | L95-106: 8개 게이트 전부 매핑, "필요 데이터" 컬럼으로 각 Step에서 수집할 증거 명시. Winston 제안보다 상세. |
| 3 | Solo dev + VPS 실행 리스크 | ✅ 완료 | L40: Research Goal #5 추가. L68: co-residence 명시. L119: Step 2에 "Per-domain VPS resource intensity ranking" 추가. |
| 4 | Pre-Sprint Phase 0 블로커 | ✅ 완료 | L70-73: "Sprint Blockers" 섹션 신설. Phase 0 선행 조건 + Sprint 3/4 블로커 모두 명시. |
| 5 | Sprint 3 Tier 비용 블로커 | ✅ 완료 | L72: Sprint 3 블로커 명시. L105: Go/No-Go #7에서 "LLM 비용 모델 연구 (Sprint 3 블로커)" 매핑. |
| 6 | pgvector 버전 혼동 | ✅ 완료 | L57: "pgvector 0.7+" → "pgvector (npm: ^0.2.1, PG extension: version TBD — Neon managed)" 정정 완료. npm client vs PG extension 분리 명시. |
| 7 | Go/No-Go → Domain 매핑 테이블 | ✅ 완료 | #2와 동일. |

### Verified 점수

| 차원 | 초기 | Cross-talk | Verified | 변화 근거 |
|------|------|-----------|----------|----------|
| D1 구체성 | 8 | 8 | **9** | Known Risks 테이블에 파일명·라인번호(soul-renderer.ts L45 `\|\| ''`)·게이트 번호 구체 명시. "적절한" 0곳. |
| D2 완전성 | 7 | 7 | **9** | Go/No-Go 8개 전수 매핑 + 9개 리스크 + Sprint Blockers 3개 + Research Goals 5개. Step 2-6 아웃라인 보강. |
| D3 정확성 | 9 | 8 | **9** | pgvector "0.7+" → "npm: ^0.2.1, PG extension: version TBD — Neon managed" 정정 완료. 모든 기술 참조 정확. |
| D4 실행가능성 | 8 | 8 | **9** | Go/No-Go 매핑 = Steps 2-5가 수집할 데이터 명세. Known Risks 검증 방법 = 바로 실행 가능. |
| D5 일관성 | 9 | 9 | **9** | Stage 0 결정사항 전부 반영. Sprint 순서·블로커 조건 Brief §4 verbatim 일치. |
| D6 리스크 | 6 | 5 | **9** | 5→9. 9개 리스크 카탈로그 + Sprint Blockers 3개 + VPS co-residence + solo dev 병목 식별 목표. |

**Verified 가중 평균**: (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00/10 ✅ PASS**

### 잔여 사항

- 없음. 7개 이슈 전부 완료.

### 총평

Init 단계로서 exceptional. 9개 Known Risks + 8개 Go/No-Go 매핑 + 3개 Sprint Blockers가 Step 1에 명시됨으로써, Steps 2-5 연구가 "무엇을 검증해야 하는가"의 체크리스트를 갖게 됨. 특히 Go/No-Go → Domain 매핑 테이블은 연구 → Architecture → Sprint 실행까지 traceability를 보장하는 핵심 장치.
