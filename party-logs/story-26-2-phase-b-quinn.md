# Critic-B (QA + Security) Implementation Review — Story 26.2

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-24

---

## AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 AR40: Preset JSON in `_n8n/presets/` | ✅ | `_n8n/presets/marketing-content-pipeline.json`: 6 stages, 5 platforms, version 1.0.0, valid DAG with parallel branch. |
| AC-2 FR-MKT2: 6-stage pipeline | ✅ | topic-input(trigger) → ai-research(processing) → card-news + short-form(parallel processing) → human-approval(approval) → multi-platform-post(output). |
| AC-3 AR40: Install via n8n API + auto-tag | ✅ | `installPreset()` sends POST to `/api/v1/workflows` with `tags: [{ name: 'company:${companyId}' }]`. Workflow starts `active: false`. |
| AC-4 FR-MKT5: Onboarding marketing preset suggestion | ✅ | `onboarding.ts:57-60`: `GET /onboarding/marketing-presets` calls `listPresets()`. |
| AC-5 UXR101: DAG pipeline view | ✅ | `marketing-pipeline.tsx`: PipelineDAG component, StageNode with type-colored borders, ExecutionHistory table. |
| AC-6 Admin routes | ✅ | 4 endpoints: list, detail, install (Zod), status. All behind `authMiddleware + adminOnly + tenantMiddleware`. |
| AC-7 Route + sidebar registration | ✅ | CEO: `/marketing-pipeline` + "마케팅 파이프라인" + GitBranch. Admin: route registered in index.ts. |

## Security Assessment

### Preset Service (n8n-preset-workflows.ts)

| Check | Status | Evidence |
|-------|--------|----------|
| No path traversal in getPreset | ✅ SAFE | Iterates files in fixed `PRESETS_DIR` directory, compares `preset.presetId === presetId`. No user input in file path construction. |
| installPreset auto-tags for SEC-3 | ✅ SAFE | `tags: [{ name: 'company:${companyId}' }]` — same isolation pattern as existing n8n proxy. |
| Workflow starts inactive | ✅ SAFE | `active: false` — admin must manually activate in n8n editor. Prevents auto-execution of untested workflows. |
| buildN8nWorkflow companyId exposure | ✅ OK | `name: [${companyId.slice(0, 8)}] ${preset.name}` — first 8 chars of UUID in n8n workflow name. n8n is localhost/admin-only, acceptable. |
| listPresets skips invalid JSON | ✅ SAFE | `catch {}` on JSON.parse — malformed files silently skipped, won't crash server. |
| isPresetInstalled error handling | ✅ SAFE | Returns `false` on any failure — graceful degradation. |

### Admin Routes (n8n-presets.ts)

| Check | Status | Evidence |
|-------|--------|----------|
| Auth middleware | ✅ SAFE | `authMiddleware, adminOnly, tenantMiddleware` on all routes. |
| Install route Zod validation | ✅ SAFE | `presetId: z.string().min(1).max(100)`. |
| GET /:id no path construction | ✅ SAFE | `presetId` used as value comparison, not in file path. |
| 404 on missing preset | ✅ SAFE | Returns `{ success: false, error: { code: 'PRESET_NOT_FOUND' } }`. |
| `{ success, data }` format | ✅ SAFE | All 4 endpoints consistent. |

### CEO Pipeline View (marketing-pipeline.tsx)

| Check | Status | Evidence |
|-------|--------|----------|
| XSS via stage names | ✅ SAFE | Stage names from preset JSON (server-controlled), rendered in JSX text. React auto-escapes. |
| API paths | ✅ SAFE | Hardcoded preset ID: `selectedPresetId = 'marketing-content-pipeline'`. No dynamic path from user input. |
| Execution history source | ⚠️ NOTE | Fetches `/admin/n8n/executions?limit=20` — shows ALL company executions, not filtered to marketing pipeline. See Issue #1. |

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 9/10 | 6 stages with types, positions, connections, n8nNodeTypes. 5 platforms named. Required/optional engines specified. |
| D2 완전성 | 25% | 8/10 | 41 tests, 97 assertions. Covers preset structure, service, routes, onboarding, UI, stage types. Missing: duplicate install guard, execution filtering. |
| D3 정확성 | 15% | 8/10 | DAG structure correct (fork at research, join at approval). buildN8nWorkflow creates valid n8n format. But: DAG visualization uses simple column arrows, doesn't show fork/join topology. Execution history unfiltered. |
| D4 실행가능성 | 10% | 9/10 | 41/41 pass. Type-check clean. |
| D5 일관성 | 15% | 9/10 | Natural Organic theme. Korean labels. Status colors match Story 25.4. `{ success, data }` format. GitBranch icon for pipeline. |
| D6 리스크 | 25% | 8/10 | No user input in file paths. SEC-3 auto-tagging. Inactive by default. But: no duplicate install prevention, unfiltered execution data shown to CEO. |

### 가중 평균: 0.10(9) + 0.25(8) + 0.15(8) + 0.10(9) + 0.15(9) + 0.25(8) = 8.35/10 ✅ PASS

---

## Issues (3)

### 1. **[D3/D6] Execution history not filtered to marketing pipeline** (MEDIUM)

```typescript
// marketing-pipeline.tsx:201-205
const { data: execData } = useQuery({
  queryKey: ['n8n', 'executions', 'marketing'],
  queryFn: () => api.get<...>('/admin/n8n/executions?limit=20'),
  // → Returns ALL company executions, not just marketing pipeline
})
```

The CEO "마케팅 파이프라인" page shows execution history from ALL n8n workflows, not filtered to the marketing pipeline workflow. This could confuse the CEO if they have other n8n workflows.

**Fix**: After `isPresetInstalled` returns the n8nWorkflowId, filter executions:
```typescript
`/admin/n8n/executions?limit=20&workflowId=${installedWorkflowId}`
```

Requires tracking the installed workflow's n8n ID (not currently stored).

### 2. **[D2] No duplicate install prevention** (LOW)

```typescript
// installPreset() doesn't call isPresetInstalled() first
export async function installPreset(presetId: string, companyId: string): Promise<InstallResult> {
  const preset = getPreset(presetId)
  // → Directly installs without checking if already installed
  // → Admin can create duplicate workflows in n8n
}
```

`isPresetInstalled()` exists as a separate endpoint but isn't used inside `installPreset()`. Multiple installs create duplicate workflows in n8n with the same company tag and name.

**Fix**: Check before install:
```typescript
const alreadyInstalled = await isPresetInstalled(presetId, companyId)
if (alreadyInstalled) {
  return { presetId, installed: false, error: 'Preset already installed' }
}
```

### 3. **[D3] DAG visualization doesn't show fork/join topology** (LOW)

```typescript
// PipelineDAG renders columns with simple horizontal arrows between them
// Column 2 (research) → Column 3 (card-news + short-form) gets ONE arrow
// Should show: research → card-news AND research → short-form (fork)
// And: card-news → approval AND short-form → approval (join)
```

The column-based layout groups parallel stages correctly in the same column, but the arrow connector between columns is a single horizontal line. The visual doesn't represent the fork/join nature of the DAG — it looks like a linear sequence with two nodes in one column rather than an explicit parallel branch.

Not a functional issue — the structure data is correct. Purely visual. Acceptable for MVP, but could be improved with SVG path arrows.

---

## Observations (non-scoring)

### Preset Schema Extensibility
The preset JSON format is well-designed for extensibility:
- `stages[].n8nNodeType` maps directly to n8n node types
- `requiredEngines` / `optionalEngines` link to Story 26.1 engine config
- `platforms` array supports arbitrary platform addition
- `version` field enables preset updates

New presets can be added by dropping JSON files in `_n8n/presets/` — zero code changes needed. Good AR40 compliance.

### buildN8nWorkflow Connection Key Convention
Connections use `stage.name` as keys (n8n convention) but resolve next targets via `stage.id`. The `nextStage?.name ?? nextId` fallback is safe for current presets (unique names), but could be fragile if two stages share a name. Using stage UUIDs as n8n node IDs (which the code does via `id: stage.id`) is the safer approach — consider using `stage.id` consistently in connections too.

### Onboarding Integration
The FR-MKT5 onboarding endpoint (`GET /onboarding/marketing-presets`) returns preset summaries (name, description, stageCount, platforms) — enough for a suggestion card during company setup. No sensitive data exposed (no API keys, no internal IDs). Clean integration.

---

## Verdict

**✅ PASS (8.35/10)**

Well-structured preset system with clean separation: JSON templates on disk, service layer for CRUD + install, n8n API integration with SEC-3 auto-tagging. DAG pipeline view provides good visual overview. Main concern: execution history not filtered to marketing workflows, which reduces the page's usefulness. Duplicate install prevention missing but low impact.
