# Story 16.2: Document Store CRUD API & Folder Management

Status: review

## Story

As an Admin/CEO,
I want enhanced document management with file upload, version history, advanced folder operations, document templates, and tag management,
so that I can efficiently organize, version, and retrieve organizational knowledge documents.

## Acceptance Criteria

1. **AC1: File Upload Endpoint** -- `POST /api/workspace/knowledge/docs/upload` accepts multipart form data with file (markdown, text, PDF -- max 10MB). Stores file content in local filesystem under `uploads/knowledge/{companyId}/{docId}/`. Returns created doc record with fileUrl pointing to stored file. Validates file type (`.md`, `.txt`, `.pdf` only) and file size. For markdown/text files, also extracts content into the `content` column for full-text search.

2. **AC2: Document Versioning** -- New `doc_versions` table: id, docId (FK -> knowledgeDocs), version (integer, auto-increment per doc), title, content, contentType, tags, editedBy (FK -> users), changeNote (varchar 500, optional), createdAt. Every PATCH to `/docs/:id` that changes title or content creates a version snapshot of the PREVIOUS state before updating. `GET /api/workspace/knowledge/docs/:id/versions` returns version history with pagination. `POST /api/workspace/knowledge/docs/:id/versions/:versionId/restore` restores doc to a specific version.

3. **AC3: Advanced Folder Operations** -- `POST /api/workspace/knowledge/folders/:id/move` moves docs between folders (body: `{ docIds: string[], targetFolderId: string | null }`). `POST /api/workspace/knowledge/folders/bulk-delete` soft-deletes multiple empty folders. `GET /api/workspace/knowledge/folders/:id/stats` returns folder statistics (total docs, total size, last updated). Circular reference detection on folder move (prevent folder from being moved into its own subtree).

4. **AC4: Document Templates** -- `GET /api/workspace/knowledge/templates` returns predefined templates (hardcoded in code, not DB): meeting-notes, project-plan, weekly-report, decision-record, incident-report. Each template has: id, name, description, contentType ('markdown'), defaultContent (markdown string with placeholders), defaultTags. `POST /api/workspace/knowledge/docs/from-template` creates doc from template (body: `{ templateId, folderId?, title }`).

5. **AC5: Tag Management** -- `GET /api/workspace/knowledge/tags` returns all unique tags across company docs with usage count, sorted by count DESC. `POST /api/workspace/knowledge/docs/:id/tags` adds tags to doc (body: `{ tags: string[] }`). `DELETE /api/workspace/knowledge/docs/:id/tags` removes tags from doc (body: `{ tags: string[] }`). Enhanced search: `GET /docs?tags=tag1,tag2` filters docs by ANY matching tag (OR logic, already implemented in 16-1).

6. **AC6: Full-Text Search Enhancement** -- `GET /api/workspace/knowledge/search` unified search across docs AND folder names. Query param `q` searches title, content (docs) and name, description (folders). Returns `{ docs: [...], folders: [...] }` with match highlights (substring around match). Pagination applies to docs only.

7. **AC7: API Response Format** -- All new endpoints follow existing pattern: `{ data: ... }` (success), `{ data: [...], pagination: {...} }` (list), HTTPError for failures. File upload returns `{ data: { doc, fileUrl } }`.

## Tasks / Subtasks

- [x] Task 1: DB schema + migration for doc_versions (AC: #2)
  - [x] 1.1 Create `docVersions` pgTable: id, docId (FK knowledgeDocs), version (integer), title, content, contentType, tags (jsonb), editedBy (FK users), changeNote (varchar 500 nullable), createdAt. Indexes: docId, (docId + version unique).
  - [x] 1.2 Add `docVersionsRelations` in schema.ts
  - [x] 1.3 Create migration file `0041_doc-versions.sql`

- [x] Task 2: File upload endpoint (AC: #1, #7)
  - [x] 2.1 Create upload directory structure: `uploads/knowledge/`
  - [x] 2.2 `POST /docs/upload` -- multipart file handling with Hono's built-in `c.req.parseBody()`
  - [x] 2.3 File type validation (.md, .txt, .pdf only) + size validation (max 10MB)
  - [x] 2.4 Save file to `uploads/knowledge/{companyId}/{docId}/{filename}`
  - [x] 2.5 For .md/.txt files, read content into `content` column for searchability
  - [x] 2.6 `GET /docs/:id/download` -- serve file from filesystem with proper Content-Type

- [x] Task 3: Document versioning (AC: #2, #7)
  - [x] 3.1 Modify existing `PATCH /docs/:id` to snapshot previous state before update
  - [x] 3.2 `GET /docs/:id/versions` -- list version history (newest first, paginated)
  - [x] 3.3 `POST /docs/:id/versions/:versionId/restore` -- restore doc to version state

- [x] Task 4: Advanced folder operations (AC: #3, #7)
  - [x] 4.1 `POST /folders/:id/move` -- move multiple docs to target folder
  - [x] 4.2 `POST /folders/bulk-delete` -- bulk soft-delete empty folders
  - [x] 4.3 `GET /folders/:id/stats` -- folder statistics (doc count, last updated)
  - [x] 4.4 Circular reference detection helper for folder parent changes

- [x] Task 5: Document templates (AC: #4, #7)
  - [x] 5.1 Create `knowledge-templates.ts` with 5 hardcoded templates
  - [x] 5.2 `GET /templates` -- list all templates
  - [x] 5.3 `POST /docs/from-template` -- create doc from template

- [x] Task 6: Tag management (AC: #5, #7)
  - [x] 6.1 `GET /tags` -- list all unique tags with count
  - [x] 6.2 `POST /docs/:id/tags` -- add tags to doc
  - [x] 6.3 `DELETE /docs/:id/tags` -- remove tags from doc

- [x] Task 7: Unified search (AC: #6, #7)
  - [x] 7.1 `GET /search` -- search across docs + folders with highlights

## Dev Notes

### Existing Infrastructure (CRITICAL -- reuse, don't reinvent)

**Story 16-1 already implemented (DO NOT duplicate):**
- `knowledgeFolders` table with CRUD at `/api/workspace/knowledge/folders`
- `knowledgeDocs` table with CRUD at `/api/workspace/knowledge/docs`
- `agentMemories` table with CRUD at `/api/workspace/knowledge/memories`
- Full route file: `packages/server/src/routes/workspace/knowledge.ts`
- 69 tests in: `packages/server/src/__tests__/unit/knowledge-base.test.ts`
- All basic CRUD, pagination, search via `?q=`, tag filtering via `?tags=` already work

**Route file to extend: `packages/server/src/routes/workspace/knowledge.ts`**
- Already mounted at `/api/workspace/knowledge` in server index.ts
- Uses authMiddleware, tenant isolation via `c.get('tenant')`
- Zod validation pattern: `zValidator('json', schema)`

**Schema file to extend: `packages/server/src/db/schema.ts`**
- Add `docVersions` table after existing `knowledgeDocs`
- Add relations

**Auth middleware pattern (already in knowledge.ts):**
```typescript
const tenant = c.get('tenant')  // { companyId, userId }
```

**Migration file numbering:**
- Last migration: `0039_sns-platform-enum-extension.sql`
- Next available: `0040`

### v1 Reference

**v1 Knowledge (Python KnowledgeManager):**
- File-based CRUD: save_file(), read_file(), list_files(), delete_file()
- No versioning in v1 -- this is new functionality
- No templates in v1 -- this is new functionality
- v1 had per-division folders (shared/ + {division}/) -- v2 uses DB-based folders

### Technical Implementation Notes

**File Upload with Hono:**
```typescript
// Hono multipart handling
const body = await c.req.parseBody()
const file = body['file'] as File
if (!file || !(file instanceof File)) throw new HTTPError(400, '파일이 필요합니다')
```

**File storage path pattern:**
```
uploads/knowledge/{companyId}/{docId}/{original-filename}
```
Use `Bun.write()` for file I/O (Bun native, no extra deps needed).

**Version snapshot pattern (on PATCH /docs/:id):**
```typescript
// 1. Read current doc state BEFORE update
// 2. Insert current state into docVersions with next version number
// 3. Then apply the update to knowledgeDocs
```

**Circular reference detection (folder move):**
```typescript
async function hasCircularRef(folderId: string, targetParentId: string): boolean {
  // Walk up from targetParentId checking if we ever reach folderId
  let current = targetParentId
  while (current) {
    if (current === folderId) return true
    const parent = await db.select({ parentId: knowledgeFolders.parentId })
      .from(knowledgeFolders).where(eq(knowledgeFolders.id, current)).limit(1)
    current = parent[0]?.parentId ?? null
  }
  return false
}
```

**Template structure:**
```typescript
interface DocTemplate {
  id: string
  name: string
  description: string
  contentType: 'markdown'
  defaultContent: string  // markdown with {{placeholders}}
  defaultTags: string[]
}
```

### Architecture Patterns to Follow

- **Tenant isolation**: ALL queries MUST include `eq(table.companyId, tenant.companyId)`
- **Soft delete**: Use `isActive = false` for docs/folders (consistent with 16-1)
- **Pagination**: `{ data: [...], pagination: { page, limit, total, totalPages } }`
- **Zod schemas**: Define at top of route file (follow 16-1 pattern)
- **File naming**: kebab-case for all new files
- **Response format**: `c.json({ data: result })` or `c.json({ data: results, pagination })`
- **Error handling**: `throw new HTTPError(code, message)` with Korean messages

### Project Structure Notes

- Route file (extend): `packages/server/src/routes/workspace/knowledge.ts`
- Schema additions: `packages/server/src/db/schema.ts` (add docVersions after knowledgeDocs)
- Migration: `packages/server/src/db/migrations/0040_doc-versions.sql`
- Templates: `packages/server/src/lib/knowledge-templates.ts`
- Upload dir: `uploads/knowledge/` (gitignored, created at runtime)
- Tests: `packages/server/src/__tests__/unit/knowledge-base.test.ts` (extend existing)

### References

- [Source: _bmad-output/planning-artifacts/epics.md -- Epic 16, E16-S2]
- [Source: _bmad-output/planning-artifacts/prd.md -- FR69]
- [Source: _bmad-output/planning-artifacts/architecture.md -- knowledge.ts route]
- [Source: _bmad-output/implementation-artifacts/16-1-knowledge-schema-docs-memories.md -- previous story]
- [Source: packages/server/src/routes/workspace/knowledge.ts -- existing route code]
- [Source: packages/server/src/db/schema.ts -- knowledgeFolders, knowledgeDocs tables]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References

### Completion Notes List
- Task 1: Created `docVersions` table in schema.ts with docId FK, version unique constraint, and migration 0041
- Task 2: File upload via multipart with .md/.txt/.pdf validation (10MB limit), Bun.write for storage, download endpoint with Content-Type
- Task 3: PATCH /docs/:id now auto-snapshots previous state to docVersions; GET versions with pagination; POST restore with pre-restore snapshot
- Task 4: POST /folders/:id/move for bulk doc moves, POST /folders/bulk-delete with error reporting, GET /folders/:id/stats, circular reference detection in PATCH /folders/:id
- Task 5: 5 Korean templates (회의록, 프로젝트 계획, 주간보고서, 의사결정, 장애보고서) with {{date}} placeholder
- Task 6: GET /tags aggregates all unique tags with counts; POST/DELETE /docs/:id/tags for add/remove with dedup
- Task 7: GET /search unified search across docs (with highlights) and folders, paginated
- All 123 tests pass (69 existing + 54 new), 0 regressions

### File List
- packages/server/src/db/schema.ts (modified - added docVersions table + relations)
- packages/server/src/db/migrations/0041_doc-versions.sql (new)
- packages/server/src/routes/workspace/knowledge.ts (modified - 14 new endpoints)
- packages/server/src/lib/knowledge-templates.ts (new - 5 templates)
- packages/server/src/__tests__/unit/knowledge-enhanced.test.ts (new - 54 tests)
- packages/server/src/__tests__/unit/knowledge-base.test.ts (modified - added docVersions mock)
