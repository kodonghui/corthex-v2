# Party Mode Round 2 — Adversarial Review
## Page: 19-workflows (워크플로우 관리)

### Lens: Actively looking for flaws, omissions, contradictions, and ways the prompt could mislead Lovable.

### Score: 8/10 — PASS

### Issues Found

**Issue 1 (New, Medium): Prompt mentions colors for step types**
- "Tool=blue, LLM=purple, Condition=amber" and "True (green) and False (red)" — these are color prescriptions! The CRITICAL rule says the prompt must NEVER contain colors. While these describe functional distinctions (types need to be visually distinct), specifying blue/purple/amber/green/red violates the creative freedom mandate.
- **Fix Applied**: Removed color references. Changed to "each type should be visually distinct" and "True/False branches should be visually distinguishable."

**Issue 2 (New, Minor): "SVG-based" is an implementation prescription**
- The prompt says "Interactive SVG-based visual DAG editor" — this prescribes implementation technology. Lovable should choose the rendering approach (SVG, Canvas, HTML+CSS, etc.).
- **Fix Applied**: Changed to "Interactive visual DAG editor."

**Issue 3 (Carried from R1): Active/inactive toggle still missing from User Actions**
- Round 1 identified that there's no user action to toggle workflow active/inactive status. This was noted but not fixed in the prompt.
- **Fix Applied**: Added to User Actions list.

**Issue 4 (New, Minor): "JSON editor" may be too technical**
- The prompt mentions "JSON editor" which is a developer-facing feature. The context doc says "The CEO is not a developer." However, this is the Admin app, used by admins who may be more technical. And the current code has this feature.
- **Resolution**: Keep as-is. Admin app users are expected to handle some technical features.

### Fixes Applied to Prompt

1. Removed "Tool=blue, LLM=purple, Condition=amber" → "each step type (Tool, LLM, Condition) should be visually distinguishable"
2. Removed "True (green) and False (red)" → "True and False branches should be visually distinct from each other and from regular dependency edges"
3. Removed "SVG-based" → "Interactive visual DAG editor"
4. Added "Toggle a workflow's active/inactive status" to User Actions

**Verdict: PASS (8/10) — after fixes applied**
