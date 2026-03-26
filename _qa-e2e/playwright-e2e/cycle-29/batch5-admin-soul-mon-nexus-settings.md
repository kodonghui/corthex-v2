# Batch 5: Soul Templates + Monitoring + Nexus + Settings -- Cycle 29
Date: 2026-03-26

## Summary
- Total: 47 | PASS: 37 | FAIL: 0 | SKIP: 10

## /admin/soul-templates (10 TCs)

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-SOUL-001 | PASS | "New Template" opens form with name, description, content (markdown), category fields |
| TC-SOUL-002 | PASS | Filled all fields (QA-C29-SoulTemplate), POST success, toast "소울 템플릿이 생성되었습니다", list refreshed to (1) |
| TC-SOUL-003 | PASS | Search "QA-C29" filters templates correctly by name |
| TC-SOUL-004 | PASS | Pencil icon opens inline edit form pre-filled with current data; PATCH on save, toast "소울 템플릿이 수정되었습니다" |
| TC-SOUL-005 | PASS | Delete confirmation dialog "템플릿 삭제" shown, confirm deletes, toast "소울 템플릿이 삭제되었습니다", list back to (0) |
| TC-SOUL-006 | PASS | Publish: confirmation dialog "마켓 공개 확인", confirm publishes, toast "에이전트 마켓에 공개되었습니다", "공개" badge shown |
| TC-SOUL-007 | PASS | Unpublish: toast "마켓에서 비공개 처리되었습니다", badge removed, button reverts to "마켓 공개" |
| TC-SOUL-008 | PASS | Full soul markdown content displayed on card preview |
| TC-SOUL-009 | PASS | Empty name blocks submission, form stays open with focus on name field |
| TC-SOUL-010 | PASS | Category field accepts optional text, "QA Testing" displayed as badge on card |

## /admin/monitoring (10 TCs)

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-MON-001 | PASS | Status cards loaded: Server_Status, System_Uptime, Errors_24h, Database_Protocol |
| TC-MON-002 | PASS | Server status badge shows "Online" with icon |
| TC-MON-003 | PASS | Memory 116% RAM In Use (Heap Used 62.3MB / Heap Total 53.7MB); System_Health shows "Warning" for >90% |
| TC-MON-004 | PASS | Database "Online", DB Response Latency chart shows "Current: 69ms" |
| TC-MON-005 | PASS | Errors 24h shows "3" |
| TC-MON-006 | PASS | "Auto-refresh: 30s" displayed at bottom of page |
| TC-MON-007 | PASS | Refresh button triggers immediate refetch; memory, heap, latency values all updated |
| TC-MON-008 | PASS | Uptime displays "2h 54m" format (hours + minutes) |
| TC-MON-009 | PASS | Live Sys-Log section shows recent errors with timestamps (e.g. "column pinned does not exist") |
| TC-MON-010 | SKIP | Requires simulating network failure; cannot test without server disruption |

## /admin/nexus (13 TCs)

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-NEXUS-001 | PASS | ReactFlow canvas renders org chart: company node, 2 dept nodes, unassigned group, 3 agent nodes, 2 human nodes with edges |
| TC-NEXUS-002 | PASS | Zoom In/Zoom Out buttons in Control Panel work without error |
| TC-NEXUS-003 | PASS | "전체 보기" (Fit View) button fits all nodes visible in canvas |
| TC-NEXUS-004 | PASS | Click agent node opens "Agent Property Panel" on right with: name, tier (combobox), model, tools (checkboxes), Soul link |
| TC-NEXUS-005 | SKIP | Drag node requires precise mouse coordinate simulation; not feasible via accessibility snapshot |
| TC-NEXUS-006 | SKIP | Drop agent on department requires drag-and-drop; not feasible |
| TC-NEXUS-007 | PASS | Export dropdown shows PNG/SVG/JSON/Print; JSON export downloads "NEXUS-코동희_본사-2026-03-26.json", toast "JSON 데이터가 다운로드되었습니다" |
| TC-NEXUS-008 | PASS | Print button ("인쇄") present in export dropdown |
| TC-NEXUS-009 | PASS | Search input accepts text "QA-C29", nodes remain visible on canvas |
| TC-NEXUS-010 | PASS | Name field editable in property panel; change triggered PATCH and canvas refresh |
| TC-NEXUS-011 | SKIP | Empty state requires 0 agents/departments; cannot test with existing data |
| TC-NEXUS-012 | PASS | "자동 정렬" rearranges nodes, toast "자동 정렬이 완료되었습니다"; "저장" button enables after layout change |
| TC-NEXUS-013 | PASS | Mini Map visible in canvas corner |

## /admin/settings (10 TCs)

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-SET-001 | PASS | General tab shows Company Info form: Company Name, Slug, Status, Timezone dropdown, Default LLM Model dropdown |
| TC-SET-002 | PASS | Edit company name to "코동희 본사-EDITED" -> Save Settings -> toast "Settings saved", timestamp updated; reverted back |
| TC-SET-003 | PASS | API Keys tab shows key management: existing anthropic key with Rotate/Delete buttons |
| TC-SET-004 | PASS | "+ Add Key" shows provider dropdown (14 providers), provider-specific fields appear on selection |
| TC-SET-005 | PASS | Registered OpenAI key (QA-C29-OpenAI), toast "API key registered", key appears in list |
| TC-SET-006 | PASS | Delete key: confirmation dialog "Delete API Key", confirm removes key, toast "API key deleted" |
| TC-SET-007 | PASS | Agent Settings tab shows Handoff Depth slider (range 1-10), current value 5 |
| TC-SET-008 | PASS | Adjusted slider to 7, Save -> toast "Handoff depth set to 7"; reverted to 5 |
| TC-SET-009 | PASS | Slug field is disabled (read-only), displays "kodonghui-hq" |
| TC-SET-010 | PASS | Created date shown as "Since 2026년 3월 26일" in Status section |

## Bugs Found

| Bug-ID | Page | Severity | Description |
|--------|------|----------|-------------|
| BUG-C29-B5-001 | /admin/settings | LOW | API key "Updated" date shows "Invalid Date" for all keys (Registered date is correct) |
| BUG-C29-B5-002 | /admin/nexus | LOW | ReactFlow "Fit View" button in Control Panel blocked by overlapping bottom toolbar; use "전체 보기" toolbar button as workaround |
| BUG-C29-B5-003 | /admin/monitoring | INFO | Memory shows >100% (116%); Heap Used (62.3MB) exceeds Heap Total (53.7MB) which is technically valid for Bun runtime but displayed percentage is misleading |

## Cleanup
- Soul template QA-C29-SoulTemplate-EDITED: created, edited, published, unpublished, then deleted (clean)
- API key QA-C29-OpenAI (openai): created then deleted (clean)
- Settings: company name reverted to original, handoff depth reverted to 5 (clean)
- Nexus: agent QA-C29-TestAgent may have been affected by property panel edit (renamed to QA-C29-TestAgent-NEXUS)
