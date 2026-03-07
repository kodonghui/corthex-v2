# UX Step 10 - User Journeys: Round 1 (Collaborative)

**Date**: 2026-03-07
**Lens**: Collaborative -- constructive, build-on-each-other
**Section reviewed**: step-10-user-journeys (lines 3238~3570)

---

## Expert Panel Discussion

**John (PM)**: Good structure. 6 journey maps covering all 3 personas + Human Staff + 2 edge cases (cascade, quality gate). The cross-journey interaction map (10.7) is particularly valuable -- it explicitly shows data flow between Admin/CEO/Staff roles. Two issues:

1. **ISSUE: Journey 10.1 김대표 Phase A skips 가입->템플릿 transition UX**. After signup (A1), the user goes straight to template selection (A2), but HOW does the system route them there? Auto-redirect after signup? Explicit "다음" button? This transition is the single most important onboarding moment and needs explicit specification.

2. **ISSUE: No error/failure state in any journey**. What happens if a command fails mid-delegation? If WebSocket disconnects during B3-B5? The quality gate journey (10.6) covers one error case, but each journey should at least mention the primary failure mode.

**Sally (UX)**: I love the emotional state tracking per touchpoint -- this is exactly what we need for implementation. The ASCII emotion curve in 10.1 is a nice touch. Building on John's points:

3. **ISSUE: Human Staff journey (10.4) is too thin**. Only 7 touchpoints total vs 18+ for other journeys. What about the staff member's learning curve? What if they try to access a restricted department? What about their frustration when results differ from what they're used to with their personal ChatGPT? We need at least one "friction->resolution" mini-arc within 10.4.

4. The Pain Points table (10.8) is excellent -- 8 pain points with explicit solutions and design principle links. But I notice PP2 (Soul markdown editing) appears in both 10.1 and 10.2 journeys but the solution is identical. Consider differentiating: CEO needs simpler guidance, Admin needs more control.

**Winston (Architect)**: The Journey-to-Screen mapping (10.9) provides good traceability. I appreciate the Phase column. One concern:

5. **ISSUE: Real-time data flow assumptions in cross-journey interactions**. Scenario #1 says "부서 생성 즉시 CEO 앱에 반영 (실시간 WS)" but this has architectural implications. The Admin console and CEO app are separate SPAs -- do they share the same WS connection? The journey spec shouldn't assume this works magically. Add a note: "requires WS event broadcast across apps for same company" or similar.

**Amelia (Dev)**: Concise, actionable. The touchpoint tables map directly to component trees. Two items:

6. Good that 10.3 notes "Phase 참고: 전략실/자동매매는 Phase 2이나 사령관실 투자 분석은 Phase 1에서 가능" -- this prevents scope confusion. The cross-journey time axis table (Month 1, Month 3+) is useful for sprint planning.

**Quinn (QA)**: Coverage check:
- CEO (김대표): 3 journeys (10.1, 10.5, 10.6) -- good
- Admin (박과장): 1 journey (10.2) -- adequate, includes 4 phases
- Investor (이사장): 1 journey (10.3) -- good
- Human Staff: 1 journey (10.4) -- thin (agrees with Sally)
- Cross-journey: 1 section (10.7) -- good
- Error recovery: 2 journeys (10.5 cascade, 10.6 quality) -- good

Missing: **PRD Journey J5 (Admin 멀티테넌시 운영)** is not mapped to a UX journey. The PRD has 6 journeys but UX only maps 5 of them (J1->10.1, J2->10.3, J3->10.2, J4->10.5, J6->10.6). J5 (시스템 관리자의 멀티테넌시) is missing.

7. **ISSUE: PRD J5 (멀티테넌시 Admin journey) not included**. This is a P1 feature with distinct UX touchpoints (company CRUD, tenant switching, cross-tenant cost dashboard).

---

## Issues Found

| # | Issue | Severity | Reporter |
|---|-------|----------|---------|
| 1 | 가입->템플릿 전환 UX 미명시 | Medium | John |
| 2 | 여정별 실패/에러 상태 누락 | Medium | John |
| 3 | Human Staff 여정(10.4) 너무 얕음 | Medium | Sally |
| 4 | Soul 편집 Pain Point 해결책 페르소나별 미분화 | Minor | Sally |
| 5 | Cross-journey 실시간 데이터 흐름 아키텍처 가정 | Minor | Winston |
| 6 | PRD J5 (멀티테넌시 Admin) 여정 누락 | Medium | Quinn |

## Fixes Applied

1. **가입->템플릿 전환**: A1에 "가입 완료 -> 자동 리다이렉트: 조직 템플릿 선택 화면" 명시 추가
2. **실패 상태**: 각 Journey의 마지막에 "Primary Failure Mode" 단락 추가 (WS 끊김, API 에러, 타임아웃)
3. **Human Staff 확장**: Phase B에 "B5: 접근 거부 경험" + "B6: ChatGPT 경험과의 차이 인지" 단계 추가
4. **Soul Pain Point 분화**: PP2를 "PP2a: CEO (가이드 템플릿)" / "PP2b: Admin (WYSIWYG + 마크다운 전환)" 분리
5. **아키텍처 노트**: 10.7 교차점 맵에 "구현 참고: companyId 기반 WS 이벤트 브로드캐스트 필요" 주석 추가
6. **멀티테넌시 여정 추가**: 10.4와 10.5 사이에 "10.4b Journey Map: Admin 멀티테넌시 -- 회사 관리" 추가 (PRD J5 매핑)

## Score: Pre-fix 7/10, Post-fix 8/10

**PASS** (8/10 >= 7)
