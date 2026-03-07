# UX Step 13 - Responsive & Accessibility: Round 2 (Adversarial)

**Date**: 2026-03-07
**Lens**: Adversarial -- stress-test, find holes, challenge assumptions
**Section reviewed**: step-13-responsive-accessibility (lines 4989~5422)

---

## Expert Panel Discussion (Adversarial Mode)

**John (PM)**: Round 1 fixes are solid -- sidebar collapse rules, SketchVibe canvas, high contrast mode. Pushing harder:

1. **CostDashboard responsive behavior missing.** v1 feature #21 (비용 관리) includes charts (Recharts), budget bars, per-agent tables. Step 13.2 covers CommandCenter, Dashboard, OrgTree, DataTable, Modals, SketchVibe -- but CostDashboard isn't explicitly mapped. It likely follows the Dashboard pattern (13.2.2), but should confirm: do Recharts charts scale properly? Do budget progress bars stack vertically at `md`? MINOR -- the Dashboard pattern likely covers this, but an explicit note would help.

**Sally (UX)**: The forced-colors section (13.4.3) is a nice addition. One more edge:

2. **Toast positioning at `sm` breakpoint.** 13.3.2 mentions "Toast 닫기 (모바일 위치: 하단)" but step-06 and step-12 define Toast at "top-right". The sm breakpoint Toast position change isn't in 13.2 or anywhere in 13.x explicitly. Should clarify: at `sm`, Toast moves to bottom-center for better thumb reach. MINOR.

**Winston (Architect)**: No new architectural issues. The `prefers-reduced-motion` CSS reset approach is standard. The Zustand `reducedMotion` flag for JS animations is a good implementation detail. Zoom test scenarios are correct -- viewport CSS width calculations depend on physical viewport.

**Amelia (Dev)**: Implementation-ready. The column priority rules (P1/P2/P3) for DataTable are especially helpful. No blocking issues.

**Quinn (QA)**: Cross-checking v1 feature spec coverage:
- [x] #1 사령관실: CommandCenter responsive (13.2.1) + keyboard (13.7.1) + screen reader (13.11.3)
- [x] #7 SketchVibe: Canvas responsive (13.2.6) + pinch zoom (13.3.2) -- Phase 2 noted
- [x] #9 작전현황: Dashboard responsive (13.2.2)
- [x] #10 통신로그: DataTable responsive (13.2.4) + column priority
- [x] #21 비용 관리: Follows Dashboard pattern (John's note)

No new MAJOR issues. Round 1 fixes addressed all significant gaps.

---

## Issues Found

| # | Issue | Severity | Reporter |
|---|-------|----------|---------|
| 1 | CostDashboard 반응형 명시적 참조 없음 | Trivial | John |
| 2 | Toast sm 브레이크포인트 위치 변경 미명시 | Minor | Sally |

## Fixes Applied

1. (Trivial -- 13.2.2 Dashboard 패턴 적용됨을 확인. CostDashboard는 작전현황과 동일한 카드+차트 레이아웃이므로 13.2.2 패턴 그대로 적용. 별도 섹션 추가 불필요.)

2. **Toast sm 위치**: 13.2 공통 규칙 아래에 참고 추가 -- "`sm`에서 Toast 위치가 상단 우측에서 하단 중앙으로 이동 (스와이프로 닫기 지원, 13.3.2 참조)."

## Score: 8.5/10

**PASS** (8.5/10 >= 7)
