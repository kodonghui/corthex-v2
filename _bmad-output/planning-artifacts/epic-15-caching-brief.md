---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - _research/tool-reports/05-caching-strategy.md
  - _bmad-output/planning-artifacts/architecture.md
workflowType: 'product-brief'
project_name: 'corthex-v2'
epic: 'Epic 15 — 3-Layer Caching'
user_name: 'ubuntu'
date: '2026-03-11'
author: ubuntu
---

# Product Brief: Epic 15 — 3-Layer Caching

> CORTHEX v2 AI 직원 관리 플랫폼의 비용 절감 및 응답 속도 향상을 위한 3단계 캐싱 전략

---

## Executive Summary

CORTHEX v2는 AI 직원(에이전트)이 사용자 요청을 처리할 때마다 Claude API를 호출한다. 현재는 매 호출마다 동일한 Soul(시스템 프롬프트, 4,000~8,000 토큰)과 도구 정의(1,000~3,000 토큰)를 전송하며 풀 가격($3/MTok input)으로 과금된다. 또한 주가·뉴스·법률 같은 외부 도구 결과도 짧은 시간 내 동일 조건 재호출이 빈번하며, 유사한 사용자 질문에도 매번 전체 LLM 추론이 실행된다.

Epic 15는 3단계 캐싱 레이어를 순서대로 도입하여 이 비용 구조를 근본적으로 개선한다:

1. **Prompt Caching** (Story 15.1) — `engine/agent-loop.ts`에서 Soul에 `cache_control: { type: 'ephemeral' }` 1줄 추가. 시스템 프롬프트 비용 **85% 절감**. 즉시 적용 가능, 인프라 변경 없음.
2. **Tool Result Caching** (Story 15.2) — `lib/tool-cache.ts`에 인메모리 Map 기반 `withCache()` 래퍼 생성. 도구별 TTL 설정(주가 1분, 웹검색 30분, 법률 24시간). 외부 API 호출 횟수 대폭 감소.
3. **Semantic Caching** (Story 15.3) — pgvector의 `semantic_cache` 테이블을 활용한 유사 질문 응답 재사용. cosine similarity > 0.95 시 LLM 호출 없이 즉시 반환. 전체 LLM 비용 **추가 ~73% 절감**.

예상 총 운영 비용 절감: **60~80%** (복합 적용 기준).

---

## Core Vision

### Problem Statement

CORTHEX v2 AI 에이전트는 매 사용자 요청마다 동일한 Soul + 도구 정의를 포함한 전체 시스템 프롬프트를 Claude API에 전송한다. 이는 반복적이고 불필요한 토큰 과금을 발생시킨다.

**구체적 낭비 규모:**

| 낭비 유형 | 현재 비용 | 근거 |
|-----------|----------|------|
| Soul 4,000 토큰 × 100회/일 | $0.60/일 ($18/월) | Claude Sonnet, $3/MTok |
| 도구 정의 2,000 토큰 × 100회/일 | $0.30/일 ($9/월) | 동일 |
| 외부 API 중복 호출 (주가·검색) | 추가 API 비용 | 5분 내 동일 조건 재호출 |
| 동일/유사 질문 LLM 재추론 | 전체 LLM 비용 | FAQ성 질문 반복 처리 |

현재 아키텍처 결정 D8은 **"캐싱 없음 (Phase 1~4)"** — 이는 DB 쿼리 캐싱에 대한 결정이었으며, Claude API 토큰 캐싱과 도구 결과 캐싱은 D8 범위 밖이다. Epic 15는 D8을 위반하지 않으면서 별도 캐싱 레이어를 추가한다.

### Problem Impact

**1. 재무적 영향:**
- 에이전트 수 증가(현재 N명 → 확장 시 수십 명)에 따라 API 비용이 선형 증가
- Soul 변경 없이도 매 호출마다 동일 토큰 반복 과금 → 월 $27+ 낭비 (100회/일 기준)
- 외부 API 요금(주가, 뉴스 서비스) 불필요한 중복 소비

**2. 성능 영향:**
- Prompt Caching 미적용 시 TTFT(Time To First Token) 불필요하게 길어짐
  - 캐시 히트 시 TTFT ~85% 단축 (Anthropic 공식 문서 기준)
- Tool Cache 미적용 시 동일 주가 데이터를 10회 반복 조회 (에이전트 10개 동시)
- 유사 FAQ 질문도 매번 수 초의 LLM 추론 시간 소비

**3. 확장성 영향:**
- 에이전트 수 증가 → 비용/응답시간 비례 증가 → 수익성 악화
- 캐싱 없이 에이전트 50명+ 운영 시 월 API 비용이 사업성을 위협

### Why Existing Solutions Fall Short

| 기존 접근 | 문제점 |
|-----------|--------|
| D8 "캐싱 없음" 결정 | DB 쿼리 캐싱 기준의 결정 — Claude API 토큰 캐싱은 고려 안 됨 |
| 수동 비용 절감 (Soul 축소) | Soul 품질 저하 → 에이전트 역할 수행 능력 감소 |
| 에이전트 수 제한 | 기능 축소 → 플랫폼 가치 하락 |
| Redis 도입 | Phase 1~3는 단일 서버 → 과도한 인프라, 복잡도 증가 불필요 |

### Proposed Solution

**3단계 순차 구현 전략:**

```
사용자 메시지 수신
  ↓
[1. Semantic Cache 확인] ← pgvector 유사도 검색 (Story 15.3)
  → 히트? → 캐시된 응답 즉시 반환 (비용 $0, ms 단위)
  → 미스? ↓
[2. Prompt Cache 적용] ← Claude API cache_control (Story 15.1)
  → Soul + 도구 정의 캐시됨 (비용 90% 절감)
  → LLM 추론 실행
  ↓
[3. 도구 호출 시 Tool Cache 확인] ← 인메모리 Map (Story 15.2)
  → 히트? → 캐시된 도구 결과 사용 (외부 API 미호출)
  → 미스? → 실제 API 호출 후 결과 캐시 저장
  ↓
[4. 응답 완성]
  → Semantic Cache에 저장 (다음 유사 질문 대비)
  → 사용자에게 반환
```

### Key Differentiators

1. **1줄 변경으로 85% 절감 (Story 15.1)** — `engine/agent-loop.ts` 수정 1곳만으로 즉각 효과. 인프라 변경 없음, 리스크 최소.
2. **기존 pgvector 재활용 (Story 15.3)** — Epic 10에서 구축한 pgvector 인프라를 Semantic Caching에 그대로 활용. 별도 Redis 불필요.
3. **도구별 맞춤 TTL (Story 15.2)** — 주가(1분)·뉴스(15분)·법률(24시간) 등 데이터 특성에 맞는 TTL 설정. 정확성과 효율성 동시 확보.
4. **E8 경계 준수** — 모든 캐싱 로직이 `engine/agent-loop.ts`를 통과 (Hook 우회 불가). 기존 보안 아키텍처 무손상.
5. **멀티테넌시 격리** — `getDB(ctx.companyId)` 패턴 준수. Semantic Cache를 회사별로 완전 분리. 타사 캐시 오염 불가.

---

## Target Users

### Primary Users

**페르소나 1: 운영 관리자 (Admin)**
- **역할:** CORTHEX v2 플랫폼의 월별 Claude API 비용을 관리하는 책임자
- **현재 고통:** 에이전트 수 증가에 따라 API 청구서가 매월 늘어나는데 왜 그런지 파악하기 어렵다. Soul 변경 없이도 비용이 발생하는 구조적 낭비를 인식하지 못하는 경우가 많다.
- **성공 기준:** 월 API 비용 60~80% 절감 확인 (Admin 대시보드의 `cost_tracker` 데이터). 에이전트 수를 늘려도 비용이 비례 증가하지 않는 구조.

**페르소나 2: AI 에이전트 사용자 (Hub 사용자)**
- **역할:** 허브(Hub)에서 AI 직원에게 업무를 요청하는 직원
- **현재 고통:** 비슷한 질문을 했을 때도 매번 수 초 이상 기다려야 한다. "아까도 이 질문 했는데 왜 또 오래 걸리지?"라는 의문.
- **성공 기준:** Semantic Cache 히트 시 응답 시간 ms 단위. "즉시 답변" 경험. 응답 품질 동일.

### Secondary Users

**페르소나 3: AI 에이전트 자체**
- **역할:** `engine/agent-loop.ts`를 통해 실행되는 CORTHEX v2 AI 직원들
- **간접 수혜:** Prompt Caching 적용 시 TTFT 85% 단축 → 첫 응답 토큰이 빠르게 생성됨. Tool Cache 덕분에 외부 API 실패 위험 감소 (만료된 캐시가 있으면 fallback 가능).

**페르소나 4: 개발자/BMAD 워커**
- **역할:** 향후 스토리를 구현하는 개발자
- **요구사항:** `withCache()` 래퍼가 명확한 API를 가져야 새 도구 추가 시 쉽게 적용 가능. Semantic Cache가 `getDB(companyId)` 패턴을 따라야 멀티테넌시 위반 없이 구현 가능.

### User Journey

**운영 관리자의 여정 (Story 15.1 이후):**
1. **변경 전:** 월말 AWS/Anthropic 청구서 확인 → 예상보다 높은 Claude API 비용 → 원인 불명
2. **Story 15.1 배포 후:** 동일 에이전트 연속 호출 → API 응답의 `cache_read_input_tokens` 증가 확인
3. **Admin 대시보드:** `cost_tracker` Hook이 기록한 비용 데이터 → 월별 절감액 시각화
4. **성공 순간:** "에이전트 30명인데 API 비용은 5명 수준이다" → ROI 확인

**Hub 사용자의 여정 (Story 15.3 이후):**
1. 오전에 "삼성전자 주가 알려줘" 질문 → 일반 속도로 응답
2. 오후에 "삼전 주가 얼마야?" 질문 → Semantic Cache 히트 → 즉시 응답
3. 다음날 "삼성전자 현재 시세?" → 캐시 만료 (1시간 TTL) → 일반 속도로 재응답
4. **성공 순간:** "반복 질문은 바로 답이 나오네" → 업무 효율 향상 체감

---

## Success Metrics

### 핵심 지표

| 지표 | 측정 방법 | 목표값 |
|------|----------|--------|
| Prompt Cache 히트율 | Claude API 응답 `cache_read_input_tokens` / `input_tokens` 비율 | ≥ 70% (5분 내 동일 에이전트 재호출 기준) |
| Prompt Cache 비용 절감율 | 캐시 적용 전/후 Soul 토큰 비용 비교 | ≥ 85% (연구 리포트 기준) |
| Tool Cache 히트율 | `withCache()` 캐시 히트 카운터 / 전체 도구 호출 | ≥ 40% (동시 에이전트 10명+ 기준) |
| Semantic Cache 히트율 | DB `semantic_cache` 조회 시 similarity ≥ 0.95 비율 | ≥ 30% (FAQ성 질문 비율 기준) |
| 전체 API 비용 절감 | 월별 Claude API 청구 비교 | ≥ 50% (복합 캐싱 적용 후 3개월) |
| TTFT 개선 | Prompt Cache 히트 시 첫 응답 토큰까지 시간 | 기존 대비 ≥ 80% 단축 |
| Semantic Cache 응답 시간 | 캐시 히트 시 전체 응답 완료 시간 | ≤ 100ms |

### Business Objectives

1. **월 운영 비용 절감:** Claude API 비용을 Epic 15 완료 후 60% 이상 절감 → 에이전트 확장 시 사업성 확보
2. **에이전트 확장성 확보:** 에이전트 수 2배 증가해도 API 비용 ≤ 1.4배 (캐싱 효과로 선형 증가 방지)
3. **응답 품질 유지:** 캐싱 도입 후에도 A/B 테스트(Epic 12 프레임워크) 기준 응답 품질 동등 유지
4. **인프라 안정성:** 캐싱 레이어 장애 시 graceful fallback → 캐시 없이 정상 LLM 호출 (서비스 중단 없음)

### Key Performance Indicators

**KPI 1 — 즉각 효과 (Story 15.1, 배포 후 24시간 내):**
- Claude API 응답의 `cache_read_input_tokens` 필드 > 0 확인
- 동일 에이전트 2회 연속 호출 시 두 번째 호출의 Soul 토큰 비용 ≤ 15% of 첫 번째

**KPI 2 — Tool Cache 효과 (Story 15.2, 배포 후 1주):**
- `withCache()` 미들웨어 로그에서 히트율 집계
- 동일 주가 조회 5분 내 2회 발생 시 두 번째는 외부 API 미호출 확인

**KPI 3 — Semantic Cache 효과 (Story 15.3, 배포 후 2주):**
- `semantic_cache` 테이블 레코드 수 증가 추이
- 히트율 ≥ 20% 달성 (초기 2주, FAQ 데이터 축적 중)
- companyId 간 캐시 교차 오염 0건 (멀티테넌시 격리 검증)

---

## MVP Scope

### Core Features (3개 Story)

#### Story 15.1 — Prompt Caching (P0, 최우선)

**구현 파일:** `packages/server/src/engine/agent-loop.ts`

**변경 내용:**
```typescript
// Before
systemPrompt: renderedSoul,

// After
systemPrompt: [{
  type: 'text',
  text: renderedSoul,
  cache_control: { type: 'ephemeral' }, // ← 이 1줄
}],
```

**추가 최적화:**
- Soul 업데이트 최소화 정책 — 자주 바뀌는 정보(현재 시간·날짜)는 Soul 밖 배치
- 1시간 내 5회 이상 호출되는 에이전트: TTL `1h` 전환 검토
- 도구 정의도 동일 패턴으로 캐싱 (agent-loop.ts `tools` 파라미터)

**테스트 케이스:**
- [ ] 동일 에이전트 연속 2회 호출 시 `cache_read_input_tokens` > 0 확인
- [ ] Soul 변경 시 캐시 무효화 (새 호출에서 `cache_creation_input_tokens` 발생)
- [ ] 5분 TTL 만료 후 재캐싱 동작 확인
- [ ] 캐싱 적용 전/후 응답 내용 동일성 검증

**완료 기준:** Story 15.1 배포 후 동일 에이전트 연속 호출 시 2번째 이후 Soul 비용 ≤ 15%.

---

#### Story 15.2 — Tool Result Caching (P1)

**신규 파일:** `packages/server/src/lib/tool-cache.ts`

**구현 패턴:**
```typescript
const cache = new Map<string, { data: string; expiresAt: number }>()

export function withCache(
  toolName: string,
  ttlMs: number,
  fn: (params: unknown, ctx: ToolExecContext) => Promise<string>
) {
  return async (params: unknown, ctx: ToolExecContext): Promise<string> => {
    if (ttlMs === 0) return fn(params, ctx) // 캐시 비활성화 도구

    const key = `${ctx.companyId}:${toolName}:${JSON.stringify(params)}`
    const cached = cache.get(key)

    if (cached && cached.expiresAt > Date.now()) {
      return cached.data // 캐시 히트
    }

    const result = await fn(params, ctx)
    cache.set(key, { data: result, expiresAt: Date.now() + ttlMs })
    return result
  }
}
```

**도구별 TTL 설정:**

| 도구 | TTL | 근거 |
|------|-----|------|
| `search_web` | 30분 (1,800,000ms) | 검색 결과 빈번히 변경 안됨 |
| `search_news` | 15분 (900,000ms) | 뉴스 갱신 주기 |
| `kr_stock` | 1분 (60,000ms) | 장중 실시간 필요 |
| `get_current_time` | 0 (캐시 없음) | 항상 최신 필요 |
| `law_search` | 24시간 (86,400,000ms) | 법률 데이터 거의 안 바뀜 |
| `generate_image` | 0 (캐시 없음) | 매번 다른 결과 기대 |
| `dart_api` | 1시간 (3,600,000ms) | 공시 데이터 갱신 빈도 낮음 |

**캐시 키 구조:** `{companyId}:{toolName}:{JSON.stringify(params)}`
- companyId 포함으로 테넌트 간 캐시 격리 자동 보장

**메모리 관리:**
- 주기적 만료 항목 정리 (setInterval 1분, 만료된 엔트리 제거)
- 최대 캐시 사이즈: 10,000건 (LRU 초과 시 오래된 항목 제거)
- 서버 재시작 시 캐시 초기화 (인메모리 특성, 허용 범위)

**테스트 케이스:**
- [ ] TTL 내 동일 도구·파라미터 재호출 시 캐시 히트 확인
- [ ] TTL 만료 후 재호출 시 실제 API 호출 확인
- [ ] companyId 다른 동일 파라미터 → 별도 캐시 항목 (격리 확인)
- [ ] 만료 항목 정리 후 메모리 누수 없음 (10,000건 부하 테스트)
- [ ] TTL=0 도구는 항상 실제 API 호출 확인

---

#### Story 15.3 — Semantic Caching (P2)

**신규 파일:** `packages/server/src/engine/semantic-cache.ts`

**DB 마이그레이션:** `semantic_cache` 테이블 추가

```sql
CREATE TABLE semantic_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  agent_id VARCHAR NOT NULL,
  query_text TEXT NOT NULL,
  query_embedding VECTOR(1536) NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  hit_count INTEGER DEFAULT 0
);

CREATE INDEX ON semantic_cache USING ivfflat (query_embedding vector_cosine_ops)
  WITH (lists = 100);
CREATE INDEX ON semantic_cache (company_id, agent_id, expires_at);
```

**구현 패턴:**
```typescript
// engine/semantic-cache.ts
import { getDB } from '../db/scoped-query'

export async function checkSemanticCache(
  companyId: string,
  agentId: string,
  query: string,
  threshold: number = 0.95
): Promise<string | null> {
  const db = getDB(companyId)
  const embedding = await getEmbedding(query) // Gemini Embedding (Epic 10에서 구축)

  return db.findSimilarCache({ agentId, embedding, threshold, maxAge: '1h' })
}

export async function saveToSemanticCache(
  companyId: string,
  agentId: string,
  query: string,
  response: string,
  ttlHours: number = 1
): Promise<void> {
  const db = getDB(companyId)
  const embedding = await getEmbedding(query)
  await db.insertSemanticCache({ agentId, queryText: query, queryEmbedding: embedding, response, ttlHours })
}
```

**agent-loop.ts 통합:**
```typescript
// engine/agent-loop.ts (Story 15.3 추가)
export async function runAgent(ctx: SessionContext, agent: AgentConfig, message: string) {
  // 1. Semantic Cache 확인 (에이전트별 설정에 따라)
  if (agent.enableSemanticCache) {
    const cached = await checkSemanticCache(ctx.companyId, agent.id, message)
    if (cached) {
      return { type: 'cached', content: cached, costUsd: 0, cacheHit: true }
    }
  }

  // 2. LLM 호출 (Prompt Cache 포함 — Story 15.1)
  const result = await query({ systemPrompt: [{ type: 'text', text: soul, cache_control: { type: 'ephemeral' } }], ... })

  // 3. 응답 Semantic Cache 저장
  if (agent.enableSemanticCache && result.content) {
    await saveToSemanticCache(ctx.companyId, agent.id, message, result.content)
  }

  return result
}
```

**에이전트별 Semantic Cache 설정:**

| 에이전트 유형 | `enableSemanticCache` | 이유 |
|-------------|----------------------|------|
| FAQ 담당 에이전트 | `true` | 반복 질문 多, 정형화된 답변 |
| 회사 정책 안내 에이전트 | `true` | 동일 내용 반복 |
| 실시간 데이터 에이전트 | `false` | 주가·뉴스 등 항상 최신 필요 |
| 창작 에이전트 | `false` | 매번 다른 결과 기대 |
| 복잡한 추론 에이전트 | `false` | 맥락 의존성 높음 |

**테스트 케이스:**
- [ ] 동일 질문 재입력 시 Semantic Cache 히트 (`cacheHit: true` 반환)
- [ ] 의미적 동일 질문 ("삼전 주가" vs "삼성전자 주가") → 히트 (similarity ≥ 0.95)
- [ ] 다른 회사(companyId) 동일 질문 → 캐시 미공유 (격리 확인)
- [ ] 다른 에이전트(agentId) 동일 질문 → 캐시 미공유 (에이전트별 격리)
- [ ] TTL 1시간 만료 후 재질문 → 캐시 미스 → 새 LLM 호출
- [ ] `enableSemanticCache: false` 에이전트 → 항상 LLM 호출

---

### Out of Scope for MVP (Epic 15 제외 항목)

| 항목 | 제외 이유 | 향후 계획 |
|------|----------|----------|
| Redis 전환 | 단일 서버(24GB)에 인메모리 Map으로 충분. 인프라 복잡도 증가 불필요 | Phase 4+ 다중 서버 확장 시 검토 |
| DB 쿼리 캐싱 | D8 결정 유지 — 12쿼리 × 1ms = 12ms (LLM 응답 대비 0.1%) | Phase 5+ 재검토 |
| 캐시 관리 Admin UI | 운영 초기에는 DB 직접 조회로 충분 | Phase 5+ |
| Semantic Cache threshold 동적 조정 | 0.95 고정값으로 시작, 데이터 축적 후 튜닝 | 3개월 운영 후 |
| 크로스-에이전트 Semantic Cache 공유 | 에이전트별 격리가 더 안전. 공유 로직 복잡도 증가 | 검토 후 결정 |
| Prompt Cache 1시간 TTL 자동 전환 | 수동 설정으로 시작 (5회/시간 기준 필요) | 운영 데이터 기반 자동화 |

---

### MVP Success Criteria

Epic 15 완료 기준 (3개 Story 모두 배포 후 2주 측정):

1. **비용 절감 확인:**
   - Story 15.1: Claude API 동일 에이전트 반복 호출 시 Soul 비용 ≤ 15% (기존 대비)
   - Story 15.2: Tool Cache 히트율 ≥ 30% (동시 사용자 5명+ 기준)
   - Story 15.3: Semantic Cache 히트율 ≥ 15% (2주 데이터 축적 후)
   - **전체 월 API 비용 ≥ 40% 절감** (2주 측정 기준, 목표 60%는 3개월)

2. **기능 무결성 확인:**
   - 캐시 히트 응답과 일반 응답의 품질 동등 (Epic 12 A/B 프레임워크 검증)
   - 캐싱 레이어 장애 시 graceful fallback → 서비스 중단 없음
   - 기존 모든 에이전트 기능 정상 동작 (회귀 테스트 통과)

3. **보안 무결성 확인:**
   - companyId 간 캐시 데이터 교차 접근 0건
   - Hook 파이프라인(credential-scrubber, output-redactor)이 캐시 저장 전 실행됨 확인
   - E8 경계 유지 — agent-loop.ts 외부에서 캐시 직접 접근 불가

### Future Vision

**Phase 4+ (다중 서버 확장 시):**
- Tool Result Cache를 Redis로 전환 → 서버 간 캐시 공유
- Semantic Cache를 dedicated vector DB(Pinecone/Qdrant)로 이전 고려
- Cache warming 전략 — 자주 사용되는 Soul 사전 캐싱

**Phase 5+ (지능형 캐싱):**
- 캐시 히트율 기반 TTL 자동 조정 (ML 기반)
- 사용자별 Semantic Cache 개인화
- 멀티 모델 Prompt Cache 전략 (Haiku → Sonnet 위임 시 캐시 재활용)
- 캐시 효율 Admin 대시보드 (히트율, 절감액, 도구별 현황)

**비용 절감 목표 진화:**

| 시점 | 예상 절감율 | 활성 레이어 |
|------|-----------|-----------|
| Story 15.1 완료 | ~40~50% | Prompt Cache |
| Story 15.2 완료 | ~50~60% | + Tool Cache |
| Story 15.3 완료 | ~60~80% | + Semantic Cache |
| Phase 4 (Redis) | ~70~85% | + 서버 간 공유 |

---

## Technical Constraints & Dependencies

### 아키텍처 의존성

| 의존성 | Epic/Story | 상태 |
|--------|-----------|------|
| `engine/agent-loop.ts` 단일 진입점 | Epic 1 | ✅ 완료 |
| `getDB(companyId)` 패턴 | Epic 1 | ✅ 완료 |
| pgvector 인프라 | Epic 10 | ✅ 완료 |
| Gemini Embedding API | Epic 10 | ✅ 완료 |
| E8 엔진 경계 | Epic 14.2 | ✅ 완료 |
| Hook 파이프라인 (5개 Hook) | Epic 14.1 | ✅ 완료 |

### 기술 제약

| 제약 | 영향 |
|------|------|
| Claude Agent SDK 버전 고정 (`@anthropic-ai/claude-agent-sdk@0.2.x`, exact pin) | cache_control 파라미터 지원 여부 PoC 확인 필요 |
| 인메모리 Map (Story 15.2) | 서버 재시작 시 캐시 초기화 허용 (단일 서버이므로 수용) |
| pgvector VECTOR(1536) (Story 15.3) | Gemini Embedding 출력 차원과 일치 확인 필요 |
| 24GB RAM (단일 서버) | Tool Cache Map 최대 10,000건 × 평균 10KB = ~100MB → 수용 가능 |

### 구현 순서 (의존성 기반)

```
Story 15.1 (Prompt Caching)
  → agent-loop.ts 1줄 변경, 독립적
  → 즉시 시작 가능, 가장 높은 ROI

Story 15.2 (Tool Result Caching)
  → lib/tool-cache.ts 신규 생성
  → tool-handlers 각 도구에 withCache() 적용
  → 15.1과 병렬 개발 가능

Story 15.3 (Semantic Caching)
  → DB 마이그레이션 필요 (semantic_cache 테이블)
  → agent-loop.ts 수정 (15.1 이후 진행)
  → Epic 10 pgvector + Gemini Embedding 의존
  → 15.1, 15.2 완료 후 진행 권장
```

---

## D8 결정 업데이트

**기존 D8:** `"캐싱 없음 (Phase 1~4)"`

**수정 제안:**
> "**DB 쿼리 캐싱 없음** (Phase 1~4) — 12쿼리 × 1ms = 12ms (LLM 응답 대비 0.1%). **Claude API Prompt Caching은 Phase 1부터 즉시 적용 (Epic 15.1).** **Tool Result Caching은 인메모리 Map으로 Phase 2부터 (Epic 15.2).** **Semantic Caching은 pgvector 기반 Phase 4부터 (Epic 15.3).** Redis 전환은 Phase 5+ 다중 서버 시 검토."

---

## Implementation Notes for BMAD Workers

### Story 15.1 개발자 체크리스트
- [ ] `engine/agent-loop.ts` 에서 `systemPrompt` 형식 변경 (string → ContentBlock[])
- [ ] Claude API 응답에서 `usage.cache_read_input_tokens`, `usage.cache_creation_input_tokens` 필드 로깅
- [ ] `cost-tracker` Hook에서 캐시 토큰 비용 별도 계산 (캐시 읽기: 기본 비용 × 0.1)
- [ ] SDK PoC: `@anthropic-ai/claude-agent-sdk@0.2.x`에서 cache_control 지원 여부 확인

### Story 15.2 개발자 체크리스트
- [ ] `packages/server/src/lib/tool-cache.ts` 생성
- [ ] 기존 도구 핸들러에 `withCache()` 래퍼 적용 (우선 주요 7개 도구)
- [ ] 캐시 키 포함 companyId 확인 (멀티테넌시)
- [ ] 만료 정리 로직 및 메모리 부하 테스트 (10,000건)

### Story 15.3 개발자 체크리스트
- [ ] `semantic_cache` 테이블 마이그레이션 생성
- [ ] `packages/server/src/engine/semantic-cache.ts` 생성
- [ ] `getDB(companyId)` 패턴 내 `findSimilarCache`, `insertSemanticCache` 메서드 추가
- [ ] `agent.enableSemanticCache` 설정 추가 (agents 테이블 또는 agent 설정)
- [ ] E8 경계 확인: semantic-cache.ts는 engine/ 내부 파일 → 외부 직접 import 금지

---

*작성: 2026-03-11 | 참조: `_research/tool-reports/05-caching-strategy.md`, `_bmad-output/planning-artifacts/architecture.md`*
