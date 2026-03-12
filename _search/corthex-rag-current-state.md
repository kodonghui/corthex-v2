# Corthex v2 RAG 현황 & 개선 로드맵

> 작성일: 2026-03-12

---

## 1. 현재 RAG 아키텍처 (이미 구현됨)

```
┌─────────────────────────────────────────────────────────────┐
│                    Corthex v2 RAG Stack                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [사용자/에이전트 질문]                                        │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────┐     ┌──────────────────┐               │
│  │ embedding-       │     │ semantic-         │               │
│  │ service.ts       │────▶│ search.ts         │               │
│  │ (Gemini 768-dim) │     │ (pgvector cosine) │               │
│  └─────────────────┘     └────────┬─────────┘               │
│                                    │                         │
│                                    ▼                         │
│  ┌──────────────────────────────────────────┐               │
│  │ knowledge-injector.ts (3-Layer System)    │               │
│  │                                           │               │
│  │  Layer 1: Department Knowledge (4K chars) │               │
│  │  Layer 2: Knowledge Docs - Semantic/Fall  │               │
│  │  Layer 3: Agent Memories (2K chars)       │               │
│  └────────────────────┬─────────────────────┘               │
│                       │                                      │
│                       ▼                                      │
│  ┌──────────────────────────────┐                           │
│  │ Agent System Prompt에 주입    │                           │
│  │ → 에이전트가 근거 기반 답변    │                           │
│  └──────────────────────────────┘                           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Storage Layer                                               │
│  • knowledge_folders (계층 폴더)                              │
│  • knowledge_docs (문서 + 벡터 + 버전)                        │
│  • agent_memories (학습/인사이트/선호/사실)                     │
│  • department_knowledge (부서별 참고자료)                      │
│  • archive (기밀등급 문서)                                     │
├─────────────────────────────────────────────────────────────┤
│  Search Modes                                                │
│  • semantic: pgvector cosine similarity (threshold 0.8)      │
│  • keyword: LIKE on title + content                          │
│  • hybrid: semantic → keyword fallback                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 핵심 파일 맵

| 파일 | 역할 | 라인 수 |
|------|------|---------|
| `packages/server/src/db/schema.ts` | knowledge_folders, knowledge_docs, agentMemories 테이블 정의 | ~110행 (1525-1636) |
| `packages/server/src/db/pgvector.ts` | Drizzle customType for pgvector | 1,572 |
| `packages/server/src/services/embedding-service.ts` | Gemini 임베딩 생성, 배치 처리, 비동기 트리거 | 222 |
| `packages/server/src/services/semantic-search.ts` | 벡터 검색 (topK, threshold, folderId 필터) | 71 |
| `packages/server/src/services/knowledge-injector.ts` | 3-layer 지식 수집 + 5분 TTL 캐시 | 534 |
| `packages/server/src/routes/workspace/knowledge.ts` | REST API (폴더/문서/메모리 CRUD + 검색) | 1,556 |
| `packages/server/src/services/archive-service.ts` | 기밀등급 아카이브 관리 | 580 |
| `packages/server/src/db/scoped-query.ts` | `searchSimilarDocs()` 멀티테넌트 래퍼 | 9,659 |
| `packages/app/src/pages/knowledge.tsx` | UI: 폴더트리, 문서편집기, 검색, 버전관리 | 1,568 |

---

## 3. 개선 로드맵 (우선순위순)

### Phase A: 즉시 개선 가능 (1~2일)

#### A-1. 쿼리 임베딩 캐시 🔴

**현재**: 같은 질문이라도 매번 Gemini API 호출 (네트워크 왕복 ~500ms)
**개선**: 쿼리 해시 → 임베딩 캐시 (Map 또는 Redis)
**효과**: 반복 질문 p95 2.1s → 450ms

```typescript
// 예시 구현 방향
const queryEmbeddingCache = new Map<string, { embedding: number[], expiry: number }>();

async function getCachedEmbedding(text: string): Promise<number[] | null> {
  const hash = createHash('sha256').update(text).digest('hex');
  const cached = queryEmbeddingCache.get(hash);
  if (cached && Date.now() < cached.expiry) return cached.embedding;
  return null;
}
```

#### A-2. PostgreSQL Full-Text Search 🔴

**현재**: `LIKE '%keyword%'` (풀 테이블 스캔, 느림)
**개선**: `tsvector` + `tsquery` + GIN 인덱스
**효과**: 키워드 검색 10배 속도 향상

```sql
-- 마이그레이션 예시
ALTER TABLE knowledge_docs ADD COLUMN search_vector tsvector;
CREATE INDEX idx_docs_search ON knowledge_docs USING gin(search_vector);
UPDATE knowledge_docs SET search_vector =
  to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content,''));
```

### Phase B: 중기 개선 (1~2주)

#### B-1. 문서 청킹 (Chunking) 🔴

**현재**: 문서 전체 → 1개 임베딩 (max 10,000자)
**문제**: 긴 문서에서 특정 부분만 관련 있어도 전체가 검색됨
**개선**: 문단/섹션 단위 청킹 → 각 청크별 임베딩

```
Before: 1 document (5,000자) → 1 embedding
After:  1 document (5,000자) → 5 chunks × 5 embeddings
→ 검색 정밀도 대폭 향상
```

#### B-2. Re-ranking Layer 🟡

**현재**: raw cosine similarity만으로 순위
**개선**: 1차 검색(topK=20) → Cross-encoder 재정렬 → topK=5 반환
**효과**: Precision@5 약 15~20% 향상

#### B-3. Semantic Cache 🟡

**현재**: 정확히 같은 쿼리만 캐시 히트
**개선**: 유사한 쿼리도 캐시 활용 (코사인 유사도 0.95 이상이면 캐시 히트)

### Phase C: 장기 (한 달+)

#### C-1. Contextual Chunking

각 청크에 "원본 문서에서의 위치/맥락" 메타데이터 추가

#### C-2. Graph RAG

부서-에이전트-문서-태그 관계 그래프 구축

#### C-3. Multi-hop RAG

복잡한 질문 자동 분해 → 다중 검색 → 종합 답변

#### C-4. Cloudflare Vectorize 마이그레이션

pgvector → Cloudflare Vectorize로 전환 검토
(Corthex가 Cloudflare Workers 기반이므로 레이턴시 이점)

---

## 4. 결론

Corthex v2는 RAG 기본 인프라가 **이미 탄탄하게 구축**되어 있습니다.

- ✅ 벡터 임베딩 + 시맨틱 검색 + 하이브리드 검색
- ✅ 3-layer 지식 주입 시스템
- ✅ 문서 버전 관리 + 에이전트 메모리
- ✅ 멀티테넌트 격리

**현재 가장 효과 대비 노력이 좋은 개선**:
1. 쿼리 임베딩 캐시 (A-1) — 바로 적용 가능, 체감 속도 4배↑
2. Full-Text Search (A-2) — 키워드 검색 품질 대폭 개선
3. 문서 청킹 (B-1) — 검색 정밀도의 근본적 개선
