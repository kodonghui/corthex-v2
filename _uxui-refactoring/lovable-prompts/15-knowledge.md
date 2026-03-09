# 15. Knowledge Base (지식 베이스) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Knowledge Base** page in the CEO app. It serves as the central knowledge repository for the entire virtual company. Users can organize documents in a hierarchical folder structure, create and edit markdown documents, upload files (.md, .txt, .pdf), manage document versions, and view/manage agent memories (automatically learned knowledge). The knowledge base feeds directly into agent context — documents here can be injected into agent system prompts to improve their performance.

### Data Displayed — In Detail

**Left sidebar: Folder tree**
- Hierarchical folder structure with nested folders (parent → child)
- Each folder shows its name and an expandable/collapsible toggle if it has children
- Folders can optionally be assigned to a department (shown as secondary text)
- A "루트" (root) level for documents not in any folder
- Active folder is highlighted
- Folder count and document count per folder
- "새 폴더" (New Folder) button at the top of the sidebar

**Main content area: Document list**
- Table/list of documents in the currently selected folder (or all documents if no folder selected)
- Each document shows:
  - **Title** (제목): Document title (max 500 chars)
  - **Content type** (유형): One of — markdown, text, html, mermaid. Displayed as a label/badge
  - **Tags** (태그): Array of tag strings, shown as chips/badges
  - **File attachment indicator**: Icon if the document has an attached file (fileUrl is not null)
  - **Last updated** (수정일): Relative time (e.g. "2시간 전")
  - **Created by**: Author (displayed from user ID resolution)
- Pagination controls (page-based: page number, total pages)

**Search and filters (above document list):**
- Text search field: Searches across document title and content
- Content type dropdown filter (markdown / text / html / mermaid)
- Tag filter: Text input that filters by tag values

**Document detail view (opens when clicking a document):**
- Full document title (editable)
- Content editor: Markdown editor for markdown type, plain text editor for text type
- Content type selector
- Tags editor: Add/remove tag chips
- Folder assignment: Dropdown to move document to a different folder
- File attachment: Shows attached file with download link, or upload button if none
- Version history panel:
  - List of previous versions with version number, timestamp, and editor
  - Each version can be expanded to see the previous content
  - "이 버전으로 복원" (Restore this version) button on each version entry
- Save / Delete buttons

**Create document form:**
- Title (required)
- Content (optional, markdown editor)
- Content type selector (default: markdown)
- Folder assignment (default: current folder or root)
- Tags (optional)
- File upload option (accepts .md, .txt, .pdf, max 10MB)

**Agent Memories tab (secondary content — separate tab):**
- Toggled via a tab: "문서" (Documents) | "에이전트 기억" (Agent Memories)
- Documents are the primary content; Agent Memories is a secondary view
- Agent memories list:
  - **Agent name** (에이전트): Which agent owns this memory
  - **Key** (키): Short identifier for the memory (max 200 chars)
  - **Memory type** (유형): One of — learning (학습), insight (인사이트), preference (선호), fact (사실)
  - **Content** (내용): The memory content text
  - **Context** (맥락): What situation produced this memory
  - **Source** (출처): manual (수동), auto (자동), system (시스템)
  - **Confidence** (신뢰도): 0–100 percentage bar
  - **Usage count** (사용 횟수): How many times this memory has been used
  - **Last used** (마지막 사용): Timestamp
- Filters: Agent dropdown, memory type dropdown, source dropdown
- Create memory form: agent selector, type, key, content, context, source, confidence
- Edit/delete individual memories
- "기억 통합" (Consolidate Memories) button per agent — merges similar memories

**Knowledge Templates section:**
- A list of available document templates (built-in + custom)
- Each template shows name, description, category
- "이 템플릿으로 문서 만들기" (Create document from this template) button

**Knowledge Injection Preview:**
- Shows what knowledge will be injected into agent system prompts
- Displayed as a preview panel showing the compiled injection text
- Helps the user understand what agents "know" from the knowledge base

### User Actions

1. **Browse folders** — navigate folder tree, expand/collapse nested folders
2. **Create a folder** — with name, optional description, optional parent folder, optional department
3. **Rename/edit a folder** — change name, description, parent, department
4. **Delete a folder** — only if empty (no documents or child folders)
5. **View documents** in a folder — paginated list with search/filter
6. **Create a document** — with title, content, type, tags, folder assignment
7. **Upload a file** — .md, .txt, .pdf up to 10MB, auto-creates a document
8. **Open and read a document** — full content view with rendered markdown
9. **Edit a document** — modify title, content, tags, folder, content type
10. **View version history** of a document — see all previous versions
11. **Restore a previous version** — reverts document to a selected version
12. **Download an attached file** from a document
13. **Delete a document** (soft delete)
14. **Switch to Agent Memories tab** — view all agent memories
15. **Filter memories** by agent, type, source
16. **Create a memory** manually for a specific agent
17. **Edit/delete a memory**
18. **Consolidate memories** for an agent — merges duplicates
19. **Browse templates** — view available knowledge templates
20. **Create document from template** — pre-fills content from a template
21. **Preview knowledge injection** — see what gets injected into agents

### UX Considerations

- **Folder tree is the primary navigation**: The left sidebar folder tree should always be visible (not hidden behind a hamburger menu on desktop). Users need to see the organizational structure at a glance.
- **Empty folder state**: When a folder has no documents, show an encouraging message with a "문서 만들기" button.
- **Empty knowledge base**: First-time users see a welcome state explaining what the knowledge base is for, with a "첫 폴더 만들기" call to action.
- **Markdown rendering**: The document view should render markdown beautifully. When editing, a split or toggle view between editor and preview is ideal.
- **Version restore confirmation**: Restoring a version is a significant action — show a confirmation dialog explaining that the current content will become a new version.
- **Agent memories are a distinct concept**: Make it visually clear that memories are different from documents. Memories are auto-learned by agents, while documents are human-created. Use the tab separation to reinforce this.
- **Confidence meter**: Memory confidence (0–100) should be visually represented as a meter or bar, not just a number.
- **File upload feedback**: Show upload progress and success/error states clearly.
- **Search is cross-content**: The search box searches both title and content body. Consider showing highlighted matches in results.
- **Folder deletion guard**: If a user tries to delete a non-empty folder, show exactly how many documents/child folders prevent deletion.
- **Mobile layout**: On mobile, the folder tree collapses into a hamburger sidebar. Document list becomes card-based instead of table.
- **Korean language**: All labels, buttons, and placeholder text must be in Korean.
- **Loading states**: Folder tree, document list, memory list, and version history all need loading indicators.
- **Moving documents between folders** should be easy and intuitive.
- **Pagination resets** when switching between folders — always start at page 1 when navigating to a different folder.

### What NOT to Include on This Page

- No agent chat or conversation — that's the Chat page
- No cost tracking — that's the Costs page
- No agent creation or configuration — that's the Admin Agents page
- No file management for general uploads — that's the Files page
- No workflow or automation setup — that's the Workflows page
