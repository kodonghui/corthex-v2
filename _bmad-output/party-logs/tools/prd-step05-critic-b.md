---
step: prd-step05-06
reviewer: critic-b
date: 2026-03-14
sections: Domain-Specific Requirements (lines 422–510) + Innovation & Novel Patterns (lines 512–610)
---

# CRITIC-B Review: PRD Step-05 (Domain Requirements) + Step-06 (Innovation)

## Section Scores

| Section | Score | Verdict |
|---------|-------|---------|
| Compliance & Regulatory | 9/10 | ✅ PIPA scope correct, platform ToS accurate |
| Technical Constraints | 8/10 | ✅ Puppeteer formula correct; minor gap |
| Integration Requirements | 9/10 | ✅ R2 URL spec correct, credential table complete |
| Risk Mitigations (R1–R5) | 7/10 | ⚠️ YouTube quota risk missing |
| Innovation 1 (NL→Pipeline) | 9/10 | ✅ Competitive table correctly scoped |
| Innovation 2 (Manual MCP) | 7/10 | ⚠️ RESOLVE step missing from pattern |
| Innovation 3 (Compounding) | 9/10 | ✅ P(7,2)=42 math correct |
| Validation Approach | 9/10 | ✅ Gates mapped to step-03 metrics |

---

## Winston (Architect) — Architecture Consistency

**Finding 1 — MODERATE: Innovation 2 pattern missing RESOLVE step 0**

PRD lines 541–552: the 6-step SPAWN→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN code block starts with:
```
1. SPAWN: child_process.spawn(command, args, { env: resolvedCredentials })
```
`resolvedCredentials` implies pre-resolution has already occurred — but the pattern doesn't show this step. Brief line 173 explicitly states:
> "Credential injection: `{{credential:key_name}}` in env JSONB → resolved to actual value from `credentials` table at runtime by `agent-loop.ts` **before** `child_process.spawn`."

The domain risk Innovation 2 section (PRD lines 607–609) covers what happens when resolution fails (`CREDENTIAL_TEMPLATE_UNRESOLVED`), but a developer reading only the 6-step pattern in Innovation 2 would implement `child_process.spawn()` without knowing there is a mandatory pre-SPAWN template resolution step. This is architecturally critical — spawning with a literal `{{credential:notion_integration_token}}` string in env would expose the template pattern in process env and fail silently.

**Fix:** Add step 0 to the code block:
```
0. RESOLVE: env JSONB 내 {{credential:*}} 패턴 → credentials 테이블 실제 값 치환
           (미해석 패턴 감지 시 → CREDENTIAL_TEMPLATE_UNRESOLVED 에러 + SPAWN 중단)
```

**Finding 2 — VERIFIED: SPAWN step 1 now correctly reads `{ env: resolvedCredentials }`**

The step name `resolvedCredentials` (not `rawEnv`) is the only signal that resolution happened. Adding step 0 makes this explicit and complete. ✅ All 6 existing steps are accurate per Brief lines 153–162.

---

## Amelia (Dev) — Implementation Complexity & Testability

**Finding 3 — VERIFIED: Puppeteer formula correct**

PRD line 459: `Math.floor(24GB × 0.3 / 200MB)` = `Math.floor(24 × 1024 × 0.3 / 200)` = `Math.floor(36.864)` = 36. The 0.3 (30% RAM floor for Puppeteer pool) is conservative — leaves 70% for DB, API server, MCP processes. Then "다른 서비스 감안 → 실질 한도 ≤10개" is a further conservative recommendation pending Architecture phase validation. Math is correct. ✅

Brief line 113 mentions "20 concurrent session max per E-constraint" — the PRD's ≤10 Puppeteer limit within 20 concurrent sessions is intentional (not every session calls md_to_pdf simultaneously). No discrepancy. ✅

**Finding 4 — VERIFIED: YouTube API quota math**

Line 438: "기본 10,000 유닛/일, `videos.insert` = 1,600 유닛, ~6회/일"
10,000 / 1,600 = 6.25 → ≈6 uploads/day. ✅ Accurate.

---

## Quinn (QA) — Edge Cases & Coverage

**Finding 5 — MODERATE: YouTube API quota exhaustion has no R-numbered risk entry**

PRD line 438 notes "API 할당량 증가 신청 필요" inline in the Compliance section. But there is no corresponding R-numbered risk and mitigation for YouTube quota exhaustion — unlike Firecrawl (`web_crawl`) which has explicit quota monitoring at line 465:
> "Firecrawl Growth plan: 100,000 pages/month 한도. 80% 소진 시 Admin 알림, 100% 시 도구 자동 비활성화."

This asymmetry means:
- Firecrawl quota exhaustion: monitored, alerting, auto-disable ✅
- YouTube quota exhaustion (10,000 units/day): mentioned inline, no monitoring, no alert, no auto-disable ❌

If a company with active YouTube pipeline hits the daily quota at unit 10,001, `publish_youtube` will throw a 403 with no Admin notification. This is a real operational risk for Phase 2.

**Fix:** Add R6 to Risk Mitigations:
> **R6: YouTube API 일일 할당량 소진 (Phase 2, MEDIUM 리스크)**
> - 위협: 기본 10,000 유닛/일 한도, `videos.insert`=1,600 유닛. 하루 7회 업로드 시 할당량 초과 → 403 에러
> - 완화: 일일 YouTube 유닛 소비량 추적; 80% 소진(8,000 유닛) 시 Admin 알림 "YouTube 할당량 80% 소진 — Google Cloud Console에서 증가 신청 필요"; 100% 소진 시 당일 `publish_youtube` 자동 비활성화 + `TOOL_QUOTA_EXHAUSTED: youtube_api` 에러 반환

---

## Bob (SM) — Scope Realism & Dependencies

**Finding 6 — VERIFIED: Innovation competitive table scope is correct**

The Innovation 1 competitive table (lines 527–533) compares CORTHEX against n8n/Make.com/Zapier. This is intentional — it frames the "what we replace" narrative. Direct AI-native competitors (Dify, Coze, Flowise) are correctly handled in the separate Market Context section (lines 569–576). No duplication needed in the Innovation table.

The "근본적으로 다르다" claim is positioned relative to traditional workflow tools, which is the correct comparison for this innovation. The differentiation vs AI-native platforms is: Korean platform native tools + NEXUS org management + multi-tenant isolation — covered in Market Context. ✅

**Finding 7 — VERIFIED: R5 CLI-Anything risk correctly scoped**

R5 (lines 511–513): CLI-Anything TypeScript/Node.js validation deferred. The Phase 2→Phase 3 escalation path is clear. ✅

---

## Summary: Issues Requiring Fixes

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 1 | MODERATE | Innovation 2 lines 541–552 | SPAWN step uses `resolvedCredentials` but step 0 (RESOLVE) is missing from pattern |
| 2 | MODERATE | Risk Mitigations — gap | YouTube API quota exhaustion: no R-numbered risk or monitoring strategy (vs Firecrawl which has 80%/100% alerts) |

**Total: 2 issues (both moderate). No critical issues.**

---

## Verified Items (no fixes needed)

| Item | Verdict |
|------|---------|
| PIPA scope: crawled data + pdf_email distribution | ✅ Correctly scoped to company_id isolation + human responsibility for distribution |
| Tistory ToS: automated posting allowed + spam prohibition | ✅ Accurate per research |
| X API 3,000 tweets/month quota | ✅ Matches Brief line 128 |
| Instagram 25 API calls/hour rate limit | ✅ Matches Brief line 136 (media publish-specific) |
| YouTube 10,000 units/day, videos.insert=1,600, ~6/day | ✅ Math correct |
| Puppeteer ≤10 concurrency recommendation | ✅ Math correct; Architecture phase decision pending |
| R2 public URL requirement for Instagram + YouTube | ✅ Correct; security trade-off noted |
| R1 (credential AES-256) through R5 (CLI-Anything PoC) | ✅ All accurate and complete except YouTube quota gap |
| Innovation 2 steps 1–6 (SPAWN→TEARDOWN) accuracy | ✅ All steps match Brief lines 153–162 |
| cache_control + MCP simultaneously claim | ✅ Correct: messages.create() is the only path for both |
| Innovation 3 P(7,2) = 42 ordered chains | ✅ Math correct |
| Validation gates mapped to step-03 metrics | ✅ Tool diversity index + Pipeline completion correctly referenced |
| credential-scrubber applies to MCP stdio output | ✅ Correctly specified in line 455 |
| CREDENTIAL_TEMPLATE_UNRESOLVED error handling | ✅ In Innovation 2 risk section (line 607–609) |
