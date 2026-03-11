## [Critic-B Review] Step-03: Target Users + Personas

**File reviewed:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md` lines 145–223
**References checked:** architecture.md (D1~D16, E1~E10), prd.md (NFRs), `_research/tool-reports/05-caching-strategy.md`

---

### Agent Discussion (in character, cross-talking)

**Winston (Architect):**
Persona 3 (AI 에이전트 자체) mentions "외부 API 장애 시 만료되지 않은 캐시가 fallback으로 작동 가능 (단, 오래된 데이터 반환 위험 명시 필요)" — but this is an architectural decision that doesn't exist anywhere in architecture.md, research report, or step-02. The Tool Cache design as written uses TTL expiry: when TTL expires, the cache entry is gone. Serving *expired* cache as an error fallback requires a separate "stale-while-revalidate" or "stale-on-error" design. kr_stock TTL is 1 minute; if the API is down for 2 minutes, the cache is already expired and there's nothing to fall back to. This feature is being invented in a User Personas section without any scoping, implementation design, or story assignment. Either remove it or create a formal design decision for it.

**Amelia (Dev):**
`_bmad-output/planning-artifacts/epic-15-caching-brief.md:217–223`. Developer journey covers Story 15.1 only. Stories 15.2 and 15.3 have zero developer journey coverage. Wrapping 7+ tool handlers in `withCache()` with per-tool TTL configuration, and building the DB migration + `engine/semantic-cache.ts` are non-trivial developer tasks. Where are those journeys? Also: 김운영's success metric "CORTHEX admin 로그에서 Tool Cache 히트율 ≥ 40% 확인" assumes an admin-visible cache hit rate log exists — but `lib/tool-cache.ts` as designed in the research (§4.3) has no logging output. Who implements this observability feature? Which story?

**Quinn (QA):**
이주임's success criteria says "Hub UI에 ⚡ 배지 표시 없어도 체감 속도로 캐싱 인지" — this is an explicit decision to skip cache transparency UI. But we fought hard in step-02 to add `enableSemanticCache` per-agent protection for real-time data. Now the persona is saying "users don't need to know a response is cached." For non-financial agents (FAQ, policy), Semantic Cache TTL is 1 hour. A user asking "우리 회사 휴가 정책이 뭐야?" at 09:00 and again at 10:45 gets a cached answer from 09:00. If the policy was updated at 10:30, they get wrong information with no visual cue. The ⚡ badge decision needs justification, not silent omission. And what happens when Tool Cache is *expired* AND the external API is down? Step through that scenario: no cache, API error → what does the user see?

**Bob (SM):**
김운영's success metrics create implicit scope additions: "admin 로그에서 Tool Cache 히트율 ≥ 40% 확인" and "`cost_tracker` Hook 로그 조회" both require logging/observability infrastructure not scoped in any story. If this is a persona goal, it must map to a story task or it becomes a "feature that works but can't be measured" — which is a delivery risk. Also, developer journey has 3 steps for Story 15.1 but zero for 15.2 and 15.3. This creates an incomplete picture of implementation effort for sprint planning.

**Winston (cross-talk with Amelia):**
Amelia, the stale-on-error fallback issue is the most dangerous thing here. If a developer reads this persona section and implements "serve stale cache on API error" based on Persona 3's description, they've introduced a behavior that wasn't designed, wasn't tested, and could silently serve wrong data. I'd escalate this to HIGH — it's an accidental feature specification in a persona description.

**Quinn (cross-talk with Bob):**
Bob, the admin logging gap isn't just a scope issue — it's a testability issue too. If there's no logging, the TEA test cases for Tool Cache can't verify hit rate in production. Bun:test can unit-test hit/miss logic, but the "≥ 40% hit rate" SLA from the persona has no measurable signal in production. Either the persona success criterion needs to change ("Tool Cache 히트 로그 있어야 ≥ 40% 확인 가능") or Story 15.2 scope must explicitly include `log.info({ event: 'tool_cache_hit', toolName, key })` instrumentation.

---

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | **HIGH** | Winston, Quinn | **Stale-on-error fallback 미설계 아키텍처 결정** (Persona 3, line 184): "외부 API 장애 시 만료되지 않은 캐시 fallback" — 이 동작은 architecture.md, research report, step-02 어디에도 존재하지 않음. kr_stock TTL=1분이면 API 장애 2분 후 캐시 자체가 없음. 설계 없이 페르소나 설명에서 암묵적 기능이 생성됨. | Persona 3에서 "외부 API 장애 시 fallback" 문장 제거. 또는 별도 아키텍처 결정 항목으로 격상하고 스토리에 명시적 scope 추가. |
| 2 | **HIGH** | Quinn | **⚡ 캐시 배지 없음 결정의 정당성 부재** (line 175): "Hub UI에 ⚡ 배지 표시 없어도 체감 속도로 캐싱 인지" — 비실시간 에이전트의 Semantic Cache TTL은 1시간. 정책 문서가 업데이트된 후 1시간 내 질문한 사용자는 구버전 답변을 받음. "빠른 게 느껴지면 됐다"는 기준은 step-02에서 확립한 스테일 데이터 투명성 원칙과 충돌. | 이주임 성공 기준에 "캐시 배지 표시 여부는 UX 설계 단계에서 결정 예정 (기본: 캐시 히트 시 응답 하단 '⚡ 캐시된 응답' 표시 + 타임스탬프 옵션 검토)" 항목으로 수정. |
| 3 | **MEDIUM** | Amelia, Bob | **Tool Cache 히트율 관측 가능성 미스코프** (line 159, 205): 김운영의 성공 기준 "admin 로그에서 Tool Cache 히트율 ≥ 40% 확인", 이주임 여정 "cost_tracker Hook 로그 조회" — 현재 `lib/tool-cache.ts` 설계에 로깅 출력 없음 (research §4.3 코드 예시 참조). 이 관측 기능이 없으면 성공 기준 자체가 측정 불가. | 김운영 성공 기준에 "(Story 15.2 scope: `log.info({ event: 'tool_cache_hit', toolName, companyId })` 로깅 포함)" 명시. 또는 성공 기준을 "Tool Cache 히트율 측정 인프라 구축 후 ≥ 40% 달성"으로 조건부 수정. |
| 4 | **MEDIUM** | Amelia, Bob | **개발자 여정이 Story 15.1만 커버** (lines 217–223): Story 15.2 (`withCache()` 래퍼 적용, TTL 설정 7개 도구), Story 15.3 (DB 마이그레이션, `engine/semantic-cache.ts` 구현) 개발자 여정 없음. 구현 복잡도 2~3배 높은 스토리의 개발자 경험이 공백. | Story 15.2 개발자 여정 추가 (withCache 래퍼 적용 → TTL 테스트 → 메모리 상한 검증). Story 15.3 여정 추가 (DB 마이그레이션 → semantic-cache.ts 구현 → 임계값 튜닝). |

---

### Architecture Consistency Check

**Checked against: architecture.md decisions D1–D16, patterns E1–E10**

| 항목 | 상태 | 상세 |
|------|------|------|
| D1 (getDB 패턴) | ✅ 준수 | Persona 4: "engine/semantic-cache.ts가 getDB(companyId) 패턴을 따라야" 명시됨 |
| D6 (단일 진입점) | ✅ 준수 | 개발자 여정이 agent-loop.ts 중심 구현 흐름 반영 |
| E8 (engine/ 경계) | ✅ 준수 | lib/tool-cache.ts가 engine/ 밖, semantic-cache.ts가 engine/ 내부임을 인지한 설계 |
| E9 (SDK 모킹 표준) | ⚠️ 누락 | 개발자 여정 "검증" 단계가 실제 API 호출 기반 (`cache_read_input_tokens` 확인)인데, 이것이 E9 SDK 모킹 테스트인지 실제 SDK 통합 테스트인지 불명확. D10 테스트 전략과 연결 필요. |
| D10 (테스트 전략) | ⚠️ 미연결 | 개발자 여정 검증 단계가 "동일 에이전트 연속 2회 호출 → cache_read_input_tokens 확인"인데, 이게 매 커밋 CI 테스트인지 주1회 실제 SDK 테스트인지 구분 없음. |

**Contradictions found:**
1. Persona 3의 "stale-on-error fallback" — architecture.md 어디에도 없는 신규 동작. 설계 없는 기능 명세.
2. 개발자 여정의 `cache_read_input_tokens` 검증 방법이 D10(매 커밋 모킹 vs 주1회 실제 SDK)과 연결되지 않음.

---

### Cross-talk Outcome (Critic-A 응답 반영)

**Critic-A 발견 (추가 이슈):**
- **[CRITICAL]** 이주임 여정 (lines 172-174, 212-213)이 "삼성전자 주가" 쿼리를 Semantic Cache 저장/히트 예시로 사용 — step-02에서 CRITICAL 수정한 정책(`enableSemanticCache=false` for 주가/뉴스)에 정면 위반. Writer가 step-02 수정 내용을 step-03 작성 시 반영하지 않은 것.
- **[HIGH]** TTL 수학 오류: 10:00 AM 저장 → TTL 1시간 → 11:00 AM 만료. 오후 2:00 PM은 4시간 후 → 캐시 이미 만료됨. Journey table의 "오후 2:00 Semantic Cache 히트"는 수학적으로 불가.
- **[HIGH]** Line 204 "비용 90% 절감" — step-02에서 85%로 확정했는데 재등장.

**Critic-A 질문 — Persona 4 step-02 정책 준수 여부 (내 답변):**
Persona 4 (lines 189-195)에 `enableSemanticCache` 플래그가 완전히 누락됨. Story 15.3을 구현하는 개발자가 반드시 알아야 할 내용:
1. `enableSemanticCache` 플래그가 `agents` 테이블 어느 컬럼에 저장되는지
2. 기본값: `false` vs `true` (안전상 `false`가 맞음)
3. Admin 콘솔에서 에이전트별 설정 방법

이 3가지가 없으면 Story 15.3 구현자가 모든 에이전트에 `enableSemanticCache=true` 적용하거나, 아예 플래그를 하드코딩할 위험이 있음. → Persona 4 요구사항에 추가 필요.

**최종 합산 이슈 (크로스토크 후):**
| 심각도 | 이슈 | 출처 |
|--------|------|------|
| CRITICAL | 이주임 여정 주가 Semantic Cache 예시 — step-02 정책 위반 | Critic-A 발견 |
| HIGH | TTL 수학 오류 (10:00 저장 → 14:00 히트 불가) | Critic-A 발견 |
| HIGH | "90% 절감" 재등장 (확정값: 85%) | Critic-A 발견 |
| HIGH | Stale-on-error fallback 미설계 아키텍처 | 내 발견 |
| HIGH | ⚡ 배지 없음 결정 정당성 부재 | 내 발견 |
| MEDIUM | Tool Cache 히트율 관측 가능성 미스코프 | 내 발견 |
| MEDIUM | 개발자 여정 15.2/15.3 누락 | 내 발견 |
| MEDIUM | Persona 4에 enableSemanticCache 구현 가이드 누락 | 크로스토크 추가 |
