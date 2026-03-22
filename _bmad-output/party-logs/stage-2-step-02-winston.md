# Critic-A Review — Stage 2 Step 2: Discovery (PRD L110-264)

**Reviewer**: Winston (Architecture + API)
**Date**: 2026-03-22
**Artifact**: `_bmad-output/planning-artifacts/prd.md` lines 110–264
**Grade Request**: B (reverify)
**Revision**: v3 FINAL (post cross-talk + post-fix verification)

---

## Initial Review Score: 7.45/10 ✅ PASS

### Initial 차원별 점수 (pre-fix)

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 8/10 | 15% | 파일 경로, 버전, 수치 전부 명시. 감점: Subframe 2곳 |
| D2 완전성 | 8/10 | 15% | 8개 서브섹션 커버. 감점: Voyage AI 블로커 누락 |
| D3 정확성 | 7/10 | **25%** | 수학 검증 ✓. 감점: Subframe 2곳, "4GB peak" 오해, n8n "6-layer" (Bob) |
| D4 실행가능성 | 8/10 | **20%** | Sprint 순서, 블로커, 코드 추정 actionable. 감점: 비용 제거 범위 모호 |
| D5 일관성 | 6/10 | 15% | 감점: Subframe 자기모순, 4GB↔2G, 6-layer↔8-layer (Bob) |
| D6 리스크 | 8/10 | 10% | 주요 리스크 식별. 감점: 비용 제거↔Go/No-Go #7 충돌 미언급 |

**Initial 가중 평균**: (8×0.15)+(8×0.15)+(7×0.25)+(8×0.20)+(6×0.15)+(8×0.10) = 1.20+1.20+1.75+1.60+0.90+0.80 = **7.45**

---

## Initial 이슈 목록 (8건)

### CRITICAL (3건 → 전부 수정됨 ✅)

| # | 이슈 | 수정 확인 |
|---|------|----------|
| 1 | L167 "Subframe 아키타입" → Stitch 2 | ✅ Now: "Stitch 2 DESIGN.md 기반" |
| 2 | L192 "Subframe 아키타입" → Stitch 2 | ✅ Now L193: "Stitch 2 DESIGN.md 기반 + Voyage AI 마이그레이션" |
| 3 | L158 "n8n 6-layer" → 8-layer (Bob) | ✅ Now: "n8n 8-layer 보안(Docker network→Hono proxy→API key header injection→tag-based tenant filter→webhook HMAC→rate limiting→N8N_ENCRYPTION_KEY→NODE_OPTIONS)" |

### HIGH (1건 → 수정됨 ✅)

| # | 이슈 | 수정 확인 |
|---|------|----------|
| 4 | L155 "860MB idle/4GB peak" 오해 유발 | ✅ Now: "860MB idle, Docker 2G cap — Brief mandate `--memory=2g`, n8n docs 4GB 권장이나 Brief 제약으로 OOM 리스크 상승" |

### MEDIUM (2건 → 전부 수정됨 ✅)

| # | 이슈 | 수정 확인 |
|---|------|----------|
| 5 | Sprint 의존성에 Voyage AI 블로커 누락 | ✅ Now L169: "Voyage AI 임베딩 마이그레이션 (Gemini 768d → Voyage 1024d, 기존 데이터 re-embed + HNSW rebuild, 2-3일 추정, 🔴 NOT STARTED)" |
| 6 | L253 "비용 전면 제거" 범위 모호 | ✅ Now L263: "범위 주의: UI 비용 페이지만 제거. Reflection LLM 내부 비용 관리(Go/No-Go #7, Tier별 Haiku $1.80/mo vs Sonnet $39/mo 비용 한도)는 유지. cost WS 채널 + 관련 API deprecated 전략은 Architecture 단계에서 확정." |

### LOW (2건 → 잔존, 수정 불필요)

| # | 이슈 | 상태 |
|---|------|------|
| 7 | WS strategy+argos subscribe handler 없음 | 기존 v2 코드 버그. 아키텍처 carry-forward. PRD 수정 불필요 |
| 8 | Personality 4-layer: Key Boundary → DB JSONB로 변경됨 | 두 formulation 모두 유효. 현재 risk register 버전 채택. 수정 불필요 |

### 추가 이슈 (Sally/Quinn cross-talk 수신)

| 출처 | 이슈 | 상태 |
|------|------|------|
| Sally #2 | "삭제: 0줄" vs "costs 전면 제거" 모순 | ✅ 이미 수정됨: L228 "삭제: ~200줄 (GATE 결정 반영)" + L231 "Zero Regression 정의" 추가 |
| Quinn #2 | 동일 이슈 | ✅ 이미 수정됨 |
| Quinn #3 | cost WS 채널 제거 시 회귀 | ✅ L263에서 Architecture 단계 확정으로 deferred |
| Quinn #4 | Docker 4G 주장 | ❌ Quinn 오류 — Stage 1 FIX-S6-1/S6-8은 "4GB→2G"로 수정 (not 2G→4G). 현재 PRD "2G cap" 정확 |

---

## Post-Fix 검증 점수: 8.70/10 ✅ PASS (Grade A)

### Post-fix 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 15% | 모든 참조 구체적+정확. Stitch 2 정확, 8-layer 정확, 2G cap 정확. "적절한" 표현 0곳 |
| D2 완전성 | 9/10 | 15% | 8개 서브섹션 + Voyage AI 블로커 추가 + Zero Regression 정의 + 비용 범위 주석 추가. 엣지 케이스 커버 우수 |
| D3 정확성 | 9/10 | **25%** | 모든 수치 검증 통과. 8-layer 정확, 2G Docker 정확, Stitch 2 정확. 유일한 미세 이슈: WS 16채널 type vs 14 subscribe (LOW, 코드 버그) |
| D4 실행가능성 | 8/10 | **20%** | Sprint 순서, 블로커 4개(Neon Pro, Voyage AI, 디자인 토큰, 사이드바 IA), GATE 결정 actionable. Zero Regression 정의로 실행 명확성 상승 |
| D5 일관성 | 9/10 | 15% | Subframe→Stitch 2 통일, 6→8 layer 통일, 4GB→2G cap 통일, 삭제 0줄→200줄 GATE 반영, 비용 제거 범위 명시 |
| D6 리스크 | 8/10 | 10% | 주요 리스크 식별, OOM 리스크 명시, Sprint 블로커 4개, Go/No-Go 게이팅 |

**Post-fix 가중 평균**: (9×0.15)+(9×0.15)+(9×0.25)+(8×0.20)+(9×0.15)+(8×0.10) = 1.35+1.35+2.25+1.60+1.35+0.80 = **8.70**

---

## 자동 불합격 검토

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ❌ 없음 |
| 보안 구멍 | ❌ 없음 |
| 빌드 깨짐 | ❌ N/A |
| 데이터 손실 위험 | ❌ 없음 |
| 아키텍처 위반 | ❌ 없음 |

---

## Cross-talk 요약

### Bob (Critic-C) → Winston

| 질문 | 판단 |
|------|------|
| n8n 6 vs 8 layer | **8이 정확**. L1541 stale, L2324/L2412 최종. → CRITICAL #3 → ✅ 수정됨 |
| Personality 4-layer | **두 formulation 모두 유효**. PRD가 Risk Register 버전(API Zod→DB JSONB→extraVars→Template)으로 변경. 수정 불필요 |
| WS strategy+argos | **타입 16 = PRD 정확**. subscribe handler 누락 = v2 코드 버그. carry-forward |
| n8n 4GB peak | **Docker 2G cap**. → HIGH #4 → ✅ 수정됨 |

### Sally → Winston

| 질문 | 판단 |
|------|------|
| n8n 4GB vs 2GB | **2G 정확** (Brief mandate). → ✅ 이미 수정됨 |
| "삭제: 0줄" vs "전면 제거" | **모순 맞음**. Zero Regression = 유지 기능 회귀 0%, 삭제 불가 아님. → ✅ 이미 수정됨 (L228 ~200줄 + L231 정의) |
| Subframe | → ✅ 이미 수정됨 |

### Quinn → Winston

| 질문 | 판단 |
|------|------|
| Subframe | → ✅ 이미 수정됨 |
| "삭제: 0줄" | → ✅ 이미 수정됨 |
| cost WS 채널 | → ✅ L263에서 Architecture deferred로 해결 |
| Docker 4G claim | **Quinn 오류**. Stage 1 FIX-S6-1/S6-8: "4GB→2G" (TO 2G, not FROM 2G). PRD "2G cap" 정확 |
| Embedding 768→1024 | ✅ 정확 확인 |

---

## Carry-Forward to Architecture Stage

1. WS `strategy` + `argos` channels: subscribe handler 누락 (channels.ts). 서버 broadcast 중이나 클라이언트 subscribe 불가 = dead broadcast. 기존 v2 코드 버그.
2. Cost WS channel + costs.ts/budget.ts API: deprecated 전략 Architecture에서 확정 필요
3. L158 personality 4-layer: Decision 4.3.2(Key Boundary) vs Risk Register(DB JSONB) 두 버전 통일 필요
