# Party Mode Round 3 — Forensic Review
## design-08-departments.md

### Forensic Verification

**Source Code Cross-Check:**
- departments.tsx (471 lines): All UI sections verified against render (lines 134-469) ✓
- Type definitions (lines 7-29): Department, Agent, AgentBreakdown, CascadeAnalysis, CascadeMode ✓
- tierLabels (lines 31-35): Manager/Specialist/Worker verified ✓
- formatCost (lines 37-39): USD micro conversion verified ✓
- createMutation (lines 74-84): POST endpoint and toast ✓
- updateMutation (lines 86-95): PATCH endpoint and toast ✓
- deleteMutation (lines 97-107): DELETE with mode query param ✓
- openCascadeModal (lines 109-124): Async analysis fetch ✓
- closeCascadeModal (lines 126-130): State reset ✓

**Design Token Mapping:**
- All zinc → slate mappings consistent ✓
- Indigo → blue for edit mode highlights ✓
- Green/red status pills consistent ✓
- Amber for system agent badges ✓

**Missing Elements Check:**
- Company selection prerequisite: Documented ✓
- Toast notifications on all mutations: Referenced ✓
- Delete mode query parameter: `?mode={force|wait_completion}` documented ✓
- Agent query for count calculation: Referenced ✓
- isActive field display: Status pill with active/inactive ✓

**Completeness Score:**
| Section | Score |
|---------|-------|
| Layout ASCII | 10/10 |
| Component Breakdown | 9/10 |
| Tailwind Classes | 9/10 |
| Interactions | 10/10 |
| Responsive | 8/10 |
| Animations | 8/10 |
| Accessibility | 9/10 |
| data-testid Map | 10/10 |

### Final Score: 9.1/10 — PASS
Spec is thorough and implementation-ready.
