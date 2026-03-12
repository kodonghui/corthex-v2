# Context Snapshot: Epic 15 UX Design — Section 1 Complete

**날짜**: 2026-03-12
**작업**: Stage 3 UX Design — Section 1: Caching UX Elements
**상태**: 승인 완료 (critic-a 10/10, critic-b 9.5/10, 평균 9.75)

## 완료된 내용

**출력 파일**: `_bmad-output/planning-artifacts/epic-15-ux-design.md`

## 핵심 UX 결정 요약

### Admin — enableSemanticCache 토글
- **위치**: AgentEditForm → 캐싱 설정 섹션 (Soul 아래, 도구 권한 위)
- **컴포넌트**: shadcn/ui `<Switch>`, w-11 h-6, ON: bg-indigo-500, OFF: bg-slate-600
- **기본값**: OFF (DEFAULT FALSE)
- **ON→OFF**: 확인 모달 ("각 응답의 저장 시점부터 24시간이 지나면 자동 만료")
- **OFF→ON**: 즉시 전환
- **권장 표시**: TTL=0 → ✗(rose), TTL ≤ 900,000ms → ⚠(amber), 나머지 → ✓(emerald)
- **우선순위**: ✗ > ⚠ > ✓
- **자동 감지 범위 외**: 오케스트레이터, Library 즉각 반영 에이전트 → 수동 OFF 안내

### Hub UX
- **Semantic Cache 히트**: ≤ 100ms 즉시 응답, 이주임에게 별도 표시 없음
- **스피너**: setTimeout(showSpinner, 300) — base ux-design-spec 오버라이드 (원래: accepted 즉시 표시)
  - Story 15.3 완료 후 ux-design-specification.md Hub 로딩 섹션 업데이트 필요
- **"이전 유사 질문" 안내**: MVP 미표시 (이주임 불안감 > 투명성 이점)
- **Edge Case 2**: 이주임이 에이전트에게 직접 질문 시 → 에이전트 캐시 메타데이터 미수신(Epic 15 범위 외), "모른다" 응답

### Error UX (이주임 완전 비가시)
- Semantic Cache 오류 → LLM 직접 호출 (NFR-CACHE-R2)
- Tool Cache 오류 → withCache() graceful fallback → 원본 함수 실행 (NFR-CACHE-R1)
- 3-레이어 비활성 → Epic 15 이전 동작과 동일 (NFR-CACHE-R3)

### Deferred
- Cache Hit Badge (⚡): Phase 5+ (SSE cacheHit/similarity 필드 미전송)
- Cost Dashboard: Phase 5+ (Phase 1~3 서버 로그만, FR-CACHE-1.5)

## 다음 단계

- team-lead의 Stage 4 (Epics & Stories) 지시 대기
