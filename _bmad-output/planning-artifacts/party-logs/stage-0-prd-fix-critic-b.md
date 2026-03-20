## Critic-B Review — Stage 0: PRD v3 Spec Fix

**Reviewer:** Quinn (QA) + Dana (Security)
**Date:** 2026-03-20
**File Reviewed:** `_bmad-output/planning-artifacts/prd.md`
**Focus:** Test coverage gaps, edge cases, security patterns, secret exposure, data validation, concurrent access

---

### 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 7/10 | SQL 스키마, 파일 경로 명시 잘 됨. personality_traits 검증 스펙, /ws/office auth 스펙 누락. |
| D2 완전성 | 6/10 | n8n auth/방화벽 미명시, /ws/office 인증 누락, observations 처리상태 추적 컬럼 없음, 반성 워커 race condition 미정의. |
| D3 정확성 | 6/10 | **치명적 모순**: FR-PERS3이 `engine/agent-loop.ts`에서 `{personality_traits}` 주입 명시 ↔ Phase 5 절대 규칙 #1 `engine/agent-loop.ts 수정 금지`. |
| D4 실행가능성 | 7/10 | SQL 스키마, FR 목록, 파일 경로 명확. race condition 해법 없어 구현 시 추가 설계 필요. |
| D5 일관성 | 6/10 | FR-PERS3 vs 절대 규칙 #1 자기모순. Out of Scope "에이전트 메모리 시스템 개편 → Phase 5+" 항목이 Phase 5에서 추가됐는데 Out of Scope 표에서 미삭제. |
| D6 리스크 | 4/10 | n8n 포트 5678 외부 노출 리스크 미언급. personality_traits 프롬프트 인젝션 미언급. /ws/office 100개 동시 연결 미정의. 반성 워커 race condition 미언급. |

### 가중 평균: 5.9/10 ❌ FAIL

**계산:** D1(7×10%) + D2(6×25%) + D3(6×15%) + D4(7×10%) + D5(6×15%) + D6(4×25%) = 0.70+1.50+0.90+0.70+0.90+1.00 = **5.70/10**

> D6 리스크 4/10 — 자동 불합격 조건 근접 (3/10 미만 시 자동 불합격). 보안 리스크 다수 미명시.

---

### 이슈 목록

#### 🔴 ISSUE-1 [D6 보안 — 최우선]: n8n 포트 5678 외부 노출 리스크 미정의

**Quinn:** "n8n가 포트 5678로 뜨는데 방화벽 규칙이 없으면? VPS IP:5678로 직접 접근하면 n8n Admin UI가 열린다."
**Dana:** "n8n 자체 인증 없이 배포하면 Oracle VPS의 공개 IP:5678로 누구나 접근 가능. n8n은 기본적으로 인증 없이 시작됨(`N8N_BASIC_AUTH_ACTIVE=false`가 기본값). FR-N8N4는 '포트 5678에서 독립 실행'만 명시 — 방화벽 rule-set, n8n 인증 설정, 역방향 프록시 여부 전무."

**근거:**
- `Phase 5 Feature 5-2`: "배포: n8n Docker 컨테이너 → Oracle VPS 동일 서버 (포트 5678)" — 접근 제한 없음
- `FR-N8N4` (line ~1338): "n8n Docker 컨테이너가 Oracle VPS 포트 5678에서 독립 실행된다" — 방화벽/인증 언급 없음

**필요한 수정:**
- FR-N8N4에 추가: "포트 5678은 VPS 방화벽에서 외부 차단 (localhost만 허용)"
- 또는: "기존 Hono 서버를 역방향 프록시로 사용, `/admin/n8n-proxy/*` 라우트 → `localhost:5678` 내부 전달 (기존 JWT Auth 재활용)"
- n8n Basic Auth 또는 API Key 설정 명시

---

#### 🔴 ISSUE-2 [D3 정확성 + D5 일관성 — 치명 모순]: FR-PERS3 vs 절대 규칙 #1 자기모순

**Quinn:** "`engine/agent-loop.ts`에 `{personality_traits}` 변수를 주입하려면 Soul 치환 로직을 수정해야 하는데, 절대 규칙이 수정 금지라고 하면 어떻게 구현하나?"
**Dana:** "모순 해소 없이 구현하면 개발자가 규칙을 어기거나, 인젝션이 아예 구현 안 되거나 둘 중 하나."

**근거:**
- `FR-PERS3` (line ~1345): "`engine/agent-loop.ts`의 Soul 변수 치환 단계에서 `{personality_traits}` 변수가 외향성/성실성/개방성/친화성/신경성 텍스트로 치환된다"
- `Phase 5 절대 규칙 #1` (line ~569): "`engine/agent-loop.ts` 수정 금지 — 시각화·성격·메모리 전부 '위에 얹는 것'"

**필요한 수정:** 두 가지 중 택일 명시
1. "`{personality_traits}` 주입을 위해 agent-loop.ts의 Soul 치환 헬퍼 함수만 확장 허용 (Phase 5 규칙의 예외로 명시)"
2. "Soul 치환을 agent-loop.ts에서 분리된 `engine/soul-builder.ts`로 위임하고, personality_traits 주입은 soul-builder.ts에서 처리"

---

#### 🔴 ISSUE-3 [D6 보안]: personality_traits JSONB 서버사이드 검증 미정의

**Quinn:** "Admin이 extraversion=99 또는 `extraversion: 'IGNORE ALL PREVIOUS INSTRUCTIONS'`를 JSONB에 넣으면?"
**Dana:** "JSONB는 임의 JSON을 허용. 값이 float 0~1인지 검증하는 Zod 스키마나 DB CHECK 제약이 없다. Soul에 직접 주입되므로 prompt injection 벡터가 됨. Admin이 악의적이지 않더라도 실수로 잘못된 값이 들어가면 LLM 행동이 예측 불가."

**근거:**
- `FR-PERS2` (line ~1344): "성격 설정이 `agents.personality_traits JSONB` 컬럼에 저장된다" — 검증 언급 없음
- `DB 변경` (line ~474): `기본값: {"extraversion":0.5,...}` 명시 — 범위/타입 제약 없음

**필요한 수정:**
- DB: `CHECK (personality_traits->>'extraversion' IS NULL OR (personality_traits->>'extraversion')::float BETWEEN 0 AND 1)` 또는 동등한 5개 축 체크
- Server: Zod 스키마 `z.object({ extraversion: z.number().min(0).max(1), ... })` 검증 추가
- FR-PERS2에 명시: "서버에서 0~1 범위 검증 필수 (Zod + DB CHECK)"

---

#### 🟠 ISSUE-4 [D2 완전성]: observations 테이블 — "미처리" 추적 컬럼 없음

**Quinn:** "반성 워커가 '미처리 관찰 20개 누적 시 자동 실행'한다고 했는데, 어떤 관찰이 이미 반성에 포함됐는지 어떻게 아나? 스키마에 `reflected_at`이나 `processed` 플래그가 없다."

**근거:**
- `observations` SQL 스키마 (line ~508-520): 컬럼 목록에 처리 상태 추적 없음
- "에이전트별 최근 20개 관찰이 쌓이면 자동 실행" (line ~540) — "최근 20개"인지 "미처리 20개"인지 모호

**필요한 수정:**
```sql
-- observations 테이블에 추가
reflected_at TIMESTAMPTZ,  -- NULL이면 미처리. 반성 생성 시 채워짐
```
또는 `reflections` 테이블에 `source_observation_ids UUID[]` 컬럼 추가로 포함된 관찰 추적.

---

#### 🟠 ISSUE-5 [D6 리스크]: reflection 워커 race condition — 동시 실행 방지 없음

**Quinn:** "에이전트가 관찰 40개를 빠르게 쌓으면 워커가 동시에 2개 실행되어 중복 reflections 생성 가능. 또한 Gemini API 동시 호출로 비용 2배."
**Dana:** "Race condition으로 동일 observations에서 duplicate reflections → Soul 주입 시 중복 인사이트로 LLM 행동 오염."

**근거:**
- `FR-MEM3` (line ~1353): "백그라운드 워커(memory-reflection.ts)가 에이전트별 미처리 관찰 20개 누적 시 자동 실행된다" — 동시 실행 방지 언급 없음

**필요한 수정:**
- `reflections` 테이블에 agent_id per-lock 메커니즘 명시
- 또는 DB-level advisory lock: `SELECT pg_try_advisory_lock(agent_id::bigint)`
- FR-MEM3에 추가: "에이전트별 반성 워커는 동시에 1개만 실행 (advisory lock 또는 DB 상태 플래그)"

---

#### 🟡 ISSUE-6 [D2 완전성]: /ws/office WebSocket — 인증 요구사항 미정의

**Quinn:** "기존 14개 WS 채널은 어떻게 인증하나? 새 /ws/office는 같은 방식인지 명시가 없다. 100개 브라우저가 동시 연결하면?"
**Dana:** "미인증 /ws/office 엔드포인트는 누구나 에이전트 실행 상태를 실시간 감청 가능. activity_logs 내용이 노출됨."

**근거:**
- `Feature 5-1` (line ~434-436): "신규 WebSocket 채널: `/ws/office`" — 인증 언급 없음
- FR-OC2: "WebSocket `/ws/office` 채널로 실시간 브로드캐스트" — 인증/레이트리밋 없음
- NFR Security 섹션에 /ws/office 관련 항목 없음

**필요한 수정:**
- FR-OC2에 추가: "/ws/office는 기존 WS 채널과 동일한 JWT 인증 방식 사용"
- NFR-SC1에 유사하게: /ws/office 최대 동시 연결 수 명시 (e.g. 회사별 최대 50개)

---

#### 🟡 ISSUE-7 [D2 완전성]: Out of Scope 표 미갱신

**Quinn:** "Out of Scope 표에 '에이전트 메모리 시스템 개편 → Phase 5+'가 여전히 남아있는데, Phase 5에서 완전한 메모리 아키텍처를 구현한다. 혼란 유발."

**근거:**
- Out of Scope 표 (line ~594): "에이전트 메모리 시스템 개편 | autoLearn 유지. 세션 연속성은 나중에 | Phase 5+"
- Phase 5 Feature 5-4: 완전한 3단계 메모리 파이프라인 구현

**필요한 수정:** Out of Scope 표에서 해당 행 삭제 또는 주석: "Phase 5에서 신규 메모리 아키텍처 추가됨 (autoLearn 외 observations/reflections 계층)"

---

### 이슈 우선순위 요약

| # | 이슈 | 차원 | 심각도 |
|---|------|------|--------|
| 1 | n8n 포트 5678 외부 노출 무방비 | D6 보안 | 🔴 Critical |
| 2 | FR-PERS3 vs 절대 규칙 #1 모순 | D3+D5 | 🔴 Critical |
| 3 | personality_traits 검증 미정의 (prompt injection) | D6 보안 | 🔴 High |
| 4 | observations 미처리 추적 컬럼 없음 | D2 | 🟠 Medium |
| 5 | reflection 워커 race condition | D6 리스크 | 🟠 Medium |
| 6 | /ws/office 인증/동시 연결 미정의 | D2+D6 | 🟡 Medium |
| 7 | Out of Scope 표 미갱신 | D5 | 🟡 Low |

---

### Cross-talk 수신 후 업데이트

#### Critic-A 교차 검증 (동의 항목)
- **FR-MEM6도 같은 모순**: `engine/agent-loop.ts`에서 반성 검색 + Soul 주입 명시 (FR-MEM6) — 내가 FR-PERS3만 잡았는데 FR-MEM6도 동일 위반. 이슈-2 범위 확장.
- **FR-MEM3 트리거 메커니즘 미정의** (폴링? INSERT 훅? DB 트리거?) + DDL에 `processed` 컬럼 없음 → 이슈-4, 이슈-5와 완전 일치.
- **n8n 보안** 동일 판단.
- **soul-enricher.ts 패턴 확정**: agent-loop.ts는 완성된 Soul 문자열만 받고, `soul-enricher.ts`가 DB 조회 + 변수 치환 + personality/memory 주입 전담. agent-loop.ts 코드 변경 0줄 — "위에 얹는 것" 철학 유지. FR-PERS3 + FR-MEM6 모순 해소.
- **n8n Hono 프록시 방식**: `Admin앱 → HTTPS /admin/n8n/* → Hono proxy middleware → localhost:5678/*`. Oracle VPS Security List 5678 변경 불필요. 기존 Hono JWT 미들웨어가 인증 담당.
- **🔴 NFR-SC7 수치 오류 (D3 정확성)**: `NFR-SC7` (prd.md L1406) "pgvector HNSW 인덱스 포함 ≤ 3GB (Oracle VPS **4GB** 기준)" — architecture.md L72, L211에 VPS 실제 스펙은 **24GB ARM64 4코어**로 명시. architecture.md L211: "NFR-SC7 → **≤ 16GB (24GB 기준)**"으로 수정 권고 기록됨. Stage 0에서 미반영. D3 점수 추가 하향 요인.

#### Critic-C 교차 검증 (신규 발견 — 내 리뷰 보완)
- **🔴 Phase 5 NFR 전무**: PixiJS FPS 목표, /ws/office 이벤트 레이트 리밋, memory-reflection 워커 최대 실행 시간, n8n 메모리 예산 — 전부 없음. QA 합격/불합격 기준이 없어 Phase 5 검증 불가. 내가 놓친 항목. D2 점수 추가 하향 요인.
- **FR-N8N3 데이터 손실 위험**: "기존 워크플로우 구현 코드 삭제" 시 workflows 테이블 기존 데이터 손실 가능. "86개 DB 테이블 유지" 규칙과 충돌 여부 미명시.
- **n8n DB 접근 경계**: n8n이 CORTHEX PostgreSQL에 직접 접근 가능 여부 미정의.

#### 최종 점수 재조정 (2차 — Critic-A 교차검증 반영)

| 차원 | 초기 점수 | 1차 조정 | 최종 점수 | 변경 이유 |
|------|---------|---------|---------|---------|
| D2 완전성 | 6/10 | 5/10 | **5/10** | Phase 5 NFR 전무 |
| D3 정확성 | 7/10 | 7/10 | **5/10** | NFR-SC7 4GB→24GB 미수정 (architecture.md에 이미 수정 권고), NFR-SC2 50MB→200MB 미수정 |
| D6 리스크 | 4/10 | 4/10 | **4/10** | 유지 |

**최종 가중 평균: 5.2/10 ❌ FAIL**
계산: D1(7×10%) + D2(5×25%) + D3(5×15%) + D4(7×10%) + D5(6×15%) + D6(4×25%) = 0.70+1.25+0.75+0.70+0.90+1.00 = **5.30/10**

> **수정 요약 (Writer용):** 9개 이슈 + NFR-SC7/SC2 수치 정정 포함 총 11개 수정 필요.
