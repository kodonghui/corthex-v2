# Story 26.1 — Phase A+B: Marketing Settings & AI Engine Configuration

## Phase A: Analysis + Phase B: Implementation (Combined)

### Epic Reference
- Epic 26: AI Marketing Automation
- Story 26.1: Marketing Settings & AI Engine Configuration
- Requirements: FR-MKT1, FR-MKT4, FR-MKT6, AR39, AR41, MKT-1, MKT-3

### Implementation Summary

**Service** (`services/marketing-settings.ts`):
- 13 marketing engine providers across 4 categories
- AES-256-GCM encrypted API key storage in company.settings JSONB
- Atomic jsonb_set() updates (no read-modify-write race)
- Validation of engine selection against provider/model catalog
- getDecryptedApiKey() for execution-time cost attribution

**Routes** (added to `routes/admin/company-settings.ts`):
- 6 new endpoints (2 GET, 3 PUT, 1 DELETE)
- Zod validation on all write endpoints
- Reuses existing auth + admin + tenant middleware chain

**Admin UI** (`pages/marketing-settings.tsx`):
- 4 engine category cards with provider/model selection
- API key management with AES-256 encryption
- Watermark toggle switch
- Sidebar entry with Megaphone icon

### Test Results
- `marketing-settings-26-1.test.ts`: **44 tests, 95 assertions, 0 failures**
- Type-check: server + admin packages clean

### Files Created/Modified
- Created: `packages/server/src/services/marketing-settings.ts`
- Created: `packages/admin/src/pages/marketing-settings.tsx`
- Created: `packages/server/src/__tests__/unit/marketing-settings-26-1.test.ts`
- Created: `_bmad-output/implementation-artifacts/stories/26-1-marketing-settings-ai-engine-config.md`
- Modified: `packages/server/src/routes/admin/company-settings.ts` (added 6 marketing endpoints)
- Modified: `packages/admin/src/App.tsx` (added route)
- Modified: `packages/admin/src/components/sidebar.tsx` (added nav entry)
