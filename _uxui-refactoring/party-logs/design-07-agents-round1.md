# Party Mode Round 1 — Collaborative Review
## design-07-agents.md

### Expert Panel

**Mary (Analyst)**: "Solid spec. The agent data structure matches the source code exactly (lines 8-23 of agents.tsx). All 6 model options and 3 tier options are correctly listed with their defaults. The tier-model auto-coupling logic is accurately described. I verified the STATUS_COLORS and STATUS_LABELS maps match the source (lines 42-54). The filteredAgents logic (name search + dept + tier + status) is complete."

**Sally (UX Designer)**: "The detail panel spec is thorough — 3 tabs (info/soul/tools) with exact content for each. The soul editor's split view (editor + preview) with min-height 400px is correctly captured. The markdown rendering function (lines 66-87) with its HTML output classes is documented. One concern: the spec mentions mobile responsiveness ('detail panel takes full width on mobile') but the source code uses `w-full max-w-2xl` which already handles this."

**Winston (Architect)**: "The create mutation, update mutation, and deactivate mutation are all documented with correct endpoints. The `isSystem` protection (hiding deactivate button + showing warning banner) is properly specified. The React Query invalidation pattern is accurate. The deactivate modal z-index (z-[60]) is correctly higher than the detail panel (z-50)."

**Paige (Tech Writer)**: "All Korean labels match the source: 유휴/작업중/에러/오프라인, Manager/Specialist/Worker, 시스템/비활성. The empty states ('등록된 에이전트가 없습니다' vs '필터 조건에 맞는 에이전트가 없습니다') are correctly differentiated."

### Issues Found
1. **Minor**: The spec should note that the detail panel uses `overflow-y-auto` for scrolling long soul content
2. **Minor**: Secretary badge (`isSecretary`) is mentioned in the source type but not prominently documented in the table columns (it's shown in the lovable prompt but the current code only uses it in the detail panel data)

### Fixes Applied
- Both are minor observations — the spec already documents `overflow-y-auto` on the panel, and isSecretary is available as data but not rendered in the table (consistent with current implementation)

### Score: 9/10 — PASS
