# Stage 2 Step 10 — Project Scoping & Phased Development Fixes Applied

**Writer:** john
**Date:** 2026-03-22
**Section:** PRD lines 2085–2272 (## Project Scoping & Phased Development)
**Grade:** A (2사이클 필수, avg ≥ 8.0)
**Pre-fix scores:** Bob 8.05, Sally 8.60, Winston 8.55, Quinn 7.10 — Avg 8.08

---

## Fixes Applied (7 total + 1 post-R2 hotfix)

### MAJOR (1)

**Fix 1: Sprint 테이블 Go/No-Go 14-gate 확장 + Pre-Sprint 행 + 각주**
- Pre-Sprint 행 추가: #10 (Voyage AI 마이그레이션), #6 (디자인 토큰)
- Sprint 2: #11 (Tool Sanitization) 추가
- Sprint 3: #9 (Obs Poisoning), #11(계속), #14 (Capability Eval) 추가 → 총 5 gates
- Sprint 1 의존성: "v2 완료" → "Pre-Sprint + v2 완료"
- 각주: "전체 Go/No-Go 14-gate 정규 목록은 §Success Criteria 참조. 전 Sprint 공통: #1 (Zero Regression), #12, #13"
- **Source:** ALL 4 critics (unanimous)

### MINOR (6)

**Fix 2:** L2197 "Sprint 2 과부하 (15건+ 동시)" → "(17건+ 동시)" — Step 9 Fix 5 전파
- **Source:** ALL 4 critics (unanimous)

**Fix 3:** v3 Must-Have 4항목 추가 (#7-#10) with Sprint + Go/No-Go 교차 참조
- #7: Big Five extraVars → Soul 주입 (Sprint 1, #2)
- #8: n8n 8-layer + Docker 2G 안정 (Sprint 2, #3)
- #9: Observation→Reflection E2E (Sprint 3, #4/#7/#9)
- #10: PixiJS ≤ 200KB + /office 실시간 (Sprint 4, #5/#8)
- **Source:** Bob #2, Winston L1

**Fix 4:** L2154 "Hook 5개" → "Hook 4개" (cost-tracker GATE 2026-03-20 제거)
- **Source:** Quinn m2

**Fix 5:** Sprint 3 게이트 과밀 리스크 행 추가
- "Sprint 3 게이트 과밀 (5 Go/No-Go)" + 완화: #9/#11 Sprint 2 선행 + #14 회고 성격
- **Source:** Quinn m3

**Fix 6:** Voyage AI "신규" → "Pre-Sprint #10 마이그레이션 후 계속" (오픈소스 테이블)
- **Source:** Quinn m4

**Fix 7:** v3 여정 테이블 Journey 2/3 추가
- J2: Sprint 2 n8n 워크플로우 결과 확인
- J3: Sprint 3 메모리 성장 + Sprint 4 /office 실시간 관찰
- **Source:** Sally m4

### Post-R2 Hotfix (1)

**Fix 8:** L2115 각주 "#1 (Voyage AI 1024d 정합)" → "#1 (Zero Regression — 485 API + 10,154 테스트)"
- Go/No-Go #1 = Zero Regression, #10 = Voyage AI. 번호 혼동 수정
- **Source:** Winston R2 LOW, Quinn R2 LOW

---

## Pre-fix Proactive Corrections (4건, Step 10 착수 전)

| Line | Before | After | Source |
|------|--------|-------|--------|
| L925 | `memoryTypeEnum에 'reflection', 'observation' 타입 추가` | `'reflection' 타입 추가 (observation은 별도 테이블 — Option B)` | Step 8 residual (Bob) |
| L929 | `ALTER TYPE memory_type ADD VALUE 'observation';` | `-- observation은 별도 observations 테이블 사용 (Option B)` | Option B compliance |
| L975 | `memoryTypeEnum += 'reflection', 'observation'` | `memoryTypeEnum += 'reflection' (observation은 별도 테이블 — Option B)` | Option B compliance |
| L2412 | FR-OC2 `회사별 최대 20개 동시 연결` | `50개, 서버 전체 500개 + NRT-5 정합` | 확정 결정 #10 |

---

## Confirmed Decisions Coverage

| # | Decision | Status |
|---|----------|--------|
| 2 | n8n Docker 2G | ✅ Sprint 전략 + 리스크 테이블 |
| 3 | n8n 8-layer | ✅ v3 Must-Have #8, Sprint 2 Go/No-Go |
| 5 | 30일 TTL | ⚠️ Scoping level 불필요 (Domain MEM-7에서 커버) |
| 8 | Observation poisoning | ✅ Sprint 3 Go/No-Go #9, Must-Have #9 |
| 9 | Advisory lock | ⚠️ Scoping level 불필요 (Domain MEM-2에서 커버) |
| 10 | WebSocket limits | ✅ Proactive fix FR-OC2 50/co |

---

## R2 Verified Scores

| Critic | Role | R1 | R2 | Status |
|--------|------|-----|-----|--------|
| Bob | Scrum Master | 8.05 | 9.10 | ✅ PASS |
| Sally | UX Designer | 8.60 | 9.00 | ✅ PASS |
| Winston | Architecture/API | 8.55 | 9.30 | ✅ PASS |
| Quinn | QA/Security | 7.10 | 8.85 | ✅ PASS |
| **Average** | | **8.08** | **9.06** | **✅ PASS** |

### Residuals (non-blocking, deferred)

| Item | Source | Notes |
|------|--------|-------|
| "총 효과" 추정치 방법론 (~1,000줄+, ~1~2주, 80%+) | Quinn l1 | 섹션 성격상 개략 추정 적절 |
| 시장 리스크 "6개월 선점" 근거 없음 | Quinn l2 | 경쟁 분석 범위 |
| L2082 BullMQ 잔여 참조 | Bob residual | Step 9 scope, global sweep 대상 |
| pg-boss "조건부" vs "크론 오프셋 기본" | Winston L2 | 아키텍처 확정 후 결정 |
| L460 Go/No-Go #5 "< 200KB" | cross-section | Steps 11-13 범위 |
