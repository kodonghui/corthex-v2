# 36. Soul Templates — Design Specification

## 1. Page Overview

- **Purpose**: CRUD management of AI agent soul templates (personality definitions) for a company. Also handles marketplace publishing/unpublishing of templates.
- **Key User Goals**: Create new soul templates with name/description/content/category, edit existing ones inline, delete custom templates, publish templates to the agent marketplace, view full soul content.
- **Data Dependencies**:
  - `GET /admin/soul-templates?companyId=` → `{ data: SoulTemplate[] }`
  - `POST /admin/soul-templates` → create template
  - `PATCH /admin/soul-templates/:id` → update template
  - `DELETE /admin/soul-templates/:id` → delete template
  - `POST /admin/soul-templates/:id/publish` → publish to marketplace
  - `POST /admin/soul-templates/:id/unpublish` → unpublish from marketplace
- **Current State**: Functional with zinc/indigo light-mode styling. Needs dark-mode-first redesign, improved card layout, better inline edit UX, polished modals, and separated marketplace section.

## 2. Page Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Page Header                                              │
│ [Title + Count]                          [+ 새 템플릿]   │
├─────────────────────────────────────────────────────────┤
│ Create Form (toggled, inline — not modal)                │
│ [Name] [Category]                                        │
│ [Description]                                            │
│ [Soul Content Textarea]                                  │
│ [Cancel] [생성]                                          │
├─────────────────────────────────────────────────────────┤
│ Template Grid (1/2/3 cols)                               │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│ │ Card/Edit│ │ Card     │ │ Card     │                  │
│ └──────────┘ └──────────┘ └──────────┘                  │
├─────────────────────────────────────────────────────────┤
│ Marketplace Publish Management Section                   │
│ [Template Row] [공개/비공개 toggle per template]          │
└─────────────────────────────────────────────────────────┘
```

- **Container**: `space-y-6`
- **Grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

## 3. Component Breakdown

### 3.1 PageHeader

- **Container**: `flex items-center justify-between`
- **Left side**:
  - `<h1 className="text-2xl font-bold tracking-tight text-slate-50">소울 템플릿</h1>`
  - `<p className="text-sm text-slate-400 mt-1">{count}개 템플릿</p>`
- **Right side**:
  - `<button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors">+ 새 템플릿</button>`
- **data-testid**: `soul-templates-header`

### 3.2 CreateForm (toggled by "+ 새 템플릿" button)

- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl p-5`
- **Title**: `<h3 className="text-lg font-semibold text-slate-50 mb-4">새 소울 템플릿</h3>`
- **Form**: `<form className="space-y-4">`
  - **Row 1** (2-col): `grid grid-cols-1 sm:grid-cols-2 gap-4`
    - **Name field**:
      - Label: `<label className="block text-sm font-medium text-slate-300 mb-1">템플릿 이름</label>`
      - Input: `<input className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none" placeholder="예: 친절한 상담원" required />`
    - **Category field**:
      - Label: `<label className="block text-sm font-medium text-slate-300 mb-1">카테고리</label>`
      - Input: `<input className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none" placeholder="예: 고객 응대" />`
  - **Row 2** (full width):
    - Label: `<label className="block text-sm font-medium text-slate-300 mb-1">설명</label>`
    - Input: `<input className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none" placeholder="이 템플릿의 용도" />`
  - **Row 3** (full width):
    - Label: `<label className="block text-sm font-medium text-slate-300 mb-1">소울 내용</label>`
    - Textarea: `<textarea rows={6} className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none resize-none font-mono" placeholder="에이전트의 성격과 행동 방식을 마크다운으로 정의..." required />`
  - **Actions**: `flex gap-2 justify-end`
    - Cancel: `<button type="button" className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">취소</button>`
    - Submit: `<button type="submit" className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors">{isPending ? '생성 중...' : '생성'}</button>`
- **data-testid**: `soul-create-form`

### 3.3 TemplateCard (view mode)

- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl p-5`
- **Header**: `flex items-start justify-between mb-3`
  - Left:
    - Name + indicators row: `flex items-center gap-2`
      - `<h3 className="text-base font-semibold text-slate-50">{name}</h3>`
      - Built-in lock (if isBuiltin): `<span className="text-slate-500" title="Built-in template"><svg>lock-icon 14x14</svg></span>`
      - Published badge (if isPublished): `<span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">공개</span>`
    - Description (if set): `<p className="text-sm text-slate-400 mt-0.5">{description}</p>`
  - Right: Category badge (if set): `<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">{category}</span>`
- **Soul preview**: `<pre className="text-xs text-slate-500 whitespace-pre-wrap line-clamp-3 mb-3 font-mono leading-relaxed">{preview}</pre>`
- **Action row**: `flex gap-3 pt-3 border-t border-slate-700/50`
  - View: `<button className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">내용 보기</button>`
  - Edit (non-builtin only): `<button className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">수정</button>`
  - Delete (non-builtin only): `<button className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium">삭제</button>`
- **data-testid**: `soul-card-{id}`

### 3.4 TemplateCard (edit mode — inline)

- **Container**: `bg-slate-800/50 border border-blue-500/30 rounded-xl p-5` (blue border indicates edit state)
- **Content**: `space-y-3`
  - Name input: `<input className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none" />`
  - Description input: `<input className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none" placeholder="설명" />`
  - Content textarea: `<textarea rows={6} className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none font-mono" />`
  - Actions: `flex gap-3 pt-3 border-t border-slate-700/50`
    - Save: `<button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">저장</button>`
    - Cancel: `<button className="text-xs text-slate-400 hover:text-slate-300 transition-colors">취소</button>`

### 3.5 MarketplacePublishSection

- **Visibility**: Only shown when `companyTemplates.length > 0`
- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl p-5`
- **Title**: `<h3 className="text-lg font-semibold text-slate-50 mb-2">마켓 공개 관리</h3>`
- **Subtitle**: `<p className="text-sm text-slate-400 mb-4">회사 소울 템플릿을 에이전트 마켓에 공개하거나 비공개 처리할 수 있습니다.</p>`
- **Template list**: `space-y-2`
  - Each row: `flex items-center justify-between px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700/50`
    - Left: `flex items-center gap-3`
      - Name: `<span className="text-sm font-medium text-slate-50">{name}</span>`
      - Category badge (if set): `<span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">{category}</span>`
      - Download count (if published): `<span className="text-xs text-slate-500">다운로드 {count}회</span>`
    - Right:
      - If published: `<button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-colors">비공개</button>`
      - If not published: `<button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">마켓 공개</button>`

### 3.6 ViewContentModal

- **Overlay**: `fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm`
- **Content**: `bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto`
- **Header**: `flex items-center justify-between mb-4`
  - Title: `<h3 className="text-lg font-semibold text-slate-50">{name} {isBuiltin && <lock-icon/>}</h3>`
  - Close: `<button className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-700 transition-colors"><svg>X 20x20</svg></button>`
- **Description** (if set): `<p className="text-sm text-slate-400 mb-3">{description}</p>`
- **Content**: `<pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-900 rounded-lg p-4 border border-slate-700">{content}</pre>`

### 3.7 DeleteConfirmModal

- **Overlay**: same as above
- **Content**: `bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4`
- **Title**: `<h3 className="text-lg font-semibold text-slate-50 mb-2">템플릿 삭제</h3>`
- **Message**: `<p className="text-sm text-slate-400 mb-4">"{name}" 템플릿을 삭제하시겠습니까? 이미 적용된 에이전트 소울에는 영향이 없습니다.</p>`
- **Actions**: `flex gap-2 justify-end`
  - Cancel: `<button className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">취소</button>`
  - Delete: `<button className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">{isPending ? '삭제 중...' : '삭제'}</button>`
- **data-testid**: `soul-delete-modal`

### 3.8 PublishConfirmModal

- **Overlay**: same
- **Content**: same dimensions as DeleteConfirm
- **Title**: `<h3 className="text-lg font-semibold text-slate-50 mb-2">마켓 공개 확인</h3>`
- **Message**: `<p className="text-sm text-slate-400 mb-4">이 소울 템플릿을 에이전트 마켓에 공개하시겠습니까? 공개 후 다른 회사에서 이 템플릿을 검색하고 가져갈 수 있습니다.</p>`
- **Actions**: `flex gap-2 justify-end`
  - Cancel: same as above
  - Publish: `<button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">{isPending ? '공개 중...' : '공개'}</button>`
- **data-testid**: `soul-publish-modal`

### 3.9 LoadingState

- `<div className="text-center text-slate-500 py-12">로딩 중...</div>`

### 3.10 NoCompanyState

- `<div className="p-8 text-center text-slate-500">회사를 선택하세요</div>`

## 4. Interaction Specifications

- **Create flow**: Click "+ 새 템플릿" → inline form appears at top → fill fields → submit → toast "소울 템플릿이 생성되었습니다" → form hides, list refreshes
- **Edit flow**: Click "수정" on card → card transforms to inline edit → modify fields → click "저장" → toast "소울 템플릿이 수정되었습니다" → card returns to view mode
- **Delete flow**: Click "삭제" → confirm modal → click "삭제" → toast "소울 템플릿이 삭제되었습니다" → modal closes, card removed
- **View content**: Click "내용 보기" → modal with full soul content → close via overlay click or X
- **Publish flow**: Click "마켓 공개" → confirm modal → click "공개" → toast "에이전트 마켓에 공개되었습니다" → button changes to "비공개"
- **Unpublish flow**: Click "비공개" → immediate action (no confirm) → toast "마켓에서 비공개 처리되었습니다"
- **Error handling**: All mutation errors show error toast with backend message

## 5. Responsive Design

### Desktop (> 1024px)
- 3-column card grid
- Create form: 2-column name/category row

### Tablet (768px - 1024px)
- 2-column card grid
- Create form: 2-column name/category row still fits

### Mobile (< 768px)
- 1-column card grid
- Create form: stacked single column (`grid-cols-1`)
- Modals: `mx-2`, `p-4`
