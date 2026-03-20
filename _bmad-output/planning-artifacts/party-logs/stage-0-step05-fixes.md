# Stage 0 Step 05 — MVP Scope Fixes Applied

Date: 2026-03-20
Writer: analyst (Mary)
Avg score before fix: 7.775/10 (John 7.35 ✅, Bob 7.55 ✅, Sally 8.10 ✅, Winston 8.10 ✅)

---

## Fixes Applied

### Issue 1 [HIGH — D6] ✅ FIXED: Phase 0 테마 결정 → Sprint 1 착수 선행 조건 (John/Sally 공통)
**Issue:** Sprint 1~3 UI 개발 중 테마 미확정 시 전면 재작업 리스크.
**Fix:** Sprint 순서 표에 "Pre-Sprint" 행 추가: Phase 0 디자인 토큰 확정 = Sprint 1 착수 전 완료 필수. 미확정 시 전 Sprint UI 재작업 리스크 명시.

### Issue 2 [HIGH — D6] ✅ FIXED: Layer 1 에셋 AI Go/No-Go 게이트 없음 (John)
**Issue:** Stage 1 Research 결과 불량 시 Sprint 4 블로커 — Go/No-Go 목록에 없음.
**Fix:** Go/No-Go 게이트 #8 추가: "에셋 품질 승인: Stage 1 Technical Research 에셋 방향 승인 완료 (Sprint 4 착수 선행 조건)"

### Issue 3 [MEDIUM — D2/D6] ✅ FIXED: Layer 0 병행 Sprint 작업 분류 없음 (Bob)
**Issue:** "전 Sprint 병행"만 선언, Sprint별 분류 없어 Solo dev 용량 초과 리스크.
**Fix:** Sprint 표 Layer 0 의존성 칸에 "전 Sprint 인터리브. Sprint별 해당 기능 페이지 UXUI 병행" 명시.

### Issue 4 [MEDIUM — D6] ✅ FIXED: Layer 0 병행 중간 완료 기준 없음 (John)
**Issue:** Sprint 중간에 뒤처질 때 캐치 기준 없음.
**Fix:** Layer 0 의존성에 "중간 게이팅: Sprint 2 종료까지 ≥ 60% 미달 시 레드라인 검토" 추가.

### Issue 5 [MEDIUM — D2] ✅ FIXED: 사이드바 IA 결정 누락 (Bob/Sally 공통)
**Issue:** 신규 페이지 3개(n8n 관리, /office Admin read-only, /office CEO) 사이드바 배치 미결정.
**Fix:** Layer 0 In Scope에 "신규 페이지 사이드바 IA 결정: 해당 기능 Sprint 착수 전 완료" 추가.

### Issue 6 [MEDIUM — D6] ✅ FIXED: memory-extractor.ts 이중 모드 race condition (Bob)
**Issue:** 즉시 추출 + 크론 모드 동시 write 시 race condition 가능성.
**Fix:** 크론 모드를 `memory-reflection.ts` 별도 파일로 분리 (E8 경계 철학 준수). 3단계 흐름 명시: 실행완료→observations→memory-reflection 크론→agent_memories[reflection].

### Issue 7 [D4 — Sprint 3] ✅ FIXED: Sprint 3 선행 조건 미명시 (Winston)
**Issue:** PRD Tier 비용 한도 확정이 Sprint 3 블로커인데 표에 없음.
**Fix:** Sprint 3 행 의존성에 "PRD Tier 비용 한도 확정 선행 필수 (미확정 시 Sprint 3 블로커)" 추가.

### Issue 8 [D2 — observations] ✅ FIXED: observations vs Out of Scope 혼동 (Winston)
**Issue:** Out of Scope에 "신규 테이블 금지"가 있는데 observations 신규 추가도 있어 PRD 작성자 혼동 가능.
**Fix:** Layer 4 내 3단계 흐름 명시: "observations는 agent_memories 대체가 아닌 raw INPUT 계층." + Neon zero-downtime migration 패턴 추가.

### Issue 9 [LOW] ✅ FIXED: AI 에셋 품질 리스크 미언급 (Sally/John)
**Issue:** Research 불충분 시 블로커 조건 없음.
**Fix:** Layer 1에 "⚠️ 에셋 품질 리스크: Research 불충분 시 Sprint 4 착수 전 대안 확정 필수" 추가.

---

## Summary
- 총 9개 이슈 전부 적용
- Pre-Sprint Phase 0 선행 조건 — Sprint 1~3 재작업 리스크 차단
- memory-reflection.ts 분리 — race condition 방지 + E8 경계 준수
- observations 역할 명확화 — PRD 작성자 혼동 방지
- Go/No-Go 7개 → 8개 (에셋 품질 승인 추가)
- Sprint 3 블로커 조건 표에 명시
