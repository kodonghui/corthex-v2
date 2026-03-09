# 36. Soul Templates (소울 템플릿 관리) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Soul Templates** management page in the Admin app. Administrators manage the library of AI agent personality definitions ("souls") for their company. A soul template defines how an agent behaves — its system prompt, personality, instructions, and behavioral guidelines.

This page serves two distinct purposes:
1. **Template CRUD**: Create, view, edit, and delete soul templates for the company
2. **Marketplace publishing**: Publish company templates to the Agent Marketplace or unpublish them

### Data Displayed — In Detail

**Page header:**
- Title: "소울 템플릿"
- Subtitle showing total template count: "N개 템플릿"
- **"+ 새 템플릿" button** to create a new soul template

**Create form (toggled by the new template button):**
- Inline form that appears at the top of the page (not a modal)
- Fields:
  - **템플릿 이름** (name, required): e.g. "친절한 상담원"
  - **카테고리** (category, optional): e.g. "고객 응대"
  - **설명** (description, optional): purpose of this template
  - **소울 내용** (content, required): Large textarea with monospace font for writing the agent's personality/instructions in markdown
- Cancel and Create buttons

**Template grid (card layout, responsive: 1/2/3 columns):**

Each **template card** shows:
- **Template name** with optional lock icon (if built-in) and "공개" (published) badge if published to the marketplace
- **Description** (if any)
- **Category badge** on the right side (if set)
- **Soul content preview**: First 3 lines in monospace, truncated
- **Action links** at the bottom:
  - "내용 보기" (view content) — always available
  - "수정" (edit) — only for non-built-in templates
  - "삭제" (delete) — only for non-built-in templates

**Inline edit mode (per card):**
When editing, the card transforms into an edit form:
- Name input (pre-filled)
- Description input (pre-filled)
- Content textarea (pre-filled, monospace)
- Save and Cancel action links

**Marketplace publishing management section:**
- Separate section at the bottom of the page, only visible when the company has its own templates (not built-in)
- Title: "마켓 공개 관리"
- Subtitle: "회사 소울 템플릿을 에이전트 마켓에 공개하거나 비공개 처리할 수 있습니다."
- List of company-owned templates, each row showing:
  - Template name
  - Category badge (if set)
  - Download count (if published): "다운로드 N회"
  - **Action button**: "마켓 공개" (publish) or "비공개" (unpublish) depending on current state

**View content modal (opens when clicking "내용 보기"):**
- Template name (with lock icon if built-in)
- Description
- Full soul content in monospace scrollable area
- Close button

**Delete confirmation modal:**
- Title: "템플릿 삭제"
- Warning message: '"{name}" 템플릿을 삭제하시겠습니까? 이미 적용된 에이전트 소울에는 영향이 없습니다.'
- Cancel and Delete buttons

**Publish confirmation modal:**
- Title: "마켓 공개 확인"
- Warning: "이 소울 템플릿을 에이전트 마켓에 공개하시겠습니까? 공개 후 다른 회사에서 이 템플릿을 검색하고 가져갈 수 있습니다."
- Cancel and "공개" (publish) buttons

### User Actions

1. **Create a new soul template** with name, optional category/description, and soul content
2. **View the full soul content** of any template in a modal
3. **Edit a template** (name, description, content) inline on the card — only for non-built-in templates
4. **Delete a template** with confirmation — only for non-built-in templates. Soft delete (deactivation).
5. **Publish a template to the Agent Marketplace** — makes it visible to other companies. Requires confirmation.
6. **Unpublish a template from the marketplace** — hides it from other companies.

### UX Considerations

- **Company selection prerequisite**: A company must be selected. Without it, show "회사를 선택하세요".
- **Built-in vs company templates**: Built-in templates (platform-provided) are read-only — they cannot be edited, deleted, or published. They have a lock icon to indicate this.
- **Inline editing is quick**: Editing happens in-place on the card, not in a modal, allowing fast iteration on template content.
- **Safe deletion**: Deleting a template explicitly reassures the user that "이미 적용된 에이전트 소울에는 영향이 없습니다" — agents already using this soul won't be affected.
- **Publishing is a separate flow**: The marketplace publish section is intentionally separated from the CRUD cards to make it clear that publishing is a distinct, deliberate action.
- **Success feedback via toasts**: All operations (create, edit, delete, publish, unpublish) show toast notifications.
- **Loading state**: "로딩 중..." centered text.
- **Korean language**: All text in Korean.

### What NOT to Include on This Page

- No agent assignment — assigning a soul template to a specific agent happens on the agents page
- No tier/model assignment — soul templates define personality only, not operational settings
- No marketplace browsing — that's the agent-marketplace page
- No allowed tools management — tool permissions are on the agent or tools page
- No version history for templates
- No bulk import/export
