# Context Snapshot: Epic 15 Architecture Addendum — Section 1 Complete

**날짜**: 2026-03-12
**작업**: Stage 2 Architecture — Section 1 Architecture Decisions Update
**상태**: 승인 완료 (critic-a 9/10, critic-b 9.5/10, 평균 9.25)

## 완료된 내용

**출력 파일**:
- `_bmad-output/planning-artifacts/epic-15-architecture-addendum.md` (Section 1)
- `_bmad-output/planning-artifacts/architecture.md` (D8, D13 수정, D17-D19 롤백, Caching Architecture 섹션)

## 최종 아키텍처 결정 구조

### architecture.md 변경 사항
- **D8**: DB 쿼리 캐싱 "없음" → Epic 15 캐싱 레이어가 D8 범위 밖임을 명확히
- **D13**: Deferred → Important Decisions (4열 포맷). "세부 결정 D17~D20은 addendum 참조"
- **D17-D19 직접 수정 롤백**: 번호 충돌 해소. addendum이 공식 권위 문서
- **D21**: Tool Cache Redis 전환 Deferred 추가 (Phase 4+)
- **Caching Architecture 섹션**: callee-side masking, Layer 3 graceful fallback, credential-scrubber PostToolUse 수정
- **Validation**: D1~D16 → D1~D21 전체 업데이트 (5개 위치)

### addendum D17~D21 (공식 Epic 15 결정)

| # | 결정 | 선택 |
|---|------|------|
| D17 | Prompt Cache 전략 | ContentBlock[] + cache_control:ephemeral. PoC 선행 필수 (SDK 지원 여부). 실패 시 messages.create() 직접 호출 |
| D18 | Tool Cache 위치 | lib/tool-cache.ts (engine/ 밖, E8 미적용). Phase 4 Redis 전환: cacheStore 구현체만 교체 |
| D19 | Semantic Cache 위치 | engine/semantic-cache.ts (E8 적용, agent-loop.ts 전용). getDB(companyId) E3 패턴 강제 |
| D20 | companyId 격리 | 모든 캐시 레이어 강제. Tool Cache 키: ${companyId}:${toolName}:${JSON.stringify(Object.entries(params).sort())}. saveToSemanticCache: CREDENTIAL_PATTERNS 내부 적용 (callee-side) |
| D21 | Tool Cache Redis 전환 | Deferred Phase 4+. withCache() API 유지, cacheStore 구현체만 교체 |

### 중요 보안 결정 (D20)
- Stop Hook은 LLM fullResponse를 sanitize하지 않음
- credential-scrubber = **PostToolUse** (도구 출력), tool-permission-guard = **PreToolUse** (도구 실행 허가)
- saveToSemanticCache **내부(callee)**에서 CREDENTIAL_PATTERNS 정규식 직접 적용 필수

## 다음 단계

- team-lead의 Architecture Addendum Section 2 지시 대기 (또는 Stage 3 UX Design 지시)
