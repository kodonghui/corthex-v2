# Party Mode Round 1 — Collaborative Review
## design-08-departments.md

### Expert Panel

**Mary (Analyst)**: "The cascade deletion wizard is the star feature of this page and it's thoroughly documented. The 4 impact metrics (agentCount, activeTaskCount, knowledgeCount, totalCostUsdMicro) match the CascadeAnalysis type (lines 19-27 of departments.tsx). The formatCost function ($usdMicro/1000000) is correctly specified. Agent breakdown with tier labels and system badges matches the source."

**Sally (UX Designer)**: "The inline editing pattern is well-captured — row transforms to inputs with save/cancel. The editing row gets a distinct background (`bg-blue-900/10`) to indicate edit mode. The radio button selection for deletion modes (wait_completion vs force) with visual distinction (blue border vs red border) is excellent UX documentation."

**Winston (Architect)**: "API endpoints are complete: GET list, GET cascade-analysis, POST create, PATCH update, DELETE with mode parameter. The cascade analysis loading state ('영향 분석 중...') and the async `openCascadeModal` function pattern are correctly documented. The mutation handlers with React Query invalidation are accurate."

**Paige (Tech Writer)**: "All Korean text matches: '부서 관리', '새 부서 만들기', '등록된 부서가 없습니다', '영향 분석 중...', '완료 대기 (권장)', '강제 종료'. The preservation notice text is verbatim from source (lines 437-440)."

### Issues Found
1. **Minor**: The spec could note that clicking the modal backdrop closes it (via `onClick={closeCascadeModal}` on the overlay)
2. **Minor**: The `agentCountByDept` helper function that counts agents per department is used for the badge but not explicitly called out

### Fixes Applied
- Issue 1: Already documented in Interactions table ("Cancel delete: Click backdrop")
- Issue 2: The badge rendering is documented with its classes; the count logic is implementation detail

### Score: 9/10 — PASS
