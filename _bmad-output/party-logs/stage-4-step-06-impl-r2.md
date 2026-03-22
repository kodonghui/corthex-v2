# Critic-Impl Review R2 — Step 6: v3 Project Structure & Boundaries

**Reviewer**: impl (Implementation Critic)
**Focus**: Code implementability, E8 boundary, existing v2 patterns
**Weights**: D1=15%, D2=15%, D3=25%, D4=20%, D5=15%, D6=10%
**Date**: 2026-03-22
**Round**: R2 (R1 7.90 → R2)

---

## R1 이슈 검증 결과

| R1 이슈 | Fix # | 상태 | 검증 |
|---------|-------|------|------|
| 🔴 Migration `.ts` → `.sql` | F1 | ✅ 해결 | L2504-2508: `0061_voyage_vector_1024.sql` ~ `0064_extend_agent_memories.sql` 순번 정확 |
| 🔴 `routes/observations.ts` 누락 | F2 | ✅ 해결 | L2494-2496: `routes/workspace/observations.ts` 추가 + L2611 의존성 행 + L2647 FR mapping |
| 🟡 `db/logger` 경로 | F12 | ✅ 해결 | L2616: `lib/activity-logger.ts` |
| 🟡 Vector rollback | F13 | ✅ 해결 | L2505: "⚠️ 비가역: 롤백 시 전체 re-embed 필요" |
| 🟡 tool-handlers 미기재 | — | ✅ 수용 | v3 NEW 파일 트리이므로 기존 MODIFY 파일 미기재는 합리적. E11에서 9 callers 명시. |
| 🟡 L265/L277 라벨 | — | ⚠️ 잔존 | Step 5 E15 문제. Step 6은 참조만 하므로 여기서 수정 불필요. |

**추가 개선 확인:**
- FR-PERS mapping PRD 기준 수정 (L2625-2629) ✅
- FR-N8N mapping PRD 기준 수정 (L2635-2638) ✅
- Sprint 2 NEW 8개, Sprint 3 NEW 5개, Sprint 4 NEW 11개, 총계 ~29 (L2568-2574) ✅
- `__tests__/sprint4/` 디렉토리 + 2 test files (L2524-2526) ✅
- marketing.ts → n8n-proxy 내부 fetch 경로 명시 (L2493, L2610, L2693) ✅
- Reflection 크론 cross-cutting 8행 추가 (L2681) ✅
- Observation E8: "hub.ts 후처리 → sanitizeObservation()" (L2694, L2722) ✅
- Layer 0 merge conflict 규칙 (L2576) ✅

---

## 차원별 점수

| 차원 | R1 | R2 | 근거 |
|------|-----|-----|------|
| D1 구체성 | 9 | 9/10 | 이미 우수. 마이그레이션 순번(0061~0064), Sprint4 파일 11개 구체적 열거. |
| D2 완전성 | 8 | 9/10 | observations.ts 추가, 모든 Sprint NEW/MODIFY 정확, 8개 cross-cutting concern 완비. |
| D3 정확성 | 7 | 9/10 | Migration `.sql` 확정, workspace/observations 경로 명확, db/logger 수정, FR mapping PRD 일치. |
| D4 실행가능성 | 8 | 9/10 | 모든 파일 경로 정확, marketing→n8n-proxy fetch 경로, observation E8 경계, merge conflict 규칙. |
| D5 일관성 | 8 | 9/10 | FR mapping ↔ PRD 정합, Sprint 카운트 일관, dependency matrix 완전, cross-cutting 8행. |
| D6 리스크 | 8 | 9/10 | Vector rollback 경고, merge conflict 방지 규칙, marketing Docker 간접 접근. |

---

## 가중 평균: 9.00/10 ✅ PASS

```
D1: 9 × 0.15 = 1.35
D2: 9 × 0.15 = 1.35
D3: 9 × 0.25 = 2.25
D4: 9 × 0.20 = 1.80
D5: 9 × 0.15 = 1.35
D6: 9 × 0.10 = 0.90
─────────────────
Total:          9.00
```

---

## 잔여 이슈

없음. L265/L277 라벨 스왑은 Step 5 E15 문제이며 Step 6은 참조만 하므로 별도 수정 불필요.

---

## 최종 판정

**9.00/10 ✅ PASS** — R1 대비 +1.10점 향상. 2개 필수 수정 + 12개 추가 개선 전부 반영. 디렉토리 구조, 의존성 매트릭스, FR→파일 매핑 모두 실제 코드베이스와 정합. 구현 착수 가능.
