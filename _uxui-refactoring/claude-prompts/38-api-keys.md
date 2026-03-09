# 38. API Keys — Design Specification

## 1. Page Overview

- **Purpose**: Manage public API keys that allow external systems to call the CORTHEX API. Company-level API keys for integrations — not user credentials or Claude OAuth tokens.
- **Key User Goals**: Create API keys with name/scopes/expiry/rate-limit, securely copy the one-time raw key, rotate existing keys, delete (deactivate) keys, monitor key usage.
- **Data Dependencies**:
  - `GET /admin/public-api-keys?companyId=` → `{ success: true, data: ApiKey[] }`
  - `POST /admin/public-api-keys?companyId=` → create key, returns `{ data: CreatedKey }` with rawKey
  - `DELETE /admin/public-api-keys/:id?companyId=` → soft-delete (deactivate)
  - `POST /admin/public-api-keys/:id/rotate?companyId=` → rotate key, returns new rawKey
- **Current State**: Functional with zinc/indigo styling. Needs dark-mode-first redesign with slate palette, improved table styling, better modal designs, and enhanced security warning UI.

## 2. Page Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Page Header                                              │
│ [Title + Subtitle]                    [+ 새 API 키]     │
├─────────────────────────────────────────────────────────┤
│ API Keys Table                                           │
│ ┌──────┬────────┬───────┬──────┬──────┬──────┬────┬───┐ │
│ │ 이름 │ 접두사 │ 스코프│ Rate │ 사용 │ 만료 │상태│작업│ │
│ ├──────┼────────┼───────┼──────┼──────┼──────┼────┼───┤ │
│ │ ...  │ ...    │ ...   │ ...  │ ...  │ ...  │ ...│...│ │
│ └──────┴────────┴───────┴──────┴──────┴──────┴────┴───┘ │
└─────────────────────────────────────────────────────────┘

[Create Modal — overlay]
[Key Display Modal — overlay, one-time]
[Delete Confirm Modal — overlay]
[Rotate Confirm Modal — overlay]
```

- **Container**: `space-y-6` (inherits page padding)

## 3. Component Breakdown

### 3.1 PageHeader

- **Container**: `flex items-center justify-between`
- **Left**:
  - `<h1 className="text-xl font-bold tracking-tight text-slate-50">공개 API 키 관리</h1>`
  - `<p className="text-sm text-slate-400 mt-1">외부 시스템에서 CORTHEX API를 호출하기 위한 키를 관리합니다</p>`
- **Right**:
  - `<button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors">+ 새 API 키</button>`
- **data-testid**: `api-keys-header`

### 3.2 ApiKeysTable

- **Card container**: `bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden`
- **Scroll wrapper**: `<div className="overflow-x-auto">`
- **Table**: `<table className="w-full text-sm">`
- **Table head**:
  ```
  <thead>
    <tr className="border-b border-slate-700">
      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">이름</th>
      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">키 접두사</th>
      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">스코프</th>
      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">Rate Limit</th>
      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">마지막 사용</th>
      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">만료일</th>
      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">상태</th>
      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">작업</th>
    </tr>
  </thead>
  ```
- **Table body**: `<tbody className="divide-y divide-slate-700/50">`
- **Each row**: `<tr className="hover:bg-slate-800/50 transition-colors">`
  - **이름**: `<td className="px-5 py-3 font-medium text-slate-50">{name}</td>`
  - **키 접두사**: `<td className="px-5 py-3 font-mono text-xs text-slate-400">{keyPrefix}</td>`
  - **스코프**: `<td className="px-5 py-3">`
    - `<div className="flex gap-1">`
      - Each scope: `<span className="inline-flex items-center px-1.5 py-0.5 text-xs rounded font-medium bg-slate-700 text-slate-300">{scope}</span>`
  - **Rate Limit**: `<td className="px-5 py-3 text-slate-400 font-mono text-xs">{rateLimitPerMin}/min</td>`
  - **마지막 사용**: `<td className="px-5 py-3 text-slate-400 text-xs">{formattedDate}</td>`
  - **만료일**: `<td className="px-5 py-3 text-slate-400 text-xs">{formattedDate}</td>`
  - **상태**:
    - Active: `<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">활성</span>`
    - Inactive: `<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">비활성</span>`
  - **작업** (active keys only): `<td className="px-5 py-3">`
    - `<div className="flex gap-2">`
      - Rotate: `<button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">로테이션</button>`
      - Delete: `<button className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors">삭제</button>`

### 3.3 CreateModal

- **Overlay**: `fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm`
- **Content**: `bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4`
- **Title**: `<h2 className="text-lg font-bold text-slate-50 mb-4">새 API 키 생성</h2>`
- **Form**: `<div className="space-y-4">`
  - **Name field**:
    - Label: `<label className="block text-sm font-medium text-slate-300 mb-1">이름</label>`
    - Input: `<input className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none" placeholder="예: 대시보드 연동" />`
  - **Scopes field**:
    - Label: `<label className="block text-sm font-medium text-slate-300 mb-1">스코프</label>`
    - Checkboxes: `<div className="flex gap-4">`
      - Each scope (`read`, `write`, `execute`):
        ```
        <label className="flex items-center gap-1.5 text-sm text-slate-300 cursor-pointer">
          <input type="checkbox" className="rounded-sm border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0" />
          {scope}
        </label>
        ```
  - **Expiry field**:
    - Label: `<label className="block text-sm font-medium text-slate-300 mb-1">만료일 (선택)</label>`
    - Input: `<input type="datetime-local" className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none [color-scheme:dark]" />`
  - **Rate Limit field**:
    - Label: `<label className="block text-sm font-medium text-slate-300 mb-1">Rate Limit (요청/분)</label>`
    - Input: `<input type="number" min={1} max={10000} className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none" />`
- **Actions**: `flex justify-end gap-3 mt-6`
  - Cancel: `<button className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">취소</button>`
  - Create: `<button className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors" disabled={!name || scopes.length===0 || isPending}>{isPending ? '생성 중...' : '생성'}</button>`
- **data-testid**: `api-key-create-modal`

### 3.4 KeyDisplayModal (ONE-TIME — critical security UX)

- **Overlay**: `fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm` — **NO onClick dismiss** on overlay (prevent accidental close before copying)
- **Content**: `bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-6 mx-4`
- **Title**: `<h2 className="text-lg font-bold text-slate-50 mb-2">API 키가 생성되었습니다</h2>`
- **Warning banner**:
  ```
  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
    <p className="text-sm text-amber-300 font-medium flex items-center gap-2">
      <svg className="w-4 h-4 flex-shrink-0"><!-- warning triangle icon --></svg>
      이 키는 다시 표시되지 않습니다. 반드시 안전한 곳에 저장하세요.
    </p>
  </div>
  ```
- **Key display area**:
  ```
  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-3 mb-4">
    <code className="flex-1 text-xs font-mono text-slate-50 break-all select-all">{rawKey}</code>
    <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap">
      {copied ? '복사됨!' : '복사'}
    </button>
  </div>
  ```
- **Close button**: `flex justify-end`
  - `<button className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg px-4 py-2 transition-colors">닫기</button>`
- **data-testid**: `api-key-display-modal`

### 3.5 DeleteConfirmModal

- **Overlay**: `fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm`
- **Content**: `bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4`
- **Title**: `<h2 className="text-lg font-bold text-slate-50 mb-2">API 키 삭제</h2>`
- **Message**: `<p className="text-sm text-slate-400 mb-4">이 API 키를 삭제하면 해당 키를 사용하는 모든 외부 연동이 중단됩니다. 계속하시겠습니까?</p>`
- **Actions**: `flex justify-end gap-3`
  - Cancel: `<button className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">취소</button>`
  - Delete: `<button className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors">{isPending ? '삭제 중...' : '삭제'}</button>`

### 3.6 RotateConfirmModal

- **Overlay**: same as DeleteConfirm
- **Content**: same dimensions
- **Title**: `<h2 className="text-lg font-bold text-slate-50 mb-2">API 키 로테이션</h2>`
- **Message**: `<p className="text-sm text-slate-400 mb-4">기존 키가 즉시 비활성화되고 새 키가 발급됩니다. 외부 시스템에서 새 키로 교체해야 합니다. 계속하시겠습니까?</p>`
- **Actions**: `flex justify-end gap-3`
  - Cancel: same
  - Rotate: `<button className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors">{isPending ? '로테이션 중...' : '로테이션'}</button>`
- After success → opens KeyDisplayModal with new rawKey

### 3.7 LoadingState

- `<div className="text-center text-slate-500 py-8">로딩 중...</div>`

### 3.8 EmptyState

- ```
  <div className="text-center py-16">
    <div className="text-slate-600 mb-3">
      <svg className="w-12 h-12 mx-auto"><!-- key icon --></svg>
    </div>
    <p className="text-base text-slate-400 mb-2">아직 API 키가 없습니다</p>
    <p className="text-sm text-slate-500">새 API 키를 생성하여 외부 시스템과 연동하세요</p>
  </div>
  ```

### 3.9 NoCompanyState

- `<div className="p-6 text-slate-500">회사를 먼저 선택해 주세요</div>`

## 4. Interaction Specifications

- **Create flow**: Click "+ 새 API 키" → CreateModal opens → fill name + scopes + optional expiry + rate limit → click "생성" → modal closes → KeyDisplayModal opens with raw key → user copies key → click "닫기" → key list refreshes
- **Copy key**: Click "복사" → `navigator.clipboard.writeText(rawKey)` → button text changes to "복사됨!" for 2 seconds
- **Rotate flow**: Click "로테이션" → RotateConfirmModal → click "로테이션" → old key deactivated, new key generated → KeyDisplayModal opens with new raw key
- **Delete flow**: Click "삭제" → DeleteConfirmModal → click "삭제" → key deactivated (soft delete) → list refreshes
- **Error handling**: All mutation errors (create, delete, rotate) show error toast with backend error message via `useToastStore`
- **Key display safety**: KeyDisplayModal overlay does NOT close on click — only the explicit "닫기" button closes it. This prevents accidental dismissal before copying.

## 5. Responsive Design

### Desktop (> 1024px)
- Full 8-column table with comfortable spacing
- All modals centered with max-width constraints

### Tablet (768px - 1024px)
- Table wrapped in `overflow-x-auto` for horizontal scroll if needed
- Modals still fit comfortably

### Mobile (< 768px)
- Table in `overflow-x-auto` with horizontal scroll
- Use horizontal scroll (definitive). For enhanced mobile UX, optionally switch to card layout:
  ```
  <div className="space-y-3">
    {keys.map(k => (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-50">{name}</span>
          <StatusBadge />
        </div>
        <p className="text-xs font-mono text-slate-400 mb-2">{keyPrefix}</p>
        <div className="flex gap-1 mb-2">{scope badges}</div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{rateLimitPerMin}/min</span>
          <span>최근 사용: {lastUsed}</span>
        </div>
        {k.isActive && <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">actions</div>}
      </div>
    ))}
  </div>
  ```
- Modals: `mx-2`, `p-4`, `max-w-[calc(100vw-16px)]`
