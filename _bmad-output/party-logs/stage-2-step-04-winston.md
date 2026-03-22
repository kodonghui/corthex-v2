# Critic-A Review — Stage 2 Step 4: Executive Summary (PRD L273-459)

**Reviewer**: Winston (Architecture + API)
**Date**: 2026-03-22
**Artifact**: `_bmad-output/planning-artifacts/prd.md` lines 273–459
**Grade Request**: B (reverify)
**Revision**: v3 FINAL (post-fix verification)

---

## Review Score: 9.00/10 ✅ PASS (v1: 7.60 → v2: 7.00 → v3: 9.00 post-fix)

### 차원별 점수 (v3 post-fix)

| 차원 | v2 | v3 | 가중치 | 근거 (v3) |
|------|-----|-----|--------|------|
| D1 구체성 | 9 | 9/10 | 15% | v2 감사 수치 10개 파일 경로 포함. 14개 게이트 모두 구체적 검증 방법. 리스크 15건 severity/Sprint/완화. 접근성 기본선 추가. R7 stale ref→섹션명 참조로 해소 |
| D2 완전성 | 7 | 9/10 | 15% | Brief 11개 + Confirmed 3개 = 14 게이트 전수 반영. Pre-Sprint 4개 블로커 완전. R10-R15 추가로 리스크 15건. 접근성 + UXUI 측정 기준 추가. UX 지표 17→18개 |
| D3 정확성 | 6 | 9/10 | **25%** | 게이트 14개 카운트 정확. Brief §4 게이트 #1-#11 매핑 전수 검증 — 전부 일치. Confirmed Decisions 3개 추가 반영. Pre-Sprint 4블로커 = Discovery 일치. Reflection trigger "20개 이상" = Product Scope L910 정합 |
| D4 실행가능성 | 7 | 9/10 | **20%** | 14개 게이트 전부 검증 방법 actionable. Gate #10 CI query 구체적. Gate #7 auto-block 메커니즘 포함(ECC 2.2). UXUI ≥60% 측정 공식 정의 |
| D5 일관성 | 6 | 9/10 | 15% | Brief↔Confirmed Decisions 소스 충돌 **해소**: 14개 canonical list 확정. Pre-Sprint↔Discovery 일치. Risk↔Gate 교차 참조(R10→#9, R11→#10, R12→advisory lock, R15→#limits). Option B 참조 일관 |
| D6 리스크 | 8 | 9/10 | 10% | R10-R15 추가 (총 15건). R11 Voyage migration 🔴 Critical + Go/No-Go #10 연동. R10 observation poisoning 공격 체인 → Go/No-Go #9. R12 advisory lock. Cost ceiling → Gate #7 통합 |

**가중 평균 (v3)**: (9×0.15)+(9×0.15)+(9×0.25)+(9×0.20)+(9×0.15)+(9×0.10) = 1.35+1.35+2.25+1.80+1.35+0.90 = **9.00**

> **v2→v3 점수 변경 사유**: john이 11건 수정 적용. CRITICAL 2건(게이트 소스 충돌, Capability Eval 출처) → Fix 1에서 Brief 11 + Confirmed 3 = 14개 canonical list 확정 + #14 renumber로 해소. HIGH 1건(Pre-Sprint Voyage 누락) → Fix 4. MEDIUM 2건(stale ref, Sprint 3 scope) → Fix 8, Fix 7. LOW 1건(테마→디자인 토큰) → Fix 5. 추가: 리스크 6건, 접근성 행, UXUI 측정 기준, Reflection 트리거 상세.

> **v1→v2 점수 변경 사유 (이전)**: Sally가 Brief↔Confirmed Decisions 게이트 #9/#10/#11 소스 문서 충돌을 발견. Bob이 PRD #9(Capability Eval) ≠ Confirmed #9(observation poisoning) 확인. Quinn이 Voyage silent partial failure + $750/mo worst-case 시나리오 제시.

---

## 이슈 목록 (6건 → 전부 해소)

### CRITICAL (2건) — ✅ FIXED

| # | 이슈 | Fix | 검증 |
|---|------|-----|------|
| C1 | Go/No-Go 소스 문서 충돌 | Fix 1: Brief 11 + Confirmed 3 = 14개 canonical list 확정 | ✅ L453 "14개". #1-#14 전부 검증. Brief §4 L457-467 매핑 전수 일치 |
| C2 | PRD #9 Capability Eval 출처 불명 | Fix 1: #9→#14 renumber, observation poisoning이 새 #9 | ✅ #14 유지 (메모리 효과 측정 — 합리적). Brief/Confirmed 게이트와 충돌 없음 |

### HIGH (1건) — ✅ FIXED

| # | 이슈 | Fix | 검증 |
|---|------|-----|------|
| H1 | Pre-Sprint Voyage AI 누락 | Fix 4: 4번째 블로커 추가, 기간 2~4일 | ✅ L432 Voyage AI 포함. 4 블로커 = Discovery L166-170 일치 |

### MEDIUM (2건) — ✅ FIXED

| # | 이슈 | Fix | 검증 |
|---|------|-----|------|
| M1 | R7 stale 라인 참조 | Fix 8: "What Makes This Special #2와 동일 순서" | ✅ L403 섹션명 참조로 변경 — 라인 이동에 강건 |
| M2 | Sprint 3 scope 불완전 | Fix 7: agent_memories 확장 추가 | ✅ L443 "agent_memories 확장 (embedding 컬럼, Option B)" 포함 |

### LOW (1건) — ✅ FIXED

| # | 이슈 | Fix | 검증 |
|---|------|-----|------|
| L1 | "테마 결정" 모호 | Fix 5: "디자인 토큰 확정 (Stitch 2 DESIGN.md 기반)" | ✅ L434 Discovery 표현과 통일 |

---

## 자동 불합격 검토

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ❌ 없음 — v2 감사 수치 전수 확인 |
| 보안 구멍 | ❌ 없음 — R7 personality injection 4-layer, n8n 3중 검증 적절 |
| 빌드 깨짐 | ❌ N/A |
| 데이터 손실 위험 | ❌ 없음 |
| 아키텍처 위반 | ❌ 없음 — agent-loop.ts 격리, E8 경계, Option B 참조 정확 |

---

## 검증 상세

### v2 현재 규모 (L275-289) ✅
- 10개 감사 수치: v2 audit 문서와 전수 대조 — 전부 일치
- 각 항목 파일 경로 포함: 추적 가능
- WebSocket 16개 채널명 전수 나열: shared/types.ts:484-501과 일치 (Step 2 검증)

### 비전 + 4대 레이어 (L293-306) ✅
- "투명성/개성/기억/자동화" 4레이어 = Brief §4 Layer 0-4와 일치
- L304 agent-loop.ts "363줄": v2 상태 기준 정확 (Phase 5 후 364줄)
- "SDK 0.2.x 고정": Brief와 일관
- Option C GATE 결정 주석(L293): 적절

### What Makes This Special (L308-328) ✅
- 6항목: 투명성(OpenClaw), 개성(Big Five), 성장(메모리), 자동화(n8n), 설계(NEXUS), 오케스트레이션(Soul)
- L316 Big Five "0-100 정수": Decision 4.3.1 정확
- L316 "4-layer sanitization": personality 전용 4계층 (Decision #8 observation poisoning과 별개) — 각각 올바른 컨텍스트
- L319 "Option B 확장": Steps 2-3 Fix 1과 일관 ✅
- L319 "기존 데이터 단절 없이": Brief L159 "기존 v2 메모리 데이터 단절 없음"과 일치

### 대상 사용자 (L330-357) ✅
- Admin 이수진 Primary #1, CEO 김도현 Primary #2: Brief §2 일치
- 온보딩 순서 Admin→CEO: v2 교훈 반영
- v3 문제-솔루션 매핑 6건: Feature 5-1~5-4에 전부 대응
- v2 페르소나 3명 유지: 변경 없음 명시

### 기대 효과 (L359-392) ✅ (post-fix)
- v2 기술 4지표 + v3 기술 6지표 + UX **8지표** (접근성 기본선 추가) = **18개**
- Sprint별 할당 명확
- L376 Reflection trigger: "일 1회 크론 + reflected=false 관찰 20개 이상" — Product Scope L910 정합 ✅
- L389 "Big Five 슬라이더 첫 설정 시간 ≤ 2분 (프리셋 선택 시 ≤ 30초)": Step 3 Fix 10 반영 ✅
- L390 "/office 첫 WOW 모먼트": Feature 5-1과 일관 ✅
- L392 "접근성 기본선": Big Five 키보드 + /office aria-live 추가 ✅

### 핵심 리스크 (L393-418) ✅ (post-fix)
- 원본 7+2=9건 + 추가 R10-R15 = **총 15건**: ✅ comprehensive
- R6 n8n 2G cap: Decision #2 일치
- R7 personality 4-layer: "What Makes This Special #2와 동일 순서" — stale ref 해소 ✅
- R9 soul-renderer `|| ''`: Go/No-Go #2와 연결
- **R10** observation poisoning → Go/No-Go #9 연동 ✅
- **R11** Voyage AI migration 🔴 Critical → Go/No-Go #10 연동 ✅
- **R12** advisory lock (확정 결정 #9) ✅
- **R13** CLI Max → Go/No-Go #7 cost ceiling 연동 ✅
- **R14** Solo dev + PixiJS ✅
- **R15** /ws/office flood (확정 결정 #10) ✅

### Phase 로드맵 (L420-451) ✅ (post-fix)
- Sprint 순서: Brief와 일치 (1→2→3→4, Layer 0 병행) ✅
- Pre-Sprint 4개 블로커: Neon Pro + Voyage AI + 사이드바 IA + 디자인 토큰 = Discovery 일치 ✅
- Pre-Sprint 기간 2~4일: Voyage AI 2-3일 포함 ✅
- Sprint 3: observations + memory-reflection + pgvector + **agent_memories 확장 (Option B)** ✅
- UXUI ≥60% 측정 기준: "(토큰 적용 페이지 수 / 전체 페이지 수)" 정의 ✅

### Go/No-Go 게이트 (L453-469) ✅ (post-fix)
- 헤더 "14개" = 테이블 14행 ✅
- **Brief §4 매핑 전수 검증**:
  - Brief #1-#8 → PRD #1-#8 ✅ (내용 일치)
  - Brief #9 tool sanitization → PRD #11 ✅ (ECC 2.1, "root access agent")
  - Brief #10 v1 parity → PRD #12 ✅ (Gemini/GPT 예외 명시)
  - Brief #11 usability → PRD #13 ✅ (Admin 온보딩 + CEO 5분 플로우)
- **Confirmed Decisions 매핑**:
  - #8 observation poisoning → PRD #9 ✅ (4-layer + 10종 payload)
  - #10 Voyage migration → PRD #10 ✅ (CI query: `SELECT count(*) WHERE embedding IS NULL = 0`)
  - #11 cost ceiling → PRD #7에 통합 ✅ (auto-block ECC 2.2)
- PRD #14 Capability Evaluation: renumbered, 메모리 효과 측정 — 합리적 게이트 ✅
- Gate #6: Brief L462 "ESLint 하드코딩 색상 0 + Playwright dead button 0" 정확 일치 ✅
- Gate #7: Brief L463 "ECC 2.2 자동 차단" 반영 ✅

---

## Cross-talk 결과

### bob (Critic-C) — 7.15/10 PASS
1. **Go/No-Go 주요 발견**: PRD #9(Capability Evaluation) ≠ Confirmed Decisions #9(observation poisoning) — 실제 누락은 2개가 아니라 3개. Winston C1 이슈 강화
2. **Sprint 3 scope gap**: exec summary 수준에서는 acceptable. 상세 scope는 Step 10에서 검증
3. **Voyage CI gate**: 3-query 검증 접근법 제안 (count check, dimension check, HNSW explain analyze). rate limit 리스크도 언급
4. **게이트 번호 재배정**: #10→#12로 renumber 동의 (기존 PRD #9-#11은 유지)

### sally (Critic-B) — 7.05/10 PASS (borderline)
1. **프리셋 ≤30초**: Step 3 Fix 10과 일관 ✅
2. **n8n Admin dual touchpoint**: carry-forward to Step 5 (Success Metrics)
3. **⚠️ CRITICAL 발견: Brief↔Confirmed Decisions 게이트 #9/#10/#11 완전 충돌**:
   - Brief: #9=tool sanitization(ECC 2.1), #10=v1 parity, #11=usability
   - Confirmed Decisions: #9=observation poisoning, #10=Voyage migration, #11=cost ceiling
   - 6개 항목이 완전히 다름. 중복 제거 시 14개 게이트
   - **john에게 escalate 필요**: canonical gate list 확정 요청
4. **Gate #6 triple definition**: Brief($0.10-$0.50/agent/day) vs Confirmed($17/mo) vs PRD(미기술) — carry-forward

### quinn (Critic-D) — 6.65/10 ❌ FAIL
1. **Voyage "silent partial failure"**: 부분 migration = 일부 테이블 1024d, 일부 768d → pgvector 검색 차원 불일치로 silent wrong results. 전체 migration 완료 검증 필수
2. **Worst-case cost**: 무제한 Haiku 호출 시 $750/mo (예산 44배). cost ceiling 게이트 필수
3. **R7 stale ref 확인**: L402 "L306" stale — 검증 혼란 우려 동의
4. **Go/No-Go 3개 누락**: observation poisoning + Voyage migration + cost ceiling 모두 미검증 시 Sprint 3 catastrophic failure

---

## Carry-Forward to Architecture Stage (post-fix residual)

1. Gate #7 cost ceiling 구체 금액: "$0.10/일" = 최저 Tier 기준. Brief "$0.10~$0.50/agent/day" 범위 → Tier별 차등 한도 Architecture에서 확정
2. Gate #10 Voyage migration CI: bob 제안 3-query (count check, dimension check, HNSW explain analyze) 구현 상세
3. Gate #14 source attribution: PRD-writer 추가 게이트 (Brief/Confirmed 아님). 합리적이나 Architecture에서 정식 등재 권장
4. R11 "observations 전수 re-embed" 표현: observations는 v3 신규 테이블 → 기존 데이터 없음. "knowledge_docs 전수 re-embed"가 정확. 미세 수정 권장
5. Sally carry-forward: n8n Admin dual touchpoint → Step 5 (Success Metrics)

## 팀 점수 요약

### Pre-fix (v2, cross-talk 후)

| Critic | Score | Pass/Fail |
|--------|-------|-----------|
| Winston (A) | 7.00 | ✅ PASS |
| Bob (C) | 7.15 | ✅ PASS |
| Sally (B) | 7.05 | ✅ PASS (borderline) |
| Quinn (D) | 6.65 | ❌ FAIL |
| **Average** | **6.96** | **borderline** |

### Post-fix (v3, Winston 검증)

| Critic | Score | Status |
|--------|-------|--------|
| Winston (A) | **9.00** | ✅ PASS |
