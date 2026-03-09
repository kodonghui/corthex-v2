# Party Mode Round 2 — Adversarial Review
## prompt-05-agora.md

### Expert Panel (All 7 Experts)

**Mary (Analyst) 📊**: "The debate list API loads up to 50 debates (`limit=50` in the code). The prompt doesn't mention pagination. If a company runs many debates, 50 might not be enough. However, since the API is limit-based and the current UI doesn't paginate, this is accurate. No issue."

**Sally (UX Designer) 🎨**: "The Diff tab auto-switches to active when a completed debate is selected (code: `useEffect` sets `activeTab` to 'diff' on completion). The prompt mentions this tab exists but doesn't mention the auto-switch behavior. This is a nice UX detail that Lovable should know about — when a debate is completed, default to showing the analysis, not the metadata."

**Winston (Architect) 🏗️**: "All API endpoints match: POST /workspace/debates (create), POST /workspace/debates/:id/start (start), GET /workspace/debates (list), GET /workspace/debates/:id (detail), GET /workspace/debates/:id/timeline (timeline). The Debate type from shared/types.ts matches all fields described. No schema mismatches."

**Bob (Scrum Master) 🏃**: "Checklist: [zero visual specs?] YES. [v2 features only?] YES. [schema match?] YES — Debate, DebateRound, DebateSpeech, DebateResult all match. [handler match?] YES. [edge cases?] YES — empty, loading, error, pending states covered. [enough context?] YES."

**Quinn (QA) 🧪**: "Edge case: What happens if a debate has 0 speeches in a round? The timeline code handles this (it just shows the round header and end marker with 0 speeches). The prompt doesn't need to call this out specifically. What about a debate that fails mid-round? The error card is mentioned — good. One more: the 'back to chat' button only appears for completed debates AND when navigated from chat — this conditional visibility is in the prompt. Good."

**John (PM) 📋**: "The prompt correctly scopes AGORA as observation-only. The CEO doesn't type into the debate. This is an important philosophical distinction from the Command Center. Well captured."

**Paige (Tech Writer) 📚**: "The prompt could benefit from noting that the Diff tab is disabled (grayed out) for non-completed debates, not just hidden. The code shows `disabled: !isDiffEnabled` on the tab item. This helps Lovable understand that both tabs are always visible but Diff is only clickable when there's data."

### Adversarial Checklist
- [x] Zero visual specs? — YES
- [x] v2 features only? — YES
- [x] Schema match? — YES (Debate, DebateRound, DebateSpeech, DebateResult, ConsensusResult all in shared/types.ts)
- [x] Handler match? — YES (debates.ts route covers all endpoints)
- [x] Edge cases? — YES
- [x] Enough context? — YES

### Issues Found
1. **Diff tab auto-switch** — Tab defaults to "Diff" for completed debates, "Info" for others. Worth mentioning.
2. **Diff tab disabled state** — For non-completed debates, the Diff tab is visible but disabled/grayed out.

### Fixes Applied
- Added note about Diff tab auto-switching to active for completed debates
- Added note about Diff tab being visible but disabled for non-completed debates
