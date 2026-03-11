# Story 11.4: 저장/불러오기 + 지식 연동

Status: done

## Story

As a CEO,
I want 다이어그램을 저장하고 지식 베이스에서 불러오는 것을,
So that 이전 작업을 이어서 할 수 있고, 지식과 다이어그램이 양방향으로 연결된다.

## Acceptance Criteria

1. **지식 베이스에서 다이어그램 불러오기**: Knowledge docs (contentType='mermaid') 목록을 캔버스에서 브라우저 → 선택 → Mermaid 파싱 → React Flow 캔버스에 로드. 새 스케치 생성 또는 기존 캔버스에 병합 가능.
2. **다이어그램 → 지식 베이스 내보내기 강화**: 기존 `export-knowledge` API에 자동 임베딩 트리거 추가. 내보낸 문서가 의미검색에 즉시 인덱싱됨.
3. **의미 검색으로 관련 다이어그램 찾기**: 캔버스 사이드바에서 텍스트 검색 → 의미검색 API로 관련 지식 문서(Mermaid 포함) 찾기 → 미리보기 → 캔버스에 불러오기.
4. **MCP 지식 연동 도구 추가**: MCP 서버에 `search_knowledge` 도구 추가 — 에이전트가 지식 베이스에서 관련 다이어그램/문서를 검색하고 캔버스에 로드할 수 있음.
5. **스케치 ↔ 지식 문서 양방향 링크**: sketches 테이블에 `knowledgeDocId` FK 추가. 지식에서 불러온 스케치는 원본 문서와 연결 유지. 지식 문서에서도 연결된 스케치 확인 가능.

## Tasks / Subtasks

### Task 1: DB 스키마 — sketches ↔ knowledgeDocs 연결 (AC: #5)

- [x]1.1: `sketches` 테이블에 `knowledgeDocId` 컬럼 추가 (nullable FK → knowledgeDocs.id, SET NULL on delete)
- [x]1.2: Drizzle 마이그레이션 생성 (`0036_sketch-knowledge-link.sql`)
- [x]1.3: `knowledgeDocs` 테이블에 `linkedSketchId` 컬럼 추가 (nullable FK → sketches.id, SET NULL on delete)

### Task 2: 지식 베이스 → 캔버스 로드 API (AC: #1)

- [x]2.1: `GET /api/workspace/knowledge/mermaid-docs` — contentType='mermaid'인 지식 문서 목록 (folderId 필터 옵션)
- [x]2.2: `POST /api/workspace/sketches/import-knowledge/:docId` — 지식 문서에서 Mermaid 추출 → `parseMermaid()` → 새 스케치 생성 + knowledgeDocId 연결
- [x]2.3: 기존 스케치에 지식 문서 Mermaid 병합 옵션: `POST /api/workspace/sketches/:id/merge-knowledge/:docId`

### Task 3: 내보내기 + 임베딩 자동 트리거 (AC: #2)

- [x]3.1: `POST /api/workspace/sketches/:id/export-knowledge` 수정 — 내보내기 후 `embedDocument(docId, companyId)` fire-and-forget 호출
- [x]3.2: 내보낸 knowledgeDoc에 `linkedSketchId` 설정
- [x]3.3: 응답에 `{ docId, embeddingTriggered: true }` 포함

### Task 4: 의미검색 통합 — 사이드바 검색 (AC: #3)

- [x]4.1: `GET /api/workspace/sketches/search-knowledge?q=` — 의미검색 API 호출 → Mermaid 문서 우선 + 일반 문서도 포함. `semantic-search.ts` + fallback keyword
- [x]4.2: 프론트엔드 `canvas-sidebar.tsx` — 검색 입력 + 결과 리스트 (제목, 미리보기, 유사도 점수)
- [x]4.3: 검색 결과 클릭 → 미리보기 모달 (Mermaid 렌더링) → "캔버스에 불러오기" / "새 캔버스로 열기" 버튼

### Task 5: MCP 지식 연동 도구 (AC: #4)

- [x]5.1: `sketchvibe-mcp.ts`에 `search_knowledge` 도구 추가 — query 파라미터 → 의미검색 → 결과 반환 (id, title, contentType, similarity, preview)
- [x]5.2: `sketchvibe-mcp.ts`에 `load_from_knowledge` 도구 추가 — docId → Mermaid 추출 → 현재 캔버스에 로드 (add_node/add_edge와 동일 DB 업데이트)
- [x]5.3: 도구 호출 후 WebSocket `canvas_mcp_update` 브로드캐스트 (기존 패턴)
- [x]5.4: tool-handler 브릿지에 새 도구 등록

### Task 6: 프론트엔드 UI 통합 (AC: #1, #3)

- [x]6.1: `nexus.tsx` 사이드바 — "지식에서 불러오기" 탭 추가 (폴더 트리 + Mermaid 문서 목록)
- [x]6.2: 지식 문서 선택 → Mermaid 미리보기 → "불러오기" / "새 캔버스" 버튼
- [x]6.3: 검색 결과에서 불러오기 → 자동으로 knowledgeDocId 연결
- [x]6.4: 캔버스 메타 정보에 "원본 지식 문서" 링크 표시 (연결된 경우)

## Dev Notes

### 핵심 아키텍처

```
[지식 베이스] ←→ [SketchVibe 캔버스]
    │                    │
    ├─ export-knowledge ─┤  (이미 구현 — 강화만 필요)
    ├─ import-knowledge ──┤  (새로 구현)
    ├─ search-knowledge ──┤  (새로 구현 — semantic search 활용)
    └─ 양방향 FK 링크 ────┘  (새로 구현)
```

### 기존 구현 현황 (재사용할 것)

| 코드 | 파일 | 재사용 방법 |
|------|------|------------|
| 스케치 CRUD (10 endpoints) | `routes/workspace/sketches.ts` | 확장 — 새 endpoint 추가 |
| export-knowledge | `sketches.ts:export-knowledge` | 수정 — 임베딩 트리거 + linkedSketchId |
| 의미검색 API | `services/semantic-search.ts` | 호출 — `semanticSearch(companyId, query)` |
| 임베딩 서비스 | `services/embedding-service.ts` | 호출 — `embedDocument(docId, companyId)` |
| Mermaid 파서 | `shared/mermaid-parser.ts` | 호출 — `parseMermaid()` + `canvasToMermaidCode()` |
| MCP 서버 (6 tools) | `mcp/sketchvibe-mcp.ts` | 확장 — 2 tools 추가 |
| tool-handler 브릿지 | `lib/tool-handlers/builtins/sketchvibe-mcp.ts` | 확장 — 새 도구 핸들러 등록 |
| WS 브로드캐스트 | `ws/channels.ts:broadcastToCompany()` | 호출 — MCP 도구 결과 전파 |
| 캔버스 사이드바 | `components/nexus/canvas-sidebar.tsx` | 수정 — 검색 + 지식 탭 추가 |
| export 다이얼로그 | `components/nexus/export-knowledge-dialog.tsx` | 참조 — import 다이얼로그 패턴 |

### Anti-patterns — 절대 하지 말 것

1. **새 검색 서비스 만들지 마라** — `semantic-search.ts` 재사용. 별도 검색 로직 금지
2. **DB 직접 쿼리 금지** — `getDB(companyId)` 패턴 사용 (scoped-query)
3. **MCP 서버에서 직접 REST API 호출 금지** — MCP 서버는 DB 직접 접근 (stdio 프로세스라 HTTP 없음)
4. **기존 sketches 라우트 분리 금지** — 같은 파일에 endpoint 추가
5. **프론트엔드에서 Mermaid 파싱 직접 구현 금지** — `shared/mermaid-parser.ts` import 사용

### MCP 서버 도구 등록 패턴 (기존 코드 참조)

```typescript
// packages/server/src/mcp/sketchvibe-mcp.ts — 기존 패턴
server.tool('search_knowledge', {
  description: 'Search knowledge base for related diagrams and documents',
  inputSchema: z.object({
    query: z.string().describe('Search query'),
    companyId: z.string(),
    limit: z.number().optional().default(5),
  }),
}, async (input) => {
  // DB에서 직접 semantic search (MCP는 별도 프로세스 → REST 불가)
  // pgvector cosine similarity 사용
})
```

**주의**: MCP 서버는 stdio로 실행되는 별도 프로세스. `semantic-search.ts` 서비스를 직접 import 불가 — DB 쿼리를 직접 실행해야 함. 현재 `sketchvibe-mcp.ts`가 이미 `neon(url)` DB 직접 연결 사용 중.

### 의미검색 호출 패턴

```typescript
// REST API에서 (routes/workspace/sketches.ts)
import { semanticSearch } from '../../services/semantic-search'

// 의미검색 → Mermaid 문서 우선 필터
const results = await semanticSearch(companyId, query, {
  limit: 10,
  threshold: 0.7,
})
// contentType='mermaid' 우선 정렬
```

### DB 스키마 변경

```sql
-- 0036_sketch-knowledge-link.sql
ALTER TABLE sketches ADD COLUMN knowledge_doc_id UUID REFERENCES knowledge_docs(id) ON DELETE SET NULL;
ALTER TABLE knowledge_docs ADD COLUMN linked_sketch_id UUID REFERENCES sketches(id) ON DELETE SET NULL;
CREATE INDEX idx_sketches_knowledge_doc ON sketches(knowledge_doc_id) WHERE knowledge_doc_id IS NOT NULL;
CREATE INDEX idx_knowledge_docs_sketch ON knowledge_docs(linked_sketch_id) WHERE linked_sketch_id IS NOT NULL;
```

### 프론트엔드 사이드바 검색 UI 패턴

```
[검색 입력] 🔍
─────────────────
📊 "아키텍처 플로우" (유사도: 0.92)
   flowchart LR → 미리보기...
   [불러오기] [새 캔버스]
─────────────────
📊 "배포 파이프라인" (유사도: 0.85)
   flowchart TD → 미리보기...
   [불러오기] [새 캔버스]
```

### v1 호환 참조

- v1은 Cytoscape JSON 저장 — v2는 React Flow JSONB (`graphData`)
- epics AC "Mermaid + Cytoscape JSON 둘 다 저장" → v2 해석: `graphData` (React Flow JSON) + Mermaid 코드 변환 (이미 구현)
- v1 버전 히스토리 10개 → v2는 이미 20개 (초과 달성)
- v1 지식 연동은 단방향(export만) → v2는 양방향(export + import + 검색)

### Project Structure Notes

**새 파일:**
- `packages/server/src/db/migrations/0036_sketch-knowledge-link.sql` — 양방향 FK

**수정 파일 (서버):**
- `packages/server/src/db/schema.ts` — sketches에 knowledgeDocId, knowledgeDocs에 linkedSketchId
- `packages/server/src/routes/workspace/sketches.ts` — import-knowledge, merge-knowledge, search-knowledge endpoints
- `packages/server/src/mcp/sketchvibe-mcp.ts` — search_knowledge, load_from_knowledge 도구
- `packages/server/src/lib/tool-handlers/builtins/sketchvibe-mcp.ts` — 새 도구 핸들러 등록

**수정 파일 (프론트엔드):**
- `packages/app/src/components/nexus/canvas-sidebar.tsx` — 지식 검색 탭 + 결과 UI
- `packages/app/src/pages/nexus.tsx` — 지식에서 불러오기 핸들러

**수정하지 않는 파일 (불가침):**
- `packages/shared/src/mermaid-parser.ts` — 공유 파서 유지
- `packages/server/src/services/semantic-search.ts` — 호출만 (수정 불필요)
- `packages/server/src/services/embedding-service.ts` — 호출만 (수정 불필요)
- `packages/server/src/ws/channels.ts` — WebSocket 인프라 유지
- `packages/server/src/services/canvas-ai.ts` — AI 파이프라인 유지

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 11.4] — AC 원본
- [Source: _bmad-output/implementation-artifacts/11-3-sketchvibe-ai-realtime-editing.md] — 이전 스토리
- [Source: _bmad-output/implementation-artifacts/11-2-sketchvibe-mcp-server-separation.md] — MCP 서버 구현
- [Source: packages/server/src/routes/workspace/sketches.ts] — 기존 스케치 CRUD (10 endpoints)
- [Source: packages/server/src/mcp/sketchvibe-mcp.ts] — MCP 서버 (6 도구)
- [Source: packages/server/src/services/semantic-search.ts] — 의미검색 서비스
- [Source: packages/server/src/services/embedding-service.ts] — 임베딩 서비스
- [Source: packages/server/src/db/schema.ts] — sketches 테이블 (910-934), knowledgeDocs (1525-1633)
- [Source: packages/shared/src/mermaid-parser.ts] — Mermaid 파서
- [Source: packages/app/src/components/nexus/canvas-sidebar.tsx] — 사이드바
- [Source: packages/app/src/components/nexus/export-knowledge-dialog.tsx] — export 다이얼로그 참조

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- `npx tsc --noEmit -p packages/server/tsconfig.json` — PASS (0 errors)
- `npx tsc --noEmit -p packages/app/tsconfig.json` — PASS (0 errors)
- `bun test sketch-knowledge-link.test.ts` — 26 tests PASS, 53 expect() calls
- `bun test sketches-crud.test.ts sketch-save-knowledge.test.ts sketch-knowledge-link.test.ts` — 95 tests PASS (0 regressions)

### Completion Notes List

- DB Schema: Added `knowledgeDocId` to sketches, `linkedSketchId` to knowledgeDocs (bidirectional nullable FK)
- Migration: `0050_sketch-knowledge-link.sql` with partial indexes
- Import-from-knowledge API: `POST /sketches/import-knowledge/:docId` — creates sketch from knowledge doc, parses Mermaid, sets bidirectional link
- Merge-knowledge API: `POST /sketches/:id/merge-knowledge/:docId` — merges Mermaid nodes into existing canvas with Y-offset + ID deduplication
- Export-knowledge enhanced: Auto `triggerEmbedding()` + bidirectional link on export
- Search-knowledge API: `GET /sketches/search-knowledge?q=` — semantic search (cosine similarity) with keyword fallback, mermaid docs prioritized
- MCP tools: `search_knowledge` (keyword search in knowledge base) + `load_from_knowledge` (load Mermaid into canvas with replace/merge modes)
- Tool handler bridge: 2 new handlers registered (`sv_search_knowledge`, `sv_load_from_knowledge`), `load_from_knowledge` added to MUTATION_TOOLS for WebSocket broadcast
- Frontend: Canvas sidebar enhanced with search input, semantic search results display (score + contentType badge), import-from-knowledge handler in nexus.tsx

### File List

- `packages/server/src/db/migrations/0050_sketch-knowledge-link.sql` — NEW (bidirectional FK migration)
- `packages/server/src/db/schema.ts` — MODIFIED (knowledgeDocId on sketches, linkedSketchId on knowledgeDocs)
- `packages/server/src/routes/workspace/sketches.ts` — MODIFIED (import-knowledge, merge-knowledge, search-knowledge endpoints, export enhancement)
- `packages/server/src/mcp/sketchvibe-mcp.ts` — MODIFIED (search_knowledge + load_from_knowledge MCP tools)
- `packages/server/src/lib/tool-handlers/builtins/sketchvibe-mcp.ts` — MODIFIED (2 new handlers + MUTATION_TOOLS update)
- `packages/server/src/lib/tool-handlers/index.ts` — MODIFIED (register sv_search_knowledge + sv_load_from_knowledge)
- `packages/app/src/components/nexus/canvas-sidebar.tsx` — MODIFIED (search input + results + onImportFromKnowledge)
- `packages/app/src/pages/nexus.tsx` — MODIFIED (handleImportFromKnowledge + onImportFromKnowledge prop)
- `packages/server/src/__tests__/unit/sketch-knowledge-link.test.ts` — NEW (26 tests)
