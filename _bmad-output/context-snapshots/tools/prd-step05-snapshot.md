# PRD Step 05+06 — Context Snapshot

**Saved:** 2026-03-14
**Steps:** step-05-domain + step-06-innovation
**Score:** critic-a 9.0/10 + critic-b 9.0/10 — PASS
**PRD File:** /home/ubuntu/corthex-v2/_bmad-output/planning-artifacts/tools-integration/prd.md (lines 422–630)

---

## Key Decisions Locked

| Decision | Value | Source |
|----------|-------|--------|
| MCP Integration Pattern (full) | RESOLVE → SPAWN → INIT → DISCOVER → MERGE → EXECUTE → RETURN → TEARDOWN (8 steps) | MCP spec + Epic 15/D17 |
| INIT handshake | initialize req → server initialize res → client initialized notification (protocol_version: "2024-11-05") | MCP specification |
| RESOLVE step | {{credential:*}} → credentials table lookup BEFORE spawn; CREDENTIAL_TEMPLATE_UNRESOLVED error on failure | Brief L173 |
| TEARDOWN | SIGTERM → 5초 후 SIGKILL | MCP process security |
| Credential storage | AES-256 암호화 저장 (Architecture phase to design) | R1 mitigation |
| Puppeteer concurrency limit | ≤10개 동시 (Architecture phase to finalize) | ARM64 24GB VPS |
| R6: Jina Reader outage | Phase 1 HIGH — no fallback in Phase 1; Phase 2: Firecrawl/Bright Data evaluation | Persona Value Delivery Gate |
| R7: YouTube API quota | 80%→Admin 알림, 100%→auto-disable + TOOL_QUOTA_EXHAUSTED | YouTube Data API v3 |
| call_agent chain Phase 1 safety | 2단계 핸드오프만 허용 (Phase 1 safe); Phase 2 PoC before 3-4단계 | Innovation 1 risk |

## Platform API Constraints Documented

| Platform | Limit | Error |
|---------|-------|-------|
| X API Basic | 3,000 tweets/month | TOOL_QUOTA_EXHAUSTED: x_api |
| Instagram Graph API | 25 API calls/hour | TOOL_RATE_LIMITED: instagram_api |
| YouTube Data API v3 | 10,000 units/day; videos.insert=1,600 units | TOOL_QUOTA_EXHAUSTED: youtube_api |
| Firecrawl Growth | 100,000 pages/month | TOOL_QUOTA_EXHAUSTED: firecrawl |
| Jina Reader | SLA 미공개; fallback 없음 (Phase 1) | TOOL_EXTERNAL_SERVICE_ERROR: jina_reader |

## Innovation Patterns Identified

1. **Natural Language → Full Pipeline Execution** — agents self-select tools + generate content (no pre-designed flow)
2. **Manual MCP Integration Pattern** — RESOLVE→SPAWN→INIT→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN for messages.create() engine
3. **Compounding Tool Value** — each tool multiplies value of existing tools through chain combinations

## Next Steps

- step-07: Project Type Analysis
- step-08: Scoping (out-of-scope, deferred items detail)
- step-09: Functional requirements
- step-10: Non-functional requirements
- step-11: Polish
- step-12: Complete
