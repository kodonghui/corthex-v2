# Stage 4 Step 02 — Bob (Critic-C, Scrum Master) R2 Verification

**Reviewer:** Bob (Critic-C, Product + Delivery / Scrum Master)
**Date:** 2026-03-22
**Round:** R2 (Verification of 17 unique fixes)
**Weights:** D1=15%, D2=20%, D3=15%, D4=15%, D5=15%, D6=20%

---

## Bob R1 Issues — Fix Verification

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| 1 | Memory model 2-table vs 3-table | ✅ FIXED | L86, L1345, L1349-1353, L1508 all "Option B". No stale 3-table refs. |
| 2 | n8n 6→8 layer (4 occurrences) | ✅ FIXED | L1342, L1360, L1378, L1435 all "8-layer". Full breakdown at L1475 (SEC-1~SEC-8). |
| 3 | Gemini references (3 occurrences) | ✅ FIXED | L385 `voyageai` (strikethrough `@google/genai`), L1345 "Voyage AI 1024d", L1406 "1024차원". |
| 4 | Go/No-Go 9→14 gates | ✅ FIXED | L89 "14개", L1429 "14개", matrix L1431-1446 lists #1-#14 with criteria+fallback. |
| 5 | Pre-Sprint Voyage AI missing | ✅ FIXED | L1414 explicitly added with "Go/No-Go #10" reference. |
| 6 | Observation TTL 90→30 days | ✅ FIXED | L1351 "30일 TTL", L1406 "30일" + recalculated 30,000행/120MB. |
| 7 | n8n Docker RAM 4G→2G | ✅ FIXED | L1398 "≤2GB (hard cap)", L1404 "2G hard cap (확정 결정 #2)". **BUT R6 (L1457) stale: "4G/2CPU"**. |
| 8 | Cross-cutting dual definition | ✅ FIXED | L1464 "정규 목록은 상단 참조. 아래는 구현 상세." Numbering #7-12 consistent. |

**Fix rate: 8/8 CRITICAL+HIGH resolved. 1 minor stale reference remains (R6).**

---

## Additional Fixes Verified (consensus + other critics)

| Fix | Status | Evidence |
|-----|--------|----------|
| FR total 116→123 (v2:70 + v3:53) | ✅ | L59 "123개, 20 Areas", L1337 "53개 신규, v2 70개 → 총 123개" |
| NFR total 74→76 (v2:58 + v3:18) | ✅ | L91 "76개", L1355 "18개 신규, v2 58개 → 총 76개" |
| FR-TOOLSANITIZE 1→3 FRs | ✅ | L87 "FR-TOOLSANITIZE1 감지 + ...2 차단+감사 + ...3 adversarial" |
| FR-UX added (3 FRs) | ✅ | L88 "CEO앱 페이지 통합 (FR-UX) | 3" |
| Go/No-Go #11 "tool sanitization" | ✅ | L89, L1443 |
| NFR Security 10→9 (S7 deleted) | ✅ | L98 with deletion note |
| NFR Data Integrity 8→7 (D7 deleted) | ✅ | L102 with deletion note |
| Memory Option B explicit | ✅ | L1349-1353 detailed breakdown, L1508 FIX-3 carry-forward |
| ECC-5 → gate #14 | ✅ | L1492, L1502 |
| SessionContext +runId | ✅ | Verified field added |
| soul-enricher → services/ path | ✅ | L1466, cross-cutting #7 |

---

## R2 차원별 점수

| 차원 | 가중치 | R1 | R2 | 근거 |
|------|--------|-----|-----|------|
| D1 구체성 | 15% | 8 | 8/10 | 변동 없음. Docker 플래그, 파일 경로, 보안 레이어 상세(SEC-1~8 분해) 추가로 더 구체적. |
| D2 완전성 | 20% | 6 | **8/10** | Go/No-Go 14개 완성, Pre-Sprint Voyage 추가, FR-UX 추가, NFR 삭제 항목 명시. 확정 결정 #7 필드 리네임은 L1351 `reflected` boolean으로 암시적 반영. Sprint 기간/벨로시티는 Step 4+ 스코프로 합리적. |
| D3 정확성 | 15% | 5 | **9/10** | 원래 7건 팩트 오류 중 6.5건 해소. **잔존 1건**: R6(L1457) "4G/2CPU" — 확정 결정 #2는 2G. 나머지 확정 결정 #1~#12 전부 정확 반영 확인. |
| D4 실행가능성 | 15% | 7 | **8/10** | Option B 통일로 구현 방향 명확. observations 1테이블 + agent_memories 확장, 마이그레이션 범위 명확. N8N-SEC 8-layer 전체 분해(SEC-1~8)로 구현 가이드 향상. |
| D5 일관성 | 15% | 4 | **8/10** | R1의 8건 내부 모순 전부 해소: 메모리 모델, n8n 레이어, FR/NFR 수, Go/No-Go 수, 컴포넌트 수, cross-cutting 번호. **잔존**: R6 "4G" 1건 + ECC 테이블 2중(L1484 vs L1494) 사소한 중복. |
| D6 리스크 | 20% | 6 | **8/10** | 4개 신규 리스크(HNSW rebuild, CPU contention, Voyage schedule R11, n8n path traversal) 추가. Sprint 2 과부하는 "Step 4 분할 결정"으로 carry-forward — 적절한 시점 판단. Layer 0 60% 게이팅 벨로시티 추적 미정의이나 Step 5+ 스코프. |

---

## 가중 평균: 8.15/10 ✅ PASS

계산: (8×0.15) + (8×0.20) + (9×0.15) + (8×0.15) + (8×0.15) + (8×0.20) = 1.20 + 1.60 + 1.35 + 1.20 + 1.20 + 1.60 = **8.15**

---

## 잔존 이슈 (2건, 비차단)

### 1. [D3 Minor] R6 완화책 "4G/2CPU" — L1457
Risk Registry R6 완화책: "4G/2CPU 제한" → **"2G/2CPU 제한"** (확정 결정 #2: `--memory=2g`). 나머지 n8n RAM 참조는 전부 수정됨. 이 1곳만 잔존.

### 2. [D5 Minor] ECC 테이블 2중 정의 — L1484 vs L1494
거의 동일한 ECC 테이블이 2번 나타남. 내용은 일관하나 불필요한 중복. 하나로 통합 권고.

---

## Scrum Master 판정

**Sprint Planning 상태: 🟡 READY (carry-forwards 존재)**

R1에서 🔴 HIGH였던 Sprint Planning 위험도가 다음 해소로 🟡로 개선:
- 메모리 모델 Option B 확정 → Sprint 3 스코프 명확
- Go/No-Go 14개 완전 정의 → Sprint별 게이트 명확
- Pre-Sprint 블로커 4개 전부 나열 → 착수 조건 명확

**Carry-forwards (Step 4에서 해결):**
- Sprint 2/2.5 분할 결정 (16+ FRs 과부하)
- Sprint별 기간/벨로시티 프레임워크
- Layer 0 60% 게이팅 벨로시티 추적 방법
