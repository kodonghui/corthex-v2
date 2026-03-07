# UX Step 10 - User Journeys: Round 2 (Adversarial)

**Date**: 2026-03-07
**Lens**: Adversarial -- stress-test, find holes, challenge assumptions
**Section reviewed**: step-10-user-journeys (lines 3238~3620+)

---

## Expert Panel Discussion (Adversarial Mode)

**John (PM)**: Round 1 fixes were solid. The 10.4b multi-tenancy journey, expanded Human Staff journey (B5/B6), and failure modes table all address the gaps. But I'm going to push harder:

1. **ISSUE (NEW): 김대표 journey (10.1) assumes CEO = Admin**. The journey has the CEO going to Admin console (C1) to create departments. But in PRD's role model, CEO and Admin are distinct roles. For 1인 사업가 김대표, they ARE the same person. But the journey doesn't acknowledge this dual-role assumption. If 김대표 is ONLY a CEO (박과장's company), they CAN'T create departments. This role boundary needs explicit handling in the journey -- add a "prerequisite: 김대표 has Company Admin role" note, or split the journey for CEO-only vs CEO+Admin cases.

**Sally (UX)**: Good push, John. I'll add:

The emotional state descriptions are well-calibrated. But one weak spot remains:

2. The cross-journey time axis table (시간축별 교차 패턴) lists generic phases but doesn't connect to specific touchpoints. For instance, "Month 1: 모델 변경(비용 최적화)" -- which journey step is this? 10.1 C6? Making this explicit would help sprint planning. However, this is MINOR -- the table provides strategic framing which is its purpose.

**Winston (Architect)**: The architecture note on WS broadcast is appreciated. One challenge:

3. **The failure mode table in 10.1 is only in 10.1**. Journeys 10.2~10.6 don't have equivalent failure modes. While 10.6 IS an error recovery journey, 10.2 (박과장) should at least cover "what if agent creation fails?" and 10.3 (이사장) should cover "what if KIS API connection fails during auto-trading?" This is MINOR for UX spec scope since Phase 2 journeys will detail these later.

**Amelia (Dev)**: The section is implementation-ready. No blocking issues from dev perspective. The touchpoint tables map cleanly to component trees. Minor note: Journey 10.4b uses "회사 관리" screen which isn't in the Screen Inventory (10.9 table refers to "Admin 회사 관리 + 비용 대시보드" but the earlier Screen Inventory in step-09 doesn't include a "회사 관리" screen). This is cross-section consistency, not a step-10 issue.

**Quinn (QA)**: All PRD J1-J6 now covered (J5 via 10.4b). Coverage is complete. The Pain Points table has 9 items (PP1-PP8 + PP2 split into 2a/2b), all with solutions. Delight Moments table has 8 items, all linked to design principles. The Journey-to-Screen mapping is comprehensive.

No new MAJOR issues found. Round 1 fixes resolved all significant gaps.

---

## Issues Found

| # | Issue | Severity | Reporter |
|---|-------|----------|---------|
| 1 | CEO=Admin 역할 가정 미명시 (10.1 Phase C) | Minor | John |
| 2 | 시간축 테이블이 터치포인트에 연결 안 됨 | Trivial | Sally |
| 3 | 10.2~10.4b에 실패 모드 테이블 없음 | Minor | Winston |

## Fixes Applied

1. **역할 가정**: 10.1 Phase C 시작 전에 "**역할 전제**: 김대표는 1인 사업가이므로 CEO + Company Admin 역할을 겸한다. Admin 권한이 없는 CEO 사용자는 Phase C를 수행할 수 없으며, 관리자 콘솔 접근 시 '관리자에게 문의하세요' 안내를 받는다." 주석 추가
2. (Trivial -- 수정 생략)
3. (Minor -- 10.2~10.4b는 Phase 1에서 네트워크 에러 외 특수 실패 시나리오가 제한적. 범용 에러 핸들링 규칙을 10.8에 "공통 에러 처리 원칙" 단락으로 추가)

## Score: 8.5/10

**PASS** (8.5/10 >= 7)
