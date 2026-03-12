# Context Snapshot: Epic 15 PRD Addendum — Section 1 Complete

**날짜**: 2026-03-12
**작업**: Stage 1 PRD — Section 1: Epic 15 Functional Requirements
**상태**: 승인 완료 (critic-a 9/10, critic-b 9/10, 평균 9.0)

## 완료된 내용

**출력 파일**: `_bmad-output/planning-artifacts/epic-15-prd-addendum.md`

### FR 목록 (최종 v3)

**FR-CACHE-1 Prompt Caching (7개):**
- 1.1: ContentBlock[] systemPrompt + cache_control:ephemeral
- 1.2: SDK PoC 검증 → 실패 시 messages.create 대안
- 1.3: 전체 에이전트 일괄 적용 (on/off 없음)
- 1.4: engine/types.ts Stop Hook usage 타입 확장 (cacheReadInputTokens, cacheCreationInputTokens)
- 1.5: cost-tracker Hook 업데이트 (캐시 비용 서버 로그 기록, Admin UI 미노출)
- 1.6: ephemeral 5분 TTL 시작, 30일 후 1시간 전환 수동 결정
- 1.7: Soul 편집 시 5분 자연 만료 (즉시 무효화 없음)

**FR-CACHE-2 Tool Result Caching (7개):**
- 2.1: lib/tool-cache.ts 신규, withCache(toolName, ttlMs, fn) 래퍼
- 2.2: 캐시 키 = ${companyId}:${toolName}:${JSON.stringify(Object.entries(params).sort())}
- 2.3: 인메모리 Map, MAX 10,000 + LRU
- 2.4: 1분 cleanup 타이머, 100MB 초과 시 warn + LRU 즉시 정리
- 2.5: tool-cache-config.ts TTL 등록 테이블 (7개 도구)
- 2.6: hit/miss 양쪽 로그 (KPI-3 측정)
- 2.7: 예외 → warn + graceful fallback

**FR-CACHE-3 Semantic Caching (12개):**
- 3.1: semantic_cache 테이블 + hnsw(vector_cosine_ops) 인덱스
- 3.2: agents.enable_semantic_cache BOOLEAN DEFAULT FALSE
- 3.3: AgentEditForm 토글 UI, OFF 시 신규 저장 중단 + 기존 레코드 TTL 자연만료
- 3.4: engine/semantic-cache.ts (check + save 함수, try/catch fallback)
- 3.5: 조회 SQL company_id 조건 필수 (멀티테넌시 격리)
- 3.6: E8 check 패턴 + grep -v 제외 조건 (Appendix C)
- 3.7: getDB() 프록시에 findSemanticCache + insertSemanticCache 추가 (E3)
- 3.8: agent-loop.ts 통합 순서 (check → LLM → save)
- 3.9: TTL 24시간 고정 (에이전트별 커스터마이징 MVP 외)
- 3.10: hit/miss 양쪽 로그 (KPI-4 측정)
- 3.11: companyId 단위 공유 (의도적), 불일치 우려 에이전트는 false 설정
- 3.12: Library 업데이트 즉시 무효화 없음 (24시간 허용), 즉각 반영 필요 에이전트는 false

**Appendix A~F**: DB 스키마, SQL, E8 grep 패턴, TTL 테이블, withCache 예외 처리, 에이전트 적합/부적합 테이블

## 주요 결정 사항

- FR-CACHE-1.4/1.5 분리: 타입 확장 vs 로깅 정책을 별도 FR로 분리 (critic-a 권고 반영)
- Library 무효화 정책: FR-CACHE-3.12 신규 추가 — 24시간 TTL 허용, MVP에서 삭제 API 미구현
- 에이전트 간 캐시 공유: companyId 단위 공유 유지 (agent_id Phase X), Admin false 설정으로 개별 제외

## 다음 단계

- Section 2: Epic 15 Non-Functional Requirements (성능 NFR, 보안 NFR, 운영 NFR)
- team-lead의 다음 지시 대기
