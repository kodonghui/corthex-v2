# 35. Agent Marketplace — Design Specification

## 1. Page Overview

- **Purpose**: Browse and import publicly shared AI agent soul templates from other companies or built-in platform templates. Administrators discover agent personalities ("souls") and import them into their own company's soul template library.
- **Key User Goals**: Find a suitable agent personality template by category/tier, preview its soul content and recommended tools, import it with one click.
- **Data Dependencies**:
  - `GET /workspace/agent-marketplace?q=&category=&tier=` → `{ data: MarketSoulTemplate[] }`
  - `POST /workspace/agent-marketplace/:id/import` → import template to company library
- **Current State**: Functional page with zinc/indigo light-mode styling. Needs full dark-mode-first redesign with slate palette, consistent card patterns, improved visual hierarchy, and polished modal.

## 2. Page Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Page Header                                              │
│ [Title + Subtitle]                                       │
├─────────────────────────────────────────────────────────┤
│ Filter Bar                                               │
│ [Search Input] [Category Dropdown] [Tier Dropdown]       │
├─────────────────────────────────────────────────────────┤
│ Template Grid (1/2/3 cols responsive)                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│ │ Card     │ │ Card     │ │ Card     │                  │
│ │          │ │          │ │          │                  │
│ └──────────┘ └──────────┘ └──────────┘                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│ │ Card     │ │ Card     │ │ Card     │                  │
│ └──────────┘ └──────────┘ └──────────┘                  │
└─────────────────────────────────────────────────────────┘

[Preview Modal — overlays page when card clicked]
```

- **Container**: `space-y-6` (inherits page padding from layout)
- **Grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- **Responsive**: 1 col mobile, 2 col tablet, 3 col desktop

## 3. Component Breakdown

### 3.1 PageHeader

- **Purpose**: Title and description for the page
- **Container**: `<div>`
- **Layout**: block
- **Content**:
  - `<h1 className="text-2xl font-bold tracking-tight text-slate-50">에이전트 마켓</h1>`
  - `<p className="text-sm text-slate-400 mt-1">다른 회사가 공유한 에이전트 Soul 템플릿을 찾아 가져올 수 있습니다</p>`
- **data-testid**: `marketplace-header`

### 3.2 FilterBar

- **Purpose**: Search and filter templates by name, category, tier
- **Container**: `<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">`
- **Content**:
  - **Search Input**:
    ```
    <input
      className="flex-1 bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors"
      placeholder="템플릿 검색..."
    />
    ```
  - **Category Dropdown**:
    ```
    <select className="bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors min-w-[160px]">
      <option value="">전체 카테고리</option>
      {/* dynamically populated */}
    </select>
    ```
  - **Tier Dropdown**:
    ```
    <select className="bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors min-w-[130px]">
      <option value="">전체 티어</option>
      <option value="manager">매니저</option>
      <option value="specialist">전문가</option>
      <option value="worker">워커</option>
    </select>
    ```
- **data-testid**: `marketplace-filters`

### 3.3 MarketCard (repeated per template)

- **Purpose**: Display template summary; clickable to open preview modal
- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl p-5 cursor-pointer hover:border-blue-500/50 hover:bg-slate-800 transition-all duration-200`
- **Layout**: block, internal spacing
- **Content**:
  - **Header row**: `flex items-start justify-between mb-2`
    - `<h3 className="text-base font-semibold text-slate-50 line-clamp-1">{name}</h3>`
    - `<span className="text-xs text-slate-500 whitespace-nowrap ml-2 font-mono">↓ {downloadCount}</span>`
  - **Badge row**: `flex items-center gap-1.5 mb-2`
    - Category badge (if set): `<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">{category}</span>`
    - Tier badge (if set):
      - manager: `bg-purple-500/20 text-purple-300 border border-purple-500/30`
      - specialist: `bg-blue-500/20 text-blue-300 border border-blue-500/30`
      - worker: `bg-emerald-500/20 text-emerald-300 border border-emerald-500/30`
      - Format: `<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {tierClasses}">{tierLabel}</span>`
    - Built-in indicator (if isBuiltin): `<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">내장</span>`
  - **Description** (if set): `<p className="text-sm text-slate-400 line-clamp-2 mb-2">{description}</p>`
  - **Soul preview**: `<pre className="text-xs text-slate-500 whitespace-pre-wrap line-clamp-3 font-mono leading-relaxed">{truncatedContent}</pre>`
- **States**:
  - Hover: border shifts to `border-blue-500/50`, background to `bg-slate-800`
- **data-testid**: `marketplace-card-{id}`

### 3.4 MarketPreviewModal

- **Purpose**: Full template details with import action
- **Overlay**: `fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm`
- **Content container**: `bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto`
- **Layout**:
  - **Header**: `flex items-start justify-between mb-4`
    - Left:
      - `<h3 className="text-lg font-semibold text-slate-50">{name}</h3>`
      - Badge row below (same tier/category/builtin badges as card): `flex items-center gap-2 mt-1.5`
    - Close button: `<button className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-700"><svg>X icon 20x20</svg></button>`
  - **Description** (if set): `<p className="text-sm text-slate-400 mb-4">{description}</p>`
  - **Soul content section**: `mb-4`
    - Label: `<h4 className="text-sm font-medium text-slate-300 mb-2">Soul 내용</h4>`
    - Content: `<pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-900 rounded-lg p-4 max-h-60 overflow-y-auto border border-slate-700">{content}</pre>`
  - **Recommended tools section** (if allowedTools.length > 0): `mb-4`
    - Label: `<h4 className="text-sm font-medium text-slate-300 mb-2">추천 도구 ({count}개)</h4>`
    - Tools: `<div className="flex flex-wrap gap-1.5">`
      - Each tool: `<span className="text-xs px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 font-mono">{toolName}</span>`
  - **Footer**: `flex items-center justify-between pt-4 border-t border-slate-700`
    - Left: `<span className="text-xs text-slate-500">다운로드 {count}회</span>`
    - Right: `<button className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-5 py-2 transition-colors">{importing ? '가져오는 중...' : '가져오기'}</button>`
- **data-testid**: `marketplace-preview-modal`

### 3.5 LoadingState

- **Purpose**: Shown while data loads
- **Content**: `<div className="text-center text-slate-500 py-12">로딩 중...</div>`
- **Alternative skeleton approach**:
  ```
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1,2,3,4,5,6].map(i => (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <div className="bg-slate-700 animate-pulse rounded h-5 w-3/4 mb-3" />
        <div className="flex gap-1.5 mb-2">
          <div className="bg-slate-700 animate-pulse rounded-full h-5 w-16" />
          <div className="bg-slate-700 animate-pulse rounded-full h-5 w-14" />
        </div>
        <div className="bg-slate-700 animate-pulse rounded h-4 w-full mb-1" />
        <div className="bg-slate-700 animate-pulse rounded h-4 w-2/3 mb-3" />
        <div className="bg-slate-700/50 animate-pulse rounded h-12 w-full" />
      </div>
    ))}
  </div>
  ```

### 3.6 EmptyState

- **Purpose**: Shown when no templates match
- **Content**:
  ```
  <div className="text-center py-16">
    <div className="text-slate-600 mb-3">
      <svg className="w-12 h-12 mx-auto"><!-- store/package icon --></svg>
    </div>
    <p className="text-sm text-slate-400">
      {hasFilters ? '검색 결과가 없습니다' : '공개된 에이전트 템플릿이 없습니다'}
    </p>
  </div>
  ```

## 4. Interaction Specifications

- **Search**: Debounced (300ms) text input filters via API query param `q`
- **Category/Tier dropdowns**: Immediately trigger re-fetch with updated query params
- **Card click**: Opens `MarketPreviewModal` with full template data (already in memory)
- **Import button**: Calls `POST /workspace/agent-marketplace/:id/import`, on success invalidates queries and shows toast "에이전트 템플릿을 가져왔습니다", modal closes
- **Modal close**: Click overlay background or X button
- **Error handling**: Import failure shows error toast with backend message

## 5. Responsive Design

### Desktop (> 1024px)
- 3-column card grid
- Filter bar: single row with search flex-1, two dropdowns fixed width

### Tablet (768px - 1024px)
- 2-column card grid
- Filter bar: single row still fits

### Mobile (< 768px)
- 1-column card grid
- Filter bar: stacked vertically (`flex-col`), each control full width
- Modal: `mx-2`, smaller padding `p-4`
