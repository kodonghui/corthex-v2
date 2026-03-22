# Stage 2 Step 04 — Executive Summary Fixes Applied

**Writer:** john
**Date:** 2026-03-22
**Section:** PRD lines 273–459 (## Executive Summary)
**Pre-fix scores:** Winston 7.60, Quinn 6.65 (FAIL), Sally 7.05 (borderline), Bob 7.15 — Avg 7.11

---

## Fixes Applied (11 total)

### CRITICAL (2)

**Fix 1: Go/No-Go gates "8개" → "14개" (Brief §4 원본 11 + Stage 1 3개)**
- L447: "8개" → "14개 (Brief §4 원본 11 + Stage 1 확정 결정 3개 추가)"
- Added 5 new gates:
  - #9: Observation Poisoning 4-layer defense (확정 결정 #8)
  - #10: Voyage AI 마이그레이션 완료 (확정 결정 #10)
  - #11: 에이전트 보안 Tool Sanitization (Brief #9, ECC 2.1)
  - #12: v1 기능 패리티 (Brief #10)
  - #13: 사용성 검증 (Brief #11, v2 교훈)
- Existing #9 Capability Evaluation → renumbered to #14
- **Source:** ALL 4 critics (unanimous), confirmed-decisions-stage1.md #11, Brief §4

**Fix 2: Gate #6 definition → Brief alignment**
- Old: "Stitch 2 디자인 토큰 추출 완료 — DESIGN.md + tokens.css 생성 확인"
- New: "UXUI Layer 0 자동 검증 — ESLint 하드코딩 색상 0 + Playwright dead button 0 (Brief §4 기준)"
- tokens.css 생성은 선행 조건이지 게이트 자체가 아님 (Brief 정의와 통일)
- **Source:** Sally C2

### MAJOR (5)

**Fix 3: Gate #7 — 자동 차단 메커니즘 추가**
- Old: "Haiku 비용 ≤ $0.10/일"만 기재
- New: "+ 비용 한도 초과 시 크론 자동 일시 중지 (ECC 2.2). Tier별 일일/월간 예산 한도 PRD 확정"
- Confirmed decisions #11 cost ceiling도 이 게이트에 통합
- **Source:** Sally M4, Quinn #1 (cost ceiling)

**Fix 4: Pre-Sprint Voyage AI migration blocker 추가**
- L425-428: 3개 → 4개 블로커
- Added: "Voyage AI 임베딩 마이그레이션 (768d→1024d, re-embed + HNSW rebuild, 2-3일, 🔴 Sprint 3 블로커)"
- Pre-Sprint 기간: "1~2일" → "2~4일" (Voyage AI 포함)
- **Source:** ALL 4 critics (unanimous)

**Fix 5: L428 "테마 결정" → "디자인 토큰 확정 (Stitch 2 DESIGN.md 기반)"**
- Discovery L167과 표현 통일
- **Source:** Winston L1

**Fix 6: Risk registry — 6개 항목 추가 (R10-R15)**
- R10: Observation content poisoning → reflection LLM 오염 공격 체인 (🟠 High)
- R11: Voyage AI 임베딩 마이그레이션 (🔴 Critical, Pre-Sprint)
- R12: Reflection cron 동시 실행 → 중복 reflections (🟡 Medium)
- R13: CLI Max 과금 정책 변동 (기존 항목을 ID 포함 형식으로 이동)
- R14: Solo dev + PixiJS (기존 항목을 ID 포함 형식으로 이동)
- R15: /ws/office 연결 flood (🟢 Low)
- **Source:** Quinn #3/#4, Bob #3, Winston H1, Sally (cross-talk)

**Fix 7: Sprint 3 roadmap — Option B 작업 추가**
- L437: "+ agent_memories 확장 (embedding 컬럼, Option B)" 추가
- **Source:** Winston M2

### MINOR (4)

**Fix 8: R7 stale line reference**
- "L306과 동일 순서" → "What Makes This Special #2와 동일 순서" (라인 번호 대신 섹션명 참조)
- **Source:** Winston M1

**Fix 9: L376 Reflection trigger 정합**
- "에이전트당 일 1회" → "일 1회 크론 + reflected=false 관찰 20개 이상 조건 충족 시" (Product Scope L910 정합)
- **Source:** Quinn #5

**Fix 10: UXUI ≥60% 측정 기준 정의**
- "≥60% 미달 시 레드라인" → "+ (토큰 적용 페이지 수 / 전체 페이지 수)" 측정 정의 추가
- **Source:** Sally m5

**Fix 11: UX 경험 지표 접근성 행 추가**
- "접근성 기본선 | Big Five 슬라이더 키보드 조작 가능 + /office aria-live 에이전트 상태 텍스트 대안"
- **Source:** Sally m6

---

## NOT Fixed (deferred or out of scope)

| Item | Reason | Deferred to |
|------|--------|-------------|
| v2 audit numbers v3 deltas | v2 현재 규모 섹션이므로 v3 변경은 Product Scope에서 기술 | Product Scope (이미 반영) |
| CLI Max risk → cost ceiling gate 연결 | R13에서 "Go/No-Go #7 cost ceiling 연동" 언급으로 충분 | — |

---

## Confirmed Decisions Coverage (Executive Summary 내)

| # | Decision | Status |
|---|----------|--------|
| 1 | Voyage AI 1024d | ✅ Pre-Sprint blocker + Go/No-Go #10 |
| 2 | n8n Docker 2G | ✅ R6 |
| 3 | n8n 8-layer security | ✅ Go/No-Go #3 |
| 4 | Stitch 2 | ✅ Go/No-Go #6 |
| 5 | 30일 TTL | ⚠️ Product Scope level detail |
| 6 | LLM Cost $17/mo | ✅ Go/No-Go #7 cost ceiling |
| 7 | reflected/reflected_at | ⚠️ Product Scope level detail |
| 8 | Observation poisoning | ✅ **R10 + Go/No-Go #9** |
| 9 | Advisory lock | ✅ **R12** |
| 10 | WebSocket limits | ✅ **R15** |
| 11 | Go/No-Go 11 gates | ✅ **Fix 1 (14개)** |
| 12 | host.docker.internal | ⚠️ Architecture level detail |
