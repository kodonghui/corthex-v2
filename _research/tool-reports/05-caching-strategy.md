# 도구 보고서 #5: 캐싱 기술 활용 전략
> CORTHEX v2 AI 직원의 비용 절감과 속도 향상을 위한 캐싱 방안
> 작성일: 2026-03-11 | BMAD 참고용

---

## 1. 개요

### 현재 아키텍처 결정 (D8)
> "캐싱 없음 (Phase 1~4) — 24GB 서버, 12쿼리 × 1ms = 12ms (LLM 응답 대비 0.1%)"

D8은 **DB 쿼리 캐싱**에 대한 결정이었음. 하지만 캐싱은 DB만의 문제가 아님.

### 캐싱이 필요한 3가지 레이어

| 레이어 | 대상 | 절감 효과 | 추천 Phase |
|--------|------|----------|-----------|
| **1. Prompt Caching** | Claude API 호출 시 시스템 프롬프트/Soul | 토큰 비용 90% 절감 | Phase 1 (즉시) |
| **2. Semantic Caching** | 유사 질문에 대한 LLM 응답 재사용 | API 비용 ~73% 절감 | Phase 3+ |
| **3. Tool Result Caching** | 도구 실행 결과 (주가, 날씨 등) | API 호출 횟수 감소 | Phase 2 |

---

## 2. 레이어 1: Prompt Caching (최우선, Phase 1)

### 2.1 왜 즉시 필요한가

CORTHEX v2의 모든 에이전트 호출은 이런 구조:
```
[시스템 프롬프트/Soul: ~2,000~8,000 토큰]  ← 매 호출마다 동일!
[도구 정의: ~1,000~3,000 토큰]              ← 매 호출마다 동일!
[대화 히스토리]                              ← 변동
[사용자 메시지]                              ← 변동
```

Soul + 도구 정의가 매번 동일한데도 매번 풀 가격으로 과금됨.
→ **Prompt Caching 적용 시 이 부분의 비용이 90% 감소**

### 2.2 Claude API Prompt Caching 동작 원리

```
첫 번째 호출:
  [Soul + 도구 정의] → cache_control: { type: "ephemeral" }
  → 캐시 쓰기 (기본 비용 × 1.25)
  → 5분 TTL (또는 1시간 TTL 선택 가능)

이후 5분 내 호출:
  [동일한 Soul + 도구 정의] → 캐시 히트!
  → 기본 비용 × 0.1 (90% 할인)
  → 속도도 ~85% 빨라짐 (TTFT 감소)
```

### 2.3 비용 계산 예시

| 시나리오 | 캐싱 없이 | 캐싱 적용 | 절감 |
|---------|----------|----------|------|
| Soul 4,000 토큰 × 100회/일 | $0.60 | $0.075 + 첫회 $0.0075 = ~$0.09 | **85%** |
| 도구 정의 2,000 토큰 × 100회/일 | $0.30 | ~$0.045 | **85%** |
| **월간 (30일)** | **$27.00** | **$4.05** | **$22.95 절감** |

*기준: Claude Sonnet, input $3/MTok*

### 2.4 구현 방법

#### 방법 A: 자동 캐싱 (2026년 2월~ 기본 활성화)
```typescript
// engine/agent-loop.ts
const result = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 4096,
  // 자동 캐싱: cache_control 필드 추가만 하면 됨
  system: [
    {
      type: 'text',
      text: renderedSoul, // Soul + 도구 인식 + 컨텍스트
      cache_control: { type: 'ephemeral' }, // ← 이 한 줄!
    }
  ],
  tools: agentTools, // 도구 정의도 자동 캐싱 대상
  messages: conversationHistory,
})
```

#### 방법 B: SDK 레벨 자동 캐싱 (Agent SDK 사용 시)
```typescript
// SDK query()는 내부적으로 자동 캐싱 적용
// → 별도 설정 없이 시스템 프롬프트 캐싱됨
// → PoC에서 확인 필요 (SDK 버전에 따라 다를 수 있음)
```

**추천**: 방법 A를 명시적으로 적용. SDK 자동 캐싱 여부와 무관하게 동작 보장.

### 2.5 캐싱 최적화 전략

```
1. 캐시 가능한 콘텐츠를 프롬프트 앞쪽에 배치
   [Soul (캐시됨)] → [도구 정의 (캐시됨)] → [대화 히스토리] → [메시지]

2. Soul 업데이트 최소화
   - Soul 수정 시 캐시 무효화됨
   - 자주 바뀌는 정보 (시간, 날짜)는 Soul 밖에 배치

3. 에이전트별 캐시 분리
   - 각 에이전트의 Soul이 다르므로 자연스럽게 분리됨
   - 동일 에이전트가 짧은 간격으로 여러 번 호출되면 캐시 효과 극대화

4. 1시간 TTL 활용
   - 자주 사용되는 에이전트는 1시간 TTL로 전환
   - 쓰기 비용 2배지만, 읽기 90% 할인이 더 크면 유리
   - 기준: 1시간에 5회 이상 호출되면 1시간 TTL 선택
```

### 2.6 아키텍처 변경

```diff
// engine/agent-loop.ts
export async function runAgent(ctx: SessionContext, agent: AgentConfig) {
  const soul = renderSoul(agent, ctx)
  const tools = getBuiltinTools(agent.allowedTools)

  const result = await query({
    model: selectModel(agent.tier),
-   systemPrompt: soul,
+   systemPrompt: [{
+     type: 'text',
+     text: soul,
+     cache_control: { type: 'ephemeral' },
+   }],
    tools,
    mcpServers: getMcpServers(agent),
    messages: ctx.messages,
  })
}
```

---

## 3. 레이어 2: Semantic Caching (Phase 3+)

### 3.1 개념

"비슷한 질문에는 비슷한 답"을 활용:
```
질문 A: "오늘 삼성전자 주가 알려줘"
→ LLM 호출 → "삼성전자 현재가 87,300원입니다" (캐시 저장)

질문 B: "삼전 주가 얼마야?"
→ 시맨틱 유사도 검사 → 캐시 히트! → LLM 호출 없이 즉시 응답
```

### 3.2 적합한 사용처

| 적합 | 부적합 |
|------|--------|
| FAQ 성격의 반복 질문 | 개인화된 분석 요청 |
| 회사 정책/규정 질문 | 실시간 데이터 (주가, 뉴스) |
| 일반 지식 질문 | 창의적 콘텐츠 생성 |
| 정형화된 보고서 요청 | 복잡한 추론 필요 |

### 3.3 기술 스택

#### 방법 A: Redis LangCache (추천)
| 항목 | 상세 |
|------|------|
| **서비스** | Redis LangCache (관리형) |
| **원리** | 쿼리 임베딩 → 벡터 유사도 검색 → 캐시 반환 |
| **성능** | 캐시 히트 시 ms 단위 응답 |
| **비용** | Redis Cloud 무료 티어 30MB, 유료 $7/월~ |
| **통합** | REST API로 호출 |

#### 방법 B: pgvector 활용 (이미 아키텍처에 포함)
```
- PostgreSQL + pgvector (아키텍처 확정, 의미검색용)
- 별도 Redis 없이 기존 DB 활용 가능
- semantic_cache 테이블 추가:
  query_embedding VECTOR(1536),
  response TEXT,
  created_at TIMESTAMPTZ,
  ttl INTERVAL
- 유사도 검색: cosine similarity > 0.95 → 캐시 히트
```

### 3.4 구현 패턴

```typescript
// engine/semantic-cache.ts (Phase 3)
import { getDB } from '../db/scoped-query'

export async function checkSemanticCache(
  companyId: string,
  query: string,
  threshold: number = 0.95
): Promise<string | null> {
  const db = getDB(companyId)
  const embedding = await getEmbedding(query) // 임베딩 생성

  const cached = await db.findSimilar('semantic_cache', {
    embedding,
    threshold,
    maxAge: '1h', // 1시간 이내 캐시만
  })

  return cached?.response ?? null
}

export async function saveToSemanticCache(
  companyId: string,
  query: string,
  response: string
): Promise<void> {
  const db = getDB(companyId)
  const embedding = await getEmbedding(query)

  await db.insertSemanticCache({
    queryEmbedding: embedding,
    queryText: query,
    response,
    ttl: '1h',
  })
}
```

### 3.5 agent-loop.ts 통합

```typescript
// engine/agent-loop.ts (Phase 3 추가)
export async function runAgent(ctx: SessionContext, agent: AgentConfig) {
  // 1. 시맨틱 캐시 확인 (해당 에이전트가 캐시 대상인 경우만)
  if (agent.enableSemanticCache) {
    const cached = await checkSemanticCache(ctx.companyId, ctx.lastMessage)
    if (cached) {
      return { type: 'cached', content: cached, costUsd: 0 }
    }
  }

  // 2. LLM 호출 (캐시 미스)
  const result = await query({ ... })

  // 3. 응답 캐시 저장
  if (agent.enableSemanticCache) {
    await saveToSemanticCache(ctx.companyId, ctx.lastMessage, result.content)
  }

  return result
}
```

---

## 4. 레이어 3: Tool Result Caching (Phase 2)

### 4.1 개념

도구 실행 결과를 일정 시간 캐싱:
```
10:00 - 에이전트A: kr_stock("삼성전자") → API 호출 → 87,300원 (캐시 5분)
10:02 - 에이전트B: kr_stock("삼성전자") → 캐시 히트! → 87,300원 (API 호출 없음)
10:06 - 에이전트C: kr_stock("삼성전자") → 캐시 만료 → API 재호출
```

### 4.2 적합한 도구

| 도구 | TTL | 이유 |
|------|-----|------|
| `search_web` | 30분 | 검색 결과 빈번히 변경 안됨 |
| `search_news` | 15분 | 뉴스는 비교적 자주 갱신 |
| `kr_stock` | 1분 | 장중에는 실시간 필요 |
| `get_current_time` | 0 (캐시 안함) | 항상 최신 필요 |
| `law_search` | 24시간 | 법률 데이터 거의 안 바뀜 |
| `generate_image` | 0 (캐시 안함) | 매번 다른 결과 기대 |
| `dart_api` | 1시간 | 공시 데이터 갱신 빈도 낮음 |

### 4.3 구현 패턴

```typescript
// lib/tool-cache.ts (Phase 2)
const cache = new Map<string, { data: string; expiresAt: number }>()

export function withCache(
  toolName: string,
  ttlMs: number,
  fn: (params: unknown, ctx: ToolExecContext) => Promise<string>
) {
  return async (params: unknown, ctx: ToolExecContext): Promise<string> => {
    if (ttlMs === 0) return fn(params, ctx) // 캐시 비활성화

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

// 사용:
export const krStock: ToolRegistration = {
  name: 'kr_stock',
  execute: withCache('kr_stock', 60_000, async (params, ctx) => {
    // 실제 API 호출
  })
}
```

### 4.4 메모리 기반 vs Redis 기반

| 기준 | 인메모리 Map | Redis |
|------|-------------|-------|
| 속도 | ~0.01ms | ~1ms |
| 공유 | 단일 프로세스 | 다중 프로세스/서버 |
| 메모리 | 서버 RAM 사용 | 별도 |
| 복잡도 | 매우 낮음 | 중간 |
| **Phase 1~2 추천** | **✅** | ❌ |
| Phase 4+ (다중 서버) | ❌ | ✅ |

**추천**: Phase 1~3은 인메모리 Map, Phase 4+에서 Redis 전환

---

## 5. 이중 캐싱 전략 (Double Caching)

Phase 3 이후 최적의 캐싱 아키텍처:

```
사용자 메시지 수신
  ↓
[1. Semantic Cache 확인] ← pgvector 유사도 검색
  → 히트? → 캐시된 응답 즉시 반환 (0원, ms 단위)
  → 미스? ↓
[2. Prompt Cache 적용] ← Claude API cache_control
  → Soul/도구 정의 캐시됨 (비용 90% 절감)
  → LLM 추론 실행
  ↓
[3. 도구 호출 시 Tool Cache 확인]
  → 히트? → 캐시된 도구 결과 사용
  → 미스? → 실제 API 호출
  ↓
[4. 응답 완성]
  → Semantic Cache에 저장 (다음 유사 질문 대비)
  → 사용자에게 반환
```

### 비용 절감 효과 총합

| 캐싱 레이어 | 절감율 | 대상 |
|------------|--------|------|
| Prompt Caching | ~85% | 시스템 프롬프트 토큰 |
| Semantic Caching | ~73% (히트율 기준) | LLM 호출 전체 |
| Tool Result Caching | 외부 API 비용 | 도구 호출 |
| **복합 적용** | **예상 60~80%** | **전체 운영 비용** |

---

## 6. 구현 우선순위

| 우선순위 | 항목 | Phase | 난이도 | 효과 |
|---------|------|-------|--------|------|
| **P0** | Prompt Caching (cache_control) | Phase 1 | 매우 낮음 (1줄) | 매우 높음 |
| P1 | Tool Result Caching (인메모리) | Phase 2 | 낮음 | 중간 |
| P2 | Semantic Caching (pgvector) | Phase 3 | 중간 | 높음 |
| P3 | Redis 전환 | Phase 4+ | 중간 | 확장성 |

---

## 7. BMAD 개발자 참고사항

### Phase 1 즉시 구현 (1줄 변경)
- `engine/agent-loop.ts`에서 `systemPrompt`에 `cache_control: { type: 'ephemeral' }` 추가
- 이것만으로도 시스템 프롬프트 비용 85~90% 절감
- 별도 인프라 변경 없음

### Phase 2 구현
- `lib/tool-cache.ts` 유틸리티 생성
- 각 도구 핸들러에 `withCache()` 래퍼 적용
- TTL은 도구별로 configurable하게

### Phase 3 구현
- `semantic_cache` 테이블 추가 (pgvector)
- 임베딩 생성 함수 구현 (Claude API 또는 OpenAI embedding)
- `engine/agent-loop.ts`에 시맨틱 캐시 레이어 추가
- 에이전트별 `enableSemanticCache` 설정 추가

### D8 결정 업데이트 제안
기존 D8: "캐싱 없음 (Phase 1~4)"
→ 수정 제안: "DB 쿼리 캐싱 없음 (Phase 1~4). **Prompt Caching은 Phase 1부터 적용.**"

### 테스트 케이스
- [ ] Prompt Caching: 동일 에이전트 연속 호출 시 cache_read_input_tokens 확인
- [ ] Prompt Caching: Soul 변경 시 캐시 무효화 확인
- [ ] Tool Cache: TTL 만료 후 재호출 확인
- [ ] Tool Cache: 메모리 누수 확인 (10,000건 이상)
- [ ] Semantic Cache: 유사 질문 매칭 정확도 (threshold 튜닝)
- [ ] Semantic Cache: 다른 회사(companyId) 간 격리 확인

---

## Sources
- [Claude Prompt Caching 공식 문서](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Prompt Caching으로 Claude Code 성능 향상](https://www.walturn.com/insights/how-prompt-caching-elevates-claude-code-agents)
- [Anthropic 자동 Prompt Caching](https://medium.com/ai-software-engineer/anthropic-just-fixed-the-biggest-hidden-cost-in-ai-agents-using-automatic-prompt-caching-9d47c95903c5)
- [Redis LLM Caching](https://redis.io/docs/latest/develop/ai/redisvl/user_guide/llmcache/)
- [Redis: Prompt Caching vs Semantic Caching](https://redis.io/blog/prompt-caching-vs-semantic-caching/)
- [Redis LangCache](https://redis.io/langcache/)
- [DeepLearning.AI: Semantic Caching for AI Agents](https://www.deeplearning.ai/short-courses/semantic-caching-for-ai-agents/)
- [GPTCache GitHub](https://github.com/zilliztech/GPTCache)
- [LLM Token Optimization 2026](https://redis.io/blog/llm-token-optimization-speed-up-apps/)
