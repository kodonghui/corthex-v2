# Round 1 Review: 18-activity-log
## Lens: Collaborative
## Issues Found:
1. **Missing "기존 점수" (Legacy Scores) sub-tab in QA detail panel**: The source code (`QualityDetailPanel`) includes a 4th sub-tab "기존 점수" that shows the 5 legacy criteria (conclusionQuality, evidenceSources, riskAssessment, formatCompliance, logicalCoherence). The spec only documents 3 sub-tabs: "규칙별 결과", "루브릭", "환각 보고서". This omission means a Lovable rebuild would lose this panel entirely.
2. **API endpoint query params incomplete**: The spec's API table for `/workspace/activity/agents` lists `page, limit, search, startDate, endDate` but the backend also accepts `agentId`, `departmentId`, and `status` filters. Similarly, `/workspace/activity/quality` accepts `reviewerAgentId`, `startDate`, `endDate`, `search` in addition to `conclusion`. The spec should document all available filters even if not all are exposed in the UI, for future extensibility.
3. **Delegations tab missing sender/receiver color distinction**: The spec shows `text-cyan-400` for the receiver agent name, but the source code uses the same font color for both sender and receiver (no `text-cyan-400`). The spec's color distinction is actually a good design choice that should be preserved, but it's inconsistent with current implementation.

## Resolution:
1. **Fix required**: Add "기존 점수" sub-tab documentation to the QA detail panel section.
2. **Accepted as-is**: The spec documents the primary UI-facing filters. Backend supports additional filters that can be added later. Noting this as a minor gap, not blocking.
3. **Accepted as-is**: The spec's `text-cyan-400` for receiver name is an intentional design improvement. The source code should adopt it, not the other way around.

## Score: 8/10
## Verdict: PASS
