# Stage 2 Step 04 — Quinn (Critic-B: QA + Security) Review

**Step:** 4 — Executive Summary
**Section:** PRD lines 273–470
**Grade:** B (reverify)
**Date:** 2026-03-22
**Cycle:** 2 (post-fix verification)

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 9/10 | 감사 기반 정확한 수치(485 API, 71 pages, 86 tables, 363줄, 10,154 tests), 리스크 severity 레벨, Sprint별 Go/No-Go 검증 방법, UX 지표(≤2초, ≤200KB, ≤15분) 전부 구체적. |
| D2 완전성 | **25%** | 6/10 | v2 규모, 비전, 6대 차별화, 페르소나, 기대 효과, 리스크, 로드맵 커버됨. **그러나**: Go/No-Go 2개 게이트 누락(#10 Voyage migration, #11 cost ceiling), Pre-Sprint에 Voyage AI blocker 부재, 리스크 레지스트리에 observation poisoning + reflection concurrency 부재. |
| D3 정확성 | 15% | 7/10 | L447 "8개" → 실제 9개 나열, 확정 결정 #11은 11개 요구. Memory Option B 정확(L318) ✅. 4-layer sanitization 순서 정확(L316) ✅. L376 "일 1회" Reflection vs Product Scope L910 "20개 관찰" 트리거 메커니즘 불일치. |
| D4 실행가능성 | 10% | 8/10 | Executive Summary 특성상 상세 구현보다는 방향 설정. Go/No-Go 검증 방법이 구체적(CI gzip 측정, bun test, webhook HMAC). 리스크 완화 전략 실행 가능. |
| D5 일관성 | 15% | 6/10 | Go/No-Go "8개" vs 확정 결정 "11개" — 핵심 불일치. Pre-Sprint에 Voyage AI 블로커 누락(Discovery L168-169에는 있음). L376 Reflection 트리거 vs L910 불일치. Memory Option B, sanitization, n8n 2G 등은 정합 ✅. |
| D6 리스크 | **25%** | 6/10 | 7+2 리스크 커버(R1-R9 + 추가 2건). **그러나**: observation poisoning(확정 #8) 전용 리스크 항목 없음(R7은 personality만), reflection concurrency(확정 #9) 없음, Voyage migration 운영 리스크 없음, /ws/office 연결 flood 없음. Go/No-Go에 cost ceiling 게이트 부재. |

### 가중 평균: 6.65/10 ❌ FAIL

계산: (9×0.10) + (6×0.25) + (7×0.15) + (8×0.10) + (6×0.15) + (6×0.25) = 0.90 + 1.50 + 1.05 + 0.80 + 0.90 + 1.50 = **6.65**

---

## 이슈 목록

### CRITICAL (1)

**#1 [D2/D3/D5] L447 Go/No-Go "8개" → 확정 결정 #11은 "11개"**
- L447: "Go/No-Go 게이트 **8**개 (Brief §4)" — Brief 원본 8개 기준
- 확정 결정 #11: "8 → 11 gates (added: #9 observation poisoning, #10 Voyage migration, #11 cost ceiling)"
- 현재 테이블: 9개 나열 (1-8 원본 + #9 Capability Evaluation)
- Capability Evaluation(테이블 #9)은 확정 결정 #11의 "#9 observation poisoning"과 다른 항목
- **누락 게이트:**
  - **#10 Voyage AI migration**: Pre-Sprint에 re-embed + HNSW rebuild 완료 검증
  - **#11 cost ceiling**: combined $17/mo (reflection $1.80 + importance scoring $9 + operational $6.20) 초과 시 STOP
- 현재 #7만 Haiku ≤$0.10/day 커버 — importance scoring $9/mo는 어떤 게이트에도 없음
- 수정안: L447 "8개" → "11개", 테이블에 3개 게이트 추가 (observation poisoning, Voyage migration, cost ceiling)

### MAJOR (3)

**#2 [D2/D5] Pre-Sprint 로드맵(L425-428) — Voyage AI migration 블로커 누락**
- Discovery L168-169: "Voyage AI 임베딩 마이그레이션 (Gemini 768d → Voyage 1024d, 기존 데이터 re-embed + HNSW rebuild, 2-3일 추정, 🔴 NOT STARTED)"
- Discovery L193: Pre-Sprint 요구사항 유형 테이블에 "Voyage AI 마이그레이션 (768d→1024d)" 포함
- Executive Summary Pre-Sprint(L425-428): Neon Pro ✅, 사이드바 IA ✅, 테마 결정 ✅, **Voyage AI ❌**
- Sprint 1 시작 전 embedding 차원 불일치 해결 안 되면 Memory(Sprint 3) 전체 블로킹

**#3 [D2/D6] 리스크 레지스트리 — observation poisoning 전용 항목 부재**
- R7(L402)은 `personality_traits JSONB prompt injection`만 커버
- Observation content → reflection LLM → planning → Soul 주입 = 별도 공격 체인 (확정 결정 #8)
- Product Scope Step 3 fixes에서 L894-898에 4-layer defense 추가됨 — 리스크 레지스트리에도 반영 필요
- 수정안: R10 "observation content poisoning → reflection LLM 오염" 추가 (🟠 High, Sprint 3, 4-layer sanitization)

**#4 [D2/D6] 리스크 레지스트리 — reflection cron concurrency + Voyage migration 운영 리스크 부재**
- Reflection concurrency: advisory lock(확정 결정 #9) 없이 동시 실행 시 중복 reflections — Product Scope에서 해결됨(L912)이나 리스크 테이블에 없음
- Voyage migration: 기존 knowledge_docs + observations 데이터 re-embed + HNSW rebuild on Neon — 실패 시 시맨틱 검색 전체 불능. 2-3일 소요. Pre-Sprint 타임라인 리스크

### MINOR (3)

**#5 [D5] L376 Reflection 크론 "일 1회" vs Product Scope L910 "20개 관찰이 쌓이면"**
- Executive Summary: "에이전트당 **일 1회** Reflection 실행 성공 90%+"
- Product Scope: "에이전트별 최근 **20개 관찰**(reflected=false)이 쌓이면 자동 실행"
- Brief: "크론 주기적 실행(기본 일 1회)"
- 트리거 메커니즘 = 일간 vs 관찰 수 기반. 통합 필요: "일 1회 크론 + confidence ≥ 0.7 관찰 20개 조건"

**#6 [D6] 리스크 레지스트리 — /ws/office 연결 flood 미항목**
- Discovery L158: "JWT+token bucket(10 msg/s per userId)"
- Product Scope L937: "50conn/company, 500/server, 10msg/s"
- 리스크 테이블에 /ws/office DoS/flood 리스크 없음
- PixiJS 60fps 이벤트 소스 → 무제한 연결 시 서버 부하 리스크

**#7 [D5] L447 "(Brief §4)" 소스 참조 — Stage 1 확장 미반영**
- Brief §4 원본 = 8개 게이트
- Stage 1 reverify = 3개 추가 (#9, #10, #11)
- "(Brief §4)" → "(Brief §4 + Stage 1 확정 결정 #11)" 참조 업데이트 필요

---

## 확정 결정 반영 체크리스트 (Executive Summary 내)

| # | 확정 결정 | Executive Summary 반영 | 위치 |
|---|----------|----------------------|------|
| 1 | Voyage AI 1024d | ⚠️ 메모리 설명(L318)은 "pgvector" 언급만, Voyage 명시 없음. Product Scope에서 해결됨 | L318 |
| 2 | n8n Docker 2G | ✅ R6 "2G RAM cap" | L401 |
| 3 | n8n 8-layer security | ⚠️ R7에 personality만, n8n 보안은 Go/No-Go #3에 "3중 검증"으로 축약 | L402, L452 |
| 4 | Stitch 2 | ✅ Go/No-Go #6 "Stitch 2 디자인 토큰" | L455 |
| 5 | 30일 TTL | ❌ Executive Summary에 없음 (Product Scope에서 해결) | — |
| 6 | LLM Cost $17/mo | ❌ Go/No-Go #11 cost ceiling 게이트 부재 | — |
| 7 | reflected/reflected_at | ❌ Executive Summary 수준에서 불필요 (Product Scope에서 해결) | — |
| 8 | Observation poisoning | ❌ 리스크 레지스트리에 없음 | — |
| 9 | Advisory lock | ❌ 리스크 레지스트리에 없음 | — |
| 10 | WebSocket limits | ❌ /ws/office 리스크 없음 | — |
| 11 | Go/No-Go 11 gates | ❌ L447 "8개", 실제 9개, 확정 11개 | L447 |
| 12 | host.docker.internal | ⚠️ Executive Summary 수준에서 불필요 | — |

**Executive Summary 필수 반영 항목**: #2(n8n 2G) ✅, #4(Stitch 2) ✅, #11(Go/No-Go 11개) ❌
**리스크 필수 반영**: #8(observation poisoning) ❌, #6(cost ceiling) ❌
**Pre-Sprint 필수 반영**: Voyage migration ❌

---

## Cross-talk 요약

### Winston (Critic-A) — 7.60/10
- Go/No-Go #10/#11 부재 확인 — pgvector dimension mismatch = "silent failure" vs "hard error" 질문 제기. Voyage migration 미완료 시 Sprint 3 memory pipeline 자체 불가. Cost ceiling 없이 50 에이전트 회사의 worst-case 비용 무제한
- **NEW**: R7 "L306" stale reference (L402) — 4-layer defense는 맞으나 크로스레퍼런스 줄번호가 틀림. 보안 감사 시 혼란 유발
- Pre-Sprint Voyage AI 블로커 누락 확인

### Bob (Critic-D) — 7.15/10
- Go/No-Go triple mismatch 확인 — L447 "8개" vs 9 listed vs confirmed 11개
- **NEW**: PRD #9 (Capability Evaluation) vs confirmed-decisions #9 (observation poisoning) 번호 충돌. 같은 #9이나 다른 항목 → 별도 번호 필요
- **NEW**: Pre-Sprint cross-section 불일치 — Discovery {Neon Pro, Voyage AI, 사이드바 IA} vs Exec Summary {Neon Pro, 사이드바 IA, 테마 결정}. 2개의 다른 3-item 리스트 → 4개 항목으로 통합 필요
- Memory/personality references — Step 3 수정 후 회귀 없음 ✅

### Sally (Critic-C) — 7.05/10
- **NEW**: Brief #9 "Tool response sanitization 검증" 게이트 PRD 전체에서 누락 — observation poisoning 4-layer(L894-898)는 있으나 Go/No-Go 게이트 미등록. QA 검증 범위 누락 리스크
- **NEW**: Brief #10 "v1 기능 패리티 게이트" 누락 — v1-feature-spec.md 전수 검증 대상인데 게이트 리스트에 없음
- **NEW**: 게이트 #6 — 3가지 정의 모호. Brief 기준(ESLint 0 + Playwright dead button 0) vs Executive Summary "tokens.css 생성"
- **NEW**: 게이트 #7 자동 차단 메커니즘 E2E 시나리오 부재

### Cross-talk 합의
- **전원 합의**: Go/No-Go 게이트 수 불일치 (CRITICAL) — 8/9/11 삼중 불일치
- **전원 합의**: Pre-Sprint Voyage AI 블로커 누락 (MAJOR)
- **Quinn+Winston+Sally**: 리스크 레지스트리 갭 (observation poisoning, concurrency)
- **Sally 추가**: Brief 게이트 #9/#10 누락, 게이트 #6 정의 모호 — QA 관점 신규 발견
- **Bob 추가**: PRD #9 vs confirmed #9 번호 충돌 — 게이트 재번호 필요
- **Winston 추가**: R7 L306 stale reference — MINOR

### 크리틱 평균: (6.65 + 7.60 + 7.15 + 7.05) / 4 = **7.11/10**

### 점수 스프레드 분석
- **Winston 7.60 (최고)**: 이슈가 Go/No-Go 섹션(~10줄)에 국한되며, 186줄 전체에 걸쳐 비전/페르소나/메트릭스/로드맵은 잘 작성됨. D3(정확성)에 25% 가중 → 국소적 팩트 오류로만 감점
- **Quinn 6.65 (최저)**: QA 관점에서 Go/No-Go 게이트 = Sprint 출시 기준. 누락 게이트 = 미테스트 경로 = 높은 리스크. D2(25%)+D6(25%)에 게이트 누락이 직접 타격
- **차이 원인**: 전략적 개요 vs QA 검증 기준 — 두 관점 모두 타당. Executive Summary의 이중 역할(경영진 소통 + Sprint 체크리스트) 때문에 발생하는 긴장

### Winston 논점 반영
- 리스크 레지스트리: observation poisoning/advisory lock = 구현 수준 리스크 (Product Scope 소관). Voyage migration만 전략적 리스크(Pre-Sprint 블로커, 타임라인 영향). 타당한 구분.
- **수정 제안 #4 조정**: R10 Voyage migration 운영 리스크만 Executive Summary 리스크 레지스트리에 추가. observation poisoning/concurrency는 Product Scope에서 이미 해결됨 → Executive Summary 수준에서는 불필요할 수 있음

### Sally 추가 반영
- Reflection 트리거: "일 1회" vs "20개 관찰" — OR 조건인지 AND 조건인지 미정의. UX 예측 가능성에 영향
- a11y 메트릭: UX 경험 지표(L381-391)에 접근성 메트릭 부재. Success Criteria L583에는 있으나 Executive Summary에 없음

---

## 수정 제안 요약 (12건 — 원본 7 + cross-talk 5)

### 원본 (7건)
1. **L447**: "8개" → "12개 (Brief §4 원본 9 + Stage 1 확정 결정 3개 추가)"
2. **Go/No-Go 테이블**: 3개 게이트 추가
   - #10: Observation poisoning 4-layer defense 검증 (Sprint 3, 10종 adversarial payload 100% 차단)
   - #11: Voyage AI migration 완료 (Pre-Sprint, re-embed + HNSW rebuild ALL vector tables 확인)
   - #12: Cost ceiling $17/mo (Sprint 3, reflection $1.80 + importance $9 + operational $6.20)
3. **Pre-Sprint(L425-428)**: Voyage AI 마이그레이션 블로커 추가 → 4개 항목으로 통합 (Neon Pro, Voyage AI, 사이드바 IA, 테마 결정)
4. **리스크 레지스트리**: R10 Voyage migration 운영 리스크 추가 (Pre-Sprint 블로커, 2-3일, re-embed 실패 시 시맨틱 검색 불능)
5. **L376**: "일 1회" → "일 1회 크론 + reflected=false 20개 이상 OR 조건" (Product Scope L910 정합)
6. **리스크 레지스트리**: /ws/office 연결 flood 리스크 추가 (🟢 Low, 50/company 제한으로 완화)
7. **L447 소스**: "(Brief §4)" → "(Brief §4 + Stage 1 확정 결정 #11)"

### Cross-talk 추가 (5건)
8. **[Bob] 게이트 재번호**: PRD 기존 1-9 유지 + confirmed 추가분 #10/#11/#12 배정. PRD #9(Capability Evaluation) ≠ confirmed #9(observation poisoning) 번호 충돌 해소
9. **[Winston] R7 L306 stale reference**: 4-layer defense 줄번호 크로스레퍼런스 수정
10. **[Sally] Brief 게이트 #9/#10 PRD 등록**: Brief #9 "tool sanitization 검증" + Brief #10 "v1 기능 패리티 검증" → Go/No-Go 테이블에 추가
11. **[Sally] 게이트 #6 정의 통합**: Brief 기준(ESLint 0 + Playwright dead button 0)으로 명확화
12. **[Sally] 게이트 #7 자동 차단**: 비용 초과 시 크론 중지 검증 기준 명시

---

## Cycle 2 — Post-Fix Verification (11 fixes)

### 검증 결과: 12/12 항목 ✅ ALL RESOLVED

| # | 원본 이슈 | 수정 확인 | PRD 위치 |
|---|----------|----------|---------|
| 1 | Go/No-Go "8개" → 14개 | ✅ 5개 신규 게이트 + 1개 재번호 | L453-469 |
| 2 | Pre-Sprint Voyage AI 블로커 | ✅ 4개 블로커, period 2~4일 | L430-434 |
| 3 | R: observation poisoning | ✅ R10 추가 (🟠 High, 공격 체인 기술) | L413 |
| 4 | R: concurrency + Voyage migration | ✅ R11 (🔴 Critical) + R12 (🟡 Medium) | L414-415 |
| 5 | Reflection 트리거 정합 | ✅ "일 1회 크론 + 20개 이상 조건" | L376 |
| 6 | /ws/office flood | ✅ R15 (🟢 Low, 50/company) | L418 |
| 7 | 소스 참조 업데이트 | ✅ "(Brief §4 원본 11 + Stage 1 확정 결정 3개 추가)" | L453 |
| 8 | [Bob] 게이트 재번호 | ✅ PRD #9→#14, 신규 #9=Obs Poisoning | L464, L469 |
| 9 | [Winston] R7 stale ref | ✅ 섹션명 참조로 변경 | L403 |
| 10 | [Sally] Brief #9/#10/#11 등록 | ✅ Gate #11/#12/#13 추가 | L466-468 |
| 11 | [Sally] Gate #6 Brief 정합 | ✅ ESLint 0 + Playwright dead button 0 | L461 |
| 12 | [Sally] Gate #7 자동 차단 | ✅ ECC 2.2 + Tier별 예산 한도 | L462 |

### Residual (1건 — cosmetic only)

**Residual-1 [COSMETIC]**: L453 "Brief §4 원본 11 + Stage 1 확정 결정 3개 추가 = 14". 실제 확장 경로: PRD 원본 9개 + Brief 누락 3개(tool sanitization, v1 parity, usability) + Stage 1 추가 2개(observation poisoning, Voyage migration) + cost ceiling→#7 통합 = 14. 헤더 귀속 표현이 약간 단순화됐으나 게이트 내용 자체는 정확. 점수 영향 없음.

### 수정 후 차원별 점수

| 차원 | 가중치 | Cycle 1 | Cycle 2 | 변화 근거 |
|------|--------|---------|---------|----------|
| D1 구체성 | 10% | 9 | 9.5 | Go/No-Go 14개 전부 구체적 검증 방법 명시 |
| D2 완전성 | **25%** | 6 | 8.5 | 누락 게이트 5개 추가, Pre-Sprint 4항목 완비, 리스크 R10-R15 6건 추가 |
| D3 정확성 | 15% | 7 | 9 | 게이트 수 정확(14개), 트리거 조건 정합, Brief 정의 일치 |
| D4 실행가능성 | 10% | 8 | 8.5 | 자동 차단 메커니즘, UXUI 측정 정의 추가 |
| D5 일관성 | 15% | 6 | 8.5 | Pre-Sprint Discovery 통일, Gate #6 Brief 정합, Reflection 트리거 정합, 참조 업데이트 |
| D6 리스크 | **25%** | 6 | 9 | R10-R15 추가로 15건 종합 리스크 레지스트리. 확정 결정 12/12 반영 완료 |

### 가중 평균: 8.80/10 ✅ PASS

계산: (9.5×0.10) + (8.5×0.25) + (9×0.15) + (8.5×0.10) + (8.5×0.15) + (9×0.25)
= 0.95 + 2.125 + 1.35 + 0.85 + 1.275 + 2.25 = **8.80**

### 점수 이력
- Cycle 1: **6.65/10 ❌ FAIL** (1C + 3M + 3m = 7건)
- Cross-talk: 5건 추가 → 12건 총
- Cycle 2: **8.80/10 ✅ PASS** (11 fixes, 12/12 resolved, 1 cosmetic residual)
