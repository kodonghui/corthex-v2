# Story 26.2 Phase B Review — Critic-C (John, Product + Delivery)

## AC Verification

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AR40 | Preset JSON in `_n8n/presets/`, install via n8n API, auto-tag | PASS | `_n8n/presets/marketing-content-pipeline.json` — 66 lines, full DAG definition. `installPreset()` → POST `/api/v1/workflows` with `tags: [{ name: 'company:${companyId}' }]`. `active: false` on install. |
| FR-MKT2 | 6-stage pipeline with parallel card+video | PASS | Stages: topic-input(trigger) → ai-research(processing) → card-news + short-form (parallel, processing) → human-approval(approval) → multi-platform-post(output). `ai-research.next = ["card-news", "short-form"]` confirms parallel branch. Both converge to `human-approval`. |
| FR-MKT5 | Onboarding marketing template suggestion | PASS | `onboarding.ts:58` — `GET /api/onboarding/marketing-presets` returns `listPresets()`. Imports from preset service confirmed. |
| UXR101 | DAG node graph, execution status, history table | PASS | `marketing-pipeline.tsx` — `PipelineDAG` component groups stages by x-position into columns, `StageNode` with type-based colors (trigger=blue, processing=amber, approval=purple, output=emerald). `ExecutionHistory` table with 4 status badges (성공/실패/실행중/대기). Pipeline info cards (stages, platforms, version, executions). |

## Dimension Scores (Critic-C Weights)

| Dim | Dimension | Score | Weight | Notes |
|-----|-----------|-------|--------|-------|
| D1 | Specificity | 9 | 20% | 6 stages fully specified: id, name, type, description, n8nNodeType, position[x,y], next[]. Parallel branch explicit (ai-research → 2 children). 5 platforms (instagram, tiktok, youtube_shorts, linkedin, x). Required vs optional engines distinguished. 4 admin endpoints + 1 onboarding endpoint. Korean stage descriptions. |
| D2 | Completeness | 8 | 20% | All 4 requirements covered. Full stack: preset JSON + service (4 functions) + admin routes (4 endpoints) + onboarding + CEO DAG view. 41 tests, 97 assertions. Route registration confirmed in index.ts. But: no test for install failure path (service handles it, test doesn't verify error result shape). |
| D3 | Accuracy | 9 | 15% | DAG structure correct — n8n node types are real (`n8n-nodes-base.webhook`, `httpRequest`, `wait`, `splitInBatches`). Company tag injection matches SEC-3 pattern from 25.2. Positions create valid DAG layout (x=0→250→500→750→1000, y=-100/+100 for parallel). Connections built from `stage.next` references. |
| D4 | Implementability | 8 | 15% | Clean service separation. `_testBuildN8nWorkflow` exported for testing. Routes properly validated (Zod on install). Error handling returns structured `InstallResult`. But: synchronous `fs.readFileSync` in `listPresets()`/`getPreset()` blocks event loop (tiny files mitigate impact). `useState` with no setter is effectively a constant (misleading API). |
| D5 | Consistency | 9 | 10% | Follows admin route pattern (auth + adminOnly + tenant). `{ success, data }` / `{ success, error: { code, message } }` response format with Korean error messages. Lucide icons (GitBranch, Image, Video, etc.). 4-color stage type palette consistent with project's color coding. ko-KR date formatting + duration helpers (ms/s/m). |
| D6 | Risk Awareness | 8 | 20% | Workflows start inactive (admin activates manually). Company tag auto-injection for SEC-3 isolation. Install errors return structured result (not 500). `isPresetInstalled` prevents double-install. But: n8n API calls have no auth headers (relies solely on network isolation), name-based install detection is fragile (admin rename in n8n → false negative). |

## Weighted Score

(9×0.20) + (8×0.20) + (9×0.15) + (8×0.15) + (9×0.10) + (8×0.20) = 1.80 + 1.60 + 1.35 + 1.20 + 0.90 + 1.60 = **8.45 / 10**

## Issues

| # | Severity | Description |
|---|----------|-------------|
| 1 | MEDIUM | **`isPresetInstalled` uses name-based matching**: Line 216 checks `wf.name.startsWith(namePrefix) && wf.name.includes(preset.name)`. If an admin renames the workflow inside n8n's editor, this check returns false, allowing a duplicate install. Consider: store the n8n `workflowId` from the install response in company.settings (e.g., `settings.marketing.installedPresets[presetId] = n8nWorkflowId`), then check by ID. This is more robust than name matching. |
| 2 | LOW | **Synchronous file reads in service**: `listPresets()` and `getPreset()` use `fs.readFileSync` on every request. For the current scale (1 small JSON file, admin-only traffic), this is negligible. But it blocks the event loop. Consider: read once at startup and cache in memory (presets are static files, not user data), or use `fs.readFile` (async). |
| 3 | LOW | **`useState` without setter is misleading**: `marketing-pipeline.tsx:192` — `const [selectedPresetId] = useState('marketing-content-pipeline')`. No setter means the preset never changes. Use `const selectedPresetId = 'marketing-content-pipeline'` for clarity. The `useState` suggests future multi-preset support that doesn't exist yet. |
| 4 | LOW | **n8n API calls have no authentication**: `installPreset()` and `isPresetInstalled()` call `fetch(N8N_BASE_URL/api/v1/workflows)` without auth headers. This works because n8n is on localhost behind the SEC-1 firewall, but if n8n API auth is later enabled (n8n supports API key auth), these calls will silently fail. Document this dependency. |

## Product Assessment

Well-designed preset system that correctly separates template definition (static JSON) from runtime installation (n8n API). The 6-stage DAG is a practical marketing automation pipeline: topic input triggers research, which fans out to parallel card+video generation, converges at human approval, then posts to 5 platforms. The parallel branch (stages 3+4) is the key architectural choice — generating card news and short-form video simultaneously saves pipeline latency.

The preset JSON format is clean: each stage carries its own id, type, n8n node type, DAG position, and forward edges (`next`). The `buildN8nWorkflow()` function correctly translates this into n8n's internal format with nodes and connections. Starting workflows inactive is the right safety default.

The CEO DAG view (`PipelineDAG`) uses a column-based layout grouped by x-position — simpler than a full graph library but sufficient for a linear pipeline with one parallel branch. The 4-color stage type system (blue trigger → amber processing → purple approval → emerald output) provides visual clarity. The execution history reuses the same status/color patterns from 25.4.

The onboarding endpoint (FR-MKT5) is minimally invasive — a single GET that returns `listPresets()`. This lets the onboarding flow suggest marketing templates without coupling to the admin preset routes.

41 tests cover the preset JSON structure (6 stages, parallel branch, convergence, platform list), service functions, admin routes, onboarding endpoint, CEO UI, and route registration. The parallel branch test (ai-research.next contains both card-news and short-form) is particularly important as it validates the DAG's correctness.

## Cross-Talk Notes

- **Winston/Amelia (Critic-A, Architecture)**: The preset-as-JSON approach (AR40) is a good separation of concerns — templates are version-controlled static assets, not database records. The `buildN8nWorkflow()` translation layer abstracts the n8n internal format, making future n8n API changes isolated to one function. The `process.cwd()` + `_n8n/presets` path resolution works in both dev and Docker (cwd is project root in both cases for this monorepo).
- **Quinn/Dana (Critic-B, QA/Security)**: The `presetId` in `getPreset()` is matched against JSON content (not used as a filename), so path traversal is not a concern. The `installSchema` Zod validation (`z.string().min(1).max(100)`) limits the presetId to reasonable bounds. The company tag injection on install (`tags: [{ name: 'company:${companyId}' }]`) correctly extends SEC-3 isolation to preset-installed workflows. Note: the onboarding endpoint may have different auth requirements — verify it uses appropriate middleware for the onboarding flow context.

---

**Verdict: PASS (8.45/10)**

Epic 26 Critic-C running: 26.1=8.45, 26.2=8.45, avg **8.45**
