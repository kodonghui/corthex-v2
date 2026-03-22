# Stage 2 Step 09 — Technical Architecture Context Fixes Applied

**Writer:** john
**Date:** 2026-03-22
**Section:** PRD lines 1784–2057 (## Technical Architecture Context)
**Pre-fix scores:** Winston 8.30, Quinn 7.25, Sally 7.45, Bob 7.28 — Avg 7.57

---

## Fixes Applied (11 total)

### MAJOR (3)

**Fix 1: /ws/office 20 → 50 conn/company — NRT-5/확정 결정 #10 정합**
- L1903: `per-company 연결 상한 20, 초과 시 idle 연결 graceful eviction` → `50 conn/company, 500 conn/server, 10 msg/s — NRT-5 확정 결정 #10 준수. 초과 시 oldest 연결 해제 + 클라이언트 재연결 안내`
- eviction 정책도 "idle" → "oldest" (NRT-5 정합)
- **Source:** ALL 4 critics (unanimous)

**Fix 2: API Surface v3 엔드포인트 9행 추가**
- Big Five: PATCH/GET personality (Sprint 1)
- n8n: GET /api/admin/n8n/*, /admin/n8n-editor/* (Sprint 2)
- Memory: GET memories, DELETE memory, GET growth (Sprint 3)
- External API keys: CRUD /api/admin/api-keys (Sprint 2)
- /ws/office: WebSocket 17th channel (Sprint 4)
- **Source:** ALL 4 critics (unanimous)

**Fix 3: Compliance MEM-6 Observation 4-layer 방어 테이블 추가**
- PER-1 다음에 MEM-6 별도 체인 추가 (4 Layer: Size cap + Control char strip + Prompt hardening + Content classification)
- 공격 체인 명시: malicious obs → Reflection LLM 오염 → Soul 주입
- PER-1과 MEM-6 차이 설명: bounded integer vs 자유 텍스트
- **Source:** Bob #2, Quinn M1, Sally m3

### MINOR (8)

**Fix 4:** L1901 N8N-SEC-7/SEC-8 통합 목록 추가: 크레덴셜 암호화(SEC-7) + API rate limit 60/min(SEC-8) → 8-layer 완전 반영
- **Source:** Winston M3, Quinn l1

**Fix 5:** L2051 "N8N-SEC 6건" → "8건", "15건+" → "17건+" — Step 7 전파
- **Source:** Quinn m2

**Fix 6:** L1921 /office Mobile "❌" → "△" — 리스트 뷰 대체 존재 (PIX-3)
- **Source:** Sally m5, Quinn m5

**Fix 7:** L2026 MEM-7 "자동 삭제 옵션" → "reflected=true 30일 후 자동 삭제 (MEM-7, Sprint 3 필수). Admin 보존 정책 설정 가능"
- **Source:** Winston L3, Quinn m4

**Fix 8:** L1905 soul-enricher.ts "engine/ 인접" → "engine/ 외부, E8 경계 밖 — lib/ 레벨" + MEM-6 방어 참조 + cosine ≥ 0.75 top-3 주입 명시
- **Source:** Winston L2

**Fix 9:** L1892 Voyage AI Phase "4" → "Pre-Sprint→유지" + Go/No-Go #10 참조
- **Source:** Sally m6

**Fix 10:** 보안 토큰 관리에 N8N-SEC-7 (n8n 크레덴셜 암호화 키) 행 추가
- **Source:** Winston L4

**Fix 11:** Reflection 크론 동시 실행 부하에 advisory lock 교차 참조 추가: `pg_advisory_xact_lock(hashtext(companyId))` (확정 결정 #9, MEM-2)
- **Source:** Quinn l2

---

## Pre-fix Proactive Corrections (5건, 이전 Step에서 적용)

| Line | Before | After | Applied in |
|------|--------|-------|------------|
| L1841 | Reflection/Planning 삭제 | Reflection/Observation 삭제 | Step 7 |
| L1859 | memory: 4G | memory: 2G + NODE_OPTIONS | Step 7 |
| L1893 | Docker 4G/2CPU | Docker 2G/2CPU | Step 8 |
| L1998 | Planning → 에이전트 행동 적용 추적 | Soul 주입 시 memory_id, agent_id, relevance score | Step 7 |
| L2085 | 번들 < 200KB | 번들 ≤ 200KB | Step 9 착수 시 |

---

## Confirmed Decisions Coverage

| # | Decision | Status |
|---|----------|--------|
| 2 | n8n Docker 2G | ✅ 전 섹션 2G 정합 |
| 3 | n8n 8-layer | ✅ 통합 목록 8/8 반영 |
| 5 | 30일 TTL | ✅ GDPR 섹션 MEM-7 필수 |
| 8 | Observation poisoning | ✅ Compliance MEM-6 4-layer |
| 9 | Advisory lock | ✅ Reflection 크론 교차 참조 |
| 10 | WebSocket limits | ✅ /ws/office 50/co NRT-5 정합 |

---

## R2 Verified Scores

| Critic | Role | R1 | R2 | Status |
|--------|------|-----|-----|--------|
| Winston | Architecture/API | 8.30 | 9.30 | ✅ PASS |
| Quinn | QA/Security | 7.10 | 8.90 | ✅ PASS |
| Sally | UX Designer | 7.45 | 9.00 | ✅ PASS |
| Bob | Scrum Master | 7.28 | 8.68 | ✅ PASS |
| **Average** | | **7.53** | **8.97** | **✅ PASS** |

### Residuals (non-blocking, deferred)

| Item | Source | Notes |
|------|--------|-------|
| Migration Guide v3 (Pre-Sprint/Sprint migrations) | Quinn m7 | Sprint roadmap에서 커버. 구현 단계 문서에서 확정 |
| SDK `@0.2.x` wildcard vs exact pin | Quinn LOW | package.json에서 exact version 확정 |
| "< 200KB" cross-section 잔여 (L178, L447, L460 등) | Bob Step 8 | 각 섹션 리뷰 시 수정 대상 |
