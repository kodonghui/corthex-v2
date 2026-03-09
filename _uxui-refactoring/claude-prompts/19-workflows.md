# 19. Workflows (워크플로우 관리) — Claude Design Spec (Admin App)

## Page Overview
The Workflows page is in the **Admin** app. It lets admins create, edit, execute, and manage multi-step automated workflows (DAGs). Features include a visual canvas editor, pattern analysis for auto-suggestions, execution history with step-by-step results, and suggestion management. Route: `/workflows` (admin). File: `packages/admin/src/pages/workflows.tsx`.

---

## Layout Structure

### List View (Default)
```
+------------------------------------------------------------------+
| HEADER: "워크플로우 관리" + [패턴 분석] + [+ 새 워크플로우]     |
+------------------------------------------------------------------+
| TABS: 워크플로우 (N) | 제안 (N)                                  |
+------------------------------------------------------------------+
| Workflow Cards List  OR  Suggestion Cards List                    |
+------------------------------------------------------------------+
```

### Editor View (Create/Edit)
```
+------------------------------------------------------------------+
| HEADER: "새 워크플로우" + [캔버스|폼] toggle + "← 목록으로"     |
+------------------------------------------------------------------+
| Name + Description Form                                           |
+------------------------------------------------------------------+
| Canvas Editor  OR  DAG Preview + Step Builder (form mode)         |
+------------------------------------------------------------------+
| Save/Cancel Buttons                                               |
+------------------------------------------------------------------+
```

### Execution History View
```
+------------------------------------------------------------------+
| HEADER: "실행 이력" + subtitle + [지금 실행] + "← 목록으로"     |
+------------------------------------------------------------------+
| Execution Cards (clickable, with status bar)                      |
+------------------------------------------------------------------+
```

### Root Container (Admin uses slightly different layout)
```html
<div className="space-y-6 p-6 bg-slate-900 min-h-full">
```

---

## Component Specifications

### 1. Header (List View)
```html
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold text-slate-50">워크플로우 관리</h1>
  <div className="flex gap-2">
    <button className="px-4 py-2 text-sm rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-colors">
      {analyzing ? '분석 중...' : '패턴 분석'}
    </button>
    <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
      + 새 워크플로우
    </button>
  </div>
</div>
```

---

### 2. Tabs
```html
<div className="flex gap-1 border-b border-slate-700">
  <!-- Active -->
  <button className="px-4 py-2 text-sm font-medium border-b-2 border-blue-500 text-blue-400 transition-colors">
    워크플로우 (5)
  </button>
  <!-- Inactive -->
  <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors">
    제안 (2)
  </button>
</div>
```

---

### 3. Workflow Card (List View)
```html
<div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:border-slate-600 transition-colors">
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <h3 className="text-base font-semibold text-slate-100">일일 리포트 생성 파이프라인</h3>
      <p className="text-sm text-slate-400 mt-1">매일 아침 8시에 주요 지표를 수집하여 보고서를 작성합니다</p>
      <!-- Meta row -->
      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
        <span className="text-emerald-400 font-medium">활성</span>
        <span>3개 스텝</span>
        <span>2026-03-01</span>
      </div>
      <!-- Mini DAG (step chips with arrows) -->
      <div className="flex items-center gap-1 mt-3 flex-wrap">
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">search_web</span>
        <span className="text-slate-500 text-xs">→</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-medium">summarize</span>
        <span className="text-slate-500 text-xs">→</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">check_result</span>
      </div>
    </div>
    <!-- Action buttons -->
    <div className="flex gap-2 ml-4 flex-col">
      <div className="flex gap-2">
        <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50">실행</button>
        <button className="px-3 py-1.5 text-xs rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors">이력</button>
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1.5 text-xs rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors">편집</button>
        <button className="px-3 py-1.5 text-xs rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">삭제</button>
      </div>
    </div>
  </div>
</div>
```

#### Step Type Colors
| Type | Classes |
|------|---------|
| tool | `bg-blue-500/20 text-blue-400` |
| llm | `bg-purple-500/20 text-purple-400` |
| condition | `bg-amber-500/20 text-amber-400` |

#### Status Badge
- Active: `text-emerald-400 font-medium`
- Inactive: `text-slate-500`

---

### 4. Suggestion Card
```html
<div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
  <p className="text-sm text-slate-300">매일 반복되는 '뉴스 요약 → 보고서 작성' 패턴이 감지되었습니다</p>
  <!-- Suggested steps -->
  <div className="flex items-center gap-1 mt-2 flex-wrap">
    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">news_gather</span>
    <span className="text-slate-500 text-xs">→</span>
    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">summarize</span>
  </div>
  <!-- Actions -->
  <div className="flex gap-2 mt-3">
    <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50">수락</button>
    <button className="px-3 py-1.5 text-xs rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 disabled:opacity-50 transition-colors">거절</button>
  </div>
</div>
```

---

### 5. Workflow Editor

#### Name + Description Form
```html
<div className="space-y-4 p-4 rounded-xl border border-slate-700 bg-slate-800/50">
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1">이름 *</label>
    <input className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-50 outline-none transition-colors" placeholder="예: 일일 리포트 생성 파이프라인" />
  </div>
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1">설명</label>
    <textarea className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-50 outline-none resize-none transition-colors" rows={2} placeholder="워크플로우 설명 (선택)" />
  </div>
</div>
```

#### Canvas/Form Mode Toggle
```html
<div className="flex rounded-lg border border-slate-600 overflow-hidden">
  <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white transition-colors">캔버스</button>
  <button className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors">폼</button>
</div>
```

#### DAG Preview (Form Mode)
```html
<div className="p-4 rounded-xl border border-slate-700 bg-slate-900/50">
  <h3 className="text-sm font-medium text-slate-300 mb-3">DAG 미리보기</h3>
  <div className="space-y-2">
    <!-- Layer 1 -->
    <div className="flex gap-2 justify-center flex-wrap">
      <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
        <span className="opacity-60 mr-1">Tool:</span>search_web
      </div>
    </div>
    <!-- Arrow -->
    <div className="flex justify-center py-1">
      <ArrowDownIcon className="w-4 h-4 text-slate-500" />
    </div>
    <!-- Layer 2 (parallel) -->
    <div className="flex gap-2 justify-center flex-wrap">
      <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
        <span className="opacity-60 mr-1">LLM:</span>summarize
      </div>
      <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
        <span className="opacity-60 mr-1">LLM:</span>analyze
      </div>
      <span className="self-center text-[10px] text-slate-500 ml-1">(병렬)</span>
    </div>
  </div>
  <!-- Cycle detection warning -->
  <p className="text-xs text-amber-400 text-center mt-2">순환 의존성이 감지되었습니다</p>
</div>
```

#### Step Form (Form Mode)
```html
<div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 space-y-3">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-slate-500">#1</span>
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/20 text-blue-400">Tool</span>
    </div>
    <div className="flex items-center gap-1">
      <button className="p-1 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30">▲</button>
      <button className="p-1 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30">▼</button>
      <button className="p-1 text-xs text-red-400 hover:text-red-300 ml-2">✕</button>
    </div>
  </div>
  <!-- 3-col form -->
  <div className="grid grid-cols-3 gap-3">
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">이름 *</label>
      <input className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-slate-50 outline-none focus:border-blue-500 transition-colors" />
    </div>
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">타입</label>
      <select className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-slate-300 outline-none">
        <option value="tool">Tool</option>
        <option value="llm">LLM</option>
        <option value="condition">Condition</option>
      </select>
    </div>
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">액션 *</label>
      <input className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-slate-50 outline-none focus:border-blue-500 transition-colors" placeholder="search_web" />
    </div>
  </div>
  <!-- Condition-specific: True/False branch selectors -->
  <!-- LLM-specific: System prompt textarea -->
  <!-- DependsOn: chip toggle buttons -->
  <div>
    <label className="block text-xs font-medium text-slate-500 mb-1">의존 스텝 (dependsOn)</label>
    <div className="flex flex-wrap gap-2">
      <!-- Selected dependency -->
      <button className="text-xs px-2 py-1 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 transition-colors">search_web</button>
      <!-- Unselected -->
      <button className="text-xs px-2 py-1 rounded-full border border-slate-600 text-slate-500 hover:border-slate-400 transition-colors">analyze</button>
    </div>
  </div>
  <!-- Advanced: timeout + retry -->
  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">타임아웃 (ms)</label>
      <input type="number" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-slate-50 outline-none" placeholder="30000" />
    </div>
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">재시도 횟수</label>
      <input type="number" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-slate-50 outline-none" placeholder="0" />
    </div>
  </div>
</div>
```

#### Save Bar
```html
<div className="flex gap-3 pt-4 border-t border-slate-700">
  <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors disabled:opacity-50">
    {saving ? '저장 중...' : isEditing ? '수정' : '생성'}
  </button>
  <button className="px-6 py-2 text-sm rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors">취소</button>
</div>
```

---

### 6. Execution History

#### Execution Card (Clickable)
```html
<button className="w-full text-left p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:border-slate-600 transition-colors">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">성공</span>
      <span className="text-sm text-slate-300">3개 스텝</span>
      <span className="text-sm text-slate-500">1.2초</span>
    </div>
    <span className="text-xs text-slate-500">2026-03-09 14:32</span>
  </div>
  <!-- Step status mini-bar -->
  <div className="flex gap-1 mt-2">
    <div className="h-2 flex-1 rounded-full bg-emerald-500/60" title="search_web: completed" />
    <div className="h-2 flex-1 rounded-full bg-emerald-500/60" title="summarize: completed" />
    <div className="h-2 flex-1 rounded-full bg-red-500/60" title="check: failed" />
  </div>
</button>
```

#### Execution Detail

Step result cards with colored borders:
```html
<div className="p-4 rounded-xl border bg-slate-800/50 border-emerald-500/30">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-slate-500">#1</span>
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">완료</span>
      <span className="text-sm font-medium text-slate-100">search_web</span>
    </div>
    <span className="text-xs text-slate-500">0.8초</span>
  </div>
  <!-- Error (if failed) -->
  <div className="mt-2 p-2 rounded-lg bg-red-500/10 text-xs text-red-400 font-mono">
    Error: API rate limit exceeded
  </div>
  <!-- Output (if success) -->
  <div className="mt-2 p-2 rounded-lg bg-slate-900/50 text-xs text-slate-400 font-mono max-h-32 overflow-y-auto border border-slate-700">
    {"results": [...]}
  </div>
</div>
```

---

## States

### Loading (List)
```html
<div className="space-y-3">
  {[1,2,3].map(i => (
    <div key={i} className="h-32 bg-slate-800/50 border border-slate-700 rounded-xl animate-pulse" />
  ))}
</div>
```

### Empty — No Workflows
```html
<div className="flex flex-col items-center justify-center py-16 text-center">
  <GitBranchIcon className="w-10 h-10 text-slate-600 mb-4" />
  <h3 className="text-lg font-medium text-slate-300 mb-2">워크플로우가 없습니다</h3>
  <p className="text-sm text-slate-500">새 워크플로우를 만들거나 패턴 분석으로 자동 제안을 받아보세요.</p>
</div>
```

### Empty — No Suggestions
```html
<div className="flex flex-col items-center justify-center py-16 text-center">
  <SparklesIcon className="w-10 h-10 text-slate-600 mb-4" />
  <h3 className="text-lg font-medium text-slate-300 mb-2">제안이 없습니다</h3>
  <p className="text-sm text-slate-500">"패턴 분석" 버튼을 눌러 반복 패턴을 감지해보세요.</p>
</div>
```

### Empty — No Execution History
```html
<div className="flex flex-col items-center justify-center py-16 text-center">
  <PlayCircleIcon className="w-10 h-10 text-slate-600 mb-4" />
  <h3 className="text-lg font-medium text-slate-300 mb-2">실행 이력이 없습니다</h3>
  <p className="text-sm text-slate-500">"지금 실행" 버튼을 눌러 워크플로우를 실행해보세요.</p>
</div>
```

### Company Not Selected
```html
<div className="flex items-center justify-center py-20 text-sm text-slate-500">
  회사를 선택해주세요
</div>
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/workspace/workflows?limit=100` | List workflows |
| POST | `/workspace/workflows` | Create workflow |
| PUT | `/workspace/workflows/:id` | Update workflow |
| DELETE | `/workspace/workflows/:id` | Delete workflow |
| POST | `/workspace/workflows/:id/execute` | Execute workflow |
| GET | `/workspace/workflows/:id/executions?limit=50` | Execution history |
| GET | `/workspace/workflows/suggestions?limit=100` | List suggestions |
| POST | `/workspace/workflows/suggestions/:id/accept` | Accept suggestion |
| POST | `/workspace/workflows/suggestions/:id/reject` | Reject suggestion |
| POST | `/workspace/workflows/analyze` | Analyze patterns |

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| `>= lg` | Full form, side-by-side DAG preview |
| `< lg` | Stacked layout, full-width cards |
| `< sm` | Action buttons stack vertically on cards |

---

## Accessibility
- Workflow cards: `role="article"` with descriptive `aria-label`
- Canvas editor: keyboard-navigable nodes
- Delete confirmation: `confirm()` dialog (consider upgrading to modal)
- Step form: proper `<label>` associations with `htmlFor`
- DAG preview: `aria-label="워크플로우 DAG 미리보기"`
- Execution status bar: each segment has `title` attribute
