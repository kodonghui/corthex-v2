# Critic-C (Bob, Scrum Master) Review — Stage 2 Step 2: Discovery

**Section:** PRD lines 110–264 (Project Discovery)
**Grade:** B (reverify)
**Date:** 2026-03-22
**Revision:** R3 FINAL (all cross-talk integrated: Winston R1+R2, Quinn, Sally)

---

## 차원별 점수

| 차원 | 가중치 | 점수 | R1→R3 | 근거 |
|------|--------|------|-------|------|
| D1 구체성 | 15% | 8/10 | — | 버전 넘버(PixiJS 8.17.1, n8n 2.12.3, @pixi/react 8.0.5), 파일 경로(`shared/types.ts:484-501`), 정량 수치(33/40, 485 API) 전부 명시. 미확정 2곳("Architecture에서 확정" 류). |
| D2 완전성 | 20% | **7/10** | 8→7 | 8개 서브섹션 충실하나 5건 누락: (1) Voyage AI Sprint 0 블로커 의존성 그래프 누락, (2) costs 제거 backend/test cascading 영향, (3) GATE UX 전환 계획 (Sally), (4) 코드 영향도 GATE 미반영 (Sally), (5) **Pre-Sprint 3항목에 마감일 없음** (Quinn). |
| D3 정확성 | 15% | 7/10 | — | 3건 팩트 불일치 (이슈 #1~#3). ~~R2의 #4(personality sanitization)는 Winston 검증 후 철회~~ — Decision 4.3.2가 권위 소스, PRD 정확. 할루시네이션 없음, 참조 파일 전부 실존. |
| D4 실행가능성 | 15% | 8/10 | — | Sprint별 코드 규모 추정(줄 단위) + 주요 파일명 + 사용자 여정 상세 기술. Discovery 단계로서 충분. |
| D5 일관성 | 15% | **6/10** | 7→6 | 5건 불일치: (1) "Subframe 아키타입" 2곳, (2) n8n 6 vs 8 layers, (3) Brief CEO costs vs GATE 제거, (4) **"삭제: 0줄" vs GATE "전면 제거" 자기모순**, (5) **"71개 페이지" vs GATE 제거 미반영**. ~~R2 #4 personality 레이어 구성은 철회 (Winston 검증: PRD 정확).~~ |
| D6 리스크 | 20% | 8/10 | — | OOM kill, PixiJS 학습 곡선, 에셋 Go/No-Go, Neon Pro 블로커, Layer 0 레드라인 등 주요 리스크 식별. 누락: Voyage AI Sprint 0 블로커, costs 제거 테스트 처리 전략. |

---

## 가중 평균: 7.35/10 ✅ PASS

계산: (8×0.15) + (7×0.20) + (7×0.15) + (8×0.15) + (6×0.15) + (8×0.20) = 1.20 + 1.40 + 1.05 + 1.20 + 0.90 + 1.60 = **7.35**

> D5 6/10이 최저점. 자동 불합격 기준(3점 미만) 해당 없음.
> R2 대비 변경: issue #4 철회(Winston 검증), Quinn Pre-Sprint deadline 추가 → 점수 동일 유지.

---

## 이슈 목록

### 🔴 Must Fix (점수 영향)

**#1 [D3+D5] "Subframe 아키타입" 잔존 — Stitch 2로 교체 필수**
- **위치**: line 167, line 192
- **문제**: Subframe은 폐기됨. Brief §4 L382는 올바르게 "Stitch 2 아키타입 선택". PRD L102 자체도 "Subframe 폐기 → Stitch 2"라고 명시하면서 L167/192에서 Subframe 사용 — 자기모순.
- **동의**: Winston ✅, Quinn ✅, Sally ✅ (전원 일치)
- **수정**: 2곳 모두 "Subframe 아키타입" → "Stitch 2 아키타입"

**#2 [D3] n8n Docker "4GB peak" — Brief 2GB cap과 불일치**
- **위치**: line 155 (`860MB idle/4GB peak`)
- **문제**: Brief `--memory=2g` 하드캡 (3곳 명시). Tech Research L205 확인: 4GB는 n8n 권장치이지 Brief 제약 하 실제 peak 아님.
- **동의**: Winston ✅ (HIGH #4)
- **수정**: `860MB idle/4GB peak` → `860MB idle/2GB cap (Brief mandate, --memory=2g)`

**#3 [D3+D5] n8n 보안 레이어 수: 6 vs 8**
- **위치**: line 158 (`n8n 6-layer 보안`)
- **문제**: Tech Research 최종본(L2324, L2412, Decision 4.2.3 L1172-1180)은 **8-layer**: Network→Auth→Proxy→Webhook→Data→Resource→V8 Heap(NODE_OPTIONS)→Credential(N8N_ENCRYPTION_KEY). PRD 6개만 나열.
- **동의**: Winston ✅ (CRITICAL #3, 8 confirmed with Decision 4.2.3 table)
- **수정**: `6-layer` → `8-layer`, 누락된 2개 레이어 추가

**~~#4 [D3] personality sanitization 레이어 구성 불일치~~ — ❌ 철회 (R3)**
- **철회 사유**: Winston R2 검증 — PRD의 "Key Boundary→API Zod→extraVars strip→Template regex"는 **Decision 4.3.2** (L809-813, 권위적 아키텍처 결정)과 일치. Risk register의 "API Zod→DB JSONB→extraVars→regex"는 다른 표현(동일 목적, 다른 레이어 네이밍). Key Boundary = spread reversal in soul-renderer.ts = 명시적 코드 방어. DB JSONB = 암묵적 타입 강제. 아키텍처적으로 Key Boundary가 정확한 레이어명.
- **Bob 소견**: 내가 Risk register(L2323)를 권위 소스로 잘못 판단. Decision 4.3.2가 최종 결정.

**#5 [D5] "삭제: 0줄" vs GATE "전면 제거" 자기모순** *(Sally + Quinn)*
- **위치**: line 223 (`삭제: 0줄`) vs lines 247-255 (GATE 🔴 제거 4건)
- **문제**: "삭제: 0줄 (Zero Regression)"이라 명시 후, GATE에서 workflows/costs/budget **전면 제거**. 자기모순.
- **Quinn 핵심 질문**: "Zero Regression"의 범위가 무엇인가? API/DB/Engine만? 프론트엔드 페이지 제거는 예외?
- **Quinn 제안 수정**: "삭제: 0줄 (API/DB/Engine 기존 코드 삭제 없음. 프론트엔드 3종은 UXUI 리셋 시 대체 — 즉시 삭제 아님, 신규 페이지로 교체)"
- **Bob 동의**: Quinn의 스코핑 제안이 가장 정확. Zero Regression = 백엔드 불변, GATE 제거 = 프론트엔드 교체. 이 구분을 명시해야 함.

**#6 [D5] 코드 영향도 "71개 페이지" GATE 미반영** *(Sally)*
- **위치**: line 225, line 237 (`71개 페이지`)
- **문제**: GATE에서 최소 5개 페이지 제거. 71→~66개 (+ L255 추가 제거 시 더 적음). 수정 줄 수(`~1,500줄`, `~700줄`)도 재계산 필요.
- **수정**: 71 → GATE 반영 후 정확한 페이지 수. Layer 0 수정 줄 수 재산정.

### 🟡 Should Fix (품질 향상)

**#7 [D2+D6] Voyage AI Sprint 0 블로커 — 의존성 그래프 누락**
- **위치**: lines 163–180 (Sprint 의존성)
- **문제**: Tech Research L345: "Sprint 0 blocker: 2-3 days". Pre-Sprint에 Neon Pro는 있으나 Voyage AI 없음.
- **동의**: Winston ✅, Quinn ✅
- **수정**: Pre-Sprint에 "Voyage AI 마이그레이션 (768d→1024d, 2-3일, 🔴 NOT STARTED)" 추가

**#8 [D2] GATE costs 제거 backend scope 미정의** *(Quinn 강조)*
- **위치**: lines 241–256
- **문제**: "페이지 제거"만 결정. Backend API(costs.ts, budget.ts), WebSocket `cost` 채널, DB 테이블, 관련 테스트 — 범위 미정의.
- **Quinn**: "tech debt ambiguity for Sprint planning" — Sprint 계획 시 혼란 직결.
- **수정**: "제거 범위: UI only (API/DB 유지) / full stack" 결정 명시. 테스트 영향 추정.

**#9 [D2] GATE 제거 페이지 UX 전환 계획 없음** *(Sally)*
- **위치**: lines 241–256
- **문제**: 사이드바 메뉴 처리, bookmark URL (/costs, /admin/costs 등) 404/redirect, v2→v3 사용자 커뮤니케이션 없음.
- **수정**: GATE 하단에 "UX 전환: Architecture/UX에서 설계" 주석 추가

**#10 [D5] Brief §2 vs GATE costs 미조율 + Go/No-Go #7 구분** *(Winston)*
- **위치**: GATE L253 vs Brief L279
- **문제**: Brief CEO 기능에 "Costs / Reports" 잔존. + Go/No-Go #7 (Tier별 Reflection 비용 한도)는 UI 제거와 별개.
- **수정**: GATE 하단에 "NOTE: UI 비용 추적 제거 ≠ 내부 비용 제어 제거. Go/No-Go #7 유지" + Brief §2 수정 필요 주석

**#11 [D4] 🆕 Pre-Sprint 3항목 마감일 부재** *(Quinn)*
- **위치**: lines 166–170 (Pre-Sprint)
- **문제**: 디자인 토큰 확정, Neon Pro 업그레이드, 사이드바 IA 결정 — 3건 모두 "Sprint 1 착수 전 완료 필수"라고만 기재. 구체적 마감일/기간 추정 없음. Sprint 1 시작일을 산정할 수 없음.
- **수정**: 각 항목에 추정 기간 추가 (예: "Neon Pro: 1일 (결제+마이그레이션)", "디자인 토큰: 3-5일 (Phase 0)", "사이드바 IA: 1일 (회의)")

### ℹ️ Observations (참고)

**#12** WebSocket strategy+argos: PRD "16채널" 타입 정의 기준 정확. Winston 검증: `strategy.ts:1449`과 `index.ts:254`에서 broadcast하지만 `channels.ts`에 subscribe 핸들러 없음 = **pre-existing v2 bug** (dead broadcasts). PRD 에러 아님. Architecture에서 핸들러 추가 권고.

**#13** Complexity 33/40 산술: 3+5+3+4+4+5+5+4=33 ✅. 논리적.

**#14** Sprint별 코드 줄 수 산술 (GATE 반영 전): 신규 3,000 ✅, 수정 1,500 ✅ (Quinn 검증 ✅). 이슈 #5/#6 수정 후 재계산 필요.

---

## Cross-talk 요약 (전원 수신 완료)

### Winston (Architect) R1 + R2
- Subframe 동의 ✅, n8n 4GB 동의 ✅, Voyage AI 동의 ✅
- **n8n 8-layer 확인**: Decision 4.2.3 table (L1172-1180) 기준, 8개 명시적 나열. CRITICAL.
- **Personality 4-layer PRD 정확**: Decision 4.3.2 (L809-813)가 권위 소스. "Key Boundary" = spread reversal = 올바른 레이어명. Risk register "DB JSONB"는 다른 표현. → **Bob #4 철회.**
- **WebSocket strategy/argos**: pre-existing v2 bug (broadcast 있으나 subscribe 핸들러 없음). PRD 에러 아님.
- GATE costs + Go/No-Go #7 구분 명시 필요
- **Winston 최종 점수: 7.45/10 PASS** (R1 7.60 → R2 7.45)

### Quinn (QA/Security)
- "삭제: 0줄" vs GATE 모순 동의 ✅ + **Zero Regression 스코프 정의 제안** (API/DB/Engine만, 프론트엔드 교체는 예외) — 채택
- Feature Audit backend scope 미정의 동의 ✅
- **Pre-Sprint 마감일 부재 신규 지적** — 채택, 이슈 #11 추가
- Code estimate 산술 검증 ✅
- **Quinn 점수: 7.60/10 PASS**

### Sally
- GATE UX 전환 계획 없음 — 채택 (이슈 #9)
- Brief CEO costs 충돌 — 이미 이슈 #10으로 커버
- "71개 페이지" GATE 미반영 — 채택 (이슈 #6)
- **Sally 점수: 6.80/10 FAIL** — 주로 D5

### 크리틱 간 합의/갈등 요약

| 이슈 | 동의 수준 |
|------|-----------|
| Subframe → Stitch 2 | **4/4 전원 일치** |
| n8n 4GB → 2GB | 3/4 (Quinn 미언급, 동의 추정) |
| n8n 6→8 layers | 3/4 (Winston CRITICAL 확인) |
| "삭제: 0줄" 자기모순 | **4/4 전원 일치** (핵심 갈등: PASS vs FAIL) |
| Voyage AI Sprint 0 블로커 | 3/4 (Sally 미언급, 동의 추정) |
| ~~Personality 4-layer~~ | **철회** (Winston 검증: PRD 정확) |
| PASS vs FAIL | **3 PASS (W 7.45, B 7.35, Q 7.60) vs 1 FAIL (S 6.80)** |

**PASS/FAIL 갈등 소견 (Bob):**
Sally의 6.80 FAIL은 D5 일관성 문제에 가중치를 높게 둔 결과. 정당한 관점이나, 핵심 구조(Sprint 순서, Layer 체계, 사용자 여정, 의존성 그래프)는 견고하고 이슈 전부가 **텍스트 수정 1회**로 해결 가능. 구조적 재작성이 아닌 정정 수준이므로 **PASS 유지**가 적절.

---

## Delivery Risk Assessment (Scrum Master 관점) — R3 FINAL

| 리스크 | 심각도 | 설명 |
|--------|--------|------|
| Neon Pro 미업그레이드 | 🔴 Critical | Pre-Sprint 블로커, 🔴 NOT STARTED. 전 Sprint 착수 불가. |
| Zero Regression 스코프 미정의 | 🔴 Critical | "삭제: 0줄" vs "전면 제거" — 구현자 방향 불명확. Quinn 스코핑 제안 채택 시 해결. |
| Voyage AI 마이그레이션 누락 | 🟡 High | Sprint 0에 2-3일 블로커가 의존성 그래프에 없음. |
| GATE backend scope 미정의 | 🟡 High | UI만 제거? 아니면 API/DB/테스트까지? Sprint 계획 불확실. |
| Pre-Sprint 마감일 부재 | 🟡 High | 3개 Pre-Sprint 항목에 기간 추정 없음 → Sprint 1 시작일 불명. (Quinn) |
| 코드 영향도 재계산 | 🟡 Medium | GATE 반영 후 페이지 수·줄 수 변경 → Sprint 추정 ±10% 오차. |
| GATE UX 전환 미계획 | 🟡 Medium | sidebar, URL redirect, 사용자 커뮤니케이션 → Sprint 중 발견 시 추가 작업. (Sally) |
| Subframe 표기 | 🟢 Low | 텍스트 수정. |

### 배달 일정 영향 요약
- **Pre-Sprint 블로커 3건** (Neon Pro + Voyage AI + 디자인 토큰) — 기간 미정의 상태. 최소 1~2주 소요 추정.
- **코드 영향도 재계산** 후에야 Sprint별 일정 추정이 신뢰 가능.
- **Zero Regression 스코프 확정**이 Sprint 계획의 전제 조건 — 백엔드 보존 + 프론트 교체인지, 전면 보존인지에 따라 작업량 다름.
- **전체 판단**: 핵심 Sprint/Layer 구조 견고. 이슈 전부 Writer 1회 정정으로 해결 가능. 구조적 재작성 불필요. **PASS 유지**.
