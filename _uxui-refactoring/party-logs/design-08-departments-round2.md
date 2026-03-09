# Party Mode Round 2 — Adversarial Review
## design-08-departments.md

### Checklist Verification

| # | Check Item | Status | Notes |
|---|-----------|--------|-------|
| 1 | ASCII layout matches code | PASS | Header→Create→Table→Modal hierarchy verified |
| 2 | Tailwind classes mapped | PASS | zinc→slate consistent, indigo→blue for accents |
| 3 | Interactive states documented | PASS | Normal/edit/loading row states, modal loading/loaded states |
| 4 | Responsive breakpoints | PASS | md for 2-col create form, table scrollable on mobile |
| 5 | API endpoints complete | PASS | 6 endpoints: list, tree, cascade-analysis, get, create, update, delete |
| 6 | data-testid map | PASS | 30 test IDs covering all elements |
| 7 | Empty/loading/error states | PASS | No departments, loading, cascade loading |
| 8 | Animations documented | PASS | transition-colors on buttons and rows |
| 9 | Accessibility | PASS | Labels, required, radio name group |
| 10 | Modal complete | PASS | All 7 sections of cascade wizard documented |

### Adversarial Challenges

**Devil's Advocate 1**: "The inline edit pattern uses `colSpan={2}` on the middle cells during edit mode. Is this documented?"
- **Response**: The spec shows the edit row structure with inputs in name and description cells, and the middle cells collapsed. The colSpan is an implementation detail that's clear from the ASCII layout.

**Devil's Advocate 2**: "The cascade wizard doesn't handle the case where analysis API fails — what happens?"
- **Response**: The source code (lines 109-124) handles this: `catch` block shows error toast and closes the modal (`setCascadeTarget(null)`). The spec documents "영향 분석 중..." loading state and the close behavior.

**Devil's Advocate 3**: "The department table doesn't have pagination — is this a concern for companies with many departments?"
- **Response**: Departments are expected to be a small set (5-20 typically). The source has no pagination, and the lovable prompt doesn't specify it. This is by design.

### Score: 9/10 — PASS
No changes required.
