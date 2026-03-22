# Stage 2 Step 11 — Functional Requirements Fixes Applied

**Writer:** john
**Date:** 2026-03-22
**Section:** PRD lines 2285–2494 (## Functional Requirements)
**Grade:** A (2사이클 필수, avg ≥ 8.0)
**Pre-fix scores:** Bob 7.83 (FAIL), Winston 8.80, Sally 7.90 (FAIL), Quinn 7.65 — Avg 8.05

---

## Fixes Applied (8 total)

### MAJOR (1)

**Fix 1: FR-MEM12 추가 — Observation 4-layer 콘텐츠 방어**
- (1) 10KB 크기 제한 (2) 제어문자 strip (3) 프롬프트 하드닝 (4) 콘텐츠 분류
- 차단 시 Admin 플래그 + 감사 로그. MEM-6, Go/No-Go #9, 확정 결정 #8
- PER-1(personality), FR-TOOLSANITIZE(tool response)와 별개 — 3개 sanitization chain 분리
- **Source:** ALL 4 critics (unanimous)

### MINOR (7)

**Fix 2:** FR-MEM13 추가 — reflected=true observations 30일 후 자동 삭제 + Admin 보존 기간 설정 (MEM-7, 확정 결정 #5)
- **Source:** Winston M2, Sally m2, Quinn m1

**Fix 3:** FR-MEM14 추가 — Reflection 크론 비용 일일 한도 초과 시 자동 일시 중지 + Admin 알림 + 재개 (ECC 2.2, Go/No-Go #7)
- **Source:** Quinn m4, Winston L1

**Fix 4:** FR-MEM3 트리거 조건 보완 — "20개 누적 시" → "일 1회 크론 + reflected=false ≥ 20 AND + confidence ≥ 0.7 + Tier 한도 + advisory lock (확정 결정 #9) + ECC 2.2 auto-pause"
- **Source:** Bob #2, Sally m4, Quinn m2

**Fix 5:** FR-N8N4 N8N-SEC 5/8 → 8/8 — SEC-4 (HMAC webhook), SEC-7 (AES-256-GCM credential encryption), SEC-8 (rate limit 60/min) 추가
- **Source:** Quinn m3, Sally cross-talk Q3

**Fix 6:** FR-TOOLSANITIZE3 Sprint 명확화 — "[Sprint 2]" → "[Sprint 2 구현, Sprint 3 Go/No-Go #11 검증]"
- **Source:** Bob #1

**Fix 7:** FR-PERS9 추가 — 슬라이더 접근성: 키보드 ←→ 조작 + aria-valuenow + aria-valuetext
- **Source:** Sally m3

**Fix 8:** FR-MEM1 MEM-6 참조 — "자동 저장" → "MEM-6 4-layer 방어 적용 후 자동 저장. 방어 실패 시 저장 거부 + 감사 로그"
- **Source:** Bob #3

---

## Pre-fix Proactive Corrections (7건, Step 11 착수 전)

### Within Section (5건) — Option B compliance

| FR | Before | After |
|----|--------|-------|
| FR-MEM4 | `reflections` 테이블에 저장 | `agent_memories` memoryType='reflection'으로 저장 (Option B) |
| FR-MEM5 | `reflections` 테이블의 content | `agent_memories`(reflection)의 content |
| FR-MEM6 | `reflections` 상위 3개 검색 | `agent_memories`(reflection) 상위 3개 검색 |
| FR-MEM8 | observations와 reflections 테이블 | observations 테이블과 agent_memories(reflection) |
| FR-MEM11 | observations/reflections 데이터 | observations + agent_memories(reflection) 데이터 |

### Cross-Section (2건)

| Line | Before | After |
|------|--------|-------|
| L98 | reflections 신규 테이블 | agent_memories memoryType='reflection' 확장 (Option B) |
| L148 | memoryType 'reflection'/'observation' | memoryType 'reflection' (observation 별도 테이블) |
| L1989 | observations/reflections 테이블 FK | observations + agent_memories(reflection) FK |

---

## Confirmed Decisions Coverage

| # | Decision | Status |
|---|----------|--------|
| 2 | n8n Docker 2G | ✅ FR-N8N4 (5) |
| 3 | n8n 8-layer | ✅ FR-N8N4 SEC-1~8 (8/8) |
| 5 | 30일 TTL | ✅ FR-MEM13 |
| 8 | Observation poisoning | ✅ FR-MEM12 4-layer |
| 9 | Advisory lock | ✅ FR-MEM3 |
| 10 | WebSocket limits | ✅ FR-OC2 (Step 10 proactive fix) |

---

## R2 Verified Scores

| Critic | Role | R1 | R2 | Status |
|--------|------|-----|-----|--------|
| Winston | Architecture/API | 8.80 | 9.40 | ✅ PASS |
| Bob | Scrum Master | 7.83 | 9.20 | ✅ PASS |
| Quinn | QA/Security | 7.65 | 9.00 | ✅ PASS |
| Sally | UX Designer | 7.90 | 9.00 | ✅ PASS |
| **Average** | | **8.05** | **9.15** | **✅ PASS** |

### Residuals (non-blocking, deferred)

| Item | Source | Notes |
|------|--------|-------|
| FR-N8N4 8항목 과밀 (가독성) | Quinn l1 | Solo-dev 컨텍스트 수용, 단일 보안 체크리스트 응집력 |
| FR-OC7 LISTEN/NOTIFY Neon 지원 여부 | Bob cross-talk | Sprint 4 착수 전 검증, 500ms 폴링 폴백 명시됨 |
| FR-PERS Go/No-Go #2 미명시 | Winston residual | 기능 무결, observation 수준 |
| FR-MEM12 flag/block 경계 | Sally residual | 구현 시 명확화 |
| "< 200KB" 8곳 cross-section | carry-forward | L178, L447, L460, L526, L598, L621, L643, L1245 |
