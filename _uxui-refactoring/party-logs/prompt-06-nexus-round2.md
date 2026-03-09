# Party Mode Round 2 — Adversarial Review
## prompt-06-nexus.md

### Expert Panel (All 7 Experts)

**Mary (Analyst) 📊**: "The prompt mentions 'undo/redo for AI command changes' — but looking at the code, undo/redo saves the FULL canvas state before applying AI changes. It's not a general undo for manual edits (moving nodes, etc.). This distinction matters — the CEO can undo an AI-generated change but can't undo manually dragging a node. Should we clarify this?"

**Sally (UX Designer) 🎨**: "The header bar has A LOT of buttons (Save, List, Mermaid, Export, Knowledge, Undo, Redo, Agent dropdown, Chat toggle). That's 9+ interactive elements in a single row. The prompt correctly describes all of them, but the UX consideration should note that this toolbar density is intentional — it's a power-user tool, not a consumer app. Lovable might try to hide some behind a menu, which would reduce discoverability."

**Winston (Architect) 🏗️**: "The sketch persistence uses POST /workspace/sketches (create) and PUT /workspace/sketches/:id (update). The AI command hits POST /workspace/sketches/ai-command. All accurate. The WebSocket 'nexus' channel for receiving external AI updates is correctly described. No handler mismatches."

**Bob (Scrum Master) 🏃**: "Checklist: [zero visual specs?] YES. [v2 features only?] YES — all features match code. [schema match?] YES — sketches table exists. [handler match?] YES. [edge cases?] YES — empty canvas, unsaved changes confirmation, AI error, Mermaid parse error. [enough context?] YES."

**Quinn (QA) 🧪**: "Edge case: What happens when the Mermaid import produces 0 nodes (parsing succeeds but no valid nodes)? The code checks `result.nodes.length > 0` before applying. The prompt mentions 'Error message if parsing fails' but doesn't mention the 0-node case. This is minor — Lovable doesn't need to handle this edge case in wireframes."

**John (PM) 📋**: "The 'What NOT to Include' section is well-scoped. The explicit mention that org chart is excluded is important since the page is called 'Nexus' which might suggest org visualization. The workflow execution exclusion is also critical — the backend supports it but the page doesn't."

**Paige (Tech Writer) 📚**: "The node type list is excellent — 8 types with Korean labels and descriptions. The AI Command Bar section is thorough with the preview-before-apply pattern. One minor thing: the prompt says 'Undo/Redo buttons (for AI command changes, with stack depth indicator)' — the stack depth indicator is shown in the status bar, not on the buttons themselves. Buttons are just enabled/disabled."

### Adversarial Checklist
- [x] Zero visual specs? — YES
- [x] v2 features only? — YES
- [x] Schema match? — YES (canvasLayouts, nexusWorkflows not used by page; sketches endpoints used)
- [x] Handler match? — YES
- [x] Edge cases? — YES
- [x] Enough context? — YES

### Issues Found
1. **Undo/Redo scope clarification** — Only undoes AI-applied changes, not manual edits. Worth clarifying.
2. **Undo stack indicator location** — Status bar, not on buttons. Minor wording fix.

### Fixes Applied
- Clarified undo/redo applies only to AI-generated changes
- Fixed undo stack indicator location description
