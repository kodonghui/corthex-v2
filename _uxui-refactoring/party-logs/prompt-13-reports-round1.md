# Party Mode R1: Collaborative — 13-reports

**Lens**: Collaborative (friendly, constructive)
**Experts**: UX Designer, Business Analyst, Frontend Dev, QA Engineer, Korean Localization Expert

## Issues Found (2)

### Issue 1: submittedTo shows userId, not name
- **Reporter**: UX Designer
- **Severity**: Minor
- **Detail**: The API returns `submittedTo` as userId, but the prompt says it's "CEO의 userId". For display, the frontend would need to resolve this to a name. However, since the CEO is typically the only admin, this is manageable.
- **Status**: Acknowledged — the frontend can resolve userId to name from the users list. No prompt change needed since this is an implementation detail.

### Issue 2: Download action placement
- **Reporter**: Business Analyst
- **Severity**: Trivial
- **Detail**: The download action (MD export) should be noted as available from the detail view, not the list view.
- **Status**: Already correctly placed under "다운로드" section separate from list actions.

## Consensus
No actionable changes needed. Both issues are implementation details.

**PASS**
