# UX Step 11 - Component Strategy: Round 1 (Collaborative)

**Date**: 2026-03-07
**Lens**: Collaborative -- constructive, build-on-each-other
**Section reviewed**: step-11-component-strategy (lines 3653~4310)

---

## Expert Panel Discussion

**John (PM)**: Excellent structure. 7 complex components covering all core screens, 3 composition patterns, 4-state model, reuse strategy, and detailed form/table/real-time/modal patterns. This section bridges step-06 (Design System parts catalog) and actual implementation. Two issues:

1. **ISSUE: Human Staff persona's component needs are not addressed**. All 7 complex components are CEO or Admin oriented. Human Staff (팀원) uses the CEO app with restricted permissions (per step-10 journey 10.4). How does CommandCenter behave for a Human Staff user? Are they restricted to @mentions within their department? What components change? The section needs a note on **role-based component behavior**.

2. **ISSUE: AgentCard is listed in both @corthex/ui (step-06 as Card variant="agent") and app/components (11.4.2 as CEO-exclusive)**. The `compact` and `mention` variants are used in CEO app, but `detail` variant is used in Admin. This means AgentCard should be in @corthex/ui, not app-exclusive. The reuse table (11.4.1) doesn't list AgentCard, but 11.4.2 lists it as CEO-only. Contradiction.

**Sally (UX)**: Love the 4-state model approach -- it ensures we never show a blank screen. The ASCII diagrams for component layouts are very helpful for development. Building on the structure:

3. **ISSUE: Accessibility patterns missing**. Step-06 mentions Radix for WAI-ARIA, but step-11's complex components don't specify keyboard navigation or screen reader behavior. For example: How does DelegationChain's tree announce new nodes to screen readers? How does CascadeWizard handle step navigation with keyboard? At minimum, add an accessibility subsection with ARIA roles for key components.

4. The Empty State pattern (11.6.2) is well-defined with icon + message + CTA. But the error state pattern across components (11.3.2) shows different text messages per component but no visual consistency rule. Consider: all error states should follow the same layout as empty states (icon + message + retry button).

**Winston (Architect)**: The Zustand/TanStack Query/WebSocket boundary (11.3.3) perfectly matches Architecture Decision #005. The WS event -> query invalidation mapping is comprehensive. One concern:

5. **ISSUE: No mention of TanStack Query staleTime/cacheTime configuration**. Real-time components (DelegationChain) need near-zero staleTime, while static data (tool list) can have longer cache. Without specifying this, developers might use default staleTime for everything, causing either unnecessary refetches or stale data. Add a query configuration table.

**Amelia (Dev)**: The code examples (FormContainer, AppShell, DataTable compound) are implementation-ready. The form submission flow diagram is particularly useful. Minor note: FormContainer isn't defined in step-06's component hierarchy -- it's a new component introduced in step-11. Should it be in @corthex/ui?

**Quinn (QA)**: Coverage check against team-lead's requirements:
- [x] Key complex component specs (CommandCenter, DelegationChain, AgentCard, OrgTree, ReportViewer, AgoraDebatePanel, CostDashboard)
- [x] Component composition patterns (Layout, Slot, Compound)
- [x] State management per component (4-state model + mapping table)
- [x] Reuse strategy (3-tier + tables)
- [x] Form patterns (architecture + validation + submission flow)
- [x] Table/list patterns (6 screens + empty state)
- [x] Real-time update patterns (WS flow + per-component strategy + disconnect)
- [x] Modal/dialog patterns (4 types + confirm + cascade wizard)

All 8 required areas covered. No missing sections.

---

## Issues Found

| # | Issue | Severity | Reporter |
|---|-------|----------|---------|
| 1 | Human Staff 역할별 컴포넌트 동작 미명시 | Medium | John |
| 2 | AgentCard 재사용 위치 모순 (CEO전용 vs ui공유) | Medium | John |
| 3 | 접근성 패턴 (ARIA, 키보드 네비게이션) 누락 | Medium | Sally |
| 4 | 에러 상태 시각적 일관성 규칙 없음 | Minor | Sally |
| 5 | TanStack Query staleTime/cacheTime 설정 누락 | Minor | Winston |

## Fixes Applied

1. **역할별 동작**: 11.4 끝에 "11.4.4 역할별 컴포넌트 동작 차이" 추가. Human Staff는 CommandCenter에서 @멘션 범위가 부서 내 한정, /명령어 중 /전체 비활성, 보고서 피드백 비활성.

2. **AgentCard 위치 수정**: AgentCard를 @corthex/ui로 이동. 11.4.1 공유 레이어 테이블에 AgentCard 행 추가 (CEO: compact/card/mention, Admin: detail). 11.4.2 CEO 전용 목록에서 제거.

3. **접근성**: 11.9 앞에 "11.8.4 접근성 패턴" 추가. DelegationChain은 `role="tree"` + `aria-live="polite"`, CascadeWizard는 `role="dialog"` + `aria-labelledby` + 단계별 `aria-current="step"`, DataTable은 `role="grid"` + 열 정렬 `aria-sort`.

4. **에러 상태 일관성**: 11.3.1 4-State Model의 Error 행에 "레이아웃: 아이콘(AlertCircle 48px, danger) + 메시지 + 재시도 Button" 명시.

5. **쿼리 설정**: 11.3.3 뒤에 TanStack Query 설정 테이블 추가 (DelegationChain: staleTime 0, agents: 30초, costs: 60초, tools: 5분).

## Score: Pre-fix 7.5/10, Post-fix 8.5/10

**PASS** (8.5/10 >= 7)
