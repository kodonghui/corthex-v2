# CRITIC-A Review: PRD Addendum Section 1 (FR-CACHE-1~3)

**Reviewer:** CRITIC-A (John/PM, Sally/UX, Mary/BA)
**File reviewed:** `_bmad-output/planning-artifacts/epic-15-prd-addendum.md` lines 1–188
**Reference:** `epic-15-caching-brief.md`, `prd.md` FR1~FR70+ section
**Date:** 2026-03-12

---

## Issue 1 (John/PM): FR 포맷이 기존 PRD와 전면 불일치 — 병합 불가 상태

기존 `prd.md`의 FR 섹션은 `- FR40: [Phase 1] 에이전트가 비허용 도구를 호출하면 차단된다` 형식의 **단일 불릿, 한 문장** 구조다. Addendum의 FR은 `#### FR-CACHE-1:` 헤더에 코드 블록·테이블·7개 하위 항목(FR-CACHE-1.1~1.7)이 달린 헤비급 구조로 완전히 다르다. 이 상태로는 기존 PRD의 "Functional Requirements" 섹션에 병합했을 때 문서 구조가 파괴되며, "UX 디자이너·아키텍트·Epic 분할 전부 이 목록만 참조한다"는 PRD 계약서 역할을 수행할 수 없다. **기존 PRD와 동일한 단일-불릿 형식으로 리팩터링 필요**: 코드 블록/테이블은 구현 가이드(Addendum Appendix 또는 Story 파일)로 이동하고, 각 하위 요구사항은 독립 불릿(FR-CACHE-1-a, FR-CACHE-1-b 등)으로 분리해야 한다.

---

## Issue 2 (Mary/BA): FR-CACHE-3.11 — 에이전트 간 캐시 공유 결정이 비즈니스 리스크 미검토

FR-CACHE-3.11은 동일 `companyId` 내 모든 에이전트가 Semantic Cache를 공유한다고 명시한다("의도적 설계"). 그러나 에이전트 A(법무팀)가 "출장비 규정이 어떻게 돼?"에 답변한 내용이 에이전트 B(인사팀)의 동일 질문에 그대로 반환될 수 있고, 두 에이전트의 Soul 차이나 지식 베이스 차이가 반영되지 않는다. FAQ 에이전트가 아닌 전문 에이전트에 `enableSemanticCache=true`를 설정했을 때 이 공유 정책이 잘못된 응답을 캐싱하여 재사용하는 위험이 있다. **수용 기준 부재**: "agent_id 없음은 의도적 설계"라고만 서술했을 뿐, "어떤 에이전트에서 저장된 캐시도 동일 회사 모든 에이전트에게 노출될 수 있음을 Admin이 인지하고 설정해야 한다"는 요건이나 Admin UI 경고 문구가 없다.

---

## Issue 3 (Sally/UX): FR-CACHE-3.3 Admin 토글 — 토글 OFF 시 기존 캐시 데이터 처리 UX 미정의

FR-CACHE-3.3은 "`enableSemanticCache` on/off 토글을 추가한다"고만 명시하고, 토글을 OFF로 전환했을 때 이미 DB에 저장된 `semantic_cache` 레코드를 어떻게 처리하는지 정의하지 않는다. Admin이 토글을 껐는데 다음 쿼리에서 여전히 기존 캐시가 히트될 수 있고("어? 껐는데 왜 캐시 응답이 나오지?"), 또는 해당 에이전트의 기존 캐시를 즉시 삭제해야 하는데 그 동작이 서버/DB에 구현되지 않을 수 있다. **FR에 명시 필요**: 토글 OFF 시 해당 에이전트(`agentId` 기준이 아니라 `companyId` 기준 공유이므로 더 복잡) 캐시 처리 정책(a. 기존 캐시 유지·TTL 자연만료 대기 b. 즉시 삭제 c. 신규 저장만 중단) 중 하나를 명시해야 한다.

---

## Issue 4 (John/PM): 누락된 FR — Knowledge Base 업데이트 시 Semantic Cache 무효화 정책

Brief와 architecture.md에서 Epic 10(지식 관리, pgvector)이 에이전트 응답의 핵심 컨텍스트임을 강조한다. Admin이 에이전트의 Library(지식 베이스)를 업데이트하면, 이전 질문-응답 쌍을 캐싱한 `semantic_cache` 항목이 이제 구 지식에 기반한 오답이 될 수 있다. FR-CACHE-1.6(Soul 편집 → Prompt Cache 5분 내 자연만료)는 있지만, **"Library(지식 베이스) 업데이트 → Semantic Cache 무효화"에 대한 FR이 전혀 없다**. 이는 단순 누락이 아니라 응답 품질 무결성(BO-3) 위협이다. MVP에서 "지식 업데이트 시에도 최대 24시간 구버전 응답 캐시 허용"을 명시적으로 결정하든, 무효화 트리거를 추가하든 — 어느 쪽이든 FR에 명시되어야 한다.

---

## Issue 5 (Mary/BA): FR-CACHE-2.8 — 엔지니어링 구현 세부사항이 PRD FR에 포함

FR-CACHE-2.8은 "Phase 4 Redis 전환을 대비하여 `cacheStore = { get, set, delete }` 인터페이스를 별도 객체로 분리한다"고 요구한다. 이는 현재 사용자에게 가시적인 기능이 아니라 **미래 엔지니어링 리팩터링 용이성**을 위한 구현 패턴이다. PRD FR은 "제품의 기능 계약서"(prd.md 서문 인용)여야 하며, 구현 방식 강제는 Architecture 문서나 Story 파일의 몫이다. `cacheStore` 인터페이스 분리는 architecture.md D13 업데이트 항목 또는 Story 15.2 구현 노트로 이동해야 한다.

---

## 요약 (5개 이슈)

| # | 역할 | 심각도 | 이슈 |
|---|------|--------|------|
| 1 | John/PM | **CRITICAL** | FR 포맷이 prd.md FR1~FR70과 전면 불일치 — 병합 불가 |
| 2 | Mary/BA | **HIGH** | FR-CACHE-3.11 에이전트 간 캐시 공유 비즈니스 리스크 미검토 |
| 3 | Sally/UX | **HIGH** | FR-CACHE-3.3 토글 OFF 시 기존 캐시 처리 UX 미정의 |
| 4 | John/PM | **HIGH** | Library 업데이트 → Semantic Cache 무효화 정책 FR 누락 |
| 5 | Mary/BA | **MEDIUM** | FR-CACHE-2.8 구현 패턴 강제가 PRD FR에 포함(범위 초과) |
