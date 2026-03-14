# Fix Summary: Epics Step 01-02

## Applied Fixes (8 total)

### Blocker Fixes from Critic-A

**Fix A1: FR Count 41→45**
- Overview updated: "45 FRs × 8 areas" with note that 4 FRs were formalized during architecture phase
- Location: Overview paragraph

**Fix A2: Story 17.1 Split into 17.1a + 17.1b**
- 17.1a: Types (BuiltinToolHandler, ToolCallContext) + Engine enforcement (TOOL_NOT_ALLOWED + runId) — Complexity: S
- 17.1b: Telemetry DB (tool_call_events + D29 indexes + getDB() methods + agents.allowed_tools JSONB) — Complexity: M
- blockedBy for 17.2~17.5 updated: "17.1a + 17.1b" (appropriate split)
- Total stories: 30→31

**Fix A3: callExternalApi Utility Creation Added to Story 17.1a**
- New AC in 17.1a: creates `packages/server/src/lib/call-external-api.ts` with typed ToolError mapping
  - 401/403 → TOOL_CREDENTIAL_INVALID
  - 429 → TOOL_QUOTA_EXHAUSTED
  - 5xx → TOOL_EXTERNAL_SERVICE_ERROR
  - network/unknown → TOOL_EXTERNAL_SERVICE_ERROR

### Blocker Fixes from Critic-B

**Fix B1: Story 21.4 Gate 5 — Pipeline + Threshold**
- Before: `read_web_page × 3 + save_report(pdf_email)` < 300000ms
- After: `read_web_page × 1 + save_report(pdf_email)` < 240000ms (NFR-P4: simple pipeline ≤4min)

**Fix B2: Story 20.4 Wrong Credential**
- Before: "relies on `tistory_access_token`"
- After: "requires SMTP credentials (smtp_host, smtp_user, smtp_password)"
- Added partial failure note for clarity

**Fix B3: Story 18.3 Stage Numbering**
- Before: "Stages 0–4" (0-indexed, inconsistent with Architecture E12 which is 1-indexed)
- After: "Stages 1–4" (consistent with Architecture E12 + Story 18.4's "Stages 5-8")

### Secondary Fixes

**Fix S1: Story 19.2 Tool List Data-Driven**
- Before: hardcoded "md_to_pdf, read_web_page, publish_tistory, upload_media, save_report, list_reports, get_report"
- After: fetched from `GET /admin/tool-registry` — data-driven so Phase 2 tools auto-appear

**Fix S2: Story 19.5 PDF Download Server-Side**
- Before: "client-side or server-side"
- After: specified `GET /admin/reports/:id/pdf` with `Content-Disposition: attachment` header

**Fix S3: Story 16.5 Delete Audit Timing**
- Added note: delete audit uses server-logger (not tool_call_events — that's created in 17.1b)
- Clarified: tool_call_events CREDENTIAL_DELETED pattern can be retrofitted after 17.1b completes

## Remaining Non-Critical Items (deferred to implementation phase)
- Story 21.4 Gate 4 (Time-to-Value <30min): automated test only sets up metric framework; actual 3-pilot measurement is production-level validation
- NFR-P3 (call_agent <60s): no dedicated test story — covered by Phase 2 multi-agent chain PoC
- Story 19.5 explicit route file creation: AC now specifies the GET endpoint, impl story will create the file
