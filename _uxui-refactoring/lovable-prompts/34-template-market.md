# 34. Template Market (조직 템플릿 마켓) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Template Market** page in the Admin app. Administrators browse publicly shared **organization structure templates** published by other companies or built-in by the platform. Each template is a complete org blueprint containing departments and their AI agents. The admin can preview any template's full structure and **clone** it into their own company's template library for use.

Think of it as an "app store" for org structures — the admin finds a template that fits their needs, previews what departments and agents it includes, and clones it with one click.

### Data Displayed — In Detail

**Page header:**
- Title: "템플릿 마켓"
- Subtitle: "다른 회사가 공유한 조직 구조 템플릿을 찾아보고, 마음에 드는 것을 복제하여 사용할 수 있습니다."

**Search and filter bar:**
- **Text search field**: Filters templates by name. Placeholder: "템플릿 이름 검색..."
- **Tag filter dropdown**: Shows all unique tags extracted from available templates. Options include "모든 태그" (all) plus each unique tag. Only appears when tags exist.

**Template grid (card layout, responsive: 1 col mobile / 2 col tablet / 3 col desktop):**

Each **template card** shows:
- **Template name** as the primary heading
- **"기본" badge** if the template is a built-in platform template (isBuiltin)
- **Download count** (e.g. "42 DL") — how many times this template has been cloned
- **Description** (up to 2 lines, truncated)
- **Tags** shown as small pills (max 4 visible, with "+N" if more exist)
- **Summary stats**: "N개 부서" (department count) and "N명 에이전트" (total agent count across departments)
- **Department name pills**: Up to 5 department names shown as small pills, with "+N" if more exist
- The entire card is clickable to open the preview modal

**Empty state:**
- If search/filter active: "검색 결과가 없습니다."
- If no templates at all: "공개된 템플릿이 아직 없습니다."

**Preview modal (opens when clicking a card):**
- **Header**: Template name, stats line showing "N개 부서 · N명 에이전트 · N회 다운로드"
- **Tags**: All tags displayed as pills (if any)
- **Description**: Full template description
- **Department breakdown**: Each department shown as a bordered section with:
  - Department name, optional description, agent count badge
  - List of agents in that department, each showing:
    - Agent name
    - **Tier badge**: Manager / Specialist / Worker
    - Model name (e.g. "claude-sonnet-4-20250514") on the right side
- **Footer**: "닫기" (close) button and "내 조직에 복제" (clone to my org) primary action button
- Close via Escape key, clicking outside, or close button
- While cloning is in progress, button shows "복제 중..." and is disabled

### User Actions

1. **Search templates** by name using the text input
2. **Filter by tag** using the dropdown selector
3. **Click a template card** to open the preview modal with full details
4. **Clone a template** to their own organization's template library — creates a copy under the admin's company
5. **Close the preview modal** via Escape, backdrop click, or close button

### UX Considerations

- **Company selection prerequisite**: A company must be selected in the sidebar before this page is usable. Without it, show "사이드바에서 회사를 선택해주세요."
- **Browse-first experience**: The primary action is browsing — the grid should be visually appealing and scannable. Cards should give enough info to decide whether to click into the preview.
- **Preview before committing**: The modal provides full detail (all departments, all agents, tiers, models) so the admin can make an informed decision before cloning.
- **Clone feedback**: After successful clone, a success toast appears: "템플릿이 복제되었습니다. 조직 템플릿 페이지에서 확인하세요." — guiding the user to where the cloned template now lives.
- **No editing**: This is a read-only marketplace. Templates cannot be modified here — only browsed and cloned.
- **Download count as social proof**: Higher download counts signal popular/proven templates.
- **Loading state**: Show "로딩 중..." while fetching data.
- **Error state**: Show "마켓 데이터를 불러올 수 없습니다." with a "다시 시도" retry button.
- **Korean language**: All text in Korean.

### What NOT to Include on This Page

- No template creation or publishing — that happens on the org-templates page
- No editing of templates from the market
- No user reviews or ratings
- No pricing — all templates are free to clone
- No template version history
- No direct "apply to org" action — cloning only copies to the template library; applying is a separate step
