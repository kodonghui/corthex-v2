# Critic-B (QA + Security) Implementation Review — Story 24.6

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-24

---

## AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 CodeMirror `{{var}}` highlighting (UXR118) | ✅ | `MatchDecorator` with `/\{\{([^}]+)\}\}/g` regex. `ViewPlugin.fromClass` creates/updates decorations. |
| AC-2 Autocomplete on `{{` (AR15) | ✅ | `soulVariableCompletion()` matches `/\{\{(\w*)/`. 13 options with category-typed icons (keyword/variable/property). |
| AC-3 All 13 variables (7+5+1) | ✅ | `SOUL_VARIABLES` array: 7 builtin + 5 `personality_*` + `relevant_memories`. Test confirms exactly 13. |
| AC-4 Olive-themed CSS | ✅ | `.cm-soul-variable` class: `color: #5a7247`, `background-color: rgba(90, 114, 71, 0.1)`, `border-radius: 3px`, `font-weight: 600`. |
| AC-5 A/B preview (UXR136) | ✅ | `abMode` state toggle. `presetA`/`presetB` selectors. Parallel `Promise.all` API calls. Side-by-side preview panes. |
| AC-6 Variable chips (click-to-insert) | ✅ | 13 chips color-coded by category. Click inserts `{{variable_name}}` into editor. |
| AC-7 soulMode prop on CodeMirrorEditor | ✅ | `soulMode` boolean adds `soulVariableHighlight` + `soulAutocomplete` extensions. CSS injected via `<style>` with dedup `getElementById` check. |

## Security Assessment

| Item | Status | Evidence |
|------|--------|----------|
| XSS via variable names | ✅ SAFE | All 13 variable names hardcoded in `SOUL_VARIABLES` — no user input. |
| CSS injection dedup | ✅ SAFE | `document.getElementById('soul-variable-css')` check prevents duplicate `<style>` tags. Content is hardcoded string constant. |
| Autocomplete regex ReDoS | ✅ SAFE | `/\{\{(\w*)/` — linear backtracking, no nested quantifiers. |
| Highlighting regex ReDoS | ✅ SAFE | `/\{\{([^}]+)\}\}/g` — negated character class, no catastrophic backtracking. |
| A/B preview personality override | ⚠️ NOTE | `previewSoul()` (organization.ts:964) uses `Object.entries(personalityOverride)` instead of `PERSONALITY_KEYS` whitelist. NOT exploitable: Zod `.strict()` schema (agents.ts:67-70) rejects extra keys at API layer. `z.number().int().min(0).max(100)` ensures `String(val)` produces clean numeric strings only. Defense-in-depth gap only. |
| A/B preview Layer 3 strip | ⚠️ NOTE | `previewSoul()` doesn't apply control char strip (`/[\n\r\t\x00-\x1f]/g`). Not exploitable: Zod validates integers → `String(integer)` cannot contain control chars. |
| Template injection via preview | ✅ SAFE | `soul-renderer.ts` single-pass replacement — no recursive `{{` expansion possible. |

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 9/10 | Regex patterns exact. CSS hex values specific. Variable names/labels/descriptions all populated. |
| D2 완전성 | 25% | 8/10 | 24 tests (17 client + 7 server). No DOM-level CodeMirror integration tests (jsdom+CM6 incompatible — justified). Data layer fully covered. A/B preview server path tested. |
| D3 정확성 | 15% | 9/10 | Highlighting regex matches `soul-renderer.ts` replacement regex. Variable list matches soul-enricher output (7 builtin + 5 personality). Autocomplete type mapping (builtin→keyword, personality→variable, memory→property) correct. |
| D4 실행가능성 | 10% | 9/10 | 24/24 tests pass. Type-check clean. Extensions export correctly. CSS injection safe with dedup. |
| D5 일관성 | 15% | 9/10 | Natural Organic olive theme (`#5a7247`). Korean labels on all 13 variables. `SoulVariable` type exported from module. Shared `PersonalityTraits` type from `@corthex/shared`. |
| D6 리스크 | 25% | 8/10 | No XSS vectors (hardcoded config). No ReDoS (linear regexes). Zod `.strict()` gates A/B preview override. Two defense-in-depth gaps (Object.entries vs PERSONALITY_KEYS, missing Layer 3 strip) — not exploitable due to upstream Zod validation. |

### 가중 평균: 0.10(9) + 0.25(8) + 0.15(9) + 0.10(9) + 0.15(9) + 0.25(8) = 8.50/10 ✅ PASS

---

## Issues (2 non-blocking)

### 1. **[D6] previewSoul() uses Object.entries instead of PERSONALITY_KEYS whitelist**

```typescript
// organization.ts:964
for (const [key, val] of Object.entries(personalityOverride)) {
  extraVars[`personality_${key}`] = String(val)
}
```

Contrast with `soul-enricher.ts` which iterates `PERSONALITY_KEYS` constant (Layer 1 Key Boundary). The preview path bypasses this whitelist. Not exploitable because Zod `.strict()` schema upstream rejects any key outside the 5 OCEAN traits, but breaks the PER-1 defense-in-depth principle.

**Severity:** Low — Zod gate is the effective boundary. Recommend aligning with `PERSONALITY_KEYS` iteration for consistency.

### 2. **[D6] previewSoul() omits Layer 3 control character strip**

```typescript
// organization.ts:965
extraVars[`personality_${key}`] = String(val)
// vs soul-enricher.ts which does:
// String(val).replace(/[\n\r\t\x00-\x1f]/g, '')
```

Not exploitable: `val` is `z.number().int().min(0).max(100)` validated, so `String(val)` always produces `"0"`–`"100"`. But omitting the strip breaks Layer 3 consistency.

**Severity:** Very Low — theoretical only. `String(integer)` cannot produce control characters.

## Observations (non-scoring)

### Autocomplete `validFor` Pattern

```typescript
validFor: /^\{\{\w*$/
```

This constrains the autocomplete filter to only match when the cursor is still inside `{{word`. If the user types a space or special char after `{{`, the autocomplete closes. This is correct behavior — variable names are `\w+` only.

### CSS `font-weight: 600` for Variables

Variables render with `font-weight: 600` (semi-bold), making them visually distinct in the editor without being intrusive. Good UX choice for template editing.

### A/B Preview Promise.all

```typescript
const [resultA, resultB] = await Promise.all([
  api.post(`/agents/${agentId}/soul-preview`, { soul, personalityTraits: presetA.traits }),
  api.post(`/agents/${agentId}/soul-preview`, { soul, personalityTraits: presetB.traits }),
])
```

Parallel execution — correct. No race condition risk since both calls are independent reads.

---

## Verdict

**✅ PASS (8.50/10)**

Clean CodeMirror extension with correct regex patterns, proper autocomplete triggering, and full 13-variable coverage. A/B preview with personality override works through Zod-validated path. CSS highlighting follows Natural Organic olive theme. 24 tests cover data layer comprehensively. Two non-blocking defense-in-depth gaps in `previewSoul()` — both non-exploitable due to upstream Zod `.strict()` + integer validation.
