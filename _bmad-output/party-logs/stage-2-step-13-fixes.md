# Stage 2 Step 13 — Polish (전체 PRD 교차 일관성) Fixes Applied

**Writer:** john
**Date:** 2026-03-22
**Section:** 전체 PRD (L1-2648) — 교차 섹션 일관성, 잔여 이슈 해소, 최종 품질 검증
**Grade:** B (1사이클, avg ≥ 7.0)
**Scores:** Bob 9.00, Sally 9.00, Winston 9.45, Quinn 9.03 — Avg 9.12

---

## Proactive Fixes Applied (12 total)

### "< 200KB" → "≤ 200KB" 글로벌 수정 (8건)

| # | Line | Context |
|---|------|---------|
| 1 | L178 | Sprint 4 하드 한도 |
| 2 | L447 | Executive Summary Sprint 4 |
| 3 | L460 | Go/No-Go #5 테이블 |
| 4 | L526 | Sprint 4 완료 기준 |
| 5 | L598 | Go/No-Go 상세 테이블 |
| 6 | L621 | 정규 목록 #10 |
| 7 | L643 | 성공 선언 기준 Sprint 4 |
| 8 | L1245 | Journey CEO /office 진입 |

### 기타 수정 (4건)

**Fix 9:** L1713 "200KB 미만" → "200KB 이하" (서술적 표현 정합)

**Fix 10:** L2082 BullMQ 참조 제거 → "크론 오프셋(회사별 시간 분산, 기본) 또는 pg-boss(조건부)"
- **Source:** Bob Step 10 residual

**Fix 11:** L1472 PER-5 aria 속성 확장 — `aria-valuetext` + `aria-label` 추가 (FR-PERS9·NFR-A5 정합)
- **Source:** Bob Step 12 residual, Sally Step 7 residual

**Fix 12:** L1800 "Hook 5개" → "Hook 4개" (cost-tracker GATE 제거 정합)
- **Source:** Bob #1

**Fix 13:** FR-OC1 (L2423) "Brief §4 Go/No-Go #5" → "Brief §4. Go/No-Go #5는 PixiJS 번들 전용, NFR-P13 참조"
- **Source:** Winston L1

---

## Steps 2-12 잔여 이슈 최종 스캔 결과

| 패턴 | 잔여 | 상태 |
|------|------|------|
| "< 200KB" | 0건 | ✅ 전부 "≤ 200KB" |
| "4G/4GB" n8n | 0건 | ✅ 전부 2G |
| "15건+" Sprint 2 | 0건 | ✅ 전부 17건+ |
| "20" WebSocket | 0건 | ✅ 전부 50/500 |
| N8N-SEC "6건/6-layer" | 0건 | ✅ 전부 8건 |
| reflections 테이블 잔여 | 0건 | ✅ Option B 정합 |
| memoryType 'observation' | 0건 | ✅ 별도 테이블 |
| BullMQ | 0건 | ✅ 제거 |
| PER-5 aria 불완전 | 0건 | ✅ FR-PERS9·NFR-A5 정합 |
| Voyage AI Phase "4" | 0건 | ✅ Pre-Sprint→유지 |
| Hook 5개 | 0건 | ✅ 전부 4개 |
| Go/No-Go #5 혼용 | 0건 | ✅ PixiJS 전용 분리 |

---

## 확정 결정 12/12 전 섹션 정합 확인

| # | Decision | 전 섹션 정합 |
|---|----------|------------|
| 1 | Voyage AI 1024d | ✅ |
| 2 | n8n Docker 2G | ✅ |
| 3 | n8n 8-layer | ✅ |
| 4 | UXUI tool | ✅ |
| 5 | 30일 TTL | ✅ |
| 6 | LLM Cost | ✅ |
| 7 | Observation schema | ✅ |
| 8 | Observation poisoning | ✅ |
| 9 | Advisory lock | ✅ |
| 10 | WebSocket limits | ✅ |
| 11 | Go/No-Go gates | ✅ |
| 12 | host.docker.internal | ✅ |

---

## R1 Verified Scores (Grade B — 1사이클 완료)

| Critic | Role | R1 | Status |
|--------|------|-----|--------|
| Winston | Architecture/API | 9.45 | ✅ PASS |
| Bob | Scrum Master | 9.00 | ✅ PASS |
| Quinn | QA/Security | 9.03 | ✅ PASS |
| Sally | UX Designer | 9.00 | ✅ PASS |
| **Average** | | **9.12** | **✅ PASS** |

### Residuals (non-blocking, deferred)

| Item | Source | Notes |
|------|--------|-------|
| L10 YAML "Go/No-Go 8개" | Bob observation | Brief 원본 메타데이터, PRD 본문 아님 |
| Go/No-Go #11 Sprint 2-3 notation | Quinn l1 | FR-TOOLSANITIZE3에서 해소 |
| NFR-SC5 SDK wildcard | Sally L2 | 구현 단계 해소 |
| Go/No-Go L601 aria-valuetext 미언급 | Sally L1 | Go/No-Go = 요약 수준, PER-5/FR/NFR에서 상세 |

---

## Stage 2 전체 요약

| Step | Section | Grade | R1 Avg | R2 Avg | Fixes | Proactive |
|------|---------|-------|--------|--------|-------|-----------|
| 2 | Discovery | B | — | — | — | — |
| 3 | Product Scope | B | — | — | — | — |
| 4 | Executive Summary | B | — | — | — | — |
| 5 | Success Criteria | A | — | — | — | — |
| 6 | User Journeys | A | — | — | — | — |
| 7 | Domain Requirements | A | — | — | — | — |
| 8 | Innovation | A | 7.53 | 8.86 | 8 | 4 |
| 9 | Tech Architecture | A | 7.53 | 8.97 | 11 | 5 |
| 10 | Scoping | A | 8.08 | 9.06 | 7+1 | 4 |
| 11 | Functional Req | A | 8.05 | 9.15 | 8 | 7 |
| 12 | Non-Functional Req | A | 8.39 | 9.18 | 6 | 3 |
| 13 | Polish | B | 9.12 | — | 0 | 13 |
