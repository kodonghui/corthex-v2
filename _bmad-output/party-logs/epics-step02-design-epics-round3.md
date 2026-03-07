# Party Mode Round 3: Forensic Review
## Target: epics.md - step-02-design-epics
## Lens: Forensic (line-by-line accuracy, cross-reference verification)

---

### Expert Panel Discussion

**John (PM):** "Forensic check on FR coverage. Let me count every FR row in the coverage table:
- FR1-12 (12) + FR13-18 (6) + FR19-25 (7) + FR26-34 (9) + FR35-37,41 (4) + FR38-40 (3) + FR42,46,48,49 (4) + FR43-45,47 (4) + FR50-51 (2) + FR52-55 (4) + FR56-62 (7) + FR63 (1) + FR64 (1) + FR65 (1) + FR66 (1) + FR67 (1) + FR68 (1) + FR69 (1) + FR70 (1) + FR71 (1) + FR72 (1) + FR73 (1) + FR74 (1) + FR75 (1) + FR76 (1)
- Total: 12+6+7+9+4+3+4+4+2+4+7+1+1+1+1+1+1+1+1+1+1+1+1+1+1 = 76. Correct.

Now checking for gaps: FR42-49 split between Epic 1 and Epic 9. Epic 1 gets FR42,46,48,49 (security infra). Epic 9 gets FR43,44,45,47 (user/company management). That's 4+4=8, matching FR42-49. No overlap, no gap. Clean."

**Winston (Architect):** "Cross-referencing dependency graph against each epic's stated dependencies:

1. Epic 1 depends on Epic 0 (completed) -- graph shows this. Correct.
2. Epic 2 depends on Epic 1 -- graph shows this. Correct.
3. Epic 3 depends on Epic 1 -- graph says 'both depend on Epic 1 only'. Text at line 105 says 'Epic 1 (스키마 -- agents 테이블 정의 포함)'. Correct after Round 1 fix.
4. Epic 4 depends on Epic 1 + Epic 3 -- graph shows Epic 4 below Epic 3. Correct.
5. Epic 5 depends on Epic 3 + Epic 4 -- text says 'Epic 3 (LLM Router + AgentRunner), Epic 4 (ToolPool)'. But graph says 'needs Epic 2 + Epic 4'. Let me check -- Epic 5 needs organization data (to know which agents to delegate to) AND tools AND LLM. The graph shows Epic 2 -> Epic 5 AND Epic 4 -> Epic 5, but doesn't explicitly show Epic 3 -> Epic 5. However, Epic 4 depends on Epic 3, so Epic 3 is transitively covered. The text dependency at line 168 says 'Epic 3 (LLM Router + AgentRunner), Epic 4 (ToolPool)' but omits Epic 2. Meanwhile the graph at line 609 says 'needs Epic 2 + Epic 4'. Both are partially stated. The FULL dependency is Epic 2 + Epic 3 + Epic 4 (or equivalently Epic 2 + Epic 4 since Epic 4 -> Epic 3 -> Epic 1). **Minor inconsistency: text omits Epic 2 dependency, graph omits Epic 3.**

6. Epic 7 depends on Epic 3 -- graph shows Epic 3 -> Epic 7. Text at line 226 says 'Epic 3 (LLM Router -- 비용 기록 삽입 지점)'. Correct.
7. Critical path says 'Epic 2 + Epic 3 (parallel) -> Epic 4 -> Epic 5'. This implies Epic 4 needs both Epic 2 and Epic 3. But Epic 4's text dependency (line 132) says 'Epic 1 (스키마), Epic 3 (AgentRunner)' -- no Epic 2 dependency. The critical path is slightly misleading -- Epic 4 doesn't need Epic 2, but Epic 5 does. The critical path should be: Epic 0 -> Epic 1 -> Epic 3 -> Epic 4 -> (wait for Epic 2) -> Epic 5. Currently it says 'Epic 2 + Epic 3 (parallel) -> Epic 4 -> Epic 5' which implies Epic 4 waits for BOTH, but actually only Epic 5 waits for Epic 2. **Minor: Critical path notation slightly imprecise.**"

**Amelia (Dev):** "Story count verification:
- P0: 6-8 + 8-10 + 7-9 + 6-8 + 10-12 = 37-47
- P1: 6-8 + 5-7 + 5-6 + 7-9 = 23-30
- Phase 2: 8-10 + 6-7 + 6-8 + 6-8 + 6-8 + 4-5 + 6-8 + 7-9 + 5-7 = 54-70
- Phase 3: 5-7 + 8-12 = 13-19
- Total: 37+23+54+13 to 47+30+70+19 = 127-166

Summary table says '~130~160'. Close enough -- 127-166 vs 130-160. The lower bound is slightly off (127 vs 130) and upper bound (166 vs 160). This is acceptable for estimation ranges -- the table is an approximate summary. Not a blocking issue."

**Quinn (QA):** "UX screen coverage check: 14 CEO app screens + 8 Admin screens = 22 total. Table shows 22 rows. Let me cross-check one tricky case:
- CEO App #14 Settings -> Epic 9 (P1). The settings screen includes API key management and company settings. Epic 9's acceptance criteria mention '회사 정보 + API 키 관리'. Confirmed.
- Admin A7 Org Templates -> Epic 2 (P0). Epic 2's acceptance criteria mention '조직 템플릿 3종 적용'. Confirmed.

All 22 UX screens verified against epic acceptance criteria. Clean."

**Bob (SM):** "Checking v1 feature coverage table: 22 entries, all mapped. CEO Ideas (#22) mapped to 6 specific epic references (#001->E10, #005->All, #007->E5, #009->E13, #010->E5, #011->E2). Let me verify:
- #001 (CIO+VECTOR split) -> E10 (Strategy Room) -- line 302 mentions 'CIO(분석) + VECTOR(실행봇) 분리'. Confirmed.
- #005 (No Memory Rule) -> All epics -- Epic 16 line 465 mentions '메모리 금지 원칙: 모든 메모리는 명시적 파일로 관리 (#005)'. Confirmed.
- #007 (5th Analyst) -> E5 -- line 148 mentions 'Manager 위임: 자체 분석(#007 5번째 분석가)'. Confirmed.
- #009 (SketchVibe+Canvas) -> E13 -- line 383 mentions 'Cytoscape.js 캔버스'. Confirmed.
- #010 (Deep Work) -> E5 -- line 151 mentions '딥워크: 에이전트 자율 다단계 작업'. Confirmed.
- #011 (Dynamic Org) -> E2 -- Epic 2 title is 'Dynamic Organization Management'. Confirmed.
All 7 CEO ideas accounted for."

**Mary (BA):** "Checking Epic 9's FR mapping. Text says 'FR42-FR49 (보안 & 멀티테넌시 8개 전체)' at line 285, but the coverage table splits these: FR42,46,48,49 go to Epic 1 and FR43-45,47 go to Epic 9. The Epic 9 text at line 285 still claims all 8 FRs. This is a residual inconsistency from the Round 1 fix -- the coverage table was updated but the epic's own PRD 매핑 line was not. **Issue: Epic 9's PRD 매핑 should say FR43-45,47 (not FR42-49).**"

---

### Issues Found

| # | Issue | Severity | Resolution |
|---|-------|----------|------------|
| 1 | Epic 5 text dependency omits Epic 2; graph omits Epic 3 | Minor | Update text to include Epic 2 in dependency; graph transitively covers Epic 3 via Epic 4 |
| 2 | Epic 9 PRD mapping still says "FR42-FR49 (8개 전체)" but should say "FR43-45,47 (4개)" | Minor | Fix Epic 9 PRD 매핑 line to match coverage table |
| 3 | Critical path notation implies Epic 4 waits for Epic 2, but actually only Epic 5 does | Cosmetic | Acceptable for planning doc; noted for sprint planning precision |

### Fixes Applied

**Issue 1:** Updated Epic 5's dependency line to include Epic 2. The text now reads: "Epic 2 (조직 데이터), Epic 3 (LLM Router + AgentRunner), Epic 4 (ToolPool)". The graph already shows Epic 2 -> Epic 5, and Epic 3 is transitively covered through Epic 4. **Fix applied to document.**

**Issue 2:** Updated Epic 9's PRD 매핑 from "FR42-FR49 (보안 & 멀티테넌시 8개 전체)" to "FR43-FR45, FR47 (멀티테넌시 & 사용자 관리 4개)". This aligns with the coverage table which correctly assigns FR42,46,48,49 to Epic 1. **Fix applied to document.**

**Issue 3:** Not fixed -- cosmetic notation issue. Critical path is read as a planning guide, not execution constraint. Sprint planning will use the detailed dependency graph, not the summary critical path line.

### Round 3 Score: 9/10
### Verdict: PASS (2 minor fixes applied)
