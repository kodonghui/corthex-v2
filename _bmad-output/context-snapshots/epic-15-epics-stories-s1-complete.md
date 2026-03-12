# Context Snapshot: Epic 15 Epics & Stories — Section 1 Complete

**날짜**: 2026-03-12
**작업**: Stage 4 Epics & Stories — Section 1: Epic 15 Breakdown (3 Stories)
**상태**: 승인 완료 (critic-a 10/10, critic-b 9.5/10, 평균 9.75)

## 완료된 내용

**출력 파일**:
- `_bmad-output/planning-artifacts/epic-15-epics-and-stories.md` (NEW)
- `_bmad-output/implementation-artifacts/stories/15-1-prompt-caching.md` (REFRESHED)
- `_bmad-output/implementation-artifacts/stories/15-2-tool-result-caching.md` (REFRESHED)
- `_bmad-output/implementation-artifacts/stories/15-3-semantic-caching.md` (REFRESHED)

## 핵심 결정 요약

### Story 15.1 — Prompt Caching (5 SP, P0)
- PoC 선행 필수 (D17 결정 트리): SDK ContentBlock[] 지원 확인 후 경로 A/B 선택
- 경로 B(messages.create()) 선택 시 Hook 파이프라인 단절 위험 → 팀 리드 재협의 필수
- engine/types.ts: `cacheReadInputTokens?`, `cacheCreationInputTokens?` 추가
- cost-tracker: 캐시 토큰 비용 로깅 ($0.30/MTok read, $3.75/MTok creation)

### Story 15.2 — Tool Result Caching (8 SP, P1)
- lib/tool-cache.ts: withCache() + CacheStore 인터페이스 (Phase 4 Redis 전환 대비)
- lib/tool-cache-config.ts: 7개 도구 TTL 등록 + getCacheRecommendation()
- Cache key: `${companyId}:${toolName}:${JSON.stringify(Object.entries(params).sort())}`
- LRU 10,000 상한 + 1분 cleanup + heapUsed ≥ 100MB 경보

### Story 15.3 — Semantic Caching (21 SP, P0)
- DB 마이그레이션 2개: semantic_cache + agents.enable_semantic_cache
- engine/semantic-cache.ts: checkSemanticCache() 반환 `{ response: string; similarity: number } | null`
- CREDENTIAL_PATTERNS: lib/credential-patterns.ts 공유 (복사 금지 — 보안)
- Admin UI: AgentEditForm Switch, 모달 제목 "응답 캐싱을 비활성화하시겠습니까?"
- Admin 추천 표시: Option A (서버 API 응답에 semanticCacheRecommendation 포함)
- yieldCachedResponse(): SSE accepted → processing → message → done(costUsd:0)
- 300ms spinner 오버라이드, E8 CI 패턴, ARGOS 만료 행 정리

### 스토리 의존성
- 15.1 → 15.3 (블로킹, 권장)
- 15.2 → 15.3 Task 5 (소프트, getCacheRecommendation 활용)
- 15.2 독립 (하드 블로킹 없음)

## 다음 단계
- team-lead의 Stage 5 (Implementation Readiness) 지시 대기
