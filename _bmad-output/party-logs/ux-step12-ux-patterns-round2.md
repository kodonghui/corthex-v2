# UX Step 12 - UX Patterns: Round 2 (Adversarial)

**Date**: 2026-03-07
**Lens**: Adversarial -- stress-test, find holes, challenge assumptions
**Section reviewed**: step-12-ux-patterns (lines 4396~4960+)

---

## Expert Panel Discussion (Adversarial Mode)

**John (PM)**: Round 1 fixes are solid -- Global Search 4-state, 체험 크레딧 UX, 작전일지 A/B 비교 + 리플레이. Pushing harder:

1. **v1 feature #12 (기밀문서)** mentions "유사 문서 찾기 (correlation)" and "등급별 필터 (confidential 등)". These are unique filter patterns not covered in 12.2. However, 기밀문서 is Phase 2, so MINOR.

**Sally (UX)**: The onboarding with 체험 크레딧 InlineAlert is a nice touch. One edge case:

2. What happens when a Human Staff member logs in for the first time? The onboarding flow (12.6.1) only describes CEO and Admin scenarios. Human Staff doesn't see template selection or admin wizard. They should probably see a simple welcome message + "Your admin has set up your workspace" + sidebar tour. This is MINOR -- the core personas are covered.

**Winston (Architect)**: The search scope table separating CEO vs Admin search is helpful for API design. No new architectural issues. The virtual scroll + TanStack Virtual choice is correct.

**Amelia (Dev)**: Code examples and ASCII diagrams are clear. The A/B comparison split view modal is a well-known pattern. The replay flow's auto-navigation to CommandCenter is straightforward to implement with React Router.

**Quinn (QA)**: Cross-checking v1-feature-spec coverage:
- [x] #1 사령관실: CommandInput shortcuts, @멘션, /명령어 (12.5.2)
- [x] #9 작전현황: QuickAction -> CommandCenter navigation (12.1.4)
- [x] #10 통신로그: 4탭 tab pattern (12.1.3), virtual scroll (12.8.2)
- [x] #11 작전일지: A/B 비교 + 리플레이 (12.10.3), pagination (12.8.2)
- [x] #16 정보국: drag-and-drop upload (mentioned in 12.4 context)
- [x] #19 품질 게이트: quality-fail notification (12.3.4)
- [x] #21 비용 관리: budget-warning/exceeded notifications (12.3.4)

No new MAJOR issues. All Round 1 fixes address significant gaps.

---

## Issues Found

| # | Issue | Severity | Reporter |
|---|-------|----------|---------|
| 1 | 기밀문서 필터 패턴 Phase 2 미언급 | Trivial | John |
| 2 | Human Staff 온보딩 시나리오 없음 | Minor | Sally |

## Fixes Applied

1. (Trivial -- 수정 생략)
2. **Human Staff 온보딩**: 12.6.1 끝에 "Human Staff 온보딩" 단락 추가. 관리자가 초대 -> 가입 -> "환영합니다. {회사명}의 워크스페이스입니다" + 사령관실 사용법 간단 가이드 3줄 + 툴팁 자동 활성.

## Score: 8.5/10

**PASS** (8.5/10 >= 7)
