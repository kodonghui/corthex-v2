# Critic-A Review — Stage 6 Step 3: Create Stories

**Reviewer:** Winston (Architect) — Critic-A (Architecture + API)
**File:** `_bmad-output/planning-artifacts/epics-and-stories.md` (lines 1311-2792)
**Date:** 2026-03-24
**Story Count:** 68 stories across 8 epics

## Architecture Focus Areas Verified

| Check | Result | Notes |
|-------|--------|-------|
| AR Coverage (76 ARs) | ✅ | AR1-7→E22, AR26-32→E24, AR33-36→E25, AR37-38→E27, AR39-41→E26, AR42-49→E28, AR50-54→E29, AR73-74→E24, AR75→E28, AR76→E22. Cross-cutting AR8-25/57-72 are constraints, not stories. Coverage map L979-1001 matches |
| E8 boundary | ✅ | 24.2: "services/ (not engine/)" explicit. 24.2: "agent-loop.ts does NOT import soul-enricher directly". 29.3: "engine/agent-loop.ts unmodified". 27.1 uses PreToolResult hooks (existing), not code modification |
| Migration sequence | ✅ | 0061 (22.3, Pre-Sprint) → 0062 (24.1, Sprint 1) → 0063 (28.1, Sprint 3) → 0064 (28.5, Sprint 3, after 28.1→28.4→28.5). Each targets different table. Non-conflicting |
| Dependency order | ✅ | No forward deps within epics. 22.3→22.6 correct (pgvector exists in v2, 22.6 verifies Go/No-Go #10 after 22.3 creates it). 24.1→24.2→24.3→24.7 correct. 28.1→28.2→28.3→28.4→28.5→28.6 correct |
| 3 sanitization chains | ✅ | PER-1 (24.3): "never imports MEM-6 or TOOLSANITIZE (AR60)". MEM-6 (28.2): "never imports PER-1 or TOOLSANITIZE (AR60)". TOOLSANITIZE (27.1): "never imports PER-1 or MEM-6 (AR60)". All explicit |
| Soul-enricher pipeline | ✅ | 24.2: "EnrichResult interface frozen after this sprint". 28.6: "additive — EnrichResult interface frozen, AR49". memoryVars key exists Sprint 1 as `{}`, Sprint 3 populates. 9 callers unchanged in Sprint 3 (dev confirmed) |

### Additional Checks

| Check | Result | Notes |
|-------|--------|-------|
| AR28 count consistency | ✅ | 24.2: "12 call sites". 24.8: "all 12 call sites pass". Matches verified codebase count |
| Go/No-Go coverage | ✅ | #2→24.8, #3→25.6, #4→28.11, #5→29.1, #6→23.20+24.8, #7→28.11, #8→29.8, #9→28.11, #10→22.3, #11→27.3, #12→29.8, #13→29.9, #14→28.10. All 14 gates assigned |
| Cross-sprint dependency | ✅ | 28.11 references "OWASP 50+ pattern expansion verified (cross-sprint from Epic 27)". Clearly tracked |
| AR73+AR28 coordination | ⚠️ | 24.7 says "single story, AR73+AR28 coordination" but AR28 is in 24.2, AR73 is in 24.7. Wording misleading (see Issue #2) |

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | 모든 68 스토리에 Given/When/Then AC 형식. 파일 경로, 마이그레이션 번호, 구체 수치(12 call sites, 32×32px, 10KB, 0.1/week 등) 명시. AR/FR/NFR/UXR/DSR 참조 완비. **그러나** 28.4 reflection trigger "confidence ≥0.7" 조건 모호(per-observation? 평균?). |
| D2 완전성 | 15% | 9/10 | 76 AR 전부 스토리에 매핑. 14 Go/No-Go 전부 exit 스토리에 배정. 3 sanitization chain 각각 독립 스토리. Cross-cutting WebSocket 패턴(23.8) 별도 스토리. v2 carry-forward 기능 보존(23.4 FR-UX3). |
| D3 정확성 | 8/10 | 25% | 마이그레이션 순서, AR28 12 call sites, 기술 버전 전부 정확. **그러나** Story 22.4 전제 오류: "Hono server currently has no security headers" → 실제 `secureHeaders()` L102, `loginRateLimit` L140, CORS L115 이미 존재(서버 코드 확인). 강화/검증이지 신규 구현이 아님. |
| D4 실행가능성 | 20% | 9/10 | 스토리 내 의존성 순서 정확. 코드 수준 참조(파일명, 함수 시그니처, 라인 번호). 24.7 AR73+AR28 조율 명시. 각 Epic에 exit verification 스토리. 28.10 capability evaluation "distinct workstream" 분리 우수. |
| D5 일관성 | 15% | 8/10 | Sprint 배정 AR71 일치. 스토리 번호 연속(22.1-29.9). **그러나** (1) 24.7 "single story" 문구가 24.2/24.7 분리 구조와 불일치. (2) Epic 23이 Step 2 추정(12-15)에서 20 스토리로 확대 — 델타 미설명. |
| D6 리스크 | 10% | 9/10 | 14 Go/No-Go 전부 sprint exit에 배정. 28.4 cost auto-pause ($0.10/day). 28.11 mid-sprint early verification(#7, #9). Cross-sprint OWASP 검증 추적. Epic 23 ≥60% 마일스톤(23.20). |

## R1 가중 평균: 8.60/10 ✅ PASS

계산: (9×0.15) + (9×0.15) + (8×0.25) + (9×0.20) + (8×0.15) + (9×0.10) = 1.35 + 1.35 + 2.00 + 1.80 + 1.20 + 0.90 = **8.60**

---

## R2 Re-Review (Fixes Applied)

### 차원별 점수 (수정 후)

| 차원 | 가중치 | R1 점수 | R2 점수 | 변경 근거 |
|------|--------|---------|---------|----------|
| D1 구체성 | 15% | 9 | 9 | 유지. 28.4 confidence clarification 괄호 내 설명으로 해소. "per-observation average" 약간 어색하나 명확 |
| D2 완전성 | 15% | 9 | 9.5 | ↑0.5. 23.19→23.19+23.20 분리로 Organization NexusCanvas 의존성 해소. Internal dependency graph(L1450) 추가 |
| D3 정확성 | 25% | 8 | 9 | ↑1. 22.4 "hardening" 전제 수정. 29.3 degraded = connection modifier 명확화. 29.8/29.9 "485" → "all existing" |
| D4 실행가능성 | 20% | 9 | 9.5 | ↑0.5. 23.19 분리로 병렬 실행 가능. Epic 23 dependency graph 명시(foundation→pages→components→patterns→cleanup) |
| D5 일관성 | 15% | 8 | 9 | ↑1. 24.7 coordination 언어 수정. Epic 23 델타 설명 추가. 스토리 번호 23.19-23.21 갱신 |
| D6 리스크 | 10% | 9 | 9 | 유지 |

### R2 가중 평균: 9.18/10 ✅ PASS

계산: (9×0.15) + (9.5×0.15) + (9×0.25) + (9.5×0.20) + (9×0.15) + (9×0.10) = 1.35 + 1.425 + 2.25 + 1.90 + 1.35 + 0.90 = **9.175 → 9.18**

### 수정 검증 상세

| # | 원본 이슈 | 수정 내용 | 검증 |
|---|----------|---------|------|
| 1 | 22.4 false premise | L1393: "has existing security headers...that need hardening" | ✅ |
| 2 | 24.7 "single story" | L2059: "coordinates with Story 24.2" | ✅ |
| 3 | 28.4 confidence trigger | L2475: "individual observations with confidence ≥0.7 count toward the 20 threshold" | ✅ |
| 4 | Epic 23 delta | L1316: "expanded from 12-15 to 20 stories (per Step 2 critic feedback)" | ✅ |
| 5 | 23.19 split | 23.19(Docs+ARGOS+Activity) + 23.20(Organization) + 23.21(Subframe). L1450 dependency graph | ✅ |
| 6 | 29.3 state count | L2697: "5 states...degraded is a connection-level modifier (not agent state)" | ✅ |
| 7 | 29.8/29.9 "485" | L2806+L2822: "all existing API endpoints" (no hardcoded number) | ✅ |

**All 7 issues resolved. Zero residual.**

## 이슈 목록

### MODERATE (should fix)

1. **[D3] Story 22.4 전제 오류 — secureHeaders 이미 존재** — AC "Given the Hono server currently has no security headers"는 사실과 다름. 서버 코드 확인:
   - `secureHeaders()` (L102-113): CSP, HSTS, X-Frame-Options, X-Content-Type-Options 이미 적용
   - `loginRateLimit` 5/min + `apiRateLimit` 100/min (L140-145) 이미 존재
   - CORS (L115-120) prod/dev origin 분리 이미 구현
   - 신규 작업은 NFR-S12(file attachment security)와 NFR-S13 임계값 조정(10→5 req/min) 정도
   - **Fix:** AC 전제를 "Given the Hono server has existing security headers that need hardening for v3 SaaS requirements" 수정. 기존 구현과 신규 강화 항목을 구분. Dev 크로스톡에서 확인: "mostly hardening existing implementations, not greenfield"

### MINOR (nice to have)

2. **[D5] Story 24.7 "single story" 문구 불일치** — 24.7 AC에 "same file as AR28 soul-enricher changes — single story" 기재. 그러나 실제 AR28은 Story 24.2에, AR73+AR74는 Story 24.7에 분리됨. Step 2 구현 노트(L1119-1120)도 "single story handles both" 명시. 스토리가 순차 실행이므로 merge conflict 없으나 문구가 혼란 유발.
   - **Fix:** 24.7 AC를 "coordinates with Story 24.2 (AR28) which modifies the same file" 수정. 또는 "AR28 changes in 24.2 applied first, AR73 changes in this story applied second"

3. **[D1] Story 28.4 reflection trigger 조건 모호** — "triggers when per-agent unreflected observations ≥20 AND confidence ≥0.7" — confidence ≥0.7이 개별 observation 조건인지(≥20개 중 confidence≥0.7인 것만 대상) 집계 조건인지(평균 confidence≥0.7일 때 trigger) 불명.
   - **Fix:** "≥20 unreflected observations with individual confidence ≥0.7" 또는 "≥20 unreflected observations AND average confidence ≥0.7" 명확화

4. **[D5] Epic 23 스토리 수 확대 미설명** — Step 2에서 "12-15 stories" 추정. Step 3에서 20 스토리로 확대(33-67% 증가). 내용은 합당하나(디자인 토큰, 컴포넌트, 7 레이아웃, 접근성, 애니메이션, 3 커스텀 컴포넌트, 6 페이지 그룹, 상태관리 등) 델타 근거 미기재.
   - **Fix:** Epic 23 도입부에 "Step 2 estimated 12-15 stories; expanded to 20 due to [reason: custom components, cross-cutting WS patterns, and page-specific redesigns separated for parallel development]" 설명 추가

### MINOR (cross-talk 추가)

6. **[D3] Story 29.3 "5 states + degraded" 모호** — (dev cross-talk) AC "5 states broadcast: idle, working, speaking, tool_calling, error + degraded" — NRT-1(L795)은 "5-state + PRD addition (degraded)"로 6개 display state. NRT-2(L796)는 degraded = heartbeat timeout 15s. 4-color mapping도 6개(idle→blue, active→green, error→red, degraded→orange). "5 states + degraded" 표현이 error와 degraded를 합친 것으로 오독 가능.
   - **Fix:** "6 states broadcast: idle, working, speaking, tool_calling, error, degraded (NRT-1: 5 base + degraded per NRT-2 heartbeat timeout)"

7. **[D3] Story 29.8/29.9 "485 API endpoints" 수치 불확실** — (dev cross-talk) project-context.yaml L72 `api_endpoints: 485`가 출처. dev grep 결과 ~453 route registrations. ~7% 차이. WS upgrade/health/parameterized variants 포함 여부 불명.
   - **Fix:** "485 API endpoints" → "all existing API endpoints (baseline from project-context.yaml)" 또는 실제 route 카운트 재검증

## Cross-talk 요약

### 발송 (winston → peers)
- **john에게**: Epic 23 20 스토리 확대(Step 2 12-15 추정 대비) 제품 관점 적정성 확인. Story 23.19가 4 페이지 그룹을 1 스토리로 묶었는데 적절한지.
- **dev에게**: Story 22.4 secureHeaders 전제 오류 확인(이미 존재, dev가 Step 2에서 확인). Story 28.4 confidence ≥0.7 trigger 조건 — AR47 원문에서 명확한지. Story 27.1 PreToolResult hook 경로(2 external, 3 internal exempt) 코드 레벨 정확성.

### 수신 (peers → winston)
- **john**: (1) Epic 23 20 스토리 적절 (Step 2에서 12-15 빡빡하다 지적 → bob-2가 18-22로 상향). (2) Story 23.19 분리 필수 — Organization에 NexusCanvas dependency. Architecture 동의, 이슈 #5 추가.
- **dev**: (1) 22.4 writer error 동의, hardening framing. (2) 29.3 "5 states + degraded" = 실제 6 display states. NRT-2 heartbeat timeout trigger. 이슈 #6 추가. (3) 485 API endpoints — grep 결과 ~453. project-context.yaml 차이. 이슈 #7 추가.

## 아키텍처 관점 종합 평가

**Strengths:**
- 68 스토리가 76 AR을 빠짐없이 커버. Coverage map과 1:1 대응.
- 마이그레이션 순서(0061→0064)가 테이블 격리 + 스프린트 순서를 정확히 반영.
- 3 sanitization chain이 각 스토리에서 AR60 독립성을 명시적으로 선언.
- soul-enricher Sprint 1 frozen → Sprint 3 additive 패턴이 스토리 레벨에서도 일관.
- Go/No-Go 14개가 전부 exit verification 스토리에 매핑 — 누락 없음.
- Epic 24 내 AR73+AR28 조율이 파일 레벨(call-agent.ts L67-68 vs L79-82)까지 명시.
- PreToolResult 훅 활용(27.1)으로 agent-loop.ts 무수정 원칙 준수.

**Risks:**
- Epic 23 (20 스토리)가 가장 대규모. 23.19 "4 remaining pages" 1 스토리가 병목 가능.
- Story 22.4 전제 수정 안 하면 구현 시 "이미 있는 기능을 처음부터 다시 만드는" 혼란 우려.
- Story 28.4 confidence trigger 불명확하면 구현자가 임의 해석할 리스크.
