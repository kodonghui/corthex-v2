# Stage 2 Step 07 — Domain-Specific Requirements Fixes Applied

**Writer:** john
**Date:** 2026-03-22
**Section:** PRD lines 1352–1531 (## Domain-Specific Requirements)
**Pre-fix scores:** Winston 7.15, Quinn 5.70 (FAIL), Sally 6.25 (FAIL), Bob 6.45 (FAIL) — Avg 6.39

---

## Fixes Applied (15 total)

### CRITICAL (1)

**Fix 1: N8N-SEC-5 "memory: 4G" → "memory: 2G" + NODE_OPTIONS**
- L1459: `memory: 4G` → `memory: 2G`, `NODE_OPTIONS=--max-old-space-size=1536`
- Brief 2G mandate, confirmed decision #2, 3rd recurrence
- **Source:** ALL 4 critics (unanimous)

### MAJOR (6)

**Fix 2: Add N8N-SEC-7/8 — 8-layer security 완성**
- N8N-SEC-7: n8n 크레덴셜 암호화 (N8N_ENCRYPTION_KEY AES-256-GCM)
- N8N-SEC-8: n8n API rate limiting (분당 60회, configurable)
- Confirmed decision #3: 8-layer. 기존 6→8 완성
- **Source:** Bob, Sally, Quinn

**Fix 3: Add MEM-6 — Observation 4-layer 콘텐츠 방어**
- 10KB + 제어문자 + 프롬프트 하드닝 + 콘텐츠 분류. PER-1과 별개 체인
- Go/No-Go #9, R10, confirmed decision #8
- **Source:** ALL 4 critics (unanimous)

**Fix 4: Add MEM-7 — Observation 30일 TTL**
- reflected=true 관찰 30일 후 자동 삭제 크론. Admin 보존 정책
- Confirmed decision #5
- **Source:** Quinn, Sally, Bob

**Fix 5: Update MEM-2 — Reflection 크론 트리거 full spec**
- 일 1회 크론 + reflected=false ≥ 20 AND + confidence ≥ 0.7 + Tier 한도 + ECC 2.2 자동 일시 중지 + advisory lock
- **Source:** Quinn, Sally, Bob

**Fix 6: Fix MEM-4/MEM-5 — Planning entity → read-time**
- MEM-4: "Planning 삭제" → "Reflection/Observation 삭제"
- MEM-5: "Planning 적용 감사 로그" → "Reflection Soul 주입 시 activity_logs 기록 (memory_id, agent_id, relevance score)"
- **Source:** Sally, Bob

**Fix 7: Add NRT-5 — WebSocket 연결 제한**
- 50 conn/company, 500 conn/server, 10 msg/s token bucket
- Confirmed decision #10, R15
- **Source:** Quinn, Sally, Bob

### MINOR (8)

**Fix 8:** VEC-1 "(Voyage AI Embedding 제한)" → "(검색 정밀도 최적화 — 실제 상한 32K, 2048은 retrieval 최적)"
**Fix 9:** DB-3 Pre-Sprint Voyage AI 마이그레이션 후 NULL 잔여분만 대상 추가
**Fix 10:** MKT-1 "Deferred Item" 제거 → Sprint 2 필수, 테이블 분리 Phase 5+
**Fix 11:** PIX-1 "< 200KB" → "≤ 200KB"
**Fix 12:** MEM-1 Option B 명확화: "observations 신규 + agent_memories memoryType='reflection' 확장. 별도 reflections 테이블 생성 안 함"
**Fix 13:** SOUL-6 "agent-loop.ts" → "soul-renderer.ts"
**Fix 14:** Summary table 업데이트: 75→80개 (N8N-SEC 6→8, MEM 5→7, NRT 4→5)
**Fix 15:** ORC-6 ↔ SOUL-5 중복은 의도적 (오케스트레이션 vs Soul 관점 별도 정의) — 유지

---

## Confirmed Decisions Coverage

| # | Decision | Status |
|---|----------|--------|
| 2 | n8n Docker 2G | ✅ N8N-SEC-5 수정 |
| 3 | n8n 8-layer | ✅ N8N-SEC-1~8 (8개) |
| 5 | 30일 TTL | ✅ MEM-7 추가 |
| 8 | Observation poisoning | ✅ MEM-6 추가 |
| 9 | Advisory lock | ✅ MEM-2 확장 |
| 10 | WebSocket limits | ✅ NRT-5 추가 |

---

## Proactive Cross-Section Fixes (4건, Step 7 범위 밖 선제 수정)

| Line | Before | After |
|------|--------|-------|
| L1859 | `memory: 4G, cpus: 2 (N8N-SEC-5)` | `memory: 2G, cpus: 2, NODE_OPTIONS=--max-old-space-size=1536 (N8N-SEC-5)` |
| L2393 | `memory: 4G`, `cpus: '2'` (R6 완화 기준) | `memory: 2G`, `cpus: '2'`, `NODE_OPTIONS=--max-old-space-size=1536` (Brief 필수, 4G=OOM 확정) |
| L1841 | `Reflection/Planning 삭제는 에이전트 성장 데이터 소실` | `Reflection/Observation 삭제는 에이전트 성장 데이터 소실` |
| L1998 | `Planning → 에이전트 행동 적용 추적` | `Soul 주입 시 memory_id, agent_id, relevance score 기록` |

Global sweep 결과: "memory: 4G" 잔여 0건, "Planning (삭제/적용/생성)" 잔여 0건

---

## R2 Verified Scores

| Critic | Role | R1 | R2 | Status |
|--------|------|-----|-----|--------|
| Winston | Architecture/API | 7.15 | 8.75 | ✅ PASS |
| Quinn | QA/Security | 5.70 | 8.65 | ✅ PASS |
| Sally | UX Designer | 6.25 | 8.90 | ✅ PASS |
| Bob | Scrum Master | 6.45 | 9.00 | ✅ PASS |
| **Average** | | **6.39** | **8.83** | **✅ PASS** |

### Residuals (non-blocking, deferred)

| Item | Source | Notes |
|------|--------|-------|
| N8N-SEC Layer 3 "API key header injection" | Winston, Quinn | 7/8 layers explicit, Layer 3 implicit in N8N-SEC-2 proxy → Architecture carry-forward |
| PER-5 `aria-valuetext` | Sally | WCAG 2.1 AA core met, enhancement-level → implementation decision |
| ORC-6↔SOUL-5 intentional overlap | Sally | Orchestration vs Soul perspective — retained by design |
