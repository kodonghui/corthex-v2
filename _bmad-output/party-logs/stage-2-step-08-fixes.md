# Stage 2 Step 08 — Innovation & Novel Patterns Fixes Applied

**Writer:** john
**Date:** 2026-03-22
**Section:** PRD lines 1538–1775 (## Innovation & Novel Patterns)
**Pre-fix scores:** Winston 8.60, Quinn 7.10, Sally 7.45, Bob 6.95 (FAIL) — Avg 7.53

---

## Fixes Applied (8 total)

### MAJOR (3)

**Fix 1: Innovation 7 Go/No-Go cross-reference expansion**
- L1740: `#4` → `#4 + #9: 4-layer E2E + #14: Capability Evaluation`
- Memory verification now covers: data integrity (#4) + security (#9) + growth measurement (#14)
- **Source:** ALL 4 critics (unanimous)

**Fix 2: L1663 memoryTypeEnum 'observation' removed — Option B compliance**
- `memoryTypeEnum에 'reflection', 'observation' 추가` → `memoryTypeEnum에 'reflection' 추가`
- observations → separate table, NOT in agent_memories enum. MEM-1 Option B 정합
- **Source:** Quinn M2

**Fix 3: Quality Gates table expanded #9-#14 (6행 추가)**
- #9: Observation Poisoning 4-layer E2E (Sprint 3, MEM-6)
- #10: Voyage AI 마이그레이션 (Pre-Sprint)
- #11: Tool Sanitization (Sprint 2-3)
- #12: v1 기능 패리티 (전체)
- #13: 사용성 검증 (전체)
- #14: Capability Evaluation (전체)
- Success Criteria (Step 5) 14 gates와 완전 정합
- **Source:** Sally M1, Quinn M1, Bob #2

### MINOR (5)

**Fix 4:** Innovation 7 implementation pattern — 3rd stage (Planning = read-time search) 명시
- L1665: `→ soul-enricher.ts가 다음 태스크 시 cosine ≥ 0.75 top-3 검색 → Soul 주입 (read-time, 저장 없음 = "계획" 단계)` 추가
- **Source:** Bob #1, Sally m3, Quinn m2

**Fix 5:** L1623 + L1741 "< 200KB" → "≤ 200KB" (PIX-1 전파)
- **Source:** Sally m2, Quinn m1, Winston L1

**Fix 6:** L1768 "(R1)" 오귀속 제거 — R1=학습 곡선, 번들 초과 ≠ R1
- **Source:** Winston M2

**Fix 7:** Innovation Risk table — R10 (Observation Poisoning) + R14 (Solo dev + PixiJS) 2행 추가
- R10: 4-layer MEM-6 방어, 공격 체인 명시, Go/No-Go #9
- R14: Sprint 4 마지막 배치, 실패해도 v2+v3(S1-S3) 무영향
- **Source:** Bob #3, Quinn M1, Sally m4, Winston L2

**Fix 8:** Innovation 7 verification — adversarial payload 차단 기준 추가
- L1740 검증 방법: `+ 10종 adversarial payload 차단`, 성공 기준: `+ adversarial 100% 차단`
- **Source:** Quinn M1, Bob #2

---

## Pre-fix Proactive Corrections (4건, Step 8 착수 전 적용)

| Line | Before | After |
|------|--------|-------|
| L69 | `4G/2CPU 제한` | `2G/2CPU 제한` |
| L1688 | `4G/2CPU 제한 (N8N-SEC-5)` | `2G/2CPU 제한 (N8N-SEC-5)` |
| L1769 | `4G/2CPU 제한 + OOM restart` | `2G/2CPU 제한 + NODE_OPTIONS + OOM restart` |
| L1893 | `Docker 4G/2CPU(N8N-SEC-5)` | `Docker 2G/2CPU(N8N-SEC-5)` |

---

## Confirmed Decisions Coverage

| # | Decision | Status |
|---|----------|--------|
| 2 | n8n Docker 2G | ✅ L1688 2G/2CPU, risk table 2G |
| 3 | n8n 8-layer | ✅ 혁신 8 보안 설명 |
| 5 | 30일 TTL | ⚠️ Innovation level 불필요 (Domain에서 커버) |
| 8 | Observation poisoning | ✅ R10 risk + Go/No-Go #9 + MEM-6 |
| 9 | Advisory lock | ✅ Risk table Reflection 크론 행 |
| 10 | WebSocket limits | ⚠️ Innovation level 불필요 (Domain NRT-5에서 커버) |

---

## R2 Verified Scores

| Critic | Role | R1 | R2 | Status |
|--------|------|-----|-----|--------|
| Winston | Architecture/API | 8.60 | 9.00 | ✅ PASS |
| Quinn | QA/Security | 7.10 | 8.90 | ✅ PASS |
| Sally | UX Designer | 7.45 | 9.00 | ✅ PASS |
| Bob | Scrum Master | 6.95 | 8.55 | ✅ PASS |
| **Average** | | **7.53** | **8.86** | **✅ PASS** |

### Residuals (non-blocking, deferred)

| Item | Source | Notes |
|------|--------|-------|
| "< 200KB" cross-section 9곳 (L178, L447, L460, L526, L598, L621, L643, L1245, L2085) | Bob | 각 섹션 리뷰 시 수정 대상 |
| memoryTypeEnum 'observation' Product Scope (L925/929/975) | Bob | Step 3 범위, 이미 Innovation 수정 완료 |
| L1713 "200KB 미만" cosmetic | Quinn, Bob | 서술적 표현, 스펙 아님 |
| R11/R15 Innovation risk 미포함 | Winston, Quinn | Pre-Sprint/Sprint 4 인프라 — Domain에서 커버 |
