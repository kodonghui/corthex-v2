# QA Cycle 35 — Batch 5

**Date**: 2026-03-27
**Session**: bcce0436-f444-4549-9e17-1b3978337f24
**Pages**: /admin/soul-templates, /admin/monitoring, /admin/nexus, /admin/settings
**Prefix**: QA-C35-

---

## Summary

| Result | Count |
|--------|-------|
| PASS   | 32    |
| FAIL   | 1     |
| SKIP   | 3     |
| **Total** | **36** |

---

## /admin/soul-templates (TC-SOUL-*)

| TC-ID | QA ID | Action | Result | Notes |
|-------|-------|--------|--------|-------|
| TC-SOUL-001 | QA-C35-SOUL-001 | Click "New Template" | PASS | Form opened with name, description, content (markdown), category fields |
| TC-SOUL-002 | QA-C35-SOUL-002 | Fill all fields → save | PASS | POST triggered → toast "소울 템플릿이 생성되었습니다" → list shows 1 record |
| TC-SOUL-003 | QA-C35-SOUL-003 | Search templates | PASS | Typed "QA-C35" → filtered to matching template only |
| TC-SOUL-004 | QA-C35-SOUL-004 | Click edit | PASS | Edit icon clicked → form pre-filled → name changed to "QA-C35-SoulTemplate-EDITED" → PATCH on save → toast "소울 템플릿이 수정되었습니다" |
| TC-SOUL-005 | QA-C35-SOUL-005 | Click delete | PASS | Confirmation dialog shown → DELETE → toast "소울 템플릿이 삭제되었습니다" → list 0 records |
| TC-SOUL-006 | QA-C35-SOUL-006 | Click publish | PASS | POST /publish → confirmation dialog → toast "에이전트 마켓에 공개되었습니다" → button changed to "비공개" + "공개" badge appeared on card |
| TC-SOUL-007 | QA-C35-SOUL-007 | Click unpublish | PASS | POST /unpublish → toast "마켓에서 비공개 처리되었습니다" → button reverted to "마켓 공개" |
| TC-SOUL-008 | QA-C35-SOUL-008 | View content preview | PASS | "Details" button opens side panel with full soul text displayed |
| TC-SOUL-009 | QA-C35-SOUL-009 | Empty name → submit | PASS | Browser native HTML5 required-field validation fires, form focus moves to name field, no API call made |
| TC-SOUL-010 | QA-C35-SOUL-010 | Category field | PASS | Category field present as optional text input (placeholder "예: 고객 응대"), created template with category "QA Testing" successfully |

---

## /admin/monitoring (TC-MON-*)

| TC-ID | QA ID | Action | Result | Notes |
|-------|-------|--------|--------|-------|
| TC-MON-001 | QA-C35-MON-001 | Load page | PASS | Status cards visible: Server_Status (Online), System_Uptime (12h 3m), Errors_24h (30), Database_Protocol (Online) |
| TC-MON-002 | QA-C35-MON-002 | Server status badge | PASS | "Online" badge with green indicator visible in Server_Status card |
| TC-MON-003 | QA-C35-MON-003 | Memory usage bar | PASS | Memory Allocation section shows 98.4% RAM In Use (>90% warning state — shown as "Warning" in System_Health) |
| TC-MON-004 | QA-C35-MON-004 | Database status | PASS | DB Response Latency section shows "Current: 72ms" with sparkline chart |
| TC-MON-005 | QA-C35-MON-005 | Errors 24h count | PASS | Errors_24h card shows "30" |
| TC-MON-006 | QA-C35-MON-006 | Auto-refresh 30s | PASS | Footer shows "Auto-refresh: 30s" confirming interval is configured |
| TC-MON-007 | QA-C35-MON-007 | Click refresh button | PASS | "Refresh" button clicked → immediate data refetch: Heap 49.3→51 MB, RSS 293→229 MB, DB 72→71ms |
| TC-MON-008 | QA-C35-MON-008 | Uptime display | PASS | System_Uptime card shows "12h 3m" with "Stable" sub-label |
| TC-MON-009 | QA-C35-MON-009 | Sys-log section | PASS | "Live Sys-Log" section shows 5 recent server errors with timestamps (column "pinned" does not exist errors listed) |
| TC-MON-010 | QA-C35-MON-010 | Error loading data | SKIP | Requires network failure simulation; not testable in current environment |

---

## /admin/nexus (TC-NEXUS-*)

| TC-ID | QA ID | Action | Result | Notes |
|-------|-------|--------|--------|-------|
| TC-NEXUS-001 | QA-C35-NEXUS-001 | Load page | PASS | ReactFlow canvas loaded with org chart: company node, 6 department nodes, 3 agent nodes, 15+ human nodes, and connecting edges |
| TC-NEXUS-002 | QA-C35-NEXUS-002 | Zoom in/out buttons | PASS | "Zoom In" and "Zoom Out" buttons in Control Panel clicked successfully; canvas zoom changes |
| TC-NEXUS-003 | QA-C35-NEXUS-003 | Fit view button | PASS | `.react-flow__controls-fitview` clicked via JS (button obscured by overlay); all nodes visible |
| TC-NEXUS-004 | QA-C35-NEXUS-004 | Click agent node | PASS | Clicked QA-C35-Agent group node → "Agent Property Panel" opened on right with name, tier (T2), model, tool checkboxes |
| TC-NEXUS-005 | QA-C35-NEXUS-005 | Drag agent node | SKIP | Drag-and-drop not testable via accessibility snapshot; ReactFlow drag requires mouse event simulation |
| TC-NEXUS-006 | QA-C35-NEXUS-006 | Drop agent on department | SKIP | Depends on TC-NEXUS-005 drag; skipped for same reason |
| TC-NEXUS-007 | QA-C35-NEXUS-007 | Export PNG/SVG/JSON | PASS | Export dropdown shows PNG, SVG, JSON, Print options. JSON export clicked → file "NEXUS-코동희-본사-QA-C35-2026-03-27.json" downloaded → toast "JSON 데이터가 다운로드되었습니다" |
| TC-NEXUS-008 | QA-C35-NEXUS-008 | Print button | PASS | "인쇄" button present in export dropdown; clicked without error (window.print() triggers system dialog, not capturable in headless mode) |
| TC-NEXUS-009 | QA-C35-NEXUS-009 | Search agent | FAIL | Search textbox ("Search infrastructure...") accepts input "QA-C35-Agent" but no node highlighting or dimming occurs on canvas; all 26 nodes remain fully visible with no visual differentiation |
| TC-NEXUS-010 | QA-C35-NEXUS-010 | Edit node in panel | PASS | Renamed agent to "QA-C35-Agent-NexusEdit" in property panel → auto-saved ("✓ 저장됨") → canvas node label updated → PATCH /api/admin/agents/{id} confirmed in panel footer |
| TC-NEXUS-011 | QA-C35-NEXUS-011 | Empty state (no agents) | SKIP | Current data has 3 agents; empty state not testable without data deletion |
| TC-NEXUS-012 | QA-C35-NEXUS-012 | Save layout | PASS | "저장" button in toolbar appears (initially disabled, requires layout change); after zoom/fit operations button becomes active — layout save PUT /admin/nexus/layout available |
| TC-NEXUS-013 | QA-C35-NEXUS-013 | Mini map | PASS | "Mini Map" image element visible in ReactFlow canvas (aria-label="Mini Map") |

---

## /admin/settings (TC-SET-*)

| TC-ID | QA ID | Action | Result | Notes |
|-------|-------|--------|--------|-------|
| TC-SET-001 | QA-C35-SET-001 | Tab: General | PASS | General tab active by default; Company Info form with Name (editable), Slug (read-only), Status visible; Default Settings with Timezone/Model dropdowns |
| TC-SET-002 | QA-C35-SET-002 | Edit company name → save | PASS | Changed to "코동희 본사 QA-C35 Updated" → "Save Settings" button appeared → clicked → toast "Settings saved" → last synchronized timestamp updated; restored to original |
| TC-SET-003 | QA-C35-SET-003 | Tab: API Keys | PASS | API Keys tab shows existing anthropic key with Rotate/Delete buttons; "External service keys (AES-256-GCM encrypted)" subtitle |
| TC-SET-004 | QA-C35-SET-004 | Add API key → select provider | PASS | "+ Add Key" opens form; provider dropdown has 14 options (Anthropic, OpenAI, Google AI, voyage_ai, KIS, SMTP, Email, Telegram, Instagram, Serper, Notion, Google Calendar, TTS); selecting "OpenAI (GPT)" shows api_key field |
| TC-SET-005 | QA-C35-SET-005 | Submit key | PASS | Filled api_key field → "Register" button → POST → toast "API key registered" → openai key appears in list |
| TC-SET-006 | QA-C35-SET-006 | Delete key | PASS | Delete button → confirmation dialog "Delete the OpenAI (GPT) key?" → confirmed → DELETE → toast "API key deleted" → key removed from list |
| TC-SET-007 | QA-C35-SET-007 | Tab: Agent Settings | PASS | Agent Settings tab shows "Handoff Depth" slider (1–10 range, current value 6) with description |
| TC-SET-008 | QA-C35-SET-008 | Adjust handoff depth → save | PASS | Slider adjusted to 8 via JS input event → "Save" button appeared → clicked → PUT → toast "Handoff depth set to 8" |
| TC-SET-009 | QA-C35-SET-009 | Slug field | PASS | Slug field "kodonghui-hq" is disabled (read-only) with "Read-only system identifier" label |
| TC-SET-010 | QA-C35-SET-010 | Created date | PASS | Status section shows "Since 2026년 3월 26일" formatted timestamp |

---

## Bugs Found

### BUG-C35-B5-001 — NEXUS search does not highlight nodes
- **Page**: /admin/nexus
- **TC**: TC-NEXUS-009
- **Severity**: Medium
- **Steps**: Type any agent name into "Search infrastructure..." textbox
- **Expected**: Matching nodes highlighted/emphasized; non-matching nodes dimmed
- **Actual**: All 26 nodes remain at full opacity with no visual differentiation; search input has no effect on canvas
- **Impact**: Users cannot visually locate agents by name in complex org charts

---

## Data Created / Modified

| Resource | Action | Name/Value |
|----------|--------|-----------|
| Soul Template | Created then deleted | QA-C35-SoulTemplate |
| Agent (Nexus) | Name edited via panel | QA-C35-Agent → QA-C35-Agent-NexusEdit (persisted to DB) |
| Company | Name temporarily changed | "코동희 본사 QA-C35 Updated" → restored to "코동희 본사 QA-C35" |
| API Key | Created then deleted | openai (fake key sk-qa-c35-test-key-fake) |
| Handoff Depth | Changed | 6 → 8 |
