---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - _research/tool-reports/05-caching-strategy.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/v1-feature-spec.md
workflowType: 'product-brief'
project_name: 'corthex-v2'
epic: 'Epic 15 — 3-Layer Caching'
user_name: 'ubuntu'
date: '2026-03-11'
author: ubuntu
---

# Product Brief: Epic 15 — 3-Layer Caching

> CORTHEX v2 AI 직원 관리 플랫폼의 비용 절감 및 응답 속도 향상을 위한 3단계 캐싱 전략

<!-- Content will be appended sequentially through collaborative workflow steps -->

---

## Executive Summary

CORTHEX v2는 AI 직원(에이전트)이 사용자 요청을 처리할 때마다 Claude API를 호출한다. 현재는 매 호출마다 동일한 Soul(시스템 프롬프트, 4,000~8,000 토큰)과 도구 정의(1,000~3,000 토큰)를 전송하며 풀 가격($3/MTok input)으로 과금된다. 또한 주가·뉴스·법률 같은 외부 도구 결과도 짧은 시간 내 동일 조건 재호출이 빈번하고, 유사한 사용자 질문에도 매번 전체 LLM 추론이 실행된다.

Epic 15는 3단계 캐싱 레이어를 순서대로 도입하여 이 비용 구조를 근본적으로 개선한다:

1. **Prompt Caching** (Story 15.1) — `engine/agent-loop.ts`에서 Soul에 `cache_control: { type: 'ephemeral' }` 추가. 시스템 프롬프트 비용 **85% 절감**. **전제조건: Claude Agent SDK `query()`에서 `cache_control` ContentBlock 지원 여부 PoC 검증 필요 (Story 15.1 시작 전). 실패 시 대안: `anthropic.messages.create` 직접 호출.**
2. **Tool Result Caching** (Story 15.2) — `lib/tool-cache.ts`에 인메모리 Map 기반 `withCache()` 래퍼 생성. 도구별 TTL 설정(주가 1분, 웹검색 30분, 법률 24시간). **MAX 10,000 항목 + LRU 교체 정책** 적용. 외부 API 호출 횟수 대폭 감소.
3. **Semantic Caching** (Story 15.3) — pgvector의 `semantic_cache` 테이블을 활용한 유사 질문 응답 재사용. cosine similarity > 0.95 시 LLM 호출 없이 즉시 반환. **에이전트별 `enableSemanticCache` 플래그로 실시간 데이터 에이전트(주가·뉴스) 제외.** 전체 LLM 비용 **추가 ~73% 절감 (히트율 40~60% 기준, 30일 데이터 축적 후)**.

예상 총 운영 비용 절감: **60~80%** (복합 적용 기준). 월 $27+ 낭비 → **Prompt Cache(15.1) 단독: $5~8/월** / **3레이어 완전 적용 안정기: $2~4/월** (100회/일, Soul 4,000 토큰 기준, 30일+ 데이터 축적 후).

---

## Core Vision

### Problem Statement

CORTHEX v2 AI 에이전트는 매 사용자 요청마다 동일한 Soul + 도구 정의를 포함한 전체 시스템 프롬프트를 Claude API에 전송한다. 이는 반복적이고 불필요한 토큰 과금을 발생시킨다.

**구체적 낭비 규모:**

> **기준:** 에이전트 1명 × 하루 100 호출 (v1 실측 데이터 미수집 → 추정값. 실제 환경에 따라 다를 수 있음)

| 낭비 유형 | 현재 비용 | 근거 |
|-----------|----------|------|
| Soul 4,000 토큰 × 100회/일 | $0.60/일 ($18/월) | Claude Sonnet, $3/MTok input (에이전트 1명 기준) |
| 도구 정의 2,000 토큰 × 100회/일 | $0.30/일 ($9/월) | 동일 |
| **Soul + 도구 정의 합산** | **$0.90/일 ($27/월)** | 캐싱만으로 절감 가능한 순수 낭비 (에이전트 1명 기준) |
| 외부 API 중복 호출 (주가·검색) | 추가 외부 API 비용 | 5분 내 동일 조건 에이전트 10개 동시 호출 (v1 `/전체` 패턴) |
| 동일/유사 질문 LLM 재추론 | 전체 LLM 호출 비용 | FAQ성 질문 매번 수 초 재처리 |

현재 아키텍처 결정 D8은 **"캐싱 없음 (Phase 1~4)"** — 이는 DB 쿼리 캐싱에 대한 결정이었으며 (`architecture.md` D8: "24GB 서버, 12쿼리 × 1ms = 12ms (LLM 응답 대비 0.1%)"), Claude API 토큰 캐싱과 도구 결과 캐싱은 D8 적용 범위 밖이다. Epic 15는 D8을 위반하지 않으면서 별도 캐싱 레이어를 추가한다.

또한 아키텍처 결정 **D13 ("캐싱 전략 — 에이전트 100명+ 시 Phase 5+ 재검토")** 을 Epic 15에서 조기 구현한다. **조기 해제 근거:** Prompt Caching은 에이전트 수와 무관하게 단 1줄 수정으로 즉각 절감 가능하다. 에이전트 1명이어도 하루 100 호출 시 $27/월 낭비가 실시간 발생하며, 구현 비용(수 시간)이 절감 효과(수 달 내 회수)보다 압도적으로 낮다. D13 조기 해제는 D8 위반이 아닌 별도 레이어 추가이며, `architecture.md` D13은 Epic 15 완료 시 "Claude API Prompt Caching은 Phase 1부터 적용 (Epic 15.1)"으로 업데이트 필요.

### Problem Impact

**1. 재무적 영향:**
- 에이전트 수 증가(현재 N명 → 확장 시 수십 명)에 따라 API 비용이 에이전트 수에 **선형 비례하여 증가**
- Soul 변경 없이도 매 호출마다 동일 토큰 반복 과금 → 월 $27+ 구조적 낭비 (Soul + 도구 정의, 100회/일 기준)
- 외부 API 요금(주가 kr_stock, 뉴스 search_news, 공시 dart_api) 불필요한 중복 소비
- 에이전트 50명 운영 시 순수 Soul 반복 과금만 월 $1,350+ 예상 (확장 시 사업성 위협)

**2. 성능 영향:**
- Prompt Caching 미적용 시 TTFT(Time To First Token) 불필요하게 연장
  - Anthropic 공식: 캐시 히트 시 TTFT **~85% 단축** (읽기 비용 기본 × 0.1로 처리 대폭 감소)
- Tool Cache 미적용 시 동시 에이전트 10개가 같은 주가 데이터를 10회 병렬 API 호출
- 유사 FAQ 질문도 매번 수 초의 LLM 추론 시간 소비 → Hub 사용자 UX 저하

**3. 확장성 영향:**
- 캐싱 없이 에이전트 50명+ 운영 시 Claude CLI Max 토큰 소진 속도 비례 증가 (CLI Max $220/월 × 2개 = $440/월 한도)
- 캐싱으로 동일 예산 내 처리 가능 에이전트 요청 수 2~5배 증가 가능
- 에이전트 확장성 = 플랫폼 핵심 가치 → 캐싱이 확장성의 전제 조건

### Why Existing Solutions Fall Short

| 기존 접근 | 문제점 |
|-----------|--------|
| D8 "캐싱 없음" 결정 | DB 쿼리 캐싱(12ms) 기준의 결정 — Claude API 토큰 비용(85% 절감 가능)은 전혀 다른 차원 |
| 수동 비용 절감 (Soul 축소) | Soul 품질 저하 → 에이전트 역할 수행 능력 감소 → 서비스 핵심 가치 훼손 |
| 에이전트 수 제한 | CORTHEX v2 핵심 가치(동적 조직 자유 CRUD)와 정면 충돌 |
| Redis 즉시 도입 | Phase 1~3는 단일 서버(24GB, 4코어) → 인메모리 Map으로 충분. Redis는 불필요한 인프라 복잡도 |
| OpenAI / 타 LLM 전환 | Claude CLI Max 구독 기반 아키텍처 — 대체 불가 |

### Proposed Solution

**3단계 순차 구현 전략 (참조: `05-caching-strategy.md` §6 구현 우선순위):**

> **스토리 번호 = 구현 순서** (구현 쉬운 것부터: 15.1 → 15.2 → 15.3). 런타임 실행 순서는 아래 흐름도 참조 (Semantic → Prompt → Tool).

```
사용자 메시지 수신
  ↓
[1. Semantic Cache 확인] ← agent.enableSemanticCache === true인 에이전트만 (Story 15.3)
  → FAQ/정책 에이전트: cosine similarity > 0.95 시 캐시 반환 (비용 $0, 응답 ≤ 100ms)
  → 실시간 데이터 에이전트 (주가·뉴스): enableSemanticCache=false → 이 단계 건너뜀
  → 미스 또는 건너뜀? ↓
[2. Prompt Cache 적용] ← Claude API cache_control: { type: 'ephemeral' } (Story 15.1)
  → Soul + 도구 정의 캐시됨 (비용 기본 × 0.1, TTFT 85% 단축)
  → LLM 추론 실행
  ↓
[3. 도구 호출 시 Tool Cache 확인] ← 인메모리 Map TTL, MAX 10,000 항목 + LRU (Story 15.2)
  → 히트? → 캐시된 도구 결과 사용 (외부 API 미호출)
  → 미스? → 실제 API 호출 후 결과 캐시 저장
  ↓
[4. 응답 완성]
  → enableSemanticCache=true 에이전트면 Semantic Cache에 저장 (다음 유사 질문 대비)
  → 사용자에게 반환
```

**Semantic Cache 적합/부적합 쿼리 유형:**

| 적합 (`enableSemanticCache: true`) | 부적합 (`enableSemanticCache: false`) |
|------------------------------------|---------------------------------------|
| FAQ 성격의 반복 질문 | 실시간 데이터 (주가 kr_stock, 뉴스 search_news) |
| 회사 정책/규정 안내 | 개인화된 분석 요청 (맥락 의존성 높음) |
| 일반 지식 질문 | 창의적 콘텐츠 생성 (generate_image 등) |
| 정형화된 보고서 요청 | 복잡한 추론 필요 (다단계 핸드오프) |

**구현 난이도 대비 효과:**

| Story | 난이도 | 변경 규모 | 즉각 효과 |
|-------|--------|----------|----------|
| 15.1 Prompt Caching | **낮음** (PoC 후 확정) | SDK PoC 검증 + `cache_control` 추가 (PoC 통과 시 수 시간, 실패 시 `messages.create` 직접 호출로 대체) | Soul 토큰 비용 85% 절감, TTFT 85% 단축 |
| 15.2 Tool Result Caching | 낮음 | 신규 파일 1개 (`lib/tool-cache.ts`) + 캐시 대상 도구 핸들러 N개 수정 (TTL 설정 포함, 7개 대표 도구 우선) | 외부 API 중복 호출 제거 |
| 15.3 Semantic Caching | 중간 | DB 마이그레이션 + 신규 파일 (`engine/semantic-cache.ts`) | LLM 호출 ~73% 추가 절감 (히트율 40~60% 기준, 30일 후 효과 측정) |

### Key Differentiators

1. **SDK PoC 후 최소 변경으로 85% 절감 (Story 15.1)** — PoC 통과 시 `engine/agent-loop.ts` 단 1곳 수정. 별도 인프라, 서비스, 환경변수 불필요. SDK PoC 실패 시에도 `anthropic.messages.create` 대안 경로로 동일 효과 달성 가능.
2. **기존 pgvector 재활용 (Story 15.3)** — Epic 10에서 구축한 pgvector + Gemini Embedding 인프라를 Semantic Caching에 그대로 활용. Redis, Pinecone, Qdrant 등 별도 벡터 DB 불필요. 추가 인프라 비용 $0.
3. **도구별 맞춤 TTL + 메모리 상한 (Story 15.2)** — 주가(1분)·뉴스(15분)·법률(24시간) 등 데이터 갱신 주기 맞춤 TTL. TTL=0으로 `get_current_time`, `generate_image` 캐시 제외. **MAX 10,000 항목 + LRU 교체 정책 + 1분 주기 만료 정리** → 24GB 서버에서 최대 ~100MB 사용 (0.4%).
4. **E8 경계 완전 준수** — Semantic Cache 로직(`engine/semantic-cache.ts`)이 `engine/` 내부에만 존재. `agent-loop.ts`를 통해서만 접근 가능. 기존 보안 아키텍처(Hook 파이프라인) 무손상. `lib/tool-cache.ts`는 engine/ 밖 lib/에 위치 (E8 적용 범위 외).
5. **멀티테넌시 자동 격리** — Tool Cache 키에 `companyId` 포함, Semantic Cache는 `getDB(ctx.companyId)` 패턴 준수. 회사 간 캐시 오염 구조적 불가.
6. **D8/D13 결정 확장, 위반 아님** — DB 쿼리 캐싱(D8/D13 범위) 제외, Claude API 토큰 캐싱(D8/D13 범위 외) 도입. D13 조기 해제 근거: 에이전트 수와 무관하게 단 1줄로 즉각 $27/월 낭비 제거 가능.
7. **Soul 업데이트 시 캐시 무효화 정책 (명시적 결정)** — 관리자가 Soul 편집 시 Prompt Cache는 최대 5분 TTL 자연 만료 허용 (즉시 무효화 불필요, 5분 내 응답 품질 차이 수용 범위). Tool Cache는 Soul과 무관 (도구 파라미터 기반 키). Semantic Cache는 Soul 변경과 무관 (쿼리-응답 쌍 저장).
8. **Semantic Cache 초기 vs 안정기 절감 효과** — Day 1: 히트율 0% (데이터 축적 시작). 30일 후: 히트율 ~40~60% (FAQ성 질문 기준). 60~80% 총 절감은 안정기(30일+) 기준 목표값.

---

## Target Users

### Primary Users

**페르소나 1: 김운영 — 운영 관리자 (Admin), 비용 책임자**

- **배경:** IT 스타트업 운영팀장, 40대 초반. 월말마다 Anthropic 대시보드를 열어 CEO에게 Claude API 청구서를 보고한다. 기술 배경 있으나 소스 코드 수정은 안 함. CORTHEX v2 어드민 콘솔로 에이전트 생성·Soul 편집·티어 설정까지 담당.
- **현재 고통:**
  - 이번 달 API 청구서: $340. 지난달: $310. "에이전트 3개밖에 안 추가했는데 왜 12% 올랐지?" — 원인 파악 불가
  - `usage.cache_read_input_tokens` 필드가 응답에 있다는 것 자체를 모름. Anthropic 대시보드에 Prompt Cache 히트율 항목이 있지만 읽은 적 없음
  - 에이전트 30명 운영 계획 중이지만 "지금 비용 구조로 30명 하면 월 $1,000+ 넘을 것 같아 못 하겠다" — 확장 주저
  - /전체 명령어(v1의 6-에이전트 동시 실행)를 CEO가 자주 쓰는데, 그 순간 kr_stock이 6번 동시 호출됨을 모름
- **성공 기준:**
  - Story 15.1 배포 1주 후: Anthropic 대시보드에서 `cache_read_input_tokens`가 전체 input_tokens의 70%+ 차지 확인
  - Story 15.2 배포 후: CORTHEX admin 로그에서 Tool Cache 히트율 ≥ 40% 확인 (kr_stock 1분 내 재호출 제거). **Story 15.2 scope 포함: `log.info({ event: 'tool_cache_hit', toolName, companyId })` 구현 필요 — 미구현 시 히트율 측정 불가.**
  - 성공 순간: "에이전트 30명 추가해도 비용이 5명 수준이다 → 확장 결정"

---

**페르소나 2: 이주임 — Hub 사용자, 일반 직원**

- **배경:** 동일 회사 영업팀 대리, 30대 초반. 매일 오전 CORTHEX Hub에서 AI 직원들에게 업무를 요청한다. 기술 배경 없음. "AI가 알아서 해주면 되지" 수준.
- **현재 고통:**
  - "아까 출장비 처리 규정 물어봤는데, 팀장도 같은 거 물어봐서 또 5초 기다렸어" — Semantic Cache 없어서 FAQ 질문에도 매번 LLM 추론
  - 오전 9시에 "우리 팀 영업 보고서 양식이 어떻게 돼?" → AI가 5초 만에 답변. 오후에 팀원이 "보고서 양식 어디 있어?" → 또 5초 대기 → "같은 질문인데 왜 또 기다려요?" 민원
  - 주가 조회 1분 안에 3번 시 매번 외부 kr_stock API 응답 대기 (Tool Cache 없어서 — 실시간 데이터는 Semantic Cache 미적용 에이전트)
- **Epic 15 이후 경험:**
  - 오전 9:00 "출장비 처리 규정이 어떻게 돼?" → LLM 호출 5초 응답 + Semantic Cache 저장 (TTL 24시간, `enableSemanticCache=true` 정책 안내 에이전트)
  - 오전 9:45 "출장비 신청 방법 알려줘" → Semantic Cache 히트 (similarity 0.96) → **50ms 즉시 응답**
  - "반복 질문은 바로 나오네!" → 체감 속도 개선 확인. 주가는 여전히 실시간 (kr_stock 에이전트는 enableSemanticCache=false 유지)
- **성공 기준:** FAQ성 반복 질문 응답 시간 ≤ 100ms. Hub UI 캐시 표시 방식은 UX 설계 단계에서 별도 결정 예정 (MVP에서는 미구현).

### Secondary Users

**페르소나 3: AI 에이전트 자체 (간접 수혜자)**

- **역할:** CORTHEX v2 AI 직원들 — 비서실장, CIO, CFO, 법무팀장 등 수십 명의 에이전트
- **간접 수혜:**
  - Prompt Cache 적용 시 Soul 로딩 TTFT 85% 단축 → 사용자가 "전송" 버튼 누른 후 첫 응답 토큰 도착 시간 대폭 감소
  - Tool Cache: TTL 내 동일 파라미터 재호출 시 외부 API 미호출로 처리 속도 향상 (장애 시 fallback은 설계 범위 외 — 미설계 기능)
  - Semantic Cache가 없는 에이전트(실시간 데이터 담당)는 변화 없음 — 기존 정확성 보장

**페르소나 4: BMAD 개발자 워커 (구현자)**

- **배경:** Story 15.1~15.3을 구현할 팀 워커 에이전트. TypeScript + Bun 환경. engine/ 아키텍처 이해하고 있음.
- **요구사항:**
  - `withCache(toolName, ttlMs, fn)` API가 명확해야 새 도구 추가 시 래퍼 적용 5분 이내 완료
  - `engine/semantic-cache.ts`가 `getDB(companyId)` 패턴을 따라야 E8 경계 자동 준수
  - Story 15.1 시작 전 SDK PoC 결과가 문서화되어 있어야 `cache_control` 파라미터 형식 오류 없이 구현 가능
  - TEA 테스트 케이스(bun:test)가 Tool Cache 히트/미스/TTL 만료/LRU 교체를 명확히 구분해야 회귀 방지
  - **`enableSemanticCache` 구현 요구사항 (Story 15.3):** `agents` 테이블에 `enable_semantic_cache BOOLEAN DEFAULT FALSE` 컬럼 추가 (DB 마이그레이션 필요). Admin 콘솔에서 에이전트별 토글 설정 가능. 기본값 `false` — 명시적 opt-in 방식 (실시간 데이터 에이전트 자동 보호).
- **성공 기준:** Story 15.1~15.3 구현 완료 후 `bun test` 전체 통과, `npx tsc --noEmit` 에러 0건.

### User Journey

**운영 관리자 (김운영)의 여정 — Story 15.1 배포 후 1주:**

| 단계 | 행동 | 시스템 반응 | 결과 |
|------|------|------------|------|
| **Discovery** | Anthropic 대시보드에서 월 청구서 확인 | `cache_read_input_tokens` 필드 처음 발견 | "이게 뭐지?" — 개발자에게 물어봄 |
| **이해** | 개발자로부터 "Soul이 캐시됐다는 뜻, 비용 85% 절감" 설명 | `cost_tracker` Hook 서버 로그에서 `cache_read_cost` 필드 확인 (admin UI 미노출 — 서버 로그 직접 조회 또는 Anthropic 대시보드) | "매달 $20+ 절감이네?" — 관심 증가 |
| **측정** | 1주 후 비용 비교: `cost_tracker` Hook 로그 조회 | Soul 토큰 비용 $0.09/일 (기존 $0.60/일 대비) | **85% 절감 수치 직접 확인** — 신뢰 확보 |
| **확장 결정** | "에이전트 30명 추가해도 Soul 비용은 거의 안 늘겠네" | API 비용 선형 증가 → 로그 기반 절감 비례 | 에이전트 확장 의사결정 → CORTHEX 도입 확대 |

**Hub 사용자 (이주임)의 여정 — Story 15.3 완료 2주 후 (FAQ 에이전트, `enableSemanticCache=true`):**

| 단계 | 행동 | 시스템 반응 | 결과 |
|------|------|------------|------|
| **첫 사용** | 오전 9:00 "출장비 처리 규정이 어떻게 돼?" | LLM 호출 → 5초 응답 + Semantic Cache 저장 (TTL 24시간) | 정상 사용, 캐시 저장 인지 못함 |
| **반복 질문** | 오전 9:45 팀원이 "출장비 신청 방법 알려줘" | Semantic Cache 히트 (similarity 0.96) → **50ms 즉시 응답** | "어? 엄청 빠른데?" — 체감 속도 개선 |
| **다음날** | 다음날 오전 "출장비 규정 다시 알려줘" | TTL 24시간 내 → 캐시 히트 → 50ms 응답 | 일관된 빠른 응답, 신뢰 형성 |
| **TTL 만료 후** | 24시간 후 동일 질문 → TTL 만료 → LLM 재호출 (정책 변경 여부와 무관하게 자동 갱신) | 최신 규정으로 갱신된 응답 | "최신 내용 맞게 나오네" — 정확성 신뢰 |
| **정착** | "FAQ 질문은 AI한테 바로 물어보면 되겠다" | 반복 질문 패턴 증가 → Semantic Cache 히트율 상승 | Hub 일일 사용량 증가, UX 만족도 향상 |

**개발자 워커의 여정 — Story 15.1~15.3 구현:**

| Story | 단계 | 행동 | 결과 |
|-------|------|------|------|
| **15.1** | PoC | SDK query()에 ContentBlock 배열 전달 테스트 | 통과 시: `agent-loop.ts` 수정 진행 / 실패 시: `anthropic.messages.create` 대안 경로 |
| **15.1** | 구현 | `systemPrompt` 형식 `string` → `ContentBlock[]` 변경 | `npx tsc --noEmit` 에러 0건 확인 |
| **15.1** | 검증 | 동일 에이전트 연속 2회 호출 → `cache_read_input_tokens` 확인 | > 0이면 캐시 히트 증명 → Story 완료 |
| **15.2** | 구현 | `lib/tool-cache.ts` 생성 + 대표 7개 도구 핸들러에 `withCache()` 래퍼 적용 (TTL 설정) | `log.info({ event: 'tool_cache_hit' })` 로깅 포함 — 히트율 측정 가능 |
| **15.2** | 검증 | TTL 내 동일 파라미터 재호출 → mock 호출 횟수 = 1 확인 | TTL 만료 후 mock 호출 = 2 → Story 완료 |
| **15.3** | DB 마이그레이션 | `semantic_cache` 테이블 + ivfflat 인덱스 생성. `agents.enable_semantic_cache` 컬럼 추가 (DEFAULT FALSE) | Admin 콘솔에서 에이전트별 토글 확인 |
| **15.3** | 구현 | `engine/semantic-cache.ts` 생성 (E8 경계 내). `agent-loop.ts`에 Semantic Cache check → save 통합 | E8 경계 검사: `engine-boundary-check.sh` 통과 |
| **15.3** | 검증 | FAQ 에이전트 `enableSemanticCache=true` 설정 → 동일 쿼리 재입력 → `cacheHit: true` 반환 확인 | companyId 격리 통합 테스트 통과 → Story 완료 |

---

## Success Metrics

Epic 15 캐싱 효과를 측정하는 핵심 지표. **측정 가능한 수치 + 측정 방법 + 측정 시점** 3가지를 모두 포함한다.

| 지표 | 측정 방법 | 목표값 | 측정 시점 |
|------|----------|--------|----------|
| Prompt Cache 단위 절감율 | 캐시 히트 1건의 Soul 비용 / 미캐시 동일 호출 Soul 비용 (서버 로그 `cache_read_cost` vs `input_cost`) | **≥ 85% per hit** (Anthropic 공식 — 캐시 읽기 = 기본 × 0.1). **전제: Stop Hook usage 타입에 `cache_read_input_tokens` 필드 추가 필요 (Story 15.1 scope)** | Story 15.1 배포 후 24시간 |
| Prompt Cache 히트율 | `usage.cache_read_input_tokens` > 0 호출 수 / 전체 동일 에이전트 호출 수 (서버 로그) | ≥ 70% **(동일 에이전트 5분 내 연속 재호출 세션 기준)**. 100회/일 기준 평균 간격 14.4분 > TTL 5분 → 세션 패턴 확인 후 1시간 TTL 전환 여부 결정. | Story 15.1 배포 후 1주 |
| Prompt Cache 실효 절감율 | 전체 기간 Soul 비용 절감 = 히트율 × 85%. 히트율 70% 시 ~60%, 90% 시 ~76% | ≥ 60% (1주, ephemeral TTL 기준) → ≥ 80% (30일, 1시간 TTL 전환 후) | Story 15.1 배포 후 1주, 30일 |
| Tool Cache 히트율 | `log.info({ event: 'tool_cache_hit', toolName, companyId })` 카운트 / 전체 도구 호출 수 | ≥ 20% (1주 초기) → **≥ 40% (30일 안정기)** | Story 15.2 배포 후 1주, 30일 |
| Semantic Cache 히트율 | `semantic_cache_hit` + `semantic_cache_miss` 로그 카운트 비율 **(Story 15.3 scope: `log.info({ event: 'semantic_cache_miss' })` 구현 필요)** | ≥ 15% (2주 초기) → ≥ 40% (30일 후) | Story 15.3 배포 후 2주, 30일 |
| 전체 월 API 비용 절감 | Anthropic 대시보드 월별 청구 비교 (Epic 15 배포 전후, 에이전트 수 변화 보정) | ≥ 40% (2주) → ≥ 60% (30일+ 안정기) | Epic 15 완료 후 2주, 3개월 |
| TTFT 개선 | Prompt Cache 히트 시 첫 응답 토큰 도착 시간. **기준선: Story 15.1 배포 직전 1주 평균 TTFT 측정 후 비교.** | 기존 대비 **≥ 85% 단축** (Anthropic 공식 — 캐시 히트 시 입력 처리 비용 기본 × 0.1) | Story 15.1 배포 전/후 |
| FAQ 응답 시간 | Semantic Cache 히트 시 전체 응답 완료 (`done` 이벤트) 시간 | ≤ 100ms | Story 15.3 배포 후 1주 |
| 캐싱 장애 시 서비스 연속성 | 캐시 레이어 예외 발생 후 LLM 정상 호출 여부 (`bun test` graceful fallback 테스트) | 서비스 중단 0건 | 상시 |
| 멀티테넌시 격리 | 다른 companyId에서 동일 쿼리 → 캐시 미공유 (통합 테스트) | 교차 접근 0건 | Story 15.2, 15.3 배포 직후 |

### Business Objectives

**BO-1: 월 Claude API 운영 비용 절감**
- 목표: Epic 15 완료 후 3개월 기준 월 API 비용 60% 이상 절감
- 기준선: Soul 토큰 $18/월 + 도구 정의 $9/월 = $27/월 구조적 낭비 (에이전트 1명 × 100회/일 기준, 추정값)
- 수치 목표: $27/월 → $5~8/월 (Prompt Cache 단독) / $2~4/월 (3레이어 복합, 안정기)
- 측정: Anthropic 대시보드 월별 청구 비교. 에이전트 수 변화 보정 필요.

**BO-2: 에이전트 확장성 확보 (사업성)**
- 목표: 에이전트 수 증가 시 API 비용 증가율이 에이전트 수 증가율보다 낮아야 함 (캐싱 없을 때는 선형 비례)
- 근거: Prompt Cache는 에이전트별 Soul 비용의 85%를 세션 내 히트 시 고정 절감 → 에이전트 추가 시 Soul 비용 증가 완화. CLI Max $440/월 한도 내 처리 가능 요청 수 증가.
- 측정: **실제 에이전트 확장 이벤트 발생 시 분기 리뷰** — 에이전트 수 변화 전후 월 API 비용 증가율 추이 관찰 (통제된 실험은 라이브 시스템에서 불가). 기준값: 에이전트 1명 추가 시 API 비용 증가율 < $27/월 (= 캐싱 전 Soul + 도구 비용).

**BO-3: 응답 품질 무결성 유지**
- 목표: 캐싱 도입 후에도 응답 품질 동등 수준 유지
- 측정: Epic 12 A/B 테스트 프레임워크로 캐시 히트 응답 vs LLM 응답 품질 비교. 사용자 민원(Hub 피드백) 증가율 0%.
- 안전장치: `enableSemanticCache=false` 설정으로 실시간 데이터 에이전트 완전 제외. 캐시 레이어 예외 시 graceful fallback.

**BO-4: 인프라 안정성 (24GB 단일 서버)**
- 목표: Tool Cache 인메모리 Map < 100MB (10,000 항목 × 평균 10KB). 서버 OOM 발생 0건.
- 측정: Bun 프로세스 메모리 모니터링 (`process.memoryUsage()`). LRU 교체 1분 주기 cleanup 동작 확인.

### Key Performance Indicators

**KPI-1: Story 15.1 즉각 효과 (배포 후 24시간 내)**
- 지표: Claude API 응답 `usage.cache_read_input_tokens` > 0
- 측정: **동일 에이전트 5분 내 2회 연속 호출** 후 서버 로그 확인 (단순 1회 > 0 아님 — 세션 내 실제 재호출 시나리오)
- PASS 기준: 두 번째 호출의 `cache_read_input_tokens` > 0 (캐싱 활성화 증명). **전제: Stop Hook usage 타입에 `cache_read_input_tokens`, `cache_creation_input_tokens` 필드 추가 완료 후 측정 가능.**
- FAIL 기준: 항상 0이면 SDK PoC 결과와 불일치 → 대안(anthropic.messages.create) 전환 결정

**KPI-2: Story 15.1 비용 효과 (배포 후 1주)**
- 지표: 캐시 히트 건의 단위 절감율 + 전체 기간 실효 절감율
- 측정: `cost_tracker` Stop Hook에서 `cache_read_input_tokens × $0.30/MTok` (캐시 읽기 비용) vs `input_tokens × $3/MTok` (미캐시 비용) 비교. **전제: Stop Hook `usage` 타입에 `cache_read_input_tokens`, `cache_creation_input_tokens` 필드 추가 (Story 15.1 scope 포함).**
- PASS 기준 (단위): 캐시 히트 건 Soul 토큰 비용 ≤ 15% of 미캐시 동일 호출 (= 85% per-hit 절감)
- PASS 기준 (기간): 1주 전체 Soul 비용 절감율 ≥ 60% (ephemeral TTL 5분 기준 히트율 × 85%)
- 달성 불가 시: TTL 설정 확인 — 히트율 부족이면 1시간 TTL 전환 검토 (에이전트 5분+ 미사용 구간 다발)

**KPI-3: Story 15.2 Tool Cache 효과 (배포 후 1주)**
- 지표: Tool Cache 히트율 + 메모리 사용량
- 측정: `log.info({ event: 'tool_cache_hit', toolName, companyId })` 카운트 / 전체 도구 호출 수. `process.memoryUsage()` 모니터링.
- PASS 기준: 히트율 ≥ 20% (초기 1주, 데이터 축적 중) + 메모리 < 100MB
- 주요 체크: `kr_stock` 1분 내 재호출 시 두 번째부터 캐시 히트 확인

**KPI-4: Story 15.3 Semantic Cache 효과 (배포 후 2주, 30일)**
- 지표: Semantic Cache 히트율 + companyId 격리
- 측정: **`log.info({ event: 'semantic_cache_hit' })` + `log.info({ event: 'semantic_cache_miss', companyId, similarity: bestSimilarity })` 카운트 비율** (Story 15.3 scope 포함 — miss 로그 없으면 히트율 = hit/(hit+miss) 분모 불명으로 측정 불가). 다른 companyId 간 교차 접근 건수.
- PASS 기준 (2주): 히트율 ≥ 15% (FAQ 데이터 축적 중), companyId 교차 접근 0건
- PASS 기준 (30일): 히트율 ≥ 40%, 월 API 비용 ≥ 40% 절감

**KPI-5: Epic 15 전체 완료 지표 (배포 후 3개월)**
- 지표: 총 월 API 비용 절감율 + 에이전트 확장성 추이
- 측정: Anthropic 대시보드 3개월 전후 비교. 에이전트 수 변화 보정: `(실제 비용 / 에이전트 수)` 단위 비용 추이 관찰.
- PASS 기준: ≥ 60% 절감 (안정기 기준)
- 에이전트 확장성 추이: **실제 에이전트 확장 이벤트 발생 시 분기 리뷰로 추이 관찰** (통제된 실험 불가 — 라이브 시스템에서 에이전트 수를 임의로 조작할 수 없음). 목표: 에이전트 1명 추가 시 월 API 비용 증가 < $5 (= 캐싱 전 $27/월 대비 80% 이상 절감된 단위 비용)

---

## MVP Scope

### Core Features

Epic 15 MVP는 **3개 Story 순차 구현**으로 완성된다. 각 Story는 독립적으로 배포·검증 가능하며, 이전 Story 완료 후 다음 Story 진행.

**Story 15.1 — Prompt Caching (MVP P0):**
- **수정 파일 2개**: `engine/agent-loop.ts` (`systemPrompt` 형식 `string` → `ContentBlock[]` + `cache_control: { type: 'ephemeral' }`) + `engine/types.ts` (Stop Hook E2 usage 타입 확장)
- **전제조건 (구현 시작 전):** Claude Agent SDK `query()` 메서드에서 `cache_control` ContentBlock 전달 PoC 검증. 실패 시 `anthropic.messages.create` 직접 호출로 대체.
- Stop Hook E2 `usage` 타입 확장: `cacheReadInputTokens?: number`, `cacheCreationInputTokens?: number` 추가 (KPI-1, KPI-2 측정 전제조건)
- 대상: 모든 에이전트 (Soul + 도구 정의 자동 캐싱). ephemeral TTL(5분) 기본. 1시간 TTL 전환은 배포 후 히트율 모니터링 후 수동 결정.
- 예상 효과: Soul 토큰 비용 단위 절감 ≥ 85% per hit, TTFT ≥ 85% 단축

**Story 15.2 — Tool Result Caching (MVP P1):**
- 신규 파일 `lib/tool-cache.ts` 생성: `withCache(toolName, ttlMs, fn)` 래퍼 함수 + 인메모리 Map + **MAX 10,000 항목 + LRU 교체 정책 + 1분 주기 만료 정리**
- 7개 대표 도구 핸들러에 `withCache()` 적용: `kr_stock`(1분), `search_news`(15분), `search_web`(30분), `dart_api`(1시간), `law_search`(24시간), `get_current_time`(0, 캐시 없음), `generate_image`(0, 캐시 없음)
- **도구 캐시 기본 정책: `withCache()` 미래퍼 도구 = 캐시 없음 (기존 동작 유지).** 신규 도구 추가 시 `lib/tool-cache-config.ts` TTL 등록 테이블에 수동 명시 필요. 실시간/창의적 도구는 `ttlMs=0` 명시적 설정.
- 캐시 키: `${companyId}:${toolName}:${JSON.stringify(params)}` — 멀티테넌시 격리 보장
- `log.info({ event: 'tool_cache_hit', toolName, companyId })` 로깅 포함 (KPI-3 측정 필수)
- 예상 효과: 동일 파라미터 TTL 내 재호출 시 외부 API 미호출, 메모리 < 100MB (24GB 서버)

**Story 15.3 — Semantic Caching (MVP P2):**
- DB 마이그레이션 (단일 파일, 2개 변경 원자적 적용): `semantic_cache` 테이블 (`query_embedding VECTOR(768)` ← **Gemini text-embedding-004 실제 차원, `schema.ts:1555` 확인**, `response TEXT`, `company_id UUID NOT NULL`, `created_at TIMESTAMPTZ`, `ttl_hours INT DEFAULT 24`) + **hnsw (vector_cosine_ops) 인덱스** (Epic 10 `knowledge_docs_embedding_idx`와 동일 패턴, `0049_pgvector-extension.sql:10-11` 확인). `agents` 테이블 `enable_semantic_cache BOOLEAN DEFAULT FALSE` 컬럼 추가.
- `db/scoped-query.ts` 확장 (E3 패턴 준수): `findSemanticCache(companyId, embedding, threshold)` + `insertSemanticCache(companyId, ...)` 메서드 추가 — 현재 `getDB()` 프록시에 vector search 메서드 없음, Story 15.3 scope에 포함.
- 신규 파일 `engine/semantic-cache.ts` 생성 (E8 경계 내): `checkSemanticCache(companyId, query)` + `saveToSemanticCache(companyId, query, response)`. cosine similarity threshold 0.95 **AND** `created_at > NOW() - ttl_hours * INTERVAL '1 hour'` 조건. Gemini Embedding 재활용 (Epic 10 `embedding-service.ts`, 768차원).
- **캐시 레이어 예외 처리 필수**: `engine/semantic-cache.ts` + `lib/tool-cache.ts`의 모든 캐시 작업은 `try/catch` 로 감싸고, 예외 발생 시 경고 로그 + LLM/원본 함수 fallback (캐시 레이어 예외가 에이전트 세션 전체 중단을 유발하지 않도록). 외부 API 장애 시 stale-on-error는 미설계.
- `agent-loop.ts` 통합: Semantic Cache check → Prompt Cache + LLM 추론 → Semantic Cache save (`enableSemanticCache=true` 에이전트만)
- **영향 패키지**: `packages/server` (engine/semantic-cache.ts + API endpoint + Drizzle migration) + `packages/admin` (에이전트 편집 페이지 `enableSemanticCache` toggle UI)
- **`.github/scripts/engine-boundary-check.sh` 업데이트 (Story 15.3 scope)**: 기존 E8 체크 스크립트에 `engine/semantic-cache` 패턴 추가: `check_pattern "from.*engine/semantic-cache" "Direct semantic-cache import from outside engine/"` — 미추가 시 CI가 E8 위반을 탐지 못함
- Admin 콘솔에서 에이전트별 `enableSemanticCache` 토글 설정 가능
- `log.info({ event: 'semantic_cache_hit' })` + `log.info({ event: 'semantic_cache_miss', companyId, similarity: bestSimilarity })` 로깅 (KPI-4 측정 필수)
- 예상 효과: FAQ 에이전트 반복 질문 ≤ 100ms, 전체 LLM 비용 추가 ~73% 절감 (히트율 40~60% 기준, 30일 후)

### Out of Scope for MVP

명시적으로 MVP에서 제외되는 기능들:

| 제외 항목 | 이유 | 재검토 시점 |
|-----------|------|------------|
| Redis 전환 | Phase 1~3 단일 서버(24GB) → 인메모리 Map으로 충분. Redis는 불필요한 인프라 복잡도. | Phase 4+ (다중 서버 배포 시) |
| Hub UI ⚡ 캐시 배지 | UX 설계 단계에서 별도 결정 예정. MVP 기능에 영향 없음. | UX 설계 Sprint |
| Admin UI `cache_read_cost` 직접 표시 | Anthropic 대시보드 + 서버 로그로 측정 가능. Admin UI 개발 공수 대비 이익 낮음. | Epic 16+ 운영 대시보드 기획 시 |
| 1시간 TTL 자동 전환 로직 | 에이전트별 호출 빈도 데이터 없음. 배포 후 히트율 모니터링 후 수동 결정. | Story 15.1 배포 30일 후 데이터 확인 |
| Semantic Cache 에이전트별 TTL 커스터마이징 | FAQ/정책 에이전트는 24시간 고정으로 충분. 개별 설정 UI 미필요. | 사용자 요청 시 |
| Cache warming (사전 로딩) | 초기 데이터 없어서 효과 없음. 30일+ 축적 후 의미 있음. | Story 15.3 배포 30일 후 |
| stale-on-error (외부 API 장애 시 만료 캐시 반환) | 미설계 기능. 외부 API 장애 → 에러 전파. 캐시 레이어 자체 예외는 try/catch fallback으로 처리 (Story 15.2/15.3 scope). | 별도 안정성 Epic |
| 실시간 캐시 히트율 Admin 대시보드 | 서버 로그로 측정 가능. MVP 기간은 수동 모니터링. | 운영 대시보드 Epic |
| Semantic Cache 에이전트별 격리 (agent_id 컬럼) | **현재 구현: 동일 companyId 내 에이전트 간 캐시 공유됨 (agent_id 없음, 의도적 설계).** FAQ 답변은 회사 전체 공유가 자연스럽고 히트율 향상에 유리. 에이전트별 격리 필요 시 Phase X에서 agent_id 컬럼 추가. | 에이전트별 격리 요건 발생 시 |
| 분산 캐시 (Distributed) | 단일 서버 아키텍처. 다중 서버 전환 시 Redis와 함께 재설계. | Phase 5+ |

### MVP Success Criteria

MVP 완료 조건 — **전부 충족해야 Epic 15 Done으로 인정:**

| 기준 | 측정 방법 | PASS 조건 |
|------|----------|----------|
| Story 15.1 빌드 통과 | `npx tsc --noEmit -p packages/server/tsconfig.json` | 에러 0건 |
| Story 15.1 캐시 활성화 | 동일 에이전트 5분 내 2회 연속 호출 → 서버 로그 | 두 번째 호출 `cache_read_input_tokens` > 0 |
| Story 15.2 Tool Cache 동작 | TTL 내 동일 파라미터 재호출 → mock 호출 횟수 확인 | 2번째 호출 = 캐시 히트 (외부 API mock 1회) |
| Story 15.2 메모리 안정성 | 10,000 항목 삽입 후 LRU 교체 + 메모리 측정 | `process.memoryUsage()` < 100MB, 항목 수 ≤ 10,000 |
| Story 15.3 Semantic Cache 동작 | FAQ 에이전트 `enableSemanticCache=true` → 동일 쿼리 재입력 | `cacheHit: true` 반환, 응답 ≤ 100ms |
| Story 15.3 멀티테넌시 격리 | 다른 companyId에서 동일 쿼리 실행 | 교차 히트 0건 |
| E8 경계 준수 | `.github/scripts/engine-boundary-check.sh` 실행 (Story 15.3에서 `engine/semantic-cache` 패턴 추가 후) | 위반 0건 |
| Story 15.3 Admin 빌드 통과 | `npx tsc --noEmit -p packages/admin/tsconfig.json` | 에러 0건 |
| 전체 테스트 통과 | `bun test` 실행 | 기존 회귀 0건, 신규 15.1~15.3 테스트 전부 통과 |
| KPI-1 즉각 효과 | Story 15.1 배포 24시간 내 | Prompt Cache 단위 절감율 ≥ 85% per hit |
| KPI-2 비용 절감 초기 검증 | `cost_tracker` 로그 1주 집계 | Soul 토큰 실효 절감율 ≥ 60% (ephemeral TTL, 세션 내 히트율 × 85%) |
| KPI-3 Tool Cache 초기 | Story 15.2 배포 1주 | Tool Cache 히트율 ≥ 20% |

### Future Vision

**2~3년 후 캐싱 인프라 발전 방향:**

Epic 15 MVP는 단일 서버·인메모리 중심·수동 모니터링 체계다. 성공 검증 후 단계적으로 확장:

**Phase 4 (단기 — 다중 서버 배포 시, 에이전트 수 무관):**
- **Redis 전환**: **단일 서버에서는 에이전트 50명+에서도 인메모리 Map 유지 (< 100MB 한도).** 다중 서버 배포 전환 시 프로세스 간 캐시 공유를 위해 Redis로 이전. `lib/tool-cache.ts` 인터페이스(withCache API) 유지, 구현체만 교체.
- **1시간 TTL 자동 전환**: 에이전트별 호출 빈도 임계값 데이터(15.1 배포 30일+ 축적) 기반 자동화. 기준: 1시간에 5회+ 호출 에이전트 → 자동으로 1시간 TTL 전환.
- **Admin UI 캐시 모니터링**: `cache_read_input_tokens`, Tool Cache 히트율, Semantic Cache 히트율을 Admin 콘솔에서 실시간 확인 + 비용 절감 금액 직접 표시.

**Phase 5 (중기 — 플랫폼 성숙 후):**
- **Hub UI ⚡ 배지**: Semantic Cache 히트 시 Hub 채팅 UI에 캐시 표시 (UX 설계 단계 별도 결정). 사용자가 "이 답변은 캐시에서 가져왔음"을 인지 → 정보 투명성 확보.
- **Cache warming**: FAQ 에이전트 배포 시 자주 쓰는 질문 목록을 사전 로딩 → cold start 히트율 개선. 30일 데이터 축적 후 상위 100개 질문 자동 워밍.
- **에이전트별 Semantic Cache TTL 커스터마이징**: Admin 콘솔에서 에이전트별 TTL 직접 설정 (현재 24시간 고정 → 에이전트 특성별 조정 가능).
- **캐시 히트 품질 자동화**: Epic 12 A/B 테스트 프레임워크와 연동 — 캐시 히트 응답 품질을 LLM 응답과 자동 비교. 품질 저하 감지 시 해당 캐시 엔트리 자동 무효화.

**Phase 6 (장기 — 엔터프라이즈/글로벌):**
- **분산 Semantic Cache**: 글로벌 다중 리전 배포 시 pgvector 클러스터 → 지역별 캐시 전파. 해외 고객사 지원.
- **임베딩 모델 교체 시 자동 무효화**: **임베딩 모델**(현재: Gemini `text-embedding-004`) 교체 시 벡터 공간 변화 → Semantic Cache 전체 무효화 + 재생성 파이프라인. Claude Sonnet→Opus 등 LLM 교체는 임베딩 공간에 영향 없어 캐시 무효화 불필요.
- **비용 예측 대시보드**: 에이전트 추가 계획 입력 시 예상 API 비용 자동 산출 (히트율 × 단위 절감율 모델 기반). 운영 관리자(김운영)가 확장 결정 전 사전 비용 시뮬레이션 가능.

---

## Technical Constraints & Dependencies

### 아키텍처 제약사항

| 제약 | 상세 | 출처 |
|------|------|------|
| 단일 진입점 | 모든 에이전트 실행 → `engine/agent-loop.ts` (Hook bypass 불가) | architecture.md E1 |
| DB 접근 패턴 | `getDB(ctx.companyId)` 전용. 비즈니스 로직에서 직접 `db` import 금지 | architecture.md E3 |
| engine/ 공개 API | `engine/agent-loop.ts` + `engine/types.ts` 만 외부 import 허용 | architecture.md E8 |
| SDK 핀 버전 | `@anthropic-ai/claude-agent-sdk` exact 버전 고정 (^ 금지). PoC 재실행 후 수동 업데이트 | architecture.md |
| 멀티테넌시 | 모든 캐시 키/쿼리에 `companyId` 포함 필수. 회사 간 데이터 격리 | architecture.md E3 |
| TypeScript | `npx tsc --noEmit -p packages/server/tsconfig.json` 에러 0건 필수 (CI 배포 차단) | CLAUDE.md |

### Story 간 의존성

```
Story 15.1 (Prompt Cache)
  전제: SDK PoC 검증 (실패 시 anthropic.messages.create 대안)
  전제: E2 Stop Hook usage 타입 확장 (cacheReadInputTokens, cacheCreationInputTokens)
  ↓
Story 15.2 (Tool Cache) — 15.1과 독립적, 병렬 구현 가능
  전제: lib/tool-cache-config.ts TTL 등록 테이블 설계
  ↓
Story 15.3 (Semantic Cache) — 15.1 완료 후 권장 (agent-loop.ts 통합 필요)
  전제: db/scoped-query.ts findSemanticCache + insertSemanticCache 확장
  전제: agents 테이블 enable_semantic_cache 컬럼 (DB 마이그레이션)
  전제: packages/admin enableSemanticCache toggle UI
```

### 외부 의존성

| 의존성 | 현재 상태 | Epic 15 사용처 |
|--------|----------|--------------|
| Claude Agent SDK `@anthropic-ai/claude-agent-sdk` | 고정 버전 사용 중 | Story 15.1: cache_control PoC 검증 필요 |
| Gemini `text-embedding-004` | Epic 10에서 구축 완료 (`embedding-service.ts`) | Story 15.3: 768차원 벡터 생성 |
| pgvector extension | Epic 10 마이그레이션 완료 (`0049_pgvector-extension.sql`) | Story 15.3: semantic_cache 테이블 |
| Anthropic API pricing | $3/MTok input, $0.30/MTok cache read | KPI-2 비용 계산 기준 |

### 기술 위험 요소

| 위험 | 확률 | 완화 방안 |
|------|------|----------|
| SDK `cache_control` 미지원 | 중간 | PoC 실패 시 `anthropic.messages.create` 직접 호출로 전환 (동일 효과) |
| Tool Cache 메모리 초과 | 낮음 | MAX 10,000 + LRU + 1분 cleanup. `process.memoryUsage()` 모니터링 |
| Semantic Cache cosine similarity 임계값 과적합 | 중간 | 0.95 시작, 오탐/미탐 비율 모니터링 후 0.90~0.98 조정 |
| DB migration 실패 (pgvector 컬럼 추가) | 낮음 | 단일 파일 원자적 적용. Drizzle migration rollback 준비 |
| companyId 캐시 오염 | 매우 낮음 | 캐시 키 + DB 쿼리 모두 companyId 포함 구조적 강제 |

---

## Implementation Notes for BMAD Workers

### Story 15.1 구현 가이드

**PoC 검증 방법 (구현 시작 전 필수):**
```typescript
// packages/server/src/engine/agent-loop.ts — PoC 테스트
// SDK query()는 AsyncIterator → for await 패턴 필수 (await query() 직접 접근 불가)
let cacheReadTokens = 0
for await (const event of query({
  systemPrompt: [{           // string → ContentBlock[] 시도
    type: 'text',
    text: renderedSoul,
    cache_control: { type: 'ephemeral' },
  }],
  // ... 나머지 파라미터
})) {
  if (event.type === 'message_stop' && event.usage) {
    cacheReadTokens = event.usage.cacheReadInputTokens ?? 0
  }
}
// PoC 통과 조건: 두 번째 호출에서 cacheReadTokens > 0
// 실패(ContentBlock 타입 오류) 시: anthropic.messages.create 직접 호출로 전환
// 주의: 정확한 event 타입은 SDK 버전에 따라 다를 수 있음 — PoC에서 실제 event 구조 확인 후 조정
```

**Stop Hook E2 타입 확장 (KPI 측정 전제조건):**
```typescript
// packages/server/src/engine/types.ts — E2 usage 타입 확장
type StopHookUsage = {
  inputTokens: number
  outputTokens: number
  cacheReadInputTokens?: number      // 추가
  cacheCreationInputTokens?: number  // 추가
}
```

### Story 15.2 구현 가이드

**TTL 등록 테이블 패턴:**
```typescript
// packages/server/src/lib/tool-cache-config.ts (신규)
export const TOOL_CACHE_TTL: Record<string, number> = {
  kr_stock: 60_000,        // 1분
  search_news: 900_000,    // 15분
  search_web: 1_800_000,   // 30분
  dart_api: 3_600_000,     // 1시간
  law_search: 86_400_000,  // 24시간
  get_current_time: 0,     // 캐시 없음
  generate_image: 0,       // 캐시 없음
  // 신규 도구 추가 시 여기에 수동 등록 필수. 미등록 = 캐시 없음
}
```

**캐시 레이어 예외 처리 필수 패턴:**
```typescript
// withCache 내부 — 캐시 예외가 서비스 중단을 유발하지 않도록
// Phase 4 Redis 전환 대비: cacheStore를 별도 객체로 분리 권장
// const cacheStore = { get, set, delete } → Redis 전환 시 cacheStore 교체만으로 withCache() API 유지 가능
try {
  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.data
} catch (e) {
  log.warn({ event: 'tool_cache_error', toolName, err: e })
  // fallback: 캐시 무시하고 원본 함수 호출
}
const result = await fn(params, ctx)
if (ttlMs > 0) cache.set(key, { data: result, expiresAt: Date.now() + ttlMs })
return result
```

### Story 15.3 구현 가이드

**`db/scoped-query.ts` 확장 (E3 패턴 — 구현 전 반드시 추가):**
```typescript
// 기존 getDB() 프록시에 vector search 메서드 추가 필요
findSemanticCache(companyId: string, embedding: number[], threshold: number): Promise<SemanticCacheRow | null>
insertSemanticCache(companyId: string, data: SemanticCacheInsert): Promise<void>
```

**Semantic Cache 조회 조건 (TTL + 유사도 동시 적용):**
```sql
SELECT response FROM semantic_cache
WHERE company_id = $1
  AND 1 - (query_embedding <=> $2) >= 0.95   -- cosine similarity ≥ 0.95
  AND created_at > NOW() - ttl_hours * INTERVAL '1 hour'
ORDER BY query_embedding <=> $2
LIMIT 1
```

**인덱스 생성 SQL (Epic 10 hnsw 패턴 동일):**
```sql
CREATE INDEX semantic_cache_embedding_idx
  ON semantic_cache USING hnsw (query_embedding vector_cosine_ops);
-- ivfflat + 기본 operator class(vector_l2_ops) 조합 시 cosine 쿼리에서 인덱스 미활용 → 전체 테이블 스캔
```

**E8 경계 검증 (Story 15.3 scope에서 engine-boundary-check.sh 패턴 추가 후 스크립트 실행, 또는 아래 grep 직접 실행):**
```bash
# engine/semantic-cache.ts를 agent-loop.ts 외부에서 import하면 E8 위반
grep -r 'engine/semantic-cache' packages/server/src --include='*.ts' \
  | grep -v 'engine/agent-loop.ts' \
  | grep -v 'engine/semantic-cache.ts'
# 결과 0줄 = E8 OK. 1줄+ = E8 VIOLATION → 즉시 수정
```

**Agent Loop 통합 순서:**
```
1. enableSemanticCache=true? → checkSemanticCache(companyId, query)
   → 히트: 즉시 반환 (LLM 호출 없음)
   → 미스/오류: 계속
2. Prompt Cache 적용된 LLM 호출 (cache_control: ephemeral)
3. Tool 호출 시 withCache() 자동 적용
4. enableSemanticCache=true? → saveToSemanticCache(companyId, query, response)
```

### 공통 주의사항

- **`companyId` 누락 금지**: 모든 캐시 작업(키 생성, DB 쿼리)에 companyId 포함 필수
- **`bun test` 전체 통과 후 커밋**: 기존 테스트 회귀 0건 필수
- **`npx tsc --noEmit` 에러 0건**: `packages/server` + `packages/admin` 양쪽 검증 필수. 타입 오류 있으면 배포 실패 (GitHub Actions CI). Story 15.3 완료 시 `npx tsc --noEmit -p packages/admin/tsconfig.json` 추가 실행 (enableSemanticCache toggle UI 타입 검증)
- **Story 완료 조건**: 단위 테스트 통과 + TypeScript 에러 0건 + 실제 캐시 동작 확인 (mock 아님)
