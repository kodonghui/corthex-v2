# Stage 0 Step 02 — Vision Fixes Applied (v2, Cross-talk Included)

Date: 2026-03-20
Writer: analyst (Mary)
Avg score before fix: 7.525/10 (Bob 7.5 ✅, John 7.5 ✅, Sally 7.75 ✅, Winston 7.35 ✅)

---

## Round 1 Fixes (Original Feedback)

### Bob Issue 1 [HIGH — D6] ✅ FIXED
**Issue:** PixiJS sprite asset 작업 주체 미명시.
**Fix:** Layer 1에 "픽셀 에셋 전략" 추가: 오픈소스 LPC Sprite Sheet + AI 생성(Midjourney/DALL-E) 보조. "에셋 제작은 구현 착수 전 선행 완료 필요" 명시.

### Bob Issue 2 [MEDIUM — D4] ✅ FIXED
**Issue:** 4개 레이어 구현 순서/의존성 미명시.
**Fix:** Proposed Solution 상단에 구현 순서 명시: Layer 3 → Layer 2 → Layer 4 → Layer 1. 각 레이어 헤더에 "N번째 구현" 레이블.

### John Issue 1 [HIGH — D6] ✅ FIXED
**Issue:** Reflection 크론 LLM API 비용 리스크 미언급.
**Fix:** Layer 4에 ⚠️ 비용 모델 경고: "Tier별 Reflection 한도 설정 필요. 상세는 Step 4 Metrics."

### John Issue 2 [MEDIUM — D2] ✅ FIXED
**Issue:** 비즈니스 결과 정량화 방향성 없음.
**Fix:** Executive Summary에 "핵심 성과 목표" 줄 추가 (정량 지표는 Step 4에서).

### John Issue 3 [LOW — D5] ✅ FIXED
**Issue:** n8n 마이그레이션 방향 불명확.
**Fix:** Layer 2에 "n8n은 신규 자동화 전용. 기존 ARGOS(services/argos-service.ts) 그대로 유지." 명시.

### Sally Issue 1 [HIGH — D6] ✅ FIXED
**Issue:** 픽셀 아트 UX 철학 없음.
**Fix:** Layer 1에 "픽셀 아트 UX 철학" 문단: "픽셀 캐릭터는 투명성 인터페이스. agent-loop.ts 실행 로그 → 픽셀 동작 실시간 변환 — 같은 엔진, 다른 창문."

### Sally Issue 2 [MEDIUM — D2] ✅ FIXED
**Issue:** B-프레임 경험 서술 부족.
**Fix:** 4개 Layer 각각에 "*사용자 경험*" 1문장 추가.

### Sally Issue 3 [MEDIUM — D1] ✅ FIXED
**Issue:** UXUI 테마 방향 미지정, Subframe 미언급.
**Fix:** Executive Summary + Key Differentiators #5에 Subframe + Phase 0 테마 결정 명시.

### Sally Issue 4 [MEDIUM — D2] ✅ FIXED (cross-talk)
**Issue:** Differentiator 5가 기술 부채 언어 ("428곳 색상 혼재").
**Fix:** "모든 버튼이 작동하고, 모든 색상이 의미를 갖고, AI 조직의 규모에 어울리는 인터페이스" 사용자 언어로 교체.

### Winston Issue 1 [HIGH — D1+D2] ✅ FIXED
**Fix:** Sally Issue 3와 동일.

### Winston Issue 2 [HIGH — D6] ✅ FIXED
**Issue:** Big Five soul-renderer.ts 패턴 미언급.
**Finding:** soul-enricher.ts 미존재. engine/soul-renderer.ts (extraVars) 실존 확인.
**Fix:** Layer 3에 "기존 soul-renderer.ts extraVars 확장 → {{personality_traits}} 변수 추가, E8 경계 준수" 명시.

### Winston Issue 3 [MEDIUM — D6] ✅ FIXED
**Issue:** n8n 포트 5678 보안 미언급.
**Fix:** Layer 2에 "포트 5678 내부망 한정. Hono 리버스 프록시 /admin/n8n/*" 추가.

---

## Round 2 Fixes (Cross-talk: Layer 4 Schema Conflict — BLOCKER)

### Winston/John/Bob/Sally Issue: Layer 4 스키마 충돌 [D3/D5/D6 BLOCKER] ✅ FIXED

**코드 검증 결과 (analyst 직접 확인):**
- `agent_memories` 테이블 (schema.ts L1589) — 실존. `memoryTypeEnum('learning','insight','preference','fact')`
- `memory-extractor.ts` (services/) — 실존. 태스크 후 즉시 학습 추출 (per-task, 1분 rate limit)
- v3 Vision의 신규 `memories` 테이블 = `agent_memories`와 목적 겹침 → D3 위반 + Zero Regression 위반

**채택 결정: Option B — 기존 확장 (Bob/Winston 권고 Option 3)**
- 기존 `agent_memories` 테이블: `memoryTypeEnum`에 `'reflection'`, `'observation'` 추가
- 기존 `memory-extractor.ts`: Reflection 크론 모드 확장 (즉시 추출 모드 유지)
- 신규 `observations` 테이블만 추가 (raw 실행 로그 계층 — 기존에 없음)
- 기존 v2 메모리 데이터 단절 없음 = 진정한 Zero Regression

**Layer 4 섹션 전면 재작성:** v2 기존 인프라와의 관계 명시, Option B 명시, 저장 위치를 `memories`(신규)에서 `agent_memories(reflection 타입)`으로 수정.

---

## Summary
- 총 13개 이슈 전부 적용 (Round 1: 11개 + Round 2: Layer 4 아키텍처 충돌 1개 + Sally Diff#5 1개)
- BLOCKER 해소: Layer 4 이제 v2 agent_memories 확장 전략으로 Zero Regression 준수
- soul-enricher.ts(미존재) → soul-renderer.ts extraVars(실존) 패턴으로 정확히 수정
