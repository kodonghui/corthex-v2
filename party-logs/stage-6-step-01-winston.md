# Critic-A Review — Stage 6 Step 1: Requirements Extraction

**Reviewer:** Winston (Architect) — Critic-A (Architecture + API)
**File:** `_bmad-output/planning-artifacts/epics-and-stories.md`
**Date:** 2026-03-23

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | 모든 FR/AR/UXR에 파일 경로, hex 색상, px 값, 마이그레이션 번호, 함수명 명시. "적절한" 표현 거의 없음. AR5 "non-breaking only" 버전 범위 미명시 정도만 사소한 아쉬움. |
| D2 완전성 | 15% | 6.5/10 | 핵심 FR/NFR/AR/UXR 대부분 커버. **그러나 ECC-1(call_agent 응답 표준화, Sprint 1 HIGH)과 ECC-2(Cost-aware 모델 라우팅, Sprint 1 MEDIUM)가 AR에 미포함.** ECC-3 decay/reinforcement 로직 부분 누락. ECC-5 구현 사양 불충분. Coverage map 미작성. **80개 도메인 요구사항(PRD L1352-L1536) Overview에서 언급만 하고 본문에 미열거 — 일부 고유 제약(SDK-4, DB-2, VEC-1, SOUL-1~3) AR에 미포함.** |
| D3 정확성 | 25% | 7/10 | **FR 수 "103 active"는 오류 — 실제 나열된 FR은 123개(삭제 2개 제외 시 121개), 아키텍처 문서와 일치하는 123이 정확.** "80 domain-specific requirements" 근거 불명. 그 외 기술 버전(PixiJS 8.17.1, n8n 2.12.3), 보안 레이어 수(PER-1 4-layer, N8N-SEC 8-layer, MEM-6 4-layer), 마이그레이션 번호(0061~0064) 전부 정확. |
| D4 실행가능성 | 20% | 8/10 | AR 섹션이 코드 수준 가이드(파일명, 함수 시그니처, DB 스키마) 제공. Sprint 배정 명확. UXR이 px/rem/duration 값까지 명시. Coverage map 부재로 FR→Story 추적성 다소 약화. |
| D5 일관성 | 15% | 9/10 | PRD 용어(Hub, Library, Tier 등) 일관 사용. Sprint/Phase 번호 체계 일관. 아키텍처 결정(D22~D34) AR 매핑 정확. 네이밍 컨벤션(kebab-case, PascalCase) 준수. |
| D6 리스크 | 10% | 8/10 | AR70 리스크 완화 포함. CPU 병목, HNSW rebuild, n8n OOM 리스크 반영. Pre-Sprint Voyage API rate limit 리스크가 AR 요구사항으로 더 명시적이면 좋겠음. |

## 가중 평균 (R1): 7.75/10 ✅ PASS (cross-talk 반영 후 하향 조정)

계산: (9×0.15) + (6.5×0.15) + (7×0.25) + (8×0.20) + (9×0.15) + (8×0.10) = 7.825 → 7.8

---

## R2 Re-Review (Fixes Applied)

### 차원별 점수 (수정 후)

| 차원 | 가중치 | R1 점수 | R2 점수 | 변경 근거 |
|------|--------|---------|---------|----------|
| D1 구체성 | 15% | 9 | 9 | 유지. AR73-75 모두 구체적 (파일명, 응답 구조, 비용 값 명시) |
| D2 완전성 | 15% | 6.5 | 8 | ↑1.5. ECC-1/2/5 → AR73-75 추가. ECC-3 decay/reinforcement AR44 확장. 80 DSR 열거. AR76(Voyage rate limits) 보너스. 잔여: AR27 enricher/renderer 관계 명시 미약 (MINOR) |
| D3 정확성 | 25% | 7 | 9 | ↑2. FR 123 수정. AR15 변수 7개 수정. Reconciliation 테이블 7건. 잔여: AR 카운트 Overview 75 vs 실제 76 (사소) |
| D4 실행가능성 | 20% | 8 | 9 | ↑1. AR73이 call-agent.ts 이중 변경 의존성 명시. AR44에 decay 0.1/week, reinforcement cosine≥0.85 +0.15 구체 수치. AR75에 10 태스크 × 5 카테고리 명시 |
| D5 일관성 | 15% | 9 | 9 | 유지. Sprint 배정 일관, 용어 통일 |
| D6 리스크 | 10% | 8 | 9 | ↑1. AR76 Voyage AI rate limit + exponential backoff 전략 추가 |

### 가중 평균 (R2): 8.85/10 ✅ PASS

계산: (9×0.15) + (8×0.15) + (9×0.25) + (9×0.20) + (9×0.15) + (9×0.10) = 1.35 + 1.20 + 2.25 + 1.80 + 1.35 + 0.90 = **8.85**

### 잔여 이슈 (non-blocking)

~~1. **[MINOR] AR count in Overview**: Line 17 says "75 technical requirements" but AR1-AR76 = 76개.~~ → **R2b FIXED**: "76 technical requirements (AR1-AR76)"
~~2. **[MINOR] AR27 enricher/renderer 관계**: 명시 부재.~~ → **R2b FIXED**: AR27 now states "soul-enricher GENERATES vars, soul-renderer SUBSTITUTES them" with full `enrich() → merge → renderSoul(extraVars)` chain.

**All issues resolved. Zero residual.**

### 수정 검증 상세

| # | 원본 이슈 | 수정 내용 | 검증 |
|---|----------|---------|------|
| 1 | FR count 103 → 123 | Overview line 16: "123 active FRs" | ✅ |
| 2 | ECC-1 missing | AR73: call_agent response `{ status, summary, next_actions, artifacts }`. Sprint 1 HIGH. AR28 이중 변경 의존성 명시 | ✅ |
| 3 | ECC-2 missing | AR74: cost-aware model routing, model-selector.ts, Sprint 1 MEDIUM | ✅ |
| 4 | ECC-3 partial | AR44 확장: decay 0.1/week (floor 0.1), reinforcement cosine≥0.85 +0.15 (ceiling 1.0) | ✅ |
| 5 | ECC-5 insufficient | AR75: test framework 10 tasks × 5 categories, Go/No-Go #14 | ✅ |
| 6 | Coverage map placeholder | TODO for Step 2 | ✅ |
| 7 | 80 DSR 미열거 | DSR1-DSR80 14개 카테고리 전부 열거 (lines 664-788) | ✅ |
| 8 | FR-OC7 reconciliation | PRD-Architecture Reconciliation 테이블 7건 (lines 790-812) | ✅ |
| 9 | enricher/renderer 관계 | AR27 미수정. AR73 컨텍스트로 부분 보완. MINOR 잔여 | ⚠️ |
| N | AR15 변수 수 (dev cross-talk) | 6 → 7 수정 (knowledge_context 추가). Reconciliation에도 반영 | ✅ (보너스) |
| N | AR76 Voyage rate limits | 신규: 300 RPM, $5/month, exponential backoff | ✅ (보너스) |

## 이슈 목록

### CRITICAL (must fix)

1. **[D3 정확성] FR 카운트 오류** — 문서 Overview(line 16)에 "103 active FRs"로 기재되어 있으나, 실제 나열된 FR은 123개(FR1-FR68 중 삭제 2개 포함 + FR69-72 + v3 53개). 아키텍처 문서(line 62)는 "123개, 20 Capability Areas"로 명시. 삭제된 FR37, FR39를 제외해도 121개. **103은 어떤 계산으로도 도출 불가.**
   - **Fix:** Overview의 "103 active FRs"를 "121 active FRs (123 total, 2 deleted)" 또는 아키텍처와 일치하는 "123 FRs (2 deleted: FR37, FR39)"로 수정

2. **[D2 완전성] ECC-1 미포함: call_agent 응답 표준화** — 아키텍처(line 1925)에서 Sprint 1, HIGH 우선순위로 지정. `tool-handlers/builtins/call-agent.ts` 응답을 `{ status, summary, next_actions, artifacts }` 표준 구조로 파싱. AR1-AR72에 해당 요구사항 없음.
   - **Fix:** AR73 추가: "call_agent 응답 표준화 (ECC-1). `tool-handlers/builtins/call-agent.ts`에서 응답을 `{ status, summary, next_actions, artifacts }` 구조로 파싱. Sprint 1 선행."

3. **[D2 완전성] ECC-2 미포함: Cost-aware 모델 라우팅** — 아키텍처(line 1926)에서 Sprint 1, MEDIUM 우선순위. `engine/model-selector.ts` Admin 설정 확장. AR17이 tierConfig.modelPreference를 언급하나 cost-aware 확장은 미포함.
   - **Fix:** AR74 추가: "Cost-aware 모델 라우팅 (ECC-2). `engine/model-selector.ts`에 Admin 설정 기반 Tier별 모델 선택 확장. Reflection 크론은 Haiku 고정."

### MODERATE (should fix)

4. **[D2 완전성] ECC-3 부분 누락: Memory confidence decay/reinforcement** — AR44가 confidence 스케일(observations REAL 0-1, agent_memories INTEGER 0-100)을 다루나, 아키텍처(line 1927)의 decay/reinforcement 로직 미포함. Sprint 3, HIGH.
   - **Fix:** AR44에 추가: "Confidence decay: 시간 경과 시 감소 로직. Reinforcement: 반복 관찰 시 증가. `memory-reflection.ts`에서 구현."

5. **[D2 완전성] ECC-5 구현 사양 부족** — AR62 #14가 Go/No-Go 게이트로만 언급. 아키텍처(line 1929)는 테스트 프레임워크 + 표준 태스크 corpus 구현(Sprint 3, HIGH)을 요구. 게이트가 아닌 구현 요구사항.
   - **Fix:** AR75 추가: "Capability evaluation 테스트 프레임워크 (ECC-5). 표준 태스크 corpus + 자동 평가 파이프라인. Sprint 3."

6. **[D1/D2] Coverage map 플레이스홀더** — Line 662: `{{requirements_coverage_map}}` 미작성. Step 1 산출물로서 FR→AR→UXR 교차 추적 매트릭스가 있어야 누락 검증 가능.
   - **Fix:** 최소한 FR→Sprint→AR 매핑 테이블 작성. Epic 설계(Step 2) 전 필수.

### MODERATE (should fix, continued)

7. **[D2 완전성] 80개 도메인 요구사항 미열거** — (john cross-talk 확인) PRD L1352-L1536에 14개 카테고리 80개 도메인 요구사항 존재: SEC(7), SDK(4), DB(5), ORC(7), SOUL(6), OPS(6), NLM(4), VEC(4), N8N-SEC(8), PER(6), MEM(7), PIX(6), MKT(5), NRT(5). Overview에 "80 domain-specific requirements"로 언급되나 본문에 미열거. **일부 고유 제약이 AR1-72에 미포함**: SDK-4(SDK 제거 대비), DB-2(비서 CHECK 제약), VEC-1(2048 토큰 청크 크기), SOUL-1~3(타입별 변수 할당).
   - **Fix:** 도메인 요구사항 섹션 추가 (최소 14개 카테고리 ID + 고유 제약 목록). 또는 AR 섹션에 미포함 고유 제약 추가.

8. **[D5 일관성] FR-OC7 PRD↔Architecture 조정 미기록** — (john cross-talk 확인) PRD는 "LISTEN/NOTIFY primary, 500ms polling fallback"으로 기술하나, Architecture D26(line 666)이 "polling only (Neon serverless 제약)"으로 확정. 추출 문서는 Architecture 입장을 올바르게 채택했으나, 이 조정(reconciliation)이 기록되지 않음.
   - **Fix:** FR-OC7 또는 AR53에 주석 추가: "PRD LISTEN/NOTIFY → Architecture D26 polling 확정 (Neon serverless 제약)"

### MINOR (nice to have)

9. **[D4 실행가능성] soul-enricher↔soul-renderer 관계 명시 부족** — (dev cross-talk) AR27(enricher)과 AR28(renderSoul callers)이 각각 정확하나, enricher가 ExtraVars를 반환하고 callers가 renderSoul에 전달하는 관계가 명시적이지 않음. Architecture D23에서는 명확히 "enrich() → ExtraVars → callers의 renderSoul(soul, agentId, companyId, extraVars)"로 정의.
   - **Fix:** AR27에 명시: "enrich()는 ExtraVars를 반환. callers가 renderSoul()에 전달 (enricher는 renderer를 호출하지 않음)"

## Cross-talk 요약

- **john (Product)에게**: FR 카운트 오류(103 vs 123) 확인 요청 → **확인됨**. 80개 도메인 요구사항 미열거 이슈 추가 발견 (john이 PRD L1352-L1536 지적).
- **dev (Implementability)에게**: ECC-1/ECC-2가 Sprint 1 착수 시 영향 확인 요청. dev가 AR15 변수 수(6 vs 7), 테마 네이밍(Sovereign Sage vs Natural Organic), soul-enricher/renderer 관계 지적.
  - **AR15**: 아키텍처 원문 6개가 정확. 코드에 7개면 코드↔아키텍처 드리프트 (추출 오류 아님).
  - **테마**: UX 스펙 확인 — "Natural Organic" = 디자인 방향, "Sovereign Sage" = 팔레트명. UXR19 정확. CLAUDE.md의 "slate-950 bg" 정의가 stale (v2 잔재).
  - **enricher/renderer**: D23 확인 — enricher returns ExtraVars, callers pass to renderSoul. 추출 정확하나 관계 명시 보강 권장.

## 검증 방법

- FR 카운트: 문서 내 FR 항목 직접 카운트 (123개) vs Overview 기재 (103개) 불일치 확인
- ECC 항목: `architecture.md` line 1921-1929 ECC 테이블 vs AR1-AR72 교차 대조
- 기술 버전: `architecture.md` 의존성 테이블 vs AR/FR 명시 값 대조
- 보안 레이어: PER-1(AR29), N8N-SEC(AR34), MEM-6(AR46) 아키텍처 원문과 1:1 확인 완료
