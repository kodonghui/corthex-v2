# Context Snapshot: Brief step-03 (Target Users + Personas)

**Date:** 2026-03-11
**Score:** Critic-A 9/10 + Critic-B 9/10 = avg 9/10 — PASS
**Output file:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md`
**Lines written:** 145-230

---

## Key Decisions Made in Step-03

1. **Primary 페르소나 2개 확정:**
   - 김운영 (Admin/운영 관리자): 비용 책임자. 월별 청구서 보고, 에이전트 확장 주저. 성공 = cache_read_input_tokens 70%+ 확인 → 확장 결정
   - 이주임 (Hub 사용자/영업팀 대리): FAQ 반복 질문 5초 대기. 성공 = FAQ 질문 ≤100ms

2. **Secondary 페르소나 2개 확정:**
   - AI 에이전트 자체: TTFT 85% 단축 간접 수혜. stale-on-error fallback은 미설계 기능 (명시)
   - BMAD 개발자 워커: enableSemanticCache 구현 요구사항 포함

3. **이주임 여정: 주가(kr_stock) 예시 금지 — FAQ 쿼리 전용**
   - enableSemanticCache=false 에이전트(주가·뉴스)는 Semantic Cache 여정 예시로 사용 불가
   - 올바른 예시: "출장비 처리 규정", "영업 보고서 양식" 등 enableSemanticCache=true 에이전트

4. **TTL 기준 확정:**
   - FAQ/정책 에이전트: TTL 24시간
   - Tool Cache 주가(kr_stock): TTL 1분 (Semantic Cache 미적용, Tool Cache만)

5. **enableSemanticCache 구현 요구사항:**
   - `agents` 테이블 `enable_semantic_cache BOOLEAN DEFAULT FALSE` 컬럼 추가
   - Admin 콘솔 에이전트 편집 화면에서 토글 가능
   - 기본값 false = opt-in 방식 (실시간 데이터 에이전트 자동 보호)

6. **캐시 UI (⚡ 배지) 결정:**
   - MVP에서는 미구현 — UX 설계 단계에서 별도 결정 예정

7. **cache_read_cost 접근 방식:**
   - admin UI 미노출 — `cost_tracker` Hook 서버 로그 직접 조회 또는 Anthropic 대시보드

8. **Tool Cache 히트율 로깅:**
   - Story 15.2 scope: `log.info({ event: 'tool_cache_hit', toolName, companyId })` 구현 필수

---

## Sections Written (step-03 범위)

- Target Users / Primary Users: 페르소나 1,2 (lines 147-176)
- Target Users / Secondary Users: 페르소나 3,4 (lines 177-197)
- Target Users / User Journey: 3개 여정 표 (lines 198-230)

---

## Next Steps

- Step-04: Success Metrics + KPIs
- Step-05: MVP Scope + Future Vision
- Step-06: Final Review + Completion
