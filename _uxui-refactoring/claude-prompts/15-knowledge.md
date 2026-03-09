# 15. Knowledge Base (지식 베이스) — Claude Design Spec

## Page Overview
The Knowledge Base is the central knowledge repository for the CEO app. It manages documents in a folder hierarchy, agent memories (auto-learned knowledge), version history, and knowledge injection into agent prompts. Route: `/knowledge`. File: `packages/app/src/pages/knowledge.tsx`.

---

## Layout Structure

```
+------------------------------------------------------------------+
| HEADER: "지식 베이스" + Tabs("문서" | "에이전트 기억")           |
+------------------------------------------------------------------+
| SIDEBAR (w-64)        | MAIN CONTENT                             |
| Folder Tree           | Search + Filters                         |
|                       | Document List / Memory List               |
|                       | [or] Document Detail View                 |
+------------------------------------------------------------------+
```

### Root Container
```
<div className="h-full flex flex-col bg-slate-900">
```

### Header
```
<div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
  <h1 className="text-lg font-semibold text-slate-50">지식 베이스</h1>
  <Tabs /> <!-- "문서" | "에이전트 기억" -->
</div>
```

### Body (Sidebar + Main)
```
<div className="flex-1 flex overflow-hidden">
  <!-- Sidebar -->
  <aside className="w-64 border-r border-slate-700 bg-slate-800/50 flex flex-col overflow-y-auto">
    ...folder tree...
  </aside>
  <!-- Main -->
  <main className="flex-1 overflow-y-auto p-6">
    ...content...
  </main>
</div>
```

---

## Design System Tokens

| Token | Value |
|-------|-------|
| Background primary | `bg-slate-900` |
| Background elevated | `bg-slate-800` |
| Card | `bg-slate-800/50 border border-slate-700 rounded-xl` |
| Text primary | `text-slate-50` |
| Text secondary | `text-slate-400` |
| Border | `border-slate-700` |
| Action button | `bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2` |
| Accent | `text-cyan-400` |
| Destructive | `text-red-500 bg-red-500/10 hover:bg-red-500/20` |
| Success | `text-emerald-500` |
| Input | `bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-50 placeholder:text-slate-500` |

---

## Component Specifications

### 1. Sidebar — Folder Tree

#### Container
```html
<aside className="w-64 border-r border-slate-700 bg-slate-800/50 flex flex-col">
  <!-- Header -->
  <div className="p-3 border-b border-slate-700 flex items-center justify-between">
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">폴더</span>
    <button className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors">
      <!-- Plus icon (Lucide: FolderPlus, 16px) -->
    </button>
  </div>
  <!-- Tree -->
  <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
    <!-- Root item -->
    <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700/50 transition-colors flex items-center gap-2">
      <span className="w-4 h-4 text-slate-500"><!-- FolderIcon --></span>
      <span className="flex-1 truncate">전체 문서</span>
      <span className="text-xs text-slate-500">24</span>
    </button>
    <!-- Folder items (recursive) -->
  </div>
</aside>
```

#### Folder Item States
- **Default**: `text-slate-300 hover:bg-slate-700/50`
- **Active/Selected**: `bg-blue-600/20 text-blue-400 border-l-2 border-blue-500`
- **Has children (collapsed)**: Show `ChevronRight` icon (12px), rotates 90deg when expanded
- **Has children (expanded)**: Show `ChevronDown` icon (12px)
- **Nested indent**: Each level adds `pl-4` (16px)
- **Department badge**: If folder has departmentName, show `<span className="text-[10px] text-slate-500 ml-auto">마케팅부</span>`

#### Folder Context Menu (right-click or kebab)
```html
<div className="absolute z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-1 min-w-[160px]">
  <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2">
    <PencilIcon className="w-4 h-4" /> 이름 변경
  </button>
  <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2">
    <FolderPlusIcon className="w-4 h-4" /> 하위 폴더 추가
  </button>
  <div className="border-t border-slate-700 my-1" />
  <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2">
    <TrashIcon className="w-4 h-4" /> 삭제
  </button>
</div>
```

#### Mobile Sidebar
- On `< md` breakpoints, sidebar collapses. Show hamburger button in header.
- Sidebar overlays content as a slide-out drawer: `fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 transform transition-transform`
- Backdrop: `fixed inset-0 bg-black/50 z-30`

---

### 2. Document List (문서 탭)

#### Search + Filters Bar
```html
<div className="flex flex-wrap items-center gap-3 mb-4">
  <!-- Search -->
  <div className="relative flex-1 min-w-[200px] max-w-sm">
    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
    <input
      className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition-colors"
      placeholder="문서 검색..."
    />
  </div>
  <!-- Content Type Filter -->
  <select className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-blue-500">
    <option value="">전체 유형</option>
    <option value="markdown">Markdown</option>
    <option value="text">텍스트</option>
    <option value="html">HTML</option>
    <option value="mermaid">Mermaid</option>
  </select>
  <!-- Tag Filter -->
  <input
    className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none focus:border-blue-500 w-32"
    placeholder="태그 필터..."
  />
  <!-- Create Button -->
  <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
    <PlusIcon className="w-4 h-4" /> 문서 작성
  </button>
</div>
```

#### Document Table
```html
<div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="border-b border-slate-700">
        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">제목</th>
        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">유형</th>
        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">태그</th>
        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">수정일</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-700/50">
      <tr className="hover:bg-slate-700/30 cursor-pointer transition-colors">
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <FileTextIcon className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-sm font-medium text-slate-100 truncate">마케팅 전략 2026</span>
            <!-- File attachment indicator -->
            <PaperclipIcon className="w-3 h-3 text-slate-500 shrink-0" />
          </div>
        </td>
        <td className="py-3 px-4">
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/20 text-blue-400">markdown</span>
        </td>
        <td className="py-3 px-4">
          <div className="flex gap-1 flex-wrap">
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300">전략</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300">2026</span>
          </div>
        </td>
        <td className="py-3 px-4 text-right text-xs text-slate-400">2시간 전</td>
      </tr>
    </tbody>
  </table>
</div>
```

#### Content Type Badge Colors
| Type | Classes |
|------|---------|
| markdown | `bg-blue-500/20 text-blue-400` |
| text | `bg-slate-600/50 text-slate-300` |
| html | `bg-orange-500/20 text-orange-400` |
| mermaid | `bg-purple-500/20 text-purple-400` |

#### Pagination
```html
<div className="flex items-center justify-between mt-4">
  <span className="text-xs text-slate-500">24건 중 1-10</span>
  <div className="flex items-center gap-2">
    <button className="px-3 py-1.5 text-xs border border-slate-600 rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-30 transition-colors">이전</button>
    <span className="text-xs text-slate-400">1 / 3</span>
    <button className="px-3 py-1.5 text-xs border border-slate-600 rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-30 transition-colors">다음</button>
  </div>
</div>
```

---

### 3. Document Detail View

When a document is clicked, the main area shows the detail view:

```html
<div className="space-y-6">
  <!-- Back + Title -->
  <div className="flex items-center gap-3">
    <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
      <ArrowLeftIcon className="w-5 h-5" />
    </button>
    <input
      className="flex-1 bg-transparent text-xl font-semibold text-slate-50 border-b border-transparent hover:border-slate-600 focus:border-blue-500 outline-none py-1 transition-colors"
      value="마케팅 전략 2026"
    />
    <div className="flex items-center gap-2">
      <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">저장</button>
      <button className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  </div>

  <!-- Meta bar -->
  <div className="flex flex-wrap items-center gap-3">
    <!-- Content type -->
    <select className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none">
      <option>markdown</option><option>text</option><option>html</option><option>mermaid</option>
    </select>
    <!-- Folder -->
    <select className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none">
      <option>루트</option><option>마케팅</option>
    </select>
    <!-- Tags -->
    <div className="flex items-center gap-1 flex-wrap">
      <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-700 text-slate-300 flex items-center gap-1">
        전략 <button className="text-slate-500 hover:text-slate-200">x</button>
      </span>
      <input className="bg-transparent text-xs text-slate-50 w-16 outline-none placeholder:text-slate-500" placeholder="+ 태그" />
    </div>
  </div>

  <!-- Content Editor -->
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Editor -->
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-700 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">편집</span>
        <div className="flex gap-1">
          <button className="px-2 py-1 text-[10px] rounded bg-slate-700 text-slate-300 hover:bg-slate-600">B</button>
          <button className="px-2 py-1 text-[10px] rounded bg-slate-700 text-slate-300 hover:bg-slate-600">H</button>
          <button className="px-2 py-1 text-[10px] rounded bg-slate-700 text-slate-300 hover:bg-slate-600">Link</button>
        </div>
      </div>
      <textarea className="w-full bg-transparent text-sm text-slate-200 p-4 min-h-[400px] font-mono outline-none resize-none" />
    </div>
    <!-- Preview -->
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-700">
        <span className="text-xs font-medium text-slate-400">미리보기</span>
      </div>
      <div className="p-4 prose prose-invert prose-sm max-w-none">
        <!-- Rendered markdown here -->
      </div>
    </div>
  </div>

  <!-- File Attachment -->
  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <PaperclipIcon className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-300">report.pdf</span>
        <span className="text-xs text-slate-500">2.4MB</span>
      </div>
      <div className="flex items-center gap-2">
        <a className="text-xs text-blue-400 hover:text-blue-300">다운로드</a>
        <button className="text-xs text-red-400 hover:text-red-300">제거</button>
      </div>
    </div>
  </div>

  <!-- Version History -->
  <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
    <button className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-slate-300 hover:bg-slate-700/30 transition-colors rounded-xl">
      <span>버전 이력 (5개)</span>
      <ChevronDownIcon className="w-4 h-4 text-slate-500" />
    </button>
    <!-- Expanded content -->
    <div className="border-t border-slate-700 divide-y divide-slate-700/50">
      <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-700/20 transition-colors">
        <div>
          <span className="text-sm text-slate-200">v5</span>
          <span className="text-xs text-slate-500 ml-2">2시간 전 · 관리자</span>
          <p className="text-xs text-slate-400 mt-0.5">태그 업데이트</p>
        </div>
        <button className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1 rounded-lg border border-slate-600 hover:bg-blue-500/10 transition-colors">
          복원
        </button>
      </div>
    </div>
  </div>
</div>
```

---

### 4. Agent Memories Tab (에이전트 기억)

When the "에이전트 기억" tab is selected:

#### Filters
```html
<div className="flex flex-wrap items-center gap-3 mb-4">
  <select className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-blue-500">
    <option value="">전체 에이전트</option>
    <!-- agent options -->
  </select>
  <select className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none">
    <option value="">전체 유형</option>
    <option value="learning">학습</option>
    <option value="insight">인사이트</option>
    <option value="preference">선호</option>
    <option value="fact">사실</option>
  </select>
  <input className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none w-40" placeholder="검색..." />
  <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">+ 기억 추가</button>
</div>
```

#### Memory Card
```html
<div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3 hover:border-slate-600 transition-colors">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-100">주간 보고서 양식 선호</span>
      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400">학습</span>
    </div>
    <div className="flex items-center gap-1">
      <button className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"><PencilIcon className="w-3.5 h-3.5" /></button>
      <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"><TrashIcon className="w-3.5 h-3.5" /></button>
    </div>
  </div>
  <p className="text-sm text-slate-300 leading-relaxed">CEO는 주간 보고서에 핵심 지표 3개와 요약을 먼저 보길 원합니다.</p>
  <div className="flex items-center gap-4 text-xs text-slate-500">
    <span>에이전트: <span className="text-cyan-400">김비서</span></span>
    <span>출처: 자동</span>
    <span>사용 12회</span>
  </div>
  <!-- Confidence bar -->
  <div className="flex items-center gap-2">
    <span className="text-[10px] text-slate-500 w-12">신뢰도</span>
    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
      <div className="h-full bg-emerald-500 rounded-full" style="width: 85%" />
    </div>
    <span className="text-[10px] font-medium text-emerald-400">85%</span>
  </div>
</div>
```

#### Memory Type Badge Colors
| Type | Classes |
|------|---------|
| learning (학습) | `bg-emerald-500/20 text-emerald-400` |
| insight (인사이트) | `bg-purple-500/20 text-purple-400` |
| preference (선호) | `bg-blue-500/20 text-blue-400` |
| fact (사실) | `bg-amber-500/20 text-amber-400` |

#### Consolidate Button (per agent group)
```html
<button className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-cyan-500/10 transition-colors">
  <MergeIcon className="w-3.5 h-3.5" /> 기억 통합
</button>
```

---

### 5. Knowledge Templates Section
```html
<div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
  <h3 className="text-sm font-semibold text-slate-300 mb-3">문서 템플릿</h3>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    <button className="text-left p-3 rounded-lg border border-slate-600 hover:border-blue-500/50 hover:bg-slate-700/30 transition-colors">
      <p className="text-sm font-medium text-slate-200">주간 보고서</p>
      <p className="text-xs text-slate-500 mt-1">팀별 주간 업무 보고 양식</p>
      <span className="text-[10px] text-blue-400 mt-2 inline-block">이 템플릿으로 만들기 →</span>
    </button>
  </div>
</div>
```

---

### 6. Knowledge Injection Preview
```html
<div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-semibold text-slate-300">지식 주입 미리보기</h3>
    <span className="text-[10px] text-slate-500">에이전트에게 주입되는 지식</span>
  </div>
  <pre className="bg-slate-900 rounded-lg p-3 text-xs text-slate-400 font-mono max-h-48 overflow-y-auto border border-slate-700">
    <!-- injection preview text -->
  </pre>
</div>
```

---

## States

### Loading State
- Sidebar: 4x `<div className="h-8 bg-slate-700/50 rounded-lg animate-pulse mx-2 my-1" />`
- Document list: `<SkeletonTable rows={6} />` with dark theme
- Memory list: 3x card skeletons `<div className="h-32 bg-slate-700/50 rounded-xl animate-pulse" />`

### Empty States

#### Empty Folder
```html
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
    <FileTextIcon className="w-8 h-8 text-slate-600" />
  </div>
  <h3 className="text-base font-medium text-slate-300 mb-2">이 폴더에 문서가 없습니다</h3>
  <p className="text-sm text-slate-500 mb-4">문서를 만들어 지식을 정리해보세요</p>
  <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">문서 만들기</button>
</div>
```

#### First-time Empty Knowledge Base
```html
<div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-500/20 flex items-center justify-center mb-6">
    <BookOpenIcon className="w-10 h-10 text-blue-400" />
  </div>
  <h2 className="text-xl font-semibold text-slate-100 mb-3">지식 베이스를 시작하세요</h2>
  <p className="text-sm text-slate-400 mb-6 leading-relaxed">
    문서와 지식을 정리하면 AI 에이전트가 더 정확하게 일합니다. 첫 폴더를 만들어보세요.
  </p>
  <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors">첫 폴더 만들기</button>
</div>
```

#### Empty Memories
```html
<EmptyState
  icon={<BrainIcon className="w-8 h-8 text-slate-600" />}
  title="에이전트 기억이 없습니다"
  description="에이전트가 작업하면서 자동으로 기억을 학습합니다"
/>
```

### Error State
```html
<div className="flex flex-col items-center justify-center py-16 text-center">
  <AlertCircleIcon className="w-10 h-10 text-red-500/60 mb-4" />
  <h3 className="text-base font-medium text-slate-300 mb-2">데이터를 불러올 수 없습니다</h3>
  <button className="text-sm text-blue-400 hover:text-blue-300">다시 시도</button>
</div>
```

---

## Modals

### Create Folder Modal
```html
<Modal title="새 폴더">
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">폴더 이름 *</label>
      <input className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-50 outline-none" />
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">설명</label>
      <textarea className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-50 outline-none resize-none" rows={2} />
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">상위 폴더</label>
      <select className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none">
        <option>루트</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">부서</label>
      <select className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none">
        <option value="">없음</option>
      </select>
    </div>
    <div className="flex justify-end gap-2 pt-2">
      <button className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">취소</button>
      <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">만들기</button>
    </div>
  </div>
</Modal>
```

### Create Document Modal
Same pattern as folder with fields: Title (required), Content type selector, Folder assignment, Tags input, File upload dropzone.

### Version Restore Confirm Dialog
```html
<ConfirmDialog
  title="이 버전으로 복원하시겠습니까?"
  description="현재 내용이 새 버전으로 저장된 후, 선택한 버전의 내용으로 대체됩니다."
  confirmText="복원"
  variant="default" <!-- not destructive -->
/>
```

### Delete Folder Guard
If folder is non-empty, show: `이 폴더에 문서 {N}개와 하위 폴더 {M}개가 있어 삭제할 수 없습니다.`

---

## API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/workspace/knowledge/folders` | Get folder tree |
| POST | `/workspace/knowledge/folders` | Create folder |
| PATCH | `/workspace/knowledge/folders/:id` | Update folder |
| DELETE | `/workspace/knowledge/folders/:id` | Delete folder |
| GET | `/workspace/knowledge/docs` | List documents (paginated, filterable) |
| POST | `/workspace/knowledge/docs` | Create document |
| GET | `/workspace/knowledge/docs/:id` | Get document detail |
| PATCH | `/workspace/knowledge/docs/:id` | Update document |
| DELETE | `/workspace/knowledge/docs/:id` | Soft delete document |
| POST | `/workspace/knowledge/docs/upload` | Upload file as document |
| GET | `/workspace/knowledge/docs/:id/versions` | Version history |
| POST | `/workspace/knowledge/docs/:id/restore/:versionId` | Restore version |
| GET | `/workspace/knowledge/memories` | List agent memories |
| POST | `/workspace/knowledge/memories` | Create memory |
| PATCH | `/workspace/knowledge/memories/:id` | Update memory |
| DELETE | `/workspace/knowledge/memories/:id` | Delete memory |
| POST | `/workspace/knowledge/memories/:agentId/consolidate` | Consolidate memories |
| GET | `/workspace/knowledge/templates` | List templates |
| GET | `/workspace/knowledge/injection-preview` | Injection preview |

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| `>= lg` | Sidebar visible, editor side-by-side (2-col) |
| `md – lg` | Sidebar visible, editor stacked (1-col) |
| `< md` | Sidebar as overlay drawer, card-based document list, stacked editor |

---

## Accessibility
- All interactive elements have `aria-label` or visible text
- Folder tree uses `role="tree"` and `role="treeitem"` with `aria-expanded`
- Keyboard navigation: Arrow keys for folder tree, Tab for focus management
- Focus trapping in modals
- Color contrast: All text meets WCAG AA on dark backgrounds
