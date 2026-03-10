# 37. Report Lines — Design Specification

## 1. Page Overview

- **Purpose**: Define the reporting hierarchy between employees in a company. Each employee can report to one other employee (supervisor) or be top-level. Used for report delivery chains and Chief-of-Staff orchestration routing.
- **Key User Goals**: Quickly set each employee's supervisor via dropdown, save all changes in batch, see current hierarchy at a glance.
- **Data Dependencies**:
  - `GET /admin/users?companyId=` → `{ data: User[] }` (id, name, username, role)
  - `GET /admin/report-lines?companyId=` → `{ data: ReportLine[] }` (userId, reportsToUserId)
  - `PUT /admin/report-lines` → batch save all report lines
- **Current State**: Functional table with @corthex/ui components (Card, Badge, Button, Skeleton). Uses zinc/indigo colors. Needs dark-mode-first redesign with slate palette and consistent table styling. **Replace @corthex/ui components with raw Tailwind** for consistency with other admin pages in this batch.

## 2. Page Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Page Header                                              │
│ [Title + Subtitle]                    [변경사항 저장]     │
├─────────────────────────────────────────────────────────┤
│ [Success Banner — conditional]                           │
├─────────────────────────────────────────────────────────┤
│ Report Lines Table (Card)                                │
│ ┌─────────┬────────┬────────────────┬──────────┐        │
│ │ 직원    │ 역할   │ 보고 대상      │ 유형     │        │
│ ├─────────┼────────┼────────────────┼──────────┤        │
│ │ 김대표  │ admin  │ [Dropdown ▼]   │ 최상위   │        │
│ │ 박팀장  │ emp    │ [Dropdown ▼]   │ → 김대표 │        │
│ │ ...     │ ...    │ ...            │ ...      │        │
│ └─────────┴────────┴────────────────┴──────────┘        │
├─────────────────────────────────────────────────────────┤
│ Info Box                                                 │
│ [Explanatory notes about report lines]                   │
└─────────────────────────────────────────────────────────┘
```

- **Container**: `space-y-6`
- **Table**: full-width inside a Card component

## 3. Component Breakdown

### 3.1 PageHeader

- **Container**: `flex items-center justify-between`
- **Left**:
  - `<h1 className="text-xl font-semibold tracking-tight text-slate-50">보고 라인</h1>`
  - `<p className="text-sm text-slate-400 mt-0.5">직원 간 보고 구조를 설정합니다 (H → 상위자)</p>`
- **Right**:
  - Save button: `<button className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors" disabled={!hasChanges || isPending}>{isPending ? '저장 중...' : '변경사항 저장'}</button>`
- **data-testid**: `report-lines-header`

### 3.2 SuccessBanner

- **Visibility**: `saveMutation.isSuccess && !hasChanges`
- **Container**: `<div className="px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">저장 완료</div>`
- **data-testid**: `report-lines-success`

### 3.3 ReportLinesTable

- **Card container**: `bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden`
- **Table**: `<table className="w-full">`
- **Table head**:
  ```
  <thead>
    <tr className="border-b border-slate-700">
      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">직원</th>
      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">역할</th>
      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">보고 대상</th>
      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">유형</th>
    </tr>
  </thead>
  ```
- **Table body**: `<tbody className="divide-y divide-slate-700/50">`
- **Each row**: `<tr className="hover:bg-slate-800/50 transition-colors">`
  - **직원 cell** (`px-5 py-3`):
    - `<p className="text-sm font-medium text-slate-50">{name}</p>`
    - `<p className="text-xs text-slate-500 font-mono">@{username}</p>`
  - **역할 cell** (`px-5 py-3`):
    - admin role: `<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">admin</span>`
    - other role: `<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">{role}</span>`
  - **보고 대상 cell** (`px-5 py-3`):
    ```
    <select className="bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors">
      <option value="">없음 (최상위)</option>
      {users.filter(t => t.id !== u.id).map(t => (
        <option value={t.id}>{t.name} (@{t.username})</option>
      ))}
    </select>
    ```
  - **유형 cell** (`px-5 py-3`):
    - Has supervisor: `<span className="text-xs text-slate-400">→ {reportTarget.name}</span>`
    - Top-level: `<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">최상위</span>`

### 3.4 LoadingState (skeleton)

- Inside the Card container: `<div className="p-5 space-y-4">`
  - 4 skeleton rows:
    ```
    <div className="flex items-center gap-4">
      <div className="bg-slate-700 animate-pulse rounded h-4 w-24" />
      <div className="bg-slate-700 animate-pulse rounded h-8 w-20" />
      <div className="bg-slate-700 animate-pulse rounded h-8 w-48" />
      <div className="bg-slate-700 animate-pulse rounded-full h-5 w-16" />
    </div>
    ```

### 3.5 EmptyState

- `<div className="py-12 text-center text-sm text-slate-500">직원을 먼저 등록하세요</div>`

### 3.6 InfoBox

- **Container**: `<div className="px-4 py-3 rounded-lg bg-slate-800/30 border border-slate-700/50 text-xs text-slate-500 space-y-1">`
- **Content**:
  - `<p>보고 라인은 보고서 전달 경로와 비서 오케스트레이션에 사용됩니다.</p>`
  - `<p>"없음 (최상위)"으로 설정된 직원은 보고 체계의 최상위에 위치합니다.</p>`

### 3.7 NoCompanyState

- `<div className="p-8 text-center text-slate-500">회사를 선택하세요</div>`

## 4. Interaction Specifications

- **Change supervisor**: Select a different option in the dropdown → `handleChange(userId, newValue)` → marks `hasChanges=true` → "유형" column updates immediately in real-time
- **Save**: Click "변경사항 저장" → `PUT /admin/report-lines` with all user mappings → on success toast "보고 라인이 저장되었습니다" + success banner → `hasChanges` resets to false
- **Save error**: Backend validates circular references (A→B→C→A). If invalid, error toast with backend message.
- **Button state**: "변경사항 저장" disabled when no changes or saving in progress. Visual feedback via `disabled:opacity-50`.

## 5. Responsive Design

### Desktop (> 1024px)
- Full table with 4 columns, comfortable spacing

### Tablet (768px - 1024px)
- Table still fits; dropdown may be slightly narrower
- Consider `overflow-x-auto` wrapper for safety

### Mobile (< 768px)
- Wrap table in `overflow-x-auto` for horizontal scroll
- Use `overflow-x-auto` wrapper with horizontal scroll (definitive — no card layout switch needed for this simple 4-column table)
