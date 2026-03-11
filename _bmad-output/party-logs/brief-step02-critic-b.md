## [Critic-B Review] Step-02: Executive Summary + Core Vision

**File reviewed:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md` lines 24–125
**References checked:** architecture.md (D1~D16, E1~E10), prd.md (NFRs), `_research/tool-reports/05-caching-strategy.md`

---

### Agent Discussion (in character, cross-talking)

**Winston (Architect):**
The brief states Story 15.1 is a "1줄 변경" to `engine/agent-loop.ts` adding `cache_control: { type: 'ephemeral' }`, but the research report §2.4 explicitly flags that the Claude Agent SDK's `query()` function may apply automatic caching internally — and crucially, says "PoC에서 확인 필요 (SDK 버전에 따라 다를 수 있음)." The brief treats this as a solved problem and presents it as a single-line change, but if `query()` doesn't accept systemPrompt as an array of blocks with `cache_control`, Story 15.1 could require a deeper SDK integration workaround. This is a critical architectural uncertainty that the brief glosses over. I want failure mode analysis: what happens at the architecture level if the SDK doesn't support this pattern?

**Amelia (Dev):**
`lib/tool-cache.ts` placement is ambiguous. E8 says `engine/` public API = only `agent-loop.ts` + `types.ts`. If `lib/tool-cache.ts` lives in `lib/`, that's fine, but the Tool Cache key is `${companyId}:${toolName}:${JSON.stringify(params)}` — no cache size limit, no eviction policy. The 125+ tools listed in `architecture.md` could cache unbounded data. I see no `MAX_CACHE_SIZE` or LRU eviction mentioned anywhere in the brief or research. This is a memory leak waiting to happen in production.

**Quinn (QA):**
Three concrete breakage scenarios the brief doesn't address: (1) Soul is updated mid-session — Prompt Cache TTL is 5 minutes. If admin edits an agent's Soul while a user session is active, the next 4+ minutes will use the stale cached Soul. The brief doesn't mention cache invalidation on Soul update. (2) The flow diagram shows Semantic Cache checked universally FIRST, but `kr_stock` results (주가) change every minute — a 1-hour semantically cached "삼성전자 주가" response would return stale prices. The research §3.2 explicitly lists "실시간 데이터 (주가, 뉴스)" as UNSUITABLE for semantic caching, but the brief's flow diagram applies it universally without the per-agent `enableSemanticCache` flag the research recommends. (3) What happens when `JSON.stringify(params)` fails (circular reference, BigInt)? Tool Cache key generation would throw and crash the tool handler.

**Winston (Architect) rebuttal:**
Quinn, your point about the universal Semantic Cache application is the most architecturally dangerous issue I see. The brief's flow diagram (lines 92–106) shows Semantic Cache applied to ALL queries, which directly contradicts the research report §3.2's "부적합" column (실시간 데이터). This isn't just a UX issue — it would return wrong stock prices to users. The per-agent `enableSemanticCache: boolean` flag from the research (§3.5) is completely absent from the brief's proposed architecture.

**Bob (SM):**
Sprint scope check — Story 15.1 is listed as "1줄, 매우 낮음" but if the SDK PoC verification (research §2.4 explicitly flagged as unverified) fails, 15.1 becomes a medium-complexity story requiring direct `anthropic.messages.create` calls or SDK patches. This is an undiscovered dependency that should be listed as a prerequisite PoC task, not buried in the research report. Also, the brief doesn't give story point estimates or sprint capacity — "3 stories" with only difficulty labels is insufficient for delivery planning. Bob demands sprint velocity numbers.

**Amelia rebuttal to Bob:**
Also — the implementation table says 15.2 Tool Result Caching requires "신규 파일 1개 + 래퍼 적용." But "래퍼 적용" means touching 125+ existing tool handler files to wrap with `withCache()`. That's not a trivial scope addition — it should say "신규 파일 1개 + 최대 125개 도구 핸들러 수정" to be honest about effort.

---

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|---------|-----------|-------|------------|
| 1 | **CRITICAL** | Winston, Quinn | Semantic Cache 범용 적용 문제: 흐름도(lines 92–106)가 per-agent `enableSemanticCache` 플래그 없이 모든 쿼리에 Semantic Cache를 적용함. 연구보고서 §3.2는 주가/뉴스/실시간 데이터를 "부적합"으로 명시. 배포 시 kr_stock 에이전트가 1시간 된 주가를 반환하는 심각한 기능 오류 발생. | 흐름도에 "에이전트별 enableSemanticCache 플래그 기반 조건부 적용" 명시. 실시간 데이터 에이전트(주가, 뉴스)는 Semantic Cache 제외 규칙 추가. |
| 2 | **HIGH** | Winston | SDK cache_control 호환성 미검증: 연구보고서 §2.4 방법B가 "SDK query() 내부 자동 캐싱 — PoC에서 확인 필요"라고 명시했음에도 Brief는 이를 검증된 "1줄 변경"으로 단정함. SDK 0.2.72가 systemPrompt를 배열 형식으로 받지 않으면 Story 15.1 전체 구현 전략이 무너짐. | "**전제조건: SDK cache_control 호환성 PoC 검증 (Story 15.0 또는 15.1 준비 작업)**" 항목 추가. 실패 시 대안(방법A: anthropic.messages.create 직접 호출) 명시. |
| 3 | **HIGH** | Quinn | Tool Cache 메모리 상한 미정의: 인메모리 Map에 최대 크기, LRU 교체 정책, 최대 항목 수가 명시되지 않음. 연구보고서 §7 테스트 케이스가 "메모리 누수 확인 (10,000건 이상)"을 요구하지만 Brief는 이 위험을 전혀 언급하지 않음. 24GB 서버지만 무한 캐시 누적은 OOM 위험. | Tool Cache 설계에 MAX_CACHE_SIZE (예: 10,000 항목) + LRU 교체 정책 명시. 또는 TTL 만료 항목 자동 정리 주기 명시. |
| 4 | **MEDIUM** | Amelia | 15.2 구현 범위 과소 기재: "신규 파일 1개 + 래퍼 적용"은 125개+ 도구 핸들러 수정을 은폐함. 실제로는 모든 캐시 대상 도구에 `withCache()` 적용이 필요하며, TTL 값도 도구별 결정이 필요함 (연구보고서 §4.2 표 참조). 스프린트 계획 시 심각한 과소 추정 위험. | "변경 규모" 셀을 "신규 파일 1개 (lib/tool-cache.ts) + 캐시 대상 도구 핸들러 N개 수정 (TTL 설정 포함)"으로 수정. |
| 5 | **MEDIUM** | Quinn | Soul 업데이트 시 Prompt Cache 무효화 시나리오 미처리: 어드민이 에이전트 Soul을 편집하면 다음 5분간 구버전 Soul로 응답이 계속됨. 이 동작이 의도된 것인지, 혹은 즉시 무효화가 필요한지 명시해야 함. | Core Vision에 "Soul 수정 시 캐시 무효화 정책: 5분 TTL 자연 만료 허용 (허용) 또는 즉시 무효화 API 필요 (미결정)" 항목 추가. |
| 6 | **LOW** | Bob | 스토리 점수/예상 시간 부재: 난이도(낮음/중간) 표현만 있고, 스프린트 배정을 위한 story point 또는 시간 추정이 없음. 팀 속도(velocity)와 연결 불가. | 구현 난이도 테이블에 "예상 소요 (일)" 컬럼 추가. (15.1: 0.5일, 15.2: 2일, 15.3: 3일 수준으로) |

---

### Architecture Consistency Check

**Checked against: architecture.md decisions D1–D16, patterns E1–E10**

| 항목 | 상태 | 상세 |
|------|------|------|
| D1 (getDB 패턴) | ✅ 준수 | Tool Cache 키에 companyId 포함, Semantic Cache에 getDB(ctx.companyId) 사용 명시됨 |
| D6 (단일 진입점 agent-loop.ts) | ✅ 준수 | 모든 캐싱 레이어가 agent-loop.ts 통과 설계 |
| D8 (캐싱 없음 결정) | ✅ 논거 충분 | D8 = DB 쿼리 캐싱 기준임을 명확히 구분하고 Claude API 캐싱은 범위 외임을 설명 |
| D13 (캐싱 전략 Phase 5+ Deferred) | ⚠️ 충돌 | D13이 "캐싱 전략 Phase 5+ 재검토"로 지연됐는데, Epic 15는 이를 앞당겨 구현. Brief에 D13 업데이트 필요 ("D13 → Epic 15로 조기 구현") |
| E8 (engine/ 경계) | ⚠️ 모호 | lib/tool-cache.ts 위치가 engine/ 밖 lib/인지 engine/ 내부인지 불명확. E8 경계에서 어디에 위치해야 하는지 명시 필요 |
| E1 (SessionContext 불변) | ✅ 명시 | Key에 companyId 사용, ctx.companyId 패턴 준수 |

**Contradictions found:**
1. D13 ("캐싱 전략 Phase 5+ Deferred") — Epic 15가 이를 Phase 1~3으로 앞당기므로 architecture.md D13 업데이트가 delivery prerequisite임. Brief에 이 사실 언급 없음.
2. `lib/tool-cache.ts`의 정확한 디렉토리 위치가 architecture.md 프로젝트 구조와 불일치. architecture.md의 lib/는 `error-codes.ts` 같은 유틸리티가 있지만, tool-cache.ts가 캐싱 engine 내부 연산인지 일반 lib인지 E8 경계 기준으로 결정 필요.

---

---

### Cross-talk Outcome (Critic-A 응답 반영)

**Critic-A의 리뷰 요약 (비즈니스/UX/BA 관점):**
- Issue A1 (HIGH): Semantic Cache Staleness UX — 재무팀 사용자가 58분 된 주가를 신뢰하고 실제 거래 결정에 사용하는 UX 위험. "캐시 배지 + 타임스탬프 없음"
- Issue A2 (HIGH): "100회/일" 기준 미정의 — 에이전트 1명당인지 전체 플랫폼인지 불명확. 재무 예측값이 50배 달라짐
- Issue A3 (MEDIUM): 레이어 번호 불일치 — 연구보고서 vs 브리프 vs 런타임 실행 순서 3가지가 다 다름
- Issue A4 (LOW): 60~80% 절감 수치에 사용된 캐시 히트율 가정 미공개

**Critic-A의 질문 (내 답변):**
> "Semantic Cache for financial data — full '적합/부적합' table이 Vision 섹션에 필요한가, 아니면 연구보고서 참조로 충분한가?"

**내 답변:** **반드시 Vision 섹션에 Full Table이 필요합니다.** 이유:
1. 연구보고서는 배경 참고 문서이지 브리프를 대체하지 않음. Story 15.3 개발자는 브리프를 보고 구현하지 연구보고서를 다시 읽지 않음
2. 기술 관점(Winston): per-agent `enableSemanticCache` 플래그 없이 구현하면 코드 레벨에서 kr_stock/search_news에 Semantic Cache가 적용될 가능성 100%. 방어선은 "문서에 명시된 제약 조건"밖에 없음
3. 결론: Semantic Cache 이슈는 **CRITICAL 수준 유지** (내 Issue #1) — Critic-A도 HIGH로 동의함. 두 비평가 모두 이 이슈를 독립적으로 발견했으므로 Writer는 반드시 수정해야 함

**합의된 통합 우선순위 (두 Critic 합산):**
1. Semantic Cache 범용 적용 제거 + 적합/부적합 표 추가 (CRITICAL/HIGH — 양쪽 공통)
2. "100회/일" 기준 명시 (HIGH — Critic-A 발견)
3. SDK cache_control PoC 필요성 명시 (HIGH — Critic-B 발견)
4. Tool Cache 메모리 상한 정의 (HIGH — Critic-B 발견)
