# Gemini 이미지 생성 프롬프트 — 2순위 14개 페이지

> 사용법: 각 프롬프트를 **하나씩** Gemini에 복사-붙여넣기 하세요.
> 생성된 이미지는 `_uxui-refactoring/designs/` 폴더에 저장하세요.
>
> 파일명 규칙:
> - `10-sns-desktop.png`
> - `10-sns-mobile.png`

---

## 10. SNS (소셜미디어 퍼블리싱) — 데스크톱

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. Think of it like a social media management tool (similar to Hootsuite or Buffer), but AI agents create the content automatically and the user just reviews, approves, and schedules publication.

This page: A social media publishing hub with 5 tabs — Content, Queue, Card News, Stats, and Account Management.

User workflow:
1. User browses a list of AI-generated social media posts (text + images) across multiple platforms (Instagram, blog, Twitter, Facebook).
2. Each post goes through a workflow: Draft → Pending Review → Approved → Scheduled → Published. The user approves or rejects content.
3. Approved content enters a publishing queue where it can be scheduled for specific times.
4. User can create "Card News" series — multi-image carousel posts (5-10 slides).
5. User can run A/B tests by generating variants of a post and comparing engagement metrics.
6. Stats tab shows content performance over time — by status, platform, and daily trends.
7. Account Management tab lets the user register and manage SNS platform credentials.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Show the Content tab as the default view with:
1. Tab bar at the top — 5 tabs with clear active state.
2. Filter row — platform filter dropdown, "originals only" checkbox, list/gallery view toggle, and a "New Content" button.
3. Content list — cards showing: platform icon, account name, status badge (color-coded), title, creator name, date. Each card is clickable.
4. For one card, show it expanded into a detail view with: status stepper (5-step progress bar), content preview (title, body text, image, hashtags), action buttons (Submit for Review, Approve, Reject, Publish, Generate Image, Delete), and an A/B testing section.
5. Gallery view alternative — grid of image thumbnails with hover overlays showing title and status.

Design tone — YOU DECIDE:
- This is a social media management tool. It should feel organized and efficient.
- Content cards should clearly communicate status at a glance.
- The status stepper should feel like progress — completed steps should look satisfying.
- Choose whatever visual tone makes a social media publishing workflow feel smooth and productive.
- Clean, professional. Users spend time reviewing and scheduling — it should not be visually noisy.

Design priorities (in order):
1. Status at a glance — the user must instantly see which content needs attention (pending review).
2. Content preview — the body text and image should be readable without clicking into detail.
3. Action buttons should be prominent and contextual (only show relevant actions per status).

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

---

## 10. SNS — 모바일

```
Mobile version (375x812) of the same page described above.

Same product context: a social media publishing hub where AI agents create content, and the user reviews, approves, schedules, and publishes across multiple platforms.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation (switching between pages). DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile touch):
1. Tab bar — 5 tabs with shortened labels, horizontally scrollable if needed.
2. Content list — compact cards with status badge, platform icon, title, and date.
3. Filter controls — collapsible or minimal.
4. New Content button — floating or in header.
5. Detail view — full-screen takeover with status stepper, content preview, and action buttons.
6. Gallery view — 2-column grid.
7. A/B testing section — vertically stacked comparison.
8. Loading / empty / error states.

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. Status badges must be visible at a glance even on small cards.
2. Action buttons should be large enough for thumb tapping.
3. Tab switching should feel instant with minimal layout shift.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. Messenger (사내 메신저) — 데스크톱

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. This specific page is an internal team messenger — like Slack or Microsoft Teams — where human employees of the same company can communicate in real-time.

This page: A full-featured internal messenger with channel-based group messaging and direct conversations.

User workflow:
1. User sees a list of channels (like Slack channels: #general, #marketing, #dev) on the left.
2. Clicking a channel shows the message thread in the center — messages from team members with timestamps, avatars, and names.
3. User can type messages, attach files (images, documents up to 50MB), and @mention AI agents.
4. Any message can start a thread — clicking "Reply" opens a thread panel on the right side.
5. Users can react to messages with emoji reactions (thumbs up, heart, etc.).
6. A search bar in the channel list lets users search across all messages.
7. Unread message counts show as badges on channels.
8. Online/offline status indicators (green/gray dots) show who's currently active.
9. There's a tab to switch between "Channels" (group messaging) and "Conversations" (direct messages / small group chats).

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Channel list panel (left) — list of channels with names, last message preview, unread badge, online member count. Search bar at top.
2. Message area (center) — chat messages with: sender name, timestamp, message text, file attachments (image preview / document download link), emoji reactions below messages, reply count indicator. Typing indicator at bottom.
3. Thread panel (right, optional) — opens when user clicks "Reply" on a message. Shows the original message and threaded replies below it.
4. Message input area (bottom of center) — text input with file attachment button, @mention popup, send button. Shows pending file previews.
5. Channel/Conversation tab toggle — at the top, to switch between channel mode and direct message mode.
6. "New Channel" button — to create a new channel.
7. Channel settings — accessible via a settings icon, shows channel info, member list with online status, and member management.
8. Empty state — when no channel is selected, show a helpful prompt.

Design tone — YOU DECIDE:
- This is a professional internal messenger. Think Slack, but cleaner and more focused.
- Messages should be easy to scan — clear visual hierarchy between sender, content, and metadata.
- Unread indicators should pop visually.
- Online status should be subtle but noticeable.
- The input area should feel inviting and ready for typing.
- Clean, professional, fast-feeling. This is a tool people use constantly throughout the day.

Design priorities (in order):
1. Message readability — this is a chat app, messages must be easy to read and scan.
2. Channel navigation — switching between channels should feel instant.
3. Unread awareness — users must immediately see which channels have new messages.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

---

## 11. Messenger — 모바일

```
Mobile version (375x812) of the same page described above.

Same product context: an internal team messenger with channels and direct conversations, real-time messaging via WebSocket.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation (switching between pages). DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile touch):
1. Channel list view — full-screen list of channels with unread badges and last message preview. Search bar at top. "New Channel" button.
2. Chat view — full-screen message thread (replaces channel list). Back button to return to channel list. Channel name in header. Settings icon.
3. Message input — bottom-positioned with attachment button and send button. Above the app's bottom tab bar.
4. Thread view — full-screen overlay showing original message + threaded replies.
5. Channel/Conversation toggle — compact tabs at the top.
6. @mention popup — bottom-sheet style.
7. Emoji reactions — accessible via long-press or tap (no hover on mobile).
8. Loading / empty / error states.

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. One-handed messaging — input must be reachable at the bottom.
2. Channel switching — back button + channel list must be one tap away.
3. Unread badges must be visible at a glance in the channel list.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 12. Ops Log (작전 로그) — 데스크톱

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. The user gives natural language instructions to AI agents, and this page shows the complete history of all past instructions and their results.

This page: An operations log / command history viewer — like a detailed activity log where every instruction the user gave and every result the AI produced is recorded, searchable, and analyzable.

User workflow:
1. User sees a table of all past commands — each row shows: timestamp, command text (truncated), command type (direct, mention, slash, preset, batch), status badge (completed, processing, pending, failed, cancelled), assigned agent name, quality score (0-5 with visual bar), duration, and bookmark star.
2. User can filter by: text search, date range (start/end), command type dropdown, status dropdown, sort order (date, quality, cost, duration), and "bookmarked only" toggle.
3. Active filters appear as removable chips below the filter bar.
4. User can click any row to open a detail modal showing: full command text, metadata cards (type, status, agent, duration), quality evaluation (score bar + PASS/FAIL badge), full result rendered as Markdown, and bookmark note.
5. User can select 2 rows via checkboxes to enable A/B comparison — a side-by-side modal showing quality score, duration, cost comparisons plus the full results.
6. Each row has a context menu (⋮) with "Replay" (re-execute the same command) and "Copy" options.
7. CSV export button exports filtered data.
8. Pagination at the bottom (20 items per page).

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Page header — title "Operations Log" with Export button and Compare button (appears when 2 items selected).
2. Filter bar — search input, date range pickers, type dropdown, status dropdown, sort dropdown, bookmark toggle button. Should feel compact but accessible.
3. Filter chips — active filters shown as removable pills below the filter bar.
4. Data table — columns: checkbox, time, command, type (badge), status (color badge), agent, quality (mini progress bar with score), duration, bookmark star, actions menu.
5. Quality score visualization — a small horizontal bar (green for 4+, amber for 3-4, red for <3) with the numeric score next to it.
6. Empty state — when no results match filters, show a helpful message with option to clear filters. When truly no data, show a prompt to go to the command center.
7. Detail view — modal or slide-over showing the full command details, metadata, quality evaluation, and Markdown-rendered result.
8. A/B comparison view — side-by-side comparison of two selected operations.
9. Pagination — page indicator and prev/next buttons.

Design tone — YOU DECIDE:
- This is a data-heavy analysis tool. Think of it like a log viewer or analytics dashboard.
- The table must be scannable — users should spot important items (failures, low quality scores) instantly.
- Status badges and quality bars should use color coding that's immediately interpretable.
- Filters should feel powerful but not overwhelming.
- Clean, dense but not cramped. This is a tool for reviewing work quality and finding past results.

Design priorities (in order):
1. Scannability — status, quality, and bookmarks should be visible at a glance across many rows.
2. Filtering power — users should be able to narrow down to exactly what they need quickly.
3. Detail access — getting from the table to full details should feel smooth and contextual.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

---

## 12. Ops Log — 모바일

```
Mobile version (375x812) of the same page described above.

Same product context: an operations log showing history of all AI agent commands and results, with search, filtering, bookmarks, A/B comparison, and CSV export.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation (switching between pages). DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile):
1. Page header with title and export button.
2. Filters — collapsible filter panel (tap to expand/collapse). When collapsed, show number of active filters.
3. Filter chips — horizontally scrollable.
4. Data display — card-based layout where each operation is a card showing: time, command text, status badge, quality score, bookmark star. Tap to see details.
5. Detail view — full-screen modal with command text, metadata, quality score, and Markdown result.
6. A/B comparison — vertically stacked (A on top, B below) instead of side-by-side.
7. Pagination — compact at the bottom.
8. Empty / loading / error states.

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 13. Reports (보고서) — 데스크톱

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. Think of it like Slack or Linear, but instead of messaging coworkers, you're giving tasks to AI employees and watching them collaborate to deliver results.

This page: A reports management page where AI-generated reports go through a lifecycle of draft → submitted → reviewed. Users write reports in markdown, submit them for review, and exchange comments with reviewers.

User workflow:
1. User views a list of reports filtered by tabs: All, My Reports, Received Reports.
2. User clicks a report card to see the full detail — rendered markdown content, status badge, metadata (author, dates).
3. On draft reports, user can edit, submit to CEO, or delete. On submitted reports, user can download as markdown file or share to messenger.
4. Below the report content, there's a comment thread (chat-style) where the author and reviewer exchange feedback.
5. User can create new reports with a markdown editor.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Report list view — cards showing report title, status badge (draft/submitted/reviewed), content preview (first 120 chars), author name, and date. Filterable by tabs: All / My Reports / Received Reports.
2. Report detail view — full markdown-rendered content with status badge, author info, creation/submission dates. Action buttons change based on status.
3. Comment section — chat-style thread below the report content. Author comments align left, reviewer/CEO comments align right with a distinct background color.
4. Comment input — text input with send button at the bottom of the comment section.
5. Report editor — markdown textarea for creating/editing reports. Title input + content textarea.
6. Submit confirmation dialog — warns that report content becomes locked after submission.
7. Empty state — when no reports exist, show encouraging text and a create button.
8. Loading state — skeleton UI while report list loads.

Design tone — YOU DECIDE:
- This is a professional document management interface. Reports are formal deliverables from AI agents.
- Clean, readable typography is critical — reports can be long markdown documents.
- Status colors should be clearly distinguishable (draft=neutral, submitted=amber, reviewed=green).
- The comment section should feel like a lightweight messenger embedded within the page.

Design priorities (in order):
1. Report content readability — markdown rendering must be clean and scannable.
2. Status visibility — report lifecycle state must be immediately obvious.
3. Comment flow — the comment thread should feel natural and easy to follow.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

---

## 13. Reports — 모바일

```
Mobile version (375x812) of the same page described above.

Same product context: a platform where users manage AI agents. This page manages AI-generated reports through a draft → submitted → reviewed lifecycle with markdown rendering and comment threads.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation. DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile touch):
1. Report list with tab filters (All / My Reports / Received)
2. Report detail with rendered markdown content
3. Action buttons (sticky bottom area for primary actions)
4. Comment thread (chat-style, scrollable)
5. Comment input (bottom-positioned)
6. Report editor (full-screen markdown textarea)
7. Status badges (draft / submitted / reviewed)
8. Loading / empty / error states

Design tone: Same as desktop version. YOU DECIDE the tone.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 14. Jobs (자동화 작업) — 데스크톱

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents.

This page: A job automation dashboard where users schedule tasks for AI agents to execute. The concept is "assign and go home — AI works overnight." It manages three types of jobs: one-time tasks, recurring schedules, and event-triggered actions.

User workflow:
1. User registers a job by selecting an AI agent, writing an instruction, and optionally setting a scheduled time.
2. For recurring work, user creates a schedule (daily/weekdays/custom days at a specific time).
3. For market-event-driven work, user sets up triggers (e.g., "when stock price goes above X, run this analysis").
4. User can create chain jobs — sequential multi-step pipelines where Agent A's output feeds into Agent B.
5. While jobs run, the user sees real-time progress bars via WebSocket. Completed/failed jobs show results with links to generated reports or chat sessions.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — approximately 1200px wide and 850px tall.

Required functional elements:
1. Tab navigation — three tabs: One-time Jobs (with count), Recurring Schedules (with count), Event Triggers (with count).
2. Job cards — expandable cards showing: status badge (queued/processing/completed/failed/blocked), agent name, instruction text, timestamps. Processing jobs show a real-time progress bar.
3. Chain groups — visually grouped sequential jobs with step indicators (Step 1 → Step 2 → Step 3).
4. Schedule cards — active/inactive status, schedule description, agent name, next run time.
5. Trigger cards — active/inactive status, trigger type, condition details, agent name, last triggered time.
6. Job creation modal — form with job type selector, agent dropdown, instruction textarea, schedule/trigger configuration.
7. Expanded result area — result text, error message, retry count, links to related reports.
8. Empty states per tab. Register button in header.

Design tone — YOU DECIDE:
- This is an automation/ops dashboard. Users check this page to see what their AI team accomplished overnight.
- Real-time status is critical. Completed jobs need a "satisfying done" feel. Failed jobs need clear error visibility.
- Clean and functional. Not too dense — each job card should breathe.

Design priorities:
1. Job status must be instantly scannable.
2. Processing jobs with real-time progress need the most visual attention.
3. The creation modal must be intuitive despite supporting 3 different job types.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 14. Jobs — 모바일

```
Mobile version (375x812) of the same job automation dashboard.

IMPORTANT — Mobile app shell context:
- BOTTOM TAB BAR (don't include). TOP HEADER (don't include). Content area only.

Required elements:
1. Tab navigation (One-time / Schedules / Triggers)
2. Job cards with status badges, progress bars, expand/collapse
3. Chain groups with step indicators
4. Job creation — full-screen modal
5. Real-time progress visualization
6. Empty / loading states

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 15. Knowledge (지식베이스) — 데스크톱

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents.

This page: A knowledge base management page with two tabs — Documents and Agent Memories. It's where users organize reference materials that AI agents use during their work, and where they can browse what the AI agents have automatically learned over time.

User workflow:
1. DOCUMENTS TAB: User navigates a folder tree on the left side to organize documents by department or topic. The main area shows a searchable, filterable, paginated list of documents. Users can create new markdown/text documents, upload files via drag-and-drop, and manage tags. Clicking a document opens a detail view with rendered content (markdown, Mermaid diagrams, etc.), version history, and edit/delete actions.
2. AGENT MEMORIES TAB: User browses AI agent memories — things the agents automatically learned during work. Each memory has a type (learning/insight/preference/fact), a confidence score (shown as a progress bar), usage count, source reference, and can be deactivated or deleted. Filterable by agent and memory type.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — approximately 1200px wide and 850px tall.

Required functional elements:
1. Tab navigation — Documents and Agent Memories.
2. Folder tree panel — left sidebar within the content area showing hierarchical folder structure.
3. Document list — right of folder tree with search, sort, upload, create buttons. Tags bar below toolbar.
4. Document detail view — rendered content, version history, edit/delete actions.
5. Agent memories list — cards with type badge, agent name, confidence bar, usage count, actions.
6. Memory filters — agent dropdown, type dropdown, search.
7. Drag-and-drop zone for file upload.
8. Pagination, empty states, loading states.

Design tone — YOU DECIDE:
- Knowledge management / wiki-style interface. Think Notion, Confluence, or Obsidian — but simpler.
- The folder tree should feel native and familiar, like a file explorer.
- Agent memories should feel like an interesting "AI brain" view — not just a data dump.

Design priorities:
1. Navigation efficiency — folder tree + search + tags.
2. Document readability — rendered content must be clean.
3. Agent memories should feel like an interesting "AI brain" view.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 15. Knowledge — 모바일

```
Mobile version (375x812) of the same knowledge base page.

IMPORTANT — Mobile app shell context:
- BOTTOM TAB BAR (don't include). TOP HEADER (don't include). Content area only.

Required elements:
1. Tab navigation (Documents / Agent Memories)
2. Folder tree — toggleable panel (hidden by default)
3. Document list with search, upload, create
4. Tags bar (horizontally scrollable)
5. Document detail view (full-screen)
6. Agent memories with confidence bars
7. Pagination, empty / loading states

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 16. Files (파일 관리) — 데스크톱

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents.

This page: A file management page where users upload, browse, download, and delete shared workspace files. Files are categorized by MIME type (images, documents, spreadsheets, etc.) and users can filter and search through them.

IMPORTANT — App shell context:
- LEFT SIDEBAR and TOP HEADER already exist. Design CONTENT AREA only.
- Desktop content area: approximately 1200px wide and 850px tall.

Required functional elements:
1. Page header — title "Files", upload button, optional file count and storage used.
2. Search bar — text input for filtering files by name.
3. Filter chips — toggleable: "All", "Images", "Documents", "Others". Active chip visually distinct.
4. Sort selector — by name, date, or size.
5. File list — MIME-type icon (color-coded by category), filename, file size, upload date, action buttons (download, delete).
6. Drag-and-drop zone — dashed border visible when dragging files.
7. Upload progress indicator.
8. Empty state, delete confirmation, loading skeleton.

Design tone — YOU DECIDE:
- Utility/management page — clean, functional, scannable.
- MIME type icons should be visually differentiated by color.

Design priorities:
1. Scannability — quickly find files among many.
2. Upload accessibility — immediately visible.
3. Filter/search efficiency.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 16. Files — 모바일

```
Mobile version (375x812) of the same file management page.

IMPORTANT — Mobile context: BOTTOM TAB BAR and TOP HEADER already exist. Content area only.

Required elements:
1. Page header with upload button
2. Search input (full width)
3. Filter chips (scrollable)
4. File list (MIME icon, filename, size, date, actions)
5. Empty state, loading skeleton, delete confirmation

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 17. Costs (비용 분석) — 데스크톱

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents.

This page: A cost analysis dashboard where the user monitors AI operational expenses. It breaks down costs by AI provider (Anthropic, OpenAI, Google), by individual AI agent, by AI model, and by day. It also shows budget utilization with warnings.

IMPORTANT — App shell context:
- LEFT SIDEBAR and TOP HEADER already exist. Design CONTENT AREA only.
- Desktop content area: approximately 1200px wide and 850px tall.

Required functional elements:
1. Page header — "Cost Analysis" with period selector (7d, 30d, custom date range).
2. Budget warning banner — shown when usage exceeds 80%. Yellow for warning, red for exceeded.
3. Summary cards (3) — Total cost (large dollar amount), Budget utilization (percentage, color-coded), Provider breakdown (donut chart: Anthropic=blue, OpenAI=green, Google=orange).
4. Two-column section — Left: Agent cost ranking (top 10 with horizontal bars). Right: Daily cost trend (vertical bar chart).
5. Loading skeleton, empty/error states.

Design tone — YOU DECIDE:
- Analytics/reporting page — data-dense but clean.
- Numbers should be large and instantly readable.
- Provider colors: Anthropic=#3B82F6, OpenAI=#22C55E, Google=#F97316.
- Professional and trustworthy — this page shows financial data.

Design priorities:
1. Total cost and budget status instantly visible.
2. Provider breakdown clarity.
3. Trend visibility at a glance.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 17. Costs — 모바일

```
Mobile version (375x812) of the same cost analysis dashboard.

IMPORTANT — Mobile context: BOTTOM TAB BAR and TOP HEADER already exist. Content area only.

Required elements:
1. Period selector (compact)
2. Budget warning banner
3. Summary cards (stacked vertically)
4. Provider donut chart (legend below)
5. Agent cost ranking (top 5)
6. Daily cost trend (scrollable)
7. Loading skeleton, empty/error states

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 18. Activity Log (활동 로그) — 데스크톱

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents.

This page: A real-time activity log that monitors all AI agent operations across the organization. It shows four categories of events in a tabbed interface, with live WebSocket updates, search, date filtering, and pagination.

IMPORTANT — App shell context:
- LEFT SIDEBAR and TOP HEADER already exist. Design CONTENT AREA only.
- Desktop content area: approximately 1200px wide and 850px tall.

Required functional elements:
1. Page header — title with WebSocket connection status indicator (green=connected, red=disconnected).
2. Tab bar — four tabs: "Activity", "Communications", "QA", "Tools".
3. Security alert banner — shown when recent security events exist. Red-toned, collapsible.
4. Filter bar — search input, date range inputs, tab-specific filters.
5. Data tables per tab:
   a. Activity: Time, Agent, Action, Status badge, Duration, Tokens
   b. Communications: Time, Sender → Receiver, Message, Cost, Tokens
   c. QA: Time, Command, Inspection score (progress bar), Verdict (PASS/FAIL), Rework count. Expandable detail with sub-tabs (Rules, Rubric, Hallucination, Legacy Scores).
   d. Tools: Time, Tool name, Agent, Duration, Status, Input summary
6. Pagination bar with total count and prev/next buttons.
7. Loading skeleton, empty state.

Design tone — YOU DECIDE:
- Monitoring/observability page — think Datadog or Grafana logs view.
- Tables should be compact but readable. Status badges should pop with color.
- Real-time feel — WebSocket indicator conveys "this is live data."

Design priorities:
1. Scannability — quickly find relevant events.
2. Status visibility — badges must be instantly distinguishable.
3. QA detail readability — complex nested data presented clearly.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 18. Activity Log — 모바일

```
Mobile version (375x812) of the same activity log page.

IMPORTANT — Mobile context: BOTTOM TAB BAR and TOP HEADER already exist. Content area only.

Required elements:
1. WebSocket status indicator
2. Tab bar (4 tabs, scrollable)
3. Security alert banner (collapsible)
4. Filter bar (wrapping to multiple lines)
5. Data table (horizontally scrollable)
6. QA detail panel with sub-tabs
7. Pagination, loading skeleton, empty state

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 19. Workflows (워크플로우 관리) — 데스크톱 [ADMIN]

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human administrator manages an organization of AI agents. This is the ADMIN panel where the administrator manages automated workflows that AI agents execute.

This page: Workflow management — the admin creates, edits, executes, and monitors multi-step automation pipelines. Each workflow consists of sequential/parallel steps (Tool calls, LLM inferences, Conditional branches) arranged in a DAG (Directed Acyclic Graph).

User workflow:
1. Admin sees a list of existing workflows as cards — each showing name, description, active/inactive status, step count, and a mini DAG visualization.
2. Admin can create a new workflow using a visual canvas editor (drag-and-drop nodes, connect with edges) or a structured form editor.
3. Three node types exist: Tool (blue), LLM (purple), Condition (amber) — each with distinct visual styling.
4. Admin can execute a workflow and view execution history.
5. An AI pattern analyzer suggests new workflows based on detected repetitive tasks.

IMPORTANT — App shell context:
- LEFT SIDEBAR and TOP HEADER already exist. Design CONTENT AREA only.
- Desktop content area: approximately 1200px wide and 850px tall.

Required functional elements:
1. Workflow list as cards with mini pipeline visualization.
2. Tab navigation — "Workflows (N)" and "Suggestions (N)".
3. Canvas editor with draggable nodes, bezier edges, zoom/pan.
4. Side panel for node properties when selected.
5. Execution history with status badges and step results.
6. Suggestion cards with accept/reject.
7. Empty state, loading skeleton.

Design tone — YOU DECIDE:
- Professional admin tool for complex automation. Think: n8n, Retool, or Figma.
- Clean, functional, information-dense but not cluttered.

Design priorities:
1. Workflow list scannable — active status and structure at a glance.
2. Canvas editor intuitive for non-technical users.
3. Execution results immediately comprehensible.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 19. Workflows — 모바일 [ADMIN]

```
Mobile version (375x812) of the same workflow management page.

IMPORTANT — Mobile context: BOTTOM TAB BAR and TOP HEADER already exist. Content area only.

Required elements:
1. Workflow list as stacked cards
2. Tab navigation (Workflows / Suggestions)
3. Execution history cards
4. Suggestion cards with accept/reject
5. Loading / empty / error states

Note: Canvas editor defaults to form-based editing on mobile.

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 20. Tools (도구 관리) — 데스크톱 [ADMIN]

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human administrator manages an organization of AI agents. This is the ADMIN panel where the administrator manages which tools each AI agent is allowed to use.

This page: Tool management — the admin views a catalog of all available tools (categorized as Common, Finance, Legal, Marketing, Tech) and assigns tool permissions to individual AI agents using a permission matrix.

IMPORTANT — App shell context:
- LEFT SIDEBAR and TOP HEADER already exist. Design CONTENT AREA only.
- Desktop content area: approximately 1200px wide and 850px tall.

Required functional elements:
1. Header — "Tool Management", "N tools · N agents", save/cancel buttons.
2. Category filter tabs — All, Common (blue), Finance (green), Legal (purple), Marketing (orange), Tech (cyan).
3. Tool catalog table — Name, Category, Description, Status.
4. Permission matrix — rows=agents, columns=tools. Checkbox cells. Category batch toggles.
5. Change indicator — modified rows highlighted. Floating save bar with change count.
6. Empty state, loading skeleton.

Design tone — YOU DECIDE:
- Data-heavy admin interface — think AWS IAM or GitHub repo settings.
- Category colors consistent and distinguishable.
- The matrix should feel like a spreadsheet — familiar and efficient.

Design priorities:
1. Permission matrix is the focal point.
2. Category filters one-click accessible.
3. Change tracking obvious before saving.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 20. Tools — 모바일 [ADMIN]

```
Mobile version (375x812) of the same tool management page.

IMPORTANT — Mobile context: BOTTOM TAB BAR and TOP HEADER already exist. Content area only.

Required elements:
1. Category filter as horizontal scrollable pills
2. Tool catalog as card list
3. Permission: agent-first approach — select agent, then toggle tools by category
4. Change tracking + save/cancel (bottom sticky)
5. Loading / empty / error states

Note: Full matrix doesn't work on mobile. Use agent-centric checklist view instead.

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 21. Users (사용자 관리) — 데스크톱 [ADMIN]

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human administrator manages an organization of AI agents. This is the ADMIN panel where the administrator manages human user accounts.

This page: User management — the admin creates, edits, deactivates, and resets passwords for employee accounts. Users can be filtered by department.

IMPORTANT — App shell context:
- LEFT SIDEBAR and TOP HEADER already exist. Design CONTENT AREA only.
- Desktop content area: approximately 1200px wide and 850px tall.

Required functional elements:
1. Header — "User Management", "N employees", "+ Add Employee" button.
2. Department filter — pill-shaped buttons for each department plus "All".
3. User table — Name, Username, Email, Role (Admin/Employee badge), Status (Active/Inactive badge), Actions.
4. Role badges — Admin (indigo), Employee (gray). Status badges — Active (green), Inactive (red).
5. Inline edit mode — cells transform into inputs with Save/Cancel.
6. Creation form — expandable card above table with 2-column fields.
7. Confirmation dialogs for deactivation and password reset.
8. Empty state, loading skeleton.

Design tone — YOU DECIDE:
- Standard user management admin page — think Stripe Dashboard or GitHub Organization Members.
- Clean, professional, functional. Badges instantly recognizable.

Design priorities:
1. Table scannable and sortable.
2. Action buttons accessible but not dominating.
3. Department filter one-click accessible.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 21. Users — 모바일 [ADMIN]

```
Mobile version (375x812) of the same user management page.

IMPORTANT — Mobile context: BOTTOM TAB BAR and TOP HEADER already exist. Content area only.

Required elements:
1. Department filter as scrollable pills
2. Employee list as cards (Name, Username, Role badge, Status badge, actions)
3. "+ Add Employee" button (compact)
4. Creation form (single column)
5. Confirmation dialogs
6. Loading / empty / error states

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 22. Employees (직원 관리) — 데스크톱 [ADMIN]

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human administrator manages an organization of AI agents. This is the ADMIN panel where the administrator manages employee accounts — inviting, editing, department assignments, and account status.

This page: Employee management — full-featured employee directory with search, filtering, pagination, invite workflow, and password management.

IMPORTANT — App shell context:
- LEFT SIDEBAR and TOP HEADER already exist. Design CONTENT AREA only.
- Desktop content area: approximately 1200px wide and 850px tall.

Required functional elements:
1. Header — "Employee Management", "N employees", "+ Invite Employee" button.
2. Search bar — "Search by name or email..."
3. Status filter pills — All, Active, Inactive.
4. Department filter pills — per department plus "All Departments".
5. Employee table — Name, Username, Email, Departments (colored pill badges), Status badge, Actions (Edit, Reset Password, Deactivate/Reactivate).
6. Pagination — "Showing 1-20 of N" + page buttons.
7. Invite modal — Username, Name, Email, department checklist.
8. Edit modal — Name, Email, department checklist.
9. Password display modal — temporary password with copy button.
10. Confirmation dialogs. Empty state, loading skeleton.

Design tone — YOU DECIDE:
- Professional HR/employee management — think Rippling, BambooHR, or Notion Team Settings.
- Clean table layout. Status and department badges scannable at a glance.

Design priorities:
1. Search + filter must feel fast.
2. Invite flow (form → password modal) must feel smooth.
3. Pagination clear about current position.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 22. Employees — 모바일 [ADMIN]

```
Mobile version (375x812) of the same employee management page.

IMPORTANT — Mobile context: BOTTOM TAB BAR and TOP HEADER already exist. Content area only.

Required elements:
1. Search input (full width)
2. Status + department filter pills (scrollable)
3. Employee cards (Name, Username, Department badges, Status, actions)
4. Pagination (compact)
5. Invite/edit modals (full-screen)
6. Password modal with large copy button
7. Confirmation dialogs, loading / empty / error states

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 23. Monitoring (시스템 모니터링) — 데스크톱 [ADMIN]

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human administrator manages an organization of AI agents. This is the ADMIN panel where the administrator monitors system health in real-time.

This page: System monitoring dashboard — a real-time overview of server health, memory usage, database status, and recent errors. Auto-refreshes every 30 seconds.

IMPORTANT — App shell context:
- LEFT SIDEBAR and TOP HEADER already exist. Design CONTENT AREA only.
- Desktop content area: approximately 1200px wide and 850px tall.

Required functional elements:
1. Header — "System Monitoring" + "Refresh" button.
2. Server Status card — status badge (green=OK, red=Error), uptime, runtime version, build number.
3. Memory card — usage percentage, progress bar (green<80%, amber 80-89%, red 90%+), RSS, heap used/total.
4. Database card — status badge, response time in ms.
5. Error Summary card — error count badge, recent error list with timestamps and messages.
6. Loading skeleton (4 cards). Error state. Auto-refresh indicator.

Design tone — YOU DECIDE:
- System health dashboard — think Grafana, Datadog, or Vercel Analytics.
- All critical metrics visible without scrolling. Color coding immediate (green=healthy, amber=warning, red=critical).

Design priorities:
1. System health visible in under 2 seconds.
2. Memory threshold colors immediately clear.
3. Error list scannable.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 23. Monitoring — 모바일 [ADMIN]

```
Mobile version (375x812) of the same monitoring dashboard.

IMPORTANT — Mobile context: BOTTOM TAB BAR and TOP HEADER already exist. Content area only.

Required elements:
1. Server Status card
2. Memory card (progress bar)
3. Database card
4. Error card (recent error list)
5. Refresh button (compact)
6. Loading / error states

All four cards stack vertically.

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 이미지 저장 위치 체크리스트

| # | 페이지 | 데스크톱 | 모바일 |
|---|--------|---------|--------|
| 10 | sns | `10-sns-desktop.png` | `10-sns-mobile.png` |
| 11 | messenger | `11-messenger-desktop.png` | `11-messenger-mobile.png` |
| 12 | ops-log | `12-ops-log-desktop.png` | `12-ops-log-mobile.png` |
| 13 | reports | `13-reports-desktop.png` | `13-reports-mobile.png` |
| 14 | jobs | `14-jobs-desktop.png` | `14-jobs-mobile.png` |
| 15 | knowledge | `15-knowledge-desktop.png` | `15-knowledge-mobile.png` |
| 16 | files | `16-files-desktop.png` | `16-files-mobile.png` |
| 17 | costs | `17-costs-desktop.png` | `17-costs-mobile.png` |
| 18 | activity-log | `18-activity-log-desktop.png` | `18-activity-log-mobile.png` |
| 19 | workflows | `19-workflows-desktop.png` | `19-workflows-mobile.png` |
| 20 | tools | `20-tools-desktop.png` | `20-tools-mobile.png` |
| 21 | users | `21-users-desktop.png` | `21-users-mobile.png` |
| 22 | employees | `22-employees-desktop.png` | `22-employees-mobile.png` |
| 23 | monitoring | `23-monitoring-desktop.png` | `23-monitoring-mobile.png` |

**총 28장** (데스크톱 14 + 모바일 14)

모든 이미지는 `_uxui-refactoring/designs/` 폴더에 저장하세요.
