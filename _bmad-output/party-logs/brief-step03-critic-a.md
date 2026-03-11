# [Critic-A Review] step-03: Target Users + Personas

**Reviewed:** 2026-03-11
**File:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md` Lines 145-223
**Cross-referenced:** `_research/tool-reports/05-caching-strategy.md`, `v1-feature-spec.md`, step-02 수정본

---

## Agent Discussion (in character)

**John (PM):** "이주임 여정 테이블을 읽다가 멈췄다. Lines 212-213: 오전 10:00에 '삼성전자 주가 알려줘' → Semantic Cache 저장. 오후 2:00에 '삼전 주가 얼마야?' → Semantic Cache 히트. 방금 step-02에서 우리가 CRITICAL로 잡고 고친 게 뭐였냐? 주가는 enableSemanticCache=false여야 한다는 거다. 그런데 페르소나 섹션은 주가 쿼리로 Semantic Cache 히트 성공 경험을 보여주고 있다. 이건 step-02 핵심 수정사항과 정면 충돌하는 사례다. 사용자에게 '되면 안 되는 것이 된다'는 잘못된 기대를 심어주는 것이고, 개발자가 이 여정을 보고 주가 에이전트에도 enableSemanticCache=true를 설정하면 치명적 버그가 된다."

**Sally (UX):** "이주임이 '반복 질문은 바로 나오네! 근데 최신 데이터는 정확히 나와'라고 하는데 — 이게 어떻게 가능한가? TTL 1시간이면 10:00 AM에 저장한 주가가 11:00 AM에 만료된다. 오후 2:00 PM(4시간 후)에 어떻게 Semantic Cache 히트가 날 수 있지? TTL 수학이 틀렸다. 1시간 TTL + 10시 저장 = 11시 만료, 14시에는 이미 캐시 없음. 실제 사용자가 이 여정을 따라가면 오후 2시에는 느린 응답을 받는다. 기대를 잘못 설정한 페르소나 여정은 출시 후 실망으로 이어진다. 그리고 이주임 성공 기준에 'Hub UI에 ⚡ 배지 표시 없어도 체감 속도로 캐싱 인지'라고 했는데, step-02 리뷰에서 캐시 표시 UI를 권장했고 비용이 0인 응답과 신선한 LLM 응답을 구분할 방법이 없으면 사용자 신뢰에 문제가 생긴다."

**Mary (BA):** "김운영 여정 테이블 line 204에서 '비용 90% 절감'이 나온다. Step-02에서 85%로 통일했는데 여기선 90%가 또 나왔다. 이런 숫자 불일치는 경영진에게 보고할 때 신뢰를 깎는다. 또 한 가지 — line 205의 '`cache_read_cost` 필드'가 admin 로그에 있다고 했는데, 현재 CORTHEX v2 admin 콘솔에 이 필드가 있는가? cost-tracker Hook은 Epic 14에서 연결됐지만 admin UI 출력은 Epic 15 구현 범위인지 불명확하다. 비용 관리자 김운영의 핵심 성공 경험이 아직 구현도 안 된 UI 필드에 의존하면 ROI 증명 자체가 막힌다."

---

## Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | **CRITICAL** | John (PM) | **이주임 여정이 step-02 Semantic Cache 정책과 직접 모순** — Lines 172-174 및 212-213에서 "삼성전자 주가" 쿼리가 Semantic Cache에 저장되고 히트된다. Step-02에서 CRITICAL 이슈로 수정 완료한 핵심 정책: 주가(kr_stock) 에이전트는 `enableSemanticCache=false` (연구보고서 §3.2 "실시간 데이터 → 부적합"). 이 여정을 읽은 개발자가 CIO(투자분석처장) 에이전트에 `enableSemanticCache=true`를 설정하면 1시간 된 주가 응답이 캐시에서 반환된다. | 이주임 여정 예시를 FAQ성 쿼리로 교체: "우리 회사 출장비 처리 규정이 어떻게 돼?" → Semantic Cache 저장 / "출장비 신청 방법 알려줘" → 히트. 주가는 Tool Cache(1분 TTL) 히트 예시로 분리해서 설명. |
| 2 | **HIGH** | Sally (UX) | **이주임 여정 TTL 수학 오류** — Line 213: 오전 10:00에 Semantic Cache 저장(TTL 1시간 → 11:00 만료), 오후 2:00에 캐시 히트. 1시간 TTL이면 4시간 후(오후 2시)에는 캐시가 이미 만료되어 히트 불가. 숫자가 맞지 않는다. (Issue 1이 수정되면 이 오류도 자동 해결되지만, FAQ 예시로 바꿀 경우 TTL을 현실적 값 — 24시간 또는 당일 — 으로 명시해야 함.) | FAQ 쿼리로 교체 시 TTL을 "24시간" 또는 "당일(자정 만료)"로 설정. 또는 TTL을 "에이전트별 설정값 기준" 참조로 표현. |
| 3 | **HIGH** | Mary (BA) | **김운영 여정 "90% 절감" — step-02 통일 수치 "85%"와 불일치** — Line 204: 개발자가 "비용 90% 절감"이라고 설명. Step-02에서 전 문서를 85%로 통일 확정(연구보고서 비용 계산 테이블 기준). 90%는 연구보고서 서두의 마케팅 표현이고, 실제 계산 기준값은 85%. 숫자 불일치는 경영진 보고 시 신뢰도를 훼손한다. | "비용 90% 절감" → "Soul 토큰 비용 85% 절감 (cache_read_input_tokens 기준)"으로 통일. |
| 5 | **HIGH** | Sally (UX) / Critic-B | **⚡ 캐시 배지 없음 — 투명성 원칙 위반** — Line 175: "Hub UI에 ⚡ 배지 표시 없어도 체감 속도로 캐싱 인지"라고 성공 기준을 정의했는데, 이는 투명성 문제다. FAQ 에이전트 TTL=24시간이면 오전에 정책이 변경되어도 오후 2시에 캐시된 구버전 답변이 나온다. 이주임은 빠른 응답을 받았지만 "최신 데이터인지" 알 방법이 없다. 금융 플랫폼에서 구버전 규정 답변이 의사결정에 쓰이면 신뢰 파괴. Step-02 리뷰에서 Critic-A가 이미 "⚡ Cache badge + timestamp" 권장 → Writer가 미반영. | Hub에 ⚡ 배지 + 캐시 저장 시각(예: "응답 캐시됨 · 오전 10:00 기준") 표시 추가. 또는 최소한 TTL 기반 "이 응답은 X시간 내 캐시 데이터입니다" 알림 추가. MVP 범위에 포함 결정 필요. |
| 6 | **HIGH** | Critic-B | **Persona 3 Stale-on-error fallback 미설계 동작 오기재** — Line 184: "외부 API 장애 시 만료되지 않은 캐시가 fallback으로 작동 가능"이라고 쓰여 있는데, 이는 architecture.md와 연구보고서 어디에도 없는 의도되지 않은 동작이다. kr_stock TTL=1분이면 API 장애가 1분 이상 지속 시 캐시도 없어 에러가 발생한다. 더 심각한 문제: 개발자가 이걸 "resilience feature"로 오해하고 별도 에러 핸들링을 생략할 수 있다. 기능이 아니라 부작용인데 기능처럼 기술됨. | Persona 3에서 fallback 언급 삭제 또는 "TTL 내 우발적 보호 (의도된 fallback 아님, 별도 에러 핸들링 필수)"로 명확히 재작성. |
| 4 | **MEDIUM** | Mary (BA) | **`cache_read_cost` admin 필드 — 구현 범위 불명확** — Line 205: 김운영이 "admin 로그에서 `cache_read_cost` 필드 확인"하는 것이 핵심 성공 경험. 그러나 현재 CORTHEX v2 admin 콘솔에 이 필드가 있는지 불명확. cost-tracker Hook(Epic 14 연결 완료)은 내부 로그에 기록하지만, admin UI 표시는 Epic 15 구현 범위인가? 미구현 필드에 의존한 성공 기준은 사용자가 실제로 가치를 확인할 수 없게 만든다. | Epic 15 구현 범위에 "admin 비용 대시보드에 `cache_hit_rate`, `cache_read_cost` 필드 노출" 포함 여부 명시. 포함이면 Story 15.x에 추가. 미포함이면 성공 기준을 "Anthropic 대시보드의 `cache_read_input_tokens`로 직접 확인"으로 수정. |

---

---

## Cross-Talk with Critic-B

**Critic-B raised:**
1. Stale-on-error fallback 미설계 (Persona 3, line 184) — architecture.md/연구보고서에 없는 동작이 암묵적 기능으로 생성됨. TTL=1분이면 장애 2분 후 캐시도 없음.
2. ⚡ 캐시 배지 없음 결정 정당성 부재 (line 175) — step-02 투명성 원칙과 충돌. 59분 내 질문 = 구버전 답변 받을 수 있음.

**Critic-A 응답:**

Issue 1 (Stale-on-error fallback) — **동의. 내가 Issue #4 수준으로만 잡았는데 HIGH가 맞다.** Line 184의 "외부 API 장애 시 만료되지 않은 캐시가 fallback으로 작동 가능"은 의도된 설계가 아니라 캐시 만료 전에 우연히 API 장애가 날 때만 동작하는 부산물이다. kr_stock TTL=1분인 경우 장애가 1분 이상 지속되면 캐시도 없으므로 에러 발생. 이걸 "fallback"이라고 쓰면 개발자가 resilience 기능으로 오해하고 별도 에러 핸들링을 건너뛸 수 있다. 페르소나 3에서 삭제하거나 "의도된 fallback 아님, TTL 내 우발적 보호만 가능"으로 재작성 필요.

Issue 2 (⚡ 배지 없음 결정) — **Sally가 정확히 지적했다.** Step-02에서 내가 "cached responses show a ⚡ Cache badge + timestamp in Hub"를 제안했고 Writer가 반영하지 않았다. 이주임 성공 기준(line 175)은 "배지 없어도 체감 속도로 캐싱 인지"라고 단정하는데, FAQ 에이전트 TTL이 24시간이면 오후 2시에 "우리 회사 출장비 규정"을 물어봤을 때 아침에 정책이 바뀌었어도 캐시된 구버전 답변이 나온다. 이 경우 체감 속도로 "최신 데이터"를 인지할 방법이 없다. ⚡ 배지 + 캐시 저장 시각 표시는 MVP에 포함되어야 한다. **Issue #5로 추가.**

김운영 admin 대시보드 가시성 — 내 Issue #4에서 `cache_read_cost` 필드를 미구현으로 플래그했다. 이건 김운영 페르소나 핵심 성공 경험이므로 Epic 15 구현 범위에 명시적으로 포함/제외 결정 필요하다. Critic-B 관점: 완전 동의.

**Critic-B 2차 메시지 추가 발견 (이미 Writer 피드백 전송 후):**
- Persona 4 `enableSemanticCache` 플래그 관련 내용 완전 누락: (1) `agents` 테이블 어느 컬럼에 저장되는지, (2) 기본값 `false`가 안전 기본값, (3) Admin 콘솔 에이전트별 토글 방법. Story 15.3 구현자가 필수로 알아야 할 정보가 페르소나 4에 없음. → **Issue #7로 추가.**

---

## v1-feature-spec Coverage Check

- Features verified:
  - v1 `/전체` 명령어 (6-에이전트 동시 실행) → 김운영 페르소나 line 156에 명시적 연결 ✅ (step-02 내 제안 반영)
  - v1 Soul 시스템 (웹 UI 편집 가능) → 김운영 페르소나가 Soul 편집까지 담당한다고 명시 ✅
  - v1 kr_stock, search_news 등 금융/뉴스 도구 → 이주임 페르소나에 반영 ✅ (단, Semantic Cache 적용 오류 수반)
  - v1 3계급 에이전트 시스템 → 페르소나 3(AI 에이전트)이 비서실장, CIO, CFO 등 구체적 역할명 언급 ✅

---

## Verification Results (Post-Fix)

| Issue | Status | Notes |
|-------|--------|-------|
| [CRITICAL] 이주임 여정 주가→FAQ 교체 + TTL 수학 | ✅ RESOLVED | "출장비 처리 규정" FAQ 예시, 9:00→9:45 (24h TTL), 주가는 false 명시 (lines 172-174, 213-216) |
| [HIGH] 90% → 85% 통일 | ✅ RESOLVED | Line 205: "비용 85% 절감" |
| [HIGH] Stale-on-error fallback 오기재 | ✅ RESOLVED | Line 184: "설계 범위 외 — 미설계 기능"으로 재작성 |
| [HIGH] ⚡ 배지 결정 | ✅ RESOLVED | Line 175: "MVP 미구현, UX 설계 단계 별도 결정" 명시 |
| [HIGH] Persona 4 enableSemanticCache 누락 | ✅ RESOLVED | Line 195: DB 컬럼 + DEFAULT FALSE + Admin 토글 추가 |
| [MEDIUM] cache_read_cost admin 범위 불명확 | ✅ RESOLVED | Line 205: "admin UI 미노출, 서버 로그/Anthropic 대시보드" 명시 |

**Final Score: 9/10**
- 7개 이슈 전부 해결, 추가 개선(Tool Cache 로깅 scope, 개발자 여정 8행 확장)도 포함
- -1점: ⚡ 배지가 "별도 결정 예정"으로 남겨져 Story ownership 없음 — 향후 UX 설계 시 누락 위험. Brief 범위에서는 허용 가능.

---

- Gaps found:
  - v1의 주요 고통: 에이전트 수가 많을수록 API 비용 폭증. 김운영 페르소나가 이를 잘 반영하나, **v1에서 실제로 이 문제 때문에 에이전트 확장을 중단한 사례**가 있다면 그 수치(v1 최대 에이전트 수, 실제 月 비용)를 인용하면 페르소나 신뢰도가 크게 높아진다.
  - v1 Hub의 CEO 사용 패턴(직접 사용자)이 이주임(대리) 페르소나에는 없음. v1은 CEO가 사령관실 주요 사용자였는데, v2에서도 CEO 레벨 사용자 페르소나가 있으면 더 완전하다. (단, Brief 범위 외일 수 있으므로 Minor)
