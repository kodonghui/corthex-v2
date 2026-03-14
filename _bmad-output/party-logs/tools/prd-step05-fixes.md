# PRD Step 05+06 — Fix Summary

**Round:** 1
**Applied:** 2026-03-14
**Source:** critic-b (5 issues: 1 high, 3 moderate, 1 low)

---

## HIGH Fix

### Fix HIGH-1 — MCP INIT handshake added to pattern (Innovation 2)
**Location:** Innovation 2 code block (SPAWN→DISCOVER→MERGE→... pattern)
**Before:** Pattern started at SPAWN, jumped directly to DISCOVER (tools/list)
**After:**
- Added step 0 `RESOLVE` (credential template resolution before spawn)
- Added step 1.5 `INIT` (3-way initialize handshake: client initialize → server initialize response → client initialized notification, protocol_version: "2024-11-05")
- Pattern now: RESOLVE → SPAWN → INIT → DISCOVER → MERGE → EXECUTE → RETURN → TEARDOWN
- Added SIGKILL timeout to TEARDOWN: "SIGTERM → 5초 후 SIGKILL"
**Source:** MCP specification — `tools/list` requires completed initialize handshake first

---

## MODERATE Fixes

### Fix MODERATE-1 — RESOLVE step 0 added to pattern
**Combined with HIGH-1 above** — step 0 RESOLVE added simultaneously:
"env JSONB 내 {{credential:*}} 패턴 → credentials 테이블 실제 값 치환 (미해석 패턴 감지 시 → CREDENTIAL_TEMPLATE_UNRESOLVED 에러 + SPAWN 중단)"
**Source:** Brief line 173 — "resolved to actual value from credentials table at runtime by agent-loop.ts before child_process.spawn"

### Fix MODERATE-2 — R6: Jina Reader outage risk added
**Location:** Domain-Specific Requirements → Risk Mitigations (after R5)
**Added R6:** Jina Reader 서비스 장애 (Phase 1 HIGH 리스크)
- 위협: Jina Reader 장애 → read_web_page 100% 실패 → Phase 1 Persona Value Delivery Gate 직접 위협
- 완화: TOOL_EXTERNAL_SERVICE_ERROR: jina_reader + 재시도 제안. Phase 1 fallback 없음. Phase 2에서 Firecrawl/Bright Data 평가
- 모니터링: p95 >15초 → Jina 장애 알림 (Technical Success 임계치 재사용)
**Rationale:** R6 is more critical than R5 (Phase 3 concern) — Jina is Phase 1 critical path

### Fix MODERATE-3 — R7: YouTube API quota monitoring added
**Location:** Domain-Specific Requirements → Risk Mitigations (after R6)
**Added R7:** YouTube Data API 일일 할당량 소진 (Phase 2 MEDIUM 리스크)
- 10,000 유닛/일, videos.insert=1,600 유닛
- 80% 소진(8,000 유닛) → Admin 알림
- 100% 소진 → publish_youtube 당일 자동 비활성화 + TOOL_QUOTA_EXHAUSTED: youtube_api
**Rationale:** Firecrawl has explicit quota monitoring (line 465) — YouTube deserves identical treatment

---

## LOW Fix

### Fix LOW-1 — call_agent context overflow risk added to Innovation 1 risks
**Location:** Innovation Risk Mitigations section (Innovation 1 위험 추가)
**Added:**
- 위험: 4단계+ 핸드오프 시 누적 컨텍스트 → Claude context window 한도 초과
- Phase 1 안전 범위: 2단계 핸드오프
- 완화: Phase 2 전 3–4단계 체인 컨텍스트 누적량 측정 PoC → 컨텍스트 압축 전략 (Architecture phase)

---

## Verification Checklist
- [x] RESOLVE step 0 added (credential template resolution before spawn)
- [x] INIT step 1.5 added (3-way handshake: initialize req → initialize res → initialized notification)
- [x] Protocol version "2024-11-05" specified
- [x] TEARDOWN updated: SIGTERM → 5초 후 SIGKILL
- [x] R6 Jina Reader outage risk added (Phase 1 HIGH)
- [x] R7 YouTube API quota monitoring added (Phase 2 MEDIUM)
- [x] Innovation 1 call_agent context overflow risk added

**Ready for critic re-verification.**
