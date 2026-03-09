# Party Mode — prompt-02-chat — Round 2 (Adversarial)

## Expert Panel (All 7 Experts — Adversarial Mode)

### Mary (📊 Business Analyst)
"The prompt handles the secretary delegation well. New observation: the prompt says 'each session is with one specific agent' but doesn't mention that the **session title** is auto-generated from the first message. The backend creates a title based on content. Also, the code shows sessions can be **deleted** with a cascade (messages, tool calls, delegations all deleted) — the prompt mentions deletion but should emphasize it's permanent."

**New observation:** Deletion is permanent and cascading — worth noting

### Winston (🏗️ Architect)
"The prompt correctly describes cursor-based pagination. New observation: the code has a `handleScroll` function that triggers `fetchNextPage()` at 15% from top. The prompt says 'scrolling to the top' which is close but the trigger is earlier. More importantly, the prompt doesn't mention that the chat uses `useInfiniteQuery` which means **pages of messages stack** — the most recent page is loaded first, older pages prepend. This affects scroll position management."

**New observation:** Scroll position preservation during page prepend is a UX detail worth noting

### Sally (🎨 UX Designer)
"The prompt covers mobile responsiveness but new observation: the code has a `showChat` state that toggles between session list and chat area on mobile. There's a **back button** to return to session list. The prompt mentions this but should also note that on mobile, the agent selection modal should be full-screen."

**New observation:** Mobile agent selection modal behavior

### John (📋 Product Manager)
"New observation: the prompt doesn't mention **role-based access** for Chat. Like Command Center, employees can only chat with agents in their assigned departments. The agent selection modal should filter accordingly."

**New observation:** Employee department scope filtering for agent list

### Quinn (🧪 QA Engineer)
"New observation: what happens when the agent the user is chatting with goes **offline** mid-conversation? The code subscribes to `agent-status` changes. The prompt mentions 'Agent offline → disable send' but only for initial state. What about an agent going offline during an active chat?"

**New observation:** Agent status change during active session

### Amelia (💻 Developer)
"New observation: the prompt mentions 'file attachment button' but the code (`handleFileUpload`) uploads to `/workspace/files` endpoint and returns attachment IDs. The file is uploaded immediately, not on send. This means the upload happens as soon as the file is selected, and the attachment ID is included with the message. The UX should show upload progress."

**New observation:** File upload is immediate (not deferred), needs progress indicator

### Bob (🏃 Scrum Master)
"New observation: the prompt is comprehensive at 156 lines. One concern: it might be *too detailed* for a wireframe prompt. Lovable needs to understand purpose and data — but some of the implementation details (like cursor pagination mechanics) might constrain their design freedom."

**New observation:** Prompt might over-specify implementation details

## Checklist
| Check | Status |
|-------|--------|
| Zero visual specs (colors, fonts, sizes, layout ratios)? | ✅ PASS |
| v2 features only (no v1 references)? | ✅ PASS |
| Schema match (types align with shared/types.ts)? | ✅ PASS |
| Handler match (API endpoints described correctly)? | ✅ PASS |
| Edge cases (empty, loading, error states)? | ✅ PASS |
| Enough context for Lovable to design independently? | ✅ PASS |

## Issues Summary
| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 6 | Permanent deletion warning | Minor | Fix |
| 7 | Scroll position preservation | Minor | Already in UX considerations |
| 8 | Mobile agent modal full-screen | Minor | Skip (Lovable's choice) |
| 9 | Employee department scope filtering | Medium | Fix |
| 10 | Agent offline during active session | Minor | Fix |
| 11 | File upload progress indicator | Minor | Fix |
| 12 | Over-specification concern | Minor | Noted, acceptable |

## Actions Taken
- Fixed issue 6: Added note about permanent deletion
- Fixed issue 9: Added employee access scope
- Fixed issue 10: Added note about agent going offline mid-chat
- Fixed issue 11: Added upload progress note

## Score: 8/10 → PASS
