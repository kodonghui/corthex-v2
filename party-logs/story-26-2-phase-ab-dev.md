# Story 26.2 — Phase A+B: Marketing Preset Workflows

## Phase A: Analysis + Phase B: Implementation (Combined)

### Epic Reference
- Epic 26: AI Marketing Automation
- Story 26.2: Marketing Preset Workflows
- Requirements: AR40, FR-MKT2, FR-MKT5, UXR101

### Implementation Summary

**Preset JSON** (`_n8n/presets/marketing-content-pipeline.json`):
- 6-stage DAG pipeline: topic → research → card+video (parallel) → approval → multi-platform
- 5 target platforms (Instagram, TikTok, YouTube Shorts, LinkedIn, X)
- Required engines: image, video. Optional: narration, subtitles

**Service** (`services/n8n-preset-workflows.ts`):
- listPresets(), getPreset(), installPreset(), isPresetInstalled()
- n8n API install with auto company tag (SEC-3 isolation)
- Workflows start inactive (admin activates manually)

**Routes** (`routes/admin/n8n-presets.ts`):
- 4 endpoints (2 GET, 1 POST, 1 GET status)
- Zod validation, auth + admin + tenant middleware

**Onboarding** (FR-MKT5):
- GET /api/onboarding/marketing-presets endpoint added

**CEO Pipeline View** (`pages/marketing-pipeline.tsx`, UXR101):
- DAG node graph with type-based colors
- Execution history table
- Pipeline info cards

### Test Results
- `marketing-presets-26-2.test.ts`: **41 tests, 97 assertions, 0 failures**
- Type-check: server + app + admin packages clean

### Files Created/Modified
- Created: `_n8n/presets/marketing-content-pipeline.json`
- Created: `packages/server/src/services/n8n-preset-workflows.ts`
- Created: `packages/server/src/routes/admin/n8n-presets.ts`
- Created: `packages/app/src/pages/marketing-pipeline.tsx`
- Created: `packages/server/src/__tests__/unit/marketing-presets-26-2.test.ts`
- Modified: `packages/server/src/index.ts` (registered n8nPresetsRoute)
- Modified: `packages/server/src/routes/onboarding.ts` (FR-MKT5 endpoint)
- Modified: `packages/app/src/App.tsx` (route)
- Modified: `packages/app/src/components/sidebar.tsx` (nav entry)
