# 26. Classified Documents — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

The Classified Documents page (기밀문서) is the CEO's document archive — a searchable, filterable repository of all reports and deliverables produced by AI agents through the Command Center. Every completed command produces a document that gets archived here with a security classification level, quality score, tags, and folder organization.

Think of it as: **"The filing cabinet for everything my AI organization has ever produced."** The CEO can search, browse by folder, filter by classification level, and drill into any document to see its full content, the delegation chain that produced it, quality review scores, cost breakdown, and similar documents.

---

### Data Displayed — In Detail

**1. Page Header**
- Page title: "기밀문서"
- A "목록으로" (Back to list) button appears when viewing a document detail
- Mobile toggle to show/hide the folder sidebar

**2. Left Sidebar: Stats + Folder Tree**

**Stats Card (top of sidebar):**
- Total document count
- Documents added in the last 7 days
- Classification distribution bar — a horizontal stacked bar showing the proportion of documents by classification level (공개, 내부, 기밀, 극비)
- Legend showing count per classification level

**Folder Tree (below stats):**
- Hierarchical folder structure for organizing documents
- "전체" (All) option to remove folder filter
- Each folder shows its name and document count
- Nested sub-folders with expand/collapse
- "+" button to create a new folder (inline input, submit on Enter, cancel on Escape)
- Right-click or hover to delete a folder (with confirmation)
- Selected folder is visually highlighted

**3. Right Panel: Document List (default view)**

**Filter Bar (top):**
- Text search input with debounced search (300ms)
- Classification level dropdown (전체 등급, 공개, 내부, 기밀, 극비)
- Date range: start date and end date pickers
- Sort dropdown: 날짜순 (date), 등급순 (classification), 품질순 (quality score)

**Active Filter Chips:**
- Each active filter appears as a removable chip
- "전체 초기화" button to clear all filters at once

**Document Table:**
- Columns: 제목 (title), 등급 (classification badge), 부서 (department), 에이전트 (agent name), 품질 (quality score bar), 태그 (tag chips, max 2 shown), 날짜 (creation date)
- Clicking a row opens the document detail view
- Pagination at the bottom showing total count, page number, and prev/next navigation (20 items per page)
- Loading state: skeleton table rows
- Empty state: message with a link to navigate to Command Center (documents are created when commands complete)

**4. Right Panel: Document Detail View (replaces list when a document is selected)**

**Document Header:**
- Document title
- Classification badge
- Agent name and department name
- Tags
- Creation date
- Delete button (with confirmation dialog)
- Move-to-folder selector

**Document Content:**
- Full content rendered as formatted markdown (headings, lists, bold, code blocks, etc.)

**Original Command:**
- The command text that produced this document

**Delegation Chain:**
- Ordered list of agents that worked on producing this document
- Each entry shows: agent name, role, execution status

**Quality Review (if available):**
- Overall quality score (numeric)
- Conclusion text (PASS/FAIL with commentary)
- Detailed feedback text

**Cost Records:**
- Table of LLM costs incurred producing this document
- Each row: model name, input tokens, output tokens, cost in USD

**Similar Documents:**
- List of related documents found by content similarity
- Each entry shows: title, classification badge, summary, agent name, quality score, similarity percentage, creation date
- Clicking a similar document navigates to its detail view

**5. Delete Confirmation Dialog**
- Confirms before deleting a document
- Notes that the document can be restored

---

### User Actions

**Primary:**
1. **Browse documents** — scan the table of archived documents
2. **Search documents** — type in the search box to find documents by keyword
3. **Filter by classification** — narrow to specific security levels
4. **View document detail** — click a document row to read its full content

**Secondary:**
5. **Filter by date range** — narrow to a specific time period
6. **Sort documents** — change sort order (date, classification, quality)
7. **Navigate folders** — click folders in the sidebar to see documents in that folder
8. **Create a folder** — add a new organizational folder
9. **Delete a folder** — remove an empty folder

**Tertiary:**
10. **Move document to folder** — reassign a document's folder from the detail view
11. **Delete a document** — remove a document from the archive
12. **Navigate to similar documents** — click a related document to view it
13. **Browse pages** — navigate through paginated results
14. **Clear all filters** — reset all active filters at once

---

### UX Considerations

- **Two-panel layout**: The sidebar (stats + folders) on the left and the main content (list or detail) on the right. This is a classic file-explorer pattern that feels familiar.
- **List-detail pattern**: Clicking a document row replaces the list with the detail view. A "목록으로" button returns to the list. This avoids deep navigation.
- **Classification is visual priority**: Classification badges (공개/내부/기밀/극비) are the most important metadata. They should be immediately scannable in the table and detail view.
- **Quality at a glance**: Quality scores appear as small progress bars in the table, giving quick visual feedback without requiring the CEO to open each document.
- **Search + filter combination**: All filters work together — the CEO can search for "마케팅" within "기밀" classification and "이번 주" date range simultaneously. Active filter chips make it clear what's currently applied.
- **Mobile responsiveness**: On mobile, the folder sidebar should be hidden by default (toggle button to show). The document table should scroll horizontally if needed.
- **Loading states**: Independent loading for the document list, folder tree, stats, and document detail. The table shows skeleton rows; the detail view shows a loading spinner.
- **Empty states**: When no documents match filters, guide the CEO to the Command Center to create new documents. When no folders exist, the tree area shows just the "전체" option.
- **Markdown rendering**: Document content can be rich — including headings, tables, lists, code blocks, and bold text. The renderer must handle all common markdown elements.
- **Similar documents discovery**: The similarity section at the bottom of document detail encourages the CEO to explore related content, building trust in the archive's value.

---

### What NOT to Include on This Page

- No document creation or editing (documents are auto-generated by Command Center)
- No agent configuration (that's Admin)
- No command submission (that's Command Center)
- No real-time streaming (documents are static once created)
- No file uploads or attachments (this is for AI-generated text documents only)
