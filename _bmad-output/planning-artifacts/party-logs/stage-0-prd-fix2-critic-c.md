# Critic-C Re-Review — Stage 0: PRD v3 Spec Fix (Round 2)

**Reviewer:** Bob (SM) + John (PM) — Critic-C
**Date:** 2026-03-20
**File reviewed:** `_bmad-output/planning-artifacts/prd.md`
**Previous score:** 6.3/10 ❌ FAIL
**Purpose:** Verify fix application + re-score

---

## 수정 적용 확인 결과

| Issue # | 설명 | 상태 | 확인 근거 |
|---------|------|------|---------|
| Issue 1 (Critical D5) | FR-PERS3·MEM6 vs agent-loop.ts | ✅ FIXED | soul-enricher.ts 도입 + 절대 규칙 #1 업데이트 + FR-PERS3/MEM6 soul-enricher.ts 참조 |
| Issue 2 (High D2) | Phase 5 전용 NFR 없음 | ❌ NOT FIXED | NFR 테이블에 Phase 5 항목 없음. PixiJS FPS, /ws/office 이벤트 레이트, memory-reflection 타임아웃, n8n RAM 예산 전부 미추가 |
| Issue 3 (Medium D3) | NFR-SC7 VPS 4GB → 24GB | ❌ NOT FIXED | L1406 여전히 "Oracle VPS 4GB 기준". L306도 "Oracle VPS 4GB 기준" 유지 |
| Issue 4 (Medium D1) | FR-OC7 activity_logs "tail" 메커니즘 미명시 | ❌ NOT FIXED | L440 여전히 "기존 activity_logs 테이블 tail. 신규 테이블 없음." — NOTIFY vs 폴링 미명시 |
| Issue 5 (Medium D6) | Phase 5 4개 기능 의존성 그래프 없음 | ❌ NOT FIXED | Phase 5 섹션에 soul-enricher.ts → Big Five/Memory 의존성 순서 없음 |
| Issue 6 (Low D6) | 기존 워크플로우 데이터 마이그레이션 계획 없음 | ❌ NOT FIXED | FR-N8N3 "자체 구현 코드 삭제" 후 DB 테이블 처리 방침 없음 |
| Issue 7 (Medium D5) | Out of Scope 표 미갱신 | ❌ NOT FIXED | L597 "에이전트 메모리 시스템 개편 \| autoLearn 유지... \| Phase 5+" 여전히 존재 |
| Issue 8 (Medium D6) | PixiJS 번들 lazy load 미명시 | ✅ FIXED | FR-OC1: React.lazy + dynamic import + "CEO앱 메인 번들 ≤ 300KB 유지" 명시 |

---

## 신규 발견 이슈 (Cross-check with Critic-A/B)

### 🔴 NEW Issue A — [D3 정확성 내부 모순] Feature 5-3/5-4 설명 블록 미갱신

FR-PERS3, FR-MEM6은 soul-enricher.ts로 올바르게 수정됐지만, **Feature 설명 블록은 미갱신**:

- **L487 (Feature 5-3)**: `"Soul 주입 위치: engine/agent-loop.ts의 Soul 변수 치환 단계에서 {personality_traits} 변수로 주입"` — soul-enricher.ts로 교체되지 않음
- **L544-547 (Feature 5-4 계획 단계)**: `"engine/agent-loop.ts에서 Soul 주입 직전 실행... {relevant_memories} 변수로 Soul에 주입"` — soul-enricher.ts 언급 없음

같은 PRD 안에서 Feature 설명 블록(옛 방식)과 FR 항목(새 방식)이 충돌한다. 개발자가 Feature 설명을 먼저 읽으면 여전히 agent-loop.ts를 직접 수정하게 된다.

**수정 필요:**
- Feature 5-3 L487 → `"Soul 주입 위치: soul-enricher.ts — agent-loop.ts 호출 전 {personality_traits} 변수 치환 (Phase 5 절대 규칙 #7 참조)"`
- Feature 5-4 L544-547 → `"계획 단계: soul-enricher.ts가 reflections 상위 3개 검색 → {relevant_memories} 주입 (engine/agent-loop.ts는 soulEnricher.enrich() 1행만 삽입)"`

### 🟠 NEW Issue B — Critic-B Issue 1 여전히 미처리: n8n 포트 5678 보안

Critic-B가 flagged한 n8n 보안 이슈가 아직 미반영:
- L454: `"n8n Docker 컨테이너 → Oracle VPS 동일 서버 (포트 5678)"` — 외부 차단 없음
- Hono reverse proxy 패턴 (`/admin/n8n/*` → `localhost:5678`) 미추가
- FR-N8N4 n8n 기본 인증(basic auth) 명시 없음

**수정 필요:** FR-N8N4에 `"포트 5678은 VPS 방화벽 외부 차단 (localhost 전용). Hono 역방향 프록시 `/admin/n8n-proxy/*` → localhost:5678 (기존 JWT 인증 재활용)"` 추가

---

## 재채점

| 차원 | 이전 점수 | 수정 후 점수 | 변화 이유 |
|------|---------|---------|---------|
| D1 구체성 | 7/10 | 7/10 | Issue 4 미수정. Feature 설명 블록 구체성 저하. |
| D2 완전성 | 6/10 | 5/10 | Issue 2 미수정: Phase 5 NFR 여전히 0개. observations processed 컬럼 없음(Critic-B) |
| D3 정확성 | 7/10 | 5/10 | Issue 3 미수정: NFR-SC7 4GB 여전히 오류. Feature 5-3/5-4 설명 블록 FR과 내부 모순 신규 발견 |
| D4 실행가능성 | 7/10 | 6/10 | Issue 1 Fix로 soul-enricher.ts 패턴은 명확. 그러나 FR-OC7 메커니즘, FR-MEM3 트리거 여전히 불명확 |
| D5 일관성 | 4/10 | 6/10 | Issue 1 Fix: 핵심 모순 해소 ✅. 그러나 Out of Scope 표(Issue 7), Feature 설명 블록 내부 모순(신규) 잔존 |
| D6 리스크 | 6/10 | 4/10 | n8n 보안 미수정(Issue A New), Phase 5 의존성 미수정(Issue 5), FR-N8N3 마이그레이션 미수정(Issue 6) |

### 가중 평균

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 7 | 20% | 1.40 |
| D2 완전성 | 5 | 20% | 1.00 |
| D3 정확성 | 5 | 15% | 0.75 |
| D4 실행가능성 | 6 | 15% | 0.90 |
| D5 일관성 | 6 | 10% | 0.60 |
| D6 리스크 | 4 | 20% | 0.80 |
| **합계** | | **100%** | **5.45/10** |

### **재채점 결과: 5.45/10 ❌ FAIL (7.0 미만)**

D2=5, D3=5, D6=4 — 세 차원 7 미만. 7점 기준 미달.

---

## Bob의 SM 코멘트

> "Issue 1(agent-loop.ts 모순) 해소와 PixiJS lazy load 추가는 잘 됐다. 그러나 n8n 포트 5678이 여전히 외부에 열려 있다 — 이건 보안 이슈고, Critic-B가 Round 1에서 이미 flagged한 것이다. Phase 5 NFR도 여전히 없다. QA 합격/불합격 기준 없이 4개 기능을 Sprint에서 검증할 방법이 없다. NFR-SC7 4GB는 사소해 보이지만 개발자가 'VPS 4GB에 n8n 2GB 추가하면 OOM이니 n8n 못 올린다'는 잘못된 결론에 도달하면 치명적이다. 3개 이슈만 수정해도 7점 넘길 수 있다 — 지금 당장 고쳐야 할 것들이다."

---

## 3차 수정 최우선 목록 (Bob + John 합의)

### Priority 1 — 즉시 수정 (D6/D3 리스크)
1. **NFR-SC7 4GB → 24GB 수정** (L1406 + L306)
   - `"pgvector HNSW 인덱스 포함 ≤ 16GB (Oracle VPS **24GB** ARM64 4코어 기준)"`
   - `"query() 세션당 ≤ 200MB (Oracle VPS 24GB 기준)"` (Critic-B)

2. **n8n 포트 5678 보안 (FR-N8N4 + Feature 5-2 배포 섹션)**
   - FR-N8N4: `"포트 5678은 VPS 방화벽에서 외부 차단. Hono 역방향 프록시 /admin/n8n-proxy/* → localhost:5678 (기존 JWT 인증 재활용)"`

### Priority 2 — Phase 5 완성도 (D2)
3. **Phase 5 전용 NFR 섹션 신설** (NFR-P5 또는 NFR-SC 테이블 뒤에 추가)

   | ID | 기능 | 기준 | Phase |
   |----|------|------|-------|
   | NFR-P5-1 | OpenClaw 렌더 | ≥ 30fps (60에이전트 동시) | 5 |
   | NFR-P5-2 | /ws/office 이벤트 레이트 | ≤ 1개/초/에이전트 (100에이전트 = 100/초 상한) | 5 |
   | NFR-P5-3 | memory-reflection 타임아웃 | ≤ 30초 (초과 시 Gemini 호출 abort + partial reflections 저장) | 5 |
   | NFR-P5-4 | n8n Docker RAM 상한 | ≤ 1GB (NODE_OPTIONS=--max-old-space-size=1024) | 5 |

### Priority 3 — 내부 일관성 (D3/D5)
4. **Feature 5-3 L487 설명 블록 수정** → soul-enricher.ts 참조
5. **Feature 5-4 L544-547 계획 단계 수정** → soul-enricher.ts 참조
6. **Out of Scope 표 L597 삭제** → "에이전트 메모리 시스템 개편 Phase 5+" 항목 제거

### Priority 4 — 실행가능성 (D1/D4)
7. **FR-OC7 tail 메커니즘 명시** → `"방식: 500ms polling (PostgreSQL LISTEN/NOTIFY는 Neon serverless 미지원 확인 후 폴백 적용)"`
8. **Phase 5 의존성 그래프 추가** (soul-enricher.ts → Big Five/Memory, n8n·OpenClaw 독립)

---

## 예상 점수 (3차 수정 후)

Priority 1~3 수정 완료 시:
- D2: 5 → 7 (Phase 5 NFR 신설)
- D3: 5 → 8 (NFR-SC7 수정 + 내부 일관성 해소)
- D5: 6 → 8 (Out of Scope 정리 + Feature 설명 블록 일치)
- D6: 4 → 7 (n8n 보안 해소)
- 예상 합계: **7.40/10 ✅ PASS** 예상
