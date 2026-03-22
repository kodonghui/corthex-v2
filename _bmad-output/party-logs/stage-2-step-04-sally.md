# Critic-UX (Sally) Review — Stage 2 Step 4: Executive Summary

> Reviewer: Sally (UX Designer)
> Weights: D1=15%, D2=20%, D3=15%, D4=15%, D5=20%, D6=15%
> Section: PRD `prd.md` lines 273–459 (## Executive Summary)
> Cross-refs: Brief §4, confirmed-decisions-stage1.md, Steps 2-3 fixes, PRD L568-583 + L1681-1720
> NOTE: 용어 치환 이슈는 Pre-sweep 완료. 구조/로직/정합성만 평가.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | v2 감사 테이블(L279-289) 파일 위치까지 포함, WS 16개 채널 개별 열거 우수. 페르소나 연령/직무/온보딩 순서 구체적. 리스크 ID+심각도+완화+잔여 체계적. Minor: L435 UXUI 게이팅 "≥60%" 측정 기준 미정의. |
| D2 완전성 | 7/10 | Brief 11개 게이트 중 PRD에 9개만 존재. **Brief #9(에이전트 보안/tool sanitization), #10(v1 기능 패리티), #11(사용성 검증)** 완전 누락. Pre-Sprint에서 Voyage AI 마이그레이션 빠짐 (Discovery L193에는 있음). 게이트 #7 자동 차단 메커니즘 미기재. |
| D3 정확성 | 7/10 | v2 감사 수치 정확 (audit.md 대조). 페르소나, 리스크 심각도, Sprint 순서 올바름. **But:** L447 "게이트 **8개**" → 실제 9개 열거, Brief는 11개. 자기 문서 내 카운트 오류. |
| D4 실행가능성 | 8/10 | Sprint 로드맵 명확 (Pre-Sprint→1→2→3→4 + Layer 0 병행). 게이팅 포인트(L435, L440-441) 구체적. 리스크 완화 전략 실행 가능. |
| D5 일관성 | 5/10 | **(1)** 게이트 #6 — PRD 내 **3가지 다른 정의**: Executive Summary L455 "Stitch 2 토큰 추출", Success Criteria L574 "tokens.css + 디자인 시스템 준수", Implementation L1693 "ESLint 0 + Playwright dead button 0". Brief는 L1693과 일치. **(2)** 게이트 총수: header "8개" vs body 9개 vs Brief 11개 vs Success Criteria 12개+(신규 포함). **(3)** Pre-Sprint 항목: Executive Summary(L425-428) 3개 vs Discovery(L193) 4개 (Voyage AI 누락). **(4)** 게이트 #7: Executive Summary "비용 ≤ $0.10/일"만 vs Implementation L1694 "비용 한도 초과 시 크론 일시 중지" vs Brief "자동 차단 메커니즘(ECC 2.2)". 동일 게이트의 범위가 섹션마다 다름. |
| D6 리스크 | 8/10 | 7개 리스크 + 2개 추가(L409-413) = 9개. CLI Max 정책 변동, solo dev 역량, Docker OOM 포함. Sprint 4 마지막 배치(실패 무영향) 전략 우수. Missing: Voyage AI 마이그레이션 실패 리스크 (embedding 불일치 시 Sprint 3 Memory 블로킹). |

---

## 가중 평균: 7.05/10 ⚠️ BORDERLINE PASS

계산: (8×0.15) + (7×0.20) + (7×0.15) + (8×0.15) + (5×0.20) + (8×0.15) = 1.20 + 1.40 + 1.05 + 1.20 + 1.00 + 1.20 = **7.05**

> ⚠️ 기술적 PASS이나 게이트 정합성 이슈는 Critical — 반드시 수정 필요. 게이트는 ship/no-ship 결정 기준이므로 섹션 간 불일치는 실행 리스크.

---

## 이슈 목록

### Critical (Go/No-Go 게이트 정합성)

1. **[D5/D2] Go/No-Go 게이트 — Brief 대비 3개 누락 + 카운트 오류**
   - L447 header: "게이트 **8개**" — 실제 9개 열거 (카운트 자체 오류).
   - Brief §4: **11개** 게이트 (#1-#11). PRD에 없는 것:
     - **Brief #9** 에이전트 보안: "Tool response sanitization 검증 — tool output 경유 프롬프트 주입 방어 (ECC 2.1)"
     - **Brief #10** v1 기능 패리티: "v1-feature-spec.md 체크리스트 전수 검증 — 슬래시 명령어 8종, CEO 프리셋, 위임 체인 등"
     - **Brief #11** 사용성 검증: "Admin 온보딩 위저드 외부 도움 없이 완료 + CEO 태스크 플로우 5분 이내 완주"
   - **특히 #11이 심각**: v2 교훈 = "10,154 테스트 통과했으나 실사용 불가 → 폐기". 사용성 게이트 누락은 v2 실패 반복 리스크.
   - Confirmed Decision #11도 "8→11 gates" 명시.
   - **수정**: (A) header 카운트를 실제 게이트 수와 일치시키고, (B) Brief #9/#10/#11 추가 (최소 11개). PRD #9 Capability Evaluation은 유지하되 Brief 게이트와 병합 또는 별도 번호.

2. **[D5] 게이트 #6 — PRD 내 3가지 상이한 정의**
   - Executive Summary L455: "Stitch 2 디자인 토큰 추출 완료 — DESIGN.md + tokens.css 생성 확인"
   - Success Criteria L574: "디자인 토큰 추출 — tokens.css 생성 + Stitch 2 디자인 시스템 준수"
   - Implementation L1693: "UXUI Layer 0 — ESLint 하드코딩 색상 0 + Playwright dead button 0"
   - Brief §4 #6: "UXUI Layer 0: ESLint 하드코딩 색상 0 + Playwright dead button 0" = **L1693과 일치**.
   - 개발자가 Executive Summary를 참고하면 "tokens.css만 생성하면 통과"로 오인. 실제 Brief 기준은 ESLint+Playwright 자동화 검증.
   - **수정**: Executive Summary 게이트 #6을 Brief 정의로 통일. "tokens.css 생성"은 선행 조건이지 게이트 자체가 아님.

### Major (Pre-Sprint 정합성)

3. **[D5/D2] Pre-Sprint에서 Voyage AI 마이그레이션 누락**
   - Discovery L193: "Pre-Sprint | Layer 0 | Product | 디자인 토큰 확정 (Stitch 2 DESIGN.md 기반) + **Voyage AI 마이그레이션 (768d→1024d)**"
   - Executive Summary Pre-Sprint L425-428: 3개만 열거 — Neon Pro, 사이드바 IA, 테마 결정. **Voyage AI 없음**.
   - Voyage AI 마이그레이션이 Pre-Sprint에서 빠지면 Sprint 3 Memory(observations VECTOR(1024))가 블로킹됨.
   - **수정**: L425-428 Pre-Sprint에 "Voyage AI 임베딩 마이그레이션 (768d→1024d, re-embed + HNSW rebuild)" 추가.

4. **[D2] 게이트 #7 자동 차단 메커니즘 누락**
   - Brief #7: "Tier별 한도 PRD 확정 후 구현... **Tier별 일일/월간 예산 한도 초과 시 에이전트 실행 자동 차단 메커니즘** 포함 (ECC 2.2)"
   - Implementation L1694: "비용 한도 초과 시 **크론 일시 중지**" — 부분 반영.
   - Executive Summary L456: "Haiku 비용 ≤ $0.10/일" — 비용 한도만, 자동 차단 없음.
   - 자동 차단이 없으면 비용 초과 시 수동 개입 필요 → CEO 앱 사용자에게 예상치 못한 비용 발생 리스크.
   - **수정**: Executive Summary 게이트 #7에 "비용 한도 초과 시 자동 차단 (ECC 2.2)" 추가.

### Minor

5. **[D1] L435 UXUI 게이팅 "≥60% 미달 시 레드라인" — 측정 기준 미정의**
   - Sprint 2→3 사이에 "Layer 0 UXUI ≥60% 미달 시 레드라인" — 60%가 뭘 의미하는지 불명확.
   - ESLint rule 통과율? 디자인 토큰 적용률? 페이지 전환 완료율?
   - **수정**: "UXUI Layer 0 전환율 60%+ (토큰 적용 페이지 수 / 전체 페이지 수)" 등 측정 가능한 정의.

6. **[D2] UX 경험 지표(L381-391)에 접근성(a11y) 메트릭 부재**
   - Step 2에서 Journey C 접근성이 추가되었고, Success Criteria L583에도 a11y 게이트(aria-valuenow, 키보드) 존재.
   - 그러나 Executive Summary의 "사용자 경험 지표" 테이블(L381-391)에는 접근성 지표 없음.
   - **수정**: "접근성 기본선" 행 추가 — "Big Five 슬라이더 키보드 조작 가능, /office aria-live 대안 패널 제공" 등.

---

## Cross-talk 요약

- **Winston에게**: 게이트 #6 — 3가지 정의 중 Implementation L1693만 Brief와 일치. Architecture 관점에서 "토큰 추출"과 "ESLint 0 + Playwright 0"은 서로 다른 검증 단계 — 둘 다 필요하되 게이트 정의를 통일해야. 게이트 총수 Brief 11 vs PRD 9 — architecture section에서도 게이트 참조 시 주의.
- **Quinn에게**: Brief #9(tool sanitization gate) PRD 전체에서 누락. observation poisoning은 Feature 5-4에 방어 로직 있으나 Go/No-Go 게이트로는 미등록. 테스트 시나리오에서 "게이트 통과 = 출시 가능" 기준이 되려면 #9 필수. Brief #10(v1 패리티)도 QA 전수 검증 대상인데 게이트에 없음.
- **Bob에게**: Brief #11 사용성 검증 게이트 누락 — v2 교훈(기술 완성도≠제품 완성도) 직접 관련. Sprint 계획 시 사용성 검증을 어느 Sprint에서 수행할지 결정 필요. Pre-Sprint Voyage AI 마이그레이션 누락 → Sprint 3 Memory 일정에 영향.

### Escalation
- **Brief↔Confirmed Decisions 게이트 #9/#10/#11 소스 충돌** — Brief와 Confirmed Decisions가 같은 번호에 다른 게이트를 배정. John에게 escalation → canonical list 통합 결정됨 (Brief 11 + Confirmed 3 = 14개).

---

## Post-Fix Verification (11 fixes applied)

> Verified: 2026-03-22
> Fixes log: `_bmad-output/party-logs/stage-2-step-04-fixes.md`

### 검증 결과: 6개 이슈 전부 해결 ✅

| # | 이슈 | 상태 | 검증 근거 |
|---|------|------|----------|
| 1 | Go/No-Go 게이트 3개 누락 + 카운트 오류 | ✅ 해결 | L453 "14개" — Brief 11개(#1-#8 유지 + #9 obs poisoning, #10 Voyage, #11 agent security, #12 v1 parity, #13 usability) + Confirmed 고유 3개 통합 + original #9→#14 renumber. 소스 충돌 해소. |
| 2 | 게이트 #6 3가지 정의 | ✅ 해결 | L461 "ESLint 하드코딩 색상 0 + Playwright dead button 0 (Brief §4 기준)" — Brief 정의로 통일. |
| 3 | Pre-Sprint Voyage AI 누락 | ✅ 해결 | L432 "Voyage AI 임베딩 마이그레이션 (768d→1024d, re-embed + HNSW rebuild, 2-3일, 🔴 Sprint 3 블로커)". Pre-Sprint 기간 2~4일로 확장. |
| 4 | 게이트 #7 자동 차단 누락 | ✅ 해결 | L462 "비용 한도 초과 시 크론 자동 일시 중지 (ECC 2.2). Tier별 일일/월간 예산 한도 PRD 확정". |
| 5 | UXUI ≥60% 미정의 | ✅ 해결 | L441 "(토큰 적용 페이지 수 / 전체 페이지 수)" — 측정 가능한 정의. |
| 6 | UX 경험 지표 접근성 부재 | ✅ 해결 | L392 "Big Five 슬라이더 키보드 조작 가능 + /office aria-live 에이전트 상태 텍스트 대안". |

**추가 검증 (cross-talk 반영 fixes):**
- R7 stale reference → L403 "What Makes This Special #2와 동일 순서" ✅
- Reflection trigger → L376 "일 1회 크론 + 20개 조건" 통합 ✅
- Risk registry R10-R15 → 6개 신규 리스크 추가 (obs poisoning, Voyage, concurrency, CLI Max, solo dev, WS flood) ✅
- Sprint 3 → L443 "agent_memories 확장 (Option B)" 명시 ✅
- "테마 결정" → L434 "디자인 토큰 확정" Discovery 통일 ✅

### Post-Fix 차원별 점수 (11 fixes 반영)

| 차원 | 수정 전 | 수정 후 | 근거 |
|------|--------|--------|------|
| D1 구체성 | 8 | 9 | 리스크 15개(R1-R15), 게이트 14개 각각 검증 방법 명시, UXUI 게이팅 측정 정의, 접근성 기본선 구체적. |
| D2 완전성 | 7 | 9 | Brief 11 + Confirmed 3 = 14 게이트 전부 반영. Pre-Sprint 4개 항목 완비. 자동 차단 메커니즘. 접근성 UX 메트릭. |
| D3 정확성 | 7 | 9 | 게이트 카운트 "14개" = body 14행 일치. 게이트 #6 Brief 정의로 통일. 게이트 #7 ECC 2.2 자동 차단 포함. Reflection trigger 이중 조건 명확. |
| D4 실행가능성 | 8 | 8 | 게이트 검증 방법 구체적. Pre-Sprint 일정 2-4일 현실적. Minor: Admin 온보딩 ≤15min은 위저드 UX 설계에 의존 (UX Design 아티팩트). |
| D5 일관성 | 5 | 9 | 게이트 canonical list 통합(Brief+Confirmed+original). 게이트 #6 Brief 정의 통일. Pre-Sprint↔Discovery 정합. Reflection trigger Executive Summary↔Product Scope 정합. |
| D6 리스크 | 8 | 9 | 15개 리스크 포괄. Observation poisoning(R10), Voyage migration(R11), WS flood(R15) 추가. Go/No-Go 교차 참조 완비. |

### Post-Fix 가중 평균: 8.85/10 ✅ PASS

계산: (9×0.15) + (9×0.20) + (9×0.15) + (8×0.15) + (9×0.20) + (9×0.15) = 1.35 + 1.80 + 1.35 + 1.20 + 1.80 + 1.35 = **8.85**

> 7.05→8.85: +1.80 향상. 게이트 소스 충돌 해소(Brief↔Confirmed 통합 14개)가 가장 큰 개선. D5 일관성 5→9 (+4)가 주요 기여.
