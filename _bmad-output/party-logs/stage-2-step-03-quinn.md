# Stage 2 Step 03 — Quinn (Critic-B: QA + Security) Review

**Step:** 3 — Vision / Product Scope
**Section:** PRD lines 634–1000
**Grade:** B
**Date:** 2026-03-22
**Cycle:** 1

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 8/10 | 파일 경로(L641-646, L804-809, L890), SQL 스키마(L855-880), 버전(PixiJS 8, voyage-3 1024d), 마이그레이션 번호(#61-63), AI 모델 비용(L794-797) 전부 명시. 외부 API 키 저장 위치, TTL 구현 방식 등 일부 미상세. |
| D2 완전성 | **25%** | 5/10 | 4대 기능 핵심 커버됨. 그러나: ①Stage 1 확정 결정 6건 미반영(#5,#7,#8,#9,#10,#12), ②observations 스키마 5개 필드 누락(confidence, importance, domain, reflected, reflected_at — Tech Research 대비), ③Phase 5 전 기능 UX 상태(empty/loading/error) 미정의(Sally), ④외부 API 키 저장 전략 미정의. |
| D3 정확성 | 15% | 5/10 | **CRITICAL**: ①L877 `VECTOR(768)` 데이터 타입 오류, ②L870-880 별도 `reflections` 테이블 — Brief Option B(`agent_memories` 확장)와 직접 모순(Bob), ③agent-loop.ts 5곳 충돌(L702/L725/L963 "no changes" vs L834/L918 "1-line hook"), ④migration 번호 PRD↔Tech Research 불일치(Bob). |
| D4 실행가능성 | 10% | 7/10 | SQL 스니펫, soul-enricher.ts 패턴(L919), PixiJS 상태 매핑(L716-722), n8n 프리셋 흐름(L762-784) 구체적. 방어 레이어 구현 가이드, TTL 크론 설계 부재. |
| D5 일관성 | 15% | 4/10 | **CRITICAL**: Brief Option B = `agent_memories` 확장인데 PRD는 별도 `reflections` 테이블 생성 — 기초 아키텍처 모순(Bob). 추가: ①L877 vs L865 VECTOR 차원, ②agent-loop.ts 5곳 충돌, ③L147 표기 불일치, ④L944 vs L935 multi-LLM 시기, ⑤migration 번호 불일치, ⑥Stage 1 확정 결정 6건 미반영. |
| D6 리스크 | **25%** | 6/10 | n8n 포트 차단(L753), proxy 인증(L750), tag 격리(L752), 독립 패키지 격리(L923) 등 일부 인식됨. 그러나: observation poisoning 방어 전체 PRD에서 부재, /ws/office 레이트 리밋 미정의, N8N_DISABLE_UI=false 보안 영향 미논의, 외부 API 키 암호화/로테이션 미정의, advisory lock 미언급. |

### 가중 평균: 5.60/10 ❌ FAIL (cross-talk 후 하향 조정)

계산: (8×0.10) + (5×0.25) + (5×0.15) + (7×0.10) + (4×0.15) + (6×0.25) = 0.80 + 1.25 + 0.75 + 0.70 + 0.60 + 1.50 = **5.60**

> **Score History:** 6.15 (초기) → **5.60** (cross-talk 후 — Bob의 Brief Option B 모순 + Sally의 UX 상태 누락 반영)

---

## 이슈 목록

### CRITICAL (3)

**#1 [D3/D5] L877 reflections `VECTOR(768)` — VECTOR(1024)여야 함**
- L865 observations: `VECTOR(1024)` ✅ (pre-sweep 수정됨)
- L877 reflections: `VECTOR(768)` ❌ (pre-sweep 누락)
- FR-MEM2(L2333)도 observations만 VECTOR(1024) 언급, reflections 누락
- Voyage AI voyage-3는 1024d 벡터 생성 → 768d 컬럼에 INSERT 시 런타임 에러
- Winston 확인: pgvector가 query 시에도 차원 불일치 거부
- 확정 결정 #1: `vector(768) → vector(1024)` 전체 적용 필수
- **이것은 용어 치환이 아님 — 데이터 타입 오류. pre-sweep의 Gemini→Voyage 텍스트 치환에서 dimension 값이 누락됨**

**#2 [D3/D5] L963 vs L918 — agent-loop.ts 수정 범위 자기모순 (5곳 충돌)**
- "수정 없음" 진영 (3곳): L702 "기존 엔진(agent-loop.ts) 변경 없음", L725 "수정 없음", L963 "(읽기만)"
- "1행 훅 허용" 진영 (2곳): L834 "soulEnricher.enrich() 호출 1행만 삽입", L918 절대 규칙 #1
- Bob이 5곳 전체 매핑 완료 — Step 2의 "삭제 0줄" vs GATE 모순과 동일 패턴
- 수정안: "수정 없음" 3곳 전부 → "(soul-enricher.ts 1행 훅만)" 통일

**#3 [D3/D5] reflections 아키텍처 — Brief Option B 직접 위반 ⭐ (Bob 발견, cross-talk)**
- **Brief L153-154**: "채택 전략: Option B — 기존 확장. 기존 `agent_memories` 테이블: `memoryTypeEnum`에 `'reflection'` 타입 추가"
- **Tech Research L891**: "INSERT agent_memories (memoryType='reflection', content=synthesis)"
- **Tech Research L1721-1724**: Planning 단계에서 `agentMemories` WHERE `memoryType='reflection'` 검색
- **Tech Research L1861**: Reflection 크론이 `agentMemories`에 `memoryType: 'reflection'`으로 INSERT
- **PRD L870-880**: 별도 `reflections` 테이블 CREATE TABLE ❌
- **PRD L850**: "관찰 요약 → `reflections` 테이블 저장" ❌
- **PRD L908**: "DB 신규 테이블: observations + reflections" ❌
- Brief/Tech Research = `agent_memories` 확장 (Option B). PRD = 별도 테이블. **기초 아키텍처 모순.**
- 연쇄 영향: L877 VECTOR(768) 이슈도 이 맥락에서 무효 — reflections 테이블 자체가 존재하면 안 됨
- 수정안: L870-880 별도 테이블 삭제 → `agent_memories` memoryTypeEnum 확장 + `embedding vector(1024)` 컬럼 추가로 교체

### MAJOR (9 — cross-talk 후 3건 추가)

**#3 [D2/D5] observations 스키마(L855-867) — `reflected`/`reflected_at` 컬럼 누락**
- 확정 결정 #7: `is_processed → reflected`, `processed_at → reflected_at`
- 현재 스키마에 해당 컬럼 없음 → reflection 크론이 처리 완료된 observation을 추적 불가
- 추가 필요: `reflected BOOLEAN DEFAULT false`, `reflected_at TIMESTAMPTZ`

**#4 [D2/D6] observation poisoning 4-layer 방어 — 전체 PRD에서 부재**
- 확정 결정 #8: "4-layer sanitization (max 10KB, control char strip, prompt hardening, content classification)"
- PRD 전체 grep 결과: personality sanitization(PER-1)만 존재, observation content sanitization 부재
- observation content가 reflection 크론의 LLM 입력으로 직접 전달됨 → poisoned observation이 reflection 품질 저하/prompt injection 벡터
- Feature 5-4에 observation content sanitization 레이어 추가 필수

**#5 [D2/D5] 30일 TTL — Feature 5-4 섹션에 부재**
- 확정 결정 #5: processed observations 30일 TTL
- NFR-D8(L2443)에는 있으나 Feature 5-4(L843-897)에는 없음
- SQL 스키마에 TTL 관련 필드 없음, 정리 크론 설계 부재
- `reflected` 컬럼(#3)이 있어야 "processed" 상태를 판별 가능 — 의존 관계

**#6 [D2/D6] advisory lock — Feature 5-4 reflection 크론에 부재**
- 확정 결정 #9: `pg_advisory_xact_lock(hashtext(companyId))`
- L1682 리스크 테이블에는 있으나 L887-890 크론 설명에 없음
- 동시 크론 실행 → 동일 observations 이중 처리 → 중복 reflections 생성
- memory-reflection.ts 서비스 설명에 advisory lock 패턴 추가 필요

**#7 [D2/D6] /ws/office WebSocket — 연결 제한 및 레이트 리밋 미정의**
- 확정 결정 #10: 50 connections/company, 500/server, 10 msg/s per userId (token bucket)
- Discovery L158에 "JWT+token bucket(10 msg/s per userId)" 언급
- Feature 5-1(L706-731)에는 연결 제한/레이트 리밋 전무
- /ws/office = 실시간 채널(60fps 이벤트 가능) → 무제한 연결 시 서버 부하

**#8 [D6] 외부 API 키 저장 전략 미정의(L801)**
- 마케팅 프리셋: 회사별 이미지/영상 엔진 API 키 필요
- L801: "회사별 외부 API 키로 결제 — CORTHEX가 추적할 필요 없음"
- 그러나 API 키를 n8n credentials에 저장? CORTHEX DB에 저장? Admin에서 입력?
- 암호화 at rest, 키 로테이션, 접근 감사 전무
- n8n credential store 사용 시 tag-based tenant 격리와의 교차 접근 리스크

**#9 [D2] Phase 5 전 기능 UX 상태(empty/loading/error) 미정의 (Sally)**
- Feature 5-1(OpenClaw): WebSocket 끊김 시 UI 상태? 에이전트 0명일 때 빈 사무실?
- Feature 5-2(n8n): Docker 다운/OOM 시 관리 페이지? 워크플로우 0개 빈 상태?
- Feature 5-3(Big Five): 성격 저장 실패 시? 기본값 표시?
- Feature 5-4(Memory): reflection 크론 실패 시? observations 0건?
- Step 2에서 Journey B/C 확장으로 해결했던 패턴이 Feature 섹션에 미적용

**#10 [D2/D5] observations 스키마(L855-867) — Tech Research 대비 5개 필드 + 4개 인덱스 누락**
- Tech Research L850-873 observations 스키마:
  - `confidence FLOAT` (reflection 크론 필터: ≥ 0.7)
  - `importance INTEGER` (reflection 트리거: cumulative sum > 150)
  - `domain VARCHAR` (대화/도구/에러 분류)
  - `reflected BOOLEAN` + `reflected_at TIMESTAMPTZ` (확정 결정 #7)
  - `task_summary VARCHAR` (태스크 컨텍스트)
- Tech Research 인덱스 5개 중 PRD는 HNSW 1개만 → `unreflectedIdx`(partial), `companyIdx`, `agentIdx`, `domainIdx` 부재
- confidence/importance 없이 reflection 크론의 우선순위 필터링 불가

**#11 [D3/D5] Migration 번호 cross-document 불일치 (Bob)**
- PRD: 0061=personality(L820), 0062=observations(L884), 0063=reflections(L885)
- Tech Research: 0061=enum extension, 0062=observations, 0063=personality
- reflections 테이블 자체가 Brief Option B 위반(#3)이므로 0063 migration도 무효
- 수정안: Tech Research 순서 채택 (0061=enum, 0062=observations, 0063=personality, 0064=agent_memories embedding, 0065=HNSW)

### MINOR (4)

**#12 [D5] L147 vs L148 — reflections 저장 위치 표기 불일치**
- L147: "agent_memories[reflection](pgvector)" — Brief Option B와 일치 ✅
- L148: "observations/reflections 신규 2테이블 추가" — Brief Option B와 불일치 ❌
- L147이 실제로 정확하고 L148이 틀린 것 (cross-talk #3에서 확인)
- L148 수정 필요: "observations 신규 테이블 + agent_memories memoryType 확장"

**#13 [D3/D5] L944 vs L935 — multi-LLM 시기 불일치**
- L935 (Vision 테이블): "멀티 LLM 동적 라우팅 | Phase **6**"
- L944 (Out of Scope 테이블): "멀티 LLM | Phase **5**"
- Phase 5 vs Phase 6 — 어디서 구현?

**#14 [D6] N8N_DISABLE_UI=false(L749) 보안 영향 미논의**
- n8n 에디터 UI 활성 = 워크플로우 생성/수정/삭제 가능한 full admin interface
- Hono proxy + Admin 인증(L750, L753)으로 완화됨
- 그러나 n8n 에디터의 자체 취약점(XSS, SSRF 등) 노출 가능성 미논의
- "Admin 전용"이라도 공격 표면 확대 인정 필요

**#15 [D5] L893 planning 단계 — soul-enricher.ts 귀속 미명시**
- L893: "engine/agent-loop.ts에서 Soul 주입 직전 실행"
- E8 경계(L918)에 따르면 이 검색 로직은 soul-enricher.ts에서 처리해야 함
- L831-835에서 soul-enricher.ts가 "성격 + 메모리 = 단일 진입점"으로 정의됨
- L893-895의 planning 로직이 어디 파일에 속하는지 명시 필요

---

## 확정 결정 반영 체크리스트

| # | 확정 결정 | Product Scope 반영 | 위치 |
|---|----------|-------------------|------|
| 1 | Voyage AI 1024d | ⚠️ observations만 반영, **reflections VECTOR(768) 오류** | L865 ✅, L877 ❌ |
| 2 | n8n Docker 2G | ✅ (Discovery L155에 반영) | Scope 내 미언급 (Discovery 영역) |
| 3 | n8n 8-layer security | ⚠️ Discovery L158에만 상세, Scope는 proxy+tag+port만 | L748-753 |
| 4 | Stitch 2 | ✅ (pre-sweep 완료) | — |
| 5 | 30일 TTL | ❌ Feature 5-4에 없음. NFR-D8(L2443)에만 | — |
| 6 | LLM Cost $17/mo | ⚠️ Discovery L155 근방에만 | Scope 내 미언급 |
| 7 | reflected/reflected_at | ❌ SQL 스키마에 컬럼 부재 | L855-867 |
| 8 | Observation poisoning | ❌ 전체 PRD에서 부재 | — |
| 9 | Advisory lock | ❌ Feature 5-4에 없음. L1682에만 | — |
| 10 | WebSocket limits | ❌ Feature 5-1에 없음 | L726 |
| 11 | Go/No-Go 11 gates | ⚠️ Scope 외 영역에서 확인 필요 | — |
| 12 | host.docker.internal | ⚠️ Scope 내 미언급 | — |

반영률: 2/12 완전 반영, 4/12 부분 반영, 6/12 미반영 → **심각한 정합성 결여**

---

## Cross-talk 요약

### Winston (Critic-A, 7.15/10)
- VECTOR(768) 동의 — pgvector query 시에도 차원 불일치 거부 추가 확인
- Observation poisoning 전체 부재 동의 — observation→reflection→planning→Soul 공격 체인 명시
- Advisory lock 동의 — rapid observation burst 시 이중 reflection 실제 리스크
- L963 vs L918 자기모순 동의

### Sally (Critic-C, 6.60/10 FAIL)
- VECTOR(768) 동의 — pre-sweep 텍스트 치환이 SQL DDL 숫자값 놓침
- **Phase 5 전 기능 UX 상태 부재** — 신규 발견. Discovery Journey B 확장 패턴이 Feature 섹션에 미적용
- 내 D2 6→5 하향의 근거

### Bob (Critic-D, 6.70/10 FAIL)
- **reflections 아키텍처 Brief Option B 위반** — 가장 큰 발견. Brief/Tech Research = `agent_memories` 확장, PRD = 별도 테이블. 기초 아키텍처 모순. 내 D3 6→5, D5 5→4 하향의 핵심 근거
- **agent-loop.ts 5곳 충돌 매핑** — 내가 2곳만 잡았는데 5곳으로 확대 (L702, L725, L963 vs L834, L918)
- **Migration 번호 cross-document 불일치** — PRD 0061=personality vs Tech Research 0061=enum
- observations TTL/purge 동의
- Out of Scope 테이블 misleading 동의

### 합의 사항 (4 critics 만장일치)
1. L877 VECTOR(768) = 런타임 에러 확정
2. Stage 1 확정 결정 반영률 심각
3. agent-loop.ts 수정 범위 자기모순

### 크리틱 간 점수 비교 (pre-fix)
| Critic | Score | Status |
|--------|-------|--------|
| Winston (A) | 7.15 | PASS |
| Quinn (B) | **5.60** | ❌ FAIL |
| Sally (C) | 6.60 | ❌ FAIL |
| Bob (D) | 6.70 | ❌ FAIL |
| **Average** | **6.51** | **❌ FAIL** |

---

## Verification (Cycle 2 — post-fix)

### 검증 결과

**CRITICAL (3건 → 전부 해소)**

| # | Issue | 상태 | 검증 위치 |
|---|-------|------|----------|
| C1 | VECTOR(768) in reflections | ✅ 해소 | reflections 테이블 삭제됨 (Brief Option B). agent_memories embedding=VECTOR(1024) at L889 |
| C2 | agent-loop.ts 5곳 충돌 | ⚠️ 대부분 해소 | L944 Rule#1 + L989 코드경계 통일됨. L702 CEO quote "변경 없음" 잔존 — context상 허용. L725 Feature 5-1 specific (정확) |
| C3 | reflections 아키텍처 Brief Option B 위반 | ✅ 해소 | L858 "Brief Option B" 명시, L861 agent_memories memoryType, L883-891 SQL, L932 tech stack, L148 Discovery, L988 코드경계 — 전체 일관 |

**MAJOR (9건 → 7건 해소, 2건 deferred)**

| # | Issue | 상태 | 검증 |
|---|-------|------|------|
| M3 | reflected/reflected_at | ✅ | L877-878 추가됨 |
| M4 | Observation poisoning 4-layer | ✅ | L894-898 상세 4-layer (10KB, control char, prompt hardening, classification) |
| M5 | 30-day TTL | ✅ | L900-902 정책 정의됨 (reflected=true 30일, unprocessed 유지) |
| M6 | Advisory lock + confidence | ✅ | L912 pg_advisory_xact_lock, L913 confidence ≥ 0.7 |
| M7 | /ws/office limits | ✅ | L937 "50conn/company, 500/server, 10msg/s" |
| M8 | External API key | 📌 deferred | Architecture에서 결정 (합리적) |
| M9 | Phase 5 UX states (Sally) | ❌ 미수정 | Feature 5-1~5-4 모두 empty/loading/error 상태 부재 유지 |
| M10 | observations 스키마 depth | ⚠️ 부분 | reflected/reflected_at 추가됨. confidence/importance/domain/indexes 미추가 |
| M11 | Migration numbering | ⚠️ 신규 충돌 | L905=0061_enum ✅, BUT L828=0061_personality ❌ — 동일 번호 다른 파일 (FIX가 도입한 신규 불일치) |

**MINOR (4건 → 3건 해소, 1건 deferred)**

| # | Issue | 상태 |
|---|-------|------|
| m12 | L147/L148 표기 | ✅ L148 완전 교정됨 |
| m13 | Multi-LLM Phase 5→6 | ✅ L970 "Phase 6 (Vision 테이블 일치)" |
| m14 | N8N_DISABLE_UI | 📌 deferred |
| m15 | Planning soul-enricher.ts 귀속 | ✅ L917 명시 |

### 신규 잔존 이슈 (4건)

**Residual-1 [D3/D5] L828 vs L905 — migration 0061 번호 충돌 (FIX가 도입)**
- L828 (Feature 5-3): `0061_add_personality_traits.ts`
- L905 (Feature 5-4): `0061_extend_memory_type_enum.ts`
- 동일 번호에 다른 파일. Tech Research 순서(0061=enum, 0063=personality)가 정답.
- 수정안: L828 → `0063_add_personality_traits.ts`

**~~Residual-2~~ [RESOLVED by Fix 16] observations 스키마 Tech Research 완전 통합**
- L876: `confidence REAL NOT NULL DEFAULT 0.5` ✅ (L913 self-contradiction 해소)
- L875: `importance INTEGER NOT NULL DEFAULT 5` ✅ (Park et al. sum > 150 트리거)
- L874: `domain VARCHAR(50) NOT NULL DEFAULT 'conversation'` ✅ (반성 크론 도메인 그룹핑)
- L870: `company_id UUID REFERENCES companies(id)` ✅ (VARCHAR→UUID FK)
- L880: `observed_at TIMESTAMPTZ` ✅ (created_at와 구분)
- L884-888: 5개 인덱스 (company, agent, unreflected partial, domain, HNSW) ✅

**Residual-3 [D2] Phase 5 전 기능 UX 상태 미정의 (Sally)**
- OpenClaw: WS 끊김 시 UI? 에이전트 0명 빈 상태?
- n8n: Docker OOM 시 관리 페이지? 워크플로우 0개?
- Memory: reflection 크론 실패 시? observations 0건?
- Big Five: 저장 실패 시?
- 이 이슈는 Scope 단계에서는 MINOR 수준 — Architecture 또는 UX Design 단계에서 상세화 가능

**Residual-4 [D5] L702 CEO quote "변경 없음" 잔존**
- L702: "> 규칙: 기존 엔진(agent-loop.ts) 변경 없음" (CEO 인용)
- L944: "최소 수정만 허용 — soul-enricher.ts 1행 훅 삽입만" (절대 규칙)
- CEO 결정 인용 vs 상세 규칙. Context 상 혼란 가능성 낮으나 first-read confusion 잠재

### 검증 후 점수

| 차원 | Pre-fix | Post-fix (15) | Post-fix (16) | 근거 |
|------|---------|---------------|---------------|------|
| D1 구체성 | 8 | 8 | 8 | 변동 없음. |
| D2 완전성 | 5 | 7 | **8** | Fix 16: confidence/importance/domain/indexes 추가. 잔존: UX 상태만(R3, UX Design 이관) |
| D3 정확성 | 5 | 7 | **8** | Fix 16: confidence 자기모순 해소. 잔존: L828/L905 migration 충돌만(R1) |
| D4 실행가능성 | 7 | 8 | **8** | 스키마 완전 — SQL 복붙 수준. |
| D5 일관성 | 4 | 7 | **7** | L828 migration(R1) + L702 quote(R4) 잔존. |
| D6 리스크 | 6 | 8 | **8** | 변동 없음. |

### 가중 평균: 7.85/10 ✅ PASS (Fix 16 반영)

계산: (8×0.10) + (8×0.25) + (8×0.15) + (8×0.10) + (7×0.15) + (8×0.25) = 0.80 + 2.00 + 1.20 + 0.80 + 1.05 + 2.00 = **7.85**

> **Score History:** 6.15 (Cycle 1 초기) → 5.60 (cross-talk 후) → 7.45 (post-fix 15건) → **7.85 (post-fix 16건)** ✅ PASS

---

## 수정 제안 요약 (16건 — cross-talk 후 확장)

### 아키텍처 수정 (가장 중요)
1. **L870-880 별도 `reflections` 테이블 삭제** → Brief Option B 준수: `agent_memories` memoryTypeEnum에 'reflection' 추가 + `embedding vector(1024)` 컬럼 추가 (Tech Research L891, L1721, L1861 패턴)
2. **L148**: "observations/reflections 신규 2테이블" → "observations 신규 테이블 + agent_memories memoryType 확장"
3. **L908**: "DB 신규 테이블: observations + reflections" → "observations 테이블 + agent_memories 확장"
4. **Migration 번호**: Tech Research 순서 채택 (0061=enum, 0062=observations, 0063=personality, 0064=embedding, 0065=HNSW)

### 스키마 수정
5. L877: `VECTOR(768)` 이슈 해소 (reflections 테이블 삭제 시 자동 해소. agent_memories embedding은 별도 migration 0064에서 vector(1024)로 추가)
6. observations 스키마에 5개 필드 추가: `confidence`, `importance`, `domain`, `reflected`, `reflected_at` + 4개 인덱스 추가

### agent-loop.ts 통일
7. L702, L725, L963: "변경 없음/읽기만" → "(soul-enricher.ts 1행 훅만)" 통일

### 방어/운영 추가
8. Feature 5-4에 observation content sanitization 4-layer 추가 (max 10KB, control char strip, prompt hardening, content classification — 확정 결정 #8)
9. Feature 5-4에 30일 TTL 정책 + ARGOS 정리 크론 추가 (확정 결정 #5)
10. memory-reflection.ts 설명에 `pg_advisory_xact_lock(hashtext(companyId))` 추가 (확정 결정 #9)
11. Feature 5-1 /ws/office에 연결 제한(50/company, 500/server) + 레이트 리밋(10 msg/s) 추가 (확정 결정 #10)

### 기타
12. 외부 API 키 저장 전략 정의 (n8n credential store? CORTHEX DB? 암호화?)
13. Phase 5 전 기능에 UX 상태(empty/loading/error) 정의 추가
14. L944 "Phase 5" → "Phase 6" (Vision L935와 일치)
15. Feature 5-2에 N8N_DISABLE_UI=false 보안 완화 조치 명시
16. L893 planning 로직 → "soul-enricher.ts에서 처리" 명시 (+ `agent_memories` WHERE memoryType='reflection' 검색으로 교정)
