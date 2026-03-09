# Party Mode Round 1 (Collaborative) — 15-knowledge

## Experts: Mary (Analyst), Sally (UX), John (PM), Quinn (QA), Winston (Architect)

### Discussion

- **Mary** (📊): "Comprehensive data model coverage. All knowledge_folders, knowledge_docs, doc_versions, and agent_memories fields from schema are represented. Templates and injection preview endpoints also covered. The `departmentId` on folders is mentioned as secondary text — good."
- **Sally** (🎨): "The document detail view is well structured. Split editor/preview for markdown is great UX. However, the prompt mentions 'drag and drop' which might be prescriptive of visual behavior — should be softened or removed."
- **John** (📋): "21 user actions is thorough. One concern: Knowledge Injection Preview is an admin-level feature from the knowledge-injector service. Is it available in the CEO app route? Checking... yes, `/knowledge/injection-preview` exists in workspace routes. Valid."
- **Quinn** (🧪): "Edge case: What happens when folderId filtering uses 'null' or 'root' string to show root-level documents? The prompt mentions root level but should clarify this is for documents without a folder. Also, pagination state should be mentioned — does changing folders reset pagination?"
- **Sally** (🎨): "Good catch Quinn. Also, I notice the prompt says 'Content type dropdown filter (markdown / text / html / mermaid)' — but are these the correct labels? The schema uses exactly these values. Fine as data, but Lovable should decide how to display them."

### Issues Found (2)
1. **Drag-and-drop is prescriptive of visual interaction** — violates "complete creative freedom" rule
2. **Folder change should reset pagination** — not mentioned in UX considerations

### Fixes Applied
1. Changed drag-and-drop bullet to softer language: "Moving documents between folders should be easy and intuitive" (removed drag-and-drop mention)
2. Added UX consideration about pagination reset when switching folders

### Verdict: PASS (8/10, fixes applied, moving to Round 2)
