# Critic-A Review — Stage 6 Step 2: Design Epics

**Reviewer:** Winston (Architect) — Critic-A (Architecture + API)
**File:** `_bmad-output/planning-artifacts/epics-and-stories.md` (lines 825-1290)
**Date:** 2026-03-24

## Architecture Focus Areas Verified

| Check | Result | Notes |
|-------|--------|-------|
| AR71 sprint order | ✅ | Pre-Sprint→S1→S2→S3→S4 strict order. Layer 0 ≥60% by S2 end. Diagram at L1258 matches |
| AR1-76 epic mapping | ✅ | All 76 ARs mapped in coverage map (L979-1001). No orphans |
| Soul-enricher pipeline (AR27→AR49) | ✅ | Epic 24: creates interface (Sprint 1, frozen after). Epic 28: additive memory extension (Sprint 3). L1113+L1221 |
| 3 sanitization chains isolated | ✅ | PER-1→Epic 24, TOOLSANITIZE→Epic 27, MEM-6→Epic 28. AR60 in Epic 27 confirms independence |
| Epic 22 Pre-Sprint completeness | ✅ | AR1-7, AR64, AR76 all covered. Neon Pro blocker (AR6) noted. Security baselines (NFR-S11-14) added |
| Cross-cutting ARs | ✅ | AR8-25 (engine), AR57-66 (constraints), AR59-61 (security) correctly classified as "All" scope |
| Dependencies acyclic | ✅ | E22→all, E23∥(E24-29), E24→E22, E25→E22+E23, E26→E25, E27→E22+E23, E28→E22+E24, E29→all |
| AR73 dual-change coordination | ✅ | Epic 24 notes call-agent.ts has TWO Sprint 1 changes (AR28 soul-enricher + AR73 response format). L1115 |

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | 모든 Epic에 AR/FR/NFR/DSR/UXR ID 명시. 구현 노트에 마이그레이션 번호, 파일 경로, Go/No-Go 검증 기준 구체적. 스토리 추정치 범위(5-7, 8-10 등) 적절. |
| D2 완전성 | 15% | 9/10 | 76 AR 전부 매핑. 123 FR 커버(53 신규 + 3 UX + 66 v2 + 4 예약). 80 DSR, 140 UXR 전부 할당. v2 carry-forward 테이블(L903-917) 우수. UXR60(Chat SSE) → Epic 29 매핑이 의문 (Hub 채팅 패턴인데 OpenClaw에 배정). |
| D3 정확성 | 25% | 8/10 | 기술 참조(PixiJS 8.17.1, n8n 2.12.3, 마이그레이션 번호) 정확. Sprint 배정 아키텍처와 일치. **그러나 NFR 카운트 불일치**: 5개 NFR 추가됨(P18, S11-14) but Overview "76" 미갱신(실제 81), 섹션 헤더 "P1-P17"/"S1-S10" 미갱신, 델타 요약 "15 new" 오류(실제 20). |
| D4 실행가능성 | 20% | 9/10 | 각 Epic에 구현 노트, 의존성, Go/No-Go 기준 명시. Implementation sequence 다이어그램(L1258-1266) 명확. Epic 26→Epic 25 의존성 올바르게 표시. |
| D5 일관성 | 15% | 8/10 | Sprint 순서 AR71 일치. Epic 번호 v2 연속(22-29). 용어 통일. **그러나** NFR 섹션 헤더(P1-P17, S1-S10)와 본문(P18, S11-14 존재)이 불일치. 델타 요약(L821) "15 new" → 항목 열거 시 25개. |
| D6 리스크 | 10% | 9/10 | Go/No-Go 매트릭스 14개 전부 Sprint exit에 배정. Epic 23 대규모 스코프(12-15 stories)에 ≥60% 마일스톤 설정. Sprint 4 시스템 전체 게이트(#1, #12, #13) 최종 검증 위치 적절. |

## R1 가중 평균: 8.60/10 ✅ PASS

계산: (9×0.15) + (9×0.15) + (8×0.25) + (9×0.20) + (8×0.15) + (9×0.10) = 1.35 + 1.35 + 2.00 + 1.80 + 1.20 + 0.90 = **8.60**

---

## R2 Re-Review (Fixes Applied)

### 차원별 점수 (수정 후)

| 차원 | 가중치 | R1 점수 | R2 점수 | 변경 근거 |
|------|--------|---------|---------|----------|
| D1 구체성 | 15% | 9 | 9 | 유지 |
| D2 완전성 | 15% | 9 | 9.5 | ↑0.5. UXR57-58/60-61 cross-cutting 패턴 Epic 23 이동으로 coverage map 정밀도 향상 |
| D3 정확성 | 25% | 8 | 9 | ↑1. NFR 카운트 81 정확, AR28 "12 call sites" 코드 일치, 델타 "20 new" 정확 |
| D4 실행가능성 | 20% | 9 | 9 | 유지. AR73+AR28 single story 전략 구체적 |
| D5 일관성 | 15% | 8 | 9 | ↑1. NFR 헤더(P18, S14) 본문과 일치. Epic 29 UXR 범위 coverage map과 일치 |
| D6 리스크 | 10% | 9 | 9 | 유지 |

### R2 가중 평균: 9.08/10 ✅ PASS

계산: (9×0.15) + (9.5×0.15) + (9×0.25) + (9×0.20) + (9×0.15) + (9×0.10) = 1.35 + 1.425 + 2.25 + 1.80 + 1.35 + 0.90 = **9.075 → 9.08**

### 수정 검증 상세

| # | 원본 이슈 | 수정 내용 | 검증 |
|---|----------|---------|------|
| 1 | NFR count 76→81 | Overview L16: "81 active NFRs (76 original + 5 added)" | ✅ |
| 2 | UXR60 Epic 29→23 | Expanded: UXR57-58/60-61 → Epic 23, UXR56/59/62 → Epic 29. L1012-1013 | ✅ |
| 3 | NFR source tags | P18, S11-S14 all tagged "[Added: Step 1 review — quinn]" | ✅ |
| 4 | AR28 renderSoul 10→12 | L378: "12 call sites". L1119: "12 call sites" + breakdown (hub×2, call-agent×2, agora×2) | ✅ |
| 5 | Epic 29 UXR range | L1260: "UXR56, UXR59, UXR62 (OpenClaw-specific)" | ✅ |

**All 5 issues resolved. Zero residual.**

## 이슈 목록

### MODERATE (should fix)

1. **[D3/D5] NFR 카운트 불일치** — Step 2에서 5개 NFR 추가(P18, S11-S14)했으나 3곳 미갱신:
   - Overview (L16): "76 active NFRs" → **81 active NFRs**
   - 섹션 헤더 (L220): "NFR-P1 to NFR-P17" → **NFR-P1 to NFR-P18**
   - 섹션 헤더 (L241): "NFR-S1 to NFR-S10" → **NFR-S1 to NFR-S14** (S7 deleted)
   - 델타 요약 (L821): "15 new" → **20 new** (기존 15 + P18 + S11-S14)
   - **Fix:** 4곳 수치 갱신. 또한 P18/S11-14가 PRD/Architecture에 미존재 → "implementation-added" 태그 권장 (source-extracted와 구분)

### MINOR (nice to have)

2. **[D2] UXR60 매핑 오류** — UXR60("Chat SSE streaming: token-by-token + blinking cursor")은 Hub 채팅 패턴이나, UXR Coverage Map(L1012)에서 "UXR56-62 → Epic 29 (Real-time & WebSocket)"로 묶여 OpenClaw에 배정됨. UXR60은 Epic 23 (Design System / Hub 리디자인)이 적절.
   - **Fix:** UXR Coverage Map에서 UXR60을 Epic 23으로 이동. "UXR56-59, 61-62 → Epic 29"

3. **[D3] 신규 NFR 출처 미명시** — NFR-P18, S11-S14는 PRD/Architecture 어디에도 없음(grep 확인). Epic 설계 중 추가된 구현 요구사항. 내용은 합당(SaaS 보안 기본, 벡터 검색 성능)하나, "Source: Implementation Review" 등 출처 표시 없이 기존 Step 1 NFR 목록에 삽입됨.
   - **Fix:** 추가된 NFR에 "[Added in Step 2]" 태그 또는 별도 "Implementation-Added NFRs" 하위 섹션

### MODERATE (cross-talk 추가)

4. **[D3] AR28 renderSoul call site 카운트 오류** — (dev cross-talk) AR28이 "9 callers (10 call sites)"로 기재했으나, 코드 grep 검증 결과 **9 callers, 12 call sites**:
   - call-agent.ts:67-68 (2, ternary), hub.ts:105-106 (2, ternary), telegram-bot.ts:96 (1), commands.ts:55 (1), presets.ts:45 (1), organization.ts:957 (1), argos-evaluator.ts:379 (1), agora-engine.ts:170+301 (2, direct+cache), v1.ts:46 (1)
   - **Fix:** AR28 "10 call sites" → **"12 call sites"**. agora-engine.ts cache fallback(L301) + ternary 패턴 2건 누락.

5. **[D2] UXR57-58, 60-61 Epic 배정 확대** — (john cross-talk, winston 확인) 원래 MINOR #2에서 UXR60만 지적했으나, john이 UXR57(WS auto-reconnect), UXR58(refresh fallback), UXR61(disconnect banner)도 cross-cutting WebSocket resilience 패턴으로 Epic 29에서 Epic 23으로 이동 필요 지적. 아키텍처 관점 동의:
   - **Epic 29 유지**: UXR56(/ws/office), UXR59(heartbeat), UXR62(/office parallel load) — OpenClaw 전용
   - **Epic 23 이동**: UXR57, UXR58, UXR60, UXR61 — 17개 WS 채널 + Hub SSE 공통 패턴
   - **Fix:** UXR Coverage Map "UXR56-62 → Epic 29" → "UXR56, 59, 62 → Epic 29" + "UXR57-58, 60-61 → Epic 23"

## Cross-talk 요약

### 발송 (winston → peers)
- **john에게**: NFR 카운트 불일치 확인 요청 (76→81). v2 carry-forward FR 테이블(L903-917) 정합성 검증. Epic 23의 대규모 UXR 배정(73+ items) 제품 관점에서 적절한지 확인.
- **dev에게**: Epic 24 AR73+AR28 이중 변경 조율(L1115) 확인. Epic 22 Pre-Sprint NFR-S11-14(보안 기본) 구현 가능성 확인. Epic 28 soul-enricher 확장(AR49) 시 인터페이스 frozen 제약(L1221) 스토리 분리에 영향 있는지 확인.

### 수신 (peers → winston)
- **dev (Round 1)**: (1) Sprint 2 overload — D32에서 이미 "분할 안 함" 해소됨. L1940 open items는 stale. 비이슈. (2) renderSoul count 10→실제 12. 검증 완료, 이슈 #4 추가.
- **dev (Round 2)**: (1) call-agent.ts AR28+AR73 이중 변경 — 비중첩(L57-68 vs L79-82). AR28 먼저, AR73 후속 또는 합치기 권장. (2) NFR-S11/S13 이미 구현됨(secureHeaders L102, loginRateLimit L140). 신규는 S12(file security)+S14(CI audit)만. Epic 22 스코프 축소 가능. (3) EnrichResult memoryVars 키 Sprint 1에 이미 존재(empty {}), Sprint 3은 populate만. 9 callers 변경 불필요. 깔끔한 additive.
- **john**: UXR56-62 중 UXR57-58, 60-61이 cross-cutting 패턴. 아키텍처 동의, 이슈 #5로 확대.

## 아키텍처 관점 종합 평가

**Strengths:**
- 8개 Epic이 AR71 strict order를 정확히 따름. Layer 0 parallel 전략 적절.
- 3개 sanitization chain의 Epic 격리가 AR60을 정확히 반영.
- soul-enricher 파이프라인의 Sprint 1→Sprint 3 additive 확장 패턴이 깔끔.
- AR73(ECC-1) call-agent.ts 이중 변경 의존성이 Epic 24 구현 노트에 명시.
- Coverage map이 495개 요구사항 전부 추적 — 누락 없음.
- Go/No-Go 매트릭스가 Sprint exit별 검증 기준까지 구체적.

**Risks:**
- Epic 23이 73+ UXR + 3 custom components + page consolidation을 담당. 병렬 실행이지만 ≥60% 마일스톤 미달 시 Sprint 3-4 UX 작업 부채 누적 우려.
- NFR-S11-14(보안 기본)가 Pre-Sprint에 배정되었으나, 기존 v2 코드에 HTTP 헤더/rate limiting이 없다면 회귀 테스트 범위가 넓어짐.
