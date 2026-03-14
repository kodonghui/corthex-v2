# PRD Step 07+08 — Fix Summary

**Round:** 1
**Applied:** 2026-03-14
**Source:** critic-b (4 issues: 2 high, 1 moderate, 1 low) — critic-a overlap confirmed

---

## HIGH Fixes

### Fix HIGH-1 — Notion/Playwright MCP Phase label corrected (Integration Registry)
**Location:** SaaS B2B → External Integration Registry → MCP 서버 통합 우선순위 table
**Before:**
```
| Notion MCP     | Phase 1 PoC | ...
| Playwright MCP | Phase 1 PoC | ...
```
**After:**
```
| Notion MCP     | Phase 2 (Phase 1 엔지니어링 PoC — 사용자 미배포) | ...
| Playwright MCP | Phase 2 (Phase 1 엔지니어링 PoC — 사용자 미배포) | ...
```
**Added footnote:** "MCP 통합 엔진(8단계 패턴) + Admin UI는 Phase 1에 구축됨. 개별 MCP 서버 설정 템플릿은 Phase 2에서 파일럿사와 함께 검증 후 배포. '엔지니어링 PoC'는 개발팀 내부 동작 확인용 — Admin UI에 노출 안 됨."
**Source:** Product Brief line 617 + PRD Step-08 Post-MVP table + PRD Product Scope Phase 1 (MCP infra only)

### Fix HIGH-2 — Phase 4 "Phase 1과 병행 가능" header corrected
**Location:** Post-MVP → Phase 4 section
**Before:** "Phase 4 — Platform (Phase 1과 병행 가능) — Phase 1과 독립 실행 가능"
**After:** "Phase 4 — Platform (Phase 3 완료 후 순차, 일부 Phase 2/3와 병행 가능)"
**Split into sub-groups:**
- [A] Redis 전환 → 의존성: "Phase 1 안정 후 (Phase 2/3와 병행 가능)"
- [B] 플랫폼 MCP 확장 → Naver/Kakao: "Phase 1 MCP 인프라 + Phase 2 에코시스템 검증 후", Google Workspace: "Phase 2 MCP 에코시스템 확장 후"
**Source:** Brief line 633-634 — Redis "Phase 1–3 load sufficient" (not parallel to Phase 1); Naver/Kakao "Phase 4+ market validation needed"

---

## MODERATE Fix

### Fix MODERATE-1 — Workers "MCP 없음" qualified as default vs hard rule
**Location:** RBAC Matrix → 에이전트 Tier별 MCP 접근 원칙 table → Workers row
**Before:** "MCP 없음 — Tier 2+ 전용 고급 기능"
**After:** "MCP 없음 *(기본값 — Architecture phase에서 engine hard block vs. configurable default 결정 필요. `agent_mcp_access` 스키마 처리 방식이 두 경우에 상이함)*"
**Source:** Product Brief line 185: "Workers — no MCP access by default" (not hard block)

---

## LOW Fix

### Fix LOW-1 — Resource fallback tool count corrected (Journey 6 needs get_report)
**Location:** Risk Mitigation → 자원 리스크 완화 → Phase 1 일정 초과 row
**Before:** "도구 3개 (md_to_pdf + save_report + read_web_page) — Journey 2 + Journey 6 성립 가능"
**After:** "도구 4개 (md_to_pdf + save_report + **get_report** + read_web_page) — Journey 2 성립 + Journey 6 에러 복구 경로(`get_report` 필수) 가능"
**Source:** Journey 6 (최민준) requires get_report to retrieve saved report before email retry — save_report alone insufficient for error recovery

---

## Verification Checklist
- [x] Notion/Playwright MCP → Phase 2 (Phase 1 engineering PoC only, not user-deployed)
- [x] MCP footnote added distinguishing engine infra (Phase 1) vs server templates (Phase 2)
- [x] Phase 4 header corrected: sequential after Phase 3 (not parallel to Phase 1)
- [x] Phase 4 split into [A] Redis (Phase 1+ parallel) and [B] Platform MCPs (Phase 2+ only)
- [x] Workers RBAC row qualified with "기본값" + Architecture phase decision note
- [x] Resource fallback: 3 tools → 4 tools (get_report added) + Journey 6 dependency noted

**Ready for critic re-verification.**
