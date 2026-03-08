# Story 16.1: Knowledge Schema - Docs & Memories

Status: done

## Story

As an Admin/CEO,
I want a knowledge base schema with folders, documents, and enhanced agent memories stored in the database,
so that agents can reference organizational knowledge and accumulate learning from past tasks.

## Acceptance Criteria

1. **AC1: Knowledge Folders Table** -- `knowledgeFolders` table: id, companyId (tenant isolation), name (varchar 200), description (text, nullable), parentId (self-reference for nested folders, nullable), departmentId (FK -> departments, nullable -- department-specific folders), createdBy (FK -> users), isActive (boolean), createdAt, updatedAt. Indexes: companyId, parentId, departmentId. Unique constraint: (companyId, name, parentId) to prevent duplicate folder names at same level.

2. **AC2: Knowledge Documents Table** -- `knowledgeDocs` table: id, companyId, folderId (FK -> knowledgeFolders), title (varchar 500), content (text -- markdown body), contentType (varchar 50 -- 'markdown', 'text', 'html'), fileUrl (text, nullable -- for uploaded file reference), tags (jsonb string array), createdBy (FK -> users), updatedBy (FK -> users, nullable), isActive (boolean), createdAt, updatedAt. Indexes: companyId, folderId, createdBy. Full-text search via SQL `ILIKE` on title + content (no vector DB in this story).

3. **AC3: Enhanced Agent Memories Table** -- `agentMemories` table (replaces existing simple `agentMemory`): id, companyId, agentId (FK -> agents), memoryType enum ('learning', 'insight', 'preference', 'fact'), key (varchar 200), content (text -- the memory content), context (text, nullable -- what task/situation produced this memory), source (varchar 50 -- 'manual', 'auto', 'system'), confidence (integer 0-100, default 50), usageCount (integer, default 0), lastUsedAt (timestamp, nullable), isActive (boolean), createdAt, updatedAt. Indexes: companyId, agentId, memoryType. Keep existing `agentMemory` table as-is for backward compat (no migration needed -- new table coexists).

4. **AC4: Knowledge Folders CRUD API** -- `POST /api/workspace/knowledge/folders` (create), `GET /api/workspace/knowledge/folders` (list tree structure), `GET /api/workspace/knowledge/folders/:id` (single with children + doc count), `PATCH /api/workspace/knowledge/folders/:id` (update name/description/parentId), `DELETE /api/workspace/knowledge/folders/:id` (soft delete, check for docs first). All endpoints enforce companyId tenant isolation via authMiddleware.

5. **AC5: Knowledge Documents CRUD API** -- `POST /api/workspace/knowledge/docs` (create doc in folder), `GET /api/workspace/knowledge/docs` (list with filters: folderId, search query, tags, pagination), `GET /api/workspace/knowledge/docs/:id` (single doc with content), `PATCH /api/workspace/knowledge/docs/:id` (update), `DELETE /api/workspace/knowledge/docs/:id` (soft delete). Search: `?q=검색어` searches title + content via SQL ILIKE. Pagination: `?page=1&limit=20`.

6. **AC6: Agent Memory CRUD API** -- `POST /api/workspace/knowledge/memories` (create memory for agent), `GET /api/workspace/knowledge/memories?agentId=xxx` (list agent's memories with optional memoryType filter), `GET /api/workspace/knowledge/memories/:id` (single), `PATCH /api/workspace/knowledge/memories/:id` (update content, confidence), `DELETE /api/workspace/knowledge/memories/:id` (hard delete). `POST /api/workspace/knowledge/memories/:id/used` (increment usageCount + update lastUsedAt). Pagination: `?page=1&limit=50`.

7. **AC7: Memory Context String API** -- `GET /api/workspace/knowledge/memories/context/:agentId` returns formatted memory string for system prompt injection (mirrors v1 `get_context_string()`). Returns top 20 memories by usageCount DESC, confidence DESC. Format: markdown section with `## 장기 기억` header + bullet list of key:content pairs.

8. **AC8: API Response Format** -- All endpoints return `{ data: ... }` (success) or throw HTTPError (failure). List endpoints include `{ data: [...], pagination: { page, limit, total, totalPages } }`. Standard `{ success: true, data }` / `{ success: false, error: { code, message } }` pattern.

## Tasks / Subtasks

- [x] Task 1: Create DB migration + schema (AC: #1, #2, #3)
  - [x] 1.1 Create `memoryTypeEnum` pgEnum: 'learning', 'insight', 'preference', 'fact'
  - [x] 1.2 Create `knowledgeFolders` pgTable with all columns + indexes + unique constraint
  - [x] 1.3 Create `knowledgeDocs` pgTable with all columns + indexes
  - [x] 1.4 Create `agentMemories` pgTable with all columns + indexes (new table, keep old `agentMemory`)
  - [x] 1.5 Add relations: knowledgeFoldersRelations, knowledgeDocsRelations, agentMemoriesRelations
  - [x] 1.6 Create SQL migration file `0037_knowledge-base-schema.sql`
  - [x] 1.7 Export all new tables and enums from schema.ts

- [x] Task 2: Knowledge Folders CRUD route (AC: #4, #8)
  - [x] 2.1 Create `routes/workspace/knowledge.ts` with Hono router
  - [x] 2.2 POST /folders -- create folder with Zod validation
  - [x] 2.3 GET /folders -- list all folders as tree structure (app-side tree build)
  - [x] 2.4 GET /folders/:id -- single folder with children count + doc count
  - [x] 2.5 PATCH /folders/:id -- update (name, description, parentId, departmentId)
  - [x] 2.6 DELETE /folders/:id -- soft delete with doc check (reject if has active docs)

- [x] Task 3: Knowledge Documents CRUD route (AC: #5, #8)
  - [x] 3.1 POST /docs -- create doc in folder
  - [x] 3.2 GET /docs -- list with filters (folderId, q search, tags, pagination)
  - [x] 3.3 GET /docs/:id -- single doc with full content
  - [x] 3.4 PATCH /docs/:id -- update (title, content, tags, folderId)
  - [x] 3.5 DELETE /docs/:id -- soft delete

- [x] Task 4: Agent Memory CRUD route (AC: #6, #7, #8)
  - [x] 4.1 POST /memories -- create memory for agent
  - [x] 4.2 GET /memories -- list with agentId filter + memoryType filter + pagination
  - [x] 4.3 GET /memories/:id -- single memory
  - [x] 4.4 PATCH /memories/:id -- update content, confidence
  - [x] 4.5 DELETE /memories/:id -- hard delete
  - [x] 4.6 POST /memories/:id/used -- increment usageCount + update lastUsedAt
  - [x] 4.7 GET /memories/context/:agentId -- formatted context string for prompt injection

- [x] Task 5: Register route in server index (AC: all)
  - [x] 5.1 Import and mount knowledgeRoute at `/api/workspace/knowledge` in server index.ts
  - [x] 5.2 Add shared types to `packages/shared/src/types.ts` if needed

## Dev Notes

### Existing Infrastructure (CRITICAL -- reuse, don't reinvent)

**Existing `agentMemory` table (schema.ts:233-243) -- DO NOT modify or delete:**
```typescript
export const agentMemory = pgTable('agent_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  key: varchar('key', { length: 200 }).notNull(),
  value: text('value').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```
This table is used by existing code. The NEW `agentMemories` table coexists with richer schema (memoryType, confidence, usageCount, context, source). Do NOT drop or modify `agentMemory`.

**Auth middleware pattern (reuse from every existing route):**
```typescript
import { authMiddleware } from '../../middleware/auth'
knowledgeRoute.use('*', authMiddleware)
const tenant = c.get('tenant') // { companyId, userId }
```

**Standard route pattern (follow exactly):**
- File: `packages/server/src/routes/workspace/knowledge.ts`
- Router: `export const knowledgeRoute = new Hono<AppEnv>()`
- Zod validation: `zValidator('json', schema)` for POST/PATCH
- Error handling: `throw new HTTPError(code, message)`
- Response: `c.json({ data: result })` or `c.json({ data: results, pagination: {...} })`

**Migration file naming:**
- Next migration number: `0037`
- File: `packages/server/src/db/migrations/0037_knowledge-base-schema.sql`

**Recent migration SQL pattern (from 0036_cron-scheduler-enhancements.sql):**
```sql
CREATE TABLE IF NOT EXISTS "table_name" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  ...
);
CREATE INDEX IF NOT EXISTS "idx_name" ON "table_name" ("column");
```

### v1 Reference (CRITICAL)

**v1 Knowledge (Python KnowledgeManager -- /home/ubuntu/CORTHEX_HQ/src/src/src/src/core/knowledge.py):**
- File-based system: `knowledge/shared/` (global) + `knowledge/{division}/` (per-department)
- CRUD: list_files(), read_file(), save_file(), delete_file()
- Agent injection: `get_knowledge_for_agent(division)` -> returns combined shared + division knowledge
- Path safety: `_is_safe_path()` prevents directory traversal
- v2 equivalent: DB-based (knowledgeFolders + knowledgeDocs) replaces filesystem approach

**v1 Memory (Python MemoryManager -- /home/ubuntu/CORTHEX_HQ/src/src/src/src/core/memory.py):**
- SQLite-based: agent_id, memory_id, key, value, source (manual/auto), created_at
- CRUD: load(), add(), delete(), get_all()
- Prompt injection: `get_context_string(agentId)` -> last 20 memories formatted as markdown
- v2 equivalent: PostgreSQL `agentMemories` table with richer schema (memoryType, confidence, usageCount)

**v1 Frontend API patterns (corthex-app.js):**
- Knowledge: `GET /api/knowledge`, `GET /api/knowledge/:folder/:filename`, `POST /api/knowledge`, `DELETE /api/knowledge/:folder/:filename`
- Memory: `GET /api/memory/:agentId`, `POST /api/memory/:agentId`, `DELETE /api/memory/:agentId/:memoryId`

### What's NEW in this story

1. **DB-based knowledge** (replaces v1 file-based): knowledgeFolders + knowledgeDocs tables
2. **Nested folders**: parentId self-reference for hierarchical organization
3. **Department-scoped folders**: departmentId FK for department-specific knowledge
4. **Enhanced memories**: memoryType categorization, confidence scoring, usage tracking
5. **Full-text search**: SQL ILIKE on title + content (sufficient for MVP, vector search in future)

### Architecture Patterns to Follow

- **Tenant isolation**: ALL queries must include `eq(table.companyId, tenant.companyId)`
- **Soft delete**: Use `isActive = false` for folders and docs, hard delete for memories
- **Pagination pattern**: `{ data: [...], pagination: { page, limit, total, totalPages } }`
- **Zod schemas**: Define input validation schemas at top of route file
- **Relations**: Add Drizzle relations for proper joins

### Project Structure Notes

- Route file: `packages/server/src/routes/workspace/knowledge.ts`
- Schema additions: `packages/server/src/db/schema.ts` (append after existing tables)
- Migration: `packages/server/src/db/migrations/0037_knowledge-base-schema.sql`
- Server mount: `packages/server/src/index.ts` (add route import + mount)
- Shared types: `packages/shared/src/types.ts` (if needed for frontend types)

### References

- [Source: _bmad-output/planning-artifacts/epics.md -- Epic 16]
- [Source: _bmad-output/planning-artifacts/prd.md -- FR69, FR70]
- [Source: _bmad-output/planning-artifacts/architecture.md -- knowledge.ts route, knowledge_docs/agent_memories tables]
- [Source: /home/ubuntu/CORTHEX_HQ/src/src/src/src/core/knowledge.py -- v1 KnowledgeManager]
- [Source: /home/ubuntu/CORTHEX_HQ/src/src/src/src/core/memory.py -- v1 MemoryManager]
- [Source: packages/server/src/db/schema.ts -- existing agentMemory table]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
