# Story 15.2: Soul Template Management

Status: done

## Story

As a Admin (system administrator),
I want to manage a library of soul templates (built-in and custom) that can be applied to agents,
so that I can standardize and quickly configure agent personalities across the organization.

## Acceptance Criteria

1. **Given** admin API **When** GET /api/admin/soul-templates?companyId=xxx **Then** returns all soul templates for the company: 5 built-in (read-only) + custom templates, sorted by isBuiltin desc then name asc
2. **Given** admin API **When** POST /api/admin/soul-templates with { companyId, name, description, content } **Then** creates a custom soul template (isBuiltin: false) and returns the created record
3. **Given** admin API **When** PATCH /api/admin/soul-templates/:id with { name?, description?, content? } **Then** updates the custom template. Returns 403 if isBuiltin=true
4. **Given** admin API **When** DELETE /api/admin/soul-templates/:id **Then** soft-deletes (isActive=false) the custom template. Returns 403 if isBuiltin=true
5. **Given** 5 built-in templates (Marketer, Analyst, Developer, Secretary, Researcher) **When** system starts or first company query **Then** built-in templates exist with isBuiltin=true, locked icon, no edit/delete allowed
6. **Given** admin console UI **When** navigating to /soul-templates page **Then** shows card list layout: template name + first 3 lines preview + [View Details] + [Edit][Delete] (custom only)
7. **Given** admin agent edit modal **When** editing an agent's soul **Then** top of soul editor shows [Load Template] dropdown that lists all templates. Selection triggers ConfirmDialog("Current soul will be replaced"). Confirm overwrites agent.soul and agent.adminSoul with template content
8. **Given** workspace user API **When** GET /api/workspace/soul-templates **Then** returns all active soul templates for user's company (read-only, for template browsing)
9. **Given** workspace soul editor (settings page) **When** user loads a template **Then** [Load Template] dropdown appears above editor. Selection triggers ConfirmDialog. Confirm overwrites current soul with template content (PATCH /workspace/agents/:id/soul)
10. **Given** turbo build + type-check **When** full build **Then** 8/8 success

## Tasks / Subtasks

- [x] Task 1: DB Schema - soulTemplates table + seed built-in templates (AC: #1, #5)
  - [x] `packages/server/src/db/schema.ts` - soulTemplates table with all fields
  - [x] SQL migration created via Story 15-1 (0020_soul-templates)
  - [x] soulTemplatesRelations (company + creator relations)

- [x] Task 2: Admin API - Soul Template CRUD (AC: #1, #2, #3, #4)
  - [x] `packages/server/src/routes/admin/soul-templates.ts` - GET/POST/PATCH/DELETE with zod validation
  - [x] Routes registered in `packages/server/src/index.ts`

- [x] Task 3: Admin API - Agent soul template loading (AC: #7)
  - [x] Existing PATCH /admin/agents/:id already handles soul+adminSoul updates

- [x] Task 4: Workspace API - Soul templates read-only + load (AC: #8, #9)
  - [x] `packages/server/src/routes/workspace/soul-templates.ts` - GET with tenant isolation
  - [x] Routes registered in `packages/server/src/index.ts`

- [x] Task 5: Shared types (AC: #1, #8)
  - [x] `packages/shared/src/types.ts` - SoulTemplate type added

- [x] Task 6: Admin UI - Soul Templates page (AC: #6)
  - [x] `packages/admin/src/pages/soul-templates.tsx` - Card list, CRUD, view/edit/delete modals
  - [x] Route added in `packages/admin/src/App.tsx`
  - [x] Sidebar menu item added

- [x] Task 7: Admin UI - Agent edit modal template loading (AC: #7)
  - [x] `packages/admin/src/pages/agents.tsx` - Template dropdown above soul textarea with confirm

- [x] Task 8: Workspace UI - Soul editor template loading (AC: #9)
  - [x] `packages/app/src/components/settings/soul-editor.tsx` - Template dropdown + ConfirmDialog

- [x] Task 9: Build verification (AC: #10)
  - [x] `bunx turbo build type-check` -> 8/8 success

## Dev Notes

### Existing Infrastructure (DO NOT re-implement)

1. **agents table** (`packages/server/src/db/schema.ts:92-108`)
   - soul: text - current personality (user-editable)
   - adminSoul: text - admin-set original (for reset)
   - PATCH /workspace/agents/:id/soul already exists
   - POST /workspace/agents/:id/soul/reset already exists

2. **SoulEditor component** (`packages/app/src/components/settings/soul-editor.tsx`)
   - 50/50 split: markdown editor + live preview (react-markdown)
   - Character counter (2000 chars)
   - useBlocker for unsaved changes
   - Save + Reset buttons already working

3. **Admin agents page** (`packages/admin/src/pages/agents.tsx`)
   - Agent create/edit modal with soul textarea
   - Sets both soul + adminSoul on admin edit
   - Full CRUD already working

4. **Admin route registration pattern** (`packages/server/src/routes/admin/index.ts`)
   - `app.route('/admin/xxx', xxxRoutes)` pattern

5. **Workspace route registration pattern** (`packages/server/src/routes/workspace/index.ts`)
   - `app.route('/workspace/xxx', xxxRoutes)` pattern

### DB Migration - 0024

Note: Check if Story 15-1 already created migration 0024. If so, use 0025.

```sql
CREATE TABLE soul_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  is_builtin BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX soul_templates_company_idx ON soul_templates(company_id);

-- Built-in templates (company_id NULL = available to all companies)
INSERT INTO soul_templates (name, description, content, is_builtin) VALUES
('Marketer', 'Marketing specialist soul', 'You are a marketing specialist...', true),
('Analyst', 'Data analyst soul', 'You are a data analyst...', true),
('Developer', 'Software developer soul', 'You are a software developer...', true),
('Secretary', 'Executive assistant soul', 'You are an executive assistant...', true),
('Researcher', 'Research specialist soul', 'You are a research specialist...', true);
```

### Built-in Template Content

Each built-in template should contain a comprehensive markdown soul definition (200-500 chars) with:
- Role identity and expertise areas
- Communication style
- Key responsibilities
- Decision-making approach

### Admin API Pattern (follow existing)

```typescript
// packages/server/src/routes/admin/soul-templates.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../../db'
import { soulTemplates } from '../../db/schema'
import { eq, and, or, isNull, desc, asc } from 'drizzle-orm'

const app = new Hono()

// GET /admin/soul-templates?companyId=xxx
// POST /admin/soul-templates
// PATCH /admin/soul-templates/:id
// DELETE /admin/soul-templates/:id
```

### Workspace API Pattern

```typescript
// packages/server/src/routes/workspace/soul-templates.ts
// Only GET (read-only for workspace users)
// Filter: (companyId IS NULL OR companyId = user's companyId) AND isActive = true
```

### Security

- Admin API: adminAuth middleware (existing pattern)
- Workspace API: auth middleware with companyId from JWT (existing pattern)
- Built-in templates: 403 on PATCH/DELETE attempts
- Tenant isolation: companyId filtering on all queries

### UI Pattern (Admin pages)

Follow existing admin page patterns:
- `packages/admin/src/pages/agents.tsx` - CRUD page pattern
- useMutation/useQuery (TanStack Query)
- Toast notifications via sonner
- ConfirmDialog pattern already established
- Card layout with zinc-800 bg, rounded-lg borders

### Previous Story Intelligence

- Migration 0016 previously dropped a soul_templates table - that was cleanup of pre-BMAD code
- Story 4-5 established the soul/adminSoul dual-field pattern
- SoulEditor component is well-tested and stable
- Admin agents PATCH already updates both soul and adminSoul

### Project Structure Notes

- Server routes: `packages/server/src/routes/admin/soul-templates.ts` (new)
- Server routes: `packages/server/src/routes/workspace/soul-templates.ts` (new)
- Admin UI: `packages/admin/src/pages/soul-templates.tsx` (new)
- Schema: `packages/server/src/db/schema.ts` (modify - add soulTemplates table)
- Migration: `packages/server/src/db/migrations/0024_soul-templates.sql` (new, or 0025 if 0024 taken)
- Shared: `packages/shared/src/types.ts` (modify - add SoulTemplate type)
- Admin UI: `packages/admin/src/pages/agents.tsx` (modify - add template dropdown)
- App UI: `packages/app/src/components/settings/soul-editor.tsx` (modify - add template dropdown)
- Admin router: `packages/admin/src/App.tsx` (modify - add route)

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#9.10] - Soul template UX spec
- [Source: packages/server/src/db/schema.ts:92-108] - agents table with soul/adminSoul
- [Source: packages/app/src/components/settings/soul-editor.tsx] - Existing SoulEditor component
- [Source: packages/admin/src/pages/agents.tsx] - Admin agent CRUD with soul
- [Source: packages/server/src/routes/workspace/agents.ts] - Workspace agent soul API
- [Source: packages/server/src/routes/admin/agents.ts] - Admin agent API
- [Source: packages/server/src/db/migrations/0016_unusual_northstar.sql] - Previous soul_templates drop

### Git Intelligence

Recent commit patterns:
- `7f1877d` docs: Epic 14 retrospective
- `ac92d05` feat: Story 14-5 A/B test optimization + TEA 71
- Naming: feat prefix, Story number + summary + TEA count

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1-7: DB schema, admin/workspace API, admin UI, agent template dropdown — all pre-existing from prior work
- Task 8: Added [Load Template] dropdown + ConfirmDialog to workspace soul editor (soul-editor.tsx)
- Task 9: Build verified 8/8 success, 1152 tests pass (144 integration test failures are pre-existing, require running server)

### File List

- packages/server/src/db/schema.ts (modified - soulTemplates table)
- packages/server/src/routes/admin/soul-templates.ts (new - admin CRUD API)
- packages/server/src/routes/workspace/soul-templates.ts (new - workspace read-only API)
- packages/server/src/index.ts (modified - route registration)
- packages/shared/src/types.ts (modified - SoulTemplate type)
- packages/admin/src/pages/soul-templates.tsx (new - admin UI page)
- packages/admin/src/App.tsx (modified - route added)
- packages/admin/src/components/sidebar.tsx (modified - nav item added)
- packages/admin/src/pages/agents.tsx (modified - template dropdown)
- packages/app/src/components/settings/soul-editor.tsx (modified - template dropdown + ConfirmDialog)
- packages/server/src/__tests__/unit/soul-template-mgmt.test.ts (new - 43 unit tests)
