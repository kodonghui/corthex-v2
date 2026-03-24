# Story 22.2 Phase A — Fixes Applied

## Round 1 (john review — applied before cross-talk)

| # | Severity | Source | Issue | Fix |
|---|----------|--------|-------|-----|
| J1 | MUST | john | LLMProviderName contradiction | Rewrote "LLM Provider System Impact" to match Task 4.4 (keep 'google' in type) |
| J2 | SHOULD | john | Deployment steps missing | Added "Deployment Steps (Post-Merge)" section |
| J3 | SHOULD | john | Credential field name `api_key` vs `apiKey` | Updated Task 2.2 with `credentials.api_key` + `extractApiKey()` robustness |

## Round 2 (quinn review — applied before cross-talk)

| # | Severity | Source | Issue | Fix |
|---|----------|--------|-------|-----|
| Q1 | CRITICAL | quinn | `batch-collector.ts` source not in scope | Added Task 4.7 — delete `flushGoogleFallback()` + google routing block |
| Q2 | CRITICAL | quinn | `models.yaml` not in scope | Added Task 4.8 — delete gemini entries, update fallbackOrder |
| Q3 | CRITICAL | quinn | LLMProviderName contradiction | Already fixed in J1 |
| Q5 | HIGH | quinn | API key logging risk | Updated Task 2.2 — log only `{ companyId, model, errorType }` |
| Q6 | HIGH | quinn | batch-collector.test.ts underscoped | Expanded Task 7.7 with full line-by-line breakdown |

## Round 3 (winston review + cross-talk — final fixes)

| # | Severity | Source | Issue | Fix |
|---|----------|--------|-------|-----|
| W1 | CRITICAL | winston | voyageai SDK: `VoyageAIClient` not `VoyageAI` | Fixed in Task 2.2, 2.3, Dev Notes SDK block, architecture ref. All 4 occurrences updated |
| W2 | CRITICAL | winston | LLMProviderName contradiction | Already fixed in J1 |
| W3 | SHOULD | winston | models.yaml missing | Already fixed in Q2 |
| W4 | SHOULD | winston | `toCredentialProvider()` dead code | Added comment note in Task 4.6 |
| W5 | CRITICAL (Quinn) | winston | batch-collector.ts missing | Already fixed in Q1 |
| W6 | SHOULD (John) | winston | `credentials.api_key` | Already fixed in J3 |
| J4 | MUST | john (cross-talk) | models.yaml missing | Already fixed in Q2 |
| J5 | SHOULD | john (cross-talk) | 22.3 sequence constraint | Added explicit note in Dependencies — 22.3 MUST immediately follow, lists 5 affected functions |
| J-extra | SHOULD | john (cross-talk) | credential absence test | Added to Task 7.1 test list |

## Summary

- **Total issues raised**: 14 (across 3 critics + cross-talk)
- **Unique issues**: 10 (4 duplicates across critics)
- **All 10 resolved**: 3 CRITICAL, 4 MUST/HIGH, 3 SHOULD
- **Key additions**: Task 4.7 (batch-collector), Task 4.8 (models.yaml), VoyageAIClient fix, deployment steps, 22.3 sequence constraint
