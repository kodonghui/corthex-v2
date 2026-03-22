# Stage 2 Step 12 — Non-Functional Requirements Fixes Applied

**Writer:** john
**Date:** 2026-03-22
**Section:** PRD lines 2499–2649 (## Non-Functional Requirements)
**Grade:** A (2사이클 필수, avg ≥ 8.0)
**Pre-fix scores:** Bob 8.10, Winston 9.10, Sally 8.45, Quinn 7.90 — Avg 8.39

---

## Fixes Applied (6 total)

### MAJOR (0)

없음.

### MINOR (6)

**Fix 1: NFR-S10 추가 — MEM-6 observation sanitization 품질 NFR (4/4 만장일치)**
- "MEM-6 4-layer 100% 통과 + 10종 adversarial payload 100% 차단 (Go/No-Go #9, 확정 결정 #8). PER-1(NFR-S8)과 별개 공격 체인 — FR-MEM12 품질 기준"
- 🔴 P0, Sprint 3
- 3개 sanitization chain 전부 NFR 품질 게이트 확보: PER-1(NFR-S8) + MEM-6(NFR-S10) + TOOLSANITIZE(FR-level)
- **Source:** ALL 4 critics (unanimous)

**Fix 2: NFR-A5 ARIA attributes 정합 (4/4)**
- "aria-valuenow + Arrow keys + aria-label" → "aria-valuenow + aria-valuetext (값 의미 설명) + aria-label (슬라이더 특성명) + Arrow keys 키보드 조작. FR-PERS9 정합"
- **Source:** Quinn m3, Winston L1, Sally m2, Bob #13

**Fix 3: NFR-COST2 Phase + scope 확장 (4/4)**
- Phase "4" → "Pre-Sprint~Sprint 4"
- "문서 1,000건 기준" → "knowledge docs (문서 1,000건) + observations/reflections 임베딩 볼륨 포함"
- Step 9 Fix 9 integration table "Pre-Sprint→유지"와 정합
- **Source:** Bob #2, Winston L3, Quinn m4, Sally m4

**Fix 4: NFR-SC7 Phase 수정 (2/4)**
- Phase "4" → "Sprint 3~4"
- Sprint 3 observations + agent_memories VECTOR(1024) HNSW 인덱스 추가 시 메모리 측정 시작 명시
- **Source:** Winston M2, Sally m5

**Fix 5: NFR-P4 Go/No-Go #5 참조 제거 (2/4)**
- "(Brief §4, Go/No-Go #5)" → "(Brief §4). Go/No-Go #5는 PixiJS 번들 전용 (NFR-P13)"
- Go/No-Go #5 = PixiJS 200KB (NFR-P13), 허브 메인 번들 200KB ≠ Go/No-Go #5
- **Source:** Quinn m2, Winston L2

**Fix 6: NFR-O11 추가 — CEO 일상 태스크 완료 시간 (2/4)**
- "/office→에이전트 식별→Chat→태스크 지시→/office 결과 확인 ≤ 5분 (Go/No-Go #13)"
- NFR-O7(Admin 온보딩 15분)·NFR-O8(NEXUS 설계 10분)과 별개 일상 UX 속도
- **Source:** Sally m3, Bob #14

---

## Pre-fix Proactive Corrections (3건, Step 12 착수 전)

| NFR | Before | After |
|-----|--------|-------|
| NFR-SC8 | "20 동시 연결 + idle eviction" | "50 + 서버 500 + oldest 해제 (NRT-5, 확정 결정 #10)" |
| NFR-S9 | "N8N-SEC-1~6" | "N8N-SEC-1~8 (SEC-7 encryption + SEC-8 rate limit)" |
| NFR-D8 | "observations/reflections + processed" | "observations + agent_memories(reflection) + reflected=true (MEM-7, 확정 #5)" |

---

## Confirmed Decisions Coverage

| # | Decision | Status |
|---|----------|--------|
| 2 | n8n Docker 2G | ✅ NFR-SC9 |
| 3 | n8n 8-layer | ✅ NFR-S9 |
| 5 | 30일 TTL | ✅ NFR-D8 |
| 8 | Observation poisoning | ✅ NFR-S10 (Fix 1 추가) |
| 9 | Advisory lock | ✅ NFR-O10 |
| 10 | WebSocket limits | ✅ NFR-SC8 |

---

## Priority Summary Update

| 우선순위 | Before | After |
|---------|--------|-------|
| 🔴 P0 | 21 | 22 (+NFR-S10) |
| P1 | 42 | 43 (+NFR-O11) |
| P2 | 10 | 10 |
| CQ | 1 | 1 |
| 삭제 | 2 | 2 |
| **총 활성** | **74** | **76** (v3 16→18) |

---

## R2 Verified Scores

| Critic | Role | R1 | R2 | Status |
|--------|------|-----|-----|--------|
| Winston | Architecture/API | 9.10 | 9.50 | ✅ PASS |
| Bob | Scrum Master | 8.10 | 9.20 | ✅ PASS |
| Quinn | QA/Security | 7.90 | 9.00 | ✅ PASS |
| Sally | UX Designer | 8.45 | 9.00 | ✅ PASS |
| **Average** | | **8.39** | **9.18** | **✅ PASS** |

### Residuals (non-blocking, deferred)

| Item | Source | Notes |
|------|--------|-------|
| Go/No-Go #14 no NFR | Quinn l1 | Gate-only, measurable criterion. Acceptable |
| TOOLSANITIZE quality target in FR not NFR | Bob Obs-B | Information present, QA plan consolidation |
| PER-5 (Domain) aria attributes partial | Bob residual | Cross-section residual |
| NFR 테이블 열 구조 불일치 | Bob #12 | 가독성 개선, 기능 무결 |
| Go/No-Go #5 "≤" cross-section | Sally residual | Carry-forward |
