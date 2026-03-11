# Context Snapshot: Brief step-05 (MVP Scope + Future Vision)

**Date:** 2026-03-11
**Score:** Critic-A 9.5/10 + Critic-B 10/10 = avg 9.75/10 — PASS
**Output file:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md`
**Lines written:** 308-400

---

## Key Decisions Made in Step-05

1. **MVP = 3개 Story 순차 구현 (전부 MVP 범위):**
   - Story 15.1: Prompt Caching (P0) — engine/agent-loop.ts 1곳, SDK PoC 전제
   - Story 15.2: Tool Result Caching (P1) — lib/tool-cache.ts 신규, 7개 도구 우선
   - Story 15.3: Semantic Caching (P2) — DB 마이그레이션 + engine/semantic-cache.ts + Admin toggle

2. **도구 캐시 기본 정책 확정:**
   - `withCache()` 미래퍼 도구 = 캐시 없음 (기존 동작 유지)
   - 신규 도구 추가 시 `lib/tool-cache-config.ts` TTL 등록 테이블에 수동 명시 필요
   - 실시간/창의적 도구는 `ttlMs=0` 명시적 설정

3. **VECTOR 차원 확정: 768 (Gemini text-embedding-004)**
   - `schema.ts:1555` 확인 결과 vector(768)
   - 1536은 OpenAI ada-002 차원값 — 사용 금지

4. **Semantic Cache 에이전트 간 공유: 의도적 설계**
   - `agent_id` 컬럼 없음. 동일 companyId 내 에이전트 간 캐시 공유됨
   - 근거: FAQ 답변은 회사 전체 공유가 히트율 향상에 유리
   - 에이전트별 격리 필요 시 Phase X에서 agent_id 컬럼 추가

5. **db/scoped-query.ts 확장 필요 (Story 15.3 scope):**
   - `findSemanticCache(companyId, embedding, threshold)` 추가
   - `insertSemanticCache(companyId, ...)` 추가
   - 현재 getDB() 프록시에 vector search 메서드 없음

6. **캐시 레이어 예외 처리 정책:**
   - 캐시 레이어(semantic-cache.ts / lib/tool-cache.ts) 예외 → try/catch + 경고 로그 + fallback 필수
   - 외부 API 장애 → 에러 전파 (stale-on-error 미설계)

7. **Story 15.3 영향 패키지:**
   - packages/server (engine/semantic-cache.ts + API + Drizzle migration 단일 파일)
   - packages/admin (enableSemanticCache toggle UI)
   - DB migration 2개 변경 원자적 적용 (semantic_cache 테이블 + agents 컬럼)

8. **MVP Done 기준 확정 (11개):**
   - 빌드 통과, 캐시 활성화, Tool Cache 동작, 메모리 안정성, Semantic Cache 동작
   - 멀티테넌시 격리, E8 경계 준수, 전체 테스트 통과
   - KPI-1 (≥ 85% per hit), KPI-2 (실효 절감율 ≥ 60%), KPI-3 (히트율 ≥ 20%)

9. **Out of Scope 주요 항목:**
   - Redis 전환: 다중 서버 배포 시 (단일 서버에서는 에이전트 수 무관 인메모리 유지)
   - Hub UI ⚡ 배지: UX 설계 단계 별도 결정
   - 1시간 TTL 자동 전환: 30일 데이터 후 수동 결정
   - semantic_cache 주기적 cleanup: Out of Scope (테이블 무한 증가 인지 상태)

10. **Future Vision:**
    - Phase 4: Redis 전환 (다중 서버 배포 시) + 1시간 TTL 자동화 + Admin UI
    - Phase 5: Hub ⚡ 배지 + Cache warming + 품질 자동화
    - Phase 6: 분산 캐시 + 임베딩 모델 교체 시 자동 무효화 + 비용 예측 대시보드

---

## Sections Written (step-05 범위)

- Core Features: Story 15.1~15.3 (lines 314-348)
- Out of Scope for MVP: 10개 항목 표 (lines 350-366)
- MVP Success Criteria: 11개 완료 조건 표 (lines 368-383)
- Future Vision: Phase 4~6 (lines 385-400)

---

## Next Steps

- Step-06: Final Review + Completion
