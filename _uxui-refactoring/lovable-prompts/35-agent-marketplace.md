# 35. Agent Marketplace (에이전트 마켓) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Agent Marketplace** page in the Admin app. Administrators browse publicly shared **AI agent soul templates** published by other companies or built-in by the platform. Each soul template defines an individual agent's personality, behavior instructions (the "soul"), recommended tier, category, and suggested tools. The admin can preview a template's full soul content and **import** it into their own company's soul template library.

Unlike the Template Market (which deals with full org structures), this page is for individual agent personalities — "what kind of agent do you want to create?"

### Data Displayed — In Detail

**Page header:**
- Title: "에이전트 마켓"
- Subtitle: "다른 회사가 공유한 에이전트 Soul 템플릿을 찾아 가져올 수 있습니다"

**Filter bar (three controls in a row):**
- **Text search field**: Filters by template name. Placeholder: "템플릿 검색..."
- **Category dropdown**: "전체 카테고리" (all) plus dynamically extracted unique categories from results (e.g. "고객 응대", "마케팅", "데이터 분석")
- **Tier dropdown**: "전체 티어" (all), "매니저", "전문가", "워커"

**Template grid (card layout, responsive: 1/2/3 columns):**

Each **template card** shows:
- **Template name** as the primary heading (single line, truncated)
- **Download count** (e.g. "↓ 42")
- **Category badge** (if set) — e.g. "고객 응대"
- **Tier badge** (if set) — 매니저 / 전문가 / 워커, each with distinct visual treatment
- **"내장" indicator** if it's a built-in platform template
- **Description** (up to 2 lines, truncated)
- **Soul content preview**: First 3 lines of the soul text in monospace font, truncated with "..."
- The entire card is clickable to open the preview modal

**Empty state:**
- With active filters: "검색 결과가 없습니다"
- No templates at all: "공개된 에이전트 템플릿이 없습니다"

**Preview modal (opens when clicking a card):**
- **Header**: Template name, with category badge, tier badge, and "내장" badge displayed below
- **Description** (if any)
- **Soul content section**: Label "Soul 내용", showing the full soul text in a monospace scrollable area
- **Recommended tools section** (if the template has allowedTools): Label "추천 도구 (N개)", listing all tool names as small pills
- **Footer**: Download count display ("다운로드 N회") on the left, "가져오기" (import) primary action button on the right
- While importing, button shows "가져오는 중..." and is disabled

### User Actions

1. **Search templates** by name
2. **Filter by category** using the dropdown
3. **Filter by tier** (manager/specialist/worker) using the dropdown
4. **Click a template card** to preview the full soul content and details
5. **Import a template** into their own company's soul template library
6. **Close the preview modal** by clicking outside or the close button

### UX Considerations

- **No company selection required**: Unlike some admin pages, this marketplace is accessible without selecting a specific company first, since it shows cross-company published templates.
- **Soul preview is key**: The monospace preview on cards gives a quick taste of what the agent's personality looks like. The full soul text in the modal is critical for the admin to evaluate quality before importing.
- **Category and tier as primary filters**: These two dimensions are the most natural way to browse agent templates — "I need a manager-level marketing agent" narrows results quickly.
- **Import vs clone naming**: This page uses "가져오기" (import) rather than "복제" (clone) to distinguish from the org Template Market. Importing copies the soul template to the admin's soul template library.
- **Success feedback**: After import, a toast shows "에이전트 템플릿을 가져왔습니다".
- **Tools as discovery signal**: Seeing recommended tools helps the admin understand what the agent is designed to do (e.g. an agent with KIS trading tools is clearly a finance specialist).
- **Loading state**: "로딩 중..." centered text.
- **Error handling**: Show appropriate error feedback if the marketplace data fails to load.
- **Korean language**: All text in Korean.

### What NOT to Include on This Page

- No soul template creation or publishing — that happens on the soul-templates management page
- No editing of marketplace templates
- No direct agent creation from a template — importing only copies to the library
- No user reviews, ratings, or comments
- No pricing
- No template version history
