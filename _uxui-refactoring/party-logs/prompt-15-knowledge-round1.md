# Round 1 Review: 15-knowledge
## Lens: Collaborative
## Issues Found:

1. **API endpoint path mismatch: Version restore**
   - Spec says: `POST /workspace/knowledge/docs/:id/restore/:versionId`
   - Backend actual: `POST /workspace/knowledge/docs/:id/versions/:versionId/restore`
   - Source code correctly uses the backend path. Spec is wrong.

2. **API endpoint path mismatch: Memory consolidate**
   - Spec says: `POST /workspace/knowledge/memories/:agentId/consolidate`
   - Backend actual: `POST /workspace/knowledge/memories/consolidate/:agentId`
   - Segment order is reversed in spec.

3. **API endpoint path mismatch: Injection preview**
   - Spec says: `GET /workspace/knowledge/injection-preview`
   - Backend actual: `GET /workspace/knowledge/injection-preview/:agentId` (requires agentId param)
   - Spec omits the required `:agentId` path parameter.

4. **13 backend endpoints missing from spec API table**
   - `GET /folders/:id`, `GET /docs/:id/download`, `POST /folders/:id/move`, `POST /folders/bulk-delete`, `GET /folders/:id/stats`, `POST /docs/from-template`, `GET /tags`, `POST /docs/:id/tags`, `DELETE /docs/:id/tags`, `GET /search`, `GET /memories/context/:agentId`, `GET /memories/:id`, `POST /memories/:id/used`
   - Source code actively uses `/tags` endpoint and `/docs/:id/download`.

5. **Knowledge Templates and Injection Preview sections have no source code implementation**
   - Spec sections 5 and 6 describe template and injection-preview UI components.
   - Source code (knowledge.tsx) does not implement either feature at all.
   - Backend routes exist for both. Spec-to-code gap.

6. **Badge variant mapping inconsistency**
   - Spec defines custom Tailwind classes per content/memory type (e.g., `bg-blue-500/20 text-blue-400` for markdown).
   - Source code uses generic Badge component variants (`info`, `success`, `warning`, `error`) which map differently.
   - Memory type mapping also differs: spec has learning=emerald, source has learning=info(blue).

## Resolution:
- Issues 1-3: Fix API endpoint paths in spec to match backend.
- Issue 4: Add missing endpoints to spec API table.
- Issue 5: Accept as known gap -- spec describes target state; source code will catch up.
- Issue 6: Accept -- spec prescribes ideal; Badge component abstracts the actual colors.

## Score: 5/10
## Verdict: FAIL
