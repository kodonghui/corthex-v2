# Critic-A Review: Epics Step 01-02
**Score: 7.5/10**
**Reviewer:** critic-a
**Date:** 2026-03-14

## Blockers (3)

### 🔴 Issue 1: FR Count Wrong — "41 FRs" should be 45
- CM:6 + TA:4 + MCP:6 + DP:4 + RM:6 + CP:9 + WD:3 + SO:7 = 45 FRs
- Fix: Update to "45 FRs" everywhere

### 🔴 Issue 2: Story 17.1 Too Large — Must Split into 17.1a + 17.1b
- 5 concerns in one story: Types, tool_call_events DB, getDB() methods, allowed_tools JSONB, engine enforcement
- Fix: 17.1a (Types + Engine enforcement), 17.1b (Telemetry DB + allowed_tools JSONB)

### 🔴 Issue 3: callExternalApi (E16) Has No Creation Story
- Stories 17.3/17.4/17.5 reference callExternalApi but no story creates lib/call-external-api.ts
- Fix: Add AC to 17.1a creating call-external-api.ts with ToolError type mapping

## Secondary (3)
4. Story 19.2: Tool list should be data-driven from registry, not hardcoded 7 tools
5. Story 19.5: PDF download must specify server-side GET /admin/reports/:id/pdf (not "client-side or server-side")
6. Story 16.5: Delete audit using tool_call_events pattern but tool_call_events created in 17.1 — add blockedBy: 17.1 or use API-layer log
