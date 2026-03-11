# [Critic-A Review] step-06: Final Full Document Review

**Reviewed:** 2026-03-11
**File:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md` Lines 1-548 (전체)
**Cross-referenced:** steps 02~05 party logs, architecture.md, CLAUDE.md

---

## Review Scope (Writer 요청)

1. Section-to-section 일관성 (Executive Summary → Core Vision → Target Users → Success Metrics → MVP Scope)
2. 수치 일관성 (85% per hit, 70% 히트율, 60%→80% 실효, TTFT 85%, VECTOR 768)
3. 정책 일관성 (enableSemanticCache=false, SDK PoC, E8 경계)
4. 완성도 (누락 섹션 없는지)
5. Story 구현 준비도

---

## Agent Discussion (in character)

**John (PM):** "Executive Summary line 34를 보면 '월 $27+ 낭비 → 월 $5~8 수준으로 절감(100회/일, Soul 4,000 토큰 기준)'이라고 되어있다. 그런데 BO-1(line 256)을 보면 '$27/월 → $5~8/월 (Prompt Cache 단독) / $2~4/월 (3레이어 복합, 안정기)'로 두 시나리오가 명확히 분리돼 있다. Executive Summary는 '$5~8/월'만 제시하고 '3레이어 복합 $2~4/월' 목표가 없다. 의사결정권자가 Executive Summary만 읽으면 '3개 Story 다 구현해도 $5~8이 최선'이라고 이해한다. 3레이어 전체 구현의 비즈니스 케이스를 약화시키는 표현이다."

**Sally (UX):** "Story 구현 준비도 관점에서 MVP Done 표(lines 369)를 보면 'E8 경계 준수 | `engine-boundary-check.sh` 실행'이라고 되어있다. 그런데 이 스크립트가 현재 존재한다는 언급이 브리프 어디에도 없다. line 528에서도 '`engine-boundary-check.sh` 통과'를 Story 15.3 완료 조건으로 사용한다. 워커 에이전트가 Story 15.3을 구현하고 MVP Done 체크를 하려고 이 스크립트를 실행하면 'file not found'가 나온다. Done 기준이 존재하지 않는 도구를 참조하면, Done 기준은 의미가 없다."

**Mary (BA):** "Story 15.3 영향 패키지가 line 335에서 명확하게 'packages/server + packages/admin'이라고 나온다. `packages/admin`에 `enableSemanticCache` 토글 UI가 추가된다. 그런데 Technical Constraints(line 410-411)의 TypeScript 체크는 `packages/server/tsconfig.json`만 커버한다. MVP Done 표(line 363)도 'Story 15.1 빌드 통과 | `npx tsc --noEmit -p packages/server/tsconfig.json`'만 있다. `packages/admin`의 TypeScript 에러는 CI에서 잡히지 않는다. admin UI에서 타입 오류가 있어도 Story 15.3이 '빌드 통과'로 체크될 수 있다."

---

## Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | **HIGH** | Sally (UX) | **`engine-boundary-check.sh` 미정의 — MVP Done 기준 측정 불가** — Line 369 MVP Done: "E8 경계 준수 \| `engine-boundary-check.sh` 실행 \| `engine/semantic-cache.ts`가 engine/ 내부에만 존재". Line 528 구현 가이드에도 동일 참조. 브리프 전체 어디에도 이 스크립트의 내용, 존재 여부, 생성 책임자가 명시되지 않음. Story 15.3 워커가 Epic Done 체크 시 실행 불가. E8 경계 MVP Done 기준이 unmeasurable 상태. | Story 15.3 scope에 추가: "engine-boundary-check.sh 생성 (신규 파일): `#!/bin/bash / grep -r 'engine/semantic-cache' packages/server/src --include='*.ts' \| grep -v 'engine/agent-loop.ts' \| grep -v 'engine/semantic-cache.ts' && echo 'E8 VIOLATION' && exit 1 \|\| echo 'E8 OK'`". 또는 MVP Done 기준을 grep 명령어로 대체: "`grep -r 'engine/semantic-cache' --include='*.ts' \| grep -v 'engine/'` 결과 0건" |
| 2 | **HIGH** | Mary (BA) | **`packages/admin` TypeScript 검증 누락 — Story 15.3 admin UI 타입 오류 미탐지** — Line 335: Story 15.3 영향 패키지 명시: `packages/server` + `packages/admin`. Line 363 MVP Done: `npx tsc --noEmit -p packages/server/tsconfig.json`만 커버. `packages/admin`의 `enableSemanticCache` 토글 UI 타입 오류는 이 체크로 탐지 불가. CLAUDE.md `tsc` 체크도 server 전용. Story 15.3 admin 컴포넌트에 잘못된 prop 타입, missing import 등이 있어도 "빌드 통과"로 Story 완료 선언 가능. | MVP Done 표에 추가: "Story 15.3 Admin 빌드 통과 \| `npx tsc --noEmit -p packages/admin/tsconfig.json` \| 에러 0건". Story 15.3 구현 가이드 공통 주의사항(line 542)에: "`npx tsc --noEmit -p packages/admin/tsconfig.json` 에러 0건 (admin enableSemanticCache toggle UI 타입 검증)" 추가. |
| 3 | **MEDIUM** | John (PM) | **Executive Summary "$5~8/월" — 3레이어 복합 목표 누락으로 비즈니스 케이스 약화** — Line 34: "월 $27+ 낭비 → 월 $5~8 수준으로 절감(100회/일, Soul 4,000 토큰 기준)". BO-1(line 256)에는 "$27/월 → $5~8/월 (Prompt Cache 단독) / $2~4/월 (3레이어 복합, 안정기)"로 2단계 목표가 있다. Executive Summary는 3레이어 전체 구현 결과인 $2~4/월 목표를 보여주지 않는다. "Story 15.1만 해도 $5~8이네, 나머지 두 Story는 왜 해?"라는 의사결정권자의 오해 가능. 3개 Story 모두 구현해야 하는 비즈니스 근거가 Executive Summary에서 사라진다. | Line 34 수정: "월 $27+ 낭비 → **Prompt Cache(15.1) 단독: $5~8/월** / **3레이어 완전 적용 안정기: $2~4/월** (100회/일, Soul 4,000 토큰 기준, 30일+ 데이터 축적 후)" |
| 4 | **LOW** | Mary (BA) | **Phase 4 Redis 마이그레이션 인터페이스 안정성 — 구현 가이드에서 약속 미반영** — Line 382: "lib/tool-cache.ts 인터페이스(withCache API) 유지, 구현체만 교체". Line 496-507 구현 코드는 Map을 직접 사용하는 concrete 구현. 추상 캐시 어댑터 패턴 없음. Redis 전환 시 `withCache()` 호출부는 그대로이나, `lib/tool-cache.ts` 내부 Map 의존 코드는 Redis client 코드로 전면 교체 필요. "구현체만 교체" 약속이 현재 구현 가이드에 반영 안 됨 — Phase 4에서 예상보다 큰 리팩터링이 필요할 수 있음. | Story 15.2 구현 가이드(line 479+)에 주석 추가: "캐시 스토리지를 별도 객체(`cacheStore`)로 분리 권장 — Phase 4 Redis 전환 시 `cacheStore` 교체만으로 `withCache()` API 유지 가능. 예: `const cacheStore = { get(key), set(key, val, ttl), delete(key) }` 형태로 Map 래핑 후 구현." |

---

## Cross-Talk with Critic-B

**Critic-A → Critic-B (초기 요청):**
- `engine-boundary-check.sh` repo 존재 여부 확인 요청
- `packages/admin/tsconfig.json` 존재 여부 확인 요청

**Critic-B 추가 발견 (코드 직접 확인):**

**MEDIUM-1: Story 15.1 PoC 코드 AsyncIterator 오류**
Brief line 456: `const result = await query({...})` + `result.usage.cacheReadInputTokens`
`agent-loop.ts:52` 실제 패턴: `for await (const msg of query({...}))` — SDK는 AsyncIterator 반환.
`await query()` 후 `.usage` 직접 접근 불가. 워커가 PoC 코드 그대로 복사하면 런타임 오류.

**MEDIUM-2: ivfflat → hnsw (vector_cosine_ops) 불일치**
Brief line 329: "ivfflat 인덱스"
`0049_pgvector-extension.sql:10-11` 실제: `CREATE INDEX ... USING hnsw (embedding vector_cosine_ops)`
Epic 10은 HNSW + vector_cosine_ops. SQL 쿼리 `<=>` (cosine distance)가 인덱스 활용하려면 `vector_cosine_ops` 필수. ivfflat으로 생성 시 인덱스 타입 불일치 → 인덱스 미사용, 성능 저하.

**Critic-B Issue #1 코드 확인 결과 (engine-boundary-check.sh):**
`.github/scripts/engine-boundary-check.sh` 존재 확인. 현재 패턴: hooks/, soul-renderer, model-selector, sse-adapter. **`engine/semantic-cache` 체크 패턴 없음** → 스크립트는 존재하지만 semantic-cache E8 위반을 탐지 못함. Issue #1 → HIGH에서 **MEDIUM으로 하향**: 스크립트 신규 생성이 아니라 기존 스크립트에 1줄(`check_pattern "from.*engine/semantic-cache"`) 추가면 됨.

**Critic-B Issue #2 코드 확인 결과 (packages/admin tsconfig.json):**
`packages/admin/tsconfig.json` 존재 확인. `npx tsc --noEmit` 작동 가능. Issue #2 → HIGH에서 **LOW으로 하향**: 파일 존재, Done 기준 표에 명시만 추가하면 됨.

**Critic-B LOW 이슈 (Critic-A 동의):**
- LOW-B1: line 315 "agent-loop.ts 단 1곳" — engine/types.ts (RunAgentOptions + Stop Hook usage 타입)도 수정 필요
- LOW-B2/3: lib/tool-cache-config.ts 생성 scope + try/catch scope → 새 섹션(Implementation Notes)에서 이미 해소 확인

---

## Checklist Results

### 1. Section-to-Section 일관성

| 섹션 | 체크 항목 | 결과 |
|------|----------|------|
| Executive Summary → Core Vision | Problem Statement 수치($27/월) 일치 | ✅ |
| Executive Summary → Business Objectives | BO-1 "$5~8/월 (Prompt Cache 단독)" 반영 | ⚠️ Executive Summary에 3레이어 $2~4/월 누락 (Issue #3) |
| Core Vision (흐름도) → Target Users (User Journey) | enableSemanticCache 플래그 정책 일치 | ✅ |
| Target Users → Success Metrics | KPI 측정 방법과 Persona 성공 기준 일치 | ✅ |
| Success Metrics → MVP Scope | KPI-1~5 vs MVP Done 기준 매핑 | ✅ (단, KPI-1 PASS 조건 vs MVP Done "KPI-1 즉각 효과" PASS 조건 표현 차이 — 심각하지 않음) |
| MVP Scope → Technical Constraints | 의존성 다이어그램 vs 아키텍처 제약 일치 | ✅ |
| Technical Constraints → Implementation Notes | E8, E3, companyId 정책 일치 | ✅ |

### 2. 수치 일관성

| 수치 | 등장 위치 | 결과 |
|------|----------|------|
| 85% per hit | lines 30, 70, 103, 128, 183, 205, 240, 246, 284, 319 | ✅ 전체 일관 |
| TTFT 85% 단축 | lines 70, 103, 183, 246, 319 | ✅ |
| 70% 히트율 (세션 기준) | lines 241, 285 | ✅ |
| 60% (1주) → 80% (30일) 실효 절감 | lines 34, 242, 285 | ✅ |
| VECTOR(768) | line 330, line 433 | ✅ |
| 100회/일 = 에이전트 1명 기준 추정값 | lines 46, 50-52, 255 | ✅ |
| MAX 10,000 + LRU + 1분 cleanup | lines 31, 106, 136, 271, 322, 366 | ✅ |
| cosine similarity 0.95 | lines 32, 332, 443, 519, 534 | ✅ |

### 3. 정책 일관성

| 정책 | 등장 위치 | 결과 |
|------|----------|------|
| enableSemanticCache=false (기본값, opt-in) | lines 32, 98-100, 117-122, 172, 185, 195, 330, 334, 534 | ✅ 전체 일관 |
| SDK PoC 전제조건 | lines 30, 128, 193, 316, 453 | ✅ |
| E8 경계 (engine/ 내부만) | lines 130, 137, 192, 332, 528 | ✅ (단, check.sh 미정의 — Issue #1) |
| companyId 격리 필수 | lines 138, 270, 325, 409, 520, 544 | ✅ |
| graceful fallback (캐시 예외 시) | lines 184, 248, 267, 333, 352, 496-507 | ✅ |
| stale-on-error 미설계 명시 | lines 184, 333, 352 | ✅ |

### 4. 완성도

- Executive Summary ✅
- Core Vision (Problem + Solution + Differentiators) ✅
- Target Users (Personas 1-4 + User Journeys) ✅
- Success Metrics (KPI 1-5 + Business Objectives) ✅
- MVP Scope (Core Features + Out of Scope + Done Criteria + Future Vision) ✅
- Technical Constraints & Dependencies ✅
- Implementation Notes (Story별 구현 가이드 + 코드 예시) ✅
- **누락 없음** — 전체 7개 섹션 완비

### 5. Story 구현 준비도

| Story | 준비도 | 미비점 |
|-------|--------|--------|
| 15.1 | ✅ 높음 | PoC 검증 방법 코드 예시까지 제공. Stop Hook 타입 확장 코드 명시. |
| 15.2 | ✅ 높음 | TTL 등록 테이블 코드 + 예외 처리 패턴 제공. lib/tool-cache-config.ts 신규 파일 명시. |
| 15.3 | ⚠️ 중간 | db/scoped-query.ts 확장 시그니처 제공. SQL 쿼리 예시 제공. **단, engine-boundary-check.sh 미정의(Issue #1), packages/admin tsc 체크 누락(Issue #2).** |

---

## v1-feature-spec Coverage Check (Final Pass)

| v1 기능 | Epic 15 커버리지 | 결과 |
|---------|---------------|------|
| 125+ 도구 시스템 | 7개 대표 도구 + 기본 정책(미래퍼=캐시없음) + lib/tool-cache-config.ts 등록 방식 | ✅ |
| Soul 시스템 (웹 UI 편집) | Story 15.1 대상 "모든 에이전트 Soul". Soul 변경 시 5분 TTL 자연 만료 정책 | ✅ |
| `/전체` 동시 6-에이전트 | Tool Cache 동일 파라미터 캐시 공유, 동시 6에이전트 → kr_stock 1회만 호출 | ✅ |
| CEO 직접 명령 패턴 | Phase 5 "캐시 히트 품질 자동화" + Phase 6 "비용 예측 대시보드"로 커버 | ✅ |
| get_current_time, generate_image (TTL=0) | Story 15.2 Core Features에 TTL=0 명시, 기본 정책 테이블에도 포함 | ✅ |

---

## Verification Results (Post-Fix)

| Issue | Status | Notes |
|-------|--------|-------|
| [MEDIUM] engine-boundary-check.sh 패턴 미등록 | ✅ RESOLVED | Line 369: grep 명령어 직접 실행으로 대체. line 547-554: bash 스니펫 명시 |
| [LOW] packages/admin TSC 체크 미명시 | ✅ RESOLVED | Line 370: Admin 빌드 통과 행 추가. Line 570: 공통 주의사항에 양쪽 tsc 필수 명시 |
| [MEDIUM] Executive Summary $5~8/월 3레이어 목표 누락 | ✅ RESOLVED | Line 34: "단독: $5~8/월 / 3레이어 안정기: $2~4/월" 분리 표기 |
| [LOW] Phase 4 Redis 인터페이스 안정성 | ✅ RESOLVED | Line 507-508: cacheStore 어댑터 패턴 주석 추가 |
| [MEDIUM] PoC 코드 AsyncIterator 오류 | ✅ RESOLVED | Lines 459-474: for await 패턴 + event.usage.cacheReadInputTokens 수집 방법 명시 |
| [MEDIUM] ivfflat → hnsw 불일치 | ✅ RESOLVED | Line 330: hnsw (vector_cosine_ops) + lines 540-545: 인덱스 생성 SQL 스니펫 추가 |
| [LOW] "단 1곳" → types.ts 포함 | ✅ RESOLVED | Line 315: "수정 파일 2개: agent-loop.ts + engine/types.ts" |
| [LOW] cache.set() 누락 | ✅ RESOLVED | Line 517: cache.set(key, { data: result, expiresAt }) + return result 추가 |

**Fix 9 추가 검증 (Writer 보충 수정):**
- Story 15.3 scope line 336: `check_pattern "from.*engine/semantic-cache"` 스크립트 업데이트 명시 ✅
- MVP Done line 370: engine-boundary-check.sh 실행으로 복원 ✅
- line 548 헤딩 "불필요" → "패턴 추가 후 실행, 또는 grep 직접 실행"으로 Critic-A 직접 정정 ✅

**잔여 관찰 사항:** 없음. 모든 이슈 해소.

---

**최종 이슈 등급 (Critic-B 코드 확인 반영 후):**

| # | 심각도 (최종) | 내용 |
|---|-------------|------|
| 1 | MEDIUM (하향: HIGH→MEDIUM) | engine-boundary-check.sh semantic-cache 패턴 미등록 |
| 2 | LOW (하향: HIGH→LOW) | packages/admin TSC 체크 Done 기준 미명시 |
| 3 | MEDIUM | Executive Summary $5~8/월 — 3레이어 복합 목표 누락 |
| 4 | LOW | Phase 4 Redis 인터페이스 안정성 |
| 5 | MEDIUM | Story 15.1 PoC 코드 AsyncIterator 오류 |
| 6 | MEDIUM | ivfflat → hnsw (vector_cosine_ops) 불일치 |
| 7 | LOW | line 315 "agent-loop.ts 단 1곳" — types.ts 수정 포함 |

**Pre-fix Score: 8.5/10**
- HIGH 이슈 없음 (코드 확인 후 전부 MEDIUM/LOW로 정정)
- MEDIUM×4, LOW×3
- -1.5점: MEDIUM 4건 (코드 오류 2건 직결 이슈 포함)
- 수정 후 예상: 9.5/10
