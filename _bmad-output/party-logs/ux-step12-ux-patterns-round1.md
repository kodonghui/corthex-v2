# UX Step 12 - UX Patterns: Round 1 (Collaborative)

**Date**: 2026-03-07
**Lens**: Collaborative -- constructive, build-on-each-other
**Section reviewed**: step-12-ux-patterns (lines 4396~4942)

---

## Expert Panel Discussion

**John (PM)**: Comprehensive coverage of all 10 required pattern areas. The section builds well on step-09 (Navigation Model), step-11 (Component Strategy), and step-06 (Design System). The Command Palette (⌘+K) global search is a great power-user feature. Two issues:

1. **ISSUE: v1 feature #11 (작전일지) A/B 비교 and 리플레이 patterns not covered**. The v1-feature-spec says 작전일지 has "A/B 비교 (두 작업 결과 비교)" and "리플레이 (동일 명령 재실행)". These are unique interaction patterns that aren't described in step-12. They could be in 12.10 (export/clipboard area) or a new subsection.

2. **ISSUE: No loading/error state for Global Search**. 12.2.1 describes the search UI but doesn't specify what happens during search (spinner? skeleton?) or when search fails (error message? retry?). Step-11 mandates 4-state model for all async components.

**Sally (UX)**: Love the Toast Undo pattern with countdown -- very elegant. The 3-stage permission model (Hide/Disable/Read-only) is clear and actionable. One enhancement:

3. **ISSUE: Onboarding pattern doesn't specify API key setup UX**. Step-09 Friction Points mentions "API 키를 어떻게 발급받지?" with solution "체험 크레딧(서버 기본 키, 10회 무료)". The onboarding flow in 12.6.1 skips this -- goes from template selection straight to first command. Need to clarify: is the trial credit automatic (no UX needed) or does the user see a trial mode indicator?

4. The breadcrumb pattern (12.1.2) is good. The "← 뒤로" replacement on small screens aligns with mobile patterns.

**Winston (Architect)**: Global Search implementation needs to consider: search across entities requires a server-side search endpoint. The search scope table (12.2.1) is helpful for API design. One note:

5. The WS-driven notification table (12.3.4) references `quality-fail` event but this isn't in the Architecture Decision #8 channel definitions. Quality gate events would likely come through the `command` or `delegation` channel. This is MINOR -- the architecture doc may need updating too, not just UX.

**Amelia (Dev)**: The keyboard shortcuts tables are implementation-ready. The virtual scroll specification (TanStack Virtual) aligns with our tech stack. Good separation of undo patterns by destructiveness level. No blocking issues.

**Quinn (QA)**: Coverage check against team-lead's 10 required areas:
- [x] Navigation patterns (sidebar, breadcrumb, tab, back)
- [x] Search and filter patterns (global search, faceted filters, saved filters)
- [x] Notification patterns (toast, badge, inline alert)
- [x] Drag-and-drop patterns (org tree, SketchVibe)
- [x] Keyboard shortcuts and power user patterns
- [x] Onboarding patterns (tooltips, guided tour, progressive disclosure)
- [x] Permission-based UI patterns (hide/disable/read-only)
- [x] Infinite scroll vs pagination patterns
- [x] Undo/redo patterns
- [x] Clipboard and export patterns

All 10 areas covered. v1-feature-spec coverage: 작전일지 A/B 비교 + 리플레이 missing (John's issue #1).

---

## Issues Found

| # | Issue | Severity | Reporter |
|---|-------|----------|---------|
| 1 | 작전일지 A/B 비교 + 리플레이 패턴 누락 | Medium | John |
| 2 | Global Search 4-State (loading/error) 미명시 | Minor | John |
| 3 | 온보딩에서 체험 크레딧/API 키 안내 UX 누락 | Minor | Sally |

## Fixes Applied

1. **작전일지 패턴**: 12.10 뒤에 12.10.3 "작전일지 고급 패턴" 추가. A/B 비교: 두 명령 결과를 좌우 분할 뷰로 표시 + diff 하이라이트. 리플레이: 과거 명령을 그대로 재실행 + "리플레이 중" 인디케이터. Phase 참고 포함.

2. **Global Search 4-State**: 12.2.1에 상태 매핑 추가 -- Loading: 검색 Spinner, Error: "검색에 실패했습니다" + 재시도 링크, Empty: "결과 없음" + 추천 키워드.

3. **체험 크레딧 안내**: 12.6.1 CEO 온보딩 Step 2와 3 사이에 "체험 모드 자동 활성화" 주석 추가. 체험 크레딧은 자동 적용되므로 별도 UX 불필요. 다만 CommandInput 상단에 "체험 모드: 10회 중 N회 사용" 인라인 알림 표시.

## Score: Pre-fix 8/10, Post-fix 8.5/10

**PASS** (8.5/10 >= 7)
