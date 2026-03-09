# 33. Org Templates (조직 템플릿) — Admin App

> **Route**: `/org-templates`
> **App**: Admin App (`app.corthex-hq.com/admin`)

---

## 복사할 프롬프트:

Design the **Org Templates (조직 템플릿)** page for the Admin App. This page lets admins browse, preview, apply, create, and publish organizational templates — pre-configured sets of departments and AI agents.

---

### Page Purpose

The admin needs to:
1. Browse available org templates (built-in and custom)
2. Preview what a template contains before applying
3. Apply a template to auto-create departments and agents (skipping duplicates)
4. Save the current org structure as a reusable template
5. Publish/unpublish custom templates to a shared marketplace

---

### Page Header

- Title: "조직 템플릿"
- Subtitle: "템플릿을 선택하면 부서와 에이전트가 자동으로 생성됩니다. 기존 조직과 중복되는 항목은 건너뜁니다."
- Action button (top-right): "현재 조직을 템플릿으로 저장"

---

### Template Grid

Templates displayed as a responsive grid of cards (1 col mobile, 2 col tablet, 3 col desktop).

**Template Card**
Each card shows:
- Template name (prominent, interactive — becomes highlighted on hover)
- Badges: "기본" for built-in templates, "공개" for published templates
- Description text (2-line clamp if long)
- Stats row: "N개 부서 · M명 에이전트"
- Department name chips: small tags showing each department in the template

Clicking a card opens the Preview Modal.

**Empty State**
If no templates exist: "등록된 템플릿이 없습니다."

---

### Preview Modal

A centered overlay modal showing the full contents of a template:

**Header**
- Template name
- Summary: "N개 부서 · M명 에이전트"
- Close button (X icon)

**Content** (scrollable)
- Template description (if present)
- For each department:
  - Department header row: name, optional description, agent count badge
  - Agent rows within: agent name, tier badge (Manager/Specialist/Worker), model name
  - Visual grouping that makes it clear which agents belong to which department

**Footer**
- "닫기" text button
- "이 템플릿 적용" primary button (shows loading state while applying)
- Closeable via backdrop click or Escape key

---

### Apply Result Modal

After successful template application, shows a results summary:

**Header**
- "적용 완료" title
- Template name subtitle

**Summary Cards (2 cards side by side)**
- 부서 생성: count of departments created (green)
- 에이전트 생성: count of agents created (blue)

**Skipped Info** (conditional)
If any items were skipped because they already exist:
- "이미 존재하는 항목: 부서 N개, 에이전트 M명 (건너뜀)"

**Detail per Department**
- Each department with its action badge (생성 = newly created, 기존 = already existed)
- List of newly created agents under each department

**Footer**
- "확인" primary button

---

### Create Template Modal

Triggered by the "현재 조직을 템플릿으로 저장" button.

**Header**
- "현재 조직을 템플릿으로 저장"
- Subtext: "현재 부서와 에이전트 구조가 템플릿으로 저장됩니다."

**Form**
- 템플릿 이름 (Template Name): required text input, placeholder "예: 스타트업 기본 조직"
- 설명 (Description): optional textarea (3 rows), placeholder "이 템플릿에 대한 간단한 설명..."

**Footer**
- "취소" text button
- "저장" primary button (disabled when name is empty, shows loading state)

---

### Market Publish Controls

Below the template grid, a separate bordered section appears if the admin has custom (non-built-in) templates:

**Header**: "마켓 공개 관리"

**Per-template rows:**
- Template name
- Status badge: "공개" (green) or "비공개" (muted)
- Download count (if > 0): "N회 다운로드"
- Action button:
  - If published: "마켓에서 회수" (red-styled, triggers unpublish)
  - If not published: "마켓에 공개" (triggers Publish Confirm Modal)

---

### Publish Confirm Modal

- "마켓에 공개" title
- Warning text: "이 템플릿을 마켓에 공개하시겠습니까? 다른 회사에서 이 조직 구조를 복제할 수 있게 됩니다."
- "취소" / "공개" buttons

---

### Prerequisites

- A company must be selected in the admin sidebar
- If no company selected: "사이드바에서 회사를 선택해주세요."

---

### Data & States

- Loading: "로딩 중..." centered text
- Error: "템플릿을 불러올 수 없습니다." with "다시 시도" retry button
- After apply: related caches (org-chart, departments, agents) are invalidated
- After create: template list refreshes
- Toast notifications for all success/error states

---

### UX Considerations

- Template cards should feel like "product cards" in a catalog — inviting the admin to browse and explore
- The preview modal is the key decision point — the admin needs to clearly see what they're about to create before committing
- The apply result modal provides confidence: show exactly what happened (created vs. skipped)
- The "duplicate skip" behavior means applying a template is always safe — no destructive overwrites
- The marketplace publish flow is a secondary feature — the publish controls section sits below the main grid, not competing for attention
- Built-in templates should feel official/curated (badge distinction)
- On mobile: template cards stack to single column, modals go full-screen
- All modals should be closeable via Escape key and backdrop click
- The create template flow captures the current org state — make it clear this is a "snapshot" of the current structure
