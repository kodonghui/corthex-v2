# UX Step 11 - Component Strategy: Round 2 (Adversarial)

**Date**: 2026-03-07
**Lens**: Adversarial -- stress-test, find holes, challenge assumptions
**Section reviewed**: step-11-component-strategy (lines 3653~4382)

---

## Expert Panel Discussion (Adversarial Mode)

**John (PM)**: Round 1 fixes were solid -- role-based behavior table, AgentCard reuse fix, accessibility, query cache settings. Pushing harder:

1. **ISSUE (NEW): FormContainer is introduced but never defined in step-06 component hierarchy**. It appears in 11.5.1 code example but isn't in Atoms/Molecules/Organisms, nor in the @corthex/ui package structure. Where does it live? It's used by multiple Admin CRUD forms (AgentForm, DepartmentForm, etc.), so it should be in @corthex/ui. Add it to the component hierarchy or at minimum note it as a new Molecule in 11.5.

**Sally (UX)**: The role-based behavior table (11.4.4) is very helpful. One refinement:

2. The Investor (이사장) row says "전체 메뉴 + 전략실" in Sidebar, but per step-10 journey 10.3, the 전략실 is Phase 2. Should the Investor sidebar in Phase 1 be the same as CEO? This is TRIVIAL -- just a Phase note, not a structural issue.

**Winston (Architect)**: The TanStack Query cache table (11.3.4) aligns with architecture patterns. No new major concerns. The WS -> cache invalidation mapping in 11.7.2 is complete against the 7 WebSocket channels defined in Architecture Decision #8. Minor note:

3. The `debate` and `nexus` channels (Phase 2) don't appear in 11.7.2's real-time update table. This is expected since AgoraDebatePanel is Phase 2, but worth a brief note for completeness.

**Amelia (Dev)**: Code examples are clean and implementation-ready. The Compound Component pattern with DataTable.Search/Filters/Body/Pagination is a good pattern. No blocking issues.

**Quinn (QA)**: Cross-checking with step-06:
- step-06 defines 9 Atoms + 8 Molecules + 5 Organisms = 22 components
- step-11 adds 7 complex components + FormContainer + FormActions + AppShell + Header = ~11 new components
- Total component count ~33 -- manageable
- All step-06 components are referenced in step-11's reuse/composition context

No new MAJOR issues. Round 1 fixes addressed all significant gaps.

---

## Issues Found

| # | Issue | Severity | Reporter |
|---|-------|----------|---------|
| 1 | FormContainer/FormActions 미정의 (step-06에 없음) | Minor | John |
| 2 | 이사장 전략실 Phase 참고 누락 | Trivial | Sally |
| 3 | Phase 2 WS 채널(debate, nexus) 11.7.2 미언급 | Trivial | Winston |

## Fixes Applied

1. **FormContainer 정의**: 11.5.1에 "FormContainer와 FormActions는 @corthex/ui에 추가되는 Molecule 컴포넌트이다" 주석 추가. FormContainer Props 테이블 추가 (title, onSubmit, isSubmitting, children).

2. (Trivial -- 수정 생략)

3. (Trivial -- 수정 생략)

## Score: 8.5/10

**PASS** (8.5/10 >= 7)
