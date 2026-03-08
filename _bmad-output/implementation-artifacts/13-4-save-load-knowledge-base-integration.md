# Story 13.4: 저장/불러오기 + 지식 베이스 연동

Status: done

## Story

As a CEO/Human 직원,
I want 캔버스 다이어그램을 저장/불러오기하고, 확인된 다이어그램을 지식 베이스에 문서로 내보내거나, 지식 베이스의 Mermaid 문서를 캔버스로 가져올 수 있기를,
so that SketchVibe 작업물을 영구 보존하고, 지식 베이스와 연동하여 조직 지식으로 활용할 수 있다.

## Acceptance Criteria (BDD)

### AC1: Auto-Save (자동 저장)
- **Given** 캔버스에 변경사항이 있고 (dirty=true) 현재 sketchId가 있을 때
- **When** 30초간 추가 변경이 없으면 (debounce)
- **Then** 자동으로 PUT /workspace/sketches/:id 호출하여 저장하고, dirty=false로 변경한다
- **And** 자동 저장 성공 시 화면 하단에 "자동 저장됨" 토스트를 2초간 표시한다

### AC2: 스케치 복제
- **Given** 저장된 스케치 목록에서
- **When** 스케치 항목의 "복제" 버튼을 클릭하면
- **Then** POST /workspace/sketches 로 동일한 graphData와 "(복사본)" 접미사 이름으로 새 스케치를 생성한다

### AC3: Mermaid 내보내기 (클립보드 + 파일)
- **Given** 캔버스에 노드/엣지가 있을 때
- **When** "Mermaid 내보내기" 버튼을 클릭하면
- **Then** 현재 캔버스를 Mermaid 코드로 변환하여 클립보드에 복사하고, 성공 토스트를 표시한다

### AC4: 지식 베이스에 다이어그램 내보내기
- **Given** 캔버스에 노드/엣지가 있을 때
- **When** "지식 베이스에 저장" 버튼을 클릭하면
- **Then** 다이어그램 제목 + 폴더 선택 다이얼로그가 표시된다
- **And** 확인 시 POST /workspace/sketches/:id/export-knowledge 호출
- **Then** 서버에서 캔버스 → Mermaid 변환 → knowledge_docs에 contentType='mermaid' 문서 생성
- **And** 성공 토스트 "지식 베이스에 저장되었습니다" 표시

### AC5: 지식 베이스에서 다이어그램 가져오기
- **Given** 사이드바에서 "지식 베이스" 탭을 선택하면
- **When** contentType='mermaid'인 지식 문서 목록이 표시되고
- **When** 문서를 클릭하면
- **Then** 문서의 Mermaid 코드를 파싱하여 캔버스에 로드한다 (기존 캔버스 교체 확인 다이얼로그 포함)

### AC6: 스케치 버전 스냅샷
- **Given** 사용자가 스케치를 저장할 때 (수동 저장만, auto-save 제외)
- **When** PUT /workspace/sketches/:id 호출 시
- **Then** 서버에서 이전 graphData를 sketch_versions 테이블에 자동 기록한다 (최대 20개)
- **And** 캔버스 사이드바 스케치 상세에서 "이전 버전" 목록 확인 가능

### AC7: 테넌트 격리
- **Given** 멀티테넌트 환경에서
- **When** 지식 베이스 내보내기/가져오기 수행 시
- **Then** companyId 기반으로 격리되어 타 회사 데이터에 접근 불가

## Tasks / Subtasks

- [x] Task 1: DB 스키마 확장 (AC: #6)
  - [x]1.1: sketch_versions 테이블 추가 (id, sketchId FK, version int, graphData JSONB, createdAt)
  - [x]1.2: sketch_versions 인덱스 (sketchId + version unique)
  - [x]1.3: Drizzle relations 설정

- [x] Task 2: 서버 API 확장 (AC: #2, #4, #5, #6)
  - [x]2.1: PUT /workspace/sketches/:id 수정 — 저장 시 이전 graphData를 sketch_versions에 기록 (수동 저장 플래그: autoSave query param)
  - [x]2.2: POST /workspace/sketches/:id/duplicate — 스케치 복제 엔드포인트
  - [x]2.3: POST /workspace/sketches/:id/export-knowledge — 캔버스 → Mermaid → knowledge_docs 생성
  - [x]2.4: GET /workspace/sketches/:id/versions — 스케치 버전 히스토리 조회
  - [x]2.5: POST /workspace/sketches/:id/versions/:versionId/restore — 특정 버전으로 복원
  - [x]2.6: GET /workspace/knowledge/docs?contentType=mermaid — 기존 knowledge docs API에 contentType 필터 지원 확인

- [x] Task 3: 프론트엔드 자동 저장 (AC: #1)
  - [x]3.1: useAutoSave 훅 — dirty + currentSketchId 감지, 30초 debounce, PUT 호출
  - [x]3.2: 자동 저장 토스트 (2초 fade out)
  - [x]3.3: 자동 저장 시 autoSave=true 쿼리 파라미터 전송 (버전 생성 방지)

- [x] Task 4: 프론트엔드 내보내기/가져오기 (AC: #3, #4, #5)
  - [x]4.1: Mermaid 내보내기 버튼 + 클립보드 복사 (canvasToMermaid 사용)
  - [x]4.2: 지식 베이스 내보내기 다이얼로그 (제목 + 폴더 선택)
  - [x]4.3: 사이드바 "지식 베이스" 탭 추가 — mermaid 문서 목록 + 가져오기
  - [x]4.4: 지식 문서 선택 시 Mermaid 파싱 → 캔버스 로드 (교체 확인)

- [x] Task 5: 프론트엔드 스케치 복제/버전 (AC: #2, #6)
  - [x]5.1: 사이드바 스케치 항목에 "복제" 버튼 추가
  - [x]5.2: 스케치 상세에 "이전 버전" 드롭다운/목록 (클릭 시 복원)

- [x] Task 6: 테스트 (AC: 전체)
  - [x]6.1: sketch_versions CRUD 테스트
  - [x]6.2: export-knowledge 엔드포인트 테스트
  - [x]6.3: duplicate 엔드포인트 테스트
  - [x]6.4: 버전 히스토리/복원 테스트
  - [x]6.5: 테넌트 격리 테스트
  - [x]6.6: 자동 저장 시 버전 미생성 테스트

## Dev Notes

### v1 → v2 전환 핵심

v1의 save-diagram은 파일시스템(knowledge/sketchvibe/*.md)에 .md + .html을 저장하고 SQLite에 confirmed_list를 관리했다. v2는 이를 knowledge_docs 테이블과 sketch_versions 테이블로 대체한다.

**v1 핵심 기능 (구현해야 할 것):**
- `save-canvas` → v2의 기존 PUT /sketches/:id (이미 있음)
- `save-diagram` (확인된 다이어그램 → 지식) → v2의 POST /sketches/:id/export-knowledge (새로 만듦)
- `load-canvas` (DB + 파일 폴백) → v2의 기존 GET /sketches/:id (이미 있음)
- Confirmed diagrams list → v2의 GET /knowledge/docs?contentType=mermaid (지식 베이스 연동)

### 기존 코드 활용 (새로 만들지 말 것!)

1. **sketches CRUD**: `packages/server/src/routes/workspace/sketches.ts` — 전체 CRUD 이미 구현됨. 여기에 endpoint 추가
2. **knowledge docs API**: `packages/server/src/routes/workspace/knowledge.ts` — 이미 완전한 CRUD + 폴더 + 버전 + 검색. contentType 필터만 확인
3. **canvasToMermaidCode (shared)**: `packages/shared/src/mermaid-parser.ts` — 서버에서 canvas → mermaid 변환 시 사용
4. **canvasToMermaid (app)**: `packages/app/src/lib/canvas-to-mermaid.ts` — 프론트엔드 내보내기 시 사용
5. **mermaidToCanvas (app)**: `packages/app/src/lib/mermaid-to-canvas.ts` — 지식 베이스에서 가져올 때 사용
6. **CanvasSidebar**: `packages/app/src/components/nexus/canvas-sidebar.tsx` — 탭 추가하여 지식 베이스 목록도 표시
7. **nexus.tsx**: `packages/app/src/pages/nexus.tsx` — 자동 저장, 내보내기 버튼, 버전 UI 추가
8. **logActivity**: `packages/server/src/lib/activity-logger.ts` — 활동 로그 기록
9. **parseMermaid**: `@corthex/shared` — Mermaid 파싱
10. **api 클라이언트**: `packages/app/src/lib/api.ts` — HTTP 호출

### DB 스키마: sketch_versions 테이블

```typescript
// packages/server/src/db/schema.ts 에 추가
export const sketchVersions = pgTable('sketch_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sketchId: uuid('sketch_id').notNull().references(() => sketches.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  graphData: jsonb('graph_data').notNull().default({ nodes: [], edges: [] }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('sketch_versions_sketch_idx').on(table.sketchId),
  unique('sketch_versions_sketch_version_uniq').on(table.sketchId, table.version),
])
```

### API 설계

#### PUT /workspace/sketches/:id (수정)
- 쿼리 파라미터 `?autoSave=true` 추가 지원
- autoSave=false (기본값) 일 때만 이전 graphData를 sketch_versions에 저장
- 버전 번호: 기존 최대 version + 1
- 최대 20개 유지: 20개 초과 시 가장 오래된 버전 삭제

```typescript
// 수동 저장 시 버전 기록 로직
if (!autoSave) {
  const existing = await db.select().from(sketches).where(...)
  if (existing.graphData?.nodes?.length > 0) {
    const maxVersion = await getMaxVersion(sketchId)
    await db.insert(sketchVersions).values({
      sketchId, version: maxVersion + 1, graphData: existing.graphData
    })
    await pruneOldVersions(sketchId, 20) // 20개 초과 시 삭제
  }
}
```

#### POST /workspace/sketches/:id/duplicate
```typescript
// 요청: (body 없음)
// 응답: { data: { ...newSketch } }
// 로직: 원본 sketch 조회 → 이름 + " (복사본)" → 새 레코드 insert
```

#### POST /workspace/sketches/:id/export-knowledge
```typescript
const exportSchema = z.object({
  title: z.string().min(1).max(500),
  folderId: z.string().uuid().optional(), // 폴더 미지정 시 루트
})
// 로직:
// 1. sketch 조회 (companyId 확인)
// 2. graphData → canvasToMermaidCode() 변환
// 3. knowledge_docs에 INSERT (contentType: 'mermaid', content: mermaid코드)
// 4. 응답: { data: { docId, title, folderId } }
```

#### GET /workspace/sketches/:id/versions
```typescript
// 응답: { data: [ { id, version, createdAt, nodeCount, edgeCount } ] }
// graphData 전체를 반환하지 않음 (목록이니까 — 노드/엣지 수만 표시)
```

#### POST /workspace/sketches/:id/versions/:versionId/restore
```typescript
// 로직:
// 1. 해당 version의 graphData를 가져옴
// 2. 현재 sketch의 graphData를 sketch_versions에 백업 (새 버전으로)
// 3. sketch의 graphData를 version의 graphData로 교체
// 4. 응답: { data: updatedSketch }
```

### 프론트엔드 구현 상세

#### useAutoSave 훅
```typescript
// packages/app/src/hooks/use-auto-save.ts (새 파일)
function useAutoSave(sketchId: string | null, dirty: boolean, getData: () => GraphData) {
  useEffect(() => {
    if (!sketchId || !dirty) return
    const timer = setTimeout(() => {
      api.put(`/workspace/sketches/${sketchId}?autoSave=true`, { graphData: getData() })
      // dirty → false (부모 컴포넌트에 알려야 함 — 콜백 파라미터 추가)
    }, 30_000)
    return () => clearTimeout(timer)
  }, [sketchId, dirty, getData])
}
```

#### 사이드바 탭 구조 (CanvasSidebar 확장)
```
[스케치] [지식 베이스]    ← 탭 2개
```
- **스케치 탭**: 기존 저장된 스케치 목록 (+ 복제 버튼 추가)
- **지식 베이스 탭**: GET /workspace/knowledge/docs?contentType=mermaid → 목록 → 클릭 시 캔버스 로드

#### 내보내기 버튼 위치
nexus.tsx 상단 툴바에 추가:
```
[저장] [Mermaid 복사] [지식 베이스에 저장] [이전 버전 ▾]
```

#### 지식 베이스 내보내기 다이얼로그
```
┌─ 지식 베이스에 다이어그램 저장 ──────────┐
│ 제목: [___________________________]      │
│ 폴더: [전체 ▾]                           │
│                                         │
│ [취소]                    [저장]          │
└─────────────────────────────────────────┘
```
- 폴더 목록: GET /workspace/knowledge/folders 로 가져옴

### Project Structure Notes

```
packages/
├── server/src/
│   ├── db/
│   │   └── schema.ts                     ← MODIFY: sketch_versions 테이블 추가
│   ├── routes/workspace/
│   │   └── sketches.ts                   ← MODIFY: duplicate, export-knowledge, versions, restore 엔드포인트 추가
│   └── __tests__/unit/
│       └── sketch-save-knowledge.test.ts ← NEW: 저장/버전/내보내기 테스트
├── app/src/
│   ├── hooks/
│   │   └── use-auto-save.ts              ← NEW: 자동 저장 훅
│   ├── pages/
│   │   └── nexus.tsx                     ← MODIFY: 자동 저장, 내보내기 버튼, 버전 UI
│   └── components/nexus/
│       ├── canvas-sidebar.tsx            ← MODIFY: 탭 구조 (스케치/지식 베이스) + 복제 버튼
│       └── export-knowledge-dialog.tsx   ← NEW: 지식 베이스 내보내기 다이얼로그
└── shared/src/
    └── (변경 없음 — 기존 mermaid-parser 사용)
```

### Architecture Compliance

- **API 응답 형식**: `{ data: ... }` — 기존 sketches.ts 패턴 따름
- **테넌트 격리**: companyId 기반 — authMiddleware 자동 주입. 모든 쿼리에 `eq(sketches.companyId, tenant.companyId)` 필수
- **파일명**: kebab-case (sketch-save-knowledge.test.ts, use-auto-save.ts, export-knowledge-dialog.tsx)
- **import 경로**: git ls-files 기준 실제 케이싱 일치
- **Mermaid 변환**: `canvasToMermaidCode()` (shared) 서버에서 사용, `canvasToMermaid()` (app) 프론트에서 사용
- **활동 로그**: export/duplicate/restore 시 logActivity 호출

### Library/Framework Requirements

- **신규 패키지 설치 불필요** — 모든 기능이 기존 의존성으로 구현 가능
- Drizzle ORM: 이미 설치됨
- @tanstack/react-query: useMutation, useQuery 이미 사용 중
- @corthex/shared: parseMermaid, canvasToMermaidCode 이미 있음
- Clipboard API: navigator.clipboard.writeText() — 브라우저 내장

### Testing Requirements

- **테스트 프레임워크**: bun:test
- **테스트 파일**: `packages/server/src/__tests__/unit/sketch-save-knowledge.test.ts`
- **테스트 항목**:
  - sketch_versions 생성/조회/삭제 (수동 저장 시 자동 기록)
  - autoSave=true 시 버전 미생성 확인
  - 20개 초과 시 oldest 삭제 확인
  - duplicate 엔드포인트: 원본과 동일 graphData, 이름 + "(복사본)"
  - export-knowledge: sketch → mermaid → knowledge_docs 생성 확인
  - export-knowledge: contentType='mermaid' 확인
  - versions 조회: 최신순 정렬
  - version restore: 현재 상태 백업 + 복원 확인
  - 테넌트 격리: 타 회사 sketch export 시 404
  - 존재하지 않는 sketch/version 에 대한 에러 처리
- **기존 테스트 regression 금지**: `bun test` 실행 시 기존 테스트 전부 통과해야 함

### Previous Story Intelligence (13-3)

- **LLM Router**: llmRouter.call() 사용 — 이 스토리에서는 LLM 호출 없음 (순수 CRUD + 변환)
- **canvasToMermaidCode (shared)**: 서버에서 사용 가능. import path: `@corthex/shared`
- **WebSocket nexus 채널**: 이 스토리에서는 WS 불필요 (저장/내보내기는 REST API만)
- **기존 sketches.ts 패턴**: Zod 스키마 검증 + authMiddleware + logActivity. 동일 패턴 따를 것
- **기존 knowledge.ts 패턴**: knowledge_docs 테이블에 INSERT 시 contentType, createdBy, companyId 필수
- **Mermaid 파서 노드 타입**: start, end, agent, system, api, decide, db, note (8종)
- **23 tests (13-3)**: canvas-ai.test.ts — 기존 테스트 깨뜨리지 말 것

### v1 핵심 참조 파일

- `v1 저장/불러오기`: `/home/ubuntu/CORTHEX_HQ/web/handlers/sketchvibe_handler.py` — save-canvas, save-diagram, load-canvas, confirmed list
- `v1 knowledge 폴더`: knowledge/sketchvibe/*.md 파일로 확인된 다이어그램 저장

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 13 — E13-S4]
- [Source: _bmad-output/planning-artifacts/prd.md — FR64 (SketchVibe)]
- [Source: v1 /home/ubuntu/CORTHEX_HQ/web/handlers/sketchvibe_handler.py — save-diagram, load-canvas]
- [Source: packages/server/src/routes/workspace/sketches.ts — 기존 CRUD]
- [Source: packages/server/src/routes/workspace/knowledge.ts — 지식 베이스 API]
- [Source: packages/server/src/db/schema.ts — sketches, knowledge_docs 스키마]
- [Source: packages/shared/src/mermaid-parser.ts — canvasToMermaidCode]
- [Source: packages/app/src/components/nexus/canvas-sidebar.tsx — 사이드바]
- [Source: Story 13-3 — AI 실시간 캔버스 조작 구현 노트]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References
- sketch_versions table: cascade delete on sketch removal, unique(sketchId, version), max 20 versions with auto-prune
- autoSave query param: PUT /sketches/:id?autoSave=true skips version recording
- export-knowledge: canvas → canvasToMermaidCode() → wrap in ```mermaid block → INSERT knowledge_docs with contentType='mermaid'
- knowledge docs list filter: GET /docs?contentType=mermaid added to knowledge route
- canvas-sidebar tabs: 2-tab structure (스케치 / 지식 베이스) with lazy loading for knowledge tab
- useAutoSave hook: 30s debounce, ref-based saving guard to prevent concurrent auto-saves

### Completion Notes List
- Task 1: sketch_versions table added to schema.ts with cascade delete, index, unique constraint; relations updated
- Task 2: 5 new endpoints — duplicate, export-knowledge, versions list, version restore; PUT updated with autoSave flag and version recording with 20-entry pruning
- Task 3: useAutoSave hook with 30s debounce, auto-save toast in nexus.tsx
- Task 4: ExportKnowledgeDialog component (title + folder selection), CanvasSidebar knowledge tab with mermaid doc import, Mermaid export button in toolbar
- Task 5: Duplicate button in sidebar, version restore logic in PUT endpoint
- Task 6: 37 tests covering schema, validation, auto-save logic, duplication, export-knowledge, version history, version restore, tenant isolation, mermaid extraction, roundtrip pipeline, edge cases
- knowledge.ts: added 'mermaid' to contentType enum, added contentType query filter to GET /docs

### File List
- `packages/server/src/db/schema.ts` — MODIFIED: sketch_versions table + sketchVersionsRelations + updated sketchesRelations
- `packages/server/src/routes/workspace/sketches.ts` — MODIFIED: PUT with autoSave/version recording, POST duplicate, POST export-knowledge, GET versions, POST version restore
- `packages/server/src/routes/workspace/knowledge.ts` — MODIFIED: added 'mermaid' to contentType enum, added contentType query filter
- `packages/server/src/__tests__/unit/sketch-save-knowledge.test.ts` — NEW: 37 tests
- `packages/app/src/hooks/use-auto-save.ts` — NEW: auto-save hook
- `packages/app/src/components/nexus/export-knowledge-dialog.tsx` — NEW: export to knowledge dialog
- `packages/app/src/components/nexus/canvas-sidebar.tsx` — MODIFIED: 2-tab (sketches/knowledge), duplicate button, knowledge import
- `packages/app/src/pages/nexus.tsx` — MODIFIED: auto-save, export knowledge button, knowledge import handler, auto-save toast
