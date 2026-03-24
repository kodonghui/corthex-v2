# Story 26.2 — Phase B Review: Marketing Preset Workflows
**Critic-A (Winston) — Architect Review**
**Date**: 2026-03-24

## Files Reviewed
1. `_n8n/presets/marketing-content-pipeline.json` — 6-stage DAG preset
2. `packages/server/src/services/n8n-preset-workflows.ts` — Preset service (224 lines)
3. `packages/server/src/routes/admin/n8n-presets.ts` — 4 admin routes
4. `packages/server/src/routes/onboarding.ts` — FR-MKT5 endpoint (verified via grep)
5. `packages/app/src/pages/marketing-pipeline.tsx` — CEO pipeline view (284 lines)
6. `packages/server/src/__tests__/unit/marketing-presets-26-2.test.ts` — 41 tests

## Architecture Assessment

### Preset JSON (AR40, FR-MKT2)
6-stage DAG with correct branching:
```
topic-input → ai-research → card-news    → human-approval → multi-platform-post
                           → short-form   ↗
```
- Fan-out: `ai-research.next = ["card-news", "short-form"]` — parallel generation
- Converge: both `card-news.next` and `short-form.next` = `["human-approval"]`
- Terminal: `multi-platform-post.next = []`
- Positions form diamond: (0,0) → (250,0) → (500,±100) → (750,0) → (1000,0)
- Node types: webhook, httpRequest (×3), wait (approval), splitInBatches (posting)
- Platforms: 5 (instagram, tiktok, youtube_shorts, linkedin, x)
- Required engines: image, video. Optional: narration, subtitles
- **Verdict**: Correct DAG structure

### buildN8nWorkflow (lines 109-144)
Translates preset stages to n8n API format:
- Nodes: `stage.name` as node name, `stage.n8nNodeType` as type, `stage.position` preserved
- Connections: `connections[stage.name].main = [[...targets]]`

**n8n connection format verification**: `main[0] = [{node: A}, {node: B}]` means output 0 connects to both A and B (fan-out). This IS correct for parallel execution in n8n's format. For convergence, card-news and short-form each add a connection to human-approval independently.

- Workflow name: `[{companyId.slice(0,8)}] {preset.name}` — identifiable per company
- `active: false` — starts inactive, admin activates manually
- `tags: [{ name: 'company:{companyId}' }]` — SEC-3 auto-tagging at install
- Webhook path: `marketing/{presetId}` for trigger stage
- **Verdict**: Correct n8n API payload

### installPreset (lines 151-190)
- POSTs built workflow to `n8n/api/v1/workflows`
- Returns `InstallResult { presetId, n8nWorkflowId?, installed, error? }`
- Error handling: catches fetch errors, returns structured failure
- **Security**: Company tag injected at install — SEC-3 isolation enforced

### isPresetInstalled (lines 196-220)
- Queries n8n API with company tag filter
- Matches by name prefix `[{companyId.slice(0,8)}]` + preset name
- **Observation (MEDIUM)**: Name-based detection is fragile. If admin renames the workflow in n8n editor, it won't be detected as installed. A dedicated tag like `preset:marketing-content-pipeline` would be more reliable. This is a convenience check, not a security gate — non-blocking.

### Routes (n8n-presets.ts)
4 endpoints, all behind auth + adminOnly + tenantMiddleware:
- `GET /n8n/presets` — list summaries (sync disk read)
- `GET /n8n/presets/:id` — preset detail with stages (404 for unknown)
- `POST /n8n/presets/install` — Zod-validated presetId, calls installPreset with tenant companyId
- `GET /n8n/presets/:id/status` — checks installation via n8n API
- **Verdict**: Clean, proper auth chain

### Onboarding (FR-MKT5)
`GET /onboarding/marketing-presets` — calls `listPresets()`, returns preset summaries during onboarding flow. Simple, correct.

### CEO Pipeline View (UXR101, marketing-pipeline.tsx)
- **PipelineDAG**: Groups stages by x-position into columns, renders horizontally with arrow connectors
  - Diamond pattern: research → [card-news, short-form] appears as same column
  - Simplified visualization — no individual edge arrows, column-based layout
  - Acceptable for CEO read-only view
- **StageNode**: Color-coded by type (blue=trigger, amber=processing, purple=approval, emerald=output), per-stage Lucide icons
- **ExecutionHistory**: Status icons, duration formatting, Korean dates
- 4 info cards: stages, platforms, version, recent executions
- Loading, error, empty states
- Design tokens: olive, sand, stone — Natural Organic brand ✓

### Test Coverage (41 tests)
- Preset JSON: structure (4), 6 stages individually (6), branching (2), platforms (1), engines (1)
- Service: existence (1), listPresets (1), getPreset (1), installPreset (1), auto-tag (1), inactive (1), isPresetInstalled (1), buildN8nWorkflow (1)
- Routes: 4 endpoints (4) + middleware (1) + registration (1)
- Onboarding: endpoint (1) + import (1)
- UI: page (1) + export (1) + DAG (1) + fetch (1) + history (1) + route (1) + sidebar (1)
- Stage types: all 4 types (1), position (1), n8nNodeType (1)

## Observations

| # | Severity | Issue |
|---|----------|-------|
| 1 | **MEDIUM** | `isPresetInstalled` uses name-based detection — fragile if workflow renamed in n8n. Could use dedicated preset tag for reliability. |
| 2 | **LOW** | `buildN8nWorkflow` doesn't validate stage name uniqueness. Current preset has unique names, but no defensive check. |
| 3 | **LOW** | DAG visualization is column-based (no individual edge arrows). Simplified but acceptable for CEO read-only. |

## Scoring (Critic-A Weights)

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 Completeness | 9 | 15% | 1.35 |
| D2 UX/Clarity | 9 | 10% | 0.90 |
| D3 Accuracy | 8 | 25% | 2.00 |
| D4 Implementability | 9 | 20% | 1.80 |
| D5 Spec Alignment | 9 | 15% | 1.35 |
| D6 Risk | 9 | 15% | 1.35 |
| **Total** | | | **8.75** |

D3 at 8: name-based installation detection fragility.

## Verdict: **PASS** (8.75/10)

Clean preset system with correct DAG structure, SEC-3 auto-tagging, inactive-by-default install, and proper n8n API integration. 6-stage pipeline with parallel generation correctly modeled. One MEDIUM on installation detection reliability.
