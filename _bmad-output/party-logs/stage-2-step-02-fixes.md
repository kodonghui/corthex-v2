# Stage 2 Step 02 — Discovery Fixes Applied

**Writer:** john
**Date:** 2026-03-22
**Section:** PRD lines 110–264 (## Project Discovery)
**Pre-fix scores:** Winston 7.60, Quinn 7.60, Sally 6.80 (FAIL), Bob 7.70 — Avg 7.43

---

## Fixes Applied (11 total)

### CRITICAL (4 — all 4 critics unanimous)

**Fix 1: "Subframe 아키타입" → "Stitch 2" (4 locations)**
- L167: `디자인 토큰 확정 (Subframe 아키타입)` → `디자인 토큰 확정 (Stitch 2 DESIGN.md 기반)`
- L192: Same fix in 요구사항 유형 분리 table
- L405: `Subframe MCP 토큰 준수` → `Stitch 2 DESIGN.md 토큰 준수` (outside Discovery but same doc)
- L574: `Subframe 디자인 시스템 준수` → `Stitch 2 디자인 시스템 준수` (outside Discovery but same doc)
- **Source:** Winston #1-2, Quinn #1, Sally #1, Bob #1

**Fix 2: "삭제: 0줄" vs GATE "전면 제거" contradiction resolved**
- L121: Project Context updated — "삭제 없음" → "GATE 결정에 의한 페이지 교체 있음"
- L223: `삭제: 0줄` → `삭제: ~200줄 (GATE 결정 반영)` + Zero Regression 정의 추가
- L225: `71개 페이지` → `~67개 페이지 — GATE 제거 4개 제외`
- Added: **Zero Regression 정의** = 유지 기능의 API/DB/Engine 회귀 0%. GATE 교체는 "신규 대체"
- **Source:** Quinn #2, Sally #2

**Fix 3: n8n Docker "4GB peak" → Brief 2G cap**
- L155: `860MB idle/4GB peak` → `860MB idle, Docker 2G cap — Brief mandate --memory=2g, n8n docs 4GB 권장이나 Brief 제약으로 OOM 리스크 상승`
- **Source:** Winston #3, Sally #3, Bob #2

**Fix 4: n8n security layers 6 → 8, personality sanitization layer naming**
- L158: `6-layer` → `8-layer` (added N8N_ENCRYPTION_KEY, NODE_OPTIONS)
- L158: `Key Boundary→API Zod→extraVars strip→Template regex` → `API Zod→DB JSONB type→extraVars newline strip→Template regex`
- **Source:** Bob #3, #4

### MAJOR (4)

**Fix 5: Sprint 의존성에 Voyage AI 블로커 추가**
- Pre-Sprint block: Added `Voyage AI 임베딩 마이그레이션 (Gemini 768d → Voyage 1024d, 기존 데이터 re-embed + HNSW rebuild, 2-3일 추정, 🔴 NOT STARTED)`
- 요구사항 유형 table: Updated Pre-Sprint row to include Voyage AI
- **Source:** Winston #4, Quinn (cross-talk), Sally #6, Bob #5

**Fix 6: Journey B (n8n) expanded from 1 line to 4 lines**
- Added: 접근성 (keyboard nav, aria-live), 에러 경로 (Docker down/OOM, workflow failure), 빈 상태 (onboarding)
- Now matches depth of Journey A/C/D
- **Source:** Quinn #3, Sally #4

**Fix 7: Journey C accessibility added**
- Added: 성장 지표 차트 키보드 탐색, 데이터 포인트 aria-label, 스크린리더용 텍스트 요약
- **Source:** Sally #7

**Fix 8: Cost removal scope clarified**
- L255: Added blockquote clarifying: UI pages only, Reflection LLM cost management (Go/No-Go #7) retained, cost WS channel + API deprecated strategy deferred to Architecture, Brief §2 needs update
- **Source:** Winston #5, Quinn #4, Bob #6-7

### MINOR (3)

**Fix 9: /office color-blind accessibility**
- Journey D: Added 5-state 색상 + 아이콘/애니메이션 이중 인코딩 for color-blind users
- **Source:** Sally #8

**Fix 10: Subframe references outside Discovery (bonus)**
- L405 and L574 fixed proactively (Quinn identified these outside section scope)
- **Source:** Quinn #1 (additional locations)

**Fix 11: Project Context L121 updated**
- "삭제 없음" → "GATE 결정에 의한 페이지 교체 있음" — consistent with Fix 2
- **Source:** Quinn #2, Sally #2

---

## NOT Fixed (deferred)

| Item | Reason | Deferred to |
|------|--------|-------------|
| Pre-Sprint 마감일 명시 | Scoping 문제 — Step 10에서 다룸 | Step 10 |
| v2 Audit WS 14→16 불일치 | Audit 문서 업데이트 — PRD는 이미 정확 | Audit doc |
| cost 인프라 deprecated 전략 상세 | Architecture 단계에서 결정 | Stage 2 Architecture |
| PixiJS 1,000줄 과소 추정 가능성 | 추정치 변경 근거 불충분 — Architecture에서 재평가 | Architecture |

---

## Expected Score Impact

| Critic | Pre-fix | Expected Post-fix |
|--------|---------|-------------------|
| Winston | 7.60 | 8.5+ (CRITICAL x2 + HIGH x1 + MEDIUM x2 해소) |
| Quinn | 7.60 | 8.5+ (Critical x2 + Major x2 해소) |
| Sally | 6.80 ❌ | 8.0+ (D5 6→8: 3개 일관성 모순 해소, D2 7→8: Journey B 확장) |
| Bob | 7.70 | 8.5+ (Must-fix x4 + Should-fix x3 해소) |
