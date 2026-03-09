# Party Mode Round 2 — Adversarial Review: 11-messenger

## Panel (7 experts, adversarial lens)
- John (PM), Winston (Architect), Sally (UX), Amelia (Dev), Quinn (QA), Mary (Analyst), Bob (SM)

## Checklist
- [x] All light-mode classes removed (bg-white, dark:*, zinc-*, indigo-*)
- [x] Design tokens match spec (bg-slate-900 primary, bg-slate-800 elevated, border-slate-700)
- [x] Mode toggle (채널 | 대화) uses pill-style switcher with bg-slate-700 active
- [x] Channel sidebar w-72 (spec: w-72), border-r border-slate-700
- [x] Channel items: bg-blue-600/10 text-blue-400 selected, hover:bg-slate-800
- [x] Unread badge: bg-red-500 text-white text-[10px] rounded-full
- [x] Channel header: px-4 py-2.5, font-medium text-sm text-slate-100, member count, settings gear
- [x] Message bubbles: own=bg-blue-600 rounded-br-sm, others=bg-slate-800 rounded-bl-sm
- [x] Sender name: text-xs font-medium text-slate-400
- [x] Message input: bg-slate-800 border-slate-600 focus:border-blue-500 rounded-lg
- [x] Send button: bg-blue-600 hover:bg-blue-500 rounded-lg font-medium
- [x] File attach button: hover:bg-slate-700 pattern
- [x] @Mention popup: bg-slate-800 rounded-xl shadow-2xl max-h-48 w-64
- [x] Reaction badges: own=border-blue-500/50 bg-blue-600/10, other=border-slate-700
- [x] Thread panel: w-80 border-l border-slate-700 bg-slate-900
- [x] Thread original message: bg-slate-800/30 border-b border-slate-700/50
- [x] Modals: bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl
- [x] Channel settings danger zone: amber for leave, red for delete
- [x] Conversation mode bubbles: same spec as channel bubbles
- [x] AI report card: border-blue-500/30 rounded-xl, bg-blue-600/10 header
- [x] System messages: bg-slate-800 text-slate-500 text-xs rounded-full
- [x] All 6 files clean of duplicate classes
- [x] data-testid on all major interactive elements
- [x] No functionality changes — all mutations, queries, WebSocket, state preserved

## Expert Comments

**John (PM):** Adversarial check on all API endpoints. Channel CRUD (GET/POST/PUT/DELETE /workspace/messenger/channels), messages (GET/POST), members (GET/POST/DELETE), reactions (POST/DELETE), thread (GET), search (GET), unread (GET), read (POST), online-status (GET), agents (GET). Conversation CRUD (GET/POST), messages (GET/POST/DELETE), read (POST), typing (POST), leave (DELETE), share-report (POST). All preserved. The new channelDetail query for member count is additive — doesn't break anything, uses existing API endpoint.

**Winston (Architect):** I checked for structural regressions. The messenger.tsx still has 3 internal components (ChannelSettingsModal, ThreadPanel, ChannelsView) plus the exported MessengerPage. All imports remain the same. The file attachment system with FormData upload, drag-and-drop, and MAX_UPLOAD_SIZE is intact. WebSocket subscription patterns for both channels and conversations are unchanged. The unread count tracking with local state + server sync is preserved.

**Sally (UX):** I tested every hover state: channel items have hover:bg-slate-800, buttons have hover:bg-blue-500 or hover:bg-slate-700, close buttons have hover:text-slate-200, settings gear has hover:text-slate-200, reaction badges have hover:border-slate-600. The mobile responsive behavior is preserved: sidebar and chat area are mutually exclusive on mobile with showChat toggle. Thread panel is fixed position on mobile, static on desktop. The typing indicator shows the agent name with an animated pulse.

**Amelia (Dev):** Adversarial code check: I searched for any remaining duplicate classes, `dark:` prefixes, `zinc-`, `indigo-`, `bg-white` across all 6 files. Only `text-green-500` remains (Excel file icon color — intentional, not a design token issue). The `placeholder-slate-500` is used correctly in the search input. The `formatFileSize` and `getFileIcon` utility functions are preserved. All `useCallback` and `useMemo` hooks maintained. The `useEffect` cleanup functions for WebSocket listeners are intact.

**Quinn (QA):** Full data-testid coverage verified. Channel mode: messenger-page, messenger-tab-channels, messenger-tab-conversations, channels-header, create-channel-btn, channel-sidebar, channel-header, channel-settings-btn, channel-message-input, channel-send-btn, mention-popup, thread-panel. Conversation mode: conversations-view, new-conversation-btn, conversations-empty, conversations-list, conversation-item-{id}, conversation-chat, conversation-messages, conversation-input, conversation-send-btn, new-conversation-modal, share-conversation-modal, ai-report-card-{id}. Complete.

**Mary (Analyst):** Cross-referencing design spec token by token. Header `px-6 py-3 border-b border-slate-700` — confirmed. Mode toggle `bg-slate-800 rounded-lg p-0.5` with `bg-slate-700 text-slate-100 shadow-sm font-medium` active — confirmed. Sidebar `w-72 border-r border-slate-700` — confirmed. Channel item `px-3 py-2.5 border-b border-slate-800` with `bg-blue-600/10` selected — confirmed. Search input `bg-slate-800 rounded-md` — confirmed. Message bubble own `bg-blue-600 text-white rounded-lg rounded-br-sm px-3 py-2 text-sm` — confirmed. Input area `px-4 py-3 border-t border-slate-700` — confirmed. The design spec mentions `text-xl font-semibold` for the title, code has `text-xl font-semibold text-slate-50` — matches.

**Bob (SM):** No new issues found. All adversarial checks passed. TypeScript compiles cleanly. The refactoring preserves 100% of the original functionality while updating to the dark-first design system.

## New Issues from Round 2
1. **None** — All adversarial checks passed

## Verdict: PASS (9/10)
